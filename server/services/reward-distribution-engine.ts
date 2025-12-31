/**
 * TBURN Reward Distribution Engine
 * Handles validator rewards, gas fee distribution, and staking rewards
 * 
 * Operates independently to maintain system stability
 */

export interface RewardDistributionConfig {
  proposerBaseReward: string;      // Base reward for block proposer (Wei)
  verifierReward: string;          // Reward per verifier (Wei)
  gasProposerShare: number;        // Proposer's share of gas fees (0-1)
  gasVerifierShare: number;        // Verifiers' share of gas fees (0-1)
  gasBurnRate: number;             // Portion of gas burned (0-1)
  annualInflationRate: number;     // Annual inflation for rewards (basis points, 10000 = 100%)
  epochBlocks: number;             // Blocks per reward epoch
}

export interface ValidatorRewardRecord {
  validatorAddress: string;
  blockNumber: number;
  rewardType: 'proposer' | 'verifier' | 'committee' | 'staking';
  baseReward: string;
  gasReward: string;
  totalReward: string;
  distributed: boolean;
  distributedAt?: Date;
  txHash?: string;
}

export interface EpochRewardSummary {
  epochNumber: number;
  startBlock: number;
  endBlock: number;
  totalBlocksProduced: number;
  totalGasCollected: string;
  totalRewardsDistributed: string;
  proposerRewards: string;
  verifierRewards: string;
  burnedAmount: string;
  validatorRewards: Map<string, string>;
}

export interface StakingReward {
  stakerAddress: string;
  validatorAddress: string;
  stakedAmount: string;
  rewardAmount: string;
  apy: number; // basis points
  epoch: number;
}

export class RewardDistributionEngine {
  private config: RewardDistributionConfig;
  private pendingRewards: Map<string, ValidatorRewardRecord[]> = new Map();
  private epochSummaries: Map<number, EpochRewardSummary> = new Map();
  private currentEpoch: number = 0;
  private currentEpochStartBlock: number = 0;
  
  // Accumulated metrics
  private totalDistributed: bigint = BigInt(0);
  private totalBurned: bigint = BigInt(0);
  private totalGasCollected: bigint = BigInt(0);
  
  constructor(config?: Partial<RewardDistributionConfig>) {
    this.config = {
      proposerBaseReward: '2000000000000000000', // 2 TBURN
      verifierReward: '100000000000000000',      // 0.1 TBURN
      gasProposerShare: 0.5,                     // 50% to proposer
      gasVerifierShare: 0.3,                     // 30% to verifiers
      gasBurnRate: 0.2,                          // 20% burned (deflationary)
      annualInflationRate: 300,                  // 3% annual inflation
      epochBlocks: 1000,                         // 1000 blocks per epoch (~100 seconds at 10 blocks/sec)
      ...config,
    };
  }

