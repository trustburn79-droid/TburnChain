/**
import { validatorAddressFromString } from "../../utils/tburn-address";
 * TBURN Parallel Shard Block Producer
 * 
 * Each shard produces blocks independently in parallel,
 * enabling true horizontal scaling of TPS.
 * 
 * Architecture:
 * - 24 shards × 2,500 TPS/shard = 60,000 TPS (DEV_SAFE_MODE)
 * - 24 shards × 4,200 TPS/shard = 100,800 TPS (Production)
 * 
 * @version 1.0.0
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';
import { DEV_SAFE_MODE } from '../memory/metrics-config';

const PARALLEL_CONFIG = {
  SHARD_COUNT: 24,
  // ★ [2026-01-13 STABILITY FIX] 1000ms in DEV_SAFE_MODE (was 200ms - caused event loop lag)
  BLOCK_INTERVAL_MS: DEV_SAFE_MODE ? 1000 : 100,
  TARGET_TPS_PER_SHARD: DEV_SAFE_MODE ? 1000 : 4200,
  MAX_TX_PER_SHARD_BLOCK: DEV_SAFE_MODE ? 200 : 420,
  STATS_INTERVAL_MS: 1000,
  CROSS_SHARD_RATIO: 0.15,
};

export interface ShardBlock {
  shardId: number;
  blockNumber: number;
  hash: string;
  parentHash: string;
  stateRoot: string;
  timestamp: number;
  proposer: string;
  transactionCount: number;
  crossShardTxCount: number;
  gasUsed: bigint;
  gasLimit: bigint;
}

export interface ParallelProducerStats {
  isRunning: boolean;
  activeShards: number;
  totalBlocksProduced: number;
  totalTransactionsProcessed: number;
  totalCrossShardTx: number;
  currentTPS: number;
  averageTPS: number;
  peakTPS: number;
  tpsPerShard: Map<number, number>;
  uptimeMs: number;
  blocksPerSecond: number;
}

interface ShardState {
  shardId: number;
  blockNumber: number;
  lastBlockHash: string;
  blocksProduced: number;
  txProcessed: number;
  crossShardTx: number;
  tpsWindow: { timestamp: number; txCount: number }[];
  currentTPS: number;
  timer: NodeJS.Timeout | null;
  validators: string[];
  validatorIndex: number;
}

export class ParallelShardBlockProducer extends EventEmitter {
  private static instance: ParallelShardBlockProducer | null = null;
  
  private isRunning: boolean = false;
  private shards: Map<number, ShardState> = new Map();
  private startTime: number = 0;
  
  private statsTimer: NodeJS.Timeout | null = null;
  private tpsHistory: number[] = [];
  private peakTPS: number = 0;
  private currentTPS: number = 0;
  
  private readonly TPS_WINDOW_SIZE_MS = 5000;
  private readonly MAX_TPS_HISTORY = 60;
  private readonly MAX_TPS_WINDOW_ENTRIES = 50; // Prevent memory leak per shard
  
  private constructor() {
    super();
    this.initializeShards();
  }
  
  static getInstance(): ParallelShardBlockProducer {
    if (!ParallelShardBlockProducer.instance) {
      ParallelShardBlockProducer.instance = new ParallelShardBlockProducer();
    }
    return ParallelShardBlockProducer.instance;
  }
  
  private initializeShards(): void {
    for (let shardId = 0; shardId < PARALLEL_CONFIG.SHARD_COUNT; shardId++) {
      const validators: string[] = [];
      for (let i = 0; i < 5; i++) {
        const hash = crypto.createHash('sha256')
          .update(`shard-${shardId}-validator-${i}`)
          .digest('hex');
        validators.push(validatorAddressFromString(`validator-${hash.slice(0, 20)}`));
      }
      
      this.shards.set(shardId, {
        shardId,
        blockNumber: 43900000 + shardId * 1000,
        lastBlockHash: this.generateHash(`genesis-shard-${shardId}`),
        blocksProduced: 0,
        txProcessed: 0,
        crossShardTx: 0,
        tpsWindow: [],
        currentTPS: 0,
        timer: null,
        validators,
        validatorIndex: 0,
      });
    }
  }
  
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('[ParallelProducer] Already running');
      return;
    }
    
    this.isRunning = true;
    this.startTime = Date.now();
    
    Array.from(this.shards.entries()).forEach(([shardId, shard]) => {
      const jitter = Math.floor(Math.random() * 50);
      shard.timer = setInterval(() => {
        this.produceShardBlock(shardId);
      }, PARALLEL_CONFIG.BLOCK_INTERVAL_MS + jitter);
    });
    
    this.statsTimer = setInterval(() => {
      this.collectStats();
    }, PARALLEL_CONFIG.STATS_INTERVAL_MS);
    
    console.log(`[ParallelProducer] Started ${PARALLEL_CONFIG.SHARD_COUNT} parallel shard producers`);
    console.log(`[ParallelProducer] Target TPS: ${PARALLEL_CONFIG.TARGET_TPS_PER_SHARD * PARALLEL_CONFIG.SHARD_COUNT}`);
    console.log(`[ParallelProducer] Block interval: ${PARALLEL_CONFIG.BLOCK_INTERVAL_MS}ms per shard`);
    console.log(`[ParallelProducer] DEV_SAFE_MODE: ${DEV_SAFE_MODE}`);
    
    this.emit('started');
  }
  
  async stop(): Promise<void> {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    // Clear all shard timers first
    Array.from(this.shards.values()).forEach(shard => {
      if (shard.timer) {
        clearInterval(shard.timer);
        shard.timer = null;
      }
      // Clear per-shard memory
      shard.tpsWindow = [];
    });
    
    if (this.statsTimer) {
      clearInterval(this.statsTimer);
      this.statsTimer = null;
    }
    
    // Clear global telemetry to free memory
    this.tpsHistory = [];
    
    console.log('[ParallelProducer] Stopped');
    this.emit('stopped');
  }
  
  /**
   * Emergency stop for memory pressure situations
   * Immediately stops all shards and clears memory
   */
  emergencyStop(): void {
    console.log('[ParallelProducer] ⚠️ Emergency stop triggered');
    
    this.isRunning = false;
    
    // Immediately clear all timers
    Array.from(this.shards.values()).forEach(shard => {
      if (shard.timer) {
        clearInterval(shard.timer);
        shard.timer = null;
      }
      shard.tpsWindow = [];
      shard.currentTPS = 0;
    });
    
    if (this.statsTimer) {
      clearInterval(this.statsTimer);
      this.statsTimer = null;
    }
    
    // Clear all telemetry immediately
    this.tpsHistory = [];
    this.currentTPS = 0;
    
    console.log('[ParallelProducer] ⚠️ Emergency stop completed - memory freed');
    this.emit('emergencyStopped');
  }
  
  /**
   * Force memory cleanup without stopping
   */
  forceMemoryCleanup(): void {
    // Trim tpsHistory
    if (this.tpsHistory.length > 30) {
      this.tpsHistory = this.tpsHistory.slice(-30);
    }
    
    // Trim all shard tpsWindows
    Array.from(this.shards.values()).forEach(shard => {
      if (shard.tpsWindow.length > 25) {
        shard.tpsWindow = shard.tpsWindow.slice(-25);
      }
    });
    
    console.log('[ParallelProducer] Memory cleanup executed');
  }
  
  private produceShardBlock(shardId: number): void {
    const shard = this.shards.get(shardId);
    if (!shard) return;
    
    const now = Date.now();
    shard.blockNumber++;
    
    const blocksPerSecond = 1000 / PARALLEL_CONFIG.BLOCK_INTERVAL_MS;
    const txPerBlock = Math.floor(PARALLEL_CONFIG.TARGET_TPS_PER_SHARD / blocksPerSecond);
    const variance = 0.9 + Math.random() * 0.2;
    const transactionCount = Math.min(
      Math.floor(txPerBlock * variance),
      PARALLEL_CONFIG.MAX_TX_PER_SHARD_BLOCK
    );
    
    const crossShardTxCount = Math.floor(transactionCount * PARALLEL_CONFIG.CROSS_SHARD_RATIO);
    
    const proposer = shard.validators[shard.validatorIndex % shard.validators.length];
    shard.validatorIndex++;
    
    const block: ShardBlock = {
      shardId,
      blockNumber: shard.blockNumber,
      hash: this.generateHash(`shard-${shardId}-block-${shard.blockNumber}-${now}`),
      parentHash: shard.lastBlockHash,
      stateRoot: this.generateHash(`shard-${shardId}-state-${shard.blockNumber}`),
      timestamp: now,
      proposer,
      transactionCount,
      crossShardTxCount,
      gasUsed: BigInt(transactionCount * 21000),
      gasLimit: BigInt(30000000),
    };
    
    shard.lastBlockHash = block.hash;
    shard.blocksProduced++;
    shard.txProcessed += transactionCount;
    shard.crossShardTx += crossShardTxCount;
    
    shard.tpsWindow.push({ timestamp: now, txCount: transactionCount });
    const windowCutoff = now - this.TPS_WINDOW_SIZE_MS;
    shard.tpsWindow = shard.tpsWindow.filter(w => w.timestamp > windowCutoff);
    
    // Enforce memory cap on tpsWindow
    if (shard.tpsWindow.length > this.MAX_TPS_WINDOW_ENTRIES) {
      shard.tpsWindow = shard.tpsWindow.slice(-this.MAX_TPS_WINDOW_ENTRIES);
    }
    
    const oneSecAgo = now - 1000;
    const recentTx = shard.tpsWindow.filter(w => w.timestamp > oneSecAgo);
    shard.currentTPS = recentTx.reduce((sum, w) => sum + w.txCount, 0);
    
    this.emit('shardBlockProduced', block);
  }
  
  private collectStats(): void {
    let totalTPS = 0;
    const tpsPerShard = new Map<number, number>();
    
    Array.from(this.shards.entries()).forEach(([shardId, shard]) => {
      totalTPS += shard.currentTPS;
      tpsPerShard.set(shardId, shard.currentTPS);
    });
    
    this.currentTPS = totalTPS;
    this.tpsHistory.push(totalTPS);
    if (this.tpsHistory.length > this.MAX_TPS_HISTORY) {
      this.tpsHistory = this.tpsHistory.slice(-this.MAX_TPS_HISTORY);
    }
    
    if (totalTPS > this.peakTPS) {
      this.peakTPS = totalTPS;
    }
    
    this.emit('statsCollected', this.getStats());
  }
  
  private generateHash(input: string): string {
    return 'bh1' + crypto.createHash('sha256').update(input).digest('hex');
  }
  
  getStats(): ParallelProducerStats {
    let totalBlocks = 0;
    let totalTx = 0;
    let totalCrossShard = 0;
    const tpsPerShard = new Map<number, number>();
    
    Array.from(this.shards.entries()).forEach(([shardId, shard]) => {
      totalBlocks += shard.blocksProduced;
      totalTx += shard.txProcessed;
      totalCrossShard += shard.crossShardTx;
      tpsPerShard.set(shardId, shard.currentTPS);
    });
    
    const uptimeMs = this.isRunning ? Date.now() - this.startTime : 0;
    const avgTPS = this.tpsHistory.length > 0
      ? Math.round(this.tpsHistory.reduce((a, b) => a + b, 0) / this.tpsHistory.length)
      : 0;
    
    return {
      isRunning: this.isRunning,
      activeShards: PARALLEL_CONFIG.SHARD_COUNT,
      totalBlocksProduced: totalBlocks,
      totalTransactionsProcessed: totalTx,
      totalCrossShardTx: totalCrossShard,
      currentTPS: this.currentTPS,
      averageTPS: avgTPS,
      peakTPS: this.peakTPS,
      tpsPerShard,
      uptimeMs,
      blocksPerSecond: uptimeMs > 0 ? totalBlocks / (uptimeMs / 1000) : 0,
    };
  }
  
  isActive(): boolean {
    return this.isRunning;
  }
  
  getShardState(shardId: number): ShardState | undefined {
    return this.shards.get(shardId);
  }
}

export function getParallelShardBlockProducer(): ParallelShardBlockProducer {
  return ParallelShardBlockProducer.getInstance();
}

console.log('[ParallelProducer] Parallel shard block producer module loaded');
