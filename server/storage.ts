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
  type AiUsageLog,
  type InsertAiUsageLog,
  type AiExecutionLog,
  type InsertAiExecutionLog,
  type GovernancePrevalidation,
  type InsertGovernancePrevalidation,
  type Shard,
  type InsertShard,
  type NetworkStats,
  type InsertNetworkStats,
  type ConsensusRound,
  type InsertConsensusRound,
  type ApiKey,
  type InsertApiKey,
  type ApiKeyLog,
  type InsertApiKeyLog,
  type CrossShardMessage,
  type InsertCrossShardMessage,
  type WalletBalance,
  type InsertWalletBalance,
  type Delegation,
  type InsertDelegation,
  type ValidatorVote,
  type InsertValidatorVote,
  type CommitteeSnapshot,
  type InsertCommitteeSnapshot,
  type Member,
  type InsertMember,
  type MemberProfile,
  type InsertMemberProfile,
  type MemberStakingPosition,
  type InsertMemberStakingPosition,
  type MemberGovernanceProfile,
  type InsertMemberGovernanceProfile,
  type MemberFinancialProfile,
  type InsertMemberFinancialProfile,
  type MemberSecurityProfile,
  type InsertMemberSecurityProfile,
  type MemberPerformanceMetrics,
  type InsertMemberPerformanceMetrics,
  type MemberSlashEvent,
  type InsertMemberSlashEvent,
  type MemberAuditLog,
  type InsertMemberAuditLog,
  type RestartSession,
  type InsertRestartSession,
  type StakingPool,
  type InsertStakingPool,
  type StakingPosition,
  type InsertStakingPosition,
  type StakingDelegation,
  type InsertStakingDelegation,
  type UnbondingRequest,
  type InsertUnbondingRequest,
  type RewardCycle,
  type InsertRewardCycle,
  type RewardEvent,
  type InsertRewardEvent,
  type SlashingEvent,
  type InsertSlashingEvent,
  type StakingStats,
  type InsertStakingStats,
  type StakingTierConfig,
  type InsertStakingTierConfig,
  type PoolValidatorAssignment,
  type InsertPoolValidatorAssignment,
  type StakingAuditLog,
  type InsertStakingAuditLog,
  type StakingSnapshot,
  type InsertStakingSnapshot,
  type StakingAiAssessment,
  type InsertStakingAiAssessment,
  type DexPool,
  type InsertDexPool,
  type DexPoolAsset,
  type InsertDexPoolAsset,
  type DexPoolTick,
  type InsertDexPoolTick,
  type DexPosition,
  type InsertDexPosition,
  type DexSwap,
  type InsertDexSwap,
  type DexPriceHistory,
  type InsertDexPriceHistory,
  type DexTwapOracle,
  type InsertDexTwapOracle,
  type DexCircuitBreaker,
  type InsertDexCircuitBreaker,
  type DexMevEvent,
  type InsertDexMevEvent,
  type DexLiquidityReward,
  type InsertDexLiquidityReward,
  type DexUserAnalytics,
  type InsertDexUserAnalytics,
  type LendingMarket,
  type InsertLendingMarket,
  type LendingPosition,
  type InsertLendingPosition,
  type LendingSupply,
  type InsertLendingSupply,
  type LendingBorrow,
  type InsertLendingBorrow,
  type LendingLiquidation,
  type InsertLendingLiquidation,
  type LendingRateHistory,
  type InsertLendingRateHistory,
  type LendingTransaction,
  type InsertLendingTransaction,
  type LendingProtocolStats,
  type InsertLendingProtocolStats,
  type YieldVault,
  type InsertYieldVault,
  type YieldStrategy,
  type InsertYieldStrategy,
  type YieldPosition,
  type InsertYieldPosition,
  type YieldHarvest,
  type InsertYieldHarvest,
  type YieldReward,
  type InsertYieldReward,
  type YieldTransaction,
  type InsertYieldTransaction,
  type YieldProtocolStats,
  type InsertYieldProtocolStats,
  // Liquid Staking Types
  type LiquidStakingPool,
  type InsertLiquidStakingPool,
  type ValidatorBasket,
  type InsertValidatorBasket,
  type LstPosition,
  type InsertLstPosition,
  type LstTransaction,
  type InsertLstTransaction,
  type RebaseHistory,
  type InsertRebaseHistory,
  type LstProtocolStats,
  type InsertLstProtocolStats,
  // NFT Marketplace Types
  type NftCollection,
  type InsertNftCollection,
  type NftItem,
  type InsertNftItem,
  type MarketplaceListing,
  type InsertMarketplaceListing,
  type MarketplaceBid,
  type InsertMarketplaceBid,
  type MarketplaceSale,
  type InsertMarketplaceSale,
  type NftOffer,
  type InsertNftOffer,
  type NftActivityLog,
  type InsertNftActivityLog,
  type NftMarketplaceStats,
  type InsertNftMarketplaceStats,
  // NFT Launchpad Types
  type LaunchpadProject,
  type InsertLaunchpadProject,
  type LaunchRound,
  type InsertLaunchRound,
  type WhitelistEntry,
  type InsertWhitelistEntry,
  type LaunchAllocation,
  type InsertLaunchAllocation,
  type VestingSchedule,
  type InsertVestingSchedule,
  type LaunchpadStats,
  type InsertLaunchpadStats,
  type LaunchpadActivity,
  type InsertLaunchpadActivity,
  blocks,
  transactions,
  accounts,
  validators,
  smartContracts,
  aiModels,
  aiDecisions,
  aiUsageLogs,
  aiExecutionLogs,
  governancePrevalidations,
  shards,
  networkStats as networkStatsTable,
  consensusRounds,
  apiKeys,
  apiKeyLogs,
  crossShardMessages,
  walletBalances,
  delegations,
  validatorVotes,
  committeeSnapshots,
  members,
  memberProfiles,
  memberStakingPositions,
  memberGovernanceProfiles,
  memberFinancialProfiles,
  memberSecurityProfiles,
  memberPerformanceMetrics,
  memberSlashEvents,
  memberAuditLogs,
  restartSessions,
  stakingPools,
  stakingPositions,
  stakingDelegations,
  unbondingRequests,
  rewardCycles,
  rewardEvents,
  slashingEvents,
  stakingStats as stakingStatsTable,
  stakingTierConfig,
  poolValidatorAssignments,
  stakingAuditLogs,
  stakingSnapshots,
  stakingAiAssessments,
  dexPools,
  dexPoolAssets,
  dexPoolTicks,
  dexPositions,
  dexSwaps,
  dexPriceHistory,
  dexTwapOracle,
  dexCircuitBreakers,
  dexMevEvents,
  dexLiquidityRewards,
  dexUserAnalytics,
  lendingMarkets,
  lendingPositions,
  lendingSupplies,
  lendingBorrows,
  lendingLiquidations,
  lendingRateHistory,
  lendingTransactions,
  lendingProtocolStats,
  yieldVaults,
  yieldStrategies,
  yieldPositions,
  yieldHarvests,
  yieldRewards,
  yieldTransactions,
  yieldProtocolStats,
  // Liquid Staking Tables
  liquidStakingPools,
  validatorBaskets,
  lstPositions,
  lstTransactions,
  rebaseHistory,
  lstProtocolStats,
  // NFT Marketplace Tables
  nftCollections,
  nftItems,
  marketplaceListings,
  marketplaceBids,
  marketplaceSales,
  nftOffers,
  nftActivityLog,
  nftMarketplaceStats,
  // NFT Launchpad Tables
  launchpadProjects,
  launchRounds,
  whitelistEntries,
  launchAllocations,
  vestingSchedules,
  launchpadStats,
  launchpadActivity,
  // GameFi Infrastructure Tables
  gamefiProjects,
  gameAssets,
  gameRewards,
  gameLeaderboards,
  gameTournaments,
  tournamentParticipants,
  achievementBadges,
  playerAchievements,
  gamefiActivity,
  gamefiStats,
  // Community Infrastructure Tables
  communityPosts,
  communityComments,
  communityEvents,
  communityAnnouncements,
  communityBadges,
  communityUserBadges,
  communityActivity,
  communityReputation,
  communityPostReactions,
  communityCommentReactions,
  communityEventRegistrations,
  // Community Types
  type CommunityPost,
  type InsertCommunityPost,
  type CommunityComment,
  type InsertCommunityComment,
  type CommunityEvent,
  type InsertCommunityEvent,
  type CommunityAnnouncement,
  type InsertCommunityAnnouncement,
  type CommunityBadge,
  type InsertCommunityBadge,
  type CommunityUserBadge,
  type InsertCommunityUserBadge,
  type CommunityActivityType,
  type InsertCommunityActivity,
  type CommunityReputationType,
  type InsertCommunityReputation,
  type CommunityPostReaction,
  type InsertCommunityPostReaction,
  type CommunityCommentReaction,
  type InsertCommunityCommentReaction,
  type CommunityEventRegistration,
  type InsertCommunityEventRegistration,
  type CommunityStats,
  // Bridge Infrastructure Types
  type BridgeTransfer,
  type InsertBridgeTransfer,
  bridgeTransfers,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc, isNull, and, sql } from "drizzle-orm";

export interface IStorage {
  // Network Stats
  getNetworkStats(): Promise<NetworkStats>;
  updateNetworkStats(stats: Partial<InsertNetworkStats>): Promise<NetworkStats>;

  // Blocks
  getAllBlocks(): Promise<Block[]>;
  getRecentBlocks(limit?: number): Promise<Block[]>;
  getBlockByNumber(blockNumber: number): Promise<Block | undefined>;
  searchBlocksByHashPrefix(hashPrefix: string, limit?: number): Promise<Block[]>;
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
  getValidatorById(id: string): Promise<Validator | undefined>;
  createValidator(validator: InsertValidator): Promise<Validator>;
  updateValidator(address: string, data: Partial<Validator>): Promise<Validator>;
  getValidatorDetails(address: string): Promise<any>;
  delegateToValidator(address: string, amount: string, delegatorAddress: string): Promise<void>;
  undelegateFromValidator(address: string, amount: string, delegatorAddress: string): Promise<void>;
  claimRewards(address: string): Promise<{ amount: string }>;
  activateValidator(address: string): Promise<void>;
  deactivateValidator(address: string): Promise<void>;
  updateValidatorCommission(address: string, commission: number): Promise<void>;

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

  // AI Usage Logs (Real AI tracking)
  createAiUsageLog(data: InsertAiUsageLog): Promise<AiUsageLog>;
  getAiUsageLogs(limit?: number): Promise<AiUsageLog[]>;

  // AI Model Stats (Real AI statistics update)
  updateAiModelStats(name: string, stats: {
    requestCount?: number;
    successCount?: number;
    failureCount?: number;
    avgResponseTime?: number;
    totalCost?: string;
    tokensUsed?: number;
    band?: string;
  }): Promise<void>;

  // AI Execution Logs (Blockchain control tracking)
  createAiExecutionLog(data: InsertAiExecutionLog): Promise<AiExecutionLog>;
  getAiExecutionLog(id: string): Promise<AiExecutionLog | undefined>;
  updateAiExecutionLog(id: string, data: Partial<AiExecutionLog>): Promise<void>;
  getRecentAiExecutionLogs(limit?: number): Promise<AiExecutionLog[]>;

  // Governance Pre-validations
  createGovernancePrevalidation(data: InsertGovernancePrevalidation): Promise<GovernancePrevalidation>;
  getGovernancePrevalidation(id: string): Promise<GovernancePrevalidation | undefined>;
  getRecentGovernancePrevalidations(limit?: number): Promise<GovernancePrevalidation[]>;

  // Shards
  getAllShards(): Promise<Shard[]>;
  getShardById(shardId: number): Promise<Shard | undefined>;
  updateShard(shardId: number, data: Partial<Shard>): Promise<Shard>;

  // Analytics
  getLatencyDistribution(): Promise<import("@shared/schema").LatencyBucket[]>;
  getTPSHistory(minutes?: number): Promise<import("@shared/schema").TPSHistoryPoint[]>;
  getConsensusState(): Promise<import("@shared/schema").ConsensusState>;
  
  // Consensus Rounds (required for analytics)
  createConsensusRound(data: InsertConsensusRound): Promise<ConsensusRound>;
  getLatestConsensusRound(): Promise<ConsensusRound | null>;
  updateConsensusRound(blockHeight: number, data: Partial<ConsensusRound>): Promise<void>;

  // API Keys (Enterprise Grade)
  getAllApiKeys(): Promise<ApiKey[]>;
  getApiKeyById(id: string): Promise<ApiKey | undefined>;
  getApiKeyByHash(hashedKey: string): Promise<ApiKey | undefined>;
  createApiKey(data: InsertApiKey): Promise<ApiKey>;
  updateApiKey(id: string, data: Partial<ApiKey>): Promise<ApiKey | undefined>;
  revokeApiKey(id: string, revokedBy?: string, reason?: string): Promise<void>;
  updateApiKeyLastUsed(id: string): Promise<void>;
  incrementApiKeyUsage(id: string): Promise<void>;
  resetDailyApiKeyUsage(): Promise<void>;
  resetMonthlyApiKeyUsage(): Promise<void>;
  getApiKeyStats(id: string): Promise<{ totalRequests: number; requestsToday: number; requestsThisMonth: number; errorCount: number } | undefined>;
  
  // API Key Activity Logs
  createApiKeyLog(data: InsertApiKeyLog): Promise<ApiKeyLog>;
  getApiKeyLogs(apiKeyId: string, limit?: number): Promise<ApiKeyLog[]>;
  getRecentApiKeyLogs(limit?: number): Promise<ApiKeyLog[]>;

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

  // Member Management System
  // Members
  getAllMembers(limit?: number): Promise<Member[]>;
  getMemberById(id: string): Promise<Member | undefined>;
  getMemberByAddress(address: string): Promise<Member | undefined>;
  getMemberByEmail(email: string): Promise<Member | undefined>;
  createMember(data: InsertMember): Promise<Member>;
  updateMember(id: string, data: Partial<Member>): Promise<void>;
  deleteMember(id: string): Promise<void>;
  
  // Member Profiles
  getMemberProfileByMemberId(memberId: string): Promise<MemberProfile | undefined>;
  createMemberProfile(data: InsertMemberProfile): Promise<MemberProfile>;
  updateMemberProfile(memberId: string, data: Partial<MemberProfile>): Promise<void>;
  
  // Member Staking Positions
  getMemberStakingPositions(memberId: string): Promise<MemberStakingPosition[]>;
  createMemberStakingPosition(data: InsertMemberStakingPosition): Promise<MemberStakingPosition>;
  updateMemberStakingPosition(id: string, data: Partial<MemberStakingPosition>): Promise<void>;
  
  // Member Governance Profiles
  getMemberGovernanceProfile(memberId: string): Promise<MemberGovernanceProfile | undefined>;
  createMemberGovernanceProfile(data: InsertMemberGovernanceProfile): Promise<MemberGovernanceProfile>;
  updateMemberGovernanceProfile(memberId: string, data: Partial<MemberGovernanceProfile>): Promise<void>;
  
  // Member Financial Profiles
  getMemberFinancialProfile(memberId: string): Promise<MemberFinancialProfile | undefined>;
  createMemberFinancialProfile(data: InsertMemberFinancialProfile): Promise<MemberFinancialProfile>;
  updateMemberFinancialProfile(memberId: string, data: Partial<MemberFinancialProfile>): Promise<void>;
  
  // Member Security Profiles
  getMemberSecurityProfile(memberId: string): Promise<MemberSecurityProfile | undefined>;
  createMemberSecurityProfile(data: InsertMemberSecurityProfile): Promise<MemberSecurityProfile>;
  updateMemberSecurityProfile(memberId: string, data: Partial<MemberSecurityProfile>): Promise<void>;
  
  // Member Performance Metrics
  getMemberPerformanceMetrics(memberId: string): Promise<MemberPerformanceMetrics | undefined>;
  createMemberPerformanceMetrics(data: InsertMemberPerformanceMetrics): Promise<MemberPerformanceMetrics>;
  updateMemberPerformanceMetrics(memberId: string, data: Partial<MemberPerformanceMetrics>): Promise<void>;
  
  // Member Slash Events
  getMemberSlashEvents(memberId: string): Promise<MemberSlashEvent[]>;
  createMemberSlashEvent(data: InsertMemberSlashEvent): Promise<MemberSlashEvent>;
  
  // Member Audit Logs
  getMemberAuditLogs(memberId: string, limit?: number): Promise<MemberAuditLog[]>;
  createMemberAuditLog(data: InsertMemberAuditLog): Promise<MemberAuditLog>;
  
  // Member Analytics
  getMemberStatistics(): Promise<{
    totalMembers: number;
    activeMembers: number;
    totalValidators: number;
    totalStakers: number;
    kycVerified: number;
  }>;
  
  // Restart Sessions
  getRestartSession(): Promise<RestartSession | undefined>;
  createOrUpdateRestartSession(data: InsertRestartSession): Promise<RestartSession>;
  clearRestartSession(): Promise<void>;

  // ============================================
  // STAKING INFRASTRUCTURE
  // ============================================
  
  // Staking Pools
  getAllStakingPools(): Promise<StakingPool[]>;
  getStakingPoolById(id: string): Promise<StakingPool | undefined>;
  getStakingPoolsByType(poolType: string): Promise<StakingPool[]>;
  createStakingPool(data: InsertStakingPool): Promise<StakingPool>;
  updateStakingPool(id: string, data: Partial<StakingPool>): Promise<void>;
  
  // Staking Positions
  getAllStakingPositions(limit?: number): Promise<StakingPosition[]>;
  getStakingPositionById(id: string): Promise<StakingPosition | undefined>;
  getStakingPositionsByAddress(address: string): Promise<StakingPosition[]>;
  getStakingPositionsByPool(poolId: string): Promise<StakingPosition[]>;
  createStakingPosition(data: InsertStakingPosition): Promise<StakingPosition>;
  updateStakingPosition(id: string, data: Partial<StakingPosition>): Promise<void>;
  
  // Staking Delegations
  getAllStakingDelegations(limit?: number): Promise<StakingDelegation[]>;
  getStakingDelegationById(id: string): Promise<StakingDelegation | undefined>;
  getStakingDelegationsByAddress(address: string): Promise<StakingDelegation[]>;
  getStakingDelegationsByValidator(validatorId: string): Promise<StakingDelegation[]>;
  createStakingDelegation(data: InsertStakingDelegation): Promise<StakingDelegation>;
  updateStakingDelegation(id: string, data: Partial<StakingDelegation>): Promise<void>;
  
  // Unbonding Requests
  getAllUnbondingRequests(limit?: number): Promise<UnbondingRequest[]>;
  getUnbondingRequestById(id: string): Promise<UnbondingRequest | undefined>;
  getUnbondingRequestsByAddress(address: string): Promise<UnbondingRequest[]>;
  createUnbondingRequest(data: InsertUnbondingRequest): Promise<UnbondingRequest>;
  updateUnbondingRequest(id: string, data: Partial<UnbondingRequest>): Promise<void>;
  
  // Reward Cycles
  getAllRewardCycles(limit?: number): Promise<RewardCycle[]>;
  getCurrentRewardCycle(): Promise<RewardCycle | undefined>;
  getRewardCycleById(id: string): Promise<RewardCycle | undefined>;
  createRewardCycle(data: InsertRewardCycle): Promise<RewardCycle>;
  updateRewardCycle(id: string, data: Partial<RewardCycle>): Promise<void>;
  
  // Reward Events
  getRewardEventsByAddress(address: string, limit?: number): Promise<RewardEvent[]>;
  getRewardEventsByCycle(cycleId: string): Promise<RewardEvent[]>;
  createRewardEvent(data: InsertRewardEvent): Promise<RewardEvent>;
  updateRewardEvent(id: string, data: Partial<RewardEvent>): Promise<void>;
  
  // Slashing Events
  getAllSlashingEvents(limit?: number): Promise<SlashingEvent[]>;
  getSlashingEventsByValidator(validatorId: string): Promise<SlashingEvent[]>;
  createSlashingEvent(data: InsertSlashingEvent): Promise<SlashingEvent>;
  
  // Staking Stats
  getStakingStats(): Promise<StakingStats | undefined>;
  updateStakingStats(data: Partial<StakingStats>): Promise<void>;
  
  // ============================================
  // ENTERPRISE STAKING v2.0
  // ============================================
  
  // Tier Configuration
  getAllStakingTierConfigs(): Promise<StakingTierConfig[]>;
  getStakingTierConfig(tier: string): Promise<StakingTierConfig | undefined>;
  updateStakingTierConfig(id: string, data: Partial<StakingTierConfig>): Promise<void>;
  
  // Pool Validator Assignments
  getPoolValidatorAssignments(poolId: string): Promise<PoolValidatorAssignment[]>;
  getValidatorPoolAssignments(validatorId: string): Promise<PoolValidatorAssignment[]>;
  createPoolValidatorAssignment(data: InsertPoolValidatorAssignment): Promise<PoolValidatorAssignment>;
  updatePoolValidatorAssignment(id: string, data: Partial<PoolValidatorAssignment>): Promise<void>;
  
  // Audit Logs
  getStakingAuditLogs(filters: { targetType?: string; targetId?: string; action?: string; limit?: number }): Promise<StakingAuditLog[]>;
  createStakingAuditLog(data: InsertStakingAuditLog): Promise<StakingAuditLog>;
  
  // Snapshots
  getStakingSnapshots(type?: string, limit?: number): Promise<StakingSnapshot[]>;
  createStakingSnapshot(data: InsertStakingSnapshot): Promise<StakingSnapshot>;
  
  // AI Risk Assessments
  getActiveStakingAiAssessments(targetType: string, targetId: string): Promise<StakingAiAssessment[]>;
  createStakingAiAssessment(data: InsertStakingAiAssessment): Promise<StakingAiAssessment>;
  deactivateStakingAiAssessments(targetType: string, targetId: string): Promise<void>;
  
  // Validator Integration
  getValidatorWithStakingMetrics(validatorId: string): Promise<Validator & { stakingMetrics: any } | undefined>;
  getTopValidatorsForStaking(limit?: number): Promise<Validator[]>;

  // ============================================
  // DEX/AMM INFRASTRUCTURE v1.0
  // ============================================
  
  // DEX Pools
  getAllDexPools(limit?: number): Promise<DexPool[]>;
  getDexPoolById(id: string): Promise<DexPool | undefined>;
  getDexPoolByAddress(contractAddress: string): Promise<DexPool | undefined>;
  getDexPoolsByType(poolType: string): Promise<DexPool[]>;
  getDexPoolsByStatus(status: string): Promise<DexPool[]>;
  createDexPool(data: InsertDexPool): Promise<DexPool>;
  updateDexPool(id: string, data: Partial<DexPool>): Promise<void>;
  getTopDexPoolsByTvl(limit?: number): Promise<DexPool[]>;
  getTopDexPoolsByVolume(limit?: number): Promise<DexPool[]>;
  
  // DEX Pool Assets (for multi-asset pools)
  getDexPoolAssets(poolId: string): Promise<DexPoolAsset[]>;
  createDexPoolAsset(data: InsertDexPoolAsset): Promise<DexPoolAsset>;
  updateDexPoolAsset(id: string, data: Partial<DexPoolAsset>): Promise<void>;
  
  // DEX Pool Ticks (for concentrated liquidity)
  getDexPoolTicks(poolId: string): Promise<DexPoolTick[]>;
  getDexPoolTickByIndex(poolId: string, tickIndex: number): Promise<DexPoolTick | undefined>;
  createDexPoolTick(data: InsertDexPoolTick): Promise<DexPoolTick>;
  updateDexPoolTick(id: string, data: Partial<DexPoolTick>): Promise<void>;
  
  // DEX Positions
  getAllDexPositions(limit?: number): Promise<DexPosition[]>;
  getDexPositionById(id: string): Promise<DexPosition | undefined>;
  getDexPositionsByOwner(ownerAddress: string): Promise<DexPosition[]>;
  getDexPositionsByPool(poolId: string): Promise<DexPosition[]>;
  getActiveDexPositions(ownerAddress: string): Promise<DexPosition[]>;
  createDexPosition(data: InsertDexPosition): Promise<DexPosition>;
  updateDexPosition(id: string, data: Partial<DexPosition>): Promise<void>;
  closeDexPosition(id: string): Promise<void>;
  
  // DEX Swaps
  getAllDexSwaps(limit?: number): Promise<DexSwap[]>;
  getDexSwapById(id: string): Promise<DexSwap | undefined>;
  getDexSwapByTxHash(txHash: string): Promise<DexSwap | undefined>;
  getDexSwapsByPool(poolId: string, limit?: number): Promise<DexSwap[]>;
  getDexSwapsByTrader(traderAddress: string, limit?: number): Promise<DexSwap[]>;
  getRecentDexSwaps(limit?: number): Promise<DexSwap[]>;
  createDexSwap(data: InsertDexSwap): Promise<DexSwap>;
  updateDexSwap(id: string, data: Partial<DexSwap>): Promise<void>;
  
  // DEX Price History
  getDexPriceHistory(poolId: string, interval: string, limit?: number): Promise<DexPriceHistory[]>;
  getLatestDexPrice(poolId: string): Promise<DexPriceHistory | undefined>;
  createDexPriceHistory(data: InsertDexPriceHistory): Promise<DexPriceHistory>;
  
  // DEX TWAP Oracle
  getDexTwapObservations(poolId: string, limit?: number): Promise<DexTwapOracle[]>;
  getLatestDexTwapObservation(poolId: string): Promise<DexTwapOracle | undefined>;
  createDexTwapObservation(data: InsertDexTwapOracle): Promise<DexTwapOracle>;
  
  // DEX Circuit Breakers
  getDexCircuitBreaker(poolId: string): Promise<DexCircuitBreaker | undefined>;
  getAllDexCircuitBreakers(): Promise<DexCircuitBreaker[]>;
  getTriggeredDexCircuitBreakers(): Promise<DexCircuitBreaker[]>;
  createDexCircuitBreaker(data: InsertDexCircuitBreaker): Promise<DexCircuitBreaker>;
  updateDexCircuitBreaker(poolId: string, data: Partial<DexCircuitBreaker>): Promise<void>;
  
  // DEX MEV Events
  getAllDexMevEvents(limit?: number): Promise<DexMevEvent[]>;
  getDexMevEventsByPool(poolId: string, limit?: number): Promise<DexMevEvent[]>;
  getRecentDexMevEvents(limit?: number): Promise<DexMevEvent[]>;
  createDexMevEvent(data: InsertDexMevEvent): Promise<DexMevEvent>;
  updateDexMevEvent(id: string, data: Partial<DexMevEvent>): Promise<void>;
  
  // DEX Liquidity Rewards
  getDexLiquidityRewards(poolId: string): Promise<DexLiquidityReward[]>;
  getActiveDexLiquidityRewards(poolId: string): Promise<DexLiquidityReward[]>;
  createDexLiquidityReward(data: InsertDexLiquidityReward): Promise<DexLiquidityReward>;
  updateDexLiquidityReward(id: string, data: Partial<DexLiquidityReward>): Promise<void>;
  
