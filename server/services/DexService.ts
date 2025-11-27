import { storage } from "../storage";
import type {
  DexPool,
  DexPoolAsset,
  DexPosition,
  DexSwap,
  DexPriceHistory,
  DexTwapOracle,
  DexCircuitBreaker,
  DexMevEvent,
  DexLiquidityReward,
  DexUserAnalytics,
  InsertDexPool,
  InsertDexPoolAsset,
  InsertDexPosition,
  InsertDexSwap,
  InsertDexPriceHistory,
  InsertDexTwapOracle,
  InsertDexMevEvent,
  InsertDexUserAnalytics,
} from "@shared/schema";

const PRECISION = BigInt("1000000000000000000");
const FEE_PRECISION = BigInt(10000);
const MINIMUM_LIQUIDITY = BigInt(1000);
const MAX_PRICE_IMPACT_BPS = 1000;
const STABLE_SWAP_A = BigInt(100);

interface SwapQuote {
  amountIn: string;
  amountOut: string;
  priceImpact: number;
  fee: string;
  route: string[];
  estimatedGas: string;
  minimumAmountOut: string;
  executionPrice: number;
  spotPrice: number;
}

interface LiquidityQuote {
  lpTokensToMint: string;
  shareOfPool: number;
  priceImpact: number;
  requiredAmounts: { token: string; amount: string }[];
}

interface RemoveLiquidityQuote {
  amountsOut: { token: string; amount: string }[];
  shareRedeemed: number;
}

interface PoolMetrics {
  poolId: string;
  tvlUsd: string;
  volume24h: string;
  fees24h: string;
  apy: number;
  volatility: number;
  utilizationRate: number;
}

class DexService {
  private aiPredictionCache: Map<string, { price: number; confidence: number; timestamp: number }> = new Map();
  private circuitBreakerState: Map<string, { triggered: boolean; cooldownEnd: number }> = new Map();

  async getPool(poolId: string): Promise<DexPool | undefined> {
    return storage.getDexPoolById(poolId);
  }

  async getPoolWithAssets(poolId: string): Promise<{ pool: DexPool; assets: DexPoolAsset[] } | undefined> {
    const pool = await storage.getDexPoolById(poolId);
    if (!pool) return undefined;
    
    const assets = await storage.getDexPoolAssets(poolId);
    return { pool, assets };
  }

  async getAllPools(limit: number = 100): Promise<DexPool[]> {
    return storage.getAllDexPools(limit);
  }

  async getPoolsByType(poolType: string): Promise<DexPool[]> {
    return storage.getDexPoolsByType(poolType);
  }

  async calculateSwapQuote(
    poolId: string,
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    slippageBps: number = 50
  ): Promise<SwapQuote> {
    const poolData = await this.getPoolWithAssets(poolId);
    if (!poolData) {
      throw new Error(`Pool ${poolId} not found`);
    }

    const { pool, assets } = poolData;

    await this.checkCircuitBreaker(poolId);

    const assetIn = assets.find(a => a.tokenAddress === tokenIn);
    const assetOut = assets.find(a => a.tokenAddress === tokenOut);

    if (!assetIn || !assetOut) {
      throw new Error("Invalid token addresses for this pool");
    }

    const amountInBigInt = BigInt(amountIn);
    const reserveIn = BigInt(assetIn.reserve);
    const reserveOut = BigInt(assetOut.reserve);
    const feeTierBps = pool.feeTier;

    let amountOutBigInt: bigint;
    let fee: bigint;

    switch (pool.poolType) {
      case "constant_product":
      case "standard":
        ({ amountOut: amountOutBigInt, fee } = this.calculateConstantProductSwap(
          amountInBigInt,
          reserveIn,
          reserveOut,
          feeTierBps
        ));
        break;
      case "stable":
        ({ amountOut: amountOutBigInt, fee } = this.calculateStableSwap(
          amountInBigInt,
          reserveIn,
          reserveOut,
          feeTierBps,
          assetIn.weight,
          assetOut.weight
        ));
        break;
      case "concentrated":
        ({ amountOut: amountOutBigInt, fee } = await this.calculateConcentratedSwap(
          poolId,
          amountInBigInt,
          reserveIn,
          reserveOut,
          feeTierBps
        ));
        break;
      case "multi_asset":
      case "weighted":
        ({ amountOut: amountOutBigInt, fee } = this.calculateMultiAssetSwap(
          amountInBigInt,
          reserveIn,
          reserveOut,
          feeTierBps,
          assetIn.weight,
          assetOut.weight
        ));
        break;
      default:
        throw new Error(`Unsupported pool type: ${pool.poolType}`);
    }

    const priceImpact = this.calculatePriceImpact(
      amountInBigInt,
      amountOutBigInt,
      reserveIn,
      reserveOut
    );

    if (priceImpact * 100 > MAX_PRICE_IMPACT_BPS) {
      console.warn(`High price impact detected: ${priceImpact * 100}bps`);
    }

    const spotPrice = Number(reserveOut) / Number(reserveIn);
    const executionPrice = Number(amountOutBigInt) / Number(amountInBigInt);

    const minimumAmountOut = (amountOutBigInt * BigInt(10000 - slippageBps)) / BigInt(10000);

    return {
      amountIn,
      amountOut: amountOutBigInt.toString(),
      priceImpact,
      fee: fee.toString(),
      route: [tokenIn, tokenOut],
      estimatedGas: "150000",
      minimumAmountOut: minimumAmountOut.toString(),
      executionPrice,
      spotPrice,
    };
  }

