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
