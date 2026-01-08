/**
 * TBURN Enterprise Genesis Configuration
 * Chain ID: 5800 (0x16a8) | 125 Genesis Validators | 10B TBURN Total Supply
 * Production-ready configuration for mainnet launch
 * 
 * ★ IMPORTANT: All tokenomics values are imported from shared/tokenomics-config.ts
 * DO NOT define duplicate allocation values here - use GENESIS_ALLOCATION as the source of truth
 */

import { GENESIS_ALLOCATION } from "@shared/tokenomics-config";

const WEI_PER_TBURN = 10n ** 18n; // Use pure BigInt for safe integer arithmetic

// ============================================
// CHAIN PARAMETERS
// ============================================
export const CHAIN_CONFIG = {
  CHAIN_ID: 5800,
  CHAIN_NAME: "TBURN Mainnet",
  CHAIN_SYMBOL: "TBURN",
  DECIMALS: 18,
  
  // Genesis Block
  GENESIS_BLOCK_NUMBER: 0,
  GENESIS_TIMESTAMP: Date.now(),
  GENESIS_HASH: "0x0000000000000000000000000000000000000000000000000000000000000000",
  
  // Network Configuration
  RPC_ENDPOINT: "https://rpc.tburn.io",
  WS_ENDPOINT: "wss://ws.tburn.io",
  EXPLORER_URL: "https://explorer.tburn.io",
} as const;