  private calculateConstantProductSwap(
    amountIn: bigint,
    reserveIn: bigint,
    reserveOut: bigint,
    feeTierBps: number
  ): { amountOut: bigint; fee: bigint } {
    const fee = (amountIn * BigInt(feeTierBps)) / FEE_PRECISION;
    const amountInAfterFee = amountIn - fee;

    const numerator = amountInAfterFee * reserveOut;
    const denominator = reserveIn + amountInAfterFee;
    const amountOut = numerator / denominator;

    return { amountOut, fee };
  }

  private calculateStableSwap(
    amountIn: bigint,
    reserveIn: bigint,
    reserveOut: bigint,
    feeTierBps: number,
    weightIn: number,
    weightOut: number
  ): { amountOut: bigint; fee: bigint } {
    const fee = (amountIn * BigInt(feeTierBps)) / FEE_PRECISION;
    const amountInAfterFee = amountIn - fee;

    const A = STABLE_SWAP_A;
    const D = this.calculateStableSwapInvariant(reserveIn, reserveOut, A);
    
    const newReserveIn = reserveIn + amountInAfterFee;
    const newReserveOut = this.calculateStableSwapY(newReserveIn, D, A);
    
    const amountOut = reserveOut - newReserveOut;

    return { amountOut: amountOut > BigInt(0) ? amountOut : BigInt(0), fee };
  }

  private calculateStableSwapInvariant(x: bigint, y: bigint, A: bigint): bigint {
    const sum = x + y;
    if (sum === BigInt(0)) return BigInt(0);

    let D = sum;
    const Ann = A * BigInt(2);
    
    for (let i = 0; i < 255; i++) {
      const D_P = D * D * D / (x * y * BigInt(4));
      const D_prev = D;
      D = (Ann * sum + D_P * BigInt(2)) * D / ((Ann - BigInt(1)) * D + BigInt(3) * D_P);
      
      if (D > D_prev) {
        if (D - D_prev <= BigInt(1)) break;
      } else {
        if (D_prev - D <= BigInt(1)) break;
      }
    }
    
    return D;
  }

  private calculateStableSwapY(x: bigint, D: bigint, A: bigint): bigint {
    const Ann = A * BigInt(2);
    const c = D * D / (x * BigInt(2)) * D / (Ann * BigInt(2));
    const b = x + D / Ann;
    
    let y = D;
    for (let i = 0; i < 255; i++) {
      const y_prev = y;
      y = (y * y + c) / (BigInt(2) * y + b - D);
      
      if (y > y_prev) {
        if (y - y_prev <= BigInt(1)) break;
      } else {
        if (y_prev - y <= BigInt(1)) break;
      }
    }
    
    return y;
  }

