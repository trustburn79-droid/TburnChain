/**
 * TBURN Shard Processing Coordinator
 * Bridges RealtimeBlockPipeline with Enterprise Sharding System
 * 
 * Responsibilities:
 * - Routes transactions to appropriate shards
 * - Manages cross-shard message routing
 * - Coordinates batch processing for high throughput
 * - Collects and aggregates shard metrics
 * 
 * ⚠️ 핵심 코어 보호 (DO NOT MODIFY)
 * ────────────────────────────────────
 * 이 파일은 TBURN 메인넷의 핵심 코어입니다.
 * 5대 신기술 통합 어댑터는 이 파일에 영향을 주지 않습니다.
 * 
 * 보호 정책:
 * - ShardDAAdapter: 이벤트 기반 연동만 허용, 직접 import 금지
 * - 모든 신기술 어댑터: Feature Flag로 독립 제어
 * - 어댑터 장애 시에도 이 코어는 정상 동작
 * 
 * @version 1.0.0
 * @core TBURN_MAINNET_CORE
 */

import { EventEmitter } from 'events';
import { getShardOrchestrator } from '../sharding/enterprise-shard-orchestrator';
import { getEnterpriseCrossShardRouter } from '../messaging/enterprise-cross-shard-router';
import { DEV_SAFE_MODE } from '../memory/metrics-config';
import { getParallelShardBlockProducer, type ParallelShardBlockProducer, type ShardBlock } from './parallel-shard-block-producer';

const COORDINATOR_CONFIG = {
  SHARD_COUNT: 24,
  CROSS_SHARD_RATIO: 0.15,
  BATCH_SIZE: DEV_SAFE_MODE ? 100 : 500,
  METRICS_INTERVAL_MS: 1000,
  STARTUP_DELAY_MS: 5000,
  ENABLE_PARALLEL_PRODUCTION: true,
};

export interface ShardTransaction {
  id: string;
  sourceShard: number;
  targetShard: number;
  isCrossShard: boolean;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  timestamp: number;
  data: any;
}

export interface ShardBlockData {
  blockNumber: number;
  shardId: number;
  transactions: ShardTransaction[];
  crossShardCount: number;
  timestamp: number;
}

export interface CoordinatorStats {
  isRunning: boolean;
  shardsActive: number;
  totalTransactionsRouted: number;
  crossShardMessagesRouted: number;
  currentShardTPS: Map<number, number>;
  averageLatencyMs: number;
  routerQueueDepth: number;
  uptimeMs: number;
}

export class ShardProcessingCoordinator extends EventEmitter {
  private static instance: ShardProcessingCoordinator | null = null;
  
  private isRunning: boolean = false;
  private startTime: number = 0;
  private metricsTimer: NodeJS.Timeout | null = null;
  
  private totalTransactionsRouted: number = 0;
  private crossShardMessagesRouted: number = 0;
  private crossShardMessagesFailed: number = 0; // Track failures
  private shardTPS: Map<number, number> = new Map();
  private shardTransactionCounts: Map<number, number> = new Map();
  private lastMetricsTime: number = 0;
  
  private orchestrator: ReturnType<typeof getShardOrchestrator> | null = null;
  private router: ReturnType<typeof getEnterpriseCrossShardRouter> | null = null;
  private parallelProducer: ParallelShardBlockProducer | null = null;
  private shardBlockHandler: ((block: ShardBlock) => void) | null = null;
  private isShuttingDown: boolean = false;

  private constructor() {
    super();
    this.initializeShardCounters();
  }

  static getInstance(): ShardProcessingCoordinator {
    if (!ShardProcessingCoordinator.instance) {
      ShardProcessingCoordinator.instance = new ShardProcessingCoordinator();
    }
    return ShardProcessingCoordinator.instance;
  }

  private initializeShardCounters(): void {
    for (let i = 0; i < COORDINATOR_CONFIG.SHARD_COUNT; i++) {
      this.shardTPS.set(i, 0);
      this.shardTransactionCounts.set(i, 0);
    }
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('[ShardCoordinator] Already running');
      return;
    }
    
    if (this.isShuttingDown) {
      console.log('[ShardCoordinator] Cannot start while shutting down');
      return;
    }

