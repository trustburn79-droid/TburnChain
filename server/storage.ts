import {
  type Block,
  type InsertBlock,
  type Transaction,
  type InsertTransaction,
  type Account,
  type InsertAccount,
  type Validator,
  type InsertValidator,
  type SmartContract,
  type InsertSmartContract,
  type AiModel,
  type InsertAiModel,
  type AiDecision,
  type InsertAiDecision,
  type Shard,
  type InsertShard,
  type NetworkStats,
  type InsertNetworkStats,
  type ConsensusRound,
  type InsertConsensusRound,
  type ApiKey,
  type InsertApiKey,
  type CrossShardMessage,
  type InsertCrossShardMessage,
  type WalletBalance,
  type InsertWalletBalance,
  blocks,
  transactions,
  accounts,
  validators,
  smartContracts,
  aiModels,
  aiDecisions,
  shards,
  networkStats as networkStatsTable,
  consensusRounds,
  apiKeys,
  crossShardMessages,
  walletBalances,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc, isNull } from "drizzle-orm";

export interface IStorage {
  // Network Stats
  getNetworkStats(): Promise<NetworkStats>;
  updateNetworkStats(stats: Partial<InsertNetworkStats>): Promise<NetworkStats>;

  // Blocks
  getAllBlocks(): Promise<Block[]>;
  getRecentBlocks(limit?: number): Promise<Block[]>;
  getBlockByNumber(blockNumber: number): Promise<Block | undefined>;
  createBlock(block: InsertBlock): Promise<Block>;

  // Transactions
  getAllTransactions(): Promise<Transaction[]>;
  getRecentTransactions(limit?: number): Promise<Transaction[]>;
  getTransactionByHash(hash: string): Promise<Transaction | undefined>;
  createTransaction(tx: InsertTransaction): Promise<Transaction>;

  // Accounts
  getAccountByAddress(address: string): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;

  // Validators
  getAllValidators(): Promise<Validator[]>;
  getValidatorByAddress(address: string): Promise<Validator | undefined>;
  createValidator(validator: InsertValidator): Promise<Validator>;

  // Smart Contracts
  getAllContracts(): Promise<SmartContract[]>;
  getContractByAddress(address: string): Promise<SmartContract | undefined>;
  createContract(contract: InsertSmartContract): Promise<SmartContract>;

  // AI Models
  getAllAiModels(): Promise<AiModel[]>;
  getAiModelByName(name: string): Promise<AiModel | undefined>;
  updateAiModel(name: string, data: Partial<AiModel>): Promise<AiModel>;

  // AI Decisions
  getAllAiDecisions(limit?: number): Promise<AiDecision[]>;
  getAiDecisionById(id: string): Promise<AiDecision | undefined>;
  createAiDecision(data: InsertAiDecision): Promise<AiDecision>;
  getRecentAiDecisions(limit?: number): Promise<AiDecision[]>;

  // Shards
  getAllShards(): Promise<Shard[]>;
  getShardById(shardId: number): Promise<Shard | undefined>;
  updateShard(shardId: number, data: Partial<Shard>): Promise<Shard>;

  // Analytics
  getLatencyDistribution(): Promise<import("@shared/schema").LatencyBucket[]>;
  getTPSHistory(minutes?: number): Promise<import("@shared/schema").TPSHistoryPoint[]>;
  getConsensusState(): Promise<import("@shared/schema").ConsensusState>;
  
  // Consensus Rounds
  createConsensusRound(data: import("@shared/schema").InsertConsensusRound): Promise<import("@shared/schema").ConsensusRound>;
  getLatestConsensusRound(): Promise<import("@shared/schema").ConsensusRound | null>;
  updateConsensusRound(blockHeight: number, data: Partial<import("@shared/schema").ConsensusRound>): Promise<void>;

  // API Keys
  getAllApiKeys(): Promise<ApiKey[]>;
  getApiKeyById(id: string): Promise<ApiKey | undefined>;
  getApiKeyByHash(hashedKey: string): Promise<ApiKey | undefined>;
  createApiKey(data: InsertApiKey): Promise<ApiKey>;
  revokeApiKey(id: string): Promise<void>;
  updateApiKeyLastUsed(id: string): Promise<void>;

  // Cross-Shard Messages
  getAllCrossShardMessages(limit?: number): Promise<CrossShardMessage[]>;
  getCrossShardMessageById(id: string): Promise<CrossShardMessage | undefined>;
  createCrossShardMessage(data: InsertCrossShardMessage): Promise<CrossShardMessage>;
  updateCrossShardMessage(id: string, data: Partial<CrossShardMessage>): Promise<void>;

  // Wallet Balances
  getAllWalletBalances(limit?: number): Promise<WalletBalance[]>;
  getWalletBalanceByAddress(address: string): Promise<WalletBalance | undefined>;
  createWalletBalance(data: InsertWalletBalance): Promise<WalletBalance>;
  updateWalletBalance(address: string, data: Partial<WalletBalance>): Promise<void>;
}

export class MemStorage implements IStorage {
  private networkStats: NetworkStats;
  private blocks: Map<string, Block>;
  private transactions: Map<string, Transaction>;
  private accounts: Map<string, Account>;
  private validators: Map<string, Validator>;
  private contracts: Map<string, SmartContract>;
  private aiModels: Map<string, AiModel>;
  private aiDecisions: Map<string, AiDecision>;
  private shards: Map<number, Shard>;
  private consensusRounds: Map<number, import("@shared/schema").ConsensusRound>;
  private crossShardMessages: Map<string, CrossShardMessage>;
  private walletBalances: Map<string, WalletBalance>;

