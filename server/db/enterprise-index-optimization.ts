/**
 * TBURN Enterprise Database Index Optimization
 * Production-grade indexes for 210,000 TPS and sub-millisecond query times
 * 
 * Index Categories:
 * 1. Token Distribution Tables (airdrop, referral, events, community, DAO)
 * 2. Block Rewards & Validator Performance
 * 3. Genesis Configuration & Ecosystem Grants
 * 4. High-frequency query patterns
 */

import { db } from '../db';
import { sql } from 'drizzle-orm';

/**
 * Enterprise Index Specification
 * Each index includes workload analysis and expected query patterns
 */
export const ENTERPRISE_INDEXES = {
  // ============================================
  // TOKEN PROGRAMS - Core Dashboard Queries
  // ============================================
  TOKEN_PROGRAMS: [
    // Dashboard listing - status + priority ordering
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_token_programs_status_priority 
     ON token_programs(status, priority DESC) 
     WHERE status IN ('active', 'upcoming')`,
    
    // Program type filtering with status
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_token_programs_type_status 
     ON token_programs(program_type, status, created_at DESC)`,
    
    // Progress tracking for active programs
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_token_programs_progress 
     ON token_programs(progress_percent DESC, status) 
     WHERE progress_percent < 100`,
    
    // Date-based queries for timeline views
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_token_programs_dates 
     ON token_programs(start_date, end_date) 
     WHERE start_date IS NOT NULL`,
  ],
  
  // ============================================
  // AIRDROP CLAIMS - High-Volume Eligibility Checks
  // ============================================
  AIRDROP_CLAIMS: [
    // Wallet lookup - most frequent query
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_airdrop_claims_wallet_status 
     ON airdrop_claims(wallet_address, status)`,
    
    // Status-based batch processing
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_airdrop_claims_status_tier 
     ON airdrop_claims(status, tier, created_at DESC)`,
    
    // Merkle proof verification
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_airdrop_claims_snapshot_block 
     ON airdrop_claims(snapshot_block_number, status) 
     WHERE snapshot_block_number IS NOT NULL`,
    
    // Claim transaction tracking
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_airdrop_claims_tx_hash 
     ON airdrop_claims(claim_tx_hash) 
     WHERE claim_tx_hash IS NOT NULL`,
    
    // Vesting schedule lookups
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_airdrop_claims_vesting 
     ON airdrop_claims(vesting_schedule_id, vesting_start_date) 
     WHERE vesting_schedule_id IS NOT NULL`,
  ],
  
  // ============================================
  // AIRDROP DISTRIBUTIONS - Batch Processing
  // ============================================
  AIRDROP_DISTRIBUTIONS: [
    // Batch number ordering
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_airdrop_distributions_batch 
     ON airdrop_distributions(batch_number DESC, status)`,
    
    // Processing status with date
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_airdrop_distributions_status 
     ON airdrop_distributions(status, created_at DESC)`,
    
    // Executor tracking
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_airdrop_distributions_executor 
     ON airdrop_distributions(executed_by, status) 
     WHERE executed_by IS NOT NULL`,
  ],
  
  // ============================================
  // REFERRAL SYSTEM - Multi-tier Commission
  // ============================================
  REFERRAL_ACCOUNTS: [
    // Referral code lookup (unique but add composite index)
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_accounts_code_active 
     ON referral_accounts(referral_code, tier)`,
    
    // Tier-based leaderboards
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_accounts_tier_earnings 
     ON referral_accounts(tier, total_earned DESC)`,
    
    // Active referrers with pending rewards
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_accounts_pending 
     ON referral_accounts(pending_rewards DESC) 
     WHERE pending_rewards != '0'`,
    
    // Referrer chain lookup
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_accounts_referred_by 
     ON referral_accounts(referred_by) 
     WHERE referred_by IS NOT NULL`,
  ],
  
  REFERRAL_REWARDS: [
    // Referrer reward history
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_rewards_referrer 
     ON referral_rewards(referrer_id, status, created_at DESC)`,
    
    // Pending payouts
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_rewards_pending 
     ON referral_rewards(status, created_at DESC) 
     WHERE status = 'pending'`,
    
    // Source transaction lookup
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_rewards_source_tx 
     ON referral_rewards(source_tx_hash) 
     WHERE source_tx_hash IS NOT NULL`,
  ],
  
  // ============================================
  // EVENTS SYSTEM - Timeline & Participation
  // ============================================
  EVENTS_CATALOG: [
    // Active events by type
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_catalog_type_status 
     ON events_catalog(event_type, status, start_date DESC)`,
    
    // Date-range queries
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_catalog_dates 
     ON events_catalog(start_date, end_date) 
     WHERE status IN ('upcoming', 'active')`,
    
    // Registration deadline tracking
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_catalog_deadline 
     ON events_catalog(registration_deadline, status) 
     WHERE registration_deadline IS NOT NULL`,
  ],
  
  EVENT_REGISTRATIONS: [
    // Event participant lookup
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_event_registrations_event_wallet 
     ON event_registrations(event_id, wallet_address)`,
    
    // Leaderboard queries
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_event_registrations_ranking 
     ON event_registrations(event_id, score DESC, rank)`,
    
    // Unclaimed rewards
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_event_registrations_unclaimed 
     ON event_registrations(event_id, reward_claimed) 
     WHERE reward_claimed = false AND reward_amount != '0'`,
  ],
  
  // ============================================
  // COMMUNITY TASKS - Contribution Tracking
  // ============================================
  COMMUNITY_TASKS: [
    // Active tasks by type
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_community_tasks_type_active 
     ON community_tasks(task_type, is_active, points_reward DESC)`,
    
    // Available slots
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_community_tasks_slots 
     ON community_tasks(max_completions, completion_count) 
     WHERE is_active = true`,
    
    // Date-based availability
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_community_tasks_dates 
     ON community_tasks(start_date, end_date) 
     WHERE is_active = true`,
  ],
  
  COMMUNITY_CONTRIBUTIONS: [
    // Contributor history
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_community_contributions_wallet 
     ON community_contributions(wallet_address, status, created_at DESC)`,
    
    // Pending reviews
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_community_contributions_pending 
     ON community_contributions(status, created_at) 
     WHERE status = 'pending'`,
    
    // Task completion tracking
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_community_contributions_task 
     ON community_contributions(task_id, status)`,
  ],
  
  // ============================================
  // DAO GOVERNANCE - Voting & Proposals
  // ============================================
  DAO_PROPOSALS: [
    // Active proposals for voting
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dao_proposals_status_voting 
     ON dao_proposals(status, voting_end_date) 
     WHERE status = 'active'`,
    
    // Proposal number lookup
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dao_proposals_number 
     ON dao_proposals(proposal_number DESC)`,
    
    // Category filtering
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dao_proposals_category_status 
     ON dao_proposals(category, status, created_at DESC)`,
    
    // Quorum tracking
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dao_proposals_quorum 
     ON dao_proposals(status, total_voters) 
     WHERE status = 'active'`,
  ],
  
  DAO_VOTES: [
    // Voter history
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dao_votes_voter 
     ON dao_votes(voter_address, voted_at DESC)`,
    
    // Proposal vote aggregation
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dao_votes_proposal_choice 
     ON dao_votes(proposal_id, choice)`,
    
    // Delegation tracking
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dao_votes_delegation 
     ON dao_votes(delegated_from) 
     WHERE delegated_from IS NOT NULL`,
  ],
  
  DAO_DELEGATIONS: [
    // Active delegations
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dao_delegations_active 
     ON dao_delegations(delegator_address, delegate_address) 
     WHERE is_active = true`,
    
    // Delegate power aggregation
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dao_delegations_delegate 
     ON dao_delegations(delegate_address, delegated_power DESC) 
     WHERE is_active = true`,
  ],
  
  // ============================================
  // BLOCK REWARDS - High-Volume Time-Series
  // ============================================
  BLOCK_REWARD_CYCLES: [
    // Active cycle lookup
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_block_reward_cycles_active 
     ON block_reward_cycles(status, cycle_number DESC)`,
    
    // Block range queries
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_block_reward_cycles_blocks 
     ON block_reward_cycles(start_block_number, end_block_number)`,
    
    // Distribution status
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_block_reward_cycles_distribution 
     ON block_reward_cycles(distribution_status, completed_at DESC) 
     WHERE distribution_status IN ('pending', 'processing')`,
  ],
  
  BLOCK_REWARD_PAYOUTS: [
    // Validator payout history
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_block_reward_payouts_validator 
     ON block_reward_payouts(validator_address, status, created_at DESC)`,
    
    // Cycle aggregation
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_block_reward_payouts_cycle 
     ON block_reward_payouts(cycle_id, reward_type, status)`,
    
    // Pending payouts for batch processing
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_block_reward_payouts_pending 
     ON block_reward_payouts(status, created_at) 
     WHERE status = 'pending'`,
    
    // Block-level queries
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_block_reward_payouts_block 
     ON block_reward_payouts(block_number, validator_address) 
     WHERE block_number IS NOT NULL`,
  ],
  
  // ============================================
  // VALIDATOR PERFORMANCE - Analytics
  // ============================================
  VALIDATOR_INCENTIVE_PAYOUTS: [
    // Validator incentive history
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_validator_incentive_payouts_validator 
     ON validator_incentive_payouts(validator_address, incentive_type, created_at DESC)`,
    
    // Pending approvals
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_validator_incentive_payouts_status 
     ON validator_incentive_payouts(status, created_at) 
     WHERE status IN ('pending', 'approved')`,
    
    // Period-based queries
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_validator_incentive_payouts_period 
     ON validator_incentive_payouts(period_start, period_end)`,
  ],
  
  VALIDATOR_PERFORMANCE_STATS: [
    // Time-series performance queries
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_validator_performance_stats_time 
     ON validator_performance_stats(validator_address, period_type, period_date DESC)`,
    
    // Performance leaderboards
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_validator_performance_stats_uptime 
     ON validator_performance_stats(period_type, period_date, uptime_percent DESC)`,
    
    // Slashing monitoring
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_validator_performance_stats_slashing 
     ON validator_performance_stats(period_date, slashing_events) 
     WHERE slashing_events > 0`,
  ],
  
  // ============================================
  // ECOSYSTEM GRANTS - Project Management
  // ============================================
  ECOSYSTEM_GRANTS: [
    // Status-based filtering
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ecosystem_grants_status_category 
     ON ecosystem_grants(status, category, created_at DESC)`,
    
    // Applicant lookup
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ecosystem_grants_applicant 
     ON ecosystem_grants(applicant_address, status)`,
    
    // Active grants with disbursement tracking
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ecosystem_grants_active 
     ON ecosystem_grants(status, disbursed_amount) 
     WHERE status IN ('approved', 'active')`,
    
    // Review queue
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ecosystem_grants_review 
     ON ecosystem_grants(status, created_at) 
     WHERE status IN ('submitted', 'reviewing')`,
  ],
  
  GRANT_MILESTONES: [
    // Grant milestone tracking
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_grant_milestones_grant 
     ON grant_milestones(grant_id, milestone_number)`,
    
    // Pending verification
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_grant_milestones_status 
     ON grant_milestones(status, due_date) 
     WHERE status IN ('pending', 'submitted')`,
    
    // Overdue milestones
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_grant_milestones_overdue 
     ON grant_milestones(due_date, status) 
     WHERE status = 'pending'`,
  ],
  
  // ============================================
  // PROGRAM SNAPSHOTS - Dashboard Performance
  // ============================================
  PROGRAM_SNAPSHOTS: [
    // Latest snapshot per program
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_program_snapshots_latest 
     ON program_snapshots(program_id, snapshot_date DESC)`,
    
    // Date range queries
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_program_snapshots_date 
     ON program_snapshots(snapshot_date DESC, program_id)`,
  ],
  
  // ============================================
  // COMMUNITY BADGES - Achievement System
  // ============================================
  COMMUNITY_MEMBER_BADGES: [
    // Wallet badge collection
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_community_member_badges_wallet 
     ON community_member_badges(wallet_address, rarity, earned_at DESC)`,
    
    // Badge type counts
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_community_member_badges_name 
     ON community_member_badges(badge_name, rarity)`,
  ],

  // ============================================
  // SHARDING SYSTEM - 64 Shards, 210K TPS
  // ============================================
  SHARDS: [
    // Shard lookup by ID (primary)
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shards_shard_id_status 
     ON shards(shard_id, status)`,
    
    // Active shards listing
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shards_status_tps 
     ON shards(status, tps DESC) 
     WHERE status = 'active'`,
    
    // Validator assignment lookup
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shards_validator_count 
     ON shards(validator_count DESC, shard_id)`,
    
    // Block height ordering
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shards_block_height 
     ON shards(current_block_height DESC, shard_id)`,
    
    // Cross-shard transaction tracking
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shards_cross_shard_tx 
     ON shards(cross_shard_tx_count DESC) 
     WHERE cross_shard_tx_count > 0`,
    
    // Performance metrics
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shards_performance 
     ON shards(tps DESC, latency_ms, shard_id)`,
    
    // Sync status monitoring
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shards_sync_status 
     ON shards(last_synced_at DESC, status)`,
  ],
  
  CROSS_SHARD_MESSAGES: [
    // Source shard messages
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cross_shard_messages_from 
     ON cross_shard_messages(from_shard_id, status, created_at DESC)`,
    
    // Destination shard messages
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cross_shard_messages_to 
     ON cross_shard_messages(to_shard_id, status, created_at DESC)`,
    
    // Status-based processing
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cross_shard_messages_status 
     ON cross_shard_messages(status, priority DESC, created_at) 
     WHERE status IN ('pending', 'processing')`,
    
    // Transaction hash lookup
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cross_shard_messages_tx 
     ON cross_shard_messages(tx_hash) 
     WHERE tx_hash IS NOT NULL`,
    
    // Retry queue
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cross_shard_messages_retry 
     ON cross_shard_messages(retry_count, status) 
     WHERE status = 'failed' AND retry_count < 3`,
    
    // Route optimization (shard pair)
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cross_shard_messages_route 
     ON cross_shard_messages(from_shard_id, to_shard_id, created_at DESC)`,
  ],
  
  SHARD_CONFIGURATIONS: [
    // Active configuration lookup
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shard_configurations_active 
     ON shard_configurations(is_active, updated_at DESC) 
     WHERE is_active = true`,
    
    // Configuration name search
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shard_configurations_name 
     ON shard_configurations(config_name)`,
    
    // Shard count range
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shard_configurations_shards 
     ON shard_configurations(current_shard_count, min_shards, max_shards)`,
  ],
  
  SHARD_SCALING_EVENTS: [
    // Recent scaling events
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shard_scaling_events_time 
     ON shard_scaling_events(event_time DESC, scaling_type)`,
    
    // Scaling type analysis
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shard_scaling_events_type 
     ON shard_scaling_events(scaling_type, status, event_time DESC)`,
    
    // Duration analysis
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shard_scaling_events_duration 
     ON shard_scaling_events(duration_ms DESC) 
     WHERE status = 'completed'`,
    
    // Trigger reason tracking
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shard_scaling_events_trigger 
     ON shard_scaling_events(trigger_reason, event_time DESC)`,
    
    // Pending/failed events
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shard_scaling_events_status 
     ON shard_scaling_events(status, event_time) 
     WHERE status IN ('pending', 'in_progress', 'failed')`,
  ],
  
  SHARD_CONFIG_HISTORY: [
    // Configuration history by config
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shard_config_history_config 
     ON shard_config_history(config_id, changed_at DESC)`,
    
    // Admin action tracking
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shard_config_history_admin 
     ON shard_config_history(changed_by, changed_at DESC)`,
    
    // Change type filtering
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shard_config_history_type 
     ON shard_config_history(change_type, changed_at DESC)`,
  ],
  
  SHARD_CONFIG_AUDIT_LOGS: [
    // Audit trail by action
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shard_config_audit_action 
     ON shard_config_audit_logs(action, created_at DESC)`,
    
    // Actor tracking
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shard_config_audit_actor 
     ON shard_config_audit_logs(actor_id, created_at DESC)`,
    
    // IP-based security monitoring
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shard_config_audit_ip 
     ON shard_config_audit_logs(ip_address, created_at DESC) 
     WHERE ip_address IS NOT NULL`,
  ],

  // ============================================
  // TRANSACTION SHARDING - High-Volume Queries
  // ============================================
  TRANSACTIONS_SHARD: [
    // Shard-based transaction lookup
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_shard_id 
     ON transactions(shard_id, block_number DESC, tx_index)`,
    
    // Cross-shard transaction tracking
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_cross_shard 
     ON transactions(execution_class, status) 
     WHERE execution_class = 'cross_shard'`,
    
    // Cross-shard message lookup
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_cross_shard_msg 
     ON transactions(cross_shard_message_id) 
     WHERE cross_shard_message_id IS NOT NULL`,
  ],
  
  BLOCKS_SHARD: [
    // Block shard assignment
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_blocks_shard_id 
     ON blocks(shard_id, number DESC)`,
    
    // Shard block height tracking
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_blocks_shard_height 
     ON blocks(shard_id, number DESC, timestamp DESC)`,
  ],

  // ============================================
  // VALIDATOR SHARD ASSIGNMENT - Genesis Config
  // ============================================
  VALIDATORS_SHARD: [
    // Shard-based validator lookup
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_validators_shard_assignment 
     ON validators(shard_id, status, stake_amount DESC) 
     WHERE shard_id IS NOT NULL`,
    
    // Active validators per shard
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_validators_active_shard 
     ON validators(shard_id, is_active, stake_amount DESC) 
     WHERE is_active = true AND shard_id IS NOT NULL`,
  ],

  // ============================================
  // CONSENSUS & BLOCK PRODUCTION - Time-Series
  // ============================================
  CONSENSUS_ROUNDS: [
    // Round number ordering
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consensus_rounds_number 
     ON consensus_rounds(round_number DESC, view_number DESC)`,
    
    // Phase tracking
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consensus_rounds_phase 
     ON consensus_rounds(phase, status, created_at DESC)`,
    
    // Block height lookup
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consensus_rounds_block 
     ON consensus_rounds(block_height DESC, round_number)`,
    
    // Proposer performance
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consensus_rounds_proposer 
     ON consensus_rounds(proposer_address, status, created_at DESC)`,
  ],
  
  BLOCK_FINALITY_RECORDS: [
    // Block height finality
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_block_finality_height 
     ON block_finality_records(block_height DESC, finality_status)`,
    
    // Finality status tracking
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_block_finality_status 
     ON block_finality_records(finality_status, finalized_at DESC)`,
    
    // Verification time analysis
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_block_finality_time 
     ON block_finality_records(verification_time_ms DESC) 
     WHERE finality_status = 'finalized'`,
  ],

  // ============================================
  // VALIDATOR CORE - 125 Genesis Validators, O(1) Lookups
  // ============================================
  VALIDATORS_CORE: [
    // Active validators listing (primary dashboard query)
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_validators_status_stake 
     ON validators(status, stake DESC) 
     WHERE status = 'active'`,
    
    // Address lookup (O(1) wallet query)
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_validators_address_status 
     ON validators(address, status)`,
    
    // Voting power ranking
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_validators_voting_power 
     ON validators(voting_power DESC, status) 
     WHERE status = 'active'`,
    
    // Performance score ranking
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_validators_performance 
     ON validators(performance_score DESC, uptime DESC) 
     WHERE status = 'active'`,
    
    // Commission rate lookup
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_validators_commission 
     ON validators(commission, delegated_stake DESC) 
     WHERE status = 'active'`,
    
    // Jailed validators monitoring
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_validators_jailed 
     ON validators(status, slash_count DESC, last_active_at) 
     WHERE status = 'jailed'`,
    
    // Delegator count ranking
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_validators_delegators 
     ON validators(delegators DESC, delegated_stake DESC) 
     WHERE status = 'active'`,
    
    // AI trust score ranking
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_validators_ai_trust 
     ON validators(ai_trust_score DESC, reputation_score DESC) 
     WHERE status = 'active'`,
  ],

  // ============================================
  // VALIDATOR BLOCK REWARDS - Per-block Distribution
  // ============================================
  VALIDATOR_BLOCK_REWARDS: [
    // Validator reward history
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_validator_block_rewards_validator 
     ON validator_block_rewards(validator_address, block_number DESC)`,
    
    // Undistributed rewards processing
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_validator_block_rewards_pending 
     ON validator_block_rewards(distributed, created_at DESC) 
     WHERE distributed = false`,
    
    // Reward type analytics
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_validator_block_rewards_type 
     ON validator_block_rewards(reward_type, block_number DESC)`,
    
    // Block-based reward lookup
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_validator_block_rewards_block 
     ON validator_block_rewards(block_number DESC, validator_address)`,
    
    // Participation role analysis
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_validator_block_rewards_role 
     ON validator_block_rewards(participation_role, distributed)`,
  ],

  // ============================================
  // BLOCK VERIFICATIONS - Cross-Validator Verification
  // ============================================
  BLOCK_VERIFICATIONS: [
    // Block verification lookup
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_block_verifications_block 
     ON block_verifications(block_number DESC, verification_result)`,
    
    // Validator verification history
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_block_verifications_validator 
     ON block_verifications(validator_address, created_at DESC)`,
    
    // Failed verification tracking
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_block_verifications_invalid 
     ON block_verifications(verification_result, block_number DESC) 
     WHERE verification_result != 'valid'`,
    
    // Verification time analysis
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_block_verifications_time 
     ON block_verifications(verification_time_ms DESC, block_number)`,
    
    // State root mismatch tracking
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_block_verifications_mismatch 
     ON block_verifications(state_root_match, receipts_root_match) 
     WHERE state_root_match = false OR receipts_root_match = false`,
  ],

  // ============================================
  // BLOCK FINALITY CONFIRMATIONS - Final State
  // ============================================
  BLOCK_FINALITY_CONFIRMATIONS: [
    // Finality status lookup
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_block_finality_conf_status 
     ON block_finality_confirmations(finality_status, block_number DESC)`,
    
    // Pending finality processing
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_block_finality_conf_pending 
     ON block_finality_confirmations(finality_status, consensus_start_at) 
     WHERE finality_status IN ('pending', 'confirmed')`,
    
    // Finalized blocks with timing
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_block_finality_conf_finalized 
     ON block_finality_confirmations(finalized_at DESC, confirmation_latency_ms) 
     WHERE finality_status = 'finalized'`,
    
    // Verification vote analysis
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_block_finality_conf_votes 
     ON block_finality_confirmations(valid_votes DESC, total_verifications)`,
  ],

  // ============================================
  // VALIDATOR PERFORMANCE HISTORY - Time-Series Analytics
  // ============================================
  VALIDATOR_PERFORMANCE_HISTORY: [
    // Validator history lookup (primary)
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_validator_perf_history_addr 
     ON validator_performance_history(validator_address, period_end DESC)`,
    
    // Period-based analytics
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_validator_perf_history_period 
     ON validator_performance_history(period_type, period_start DESC, period_end DESC)`,
    
    // Performance ranking over time
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_validator_perf_history_rank 
     ON validator_performance_history(uptime DESC, blocks_produced DESC, period_end DESC)`,
    
    // Slashing history tracking
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_validator_perf_history_slash 
     ON validator_performance_history(slash_events DESC, total_slashed DESC) 
     WHERE slash_events > 0`,
    
    // AI score trends
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_validator_perf_history_ai 
     ON validator_performance_history(ai_trust_score DESC, behavior_score DESC, period_end DESC)`,
    
    // Reward analytics
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_validator_perf_history_rewards 
     ON validator_performance_history(rewards_earned DESC, commissions_earned DESC, period_end DESC)`,
  ],

  // ============================================
  // GENESIS VALIDATORS - Mainnet Launch (125 Validators)
  // ============================================
  GENESIS_VALIDATORS: [
    // Config-based validator listing
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_genesis_validators_config 
     ON genesis_validators(config_id, tier, priority DESC)`,
    
    // Address lookup
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_genesis_validators_address 
     ON genesis_validators(address)`,
    
    // Tier-based queries
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_genesis_validators_tier 
     ON genesis_validators(tier, initial_stake DESC)`,
    
    // Verification status
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_genesis_validators_verified 
     ON genesis_validators(is_verified, kyc_status) 
     WHERE is_verified = true`,
    
    // Pending verification
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_genesis_validators_pending 
     ON genesis_validators(kyc_status, created_at DESC) 
     WHERE kyc_status = 'pending'`,
  ],

  // ============================================
  // DELEGATIONS - Stake Delegation Tracking
  // ============================================
  DELEGATIONS: [
    // Delegator lookups
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_delegations_delegator 
     ON delegations(delegator_address, status, created_at DESC)`,
    
    // Validator delegation totals
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_delegations_validator 
     ON delegations(validator_address, status, amount DESC)`,
    
    // Active delegations
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_delegations_active 
     ON delegations(status, amount DESC) 
     WHERE status = 'active'`,
    
    // Unbonding delegations
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_delegations_unbonding 
     ON delegations(status, unbonding_end_time) 
     WHERE status = 'unbonding'`,
    
    // Reward claim processing
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_delegations_rewards 
     ON delegations(pending_rewards DESC, last_claim_at) 
     WHERE pending_rewards != '0'`,
  ],

  // ============================================
  // ENTERPRISE REWARD DISTRIBUTION ENGINE INDEXES
  // Designed for 210K TPS with sub-millisecond query times
  // ============================================
  REWARD_EPOCHS: [
    // Epoch lookup by status - primary dashboard query
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reward_epochs_status 
     ON reward_epochs(status, epoch_number DESC)`,
    
    // Active epoch fast lookup
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reward_epochs_active 
     ON reward_epochs(status) 
     WHERE status = 'active'`,
    
    // Block range queries for epoch identification
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reward_epochs_blocks 
     ON reward_epochs(start_block, end_block)`,
    
    // Finalized epochs for archival queries
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reward_epochs_finalized 
     ON reward_epochs(finalized_at DESC) 
     WHERE status = 'finalized'`,
  ],

  REWARD_EPOCH_METRICS: [
    // Epoch metrics lookup
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reward_epoch_metrics_epoch 
     ON reward_epoch_metrics(epoch_number DESC)`,
    
    // APY analysis queries
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reward_epoch_metrics_apy 
     ON reward_epoch_metrics(effective_apy DESC, epoch_number DESC)`,
    
    // Reward totals for analytics
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reward_epoch_metrics_totals 
     ON reward_epoch_metrics(total_distributed, total_burned)`,
  ],

  VALIDATOR_REWARD_EVENTS: [
    // Primary validator history lookup - most frequent query
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_validator_reward_events_history 
     ON validator_reward_events(validator_id, epoch_number DESC, block_number DESC)`,
    
    // Epoch + shard composite for cross-shard analytics
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_validator_reward_events_epoch_shard 
     ON validator_reward_events(epoch_number, shard_id, block_number)`,
    
    // Status-based processing queue
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_validator_reward_events_status 
     ON validator_reward_events(status, priority, created_at DESC)`,
    
    // Pending rewards for distribution
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_validator_reward_events_pending 
     ON validator_reward_events(status, priority DESC, calculated_at) 
     WHERE status = 'pending'`,
    
    // Batch processing lookup
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_validator_reward_events_batch 
     ON validator_reward_events(batch_id, status) 
     WHERE batch_id IS NOT NULL`,
    
    // Validator address lookup (secondary index)
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_validator_reward_events_address 
     ON validator_reward_events(validator_address, epoch_number DESC)`,
    
    // Reward type analytics
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_validator_reward_events_type 
     ON validator_reward_events(reward_type, epoch_number DESC)`,
    
    // Failed rewards for retry processing
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_validator_reward_events_failed 
     ON validator_reward_events(status, retry_count, created_at) 
     WHERE status = 'failed'`,
  ],

  REWARD_BATCHES: [
    // Epoch + status for batch queue management
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reward_batches_epoch_status 
     ON reward_batches(epoch_number, status, priority DESC)`,
    
    // Pending batches queue
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reward_batches_pending 
     ON reward_batches(status, priority DESC, created_at) 
     WHERE status = 'pending'`,
    
    // Processing batches for SLA tracking
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reward_batches_processing 
     ON reward_batches(status, processed_at) 
     WHERE status = 'processing'`,
    
    // Failed batches for retry
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reward_batches_failed 
     ON reward_batches(status, retry_count, created_at) 
     WHERE status = 'failed'`,
    
    // Completed batches for analytics
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reward_batches_completed 
     ON reward_batches(completed_at DESC) 
     WHERE status = 'completed'`,
  ],

  REWARD_GAS_ACCUMULATORS: [
    // Epoch + block lookup for gas statistics
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reward_gas_accumulators_epoch_block 
     ON reward_gas_accumulators(epoch_number, block_number)`,
    
    // BRIN index for sequential block access (high-TPS optimization)
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reward_gas_accumulators_block_brin 
     ON reward_gas_accumulators USING BRIN (block_number)`,
    
    // Base fee tracking for EIP-1559
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reward_gas_accumulators_base_fee 
     ON reward_gas_accumulators(epoch_number, base_fee)`,
    
    // Recent blocks for EWMA calculation
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reward_gas_accumulators_recent 
     ON reward_gas_accumulators(created_at DESC, epoch_number)`,
  ],

  REWARD_WAL: [
    // Sequence-based replay ordering
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reward_wal_sequence 
     ON reward_wal(sequence, status)`,
    
    // Pending WAL entries for recovery
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reward_wal_pending 
     ON reward_wal(status, sequence, created_at) 
     WHERE status = 'PENDING'`,
    
    // Operation type lookup
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reward_wal_operation 
     ON reward_wal(operation, status, created_at DESC)`,
    
    // Recent WAL entries for monitoring
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reward_wal_recent 
     ON reward_wal(created_at DESC, status)`,
    
    // Committed entries for cleanup
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reward_wal_committed 
     ON reward_wal(committed_at DESC) 
     WHERE status = 'COMMITTED'`,
  ],
};

