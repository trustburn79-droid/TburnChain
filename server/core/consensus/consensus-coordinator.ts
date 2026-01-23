/**
 * TBURN Consensus Coordinator
 * Bridges the Enterprise BFT Engine with the existing blockchain infrastructure
 * 
 * Responsibilities:
 * - Coordinate between BFT engine and block production
 * - Manage validator participation
 * - Handle consensus round lifecycle
 * - Provide real-time metrics and monitoring
 */

import { EnterpriseBFTEngine, ConsensusPhase, ValidatorInfo, ConsensusMetrics } from './enterprise-bft-engine';
import { blockFinalityEngine, BlockData } from '../../services/block-finality-engine';

export interface ConsensusStats {
  currentHeight: number;
  currentRound: number;
  currentPhase: string;
  phaseTimeMs: number;
  activeValidators: number;
  totalVotingPower: string;
  quorumThreshold: string;
  metrics: ConsensusMetrics;
  recentBlocks: Array<{
    height: number;
    hash: string;
    roundTimeMs: number;
    phaseTimesMs: number[];
    timestamp: number;
  }>;
}

export interface ConsensusConfig {
  blockTimeMs: number;
  phaseTimeoutMs: number;
  viewChangeTimeoutMs: number;
  maxRoundsPerHeight: number;
  quorumNumerator: number;
  quorumDenominator: number;
}

const DEFAULT_CONFIG: ConsensusConfig = {
  blockTimeMs: 100,
  phaseTimeoutMs: 20,
  viewChangeTimeoutMs: 500,
  maxRoundsPerHeight: 10,
  quorumNumerator: 2,
  quorumDenominator: 3
};

export class ConsensusCoordinator {
  private bftEngine: EnterpriseBFTEngine;
  private config: ConsensusConfig;
  private isRunning: boolean = false;
  private blockProductionInterval: NodeJS.Timeout | null = null;
  
  // Recent block history for monitoring
  private recentBlocks: Array<{
    height: number;
    hash: string;
    roundTimeMs: number;
    phaseTimesMs: number[];
    timestamp: number;
  }> = [];
  private readonly MAX_RECENT_BLOCKS = 100;
  
  // Validator cache
  private validatorCache: ValidatorInfo[] = [];
  private lastValidatorUpdate: number = 0;
  private readonly VALIDATOR_CACHE_TTL = 30000; // 30 seconds
  
  // Block height tracking
  private currentHeight: number = 0;
  private lastBlockHash: string = '0x0000000000000000000000000000000000000000000000000000000000000000';
  
  // Performance tracking
  private blockProductionTimes: number[] = [];
  private targetBlockTime: number = 100;

  constructor(config: Partial<ConsensusConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.bftEngine = new EnterpriseBFTEngine();
    this.targetBlockTime = this.config.blockTimeMs;
    
    // Set up callbacks
    this.bftEngine.setOnBlockFinalized(this.onBlockFinalized.bind(this));
    this.bftEngine.setOnPhaseChange(this.onPhaseChange.bind(this));
    this.bftEngine.setOnViewChange(this.onViewChange.bind(this));
  }

  /**
   * Initialize the coordinator with validators
   */
  public async initialize(validators: Array<{
    address: string;
    votingPower: string;
    status: string;
  }>, startHeight: number = 1): Promise<void> {
    // Convert to BFT engine format
    const bftValidators: ValidatorInfo[] = validators
      .filter(v => v.status === 'active')
      .map(v => ({
        address: v.address,
        votingPower: BigInt(v.votingPower),
        publicKey: v.address, // In production, would be actual public key
        isActive: true
      }));

    this.validatorCache = bftValidators;
    this.lastValidatorUpdate = Date.now();
    this.currentHeight = startHeight;
    
    this.bftEngine.initialize(bftValidators);
    
    console.log(`[ConsensusCoordinator] Initialized with ${bftValidators.length} validators at height ${startHeight}`);
  }

  /**
   * Start continuous block production
   */
  public async start(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log(`[ConsensusCoordinator] Starting block production at ${this.config.blockTimeMs}ms intervals`);
    
    // Adaptive block production loop
    this.scheduleNextBlock();
  }

