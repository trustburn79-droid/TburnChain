import { storage } from "../storage";
import type {
  LiquidStakingPool,
  InsertLiquidStakingPool,
  ValidatorBasket,
  InsertValidatorBasket,
  LstPosition,
  InsertLstPosition,
  LstTransaction,
  InsertLstTransaction,
  RebaseHistory,
  InsertRebaseHistory,
} from "@shared/schema";

const PRECISION = BigInt(10 ** 18);
const BASIS_POINTS = 10000;

export class LiquidStakingService {
  
  // ============================================
  // POOL MANAGEMENT
  // ============================================

  async getAllPools(): Promise<LiquidStakingPool[]> {
    return await storage.getAllLiquidStakingPools();
  }

  async getActivePools(): Promise<LiquidStakingPool[]> {
    return await storage.getActiveLiquidStakingPools();
  }

  async getPoolById(id: string): Promise<LiquidStakingPool | undefined> {
    return await storage.getLiquidStakingPoolById(id);
  }

  async createPool(data: InsertLiquidStakingPool): Promise<LiquidStakingPool> {
    return await storage.createLiquidStakingPool(data);
  }

  async updatePool(id: string, data: Partial<LiquidStakingPool>): Promise<void> {
    await storage.updateLiquidStakingPool(id, data);
  }

  // ============================================
  // VALIDATOR BASKET MANAGEMENT
  // ============================================

  async getPoolBaskets(poolId: string): Promise<ValidatorBasket[]> {
    return await storage.getValidatorBasketsByPool(poolId);
  }

  async createBasket(data: InsertValidatorBasket): Promise<ValidatorBasket> {
    return await storage.createValidatorBasket(data);
  }

  async updateBasket(id: string, data: Partial<ValidatorBasket>): Promise<void> {
    await storage.updateValidatorBasket(id, data);
  }

  // ============================================
  // POSITION MANAGEMENT
  // ============================================

  async getUserPositions(userAddress: string): Promise<LstPosition[]> {
    return await storage.getLstPositionsByUser(userAddress);
  }

  async getPoolPositions(poolId: string): Promise<LstPosition[]> {
    return await storage.getLstPositionsByPool(poolId);
  }

  async getPosition(userAddress: string, poolId: string): Promise<LstPosition | undefined> {
    return await storage.getLstPosition(userAddress, poolId);
  }

  // ============================================
  // MINT OPERATION (Stake underlying, receive LST)
  // ============================================

