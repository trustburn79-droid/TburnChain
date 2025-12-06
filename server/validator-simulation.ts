import { IStorage } from "./storage";
import { Validator, NetworkStats, InsertConsensusRound, InsertBlock } from "@shared/schema";
import * as crypto from 'crypto';

// TBURN v7.0 Enterprise Validator Configuration
const ENTERPRISE_VALIDATORS_CONFIG = {
  TOTAL_VALIDATORS: 125,
  ACTIVE_VALIDATORS: 110,
  COMMITTEE_SIZE: 21, // BFT committee size
  EPOCH_DURATION: 60000, // 1 minute epochs
  BLOCK_TIME: 100, // PRODUCTION: 100ms for optimal 10 blocks/second (TBURN v7.0 enterprise specification)
  // Enterprise-grade performance: 10 blocks per second enables 50,000+ TPS capability
  BASE_VOTING_POWER: "50000000000000000000000", // 50,000 TBURN base (total supply: 100M TBURN)
  DELEGATION_MULTIPLIER: 1.5,
  QUORUM_THRESHOLD: 6700, // 67% in basis points
};

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
function generateRemainingValidators(): typeof VALIDATOR_PROFILES {
  const regions = ["north-america", "europe", "asia", "oceania", "south-america", "africa"];
  const categories = ["community", "regional", "enterprise", "infrastructure"];
  const remaining: typeof VALIDATOR_PROFILES = [];
  
  for (let i = VALIDATOR_PROFILES.length; i < ENTERPRISE_VALIDATORS_CONFIG.TOTAL_VALIDATORS; i++) {
    const region = regions[i % regions.length];
    const category = categories[Math.floor((i - VALIDATOR_PROFILES.length) / 25) % categories.length];
    const tier = Math.floor((i - VALIDATOR_PROFILES.length) / 30) + 1;
    
    remaining.push({
      name: `${region.charAt(0).toUpperCase() + region.slice(1).replace('-', ' ')} Validator ${i - VALIDATOR_PROFILES.length + 1}`,
      category,
      region,
      reputation: Math.max(7000, 8450 - (i - VALIDATOR_PROFILES.length) * 20)
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

  constructor(storage: IStorage) {
    this.storage = storage;
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

  // Initialize 125 enterprise validators and set correct block height
  public async initializeValidators(): Promise<void> {
    console.log("🚀 Initializing 125 Enterprise Validators...");
    
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
    
    if (existingValidators.length >= ENTERPRISE_VALIDATORS_CONFIG.TOTAL_VALIDATORS) {
      console.log(`✅ Found ${existingValidators.length} validators, using first ${ENTERPRISE_VALIDATORS_CONFIG.TOTAL_VALIDATORS}`);
      // Use first 125 existing validators
      this.validators = existingValidators.slice(0, ENTERPRISE_VALIDATORS_CONFIG.TOTAL_VALIDATORS).map((v, i) => ({
        ...v,
        committee: i < ENTERPRISE_VALIDATORS_CONFIG.COMMITTEE_SIZE,
        votingHistory: v.votingHistory || 9000 + Math.floor(Math.random() * 1000),
      }));
      return;
    }
    
    if (existingValidators.length > 0 && existingValidators.length < ENTERPRISE_VALIDATORS_CONFIG.TOTAL_VALIDATORS) {
      console.log(`📊 Found ${existingValidators.length} existing validators, creating ${ENTERPRISE_VALIDATORS_CONFIG.TOTAL_VALIDATORS - existingValidators.length} more to reach 125 total`);
      // Use existing validators
      this.validators = existingValidators.map((v, i) => ({
        ...v,
        committee: i < ENTERPRISE_VALIDATORS_CONFIG.COMMITTEE_SIZE,
        votingHistory: v.votingHistory || 9000 + Math.floor(Math.random() * 1000),
      }));
      
      // Create only the missing validators to reach 125
      const missingCount = ENTERPRISE_VALIDATORS_CONFIG.TOTAL_VALIDATORS - existingValidators.length;
      const startIndex = existingValidators.length;
      
      // Generate and save the missing validators
      const allProfiles = generateRemainingValidators();
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
        
        await this.storage.createValidator(validator);
        this.validators.push(validator);
      }
      
      console.log(`✅ Created ${missingCount} new validators, total now: ${this.validators.length}`);
      return;
    }
    
    const allProfiles = generateRemainingValidators();
    const validators: Validator[] = [];
    
    for (let i = 0; i < ENTERPRISE_VALIDATORS_CONFIG.TOTAL_VALIDATORS; i++) {
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
    console.log(`✅ Initialized ${validators.length} validators`);
    console.log(`   - Active: ${ENTERPRISE_VALIDATORS_CONFIG.ACTIVE_VALIDATORS}`);
    console.log(`   - Committee: ${ENTERPRISE_VALIDATORS_CONFIG.COMMITTEE_SIZE}`);
  }

  // Simulate consensus round with voting
  private async simulateConsensusRound(): Promise<void> {
    // Committee is the top 21 validators by voting power
    const committeeValidators = this.validators
      .sort((a, b) => {
        const aVotingPower = BigInt(a.votingPower);
        const bVotingPower = BigInt(b.votingPower);
        if (aVotingPower > bVotingPower) return -1;
        if (aVotingPower < bVotingPower) return 1;
        return 0;
      })
      .slice(0, ENTERPRISE_VALIDATORS_CONFIG.COMMITTEE_SIZE);
    
    if (committeeValidators.length === 0) {
      console.warn("No committee validators available for consensus round");
      return;
    }
    
    const proposer = committeeValidators[this.currentRound % committeeValidators.length];
    const totalVotingPower = committeeValidators.reduce((sum, v) => {
      return sum + BigInt(this.calculateVotingPower(v.stake, "0"));
    }, BigInt(0));
    
    // Create consensus round data for database
    const consensusData: InsertConsensusRound = {
      blockHeight: this.currentBlockHeight,
      proposerAddress: proposer.address,
      currentPhase: PHASE_MAPPING['commit'] || 4, // Map phase string to integer
      prevoteCount: Math.floor(committeeValidators.length * 0.9), // 90% prevotes
      precommitCount: Math.floor(committeeValidators.length * 0.85), // 85% precommits
      totalValidators: committeeValidators.length,
      requiredQuorum: Math.ceil(committeeValidators.length * ENTERPRISE_VALIDATORS_CONFIG.QUORUM_THRESHOLD / 10000),
      avgBlockTimeMs: ENTERPRISE_VALIDATORS_CONFIG.BLOCK_TIME,
      status: "completed",
      startTime: Date.now(), // Unix timestamp in milliseconds
      completedTime: Date.now() + Math.floor(Math.random() * 50), // Complete within 50ms
      phasesJson: JSON.stringify([
        { number: 1, label: "NewHeight", time: "0ms", status: "completed" },
        { number: 2, label: "Propose", time: "150ms", status: "completed" },
        { number: 3, label: "Prevote", time: "300ms", status: "completed" },
        { number: 4, label: "Precommit", time: "500ms", status: "completed" },
        { number: 5, label: "Finalize", time: "700ms", status: "completed" },
      ]),
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
    
    // ENTERPRISE PRODUCTION: Generate high transaction volume for 50,000+ TPS
    const transactionCount = 5000 + Math.floor(Math.random() * 200); // 5000-5200 txs per block
    
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
    
    // Create block
    const block = {
      blockNumber: this.currentBlockHeight,
      hash: crypto.randomBytes(32).toString('hex'),
      parentHash: crypto.randomBytes(32).toString('hex'),
      timestamp: Math.floor(Date.now() / 1000),
      transactionCount: transactionCount,
      validatorAddress: producer.address,
      gasUsed: Math.min(gasUsed, 30000000), // Cap at gas limit
      gasLimit: 30000000, // 30M gas limit (standard for high-throughput chains)
      size: 50000 + Math.floor(Math.random() * 100000),
      shardId: Math.floor(Math.random() * 5),
      stateRoot: crypto.randomBytes(32).toString('hex'),
      receiptsRoot: crypto.randomBytes(32).toString('hex'),
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

  // Update network stats based on validator activity
  private async updateNetworkStats(): Promise<void> {
    // Use total validators count (all 125 are operational)
    const activeCount = this.validators.length;
    // ENTERPRISE PRODUCTION: 50,000-52,000 TPS (5000-5200 tx/block × 10 blocks/second)
    const currentTPS = 50000 + Math.floor(Math.random() * 2000); // 50K-52K TPS
    
    // Daily transactions: reasonable value for display (50K-100K range)
    const dailyTransactions = 50000 + Math.floor(Math.random() * 50000);
    
    await this.storage.updateNetworkStats({
      activeValidators: activeCount,
      totalValidators: this.validators.length,
      tps: currentTPS,
      currentBlockHeight: this.currentBlockHeight,
      totalTransactions: dailyTransactions,
    });
  }

  // Start simulation
  public async start(): Promise<void> {
    if (this.isRunning) {
      console.log("⚠️ Validator simulation already running");
      return;
    }
    
    console.log("🎯 Starting Validator Simulation Service...");
    this.isRunning = true;
    
    // Initialize validators if not done
    if (this.validators.length === 0) {
      await this.initializeValidators();
    }
    
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
    
    // Block production every 100ms
    this.blockInterval = setInterval(async () => {
      try {
        await this.simulateBlockProduction();
        await this.simulateConsensusRound();
        await this.updateNetworkStats();
        // Increment block height after successful production
        this.currentBlockHeight++;
      } catch (error) {
        console.error("Error in block simulation:", error);
        // Still increment block height to avoid duplicate attempts
        this.currentBlockHeight++;
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
    
    console.log("✅ Validator simulation started");
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
    
    // Update committee selection count for new committee members
    const committeeMembers = sortedValidators.slice(0, ENTERPRISE_VALIDATORS_CONFIG.COMMITTEE_SIZE);
    for (const validator of committeeMembers) {
      validator.committeeSelectionCount = (validator.committeeSelectionCount || 0) + 1;
      await this.storage.updateValidator(validator.address, { 
        committeeSelectionCount: validator.committeeSelectionCount 
      });
    }
  }

  // Stop simulation
  public stop(): void {
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
    
    console.log("⏹️ Validator simulation stopped");
  }
}