import { db } from '../db';
import { 
  blocks, 
  transactions, 
  consensusRounds, 
  shards,
  crossShardMessages,
  networkStats 
} from '@shared/schema';
import { sql } from 'drizzle-orm';
import { EventEmitter } from 'events';

interface BlockData {
  blockHash: string;
  blockHeight: number;
  shardId: number;
  parentHash: string;
  stateRoot: string;
  transactionsRoot: string;
  receiptsRoot: string;
  gasUsed: number;
  gasLimit: number;
  timestamp: Date;
  proposer: string;
  signature: string;
  transactionCount: number;
  size: number;
}

interface ConsensusRoundData {
  roundNumber: number;
  epoch: number;
  blockHash: string;
  proposerId: string;
  phase: number;
  votesFor: number;
  votesAgainst: number;
  quorumReached: boolean;
  finalized: boolean;
  startTime: Date;
  endTime: Date;
  duration: number;
}

interface ShardMetricsData {
  shardId: number;
  blockHeight: number;
  stateRoot: string;
  accountCount: number;
  storageBytes: number;
  tps: number;
  latency: number;
  pendingMessages: number;
  timestamp: Date;
}

interface CrossShardData {
  messageId: string;
  sourceShardId: number;
  targetShardId: number;
  payload: string;
  status: string;
  latencyMs: number;
  retries: number;
  timestamp: Date;
}

interface NetworkMetricsData {
  timestamp: Date;
  totalTps: number;
  averageBlockTime: number;
  totalGasUsed: string;
  activeValidators: number;
  totalBlocks: number;
  totalTransactions: number;
  networkLoad: number;
}

interface BatcherConfig {
  maxBufferSize: number;
  flushIntervalMs: number;
  maxRetries: number;
  retryDelayMs: number;
  enableMetrics: boolean;
}

const DEFAULT_BATCHER_CONFIG: BatcherConfig = {
  maxBufferSize: 100,
  flushIntervalMs: 1000,
  maxRetries: 3,
  retryDelayMs: 500,
  enableMetrics: true,
};

export class PersistenceBatcher extends EventEmitter {
  private config: BatcherConfig;
  
  private blockBuffer: BlockData[] = [];
  private consensusBuffer: ConsensusRoundData[] = [];
  private shardMetricsBuffer: ShardMetricsData[] = [];
  private crossShardBuffer: CrossShardData[] = [];
  private networkMetricsBuffer: NetworkMetricsData[] = [];
  
  private flushInterval: NodeJS.Timeout | null = null;
  private isFlushing: boolean = false;
  private isShuttingDown: boolean = false;
  
  private metrics = {
    totalBlocksWritten: 0,
    totalConsensusRoundsWritten: 0,
    totalShardMetricsWritten: 0,
    totalCrossShardWritten: 0,
    totalNetworkMetricsWritten: 0,
    totalFlushes: 0,
    totalErrors: 0,
    averageFlushDuration: 0,
    lastFlushTime: 0,
  };

  constructor(config: Partial<BatcherConfig> = {}) {
    super();
    this.config = { ...DEFAULT_BATCHER_CONFIG, ...config };
  }

  start(): void {
    if (this.flushInterval) return;
    
    console.log('📦 PersistenceBatcher: Starting with flush interval', this.config.flushIntervalMs, 'ms');
    
    this.flushInterval = setInterval(() => {
      this.flush().catch(error => {
        console.error('PersistenceBatcher flush error:', error);
        this.metrics.totalErrors++;
      });
    }, this.config.flushIntervalMs);
  }

  stop(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }

  addBlock(block: BlockData): void {
    this.blockBuffer.push(block);
    
    if (this.blockBuffer.length >= this.config.maxBufferSize) {
      this.flush().catch(console.error);
    }
  }

  addConsensusRound(round: ConsensusRoundData): void {
    this.consensusBuffer.push(round);
    
    if (this.consensusBuffer.length >= this.config.maxBufferSize) {
      this.flush().catch(console.error);
    }
  }

  addShardMetrics(metrics: ShardMetricsData): void {
    this.shardMetricsBuffer.push(metrics);
    
    if (this.shardMetricsBuffer.length >= this.config.maxBufferSize) {
      this.flush().catch(console.error);
    }
  }

  addCrossShardMessage(message: CrossShardData): void {
    this.crossShardBuffer.push(message);
    
    if (this.crossShardBuffer.length >= this.config.maxBufferSize) {
      this.flush().catch(console.error);
    }
  }

  addNetworkMetrics(metrics: NetworkMetricsData): void {
    this.networkMetricsBuffer.push(metrics);
    
    if (this.networkMetricsBuffer.length >= this.config.maxBufferSize) {
      this.flush().catch(console.error);
    }
  }