  // DEX User Analytics
  getDexUserAnalytics(userAddress: string): Promise<DexUserAnalytics | undefined>;
  getTopDexTraders(limit?: number): Promise<DexUserAnalytics[]>;
  getTopDexLiquidityProviders(limit?: number): Promise<DexUserAnalytics[]>;
  createDexUserAnalytics(data: InsertDexUserAnalytics): Promise<DexUserAnalytics>;
  updateDexUserAnalytics(userAddress: string, data: Partial<DexUserAnalytics>): Promise<void>;
  
  // DEX Aggregated Stats
  getDexStats(): Promise<{
    totalPools: number;
    totalTvlUsd: string;
    totalVolume24h: string;
    totalFees24h: string;
    totalSwaps24h: number;
    totalLiquidityProviders: number;
  }>;

  // ============================================
  // LENDING/BORROWING INFRASTRUCTURE v1.0
  // ============================================
  
  // Lending Markets
  getAllLendingMarkets(): Promise<LendingMarket[]>;
  getActiveLendingMarkets(): Promise<LendingMarket[]>;
  getLendingMarketById(id: string): Promise<LendingMarket | undefined>;
  getLendingMarketByAsset(assetAddress: string): Promise<LendingMarket | undefined>;
  createLendingMarket(data: InsertLendingMarket): Promise<LendingMarket>;
  updateLendingMarket(id: string, data: Partial<LendingMarket>): Promise<void>;
  
  // Lending Positions
  getAllLendingPositions(): Promise<LendingPosition[]>;
  getLendingPositionByUser(userAddress: string): Promise<LendingPosition | undefined>;
  getLendingPositionById(id: string): Promise<LendingPosition | undefined>;
  getLiquidatablePositions(): Promise<LendingPosition[]>;
  getAtRiskPositions(): Promise<LendingPosition[]>;
  createLendingPosition(data: InsertLendingPosition): Promise<LendingPosition>;
  updateLendingPosition(userAddress: string, data: Partial<LendingPosition>): Promise<void>;
  
  // Lending Supplies
  getLendingSuppliesByUser(userAddress: string): Promise<LendingSupply[]>;
  getLendingSuppliesByMarket(marketId: string): Promise<LendingSupply[]>;
  getLendingSupply(userAddress: string, marketId: string): Promise<LendingSupply | undefined>;
  createLendingSupply(data: InsertLendingSupply): Promise<LendingSupply>;
  updateLendingSupply(id: string, data: Partial<LendingSupply>): Promise<void>;
  deleteLendingSupply(id: string): Promise<void>;
  
  // Lending Borrows
  getLendingBorrowsByUser(userAddress: string): Promise<LendingBorrow[]>;
  getLendingBorrowsByMarket(marketId: string): Promise<LendingBorrow[]>;
  getLendingBorrow(userAddress: string, marketId: string): Promise<LendingBorrow | undefined>;
  createLendingBorrow(data: InsertLendingBorrow): Promise<LendingBorrow>;
  updateLendingBorrow(id: string, data: Partial<LendingBorrow>): Promise<void>;
  deleteLendingBorrow(id: string): Promise<void>;
  
  // Lending Liquidations
  getAllLendingLiquidations(limit?: number): Promise<LendingLiquidation[]>;
  getLendingLiquidationsByBorrower(borrowerAddress: string): Promise<LendingLiquidation[]>;
  getLendingLiquidationsByLiquidator(liquidatorAddress: string): Promise<LendingLiquidation[]>;
  getRecentLendingLiquidations(limit?: number): Promise<LendingLiquidation[]>;
  createLendingLiquidation(data: InsertLendingLiquidation): Promise<LendingLiquidation>;
  
  // Lending Rate History
  getLendingRateHistory(marketId: string, limit?: number): Promise<LendingRateHistory[]>;
  createLendingRateHistory(data: InsertLendingRateHistory): Promise<LendingRateHistory>;
  
  // Lending Transactions
  getAllLendingTransactions(limit?: number): Promise<LendingTransaction[]>;
  getLendingTransactionsByUser(userAddress: string, limit?: number): Promise<LendingTransaction[]>;
  getLendingTransactionsByMarket(marketId: string, limit?: number): Promise<LendingTransaction[]>;
  getRecentLendingTransactions(limit?: number): Promise<LendingTransaction[]>;
  createLendingTransaction(data: InsertLendingTransaction): Promise<LendingTransaction>;
  
  // Lending Protocol Stats
  getLendingProtocolStats(): Promise<LendingProtocolStats | undefined>;
  createLendingProtocolStats(data: InsertLendingProtocolStats): Promise<LendingProtocolStats>;
  updateLendingProtocolStats(id: string, data: Partial<LendingProtocolStats>): Promise<void>;
  
  // Lending Risk Methods
  getAtRiskLendingPositions(healthThreshold: number): Promise<LendingPosition[]>;
  getLiquidatableLendingPositions(healthThreshold: number): Promise<LendingPosition[]>;
  
  // Lending Aggregated Stats
  getLendingStats(): Promise<{
    totalValueLockedUsd: string;
    totalBorrowedUsd: string;
    totalMarkets: number;
    activeMarkets: number;
    totalUsers: number;
    avgSupplyRate: number;
    avgBorrowRate: number;
    avgUtilization: number;
    liquidations24h: number;
    atRiskPositions: number;
    liquidatablePositions: number;
  }>;

  // ============================================
  // YIELD FARMING STORAGE (Phase 3)
  // ============================================
  
  // Yield Vaults
  getAllYieldVaults(): Promise<YieldVault[]>;
  getActiveYieldVaults(): Promise<YieldVault[]>;
  getYieldVaultById(id: string): Promise<YieldVault | undefined>;
  getYieldVaultByAddress(contractAddress: string): Promise<YieldVault | undefined>;
  getYieldVaultsByType(vaultType: string): Promise<YieldVault[]>;
  createYieldVault(data: InsertYieldVault): Promise<YieldVault>;
  updateYieldVault(id: string, data: Partial<YieldVault>): Promise<void>;
  
  // Yield Strategies
  getYieldStrategiesByVault(vaultId: string): Promise<YieldStrategy[]>;
  getActiveYieldStrategies(): Promise<YieldStrategy[]>;
  getYieldStrategyById(id: string): Promise<YieldStrategy | undefined>;
  createYieldStrategy(data: InsertYieldStrategy): Promise<YieldStrategy>;
  updateYieldStrategy(id: string, data: Partial<YieldStrategy>): Promise<void>;
  
  // Yield Positions
  getAllYieldPositions(): Promise<YieldPosition[]>;
  getYieldPositionsByUser(userAddress: string): Promise<YieldPosition[]>;
  getYieldPositionsByVault(vaultId: string): Promise<YieldPosition[]>;
  getYieldPosition(userAddress: string, vaultId: string): Promise<YieldPosition | undefined>;
  getYieldPositionById(id: string): Promise<YieldPosition | undefined>;
  createYieldPosition(data: InsertYieldPosition): Promise<YieldPosition>;
  updateYieldPosition(id: string, data: Partial<YieldPosition>): Promise<void>;
  deleteYieldPosition(id: string): Promise<void>;
  
  // Yield Harvests
  getYieldHarvestsByVault(vaultId: string, limit?: number): Promise<YieldHarvest[]>;
  getRecentYieldHarvests(limit?: number): Promise<YieldHarvest[]>;
  createYieldHarvest(data: InsertYieldHarvest): Promise<YieldHarvest>;
  
  // Yield Rewards
  getYieldRewardsByVault(vaultId: string): Promise<YieldReward[]>;
  getActiveYieldRewards(): Promise<YieldReward[]>;
  createYieldReward(data: InsertYieldReward): Promise<YieldReward>;
  updateYieldReward(id: string, data: Partial<YieldReward>): Promise<void>;
  
  // Yield Transactions
  getAllYieldTransactions(limit?: number): Promise<YieldTransaction[]>;
  getYieldTransactionsByUser(userAddress: string, limit?: number): Promise<YieldTransaction[]>;
  getYieldTransactionsByVault(vaultId: string, limit?: number): Promise<YieldTransaction[]>;
  getRecentYieldTransactions(limit?: number): Promise<YieldTransaction[]>;
  createYieldTransaction(data: InsertYieldTransaction): Promise<YieldTransaction>;
  
  // Yield Protocol Stats
  getYieldProtocolStats(): Promise<YieldProtocolStats | undefined>;
  createYieldProtocolStats(data: InsertYieldProtocolStats): Promise<YieldProtocolStats>;
  updateYieldProtocolStats(id: string, data: Partial<YieldProtocolStats>): Promise<void>;
  
  // Yield Aggregated Stats
  getYieldFarmingStats(): Promise<{
    totalTvlUsd: string;
    totalVaults: number;
    activeVaults: number;
    totalUsers: number;
    avgVaultApy: number;
    topVaultApy: number;
    totalProfitGenerated: string;
    deposits24h: string;
    withdrawals24h: string;
  }>;

  // ============================================
  // LIQUID STAKING INTERFACE (Phase 4)
  // ============================================

  // Liquid Staking Pools
  getAllLiquidStakingPools(): Promise<LiquidStakingPool[]>;
  getActiveLiquidStakingPools(): Promise<LiquidStakingPool[]>;
  getLiquidStakingPoolById(id: string): Promise<LiquidStakingPool | undefined>;
  getLiquidStakingPoolByAddress(contractAddress: string): Promise<LiquidStakingPool | undefined>;
  createLiquidStakingPool(data: InsertLiquidStakingPool): Promise<LiquidStakingPool>;
  updateLiquidStakingPool(id: string, data: Partial<LiquidStakingPool>): Promise<void>;

  // Validator Baskets
  getValidatorBasketsByPool(poolId: string): Promise<ValidatorBasket[]>;
  getActiveValidatorBaskets(): Promise<ValidatorBasket[]>;
  getValidatorBasketById(id: string): Promise<ValidatorBasket | undefined>;
  createValidatorBasket(data: InsertValidatorBasket): Promise<ValidatorBasket>;
  updateValidatorBasket(id: string, data: Partial<ValidatorBasket>): Promise<void>;

  // LST Positions
  getAllLstPositions(): Promise<LstPosition[]>;
  getLstPositionsByUser(userAddress: string): Promise<LstPosition[]>;
  getLstPositionsByPool(poolId: string): Promise<LstPosition[]>;
  getLstPosition(userAddress: string, poolId: string): Promise<LstPosition | undefined>;
  getLstPositionById(id: string): Promise<LstPosition | undefined>;
  createLstPosition(data: InsertLstPosition): Promise<LstPosition>;
  updateLstPosition(id: string, data: Partial<LstPosition>): Promise<void>;

  // LST Transactions
  getAllLstTransactions(limit?: number): Promise<LstTransaction[]>;
  getLstTransactionsByUser(userAddress: string, limit?: number): Promise<LstTransaction[]>;
  getLstTransactionsByPool(poolId: string, limit?: number): Promise<LstTransaction[]>;
  getRecentLstTransactions(limit?: number): Promise<LstTransaction[]>;
  createLstTransaction(data: InsertLstTransaction): Promise<LstTransaction>;

  // Rebase History
  getRebaseHistoryByPool(poolId: string, limit?: number): Promise<RebaseHistory[]>;
  getRecentRebaseHistory(limit?: number): Promise<RebaseHistory[]>;
  createRebaseHistory(data: InsertRebaseHistory): Promise<RebaseHistory>;

  // LST Protocol Stats
  getLstProtocolStats(): Promise<LstProtocolStats | undefined>;
  createLstProtocolStats(data: InsertLstProtocolStats): Promise<LstProtocolStats>;
  updateLstProtocolStats(id: string, data: Partial<LstProtocolStats>): Promise<void>;

  // LST Aggregated Stats
  getLiquidStakingStats(): Promise<{
    totalStakedUsd: string;
    totalPools: number;
    activePools: number;
    totalStakers: number;
    avgPoolApy: number;
    topPoolApy: number;
    totalLstMinted: string;
    mints24h: string;
    redeems24h: string;
  }>;

  // ============================================
  // COMMUNITY SYSTEM INFRASTRUCTURE
  // Enterprise-Grade Community Platform
  // ============================================

  // Community Posts
  getAllCommunityPosts(limit?: number, offset?: number, category?: string): Promise<CommunityPost[]>;
  getCommunityPostById(id: string): Promise<CommunityPost | undefined>;
  getCommunityPostsByAuthor(authorId: number): Promise<CommunityPost[]>;
  createCommunityPost(data: InsertCommunityPost): Promise<CommunityPost>;
  updateCommunityPost(id: string, data: Partial<CommunityPost>): Promise<void>;
  deleteCommunityPost(id: string): Promise<void>;
  incrementPostViews(id: string): Promise<void>;
  incrementPostLikes(id: string): Promise<void>;
  decrementPostLikes(id: string): Promise<void>;
  incrementPostCommentCount(id: string): Promise<void>;
  decrementPostCommentCount(id: string): Promise<void>;

  // Community Comments
  getCommentsByPostId(postId: string, limit?: number): Promise<CommunityComment[]>;
  getCommentById(id: string): Promise<CommunityComment | undefined>;
  getCommentReplies(parentCommentId: string): Promise<CommunityComment[]>;
  createCommunityComment(data: InsertCommunityComment): Promise<CommunityComment>;
  updateCommunityComment(id: string, data: Partial<CommunityComment>): Promise<void>;
  deleteCommunityComment(id: string): Promise<void>;
  incrementCommentLikes(id: string): Promise<void>;
  decrementCommentLikes(id: string): Promise<void>;

  // Community Post Reactions
  getPostReactionByUser(postId: string, userId: number): Promise<CommunityPostReaction | undefined>;
  getPostReactions(postId: string): Promise<CommunityPostReaction[]>;
  createPostReaction(data: InsertCommunityPostReaction): Promise<CommunityPostReaction>;
  deletePostReaction(postId: string, userId: number): Promise<void>;
  getPostReactionCounts(postId: string): Promise<{ likes: number; dislikes: number }>;

  // Community Comment Reactions
  getCommentReactionByUser(commentId: string, userId: number): Promise<CommunityCommentReaction | undefined>;
  createCommentReaction(data: InsertCommunityCommentReaction): Promise<CommunityCommentReaction>;
  deleteCommentReaction(commentId: string, userId: number): Promise<void>;

  // Community Events
  getAllCommunityEvents(limit?: number): Promise<CommunityEvent[]>;
  getCommunityEventById(id: string): Promise<CommunityEvent | undefined>;
  getCommunityEventsByStatus(status: string): Promise<CommunityEvent[]>;
  createCommunityEvent(data: InsertCommunityEvent): Promise<CommunityEvent>;
  updateCommunityEvent(id: string, data: Partial<CommunityEvent>): Promise<void>;
  deleteCommunityEvent(id: string): Promise<void>;
  incrementEventParticipants(id: string): Promise<void>;
  decrementEventParticipants(id: string): Promise<void>;

  // Community Event Registrations
  getEventRegistrationsByEvent(eventId: string): Promise<CommunityEventRegistration[]>;
  getEventRegistrationsByUser(userId: number): Promise<CommunityEventRegistration[]>;
  getEventRegistration(eventId: string, userId: number): Promise<CommunityEventRegistration | undefined>;
  createEventRegistration(data: InsertCommunityEventRegistration): Promise<CommunityEventRegistration>;
  updateEventRegistration(id: string, data: Partial<CommunityEventRegistration>): Promise<void>;
  deleteEventRegistration(eventId: string, userId: number): Promise<void>;

  // Community Announcements
  getAllCommunityAnnouncements(limit?: number): Promise<CommunityAnnouncement[]>;
  getCommunityAnnouncementById(id: string): Promise<CommunityAnnouncement | undefined>;
  createCommunityAnnouncement(data: InsertCommunityAnnouncement): Promise<CommunityAnnouncement>;
  updateCommunityAnnouncement(id: string, data: Partial<CommunityAnnouncement>): Promise<void>;
  deleteCommunityAnnouncement(id: string): Promise<void>;

  // Community Badges
  getAllCommunityBadges(): Promise<CommunityBadge[]>;
  getCommunityBadgeById(id: string): Promise<CommunityBadge | undefined>;
  getCommunityBadgesByRarity(rarity: string): Promise<CommunityBadge[]>;
  createCommunityBadge(data: InsertCommunityBadge): Promise<CommunityBadge>;
  updateCommunityBadge(id: string, data: Partial<CommunityBadge>): Promise<void>;

  // Community User Badges
  getUserBadges(userId: number): Promise<CommunityUserBadge[]>;
  getUserBadge(userId: number, badgeId: string): Promise<CommunityUserBadge | undefined>;
  createUserBadge(data: InsertCommunityUserBadge): Promise<CommunityUserBadge>;
  updateUserBadge(id: string, data: Partial<CommunityUserBadge>): Promise<void>;
  awardBadgeToUser(userId: number, badgeId: string): Promise<CommunityUserBadge>;

  // Community Activity
  getRecentCommunityActivity(limit?: number): Promise<CommunityActivityType[]>;
  getCommunityActivityByUser(userId: number, limit?: number): Promise<CommunityActivityType[]>;
  createCommunityActivity(data: InsertCommunityActivity): Promise<CommunityActivityType>;

  // Community Reputation
  getUserReputation(userId: number): Promise<CommunityReputationType | undefined>;
  createUserReputation(data: InsertCommunityReputation): Promise<CommunityReputationType>;
  updateUserReputation(userId: number, data: Partial<CommunityReputationType>): Promise<void>;
  incrementUserReputation(userId: number, points: number): Promise<void>;
  getLeaderboard(limit?: number): Promise<CommunityReputationType[]>;

  // Community Stats
  getCommunityStats(): Promise<CommunityStats>;

  // ============================================
  // BRIDGE TRANSFERS (Cross-Chain)
  // ============================================
  getAllBridgeTransfers(limit?: number): Promise<BridgeTransfer[]>;
  getBridgeTransferById(id: string): Promise<BridgeTransfer | undefined>;
  getBridgeTransfersBySender(senderAddress: string, limit?: number): Promise<BridgeTransfer[]>;
  getBridgeTransfersByStatus(status: string, limit?: number): Promise<BridgeTransfer[]>;
  getRecentBridgeTransfers(limit?: number): Promise<BridgeTransfer[]>;
  getPendingBridgeTransfers(): Promise<BridgeTransfer[]>;
  createBridgeTransfer(data: InsertBridgeTransfer): Promise<BridgeTransfer>;
  updateBridgeTransfer(id: string, data: Partial<BridgeTransfer>): Promise<void>;
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
  private restartSession: RestartSession | undefined;

  // Memory management limits - ENTERPRISE PRODUCTION CONFIGURATION
  // Optimized for 100ms block time (10 blocks/second) with 50,000+ TPS capability
  // Enterprise-grade memory allocation for high-performance blockchain operations
  private readonly MAX_BLOCKS = 1000; // 10x increase for production workloads
  private readonly MAX_TRANSACTIONS = 5000; // 10x increase for 50K+ TPS support
  private readonly MAX_AI_DECISIONS = 500; // 5x increase for AI orchestration
  private readonly MAX_CONSENSUS_ROUNDS = 500; // 5x increase for consensus tracking
  private readonly MAX_CROSS_SHARD_MESSAGES = 250; // 5x increase for sharding

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
      // TBURN v7.0: Predictive Self-Healing System (4 Prediction Algorithms) - Enterprise Grade 99%+
      trendAnalysisScore: 9920, // 99.20%
      anomalyDetectionScore: 9945, // 99.45%
      patternMatchingScore: 9935, // 99.35%
      timeseriesScore: 9950, // 99.50%
      healingEventsCount: 142,
      anomaliesDetected: 23,
      predictedFailureRisk: 300, // 3.00%
      selfHealingStatus: "healthy",
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
    this.restartSession = undefined;

    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize Triple-Band AI Models + Grok Fallback (basis points: 10000 = 100.00%)
    // Priority: 1=Gemini (Primary), 2=Anthropic, 3=OpenAI, 99=Grok (Fallback)
    const aiModels: AiModel[] = [
      {
        id: randomUUID(),
        name: "gemini-3-pro",
        band: "strategic", // Strategic AI - Priority 1 (PRIMARY)
        status: "active",
        requestCount: 45892,
        successCount: 45234,
        failureCount: 658,
        avgResponseTime: 180,
        totalCost: "145.67",
        lastUsed: new Date(),
        cacheHitRate: 7500, // 75.00% (basis points)
        accuracy: 9720, // 97.20% (basis points)
        uptime: 9995, // 99.95% (basis points)
        feedbackLearningScore: 8800, // 88.00%
        crossBandInteractions: 4521,
        strategicDecisions: 28450,
        tacticalDecisions: 12100,
        operationalDecisions: 5342,
        modelWeight: 3500, // 35.00%
        consensusContribution: 18934,
      },
      {
        id: randomUUID(),
        name: "claude-sonnet-4-5",
        band: "tactical", // Tactical AI - Priority 2
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
        feedbackLearningScore: 8500, // 85.00%
        crossBandInteractions: 2234,
        strategicDecisions: 1892,
        tacticalDecisions: 11340,
        operationalDecisions: 2660,
        modelWeight: 3300, // 33.00%
        consensusContribution: 12456,
      },
      {
        id: randomUUID(),
        name: "gpt-4o",
        band: "operational", // Operational AI - Priority 3
        status: "active",
        requestCount: 89234,
        successCount: 88789,
        failureCount: 445,
        avgResponseTime: 125,
        totalCost: "78.45",
        lastUsed: new Date(),
        cacheHitRate: 8500, // 85.00% (basis points)
        accuracy: 9850, // 98.50% (basis points)
        uptime: 9995, // 99.95% (basis points)
        feedbackLearningScore: 7800, // 78.00%
        crossBandInteractions: 3456,
        strategicDecisions: 892,
        tacticalDecisions: 5234,
        operationalDecisions: 83108,
        modelWeight: 3200, // 32.00%
        consensusContribution: 67834,
      },
      {
        id: randomUUID(),
        name: "grok-3",
        band: "fallback", // Fallback AI - Priority 99 (activates after 3 consecutive failures)
        status: "standby",
        requestCount: 0,
        successCount: 0,
        failureCount: 0,
        avgResponseTime: 0,
        totalCost: "0.00",
        lastUsed: null,
        cacheHitRate: 0, // Not yet used
        accuracy: 9500, // 95.00% estimated (basis points)
        uptime: 9999, // 99.99% (basis points)
        feedbackLearningScore: 0, // Not yet trained
        crossBandInteractions: 0,
        strategicDecisions: 0,
        tacticalDecisions: 0,
        operationalDecisions: 0,
        modelWeight: 0, // 0% - Fallback only
        consensusContribution: 0,
      },
    ];

    aiModels.forEach(model => this.aiModels.set(model.name, model));

    // Initialize AI Decisions (recent decisions from Triple-Band AI + Grok Fallback)
    const aiDecisionData: InsertAiDecision[] = [
      {
        band: "strategic",
        modelName: "gemini-3-pro",
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
        modelName: "gpt-4o",
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
        metadata: { confidence: 94, details: "Adjusted base gas price to 15 EMB based on network congestion analysis." },
      },
    ];

