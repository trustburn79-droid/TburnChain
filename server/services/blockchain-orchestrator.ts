import { EventEmitter } from 'events';
import { getWorkerPool, initializeWorkerPool, shutdownWorkerPool, WorkerPool } from '../workers/worker-pool';
import { 
  getPersistenceBatcher, 
  initializePersistenceBatcher, 
  shutdownPersistenceBatcher,
  PersistenceBatcher 
} from './persistence-batcher';
import { 
  getAdaptiveFeeEngine, 
  initializeAdaptiveFeeEngine,
  AdaptiveFeeEngine 
} from '../core/fees/adaptive-fee-engine';
import { WorkerMessageType, BlockProcessRequest, ConsensusRoundRequest } from '@shared/worker-messages';

// ============================================================================
// Enterprise Configuration Types
// ============================================================================

interface OrchestratorConfig {
  shardCount: number;
  validatorsPerShard: number;
  blockTimeMs: number;
  enableWorkerThreads: boolean;
  enableBatchPersistence: boolean;
  enableAdaptiveFees: boolean;
  batchFlushIntervalMs: number;
  workerPoolMinSize: number;
  workerPoolMaxSize: number;
  // Enterprise additions
  enableCircuitBreaker: boolean;
  enableHealthChecks: boolean;
  enableAlerts: boolean;
  healthCheckIntervalMs: number;
  circuitBreakerThreshold: number;
  circuitBreakerResetTimeMs: number;
}

const DEFAULT_ORCHESTRATOR_CONFIG: OrchestratorConfig = {
  shardCount: 5,
  validatorsPerShard: 25,
  blockTimeMs: 100,
  enableWorkerThreads: true,
  enableBatchPersistence: true,
  enableAdaptiveFees: true,
  batchFlushIntervalMs: 1000,
  workerPoolMinSize: 2,
  workerPoolMaxSize: 4,
  // Enterprise defaults
  enableCircuitBreaker: true,
  enableHealthChecks: true,
  enableAlerts: true,
  healthCheckIntervalMs: 10000,
  circuitBreakerThreshold: 5,
  circuitBreakerResetTimeMs: 30000,
};

// ============================================================================
// Circuit Breaker Pattern Implementation
// ============================================================================

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerState {
  state: CircuitState;
  failures: number;
  lastFailureTime: number;
  successesSinceHalfOpen: number;
  totalTrips: number;
  lastTripTime: number;
}

class CircuitBreaker {
  private state: CircuitBreakerState = {
    state: 'CLOSED',
    failures: 0,
    lastFailureTime: 0,
    successesSinceHalfOpen: 0,
    totalTrips: 0,
    lastTripTime: 0,
  };

  constructor(
    private threshold: number = 5,
    private resetTimeMs: number = 30000,
    private onStateChange?: (oldState: CircuitState, newState: CircuitState) => void
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state.state === 'OPEN') {
      if (Date.now() - this.state.lastFailureTime >= this.resetTimeMs) {
        this.transition('HALF_OPEN');
      } else {
        throw new Error('Circuit breaker is OPEN - operation blocked');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state.state === 'HALF_OPEN') {
      this.state.successesSinceHalfOpen++;
      if (this.state.successesSinceHalfOpen >= 3) {
        this.transition('CLOSED');
      }
    }
    this.state.failures = 0;
  }

  private onFailure(): void {
    this.state.failures++;
    this.state.lastFailureTime = Date.now();

    if (this.state.failures >= this.threshold) {
      this.transition('OPEN');
      this.state.totalTrips++;
      this.state.lastTripTime = Date.now();
    }
  }

  private transition(newState: CircuitState): void {
    const oldState = this.state.state;
    this.state.state = newState;
    this.state.successesSinceHalfOpen = 0;
    
    if (this.onStateChange) {
      this.onStateChange(oldState, newState);
    }
  }

  getState(): CircuitBreakerState {
    return { ...this.state };
  }

  reset(): void {
    this.state = {
      state: 'CLOSED',
      failures: 0,
      lastFailureTime: 0,
      successesSinceHalfOpen: 0,
      totalTrips: this.state.totalTrips,
      lastTripTime: this.state.lastTripTime,
    };
  }
}

