import { db } from "./db";
import {
  blocks,
  transactions,
  validators,
  smartContracts,
  aiModels,
  shards,
  type InsertBlock,
  type InsertTransaction,
  type InsertValidator,
  type InsertSmartContract,
  type InsertAiModel,
  type InsertShard,
} from "@shared/schema";

async function seedDatabase() {
  console.log("Starting database seed...");

  // Check if data already exists
  const existingBlocks = await db.select().from(blocks).limit(1);
  if (existingBlocks.length > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  const now = Math.floor(Date.now() / 1000);

  // Seed AI Models
  console.log("Seeding AI models...");
  const aiModelData: InsertAiModel[] = [
    {
      name: "gpt-5",
      status: "active",
      requestCount: 12450,
      successCount: 12389,
      failureCount: 61,
      avgResponseTime: 245,
      totalCost: "124.56",
      cacheHitRate: 68,
    },
    {
      name: "claude-sonnet-4-5",
      status: "active",
      requestCount: 8934,
      successCount: 8901,
      failureCount: 33,
      avgResponseTime: 312,
      totalCost: "89.34",
      cacheHitRate: 72,
    },
    {
      name: "llama-3",
      status: "active",
      requestCount: 5623,
      successCount: 5598,
      failureCount: 25,
      avgResponseTime: 189,
      totalCost: "28.12",
      cacheHitRate: 75,
    },
  ];

  for (const model of aiModelData) {
    await db.insert(aiModels).values(model);
  }

  // Seed Shards
  console.log("Seeding shards...");
  const shardData: InsertShard[] = [
    {
      shardId: 0,
      name: "Shard Alpha",
      status: "active",
      blockHeight: 1245678,
      transactionCount: 18234567,
      validatorCount: 30,
      tps: 9046,
      load: 45,
    },
    {
      shardId: 1,
      name: "Shard Beta",
      status: "active",
      blockHeight: 1245679,
      transactionCount: 17891234,
      validatorCount: 30,
      tps: 8976,
      load: 42,
    },
    {
      shardId: 2,
      name: "Shard Gamma",
      status: "active",
      blockHeight: 1245680,
      transactionCount: 18123456,
      validatorCount: 30,
      tps: 9125,
      load: 48,
    },
    {
      shardId: 3,
      name: "Shard Delta",
      status: "active",
      blockHeight: 1245677,
      transactionCount: 17234567,
      validatorCount: 30,
      tps: 8654,
      load: 39,
    },
    {
      shardId: 4,
      name: "Shard Epsilon",
      status: "active",
      blockHeight: 1245681,
      transactionCount: 18345678,
      validatorCount: 30,
      tps: 9429,
      load: 52,
    },
  ];

  for (const shard of shardData) {
    await db.insert(shards).values(shard);
  }

  // Seed Validators
  console.log("Seeding validators...");
  const validatorStatuses = ["active", "active", "active", "active", "active", "active", "active", "active", "inactive", "jailed"];
  for (let i = 0; i < 10; i++) {
    const validator: InsertValidator = {
      address: `0x${Math.random().toString(16).substr(2, 40)}`,
      name: `Validator ${i + 1}`,
      stake: (Math.floor(Math.random() * 5000000) + 1000000).toString(),
      commission: Math.floor(Math.random() * 10) + 5,
      status: validatorStatuses[i],
      uptime: validatorStatuses[i] === "active" ? Math.floor(Math.random() * 5) + 95 : Math.floor(Math.random() * 50) + 30,
      totalBlocks: Math.floor(Math.random() * 10000) + 1000,
      votingPower: (Math.floor(Math.random() * 100000) + 10000).toString(),
      apy: Math.floor(Math.random() * 15) + 5,
      delegators: Math.floor(Math.random() * 500) + 100,
    };
    await db.insert(validators).values(validator);
  }

  // Seed Smart Contracts
  console.log("Seeding smart contracts...");
  const contractNames = ["DEX Protocol", "NFT Marketplace", "Lending Platform", "Staking Contract", "DAO Governance"];
  for (let i = 0; i < contractNames.length; i++) {
    const contract: InsertSmartContract = {
      address: `0x${Math.random().toString(16).substr(2, 40)}`,
      name: contractNames[i],
      creator: `0x${Math.random().toString(16).substr(2, 40)}`,
      bytecode: `0x${Math.random().toString(16).substr(2, 200)}`,
      abi: [],
      sourceCode: null,
      transactionCount: Math.floor(Math.random() * 10000) + 100,
      balance: (Math.random() * 1000).toFixed(18),
      verified: Math.random() > 0.3,
    };
    await db.insert(smartContracts).values(contract);
  }

  // Seed Blocks
  console.log("Seeding blocks...");
  for (let i = 0; i < 50; i++) {
    const blockNumber = 1245678 - i;
    const block: InsertBlock = {
      blockNumber: blockNumber,
      hash: `0x${Math.random().toString(16).substr(2, 64)}`,
      parentHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      timestamp: now - i * 2,
      transactionCount: Math.floor(Math.random() * 150) + 50,
      validatorAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      gasUsed: Math.floor(Math.random() * 8000000) + 2000000,
      gasLimit: 10000000,
      size: Math.floor(Math.random() * 50000) + 10000,
      shardId: Math.floor(Math.random() * 5),
      stateRoot: `0x${Math.random().toString(16).substr(2, 64)}`,
      receiptsRoot: `0x${Math.random().toString(16).substr(2, 64)}`,
    };
    await db.insert(blocks).values(block);
  }

  // Seed Transactions
  console.log("Seeding transactions...");
  for (let i = 0; i < 100; i++) {
    const valueNum = Math.random() * 100;
    const valueInWei = (BigInt(Math.floor(valueNum * 1e18))).toString();
    const gasPriceNum = Math.random() * 50 + 10;
    const gasPriceInWei = (BigInt(Math.floor(gasPriceNum * 1e9))).toString();

    const tx: InsertTransaction = {
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
    };
    await db.insert(transactions).values(tx);
  }

  console.log("Database seeded successfully!");
}

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log("Seed complete");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seed failed:", err);
      process.exit(1);
    });
}

export { seedDatabase };
