import { IStorage } from "./storage";
import { Validator, NetworkStats, InsertConsensusRound, InsertBlock, InsertCrossShardMessage, Shard } from "@shared/schema";
import * as crypto from 'crypto';
import { getEnterpriseNode } from "./services/TBurnEnterpriseNode";

// TBURN v7.0 Enterprise Validator Configuration
// Dynamic scaling: 16 shards = 400 validators, 32 = 800, 64 = 1600, 128 = 3200
// Shard-based validator formula: TOTAL_VALIDATORS = SHARD_COUNT * VALIDATORS_PER_SHARD
interface DynamicValidatorConfig {
  TOTAL_VALIDATORS: number;
  ACTIVE_VALIDATORS: number;
  COMMITTEE_SIZE: number;
  EPOCH_DURATION: number;
  BLOCK_TIME: number;
  BASE_VOTING_POWER: string;
  DELEGATION_MULTIPLIER: number;
  QUORUM_THRESHOLD: number;
  SHARD_COUNT: number;
  VALIDATORS_PER_SHARD: number;
}

// Default configuration (will be dynamically updated based on shard settings)
let ENTERPRISE_VALIDATORS_CONFIG: DynamicValidatorConfig = {
  TOTAL_VALIDATORS: 125,           // Default: 5 shards * 25 validators
  ACTIVE_VALIDATORS: 110,          // 88% active
  COMMITTEE_SIZE: 21,              // BFT committee size
  EPOCH_DURATION: 60000,           // 1 minute epochs
  BLOCK_TIME: 100,                 // PRODUCTION: 100ms for optimal 10 blocks/second
  BASE_VOTING_POWER: "50000000000000000000000", // 50,000 TBURN base
  DELEGATION_MULTIPLIER: 1.5,
  QUORUM_THRESHOLD: 6700,          // 67% in basis points
  SHARD_COUNT: 5,                  // Default shard count
  VALIDATORS_PER_SHARD: 25,        // Base validators per shard
};

// Update configuration based on shard count
function updateValidatorConfigForShards(shardCount: number, validatorsPerShard: number = 25): void {
  const totalValidators = shardCount * validatorsPerShard;
  const activeValidators = Math.floor(totalValidators * 0.88); // 88% active
  const committeeSize = Math.min(21, Math.floor(totalValidators * 0.05)); // 5% or max 21
  
  ENTERPRISE_VALIDATORS_CONFIG = {
    ...ENTERPRISE_VALIDATORS_CONFIG,
    TOTAL_VALIDATORS: totalValidators,
    ACTIVE_VALIDATORS: activeValidators,
    COMMITTEE_SIZE: Math.max(7, committeeSize), // Minimum 7 for BFT
    SHARD_COUNT: shardCount,
    VALIDATORS_PER_SHARD: validatorsPerShard,
  };
  
  console.log(`🔄 Validator config updated: ${shardCount} shards × ${validatorsPerShard} validators = ${totalValidators} total`);
}

// Enterprise-grade validator names and profiles
const VALIDATOR_PROFILES = [
  // Top Tier Infrastructure Providers
  { name: "Binance Staking", category: "exchange", region: "global", reputation: 9800 },
  { name: "Coinbase Cloud", category: "exchange", region: "north-america", reputation: 9700 },
  { name: "Kraken Validator", category: "exchange", region: "europe", reputation: 9600 },
  { name: "OKX Pool", category: "exchange", region: "asia", reputation: 9500 },
  { name: "Huobi Global", category: "exchange", region: "asia", reputation: 9400 },
  
  // Professional Staking Services
  { name: "Figment Networks", category: "professional", region: "north-america", reputation: 9750 },
  { name: "Staked.us", category: "professional", region: "north-america", reputation: 9650 },
  { name: "Chorus One", category: "professional", region: "europe", reputation: 9600 },
  { name: "P2P Validator", category: "professional", region: "europe", reputation: 9550 },
  { name: "Everstake", category: "professional", region: "europe", reputation: 9500 },
  { name: "StakeWith.Us", category: "professional", region: "asia", reputation: 9450 },
  { name: "InfStones", category: "professional", region: "global", reputation: 9400 },
  { name: "Blockdaemon", category: "professional", region: "north-america", reputation: 9350 },
  { name: "Allnodes", category: "professional", region: "europe", reputation: 9300 },
  { name: "HashQuark", category: "professional", region: "asia", reputation: 9250 },
  
  // Institutional Validators
  { name: "Galaxy Digital", category: "institutional", region: "north-america", reputation: 9200 },
  { name: "Paradigm Capital", category: "institutional", region: "north-america", reputation: 9150 },
  { name: "Jump Crypto", category: "institutional", region: "north-america", reputation: 9100 },
  { name: "Alameda Research", category: "institutional", region: "global", reputation: 9050 },
  { name: "Three Arrows Capital", category: "institutional", region: "asia", reputation: 9000 },
  
  // Cloud Infrastructure Providers
  { name: "AWS Validator Node", category: "cloud", region: "global", reputation: 8950 },
  { name: "Google Cloud Validator", category: "cloud", region: "global", reputation: 8900 },
  { name: "Azure Blockchain", category: "cloud", region: "global", reputation: 8850 },
  { name: "Digital Ocean Node", category: "cloud", region: "north-america", reputation: 8800 },
  { name: "Alibaba Cloud", category: "cloud", region: "asia", reputation: 8750 },
  
  // Decentralized Pools
  { name: "Lido Finance", category: "defi", region: "global", reputation: 8700 },
  { name: "Rocket Pool", category: "defi", region: "global", reputation: 8650 },
  { name: "StakeDAO", category: "defi", region: "europe", reputation: 8600 },
  { name: "Ankr Network", category: "defi", region: "global", reputation: 8550 },
  { name: "Stafi Protocol", category: "defi", region: "asia", reputation: 8500 },
];