    try {
      console.log('[ShardCoordinator] Starting shard processing coordinator...');
      
      this.orchestrator = getShardOrchestrator();
      this.orchestrator.start();
      console.log('[ShardCoordinator] ✅ Shard orchestrator started');
      
      this.router = getEnterpriseCrossShardRouter();
      console.log('[ShardCoordinator] ✅ Cross-shard router started');
      
      if (COORDINATOR_CONFIG.ENABLE_PARALLEL_PRODUCTION) {
        this.parallelProducer = getParallelShardBlockProducer();
        
        // Always remove existing listener first to prevent duplicates
        if (this.shardBlockHandler) {
          this.parallelProducer.removeListener('shardBlockProduced', this.shardBlockHandler);
          this.shardBlockHandler = null;
        }
        
        // Remove any orphaned listeners (safety measure)
        this.parallelProducer.removeAllListeners('shardBlockProduced');
        
        this.shardBlockHandler = (block: ShardBlock) => {
          if (this.isRunning && !this.isShuttingDown) {
            this.handleShardBlock(block);
          }
        };
        this.parallelProducer.on('shardBlockProduced', this.shardBlockHandler);
        
        await this.parallelProducer.start();
        console.log('[ShardCoordinator] ✅ Parallel shard block producer started');
      }
      
      this.isRunning = true;
      this.startTime = Date.now();
      this.lastMetricsTime = Date.now();
      
      this.metricsTimer = setInterval(() => this.collectMetrics(), COORDINATOR_CONFIG.METRICS_INTERVAL_MS);
      
      console.log('[ShardCoordinator] ✅ Coordinator started successfully');
      console.log(`[ShardCoordinator] 📊 Active shards: ${COORDINATOR_CONFIG.SHARD_COUNT}`);
      console.log(`[ShardCoordinator] 📊 Cross-shard ratio: ${COORDINATOR_CONFIG.CROSS_SHARD_RATIO * 100}%`);
      console.log(`[ShardCoordinator] 📊 Parallel production: ${COORDINATOR_CONFIG.ENABLE_PARALLEL_PRODUCTION ? 'ENABLED' : 'DISABLED'}`);
      
      this.emit('started');
    } catch (error) {
      console.error('[ShardCoordinator] Failed to start:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;
    
    this.isShuttingDown = true;
    console.log('[ShardCoordinator] Stopping...');
    
    // Clear metrics timer first
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
      this.metricsTimer = null;
    }
    
    // Stop parallel producer and remove listener
    if (this.parallelProducer) {
      // Remove all listeners to prevent any orphaned handlers
      if (this.shardBlockHandler) {
        this.parallelProducer.removeListener('shardBlockProduced', this.shardBlockHandler);
      }
      this.parallelProducer.removeAllListeners('shardBlockProduced');
      this.shardBlockHandler = null;
      
      await this.parallelProducer.stop();
      this.parallelProducer = null;
    }
    
    // Clear counters to free memory
    this.shardTPS.clear();
    this.shardTransactionCounts.clear();
    this.initializeShardCounters();
    
    this.isRunning = false;
    this.isShuttingDown = false;
    this.emit('stopped');
    console.log('[ShardCoordinator] ✅ Stopped');
  }
  
  /**
   * Emergency stop for memory pressure situations
   */
  async emergencyStop(): Promise<void> {
    console.log('[ShardCoordinator] ⚠️ Emergency stop triggered');
    this.isShuttingDown = true;
    this.isRunning = false;
    
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
      this.metricsTimer = null;
    }
    
    if (this.parallelProducer) {
      this.parallelProducer.removeAllListeners('shardBlockProduced');
      this.shardBlockHandler = null;
      this.parallelProducer.emergencyStop();
      this.parallelProducer = null;
    }
    
    this.shardTPS.clear();
    this.shardTransactionCounts.clear();
    
