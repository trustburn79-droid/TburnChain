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
  executionClass: text("execution_class").notNull().default("standard"), // standard, parallel, cross_shard
  latencyNs: bigint("latency_ns", { mode: "number" }).notNull().default(0), // nanoseconds
  parallelBatchId: varchar("parallel_batch_id"), // for parallel execution tracking
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
  executionClass: text("execution_class").notNull().default("standard"), // standard, parallel, cross_shard
  latencyNs: bigint("latency_ns", { mode: "number" }).notNull().default(0), // nanoseconds
  parallelBatchId: varchar("parallel_batch_id"), // for parallel execution tracking
  crossShardMessageId: varchar("cross_shard_message_id"), // if cross-shard transaction
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
  commission: integer("commission").notNull().default(500), // basis points (500 = 5.00%)
  status: text("status").notNull().default("active"), // active, inactive, jailed
  uptime: integer("uptime").notNull().default(10000), // basis points (10000 = 100.00%)
  totalBlocks: integer("total_blocks").notNull().default(0),
  votingPower: text("voting_power").notNull().default("0"),
  apy: integer("apy").notNull().default(0), // basis points (1250 = 12.50%)
  delegators: integer("delegators").notNull().default(0),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  missedBlocks: integer("missed_blocks").notNull().default(0),
  avgBlockTime: integer("avg_block_time").notNull().default(0), // milliseconds
  rewardEarned: text("reward_earned").notNull().default("0"),
  slashCount: integer("slash_count").notNull().default(0),
  lastActiveAt: timestamp("last_active_at"),
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
  band: text("band").notNull().default("operational"), // strategic, tactical, operational
  status: text("status").notNull().default("active"), // active, inactive, error
  requestCount: integer("request_count").notNull().default(0),
  successCount: integer("success_count").notNull().default(0),
  failureCount: integer("failure_count").notNull().default(0),
  avgResponseTime: integer("avg_response_time").notNull().default(0), // ms
  totalCost: text("total_cost").notNull().default("0"),
  lastUsed: timestamp("last_used"),
  cacheHitRate: integer("cache_hit_rate").notNull().default(0), // basis points (7500 = 75.00%)
  accuracy: integer("accuracy").notNull().default(0), // basis points (9680 = 96.80%)
  uptime: integer("uptime").notNull().default(10000), // basis points (9990 = 99.90%)
});

// AI Decisions (Triple-Band AI tracking)
export const aiDecisions = pgTable("ai_decisions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  band: text("band").notNull(), // strategic, tactical, operational
  modelName: text("model_name").notNull(),
  decision: text("decision").notNull(),
  impact: text("impact").notNull(), // high, medium, low
  category: text("category").notNull(), // scaling, optimization, validation, etc.
  shardId: integer("shard_id"),
  validatorAddress: text("validator_address"),
  status: text("status").notNull().default("executed"), // pending, executed, failed
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  executedAt: timestamp("executed_at"),
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
  peakTps: integer("peak_tps").notNull().default(0),
  avgBlockTime: integer("avg_block_time").notNull().default(0), // milliseconds
  crossShardTxCount: integer("cross_shard_tx_count").notNull().default(0),
  stateSize: text("state_size").notNull().default("0"), // bytes
  lastSyncedAt: timestamp("last_synced_at"),
});

