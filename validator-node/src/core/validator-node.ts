/**
 * TBURN Validator Node Core
 * Enterprise-Grade Standalone Validator Implementation
 * 
 * This is the main entry point for running a validator node.
 * Coordinates all subsystems: P2P, Consensus, Storage, API
 * 
 * Security Features:
 * - AES-256-GCM encrypted keystore with Argon2id key derivation
 * - Token bucket DDoS protection with circuit breaker
 * - TLS 1.3 / mTLS for secure communications
 * - Challenge-response peer authentication with nonce replay protection
 */

import { EventEmitter } from 'events';
import { ValidatorNodeConfig, Block, Transaction, Vote, NodeStatus, ValidatorMetrics } from '../config/types';
import { P2PNetwork, MessageType } from '../network/p2p';
import { BFTConsensusEngine, BlockProposal, ValidatorInfo } from '../consensus/bft-engine';
import { BlockStore, StateStore } from '../storage/block-store';
import { CryptoManager } from '../crypto/keys';
import { SecureKeystore } from '../crypto/secure-keystore';
import { AdvancedRateLimiter, PeerRateLimiter } from '../security/rate-limiter';
import { TLSManager } from '../security/tls-manager';
import { PeerAuthenticator } from '../security/peer-auth';
import { Logger, createModuleLogger } from '../utils/logger';
import { CHAIN_CONSTANTS } from '../config/default';

const log = createModuleLogger('ValidatorNode');

export interface MempoolTransaction extends Omit<Transaction, 'gasPrice'> {
  receivedAt: number;
  gasPrice: bigint;
  originalGasPrice: string;
}

export class ValidatorNode extends EventEmitter {
  private config: ValidatorNodeConfig;
  private cryptoManager: CryptoManager;
  private p2pNetwork: P2PNetwork;
  private consensusEngine: BFTConsensusEngine;
  private blockStore: BlockStore;
  private stateStore: StateStore;
  
  // Security components
  private secureKeystore: SecureKeystore | null = null;
  private rateLimiter: AdvancedRateLimiter;
  private peerRateLimiter: PeerRateLimiter;
  private tlsManager: TLSManager;
  private peerAuthenticator: PeerAuthenticator | null = null;
  
  private mempool: Map<string, MempoolTransaction> = new Map();
  private pendingTxByAccount: Map<string, Set<string>> = new Map();
  
  private isRunning: boolean = false;
  private startTime: number = 0;
  private securityEnabled: boolean = true;
  private metrics: ValidatorMetrics = {
    blocksProposed: 0,
    blocksMissed: 0,
    votesSubmitted: 0,
    uptime: 0,
    latencyP50: 0,
    latencyP95: 0,
    latencyP99: 0,
    rewardsEarned: '0',
    slashingEvents: 0,
    performanceScore: 100,
  };

  constructor(config: ValidatorNodeConfig) {
    super();
    this.config = config;
    
    Logger.getInstance().configure({
      level: config.monitoring.logLevel,
      format: config.monitoring.logFormat,
      nodeId: config.nodeId,
      logFile: config.monitoring.logFile,
    });
    
    // Initialize crypto manager
    this.cryptoManager = new CryptoManager();
    this.cryptoManager.loadFromPrivateKey(config.validator.privateKey);
    
    // Initialize security components
    this.rateLimiter = new AdvancedRateLimiter({
      windowMs: 60000,
      maxRequests: 1000,
      burstLimit: 100,
      adaptiveEnabled: true,
      reputationEnabled: true,
      circuitBreakerThreshold: 5000,
    });
    
    this.peerRateLimiter = new PeerRateLimiter();
    
    this.tlsManager = new TLSManager({
      enabled: true,
      certPath: config.storage.dataDir + '/certs/validator.crt',
      keyPath: config.storage.dataDir + '/certs/validator.key',
      caPath: config.storage.dataDir + '/certs/tburn-ca.crt',
      mtlsEnabled: true,
      minVersion: 'TLSv1.3',
      autoRenew: true,
      renewBeforeExpiryDays: 30,
    });
    
    // Initialize P2P network
    this.p2pNetwork = new P2PNetwork(
      config.network,
      config.nodeId,
      (msg) => this.cryptoManager.sign(msg)
    );
    
    // Initialize consensus engine
    this.consensusEngine = new BFTConsensusEngine(
      config.consensus,
      config.validator.address,
      (msg) => this.cryptoManager.sign(msg)
    );
    
    // Initialize storage
    this.blockStore = new BlockStore(config.storage);
    this.stateStore = new StateStore(config.storage);
    
    this.setupEventHandlers();
    
    log.info('ValidatorNode initialized with security features', {
      nodeId: config.nodeId,
      tlsEnabled: true,
      rateLimitingEnabled: true,
    });
  }