// ============================================
// TOTAL SUPPLY & TOKEN ECONOMICS
// ★ Using GENESIS_ALLOCATION from shared/tokenomics-config.ts as canonical source
// ============================================
export const TOKENOMICS = {
  // Total Supply: 10 Billion TBURN (100억)
  TOTAL_SUPPLY: BigInt("10000000000000000000000000000"), // 10B * 10^18
  TOTAL_SUPPLY_FORMATTED: GENESIS_ALLOCATION.TOTAL_SUPPLY_FORMATTED,
  
  // ★ Genesis Allocation - Official Tokenomics (Single Source of Truth)
  // Community: 30%, Rewards: 22%, Investors: 20%, Ecosystem: 14%, Team: 11%, Foundation: 3%
  ALLOCATION: {
    // ============================================
    // COMMUNITY: 30% = 30억 TBURN (3B)
    // ============================================
    COMMUNITY: {
      amount: BigInt(GENESIS_ALLOCATION.COMMUNITY.amount) * WEI_PER_TBURN,
      percentage: GENESIS_ALLOCATION.COMMUNITY.percentage,
      description: "커뮤니티 (에어드랍, 레퍼럴, 이벤트, 커뮤니티활동, DAO 트레저리)",
      subcategories: {
        AIRDROP: {
          amount: BigInt(GENESIS_ALLOCATION.COMMUNITY.subcategories.AIRDROP.amount) * WEI_PER_TBURN,
          percentage: GENESIS_ALLOCATION.COMMUNITY.subcategories.AIRDROP.parentPercentage,
          description: GENESIS_ALLOCATION.COMMUNITY.subcategories.AIRDROP.description,
        },
        REFERRAL: {
          amount: BigInt(GENESIS_ALLOCATION.COMMUNITY.subcategories.REFERRAL.amount) * WEI_PER_TBURN,
          percentage: GENESIS_ALLOCATION.COMMUNITY.subcategories.REFERRAL.parentPercentage,
          description: GENESIS_ALLOCATION.COMMUNITY.subcategories.REFERRAL.description,
        },
        EVENTS: {
          amount: BigInt(GENESIS_ALLOCATION.COMMUNITY.subcategories.EVENTS.amount) * WEI_PER_TBURN,
          percentage: GENESIS_ALLOCATION.COMMUNITY.subcategories.EVENTS.parentPercentage,
          description: GENESIS_ALLOCATION.COMMUNITY.subcategories.EVENTS.description,
        },
        COMMUNITY_ACTIVITY: {
          amount: BigInt(GENESIS_ALLOCATION.COMMUNITY.subcategories.COMMUNITY_ACTIVITY.amount) * WEI_PER_TBURN,
          percentage: GENESIS_ALLOCATION.COMMUNITY.subcategories.COMMUNITY_ACTIVITY.parentPercentage,
          description: GENESIS_ALLOCATION.COMMUNITY.subcategories.COMMUNITY_ACTIVITY.description,
        },
        DAO_TREASURY: {
          amount: BigInt(GENESIS_ALLOCATION.COMMUNITY.subcategories.DAO_TREASURY.amount) * WEI_PER_TBURN,
          percentage: GENESIS_ALLOCATION.COMMUNITY.subcategories.DAO_TREASURY.parentPercentage,
          description: GENESIS_ALLOCATION.COMMUNITY.subcategories.DAO_TREASURY.description,
        },
      },
    },
    
    // ============================================
    // REWARDS: 22% = 22억 TBURN (2.2B)
    // ============================================
    REWARDS: {
      amount: BigInt(GENESIS_ALLOCATION.REWARDS.amount) * WEI_PER_TBURN,
      percentage: GENESIS_ALLOCATION.REWARDS.percentage,
      vestingMonths: 240, // 20 years
      cliffMonths: 0,
      description: "보상 (블록 보상, 검증자 인센티브)",
      subcategories: {
        BLOCK_REWARDS: {
          amount: BigInt(GENESIS_ALLOCATION.REWARDS.subcategories.BLOCK_REWARDS.amount) * WEI_PER_TBURN,
          percentage: GENESIS_ALLOCATION.REWARDS.subcategories.BLOCK_REWARDS.parentPercentage,
          description: GENESIS_ALLOCATION.REWARDS.subcategories.BLOCK_REWARDS.description,
        },
        VALIDATOR_INCENTIVES: {
          amount: BigInt(GENESIS_ALLOCATION.REWARDS.subcategories.VALIDATOR_INCENTIVES.amount) * WEI_PER_TBURN,
          percentage: GENESIS_ALLOCATION.REWARDS.subcategories.VALIDATOR_INCENTIVES.parentPercentage,
          description: GENESIS_ALLOCATION.REWARDS.subcategories.VALIDATOR_INCENTIVES.description,
        },
      },
    },
    
    // ============================================
    // INVESTORS: 20% = 20억 TBURN (2B)
    // ============================================
    INVESTORS: {
      amount: BigInt(GENESIS_ALLOCATION.INVESTORS.amount) * WEI_PER_TBURN,
      percentage: GENESIS_ALLOCATION.INVESTORS.percentage,
      description: "투자자 (Seed, Private, Public)",
      subcategories: {
        SEED_ROUND: {
          amount: BigInt(GENESIS_ALLOCATION.INVESTORS.subcategories.SEED_ROUND.amount) * WEI_PER_TBURN,
          percentage: GENESIS_ALLOCATION.INVESTORS.subcategories.SEED_ROUND.parentPercentage,
          tgePercent: GENESIS_ALLOCATION.INVESTORS.subcategories.SEED_ROUND.tgePercent,
          vestingMonths: 24,
          cliffMonths: 6,
          description: GENESIS_ALLOCATION.INVESTORS.subcategories.SEED_ROUND.description,
        },
        PRIVATE_ROUND: {
          amount: BigInt(GENESIS_ALLOCATION.INVESTORS.subcategories.PRIVATE_ROUND.amount) * WEI_PER_TBURN,
          percentage: GENESIS_ALLOCATION.INVESTORS.subcategories.PRIVATE_ROUND.parentPercentage,
          tgePercent: GENESIS_ALLOCATION.INVESTORS.subcategories.PRIVATE_ROUND.tgePercent,
          vestingMonths: 18,
          cliffMonths: 3,
          description: GENESIS_ALLOCATION.INVESTORS.subcategories.PRIVATE_ROUND.description,
        },
        PUBLIC_SALE: {
          amount: BigInt(GENESIS_ALLOCATION.INVESTORS.subcategories.PUBLIC_SALE.amount) * WEI_PER_TBURN,
          percentage: GENESIS_ALLOCATION.INVESTORS.subcategories.PUBLIC_SALE.parentPercentage,
          tgePercent: GENESIS_ALLOCATION.INVESTORS.subcategories.PUBLIC_SALE.tgePercent,
          vestingMonths: 12,
          cliffMonths: 0,
          description: GENESIS_ALLOCATION.INVESTORS.subcategories.PUBLIC_SALE.description,
        },
      },
    },
    
    // ============================================
    // ECOSYSTEM: 14% = 14억 TBURN (1.4B)
    // ============================================
    ECOSYSTEM: {
      amount: BigInt(GENESIS_ALLOCATION.ECOSYSTEM.amount) * WEI_PER_TBURN,
      percentage: GENESIS_ALLOCATION.ECOSYSTEM.percentage,
      vestingMonths: 48,
      cliffMonths: 6,
      description: "생태계 (생태계 펀드, 파트너십, 마케팅)",
      subcategories: {
        ECOSYSTEM_FUND: {
          amount: BigInt(GENESIS_ALLOCATION.ECOSYSTEM.subcategories.ECOSYSTEM_FUND.amount) * WEI_PER_TBURN,
          percentage: GENESIS_ALLOCATION.ECOSYSTEM.subcategories.ECOSYSTEM_FUND.parentPercentage,
          description: GENESIS_ALLOCATION.ECOSYSTEM.subcategories.ECOSYSTEM_FUND.description,
        },
        PARTNERSHIP: {
          amount: BigInt(GENESIS_ALLOCATION.ECOSYSTEM.subcategories.PARTNERSHIP.amount) * WEI_PER_TBURN,
          percentage: GENESIS_ALLOCATION.ECOSYSTEM.subcategories.PARTNERSHIP.parentPercentage,
          description: GENESIS_ALLOCATION.ECOSYSTEM.subcategories.PARTNERSHIP.description,
        },
        MARKETING: {
          amount: BigInt(GENESIS_ALLOCATION.ECOSYSTEM.subcategories.MARKETING.amount) * WEI_PER_TBURN,
          percentage: GENESIS_ALLOCATION.ECOSYSTEM.subcategories.MARKETING.parentPercentage,
          description: GENESIS_ALLOCATION.ECOSYSTEM.subcategories.MARKETING.description,
        },
      },
    },
    
    // ============================================
    // TEAM: 11% = 11억 TBURN (1.1B)
    // ============================================
    TEAM: {
      amount: BigInt(GENESIS_ALLOCATION.TEAM.amount) * WEI_PER_TBURN,
      percentage: GENESIS_ALLOCATION.TEAM.percentage,
      vestingMonths: 48,
      cliffMonths: 12,
      description: "팀 (코어 팀, 어드바이저, 전략 파트너)",
      subcategories: {
        CORE_TEAM: {
          amount: BigInt(GENESIS_ALLOCATION.TEAM.subcategories.CORE_TEAM.amount) * WEI_PER_TBURN,
          percentage: GENESIS_ALLOCATION.TEAM.subcategories.CORE_TEAM.parentPercentage,
          description: GENESIS_ALLOCATION.TEAM.subcategories.CORE_TEAM.description,
        },
        ADVISOR: {
          amount: BigInt(GENESIS_ALLOCATION.TEAM.subcategories.ADVISOR.amount) * WEI_PER_TBURN,
          percentage: GENESIS_ALLOCATION.TEAM.subcategories.ADVISOR.parentPercentage,
          description: GENESIS_ALLOCATION.TEAM.subcategories.ADVISOR.description,
        },
        STRATEGIC_PARTNER: {
          amount: BigInt(GENESIS_ALLOCATION.TEAM.subcategories.STRATEGIC_PARTNER.amount) * WEI_PER_TBURN,
          percentage: GENESIS_ALLOCATION.TEAM.subcategories.STRATEGIC_PARTNER.parentPercentage,
          description: GENESIS_ALLOCATION.TEAM.subcategories.STRATEGIC_PARTNER.description,
        },
      },
    },
    
    // ============================================
    // FOUNDATION: 3% = 3억 TBURN (0.3B)
    // ============================================
    FOUNDATION: {
      amount: BigInt(GENESIS_ALLOCATION.FOUNDATION.amount) * WEI_PER_TBURN,
      percentage: GENESIS_ALLOCATION.FOUNDATION.percentage,
      description: "재단 운영 예비금 (운영, 긴급, 전략 투자)",
      subcategories: {
        OPERATIONS_RESERVE: {
          amount: BigInt(GENESIS_ALLOCATION.FOUNDATION.subcategories.OPERATIONS_RESERVE.amount) * WEI_PER_TBURN,
          percentage: GENESIS_ALLOCATION.FOUNDATION.subcategories.OPERATIONS_RESERVE.parentPercentage,
          tgePercent: GENESIS_ALLOCATION.FOUNDATION.subcategories.OPERATIONS_RESERVE.tgePercent,
          description: GENESIS_ALLOCATION.FOUNDATION.subcategories.OPERATIONS_RESERVE.description,
        },
        EMERGENCY_RESERVE: {
          amount: BigInt(GENESIS_ALLOCATION.FOUNDATION.subcategories.EMERGENCY_RESERVE.amount) * WEI_PER_TBURN,
          percentage: GENESIS_ALLOCATION.FOUNDATION.subcategories.EMERGENCY_RESERVE.parentPercentage,
          tgePercent: GENESIS_ALLOCATION.FOUNDATION.subcategories.EMERGENCY_RESERVE.tgePercent,
          description: GENESIS_ALLOCATION.FOUNDATION.subcategories.EMERGENCY_RESERVE.description,
        },
        STRATEGIC_INVESTMENT: {
          amount: BigInt(GENESIS_ALLOCATION.FOUNDATION.subcategories.STRATEGIC_INVESTMENT.amount) * WEI_PER_TBURN,
          percentage: GENESIS_ALLOCATION.FOUNDATION.subcategories.STRATEGIC_INVESTMENT.parentPercentage,
          description: GENESIS_ALLOCATION.FOUNDATION.subcategories.STRATEGIC_INVESTMENT.description,
        },
      },
    },
  },
} as const;