// Generate remaining validators programmatically
// targetCount allows dynamic generation for different shard configurations
function generateRemainingValidators(targetCount?: number): typeof VALIDATOR_PROFILES {
  const total = targetCount || ENTERPRISE_VALIDATORS_CONFIG.TOTAL_VALIDATORS;
  const regions = ["north-america", "europe", "asia", "oceania", "south-america", "africa"];
  const categories = ["community", "regional", "enterprise", "infrastructure", "institutional", "defi"];
  const remaining: typeof VALIDATOR_PROFILES = [];
  
  // For large validator counts, use tiered naming
  for (let i = VALIDATOR_PROFILES.length; i < total; i++) {
    const regionIndex = i % regions.length;
    const region = regions[regionIndex];
    const categoryIndex = Math.floor((i - VALIDATOR_PROFILES.length) / 50) % categories.length;
    const category = categories[categoryIndex];
    const tier = Math.floor(i / 100) + 1;
    const localIndex = (i - VALIDATOR_PROFILES.length) % 100 + 1;
    
    // Create meaningful validator names based on tier and region
    const tierName = tier <= 3 ? ['Core', 'Prime', 'Elite'][tier - 1] : `Tier-${tier}`;
    const regionCapitalized = region.charAt(0).toUpperCase() + region.slice(1).replace('-', ' ');
    
    remaining.push({
      name: `${regionCapitalized} ${tierName} Validator ${localIndex}`,
      category,
      region,
      // Reputation scales with tier: higher tiers have slightly lower base reputation
      reputation: Math.max(6500, 8500 - tier * 100 - (localIndex * 5))
    });
  }
  
  return [...VALIDATOR_PROFILES, ...remaining];
}

// Helper to map phase strings to integers for database
const PHASE_MAPPING: Record<string, number> = {
  'propose': 1,
  'prevote': 2,
  'precommit': 3,
  'commit': 4,
  'complete': 5,
};

export class ValidatorSimulationService {
  private storage: IStorage;
  private validators: Validator[] = [];
  private currentEpoch: number = 1;
  private currentRound: number = 1;
  private currentBlockHeight: number = 1245678;
  private isRunning: boolean = false;
  private epochInterval: NodeJS.Timeout | null = null;
  private blockInterval: NodeJS.Timeout | null = null;
  private crossShardInterval: NodeJS.Timeout | null = null;
  
  // Committee caching for performance optimization
  private cachedCommittee: Validator[] = [];
  private lastCommitteeEpoch: number = 0;
  
  // Reentrancy guard to prevent overlapping interval executions
  private isProcessingBlock: boolean = false;
  
  // Dynamic shard configuration
  private currentShardCount: number = 5;
  private validatorsPerShard: number = 25;
  
  // Shard caching for performance optimization (avoids repeated DB queries)
  private cachedShards: Shard[] = [];
  private shardCacheTimestamp: number = 0;
  private static readonly SHARD_CACHE_TTL_MS: number = 30000; // 30 second TTL
  
  // Cross-shard message buffer for batch insertion with priority queue
  private crossShardMessageBuffer: InsertCrossShardMessage[] = [];
  private static readonly MESSAGE_BUFFER_SIZE: number = 10;
  private static readonly MESSAGE_FLUSH_INTERVAL_MS: number = 5000;
  private messageFlushInterval: NodeJS.Timeout | null = null;
  
  // Priority queue weights for routing optimization
  private static readonly PRIORITY_WEIGHT = 0.4;      // routingPriority weight
  private static readonly REPUTATION_WEIGHT = 0.35;   // peerReputation weight
  private static readonly NETWORK_WEIGHT = 0.25;      // networkQuality weight

  constructor(storage: IStorage) {
    this.storage = storage;
  }
  
  // Calculate composite priority score for message routing (higher = more priority)
  private calculateMessagePriority(msg: InsertCrossShardMessage): number {
    const priority = (msg.routingPriority ?? 5) / 10;           // Normalize 1-10 to 0.1-1.0
    const reputation = (msg.peerReputation ?? 8000) / 10000;    // Normalize 0-10000 to 0-1.0
    const network = (msg.networkQuality ?? 9000) / 10000;       // Normalize 0-10000 to 0-1.0
    
    return (priority * ValidatorSimulationService.PRIORITY_WEIGHT) +
           (reputation * ValidatorSimulationService.REPUTATION_WEIGHT) +
           (network * ValidatorSimulationService.NETWORK_WEIGHT);
  }
  
  // Sort buffer by priority before flushing (highest priority first)
  private sortBufferByPriority(): void {
    this.crossShardMessageBuffer.sort((a, b) => {
      return this.calculateMessagePriority(b) - this.calculateMessagePriority(a);
    });
  }
  
  // Get cached shards with automatic refresh on TTL expiry
  private async getCachedShards(): Promise<Shard[]> {
    const now = Date.now();
    if (this.cachedShards.length === 0 || (now - this.shardCacheTimestamp) > ValidatorSimulationService.SHARD_CACHE_TTL_MS) {
      this.cachedShards = await this.storage.getAllShards();
      this.shardCacheTimestamp = now;
    }
    return this.cachedShards;
  }
  
  // Invalidate shard cache (call when shard configuration changes)
  public invalidateShardCache(): void {
    this.cachedShards = [];
    this.shardCacheTimestamp = 0;
  }
  
  // Flush message buffer to database with batch insert (priority-sorted)
  private async flushMessageBuffer(): Promise<void> {
    if (this.crossShardMessageBuffer.length === 0) return;
    
    // Sort by priority before flushing (highest priority first for ordered processing)
    this.sortBufferByPriority();
    
    const messages = [...this.crossShardMessageBuffer];
    this.crossShardMessageBuffer = [];
    
    try {
      await this.storage.batchCreateCrossShardMessages(messages);
    } catch (error: any) {
      // On failure, try individual inserts as fallback (still in priority order)
      for (const msg of messages) {
        try {
          await this.storage.createCrossShardMessage(msg);
        } catch (innerError: any) {
          if (innerError?.code !== '23505') {
            console.error("Error creating cross-shard message:", innerError);
          }
        }
      }
    }
  }
  