/**
 * Apply all enterprise indexes
 */
export async function applyEnterpriseIndexes(): Promise<{
  success: boolean;
  applied: number;
  failed: number;
  errors: string[];
}> {
  const results = {
    success: true,
    applied: 0,
    failed: 0,
    errors: [] as string[],
  };
  
  console.log('[Enterprise DB] Starting index optimization...');
  
  for (const [category, indexes] of Object.entries(ENTERPRISE_INDEXES)) {
    console.log(`[Enterprise DB] Processing ${category}...`);
    
    for (const indexSql of indexes) {
      try {
        await db.execute(sql.raw(indexSql));
        results.applied++;
      } catch (error) {
        // Handle case where index already exists or table doesn't exist
        const errorMsg = error instanceof Error ? error.message : String(error);
        
        if (errorMsg.includes('already exists')) {
          // Index exists, skip
          results.applied++;
        } else if (errorMsg.includes('does not exist')) {
          // Table doesn't exist yet, skip
          console.log(`[Enterprise DB] Skipping - table not yet created: ${errorMsg}`);
        } else {
          results.failed++;
          results.errors.push(`${category}: ${errorMsg}`);
          console.error(`[Enterprise DB] Failed to create index: ${errorMsg}`);
        }
      }
    }
  }
  
  results.success = results.failed === 0;
  
  console.log(`[Enterprise DB] Index optimization complete: ${results.applied} applied, ${results.failed} failed`);
  
  return results;
}

