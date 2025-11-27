import { Router, Request, Response } from "express";
import { z } from "zod";
import { farmingService } from "../services/FarmingService";
import { storage } from "../storage";

const router = Router();

// ============================================
// VAULT ENDPOINTS
// ============================================

router.get("/vaults", async (_req: Request, res: Response) => {
  try {
    const vaults = await farmingService.getAllVaults();
    res.json(vaults);
  } catch (error) {
    console.error("[Yield] Error getting vaults:", error);
    res.status(500).json({ error: "Failed to fetch vaults" });
  }
});

router.get("/vaults/active", async (_req: Request, res: Response) => {
  try {
    const vaults = await farmingService.getActiveVaults();
    res.json(vaults);
  } catch (error) {
    console.error("[Yield] Error getting active vaults:", error);
    res.status(500).json({ error: "Failed to fetch active vaults" });
  }
});

router.get("/vaults/type/:type", async (req: Request, res: Response) => {
  try {
    const vaults = await farmingService.getVaultsByType(req.params.type);
    res.json(vaults);
  } catch (error) {
    console.error("[Yield] Error getting vaults by type:", error);
    res.status(500).json({ error: "Failed to fetch vaults" });
  }
});

router.get("/vaults/:id", async (req: Request, res: Response) => {
  try {
    const vault = await farmingService.getVaultById(req.params.id);
    if (!vault) {
      return res.status(404).json({ error: "Vault not found" });
    }
    res.json(vault);
  } catch (error) {
    console.error("[Yield] Error getting vault:", error);
    res.status(500).json({ error: "Failed to fetch vault" });
  }
});

router.get("/vaults/:id/stats", async (req: Request, res: Response) => {
  try {
    const stats = await farmingService.getVaultStats(req.params.id);
    res.json(stats);
  } catch (error) {
    console.error("[Yield] Error getting vault stats:", error);
    res.status(500).json({ error: "Failed to fetch vault stats" });
  }
});

router.get("/vaults/:id/strategies", async (req: Request, res: Response) => {
  try {
    const strategies = await farmingService.getStrategiesForVault(req.params.id);
    res.json(strategies);
  } catch (error) {
    console.error("[Yield] Error getting strategies:", error);
    res.status(500).json({ error: "Failed to fetch strategies" });
  }
});

router.get("/vaults/:id/positions", async (req: Request, res: Response) => {
  try {
    const positions = await storage.getYieldPositionsByVault(req.params.id);
    res.json(positions);
  } catch (error) {
    console.error("[Yield] Error getting vault positions:", error);
    res.status(500).json({ error: "Failed to fetch positions" });
  }
});

router.get("/vaults/:id/harvests", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const harvests = await storage.getYieldHarvestsByVault(req.params.id, limit);
    res.json(harvests);
  } catch (error) {
    console.error("[Yield] Error getting harvests:", error);
    res.status(500).json({ error: "Failed to fetch harvests" });
  }
});

