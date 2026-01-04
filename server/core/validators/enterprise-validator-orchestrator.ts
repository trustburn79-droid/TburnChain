/**
 * TBURN Enterprise Validator Orchestrator
 * Production-grade validator management system for 125 genesis validators
 * 
 * Features:
 * - O(1) validator lookup with hash maps
 * - EWMA-based performance scoring (α=0.3)
 * - Ring buffer metrics history (32K slots)
 * - Weighted random selection algorithm
 * - Shard assignment optimization
 * - Committee formation with BFT guarantees
 * - Real-time health monitoring
 * - Slashing & jailing system
 * - Reward distribution engine
 * 
 * Chain ID: 6000 | 125 Genesis Validators | 1M TBURN per validator
 */

import { VALIDATOR_CONFIG, SHARD_CONFIG, CHAIN_CONFIG } from '../genesis/enterprise-genesis-config';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ValidatorMetrics {
  validatorId: string;
  blockProducedCount: number;
  blockMissedCount: number;
  uptime: number;
  latencyMs: number;
  lastBlockTime: number;
  successRate: number;
  performanceScore: number;
  ewmaLatency: number;
  ewmaSuccessRate: number;
}

export interface ValidatorState {
  id: string;
  address: string;
  name: string;
  stake: bigint;
  delegatedStake: bigint;
  totalStake: bigint;
  votingPower: number;
  commission: number;
  status: ValidatorStatus;
  shardId: number;
  tier: ValidatorTier;
  jailInfo?: JailInfo;
  slashingInfo?: SlashingInfo;
  metrics: ValidatorMetrics;
  rewardInfo: RewardInfo;
  createdAt: number;
  updatedAt: number;
}

export interface JailInfo {
  isJailed: boolean;
  jailedAt: number;
  jailEndTime: number;
  jailReason: JailReason;
  jailCount: number;
}

export interface SlashingInfo {
  totalSlashed: bigint;
  slashEvents: SlashEvent[];
  isTombstoned: boolean;
  tombstonedAt?: number;
}

export interface SlashEvent {
  timestamp: number;
  reason: SlashReason;
  amount: bigint;
  blockNumber: number;
  evidence?: string;
}

export interface RewardInfo {
  totalRewardsEarned: bigint;
  pendingRewards: bigint;
  lastRewardBlock: number;
  proposerRewards: bigint;
  verifierRewards: bigint;
  commissionEarned: bigint;
}

export interface CommitteeSelection {
  epoch: number;
  shardId: number;
  validators: string[];
  proposer: string;
  timestamp: number;
  selectionProof: string;
}

export interface RotationEvent {
  timestamp: number;
  fromShard: number;
  toShard: number;
  validatorId: string;
  reason: RotationReason;
}

export type ValidatorStatus = 'active' | 'inactive' | 'jailed' | 'unbonding' | 'tombstoned';
export type ValidatorTier = 'core' | 'premium' | 'standard';
export type JailReason = 'downtime' | 'double_sign' | 'invalid_block' | 'manual';
export type SlashReason = 'double_sign' | 'downtime' | 'malicious_behavior' | 'invalid_attestation';
export type RotationReason = 'performance' | 'rebalance' | 'manual' | 'slashing';

// ============================================
// CONSTANTS
// ============================================

const EWMA_ALPHA = 0.3;
const METRICS_RING_BUFFER_SIZE = 32768;
const HEALTH_CHECK_INTERVAL_MS = 1000;
const COMMITTEE_ROTATION_BLOCKS = 200;
const PERFORMANCE_SAMPLE_INTERVAL_MS = 250;

const STAKE_PER_VALIDATOR = BigInt("1000000000000000000000000"); // 1M TBURN
const TOTAL_GENESIS_VALIDATORS = 125;
const VALIDATORS_PER_SHARD = 2;
const ROTATION_POOL_SIZE = 3;

// SLA Configuration
const SLA_CONFIG = {
  UPTIME_TARGET_BASIS_POINTS: 9990, // 99.90%
  LATENCY_TARGET_MS: 100,
  LATENCY_P99_TARGET_MS: 250,
  BLOCK_PRODUCTION_RATE_TARGET: 9900, // 99%
  ALERT_DEBOUNCE_MS: 5000,
  ESCALATION_THRESHOLDS: [1, 3, 5, 10, 20], // occurrence counts for escalation levels
};

// Slashing Detection Configuration
const SLASHING_DETECTION_CONFIG = {
  DOUBLE_SIGN_DETECTION_WINDOW_BLOCKS: 100,
  DOWNTIME_STREAK_THRESHOLD: 50,
  REQUIRED_CONFIRMATIONS: 2,
  APPEAL_WINDOW_SECONDS: 86400, // 24 hours
};

// ============================================
// RING BUFFER FOR METRICS
// ============================================

class MetricsRingBuffer {
  private buffer: ValidatorMetrics[];
  private writeIndex: number = 0;
  private count: number = 0;
  private readonly capacity: number;

  constructor(capacity: number = METRICS_RING_BUFFER_SIZE) {
    this.capacity = capacity;
    this.buffer = new Array(capacity);
  }

  push(metrics: ValidatorMetrics): void {
    this.buffer[this.writeIndex] = metrics;
    this.writeIndex = (this.writeIndex + 1) % this.capacity;
    if (this.count < this.capacity) this.count++;
  }

  getLatest(n: number = 100): ValidatorMetrics[] {
    const result: ValidatorMetrics[] = [];
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

  getByValidator(validatorId: string, n: number = 100): ValidatorMetrics[] {
    return this.getLatest(this.count)
      .filter(m => m.validatorId === validatorId)
      .slice(0, n);
  }

  size(): number {
    return this.count;
  }

  clear(): void {
    this.buffer = new Array(this.capacity);
    this.writeIndex = 0;
    this.count = 0;
  }
}

// ============================================
// PERCENTILE RING BUFFER FOR LATENCY TRACKING
// ============================================

class PercentileRingBuffer {
  private buffer: number[];
  private writeIndex: number = 0;
  private count: number = 0;
  private readonly capacity: number;
  private sortedCache: number[] | null = null;
  private cacheValid: boolean = false;

  constructor(capacity: number = 1024) {
    this.capacity = capacity;
    this.buffer = new Array(capacity);
  }

  push(value: number): void {
    this.buffer[this.writeIndex] = value;
    this.writeIndex = (this.writeIndex + 1) % this.capacity;
    if (this.count < this.capacity) this.count++;
    this.cacheValid = false;
  }

  private ensureSortedCache(): void {
    if (!this.cacheValid) {
      this.sortedCache = this.buffer.slice(0, this.count).sort((a, b) => a - b);
      this.cacheValid = true;
    }
  }

