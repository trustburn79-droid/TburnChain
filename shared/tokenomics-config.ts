/**
 * TBURN Enterprise Tokenomics Configuration
 * 
 * Tiered Validator System with Adaptive Emission Model
 * Production-grade, enterprise-level configuration
 */

// ============================================
// Core Token Constants (20-Year Tokenomics Model)
// ============================================
export const BILLION = 1_000_000_000;
export const MILLION = 1_000_000;

export const TOKEN_CONSTANTS = {
  // 20-Year Tokenomics: Genesis 100억 → Y20 69.40억 (30.60% deflation)
  GENESIS_SUPPLY: 10 * BILLION,         // 10B (100억) TBURN genesis supply
  TOTAL_SUPPLY: 10 * BILLION,           // 10B (100억) TBURN total supply at genesis
  Y20_TARGET_SUPPLY: 6.94 * BILLION,    // 6.94B (69.40억) TBURN target at Year 20
  CIRCULATING_SUPPLY: 7 * BILLION,      // 7B (70억) TBURN in circulation
  TARGET_STAKED_SUPPLY: 3.2 * BILLION,  // 3.2B (32억) TBURN target staking (32%)
  
  // Deflation targets
  TOTAL_DEFLATION_PERCENT: 30.60,       // Total deflation over 20 years
  AVG_ANNUAL_DEFLATION: 1.53,           // Average annual deflation rate
  
  DECIMALS: 18,
  WEI_PER_TBURN: BigInt(10 ** 18),
  
  // Ember (EMB) - TBURN Gas Unit
  EMB_PER_TBURN: 1_000_000,
  STANDARD_GAS_PRICE_EMB: 10,           // 10 EMB standard gas price
};

// ============================================
// Canonical Token Pricing (Single Source of Truth)
// ============================================
export const TOKEN_PRICING = {
  // Current market price (mainnet launch price)
  CURRENT_PRICE_USD: 0.5,               // $0.50 USD per TBURN at mainnet launch
  
  // Investment round prices
  SEED_ROUND_PRICE: 0.04,               // $0.04 per TBURN (Seed investors)
  PRIVATE_ROUND_PRICE: 0.1,             // $0.10 per TBURN (Private investors)
  PUBLIC_ROUND_PRICE: 0.2,              // $0.20 per TBURN (Public sale)
  
  // IDO platform prices (same as public round)
  LAUNCHPAD_PRICE: 0.2,                 // $0.20 per TBURN (Official Launchpad)
  COINLIST_PRICE: 0.2,                  // $0.20 per TBURN (CoinList sale)
  DAOMAKER_PRICE: 0.2,                  // $0.20 per TBURN (DAO Maker SHO)
  
  // Market metrics
  FULLY_DILUTED_VALUATION: 5000000000,  // $5B FDV at $0.50
  MARKET_CAP_AT_LAUNCH: 3500000000,     // $3.5B (7B circulating × $0.50)
  
  // Price history (for reference)
  GENESIS_PRICE: 0.5,                   // Launch price
  ATH_PRICE: 0.5,                       // All-time high (at launch)
  ATL_PRICE: 0.5,                       // All-time low (at launch)
};

// ============================================
// Validator Tier System (Unified Configuration)
// ============================================
export enum ValidatorTier {
  TIER_1_COMMITTEE = 'tier_1_committee',     // Active Committee (Block Producers)
  TIER_2_STANDBY = 'tier_2_standby',         // Standby Validators (Ready for rotation)
  TIER_3_DELEGATOR = 'tier_3_delegator',     // Delegators (Token holders)
}

// Marketing tier names (maps to underlying validator tiers)
export enum MarketingTier {
  GENESIS = 'genesis',       // Premium tier → maps to Tier 1
  PIONEER = 'pioneer',       // Early adopter → maps to Tier 1
  STANDARD = 'standard',     // Regular validator → maps to Tier 2
  COMMUNITY = 'community',   // Entry level → maps to Tier 3 (with validator rights)
}

export interface TierConfig {
  tier: ValidatorTier;
  name: string;
  displayName: string;
  displayNameKo: string;
  maxParticipants: number;
  minStakeTBURN: number;
  minStakeWei: string;
  rewardPoolShare: number;           // Percentage of daily emission (0-1)
  targetAPY: number;                 // Target APY in percentage (e.g., 8.0)
  apyRange: { min: number; max: number };
  feeRange: { min: number; max: number }; // Commission fee range in percentage
  description: string;
  benefits: string[];
}

// Marketing tier configuration for external-facing pages
export interface MarketingTierConfig {
  tier: MarketingTier;
  underlyingTier: ValidatorTier;
  name: string;
  displayName: string;
  displayNameKo: string;
  icon: string;                      // Icon identifier (crown, rocket, star, users)
  color: string;                     // Theme color
  maxSlots: number;
  minStakeTBURN: number;
  feeRange: { min: number; max: number };
  apyRange: { min: number; max: number };
  benefits: string[];
  benefitsKo: string[];
}

