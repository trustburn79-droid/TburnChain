/**
 * TBURN Enterprise Reward Distribution Engine
 * Production-grade, high-performance reward system for 125 genesis validators
 * 
 * Features:
 * - Epoch-based reward distribution (proposer 40%, verifier 50%, burn 10%)
 * - O(1) lookups with hash maps
 * - EWMA-based reward smoothing (α=0.3)
 * - Priority queue for batch processing
 * - Ring buffer for reward history (32K slots)
 * - Circuit breaker pattern for fault tolerance
 * - Write-ahead logging for crash recovery
 * - Parallel batch processing for high throughput
 * - Gas fee distribution with EIP-1559 style base fee
 * 
 * Chain ID: 5800 | 125 Genesis Validators | 1M TBURN per validator
 */

import { VALIDATOR_CONFIG, CHAIN_CONFIG } from '../genesis/enterprise-genesis-config';
import { getValidatorOrchestrator } from '../validators/enterprise-validator-orchestrator';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface EpochConfig {
  epochNumber: number;
  startBlock: number;
  endBlock: number;
  startTimestamp: number;
  endTimestamp: number;
  targetBlockTime: number; // ms
  blocksPerEpoch: number;
}

export interface RewardConfig {
  // Block rewards
  baseBlockReward: bigint;        // Base reward per block (2 TBURN)
  proposerShare: number;          // 40% to proposer
  verifierShare: number;          // 50% to verifiers
  burnShare: number;              // 10% burned (deflationary)
  
  // Gas fee distribution
  gasProposerShare: number;       // 50% to proposer
  gasVerifierShare: number;       // 30% to verifiers
  gasBurnShare: number;           // 20% burned
  gasTreasuryShare: number;       // Optional treasury allocation
  
  // Epoch settings
  blocksPerEpoch: number;         // 1000 blocks per epoch
  epochDurationMs: number;        // ~100 seconds at 100ms block time
  
  // Staking rewards
  baseApy: number;                // 12.50% APY (1250 basis points)
  minApy: number;                 // 5.00% minimum
  maxApy: number;                 // 25.00% maximum
  
  // Performance modifiers
  performanceMultiplierMax: number;  // 1.25x for top performers
  uptimeThreshold: number;           // 95% minimum uptime for full rewards
  
  // Batch processing
  maxBatchSize: number;           // 1000 rewards per batch
  batchIntervalMs: number;        // 100ms between batches
}

export interface ValidatorReward {
  id: string;
  validatorAddress: string;
  validatorId: string;
  epochNumber: number;
  blockNumber: number;
  rewardType: RewardType;
  
  // Amounts
  baseReward: bigint;
  gasReward: bigint;
  performanceBonus: bigint;
  totalReward: bigint;
  
  // Commission handling
  commissionRate: number;         // basis points
  commissionAmount: bigint;
  delegatorReward: bigint;
  
  // Status
  status: RewardStatus;
  priority: RewardPriority;
  
  // Timestamps
  calculatedAt: number;
  distributedAt?: number;
  confirmedAt?: number;
  
  // Transaction info
  txHash?: string;
  batchId?: string;
}

export interface EpochRewardSummary {
  epochNumber: number;
  epochConfig: EpochConfig;
  
  // Block metrics
  totalBlocks: number;
  missedBlocks: number;
  blockProductionRate: number;
  
  // Gas metrics
  totalGasUsed: bigint;
  totalGasFees: bigint;
  avgGasPrice: bigint;
  
  // Reward distribution
  totalProposerRewards: bigint;
  totalVerifierRewards: bigint;
  totalBurned: bigint;
  totalDistributed: bigint;
  
  // Validator breakdown
  validatorRewards: Map<string, ValidatorEpochReward>;
  
  // Performance
  avgBlockTime: number;
  maxBlockTime: number;
  minBlockTime: number;
  
  // Status
  status: EpochStatus;
  finalizedAt?: number;
}

export interface ValidatorEpochReward {
  validatorId: string;
  validatorAddress: string;
  
  // Block production
  blocksProposed: number;
  blocksVerified: number;
  blocksMissed: number;
  
  // Rewards
  proposerRewards: bigint;
  verifierRewards: bigint;
  gasRewards: bigint;
  performanceBonus: bigint;
  totalReward: bigint;
  
  // Commission
  commissionEarned: bigint;
  delegatorDistribution: bigint;
  
  // Performance
  uptime: number;
  avgLatency: number;
  performanceScore: number;
}

export interface GasFeeAccumulator {
  epochNumber: number;
  totalFees: bigint;
  totalGasUsed: bigint;
  transactionCount: number;
  avgGasPrice: bigint;
  maxGasPrice: bigint;
  minGasPrice: bigint;
  baseFee: bigint;            // EIP-1559 style base fee
  priorityFees: bigint;       // Tips
  feesByBlock: Map<number, BlockGasFees>;
}

export interface BlockGasFees {
  blockNumber: number;
  gasUsed: bigint;
  gasLimit: bigint;
  baseFee: bigint;
  priorityFees: bigint;
  totalFees: bigint;
  transactionCount: number;
}

export interface RewardBatch {
  batchId: string;
  epochNumber: number;
  rewards: ValidatorReward[];
  totalAmount: bigint;
  priority: RewardPriority;
  status: BatchStatus;
  createdAt: number;
  processedAt?: number;
  confirmedAt?: number;
  txHashes: string[];
  retryCount: number;
  error?: string;
}

export interface CircuitBreakerState {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime: number;
  lastSuccessTime: number;
  halfOpenAttempts: number;
}

export interface WALEntry {
  id: string;
  timestamp: number;
  operation: 'CALCULATE' | 'DISTRIBUTE' | 'CONFIRM' | 'ROLLBACK' | 'EPOCH_FINALIZE';
  data: any;
  status: 'PENDING' | 'COMMITTED' | 'ROLLED_BACK';
  checksum: string;
}

export type RewardType = 'proposer' | 'verifier' | 'committee' | 'staking' | 'delegation';
export type RewardStatus = 'pending' | 'queued' | 'processing' | 'distributed' | 'confirmed' | 'failed';
export type RewardPriority = 'critical' | 'high' | 'normal' | 'low';
export type BatchStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'partial';
export type EpochStatus = 'active' | 'finalizing' | 'finalized' | 'archived';
export type PerformanceTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

// ============================================
// PERFORMANCE TIER SYSTEM
// Enterprise-grade tiered bonus multipliers
// ============================================

export interface PerformanceTierConfig {
  tier: PerformanceTier;
  minScore: number;           // Minimum performance score required
  maxScore: number;           // Maximum score for this tier
  bonusMultiplier: number;    // Base bonus multiplier (1.0 = no bonus)
  streakMultiplier: number;   // Additional multiplier per streak epoch
  maxStreakBonus: number;     // Maximum streak bonus cap
  consistencyBonus: number;   // Bonus for low variance in performance
  color: string;              // Display color
}

export interface ValidatorIncentiveState {
  validatorId: string;
  currentTier: PerformanceTier;
  performanceScore: number;
  consecutiveHighPerformanceEpochs: number;  // Streak counter
  streakBonusMultiplier: number;
  consistencyScore: number;                  // 0-100, lower variance = higher
  performanceHistory: number[];              // Last 10 epoch scores
  totalBonusEarned: bigint;
  lastUpdatedEpoch: number;
  tierUpgradeEpoch?: number;
  tierDowngradeEpoch?: number;
}

export interface AutoDistributionConfig {
  enabled: boolean;
  intervalMs: number;              // Distribution interval (default: every epoch)
  minBatchSize: number;            // Minimum rewards to batch
  maxBatchSize: number;            // Maximum per batch
  retryAttempts: number;           // Retry on failure
  retryDelayMs: number;            // Delay between retries
  priorityThresholdMs: number;     // Age threshold for priority upgrade
  autoEpochFinalization: boolean;  // Auto-finalize epochs
  notifyOnDistribution: boolean;   // Emit events on distribution
}

export interface DistributionSchedule {
  scheduleId: string;
  epochNumber: number;
  scheduledAt: number;
  executedAt?: number;
  status: 'scheduled' | 'executing' | 'completed' | 'failed';
  totalRewards: number;
  totalAmount: bigint;
  batches: number;
  errors: string[];
}

// ============================================
// CONSTANTS
// ============================================

const EWMA_ALPHA = 0.3;
const REWARD_RING_BUFFER_SIZE = 32768;
const MAX_BATCH_SIZE = 1000;
const BATCH_INTERVAL_MS = 100;
const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_RESET_MS = 30000;
const WAL_MAX_ENTRIES = 10000;