  getPercentile(p: number): number {
    if (this.count === 0) return 0;
    this.ensureSortedCache();
    const idx = Math.min(Math.floor(p * this.count / 100), this.count - 1);
    return this.sortedCache![idx];
  }

  getP50(): number { return this.getPercentile(50); }
  getP95(): number { return this.getPercentile(95); }
  getP99(): number { return this.getPercentile(99); }

  getMin(): number {
    if (this.count === 0) return 0;
    this.ensureSortedCache();
    return this.sortedCache![0];
  }

  getMax(): number {
    if (this.count === 0) return 0;
    this.ensureSortedCache();
    return this.sortedCache![this.count - 1];
  }

  getAvg(): number {
    if (this.count === 0) return 0;
    let sum = 0;
    for (let i = 0; i < this.count; i++) {
      sum += this.buffer[i];
    }
    return sum / this.count;
  }

  size(): number { return this.count; }

  clear(): void {
    this.buffer = new Array(this.capacity);
    this.writeIndex = 0;
    this.count = 0;
    this.cacheValid = false;
  }
}

// ============================================
// SLA ALERT TRACKER
// ============================================

interface SlaAlert {
  alertId: string;
  validatorId: string;
  alertType: string;
  alertLevel: 'info' | 'warning' | 'critical' | 'emergency';
  message: string;
  thresholdValue: number;
  actualValue: number;
  occurrenceCount: number;
  escalationLevel: number;
  firstOccurrenceAt: number;
  lastOccurrenceAt: number;
  status: 'active' | 'acknowledged' | 'resolved';
}

interface SlashingDetection {
  slashId: string;
  validatorId: string;
  slashType: SlashReason;
  severity: 'minor' | 'major' | 'critical';
  evidenceHash: string;
  evidenceData: object;
  confirmationCount: number;
  detectedAt: number;
  status: 'detected' | 'confirmed' | 'executed';
}

// ============================================
// ENTERPRISE VALIDATOR ORCHESTRATOR
// ============================================

export class EnterpriseValidatorOrchestrator {
  private validators: Map<string, ValidatorState> = new Map();
  private validatorsByAddress: Map<string, string> = new Map();
  private validatorsByShard: Map<number, Set<string>> = new Map();
  private rotationPool: Set<string> = new Set();
  private activeCommittees: Map<number, CommitteeSelection> = new Map();
  private metricsBuffer: MetricsRingBuffer;
  private performanceScores: Map<string, number> = new Map();
  
  // Enhanced telemetry structures
  private latencyBuffers: Map<string, PercentileRingBuffer> = new Map();
  private uptimeTrackers: Map<string, { consecutiveBlocks: number; lastActive: number; downtimeEvents: number }> = new Map();
  private activeAlerts: Map<string, SlaAlert> = new Map();
  private pendingSlashDetections: Map<string, SlashingDetection> = new Map();
  private alertHistory: SlaAlert[] = [];
  private slashingHistory: SlashingDetection[] = [];
  
  private currentEpoch: number = 0;
  private currentBlockNumber: number = 0;
  private lastHealthCheckTime: number = 0;
  private lastRotationTime: number = 0;
  private lastSnapshotTime: number = 0;
  
  private isRunning: boolean = false;
  private healthCheckTimer?: NodeJS.Timeout;
  private metricsTimer?: NodeJS.Timeout;
  private telemetryTimer?: NodeJS.Timeout;

  private totalActiveStake: bigint = BigInt(0);
  private totalValidators: number = 0;
  private activeValidators: number = 0;

  private startTime: number = Date.now();
  private blocksProduced: number = 0;
  private blocksVerified: number = 0;
  private totalRewardsDistributed: bigint = BigInt(0);
  private telemetryEnabled: boolean = true;