  private async calculateConcentratedSwap(
    poolId: string,
    amountIn: bigint,
    reserveIn: bigint,
    reserveOut: bigint,
    feeTierBps: number
  ): Promise<{ amountOut: bigint; fee: bigint }> {
    const ticks = await storage.getDexPoolTicks(poolId);
    
    if (ticks.length === 0) {
      return this.calculateConstantProductSwap(amountIn, reserveIn, reserveOut, feeTierBps);
    }

    const fee = (amountIn * BigInt(feeTierBps)) / FEE_PRECISION;
    const amountInAfterFee = amountIn - fee;

    let remainingAmountIn = amountInAfterFee;
    let totalAmountOut = BigInt(0);
    let currentTickIndex = 0;

    while (remainingAmountIn > BigInt(0) && currentTickIndex < ticks.length) {
      const tick = ticks[currentTickIndex];
      const tickLiquidity = BigInt(tick.liquidityGross);
      
      const tickReserveIn = (tickLiquidity * reserveIn) / PRECISION;
      const tickReserveOut = (tickLiquidity * reserveOut) / PRECISION;
      
      const maxAmountForTick = tickReserveIn / BigInt(2);
      const amountForTick = remainingAmountIn < maxAmountForTick ? remainingAmountIn : maxAmountForTick;
      
      const amountOut = (amountForTick * tickReserveOut) / (tickReserveIn + amountForTick);
      
      totalAmountOut += amountOut;
      remainingAmountIn -= amountForTick;
      currentTickIndex++;
    }

    return { amountOut: totalAmountOut, fee };
  }

  private calculateMultiAssetSwap(
    amountIn: bigint,
    reserveIn: bigint,
    reserveOut: bigint,
    feeTierBps: number,
    weightIn: number,
    weightOut: number
  ): { amountOut: bigint; fee: bigint } {
    const fee = (amountIn * BigInt(feeTierBps)) / FEE_PRECISION;
    const amountInAfterFee = amountIn - fee;

    const effectiveWeightIn = weightIn || 5000;
    const effectiveWeightOut = weightOut || 5000;
    
    const balanceRatio = Number((reserveIn + amountInAfterFee) * PRECISION) / Number(reserveIn * PRECISION);
    const powerResult = Math.pow(balanceRatio, effectiveWeightIn / effectiveWeightOut);
    const newReserveOutRatio = 1 / powerResult;
    
    const amountOut = BigInt(Math.floor(Number(reserveOut) * (1 - newReserveOutRatio)));

    return { amountOut: amountOut > BigInt(0) ? amountOut : BigInt(0), fee };
  }

  private calculatePriceImpact(
    amountIn: bigint,
    amountOut: bigint,
    reserveIn: bigint,
    reserveOut: bigint
  ): number {
    const spotPrice = Number(reserveOut * PRECISION / reserveIn) / Number(PRECISION);
    const executionPrice = Number(amountOut * PRECISION / amountIn) / Number(PRECISION);
    
    const impact = (spotPrice - executionPrice) / spotPrice;
    return Math.abs(impact);
  }

