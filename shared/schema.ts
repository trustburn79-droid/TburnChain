import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, bigint, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================
// TBURN Blockchain Schema
// ============================================

// Blocks
// Blocks (Multi-Hash Cryptographic System)
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
});

// Transactions
// Transactions (Multi-Hash Cryptographic System)
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
  legalName: text("legal_name"), // KYC verified name
  entityType: text("entity_type").notNull().default("individual"), // individual, corporation, partnership, dao, foundation, government
  jurisdiction: text("jurisdiction"), // ISO 3166-1 country code
  registrationNumber: text("registration_number"), // business/legal registration
  
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
  
  // Contact (encrypted)
  encryptedEmail: text("encrypted_email"),
  encryptedPhone: text("encrypted_phone"),
  
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
  
  // Proposal Activity
  proposalsCreated: integer("proposals_created").notNull().default(0),
  proposalsPassed: integer("proposals_passed").notNull().default(0),
  proposalsRejected: integer("proposals_rejected").notNull().default(0),
  
  // Voting Activity
  totalVotesCast: integer("total_votes_cast").notNull().default(0),
  votesFor: integer("votes_for").notNull().default(0),
  votesAgainst: integer("votes_against").notNull().default(0),
  votesAbstain: integer("votes_abstain").notNull().default(0),
  votingParticipationRate: integer("voting_participation_rate").notNull().default(0), // basis points
  
  // Delegation
  delegatedTo: text("delegated_to"), // member address if voting power is delegated
  delegatedFrom: jsonb("delegated_from").notNull().default([]), // array of addresses who delegated to this member
  
  // Reputation
  reputationScore: integer("reputation_score").notNull().default(5000), // basis points
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
  
  // Authentication
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  multiSigEnabled: boolean("multi_sig_enabled").notNull().default(false),
  requiredConfirmations: integer("required_confirmations").notNull().default(1),
  
  // Access Control
  ipWhitelist: jsonb("ip_whitelist").notNull().default([]), // array of allowed IPs
  allowedRegions: jsonb("allowed_regions").notNull().default([]), // array of ISO country codes
  maxSessionDuration: integer("max_session_duration").notNull().default(86400), // seconds
  
  // Security Events
  failedLoginAttempts: integer("failed_login_attempts").notNull().default(0),
  lastFailedLogin: timestamp("last_failed_login"),
  lastKeyRotation: timestamp("last_key_rotation"),
  nextKeyRotationDue: timestamp("next_key_rotation_due"),
  
  // Risk Management
  riskScore: integer("risk_score").notNull().default(0), // 0-100 (higher is riskier)
  lastRiskAssessment: timestamp("last_risk_assessment").notNull().defaultNow(),
  
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
export const insertMemberAuditLogSchema = createInsertSchema(memberAuditLogs).omit({ id: true, timestamp: true });

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
  requiredQuorum: z.number(),
  avgBlockTimeMs: z.number(),
  startTime: z.number(),
});
