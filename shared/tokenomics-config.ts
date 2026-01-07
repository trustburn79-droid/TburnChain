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
  CURRENT_PRICE_USD: 0.05,              // $0.05 USD per TBURN at mainnet launch
  
  // Investment round prices
  SEED_ROUND_PRICE: 0.008,              // $0.008 per TBURN (Seed investors)
  PRIVATE_ROUND_PRICE: 0.015,           // $0.015 per TBURN (Private investors)
  PUBLIC_ROUND_PRICE: 0.05,             // $0.05 per TBURN (Public sale)
  
  // IDO platform prices
  LAUNCHPAD_PRICE: 0.05,                // $0.05 per TBURN (Official Launchpad)
  COINLIST_PRICE: 0.05,                 // $0.05 per TBURN (CoinList sale)
  DAOMAKER_PRICE: 0.05,                 // $0.05 per TBURN (DAO Maker SHO)
  
  // Market metrics
  FULLY_DILUTED_VALUATION: 500000000,   // $500M FDV at $0.05
  MARKET_CAP_AT_LAUNCH: 350000000,      // $350M (7B circulating × $0.05)
  
  // Price history (for reference)
  GENESIS_PRICE: 0.05,                  // Launch price
  ATH_PRICE: 0.05,                      // All-time high (at launch)
  ATL_PRICE: 0.05,                      // All-time low (at launch)
};

// ============================================
// Validator Tier System
// ============================================
export enum ValidatorTier {
  TIER_1_COMMITTEE = 'tier_1_committee',     // Active Committee
  TIER_2_STANDBY = 'tier_2_standby',         // Standby Validators
  TIER_3_DELEGATOR = 'tier_3_delegator',     // Delegators
}

export interface TierConfig {
  tier: ValidatorTier;
  name: string;
  displayName: string;
  maxParticipants: number;
  minStakeTBURN: number;
  minStakeWei: string;
  rewardPoolShare: number;           // Percentage of daily emission (0-1)
  targetAPY: number;                 // Target APY in percentage (e.g., 8.0)
  apyRange: { min: number; max: number };
  description: string;
  benefits: string[];
}

