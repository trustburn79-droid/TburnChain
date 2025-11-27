import { Router, Request, Response } from "express";
import { z } from "zod";
import { liquidStakingService } from "../services/LiquidStakingService";
import { storage } from "../storage";

const router = Router();

// ============================================
// POOL ENDPOINTS
// ============================================

router.get("/pools", async (_req: Request, res: Response) => {
  try {
    const pools = await liquidStakingService.getAllPools();
    res.json(pools);
  } catch (error) {
    console.error("[LST] Error getting pools:", error);
    res.status(500).json({ error: "Failed to fetch pools" });
  }
});

router.get("/pools/active", async (_req: Request, res: Response) => {
  try {
    const pools = await liquidStakingService.getActivePools();
    res.json(pools);
  } catch (error) {
    console.error("[LST] Error getting active pools:", error);
    res.status(500).json({ error: "Failed to fetch active pools" });
  }
});

router.get("/pools/:id", async (req: Request, res: Response) => {
  try {
    const pool = await liquidStakingService.getPoolById(req.params.id);
    if (!pool) {
      return res.status(404).json({ error: "Pool not found" });
    }
    res.json(pool);
  } catch (error) {
    console.error("[LST] Error getting pool:", error);
    res.status(500).json({ error: "Failed to fetch pool" });
  }
});

router.get("/pools/:id/stats", async (req: Request, res: Response) => {
  try {
    const stats = await liquidStakingService.getPoolStats(req.params.id);
    res.json(stats);
  } catch (error) {
    console.error("[LST] Error getting pool stats:", error);
    res.status(500).json({ error: "Failed to fetch pool stats" });
  }
});

router.get("/pools/:id/baskets", async (req: Request, res: Response) => {
  try {
    const baskets = await liquidStakingService.getPoolBaskets(req.params.id);
    res.json(baskets);
  } catch (error) {
    console.error("[LST] Error getting baskets:", error);
    res.status(500).json({ error: "Failed to fetch baskets" });
  }
});

router.get("/pools/:id/positions", async (req: Request, res: Response) => {
  try {
    const positions = await storage.getLstPositionsByPool(req.params.id);
    res.json(positions);
  } catch (error) {
    console.error("[LST] Error getting pool positions:", error);
    res.status(500).json({ error: "Failed to fetch positions" });
  }
});

router.get("/pools/:id/rebase-history", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const history = await storage.getRebaseHistoryByPool(req.params.id, limit);
    res.json(history);
  } catch (error) {
    console.error("[LST] Error getting rebase history:", error);
    res.status(500).json({ error: "Failed to fetch rebase history" });
  }
});

router.get("/pools/:id/transactions", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const transactions = await storage.getLstTransactionsByPool(req.params.id, limit);
    res.json(transactions);
  } catch (error) {
    console.error("[LST] Error getting pool transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// ============================================
// USER POSITION ENDPOINTS
// ============================================

router.get("/positions/:userAddress", async (req: Request, res: Response) => {
  try {
    const positions = await liquidStakingService.getUserPositions(req.params.userAddress);
    res.json(positions);
  } catch (error) {
    console.error("[LST] Error getting user positions:", error);
    res.status(500).json({ error: "Failed to fetch positions" });
  }
});

router.get("/positions/:userAddress/:poolId", async (req: Request, res: Response) => {
  try {
    const position = await liquidStakingService.getPosition(req.params.userAddress, req.params.poolId);
    if (!position) {
      return res.status(404).json({ error: "Position not found" });
    }
    res.json(position);
  } catch (error) {
    console.error("[LST] Error getting position:", error);
    res.status(500).json({ error: "Failed to fetch position" });
  }
});

router.get("/user/:userAddress/stats", async (req: Request, res: Response) => {
  try {
    const stats = await liquidStakingService.getUserStats(req.params.userAddress);
    res.json(stats);
  } catch (error) {
    console.error("[LST] Error getting user stats:", error);
    res.status(500).json({ error: "Failed to fetch user stats" });
  }
});

router.get("/user/:userAddress/transactions", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const transactions = await storage.getLstTransactionsByUser(req.params.userAddress, limit);
    res.json(transactions);
  } catch (error) {
    console.error("[LST] Error getting user transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// ============================================
// MINT/REDEEM OPERATIONS
// ============================================

const mintSchema = z.object({
  userAddress: z.string().min(1),
  poolId: z.string().uuid(),
  underlyingAmount: z.string().min(1),
});

router.post("/mint", async (req: Request, res: Response) => {
  try {
    const data = mintSchema.parse(req.body);
    const result = await liquidStakingService.mint(
      data.userAddress,
      data.poolId,
      data.underlyingAmount
    );
    res.json(result);
  } catch (error) {
    console.error("[LST] Error minting:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request", details: error.errors });
    }
    res.status(500).json({ error: error instanceof Error ? error.message : "Mint failed" });
  }
});

const redeemSchema = z.object({
  userAddress: z.string().min(1),
  poolId: z.string().uuid(),
  lstAmount: z.string().min(1),
});

router.post("/redeem", async (req: Request, res: Response) => {
  try {
    const data = redeemSchema.parse(req.body);
    const result = await liquidStakingService.redeem(
      data.userAddress,
      data.poolId,
      data.lstAmount
    );
    res.json(result);
  } catch (error) {
    console.error("[LST] Error redeeming:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request", details: error.errors });
    }
    res.status(500).json({ error: error instanceof Error ? error.message : "Redeem failed" });
  }
});