  constructor() {
    // Initialize network stats with TBURN high-performance metrics (basis points: 10000 = 100.00%)
    this.networkStats = {
      id: "singleton",
      currentBlockHeight: 1245678,
      tps: 347892, // TBURN current TPS
      peakTps: 485231, // TBURN peak TPS
      avgBlockTime: 98, // TBURN block time in ms
      blockTimeP99: 125, // P99 block time
      slaUptime: 9990, // 99.90% uptime (basis points)
      latency: 12, // avg latency in ms
      latencyP99: 45, // P99 latency in ms
      activeValidators: 125,
      totalValidators: 150,
      totalTransactions: 89234567,
      totalAccounts: 234567,
      marketCap: "12450000000",
      circulatingSupply: "500000000",
      successRate: 9970, // 99.70% success rate (basis points)
      updatedAt: new Date(),
    };

    this.blocks = new Map();
    this.transactions = new Map();
    this.accounts = new Map();
    this.validators = new Map();
    this.contracts = new Map();
    this.aiModels = new Map();
    this.aiDecisions = new Map();
    this.shards = new Map();
    this.consensusRounds = new Map();
    this.crossShardMessages = new Map();
    this.walletBalances = new Map();

    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize Triple-Band AI Models (basis points: 10000 = 100.00%)
    const aiModels: AiModel[] = [
      {
        id: randomUUID(),
        name: "gpt-5",
        band: "strategic", // Strategic AI
        status: "active",
        requestCount: 2341,
        successCount: 2267,
        failureCount: 74,
        avgResponseTime: 245,
        totalCost: "124.56",
        lastUsed: new Date(),
        cacheHitRate: 6800, // 68.00% (basis points)
        accuracy: 9680, // 96.80% (basis points)
        uptime: 9990, // 99.90% (basis points)
      },
      {
        id: randomUUID(),
        name: "claude-sonnet-4-5",
        band: "tactical", // Tactical AI
        status: "active",
        requestCount: 15892,
        successCount: 15734,
        failureCount: 158,
        avgResponseTime: 198,
        totalCost: "89.34",
        lastUsed: new Date(),
        cacheHitRate: 7200, // 72.00% (basis points)
        accuracy: 9420, // 94.20% (basis points)
        uptime: 9980, // 99.80% (basis points)
      },
      {
        id: randomUUID(),
        name: "llama-3",
        band: "operational", // Operational AI
        status: "active",
        requestCount: 89234,
        successCount: 88789,
        failureCount: 445,
        avgResponseTime: 45,
        totalCost: "12.45",
        lastUsed: new Date(),
        cacheHitRate: 8500, // 85.00% (basis points)
        accuracy: 9850, // 98.50% (basis points)
        uptime: 9995, // 99.95% (basis points)
      },
    ];

    aiModels.forEach(model => this.aiModels.set(model.name, model));

    // Initialize AI Decisions (recent decisions from Triple-Band AI)
    const aiDecisionData: InsertAiDecision[] = [
      {
        band: "strategic",
        modelName: "gpt-5",
        decision: "Shard Splitting Approved",
        impact: "high",
        category: "scaling",
        shardId: 3,
        status: "executed",
        metadata: { confidence: 95, details: "Shard 3 overload detected at 98% capacity. Split into Shard 3 and 48 to maintain optimal performance." },
      },
      {
        band: "tactical",
        modelName: "claude-sonnet-4-5",
        decision: "Committee Rebalanced",
        impact: "medium",
        category: "optimization",
        status: "executed",
        metadata: { confidence: 92, details: "Optimized validator selection for better geographic distribution. Replaced 3 high-latency validators." },
      },
      {
        band: "operational",
        modelName: "llama-3",
        decision: "Load Balancing Adjusted",
        impact: "low",
        category: "optimization",
        shardId: 1,
        status: "executed",
        metadata: { confidence: 98, details: "Real-time load distribution adjusted for Shard 1. Response time improved by 12ms." },
      },
      {
        band: "strategic",
        modelName: "gpt-5",
        decision: "Network Scaling Initiated",
        impact: "high",
        category: "scaling",
        status: "pending",
        metadata: { confidence: 88, details: "Preparing to add 25 new validators to handle projected 30% TPS increase." },
      },
      {
        band: "tactical",
        modelName: "claude-sonnet-4-5",
        decision: "Gas Price Optimization",
        impact: "medium",
        category: "optimization",
        status: "executed",
        metadata: { confidence: 94, details: "Adjusted base gas price to 15 Gwei based on network congestion analysis." },
      },
    ];

    aiDecisionData.forEach(decision => {
      const aiDecision: AiDecision = {
        id: randomUUID(),
        ...decision,
        createdAt: new Date(Date.now() - Math.random() * 3600000), // Random time within last hour
        executedAt: decision.status === "executed" ? new Date(Date.now() - Math.random() * 1800000) : null,
      };
      this.aiDecisions.set(aiDecision.id, aiDecision);
    });

    // Initialize Shards
    const shards: Shard[] = [
      {
        id: randomUUID(),
        shardId: 0,
        name: "Shard Alpha",
        status: "active",
        blockHeight: 1245678,
        transactionCount: 18234567,
        validatorCount: 30,
        tps: 9046,
        peakTps: 12456,
        avgBlockTime: 95,
        load: 45,
        crossShardTxCount: 2345,
        stateSize: "45.2GB",
        lastSyncedAt: new Date(),
      },
      {
        id: randomUUID(),
        shardId: 1,
        name: "Shard Beta",
        status: "active",
        blockHeight: 1245679,
        transactionCount: 17891234,
        validatorCount: 30,
        tps: 8976,
        peakTps: 11234,
        avgBlockTime: 98,
        load: 42,
        crossShardTxCount: 1987,
        stateSize: "43.8GB",
        lastSyncedAt: new Date(),
      },
      {
        id: randomUUID(),
        shardId: 2,
        name: "Shard Gamma",
        status: "active",
        blockHeight: 1245680,
        transactionCount: 18123456,
        validatorCount: 30,
        tps: 9125,
        peakTps: 12789,
        avgBlockTime: 92,
        load: 48,
        crossShardTxCount: 2567,
        stateSize: "46.1GB",
        lastSyncedAt: new Date(),
      },
      {
        id: randomUUID(),
        shardId: 3,
        name: "Shard Delta",
        status: "active",
        blockHeight: 1245677,
        transactionCount: 17234567,
        validatorCount: 30,
        tps: 8654,
        peakTps: 10987,
        avgBlockTime: 101,
        load: 39,
        crossShardTxCount: 1756,
        stateSize: "42.3GB",
        lastSyncedAt: new Date(),
      },
      {
        id: randomUUID(),
        shardId: 4,
        name: "Shard Epsilon",
        status: "active",
        blockHeight: 1245681,
        transactionCount: 18345678,
        validatorCount: 30,
        tps: 9429,
        peakTps: 13456,
        avgBlockTime: 89,
        load: 52,
        crossShardTxCount: 2890,
        stateSize: "47.5GB",
        lastSyncedAt: new Date(),
      },
    ];

    shards.forEach(shard => this.shards.set(shard.shardId, shard));

    // Initialize Validators (basis points: 10000 = 100.00%)
    const validatorNames = [
      "Genesis Validator", "Quantum Node", "Stellar Forge", "Nebula Keeper",
      "Cosmic Guardian", "Alpha Prime", "Beta Nexus", "Gamma Core",
      "Delta Shield", "Epsilon Wave", "Zeta Prime", "Theta Node",
    ];

    for (let i = 0; i < 12; i++) {
      const validator: Validator = {
        id: randomUUID(),
        address: `0x${Math.random().toString(16).substr(2, 40)}`,
        name: validatorNames[i] || `Validator ${i + 1}`,
        stake: (Math.random() * 5000000 + 1000000).toFixed(0),
        commission: Math.floor(Math.random() * 1000) + 500, // 5.00-14.99% in basis points
        status: i < 10 ? "active" : Math.random() > 0.5 ? "inactive" : "jailed",
        uptime: Math.floor(Math.random() * 1000) + 9000, // 90.00-99.99% in basis points
        totalBlocks: Math.floor(Math.random() * 50000) + 10000,
        missedBlocks: Math.floor(Math.random() * 100),
        avgBlockTime: Math.floor(Math.random() * 50) + 80,
        votingPower: (Math.random() * 1000000).toFixed(0),
        apy: Math.floor(Math.random() * 1000) + 800, // 8.00-17.99% in basis points
        delegators: Math.floor(Math.random() * 500) + 50,
        rewardEarned: (Math.random() * 100000).toFixed(2),
        slashCount: Math.floor(Math.random() * 5),
        joinedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        lastActiveAt: new Date(),
      };
      this.validators.set(validator.address, validator);
    }

    // Initialize Blocks
    const now = Math.floor(Date.now() / 1000);
    const executionClasses = ["standard", "parallel", "cross_shard"];
    for (let i = 0; i < 50; i++) {
      const blockNumber = 1245678 - i;
      const block: Block = {
        id: randomUUID(),
        blockNumber: blockNumber,
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        parentHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        timestamp: now - i * 2,
        transactionCount: Math.floor(Math.random() * 150) + 50,
        validatorAddress: Array.from(this.validators.values())[Math.floor(Math.random() * 10)].address,
        gasUsed: Math.floor(Math.random() * 8000000) + 2000000,
        gasLimit: 10000000,
        size: Math.floor(Math.random() * 50000) + 10000,
        shardId: Math.floor(Math.random() * 5),
        stateRoot: `0x${Math.random().toString(16).substr(2, 64)}`,
        receiptsRoot: `0x${Math.random().toString(16).substr(2, 64)}`,
        executionClass: executionClasses[Math.floor(Math.random() * executionClasses.length)],
        latencyNs: Math.floor(Math.random() * 50000000) + 10000000,
        parallelBatchId: Math.random() > 0.3 ? `batch-${Math.floor(Math.random() * 100)}` : null,
      };
      this.blocks.set(block.id, block);
    }

    // Initialize Transactions
    for (let i = 0; i < 100; i++) {
      // Generate value in wei (18 decimals) using BigInt to avoid scientific notation
      const valueInEth = Math.floor(Math.random() * 100);
      const valueInWei = (BigInt(valueInEth) * BigInt(10 ** 18)).toString();
      
      // Generate gas price in wei (9 decimals for Gwei)
      const gasPriceInGwei = Math.floor(Math.random() * 50 + 10);
      const gasPriceInWei = (BigInt(gasPriceInGwei) * BigInt(10 ** 9)).toString();
      
      const tx: Transaction = {
        id: randomUUID(),
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        blockNumber: 1245678 - Math.floor(i / 5),
        blockHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        from: `0x${Math.random().toString(16).substr(2, 40)}`,
        to: Math.random() > 0.1 ? `0x${Math.random().toString(16).substr(2, 40)}` : null,
        value: valueInWei,
        gas: Math.floor(Math.random() * 200000) + 21000,
        gasPrice: gasPriceInWei,
        gasUsed: Math.random() > 0.1 ? Math.floor(Math.random() * 150000) + 21000 : null,
        nonce: Math.floor(Math.random() * 100),
        timestamp: now - Math.floor(i / 2) * 2,
        status: Math.random() > 0.05 ? "success" : Math.random() > 0.5 ? "failed" : "pending",
        input: Math.random() > 0.5 ? `0x${Math.random().toString(16).substr(2, 128)}` : null,
        contractAddress: Math.random() > 0.9 ? `0x${Math.random().toString(16).substr(2, 40)}` : null,
        shardId: Math.floor(Math.random() * 5),
        executionClass: executionClasses[Math.floor(Math.random() * executionClasses.length)],
        latencyNs: Math.floor(Math.random() * 100000000) + 5000000,
        parallelBatchId: Math.random() > 0.3 ? `batch-${Math.floor(Math.random() * 100)}` : null,
        crossShardMessageId: Math.random() > 0.8 ? `msg-${Math.random().toString(16).substr(2, 8)}` : null,
      };
      this.transactions.set(tx.id, tx);
    }

    // Initialize Smart Contracts
    const contractNames = [
      "TBURN Token", "DEX Router", "Lending Pool", "NFT Marketplace",
      "Staking Contract", "Governance", "Oracle", "Bridge",
    ];

    for (let i = 0; i < 8; i++) {
      // Generate balance in wei (18 decimals) using BigInt to avoid scientific notation
      const balanceInEth = Math.floor(Math.random() * 10000);
      const balanceInWei = (BigInt(balanceInEth) * BigInt(10 ** 18)).toString();
      
      const contract: SmartContract = {
        id: randomUUID(),
        address: `0x${Math.random().toString(16).substr(2, 40)}`,
        name: contractNames[i],
        creator: `0x${Math.random().toString(16).substr(2, 40)}`,
        bytecode: `0x${Math.random().toString(16).substr(2, 1000)}`,
        abi: null,
        sourceCode: null,
        deployedAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
        transactionCount: Math.floor(Math.random() * 50000) + 1000,
        balance: balanceInWei,
        verified: Math.random() > 0.3,
      };
      this.contracts.set(contract.address, contract);
    }
  }

