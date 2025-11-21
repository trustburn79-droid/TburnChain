import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, bigint, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================
// TBURN Blockchain Schema
// ============================================

// Blocks
export const blocks = pgTable("blocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  blockNumber: bigint("block_number", { mode: "number" }).notNull().unique(),
  hash: text("hash").notNull().unique(),
  parentHash: text("parent_hash").notNull(),
  timestamp: bigint("timestamp", { mode: "number" }).notNull(),
  transactionCount: integer("transaction_count").notNull().default(0),
  validatorAddress: text("validator_address").notNull(),
  gasUsed: bigint("gas_used", { mode: "number" }).notNull().default(0),
  gasLimit: bigint("gas_limit", { mode: "number" }).notNull().default(0),
  size: integer("size").notNull(),
  shardId: integer("shard_id").notNull().default(0),
  stateRoot: text("state_root").notNull(),
  receiptsRoot: text("receipts_root").notNull(),
});

// Transactions
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hash: text("hash").notNull().unique(),
  blockNumber: bigint("block_number", { mode: "number" }).notNull(),
  blockHash: text("block_hash").notNull(),
  from: text("from").notNull(),
  to: text("to"),
  value: text("value").notNull(),
  gas: bigint("gas", { mode: "number" }).notNull(),
  gasPrice: text("gas_price").notNull(),
  gasUsed: bigint("gas_used", { mode: "number" }),
  nonce: integer("nonce").notNull(),
  timestamp: bigint("timestamp", { mode: "number" }).notNull(),
  status: text("status").notNull().default("pending"), // pending, success, failed
  input: text("input"),
  contractAddress: text("contract_address"),
  shardId: integer("shard_id").notNull().default(0),
});

// Accounts
export const accounts = pgTable("accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  address: text("address").notNull().unique(),
  balance: text("balance").notNull().default("0"),
  nonce: integer("nonce").notNull().default(0),
  code: text("code"),
  isContract: boolean("is_contract").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Validators
export const validators = pgTable("validators", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  address: text("address").notNull().unique(),
  name: text("name").notNull(),
  stake: text("stake").notNull(),
  commission: integer("commission").notNull().default(10), // percentage
  status: text("status").notNull().default("active"), // active, inactive, jailed
  uptime: integer("uptime").notNull().default(100), // percentage
  totalBlocks: integer("total_blocks").notNull().default(0),
  votingPower: text("voting_power").notNull().default("0"),
  apy: integer("apy").notNull().default(0), // percentage
  delegators: integer("delegators").notNull().default(0),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

// Smart Contracts
export const smartContracts = pgTable("smart_contracts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  address: text("address").notNull().unique(),
  name: text("name").notNull(),
  creator: text("creator").notNull(),
  bytecode: text("bytecode").notNull(),
  abi: jsonb("abi"),
  sourceCode: text("source_code"),
  deployedAt: timestamp("deployed_at").notNull().defaultNow(),
  transactionCount: integer("transaction_count").notNull().default(0),
  balance: text("balance").notNull().default("0"),
  verified: boolean("verified").notNull().default(false),
});

// AI Model Stats
export const aiModels = pgTable("ai_models", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(), // gpt-5, claude-sonnet-4-5, llama-3
  status: text("status").notNull().default("active"), // active, inactive, error
  requestCount: integer("request_count").notNull().default(0),
  successCount: integer("success_count").notNull().default(0),
  failureCount: integer("failure_count").notNull().default(0),
  avgResponseTime: integer("avg_response_time").notNull().default(0), // ms
  totalCost: text("total_cost").notNull().default("0"),
  lastUsed: timestamp("last_used"),
  cacheHitRate: integer("cache_hit_rate").notNull().default(0), // percentage
});

// Shard Information
export const shards = pgTable("shards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shardId: integer("shard_id").notNull().unique(),
  name: text("name").notNull(),
  status: text("status").notNull().default("active"), // active, syncing, error
  blockHeight: bigint("block_height", { mode: "number" }).notNull().default(0),
  transactionCount: integer("transaction_count").notNull().default(0),
  validatorCount: integer("validator_count").notNull().default(0),
  tps: integer("tps").notNull().default(0),
  load: integer("load").notNull().default(0), // percentage
});

// Network Stats (singleton table for current network state)
export const networkStats = pgTable("network_stats", {
  id: varchar("id").primaryKey().default("singleton"),
  currentBlockHeight: bigint("current_block_height", { mode: "number" }).notNull().default(0),
  tps: integer("tps").notNull().default(0),
  avgBlockTime: integer("avg_block_time").notNull().default(0), // seconds
  activeValidators: integer("active_validators").notNull().default(0),
  totalValidators: integer("total_validators").notNull().default(0),
  totalTransactions: bigint("total_transactions", { mode: "number" }).notNull().default(0),
  totalAccounts: integer("total_accounts").notNull().default(0),
  marketCap: text("market_cap").notNull().default("0"),
  circulatingSupply: text("circulating_supply").notNull().default("0"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// Insert Schemas and Types
// ============================================

export const insertBlockSchema = createInsertSchema(blocks).omit({ id: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true });
export const insertAccountSchema = createInsertSchema(accounts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertValidatorSchema = createInsertSchema(validators).omit({ id: true, joinedAt: true });
export const insertSmartContractSchema = createInsertSchema(smartContracts).omit({ id: true, deployedAt: true });
export const insertAiModelSchema = createInsertSchema(aiModels).omit({ id: true, lastUsed: true });
export const insertShardSchema = createInsertSchema(shards).omit({ id: true });
export const insertNetworkStatsSchema = createInsertSchema(networkStats).omit({ id: true, updatedAt: true });

// Types
export type Block = typeof blocks.$inferSelect;
export type InsertBlock = z.infer<typeof insertBlockSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;

export type Validator = typeof validators.$inferSelect;
export type InsertValidator = z.infer<typeof insertValidatorSchema>;

export type SmartContract = typeof smartContracts.$inferSelect;
export type InsertSmartContract = z.infer<typeof insertSmartContractSchema>;

export type AiModel = typeof aiModels.$inferSelect;
export type InsertAiModel = z.infer<typeof insertAiModelSchema>;

export type Shard = typeof shards.$inferSelect;
export type InsertShard = z.infer<typeof insertShardSchema>;

export type NetworkStats = typeof networkStats.$inferSelect;
export type InsertNetworkStats = z.infer<typeof insertNetworkStatsSchema>;

// ============================================
// Additional Types for Frontend
// ============================================

export interface NetworkMetrics {
  tps: number;
  blockHeight: number;
  activeValidators: number;
  totalTransactions: number;
  avgBlockTime: number;
}

export interface ChartDataPoint {
  timestamp: number;
  value: number;
  label?: string;
}

export interface AIModelMetrics {
  modelName: string;
  status: "active" | "inactive" | "error";
  requestCount: number;
  successRate: number;
  avgResponseTime: number;
  cost: string;
  cacheHitRate: number;
}

export interface ShardMetrics {
  shardId: number;
  name: string;
  load: number;
  tps: number;
  blockHeight: number;
  status: "active" | "syncing" | "error";
}