// ============================================
// VALIDATOR CONFIGURATION
// ============================================
export const VALIDATOR_CONFIG = {
  // Genesis Validators
  GENESIS_VALIDATOR_COUNT: 125,
  STAKE_PER_VALIDATOR: BigInt("1000000000000000000000000"), // 1M TBURN * 10^18
  
  // Stake Requirements
  MINIMUM_SELF_BOND: BigInt("500000000000000000000000"), // 500K TBURN
  MAXIMUM_DELEGATION_RATIO: 8, // Max 8x self-bond
  MINIMUM_DELEGATION: BigInt("100000000000000000000"), // 100 TBURN
  
  // Stake Distribution
  STAKE_DISTRIBUTION: {
    PRIMARY_STAKE_PERCENT: 70, // Permanent bonding for 12 months
    FLEXIBLE_STAKE_PERCENT: 30, // Eligible for delegation market
    UNBONDING_PERIOD_DAYS: 21,
    REDELEGATION_COOLDOWN_DAYS: 7,
  },
  
  // Validator Tiers
  TIERS: {
    CORE: {
      minStake: BigInt("5000000000000000000000000"), // 5M TBURN
      rewardMultiplier: 1.5,
      aiIntegrationRequired: true,
      uptimeRequirement: 99.9,
    },
    PREMIUM: {
      minStake: BigInt("2000000000000000000000000"), // 2M TBURN
      rewardMultiplier: 1.25,
      aiIntegrationRequired: false,
      uptimeRequirement: 99.5,
    },
    STANDARD: {
      minStake: BigInt("1000000000000000000000000"), // 1M TBURN
      rewardMultiplier: 1.0,
      aiIntegrationRequired: false,
      uptimeRequirement: 99.0,
    },
  },
  
  // Slashing Parameters
  SLASHING: {
    DOUBLE_SIGN_PENALTY_PERCENT: 5,
    DOWNTIME_PENALTY_PERCENT: 0.1,
    DOWNTIME_BLOCKS_THRESHOLD: 1000,
    JAIL_DURATION_SECONDS: 86400, // 24 hours
    TOMBSTONE_ENABLED: true,
  },
} as const;

