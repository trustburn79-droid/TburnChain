import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, bigint, boolean, jsonb, timestamp, numeric, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================
// TBURN Blockchain Schema
// ============================================

// Blocks
// Blocks (Multi-Hash Cryptographic System with Finality Tracking)
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
  
  // TBURN v7.0: Multi-Hash Cryptographic System (Purpose-Optimized Hash Selection)
  hashAlgorithm: text("hash_algorithm").notNull().default("blake3"), // blake3, sha3-256, keccak256, sha256d, blake2b
  
  // TBURN v7.1: Block Finality System
  finalityStatus: text("finality_status").notNull().default("finalized"), // pending, verified, finalized, rejected
  finalityConfirmations: integer("finality_confirmations").notNull().default(0), // Number of block confirmations
  verificationCount: integer("verification_count").notNull().default(0), // Number of validators who verified
  requiredVerifications: integer("required_verifications").notNull().default(0), // Quorum requirement (2/3+1)
  finalizedAt: timestamp("finalized_at"), // When block reached finality
  totalBlockReward: text("total_block_reward").notNull().default("0"), // Total reward for this block
  rewardDistributed: boolean("reward_distributed").notNull().default(false), // Whether rewards have been distributed
});

// Transactions
// Transactions (Multi-Hash Cryptographic System with Signature Verification)
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
  
  // TBURN v7.0: Multi-Hash Cryptographic System (Purpose-Optimized Hash Selection)
  hashAlgorithm: text("hash_algorithm").notNull().default("blake3"), // blake3, sha3-256, keccak256, sha256d, blake2b
  
  // TBURN v7.1: Transaction Signature Verification System
  signature: text("signature"), // ECDSA signature (r, s, v components concatenated)
  signatureVerified: boolean("signature_verified").notNull().default(false), // Has signature been verified
  signatureAlgorithm: text("signature_algorithm").notNull().default("secp256k1"), // secp256k1, ed25519, sphincs+
  publicKey: text("public_key"), // Sender's public key for verification
  verifiedAt: timestamp("verified_at"), // When transaction was verified
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

// Validators (AI-Enhanced Committee BFT with Reputation System)
export const validators = pgTable("validators", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  address: text("address").notNull().unique(),
  name: text("name").notNull(),
  stake: text("stake").notNull(),
  delegatedStake: text("delegated_stake").notNull().default("0"), // Total delegated to this validator
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
  
  // TBURN v7.0: AI-Enhanced Committee BFT (Stake + Reputation + Performance)
  reputationScore: integer("reputation_score").notNull().default(8500), // basis points (8500 = 85.00%)
  performanceScore: integer("performance_score").notNull().default(9000), // basis points
  committeeSelectionCount: integer("committee_selection_count").notNull().default(0),
  aiTrustScore: integer("ai_trust_score").notNull().default(7500), // AI-assessed validator reliability
  behaviorScore: integer("behavior_score").notNull().default(9500), // Network behavior quality
  adaptiveWeight: integer("adaptive_weight").notNull().default(10000), // Dynamic committee weight
});

// ============================================
// TBURN v7.1: Block Verification & Finality System
// ============================================

