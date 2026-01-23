/**
 * TBURN Production Blockchain Orchestrator
 * Integrates all enterprise infrastructure components for mainnet operation
 * 
 * Components Integrated:
 * - Enterprise Transaction Validator
 * - Enterprise Mempool Service
 * - Enterprise State Store
 * - Enterprise P2P Network
 * - Enterprise Fork Choice Manager
 * - Enterprise Genesis Builder
 * - Enterprise BFT Engine (existing)
 * - Enterprise Block Engine (existing)
 * - Enterprise Shard Orchestrator (existing)
 * - Enterprise Cross-Shard Router (existing)
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';

// Import new infrastructure
import { 
  getEnterpriseTxValidator, 
  EnterpriseTxValidator,
  RawTransaction,
  ValidatedTransaction 
} from '../validation/enterprise-tx-validator';

import { 
  getEnterpriseMempoolService, 
  EnterpriseMempoolService,
  BatchResult 
} from '../mempool/enterprise-mempool';

import { 
  getEnterpriseStateStore, 
  EnterpriseStateStore,
  Block,
  BlockHeader,
  StoredTransaction,
  TransactionReceipt 
} from '../state/enterprise-state-store';

import { 
  getEnterpriseP2PNetwork, 
  EnterpriseP2PNetwork 
} from '../network/enterprise-p2p-network';

import { 
  getEnterpriseForkChoice, 
  EnterpriseForkChoice,
  BlockInfo 
} from '../consensus/enterprise-fork-choice';

import { 
  getEnterpriseGenesisBuilder,
  EnterpriseGenesisBuilder,
  GenesisBlock 
} from '../genesis/enterprise-genesis-builder';

// Import new enterprise components
import { EnterpriseExecutionEngine } from '../execution/enterprise-execution-engine';
import { EnterpriseSlashingManager } from '../slashing/enterprise-slashing-manager';
import { EnterpriseBlockProposalPipeline } from '../block/enterprise-block-proposal';
import { EnterpriseAttestationPool } from '../attestation/enterprise-attestation-pool';
import { EnterpriseStateSyncManager } from '../sync/enterprise-state-sync';
import { EnterpriseProductionBootstrap } from '../bootstrap/enterprise-production-bootstrap';

// Import persistence adapters
import {
  getStateStorageAdapter,
  getSyncPersistenceAdapter,
  getBootstrapPersistenceAdapter,
  getBlockPersistenceAdapter,
  getValidatorPersistenceAdapter,
} from '../persistence/drizzle-persistence-adapters';

// ============================================================================
// Configuration
// ============================================================================

export const ORCHESTRATOR_CONFIG = {
  // Operating Mode
  DEV_SAFE_MODE: process.env.DEV_SAFE_MODE !== 'false',
  NETWORK_TYPE: (process.env.NETWORK_TYPE || 'mainnet') as 'mainnet' | 'testnet' | 'devnet',
  
  // Block Production
  BLOCK_TIME_MS: 100,
  BLOCK_GAS_LIMIT: BigInt(30000000),
  MAX_TXS_PER_BLOCK: 1000,
  
  // Consensus
  VALIDATOR_COUNT: 125,
  FINALITY_THRESHOLD: 0.67,
  
  // Performance
  TARGET_TPS: 120000,
  MAX_PENDING_TXS: 100000,
  
  // Intervals
  METRICS_INTERVAL_MS: 5000,
  CLEANUP_INTERVAL_MS: 60000,
  SYNC_INTERVAL_MS: 10000,
  
  // Ports
  P2P_PORT: 30303,
  RPC_PORT: 8545,
  
  // Lifecycle
  GRACEFUL_SHUTDOWN_TIMEOUT_MS: 30000,
};

// ============================================================================
// Type Definitions
// ============================================================================

export type OrchestratorState = 'STOPPED' | 'INITIALIZING' | 'SYNCING' | 'RUNNING' | 'STOPPING';

export interface OrchestratorMetrics {
  state: OrchestratorState;
  uptime: number;
  blockHeight: number;
  finalizedHeight: number;
  pendingTxCount: number;
  tps: number;
  peersConnected: number;
  validatorsActive: number;
  memoryUsageMB: number;
  cpuUsagePercent: number;
}

export interface TransactionSubmissionResult {
  success: boolean;
  txHash?: string;
  error?: string;
  validationResult?: string;
}

export interface BlockProductionResult {
  success: boolean;
  block?: Block;
  error?: string;
  txCount: number;
  gasUsed: bigint;
}

export interface SyncStatus {
  isSyncing: boolean;
  currentBlock: number;
  highestBlock: number;
  startingBlock: number;
  syncProgress: number;
}

// ============================================================================
// Transaction Pipeline
// ============================================================================

class TransactionPipeline {
  private validator: EnterpriseTxValidator;
  private mempool: EnterpriseMempoolService;
  private throughput: number = 0;
  private lastCount: number = 0;
  private lastTime: number = Date.now();
  
  constructor(validator: EnterpriseTxValidator, mempool: EnterpriseMempoolService) {
    this.validator = validator;
    this.mempool = mempool;
  }
  
  async submit(tx: RawTransaction): Promise<TransactionSubmissionResult> {
    // 1. Validate
    const validation = await this.validator.validateTransaction(tx);
    
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error?.message,
        validationResult: validation.result
      };
    }
    
    // 2. Add to mempool
    const mempoolResult = this.mempool.add(validation.validated!);
    
    if (!mempoolResult.success) {
      this.validator.rejectTransaction(tx);
      return {
        success: false,
        error: mempoolResult.error,
        validationResult: 'MEMPOOL_REJECTED'
      };
    }
    
    return {
      success: true,
      txHash: tx.hash,
      validationResult: 'VALID'
    };
  }
  
  async submitBatch(transactions: RawTransaction[]): Promise<TransactionSubmissionResult[]> {
    return Promise.all(transactions.map(tx => this.submit(tx)));
  }
  
  selectForBlock(maxGas: bigint, maxCount: number): BatchResult {
    return this.mempool.selectForBlock(maxGas, maxCount);
  }
  
  confirmTransaction(txHash: string): void {
    const mempoolTx = this.mempool.get(txHash);
    if (mempoolTx) {
      this.validator.confirmTransaction(mempoolTx.tx);
      this.mempool.confirmTransaction(txHash);
    }
  }
  
  rejectTransaction(txHash: string): void {
    const mempoolTx = this.mempool.get(txHash);
    if (mempoolTx) {
      this.validator.rejectTransaction(mempoolTx.tx);
      this.mempool.rejectTransaction(txHash);
    }
  }
  
  updateThroughput(): number {
    const now = Date.now();
    const elapsed = (now - this.lastTime) / 1000;
    const current = this.mempool.getSize();
    
    this.throughput = Math.max(0, (this.lastCount - current) / elapsed);
    this.lastCount = current;
    this.lastTime = now;
    
    return this.throughput;
  }
  
  getThroughput(): number {
    return this.throughput;
  }
  
  getPendingCount(): number {
    return this.mempool.getSize();
  }
}

// ============================================================================
// Block Production Pipeline
// ============================================================================

class BlockProductionPipeline {
  private stateStore: EnterpriseStateStore;
  private forkChoice: EnterpriseForkChoice;
  private txPipeline: TransactionPipeline;
  private blockNumber: number = 0;
  
  constructor(
    stateStore: EnterpriseStateStore,
    forkChoice: EnterpriseForkChoice,
    txPipeline: TransactionPipeline
  ) {
    this.stateStore = stateStore;
    this.forkChoice = forkChoice;
    this.txPipeline = txPipeline;
  }
  
  async produceBlock(proposer: string): Promise<BlockProductionResult> {
    const now = Date.now();
    
    // Get parent block
    const head = this.forkChoice.getHead();
    const parentHash = head?.hash || 'bh1' + '0'.repeat(64);
    const parentNumber = head?.number ?? -1;
    
    // Select transactions from mempool
    const batch = this.txPipeline.selectForBlock(
      ORCHESTRATOR_CONFIG.BLOCK_GAS_LIMIT,
      ORCHESTRATOR_CONFIG.MAX_TXS_PER_BLOCK
    );
    
    // Create block header
    this.blockNumber = parentNumber + 1;
    const stateRoot = this.stateStore.getStateRoot();
    const txRoot = this.computeTxRoot(batch.transactions);
    
    // Compute deterministic block hash from all header fields
    const blockHash = this.computeBlockHash(
      parentHash, 
      this.blockNumber, 
      now,
      stateRoot,
      txRoot,
      proposer
    );
    
    const header: BlockHeader = {
      number: this.blockNumber,
      hash: blockHash,
      parentHash,
      stateRoot,
      transactionsRoot: txRoot,
      receiptsRoot: '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
      timestamp: now,
      proposer,
      shardId: 0,
      gasUsed: batch.totalGas.toString(),
      gasLimit: ORCHESTRATOR_CONFIG.BLOCK_GAS_LIMIT.toString(),
      extraData: ''
    };
    
    // Create stored transactions
    const storedTxs: StoredTransaction[] = batch.transactions.map((tx, index) => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      nonce: tx.nonce,
      gasLimit: tx.gasLimit,
      gasPrice: tx.gasPrice,
      data: tx.data,
      v: tx.signature.v,
      r: tx.signature.r,
      s: tx.signature.s,
      blockNumber: this.blockNumber,
      transactionIndex: index
    }));
    
    // Create block
    const block: Block = {
      header,
      transactions: storedTxs,
      uncles: [],
      signature: ''
    };
    
    // Store block
    await this.stateStore.putBlock(block);
    
    // Add to fork choice
    const blockInfo: BlockInfo = {
      hash: blockHash,
      parentHash,
      number: this.blockNumber,
      timestamp: now,
      proposer,
      difficulty: BigInt(1),
      totalDifficulty: BigInt(this.blockNumber + 1),
      stateRoot: header.stateRoot,
      transactionsRoot: header.transactionsRoot,
      attestations: [],
      isFinalized: false
    };
    
    this.forkChoice.addBlock(blockInfo);
    
    // Confirm transactions
    for (const tx of batch.transactions) {
      this.txPipeline.confirmTransaction(tx.hash);
      
      // Create receipt
      const receipt: TransactionReceipt = {
        transactionHash: tx.hash,
        transactionIndex: storedTxs.findIndex(t => t.hash === tx.hash),
        blockHash,
        blockNumber: this.blockNumber,
        from: tx.from,
        to: tx.to,
        cumulativeGasUsed: tx.gasUsed.toString(),
        gasUsed: tx.gasUsed.toString(),
        contractAddress: null,
        logs: [],
        status: 1,
        logsBloom: 'lb1' + '0'.repeat(512)
      };
      
      await this.stateStore.putReceipt(receipt);
    }
    
    return {
      success: true,
      block,
      txCount: batch.count,
      gasUsed: batch.totalGas
    };
  }
  
  private computeBlockHash(
    parentHash: string, 
    number: number, 
    timestamp: number,
    stateRoot: string,
    txRoot: string,
    proposer: string
  ): string {
    // Deterministic block hash - same inputs always produce same hash
    // This ensures consensus across all nodes
    const data = [
      parentHash,
      number.toString(),
      timestamp.toString(),
      stateRoot,
      txRoot,
      proposer,
      ORCHESTRATOR_CONFIG.BLOCK_GAS_LIMIT.toString()
    ].join(':');
    return 'bh1' + crypto.createHash('sha256').update(data).digest('hex');
  }
  
  private computeTxRoot(transactions: ValidatedTransaction[]): string {
    if (transactions.length === 0) {
      return '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421';
    }
    
    const data = transactions.map(tx => tx.hash).join('');
    return 'bh1' + crypto.createHash('sha256').update(data).digest('hex');
  }
  
  getBlockNumber(): number {
    return this.blockNumber;
  }
}

// ============================================================================
// Sync Manager
// ============================================================================

class SyncManager extends EventEmitter {
  private p2p: EnterpriseP2PNetwork;
  private stateStore: EnterpriseStateStore;
  private forkChoice: EnterpriseForkChoice;
  
  private isSyncing: boolean = false;
  private startingBlock: number = 0;
  private highestBlock: number = 0;
  
  constructor(
    p2p: EnterpriseP2PNetwork,
    stateStore: EnterpriseStateStore,
    forkChoice: EnterpriseForkChoice
  ) {
    super();
    this.p2p = p2p;
    this.stateStore = stateStore;
    this.forkChoice = forkChoice;
    
    // Listen for new blocks from peers
    this.p2p.on('block', ({ peerId, block }) => {
      this.handleNewBlock(peerId, block);
    });
  }
  
  async startSync(): Promise<void> {
    const localHead = this.stateStore.getLatestBlock();
    this.startingBlock = localHead?.number ?? 0;
    
    // Find highest block from peers
    const peers = this.p2p.getPeers();
    this.highestBlock = this.startingBlock;
    
    for (const peer of peers) {
      if (peer.bestBlockNumber > this.highestBlock) {
        this.highestBlock = peer.bestBlockNumber;
      }
    }
    
    if (this.highestBlock > this.startingBlock) {
      this.isSyncing = true;
      this.emit('syncStarted', { startingBlock: this.startingBlock, highestBlock: this.highestBlock });
      
      // Request blocks from peers
      await this.syncBlocks();
    }
  }
  
  private async syncBlocks(): Promise<void> {
    // Simplified sync - in production would use proper state sync
    console.log(`[Sync] Syncing from block ${this.startingBlock} to ${this.highestBlock}`);
    
    // Sync complete
    this.isSyncing = false;
    this.emit('syncComplete', { finalBlock: this.highestBlock });
  }
  
  private async handleNewBlock(peerId: string, block: any): Promise<void> {
    // Process incoming block
    console.log(`[Sync] Received block from peer ${peerId}`);
    
    // Update highest known block
    if (block.number > this.highestBlock) {
      this.highestBlock = block.number;
    }
  }
  
  getStatus(): SyncStatus {
    const currentBlock = this.forkChoice.getHead()?.number ?? 0;
    
    return {
      isSyncing: this.isSyncing,
      currentBlock,
      highestBlock: this.highestBlock,
      startingBlock: this.startingBlock,
      syncProgress: this.highestBlock > 0 
        ? Math.min(100, (currentBlock / this.highestBlock) * 100)
        : 100
    };
  }
}

// ============================================================================
// Production Blockchain Orchestrator
// ============================================================================

export class ProductionBlockchainOrchestrator extends EventEmitter {
  // Core Infrastructure components
  private txValidator: EnterpriseTxValidator;
  private mempool: EnterpriseMempoolService;
  private stateStore: EnterpriseStateStore;
  private p2pNetwork: EnterpriseP2PNetwork;
  private forkChoice: EnterpriseForkChoice;
  private genesisBuilder: EnterpriseGenesisBuilder;
  
  // Enterprise Components (v2.0)
  private executionEngine: EnterpriseExecutionEngine;
  private slashingManager: EnterpriseSlashingManager;
  private blockProposal: EnterpriseBlockProposalPipeline;
  private attestationPool: EnterpriseAttestationPool;
  private stateSync: EnterpriseStateSyncManager;
  private productionBootstrap: EnterpriseProductionBootstrap;
  
  // Pipelines
  private txPipeline: TransactionPipeline;
  private blockPipeline: BlockProductionPipeline;
  private syncManager: SyncManager;
  
  // State
  private state: OrchestratorState = 'STOPPED';
  private startTime: number = 0;
  private validatorId: string = '';
  private isValidator: boolean = false;
  
  // Timers
  private blockProductionInterval: NodeJS.Timeout | null = null;
  private metricsInterval: NodeJS.Timeout | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;
  
  // Metrics
  private metrics: OrchestratorMetrics;
  private tpsHistory: number[] = [];
  
  constructor() {
    super();
    
    // Get singleton instances for core infrastructure
    this.txValidator = getEnterpriseTxValidator();
    this.mempool = getEnterpriseMempoolService();
    this.stateStore = getEnterpriseStateStore();
    this.p2pNetwork = getEnterpriseP2PNetwork();
    this.forkChoice = getEnterpriseForkChoice();
    this.genesisBuilder = getEnterpriseGenesisBuilder();
    
    // Initialize enterprise components (v2.0)
    this.executionEngine = EnterpriseExecutionEngine.getInstance();
    this.slashingManager = EnterpriseSlashingManager.getInstance();
    this.blockProposal = EnterpriseBlockProposalPipeline.getInstance();
    this.attestationPool = EnterpriseAttestationPool.getInstance();
    this.stateSync = EnterpriseStateSyncManager.getInstance();
    this.productionBootstrap = EnterpriseProductionBootstrap.getInstance();
    
    // Initialize pipelines
    this.txPipeline = new TransactionPipeline(this.txValidator, this.mempool);
    this.blockPipeline = new BlockProductionPipeline(this.stateStore, this.forkChoice, this.txPipeline);
    this.syncManager = new SyncManager(this.p2pNetwork, this.stateStore, this.forkChoice);
    
    // Initialize metrics
    this.metrics = {
      state: 'STOPPED',
      uptime: 0,
      blockHeight: 0,
      finalizedHeight: 0,
      pendingTxCount: 0,
      tps: 0,
      peersConnected: 0,
      validatorsActive: 0,
      memoryUsageMB: 0,
      cpuUsagePercent: 0
    };
    
    // Set up event handlers
    this.setupEventHandlers();
    
    console.log('[Orchestrator] ✅ Enterprise components v2.0 integrated');
  }
  
  // ==================== Lifecycle ====================
  
  async start(options: { validatorId?: string; validatorKey?: string } = {}): Promise<void> {
    if (this.state !== 'STOPPED') {
      throw new Error(`Cannot start from state: ${this.state}`);
    }
    
    console.log('[Orchestrator] Starting Production Blockchain Orchestrator v2.0...');
    console.log(`[Orchestrator] Network: ${ORCHESTRATOR_CONFIG.NETWORK_TYPE}`);
    console.log(`[Orchestrator] DEV_SAFE_MODE: ${ORCHESTRATOR_CONFIG.DEV_SAFE_MODE}`);
    console.log(`[Orchestrator] Target TPS: ${ORCHESTRATOR_CONFIG.TARGET_TPS}`);
    
    this.state = 'INITIALIZING';
    this.startTime = Date.now();
    this.emit('stateChanged', this.state);
    
    try {
      // Phase 1: Core Infrastructure (async batched for reduced event loop blocking)
      console.log('[Orchestrator] Phase 1: Initializing core infrastructure...');
      await this.initializeCoreInfrastructureAsync();
      
      // Phase 2: Enterprise Components (async initialization)
      console.log('[Orchestrator] Phase 2: Initializing enterprise components...');
      await this.initializeEnterpriseComponentsAsync();
      
      // 5. Initialize genesis if needed
      const latestBlock = this.stateStore.getLatestBlock();
      if (!latestBlock) {
        console.log('[Orchestrator] No blocks found, initializing genesis...');
        await this.initializeGenesis();
      } else {
        console.log(`[Orchestrator] Resuming from block #${latestBlock.number}`);
        
        // Re-initialize fork choice with existing chain
        const genesisBlock: BlockInfo = {
          hash: 'bh1' + '0'.repeat(64),
          parentHash: 'bh1' + '0'.repeat(64),
          number: 0,
          timestamp: 0,
          proposer: '',
          difficulty: BigInt(1),
          totalDifficulty: BigInt(1),
          stateRoot: '',
          transactionsRoot: '',
          attestations: [],
          isFinalized: true
        };
        this.forkChoice.initializeGenesis(genesisBlock);
      }
      
      // 6. Start P2P network (skip in DEV_SAFE_MODE)
      if (!ORCHESTRATOR_CONFIG.DEV_SAFE_MODE) {
        console.log('[Orchestrator] Starting P2P network...');
        await this.p2pNetwork.start(ORCHESTRATOR_CONFIG.P2P_PORT);
        
        // 7. Start sync
        this.state = 'SYNCING';
        this.emit('stateChanged', this.state);
        await this.syncManager.startSync();
      }
      
      // 8. Configure validator if provided
      if (options.validatorId) {
        this.validatorId = options.validatorId;
        this.isValidator = true;
        console.log(`[Orchestrator] Running as validator: ${this.validatorId}`);
      }
      
      // 9. Start block production (if validator or DEV_SAFE_MODE)
      if (this.isValidator || ORCHESTRATOR_CONFIG.DEV_SAFE_MODE) {
        this.startBlockProduction();
      }
      
      // 10. Start metrics collection
      this.startMetrics();
      
      // 11. Start cleanup
      this.startCleanup();
      
      this.state = 'RUNNING';
      this.emit('stateChanged', this.state);
      this.emit('started');
      
      console.log('[Orchestrator] Production Blockchain Orchestrator started successfully');
      console.log(`[Orchestrator] Block height: ${this.blockPipeline.getBlockNumber()}`);
      console.log(`[Orchestrator] P2P peers: ${this.p2pNetwork.getPeerCount()}`);
      
    } catch (error) {
      console.error('[Orchestrator] Failed to start:', error);
      this.state = 'STOPPED';
      throw error;
    }
  }
  
  async stop(): Promise<void> {
    if (this.state === 'STOPPED') return;
    
    console.log('[Orchestrator] Stopping Production Blockchain Orchestrator...');
    this.state = 'STOPPING';
    this.emit('stateChanged', this.state);
    
    // Stop intervals
    if (this.blockProductionInterval) {
      clearInterval(this.blockProductionInterval);
      this.blockProductionInterval = null;
    }
    
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    // Stop components in reverse order
    await this.p2pNetwork.stop();
    await this.forkChoice.stop();
    await this.mempool.stop();
    await this.txValidator.stop();
    await this.stateStore.close();
    
    this.state = 'STOPPED';
    this.emit('stateChanged', this.state);
    this.emit('stopped');
    
    console.log('[Orchestrator] Production Blockchain Orchestrator stopped');
  }
  
  // ==================== Async Initialization ====================
  
  /**
   * Initialize core infrastructure asynchronously with yielding to event loop
   * Reduces startup blocking for better responsiveness
   */
  private async initializeCoreInfrastructureAsync(): Promise<void> {
    // Batch initialization with micro-yields to reduce event loop blocking
    await this.yieldToEventLoop();
    console.log('[Orchestrator] Initializing state store...');
    await this.stateStore.initialize();
    
    await this.yieldToEventLoop();
    console.log('[Orchestrator] Starting transaction validator...');
    await this.txValidator.start();
    
    await this.yieldToEventLoop();
    console.log('[Orchestrator] Starting mempool...');
    await this.mempool.start();
    
    await this.yieldToEventLoop();
    console.log('[Orchestrator] Starting fork choice manager...');
    await this.forkChoice.start();
    
    console.log('[Orchestrator] ✅ Core infrastructure initialized');
  }
  
  /**
   * Initialize enterprise components asynchronously
   */
  private async initializeEnterpriseComponentsAsync(): Promise<void> {
    await this.yieldToEventLoop();
    console.log('[Orchestrator] Initializing execution engine...');
    await this.executionEngine.initialize();
    
    await this.yieldToEventLoop();
    console.log('[Orchestrator] Initializing slashing manager...');
    await this.slashingManager.initialize();
    
    await this.yieldToEventLoop();
    console.log('[Orchestrator] Initializing block proposal pipeline...');
    await this.blockProposal.initialize();
    
    await this.yieldToEventLoop();
    console.log('[Orchestrator] Initializing attestation pool...');
    await this.attestationPool.initialize();
    
    await this.yieldToEventLoop();
    console.log('[Orchestrator] Initializing state sync...');
    await this.stateSync.initialize();
    
    await this.yieldToEventLoop();
    console.log('[Orchestrator] Initializing production bootstrap...');
    await this.productionBootstrap.initialize();
    
    console.log('[Orchestrator] ✅ Enterprise components v2.0 initialized');
  }
  
  /**
   * Yield to event loop to prevent blocking
   */
  private yieldToEventLoop(): Promise<void> {
    return new Promise(resolve => setImmediate(resolve));
  }
  
  // ==================== Genesis ====================
  
  private async initializeGenesis(): Promise<void> {
    // Add token allocation
    this.genesisBuilder.addTokenAllocation();
    
    // Add system contracts
    this.genesisBuilder.addSystemContracts();
    
    // Add validators
    this.genesisBuilder.addValidators(ORCHESTRATOR_CONFIG.VALIDATOR_COUNT);
    
    // Build genesis
    const genesis = this.genesisBuilder.build();
    
    // Store genesis block
    const genesisBlock: Block = {
      header: {
        number: 0,
        hash: genesis.hash,
        parentHash: genesis.parentHash,
        stateRoot: genesis.stateRoot,
        transactionsRoot: genesis.transactionsRoot,
        receiptsRoot: genesis.receiptsRoot,
        timestamp: genesis.timestamp * 1000,
        proposer: genesis.coinbase,
        shardId: 0,
        gasUsed: genesis.gasUsed,
        gasLimit: genesis.gasLimit,
        extraData: genesis.extraData
      },
      transactions: [],
      uncles: [],
      signature: ''
    };
    
    await this.stateStore.putBlock(genesisBlock);
    
    // Initialize fork choice with genesis
    const genesisInfo: BlockInfo = {
      hash: genesis.hash,
      parentHash: genesis.parentHash,
      number: 0,
      timestamp: genesis.timestamp,
      proposer: genesis.coinbase,
      difficulty: BigInt(genesis.difficulty),
      totalDifficulty: BigInt(genesis.difficulty),
      stateRoot: genesis.stateRoot,
      transactionsRoot: genesis.transactionsRoot,
      attestations: [],
      isFinalized: true
    };
    
    this.forkChoice.initializeGenesis(genesisInfo);
    this.forkChoice.setValidatorSet(genesis.validators.map(v => v.id));
    
    // Initialize account states
    for (const [address, alloc] of Object.entries(genesis.alloc)) {
      await this.stateStore.putAccount({
        address,
        balance: alloc.balance,
        nonce: parseInt(alloc.nonce || '0', 16),
        codeHash: alloc.code ? crypto.createHash('sha256').update(alloc.code).digest('hex') : '',
        storageRoot: ''
      });
      
      // Set in validator too
      this.txValidator.setAccountState(
        address,
        BigInt(alloc.balance),
        parseInt(alloc.nonce || '0', 16)
      );
    }
    
    console.log(`[Orchestrator] Genesis initialized: ${genesis.hash}`);
    console.log(`[Orchestrator] Total accounts: ${Object.keys(genesis.alloc).length}`);
    console.log(`[Orchestrator] Validators: ${genesis.validators.length}`);
  }
  
  // ==================== Block Production ====================
  
  private startBlockProduction(): void {
    console.log(`[Orchestrator] Starting block production (interval: ${ORCHESTRATOR_CONFIG.BLOCK_TIME_MS}ms)`);
    
    this.blockProductionInterval = setInterval(async () => {
      if (this.state !== 'RUNNING') return;
      
      try {
        const result = await this.blockPipeline.produceBlock(this.validatorId || 'dev-validator');
        
        if (result.success && result.block) {
          // Broadcast block
          if (!ORCHESTRATOR_CONFIG.DEV_SAFE_MODE) {
            this.p2pNetwork.broadcastBlock(result.block);
          }
          
          this.emit('blockProduced', {
            number: result.block.header.number,
            hash: result.block.header.hash,
            txCount: result.txCount,
            gasUsed: result.gasUsed.toString()
          });
        }
      } catch (error) {
        console.error('[Orchestrator] Block production error:', error);
      }
    }, ORCHESTRATOR_CONFIG.BLOCK_TIME_MS);
  }
  
  // ==================== Metrics ====================
  
  private startMetrics(): void {
    this.metricsInterval = setInterval(() => {
      this.updateMetrics();
    }, ORCHESTRATOR_CONFIG.METRICS_INTERVAL_MS);
  }
  
  private updateMetrics(): void {
    const memUsage = process.memoryUsage();
    const head = this.forkChoice.getHead();
    const finalized = this.forkChoice.getFinalizedBlock();
    
    // Update TPS
    const currentTps = this.txPipeline.updateThroughput();
    this.tpsHistory.push(currentTps);
    if (this.tpsHistory.length > 100) {
      this.tpsHistory.shift();
    }
    
    this.metrics = {
      state: this.state,
      uptime: Date.now() - this.startTime,
      blockHeight: head?.number ?? 0,
      finalizedHeight: finalized?.number ?? 0,
      pendingTxCount: this.txPipeline.getPendingCount(),
      tps: this.tpsHistory.length > 0 
        ? this.tpsHistory.reduce((a, b) => a + b, 0) / this.tpsHistory.length
        : 0,
      peersConnected: this.p2pNetwork.getConnectedPeerCount(),
      validatorsActive: ORCHESTRATOR_CONFIG.VALIDATOR_COUNT,
      memoryUsageMB: Math.round(memUsage.heapUsed / 1024 / 1024),
      cpuUsagePercent: 0 // Would need actual CPU measurement
    };
    
    this.emit('metrics', this.metrics);
  }
  
  // ==================== Cleanup ====================
  
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      // Cleanup will be handled by individual components
    }, ORCHESTRATOR_CONFIG.CLEANUP_INTERVAL_MS);
  }
  
  // ==================== Event Handlers ====================
  
  private setupEventHandlers(): void {
    // P2P events
    this.p2pNetwork.on('transaction', ({ peerId, tx }) => {
      this.handleIncomingTransaction(tx);
    });
    
    this.p2pNetwork.on('block', ({ peerId, block }) => {
      this.handleIncomingBlock(block);
    });
    
    this.p2pNetwork.on('vote', ({ peerId, vote }) => {
      this.handleIncomingVote(vote);
    });
    
    // Fork choice events
    this.forkChoice.on('blockFinalized', (block) => {
      console.log(`[Orchestrator] Block #${block.number} finalized`);
      this.emit('blockFinalized', block);
    });
    
    this.forkChoice.on('reorg', (result) => {
      console.log(`[Orchestrator] Chain reorg: depth=${result.reorgDepth}`);
      this.emit('reorg', result);
    });
    
    // Sync events
    this.syncManager.on('syncComplete', () => {
      console.log('[Orchestrator] Sync complete');
    });
  }
  
  private async handleIncomingTransaction(tx: any): Promise<void> {
    try {
      await this.txPipeline.submit(tx);
    } catch (error) {
      console.error('[Orchestrator] Failed to process incoming transaction:', error);
    }
  }
  
  private async handleIncomingBlock(block: any): Promise<void> {
    // Process incoming block from peer
    console.log(`[Orchestrator] Processing incoming block #${block.header?.number}`);
  }
  
  private handleIncomingVote(vote: any): void {
    // Process consensus vote
    this.forkChoice.addAttestation({
      blockHash: vote.blockHash,
      blockNumber: vote.blockNumber,
      validatorId: vote.validatorId,
      signature: vote.signature,
      timestamp: Date.now()
    });
  }
  
  // ==================== Public API ====================
  
  async submitTransaction(tx: RawTransaction): Promise<TransactionSubmissionResult> {
    if (this.state !== 'RUNNING') {
      return { success: false, error: 'Orchestrator not running' };
    }
    
    const result = await this.txPipeline.submit(tx);
    
    // Broadcast to network
    if (result.success && !ORCHESTRATOR_CONFIG.DEV_SAFE_MODE) {
      this.p2pNetwork.broadcastTransaction(tx);
    }
    
    return result;
  }
  
  async getBlock(numberOrHash: number | string): Promise<Block | null> {
    if (typeof numberOrHash === 'number') {
      return this.stateStore.getBlock(numberOrHash);
    } else {
      return this.stateStore.getBlockByHash(numberOrHash);
    }
  }
  
  async getTransaction(hash: string): Promise<StoredTransaction | null> {
    return this.stateStore.getTransaction(hash);
  }
  
  async getReceipt(hash: string): Promise<TransactionReceipt | null> {
    return this.stateStore.getReceipt(hash);
  }
  
  async getBalance(address: string): Promise<bigint> {
    return this.stateStore.getBalance(address);
  }
  
  async getNonce(address: string): Promise<number> {
    return this.stateStore.getNonce(address);
  }
  
  getMetrics(): OrchestratorMetrics {
    return { ...this.metrics };
  }
  
  getSyncStatus(): SyncStatus {
    return this.syncManager.getStatus();
  }
  
  getState(): OrchestratorState {
    return this.state;
  }
  
  getChainInfo(): {
    chainId: number;
    networkType: string;
    blockHeight: number;
    finalizedHeight: number;
    validators: number;
    devMode: boolean;
  } {
    const head = this.forkChoice.getHead();
    const finalized = this.forkChoice.getFinalizedBlock();
    
    return {
      chainId: 5800,
      networkType: ORCHESTRATOR_CONFIG.NETWORK_TYPE,
      blockHeight: head?.number ?? 0,
      finalizedHeight: finalized?.number ?? 0,
      validators: ORCHESTRATOR_CONFIG.VALIDATOR_COUNT,
      devMode: ORCHESTRATOR_CONFIG.DEV_SAFE_MODE
    };
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

let orchestratorInstance: ProductionBlockchainOrchestrator | null = null;

export function getProductionBlockchainOrchestrator(): ProductionBlockchainOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new ProductionBlockchainOrchestrator();
  }
  return orchestratorInstance;
}

export async function initializeProductionBlockchain(options?: {
  validatorId?: string;
  validatorKey?: string;
}): Promise<ProductionBlockchainOrchestrator> {
  const orchestrator = getProductionBlockchainOrchestrator();
  await orchestrator.start(options);
  return orchestrator;
}