// Network Stats (singleton table for current network state)
export const networkStats = pgTable("network_stats", {
  id: varchar("id").primaryKey().default("singleton"),
  currentBlockHeight: bigint("current_block_height", { mode: "number" }).notNull().default(0),
  tps: integer("tps").notNull().default(0),
  peakTps: integer("peak_tps").notNull().default(0),
  avgBlockTime: integer("avg_block_time").notNull().default(0), // milliseconds
  blockTimeP99: integer("block_time_p99").notNull().default(0), // milliseconds
  slaUptime: integer("sla_uptime").notNull().default(9990), // basis points (9990 = 99.90%)
  latency: integer("latency").notNull().default(0), // milliseconds
  latencyP99: integer("latency_p99").notNull().default(0), // milliseconds
  activeValidators: integer("active_validators").notNull().default(0),
  totalValidators: integer("total_validators").notNull().default(0),
  totalTransactions: bigint("total_transactions", { mode: "number" }).notNull().default(0),
  totalAccounts: integer("total_accounts").notNull().default(0),
  marketCap: text("market_cap").notNull().default("0"),
  circulatingSupply: text("circulating_supply").notNull().default("0"),
  successRate: integer("success_rate").notNull().default(9970), // basis points (9970 = 99.70%)
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Consensus Rounds
export const consensusRounds = pgTable("consensus_rounds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  blockHeight: bigint("block_height", { mode: "number" }).notNull().unique(),
  proposerAddress: text("proposer_address").notNull(),
  currentPhase: integer("current_phase").notNull().default(1), // 1-5
  prevoteCount: integer("prevote_count").notNull().default(0),
  precommitCount: integer("precommit_count").notNull().default(0),
  totalValidators: integer("total_validators").notNull().default(0),
  requiredQuorum: integer("required_quorum").notNull().default(0),
  avgBlockTimeMs: integer("avg_block_time_ms").notNull().default(0),
  status: text("status").notNull().default("in_progress"), // in_progress, completed, failed
  startTime: bigint("start_time", { mode: "number" }).notNull(), // Unix timestamp in ms
  completedTime: bigint("completed_time", { mode: "number" }), // Unix timestamp in ms
  phasesJson: text("phases_json").notNull(), // Stores ConsensusPhase[] as JSON
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// API Keys (for secure API access management)
export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  label: text("label").notNull(), // user-friendly name for the key
  hashedKey: text("hashed_key").notNull().unique(), // bcrypt hashed API key
  userId: varchar("user_id"), // nullable - for future multi-user support
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastUsedAt: timestamp("last_used_at"),
  revokedAt: timestamp("revoked_at"), // null if active, timestamp if revoked
});

// Cross-Shard Messages (for cross-shard transaction tracking)
export const crossShardMessages = pgTable("cross_shard_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  messageId: text("message_id").notNull().unique(), // unique identifier for the message
  fromShardId: integer("from_shard_id").notNull(),
  toShardId: integer("to_shard_id").notNull(),
  transactionHash: text("transaction_hash").notNull(),
  status: text("status").notNull().default("pending"), // pending, confirmed, failed
  messageType: text("message_type").notNull(), // transfer, contract_call, state_sync
  payload: jsonb("payload").notNull(), // message payload
  sentAt: timestamp("sent_at").notNull().defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
  failedAt: timestamp("failed_at"),
  retryCount: integer("retry_count").notNull().default(0),
  gasUsed: bigint("gas_used", { mode: "number" }).notNull().default(0),
});