  // Update shard configuration and scale validators dynamically
  public async updateShardConfiguration(shardCount: number, validatorsPerShard: number = 25): Promise<{
    success: boolean;
    message: string;
    previousValidators: number;
    newValidators: number;
    shardCount: number;
  }> {
    const previousCount = ENTERPRISE_VALIDATORS_CONFIG.TOTAL_VALIDATORS;
    const newCount = shardCount * validatorsPerShard;
    
    console.log(`🔄 Updating validator configuration: ${previousCount} → ${newCount} validators (${shardCount} shards)`);
    
    // Update the global configuration
    updateValidatorConfigForShards(shardCount, validatorsPerShard);
    this.currentShardCount = shardCount;
    this.validatorsPerShard = validatorsPerShard;
    
    // Handle scale-up: create additional validators
    if (newCount > this.validators.length) {
      await this.scaleUpValidators(newCount);
    }
    // Handle scale-down: trim validators and delete from storage
    else if (newCount < this.validators.length) {
      console.log(`📉 Scaling down validators: ${this.validators.length} → ${newCount}`);
      const validatorsToRemove = this.validators.slice(newCount);
      const idsToDelete = validatorsToRemove.map(v => v.id);
      const deletedCount = await this.storage.deleteValidatorsByIds(idsToDelete);
      console.log(`🗑️ Deleted ${deletedCount} validators from storage`);
      this.validators = this.validators.slice(0, newCount);
    }
    
    // Recompute validator status to match new ACTIVE_VALIDATORS count
    this.recomputeValidatorStatus();
    
    // Invalidate committee cache
    this.invalidateCommitteeCache();
    
    return {
      success: true,
      message: `Scaled validators for ${shardCount} shards: ${this.validators.length} validators`,
      previousValidators: previousCount,
      newValidators: this.validators.length,
      shardCount
    };
  }
  
  // Recompute validator status to ensure correct active/inactive distribution
  private recomputeValidatorStatus(): void {
    const targetActive = ENTERPRISE_VALIDATORS_CONFIG.ACTIVE_VALIDATORS;
    let activeCount = 0;
    
    for (let i = 0; i < this.validators.length; i++) {
      if (i < targetActive) {
        this.validators[i].status = "active";
        activeCount++;
      } else {
        this.validators[i].status = "inactive";
      }
    }
    
    console.log(`✅ Recomputed validator status: ${activeCount} active, ${this.validators.length - activeCount} inactive`);
  }
  
  // Scale up validators to reach target count
  private async scaleUpValidators(targetCount: number): Promise<void> {
    const currentCount = this.validators.length;
    const missingCount = targetCount - currentCount;
    
    if (missingCount <= 0) return;
    
    console.log(`📈 Scaling up validators: creating ${missingCount} additional validators`);
    
    const allProfiles = generateRemainingValidators(targetCount);
    
    for (let i = currentCount; i < targetCount; i++) {
      const profile = allProfiles[i];
      const address = this.generateValidatorAddress(i);
      
      const baseStake = BigInt(ENTERPRISE_VALIDATORS_CONFIG.BASE_VOTING_POWER);
      const stakeFactor = BigInt(profile.reputation) / BigInt(1000);
      const stake = (baseStake * stakeFactor).toString();
      const votingPower = BigInt(stake) + BigInt("0");
      
      const validator: Validator = {
        id: `val-${i}`,
        address,
        name: profile.name,
        stake,
        delegatedStake: "0",
        votingPower: votingPower.toString(),
        commission: 100 + Math.floor(Math.random() * 900),
        apy: 450 + Math.floor(Math.random() * 350),
        uptime: 9500 + Math.floor(Math.random() * 500),
        status: i < ENTERPRISE_VALIDATORS_CONFIG.ACTIVE_VALIDATORS ? "active" : "inactive",
        rewardEarned: BigInt(Math.floor(Math.random() * 10000 * 1e18)).toString(),
        slashCount: Math.floor(Math.random() * 3),
        reputationScore: profile.reputation,
        performanceScore: 8500 + Math.floor(Math.random() * 1500),
        aiTrustScore: 8000 + Math.floor(Math.random() * 2000),
        behaviorScore: 8500 + Math.floor(Math.random() * 1500),
        adaptiveWeight: 8000 + Math.floor(Math.random() * 2000),
        totalBlocks: Math.floor(Math.random() * 1000),
        avgBlockTime: 350 + Math.floor(Math.random() * 150),
        missedBlocks: Math.floor(Math.random() * 50),
        delegators: 10 + Math.floor(Math.random() * 990),
        joinedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        lastActiveAt: new Date(),
      };
      
      await this.storage.createValidator(validator);
      this.validators.push(validator);
    }
    
    console.log(`✅ Scaled up to ${this.validators.length} validators`);
  }
  
  // Get current validator configuration
  public getValidatorConfig(): {
    totalValidators: number;
    activeValidators: number;
    committeeSize: number;
    shardCount: number;
    validatorsPerShard: number;
  } {
    return {
      totalValidators: ENTERPRISE_VALIDATORS_CONFIG.TOTAL_VALIDATORS,
      activeValidators: ENTERPRISE_VALIDATORS_CONFIG.ACTIVE_VALIDATORS,
      committeeSize: ENTERPRISE_VALIDATORS_CONFIG.COMMITTEE_SIZE,
      shardCount: this.currentShardCount,
      validatorsPerShard: this.validatorsPerShard
    };
  }

  // Generate deterministic validator address
  private generateValidatorAddress(index: number): string {
    const hash = crypto.createHash('sha256')
      .update(`tburn-validator-${index}`)
      .digest('hex');
    return `0x${hash.substring(0, 40)}`;
  }

  // Calculate voting power based on stake and delegations
  private calculateVotingPower(stake: string, delegations: string): string {
    const stakeAmount = BigInt(stake);
    const delegationAmount = BigInt(delegations);
    const votingPower = stakeAmount + (delegationAmount * BigInt(Math.floor(ENTERPRISE_VALIDATORS_CONFIG.DELEGATION_MULTIPLIER * 100)) / BigInt(100));
    return votingPower.toString();
  }