  async mint(
    userAddress: string,
    poolId: string,
    underlyingAmount: string
  ): Promise<{ position: LstPosition; lstReceived: string; txId: string }> {
    const pool = await storage.getLiquidStakingPoolById(poolId);
    if (!pool) {
      throw new Error("Pool not found");
    }
    if (pool.status !== "active" || pool.isPaused) {
      throw new Error("Pool is not active");
    }

    const amount = BigInt(underlyingAmount);
    const minMint = BigInt(pool.minMintAmount);
    if (amount < minMint) {
      throw new Error(`Minimum mint amount is ${pool.minMintAmount}`);
    }

    if (pool.stakingCap) {
      const currentStaked = BigInt(pool.totalStaked);
      const cap = BigInt(pool.stakingCap);
      if (currentStaked + amount > cap) {
        throw new Error("Mint would exceed pool staking cap");
      }
    }

    const mintFee = (amount * BigInt(pool.mintFee)) / BigInt(BASIS_POINTS);
    const netAmount = amount - mintFee;

    const exchangeRate = BigInt(pool.exchangeRate);
    const lstReceived = (netAmount * PRECISION) / exchangeRate;

    let position = await storage.getLstPosition(userAddress, poolId);
    
    if (position) {
      const newBalance = BigInt(position.lstBalance) + lstReceived;
      const newUnderlyingValue = (newBalance * exchangeRate) / PRECISION;
      const oldTotalMinted = BigInt(position.totalMinted);
      const newTotalMinted = oldTotalMinted + netAmount;
      const newAvgPrice = newTotalMinted > 0 ? (newTotalMinted * PRECISION) / newBalance : exchangeRate;
      
      await storage.updateLstPosition(position.id, {
        lstBalance: newBalance.toString(),
        underlyingValue: newUnderlyingValue.toString(),
        totalMinted: newTotalMinted.toString(),
        avgMintPrice: newAvgPrice.toString(),
        mintCount: position.mintCount + 1,
        lastMintAt: new Date(),
      });
      
      position = (await storage.getLstPositionById(position.id))!;
    } else {
      position = await storage.createLstPosition({
        poolId,
        userAddress,
        lstBalance: lstReceived.toString(),
        lstBalanceUsd: "0",
        underlyingValue: netAmount.toString(),
        underlyingValueUsd: "0",
        totalMinted: netAmount.toString(),
        totalRedeemed: "0",
        avgMintPrice: exchangeRate.toString(),
        accumulatedRewards: "0",
        claimedRewards: "0",
        pendingRewards: "0",
        mintCount: 1,
        redeemCount: 0,
        lastMintAt: new Date(),
        status: "active",
      });
    }

    const newTotalStaked = BigInt(pool.totalStaked) + netAmount;
    const newTotalLstMinted = BigInt(pool.totalLstMinted) + lstReceived;
    const positions = await storage.getLstPositionsByPool(poolId);
    
    await storage.updateLiquidStakingPool(poolId, {
      totalStaked: newTotalStaked.toString(),
      totalLstMinted: newTotalLstMinted.toString(),
      totalStakers: positions.length,
      mints24h: (BigInt(pool.mints24h) + netAmount).toString(),
    });

    const tx = await storage.createLstTransaction({
      poolId,
      positionId: position.id,
      userAddress,
      txType: "mint",
      underlyingAmount: netAmount.toString(),
      lstAmount: lstReceived.toString(),
      exchangeRateAtTx: pool.exchangeRate,
      valueUsd: "0",
      feeAmount: mintFee.toString(),
      feeType: "mint",
      status: "completed",
    });

    return { position, lstReceived: lstReceived.toString(), txId: tx.id };
  }

  // ============================================
  // REDEEM OPERATION (Burn LST, receive underlying)
  // ============================================

  async redeem(
    userAddress: string,
    poolId: string,
    lstAmount: string
  ): Promise<{ underlyingReceived: string; fee: string; txId: string }> {
    const pool = await storage.getLiquidStakingPoolById(poolId);
    if (!pool) {
      throw new Error("Pool not found");
    }

    const position = await storage.getLstPosition(userAddress, poolId);
    if (!position) {
      throw new Error("Position not found");
    }

    const redeemLst = BigInt(lstAmount);
    const positionBalance = BigInt(position.lstBalance);
    if (redeemLst > positionBalance) {
      throw new Error("Insufficient LST balance");
    }

    const exchangeRate = BigInt(pool.exchangeRate);
    const grossUnderlying = (redeemLst * exchangeRate) / PRECISION;

    const redeemFee = (grossUnderlying * BigInt(pool.redeemFee)) / BigInt(BASIS_POINTS);
    const netUnderlying = grossUnderlying - redeemFee;

    const newLstBalance = positionBalance - redeemLst;
    const newUnderlyingValue = (newLstBalance * exchangeRate) / PRECISION;

    if (newLstBalance === BigInt(0)) {
      await storage.updateLstPosition(position.id, {
        lstBalance: "0",
        underlyingValue: "0",
        totalRedeemed: (BigInt(position.totalRedeemed) + grossUnderlying).toString(),
        redeemCount: position.redeemCount + 1,
        lastRedeemAt: new Date(),
        status: "redeemed",
      });
    } else {
      await storage.updateLstPosition(position.id, {
        lstBalance: newLstBalance.toString(),
        underlyingValue: newUnderlyingValue.toString(),
        totalRedeemed: (BigInt(position.totalRedeemed) + grossUnderlying).toString(),
        redeemCount: position.redeemCount + 1,
        lastRedeemAt: new Date(),
      });
    }

    const newTotalStaked = BigInt(pool.totalStaked) - grossUnderlying;
    const newTotalLstMinted = BigInt(pool.totalLstMinted) - redeemLst;
    const activePositions = (await storage.getLstPositionsByPool(poolId)).filter(p => p.status === "active");
    
    await storage.updateLiquidStakingPool(poolId, {
      totalStaked: newTotalStaked.toString(),
      totalLstMinted: newTotalLstMinted.toString(),
      totalStakers: activePositions.length,
      redeems24h: (BigInt(pool.redeems24h) + netUnderlying).toString(),
    });

    const tx = await storage.createLstTransaction({
      poolId,
      positionId: position.id,
      userAddress,
      txType: "redeem",
      underlyingAmount: netUnderlying.toString(),
      lstAmount: lstAmount,
      exchangeRateAtTx: pool.exchangeRate,
      valueUsd: "0",
      feeAmount: redeemFee.toString(),
      feeType: "redeem",
      status: "completed",
    });

    return { underlyingReceived: netUnderlying.toString(), fee: redeemFee.toString(), txId: tx.id };
  }