// Wallet Balances (for tracking user wallet balances and history)
export const walletBalances = pgTable("wallet_balances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  address: text("address").notNull().unique(),
  balance: text("balance").notNull().default("0"),
  stakedBalance: text("staked_balance").notNull().default("0"),
  unstakedBalance: text("unstaked_balance").notNull().default("0"),
  rewardsEarned: text("rewards_earned").notNull().default("0"),
  transactionCount: integer("transaction_count").notNull().default(0),
  lastTransactionAt: timestamp("last_transaction_at"),
  firstSeenAt: timestamp("first_seen_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// Insert Schemas and Types
// ============================================

export const insertBlockSchema = createInsertSchema(blocks).omit({ id: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true });
export const insertAccountSchema = createInsertSchema(accounts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertValidatorSchema = createInsertSchema(validators).omit({ id: true, joinedAt: true, lastActiveAt: true });
export const insertSmartContractSchema = createInsertSchema(smartContracts).omit({ id: true, deployedAt: true });
export const insertAiModelSchema = createInsertSchema(aiModels).omit({ id: true, lastUsed: true });
export const insertAiDecisionSchema = createInsertSchema(aiDecisions).omit({ id: true, createdAt: true, executedAt: true });
export const insertShardSchema = createInsertSchema(shards).omit({ id: true, lastSyncedAt: true });
export const insertNetworkStatsSchema = createInsertSchema(networkStats).omit({ id: true, updatedAt: true });
export const insertConsensusRoundSchema = createInsertSchema(consensusRounds).omit({ id: true, createdAt: true });
export const insertApiKeySchema = createInsertSchema(apiKeys).omit({ id: true, createdAt: true, lastUsedAt: true, revokedAt: true });
export const insertCrossShardMessageSchema = createInsertSchema(crossShardMessages).omit({ id: true, sentAt: true, confirmedAt: true, failedAt: true });
export const insertWalletBalanceSchema = createInsertSchema(walletBalances).omit({ id: true, firstSeenAt: true, updatedAt: true, lastTransactionAt: true });

// ============================================
// Select Schemas for WebSocket Validation
// ============================================
// AI Decisions (add read-only fields to insert schema)
export const aiDecisionSelectSchema = insertAiDecisionSchema.extend({
  id: z.string(),
  createdAt: z.string().or(z.date()),
  executedAt: z.string().or(z.date()).optional(),
});

// Cross-Shard Messages (add read-only fields)
export const crossShardMessageSelectSchema = insertCrossShardMessageSchema.extend({
  id: z.string(),
  sentAt: z.string().or(z.date()),
  confirmedAt: z.string().or(z.date()).optional(),
  failedAt: z.string().or(z.date()).optional(),
});

// Wallet Balances (add read-only fields)
export const walletBalanceSelectSchema = insertWalletBalanceSchema.extend({
  id: z.string(),
  firstSeenAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  lastTransactionAt: z.string().or(z.date()).optional(),
});

// Consensus Rounds (add read-only fields)
export const consensusRoundSelectSchema = insertConsensusRoundSchema.extend({
  id: z.string(),
  createdAt: z.string().or(z.date()),
});

// Snapshot schemas (arrays for periodic broadcasts)
export const aiDecisionsSnapshotSchema = z.array(aiDecisionSelectSchema);
export const crossShardMessagesSnapshotSchema = z.array(crossShardMessageSelectSchema);
export const walletBalancesSnapshotSchema = z.array(walletBalanceSelectSchema);
export const consensusRoundsSnapshotSchema = z.array(consensusRoundSelectSchema);

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

export type AiDecision = typeof aiDecisions.$inferSelect;
export type InsertAiDecision = z.infer<typeof insertAiDecisionSchema>;

export type Shard = typeof shards.$inferSelect;
export type InsertShard = z.infer<typeof insertShardSchema>;

export type NetworkStats = typeof networkStats.$inferSelect;
export type InsertNetworkStats = z.infer<typeof insertNetworkStatsSchema>;

export type ConsensusRound = typeof consensusRounds.$inferSelect;
export type InsertConsensusRound = z.infer<typeof insertConsensusRoundSchema>;

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;

export type CrossShardMessage = typeof crossShardMessages.$inferSelect;
export type InsertCrossShardMessage = z.infer<typeof insertCrossShardMessageSchema>;

export type WalletBalance = typeof walletBalances.$inferSelect;
export type InsertWalletBalance = z.infer<typeof insertWalletBalanceSchema>;

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

// ============================================
// Advanced Analytics Types
// ============================================

export interface LatencyBucket {
  range: string;
  count: number;
  percentage: number;
}

export interface TPSHistoryPoint {
  timestamp: number;
  tps: number;
}

export interface ConsensusPhase {
  number: number;
  label: string;
  time: string;
  status: "completed" | "active" | "pending";
}

export interface ConsensusState {
  currentPhase: number;
  phases: ConsensusPhase[];
  proposer: string;
  blockHeight: number;
  prevoteCount: number;
  precommitCount: number;
  totalValidators: number;
  requiredQuorum: number;
  avgBlockTimeMs: number;
  startTime: number;
}