  async executeSwap(
    poolId: string,
    traderAddress: string,
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    minimumAmountOut: string,
    deadline: number
  ): Promise<DexSwap> {
    if (Date.now() / 1000 > deadline) {
      throw new Error("Transaction deadline expired");
    }

    await this.checkCircuitBreaker(poolId);

    const poolData = await this.getPoolWithAssets(poolId);
    if (!poolData) {
      throw new Error(`Pool ${poolId} not found`);
    }

    const { pool, assets } = poolData;

    if (pool.status !== "active") {
      throw new Error(`Pool is ${pool.status}, swaps not allowed`);
    }

    const assetIn = assets.find(a => a.tokenAddress === tokenIn);
    const assetOut = assets.find(a => a.tokenAddress === tokenOut);
    if (!assetIn || !assetOut) {
      throw new Error("Invalid token addresses");
    }

    const quote = await this.calculateSwapQuote(poolId, tokenIn, tokenOut, amountIn);
    
    if (BigInt(quote.amountOut) < BigInt(minimumAmountOut)) {
      throw new Error("Slippage tolerance exceeded");
    }

    const mevCheck = await this.detectMevActivity(poolId, amountIn, quote.priceImpact);
    if (mevCheck.detected) {
      await this.logMevEvent(poolId, mevCheck);
    }

    const txHash = `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
    const priceImpactBps = Math.floor(quote.priceImpact * 10000);
    
    const swapData: InsertDexSwap = {
      poolId,
      txHash,
      traderAddress,
      tokenInAddress: tokenIn,
      tokenInSymbol: assetIn.tokenSymbol,
      tokenOutAddress: tokenOut,
      tokenOutSymbol: assetOut.tokenSymbol,
      amountIn,
      amountOut: quote.amountOut,
      amountInUsd: (Number(amountIn) / 1e18).toFixed(2),
      amountOutUsd: (Number(quote.amountOut) / 1e18).toFixed(2),
      priceImpact: priceImpactBps,
      effectivePrice: quote.executionPrice.toString(),
      feeAmount: quote.fee,
      feeUsd: (Number(quote.fee) / 1e18).toFixed(4),
      slippageTolerance: 50,
      actualSlippage: priceImpactBps,
      mevProtected: pool.mevProtectionEnabled,
      isPrivate: false,
      routePath: quote.route,
      isMultiHop: false,
      aiOptimizedRoute: pool.aiRouteOptimization,
      status: "pending",
      blockNumber: Math.floor(Date.now() / 1000),
      blockTimestamp: Math.floor(Date.now() / 1000),
      gasUsed: parseInt(quote.estimatedGas),
      gasPrice: "20000000000",
    };

    const swap = await storage.createDexSwap(swapData);

    try {
      await this.updatePoolReserves(poolId, tokenIn, tokenOut, amountIn, quote.amountOut, quote.fee);
      
      await storage.updateDexSwap(swap.id, {
        status: "completed",
        completedAt: new Date(),
      });

      await this.updateTwapOracle(poolId, assets);
      
      await this.updateUserAnalytics(traderAddress, amountIn, quote.amountOut, quote.fee);

      await this.updatePriceHistory(poolId, assets);

    } catch (error) {
      await storage.updateDexSwap(swap.id, {
        status: "failed",
        failureReason: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }

    return (await storage.getDexSwapById(swap.id))!;
  }

  private async updatePoolReserves(
    poolId: string,
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    amountOut: string,
    fee: string
  ): Promise<void> {
    const assets = await storage.getDexPoolAssets(poolId);
    
    for (const asset of assets) {
      if (asset.tokenAddress === tokenIn) {
        const newReserve = (BigInt(asset.reserve) + BigInt(amountIn)).toString();
        await storage.updateDexPoolAsset(asset.id, { reserve: newReserve });
      } else if (asset.tokenAddress === tokenOut) {
        const newReserve = (BigInt(asset.reserve) - BigInt(amountOut)).toString();
        await storage.updateDexPoolAsset(asset.id, { reserve: newReserve });
      }
    }

    const pool = await storage.getDexPoolById(poolId);
    if (pool) {
      const currentVolume = pool.volume24h.replace(/[^\d]/g, '') || "0";
      const currentFees = pool.fees24h.replace(/[^\d]/g, '') || "0";
      const newVolume = (BigInt(currentVolume) + BigInt(amountIn)).toString();
      const newFees = (BigInt(currentFees) + BigInt(fee)).toString();
      await storage.updateDexPool(poolId, {
        volume24h: newVolume,
        fees24h: newFees,
        swapCount24h: pool.swapCount24h + 1,
        lastSwapAt: new Date(),
      });
    }
  }

  async calculateAddLiquidityQuote(
    poolId: string,
    amounts: { token: string; amount: string }[]
  ): Promise<LiquidityQuote> {
    const poolData = await this.getPoolWithAssets(poolId);
    if (!poolData) {
      throw new Error(`Pool ${poolId} not found`);
    }

    const { pool, assets } = poolData;

    const totalSupply = BigInt(pool.lpTokenSupply);

    if (totalSupply === BigInt(0)) {
      const productOfAmounts = amounts.reduce(
        (acc, { amount }) => acc * BigInt(amount),
        BigInt(1)
      );
      const lpTokens = this.sqrt(productOfAmounts) - MINIMUM_LIQUIDITY;

      return {
        lpTokensToMint: lpTokens.toString(),
        shareOfPool: 100,
        priceImpact: 0,
        requiredAmounts: amounts,
      };
    }

    let minRatio = BigInt(Number.MAX_SAFE_INTEGER) * PRECISION;
    
    for (const { token, amount } of amounts) {
      const asset = assets.find(a => a.tokenAddress === token);
      if (!asset) throw new Error(`Token ${token} not in pool`);
      
      const ratio = (BigInt(amount) * PRECISION) / BigInt(asset.reserve);
      if (ratio < minRatio) minRatio = ratio;
    }

    const lpTokensToMint = (totalSupply * minRatio) / PRECISION;
    const shareOfPool = Number((lpTokensToMint * PRECISION * BigInt(100)) / (totalSupply + lpTokensToMint)) / Number(PRECISION);

    const requiredAmounts = assets.map(asset => {
      const amount = (BigInt(asset.reserve) * minRatio) / PRECISION;
      return { token: asset.tokenAddress, amount: amount.toString() };
    });

    return {
      lpTokensToMint: lpTokensToMint.toString(),
      shareOfPool,
      priceImpact: 0,
      requiredAmounts,
    };
  }

  async addLiquidity(
    poolId: string,
    ownerAddress: string,
    amounts: { token: string; amount: string }[],
    minLpTokens: string
  ): Promise<DexPosition> {
    await this.checkCircuitBreaker(poolId);

    const quote = await this.calculateAddLiquidityQuote(poolId, amounts);

    if (BigInt(quote.lpTokensToMint) < BigInt(minLpTokens)) {
      throw new Error("Minimum LP tokens not met");
    }

    const pool = await storage.getDexPoolById(poolId);
    if (!pool) throw new Error("Pool not found");

    for (const { token, amount } of amounts) {
      const assets = await storage.getDexPoolAssets(poolId);
      const asset = assets.find(a => a.tokenAddress === token);
      if (asset) {
        const newReserve = (BigInt(asset.reserve) + BigInt(amount)).toString();
        await storage.updateDexPoolAsset(asset.id, { reserve: newReserve });
      }
    }

    const newLpTokenSupply = (BigInt(pool.lpTokenSupply) + BigInt(quote.lpTokensToMint)).toString();
    
    const totalValueUsd = amounts.reduce((sum, { amount }) => {
      return sum + Number(amount) / 1e18;
    }, 0);

    await storage.updateDexPool(poolId, {
      lpTokenSupply: newLpTokenSupply,
      tvlUsd: (Number(pool.tvlUsd) + totalValueUsd).toFixed(2),
      lpCount: pool.lpCount + 1,
    });

    const positionData: InsertDexPosition = {
      poolId,
      ownerAddress,
      lpTokenAmount: quote.lpTokensToMint,
      liquidity: quote.lpTokensToMint,
      tickLower: -887272,
      tickUpper: 887272,
      amount0: amounts[0]?.amount || "0",
      amount1: amounts[1]?.amount || "0",
      valueUsd: totalValueUsd.toFixed(2),
      status: "active",
      isConcentrated: false,
    };

    const position = await storage.createDexPosition(positionData);

    await this.updateUserAnalytics(ownerAddress, "0", "0", "0", totalValueUsd);

    return position;
  }

  async calculateRemoveLiquidityQuote(
    positionId: string,
    percentageToRemove: number
  ): Promise<RemoveLiquidityQuote> {
    const position = await storage.getDexPositionById(positionId);
    if (!position) throw new Error("Position not found");

    const pool = await storage.getDexPoolById(position.poolId);
    if (!pool) throw new Error("Pool not found");

    const assets = await storage.getDexPoolAssets(position.poolId);

    const lpTokenAmount = BigInt(position.lpTokenAmount);
    const liquidityToRemove = (lpTokenAmount * BigInt(Math.floor(percentageToRemove * 100))) / BigInt(10000);
    const totalSupply = BigInt(pool.lpTokenSupply);

    const amountsOut = assets.map(asset => {
      const amount = (BigInt(asset.reserve) * liquidityToRemove) / totalSupply;
      return { token: asset.tokenAddress, amount: amount.toString() };
    });

    return {
      amountsOut,
      shareRedeemed: percentageToRemove,
    };
  }

  async removeLiquidity(
    positionId: string,
    percentageToRemove: number,
    minAmountsOut: { token: string; minAmount: string }[]
  ): Promise<{ position: DexPosition; amountsOut: { token: string; amount: string }[] }> {
    const position = await storage.getDexPositionById(positionId);
    if (!position) throw new Error("Position not found");

    await this.checkCircuitBreaker(position.poolId);

    const quote = await this.calculateRemoveLiquidityQuote(positionId, percentageToRemove);

    for (const { token, minAmount } of minAmountsOut) {
      const actualAmount = quote.amountsOut.find(a => a.token === token);
      if (!actualAmount || BigInt(actualAmount.amount) < BigInt(minAmount)) {
        throw new Error(`Minimum amount not met for ${token}`);
      }
    }

    const pool = await storage.getDexPoolById(position.poolId);
    if (!pool) throw new Error("Pool not found");

    for (const { token, amount } of quote.amountsOut) {
      const assets = await storage.getDexPoolAssets(position.poolId);
      const asset = assets.find(a => a.tokenAddress === token);
      if (asset) {
        const newReserve = (BigInt(asset.reserve) - BigInt(amount)).toString();
        await storage.updateDexPoolAsset(asset.id, { reserve: newReserve });
      }
    }

    const lpTokenAmount = BigInt(position.lpTokenAmount);
    const liquidityRemoved = (lpTokenAmount * BigInt(Math.floor(percentageToRemove * 100))) / BigInt(10000);
    const newLpTokenAmount = (lpTokenAmount - liquidityRemoved).toString();
    const newLpTokenSupply = (BigInt(pool.lpTokenSupply) - liquidityRemoved).toString();

    if (percentageToRemove >= 100) {
      await storage.closeDexPosition(positionId);
    } else {
      await storage.updateDexPosition(positionId, {
        lpTokenAmount: newLpTokenAmount,
        liquidity: newLpTokenAmount,
      });
    }

    await storage.updateDexPool(position.poolId, {
      lpTokenSupply: newLpTokenSupply,
    });

    const updatedPosition = (await storage.getDexPositionById(positionId))!;
    return { position: updatedPosition, amountsOut: quote.amountsOut };
  }

  private async checkCircuitBreaker(poolId: string): Promise<void> {
    const breaker = await storage.getDexCircuitBreaker(poolId);
    if (!breaker) return;

    const cachedState = this.circuitBreakerState.get(poolId);
    if (cachedState?.triggered && Date.now() < cachedState.cooldownEnd) {
      throw new Error("Circuit breaker is active - pool temporarily halted");
    }

    if (breaker.status === "triggered") {
      const cooldownEnd = breaker.cooldownEndsAt ? new Date(breaker.cooldownEndsAt).getTime() : 0;
      if (Date.now() < cooldownEnd) {
        this.circuitBreakerState.set(poolId, { triggered: true, cooldownEnd });
        throw new Error("Circuit breaker is active - pool temporarily halted");
      } else {
        await storage.updateDexCircuitBreaker(poolId, {
          status: "normal",
          triggerCount24h: 0,
        });
        this.circuitBreakerState.delete(poolId);
      }
    }
  }

  async triggerCircuitBreaker(poolId: string, reason: string): Promise<void> {
    const breaker = await storage.getDexCircuitBreaker(poolId);
    if (!breaker) return;

    const cooldownMs = breaker.cooldownDurationMinutes * 60 * 1000;
    const cooldownEndsAt = new Date(Date.now() + cooldownMs);

    await storage.updateDexCircuitBreaker(poolId, {
      status: "triggered",
      lastTriggeredAt: new Date(),
      cooldownEndsAt,
      triggerCount24h: breaker.triggerCount24h + 1,
      triggerCountAllTime: breaker.triggerCountAllTime + 1,
    });

    this.circuitBreakerState.set(poolId, {
      triggered: true,
      cooldownEnd: cooldownEndsAt.getTime(),
    });

    console.log(`[DEX] Circuit breaker triggered for pool ${poolId}: ${reason}`);
  }

  private async detectMevActivity(
    poolId: string,
    amountIn: string,
    priceImpact: number
  ): Promise<{ detected: boolean; type?: string; confidence?: number; estimatedValue?: string }> {
    const recentSwaps = await storage.getDexSwapsByPool(poolId, 10);

    if (priceImpact > 0.02) {
      const sandwichCandidates = recentSwaps.filter(swap => {
        const timeDiff = Math.abs(new Date(swap.createdAt).getTime() - Date.now());
        return timeDiff < 5000 && swap.traderAddress !== recentSwaps[0]?.traderAddress;
      });

      if (sandwichCandidates.length >= 2) {
        return {
          detected: true,
          type: "sandwich_detected",
          confidence: 70,
          estimatedValue: (Number(amountIn) * priceImpact).toString(),
        };
      }
    }

    const largeSwaps = recentSwaps.filter(swap => Number(swap.amountIn) > Number(amountIn) * 10);
    if (largeSwaps.length > 0) {
      return {
        detected: true,
        type: "frontrun_detected",
        confidence: 50,
        estimatedValue: (Number(amountIn) * priceImpact * 0.5).toString(),
      };
    }

    return { detected: false };
  }

  private async logMevEvent(
    poolId: string,
    mevCheck: { detected: boolean; type?: string; confidence?: number; estimatedValue?: string }
  ): Promise<void> {
    if (!mevCheck.detected) return;

    const eventData: InsertDexMevEvent = {
      poolId,
      eventType: mevCheck.type || "unknown",
      severity: (mevCheck.confidence || 0) > 80 ? "high" : (mevCheck.confidence || 0) > 50 ? "medium" : "low",
      estimatedLossUsd: mevCheck.estimatedValue || "0",
      preventedLossUsd: "0",
      detectionMethod: "ai_pattern",
      aiConfidence: mevCheck.confidence || 0,
      status: "detected",
    };

    await storage.createDexMevEvent(eventData);
  }

  private async updateTwapOracle(poolId: string, assets: DexPoolAsset[]): Promise<void> {
    if (assets.length < 2) return;

    const reserve0 = BigInt(assets[0].reserve);
    const reserve1 = BigInt(assets[1].reserve);
    
    if (reserve1 === BigInt(0)) return;

    const price = (reserve0 * PRECISION) / reserve1;

    const latestObservation = await storage.getLatestDexTwapObservation(poolId);
    const prevPrice0Cumulative = latestObservation ? BigInt(latestObservation.price0CumulativeX128) : BigInt(0);
    const timeDelta = latestObservation 
      ? Math.floor(Date.now() / 1000) - latestObservation.blockTimestamp
      : 1;

    const newPrice0Cumulative = prevPrice0Cumulative + (price * BigInt(timeDelta));
    const price1 = reserve1 > BigInt(0) ? (PRECISION * PRECISION / price) : BigInt(0);
    const prevPrice1Cumulative = latestObservation ? BigInt(latestObservation.price1CumulativeX128) : BigInt(0);
    const newPrice1Cumulative = prevPrice1Cumulative + (price1 * BigInt(timeDelta));

    const observationData: InsertDexTwapOracle = {
      poolId,
      blockTimestamp: Math.floor(Date.now() / 1000),
      tickCumulative: "0",
      secondsPerLiquidityCumulativeX128: "0",
      price0CumulativeX128: newPrice0Cumulative.toString(),
      price1CumulativeX128: newPrice1Cumulative.toString(),
      observationIndex: (latestObservation?.observationIndex || 0) + 1,
      initialized: true,
    };

    await storage.createDexTwapObservation(observationData);
  }

  private async updatePriceHistory(poolId: string, assets: DexPoolAsset[]): Promise<void> {
    if (assets.length < 2) return;

    const reserve0 = BigInt(assets[0].reserve);
    const reserve1 = BigInt(assets[1].reserve);
    
    if (reserve1 === BigInt(0)) return;

    const price = Number(reserve0) / Number(reserve1);
    const priceStr = price.toString();

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
    
    const priceData: InsertDexPriceHistory = {
      poolId,
      interval: "1h",
      periodStart,
      periodEnd: new Date(periodStart.getTime() + 3600000),
      open: priceStr,
      high: priceStr,
      low: priceStr,
      close: priceStr,
      volume: "0",
      volumeUsd: "0",
      tradeCount: 1,
      twap: priceStr,
    };

    await storage.createDexPriceHistory(priceData);
  }

  private async updateUserAnalytics(
    userAddress: string,
    volumeIn: string,
    volumeOut: string,
    fees: string,
    liquidityProvided: number = 0
  ): Promise<void> {
    let analytics = await storage.getDexUserAnalytics(userAddress);

    if (!analytics) {
      const insertData: InsertDexUserAnalytics = {
        userAddress,
        totalSwaps: 1,
        totalVolumeUsd: (Number(volumeIn) / 1e18).toFixed(2),
        totalFeePaid: (Number(fees) / 1e18).toFixed(4),
        totalLiquidityProvidedUsd: liquidityProvided.toFixed(2),
        totalFeesEarnedUsd: "0",
        firstTradeAt: new Date(),
        traderTier: "bronze",
        feeDiscount: 0,
      };
      await storage.createDexUserAnalytics(insertData);
    } else {
      await storage.updateDexUserAnalytics(userAddress, {
        totalSwaps: analytics.totalSwaps + 1,
        totalVolumeUsd: (Number(analytics.totalVolumeUsd) + Number(volumeIn) / 1e18).toFixed(2),
        totalFeePaid: (Number(analytics.totalFeePaid) + Number(fees) / 1e18).toFixed(4),
        totalLiquidityProvidedUsd: (Number(analytics.totalLiquidityProvidedUsd) + liquidityProvided).toFixed(2),
        lastTradeAt: new Date(),
      });
    }
  }

  async getAiPricePrediction(
    poolId: string
  ): Promise<{ price: number; confidence: number; direction: "up" | "down" | "stable"; timestamp: number }> {
    const cached = this.aiPredictionCache.get(poolId);
    if (cached && Date.now() - cached.timestamp < 60000) {
      return {
        ...cached,
        direction: cached.price > 0 ? "up" : cached.price < 0 ? "down" : "stable",
      };
    }

    const priceHistory = await storage.getDexPriceHistory(poolId, "1h", 24);
    
    if (priceHistory.length < 3) {
      return { price: 0, confidence: 10, direction: "stable", timestamp: Date.now() };
    }

    const prices = priceHistory.map(p => Number(p.close));
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const volatility = Math.sqrt(
      prices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / prices.length
    );

    const trend = (prices[0] - prices[prices.length - 1]) / prices[prices.length - 1];
    
    const prediction = {
      price: avgPrice * (1 + trend * 0.1),
      confidence: Math.max(10, Math.min(90, Math.floor((1 - volatility / avgPrice) * 100))),
      direction: trend > 0.01 ? "up" as const : trend < -0.01 ? "down" as const : "stable" as const,
      timestamp: Date.now(),
    };

    this.aiPredictionCache.set(poolId, {
      price: prediction.price,
      confidence: prediction.confidence,
      timestamp: prediction.timestamp,
    });

    return prediction;
  }

  async getOptimalSwapRoute(
    tokenIn: string,
    tokenOut: string,
    amountIn: string
  ): Promise<{ route: string[]; estimatedOutput: string; totalFees: string }> {
    const allPools = await storage.getAllDexPools(100);
    
    const directPools = allPools.filter(pool => pool.status === "active");
    
    let bestRoute: string[] = [];
    let bestOutput = BigInt(0);
    let bestFees = BigInt(0);

    for (const pool of directPools) {
      const assets = await storage.getDexPoolAssets(pool.id);
      const hasTokenIn = assets.some(a => a.tokenAddress === tokenIn);
      const hasTokenOut = assets.some(a => a.tokenAddress === tokenOut);

      if (hasTokenIn && hasTokenOut) {
        try {
          const quote = await this.calculateSwapQuote(pool.id, tokenIn, tokenOut, amountIn);
          const output = BigInt(quote.amountOut);
          
          if (output > bestOutput) {
            bestOutput = output;
            bestFees = BigInt(quote.fee);
            bestRoute = [pool.id];
          }
        } catch {
        }
      }
    }

    if (bestRoute.length === 0) {
      throw new Error("No valid swap route found");
    }

    return {
      route: bestRoute,
      estimatedOutput: bestOutput.toString(),
      totalFees: bestFees.toString(),
    };
  }

  async createPool(poolData: InsertDexPool): Promise<DexPool> {
    return storage.createDexPool(poolData);
  }

  async addPoolAsset(assetData: InsertDexPoolAsset): Promise<DexPoolAsset> {
    return storage.createDexPoolAsset(assetData);
  }

  async getPoolMetrics(poolId: string): Promise<PoolMetrics | null> {
    const pool = await storage.getDexPoolById(poolId);
    if (!pool) return null;

    const priceHistory = await storage.getDexPriceHistory(poolId, "1h", 24);
    const prices = priceHistory.map(p => Number(p.close));
    
    let volatility = 0;
    if (prices.length > 1) {
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      volatility = Math.sqrt(
        prices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / prices.length
      ) / avgPrice;
    }

    const tvl = Number(pool.tvlUsd);
    const volume24h = Number(pool.volume24h);
    const fees24h = Number(pool.fees24h);

    const apy = tvl > 0 ? (fees24h * 365 / tvl) * 100 : 0;
    const utilizationRate = tvl > 0 ? (volume24h / tvl) * 100 : 0;

    return {
      poolId,
      tvlUsd: pool.tvlUsd,
      volume24h: pool.volume24h,
      fees24h: pool.fees24h,
      apy,
      volatility: volatility * 100,
      utilizationRate,
    };
  }

  async getDexStats(): Promise<{
    totalPools: number;
    totalTvlUsd: string;
    totalVolume24h: string;
    totalFees24h: string;
    totalSwaps24h: number;
    totalLiquidityProviders: number;
  }> {
    return storage.getDexStats();
  }

  private sqrt(value: bigint): bigint {
    if (value < BigInt(0)) throw new Error("Square root of negative number");
    if (value < BigInt(2)) return value;
    
    let x = value;
    let y = (x + BigInt(1)) / BigInt(2);
    
    while (y < x) {
      x = y;
      y = (x + value / x) / BigInt(2);
    }
    
    return x;
  }
}

export const dexService = new DexService();