/**
 * Get index statistics for monitoring
 */
export async function getIndexStatistics(): Promise<{
  totalIndexes: number;
  categories: Record<string, number>;
}> {
  let total = 0;
  const categories: Record<string, number> = {};
  
  for (const [category, indexes] of Object.entries(ENTERPRISE_INDEXES)) {
    categories[category] = indexes.length;
    total += indexes.length;
  }
  
  return {
    totalIndexes: total,
    categories,
  };
}

/**
 * ANALYZE tables for query planner optimization
 */
export async function analyzeTokenDistributionTables(): Promise<void> {
  const tables = [
    // Token Distribution
    'token_programs',
    'airdrop_claims',
    'airdrop_distributions',
    'referral_accounts',
    'referral_rewards',
    'events_catalog',
    'event_registrations',
    'community_tasks',
    'community_contributions',
    'community_member_badges',
    'dao_proposals',
    'dao_votes',
    'dao_delegations',
    'block_reward_cycles',
    'block_reward_payouts',
    'validator_incentive_payouts',
    'validator_performance_stats',
    'ecosystem_grants',
    'grant_milestones',
    'program_snapshots',
    // Sharding System
    'shards',
    'cross_shard_messages',
    'shard_configurations',
    'shard_config_history',
    'shard_scaling_events',
    'shard_config_audit_logs',
    // Core Blockchain
    'transactions',
    'blocks',
    'validators',
    'consensus_rounds',
    'block_finality_records',
    // Enterprise Reward Distribution Engine
    'reward_epochs',
    'reward_epoch_metrics',
    'validator_reward_events',
    'reward_batches',
    'reward_gas_accumulators',
    'reward_wal',
  ];
  
  console.log('[Enterprise DB] Running ANALYZE on token distribution tables...');
  
  for (const table of tables) {
    try {
      await db.execute(sql.raw(`ANALYZE ${table}`));
      console.log(`[Enterprise DB] ANALYZE ${table} completed`);
    } catch (error) {
      // Table may not exist yet
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (!errorMsg.includes('does not exist')) {
        console.error(`[Enterprise DB] ANALYZE ${table} failed: ${errorMsg}`);
      }
    }
  }
  
  console.log('[Enterprise DB] Table analysis complete');
}

export default {
  applyEnterpriseIndexes,
  getIndexStatistics,
  analyzeTokenDistributionTables,
  ENTERPRISE_INDEXES,
};
