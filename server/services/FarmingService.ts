import { storage } from "../storage";
import type {
  YieldVault,
  InsertYieldVault,
  YieldStrategy,
  InsertYieldStrategy,
  YieldPosition,
  InsertYieldPosition,
  YieldHarvest,
  InsertYieldHarvest,
  YieldTransaction,
  InsertYieldTransaction,
} from "@shared/schema";

const PRECISION = BigInt(10 ** 18);
const BASIS_POINTS = 10000;
const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;

export class FarmingService {
  
  // ============================================
  // VAULT MANAGEMENT
  // ============================================

  async getAllVaults(): Promise<YieldVault[]> {
    return await storage.getAllYieldVaults();
  }

  async getActiveVaults(): Promise<YieldVault[]> {
    return await storage.getActiveYieldVaults();
  }

  async getVaultById(id: string): Promise<YieldVault | undefined> {
    return await storage.getYieldVaultById(id);
  }

  async getVaultsByType(vaultType: string): Promise<YieldVault[]> {
    return await storage.getYieldVaultsByType(vaultType);
  }

  async createVault(data: InsertYieldVault): Promise<YieldVault> {
    return await storage.createYieldVault(data);
  }

  async updateVault(id: string, data: Partial<YieldVault>): Promise<void> {
    await storage.updateYieldVault(id, data);
  }

  // ============================================
  // STRATEGY MANAGEMENT
  // ============================================

  async getStrategiesForVault(vaultId: string): Promise<YieldStrategy[]> {
    return await storage.getYieldStrategiesByVault(vaultId);
  }

  async createStrategy(data: InsertYieldStrategy): Promise<YieldStrategy> {
    return await storage.createYieldStrategy(data);
  }

  async updateStrategy(id: string, data: Partial<YieldStrategy>): Promise<void> {
    await storage.updateYieldStrategy(id, data);
  }

  // ============================================
  // POSITION MANAGEMENT
  // ============================================

  async getUserPositions(userAddress: string): Promise<YieldPosition[]> {
    return await storage.getYieldPositionsByUser(userAddress);
  }

  async getVaultPositions(vaultId: string): Promise<YieldPosition[]> {
    return await storage.getYieldPositionsByVault(vaultId);
  }

  async getPosition(userAddress: string, vaultId: string): Promise<YieldPosition | undefined> {
    return await storage.getYieldPosition(userAddress, vaultId);
  }

  // ============================================
  // CORE OPERATIONS
  // ============================================

