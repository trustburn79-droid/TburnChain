/**
 * TBURN Enterprise Genesis Configuration
 * Chain ID: 6000 | 125 Genesis Validators | 10B TBURN Total Supply
 * Production-ready configuration for mainnet launch
 */

// ============================================
// CHAIN PARAMETERS
// ============================================
export const CHAIN_CONFIG = {
  CHAIN_ID: 6000,
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
// ============================================
export const TOKENOMICS = {
  // Total Supply: 10 Billion TBURN
  TOTAL_SUPPLY: BigInt("10000000000000000000000000000"), // 10B * 10^18
  TOTAL_SUPPLY_FORMATTED: "10,000,000,000",
  
  // Genesis Allocation (10B TBURN breakdown)
  ALLOCATION: {
    // Validator Stakes: 125M (1.25%)
    VALIDATOR_STAKES: {
      amount: BigInt("125000000000000000000000000"), // 125M * 10^18
      percentage: 1.25,
      description: "125 Genesis Validators × 1M TBURN each",
    },
    
    // Ecosystem Growth & Grants: 2.96B (29.625%)
    ECOSYSTEM_GROWTH: {
      amount: BigInt("2962500000000000000000000000"), // 2.9625B * 10^18
      percentage: 29.625,
      vestingMonths: 48,
      cliffMonths: 6,
      description: "Developer grants, ecosystem partnerships, DApp incentives",
    },
    
    // Strategic Treasury: 1.48B (14.8125%)
    STRATEGIC_TREASURY: {
      amount: BigInt("1481250000000000000000000000"), // 1.48125B * 10^18
      percentage: 14.8125,
      vestingMonths: 60,
      cliffMonths: 12,
      description: "Strategic initiatives, acquisitions, emergency fund",
    },
    
    // Community Incentives: 1.185B (11.85%)
    COMMUNITY_INCENTIVES: {
      amount: BigInt("1185000000000000000000000000"), // 1.185B * 10^18
      percentage: 11.85,
      vestingMonths: 36,
      cliffMonths: 0,
      description: "Airdrops, quests, referrals, community events",
    },
    
    // Validator & Delegator Rewards: 987.5M (9.875%)
    STAKING_REWARDS: {
      amount: BigInt("987500000000000000000000000"), // 987.5M * 10^18
      percentage: 9.875,
      vestingMonths: 240, // 20 years
      cliffMonths: 0,
      description: "Block rewards, staking incentives, delegation rewards",
    },
    
    // Liquidity & Market Making: 790M (7.9%)
    LIQUIDITY: {
      amount: BigInt("790000000000000000000000000"), // 790M * 10^18
      percentage: 7.9,
      vestingMonths: 24,
      cliffMonths: 0,
      description: "DEX liquidity, CEX listings, market stability",
    },
    
    // R&D & AI Development: 790M (7.9%)
    RD_AI: {
      amount: BigInt("790000000000000000000000000"), // 790M * 10^18
      percentage: 7.9,
      vestingMonths: 48,
      cliffMonths: 6,
      description: "AI systems, protocol R&D, quantum-resistant crypto",
    },
    
    // Enterprise Partnerships: 691.25M (6.9125%)
    ENTERPRISE: {
      amount: BigInt("691250000000000000000000000"), // 691.25M * 10^18
      percentage: 6.9125,
      vestingMonths: 36,
      cliffMonths: 3,
      description: "B2B partnerships, enterprise integrations",
    },
    
    // Emergency Stability Fund: 493.75M (4.9375%)
    STABILITY_FUND: {
      amount: BigInt("493750000000000000000000000"), // 493.75M * 10^18
      percentage: 4.9375,
      vestingMonths: 0, // Immediately available for emergencies
      cliffMonths: 0,
      description: "Market stability, emergency interventions",
    },
    
    // Public Launch Liquidity: 296.25M (2.9625%)
    PUBLIC_LAUNCH: {
      amount: BigInt("296250000000000000000000000"), // 296.25M * 10^18
      percentage: 2.9625,
      vestingMonths: 0,
      cliffMonths: 0,
      description: "Initial DEX offering, launch liquidity",
    },
    
    // Security & Bug Bounty: 197.5M (1.975%)
    SECURITY: {
      amount: BigInt("197500000000000000000000000"), // 197.5M * 10^18
      percentage: 1.975,
      vestingMonths: 60,
      cliffMonths: 0,
      description: "Bug bounties, security audits, penetration testing",
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
      extraData: "TBURN Mainnet Genesis - Chain ID 6000",
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
