import { storage } from "../storage";
import { 
  StakingPosition, 
  StakingDelegation, 
  UnbondingRequest, 
  RewardEvent,
  StakingPool,
  Validator
} from "@shared/schema";

export interface PortfolioSummary {
  totalStaked: string;
  totalPendingRewards: string;
  totalEarned: string;
  totalUnbonding: string;
  totalPortfolioValue: string;
  avgApy: string;
  activePositions: number;
  unbondingPositions: number;
  autoCompoundEnabled: boolean;
}

export interface PortfolioPosition {
  id: string;
  validatorId: string;
  validatorName: string;
  validatorAddress: string;
  validatorCommission: string;
  stakedAmount: string;
  currentApy: string;
  pendingRewards: string;
  dailyReward: string;
  validatorRiskScore: string;
  sourceType: "delegation" | "pool";
  poolId?: string;
}

export interface UnbondingPosition {
  id: string;
  validatorId: string;
  validatorName: string;
  amount: string;
  startTime: Date;
  endTime: Date;
  remainingDays: number;
  remainingHours: number;
  progressPercent: string;
  status: "pending" | "ready";
  canEmergencyUnstake: boolean;
  emergencyPenalty: string;
}

export interface StakingPortfolioResponse {
  summary: PortfolioSummary;
  positions: PortfolioPosition[];
  unbonding: UnbondingPosition[];
  rewardHistory: RewardEvent[];
}

const UNBONDING_PERIOD_DAYS = 21;
const EMERGENCY_UNSTAKE_PENALTY = 0.10;

class StakingPortfolioService {
  async getPortfolio(address: string): Promise<StakingPortfolioResponse> {
    const [delegations, positions, unbondings, rewards, validators, pools] = await Promise.all([
      storage.getStakingDelegationsByAddress(address),
      storage.getStakingPositionsByAddress(address),
      storage.getUnbondingRequestsByAddress(address),
      storage.getRewardEventsByAddress(address, 100),
      this.getValidatorsMap(),
      this.getPoolsMap()
    ]);

    const portfolioPositions = this.buildPositions(delegations, positions, validators, pools, rewards);
    const unbondingPositions = this.buildUnbondingPositions(unbondings, validators);
    const summary = this.buildSummary(portfolioPositions, unbondingPositions, rewards, address);

    return {
      summary,
      positions: portfolioPositions,
      unbonding: unbondingPositions,
      rewardHistory: rewards.slice(0, 20)
    };
  }

  async getUnbondings(address: string): Promise<UnbondingPosition[]> {
    const [unbondings, validators] = await Promise.all([
      storage.getUnbondingRequestsByAddress(address),
      this.getValidatorsMap()
    ]);
    return this.buildUnbondingPositions(unbondings, validators);
  }