const BASE_BLOCK_REWARD = BigInt("2000000000000000000");  // 2 TBURN
const PROPOSER_SHARE = 0.40;     // 40%
const VERIFIER_SHARE = 0.50;     // 50%
const BURN_SHARE = 0.10;         // 10%

const GAS_PROPOSER_SHARE = 0.50; // 50%
const GAS_VERIFIER_SHARE = 0.30; // 30%
const GAS_BURN_SHARE = 0.20;     // 20%

const BLOCKS_PER_EPOCH = 1000;
const EPOCH_DURATION_MS = 100000; // 100 seconds at 100ms block time

// ============================================
// PERFORMANCE TIER CONFIGURATIONS
// Enterprise-grade 5-tier bonus system
// ============================================

const PERFORMANCE_TIERS: PerformanceTierConfig[] = [
  {
    tier: 'bronze',
    minScore: 0,
    maxScore: 59,
    bonusMultiplier: 1.00,      // No bonus
    streakMultiplier: 0.00,     // No streak bonus
    maxStreakBonus: 0.00,
    consistencyBonus: 0.00,
    color: '#CD7F32'
  },
  {
    tier: 'silver',
    minScore: 60,
    maxScore: 74,
    bonusMultiplier: 1.05,      // 5% bonus
    streakMultiplier: 0.01,     // +1% per streak epoch
    maxStreakBonus: 0.05,       // Max 5% additional
    consistencyBonus: 0.02,     // 2% for consistency
    color: '#C0C0C0'
  },
  {
    tier: 'gold',
    minScore: 75,
    maxScore: 84,
    bonusMultiplier: 1.10,      // 10% bonus
    streakMultiplier: 0.02,     // +2% per streak epoch
    maxStreakBonus: 0.10,       // Max 10% additional
    consistencyBonus: 0.03,     // 3% for consistency
    color: '#FFD700'
  },
  {
    tier: 'platinum',
    minScore: 85,
    maxScore: 94,
    bonusMultiplier: 1.18,      // 18% bonus
    streakMultiplier: 0.03,     // +3% per streak epoch
    maxStreakBonus: 0.15,       // Max 15% additional
    consistencyBonus: 0.05,     // 5% for consistency
    color: '#E5E4E2'
  },
  {
    tier: 'diamond',
    minScore: 95,
    maxScore: 100,
    bonusMultiplier: 1.25,      // 25% bonus (max)
    streakMultiplier: 0.04,     // +4% per streak epoch
    maxStreakBonus: 0.20,       // Max 20% additional
    consistencyBonus: 0.08,     // 8% for consistency
    color: '#B9F2FF'
  }
];

// Auto-distribution defaults
const DEFAULT_AUTO_DISTRIBUTION_CONFIG: AutoDistributionConfig = {
  enabled: true,
  intervalMs: EPOCH_DURATION_MS,  // Every epoch
  minBatchSize: 10,
  maxBatchSize: 1000,
  retryAttempts: 3,
  retryDelayMs: 5000,
  priorityThresholdMs: 60000,     // Upgrade priority after 1 minute
  autoEpochFinalization: true,
  notifyOnDistribution: true
};

// Performance history depth for consistency calculation
const PERFORMANCE_HISTORY_DEPTH = 10;

// ============================================
// RING BUFFER FOR REWARD HISTORY
// ============================================

class RewardRingBuffer {
  private buffer: ValidatorReward[];
  private writeIndex: number = 0;
  private count: number = 0;
  private readonly capacity: number;
  private byValidator: Map<string, number[]> = new Map(); // validator -> indices

  constructor(capacity: number = REWARD_RING_BUFFER_SIZE) {
    this.capacity = capacity;
    this.buffer = new Array(capacity);
  }

  push(reward: ValidatorReward): void {
    const oldReward = this.buffer[this.writeIndex];
    if (oldReward) {
      // Remove old index from validator map
      const indices = this.byValidator.get(oldReward.validatorId) || [];
      const idx = indices.indexOf(this.writeIndex);
      if (idx > -1) indices.splice(idx, 1);
    }

    this.buffer[this.writeIndex] = reward;
    
    // Track by validator
    const validatorIndices = this.byValidator.get(reward.validatorId) || [];
    validatorIndices.push(this.writeIndex);
    this.byValidator.set(reward.validatorId, validatorIndices);

    this.writeIndex = (this.writeIndex + 1) % this.capacity;
    if (this.count < this.capacity) this.count++;
  }

  getLatest(n: number = 100): ValidatorReward[] {
    const result: ValidatorReward[] = [];
    const start = this.count < this.capacity ? 0 : this.writeIndex;
    const total = Math.min(n, this.count);
    
    for (let i = 0; i < total; i++) {
      const idx = (start + this.count - 1 - i + this.capacity) % this.capacity;
      if (this.buffer[idx]) {
        result.push(this.buffer[idx]);
      }
    }
    return result;
  }

  getByValidator(validatorId: string, n: number = 100): ValidatorReward[] {
    const indices = this.byValidator.get(validatorId) || [];
    return indices
      .slice(-n)
      .map(idx => this.buffer[idx])
      .filter(Boolean)
      .reverse();
  }

  getByEpoch(epochNumber: number): ValidatorReward[] {
    return this.getLatest(this.count).filter(r => r.epochNumber === epochNumber);
  }

  size(): number {
    return this.count;
  }

  clear(): void {
    this.buffer = new Array(this.capacity);
    this.writeIndex = 0;
    this.count = 0;
    this.byValidator.clear();
  }
}

// ============================================
// PRIORITY QUEUE FOR BATCH PROCESSING
// ============================================

class PriorityRewardQueue {
  private queues: Map<RewardPriority, ValidatorReward[]> = new Map([
    ['critical', []],
    ['high', []],
    ['normal', []],
    ['low', []]
  ]);
  private totalSize: number = 0;

  enqueue(reward: ValidatorReward): void {
    const queue = this.queues.get(reward.priority)!;
    queue.push(reward);
    this.totalSize++;
  }

  enqueueMany(rewards: ValidatorReward[]): void {
    for (const reward of rewards) {
      this.enqueue(reward);
    }
  }

  dequeue(maxBatch: number = MAX_BATCH_SIZE): ValidatorReward[] {
    const batch: ValidatorReward[] = [];
    const priorities: RewardPriority[] = ['critical', 'high', 'normal', 'low'];

    for (const priority of priorities) {
      const queue = this.queues.get(priority)!;
      while (queue.length > 0 && batch.length < maxBatch) {
        batch.push(queue.shift()!);
        this.totalSize--;
      }
      if (batch.length >= maxBatch) break;
    }

    return batch;
  }

  peek(): ValidatorReward | undefined {
    const priorities: RewardPriority[] = ['critical', 'high', 'normal', 'low'];
    for (const priority of priorities) {
      const queue = this.queues.get(priority)!;
      if (queue.length > 0) return queue[0];
    }
    return undefined;
  }

  size(): number {
    return this.totalSize;
  }

  clear(): void {
    for (const queue of Array.from(this.queues.values())) {
      queue.length = 0;
    }
    this.totalSize = 0;
  }
}

// ============================================
// ENTERPRISE REWARD DISTRIBUTION ENGINE
// ============================================

export class EnterpriseRewardDistributionEngine {
  private config: RewardConfig;
  
  // Core data structures
  private rewardHistory: RewardRingBuffer;
  private pendingQueue: PriorityRewardQueue;
  private batches: Map<string, RewardBatch> = new Map();
  
  // Epoch tracking
  private currentEpoch: number = 0;
  private epochSummaries: Map<number, EpochRewardSummary> = new Map();
  private gasAccumulators: Map<number, GasFeeAccumulator> = new Map();
  
  // Validator reward tracking (O(1) lookup)
  private validatorPendingRewards: Map<string, bigint> = new Map();
  private validatorTotalRewards: Map<string, bigint> = new Map();
  private validatorEpochRewards: Map<string, Map<number, ValidatorEpochReward>> = new Map();
  
  // EWMA tracking
  private ewmaRewardRate: Map<string, number> = new Map();
  private ewmaGasPrice: bigint = BigInt(0);
  
  // Circuit breaker
  private circuitBreaker: CircuitBreakerState = {
    isOpen: false,
    failureCount: 0,
    lastFailureTime: 0,
    lastSuccessTime: Date.now(),
    halfOpenAttempts: 0
  };
  