  // Network Stats
  async getNetworkStats(): Promise<NetworkStats> {
    return this.networkStats;
  }

  async updateNetworkStats(stats: Partial<InsertNetworkStats>): Promise<NetworkStats> {
    this.networkStats = { ...this.networkStats, ...stats, updatedAt: new Date() };
    return this.networkStats;
  }

  // Blocks
  async getAllBlocks(): Promise<Block[]> {
    return Array.from(this.blocks.values()).sort((a, b) =>
      Number(b.blockNumber - a.blockNumber)
    );
  }

  async getRecentBlocks(limit = 10): Promise<Block[]> {
    const blocks = await this.getAllBlocks();
    return blocks.slice(0, limit);
  }

  async getBlockByNumber(blockNumber: number): Promise<Block | undefined> {
    return Array.from(this.blocks.values()).find(
      b => Number(b.blockNumber) === blockNumber
    );
  }

  async createBlock(insertBlock: InsertBlock): Promise<Block> {
    const id = randomUUID();
    const block: Block = { 
      ...insertBlock, 
      id,
      transactionCount: insertBlock.transactionCount ?? 0,
      gasUsed: insertBlock.gasUsed ?? 0,
      gasLimit: insertBlock.gasLimit ?? 0,
      shardId: insertBlock.shardId ?? 0,
    };
    this.blocks.set(id, block);
    return block;
  }