export const VALIDATOR_TIERS: Record<ValidatorTier, TierConfig> = {
  [ValidatorTier.TIER_1_COMMITTEE]: {
    tier: ValidatorTier.TIER_1_COMMITTEE,
    name: 'tier_1_committee',
    displayName: 'Active Committee',
    displayNameKo: '활성 위원회',
    maxParticipants: 512,
    minStakeTBURN: 200_000,          // 200K TBURN minimum for committee
    minStakeWei: (BigInt(200_000) * BigInt(10 ** 18)).toString(),
    rewardPoolShare: 0.50,           // 50% of daily emission (250,000 TBURN/day)
    targetAPY: 8.01,
    apyRange: { min: 6.0, max: 10.0 },
    feeRange: { min: 1.0, max: 10.0 },
    description: 'Elite validators participating in block production and consensus',
    benefits: [
      'Block production rights',
      'Consensus participation',
      'Governance voting power',
      'Highest reward tier',
    ],
  },
  [ValidatorTier.TIER_2_STANDBY]: {
    tier: ValidatorTier.TIER_2_STANDBY,
    name: 'tier_2_standby',
    displayName: 'Standby Validator',
    displayNameKo: '대기 검증자',
    maxParticipants: 4_488,
    minStakeTBURN: 50_000,           // 50K TBURN minimum for standby
    minStakeWei: (BigInt(50_000) * BigInt(10 ** 18)).toString(),
    rewardPoolShare: 0.30,           // 30% of daily emission (150,000 TBURN/day)
    targetAPY: 4.0,
    apyRange: { min: 3.0, max: 5.0 },
    feeRange: { min: 5.0, max: 15.0 },
    description: 'Backup validators ready for committee rotation',
    benefits: [
      'Committee rotation eligibility',
      'Partial consensus participation',
      'Governance voting power',
      'Stable reward stream',
    ],
  },
  [ValidatorTier.TIER_3_DELEGATOR]: {
    tier: ValidatorTier.TIER_3_DELEGATOR,
    name: 'tier_3_delegator',
    displayName: 'Delegator',
    displayNameKo: '위임자',
    maxParticipants: -1,             // Unlimited
    minStakeTBURN: 100,              // 100 TBURN minimum for delegators
    minStakeWei: (BigInt(100) * BigInt(10 ** 18)).toString(),
    rewardPoolShare: 0.20,           // 20% of daily emission (100,000 TBURN/day)
    targetAPY: 5.0,
    apyRange: { min: 4.0, max: 6.0 },
    feeRange: { min: 0.0, max: 0.0 }, // Delegators don't charge fees
    description: 'Token holders delegating stake to validators',
    benefits: [
      'Low entry barrier',
      'Passive income',
      'Governance participation',
      'Flexible staking',
    ],
  },
};

// ============================================
// Marketing Tier Configuration (External-facing)
// Maps marketing labels to underlying validator tiers
// ============================================
export const MARKETING_TIERS: Record<MarketingTier, MarketingTierConfig> = {
  [MarketingTier.GENESIS]: {
    tier: MarketingTier.GENESIS,
    underlyingTier: ValidatorTier.TIER_1_COMMITTEE,
    name: 'genesis',
    displayName: 'Genesis Validator',
    displayNameKo: '제네시스 검증자',
    icon: 'crown',
    color: 'gold',
    maxSlots: 50,
    minStakeTBURN: 1_000_000,        // 1M TBURN for Genesis tier
    feeRange: { min: 1.0, max: 5.0 },
    apyRange: { min: 20.0, max: 25.0 },
    benefits: [
      'Highest reward priority',
      'Core network governance rights',
      'Exclusive Genesis NFT badge',
    ],
    benefitsKo: [
      '최고 보상 우선순위',
      '핵심 네트워크 거버넌스 권한',
      '독점 제네시스 NFT 배지',
    ],
  },
  [MarketingTier.PIONEER]: {
    tier: MarketingTier.PIONEER,
    underlyingTier: ValidatorTier.TIER_1_COMMITTEE,
    name: 'pioneer',
    displayName: 'Pioneer Validator',
    displayNameKo: '파이오니어 검증자',
    icon: 'rocket',
    color: 'purple',
    maxSlots: 100,
    minStakeTBURN: 500_000,          // 500K TBURN for Pioneer tier
    feeRange: { min: 5.0, max: 15.0 },
    apyRange: { min: 16.0, max: 20.0 },
    benefits: [
      'High reward priority',
      'Network governance participation',
      'Pioneer NFT badge',
    ],
    benefitsKo: [
      '높은 보상 우선순위',
      '네트워크 거버넌스 참여',
      '파이오니어 NFT 배지',
    ],
  },
  [MarketingTier.STANDARD]: {
    tier: MarketingTier.STANDARD,
    underlyingTier: ValidatorTier.TIER_2_STANDBY,
    name: 'standard',
    displayName: 'Standard Validator',
    displayNameKo: '스탠다드 검증자',
    icon: 'star',
    color: 'yellow',
    maxSlots: 150,
    minStakeTBURN: 200_000,          // 200K TBURN for Standard tier
    feeRange: { min: 10.0, max: 20.0 },
    apyRange: { min: 14.0, max: 18.0 },
    benefits: [
      'Standard reward allocation',
      'Proposal voting rights',
      'Standard NFT badge',
    ],
    benefitsKo: [
      '표준 보상 할당',
      '제안 투표 권한',
      '스탠다드 NFT 배지',
    ],
  },
  [MarketingTier.COMMUNITY]: {
    tier: MarketingTier.COMMUNITY,
    underlyingTier: ValidatorTier.TIER_3_DELEGATOR,
    name: 'community',
    displayName: 'Community Validator',
    displayNameKo: '커뮤니티 검증자',
    icon: 'users',
    color: 'green',
    maxSlots: 75,
    minStakeTBURN: 100_000,          // 100K TBURN for Community tier
    feeRange: { min: 15.0, max: 30.0 },
    apyRange: { min: 12.0, max: 15.0 },
    benefits: [
      'Community reward pool',
      'Basic governance rights',
      'Community NFT badge',
    ],
    benefitsKo: [
      '커뮤니티 보상 풀',
      '기본 거버넌스 권한',
      '커뮤니티 NFT 배지',
    ],
  },
};