  async deposit(
    userAddress: string,
    vaultId: string,
    amount: string,
    lockDays: number = 0
  ): Promise<{ position: YieldPosition; shares: string; txId: string }> {
    const vault = await storage.getYieldVaultById(vaultId);
    if (!vault) {
      throw new Error("Vault not found");
    }
    if (vault.status !== "active") {
      throw new Error("Vault is not active");
    }

    const depositAmount = BigInt(amount);
    const minDeposit = BigInt(vault.minDeposit || "0");
    if (depositAmount < minDeposit) {
      throw new Error(`Minimum deposit is ${vault.minDeposit}`);
    }

    if (vault.depositCap) {
      const currentTvl = BigInt(vault.totalDeposited);
      const cap = BigInt(vault.depositCap);
      if (currentTvl + depositAmount > cap) {
        throw new Error("Deposit would exceed vault cap");
      }
    }

    const sharePrice = BigInt(vault.sharePrice);
    const shares = (depositAmount * PRECISION) / sharePrice;

    const depositFee = (depositAmount * BigInt(vault.depositFee)) / BigInt(BASIS_POINTS);
    const netDeposit = depositAmount - depositFee;

    let position = await storage.getYieldPosition(userAddress, vaultId);
    
    if (position) {
      const newShares = BigInt(position.shares) + shares;
      const newDeposited = BigInt(position.depositedAmount) + netDeposit;
      const newValue = (newShares * sharePrice) / PRECISION;
      
      await storage.updateYieldPosition(position.id, {
        shares: newShares.toString(),
        depositedAmount: newDeposited.toString(),
        currentValue: newValue.toString(),
        depositCount: position.depositCount + 1,
        lastDepositAt: new Date(),
        isLocked: lockDays > 0,
        lockDurationDays: lockDays > 0 ? lockDays : position.lockDurationDays,
        lockEndTime: lockDays > 0 ? new Date(Date.now() + lockDays * 24 * 60 * 60 * 1000) : position.lockEndTime,
      });
      
      position = (await storage.getYieldPositionById(position.id))!;
    } else {
      const newValue = (shares * sharePrice) / PRECISION;
      position = await storage.createYieldPosition({
        vaultId,
        userAddress,
        depositedAmount: netDeposit.toString(),
        shares: shares.toString(),
        currentValue: newValue.toString(),
        currentValueUsd: "0",
        totalProfit: "0",
        totalProfitUsd: "0",
        unrealizedProfit: "0",
        realizedProfit: "0",
        pendingRewards: "0",
        claimedRewards: "0",
        boostMultiplier: lockDays > 0 ? this.calculateBoostMultiplier(lockDays) : BASIS_POINTS,
        isLocked: lockDays > 0,
        lockDurationDays: lockDays,
        lockEndTime: lockDays > 0 ? new Date(Date.now() + lockDays * 24 * 60 * 60 * 1000) : undefined,
        depositCount: 1,
        withdrawCount: 0,
        lastDepositAt: new Date(),
        status: "active",
      });
    }

    const newTotalDeposited = BigInt(vault.totalDeposited) + netDeposit;
    const newTotalShares = BigInt(vault.totalShares) + shares;
    const positions = await storage.getYieldPositionsByVault(vaultId);
    
    await storage.updateYieldVault(vaultId, {
      totalDeposited: newTotalDeposited.toString(),
      totalShares: newTotalShares.toString(),
      totalDepositors: positions.length,
      deposits24h: (BigInt(vault.deposits24h) + netDeposit).toString(),
    });

    const tx = await storage.createYieldTransaction({
      vaultId,
      positionId: position.id,
      userAddress,
      txType: "deposit",
      amount: netDeposit.toString(),
      shares: shares.toString(),
      valueUsd: "0",
      sharePriceAtTx: vault.sharePrice,
      feeAmount: depositFee.toString(),
      feeType: depositFee > 0 ? "deposit" : undefined,
      status: "completed",
    });

    return { position, shares: shares.toString(), txId: tx.id };
  }

  async withdraw(
    userAddress: string,
    vaultId: string,
    shares: string
  ): Promise<{ amount: string; fee: string; txId: string }> {
    const vault = await storage.getYieldVaultById(vaultId);
    if (!vault) {
      throw new Error("Vault not found");
    }

    const position = await storage.getYieldPosition(userAddress, vaultId);
    if (!position) {
      throw new Error("Position not found");
    }

    const withdrawShares = BigInt(shares);
    const positionShares = BigInt(position.shares);
    if (withdrawShares > positionShares) {
      throw new Error("Insufficient shares");
    }

    if (position.isLocked && position.lockEndTime && new Date(position.lockEndTime) > new Date()) {
      throw new Error("Position is locked");
    }

    const sharePrice = BigInt(vault.sharePrice);
    const grossAmount = (withdrawShares * sharePrice) / PRECISION;

    const withdrawalFee = (grossAmount * BigInt(vault.withdrawalFee)) / BigInt(BASIS_POINTS);
    const netAmount = grossAmount - withdrawalFee;

    const newShares = positionShares - withdrawShares;
    const newValue = (newShares * sharePrice) / PRECISION;

    const originalDeposit = BigInt(position.depositedAmount);
    const proportionWithdrawn = (withdrawShares * PRECISION) / positionShares;
    const depositWithdrawn = (originalDeposit * proportionWithdrawn) / PRECISION;
    const newDeposited = originalDeposit - depositWithdrawn;

    const realizedProfit = grossAmount > depositWithdrawn ? grossAmount - depositWithdrawn : BigInt(0);

    if (newShares === BigInt(0)) {
      await storage.updateYieldPosition(position.id, {
        shares: "0",
        depositedAmount: "0",
        currentValue: "0",
        realizedProfit: (BigInt(position.realizedProfit) + realizedProfit).toString(),
        withdrawCount: position.withdrawCount + 1,
        lastWithdrawAt: new Date(),
        status: "withdrawn",
      });
    } else {
      await storage.updateYieldPosition(position.id, {
        shares: newShares.toString(),
        depositedAmount: newDeposited.toString(),
        currentValue: newValue.toString(),
        realizedProfit: (BigInt(position.realizedProfit) + realizedProfit).toString(),
        withdrawCount: position.withdrawCount + 1,
        lastWithdrawAt: new Date(),
      });
    }

    const newTotalDeposited = BigInt(vault.totalDeposited) - grossAmount;
    const newTotalShares = BigInt(vault.totalShares) - withdrawShares;
    const activePositions = (await storage.getYieldPositionsByVault(vaultId)).filter(p => p.status === "active");
    
    await storage.updateYieldVault(vaultId, {
      totalDeposited: newTotalDeposited.toString(),
      totalShares: newTotalShares.toString(),
      totalDepositors: activePositions.length,
      withdrawals24h: (BigInt(vault.withdrawals24h) + netAmount).toString(),
    });

    const tx = await storage.createYieldTransaction({
      vaultId,
      positionId: position.id,
      userAddress,
      txType: "withdraw",
      amount: netAmount.toString(),
      shares: shares,
      valueUsd: "0",
      sharePriceAtTx: vault.sharePrice,
      feeAmount: withdrawalFee.toString(),
      feeType: withdrawalFee > 0 ? "withdrawal" : undefined,
      status: "completed",
    });

    return { amount: netAmount.toString(), fee: withdrawalFee.toString(), txId: tx.id };
  }