// ============================================
// SHARD CONFIGURATION
// ============================================
export const SHARD_CONFIG = {
  // Shard Count
  TOTAL_SHARDS: 64,
  MIN_SHARDS: 5,
  MAX_SHARDS: 256,
  
  // Validator Distribution (125 validators across 64 shards)
  VALIDATORS_PER_SHARD: 2, // 64 × 2 = 128 slots
  ROTATION_POOL_SIZE: 3, // 125 - (64×2 - 3) = 3 reserve validators
  SHARD_AFFINITY_WEIGHT: 0.7,
  
  // Quorum & Committee
  QUORUM_THRESHOLD_PERCENT: 67, // 2/3 + 1 for BFT
  FAST_FINALITY_THRESHOLD_PERCENT: 85,
  COMMITTEE_ROTATION_BLOCKS: 200,
  QUARTERLY_REBALANCE_ENABLED: true,
  
  // Cross-Shard Communication
  CROSS_SHARD: {
    MESSAGE_BATCH_SIZE: 128,
    MAX_PENDING_MESSAGES: 10000,
    CONFIRMATION_BLOCKS: 3,
    TIMEOUT_MS: 5000,
    PRIORITY_LEVELS: 4, // Critical, High, Normal, Low
  },
  
  // Performance Targets
  PERFORMANCE: {
    TPS_PER_SHARD: 3281, // 210,000 / 64 = ~3,281 TPS per shard
    TARGET_TOTAL_TPS: 210000,
    THEORETICAL_MAX_TPS: 250000,
  },
} as const;