// ============================================
// Validator Tier Helper Functions
// ============================================

/**
 * Get validator tier by stake amount
 */
export function getValidatorTierByStake(stakeTBURN: number): ValidatorTier {
  if (stakeTBURN >= VALIDATOR_TIERS[ValidatorTier.TIER_1_COMMITTEE].minStakeTBURN) {
    return ValidatorTier.TIER_1_COMMITTEE;
  }
  if (stakeTBURN >= VALIDATOR_TIERS[ValidatorTier.TIER_2_STANDBY].minStakeTBURN) {
    return ValidatorTier.TIER_2_STANDBY;
  }
  return ValidatorTier.TIER_3_DELEGATOR;
}

/**
 * Get marketing tier by stake amount
 */
export function getMarketingTierByStake(stakeTBURN: number): MarketingTier | null {
  if (stakeTBURN >= MARKETING_TIERS[MarketingTier.GENESIS].minStakeTBURN) {
    return MarketingTier.GENESIS;
  }
  if (stakeTBURN >= MARKETING_TIERS[MarketingTier.PIONEER].minStakeTBURN) {
    return MarketingTier.PIONEER;
  }
  if (stakeTBURN >= MARKETING_TIERS[MarketingTier.STANDARD].minStakeTBURN) {
    return MarketingTier.STANDARD;
  }
  if (stakeTBURN >= MARKETING_TIERS[MarketingTier.COMMUNITY].minStakeTBURN) {
    return MarketingTier.COMMUNITY;
  }
  return null;
}

/**
 * Get tier configuration by tier enum
 */
export function getTierConfig(tier: ValidatorTier): TierConfig {
  return VALIDATOR_TIERS[tier];
}

/**
 * Get marketing tier configuration
 */
export function getMarketingTierConfig(tier: MarketingTier): MarketingTierConfig {
  return MARKETING_TIERS[tier];
}

/**
 * Calculate total marketing tier slots
 */
export function getTotalMarketingSlots(): number {
  return Object.values(MARKETING_TIERS).reduce((sum, tier) => sum + tier.maxSlots, 0);
}

/**
 * Get all marketing tiers as array (sorted by stake requirement, highest first)
 */
export function getMarketingTiersArray(): MarketingTierConfig[] {
  return Object.values(MARKETING_TIERS).sort((a, b) => b.minStakeTBURN - a.minStakeTBURN);
}

// ============================================
// Adaptive Emission Model
// ============================================
export interface EmissionConfig {
  baseEmissionDaily: number;         // Base daily emission in TBURN
  burnRate: number;                  // Percentage of fees burned (0-1)
  treasuryRate: number;              // Percentage to treasury
  
  // Dynamic adjustment parameters
  targetStakeRatio: number;          // Target staking ratio (0-1)
  maxEmissionMultiplier: number;     // Maximum emission increase
  minEmissionMultiplier: number;     // Minimum emission decrease
  
  // Inflation targets
  targetNetInflation: number;        // Target annual net inflation (0-1)
  inflationBandWidth: number;        // Allowed deviation (+/-)
}