  // ============================================
  // REBASE OPERATION (Update exchange rate with rewards)
  // ============================================

  async rebase(
    poolId: string,
    rewardsFromValidators: string,
    rewardsFromMev: string = "0",
    slashingPenalty: string = "0",
    slashedValidators: number = 0
  ): Promise<RebaseHistory> {
    const pool = await storage.getLiquidStakingPoolById(poolId);
    if (!pool) {
      throw new Error("Pool not found");
    }

    const totalRewards = BigInt(rewardsFromValidators) + BigInt(rewardsFromMev);
    const totalSlashing = BigInt(slashingPenalty);
    const netRewards = totalRewards - totalSlashing;

    const performanceFee = (netRewards * BigInt(pool.performanceFee)) / BigInt(BASIS_POINTS);
    const protocolFee = (netRewards * BigInt(pool.protocolFee)) / BigInt(BASIS_POINTS);
    const distributedRewards = netRewards - performanceFee - protocolFee;

    const previousRate = BigInt(pool.exchangeRate);
    const totalLst = BigInt(pool.totalLstMinted);
    
    let newRate = previousRate;
    if (totalLst > BigInt(0)) {
      const rateIncrease = (distributedRewards * PRECISION) / totalLst;
      newRate = previousRate + rateIncrease;
    }

    const rateChange = newRate - previousRate;
    const rateChangePercent = previousRate > BigInt(0) 
      ? Number((rateChange * BigInt(BASIS_POINTS)) / previousRate)
      : 0;

    await storage.updateLiquidStakingPool(poolId, {
      exchangeRate: newRate.toString(),
      exchangeRatePrevious: previousRate.toString(),
      lastRebaseAt: new Date(),
      totalRewardsGenerated: (BigInt(pool.totalRewardsGenerated) + distributedRewards).toString(),
    });

    const history = await storage.createRebaseHistory({
      poolId,
      previousRate: previousRate.toString(),
      newRate: newRate.toString(),
      rateChange: rateChange.toString(),
      rateChangePercent,
      rewardsDistributed: distributedRewards.toString(),
      rewardsFromValidators,
      rewardsFromMev,
      slashingPenalty,
      slashedValidators,
      totalStakedAtRebase: pool.totalStaked,
      totalLstAtRebase: pool.totalLstMinted,
      aiOptimized: pool.aiOptimized,
      aiOptimizationScore: pool.aiOptimized ? 8500 : undefined,
    });

    return history;
  }

  // ============================================
  // CLAIM REWARDS
  // ============================================