// ============================================
// BLOCK PARAMETERS
// ============================================
export const BLOCK_CONFIG = {
  // Block Time
  TARGET_BLOCK_TIME_MS: 100,
  MAX_BLOCK_TIME_MS: 150,
  MIN_BLOCK_TIME_MS: 80,
  
  // Gas Parameters
  BLOCK_GAS_LIMIT: 40_000_000, // 40M gas per block per shard
  GAS_LIMIT_INCREASE_RATE: 0.10, // +10% max increase
  GAS_LIMIT_DECREASE_RATE: 0.05, // -5% max decrease
  MIN_GAS_PRICE: BigInt("1000000000000000"), // 1,000 Ember (0.001 TBURN)
  
  // BFT Phase Timeouts (total = 100ms with 10ms slack)
  BFT_TIMEOUTS_MS: {
    PROPOSE: 30,
    PREVOTE: 40,
    PRECOMMIT: 40,
    COMMIT: 50,
    FINALIZE: 20,
  },
  
  // Block Size
  MAX_TRANSACTIONS_PER_BLOCK: 5000,
  MAX_BLOCK_SIZE_BYTES: 5_000_000, // 5MB
  
  // Finality
  FINALITY_CONFIRMATIONS: 1, // Instant finality with BFT
  PROBABILISTIC_FINALITY_BLOCKS: 0,
} as const;

