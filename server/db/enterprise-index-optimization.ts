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