  // Initialize validators based on shard configuration
  // Supports dynamic scaling: 16 shards = 400, 32 = 800, 64 = 1600, 128 = 3200 validators
  public async initializeValidators(shardCount?: number, validatorsPerShard?: number): Promise<void> {
    // Update configuration if shard parameters provided
    if (shardCount !== undefined) {
      updateValidatorConfigForShards(shardCount, validatorsPerShard || 25);
      this.currentShardCount = shardCount;
      this.validatorsPerShard = validatorsPerShard || 25;
    }
    
    const targetValidators = ENTERPRISE_VALIDATORS_CONFIG.TOTAL_VALIDATORS;
    console.log(`🚀 Initializing ${targetValidators} Enterprise Validators (${this.currentShardCount} shards × ${this.validatorsPerShard} validators)...`);
    
    // Get latest block height from database to avoid duplicates
    const recentBlocks = await this.storage.getRecentBlocks(1);
    if (recentBlocks.length > 0) {
      this.currentBlockHeight = recentBlocks[0].blockNumber + 1;
      console.log(`📦 Resuming from block height: ${this.currentBlockHeight}`);
    } else {
      this.currentBlockHeight = 1245678; // Start from default if no blocks exist
      console.log(`📦 Starting from initial block height: ${this.currentBlockHeight}`);
    }
    
    // Check if validators already exist
    const existingValidators = await this.storage.getAllValidators();
    
    if (existingValidators.length >= targetValidators) {
      console.log(`✅ Found ${existingValidators.length} validators, using first ${targetValidators}`);
      // Use existing validators up to target count
      this.validators = existingValidators.slice(0, targetValidators).map((v, i) => ({
        ...v,
        committee: i < ENTERPRISE_VALIDATORS_CONFIG.COMMITTEE_SIZE,
        votingHistory: v.votingHistory || 9000 + Math.floor(Math.random() * 1000),
      }));
      return;
    }
    
    if (existingValidators.length > 0 && existingValidators.length < targetValidators) {
      console.log(`📊 Found ${existingValidators.length} existing validators, creating ${targetValidators - existingValidators.length} more to reach ${targetValidators} total`);
      // Use existing validators
      this.validators = existingValidators.map((v, i) => ({
        ...v,
        committee: i < ENTERPRISE_VALIDATORS_CONFIG.COMMITTEE_SIZE,
        votingHistory: v.votingHistory || 9000 + Math.floor(Math.random() * 1000),
      }));
      
      // Create only the missing validators to reach target count
      const missingCount = targetValidators - existingValidators.length;
      const startIndex = existingValidators.length;
      
      // Generate and save the missing validators
      const allProfiles = generateRemainingValidators(targetValidators);
      for (let i = 0; i < missingCount; i++) {
        const index = startIndex + i;
        const profile = allProfiles[index];
        const address = this.generateValidatorAddress(index);
        
        const baseStake = BigInt(ENTERPRISE_VALIDATORS_CONFIG.BASE_VOTING_POWER);
        const stakeFactor = BigInt(profile.reputation) / BigInt(1000);
        const stake = (baseStake * stakeFactor).toString();
        
        // Calculate voting power as stake + delegated stake
        const votingPower = BigInt(stake) + BigInt("0"); // delegatedStake starts at 0
        
        const validator: Validator = {
          id: `val-${index}`,
          address,
          name: profile.name,
          stake,
          delegatedStake: "0",
          votingPower: votingPower.toString(), // Add votingPower field
          commission: 100 + Math.floor(Math.random() * 900),
          apy: 450 + Math.floor(Math.random() * 350),
          uptime: 9500 + Math.floor(Math.random() * 500),
          status: index < ENTERPRISE_VALIDATORS_CONFIG.ACTIVE_VALIDATORS ? "active" : "inactive",
          rewardEarned: BigInt(Math.floor(Math.random() * 10000 * 1e18)).toString(), // 0-10,000 TBURN earned
          slashCount: Math.floor(Math.random() * 3), // Add slashCount
          reputationScore: profile.reputation,
          performanceScore: 8500 + Math.floor(Math.random() * 1500),
          aiTrustScore: 8000 + Math.floor(Math.random() * 2000),
          behaviorScore: 8500 + Math.floor(Math.random() * 1500),
          adaptiveWeight: 8000 + Math.floor(Math.random() * 2000),
          totalBlocks: Math.floor(Math.random() * 1000),
          avgBlockTime: 350 + Math.floor(Math.random() * 150), // Add avgBlockTime (in ms)
          missedBlocks: Math.floor(Math.random() * 50), // Add missedBlocks
          delegators: 10 + Math.floor(Math.random() * 990),
          joinedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
          lastActiveAt: new Date(),
        };
        
        try {
          await this.storage.createValidator(validator);
          this.validators.push(validator);
        } catch (error: any) {
          if (error?.code === '23505') {
            // Validator already exists, skip
            console.log(`[Validator] Skipping existing validator: ${validator.id}`);
          } else {
            throw error;
          }
        }
      }
      
      console.log(`✅ Created new validators, total now: ${this.validators.length}`);
      return;
    }
    
    const allProfiles = generateRemainingValidators(targetValidators);
    const validators: Validator[] = [];
    
    for (let i = 0; i < targetValidators; i++) {
      const profile = allProfiles[i];
      const address = this.generateValidatorAddress(i);
      const isActive = i < ENTERPRISE_VALIDATORS_CONFIG.ACTIVE_VALIDATORS;
      
      // Calculate stake based on tier (Total supply: 100M TBURN)
      // Top validators: 200,000 - 800,000 TBURN
      // Average validators: 50,000 - 200,000 TBURN
      const reputationFactor = profile.reputation / 10000; // 0.7 - 0.98
      const baseTBURN = 50000 + (750000 * reputationFactor); // 50k-800k TBURN
      const stake = BigInt(Math.floor(baseTBURN * 1e18)).toString(); // Convert to Wei
      
      // Generate realistic metrics
      const uptime = 9500 + Math.floor(Math.random() * 500); // 95-99.99%
      const commission = 100 + Math.floor(Math.random() * 900); // 1-10%
      const apy = 450 + Math.floor(Math.random() * 350); // 4.5-8%
      
      // Calculate voting power as stake + delegated stake
      const votingPower = BigInt(stake) + BigInt("0"); // delegatedStake starts at 0
      
      const validator: Validator = {
        id: `val-${i}`,
        address,
        name: profile.name,
        stake,
        delegatedStake: "0", // Add delegatedStake
        votingPower: votingPower.toString(), // Add votingPower
        commission,
        apy,
        uptime,
        status: isActive ? "active" : "inactive",
        rewardEarned: BigInt(Math.floor(Math.random() * 10000 * 1e18)).toString(), // 0-10,000 TBURN earned
        slashCount: Math.floor(Math.random() * 3), // Add slashCount
        
        // AI-Enhanced BFT Metrics
        reputationScore: profile.reputation,
        performanceScore: 8500 + Math.floor(Math.random() * 1500),
        aiTrustScore: 8000 + Math.floor(Math.random() * 2000),
        behaviorScore: 8500 + Math.floor(Math.random() * 1500),
        adaptiveWeight: 8000 + Math.floor(Math.random() * 2000),
        committeeSelectionCount: i < ENTERPRISE_VALIDATORS_CONFIG.COMMITTEE_SIZE ? Math.floor(Math.random() * 100) + 10 : 0,
        
        totalBlocks: Math.floor(Math.random() * 1000),
        avgBlockTime: 350 + Math.floor(Math.random() * 150), // Add avgBlockTime (in ms)
        missedBlocks: Math.floor(Math.random() * 50), // Add missedBlocks
        delegators: 10 + Math.floor(Math.random() * 990),
        
        joinedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Random time in last year
        lastActiveAt: new Date(),
      };
      
      validators.push(validator);
    }
    
    // Store validators
    for (const validator of validators) {
      await this.storage.createValidator(validator);
    }
    
    this.validators = validators;
    console.log(`✅ Initialized ${validators.length} validators for ${this.currentShardCount} shards`);
    console.log(`   - Active: ${ENTERPRISE_VALIDATORS_CONFIG.ACTIVE_VALIDATORS}`);
    console.log(`   - Committee: ${ENTERPRISE_VALIDATORS_CONFIG.COMMITTEE_SIZE}`);
    console.log(`   - Shards: ${this.currentShardCount} × ${this.validatorsPerShard} validators`);
  }