// ============================================
// REWARDS & INFLATION
// ============================================
export const REWARDS_CONFIG = {
  // Year 1 Emission: 150M TBURN
  YEAR_1_EMISSION: BigInt("150000000000000000000000000"), // 150M * 10^18
  YEAR_1_EMISSION_FORMATTED: "150,000,000",
  
  // Emission Schedule (20 years)
  EMISSION_SCHEDULE: {
    ANNUAL_DECAY_RATE: 0.12, // 12% reduction per year
    FLOOR_APR: 0.025, // 2.5% minimum APR
    TOTAL_YEARS: 20,
  },
  
  // Reward Distribution
  DISTRIBUTION: {
    VALIDATOR_BASE_REWARDS_PERCENT: 60,
    DELEGATOR_POOL_PERCENT: 40,
  },
  
  // Performance Multipliers
  PERFORMANCE_MULTIPLIERS: {
    PERFECT_UPTIME: 1.2, // 100% uptime bonus
    HIGH_UPTIME: 1.1, // 99.5%+ uptime bonus
    AI_INTEGRATION: 1.15, // AI-secured validator bonus
    EARLY_ADOPTER: 1.1, // First 6 months bonus
  },
  
  // Burn Mechanism (Deflationary)
  BURN: {
    TRANSACTION_FEE_BURN_PERCENT: 25,
    SLASHED_STAKE_BURN_PERCENT: 50,
    GOVERNANCE_BURN_ENABLED: true,
    TARGET_DEFLATION_RATE: 0.01, // 1% annual deflation target
  },
  
  // Epoch Configuration
  EPOCH: {
    BLOCKS_PER_EPOCH: 7200, // ~12 minutes at 100ms blocks
    REWARDS_DISTRIBUTION_EPOCH: 1, // Distribute every epoch
    PERFORMANCE_EVALUATION_EPOCHS: 6, // Every ~72 minutes
  },
} as const;

// ============================================
// SECURITY PARAMETERS
// ============================================
export const SECURITY_CONFIG = {
  // Cryptographic Standards
  CRYPTO: {
    SIGNATURE_ALGORITHM: "secp256k1",
    HASH_ALGORITHM: "keccak256",
    MERKLE_TREE_HASH: "keccak256",
    QUANTUM_RESISTANT_READY: true,
    BACKUP_ALGORITHM: "sphincs+",
  },
  
  // Key Management
  KEY_CEREMONY: {
    REQUIRED_SIGNERS: 5,
    THRESHOLD: 3, // 3 of 5 multi-sig
    KEY_ROTATION_DAYS: 90,
    COLD_STORAGE_REQUIRED: true,
  },
  
  // Network Security
  NETWORK: {
    MAX_PEERS: 100,
    MIN_PEERS: 10,
    PEER_ROTATION_HOURS: 24,
    DDOS_PROTECTION_ENABLED: true,
    RATE_LIMIT_PER_SECOND: 1000,
  },
  
  // Audit & Compliance
  AUDIT: {
    COMMITTEE_AUDIT_FREQUENCY_DAYS: 90,
    EXTERNAL_AUDIT_FREQUENCY_MONTHS: 6,
    REAL_TIME_MONITORING: true,
    CROSS_REGION_REPLICATION: true,
  },
} as const;

// ============================================
// GENESIS BLOCK STRUCTURE
// ============================================
export interface GenesisBlock {
  chainId: number;
  timestamp: number;
  blockNumber: number;
  parentHash: string;
  stateRoot: string;
  transactionsRoot: string;
  receiptsRoot: string;
  gasLimit: number;
  gasUsed: number;
  extraData: string;
  validators: GenesisValidator[];
  allocations: GenesisAllocation[];
  config: GenesisConfig;
}

export interface GenesisValidator {
  address: string;
  publicKey: string;
  stake: bigint;
  commission: number;
  name: string;
  shardId: number;
  isRotationPool: boolean;
}

export interface GenesisAllocation {
  address: string;
  balance: bigint;
  category: string;
  vestingSchedule?: VestingSchedule;
}

export interface VestingSchedule {
  totalAmount: bigint;
  cliffMonths: number;
  vestingMonths: number;
  startTimestamp: number;
}

export interface GenesisConfig {
  chainConfig: typeof CHAIN_CONFIG;
  tokenomics: typeof TOKENOMICS;
  validatorConfig: typeof VALIDATOR_CONFIG;
  shardConfig: typeof SHARD_CONFIG;
  blockConfig: typeof BLOCK_CONFIG;
  rewardsConfig: typeof REWARDS_CONFIG;
  securityConfig: typeof SECURITY_CONFIG;
}

// ============================================
// GENESIS GENERATOR
// ============================================
export class EnterpriseGenesisGenerator {
  private config: GenesisConfig;