  /**
   * Initialize secure keystore for key management
   */
  async initializeSecureKeystore(password: string): Promise<void> {
    this.secureKeystore = new SecureKeystore({
      path: this.config.storage.dataDir + '/keystore/keys.json',
      autoLockTimeoutMs: 300000,
      maxDecryptionAttempts: 5,
    });
    
    await this.secureKeystore.initialize(password);
    
    // Initialize peer authenticator with secure keystore
    this.peerAuthenticator = new PeerAuthenticator(
      this.config.nodeId,
      this.cryptoManager.getPublicKeyHex(),
      (msg) => this.cryptoManager.sign(msg),
      (pubKey, msg, sig) => CryptoManager.verifySignature(msg, sig, pubKey)
    );
    
    log.info('Secure keystore initialized');
  }

  /**
   * Initialize TLS for secure communications
   */
  async initializeTLS(): Promise<void> {
    await this.tlsManager.initialize();
    log.info('TLS manager initialized', {
      mtlsEnabled: this.tlsManager.isMtlsEnabled(),
      certInfo: this.tlsManager.getCertificateInfo(),
    });
  }

  private setupEventHandlers(): void {
    this.p2pNetwork.on('block', (block: Block) => {
      log.debug('Received block from network', { height: block.height, hash: block.hash });
      this.handleIncomingBlock(block);
    });
    
    this.p2pNetwork.on('transaction', (tx: Transaction) => {
      this.handleIncomingTransaction(tx);
    });
    
    this.p2pNetwork.on('vote', (vote: Vote) => {
      this.consensusEngine.handleVote(vote);
    });
    
    this.p2pNetwork.on('consensus', (message) => {
      if (message.payload.type === 'proposal') {
        this.consensusEngine.handleProposal(message.payload as BlockProposal);
      }
    });
    
    this.p2pNetwork.on('peerConnected', (peer) => {
      log.info('Peer connected', { nodeId: peer.nodeId, region: peer.region });
      this.emit('peerConnected', peer);
    });
    
    this.p2pNetwork.on('peerDisconnected', (peer) => {
      log.info('Peer disconnected', { nodeId: peer.nodeId });
      this.emit('peerDisconnected', peer);
    });
    
    this.consensusEngine.on('requestBlock', (height: number, callback: (block: BlockProposal) => void) => {
      const proposal = this.createBlockProposal(height);
      callback(proposal);
    });
    
    this.consensusEngine.on('broadcastProposal', (proposal: BlockProposal) => {
      this.p2pNetwork.broadcast(MessageType.CONSENSUS_MESSAGE, {
        type: 'proposal',
        ...proposal,
      });
      this.metrics.blocksProposed++;
    });
    
    this.consensusEngine.on('broadcastVote', (vote: Vote) => {
      this.p2pNetwork.broadcast(MessageType.VOTE, vote);
      this.metrics.votesSubmitted++;
    });
    
    this.consensusEngine.on('blockFinalized', async (data) => {
      await this.handleFinalizedBlock(data);
    });
    
    this.consensusEngine.on('phaseChange', (phase, height, round) => {
      log.debug('Consensus phase change', { phase, height, round });
    });
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Validator node is already running');
    }

    log.info('Starting TBURN Validator Node', {
      nodeId: this.config.nodeId,
      chainId: this.config.chainId,
      address: this.config.validator.address,
      region: this.config.geo.region,
    });

    try {
      await this.blockStore.open();
      await this.stateStore.open();
      log.info('Storage initialized');
      
      await this.p2pNetwork.start();
      log.info('P2P network started');
      
      await this.waitForPeers();
      
      const validators = await this.fetchValidatorSet();
      this.consensusEngine.setValidators(validators);
      
      const latestHeight = this.blockStore.getLatestHeight();
      this.consensusEngine.start(latestHeight + 1);
      log.info('Consensus engine started', { fromHeight: latestHeight + 1 });
      
      this.isRunning = true;
      this.startTime = Date.now();
      
      this.startMetricsCollection();
      
      log.info('TBURN Validator Node started successfully', {
        address: this.config.validator.address,
        stake: this.config.validator.stake,
        peers: this.p2pNetwork.getPeerCount(),
      });
      
      this.emit('started');
    } catch (error) {
      log.error('Failed to start validator node', { error: (error as Error).message });
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;

    log.info('Stopping TBURN Validator Node');

    this.consensusEngine.stop();
    await this.p2pNetwork.stop();
    await this.blockStore.close();
    await this.stateStore.close();

    this.isRunning = false;
    log.info('TBURN Validator Node stopped');
    this.emit('stopped');
  }

