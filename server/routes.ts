import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { storage } from "./storage";
import { 
  insertTransactionSchema, insertAiDecisionSchema, insertCrossShardMessageSchema, 
  insertWalletBalanceSchema, insertConsensusRoundSchema,
  aiDecisionSelectSchema, crossShardMessageSelectSchema, walletBalanceSelectSchema, consensusRoundSelectSchema,
  aiDecisionsSnapshotSchema, crossShardMessagesSnapshotSchema, walletBalancesSnapshotSchema, consensusRoundsSnapshotSchema,
  consensusStateSchema
} from "@shared/schema";
import { z } from "zod";
import { getTBurnClient, isProductionMode } from "./tburn-client";

const SITE_PASSWORD = "tburn7979";

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
  max: 100, // 100 requests per window
  message: { error: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith("/auth/"), // Skip auth routes
});

// Authentication middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session.authenticated) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
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
        // Fetch from TBURN mainnet node
        const client = getTBurnClient();
        const stats = await client.getNetworkStats();
        res.json(stats);
      } else {
        // Fetch from local database (demo mode)
        const stats = await storage.getNetworkStats();
        res.json(stats);
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
  // Blocks
  // ============================================
  app.get("/api/blocks", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      if (isProductionMode()) {
        // Fetch from TBURN mainnet node
        const client = getTBurnClient();
        const blocks = await client.getRecentBlocks(limit);
        res.json(blocks);
      } else {
        // Fetch from local database (demo mode)
        const blocks = await storage.getAllBlocks();
        res.json(blocks);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blocks" });
    }
  });

  app.get("/api/blocks/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      if (isProductionMode()) {
        // Fetch from TBURN mainnet node
        const client = getTBurnClient();
        const blocks = await client.getRecentBlocks(limit);
        res.json(blocks);
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

  // ============================================
  // Transactions
  // ============================================
  app.get("/api/transactions", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      if (isProductionMode()) {
        // Fetch from TBURN mainnet node
        const client = getTBurnClient();
        const transactions = await client.getRecentTransactions(limit);
        res.json(transactions);
      } else {
        // Fetch from local database (demo mode)
        const transactions = await storage.getAllTransactions();
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
        // Fetch from TBURN mainnet node
        const client = getTBurnClient();
        const transactions = await client.getRecentTransactions(limit);
        res.json(transactions);
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
      if (isProductionMode()) {
        // Fetch from TBURN mainnet node
        const client = getTBurnClient();
        const validators = await client.getValidators();
        res.json(validators);
      } else {
        // Fetch from local database (demo mode)
        const validators = await storage.getAllValidators();
        res.json(validators);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch validators" });
    }
  });

  app.get("/api/validators/:address", async (req, res) => {
    try {
      const address = req.params.address;
      if (isProductionMode()) {
        // Fetch from TBURN mainnet node
        const client = getTBurnClient();
        const validator = await client.getValidator(address);
        res.json(validator);
      } else {
        // Fetch from local database (demo mode)
        const validator = await storage.getValidatorByAddress(address);
        if (!validator) {
          return res.status(404).json({ error: "Validator not found" });
        }
        res.json(validator);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch validator" });
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
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws',
    verifyClient: (info, callback) => {
      // Basic session check for development environment
      // SECURITY WARNING: This only checks for cookie presence, not validity
      // Production deployment requires proper session verification (see notes above)
      const cookies = info.req.headers.cookie;
      if (!cookies || !cookies.includes('connect.sid')) {
        callback(false, 401, 'Unauthorized - No session');
        return;
      }
      
      // Accept connection if session cookie is present
      // In production, validate the session signature and check session.authenticated
      callback(true);
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
      const stats = await storage.getNetworkStats();
      
      // Simulate real-time TPS changes
      const newTps = Math.floor(stats.tps * (0.95 + Math.random() * 0.1));
      await storage.updateNetworkStats({ tps: newTps });

      const message = JSON.stringify({
        type: 'network_stats_update',
        data: { ...stats, tps: newTps },
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
          type: 'new_block',
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

  // ============================================
  // Production Mode Polling (TBurnClient-based)
  // ============================================
  if (isProductionMode()) {
    const client = getTBurnClient();

    // Poll AI Decisions every 10 seconds
    setInterval(async () => {
      if (clients.size === 0) return;
      try {
        const decisions = await client.getAIDecisions(10);
        broadcastUpdate('ai_decisions_snapshot', decisions, aiDecisionsSnapshotSchema);
        console.log(`[Production Poll] AI Decisions: ${decisions.length} items fetched and broadcast`);
      } catch (error) {
        console.error('Error polling AI decisions from mainnet:', error);
        // Clear diff cache on error to allow recovery broadcasts
        lastBroadcastState.delete('ai_decisions_snapshot');
      }
    }, 10000);

    // Poll Cross-Shard Messages every 5 seconds
    setInterval(async () => {
      if (clients.size === 0) return;
      try {
        const messages = await client.getCrossShardMessages(10);
        broadcastUpdate('cross_shard_snapshot', messages, crossShardMessagesSnapshotSchema);
        console.log(`[Production Poll] Cross-Shard Messages: ${messages.length} items fetched and broadcast`);
      } catch (error) {
        console.error('Error polling cross-shard messages from mainnet:', error);
        // Clear diff cache on error to allow recovery broadcasts
        lastBroadcastState.delete('cross_shard_snapshot');
      }
    }, 5000);

    // Poll Wallet Balances every 10 seconds
    setInterval(async () => {
      if (clients.size === 0) return;
      try {
        const wallets = await client.getWalletBalances(10);
        broadcastUpdate('wallet_balances_snapshot', wallets, walletBalancesSnapshotSchema);
        console.log(`[Production Poll] Wallet Balances: ${wallets.length} items fetched and broadcast`);
      } catch (error) {
        console.error('Error polling wallet balances from mainnet:', error);
        // Clear diff cache on error to allow recovery broadcasts
        lastBroadcastState.delete('wallet_balances_snapshot');
      }
    }, 10000);

    // Poll Consensus Rounds every 2 seconds (high-volatility)
    setInterval(async () => {
      if (clients.size === 0) return;
      try {
        const rounds = await client.getConsensusRounds(5);
        broadcastUpdate('consensus_rounds_snapshot', rounds, consensusRoundsSnapshotSchema);
        console.log(`[Production Poll] Consensus Rounds: ${rounds.length} items fetched and broadcast`);
      } catch (error) {
        console.error('Error polling consensus rounds from mainnet:', error);
        // Clear diff cache on error to allow recovery broadcasts
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
      } catch (error) {
        console.error('Error polling consensus state from mainnet:', error);
        // Clear diff cache on error to allow recovery broadcasts
        lastBroadcastState.delete('consensus_state_update');
      }
    }, 2000);
  }

  return httpServer;
}
