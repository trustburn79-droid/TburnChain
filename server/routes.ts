import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertTransactionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // ============================================
  // Network Stats
  // ============================================
  app.get("/api/network/stats", async (_req, res) => {
    try {
      const stats = await storage.getNetworkStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch network stats" });
    }
  });

  // ============================================
  // Blocks
  // ============================================
  app.get("/api/blocks", async (_req, res) => {
    try {
      const blocks = await storage.getAllBlocks();
      res.json(blocks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blocks" });
    }
  });

  app.get("/api/blocks/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const blocks = await storage.getRecentBlocks(limit);
      res.json(blocks);
    } catch (error) {
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
  app.get("/api/transactions", async (_req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.get("/api/transactions/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const transactions = await storage.getRecentTransactions(limit);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent transactions" });
    }
  });

  app.get("/api/transactions/:hash", async (req, res) => {
    try {
      const hash = req.params.hash;
      const transaction = await storage.getTransactionByHash(hash);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.json(transaction);
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
      const validators = await storage.getAllValidators();
      res.json(validators);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch validators" });
    }
  });

  app.get("/api/validators/:address", async (req, res) => {
    try {
      const address = req.params.address;
      const validator = await storage.getValidatorByAddress(address);
      if (!validator) {
        return res.status(404).json({ error: "Validator not found" });
      }
      res.json(validator);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch validator" });
    }
  });

  // ============================================
  // Smart Contracts
  // ============================================
  app.get("/api/contracts", async (_req, res) => {
    try {
      const contracts = await storage.getAllContracts();
      res.json(contracts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contracts" });
    }
  });

  app.get("/api/contracts/:address", async (req, res) => {
    try {
      const address = req.params.address;
      const contract = await storage.getContractByAddress(address);
      if (!contract) {
        return res.status(404).json({ error: "Contract not found" });
      }
      res.json(contract);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contract" });
    }
  });

  // ============================================
  // AI Models
  // ============================================
  app.get("/api/ai/models", async (_req, res) => {
    try {
      const models = await storage.getAllAiModels();
      res.json(models);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch AI models" });
    }
  });

  app.get("/api/ai/models/:name", async (req, res) => {
    try {
      const name = req.params.name;
      const model = await storage.getAiModelByName(name);
      if (!model) {
        return res.status(404).json({ error: "AI model not found" });
      }
      res.json(model);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch AI model" });
    }
  });

  // ============================================
  // Shards
  // ============================================
  app.get("/api/shards", async (_req, res) => {
    try {
      const shards = await storage.getAllShards();
      res.json(shards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch shards" });
    }
  });

  app.get("/api/shards/:id", async (req, res) => {
    try {
      const shardId = parseInt(req.params.id);
      const shard = await storage.getShardById(shardId);
      if (!shard) {
        return res.status(404).json({ error: "Shard not found" });
      }
      res.json(shard);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch shard" });
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
  // WebSocket Server
  // ============================================
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Store connected clients
  const clients = new Set<WebSocket>();

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

  return httpServer;
}