    this.isShuttingDown = false;
    console.log('[ShardCoordinator] ⚠️ Emergency stop completed');
    this.emit('emergencyStopped');
  }
  
  private handleShardBlock(block: ShardBlock): void {
    this.totalTransactionsRouted += block.transactionCount;
    this.crossShardMessagesRouted += block.crossShardTxCount;
    this.recordShardTransaction(block.shardId, block.transactionCount);
    
    for (let i = 0; i < block.crossShardTxCount; i++) {
      const targetShard = this.selectRandomShard(block.shardId);
      const tx: ShardTransaction = {
        id: `tx-${block.blockNumber}-${block.shardId}-${i}`,
        sourceShard: block.shardId,
        targetShard,
        isCrossShard: true,
        priority: this.assignPriority(),
        timestamp: block.timestamp,
        data: { blockNumber: block.blockNumber, shardId: block.shardId },
      };
      this.routeCrossShardMessage(tx);
    }
    
    this.emit('shardBlockProcessed', block);
  }

  processBlock(blockNumber: number, transactionCount: number, shardId: number): ShardBlockData {
    if (!this.isRunning) {
      return this.createEmptyBlockData(blockNumber, shardId);
    }

    const transactions: ShardTransaction[] = [];
    let crossShardCount = 0;

    for (let i = 0; i < transactionCount; i++) {
      const isCrossShard = Math.random() < COORDINATOR_CONFIG.CROSS_SHARD_RATIO;
      const targetShard = isCrossShard 
        ? this.selectRandomShard(shardId) 
        : shardId;
      
      const tx: ShardTransaction = {
        id: `tx-${blockNumber}-${i}`,
        sourceShard: shardId,
        targetShard,
        isCrossShard,
        priority: this.assignPriority(),
        timestamp: Date.now(),
        data: { blockNumber, index: i },
      };

      transactions.push(tx);
      
      if (isCrossShard) {
        crossShardCount++;
        this.routeCrossShardMessage(tx);
      }
      
      this.recordShardTransaction(shardId);
    }

    this.totalTransactionsRouted += transactionCount;
    this.crossShardMessagesRouted += crossShardCount;

    const blockData: ShardBlockData = {
      blockNumber,
      shardId,
      transactions,
      crossShardCount,
      timestamp: Date.now(),
    };

    this.emit('blockProcessed', blockData);
    return blockData;
  }

  private selectRandomShard(excludeShard: number): number {
    let targetShard = Math.floor(Math.random() * COORDINATOR_CONFIG.SHARD_COUNT);
    while (targetShard === excludeShard) {
      targetShard = Math.floor(Math.random() * COORDINATOR_CONFIG.SHARD_COUNT);
    }
    return targetShard;
  }

  private assignPriority(): 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW' {
    const rand = Math.random();
    if (rand < 0.01) return 'CRITICAL';
    if (rand < 0.10) return 'HIGH';
    if (rand < 0.80) return 'NORMAL';
    return 'LOW';
  }

  private async routeCrossShardMessage(tx: ShardTransaction): Promise<void> {
    if (!this.router || this.isShuttingDown) return;

    try {
      await this.router.sendMessage(
        tx.sourceShard,
        tx.targetShard,
        tx.data,
        tx.priority,
        {
          nonce: `${tx.id}-${Date.now()}`,
          ttlMs: 30000,
          metadata: { blockNumber: tx.data.blockNumber, index: tx.data.index },
        }
      );
    } catch (error) {
      this.crossShardMessagesFailed++;
      // Only log every 100 failures to avoid log spam
      if (this.crossShardMessagesFailed % 100 === 1) {
        console.error(`[ShardCoordinator] Cross-shard routing failed (total: ${this.crossShardMessagesFailed}):`, error);
      }
    }
  }
  
  /**
   * Get failure statistics for monitoring
   */
  getFailureStats(): { failed: number; successRate: number } {
    const total = this.crossShardMessagesRouted + this.crossShardMessagesFailed;
    const successRate = total > 0 ? (this.crossShardMessagesRouted / total) * 100 : 100;
    return {
      failed: this.crossShardMessagesFailed,
      successRate: Math.round(successRate * 100) / 100,
    };
  }

  private recordShardTransaction(shardId: number, count: number = 1): void {
    const current = this.shardTransactionCounts.get(shardId) || 0;
    this.shardTransactionCounts.set(shardId, current + count);
  }

  private collectMetrics(): void {
    const now = Date.now();
    const elapsed = (now - this.lastMetricsTime) / 1000;
    
    if (elapsed > 0) {
      for (let i = 0; i < COORDINATOR_CONFIG.SHARD_COUNT; i++) {
        const count = this.shardTransactionCounts.get(i) || 0;
        const tps = Math.round(count / elapsed);
        this.shardTPS.set(i, tps);
        this.shardTransactionCounts.set(i, 0);
      }
    }
    
    this.lastMetricsTime = now;
    
    const stats = this.getStats();
    this.emit('metrics', stats);
  }

  private createEmptyBlockData(blockNumber: number, shardId: number): ShardBlockData {
    return {
      blockNumber,
      shardId,
      transactions: [],
      crossShardCount: 0,
      timestamp: Date.now(),
    };
  }

  getStats(): CoordinatorStats {
    const routerStats = this.router?.getStats();
    
    return {
      isRunning: this.isRunning,
      shardsActive: COORDINATOR_CONFIG.SHARD_COUNT,
      totalTransactionsRouted: this.totalTransactionsRouted,
      crossShardMessagesRouted: this.crossShardMessagesRouted,
      currentShardTPS: new Map(this.shardTPS),
      averageLatencyMs: routerStats?.latencyP50Ms || 0,
      routerQueueDepth: routerStats?.currentQueueDepth || 0,
      uptimeMs: this.isRunning ? Date.now() - this.startTime : 0,
    };
  }

  getShardStats(): { shardId: number; tps: number; transactions: number }[] {
    const stats: { shardId: number; tps: number; transactions: number }[] = [];
    
    for (let i = 0; i < COORDINATOR_CONFIG.SHARD_COUNT; i++) {
      stats.push({
        shardId: i,
        tps: this.shardTPS.get(i) || 0,
        transactions: this.shardTransactionCounts.get(i) || 0,
      });
    }
    
    return stats;
  }

  isActive(): boolean {
    return this.isRunning;
  }
}

let coordinatorInstance: ShardProcessingCoordinator | null = null;

export function getShardProcessingCoordinator(): ShardProcessingCoordinator {
  if (!coordinatorInstance) {
    coordinatorInstance = ShardProcessingCoordinator.getInstance();
  }
  return coordinatorInstance;
}

export async function initializeShardProcessingCoordinator(): Promise<ShardProcessingCoordinator> {
  const coordinator = getShardProcessingCoordinator();
  await coordinator.start();
  return coordinator;
}

export async function shutdownShardProcessingCoordinator(): Promise<void> {
  if (coordinatorInstance) {
    await coordinatorInstance.stop();
  }
}

console.log('[ShardCoordinator] ✅ Shard processing coordinator module loaded');