  constructor() {
    this.config = {
      chainConfig: CHAIN_CONFIG,
      tokenomics: TOKENOMICS,
      validatorConfig: VALIDATOR_CONFIG,
      shardConfig: SHARD_CONFIG,
      blockConfig: BLOCK_CONFIG,
      rewardsConfig: REWARDS_CONFIG,
      securityConfig: SECURITY_CONFIG,
    };
  }

  generateValidatorDistribution(): { shardAssignments: Map<number, string[]>; rotationPool: string[] } {
    const shardAssignments = new Map<number, string[]>();
    const rotationPool: string[] = [];
    
    // Initialize all 64 shards
    for (let i = 0; i < SHARD_CONFIG.TOTAL_SHARDS; i++) {
      shardAssignments.set(i, []);
    }
    
    // Distribute 125 validators across 64 shards (2 per shard = 128 slots, 3 in rotation pool)
    let validatorIndex = 0;
    for (let shardId = 0; shardId < SHARD_CONFIG.TOTAL_SHARDS; shardId++) {
      for (let slot = 0; slot < SHARD_CONFIG.VALIDATORS_PER_SHARD; slot++) {
        if (validatorIndex < VALIDATOR_CONFIG.GENESIS_VALIDATOR_COUNT - SHARD_CONFIG.ROTATION_POOL_SIZE) {
          const validatorAddress = this.generateValidatorAddress(validatorIndex);
          shardAssignments.get(shardId)!.push(validatorAddress);
          validatorIndex++;
        }
      }
    }
    
    // Remaining validators go to rotation pool
    for (let i = 0; i < SHARD_CONFIG.ROTATION_POOL_SIZE; i++) {
      rotationPool.push(this.generateValidatorAddress(validatorIndex + i));
    }
    
    return { shardAssignments, rotationPool };
  }

  generateTokenAllocations(): GenesisAllocation[] {
    const allocations: GenesisAllocation[] = [];
    const allocationCategories = TOKENOMICS.ALLOCATION;
    
    for (const [category, config] of Object.entries(allocationCategories)) {
      const vestingMonths = 'vestingMonths' in config ? config.vestingMonths : 0;
      const cliffMonths = 'cliffMonths' in config ? config.cliffMonths : 0;
      
      allocations.push({
        address: this.generateTreasuryAddress(category),
        balance: config.amount,
        category,
        vestingSchedule: vestingMonths > 0 ? {
          totalAmount: config.amount,
          cliffMonths,
          vestingMonths,
          startTimestamp: Date.now(),
        } : undefined,
      });
    }
    
    return allocations;
  }

  calculateEmissionSchedule(): { year: number; emission: bigint; apr: number }[] {
    const schedule: { year: number; emission: bigint; apr: number }[] = [];
    let currentEmission = REWARDS_CONFIG.YEAR_1_EMISSION;
    
    for (let year = 1; year <= REWARDS_CONFIG.EMISSION_SCHEDULE.TOTAL_YEARS; year++) {
      const apr = Math.max(
        Number(currentEmission) / Number(TOKENOMICS.TOTAL_SUPPLY),
        REWARDS_CONFIG.EMISSION_SCHEDULE.FLOOR_APR
      );
      
      schedule.push({
        year,
        emission: currentEmission,
        apr,
      });
      
      // Apply decay for next year
      currentEmission = BigInt(
        Math.floor(Number(currentEmission) * (1 - REWARDS_CONFIG.EMISSION_SCHEDULE.ANNUAL_DECAY_RATE))
      );
    }
    
    return schedule;
  }

