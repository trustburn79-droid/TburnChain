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
};

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
}

export class BlockchainOrchestrator extends EventEmitter {
  private config: OrchestratorConfig;
  private workerPool: WorkerPool | null = null;
  private persistenceBatcher: PersistenceBatcher | null = null;
  private feeEngine: AdaptiveFeeEngine | null = null;
  
  private isRunning: boolean = false;
  private blockProductionInterval: NodeJS.Timeout | null = null;
  private currentBlockHeight: number = 1245678;
  private currentEpoch: number = 1;
  private currentRound: number = 1;
  
  private recentBlockTimes: number[] = [];
  private lastBlockTimestamp: number = 0;
  
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
  };

  constructor(config: Partial<OrchestratorConfig> = {}) {
    super();
    this.config = { ...DEFAULT_ORCHESTRATOR_CONFIG, ...config };
  }

  async initialize(): Promise<void> {
    console.log('🚀 BlockchainOrchestrator: Initializing enterprise-grade blockchain services...');
    
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
    
    if (this.config.enableBatchPersistence) {
      this.persistenceBatcher = initializePersistenceBatcher({
        flushIntervalMs: this.config.batchFlushIntervalMs,
        maxBufferSize: 50,
      });
      console.log('✅ Batch persistence system initialized');
    }
    
    if (this.config.enableAdaptiveFees) {
      this.feeEngine = initializeAdaptiveFeeEngine({}, this.config.shardCount);
      console.log('✅ Adaptive fee engine initialized');
    }
    
    console.log('🎯 BlockchainOrchestrator: All systems ready');
    console.log(`   - Shards: ${this.config.shardCount}`);
    console.log(`   - Validators: ${this.config.shardCount * this.config.validatorsPerShard}`);
    console.log(`   - Block time: ${this.config.blockTimeMs}ms`);
    console.log(`   - Worker threads: ${this.config.enableWorkerThreads ? 'enabled' : 'disabled'}`);
    console.log(`   - Batch persistence: ${this.config.enableBatchPersistence ? 'enabled' : 'disabled'}`);
    console.log(`   - Adaptive fees: ${this.config.enableAdaptiveFees ? 'enabled' : 'disabled'}`);
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastBlockTimestamp = Date.now();
    
    console.log('▶️ BlockchainOrchestrator: Starting block production');
    
    this.blockProductionInterval = setInterval(() => {
      this.produceBlockCycle().catch(error => {
        console.error('Block production error:', error);
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
    
    try {
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
        this.currentBlockHeight++;
        this.currentRound++;
        
        if (this.currentRound > 600) {
          this.currentRound = 1;
          this.currentEpoch++;
        }
      }
      
      const blockTime = Date.now() - cycleStart;
      this.recentBlockTimes.push(blockTime);
      if (this.recentBlockTimes.length > 100) {
        this.recentBlockTimes.shift();
      }
      
      this.metrics.averageBlockTime = 
        this.recentBlockTimes.reduce((a, b) => a + b, 0) / this.recentBlockTimes.length;
      
      this.emit('blockProduced', {
        blockHeight: this.currentBlockHeight - 1,
        shardId,
        blockTime,
        gasUsed: blockResult?.gasUsed || 0,
      });
      
    } catch (error) {
      console.error('Block cycle error:', error);
    }
  }

  private generateMockTransactions(shardId: number): BlockProcessRequest['transactions'] {
    const count = Math.floor(Math.random() * 50) + 10;
    const transactions: BlockProcessRequest['transactions'] = [];
    
    for (let i = 0; i < count; i++) {
      transactions.push({
        hash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
        from: `0x${Math.random().toString(16).slice(2, 42)}`,
        to: `0x${Math.random().toString(16).slice(2, 42)}`,
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
    return `0x${Array.from({ length: 64 }, () => 
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
    
    return { ...this.metrics };
  }

  getDetailedStatus(): {
    orchestrator: BlockchainMetrics;
    workerPool: ReturnType<WorkerPool['getMetrics']> | null;
    persistenceBatcher: ReturnType<PersistenceBatcher['getMetrics']> | null;
    feeEngine: ReturnType<AdaptiveFeeEngine['getMetrics']> | null;
  } {
    return {
      orchestrator: this.getMetrics(),
      workerPool: this.workerPool?.getMetrics() || null,
      persistenceBatcher: this.persistenceBatcher?.getMetrics() || null,
      feeEngine: this.feeEngine?.getMetrics() || null,
    };
  }

  getCurrentBlockHeight(): number {
    return this.currentBlockHeight;
  }

  getCurrentEpoch(): number {
    return this.currentEpoch;
  }

  async shutdown(): Promise<void> {
    console.log('🛑 BlockchainOrchestrator: Shutting down...');
    
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
    // If instance exists but wasn't properly initialized, recreate it
    if (orchestratorInstance) {
      console.log('🔄 BlockchainOrchestrator: Re-initializing with config...');
    }
    orchestratorInstance = new BlockchainOrchestrator(config);
    await orchestratorInstance.initialize();
    orchestratorInitialized = true;
    console.log('✅ BlockchainOrchestrator: Fully initialized');
  }
  return orchestratorInstance;
}

export async function shutdownBlockchainOrchestrator(): Promise<void> {
  if (orchestratorInstance) {
    await orchestratorInstance.shutdown();
    orchestratorInstance = null;
    orchestratorInitialized = false;
  }
}