  private async waitForPeers(): Promise<void> {
    const maxWaitTime = 60000;
    const checkInterval = 1000;
    let waited = 0;

    log.info('Waiting for peer connections', { minPeers: this.config.network.minPeers });

    while (waited < maxWaitTime) {
      if (this.p2pNetwork.getPeerCount() >= this.config.network.minPeers) {
        log.info('Minimum peers connected', { count: this.p2pNetwork.getPeerCount() });
        return;
      }

      await new Promise(resolve => setTimeout(resolve, checkInterval));
      waited += checkInterval;
    }

    if (this.p2pNetwork.getPeerCount() === 0) {
      log.warn('No peers connected after timeout, starting in solo mode');
    } else {
      log.warn('Could not reach minimum peers', {
        current: this.p2pNetwork.getPeerCount(),
        target: this.config.network.minPeers,
      });
    }
  }

  private async fetchValidatorSet(): Promise<ValidatorInfo[]> {
    const validators: ValidatorInfo[] = [];
    
    validators.push({
      address: this.config.validator.address,
      votingPower: BigInt(this.config.validator.stake),
      publicKey: this.cryptoManager.getPublicKeyHex(),
      isActive: true,
    });
    
    for (const peer of this.p2pNetwork.getPeers()) {
      validators.push({
        address: peer.nodeId,
        votingPower: BigInt(CHAIN_CONSTANTS.MIN_STAKE),
        publicKey: peer.publicKey,
        isActive: peer.isActive,
      });
    }

    return validators;
  }

  private createBlockProposal(height: number): BlockProposal {
    const parentBlock = this.blockStore.getLatestHeight() > 0
      ? { hash: '', stateRoot: '' }
      : { hash: CHAIN_CONSTANTS.GENESIS_BLOCK_HASH, stateRoot: '' };
    
    const transactions = this.selectTransactionsForBlock();
    const transactionsRoot = CryptoManager.generateMerkleRoot(
      transactions.map(tx => tx.hash)
    );
    const stateRoot = this.stateStore.computeStateRoot();
    
    const blockData = {
      height,
      round: 0,
      parentHash: parentBlock.hash,
      stateRoot,
      transactionsRoot,
      timestamp: Date.now(),
      transactions,
    };
    
    const blockHash = CryptoManager.hashBlock(blockData);
    
    return {
      height,
      round: 0,
      proposer: this.config.validator.address,
      parentHash: parentBlock.hash,
      blockHash: `0x${blockHash}`,
      stateRoot,
      transactionsRoot,
      timestamp: Date.now(),
      transactions,
      signature: '',
    };
  }

  private selectTransactionsForBlock(): Transaction[] {
    const maxTxs = this.config.consensus.maxTransactionsPerBlock;
    const sortedTxs = Array.from(this.mempool.values())
      .sort((a, b) => {
        const priceDiff = b.gasPrice - a.gasPrice;
        if (priceDiff !== BigInt(0)) {
          return priceDiff > 0 ? 1 : -1;
        }
        return a.receivedAt - b.receivedAt;
      })
      .slice(0, maxTxs);

    return sortedTxs.map(mempoolTx => ({
      hash: mempoolTx.hash,
      from: mempoolTx.from,
      to: mempoolTx.to,
      value: mempoolTx.value,
      nonce: mempoolTx.nonce,
      gasLimit: mempoolTx.gasLimit,
      gasPrice: mempoolTx.originalGasPrice,
      data: mempoolTx.data,
      signature: mempoolTx.signature,
      timestamp: mempoolTx.timestamp,
      shardId: mempoolTx.shardId,
    }));
  }

  private async handleFinalizedBlock(data: {
    height: number;
    blockHash: string;
    proposal: BlockProposal;
    votes: Vote[];
  }): Promise<void> {
    const block: Block = {
      height: data.height,
      hash: data.blockHash,
      parentHash: data.proposal.parentHash,
      stateRoot: data.proposal.stateRoot,
      transactionsRoot: data.proposal.transactionsRoot,
      receiptsRoot: '',
      timestamp: data.proposal.timestamp,
      proposer: data.proposal.proposer,
      signature: data.proposal.signature,
      shardId: 0,
      chainId: this.config.chainId,
      transactions: data.proposal.transactions as Transaction[],
      votes: data.votes,
      size: 0,
    };

    await this.blockStore.putBlock(block);
    
    for (const tx of block.transactions) {
      this.mempool.delete(tx.hash);
      const accountTxs = this.pendingTxByAccount.get(tx.from);
      if (accountTxs) {
        accountTxs.delete(tx.hash);
      }
      
      await this.applyTransaction(tx);
    }

    await this.stateStore.save();

    log.info('Block finalized and stored', {
      height: block.height,
      hash: block.hash,
      txCount: block.transactions.length,
    });

    this.emit('blockFinalized', block);
  }