// ============================================================================
// Health Check System
// ============================================================================

type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'critical';

interface ComponentHealth {
  name: string;
  status: HealthStatus;
  lastCheck: number;
  latencyMs: number;
  details: Record<string, unknown>;
  consecutiveFailures: number;
}

interface SystemHealth {
  overall: HealthStatus;
  components: ComponentHealth[];
  uptime: number;
  lastFullCheck: number;
}

// ============================================================================
// Alert System
// ============================================================================

type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

interface Alert {
  id: string;
  severity: AlertSeverity;
  component: string;
  message: string;
  timestamp: number;
  acknowledged: boolean;
  metadata: Record<string, unknown>;
}

interface AlertConfig {
  maxAlerts: number;
  deduplicationWindowMs: number;
  escalationThresholds: Record<AlertSeverity, number>;
}

class AlertManager {
  private alerts: Alert[] = [];
  private config: AlertConfig = {
    maxAlerts: 1000,
    deduplicationWindowMs: 60000,
    escalationThresholds: {
      info: 10,
      warning: 5,
      error: 3,
      critical: 1,
    },
  };

  constructor(private emitter: EventEmitter) {}

  raise(severity: AlertSeverity, component: string, message: string, metadata: Record<string, unknown> = {}): Alert {
    const now = Date.now();
    
    // Deduplication check
    const isDuplicate = this.alerts.some(a => 
      a.component === component && 
      a.message === message && 
      now - a.timestamp < this.config.deduplicationWindowMs
    );

    if (isDuplicate) {
      return this.alerts.find(a => a.component === component && a.message === message)!;
    }

    const alert: Alert = {
      id: `alert-${now}-${Math.random().toString(36).substr(2, 9)}`,
      severity,
      component,
      message,
      timestamp: now,
      acknowledged: false,
      metadata,
    };

    this.alerts.unshift(alert);
    
    // Trim old alerts
    if (this.alerts.length > this.config.maxAlerts) {
      this.alerts = this.alerts.slice(0, this.config.maxAlerts);
    }

    this.emitter.emit('alert', alert);

    return alert;
  }

  acknowledge(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  getActiveAlerts(severity?: AlertSeverity): Alert[] {
    let filtered = this.alerts.filter(a => !a.acknowledged);
    if (severity) {
      filtered = filtered.filter(a => a.severity === severity);
    }
    return filtered;
  }

  getAlertStats(): { total: number; byPriority: Record<AlertSeverity, number>; unacknowledged: number } {
    const byPriority: Record<AlertSeverity, number> = { info: 0, warning: 0, error: 0, critical: 0 };
    
    for (const alert of this.alerts) {
      byPriority[alert.severity]++;
    }

    return {
      total: this.alerts.length,
      byPriority,
      unacknowledged: this.alerts.filter(a => !a.acknowledged).length,
    };
  }

  clearOldAlerts(maxAgeMs: number = 86400000): number {
    const cutoff = Date.now() - maxAgeMs;
    const before = this.alerts.length;
    this.alerts = this.alerts.filter(a => a.timestamp > cutoff || !a.acknowledged);
    return before - this.alerts.length;
  }
}

// ============================================================================
// Enhanced Blockchain Metrics
// ============================================================================

interface BlockchainMetrics {
  blocksProduced: number;
  consensusRoundsCompleted: number;
  crossShardMessagesProcessed: number;
  averageBlockTime: number;
  currentTps: number;
  averageGasPrice: string;
  networkCongestion: number;
  activeWorkers: number;
  pendingPersistence: number;
  // Enterprise additions
  blockTimeP50: number;
  blockTimeP95: number;
  blockTimeP99: number;
  failedBlocks: number;
  circuitBreakerTrips: number;
  healthCheckLatency: number;
  uptimeSeconds: number;
}

interface BlockProductionStats {
  totalBlocks: number;
  successfulBlocks: number;
  failedBlocks: number;
  averageBlockTime: number;
  minBlockTime: number;
  maxBlockTime: number;
  blockTimesP50: number;
  blockTimesP95: number;
  blockTimesP99: number;
  gasUtilization: number;
  transactionsPerBlock: number;
}

// ============================================================================
// Main Orchestrator Class (Enterprise Enhanced)
// ============================================================================

export class BlockchainOrchestrator extends EventEmitter {
  private config: OrchestratorConfig;
  private workerPool: WorkerPool | null = null;
  private persistenceBatcher: PersistenceBatcher | null = null;
  private feeEngine: AdaptiveFeeEngine | null = null;
  