export const EMISSION_CONFIG: EmissionConfig = {
  // Scaled for 10B supply (100x from original 100M model)
  baseEmissionDaily: 500_000,        // 500,000 TBURN/day base emission (scaled 100x)
  burnRate: 0.70,                    // 70% of fees burned (AI burn mechanism)
  treasuryRate: 0.00,                // 0% to treasury (included in emission distribution)
  
  targetStakeRatio: 0.32,            // 32% target staking
  maxEmissionMultiplier: 1.15,       // Max 15% increase
  minEmissionMultiplier: 0.85,       // Max 15% decrease
  
  targetNetInflation: -0.0153,       // -1.53% annual net deflation (20-year target)
  inflationBandWidth: 0.005,         // ±0.5% allowed deviation
};

// ============================================
// Reward Distribution Configuration
// ============================================
export interface RewardDistribution {
  tier1ValidatorShare: number;
  tier2StandbyShare: number;
  tier3DelegatorShare: number;
  securityReserveShare: number;
}

export const REWARD_DISTRIBUTION: RewardDistribution = {
  // Scaled for 10B supply with 500K daily emission
  tier1ValidatorShare: 0.50,         // 50% to Tier 1 (250,000 TBURN/day)
  tier2StandbyShare: 0.30,           // 30% to Tier 2 (150,000 TBURN/day)
  tier3DelegatorShare: 0.20,         // 20% to Tier 3 (100,000 TBURN/day)
  securityReserveShare: 0.00,        // Included in above distributions
};

// ============================================
// Tokenomics Calculator Functions
// ============================================

/**
 * Calculate adaptive emission based on current stake ratio
 * Formula: Emission = BaseEmission × min(maxMult, sqrt(EffStake/TargetStake))
 */
export function calculateAdaptiveEmission(
  currentStakedTBURN: number,
  config: EmissionConfig = EMISSION_CONFIG
): number {
  const stakeRatio = currentStakedTBURN / TOKEN_CONSTANTS.CIRCULATING_SUPPLY;
  const targetRatio = config.targetStakeRatio;
  
  // Calculate multiplier based on stake ratio
  let multiplier = Math.sqrt(stakeRatio / targetRatio);
  
  // Apply bounds
  multiplier = Math.max(config.minEmissionMultiplier, multiplier);
  multiplier = Math.min(config.maxEmissionMultiplier, multiplier);
  
  return Math.floor(config.baseEmissionDaily * multiplier);
}

/**
 * Calculate net daily emission after burns
 */
export function calculateNetDailyEmission(
  grossEmission: number,
  dailyBurnAmount: number
): number {
  return grossEmission - dailyBurnAmount;
}

/**
 * Calculate daily burn amount based on transaction fees
 */
export function calculateDailyBurn(
  dailyFeesTBURN: number,
  burnRate: number = EMISSION_CONFIG.burnRate
): number {
  return dailyFeesTBURN * burnRate;
}

/**
 * Calculate tier-specific daily reward pool
 */
export function calculateTierRewardPool(
  tier: ValidatorTier,
  totalDailyEmission: number
): number {
  const tierConfig = VALIDATOR_TIERS[tier];
  return totalDailyEmission * tierConfig.rewardPoolShare;
}

/**
 * Calculate individual validator daily reward
 */
export function calculateValidatorDailyReward(
  tier: ValidatorTier,
  totalDailyEmission: number,
  validatorCount: number,
  validatorStake: number,
  totalTierStake: number
): number {
  const tierPool = calculateTierRewardPool(tier, totalDailyEmission);
  
  // Weight by stake proportion within tier
  const stakeWeight = totalTierStake > 0 ? validatorStake / totalTierStake : 1 / validatorCount;
  
  return tierPool * stakeWeight;
}

/**
 * Calculate APY based on stake and daily reward
 */
export function calculateAPY(
  dailyRewardTBURN: number,
  stakeTBURN: number
): number {
  if (stakeTBURN <= 0) return 0;
  const annualReward = dailyRewardTBURN * 365;
  return (annualReward / stakeTBURN) * 100;
}

/**
 * Determine validator tier based on stake amount
 */
export function determineValidatorTier(stakeTBURN: number): ValidatorTier {
  if (stakeTBURN >= VALIDATOR_TIERS[ValidatorTier.TIER_1_COMMITTEE].minStakeTBURN) {
    return ValidatorTier.TIER_1_COMMITTEE;
  } else if (stakeTBURN >= VALIDATOR_TIERS[ValidatorTier.TIER_2_STANDBY].minStakeTBURN) {
    return ValidatorTier.TIER_2_STANDBY;
  }
  return ValidatorTier.TIER_3_DELEGATOR;
}

/**
 * Check if stake meets tier minimum requirement
 */