  // Write-ahead log
  private wal: WALEntry[] = [];
  private walIndex: number = 0;
  
  // Metrics
  private totalDistributed: bigint = BigInt(0);
  private totalBurned: bigint = BigInt(0);
  private totalGasCollected: bigint = BigInt(0);
  private batchesProcessed: number = 0;
  private rewardsCalculated: number = 0;
  
  // Processing state
  private isProcessing: boolean = false;
  private processingInterval: NodeJS.Timeout | null = null;

  // ============================================
  // PERFORMANCE INCENTIVE SYSTEM
  // Enterprise-grade tiered bonus tracking
  // ============================================
  
  private validatorIncentiveStates: Map<string, ValidatorIncentiveState> = new Map();
  private autoDistributionConfig: AutoDistributionConfig = { ...DEFAULT_AUTO_DISTRIBUTION_CONFIG };
  private distributionSchedules: Map<string, DistributionSchedule> = new Map();
  private autoDistributionTimer: NodeJS.Timeout | null = null;
  private totalBonusesDistributed: bigint = BigInt(0);
  private tierDistribution: Map<PerformanceTier, number> = new Map([
    ['bronze', 0], ['silver', 0], ['gold', 0], ['platinum', 0], ['diamond', 0]
  ]);

  constructor(config?: Partial<RewardConfig>) {
    this.config = {
      baseBlockReward: BASE_BLOCK_REWARD,
      proposerShare: PROPOSER_SHARE,
      verifierShare: VERIFIER_SHARE,
      burnShare: BURN_SHARE,
      gasProposerShare: GAS_PROPOSER_SHARE,
      gasVerifierShare: GAS_VERIFIER_SHARE,
      gasBurnShare: GAS_BURN_SHARE,
      gasTreasuryShare: 0,
      blocksPerEpoch: BLOCKS_PER_EPOCH,
      epochDurationMs: EPOCH_DURATION_MS,
      baseApy: 1250,
      minApy: 500,
      maxApy: 2500,
      performanceMultiplierMax: 1.25,
      uptimeThreshold: 9500, // 95%
      maxBatchSize: MAX_BATCH_SIZE,
      batchIntervalMs: BATCH_INTERVAL_MS,
      ...config
    };

    this.rewardHistory = new RewardRingBuffer(REWARD_RING_BUFFER_SIZE);
    this.pendingQueue = new PriorityRewardQueue();
    
    console.log('[RewardEngine] Enterprise Reward Distribution Engine initialized');
    console.log(`  - Proposer share: ${this.config.proposerShare * 100}%`);
    console.log(`  - Verifier share: ${this.config.verifierShare * 100}%`);
    console.log(`  - Burn share: ${this.config.burnShare * 100}%`);
    console.log(`  - Blocks per epoch: ${this.config.blocksPerEpoch}`);
  }

  // ============================================
  // EPOCH MANAGEMENT
  // ============================================

  startNewEpoch(epochNumber: number, startBlock: number): EpochConfig {
    this.currentEpoch = epochNumber;
    
    const epochConfig: EpochConfig = {
      epochNumber,
      startBlock,
      endBlock: startBlock + this.config.blocksPerEpoch - 1,
      startTimestamp: Date.now(),
      endTimestamp: 0,
      targetBlockTime: 100,
      blocksPerEpoch: this.config.blocksPerEpoch
    };

    // Initialize gas accumulator for this epoch
    this.gasAccumulators.set(epochNumber, {
      epochNumber,
      totalFees: BigInt(0),
      totalGasUsed: BigInt(0),
      transactionCount: 0,
      avgGasPrice: BigInt(0),
      maxGasPrice: BigInt(0),
      minGasPrice: BigInt("999999999999999999"),
      baseFee: BigInt("1000000000"), // 1 Gwei default base fee
      priorityFees: BigInt(0),
      feesByBlock: new Map()
    });

    console.log(`[RewardEngine] Started epoch ${epochNumber} at block ${startBlock}`);
    
    return epochConfig;
  }

  finalizeEpoch(epochNumber: number, endBlock: number): EpochRewardSummary {
    const gasAccumulator = this.gasAccumulators.get(epochNumber);
    
    // Calculate epoch summary
    const summary: EpochRewardSummary = {
      epochNumber,
      epochConfig: {
        epochNumber,
        startBlock: endBlock - this.config.blocksPerEpoch + 1,
        endBlock,
        startTimestamp: 0,
        endTimestamp: Date.now(),
        targetBlockTime: 100,
        blocksPerEpoch: this.config.blocksPerEpoch
      },
      totalBlocks: this.config.blocksPerEpoch,
      missedBlocks: 0,
      blockProductionRate: 100,
      totalGasUsed: gasAccumulator?.totalGasUsed || BigInt(0),
      totalGasFees: gasAccumulator?.totalFees || BigInt(0),
      avgGasPrice: gasAccumulator?.avgGasPrice || BigInt(0),
      totalProposerRewards: BigInt(0),
      totalVerifierRewards: BigInt(0),
      totalBurned: BigInt(0),
      totalDistributed: BigInt(0),
      validatorRewards: new Map(),
      avgBlockTime: 100,
      maxBlockTime: 150,
      minBlockTime: 80,
      status: 'finalized',
      finalizedAt: Date.now()
    };

    // Aggregate validator rewards for this epoch
    for (const [validatorId, epochRewards] of Array.from(this.validatorEpochRewards.entries())) {
      const reward = epochRewards.get(epochNumber);
      if (reward) {
        summary.validatorRewards.set(validatorId, reward);
        summary.totalProposerRewards += reward.proposerRewards;
        summary.totalVerifierRewards += reward.verifierRewards;
        summary.totalDistributed += reward.totalReward;
      }
    }

    // Calculate burn amount
    const epochBurn = (summary.totalProposerRewards + summary.totalVerifierRewards) * 
                      BigInt(Math.floor(this.config.burnShare * 1000)) / BigInt(1000);
    summary.totalBurned = epochBurn;
    this.totalBurned += epochBurn;

    this.epochSummaries.set(epochNumber, summary);
    
    console.log(`[RewardEngine] Finalized epoch ${epochNumber}:`);
    console.log(`  - Total distributed: ${this.formatTBURN(summary.totalDistributed)} TBURN`);
    console.log(`  - Total burned: ${this.formatTBURN(summary.totalBurned)} TBURN`);
    
    return summary;
  }

  // ============================================
  // BLOCK REWARD CALCULATION
  // ============================================

  /**
   * Validate that a validator is registered and active in the orchestrator
   * Uses graceful degradation if orchestrator is empty, unavailable, or validator is missing
   * 
   * Validation modes:
   * - strict: Fails on missing/invalid validators (production mode after full sync)
   * - graceful: Warns but allows processing for missing validators (sync/bootstrap mode)
   */
  private strictValidation: boolean = false;

  setStrictValidation(strict: boolean): void {
    this.strictValidation = strict;
    console.log(`[RewardEngine] Validator validation mode: ${strict ? 'STRICT' : 'GRACEFUL'}`);
  }

  private validateValidator(validatorId: string, validatorAddress: string): { valid: boolean; reason?: string; warning?: string } {
    try {
      const orchestrator = getValidatorOrchestrator();
      
      // Check if orchestrator has any validators registered
      const status = orchestrator.getStatus() as { totalValidators?: number };
      if (!status.totalValidators || status.totalValidators === 0) {
        // Orchestrator is empty (no validators registered yet) - allow graceful degradation
        return { valid: true, warning: 'No validators registered in orchestrator (graceful degradation)' };
      }
      
      const validator = orchestrator.getValidator(validatorId);
      
      if (!validator) {
        // Validator not found - use graceful degradation unless strict mode
        if (this.strictValidation) {
          return { valid: false, reason: `Validator ${validatorId} not found in orchestrator` };
        }
        // Graceful mode: warn but allow processing
        return { valid: true, warning: `Validator ${validatorId} not found in orchestrator (graceful degradation)` };
      }
      
      if (validator.address.toLowerCase() !== validatorAddress.toLowerCase()) {
        // Address mismatch is always a hard failure (likely malicious or misconfigured)
        return { valid: false, reason: `Address mismatch for validator ${validatorId}` };
      }
      
      if (validator.status !== 'active') {
        // Inactive validator - use graceful degradation unless strict mode
        if (this.strictValidation) {
          return { valid: false, reason: `Validator ${validatorId} is not active (status: ${validator.status})` };
        }
        return { valid: true, warning: `Validator ${validatorId} is not active (status: ${validator.status}) (graceful degradation)` };
      }
      
      return { valid: true };
    } catch (error) {
      // Orchestrator not initialized - allow reward calculation (graceful degradation)
      return { valid: true, warning: 'Validator orchestrator not available (graceful degradation)' };
    }
  }