const claimSchema = z.object({
  userAddress: z.string().min(1),
  poolId: z.string().uuid(),
});

router.post("/claim-rewards", async (req: Request, res: Response) => {
  try {
    const data = claimSchema.parse(req.body);
    const result = await liquidStakingService.claimRewards(data.userAddress, data.poolId);
    res.json(result);
  } catch (error) {
    console.error("[LST] Error claiming rewards:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request", details: error.errors });
    }
    res.status(500).json({ error: error instanceof Error ? error.message : "Claim failed" });
  }
});

// ============================================
// EXCHANGE RATE CALCULATOR
// ============================================

router.get("/calculate/lst-from-underlying/:poolId/:amount", async (req: Request, res: Response) => {
  try {
    const pool = await liquidStakingService.getPoolById(req.params.poolId);
    if (!pool) {
      return res.status(404).json({ error: "Pool not found" });
    }
    const lstAmount = liquidStakingService.calculateLstFromUnderlying(req.params.amount, pool.exchangeRate);
    res.json({ underlyingAmount: req.params.amount, lstAmount, exchangeRate: pool.exchangeRate });
  } catch (error) {
    console.error("[LST] Error calculating:", error);
    res.status(500).json({ error: "Calculation failed" });
  }
});

router.get("/calculate/underlying-from-lst/:poolId/:amount", async (req: Request, res: Response) => {
  try {
    const pool = await liquidStakingService.getPoolById(req.params.poolId);
    if (!pool) {
      return res.status(404).json({ error: "Pool not found" });
    }
    const underlyingAmount = liquidStakingService.calculateUnderlyingFromLst(req.params.amount, pool.exchangeRate);
    res.json({ lstAmount: req.params.amount, underlyingAmount, exchangeRate: pool.exchangeRate });
  } catch (error) {
    console.error("[LST] Error calculating:", error);
    res.status(500).json({ error: "Calculation failed" });
  }
});

// ============================================
// PROTOCOL STATS & ANALYTICS
// ============================================

router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const stats = await liquidStakingService.getProtocolStats();
    res.json(stats);
  } catch (error) {
    console.error("[LST] Error getting protocol stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.get("/transactions/recent", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const transactions = await liquidStakingService.getRecentTransactions(limit);
    res.json(transactions);
  } catch (error) {
    console.error("[LST] Error getting recent transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

router.get("/rebases/recent", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const rebases = await liquidStakingService.getRecentRebases(limit);
    res.json(rebases);
  } catch (error) {
    console.error("[LST] Error getting recent rebases:", error);
    res.status(500).json({ error: "Failed to fetch rebases" });
  }
});

export function registerLiquidStakingRoutes(app: Router) {
  app.use("/api/liquid-staking", router);
  console.log("[LST] Routes registered successfully");
}
