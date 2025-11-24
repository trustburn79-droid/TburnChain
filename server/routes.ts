import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import cookieSignature from "cookie-signature";
import { Pool } from "@neondatabase/serverless";
import { storage } from "./storage";
import { 
  insertTransactionSchema, insertAiDecisionSchema, insertCrossShardMessageSchema, 
  insertWalletBalanceSchema, insertConsensusRoundSchema,
  aiDecisionSelectSchema, crossShardMessageSelectSchema, walletBalanceSelectSchema, consensusRoundSelectSchema,
  aiDecisionsSnapshotSchema, crossShardMessagesSnapshotSchema, walletBalancesSnapshotSchema, consensusRoundsSnapshotSchema,
  consensusStateSchema,
  type InsertMember,
  type NetworkStats
} from "@shared/schema";
import { z } from "zod";
import { getTBurnClient, isProductionMode } from "./tburn-client";
import { ValidatorSimulationService } from "./validator-simulation";
import { aiService, broadcastAIUsageStats } from "./ai-service-manager";

const SITE_PASSWORD = "tburn7979";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

// Rate limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { error: "Too many login attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 2000, // 2000 requests per window (handles intensive polling from Explorer)
  message: { error: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith("/auth/") || req.path.startsWith("/api/admin/"), // Skip auth and admin routes
});

// Authentication middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session.authenticated) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
}

// Admin authentication middleware
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // Check basic authentication first
  if (!req.session.authenticated) {
    console.warn('[Admin] Unauthorized access attempt - not authenticated');
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  // Check admin password from request header
  const adminPassword = req.headers['x-admin-password'] as string;
  
  // Log ADMIN_PASSWORD status (without exposing the actual value)
  if (!ADMIN_PASSWORD) {
    console.error('[Admin] CRITICAL: ADMIN_PASSWORD environment variable not set!');
    return res.status(500).json({ 
      error: "Server Configuration Error",
      message: "Admin password not configured on server"
    });
  }
  
  if (!adminPassword) {
    console.warn('[Admin] Missing admin password in request header');
    return res.status(403).json({ 
      error: "Forbidden",
      message: "Admin password required for this operation"
    });
  }
  
  // Verify admin password
  if (adminPassword !== ADMIN_PASSWORD) {
    console.warn('[Admin] Invalid admin password attempt from session:', req.sessionID);
    return res.status(403).json({ 
      error: "Forbidden",
      message: "Invalid admin password"
    });
  }
  
  console.log('[Admin] ✅ Admin access granted for session:', req.sessionID);
  next();
}