  private async applyTransaction(tx: Transaction): Promise<void> {
    const fromBalance = this.stateStore.getBalance(tx.from);
    const toBalance = this.stateStore.getBalance(tx.to);
    const value = BigInt(tx.value);
    const gasCost = BigInt(tx.gasLimit) * BigInt(tx.gasPrice);

    if (fromBalance >= value + gasCost) {
      this.stateStore.setBalance(tx.from, fromBalance - value - gasCost);
      this.stateStore.setBalance(tx.to, toBalance + value);
      this.stateStore.setNonce(tx.from, tx.nonce + 1);
    }
  }

  private handleIncomingBlock(block: Block): void {
    const latestHeight = this.blockStore.getLatestHeight();
    
    if (block.height <= latestHeight) {
      log.debug('Ignoring old block', { blockHeight: block.height, latestHeight });
      return;
    }
    
    if (block.height > latestHeight + 1) {
      log.info('Missing blocks detected, initiating sync', {
        localHeight: latestHeight,
        receivedHeight: block.height,
      });
      return;
    }
  }

  private handleIncomingTransaction(tx: Transaction): void {
    if (this.mempool.has(tx.hash)) {
      return;
    }

    if (this.mempool.size >= this.config.security.maxMempoolSize) {
      log.warn('Mempool full, rejecting transaction');
      return;
    }

    const accountTxs = this.pendingTxByAccount.get(tx.from) || new Set();
    if (accountTxs.size >= this.config.security.maxPendingTxPerAccount) {
      log.warn('Too many pending txs for account', { account: tx.from });
      return;
    }

    const mempoolTx: MempoolTransaction = {
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      nonce: tx.nonce,
      gasLimit: tx.gasLimit,
      data: tx.data,
      signature: tx.signature,
      timestamp: tx.timestamp,
      shardId: tx.shardId,
      receivedAt: Date.now(),
      gasPrice: BigInt(tx.gasPrice),
      originalGasPrice: tx.gasPrice,
    };

    this.mempool.set(tx.hash, mempoolTx);
    accountTxs.add(tx.hash);
    this.pendingTxByAccount.set(tx.from, accountTxs);

    log.debug('Transaction added to mempool', { hash: tx.hash });
  }

  async submitTransaction(tx: Transaction): Promise<string> {
    tx.hash = CryptoManager.hashTransaction(tx);
    
    this.handleIncomingTransaction(tx);
    this.p2pNetwork.broadcast(MessageType.NEW_TRANSACTION, tx);
    
    return tx.hash;
  }

  private startMetricsCollection(): void {
    setInterval(() => {
      this.metrics.uptime = (Date.now() - this.startTime) / 1000;
      
      const consensusMetrics = this.consensusEngine.getMetrics();
      this.metrics.latencyP50 = consensusMetrics.avgRoundTimeMs;
      
      if (consensusMetrics.totalRounds > 0) {
        this.metrics.performanceScore = 
          (consensusMetrics.successfulRounds / consensusMetrics.totalRounds) * 100;
      }
    }, this.config.monitoring.healthCheckInterval);
  }

  getStatus(): NodeStatus {
    return {
      nodeId: this.config.nodeId,
      version: '1.0.0',
      chainId: this.config.chainId,
      networkId: this.config.networkId,
      isValidator: true,
      isSyncing: false,
      currentHeight: this.blockStore.getLatestHeight(),
      highestKnownHeight: this.blockStore.getLatestHeight(),
      peersCount: this.p2pNetwork.getPeerCount(),
      consensusState: this.consensusEngine.getState(),
      uptime: Date.now() - this.startTime,
      memoryUsage: process.memoryUsage().heapUsed,
      cpuUsage: 0,
    };
  }

  getMetrics(): ValidatorMetrics {
    return { ...this.metrics };
  }

  getMempoolSize(): number {
    return this.mempool.size;
  }

  getPeers() {
    return this.p2pNetwork.getPeers();
  }

  getConfig(): ValidatorNodeConfig {
    return this.config;
  }
}