export function meetsMinimumStake(stakeTBURN: number, tier: ValidatorTier): boolean {
  return stakeTBURN >= VALIDATOR_TIERS[tier].minStakeTBURN;
}

// ============================================
// Network Security Metrics
// ============================================

/**
 * Calculate 33% attack cost (Byzantine resistance)
 */
export function calculateAttackCost(
  totalStakedTBURN: number,
  priceUSD: number
): number {
  const attackThreshold = totalStakedTBURN * 0.33;
  return attackThreshold * priceUSD;
}

/**
 * Calculate network security score (0-100)
 */
export function calculateSecurityScore(
  totalStakedTBURN: number,
  activeValidators: number
): number {
  const stakeScore = Math.min((totalStakedTBURN / TOKEN_CONSTANTS.TARGET_STAKED_SUPPLY) * 50, 50);
  const validatorScore = Math.min((activeValidators / 125) * 30, 30);
  const decentralizationScore = Math.min(activeValidators >= 100 ? 20 : (activeValidators / 100) * 20, 20);
  
  return Math.floor(stakeScore + validatorScore + decentralizationScore);
}

// ============================================
// Tokenomics Summary Generator
// ============================================
export interface TokenomicsSummary {
  // Supply metrics
  totalSupply: number;
  circulatingSupply: number;
  totalStaked: number;
  stakingRatio: number;
  
  // Emission metrics
  dailyGrossEmission: number;
  dailyBurn: number;
  dailyNetEmission: number;
  annualInflationRate: number;
  
  // Tier metrics
  tier1Count: number;
  tier1TotalStake: number;
  tier1DailyPool: number;
  tier1AvgAPY: number;
  
  tier2Count: number;
  tier2TotalStake: number;
  tier2DailyPool: number;
  tier2AvgAPY: number;
  
  tier3Count: number;
  tier3TotalStake: number;
  tier3DailyPool: number;
  tier3AvgAPY: number;
  
  // Security metrics
  attackCostUSD: number;
  securityScore: number;
  
  // Price context
  tburnPriceUSD: number;
}

export function generateTokenomicsSummary(
  validators: Array<{ stake: number; tier: ValidatorTier }>,
  delegatorCount: number,
  delegatorTotalStake: number,
  tburnPriceUSD: number,
  dailyFeesTBURN: number = 5000  // Estimated daily fees
): TokenomicsSummary {
  // Count validators by tier
  const tier1Validators = validators.filter(v => v.tier === ValidatorTier.TIER_1_COMMITTEE);
  const tier2Validators = validators.filter(v => v.tier === ValidatorTier.TIER_2_STANDBY);
  
  const tier1TotalStake = tier1Validators.reduce((sum, v) => sum + v.stake, 0);
  const tier2TotalStake = tier2Validators.reduce((sum, v) => sum + v.stake, 0);
  const tier3TotalStake = delegatorTotalStake;
  
  const totalStaked = tier1TotalStake + tier2TotalStake + tier3TotalStake;
  
  // Calculate emission
  const dailyGrossEmission = calculateAdaptiveEmission(totalStaked);
  const dailyBurn = calculateDailyBurn(dailyFeesTBURN);
  const dailyNetEmission = calculateNetDailyEmission(dailyGrossEmission, dailyBurn);
  
  // Calculate tier pools
  const tier1DailyPool = calculateTierRewardPool(ValidatorTier.TIER_1_COMMITTEE, dailyGrossEmission);
  const tier2DailyPool = calculateTierRewardPool(ValidatorTier.TIER_2_STANDBY, dailyGrossEmission);
  const tier3DailyPool = calculateTierRewardPool(ValidatorTier.TIER_3_DELEGATOR, dailyGrossEmission);
  
  // Calculate average APYs
  const tier1AvgReward = tier1Validators.length > 0 ? tier1DailyPool / tier1Validators.length : 0;
  const tier2AvgReward = tier2Validators.length > 0 ? tier2DailyPool / tier2Validators.length : 0;
  const tier3AvgReward = delegatorCount > 0 ? tier3DailyPool / delegatorCount : 0;
  
  const tier1AvgStake = tier1Validators.length > 0 ? tier1TotalStake / tier1Validators.length : VALIDATOR_TIERS[ValidatorTier.TIER_1_COMMITTEE].minStakeTBURN;
  const tier2AvgStake = tier2Validators.length > 0 ? tier2TotalStake / tier2Validators.length : VALIDATOR_TIERS[ValidatorTier.TIER_2_STANDBY].minStakeTBURN;
  const tier3AvgStake = delegatorCount > 0 ? tier3TotalStake / delegatorCount : VALIDATOR_TIERS[ValidatorTier.TIER_3_DELEGATOR].minStakeTBURN;
  
  return {
    totalSupply: TOKEN_CONSTANTS.TOTAL_SUPPLY,
    circulatingSupply: TOKEN_CONSTANTS.CIRCULATING_SUPPLY,
    totalStaked,
    stakingRatio: totalStaked / TOKEN_CONSTANTS.CIRCULATING_SUPPLY,
    
    dailyGrossEmission,
    dailyBurn,
    dailyNetEmission,
    annualInflationRate: (dailyNetEmission * 365) / TOKEN_CONSTANTS.CIRCULATING_SUPPLY,
    
    tier1Count: tier1Validators.length,
    tier1TotalStake,
    tier1DailyPool,
    tier1AvgAPY: calculateAPY(tier1AvgReward, tier1AvgStake),
    
    tier2Count: tier2Validators.length,
    tier2TotalStake,
    tier2DailyPool,
    tier2AvgAPY: calculateAPY(tier2AvgReward, tier2AvgStake),
    
    tier3Count: delegatorCount,
    tier3TotalStake,
    tier3DailyPool,
    tier3AvgAPY: calculateAPY(tier3AvgReward, tier3AvgStake),
    
    attackCostUSD: calculateAttackCost(totalStaked, tburnPriceUSD),
    securityScore: calculateSecurityScore(totalStaked, tier1Validators.length + tier2Validators.length),
    
    tburnPriceUSD,
  };
}