  // Public method to invalidate committee cache (call when validator state changes mid-epoch)
  public invalidateCommitteeCache(): void {
    this.lastCommitteeEpoch = 0;
    this.cachedCommittee = [];
  }

  // Get committee validators with caching (recalculates on epoch change or cache invalidation)
  private getCommitteeValidators(): Validator[] {
    if (this.currentEpoch !== this.lastCommitteeEpoch || this.cachedCommittee.length === 0) {
      this.cachedCommittee = [...this.validators]
        .sort((a, b) => {
          const aVotingPower = BigInt(a.votingPower);
          const bVotingPower = BigInt(b.votingPower);
          if (aVotingPower > bVotingPower) return -1;
          if (aVotingPower < bVotingPower) return 1;
          return 0;
        })
        .slice(0, ENTERPRISE_VALIDATORS_CONFIG.COMMITTEE_SIZE);
      this.lastCommitteeEpoch = this.currentEpoch;
    }
    return this.cachedCommittee;
  }

  // Simulate consensus round with voting
  private async simulateConsensusRound(): Promise<void> {
    // Committee is cached and recalculated only on epoch change
    const committeeValidators = this.getCommitteeValidators();
    
    if (committeeValidators.length === 0) {
      console.warn("No committee validators available for consensus round");
      return;
    }
    
    const proposer = committeeValidators[this.currentRound % committeeValidators.length];
    const totalVotingPower = committeeValidators.reduce((sum, v) => {
      return sum + BigInt(this.calculateVotingPower(v.stake, "0"));
    }, BigInt(0));
    
    // Get total active validators (all 125 that are active, not just committee)
    const activeValidators = this.validators.filter(v => v.status === "active");
    const totalActiveValidators = activeValidators.length;
    const requiredQuorum = Math.ceil(totalActiveValidators * ENTERPRISE_VALIDATORS_CONFIG.QUORUM_THRESHOLD / 10000);
    
    // 88-95% of active validators participate in prevote (high consensus rate)
    const prevoteCount = Math.floor(totalActiveValidators * (0.88 + Math.random() * 0.07));
    // 85-95% participate in precommit (high consensus rate)
    const precommitCount = Math.floor(totalActiveValidators * (0.85 + Math.random() * 0.10));
    
    // AI-BFT Consensus: AI Pre-Validation makes validator confirmation faster
    // 5-phase: AI Pre-Validation(5-9ms), Propose(15-19ms), Prevote(18-21ms), Precommit(15-19ms), Commit(20-24ms)
    const phaseTimings = [
      5 + Math.floor(Math.random() * 5),   // AI Pre-Validation: 5-9ms (AI handles heavy lifting)
      15 + Math.floor(Math.random() * 5),  // Propose: 15-19ms (validators confirm only)
      18 + Math.floor(Math.random() * 4),  // Prevote: 18-21ms (quick confirmation)
      15 + Math.floor(Math.random() * 5),  // Precommit: 15-19ms (quick confirmation)
      20 + Math.floor(Math.random() * 5),  // Commit: 20-24ms (finalization)
    ];
    
    // Determine current active phase (cycle through 5 phases)
    const phaseIndex = (this.currentRound % 5);
    const phases = [
      { number: 1, label: "AI Pre-Validation", time: `${phaseTimings[0]}ms`, status: phaseIndex === 0 ? "active" : "completed" },
      { number: 2, label: "Propose", time: `${phaseTimings[1]}ms`, status: phaseIndex === 1 ? "active" : phaseIndex > 1 ? "completed" : "pending" },
      { number: 3, label: "Prevote", time: `${phaseTimings[2]}ms`, status: phaseIndex === 2 ? "active" : phaseIndex > 2 ? "completed" : "pending" },
      { number: 4, label: "Precommit", time: `${phaseTimings[3]}ms`, status: phaseIndex === 3 ? "active" : phaseIndex > 3 ? "completed" : "pending" },
      { number: 5, label: "Commit", time: `${phaseTimings[4]}ms`, status: phaseIndex === 4 ? "active" : "pending" },
    ];
    
    // Create consensus round data for database with actual validator counts
    const consensusData: InsertConsensusRound = {
      blockHeight: this.currentBlockHeight,
      proposerAddress: proposer.address,
      currentPhase: phaseIndex + 1, // Current active phase (1-5)
      prevoteCount: prevoteCount,
      precommitCount: precommitCount,
      totalValidators: ENTERPRISE_VALIDATORS_CONFIG.ACTIVE_VALIDATORS, // Use configured active validators (110)
      requiredQuorum: requiredQuorum, // 67% of total active validators
      avgBlockTimeMs: ENTERPRISE_VALIDATORS_CONFIG.BLOCK_TIME,
      status: phaseIndex === 4 ? "completed" : "in_progress",
      startTime: Date.now(), // Unix timestamp in milliseconds
      completedTime: phaseIndex === 4 ? Date.now() + phaseTimings[4] : null, // Complete only at phase 5
      phasesJson: JSON.stringify(phases),
    };
    
    // Simulate voting
    let votingPowerAchieved = BigInt(0);
    let votesReceived = 0;
    
    for (const validator of committeeValidators) {
      // AI-driven voting decision based on trust score
      const voteChance = validator.aiTrustScore / 10000;
      if (Math.random() < voteChance) {
        const votingPower = BigInt(this.calculateVotingPower(validator.stake, "0"));
        votingPowerAchieved += votingPower;
        votesReceived++;
        
        // Vote recorded in consensus data
      }
    }
    
    // Update consensus data with voting results
    const quorumAchieved = Math.floor((Number(votingPowerAchieved) / Number(totalVotingPower)) * 10000);
    
    // Save consensus round to database with error handling
    try {
      await this.storage.createConsensusRound(consensusData);
      // Update round only after successful insertion
      this.currentRound++;
    } catch (error: any) {
      if (error?.code === '23505') {
        // Duplicate key error - skip this round as it already exists
        console.log(`Consensus round for block ${this.currentBlockHeight} already exists, skipping`);
      } else {
        console.error("Error creating consensus round:", error);
      }
    }
  }