  async claimRewards(userAddress: string, poolId: string): Promise<{ amount: string; txId: string }> {
    const position = await storage.getLstPosition(userAddress, poolId);
    if (!position) {
      throw new Error("Position not found");
    }

    const pendingRewards = BigInt(position.pendingRewards);
    if (pendingRewards === BigInt(0)) {
      throw new Error("No rewards to claim");
    }

    await storage.updateLstPosition(position.id, {
      pendingRewards: "0",
      claimedRewards: (BigInt(position.claimedRewards) + pendingRewards).toString(),
    });

    const pool = await storage.getLiquidStakingPoolById(poolId);
    const tx = await storage.createLstTransaction({
      poolId,
      positionId: position.id,
      userAddress,
      txType: "claim_rewards",
      underlyingAmount: pendingRewards.toString(),
      lstAmount: "0",
      exchangeRateAtTx: pool?.exchangeRate || "1000000000000000000",
      valueUsd: "0",
      feeAmount: "0",
      status: "completed",
    });

    return { amount: pendingRewards.toString(), txId: tx.id };
  }

  // ============================================
  // EXCHANGE RATE CALCULATIONS
  // ============================================

  calculateLstFromUnderlying(underlying: string, exchangeRate: string): string {
    const underlyingAmount = BigInt(underlying);
    const rate = BigInt(exchangeRate);
    return ((underlyingAmount * PRECISION) / rate).toString();
  }

  calculateUnderlyingFromLst(lst: string, exchangeRate: string): string {
    const lstAmount = BigInt(lst);
    const rate = BigInt(exchangeRate);
    return ((lstAmount * rate) / PRECISION).toString();
  }

  // ============================================
  // STATISTICS & ANALYTICS
  // ============================================

  async getProtocolStats(): Promise<{
    totalStakedUsd: string;
    totalPools: number;
    activePools: number;
    totalStakers: number;
    avgPoolApy: number;
    topPoolApy: number;
    totalLstMinted: string;
    mints24h: string;
    redeems24h: string;
  }> {
    return await storage.getLiquidStakingStats();
  }

  async getPoolStats(poolId: string): Promise<{
    totalStaked: string;
    totalStakedUsd: string;
    exchangeRate: string;
    currentApy: number;
    totalStakers: number;
    totalLstMinted: string;
    validatorCount: number;
    lastRebaseAt: Date | null;
  }> {
    const pool = await storage.getLiquidStakingPoolById(poolId);
    if (!pool) {
      throw new Error("Pool not found");
    }

    return {
      totalStaked: pool.totalStaked,
      totalStakedUsd: pool.totalStakedUsd,
      exchangeRate: pool.exchangeRate,
      currentApy: pool.currentApy,
      totalStakers: pool.totalStakers,
      totalLstMinted: pool.totalLstMinted,
      validatorCount: pool.validatorCount,
      lastRebaseAt: pool.lastRebaseAt,
    };
  }

  async getUserStats(userAddress: string): Promise<{
    totalLstBalance: string;
    totalUnderlyingValue: string;
    pendingRewards: string;
    positionsCount: number;
  }> {
    const positions = await storage.getLstPositionsByUser(userAddress);
    
    let totalLst = BigInt(0);
    let totalUnderlying = BigInt(0);
    let pendingRewards = BigInt(0);

    for (const position of positions) {
      if (position.status === "active") {
        totalLst += BigInt(position.lstBalance);
        totalUnderlying += BigInt(position.underlyingValue);
        pendingRewards += BigInt(position.pendingRewards);
      }
    }

    return {
      totalLstBalance: totalLst.toString(),
      totalUnderlyingValue: totalUnderlying.toString(),
      pendingRewards: pendingRewards.toString(),
      positionsCount: positions.filter(p => p.status === "active").length,
    };
  }

  async getRecentTransactions(limit: number = 50): Promise<LstTransaction[]> {
    return await storage.getRecentLstTransactions(limit);
  }

  async getRecentRebases(limit: number = 20): Promise<RebaseHistory[]> {
    return await storage.getRecentRebaseHistory(limit);
  }
}

export const liquidStakingService = new LiquidStakingService();