// NOTE: WebSocket authentication limitation
// Current implementation only checks for cookie presence.
// For production deployment, implement proper session verification:
// 1. Parse and verify signed session cookie
// 2. Load session from store (not MemoryStore)
// 3. Validate session.authenticated === true
// 4. Use a persistent session store (Redis, PostgreSQL)
// 5. Set strong SESSION_SECRET environment variable

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize TBURN client if in production mode
  if (isProductionMode()) {
    getTBurnClient();
  }

  // Initialize validator simulation service
  let validatorSimulation: ValidatorSimulationService | null = null;
  
  // Initialize validator simulation and start periodic updates
  async function initializeValidatorSimulation() {
    try {
      // Check if we're in production and need careful initialization
      const isProduction = process.env.NODE_ENV === 'production' || process.env.NODE_MODE === 'production';
      
      // Check existing validators first
      const existingValidators = await storage.getAllValidators();
      console.log(`[ValidatorSim] Found ${existingValidators.length} existing validators`);
      
      validatorSimulation = new ValidatorSimulationService(storage);
      
      // Only initialize validators if none exist
      if (existingValidators.length === 0) {
        console.log("[ValidatorSim] No validators found, initializing 125 enterprise validators...");
        await validatorSimulation.initializeValidators();
        console.log("[ValidatorSim] ✅ Initialized 125 enterprise validators");
      } else {
        console.log("[ValidatorSim] ✅ Using existing validators");
      }
      
      // In production, start with reduced simulation frequency to prevent resource issues
      if (isProduction) {
        console.log("[ValidatorSim] 🎯 Production mode: Running with optimized settings");
      }
      
      // Start the validator simulation (this includes periodic updates)
      await validatorSimulation.start();
      console.log("[ValidatorSim] 🚀 Started validator simulation");
      
      // Broadcast validators updates periodically (every 30 seconds)
      setInterval(async () => {
        try {
          // Get updated validators from storage (simulation updates them internally)
          const validators = await storage.getAllValidators();
          broadcastUpdate('validators', validators, z.array(z.any()));
        } catch (error) {
          console.error("[ValidatorSim] Error broadcasting validators:", error);
        }
      }, 30000);
    } catch (error) {
      console.error("[ValidatorSim] Failed to initialize:", error);
      // In production, ensure we can still serve API requests even if simulation fails
      if (process.env.NODE_ENV === 'production' || process.env.NODE_MODE === 'production') {
        console.error("[ValidatorSim] ⚠️ Production: Continuing without simulation");
      }
    }
  }
  
  // Initialize on startup
  initializeValidatorSimulation();

  // WebSocket clients - initialized early for use in broadcast functions
  const clients = new Set<WebSocket>();

  // Track last broadcast state per channel for differential broadcasting
  const lastBroadcastState = new Map<string, string>();

  // Centralized broadcast helper with schema validation and differential logic
  function broadcastUpdate(type: string, data: any, schema: z.ZodType<any>, skipDiffCheck = false) {
    if (clients.size === 0) return;

    try {
      // Schema validation: validate payload structure before broadcasting
      try {
        schema.parse(data);
      } catch (validationError) {
        console.error(`Schema validation failed for ${type}:`, validationError);
        // Validation failed - abort broadcast to prevent malformed data emission
        return;
      }

      // Basic validation: ensure data is serializable
      const dataHash = JSON.stringify(data);
      
      // Differential logic: only broadcast if data actually changed (unless forced)
      if (!skipDiffCheck) {
        const lastHash = lastBroadcastState.get(type);
        
        if (lastHash === dataHash) {
          // Data unchanged, suppress redundant emission
          return;
        }
      }
      
      // ALWAYS update last broadcast state to prevent infinite loops
      // This applies even when skipDiffCheck=true (mutation broadcasts)
      lastBroadcastState.set(type, dataHash);

      const message = JSON.stringify({
        type,
        data,
        timestamp: Date.now(),
        lastSyncedAt: new Date().toISOString(),
      });

      let successCount = 0;
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          try {
            client.send(message);
            successCount++;
          } catch (error) {
            console.error(`Failed to send ${type} to client:`, error);
          }
        }
      });

      if (successCount > 0) {
        console.log(`Broadcasted ${type} to ${successCount} client(s)`);
      }
    } catch (error) {
      console.error(`Error broadcasting ${type}:`, error);
      // Schema validation failure or serialization error - abort broadcast
    }
  }

  // ============================================
  // Authentication Routes
  // ============================================
  app.post("/api/auth/login", loginLimiter, (req, res) => {
    const { password } = req.body;
    
    if (password === SITE_PASSWORD) {
      req.session.authenticated = true;
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Invalid password" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/check", (req, res) => {
    res.json({ authenticated: !!req.session.authenticated });
  });

  // Apply rate limiting to all API routes
  app.use("/api", apiLimiter);

  // Apply authentication middleware to all other routes
  app.use("/api", (req, res, next) => {
    // Skip auth check for auth routes
    if (req.path.startsWith("/auth/")) {
      return next();
    }
    requireAuth(req, res, next);
  });
  // ============================================
  // Network Stats
  // ============================================
  app.get("/api/network/stats", async (_req, res) => {
    try {
      if (isProductionMode()) {
        try {
          // Try to fetch from TBURN mainnet node
          const client = getTBurnClient();
          const stats = await client.getNetworkStats();
          res.json(stats);
        } catch (mainnetError: any) {
          // NO FALLBACK - Return error state when mainnet API fails
          console.log(`[API] Mainnet API error (${mainnetError.statusCode || 'unknown'}) for /api/network/stats - NO FALLBACK TO SIMULATION`);
          
          // Determine the error type based on the status code
          let errorType = "api-error";
          if (mainnetError.statusCode === 429) {
            errorType = "api-rate-limit";
          } else if (mainnetError.statusCode >= 500) {
            errorType = "mainnet-offline";
          } else if (mainnetError.message && mainnetError.message.includes("ECONNREFUSED")) {
            errorType = "network-error";
          }
          
          // Return empty/error state stats with error information
          const errorStats: any = {
            id: "singleton",
            currentBlockHeight: 0,
            tps: 0,
            peakTps: 0,
            avgBlockTime: 0,
            blockTimeP99: 0,
            slaUptime: 0,
            latency: 0,
            latencyP99: 0,
            activeValidators: 0,
            totalValidators: 0,
            totalTransactions: 0,
            totalAccounts: 0,
            marketCap: "0",
            circulatingSupply: "0",
            successRate: 0,
            updatedAt: new Date(),
            // TBURN v7.0: Predictive Self-Healing System
            trendAnalysisScore: 0,
            anomalyDetectionScore: 0,
            patternMatchingScore: 0,
            timeseriesScore: 0,
            healingEventsCount: 0,
            anomaliesDetected: 0,
            predictedFailureRisk: 0,
            selfHealingStatus: "offline",
            // Include error information for client
            _errorType: errorType,
            _errorCode: mainnetError.statusCode || 0,
          };
          res.json(errorStats);
        }
      } else {
        // Fetch from local database (demo mode)
        const stats = await storage.getNetworkStats();
        
        // If no stats available (e.g., in production with empty database), return default values
        if (!stats) {
          const defaultStats: NetworkStats = {
            id: "singleton",
            currentBlockHeight: 0,
            tps: 0,
            peakTps: 0,
            avgBlockTime: 100, // Default to optimal 100ms
            blockTimeP99: 125,
            slaUptime: 9990, // 99.90% in basis points
            latency: 12,
            latencyP99: 45,
            activeValidators: 0,
            totalValidators: 0,
            totalTransactions: 0,
            totalAccounts: 0,
            marketCap: "0",
            circulatingSupply: "0",
            successRate: 9970, // 99.70% in basis points
            updatedAt: new Date(),
            // TBURN v7.0: Predictive Self-Healing System
            trendAnalysisScore: 8500, // 85.00% in basis points
            anomalyDetectionScore: 9200, // 92.00% in basis points
            patternMatchingScore: 8800, // 88.00% in basis points
            timeseriesScore: 9000, // 90.00% in basis points
            healingEventsCount: 0,
            anomaliesDetected: 0,
            predictedFailureRisk: 500, // 5% in basis points
            selfHealingStatus: "healthy",
          };
          console.log("[API] No network stats available, returning defaults");
          res.json(defaultStats);
        } else {
          res.json(stats);
        }
      }
    } catch (error) {
      console.error("Error fetching network stats:", error);
      res.status(500).json({ error: "Failed to fetch network stats" });
    }
  });

  app.get("/api/network/latency-distribution", async (_req, res) => {
    try {
      const distribution = await storage.getLatencyDistribution();
      res.json(distribution);
    } catch (error) {
      console.error("Error fetching latency distribution:", error);
      res.status(500).json({ error: "Failed to fetch latency distribution" });
    }
  });

  app.get("/api/network/tps-history", async (req, res) => {
    try {
      const minutes = req.query.minutes ? parseInt(req.query.minutes as string) : 60;
      const history = await storage.getTPSHistory(minutes);
      res.json(history);
    } catch (error) {
      console.error("Error fetching TPS history:", error);
      res.status(500).json({ error: "Failed to fetch TPS history" });
    }
  });

  app.get("/api/consensus/current", async (_req, res) => {
    try {
      const state = await storage.getConsensusState();
      res.json(state);
    } catch (error) {
      console.error("Error fetching consensus state:", error);
      res.status(500).json({ error: "Failed to fetch consensus state" });
    }
  });

  // ============================================
  // Blocks - Enterprise Grade API
  // ============================================
  app.get("/api/blocks", async (req, res) => {
    try {
      // Parse query parameters
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const offset = (page - 1) * limit;
      
      // Parse filters
      const validatorAddress = req.query.validator as string | undefined;
      const shardId = req.query.shard ? parseInt(req.query.shard as string) : undefined;
      const hashAlgorithm = req.query.hashAlgorithm as string | undefined;
      const startTime = req.query.startTime ? parseInt(req.query.startTime as string) : undefined;
      const endTime = req.query.endTime ? parseInt(req.query.endTime as string) : undefined;
      const sortBy = (req.query.sortBy as string) || 'number';
      const sortOrder = (req.query.sortOrder as string) || 'desc';
      
      console.log(`[API] /api/blocks request - page: ${page}, limit: ${limit}, production: ${isProductionMode()}`);
      
      if (isProductionMode()) {
        try {
          // Try to fetch from TBURN mainnet
          const client = getTBurnClient();
          const blocks = await client.getRecentBlocks(limit);
          
          // Check if we got valid data
          if (blocks && blocks.length > 0) {
            const totalBlocks = 1000000; // Estimated total blocks for production
            
            res.json({
              blocks,
              pagination: {
                page,
                limit,
                totalPages: Math.ceil(totalBlocks / limit),
                totalItems: totalBlocks,
                hasNext: page * limit < totalBlocks,
                hasPrev: page > 1
              }
            });
          } else {
            // No data from mainnet, fall back to simulated
            throw new Error('No blocks returned from mainnet');
          }
        } catch (mainnetError: any) {
          // NO FALLBACK - Return error when mainnet API fails
          console.log(`[API] Mainnet API error (${mainnetError.statusCode || 'no data'}) for /api/blocks - NO FALLBACK TO SIMULATION`);
          
          // Return empty result with error indication
          res.json({
            blocks: [],
            pagination: {
              page,
              limit,
              totalPages: 0,
              totalItems: 0,
              hasNext: false,
              hasPrev: false
            },
            error: "Mainnet API temporarily unavailable",
            isLive: false
          });
        }
      } else {
        // Demo mode - Use local storage with filtering
        const allBlocks = await storage.getAllBlocks();
        
        // Apply filters
        let filteredBlocks = allBlocks;
        
        if (validatorAddress) {
          filteredBlocks = filteredBlocks.filter(b => b.validatorAddress === validatorAddress);
        }
        
        if (shardId !== undefined) {
          filteredBlocks = filteredBlocks.filter(b => b.shardId === shardId);
        }
        
        if (hashAlgorithm) {
          filteredBlocks = filteredBlocks.filter(b => b.hashAlgorithm === hashAlgorithm);
        }
        
        if (startTime) {
          filteredBlocks = filteredBlocks.filter(b => b.timestamp >= startTime);
        }
        
        if (endTime) {
          filteredBlocks = filteredBlocks.filter(b => b.timestamp <= endTime);
        }
        
        // Sort blocks
        filteredBlocks.sort((a, b) => {
          let comparison = 0;
          switch (sortBy) {
            case 'number':
              comparison = a.blockNumber - b.blockNumber;
              break;
            case 'timestamp':
              comparison = a.timestamp - b.timestamp;
              break;
            case 'transactionCount':
              comparison = a.transactionCount - b.transactionCount;
              break;
            case 'size':
              comparison = a.size - b.size;
              break;
            default:
              comparison = a.blockNumber - b.blockNumber;
          }
          return sortOrder === 'desc' ? -comparison : comparison;
        });
        
        // Paginate
        const paginatedBlocks = filteredBlocks.slice(offset, offset + limit);
        
        // Get validator names for display
        const validators = await storage.getAllValidators();
        const validatorMap = new Map(validators.map(v => [v.address, v.name]));
        
        // Enrich blocks with validator names
        const enrichedBlocks = paginatedBlocks.map(block => ({
          ...block,
          validatorName: validatorMap.get(block.validatorAddress) || 'Unknown'
        }));
        
        res.json({
          blocks: enrichedBlocks,
          pagination: {
            page,
            limit,
            totalPages: Math.ceil(filteredBlocks.length / limit),
            totalItems: filteredBlocks.length,
            hasNext: page * limit < filteredBlocks.length,
            hasPrev: page > 1
          },
          filters: {
            validator: validatorAddress,
            shard: shardId,
            hashAlgorithm,
            startTime,
            endTime
          }
        });
      }
    } catch (error) {
      console.error("Error fetching blocks:", error);
      res.status(500).json({ error: "Failed to fetch blocks" });
    }
  });

  app.get("/api/blocks/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      if (isProductionMode()) {
        try {
          // Try to fetch from TBURN mainnet node
          const client = getTBurnClient();
          const blocks = await client.getRecentBlocks(limit);
          res.json(blocks);
        } catch (mainnetError: any) {
          // NO FALLBACK - Return error when mainnet API fails
          console.log(`[API] Mainnet API error (${mainnetError.statusCode || 'unknown'}) - NO FALLBACK TO SIMULATION`);
          
          // Determine the error type based on the status code
          let errorType = "api-error";
          if (mainnetError.statusCode === 429) {
            errorType = "api-rate-limit";
          } else if (mainnetError.statusCode >= 500) {
            errorType = "mainnet-offline";
          } else if (mainnetError.message && mainnetError.message.includes("ECONNREFUSED")) {
            errorType = "network-error";
          }
          
          // Return empty array with error metadata in response headers
          res.setHeader('X-Error-Type', errorType);
          res.setHeader('X-Error-Code', mainnetError.statusCode || '0');
          res.json([]); // Return empty array instead of simulated data
        }
      } else {
        // Fetch from local database (demo mode)
        const blocks = await storage.getRecentBlocks(limit);
        res.json(blocks);
      }
    } catch (error) {
      console.error("Error fetching recent blocks:", error);
      res.status(500).json({ error: "Failed to fetch recent blocks" });
    }
  });

  app.get("/api/blocks/:blockNumber", async (req, res) => {
    try {
      const blockNumber = parseInt(req.params.blockNumber);
      const block = await storage.getBlockByNumber(blockNumber);
      if (!block) {
        return res.status(404).json({ error: "Block not found" });
      }
      res.json(block);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch block" });
    }
  });

  app.get("/api/blocks/:blockNumber/transactions", async (req, res) => {
    try {
      const blockNumber = parseInt(req.params.blockNumber);
      const block = await storage.getBlockByNumber(blockNumber);
      if (!block) {
        return res.status(404).json({ error: "Block not found" });
      }
      // Get all transactions for this block
      const allTransactions = await storage.getAllTransactions();
      const blockTransactions = allTransactions.filter(tx => tx.blockNumber === blockNumber);
      res.json(blockTransactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch block transactions" });
    }
  });

  // Block Search API
  app.get("/api/blocks/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      
      const allBlocks = await storage.getAllBlocks();
      const validators = await storage.getAllValidators();
      const validatorMap = new Map(validators.map(v => [v.address, v.name]));
      
      // Search by block number, hash, or validator
      const results = allBlocks.filter(block => {
        const validatorName = validatorMap.get(block.validatorAddress) || '';
        return (
          block.blockNumber.toString().includes(query) ||
          block.hash.toLowerCase().includes(query.toLowerCase()) ||
          block.validatorAddress.toLowerCase().includes(query.toLowerCase()) ||
          validatorName.toLowerCase().includes(query.toLowerCase())
        );
      }).slice(0, 20); // Limit to 20 results
      
      // Enrich with validator names
      const enrichedResults = results.map(block => ({
        ...block,
        validatorName: validatorMap.get(block.validatorAddress) || 'Unknown'
      }));
      
      res.json(enrichedResults);
    } catch (error) {
      console.error("Error searching blocks:", error);
      res.status(500).json({ error: "Failed to search blocks" });
    }
  });

  // ============================================
  // Transactions
  // ============================================
  app.get("/api/transactions", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      if (isProductionMode()) {
        try {
          // Try to fetch from TBURN mainnet node
          const client = getTBurnClient();
          const transactions = await client.getRecentTransactions(limit);
          
          // Check if we got valid data
          if (transactions && transactions.length > 0) {
            res.json(transactions);
          } else {
            // No data from mainnet, fall back to simulated
            throw new Error('No transactions returned from mainnet');
          }
        } catch (mainnetError: any) {
          // NO FALLBACK - Return error when mainnet API fails
          console.log(`[API] Mainnet API error (${mainnetError.statusCode || 'no data'}) for /api/transactions - NO FALLBACK TO SIMULATION`);
          res.json([]); // Return empty array instead of simulated data
        }
      } else {
        // Fetch from local database (demo mode)
        // PERFORMANCE FIX: Use getRecentTransactions with limit for demo mode too
        const transactions = await storage.getRecentTransactions(limit);
        res.json(transactions);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.get("/api/transactions/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      if (isProductionMode()) {
        try {
          // Try to fetch from TBURN mainnet node
          const client = getTBurnClient();
          const transactions = await client.getRecentTransactions(limit);
          res.json(transactions);
        } catch (mainnetError: any) {
          // NO FALLBACK - Return error when mainnet API fails
          console.log(`[API] Mainnet API error (${mainnetError.statusCode || 'unknown'}) for /api/transactions/recent - NO FALLBACK TO SIMULATION`);
          res.json([]); // Return empty array instead of simulated data
        }
      } else {
        // Fetch from local database (demo mode)
        const transactions = await storage.getRecentTransactions(limit);
        res.json(transactions);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent transactions" });
    }
  });

  app.get("/api/transactions/:hash", async (req, res) => {
    try {
      const hash = req.params.hash;
      if (isProductionMode()) {
        // Fetch from TBURN mainnet node
        const client = getTBurnClient();
        const transaction = await client.getTransaction(hash);
        res.json(transaction);
      } else {
        // Fetch from local database (demo mode)
        const transaction = await storage.getTransactionByHash(hash);
        if (!transaction) {
          return res.status(404).json({ error: "Transaction not found" });
        }
        res.json(transaction);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transaction" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      // Validate request body with Zod schema
      const validationResult = insertTransactionSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validationResult.error.errors 
        });
      }
      
      const transaction = await storage.createTransaction(validationResult.data);
      res.status(201).json(transaction);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: "Failed to create transaction", details: errorMessage });
    }
  });

  // ============================================
  // Accounts
  // ============================================
  app.get("/api/accounts/:address", async (req, res) => {
    try {
      const address = req.params.address;
      const account = await storage.getAccountByAddress(address);
      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }
      res.json(account);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch account" });
    }
  });

  // ============================================
  // Validators
  // ============================================
  app.get("/api/validators", async (_req, res) => {
    try {
      // Always use local database validators (we have simulation generating them)
      const validators = await storage.getAllValidators();
      res.json(validators);
    } catch (error) {
      console.error("Error fetching validators:", error);
      res.status(500).json({ error: "Failed to fetch validators" });
    }
  });

  app.get("/api/validators/:address", async (req, res) => {
    try {
      const address = req.params.address;
      // Use the getValidatorDetails method to get extended validator info
      const validatorDetails = await storage.getValidatorDetails(address);
      res.json(validatorDetails);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(error instanceof Error && error.message.includes("not found") ? 404 : 500)
        .json({ error: "Failed to fetch validator", details: errorMessage });
    }
  });

  // Validator activation/deactivation
  app.post("/api/validators/:address/activate", async (req, res) => {
    try {
      const address = req.params.address;
      await storage.activateValidator(address);
      res.json({ success: true, message: "Validator activated" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: "Failed to activate validator", details: errorMessage });
    }
  });

  app.post("/api/validators/:address/deactivate", async (req, res) => {
    try {
      const address = req.params.address;
      await storage.deactivateValidator(address);
      res.json({ success: true, message: "Validator deactivated" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: "Failed to deactivate validator", details: errorMessage });
    }
  });

  // Delegation
  app.post("/api/validators/:address/delegate", async (req, res) => {
    try {
      const address = req.params.address;
      const { amount } = req.body;
      
      if (!amount || isNaN(parseFloat(amount))) {
        return res.status(400).json({ error: "Invalid delegation amount" });
      }

      // Mock delegator address (in production, this would come from auth context)
      const delegatorAddress = `0x${Math.random().toString(16).slice(2, 42)}`;
      
      await storage.delegateToValidator(address, amount, delegatorAddress);
      res.json({ success: true, message: `Delegated ${amount} TBURN to validator` });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: "Failed to delegate", details: errorMessage });
    }
  });

  app.post("/api/validators/:address/undelegate", async (req, res) => {
    try {
      const address = req.params.address;
      const { amount } = req.body;
      
      if (!amount || isNaN(parseFloat(amount))) {
        return res.status(400).json({ error: "Invalid undelegation amount" });
      }

      // Mock delegator address (in production, this would come from auth context)
      const delegatorAddress = `0x${Math.random().toString(16).slice(2, 42)}`;
      
      await storage.undelegateFromValidator(address, amount, delegatorAddress);
      res.json({ success: true, message: `Undelegated ${amount} TBURN from validator` });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: "Failed to undelegate", details: errorMessage });
    }
  });

  // Claim rewards
  app.post("/api/validators/:address/claim-rewards", async (req, res) => {
    try {
      const address = req.params.address;
      const reward = await storage.claimRewards(address);
      res.json({ success: true, amount: reward.amount, message: "Rewards claimed successfully" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: "Failed to claim rewards", details: errorMessage });
    }
  });

  // Update commission
  app.post("/api/validators/:address/commission", async (req, res) => {
    try {
      const address = req.params.address;
      const { commission } = req.body;
      
      if (commission === undefined || commission < 0 || commission > 2000) {
        return res.status(400).json({ error: "Invalid commission rate (must be 0-2000 basis points)" });
      }

      await storage.updateValidatorCommission(address, commission);
      res.json({ success: true, message: "Commission updated" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: "Failed to update commission", details: errorMessage });
    }
  });

  // ============================================
  // Member Management System API Endpoints
  // ============================================
  
  // Get all members
  app.get("/api/members", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const members = await storage.getAllMembers(limit);
      res.json(members);
    } catch (error) {
      console.error("Error fetching members:", error);
      res.status(500).json({ error: "Failed to fetch members" });
    }
  });
  
  // Get member by ID
  app.get("/api/members/:id", async (req, res) => {
    try {
      const member = await storage.getMemberById(req.params.id);
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }
      
      // Get associated profiles
      const [profile, governance, financial, security, performance, stakingPositions, slashEvents] = await Promise.all([
        storage.getMemberProfileByMemberId(member.id),
        storage.getMemberGovernanceProfile(member.id),
        storage.getMemberFinancialProfile(member.id),
        storage.getMemberSecurityProfile(member.id),
        storage.getMemberPerformanceMetrics(member.id),
        storage.getMemberStakingPositions(member.id),
        storage.getMemberSlashEvents(member.id),
      ]);
      
      res.json({
        ...member,
        profile,
        governance,
        financial,
        security,
        performance,
        stakingPositions,
        slashEvents,
      });
    } catch (error) {
      console.error("Error fetching member:", error);
      res.status(500).json({ error: "Failed to fetch member" });
    }
  });
  
  // Get member by address
  app.get("/api/members/address/:address", async (req, res) => {
    try {
      const member = await storage.getMemberByAddress(req.params.address);
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }
      
      // Get associated profiles
      const [profile, governance, financial, security, performance] = await Promise.all([
        storage.getMemberProfileByMemberId(member.id),
        storage.getMemberGovernanceProfile(member.id),
        storage.getMemberFinancialProfile(member.id),
        storage.getMemberSecurityProfile(member.id),
        storage.getMemberPerformanceMetrics(member.id),
      ]);
      
      res.json({
        ...member,
        profile,
        governance,
        financial,
        security,
        performance,
      });
    } catch (error) {
      console.error("Error fetching member by address:", error);
      res.status(500).json({ error: "Failed to fetch member" });
    }
  });
  
  // Create new member
  app.post("/api/members", async (req, res) => {
    try {
      const member = await storage.createMember(req.body);
      
      // Create associated profiles
      await Promise.all([
        storage.createMemberProfile({ memberId: member.id, ...req.body.profile }),
        storage.createMemberGovernanceProfile({ memberId: member.id }),
        storage.createMemberFinancialProfile({ memberId: member.id }),
        storage.createMemberSecurityProfile({ memberId: member.id }),
      ]);
      
      res.status(201).json(member);
    } catch (error) {
      console.error("Error creating member:", error);
      res.status(500).json({ error: "Failed to create member" });
    }
  });
  
  // Update member
  app.patch("/api/members/:id", async (req, res) => {
    try {
      await storage.updateMember(req.params.id, req.body);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating member:", error);
      res.status(500).json({ error: "Failed to update member" });
    }
  });
  
  // Update member tier
  app.post("/api/members/:id/tier", async (req, res) => {
    try {
      const { tier } = req.body;
      await storage.updateMember(req.params.id, { memberTier: tier });
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating member tier:", error);
      res.status(500).json({ error: "Failed to update member tier" });
    }
  });
  
  // Update member status
  app.post("/api/members/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      await storage.updateMember(req.params.id, { memberStatus: status });
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating member status:", error);
      res.status(500).json({ error: "Failed to update member status" });
    }
  });
  
  // Get member staking positions
  app.get("/api/members/:id/staking", async (req, res) => {
    try {
      const positions = await storage.getMemberStakingPositions(req.params.id);
      res.json(positions);
    } catch (error) {
      console.error("Error fetching staking positions:", error);
      res.status(500).json({ error: "Failed to fetch staking positions" });
    }
  });
  
  // Create staking position
  app.post("/api/members/:id/staking", async (req, res) => {
    try {
      const position = await storage.createMemberStakingPosition({
        memberId: req.params.id,
        ...req.body,
      });
      res.status(201).json(position);
    } catch (error) {
      console.error("Error creating staking position:", error);
      res.status(500).json({ error: "Failed to create staking position" });
    }
  });
  
  // Get member audit logs
  app.get("/api/members/:id/audit-logs", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await storage.getMemberAuditLogs(req.params.id, limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ error: "Failed to fetch audit logs" });
    }
  });
  
  // Create audit log
  app.post("/api/members/:id/audit-logs", async (req, res) => {
    try {
      const log = await storage.createMemberAuditLog({
        memberId: req.params.id,
        ...req.body,
      });
      res.status(201).json(log);
    } catch (error) {
      console.error("Error creating audit log:", error);
      res.status(500).json({ error: "Failed to create audit log" });
    }
  });
  
  // Get member statistics
  app.get("/api/members/stats/summary", async (_req, res) => {
    try {
      const stats = await storage.getMemberStatistics();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching member statistics:", error);
      res.status(500).json({ error: "Failed to fetch member statistics" });
    }
  });

  // Sync validators to members
  app.post("/api/members/sync-validators", async (req, res) => {
    try {
      // Get all validators
      const allValidators = await storage.getAllValidators();
      let syncedCount = 0;
      let skippedCount = 0;
      
      for (const validator of allValidators) {
        // Check if member already exists for this validator
        const existingMember = await storage.getMemberByAddress(validator.address);
        
        if (!existingMember) {
          // Create member for validator
          const memberData: InsertMember = {
            accountAddress: validator.address,
            publicKey: validator.address, // Use address as public key for now
            displayName: validator.name,
            entityType: "corporation", // Validators are typically enterprise entities
            memberTier: validator.stake === "0" ? "candidate_validator" : "active_validator",
            memberStatus: validator.status === "active" ? "active" : "inactive",
            kycLevel: "institutional", // Validators typically have institutional KYC
            sanctionsCheckPassed: true, // Assume validators are verified
            validatorId: validator.id,
          };
          
          const member = await storage.createMember(memberData);
          
          // Create associated profiles
          await Promise.all([
            storage.createMemberProfile({ 
              memberId: member.id,
              bio: `Enterprise validator running ${validator.name} node`,
              preferredLanguage: "en",
              preferredCurrency: "USD",
              timezone: "UTC",
            }),
            storage.createMemberGovernanceProfile({ 
              memberId: member.id,
              votingPower: validator.votingPower,
            }),
            storage.createMemberFinancialProfile({ 
              memberId: member.id,
              stakedBalance: validator.stake,
              validatorRewards: validator.rewardEarned,
            }),
            storage.createMemberSecurityProfile({ 
              memberId: member.id,
            }),
          ]);
          
          syncedCount++;
        } else {
          // Update existing member's validator info
          await storage.updateMember(existingMember.id, {
            memberTier: validator.stake === "0" ? "candidate_validator" : "active_validator",
            memberStatus: validator.status === "active" ? "active" : "inactive",
            lastActivityAt: validator.lastActiveAt || new Date(),
          });
          skippedCount++;
        }
      }
      
      res.json({ 
        success: true, 
        message: `Synced ${syncedCount} validators to members, updated ${skippedCount} existing members`,
        syncedCount,
        skippedCount,
        totalValidators: allValidators.length
      });
    } catch (error) {
      console.error("Error syncing validators to members:", error);
      res.status(500).json({ error: "Failed to sync validators to members" });
    }
  });

  // ============================================
  // Smart Contracts
  // ============================================
  app.get("/api/contracts", async (_req, res) => {
    try {
      if (isProductionMode()) {
        // Fetch from TBURN mainnet node
        const client = getTBurnClient();
        const contracts = await client.getContracts();
        res.json(contracts);
      } else {
        // Fetch from local database (demo mode)
        const contracts = await storage.getAllContracts();
        res.json(contracts);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contracts" });
    }
  });

  app.get("/api/contracts/:address", async (req, res) => {
    try {
      const address = req.params.address;
      if (isProductionMode()) {
        // Fetch from TBURN mainnet node
        const client = getTBurnClient();
        const contract = await client.getContract(address);
        res.json(contract);
      } else {
        // Fetch from local database (demo mode)
        const contract = await storage.getContractByAddress(address);
        if (!contract) {
          return res.status(404).json({ error: "Contract not found" });
        }
        res.json(contract);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contract" });
    }
  });

  // ============================================
  // AI Models
  // ============================================
  app.get("/api/ai/models", async (_req, res) => {
    try {
      if (isProductionMode()) {
        // Fetch from TBURN mainnet node
        const client = getTBurnClient();
        const models = await client.getAIModels();
        res.json(models);
      } else {
        // Fetch from local database (demo mode)
        const models = await storage.getAllAiModels();
        res.json(models);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch AI models" });
    }
  });

  app.get("/api/ai/models/:name", async (req, res) => {
    try {
      const name = req.params.name;
      if (isProductionMode()) {
        // Fetch from TBURN mainnet node
        const client = getTBurnClient();
        const model = await client.getAIModel(name);
        res.json(model);
      } else {
        // Fetch from local database (demo mode)
        const model = await storage.getAiModelByName(name);
        if (!model) {
          return res.status(404).json({ error: "AI model not found" });
        }
        res.json(model);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch AI model" });
    }
  });

  // ============================================
  // AI Decisions (Triple-Band AI System)
  // ============================================
  app.get("/api/ai/decisions", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      if (isProductionMode()) {
        // Fetch from TBURN mainnet node
        const client = getTBurnClient();
        const decisions = await client.getAIDecisions(limit);
        res.json(decisions);
      } else {
        // Fetch from local database (demo mode)
        const decisions = await storage.getAllAiDecisions(limit);
        res.json(decisions);
      }
    } catch (error: unknown) {
      res.status(500).json({ error: "Failed to fetch AI decisions" });
    }
  });

  app.get("/api/ai/decisions/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      if (isProductionMode()) {
        // Fetch from TBURN mainnet node
        const client = getTBurnClient();
        const decisions = await client.getRecentAIDecisions(limit);
        res.json(decisions);
      } else {
        // Fetch from local database (demo mode)
        const decisions = await storage.getRecentAiDecisions(limit);
        res.json(decisions);
      }
    } catch (error: unknown) {
      res.status(500).json({ error: "Failed to fetch recent AI decisions" });
    }
  });

  app.get("/api/ai/decisions/:id", async (req, res) => {
    try {
      const id = req.params.id;
      if (isProductionMode()) {
        // Fetch from TBURN mainnet node
        const client = getTBurnClient();
        const decision = await client.getAIDecision(id);
        res.json(decision);
      } else {
        // Fetch from local database (demo mode)
        const decision = await storage.getAiDecisionById(id);
        if (!decision) {
          return res.status(404).json({ error: "AI decision not found" });
        }
        res.json(decision);
      }
    } catch (error: unknown) {
      res.status(500).json({ error: "Failed to fetch AI decision" });
    }
  });

  app.post("/api/ai/decisions", async (req, res) => {
    try {
      if (isProductionMode()) {
        // In production mode, AI decisions are generated by the TBURN mainnet
        // automatically by the Triple-Band AI system. Manual creation is not supported.
        return res.status(501).json({
          error: "Not Implemented",
          message: "AI decisions are automatically generated by the TBURN mainnet. Manual creation is only available in demo mode."
        });
      }
      
      // Demo mode only - create AI decision locally
      const validated = insertAiDecisionSchema.parse(req.body);
      const decision = await storage.createAiDecision(validated);
      
      // Broadcast the new AI decision to WebSocket clients
      broadcastUpdate('ai_decision_update', decision, aiDecisionSelectSchema, true);
      
      res.status(201).json(decision);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create AI decision" });
    }
  });

  // ============================================
  // Shards
  // ============================================
  app.get("/api/shards", async (_req, res) => {
    try {
      if (isProductionMode()) {
        // Fetch from TBURN mainnet node
        const client = getTBurnClient();
        const shards = await client.getShards();
        res.json(shards);
      } else {
        // Fetch from local database (demo mode)
        const shards = await storage.getAllShards();
        res.json(shards);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch shards" });
    }
  });

  app.get("/api/shards/:id", async (req, res) => {
    try {
      const shardId = parseInt(req.params.id);
      if (isProductionMode()) {
        // Fetch from TBURN mainnet node
        const client = getTBurnClient();
        const shard = await client.getShard(shardId);
        res.json(shard);
      } else {
        // Fetch from local database (demo mode)
        const shard = await storage.getShardById(shardId);
        if (!shard) {
          return res.status(404).json({ error: "Shard not found" });
        }
        res.json(shard);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch shard" });
    }
  });

  // ============================================
  // Cross-Shard Messages (Two-Phase Commit)
  // ============================================
  app.get("/api/cross-shard/messages", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      if (isProductionMode()) {
        // Fetch from TBURN mainnet node
        const client = getTBurnClient();
        const messages = await client.getCrossShardMessages(limit);
        res.json(messages);
      } else {
        // Fetch from local database (demo mode)
        const messages = await storage.getAllCrossShardMessages(limit);
        res.json(messages);
      }
    } catch (error: unknown) {
      res.status(500).json({ error: "Failed to fetch cross-shard messages" });
    }
  });

  app.get("/api/cross-shard/messages/:id", async (req, res) => {
    try {
      const id = req.params.id;
      if (isProductionMode()) {
        // Fetch from TBURN mainnet node
        const client = getTBurnClient();
        const message = await client.getCrossShardMessage(id);
        res.json(message);
      } else {
        // Fetch from local database (demo mode)
        const message = await storage.getCrossShardMessageById(id);
        if (!message) {
          return res.status(404).json({ error: "Cross-shard message not found" });
        }
        res.json(message);
      }
    } catch (error: any) {
      // Propagate 404 from TBURN client if message not found
      // TBurnClient attaches statusCode to error object for reliable error handling
      if (error.statusCode === 404) {
        return res.status(404).json({ error: "Cross-shard message not found" });
      }
      res.status(500).json({ error: "Failed to fetch cross-shard message" });
    }
  });

  app.post("/api/cross-shard/messages", async (req, res) => {
    try {
      if (isProductionMode()) {
        // In production mode, cross-shard messages are generated by TBURN mainnet
        // automatically during cross-shard transactions. Manual creation is not supported.
        return res.status(501).json({
          error: "Not Implemented",
          message: "Cross-shard messages are automatically generated by TBURN mainnet during cross-shard transactions. Manual creation is only available in demo mode."
        });
      }
      
      // Demo mode only - create cross-shard message locally
      const validated = insertCrossShardMessageSchema.parse(req.body);
      const message = await storage.createCrossShardMessage(validated);
      
      // Broadcast the new cross-shard message to WebSocket clients
      broadcastUpdate('cross_shard_update', message, crossShardMessageSelectSchema, true);
      
      res.status(201).json(message);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create cross-shard message" });
    }
  });

  app.patch("/api/cross-shard/messages/:id", async (req, res) => {
    try {
      if (isProductionMode()) {
        // In production mode, cross-shard message updates are managed by TBURN mainnet
        return res.status(501).json({
          error: "Not Implemented",
          message: "Cross-shard message updates are managed by TBURN mainnet. Manual updates are only available in demo mode."
        });
      }

      // Demo mode only - update cross-shard message locally
      const id = req.params.id;
      const existing = await storage.getCrossShardMessageById(id);
      if (!existing) {
        return res.status(404).json({ error: "Cross-shard message not found" });
      }
      
      await storage.updateCrossShardMessage(id, req.body);
      const updated = await storage.getCrossShardMessageById(id);
      
      // Broadcast the updated cross-shard message to WebSocket clients
      broadcastUpdate('cross_shard_update', updated, crossShardMessageSelectSchema, true);
      
      res.json(updated);
    } catch (error: unknown) {
      res.status(500).json({ error: "Failed to update cross-shard message" });
    }
  });

  // ============================================
  // Admin Control Panel
  // ============================================
  // Endpoint to get mainnet restart status
  app.get("/api/admin/restart-status", async (req, res) => {
    try {
      // Get restart session from database
      const restartSession = await storage.getRestartSession();
      
      if (!restartSession) {
        // No restart in progress
        return res.json({
          isRestarting: false,
          restartInitiatedAt: null,
          expectedRestartTime: 60000,
          lastHealthCheck: null,
          isHealthy: true,
          elapsedTime: 0
        });
      }
      
      const elapsedTime = restartSession.restartInitiatedAt 
        ? Date.now() - new Date(restartSession.restartInitiatedAt).getTime()
        : 0;
      
      // Auto-check health after expected restart time
      if (restartSession.isRestarting && elapsedTime > restartSession.expectedRestartTime) {
        try {
          // Check if mainnet is back by checking recent blocks
          const recentBlocks = await storage.getRecentBlocks(1);
          if (recentBlocks && recentBlocks.length > 0) {
            const timeSinceLastBlock = Date.now() / 1000 - recentBlocks[0].timestamp;
            
            if (timeSinceLastBlock < 60) { // If block is less than 60 seconds old
              // Mainnet is back online - update session
              await storage.createOrUpdateRestartSession({
                ...restartSession,
                isRestarting: false,
                isHealthy: true,
                lastHealthCheck: new Date()
              });
              console.log("[API] Mainnet restart completed successfully");
              
              // Clear the session after a successful restart
              setTimeout(async () => {
                await storage.clearRestartSession();
              }, 5000); // Clear after 5 seconds
            }
          }
        } catch (error) {
          // Still not healthy, continue waiting
          console.log("[API] Mainnet still restarting...");
        }
      }
      
      // Return the current state
      const currentSession = await storage.getRestartSession();
      res.json({
        isRestarting: currentSession?.isRestarting || false,
        restartInitiatedAt: currentSession?.restartInitiatedAt || null,
        expectedRestartTime: currentSession?.expectedRestartTime || 60000,
        lastHealthCheck: currentSession?.lastHealthCheck || null,
        isHealthy: currentSession?.isHealthy || !currentSession?.isRestarting,
        elapsedTime: currentSession?.restartInitiatedAt 
          ? Date.now() - new Date(currentSession.restartInitiatedAt).getTime()
          : 0
      });
    } catch (error) {
      console.error("[API] Failed to get restart status:", error);
      res.status(500).json({ error: "Failed to get restart status" });
    }
  });

  app.post("/api/admin/restart-mainnet", requireAdmin, async (req, res) => {
    try {
      console.log('═══════════════════════════════════════════');
      console.log('[Admin] 🔄 MAINNET RESTART REQUESTED');
      console.log('[Admin] Session ID:', req.sessionID);
      console.log('[Admin] Timestamp:', new Date().toISOString());
      console.log('[Admin] ADMIN_PASSWORD verified successfully');
      console.log('═══════════════════════════════════════════');
      
      // Create or update restart session in database with phase tracking
      await storage.createOrUpdateRestartSession({
        isRestarting: true,
        restartInitiatedAt: new Date(),
        expectedRestartTime: 60000,
        lastHealthCheck: null,
        isHealthy: false,
        phase: "initiating",
        phaseStartTime: new Date(),
        phaseMessage: "Preparing to restart TBURN mainnet...",
        progressPercentage: 10,
        initiatingTime: new Date(),
        sessionId: req.sessionID
      });
      
      // Store restart status for tracking
      const restartInfo = {
        initiatedAt: Date.now(),
        sessionId: req.sessionID,
        status: "restart_initiated"
      };
      
      // Log restart info for debugging
      console.log('[Admin] Restart Info:', JSON.stringify(restartInfo, null, 2));
      console.log('[Admin] Restart session saved to database');
      
      // Send immediate success response before shutdown
      res.json({
        success: true,
        message: "Mainnet restart initiated successfully. Server will restart in 2 seconds.",
        timestamp: restartInfo.initiatedAt,
        status: restartInfo.status,
        estimatedRecoveryTime: 60 // seconds
      });
      
      // Force flush response
      res.end();
      
      // Broadcast to WebSocket clients about upcoming restart
      console.log('[Admin] Broadcasting restart notification to WebSocket clients...');
      
      // Broadcast restart phase update via WebSocket
      const restartPhaseSchema = z.object({
        phase: z.string(),
        message: z.string(),
        progress: z.number(),
        timestamp: z.number()
      });
      
      broadcastUpdate('restart_phase_update', {
        phase: 'initiating',
        message: 'Preparing to restart TBURN mainnet...',
        progress: 10,
        timestamp: Date.now()
      }, restartPhaseSchema, true);
      
      // Schedule phase transitions and actual restart
      setTimeout(async () => {
        // Update phase to shutting_down
        await storage.createOrUpdateRestartSession({
          isRestarting: true,
          phase: "shutting_down",
          phaseStartTime: new Date(),
          phaseMessage: "Shutting down current instance...",
          progressPercentage: 30,
          shuttingDownTime: new Date()
        });
        
        broadcastUpdate('restart_phase_update', {
          phase: 'shutting_down',
          message: 'Shutting down current instance...',
          progress: 30,
          timestamp: Date.now()
        }, restartPhaseSchema, true);
        
        console.log('═══════════════════════════════════════════');
        console.log('[Admin] 🚀 EXECUTING SERVER RESTART SEQUENCE');
        console.log('[Admin] Step 1: Closing database connections...');
        console.log('[Admin] Step 2: Stopping WebSocket server...');
        console.log('[Admin] Step 3: Calling process.exit(0)...');
        console.log('[Admin] Expected: Replit auto-restart in 5-10 seconds');
        console.log('═══════════════════════════════════════════');
        
        // Exit with code 0 for clean shutdown
        // Replit will detect this and automatically restart the service
        process.exit(0);
      }, 2000); // 2 second delay to ensure response is sent
      
    } catch (error: any) {
      console.error('═══════════════════════════════════════════');
      console.error('[Admin] ❌ RESTART FAILED:', error);
      console.error('[Admin] Error details:', error.stack);
      console.error('═══════════════════════════════════════════');
      
      // Only send error if response hasn't been sent
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: error.message || "Failed to restart mainnet",
          error: error.toString(),
          timestamp: Date.now()
        });
      }
    }
  });

  app.post("/api/admin/check-health", requireAdmin, async (req, res) => {
    try {
      console.log('[Admin] 🏥 Health check requested');
      
      const stats = await storage.getNetworkStats();
      const recentBlocks = await storage.getRecentBlocks(5);
      
      if (!recentBlocks || recentBlocks.length === 0) {
        console.warn('[Admin] ⚠️ Health check: No blocks found');
        return res.json({
          healthy: false,
          details: { error: "No blocks found", status: 'paused' }
        });
      }
      
      const timeSinceLastBlock = Date.now() / 1000 - recentBlocks[0].timestamp;
      const isHealthy = timeSinceLastBlock < 3600;
      
      // Update restart state if healthy
      const restartSession = await storage.getRestartSession();
      if (isHealthy && restartSession?.isRestarting) {
        await storage.createOrUpdateRestartSession({
          ...restartSession,
          isRestarting: false,
          isHealthy: true,
          lastHealthCheck: new Date()
        });
        console.log("[Admin] Mainnet recovery detected via health check");
        
        // Clear the session after a successful restart
        setTimeout(async () => {
          await storage.clearRestartSession();
        }, 5000); // Clear after 5 seconds
      }
      
      const healthStatus = {
        healthy: isHealthy,
        details: {
          lastBlockNumber: stats.currentBlockHeight,
          lastBlockTime: recentBlocks[0].timestamp,
          timeSinceLastBlock,
          tps: stats.tps,
          peakTps: stats.peakTps,
          status: isHealthy ? 'active' : 'paused',
          blockCount: recentBlocks.length
        }
      };
      
      console.log('[Admin] ✅ Health check complete:', {
        healthy: isHealthy,
        status: healthStatus.details.status,
        timeSinceLastBlock: Math.floor(timeSinceLastBlock),
        tps: stats.tps
      });
      
      res.json(healthStatus);
    } catch (error: any) {
      console.error('[Admin] ❌ Health check failed:', error);
      res.status(500).json({
        healthy: false,
        details: { error: error.message }
      });
    }
  });
  
  // ============================================
  // AI Usage Management Routes
  // ============================================
  app.get("/api/admin/ai/usage", requireAdmin, async (req, res) => {
    try {
      console.log('[Admin] 📊 AI usage stats requested');
      const stats = aiService.getAllUsageStats();
      const health = aiService.checkHealth();
      
      res.json({
        providers: stats,
        health,
        timestamp: Date.now()
      });
    } catch (error: any) {
      console.error('[Admin] ❌ Failed to get AI usage:', error);
      res.status(500).json({
        error: "Failed to retrieve AI usage statistics"
      });
    }
  });
  
  app.get("/api/admin/ai/health", requireAdmin, async (req, res) => {
    try {
      console.log('[Admin] 🤖 AI service health check');
      const health = aiService.checkHealth();
      
      res.json({
        ...health,
        timestamp: Date.now()
      });
    } catch (error: any) {
      console.error('[Admin] ❌ AI health check failed:', error);
      res.status(500).json({
        error: "AI service health check failed"
      });
    }
  });
  
  app.post("/api/admin/ai/reset-provider", requireAdmin, async (req, res) => {
    try {
      const { provider } = req.body;
      
      if (!provider || !['anthropic', 'openai', 'meta'].includes(provider)) {
        return res.status(400).json({
          error: "Invalid provider. Must be one of: anthropic, openai, meta"
        });
      }
      
      console.log(`[Admin] 🔄 Resetting AI provider: ${provider}`);
      aiService.resetProvider(provider);
      
      res.json({
        success: true,
        message: `AI provider ${provider} has been reset`,
        timestamp: Date.now()
      });
    } catch (error: any) {
      console.error('[Admin] ❌ Failed to reset AI provider:', error);
      res.status(500).json({
        error: "Failed to reset AI provider"
      });
    }
  });
  
  app.post("/api/admin/ai/test", requireAdmin, async (req, res) => {
    try {
      const { prompt = "Hello, this is a test. Please respond with OK." } = req.body;
      
      console.log('[Admin] 🧪 Testing AI service with prompt:', prompt);
      const response = await aiService.makeRequest({
        prompt,
        maxTokens: 100
      });
      
      res.json({
        success: true,
        response,
        timestamp: Date.now()
      });
    } catch (error: any) {
      console.error('[Admin] ❌ AI test failed:', error);
      res.status(500).json({
        error: "AI test failed",
        message: error.message
      });
    }
  });

  // ============================================
  // Node Health
  // ============================================
  app.get("/api/node/health", async (_req, res) => {
    try {
      const health = {
        status: "healthy" as const,
        uptime: Math.floor(Math.random() * 86400 * 30) + 86400 * 7, // 7-37 days
        cpuUsage: Math.floor(Math.random() * 40) + 20, // 20-60%
        memoryUsage: Math.floor(Math.random() * 30) + 40, // 40-70%
        diskUsage: Math.floor(Math.random() * 20) + 50, // 50-70%
        networkLatency: Math.floor(Math.random() * 30) + 10, // 10-40ms
        rpcConnections: Math.floor(Math.random() * 50) + 100,
        wsConnections: Math.floor(Math.random() * 30) + 50,
        peersConnected: Math.floor(Math.random() * 20) + 80,
        syncStatus: "Synced",
        lastBlockTime: Math.floor(Math.random() * 3) + 1,
      };
      res.json(health);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch node health" });
    }
  });

  // ============================================
  // API Keys (Secure Management)
  // ============================================
  // Get all active API keys (excluding revoked ones)
  app.get("/api/keys", async (_req, res) => {
    try {
      const keys = await storage.getAllApiKeys();
      // Never return the hashed key to the client
      const sanitized = keys.map(({ hashedKey, ...key }) => key);
      res.json(sanitized);
    } catch (error) {
      console.error("Error fetching API keys:", error);
      res.status(500).json({ error: "Failed to fetch API keys" });
    }
  });

  // Create a new API key
  app.post("/api/keys", async (req, res) => {
    try {
      const { label } = req.body;
      
      if (!label || typeof label !== "string" || label.trim().length === 0) {
        return res.status(400).json({ error: "Label is required" });
      }

      // Generate a random API key (32 bytes = 64 hex characters)
      const rawKey = randomBytes(32).toString("hex");
      
      // Hash the API key using bcrypt
      const hashedKey = await bcrypt.hash(rawKey, 10);

      // Store in database
      const apiKey = await storage.createApiKey({
        label: label.trim(),
        hashedKey,
        userId: null, // Future: link to user account
      });

      // Return the raw key ONLY ONCE (client must save it)
      res.json({
        id: apiKey.id,
        label: apiKey.label,
        key: rawKey, // IMPORTANT: This is the only time we return the raw key
        createdAt: apiKey.createdAt,
      });
    } catch (error) {
      console.error("Error creating API key:", error);
      res.status(500).json({ error: "Failed to create API key" });
    }
  });

  // Revoke (delete) an API key
  app.delete("/api/keys/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const existing = await storage.getApiKeyById(id);
      if (!existing) {
        return res.status(404).json({ error: "API key not found" });
      }

      if (existing.revokedAt) {
        return res.status(400).json({ error: "API key already revoked" });
      }

      await storage.revokeApiKey(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error revoking API key:", error);
      res.status(500).json({ error: "Failed to revoke API key" });
    }
  });

  // ============================================
  // Wallet Balances
  // ============================================
  app.get("/api/wallets", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      if (isProductionMode()) {
        // Fetch from TBURN mainnet node
        const client = getTBurnClient();
        const wallets = await client.getWalletBalances(limit);
        res.json(wallets);
      } else {
        // Fetch from local database (demo mode)
        const wallets = await storage.getAllWalletBalances(limit);
        res.json(wallets);
      }
    } catch (error: unknown) {
      res.status(500).json({ error: "Failed to fetch wallet balances" });
    }
  });

  app.get("/api/wallets/:address", async (req, res) => {
    try {
      const address = req.params.address;
      if (isProductionMode()) {
        // Fetch from TBURN mainnet node
        const client = getTBurnClient();
        const wallet = await client.getWalletBalance(address);
        res.json(wallet);
      } else {
        // Fetch from local database (demo mode)
        const wallet = await storage.getWalletBalanceByAddress(address);
        if (!wallet) {
          return res.status(404).json({ error: "Wallet not found" });
        }
        res.json(wallet);
      }
    } catch (error: any) {
      // Propagate 404 from TBURN client if wallet not found
      // TBurnClient attaches statusCode to error object for reliable error handling
      if (error.statusCode === 404) {
        return res.status(404).json({ error: "Wallet not found" });
      }
      res.status(500).json({ error: "Failed to fetch wallet balance" });
    }
  });

  app.post("/api/wallets", async (req, res) => {
    try {
      if (isProductionMode()) {
        // In production mode, wallet balances are managed by TBURN mainnet
        return res.status(501).json({
          error: "Not Implemented",
          message: "Wallet balances are managed by TBURN mainnet. Manual creation is only available in demo mode."
        });
      }
      
      // Demo mode only - create wallet balance locally
      const validated = insertWalletBalanceSchema.parse(req.body);
      const wallet = await storage.createWalletBalance(validated);
      
      // Broadcast the new wallet balance to WebSocket clients
      broadcastUpdate('wallet_balance_update', wallet, walletBalanceSelectSchema, true);
      
      res.status(201).json(wallet);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create wallet balance" });
    }
  });

  app.patch("/api/wallets/:address", async (req, res) => {
    try {
      if (isProductionMode()) {
        // In production mode, wallet balance updates are managed by TBURN mainnet
        return res.status(501).json({
          error: "Not Implemented",
          message: "Wallet balance updates are managed by TBURN mainnet. Manual updates are only available in demo mode."
        });
      }

      // Demo mode only - update wallet balance locally
      const address = req.params.address;
      const existing = await storage.getWalletBalanceByAddress(address);
      if (!existing) {
        return res.status(404).json({ error: "Wallet not found" });
      }
      
      await storage.updateWalletBalance(address, req.body);
      const updated = await storage.getWalletBalanceByAddress(address);
      
      // Broadcast the updated wallet balance to WebSocket clients
      broadcastUpdate('wallet_balance_update', updated, walletBalanceSelectSchema, true);
      
      res.json(updated);
    } catch (error: unknown) {
      res.status(500).json({ error: "Failed to update wallet balance" });
    }
  });

  // ============================================
  // Consensus Rounds
  // ============================================
  app.get("/api/consensus/rounds", async (req, res) => {
    try {
      const limitParam = req.query.limit as string | undefined;
      let limit = limitParam ? parseInt(limitParam) : 100;
      
      // Validate limit is a valid number
      if (isNaN(limit) || limit < 1) {
        return res.status(400).json({ error: "Invalid limit parameter" });
      }
      
      // Clamp limit to maximum 500 to prevent high-load queries
      limit = Math.min(limit, 500);
      
      if (isProductionMode()) {
        // Fetch from TBURN mainnet node
        const client = getTBurnClient();
        const rounds = await client.getConsensusRounds(limit);
        res.json(rounds);
      } else {
        // Fetch from local database (demo mode)
        const rounds = await storage.getAllConsensusRounds(limit);
        res.json(rounds);
      }
    } catch (error: unknown) {
      res.status(500).json({ error: "Failed to fetch consensus rounds" });
    }
  });

  app.get("/api/consensus/rounds/:blockHeight", async (req, res) => {
    try {
      const blockHeight = parseInt(req.params.blockHeight);
      
      // Validate blockHeight is a valid number
      if (isNaN(blockHeight)) {
        return res.status(400).json({ error: "Invalid block height parameter" });
      }
      
      if (isProductionMode()) {
        // Fetch from TBURN mainnet node
        const client = getTBurnClient();
        const round = await client.getConsensusRound(blockHeight);
        res.json(round);
      } else {
        // Fetch from local database (demo mode)
        const round = await storage.getConsensusRoundByBlockHeight(blockHeight);
        if (!round) {
          return res.status(404).json({ error: "Consensus round not found" });
        }
        res.json(round);
      }
    } catch (error: any) {
      // Propagate 404 from TBURN client if round not found
      // TBurnClient attaches statusCode to error object for reliable error handling
      if (error.statusCode === 404) {
        return res.status(404).json({ error: "Consensus round not found" });
      }
      res.status(500).json({ error: "Failed to fetch consensus round" });
    }
  });

  app.post("/api/consensus/rounds", async (req, res) => {
    try {
      if (isProductionMode()) {
        // In production mode, consensus rounds are generated automatically by TBURN mainnet
        return res.status(501).json({
          error: "Not Implemented",
          message: "Consensus rounds are generated automatically by TBURN mainnet. Manual creation is only available in demo mode."
        });
      }
      
      // Demo mode only - create consensus round locally
      const validated = insertConsensusRoundSchema.parse(req.body);
      const round = await storage.createConsensusRound(validated);
      
      // Broadcast the new consensus round to WebSocket clients
      broadcastUpdate('consensus_round_update', round, consensusRoundSelectSchema, true);
      
      res.status(201).json(round);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create consensus round" });
    }
  });

  app.patch("/api/consensus/rounds/:blockHeight", async (req, res) => {
    try {
      if (isProductionMode()) {
        // In production mode, consensus round updates are managed by TBURN mainnet
        return res.status(501).json({
          error: "Not Implemented",
          message: "Consensus round updates are managed by TBURN mainnet. Manual updates are only available in demo mode."
        });
      }

      // Demo mode only - update consensus round locally
      const blockHeight = parseInt(req.params.blockHeight);
      
      // Validate blockHeight is a valid number
      if (isNaN(blockHeight)) {
        return res.status(400).json({ error: "Invalid block height parameter" });
      }
      
      const existing = await storage.getConsensusRoundByBlockHeight(blockHeight);
      if (!existing) {
        return res.status(404).json({ error: "Consensus round not found" });
      }
      
      // Validate update payload with partial schema
      const partialSchema = insertConsensusRoundSchema.partial();
      const validated = partialSchema.parse(req.body);
      
      await storage.updateConsensusRound(blockHeight, validated);
      const updated = await storage.getConsensusRoundByBlockHeight(blockHeight);
      
      // Broadcast the updated consensus round to WebSocket clients
      broadcastUpdate('consensus_round_update', updated, consensusRoundSelectSchema, true);
      
      res.json(updated);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update consensus round" });
    }
  });

  // ============================================
  // WebSocket Server
  // ============================================
  const httpServer = createServer(app);
  
  // Create session pool for WebSocket session verification
  const sessionPool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws',
    verifyClient: (info, callback) => {
      // Enhanced session verification with signature validation and session store check
      (async () => {
        try {
          const cookies = info.req.headers.cookie;
          if (!cookies || !cookies.includes('connect.sid')) {
            callback(false, 401, 'Unauthorized - No session');
            return;
          }
          
          // Parse connect.sid cookie
          const sidCookie = cookies.split(';').find(c => c.trim().startsWith('connect.sid='));
          if (!sidCookie) {
            callback(false, 401, 'Unauthorized - Invalid session cookie');
            return;
          }
          
          const rawValue = sidCookie.split('=')[1].trim();
          const sessionId = decodeURIComponent(rawValue);
          
          // Session ID format: 's:SESSION_ID.SIGNATURE'
          if (!sessionId.startsWith('s:')) {
            callback(false, 401, 'Unauthorized - Invalid session format');
            return;
          }
          
          // Verify signature using SESSION_SECRET
          const secret = process.env.SESSION_SECRET || 'tburn-secret-key-change-in-production';
          const unsigned = cookieSignature.unsign(sessionId.slice(2), secret);
          
          if (unsigned === false) {
            console.warn('[WebSocket] Invalid session signature detected');
            callback(false, 401, 'Unauthorized - Invalid session signature');
            return;
          }
          
          // Load session from PostgreSQL session store
          const result = await sessionPool.query(
            'SELECT sess FROM session WHERE sid = $1',
            [unsigned]
          );
          
          if (!result.rows.length) {
            console.warn('[WebSocket] Session not found in store:', unsigned.slice(0, 8) + '...');
            callback(false, 401, 'Unauthorized - Session not found');
            return;
          }
          
          const session = result.rows[0].sess;
          if (!session || !session.authenticated) {
            console.warn('[WebSocket] Session not authenticated');
            callback(false, 401, 'Unauthorized - Not authenticated');
            return;
          }
          
          // Session is valid and authenticated
          console.log('[WebSocket] Session verified successfully');
          callback(true);
        } catch (error) {
          console.error('[WebSocket] Session verification error:', error);
          callback(false, 500, 'Internal server error');
        }
      })();
    }
  });

  wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');
    clients.add(ws);

    // Send initial network stats
    storage.getNetworkStats().then(stats => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'network_stats',
          data: stats,
        }));
      }
    });
    
    // Send initial AI usage stats
    const aiUsage = aiService.getAllUsageStats();
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'ai_usage_stats',
        data: aiUsage,
        timestamp: Date.now()
      }));
    }

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);

        // Handle different message types
        if (data.type === 'subscribe') {
          // Subscribe to specific updates
          ws.send(JSON.stringify({
            type: 'subscribed',
            channel: data.channel,
          }));
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });

  // Broadcast updates to all connected clients every 5 seconds
  setInterval(async () => {
    if (clients.size === 0) return;

    try {
      let stats = await storage.getNetworkStats();
      
      if (isProductionMode()) {
        // Production Mode: Fetch real-time stats from TBURN mainnet
        try {
          const client = getTBurnClient();
          const mainnetStats = await client.getNetworkStats();
          
          // Use mainnet TPS directly (no recalculation needed)
          await storage.updateNetworkStats({
            tps: mainnetStats.tps,
            currentBlockHeight: mainnetStats.currentBlockHeight,
            totalTransactions: mainnetStats.totalTransactions,
            peakTps: Math.max(stats.peakTps, mainnetStats.tps),
          });
          
          // Refresh stats from storage after update
          stats = await storage.getNetworkStats();
          console.log(`[Production TPS] Mainnet TPS: ${mainnetStats.tps.toLocaleString()}`);
        } catch (error) {
          console.error('Error fetching mainnet stats:', error);
          // Fallback: use cached database stats
        }
      } else {
        // Demo Mode: Simulate TPS variations
        let newTps = stats.tps;
        if (stats.tps > 0) {
          newTps = Math.floor(stats.tps * (0.95 + Math.random() * 0.1));
        } else {
          // Initialize with reasonable demo TPS if 0
          newTps = Math.floor(55000 + Math.random() * 10000); // 55K-65K
        }
        await storage.updateNetworkStats({ tps: newTps });
        stats = { ...stats, tps: newTps };
      }

      const message = JSON.stringify({
        type: 'network_stats_update',
        data: stats,
        timestamp: Date.now(),
      });

      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    } catch (error) {
      console.error('Error broadcasting updates:', error);
    }
  }, 5000);

  // Broadcast new blocks every 2 seconds
  setInterval(async () => {
    if (clients.size === 0) return;

    try {
      const blocks = await storage.getRecentBlocks(1);
      if (blocks.length > 0) {
        const message = JSON.stringify({
          type: 'block_created',
          data: blocks[0],
          timestamp: Date.now(),
        });

        clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
      }
    } catch (error) {
      console.error('Error broadcasting block updates:', error);
    }
  }, 2000);

  // Broadcast periodic snapshots for domain-specific data
  // AI Decisions snapshot every 15 seconds (aggregated list)
  setInterval(async () => {
    if (clients.size === 0) return;
    try {
      const decisions = await storage.getRecentAiDecisions(10);
      broadcastUpdate('ai_decisions_snapshot', decisions, aiDecisionsSnapshotSchema);
    } catch (error) {
      console.error('Error broadcasting AI decisions snapshot:', error);
    }
  }, 15000);

  // Cross-Shard Messages snapshot every 15 seconds (aggregated list)
  setInterval(async () => {
    if (clients.size === 0) return;
    try {
      const messages = await storage.getAllCrossShardMessages(10);
      broadcastUpdate('cross_shard_snapshot', messages, crossShardMessagesSnapshotSchema);
    } catch (error) {
      console.error('Error broadcasting cross-shard snapshot:', error);
    }
  }, 15000);

  // Wallet Balances snapshot every 15 seconds (aggregated list)
  setInterval(async () => {
    if (clients.size === 0) return;
    try {
      const wallets = await storage.getAllWalletBalances(10);
      broadcastUpdate('wallet_balances_snapshot', wallets, walletBalancesSnapshotSchema);
    } catch (error) {
      console.error('Error broadcasting wallet balances snapshot:', error);
    }
  }, 15000);

  // Consensus Rounds snapshot every 3 seconds (high-volatility metrics)
  setInterval(async () => {
    if (clients.size === 0) return;
    try {
      const rounds = await storage.getAllConsensusRounds(5);
      broadcastUpdate('consensus_rounds_snapshot', rounds, consensusRoundsSnapshotSchema);
    } catch (error) {
      console.error('Error broadcasting consensus rounds snapshot:', error);
    }
  }, 3000);

  // Consensus State snapshot every 2 seconds (current consensus view)
  setInterval(async () => {
    if (clients.size === 0) return;
    try {
      const state = await storage.getConsensusState();
      broadcastUpdate('consensus_state_update', state, consensusStateSchema);
    } catch (error) {
      console.error('Error broadcasting consensus state update:', error);
    }
  }, 2000);

  // Validator Updates snapshot every 5 seconds (voting power changes, status updates)
  setInterval(async () => {
    if (clients.size === 0) return;
    try {
      const validators = await storage.getAllValidators();
      // Get top validators by voting power
      const topValidators = validators
        .sort((a, b) => {
          const aVotingPower = BigInt(a.stake) + BigInt(a.delegatedStake || 0);
          const bVotingPower = BigInt(b.stake) + BigInt(b.delegatedStake || 0);
          return Number(bVotingPower - aVotingPower);
        })
        .slice(0, 21); // Top 21 committee validators
      
      broadcastUpdate('validators_update', {
        validators: topValidators,
        totalValidators: validators.length,
        activeCount: validators.filter(v => v.status === 'active').length,
        committeeSize: 21,
      }, z.object({
        validators: z.array(z.any()),
        totalValidators: z.number(),
        activeCount: z.number(),
        committeeSize: z.number(),
      }));
    } catch (error) {
      console.error('Error broadcasting validator updates:', error);
    }
  }, 5000);
  
  // AI Usage Stats broadcasting every 10 seconds
  setInterval(() => {
    if (clients.size === 0) return;
    
    const aiUsageSchema = z.array(z.object({
      provider: z.enum(["anthropic", "openai", "meta"]),
      totalRequests: z.number(),
      successfulRequests: z.number(),
      failedRequests: z.number(),
      rateLimitHits: z.number(),
      totalTokensUsed: z.number(),
      totalCost: z.number(),
      isRateLimited: z.boolean(),
      dailyLimit: z.number().optional(),
      dailyUsage: z.number().optional(),
      lastRequestTime: z.date().optional(),
      lastRateLimitTime: z.date().optional(),
      rateLimitResetTime: z.date().optional()
    }));
    
    try {
      const stats = aiService.getAllUsageStats();
      broadcastUpdate('ai_usage_stats', stats, aiUsageSchema);
    } catch (error) {
      console.error('Error broadcasting AI usage stats:', error);
    }
  }, 10000);
  
  // Setup AI Service event broadcasting
  broadcastAIUsageStats((type, data) => {
    // Create appropriate schema based on type
    let schema: z.ZodType<any> = z.any();
    
    if (type === 'ai-usage') {
      schema = z.array(z.object({
        provider: z.enum(["anthropic", "openai", "meta"]),
        totalRequests: z.number(),
        successfulRequests: z.number(),
        failedRequests: z.number(),
        rateLimitHits: z.number(),
        totalTokensUsed: z.number(),
        totalCost: z.number(),
        isRateLimited: z.boolean()
      }));
    } else if (type === 'ai-rate-limit') {
      schema = z.object({
        provider: z.string(),
        resetTime: z.date()
      });
    } else if (type === 'ai-provider-switch') {
      schema = z.object({
        from: z.string(),
        to: z.string()
      });
    }
    
    broadcastUpdate(type, data, schema, true);
  });
  
  // Validator Voting Activity snapshot every 3 seconds  
  setInterval(async () => {
    if (clients.size === 0) return;
    try {
      // Get recent consensus rounds to show voting activity
      const recentRounds = await storage.getAllConsensusRounds(5);
      const votingActivity = recentRounds.map(round => ({
        blockHeight: round.blockHeight,
        proposer: round.proposerAddress,
        prevotes: round.prevoteCount,
        precommits: round.precommitCount,
        totalValidators: round.totalValidators,
        quorumReached: round.precommitCount >= round.requiredQuorum,
        status: round.status,
      }));
      
      broadcastUpdate('voting_activity', votingActivity, z.array(z.object({
        blockHeight: z.number(),
        proposer: z.string(),
        prevotes: z.number(),
        precommits: z.number(),
        totalValidators: z.number(),
        quorumReached: z.boolean(),
        status: z.string(),
      })));
    } catch (error) {
      console.error('Error broadcasting voting activity:', error);
    }
  }, 3000);

  // ============================================
  // Production Mode Polling (TBurnClient-based)
  // ============================================
  if (isProductionMode()) {
    const client = getTBurnClient();
    
    // Enterprise-grade fallback tracking: prevent log spam for unimplemented endpoints
    const endpointFallbackStatus = new Map<string, { disabled: boolean; warned: boolean }>();

    // Poll AI Decisions every 10 seconds
    setInterval(async () => {
      if (clients.size === 0 || endpointFallbackStatus.get('ai_decisions')?.disabled) return;
      try {
        const decisions = await client.getAIDecisions(10);
        broadcastUpdate('ai_decisions_snapshot', decisions, aiDecisionsSnapshotSchema);
        console.log(`[Production Poll] AI Decisions: ${decisions.length} items fetched and broadcast`);
      } catch (error: any) {
        const status = endpointFallbackStatus.get('ai_decisions') || { disabled: false, warned: false };
        
        if (error.isHtmlResponse) {
          if (!status.warned) {
            console.warn('[Production Poll] AI Decisions endpoint not implemented on mainnet - using local fallback data');
            endpointFallbackStatus.set('ai_decisions', { disabled: true, warned: true });
          }
          // Fallback to local storage (empty or demo data)
          const localDecisions = await storage.getAllAiDecisions(10);
          broadcastUpdate('ai_decisions_snapshot', localDecisions, aiDecisionsSnapshotSchema);
        } else {
          console.error('Error polling AI decisions from mainnet:', error.message);
        }
        lastBroadcastState.delete('ai_decisions_snapshot');
      }
    }, 10000);

    // Poll Cross-Shard Messages every 5 seconds
    setInterval(async () => {
      if (clients.size === 0 || endpointFallbackStatus.get('cross_shard')?.disabled) return;
      try {
        const messages = await client.getCrossShardMessages(10);
        broadcastUpdate('cross_shard_snapshot', messages, crossShardMessagesSnapshotSchema);
        console.log(`[Production Poll] Cross-Shard Messages: ${messages.length} items fetched and broadcast`);
      } catch (error: any) {
        const status = endpointFallbackStatus.get('cross_shard') || { disabled: false, warned: false };
        
        if (error.isHtmlResponse) {
          if (!status.warned) {
            console.warn('[Production Poll] Cross-Shard Messages endpoint not implemented on mainnet - using local fallback data');
            endpointFallbackStatus.set('cross_shard', { disabled: true, warned: true });
          }
          const localMessages = await storage.getAllCrossShardMessages(10);
          broadcastUpdate('cross_shard_snapshot', localMessages, crossShardMessagesSnapshotSchema);
        } else {
          console.error('Error polling cross-shard messages from mainnet:', error.message);
        }
        lastBroadcastState.delete('cross_shard_snapshot');
      }
    }, 5000);

    // Poll Wallet Balances every 10 seconds
    setInterval(async () => {
      if (clients.size === 0 || endpointFallbackStatus.get('wallets')?.disabled) return;
      try {
        const wallets = await client.getWalletBalances(10);
        broadcastUpdate('wallet_balances_snapshot', wallets, walletBalancesSnapshotSchema);
        console.log(`[Production Poll] Wallet Balances: ${wallets.length} items fetched and broadcast`);
      } catch (error: any) {
        const status = endpointFallbackStatus.get('wallets') || { disabled: false, warned: false };
        
        if (error.isHtmlResponse) {
          if (!status.warned) {
            console.warn('[Production Poll] Wallet Balances endpoint not implemented on mainnet - using local fallback data');
            endpointFallbackStatus.set('wallets', { disabled: true, warned: true });
          }
          const localWallets = await storage.getAllWalletBalances(10);
          broadcastUpdate('wallet_balances_snapshot', localWallets, walletBalancesSnapshotSchema);
        } else {
          console.error('Error polling wallet balances from mainnet:', error.message);
        }
        lastBroadcastState.delete('wallet_balances_snapshot');
      }
    }, 10000);

    // Poll Consensus Rounds every 2 seconds (high-volatility)
    setInterval(async () => {
      if (clients.size === 0 || endpointFallbackStatus.get('consensus_rounds')?.disabled) return;
      try {
        const rounds = await client.getConsensusRounds(5);
        broadcastUpdate('consensus_rounds_snapshot', rounds, consensusRoundsSnapshotSchema);
        console.log(`[Production Poll] Consensus Rounds: ${rounds.length} items fetched and broadcast`);
      } catch (error: any) {
        const status = endpointFallbackStatus.get('consensus_rounds') || { disabled: false, warned: false };
        
        if (error.isHtmlResponse) {
          if (!status.warned) {
            console.warn('[Production Poll] Consensus Rounds endpoint not implemented on mainnet - using local fallback data');
            endpointFallbackStatus.set('consensus_rounds', { disabled: true, warned: true });
          }
          const localRounds = await storage.getAllConsensusRounds(5);
          broadcastUpdate('consensus_rounds_snapshot', localRounds, consensusRoundsSnapshotSchema);
        } else {
          console.error('Error polling consensus rounds from mainnet:', error.message);
        }
        lastBroadcastState.delete('consensus_rounds_snapshot');
      }
    }, 2000);

    // Poll Consensus State every 2 seconds (current consensus view)
    setInterval(async () => {
      if (clients.size === 0) return;
      try {
        const state = await client.getConsensusState();
        broadcastUpdate('consensus_state_update', state, consensusStateSchema);
        console.log('[Production Poll] Consensus State: fetched and broadcast');
      } catch (error: any) {
        console.error('Error polling consensus state from mainnet:', error.message);
        lastBroadcastState.delete('consensus_state_update');
      }
    }, 2000);
  }

  return httpServer;
}
