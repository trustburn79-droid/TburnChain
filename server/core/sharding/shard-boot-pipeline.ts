/**
 * TBURN Staged Shard Boot Pipeline v6.0
 * 
 * Implements non-blocking, staged shard activation to prevent
 * event loop blocking and upstream timeouts.
 * 
 * Key features:
 * - Intent queue for O(1) scale request handling
 * - Shell warming with minimal state objects
 * - Async streaming of validators/metrics
 * - Readiness confirmation before traffic routing
 * 
 * @author TBURN Development Team
 * @version 6.0.0
 */

import { EventEmitter } from 'events';

export interface ShardShell {
  id: number;
  status: 'warming' | 'loading' | 'ready' | 'failed';
  createdAt: number;
  readyAt: number | null;
  memoryFootprintMB: number;
  validatorCount: number;
  loadProgress: number;
}

export interface BootIntent {
  shardId: number;
  priority: 'urgent' | 'normal' | 'low';
  requestedAt: number;
  retryCount: number;
}

export interface PipelineConfig {
  maxConcurrentActivations: number;
  activationSpacingMs: number;
  shellInitTimeoutMs: number;
  backoffBaseMs: number;
  backoffMaxMs: number;
  maxRetries: number;
}

export interface PipelineMetrics {
  totalIntents: number;
  pendingIntents: number;
  activeActivations: number;
  completedActivations: number;
  failedActivations: number;
  avgActivationTimeMs: number;
  lastActivationAt: number | null;
}

const DEFAULT_CONFIG: PipelineConfig = {
  maxConcurrentActivations: 2,
  activationSpacingMs: 5000,
  backoffBaseMs: 2000,
  backoffMaxMs: 30000,
  shellInitTimeoutMs: 3000,
  maxRetries: 3,
};

export class ShardBootPipeline extends EventEmitter {
  private config: PipelineConfig;
  private intentQueue: BootIntent[] = [];
  private activeShells: Map<number, ShardShell> = new Map();
  private activeActivations = 0;
  private lastActivationTime = 0;
  private processingTimer: NodeJS.Timeout | null = null;
  private isProcessing = false;
  
  private metrics: PipelineMetrics = {
    totalIntents: 0,
    pendingIntents: 0,
    activeActivations: 0,
    completedActivations: 0,
    failedActivations: 0,
    avgActivationTimeMs: 0,
    lastActivationAt: null,
  };
  
  private activationTimes: number[] = [];
  
  constructor(config: Partial<PipelineConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    console.log('[ShardBootPipeline] ✅ Initialized with staged activation');
    console.log(`[ShardBootPipeline] Max concurrent: ${this.config.maxConcurrentActivations}, Spacing: ${this.config.activationSpacingMs}ms`);
  }
  
  /**
   * Stage 1: Queue scale intent (O(1) non-blocking)
   */
  queueScaleIntent(shardIds: number[], priority: 'urgent' | 'normal' | 'low' = 'normal'): void {
    const now = Date.now();
    
    for (const shardId of shardIds) {
      if (this.intentQueue.some(i => i.shardId === shardId)) {
        continue;
      }
      if (this.activeShells.has(shardId)) {
        continue;
      }
      
      const intent: BootIntent = {
        shardId,
        priority,
        requestedAt: now,
        retryCount: 0,
      };
      
      if (priority === 'urgent') {
        this.intentQueue.unshift(intent);
      } else {
        this.intentQueue.push(intent);
      }
      
      this.metrics.totalIntents++;
      this.metrics.pendingIntents = this.intentQueue.length;
    }
    
    this.emit('intentsQueued', { count: shardIds.length, queueSize: this.intentQueue.length });
    this.scheduleProcessing();
  }
  
  /**
   * Schedule non-blocking queue processing
   */
  private scheduleProcessing(): void {
    if (this.processingTimer || this.isProcessing) {
      return;
    }
    
    const timeSinceLastActivation = Date.now() - this.lastActivationTime;
    const delay = Math.max(0, this.config.activationSpacingMs - timeSinceLastActivation);
    
    this.processingTimer = setTimeout(() => {
      this.processingTimer = null;
      this.processQueue();
    }, delay);
  }
  
