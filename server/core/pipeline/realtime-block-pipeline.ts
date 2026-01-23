/**
import { validatorAddressFromString } from "../../utils/tburn-address";
 * TBURN Realtime Block Production Pipeline
 * Lightweight pipeline for real-time block production data
 * Compatible with DEV_SAFE_MODE for production stability
 * 
 * @version 1.0.0
 * Targets: 55K-60K sustained TPS, optimized: 95K-100K TPS
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';
import { DEV_SAFE_MODE, METRICS_CONFIG } from '../memory/metrics-config';
import { db } from '../../db';
import { blocks } from '@shared/schema';
import { desc } from 'drizzle-orm';
import { getShardProcessingCoordinator, type ShardProcessingCoordinator } from './shard-processing-coordinator';

// ============================================================================
// Configuration
// ============================================================================

const PIPELINE_CONFIG = {
  // ★ [2026-01-13 STABILITY FIX] 2000ms in DEV_SAFE_MODE (was 500ms - caused event loop lag)
  BLOCK_INTERVAL_MS: DEV_SAFE_MODE ? 2000 : 100,
  
  // Target TPS for simulation (reduced for dev stability)
  TARGET_TPS: DEV_SAFE_MODE ? 24000 : 100000,
  
  // Max transactions per block
  MAX_TX_PER_BLOCK: DEV_SAFE_MODE ? 2000 : 10000,
  
  // Flush to DB interval
  DB_FLUSH_INTERVAL_MS: DEV_SAFE_MODE ? 10000 : 1000,
  
  // In-memory block buffer size
  BLOCK_BUFFER_SIZE: DEV_SAFE_MODE ? 5 : 100,
  
  // Stats collection interval
  STATS_INTERVAL_MS: 2000,
};

interface BlockData {
  number: number;
  hash: string;
  parentHash: string;
  stateRoot: string;
  timestamp: number;
  proposer: string;
  transactionCount: number;
  gasUsed: bigint;
  gasLimit: bigint;
  shardId: number;
}

interface PipelineStats {
  isRunning: boolean;
  currentBlockNumber: number;
  blocksProduced: number;
  transactionsProcessed: number;
  currentTPS: number;
  averageTPS: number;
  peakTPS: number;
  uptime: number;
  lastBlockTime: number;
  blocksPerSecond: number;
}

// ============================================================================
// Realtime Block Pipeline
// ============================================================================

export class RealtimeBlockPipeline extends EventEmitter {
  private static instance: RealtimeBlockPipeline | null = null;
  
  private isRunning: boolean = false;
  private currentBlockNumber: number = 0;
  private blocksProduced: number = 0;
  private transactionsProcessed: number = 0;
  private startTime: number = 0;
  private lastBlockTime: number = 0;
  
  // TPS tracking
  private tpsHistory: number[] = [];
  private peakTPS: number = 0;
  private currentTPS: number = 0;
  
  // Rolling window for TPS calculation (separate from flush buffer)
  private tpsWindow: { timestamp: number; txCount: number }[] = [];
  private readonly TPS_WINDOW_SIZE_MS = 10000; // 10 second rolling window
  
  // Block buffer (for DB persistence)
  private blockBuffer: BlockData[] = [];
  
  // Timers
  private blockTimer: NodeJS.Timeout | null = null;
  private flushTimer: NodeJS.Timeout | null = null;
  private statsTimer: NodeJS.Timeout | null = null;
  
  // Validator pool (simulated 125 validators)
  private validators: string[] = [];
  private validatorIndex: number = 0;
  
  // Shard processing coordinator
  private shardCoordinator: ShardProcessingCoordinator | null = null;
  
  private constructor() {
    super();
    this.initializeValidators();
  }
  
  static getInstance(): RealtimeBlockPipeline {
    if (!RealtimeBlockPipeline.instance) {
      RealtimeBlockPipeline.instance = new RealtimeBlockPipeline();
    }
    return RealtimeBlockPipeline.instance;
  }
  
  // ==================== Initialization ====================
  
  private initializeValidators(): void {
    // Generate 125 validator addresses
    for (let i = 0; i < 125; i++) {
      const hash = crypto.createHash('sha256')
        .update(`validator-${i}-genesis`)
        .digest('hex');
      this.validators.push(validatorAddressFromString(`validator-${hash.slice(0, 20)}`));
    }
  }
  
  async initialize(): Promise<void> {
    // Load current block height from database
    try {
      const latestBlock = await db
        .select({ blockNumber: blocks.blockNumber })
        .from(blocks)
        .orderBy(desc(blocks.blockNumber))
        .limit(1);
      
      this.currentBlockNumber = latestBlock[0]?.blockNumber || 0;
      console.log(`[BlockPipeline] ✅ Initialized at block #${this.currentBlockNumber}`);
    } catch (error) {
      console.error('[BlockPipeline] Error loading block height:', error);
      this.currentBlockNumber = 43903010; // Fallback to known height
    }
  }
  
  // ==================== Lifecycle ====================
  
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('[BlockPipeline] Already running');
      return;
    }
    
    await this.initialize();
    
    // Initialize shard processing coordinator
    try {
      this.shardCoordinator = getShardProcessingCoordinator();
      await this.shardCoordinator.start();
      console.log('[BlockPipeline] ✅ Shard coordinator connected');
    } catch (error) {
      console.error('[BlockPipeline] Shard coordinator init failed:', error);
    }
    
    this.isRunning = true;
    this.startTime = Date.now();
    this.lastBlockTime = Date.now();
    
    // Start block production
    this.blockTimer = setInterval(() => {
      this.produceBlock();
    }, PIPELINE_CONFIG.BLOCK_INTERVAL_MS);
    
    // Start DB flush
    this.flushTimer = setInterval(() => {
      this.flushToDatabase().catch(err => {
        console.error('[BlockPipeline] Flush error:', err);
      });
    }, PIPELINE_CONFIG.DB_FLUSH_INTERVAL_MS);
    
    // Start stats collection
    this.statsTimer = setInterval(() => {
      this.collectStats();
    }, PIPELINE_CONFIG.STATS_INTERVAL_MS);
    
    console.log(`[BlockPipeline] ✅ Started realtime block production`);
    console.log(`[BlockPipeline] 📊 Target TPS: ${PIPELINE_CONFIG.TARGET_TPS.toLocaleString()}`);
    console.log(`[BlockPipeline] ⚡ Block interval: ${PIPELINE_CONFIG.BLOCK_INTERVAL_MS}ms`);
    console.log(`[BlockPipeline] 🔒 DEV_SAFE_MODE: ${DEV_SAFE_MODE}`);
    
    this.emit('started');
  }
  
  async stop(): Promise<void> {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    if (this.blockTimer) {
      clearInterval(this.blockTimer);
      this.blockTimer = null;
    }
    
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    if (this.statsTimer) {
      clearInterval(this.statsTimer);
      this.statsTimer = null;
    }
    
    // Final flush
    await this.flushToDatabase();
    
    console.log('[BlockPipeline] Stopped');
    this.emit('stopped');
  }
  
  // ==================== Block Production ====================
  
  private produceBlock(): void {
    const now = Date.now();
    this.currentBlockNumber++;
    
    // Calculate realistic transaction count based on target TPS
    const blocksPerSecond = 1000 / PIPELINE_CONFIG.BLOCK_INTERVAL_MS;
    const txPerBlock = Math.floor(PIPELINE_CONFIG.TARGET_TPS / blocksPerSecond);
    
    // Add some variance (±10%)
    const variance = 0.9 + Math.random() * 0.2;
    const transactionCount = Math.min(
      Math.floor(txPerBlock * variance),
      PIPELINE_CONFIG.MAX_TX_PER_BLOCK
    );
    
    // Select proposer (round-robin among validators)
    const proposer = this.validators[this.validatorIndex % this.validators.length];
    this.validatorIndex++;
    
    // Generate block data
    const parentHash = this.blockBuffer.length > 0 
      ? this.blockBuffer[this.blockBuffer.length - 1].hash 
      : this.generateHash(`parent-${this.currentBlockNumber - 1}`);
    
    const block: BlockData = {
      number: this.currentBlockNumber,
      hash: this.generateHash(`block-${this.currentBlockNumber}-${now}`),
      parentHash,
      stateRoot: this.generateHash(`state-${this.currentBlockNumber}`),
      timestamp: now,
      proposer,
      transactionCount,
      gasUsed: BigInt(transactionCount * 21000),
      gasLimit: BigInt(30000000),
      shardId: this.currentBlockNumber % 24, // Rotate across 24 shards
    };
    
    // Add to buffer
    this.blockBuffer.push(block);
    this.blocksProduced++;
    this.transactionsProcessed += transactionCount;
    this.lastBlockTime = now;
    
    // Process through shard coordinator (enables cross-shard routing)
    if (this.shardCoordinator && this.shardCoordinator.isActive()) {
      this.shardCoordinator.processBlock(block.number, transactionCount, block.shardId);
    }
    
    // Add to TPS rolling window (separate from flush buffer)
    this.tpsWindow.push({ timestamp: now, txCount: transactionCount });
    
    // Trim TPS window to last 10 seconds
    const windowCutoff = now - this.TPS_WINDOW_SIZE_MS;
    this.tpsWindow = this.tpsWindow.filter(w => w.timestamp > windowCutoff);
    
    // Trim block buffer if needed (for memory)
    if (this.blockBuffer.length > PIPELINE_CONFIG.BLOCK_BUFFER_SIZE) {
      this.blockBuffer.shift();
    }
    
    // Emit event
    this.emit('blockProduced', block);
  }
  
  private generateHash(input: string): string {
    return 'bh1' + crypto.createHash('sha256').update(input).digest('hex');
  }
  
  // ==================== Stats Collection ====================
  
  private collectStats(): void {
    const now = Date.now();
    
    // Calculate current TPS from rolling window (last 1 second)
    const oneSecAgo = now - 1000;
    const recentTx = this.tpsWindow.filter(w => w.timestamp > oneSecAgo);
    this.currentTPS = recentTx.reduce((sum, w) => sum + w.txCount, 0);
    
    // Track TPS history for averaging
    this.tpsHistory.push(this.currentTPS);
    if (this.tpsHistory.length > 60) {
      this.tpsHistory.shift();
    }
    
    // Update peak TPS
    if (this.currentTPS > this.peakTPS) {
      this.peakTPS = this.currentTPS;
    }
    
    // Emit stats
    const stats = this.getStats();
    this.emit('stats', stats);
  }
  
  // ==================== Database Operations ====================
  
  private async flushToDatabase(): Promise<void> {
    if (this.blockBuffer.length === 0) return;
    
    const blocksToFlush = [...this.blockBuffer];
    
    // Don't clear buffer immediately - keep for TPS calculation
    // Only remove blocks older than 5 seconds
    const cutoff = Date.now() - 5000;
    this.blockBuffer = this.blockBuffer.filter(b => b.timestamp > cutoff);
    
    try {
      // Batch insert blocks
      const values = blocksToFlush.map(block => ({
        blockNumber: block.number,
        hash: block.hash,
        parentHash: block.parentHash,
        stateRoot: block.stateRoot,
        timestamp: block.timestamp,
        validatorAddress: block.proposer,
        transactionCount: block.transactionCount,
        gasUsed: Number(block.gasUsed),
        gasLimit: Number(block.gasLimit),
        size: 1024,
        receiptsRoot: '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
        shardId: block.shardId,
        finalityStatus: 'pending' as const,
        finalityConfirmations: 0,
        verificationCount: 0,
        requiredVerifications: 84,
      }));
      
      // Use onConflictDoNothing for idempotency
      for (const value of values) {
        await db.insert(blocks).values(value).onConflictDoNothing();
      }
    } catch (error) {
      // Log but don't throw - we want the pipeline to continue
      console.error('[BlockPipeline] Flush error:', (error as Error).message);
    }
  }
  
  // ==================== Public API ====================
  
  getStats(): PipelineStats {
    const now = Date.now();
    const uptime = this.startTime ? (now - this.startTime) / 1000 : 0;
    const averageTPS = uptime > 0 
      ? this.transactionsProcessed / uptime 
      : 0;
    
    const timeSinceLastBlock = this.lastBlockTime 
      ? (now - this.lastBlockTime) / 1000 
      : 0;
    
    const blocksPerSecond = this.blocksProduced > 0 && uptime > 0
      ? this.blocksProduced / uptime
      : 0;
    
    return {
      isRunning: this.isRunning,
      currentBlockNumber: this.currentBlockNumber,
      blocksProduced: this.blocksProduced,
      transactionsProcessed: this.transactionsProcessed,
      currentTPS: this.currentTPS,
      averageTPS: Math.round(averageTPS),
      peakTPS: this.peakTPS,
      uptime,
      lastBlockTime: this.lastBlockTime,
      blocksPerSecond: Math.round(blocksPerSecond * 100) / 100,
    };
  }
  
  getRecentBlocks(limit: number = 10): BlockData[] {
    return this.blockBuffer.slice(-limit);
  }
  
  getCurrentBlockNumber(): number {
    return this.currentBlockNumber;
  }
  
  isActive(): boolean {
    return this.isRunning;
  }
  
  getConfig(): typeof PIPELINE_CONFIG & { DEV_SAFE_MODE: boolean } {
    return {
      ...PIPELINE_CONFIG,
      DEV_SAFE_MODE,
    };
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

let pipelineInstance: RealtimeBlockPipeline | null = null;

export function getRealtimeBlockPipeline(): RealtimeBlockPipeline {
  if (!pipelineInstance) {
    pipelineInstance = RealtimeBlockPipeline.getInstance();
  }
  return pipelineInstance;
}

console.log('[BlockPipeline] ✅ Realtime block pipeline module loaded');