router.get("/vaults/:id/transactions", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const transactions = await storage.getYieldTransactionsByVault(req.params.id, limit);
    res.json(transactions);
  } catch (error) {
    console.error("[Yield] Error getting vault transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// ============================================
// USER POSITION ENDPOINTS
// ============================================

router.get("/positions/:userAddress", async (req: Request, res: Response) => {
  try {
    const positions = await farmingService.getUserPositions(req.params.userAddress);
    res.json(positions);
  } catch (error) {
    console.error("[Yield] Error getting user positions:", error);
    res.status(500).json({ error: "Failed to fetch positions" });
  }
});

router.get("/positions/:userAddress/:vaultId", async (req: Request, res: Response) => {
  try {
    const position = await farmingService.getPosition(req.params.userAddress, req.params.vaultId);
    if (!position) {
      return res.status(404).json({ error: "Position not found" });
    }
    res.json(position);
  } catch (error) {
    console.error("[Yield] Error getting position:", error);
    res.status(500).json({ error: "Failed to fetch position" });
  }
});

router.get("/user/:userAddress/stats", async (req: Request, res: Response) => {
  try {
    const stats = await farmingService.getUserStats(req.params.userAddress);
    res.json(stats);
  } catch (error) {
    console.error("[Yield] Error getting user stats:", error);
    res.status(500).json({ error: "Failed to fetch user stats" });
  }
});

router.get("/user/:userAddress/transactions", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const transactions = await storage.getYieldTransactionsByUser(req.params.userAddress, limit);
    res.json(transactions);
  } catch (error) {
    console.error("[Yield] Error getting user transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// ============================================
// DEPOSIT/WITHDRAW OPERATIONS
// ============================================

const depositSchema = z.object({
  userAddress: z.string().min(1),
  vaultId: z.string().uuid(),
  amount: z.string().min(1),
  lockDays: z.number().int().min(0).default(0),
});

router.post("/deposit", async (req: Request, res: Response) => {
  try {
    const data = depositSchema.parse(req.body);
    const result = await farmingService.deposit(
      data.userAddress,
      data.vaultId,
      data.amount,
      data.lockDays
    );
    res.json(result);
  } catch (error) {
    console.error("[Yield] Error depositing:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request", details: error.errors });
    }
    res.status(500).json({ error: error instanceof Error ? error.message : "Deposit failed" });
  }
});

const withdrawSchema = z.object({
  userAddress: z.string().min(1),
  vaultId: z.string().uuid(),
  shares: z.string().min(1),
});

router.post("/withdraw", async (req: Request, res: Response) => {
  try {
    const data = withdrawSchema.parse(req.body);
    const result = await farmingService.withdraw(
      data.userAddress,
      data.vaultId,
      data.shares
    );
    res.json(result);
  } catch (error) {
    console.error("[Yield] Error withdrawing:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request", details: error.errors });
    }
    res.status(500).json({ error: error instanceof Error ? error.message : "Withdrawal failed" });
  }
});

const claimSchema = z.object({
  userAddress: z.string().min(1),
  vaultId: z.string().uuid(),
});

router.post("/claim-rewards", async (req: Request, res: Response) => {
  try {
    const data = claimSchema.parse(req.body);
    const result = await farmingService.claimRewards(data.userAddress, data.vaultId);
    res.json(result);
  } catch (error) {
    console.error("[Yield] Error claiming rewards:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request", details: error.errors });
    }
    res.status(500).json({ error: error instanceof Error ? error.message : "Claim failed" });
  }
});

// ============================================
// HARVEST OPERATIONS
// ============================================

const harvestSchema = z.object({
  vaultId: z.string().uuid(),
  executorAddress: z.string().min(1),
});

router.post("/harvest", async (req: Request, res: Response) => {
  try {
    const data = harvestSchema.parse(req.body);
    const harvest = await farmingService.harvestVault(data.vaultId, data.executorAddress);
    res.json(harvest);
  } catch (error) {
    console.error("[Yield] Error harvesting:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request", details: error.errors });
    }
    res.status(500).json({ error: error instanceof Error ? error.message : "Harvest failed" });
  }
});

// ============================================
// PROTOCOL STATS & ANALYTICS
// ============================================

router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const stats = await farmingService.getProtocolStats();
    res.json(stats);
  } catch (error) {
    console.error("[Yield] Error getting protocol stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.get("/transactions/recent", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const transactions = await farmingService.getRecentTransactions(limit);
    res.json(transactions);
  } catch (error) {
    console.error("[Yield] Error getting recent transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

router.get("/harvests/recent", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const harvests = await farmingService.getRecentHarvests(limit);
    res.json(harvests);
  } catch (error) {
    console.error("[Yield] Error getting recent harvests:", error);
    res.status(500).json({ error: "Failed to fetch harvests" });
  }
});

// ============================================
// BOOST CALCULATOR
// ============================================

router.get("/boost-calculator/:days", async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.params.days);
    if (isNaN(days) || days < 0) {
      return res.status(400).json({ error: "Invalid lock days" });
    }
    const multiplier = farmingService.calculateBoostMultiplier(days);
    res.json({ lockDays: days, multiplier, boostPercent: ((multiplier - 10000) / 100).toFixed(2) });
  } catch (error) {
    console.error("[Yield] Error calculating boost:", error);
    res.status(500).json({ error: "Failed to calculate boost" });
  }
});

export function registerYieldRoutes(app: Router) {
  app.use("/api/yield", router);
  console.log("[Yield] Routes registered successfully");
}