// ============================================
// ★ OFFICIAL GENESIS ALLOCATION (CANONICAL SOURCE)
// ============================================
// Total Supply: 100억 TBURN (10 Billion)
// This is the SINGLE SOURCE OF TRUTH for all tokenomics allocations
// All other files MUST reference these values

export const GENESIS_ALLOCATION = {
  TOTAL_SUPPLY: 10 * BILLION, // 100억 TBURN
  TOTAL_SUPPLY_FORMATTED: "10,000,000,000",
  
  // ============================================
  // COMMUNITY: 30% = 30억 TBURN (3B)
  // v4.3 베스팅 스케줄 적용
  // ============================================
  COMMUNITY: {
    percentage: 30,
    amount: 3 * BILLION, // 30억 TBURN
    amountFormatted: "3,000,000,000",
    subcategories: {
      AIRDROP: {
        percentage: 40,
        parentPercentage: 12, // 30% × 40% = 12%
        amount: 1.2 * BILLION, // 12억 TBURN
        amountFormatted: "1,200,000,000",
        description: "에어드랍",
        tgePercent: 10,      // v4.3: TGE 10%
        cliffMonths: 0,      // v4.3: 클리프 0M
        vestingMonths: 12,   // v4.3: 베스팅 12M (Y1 완료)
      },
      REFERRAL: {
        percentage: 10,
        parentPercentage: 3, // 30% × 10% = 3%
        amount: 0.3 * BILLION, // 3억 TBURN
        amountFormatted: "300,000,000",
        description: "레퍼럴",
        tgePercent: 5,       // v4.3: TGE 5%
        cliffMonths: 0,      // v4.3: 클리프 0M
        vestingMonths: 36,   // v4.3: 베스팅 36M (Y3 완료)
      },
      EVENTS: {
        percentage: 13.3,
        parentPercentage: 4, // 30% × 13.3% = 4%
        amount: 0.4 * BILLION, // 4억 TBURN
        amountFormatted: "400,000,000",
        description: "이벤트",
        tgePercent: 10,      // v4.3: TGE 10%
        cliffMonths: 0,      // v4.3: 클리프 0M
        vestingMonths: 24,   // v4.3: 베스팅 24M (Y2 완료)
      },
      COMMUNITY_ACTIVITY: {
        percentage: 10,
        parentPercentage: 3, // 30% × 10% = 3%
        amount: 0.3 * BILLION, // 3억 TBURN
        amountFormatted: "300,000,000",
        description: "커뮤니티활동",
        tgePercent: 0,       // v4.3: TGE 0%
        cliffMonths: 3,      // v4.3: 클리프 3M
        vestingMonths: 36,   // v4.3: 베스팅 36M (Y3+ 완료)
      },
      DAO_TREASURY: {
        percentage: 26.7,
        parentPercentage: 8, // 30% × 26.7% = 8%
        amount: 0.8 * BILLION, // 8억 TBURN
        amountFormatted: "800,000,000",
        description: "DAO 트레저리",
        tgePercent: 0,       // v4.3: TGE 0%
        cliffMonths: 12,     // v4.3: 클리프 12M
        vestingMonths: 48,   // v4.3: 베스팅 48M (Y5 완료)
      },
    },
  },
  
  // ============================================
  // REWARDS: 22% = 22억 TBURN (2.2B)
  // v4.3 베스팅 스케줄 적용 - 반감기 적용
  // ============================================
  REWARDS: {
    percentage: 22,
    amount: 2.2 * BILLION, // 22억 TBURN
    amountFormatted: "2,200,000,000",
    subcategories: {
      BLOCK_REWARDS: {
        percentage: 65.9,
        parentPercentage: 14.5, // 22% × 65.9% = 14.5%
        amount: 1.45 * BILLION, // 14.5억 TBURN
        amountFormatted: "1,450,000,000",
        description: "블록 보상",
        tgePercent: 0,       // v4.3: TGE 0% - 프로토콜 분배
        cliffMonths: 0,      // v4.3: 클리프 0M
        vestingMonths: 240,  // v4.3: 베스팅 240M (Y20 완료, 반감기 적용)
      },
      VALIDATOR_INCENTIVES: {
        percentage: 34.1,
        parentPercentage: 7.5, // 22% × 34.1% = 7.5%
        amount: 0.75 * BILLION, // 7.5억 TBURN
        amountFormatted: "750,000,000",
        description: "검증자 인센티브",
        tgePercent: 0,       // v4.3: TGE 0% - 성과 기반 분배
        cliffMonths: 0,      // v4.3: 클리프 0M
        vestingMonths: 60,   // v4.3: 베스팅 60M (Y5 완료)
      },
    },
  },
  
  // ============================================
  // INVESTORS: 20% = 20억 TBURN (2B)
  // v4.3 업계 표준 TGE 적용
  // ============================================
  INVESTORS: {
    percentage: 20,
    amount: 2 * BILLION, // 20억 TBURN
    amountFormatted: "2,000,000,000",
    subcategories: {
      SEED_ROUND: {
        percentage: 25,
        parentPercentage: 5, // 20% × 25% = 5%
        amount: 0.5 * BILLION, // 5억 TBURN
        amountFormatted: "500,000,000",
        description: "Seed Round (TGE 0%)",
        tgePercent: 0,       // v4.3: TGE 0% - 최저가 참여
        cliffMonths: 12,     // v4.3: 클리프 12M
        vestingMonths: 24,   // v4.3: 베스팅 24M (Y3 완료)
      },
      PRIVATE_ROUND: {
        percentage: 45,
        parentPercentage: 9, // 20% × 45% = 9%
        amount: 0.9 * BILLION, // 9억 TBURN
        amountFormatted: "900,000,000",
        description: "Private Round (TGE 5%)",
        tgePercent: 5,       // v4.3: TGE 5% - 중간가 참여
        cliffMonths: 9,      // v4.3: 클리프 9M
        vestingMonths: 18,   // v4.3: 베스팅 18M (Y2.5 완료)
      },
      PUBLIC_SALE: {
        percentage: 30,
        parentPercentage: 6, // 20% × 30% = 6%
        amount: 0.6 * BILLION, // 6억 TBURN
        amountFormatted: "600,000,000",
        description: "Public Sale (TGE 15%)",
        tgePercent: 15,      // v4.3: TGE 15% - 최고가 참여
        cliffMonths: 3,      // v4.3: 클리프 3M
        vestingMonths: 9,    // v4.3: 베스팅 9M (Y1 완료)
      },
    },
  },
  
  // ============================================
  // ECOSYSTEM: 14% = 14억 TBURN (1.4B)
  // v4.3 베스팅 스케줄 적용
  // ============================================
  ECOSYSTEM: {
    percentage: 14,
    amount: 1.4 * BILLION, // 14억 TBURN
    amountFormatted: "1,400,000,000",
    subcategories: {
      ECOSYSTEM_FUND: {
        percentage: 50,
        parentPercentage: 7, // 14% × 50% = 7%
        amount: 0.7 * BILLION, // 7억 TBURN
        amountFormatted: "700,000,000",
        description: "생태계 펀드",
        tgePercent: 0,       // v4.3: TGE 0% - 그랜트 기반
        cliffMonths: 0,      // v4.3: 클리프 0M
        vestingMonths: 60,   // v4.3: 베스팅 60M (Y5 완료)
      },
      PARTNERSHIP: {
        percentage: 28.6,
        parentPercentage: 4, // 14% × 28.6% = 4%
        amount: 0.4 * BILLION, // 4억 TBURN
        amountFormatted: "400,000,000",
        description: "파트너십",
        tgePercent: 0,       // v4.3: TGE 0%
        cliffMonths: 6,      // v4.3: 클리프 6M
        vestingMonths: 24,   // v4.3: 베스팅 24M (Y2.5 완료)
      },
      MARKETING: {
        percentage: 21.4,
        parentPercentage: 3, // 14% × 21.4% = 3%
        amount: 0.3 * BILLION, // 3억 TBURN
        amountFormatted: "300,000,000",
        description: "마케팅",
        tgePercent: 15,      // v4.3: TGE 15%
        cliffMonths: 0,      // v4.3: 클리프 0M
        vestingMonths: 24,   // v4.3: 베스팅 24M (Y2 완료)
      },
    },
  },
  
  // ============================================
  // TEAM: 11% = 11억 TBURN (1.1B)
  // v4.3 베스팅 스케줄 적용 - 가장 긴 락업
  // ============================================
  TEAM: {
    percentage: 11,
    amount: 1.1 * BILLION, // 11억 TBURN
    amountFormatted: "1,100,000,000",
    subcategories: {
      CORE_TEAM: {
        percentage: 63.6,
        parentPercentage: 7, // 11% × 63.6% = 7%
        amount: 0.7 * BILLION, // 7억 TBURN
        amountFormatted: "700,000,000",
        description: "코어 팀",
        tgePercent: 0,       // v4.3: TGE 0% - 가장 긴 락업
        cliffMonths: 18,     // v4.3: 클리프 18M
        vestingMonths: 36,   // v4.3: 베스팅 36M (Y4.5 완료)
      },
      ADVISOR: {
        percentage: 18.2,
        parentPercentage: 2, // 11% × 18.2% = 2%
        amount: 0.2 * BILLION, // 2억 TBURN
        amountFormatted: "200,000,000",
        description: "어드바이저",
        tgePercent: 0,       // v4.3: TGE 0%
        cliffMonths: 12,     // v4.3: 클리프 12M
        vestingMonths: 24,   // v4.3: 베스팅 24M (Y3 완료)
      },
      STRATEGIC_PARTNER: {
        percentage: 18.2,
        parentPercentage: 2, // 11% × 18.2% = 2%
        amount: 0.2 * BILLION, // 2억 TBURN
        amountFormatted: "200,000,000",
        description: "전략 파트너",
        tgePercent: 0,       // v4.3: TGE 0%
        cliffMonths: 6,      // v4.3: 클리프 6M
        vestingMonths: 18,   // v4.3: 베스팅 18M (Y2 완료)
      },
    },
  },
  
  // ============================================
  // FOUNDATION: 3% = 3억 TBURN (0.3B)
  // v4.3 신설 - 재단 운영 예비금
  // ============================================
  FOUNDATION: {
    percentage: 3,
    amount: 0.3 * BILLION, // 3억 TBURN
    amountFormatted: "300,000,000",
    subcategories: {
      OPERATIONS_RESERVE: {
        percentage: 50,
        parentPercentage: 1.5, // 3% × 50% = 1.5%
        amount: 0.15 * BILLION, // 1.5억 TBURN
        amountFormatted: "150,000,000",
        description: "운영 예비금 (TGE 30%)",
        tgePercent: 30,      // v4.3: TGE 30% - 초기 운영, 상장, 마켓메이킹
        cliffMonths: 0,      // v4.3: 클리프 0M
        vestingMonths: 24,   // v4.3: 베스팅 24M (Y2 완료)
      },
      EMERGENCY_RESERVE: {
        percentage: 33.3,
        parentPercentage: 1, // 3% × 33.3% = 1%
        amount: 0.1 * BILLION, // 1억 TBURN
        amountFormatted: "100,000,000",
        description: "긴급 예비금 (TGE 50%)",
        tgePercent: 50,      // v4.3: TGE 50% - 시장 방어, 보안 사고
        cliffMonths: 0,      // v4.3: 클리프 0M
        vestingMonths: 12,   // v4.3: 베스팅 12M (Y1 완료)
      },
      STRATEGIC_INVESTMENT: {
        percentage: 16.7,
        parentPercentage: 0.5, // 3% × 16.7% = 0.5%
        amount: 0.05 * BILLION, // 0.5억 TBURN
        amountFormatted: "50,000,000",
        description: "전략 투자",
        tgePercent: 0,       // v4.3: TGE 0%
        cliffMonths: 6,      // v4.3: 클리프 6M
        vestingMonths: 18,   // v4.3: 베스팅 18M (Y2 완료)
      },
    },
  },
} as const;

// Helper function to get category by key
export function getGenesisCategory(category: keyof typeof GENESIS_ALLOCATION) {
  return GENESIS_ALLOCATION[category];
}

// Validation function to ensure allocations sum to 100%
export function validateGenesisAllocations(): boolean {
  const totalPercent = 
    GENESIS_ALLOCATION.COMMUNITY.percentage +
    GENESIS_ALLOCATION.REWARDS.percentage +
    GENESIS_ALLOCATION.INVESTORS.percentage +
    GENESIS_ALLOCATION.ECOSYSTEM.percentage +
    GENESIS_ALLOCATION.TEAM.percentage +
    GENESIS_ALLOCATION.FOUNDATION.percentage;
  
  return Math.abs(totalPercent - 100) < 0.01; // Allow 0.01% tolerance
}