  async getRewardHistory(address: string, page: number = 1, limit: number = 20): Promise<{
    rewards: RewardEvent[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const allRewards = await storage.getRewardEventsByAddress(address, 1000);
    const total = allRewards.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const rewards = allRewards.slice(start, start + limit);

    return { rewards, total, page, totalPages };
  }

  async getAutoCompoundStatus(address: string): Promise<boolean> {
    return false;
  }

  async setAutoCompound(address: string, enabled: boolean): Promise<{ success: boolean }> {
    return { success: true };
  }

  private async getValidatorsMap(): Promise<Map<string, Validator>> {
    const validators = await storage.getAllValidators();
    return new Map(validators.map(v => [v.id, v]));
  }

  private async getPoolsMap(): Promise<Map<string, StakingPool>> {
    const pools = await storage.getAllStakingPools();
    return new Map(pools.map(p => [p.id, p]));
  }

  private buildPositions(
    delegations: StakingDelegation[],
    positions: StakingPosition[],
    validators: Map<string, Validator>,
    pools: Map<string, StakingPool>,
    rewards: RewardEvent[]
  ): PortfolioPosition[] {
    const result: PortfolioPosition[] = [];

    for (const delegation of delegations) {
      if (delegation.status !== "active") continue;

      const validator = validators.get(delegation.validatorId);
      const pendingRewards = this.calculatePendingRewards(rewards, delegation.validatorId);
      const apyValue = validator?.apy ? String(validator.apy) : "8.5";
      const dailyReward = this.calculateDailyReward(delegation.amount, apyValue);

      result.push({
        id: delegation.id,
        validatorId: delegation.validatorId,
        validatorName: validator?.name || "Unknown Validator",
        validatorAddress: validator?.address || delegation.validatorId,
        validatorCommission: validator?.commission?.toString() || "5",
        stakedAmount: delegation.amount,
        currentApy: apyValue,
        pendingRewards,
        dailyReward,
        validatorRiskScore: this.calculateRiskScore(validator),
        sourceType: "delegation"
      });
    }

    for (const position of positions) {
      if (position.status !== "active") continue;

      const pool = pools.get(position.poolId || "");
      const pendingRewards = this.calculatePendingRewardsForPool(rewards, position.poolId || "");
      const poolApy = pool?.baseApy ? (pool.baseApy / 100).toString() : "10";
      const dailyReward = this.calculateDailyReward(position.stakedAmount, poolApy);

      result.push({
        id: position.id,
        validatorId: pool?.validatorId || position.poolId || "",
        validatorName: pool?.name || "Staking Pool",
        validatorAddress: pool?.id || position.poolId || "",
        validatorCommission: pool?.performanceFee ? (pool.performanceFee / 100).toString() : "3",
        stakedAmount: position.stakedAmount,
        currentApy: poolApy,
        pendingRewards,
        dailyReward,
        validatorRiskScore: pool?.tier === "diamond" || pool?.tier === "platinum" ? "low" : pool?.tier === "gold" ? "medium" : "medium",
        sourceType: "pool",
        poolId: position.poolId || undefined
      });
    }

    return result;
  }

  private buildUnbondingPositions(
    unbondings: UnbondingRequest[],
    validators: Map<string, Validator>
  ): UnbondingPosition[] {
    const now = new Date();
    
    return unbondings
      .filter(u => u.status === "pending" || u.status === "processing")
      .map(unbonding => {
        const validator = validators.get(unbonding.validatorId);
        const startTime = new Date(unbonding.createdAt);
        const endTime = new Date(startTime.getTime() + UNBONDING_PERIOD_DAYS * 24 * 60 * 60 * 1000);
        
        const totalMs = endTime.getTime() - startTime.getTime();
        const elapsedMs = now.getTime() - startTime.getTime();
        const remainingMs = Math.max(0, endTime.getTime() - now.getTime());
        
        const remainingDays = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
        const remainingHours = Math.floor((remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const progressPercent = Math.min(100, (elapsedMs / totalMs) * 100);
        
        const isReady = remainingMs <= 0;

        return {
          id: unbonding.id,
          validatorId: unbonding.validatorId,
          validatorName: validator?.name || "Unknown Validator",
          amount: unbonding.amount,
          startTime,
          endTime,
          remainingDays,
          remainingHours,
          progressPercent: progressPercent.toFixed(1),
          status: isReady ? "ready" as const : "pending" as const,
          canEmergencyUnstake: !isReady && progressPercent < 50,
          emergencyPenalty: (EMERGENCY_UNSTAKE_PENALTY * 100).toString()
        };
      });
  }

  private buildSummary(
    positions: PortfolioPosition[],
    unbondings: UnbondingPosition[],
    rewards: RewardEvent[],
    address: string
  ): PortfolioSummary {
    const totalStaked = positions.reduce((sum, p) => sum + parseFloat(p.stakedAmount || "0"), 0);
    const totalPendingRewards = positions.reduce((sum, p) => sum + parseFloat(p.pendingRewards || "0"), 0);
    const totalUnbonding = unbondings.reduce((sum, u) => sum + parseFloat(u.amount || "0"), 0);
    
    const totalEarned = rewards
      .filter(r => r.claimedAt !== null)
      .reduce((sum, r) => sum + parseFloat(r.amount || "0"), 0);

    const weightedApy = positions.reduce((sum, p) => {
      const stake = parseFloat(p.stakedAmount || "0");
      const apy = parseFloat(p.currentApy || "0");
      return sum + (stake * apy);
    }, 0);
    const avgApy = totalStaked > 0 ? (weightedApy / totalStaked) : 0;

    const totalPortfolioValue = totalStaked + totalPendingRewards + totalUnbonding;

    return {
      totalStaked: totalStaked.toFixed(2),
      totalPendingRewards: totalPendingRewards.toFixed(4),
      totalEarned: totalEarned.toFixed(2),
      totalUnbonding: totalUnbonding.toFixed(2),
      totalPortfolioValue: totalPortfolioValue.toFixed(2),
      avgApy: avgApy.toFixed(2),
      activePositions: positions.length,
      unbondingPositions: unbondings.length,
      autoCompoundEnabled: false
    };
  }

  private calculatePendingRewards(rewards: RewardEvent[], validatorId: string): string {
    const pending = rewards
      .filter(r => r.validatorId === validatorId && r.claimedAt === null)
      .reduce((sum, r) => sum + parseFloat(r.amount || "0"), 0);
    return pending.toFixed(4);
  }

  private calculatePendingRewardsForPool(rewards: RewardEvent[], poolId: string): string {
    const pending = rewards
      .filter(r => r.poolId === poolId && r.claimedAt === null)
      .reduce((sum, r) => sum + parseFloat(r.amount || "0"), 0);
    return pending.toFixed(4);
  }

  private calculateDailyReward(stakedAmount: string, apy: string): string {
    const staked = parseFloat(stakedAmount || "0");
    const apyRate = parseFloat(apy || "0") / 100;
    const daily = (staked * apyRate) / 365;
    return daily.toFixed(4);
  }

  private calculateRiskScore(validator?: Validator): string {
    if (!validator) return "medium";
    
    const uptime = validator.uptime || 99;
    const commission = parseFloat(validator.commission?.toString() || "5");
    
    if (uptime >= 99.5 && commission <= 5) return "low";
    if (uptime >= 98 && commission <= 10) return "medium";
    return "high";
  }
}

export const stakingPortfolioService = new StakingPortfolioService();