    aiDecisionData.forEach(decision => {
      const aiDecision: AiDecision = {
        id: randomUUID(),
        ...decision,
        status: decision.status ?? "pending",
        shardId: decision.shardId ?? null,
        validatorAddress: decision.validatorAddress ?? null,
        metadata: decision.metadata ?? null,
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
        mlOptimizationScore: 8700, // 87.00% ML optimization effectiveness
        predictedLoad: 48, // AI-predicted load percentage
        rebalanceCount: 12, // AI-triggered rebalances
        aiRecommendation: "stable", // AI recommendation: stable
        profilingScore: 9100, // 91.00% profiling effectiveness
        capacityUtilization: 4500, // 45.00% capacity utilization
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
        mlOptimizationScore: 8900, // 89.00% ML optimization effectiveness
        predictedLoad: 45, // AI-predicted load percentage
        rebalanceCount: 8, // AI-triggered rebalances
        aiRecommendation: "stable", // AI recommendation: stable
        profilingScore: 9300, // 93.00% profiling effectiveness
        capacityUtilization: 4200, // 42.00% capacity utilization
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
        mlOptimizationScore: 8600, // 86.00% ML optimization effectiveness
        predictedLoad: 51, // AI-predicted load percentage
        rebalanceCount: 15, // AI-triggered rebalances
        aiRecommendation: "stable", // AI recommendation: stable
        profilingScore: 8900, // 89.00% profiling effectiveness
        capacityUtilization: 4800, // 48.00% capacity utilization
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
        mlOptimizationScore: 9200, // 92.00% ML optimization effectiveness
        predictedLoad: 42, // AI-predicted load percentage
        rebalanceCount: 5, // AI-triggered rebalances
        aiRecommendation: "stable", // AI recommendation: stable
        profilingScore: 9400, // 94.00% profiling effectiveness
        capacityUtilization: 3900, // 39.00% capacity utilization
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
        mlOptimizationScore: 8400, // 84.00% ML optimization effectiveness
        predictedLoad: 55, // AI-predicted load percentage
        rebalanceCount: 18, // AI-triggered rebalances
        aiRecommendation: "stable", // AI recommendation: stable
        profilingScore: 8700, // 87.00% profiling effectiveness
        capacityUtilization: 5200, // 52.00% capacity utilization
      },
    ];

    shards.forEach(shard => this.shards.set(shard.shardId, shard));

    // Initialize Validators with Tiered System (basis points: 10000 = 100.00%)
    // Tier 1: Active Committee (max 512, min stake 200K TBURN, ~8% APY)
    // Tier 2: Standby Validators (max 4,488, min stake 50K TBURN, ~4% APY)
    // Tier 3: Delegators (unlimited, min stake 100 TBURN, ~5% APY)
    
    const TIER_1_COUNT = 125; // Current active committee size
    const TIER_1_MIN_STAKE = 200_000; // 200K TBURN minimum for Tier 1
    const TIER_1_APY = 800; // 8.00% APY in basis points
    
    const tier1Names = [
      "Genesis Validator", "Quantum Node", "Stellar Forge", "Nebula Keeper",
      "Cosmic Guardian", "Alpha Prime", "Beta Nexus", "Gamma Core",
      "Delta Shield", "Epsilon Wave", "Zeta Prime", "Theta Node",
      "Omega Sentinel", "Phoenix Rising", "Titan Guard", "Nova Cluster",
      "Aurora Node", "Spectrum Keeper", "Infinity Forge", "Parallel Prime",
      "Horizon Sentinel", "Eclipse Guard", "Vortex Core", "Prism Validator",
      "Cipher Node", "Nexus Prime", "Catalyst Core", "Vertex Guard",
      "Helix Forge", "Quantum Sentinel",
    ];

    // Generate 125 Tier 1 validators (Active Committee)
    for (let i = 0; i < TIER_1_COUNT; i++) {
      // Stake distribution: 200K - 400K TBURN (with power-law distribution)
      const stakeMultiplier = 1 + Math.pow(Math.random(), 2); // Higher stakes less common
      const baseStake = TIER_1_MIN_STAKE + Math.floor(Math.random() * 200_000 * stakeMultiplier);
      
      // Delegated stake: 10-50% of main stake
      const delegatedRatio = 0.1 + Math.random() * 0.4;
      const delegatedStake = Math.floor(baseStake * delegatedRatio);
      
      // Calculate voting power (stake + delegated)
      const votingPower = baseStake + delegatedStake;
      
      // APY varies slightly based on stake amount (higher stake = slightly lower APY due to dilution)
      const apyAdjustment = Math.floor(Math.random() * 200) - 100; // ±1%
      
      const validator: Validator = {
        id: randomUUID(),
        address: `0x${i.toString(16).padStart(4, '0')}${Math.random().toString(16).substr(2, 36)}`,
        name: tier1Names[i % tier1Names.length] + (i >= tier1Names.length ? ` ${Math.floor(i / tier1Names.length) + 1}` : ''),
        stake: baseStake.toString(),
        delegatedStake: delegatedStake.toString(),
        commission: Math.floor(Math.random() * 500) + 300, // 3.00-8.00% commission (lower for Tier 1)
        status: i < 120 ? "active" : Math.random() > 0.7 ? "inactive" : "active",
        uptime: Math.floor(Math.random() * 500) + 9500, // 95.00-99.99% uptime (higher for Tier 1)
        totalBlocks: Math.floor(Math.random() * 100000) + 50000, // More blocks validated
        missedBlocks: Math.floor(Math.random() * 50), // Fewer missed blocks
        avgBlockTime: Math.floor(Math.random() * 20) + 90, // More consistent block times
        votingPower: votingPower.toString(),
        apy: TIER_1_APY + apyAdjustment, // ~8% APY with small variance
        delegators: Math.floor(Math.random() * 1000) + 200, // More delegators for top validators
        rewardEarned: (Math.random() * 500000 + 100000).toFixed(2), // Higher rewards
        slashCount: Math.floor(Math.random() * 2), // Fewer slashes
        joinedAt: new Date(Date.now() - Math.random() * 730 * 24 * 60 * 60 * 1000), // Up to 2 years
        lastActiveAt: new Date(),
        // TBURN v7.0: AI-Enhanced Committee BFT (Stake + Reputation + Performance)
        reputationScore: Math.floor(Math.random() * 1000) + 8500, // 85.00-95.00% (higher for Tier 1)
        performanceScore: Math.floor(Math.random() * 500) + 9000, // 90.00-95.00% (higher for Tier 1)
        committeeSelectionCount: Math.floor(Math.random() * 1000) + 500, // More committee selections
        aiTrustScore: Math.floor(Math.random() * 1500) + 8000, // 80.00-95.00% AI-assessed reliability
        behaviorScore: Math.floor(Math.random() * 300) + 9200, // 92.00-95.00% network behavior quality
        adaptiveWeight: Math.floor(Math.random() * 1500) + 9500, // 95.00-110.00% dynamic committee weight
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
        latencyNs: 5000000 + Math.floor(Math.random() * 20000000), // 5-25ms enterprise-grade
        parallelBatchId: Math.random() > 0.3 ? `batch-${Math.floor(Math.random() * 100)}` : null,
        hashAlgorithm: "blake3", // TBURN v7.0: Multi-Hash Cryptographic System
      };
      this.blocks.set(block.id, block);
    }

    // Initialize Transactions
    for (let i = 0; i < 100; i++) {
      // Generate value in wei (18 decimals) using BigInt to avoid scientific notation
      const valueInEth = Math.floor(Math.random() * 100);
      const valueInWei = (BigInt(valueInEth) * BigInt(10 ** 18)).toString();
      
      // Generate gas price in wei (12 decimals for EMB, since 1 TBURN = 1e18 wei = 1e6 EMB)
      const gasPriceInEmb = Math.floor(Math.random() * 50 + 10);
      const gasPriceInWei = (BigInt(gasPriceInEmb) * BigInt(10 ** 12)).toString();
      
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
        latencyNs: 5000000 + Math.floor(Math.random() * 20000000), // 5-25ms enterprise-grade
        parallelBatchId: Math.random() > 0.3 ? `batch-${Math.floor(Math.random() * 100)}` : null,
        crossShardMessageId: Math.random() > 0.8 ? `msg-${Math.random().toString(16).substr(2, 8)}` : null,
        hashAlgorithm: "blake3", // TBURN v7.0: Multi-Hash Cryptographic System
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

  async searchBlocksByHashPrefix(hashPrefix: string, limit = 10): Promise<Block[]> {
    const normalizedPrefix = hashPrefix.toLowerCase().replace(/^0x/, '');
    return Array.from(this.blocks.values())
      .filter(b => b.hash.toLowerCase().includes(normalizedPrefix))
      .sort((a, b) => Number(b.blockNumber - a.blockNumber))
      .slice(0, limit);
  }

  async createBlock(insertBlock: InsertBlock): Promise<Block> {
    // Clean up old blocks if we've reached the limit
    if (this.blocks.size >= this.MAX_BLOCKS) {
      // Get all blocks sorted by blockNumber
      const sortedBlocks = Array.from(this.blocks.entries())
        .sort((a, b) => Number(a[1].blockNumber) - Number(b[1].blockNumber));
      
      // Remove the oldest 20% of blocks
      const toRemove = Math.floor(this.MAX_BLOCKS * 0.2);
      for (let i = 0; i < toRemove; i++) {
        this.blocks.delete(sortedBlocks[i][0]);
      }
    }

    const id = randomUUID();
    const block: Block = { 
      ...insertBlock, 
      id,
      transactionCount: insertBlock.transactionCount ?? 0,
      gasUsed: insertBlock.gasUsed ?? 0,
      gasLimit: insertBlock.gasLimit ?? 0,
      shardId: insertBlock.shardId ?? 0,
      executionClass: insertBlock.executionClass ?? "standard",
      latencyNs: insertBlock.latencyNs ?? 0,
      parallelBatchId: insertBlock.parallelBatchId ?? null,
      hashAlgorithm: insertBlock.hashAlgorithm ?? "blake3", // TBURN v7.0: Multi-Hash Cryptographic System
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
    // Clean up old transactions if we've reached the limit
    if (this.transactions.size >= this.MAX_TRANSACTIONS) {
      // Get all transactions sorted by timestamp
      const sortedTxs = Array.from(this.transactions.entries())
        .sort((a, b) => Number(a[1].timestamp) - Number(b[1].timestamp));
      
      // Remove the oldest 20% of transactions
      const toRemove = Math.floor(this.MAX_TRANSACTIONS * 0.2);
      for (let i = 0; i < toRemove; i++) {
        this.transactions.delete(sortedTxs[i][0]);
      }
    }

    const id = randomUUID();
    const tx: Transaction = { 
      ...insertTx, 
      id,
      to: insertTx.to ?? null,
      input: insertTx.input ?? null,
      contractAddress: insertTx.contractAddress ?? null,
      status: insertTx.status ?? "pending",
      gasUsed: insertTx.gasUsed ?? null,
      shardId: insertTx.shardId ?? 0,
      executionClass: insertTx.executionClass ?? "standard",
      latencyNs: insertTx.latencyNs ?? 0,
      parallelBatchId: insertTx.parallelBatchId ?? null,
      crossShardMessageId: insertTx.crossShardMessageId ?? null,
      hashAlgorithm: insertTx.hashAlgorithm ?? "blake3", // TBURN v7.0: Multi-Hash Cryptographic System
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

  async getValidatorById(id: string): Promise<Validator | undefined> {
    return Array.from(this.validators.values()).find(v => v.id === id);
  }

  async createValidator(insertValidator: InsertValidator): Promise<Validator> {
    const id = randomUUID();
    const now = new Date();
    const validator: Validator = {
      ...insertValidator,
      id,
      delegatedStake: insertValidator.delegatedStake ?? "0",
      commission: insertValidator.commission ?? 500,
      status: insertValidator.status ?? "active",
      uptime: insertValidator.uptime ?? 10000,
      totalBlocks: insertValidator.totalBlocks ?? 0,
      votingPower: insertValidator.votingPower ?? "0",
      apy: insertValidator.apy ?? 0,
      delegators: insertValidator.delegators ?? 0,
      joinedAt: now,
      missedBlocks: insertValidator.missedBlocks ?? 0,
      avgBlockTime: insertValidator.avgBlockTime ?? 0,
      rewardEarned: insertValidator.rewardEarned ?? "0",
      slashCount: insertValidator.slashCount ?? 0,
      lastActiveAt: now,
      // TBURN v7.0: AI-Enhanced Committee BFT (Stake + Reputation + Performance)
      reputationScore: insertValidator.reputationScore ?? 8500,
      performanceScore: insertValidator.performanceScore ?? 9000,
      committeeSelectionCount: insertValidator.committeeSelectionCount ?? 0,
      aiTrustScore: insertValidator.aiTrustScore ?? 7500,
      behaviorScore: insertValidator.behaviorScore ?? 9500,
      adaptiveWeight: insertValidator.adaptiveWeight ?? 10000,
    };
    this.validators.set(validator.address, validator);
    return validator;
  }

  async updateValidator(address: string, data: Partial<Validator>): Promise<Validator> {
    const validator = this.validators.get(address);
    if (!validator) {
      throw new Error(`Validator with address ${address} not found`);
    }
    const updated = { ...validator, ...data };
    this.validators.set(address, updated);
    return updated;
  }

  async getValidatorDetails(address: string): Promise<any> {
    const validator = await this.getValidatorByAddress(address);
    if (!validator) {
      throw new Error(`Validator ${address} not found`);
    }

    // Calculate rank
    const allValidators = await this.getAllValidators();
    const sortedValidators = allValidators.sort((a, b) => {
      const aPower = BigInt(a.stake) + BigInt(a.delegatedStake || 0);
      const bPower = BigInt(b.stake) + BigInt(b.delegatedStake || 0);
      return Number(bPower - aPower);
    });
    const rank = sortedValidators.findIndex(v => v.address === address) + 1;
    const isCommittee = rank <= 21;

    // Generate mock delegation data (TBURN total supply: 100,000,000)
    const delegators = [];
    const numDelegators = validator.delegators || 0;
    for (let i = 0; i < Math.min(numDelegators, 10); i++) {
      // Realistic delegation amounts: 100 - 50,000 TBURN per delegator
      const tburnAmount = Math.random() * 49900 + 100; // 100 to 50,000 TBURN
      const weiAmount = BigInt(Math.floor(tburnAmount * 1e18)); // Convert to Wei
      delegators.push({
        address: `0x${Math.random().toString(16).slice(2, 42)}`,
        amount: weiAmount.toString(),
        timestamp: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 30 * 24 * 60 * 60)
      });
    }

    // Generate performance history
    const performanceHistory = [];
    for (let i = 0; i < 24; i++) {
      performanceHistory.push({
        timestamp: Math.floor(Date.now() / 1000) - (24 - i) * 3600,
        blockTime: validator.avgBlockTime + (Math.random() - 0.5) * 0.5,
        missedBlocks: Math.floor(Math.random() * 3),
        uptime: validator.uptime + (Math.random() - 0.5) * 500
      });
    }

    // Generate reward history (realistic amounts based on APY)
    const rewardHistory = [];
    for (let i = 0; i < 30; i++) {
      // Daily rewards: 10 - 500 TBURN based on stake and APY
      const tburnReward = Math.random() * 490 + 10; // 10 to 500 TBURN daily
      const weiReward = BigInt(Math.floor(tburnReward * 1e18)); // Convert to Wei
      rewardHistory.push({
        timestamp: Math.floor(Date.now() / 1000) - (30 - i) * 24 * 3600,
        amount: weiReward.toString(),
        type: Math.random() > 0.7 ? 'block' : 'delegation'
      });
    }

    // Generate events
    const events = [
      {
        id: randomUUID(),
        timestamp: Math.floor(Date.now() / 1000) - 86400,
        type: 'activated',
        description: 'Validator activated',
        txHash: `0x${Math.random().toString(16).slice(2, 66)}`
      },
      {
        id: randomUUID(),
        timestamp: Math.floor(Date.now() / 1000) - 172800,
        type: 'reward',
        description: 'Claimed rewards: 1,234.56 TBURN',
        txHash: `0x${Math.random().toString(16).slice(2, 66)}`
      }
    ];

    return {
      ...validator,
      rank,
      isCommittee,
      delegators,
      performanceHistory,
      rewardHistory,
      events
    };
  }

  async delegateToValidator(address: string, amount: string, delegatorAddress: string): Promise<void> {
    const validator = await this.getValidatorByAddress(address);
    if (!validator) {
      throw new Error(`Validator ${address} not found`);
    }

    // Update delegated stake (amount is in TBURN, convert to Wei)
    const currentDelegated = BigInt(validator.delegatedStake || 0);
    const tburnAmount = parseFloat(amount); // Amount in TBURN
    const additionalDelegation = BigInt(Math.floor(tburnAmount * 1e18)); // Convert to Wei
    const newDelegated = currentDelegated + additionalDelegation;
    
    // Update voting power
    const votingPower = BigInt(validator.stake) + newDelegated;
    
    await this.updateValidator(address, {
      delegatedStake: newDelegated.toString(),
      votingPower: votingPower.toString(),
      delegators: (validator.delegators || 0) + 1
    });
  }

  async undelegateFromValidator(address: string, amount: string, delegatorAddress: string): Promise<void> {
    const validator = await this.getValidatorByAddress(address);
    if (!validator) {
      throw new Error(`Validator ${address} not found`);
    }

    // Update delegated stake (amount is in TBURN, convert to Wei)
    const currentDelegated = BigInt(validator.delegatedStake || 0);
    const tburnAmount = parseFloat(amount); // Amount in TBURN
    const undelegateAmount = BigInt(Math.floor(tburnAmount * 1e18)); // Convert to Wei
    const newDelegated = currentDelegated > undelegateAmount ? currentDelegated - undelegateAmount : BigInt(0);
    
    // Update voting power
    const votingPower = BigInt(validator.stake) + newDelegated;
    
    await this.updateValidator(address, {
      delegatedStake: newDelegated.toString(),
      votingPower: votingPower.toString(),
      delegators: Math.max(0, (validator.delegators || 0) - 1)
    });
  }

  async claimRewards(address: string): Promise<{ amount: string }> {
    const validator = await this.getValidatorByAddress(address);
    if (!validator) {
      throw new Error(`Validator ${address} not found`);
    }

    // Calculate rewards based on stake and APY
    const stake = BigInt(validator.stake);
    const delegatedStake = BigInt(validator.delegatedStake || 0);
    const totalStake = stake + delegatedStake;
    const apy = validator.apy / 10000; // Convert basis points to decimal
    const dailyRate = apy / 365;
    const rewardAmount = totalStake * BigInt(Math.floor(dailyRate * 1e18)) / BigInt(1e18);
    
    // Update reward earned
    const currentRewards = BigInt(validator.rewardEarned || 0);
    await this.updateValidator(address, {
      rewardEarned: (currentRewards + rewardAmount).toString()
    });

    return { amount: rewardAmount.toString() };
  }

  async activateValidator(address: string): Promise<void> {
    await this.updateValidator(address, {
      status: 'active',
      lastActiveAt: new Date()
    });
  }

  async deactivateValidator(address: string): Promise<void> {
    await this.updateValidator(address, {
      status: 'inactive'
    });
  }

  async updateValidatorCommission(address: string, commission: number): Promise<void> {
    await this.updateValidator(address, {
      commission
    });
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
    // Clean up old AI decisions if we've reached the limit
    if (this.aiDecisions.size >= this.MAX_AI_DECISIONS) {
      // Get all decisions sorted by createdAt
      const sortedDecisions = Array.from(this.aiDecisions.entries())
        .sort((a, b) => {
          const aTime = a[1].createdAt ? a[1].createdAt.getTime() : 0;
          const bTime = b[1].createdAt ? b[1].createdAt.getTime() : 0;
          return aTime - bTime;
        });
      
      // Remove the oldest 20% of decisions
      const toRemove = Math.floor(this.MAX_AI_DECISIONS * 0.2);
      for (let i = 0; i < toRemove; i++) {
        this.aiDecisions.delete(sortedDecisions[i][0]);
      }
    }

    const decision: AiDecision = {
      id: randomUUID(),
      ...data,
      status: data.status ?? "pending",
      shardId: data.shardId ?? null,
      validatorAddress: data.validatorAddress ?? null,
      metadata: data.metadata ?? null,
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

  // AI Usage Logs (Real AI tracking)
  private aiUsageLogs: Map<string, AiUsageLog> = new Map();

  async createAiUsageLog(data: InsertAiUsageLog): Promise<AiUsageLog> {
    const log: AiUsageLog = {
      id: randomUUID(),
      ...data,
      errorType: data.errorType ?? null,
      errorMessage: data.errorMessage ?? null,
      originalProvider: data.originalProvider ?? null,
      createdAt: new Date(),
    };
    this.aiUsageLogs.set(log.id, log);
    return log;
  }

  async getAiUsageLogs(limit: number = 100): Promise<AiUsageLog[]> {
    return Array.from(this.aiUsageLogs.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async updateAiModelStats(name: string, stats: {
    requestCount?: number;
    successCount?: number;
    failureCount?: number;
    avgResponseTime?: number;
    totalCost?: string;
    tokensUsed?: number;
    band?: string;
  }): Promise<void> {
    const model = Array.from(this.aiModels.values()).find(m => m.name === name);
    if (model) {
      const currentCost = parseFloat(model.totalCost) || 0;
      const addedCost = parseFloat(stats.totalCost || '0') || 0;
      
      const updated: AiModel = {
        ...model,
        requestCount: model.requestCount + (stats.requestCount || 0),
        successCount: model.successCount + (stats.successCount || 0),
        failureCount: model.failureCount + (stats.failureCount || 0),
        avgResponseTime: stats.avgResponseTime 
          ? Math.round((model.avgResponseTime + stats.avgResponseTime) / 2)
          : model.avgResponseTime,
        totalCost: (currentCost + addedCost).toFixed(4),
        lastUsed: new Date(),
      };
      
      if (stats.band === 'strategic') updated.strategicDecisions += 1;
      if (stats.band === 'tactical') updated.tacticalDecisions += 1;
      if (stats.band === 'operational') updated.operationalDecisions += 1;
      
      this.aiModels.set(model.id, updated);
    }
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
    // 100ms block cycle - calculate position within current block
    const blockCycleMs = 100;
    const elapsed = now % blockCycleMs; // Position within current 100ms block cycle
    const blockStartTime = now - elapsed;
    
    // AI-BFT Consensus: AI Pre-Validation makes validator phases faster
    // 5-phase: AI Pre-Validation(0-8ms), Propose(8-28ms), Prevote(28-48ms), Precommit(48-70ms), Commit(70-100ms)
    let currentPhase = 1;
    if (elapsed >= 70) currentPhase = 5;      // Commit: 70-100ms
    else if (elapsed >= 48) currentPhase = 4; // Precommit: 48-70ms
    else if (elapsed >= 28) currentPhase = 3; // Prevote: 28-48ms
    else if (elapsed >= 8) currentPhase = 2;  // Propose: 8-28ms
    // else: AI Pre-Validation: 0-8ms
    
    const proposer = activeValidators[0]?.address || "0x0000...0000";
    
    // Network: 125 total, 110 active validators
    const totalValidators = 110;
    const requiredQuorum = 84; // 2f+1 where f=41
    const prevoteCount = Math.floor(totalValidators * (0.88 + Math.random() * 0.07));  // 88-95% (high consensus rate)
    const precommitCount = Math.floor(totalValidators * (0.85 + Math.random() * 0.10)); // 85-95% (high consensus rate)
    
    // AI Pre-Validation is ultra-fast (5-10ms), validator phases are faster due to AI pre-check
    const phaseTimes = [
      5 + Math.floor(Math.random() * 5),    // AI Pre-Validation: 5-9ms (AI handles heavy lifting)
      15 + Math.floor(Math.random() * 5),   // Propose: 15-19ms (validators confirm only)
      18 + Math.floor(Math.random() * 4),   // Prevote: 18-21ms (quick confirmation)
      15 + Math.floor(Math.random() * 5),   // Precommit: 15-19ms (quick confirmation)
      20 + Math.floor(Math.random() * 5),   // Commit: 20-24ms (finalization)
    ];
    
    const phases: import("@shared/schema").ConsensusPhase[] = [
      { number: 1, label: "AI Pre-Validation", time: `${phaseTimes[0]}ms`, status: currentPhase === 1 ? "active" : "completed" },
      { number: 2, label: "Propose", time: `${phaseTimes[1]}ms`, status: currentPhase === 2 ? "active" : currentPhase > 2 ? "completed" : "pending" },
      { number: 3, label: "Prevote", time: `${phaseTimes[2]}ms`, status: currentPhase === 3 ? "active" : currentPhase > 3 ? "completed" : "pending" },
      { number: 4, label: "Precommit", time: `${phaseTimes[3]}ms`, status: currentPhase === 4 ? "active" : currentPhase > 4 ? "completed" : "pending" },
      { number: 5, label: "Commit", time: `${phaseTimes[4]}ms`, status: currentPhase === 5 ? "active" : "pending" },
    ];
    
    return {
      currentPhase,
      phases,
      proposer,
      blockHeight: Number(stats.currentBlockHeight),
      prevoteCount,
      precommitCount,
      totalValidators,
      requiredQuorum,
      avgBlockTimeMs: 100,
      startTime: blockStartTime,
    };
  }

  async getAllConsensusRounds(limit: number = 100): Promise<import("@shared/schema").ConsensusRound[]> {
    return Array.from(this.consensusRounds.values())
      .sort((a, b) => Number(b.blockHeight) - Number(a.blockHeight))
      .slice(0, limit);
  }

  async getConsensusRoundByBlockHeight(blockHeight: number): Promise<import("@shared/schema").ConsensusRound | undefined> {
    return this.consensusRounds.get(blockHeight);
  }

  async createConsensusRound(data: import("@shared/schema").InsertConsensusRound): Promise<import("@shared/schema").ConsensusRound> {
    // Clean up old consensus rounds if we've reached the limit
    if (this.consensusRounds.size >= this.MAX_CONSENSUS_ROUNDS) {
      // Get all rounds sorted by blockHeight
      const sortedRounds = Array.from(this.consensusRounds.entries())
        .sort((a, b) => a[0] - b[0]);
      
      // Remove the oldest 20% of rounds
      const toRemove = Math.floor(this.MAX_CONSENSUS_ROUNDS * 0.2);
      for (let i = 0; i < toRemove; i++) {
        this.consensusRounds.delete(sortedRounds[i][0]);
      }
    }

    const round: import("@shared/schema").ConsensusRound = {
      id: `round-${data.blockHeight}`,
      ...data,
      totalValidators: data.totalValidators ?? 0,
      status: data.status ?? "in_progress",
      currentPhase: data.currentPhase ?? 1,
      prevoteCount: data.prevoteCount ?? 0,
      precommitCount: data.precommitCount ?? 0,
      requiredQuorum: data.requiredQuorum ?? 0,
      avgBlockTimeMs: data.avgBlockTimeMs ?? 0,
      completedTime: data.completedTime ?? null,
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
    if (!existing) {
      throw new Error(`Consensus round not found for block height ${blockHeight}`);
    }
    this.consensusRounds.set(blockHeight, { ...existing, ...data });
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

  async updateApiKey(id: string, data: Partial<ApiKey>): Promise<ApiKey | undefined> {
    throw new Error("API Keys not supported in MemStorage");
  }

  async revokeApiKey(id: string, revokedBy?: string, reason?: string): Promise<void> {
    throw new Error("API Keys not supported in MemStorage");
  }

  async updateApiKeyLastUsed(id: string): Promise<void> {
    throw new Error("API Keys not supported in MemStorage");
  }

  async incrementApiKeyUsage(id: string): Promise<void> {
    throw new Error("API Keys not supported in MemStorage");
  }

  async resetDailyApiKeyUsage(): Promise<void> {
    throw new Error("API Keys not supported in MemStorage");
  }

  async resetMonthlyApiKeyUsage(): Promise<void> {
    throw new Error("API Keys not supported in MemStorage");
  }

  async getApiKeyStats(id: string): Promise<{ totalRequests: number; requestsToday: number; requestsThisMonth: number; errorCount: number } | undefined> {
    return undefined;
  }

  async createApiKeyLog(data: InsertApiKeyLog): Promise<ApiKeyLog> {
    throw new Error("API Key Logs not supported in MemStorage");
  }

  async getApiKeyLogs(apiKeyId: string, limit?: number): Promise<ApiKeyLog[]> {
    return [];
  }

  async getRecentApiKeyLogs(limit?: number): Promise<ApiKeyLog[]> {
    return [];
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
      status: data.status ?? "pending",
      retryCount: data.retryCount ?? 0,
      gasUsed: data.gasUsed ?? 0,
      sentAt: new Date(),
      confirmedAt: null,
      failedAt: null,
      // TBURN v7.0: Hybrid Message Routing Protocol (Reputation-based P2P Routing)
      routingPriority: data.routingPriority ?? 5,
      peerReputation: data.peerReputation ?? 8000,
      networkQuality: data.networkQuality ?? 9000,
      routeOptimization: data.routeOptimization ?? "balanced",
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
      transactionCount: data.transactionCount ?? 0,
      balance: data.balance ?? "0",
      stakedBalance: data.stakedBalance ?? "0",
      unstakedBalance: data.unstakedBalance ?? "0",
      rewardsEarned: data.rewardsEarned ?? "0",
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
      const initialStats: NetworkStats = {
        id: "singleton",
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
        updatedAt: new Date(),
        // TBURN v7.0: Predictive Self-Healing System (4 Prediction Algorithms) - Enterprise Grade 99%+
        trendAnalysisScore: 9920,
        anomalyDetectionScore: 9945,
        patternMatchingScore: 9935,
        timeseriesScore: 9950,
        healingEventsCount: 142,
        anomaliesDetected: 23,
        predictedFailureRisk: 300,
        selfHealingStatus: "healthy",
      };
      await db.insert(networkStatsTable).values(initialStats);
      return initialStats;
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

  async searchBlocksByHashPrefix(hashPrefix: string, limit = 10): Promise<Block[]> {
    const normalizedPrefix = hashPrefix.toLowerCase().replace(/^0x/, '');
    // Get recent blocks and filter by hash prefix in memory
    // Limit to 5000 blocks for performance
    const recentBlocks = await db.select().from(blocks).orderBy(desc(blocks.blockNumber)).limit(5000);
    return recentBlocks
      .filter(b => b.hash.toLowerCase().includes(normalizedPrefix))
      .slice(0, limit);
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

  async getValidatorById(id: string): Promise<Validator | undefined> {
    const result = await db.select().from(validators).where(eq(validators.id, id)).limit(1);
    return result[0];
  }

  async createValidator(insertValidator: InsertValidator): Promise<Validator> {
    const result = await db.insert(validators).values(insertValidator).returning();
    return result[0];
  }

  async updateValidator(address: string, data: Partial<Validator>): Promise<Validator> {
    await db.update(validators).set(data).where(eq(validators.address, address));
    const result = await this.getValidatorByAddress(address);
    if (!result) throw new Error(`Validator ${address} not found`);
    return result;
  }

  async getValidatorDetails(address: string): Promise<any> {
    const validator = await this.getValidatorByAddress(address);
    if (!validator) {
      throw new Error(`Validator ${address} not found`);
    }

    // Calculate rank
    const allValidators = await this.getAllValidators();
    const sortedValidators = allValidators.sort((a, b) => {
      const aPower = BigInt(a.stake) + BigInt(a.delegatedStake || 0);
      const bPower = BigInt(b.stake) + BigInt(b.delegatedStake || 0);
      return Number(bPower - aPower);
    });
    const rank = sortedValidators.findIndex(v => v.address === address) + 1;
    const isCommittee = rank <= 21;

    // Generate mock delegation data (in production this would come from delegations table)
    // TBURN total supply: 100,000,000
    const delegators = [];
    const numDelegators = validator.delegators || 0;
    for (let i = 0; i < Math.min(numDelegators, 10); i++) {
      // Realistic delegation amounts: 100 - 50,000 TBURN per delegator
      const tburnAmount = Math.random() * 49900 + 100; // 100 to 50,000 TBURN
      const weiAmount = BigInt(Math.floor(tburnAmount * 1e18)); // Convert to Wei
      delegators.push({
        address: `0x${Math.random().toString(16).slice(2, 42)}`,
        amount: weiAmount.toString(),
        timestamp: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 30 * 24 * 60 * 60)
      });
    }

    // Generate performance history
    const performanceHistory = [];
    for (let i = 0; i < 24; i++) {
      performanceHistory.push({
        timestamp: Math.floor(Date.now() / 1000) - (24 - i) * 3600,
        blockTime: validator.avgBlockTime + (Math.random() - 0.5) * 0.5,
        missedBlocks: Math.floor(Math.random() * 3),
        uptime: validator.uptime + (Math.random() - 0.5) * 500
      });
    }

    // Generate reward history (realistic amounts based on APY)
    const rewardHistory = [];
    for (let i = 0; i < 30; i++) {
      // Daily rewards: 10 - 500 TBURN based on stake and APY
      const tburnReward = Math.random() * 490 + 10; // 10 to 500 TBURN daily
      const weiReward = BigInt(Math.floor(tburnReward * 1e18)); // Convert to Wei
      rewardHistory.push({
        timestamp: Math.floor(Date.now() / 1000) - (30 - i) * 24 * 3600,
        amount: weiReward.toString(),
        type: Math.random() > 0.7 ? 'block' : 'delegation'
      });
    }

    // Generate events
    const events = [
      {
        id: randomUUID(),
        timestamp: Math.floor(Date.now() / 1000) - 86400,
        type: 'activated',
        description: 'Validator activated',
        txHash: `0x${Math.random().toString(16).slice(2, 66)}`
      },
      {
        id: randomUUID(),
        timestamp: Math.floor(Date.now() / 1000) - 172800,
        type: 'reward',
        description: 'Claimed rewards: 1,234.56 TBURN',
        txHash: `0x${Math.random().toString(16).slice(2, 66)}`
      }
    ];

    return {
      ...validator,
      rank,
      isCommittee,
      delegators,
      performanceHistory,
      rewardHistory,
      events
    };
  }

  async delegateToValidator(address: string, amount: string, delegatorAddress: string): Promise<void> {
    const validator = await this.getValidatorByAddress(address);
    if (!validator) {
      throw new Error(`Validator ${address} not found`);
    }

    // Update delegated stake (amount is in TBURN, convert to Wei)
    const currentDelegated = BigInt(validator.delegatedStake || 0);
    const tburnAmount = parseFloat(amount); // Amount in TBURN
    const additionalDelegation = BigInt(Math.floor(tburnAmount * 1e18)); // Convert to Wei
    const newDelegated = currentDelegated + additionalDelegation;
    
    // Update voting power
    const votingPower = BigInt(validator.stake) + newDelegated;
    
    await this.updateValidator(address, {
      delegatedStake: newDelegated.toString(),
      votingPower: votingPower.toString(),
      delegators: (validator.delegators || 0) + 1
    });
  }

  async undelegateFromValidator(address: string, amount: string, delegatorAddress: string): Promise<void> {
    const validator = await this.getValidatorByAddress(address);
    if (!validator) {
      throw new Error(`Validator ${address} not found`);
    }

    // Update delegated stake (amount is in TBURN, convert to Wei)
    const currentDelegated = BigInt(validator.delegatedStake || 0);
    const tburnAmount = parseFloat(amount); // Amount in TBURN
    const undelegateAmount = BigInt(Math.floor(tburnAmount * 1e18)); // Convert to Wei
    const newDelegated = currentDelegated > undelegateAmount ? currentDelegated - undelegateAmount : BigInt(0);
    
    // Update voting power
    const votingPower = BigInt(validator.stake) + newDelegated;
    
    await this.updateValidator(address, {
      delegatedStake: newDelegated.toString(),
      votingPower: votingPower.toString(),
      delegators: Math.max(0, (validator.delegators || 0) - 1)
    });
  }

  async claimRewards(address: string): Promise<{ amount: string }> {
    const validator = await this.getValidatorByAddress(address);
    if (!validator) {
      throw new Error(`Validator ${address} not found`);
    }

    // Calculate rewards based on stake and APY
    const stake = BigInt(validator.stake);
    const delegatedStake = BigInt(validator.delegatedStake || 0);
    const totalStake = stake + delegatedStake;
    const apy = validator.apy / 10000; // Convert basis points to decimal
    const dailyRate = apy / 365;
    const rewardAmount = totalStake * BigInt(Math.floor(dailyRate * 1e18)) / BigInt(1e18);
    
    // Update reward earned
    const currentRewards = BigInt(validator.rewardEarned || 0);
    await this.updateValidator(address, {
      rewardEarned: (currentRewards + rewardAmount).toString()
    });

    return { amount: rewardAmount.toString() };
  }

  async activateValidator(address: string): Promise<void> {
    await this.updateValidator(address, {
      status: 'active',
      lastActiveAt: new Date()
    });
  }

  async deactivateValidator(address: string): Promise<void> {
    await this.updateValidator(address, {
      status: 'inactive'
    });
  }

  async updateValidatorCommission(address: string, commission: number): Promise<void> {
    await this.updateValidator(address, {
      commission
    });
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

  // AI Usage Logs (Real AI tracking)
  async createAiUsageLog(data: InsertAiUsageLog): Promise<AiUsageLog> {
    const result = await db.insert(aiUsageLogs).values(data).returning();
    return result[0];
  }

  async getAiUsageLogs(limit: number = 100): Promise<AiUsageLog[]> {
    return db.select().from(aiUsageLogs).orderBy(desc(aiUsageLogs.createdAt)).limit(limit);
  }

  async updateAiModelStats(name: string, stats: {
    requestCount?: number;
    successCount?: number;
    failureCount?: number;
    avgResponseTime?: number;
    totalCost?: string;
    tokensUsed?: number;
    band?: string;
  }): Promise<void> {
    const model = await this.getAiModelByName(name);
    if (model) {
      const currentCost = parseFloat(model.totalCost) || 0;
      const addedCost = parseFloat(stats.totalCost || '0') || 0;
      
      const updates: Partial<AiModel> = {
        requestCount: model.requestCount + (stats.requestCount || 0),
        successCount: model.successCount + (stats.successCount || 0),
        failureCount: model.failureCount + (stats.failureCount || 0),
        avgResponseTime: stats.avgResponseTime 
          ? Math.round((model.avgResponseTime + stats.avgResponseTime) / 2)
          : model.avgResponseTime,
        totalCost: (currentCost + addedCost).toFixed(4),
        lastUsed: new Date(),
      };
      
      if (stats.band === 'strategic') updates.strategicDecisions = model.strategicDecisions + 1;
      if (stats.band === 'tactical') updates.tacticalDecisions = model.tacticalDecisions + 1;
      if (stats.band === 'operational') updates.operationalDecisions = model.operationalDecisions + 1;
      
      await db.update(aiModels).set(updates).where(eq(aiModels.name, name));
    }
  }

  // AI Execution Logs (Blockchain control tracking)
  async createAiExecutionLog(data: InsertAiExecutionLog): Promise<AiExecutionLog> {
    const result = await db.insert(aiExecutionLogs).values(data).returning();
    return result[0];
  }

  async getAiExecutionLog(id: string): Promise<AiExecutionLog | undefined> {
    const result = await db.select().from(aiExecutionLogs).where(eq(aiExecutionLogs.id, id)).limit(1);
    return result[0];
  }

  async updateAiExecutionLog(id: string, data: Partial<AiExecutionLog>): Promise<void> {
    const updateData = {
      ...data,
      completedAt: data.status === 'completed' || data.status === 'failed' || data.status === 'rolled_back' 
        ? new Date() 
        : undefined,
      rollbackAt: data.rolledBack ? new Date() : undefined,
    };
    await db.update(aiExecutionLogs).set(updateData).where(eq(aiExecutionLogs.id, id));
  }

  async getRecentAiExecutionLogs(limit: number = 50): Promise<AiExecutionLog[]> {
    return db.select().from(aiExecutionLogs).orderBy(desc(aiExecutionLogs.createdAt)).limit(limit);
  }

  // Governance Pre-validations
  async createGovernancePrevalidation(data: InsertGovernancePrevalidation): Promise<GovernancePrevalidation> {
    const result = await db.insert(governancePrevalidations).values(data).returning();
    return result[0];
  }

  async getGovernancePrevalidation(id: string): Promise<GovernancePrevalidation | undefined> {
    const result = await db.select().from(governancePrevalidations).where(eq(governancePrevalidations.id, id)).limit(1);
    return result[0];
  }

  async getRecentGovernancePrevalidations(limit: number = 50): Promise<GovernancePrevalidation[]> {
    return db.select().from(governancePrevalidations).orderBy(desc(governancePrevalidations.createdAt)).limit(limit);
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
      
      // Network: 125 total, 110 active validators
      const totalValidators = 110;
      const requiredQuorum = 84; // 2f+1 where f=41
      
      // AI Pre-Validation is ultra-fast, validator phases are faster due to AI pre-check
      const phaseTimes = [
        5 + Math.floor(Math.random() * 5),    // AI Pre-Validation: 5-9ms
        15 + Math.floor(Math.random() * 5),   // Propose: 15-19ms
        18 + Math.floor(Math.random() * 4),   // Prevote: 18-21ms
        15 + Math.floor(Math.random() * 5),   // Precommit: 15-19ms
        20 + Math.floor(Math.random() * 5),   // Commit: 20-24ms
      ];
      
      return {
        currentPhase: 1,
        phases: [
          { number: 1, label: "AI Pre-Validation", time: `${phaseTimes[0]}ms`, status: "active" },
          { number: 2, label: "Propose", time: `${phaseTimes[1]}ms`, status: "pending" },
          { number: 3, label: "Prevote", time: `${phaseTimes[2]}ms`, status: "pending" },
          { number: 4, label: "Precommit", time: `${phaseTimes[3]}ms`, status: "pending" },
          { number: 5, label: "Commit", time: `${phaseTimes[4]}ms`, status: "pending" },
        ],
        proposer: activeValidators[0]?.address || "0x0000...0000",
        blockHeight: Number(stats.currentBlockHeight),
        prevoteCount: Math.floor(totalValidators * 0.88),
        precommitCount: Math.floor(totalValidators * 0.80),
        totalValidators,
        requiredQuorum,
        avgBlockTimeMs: 100,
        startTime: Date.now() - 10,
      };
    }

    // AI-BFT Consensus: AI Pre-Validation + 4 validator confirmation phases
    // 1. AI Pre-Validation, 2. Propose, 3. Prevote, 4. Precommit, 5. Commit
    const currentPhase = Math.min(latestRound.currentPhase, 5);
    const phaseTimes = [
      5 + Math.floor(Math.random() * 5),    // AI Pre-Validation: 5-9ms
      15 + Math.floor(Math.random() * 5),   // Propose: 15-19ms
      18 + Math.floor(Math.random() * 4),   // Prevote: 18-21ms
      15 + Math.floor(Math.random() * 5),   // Precommit: 15-19ms
      20 + Math.floor(Math.random() * 5),   // Commit: 20-24ms
    ];
    
    const phases: import("@shared/schema").ConsensusPhase[] = [
      { number: 1, label: "AI Pre-Validation", time: `${phaseTimes[0]}ms`, status: currentPhase === 1 ? "active" : "completed" },
      { number: 2, label: "Propose", time: `${phaseTimes[1]}ms`, status: currentPhase === 2 ? "active" : currentPhase > 2 ? "completed" : "pending" },
      { number: 3, label: "Prevote", time: `${phaseTimes[2]}ms`, status: currentPhase === 3 ? "active" : currentPhase > 3 ? "completed" : "pending" },
      { number: 4, label: "Precommit", time: `${phaseTimes[3]}ms`, status: currentPhase === 4 ? "active" : currentPhase > 4 ? "completed" : "pending" },
      { number: 5, label: "Commit", time: `${phaseTimes[4]}ms`, status: currentPhase === 5 ? "active" : "pending" },
    ];
    
    return {
      currentPhase,
      phases,
      proposer: latestRound.proposerAddress,
      blockHeight: Number(latestRound.blockHeight),
      prevoteCount: latestRound.prevoteCount,
      precommitCount: latestRound.precommitCount,
      totalValidators: 110,      // Fixed: 110 active validators
      requiredQuorum: 84,         // Fixed: 2f+1 quorum
      avgBlockTimeMs: 100,
      startTime: Number(latestRound.startTime),
    };
  }

  async getAllConsensusRounds(limit: number = 100): Promise<ConsensusRound[]> {
    return db
      .select()
      .from(consensusRounds)
      .orderBy(desc(consensusRounds.blockHeight))
      .limit(limit);
  }

  async getConsensusRoundByBlockHeight(blockHeight: number): Promise<ConsensusRound | undefined> {
    const [round] = await db
      .select()
      .from(consensusRounds)
      .where(eq(consensusRounds.blockHeight, blockHeight))
      .limit(1);
    return round;
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
      .where(eq(consensusRounds.blockHeight, blockHeight));
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

  async updateApiKey(id: string, data: Partial<ApiKey>): Promise<ApiKey | undefined> {
    const result = await db.update(apiKeys)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(apiKeys.id, id))
      .returning();
    return result[0];
  }

  async revokeApiKey(id: string, revokedBy?: string, reason?: string): Promise<void> {
    await db.update(apiKeys).set({ 
      revokedAt: new Date(),
      revokedBy: revokedBy || null,
      revokeReason: reason || null,
      isActive: false,
    }).where(eq(apiKeys.id, id));
  }

  async updateApiKeyLastUsed(id: string): Promise<void> {
    await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, id));
  }

  async incrementApiKeyUsage(id: string): Promise<void> {
    await db.update(apiKeys).set({ 
      totalRequests: sql`${apiKeys.totalRequests} + 1`,
      requestsToday: sql`${apiKeys.requestsToday} + 1`,
      requestsThisMonth: sql`${apiKeys.requestsThisMonth} + 1`,
      lastUsedAt: new Date(),
    }).where(eq(apiKeys.id, id));
  }

  async resetDailyApiKeyUsage(): Promise<void> {
    await db.update(apiKeys).set({ requestsToday: 0 }).where(isNull(apiKeys.revokedAt));
  }

  async resetMonthlyApiKeyUsage(): Promise<void> {
    await db.update(apiKeys).set({ requestsThisMonth: 0 }).where(isNull(apiKeys.revokedAt));
  }

  async getApiKeyStats(id: string): Promise<{ totalRequests: number; requestsToday: number; requestsThisMonth: number; errorCount: number } | undefined> {
    const result = await db.select({
      totalRequests: apiKeys.totalRequests,
      requestsToday: apiKeys.requestsToday,
      requestsThisMonth: apiKeys.requestsThisMonth,
      errorCount: apiKeys.errorCount,
    }).from(apiKeys).where(eq(apiKeys.id, id)).limit(1);
    return result[0];
  }

  // API Key Activity Logs
  async createApiKeyLog(data: InsertApiKeyLog): Promise<ApiKeyLog> {
    const result = await db.insert(apiKeyLogs).values(data).returning();
    return result[0];
  }

  async getApiKeyLogs(apiKeyId: string, limit: number = 100): Promise<ApiKeyLog[]> {
    return db.select().from(apiKeyLogs)
      .where(eq(apiKeyLogs.apiKeyId, apiKeyId))
      .orderBy(desc(apiKeyLogs.createdAt))
      .limit(limit);
  }

  async getRecentApiKeyLogs(limit: number = 100): Promise<ApiKeyLog[]> {
    return db.select().from(apiKeyLogs)
      .orderBy(desc(apiKeyLogs.createdAt))
      .limit(limit);
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

  // Member Management System Implementation

  // Members
  async getAllMembers(limit: number = 100): Promise<Member[]> {
    return db.select().from(members).orderBy(desc(members.createdAt)).limit(limit);
  }

  async getMemberById(id: string): Promise<Member | undefined> {
    const result = await db.select().from(members).where(eq(members.id, id)).limit(1);
    return result[0];
  }

  async getMemberByAddress(address: string): Promise<Member | undefined> {
    const result = await db.select().from(members).where(eq(members.accountAddress, address)).limit(1);
    return result[0];
  }

  async getMemberByEmail(email: string): Promise<Member | undefined> {
    const result = await db.select().from(members).where(eq(members.encryptedEmail, email)).limit(1);
    return result[0];
  }

  async createMember(data: InsertMember): Promise<Member> {
    const result = await db.insert(members).values(data).returning();
    return result[0];
  }

  async updateMember(id: string, data: Partial<Member>): Promise<void> {
    await db.update(members).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(members.id, id));
  }

  async deleteMember(id: string): Promise<void> {
    await db.delete(members).where(eq(members.id, id));
  }

  // Member Profiles
  async getMemberProfileByMemberId(memberId: string): Promise<MemberProfile | undefined> {
    const result = await db.select().from(memberProfiles).where(eq(memberProfiles.memberId, memberId)).limit(1);
    return result[0];
  }

  async createMemberProfile(data: InsertMemberProfile): Promise<MemberProfile> {
    const result = await db.insert(memberProfiles).values(data).returning();
    return result[0];
  }

  async updateMemberProfile(memberId: string, data: Partial<MemberProfile>): Promise<void> {
    await db.update(memberProfiles).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(memberProfiles.memberId, memberId));
  }

  // Member Staking Positions
  async getMemberStakingPositions(memberId: string): Promise<MemberStakingPosition[]> {
    return db.select().from(memberStakingPositions).where(eq(memberStakingPositions.memberId, memberId));
  }

  async createMemberStakingPosition(data: InsertMemberStakingPosition): Promise<MemberStakingPosition> {
    const result = await db.insert(memberStakingPositions).values(data).returning();
    return result[0];
  }

  async updateMemberStakingPosition(id: string, data: Partial<MemberStakingPosition>): Promise<void> {
    await db.update(memberStakingPositions).set(data).where(eq(memberStakingPositions.id, id));
  }

  // Member Governance Profiles
  async getMemberGovernanceProfile(memberId: string): Promise<MemberGovernanceProfile | undefined> {
    const result = await db.select().from(memberGovernanceProfiles).where(eq(memberGovernanceProfiles.memberId, memberId)).limit(1);
    return result[0];
  }

  async createMemberGovernanceProfile(data: InsertMemberGovernanceProfile): Promise<MemberGovernanceProfile> {
    const result = await db.insert(memberGovernanceProfiles).values(data).returning();
    return result[0];
  }

  async updateMemberGovernanceProfile(memberId: string, data: Partial<MemberGovernanceProfile>): Promise<void> {
    await db.update(memberGovernanceProfiles).set(data).where(eq(memberGovernanceProfiles.memberId, memberId));
  }

  // Member Financial Profiles
  async getMemberFinancialProfile(memberId: string): Promise<MemberFinancialProfile | undefined> {
    const result = await db.select().from(memberFinancialProfiles).where(eq(memberFinancialProfiles.memberId, memberId)).limit(1);
    return result[0];
  }

  async createMemberFinancialProfile(data: InsertMemberFinancialProfile): Promise<MemberFinancialProfile> {
    const result = await db.insert(memberFinancialProfiles).values(data).returning();
    return result[0];
  }

  async updateMemberFinancialProfile(memberId: string, data: Partial<MemberFinancialProfile>): Promise<void> {
    await db.update(memberFinancialProfiles).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(memberFinancialProfiles.memberId, memberId));
  }

  // Member Security Profiles
  async getMemberSecurityProfile(memberId: string): Promise<MemberSecurityProfile | undefined> {
    const result = await db.select().from(memberSecurityProfiles).where(eq(memberSecurityProfiles.memberId, memberId)).limit(1);
    return result[0];
  }

  async createMemberSecurityProfile(data: InsertMemberSecurityProfile): Promise<MemberSecurityProfile> {
    const result = await db.insert(memberSecurityProfiles).values(data).returning();
    return result[0];
  }

  async updateMemberSecurityProfile(memberId: string, data: Partial<MemberSecurityProfile>): Promise<void> {
    await db.update(memberSecurityProfiles).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(memberSecurityProfiles.memberId, memberId));
  }

  // Member Performance Metrics
  async getMemberPerformanceMetrics(memberId: string): Promise<MemberPerformanceMetrics | undefined> {
    const result = await db.select().from(memberPerformanceMetrics).where(eq(memberPerformanceMetrics.memberId, memberId)).limit(1);
    return result[0];
  }

  async createMemberPerformanceMetrics(data: InsertMemberPerformanceMetrics): Promise<MemberPerformanceMetrics> {
    const result = await db.insert(memberPerformanceMetrics).values(data).returning();
    return result[0];
  }

  async updateMemberPerformanceMetrics(memberId: string, data: Partial<MemberPerformanceMetrics>): Promise<void> {
    await db.update(memberPerformanceMetrics).set({
      ...data,
      metricsUpdatedAt: new Date(),
    }).where(eq(memberPerformanceMetrics.memberId, memberId));
  }

  // Member Slash Events
  async getMemberSlashEvents(memberId: string): Promise<MemberSlashEvent[]> {
    return db.select().from(memberSlashEvents).where(eq(memberSlashEvents.memberId, memberId)).orderBy(desc(memberSlashEvents.occurredAt));
  }

  async createMemberSlashEvent(data: InsertMemberSlashEvent): Promise<MemberSlashEvent> {
    const result = await db.insert(memberSlashEvents).values(data).returning();
    return result[0];
  }

  // Member Audit Logs
  async getMemberAuditLogs(memberId: string, limit: number = 100): Promise<MemberAuditLog[]> {
    return db.select().from(memberAuditLogs).where(eq(memberAuditLogs.memberId, memberId)).orderBy(desc(memberAuditLogs.createdAt)).limit(limit);
  }

  async createMemberAuditLog(data: InsertMemberAuditLog): Promise<MemberAuditLog> {
    const result = await db.insert(memberAuditLogs).values(data).returning();
    return result[0];
  }

  // Member Analytics
  async getMemberStatistics(): Promise<{
    totalMembers: number;
    activeMembers: number;
    totalValidators: number;
    totalStakers: number;
    kycVerified: number;
  }> {
    // Get all members to calculate statistics
    const allMembers = await this.getAllMembers(10000);
    
    const stats = {
      totalMembers: allMembers.length,
      activeMembers: allMembers.filter(m => m.memberStatus === 'active').length,
      totalValidators: allMembers.filter(m => 
        ['active_validator', 'inactive_validator', 'genesis_validator', 'enterprise_validator', 'governance_validator'].includes(m.memberTier)
      ).length,
      totalStakers: allMembers.filter(m => 
        m.memberTier !== 'basic_user'
      ).length,
      kycVerified: allMembers.filter(m => 
        m.kycLevel !== 'none'
      ).length,
    };
    
    return stats;
  }

  // Restart Sessions
  async getRestartSession(): Promise<RestartSession | undefined> {
    const result = await db.select().from(restartSessions).where(eq(restartSessions.id, "singleton")).limit(1);
    return result[0];
  }

  async createOrUpdateRestartSession(data: InsertRestartSession): Promise<RestartSession> {
    const sessionData = {
      ...data,
      id: "singleton", // Always use singleton ID
      updatedAt: new Date(),
    };

    // Use UPSERT (INSERT ... ON CONFLICT DO UPDATE) to avoid race conditions
    const result = await db.insert(restartSessions)
      .values(sessionData)
      .onConflictDoUpdate({
        target: restartSessions.id,
        set: {
          ...sessionData,
          updatedAt: new Date(),
        },
      })
      .returning();
    
    return result[0];
  }

  async clearRestartSession(): Promise<void> {
    await db.delete(restartSessions).where(eq(restartSessions.id, "singleton"));
  }

  // ============================================
  // STAKING INFRASTRUCTURE IMPLEMENTATION
  // ============================================

  // Staking Pools
  async getAllStakingPools(): Promise<StakingPool[]> {
    return db.select().from(stakingPools).orderBy(desc(stakingPools.createdAt));
  }

  async getStakingPoolById(id: string): Promise<StakingPool | undefined> {
    const result = await db.select().from(stakingPools).where(eq(stakingPools.id, id)).limit(1);
    return result[0];
  }

  async getStakingPoolsByType(poolType: string): Promise<StakingPool[]> {
    return db.select().from(stakingPools).where(eq(stakingPools.poolType, poolType));
  }

  async createStakingPool(data: InsertStakingPool): Promise<StakingPool> {
    const result = await db.insert(stakingPools).values(data).returning();
    return result[0];
  }

  async updateStakingPool(id: string, data: Partial<StakingPool>): Promise<void> {
    await db.update(stakingPools).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(stakingPools.id, id));
  }

  // Staking Positions
  async getAllStakingPositions(limit: number = 100): Promise<StakingPosition[]> {
    return db.select().from(stakingPositions).orderBy(desc(stakingPositions.createdAt)).limit(limit);
  }

  async getStakingPositionById(id: string): Promise<StakingPosition | undefined> {
    const result = await db.select().from(stakingPositions).where(eq(stakingPositions.id, id)).limit(1);
    return result[0];
  }

  async getStakingPositionsByAddress(address: string): Promise<StakingPosition[]> {
    return db.select().from(stakingPositions).where(eq(stakingPositions.stakerAddress, address));
  }

  async getStakingPositionsByPool(poolId: string): Promise<StakingPosition[]> {
    return db.select().from(stakingPositions).where(eq(stakingPositions.poolId, poolId));
  }

  async createStakingPosition(data: InsertStakingPosition): Promise<StakingPosition> {
    const result = await db.insert(stakingPositions).values(data).returning();
    return result[0];
  }

  async updateStakingPosition(id: string, data: Partial<StakingPosition>): Promise<void> {
    await db.update(stakingPositions).set({
      ...data,
      updatedAt: new Date(),
      lastActionAt: new Date(),
    }).where(eq(stakingPositions.id, id));
  }

  // Staking Delegations
  async getAllStakingDelegations(limit: number = 100): Promise<StakingDelegation[]> {
    return db.select().from(stakingDelegations).orderBy(desc(stakingDelegations.createdAt)).limit(limit);
  }

  async getStakingDelegationById(id: string): Promise<StakingDelegation | undefined> {
    const result = await db.select().from(stakingDelegations).where(eq(stakingDelegations.id, id)).limit(1);
    return result[0];
  }

  async getStakingDelegationsByAddress(address: string): Promise<StakingDelegation[]> {
    return db.select().from(stakingDelegations).where(eq(stakingDelegations.delegatorAddress, address));
  }

  async getStakingDelegationsByValidator(validatorId: string): Promise<StakingDelegation[]> {
    return db.select().from(stakingDelegations).where(eq(stakingDelegations.validatorId, validatorId));
  }

  async createStakingDelegation(data: InsertStakingDelegation): Promise<StakingDelegation> {
    const result = await db.insert(stakingDelegations).values(data).returning();
    return result[0];
  }

  async updateStakingDelegation(id: string, data: Partial<StakingDelegation>): Promise<void> {
    await db.update(stakingDelegations).set({
      ...data,
      updatedAt: new Date(),
      lastActionAt: new Date(),
    }).where(eq(stakingDelegations.id, id));
  }

  // Unbonding Requests
  async getAllUnbondingRequests(limit: number = 100): Promise<UnbondingRequest[]> {
    return db.select().from(unbondingRequests).orderBy(desc(unbondingRequests.createdAt)).limit(limit);
  }

  async getUnbondingRequestById(id: string): Promise<UnbondingRequest | undefined> {
    const result = await db.select().from(unbondingRequests).where(eq(unbondingRequests.id, id)).limit(1);
    return result[0];
  }

  async getUnbondingRequestsByAddress(address: string): Promise<UnbondingRequest[]> {
    return db.select().from(unbondingRequests).where(eq(unbondingRequests.delegatorAddress, address));
  }

  async createUnbondingRequest(data: InsertUnbondingRequest): Promise<UnbondingRequest> {
    const result = await db.insert(unbondingRequests).values(data).returning();
    return result[0];
  }

  async updateUnbondingRequest(id: string, data: Partial<UnbondingRequest>): Promise<void> {
    await db.update(unbondingRequests).set(data).where(eq(unbondingRequests.id, id));
  }

  // Reward Cycles
  async getAllRewardCycles(limit: number = 50): Promise<RewardCycle[]> {
    return db.select().from(rewardCycles).orderBy(desc(rewardCycles.cycleNumber)).limit(limit);
  }

  async getCurrentRewardCycle(): Promise<RewardCycle | undefined> {
    const result = await db.select().from(rewardCycles).where(eq(rewardCycles.status, "active")).limit(1);
    return result[0];
  }

  async getRewardCycleById(id: string): Promise<RewardCycle | undefined> {
    const result = await db.select().from(rewardCycles).where(eq(rewardCycles.id, id)).limit(1);
    return result[0];
  }

  async createRewardCycle(data: InsertRewardCycle): Promise<RewardCycle> {
    const result = await db.insert(rewardCycles).values(data).returning();
    return result[0];
  }

  async updateRewardCycle(id: string, data: Partial<RewardCycle>): Promise<void> {
    await db.update(rewardCycles).set(data).where(eq(rewardCycles.id, id));
  }

  // Reward Events
  async getRewardEventsByAddress(address: string, limit: number = 100): Promise<RewardEvent[]> {
    return db.select().from(rewardEvents).where(eq(rewardEvents.recipientAddress, address)).orderBy(desc(rewardEvents.createdAt)).limit(limit);
  }

  async getRewardEventsByCycle(cycleId: string): Promise<RewardEvent[]> {
    return db.select().from(rewardEvents).where(eq(rewardEvents.cycleId, cycleId));
  }

  async createRewardEvent(data: InsertRewardEvent): Promise<RewardEvent> {
    const result = await db.insert(rewardEvents).values(data).returning();
    return result[0];
  }

  async updateRewardEvent(id: string, data: Partial<RewardEvent>): Promise<void> {
    await db.update(rewardEvents).set(data).where(eq(rewardEvents.id, id));
  }

  // Slashing Events
  async getAllSlashingEvents(limit: number = 50): Promise<SlashingEvent[]> {
    return db.select().from(slashingEvents).orderBy(desc(slashingEvents.createdAt)).limit(limit);
  }

  async getSlashingEventsByValidator(validatorId: string): Promise<SlashingEvent[]> {
    return db.select().from(slashingEvents).where(eq(slashingEvents.validatorId, validatorId));
  }

  async createSlashingEvent(data: InsertSlashingEvent): Promise<SlashingEvent> {
    const result = await db.insert(slashingEvents).values(data).returning();
    return result[0];
  }

  // Staking Stats
  async getStakingStats(): Promise<StakingStats | undefined> {
    const result = await db.select().from(stakingStatsTable).where(eq(stakingStatsTable.id, "singleton")).limit(1);
    return result[0];
  }

  async updateStakingStats(data: Partial<StakingStats>): Promise<void> {
    await db.update(stakingStatsTable).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(stakingStatsTable.id, "singleton"));
  }

  // ============================================
  // ENTERPRISE STAKING v2.0 IMPLEMENTATIONS
  // ============================================

  // Tier Configuration
  async getAllStakingTierConfigs(): Promise<StakingTierConfig[]> {
    return await db.select().from(stakingTierConfig).orderBy(stakingTierConfig.minLockDays);
  }

  async getStakingTierConfig(tier: string): Promise<StakingTierConfig | undefined> {
    const [config] = await db.select().from(stakingTierConfig).where(eq(stakingTierConfig.tier, tier));
    return config;
  }

  async updateStakingTierConfig(id: string, data: Partial<StakingTierConfig>): Promise<void> {
    await db.update(stakingTierConfig).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(stakingTierConfig.id, id));
  }

  // Pool Validator Assignments
  async getPoolValidatorAssignments(poolId: string): Promise<PoolValidatorAssignment[]> {
    return await db.select().from(poolValidatorAssignments).where(eq(poolValidatorAssignments.poolId, poolId));
  }

  async getValidatorPoolAssignments(validatorId: string): Promise<PoolValidatorAssignment[]> {
    return await db.select().from(poolValidatorAssignments).where(eq(poolValidatorAssignments.validatorId, validatorId));
  }

  async createPoolValidatorAssignment(data: InsertPoolValidatorAssignment): Promise<PoolValidatorAssignment> {
    const [result] = await db.insert(poolValidatorAssignments).values({
      ...data,
      id: `pva-${randomUUID()}`,
    }).returning();
    return result;
  }

  async updatePoolValidatorAssignment(id: string, data: Partial<PoolValidatorAssignment>): Promise<void> {
    await db.update(poolValidatorAssignments).set(data).where(eq(poolValidatorAssignments.id, id));
  }

  // Audit Logs
  async getStakingAuditLogs(filters: { targetType?: string; targetId?: string; action?: string; limit?: number }): Promise<StakingAuditLog[]> {
    let query = db.select().from(stakingAuditLogs);
    
    if (filters.targetType && filters.targetId) {
      query = query.where(eq(stakingAuditLogs.targetType, filters.targetType));
    }
    
    if (filters.action) {
      query = query.where(eq(stakingAuditLogs.action, filters.action));
    }
    
    return await query.orderBy(desc(stakingAuditLogs.createdAt)).limit(filters.limit || 100);
  }

  async createStakingAuditLog(data: InsertStakingAuditLog): Promise<StakingAuditLog> {
    const [result] = await db.insert(stakingAuditLogs).values({
      ...data,
      id: `audit-${randomUUID()}`,
    }).returning();
    return result;
  }

  // Snapshots
  async getStakingSnapshots(type?: string, limit?: number): Promise<StakingSnapshot[]> {
    let query = db.select().from(stakingSnapshots);
    
    if (type) {
      query = query.where(eq(stakingSnapshots.snapshotType, type));
    }
    
    return await query.orderBy(desc(stakingSnapshots.snapshotAt)).limit(limit || 50);
  }

  async createStakingSnapshot(data: InsertStakingSnapshot): Promise<StakingSnapshot> {
    const [result] = await db.insert(stakingSnapshots).values({
      ...data,
      id: `snap-${randomUUID()}`,
    }).returning();
    return result;
  }

  // AI Risk Assessments
  async getActiveStakingAiAssessments(targetType: string, targetId: string): Promise<StakingAiAssessment[]> {
    return await db.select().from(stakingAiAssessments)
      .where(and(
        eq(stakingAiAssessments.targetType, targetType),
        eq(stakingAiAssessments.targetId, targetId),
        eq(stakingAiAssessments.isActive, true)
      ))
      .orderBy(desc(stakingAiAssessments.assessedAt));
  }

  async createStakingAiAssessment(data: InsertStakingAiAssessment): Promise<StakingAiAssessment> {
    const [result] = await db.insert(stakingAiAssessments).values({
      ...data,
      id: `ai-assess-${randomUUID()}`,
    }).returning();
    return result;
  }

  async deactivateStakingAiAssessments(targetType: string, targetId: string): Promise<void> {
    await db.update(stakingAiAssessments)
      .set({ isActive: false })
      .where(and(
        eq(stakingAiAssessments.targetType, targetType),
        eq(stakingAiAssessments.targetId, targetId)
      ));
  }

  // Validator Integration
  async getValidatorWithStakingMetrics(validatorId: string): Promise<Validator & { stakingMetrics: any } | undefined> {
    const [validator] = await db.select().from(validators).where(eq(validators.id, validatorId));
    if (!validator) return undefined;

    const delegationsList = await db.select().from(stakingDelegations)
      .where(and(
        eq(stakingDelegations.validatorId, validatorId),
        eq(stakingDelegations.status, "active")
      ));
    
    const poolAssignments = await this.getValidatorPoolAssignments(validatorId);
    
    return {
      ...validator,
      stakingMetrics: {
        activeDelegations: delegationsList.length,
        totalDelegated: delegationsList.reduce((sum: bigint, d: StakingDelegation) => sum + BigInt(d.amount), BigInt(0)).toString(),
        poolsAssigned: poolAssignments.length,
        averageCommission: validator.commission,
        uptimeScore: validator.uptime,
        aiTrustScore: validator.aiTrustScore,
      },
    };
  }

  async getTopValidatorsForStaking(limit?: number): Promise<Validator[]> {
    return await db.select().from(validators)
      .where(eq(validators.status, "active"))
      .orderBy(desc(validators.aiTrustScore), desc(validators.uptime), desc(validators.apy))
      .limit(limit || 10);
  }

  // ============================================
  // DEX/AMM INFRASTRUCTURE v1.0 IMPLEMENTATIONS
  // ============================================

  // DEX Pools
  async getAllDexPools(limit: number = 100): Promise<DexPool[]> {
    return await db.select().from(dexPools).orderBy(desc(dexPools.tvlUsd)).limit(limit);
  }

  async getDexPoolById(id: string): Promise<DexPool | undefined> {
    const [pool] = await db.select().from(dexPools).where(eq(dexPools.id, id));
    return pool;
  }

  async getDexPoolByAddress(contractAddress: string): Promise<DexPool | undefined> {
    const [pool] = await db.select().from(dexPools).where(eq(dexPools.contractAddress, contractAddress));
    return pool;
  }

  async getDexPoolsByType(poolType: string): Promise<DexPool[]> {
    return await db.select().from(dexPools).where(eq(dexPools.poolType, poolType)).orderBy(desc(dexPools.tvlUsd));
  }

  async getDexPoolsByStatus(status: string): Promise<DexPool[]> {
    return await db.select().from(dexPools).where(eq(dexPools.status, status)).orderBy(desc(dexPools.tvlUsd));
  }

  async createDexPool(data: InsertDexPool): Promise<DexPool> {
    const [result] = await db.insert(dexPools).values({
      ...data,
      id: `pool-${randomUUID()}`,
    }).returning();
    return result;
  }

  async updateDexPool(id: string, data: Partial<DexPool>): Promise<void> {
    await db.update(dexPools).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(dexPools.id, id));
  }

  async getTopDexPoolsByTvl(limit: number = 10): Promise<DexPool[]> {
    return await db.select().from(dexPools)
      .where(eq(dexPools.status, "active"))
      .orderBy(desc(dexPools.tvlUsd))
      .limit(limit);
  }

  async getTopDexPoolsByVolume(limit: number = 10): Promise<DexPool[]> {
    return await db.select().from(dexPools)
      .where(eq(dexPools.status, "active"))
      .orderBy(desc(dexPools.volume24h))
      .limit(limit);
  }

  // DEX Pool Assets
  async getDexPoolAssets(poolId: string): Promise<DexPoolAsset[]> {
    return await db.select().from(dexPoolAssets)
      .where(eq(dexPoolAssets.poolId, poolId))
      .orderBy(dexPoolAssets.assetIndex);
  }

  async createDexPoolAsset(data: InsertDexPoolAsset): Promise<DexPoolAsset> {
    const [result] = await db.insert(dexPoolAssets).values({
      ...data,
      id: `asset-${randomUUID()}`,
    }).returning();
    return result;
  }

  async updateDexPoolAsset(id: string, data: Partial<DexPoolAsset>): Promise<void> {
    await db.update(dexPoolAssets).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(dexPoolAssets.id, id));
  }

  // DEX Pool Ticks
  async getDexPoolTicks(poolId: string): Promise<DexPoolTick[]> {
    return await db.select().from(dexPoolTicks)
      .where(eq(dexPoolTicks.poolId, poolId))
      .orderBy(dexPoolTicks.tickIndex);
  }

  async getDexPoolTickByIndex(poolId: string, tickIndex: number): Promise<DexPoolTick | undefined> {
    const [tick] = await db.select().from(dexPoolTicks)
      .where(eq(dexPoolTicks.poolId, poolId));
    if (tick && tick.tickIndex === tickIndex) return tick;
    return undefined;
  }

  async createDexPoolTick(data: InsertDexPoolTick): Promise<DexPoolTick> {
    const [result] = await db.insert(dexPoolTicks).values({
      ...data,
      id: `tick-${randomUUID()}`,
    }).returning();
    return result;
  }

  async updateDexPoolTick(id: string, data: Partial<DexPoolTick>): Promise<void> {
    await db.update(dexPoolTicks).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(dexPoolTicks.id, id));
  }

