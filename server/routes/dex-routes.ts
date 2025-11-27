import type { Express, Request, Response } from "express";
import { z } from "zod";
import { dexService } from "../services/DexService";
import { storage } from "../storage";
import {
  insertDexPoolSchema,
  insertDexPositionSchema,
  insertDexSwapSchema,
} from "@shared/schema";

const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
const WEI_REGEX = /^\d+$/;

const swapQuoteSchema = z.object({
  poolId: z.string().min(1),
  tokenIn: z.string().regex(ETH_ADDRESS_REGEX),
  tokenOut: z.string().regex(ETH_ADDRESS_REGEX),
  amountIn: z.string().regex(WEI_REGEX),
  slippageBps: z.number().int().min(1).max(5000).optional().default(50),
});

const executeSwapSchema = z.object({
  poolId: z.string().min(1),
  tokenIn: z.string().regex(ETH_ADDRESS_REGEX),
  tokenOut: z.string().regex(ETH_ADDRESS_REGEX),
  amountIn: z.string().regex(WEI_REGEX),
  minimumAmountOut: z.string().regex(WEI_REGEX),
  deadline: z.number().int().positive(),
  traderAddress: z.string().regex(ETH_ADDRESS_REGEX),
});

const addLiquiditySchema = z.object({
  poolId: z.string().min(1),
  ownerAddress: z.string().regex(ETH_ADDRESS_REGEX),
  amounts: z.array(z.object({
    token: z.string().regex(ETH_ADDRESS_REGEX),
    amount: z.string().regex(WEI_REGEX),
  })).min(1),
  minLpTokens: z.string().regex(WEI_REGEX).optional().default("0"),
});

const removeLiquiditySchema = z.object({
  positionId: z.string().min(1),
  percentageToRemove: z.number().min(0.01).max(100),
  minAmountsOut: z.array(z.object({
    token: z.string().regex(ETH_ADDRESS_REGEX),
    minAmount: z.string().regex(WEI_REGEX),
  })).optional().default([]),
});

const optimalRouteSchema = z.object({
  tokenIn: z.string().regex(ETH_ADDRESS_REGEX),
  tokenOut: z.string().regex(ETH_ADDRESS_REGEX),
  amountIn: z.string().regex(WEI_REGEX),
});

const createPoolSchema = z.object({
  name: z.string().min(1).max(100),
  symbol: z.string().min(1).max(20),
  poolType: z.enum(["standard", "stable", "concentrated", "multi_asset", "weighted"]),
  feeTier: z.number().int().min(1).max(10000).default(300),
  token0Address: z.string().regex(ETH_ADDRESS_REGEX),
  token0Symbol: z.string().min(1),
  token0Decimals: z.number().int().min(0).max(18).default(18),
  token1Address: z.string().regex(ETH_ADDRESS_REGEX),
  token1Symbol: z.string().min(1),
  token1Decimals: z.number().int().min(0).max(18).default(18),
  creatorAddress: z.string().regex(ETH_ADDRESS_REGEX),
  amplificationParameter: z.number().int().optional(),
  token0Weight: z.number().int().min(1).max(9900).optional(),
  token1Weight: z.number().int().min(1).max(9900).optional(),
  tickSpacing: z.number().int().optional(),
});