  /**
   * Calculate block rewards for a single block
   */
  calculateBlockRewards(
    blockNumber: number,
    proposerAddress: string,
    verifierAddresses: string[],
    gasUsed: string,
    gasPrice: string
  ): ValidatorRewardRecord[] {
    const rewards: ValidatorRewardRecord[] = [];
    
    // Calculate total gas fees collected
    const totalGasFees = BigInt(gasUsed) * BigInt(gasPrice);
    this.totalGasCollected += totalGasFees;
    
    // Calculate gas distribution
    const proposerGasReward = totalGasFees * BigInt(Math.floor(this.config.gasProposerShare * 1000)) / BigInt(1000);
    const verifierGasPool = totalGasFees * BigInt(Math.floor(this.config.gasVerifierShare * 1000)) / BigInt(1000);
    const burnAmount = totalGasFees * BigInt(Math.floor(this.config.gasBurnRate * 1000)) / BigInt(1000);
    
    this.totalBurned += burnAmount;
    
    // Proposer reward
    const proposerReward: ValidatorRewardRecord = {
      validatorAddress: proposerAddress,
      blockNumber,
      rewardType: 'proposer',
      baseReward: this.config.proposerBaseReward,
      gasReward: proposerGasReward.toString(),
      totalReward: (BigInt(this.config.proposerBaseReward) + proposerGasReward).toString(),
      distributed: false,
    };
    rewards.push(proposerReward);
    
    // Verifier rewards (split equally)
    if (verifierAddresses.length > 0) {
      const perVerifierGas = verifierGasPool / BigInt(verifierAddresses.length);
      
      for (const verifierAddress of verifierAddresses) {
        const verifierReward: ValidatorRewardRecord = {
          validatorAddress: verifierAddress,
          blockNumber,
          rewardType: 'verifier',
          baseReward: this.config.verifierReward,
          gasReward: perVerifierGas.toString(),
          totalReward: (BigInt(this.config.verifierReward) + perVerifierGas).toString(),
          distributed: false,
        };
        rewards.push(verifierReward);
      }
    }
    
    // Store pending rewards
    for (const reward of rewards) {
      const existing = this.pendingRewards.get(reward.validatorAddress) || [];
      existing.push(reward);
      this.pendingRewards.set(reward.validatorAddress, existing);
    }
    
    // Check if epoch is complete
    this.checkEpochCompletion(blockNumber);
    
    return rewards;
  }

  /**
   * Check and process epoch completion
   */
  private checkEpochCompletion(currentBlock: number): void {
    const epochNumber = Math.floor(currentBlock / this.config.epochBlocks);
    
    if (epochNumber > this.currentEpoch) {
      this.finalizeEpoch(this.currentEpoch, this.currentEpochStartBlock, currentBlock - 1);
      this.currentEpoch = epochNumber;
      this.currentEpochStartBlock = currentBlock;
    }
  }

  /**
   * Finalize an epoch and create summary
   */
  private finalizeEpoch(
    epochNumber: number,
    startBlock: number,
    endBlock: number
  ): EpochRewardSummary {
    const validatorRewards = new Map<string, string>();
    let totalProposerRewards = BigInt(0);
    let totalVerifierRewards = BigInt(0);
    let totalDistributed = BigInt(0);
    let blocksProduced = 0;
    
    // Aggregate rewards by validator
    for (const [address, rewards] of Array.from(this.pendingRewards.entries())) {
      let validatorTotal = BigInt(0);
      
      for (const reward of rewards) {
        if (reward.blockNumber >= startBlock && reward.blockNumber <= endBlock) {
          validatorTotal += BigInt(reward.totalReward);
          
          if (reward.rewardType === 'proposer') {
            totalProposerRewards += BigInt(reward.totalReward);
            blocksProduced++;
          } else {
            totalVerifierRewards += BigInt(reward.totalReward);
          }
        }
      }
      
      if (validatorTotal > BigInt(0)) {
        validatorRewards.set(address, validatorTotal.toString());
        totalDistributed += validatorTotal;
      }
    }
    
    const summary: EpochRewardSummary = {
      epochNumber,
      startBlock,
      endBlock,
      totalBlocksProduced: blocksProduced,
      totalGasCollected: this.totalGasCollected.toString(),
      totalRewardsDistributed: totalDistributed.toString(),
      proposerRewards: totalProposerRewards.toString(),
      verifierRewards: totalVerifierRewards.toString(),
      burnedAmount: this.totalBurned.toString(),
      validatorRewards,
    };
    
    this.epochSummaries.set(epochNumber, summary);
    this.totalDistributed += totalDistributed;
    
    return summary;
  }

