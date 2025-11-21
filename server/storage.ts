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
  type Shard,
  type InsertShard,
  type NetworkStats,
  type InsertNetworkStats,
} from "@shared/schema";
import { randomUUID } from "crypto";

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

  // Shards
  getAllShards(): Promise<Shard[]>;
  getShardById(shardId: number): Promise<Shard | undefined>;
  updateShard(shardId: number, data: Partial<Shard>): Promise<Shard>;
}

export class MemStorage implements IStorage {
  private networkStats: NetworkStats;
  private blocks: Map<string, Block>;
  private transactions: Map<string, Transaction>;
  private accounts: Map<string, Account>;
  private validators: Map<string, Validator>;
  private contracts: Map<string, SmartContract>;
  private aiModels: Map<string, AiModel>;
  private shards: Map<number, Shard>;

  constructor() {
    // Initialize network stats
    this.networkStats = {
      id: "singleton",
      currentBlockHeight: BigInt(1245678),
      tps: 45230,
      avgBlockTime: 1,
      activeValidators: 125,
      totalValidators: 150,
      totalTransactions: BigInt(89234567),
      totalAccounts: 234567,
      marketCap: "12450000000",
      circulatingSupply: "500000000",
      updatedAt: new Date(),
    };

    this.blocks = new Map();
    this.transactions = new Map();
    this.accounts = new Map();
    this.validators = new Map();
    this.contracts = new Map();
    this.aiModels = new Map();
    this.shards = new Map();

    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize AI Models
    const aiModels: AiModel[] = [
      {
        id: randomUUID(),
        name: "gpt-5",
        status: "active",
        requestCount: 12450,
        successCount: 12389,
        failureCount: 61,
        avgResponseTime: 245,
        totalCost: "124.56",
        lastUsed: new Date(),
        cacheHitRate: 68,
      },
      {
        id: randomUUID(),
        name: "claude-sonnet-4-5",
        status: "active",
        requestCount: 8934,
        successCount: 8901,
        failureCount: 33,
        avgResponseTime: 312,
        totalCost: "89.34",
        lastUsed: new Date(),
        cacheHitRate: 72,
      },
      {
        id: randomUUID(),
        name: "llama-3",
        status: "active",
        requestCount: 5623,
        successCount: 5598,
        failureCount: 25,
        avgResponseTime: 189,
        totalCost: "28.12",
        lastUsed: new Date(),
        cacheHitRate: 75,
      },
    ];

    aiModels.forEach(model => this.aiModels.set(model.name, model));

    // Initialize Shards
    const shards: Shard[] = [
      {
        id: randomUUID(),
        shardId: 0,
        name: "Shard Alpha",
        status: "active",
        blockHeight: BigInt(1245678),
        transactionCount: 18234567,
        validatorCount: 30,
        tps: 9046,
        load: 45,
      },
      {
        id: randomUUID(),
        shardId: 1,
        name: "Shard Beta",
        status: "active",
        blockHeight: BigInt(1245679),
        transactionCount: 17891234,
        validatorCount: 30,
        tps: 8976,
        load: 42,
      },
      {
        id: randomUUID(),
        shardId: 2,
        name: "Shard Gamma",
        status: "active",
        blockHeight: BigInt(1245680),
        transactionCount: 18123456,
        validatorCount: 30,
        tps: 9125,
        load: 48,
      },
      {
        id: randomUUID(),
        shardId: 3,
        name: "Shard Delta",
        status: "active",
        blockHeight: BigInt(1245677),
        transactionCount: 17234567,
        validatorCount: 30,
        tps: 8654,
        load: 39,
      },
      {
        id: randomUUID(),
        shardId: 4,
        name: "Shard Epsilon",
        status: "active",
        blockHeight: BigInt(1245681),
        transactionCount: 18345678,
        validatorCount: 30,
        tps: 9429,
        load: 52,
      },
    ];

    shards.forEach(shard => this.shards.set(shard.shardId, shard));

    // Initialize Validators
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
        commission: Math.floor(Math.random() * 10) + 5,
        status: i < 10 ? "active" : Math.random() > 0.5 ? "inactive" : "jailed",
        uptime: Math.floor(Math.random() * 10) + 90,
        totalBlocks: Math.floor(Math.random() * 50000) + 10000,
        votingPower: (Math.random() * 1000000).toFixed(0),
        apy: Math.floor(Math.random() * 10) + 8,
        delegators: Math.floor(Math.random() * 500) + 50,
        joinedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      };
      this.validators.set(validator.address, validator);
    }

    // Initialize Blocks
    const now = Math.floor(Date.now() / 1000);
    for (let i = 0; i < 50; i++) {
      const blockNumber = 1245678 - i;
      const block: Block = {
        id: randomUUID(),
        blockNumber: BigInt(blockNumber),
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        parentHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        timestamp: BigInt(now - i * 2),
        transactionCount: Math.floor(Math.random() * 150) + 50,
        validatorAddress: Array.from(this.validators.values())[Math.floor(Math.random() * 10)].address,
        gasUsed: BigInt(Math.floor(Math.random() * 8000000) + 2000000),
        gasLimit: BigInt(10000000),
        size: Math.floor(Math.random() * 50000) + 10000,
        shardId: Math.floor(Math.random() * 5),
        stateRoot: `0x${Math.random().toString(16).substr(2, 64)}`,
        receiptsRoot: `0x${Math.random().toString(16).substr(2, 64)}`,
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
        blockNumber: BigInt(1245678 - Math.floor(i / 5)),
        blockHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        from: `0x${Math.random().toString(16).substr(2, 40)}`,
        to: Math.random() > 0.1 ? `0x${Math.random().toString(16).substr(2, 40)}` : null,
        value: valueInWei,
        gas: BigInt(Math.floor(Math.random() * 200000) + 21000),
        gasPrice: gasPriceInWei,
        gasUsed: Math.random() > 0.1 ? BigInt(Math.floor(Math.random() * 150000) + 21000) : null,
        nonce: Math.floor(Math.random() * 100),
        timestamp: BigInt(now - Math.floor(i / 2) * 2),
        status: Math.random() > 0.05 ? "success" : Math.random() > 0.5 ? "failed" : "pending",
        input: Math.random() > 0.5 ? `0x${Math.random().toString(16).substr(2, 128)}` : null,
        contractAddress: Math.random() > 0.9 ? `0x${Math.random().toString(16).substr(2, 40)}` : null,
        shardId: Math.floor(Math.random() * 5),
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
    const block: Block = { ...insertBlock, id };
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
    const tx: Transaction = { ...insertTx, id };
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
}

export const storage = new MemStorage();