  async flush(): Promise<void> {
    if (this.isFlushing || this.isShuttingDown) return;
    
    const hasData = 
      this.blockBuffer.length > 0 ||
      this.consensusBuffer.length > 0 ||
      this.shardMetricsBuffer.length > 0 ||
      this.crossShardBuffer.length > 0 ||
      this.networkMetricsBuffer.length > 0;
    
    if (!hasData) return;
    
    this.isFlushing = true;
    const startTime = Date.now();
    
    const blocksToWrite = [...this.blockBuffer];
    const consensusToWrite = [...this.consensusBuffer];
    const shardMetricsToWrite = [...this.shardMetricsBuffer];
    const crossShardToWrite = [...this.crossShardBuffer];
    const networkMetricsToWrite = [...this.networkMetricsBuffer];
    
    this.blockBuffer = [];
    this.consensusBuffer = [];
    this.shardMetricsBuffer = [];
    this.crossShardBuffer = [];
    this.networkMetricsBuffer = [];
    
    try {
      await this.executeWithRetry(async () => {
        await db.transaction(async (tx) => {
          if (blocksToWrite.length > 0) {
            const blockInserts = blocksToWrite.map(b => ({
              blockHash: b.blockHash,
              blockHeight: b.blockHeight,
              parentHash: b.parentHash,
              stateRoot: b.stateRoot,
              transactionsRoot: b.transactionsRoot,
              receiptsRoot: b.receiptsRoot,
              validator: b.proposer,
              timestamp: b.timestamp,
              gasUsed: b.gasUsed.toString(),
              gasLimit: b.gasLimit.toString(),
              baseFeePerGas: '1000000000',
              size: b.size,
              transactionCount: b.transactionCount,
              shardId: b.shardId,
              status: 'finalized',
            }));
            
            for (const blockInsert of blockInserts) {
              await tx.insert(blocks).values(blockInsert).onConflictDoNothing();
            }
            this.metrics.totalBlocksWritten += blocksToWrite.length;
          }
          
          if (consensusToWrite.length > 0) {
            const consensusInserts = consensusToWrite.map(c => ({
              roundNumber: c.roundNumber,
              epoch: c.epoch,
              blockHash: c.blockHash,
              proposerId: c.proposerId,
              phase: c.phase,
              votesFor: c.votesFor,
              votesAgainst: c.votesAgainst,
              votingPower: '0',
              quorumReached: c.quorumReached,
              finalized: c.finalized,
              startTime: c.startTime,
              endTime: c.endTime,
              duration: c.duration,
            }));
            
            for (const consensusInsert of consensusInserts) {
              await tx.insert(consensusRounds).values(consensusInsert).onConflictDoNothing();
            }
            this.metrics.totalConsensusRoundsWritten += consensusToWrite.length;
          }
          
          if (crossShardToWrite.length > 0) {
            const crossShardInserts = crossShardToWrite.map(m => ({
              messageId: m.messageId,
              sourceShardId: m.sourceShardId,
              targetShardId: m.targetShardId,
              payload: m.payload,
              status: m.status,
              priority: 1,
              createdAt: m.timestamp,
              deliveredAt: m.status === 'delivered' ? m.timestamp : null,
            }));
            
            for (const crossShardInsert of crossShardInserts) {
              await tx.insert(crossShardMessages).values(crossShardInsert).onConflictDoNothing();
            }
            this.metrics.totalCrossShardWritten += crossShardToWrite.length;
          }
        });
      });
      
      const flushDuration = Date.now() - startTime;
      this.metrics.totalFlushes++;
      this.metrics.lastFlushTime = Date.now();
      this.metrics.averageFlushDuration = 
        (this.metrics.averageFlushDuration * (this.metrics.totalFlushes - 1) + flushDuration) / 
        this.metrics.totalFlushes;
      
      this.emit('flush', {
        blocksWritten: blocksToWrite.length,
        consensusWritten: consensusToWrite.length,
        shardMetricsWritten: shardMetricsToWrite.length,
        crossShardWritten: crossShardToWrite.length,
        networkMetricsWritten: networkMetricsToWrite.length,
        duration: flushDuration,
      });
      
    } catch (error) {
      this.blockBuffer = [...blocksToWrite, ...this.blockBuffer];
      this.consensusBuffer = [...consensusToWrite, ...this.consensusBuffer];
      this.shardMetricsBuffer = [...shardMetricsToWrite, ...this.shardMetricsBuffer];
      this.crossShardBuffer = [...crossShardToWrite, ...this.crossShardBuffer];
      this.networkMetricsBuffer = [...networkMetricsToWrite, ...this.networkMetricsBuffer];
      
      this.metrics.totalErrors++;
      this.emit('error', error);
      throw error;
      
    } finally {
      this.isFlushing = false;
    }
  }

  private async executeWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < this.config.maxRetries) {
          await new Promise(resolve => 
            setTimeout(resolve, this.config.retryDelayMs * attempt)
          );
        }
      }
    }
    
    throw lastError;
  }

  getMetrics(): typeof this.metrics & {
    pendingBlocks: number;
    pendingConsensusRounds: number;
    pendingShardMetrics: number;
    pendingCrossShardMessages: number;
    pendingNetworkMetrics: number;
  } {
    return {
      ...this.metrics,
      pendingBlocks: this.blockBuffer.length,
      pendingConsensusRounds: this.consensusBuffer.length,
      pendingShardMetrics: this.shardMetricsBuffer.length,
      pendingCrossShardMessages: this.crossShardBuffer.length,
      pendingNetworkMetrics: this.networkMetricsBuffer.length,
    };
  }

  async shutdown(): Promise<void> {
    console.log('📦 PersistenceBatcher: Shutting down...');
    this.isShuttingDown = true;
    this.stop();
    
    try {
      await this.flush();
    } catch (error) {
      console.error('PersistenceBatcher shutdown flush error:', error);
    }
    
    console.log('✅ PersistenceBatcher: Shutdown complete');
  }
}

let batcherInstance: PersistenceBatcher | null = null;

export function getPersistenceBatcher(): PersistenceBatcher {
  if (!batcherInstance) {
    batcherInstance = new PersistenceBatcher();
  }
  return batcherInstance;
}

export function initializePersistenceBatcher(config?: Partial<BatcherConfig>): PersistenceBatcher {
  if (!batcherInstance) {
    batcherInstance = new PersistenceBatcher(config);
    batcherInstance.start();
  }
  return batcherInstance;
}

export async function shutdownPersistenceBatcher(): Promise<void> {
  if (batcherInstance) {
    await batcherInstance.shutdown();
    batcherInstance = null;
  }
}