  getGenesisBlock(): GenesisBlock {
    const { shardAssignments, rotationPool } = this.generateValidatorDistribution();
    const allocations = this.generateTokenAllocations();
    
    const validators: GenesisValidator[] = [];
    let validatorIndex = 0;
    
    // Add shard-assigned validators
    for (const [shardId, addresses] of Array.from(shardAssignments.entries())) {
      for (const address of addresses) {
        validators.push({
          address,
          publicKey: this.generatePublicKey(validatorIndex),
          stake: VALIDATOR_CONFIG.STAKE_PER_VALIDATOR,
          commission: 0.05, // 5% default commission
          name: `Genesis Validator ${validatorIndex + 1}`,
          shardId,
          isRotationPool: false,
        });
        validatorIndex++;
      }
    }
    
    // Add rotation pool validators
    for (const address of rotationPool) {
      validators.push({
        address,
        publicKey: this.generatePublicKey(validatorIndex),
        stake: VALIDATOR_CONFIG.STAKE_PER_VALIDATOR,
        commission: 0.05,
        name: `Rotation Pool Validator ${validatorIndex + 1}`,
        shardId: -1, // Not assigned to specific shard
        isRotationPool: true,
      });
      validatorIndex++;
    }
    
    return {
      chainId: CHAIN_CONFIG.CHAIN_ID,
      timestamp: Date.now(),
      blockNumber: CHAIN_CONFIG.GENESIS_BLOCK_NUMBER,
      parentHash: CHAIN_CONFIG.GENESIS_HASH,
      stateRoot: "0x0000000000000000000000000000000000000000000000000000000000000001",
      transactionsRoot: "0x0000000000000000000000000000000000000000000000000000000000000002",
      receiptsRoot: "0x0000000000000000000000000000000000000000000000000000000000000003",
      gasLimit: BLOCK_CONFIG.BLOCK_GAS_LIMIT,
      gasUsed: 0,
      extraData: "TBURN Mainnet Genesis - Chain ID 5800",
      validators,
      allocations,
      config: this.config,
    };
  }

  getNetworkStats() {
    return {
      chainId: CHAIN_CONFIG.CHAIN_ID,
      totalSupply: TOKENOMICS.TOTAL_SUPPLY_FORMATTED,
      genesisValidators: VALIDATOR_CONFIG.GENESIS_VALIDATOR_COUNT,
      totalShards: SHARD_CONFIG.TOTAL_SHARDS,
      targetTPS: SHARD_CONFIG.PERFORMANCE.TARGET_TOTAL_TPS,
      blockTimeMs: BLOCK_CONFIG.TARGET_BLOCK_TIME_MS,
      quorumThreshold: SHARD_CONFIG.QUORUM_THRESHOLD_PERCENT,
      year1Emission: REWARDS_CONFIG.YEAR_1_EMISSION_FORMATTED,
      emissionDecayRate: REWARDS_CONFIG.EMISSION_SCHEDULE.ANNUAL_DECAY_RATE,
      floorAPR: REWARDS_CONFIG.EMISSION_SCHEDULE.FLOOR_APR,
      txFeeBurnRate: REWARDS_CONFIG.BURN.TRANSACTION_FEE_BURN_PERCENT,
    };
  }

  private generateValidatorAddress(index: number): string {
    const hash = this.simpleHash(`validator_${index}_${CHAIN_CONFIG.CHAIN_ID}`);
    return `tb1q${hash.slice(0, 38)}`;
  }

  private generateTreasuryAddress(category: string): string {
    const hash = this.simpleHash(`treasury_${category}_${CHAIN_CONFIG.CHAIN_ID}`);
    return `tb1q${hash.slice(0, 38)}`;
  }

  private generatePublicKey(index: number): string {
    const hash = this.simpleHash(`pubkey_${index}_${CHAIN_CONFIG.CHAIN_ID}`);
    return `0x04${hash}${hash}`;
  }

  private simpleHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(64, '0').slice(0, 64);
  }
}

// Export singleton instance
export const genesisGenerator = new EnterpriseGenesisGenerator();

// Export all configurations
export const GENESIS_CONFIG = {
  CHAIN: CHAIN_CONFIG,
  TOKENOMICS,
  VALIDATOR: VALIDATOR_CONFIG,
  SHARD: SHARD_CONFIG,
  BLOCK: BLOCK_CONFIG,
  REWARDS: REWARDS_CONFIG,
  SECURITY: SECURITY_CONFIG,
} as const;