  async claimRewards(userAddress: string, vaultId: string): Promise<{ amount: string; txId: string }> {
    const position = await storage.getYieldPosition(userAddress, vaultId);
    if (!position) {
      throw new Error("Position not found");
    }

    const pendingRewards = BigInt(position.pendingRewards);
    if (pendingRewards === BigInt(0)) {
      throw new Error("No rewards to claim");
    }

    await storage.updateYieldPosition(position.id, {
      pendingRewards: "0",
      claimedRewards: (BigInt(position.claimedRewards) + pendingRewards).toString(),
    });

    const vault = await storage.getYieldVaultById(vaultId);
    const tx = await storage.createYieldTransaction({
      vaultId,
      positionId: position.id,
      userAddress,
      txType: "claim_rewards",
      amount: pendingRewards.toString(),
      shares: "0",
      valueUsd: "0",
      sharePriceAtTx: vault?.sharePrice || "1000000000000000000",
      feeAmount: "0",
      status: "completed",
    });

    return { amount: pendingRewards.toString(), txId: tx.id };
  }

  // ============================================
  // HARVEST OPERATIONS
  // ============================================

  async harvestVault(vaultId: string, executorAddress: string): Promise<YieldHarvest> {
    const vault = await storage.getYieldVaultById(vaultId);
    if (!vault) {
      throw new Error("Vault not found");
    }

    const strategies = await storage.getYieldStrategiesByVault(vaultId);
    let totalProfit = BigInt(0);

    for (const strategy of strategies) {
      if (strategy.isActive) {
        const strategyProfit = await this.calculateStrategyProfit(strategy);
        totalProfit += strategyProfit;
      }
    }

    if (totalProfit <= BigInt(0)) {
      throw new Error("No profit to harvest");
    }

    const performanceFee = (totalProfit * BigInt(vault.performanceFee)) / BigInt(BASIS_POINTS);
    const callerReward = (performanceFee * BigInt(100)) / BigInt(BASIS_POINTS);
    const netProfit = totalProfit - performanceFee;

    const oldSharePrice = BigInt(vault.sharePrice);
    const totalShares = BigInt(vault.totalShares);
    const newSharePrice = totalShares > 0 
      ? oldSharePrice + ((netProfit * PRECISION) / totalShares)
      : oldSharePrice;

    await storage.updateYieldVault(vaultId, {
      sharePrice: newSharePrice.toString(),
      totalDeposited: (BigInt(vault.totalDeposited) + netProfit).toString(),
      harvestCount: vault.harvestCount + 1,
      lastHarvestAt: new Date(),
    });

    const harvest = await storage.createYieldHarvest({
      vaultId,
      harvestType: "auto_compound",
      harvestedAmount: totalProfit.toString(),
      harvestedValueUsd: "0",
      compoundedAmount: netProfit.toString(),
      newSharePrice: newSharePrice.toString(),
      oldSharePrice: oldSharePrice.toString(),
      performanceFeeAmount: performanceFee.toString(),
      callerReward: callerReward.toString(),
      executorAddress,
      gasUsed: 150000,
      aiTriggered: vault.aiOptimized,
      aiOptimalityScore: vault.aiOptimized ? 8500 : undefined,
    });

    return harvest;
  }