  /**
   * Process queue with rate limiting and concurrency control
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;
    
    try {
      while (this.intentQueue.length > 0 && 
             this.activeActivations < this.config.maxConcurrentActivations) {
        
        const intent = this.intentQueue.shift();
        if (!intent) break;
        
        this.metrics.pendingIntents = this.intentQueue.length;
        
        setImmediate(() => this.activateShardAsync(intent));
        this.activeActivations++;
        this.metrics.activeActivations = this.activeActivations;
        
        if (this.intentQueue.length > 0 && 
            this.activeActivations < this.config.maxConcurrentActivations) {
          await this.sleep(100);
        }
      }
    } finally {
      this.isProcessing = false;
      
      if (this.intentQueue.length > 0) {
        this.scheduleProcessing();
      }
    }
  }
  
  /**
   * Stage 2 & 3: Async shard activation with shell warming and streaming
   */
  private async activateShardAsync(intent: BootIntent): Promise<void> {
    const startTime = Date.now();
    const { shardId } = intent;
    
    try {
      const shell = await this.warmShardShell(shardId);
      this.activeShells.set(shardId, shell);
      
      await this.streamLoadState(shell);
      
      shell.status = 'ready';
      shell.readyAt = Date.now();
      shell.loadProgress = 100;
      
      const activationTime = Date.now() - startTime;
      this.recordActivationTime(activationTime);
      this.lastActivationTime = Date.now();
      this.metrics.lastActivationAt = this.lastActivationTime;
      this.metrics.completedActivations++;
      
      this.emit('shardReady', { shardId, activationTimeMs: activationTime, shell });
      console.log(`[ShardBootPipeline] ✅ Shard ${shardId} ready in ${activationTime}ms`);
      
    } catch (error) {
      console.error(`[ShardBootPipeline] ❌ Shard ${shardId} activation failed:`, error);
      
      if (intent.retryCount < this.config.maxRetries) {
        const backoff = Math.min(
          this.config.backoffBaseMs * Math.pow(2, intent.retryCount),
          this.config.backoffMaxMs
        );
        
        intent.retryCount++;
        
        setTimeout(() => {
          this.intentQueue.push(intent);
          this.metrics.pendingIntents = this.intentQueue.length;
          this.scheduleProcessing();
        }, backoff);
        
        console.log(`[ShardBootPipeline] ⏰ Shard ${shardId} retry ${intent.retryCount}/${this.config.maxRetries} in ${backoff}ms`);
      } else {
        this.metrics.failedActivations++;
        this.emit('shardFailed', { shardId, error });
      }
      
      this.activeShells.delete(shardId);
    } finally {
      this.activeActivations--;
      this.metrics.activeActivations = this.activeActivations;
      
      if (this.intentQueue.length > 0) {
        this.scheduleProcessing();
      }
    }
  }
  
  /**
   * Stage 2: Create minimal shell with lazy initialization
   */
  private async warmShardShell(shardId: number): Promise<ShardShell> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Shell init timeout for shard ${shardId}`));
      }, this.config.shellInitTimeoutMs);
      
      setImmediate(() => {
        clearTimeout(timeout);
        
        const shell: ShardShell = {
          id: shardId,
          status: 'warming',
          createdAt: Date.now(),
          readyAt: null,
          memoryFootprintMB: 0.5,
          validatorCount: 0,
          loadProgress: 0,
        };
        
        resolve(shell);
      });
    });
  }
  
  /**
   * Stage 3: Stream load state in chunks to prevent blocking
   */
  private async streamLoadState(shell: ShardShell): Promise<void> {
    shell.status = 'loading';
    
    const CHUNK_SIZE = 10;
    const VALIDATORS_PER_SHARD = 125;
    const chunks = Math.ceil(VALIDATORS_PER_SHARD / CHUNK_SIZE);
    
    for (let i = 0; i < chunks; i++) {
      await this.yieldToEventLoop();
      
      shell.validatorCount = Math.min((i + 1) * CHUNK_SIZE, VALIDATORS_PER_SHARD);
      shell.loadProgress = Math.round(((i + 1) / chunks) * 100);
      shell.memoryFootprintMB = 0.5 + (shell.validatorCount * 0.1);
      
      this.emit('loadProgress', { 
        shardId: shell.id, 
        progress: shell.loadProgress,
        validatorCount: shell.validatorCount 
      });
    }
  }
  
  /**
   * Yield to event loop to prevent blocking
   */
  private yieldToEventLoop(): Promise<void> {
    return new Promise(resolve => setImmediate(resolve));
  }
  
  /**
   * Simple sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Record activation time for metrics
   */
  private recordActivationTime(timeMs: number): void {
    this.activationTimes.push(timeMs);
    if (this.activationTimes.length > 100) {
      this.activationTimes.shift();
    }
    
    const sum = this.activationTimes.reduce((a, b) => a + b, 0);
    this.metrics.avgActivationTimeMs = Math.round(sum / this.activationTimes.length);
  }
  
  /**
   * Get shell by shard ID
   */
  getShell(shardId: number): ShardShell | undefined {
    return this.activeShells.get(shardId);
  }
  
  /**
   * Check if shard is ready
   */
  isShardReady(shardId: number): boolean {
    const shell = this.activeShells.get(shardId);
    return shell?.status === 'ready';
  }
  
  /**
   * Remove shard from active shells (for deactivation)
   */
  removeShell(shardId: number): boolean {
    return this.activeShells.delete(shardId);
  }
  
  /**
   * Get pipeline metrics
   */
  getMetrics(): PipelineMetrics {
    return { ...this.metrics };
  }
  
  /**
   * Get all active shells
   */
  getAllShells(): ShardShell[] {
    return Array.from(this.activeShells.values());
  }
  
  /**
   * Clear pending intents (for emergency)
   */
  clearPendingIntents(): number {
    const cleared = this.intentQueue.length;
    this.intentQueue = [];
    this.metrics.pendingIntents = 0;
    return cleared;
  }
  
  /**
   * Cleanup
   */
  destroy(): void {
    if (this.processingTimer) {
      clearTimeout(this.processingTimer);
      this.processingTimer = null;
    }
    this.intentQueue = [];
    this.activeShells.clear();
    this.removeAllListeners();
  }
}

export const shardBootPipeline = new ShardBootPipeline();