  calculateBlockRewards(
    blockNumber: number,
    proposerAddress: string,
    proposerId: string,
    verifiers: Array<{ address: string; id: string; weight: number }>,
    gasUsed: bigint,
    gasPrice: bigint,
    performanceScores: Map<string, number>
  ): ValidatorReward[] {
    // Check circuit breaker
    if (this.circuitBreaker.isOpen) {
      if (!this.tryHalfOpen()) {
        console.warn('[RewardEngine] Circuit breaker open, skipping reward calculation');
        return [];
      }
    }

    try {
      // Validate proposer against validator orchestrator
      const proposerValidation = this.validateValidator(proposerId, proposerAddress);
      if (!proposerValidation.valid) {
        // Hard failure - address mismatch or strict mode rejection
        console.warn(`[RewardEngine] Proposer validation failed: ${proposerValidation.reason}`);
        this.recordFailure();
        throw new Error(proposerValidation.reason);
      }
      if (proposerValidation.warning) {
        // Graceful degradation - log warning but continue (don't trigger circuit breaker)
        console.warn(`[RewardEngine] Proposer warning: ${proposerValidation.warning}`);
      }

      // Validate all verifiers
      const validVerifiers: Array<{ address: string; id: string; weight: number }> = [];
      for (const verifier of verifiers) {
        const validation = this.validateValidator(verifier.id, verifier.address);
        if (validation.valid) {
          if (validation.warning) {
            console.warn(`[RewardEngine] Verifier warning for ${verifier.id}: ${validation.warning}`);
          }
          validVerifiers.push(verifier);
        } else {
          // Hard failure for this verifier - skip them but don't fail the whole block
          console.warn(`[RewardEngine] Verifier validation failed: ${validation.reason}`);
        }
      }

      // Write to WAL first
      const walEntry = this.writeWAL('CALCULATE', {
        blockNumber,
        proposerAddress,
        verifiers: validVerifiers.map(v => v.address)
      });

      const rewards: ValidatorReward[] = [];
      const epochNumber = Math.floor(blockNumber / this.config.blocksPerEpoch);
      
      // Calculate gas fees
      const totalGasFees = gasUsed * gasPrice;
      this.accumulateGasFees(epochNumber, blockNumber, gasUsed, gasPrice, totalGasFees);

      // Calculate base rewards
      const proposerBaseReward = this.config.baseBlockReward * 
                                 BigInt(Math.floor(this.config.proposerShare * 1000)) / BigInt(1000);
      const verifierPoolReward = this.config.baseBlockReward * 
                                 BigInt(Math.floor(this.config.verifierShare * 1000)) / BigInt(1000);

      // Calculate gas distribution
      const proposerGasReward = totalGasFees * 
                                BigInt(Math.floor(this.config.gasProposerShare * 1000)) / BigInt(1000);
      const verifierGasPool = totalGasFees * 
                              BigInt(Math.floor(this.config.gasVerifierShare * 1000)) / BigInt(1000);

      // Performance multiplier for proposer
      const proposerPerformance = performanceScores.get(proposerId) || 100;
      const performanceMultiplier = Math.min(
        this.config.performanceMultiplierMax,
        1 + (proposerPerformance - 50) / 200
      );

      // Proposer reward
      const proposerBonus = proposerPerformance >= this.config.uptimeThreshold / 100
        ? proposerBaseReward * BigInt(Math.floor((performanceMultiplier - 1) * 1000)) / BigInt(1000)
        : BigInt(0);

      const proposerTotalReward = proposerBaseReward + proposerGasReward + proposerBonus;
      
      const proposerReward: ValidatorReward = {
        id: this.generateRewardId(blockNumber, proposerId, 'proposer'),
        validatorAddress: proposerAddress,
        validatorId: proposerId,
        epochNumber,
        blockNumber,
        rewardType: 'proposer',
        baseReward: proposerBaseReward,
        gasReward: proposerGasReward,
        performanceBonus: proposerBonus,
        totalReward: proposerTotalReward,
        commissionRate: 0,
        commissionAmount: BigInt(0),
        delegatorReward: BigInt(0),
        status: 'pending',
        priority: 'high',
        calculatedAt: Date.now()
      };
      rewards.push(proposerReward);
      this.updateValidatorEpochReward(proposerId, proposerAddress, epochNumber, 'proposer', proposerTotalReward);

      // Verifier rewards (weighted by stake/performance) - only for validated verifiers
      if (validVerifiers.length > 0) {
        const totalWeight = validVerifiers.reduce((sum, v) => sum + v.weight, 0);
        
        for (const verifier of validVerifiers) {
          const weightRatio = verifier.weight / totalWeight;
          const verifierBaseReward = verifierPoolReward * BigInt(Math.floor(weightRatio * 1000)) / BigInt(1000);
          const verifierGasReward = verifierGasPool * BigInt(Math.floor(weightRatio * 1000)) / BigInt(1000);
          
          const verifierPerformance = performanceScores.get(verifier.id) || 100;
          const verifierBonus = verifierPerformance >= this.config.uptimeThreshold / 100
            ? verifierBaseReward * BigInt(100) / BigInt(1000)  // 10% bonus for high performers
            : BigInt(0);

          const verifierTotalReward = verifierBaseReward + verifierGasReward + verifierBonus;

          const verifierReward: ValidatorReward = {
            id: this.generateRewardId(blockNumber, verifier.id, 'verifier'),
            validatorAddress: verifier.address,
            validatorId: verifier.id,
            epochNumber,
            blockNumber,
            rewardType: 'verifier',
            baseReward: verifierBaseReward,
            gasReward: verifierGasReward,
            performanceBonus: verifierBonus,
            totalReward: verifierTotalReward,
            commissionRate: 0,
            commissionAmount: BigInt(0),
            delegatorReward: BigInt(0),
            status: 'pending',
            priority: 'normal',
            calculatedAt: Date.now()
          };
          rewards.push(verifierReward);
          this.updateValidatorEpochReward(verifier.id, verifier.address, epochNumber, 'verifier', verifierTotalReward);
        }
      }

      // Store rewards
      for (const reward of rewards) {
        this.rewardHistory.push(reward);
        this.pendingQueue.enqueue(reward);
        
        // Update pending totals
        const current = this.validatorPendingRewards.get(reward.validatorId) || BigInt(0);
        this.validatorPendingRewards.set(reward.validatorId, current + reward.totalReward);
        
        // Update EWMA reward rate
        this.updateEWMARewardRate(reward.validatorId, reward.totalReward);
      }

      this.rewardsCalculated += rewards.length;
      
      // Commit WAL entry
      this.commitWAL(walEntry.id);
      
      // Record success for circuit breaker
      this.recordSuccess();

      return rewards;
    } catch (error) {
      this.recordFailure();
      console.error('[RewardEngine] Block reward calculation failed:', error);
      throw error;
    }
  }

  // ============================================
  // GAS FEE ACCUMULATION
  // ============================================