  private isRunning: boolean = false;
  private blockProductionInterval: NodeJS.Timeout | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private currentBlockHeight: number = 1245678;
  private currentEpoch: number = 1;
  private currentRound: number = 1;
  
  private recentBlockTimes: number[] = [];
  private lastBlockTimestamp: number = 0;
  private startTime: number = 0;
  
  // Enterprise components
  private circuitBreaker: CircuitBreaker | null = null;
  private alertManager: AlertManager;
  private systemHealth: SystemHealth;
  
  private metrics: BlockchainMetrics = {
    blocksProduced: 0,
    consensusRoundsCompleted: 0,
    crossShardMessagesProcessed: 0,
    averageBlockTime: 100,
    currentTps: 0,
    averageGasPrice: '1000000000',
    networkCongestion: 0,
    activeWorkers: 0,
    pendingPersistence: 0,
    // Enterprise metrics
    blockTimeP50: 100,
    blockTimeP95: 100,
    blockTimeP99: 100,
    failedBlocks: 0,
    circuitBreakerTrips: 0,
    healthCheckLatency: 0,
    uptimeSeconds: 0,
  };

  private blockProductionStats: BlockProductionStats = {
    totalBlocks: 0,
    successfulBlocks: 0,
    failedBlocks: 0,
    averageBlockTime: 0,
    minBlockTime: Infinity,
    maxBlockTime: 0,
    blockTimesP50: 0,
    blockTimesP95: 0,
    blockTimesP99: 0,
    gasUtilization: 0,
    transactionsPerBlock: 0,
  };

  constructor(config: Partial<OrchestratorConfig> = {}) {
    super();
    this.config = { ...DEFAULT_ORCHESTRATOR_CONFIG, ...config };
    this.alertManager = new AlertManager(this);
    this.systemHealth = {
      overall: 'healthy',
      components: [],
      uptime: 0,
      lastFullCheck: 0,
    };
  }

  async initialize(): Promise<void> {
    console.log('🚀 BlockchainOrchestrator: Initializing enterprise-grade blockchain services...');
    this.startTime = Date.now();
    
    // Initialize Circuit Breaker
    if (this.config.enableCircuitBreaker) {
      this.circuitBreaker = new CircuitBreaker(
        this.config.circuitBreakerThreshold,
        this.config.circuitBreakerResetTimeMs,
        (oldState, newState) => {
          console.log(`🔌 Circuit Breaker: ${oldState} → ${newState}`);
          if (newState === 'OPEN') {
            this.metrics.circuitBreakerTrips++;
            this.alertManager.raise('critical', 'CircuitBreaker', 
              'Circuit breaker tripped due to consecutive failures', 
              { oldState, newState }
            );
          }
        }
      );
    }
    
    // Initialize Worker Pool
    if (this.config.enableWorkerThreads) {
      try {
        this.workerPool = await initializeWorkerPool({
          minWorkers: this.config.workerPoolMinSize,
          maxWorkers: this.config.workerPoolMaxSize,
        });
        console.log('✅ Worker thread pool initialized');
      } catch (error) {
        console.warn('⚠️ Worker threads not available, falling back to main thread:', error);
        this.config.enableWorkerThreads = false;
      }
    }
    
    // Initialize Batch Persistence
    if (this.config.enableBatchPersistence) {
      this.persistenceBatcher = initializePersistenceBatcher({
        flushIntervalMs: this.config.batchFlushIntervalMs,
        maxBufferSize: 50,
      });
      console.log('✅ Batch persistence system initialized');
    }
    
    // Initialize Adaptive Fee Engine
    if (this.config.enableAdaptiveFees) {
      this.feeEngine = initializeAdaptiveFeeEngine({}, this.config.shardCount);
      console.log('✅ Adaptive fee engine initialized');
    }
    
    // Start Health Check Loop
    if (this.config.enableHealthChecks) {
      this.startHealthCheckLoop();
      console.log('✅ Health check system initialized');
    }
    
    console.log('🎯 BlockchainOrchestrator: All systems ready');
    console.log(`   - Shards: ${this.config.shardCount}`);
    console.log(`   - Validators: ${this.config.shardCount * this.config.validatorsPerShard}`);
    console.log(`   - Block time: ${this.config.blockTimeMs}ms`);
    console.log(`   - Worker threads: ${this.config.enableWorkerThreads ? 'enabled' : 'disabled'}`);
    console.log(`   - Batch persistence: ${this.config.enableBatchPersistence ? 'enabled' : 'disabled'}`);
    console.log(`   - Adaptive fees: ${this.config.enableAdaptiveFees ? 'enabled' : 'disabled'}`);
    console.log(`   - Circuit breaker: ${this.config.enableCircuitBreaker ? 'enabled' : 'disabled'}`);
    console.log(`   - Health checks: ${this.config.enableHealthChecks ? 'enabled' : 'disabled'}`);
    console.log(`   - Alerts: ${this.config.enableAlerts ? 'enabled' : 'disabled'}`);
  }