  /**
   * Stop block production
   */
  public stop(): void {
    this.isRunning = false;
    if (this.blockProductionInterval) {
      clearTimeout(this.blockProductionInterval);
      this.blockProductionInterval = null;
    }
    console.log('[ConsensusCoordinator] Stopped block production');
  }

  /**
   * Schedule the next block with adaptive timing
   */
  private scheduleNextBlock(): void {
    if (!this.isRunning) return;

    // Calculate adaptive delay based on recent block times
    let delay = this.targetBlockTime;
    if (this.blockProductionTimes.length >= 5) {
      const avgTime = this.blockProductionTimes.slice(-5).reduce((a, b) => a + b, 0) / 5;
      // Adjust to maintain target: if blocks are slow, reduce delay
      delay = Math.max(10, this.targetBlockTime - (avgTime - this.targetBlockTime));
    }

    this.blockProductionInterval = setTimeout(async () => {
      await this.produceBlock();
      this.scheduleNextBlock();
    }, delay);
  }

  /**
   * Produce a single block through BFT consensus
   */
  private async produceBlock(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Generate block data
      const stateRoot = this.generateHash(`state-${this.currentHeight}`);
      const txRoot = this.generateHash(`tx-${this.currentHeight}`);
      const receiptsRoot = this.generateHash(`receipts-${this.currentHeight}`);
      
      // Estimate transaction count (in production would be from mempool)
      const txCount = 500 + Math.floor(Math.random() * 200);
      
      // Run full consensus round
      const result = await this.bftEngine.simulateFullRound(
        this.currentHeight,
        this.lastBlockHash,
        stateRoot,
        txRoot,
        receiptsRoot,
        txCount
      );

      if (result.success) {
        // Record block in finality engine
        const blockData: BlockData = {
          number: this.currentHeight,
          hash: result.blockHash,
          parentHash: this.lastBlockHash,
          stateRoot,
          receiptsRoot,
          transactionHashes: [],
          timestamp: Date.now(),
          validatorAddress: this.bftEngine.getRoundState().proposer
        };
        
        blockFinalityEngine.registerBlockForVerification(blockData);
        
        // Update state
        this.lastBlockHash = result.blockHash;
        this.currentHeight++;
        
        // Track recent blocks
        this.recentBlocks.push({
          height: this.currentHeight - 1,
          hash: result.blockHash,
          roundTimeMs: result.roundTimeMs,
          phaseTimesMs: result.phaseTimesMs,
          timestamp: Date.now()
        });
        
        if (this.recentBlocks.length > this.MAX_RECENT_BLOCKS) {
          this.recentBlocks.shift();
        }
        
        // Track production time for adaptive scheduling
        this.blockProductionTimes.push(result.roundTimeMs);
        if (this.blockProductionTimes.length > 100) {
          this.blockProductionTimes.shift();
        }
      }
    } catch (error) {
      console.error('[ConsensusCoordinator] Block production error:', error);
    }
  }

  /**
   * Update validator set dynamically
   */
  public async updateValidators(validators: Array<{
    address: string;
    votingPower: string;
    status: string;
  }>): Promise<void> {
    const bftValidators: ValidatorInfo[] = validators
      .filter(v => v.status === 'active')
      .map(v => ({
        address: v.address,
        votingPower: BigInt(v.votingPower),
        publicKey: v.address,
        isActive: true
      }));

    this.validatorCache = bftValidators;
    this.lastValidatorUpdate = Date.now();
    
    this.bftEngine.updateValidatorSet(bftValidators);
  }

  /**
   * Get current consensus statistics
   */
  public getStats(): ConsensusStats {
    const roundState = this.bftEngine.getRoundState();
    const phaseInfo = this.bftEngine.getPhaseInfo();
    const metrics = this.bftEngine.getMetrics();
    
    const totalVotingPower = this.validatorCache.reduce(
      (sum, v) => sum + v.votingPower, 
      BigInt(0)
    );
    
    const quorumThreshold = (totalVotingPower * BigInt(2) / BigInt(3)) + BigInt(1);

    return {
      currentHeight: this.currentHeight,
      currentRound: roundState.round,
      currentPhase: phaseInfo.phaseName,
      phaseTimeMs: phaseInfo.phaseTime,
      activeValidators: this.validatorCache.length,
      totalVotingPower: totalVotingPower.toString(),
      quorumThreshold: quorumThreshold.toString(),
      metrics,
      recentBlocks: this.recentBlocks.slice(-20)
    };
  }

  /**
   * Get detailed phase breakdown
   */
  public getPhaseBreakdown(): Array<{
    phase: number;
    name: string;
    avgTimeMs: number;
    p50Ms: number;
    p95Ms: number;
    p99Ms: number;
  }> {
    const metrics = this.bftEngine.getMetrics();
    const phases = ['IDLE', 'PROPOSE', 'PREVOTE', 'PRECOMMIT', 'COMMIT', 'FINALIZE'];
    
    return phases.slice(1).map((name, index) => ({
      phase: index + 1,
      name,
      avgTimeMs: metrics.avgPhaseTimesMs[index + 1] || 0,
      p50Ms: metrics.p50LatencyMs / 5, // Approximate per-phase
      p95Ms: metrics.p95LatencyMs / 5,
      p99Ms: metrics.p99LatencyMs / 5
    }));
  }

  /**
   * Get consensus health status
   */
  public getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: string[];
    score: number;
  } {
    const metrics = this.bftEngine.getMetrics();
    const details: string[] = [];
    let score = 100;

    // Check round success rate
    const successRate = metrics.quorumAchievementRate;
    if (successRate < 99) {
      score -= 20;
      details.push(`Low success rate: ${successRate.toFixed(1)}%`);
    } else if (successRate < 99.9) {
      score -= 5;
      details.push(`Success rate slightly below target: ${successRate.toFixed(1)}%`);
    }

    // Check latency
    if (metrics.p99LatencyMs > this.config.blockTimeMs * 2) {
      score -= 15;
      details.push(`High P99 latency: ${metrics.p99LatencyMs}ms`);
    } else if (metrics.p95LatencyMs > this.config.blockTimeMs * 1.5) {
      score -= 5;
      details.push(`Elevated P95 latency: ${metrics.p95LatencyMs}ms`);
    }

    // Check view changes
    const viewChangeRate = metrics.viewChanges / Math.max(1, metrics.totalRounds);
    if (viewChangeRate > 0.01) {
      score -= 20;
      details.push(`Frequent view changes: ${(viewChangeRate * 100).toFixed(2)}%`);
    } else if (viewChangeRate > 0.001) {
      score -= 5;
      details.push(`Some view changes detected: ${metrics.viewChanges}`);
    }

    // Check participation
    if (metrics.votingParticipationRate < 90) {
      score -= 15;
      details.push(`Low participation: ${metrics.votingParticipationRate.toFixed(1)}%`);
    } else if (metrics.votingParticipationRate < 95) {
      score -= 5;
      details.push(`Participation slightly low: ${metrics.votingParticipationRate.toFixed(1)}%`);
    }

    // Check validator count
    if (this.validatorCache.length < 67) {
      score -= 10;
      details.push(`Low validator count: ${this.validatorCache.length}`);
    }

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (score >= 90) {
      status = 'healthy';
    } else if (score >= 70) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return { status, details, score };
  }

  // ============================================
  // CALLBACKS
  // ============================================

  private onBlockFinalized(blockHash: string, height: number): void {
    // Could trigger additional actions like reward distribution
  }

  private onPhaseChange(phase: ConsensusPhase, height: number, round: number): void {
    // Could emit events for real-time monitoring
  }

  private onViewChange(newRound: number, reason: string): void {
    console.log(`[ConsensusCoordinator] View change to round ${newRound}: ${reason}`);
  }

  // ============================================
  // UTILITIES
  // ============================================

  private generateHash(data: string): string {
    const crypto = require('crypto');
    return 'th1' + crypto.createHash('sha256').update(data + Date.now()).digest('hex');
  }

  public isActive(): boolean {
    return this.isRunning;
  }

  public getCurrentHeight(): number {
    return this.currentHeight;
  }

  public getConfig(): ConsensusConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const consensusCoordinator = new ConsensusCoordinator();

export default ConsensusCoordinator;