export function registerDexRoutes(app: Express, requireAuth: (req: Request, res: Response, next: () => void) => void) {

  app.get("/api/dex/stats", requireAuth, async (_req: Request, res: Response) => {
    try {
      const stats = await dexService.getDexStats();
      res.json(stats);
    } catch (error: any) {
      console.error('[DEX] Stats error:', error);
      res.status(500).json({ error: "Failed to fetch DEX statistics" });
    }
  });

  app.get("/api/dex/pools", requireAuth, async (req: Request, res: Response) => {
    try {
      const poolType = req.query.type as string | undefined;
      const limit = parseInt(req.query.limit as string) || 100;
      
      let pools;
      if (poolType) {
        pools = await dexService.getPoolsByType(poolType);
      } else {
        pools = await dexService.getAllPools(limit);
      }
      
      res.json(pools);
    } catch (error: any) {
      console.error('[DEX] Pools list error:', error);
      res.status(500).json({ error: "Failed to fetch pools" });
    }
  });

  app.get("/api/dex/pools/:poolId", requireAuth, async (req: Request, res: Response) => {
    try {
      const poolData = await dexService.getPoolWithAssets(req.params.poolId);
      if (!poolData) {
        return res.status(404).json({ error: "Pool not found" });
      }
      res.json(poolData);
    } catch (error: any) {
      console.error('[DEX] Pool detail error:', error);
      res.status(500).json({ error: "Failed to fetch pool" });
    }
  });

  app.get("/api/dex/pools/:poolId/metrics", requireAuth, async (req: Request, res: Response) => {
    try {
      const metrics = await dexService.getPoolMetrics(req.params.poolId);
      if (!metrics) {
        return res.status(404).json({ error: "Pool not found" });
      }
      res.json(metrics);
    } catch (error: any) {
      console.error('[DEX] Pool metrics error:', error);
      res.status(500).json({ error: "Failed to fetch pool metrics" });
    }
  });

  app.post("/api/dex/pools", requireAuth, async (req: Request, res: Response) => {
    try {
      const validation = createPoolSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validation.error.flatten().fieldErrors 
        });
      }
      
      const data = validation.data;
      const contractAddress = `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 18)}`.slice(0, 42);
      
      const poolData = {
        name: data.name,
        symbol: data.symbol,
        contractAddress,
        poolType: data.poolType,
        feeTier: data.feeTier,
        token0Address: data.token0Address,
        token0Symbol: data.token0Symbol,
        token0Decimals: data.token0Decimals,
        token1Address: data.token1Address,
        token1Symbol: data.token1Symbol,
        token1Decimals: data.token1Decimals,
        creatorAddress: data.creatorAddress,
        amplificationParameter: data.amplificationParameter,
        token0Weight: data.token0Weight,
        token1Weight: data.token1Weight,
        tickSpacing: data.tickSpacing,
        status: "active",
      };
      
      const pool = await dexService.createPool(poolData);
      
      await dexService.addPoolAsset({
        poolId: pool.id,
        tokenAddress: data.token0Address,
        tokenSymbol: data.token0Symbol,
        tokenDecimals: data.token0Decimals,
        weight: data.token0Weight || 5000,
        assetIndex: 0,
      });
      
      await dexService.addPoolAsset({
        poolId: pool.id,
        tokenAddress: data.token1Address,
        tokenSymbol: data.token1Symbol,
        tokenDecimals: data.token1Decimals,
        weight: data.token1Weight || 5000,
        assetIndex: 1,
      });
      
      res.status(201).json(pool);
    } catch (error: any) {
      console.error('[DEX] Create pool error:', error);
      res.status(500).json({ error: "Failed to create pool" });
    }
  });

  app.post("/api/dex/quote", requireAuth, async (req: Request, res: Response) => {
    try {
      const validation = swapQuoteSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validation.error.flatten().fieldErrors 
        });
      }
      
      const { poolId, tokenIn, tokenOut, amountIn, slippageBps } = validation.data;
      
      const quote = await dexService.calculateSwapQuote(poolId, tokenIn, tokenOut, amountIn, slippageBps);
      res.json(quote);
    } catch (error: any) {
      console.error('[DEX] Quote error:', error);
      if (error.message.includes("Circuit breaker")) {
        return res.status(503).json({ error: error.message });
      }
      res.status(400).json({ error: error.message || "Failed to get quote" });
    }
  });

  app.post("/api/dex/swap", requireAuth, async (req: Request, res: Response) => {
    try {
      const validation = executeSwapSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validation.error.flatten().fieldErrors 
        });
      }
      
      const { poolId, traderAddress, tokenIn, tokenOut, amountIn, minimumAmountOut, deadline } = validation.data;
      
      const swap = await dexService.executeSwap(
        poolId,
        traderAddress,
        tokenIn,
        tokenOut,
        amountIn,
        minimumAmountOut,
        deadline
      );
      
      res.status(201).json(swap);
    } catch (error: any) {
      console.error('[DEX] Swap error:', error);
      if (error.message.includes("deadline expired")) {
        return res.status(408).json({ error: error.message });
      }
      if (error.message.includes("Slippage tolerance")) {
        return res.status(400).json({ error: error.message });
      }
      if (error.message.includes("Circuit breaker")) {
        return res.status(503).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || "Swap execution failed" });
    }
  });

  app.get("/api/dex/swaps", requireAuth, async (req: Request, res: Response) => {
    try {
      const poolId = req.query.poolId as string | undefined;
      const traderAddress = req.query.trader as string | undefined;
      const limit = parseInt(req.query.limit as string) || 50;
      
      let swaps;
      if (poolId) {
        swaps = await storage.getDexSwapsByPool(poolId, limit);
      } else if (traderAddress) {
        swaps = await storage.getDexSwapsByTrader(traderAddress, limit);
      } else {
        swaps = await storage.getRecentDexSwaps(limit);
      }
      
      res.json(swaps);
    } catch (error: any) {
      console.error('[DEX] Swaps list error:', error);
      res.status(500).json({ error: "Failed to fetch swaps" });
    }
  });

  app.get("/api/dex/swaps/:swapId", requireAuth, async (req: Request, res: Response) => {
    try {
      const swap = await storage.getDexSwapById(req.params.swapId);
      if (!swap) {
        return res.status(404).json({ error: "Swap not found" });
      }
      res.json(swap);
    } catch (error: any) {
      console.error('[DEX] Swap detail error:', error);
      res.status(500).json({ error: "Failed to fetch swap" });
    }
  });

  app.post("/api/dex/liquidity/add", requireAuth, async (req: Request, res: Response) => {
    try {
      const validation = addLiquiditySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validation.error.flatten().fieldErrors 
        });
      }
      
      const { poolId, ownerAddress, amounts, minLpTokens } = validation.data;
      
      const position = await dexService.addLiquidity(poolId, ownerAddress, amounts, minLpTokens);
      res.status(201).json(position);
    } catch (error: any) {
      console.error('[DEX] Add liquidity error:', error);
      if (error.message.includes("Minimum LP tokens")) {
        return res.status(400).json({ error: error.message });
      }
      if (error.message.includes("Circuit breaker")) {
        return res.status(503).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || "Failed to add liquidity" });
    }
  });

  app.post("/api/dex/liquidity/quote", requireAuth, async (req: Request, res: Response) => {
    try {
      const { poolId, amounts } = req.body;
      
      if (!poolId || !amounts || !Array.isArray(amounts)) {
        return res.status(400).json({ error: "poolId and amounts array are required" });
      }
      
      const quote = await dexService.calculateAddLiquidityQuote(poolId, amounts);
      res.json(quote);
    } catch (error: any) {
      console.error('[DEX] Liquidity quote error:', error);
      res.status(400).json({ error: error.message || "Failed to get liquidity quote" });
    }
  });

  app.post("/api/dex/liquidity/remove", requireAuth, async (req: Request, res: Response) => {
    try {
      const validation = removeLiquiditySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validation.error.flatten().fieldErrors 
        });
      }
      
      const { positionId, percentageToRemove, minAmountsOut } = validation.data;
      
      const result = await dexService.removeLiquidity(positionId, percentageToRemove, minAmountsOut);
      res.json(result);
    } catch (error: any) {
      console.error('[DEX] Remove liquidity error:', error);
      if (error.message.includes("Minimum amount")) {
        return res.status(400).json({ error: error.message });
      }
      if (error.message.includes("Circuit breaker")) {
        return res.status(503).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || "Failed to remove liquidity" });
    }
  });

  app.get("/api/dex/positions", requireAuth, async (req: Request, res: Response) => {
    try {
      const ownerAddress = req.query.owner as string | undefined;
      const poolId = req.query.poolId as string | undefined;
      
      let positions: Awaited<ReturnType<typeof storage.getDexPositionsByOwner>> = [];
      if (ownerAddress) {
        positions = await storage.getDexPositionsByOwner(ownerAddress);
      } else if (poolId) {
        positions = await storage.getDexPositionsByPool(poolId);
      }
      
      res.json(positions);
    } catch (error: any) {
      console.error('[DEX] Positions list error:', error);
      res.status(500).json({ error: "Failed to fetch positions" });
    }
  });

  app.get("/api/dex/positions/:positionId", requireAuth, async (req: Request, res: Response) => {
    try {
      const position = await storage.getDexPositionById(req.params.positionId);
      if (!position) {
        return res.status(404).json({ error: "Position not found" });
      }
      res.json(position);
    } catch (error: any) {
      console.error('[DEX] Position detail error:', error);
      res.status(500).json({ error: "Failed to fetch position" });
    }
  });

  app.get("/api/dex/route/optimal", requireAuth, async (req: Request, res: Response) => {
    try {
      const validation = optimalRouteSchema.safeParse({
        tokenIn: req.query.tokenIn,
        tokenOut: req.query.tokenOut,
        amountIn: req.query.amountIn,
      });
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validation.error.flatten().fieldErrors 
        });
      }
      
      const { tokenIn, tokenOut, amountIn } = validation.data;
      
      const route = await dexService.getOptimalSwapRoute(tokenIn, tokenOut, amountIn);
      res.json(route);
    } catch (error: any) {
      console.error('[DEX] Optimal route error:', error);
      if (error.message.includes("No valid swap route")) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || "Failed to find optimal route" });
    }
  });

  app.get("/api/dex/pools/:poolId/prediction", requireAuth, async (req: Request, res: Response) => {
    try {
      const prediction = await dexService.getAiPricePrediction(req.params.poolId);
      res.json(prediction);
    } catch (error: any) {
      console.error('[DEX] AI prediction error:', error);
      res.status(500).json({ error: "Failed to get AI price prediction" });
    }
  });

  app.get("/api/dex/pools/:poolId/price-history", requireAuth, async (req: Request, res: Response) => {
    try {
      const interval = (req.query.interval as string) || "1h";
      const limit = parseInt(req.query.limit as string) || 24;
      
      const history = await storage.getDexPriceHistory(req.params.poolId, interval, limit);
      res.json(history);
    } catch (error: any) {
      console.error('[DEX] Price history error:', error);
      res.status(500).json({ error: "Failed to fetch price history" });
    }
  });

  app.get("/api/dex/pools/:poolId/twap", requireAuth, async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const observations = await storage.getDexTwapObservations(req.params.poolId, limit);
      res.json(observations);
    } catch (error: any) {
      console.error('[DEX] TWAP error:', error);
      res.status(500).json({ error: "Failed to fetch TWAP observations" });
    }
  });

  app.get("/api/dex/pools/:poolId/circuit-breaker", requireAuth, async (req: Request, res: Response) => {
    try {
      const breaker = await storage.getDexCircuitBreaker(req.params.poolId);
      if (!breaker) {
        return res.status(404).json({ error: "Circuit breaker not configured for this pool" });
      }
      res.json(breaker);
    } catch (error: any) {
      console.error('[DEX] Circuit breaker status error:', error);
      res.status(500).json({ error: "Failed to fetch circuit breaker status" });
    }
  });

  app.get("/api/dex/mev-events", requireAuth, async (req: Request, res: Response) => {
    try {
      const poolId = req.query.poolId as string | undefined;
      const limit = parseInt(req.query.limit as string) || 50;
      
      let events;
      if (poolId) {
        events = await storage.getDexMevEventsByPool(poolId, limit);
      } else {
        events = await storage.getRecentDexMevEvents(limit);
      }
      
      res.json(events);
    } catch (error: any) {
      console.error('[DEX] MEV events error:', error);
      res.status(500).json({ error: "Failed to fetch MEV events" });
    }
  });

  app.get("/api/dex/analytics/:userAddress", requireAuth, async (req: Request, res: Response) => {
    try {
      const analytics = await storage.getDexUserAnalytics(req.params.userAddress);
      if (!analytics) {
        return res.json({
          userAddress: req.params.userAddress,
          totalSwaps: 0,
          totalVolumeUsd: "0",
          totalFeePaid: "0",
          totalPositions: 0,
          activePositions: 0,
          totalLiquidityProvidedUsd: "0",
          totalFeesEarnedUsd: "0",
          traderTier: "bronze",
          feeDiscount: 0,
        });
      }
      res.json(analytics);
    } catch (error: any) {
      console.error('[DEX] User analytics error:', error);
      res.status(500).json({ error: "Failed to fetch user analytics" });
    }
  });

  app.get("/api/dex/leaderboard", requireAuth, async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const type = (req.query.type as string) || "volume";
      
      let topTraders;
      if (type === "liquidity") {
        topTraders = await storage.getTopDexLiquidityProviders(limit);
      } else {
        topTraders = await storage.getTopDexTraders(limit);
      }
      
      const leaderboard = topTraders.map((user, index) => ({
        rank: index + 1,
        userAddress: user.userAddress,
        totalVolumeUsd: user.totalVolumeUsd,
        totalSwaps: user.totalSwaps,
        totalFeePaid: user.totalFeePaid,
        traderTier: user.traderTier,
        totalLiquidityProvidedUsd: user.totalLiquidityProvidedUsd,
      }));
      
      res.json(leaderboard);
    } catch (error: any) {
      console.error('[DEX] Leaderboard error:', error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  console.log('[DEX] Routes registered successfully');
}