  private startHealthCheckLoop(): void {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck().catch(error => {
        console.error('Health check error:', error);
      });
    }, this.config.healthCheckIntervalMs);
  }

  private async performHealthCheck(): Promise<void> {
    const checkStart = Date.now();
    const components: ComponentHealth[] = [];
    
    // Check Worker Pool
    if (this.config.enableWorkerThreads && this.workerPool) {
      const workerMetrics = this.workerPool.getMetrics();
      components.push({
        name: 'WorkerPool',
        status: workerMetrics.activeWorkers > 0 ? 'healthy' : 'degraded',
        lastCheck: Date.now(),
        latencyMs: 0,
        details: workerMetrics,
        consecutiveFailures: 0,
      });
    }
    
    // Check Persistence Batcher
    if (this.config.enableBatchPersistence && this.persistenceBatcher) {
      const batcherMetrics = this.persistenceBatcher.getMetrics();
      const pendingTotal = batcherMetrics.pendingBlocks + batcherMetrics.pendingConsensusRounds;
      components.push({
        name: 'PersistenceBatcher',
        status: batcherMetrics.totalErrors === 0 ? 'healthy' : 
                batcherMetrics.totalErrors < 5 ? 'degraded' : 'unhealthy',
        lastCheck: Date.now(),
        latencyMs: batcherMetrics.averageFlushDuration,
        details: batcherMetrics,
        consecutiveFailures: batcherMetrics.totalErrors,
      });
    }
    
    // Check Fee Engine
    if (this.config.enableAdaptiveFees && this.feeEngine) {
      const feeMetrics = this.feeEngine.getMetrics();
      components.push({
        name: 'AdaptiveFeeEngine',
        status: feeMetrics.congestionScore < 75 ? 'healthy' :
                feeMetrics.congestionScore < 90 ? 'degraded' : 'unhealthy',
        lastCheck: Date.now(),
        latencyMs: 0,
        details: feeMetrics,
        consecutiveFailures: 0,
      });
    }
    
    // Check Circuit Breaker
    if (this.config.enableCircuitBreaker && this.circuitBreaker) {
      const cbState = this.circuitBreaker.getState();
      components.push({
        name: 'CircuitBreaker',
        status: cbState.state === 'CLOSED' ? 'healthy' :
                cbState.state === 'HALF_OPEN' ? 'degraded' : 'unhealthy',
        lastCheck: Date.now(),
        latencyMs: 0,
        details: { ...cbState } as unknown as Record<string, unknown>,
        consecutiveFailures: cbState.failures,
      });
    }
    
    // Determine overall health
    const unhealthyCount = components.filter(c => c.status === 'unhealthy' || c.status === 'critical').length;
    const degradedCount = components.filter(c => c.status === 'degraded').length;
    
    let overall: HealthStatus = 'healthy';
    if (unhealthyCount > 0) overall = 'unhealthy';
    else if (degradedCount > 1) overall = 'degraded';
    
    this.systemHealth = {
      overall,
      components,
      uptime: (Date.now() - this.startTime) / 1000,
      lastFullCheck: Date.now(),
    };
    
    this.metrics.healthCheckLatency = Date.now() - checkStart;
    this.metrics.uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    
    // Emit health status
    this.emit('healthCheck', this.systemHealth);
    
    // Raise alerts if needed
    if (overall === 'unhealthy' && this.config.enableAlerts) {
      this.alertManager.raise('error', 'SystemHealth', 
        `System health degraded: ${unhealthyCount} unhealthy components`, 
        { components: components.filter(c => c.status === 'unhealthy').map(c => c.name) }
      );
    }
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastBlockTimestamp = Date.now();
    
    console.log('▶️ BlockchainOrchestrator: Starting block production');
    
    this.blockProductionInterval = setInterval(() => {
      this.produceBlockCycle().catch(error => {
        console.error('Block production error:', error);
        this.metrics.failedBlocks++;
      });
    }, this.config.blockTimeMs);
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    if (this.blockProductionInterval) {
      clearInterval(this.blockProductionInterval);
      this.blockProductionInterval = null;
    }
    
    console.log('⏹️ BlockchainOrchestrator: Stopped block production');
  }

  private async produceBlockCycle(): Promise<void> {
    const cycleStart = Date.now();
    const shardId = this.currentBlockHeight % this.config.shardCount;
    
    const executeBlock = async () => {
      const transactions = this.generateMockTransactions(shardId);
      
      const blockRequest: BlockProcessRequest = {
        blockHeight: this.currentBlockHeight,
        parentHash: this.generateParentHash(),
        shardId,
        transactions,
        proposerValidatorId: `validator-${Math.floor(Math.random() * this.config.validatorsPerShard)}`,
        epoch: this.currentEpoch,
        round: this.currentRound,
      };
      
      let blockResult;
      if (this.config.enableWorkerThreads && this.workerPool) {
        blockResult = await this.workerPool.processBlock(blockRequest);
      } else {
        blockResult = this.processBlockLocally(blockRequest);
      }
      
      if (blockResult.success) {
        // Update fee engine
        if (this.config.enableAdaptiveFees && this.feeEngine) {
          this.feeEngine.processBlock({
            blockHeight: this.currentBlockHeight,
            shardId,
            baseFee: BigInt('1000000000'),
            gasUsed: BigInt(blockResult.gasUsed),
            gasLimit: BigInt(30000000),
            timestamp: Date.now(),
          });
        }
        
        // Queue for persistence
        if (this.config.enableBatchPersistence && this.persistenceBatcher) {
          this.persistenceBatcher.addBlock({
            blockHash: blockResult.blockHash,
            blockHeight: blockResult.blockHeight,
            shardId: blockResult.shardId,
            parentHash: blockRequest.parentHash,
            stateRoot: blockResult.stateRoot,
            transactionsRoot: blockResult.transactionsRoot,
            receiptsRoot: blockResult.receiptsRoot,
            gasUsed: blockResult.gasUsed,
            gasLimit: 30000000,
            timestamp: new Date(),
            proposer: blockRequest.proposerValidatorId,
            signature: '0x' + '0'.repeat(128),
            transactionCount: transactions.length,
            size: 1024 + transactions.length * 256,
          });
        }
        
        this.metrics.blocksProduced++;
        this.blockProductionStats.successfulBlocks++;
        this.currentBlockHeight++;
        this.currentRound++;
        
        if (this.currentRound > 600) {
          this.currentRound = 1;
          this.currentEpoch++;
        }
      } else {
        this.blockProductionStats.failedBlocks++;
      }
      
      this.blockProductionStats.totalBlocks++;
      
      return blockResult;
    };
    
    try {
      // Use circuit breaker if enabled
      if (this.config.enableCircuitBreaker && this.circuitBreaker) {
        await this.circuitBreaker.execute(executeBlock);
      } else {
        await executeBlock();
      }
      
      // Update block time metrics
      const blockTime = Date.now() - cycleStart;
      this.updateBlockTimeMetrics(blockTime);
      
      this.emit('blockProduced', {
        blockHeight: this.currentBlockHeight - 1,
        shardId,
        blockTime,
        epoch: this.currentEpoch,
        round: this.currentRound,
      });
      
    } catch (error) {
      this.metrics.failedBlocks++;
      this.blockProductionStats.failedBlocks++;
      
      if (this.config.enableAlerts) {
        this.alertManager.raise('error', 'BlockProduction', 
          `Block production failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          { blockHeight: this.currentBlockHeight, shardId }
        );
      }
    }
  }

  private updateBlockTimeMetrics(blockTime: number): void {
    this.recentBlockTimes.push(blockTime);
    if (this.recentBlockTimes.length > 1000) {
      this.recentBlockTimes.shift();
    }
    
    // Calculate average
    this.metrics.averageBlockTime = 
      this.recentBlockTimes.reduce((a, b) => a + b, 0) / this.recentBlockTimes.length;
    
    // Calculate percentiles
    const sorted = [...this.recentBlockTimes].sort((a, b) => a - b);
    const len = sorted.length;
    
    this.metrics.blockTimeP50 = sorted[Math.floor(len * 0.50)] || 100;
    this.metrics.blockTimeP95 = sorted[Math.floor(len * 0.95)] || 100;
    this.metrics.blockTimeP99 = sorted[Math.floor(len * 0.99)] || 100;
    
    // Update production stats
    this.blockProductionStats.averageBlockTime = this.metrics.averageBlockTime;
    this.blockProductionStats.minBlockTime = Math.min(this.blockProductionStats.minBlockTime, blockTime);
    this.blockProductionStats.maxBlockTime = Math.max(this.blockProductionStats.maxBlockTime, blockTime);
    this.blockProductionStats.blockTimesP50 = this.metrics.blockTimeP50;
    this.blockProductionStats.blockTimesP95 = this.metrics.blockTimeP95;
    this.blockProductionStats.blockTimesP99 = this.metrics.blockTimeP99;
  }

  private generateMockTransactions(shardId: number): BlockProcessRequest['transactions'] {
    const count = Math.floor(Math.random() * 50) + 10;
    const transactions: BlockProcessRequest['transactions'] = [];
    
    for (let i = 0; i < count; i++) {
      transactions.push({
        hash: `th1${Array.from({length:52},()=>'abcdef0123456789'[Math.floor(Math.random()*16)]).join('')}`,
        from: `tb1${Array.from({length:42},()=>'abcdef0123456789'[Math.floor(Math.random()*16)]).join('')}`,
        to: `tb1${Array.from({length:42},()=>'abcdef0123456789'[Math.floor(Math.random()*16)]).join('')}`,
        value: (Math.random() * 100).toFixed(4),
        gasPrice: '1000000000',
        gasLimit: 21000 + Math.floor(Math.random() * 50000),
        nonce: Math.floor(Math.random() * 1000),
        shardId,
      });
    }
    
    return transactions;
  }

  private generateParentHash(): string {
    return `th1${Array.from({ length: 52 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('')}`;
  }

  private processBlockLocally(request: BlockProcessRequest): {
    blockHash: string;
    blockHeight: number;
    shardId: number;
    stateRoot: string;
    transactionsRoot: string;
    receiptsRoot: string;
    gasUsed: number;
    timestamp: number;
    success: boolean;
  } {
    const gasUsed = request.transactions.reduce((sum, tx) => sum + tx.gasLimit, 0);
    
    return {
      blockHash: this.generateParentHash(),
      blockHeight: request.blockHeight,
      shardId: request.shardId,
      stateRoot: this.generateParentHash(),
      transactionsRoot: this.generateParentHash(),
      receiptsRoot: this.generateParentHash(),
      gasUsed,
      timestamp: Date.now(),
      success: true,
    };
  }

  // ============================================================================
  // Public API Methods
  // ============================================================================

  getMetrics(): BlockchainMetrics {
    if (this.workerPool) {
      const poolMetrics = this.workerPool.getMetrics();
      this.metrics.activeWorkers = poolMetrics.activeWorkers;
    }
    
    if (this.persistenceBatcher) {
      const batcherMetrics = this.persistenceBatcher.getMetrics();
      this.metrics.pendingPersistence = 
        batcherMetrics.pendingBlocks + 
        batcherMetrics.pendingConsensusRounds +
        batcherMetrics.pendingCrossShardMessages;
    }
    
    if (this.feeEngine) {
      const feeMetrics = this.feeEngine.getMetrics();
      this.metrics.averageGasPrice = feeMetrics.globalBaseFee;
      this.metrics.networkCongestion = feeMetrics.congestionScore;
    }
    
    this.metrics.uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    
    return { ...this.metrics };
  }

  getBlockProductionStats(): BlockProductionStats {
    return { ...this.blockProductionStats };
  }

  getSystemHealth(): SystemHealth {
    return { ...this.systemHealth };
  }

  getCircuitBreakerState(): CircuitBreakerState | null {
    return this.circuitBreaker?.getState() || null;
  }

  getActiveAlerts(severity?: AlertSeverity): Alert[] {
    return this.alertManager.getActiveAlerts(severity);
  }

  getAlertStats(): { total: number; byPriority: Record<AlertSeverity, number>; unacknowledged: number } {
    return this.alertManager.getAlertStats();
  }

  acknowledgeAlert(alertId: string): boolean {
    return this.alertManager.acknowledge(alertId);
  }

  getDetailedStatus(): {
    orchestrator: BlockchainMetrics;
    workerPool: ReturnType<WorkerPool['getMetrics']> | null;
    persistenceBatcher: ReturnType<PersistenceBatcher['getMetrics']> | null;
    feeEngine: ReturnType<AdaptiveFeeEngine['getMetrics']> | null;
    systemHealth: SystemHealth;
    circuitBreaker: CircuitBreakerState | null;
    alertStats: ReturnType<AlertManager['getAlertStats']>;
  } {
    return {
      orchestrator: this.getMetrics(),
      workerPool: this.workerPool?.getMetrics() || null,
      persistenceBatcher: this.persistenceBatcher?.getMetrics() || null,
      feeEngine: this.feeEngine?.getMetrics() || null,
      systemHealth: this.systemHealth,
      circuitBreaker: this.circuitBreaker?.getState() || null,
      alertStats: this.alertManager.getAlertStats(),
    };
  }

  getCurrentBlockHeight(): number {
    return this.currentBlockHeight;
  }

  getCurrentEpoch(): number {
    return this.currentEpoch;
  }

  getConfig(): OrchestratorConfig {
    return { ...this.config };
  }

  async shutdown(): Promise<void> {
    console.log('🛑 BlockchainOrchestrator: Shutting down...');
    
    // Stop health checks
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    await this.stop();
    
    if (this.config.enableBatchPersistence) {
      await shutdownPersistenceBatcher();
    }
    
    if (this.config.enableWorkerThreads) {
      await shutdownWorkerPool();
    }
    
    console.log('✅ BlockchainOrchestrator: Shutdown complete');
  }
}

// ============================================================================
// Singleton Management
// ============================================================================

let orchestratorInstance: BlockchainOrchestrator | null = null;
let orchestratorInitialized = false;

export function getBlockchainOrchestrator(): BlockchainOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new BlockchainOrchestrator();
  }
  return orchestratorInstance;
}

export async function initializeBlockchainOrchestrator(
  config?: Partial<OrchestratorConfig>
): Promise<BlockchainOrchestrator> {
  if (!orchestratorInitialized) {
    if (orchestratorInstance) {
      console.log('🔄 BlockchainOrchestrator: Re-initializing with config...');
    }
    orchestratorInstance = new BlockchainOrchestrator(config);
    await orchestratorInstance.initialize();
    orchestratorInitialized = true;
    console.log('✅ BlockchainOrchestrator: Fully initialized');
  }
  return orchestratorInstance!;
}

export async function shutdownBlockchainOrchestrator(): Promise<void> {
  if (orchestratorInstance) {
    await orchestratorInstance.shutdown();
    orchestratorInstance = null;
    orchestratorInitialized = false;
  }
}

// Export types for external use
export type { 
  OrchestratorConfig, 
  BlockchainMetrics, 
  BlockProductionStats,
  SystemHealth,
  ComponentHealth,
  HealthStatus,
  Alert,
  AlertSeverity,
  CircuitBreakerState,
  CircuitState,
};