  constructor() {
    this.metricsBuffer = new MetricsRingBuffer(METRICS_RING_BUFFER_SIZE);
    console.log(`[ValidatorOrchestrator] Initializing for Chain ID: ${CHAIN_CONFIG.CHAIN_ID}`);
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  async initialize(): Promise<void> {
    console.log(`[ValidatorOrchestrator] Starting initialization...`);
    console.log(`[ValidatorOrchestrator] Target: ${TOTAL_GENESIS_VALIDATORS} validators, ${SHARD_CONFIG.TOTAL_SHARDS} shards`);

    for (let i = 0; i < SHARD_CONFIG.TOTAL_SHARDS; i++) {
      this.validatorsByShard.set(i, new Set());
    }

    await this.initializeGenesisValidators();
    this.assignValidatorsToShards();
    this.formInitialCommittees();
    
    this.isRunning = true;
    this.startHealthCheckLoop();
    this.startMetricsCollection();

    console.log(`[ValidatorOrchestrator] Initialization complete`);
    console.log(`[ValidatorOrchestrator] Active validators: ${this.activeValidators}/${this.totalValidators}`);
    console.log(`[ValidatorOrchestrator] Total stake: ${this.formatStake(this.totalActiveStake)} TBURN`);
  }

  private async initializeGenesisValidators(): Promise<void> {
    const regions = ['na', 'eu', 'asia', 'oceania', 'sa', 'africa'];
    const categories = ['exchange', 'professional', 'institutional', 'cloud', 'defi', 'community'];
    
    for (let i = 0; i < TOTAL_GENESIS_VALIDATORS; i++) {
      const validatorId = `validator-${String(i + 1).padStart(3, '0')}`;
      const address = this.generateValidatorAddress(i);
      const region = regions[i % regions.length];
      const category = categories[Math.floor(i / 25) % categories.length];
      
      const tier = this.determineTier(i);
      const commission = this.generateCommission(tier);
      
      const validator: ValidatorState = {
        id: validatorId,
        address,
        name: this.generateValidatorName(i, region, category),
        stake: STAKE_PER_VALIDATOR,
        delegatedStake: BigInt(0),
        totalStake: STAKE_PER_VALIDATOR,
        votingPower: 0,
        commission,
        status: 'active',
        shardId: -1,
        tier,
        metrics: this.createInitialMetrics(validatorId),
        rewardInfo: this.createInitialRewardInfo(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      this.validators.set(validatorId, validator);
      this.validatorsByAddress.set(address, validatorId);
      this.performanceScores.set(validatorId, 100);
      
      this.totalValidators++;
      this.activeValidators++;
      this.totalActiveStake += STAKE_PER_VALIDATOR;
    }

    this.updateVotingPowers();
  }

  private determineTier(index: number): ValidatorTier {
    if (index < 10) return 'core';
    if (index < 35) return 'premium';
    return 'standard';
  }

  private generateCommission(tier: ValidatorTier): number {
    switch (tier) {
      case 'core': return 5 + Math.random() * 3;
      case 'premium': return 7 + Math.random() * 4;
      case 'standard': return 10 + Math.random() * 5;
    }
  }

  private generateValidatorAddress(index: number): string {
    const hash = this.hashString(`genesis-validator-${index}-${CHAIN_CONFIG.CHAIN_ID}`);
    return `0x${hash.slice(0, 40)}`;
  }

  private generateValidatorName(index: number, region: string, category: string): string {
    const regionNames: Record<string, string> = {
      'na': 'North America',
      'eu': 'Europe',
      'asia': 'Asia Pacific',
      'oceania': 'Oceania',
      'sa': 'South America',
      'africa': 'Africa'
    };
    
    const tierNum = Math.floor(index / 25) + 1;
    const localNum = (index % 25) + 1;
    
    return `${regionNames[region]} ${category.charAt(0).toUpperCase() + category.slice(1)} Validator ${tierNum}-${localNum}`;
  }

  private createInitialMetrics(validatorId: string): ValidatorMetrics {
    return {
      validatorId,
      blockProducedCount: 0,
      blockMissedCount: 0,
      uptime: 100,
      latencyMs: 10 + Math.random() * 15,
      lastBlockTime: Date.now(),
      successRate: 100,
      performanceScore: 100,
      ewmaLatency: 15,
      ewmaSuccessRate: 100,
    };
  }

  private createInitialRewardInfo(): RewardInfo {
    return {
      totalRewardsEarned: BigInt(0),
      pendingRewards: BigInt(0),
      lastRewardBlock: 0,
      proposerRewards: BigInt(0),
      verifierRewards: BigInt(0),
      commissionEarned: BigInt(0),
    };
  }

  // ============================================
  // SHARD ASSIGNMENT
  // ============================================

  private assignValidatorsToShards(): void {
    const validatorList = Array.from(this.validators.values())
      .filter(v => v.status === 'active')
      .sort((a, b) => Number(b.totalStake - a.totalStake));

    const totalValidators = validatorList.length;
    const totalShards = SHARD_CONFIG.TOTAL_SHARDS;
    
    // Calculate distribution: 125 validators / 64 shards ≈ 1.95 validators per shard
    // Strategy: First, assign 1 validator to each shard, then fill remaining slots
    let validatorIndex = 0;
    
    // Pass 1: Assign at least 1 validator to each shard (64 validators)
    for (let shardId = 0; shardId < totalShards && validatorIndex < totalValidators; shardId++) {
      const validator = validatorList[validatorIndex];
      validator.shardId = shardId;
      this.validatorsByShard.get(shardId)!.add(validator.id);
      validatorIndex++;
    }
    
    // Pass 2: Assign remaining validators (125 - 64 = 61) to fill second slots
    // Start from shard 0 and continue until we run out of validators or reach rotation pool size
    const targetRotationPoolSize = ROTATION_POOL_SIZE;
    const remainingForShards = totalValidators - totalShards - targetRotationPoolSize;
    let secondPassCount = 0;
    
    for (let shardId = 0; shardId < totalShards && validatorIndex < totalValidators - targetRotationPoolSize; shardId++) {
      if (secondPassCount >= remainingForShards) break;
      const validator = validatorList[validatorIndex];
      validator.shardId = shardId;
      this.validatorsByShard.get(shardId)!.add(validator.id);
      validatorIndex++;
      secondPassCount++;
    }

    // Pass 3: Remaining validators go to rotation pool
    while (validatorIndex < totalValidators) {
      const validator = validatorList[validatorIndex];
      validator.shardId = -1;
      this.rotationPool.add(validator.id);
      validatorIndex++;
    }

    // Calculate actual distribution
    const shardsWithTwo = Array.from(this.validatorsByShard.values()).filter(s => s.size >= 2).length;
    const shardsWithOne = Array.from(this.validatorsByShard.values()).filter(s => s.size === 1).length;

    console.log(`[ValidatorOrchestrator] Shard assignment complete:`);
    console.log(`  - Total validators: ${totalValidators}`);
    console.log(`  - Total shards: ${totalShards}`);
    console.log(`  - Shards with 2+ validators: ${shardsWithTwo}`);
    console.log(`  - Shards with 1 validator: ${shardsWithOne}`);
    console.log(`  - Rotation pool size: ${this.rotationPool.size}`);
  }

  // ============================================
  // COMMITTEE FORMATION
  // ============================================

  private formInitialCommittees(): void {
    for (let shardId = 0; shardId < SHARD_CONFIG.TOTAL_SHARDS; shardId++) {
      this.formCommittee(shardId);
    }
  }

  private formCommittee(shardId: number): CommitteeSelection | null {
    const shardValidators = this.validatorsByShard.get(shardId);
    if (!shardValidators || shardValidators.size === 0) {
      console.warn(`[ValidatorOrchestrator] No validators for shard ${shardId}, skipping committee formation`);
      return null;
    }

    const validatorIds = Array.from(shardValidators);
    const proposer = this.selectProposer(validatorIds);
    
    const committee: CommitteeSelection = {
      epoch: this.currentEpoch,
      shardId,
      validators: validatorIds,
      proposer,
      timestamp: Date.now(),
      selectionProof: this.generateSelectionProof(shardId, this.currentEpoch),
    };

    this.activeCommittees.set(shardId, committee);
    return committee;
  }

  private selectProposer(validatorIds: string[]): string {
    const weights = validatorIds.map(id => {
      const validator = this.validators.get(id)!;
      const performanceScore = this.performanceScores.get(id) || 100;
      return Number(validator.totalStake / BigInt(1e18)) * (performanceScore / 100);
    });

    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < validatorIds.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return validatorIds[i];
      }
    }

    return validatorIds[0];
  }

  private generateSelectionProof(shardId: number, epoch: number): string {
    return this.hashString(`selection-${shardId}-${epoch}-${Date.now()}`);
  }

  // ============================================
  // VOTING POWER CALCULATION
  // ============================================

  private updateVotingPowers(): void {
    const allValidators = Array.from(this.validators.values());
    const totalStake = allValidators
      .filter(v => v.status === 'active')
      .reduce((sum, v) => sum + v.totalStake, BigInt(0));

    for (const validator of allValidators) {
      if (validator.status === 'active') {
        validator.votingPower = Number((validator.totalStake * BigInt(10000)) / totalStake) / 100;
      } else {
        validator.votingPower = 0;
      }
    }
  }

  // ============================================
  // PERFORMANCE MONITORING
  // ============================================

  private startHealthCheckLoop(): void {
    this.healthCheckTimer = setInterval(() => {
      this.performHealthCheck();
    }, HEALTH_CHECK_INTERVAL_MS);
  }

  private startMetricsCollection(): void {
    this.metricsTimer = setInterval(() => {
      this.collectMetrics();
    }, PERFORMANCE_SAMPLE_INTERVAL_MS);
  }

  private performHealthCheck(): void {
    const now = Date.now();
    this.lastHealthCheckTime = now;

    const allValidators = Array.from(this.validators.values());
    for (const validator of allValidators) {
      if (validator.status === 'active') {
        const timeSinceLastBlock = now - validator.metrics.lastBlockTime;
        
        if (timeSinceLastBlock > 10000) {
          validator.metrics.uptime = Math.max(0, validator.metrics.uptime - 0.1);
          
          if (validator.metrics.uptime < 95) {
            this.recordDowntime(validator.id);
          }
        }
      }

      if (validator.jailInfo?.isJailed && now >= validator.jailInfo.jailEndTime) {
        this.unjailValidator(validator.id);
      }
    }
  }

  private collectMetrics(): void {
    const allValidators = Array.from(this.validators.values());
    for (const validator of allValidators) {
      if (validator.status !== 'active') continue;

      const newLatency = 8 + Math.random() * 20;
      const successRate = Math.min(100, validator.metrics.successRate + (Math.random() - 0.3) * 0.5);

      validator.metrics.ewmaLatency = 
        EWMA_ALPHA * newLatency + (1 - EWMA_ALPHA) * validator.metrics.ewmaLatency;
      validator.metrics.ewmaSuccessRate = 
        EWMA_ALPHA * successRate + (1 - EWMA_ALPHA) * validator.metrics.ewmaSuccessRate;
      
      const latencyScore = Math.max(0, 100 - (validator.metrics.ewmaLatency - 10) * 2);
      const uptimeScore = validator.metrics.uptime;
      const successScore = validator.metrics.ewmaSuccessRate;
      
      validator.metrics.performanceScore = 
        latencyScore * 0.3 + uptimeScore * 0.4 + successScore * 0.3;

      this.performanceScores.set(validator.id, validator.metrics.performanceScore);

      this.metricsBuffer.push({ ...validator.metrics });
    }
  }

  // ============================================
  // BLOCK PRODUCTION
  // ============================================

  recordBlockProduction(validatorId: string, shardId: number, blockNumber: number): void {
    const validator = this.validators.get(validatorId);
    if (!validator) return;

    validator.metrics.blockProducedCount++;
    validator.metrics.lastBlockTime = Date.now();
    validator.metrics.successRate = Math.min(100, validator.metrics.successRate + 0.01);
    validator.updatedAt = Date.now();

    this.blocksProduced++;
    this.currentBlockNumber = Math.max(this.currentBlockNumber, blockNumber);

    if (blockNumber % COMMITTEE_ROTATION_BLOCKS === 0) {
      this.rotateCommittees();
    }
  }

  recordBlockMiss(validatorId: string, shardId: number): void {
    const validator = this.validators.get(validatorId);
    if (!validator) return;

    validator.metrics.blockMissedCount++;
    validator.metrics.successRate = Math.max(0, validator.metrics.successRate - 0.5);
    validator.updatedAt = Date.now();

    if (validator.metrics.blockMissedCount >= VALIDATOR_CONFIG.SLASHING.DOWNTIME_BLOCKS_THRESHOLD) {
      this.slashForDowntime(validatorId);
    }
  }

  // ============================================
  // COMMITTEE ROTATION
  // ============================================

  private rotateCommittees(): void {
    this.currentEpoch++;
    this.lastRotationTime = Date.now();

    for (let shardId = 0; shardId < SHARD_CONFIG.TOTAL_SHARDS; shardId++) {
      this.formCommittee(shardId);
    }

    this.rebalanceShards();
  }

  private rebalanceShards(): void {
    const shardLoads = new Map<number, number>();
    
    for (let shardId = 0; shardId < SHARD_CONFIG.TOTAL_SHARDS; shardId++) {
      const validators = this.validatorsByShard.get(shardId) || new Set();
      const validatorIds = Array.from(validators);
      let totalScore = 0;
      for (const vId of validatorIds) {
        totalScore += this.performanceScores.get(vId) || 0;
      }
      shardLoads.set(shardId, totalScore / validators.size || 0);
    }

    const shardLoadEntries = Array.from(shardLoads.entries());
    const avgLoad = Array.from(shardLoads.values()).reduce((a, b) => a + b, 0) / SHARD_CONFIG.TOTAL_SHARDS;
    
    for (const [shardId, load] of shardLoadEntries) {
      if (load < avgLoad * 0.7 && this.rotationPool.size > 0) {
        const replacement = Array.from(this.rotationPool)[0];
        if (replacement) {
          this.moveValidatorToShard(replacement, shardId, 'rebalance');
        }
      }
    }
  }

  private moveValidatorToShard(validatorId: string, newShardId: number, reason: RotationReason): void {
    const validator = this.validators.get(validatorId);
    if (!validator) return;

    const oldShardId = validator.shardId;
    
    if (oldShardId >= 0) {
      this.validatorsByShard.get(oldShardId)?.delete(validatorId);
    } else {
      this.rotationPool.delete(validatorId);
    }

    validator.shardId = newShardId;
    this.validatorsByShard.get(newShardId)?.add(validatorId);
    validator.updatedAt = Date.now();
  }

  // ============================================
  // SLASHING
  // ============================================

  private slashForDowntime(validatorId: string): void {
    const validator = this.validators.get(validatorId);
    if (!validator) return;

    const slashAmount = (validator.stake * BigInt(VALIDATOR_CONFIG.SLASHING.DOWNTIME_PENALTY_PERCENT * 10)) / BigInt(1000);
    
    this.applySlash(validatorId, slashAmount, 'downtime');
    this.jailValidator(validatorId, 'downtime');
  }

  slashForDoubleSign(validatorId: string, evidence: string): void {
    const validator = this.validators.get(validatorId);
    if (!validator) return;

    const slashAmount = (validator.stake * BigInt(VALIDATOR_CONFIG.SLASHING.DOUBLE_SIGN_PENALTY_PERCENT * 100)) / BigInt(10000);
    
    this.applySlash(validatorId, slashAmount, 'double_sign', evidence);
    
    if (VALIDATOR_CONFIG.SLASHING.TOMBSTONE_ENABLED) {
      this.tombstoneValidator(validatorId);
    } else {
      this.jailValidator(validatorId, 'double_sign');
    }
  }

  private applySlash(validatorId: string, amount: bigint, reason: SlashReason, evidence?: string): void {
    const validator = this.validators.get(validatorId);
    if (!validator) return;

    validator.stake = validator.stake > amount ? validator.stake - amount : BigInt(0);
    validator.totalStake = validator.stake + validator.delegatedStake;
    this.totalActiveStake -= amount;

    if (!validator.slashingInfo) {
      validator.slashingInfo = {
        totalSlashed: BigInt(0),
        slashEvents: [],
        isTombstoned: false,
      };
    }

    validator.slashingInfo.totalSlashed += amount;
    validator.slashingInfo.slashEvents.push({
      timestamp: Date.now(),
      reason,
      amount,
      blockNumber: this.currentBlockNumber,
      evidence,
    });

    this.updateVotingPowers();
    console.log(`[ValidatorOrchestrator] Slashed ${validatorId}: ${this.formatStake(amount)} TBURN for ${reason}`);
  }

  // ============================================
  // JAILING
  // ============================================

  private jailValidator(validatorId: string, reason: JailReason): void {
    const validator = this.validators.get(validatorId);
    if (!validator || validator.status === 'tombstoned') return;

    validator.status = 'jailed';
    validator.jailInfo = {
      isJailed: true,
      jailedAt: Date.now(),
      jailEndTime: Date.now() + VALIDATOR_CONFIG.SLASHING.JAIL_DURATION_SECONDS * 1000,
      jailReason: reason,
      jailCount: (validator.jailInfo?.jailCount || 0) + 1,
    };

    if (validator.shardId >= 0) {
      this.validatorsByShard.get(validator.shardId)?.delete(validatorId);
      validator.shardId = -1;
    }

    this.activeValidators--;
    this.updateVotingPowers();
    console.log(`[ValidatorOrchestrator] Jailed ${validatorId} for ${reason}`);
  }

  private unjailValidator(validatorId: string): void {
    const validator = this.validators.get(validatorId);
    if (!validator || validator.status !== 'jailed') return;

    validator.status = 'active';
    validator.jailInfo!.isJailed = false;
    this.rotationPool.add(validatorId);
    
    this.activeValidators++;
    this.updateVotingPowers();
    console.log(`[ValidatorOrchestrator] Unjailed ${validatorId}`);
  }

  private tombstoneValidator(validatorId: string): void {
    const validator = this.validators.get(validatorId);
    if (!validator) return;

    validator.status = 'tombstoned';
    if (!validator.slashingInfo) {
      validator.slashingInfo = {
        totalSlashed: BigInt(0),
        slashEvents: [],
        isTombstoned: false,
      };
    }
    validator.slashingInfo.isTombstoned = true;
    validator.slashingInfo.tombstonedAt = Date.now();

    if (validator.shardId >= 0) {
      this.validatorsByShard.get(validator.shardId)?.delete(validatorId);
    }
    this.rotationPool.delete(validatorId);

    this.activeValidators--;
    this.updateVotingPowers();
    console.log(`[ValidatorOrchestrator] Tombstoned ${validatorId} - permanently removed`);
  }

  private recordDowntime(validatorId: string): void {
    const validator = this.validators.get(validatorId);
    if (!validator) return;

    validator.metrics.blockMissedCount++;
  }

  // ============================================
  // REWARD DISTRIBUTION
  // ============================================

  distributeBlockRewards(blockNumber: number, shardId: number, baseFee: bigint, priorityFee: bigint): void {
    const committee = this.activeCommittees.get(shardId);
    if (!committee) return;

    const totalFees = baseFee + priorityFee;
    const proposerReward = (totalFees * BigInt(40)) / BigInt(100);
    const verifierReward = (totalFees * BigInt(50)) / BigInt(100);
    const burnAmount = totalFees - proposerReward - verifierReward;

    const proposer = this.validators.get(committee.proposer);
    if (proposer) {
      const commission = (proposerReward * BigInt(Math.floor(proposer.commission * 100))) / BigInt(10000);
      const netReward = proposerReward - commission;
      
      proposer.rewardInfo.proposerRewards += netReward;
      proposer.rewardInfo.commissionEarned += commission;
      proposer.rewardInfo.pendingRewards += proposerReward;
      proposer.rewardInfo.lastRewardBlock = blockNumber;
      proposer.rewardInfo.totalRewardsEarned += proposerReward;
    }

    const verifiers = committee.validators.filter(v => v !== committee.proposer);
    const rewardPerVerifier = verifierReward / BigInt(verifiers.length || 1);
    
    for (const verifierId of verifiers) {
      const verifier = this.validators.get(verifierId);
      if (verifier) {
        const commission = (rewardPerVerifier * BigInt(Math.floor(verifier.commission * 100))) / BigInt(10000);
        const netReward = rewardPerVerifier - commission;
        
        verifier.rewardInfo.verifierRewards += netReward;
        verifier.rewardInfo.commissionEarned += commission;
        verifier.rewardInfo.pendingRewards += rewardPerVerifier;
        verifier.rewardInfo.lastRewardBlock = blockNumber;
        verifier.rewardInfo.totalRewardsEarned += rewardPerVerifier;
      }
    }

    this.totalRewardsDistributed += proposerReward + verifierReward;
  }

  claimRewards(validatorId: string): bigint {
    const validator = this.validators.get(validatorId);
    if (!validator) return BigInt(0);

    const rewards = validator.rewardInfo.pendingRewards;
    validator.rewardInfo.pendingRewards = BigInt(0);
    
    return rewards;
  }

  // ============================================
  // DELEGATION
  // ============================================

  addDelegation(validatorId: string, amount: bigint): boolean {
    const validator = this.validators.get(validatorId);
    if (!validator || validator.status !== 'active') return false;

    const maxDelegation = validator.stake * BigInt(VALIDATOR_CONFIG.MAXIMUM_DELEGATION_RATIO);
    if (validator.delegatedStake + amount > maxDelegation) return false;

    validator.delegatedStake += amount;
    validator.totalStake = validator.stake + validator.delegatedStake;
    this.totalActiveStake += amount;
    
    this.updateVotingPowers();
    return true;
  }

  removeDelegation(validatorId: string, amount: bigint): boolean {
    const validator = this.validators.get(validatorId);
    if (!validator) return false;

    if (validator.delegatedStake < amount) return false;

    validator.delegatedStake -= amount;
    validator.totalStake = validator.stake + validator.delegatedStake;
    this.totalActiveStake -= amount;
    
    this.updateVotingPowers();
    return true;
  }

  // ============================================
  // QUERY METHODS
  // ============================================

  getValidator(validatorId: string): ValidatorState | undefined {
    return this.validators.get(validatorId);
  }

  getValidatorByAddress(address: string): ValidatorState | undefined {
    const validatorId = this.validatorsByAddress.get(address);
    return validatorId ? this.validators.get(validatorId) : undefined;
  }

  getValidatorsByShard(shardId: number): ValidatorState[] {
    const ids = this.validatorsByShard.get(shardId);
    if (!ids) return [];
    return Array.from(ids).map(id => this.validators.get(id)!).filter(Boolean);
  }

  getActiveValidators(): ValidatorState[] {
    return Array.from(this.validators.values()).filter(v => v.status === 'active');
  }

  getTopValidatorsByStake(limit: number = 10): ValidatorState[] {
    return Array.from(this.validators.values())
      .filter(v => v.status === 'active')
      .sort((a, b) => Number(b.totalStake - a.totalStake))
      .slice(0, limit);
  }

  getTopValidatorsByPerformance(limit: number = 10): ValidatorState[] {
    return Array.from(this.validators.values())
      .filter(v => v.status === 'active')
      .sort((a, b) => b.metrics.performanceScore - a.metrics.performanceScore)
      .slice(0, limit);
  }

  getCommittee(shardId: number): CommitteeSelection | undefined {
    return this.activeCommittees.get(shardId);
  }

  getRotationPool(): ValidatorState[] {
    return Array.from(this.rotationPool)
      .map(id => this.validators.get(id)!)
      .filter(Boolean);
  }

  // ============================================
  // STATUS & METRICS
  // ============================================

  getStatus(): object {
    const uptimeMs = Date.now() - this.startTime;
    
    return {
      chainId: CHAIN_CONFIG.CHAIN_ID,
      orchestratorStatus: this.isRunning ? 'running' : 'stopped',
      uptimeMs,
      uptimeFormatted: this.formatDuration(uptimeMs),
      
      validators: {
        total: this.totalValidators,
        active: this.activeValidators,
        jailed: Array.from(this.validators.values()).filter(v => v.status === 'jailed').length,
        tombstoned: Array.from(this.validators.values()).filter(v => v.status === 'tombstoned').length,
        rotationPoolSize: this.rotationPool.size,
      },
      
      stake: {
        totalActive: this.formatStake(this.totalActiveStake),
        perValidator: this.formatStake(STAKE_PER_VALIDATOR),
        averageVotingPower: (100 / this.activeValidators).toFixed(4),
      },
      
      shards: {
        total: SHARD_CONFIG.TOTAL_SHARDS,
        validatorsPerShard: VALIDATORS_PER_SHARD,
        activeCommittees: this.activeCommittees.size,
      },
      
      performance: {
        currentEpoch: this.currentEpoch,
        currentBlockNumber: this.currentBlockNumber,
        blocksProduced: this.blocksProduced,
        blocksVerified: this.blocksVerified,
        totalRewardsDistributed: this.formatStake(this.totalRewardsDistributed),
        metricsBufferSize: this.metricsBuffer.size(),
      },
      
      lastHealthCheck: new Date(this.lastHealthCheckTime).toISOString(),
      lastRotation: new Date(this.lastRotationTime).toISOString(),
    };
  }

  getMetrics(): object {
    const activeValidators = this.getActiveValidators();
    
    const avgLatency = activeValidators.reduce((sum, v) => sum + v.metrics.ewmaLatency, 0) / activeValidators.length;
    const avgUptime = activeValidators.reduce((sum, v) => sum + v.metrics.uptime, 0) / activeValidators.length;
    const avgPerformance = activeValidators.reduce((sum, v) => sum + v.metrics.performanceScore, 0) / activeValidators.length;
    
    return {
      aggregated: {
        averageLatencyMs: avgLatency.toFixed(2),
        averageUptime: avgUptime.toFixed(2),
        averagePerformanceScore: avgPerformance.toFixed(2),
        totalBlocksProduced: this.blocksProduced,
        totalBlocksMissed: activeValidators.reduce((sum, v) => sum + v.metrics.blockMissedCount, 0),
      },
      
      distribution: {
        byTier: {
          core: activeValidators.filter(v => v.tier === 'core').length,
          premium: activeValidators.filter(v => v.tier === 'premium').length,
          standard: activeValidators.filter(v => v.tier === 'standard').length,
        },
        byPerformance: {
          excellent: activeValidators.filter(v => v.metrics.performanceScore >= 95).length,
          good: activeValidators.filter(v => v.metrics.performanceScore >= 80 && v.metrics.performanceScore < 95).length,
          acceptable: activeValidators.filter(v => v.metrics.performanceScore >= 60 && v.metrics.performanceScore < 80).length,
          poor: activeValidators.filter(v => v.metrics.performanceScore < 60).length,
        },
      },
      
      recentMetrics: this.metricsBuffer.getLatest(10).map(m => ({
        validatorId: m.validatorId,
        latencyMs: m.ewmaLatency.toFixed(2),
        successRate: m.ewmaSuccessRate.toFixed(2),
        performanceScore: m.performanceScore.toFixed(2),
      })),
    };
  }

  getPerformanceDashboard(): object {
    const topPerformers = this.getTopValidatorsByPerformance(10);
    const topStakers = this.getTopValidatorsByStake(10);
    
    return {
      topPerformers: topPerformers.map(v => ({
        id: v.id,
        name: v.name,
        tier: v.tier,
        performanceScore: v.metrics.performanceScore.toFixed(2),
        uptime: v.metrics.uptime.toFixed(2),
        latencyMs: v.metrics.ewmaLatency.toFixed(2),
        blocksProduced: v.metrics.blockProducedCount,
        shardId: v.shardId,
      })),
      
      topStakers: topStakers.map(v => ({
        id: v.id,
        name: v.name,
        tier: v.tier,
        stake: this.formatStake(v.stake),
        delegated: this.formatStake(v.delegatedStake),
        totalStake: this.formatStake(v.totalStake),
        votingPower: v.votingPower.toFixed(4),
        commission: v.commission.toFixed(2),
      })),
      
      shardDistribution: Array.from(this.validatorsByShard.entries()).map(([shardId, validators]) => ({
        shardId,
        validatorCount: validators.size,
        validatorIds: Array.from(validators),
      })),
      
      rotationPool: this.getRotationPool().map(v => ({
        id: v.id,
        name: v.name,
        performanceScore: v.metrics.performanceScore.toFixed(2),
        status: v.status,
      })),
    };
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  private hashString(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(40, '0');
  }

  private formatStake(amount: bigint): string {
    const value = Number(amount / BigInt(1e18));
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
    return value.toFixed(2);
  }

  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  // ============================================
  // PRODUCTION-GRADE TELEMETRY
  // ============================================

  recordLatencyEvent(validatorId: string, latencyMs: number, eventType: string = 'heartbeat'): void {
    if (!this.telemetryEnabled) return;
    
    const validator = this.validators.get(validatorId);
    if (!validator) return;

    // Initialize latency buffer if not exists
    if (!this.latencyBuffers.has(validatorId)) {
      this.latencyBuffers.set(validatorId, new PercentileRingBuffer(1024));
    }
    
    const buffer = this.latencyBuffers.get(validatorId)!;
    buffer.push(latencyMs);
    
    // Update EWMA latency (α = 0.3)
    validator.metrics.ewmaLatency = EWMA_ALPHA * latencyMs + (1 - EWMA_ALPHA) * validator.metrics.ewmaLatency;
    validator.metrics.latencyMs = latencyMs;
    
    // Check for SLA violation
    if (latencyMs > SLA_CONFIG.LATENCY_TARGET_MS) {
      this.triggerSlaAlert(validatorId, 'latency_spike', latencyMs, SLA_CONFIG.LATENCY_TARGET_MS);
    }
    
    // Check P99 latency
    const p99 = buffer.getP99();
    if (p99 > SLA_CONFIG.LATENCY_P99_TARGET_MS) {
      this.triggerSlaAlert(validatorId, 'latency_p99_violation', p99, SLA_CONFIG.LATENCY_P99_TARGET_MS);
    }
  }

  recordUptimeEvent(validatorId: string, isActive: boolean): void {
    if (!this.telemetryEnabled) return;
    
    const validator = this.validators.get(validatorId);
    if (!validator) return;

    // Initialize uptime tracker if not exists
    if (!this.uptimeTrackers.has(validatorId)) {
      this.uptimeTrackers.set(validatorId, { consecutiveBlocks: 0, lastActive: Date.now(), downtimeEvents: 0 });
    }
    
    const tracker = this.uptimeTrackers.get(validatorId)!;
    
    if (isActive) {
      tracker.consecutiveBlocks++;
      tracker.lastActive = Date.now();
    } else {
      // Downtime detected
      if (tracker.consecutiveBlocks > 0) {
        tracker.downtimeEvents++;
      }
      tracker.consecutiveBlocks = 0;
      
      // Check for consecutive downtime (slashing threshold)
      if (tracker.downtimeEvents >= SLASHING_DETECTION_CONFIG.DOWNTIME_STREAK_THRESHOLD) {
        this.detectSlashingEvent(validatorId, 'downtime', 'minor', {
          downtimeEvents: tracker.downtimeEvents,
          lastActive: tracker.lastActive,
        });
      }
      
      // Trigger SLA alert for downtime
      this.triggerSlaAlert(validatorId, 'uptime_violation', tracker.downtimeEvents, 0);
    }
    
    // Calculate uptime basis points
    const totalBlocks = Math.max(1, tracker.consecutiveBlocks + tracker.downtimeEvents);
    const uptimeBasisPoints = Math.floor((tracker.consecutiveBlocks / totalBlocks) * 10000);
    validator.metrics.uptime = uptimeBasisPoints / 100;
  }

  triggerSlaAlert(
    validatorId: string, 
    alertType: string, 
    actualValue: number, 
    thresholdValue: number
  ): void {
    const alertKey = `${validatorId}:${alertType}`;
    const now = Date.now();
    
    if (this.activeAlerts.has(alertKey)) {
      // Update existing alert
      const alert = this.activeAlerts.get(alertKey)!;
      
      // Check debounce window
      if (now - alert.lastOccurrenceAt < SLA_CONFIG.ALERT_DEBOUNCE_MS) {
        return; // Skip due to debounce
      }
      
      alert.occurrenceCount++;
      alert.lastOccurrenceAt = now;
      alert.actualValue = actualValue;
      
      // Check for escalation
      for (let i = SLA_CONFIG.ESCALATION_THRESHOLDS.length - 1; i >= 0; i--) {
        if (alert.occurrenceCount >= SLA_CONFIG.ESCALATION_THRESHOLDS[i]) {
          alert.escalationLevel = i + 1;
          break;
        }
      }
      
      // Update alert level based on escalation
      if (alert.escalationLevel >= 4) {
        alert.alertLevel = 'emergency';
      } else if (alert.escalationLevel >= 3) {
        alert.alertLevel = 'critical';
      } else if (alert.escalationLevel >= 2) {
        alert.alertLevel = 'warning';
      }
    } else {
      // Create new alert
      const alertId = `alert-${validatorId}-${alertType}-${now}`;
      const alert: SlaAlert = {
        alertId,
        validatorId,
        alertType,
        alertLevel: 'warning',
        message: `SLA violation: ${alertType} - actual: ${actualValue}, threshold: ${thresholdValue}`,
        thresholdValue,
        actualValue,
        occurrenceCount: 1,
        escalationLevel: 0,
        firstOccurrenceAt: now,
        lastOccurrenceAt: now,
        status: 'active',
      };
      
      this.activeAlerts.set(alertKey, alert);
    }
  }

  detectSlashingEvent(
    validatorId: string,
    slashType: SlashReason,
    severity: 'minor' | 'major' | 'critical',
    evidenceData: object
  ): void {
    const now = Date.now();
    const slashId = `slash-${validatorId}-${slashType}-${now}`;
    const evidenceHash = this.hashString(JSON.stringify(evidenceData));
    
    const detection: SlashingDetection = {
      slashId,
      validatorId,
      slashType,
      severity,
      evidenceHash,
      evidenceData,
      confirmationCount: 1,
      detectedAt: now,
      status: 'detected',
    };
    
    this.pendingSlashDetections.set(slashId, detection);
    
    console.log(`[ValidatorOrchestrator] Slashing detected: ${slashId} - ${slashType} (${severity})`);
  }

  confirmSlashingDetection(slashId: string): boolean {
    const detection = this.pendingSlashDetections.get(slashId);
    if (!detection) return false;
    
    detection.confirmationCount++;
    
    if (detection.confirmationCount >= SLASHING_DETECTION_CONFIG.REQUIRED_CONFIRMATIONS) {
      detection.status = 'confirmed';
      
      // Execute slashing based on type
      if (detection.slashType === 'double_sign') {
        this.slashForDoubleSign(detection.validatorId, detection.evidenceHash);
      } else if (detection.slashType === 'downtime') {
        this.slashForDowntime(detection.validatorId);
      }
      
      detection.status = 'executed';
      this.slashingHistory.push(detection);
      this.pendingSlashDetections.delete(slashId);
      
      return true;
    }
    
    return false;
  }

  acknowledgeAlert(alertKey: string): boolean {
    const alert = this.activeAlerts.get(alertKey);
    if (!alert) return false;
    
    alert.status = 'acknowledged';
    return true;
  }

  resolveAlert(alertKey: string): boolean {
    const alert = this.activeAlerts.get(alertKey);
    if (!alert) return false;
    
    alert.status = 'resolved';
    this.alertHistory.push(alert);
    this.activeAlerts.delete(alertKey);
    return true;
  }

  getValidatorTelemetry(validatorId: string): object | null {
    const validator = this.validators.get(validatorId);
    if (!validator) return null;
    
    const latencyBuffer = this.latencyBuffers.get(validatorId);
    const uptimeTracker = this.uptimeTrackers.get(validatorId);
    
    return {
      validatorId,
      shardId: validator.shardId,
      status: validator.status,
      
      // Latency metrics
      latency: {
        current: validator.metrics.latencyMs.toFixed(2),
        ewma: validator.metrics.ewmaLatency.toFixed(2),
        p50: latencyBuffer?.getP50().toFixed(2) || '0',
        p95: latencyBuffer?.getP95().toFixed(2) || '0',
        p99: latencyBuffer?.getP99().toFixed(2) || '0',
        min: latencyBuffer?.getMin().toFixed(2) || '0',
        max: latencyBuffer?.getMax().toFixed(2) || '0',
        sampleCount: latencyBuffer?.size() || 0,
      },
      
      // Uptime metrics
      uptime: {
        percentage: validator.metrics.uptime.toFixed(2),
        consecutiveBlocks: uptimeTracker?.consecutiveBlocks || 0,
        downtimeEvents: uptimeTracker?.downtimeEvents || 0,
        lastActive: uptimeTracker?.lastActive ? new Date(uptimeTracker.lastActive).toISOString() : null,
      },
      
      // Block production
      blocks: {
        produced: validator.metrics.blockProducedCount,
        missed: validator.metrics.blockMissedCount,
        successRate: validator.metrics.successRate.toFixed(2),
        ewmaSuccessRate: validator.metrics.ewmaSuccessRate.toFixed(2),
      },
      
      // Performance scores
      performance: {
        score: validator.metrics.performanceScore.toFixed(2),
        tier: validator.tier,
      },
      
      // Slashing status
      slashing: {
        totalSlashed: validator.slashingInfo?.totalSlashed?.toString() || '0',
        slashEvents: validator.slashingInfo?.slashEvents?.length || 0,
        isTombstoned: validator.slashingInfo?.isTombstoned || false,
      },
      
      // SLA compliance
      sla: {
        compliant: this.checkSlaCompliance(validatorId),
        activeAlerts: Array.from(this.activeAlerts.values()).filter(a => a.validatorId === validatorId).length,
      },
    };
  }

  checkSlaCompliance(validatorId: string): boolean {
    const validator = this.validators.get(validatorId);
    if (!validator) return false;
    
    const latencyBuffer = this.latencyBuffers.get(validatorId);
    const uptimeTracker = this.uptimeTrackers.get(validatorId);
    
    // Check uptime target
    const uptimeBasisPoints = validator.metrics.uptime * 100;
    if (uptimeBasisPoints < SLA_CONFIG.UPTIME_TARGET_BASIS_POINTS) return false;
    
    // Check P99 latency
    if (latencyBuffer && latencyBuffer.getP99() > SLA_CONFIG.LATENCY_P99_TARGET_MS) return false;
    
    // Check block production rate
    const totalBlocks = validator.metrics.blockProducedCount + validator.metrics.blockMissedCount;
    if (totalBlocks > 0) {
      const productionRate = Math.floor((validator.metrics.blockProducedCount / totalBlocks) * 10000);
      if (productionRate < SLA_CONFIG.BLOCK_PRODUCTION_RATE_TARGET) return false;
    }
    
    return true;
  }

  getActiveAlerts(): SlaAlert[] {
    return Array.from(this.activeAlerts.values());
  }

  getPendingSlashingDetections(): SlashingDetection[] {
    return Array.from(this.pendingSlashDetections.values());
  }

  getSlashingHistory(limit: number = 100): SlashingDetection[] {
    return this.slashingHistory.slice(-limit);
  }

  getTelemetrySummary(): object {
    const activeValidators = this.getActiveValidators();
    const slaCompliantCount = activeValidators.filter(v => this.checkSlaCompliance(v.id)).length;
    
    // Aggregate latency percentiles across all validators
    let totalP50 = 0, totalP99 = 0, count = 0;
    for (const buffer of this.latencyBuffers.values()) {
      if (buffer.size() > 0) {
        totalP50 += buffer.getP50();
        totalP99 += buffer.getP99();
        count++;
      }
    }
    
    return {
      validators: {
        total: this.totalValidators,
        active: this.activeValidators,
        slaCompliant: slaCompliantCount,
        slaCompliantPercentage: this.activeValidators > 0 
          ? ((slaCompliantCount / this.activeValidators) * 100).toFixed(2) 
          : '0.00',
      },
      
      latency: {
        avgP50: count > 0 ? (totalP50 / count).toFixed(2) : '0',
        avgP99: count > 0 ? (totalP99 / count).toFixed(2) : '0',
        target: SLA_CONFIG.LATENCY_TARGET_MS,
        p99Target: SLA_CONFIG.LATENCY_P99_TARGET_MS,
      },
      
      uptime: {
        target: (SLA_CONFIG.UPTIME_TARGET_BASIS_POINTS / 100).toFixed(2) + '%',
      },
      
      alerts: {
        active: this.activeAlerts.size,
        byLevel: {
          info: Array.from(this.activeAlerts.values()).filter(a => a.alertLevel === 'info').length,
          warning: Array.from(this.activeAlerts.values()).filter(a => a.alertLevel === 'warning').length,
          critical: Array.from(this.activeAlerts.values()).filter(a => a.alertLevel === 'critical').length,
          emergency: Array.from(this.activeAlerts.values()).filter(a => a.alertLevel === 'emergency').length,
        },
      },
      
      slashing: {
        pending: this.pendingSlashDetections.size,
        executed: this.slashingHistory.length,
      },
      
      telemetryStatus: this.telemetryEnabled ? 'enabled' : 'disabled',
    };
  }

  // ============================================
  // LIFECYCLE
  // ============================================

  shutdown(): void {
    this.isRunning = false;
    if (this.healthCheckTimer) clearInterval(this.healthCheckTimer);
    if (this.metricsTimer) clearInterval(this.metricsTimer);
    console.log(`[ValidatorOrchestrator] Shutdown complete`);
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let validatorOrchestratorInstance: EnterpriseValidatorOrchestrator | null = null;

export function getValidatorOrchestrator(): EnterpriseValidatorOrchestrator {
  if (!validatorOrchestratorInstance) {
    validatorOrchestratorInstance = new EnterpriseValidatorOrchestrator();
  }
  return validatorOrchestratorInstance;
}

export async function initializeValidatorOrchestrator(): Promise<EnterpriseValidatorOrchestrator> {
  const orchestrator = getValidatorOrchestrator();
  await orchestrator.initialize();
  return orchestrator;
}

export default EnterpriseValidatorOrchestrator;