  // Simulate block production
  private async simulateBlockProduction(): Promise<void> {
    const activeValidators = this.validators.filter(v => v.status === "active");
    if (activeValidators.length === 0) {
      console.warn("No active validators for block production");
      return;
    }
    const producer = activeValidators[this.currentBlockHeight % activeValidators.length];
    
    // PRODUCTION LAUNCH: Match exact displayed TPS (~210K)
    // ~2.75 blocks/second × ~76,000 tx/block = ~210K TPS
    // Using calculated value to match Enterprise Node display exactly
    const baseTransactions = 75000 + Math.floor(Math.random() * 3000); // 75,000-78,000 txs per block
    const transactionCount = baseTransactions;
    
    // Mix of transaction types for realistic gas usage:
    // 20% simple transfers (21,000 gas each)
    // 50% smart contract calls (50,000-200,000 gas each)
    // 30% DeFi/complex operations (200,000-500,000 gas each)
    const simpleTransfers = Math.floor(transactionCount * 0.2);
    const contractCalls = Math.floor(transactionCount * 0.5);
    const complexOps = transactionCount - simpleTransfers - contractCalls;
    
    const gasUsed = 
      (simpleTransfers * 21000) + // Simple transfers
      (contractCalls * (50000 + Math.floor(Math.random() * 150000))) + // Smart contracts
      (complexOps * (200000 + Math.floor(Math.random() * 300000))); // DeFi/complex
    
    // Create block with proper 0x prefixed hashes
    const block = {
      blockNumber: this.currentBlockHeight,
      hash: `0x${crypto.randomBytes(32).toString('hex')}`,
      parentHash: `0x${crypto.randomBytes(32).toString('hex')}`,
      timestamp: Math.floor(Date.now() / 1000),
      transactionCount: transactionCount,
      validatorAddress: producer.address,
      gasUsed: Math.min(gasUsed, 30000000), // Cap at gas limit
      gasLimit: 30000000, // 30M gas limit (standard for high-throughput chains)
      size: 50000 + Math.floor(Math.random() * 100000),
      shardId: Math.floor(Math.random() * this.currentShardCount),
      stateRoot: `0x${crypto.randomBytes(32).toString('hex')}`,
      receiptsRoot: `0x${crypto.randomBytes(32).toString('hex')}`,
      executionClass: "parallel",
      latencyNs: BigInt(50000000 + Math.floor(Math.random() * 50000000)), // 50-100ms
      parallelBatchId: crypto.randomBytes(16).toString('hex'),
      hashAlgorithm: "blake3",
    };
    
    try {
      await this.storage.createBlock(block);
      
      // Update validator's total blocks
      producer.totalBlocks = (producer.totalBlocks || 0) + 1;
      await this.storage.updateValidator(producer.address, { totalBlocks: producer.totalBlocks });
      
      // Increment block height ONLY after successful insertion
      this.currentBlockHeight++;
    } catch (error: any) {
      if (error?.code === '23505') {
        // Duplicate key error - resync with database
        const recentBlocks = await this.storage.getRecentBlocks(1);
        if (recentBlocks.length > 0) {
          this.currentBlockHeight = recentBlocks[0].blockNumber + 1;
          console.log(`📦 Resynced block height to: ${this.currentBlockHeight}`);
        }
      } else {
        console.error("Error creating block:", error);
      }
    }
  }

  // Simulate cross-shard messages between shards (OPTIMIZED)
  private crossShardMessageCounter: number = 0;
  
  // O(1) shard pair selection - select different source and destination shards
  private selectShardPair(shards: Shard[]): { fromShard: Shard; toShard: Shard } {
    const n = shards.length;
    if (n < 2) {
      return { fromShard: shards[0], toShard: shards[0] };
    }
    const fromIndex = Math.floor(Math.random() * n);
    // Select destination from remaining shards (offset by 1 to n-1)
    const offset = 1 + Math.floor(Math.random() * (n - 1));
    const toIndex = (fromIndex + offset) % n;
    return { fromShard: shards[fromIndex], toShard: shards[toIndex] };
  }
  