export const VALIDATOR_TIERS: Record<ValidatorTier, TierConfig> = {
  [ValidatorTier.TIER_1_COMMITTEE]: {
    tier: ValidatorTier.TIER_1_COMMITTEE,
    name: 'tier_1_committee',
    displayName: 'Active Committee',
    maxParticipants: 512,
    minStakeTBURN: 20_000_000,       // 20M TBURN (scaled 100x for 10B supply)
    minStakeWei: (BigInt(20_000_000) * BigInt(10 ** 18)).toString(),
    rewardPoolShare: 0.50,           // 50% of daily emission (250,000 TBURN/day)
    targetAPY: 8.0,
    apyRange: { min: 6.0, max: 10.0 },
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
    maxParticipants: 4_488,
    minStakeTBURN: 5_000_000,        // 5M TBURN (scaled 100x for 10B supply)
    minStakeWei: (BigInt(5_000_000) * BigInt(10 ** 18)).toString(),
    rewardPoolShare: 0.30,           // 30% of daily emission (150,000 TBURN/day)
    targetAPY: 4.0,
    apyRange: { min: 3.0, max: 5.0 },
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
    maxParticipants: -1,             // Unlimited
    minStakeTBURN: 10_000,           // 10K TBURN (scaled 100x for 10B supply)
    minStakeWei: (BigInt(10_000) * BigInt(10 ** 18)).toString(),
    rewardPoolShare: 0.20,           // 20% of daily emission (100,000 TBURN/day)
    targetAPY: 5.0,
    apyRange: { min: 4.0, max: 6.0 },
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
      },
      REFERRAL: {
        percentage: 10,
        parentPercentage: 3, // 30% × 10% = 3%
        amount: 0.3 * BILLION, // 3억 TBURN
        amountFormatted: "300,000,000",
        description: "레퍼럴",
      },
      EVENTS: {
        percentage: 13.3,
        parentPercentage: 4, // 30% × 13.3% = 4%
        amount: 0.4 * BILLION, // 4억 TBURN
        amountFormatted: "400,000,000",
        description: "이벤트",
      },
      COMMUNITY_ACTIVITY: {
        percentage: 10,
        parentPercentage: 3, // 30% × 10% = 3%
        amount: 0.3 * BILLION, // 3억 TBURN
        amountFormatted: "300,000,000",
        description: "커뮤니티활동",
      },
      DAO_TREASURY: {
        percentage: 26.7,
        parentPercentage: 8, // 30% × 26.7% = 8%
        amount: 0.8 * BILLION, // 8억 TBURN
        amountFormatted: "800,000,000",
        description: "DAO 트레저리",
      },
    },
  },
  
  // ============================================
  // REWARDS: 22% = 22억 TBURN (2.2B)
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
      },
      VALIDATOR_INCENTIVES: {
        percentage: 34.1,
        parentPercentage: 7.5, // 22% × 34.1% = 7.5%
        amount: 0.75 * BILLION, // 7.5억 TBURN
        amountFormatted: "750,000,000",
        description: "검증자 인센티브",
      },
    },
  },
  
  // ============================================
  // INVESTORS: 20% = 20억 TBURN (2B)
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
        tgePercent: 0,
        description: "Seed Round (TGE 0%)",
      },
      PRIVATE_ROUND: {
        percentage: 45,
        parentPercentage: 9, // 20% × 45% = 9%
        amount: 0.9 * BILLION, // 9억 TBURN
        amountFormatted: "900,000,000",
        tgePercent: 5,
        description: "Private Round (TGE 5%)",
      },
      PUBLIC_SALE: {
        percentage: 30,
        parentPercentage: 6, // 20% × 30% = 6%
        amount: 0.6 * BILLION, // 6억 TBURN
        amountFormatted: "600,000,000",
        tgePercent: 15,
        description: "Public Sale (TGE 15%)",
      },
    },
  },
  
  // ============================================
  // ECOSYSTEM: 14% = 14억 TBURN (1.4B)
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
      },
      PARTNERSHIP: {
        percentage: 28.6,
        parentPercentage: 4, // 14% × 28.6% = 4%
        amount: 0.4 * BILLION, // 4억 TBURN
        amountFormatted: "400,000,000",
        description: "파트너십",
      },
      MARKETING: {
        percentage: 21.4,
        parentPercentage: 3, // 14% × 21.4% = 3%
        amount: 0.3 * BILLION, // 3억 TBURN
        amountFormatted: "300,000,000",
        description: "마케팅",
      },
    },
  },
  
  // ============================================
  // TEAM: 11% = 11억 TBURN (1.1B)
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
      },
      ADVISOR: {
        percentage: 18.2,
        parentPercentage: 2, // 11% × 18.2% = 2%
        amount: 0.2 * BILLION, // 2억 TBURN
        amountFormatted: "200,000,000",
        description: "어드바이저",
      },
      STRATEGIC_PARTNER: {
        percentage: 18.2,
        parentPercentage: 2, // 11% × 18.2% = 2%
        amount: 0.2 * BILLION, // 2억 TBURN
        amountFormatted: "200,000,000",
        description: "전략 파트너",
      },
    },
  },
  
  // ============================================
  // FOUNDATION: 3% = 3억 TBURN (0.3B)
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
        tgePercent: 30,
        description: "운영 예비금 (TGE 30%)",
      },
      EMERGENCY_RESERVE: {
        percentage: 33.3,
        parentPercentage: 1, // 3% × 33.3% = 1%
        amount: 0.1 * BILLION, // 1억 TBURN
        amountFormatted: "100,000,000",
        tgePercent: 50,
        description: "긴급 예비금 (TGE 50%)",
      },
      STRATEGIC_INVESTMENT: {
        percentage: 16.7,
        parentPercentage: 0.5, // 3% × 16.7% = 0.5%
        amount: 0.05 * BILLION, // 0.5억 TBURN
        amountFormatted: "50,000,000",
        description: "전략 투자",
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