  // DEX Positions
  async getAllDexPositions(limit: number = 100): Promise<DexPosition[]> {
    return await db.select().from(dexPositions).orderBy(desc(dexPositions.createdAt)).limit(limit);
  }

  async getDexPositionById(id: string): Promise<DexPosition | undefined> {
    const [position] = await db.select().from(dexPositions).where(eq(dexPositions.id, id));
    return position;
  }

  async getDexPositionsByOwner(ownerAddress: string): Promise<DexPosition[]> {
    return await db.select().from(dexPositions)
      .where(eq(dexPositions.ownerAddress, ownerAddress))
      .orderBy(desc(dexPositions.createdAt));
  }

  async getDexPositionsByPool(poolId: string): Promise<DexPosition[]> {
    return await db.select().from(dexPositions)
      .where(eq(dexPositions.poolId, poolId))
      .orderBy(desc(dexPositions.valueUsd));
  }

  async getActiveDexPositions(ownerAddress: string): Promise<DexPosition[]> {
    return await db.select().from(dexPositions)
      .where(and(
        eq(dexPositions.ownerAddress, ownerAddress),
        eq(dexPositions.status, "active")
      ))
      .orderBy(desc(dexPositions.valueUsd));
  }

  async createDexPosition(data: InsertDexPosition): Promise<DexPosition> {
    const [result] = await db.insert(dexPositions).values({
      ...data,
      id: `pos-${randomUUID()}`,
    }).returning();
    return result;
  }