  /**
   * Calculate staking rewards for delegators
   */
  calculateStakingRewards(
    delegations: Array<{
      stakerAddress: string;
      validatorAddress: string;
      stakedAmount: string;
    }>,
    validatorApys: Map<string, number>
  ): StakingReward[] {
    const rewards: StakingReward[] = [];
    const epochDuration = this.config.epochBlocks / 10; // seconds (assuming 10 blocks/sec)
    const secondsPerYear = 365.25 * 24 * 60 * 60;
    const epochFraction = epochDuration / secondsPerYear;
    
    for (const delegation of delegations) {
      const apy = validatorApys.get(delegation.validatorAddress) || 1250; // Default 12.5% APY
      const apyDecimal = apy / 10000; // Convert basis points to decimal
      
      // Calculate epoch reward: stakedAmount * APY * epochFraction
      const stakedBigInt = BigInt(delegation.stakedAmount);
      const rewardBigInt = stakedBigInt * BigInt(Math.floor(apyDecimal * epochFraction * 1000000)) / BigInt(1000000);
      
      rewards.push({
        stakerAddress: delegation.stakerAddress,
        validatorAddress: delegation.validatorAddress,
        stakedAmount: delegation.stakedAmount,
        rewardAmount: rewardBigInt.toString(),
        apy,
        epoch: this.currentEpoch,
      });
    }
    
    return rewards;
  }

  /**
   * Mark rewards as distributed
   */
  markRewardsDistributed(
    validatorAddress: string,
    blockNumbers: number[],
    txHash: string
  ): void {
    const rewards = this.pendingRewards.get(validatorAddress) || [];
    const now = new Date();
    
    for (const reward of rewards) {
      if (blockNumbers.includes(reward.blockNumber)) {
        reward.distributed = true;
        reward.distributedAt = now;
        reward.txHash = txHash;
      }
    }
  }

  /**
   * Get pending rewards for a validator
   */
  getPendingRewards(validatorAddress: string): ValidatorRewardRecord[] {
    return (this.pendingRewards.get(validatorAddress) || [])
      .filter(r => !r.distributed);
  }

  /**
   * Get total pending rewards for a validator
   */
  getTotalPendingRewards(validatorAddress: string): string {
    const pending = this.getPendingRewards(validatorAddress);
    let total = BigInt(0);
    
    for (const reward of pending) {
      total += BigInt(reward.totalReward);
    }
    
    return total.toString();
  }

  /**
   * Get epoch summary
   */
  getEpochSummary(epochNumber: number): EpochRewardSummary | undefined {
    return this.epochSummaries.get(epochNumber);
  }

  /**
   * Get current epoch info
   */
  getCurrentEpochInfo(): {
    epoch: number;
    startBlock: number;
    blocksInEpoch: number;
    epochProgress: number; // 0-1
  } {
    const blocksInEpoch = this.config.epochBlocks;
    
    return {
      epoch: this.currentEpoch,
      startBlock: this.currentEpochStartBlock,
      blocksInEpoch,
      epochProgress: 0, // Will be calculated by caller based on current block
    };
  }

  /**
   * Get overall statistics
   */
  getStatistics(): {
    totalDistributed: string;
    totalBurned: string;
    totalGasCollected: string;
    completedEpochs: number;
    pendingRewardCount: number;
  } {
    let pendingCount = 0;
    for (const rewards of Array.from(this.pendingRewards.values())) {
      pendingCount += rewards.filter(r => !r.distributed).length;
    }
    
    return {
      totalDistributed: this.totalDistributed.toString(),
      totalBurned: this.totalBurned.toString(),
      totalGasCollected: this.totalGasCollected.toString(),
      completedEpochs: this.epochSummaries.size,
      pendingRewardCount: pendingCount,
    };
  }

  /**
   * Clean up distributed rewards older than specified number of epochs
   */
  cleanupOldRewards(keepEpochs: number = 10): number {
    const cutoffEpoch = this.currentEpoch - keepEpochs;
    const cutoffBlock = cutoffEpoch * this.config.epochBlocks;
    let cleaned = 0;
    
    for (const [address, rewards] of Array.from(this.pendingRewards.entries())) {
      const filtered = rewards.filter(r => 
        r.blockNumber >= cutoffBlock || !r.distributed
      );
      cleaned += rewards.length - filtered.length;
      this.pendingRewards.set(address, filtered);
    }
    
    return cleaned;
  }
}

// Export singleton instance
export const rewardDistributionEngine = new RewardDistributionEngine();

export default RewardDistributionEngine;