  // Transactions
  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).sort((a, b) =>
      Number(b.timestamp - a.timestamp)
    );
  }

  async getRecentTransactions(limit = 10): Promise<Transaction[]> {
    const txs = await this.getAllTransactions();
    return txs.slice(0, limit);
  }

  async getTransactionByHash(hash: string): Promise<Transaction | undefined> {
    return Array.from(this.transactions.values()).find(tx => tx.hash === hash);
  }

  async createTransaction(insertTx: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const tx: Transaction = { 
      ...insertTx, 
      id,
      status: insertTx.status ?? "pending",
      gasUsed: insertTx.gasUsed ?? null,
      shardId: insertTx.shardId ?? 0,
    };
    this.transactions.set(id, tx);
    return tx;
  }

  // Accounts
  async getAccountByAddress(address: string): Promise<Account | undefined> {
    return this.accounts.get(address);
  }

  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const id = randomUUID();
    const account: Account = {
      ...insertAccount,
      id,
      balance: insertAccount.balance ?? "0",
      nonce: insertAccount.nonce ?? 0,
      code: insertAccount.code ?? null,
      isContract: insertAccount.isContract ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.accounts.set(account.address, account);
    return account;
  }

  // Validators
  async getAllValidators(): Promise<Validator[]> {
    return Array.from(this.validators.values());
  }

  async getValidatorByAddress(address: string): Promise<Validator | undefined> {
    return this.validators.get(address);
  }

  async createValidator(insertValidator: InsertValidator): Promise<Validator> {
    const id = randomUUID();
    const validator: Validator = {
      ...insertValidator,
      id,
      commission: insertValidator.commission ?? 500,
      status: insertValidator.status ?? "active",
      uptime: insertValidator.uptime ?? 10000,
      totalBlocks: insertValidator.totalBlocks ?? 0,
      votingPower: insertValidator.votingPower ?? "0",
      apy: insertValidator.apy ?? 0,
      delegators: insertValidator.delegators ?? 0,
      joinedAt: new Date(),
    };
    this.validators.set(validator.address, validator);
    return validator;
  }

  // Smart Contracts
  async getAllContracts(): Promise<SmartContract[]> {
    return Array.from(this.contracts.values());
  }

  async getContractByAddress(address: string): Promise<SmartContract | undefined> {
    return this.contracts.get(address);
  }

  async createContract(insertContract: InsertSmartContract): Promise<SmartContract> {
    const id = randomUUID();
    const contract: SmartContract = {
      ...insertContract,
      id,
      transactionCount: insertContract.transactionCount ?? 0,
      balance: insertContract.balance ?? "0",
      abi: insertContract.abi ?? null,
      sourceCode: insertContract.sourceCode ?? null,
      verified: insertContract.verified ?? false,
      deployedAt: new Date(),
    };
    this.contracts.set(contract.address, contract);
    return contract;
  }

  // AI Models
  async getAllAiModels(): Promise<AiModel[]> {
    return Array.from(this.aiModels.values());
  }

  async getAiModelByName(name: string): Promise<AiModel | undefined> {
    return this.aiModels.get(name);
  }

  async updateAiModel(name: string, data: Partial<AiModel>): Promise<AiModel> {
    const model = this.aiModels.get(name);
    if (!model) {
      throw new Error(`AI Model ${name} not found`);
    }
    const updated = { ...model, ...data };
    this.aiModels.set(name, updated);
    return updated;
  }

  // AI Decisions
  async getAllAiDecisions(limit: number = 100): Promise<AiDecision[]> {
    return Array.from(this.aiDecisions.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getAiDecisionById(id: string): Promise<AiDecision | undefined> {
    return this.aiDecisions.get(id);
  }

  async createAiDecision(data: InsertAiDecision): Promise<AiDecision> {
    const decision: AiDecision = {
      id: randomUUID(),
      ...data,
      createdAt: new Date(),
      executedAt: data.status === "executed" ? new Date() : null,
    };
    this.aiDecisions.set(decision.id, decision);
    return decision;
  }

  async getRecentAiDecisions(limit: number = 10): Promise<AiDecision[]> {
    return Array.from(this.aiDecisions.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  // Shards
  async getAllShards(): Promise<Shard[]> {
    return Array.from(this.shards.values());
  }

  async getShardById(shardId: number): Promise<Shard | undefined> {
    return this.shards.get(shardId);
  }

  async updateShard(shardId: number, data: Partial<Shard>): Promise<Shard> {
    const shard = this.shards.get(shardId);
    if (!shard) {
      throw new Error(`Shard ${shardId} not found`);
    }
    const updated = { ...shard, ...data };
    this.shards.set(shardId, updated);
    return updated;
  }

  // Analytics
  async getLatencyDistribution(): Promise<import("@shared/schema").LatencyBucket[]> {
    const stats = await this.getNetworkStats();
    const avgLatency = stats.latency;
    const totalTx = Number(stats.totalTransactions);
    
    const under10 = avgLatency < 15 ? 45 : 30;
    const range10to20 = avgLatency < 20 ? 35 : 25;
    const range20to30 = 15;
    const range30to40 = 4;
    const range40to50 = 0.8;
    const over50 = 0.2;
    
    return [
      { range: "<10ms", count: Math.floor(totalTx * under10 / 100), percentage: under10 },
      { range: "10-20ms", count: Math.floor(totalTx * range10to20 / 100), percentage: range10to20 },
      { range: "20-30ms", count: Math.floor(totalTx * range20to30 / 100), percentage: range20to30 },
      { range: "30-40ms", count: Math.floor(totalTx * range30to40 / 100), percentage: range30to40 },
      { range: "40-50ms", count: Math.floor(totalTx * range40to50 / 100), percentage: range40to50 },
      { range: ">50ms", count: Math.floor(totalTx * over50 / 100), percentage: over50 },
    ];
  }

  async getTPSHistory(minutes = 60): Promise<import("@shared/schema").TPSHistoryPoint[]> {
    const stats = await this.getNetworkStats();
    const now = Date.now();
    const peakTPS = stats.peakTps;
    
    return Array.from({ length: minutes }, (_, i) => {
      const variance = 0.15;
      const trend = Math.sin((i / minutes) * Math.PI) * 0.1;
      const value = peakTPS * (0.85 + variance * (i / minutes) + trend);
      return {
        timestamp: now - (minutes - i) * 60 * 1000,
        tps: Math.floor(value),
      };
    });
  }

  async getConsensusState(): Promise<import("@shared/schema").ConsensusState> {
    const stats = await this.getNetworkStats();
    const validators = await this.getAllValidators();
    const activeValidators = validators.filter(v => v.status === "active");
    
    const now = Date.now();
    const blockStartTime = now - 800;
    const elapsed = now - blockStartTime;
    
    let currentPhase = 1;
    if (elapsed >= 700) currentPhase = 5;
    else if (elapsed >= 500) currentPhase = 4;
    else if (elapsed >= 300) currentPhase = 3;
    else if (elapsed >= 150) currentPhase = 2;
    
    const proposer = activeValidators[0]?.address || "0x0000...0000";
    const prevoteCount = activeValidators.filter(v => v.uptime >= 9500).length;
    const precommitCount = activeValidators.filter(v => v.uptime >= 9700).length;
    
    const phases: import("@shared/schema").ConsensusPhase[] = [
      { number: 1, label: "NewHeight", time: elapsed >= 0 ? "0ms" : "Pending", status: elapsed >= 0 ? "completed" : "pending" },
      { number: 2, label: "Propose", time: elapsed >= 150 ? "150ms" : currentPhase === 2 ? `${elapsed}ms` : "Pending", status: currentPhase > 2 ? "completed" : currentPhase === 2 ? "active" : "pending" },
      { number: 3, label: "Prevote", time: elapsed >= 300 ? "300ms" : currentPhase === 3 ? `${elapsed}ms` : "Pending", status: currentPhase > 3 ? "completed" : currentPhase === 3 ? "active" : "pending" },
      { number: 4, label: "Precommit", time: elapsed >= 500 ? "500ms" : currentPhase === 4 ? `${elapsed}ms` : "Pending", status: currentPhase > 4 ? "completed" : currentPhase === 4 ? "active" : "pending" },
      { number: 5, label: "Finalize", time: elapsed >= 700 ? "700ms" : "Pending", status: currentPhase === 5 ? "active" : "pending" },
    ];
    
    const totalValidators = activeValidators.length;
    const requiredQuorum = Math.ceil((totalValidators * 2) / 3);
    
    return {
      currentPhase,
      phases,
      proposer,
      blockHeight: Number(stats.currentBlockHeight),
      prevoteCount,
      precommitCount,
      totalValidators,
      requiredQuorum,
      avgBlockTimeMs: Number(stats.avgBlockTime),
      startTime: blockStartTime,
    };
  }

  async createConsensusRound(data: import("@shared/schema").InsertConsensusRound): Promise<import("@shared/schema").ConsensusRound> {
    const round: import("@shared/schema").ConsensusRound = {
      id: `round-${data.blockHeight}`,
      ...data,
      createdAt: new Date(),
    };
    this.consensusRounds.set(Number(data.blockHeight), round);
    return round;
  }

  async getLatestConsensusRound(): Promise<import("@shared/schema").ConsensusRound | null> {
    if (this.consensusRounds.size === 0) return null;
    const blockHeights = Array.from(this.consensusRounds.keys());
    const maxBlockHeight = Math.max(...blockHeights);
    return this.consensusRounds.get(maxBlockHeight) || null;
  }

  async updateConsensusRound(blockHeight: number, data: Partial<import("@shared/schema").ConsensusRound>): Promise<void> {
    const existing = this.consensusRounds.get(blockHeight);
    if (existing) {
      this.consensusRounds.set(blockHeight, { ...existing, ...data });
    }
  }

  // API Keys (not implemented for MemStorage)
  async getAllApiKeys(): Promise<ApiKey[]> {
    return [];
  }

  async getApiKeyById(id: string): Promise<ApiKey | undefined> {
    return undefined;
  }

  async getApiKeyByHash(hashedKey: string): Promise<ApiKey | undefined> {
    return undefined;
  }

  async createApiKey(data: InsertApiKey): Promise<ApiKey> {
    throw new Error("API Keys not supported in MemStorage");
  }

  async revokeApiKey(id: string): Promise<void> {
    throw new Error("API Keys not supported in MemStorage");
  }

  async updateApiKeyLastUsed(id: string): Promise<void> {
    throw new Error("API Keys not supported in MemStorage");
  }

  // Cross-Shard Messages (basic implementation for MemStorage)
  async getAllCrossShardMessages(limit: number = 100): Promise<CrossShardMessage[]> {
    return Array.from(this.crossShardMessages.values())
      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime())
      .slice(0, limit);
  }

  async getCrossShardMessageById(id: string): Promise<CrossShardMessage | undefined> {
    return this.crossShardMessages.get(id);
  }

  async createCrossShardMessage(data: InsertCrossShardMessage): Promise<CrossShardMessage> {
    const message: CrossShardMessage = {
      id: randomUUID(),
      ...data,
      sentAt: new Date(),
      confirmedAt: null,
      failedAt: null,
    };
    this.crossShardMessages.set(message.id, message);
    return message;
  }

  async updateCrossShardMessage(id: string, data: Partial<CrossShardMessage>): Promise<void> {
    const existing = this.crossShardMessages.get(id);
    if (existing) {
      this.crossShardMessages.set(id, { ...existing, ...data });
    }
  }

  // Wallet Balances (basic implementation for MemStorage)
  async getAllWalletBalances(limit: number = 100): Promise<WalletBalance[]> {
    return Array.from(this.walletBalances.values())
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, limit);
  }

  async getWalletBalanceByAddress(address: string): Promise<WalletBalance | undefined> {
    return this.walletBalances.get(address);
  }

  async createWalletBalance(data: InsertWalletBalance): Promise<WalletBalance> {
    const wallet: WalletBalance = {
      id: randomUUID(),
      ...data,
      firstSeenAt: new Date(),
      updatedAt: new Date(),
      lastTransactionAt: null,
    };
    this.walletBalances.set(wallet.address, wallet);
    return wallet;
  }

  async updateWalletBalance(address: string, data: Partial<WalletBalance>): Promise<void> {
    const existing = this.walletBalances.get(address);
    if (existing) {
      this.walletBalances.set(address, {
        ...existing,
        ...data,
        updatedAt: new Date(),
      });
    }
  }
}

// PostgreSQL-based storage implementation
export class DbStorage implements IStorage {
  // Network Stats
  async getNetworkStats(): Promise<NetworkStats> {
    const result = await db.select().from(networkStatsTable).limit(1);
    if (result.length === 0) {
      // Initialize if not exists
      const initialStats: InsertNetworkStats = {
        currentBlockHeight: 1245678,
        tps: 347892,
        peakTps: 485231,
        avgBlockTime: 98,
        blockTimeP99: 125,
        slaUptime: 9990,
        latency: 12,
        latencyP99: 45,
        activeValidators: 125,
        totalValidators: 150,
        totalTransactions: 89234567,
        totalAccounts: 234567,
        marketCap: "12450000000",
        circulatingSupply: "500000000",
        successRate: 9970,
      };
      await db.insert(networkStatsTable).values(initialStats);
      return { ...initialStats, id: "singleton", updatedAt: new Date() };
    }
    return result[0];
  }

  async updateNetworkStats(stats: Partial<InsertNetworkStats>): Promise<NetworkStats> {
    await db
      .update(networkStatsTable)
      .set({ ...stats, updatedAt: new Date() })
      .where(eq(networkStatsTable.id, "singleton"));
    return this.getNetworkStats();
  }

  // Blocks
  async getAllBlocks(): Promise<Block[]> {
    return db.select().from(blocks).orderBy(desc(blocks.blockNumber));
  }

  async getRecentBlocks(limit = 10): Promise<Block[]> {
    return db.select().from(blocks).orderBy(desc(blocks.blockNumber)).limit(limit);
  }

  async getBlockByNumber(blockNumber: number): Promise<Block | undefined> {
    const result = await db.select().from(blocks).where(eq(blocks.blockNumber, blockNumber)).limit(1);
    return result[0];
  }

  async createBlock(insertBlock: InsertBlock): Promise<Block> {
    const result = await db.insert(blocks).values(insertBlock).returning();
    return result[0];
  }

  // Transactions
  async getAllTransactions(): Promise<Transaction[]> {
    return db.select().from(transactions).orderBy(desc(transactions.timestamp));
  }

  async getRecentTransactions(limit = 10): Promise<Transaction[]> {
    return db.select().from(transactions).orderBy(desc(transactions.timestamp)).limit(limit);
  }

  async getTransactionByHash(hash: string): Promise<Transaction | undefined> {
    const result = await db.select().from(transactions).where(eq(transactions.hash, hash)).limit(1);
    return result[0];
  }

  async createTransaction(insertTx: InsertTransaction): Promise<Transaction> {
    const result = await db.insert(transactions).values(insertTx).returning();
    return result[0];
  }

  // Accounts
  async getAccountByAddress(address: string): Promise<Account | undefined> {
    const result = await db.select().from(accounts).where(eq(accounts.address, address)).limit(1);
    return result[0];
  }

  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const result = await db.insert(accounts).values(insertAccount).returning();
    return result[0];
  }

  // Validators
  async getAllValidators(): Promise<Validator[]> {
    return db.select().from(validators);
  }

  async getValidatorByAddress(address: string): Promise<Validator | undefined> {
    const result = await db.select().from(validators).where(eq(validators.address, address)).limit(1);
    return result[0];
  }

  async createValidator(insertValidator: InsertValidator): Promise<Validator> {
    const result = await db.insert(validators).values(insertValidator).returning();
    return result[0];
  }

  // Smart Contracts
  async getAllContracts(): Promise<SmartContract[]> {
    return db.select().from(smartContracts);
  }

  async getContractByAddress(address: string): Promise<SmartContract | undefined> {
    const result = await db.select().from(smartContracts).where(eq(smartContracts.address, address)).limit(1);
    return result[0];
  }

  async createContract(insertContract: InsertSmartContract): Promise<SmartContract> {
    const result = await db.insert(smartContracts).values(insertContract).returning();
    return result[0];
  }

  // AI Models
  async getAllAiModels(): Promise<AiModel[]> {
    return db.select().from(aiModels);
  }

  async getAiModelByName(name: string): Promise<AiModel | undefined> {
    const result = await db.select().from(aiModels).where(eq(aiModels.name, name)).limit(1);
    return result[0];
  }

  async updateAiModel(name: string, data: Partial<AiModel>): Promise<AiModel> {
    await db.update(aiModels).set(data).where(eq(aiModels.name, name));
    const result = await this.getAiModelByName(name);
    if (!result) throw new Error(`AI Model ${name} not found`);
    return result;
  }

  // AI Decisions
  async getAllAiDecisions(limit: number = 100): Promise<AiDecision[]> {
    return db.select().from(aiDecisions).orderBy(desc(aiDecisions.createdAt)).limit(limit);
  }

  async getAiDecisionById(id: string): Promise<AiDecision | undefined> {
    const result = await db.select().from(aiDecisions).where(eq(aiDecisions.id, id)).limit(1);
    return result[0];
  }

  async createAiDecision(data: InsertAiDecision): Promise<AiDecision> {
    const decision = await db.insert(aiDecisions).values({
      ...data,
      executedAt: data.status === "executed" ? new Date() : null,
    }).returning();
    return decision[0];
  }

  async getRecentAiDecisions(limit: number = 10): Promise<AiDecision[]> {
    return db.select().from(aiDecisions).orderBy(desc(aiDecisions.createdAt)).limit(limit);
  }

  // Shards
  async getAllShards(): Promise<Shard[]> {
    return db.select().from(shards);
  }

  async getShardById(shardId: number): Promise<Shard | undefined> {
    const result = await db.select().from(shards).where(eq(shards.shardId, shardId)).limit(1);
    return result[0];
  }

  async updateShard(shardId: number, data: Partial<Shard>): Promise<Shard> {
    await db.update(shards).set(data).where(eq(shards.shardId, shardId));
    const result = await this.getShardById(shardId);
    if (!result) throw new Error(`Shard ${shardId} not found`);
    return result;
  }

  // Analytics
  async getLatencyDistribution(): Promise<import("@shared/schema").LatencyBucket[]> {
    const stats = await this.getNetworkStats();
    const avgLatency = stats.latency;
    const totalTx = Number(stats.totalTransactions);
    
    const under10 = avgLatency < 15 ? 45 : 30;
    const range10to20 = avgLatency < 20 ? 35 : 25;
    const range20to30 = 15;
    const range30to40 = 4;
    const range40to50 = 0.8;
    const over50 = 0.2;
    
    return [
      { range: "<10ms", count: Math.floor(totalTx * under10 / 100), percentage: under10 },
      { range: "10-20ms", count: Math.floor(totalTx * range10to20 / 100), percentage: range10to20 },
      { range: "20-30ms", count: Math.floor(totalTx * range20to30 / 100), percentage: range20to30 },
      { range: "30-40ms", count: Math.floor(totalTx * range30to40 / 100), percentage: range30to40 },
      { range: "40-50ms", count: Math.floor(totalTx * range40to50 / 100), percentage: range40to50 },
      { range: ">50ms", count: Math.floor(totalTx * over50 / 100), percentage: over50 },
    ];
  }

  async getTPSHistory(minutes = 60): Promise<import("@shared/schema").TPSHistoryPoint[]> {
    const stats = await this.getNetworkStats();
    const now = Date.now();
    const peakTPS = stats.peakTps;
    
    return Array.from({ length: minutes }, (_, i) => {
      const variance = 0.15;
      const trend = Math.sin((i / minutes) * Math.PI) * 0.1;
      const value = peakTPS * (0.85 + variance * (i / minutes) + trend);
      return {
        timestamp: now - (minutes - i) * 60 * 1000,
        tps: Math.floor(value),
      };
    });
  }

  async getConsensusState(): Promise<import("@shared/schema").ConsensusState> {
    const latestRound = await this.getLatestConsensusRound();
    
    if (!latestRound) {
      const stats = await this.getNetworkStats();
      const validators = await this.getAllValidators();
      const activeValidators = validators.filter(v => v.status === "active");
      const totalValidators = activeValidators.length;
      const requiredQuorum = Math.ceil((totalValidators * 2) / 3);
      
      return {
        currentPhase: 1,
        phases: [
          { number: 1, label: "NewHeight", time: "Pending", status: "pending" },
          { number: 2, label: "Propose", time: "Pending", status: "pending" },
          { number: 3, label: "Prevote", time: "Pending", status: "pending" },
          { number: 4, label: "Precommit", time: "Pending", status: "pending" },
          { number: 5, label: "Finalize", time: "Pending", status: "pending" },
        ],
        proposer: activeValidators[0]?.address || "0x0000...0000",
        blockHeight: Number(stats.currentBlockHeight),
        prevoteCount: 0,
        precommitCount: 0,
        totalValidators,
        requiredQuorum,
        avgBlockTimeMs: Number(stats.avgBlockTime),
        startTime: 0,
      };
    }

    const phases: import("@shared/schema").ConsensusPhase[] = JSON.parse(latestRound.phasesJson);
    
    return {
      currentPhase: latestRound.currentPhase,
      phases,
      proposer: latestRound.proposerAddress,
      blockHeight: Number(latestRound.blockHeight),
      prevoteCount: latestRound.prevoteCount,
      precommitCount: latestRound.precommitCount,
      totalValidators: latestRound.totalValidators,
      requiredQuorum: latestRound.requiredQuorum,
      avgBlockTimeMs: latestRound.avgBlockTimeMs,
      startTime: Number(latestRound.startTime),
    };
  }

  async createConsensusRound(data: InsertConsensusRound): Promise<ConsensusRound> {
    const [round] = await db.insert(consensusRounds).values(data).returning();
    return round;
  }

  async getLatestConsensusRound(): Promise<ConsensusRound | null> {
    const [round] = await db
      .select()
      .from(consensusRounds)
      .orderBy(desc(consensusRounds.blockHeight))
      .limit(1);
    return round || null;
  }

  async updateConsensusRound(blockHeight: number, data: Partial<ConsensusRound>): Promise<void> {
    await db
      .update(consensusRounds)
      .set(data)
      .where(eq(consensusRounds.blockHeight, BigInt(blockHeight)));
  }

  // API Keys
  async getAllApiKeys(): Promise<ApiKey[]> {
    return db.select().from(apiKeys).where(isNull(apiKeys.revokedAt)).orderBy(desc(apiKeys.createdAt));
  }

  async getApiKeyById(id: string): Promise<ApiKey | undefined> {
    const result = await db.select().from(apiKeys).where(eq(apiKeys.id, id)).limit(1);
    return result[0];
  }

  async getApiKeyByHash(hashedKey: string): Promise<ApiKey | undefined> {
    const result = await db.select().from(apiKeys).where(eq(apiKeys.hashedKey, hashedKey)).limit(1);
    return result[0];
  }

  async createApiKey(data: InsertApiKey): Promise<ApiKey> {
    const result = await db.insert(apiKeys).values(data).returning();
    return result[0];
  }

  async revokeApiKey(id: string): Promise<void> {
    await db.update(apiKeys).set({ revokedAt: new Date() }).where(eq(apiKeys.id, id));
  }

  async updateApiKeyLastUsed(id: string): Promise<void> {
    await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, id));
  }

  // Cross-Shard Messages
  async getAllCrossShardMessages(limit: number = 100): Promise<CrossShardMessage[]> {
    return db.select().from(crossShardMessages).orderBy(desc(crossShardMessages.sentAt)).limit(limit);
  }

  async getCrossShardMessageById(id: string): Promise<CrossShardMessage | undefined> {
    const result = await db.select().from(crossShardMessages).where(eq(crossShardMessages.id, id)).limit(1);
    return result[0];
  }

  async createCrossShardMessage(data: InsertCrossShardMessage): Promise<CrossShardMessage> {
    const result = await db.insert(crossShardMessages).values(data).returning();
    return result[0];
  }

  async updateCrossShardMessage(id: string, data: Partial<CrossShardMessage>): Promise<void> {
    await db.update(crossShardMessages).set(data).where(eq(crossShardMessages.id, id));
  }

  // Wallet Balances
  async getAllWalletBalances(limit: number = 100): Promise<WalletBalance[]> {
    return db.select().from(walletBalances).orderBy(desc(walletBalances.updatedAt)).limit(limit);
  }

  async getWalletBalanceByAddress(address: string): Promise<WalletBalance | undefined> {
    const result = await db.select().from(walletBalances).where(eq(walletBalances.address, address)).limit(1);
    return result[0];
  }

  async createWalletBalance(data: InsertWalletBalance): Promise<WalletBalance> {
    const result = await db.insert(walletBalances).values(data).returning();
    return result[0];
  }

  async updateWalletBalance(address: string, data: Partial<WalletBalance>): Promise<void> {
    await db.update(walletBalances).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(walletBalances.address, address));
  }
}

export const storage = new DbStorage();