  private async simulateCrossShardMessages(): Promise<void> {
    // Use cached shards instead of querying DB every time
    const shards = await this.getCachedShards();
    if (shards.length < 2) {
      return;
    }
    
    // Generate 1-3 cross-shard messages per simulation
    const messageCount = 1 + Math.floor(Math.random() * 3);
    
    const messageTypes = ['transfer', 'contract_call', 'state_sync'];
    const routeOptimizations = ['speed', 'reputation', 'cost', 'balanced'];
    const statuses = ['pending', 'confirmed', 'confirmed', 'confirmed']; // 75% confirmed
    
    for (let i = 0; i < messageCount; i++) {
      // O(1) shard pair selection (no while loop)
      const { fromShard, toShard } = this.selectShardPair(shards);
      
      this.crossShardMessageCounter++;
      const messageType = messageTypes[Math.floor(Math.random() * messageTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const messageData: InsertCrossShardMessage = {
        messageId: `csm-${Date.now()}-${this.crossShardMessageCounter.toString().padStart(6, '0')}`,
        fromShardId: fromShard.shardId,
        toShardId: toShard.shardId,
        transactionHash: `0x${crypto.randomBytes(32).toString('hex')}`,
        status: status,
        messageType: messageType,
        payload: {
          blockHeight: this.currentBlockHeight,
          sender: this.validators[Math.floor(Math.random() * this.validators.length)].address,
          amount: (BigInt(1e18) * BigInt(1 + Math.floor(Math.random() * 1000))).toString(),
          data: messageType === 'contract_call' ? `0x${crypto.randomBytes(32).toString('hex')}` : null,
          nonce: Math.floor(Math.random() * 1000000),
          timestamp: Date.now(),
        },
        retryCount: status === 'failed' ? Math.floor(Math.random() * 3) + 1 : 0,
        gasUsed: 21000 + Math.floor(Math.random() * 150000), // 21k - 171k gas
        routingPriority: 1 + Math.floor(Math.random() * 10), // 1-10
        peerReputation: 7500 + Math.floor(Math.random() * 2500), // 7500-10000
        networkQuality: 8000 + Math.floor(Math.random() * 2000), // 8000-10000
        routeOptimization: routeOptimizations[Math.floor(Math.random() * routeOptimizations.length)],
      };
      
      // Buffer messages for batch insertion
      this.crossShardMessageBuffer.push(messageData);
      
      // Flush buffer when it reaches threshold
      if (this.crossShardMessageBuffer.length >= ValidatorSimulationService.MESSAGE_BUFFER_SIZE) {
        await this.flushMessageBuffer();
      }
    }
  }

  // Update network stats based on validator activity
  private async updateNetworkStats(): Promise<void> {
    // Use total validators count (all are operational)
    const activeCount = this.validators.length;
    
    // ENTERPRISE PRODUCTION: Deterministic TPS based on active shard count
    // TPS Formula: currentShardCount * tpsPerShard * 0.98 (98% operating margin)
    // TPS only changes when shard count changes - no random variation
    const TPS_PER_SHARD = 10000;
    const shardCount = ENTERPRISE_VALIDATORS_CONFIG.SHARD_COUNT;
    const baseTps = shardCount * TPS_PER_SHARD;
    const currentTPS = Math.floor(baseTps * 0.98); // Deterministic: 98% of base capacity
    
    await this.storage.updateNetworkStats({
      activeValidators: activeCount,
      totalValidators: this.validators.length,
      tps: currentTPS,
      currentBlockHeight: this.currentBlockHeight,
    });
  }

  // Start simulation
  public async start(): Promise<void> {
    if (this.isRunning) {
      console.log("⚠️ Validator service already running");
      return;
    }
    
    console.log("🎯 Starting Validator Service...");
    this.isRunning = true;
    
    // Subscribe to Enterprise Node shard config changes to keep TPS in sync
    try {
      const enterpriseNode = getEnterpriseNode();
      if (enterpriseNode) {
        enterpriseNode.on('shardConfigChanged', (data: { oldCount: number; newCount: number; version: number }) => {
          console.log(`[Validator] 🔄 Shard config changed: ${data.oldCount} → ${data.newCount} shards`);
          updateValidatorConfigForShards(data.newCount, 25);
          console.log(`[Validator] ✅ Updated ENTERPRISE_VALIDATORS_CONFIG for new shard count`);
        });
        
        // Initialize with current shard config from Enterprise Node
        const shardConfig = enterpriseNode.getShardConfiguration();
        if (shardConfig && shardConfig.currentShardCount) {
          updateValidatorConfigForShards(shardConfig.currentShardCount, shardConfig.validatorsPerShard || 25);
          console.log(`[Validator] ✅ Synced with Enterprise Node: ${shardConfig.currentShardCount} shards`);
        }
      }
    } catch (e) {
      console.log("[Validator] ⚠️ Enterprise Node not ready, using default shard config");
    }
    
    // Initialize validators if not done
    if (this.validators.length === 0) {
      await this.initializeValidators();
    }
    
    // Delayed sync: Retry Enterprise Node sync after initialization
    // This handles the race condition where Enterprise Node starts after ValidatorSimulation
    setTimeout(() => {
      try {
        const enterpriseNode = getEnterpriseNode();
        if (enterpriseNode) {
          const shardConfig = enterpriseNode.getShardConfiguration();
          if (shardConfig && shardConfig.currentShardCount && shardConfig.currentShardCount !== ENTERPRISE_VALIDATORS_CONFIG.SHARD_COUNT) {
            console.log(`[Validator] 🔄 Delayed sync: ${ENTERPRISE_VALIDATORS_CONFIG.SHARD_COUNT} → ${shardConfig.currentShardCount} shards`);
            updateValidatorConfigForShards(shardConfig.currentShardCount, shardConfig.validatorsPerShard || 25);
            console.log(`[Validator] ✅ Synced with Enterprise Node: ${shardConfig.currentShardCount} shards`);
          }
        }
      } catch (e) {
        console.log("[Validator] Delayed sync skipped - Enterprise Node not available");
      }
    }, 3000); // Wait 3 seconds for Enterprise Node to initialize
    
    // Get latest block height from database to avoid conflicts
    try {
      const latestBlock = await this.storage.getRecentBlocks(1);
      if (latestBlock && latestBlock.length > 0) {
        this.currentBlockHeight = latestBlock[0].blockNumber + 1;
        console.log(`📦 Starting from block height: ${this.currentBlockHeight}`);
      }
    } catch (error) {
      console.log(`Using default block height: ${this.currentBlockHeight}`);
    }
    
    // Block production every 100ms with reentrancy guard
    this.blockInterval = setInterval(async () => {
      // Skip if previous cycle is still running (prevents overlap)
      if (this.isProcessingBlock) {
        return;
      }
      
      this.isProcessingBlock = true;
      try {
        // Block production must succeed first (maintains data consistency)
        await this.simulateBlockProduction();
        // Consensus and stats can run in parallel (no dependencies between them)
        await Promise.all([
          this.simulateConsensusRound(),
          this.updateNetworkStats()
        ]);
      } catch (error) {
        console.error("Error in block production:", error);
      } finally {
        this.isProcessingBlock = false;
      }
    }, ENTERPRISE_VALIDATORS_CONFIG.BLOCK_TIME);
    
    // Epoch rotation every minute
    this.epochInterval = setInterval(async () => {
      try {
        await this.rotateEpoch();
      } catch (error) {
        console.error("Error in epoch rotation:", error);
      }
    }, ENTERPRISE_VALIDATORS_CONFIG.EPOCH_DURATION);
    
    // Cross-shard message simulation every 2 seconds
    this.crossShardInterval = setInterval(async () => {
      try {
        await this.simulateCrossShardMessages();
      } catch (error) {
        console.error("Error in cross-shard messaging:", error);
      }
    }, 2000);
    
    // Periodic message buffer flush (catches any buffered messages not yet flushed)
    this.messageFlushInterval = setInterval(async () => {
      try {
        await this.flushMessageBuffer();
      } catch (error) {
        console.error("Error flushing message buffer:", error);
      }
    }, ValidatorSimulationService.MESSAGE_FLUSH_INTERVAL_MS);
    
    console.log("✅ Validator service started (with optimized cross-shard messaging)");
  }

  // Rotate epoch and update committee
  private async rotateEpoch(): Promise<void> {
    this.currentEpoch++;
    console.log(`🔄 Rotating to epoch ${this.currentEpoch}`);
    
    // Recalculate adaptive weights based on performance
    for (const validator of this.validators) {
      // Update adaptive weight based on recent performance
      const performanceFactor = validator.performanceScore / 10000;
      const reputationFactor = validator.reputationScore / 10000;
      const trustFactor = validator.aiTrustScore / 10000;
      
      validator.adaptiveWeight = Math.floor(
        (performanceFactor * 0.3 + reputationFactor * 0.4 + trustFactor * 0.3) * 10000
      );
    }
    
    // Select new committee
    const sortedValidators = this.validators
      .filter(v => v.status === "active")
      .sort((a, b) => b.adaptiveWeight - a.adaptiveWeight);
    
    // Update committee selection count for new committee members (sequential with full rollback)
    const committeeMembers = sortedValidators.slice(0, ENTERPRISE_VALIDATORS_CONFIG.COMMITTEE_SIZE);
    
    // Store original values for rollback
    const originalCounts = committeeMembers.map(v => ({
      address: v.address,
      count: v.committeeSelectionCount || 0
    }));
    
    // Track successfully updated validators for DB rollback
    const successfulUpdates: { address: string; originalCount: number }[] = [];
    
    try {
      // Sequential updates to ensure atomic behavior
      for (let i = 0; i < committeeMembers.length; i++) {
        const validator = committeeMembers[i];
        const newCount = (validator.committeeSelectionCount || 0) + 1;
        
        // Update DB first
        await this.storage.updateValidator(validator.address, { 
          committeeSelectionCount: newCount 
        });
        
        // Track success for potential rollback
        successfulUpdates.push({ 
          address: validator.address, 
          originalCount: validator.committeeSelectionCount || 0 
        });
        
        // Then update in-memory
        validator.committeeSelectionCount = newCount;
      }
    } catch (error) {
      // Full rollback with retry: revert DB for successful updates
      console.error("Epoch rotation failed, performing rollback with retry:", error);
      
      // CRITICAL: Immediately revert in-memory state for all successful updates
      // This ensures memory consistency even if DB rollback fails
      for (const update of successfulUpdates) {
        const validator = committeeMembers.find(v => v.address === update.address);
        if (validator) {
          validator.committeeSelectionCount = update.originalCount;
        }
      }
      
      const MAX_RETRIES = 3;
      const failedRollbacks: { address: string; originalCount: number }[] = [];
      
      for (const update of successfulUpdates) {
        let retryCount = 0;
        let rollbackSuccess = false;
        
        while (retryCount < MAX_RETRIES && !rollbackSuccess) {
          try {
            await this.storage.updateValidator(update.address, { 
              committeeSelectionCount: update.originalCount 
            });
            rollbackSuccess = true;
          } catch (rollbackError) {
            retryCount++;
            if (retryCount < MAX_RETRIES) {
              await new Promise(resolve => setTimeout(resolve, 100 * retryCount)); // Backoff
            } else {
              console.error(`Rollback failed after ${MAX_RETRIES} retries for ${update.address}:`, rollbackError);
              failedRollbacks.push(update);
            }
          }
        }
      }
      
      // Sync memory from DB to ensure consistency (handles both success and failure cases)
      console.log("Syncing memory state from DB to ensure consistency...");
      try {
        const dbValidators = await this.storage.getAllValidators();
        for (const dbVal of dbValidators) {
          const memVal = this.validators.find(v => v.address === dbVal.address);
          if (memVal) {
            memVal.committeeSelectionCount = dbVal.committeeSelectionCount;
          }
        }
        
        if (failedRollbacks.length > 0) {
          console.error(`Critical: ${failedRollbacks.length} rollbacks failed permanently. Memory synced from DB.`);
        }
      } catch (syncError) {
        console.error("Critical: Memory sync from DB failed:", syncError);
        // Last resort: restore in-memory from original values
        for (const original of originalCounts) {
          const validator = committeeMembers.find(v => v.address === original.address);
          if (validator) {
            validator.committeeSelectionCount = original.count;
          }
        }
      }
      
      throw error;
    }
    
    // Invalidate committee cache to force recalculation
    this.lastCommitteeEpoch = 0;
  }

  // Stop simulation
  public async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }
    
    this.isRunning = false;
    
    if (this.blockInterval) {
      clearInterval(this.blockInterval);
      this.blockInterval = null;
    }
    
    if (this.epochInterval) {
      clearInterval(this.epochInterval);
      this.epochInterval = null;
    }
    
    if (this.crossShardInterval) {
      clearInterval(this.crossShardInterval);
      this.crossShardInterval = null;
    }
    
    if (this.messageFlushInterval) {
      clearInterval(this.messageFlushInterval);
      this.messageFlushInterval = null;
    }
    
    // Flush any remaining buffered messages
    await this.flushMessageBuffer();
    
    console.log("⏹️ Validator service stopped");
  }
}