// Block Verifications (Cross-Check Records from Validators)
export const blockVerifications = pgTable("block_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  blockNumber: bigint("block_number", { mode: "number" }).notNull(),
  blockHash: text("block_hash").notNull(),
  validatorAddress: text("validator_address").notNull(),
  
  // Verification Details
  verificationResult: text("verification_result").notNull().default("valid"), // valid, invalid, abstain
  verificationSignature: text("verification_signature").notNull(), // Validator's signature confirming verification
  stateRootMatch: boolean("state_root_match").notNull().default(true), // Did state root match
  receiptsRootMatch: boolean("receipts_root_match").notNull().default(true), // Did receipts root match
  transactionsValid: boolean("transactions_valid").notNull().default(true), // All transactions verified
  
  // Timing
  verificationTimeMs: integer("verification_time_ms").notNull().default(0), // Time to verify in ms
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Validator Block Rewards (Per-block reward distribution to validators)
export const validatorBlockRewards = pgTable("validator_block_rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  blockNumber: bigint("block_number", { mode: "number" }).notNull(),
  validatorAddress: text("validator_address").notNull(),
  
  // Reward Details
  rewardType: text("reward_type").notNull(), // proposer, verifier, committee
  rewardAmount: text("reward_amount").notNull(), // Amount in Wei
  gasFeesEarned: text("gas_fees_earned").notNull().default("0"), // Portion of gas fees
  
  // Participation
  participationRole: text("participation_role").notNull(), // proposer, prevote, precommit, verifier
  votePower: text("vote_power").notNull().default("0"), // Voting power at time of block
  
  // Distribution Status
  distributed: boolean("distributed").notNull().default(false),
  distributedAt: timestamp("distributed_at"),
  txHash: text("tx_hash"), // Transaction hash of reward distribution
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Block Finality Confirmations (Final state after cross-verification)
export const blockFinalityConfirmations = pgTable("block_finality_confirmations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  blockNumber: bigint("block_number", { mode: "number" }).notNull().unique(),
  blockHash: text("block_hash").notNull(),
  
  // Finality Details
  finalityStatus: text("finality_status").notNull().default("pending"), // pending, confirmed, finalized, rejected
  totalVerifications: integer("total_verifications").notNull().default(0),
  requiredVerifications: integer("required_verifications").notNull(), // 2/3 + 1 quorum
  validVotes: integer("valid_votes").notNull().default(0),
  invalidVotes: integer("invalid_votes").notNull().default(0),
  abstainVotes: integer("abstain_votes").notNull().default(0),
  
  // Reward Summary
  totalRewardsDistributed: text("total_rewards_distributed").notNull().default("0"),
  proposerReward: text("proposer_reward").notNull().default("0"),
  verifierRewardsTotal: text("verifier_rewards_total").notNull().default("0"),
  
  // Timing
  consensusStartAt: timestamp("consensus_start_at").notNull().defaultNow(),
  finalizedAt: timestamp("finalized_at"),
  confirmationLatencyMs: integer("confirmation_latency_ms"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert Schemas for Verification System
export const insertBlockVerificationSchema = createInsertSchema(blockVerifications).omit({
  id: true,
  createdAt: true,
});

export const insertValidatorBlockRewardSchema = createInsertSchema(validatorBlockRewards).omit({
  id: true,
  createdAt: true,
});

export const insertBlockFinalityConfirmationSchema = createInsertSchema(blockFinalityConfirmations).omit({
  id: true,
  createdAt: true,
});

// Types for Verification System
export type BlockVerification = typeof blockVerifications.$inferSelect;
export type InsertBlockVerification = z.infer<typeof insertBlockVerificationSchema>;

export type ValidatorBlockReward = typeof validatorBlockRewards.$inferSelect;
export type InsertValidatorBlockReward = z.infer<typeof insertValidatorBlockRewardSchema>;

export type BlockFinalityConfirmation = typeof blockFinalityConfirmations.$inferSelect;
export type InsertBlockFinalityConfirmation = z.infer<typeof insertBlockFinalityConfirmationSchema>;

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

// AI Model Stats (Triple-Band AI Orchestration with Feedback Learning)
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
  
  // TBURN v7.0: Triple-Band AI with Inter-Model Feedback Learning
  feedbackLearningScore: integer("feedback_learning_score").notNull().default(8000), // Learning effectiveness
  crossBandInteractions: integer("cross_band_interactions").notNull().default(0), // Inter-band communications
  strategicDecisions: integer("strategic_decisions").notNull().default(0), // Long-term decisions made
  tacticalDecisions: integer("tactical_decisions").notNull().default(0), // Mid-term optimizations
  operationalDecisions: integer("operational_decisions").notNull().default(0), // Real-time actions
  modelWeight: integer("model_weight").notNull().default(3333), // Dynamic weight in triple-band (basis points)
  consensusContribution: integer("consensus_contribution").notNull().default(0), // Contributions to consensus decisions
});

// AI Decisions (Triple-Band AI tracking with REAL AI execution)
export const aiDecisions = pgTable("ai_decisions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  band: text("band").notNull(), // strategic, tactical, operational, fallback
  modelName: text("model_name").notNull(),
  provider: text("provider").notNull().default("unknown"), // gemini, anthropic, openai, grok
  decision: text("decision").notNull(),
  impact: text("impact").notNull(), // high, medium, low
  category: text("category").notNull(), // scaling, optimization, validation, etc.
  shardId: integer("shard_id"),
  validatorAddress: text("validator_address"),
  status: text("status").notNull().default("executed"), // pending, executed, failed
  confidence: integer("confidence"), // 0-100 percentage
  executionTime: integer("execution_time"), // execution time in ms
  
  // REAL AI execution fields
  promptText: text("prompt_text"), // Actual prompt sent to AI
  responseText: text("response_text"), // Raw AI response
  tokensUsed: integer("tokens_used").default(0), // Actual tokens consumed
  costUsd: text("cost_usd").default("0"), // Actual cost in USD
  isRealAi: boolean("is_real_ai").notNull().default(true), // True = real AI call, False = fallback/cached
  
  // Blockchain action taken
  actionApplied: text("action_applied"), // Description of blockchain action
  blockchainTxHash: text("blockchain_tx_hash"), // If action resulted in transaction
  
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  executedAt: timestamp("executed_at"),
});

// AI Usage Logs (Detailed per-request tracking for audit)
export const aiUsageLogs = pgTable("ai_usage_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  provider: text("provider").notNull(), // gemini, anthropic, openai, grok
  model: text("model").notNull(), // gpt-4o, claude-sonnet-4-5, etc.
  band: text("band").notNull(), // strategic, tactical, operational, fallback
  requestType: text("request_type").notNull(), // consensus, validation, optimization, security
  
  promptTokens: integer("prompt_tokens").notNull().default(0),
  completionTokens: integer("completion_tokens").notNull().default(0),
  totalTokens: integer("total_tokens").notNull().default(0),
  costUsd: text("cost_usd").notNull().default("0"),
  responseTimeMs: integer("response_time_ms").notNull().default(0),
  
  success: boolean("success").notNull().default(true),
  errorType: text("error_type"), // rate_limit, timeout, api_error, etc.
  errorMessage: text("error_message"),
  
  // Fallback tracking
  wasFailover: boolean("was_failover").notNull().default(false),
  originalProvider: text("original_provider"), // If failover, which provider failed
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// AI Execution Logs (Track actual blockchain actions taken by AI decisions)
export const aiExecutionLogs = pgTable("ai_execution_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  decisionId: varchar("decision_id").notNull(), // Reference to ai_decisions
  executionType: text("execution_type").notNull(), // SHARD_REBALANCE, BLOCK_TIME_ADJUST, TPS_OPTIMIZE, VALIDATOR_SCHEDULE, GOVERNANCE_PREVALIDATION
  
  // Execution status
  status: text("status").notNull().default("pending"), // pending, executing, completed, failed, rolled_back
  confidence: integer("confidence").notNull(), // AI confidence at execution time
  impactLevel: text("impact_level").notNull(), // low, medium, high, critical
  
  // Before/After state for rollback
  beforeState: jsonb("before_state").notNull(),
  afterState: jsonb("after_state"),
  
  // Execution details
  executionTimeMs: integer("execution_time_ms").notNull().default(0),
  blockchainTxHash: text("blockchain_tx_hash"), // Transaction hash if applicable
  
  // Rollback info
  rolledBack: boolean("rolled_back").notNull().default(false),
  rollbackReason: text("rollback_reason"),
  rollbackAt: timestamp("rollback_at"),
  
  // Metrics change
  metricsImprovement: jsonb("metrics_improvement"), // { tps: +15%, blockTime: -10ms, etc. }
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Governance Pre-validations (AI 85-90% automated governance decisions)
export const governancePrevalidations = pgTable("governance_prevalidations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  proposalId: varchar("proposal_id").notNull(),
  proposalTitle: text("proposal_title").notNull(),
  proposalType: text("proposal_type").notNull(), // parameter_change, treasury_spend, validator_update, protocol_upgrade
  
  // AI Analysis
  aiConfidence: integer("ai_confidence").notNull(), // 0-100
  aiRecommendation: text("ai_recommendation").notNull(), // APPROVE, REJECT, MANUAL_REVIEW
  aiReasoning: text("ai_reasoning").notNull(), // Detailed AI explanation
  
  // Risk Assessment
  riskLevel: text("risk_level").notNull(), // low, medium, high, critical
  riskFactors: jsonb("risk_factors"), // Array of identified risks
  economicImpact: jsonb("economic_impact"), // Predicted economic effects
  securityImpact: jsonb("security_impact"), // Security implications
  
  // Auto-decision tracking
  autoDecision: boolean("auto_decision").notNull().default(false), // True if confidence >= 90%
  autoDecisionResult: text("auto_decision_result"), // approved, rejected
  
  // Validator notification
  validatorNotified: boolean("validator_notified").notNull().default(false),
  validatorVoteRequired: boolean("validator_vote_required").notNull().default(true),
  
  // Similar proposals analysis
  similarProposals: jsonb("similar_proposals"), // Historical similar proposals
  
  // Timing
  analysisTimeMs: integer("analysis_time_ms").notNull().default(0),
  provider: text("provider").notNull(), // Which AI provider analyzed
  model: text("model").notNull(), // Which model was used
  tokensUsed: integer("tokens_used").notNull().default(0),
  costUsd: text("cost_usd").notNull().default("0"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  decidedAt: timestamp("decided_at"),
});

// AI Training Jobs (Track model fine-tuning and training progress)
export const aiTrainingJobs = pgTable("ai_training_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  model: text("model").notNull(), // Gemini 3 Pro FT, Claude Sonnet 4.5 FT, etc.
  status: text("status").notNull().default("queued"), // queued, running, paused, completed, cancelled, failed
  progress: integer("progress").notNull().default(0), // 0-100
  eta: text("eta"), // Estimated time remaining
  dataPoints: text("data_points").notNull().default("0"), // e.g., "1.2M"
  
  // Training configuration
  epochs: integer("epochs").notNull().default(10),
  currentEpoch: integer("current_epoch").notNull().default(0),
  learningRate: real("learning_rate").notNull().default(0.001),
  batchSize: integer("batch_size").notNull().default(32),
  
  // Training metrics
  accuracy: real("accuracy").notNull().default(0), // Current accuracy
  loss: real("loss").notNull().default(0), // Current loss
  validationAccuracy: real("validation_accuracy").notNull().default(0),
  validationLoss: real("validation_loss").notNull().default(0),
  
  // Dataset info
  datasetName: text("dataset_name"),
  datasetSize: text("dataset_size"), // e.g., "8.5 GB"
  
  // Error handling
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").notNull().default(0),
  
  // Timing
  startedAt: timestamp("started_at"),
  pausedAt: timestamp("paused_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// AI Parameters (Store AI configuration parameters persistently)
export const aiParameters = pgTable("ai_parameters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  configName: text("config_name").notNull().default("default"), // Configuration profile name
  isActive: boolean("is_active").notNull().default(true),
  
  // Model configurations (JSON array)
  modelConfigs: jsonb("model_configs").notNull().default([]),
  
  // Decision parameters (JSON array)
  decisionParams: jsonb("decision_params").notNull().default([]),
  
  // Layer weights
  strategicWeight: integer("strategic_weight").notNull().default(50),
  tacticalWeight: integer("tactical_weight").notNull().default(30),
  operationalWeight: integer("operational_weight").notNull().default(20),
  
  // Thresholds
  autoExecuteThreshold: integer("auto_execute_threshold").notNull().default(70),
  humanReviewThreshold: integer("human_review_threshold").notNull().default(50),
  rejectionThreshold: integer("rejection_threshold").notNull().default(30),
  
  // Rate limits
  strategicPerHour: integer("strategic_per_hour").notNull().default(10),
  tacticalPerMinute: integer("tactical_per_minute").notNull().default(100),
  operationalPerSecond: integer("operational_per_second").notNull().default(1000),
  
  // Emergency settings
  allowEmergencyActions: boolean("allow_emergency_actions").notNull().default(true),
  circuitBreaker: boolean("circuit_breaker").notNull().default(true),
  
  // Advanced config
  consensusTimeout: integer("consensus_timeout").notNull().default(5000),
  retryAttempts: integer("retry_attempts").notNull().default(3),
  backoffMultiplier: real("backoff_multiplier").notNull().default(1.5),
  cacheTtl: integer("cache_ttl").notNull().default(300),
  
  // Metadata
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// AI Training Metrics (Track epoch-by-epoch training progress)
export const aiTrainingMetrics = pgTable("ai_training_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull(),
  epoch: integer("epoch").notNull(),
  
  // Core metrics
  trainLoss: real("train_loss").notNull().default(0),
  validationLoss: real("validation_loss").notNull().default(0),
  trainAccuracy: real("train_accuracy").notNull().default(0),
  validationAccuracy: real("validation_accuracy").notNull().default(0),
  
  // Advanced metrics
  learningRate: real("learning_rate").notNull().default(0),
  gradientNorm: real("gradient_norm").notNull().default(0),
  throughputSamplesPerSec: integer("throughput_samples_per_sec").notNull().default(0),
  gpuMemoryUsedMb: integer("gpu_memory_used_mb").notNull().default(0),
  
  // Performance
  epochDurationMs: integer("epoch_duration_ms").notNull().default(0),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// AI Model Deployments (Track deployed model versions)
export const aiModelDeployments = pgTable("ai_model_deployments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  modelName: text("model_name").notNull(),
  version: text("version").notNull(),
  status: text("status").notNull().default("pending"), // pending, deploying, active, inactive, failed, rollback
  environment: text("environment").notNull().default("production"), // development, staging, production
  
  // Source info
  trainingJobId: varchar("training_job_id"),
  baseModel: text("base_model").notNull(), // Gemini 3 Pro, Claude Sonnet 4.5, etc.
  
  // Performance metrics
  accuracy: real("accuracy").notNull().default(0),
  latencyMs: integer("latency_ms").notNull().default(0),
  throughputRps: integer("throughput_rps").notNull().default(0),
  
  // Resource usage
  memoryMb: integer("memory_mb").notNull().default(0),
  gpuUtilization: integer("gpu_utilization").notNull().default(0), // percentage
  
  // Health
  healthScore: integer("health_score").notNull().default(100), // 0-100
  requestCount: bigint("request_count", { mode: "number" }).notNull().default(0),
  errorCount: integer("error_count").notNull().default(0),
  
  // A/B Testing
  trafficPercent: integer("traffic_percent").notNull().default(100), // 0-100
  isCanary: boolean("is_canary").notNull().default(false),
  
  // Rollback support
  previousVersionId: varchar("previous_version_id"),
  rollbackCount: integer("rollback_count").notNull().default(0),
  
  // Metadata
  deployedBy: text("deployed_by"),
  deployedAt: timestamp("deployed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// AI Training Datasets (Manage training data)
export const aiTrainingDatasets = pgTable("ai_training_datasets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  
  // Data info
  records: bigint("records", { mode: "number" }).notNull().default(0),
  sizeBytes: bigint("size_bytes", { mode: "number" }).notNull().default(0),
  format: text("format").notNull().default("jsonl"), // jsonl, csv, parquet
  
  // Quality metrics
  qualityScore: integer("quality_score").notNull().default(0), // 0-100
  completeness: integer("completeness").notNull().default(0), // 0-100
  consistency: integer("consistency").notNull().default(0), // 0-100
  duplicateRate: real("duplicate_rate").notNull().default(0), // percentage
  
  // Schema info
  columns: jsonb("columns"), // Column definitions
  sampleData: jsonb("sample_data"), // Sample records
  
  // Usage tracking
  usedInJobs: integer("used_in_jobs").notNull().default(0),
  lastUsedAt: timestamp("last_used_at"),
  
  // Versioning
  version: integer("version").notNull().default(1),
  parentDatasetId: varchar("parent_dataset_id"),
  
  // Metadata
  tags: text("tags").array(),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// AI Training Logs (Detailed training event logs)
export const aiTrainingLogs = pgTable("ai_training_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull(),
  level: text("level").notNull().default("info"), // debug, info, warning, error, critical
  message: text("message").notNull(),
  details: jsonb("details"),
  
  // Context
  epoch: integer("epoch"),
  step: integer("step"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Shard Information
// Shards (Dynamic AI-Driven Sharding with ML Optimization)
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
  
  // TBURN v7.0: Dynamic AI-Driven Sharding (ML-Based Optimization)
  mlOptimizationScore: integer("ml_optimization_score").notNull().default(8500), // basis points
  predictedLoad: integer("predicted_load").notNull().default(0), // AI-predicted load percentage
  rebalanceCount: integer("rebalance_count").notNull().default(0), // AI-triggered rebalances
  aiRecommendation: text("ai_recommendation").notNull().default("stable"), // stable, split, merge, rebalance
  profilingScore: integer("profiling_score").notNull().default(9000), // Real-time profiling effectiveness
  capacityUtilization: integer("capacity_utilization").notNull().default(5000), // basis points (50%)
});

// Network Stats (singleton table for current network state)
// Network Stats (Predictive Self-Healing System with Multi-Algorithm Monitoring)
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
  
  // TBURN v7.0: Predictive Self-Healing System (4 Prediction Algorithms)
  trendAnalysisScore: integer("trend_analysis_score").notNull().default(8500), // basis points
  anomalyDetectionScore: integer("anomaly_detection_score").notNull().default(9200), // basis points
  patternMatchingScore: integer("pattern_matching_score").notNull().default(8800), // basis points
  timeseriesScore: integer("timeseries_score").notNull().default(9000), // basis points
  healingEventsCount: integer("healing_events_count").notNull().default(0), // Auto-recovery count
  anomaliesDetected: integer("anomalies_detected").notNull().default(0), // Detected anomalies
  predictedFailureRisk: integer("predicted_failure_risk").notNull().default(500), // basis points (5%)
  selfHealingStatus: text("self_healing_status").notNull().default("healthy"), // healthy, monitoring, healing, critical
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

// API Keys (for secure API access management - Enterprise Grade)
export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  label: text("label").notNull(), // user-friendly name for the key
  description: text("description"), // detailed description of key purpose
  hashedKey: text("hashed_key").notNull().unique(), // bcrypt hashed API key
  keyPrefix: text("key_prefix").notNull().default(""), // first 8 chars for identification
  userId: varchar("user_id"), // nullable - for future multi-user support
  
  // Enterprise Features
  environment: text("environment").notNull().default("production"), // production, development, test
  scopes: text("scopes").array().notNull().default(sql`ARRAY['read']::text[]`), // read, write, admin, staking, trading, etc.
  expiresAt: timestamp("expires_at"), // null = never expires
  
  // Rate Limiting
  rateLimitPerMinute: integer("rate_limit_per_minute").notNull().default(60), // requests per minute
  rateLimitPerHour: integer("rate_limit_per_hour").notNull().default(1000), // requests per hour
  rateLimitPerDay: integer("rate_limit_per_day").notNull().default(10000), // requests per day
  
  // IP Restrictions
  ipWhitelist: text("ip_whitelist").array().default(sql`ARRAY[]::text[]`), // empty = all IPs allowed
  allowedOrigins: text("allowed_origins").array().default(sql`ARRAY[]::text[]`), // CORS origins
  
  // Usage Statistics
  totalRequests: bigint("total_requests", { mode: "number" }).notNull().default(0),
  requestsToday: integer("requests_today").notNull().default(0),
  requestsThisMonth: integer("requests_this_month").notNull().default(0),
  lastErrorAt: timestamp("last_error_at"),
  errorCount: integer("error_count").notNull().default(0),
  
  // Security & Audit
  isActive: boolean("is_active").notNull().default(true),
  requiresMfa: boolean("requires_mfa").notNull().default(false),
  lastRotatedAt: timestamp("last_rotated_at"),
  rotationCount: integer("rotation_count").notNull().default(0),
  rotationScheduleDays: integer("rotation_schedule_days"), // null = no auto-rotation
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  lastUsedAt: timestamp("last_used_at"),
  revokedAt: timestamp("revoked_at"), // null if active, timestamp if revoked
  revokedBy: varchar("revoked_by"), // who revoked the key
  revokeReason: text("revoke_reason"), // why the key was revoked
});

// API Key Activity Logs (for audit trail and analytics)
export const apiKeyLogs = pgTable("api_key_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  apiKeyId: varchar("api_key_id").notNull(), // reference to api_keys.id
  
  // Action Type (created, updated, rotated, revoked, used)
  action: text("action").notNull().default("used"),
  
  // Request Details (for API usage logs)
  endpoint: text("endpoint"), // API endpoint accessed
  method: text("method"), // HTTP method (GET, POST, etc.)
  statusCode: integer("status_code"), // HTTP response status
  responseTimeMs: integer("response_time_ms").default(0),
  
  // Client Information
  ipAddress: text("ip_address"), // client IP
  userAgent: text("user_agent"), // client user agent
  origin: text("origin"), // request origin
  
  // Additional Context
  details: jsonb("details"), // action-specific details (for created, updated, etc.)
  requestBody: jsonb("request_body"), // sanitized request body (no sensitive data)
  errorMessage: text("error_message"), // error message if failed
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Cross-Shard Messages (for cross-shard transaction tracking)
// Cross-Shard Messages (Hybrid Message Routing Protocol with Reputation)
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
  
  // TBURN v7.0: Hybrid Message Routing Protocol (Reputation-based P2P Routing)
  routingPriority: integer("routing_priority").notNull().default(5), // 1-10, reputation-based
  peerReputation: integer("peer_reputation").notNull().default(8000), // basis points
  networkQuality: integer("network_quality").notNull().default(9000), // basis points (peer connection quality)
  routeOptimization: text("route_optimization").notNull().default("balanced"), // speed, reputation, cost
});

// Wallet Balances (for tracking user wallet balances and history)
export const walletBalances = pgTable("wallet_balances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  address: text("address").notNull().unique(),
  walletName: text("wallet_name"),
  ownerId: varchar("owner_id"),
  balance: text("balance").notNull().default("0"),
  stakedBalance: text("staked_balance").notNull().default("0"),
  unstakedBalance: text("unstaked_balance").notNull().default("0"),
  rewardsEarned: text("rewards_earned").notNull().default("0"),
  transactionCount: integer("transaction_count").notNull().default(0),
  lastTransactionAt: timestamp("last_transaction_at"),
  firstSeenAt: timestamp("first_seen_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Delegations table - tracks stake delegations to validators
export const delegations = pgTable("delegations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  delegatorAddress: text("delegator_address").notNull(),
  validatorAddress: text("validator_address").notNull(),
  amount: text("amount").notNull(), // Wei amount as string
  shares: text("shares").notNull(), // Delegation shares
  rewardsClaimed: text("rewards_claimed").notNull().default("0"),
  delegatedAt: timestamp("delegated_at").notNull().defaultNow(),
  unbondingEndTime: timestamp("unbonding_end_time"),
  status: text("status").notNull().default("bonded"), // bonded, unbonding, unbonded
});

// Validator Votes table - records individual validator votes
export const validatorVotes = pgTable("validator_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roundNumber: bigint("round_number", { mode: "number" }).notNull(),
  validatorAddress: text("validator_address").notNull(),
  voteType: text("vote_type").notNull(), // prevote, precommit
  votingPower: text("voting_power").notNull(),
  signature: text("signature").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  decision: text("decision").notNull(), // approve, reject, abstain
  reason: text("reason"),
});

// Committee Snapshots - tracks active committee members per epoch
export const committeeSnapshots = pgTable("committee_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  epochNumber: bigint("epoch_number", { mode: "number" }).notNull(),
  validatorAddress: text("validator_address").notNull(),
  votingPower: text("voting_power").notNull(),
  adaptiveWeight: integer("adaptive_weight").notNull(), // basis points
  isLeader: boolean("is_leader").notNull().default(false),
  committeeRole: text("committee_role").notNull().default("member"), // leader, member, backup
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// MEMBER MANAGEMENT SYSTEM
// ============================================

// Members - Core member table
export const members = pgTable("members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountAddress: text("account_address").notNull().unique(),
  publicKey: text("public_key").notNull(),
  
  // Identity Information
  displayName: text("display_name"),
  username: text("username").unique(), // User-chosen username
  legalName: text("legal_name"), // KYC verified name
  entityType: text("entity_type").notNull().default("individual"), // individual, corporation, partnership, dao, foundation, government
  jurisdiction: text("jurisdiction"), // ISO 3166-1 country code
  registrationNumber: text("registration_number"), // business/legal registration
  
  // Contact & Social (plain text for OAuth)
  email: text("email").unique(), // Plain email for OAuth users
  avatarUrl: text("avatar_url"), // Profile picture URL
  walletAddress: text("wallet_address"), // External wallet address if different from accountAddress
  
  // OAuth Integration
  googleId: text("google_id").unique(), // Google OAuth ID
  
  // Member Classification
  memberTier: text("member_tier").notNull().default("basic_user"), // basic_user, delegated_staker, candidate_validator, active_validator, inactive_validator, genesis_validator, enterprise_validator, governance_validator, probation_validator, suspended_validator, slashed_validator
  memberStatus: text("member_status").notNull().default("pending"), // pending, active, inactive, suspended, terminated, blacklisted
  
  // KYC/AML
  kycLevel: text("kyc_level").notNull().default("none"), // none, basic, enhanced, institutional
  kycProvider: text("kyc_provider"),
  kycVerifiedAt: timestamp("kyc_verified_at"),
  kycExpiryDate: timestamp("kyc_expiry_date"),
  amlRiskScore: integer("aml_risk_score").notNull().default(0), // 0-100 (lower is safer)
  sanctionsCheckPassed: boolean("sanctions_check_passed").notNull().default(false),
  pepStatus: boolean("pep_status").notNull().default(false), // Politically Exposed Person
  
  // Contact (encrypted) - for KYC verified users
  encryptedEmail: text("encrypted_email"),
  encryptedPhone: text("encrypted_phone"),
  
  // Authentication
  passwordHash: text("password_hash"), // bcrypt hashed password
  
  // Validator Reference (if member is a validator)
  validatorId: varchar("validator_id"),
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  lastActivityAt: timestamp("last_activity_at"),
});

// Member Profiles - Extended member information
export const memberProfiles = pgTable("member_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memberId: varchar("member_id").notNull().unique(),
  
  // Profile Information
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  website: text("website"),
  twitter: text("twitter"),
  telegram: text("telegram"),
  discord: text("discord"),
  github: text("github"),
  
  // Preferences
  preferredLanguage: text("preferred_language").notNull().default("en"), // ISO 639-1
  preferredCurrency: text("preferred_currency").notNull().default("USD"), // ISO 4217
  timezone: text("timezone").notNull().default("UTC"), // IANA timezone
  
  // Notification Settings
  emailNotifications: boolean("email_notifications").notNull().default(true),
  smsNotifications: boolean("sms_notifications").notNull().default(false),
  pushNotifications: boolean("push_notifications").notNull().default(true),
  
  // Referral
  referralCode: text("referral_code").unique(),
  referredBy: text("referred_by"), // member address who referred
  referralCount: integer("referral_count").notNull().default(0),
  referralRewardsEarned: text("referral_rewards_earned").notNull().default("0"),
  
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Member Staking Positions
export const memberStakingPositions = pgTable("member_staking_positions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memberId: varchar("member_id").notNull(),
  stakingType: text("staking_type").notNull(), // self_validation, delegation, liquid_staking
  validatorAddress: text("validator_address"), // if delegated staking
  
  amount: text("amount").notNull(),
  shares: text("shares").notNull().default("0"),
  stakedAt: timestamp("staked_at").notNull().defaultNow(),
  lockPeriod: integer("lock_period").notNull().default(0), // days
  unlockAt: timestamp("unlock_at"),
  
  autoCompound: boolean("auto_compound").notNull().default(false),
  tierBonus: integer("tier_bonus").notNull().default(0), // basis points
  
  status: text("status").notNull().default("active"), // active, unbonding, unbonded, slashed
  
  // Rewards
  accumulatedRewards: text("accumulated_rewards").notNull().default("0"),
  claimedRewards: text("claimed_rewards").notNull().default("0"),
  lastClaimAt: timestamp("last_claim_at"),
});

// Member Governance Profile
export const memberGovernanceProfiles = pgTable("member_governance_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memberId: varchar("member_id").notNull().unique(),
  
  // Voting Power
  votingPower: text("voting_power").notNull().default("0"),
  delegatedVotingPower: text("delegated_voting_power").notNull().default("0"),
  receivedVotingPower: text("received_voting_power").notNull().default("0"), // VP received from delegators
  
  // Proposal Activity
  proposalsCreated: integer("proposals_created").notNull().default(0),
  proposalsPassed: integer("proposals_passed").notNull().default(0),
  proposalsRejected: integer("proposals_rejected").notNull().default(0),
  proposalsVoted: integer("proposals_voted").notNull().default(0), // Total proposals voted on
  
  // Voting Activity
  totalVotesCast: integer("total_votes_cast").notNull().default(0),
  votesCast: integer("votes_cast").notNull().default(0), // Alias for compatibility
  votesDelegated: integer("votes_delegated").notNull().default(0), // Votes delegated to others
  votesFor: integer("votes_for").notNull().default(0),
  votesAgainst: integer("votes_against").notNull().default(0),
  votesAbstain: integer("votes_abstain").notNull().default(0),
  votingParticipationRate: integer("voting_participation_rate").notNull().default(0), // basis points
  participationRate: integer("participation_rate").notNull().default(0), // Alias for compatibility (basis points)
  proposalSuccessRate: integer("proposal_success_rate").notNull().default(0), // basis points
  votingConsistency: integer("voting_consistency").notNull().default(0), // basis points
  
  // Delegation
  delegatedTo: text("delegated_to"), // member address if voting power is delegated
  delegatedFrom: jsonb("delegated_from").notNull().default([]), // array of addresses who delegated to this member
  activeDelegations: integer("active_delegations").notNull().default(0),
  receivedDelegations: integer("received_delegations").notNull().default(0),
  maxDelegationsAllowed: integer("max_delegations_allowed").notNull().default(100),
  
  // Organization Membership
  daoMemberships: jsonb("dao_memberships").notNull().default([]), // DAOs member belongs to
  committeePositions: jsonb("committee_positions").notNull().default([]), // Committee positions held
  
  // Reputation
  reputationScore: integer("reputation_score").notNull().default(5000), // basis points
  governanceScore: integer("governance_score").notNull().default(5000), // basis points
  influenceScore: integer("influence_score").notNull().default(0), // basis points
  contributionLevel: text("contribution_level").notNull().default("observer"), // observer, participant, contributor, leader
  
  lastVoteAt: timestamp("last_vote_at"),
  lastProposalAt: timestamp("last_proposal_at"),
});

// Member Financial Profile
export const memberFinancialProfiles = pgTable("member_financial_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memberId: varchar("member_id").notNull().unique(),
  
  // Balances
  totalBalance: text("total_balance").notNull().default("0"),
  availableBalance: text("available_balance").notNull().default("0"),
  lockedBalance: text("locked_balance").notNull().default("0"),
  stakedBalance: text("staked_balance").notNull().default("0"),
  
  // Transaction Statistics
  totalTransactions: bigint("total_transactions", { mode: "number" }).notNull().default(0),
  totalSent: text("total_sent").notNull().default("0"),
  totalReceived: text("total_received").notNull().default("0"),
  totalFeesPaid: text("total_fees_paid").notNull().default("0"),
  
  // Rewards Statistics
  validatorRewards: text("validator_rewards").notNull().default("0"),
  stakingRewards: text("staking_rewards").notNull().default("0"),
  delegationRewards: text("delegation_rewards").notNull().default("0"),
  referralRewards: text("referral_rewards").notNull().default("0"),
  
  // Slashing
  totalSlashed: text("total_slashed").notNull().default("0"),
  slashCount: integer("slash_count").notNull().default(0),
  
  // Tax Information
  taxReportingEnabled: boolean("tax_reporting_enabled").notNull().default(false),
  taxJurisdiction: text("tax_jurisdiction"),
  
  firstTransactionAt: timestamp("first_transaction_at"),
  lastTransactionAt: timestamp("last_transaction_at"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Member Security Profile
export const memberSecurityProfiles = pgTable("member_security_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memberId: varchar("member_id").notNull().unique(),
  
  // Authentication - Two Factor
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  twoFactorMethod: text("two_factor_method"), // totp, sms, email, hardware
  twoFactorBackupCodes: jsonb("two_factor_backup_codes").notNull().default([]),
  
  // Authentication - Other
  securityKeys: jsonb("security_keys").notNull().default([]), // Hardware security keys
  passkeyEnabled: boolean("passkey_enabled").notNull().default(false),
  multiSigEnabled: boolean("multi_sig_enabled").notNull().default(false),
  requiredConfirmations: integer("required_confirmations").notNull().default(1),
  
  // Session Management
  activeSessions: integer("active_sessions").notNull().default(0),
  maxSessions: integer("max_sessions").notNull().default(5),
  sessionTimeout: integer("session_timeout").notNull().default(3600), // seconds
  
  // Access Control
  ipWhitelist: jsonb("ip_whitelist").notNull().default([]), // array of allowed IPs
  ipBlacklist: jsonb("ip_blacklist").notNull().default([]), // array of blocked IPs
  allowedRegions: jsonb("allowed_regions").notNull().default([]), // array of ISO country codes
  countryRestrictions: jsonb("country_restrictions").notNull().default([]), // blocked countries
  maxSessionDuration: integer("max_session_duration").notNull().default(86400), // seconds
  
  // Security Events
  failedLoginAttempts: integer("failed_login_attempts").notNull().default(0),
  lastFailedLogin: timestamp("last_failed_login"),
  lastSuccessfulLogin: timestamp("last_successful_login"),
  lastPasswordChange: timestamp("last_password_change"),
  lastKeyRotation: timestamp("last_key_rotation"),
  nextKeyRotationDue: timestamp("next_key_rotation_due"),
  
  // Risk Management
  riskScore: integer("risk_score").notNull().default(0), // 0-100 (higher is riskier)
  fraudScore: integer("fraud_score").notNull().default(0), // 0-100
  suspiciousActivityCount: integer("suspicious_activity_count").notNull().default(0),
  lastRiskAssessment: timestamp("last_risk_assessment").notNull().defaultNow(),
  
  // Account Recovery
  recoveryEmail: text("recovery_email"),
  recoveryPhone: text("recovery_phone"),
  recoveryQuestions: jsonb("recovery_questions").notNull().default([]),
  
  // Account Lock
  accountLocked: boolean("account_locked").notNull().default(false),
  lockReason: text("lock_reason"),
  lockedAt: timestamp("locked_at"),
  
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Member Performance Metrics
export const memberPerformanceMetrics = pgTable("member_performance_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memberId: varchar("member_id").notNull(),
  validatorAddress: text("validator_address"), // if member is a validator
  
  // Real-time Metrics
  currentUptime: integer("current_uptime").notNull().default(0), // seconds
  currentTps: integer("current_tps").notNull().default(0),
  currentLatencyMs: integer("current_latency_ms").notNull().default(0),
  
  // SLA Compliance
  slaComplianceRate: integer("sla_compliance_rate").notNull().default(0), // basis points
  downtimeIncidents: integer("downtime_incidents").notNull().default(0),
  
  // Performance Grade
  performanceGrade: text("performance_grade").notNull().default("B"), // S, A, B, C, D, F
  performanceScore: integer("performance_score").notNull().default(5000), // 0-10000
  performanceRank: integer("performance_rank"), // overall rank among validators
  
  // Activity Tracking
  lastLoginAt: timestamp("last_login_at"),
  
  metricsUpdatedAt: timestamp("metrics_updated_at").notNull().defaultNow(),
});

// Member Slash Events
export const memberSlashEvents = pgTable("member_slash_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memberId: varchar("member_id").notNull(),
  validatorAddress: text("validator_address"),
  
  slashType: text("slash_type").notNull(), // double_sign, downtime, invalid_block, consensus_violation, security_breach
  amount: text("amount").notNull(),
  reason: text("reason").notNull(),
  evidenceHash: text("evidence_hash"),
  
  appealStatus: text("appeal_status").notNull().default("none"), // none, pending, approved, rejected
  appealDeadline: timestamp("appeal_deadline"),
  
  occurredAt: timestamp("occurred_at").notNull().defaultNow(),
});

// Member Audit Logs
export const memberAuditLogs = pgTable("member_audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memberId: varchar("member_id").notNull(),
  
  action: text("action").notNull(), // login, logout, stake, unstake, vote, propose, withdraw, etc.
  resource: text("resource").notNull(), // what was affected
  resourceId: text("resource_id"), // ID of the affected resource
  
  oldValue: jsonb("old_value"), // previous state
  newValue: jsonb("new_value"), // new state
  
  actor: text("actor").notNull(), // who performed the action (member address or system)
  actorType: text("actor_type").notNull().default("system"), // system, member, admin
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  
  status: text("status").notNull().default("success"), // success, failed
  errorMessage: text("error_message"),
  
  metadata: jsonb("metadata"), // additional context
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Email Verifications - For signup/login email verification
export const emailVerifications = pgTable("email_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  verificationCode: text("verification_code").notNull(),
  type: text("type").notNull(), // signup, login, password_reset
  expiresAt: timestamp("expires_at").notNull(),
  verified: boolean("verified").notNull().default(false),
  attempts: integer("attempts").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schema for email verifications
export const insertEmailVerificationSchema = createInsertSchema(emailVerifications).omit({
  id: true,
  verified: true,
  attempts: true,
  createdAt: true,
});
export type InsertEmailVerification = z.infer<typeof insertEmailVerificationSchema>;
export type EmailVerification = typeof emailVerifications.$inferSelect;

// ============================================
// ADMIN PORTAL - OPERATOR BACK-OFFICE SYSTEM
// ============================================

// Admin Audit Logs - Tracks all operator actions
export const adminAuditLogs = pgTable("admin_audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Operator Info
  operatorId: varchar("operator_id").notNull(), // Who performed the action
  operatorIp: text("operator_ip"),
  operatorUserAgent: text("operator_user_agent"),
  sessionId: varchar("session_id"),
  
  // Action Details
  actionType: text("action_type").notNull(), // member_status_change, kyc_approval, validator_slash, etc.
  actionCategory: text("action_category").notNull(), // member_management, validator_operations, security, compliance
  resource: text("resource").notNull(), // What was affected
  resourceId: text("resource_id"), // ID of the affected resource
  
  // State Changes
  previousState: jsonb("previous_state"),
  newState: jsonb("new_state"),
  
  // Additional Context
  reason: text("reason"), // Why was this action taken
  metadata: jsonb("metadata"), // Additional context
  
  // Status
  status: text("status").notNull().default("success"), // success, failed, pending
  errorMessage: text("error_message"),
  
  // Risk Level
  riskLevel: text("risk_level").notNull().default("low"), // low, medium, high, critical
  requiresReview: boolean("requires_review").notNull().default(false),
  reviewedBy: varchar("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Security Events - Tracks security-related events
export const securityEvents = pgTable("security_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Event Info
  eventType: text("event_type").notNull(), // login_failure, suspicious_activity, ip_blocked, key_rotation, etc.
  severity: text("severity").notNull().default("info"), // info, warning, error, critical
  
  // Target
  targetType: text("target_type").notNull(), // member, validator, operator, system
  targetId: varchar("target_id"),
  targetAddress: text("target_address"),
  
  // Source
  sourceIp: text("source_ip"),
  sourceUserAgent: text("source_user_agent"),
  sourceGeo: jsonb("source_geo"), // country, region, city
  
  // Details
  description: text("description").notNull(),
  evidence: jsonb("evidence"), // Any supporting evidence
  metadata: jsonb("metadata"),
  
  // Resolution
  status: text("status").notNull().default("open"), // open, investigating, resolved, dismissed
  resolvedBy: varchar("resolved_by"),
  resolvedAt: timestamp("resolved_at"),
  resolution: text("resolution"),
  
  // Timestamps
  occurredAt: timestamp("occurred_at").notNull().defaultNow(),
  detectedAt: timestamp("detected_at").notNull().defaultNow(),
});

// Compliance Reports - Regulatory compliance reports
export const complianceReports = pgTable("compliance_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Report Info
  reportType: text("report_type").notNull(), // kyc_summary, aml_report, tax_report, regulatory_filing
  reportPeriod: text("report_period").notNull(), // daily, weekly, monthly, quarterly, annual
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  
  // Jurisdiction
  jurisdiction: text("jurisdiction").notNull(), // ISO 3166-1 country code or "global"
  regulatoryBody: text("regulatory_body"), // SEC, FCA, FSA, etc.
  
  // Content
  summary: jsonb("summary").notNull(), // Key metrics and findings
  details: jsonb("details"), // Detailed breakdown
  attachments: jsonb("attachments").notNull().default([]), // File references
  
  // Status
  status: text("status").notNull().default("draft"), // draft, pending_review, approved, submitted, rejected
  
  // Workflow
  generatedBy: varchar("generated_by").notNull(), // system or operator ID
  reviewedBy: varchar("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  approvedBy: varchar("approved_by"),
  approvedAt: timestamp("approved_at"),
  submittedAt: timestamp("submitted_at"),
  
  // Notes
  reviewNotes: text("review_notes"),
  rejectionReason: text("rejection_reason"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Validator Applications - Validator approval workflow
export const validatorApplications = pgTable("validator_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Applicant Info
  applicantMemberId: varchar("applicant_member_id").notNull(),
  applicantAddress: text("applicant_address").notNull(),
  applicantName: text("applicant_name").notNull(),
  
  // Application Details
  applicationType: text("application_type").notNull(), // new_validator, tier_upgrade, reinstatement
  requestedTier: text("requested_tier").notNull(), // active_validator, enterprise_validator, governance_validator
  proposedCommission: integer("proposed_commission").notNull().default(500), // basis points
  
  // Staking Info
  proposedStake: text("proposed_stake").notNull(),
  stakeSource: text("stake_source").notNull(), // self, delegation, institutional
  
  // Hardware & Network
  hardwareSpecs: jsonb("hardware_specs").notNull(), // cpu, ram, storage, network
  networkEndpoints: jsonb("network_endpoints").notNull(), // p2p, rpc, websocket
  geographicLocation: jsonb("geographic_location").notNull(), // country, region, datacenter
  
  // Documents
  documents: jsonb("documents").notNull().default([]), // KYC docs, hardware proofs, etc.
  
  // Status
  status: text("status").notNull().default("pending"), // pending, under_review, approved, rejected, withdrawn
  
  // Review Workflow
  assignedTo: varchar("assigned_to"), // Operator ID
  reviewNotes: text("review_notes"),
  rejectionReason: text("rejection_reason"),
  
  // Conditions (if approved with conditions)
  approvalConditions: jsonb("approval_conditions"),
  conditionsMet: boolean("conditions_met").notNull().default(false),
  
  // Timestamps
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  reviewStartedAt: timestamp("review_started_at"),
  decidedAt: timestamp("decided_at"),
  decidedBy: varchar("decided_by"),
  
  // Activation (if approved)
  activatedAt: timestamp("activated_at"),
  validatorId: varchar("validator_id"),
});

// Operator Sessions - Admin session management
export const operatorSessions = pgTable("operator_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Session Info
  operatorId: varchar("operator_id").notNull(),
  sessionToken: text("session_token").notNull().unique(), // Hashed session token
  
  // Security
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent"),
  geoLocation: jsonb("geo_location"), // country, region, city
  
  // 2FA
  twoFactorVerified: boolean("two_factor_verified").notNull().default(false),
  twoFactorMethod: text("two_factor_method"), // totp, webauthn, sms
  
  // Session Status
  isActive: boolean("is_active").notNull().default(true),
  lastActivityAt: timestamp("last_activity_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  
  // Termination
  terminatedAt: timestamp("terminated_at"),
  terminationReason: text("termination_reason"), // logout, timeout, forced, suspicious
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// KYC Documents - Member KYC document storage
export const memberDocuments = pgTable("member_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memberId: varchar("member_id").notNull(),
  
  // Document Info
  documentType: text("document_type").notNull(), // id_front, id_back, passport, address_proof, selfie, corporate_registration, etc.
  documentName: text("document_name").notNull(),
  
  // Storage (encrypted references)
  encryptedFileHash: text("encrypted_file_hash").notNull(),
  encryptedStoragePath: text("encrypted_storage_path").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(), // bytes
  
  // Verification
  verificationStatus: text("verification_status").notNull().default("pending"), // pending, verified, rejected, expired
  verifiedBy: varchar("verified_by"),
  verifiedAt: timestamp("verified_at"),
  rejectionReason: text("rejection_reason"),
  
  // Expiry
  expiryDate: timestamp("expiry_date"),
  isExpired: boolean("is_expired").notNull().default(false),
  
  // Audit
  accessLog: jsonb("access_log").notNull().default([]), // Who accessed this document
  
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// Restart Sessions table for tracking server restarts
// ============================================
export const restartSessions = pgTable("restart_sessions", {
  id: varchar("id").primaryKey().default("singleton"), // Singleton pattern - only one row
  isRestarting: boolean("is_restarting").notNull().default(false),
  restartInitiatedAt: timestamp("restart_initiated_at"),
  expectedRestartTime: integer("expected_restart_time").notNull().default(60000),
  lastHealthCheck: timestamp("last_health_check"),
  isHealthy: boolean("is_healthy").notNull().default(false),
  sessionId: varchar("session_id"),
  // Enhanced phase tracking for enterprise-grade monitoring
  phase: varchar("phase").notNull().default("idle"), // idle | initiating | shutting_down | restarting | reconnecting | validating | completed | failed
  phaseStartTime: timestamp("phase_start_time"),
  phaseMessage: text("phase_message"),
  progressPercentage: integer("progress_percentage").notNull().default(0),
  // Phase timestamps for audit trail
  initiatingTime: timestamp("initiating_time"),
  shuttingDownTime: timestamp("shutting_down_time"),
  restartingTime: timestamp("restarting_time"),
  reconnectingTime: timestamp("reconnecting_time"),
  validatingTime: timestamp("validating_time"),
  completedTime: timestamp("completed_time"),
  failedTime: timestamp("failed_time"),
  failureReason: text("failure_reason"),
  // Health metrics post-restart
  postRestartTps: integer("post_restart_tps"),
  postRestartBlockHeight: integer("post_restart_block_height"),
  postRestartValidators: integer("post_restart_validators"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// Enterprise Operator Portal Tables
// ============================================

// Member Notes - Notes/memos for members by operators
export const memberNotes = pgTable("member_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memberId: varchar("member_id").notNull(),
  operatorId: varchar("operator_id").notNull(),
  
  // Note content
  noteType: text("note_type").notNull().default("general"), // general, kyc_review, compliance, risk, support, internal
  title: text("title").notNull(),
  content: text("content").notNull(),
  priority: text("priority").notNull().default("normal"), // low, normal, high, urgent
  
  // Visibility
  isPrivate: boolean("is_private").notNull().default(false), // Only visible to creator
  isPinned: boolean("is_pinned").notNull().default(false),
  
  // Follow-up
  requiresFollowUp: boolean("requires_follow_up").notNull().default(false),
  followUpDate: timestamp("follow_up_date"),
  followUpCompleted: boolean("follow_up_completed").notNull().default(false),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// IP Blocklist - Blocked IP addresses
export const ipBlocklist = pgTable("ip_blocklist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ipAddress: text("ip_address").notNull(),
  ipRange: text("ip_range"), // CIDR notation for range blocks
  
  // Block info
  reason: text("reason").notNull(),
  blockType: text("block_type").notNull().default("permanent"), // temporary, permanent, rate_limit
  severity: text("severity").notNull().default("medium"), // low, medium, high, critical
  
  // Related incident
  relatedSecurityEventId: varchar("related_security_event_id"),
  relatedMemberId: varchar("related_member_id"),
  
  // Expiry for temporary blocks
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  
  // Audit
  blockedBy: varchar("blocked_by").notNull(),
  unblockedBy: varchar("unblocked_by"),
  unblockedAt: timestamp("unblocked_at"),
  unblockReason: text("unblock_reason"),
  
  // Stats
  hitCount: integer("hit_count").notNull().default(0),
  lastHitAt: timestamp("last_hit_at"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// System Health Snapshots - Historical system health metrics
export const systemHealthSnapshots = pgTable("system_health_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Core metrics
  tps: integer("tps").notNull().default(0),
  blockHeight: bigint("block_height", { mode: "number" }).notNull().default(0),
  avgBlockTime: integer("avg_block_time").notNull().default(0), // ms
  latency: integer("latency").notNull().default(0), // ms
  
  // Validator metrics
  activeValidators: integer("active_validators").notNull().default(0),
  totalValidators: integer("total_validators").notNull().default(0),
  validatorUptime: integer("validator_uptime").notNull().default(10000), // basis points
  
  // System resources
  cpuUsage: integer("cpu_usage").notNull().default(0), // percentage
  memoryUsage: integer("memory_usage").notNull().default(0), // percentage
  diskUsage: integer("disk_usage").notNull().default(0), // percentage
  networkBandwidth: integer("network_bandwidth").notNull().default(0), // Mbps
  
  // Network status
  peerCount: integer("peer_count").notNull().default(0),
  pendingTxCount: integer("pending_tx_count").notNull().default(0),
  mempoolSize: integer("mempool_size").notNull().default(0), // bytes
  
  // Health scores
  overallHealthScore: integer("overall_health_score").notNull().default(10000), // basis points
  networkHealthScore: integer("network_health_score").notNull().default(10000),
  consensusHealthScore: integer("consensus_health_score").notNull().default(10000),
  storageHealthScore: integer("storage_health_score").notNull().default(10000),
  
  // Status
  status: text("status").notNull().default("healthy"), // healthy, degraded, critical, maintenance
  alerts: jsonb("alerts").notNull().default([]), // Array of active alerts
  
  snapshotAt: timestamp("snapshot_at").notNull().defaultNow(),
});

// Alert Queue - Priority queue for operator alerts
export const alertQueue = pgTable("alert_queue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Alert info
  alertType: text("alert_type").notNull(), // security, validator, member, system, compliance
  severity: text("severity").notNull().default("medium"), // info, low, medium, high, critical
  title: text("title").notNull(),
  message: text("message").notNull(),
  
  // Source
  sourceType: text("source_type").notNull(), // security_event, validator, member, system
  sourceId: varchar("source_id"),
  
  // Target
  targetType: text("target_type"), // member, validator, shard, system
  targetId: varchar("target_id"),
  
  // Status
  status: text("status").notNull().default("active"), // active, acknowledged, resolved, dismissed
  acknowledgedBy: varchar("acknowledged_by"),
  acknowledgedAt: timestamp("acknowledged_at"),
  resolvedBy: varchar("resolved_by"),
  resolvedAt: timestamp("resolved_at"),
  resolution: text("resolution"),
  
  // Priority
  priority: integer("priority").notNull().default(50), // 1-100, higher = more urgent
  requiresImmediateAction: boolean("requires_immediate_action").notNull().default(false),
  
  // Auto-escalation
  escalationLevel: integer("escalation_level").notNull().default(0),
  escalatedAt: timestamp("escalated_at"),
  autoEscalateAfter: timestamp("auto_escalate_after"),
  
  // Metadata
  metadata: jsonb("metadata").notNull().default({}),
  actionsTaken: jsonb("actions_taken").notNull().default([]),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Validator Performance History - Historical performance metrics for validators
export const validatorPerformanceHistory = pgTable("validator_performance_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  validatorAddress: text("validator_address").notNull(),
  
  // Performance metrics
  uptime: integer("uptime").notNull().default(10000), // basis points
  blocksProduced: integer("blocks_produced").notNull().default(0),
  blocksMissed: integer("blocks_missed").notNull().default(0),
  avgBlockTime: integer("avg_block_time").notNull().default(0), // ms
  
  // Staking metrics
  totalStake: text("total_stake").notNull().default("0"),
  delegatedStake: text("delegated_stake").notNull().default("0"),
  delegatorCount: integer("delegator_count").notNull().default(0),
  
  // Rewards
  rewardsEarned: text("rewards_earned").notNull().default("0"),
  commissionsEarned: text("commissions_earned").notNull().default("0"),
  
  // Network metrics
  latency: integer("latency").notNull().default(0), // ms
  peerCount: integer("peer_count").notNull().default(0),
  
  // AI scores
  aiTrustScore: integer("ai_trust_score").notNull().default(7500),
  behaviorScore: integer("behavior_score").notNull().default(9500),
  reputationScore: integer("reputation_score").notNull().default(8500),
  
  // Slashing
  slashEvents: integer("slash_events").notNull().default(0),
  totalSlashed: text("total_slashed").notNull().default("0"),
  
  // Period
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  periodType: text("period_type").notNull().default("hourly"), // hourly, daily, weekly, monthly
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Report Schedules - Automated report scheduling
export const reportSchedules = pgTable("report_schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Report configuration
  name: text("name").notNull(),
  description: text("description"),
  reportType: text("report_type").notNull(), // kyc_summary, aml_report, transaction_report, validator_report, etc.
  
  // Schedule
  scheduleType: text("schedule_type").notNull().default("manual"), // manual, daily, weekly, monthly, quarterly
  cronExpression: text("cron_expression"), // For custom schedules
  timezone: text("timezone").notNull().default("UTC"),
  
  // Parameters
  parameters: jsonb("parameters").notNull().default({}), // Report-specific parameters
  jurisdiction: text("jurisdiction").notNull().default("global"),
  
  // Output
  outputFormat: text("output_format").notNull().default("pdf"), // pdf, csv, xlsx, json
  deliveryMethod: text("delivery_method").notNull().default("download"), // download, email, storage
  deliveryConfig: jsonb("delivery_config").notNull().default({}),
  
  // Status
  isActive: boolean("is_active").notNull().default(true),
  lastRunAt: timestamp("last_run_at"),
  lastRunStatus: text("last_run_status"), // success, failed, partial
  lastRunReportId: varchar("last_run_report_id"),
  nextRunAt: timestamp("next_run_at"),
  
  // Stats
  totalRuns: integer("total_runs").notNull().default(0),
  successfulRuns: integer("successful_runs").notNull().default(0),
  failedRuns: integer("failed_runs").notNull().default(0),
  
  // Ownership
  createdBy: varchar("created_by").notNull(),
  updatedBy: varchar("updated_by"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Hardware Verification Checklist - Validator hardware verification
export const hardwareVerificationChecklists = pgTable("hardware_verification_checklists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  validatorApplicationId: varchar("validator_application_id").notNull(),
  validatorAddress: text("validator_address"),
  
  // CPU Requirements
  cpuSpecsVerified: boolean("cpu_specs_verified").notNull().default(false),
  cpuNotes: text("cpu_notes"),
  
  // Memory Requirements
  memorySpecsVerified: boolean("memory_specs_verified").notNull().default(false),
  memoryNotes: text("memory_notes"),
  
  // Storage Requirements
  storageSpecsVerified: boolean("storage_specs_verified").notNull().default(false),
  storageNotes: text("storage_notes"),
  
  // Network Requirements
  networkSpecsVerified: boolean("network_specs_verified").notNull().default(false),
  networkNotes: text("network_notes"),
  bandwidthTestResult: integer("bandwidth_test_result"), // Mbps
  latencyTestResult: integer("latency_test_result"), // ms
  
  // Security Requirements
  securityConfigVerified: boolean("security_config_verified").notNull().default(false),
  securityNotes: text("security_notes"),
  firewallConfigured: boolean("firewall_configured").notNull().default(false),
  sslCertificateValid: boolean("ssl_certificate_valid").notNull().default(false),
  
  // Uptime Requirements
  uptimeGuaranteeVerified: boolean("uptime_guarantee_verified").notNull().default(false),
  uptimeNotes: text("uptime_notes"),
  redundancyConfigured: boolean("redundancy_configured").notNull().default(false),
  
  // Geographic requirements
  geographicLocationVerified: boolean("geographic_location_verified").notNull().default(false),
  geographicNotes: text("geographic_notes"),
  
  // Overall status
  overallStatus: text("overall_status").notNull().default("pending"), // pending, passed, failed, requires_review
  overallScore: integer("overall_score"), // 0-100
  
  // Review
  reviewedBy: varchar("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// TOKEN SYSTEM v4.0 - DEPLOYED TOKENS
// ============================================

// Deployed Tokens - Tracks all tokens deployed on TBURN Chain
export const deployedTokens = pgTable("deployed_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Token Identity
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  contractAddress: text("contract_address").notNull().unique(),
  
  // Token Standard
  standard: text("standard").notNull(), // TBC-20, TBC-721, TBC-1155
  
  // Token Configuration
  totalSupply: text("total_supply").notNull(),
  decimals: integer("decimals").notNull().default(18),
  
  // TBC-20 Specific
  initialSupply: text("initial_supply"),
  maxSupply: text("max_supply"),
  mintable: boolean("mintable").notNull().default(false),
  burnable: boolean("burnable").notNull().default(true),
  pausable: boolean("pausable").notNull().default(false),
  
  // TBC-721 Specific (NFT)
  baseUri: text("base_uri"),
  maxTokens: integer("max_tokens"),
  royaltyPercentage: integer("royalty_percentage").default(0), // basis points
  royaltyRecipient: text("royalty_recipient"),
  
  // TBC-1155 Specific (Multi-Token)
  tokenTypes: jsonb("token_types"), // Array of token type configurations
  
  // AI Features
  aiOptimizationEnabled: boolean("ai_optimization_enabled").notNull().default(true),
  aiBurnOptimization: boolean("ai_burn_optimization").notNull().default(false),
  aiPriceOracle: boolean("ai_price_oracle").notNull().default(false),
  aiSupplyManagement: boolean("ai_supply_management").notNull().default(false),
  
  // Security Features
  quantumResistant: boolean("quantum_resistant").notNull().default(true),
  mevProtection: boolean("mev_protection").notNull().default(true),
  zkPrivacy: boolean("zk_privacy").notNull().default(false),
  
  // Deployment Info
  deployerAddress: text("deployer_address").notNull(),
  deploymentTxHash: text("deployment_tx_hash").notNull(),
  deployedAt: timestamp("deployed_at").notNull().defaultNow(),
  
  // Statistics
  holders: integer("holders").notNull().default(0),
  transactionCount: integer("transaction_count").notNull().default(0),
  volume24h: text("volume_24h").notNull().default("0"),
  
  // Status
  verified: boolean("verified").notNull().default(false),
  status: text("status").notNull().default("active"), // active, paused, deprecated
  
  // Registry Metadata (TokenRegistry unified tracking)
  deploymentSource: text("deployment_source").notNull().default("token-system"), // token-generator, token-factory, token-system, admin
  deploymentMode: text("deployment_mode").notNull().default("simulation"), // wallet, simulation
  blockNumber: integer("block_number"),
  securityScore: integer("security_score"),
  
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
export const insertAiUsageLogSchema = createInsertSchema(aiUsageLogs).omit({ id: true, createdAt: true });
export const insertAiExecutionLogSchema = createInsertSchema(aiExecutionLogs).omit({ id: true, createdAt: true, completedAt: true, rollbackAt: true });
export const insertGovernancePrevalidationSchema = createInsertSchema(governancePrevalidations).omit({ id: true, createdAt: true, decidedAt: true });
export const insertAiTrainingJobSchema = createInsertSchema(aiTrainingJobs).omit({ id: true, createdAt: true, updatedAt: true, startedAt: true, pausedAt: true, completedAt: true });
export const insertAiTrainingMetricsSchema = createInsertSchema(aiTrainingMetrics).omit({ id: true, createdAt: true });
export const insertAiModelDeploymentSchema = createInsertSchema(aiModelDeployments).omit({ id: true, createdAt: true, updatedAt: true, deployedAt: true });
export const insertAiTrainingDatasetSchema = createInsertSchema(aiTrainingDatasets).omit({ id: true, createdAt: true, updatedAt: true, lastUsedAt: true });
export const insertAiTrainingLogSchema = createInsertSchema(aiTrainingLogs).omit({ id: true, createdAt: true });
export const insertAiParametersSchema = createInsertSchema(aiParameters).omit({ id: true, createdAt: true, updatedAt: true });
export const insertShardSchema = createInsertSchema(shards).omit({ id: true, lastSyncedAt: true });
export const insertNetworkStatsSchema = createInsertSchema(networkStats).omit({ id: true, updatedAt: true });
export const insertConsensusRoundSchema = createInsertSchema(consensusRounds).omit({ id: true, createdAt: true });
export const insertApiKeySchema = createInsertSchema(apiKeys).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  lastUsedAt: true, 
  revokedAt: true,
  revokedBy: true,
  revokeReason: true,
  lastRotatedAt: true,
  lastErrorAt: true,
  totalRequests: true,
  requestsToday: true,
  requestsThisMonth: true,
  errorCount: true,
});
export const insertApiKeyLogSchema = createInsertSchema(apiKeyLogs).omit({ id: true, createdAt: true });
export const insertCrossShardMessageSchema = createInsertSchema(crossShardMessages).omit({ id: true, sentAt: true, confirmedAt: true, failedAt: true });
export const insertWalletBalanceSchema = createInsertSchema(walletBalances).omit({ id: true, firstSeenAt: true, updatedAt: true, lastTransactionAt: true });
export const insertDelegationSchema = createInsertSchema(delegations).omit({ id: true, delegatedAt: true });
export const insertValidatorVoteSchema = createInsertSchema(validatorVotes).omit({ id: true, timestamp: true });
export const insertCommitteeSnapshotSchema = createInsertSchema(committeeSnapshots).omit({ id: true, createdAt: true });

// Member Management System Insert Schemas
export const insertMemberSchema = createInsertSchema(members).omit({ id: true, createdAt: true, updatedAt: true, lastActivityAt: true });
export const insertMemberProfileSchema = createInsertSchema(memberProfiles).omit({ id: true, updatedAt: true });
export const insertMemberStakingPositionSchema = createInsertSchema(memberStakingPositions).omit({ id: true, stakedAt: true, lastClaimAt: true });
export const insertMemberGovernanceProfileSchema = createInsertSchema(memberGovernanceProfiles).omit({ id: true, lastVoteAt: true, lastProposalAt: true });
export const insertMemberFinancialProfileSchema = createInsertSchema(memberFinancialProfiles).omit({ id: true, updatedAt: true, firstTransactionAt: true, lastTransactionAt: true });
export const insertMemberSecurityProfileSchema = createInsertSchema(memberSecurityProfiles).omit({ id: true, updatedAt: true, lastFailedLogin: true, lastKeyRotation: true, nextKeyRotationDue: true, lastRiskAssessment: true });
export const insertMemberPerformanceMetricsSchema = createInsertSchema(memberPerformanceMetrics).omit({ id: true, metricsUpdatedAt: true });
export const insertMemberSlashEventSchema = createInsertSchema(memberSlashEvents).omit({ id: true, occurredAt: true });
export const insertMemberAuditLogSchema = createInsertSchema(memberAuditLogs).omit({ id: true, createdAt: true });
export const insertRestartSessionSchema = createInsertSchema(restartSessions).omit({ updatedAt: true });

// Admin Portal Insert Schemas
export const insertAdminAuditLogSchema = createInsertSchema(adminAuditLogs).omit({ id: true, createdAt: true, reviewedAt: true });
export const insertSecurityEventSchema = createInsertSchema(securityEvents).omit({ id: true, occurredAt: true, detectedAt: true, resolvedAt: true });
export const insertComplianceReportSchema = createInsertSchema(complianceReports).omit({ id: true, createdAt: true, updatedAt: true, reviewedAt: true, approvedAt: true, submittedAt: true });
export const insertValidatorApplicationSchema = createInsertSchema(validatorApplications).omit({ id: true, submittedAt: true, reviewStartedAt: true, decidedAt: true, activatedAt: true });
export const insertOperatorSessionSchema = createInsertSchema(operatorSessions).omit({ id: true, createdAt: true, lastActivityAt: true, terminatedAt: true });
export const insertMemberDocumentSchema = createInsertSchema(memberDocuments).omit({ id: true, uploadedAt: true, updatedAt: true, verifiedAt: true });

// Enterprise Operator Portal Insert Schemas
export const insertMemberNoteSchema = createInsertSchema(memberNotes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertIpBlocklistSchema = createInsertSchema(ipBlocklist).omit({ id: true, createdAt: true, updatedAt: true, lastHitAt: true, unblockedAt: true });
export const insertSystemHealthSnapshotSchema = createInsertSchema(systemHealthSnapshots).omit({ id: true, snapshotAt: true });
export const insertAlertQueueSchema = createInsertSchema(alertQueue).omit({ id: true, createdAt: true, updatedAt: true, acknowledgedAt: true, resolvedAt: true, escalatedAt: true });
export const insertValidatorPerformanceHistorySchema = createInsertSchema(validatorPerformanceHistory).omit({ id: true, createdAt: true });
export const insertReportScheduleSchema = createInsertSchema(reportSchedules).omit({ id: true, createdAt: true, updatedAt: true, lastRunAt: true, nextRunAt: true });
export const insertHardwareVerificationChecklistSchema = createInsertSchema(hardwareVerificationChecklists).omit({ id: true, createdAt: true, updatedAt: true, reviewedAt: true });

// Token System v4.0 Insert Schemas
export const insertDeployedTokenSchema = createInsertSchema(deployedTokens).omit({ id: true, deployedAt: true, updatedAt: true });

// Infer the types for the new tables
export type Delegation = typeof delegations.$inferSelect;
export type InsertDelegation = z.infer<typeof insertDelegationSchema>;
export type ValidatorVote = typeof validatorVotes.$inferSelect;
export type InsertValidatorVote = z.infer<typeof insertValidatorVoteSchema>;
export type CommitteeSnapshot = typeof committeeSnapshots.$inferSelect;
export type InsertCommitteeSnapshot = z.infer<typeof insertCommitteeSnapshotSchema>;

// ============================================
// Select Schemas for WebSocket Validation
// ============================================
// AI Decisions (add read-only fields to insert schema)
// Make all fields optional to handle incomplete mainnet API responses
export const aiDecisionSelectSchema = insertAiDecisionSchema.extend({
  id: z.string(),
  band: z.string().optional(),
  modelName: z.string().optional(),
  decision: z.string().optional(),
  impact: z.string().optional(),
  category: z.string().optional(),
  createdAt: z.string().or(z.date()).optional(),
  executedAt: z.string().or(z.date()).optional(),
}).partial();

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
  firstSeenAt: z.string().or(z.date()).optional(),
  updatedAt: z.string().or(z.date()).optional(),
  lastTransactionAt: z.string().or(z.date()).nullish(),
});

// Consensus Rounds (add read-only fields)
export const consensusRoundSelectSchema = insertConsensusRoundSchema.extend({
  id: z.string(),
  createdAt: z.string().or(z.date()),
});

// Shards (add read-only fields)
export const shardSelectSchema = insertShardSchema.extend({
  id: z.string(),
  lastSyncedAt: z.string().or(z.date()).nullish(),
});

// Snapshot schemas (arrays for periodic broadcasts)
export const aiDecisionsSnapshotSchema = z.array(aiDecisionSelectSchema);
export const crossShardMessagesSnapshotSchema = z.array(crossShardMessageSelectSchema);
export const walletBalancesSnapshotSchema = z.array(walletBalanceSelectSchema);
export const consensusRoundsSnapshotSchema = z.array(consensusRoundSelectSchema);
export const shardsSnapshotSchema = z.array(shardSelectSchema);

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

export type AiUsageLog = typeof aiUsageLogs.$inferSelect;
export type InsertAiUsageLog = z.infer<typeof insertAiUsageLogSchema>;

export type AiExecutionLog = typeof aiExecutionLogs.$inferSelect;
export type InsertAiExecutionLog = z.infer<typeof insertAiExecutionLogSchema>;

export type GovernancePrevalidation = typeof governancePrevalidations.$inferSelect;
export type InsertGovernancePrevalidation = z.infer<typeof insertGovernancePrevalidationSchema>;

export type AiTrainingJob = typeof aiTrainingJobs.$inferSelect;
export type InsertAiTrainingJob = z.infer<typeof insertAiTrainingJobSchema>;

export type AiTrainingMetrics = typeof aiTrainingMetrics.$inferSelect;
export type InsertAiTrainingMetrics = z.infer<typeof insertAiTrainingMetricsSchema>;

export type AiModelDeployment = typeof aiModelDeployments.$inferSelect;
export type InsertAiModelDeployment = z.infer<typeof insertAiModelDeploymentSchema>;

export type AiTrainingDataset = typeof aiTrainingDatasets.$inferSelect;
export type InsertAiTrainingDataset = z.infer<typeof insertAiTrainingDatasetSchema>;

export type AiTrainingLog = typeof aiTrainingLogs.$inferSelect;
export type InsertAiTrainingLog = z.infer<typeof insertAiTrainingLogSchema>;

export type AiParameters = typeof aiParameters.$inferSelect;
export type InsertAiParameters = z.infer<typeof insertAiParametersSchema>;

export type Shard = typeof shards.$inferSelect;
export type InsertShard = z.infer<typeof insertShardSchema>;

export type NetworkStats = typeof networkStats.$inferSelect;
export type InsertNetworkStats = z.infer<typeof insertNetworkStatsSchema>;

export type ConsensusRound = typeof consensusRounds.$inferSelect;
export type InsertConsensusRound = z.infer<typeof insertConsensusRoundSchema>;

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKeyLog = typeof apiKeyLogs.$inferSelect;
export type InsertApiKeyLog = z.infer<typeof insertApiKeyLogSchema>;

export type CrossShardMessage = typeof crossShardMessages.$inferSelect;
export type InsertCrossShardMessage = z.infer<typeof insertCrossShardMessageSchema>;

export type WalletBalance = typeof walletBalances.$inferSelect;
export type InsertWalletBalance = z.infer<typeof insertWalletBalanceSchema>;

// Member Management System Types
export type Member = typeof members.$inferSelect;
export type InsertMember = z.infer<typeof insertMemberSchema>;

export type MemberProfile = typeof memberProfiles.$inferSelect;
export type InsertMemberProfile = z.infer<typeof insertMemberProfileSchema>;

export type MemberStakingPosition = typeof memberStakingPositions.$inferSelect;
export type InsertMemberStakingPosition = z.infer<typeof insertMemberStakingPositionSchema>;

export type MemberGovernanceProfile = typeof memberGovernanceProfiles.$inferSelect;
export type InsertMemberGovernanceProfile = z.infer<typeof insertMemberGovernanceProfileSchema>;

export type MemberFinancialProfile = typeof memberFinancialProfiles.$inferSelect;
export type InsertMemberFinancialProfile = z.infer<typeof insertMemberFinancialProfileSchema>;

export type MemberSecurityProfile = typeof memberSecurityProfiles.$inferSelect;
export type InsertMemberSecurityProfile = z.infer<typeof insertMemberSecurityProfileSchema>;

export type MemberPerformanceMetrics = typeof memberPerformanceMetrics.$inferSelect;
export type InsertMemberPerformanceMetrics = z.infer<typeof insertMemberPerformanceMetricsSchema>;

export type MemberSlashEvent = typeof memberSlashEvents.$inferSelect;
export type InsertMemberSlashEvent = z.infer<typeof insertMemberSlashEventSchema>;

export type MemberAuditLog = typeof memberAuditLogs.$inferSelect;
export type InsertMemberAuditLog = z.infer<typeof insertMemberAuditLogSchema>;

export type RestartSession = typeof restartSessions.$inferSelect;
export type InsertRestartSession = z.infer<typeof insertRestartSessionSchema>;

// Admin Portal Types
export type AdminAuditLog = typeof adminAuditLogs.$inferSelect;
export type InsertAdminAuditLog = z.infer<typeof insertAdminAuditLogSchema>;

export type SecurityEvent = typeof securityEvents.$inferSelect;
export type InsertSecurityEvent = z.infer<typeof insertSecurityEventSchema>;

export type ComplianceReport = typeof complianceReports.$inferSelect;
export type InsertComplianceReport = z.infer<typeof insertComplianceReportSchema>;

export type ValidatorApplication = typeof validatorApplications.$inferSelect;
export type InsertValidatorApplication = z.infer<typeof insertValidatorApplicationSchema>;

export type OperatorSession = typeof operatorSessions.$inferSelect;
export type InsertOperatorSession = z.infer<typeof insertOperatorSessionSchema>;

export type MemberDocument = typeof memberDocuments.$inferSelect;
export type InsertMemberDocument = z.infer<typeof insertMemberDocumentSchema>;

// Enterprise Operator Portal Types
export type MemberNote = typeof memberNotes.$inferSelect;
export type InsertMemberNote = z.infer<typeof insertMemberNoteSchema>;

export type IpBlocklistEntry = typeof ipBlocklist.$inferSelect;
export type InsertIpBlocklistEntry = z.infer<typeof insertIpBlocklistSchema>;

export type SystemHealthSnapshot = typeof systemHealthSnapshots.$inferSelect;
export type InsertSystemHealthSnapshot = z.infer<typeof insertSystemHealthSnapshotSchema>;

export type AlertQueueItem = typeof alertQueue.$inferSelect;
export type InsertAlertQueueItem = z.infer<typeof insertAlertQueueSchema>;

export type ValidatorPerformanceHistoryEntry = typeof validatorPerformanceHistory.$inferSelect;
export type InsertValidatorPerformanceHistoryEntry = z.infer<typeof insertValidatorPerformanceHistorySchema>;

export type ReportSchedule = typeof reportSchedules.$inferSelect;
export type InsertReportSchedule = z.infer<typeof insertReportScheduleSchema>;

export type HardwareVerificationChecklist = typeof hardwareVerificationChecklists.$inferSelect;
export type InsertHardwareVerificationChecklist = z.infer<typeof insertHardwareVerificationChecklistSchema>;

// Token System v4.0 Types
export type DeployedToken = typeof deployedTokens.$inferSelect;
export type InsertDeployedToken = z.infer<typeof insertDeployedTokenSchema>;

// ============================================
// TBURN Staking Infrastructure v1.0
// ============================================

// Staking Pool Types Enum
export const STAKING_POOL_TYPES = ["public", "private", "validator", "institutional", "liquid"] as const;
export type StakingPoolType = typeof STAKING_POOL_TYPES[number];

// Staking Pool Status Enum
export const STAKING_POOL_STATUS = ["active", "paused", "full", "closing", "closed", "emergency"] as const;
export type StakingPoolStatus = typeof STAKING_POOL_STATUS[number];

// Staking Tier Enum (Bronze, Silver, Gold, Platinum, Diamond)
export const STAKING_TIERS = ["bronze", "silver", "gold", "platinum", "diamond"] as const;
export type StakingTier = typeof STAKING_TIERS[number];

// Lock Period Enum
export const LOCK_PERIODS = ["none", "7days", "30days", "90days", "180days", "365days"] as const;
export type LockPeriod = typeof LOCK_PERIODS[number];

// Reward Type Enum
export const REWARD_TYPES = ["fixed", "dynamic", "performance", "tiered"] as const;
export type RewardType = typeof REWARD_TYPES[number];

// Delegation Status Enum
export const DELEGATION_STATUS = ["active", "unbonding", "redelegating", "completed", "cancelled", "slashed"] as const;
export type DelegationStatus = typeof DELEGATION_STATUS[number];

// Staking Pools Table
export const stakingPools = pgTable("staking_pools", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  poolType: text("pool_type").notNull().default("public"), // public, private, validator, institutional, liquid
  tier: text("tier").notNull().default("bronze"), // bronze, silver, gold, platinum, diamond
  status: text("status").notNull().default("active"), // active, paused, full, closing, closed, emergency
  
  // Pool Configuration
  minStake: text("min_stake").notNull().default("1000000000000000000"), // 1 TBURN in wei
  maxStake: text("max_stake"), // per-user max
  maxTotalStake: text("max_total_stake"), // pool capacity
  
  // Validator Association
  validatorId: varchar("validator_id"), // references validators table
  validatorAddress: text("validator_address"),
  validatorName: text("validator_name"),
  
  // Lock & Reward Settings
  lockPeriod: text("lock_period").notNull().default("30days"), // none, 7days, 30days, 90days, 180days, 365days
  lockPeriodDays: integer("lock_period_days").notNull().default(30), // lock period in days
  rewardType: text("reward_type").notNull().default("fixed"), // fixed, dynamic, performance, tiered
  rewardFrequency: text("reward_frequency").notNull().default("daily"), // hourly, daily, weekly, monthly
  baseApy: integer("base_apy").notNull().default(1200), // basis points (1200 = 12%)
  maxApy: integer("max_apy").notNull().default(2500), // basis points (2500 = 25%)
  apyBoost: integer("apy_boost").notNull().default(0), // additional APY boost in basis points
  
  // Fee Structure
  entryFee: integer("entry_fee").notNull().default(0), // basis points
  exitFee: integer("exit_fee").notNull().default(50), // basis points (0.5%)
  performanceFee: integer("performance_fee").notNull().default(1000), // basis points (10%)
  earlyWithdrawalPenalty: integer("early_withdrawal_penalty").notNull().default(500), // basis points (5%)
  
  // Compound Settings
  autoCompoundEnabled: boolean("auto_compound_enabled").notNull().default(true),
  compoundFrequencyHours: integer("compound_frequency_hours").notNull().default(24),
  
  // Pool Metrics
  totalStaked: text("total_staked").notNull().default("0"),
  totalRewards: text("total_rewards").notNull().default("0"),
  totalStakers: integer("total_stakers").notNull().default(0),
  totalValidators: integer("total_validators").notNull().default(0),
  currentApy: integer("current_apy").notNull().default(1200), // basis points
  
  // Metadata
  description: text("description"),
  logoUrl: text("logo_url"),
  websiteUrl: text("website_url"),
  termsUrl: text("terms_url"),
  auditReportUrl: text("audit_report_url"),
  
  // Whitelist settings
  whitelistEnabled: boolean("whitelist_enabled").notNull().default(false),
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  lastRewardUpdate: timestamp("last_reward_update"),
});

// Staking Positions (User stakes in pools)
export const stakingPositions = pgTable("staking_positions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  poolId: varchar("pool_id").notNull(), // references staking_pools
  stakerAddress: text("staker_address").notNull(),
  
  // Position Details
  stakedAmount: text("staked_amount").notNull(),
  tier: text("tier").notNull().default("bronze"), // bronze, silver, gold, platinum, diamond
  
  // Reward Tracking
  rewardsEarned: text("rewards_earned").notNull().default("0"),
  rewardsClaimed: text("rewards_claimed").notNull().default("0"),
  pendingRewards: text("pending_rewards").notNull().default("0"),
  
  // Compound Settings
  autoCompound: boolean("auto_compound").notNull().default(false),
  lastCompoundAt: timestamp("last_compound_at"),
  
  // Lock Settings
  lockPeriod: text("lock_period").notNull(),
  unlockAt: timestamp("unlock_at"),
  
  // Delegation (optional - if delegated to a validator)
  delegatedValidatorId: varchar("delegated_validator_id"),
  
  // Status
  status: text("status").notNull().default("active"), // active, unbonding, completed
  
  // Timestamps
  stakedAt: timestamp("staked_at").notNull().defaultNow(),
  lastActionAt: timestamp("last_action_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Staking Delegations (Enhanced delegations with pool support - extends base delegations)
export const stakingDelegations = pgTable("staking_delegations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  delegatorAddress: text("delegator_address").notNull(),
  validatorId: varchar("validator_id").notNull(), // references validators table
  poolId: varchar("pool_id"), // optional - if through a pool
  
  // Delegation Details
  amount: text("amount").notNull(),
  shares: text("shares").notNull().default("0"), // proportional share for rewards
  
  // Status
  status: text("status").notNull().default("active"), // active, unbonding, redelegating, completed, cancelled, slashed
  
  // Unbonding
  unbondingStartAt: timestamp("unbonding_start_at"),
  unbondingEndAt: timestamp("unbonding_end_at"),
  
  // Redelegation
  redelegatingToValidatorId: varchar("redelegating_to_validator_id"),
  redelegationCompleteAt: timestamp("redelegation_complete_at"),
  
  // Reward Tracking
  rewardsEarned: text("rewards_earned").notNull().default("0"),
  rewardsClaimed: text("rewards_claimed").notNull().default("0"),
  pendingRewards: text("pending_rewards").notNull().default("0"),
  
  // Slashing Protection
  slashedAmount: text("slashed_amount").notNull().default("0"),
  slashCount: integer("slash_count").notNull().default(0),
  
  // Timestamps
  delegatedAt: timestamp("delegated_at").notNull().defaultNow(),
  lastActionAt: timestamp("last_action_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Unbonding Requests
export const unbondingRequests = pgTable("unbonding_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  delegationId: varchar("delegation_id").notNull(), // references delegations
  delegatorAddress: text("delegator_address").notNull(),
  validatorId: varchar("validator_id").notNull(),
  
  // Unbonding Details
  amount: text("amount").notNull(),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completesAt: timestamp("completes_at").notNull(), // 21 days from start
  
  // Status
  status: text("status").notNull().default("pending"), // pending, completed, cancelled
  completedAt: timestamp("completed_at"),
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Reward Cycles (Epoch-based reward distribution)
export const rewardCycles = pgTable("reward_cycles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cycleNumber: integer("cycle_number").notNull().unique(),
  poolId: varchar("pool_id"), // null for global rewards
  
  // Cycle Details
  startedAt: timestamp("started_at").notNull(),
  endedAt: timestamp("ended_at"),
  durationHours: integer("duration_hours").notNull().default(24),
  
  // Reward Amounts
  totalRewards: text("total_rewards").notNull().default("0"),
  distributedRewards: text("distributed_rewards").notNull().default("0"),
  treasurySplit: text("treasury_split").notNull().default("0"), // Amount sent to treasury
  validatorFees: text("validator_fees").notNull().default("0"),
  
  // Metrics
  totalStakersRewarded: integer("total_stakers_rewarded").notNull().default(0),
  averageRewardPerStaker: text("average_reward_per_staker").notNull().default("0"),
  
  // Status
  status: text("status").notNull().default("active"), // active, completed, pending
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Reward Events (Individual reward distributions)
export const rewardEvents = pgTable("reward_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cycleId: varchar("cycle_id").notNull(), // references reward_cycles
  recipientAddress: text("recipient_address").notNull(),
  poolId: varchar("pool_id"),
  validatorId: varchar("validator_id"),
  
  // Reward Details
  rewardType: text("reward_type").notNull(), // staking, delegation, commission, bonus, penalty
  amount: text("amount").notNull(),
  tierMultiplier: integer("tier_multiplier").notNull().default(10000), // basis points (10000 = 1x)
  
  // Status
  status: text("status").notNull().default("pending"), // pending, distributed, claimed, failed
  distributedAt: timestamp("distributed_at"),
  claimedAt: timestamp("claimed_at"),
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Slashing Events
export const slashingEvents = pgTable("slashing_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  validatorId: varchar("validator_id").notNull(),
  
  // Slashing Details
  reason: text("reason").notNull(), // double_sign, downtime, malicious_behavior
  severity: text("severity").notNull(), // minor, major, critical
  slashPercentage: integer("slash_percentage").notNull(), // basis points
  totalSlashed: text("total_slashed").notNull(),
  affectedDelegators: integer("affected_delegators").notNull().default(0),
  
  // Evidence
  evidence: jsonb("evidence"),
  blockNumber: bigint("block_number", { mode: "number" }),
  
  // Status
  status: text("status").notNull().default("executed"), // proposed, executed, reverted
  
  // Timestamps
  occurredAt: timestamp("occurred_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Pool Whitelist
export const poolWhitelist = pgTable("pool_whitelist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  poolId: varchar("pool_id").notNull(),
  address: text("address").notNull(),
  addedBy: text("added_by").notNull(),
  addedAt: timestamp("added_at").notNull().defaultNow(),
});

// Staking Statistics (Aggregated metrics)
export const stakingStats = pgTable("staking_stats", {
  id: varchar("id").primaryKey().default("singleton"),
  
  // Global Metrics
  totalValueLocked: text("total_value_locked").notNull().default("0"),
  totalRewardsDistributed: text("total_rewards_distributed").notNull().default("0"),
  totalStakers: integer("total_stakers").notNull().default(0),
  totalPools: integer("total_pools").notNull().default(0),
  
  // APY Metrics
  averageApy: integer("average_apy").notNull().default(0), // basis points
  highestApy: integer("highest_apy").notNull().default(0),
  lowestApy: integer("lowest_apy").notNull().default(0),
  
  // Tier Distribution
  bronzeStakers: integer("bronze_stakers").notNull().default(0),
  silverStakers: integer("silver_stakers").notNull().default(0),
  goldStakers: integer("gold_stakers").notNull().default(0),
  platinumStakers: integer("platinum_stakers").notNull().default(0),
  diamondStakers: integer("diamond_stakers").notNull().default(0),
  
  // Current Epoch/Cycle
  currentRewardCycle: integer("current_reward_cycle").notNull().default(0),
  lastRewardDistribution: timestamp("last_reward_distribution"),
  
  // Timestamps
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Insert Schemas for Staking Infrastructure
export const insertStakingPoolSchema = createInsertSchema(stakingPools).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertStakingPositionSchema = createInsertSchema(stakingPositions).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertStakingDelegationSchema = createInsertSchema(stakingDelegations).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertUnbondingRequestSchema = createInsertSchema(unbondingRequests).omit({ 
  id: true, 
  createdAt: true 
});

export const insertRewardCycleSchema = createInsertSchema(rewardCycles).omit({ 
  id: true, 
  createdAt: true 
});

export const insertRewardEventSchema = createInsertSchema(rewardEvents).omit({ 
  id: true, 
  createdAt: true 
});

export const insertSlashingEventSchema = createInsertSchema(slashingEvents).omit({ 
  id: true, 
  createdAt: true 
});

export const insertPoolWhitelistSchema = createInsertSchema(poolWhitelist).omit({ 
  id: true, 
  addedAt: true 
});

export const insertStakingStatsSchema = createInsertSchema(stakingStats).omit({ 
  updatedAt: true 
});

// Staking Infrastructure Types
export type StakingPool = typeof stakingPools.$inferSelect;
export type InsertStakingPool = z.infer<typeof insertStakingPoolSchema>;

export type StakingPosition = typeof stakingPositions.$inferSelect;
export type InsertStakingPosition = z.infer<typeof insertStakingPositionSchema>;

export type StakingDelegation = typeof stakingDelegations.$inferSelect;
export type InsertStakingDelegation = z.infer<typeof insertStakingDelegationSchema>;

export type UnbondingRequest = typeof unbondingRequests.$inferSelect;
export type InsertUnbondingRequest = z.infer<typeof insertUnbondingRequestSchema>;

export type RewardCycle = typeof rewardCycles.$inferSelect;
export type InsertRewardCycle = z.infer<typeof insertRewardCycleSchema>;

export type RewardEvent = typeof rewardEvents.$inferSelect;
export type InsertRewardEvent = z.infer<typeof insertRewardEventSchema>;

export type SlashingEvent = typeof slashingEvents.$inferSelect;
export type InsertSlashingEvent = z.infer<typeof insertSlashingEventSchema>;

export type PoolWhitelist = typeof poolWhitelist.$inferSelect;
export type InsertPoolWhitelist = z.infer<typeof insertPoolWhitelistSchema>;

export type StakingStats = typeof stakingStats.$inferSelect;
export type InsertStakingStats = z.infer<typeof insertStakingStatsSchema>;

// ============================================
// TBURN Staking Infrastructure v2.0 - Enterprise Extensions
// ============================================

// Staking Tier Configuration (Normalized tier settings)
export const stakingTierConfig = pgTable("staking_tier_config", {
  id: varchar("id").primaryKey(),
  tier: text("tier").notNull().unique(), // bronze, silver, gold, platinum, diamond
  displayName: text("display_name").notNull(),
  
  // APY Configuration
  minApy: integer("min_apy").notNull(), // basis points
  maxApy: integer("max_apy").notNull(), // basis points
  apyMultiplier: integer("apy_multiplier").notNull().default(10000), // basis points (10000 = 1x)
  
  // Lock Requirements
  minLockDays: integer("min_lock_days").notNull(),
  maxLockDays: integer("max_lock_days").notNull(),
  
  // Stake Requirements
  minStakeWei: text("min_stake_wei").notNull(), // in Wei
  maxStakeWei: text("max_stake_wei"), // optional cap
  
  // Bonus Configuration
  earlyAdopterBonus: integer("early_adopter_bonus").notNull().default(0), // basis points
  loyaltyBonus: integer("loyalty_bonus").notNull().default(0), // basis points per month
  
  // Fee Discounts
  feeDiscount: integer("fee_discount").notNull().default(0), // basis points
  
  // Privileges
  priorityRewards: boolean("priority_rewards").notNull().default(false),
  governanceWeight: integer("governance_weight").notNull().default(1),
  
  // Visual
  color: text("color").notNull().default("#CD7F32"),
  iconUrl: text("icon_url"),
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Pool Validator Assignments (Many-to-Many for multi-validator pools)
export const poolValidatorAssignments = pgTable("pool_validator_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  poolId: varchar("pool_id").notNull(),
  validatorId: varchar("validator_id").notNull(),
  
  // Weight Distribution
  allocationWeight: integer("allocation_weight").notNull().default(10000), // basis points
  
  // Status
  status: text("status").notNull().default("active"), // active, paused, removed
  
  // Performance Tracking
  totalDelegated: text("total_delegated").notNull().default("0"),
  rewardsGenerated: text("rewards_generated").notNull().default("0"),
  
  // Timestamps
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
  lastRewardAt: timestamp("last_reward_at"),
});

// Staking Audit Logs (Enterprise audit trail)
export const STAKING_AUDIT_ACTIONS = [
  "stake", "unstake", "delegate", "undelegate", "redelegate",
  "claim_rewards", "compound", "create_pool", "update_pool", "pause_pool",
  "whitelist_add", "whitelist_remove", "slash", "emergency_withdraw",
  "tier_upgrade", "tier_downgrade", "fee_change", "apy_adjustment"
] as const;
export type StakingAuditAction = typeof STAKING_AUDIT_ACTIONS[number];

export const stakingAuditLogs = pgTable("staking_audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Action Context
  action: text("action").notNull(), // StakingAuditAction
  actorAddress: text("actor_address").notNull(),
  actorType: text("actor_type").notNull().default("user"), // user, admin, system, validator
  
  // Target Reference
  targetType: text("target_type").notNull(), // pool, position, delegation, validator
  targetId: varchar("target_id").notNull(),
  
  // Action Details
  previousValue: jsonb("previous_value"),
  newValue: jsonb("new_value"),
  amount: text("amount"), // Wei amount if applicable
  
  // Transaction Context
  txHash: text("tx_hash"),
  blockNumber: bigint("block_number", { mode: "number" }),
  
  // Request Metadata
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  requestId: text("request_id"), // trace ID for request correlation
  
  // Status
  status: text("status").notNull().default("success"), // success, failed, pending, reverted
  errorMessage: text("error_message"),
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Staking Snapshots (For historical analytics and APY calculations)
export const stakingSnapshots = pgTable("staking_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  snapshotType: text("snapshot_type").notNull(), // hourly, daily, weekly, monthly, epoch
  
  // Time Reference
  snapshotAt: timestamp("snapshot_at").notNull(),
  epochNumber: integer("epoch_number"),
  
  // Global Metrics
  totalValueLocked: text("total_value_locked").notNull(),
  totalStakers: integer("total_stakers").notNull(),
  totalPools: integer("total_pools").notNull(),
  totalValidators: integer("total_validators").notNull(),
  
  // APY Metrics
  averageApy: integer("average_apy").notNull(), // basis points
  weightedApy: integer("weighted_apy").notNull(), // stake-weighted average
  
  // Reward Metrics
  rewardsDistributed: text("rewards_distributed").notNull(),
  newStakes: text("new_stakes").notNull(),
  withdrawals: text("withdrawals").notNull(),
  
  // Pool Distribution
  poolMetrics: jsonb("pool_metrics"), // { poolId: { tvl, stakers, apy } }
  
  // Tier Distribution
  tierDistribution: jsonb("tier_distribution"), // { bronze: count, silver: count, ... }
  
  // Validator Distribution
  validatorMetrics: jsonb("validator_metrics"), // { validatorId: { delegated, rewards } }
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// AI Risk Assessments for Staking (Integration with Triple-Band AI)
export const stakingAiAssessments = pgTable("staking_ai_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Assessment Target
  assessmentType: text("assessment_type").notNull(), // pool_risk, validator_risk, delegation_risk, apy_prediction
  targetType: text("target_type").notNull(), // pool, validator, position
  targetId: varchar("target_id").notNull(),
  
  // AI Model Info
  aiModel: text("ai_model").notNull(), // gemini, claude, gpt-5
  modelVersion: text("model_version"),
  
  // Risk Assessment
  riskScore: integer("risk_score").notNull(), // 0-10000 (basis points, 10000 = 100% risk)
  riskLevel: text("risk_level").notNull(), // low, medium, high, critical
  confidenceScore: integer("confidence_score").notNull(), // basis points
  
  // Predictions
  predictedApy: integer("predicted_apy"), // basis points, for APY predictions
  predictedRisk: jsonb("predicted_risk"), // { slashing: 0.02, downtime: 0.05, ... }
  
  // Analysis
  analysisFactors: jsonb("analysis_factors"), // Contributing factors
  recommendations: jsonb("recommendations"), // AI recommendations
  
  // Validity
  validUntil: timestamp("valid_until").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  
  // Timestamps
  assessedAt: timestamp("assessed_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert Schemas for Enterprise Extensions
export const insertStakingTierConfigSchema = createInsertSchema(stakingTierConfig).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertPoolValidatorAssignmentSchema = createInsertSchema(poolValidatorAssignments).omit({
  id: true,
  assignedAt: true,
});

export const insertStakingAuditLogSchema = createInsertSchema(stakingAuditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertStakingSnapshotSchema = createInsertSchema(stakingSnapshots).omit({
  id: true,
  createdAt: true,
});

export const insertStakingAiAssessmentSchema = createInsertSchema(stakingAiAssessments).omit({
  id: true,
  createdAt: true,
});

// Enterprise Extension Types
export type StakingTierConfig = typeof stakingTierConfig.$inferSelect;
export type InsertStakingTierConfig = z.infer<typeof insertStakingTierConfigSchema>;

export type PoolValidatorAssignment = typeof poolValidatorAssignments.$inferSelect;
export type InsertPoolValidatorAssignment = z.infer<typeof insertPoolValidatorAssignmentSchema>;

export type StakingAuditLog = typeof stakingAuditLogs.$inferSelect;
export type InsertStakingAuditLog = z.infer<typeof insertStakingAuditLogSchema>;

export type StakingSnapshot = typeof stakingSnapshots.$inferSelect;
export type InsertStakingSnapshot = z.infer<typeof insertStakingSnapshotSchema>;

export type StakingAiAssessment = typeof stakingAiAssessments.$inferSelect;
export type InsertStakingAiAssessment = z.infer<typeof insertStakingAiAssessmentSchema>;

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
  participatingValidators?: number; // Validators actively participating (85%~100% due to AI Pre-Validation)
  participationRate?: number; // Participation rate percentage (85.00~100.00)
  requiredQuorum: number;
  avgBlockTimeMs: number;
  startTime: number;
  consensusType?: string; // 'AI-BFT'
  consensusDescription?: string; // Description of consensus mechanism
}

// Zod schemas for WebSocket validation
export const consensusPhaseSchema = z.object({
  number: z.number(),
  label: z.string(),
  time: z.string(),
  status: z.enum(["completed", "active", "pending"]),
});

export const consensusStateSchema = z.object({
  currentPhase: z.number(),
  phases: z.array(consensusPhaseSchema),
  proposer: z.string(),
  blockHeight: z.number(),
  prevoteCount: z.number(),
  precommitCount: z.number(),
  totalValidators: z.number(),
  participatingValidators: z.number().optional(), // Validators actively participating (85%~100% due to AI Pre-Validation)
  participationRate: z.number().optional(), // Participation rate percentage (85.00~100.00)
  requiredQuorum: z.number(),
  avgBlockTimeMs: z.number(),
  startTime: z.number(),
  consensusType: z.string().optional(),
  consensusDescription: z.string().optional(),
});

// ============================================
// TBURN DEX/AMM INFRASTRUCTURE v1.0
// ============================================

// Pool Types Enum
export const DEX_POOL_TYPES = ["standard", "stable", "concentrated", "multi_asset", "weighted"] as const;
export type DexPoolType = typeof DEX_POOL_TYPES[number];

// Pool Status Enum
export const DEX_POOL_STATUS = ["active", "paused", "deprecated", "emergency", "migrating"] as const;
export type DexPoolStatus = typeof DEX_POOL_STATUS[number];

// Swap Status Enum
export const SWAP_STATUS = ["pending", "completed", "failed", "cancelled", "reverted"] as const;
export type SwapStatus = typeof SWAP_STATUS[number];

// Position Status Enum
export const LP_POSITION_STATUS = ["active", "closed", "migrating", "emergency_withdrawn"] as const;
export type LpPositionStatus = typeof LP_POSITION_STATUS[number];

// Fee Tier Enum (basis points)
export const FEE_TIERS = [100, 300, 500, 1000, 3000, 10000] as const; // 0.01%, 0.03%, 0.05%, 0.1%, 0.3%, 1%
export type FeeTier = typeof FEE_TIERS[number];

// Circuit Breaker Status Enum
export const CIRCUIT_BREAKER_STATUS = ["normal", "warning", "triggered", "cooldown", "disabled"] as const;
export type CircuitBreakerStatus = typeof CIRCUIT_BREAKER_STATUS[number];

// ============================================
// DEX Liquidity Pools
// ============================================

export const dexPools = pgTable("dex_pools", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Pool Identity
  name: text("name").notNull(),
  symbol: text("symbol").notNull(), // LP token symbol (e.g., "TBURN-ETH-LP")
  contractAddress: text("contract_address").notNull().unique(),
  
  // Pool Configuration
  poolType: text("pool_type").notNull().default("standard"), // standard, stable, concentrated, multi_asset, weighted
  feeTier: integer("fee_tier").notNull().default(300), // basis points (300 = 0.3%)
  status: text("status").notNull().default("active"), // active, paused, deprecated, emergency
  
  // Token Pair (for standard/stable/concentrated pools)
  token0Address: text("token0_address").notNull(),
  token0Symbol: text("token0_symbol").notNull(),
  token0Decimals: integer("token0_decimals").notNull().default(18),
  token1Address: text("token1_address").notNull(),
  token1Symbol: text("token1_symbol").notNull(),
  token1Decimals: integer("token1_decimals").notNull().default(18),
  
  // Reserves (Wei as string)
  reserve0: text("reserve0").notNull().default("0"),
  reserve1: text("reserve1").notNull().default("0"),
  
  // Concentrated Liquidity (for concentrated pools)
  tickSpacing: integer("tick_spacing"), // Price granularity for concentrated liquidity
  currentTick: integer("current_tick"), // Current price tick
  sqrtPriceX96: text("sqrt_price_x96"), // sqrt(price) * 2^96 for precision
  
  // Stable Swap Parameters (for stable pools)
  amplificationParameter: integer("amplification_parameter"), // A parameter for stableswap curve
  
  // Weighted Pool Parameters (for weighted pools)
  token0Weight: integer("token0_weight"), // Weight in basis points (5000 = 50%)
  token1Weight: integer("token1_weight"),
  
  // Pricing
  price0: text("price0").notNull().default("0"), // Price of token0 in token1
  price1: text("price1").notNull().default("0"), // Price of token1 in token0
  priceUsd0: text("price_usd_0").notNull().default("0"),
  priceUsd1: text("price_usd_1").notNull().default("0"),
  
  // LP Token
  lpTokenSupply: text("lp_token_supply").notNull().default("0"),
  lpTokenDecimals: integer("lp_token_decimals").notNull().default(18),
  
  // Volume & Fees
  volume24h: text("volume_24h").notNull().default("0"),
  volume7d: text("volume_7d").notNull().default("0"),
  volumeAllTime: text("volume_all_time").notNull().default("0"),
  fees24h: text("fees_24h").notNull().default("0"),
  fees7d: text("fees_7d").notNull().default("0"),
  feesAllTime: text("fees_all_time").notNull().default("0"),
  
  // TVL
  tvlUsd: text("tvl_usd").notNull().default("0"),
  
  // Statistics
  swapCount24h: integer("swap_count_24h").notNull().default(0),
  swapCountAllTime: integer("swap_count_all_time").notNull().default(0),
  lpCount: integer("lp_count").notNull().default(0), // Number of liquidity providers
  
  // APY/APR
  feeApy: integer("fee_apy").notNull().default(0), // basis points (1500 = 15.00%)
  rewardApy: integer("reward_apy").notNull().default(0), // Additional incentive APY
  totalApy: integer("total_apy").notNull().default(0),
  
  // AI Features
  aiPriceOracle: boolean("ai_price_oracle").notNull().default(true),
  aiRouteOptimization: boolean("ai_route_optimization").notNull().default(true),
  aiMevProtection: boolean("ai_mev_protection").notNull().default(true),
  aiRiskScore: integer("ai_risk_score").notNull().default(0), // 0-100
  
  // Security
  mevProtectionEnabled: boolean("mev_protection_enabled").notNull().default(true),
  flashloanGuardEnabled: boolean("flashloan_guard_enabled").notNull().default(true),
  circuitBreakerEnabled: boolean("circuit_breaker_enabled").notNull().default(true),
  
  // Deployment Info
  creatorAddress: text("creator_address").notNull(),
  deploymentTxHash: text("deployment_tx_hash"),
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  lastSwapAt: timestamp("last_swap_at"),
});

// ============================================
// DEX Pool Assets (for multi-asset pools)
// ============================================

export const dexPoolAssets = pgTable("dex_pool_assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  poolId: varchar("pool_id").notNull(),
  
  // Asset Info
  tokenAddress: text("token_address").notNull(),
  tokenSymbol: text("token_symbol").notNull(),
  tokenDecimals: integer("token_decimals").notNull().default(18),
  
  // Reserve & Weight
  reserve: text("reserve").notNull().default("0"),
  weight: integer("weight").notNull().default(0), // basis points for weighted pools
  
  // Pricing
  priceUsd: text("price_usd").notNull().default("0"),
  
  // Index in pool
  assetIndex: integer("asset_index").notNull().default(0),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// DEX Concentrated Liquidity Ticks
// ============================================

export const dexPoolTicks = pgTable("dex_pool_ticks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  poolId: varchar("pool_id").notNull(),
  
  // Tick Data
  tickIndex: integer("tick_index").notNull(),
  liquidityGross: text("liquidity_gross").notNull().default("0"), // Total liquidity referencing this tick
  liquidityNet: text("liquidity_net").notNull().default("0"), // Net liquidity change when crossing
  
  // Fee Growth
  feeGrowthOutside0: text("fee_growth_outside_0").notNull().default("0"),
  feeGrowthOutside1: text("fee_growth_outside_1").notNull().default("0"),
  
  // Seconds tracking
  secondsOutside: bigint("seconds_outside", { mode: "number" }).notNull().default(0),
  
  // Initialization
  initialized: boolean("initialized").notNull().default(false),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// DEX LP Positions
// ============================================

export const dexPositions = pgTable("dex_positions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Position Identity
  positionNftId: text("position_nft_id"), // For concentrated liquidity NFT positions
  poolId: varchar("pool_id").notNull(),
  ownerAddress: text("owner_address").notNull(),
  
  // Position Type
  isConcentrated: boolean("is_concentrated").notNull().default(false),
  
  // Standard LP Position
  lpTokenAmount: text("lp_token_amount").notNull().default("0"),
  
  // Concentrated Liquidity Range
  tickLower: integer("tick_lower"), // Lower price tick
  tickUpper: integer("tick_upper"), // Upper price tick
  liquidity: text("liquidity").notNull().default("0"), // Liquidity amount for concentrated
  
  // Token Amounts (cached for display)
  amount0: text("amount0").notNull().default("0"),
  amount1: text("amount1").notNull().default("0"),
  
  // Value
  valueUsd: text("value_usd").notNull().default("0"),
  
  // Fees
  unclaimedFees0: text("unclaimed_fees_0").notNull().default("0"),
  unclaimedFees1: text("unclaimed_fees_1").notNull().default("0"),
  totalFeesEarned0: text("total_fees_earned_0").notNull().default("0"),
  totalFeesEarned1: text("total_fees_earned_1").notNull().default("0"),
  
  // Fee Growth Tracking (for concentrated)
  feeGrowthInside0LastX128: text("fee_growth_inside_0_last_x128"),
  feeGrowthInside1LastX128: text("fee_growth_inside_1_last_x128"),
  
  // Status
  status: text("status").notNull().default("active"), // active, closed, migrating
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  closedAt: timestamp("closed_at"),
});

// ============================================
// DEX Swaps
// ============================================

export const dexSwaps = pgTable("dex_swaps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Swap Identity
  txHash: text("tx_hash").notNull(),
  poolId: varchar("pool_id").notNull(),
  
  // Trader
  traderAddress: text("trader_address").notNull(),
  
  // Swap Details
  tokenInAddress: text("token_in_address").notNull(),
  tokenInSymbol: text("token_in_symbol").notNull(),
  tokenOutAddress: text("token_out_address").notNull(),
  tokenOutSymbol: text("token_out_symbol").notNull(),
  
  amountIn: text("amount_in").notNull(),
  amountOut: text("amount_out").notNull(),
  amountInUsd: text("amount_in_usd").notNull().default("0"),
  amountOutUsd: text("amount_out_usd").notNull().default("0"),
  
  // Pricing
  priceImpact: integer("price_impact").notNull().default(0), // basis points
  effectivePrice: text("effective_price").notNull(),
  
  // Fees
  feeAmount: text("fee_amount").notNull().default("0"),
  feeUsd: text("fee_usd").notNull().default("0"),
  
  // Slippage
  slippageTolerance: integer("slippage_tolerance").notNull().default(50), // basis points
  actualSlippage: integer("actual_slippage").notNull().default(0),
  
  // MEV Protection
  mevProtected: boolean("mev_protected").notNull().default(false),
  isPrivate: boolean("is_private").notNull().default(false), // Private mempool
  
  // Route (for multi-hop swaps)
  routePath: jsonb("route_path"), // Array of pool addresses
  isMultiHop: boolean("is_multi_hop").notNull().default(false),
  
  // AI Features
  aiOptimizedRoute: boolean("ai_optimized_route").notNull().default(false),
  aiPredictedPrice: text("ai_predicted_price"),
  aiConfidence: integer("ai_confidence"), // 0-100
  
  // Status
  status: text("status").notNull().default("pending"), // pending, completed, failed, cancelled
  failureReason: text("failure_reason"),
  
  // Block Info
  blockNumber: bigint("block_number", { mode: "number" }),
  blockTimestamp: bigint("block_timestamp", { mode: "number" }),
  
  // Gas
  gasUsed: bigint("gas_used", { mode: "number" }),
  gasPrice: text("gas_price"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

// ============================================
// DEX Price History (OHLCV Candles)
// ============================================

export const dexPriceHistory = pgTable("dex_price_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  poolId: varchar("pool_id").notNull(),
  
  // Time Period
  interval: text("interval").notNull(), // 1m, 5m, 15m, 1h, 4h, 1d, 1w
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  
  // OHLCV Data
  open: text("open").notNull(),
  high: text("high").notNull(),
  low: text("low").notNull(),
  close: text("close").notNull(),
  volume: text("volume").notNull().default("0"),
  volumeUsd: text("volume_usd").notNull().default("0"),
  
  // Trade Count
  tradeCount: integer("trade_count").notNull().default(0),
  
  // TWAP
  twap: text("twap").notNull(), // Time-weighted average price
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// DEX TWAP Oracle
// ============================================

export const dexTwapOracle = pgTable("dex_twap_oracle", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  poolId: varchar("pool_id").notNull(),
  
  // Observation Data
  observationIndex: integer("observation_index").notNull(),
  blockTimestamp: bigint("block_timestamp", { mode: "number" }).notNull(),
  
  // Cumulative Values
  tickCumulative: text("tick_cumulative").notNull(), // For concentrated liquidity
  secondsPerLiquidityCumulativeX128: text("seconds_per_liquidity_cumulative_x128").notNull(),
  
  // Price Accumulators
  price0CumulativeX128: text("price0_cumulative_x128").notNull(),
  price1CumulativeX128: text("price1_cumulative_x128").notNull(),
  
  // Cardinality
  initialized: boolean("initialized").notNull().default(false),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// DEX Circuit Breakers
// ============================================

export const dexCircuitBreakers = pgTable("dex_circuit_breakers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  poolId: varchar("pool_id").notNull().unique(),
  
  // Status
  status: text("status").notNull().default("normal"), // normal, warning, triggered, cooldown
  
  // Thresholds
  priceDeviationThreshold: integer("price_deviation_threshold").notNull().default(1000), // 10% in basis points
  volumeSpikeThreshold: integer("volume_spike_threshold").notNull().default(50000), // 500% in basis points
  liquidityDropThreshold: integer("liquidity_drop_threshold").notNull().default(3000), // 30% in basis points
  
  // Current Metrics
  currentPriceDeviation: integer("current_price_deviation").notNull().default(0),
  currentVolumeSpike: integer("current_volume_spike").notNull().default(0),
  currentLiquidityDrop: integer("current_liquidity_drop").notNull().default(0),
  
  // Trigger History
  lastTriggeredAt: timestamp("last_triggered_at"),
  triggerCount24h: integer("trigger_count_24h").notNull().default(0),
  triggerCountAllTime: integer("trigger_count_all_time").notNull().default(0),
  
  // Cooldown
  cooldownEndsAt: timestamp("cooldown_ends_at"),
  cooldownDurationMinutes: integer("cooldown_duration_minutes").notNull().default(15),
  
  // AI Assessment
  aiRiskLevel: text("ai_risk_level").notNull().default("low"), // low, medium, high, critical
  aiRecommendation: text("ai_recommendation"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// DEX MEV Protection Events
// ============================================

export const dexMevEvents = pgTable("dex_mev_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Event Details
  eventType: text("event_type").notNull(), // frontrun_detected, sandwich_detected, backrun_detected, flashloan_detected
  severity: text("severity").notNull().default("low"), // low, medium, high, critical
  
  // Related Transaction
  victimTxHash: text("victim_tx_hash"),
  attackerTxHash: text("attacker_tx_hash"),
  poolId: varchar("pool_id"),
  
  // Addresses
  victimAddress: text("victim_address"),
  attackerAddress: text("attacker_address"),
  
  // Financial Impact
  estimatedLossUsd: text("estimated_loss_usd").notNull().default("0"),
  preventedLossUsd: text("prevented_loss_usd").notNull().default("0"),
  
  // Detection
  detectionMethod: text("detection_method").notNull(), // ai_pattern, mempool_analysis, on_chain
  aiConfidence: integer("ai_confidence").notNull().default(0), // 0-100
  
  // Status
  status: text("status").notNull().default("detected"), // detected, mitigated, reported, resolved
  mitigationAction: text("mitigation_action"),
  
  // Block Info
  blockNumber: bigint("block_number", { mode: "number" }),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// ============================================
// DEX Liquidity Mining Rewards
// ============================================

export const dexLiquidityRewards = pgTable("dex_liquidity_rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  poolId: varchar("pool_id").notNull(),
  
  // Reward Token
  rewardTokenAddress: text("reward_token_address").notNull(),
  rewardTokenSymbol: text("reward_token_symbol").notNull(),
  
  // Reward Rate
  rewardRate: text("reward_rate").notNull(), // Tokens per second
  totalRewards: text("total_rewards").notNull(),
  distributedRewards: text("distributed_rewards").notNull().default("0"),
  
  // Duration
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  
  // Status
  isActive: boolean("is_active").notNull().default(true),
  
  // Boosters
  boostMultiplier: integer("boost_multiplier").notNull().default(10000), // 10000 = 1x, 15000 = 1.5x
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// DEX User Analytics
// ============================================

export const dexUserAnalytics = pgTable("dex_user_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userAddress: text("user_address").notNull().unique(),
  
  // Trading Stats
  totalSwaps: integer("total_swaps").notNull().default(0),
  totalVolumeUsd: text("total_volume_usd").notNull().default("0"),
  totalFeePaid: text("total_fee_paid").notNull().default("0"),
  
  // LP Stats
  totalPositions: integer("total_positions").notNull().default(0),
  activePositions: integer("active_positions").notNull().default(0),
  totalLiquidityProvidedUsd: text("total_liquidity_provided_usd").notNull().default("0"),
  totalFeesEarnedUsd: text("total_fees_earned_usd").notNull().default("0"),
  
  // PnL
  realizedPnlUsd: text("realized_pnl_usd").notNull().default("0"),
  unrealizedPnlUsd: text("unrealized_pnl_usd").notNull().default("0"),
  
  // Activity
  firstTradeAt: timestamp("first_trade_at"),
  lastTradeAt: timestamp("last_trade_at"),
  
  // Tier/Level
  traderTier: text("trader_tier").notNull().default("bronze"), // bronze, silver, gold, platinum, diamond
  feeDiscount: integer("fee_discount").notNull().default(0), // basis points discount
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// DEX Insert Schemas
// ============================================

export const insertDexPoolSchema = createInsertSchema(dexPools).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastSwapAt: true,
});

export const insertDexPoolAssetSchema = createInsertSchema(dexPoolAssets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDexPoolTickSchema = createInsertSchema(dexPoolTicks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDexPositionSchema = createInsertSchema(dexPositions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  closedAt: true,
});

export const insertDexSwapSchema = createInsertSchema(dexSwaps).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertDexPriceHistorySchema = createInsertSchema(dexPriceHistory).omit({
  id: true,
  createdAt: true,
});

export const insertDexTwapOracleSchema = createInsertSchema(dexTwapOracle).omit({
  id: true,
  createdAt: true,
});

export const insertDexCircuitBreakerSchema = createInsertSchema(dexCircuitBreakers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDexMevEventSchema = createInsertSchema(dexMevEvents).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
});

export const insertDexLiquidityRewardSchema = createInsertSchema(dexLiquidityRewards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDexUserAnalyticsSchema = createInsertSchema(dexUserAnalytics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================
// DEX Types
// ============================================

export type DexPool = typeof dexPools.$inferSelect;
export type InsertDexPool = z.infer<typeof insertDexPoolSchema>;

export type DexPoolAsset = typeof dexPoolAssets.$inferSelect;
export type InsertDexPoolAsset = z.infer<typeof insertDexPoolAssetSchema>;

export type DexPoolTick = typeof dexPoolTicks.$inferSelect;
export type InsertDexPoolTick = z.infer<typeof insertDexPoolTickSchema>;

export type DexPosition = typeof dexPositions.$inferSelect;
export type InsertDexPosition = z.infer<typeof insertDexPositionSchema>;

export type DexSwap = typeof dexSwaps.$inferSelect;
export type InsertDexSwap = z.infer<typeof insertDexSwapSchema>;

export type DexPriceHistory = typeof dexPriceHistory.$inferSelect;
export type InsertDexPriceHistory = z.infer<typeof insertDexPriceHistorySchema>;

export type DexTwapOracle = typeof dexTwapOracle.$inferSelect;
export type InsertDexTwapOracle = z.infer<typeof insertDexTwapOracleSchema>;

export type DexCircuitBreaker = typeof dexCircuitBreakers.$inferSelect;
export type InsertDexCircuitBreaker = z.infer<typeof insertDexCircuitBreakerSchema>;

export type DexMevEvent = typeof dexMevEvents.$inferSelect;
export type InsertDexMevEvent = z.infer<typeof insertDexMevEventSchema>;

export type DexLiquidityReward = typeof dexLiquidityRewards.$inferSelect;
export type InsertDexLiquidityReward = z.infer<typeof insertDexLiquidityRewardSchema>;

export type DexUserAnalytics = typeof dexUserAnalytics.$inferSelect;
export type InsertDexUserAnalytics = z.infer<typeof insertDexUserAnalyticsSchema>;

// ============================================
// DEX Frontend Types
// ============================================

export interface DexPoolSummary {
  id: string;
  name: string;
  symbol: string;
  poolType: DexPoolType;
  token0Symbol: string;
  token1Symbol: string;
  tvlUsd: string;
  volume24h: string;
  feeApy: number;
  status: DexPoolStatus;
}

export interface SwapQuote {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  priceImpact: number;
  route: string[];
  fees: string;
  minimumReceived: string;
  slippage: number;
  expiresAt: number;
}

export interface DexStats {
  totalPools: number;
  totalTvlUsd: string;
  totalVolume24h: string;
  totalFees24h: string;
  totalSwaps24h: number;
  topPools: DexPoolSummary[];
}

// ============================================
// LENDING/BORROWING SYSTEM
// ============================================

// Lending Market Status
export const LendingMarketStatus = {
  ACTIVE: "active",
  PAUSED: "paused",
  FROZEN: "frozen",
  DEPRECATED: "deprecated",
} as const;
export type LendingMarketStatus = typeof LendingMarketStatus[keyof typeof LendingMarketStatus];

// Interest Rate Model Type
export const InterestRateModel = {
  LINEAR: "linear",
  JUMP_RATE: "jump_rate",
  DYNAMIC: "dynamic",
  STABLE: "stable",
} as const;
export type InterestRateModel = typeof InterestRateModel[keyof typeof InterestRateModel];

// Borrow Rate Mode
export const BorrowRateMode = {
  VARIABLE: "variable",
  STABLE: "stable",
} as const;
export type BorrowRateMode = typeof BorrowRateMode[keyof typeof BorrowRateMode];

// Position Health Status
export const HealthStatus = {
  HEALTHY: "healthy",
  WARNING: "warning",
  AT_RISK: "at_risk",
  LIQUIDATABLE: "liquidatable",
} as const;
export type HealthStatus = typeof HealthStatus[keyof typeof HealthStatus];

// Liquidation Status
export const LiquidationStatus = {
  PENDING: "pending",
  EXECUTING: "executing",
  COMPLETED: "completed",
  FAILED: "failed",
  PARTIAL: "partial",
} as const;
export type LiquidationStatus = typeof LiquidationStatus[keyof typeof LiquidationStatus];

// ============================================
// Lending Markets (Asset Pools)
// ============================================

export const lendingMarkets = pgTable("lending_markets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Asset Info
  assetAddress: text("asset_address").notNull().unique(),
  assetSymbol: text("asset_symbol").notNull(),
  assetName: text("asset_name").notNull(),
  assetDecimals: integer("asset_decimals").notNull().default(18),
  priceFeedId: text("price_feed_id").notNull(),
  
  // Pool State
  totalSupply: text("total_supply").notNull().default("0"),
  totalBorrowed: text("total_borrowed").notNull().default("0"),
  totalReserves: text("total_reserves").notNull().default("0"),
  availableLiquidity: text("available_liquidity").notNull().default("0"),
  
  // Interest Rates (in basis points, e.g., 500 = 5.00%)
  supplyRate: integer("supply_rate").notNull().default(0),
  borrowRateVariable: integer("borrow_rate_variable").notNull().default(0),
  borrowRateStable: integer("borrow_rate_stable").notNull().default(0),
  utilizationRate: integer("utilization_rate").notNull().default(0), // basis points
  
  // Exchange Rate (for internal shares accounting)
  exchangeRate: text("exchange_rate").notNull().default("1000000000000000000"), // 1e18
  
  // Risk Parameters (in basis points)
  collateralFactor: integer("collateral_factor").notNull().default(7500), // 75% LTV
  liquidationThreshold: integer("liquidation_threshold").notNull().default(8000), // 80%
  liquidationPenalty: integer("liquidation_penalty").notNull().default(500), // 5% bonus
  reserveFactor: integer("reserve_factor").notNull().default(1000), // 10%
  
  // Caps
  supplyCap: text("supply_cap"), // null = unlimited
  borrowCap: text("borrow_cap"), // null = unlimited
  
  // Interest Rate Model Config
  interestRateModel: text("interest_rate_model").notNull().default("jump_rate"),
  baseRate: integer("base_rate").notNull().default(200), // 2%
  optimalUtilization: integer("optimal_utilization").notNull().default(8000), // 80%
  slope1: integer("slope_1").notNull().default(400), // 4%
  slope2: integer("slope_2").notNull().default(6000), // 60%
  
  // Permissions
  canBeCollateral: boolean("can_be_collateral").notNull().default(true),
  canBeBorrowed: boolean("can_be_borrowed").notNull().default(true),
  
  // Status
  status: text("status").notNull().default("active"),
  
  // Stats
  totalSuppliers: integer("total_suppliers").notNull().default(0),
  totalBorrowers: integer("total_borrowers").notNull().default(0),
  
  // Timestamps
  lastInterestUpdate: timestamp("last_interest_update").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// Lending User Positions (Aggregate per user)
// ============================================

export const lendingPositions = pgTable("lending_positions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userAddress: text("user_address").notNull().unique(),
  
  // Aggregate Values (in USD, as strings for precision)
  totalCollateralValueUsd: text("total_collateral_value_usd").notNull().default("0"),
  totalBorrowedValueUsd: text("total_borrowed_value_usd").notNull().default("0"),
  availableBorrowUsd: text("available_borrow_usd").notNull().default("0"),
  liquidationThresholdUsd: text("liquidation_threshold_usd").notNull().default("0"),
  
  // Health Factor (scaled by 10000, e.g., 15000 = 1.5)
  healthFactor: integer("health_factor").notNull().default(1000000), // very high = no borrows
  healthStatus: text("health_status").notNull().default("healthy"),
  
  // Net APY (basis points, can be negative if borrowing cost > supply yield)
  netApy: integer("net_apy").notNull().default(0),
  
  // Earned/Owed
  totalInterestEarned: text("total_interest_earned").notNull().default("0"),
  totalInterestOwed: text("total_interest_owed").notNull().default("0"),
  
  // Counts
  suppliedAssetCount: integer("supplied_asset_count").notNull().default(0),
  borrowedAssetCount: integer("borrowed_asset_count").notNull().default(0),
  
  // Activity
  lastActivityAt: timestamp("last_activity_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// Lending Supplies (User supply per market)
// ============================================

export const lendingSupplies = pgTable("lending_supplies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // References
  positionId: varchar("position_id").notNull(),
  marketId: varchar("market_id").notNull(),
  userAddress: text("user_address").notNull(),
  assetAddress: text("asset_address").notNull(),
  
  // Amount (Wei-unit strings)
  suppliedAmount: text("supplied_amount").notNull().default("0"),
  suppliedShares: text("supplied_shares").notNull().default("0"), // Internal accounting
  
  // Value
  suppliedValueUsd: text("supplied_value_usd").notNull().default("0"),
  
  // Collateral Flag
  isCollateral: boolean("is_collateral").notNull().default(true),
  
  // Interest
  supplyApy: integer("supply_apy").notNull().default(0), // basis points
  interestEarned: text("interest_earned").notNull().default("0"),
  
  // Timestamps
  lastUpdateAt: timestamp("last_update_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// Lending Borrows (User borrows per market)
// ============================================

export const lendingBorrows = pgTable("lending_borrows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // References
  positionId: varchar("position_id").notNull(),
  marketId: varchar("market_id").notNull(),
  userAddress: text("user_address").notNull(),
  assetAddress: text("asset_address").notNull(),
  
  // Principal Amount (Wei-unit strings)
  borrowedAmount: text("borrowed_amount").notNull().default("0"),
  borrowedShares: text("borrowed_shares").notNull().default("0"), // Internal accounting
  
  // Value
  borrowedValueUsd: text("borrowed_value_usd").notNull().default("0"),
  
  // Rate Mode
  rateMode: text("rate_mode").notNull().default("variable"),
  
  // Interest Rates (basis points)
  borrowApy: integer("borrow_apy").notNull().default(0),
  stableRate: integer("stable_rate"), // Only if stable mode
  
  // Accrued Interest
  accruedInterest: text("accrued_interest").notNull().default("0"),
  
  // Timestamps
  lastUpdateAt: timestamp("last_update_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// Lending Liquidations
// ============================================

export const lendingLiquidations = pgTable("lending_liquidations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Participants
  liquidatorAddress: text("liquidator_address").notNull(),
  borrowerAddress: text("borrower_address").notNull(),
  positionId: varchar("position_id").notNull(),
  
  // Assets
  collateralAsset: text("collateral_asset").notNull(),
  collateralSymbol: text("collateral_symbol").notNull(),
  debtAsset: text("debt_asset").notNull(),
  debtSymbol: text("debt_symbol").notNull(),
  
  // Amounts (Wei-unit strings)
  debtRepaid: text("debt_repaid").notNull(),
  collateralSeized: text("collateral_seized").notNull(),
  liquidationBonus: text("liquidation_bonus").notNull(),
  protocolFee: text("protocol_fee").notNull().default("0"),
  
  // Values in USD
  debtRepaidUsd: text("debt_repaid_usd").notNull(),
  collateralSeizedUsd: text("collateral_seized_usd").notNull(),
  
  // Health Factor (before and after)
  healthFactorBefore: integer("health_factor_before").notNull(),
  healthFactorAfter: integer("health_factor_after").notNull(),
  
  // Close Factor Used (basis points, max 5000 = 50%)
  closeFactorUsed: integer("close_factor_used").notNull(),
  
  // Status
  status: text("status").notNull().default("completed"),
  txHash: text("tx_hash"),
  
  // AI Analysis
  aiRiskAssessment: text("ai_risk_assessment"),
  aiRecommendation: text("ai_recommendation"),
  
  // Timestamps
  executedAt: timestamp("executed_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// Lending Interest Rate History
// ============================================

export const lendingRateHistory = pgTable("lending_rate_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  marketId: varchar("market_id").notNull(),
  assetSymbol: text("asset_symbol").notNull(),
  
  // Rates (basis points)
  supplyRate: integer("supply_rate").notNull(),
  borrowRateVariable: integer("borrow_rate_variable").notNull(),
  borrowRateStable: integer("borrow_rate_stable").notNull(),
  utilizationRate: integer("utilization_rate").notNull(),
  
  // Pool State at Snapshot
  totalSupply: text("total_supply").notNull(),
  totalBorrowed: text("total_borrowed").notNull(),
  
  // Block Info
  blockNumber: bigint("block_number", { mode: "number" }),
  
  // Timestamp
  recordedAt: timestamp("recorded_at").notNull().defaultNow(),
});

// ============================================
// Lending Transactions (Supply/Withdraw/Borrow/Repay)
// ============================================

export const lendingTransactions = pgTable("lending_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Type
  txType: text("tx_type").notNull(), // supply, withdraw, borrow, repay, liquidation, collateral_toggle
  
  // User
  userAddress: text("user_address").notNull(),
  positionId: varchar("position_id"),
  
  // Asset
  marketId: varchar("market_id").notNull(),
  assetAddress: text("asset_address").notNull(),
  assetSymbol: text("asset_symbol").notNull(),
  
  // Amounts
  amount: text("amount").notNull(),
  shares: text("shares").notNull().default("0"),
  amountUsd: text("amount_usd").notNull(),
  
  // Rate Info (for borrows)
  rateMode: text("rate_mode"),
  interestRate: integer("interest_rate"), // basis points
  
  // Receipt Data
  exchangeRate: text("exchange_rate"),
  
  // Health Factor (after transaction)
  healthFactorAfter: integer("health_factor_after"),
  
  // Status
  status: text("status").notNull().default("completed"),
  txHash: text("tx_hash"),
  
  // Block Info
  blockNumber: bigint("block_number", { mode: "number" }),
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// Lending Protocol Stats
// ============================================

export const lendingProtocolStats = pgTable("lending_protocol_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Aggregate Stats
  totalValueLockedUsd: text("total_value_locked_usd").notNull().default("0"),
  totalBorrowedUsd: text("total_borrowed_usd").notNull().default("0"),
  totalReservesUsd: text("total_reserves_usd").notNull().default("0"),
  
  // Market Stats
  activeMarkets: integer("active_markets").notNull().default(0),
  totalMarkets: integer("total_markets").notNull().default(0),
  
  // User Stats
  totalSuppliers: integer("total_suppliers").notNull().default(0),
  totalBorrowers: integer("total_borrowers").notNull().default(0),
  uniqueUsers: integer("unique_users").notNull().default(0),
  
  // Activity Stats (24h)
  volume24hSupply: text("volume_24h_supply").notNull().default("0"),
  volume24hBorrow: text("volume_24h_borrow").notNull().default("0"),
  volume24hRepay: text("volume_24h_repay").notNull().default("0"),
  liquidations24h: integer("liquidations_24h").notNull().default(0),
  liquidationVolume24hUsd: text("liquidation_volume_24h_usd").notNull().default("0"),
  
  // Protocol Revenue
  protocolRevenueUsd: text("protocol_revenue_usd").notNull().default("0"),
  
  // Average Rates (basis points)
  avgSupplyRate: integer("avg_supply_rate").notNull().default(0),
  avgBorrowRate: integer("avg_borrow_rate").notNull().default(0),
  avgUtilization: integer("avg_utilization").notNull().default(0),
  
  // Risk Metrics
  atRiskPositions: integer("at_risk_positions").notNull().default(0),
  liquidatablePositions: integer("liquidatable_positions").notNull().default(0),
  
  // Snapshot Time
  snapshotAt: timestamp("snapshot_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// Lending Insert Schemas
// ============================================

export const insertLendingMarketSchema = createInsertSchema(lendingMarkets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastInterestUpdate: true,
});

export const insertLendingPositionSchema = createInsertSchema(lendingPositions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastActivityAt: true,
});

export const insertLendingSupplySchema = createInsertSchema(lendingSupplies).omit({
  id: true,
  createdAt: true,
  lastUpdateAt: true,
});

export const insertLendingBorrowSchema = createInsertSchema(lendingBorrows).omit({
  id: true,
  createdAt: true,
  lastUpdateAt: true,
});

export const insertLendingLiquidationSchema = createInsertSchema(lendingLiquidations).omit({
  id: true,
  createdAt: true,
  executedAt: true,
});

export const insertLendingRateHistorySchema = createInsertSchema(lendingRateHistory).omit({
  id: true,
  recordedAt: true,
});

export const insertLendingTransactionSchema = createInsertSchema(lendingTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertLendingProtocolStatsSchema = createInsertSchema(lendingProtocolStats).omit({
  id: true,
  createdAt: true,
  snapshotAt: true,
});

// ============================================
// Lending Types
// ============================================

export type LendingMarket = typeof lendingMarkets.$inferSelect;
export type InsertLendingMarket = z.infer<typeof insertLendingMarketSchema>;

export type LendingPosition = typeof lendingPositions.$inferSelect;
export type InsertLendingPosition = z.infer<typeof insertLendingPositionSchema>;

export type LendingSupply = typeof lendingSupplies.$inferSelect;
export type InsertLendingSupply = z.infer<typeof insertLendingSupplySchema>;

export type LendingBorrow = typeof lendingBorrows.$inferSelect;
export type InsertLendingBorrow = z.infer<typeof insertLendingBorrowSchema>;

export type LendingLiquidation = typeof lendingLiquidations.$inferSelect;
export type InsertLendingLiquidation = z.infer<typeof insertLendingLiquidationSchema>;

export type LendingRateHistory = typeof lendingRateHistory.$inferSelect;
export type InsertLendingRateHistory = z.infer<typeof insertLendingRateHistorySchema>;

export type LendingTransaction = typeof lendingTransactions.$inferSelect;
export type InsertLendingTransaction = z.infer<typeof insertLendingTransactionSchema>;

export type LendingProtocolStats = typeof lendingProtocolStats.$inferSelect;
export type InsertLendingProtocolStats = z.infer<typeof insertLendingProtocolStatsSchema>;

// ============================================
// Lending Frontend Types
// ============================================

export interface LendingMarketSummary {
  id: string;
  assetSymbol: string;
  assetName: string;
  assetAddress: string;
  totalSupply: string;
  totalBorrowed: string;
  availableLiquidity: string;
  supplyApy: number; // percentage
  borrowApyVariable: number; // percentage
  borrowApyStable: number; // percentage
  utilizationRate: number; // percentage
  collateralFactor: number; // percentage
  liquidationThreshold: number; // percentage
  status: LendingMarketStatus;
}

export interface LendingUserPosition {
  userAddress: string;
  totalCollateralUsd: string;
  totalBorrowedUsd: string;
  availableBorrowUsd: string;
  healthFactor: number; // decimal (1.5 = 150% healthy)
  healthStatus: HealthStatus;
  netApy: number; // percentage, can be negative
  supplies: LendingSupplyDetail[];
  borrows: LendingBorrowDetail[];
}

export interface LendingSupplyDetail {
  marketId: string;
  assetSymbol: string;
  suppliedAmount: string;
  suppliedValueUsd: string;
  supplyApy: number;
  isCollateral: boolean;
  interestEarned: string;
}

export interface LendingBorrowDetail {
  marketId: string;
  assetSymbol: string;
  borrowedAmount: string;
  borrowedValueUsd: string;
  borrowApy: number;
  rateMode: BorrowRateMode;
  accruedInterest: string;
}

export interface LendingStats {
  totalValueLockedUsd: string;
  totalBorrowedUsd: string;
  totalMarkets: number;
  totalUsers: number;
  avgSupplyApy: number;
  avgBorrowApy: number;
  avgUtilization: number;
  liquidations24h: number;
}

// ============================================
// YIELD FARMING INFRASTRUCTURE (Phase 3)
// Enterprise-grade yield aggregation with DEX/Lending integration
// ============================================

// Yield Vaults - Core vault infrastructure for yield strategies
export const yieldVaults = pgTable("yield_vaults", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Vault Identity
  name: text("name").notNull(),
  symbol: text("symbol").notNull(), // Vault token symbol (e.g., "yvTBURN")
  description: text("description"),
  contractAddress: text("contract_address").notNull().unique(),
  
  // Underlying Asset
  underlyingAsset: text("underlying_asset").notNull(), // Asset address
  underlyingSymbol: text("underlying_symbol").notNull(),
  underlyingDecimals: integer("underlying_decimals").notNull().default(18),
  
  // Vault Type
  vaultType: text("vault_type").notNull().default("auto_compound"), // auto_compound, single_asset, lp_farm, leverage, delta_neutral
  strategyType: text("strategy_type").notNull().default("yield_aggregator"), // yield_aggregator, liquidity_mining, lending_optimizer, arbitrage
  riskLevel: text("risk_level").notNull().default("medium"), // low, medium, high, degen
  
  // Vault State
  totalDeposited: text("total_deposited").notNull().default("0"), // Wei
  totalShares: text("total_shares").notNull().default("0"), // Vault shares
  sharePrice: text("share_price").notNull().default("1000000000000000000"), // 1e18 initial
  
  // Value Tracking
  tvlUsd: text("tvl_usd").notNull().default("0"),
  allTimeHighTvl: text("all_time_high_tvl").notNull().default("0"),
  
  // APY/APR (basis points, e.g., 1500 = 15%)
  baseApy: integer("base_apy").notNull().default(0),
  boostApy: integer("boost_apy").notNull().default(0), // From boost multipliers
  rewardApy: integer("reward_apy").notNull().default(0), // From token rewards
  totalApy: integer("total_apy").notNull().default(0), // Combined APY
  apySource: text("apy_source").notNull().default("combined"), // dex_fees, lending_interest, liquidity_mining, combined
  
  // Performance Metrics
  dailyApy: integer("daily_apy").notNull().default(0),
  weeklyApy: integer("weekly_apy").notNull().default(0),
  monthlyApy: integer("monthly_apy").notNull().default(0),
  
  // Fees (basis points)
  depositFee: integer("deposit_fee").notNull().default(0), // Usually 0
  withdrawalFee: integer("withdrawal_fee").notNull().default(10), // 0.1%
  performanceFee: integer("performance_fee").notNull().default(1000), // 10% of profits
  managementFee: integer("management_fee").notNull().default(200), // 2% annual
  
  // Limits
  depositCap: text("deposit_cap"), // null = unlimited
  minDeposit: text("min_deposit").notNull().default("0"),
  maxDeposit: text("max_deposit"), // null = unlimited per user
  
  // Integration Links
  dexPoolId: varchar("dex_pool_id"), // Linked DEX pool for LP vaults
  lendingMarketId: varchar("lending_market_id"), // Linked lending market
  
  // AI Integration
  aiOptimized: boolean("ai_optimized").notNull().default(true),
  aiStrategyScore: integer("ai_strategy_score").notNull().default(8000), // AI confidence
  aiRiskScore: integer("ai_risk_score").notNull().default(5000), // Risk assessment
  
  // Status
  status: text("status").notNull().default("active"), // active, paused, deprecated, emergency
  isEmergencyWithdrawEnabled: boolean("is_emergency_withdraw_enabled").notNull().default(false),
  
  // Stats
  totalDepositors: integer("total_depositors").notNull().default(0),
  deposits24h: text("deposits_24h").notNull().default("0"),
  withdrawals24h: text("withdrawals_24h").notNull().default("0"),
  harvestCount: integer("harvest_count").notNull().default(0),
  lastHarvestAt: timestamp("last_harvest_at"),
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Yield Strategies - Specific strategies for vaults
export const yieldStrategies = pgTable("yield_strategies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Strategy Identity
  vaultId: varchar("vault_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  contractAddress: text("contract_address").notNull(),
  
  // Strategy Type
  strategyType: text("strategy_type").notNull(), // compound_lending, lp_stake, leverage_yield, flash_loan_arb
  protocol: text("protocol").notNull(), // Protocol name (e.g., "TBURN DEX", "TBURN Lending")
  
  // Allocation
  allocationPercent: integer("allocation_percent").notNull().default(10000), // basis points (10000 = 100%)
  currentValue: text("current_value").notNull().default("0"),
  
  // Performance
  currentApy: integer("current_apy").notNull().default(0), // basis points
  historicalApy: integer("historical_apy").notNull().default(0),
  profitGenerated: text("profit_generated").notNull().default("0"),
  lossIncurred: text("loss_incurred").notNull().default("0"),
  
  // Risk Parameters
  maxLeverage: integer("max_leverage").notNull().default(10000), // basis points (10000 = 1x)
  liquidationThreshold: integer("liquidation_threshold").notNull().default(8000), // 80%
  stopLossThreshold: integer("stop_loss_threshold").notNull().default(500), // 5% loss triggers exit
  
  // Strategy State
  isActive: boolean("is_active").notNull().default(true),
  lastExecutionAt: timestamp("last_execution_at"),
  executionCount: integer("execution_count").notNull().default(0),
  failureCount: integer("failure_count").notNull().default(0),
  
  // AI Optimization
  aiOptimized: boolean("ai_optimized").notNull().default(true),
  aiConfidenceScore: integer("ai_confidence_score").notNull().default(8000),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Yield Positions - User positions in vaults
export const yieldPositions = pgTable("yield_positions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Position Identity
  vaultId: varchar("vault_id").notNull(),
  userAddress: text("user_address").notNull(),
  
  // Position State
  depositedAmount: text("deposited_amount").notNull().default("0"), // Original deposit
  shares: text("shares").notNull().default("0"), // Vault shares owned
  currentValue: text("current_value").notNull().default("0"), // Current value in underlying
  currentValueUsd: text("current_value_usd").notNull().default("0"),
  
  // Profit/Loss
  totalProfit: text("total_profit").notNull().default("0"),
  totalProfitUsd: text("total_profit_usd").notNull().default("0"),
  unrealizedProfit: text("unrealized_profit").notNull().default("0"),
  realizedProfit: text("realized_profit").notNull().default("0"),
  
  // Rewards
  pendingRewards: text("pending_rewards").notNull().default("0"),
  claimedRewards: text("claimed_rewards").notNull().default("0"),
  
  // Boost Multiplier
  boostMultiplier: integer("boost_multiplier").notNull().default(10000), // 10000 = 1x
  boostEndTime: timestamp("boost_end_time"),
  
  // Lock Status
  isLocked: boolean("is_locked").notNull().default(false),
  lockEndTime: timestamp("lock_end_time"),
  lockDurationDays: integer("lock_duration_days").notNull().default(0),
  
  // Activity
  depositCount: integer("deposit_count").notNull().default(0),
  withdrawCount: integer("withdraw_count").notNull().default(0),
  lastDepositAt: timestamp("last_deposit_at"),
  lastWithdrawAt: timestamp("last_withdraw_at"),
  
  // Status
  status: text("status").notNull().default("active"), // active, withdrawn, liquidated
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Yield Harvests - Harvest/compound events
export const yieldHarvests = pgTable("yield_harvests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  vaultId: varchar("vault_id").notNull(),
  strategyId: varchar("strategy_id"),
  
  // Harvest Details
  harvestType: text("harvest_type").notNull(), // auto_compound, manual_harvest, reward_claim
  harvestedAmount: text("harvested_amount").notNull().default("0"),
  harvestedValueUsd: text("harvested_value_usd").notNull().default("0"),
  
  // Compounding
  compoundedAmount: text("compounded_amount").notNull().default("0"),
  newSharePrice: text("new_share_price").notNull(),
  oldSharePrice: text("old_share_price").notNull(),
  
  // Fees
  performanceFeeAmount: text("performance_fee_amount").notNull().default("0"),
  callerReward: text("caller_reward").notNull().default("0"),
  
  // Execution
  txHash: text("tx_hash"),
  gasUsed: bigint("gas_used", { mode: "number" }).notNull().default(0),
  executorAddress: text("executor_address"),
  
  // AI Optimization
  aiTriggered: boolean("ai_triggered").notNull().default(false),
  aiOptimalityScore: integer("ai_optimality_score"),
  
  executedAt: timestamp("executed_at").notNull().defaultNow(),
});

// Yield Rewards - Reward token emissions
export const yieldRewards = pgTable("yield_rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  vaultId: varchar("vault_id").notNull(),
  
  // Reward Token
  rewardToken: text("reward_token").notNull(),
  rewardSymbol: text("reward_symbol").notNull(),
  rewardDecimals: integer("reward_decimals").notNull().default(18),
  
  // Emission Schedule
  rewardPerSecond: text("reward_per_second").notNull().default("0"),
  rewardPerBlock: text("reward_per_block").notNull().default("0"),
  totalAllocated: text("total_allocated").notNull().default("0"),
  totalDistributed: text("total_distributed").notNull().default("0"),
  
  // Time Range
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  
  // Status
  isActive: boolean("is_active").notNull().default(true),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Yield Transactions - All farming transactions
export const yieldTransactions = pgTable("yield_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  vaultId: varchar("vault_id").notNull(),
  positionId: varchar("position_id"),
  userAddress: text("user_address").notNull(),
  
  // Transaction Type
  txType: text("tx_type").notNull(), // deposit, withdraw, harvest, claim_rewards, emergency_withdraw
  
  // Amounts
  amount: text("amount").notNull().default("0"),
  shares: text("shares").notNull().default("0"),
  valueUsd: text("value_usd").notNull().default("0"),
  
  // Share Price at Transaction
  sharePriceAtTx: text("share_price_at_tx").notNull(),
  
  // Fees
  feeAmount: text("fee_amount").notNull().default("0"),
  feeType: text("fee_type"), // deposit, withdrawal, performance
  
  // Execution
  txHash: text("tx_hash"),
  blockNumber: bigint("block_number", { mode: "number" }),
  status: text("status").notNull().default("pending"), // pending, completed, failed
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Yield Protocol Stats - Overall protocol analytics
export const yieldProtocolStats = pgTable("yield_protocol_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // TVL
  totalTvlUsd: text("total_tvl_usd").notNull().default("0"),
  tvlChange24h: text("tvl_change_24h").notNull().default("0"),
  tvlChange7d: text("tvl_change_7d").notNull().default("0"),
  
  // Vault Stats
  totalVaults: integer("total_vaults").notNull().default(0),
  activeVaults: integer("active_vaults").notNull().default(0),
  
  // User Stats
  totalUsers: integer("total_users").notNull().default(0),
  activeUsers24h: integer("active_users_24h").notNull().default(0),
  
  // Volume
  totalDeposits24h: text("total_deposits_24h").notNull().default("0"),
  totalWithdrawals24h: text("total_withdrawals_24h").notNull().default("0"),
  
  // Performance
  avgVaultApy: integer("avg_vault_apy").notNull().default(0),
  topVaultApy: integer("top_vault_apy").notNull().default(0),
  totalProfitGenerated: text("total_profit_generated").notNull().default("0"),
  
  // Protocol Revenue
  totalFeesCollected: text("total_fees_collected").notNull().default("0"),
  feesCollected24h: text("fees_collected_24h").notNull().default("0"),
  
  // Harvest Stats
  totalHarvests24h: integer("total_harvests_24h").notNull().default(0),
  avgHarvestAmount: text("avg_harvest_amount").notNull().default("0"),
  
  // AI Stats
  aiOptimizedVaults: integer("ai_optimized_vaults").notNull().default(0),
  aiSuggestedRebalances: integer("ai_suggested_rebalances").notNull().default(0),
  
  snapshotAt: timestamp("snapshot_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// Yield Farming Insert Schemas
// ============================================

export const insertYieldVaultSchema = createInsertSchema(yieldVaults).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertYieldStrategySchema = createInsertSchema(yieldStrategies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertYieldPositionSchema = createInsertSchema(yieldPositions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertYieldHarvestSchema = createInsertSchema(yieldHarvests).omit({
  id: true,
  executedAt: true,
});

export const insertYieldRewardSchema = createInsertSchema(yieldRewards).omit({
  id: true,
  createdAt: true,
});

export const insertYieldTransactionSchema = createInsertSchema(yieldTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertYieldProtocolStatsSchema = createInsertSchema(yieldProtocolStats).omit({
  id: true,
  createdAt: true,
  snapshotAt: true,
});

// ============================================
// Yield Farming Types
// ============================================

export type YieldVault = typeof yieldVaults.$inferSelect;
export type InsertYieldVault = z.infer<typeof insertYieldVaultSchema>;

export type YieldStrategy = typeof yieldStrategies.$inferSelect;
export type InsertYieldStrategy = z.infer<typeof insertYieldStrategySchema>;

export type YieldPosition = typeof yieldPositions.$inferSelect;
export type InsertYieldPosition = z.infer<typeof insertYieldPositionSchema>;

export type YieldHarvest = typeof yieldHarvests.$inferSelect;
export type InsertYieldHarvest = z.infer<typeof insertYieldHarvestSchema>;

export type YieldReward = typeof yieldRewards.$inferSelect;
export type InsertYieldReward = z.infer<typeof insertYieldRewardSchema>;

export type YieldTransaction = typeof yieldTransactions.$inferSelect;
export type InsertYieldTransaction = z.infer<typeof insertYieldTransactionSchema>;

export type YieldProtocolStats = typeof yieldProtocolStats.$inferSelect;
export type InsertYieldProtocolStats = z.infer<typeof insertYieldProtocolStatsSchema>;

// Yield Farming Frontend Types
export type YieldVaultType = "auto_compound" | "single_asset" | "lp_farm" | "leverage" | "delta_neutral";
export type YieldStrategyType = "yield_aggregator" | "liquidity_mining" | "lending_optimizer" | "arbitrage";
export type YieldRiskLevel = "low" | "medium" | "high" | "degen";
export type YieldTxType = "deposit" | "withdraw" | "harvest" | "claim_rewards" | "emergency_withdraw";

export interface YieldVaultSummary {
  id: string;
  name: string;
  symbol: string;
  underlyingSymbol: string;
  vaultType: YieldVaultType;
  riskLevel: YieldRiskLevel;
  tvlUsd: string;
  totalApy: number;
  baseApy: number;
  boostApy: number;
  rewardApy: number;
  totalDepositors: number;
  status: string;
  aiOptimized: boolean;
}

export interface YieldUserPosition {
  vaultId: string;
  vaultName: string;
  vaultSymbol: string;
  depositedAmount: string;
  currentValue: string;
  currentValueUsd: string;
  shares: string;
  profit: string;
  profitPercent: number;
  pendingRewards: string;
  boostMultiplier: number;
  isLocked: boolean;
  lockEndTime?: string;
}

export interface YieldFarmingStats {
  totalTvlUsd: string;
  totalVaults: number;
  activeVaults: number;
  totalUsers: number;
  avgVaultApy: number;
  topVaultApy: number;
  totalProfitGenerated: string;
  deposits24h: string;
  withdrawals24h: string;
}

// ============================================
// LIQUID STAKING INFRASTRUCTURE (Phase 4)
// ============================================

// Liquid Staking Pools - Main staking pool for LST token generation
export const liquidStakingPools = pgTable("liquid_staking_pools", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Pool Identity
  name: varchar("name", { length: 100 }).notNull(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  description: text("description"),
  contractAddress: varchar("contract_address", { length: 66 }).notNull().unique(),
  
  // LST Token Info
  lstTokenAddress: varchar("lst_token_address", { length: 66 }).notNull(),
  lstTokenSymbol: varchar("lst_token_symbol", { length: 20 }).notNull(),
  lstTokenDecimals: integer("lst_token_decimals").notNull().default(18),
  
  // Underlying Asset
  underlyingAsset: varchar("underlying_asset", { length: 66 }).notNull(),
  underlyingSymbol: varchar("underlying_symbol", { length: 20 }).notNull(),
  underlyingDecimals: integer("underlying_decimals").notNull().default(18),
  
  // Exchange Rate & Pricing
  exchangeRate: text("exchange_rate").notNull().default("1000000000000000000"),
  exchangeRatePrevious: text("exchange_rate_previous").notNull().default("1000000000000000000"),
  lastRebaseAt: timestamp("last_rebase_at").defaultNow(),
  rebaseIntervalSeconds: integer("rebase_interval_seconds").notNull().default(86400),
  
  // Pool Metrics
  totalStaked: text("total_staked").notNull().default("0"),
  totalStakedUsd: text("total_staked_usd").notNull().default("0"),
  totalLstMinted: text("total_lst_minted").notNull().default("0"),
  totalRewardsGenerated: text("total_rewards_generated").notNull().default("0"),
  
  // Validator Distribution
  validatorCount: integer("validator_count").notNull().default(0),
  minValidatorsPerBasket: integer("min_validators_per_basket").notNull().default(5),
  maxValidatorAllocation: integer("max_validator_allocation").notNull().default(2000),
  
  // APY & Performance
  currentApy: integer("current_apy").notNull().default(0),
  avgApy7d: integer("avg_apy_7d").notNull().default(0),
  avgApy30d: integer("avg_apy_30d").notNull().default(0),
  
  // Fees (basis points)
  mintFee: integer("mint_fee").notNull().default(10),
  redeemFee: integer("redeem_fee").notNull().default(10),
  performanceFee: integer("performance_fee").notNull().default(1000),
  protocolFee: integer("protocol_fee").notNull().default(100),
  
  // Limits
  minMintAmount: text("min_mint_amount").notNull().default("1000000000000000000"),
  maxMintAmount: text("max_mint_amount"),
  stakingCap: text("staking_cap"),
  
  // Status
  status: varchar("status", { length: 20 }).notNull().default("active"),
  isPaused: boolean("is_paused").notNull().default(false),
  aiOptimized: boolean("ai_optimized").notNull().default(false),
  
  // Stats
  totalStakers: integer("total_stakers").notNull().default(0),
  mints24h: text("mints_24h").notNull().default("0"),
  redeems24h: text("redeems_24h").notNull().default("0"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Validator Baskets - Groups of validators for LST pool
export const validatorBaskets = pgTable("validator_baskets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Pool Reference
  poolId: varchar("pool_id").notNull().references(() => liquidStakingPools.id),
  
  // Basket Identity
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  
  // Composition
  validatorAddresses: text("validator_addresses").array().notNull(),
  validatorWeights: integer("validator_weights").array().notNull(),
  totalValidators: integer("total_validators").notNull().default(0),
  
  // Allocation
  totalAllocated: text("total_allocated").notNull().default("0"),
  allocationPercentage: integer("allocation_percentage").notNull().default(0),
  
  // Performance
  avgValidatorScore: integer("avg_validator_score").notNull().default(0),
  avgUptime: integer("avg_uptime").notNull().default(10000),
  avgCommission: integer("avg_commission").notNull().default(500),
  
  // Risk
  riskScore: integer("risk_score").notNull().default(5000),
  diversificationScore: integer("diversification_score").notNull().default(0),
  
  // Status
  isActive: boolean("is_active").notNull().default(true),
  lastRebalanceAt: timestamp("last_rebalance_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// LST Positions - User holdings of LST tokens
export const lstPositions = pgTable("lst_positions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // References
  poolId: varchar("pool_id").notNull().references(() => liquidStakingPools.id),
  userAddress: varchar("user_address", { length: 66 }).notNull(),
  
  // Position Details
  lstBalance: text("lst_balance").notNull().default("0"),
  lstBalanceUsd: text("lst_balance_usd").notNull().default("0"),
  underlyingValue: text("underlying_value").notNull().default("0"),
  underlyingValueUsd: text("underlying_value_usd").notNull().default("0"),
  
  // Cost Basis
  totalMinted: text("total_minted").notNull().default("0"),
  totalRedeemed: text("total_redeemed").notNull().default("0"),
  avgMintPrice: text("avg_mint_price").notNull().default("1000000000000000000"),
  
  // Rewards
  accumulatedRewards: text("accumulated_rewards").notNull().default("0"),
  claimedRewards: text("claimed_rewards").notNull().default("0"),
  pendingRewards: text("pending_rewards").notNull().default("0"),
  
  // Activity
  mintCount: integer("mint_count").notNull().default(0),
  redeemCount: integer("redeem_count").notNull().default(0),
  lastMintAt: timestamp("last_mint_at"),
  lastRedeemAt: timestamp("last_redeem_at"),
  
  // Status
  status: varchar("status", { length: 20 }).notNull().default("active"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// LST Transactions - Mint and redeem history
export const lstTransactions = pgTable("lst_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // References
  poolId: varchar("pool_id").notNull().references(() => liquidStakingPools.id),
  positionId: varchar("position_id").references(() => lstPositions.id),
  userAddress: varchar("user_address", { length: 66 }).notNull(),
  
  // Transaction Details
  txType: varchar("tx_type", { length: 20 }).notNull(),
  txHash: varchar("tx_hash", { length: 66 }),
  
  // Amounts
  underlyingAmount: text("underlying_amount").notNull(),
  lstAmount: text("lst_amount").notNull(),
  exchangeRateAtTx: text("exchange_rate_at_tx").notNull(),
  valueUsd: text("value_usd").notNull().default("0"),
  
  // Fees
  feeAmount: text("fee_amount").notNull().default("0"),
  feeType: varchar("fee_type", { length: 20 }),
  
  // Status
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  failureReason: text("failure_reason"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// Rebase History - Exchange rate changes over time
export const rebaseHistory = pgTable("rebase_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  poolId: varchar("pool_id").notNull().references(() => liquidStakingPools.id),
  
  // Before/After
  previousRate: text("previous_rate").notNull(),
  newRate: text("new_rate").notNull(),
  rateChange: text("rate_change").notNull(),
  rateChangePercent: integer("rate_change_percent").notNull(),
  
  // Rewards
  rewardsDistributed: text("rewards_distributed").notNull().default("0"),
  rewardsFromValidators: text("rewards_from_validators").notNull().default("0"),
  rewardsFromMev: text("rewards_from_mev").notNull().default("0"),
  
  // Slashing
  slashingPenalty: text("slashing_penalty").notNull().default("0"),
  slashedValidators: integer("slashed_validators").notNull().default(0),
  
  // Pool State
  totalStakedAtRebase: text("total_staked_at_rebase").notNull(),
  totalLstAtRebase: text("total_lst_at_rebase").notNull(),
  
  // AI Optimization
  aiOptimized: boolean("ai_optimized").notNull().default(false),
  aiOptimizationScore: integer("ai_optimization_score"),
  
  executedAt: timestamp("executed_at").defaultNow().notNull(),
});

// LST Protocol Stats
export const lstProtocolStats = pgTable("lst_protocol_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Total Metrics
  totalStakedAcrossPools: text("total_staked_across_pools").notNull().default("0"),
  totalStakedUsd: text("total_staked_usd").notNull().default("0"),
  totalLstMinted: text("total_lst_minted").notNull().default("0"),
  
  // Pool Stats
  totalPools: integer("total_pools").notNull().default(0),
  activePools: integer("active_pools").notNull().default(0),
  
  // User Stats
  totalStakers: integer("total_stakers").notNull().default(0),
  activeStakers24h: integer("active_stakers_24h").notNull().default(0),
  
  // Volume
  totalMinted24h: text("total_minted_24h").notNull().default("0"),
  totalRedeemed24h: text("total_redeemed_24h").notNull().default("0"),
  
  // Rewards
  totalRewardsDistributed: text("total_rewards_distributed").notNull().default("0"),
  rewardsDistributed24h: text("rewards_distributed_24h").notNull().default("0"),
  
  // Performance
  avgPoolApy: integer("avg_pool_apy").notNull().default(0),
  topPoolApy: integer("top_pool_apy").notNull().default(0),
  
  // Validators
  totalValidatorsUsed: integer("total_validators_used").notNull().default(0),
  avgValidatorScore: integer("avg_validator_score").notNull().default(0),
  
  snapshotAt: timestamp("snapshot_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert Schemas
export const insertLiquidStakingPoolSchema = createInsertSchema(liquidStakingPools).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertValidatorBasketSchema = createInsertSchema(validatorBaskets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLstPositionSchema = createInsertSchema(lstPositions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLstTransactionSchema = createInsertSchema(lstTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertRebaseHistorySchema = createInsertSchema(rebaseHistory).omit({
  id: true,
  executedAt: true,
});

export const insertLstProtocolStatsSchema = createInsertSchema(lstProtocolStats).omit({
  id: true,
  snapshotAt: true,
  createdAt: true,
});

// Liquid Staking Types
export type LiquidStakingPool = typeof liquidStakingPools.$inferSelect;
export type InsertLiquidStakingPool = z.infer<typeof insertLiquidStakingPoolSchema>;

export type ValidatorBasket = typeof validatorBaskets.$inferSelect;
export type InsertValidatorBasket = z.infer<typeof insertValidatorBasketSchema>;

export type LstPosition = typeof lstPositions.$inferSelect;
export type InsertLstPosition = z.infer<typeof insertLstPositionSchema>;

export type LstTransaction = typeof lstTransactions.$inferSelect;
export type InsertLstTransaction = z.infer<typeof insertLstTransactionSchema>;

export type RebaseHistory = typeof rebaseHistory.$inferSelect;
export type InsertRebaseHistory = z.infer<typeof insertRebaseHistorySchema>;

export type LstProtocolStats = typeof lstProtocolStats.$inferSelect;
export type InsertLstProtocolStats = z.infer<typeof insertLstProtocolStatsSchema>;

// Liquid Staking Frontend Types
export type LstTxType = "mint" | "redeem" | "claim_rewards" | "restake";

export interface LstPoolSummary {
  id: string;
  name: string;
  symbol: string;
  lstTokenSymbol: string;
  exchangeRate: string;
  currentApy: number;
  totalStaked: string;
  totalStakedUsd: string;
  validatorCount: number;
  status: string;
}

export interface LstUserPosition {
  poolId: string;
  poolName: string;
  lstBalance: string;
  lstBalanceUsd: string;
  underlyingValue: string;
  pendingRewards: string;
  profit: string;
  profitPercent: number;
}

// ============================================
// PHASE 5: NFT MARKETPLACE
// ============================================

// NFT Collections - Collection metadata and royalty config
export const nftCollections = pgTable("nft_collections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Collection Info
  name: varchar("name", { length: 100 }).notNull(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  description: text("description"),
  
  // Contract
  contractAddress: varchar("contract_address", { length: 66 }).notNull().unique(),
  tokenStandard: varchar("token_standard", { length: 20 }).notNull().default("TBC-721"), // TBC-721, TBC-1155
  
  // Creator
  creatorAddress: varchar("creator_address", { length: 66 }).notNull(),
  creatorName: varchar("creator_name", { length: 100 }),
  verified: boolean("verified").notNull().default(false),
  
  // Images
  imageUrl: text("image_url"),
  bannerUrl: text("banner_url"),
  
  // Social
  website: text("website"),
  twitter: text("twitter"),
  discord: text("discord"),
  
  // Royalties (basis points, 250 = 2.5%)
  royaltyFee: integer("royalty_fee").notNull().default(250),
  royaltyRecipient: varchar("royalty_recipient", { length: 66 }),
  
  // Stats
  totalItems: integer("total_items").notNull().default(0),
  listedItems: integer("listed_items").notNull().default(0),
  owners: integer("owners").notNull().default(0),
  floorPrice: text("floor_price").notNull().default("0"),
  floorPriceUsd: text("floor_price_usd").notNull().default("0"),
  volume24h: text("volume_24h").notNull().default("0"),
  volume24hUsd: text("volume_24h_usd").notNull().default("0"),
  volumeTotal: text("volume_total").notNull().default("0"),
  volumeTotalUsd: text("volume_total_usd").notNull().default("0"),
  avgPrice24h: text("avg_price_24h").notNull().default("0"),
  salesCount24h: integer("sales_count_24h").notNull().default(0),
  salesCountTotal: integer("sales_count_total").notNull().default(0),
  
  // Market Cap
  marketCap: text("market_cap").notNull().default("0"),
  marketCapUsd: text("market_cap_usd").notNull().default("0"),
  
  // Status
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, paused, delisted
  featured: boolean("featured").notNull().default(false),
  
  // AI Enhancement
  aiRarityScore: integer("ai_rarity_score"),
  aiTrendScore: integer("ai_trend_score"),
  
  // Metadata
  category: varchar("category", { length: 50 }),
  tags: text("tags").array(),
  externalUrl: text("external_url"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// NFT Items - Individual NFTs within collections
export const nftItems = pgTable("nft_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // References
  collectionId: varchar("collection_id").notNull().references(() => nftCollections.id),
  
  // Token Info
  tokenId: text("token_id").notNull(),
  tokenUri: text("token_uri"),
  
  // Metadata
  name: varchar("name", { length: 200 }),
  description: text("description"),
  imageUrl: text("image_url"),
  animationUrl: text("animation_url"),
  externalUrl: text("external_url"),
  
  // Attributes (stored as JSON)
  attributes: jsonb("attributes"),
  
  // Ownership
  ownerAddress: varchar("owner_address", { length: 66 }).notNull(),
  creatorAddress: varchar("creator_address", { length: 66 }),
  
  // For TBC-1155
  totalSupply: integer("total_supply").notNull().default(1),
  availableSupply: integer("available_supply").notNull().default(1),
  
  // Rarity (AI-computed)
  rarityRank: integer("rarity_rank"),
  rarityScore: integer("rarity_score"), // basis points
  rarityTier: varchar("rarity_tier", { length: 20 }), // common, uncommon, rare, epic, legendary, mythic
  
  // Pricing
  lastSalePrice: text("last_sale_price"),
  lastSalePriceUsd: text("last_sale_price_usd"),
  lastSaleAt: timestamp("last_sale_at"),
  estimatedValue: text("estimated_value"),
  estimatedValueUsd: text("estimated_value_usd"),
  
  // Status
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, burned, frozen
  isListed: boolean("is_listed").notNull().default(false),
  
  // Minting
  mintTxHash: varchar("mint_tx_hash", { length: 66 }),
  mintedAt: timestamp("minted_at"),
  mintPrice: text("mint_price"),
  
  // AI Analysis
  aiAnalyzed: boolean("ai_analyzed").notNull().default(false),
  aiContentScore: integer("ai_content_score"),
  aiAuthenticityScore: integer("ai_authenticity_score"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Marketplace Listings - Active sale listings
export const marketplaceListings = pgTable("marketplace_listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // References
  collectionId: varchar("collection_id").notNull().references(() => nftCollections.id),
  itemId: varchar("item_id").notNull().references(() => nftItems.id),
  
  // Seller
  sellerAddress: varchar("seller_address", { length: 66 }).notNull(),
  
  // Listing Type
  listingType: varchar("listing_type", { length: 20 }).notNull().default("fixed"), // fixed, auction, dutch_auction
  
  // Pricing
  price: text("price").notNull(),
  priceUsd: text("price_usd").notNull().default("0"),
  currency: varchar("currency", { length: 20 }).notNull().default("TBURN"),
  
  // Auction fields
  startingPrice: text("starting_price"),
  reservePrice: text("reserve_price"),
  buyNowPrice: text("buy_now_price"),
  currentBid: text("current_bid"),
  currentBidder: varchar("current_bidder", { length: 66 }),
  bidCount: integer("bid_count").notNull().default(0),
  
  // Dutch auction fields
  endingPrice: text("ending_price"),
  priceDropInterval: integer("price_drop_interval"), // seconds
  
  // For TBC-1155
  quantity: integer("quantity").notNull().default(1),
  remainingQuantity: integer("remaining_quantity").notNull().default(1),
  
  // Timing
  startsAt: timestamp("starts_at").notNull(),
  expiresAt: timestamp("expires_at"),
  
  // Status
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, sold, cancelled, expired
  
  // Transaction
  txHash: varchar("tx_hash", { length: 66 }),
  
  // AI Features
  aiRecommendedPrice: text("ai_recommended_price"),
  aiPriceConfidence: integer("ai_price_confidence"),
  
  // Metadata
  signature: text("signature"),
  nonce: integer("nonce"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Marketplace Bids - Bids on listings
export const marketplaceBids = pgTable("marketplace_bids", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // References
  listingId: varchar("listing_id").notNull().references(() => marketplaceListings.id),
  collectionId: varchar("collection_id").notNull().references(() => nftCollections.id),
  itemId: varchar("item_id").notNull().references(() => nftItems.id),
  
  // Bidder
  bidderAddress: varchar("bidder_address", { length: 66 }).notNull(),
  
  // Bid Details
  bidAmount: text("bid_amount").notNull(),
  bidAmountUsd: text("bid_amount_usd").notNull().default("0"),
  currency: varchar("currency", { length: 20 }).notNull().default("TBURN"),
  
  // For TBC-1155
  quantity: integer("quantity").notNull().default(1),
  
  // Timing
  expiresAt: timestamp("expires_at"),
  
  // Status
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, accepted, outbid, cancelled, expired
  
  // Transaction
  txHash: varchar("tx_hash", { length: 66 }),
  
  // Escrow
  escrowAmount: text("escrow_amount").notNull().default("0"),
  escrowReleased: boolean("escrow_released").notNull().default(false),
  
  // Signature
  signature: text("signature"),
  nonce: integer("nonce"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Marketplace Sales - Completed sales history
export const marketplaceSales = pgTable("marketplace_sales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // References
  listingId: varchar("listing_id").references(() => marketplaceListings.id),
  bidId: varchar("bid_id").references(() => marketplaceBids.id),
  collectionId: varchar("collection_id").notNull().references(() => nftCollections.id),
  itemId: varchar("item_id").notNull().references(() => nftItems.id),
  
  // Parties
  sellerAddress: varchar("seller_address", { length: 66 }).notNull(),
  buyerAddress: varchar("buyer_address", { length: 66 }).notNull(),
  
  // Sale Type
  saleType: varchar("sale_type", { length: 20 }).notNull(), // fixed, auction, offer
  
  // Pricing
  salePrice: text("sale_price").notNull(),
  salePriceUsd: text("sale_price_usd").notNull().default("0"),
  currency: varchar("currency", { length: 20 }).notNull().default("TBURN"),
  
  // For TBC-1155
  quantity: integer("quantity").notNull().default(1),
  
  // Fees
  platformFee: text("platform_fee").notNull().default("0"),
  platformFeePercent: integer("platform_fee_percent").notNull().default(250), // basis points
  royaltyFee: text("royalty_fee").notNull().default("0"),
  royaltyFeePercent: integer("royalty_fee_percent").notNull().default(0),
  royaltyRecipient: varchar("royalty_recipient", { length: 66 }),
  
  // Net amounts
  sellerProceeds: text("seller_proceeds").notNull(),
  
  // Transaction
  txHash: varchar("tx_hash", { length: 66 }).notNull(),
  blockNumber: bigint("block_number", { mode: "number" }),
  
  // Timestamps
  soldAt: timestamp("sold_at").defaultNow().notNull(),
  settledAt: timestamp("settled_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// NFT Offers - Collection-wide or item-specific offers
export const nftOffers = pgTable("nft_offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Scope
  offerType: varchar("offer_type", { length: 20 }).notNull(), // item, collection
  
  // References
  collectionId: varchar("collection_id").notNull().references(() => nftCollections.id),
  itemId: varchar("item_id").references(() => nftItems.id),
  
  // Offerer
  offererAddress: varchar("offerer_address", { length: 66 }).notNull(),
  
  // Offer Details
  offerAmount: text("offer_amount").notNull(),
  offerAmountUsd: text("offer_amount_usd").notNull().default("0"),
  currency: varchar("currency", { length: 20 }).notNull().default("TBURN"),
  
  // For TBC-1155 or collection offers
  quantity: integer("quantity").notNull().default(1),
  
  // Timing
  expiresAt: timestamp("expires_at"),
  
  // Status
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, accepted, cancelled, expired
  
  // Escrow
  escrowAmount: text("escrow_amount").notNull().default("0"),
  escrowTxHash: varchar("escrow_tx_hash", { length: 66 }),
  
  // Signature
  signature: text("signature"),
  nonce: integer("nonce"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// NFT Activity Log - Track all NFT-related events
export const nftActivityLog = pgTable("nft_activity_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // References
  collectionId: varchar("collection_id").notNull().references(() => nftCollections.id),
  itemId: varchar("item_id").references(() => nftItems.id),
  
  // Event Details
  eventType: varchar("event_type", { length: 30 }).notNull(), // mint, list, delist, sale, bid, offer, transfer, burn
  
  // Parties
  fromAddress: varchar("from_address", { length: 66 }),
  toAddress: varchar("to_address", { length: 66 }),
  
  // Value
  price: text("price"),
  priceUsd: text("price_usd"),
  currency: varchar("currency", { length: 20 }),
  quantity: integer("quantity").notNull().default(1),
  
  // Transaction
  txHash: varchar("tx_hash", { length: 66 }),
  blockNumber: bigint("block_number", { mode: "number" }),
  
  // Related
  listingId: varchar("listing_id"),
  bidId: varchar("bid_id"),
  saleId: varchar("sale_id"),
  offerId: varchar("offer_id"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// NFT Marketplace Protocol Stats
export const nftMarketplaceStats = pgTable("nft_marketplace_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Volume
  volume24h: text("volume_24h").notNull().default("0"),
  volume24hUsd: text("volume_24h_usd").notNull().default("0"),
  volume7d: text("volume_7d").notNull().default("0"),
  volume7dUsd: text("volume_7d_usd").notNull().default("0"),
  volumeTotal: text("volume_total").notNull().default("0"),
  volumeTotalUsd: text("volume_total_usd").notNull().default("0"),
  
  // Sales
  salesCount24h: integer("sales_count_24h").notNull().default(0),
  salesCount7d: integer("sales_count_7d").notNull().default(0),
  salesCountTotal: integer("sales_count_total").notNull().default(0),
  
  // Collections
  totalCollections: integer("total_collections").notNull().default(0),
  activeCollections: integer("active_collections").notNull().default(0),
  verifiedCollections: integer("verified_collections").notNull().default(0),
  
  // Items
  totalItems: integer("total_items").notNull().default(0),
  listedItems: integer("listed_items").notNull().default(0),
  
  // Listings
  activeListings: integer("active_listings").notNull().default(0),
  auctionListings: integer("auction_listings").notNull().default(0),
  
  // Users
  totalUsers: integer("total_users").notNull().default(0),
  activeTraders24h: integer("active_traders_24h").notNull().default(0),
  
  // Fees
  totalPlatformFees: text("total_platform_fees").notNull().default("0"),
  platformFees24h: text("platform_fees_24h").notNull().default("0"),
  totalRoyalties: text("total_royalties").notNull().default("0"),
  royalties24h: text("royalties_24h").notNull().default("0"),
  
  // Floor Prices
  avgFloorPrice: text("avg_floor_price").notNull().default("0"),
  avgFloorPriceUsd: text("avg_floor_price_usd").notNull().default("0"),
  
  snapshotAt: timestamp("snapshot_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert Schemas for NFT Marketplace
export const insertNftCollectionSchema = createInsertSchema(nftCollections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNftItemSchema = createInsertSchema(nftItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMarketplaceListingSchema = createInsertSchema(marketplaceListings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMarketplaceBidSchema = createInsertSchema(marketplaceBids).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMarketplaceSaleSchema = createInsertSchema(marketplaceSales).omit({
  id: true,
  createdAt: true,
});

export const insertNftOfferSchema = createInsertSchema(nftOffers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNftActivityLogSchema = createInsertSchema(nftActivityLog).omit({
  id: true,
  createdAt: true,
});

export const insertNftMarketplaceStatsSchema = createInsertSchema(nftMarketplaceStats).omit({
  id: true,
  snapshotAt: true,
  createdAt: true,
});

// NFT Marketplace Types
export type NftCollection = typeof nftCollections.$inferSelect;
export type InsertNftCollection = z.infer<typeof insertNftCollectionSchema>;

export type NftItem = typeof nftItems.$inferSelect;
export type InsertNftItem = z.infer<typeof insertNftItemSchema>;

export type MarketplaceListing = typeof marketplaceListings.$inferSelect;
export type InsertMarketplaceListing = z.infer<typeof insertMarketplaceListingSchema>;

export type MarketplaceBid = typeof marketplaceBids.$inferSelect;
export type InsertMarketplaceBid = z.infer<typeof insertMarketplaceBidSchema>;

export type MarketplaceSale = typeof marketplaceSales.$inferSelect;
export type InsertMarketplaceSale = z.infer<typeof insertMarketplaceSaleSchema>;

export type NftOffer = typeof nftOffers.$inferSelect;
export type InsertNftOffer = z.infer<typeof insertNftOfferSchema>;

export type NftActivityLog = typeof nftActivityLog.$inferSelect;
export type InsertNftActivityLog = z.infer<typeof insertNftActivityLogSchema>;

export type NftMarketplaceStats = typeof nftMarketplaceStats.$inferSelect;
export type InsertNftMarketplaceStats = z.infer<typeof insertNftMarketplaceStatsSchema>;

// NFT Marketplace Frontend Types
export type NftListingType = "fixed" | "auction" | "dutch_auction";
export type NftSaleType = "fixed" | "auction" | "offer";
export type NftActivityType = "mint" | "list" | "delist" | "sale" | "bid" | "offer" | "transfer" | "burn";
export type NftRarityTier = "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic";

export interface NftCollectionSummary {
  id: string;
  name: string;
  symbol: string;
  imageUrl: string | null;
  verified: boolean;
  floorPrice: string;
  floorPriceUsd: string;
  volume24h: string;
  volume24hUsd: string;
  owners: number;
  totalItems: number;
  listedItems: number;
}

export interface NftItemWithListing {
  item: NftItem;
  listing: MarketplaceListing | null;
  collection: NftCollection;
}

export interface NftMarketOverview {
  totalVolume24h: string;
  totalSales24h: number;
  activeListings: number;
  topCollections: NftCollectionSummary[];
}

// ============================================
// NFT LAUNCHPAD SCHEMA (Phase 6)
// ============================================

export const launchpadProjects = pgTable("launchpad_projects", {
  id: varchar("id", { length: 66 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  bannerUrl: text("banner_url"),
  websiteUrl: text("website_url"),
  twitterUrl: text("twitter_url"),
  discordUrl: text("discord_url"),
  creatorAddress: varchar("creator_address", { length: 66 }).notNull(),
  totalSupply: numeric("total_supply", { precision: 40, scale: 0 }).notNull().default("10000"),
  mintPrice: numeric("mint_price", { precision: 40, scale: 0 }).notNull().default("0"),
  maxPerWallet: integer("max_per_wallet").notNull().default(10),
  royaltyBps: integer("royalty_bps").notNull().default(500),
  status: varchar("status", { length: 20 }).notNull().default("draft"),
  featured: boolean("featured").notNull().default(false),
  verified: boolean("verified").notNull().default(false),
  aiScore: real("ai_score"),
  aiAnalysis: jsonb("ai_analysis"),
  contractAddress: varchar("contract_address", { length: 66 }),
  category: varchar("category", { length: 50 }),
  tags: text("tags").array(),
  totalRaised: numeric("total_raised", { precision: 40, scale: 0 }).notNull().default("0"),
  totalMinted: integer("total_minted").notNull().default(0),
  uniqueMinters: integer("unique_minters").notNull().default(0),
  launchDate: timestamp("launch_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const launchRounds = pgTable("launch_rounds", {
  id: varchar("id", { length: 66 }).primaryKey(),
  projectId: varchar("project_id", { length: 66 }).notNull().references(() => launchpadProjects.id),
  roundNumber: integer("round_number").notNull().default(1),
  name: varchar("name", { length: 100 }).notNull(),
  roundType: varchar("round_type", { length: 30 }).notNull().default("public"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  price: numeric("price", { precision: 40, scale: 0 }).notNull(),
  allocation: integer("allocation").notNull(),
  maxPerWallet: integer("max_per_wallet").notNull().default(5),
  minPerWallet: integer("min_per_wallet").notNull().default(1),
  totalMinted: integer("total_minted").notNull().default(0),
  uniqueParticipants: integer("unique_participants").notNull().default(0),
  totalRaised: numeric("total_raised", { precision: 40, scale: 0 }).notNull().default("0"),
  whitelistRequired: boolean("whitelist_required").notNull().default(false),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const whitelistEntries = pgTable("whitelist_entries", {
  id: varchar("id", { length: 66 }).primaryKey(),
  projectId: varchar("project_id", { length: 66 }).notNull().references(() => launchpadProjects.id),
  roundId: varchar("round_id", { length: 66 }).references(() => launchRounds.id),
  walletAddress: varchar("wallet_address", { length: 66 }).notNull(),
  allocation: integer("allocation").notNull().default(1),
  used: integer("used").notNull().default(0),
  tier: varchar("tier", { length: 30 }),
  proofData: jsonb("proof_data"),
  addedBy: varchar("added_by", { length: 66 }),
  addedAt: timestamp("added_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

export const launchAllocations = pgTable("launch_allocations", {
  id: varchar("id", { length: 66 }).primaryKey(),
  projectId: varchar("project_id", { length: 66 }).notNull().references(() => launchpadProjects.id),
  roundId: varchar("round_id", { length: 66 }).notNull().references(() => launchRounds.id),
  walletAddress: varchar("wallet_address", { length: 66 }).notNull(),
  quantity: integer("quantity").notNull(),
  pricePerUnit: numeric("price_per_unit", { precision: 40, scale: 0 }).notNull(),
  totalPaid: numeric("total_paid", { precision: 40, scale: 0 }).notNull(),
  txHash: varchar("tx_hash", { length: 130 }),
  tokenIds: text("token_ids").array(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  mintedAt: timestamp("minted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vestingSchedules = pgTable("vesting_schedules", {
  id: varchar("id", { length: 66 }).primaryKey(),
  projectId: varchar("project_id", { length: 66 }).notNull().references(() => launchpadProjects.id),
  walletAddress: varchar("wallet_address", { length: 66 }).notNull(),
  totalAmount: numeric("total_amount", { precision: 40, scale: 0 }).notNull(),
  releasedAmount: numeric("released_amount", { precision: 40, scale: 0 }).notNull().default("0"),
  vestingType: varchar("vesting_type", { length: 30 }).notNull().default("linear"),
  startTime: timestamp("start_time").notNull(),
  cliffDuration: integer("cliff_duration").notNull().default(0),
  vestingDuration: integer("vesting_duration").notNull(),
  releaseInterval: integer("release_interval").notNull().default(86400),
  lastClaimTime: timestamp("last_claim_time"),
  nextClaimTime: timestamp("next_claim_time"),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const launchpadStats = pgTable("launchpad_stats", {
  id: varchar("id", { length: 66 }).primaryKey(),
  totalProjects: integer("total_projects").notNull().default(0),
  activeProjects: integer("active_projects").notNull().default(0),
  completedProjects: integer("completed_projects").notNull().default(0),
  totalRaised: numeric("total_raised", { precision: 40, scale: 0 }).notNull().default("0"),
  totalRaisedUsd: numeric("total_raised_usd", { precision: 40, scale: 2 }).notNull().default("0"),
  totalMinted: integer("total_minted").notNull().default(0),
  uniqueParticipants: integer("unique_participants").notNull().default(0),
  avgFundingRate: real("avg_funding_rate").default(0),
  featuredCount: integer("featured_count").notNull().default(0),
  snapshotAt: timestamp("snapshot_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const launchpadActivity = pgTable("launchpad_activity", {
  id: varchar("id", { length: 66 }).primaryKey(),
  projectId: varchar("project_id", { length: 66 }).notNull().references(() => launchpadProjects.id),
  roundId: varchar("round_id", { length: 66 }),
  walletAddress: varchar("wallet_address", { length: 66 }),
  eventType: varchar("event_type", { length: 30 }).notNull(),
  quantity: integer("quantity"),
  amount: numeric("amount", { precision: 40, scale: 0 }),
  txHash: varchar("tx_hash", { length: 130 }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// NFT Launchpad Insert Schemas
export const insertLaunchpadProjectSchema = createInsertSchema(launchpadProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLaunchRoundSchema = createInsertSchema(launchRounds).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWhitelistEntrySchema = createInsertSchema(whitelistEntries).omit({
  id: true,
  addedAt: true,
});

export const insertLaunchAllocationSchema = createInsertSchema(launchAllocations).omit({
  id: true,
  createdAt: true,
});

export const insertVestingScheduleSchema = createInsertSchema(vestingSchedules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLaunchpadStatsSchema = createInsertSchema(launchpadStats).omit({
  id: true,
  snapshotAt: true,
  createdAt: true,
});

export const insertLaunchpadActivitySchema = createInsertSchema(launchpadActivity).omit({
  id: true,
  createdAt: true,
});

// NFT Launchpad Types
export type LaunchpadProject = typeof launchpadProjects.$inferSelect;
export type InsertLaunchpadProject = z.infer<typeof insertLaunchpadProjectSchema>;

export type LaunchRound = typeof launchRounds.$inferSelect;
export type InsertLaunchRound = z.infer<typeof insertLaunchRoundSchema>;

export type WhitelistEntry = typeof whitelistEntries.$inferSelect;
export type InsertWhitelistEntry = z.infer<typeof insertWhitelistEntrySchema>;

export type LaunchAllocation = typeof launchAllocations.$inferSelect;
export type InsertLaunchAllocation = z.infer<typeof insertLaunchAllocationSchema>;

export type VestingSchedule = typeof vestingSchedules.$inferSelect;
export type InsertVestingSchedule = z.infer<typeof insertVestingScheduleSchema>;

export type LaunchpadStats = typeof launchpadStats.$inferSelect;
export type InsertLaunchpadStats = z.infer<typeof insertLaunchpadStatsSchema>;

export type LaunchpadActivity = typeof launchpadActivity.$inferSelect;
export type InsertLaunchpadActivity = z.infer<typeof insertLaunchpadActivitySchema>;

// NFT Launchpad Frontend Types
export type LaunchpadProjectStatus = "draft" | "pending" | "active" | "completed" | "cancelled";
export type LaunchRoundType = "whitelist" | "public" | "guaranteed" | "fcfs" | "raffle";
export type LaunchRoundStatus = "pending" | "active" | "completed" | "cancelled";
export type VestingType = "linear" | "cliff" | "stepped" | "instant";
export type LaunchpadEventType = "project_created" | "round_started" | "round_ended" | "mint" | "claim" | "whitelist_added";

export interface LaunchpadProjectSummary {
  id: string;
  name: string;
  symbol: string;
  imageUrl: string | null;
  status: string;
  totalSupply: string;
  totalMinted: number;
  mintPrice: string;
  launchDate: Date | null;
  verified: boolean;
  featured: boolean;
  progress: number;
}

export interface LaunchpadOverview {
  totalProjects: number;
  activeProjects: number;
  upcomingProjects: number;
  totalRaised: string;
  totalRaisedUsd: string;
  totalMinted: number;
  featuredProjects: LaunchpadProjectSummary[];
  upcomingLaunches: LaunchpadProjectSummary[];
  recentActivity: LaunchpadActivity[];
}

// ============================================
// GAMEFI INFRASTRUCTURE SCHEMA (Phase 7)
// ============================================

// GameFi Projects - Game projects integrated with TBURN blockchain
export const gamefiProjects = pgTable("gamefi_projects", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  shortDescription: varchar("short_description", { length: 256 }),
  imageUrl: varchar("image_url", { length: 512 }),
  bannerUrl: varchar("banner_url", { length: 512 }),
  website: varchar("website", { length: 256 }),
  developer: varchar("developer", { length: 100 }),
  developerAddress: varchar("developer_address", { length: 66 }),
  category: varchar("category", { length: 50 }).notNull().default("arcade"), // arcade, rpg, strategy, action, puzzle, card, racing, sports, casual
  genre: varchar("genre", { length: 50 }),
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, beta, coming_soon, maintenance, deprecated
  featured: boolean("featured").default(false),
  verified: boolean("verified").default(false),
  contractAddress: varchar("contract_address", { length: 66 }),
  chainId: integer("chain_id").default(1),
  tokenSymbol: varchar("token_symbol", { length: 20 }),
  nftContractAddress: varchar("nft_contract_address", { length: 66 }),
  totalPlayers: integer("total_players").default(0),
  activePlayers24h: integer("active_players_24h").default(0),
  totalVolume: numeric("total_volume", { precision: 40, scale: 0 }).default("0"),
  dailyVolume: numeric("daily_volume", { precision: 40, scale: 0 }).default("0"),
  totalRewardsDistributed: numeric("total_rewards_distributed", { precision: 40, scale: 0 }).default("0"),
  aiScore: real("ai_score"), // AI-assessed game quality and potential
  socialScore: integer("social_score").default(0), // Community engagement score
  rating: real("rating").default(0), // User rating (0-5)
  ratingCount: integer("rating_count").default(0),
  playToEarnEnabled: boolean("play_to_earn_enabled").default(true),
  stakingEnabled: boolean("staking_enabled").default(false),
  tournamentEnabled: boolean("tournament_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Game Assets - In-game NFT assets
export const gameAssets = pgTable("game_assets", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id", { length: 64 }).notNull(),
  tokenId: varchar("token_id", { length: 100 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  imageUrl: varchar("image_url", { length: 512 }),
  assetType: varchar("asset_type", { length: 50 }).notNull().default("item"), // character, weapon, armor, item, land, vehicle, pet, card, skin
  rarity: varchar("rarity", { length: 20 }).notNull().default("common"), // common, uncommon, rare, epic, legendary, mythic
  ownerAddress: varchar("owner_address", { length: 66 }),
  mintedAt: timestamp("minted_at"),
  lastTransferAt: timestamp("last_transfer_at"),
  price: numeric("price", { precision: 40, scale: 0 }),
  isListed: boolean("is_listed").default(false),
  isStaked: boolean("is_staked").default(false),
  stakingRewards: numeric("staking_rewards", { precision: 40, scale: 0 }).default("0"),
  attributes: jsonb("attributes"), // Game-specific attributes (level, power, stats, etc.)
  boosts: jsonb("boosts"), // In-game boosts and effects
  usageCount: integer("usage_count").default(0),
  winRate: real("win_rate"), // For competitive assets
  earnedRewards: numeric("earned_rewards", { precision: 40, scale: 0 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Game Rewards - Reward distribution tracking
export const gameRewards = pgTable("game_rewards", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id", { length: 64 }).notNull(),
  walletAddress: varchar("wallet_address", { length: 66 }).notNull(),
  rewardType: varchar("reward_type", { length: 50 }).notNull().default("gameplay"), // gameplay, tournament, staking, referral, achievement, daily, weekly
  amount: numeric("amount", { precision: 40, scale: 0 }).notNull(),
  tokenSymbol: varchar("token_symbol", { length: 20 }).default("TBURN"),
  reason: varchar("reason", { length: 256 }),
  txHash: varchar("tx_hash", { length: 130 }),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, claimed, expired
  metadata: jsonb("metadata"),
  expiresAt: timestamp("expires_at"),
  claimedAt: timestamp("claimed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Leaderboards - Game rankings
export const gameLeaderboards = pgTable("game_leaderboards", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id", { length: 64 }).notNull(),
  leaderboardType: varchar("leaderboard_type", { length: 50 }).notNull().default("global"), // global, daily, weekly, monthly, seasonal, tournament
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  walletAddress: varchar("wallet_address", { length: 66 }).notNull(),
  playerName: varchar("player_name", { length: 50 }),
  rank: integer("rank").notNull(),
  score: numeric("score", { precision: 40, scale: 0 }).notNull(),
  wins: integer("wins").default(0),
  losses: integer("losses").default(0),
  gamesPlayed: integer("games_played").default(0),
  winStreak: integer("win_streak").default(0),
  bestWinStreak: integer("best_win_streak").default(0),
  totalEarned: numeric("total_earned", { precision: 40, scale: 0 }).default("0"),
  rewardClaimed: boolean("reward_claimed").default(false),
  rewardAmount: numeric("reward_amount", { precision: 40, scale: 0 }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tournaments - Competitive events
export const gameTournaments = pgTable("game_tournaments", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id", { length: 64 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  imageUrl: varchar("image_url", { length: 512 }),
  tournamentType: varchar("tournament_type", { length: 50 }).notNull().default("single_elimination"), // single_elimination, double_elimination, round_robin, swiss, battle_royale, league
  status: varchar("status", { length: 20 }).notNull().default("upcoming"), // upcoming, registration, active, completed, cancelled
  entryFee: numeric("entry_fee", { precision: 40, scale: 0 }).default("0"),
  prizePool: numeric("prize_pool", { precision: 40, scale: 0 }).notNull(),
  prizeDistribution: jsonb("prize_distribution"), // {"1st": "50%", "2nd": "30%", "3rd": "20%"}
  maxParticipants: integer("max_participants").default(64),
  currentParticipants: integer("current_participants").default(0),
  minParticipants: integer("min_participants").default(2),
  requiresNft: boolean("requires_nft").default(false),
  requiredNftContract: varchar("required_nft_contract", { length: 66 }),
  registrationStart: timestamp("registration_start"),
  registrationEnd: timestamp("registration_end"),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  rules: text("rules"),
  metadata: jsonb("metadata"),
  winnerId: varchar("winner_id", { length: 66 }),
  runnerUpId: varchar("runner_up_id", { length: 66 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tournament Participants
export const tournamentParticipants = pgTable("tournament_participants", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id", { length: 64 }).notNull(),
  walletAddress: varchar("wallet_address", { length: 66 }).notNull(),
  playerName: varchar("player_name", { length: 50 }),
  teamName: varchar("team_name", { length: 100 }),
  status: varchar("status", { length: 20 }).notNull().default("registered"), // registered, checked_in, active, eliminated, winner, disqualified
  seed: integer("seed"),
  bracket: varchar("bracket", { length: 50 }),
  round: integer("round").default(0),
  wins: integer("wins").default(0),
  losses: integer("losses").default(0),
  score: numeric("score", { precision: 40, scale: 0 }).default("0"),
  placement: integer("placement"),
  prizeWon: numeric("prize_won", { precision: 40, scale: 0 }),
  prizeClaimed: boolean("prize_claimed").default(false),
  entryPaid: boolean("entry_paid").default(false),
  entryTxHash: varchar("entry_tx_hash", { length: 130 }),
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
  checkInAt: timestamp("check_in_at"),
  eliminatedAt: timestamp("eliminated_at"),
});

// Achievement Badges
export const achievementBadges = pgTable("achievement_badges", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id", { length: 64 }),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  imageUrl: varchar("image_url", { length: 512 }),
  category: varchar("category", { length: 50 }).notNull().default("gameplay"), // gameplay, social, collection, tournament, special, seasonal
  rarity: varchar("rarity", { length: 20 }).notNull().default("common"), // common, uncommon, rare, epic, legendary
  points: integer("points").default(10),
  requirement: jsonb("requirement"), // Conditions to earn the badge
  isGlobal: boolean("is_global").default(false), // Platform-wide vs game-specific
  isHidden: boolean("is_hidden").default(false), // Secret achievements
  totalUnlocks: integer("total_unlocks").default(0),
  rewardAmount: numeric("reward_amount", { precision: 40, scale: 0 }),
  rewardTokenSymbol: varchar("reward_token_symbol", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Player Achievements
export const playerAchievements = pgTable("player_achievements", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  badgeId: varchar("badge_id", { length: 64 }).notNull(),
  walletAddress: varchar("wallet_address", { length: 66 }).notNull(),
  projectId: varchar("project_id", { length: 64 }),
  progress: integer("progress").default(0), // 0-100
  isCompleted: boolean("is_completed").default(false),
  rewardClaimed: boolean("reward_claimed").default(false),
  claimTxHash: varchar("claim_tx_hash", { length: 130 }),
  unlockedAt: timestamp("unlocked_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// GameFi Activity Stream
export const gamefiActivity = pgTable("gamefi_activity", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id", { length: 64 }),
  walletAddress: varchar("wallet_address", { length: 66 }),
  eventType: varchar("event_type", { length: 50 }).notNull(), // game_started, game_ended, reward_earned, asset_minted, asset_transferred, tournament_joined, tournament_won, achievement_unlocked, level_up
  amount: numeric("amount", { precision: 40, scale: 0 }),
  assetId: varchar("asset_id", { length: 64 }),
  tournamentId: varchar("tournament_id", { length: 64 }),
  badgeId: varchar("badge_id", { length: 64 }),
  txHash: varchar("tx_hash", { length: 130 }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// GameFi Stats Snapshots
export const gamefiStats = pgTable("gamefi_stats", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  snapshotAt: timestamp("snapshot_at").defaultNow().notNull(),
  totalProjects: integer("total_projects").default(0),
  activeProjects: integer("active_projects").default(0),
  totalPlayers: integer("total_players").default(0),
  activePlayers24h: integer("active_players_24h").default(0),
  totalVolume: numeric("total_volume", { precision: 40, scale: 0 }).default("0"),
  dailyVolume: numeric("daily_volume", { precision: 40, scale: 0 }).default("0"),
  totalRewardsDistributed: numeric("total_rewards_distributed", { precision: 40, scale: 0 }).default("0"),
  dailyRewards: numeric("daily_rewards", { precision: 40, scale: 0 }).default("0"),
  activeTournaments: integer("active_tournaments").default(0),
  totalTournamentPrize: numeric("total_tournament_prize", { precision: 40, scale: 0 }).default("0"),
  totalAssets: integer("total_assets").default(0),
  totalAchievements: integer("total_achievements").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// GameFi Insert Schemas
export const insertGamefiProjectSchema = createInsertSchema(gamefiProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGameAssetSchema = createInsertSchema(gameAssets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGameRewardSchema = createInsertSchema(gameRewards).omit({
  id: true,
  createdAt: true,
});

export const insertGameLeaderboardSchema = createInsertSchema(gameLeaderboards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGameTournamentSchema = createInsertSchema(gameTournaments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTournamentParticipantSchema = createInsertSchema(tournamentParticipants).omit({
  id: true,
  registeredAt: true,
});

export const insertAchievementBadgeSchema = createInsertSchema(achievementBadges).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlayerAchievementSchema = createInsertSchema(playerAchievements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGamefiActivitySchema = createInsertSchema(gamefiActivity).omit({
  id: true,
  createdAt: true,
});

export const insertGamefiStatsSchema = createInsertSchema(gamefiStats).omit({
  id: true,
  snapshotAt: true,
  createdAt: true,
});

// GameFi Types
export type GamefiProject = typeof gamefiProjects.$inferSelect;
export type InsertGamefiProject = z.infer<typeof insertGamefiProjectSchema>;

export type GameAsset = typeof gameAssets.$inferSelect;
export type InsertGameAsset = z.infer<typeof insertGameAssetSchema>;

export type GameReward = typeof gameRewards.$inferSelect;
export type InsertGameReward = z.infer<typeof insertGameRewardSchema>;

export type GameLeaderboard = typeof gameLeaderboards.$inferSelect;
export type InsertGameLeaderboard = z.infer<typeof insertGameLeaderboardSchema>;

export type GameTournament = typeof gameTournaments.$inferSelect;
export type InsertGameTournament = z.infer<typeof insertGameTournamentSchema>;

export type TournamentParticipant = typeof tournamentParticipants.$inferSelect;
export type InsertTournamentParticipant = z.infer<typeof insertTournamentParticipantSchema>;

export type AchievementBadge = typeof achievementBadges.$inferSelect;
export type InsertAchievementBadge = z.infer<typeof insertAchievementBadgeSchema>;

export type PlayerAchievement = typeof playerAchievements.$inferSelect;
export type InsertPlayerAchievement = z.infer<typeof insertPlayerAchievementSchema>;

export type GamefiActivity = typeof gamefiActivity.$inferSelect;
export type InsertGamefiActivity = z.infer<typeof insertGamefiActivitySchema>;

export type GamefiStats = typeof gamefiStats.$inferSelect;
export type InsertGamefiStats = z.infer<typeof insertGamefiStatsSchema>;

// GameFi Frontend Types
export type GameCategory = "arcade" | "rpg" | "strategy" | "action" | "puzzle" | "card" | "racing" | "sports" | "casual";
export type GameStatus = "active" | "beta" | "coming_soon" | "maintenance" | "deprecated";
export type AssetType = "character" | "weapon" | "armor" | "item" | "land" | "vehicle" | "pet" | "card" | "skin";
export type AssetRarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic";
export type GameRewardType = "gameplay" | "tournament" | "staking" | "referral" | "achievement" | "daily" | "weekly";
export type TournamentType = "single_elimination" | "double_elimination" | "round_robin" | "swiss" | "battle_royale" | "league";
export type TournamentStatus = "upcoming" | "registration" | "active" | "completed" | "cancelled";
export type LeaderboardType = "global" | "daily" | "weekly" | "monthly" | "seasonal" | "tournament";
export type AchievementCategory = "gameplay" | "social" | "collection" | "tournament" | "special" | "seasonal";
export type GamefiEventType = "game_started" | "game_ended" | "reward_earned" | "asset_minted" | "asset_transferred" | "tournament_joined" | "tournament_won" | "achievement_unlocked" | "level_up";

export interface GamefiOverview {
  totalProjects: number;
  activeProjects: number;
  totalPlayers: number;
  activePlayers24h: number;
  totalVolume: string;
  dailyVolume: string;
  totalRewardsDistributed: string;
  activeTournaments: number;
  featuredProjects: GamefiProject[];
  topGames: GamefiProject[];
  recentActivity: GamefiActivity[];
}

// ============================================
// Phase 8: Cross-Chain Bridge Infrastructure
// Enterprise-Grade Multi-Chain Bridge with AI Security
// ============================================

// Bridge Chains - Supported blockchain networks
export const bridgeChains = pgTable("bridge_chains", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  chainId: integer("chain_id").notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  networkType: varchar("network_type", { length: 30 }).notNull().default("mainnet"), // mainnet, testnet, devnet
  rpcUrl: varchar("rpc_url", { length: 512 }),
  explorerUrl: varchar("explorer_url", { length: 512 }),
  iconUrl: varchar("icon_url", { length: 512 }),
  nativeCurrency: varchar("native_currency", { length: 20 }).notNull(),
  nativeDecimals: integer("native_decimals").default(18),
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, maintenance, deprecated, pending
  avgBlockTime: integer("avg_block_time").default(12000), // milliseconds
  confirmationsRequired: integer("confirmations_required").default(12),
  maxGasPrice: numeric("max_gas_price", { precision: 40, scale: 0 }),
  bridgeContractAddress: varchar("bridge_contract_address", { length: 66 }),
  tokenFactoryAddress: varchar("token_factory_address", { length: 66 }),
  totalLiquidity: numeric("total_liquidity", { precision: 40, scale: 0 }).default("0"),
  volume24h: numeric("volume_24h", { precision: 40, scale: 0 }).default("0"),
  volumeTotal: numeric("volume_total", { precision: 40, scale: 0 }).default("0"),
  txCount24h: integer("tx_count_24h").default(0),
  txCountTotal: integer("tx_count_total").default(0),
  avgTransferTime: integer("avg_transfer_time").default(60000), // milliseconds
  successRate: integer("success_rate").default(9900), // basis points (9900 = 99%)
  aiRiskScore: integer("ai_risk_score").default(100), // 0-1000, lower is safer
  isEvm: boolean("is_evm").default(true),
  supportsEip1559: boolean("supports_eip1559").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Bridge Routes - Optimized transfer routes between chains
export const bridgeRoutes = pgTable("bridge_routes", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  sourceChainId: integer("source_chain_id").notNull(),
  destinationChainId: integer("destination_chain_id").notNull(),
  tokenAddress: varchar("token_address", { length: 66 }).notNull(),
  tokenSymbol: varchar("token_symbol", { length: 20 }).notNull(),
  tokenDecimals: integer("token_decimals").default(18),
  wrappedTokenAddress: varchar("wrapped_token_address", { length: 66 }),
  routeType: varchar("route_type", { length: 30 }).notNull().default("lock_mint"), // lock_mint, burn_mint, liquidity_pool, atomic_swap
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, paused, deprecated
  minAmount: numeric("min_amount", { precision: 40, scale: 0 }).notNull().default("1000000000000000000"), // 1 token
  maxAmount: numeric("max_amount", { precision: 40, scale: 0 }).notNull().default("1000000000000000000000000"), // 1M tokens
  dailyLimit: numeric("daily_limit", { precision: 40, scale: 0 }).default("10000000000000000000000000"), // 10M tokens
  dailyUsed: numeric("daily_used", { precision: 40, scale: 0 }).default("0"),
  baseFee: numeric("base_fee", { precision: 40, scale: 0 }).default("0"), // Fixed fee in wei
  feePercent: integer("fee_percent").default(30), // basis points (30 = 0.3%)
  estimatedTime: integer("estimated_time").default(180000), // milliseconds
  avgTime: integer("avg_time").default(120000),
  successRate: integer("success_rate").default(9950), // basis points
  volume24h: numeric("volume_24h", { precision: 40, scale: 0 }).default("0"),
  volumeTotal: numeric("volume_total", { precision: 40, scale: 0 }).default("0"),
  txCount24h: integer("tx_count_24h").default(0),
  txCountTotal: integer("tx_count_total").default(0),
  liquidityAvailable: numeric("liquidity_available", { precision: 40, scale: 0 }).default("0"),
  aiOptimized: boolean("ai_optimized").default(true),
  aiPriority: integer("ai_priority").default(50), // 0-100, higher = more preferred
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Bridge Transfers - Cross-chain transfer records
export const bridgeTransfers = pgTable("bridge_transfers", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  routeId: varchar("route_id", { length: 64 }),
  sourceChainId: integer("source_chain_id").notNull(),
  destinationChainId: integer("destination_chain_id").notNull(),
  senderAddress: varchar("sender_address", { length: 66 }).notNull(),
  recipientAddress: varchar("recipient_address", { length: 66 }).notNull(),
  tokenAddress: varchar("token_address", { length: 66 }).notNull(),
  tokenSymbol: varchar("token_symbol", { length: 20 }).notNull(),
  amount: numeric("amount", { precision: 40, scale: 0 }).notNull(),
  amountReceived: numeric("amount_received", { precision: 40, scale: 0 }),
  feeAmount: numeric("fee_amount", { precision: 40, scale: 0 }).default("0"),
  feeToken: varchar("fee_token", { length: 20 }),
  status: varchar("status", { length: 30 }).notNull().default("pending"), // pending, confirming, bridging, relaying, completed, failed, refunded
  sourceTxHash: varchar("source_tx_hash", { length: 130 }),
  destinationTxHash: varchar("destination_tx_hash", { length: 130 }),
  sourceBlockNumber: bigint("source_block_number", { mode: "number" }),
  destinationBlockNumber: bigint("destination_block_number", { mode: "number" }),
  confirmations: integer("confirmations").default(0),
  requiredConfirmations: integer("required_confirmations").default(12),
  estimatedArrival: timestamp("estimated_arrival"),
  actualArrival: timestamp("actual_arrival"),
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0),
  aiVerified: boolean("ai_verified").default(false),
  aiRiskScore: integer("ai_risk_score"), // 0-1000
  aiRiskFactors: jsonb("ai_risk_factors"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Bridge Liquidity Pools - Per-chain liquidity management
export const bridgeLiquidityPools = pgTable("bridge_liquidity_pools", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  chainId: integer("chain_id").notNull(),
  tokenAddress: varchar("token_address", { length: 66 }).notNull(),
  tokenSymbol: varchar("token_symbol", { length: 20 }).notNull(),
  tokenDecimals: integer("token_decimals").default(18),
  poolAddress: varchar("pool_address", { length: 66 }),
  totalLiquidity: numeric("total_liquidity", { precision: 40, scale: 0 }).notNull().default("0"),
  availableLiquidity: numeric("available_liquidity", { precision: 40, scale: 0 }).notNull().default("0"),
  lockedLiquidity: numeric("locked_liquidity", { precision: 40, scale: 0 }).default("0"),
  utilizationRate: integer("utilization_rate").default(0), // basis points
  minLiquidity: numeric("min_liquidity", { precision: 40, scale: 0 }).default("0"),
  targetLiquidity: numeric("target_liquidity", { precision: 40, scale: 0 }).default("0"),
  lpTokenAddress: varchar("lp_token_address", { length: 66 }),
  lpTokenSupply: numeric("lp_token_supply", { precision: 40, scale: 0 }).default("0"),
  lpApy: integer("lp_apy").default(0), // basis points
  totalFeesEarned: numeric("total_fees_earned", { precision: 40, scale: 0 }).default("0"),
  fees24h: numeric("fees_24h", { precision: 40, scale: 0 }).default("0"),
  volume24h: numeric("volume_24h", { precision: 40, scale: 0 }).default("0"),
  txCount24h: integer("tx_count_24h").default(0),
  providerCount: integer("provider_count").default(0),
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, paused, depleted, rebalancing
  rebalanceThreshold: integer("rebalance_threshold").default(8000), // basis points (80%)
  lastRebalanceAt: timestamp("last_rebalance_at"),
  aiManagedRebalance: boolean("ai_managed_rebalance").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Bridge Liquidity Providers
export const bridgeLiquidityProviders = pgTable("bridge_liquidity_providers", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  poolId: varchar("pool_id", { length: 64 }).notNull(),
  providerAddress: varchar("provider_address", { length: 66 }).notNull(),
  depositedAmount: numeric("deposited_amount", { precision: 40, scale: 0 }).notNull().default("0"),
  lpTokenBalance: numeric("lp_token_balance", { precision: 40, scale: 0 }).notNull().default("0"),
  sharePercent: integer("share_percent").default(0), // basis points
  pendingRewards: numeric("pending_rewards", { precision: 40, scale: 0 }).default("0"),
  claimedRewards: numeric("claimed_rewards", { precision: 40, scale: 0 }).default("0"),
  totalEarned: numeric("total_earned", { precision: 40, scale: 0 }).default("0"),
  depositTxHash: varchar("deposit_tx_hash", { length: 130 }),
  lastClaimAt: timestamp("last_claim_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Bridge Validators/Relayers
export const bridgeValidators = pgTable("bridge_validators", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  address: varchar("address", { length: 66 }).notNull().unique(),
  name: varchar("name", { length: 100 }),
  operatorAddress: varchar("operator_address", { length: 66 }),
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, inactive, slashed, pending
  stake: numeric("stake", { precision: 40, scale: 0 }).notNull().default("0"),
  minStake: numeric("min_stake", { precision: 40, scale: 0 }).default("100000000000000000000000"), // 100k TBURN
  commission: integer("commission").default(500), // basis points
  uptime: integer("uptime").default(10000), // basis points
  attestationsProcessed: integer("attestations_processed").default(0),
  attestationsValid: integer("attestations_valid").default(0),
  attestationsFailed: integer("attestations_failed").default(0),
  slashCount: integer("slash_count").default(0),
  slashedAmount: numeric("slashed_amount", { precision: 40, scale: 0 }).default("0"),
  rewardsEarned: numeric("rewards_earned", { precision: 40, scale: 0 }).default("0"),
  rewardsClaimed: numeric("rewards_claimed", { precision: 40, scale: 0 }).default("0"),
  supportedChains: jsonb("supported_chains"), // Array of chain IDs
  avgResponseTime: integer("avg_response_time").default(0), // milliseconds
  lastActiveAt: timestamp("last_active_at"),
  aiTrustScore: integer("ai_trust_score").default(8000), // basis points
  reputationScore: integer("reputation_score").default(8500), // basis points
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Bridge Fee Configurations
export const bridgeFeeConfigs = pgTable("bridge_fee_configs", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  routeId: varchar("route_id", { length: 64 }),
  sourceChainId: integer("source_chain_id"),
  destinationChainId: integer("destination_chain_id"),
  tokenSymbol: varchar("token_symbol", { length: 20 }),
  feeType: varchar("fee_type", { length: 30 }).notNull().default("dynamic"), // fixed, dynamic, tiered, ai_optimized
  baseFee: numeric("base_fee", { precision: 40, scale: 0 }).default("0"),
  percentFee: integer("percent_fee").default(30), // basis points
  minFee: numeric("min_fee", { precision: 40, scale: 0 }).default("0"),
  maxFee: numeric("max_fee", { precision: 40, scale: 0 }),
  gasMultiplier: integer("gas_multiplier").default(150), // percent (150 = 1.5x)
  tierThresholds: jsonb("tier_thresholds"), // Amount tiers for fee discounts
  tierDiscounts: jsonb("tier_discounts"), // Discount percentages per tier
  aiAdjustment: integer("ai_adjustment").default(0), // basis points adjustment
  isActive: boolean("is_active").default(true),
  validFrom: timestamp("valid_from"),
  validTo: timestamp("valid_to"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Bridge Security Events
export const bridgeSecurityEvents = pgTable("bridge_security_events", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  eventType: varchar("event_type", { length: 50 }).notNull(), // suspicious_transfer, rate_limit_hit, validator_misbehavior, liquidity_attack, front_running, replay_attempt
  severity: varchar("severity", { length: 20 }).notNull().default("medium"), // low, medium, high, critical
  sourceChainId: integer("source_chain_id"),
  destinationChainId: integer("destination_chain_id"),
  transferId: varchar("transfer_id", { length: 64 }),
  validatorId: varchar("validator_id", { length: 64 }),
  walletAddress: varchar("wallet_address", { length: 66 }),
  txHash: varchar("tx_hash", { length: 130 }),
  amount: numeric("amount", { precision: 40, scale: 0 }),
  description: text("description"),
  aiDetected: boolean("ai_detected").default(false),
  aiConfidence: integer("ai_confidence"), // 0-1000
  aiRecommendation: text("ai_recommendation"),
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, investigating, resolved, false_positive
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: varchar("resolved_by", { length: 66 }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Bridge Analytics Snapshots
export const bridgeAnalytics = pgTable("bridge_analytics", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  snapshotAt: timestamp("snapshot_at").defaultNow().notNull(),
  totalChains: integer("total_chains").default(0),
  activeChains: integer("active_chains").default(0),
  totalRoutes: integer("total_routes").default(0),
  activeRoutes: integer("active_routes").default(0),
  totalValidators: integer("total_validators").default(0),
  activeValidators: integer("active_validators").default(0),
  totalLiquidity: numeric("total_liquidity", { precision: 40, scale: 0 }).default("0"),
  totalVolume: numeric("total_volume", { precision: 40, scale: 0 }).default("0"),
  volume24h: numeric("volume_24h", { precision: 40, scale: 0 }).default("0"),
  volume7d: numeric("volume_7d", { precision: 40, scale: 0 }).default("0"),
  transferCount24h: integer("transfer_count_24h").default(0),
  transferCountTotal: integer("transfer_count_total").default(0),
  uniqueUsers24h: integer("unique_users_24h").default(0),
  uniqueUsersTotal: integer("unique_users_total").default(0),
  avgTransferTime: integer("avg_transfer_time").default(0), // milliseconds
  successRate: integer("success_rate").default(9900), // basis points
  totalFees: numeric("total_fees", { precision: 40, scale: 0 }).default("0"),
  fees24h: numeric("fees_24h", { precision: 40, scale: 0 }).default("0"),
  securityEventsCount: integer("security_events_count").default(0),
  aiInterventions: integer("ai_interventions").default(0),
  topSourceChain: integer("top_source_chain"),
  topDestinationChain: integer("top_destination_chain"),
  topToken: varchar("top_token", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Bridge Activity Stream
export const bridgeActivity = pgTable("bridge_activity", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  eventType: varchar("event_type", { length: 50 }).notNull(), // transfer_initiated, transfer_completed, transfer_failed, liquidity_added, liquidity_removed, validator_joined, validator_slashed, route_updated, security_alert
  chainId: integer("chain_id"),
  transferId: varchar("transfer_id", { length: 64 }),
  validatorId: varchar("validator_id", { length: 64 }),
  poolId: varchar("pool_id", { length: 64 }),
  walletAddress: varchar("wallet_address", { length: 66 }),
  amount: numeric("amount", { precision: 40, scale: 0 }),
  tokenSymbol: varchar("token_symbol", { length: 20 }),
  txHash: varchar("tx_hash", { length: 130 }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Bridge Insert Schemas
export const insertBridgeChainSchema = createInsertSchema(bridgeChains).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBridgeRouteSchema = createInsertSchema(bridgeRoutes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBridgeTransferSchema = createInsertSchema(bridgeTransfers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBridgeLiquidityPoolSchema = createInsertSchema(bridgeLiquidityPools).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBridgeLiquidityProviderSchema = createInsertSchema(bridgeLiquidityProviders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBridgeValidatorSchema = createInsertSchema(bridgeValidators).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBridgeFeeConfigSchema = createInsertSchema(bridgeFeeConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBridgeSecurityEventSchema = createInsertSchema(bridgeSecurityEvents).omit({
  id: true,
  createdAt: true,
});

export const insertBridgeAnalyticsSchema = createInsertSchema(bridgeAnalytics).omit({
  id: true,
  snapshotAt: true,
  createdAt: true,
});

export const insertBridgeActivitySchema = createInsertSchema(bridgeActivity).omit({
  id: true,
  createdAt: true,
});

// Bridge Types
export type BridgeChain = typeof bridgeChains.$inferSelect;
export type InsertBridgeChain = z.infer<typeof insertBridgeChainSchema>;

export type BridgeRoute = typeof bridgeRoutes.$inferSelect;
export type InsertBridgeRoute = z.infer<typeof insertBridgeRouteSchema>;

export type BridgeTransfer = typeof bridgeTransfers.$inferSelect;
export type InsertBridgeTransfer = z.infer<typeof insertBridgeTransferSchema>;

export type BridgeLiquidityPool = typeof bridgeLiquidityPools.$inferSelect;
export type InsertBridgeLiquidityPool = z.infer<typeof insertBridgeLiquidityPoolSchema>;

export type BridgeLiquidityProvider = typeof bridgeLiquidityProviders.$inferSelect;
export type InsertBridgeLiquidityProvider = z.infer<typeof insertBridgeLiquidityProviderSchema>;

export type BridgeValidator = typeof bridgeValidators.$inferSelect;
export type InsertBridgeValidator = z.infer<typeof insertBridgeValidatorSchema>;

export type BridgeFeeConfig = typeof bridgeFeeConfigs.$inferSelect;
export type InsertBridgeFeeConfig = z.infer<typeof insertBridgeFeeConfigSchema>;

export type BridgeSecurityEvent = typeof bridgeSecurityEvents.$inferSelect;
export type InsertBridgeSecurityEvent = z.infer<typeof insertBridgeSecurityEventSchema>;

export type BridgeAnalytics = typeof bridgeAnalytics.$inferSelect;
export type InsertBridgeAnalytics = z.infer<typeof insertBridgeAnalyticsSchema>;

export type BridgeActivity = typeof bridgeActivity.$inferSelect;
export type InsertBridgeActivity = z.infer<typeof insertBridgeActivitySchema>;

// Bridge Frontend Types
export type ChainStatus = "active" | "maintenance" | "deprecated" | "pending";
export type RouteType = "lock_mint" | "burn_mint" | "liquidity_pool" | "atomic_swap";
export type RouteStatus = "active" | "paused" | "deprecated";
export type TransferStatus = "pending" | "confirming" | "bridging" | "relaying" | "completed" | "failed" | "refunded";
export type PoolStatus = "active" | "paused" | "depleted" | "rebalancing";
export type ValidatorStatus = "active" | "inactive" | "slashed" | "pending";
export type FeeType = "fixed" | "dynamic" | "tiered" | "ai_optimized";
export type SecurityEventType = "suspicious_transfer" | "rate_limit_hit" | "validator_misbehavior" | "liquidity_attack" | "front_running" | "replay_attempt";
export type SecuritySeverity = "low" | "medium" | "high" | "critical";
export type BridgeEventType = "transfer_initiated" | "transfer_completed" | "transfer_failed" | "liquidity_added" | "liquidity_removed" | "validator_joined" | "validator_slashed" | "route_updated" | "security_alert";

export interface BridgeOverview {
  totalChains: number;
  activeChains: number;
  totalRoutes: number;
  activeRoutes: number;
  totalValidators: number;
  activeValidators: number;
  totalLiquidity: string;
  totalVolume: string;
  volume24h: string;
  transferCount24h: number;
  avgTransferTime: number;
  successRate: number;
  fees24h: string;
  securityEventsCount: number;
  topChains: BridgeChain[];
  recentTransfers: BridgeTransfer[];
  recentActivity: BridgeActivity[];
}

// ============================================
// Phase 9: Community System Infrastructure
// Enterprise-Grade Community Platform with Real-time Engagement
// ============================================

// Community Posts - Forum discussions
export const communityPosts = pgTable("community_posts", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  authorId: integer("author_id").notNull(),
  authorAddress: varchar("author_address", { length: 66 }).notNull(),
  authorUsername: varchar("author_username", { length: 100 }),
  title: varchar("title", { length: 256 }).notNull(),
  titleKo: varchar("title_ko", { length: 500 }),
  content: text("content").notNull(),
  contentKo: text("content_ko"),
  category: varchar("category", { length: 50 }).notNull().default("general"),
  tags: text("tags").array().default([]),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  isPinned: boolean("is_pinned").default(false),
  isHot: boolean("is_hot").default(false),
  isLocked: boolean("is_locked").default(false),
  likes: integer("likes").default(0),
  views: integer("views").default(0),
  commentCount: integer("comment_count").default(0),
  lastActivityAt: timestamp("last_activity_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Community Comments - Post replies
export const communityComments = pgTable("community_comments", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id", { length: 64 }).notNull(),
  authorId: integer("author_id").notNull(),
  authorAddress: varchar("author_address", { length: 66 }).notNull(),
  authorUsername: varchar("author_username", { length: 100 }),
  content: text("content").notNull(),
  parentCommentId: varchar("parent_comment_id", { length: 64 }),
  likes: integer("likes").default(0),
  isEdited: boolean("is_edited").default(false),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Community Events - Scheduled events
export const communityEvents = pgTable("community_events", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 256 }).notNull(),
  titleKo: varchar("title_ko", { length: 256 }),
  description: text("description").notNull(),
  descriptionKo: text("description_ko"),
  eventType: varchar("event_type", { length: 30 }).notNull().default("meetup"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  location: varchar("location", { length: 256 }),
  isOnline: boolean("is_online").default(true),
  meetingUrl: varchar("meeting_url", { length: 512 }),
  participants: integer("participants").default(0),
  maxParticipants: integer("max_participants"),
  rewards: varchar("rewards", { length: 100 }),
  status: varchar("status", { length: 20 }).notNull().default("upcoming"),
  organizerId: integer("organizer_id"),
  coverImage: varchar("cover_image", { length: 512 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Community Announcements - Official announcements
export const communityAnnouncements = pgTable("community_announcements", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 256 }).notNull(),
  titleKo: varchar("title_ko", { length: 256 }),
  content: text("content").notNull(),
  contentKo: text("content_ko"),
  announcementType: varchar("announcement_type", { length: 30 }).notNull().default("news"),
  isImportant: boolean("is_important").default(false),
  isPinned: boolean("is_pinned").default(false),
  expiresAt: timestamp("expires_at"),
  authorId: integer("author_id"),
  views: integer("views").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Community Badges - Badge definitions
export const communityBadges = pgTable("community_badges", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 50 }).notNull(),
  rarity: varchar("rarity", { length: 20 }).notNull().default("common"),
  category: varchar("category", { length: 50 }).notNull().default("general"),
  requirement: text("requirement"),
  requirementValue: integer("requirement_value"),
  isAutoAwarded: boolean("is_auto_awarded").default(false),
  pointsValue: integer("points_value").default(10),
  totalAwarded: integer("total_awarded").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Community User Badges - Badges earned by users
export const communityUserBadges = pgTable("community_user_badges", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull(),
  userAddress: varchar("user_address", { length: 66 }).notNull(),
  badgeId: varchar("badge_id", { length: 64 }).notNull(),
  progress: integer("progress").default(0),
  isCompleted: boolean("is_completed").default(false),
  earnedAt: timestamp("earned_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Community Activity Feed - Real-time activity stream
export const communityActivity = pgTable("community_activity", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull(),
  userAddress: varchar("user_address", { length: 66 }).notNull(),
  username: varchar("username", { length: 100 }),
  activityType: varchar("activity_type", { length: 30 }).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  targetId: varchar("target_id", { length: 64 }),
  targetTitle: varchar("target_title", { length: 256 }),
  amount: varchar("amount", { length: 100 }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Community Reputation - User reputation tracking
export const communityReputation = pgTable("community_reputation", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull().unique(),
  userAddress: varchar("user_address", { length: 66 }).notNull(),
  reputation: integer("reputation").default(0),
  level: integer("level").default(1),
  contributions: integer("contributions").default(0),
  postsCount: integer("posts_count").default(0),
  commentsCount: integer("comments_count").default(0),
  likesReceived: integer("likes_received").default(0),
  likesGiven: integer("likes_given").default(0),
  proposalsCreated: integer("proposals_created").default(0),
  proposalsVoted: integer("proposals_voted").default(0),
  eventsAttended: integer("events_attended").default(0),
  badgesEarned: integer("badges_earned").default(0),
  lastActivityAt: timestamp("last_activity_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas for community tables
export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({
  id: true,
  likes: true,
  views: true,
  commentCount: true,
  lastActivityAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommunityCommentSchema = createInsertSchema(communityComments).omit({
  id: true,
  likes: true,
  isEdited: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommunityEventSchema = createInsertSchema(communityEvents).omit({
  id: true,
  participants: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommunityAnnouncementSchema = createInsertSchema(communityAnnouncements).omit({
  id: true,
  views: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommunityBadgeSchema = createInsertSchema(communityBadges).omit({
  id: true,
  totalAwarded: true,
  createdAt: true,
});

export const insertCommunityUserBadgeSchema = createInsertSchema(communityUserBadges).omit({
  id: true,
  createdAt: true,
});

export const insertCommunityActivitySchema = createInsertSchema(communityActivity).omit({
  id: true,
  createdAt: true,
});

export const insertCommunityReputationSchema = createInsertSchema(communityReputation).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Community Types
export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;

export type CommunityComment = typeof communityComments.$inferSelect;
export type InsertCommunityComment = z.infer<typeof insertCommunityCommentSchema>;

export type CommunityEvent = typeof communityEvents.$inferSelect;
export type InsertCommunityEvent = z.infer<typeof insertCommunityEventSchema>;

export type CommunityAnnouncement = typeof communityAnnouncements.$inferSelect;
export type InsertCommunityAnnouncement = z.infer<typeof insertCommunityAnnouncementSchema>;

export type CommunityBadge = typeof communityBadges.$inferSelect;
export type InsertCommunityBadge = z.infer<typeof insertCommunityBadgeSchema>;

export type CommunityUserBadge = typeof communityUserBadges.$inferSelect;
export type InsertCommunityUserBadge = z.infer<typeof insertCommunityUserBadgeSchema>;

export type CommunityActivityType = typeof communityActivity.$inferSelect;
export type InsertCommunityActivity = z.infer<typeof insertCommunityActivitySchema>;

export type CommunityReputationType = typeof communityReputation.$inferSelect;
export type InsertCommunityReputation = z.infer<typeof insertCommunityReputationSchema>;

// Community Frontend Types
export type PostCategory = "general" | "technical" | "governance" | "trading" | "support" | "announcements";
export type PostStatus = "active" | "hidden" | "deleted" | "pending";
export type EventType = "ama" | "workshop" | "hackathon" | "meetup" | "airdrop" | "competition";
export type EventStatus = "upcoming" | "live" | "ended" | "cancelled";
export type AnnouncementType = "update" | "news" | "alert" | "feature";
export type BadgeRarity = "common" | "rare" | "epic" | "legendary";
export type CommunityActivityEventType = "post" | "comment" | "stake" | "vote" | "proposal" | "badge" | "reward" | "event";

export interface CommunityStats {
  totalMembers: number;
  activeMembers: number;
  totalPosts: number;
  totalComments: number;
  totalProposals: number;
  activeProposals: number;
  totalEvents: number;
  upcomingEvents: number;
  totalRewards: string;
  weeklyGrowth: number;
}

export interface CommunityLeaderboardMember {
  id: string;
  rank: number;
  address: string;
  username: string;
  avatar?: string;
  reputation: number;
  contributions: number;
  badges: string[];
  level: number;
  tburnStaked: string;
  joinedDate: number;
  isOnline: boolean;
}

export interface CommunityOverview {
  stats: CommunityStats;
  leaderboard: CommunityLeaderboardMember[];
  recentPosts: CommunityPost[];
  upcomingEvents: CommunityEvent[];
  announcements: CommunityAnnouncement[];
  recentActivity: CommunityActivityType[];
}

// Community Post Reactions - Like/Dislike system with persistence
export const communityPostReactions = pgTable("community_post_reactions", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id", { length: 64 }).notNull(),
  userId: integer("user_id").notNull(),
  userAddress: varchar("user_address", { length: 66 }).notNull(),
  reactionType: varchar("reaction_type", { length: 10 }).notNull(), // 'like' or 'dislike'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Community Comment Reactions - Like/Dislike for comments
export const communityCommentReactions = pgTable("community_comment_reactions", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  commentId: varchar("comment_id", { length: 64 }).notNull(),
  userId: integer("user_id").notNull(),
  userAddress: varchar("user_address", { length: 66 }).notNull(),
  reactionType: varchar("reaction_type", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Community Event Registrations - Track event participants
export const communityEventRegistrations = pgTable("community_event_registrations", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id", { length: 64 }).notNull(),
  userId: integer("user_id").notNull(),
  userAddress: varchar("user_address", { length: 66 }).notNull(),
  username: varchar("username", { length: 100 }),
  status: varchar("status", { length: 20 }).notNull().default("registered"), // registered, attended, cancelled
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
  attendedAt: timestamp("attended_at"),
  cancelledAt: timestamp("cancelled_at"),
});

// Insert schemas for new community tables
export const insertCommunityPostReactionSchema = createInsertSchema(communityPostReactions).omit({
  id: true,
  createdAt: true,
});

export const insertCommunityCommentReactionSchema = createInsertSchema(communityCommentReactions).omit({
  id: true,
  createdAt: true,
});

export const insertCommunityEventRegistrationSchema = createInsertSchema(communityEventRegistrations).omit({
  id: true,
  registeredAt: true,
  attendedAt: true,
  cancelledAt: true,
});

// New Community Types
export type CommunityPostReaction = typeof communityPostReactions.$inferSelect;
export type InsertCommunityPostReaction = z.infer<typeof insertCommunityPostReactionSchema>;

export type CommunityCommentReaction = typeof communityCommentReactions.$inferSelect;
export type InsertCommunityCommentReaction = z.infer<typeof insertCommunityCommentReactionSchema>;

export type CommunityEventRegistration = typeof communityEventRegistrations.$inferSelect;
export type InsertCommunityEventRegistration = z.infer<typeof insertCommunityEventRegistrationSchema>;

export type ReactionType = "like" | "dislike";
export type RegistrationStatus = "registered" | "attended" | "cancelled";

// ============================================
// ENTERPRISE SHARD CONFIGURATION INFRASTRUCTURE
// ============================================

// Shard Configuration - Persistent network configuration
export const shardConfigurations = pgTable("shard_configurations", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  
  // Core Configuration
  currentShardCount: integer("current_shard_count").notNull().default(5),
  minShards: integer("min_shards").notNull().default(5),
  maxShards: integer("max_shards").notNull().default(64),
  validatorsPerShard: integer("validators_per_shard").notNull().default(25),
  tpsPerShard: integer("tps_per_shard").notNull().default(10000),
  crossShardLatencyMs: integer("cross_shard_latency_ms").notNull().default(50),
  rebalanceThreshold: real("rebalance_threshold").notNull().default(0.3),
  
  // Scaling Settings
  scalingMode: varchar("scaling_mode", { length: 20 }).notNull().default("automatic"), // automatic, manual, disabled
  cooldownMinutes: integer("cooldown_minutes").notNull().default(5),
  
  // Version Control
  version: integer("version").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true), // Only one active config at a time
  
  // Health Status
  healthStatus: varchar("health_status", { length: 20 }).notNull().default("healthy"), // healthy, degraded, critical
  lastHealthCheck: timestamp("last_health_check").defaultNow(),
  
  // Metadata
  changedBy: varchar("changed_by", { length: 100 }),
  changeReason: text("change_reason"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Shard Configuration History - Complete version history for rollback
export const shardConfigHistory = pgTable("shard_config_history", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  
  // Version Reference
  configId: varchar("config_id", { length: 64 }).notNull(),
  version: integer("version").notNull(),
  
  // Snapshot of Configuration
  configSnapshot: jsonb("config_snapshot").notNull(),
  
  // Change Details
  changedBy: varchar("changed_by", { length: 100 }).notNull(),
  changeReason: text("change_reason"),
  changeType: varchar("change_type", { length: 30 }).notNull().default("update"), // create, update, rollback, auto_scale
  
  // Impact Analysis
  previousShardCount: integer("previous_shard_count"),
  newShardCount: integer("new_shard_count"),
  affectedShards: jsonb("affected_shards").default([]),
  estimatedDowntime: integer("estimated_downtime_seconds").default(0),
  
  // Rollback Info
  rollbackable: boolean("rollbackable").notNull().default(true),
  rolledBackAt: timestamp("rolled_back_at"),
  rolledBackBy: varchar("rolled_back_by", { length: 100 }),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Shard Scaling Events - Track all scaling operations
export const shardScalingEvents = pgTable("shard_scaling_events", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  
  // Event Type
  eventType: varchar("event_type", { length: 30 }).notNull(), // scale_up, scale_down, rebalance, emergency_stop
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, in_progress, completed, failed, rolled_back
  
  // Scaling Details
  fromShards: integer("from_shards").notNull(),
  toShards: integer("to_shards").notNull(),
  triggerReason: text("trigger_reason"),
  triggeredBy: varchar("triggered_by", { length: 100 }).notNull(), // system, admin, ai_orchestrator
  
  // Impact
  affectedValidators: integer("affected_validators").default(0),
  estimatedDuration: integer("estimated_duration_seconds").default(0),
  actualDuration: integer("actual_duration_seconds"),
  
  // Results
  success: boolean("success"),
  errorMessage: text("error_message"),
  
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// Shard Configuration Audit Log - Comprehensive audit trail
export const shardConfigAuditLogs = pgTable("shard_config_audit_logs", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  
  // Action Details
  action: varchar("action", { length: 50 }).notNull(), // CONFIG_CHANGE, ROLLBACK, VALIDATION, HEALTH_CHECK, EMERGENCY_STOP
  actor: varchar("actor", { length: 100 }).notNull(),
  severity: varchar("severity", { length: 20 }).notNull().default("info"), // info, warning, error, critical
  
  // Change Details
  oldValue: jsonb("old_value"),
  newValue: jsonb("new_value"),
  details: jsonb("details").default({}),
  
  // Status
  status: varchar("status", { length: 20 }).notNull().default("success"), // success, failed, pending
  errorMessage: text("error_message"),
  
  // Client Info
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas for shard configuration
export const insertShardConfigurationSchema = createInsertSchema(shardConfigurations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertShardConfigHistorySchema = createInsertSchema(shardConfigHistory).omit({
  id: true,
  createdAt: true,
});

export const insertShardScalingEventSchema = createInsertSchema(shardScalingEvents).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

export const insertShardConfigAuditLogSchema = createInsertSchema(shardConfigAuditLogs).omit({
  id: true,
  createdAt: true,
});

// Shard Configuration Types
export type ShardConfiguration = typeof shardConfigurations.$inferSelect;
export type InsertShardConfiguration = z.infer<typeof insertShardConfigurationSchema>;

export type ShardConfigHistory = typeof shardConfigHistory.$inferSelect;
export type InsertShardConfigHistory = z.infer<typeof insertShardConfigHistorySchema>;

export type ShardScalingEvent = typeof shardScalingEvents.$inferSelect;
export type InsertShardScalingEvent = z.infer<typeof insertShardScalingEventSchema>;

export type ShardConfigAuditLog = typeof shardConfigAuditLogs.$inferSelect;
export type InsertShardConfigAuditLog = z.infer<typeof insertShardConfigAuditLogSchema>;

// ============================================
// WALLET DASHBOARD Tables - Enterprise wallet management
// ============================================

// Wallet Performance History - Track wallet balance snapshots over time
export const walletPerformanceHistory = pgTable("wallet_performance_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull(),
  timeframe: text("timeframe").notNull().default("1D"), // 1H, 1D, 1W, 1M, 1Y
  balanceEmber: text("balance_ember").notNull().default("0"), // Balance in smallest unit
  balanceUsd: text("balance_usd").notNull().default("0"), // USD valuation
  pnl24h: text("pnl_24h").notNull().default("0"), // Profit/loss in 24 hours
  pnl7d: text("pnl_7d").notNull().default("0"), // Profit/loss in 7 days
  pnlPercentage24h: integer("pnl_percentage_24h").notNull().default(0), // Basis points
  pnlPercentage7d: integer("pnl_percentage_7d").notNull().default(0), // Basis points
  epoch: bigint("epoch", { mode: "number" }).notNull().default(0), // Block epoch
  source: text("source").notNull().default("node"), // node, sync, manual
  snapshotAt: timestamp("snapshot_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Wallet Action Log - Track wallet operations (send, receive, swap)
export const walletActionLog = pgTable("wallet_action_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull(),
  actionType: text("action_type").notNull(), // send, receive, swap, stake, unstake, claim
  status: text("status").notNull().default("pending"), // pending, processing, confirmed, failed, cancelled
  amount: text("amount").notNull().default("0"), // Amount in smallest unit
  amountUsd: text("amount_usd").notNull().default("0"), // USD value at time of action
  toAddress: text("to_address"), // Recipient for sends
  fromAddress: text("from_address"), // Sender for receives
  txHash: text("tx_hash"), // Transaction hash when confirmed
  blockNumber: bigint("block_number", { mode: "number" }),
  gasUsed: bigint("gas_used", { mode: "number" }),
  gasPrice: text("gas_price"),
  fee: text("fee").default("0"), // Transaction fee
  tokenPair: text("token_pair"), // For swaps: "BURN/USDT"
  swapRate: text("swap_rate"), // Exchange rate for swaps
  slippage: integer("slippage"), // Basis points slippage
  metadata: jsonb("metadata"), // Additional action-specific data
  errorMessage: text("error_message"),
  initiatedAt: timestamp("initiated_at").notNull().defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
  failedAt: timestamp("failed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Wallet Streaming Checkpoint - For WebSocket stream resumption
export const walletStreamingCheckpoint = pgTable("wallet_streaming_checkpoint", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull().unique(),
  lastEventId: text("last_event_id").notNull().default("0"),
  lastBlockNumber: bigint("last_block_number", { mode: "number" }).notNull().default(0),
  lastEventTimestamp: timestamp("last_event_timestamp").notNull().defaultNow(),
  streamType: text("stream_type").notNull().default("all"), // all, balance, transactions
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Insert Schemas for Wallet Dashboard
export const insertWalletPerformanceHistorySchema = createInsertSchema(walletPerformanceHistory).omit({
  id: true,
  createdAt: true,
});

export const insertWalletActionLogSchema = createInsertSchema(walletActionLog).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWalletStreamingCheckpointSchema = createInsertSchema(walletStreamingCheckpoint).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types for Wallet Dashboard
export type WalletPerformanceHistory = typeof walletPerformanceHistory.$inferSelect;
export type InsertWalletPerformanceHistory = z.infer<typeof insertWalletPerformanceHistorySchema>;

export type WalletActionLog = typeof walletActionLog.$inferSelect;
export type InsertWalletActionLog = z.infer<typeof insertWalletActionLogSchema>;

export type WalletStreamingCheckpoint = typeof walletStreamingCheckpoint.$inferSelect;
export type InsertWalletStreamingCheckpoint = z.infer<typeof insertWalletStreamingCheckpointSchema>;

// ============================================
// TESTNET Tables - For recording user testnet activity
// ============================================

// Testnet Wallets - Track wallet balances on testnet
export const testnetWallets = pgTable("testnet_wallets", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  address: varchar("address", { length: 66 }).notNull().unique(),
  balance: numeric("balance", { precision: 40, scale: 0 }).notNull().default("0"),
  nonce: integer("nonce").notNull().default(0),
  txCount: integer("tx_count").notNull().default(0),
  firstSeenAt: timestamp("first_seen_at").defaultNow().notNull(),
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Testnet Transactions - Record all testnet transactions
export const testnetTransactions = pgTable("testnet_transactions", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  hash: varchar("hash", { length: 130 }).notNull().unique(),
  blockNumber: bigint("block_number", { mode: "number" }).notNull(),
  fromAddress: varchar("from_address", { length: 66 }).notNull(),
  toAddress: varchar("to_address", { length: 66 }).notNull(),
  value: numeric("value", { precision: 40, scale: 0 }).notNull().default("0"),
  gasPrice: numeric("gas_price", { precision: 40, scale: 0 }).notNull().default("100"),
  gasUsed: integer("gas_used").notNull().default(21000),
  gasLimit: integer("gas_limit").notNull().default(21000),
  nonce: integer("nonce").notNull().default(0),
  status: varchar("status", { length: 20 }).notNull().default("confirmed"), // pending, confirmed, failed
  txType: varchar("tx_type", { length: 30 }).notNull().default("transfer"), // transfer, faucet, contract_call, contract_deploy
  input: text("input").default("0x"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Testnet Blocks - Record testnet blocks
export const testnetBlocks = pgTable("testnet_blocks", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  number: bigint("number", { mode: "number" }).notNull().unique(),
  hash: varchar("hash", { length: 130 }).notNull().unique(),
  parentHash: varchar("parent_hash", { length: 130 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  transactionCount: integer("transaction_count").notNull().default(0),
  gasUsed: bigint("gas_used", { mode: "number" }).notNull().default(0),
  gasLimit: bigint("gas_limit", { mode: "number" }).notNull().default(15000000),
  validator: varchar("validator", { length: 66 }).notNull(),
  size: integer("size").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Testnet Faucet Requests - Track faucet distributions
export const testnetFaucetRequests = pgTable("testnet_faucet_requests", {
  id: varchar("id", { length: 64 }).primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: varchar("wallet_address", { length: 66 }).notNull(),
  amount: numeric("amount", { precision: 40, scale: 0 }).notNull().default("1000000000000000000000"), // 1000 tTBURN
  txHash: varchar("tx_hash", { length: 130 }),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, completed, failed
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// Testnet Insert Schemas
export const insertTestnetWalletSchema = createInsertSchema(testnetWallets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTestnetTransactionSchema = createInsertSchema(testnetTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertTestnetBlockSchema = createInsertSchema(testnetBlocks).omit({
  id: true,
  createdAt: true,
});

export const insertTestnetFaucetRequestSchema = createInsertSchema(testnetFaucetRequests).omit({
  id: true,
  createdAt: true,
});

// Testnet Types
export type TestnetWallet = typeof testnetWallets.$inferSelect;
export type InsertTestnetWallet = z.infer<typeof insertTestnetWalletSchema>;

export type TestnetTransaction = typeof testnetTransactions.$inferSelect;
export type InsertTestnetTransaction = z.infer<typeof insertTestnetTransactionSchema>;

export type TestnetBlock = typeof testnetBlocks.$inferSelect;
export type InsertTestnetBlock = z.infer<typeof insertTestnetBlockSchema>;

export type TestnetFaucetRequest = typeof testnetFaucetRequests.$inferSelect;
export type InsertTestnetFaucetRequest = z.infer<typeof insertTestnetFaucetRequestSchema>;

// ============================================
// GENESIS BLOCK & MAINNET LAUNCH SYSTEM
// Enterprise-Grade Initial Token Issuance
// ============================================

// Genesis Configuration - Master configuration for mainnet launch
export const genesisConfig = pgTable("genesis_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Chain Parameters
  chainId: integer("chain_id").notNull().default(8888),
  chainName: text("chain_name").notNull().default("TBURN Mainnet"),
  networkVersion: text("network_version").notNull().default("v8.0"),
  
  // Genesis Block Parameters
  genesisTimestamp: bigint("genesis_timestamp", { mode: "number" }),
  genesisBlockHash: text("genesis_block_hash"),
  initialDifficulty: text("initial_difficulty").notNull().default("1"),
  blockTimeMs: integer("block_time_ms").notNull().default(100), // 100ms blocks
  
  // Token Economics
  totalSupply: text("total_supply").notNull().default("10000000000000000000000000000"), // 10B TBURN in wei
  decimals: integer("decimals").notNull().default(18),
  tokenSymbol: text("token_symbol").notNull().default("TBURN"),
  tokenName: text("token_name").notNull().default("TBURN Token"),
  initialPrice: text("initial_price").notNull().default("0.50"), // USD
  
  // Staking Parameters
  minValidatorStake: text("min_validator_stake").notNull().default("100000000000000000000000"), // 100K TBURN
  maxValidatorCount: integer("max_validator_count").notNull().default(125),
  initialValidatorCount: integer("initial_validator_count").notNull().default(21),
  stakingRewardRate: integer("staking_reward_rate").notNull().default(1250), // 12.50% in basis points
  
  // Consensus Parameters
  consensusType: text("consensus_type").notNull().default("ai_committee_bft"),
  committeeSize: integer("committee_size").notNull().default(21),
  blockProducerCount: integer("block_producer_count").notNull().default(7),
  quorumThreshold: integer("quorum_threshold").notNull().default(6700), // 67% in basis points
  
  // Shard Configuration
  initialShardCount: integer("initial_shard_count").notNull().default(8),
  maxShardCount: integer("max_shard_count").notNull().default(128),
  
  // Status & Execution
  status: text("status").notNull().default("draft"), // draft, pending_approval, approved, executing, executed, failed
  isExecuted: boolean("is_executed").notNull().default(false),
  executedAt: timestamp("executed_at"),
  executedBy: text("executed_by"),
  executionTxHash: text("execution_tx_hash"),
  
  // Pre-flight Validation
  preflightChecks: jsonb("preflight_checks"), // Validation results
  preflightPassedAt: timestamp("preflight_passed_at"),
  
  // Multi-Sig Configuration
  requiredSignatures: integer("required_signatures").notNull().default(3),
  totalSigners: integer("total_signers").notNull().default(5),
  
  // Audit
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdBy: text("created_by"),
  lastModifiedBy: text("last_modified_by"),
});

// Genesis Validators - Initial validator set for mainnet
export const genesisValidators = pgTable("genesis_validators", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  configId: varchar("config_id").notNull(),
  
  // Validator Identity
  address: text("address").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  website: text("website"),
  contactEmail: text("contact_email"),
  
  // Stake Allocation
  initialStake: text("initial_stake").notNull(), // In wei
  selfDelegation: text("self_delegation").notNull().default("0"),
  commission: integer("commission").notNull().default(500), // 5% in basis points
  
  // Node Configuration
  nodePublicKey: text("node_public_key").notNull(),
  nodeEndpoint: text("node_endpoint"),
  p2pPort: integer("p2p_port").notNull().default(30303),
  rpcPort: integer("rpc_port").notNull().default(8545),
  
  // Validator Tier
  tier: text("tier").notNull().default("genesis"), // genesis, enterprise, partner, community
  priority: integer("priority").notNull().default(0), // Block producer priority
  
  // Verification Status
  isVerified: boolean("is_verified").notNull().default(false),
  verifiedAt: timestamp("verified_at"),
  verifiedBy: text("verified_by"),
  
  // KYC/Compliance
  kycStatus: text("kyc_status").notNull().default("pending"), // pending, approved, rejected
  kycDocumentId: text("kyc_document_id"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Genesis Distribution - Token allocation for mainnet launch
export const genesisDistribution = pgTable("genesis_distribution", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  configId: varchar("config_id").notNull(),
  
  // Allocation Category
  category: text("category").notNull(), // foundation, team, ecosystem, staking_rewards, liquidity, public_sale, private_sale, advisors, reserve
  subcategory: text("subcategory"),
  
  // Recipient Information
  recipientName: text("recipient_name").notNull(),
  recipientAddress: text("recipient_address").notNull(),
  recipientType: text("recipient_type").notNull().default("wallet"), // wallet, contract, multisig
  
  // Allocation Amount
  amount: text("amount").notNull(), // In wei
  percentage: integer("percentage").notNull(), // Basis points (10000 = 100%)
  
  // Vesting Schedule
  hasVesting: boolean("has_vesting").notNull().default(false),
  vestingStartDate: timestamp("vesting_start_date"),
  vestingEndDate: timestamp("vesting_end_date"),
  vestingCliffMonths: integer("vesting_cliff_months").default(0),
  vestingDurationMonths: integer("vesting_duration_months").default(0),
  vestingSchedule: jsonb("vesting_schedule"), // Detailed release schedule
  
  // Lock Configuration
  isLocked: boolean("is_locked").notNull().default(false),
  lockDurationDays: integer("lock_duration_days").default(0),
  unlockDate: timestamp("unlock_date"),
  
  // Distribution Status
  status: text("status").notNull().default("pending"), // pending, approved, distributed, verified
  distributedAt: timestamp("distributed_at"),
  distributionTxHash: text("distribution_tx_hash"),
  
  // Verification
  verificationProof: text("verification_proof"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Genesis Approvals - Multi-sig approval workflow
export const genesisApprovals = pgTable("genesis_approvals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  configId: varchar("config_id").notNull(),
  
  // Signer Information
  signerAddress: text("signer_address").notNull(),
  signerName: text("signer_name").notNull(),
  signerRole: text("signer_role").notNull(), // ceo, cto, cfo, legal, security
  signerOrder: integer("signer_order").notNull().default(0),
  
  // Approval Status
  status: text("status").notNull().default("pending"), // pending, approved, rejected, abstained
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  
  // Cryptographic Signature
  signature: text("signature"),
  signatureType: text("signature_type").notNull().default("eip712"), // eip712, personal_sign, hardware
  signedMessage: text("signed_message"),
  signedAt: timestamp("signed_at"),
  
  // Hardware Wallet Info (if applicable)
  hardwareWalletType: text("hardware_wallet_type"), // ledger, trezor
  derivationPath: text("derivation_path"),
  
  // Verification
  isVerified: boolean("is_verified").notNull().default(false),
  verifiedAt: timestamp("verified_at"),
  verificationHash: text("verification_hash"),
  
  // Comments/Notes
  comments: text("comments"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Genesis Execution Log - Immutable audit trail
export const genesisExecutionLog = pgTable("genesis_execution_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  configId: varchar("config_id").notNull(),
  
  // Log Entry Type
  logType: text("log_type").notNull(), // preflight_check, approval_received, execution_started, block_created, distribution_completed, error, warning
  severity: text("severity").notNull().default("info"), // info, warning, error, critical
  
  // Log Details
  action: text("action").notNull(),
  description: text("description").notNull(),
  details: jsonb("details"),
  
  // Actor Information
  actorAddress: text("actor_address"),
  actorName: text("actor_name"),
  actorRole: text("actor_role"),
  
  // Reference Data
  referenceType: text("reference_type"), // validator, distribution, approval, block, transaction
  referenceId: text("reference_id"),
  txHash: text("tx_hash"),
  blockNumber: bigint("block_number", { mode: "number" }),
  
  // Immutability
  logHash: text("log_hash"), // SHA256 of log content
  previousLogHash: text("previous_log_hash"), // Chain of logs
  
  // IP/Session Info (for compliance)
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  sessionId: text("session_id"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Genesis Preflight Checks - Validation before execution
export const genesisPreflightChecks = pgTable("genesis_preflight_checks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  configId: varchar("config_id").notNull(),
  
  // Check Information
  checkName: text("check_name").notNull(),
  checkCategory: text("check_category").notNull(), // tokenomics, validators, distribution, consensus, security, compliance
  checkDescription: text("check_description").notNull(),
  
  // Check Result
  status: text("status").notNull().default("pending"), // pending, passed, failed, warning, skipped
  result: jsonb("result"),
  errorMessage: text("error_message"),
  warningMessage: text("warning_message"),
  
  // Validation Details
  expectedValue: text("expected_value"),
  actualValue: text("actual_value"),
  tolerance: text("tolerance"),
  
  // Priority & Requirement
  isCritical: boolean("is_critical").notNull().default(false),
  isRequired: boolean("is_required").notNull().default(true),
  priority: integer("priority").notNull().default(0),
  
  // Execution
  executedAt: timestamp("executed_at"),
  executionDurationMs: integer("execution_duration_ms"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// Newsletter Subscribers
// ============================================
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  status: varchar("status", { length: 50 }).notNull().default("active"), // active, unsubscribed
  source: varchar("source", { length: 100 }).default("footer"), // footer, popup, landing
  ipAddress: varchar("ip_address", { length: 45 }),
  subscribedAt: timestamp("subscribed_at").notNull().defaultNow(),
  unsubscribedAt: timestamp("unsubscribed_at"),
});

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).omit({
  id: true,
  subscribedAt: true,
  unsubscribedAt: true,
});

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;

// Genesis Insert Schemas
export const insertGenesisConfigSchema = createInsertSchema(genesisConfig).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGenesisValidatorSchema = createInsertSchema(genesisValidators).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGenesisDistributionSchema = createInsertSchema(genesisDistribution).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGenesisApprovalSchema = createInsertSchema(genesisApprovals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGenesisExecutionLogSchema = createInsertSchema(genesisExecutionLog).omit({
  id: true,
  createdAt: true,
});

export const insertGenesisPreflightCheckSchema = createInsertSchema(genesisPreflightChecks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Genesis Types
export type GenesisConfig = typeof genesisConfig.$inferSelect;
export type InsertGenesisConfig = z.infer<typeof insertGenesisConfigSchema>;

export type GenesisValidator = typeof genesisValidators.$inferSelect;
export type InsertGenesisValidator = z.infer<typeof insertGenesisValidatorSchema>;

export type GenesisDistribution = typeof genesisDistribution.$inferSelect;
export type InsertGenesisDistribution = z.infer<typeof insertGenesisDistributionSchema>;

export type GenesisApproval = typeof genesisApprovals.$inferSelect;
export type InsertGenesisApproval = z.infer<typeof insertGenesisApprovalSchema>;

export type GenesisExecutionLog = typeof genesisExecutionLog.$inferSelect;
export type InsertGenesisExecutionLog = z.infer<typeof insertGenesisExecutionLogSchema>;

export type GenesisPreflightCheck = typeof genesisPreflightChecks.$inferSelect;
export type InsertGenesisPreflightCheck = z.infer<typeof insertGenesisPreflightCheckSchema>;

// ============================================
// User Rewards & Activity Tables
// ============================================

// Mining Rewards - User mining/block production rewards
export const userMiningRewards = pgTable("user_mining_rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull(),
  
  // Reward Details
  amount: text("amount").notNull(), // Amount in TB
  source: text("source").notNull(), // block_production, validation, fee_share
  epoch: integer("epoch").notNull(),
  blockNumber: integer("block_number"),
  
  // Transaction
  txHash: text("tx_hash"),
  claimed: boolean("claimed").notNull().default(false),
  claimedAt: timestamp("claimed_at"),
  
  // Metadata
  metadata: jsonb("metadata").notNull().default({}),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// User Staking Positions - Detailed staking information per user
export const userStakingPositions = pgTable("user_staking_positions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull(),
  validatorId: text("validator_id").notNull(),
  validatorName: text("validator_name"),
  
  // Position Details
  stakedAmount: text("staked_amount").notNull(),
  shares: text("shares").notNull().default("0"),
  currentValue: text("current_value").notNull(),
  
  // APY & Rewards
  currentApy: text("current_apy").notNull().default("0"),
  pendingRewards: text("pending_rewards").notNull().default("0"),
  totalRewardsEarned: text("total_rewards_earned").notNull().default("0"),
  
  // Lock Status
  status: text("status").notNull().default("active"), // active, locked, unbonding, withdrawn
  lockPeriodDays: integer("lock_period_days").default(0),
  unlockDate: timestamp("unlock_date"),
  
  // Timestamps
  stakedAt: timestamp("staked_at").notNull().defaultNow(),
  lastRewardAt: timestamp("last_reward_at"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// User Staking Rewards - Historical staking interest/rewards
export const userStakingRewards = pgTable("user_staking_rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull(),
  positionId: text("position_id"), // Reference to staking position
  validatorId: text("validator_id"),
  
  // Reward Details
  amount: text("amount").notNull(),
  rewardType: text("reward_type").notNull(), // staking_interest, compound, bonus, promotion
  epoch: integer("epoch").notNull(),
  apy: text("apy"), // APY at the time of reward
  
  // Transaction
  txHash: text("tx_hash"),
  claimed: boolean("claimed").notNull().default(false),
  claimedAt: timestamp("claimed_at"),
  autoCompounded: boolean("auto_compounded").notNull().default(false),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// User Event Participation - Airdrops, campaigns, governance rewards
export const userEventParticipation = pgTable("user_event_participation", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull(),
  
  // Event Info
  eventId: text("event_id").notNull(),
  eventName: text("event_name").notNull(),
  eventType: text("event_type").notNull(), // airdrop, campaign, governance_reward, referral, bug_bounty
  eventDescription: text("event_description"),
  
  // Participation Status
  status: text("status").notNull().default("pending"), // pending, eligible, claimed, expired, ineligible
  eligibilityReason: text("eligibility_reason"),
  
  // Reward
  rewardAmount: text("reward_amount"),
  rewardToken: text("reward_token").default("TB"),
  rewardTxHash: text("reward_tx_hash"),
  
  // Dates
  eventStartDate: timestamp("event_start_date"),
  eventEndDate: timestamp("event_end_date"),
  claimDeadline: timestamp("claim_deadline"),
  awardedAt: timestamp("awarded_at"),
  claimedAt: timestamp("claimed_at"),
  
  // Metadata
  metadata: jsonb("metadata").notNull().default({}),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// User Activity Log - Consolidated activity feed
export const userActivityLog = pgTable("user_activity_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull(),
  
  // Activity Info
  activityType: text("activity_type").notNull(), // transfer_in, transfer_out, stake, unstake, claim_reward, vote, event_participation
  category: text("category").notNull(), // wallet, staking, governance, rewards, events
  
  // Details
  title: text("title").notNull(),
  description: text("description"),
  amount: text("amount"),
  token: text("token").default("TB"),
  
  // Reference
  txHash: text("tx_hash"),
  referenceId: text("reference_id"), // ID of related record
  referenceType: text("reference_type"), // mining_reward, staking_reward, event, etc.
  
  // Metadata
  metadata: jsonb("metadata").notNull().default({}),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert Schemas
export const insertUserMiningRewardSchema = createInsertSchema(userMiningRewards).omit({
  id: true,
  createdAt: true,
});

export const insertUserStakingPositionSchema = createInsertSchema(userStakingPositions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserStakingRewardSchema = createInsertSchema(userStakingRewards).omit({
  id: true,
  createdAt: true,
});

export const insertUserEventParticipationSchema = createInsertSchema(userEventParticipation).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserActivityLogSchema = createInsertSchema(userActivityLog).omit({
  id: true,
  createdAt: true,
});

// Types
export type UserMiningReward = typeof userMiningRewards.$inferSelect;
export type InsertUserMiningReward = z.infer<typeof insertUserMiningRewardSchema>;

export type UserStakingPosition = typeof userStakingPositions.$inferSelect;
export type InsertUserStakingPosition = z.infer<typeof insertUserStakingPositionSchema>;

export type UserStakingReward = typeof userStakingRewards.$inferSelect;
export type InsertUserStakingReward = z.infer<typeof insertUserStakingRewardSchema>;

export type UserEventParticipation = typeof userEventParticipation.$inferSelect;
export type InsertUserEventParticipation = z.infer<typeof insertUserEventParticipationSchema>;

export type UserActivityLog = typeof userActivityLog.$inferSelect;
export type InsertUserActivityLog = z.infer<typeof insertUserActivityLogSchema>;

// ============================================
// Bug Bounty Reports
// ============================================
export const BUG_BOUNTY_SEVERITY = ["critical", "high", "medium", "low", "informational"] as const;
export const BUG_BOUNTY_STATUS = ["pending", "reviewing", "accepted", "rejected", "duplicate", "paid"] as const;
export const BUG_BOUNTY_ASSET = ["smart_contracts", "node_client", "website_api", "bridge", "other"] as const;

export const bugBountyReports = pgTable("bug_bounty_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Reporter Information
  reporterEmail: text("reporter_email"),
  reporterWallet: text("reporter_wallet"),
  reporterName: text("reporter_name"),
  
  // Report Details
  title: text("title").notNull(),
  description: text("description").notNull(),
  reproductionSteps: text("reproduction_steps"),
  assetTarget: text("asset_target").notNull().default("smart_contracts"), // smart_contracts, node_client, website_api, bridge, other
  
  // Severity and Status
  reportedSeverity: text("reported_severity").notNull().default("medium"), // reporter's assessment
  confirmedSeverity: text("confirmed_severity"), // admin's assessment
  status: text("status").notNull().default("pending"), // pending, reviewing, accepted, rejected, duplicate, paid
  
  // Reward
  rewardUsd: numeric("reward_usd"),
  rewardTokenAmount: text("reward_token_amount"),
  rewardTxHash: text("reward_tx_hash"),
  
  // Admin Notes
  adminNotes: text("admin_notes"),
  assignedTo: text("assigned_to"),
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  paidAt: timestamp("paid_at"),
});

export const insertBugBountyReportSchema = createInsertSchema(bugBountyReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  reviewedAt: true,
  paidAt: true,
});

export type BugBountyReport = typeof bugBountyReports.$inferSelect;
export type InsertBugBountyReport = z.infer<typeof insertBugBountyReportSchema>;

// ============================================
// Token Distribution Programs (Admin Dashboard)
// ============================================
export const TOKEN_PROGRAM_STATUS = ["active", "upcoming", "completed", "paused", "cancelled"] as const;
export const TOKEN_PROGRAM_TYPE = [
  "airdrop", "referral", "events", "community", "dao_governance",
  "block_rewards", "validator_incentives", "ecosystem_fund",
  "partnership", "marketing", "strategic_partner", "advisor",
  "seed_round", "private_round", "public_round", "launchpad",
  "coinlist", "dao_maker"
] as const;

// Core Token Programs Table - Overview of all 18 programs
export const tokenPrograms = pgTable("token_programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Program Identity
  programType: text("program_type").notNull(), // airdrop, referral, events, etc.
  name: text("name").notNull(),
  description: text("description"),
  pageRoute: text("page_route").notNull(), // /airdrop, /referral, etc.
  
  // Status & Lifecycle
  status: text("status").notNull().default("active"), // active, upcoming, completed, paused, cancelled
  priority: integer("priority").notNull().default(1), // Display order
  
  // Allocation
  totalAllocation: text("total_allocation").notNull().default("0"), // TBURN tokens
  distributedAmount: text("distributed_amount").notNull().default("0"),
  remainingAmount: text("remaining_amount").notNull().default("0"),
  
  // Participation Metrics
  totalParticipants: integer("total_participants").notNull().default(0),
  activeParticipants: integer("active_participants").notNull().default(0),
  pendingClaims: integer("pending_claims").notNull().default(0),
  
  // Financial Metrics
  totalValueUsd: numeric("total_value_usd").notNull().default("0"),
  raisedAmountUsd: numeric("raised_amount_usd").notNull().default("0"), // For sale programs
  targetAmountUsd: numeric("target_amount_usd").notNull().default("0"),
  
  // Progress
  progressPercent: real("progress_percent").notNull().default(0),
  
  // Timeline
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  
  // Configuration
  config: jsonb("config").notNull().default({}), // Program-specific settings
  
  // Metadata
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Program Snapshots - Cached metrics for dashboard (updated periodically)
export const programSnapshots = pgTable("program_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  programId: varchar("program_id").notNull(),
  
  // Snapshot Metrics - matches database schema
  totalParticipants: integer("total_participants").notNull().default(0),
  distributedAmount: text("distributed_amount").notNull().default("0"),
  remainingAmount: text("remaining_amount").notNull().default("0"),
  progressPercent: real("progress_percent").notNull().default(0),
  
  // Configuration
  metrics: jsonb("metrics").notNull().default({}),
  
  snapshotDate: timestamp("snapshot_date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// Program 1: Airdrop Claims
// ============================================
export const AIRDROP_TIER = ["basic", "holder", "og", "whale", "legendary"] as const;
export const AIRDROP_STATUS = ["eligible", "claimed", "expired", "processing", "failed"] as const;

export const airdropClaims = pgTable("airdrop_claims", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Claimant
  walletAddress: text("wallet_address").notNull(),
  
  // Eligibility
  tier: text("tier").notNull().default("basic"), // basic, holder, og, whale, legendary
  eligibilityScore: integer("eligibility_score").notNull().default(0),
  snapshotBlockNumber: bigint("snapshot_block_number", { mode: "number" }),
  
  // Claim Details
  claimableAmount: text("claimable_amount").notNull().default("0"),
  claimedAmount: text("claimed_amount").notNull().default("0"),
  bonusAmount: text("bonus_amount").notNull().default("0"),
  
  // Status
  status: text("status").notNull().default("eligible"), // eligible, claimed, expired, processing, failed
  
  // Verification
  merkleProof: text("merkle_proof"),
  signature: text("signature"),
  verifiedAt: timestamp("verified_at"),
  
  // Claim Transaction
  claimTxHash: text("claim_tx_hash"),
  claimBlockNumber: bigint("claim_block_number", { mode: "number" }),
  claimedAt: timestamp("claimed_at"),
  
  // Vesting (if applicable)
  vestingScheduleId: varchar("vesting_schedule_id"),
  vestingStartDate: timestamp("vesting_start_date"),
  vestingEndDate: timestamp("vesting_end_date"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const airdropDistributions = pgTable("airdrop_distributions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Batch Info
  batchNumber: integer("batch_number").notNull(),
  batchName: text("batch_name"),
  
  // Distribution Details
  totalRecipients: integer("total_recipients").notNull().default(0),
  totalAmount: text("total_amount").notNull().default("0"),
  processedCount: integer("processed_count").notNull().default(0),
  failedCount: integer("failed_count").notNull().default(0),
  
  // Status
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  
  // Execution
  executedBy: varchar("executed_by"),
  executionTxHash: text("execution_tx_hash"),
  
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// Program 2: Referral System
// ============================================
export const REFERRAL_TIER = ["bronze", "silver", "gold", "platinum", "diamond"] as const;

export const referralAccounts = pgTable("referral_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Account Owner
  walletAddress: text("wallet_address").notNull().unique(),
  memberId: varchar("member_id"),
  
  // Referral Code
  referralCode: text("referral_code").notNull().unique(),
  referredBy: varchar("referred_by"), // referralAccounts.id of referrer
  
  // Tier & Stats
  tier: text("tier").notNull().default("bronze"), // bronze, silver, gold, platinum, diamond
  totalReferrals: integer("total_referrals").notNull().default(0),
  activeReferrals: integer("active_referrals").notNull().default(0),
  conversionRate: real("conversion_rate").notNull().default(0),
  
  // Earnings
  totalEarned: text("total_earned").notNull().default("0"),
  pendingRewards: text("pending_rewards").notNull().default("0"),
  claimedRewards: text("claimed_rewards").notNull().default("0"),
  lifetimeVolume: text("lifetime_volume").notNull().default("0"),
  
  // Commission Rates
  directCommissionRate: real("direct_commission_rate").notNull().default(10), // Percentage
  indirectCommissionRate: real("indirect_commission_rate").notNull().default(2),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const referralRewards = pgTable("referral_rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Participants
  referrerId: varchar("referrer_id").notNull(),
  referredId: varchar("referred_id").notNull(),
  
  // Reward Details
  rewardType: text("reward_type").notNull(), // signup, transaction, milestone
  rewardAmount: text("reward_amount").notNull().default("0"),
  bonusAmount: text("bonus_amount").notNull().default("0"),
  
  // Source Transaction (if applicable)
  sourceTxHash: text("source_tx_hash"),
  sourceAmount: text("source_amount"),
  commissionRate: real("commission_rate"),
  
  // Status
  status: text("status").notNull().default("pending"), // pending, approved, paid, rejected
  
  // Payment
  payoutTxHash: text("payout_tx_hash"),
  paidAt: timestamp("paid_at"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// Program 3: Events System
// ============================================
export const EVENT_TYPE = ["airdrop", "trading_competition", "staking_bonus", "community", "ama", "hackathon"] as const;
export const EVENT_STATUS = ["upcoming", "active", "ended", "cancelled"] as const;

export const eventsCatalog = pgTable("events_catalog", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Event Details
  eventType: text("event_type").notNull(), // airdrop, trading_competition, staking_bonus, community, ama, hackathon
  name: text("name").notNull(),
  description: text("description"),
  bannerUrl: text("banner_url"),
  
  // Status & Timeline
  status: text("status").notNull().default("upcoming"), // upcoming, active, ended, cancelled
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  registrationDeadline: timestamp("registration_deadline"),
  
  // Participation
  maxParticipants: integer("max_participants"),
  currentParticipants: integer("current_participants").notNull().default(0),
  
  // Rewards
  totalRewardPool: text("total_reward_pool").notNull().default("0"),
  distributedRewards: text("distributed_rewards").notNull().default("0"),
  rewardStructure: jsonb("reward_structure").notNull().default({}), // Prize distribution
  
  // Requirements
  requirements: jsonb("requirements").notNull().default({}), // Eligibility criteria
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const eventRegistrations = pgTable("event_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  eventId: varchar("event_id").notNull(),
  walletAddress: text("wallet_address").notNull(),
  memberId: varchar("member_id"),
  
  // Participation
  registeredAt: timestamp("registered_at").notNull().defaultNow(),
  completedTasks: jsonb("completed_tasks").notNull().default([]),
  score: integer("score").notNull().default(0),
  rank: integer("rank"),
  
  // Reward
  rewardAmount: text("reward_amount").notNull().default("0"),
  rewardClaimed: boolean("reward_claimed").notNull().default(false),
  rewardClaimTxHash: text("reward_claim_tx_hash"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// Program 4: Community Program
// ============================================
export const TASK_TYPE = ["social", "content", "development", "ambassador", "testing", "feedback"] as const;
export const BADGE_RARITY = ["common", "uncommon", "rare", "epic", "legendary"] as const;

export const communityTasks = pgTable("community_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Task Details
  taskType: text("task_type").notNull(), // social, content, development, ambassador, testing, feedback
  name: text("name").notNull(),
  description: text("description"),
  
  // Requirements & Rewards
  pointsReward: integer("points_reward").notNull().default(0),
  tokenReward: text("token_reward").notNull().default("0"),
  requirements: jsonb("requirements").notNull().default({}),
  
  // Limits
  maxCompletions: integer("max_completions"),
  completionCount: integer("completion_count").notNull().default(0),
  dailyLimit: integer("daily_limit"),
  
  // Status
  isActive: boolean("is_active").notNull().default(true),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const communityContributions = pgTable("community_contributions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Contributor
  walletAddress: text("wallet_address").notNull(),
  memberId: varchar("member_id"),
  
  // Task
  taskId: varchar("task_id").notNull(),
  
  // Submission
  submissionProof: text("submission_proof"),
  submissionData: jsonb("submission_data").notNull().default({}),
  
  // Status
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  
  // Rewards
  pointsEarned: integer("points_earned").notNull().default(0),
  tokensEarned: text("tokens_earned").notNull().default("0"),
  
  reviewedBy: varchar("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const communityMemberBadges = pgTable("community_member_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  walletAddress: text("wallet_address").notNull(),
  
  // Badge Details
  badgeName: text("badge_name").notNull(),
  badgeDescription: text("badge_description"),
  badgeImageUrl: text("badge_image_url"),
  rarity: text("rarity").notNull().default("common"), // common, uncommon, rare, epic, legendary
  
  // Achievement
  earnedReason: text("earned_reason"),
  achievementData: jsonb("achievement_data").notNull().default({}),
  
  earnedAt: timestamp("earned_at").notNull().defaultNow(),
});

// ============================================
// Program 5: DAO Governance
// ============================================
export const PROPOSAL_STATUS = ["draft", "active", "passed", "rejected", "executed", "cancelled"] as const;
export const VOTE_CHOICE = ["for", "against", "abstain"] as const;

export const daoProposals = pgTable("dao_proposals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Proposal Details
  proposalNumber: integer("proposal_number").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // governance, treasury, technical, community
  
  // Proposer
  proposerAddress: text("proposer_address").notNull(),
  proposerPower: text("proposer_power").notNull().default("0"),
  
  // Status & Timeline
  status: text("status").notNull().default("draft"), // draft, active, passed, rejected, executed, cancelled
  votingStartDate: timestamp("voting_start_date"),
  votingEndDate: timestamp("voting_end_date"),
  executionDate: timestamp("execution_date"),
  
  // Voting Results
  forVotes: text("for_votes").notNull().default("0"),
  againstVotes: text("against_votes").notNull().default("0"),
  abstainVotes: text("abstain_votes").notNull().default("0"),
  totalVoters: integer("total_voters").notNull().default(0),
  quorumRequired: text("quorum_required").notNull().default("0"),
  passThreshold: real("pass_threshold").notNull().default(50), // Percentage
  
  // Execution
  executionPayload: jsonb("execution_payload").notNull().default({}),
  executedTxHash: text("executed_tx_hash"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const daoVotes = pgTable("dao_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  proposalId: varchar("proposal_id").notNull(),
  voterAddress: text("voter_address").notNull(),
  
  // Vote Details
  choice: text("choice").notNull(), // for, against, abstain
  votePower: text("vote_power").notNull().default("0"),
  
  // Delegation (if applicable)
  delegatedFrom: text("delegated_from"),
  
  // Proof
  signature: text("signature"),
  txHash: text("tx_hash"),
  
  votedAt: timestamp("voted_at").notNull().defaultNow(),
});

export const daoDelegations = pgTable("dao_delegations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  delegatorAddress: text("delegator_address").notNull(),
  delegateAddress: text("delegate_address").notNull(),
  
  // Delegation Amount
  delegatedPower: text("delegated_power").notNull().default("0"),
  
  // Status
  isActive: boolean("is_active").notNull().default(true),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  revokedAt: timestamp("revoked_at"),
});

// ============================================
// Program 6: Block Rewards
// ============================================
export const blockRewardCycles = pgTable("block_reward_cycles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Cycle Info
  cycleNumber: integer("cycle_number").notNull().unique(),
  epochNumber: integer("epoch_number").notNull(),
  
  // Block Range
  startBlockNumber: bigint("start_block_number", { mode: "number" }).notNull(),
  endBlockNumber: bigint("end_block_number", { mode: "number" }),
  
  // Rewards
  totalBlockRewards: text("total_block_rewards").notNull().default("0"),
  totalGasFees: text("total_gas_fees").notNull().default("0"),
  proposerRewards: text("proposer_rewards").notNull().default("0"),
  verifierRewards: text("verifier_rewards").notNull().default("0"),
  
  // Statistics
  blocksProduced: integer("blocks_produced").notNull().default(0),
  transactionsProcessed: integer("transactions_processed").notNull().default(0),
  
  // Status
  status: text("status").notNull().default("active"), // active, completed, distributing
  distributionStatus: text("distribution_status").notNull().default("pending"), // pending, processing, completed
  
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const blockRewardPayouts = pgTable("block_reward_payouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  cycleId: varchar("cycle_id").notNull(),
  validatorAddress: text("validator_address").notNull(),
  
  // Payout Details
  rewardType: text("reward_type").notNull(), // proposer, verifier, gas_fee
  blockNumber: bigint("block_number", { mode: "number" }),
  
  rewardAmount: text("reward_amount").notNull().default("0"),
  gasFeeShare: text("gas_fee_share").notNull().default("0"),
  
  // Status
  status: text("status").notNull().default("pending"), // pending, distributed, failed
  distributionTxHash: text("distribution_tx_hash"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  distributedAt: timestamp("distributed_at"),
});

// ============================================
// Program 7: Validator Incentives
// ============================================
export const validatorIncentivePayouts = pgTable("validator_incentive_payouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  validatorAddress: text("validator_address").notNull(),
  
  // Incentive Details
  incentiveType: text("incentive_type").notNull(), // uptime_bonus, performance_bonus, early_adopter, loyalty
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  
  // Performance Metrics
  uptimePercent: real("uptime_percent").notNull().default(100),
  blocksProposed: integer("blocks_proposed").notNull().default(0),
  blocksVerified: integer("blocks_verified").notNull().default(0),
  performanceScore: real("performance_score").notNull().default(0),
  
  // Payout
  baseReward: text("base_reward").notNull().default("0"),
  bonusMultiplier: real("bonus_multiplier").notNull().default(1),
  totalPayout: text("total_payout").notNull().default("0"),
  
  // Status
  status: text("status").notNull().default("pending"), // pending, approved, distributed, rejected
  
  approvedBy: varchar("approved_by"),
  distributionTxHash: text("distribution_tx_hash"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  distributedAt: timestamp("distributed_at"),
});

export const validatorPerformanceStats = pgTable("validator_performance_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  validatorAddress: text("validator_address").notNull(),
  
  // Period
  periodType: text("period_type").notNull(), // hourly, daily, weekly, monthly
  periodDate: timestamp("period_date").notNull(),
  
  // Performance
  uptimePercent: real("uptime_percent").notNull().default(100),
  responseTimeMs: integer("response_time_ms").notNull().default(0),
  blocksProposed: integer("blocks_proposed").notNull().default(0),
  blocksVerified: integer("blocks_verified").notNull().default(0),
  slashingEvents: integer("slashing_events").notNull().default(0),
  
  // Earnings
  totalRewards: text("total_rewards").notNull().default("0"),
  delegatorRewards: text("delegator_rewards").notNull().default("0"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// Program 8: Ecosystem Fund
// ============================================
export const GRANT_STATUS = ["draft", "submitted", "reviewing", "approved", "rejected", "active", "completed", "cancelled"] as const;
export const GRANT_CATEGORY = ["infrastructure", "defi", "nft", "gaming", "tooling", "research", "community", "other"] as const;

export const ecosystemGrants = pgTable("ecosystem_grants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Applicant
  applicantAddress: text("applicant_address").notNull(),
  applicantName: text("applicant_name").notNull(),
  applicantEmail: text("applicant_email"),
  teamSize: integer("team_size").notNull().default(1),
  
  // Project Details
  projectName: text("project_name").notNull(),
  projectDescription: text("project_description").notNull(),
  category: text("category").notNull(), // infrastructure, defi, nft, gaming, tooling, research, community
  
  // Funding
  requestedAmount: text("requested_amount").notNull().default("0"),
  approvedAmount: text("approved_amount").notNull().default("0"),
  disbursedAmount: text("disbursed_amount").notNull().default("0"),
  
  // Status
  status: text("status").notNull().default("draft"), // draft, submitted, reviewing, approved, rejected, active, completed, cancelled
  
  // Timeline
  proposedStartDate: timestamp("proposed_start_date"),
  proposedEndDate: timestamp("proposed_end_date"),
  actualStartDate: timestamp("actual_start_date"),
  actualEndDate: timestamp("actual_end_date"),
  
  // Documentation
  proposalUrl: text("proposal_url"),
  repositoryUrl: text("repository_url"),
  websiteUrl: text("website_url"),
  
  // Review
  reviewedBy: varchar("reviewed_by"),
  reviewNotes: text("review_notes"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const grantMilestones = pgTable("grant_milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  grantId: varchar("grant_id").notNull(),
  
  // Milestone Details
  milestoneNumber: integer("milestone_number").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  
  // Deliverables
  deliverables: jsonb("deliverables").notNull().default([]),
  evidenceUrl: text("evidence_url"),
  
  // Payment
  paymentAmount: text("payment_amount").notNull().default("0"),
  paymentPercent: real("payment_percent").notNull().default(0),
  
  // Status
  status: text("status").notNull().default("pending"), // pending, in_progress, submitted, approved, rejected
  dueDate: timestamp("due_date"),
  submittedAt: timestamp("submitted_at"),
  approvedAt: timestamp("approved_at"),
  
  // Review
  reviewedBy: varchar("reviewed_by"),
  reviewNotes: text("review_notes"),
  
  // Payment
  paymentTxHash: text("payment_tx_hash"),
  paidAt: timestamp("paid_at"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// Insert Schemas for Token Programs
// ============================================
export const insertTokenProgramSchema = createInsertSchema(tokenPrograms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProgramSnapshotSchema = createInsertSchema(programSnapshots).omit({
  id: true,
  createdAt: true,
});

export const insertAirdropClaimSchema = createInsertSchema(airdropClaims).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAirdropDistributionSchema = createInsertSchema(airdropDistributions).omit({
  id: true,
  createdAt: true,
});

export const insertReferralAccountSchema = createInsertSchema(referralAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReferralRewardSchema = createInsertSchema(referralRewards).omit({
  id: true,
  createdAt: true,
});

export const insertEventsCatalogSchema = createInsertSchema(eventsCatalog).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventRegistrationSchema = createInsertSchema(eventRegistrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommunityTaskSchema = createInsertSchema(communityTasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommunityContributionSchema = createInsertSchema(communityContributions).omit({
  id: true,
  createdAt: true,
});

export const insertCommunityMemberBadgeSchema = createInsertSchema(communityMemberBadges).omit({
  id: true,
});

export const insertDaoProposalSchema = createInsertSchema(daoProposals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDaoVoteSchema = createInsertSchema(daoVotes).omit({
  id: true,
});

export const insertDaoDelegationSchema = createInsertSchema(daoDelegations).omit({
  id: true,
  createdAt: true,
});

export const insertBlockRewardCycleSchema = createInsertSchema(blockRewardCycles).omit({
  id: true,
});

export const insertBlockRewardPayoutSchema = createInsertSchema(blockRewardPayouts).omit({
  id: true,
  createdAt: true,
});

export const insertValidatorIncentivePayoutSchema = createInsertSchema(validatorIncentivePayouts).omit({
  id: true,
  createdAt: true,
});

export const insertValidatorPerformanceStatSchema = createInsertSchema(validatorPerformanceStats).omit({
  id: true,
  createdAt: true,
});

export const insertEcosystemGrantSchema = createInsertSchema(ecosystemGrants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGrantMilestoneSchema = createInsertSchema(grantMilestones).omit({
  id: true,
  createdAt: true,
});

// ============================================
// Program 9: Partnership Program
// ============================================
export const PARTNERSHIP_STATUS = ["draft", "pending", "active", "suspended", "expired", "terminated"] as const;
export const PARTNERSHIP_TYPE = ["exchange", "wallet", "dapp", "infrastructure", "marketing", "strategic", "validator", "ambassador"] as const;
export const PARTNERSHIP_TIER = ["bronze", "silver", "gold", "platinum", "diamond"] as const;

export const partnerships = pgTable("partnerships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Partner Info
  partnerName: text("partner_name").notNull(),
  partnerType: text("partner_type").notNull(), // exchange, wallet, dapp, infrastructure, marketing, strategic, validator, ambassador
  tier: text("tier").notNull().default("bronze"), // bronze, silver, gold, platinum, diamond
  
  // Contact
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  website: text("website"),
  
  // Token Allocation
  allocatedAmount: text("allocated_amount").notNull().default("0"),
  vestingSchedule: text("vesting_schedule").default("linear"), // cliff, linear, immediate
  vestingDuration: integer("vesting_duration").default(12), // months
  distributedAmount: text("distributed_amount").notNull().default("0"),
  
  // Agreement
  agreementStartDate: timestamp("agreement_start_date"),
  agreementEndDate: timestamp("agreement_end_date"),
  contractUrl: text("contract_url"),
  
  // Metrics
  totalVolume: text("total_volume").notNull().default("0"),
  totalTransactions: integer("total_transactions").notNull().default(0),
  
  // Status
  status: text("status").notNull().default("draft"), // draft, pending, active, suspended, expired, terminated
  
  // Notes
  notes: text("notes"),
  
  // Audit
  createdBy: varchar("created_by"),
  approvedBy: varchar("approved_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const partnershipPayouts = pgTable("partnership_payouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  partnershipId: varchar("partnership_id").notNull(),
  
  // Payment Details
  amount: text("amount").notNull(),
  paymentType: text("payment_type").notNull(), // scheduled, bonus, milestone
  description: text("description"),
  
  // Status
  status: text("status").notNull().default("pending"), // pending, approved, processing, completed, failed
  
  // Transaction
  txHash: text("tx_hash"),
  paidAt: timestamp("paid_at"),
  
  // Approval
  approvedBy: varchar("approved_by"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPartnershipSchema = createInsertSchema(partnerships).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPartnershipPayoutSchema = createInsertSchema(partnershipPayouts).omit({
  id: true,
  createdAt: true,
});

// ============================================
// Types for Token Programs
// ============================================
export type TokenProgram = typeof tokenPrograms.$inferSelect;
export type InsertTokenProgram = z.infer<typeof insertTokenProgramSchema>;

export type ProgramSnapshot = typeof programSnapshots.$inferSelect;
export type InsertProgramSnapshot = z.infer<typeof insertProgramSnapshotSchema>;

export type AirdropClaim = typeof airdropClaims.$inferSelect;
export type InsertAirdropClaim = z.infer<typeof insertAirdropClaimSchema>;

export type AirdropDistribution = typeof airdropDistributions.$inferSelect;
export type InsertAirdropDistribution = z.infer<typeof insertAirdropDistributionSchema>;

export type ReferralAccount = typeof referralAccounts.$inferSelect;
export type InsertReferralAccount = z.infer<typeof insertReferralAccountSchema>;

export type ReferralReward = typeof referralRewards.$inferSelect;
export type InsertReferralReward = z.infer<typeof insertReferralRewardSchema>;

export type EventsCatalog = typeof eventsCatalog.$inferSelect;
export type InsertEventsCatalog = z.infer<typeof insertEventsCatalogSchema>;

export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type InsertEventRegistration = z.infer<typeof insertEventRegistrationSchema>;

export type CommunityTask = typeof communityTasks.$inferSelect;
export type InsertCommunityTask = z.infer<typeof insertCommunityTaskSchema>;

export type CommunityContribution = typeof communityContributions.$inferSelect;
export type InsertCommunityContribution = z.infer<typeof insertCommunityContributionSchema>;

export type CommunityMemberBadge = typeof communityMemberBadges.$inferSelect;
export type InsertCommunityMemberBadge = z.infer<typeof insertCommunityMemberBadgeSchema>;

export type DaoProposal = typeof daoProposals.$inferSelect;
export type InsertDaoProposal = z.infer<typeof insertDaoProposalSchema>;

export type DaoVote = typeof daoVotes.$inferSelect;
export type InsertDaoVote = z.infer<typeof insertDaoVoteSchema>;

export type DaoDelegation = typeof daoDelegations.$inferSelect;
export type InsertDaoDelegation = z.infer<typeof insertDaoDelegationSchema>;

export type BlockRewardCycle = typeof blockRewardCycles.$inferSelect;
export type InsertBlockRewardCycle = z.infer<typeof insertBlockRewardCycleSchema>;

export type BlockRewardPayout = typeof blockRewardPayouts.$inferSelect;
export type InsertBlockRewardPayout = z.infer<typeof insertBlockRewardPayoutSchema>;

export type ValidatorIncentivePayout = typeof validatorIncentivePayouts.$inferSelect;
export type InsertValidatorIncentivePayout = z.infer<typeof insertValidatorIncentivePayoutSchema>;

export type ValidatorPerformanceStat = typeof validatorPerformanceStats.$inferSelect;
export type InsertValidatorPerformanceStat = z.infer<typeof insertValidatorPerformanceStatSchema>;

export type EcosystemGrant = typeof ecosystemGrants.$inferSelect;
export type InsertEcosystemGrant = z.infer<typeof insertEcosystemGrantSchema>;

export type GrantMilestone = typeof grantMilestones.$inferSelect;
export type InsertGrantMilestone = z.infer<typeof insertGrantMilestoneSchema>;

export type Partnership = typeof partnerships.$inferSelect;
export type InsertPartnership = z.infer<typeof insertPartnershipSchema>;

export type PartnershipPayout = typeof partnershipPayouts.$inferSelect;
export type InsertPartnershipPayout = z.infer<typeof insertPartnershipPayoutSchema>;

// ============================================
// Marketing Program Tables
// ============================================
export const CAMPAIGN_TYPE = ["social_media", "influencer", "content_creation", "community", "ambassador", "bounty", "referral_boost", "airdrop_promotion"] as const;
export const MARKETING_CHANNEL = ["twitter", "discord", "telegram", "youtube", "tiktok", "medium", "reddit", "instagram", "facebook", "email", "other"] as const;
export const MARKETING_ACTION = ["follow", "like", "retweet", "comment", "share", "post", "video", "article", "referral", "signup", "verify_wallet", "stake", "trade"] as const;

export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  campaignType: text("campaign_type").notNull().default("social_media"),
  channel: text("channel").notNull().default("twitter"),
  targetAudience: text("target_audience"),
  budgetAmount: text("budget_amount").notNull().default("0"),
  spentAmount: text("spent_amount").notNull().default("0"),
  rewardPerAction: text("reward_per_action").notNull().default("0"),
  totalParticipants: integer("total_participants").notNull().default(0),
  totalReach: integer("total_reach").notNull().default(0),
  totalEngagements: integer("total_engagements").notNull().default(0),
  totalConversions: integer("total_conversions").notNull().default(0),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: text("status").notNull().default("draft"),
  goals: jsonb("goals"),
  requirements: jsonb("requirements"),
  createdBy: varchar("created_by"),
  approvedBy: varchar("approved_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const marketingParticipants = pgTable("marketing_participants", {
  id: varchar("id").primaryKey(),
  campaignId: varchar("campaign_id").notNull(),
  walletAddress: text("wallet_address").notNull(),
  username: text("username"),
  platform: text("platform").notNull(),
  actionsCompleted: integer("actions_completed").notNull().default(0),
  totalRewards: text("total_rewards").notNull().default("0"),
  referralCode: text("referral_code"),
  referralCount: integer("referral_count").notNull().default(0),
  status: text("status").notNull().default("active"),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  lastActivity: timestamp("last_activity"),
});

export const marketingRewards = pgTable("marketing_rewards", {
  id: varchar("id").primaryKey(),
  campaignId: varchar("campaign_id").notNull(),
  participantId: varchar("participant_id").notNull(),
  actionType: text("action_type").notNull(),
  rewardAmount: text("reward_amount").notNull(),
  status: text("status").notNull().default("pending"),
  txHash: text("tx_hash"),
  metadata: jsonb("metadata"),
  verifiedAt: timestamp("verified_at"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMarketingCampaignSchema = createInsertSchema(marketingCampaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMarketingParticipantSchema = createInsertSchema(marketingParticipants).omit({
  id: true,
  joinedAt: true,
});

export const insertMarketingRewardSchema = createInsertSchema(marketingRewards).omit({
  id: true,
  createdAt: true,
});

export type MarketingCampaign = typeof marketingCampaigns.$inferSelect;
export type InsertMarketingCampaign = z.infer<typeof insertMarketingCampaignSchema>;

export type MarketingParticipant = typeof marketingParticipants.$inferSelect;
export type InsertMarketingParticipant = z.infer<typeof insertMarketingParticipantSchema>;

export type MarketingReward = typeof marketingRewards.$inferSelect;
export type InsertMarketingReward = z.infer<typeof insertMarketingRewardSchema>;