  private async calculateStrategyProfit(strategy: YieldStrategy): Promise<bigint> {
    const currentValue = BigInt(strategy.currentValue);
    const apy = strategy.currentApy;
    const daysSinceLastExec = strategy.lastExecutionAt 
      ? Math.floor((Date.now() - new Date(strategy.lastExecutionAt).getTime()) / (24 * 60 * 60 * 1000))
      : 1;
    
    const dailyRate = apy / 365;
    const profit = (currentValue * BigInt(dailyRate) * BigInt(daysSinceLastExec)) / BigInt(BASIS_POINTS);
    
    return profit;
  }

  // ============================================
  // APY CALCULATIONS
  // ============================================

  calculateVaultApy(vault: YieldVault, dexPool?: any, lendingMarket?: any): number {
    let baseApy = vault.baseApy;

    if (vault.dexPoolId && dexPool) {
      const dexApy = dexPool.totalApy || 0;
      baseApy += dexApy;
    }

    if (vault.lendingMarketId && lendingMarket) {
      const lendingApy = lendingMarket.supplyRate || 0;
      baseApy += lendingApy;
    }

    const boostApy = vault.boostApy || 0;
    const rewardApy = vault.rewardApy || 0;

    return baseApy + boostApy + rewardApy;
  }

  calculateBoostMultiplier(lockDays: number): number {
    if (lockDays <= 0) return BASIS_POINTS;
    if (lockDays <= 7) return BASIS_POINTS + 500;
    if (lockDays <= 30) return BASIS_POINTS + 1500;
    if (lockDays <= 90) return BASIS_POINTS + 3000;
    if (lockDays <= 180) return BASIS_POINTS + 5000;
    if (lockDays <= 365) return BASIS_POINTS + 7500;
    return BASIS_POINTS + 10000;
  }

  calculateUserEffectiveApy(position: YieldPosition, vault: YieldVault): number {
    const baseApy = vault.totalApy;
    const boostMultiplier = position.boostMultiplier;
    return (baseApy * boostMultiplier) / BASIS_POINTS;
  }

  // ============================================
  // STATISTICS & ANALYTICS
  // ============================================

  async getProtocolStats(): Promise<{
    totalTvlUsd: string;
    totalVaults: number;
    activeVaults: number;
    totalUsers: number;
    avgVaultApy: number;
    topVaultApy: number;
    totalProfitGenerated: string;
    deposits24h: string;
    withdrawals24h: string;
  }> {
    return await storage.getYieldFarmingStats();
  }

  async getVaultStats(vaultId: string): Promise<{
    tvl: string;
    tvlUsd: string;
    sharePrice: string;
    totalApy: number;
    depositors: number;
    deposits24h: string;
    withdrawals24h: string;
    harvestCount: number;
    lastHarvest: Date | null;
  }> {
    const vault = await storage.getYieldVaultById(vaultId);
    if (!vault) {
      throw new Error("Vault not found");
    }

    return {
      tvl: vault.totalDeposited,
      tvlUsd: vault.tvlUsd,
      sharePrice: vault.sharePrice,
      totalApy: vault.totalApy,
      depositors: vault.totalDepositors,
      deposits24h: vault.deposits24h,
      withdrawals24h: vault.withdrawals24h,
      harvestCount: vault.harvestCount,
      lastHarvest: vault.lastHarvestAt,
    };
  }

  async getUserStats(userAddress: string): Promise<{
    totalDeposited: string;
    totalValue: string;
    totalProfit: string;
    pendingRewards: string;
    positionsCount: number;
  }> {
    const positions = await storage.getYieldPositionsByUser(userAddress);
    
    let totalDeposited = BigInt(0);
    let totalValue = BigInt(0);
    let totalProfit = BigInt(0);
    let pendingRewards = BigInt(0);

    for (const position of positions) {
      if (position.status === "active") {
        totalDeposited += BigInt(position.depositedAmount);
        totalValue += BigInt(position.currentValue);
        totalProfit += BigInt(position.totalProfit);
        pendingRewards += BigInt(position.pendingRewards);
      }
    }

    return {
      totalDeposited: totalDeposited.toString(),
      totalValue: totalValue.toString(),
      totalProfit: totalProfit.toString(),
      pendingRewards: pendingRewards.toString(),
      positionsCount: positions.filter(p => p.status === "active").length,
    };
  }

  async getRecentTransactions(limit: number = 50): Promise<YieldTransaction[]> {
    return await storage.getRecentYieldTransactions(limit);
  }

  async getRecentHarvests(limit: number = 20): Promise<YieldHarvest[]> {
    return await storage.getRecentYieldHarvests(limit);
  }
}

export const farmingService = new FarmingService();