  async updateDexPosition(id: string, data: Partial<DexPosition>): Promise<void> {
    await db.update(dexPositions).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(dexPositions.id, id));
  }

  async closeDexPosition(id: string): Promise<void> {
    await db.update(dexPositions).set({
      status: "closed",
      closedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(dexPositions.id, id));
  }

  // DEX Swaps
  async getAllDexSwaps(limit: number = 100): Promise<DexSwap[]> {
    return await db.select().from(dexSwaps).orderBy(desc(dexSwaps.createdAt)).limit(limit);
  }

  async getDexSwapById(id: string): Promise<DexSwap | undefined> {
    const [swap] = await db.select().from(dexSwaps).where(eq(dexSwaps.id, id));
    return swap;
  }

  async getDexSwapByTxHash(txHash: string): Promise<DexSwap | undefined> {
    const [swap] = await db.select().from(dexSwaps).where(eq(dexSwaps.txHash, txHash));
    return swap;
  }

  async getDexSwapsByPool(poolId: string, limit: number = 100): Promise<DexSwap[]> {
    return await db.select().from(dexSwaps)
      .where(eq(dexSwaps.poolId, poolId))
      .orderBy(desc(dexSwaps.createdAt))
      .limit(limit);
  }

  async getDexSwapsByTrader(traderAddress: string, limit: number = 100): Promise<DexSwap[]> {
    return await db.select().from(dexSwaps)
      .where(eq(dexSwaps.traderAddress, traderAddress))
      .orderBy(desc(dexSwaps.createdAt))
      .limit(limit);
  }

  async getRecentDexSwaps(limit: number = 50): Promise<DexSwap[]> {
    return await db.select().from(dexSwaps)
      .where(eq(dexSwaps.status, "completed"))
      .orderBy(desc(dexSwaps.completedAt))
      .limit(limit);
  }

  async createDexSwap(data: InsertDexSwap): Promise<DexSwap> {
    const [result] = await db.insert(dexSwaps).values({
      ...data,
      id: `swap-${randomUUID()}`,
    }).returning();
    return result;
  }

  async updateDexSwap(id: string, data: Partial<DexSwap>): Promise<void> {
    await db.update(dexSwaps).set(data).where(eq(dexSwaps.id, id));
  }

  // DEX Price History
  async getDexPriceHistory(poolId: string, interval: string, limit: number = 100): Promise<DexPriceHistory[]> {
    return await db.select().from(dexPriceHistory)
      .where(and(
        eq(dexPriceHistory.poolId, poolId),
        eq(dexPriceHistory.interval, interval)
      ))
      .orderBy(desc(dexPriceHistory.periodStart))
      .limit(limit);
  }

  async getLatestDexPrice(poolId: string): Promise<DexPriceHistory | undefined> {
    const [price] = await db.select().from(dexPriceHistory)
      .where(eq(dexPriceHistory.poolId, poolId))
      .orderBy(desc(dexPriceHistory.periodEnd))
      .limit(1);
    return price;
  }

  async createDexPriceHistory(data: InsertDexPriceHistory): Promise<DexPriceHistory> {
    const [result] = await db.insert(dexPriceHistory).values({
      ...data,
      id: `price-${randomUUID()}`,
    }).returning();
    return result;
  }

  // DEX TWAP Oracle
  async getDexTwapObservations(poolId: string, limit: number = 100): Promise<DexTwapOracle[]> {
    return await db.select().from(dexTwapOracle)
      .where(eq(dexTwapOracle.poolId, poolId))
      .orderBy(desc(dexTwapOracle.blockTimestamp))
      .limit(limit);
  }

  async getLatestDexTwapObservation(poolId: string): Promise<DexTwapOracle | undefined> {
    const [observation] = await db.select().from(dexTwapOracle)
      .where(eq(dexTwapOracle.poolId, poolId))
      .orderBy(desc(dexTwapOracle.blockTimestamp))
      .limit(1);
    return observation;
  }

  async createDexTwapObservation(data: InsertDexTwapOracle): Promise<DexTwapOracle> {
    const [result] = await db.insert(dexTwapOracle).values({
      ...data,
      id: `twap-${randomUUID()}`,
    }).returning();
    return result;
  }

  // DEX Circuit Breakers
  async getDexCircuitBreaker(poolId: string): Promise<DexCircuitBreaker | undefined> {
    const [breaker] = await db.select().from(dexCircuitBreakers).where(eq(dexCircuitBreakers.poolId, poolId));
    return breaker;
  }

  async getAllDexCircuitBreakers(): Promise<DexCircuitBreaker[]> {
    return await db.select().from(dexCircuitBreakers).orderBy(desc(dexCircuitBreakers.updatedAt));
  }

  async getTriggeredDexCircuitBreakers(): Promise<DexCircuitBreaker[]> {
    return await db.select().from(dexCircuitBreakers).where(eq(dexCircuitBreakers.status, "triggered"));
  }

  async createDexCircuitBreaker(data: InsertDexCircuitBreaker): Promise<DexCircuitBreaker> {
    const [result] = await db.insert(dexCircuitBreakers).values({
      ...data,
      id: `cb-${randomUUID()}`,
    }).returning();
    return result;
  }

  async updateDexCircuitBreaker(poolId: string, data: Partial<DexCircuitBreaker>): Promise<void> {
    await db.update(dexCircuitBreakers).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(dexCircuitBreakers.poolId, poolId));
  }

  // DEX MEV Events
  async getAllDexMevEvents(limit: number = 100): Promise<DexMevEvent[]> {
    return await db.select().from(dexMevEvents).orderBy(desc(dexMevEvents.createdAt)).limit(limit);
  }

  async getDexMevEventsByPool(poolId: string, limit: number = 50): Promise<DexMevEvent[]> {
    return await db.select().from(dexMevEvents)
      .where(eq(dexMevEvents.poolId, poolId))
      .orderBy(desc(dexMevEvents.createdAt))
      .limit(limit);
  }

  async getRecentDexMevEvents(limit: number = 20): Promise<DexMevEvent[]> {
    return await db.select().from(dexMevEvents)
      .orderBy(desc(dexMevEvents.createdAt))
      .limit(limit);
  }

  async createDexMevEvent(data: InsertDexMevEvent): Promise<DexMevEvent> {
    const [result] = await db.insert(dexMevEvents).values({
      ...data,
      id: `mev-${randomUUID()}`,
    }).returning();
    return result;
  }

  async updateDexMevEvent(id: string, data: Partial<DexMevEvent>): Promise<void> {
    await db.update(dexMevEvents).set(data).where(eq(dexMevEvents.id, id));
  }

  // DEX Liquidity Rewards
  async getDexLiquidityRewards(poolId: string): Promise<DexLiquidityReward[]> {
    return await db.select().from(dexLiquidityRewards)
      .where(eq(dexLiquidityRewards.poolId, poolId))
      .orderBy(desc(dexLiquidityRewards.startTime));
  }

  async getActiveDexLiquidityRewards(poolId: string): Promise<DexLiquidityReward[]> {
    return await db.select().from(dexLiquidityRewards)
      .where(and(
        eq(dexLiquidityRewards.poolId, poolId),
        eq(dexLiquidityRewards.isActive, true)
      ));
  }

  async createDexLiquidityReward(data: InsertDexLiquidityReward): Promise<DexLiquidityReward> {
    const [result] = await db.insert(dexLiquidityRewards).values({
      ...data,
      id: `reward-${randomUUID()}`,
    }).returning();
    return result;
  }

  async updateDexLiquidityReward(id: string, data: Partial<DexLiquidityReward>): Promise<void> {
    await db.update(dexLiquidityRewards).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(dexLiquidityRewards.id, id));
  }

  // DEX User Analytics
  async getDexUserAnalytics(userAddress: string): Promise<DexUserAnalytics | undefined> {
    const [analytics] = await db.select().from(dexUserAnalytics)
      .where(eq(dexUserAnalytics.userAddress, userAddress));
    return analytics;
  }

  async getTopDexTraders(limit: number = 20): Promise<DexUserAnalytics[]> {
    return await db.select().from(dexUserAnalytics)
      .orderBy(desc(dexUserAnalytics.totalVolumeUsd))
      .limit(limit);
  }

  async getTopDexLiquidityProviders(limit: number = 20): Promise<DexUserAnalytics[]> {
    return await db.select().from(dexUserAnalytics)
      .orderBy(desc(dexUserAnalytics.totalLiquidityProvidedUsd))
      .limit(limit);
  }

  async createDexUserAnalytics(data: InsertDexUserAnalytics): Promise<DexUserAnalytics> {
    const [result] = await db.insert(dexUserAnalytics).values({
      ...data,
      id: `user-${randomUUID()}`,
    }).returning();
    return result;
  }

  async updateDexUserAnalytics(userAddress: string, data: Partial<DexUserAnalytics>): Promise<void> {
    await db.update(dexUserAnalytics).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(dexUserAnalytics.userAddress, userAddress));
  }

  // DEX Aggregated Stats
  async getDexStats(): Promise<{
    totalPools: number;
    totalTvlUsd: string;
    totalVolume24h: string;
    totalFees24h: string;
    totalSwaps24h: number;
    totalLiquidityProviders: number;
  }> {
    const pools = await db.select().from(dexPools).where(eq(dexPools.status, "active"));
    
    let totalTvl = BigInt(0);
    let totalVolume = BigInt(0);
    let totalFees = BigInt(0);
    let totalSwaps = 0;
    const lpAddresses = new Set<string>();
    
    for (const pool of pools) {
      totalTvl += BigInt(pool.tvlUsd.replace(/\./g, '') || "0");
      totalVolume += BigInt(pool.volume24h.replace(/\./g, '') || "0");
      totalFees += BigInt(pool.fees24h.replace(/\./g, '') || "0");
      totalSwaps += pool.swapCount24h;
    }
    
    const positions = await db.select().from(dexPositions).where(eq(dexPositions.status, "active"));
    positions.forEach((pos: DexPosition) => lpAddresses.add(pos.ownerAddress));
    
    return {
      totalPools: pools.length,
      totalTvlUsd: totalTvl.toString(),
      totalVolume24h: totalVolume.toString(),
      totalFees24h: totalFees.toString(),
      totalSwaps24h: totalSwaps,
      totalLiquidityProviders: lpAddresses.size,
    };
  }

  // ============================================
  // LENDING/BORROWING INFRASTRUCTURE v1.0 IMPLEMENTATIONS
  // ============================================

  // Lending Markets
  async getAllLendingMarkets(): Promise<LendingMarket[]> {
    return await db.select().from(lendingMarkets).orderBy(desc(lendingMarkets.totalSupply));
  }

  async getActiveLendingMarkets(): Promise<LendingMarket[]> {
    return await db.select().from(lendingMarkets)
      .where(eq(lendingMarkets.status, "active"))
      .orderBy(desc(lendingMarkets.totalSupply));
  }

  async getLendingMarketById(id: string): Promise<LendingMarket | undefined> {
    const [market] = await db.select().from(lendingMarkets).where(eq(lendingMarkets.id, id));
    return market;
  }

  async getLendingMarketByAsset(assetAddress: string): Promise<LendingMarket | undefined> {
    const [market] = await db.select().from(lendingMarkets)
      .where(eq(lendingMarkets.assetAddress, assetAddress));
    return market;
  }

  async createLendingMarket(data: InsertLendingMarket): Promise<LendingMarket> {
    const [result] = await db.insert(lendingMarkets).values({
      ...data,
      id: `market-${randomUUID()}`,
    }).returning();
    return result;
  }

  async updateLendingMarket(id: string, data: Partial<LendingMarket>): Promise<void> {
    await db.update(lendingMarkets).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(lendingMarkets.id, id));
  }

  // Lending Positions
  async getAllLendingPositions(): Promise<LendingPosition[]> {
    return await db.select().from(lendingPositions).orderBy(desc(lendingPositions.totalCollateralValueUsd));
  }

  async getLendingPositionByUser(userAddress: string): Promise<LendingPosition | undefined> {
    const [position] = await db.select().from(lendingPositions)
      .where(eq(lendingPositions.userAddress, userAddress));
    return position;
  }

  async getLendingPositionById(id: string): Promise<LendingPosition | undefined> {
    const [position] = await db.select().from(lendingPositions).where(eq(lendingPositions.id, id));
    return position;
  }

  async getLiquidatablePositions(): Promise<LendingPosition[]> {
    return await db.select().from(lendingPositions)
      .where(eq(lendingPositions.healthStatus, "liquidatable"))
      .orderBy(lendingPositions.healthFactor);
  }

  async getAtRiskPositions(): Promise<LendingPosition[]> {
    return await db.select().from(lendingPositions)
      .where(eq(lendingPositions.healthStatus, "at_risk"))
      .orderBy(lendingPositions.healthFactor);
  }

  async createLendingPosition(data: InsertLendingPosition): Promise<LendingPosition> {
    const [result] = await db.insert(lendingPositions).values({
      ...data,
      id: `pos-${randomUUID()}`,
    }).returning();
    return result;
  }

  async updateLendingPosition(userAddress: string, data: Partial<LendingPosition>): Promise<void> {
    await db.update(lendingPositions).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(lendingPositions.userAddress, userAddress));
  }

  // Lending Supplies
  async getLendingSuppliesByUser(userAddress: string): Promise<LendingSupply[]> {
    return await db.select().from(lendingSupplies)
      .where(eq(lendingSupplies.userAddress, userAddress));
  }

  async getLendingSuppliesByMarket(marketId: string): Promise<LendingSupply[]> {
    return await db.select().from(lendingSupplies)
      .where(eq(lendingSupplies.marketId, marketId));
  }

  async getLendingSupply(userAddress: string, marketId: string): Promise<LendingSupply | undefined> {
    const [supply] = await db.select().from(lendingSupplies)
      .where(and(
        eq(lendingSupplies.userAddress, userAddress),
        eq(lendingSupplies.marketId, marketId)
      ));
    return supply;
  }

  async createLendingSupply(data: InsertLendingSupply): Promise<LendingSupply> {
    const [result] = await db.insert(lendingSupplies).values({
      ...data,
      id: `supply-${randomUUID()}`,
    }).returning();
    return result;
  }

  async updateLendingSupply(id: string, data: Partial<LendingSupply>): Promise<void> {
    await db.update(lendingSupplies).set({
      ...data,
      lastUpdateAt: new Date(),
    }).where(eq(lendingSupplies.id, id));
  }

  async deleteLendingSupply(id: string): Promise<void> {
    await db.delete(lendingSupplies).where(eq(lendingSupplies.id, id));
  }

  // Lending Borrows
  async getLendingBorrowsByUser(userAddress: string): Promise<LendingBorrow[]> {
    return await db.select().from(lendingBorrows)
      .where(eq(lendingBorrows.userAddress, userAddress));
  }

  async getLendingBorrowsByMarket(marketId: string): Promise<LendingBorrow[]> {
    return await db.select().from(lendingBorrows)
      .where(eq(lendingBorrows.marketId, marketId));
  }

  async getLendingBorrow(userAddress: string, marketId: string): Promise<LendingBorrow | undefined> {
    const [borrow] = await db.select().from(lendingBorrows)
      .where(and(
        eq(lendingBorrows.userAddress, userAddress),
        eq(lendingBorrows.marketId, marketId)
      ));
    return borrow;
  }

  async createLendingBorrow(data: InsertLendingBorrow): Promise<LendingBorrow> {
    const [result] = await db.insert(lendingBorrows).values({
      ...data,
      id: `borrow-${randomUUID()}`,
    }).returning();
    return result;
  }

  async updateLendingBorrow(id: string, data: Partial<LendingBorrow>): Promise<void> {
    await db.update(lendingBorrows).set({
      ...data,
      lastUpdateAt: new Date(),
    }).where(eq(lendingBorrows.id, id));
  }

  async deleteLendingBorrow(id: string): Promise<void> {
    await db.delete(lendingBorrows).where(eq(lendingBorrows.id, id));
  }

  // Lending Liquidations
  async getAllLendingLiquidations(limit: number = 100): Promise<LendingLiquidation[]> {
    return await db.select().from(lendingLiquidations)
      .orderBy(desc(lendingLiquidations.executedAt))
      .limit(limit);
  }

  async getLendingLiquidationsByBorrower(borrowerAddress: string): Promise<LendingLiquidation[]> {
    return await db.select().from(lendingLiquidations)
      .where(eq(lendingLiquidations.borrowerAddress, borrowerAddress))
      .orderBy(desc(lendingLiquidations.executedAt));
  }

  async getLendingLiquidationsByLiquidator(liquidatorAddress: string): Promise<LendingLiquidation[]> {
    return await db.select().from(lendingLiquidations)
      .where(eq(lendingLiquidations.liquidatorAddress, liquidatorAddress))
      .orderBy(desc(lendingLiquidations.executedAt));
  }

  async getRecentLendingLiquidations(limit: number = 20): Promise<LendingLiquidation[]> {
    return await db.select().from(lendingLiquidations)
      .orderBy(desc(lendingLiquidations.executedAt))
      .limit(limit);
  }

  async createLendingLiquidation(data: InsertLendingLiquidation): Promise<LendingLiquidation> {
    const [result] = await db.insert(lendingLiquidations).values({
      ...data,
      id: `liq-${randomUUID()}`,
    }).returning();
    return result;
  }

  // Lending Rate History
  async getLendingRateHistory(marketId: string, limit: number = 100): Promise<LendingRateHistory[]> {
    return await db.select().from(lendingRateHistory)
      .where(eq(lendingRateHistory.marketId, marketId))
      .orderBy(desc(lendingRateHistory.recordedAt))
      .limit(limit);
  }

  async createLendingRateHistory(data: InsertLendingRateHistory): Promise<LendingRateHistory> {
    const [result] = await db.insert(lendingRateHistory).values({
      ...data,
      id: `rate-${randomUUID()}`,
    }).returning();
    return result;
  }

  // Lending Transactions
  async getAllLendingTransactions(limit: number = 100): Promise<LendingTransaction[]> {
    return await db.select().from(lendingTransactions)
      .orderBy(desc(lendingTransactions.createdAt))
      .limit(limit);
  }

  async getLendingTransactionsByUser(userAddress: string, limit: number = 50): Promise<LendingTransaction[]> {
    return await db.select().from(lendingTransactions)
      .where(eq(lendingTransactions.userAddress, userAddress))
      .orderBy(desc(lendingTransactions.createdAt))
      .limit(limit);
  }

  async getLendingTransactionsByMarket(marketId: string, limit: number = 50): Promise<LendingTransaction[]> {
    return await db.select().from(lendingTransactions)
      .where(eq(lendingTransactions.marketId, marketId))
      .orderBy(desc(lendingTransactions.createdAt))
      .limit(limit);
  }

  async getRecentLendingTransactions(limit: number = 20): Promise<LendingTransaction[]> {
    return await db.select().from(lendingTransactions)
      .orderBy(desc(lendingTransactions.createdAt))
      .limit(limit);
  }

  async createLendingTransaction(data: InsertLendingTransaction): Promise<LendingTransaction> {
    const [result] = await db.insert(lendingTransactions).values({
      ...data,
      id: `tx-${randomUUID()}`,
    }).returning();
    return result;
  }

  // Lending Protocol Stats
  async getLendingProtocolStats(): Promise<LendingProtocolStats | undefined> {
    const [stats] = await db.select().from(lendingProtocolStats)
      .orderBy(desc(lendingProtocolStats.snapshotAt))
      .limit(1);
    return stats;
  }

  async createLendingProtocolStats(data: InsertLendingProtocolStats): Promise<LendingProtocolStats> {
    const [result] = await db.insert(lendingProtocolStats).values({
      ...data,
      id: `stats-${randomUUID()}`,
    }).returning();
    return result;
  }

  async updateLendingProtocolStats(id: string, data: Partial<LendingProtocolStats>): Promise<void> {
    await db.update(lendingProtocolStats).set(data).where(eq(lendingProtocolStats.id, id));
  }

  // Lending Risk Methods
  async getAtRiskLendingPositions(healthThreshold: number): Promise<LendingPosition[]> {
    const positions = await db.select().from(lendingPositions);
    return positions.filter(p => p.healthStatus === "at_risk" || (p.healthFactor !== null && p.healthFactor < healthThreshold && p.healthFactor > 10000));
  }

  async getLiquidatableLendingPositions(healthThreshold: number): Promise<LendingPosition[]> {
    const positions = await db.select().from(lendingPositions);
    return positions.filter(p => p.healthStatus === "liquidatable" || (p.healthFactor !== null && p.healthFactor <= healthThreshold));
  }

  // Lending Aggregated Stats
  async getLendingStats(): Promise<{
    totalValueLockedUsd: string;
    totalBorrowedUsd: string;
    totalMarkets: number;
    activeMarkets: number;
    totalUsers: number;
    avgSupplyRate: number;
    avgBorrowRate: number;
    avgUtilization: number;
    liquidations24h: number;
    atRiskPositions: number;
    liquidatablePositions: number;
  }> {
    const markets = await db.select().from(lendingMarkets);
    const activeMarkets = markets.filter(m => m.status === "active");
    const positions = await db.select().from(lendingPositions);
    
    let totalTvl = BigInt(0);
    let totalBorrowed = BigInt(0);
    let totalSupplyRate = 0;
    let totalBorrowRate = 0;
    let totalUtilization = 0;
    
    for (const market of activeMarkets) {
      totalTvl += BigInt(market.totalSupply.replace(/\./g, '') || "0");
      totalBorrowed += BigInt(market.totalBorrowed.replace(/\./g, '') || "0");
      totalSupplyRate += market.supplyRate;
      totalBorrowRate += market.borrowRateVariable;
      totalUtilization += market.utilizationRate;
    }
    
    const avgSupplyRate = activeMarkets.length > 0 ? Math.floor(totalSupplyRate / activeMarkets.length) : 0;
    const avgBorrowRate = activeMarkets.length > 0 ? Math.floor(totalBorrowRate / activeMarkets.length) : 0;
    const avgUtilization = activeMarkets.length > 0 ? Math.floor(totalUtilization / activeMarkets.length) : 0;
    
    const atRiskPositions = positions.filter(p => p.healthStatus === "at_risk").length;
    const liquidatablePositions = positions.filter(p => p.healthStatus === "liquidatable").length;
    
    // Get 24h liquidations count
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentLiquidations = await db.select().from(lendingLiquidations);
    const liquidations24h = recentLiquidations.filter(l => new Date(l.executedAt) >= oneDayAgo).length;
    
    return {
      totalValueLockedUsd: totalTvl.toString(),
      totalBorrowedUsd: totalBorrowed.toString(),
      totalMarkets: markets.length,
      activeMarkets: activeMarkets.length,
      totalUsers: positions.length,
      avgSupplyRate,
      avgBorrowRate,
      avgUtilization,
      liquidations24h,
      atRiskPositions,
      liquidatablePositions,
    };
  }

  // ============================================
  // YIELD FARMING STORAGE IMPLEMENTATION (Phase 3)
  // ============================================

  // Yield Vaults
  async getAllYieldVaults(): Promise<YieldVault[]> {
    return await db.select().from(yieldVaults).orderBy(desc(yieldVaults.tvlUsd));
  }

  async getActiveYieldVaults(): Promise<YieldVault[]> {
    return await db.select().from(yieldVaults).where(eq(yieldVaults.status, "active")).orderBy(desc(yieldVaults.tvlUsd));
  }

  async getYieldVaultById(id: string): Promise<YieldVault | undefined> {
    const [vault] = await db.select().from(yieldVaults).where(eq(yieldVaults.id, id));
    return vault;
  }

  async getYieldVaultByAddress(contractAddress: string): Promise<YieldVault | undefined> {
    const [vault] = await db.select().from(yieldVaults).where(eq(yieldVaults.contractAddress, contractAddress));
    return vault;
  }

  async getYieldVaultsByType(vaultType: string): Promise<YieldVault[]> {
    return await db.select().from(yieldVaults).where(eq(yieldVaults.vaultType, vaultType)).orderBy(desc(yieldVaults.tvlUsd));
  }

  async createYieldVault(data: InsertYieldVault): Promise<YieldVault> {
    const [vault] = await db.insert(yieldVaults).values(data).returning();
    return vault;
  }

  async updateYieldVault(id: string, data: Partial<YieldVault>): Promise<void> {
    await db.update(yieldVaults).set({ ...data, updatedAt: new Date() }).where(eq(yieldVaults.id, id));
  }

  // Yield Strategies
  async getYieldStrategiesByVault(vaultId: string): Promise<YieldStrategy[]> {
    return await db.select().from(yieldStrategies).where(eq(yieldStrategies.vaultId, vaultId));
  }

  async getActiveYieldStrategies(): Promise<YieldStrategy[]> {
    return await db.select().from(yieldStrategies).where(eq(yieldStrategies.isActive, true));
  }

  async getYieldStrategyById(id: string): Promise<YieldStrategy | undefined> {
    const [strategy] = await db.select().from(yieldStrategies).where(eq(yieldStrategies.id, id));
    return strategy;
  }

  async createYieldStrategy(data: InsertYieldStrategy): Promise<YieldStrategy> {
    const [strategy] = await db.insert(yieldStrategies).values(data).returning();
    return strategy;
  }

  async updateYieldStrategy(id: string, data: Partial<YieldStrategy>): Promise<void> {
    await db.update(yieldStrategies).set({ ...data, updatedAt: new Date() }).where(eq(yieldStrategies.id, id));
  }

  // Yield Positions
  async getAllYieldPositions(): Promise<YieldPosition[]> {
    return await db.select().from(yieldPositions);
  }

  async getYieldPositionsByUser(userAddress: string): Promise<YieldPosition[]> {
    return await db.select().from(yieldPositions).where(eq(yieldPositions.userAddress, userAddress));
  }

  async getYieldPositionsByVault(vaultId: string): Promise<YieldPosition[]> {
    return await db.select().from(yieldPositions).where(eq(yieldPositions.vaultId, vaultId));
  }

  async getYieldPosition(userAddress: string, vaultId: string): Promise<YieldPosition | undefined> {
    const [position] = await db.select().from(yieldPositions).where(
      and(eq(yieldPositions.userAddress, userAddress), eq(yieldPositions.vaultId, vaultId))
    );
    return position;
  }

  async getYieldPositionById(id: string): Promise<YieldPosition | undefined> {
    const [position] = await db.select().from(yieldPositions).where(eq(yieldPositions.id, id));
    return position;
  }

  async createYieldPosition(data: InsertYieldPosition): Promise<YieldPosition> {
    const [position] = await db.insert(yieldPositions).values(data).returning();
    return position;
  }

  async updateYieldPosition(id: string, data: Partial<YieldPosition>): Promise<void> {
    await db.update(yieldPositions).set({ ...data, updatedAt: new Date() }).where(eq(yieldPositions.id, id));
  }

  async deleteYieldPosition(id: string): Promise<void> {
    await db.delete(yieldPositions).where(eq(yieldPositions.id, id));
  }

  // Yield Harvests
  async getYieldHarvestsByVault(vaultId: string, limit: number = 50): Promise<YieldHarvest[]> {
    return await db.select().from(yieldHarvests).where(eq(yieldHarvests.vaultId, vaultId)).orderBy(desc(yieldHarvests.executedAt)).limit(limit);
  }

  async getRecentYieldHarvests(limit: number = 50): Promise<YieldHarvest[]> {
    return await db.select().from(yieldHarvests).orderBy(desc(yieldHarvests.executedAt)).limit(limit);
  }

  async createYieldHarvest(data: InsertYieldHarvest): Promise<YieldHarvest> {
    const [harvest] = await db.insert(yieldHarvests).values(data).returning();
    return harvest;
  }

  // Yield Rewards
  async getYieldRewardsByVault(vaultId: string): Promise<YieldReward[]> {
    return await db.select().from(yieldRewards).where(eq(yieldRewards.vaultId, vaultId));
  }

  async getActiveYieldRewards(): Promise<YieldReward[]> {
    return await db.select().from(yieldRewards).where(eq(yieldRewards.isActive, true));
  }

  async createYieldReward(data: InsertYieldReward): Promise<YieldReward> {
    const [reward] = await db.insert(yieldRewards).values(data).returning();
    return reward;
  }

  async updateYieldReward(id: string, data: Partial<YieldReward>): Promise<void> {
    await db.update(yieldRewards).set(data).where(eq(yieldRewards.id, id));
  }

  // Yield Transactions
  async getAllYieldTransactions(limit: number = 100): Promise<YieldTransaction[]> {
    return await db.select().from(yieldTransactions).orderBy(desc(yieldTransactions.createdAt)).limit(limit);
  }

  async getYieldTransactionsByUser(userAddress: string, limit: number = 50): Promise<YieldTransaction[]> {
    return await db.select().from(yieldTransactions).where(eq(yieldTransactions.userAddress, userAddress)).orderBy(desc(yieldTransactions.createdAt)).limit(limit);
  }

  async getYieldTransactionsByVault(vaultId: string, limit: number = 50): Promise<YieldTransaction[]> {
    return await db.select().from(yieldTransactions).where(eq(yieldTransactions.vaultId, vaultId)).orderBy(desc(yieldTransactions.createdAt)).limit(limit);
  }

  async getRecentYieldTransactions(limit: number = 50): Promise<YieldTransaction[]> {
    return await db.select().from(yieldTransactions).orderBy(desc(yieldTransactions.createdAt)).limit(limit);
  }

  async createYieldTransaction(data: InsertYieldTransaction): Promise<YieldTransaction> {
    const [tx] = await db.insert(yieldTransactions).values(data).returning();
    return tx;
  }

  // Yield Protocol Stats
  async getYieldProtocolStats(): Promise<YieldProtocolStats | undefined> {
    const [stats] = await db.select().from(yieldProtocolStats).orderBy(desc(yieldProtocolStats.snapshotAt)).limit(1);
    return stats;
  }

  async createYieldProtocolStats(data: InsertYieldProtocolStats): Promise<YieldProtocolStats> {
    const [stats] = await db.insert(yieldProtocolStats).values(data).returning();
    return stats;
  }

  async updateYieldProtocolStats(id: string, data: Partial<YieldProtocolStats>): Promise<void> {
    await db.update(yieldProtocolStats).set(data).where(eq(yieldProtocolStats.id, id));
  }

  // Yield Farming Aggregated Stats
  async getYieldFarmingStats(): Promise<{
    totalTvlUsd: string;
    totalVaults: number;
    activeVaults: number;
    totalUsers: number;
    avgVaultApy: number;
    topVaultApy: number;
    totalProfitGenerated: string;
    deposits24h: string;
    withdrawals24h: string;
  }> {
    const vaults = await db.select().from(yieldVaults);
    const activeVaults = vaults.filter(v => v.status === "active");
    const positions = await db.select().from(yieldPositions);
    
    let totalTvl = BigInt(0);
    let totalApy = 0;
    let topApy = 0;
    let totalProfit = BigInt(0);
    let deposits24h = BigInt(0);
    let withdrawals24h = BigInt(0);
    
    for (const vault of activeVaults) {
      totalTvl += BigInt(vault.tvlUsd.replace(/\./g, '') || "0");
      totalApy += vault.totalApy;
      if (vault.totalApy > topApy) topApy = vault.totalApy;
      deposits24h += BigInt(vault.deposits24h.replace(/\./g, '') || "0");
      withdrawals24h += BigInt(vault.withdrawals24h.replace(/\./g, '') || "0");
    }
    
    for (const position of positions) {
      totalProfit += BigInt(position.totalProfit.replace(/\./g, '') || "0");
    }
    
    const avgApy = activeVaults.length > 0 ? Math.floor(totalApy / activeVaults.length) : 0;
    const uniqueUsers = new Set(positions.map(p => p.userAddress)).size;
    
    return {
      totalTvlUsd: totalTvl.toString(),
      totalVaults: vaults.length,
      activeVaults: activeVaults.length,
      totalUsers: uniqueUsers,
      avgVaultApy: avgApy,
      topVaultApy: topApy,
      totalProfitGenerated: totalProfit.toString(),
      deposits24h: deposits24h.toString(),
      withdrawals24h: withdrawals24h.toString(),
    };
  }

  // ============================================
  // LIQUID STAKING STORAGE IMPLEMENTATION (Phase 4)
  // ============================================

  // Liquid Staking Pools
  async getAllLiquidStakingPools(): Promise<LiquidStakingPool[]> {
    return await db.select().from(liquidStakingPools).orderBy(desc(liquidStakingPools.totalStakedUsd));
  }

  async getActiveLiquidStakingPools(): Promise<LiquidStakingPool[]> {
    return await db.select().from(liquidStakingPools).where(eq(liquidStakingPools.status, "active")).orderBy(desc(liquidStakingPools.totalStakedUsd));
  }

  async getLiquidStakingPoolById(id: string): Promise<LiquidStakingPool | undefined> {
    const [pool] = await db.select().from(liquidStakingPools).where(eq(liquidStakingPools.id, id));
    return pool;
  }

  async getLiquidStakingPoolByAddress(contractAddress: string): Promise<LiquidStakingPool | undefined> {
    const [pool] = await db.select().from(liquidStakingPools).where(eq(liquidStakingPools.contractAddress, contractAddress));
    return pool;
  }

  async createLiquidStakingPool(data: InsertLiquidStakingPool): Promise<LiquidStakingPool> {
    const [pool] = await db.insert(liquidStakingPools).values(data).returning();
    return pool;
  }

  async updateLiquidStakingPool(id: string, data: Partial<LiquidStakingPool>): Promise<void> {
    await db.update(liquidStakingPools).set({ ...data, updatedAt: new Date() }).where(eq(liquidStakingPools.id, id));
  }

  // Validator Baskets
  async getValidatorBasketsByPool(poolId: string): Promise<ValidatorBasket[]> {
    return await db.select().from(validatorBaskets).where(eq(validatorBaskets.poolId, poolId));
  }

  async getActiveValidatorBaskets(): Promise<ValidatorBasket[]> {
    return await db.select().from(validatorBaskets).where(eq(validatorBaskets.isActive, true));
  }

  async getValidatorBasketById(id: string): Promise<ValidatorBasket | undefined> {
    const [basket] = await db.select().from(validatorBaskets).where(eq(validatorBaskets.id, id));
    return basket;
  }

  async createValidatorBasket(data: InsertValidatorBasket): Promise<ValidatorBasket> {
    const [basket] = await db.insert(validatorBaskets).values(data).returning();
    return basket;
  }

  async updateValidatorBasket(id: string, data: Partial<ValidatorBasket>): Promise<void> {
    await db.update(validatorBaskets).set({ ...data, updatedAt: new Date() }).where(eq(validatorBaskets.id, id));
  }

  // LST Positions
  async getAllLstPositions(): Promise<LstPosition[]> {
    return await db.select().from(lstPositions);
  }

  async getLstPositionsByUser(userAddress: string): Promise<LstPosition[]> {
    return await db.select().from(lstPositions).where(eq(lstPositions.userAddress, userAddress));
  }

  async getLstPositionsByPool(poolId: string): Promise<LstPosition[]> {
    return await db.select().from(lstPositions).where(eq(lstPositions.poolId, poolId));
  }

  async getLstPosition(userAddress: string, poolId: string): Promise<LstPosition | undefined> {
    const [position] = await db.select().from(lstPositions).where(
      and(eq(lstPositions.userAddress, userAddress), eq(lstPositions.poolId, poolId))
    );
    return position;
  }

  async getLstPositionById(id: string): Promise<LstPosition | undefined> {
    const [position] = await db.select().from(lstPositions).where(eq(lstPositions.id, id));
    return position;
  }

  async createLstPosition(data: InsertLstPosition): Promise<LstPosition> {
    const [position] = await db.insert(lstPositions).values(data).returning();
    return position;
  }

  async updateLstPosition(id: string, data: Partial<LstPosition>): Promise<void> {
    await db.update(lstPositions).set({ ...data, updatedAt: new Date() }).where(eq(lstPositions.id, id));
  }

  // LST Transactions
  async getAllLstTransactions(limit: number = 100): Promise<LstTransaction[]> {
    return await db.select().from(lstTransactions).orderBy(desc(lstTransactions.createdAt)).limit(limit);
  }

  async getLstTransactionsByUser(userAddress: string, limit: number = 50): Promise<LstTransaction[]> {
    return await db.select().from(lstTransactions).where(eq(lstTransactions.userAddress, userAddress)).orderBy(desc(lstTransactions.createdAt)).limit(limit);
  }

  async getLstTransactionsByPool(poolId: string, limit: number = 50): Promise<LstTransaction[]> {
    return await db.select().from(lstTransactions).where(eq(lstTransactions.poolId, poolId)).orderBy(desc(lstTransactions.createdAt)).limit(limit);
  }

  async getRecentLstTransactions(limit: number = 50): Promise<LstTransaction[]> {
    return await db.select().from(lstTransactions).orderBy(desc(lstTransactions.createdAt)).limit(limit);
  }

  async createLstTransaction(data: InsertLstTransaction): Promise<LstTransaction> {
    const [tx] = await db.insert(lstTransactions).values(data).returning();
    return tx;
  }

  // Rebase History
  async getRebaseHistoryByPool(poolId: string, limit: number = 50): Promise<RebaseHistory[]> {
    return await db.select().from(rebaseHistory).where(eq(rebaseHistory.poolId, poolId)).orderBy(desc(rebaseHistory.executedAt)).limit(limit);
  }

  async getRecentRebaseHistory(limit: number = 50): Promise<RebaseHistory[]> {
    return await db.select().from(rebaseHistory).orderBy(desc(rebaseHistory.executedAt)).limit(limit);
  }

  async createRebaseHistory(data: InsertRebaseHistory): Promise<RebaseHistory> {
    const [history] = await db.insert(rebaseHistory).values(data).returning();
    return history;
  }

  // LST Protocol Stats
  async getLstProtocolStats(): Promise<LstProtocolStats | undefined> {
    const [stats] = await db.select().from(lstProtocolStats).orderBy(desc(lstProtocolStats.snapshotAt)).limit(1);
    return stats;
  }

  async createLstProtocolStats(data: InsertLstProtocolStats): Promise<LstProtocolStats> {
    const [stats] = await db.insert(lstProtocolStats).values(data).returning();
    return stats;
  }

  async updateLstProtocolStats(id: string, data: Partial<LstProtocolStats>): Promise<void> {
    await db.update(lstProtocolStats).set(data).where(eq(lstProtocolStats.id, id));
  }

  // Liquid Staking Aggregated Stats
  async getLiquidStakingStats(): Promise<{
    totalStakedUsd: string;
    totalPools: number;
    activePools: number;
    totalStakers: number;
    avgPoolApy: number;
    topPoolApy: number;
    totalLstMinted: string;
    mints24h: string;
    redeems24h: string;
  }> {
    const pools = await db.select().from(liquidStakingPools);
    const activePools = pools.filter(p => p.status === "active");
    const positions = await db.select().from(lstPositions);
    
    let totalStaked = BigInt(0);
    let totalLstMinted = BigInt(0);
    let totalApy = 0;
    let topApy = 0;
    let mints24h = BigInt(0);
    let redeems24h = BigInt(0);
    
    for (const pool of activePools) {
      totalStaked += BigInt(pool.totalStakedUsd.replace(/\./g, '') || "0");
      totalLstMinted += BigInt(pool.totalLstMinted.replace(/\./g, '') || "0");
      totalApy += pool.currentApy;
      if (pool.currentApy > topApy) topApy = pool.currentApy;
      mints24h += BigInt(pool.mints24h.replace(/\./g, '') || "0");
      redeems24h += BigInt(pool.redeems24h.replace(/\./g, '') || "0");
    }
    
    const avgApy = activePools.length > 0 ? Math.floor(totalApy / activePools.length) : 0;
    const uniqueStakers = new Set(positions.map(p => p.userAddress)).size;
    
    return {
      totalStakedUsd: totalStaked.toString(),
      totalPools: pools.length,
      activePools: activePools.length,
      totalStakers: uniqueStakers,
      avgPoolApy: avgApy,
      topPoolApy: topApy,
      totalLstMinted: totalLstMinted.toString(),
      mints24h: mints24h.toString(),
      redeems24h: redeems24h.toString(),
    };
  }

  // ============================================
  // NFT MARKETPLACE STORAGE
  // ============================================

  // NFT Collections
  async getAllNftCollections(): Promise<NftCollection[]> {
    return await db.select().from(nftCollections).orderBy(desc(nftCollections.volumeTotal));
  }

  async getNftCollectionById(id: string): Promise<NftCollection | undefined> {
    const [collection] = await db.select().from(nftCollections).where(eq(nftCollections.id, id));
    return collection;
  }

  async getNftCollectionByAddress(contractAddress: string): Promise<NftCollection | undefined> {
    const [collection] = await db.select().from(nftCollections).where(eq(nftCollections.contractAddress, contractAddress));
    return collection;
  }

  async getFeaturedNftCollections(limit: number = 10): Promise<NftCollection[]> {
    return await db.select().from(nftCollections).where(eq(nftCollections.featured, true)).orderBy(desc(nftCollections.volumeTotal)).limit(limit);
  }

  async getTrendingNftCollections(limit: number = 10): Promise<NftCollection[]> {
    return await db.select().from(nftCollections).where(eq(nftCollections.status, "active")).orderBy(desc(nftCollections.volume24h)).limit(limit);
  }

  async createNftCollection(data: InsertNftCollection): Promise<NftCollection> {
    const [collection] = await db.insert(nftCollections).values(data).returning();
    return collection;
  }

  async updateNftCollection(id: string, data: Partial<NftCollection>): Promise<void> {
    await db.update(nftCollections).set({ ...data, updatedAt: new Date() }).where(eq(nftCollections.id, id));
  }

  // NFT Items
  async getNftItemById(id: string): Promise<NftItem | undefined> {
    const [item] = await db.select().from(nftItems).where(eq(nftItems.id, id));
    return item;
  }

  async getNftItemsByCollection(collectionId: string, limit: number = 50): Promise<NftItem[]> {
    return await db.select().from(nftItems).where(eq(nftItems.collectionId, collectionId)).orderBy(desc(nftItems.createdAt)).limit(limit);
  }

  async getNftItemsByOwner(ownerAddress: string, limit: number = 50): Promise<NftItem[]> {
    return await db.select().from(nftItems).where(eq(nftItems.ownerAddress, ownerAddress)).orderBy(desc(nftItems.createdAt)).limit(limit);
  }

  async getListedNftItems(limit: number = 50): Promise<NftItem[]> {
    return await db.select().from(nftItems).where(eq(nftItems.isListed, true)).orderBy(desc(nftItems.createdAt)).limit(limit);
  }

  async createNftItem(data: InsertNftItem): Promise<NftItem> {
    const [item] = await db.insert(nftItems).values(data).returning();
    return item;
  }

  async updateNftItem(id: string, data: Partial<NftItem>): Promise<void> {
    await db.update(nftItems).set({ ...data, updatedAt: new Date() }).where(eq(nftItems.id, id));
  }

  // Marketplace Listings
  async getActiveListings(limit: number = 50): Promise<MarketplaceListing[]> {
    return await db.select().from(marketplaceListings).where(eq(marketplaceListings.status, "active")).orderBy(desc(marketplaceListings.createdAt)).limit(limit);
  }

  async getListingById(id: string): Promise<MarketplaceListing | undefined> {
    const [listing] = await db.select().from(marketplaceListings).where(eq(marketplaceListings.id, id));
    return listing;
  }

  async getListingsByCollection(collectionId: string, limit: number = 50): Promise<MarketplaceListing[]> {
    return await db.select().from(marketplaceListings).where(and(eq(marketplaceListings.collectionId, collectionId), eq(marketplaceListings.status, "active"))).orderBy(desc(marketplaceListings.createdAt)).limit(limit);
  }

  async getListingsBySeller(sellerAddress: string, limit: number = 50): Promise<MarketplaceListing[]> {
    return await db.select().from(marketplaceListings).where(eq(marketplaceListings.sellerAddress, sellerAddress)).orderBy(desc(marketplaceListings.createdAt)).limit(limit);
  }

  async getAuctionListings(limit: number = 50): Promise<MarketplaceListing[]> {
    return await db.select().from(marketplaceListings).where(and(eq(marketplaceListings.listingType, "auction"), eq(marketplaceListings.status, "active"))).orderBy(desc(marketplaceListings.createdAt)).limit(limit);
  }

  async createListing(data: InsertMarketplaceListing): Promise<MarketplaceListing> {
    const [listing] = await db.insert(marketplaceListings).values(data).returning();
    return listing;
  }

  async updateListing(id: string, data: Partial<MarketplaceListing>): Promise<void> {
    await db.update(marketplaceListings).set({ ...data, updatedAt: new Date() }).where(eq(marketplaceListings.id, id));
  }

  // Marketplace Bids
  async getBidsByListing(listingId: string): Promise<MarketplaceBid[]> {
    return await db.select().from(marketplaceBids).where(eq(marketplaceBids.listingId, listingId)).orderBy(desc(marketplaceBids.bidAmount));
  }

  async getBidsByBidder(bidderAddress: string, limit: number = 50): Promise<MarketplaceBid[]> {
    return await db.select().from(marketplaceBids).where(eq(marketplaceBids.bidderAddress, bidderAddress)).orderBy(desc(marketplaceBids.createdAt)).limit(limit);
  }

  async getActiveBids(limit: number = 50): Promise<MarketplaceBid[]> {
    return await db.select().from(marketplaceBids).where(eq(marketplaceBids.status, "active")).orderBy(desc(marketplaceBids.createdAt)).limit(limit);
  }

  async createBid(data: InsertMarketplaceBid): Promise<MarketplaceBid> {
    const [bid] = await db.insert(marketplaceBids).values(data).returning();
    return bid;
  }

  async updateBid(id: string, data: Partial<MarketplaceBid>): Promise<void> {
    await db.update(marketplaceBids).set({ ...data, updatedAt: new Date() }).where(eq(marketplaceBids.id, id));
  }

  // Marketplace Sales
  async getRecentSales(limit: number = 50): Promise<MarketplaceSale[]> {
    return await db.select().from(marketplaceSales).orderBy(desc(marketplaceSales.soldAt)).limit(limit);
  }

  async getSalesByCollection(collectionId: string, limit: number = 50): Promise<MarketplaceSale[]> {
    return await db.select().from(marketplaceSales).where(eq(marketplaceSales.collectionId, collectionId)).orderBy(desc(marketplaceSales.soldAt)).limit(limit);
  }

  async getSalesByBuyer(buyerAddress: string, limit: number = 50): Promise<MarketplaceSale[]> {
    return await db.select().from(marketplaceSales).where(eq(marketplaceSales.buyerAddress, buyerAddress)).orderBy(desc(marketplaceSales.soldAt)).limit(limit);
  }

  async getSalesBySeller(sellerAddress: string, limit: number = 50): Promise<MarketplaceSale[]> {
    return await db.select().from(marketplaceSales).where(eq(marketplaceSales.sellerAddress, sellerAddress)).orderBy(desc(marketplaceSales.soldAt)).limit(limit);
  }

  async createSale(data: InsertMarketplaceSale): Promise<MarketplaceSale> {
    const [sale] = await db.insert(marketplaceSales).values(data).returning();
    return sale;
  }

  // NFT Offers
  async getOffersByItem(itemId: string): Promise<NftOffer[]> {
    return await db.select().from(nftOffers).where(and(eq(nftOffers.itemId, itemId), eq(nftOffers.status, "active"))).orderBy(desc(nftOffers.offerAmount));
  }

  async getOffersByCollection(collectionId: string, limit: number = 50): Promise<NftOffer[]> {
    return await db.select().from(nftOffers).where(and(eq(nftOffers.collectionId, collectionId), eq(nftOffers.status, "active"))).orderBy(desc(nftOffers.offerAmount)).limit(limit);
  }

  async getOffersByOfferer(offererAddress: string, limit: number = 50): Promise<NftOffer[]> {
    return await db.select().from(nftOffers).where(eq(nftOffers.offererAddress, offererAddress)).orderBy(desc(nftOffers.createdAt)).limit(limit);
  }

  async createOffer(data: InsertNftOffer): Promise<NftOffer> {
    const [offer] = await db.insert(nftOffers).values(data).returning();
    return offer;
  }

  async updateOffer(id: string, data: Partial<NftOffer>): Promise<void> {
    await db.update(nftOffers).set({ ...data, updatedAt: new Date() }).where(eq(nftOffers.id, id));
  }

  // NFT Activity Log
  async getActivityByCollection(collectionId: string, limit: number = 50): Promise<NftActivityLog[]> {
    return await db.select().from(nftActivityLog).where(eq(nftActivityLog.collectionId, collectionId)).orderBy(desc(nftActivityLog.createdAt)).limit(limit);
  }

  async getActivityByItem(itemId: string, limit: number = 50): Promise<NftActivityLog[]> {
    return await db.select().from(nftActivityLog).where(eq(nftActivityLog.itemId, itemId)).orderBy(desc(nftActivityLog.createdAt)).limit(limit);
  }

  async getRecentActivity(limit: number = 50): Promise<NftActivityLog[]> {
    return await db.select().from(nftActivityLog).orderBy(desc(nftActivityLog.createdAt)).limit(limit);
  }

  async createActivityLog(data: InsertNftActivityLog): Promise<NftActivityLog> {
    const [activity] = await db.insert(nftActivityLog).values(data).returning();
    return activity;
  }

  // NFT Marketplace Stats
  async getNftMarketplaceStats(): Promise<NftMarketplaceStats | undefined> {
    const [stats] = await db.select().from(nftMarketplaceStats).orderBy(desc(nftMarketplaceStats.snapshotAt)).limit(1);
    return stats;
  }

  async createNftMarketplaceStats(data: InsertNftMarketplaceStats): Promise<NftMarketplaceStats> {
    const [stats] = await db.insert(nftMarketplaceStats).values(data).returning();
    return stats;
  }

  async updateNftMarketplaceStats(id: string, data: Partial<NftMarketplaceStats>): Promise<void> {
    await db.update(nftMarketplaceStats).set(data).where(eq(nftMarketplaceStats.id, id));
  }

  // NFT Marketplace Aggregated Stats
  async getNftMarketplaceOverview(): Promise<{
    totalVolume24h: string;
    totalVolume24hUsd: string;
    salesCount24h: number;
    activeListings: number;
    auctionListings: number;
    totalCollections: number;
    verifiedCollections: number;
    totalItems: number;
    activeTraders: number;
    avgFloorPrice: string;
  }> {
    const collections = await db.select().from(nftCollections);
    const activeCollections = collections.filter(c => c.status === "active");
    const verifiedCollections = collections.filter(c => c.verified);
    
    const listings = await db.select().from(marketplaceListings).where(eq(marketplaceListings.status, "active"));
    const auctionListings = listings.filter(l => l.listingType === "auction");
    
    let totalVolume24h = BigInt(0);
    let totalFloorPrice = BigInt(0);
    let salesCount24h = 0;
    let totalItems = 0;
    
    for (const collection of activeCollections) {
      totalVolume24h += BigInt(collection.volume24h.replace(/\./g, '') || "0");
      totalFloorPrice += BigInt(collection.floorPrice.replace(/\./g, '') || "0");
      salesCount24h += collection.salesCount24h;
      totalItems += collection.totalItems;
    }
    
    const avgFloorPrice = activeCollections.length > 0 
      ? (totalFloorPrice / BigInt(activeCollections.length)).toString()
      : "0";
    
    return {
      totalVolume24h: totalVolume24h.toString(),
      totalVolume24hUsd: "0",
      salesCount24h,
      activeListings: listings.length,
      auctionListings: auctionListings.length,
      totalCollections: collections.length,
      verifiedCollections: verifiedCollections.length,
      totalItems,
      activeTraders: 0,
      avgFloorPrice,
    };
  }

  // ============================================
  // NFT LAUNCHPAD STORAGE METHODS (Phase 6)
  // ============================================

  // Launchpad Projects
  async getAllLaunchpadProjects(): Promise<LaunchpadProject[]> {
    return await db.select().from(launchpadProjects).orderBy(desc(launchpadProjects.createdAt));
  }

  async getActiveLaunchpadProjects(): Promise<LaunchpadProject[]> {
    return await db.select().from(launchpadProjects).where(eq(launchpadProjects.status, "active")).orderBy(desc(launchpadProjects.launchDate));
  }

  async getUpcomingLaunchpadProjects(): Promise<LaunchpadProject[]> {
    return await db.select().from(launchpadProjects).where(eq(launchpadProjects.status, "pending")).orderBy(launchpadProjects.launchDate);
  }

  async getCompletedLaunchpadProjects(): Promise<LaunchpadProject[]> {
    return await db.select().from(launchpadProjects).where(eq(launchpadProjects.status, "completed")).orderBy(desc(launchpadProjects.endDate));
  }

  async getFeaturedLaunchpadProjects(limit: number = 5): Promise<LaunchpadProject[]> {
    return await db.select().from(launchpadProjects).where(eq(launchpadProjects.featured, true)).orderBy(desc(launchpadProjects.createdAt)).limit(limit);
  }

  async getLaunchpadProjectById(id: string): Promise<LaunchpadProject | undefined> {
    const [project] = await db.select().from(launchpadProjects).where(eq(launchpadProjects.id, id));
    return project;
  }

  async getLaunchpadProjectByContract(contractAddress: string): Promise<LaunchpadProject | undefined> {
    const [project] = await db.select().from(launchpadProjects).where(eq(launchpadProjects.contractAddress, contractAddress));
    return project;
  }

  async createLaunchpadProject(data: InsertLaunchpadProject): Promise<LaunchpadProject> {
    const id = `lp_${randomUUID().replace(/-/g, '').slice(0, 40)}`;
    const [project] = await db.insert(launchpadProjects).values({ ...data, id }).returning();
    return project;
  }

  async updateLaunchpadProject(id: string, data: Partial<LaunchpadProject>): Promise<void> {
    await db.update(launchpadProjects).set({ ...data, updatedAt: new Date() }).where(eq(launchpadProjects.id, id));
  }

  // Launch Rounds
  async getLaunchRoundsByProject(projectId: string): Promise<LaunchRound[]> {
    return await db.select().from(launchRounds).where(eq(launchRounds.projectId, projectId)).orderBy(launchRounds.roundNumber);
  }

  async getActiveLaunchRounds(): Promise<LaunchRound[]> {
    return await db.select().from(launchRounds).where(eq(launchRounds.status, "active")).orderBy(launchRounds.startTime);
  }

  async getLaunchRoundById(id: string): Promise<LaunchRound | undefined> {
    const [round] = await db.select().from(launchRounds).where(eq(launchRounds.id, id));
    return round;
  }

  async createLaunchRound(data: InsertLaunchRound): Promise<LaunchRound> {
    const id = `lr_${randomUUID().replace(/-/g, '').slice(0, 40)}`;
    const [round] = await db.insert(launchRounds).values({ ...data, id }).returning();
    return round;
  }

  async updateLaunchRound(id: string, data: Partial<LaunchRound>): Promise<void> {
    await db.update(launchRounds).set({ ...data, updatedAt: new Date() }).where(eq(launchRounds.id, id));
  }

  // Whitelist Entries
  async getWhitelistByProject(projectId: string): Promise<WhitelistEntry[]> {
    return await db.select().from(whitelistEntries).where(eq(whitelistEntries.projectId, projectId)).orderBy(desc(whitelistEntries.addedAt));
  }

  async getWhitelistByRound(roundId: string): Promise<WhitelistEntry[]> {
    return await db.select().from(whitelistEntries).where(eq(whitelistEntries.roundId, roundId)).orderBy(desc(whitelistEntries.addedAt));
  }

  async getWhitelistEntry(projectId: string, walletAddress: string): Promise<WhitelistEntry | undefined> {
    const [entry] = await db.select().from(whitelistEntries).where(and(eq(whitelistEntries.projectId, projectId), eq(whitelistEntries.walletAddress, walletAddress)));
    return entry;
  }

  async createWhitelistEntry(data: InsertWhitelistEntry): Promise<WhitelistEntry> {
    const id = `wl_${randomUUID().replace(/-/g, '').slice(0, 40)}`;
    const [entry] = await db.insert(whitelistEntries).values({ ...data, id }).returning();
    return entry;
  }

  async updateWhitelistEntry(id: string, data: Partial<WhitelistEntry>): Promise<void> {
    await db.update(whitelistEntries).set(data).where(eq(whitelistEntries.id, id));
  }

  // Launch Allocations
  async getAllocationsByProject(projectId: string): Promise<LaunchAllocation[]> {
    return await db.select().from(launchAllocations).where(eq(launchAllocations.projectId, projectId)).orderBy(desc(launchAllocations.createdAt));
  }

  async getAllocationsByRound(roundId: string): Promise<LaunchAllocation[]> {
    return await db.select().from(launchAllocations).where(eq(launchAllocations.roundId, roundId)).orderBy(desc(launchAllocations.createdAt));
  }

  async getAllocationsByWallet(walletAddress: string): Promise<LaunchAllocation[]> {
    return await db.select().from(launchAllocations).where(eq(launchAllocations.walletAddress, walletAddress)).orderBy(desc(launchAllocations.createdAt));
  }

  async createLaunchAllocation(data: InsertLaunchAllocation): Promise<LaunchAllocation> {
    const id = `la_${randomUUID().replace(/-/g, '').slice(0, 40)}`;
    const [allocation] = await db.insert(launchAllocations).values({ ...data, id }).returning();
    return allocation;
  }

  async updateLaunchAllocation(id: string, data: Partial<LaunchAllocation>): Promise<void> {
    await db.update(launchAllocations).set(data).where(eq(launchAllocations.id, id));
  }

  // Vesting Schedules
  async getVestingSchedulesByProject(projectId: string): Promise<VestingSchedule[]> {
    return await db.select().from(vestingSchedules).where(eq(vestingSchedules.projectId, projectId)).orderBy(desc(vestingSchedules.createdAt));
  }

  async getVestingSchedulesByWallet(walletAddress: string): Promise<VestingSchedule[]> {
    return await db.select().from(vestingSchedules).where(eq(vestingSchedules.walletAddress, walletAddress)).orderBy(desc(vestingSchedules.createdAt));
  }

  async getActiveVestingSchedules(): Promise<VestingSchedule[]> {
    return await db.select().from(vestingSchedules).where(eq(vestingSchedules.status, "active")).orderBy(vestingSchedules.nextClaimTime);
  }

  async createVestingSchedule(data: InsertVestingSchedule): Promise<VestingSchedule> {
    const id = `vs_${randomUUID().replace(/-/g, '').slice(0, 40)}`;
    const [schedule] = await db.insert(vestingSchedules).values({ ...data, id }).returning();
    return schedule;
  }

  async updateVestingSchedule(id: string, data: Partial<VestingSchedule>): Promise<void> {
    await db.update(vestingSchedules).set({ ...data, updatedAt: new Date() }).where(eq(vestingSchedules.id, id));
  }

  // Launchpad Stats
  async getLaunchpadStats(): Promise<LaunchpadStats | undefined> {
    const [stats] = await db.select().from(launchpadStats).orderBy(desc(launchpadStats.snapshotAt)).limit(1);
    return stats;
  }

  async createLaunchpadStats(data: InsertLaunchpadStats): Promise<LaunchpadStats> {
    const id = `lps_${randomUUID().replace(/-/g, '').slice(0, 40)}`;
    const [stats] = await db.insert(launchpadStats).values({ ...data, id }).returning();
    return stats;
  }

  // Launchpad Activity
  async getLaunchpadActivityByProject(projectId: string, limit: number = 50): Promise<LaunchpadActivity[]> {
    return await db.select().from(launchpadActivity).where(eq(launchpadActivity.projectId, projectId)).orderBy(desc(launchpadActivity.createdAt)).limit(limit);
  }

  async getRecentLaunchpadActivity(limit: number = 50): Promise<LaunchpadActivity[]> {
    return await db.select().from(launchpadActivity).orderBy(desc(launchpadActivity.createdAt)).limit(limit);
  }

  async createLaunchpadActivity(data: InsertLaunchpadActivity): Promise<LaunchpadActivity> {
    const id = `lpa_${randomUUID().replace(/-/g, '').slice(0, 40)}`;
    const [activity] = await db.insert(launchpadActivity).values({ ...data, id }).returning();
    return activity;
  }

  // Launchpad Overview
  async getLaunchpadOverview(): Promise<{
    totalProjects: number;
    activeProjects: number;
    upcomingProjects: number;
    completedProjects: number;
    totalRaised: string;
    totalMinted: number;
    uniqueParticipants: number;
    featuredCount: number;
  }> {
    const projects = await db.select().from(launchpadProjects);
    const activeProjects = projects.filter(p => p.status === "active");
    const upcomingProjects = projects.filter(p => p.status === "pending");
    const completedProjects = projects.filter(p => p.status === "completed");
    const featuredProjects = projects.filter(p => p.featured);
    
    let totalRaised = BigInt(0);
    let totalMinted = 0;
    let uniqueMintersSet = new Set<number>();
    
    for (const project of projects) {
      totalRaised += BigInt(project.totalRaised || "0");
      totalMinted += project.totalMinted;
      uniqueMintersSet.add(project.uniqueMinters);
    }
    
    return {
      totalProjects: projects.length,
      activeProjects: activeProjects.length,
      upcomingProjects: upcomingProjects.length,
      completedProjects: completedProjects.length,
      totalRaised: totalRaised.toString(),
      totalMinted,
      uniqueParticipants: Array.from(uniqueMintersSet).reduce((a, b) => a + b, 0),
      featuredCount: featuredProjects.length,
    };
  }

  // ============================================
  // GAMEFI INFRASTRUCTURE STORAGE METHODS (Phase 7)
  // ============================================

  async getAllGamefiProjects(): Promise<any[]> {
    return await db.select().from(gamefiProjects).orderBy(desc(gamefiProjects.createdAt));
  }

  async getActiveGamefiProjects(): Promise<any[]> {
    return await db.select().from(gamefiProjects)
      .where(eq(gamefiProjects.status, 'active'))
      .orderBy(desc(gamefiProjects.totalPlayers));
  }

  async getFeaturedGamefiProjects(limit: number = 5): Promise<any[]> {
    return await db.select().from(gamefiProjects)
      .where(eq(gamefiProjects.featured, true))
      .orderBy(desc(gamefiProjects.totalPlayers))
      .limit(limit);
  }

  async getGamefiProjectById(id: string): Promise<any | undefined> {
    const [project] = await db.select().from(gamefiProjects).where(eq(gamefiProjects.id, id));
    return project;
  }

  async getGamefiProjectBySlug(slug: string): Promise<any | undefined> {
    const [project] = await db.select().from(gamefiProjects).where(eq(gamefiProjects.slug, slug));
    return project;
  }

  async createGamefiProject(data: any): Promise<any> {
    const [project] = await db.insert(gamefiProjects).values(data).returning();
    return project;
  }

  async updateGamefiProject(id: string, data: any): Promise<any> {
    const [project] = await db.update(gamefiProjects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(gamefiProjects.id, id))
      .returning();
    return project;
  }

  async getGameAssetsByProject(projectId: string): Promise<any[]> {
    return await db.select().from(gameAssets)
      .where(eq(gameAssets.projectId, projectId))
      .orderBy(desc(gameAssets.createdAt));
  }

  async getGameAssetsByOwner(walletAddress: string): Promise<any[]> {
    return await db.select().from(gameAssets)
      .where(eq(gameAssets.ownerAddress, walletAddress))
      .orderBy(desc(gameAssets.createdAt));
  }

  async getGameAssetById(id: string): Promise<any | undefined> {
    const [asset] = await db.select().from(gameAssets).where(eq(gameAssets.id, id));
    return asset;
  }

  async createGameAsset(data: any): Promise<any> {
    const [asset] = await db.insert(gameAssets).values(data).returning();
    return asset;
  }

  async updateGameAsset(id: string, data: any): Promise<any> {
    const [asset] = await db.update(gameAssets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(gameAssets.id, id))
      .returning();
    return asset;
  }

  async getGameRewardsByWallet(walletAddress: string): Promise<any[]> {
    return await db.select().from(gameRewards)
      .where(eq(gameRewards.walletAddress, walletAddress))
      .orderBy(desc(gameRewards.createdAt));
  }

  async getGameRewardsByProject(projectId: string): Promise<any[]> {
    return await db.select().from(gameRewards)
      .where(eq(gameRewards.projectId, projectId))
      .orderBy(desc(gameRewards.createdAt));
  }

  async getPendingGameRewards(walletAddress: string): Promise<any[]> {
    return await db.select().from(gameRewards)
      .where(and(
        eq(gameRewards.walletAddress, walletAddress),
        eq(gameRewards.status, 'pending')
      ))
      .orderBy(desc(gameRewards.createdAt));
  }

  async createGameReward(data: any): Promise<any> {
    const [reward] = await db.insert(gameRewards).values(data).returning();
    return reward;
  }

  async claimGameReward(id: string, txHash: string): Promise<any> {
    const [reward] = await db.update(gameRewards)
      .set({ status: 'claimed', txHash, claimedAt: new Date() })
      .where(eq(gameRewards.id, id))
      .returning();
    return reward;
  }

  async getGameLeaderboard(projectId: string, leaderboardType: string = 'global', limit: number = 100): Promise<any[]> {
    return await db.select().from(gameLeaderboards)
      .where(and(
        eq(gameLeaderboards.projectId, projectId),
        eq(gameLeaderboards.leaderboardType, leaderboardType)
      ))
      .orderBy(gameLeaderboards.rank)
      .limit(limit);
  }

  async getPlayerLeaderboardEntry(projectId: string, walletAddress: string, leaderboardType: string = 'global'): Promise<any | undefined> {
    const [entry] = await db.select().from(gameLeaderboards)
      .where(and(
        eq(gameLeaderboards.projectId, projectId),
        eq(gameLeaderboards.walletAddress, walletAddress),
        eq(gameLeaderboards.leaderboardType, leaderboardType)
      ));
    return entry;
  }

  async createOrUpdateLeaderboardEntry(data: any): Promise<any> {
    const [entry] = await db.insert(gameLeaderboards).values(data).returning();
    return entry;
  }

  async getAllTournaments(): Promise<any[]> {
    return await db.select().from(gameTournaments).orderBy(desc(gameTournaments.startTime));
  }

  async getActiveTournaments(): Promise<any[]> {
    return await db.select().from(gameTournaments)
      .where(eq(gameTournaments.status, 'active'))
      .orderBy(gameTournaments.startTime);
  }

  async getUpcomingTournaments(): Promise<any[]> {
    return await db.select().from(gameTournaments)
      .where(eq(gameTournaments.status, 'upcoming'))
      .orderBy(gameTournaments.startTime);
  }

  async getTournamentById(id: string): Promise<any | undefined> {
    const [tournament] = await db.select().from(gameTournaments).where(eq(gameTournaments.id, id));
    return tournament;
  }

  async getTournamentsByProject(projectId: string): Promise<any[]> {
    return await db.select().from(gameTournaments)
      .where(eq(gameTournaments.projectId, projectId))
      .orderBy(desc(gameTournaments.startTime));
  }

  async createTournament(data: any): Promise<any> {
    const [tournament] = await db.insert(gameTournaments).values(data).returning();
    return tournament;
  }

  async updateTournament(id: string, data: any): Promise<any> {
    const [tournament] = await db.update(gameTournaments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(gameTournaments.id, id))
      .returning();
    return tournament;
  }

  async getTournamentParticipants(tournamentId: string): Promise<any[]> {
    return await db.select().from(tournamentParticipants)
      .where(eq(tournamentParticipants.tournamentId, tournamentId))
      .orderBy(tournamentParticipants.seed);
  }

  async getTournamentParticipant(tournamentId: string, walletAddress: string): Promise<any | undefined> {
    const [participant] = await db.select().from(tournamentParticipants)
      .where(and(
        eq(tournamentParticipants.tournamentId, tournamentId),
        eq(tournamentParticipants.walletAddress, walletAddress)
      ));
    return participant;
  }

  async joinTournament(data: any): Promise<any> {
    const [participant] = await db.insert(tournamentParticipants).values(data).returning();
    return participant;
  }

  async updateTournamentParticipant(id: string, data: any): Promise<any> {
    const [participant] = await db.update(tournamentParticipants)
      .set(data)
      .where(eq(tournamentParticipants.id, id))
      .returning();
    return participant;
  }

  async getAllAchievementBadges(projectId?: string): Promise<any[]> {
    if (projectId) {
      return await db.select().from(achievementBadges)
        .where(eq(achievementBadges.projectId, projectId))
        .orderBy(achievementBadges.points);
    }
    return await db.select().from(achievementBadges).orderBy(achievementBadges.points);
  }

  async getGlobalAchievementBadges(): Promise<any[]> {
    return await db.select().from(achievementBadges)
      .where(eq(achievementBadges.isGlobal, true))
      .orderBy(achievementBadges.points);
  }

  async getAchievementBadgeById(id: string): Promise<any | undefined> {
    const [badge] = await db.select().from(achievementBadges).where(eq(achievementBadges.id, id));
    return badge;
  }

  async createAchievementBadge(data: any): Promise<any> {
    const [badge] = await db.insert(achievementBadges).values(data).returning();
    return badge;
  }

  async getPlayerAchievements(walletAddress: string): Promise<any[]> {
    return await db.select().from(playerAchievements)
      .where(eq(playerAchievements.walletAddress, walletAddress))
      .orderBy(desc(playerAchievements.unlockedAt));
  }

  async getPlayerAchievementsByProject(walletAddress: string, projectId: string): Promise<any[]> {
    return await db.select().from(playerAchievements)
      .where(and(
        eq(playerAchievements.walletAddress, walletAddress),
        eq(playerAchievements.projectId, projectId)
      ))
      .orderBy(desc(playerAchievements.unlockedAt));
  }

  async getPlayerAchievementByBadge(walletAddress: string, badgeId: string): Promise<any | undefined> {
    const [achievement] = await db.select().from(playerAchievements)
      .where(and(
        eq(playerAchievements.walletAddress, walletAddress),
        eq(playerAchievements.badgeId, badgeId)
      ));
    return achievement;
  }

  async createPlayerAchievement(data: any): Promise<any> {
    const [achievement] = await db.insert(playerAchievements).values(data).returning();
    return achievement;
  }

  async updatePlayerAchievement(id: string, data: any): Promise<any> {
    const [achievement] = await db.update(playerAchievements)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(playerAchievements.id, id))
      .returning();
    return achievement;
  }

  async getRecentGamefiActivity(limit: number = 50): Promise<any[]> {
    return await db.select().from(gamefiActivity)
      .orderBy(desc(gamefiActivity.createdAt))
      .limit(limit);
  }

  async getGamefiActivityByProject(projectId: string, limit: number = 50): Promise<any[]> {
    return await db.select().from(gamefiActivity)
      .where(eq(gamefiActivity.projectId, projectId))
      .orderBy(desc(gamefiActivity.createdAt))
      .limit(limit);
  }

  async getGamefiActivityByWallet(walletAddress: string, limit: number = 50): Promise<any[]> {
    return await db.select().from(gamefiActivity)
      .where(eq(gamefiActivity.walletAddress, walletAddress))
      .orderBy(desc(gamefiActivity.createdAt))
      .limit(limit);
  }

  async createGamefiActivity(data: any): Promise<any> {
    const [activity] = await db.insert(gamefiActivity).values(data).returning();
    return activity;
  }

  async getGamefiOverview(): Promise<{
    totalProjects: number;
    activeProjects: number;
    totalPlayers: number;
    activePlayers24h: number;
    totalVolume: string;
    dailyVolume: string;
    totalRewardsDistributed: string;
    activeTournaments: number;
  }> {
    const allProjects = await db.select().from(gamefiProjects);
    const activeProjectsList = allProjects.filter(p => p.status === 'active');
    const activeTournamentsList = await this.getActiveTournaments();
    
    let totalPlayers = 0;
    let activePlayers24h = 0;
    let totalVolume = BigInt(0);
    let dailyVolume = BigInt(0);
    let totalRewards = BigInt(0);
    
    for (const project of allProjects) {
      totalPlayers += project.totalPlayers || 0;
      activePlayers24h += project.activePlayers24h || 0;
      totalVolume += BigInt(project.totalVolume || "0");
      dailyVolume += BigInt(project.dailyVolume || "0");
      totalRewards += BigInt(project.totalRewardsDistributed || "0");
    }
    
    return {
      totalProjects: allProjects.length,
      activeProjects: activeProjectsList.length,
      totalPlayers,
      activePlayers24h,
      totalVolume: totalVolume.toString(),
      dailyVolume: dailyVolume.toString(),
      totalRewardsDistributed: totalRewards.toString(),
      activeTournaments: activeTournamentsList.length,
    };
  }

  async createGamefiStats(data: any): Promise<any> {
    const [stats] = await db.insert(gamefiStats).values(data).returning();
    return stats;
  }

  async getLatestGamefiStats(): Promise<any | undefined> {
    const [stats] = await db.select().from(gamefiStats)
      .orderBy(desc(gamefiStats.snapshotAt))
      .limit(1);
    return stats;
  }

  // ============================================
  // COMMUNITY SYSTEM IMPLEMENTATION
  // Enterprise-Grade Community Platform
  // ============================================

  // Community Posts
  async getAllCommunityPosts(limit: number = 50, offset: number = 0, category?: string): Promise<CommunityPost[]> {
    if (category && category !== 'all') {
      return db.select().from(communityPosts)
        .where(and(
          eq(communityPosts.category, category),
          eq(communityPosts.status, 'active')
        ))
        .orderBy(desc(communityPosts.isPinned), desc(communityPosts.createdAt))
        .limit(limit)
        .offset(offset);
    }
    return db.select().from(communityPosts)
      .where(eq(communityPosts.status, 'active'))
      .orderBy(desc(communityPosts.isPinned), desc(communityPosts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getCommunityPostById(id: string): Promise<CommunityPost | undefined> {
    const [post] = await db.select().from(communityPosts).where(eq(communityPosts.id, id)).limit(1);
    return post;
  }

  async getCommunityPostsByAuthor(authorId: number): Promise<CommunityPost[]> {
    return db.select().from(communityPosts)
      .where(eq(communityPosts.authorId, authorId))
      .orderBy(desc(communityPosts.createdAt));
  }

  async createCommunityPost(data: InsertCommunityPost): Promise<CommunityPost> {
    const [post] = await db.insert(communityPosts).values(data).returning();
    return post;
  }

  async updateCommunityPost(id: string, data: Partial<CommunityPost>): Promise<void> {
    await db.update(communityPosts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(communityPosts.id, id));
  }

  async deleteCommunityPost(id: string): Promise<void> {
    await db.update(communityPosts)
      .set({ status: 'deleted', updatedAt: new Date() })
      .where(eq(communityPosts.id, id));
  }

  async incrementPostViews(id: string): Promise<void> {
    const post = await this.getCommunityPostById(id);
    if (post) {
      await db.update(communityPosts)
        .set({ views: (post.views || 0) + 1 })
        .where(eq(communityPosts.id, id));
    }
  }

  async incrementPostLikes(id: string): Promise<void> {
    const post = await this.getCommunityPostById(id);
    if (post) {
      await db.update(communityPosts)
        .set({ likes: (post.likes || 0) + 1 })
        .where(eq(communityPosts.id, id));
    }
  }

  async decrementPostLikes(id: string): Promise<void> {
    const post = await this.getCommunityPostById(id);
    if (post && (post.likes || 0) > 0) {
      await db.update(communityPosts)
        .set({ likes: (post.likes || 0) - 1 })
        .where(eq(communityPosts.id, id));
    }
  }

  async incrementPostCommentCount(id: string): Promise<void> {
    const post = await this.getCommunityPostById(id);
    if (post) {
      await db.update(communityPosts)
        .set({ 
          commentCount: (post.commentCount || 0) + 1,
          lastActivityAt: new Date()
        })
        .where(eq(communityPosts.id, id));
    }
  }

  async decrementPostCommentCount(id: string): Promise<void> {
    const post = await this.getCommunityPostById(id);
    if (post && (post.commentCount || 0) > 0) {
      await db.update(communityPosts)
        .set({ commentCount: (post.commentCount || 0) - 1 })
        .where(eq(communityPosts.id, id));
    }
  }

  // Community Comments
  async getCommentsByPostId(postId: string, limit: number = 100): Promise<CommunityComment[]> {
    return db.select().from(communityComments)
      .where(and(
        eq(communityComments.postId, postId),
        eq(communityComments.status, 'active'),
        isNull(communityComments.parentCommentId)
      ))
      .orderBy(desc(communityComments.createdAt))
      .limit(limit);
  }

  async getCommentById(id: string): Promise<CommunityComment | undefined> {
    const [comment] = await db.select().from(communityComments).where(eq(communityComments.id, id)).limit(1);
    return comment;
  }

  async getCommentReplies(parentCommentId: string): Promise<CommunityComment[]> {
    return db.select().from(communityComments)
      .where(and(
        eq(communityComments.parentCommentId, parentCommentId),
        eq(communityComments.status, 'active')
      ))
      .orderBy(communityComments.createdAt);
  }

  async createCommunityComment(data: InsertCommunityComment): Promise<CommunityComment> {
    const [comment] = await db.insert(communityComments).values(data).returning();
    return comment;
  }

  async updateCommunityComment(id: string, data: Partial<CommunityComment>): Promise<void> {
    await db.update(communityComments)
      .set({ ...data, isEdited: true, updatedAt: new Date() })
      .where(eq(communityComments.id, id));
  }

  async deleteCommunityComment(id: string): Promise<void> {
    await db.update(communityComments)
      .set({ status: 'deleted', updatedAt: new Date() })
      .where(eq(communityComments.id, id));
  }

  async incrementCommentLikes(id: string): Promise<void> {
    const comment = await this.getCommentById(id);
    if (comment) {
      await db.update(communityComments)
        .set({ likes: (comment.likes || 0) + 1 })
        .where(eq(communityComments.id, id));
    }
  }

  async decrementCommentLikes(id: string): Promise<void> {
    const comment = await this.getCommentById(id);
    if (comment && (comment.likes || 0) > 0) {
      await db.update(communityComments)
        .set({ likes: (comment.likes || 0) - 1 })
        .where(eq(communityComments.id, id));
    }
  }

  // Community Post Reactions
  async getPostReactionByUser(postId: string, userId: number): Promise<CommunityPostReaction | undefined> {
    const [reaction] = await db.select().from(communityPostReactions)
      .where(and(
        eq(communityPostReactions.postId, postId),
        eq(communityPostReactions.userId, userId)
      ))
      .limit(1);
    return reaction;
  }

  async getPostReactions(postId: string): Promise<CommunityPostReaction[]> {
    return db.select().from(communityPostReactions)
      .where(eq(communityPostReactions.postId, postId));
  }

  async createPostReaction(data: InsertCommunityPostReaction): Promise<CommunityPostReaction> {
    const [reaction] = await db.insert(communityPostReactions).values(data).returning();
    return reaction;
  }

  async deletePostReaction(postId: string, userId: number): Promise<void> {
    await db.delete(communityPostReactions)
      .where(and(
        eq(communityPostReactions.postId, postId),
        eq(communityPostReactions.userId, userId)
      ));
  }

  async getPostReactionCounts(postId: string): Promise<{ likes: number; dislikes: number }> {
    const reactions = await this.getPostReactions(postId);
    return {
      likes: reactions.filter(r => r.reactionType === 'like').length,
      dislikes: reactions.filter(r => r.reactionType === 'dislike').length,
    };
  }

  // Community Comment Reactions
  async getCommentReactionByUser(commentId: string, userId: number): Promise<CommunityCommentReaction | undefined> {
    const [reaction] = await db.select().from(communityCommentReactions)
      .where(and(
        eq(communityCommentReactions.commentId, commentId),
        eq(communityCommentReactions.userId, userId)
      ))
      .limit(1);
    return reaction;
  }

  async createCommentReaction(data: InsertCommunityCommentReaction): Promise<CommunityCommentReaction> {
    const [reaction] = await db.insert(communityCommentReactions).values(data).returning();
    return reaction;
  }

  async deleteCommentReaction(commentId: string, userId: number): Promise<void> {
    await db.delete(communityCommentReactions)
      .where(and(
        eq(communityCommentReactions.commentId, commentId),
        eq(communityCommentReactions.userId, userId)
      ));
  }

  // Community Events
  async getAllCommunityEvents(limit: number = 50): Promise<CommunityEvent[]> {
    return db.select().from(communityEvents)
      .orderBy(communityEvents.startDate)
      .limit(limit);
  }

  async getCommunityEventById(id: string): Promise<CommunityEvent | undefined> {
    const [event] = await db.select().from(communityEvents).where(eq(communityEvents.id, id)).limit(1);
    return event;
  }

  async getCommunityEventsByStatus(status: string): Promise<CommunityEvent[]> {
    return db.select().from(communityEvents)
      .where(eq(communityEvents.status, status))
      .orderBy(communityEvents.startDate);
  }

  async createCommunityEvent(data: InsertCommunityEvent): Promise<CommunityEvent> {
    const [event] = await db.insert(communityEvents).values(data).returning();
    return event;
  }

  async updateCommunityEvent(id: string, data: Partial<CommunityEvent>): Promise<void> {
    await db.update(communityEvents)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(communityEvents.id, id));
  }

  async deleteCommunityEvent(id: string): Promise<void> {
    await db.delete(communityEvents).where(eq(communityEvents.id, id));
  }

  async incrementEventParticipants(id: string): Promise<void> {
    const event = await this.getCommunityEventById(id);
    if (event) {
      await db.update(communityEvents)
        .set({ participants: (event.participants || 0) + 1 })
        .where(eq(communityEvents.id, id));
    }
  }

  async decrementEventParticipants(id: string): Promise<void> {
    const event = await this.getCommunityEventById(id);
    if (event && (event.participants || 0) > 0) {
      await db.update(communityEvents)
        .set({ participants: (event.participants || 0) - 1 })
        .where(eq(communityEvents.id, id));
    }
  }

  // Community Event Registrations
  async getEventRegistrationsByEvent(eventId: string): Promise<CommunityEventRegistration[]> {
    return db.select().from(communityEventRegistrations)
      .where(eq(communityEventRegistrations.eventId, eventId));
  }

  async getEventRegistrationsByUser(userId: number): Promise<CommunityEventRegistration[]> {
    return db.select().from(communityEventRegistrations)
      .where(eq(communityEventRegistrations.userId, userId));
  }

  async getEventRegistration(eventId: string, userId: number): Promise<CommunityEventRegistration | undefined> {
    const [reg] = await db.select().from(communityEventRegistrations)
      .where(and(
        eq(communityEventRegistrations.eventId, eventId),
        eq(communityEventRegistrations.userId, userId)
      ))
      .limit(1);
    return reg;
  }

  async createEventRegistration(data: InsertCommunityEventRegistration): Promise<CommunityEventRegistration> {
    const [reg] = await db.insert(communityEventRegistrations).values(data).returning();
    return reg;
  }

  async updateEventRegistration(id: string, data: Partial<CommunityEventRegistration>): Promise<void> {
    await db.update(communityEventRegistrations)
      .set(data)
      .where(eq(communityEventRegistrations.id, id));
  }

  async deleteEventRegistration(eventId: string, userId: number): Promise<void> {
    await db.delete(communityEventRegistrations)
      .where(and(
        eq(communityEventRegistrations.eventId, eventId),
        eq(communityEventRegistrations.userId, userId)
      ));
  }

  // Community Announcements
  async getAllCommunityAnnouncements(limit: number = 20): Promise<CommunityAnnouncement[]> {
    return db.select().from(communityAnnouncements)
      .orderBy(desc(communityAnnouncements.isPinned), desc(communityAnnouncements.createdAt))
      .limit(limit);
  }

  async getCommunityAnnouncementById(id: string): Promise<CommunityAnnouncement | undefined> {
    const [announcement] = await db.select().from(communityAnnouncements).where(eq(communityAnnouncements.id, id)).limit(1);
    return announcement;
  }

  async createCommunityAnnouncement(data: InsertCommunityAnnouncement): Promise<CommunityAnnouncement> {
    const [announcement] = await db.insert(communityAnnouncements).values(data).returning();
    return announcement;
  }

  async updateCommunityAnnouncement(id: string, data: Partial<CommunityAnnouncement>): Promise<void> {
    await db.update(communityAnnouncements)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(communityAnnouncements.id, id));
  }

  async deleteCommunityAnnouncement(id: string): Promise<void> {
    await db.delete(communityAnnouncements).where(eq(communityAnnouncements.id, id));
  }

  // Community Badges
  async getAllCommunityBadges(): Promise<CommunityBadge[]> {
    return db.select().from(communityBadges).orderBy(communityBadges.rarity);
  }

  async getCommunityBadgeById(id: string): Promise<CommunityBadge | undefined> {
    const [badge] = await db.select().from(communityBadges).where(eq(communityBadges.id, id)).limit(1);
    return badge;
  }

  async getCommunityBadgesByRarity(rarity: string): Promise<CommunityBadge[]> {
    return db.select().from(communityBadges)
      .where(eq(communityBadges.rarity, rarity));
  }

  async createCommunityBadge(data: InsertCommunityBadge): Promise<CommunityBadge> {
    const [badge] = await db.insert(communityBadges).values(data).returning();
    return badge;
  }

  async updateCommunityBadge(id: string, data: Partial<CommunityBadge>): Promise<void> {
    await db.update(communityBadges)
      .set(data)
      .where(eq(communityBadges.id, id));
  }

  // Community User Badges
  async getUserBadges(userId: number): Promise<CommunityUserBadge[]> {
    return db.select().from(communityUserBadges)
      .where(eq(communityUserBadges.userId, userId));
  }

  async getUserBadge(userId: number, badgeId: string): Promise<CommunityUserBadge | undefined> {
    const [badge] = await db.select().from(communityUserBadges)
      .where(and(
        eq(communityUserBadges.userId, userId),
        eq(communityUserBadges.badgeId, badgeId)
      ))
      .limit(1);
    return badge;
  }

  async createUserBadge(data: InsertCommunityUserBadge): Promise<CommunityUserBadge> {
    const [badge] = await db.insert(communityUserBadges).values(data).returning();
    return badge;
  }

  async updateUserBadge(id: string, data: Partial<CommunityUserBadge>): Promise<void> {
    await db.update(communityUserBadges)
      .set(data)
      .where(eq(communityUserBadges.id, id));
  }

  async awardBadgeToUser(userId: number, badgeId: string): Promise<CommunityUserBadge> {
    const existingBadge = await this.getUserBadge(userId, badgeId);
    if (existingBadge) {
      return existingBadge;
    }
    
    const badge = await this.getCommunityBadgeById(badgeId);
    const [userBadge] = await db.insert(communityUserBadges).values({
      userId,
      userAddress: '',
      badgeId,
      isCompleted: true,
      earnedAt: new Date(),
      progress: 100,
    }).returning();
    
    if (badge) {
      await db.update(communityBadges)
        .set({ totalAwarded: (badge.totalAwarded || 0) + 1 })
        .where(eq(communityBadges.id, badgeId));
    }
    
    return userBadge;
  }

  // Community Activity
  async getRecentCommunityActivity(limit: number = 50): Promise<CommunityActivityType[]> {
    return db.select().from(communityActivity)
      .orderBy(desc(communityActivity.createdAt))
      .limit(limit);
  }

  async getCommunityActivityByUser(userId: number, limit: number = 50): Promise<CommunityActivityType[]> {
    return db.select().from(communityActivity)
      .where(eq(communityActivity.userId, userId))
      .orderBy(desc(communityActivity.createdAt))
      .limit(limit);
  }

  async createCommunityActivity(data: InsertCommunityActivity): Promise<CommunityActivityType> {
    const [activity] = await db.insert(communityActivity).values(data).returning();
    return activity;
  }

  // Community Reputation
  async getUserReputation(userId: number): Promise<CommunityReputationType | undefined> {
    const [rep] = await db.select().from(communityReputation)
      .where(eq(communityReputation.userId, userId))
      .limit(1);
    return rep;
  }

  async createUserReputation(data: InsertCommunityReputation): Promise<CommunityReputationType> {
    const [rep] = await db.insert(communityReputation).values(data).returning();
    return rep;
  }

  async updateUserReputation(userId: number, data: Partial<CommunityReputationType>): Promise<void> {
    await db.update(communityReputation)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(communityReputation.userId, userId));
  }

  async incrementUserReputation(userId: number, points: number): Promise<void> {
    const rep = await this.getUserReputation(userId);
    if (rep) {
      const newReputation = (rep.reputation || 0) + points;
      const newLevel = Math.floor(newReputation / 1000) + 1;
      await db.update(communityReputation)
        .set({ 
          reputation: newReputation,
          level: Math.min(newLevel, 100),
          lastActivityAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(communityReputation.userId, userId));
    }
  }

  async getLeaderboard(limit: number = 100): Promise<CommunityReputationType[]> {
    return db.select().from(communityReputation)
      .orderBy(desc(communityReputation.reputation))
      .limit(limit);
  }

  // Community Stats
  async getCommunityStats(): Promise<CommunityStats> {
    const allMembers = await db.select().from(members);
    const allPosts = await db.select().from(communityPosts).where(eq(communityPosts.status, 'active'));
    const allEvents = await db.select().from(communityEvents);
    const allAnnouncements = await db.select().from(communityAnnouncements);
    
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const activeMembers = allMembers.filter(m => {
      const lastActivity = m.lastActivityAt ? new Date(m.lastActivityAt) : null;
      return lastActivity && lastActivity > weekAgo;
    });
    
    const upcomingEvents = allEvents.filter(e => {
      const startDate = new Date(e.startDate);
      return startDate > now;
    });
    
    let totalComments = 0;
    for (const post of allPosts) {
      totalComments += post.commentCount || 0;
    }
    
    return {
      totalMembers: allMembers.length,
      activeMembers: activeMembers.length,
      totalPosts: allPosts.length,
      totalComments,
      totalProposals: 0,
      activeProposals: 0,
      totalEvents: allEvents.length,
      upcomingEvents: upcomingEvents.length,
      totalRewards: "0",
      weeklyGrowth: 0,
    };
  }

  // ============================================
  // BRIDGE TRANSFERS (Cross-Chain)
  // ============================================
  async getAllBridgeTransfers(limit: number = 100): Promise<BridgeTransfer[]> {
    return db.select().from(bridgeTransfers)
      .orderBy(desc(bridgeTransfers.createdAt))
      .limit(limit);
  }

  async getBridgeTransferById(id: string): Promise<BridgeTransfer | undefined> {
    const [transfer] = await db.select().from(bridgeTransfers)
      .where(eq(bridgeTransfers.id, id));
    return transfer;
  }

  async getBridgeTransfersBySender(senderAddress: string, limit: number = 100): Promise<BridgeTransfer[]> {
    return db.select().from(bridgeTransfers)
      .where(eq(bridgeTransfers.senderAddress, senderAddress))
      .orderBy(desc(bridgeTransfers.createdAt))
      .limit(limit);
  }

  async getBridgeTransfersByStatus(status: string, limit: number = 100): Promise<BridgeTransfer[]> {
    return db.select().from(bridgeTransfers)
      .where(eq(bridgeTransfers.status, status))
      .orderBy(desc(bridgeTransfers.createdAt))
      .limit(limit);
  }

  async getRecentBridgeTransfers(limit: number = 50): Promise<BridgeTransfer[]> {
    return db.select().from(bridgeTransfers)
      .orderBy(desc(bridgeTransfers.createdAt))
      .limit(limit);
  }

  async getPendingBridgeTransfers(): Promise<BridgeTransfer[]> {
    return db.select().from(bridgeTransfers)
      .where(eq(bridgeTransfers.status, 'pending'))
      .orderBy(desc(bridgeTransfers.createdAt));
  }

  async createBridgeTransfer(data: InsertBridgeTransfer): Promise<BridgeTransfer> {
    const [result] = await db.insert(bridgeTransfers).values({
      ...data,
      id: `bridge-${randomUUID()}`,
    }).returning();
    return result;
  }

  async updateBridgeTransfer(id: string, data: Partial<BridgeTransfer>): Promise<void> {
    await db.update(bridgeTransfers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(bridgeTransfers.id, id));
  }
}

export const storage = new DbStorage();