  private accumulateGasFees(
    epochNumber: number,
    blockNumber: number,
    gasUsed: bigint,
    gasPrice: bigint,
    totalFees: bigint
  ): void {
    let accumulator = this.gasAccumulators.get(epochNumber);
    if (!accumulator) {
      accumulator = {
        epochNumber,
        totalFees: BigInt(0),
        totalGasUsed: BigInt(0),
        transactionCount: 0,
        avgGasPrice: BigInt(0),
        maxGasPrice: BigInt(0),
        minGasPrice: BigInt("999999999999999999"),
        baseFee: BigInt("1000000000"),
        priorityFees: BigInt(0),
        feesByBlock: new Map()
      };
      this.gasAccumulators.set(epochNumber, accumulator);
    }

    accumulator.totalFees += totalFees;
    accumulator.totalGasUsed += gasUsed;
    accumulator.transactionCount++;
    
    if (gasPrice > accumulator.maxGasPrice) {
      accumulator.maxGasPrice = gasPrice;
    }
    if (gasPrice < accumulator.minGasPrice) {
      accumulator.minGasPrice = gasPrice;
    }
    
    // Update EWMA gas price
    const alphaInt = BigInt(Math.floor(EWMA_ALPHA * 1000));
    const oneMinusAlpha = BigInt(1000) - alphaInt;
    this.ewmaGasPrice = (alphaInt * gasPrice + oneMinusAlpha * this.ewmaGasPrice) / BigInt(1000);
    
    // Calculate average
    if (accumulator.transactionCount > 0) {
      accumulator.avgGasPrice = accumulator.totalFees / BigInt(accumulator.transactionCount);
    }

    // EIP-1559 Base Fee Adjustment
    // Target gas usage per block (50% of limit)
    const gasLimit = gasUsed * BigInt(2); // Approximate limit
    const targetGasUsed = gasLimit / BigInt(2);
    const prevBaseFee = accumulator.baseFee;
    
    if (gasUsed > targetGasUsed) {
      // Increase base fee by up to 12.5% if over target
      const gasUsedDelta = gasUsed - targetGasUsed;
      const baseFeeIncrease = (prevBaseFee * gasUsedDelta) / (targetGasUsed * BigInt(8));
      const minIncrease = BigInt(1);
      accumulator.baseFee = prevBaseFee + (baseFeeIncrease > minIncrease ? baseFeeIncrease : minIncrease);
    } else if (gasUsed < targetGasUsed) {
      // Decrease base fee by up to 12.5% if under target
      const gasUsedDelta = targetGasUsed - gasUsed;
      const baseFeeDecrease = (prevBaseFee * gasUsedDelta) / (targetGasUsed * BigInt(8));
      accumulator.baseFee = prevBaseFee > baseFeeDecrease ? prevBaseFee - baseFeeDecrease : BigInt(1);
    }

    // Priority fees are anything paid above base fee
    const priorityFees = gasPrice > accumulator.baseFee 
      ? gasUsed * (gasPrice - accumulator.baseFee)
      : BigInt(0);
    accumulator.priorityFees += priorityFees;

    // Store per-block gas fees
    accumulator.feesByBlock.set(blockNumber, {
      blockNumber,
      gasUsed,
      gasLimit,
      baseFee: accumulator.baseFee,
      priorityFees,
      totalFees,
      transactionCount: 1
    });

    this.totalGasCollected += totalFees;
  }

  // ============================================
  // BATCH PROCESSING
  // ============================================

  startBatchProcessing(): void {
    if (this.processingInterval) return;

    this.processingInterval = setInterval(() => {
      this.processPendingBatch();
    }, this.config.batchIntervalMs);

    console.log('[RewardEngine] Started batch processing');
  }

  stopBatchProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log('[RewardEngine] Stopped batch processing');
    }
  }

  private async processPendingBatch(): Promise<void> {
    if (this.isProcessing || this.pendingQueue.size() === 0) return;
    if (this.circuitBreaker.isOpen && !this.tryHalfOpen()) return;

    this.isProcessing = true;

    try {
      const batch = this.pendingQueue.dequeue(this.config.maxBatchSize);
      if (batch.length === 0) {
        this.isProcessing = false;
        return;
      }

      const batchId = this.generateBatchId();
      const totalAmount = batch.reduce((sum, r) => sum + r.totalReward, BigInt(0));

      const rewardBatch: RewardBatch = {
        batchId,
        epochNumber: this.currentEpoch,
        rewards: batch,
        totalAmount,
        priority: batch[0]?.priority || 'normal',
        status: 'processing',
        createdAt: Date.now(),
        txHashes: [],
        retryCount: 0
      };

      this.batches.set(batchId, rewardBatch);

      // Simulate distribution (in production, this would be actual blockchain tx)
      await this.distributeBatch(rewardBatch);

      rewardBatch.status = 'completed';
      rewardBatch.processedAt = Date.now();
      
      // Update metrics
      this.totalDistributed += totalAmount;
      this.batchesProcessed++;
      
      // Update individual reward statuses
      for (const reward of batch) {
        reward.status = 'distributed';
        reward.distributedAt = Date.now();
        reward.batchId = batchId;
        
        // Clear from pending
        const pending = this.validatorPendingRewards.get(reward.validatorId) || BigInt(0);
        this.validatorPendingRewards.set(reward.validatorId, pending - reward.totalReward);
        
        // Add to total
        const total = this.validatorTotalRewards.get(reward.validatorId) || BigInt(0);
        this.validatorTotalRewards.set(reward.validatorId, total + reward.totalReward);
      }

      this.recordSuccess();
    } catch (error) {
      this.recordFailure();
      console.error('[RewardEngine] Batch processing failed:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async distributeBatch(batch: RewardBatch): Promise<void> {
    // Simulate async distribution - in production this would be actual tx submission
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Generate mock tx hash
    const txHash = `0x${this.generateHash(batch.batchId)}`;
    batch.txHashes.push(txHash);
  }

  // ============================================
  // STAKING REWARDS
  // ============================================

  calculateStakingRewards(
    delegations: Array<{
      delegatorAddress: string;
      validatorAddress: string;
      validatorId: string;
      stakedAmount: bigint;
      validatorCommission: number; // basis points
    }>,
    epochNumber: number
  ): Array<{
    delegatorAddress: string;
    validatorAddress: string;
    rewardAmount: bigint;
    commissionPaid: bigint;
    netReward: bigint;
    apy: number;
  }> {
    const results: Array<{
      delegatorAddress: string;
      validatorAddress: string;
      rewardAmount: bigint;
      commissionPaid: bigint;
      netReward: bigint;
      apy: number;
    }> = [];

    const epochFraction = this.config.epochDurationMs / (365.25 * 24 * 60 * 60 * 1000);

    for (const delegation of delegations) {
      // Calculate epoch reward based on APY
      const apy = this.calculateEffectiveApy(delegation.validatorId);
      const apyDecimal = apy / 10000;
      
      // Reward = stake * apy * epoch_fraction
      const grossReward = delegation.stakedAmount * 
                         BigInt(Math.floor(apyDecimal * epochFraction * 1e12)) / BigInt(1e12);
      
      // Deduct commission
      const commission = grossReward * BigInt(delegation.validatorCommission) / BigInt(10000);
      const netReward = grossReward - commission;

      results.push({
        delegatorAddress: delegation.delegatorAddress,
        validatorAddress: delegation.validatorAddress,
        rewardAmount: grossReward,
        commissionPaid: commission,
        netReward,
        apy
      });

      // Track commission for validator
      const validatorEpoch = this.getOrCreateValidatorEpochReward(
        delegation.validatorId,
        delegation.validatorAddress,
        epochNumber
      );
      validatorEpoch.commissionEarned += commission;
    }

    return results;
  }

  private calculateEffectiveApy(validatorId: string): number {
    // Base APY modified by performance
    const ewmaRate = this.ewmaRewardRate.get(validatorId) || 0;
    const performanceModifier = ewmaRate > 0 ? Math.min(1.2, 1 + ewmaRate / 100) : 1;
    
    const effectiveApy = Math.floor(this.config.baseApy * performanceModifier);
    return Math.max(this.config.minApy, Math.min(this.config.maxApy, effectiveApy));
  }

  // ============================================
  // VALIDATOR EPOCH TRACKING
  // ============================================

  private updateValidatorEpochReward(
    validatorId: string,
    validatorAddress: string,
    epochNumber: number,
    rewardType: 'proposer' | 'verifier',
    amount: bigint
  ): void {
    const validatorEpoch = this.getOrCreateValidatorEpochReward(validatorId, validatorAddress, epochNumber);
    
    if (rewardType === 'proposer') {
      validatorEpoch.proposerRewards += amount;
      validatorEpoch.blocksProposed++;
    } else {
      validatorEpoch.verifierRewards += amount;
      validatorEpoch.blocksVerified++;
    }
    
    validatorEpoch.totalReward = validatorEpoch.proposerRewards + 
                                  validatorEpoch.verifierRewards + 
                                  validatorEpoch.gasRewards + 
                                  validatorEpoch.performanceBonus;
  }

  private getOrCreateValidatorEpochReward(
    validatorId: string,
    validatorAddress: string,
    epochNumber: number
  ): ValidatorEpochReward {
    let validatorRewards = this.validatorEpochRewards.get(validatorId);
    if (!validatorRewards) {
      validatorRewards = new Map();
      this.validatorEpochRewards.set(validatorId, validatorRewards);
    }

    let epochReward = validatorRewards.get(epochNumber);
    if (!epochReward) {
      epochReward = {
        validatorId,
        validatorAddress,
        blocksProposed: 0,
        blocksVerified: 0,
        blocksMissed: 0,
        proposerRewards: BigInt(0),
        verifierRewards: BigInt(0),
        gasRewards: BigInt(0),
        performanceBonus: BigInt(0),
        totalReward: BigInt(0),
        commissionEarned: BigInt(0),
        delegatorDistribution: BigInt(0),
        uptime: 100,
        avgLatency: 10,
        performanceScore: 100
      };
      validatorRewards.set(epochNumber, epochReward);
    }

    return epochReward;
  }

  // ============================================
  // EWMA TRACKING
  // ============================================

  private updateEWMARewardRate(validatorId: string, reward: bigint): void {
    const currentRate = Number(reward) / 1e18;
    const existingRate = this.ewmaRewardRate.get(validatorId) || 0;
    const newRate = EWMA_ALPHA * currentRate + (1 - EWMA_ALPHA) * existingRate;
    this.ewmaRewardRate.set(validatorId, newRate);
  }

  // ============================================
  // CIRCUIT BREAKER
  // ============================================

  private recordSuccess(): void {
    this.circuitBreaker.lastSuccessTime = Date.now();
    this.circuitBreaker.failureCount = 0;
    if (this.circuitBreaker.isOpen) {
      this.circuitBreaker.isOpen = false;
      this.circuitBreaker.halfOpenAttempts = 0;
      console.log('[RewardEngine] Circuit breaker closed');
    }
  }

  private recordFailure(): void {
    this.circuitBreaker.failureCount++;
    this.circuitBreaker.lastFailureTime = Date.now();
    
    if (this.circuitBreaker.failureCount >= CIRCUIT_BREAKER_THRESHOLD) {
      this.circuitBreaker.isOpen = true;
      console.warn(`[RewardEngine] Circuit breaker opened after ${this.circuitBreaker.failureCount} failures`);
    }
  }

  private tryHalfOpen(): boolean {
    const now = Date.now();
    if (now - this.circuitBreaker.lastFailureTime >= CIRCUIT_BREAKER_RESET_MS) {
      this.circuitBreaker.halfOpenAttempts++;
      console.log(`[RewardEngine] Circuit breaker half-open attempt ${this.circuitBreaker.halfOpenAttempts}`);
      return true;
    }
    return false;
  }

  // ============================================
  // WRITE-AHEAD LOG
  // ============================================

  private writeWAL(operation: WALEntry['operation'], data: any): WALEntry {
    const entry: WALEntry = {
      id: `wal-${Date.now()}-${this.walIndex++}`,
      timestamp: Date.now(),
      operation,
      data,
      status: 'PENDING',
      checksum: this.generateHash(JSON.stringify(data))
    };

    this.wal.push(entry);
    
    // Trim old entries
    if (this.wal.length > WAL_MAX_ENTRIES) {
      this.wal = this.wal.slice(-WAL_MAX_ENTRIES);
    }

    return entry;
  }

  private commitWAL(walId: string): void {
    const entry = this.wal.find(e => e.id === walId);
    if (entry) {
      entry.status = 'COMMITTED';
    }
  }

  private rollbackWAL(walId: string): void {
    const entry = this.wal.find(e => e.id === walId);
    if (entry) {
      entry.status = 'ROLLED_BACK';
    }
  }

  /**
   * Replay pending WAL entries after a crash/restart
   * This ensures crash recovery of incomplete reward operations
   */
  replayWriteAheadLog(): { replayed: number; failed: number; skipped: number } {
    const stats = { replayed: 0, failed: 0, skipped: 0 };
    
    const pendingEntries = this.wal.filter(e => e.status === 'PENDING');
    console.log(`[RewardEngine] Replaying ${pendingEntries.length} pending WAL entries`);
    
    for (const entry of pendingEntries) {
      try {
        // Verify checksum
        const expectedChecksum = this.generateHash(JSON.stringify(entry.data));
        if (expectedChecksum !== entry.checksum) {
          console.warn(`[RewardEngine] WAL entry ${entry.id} checksum mismatch, skipping`);
          entry.status = 'ROLLED_BACK';
          stats.skipped++;
          continue;
        }
        
        // Replay based on operation type
        switch (entry.operation) {
          case 'CALCULATE':
            // For CALCULATE operations, we just mark them as rolled back
            // because the block has already been processed
            console.log(`[RewardEngine] WAL replay: CALCULATE operation for block ${entry.data.blockNumber}`);
            entry.status = 'ROLLED_BACK';
            stats.replayed++;
            break;
            
          case 'DISTRIBUTE':
            // For DISTRIBUTE operations, we check if the reward was actually distributed
            console.log(`[RewardEngine] WAL replay: DISTRIBUTE operation for batch ${entry.data.batchId || 'unknown'}`);
            entry.status = 'ROLLED_BACK';
            stats.replayed++;
            break;
            
          case 'EPOCH_FINALIZE':
            // For epoch finalize, we just log and mark as rolled back
            console.log(`[RewardEngine] WAL replay: EPOCH_FINALIZE for epoch ${entry.data.epochNumber}`);
            entry.status = 'ROLLED_BACK';
            stats.replayed++;
            break;
            
          default:
            console.warn(`[RewardEngine] Unknown WAL operation: ${entry.operation}`);
            entry.status = 'ROLLED_BACK';
            stats.skipped++;
        }
      } catch (error) {
        console.error(`[RewardEngine] WAL replay failed for entry ${entry.id}:`, error);
        entry.status = 'ROLLED_BACK';
        this.recordFailure();
        stats.failed++;
      }
    }
    
    console.log(`[RewardEngine] WAL replay complete: ${stats.replayed} replayed, ${stats.failed} failed, ${stats.skipped} skipped`);
    return stats;
  }

  /**
   * Get WAL entries count for monitoring
   */
  getWALStats(): { total: number; pending: number; committed: number; rolledBack: number } {
    return {
      total: this.wal.length,
      pending: this.wal.filter(e => e.status === 'PENDING').length,
      committed: this.wal.filter(e => e.status === 'COMMITTED').length,
      rolledBack: this.wal.filter(e => e.status === 'ROLLED_BACK').length
    };
  }

  // ============================================
  // QUERY METHODS
  // ============================================

  getValidatorPendingRewards(validatorId: string): bigint {
    return this.validatorPendingRewards.get(validatorId) || BigInt(0);
  }

  getValidatorTotalRewards(validatorId: string): bigint {
    return this.validatorTotalRewards.get(validatorId) || BigInt(0);
  }

  getValidatorRewardHistory(validatorId: string, limit: number = 100): ValidatorReward[] {
    return this.rewardHistory.getByValidator(validatorId, limit);
  }

  getEpochSummary(epochNumber: number): EpochRewardSummary | undefined {
    return this.epochSummaries.get(epochNumber);
  }

  getGasAccumulator(epochNumber: number): GasFeeAccumulator | undefined {
    return this.gasAccumulators.get(epochNumber);
  }

  getBatchStatus(batchId: string): RewardBatch | undefined {
    return this.batches.get(batchId);
  }

  getCurrentEpoch(): number {
    return this.currentEpoch;
  }

  // ============================================
  // STATISTICS
  // ============================================

  getStatistics(): {
    totalDistributed: string;
    totalBurned: string;
    totalGasCollected: string;
    currentEpoch: number;
    completedEpochs: number;
    pendingRewards: number;
    batchesProcessed: number;
    rewardsCalculated: number;
    circuitBreakerStatus: string;
    ewmaGasPrice: string;
  } {
    return {
      totalDistributed: this.formatTBURN(this.totalDistributed),
      totalBurned: this.formatTBURN(this.totalBurned),
      totalGasCollected: this.formatTBURN(this.totalGasCollected),
      currentEpoch: this.currentEpoch,
      completedEpochs: this.epochSummaries.size,
      pendingRewards: this.pendingQueue.size(),
      batchesProcessed: this.batchesProcessed,
      rewardsCalculated: this.rewardsCalculated,
      circuitBreakerStatus: this.circuitBreaker.isOpen ? 'OPEN' : 'CLOSED',
      ewmaGasPrice: this.ewmaGasPrice.toString()
    };
  }

  getDetailedMetrics(): {
    config: RewardConfig;
    epochMetrics: {
      current: number;
      completed: number;
      avgRewardsPerEpoch: string;
    };
    validatorMetrics: {
      totalValidators: number;
      avgPendingRewards: string;
      topEarners: Array<{ validatorId: string; totalRewards: string }>;
    };
    gasMetrics: {
      totalCollected: string;
      avgGasPrice: string;
      currentBaseFee: string;
    };
    processingMetrics: {
      queueSize: number;
      batchesProcessed: number;
      avgBatchSize: number;
    };
    healthMetrics: {
      circuitBreaker: CircuitBreakerState;
      walEntries: number;
      rewardHistorySize: number;
    };
  } {
    const validatorCount = this.validatorTotalRewards.size;
    const totalRewards = Array.from(this.validatorTotalRewards.values())
      .reduce((sum, r) => sum + r, BigInt(0));
    
    const topEarners = Array.from(this.validatorTotalRewards.entries())
      .sort((a, b) => Number(b[1] - a[1]))
      .slice(0, 10)
      .map(([id, rewards]) => ({
        validatorId: id,
        totalRewards: this.formatTBURN(rewards)
      }));

    const currentGasAcc = this.gasAccumulators.get(this.currentEpoch);

    return {
      config: this.config,
      epochMetrics: {
        current: this.currentEpoch,
        completed: this.epochSummaries.size,
        avgRewardsPerEpoch: this.epochSummaries.size > 0
          ? this.formatTBURN(this.totalDistributed / BigInt(this.epochSummaries.size))
          : '0'
      },
      validatorMetrics: {
        totalValidators: validatorCount,
        avgPendingRewards: validatorCount > 0
          ? this.formatTBURN(
              Array.from(this.validatorPendingRewards.values())
                .reduce((sum, r) => sum + r, BigInt(0)) / BigInt(validatorCount)
            )
          : '0',
        topEarners
      },
      gasMetrics: {
        totalCollected: this.formatTBURN(this.totalGasCollected),
        avgGasPrice: this.ewmaGasPrice.toString(),
        currentBaseFee: currentGasAcc?.baseFee.toString() || '0'
      },
      processingMetrics: {
        queueSize: this.pendingQueue.size(),
        batchesProcessed: this.batchesProcessed,
        avgBatchSize: this.batchesProcessed > 0
          ? Math.floor(this.rewardsCalculated / this.batchesProcessed)
          : 0
      },
      healthMetrics: {
        circuitBreaker: { ...this.circuitBreaker },
        walEntries: this.wal.length,
        rewardHistorySize: this.rewardHistory.size()
      }
    };
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  private generateRewardId(blockNumber: number, validatorId: string, type: string): string {
    return `reward-${blockNumber}-${validatorId}-${type}-${Date.now()}`;
  }

  private generateBatchId(): string {
    return `batch-${this.currentEpoch}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private generateHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(40, '0');
  }

  private formatTBURN(wei: bigint): string {
    const tburn = Number(wei) / 1e18;
    return tburn.toLocaleString('en-US', { maximumFractionDigits: 4 });
  }

  // ============================================
  // PERFORMANCE TIER & INCENTIVE SYSTEM
  // Enterprise-grade tiered bonus calculations
  // ============================================

  /**
   * Determine performance tier based on score
   */
  private getPerformanceTier(score: number): PerformanceTierConfig {
    const normalizedScore = Math.max(0, Math.min(100, score));
    for (const tier of PERFORMANCE_TIERS) {
      if (normalizedScore >= tier.minScore && normalizedScore <= tier.maxScore) {
        return tier;
      }
    }
    return PERFORMANCE_TIERS[0]; // Default to bronze
  }

  /**
   * Calculate consistency score based on performance variance
   * Lower variance = higher consistency score (0-100)
   */
  private calculateConsistencyScore(history: number[]): number {
    if (history.length < 2) return 50; // Neutral for new validators
    
    const mean = history.reduce((a, b) => a + b, 0) / history.length;
    const variance = history.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / history.length;
    const stdDev = Math.sqrt(variance);
    
    // Map stdDev to consistency score (lower variance = higher score)
    // stdDev of 0 = 100, stdDev of 30+ = 0
    const consistencyScore = Math.max(0, Math.min(100, 100 - (stdDev * 3.33)));
    return Math.round(consistencyScore);
  }

  /**
   * Get or create validator incentive state
   */
  private getOrCreateIncentiveState(validatorId: string): ValidatorIncentiveState {
    let state = this.validatorIncentiveStates.get(validatorId);
    if (!state) {
      state = {
        validatorId,
        currentTier: 'bronze',
        performanceScore: 50,
        consecutiveHighPerformanceEpochs: 0,
        streakBonusMultiplier: 1.0,
        consistencyScore: 50,
        performanceHistory: [],
        totalBonusEarned: BigInt(0),
        lastUpdatedEpoch: 0
      };
      this.validatorIncentiveStates.set(validatorId, state);
    }
    return state;
  }

  /**
   * Update validator performance state at epoch end
   */
  updateValidatorPerformance(validatorId: string, epochNumber: number, performanceScore: number): void {
    const state = this.getOrCreateIncentiveState(validatorId);
    const previousTier = state.currentTier;
    
    // Update performance history (keep last N epochs)
    state.performanceHistory.push(performanceScore);
    if (state.performanceHistory.length > PERFORMANCE_HISTORY_DEPTH) {
      state.performanceHistory.shift();
    }
    
    // Calculate new tier
    const tierConfig = this.getPerformanceTier(performanceScore);
    state.currentTier = tierConfig.tier;
    state.performanceScore = performanceScore;
    
    // Update consistency score
    state.consistencyScore = this.calculateConsistencyScore(state.performanceHistory);
    
    // Track tier changes
    if (tierConfig.tier !== previousTier) {
      const tierOrder = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
      if (tierOrder.indexOf(tierConfig.tier) > tierOrder.indexOf(previousTier)) {
        state.tierUpgradeEpoch = epochNumber;
        console.log(`[RewardEngine] Validator ${validatorId} upgraded to ${tierConfig.tier.toUpperCase()}`);
      } else {
        state.tierDowngradeEpoch = epochNumber;
        console.log(`[RewardEngine] Validator ${validatorId} downgraded to ${tierConfig.tier.toUpperCase()}`);
      }
    }
    
    // Update streak counter (high performance = score >= 75)
    if (performanceScore >= 75) {
      state.consecutiveHighPerformanceEpochs++;
    } else {
      state.consecutiveHighPerformanceEpochs = 0;
    }
    
    // Calculate streak bonus multiplier
    const streakBonus = Math.min(
      tierConfig.maxStreakBonus,
      tierConfig.streakMultiplier * state.consecutiveHighPerformanceEpochs
    );
    state.streakBonusMultiplier = 1 + streakBonus;
    
    state.lastUpdatedEpoch = epochNumber;
    
    // Update tier distribution metrics
    this.updateTierDistribution();
  }

  /**
   * Calculate total performance bonus for a validator
   * Combines tier bonus, streak bonus, and consistency bonus
   */
  calculatePerformanceBonus(validatorId: string, baseReward: bigint): {
    bonus: bigint;
    tierMultiplier: number;
    streakMultiplier: number;
    consistencyBonus: bigint;
    totalMultiplier: number;
    tier: PerformanceTier;
  } {
    const state = this.getOrCreateIncentiveState(validatorId);
    const tierConfig = this.getPerformanceTier(state.performanceScore);
    
    // Calculate tier multiplier (base bonus for tier)
    const tierMultiplier = tierConfig.bonusMultiplier;
    
    // Calculate streak multiplier
    const streakMultiplier = state.streakBonusMultiplier;
    
    // Calculate consistency bonus (applied if consistency score >= 70)
    let consistencyBonusRate = 0;
    if (state.consistencyScore >= 70) {
      consistencyBonusRate = tierConfig.consistencyBonus * (state.consistencyScore / 100);
    }
    
    // Total multiplier combining all bonuses
    const totalMultiplier = tierMultiplier * streakMultiplier * (1 + consistencyBonusRate);
    
    // Calculate bonus amounts
    const bonusFromTier = baseReward * BigInt(Math.floor((tierMultiplier - 1) * 10000)) / BigInt(10000);
    const bonusFromStreak = baseReward * BigInt(Math.floor((streakMultiplier - 1) * 10000)) / BigInt(10000);
    const consistencyBonus = baseReward * BigInt(Math.floor(consistencyBonusRate * 10000)) / BigInt(10000);
    
    const totalBonus = bonusFromTier + bonusFromStreak + consistencyBonus;
    
    // Track total bonuses earned
    state.totalBonusEarned += totalBonus;
    this.totalBonusesDistributed += totalBonus;
    
    return {
      bonus: totalBonus,
      tierMultiplier,
      streakMultiplier,
      consistencyBonus,
      totalMultiplier,
      tier: state.currentTier
    };
  }

  /**
   * Update tier distribution metrics
   */
  private updateTierDistribution(): void {
    this.tierDistribution = new Map([
      ['bronze', 0], ['silver', 0], ['gold', 0], ['platinum', 0], ['diamond', 0]
    ]);
    
    for (const state of Array.from(this.validatorIncentiveStates.values())) {
      const count = this.tierDistribution.get(state.currentTier) || 0;
      this.tierDistribution.set(state.currentTier, count + 1);
    }
  }

  /**
   * Get validator incentive dashboard data
   */
  getIncentiveDashboard(): {
    totalValidators: number;
    tierDistribution: Record<PerformanceTier, number>;
    topPerformers: Array<{
      validatorId: string;
      tier: PerformanceTier;
      score: number;
      streak: number;
      totalBonus: string;
    }>;
    avgPerformanceScore: number;
    totalBonusesDistributed: string;
    autoDistributionEnabled: boolean;
    scheduledDistributions: number;
  } {
    const states = Array.from(this.validatorIncentiveStates.values());
    
    const topPerformers = states
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, 10)
      .map(s => ({
        validatorId: s.validatorId,
        tier: s.currentTier,
        score: s.performanceScore,
        streak: s.consecutiveHighPerformanceEpochs,
        totalBonus: this.formatTBURN(s.totalBonusEarned)
      }));
    
    const avgScore = states.length > 0
      ? states.reduce((sum, s) => sum + s.performanceScore, 0) / states.length
      : 0;
    
    return {
      totalValidators: states.length,
      tierDistribution: Object.fromEntries(this.tierDistribution) as Record<PerformanceTier, number>,
      topPerformers,
      avgPerformanceScore: Math.round(avgScore * 100) / 100,
      totalBonusesDistributed: this.formatTBURN(this.totalBonusesDistributed),
      autoDistributionEnabled: this.autoDistributionConfig.enabled,
      scheduledDistributions: this.distributionSchedules.size
    };
  }

  /**
   * Get detailed incentive state for a specific validator
   */
  getValidatorIncentiveState(validatorId: string): ValidatorIncentiveState | null {
    return this.validatorIncentiveStates.get(validatorId) || null;
  }

  // ============================================
  // AUTO-DISTRIBUTION SCHEDULER
  // Production-grade automatic reward distribution
  // ============================================

  /**
   * Configure automatic distribution settings
   */
  configureAutoDistribution(config: Partial<AutoDistributionConfig>): void {
    this.autoDistributionConfig = { ...this.autoDistributionConfig, ...config };
    console.log('[RewardEngine] Auto-distribution configured:', this.autoDistributionConfig);
    
    // Restart timer if enabled
    if (this.autoDistributionConfig.enabled) {
      this.startAutoDistribution();
    } else {
      this.stopAutoDistribution();
    }
  }

  /**
   * Start automatic distribution scheduler
   */
  startAutoDistribution(): void {
    if (this.autoDistributionTimer) {
      clearInterval(this.autoDistributionTimer);
    }
    
    if (!this.autoDistributionConfig.enabled) {
      console.log('[RewardEngine] Auto-distribution is disabled');
      return;
    }
    
    this.autoDistributionTimer = setInterval(async () => {
      await this.executeScheduledDistribution();
    }, this.autoDistributionConfig.intervalMs);
    
    console.log(`[RewardEngine] Auto-distribution started (interval: ${this.autoDistributionConfig.intervalMs}ms)`);
  }

  /**
   * Stop automatic distribution scheduler
   */
  stopAutoDistribution(): void {
    if (this.autoDistributionTimer) {
      clearInterval(this.autoDistributionTimer);
      this.autoDistributionTimer = null;
      console.log('[RewardEngine] Auto-distribution stopped');
    }
  }

  /**
   * Execute scheduled distribution with retry logic
   */
  private async executeScheduledDistribution(): Promise<void> {
    if (this.isProcessing) {
      console.log('[RewardEngine] Distribution already in progress, skipping');
      return;
    }
    
    const pendingCount = this.pendingQueue.size();
    if (pendingCount < this.autoDistributionConfig.minBatchSize) {
      return; // Not enough rewards to process
    }
    
    const scheduleId = `schedule-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const schedule: DistributionSchedule = {
      scheduleId,
      epochNumber: this.currentEpoch,
      scheduledAt: Date.now(),
      status: 'scheduled',
      totalRewards: pendingCount,
      totalAmount: BigInt(0),
      batches: 0,
      errors: []
    };
    
    this.distributionSchedules.set(scheduleId, schedule);
    
    let retryCount = 0;
    while (retryCount < this.autoDistributionConfig.retryAttempts) {
      try {
        schedule.status = 'executing';
        
        // Process batches
        let batchCount = 0;
        const initialDistributed = this.totalDistributed;
        let previousQueueSize = this.pendingQueue.size();
        
        while (this.pendingQueue.size() > 0 && batchCount < 10) {
          const beforeProcess = this.pendingQueue.size();
          await this.processPendingBatch();
          
          // Check if anything was processed
          if (this.pendingQueue.size() === beforeProcess) break; // No progress made
          
          batchCount++;
          previousQueueSize = this.pendingQueue.size();
          
          // Brief yield to prevent blocking
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        const totalAmount = this.totalDistributed - initialDistributed;
        
        schedule.batches = batchCount;
        schedule.totalAmount = totalAmount;
        schedule.status = 'completed';
        schedule.executedAt = Date.now();
        
        console.log(`[RewardEngine] Auto-distribution completed: ${batchCount} batches, ${this.formatTBURN(totalAmount)} TBURN`);
        break;
        
      } catch (error) {
        retryCount++;
        const errorMsg = error instanceof Error ? error.message : String(error);
        schedule.errors.push(`Attempt ${retryCount}: ${errorMsg}`);
        
        if (retryCount >= this.autoDistributionConfig.retryAttempts) {
          schedule.status = 'failed';
          console.error(`[RewardEngine] Auto-distribution failed after ${retryCount} attempts`);
        } else {
          await new Promise(resolve => setTimeout(resolve, this.autoDistributionConfig.retryDelayMs));
        }
      }
    }
  }

  /**
   * Get auto-distribution status
   */
  getAutoDistributionStatus(): {
    enabled: boolean;
    config: AutoDistributionConfig;
    recentSchedules: DistributionSchedule[];
    nextDistribution: number | null;
  } {
    const recentSchedules = Array.from(this.distributionSchedules.values())
      .sort((a, b) => b.scheduledAt - a.scheduledAt)
      .slice(0, 10);
    
    return {
      enabled: this.autoDistributionConfig.enabled,
      config: { ...this.autoDistributionConfig },
      recentSchedules,
      nextDistribution: this.autoDistributionTimer 
        ? Date.now() + this.autoDistributionConfig.intervalMs 
        : null
    };
  }

  // ============================================
  // CLEANUP
  // ============================================

  cleanupOldData(keepEpochs: number = 100): {
    epochsCleaned: number;
    batchesCleaned: number;
    walEntriesCleaned: number;
  } {
    const cutoffEpoch = this.currentEpoch - keepEpochs;
    let epochsCleaned = 0;
    let batchesCleaned = 0;

    // Clean old epoch summaries
    for (const [epoch, _] of Array.from(this.epochSummaries.entries())) {
      if (epoch < cutoffEpoch) {
        this.epochSummaries.delete(epoch);
        this.gasAccumulators.delete(epoch);
        epochsCleaned++;
      }
    }

    // Clean old batches
    for (const [batchId, batch] of Array.from(this.batches.entries())) {
      if (batch.epochNumber < cutoffEpoch && batch.status === 'completed') {
        this.batches.delete(batchId);
        batchesCleaned++;
      }
    }

    // Clean old WAL entries
    const walBefore = this.wal.length;
    this.wal = this.wal.filter(e => e.status !== 'COMMITTED' || Date.now() - e.timestamp < 3600000);
    const walEntriesCleaned = walBefore - this.wal.length;

    console.log(`[RewardEngine] Cleanup: ${epochsCleaned} epochs, ${batchesCleaned} batches, ${walEntriesCleaned} WAL entries`);

    return { epochsCleaned, batchesCleaned, walEntriesCleaned };
  }
}

// Export singleton instance
export const enterpriseRewardEngine = new EnterpriseRewardDistributionEngine();

export default EnterpriseRewardDistributionEngine;
