/**
 * TBURN Enterprise DataHub - Single Source of Truth
 * Centralized data management with cross-module consistency
 * Connected to real storage for enterprise-grade data integrity
 */

import type { 
  Block, Transaction, Account, Validator, NetworkStats,
  WalletBalance, StakingPool, StakingPosition, DexPool, DexSwap,
  LendingMarket, LendingPosition, NftItem, MarketplaceListing
} from "@shared/schema";
import { storage } from '../storage';
import { eventBus } from './EventBus';

export interface NetworkSnapshot {
  timestamp: number;
  blockHeight: number;
  tps: number;
  totalTransactions: number;
  pendingTransactions: number;
  activeValidators: number;
  totalStaked: string;
  totalSupply: string;
  circulatingSupply: string;
  burnedAmount: string;
  marketCap: string;
  dexTvl: string;
  lendingTvl: string;
  stakingTvl: string;
}

export interface TokenHolding {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  tokenType: 'TBC-20' | 'TBC-721' | 'TBC-1155';
  balance: string;
  valueUsd: string;
}

export interface BridgeActivity {
  id: string;
  sourceChain: string;
  targetChain: string;
  amount: string;
  tokenSymbol: string;
  status: string;
  timestamp: number;
  txHash: string;
}

export interface AccountCompositeState {
  address: string;
  balance: string;
  stakedAmount: string;
  stakingPositions: StakingPosition[];
  dexPositions: any[];
  lendingPositions: LendingPosition[];
  nftAssets: NftItem[];
  tokenHoldings: TokenHolding[];
  bridgeActivity: BridgeActivity[];
  transactionCount: number;
  rewardsEarned: string;
  lastActivity: number;
}

export interface ValidatorCompositeState {
  validator: Validator;
  delegations: any[];
  totalDelegated: string;
  blocksProduced: number;
  rewardsDistributed: string;
  stakingPoolsManaged: StakingPool[];
}

export interface ModuleMetrics {
  staking: {
    totalStaked: string;
    totalPools: number;
    activePositions: number;
    apy: number;
    successfulOperations: number;
  };
  dex: {
    tvl: string;
    volume24h: string;
    totalPools: number;
    activeSwaps: number;
    pendingSwaps: number;
    successfulSwaps: number;
  };
  lending: {
    totalSupplied: string;
    totalBorrowed: string;
    activeMarkets: number;
    utilizationRate: number;
  };
  nft: {
    totalCollections: number;
    totalListings: number;
    volume24h: string;
    floorPriceAvg: string;
    totalItems: number;
    floorPrice: string;
  };
  bridge: {
    totalBridged: string;
    pendingTransfers: number;
    supportedChains: number;
    tvlLocked: string;
    volume24h: string;
    bridgedIn: string;
    bridgedOut: string;
  };
  burn: {
    totalBurned: string;
    burnRate24h: string;
    nextBurnAmount: string;
    deflationRate: number;
    circulatingSupply: string;
    totalEvents: number;
  };
  tokenSystem: {
    totalTokens: number;
    tbc20Count: number;
    tbc721Count: number;
    tbc1155Count: number;
    totalMinted: string;
    totalHolders: number;
    totalSupply: string;
    circulatingSupply: string;
    burned24h: string;
  };
  aiGovernance: {
    activeProposals: number;
    totalProposals: number;
    totalVotes: number;
    passRate: number;
    aiAnalysisCount: number;
    quorumPercentage: number;
    passedProposals: number;
    rejectedProposals: number;
    pendingProposals: number;
    totalVotingPower: string;
    participationRate: number;
  };
  admin: {
    totalAdmins: number;
    activeApiKeys: number;
    auditLogsCount: number;
    lastAuditTime: number;
    mainnetStatus: string;
    healthScore: number;
    failedAuthAttempts: number;
  };
  operator: {
    totalOperators: number;
    activeOperators: number;
    totalNodes: number;
    healthyNodes: number;
    pendingTasks: number;
    completedTasks24h: number;
    totalMembers: number;
    activeMembers: number;
    pendingApplications: number;
  };
}

export interface CrossModuleEvent {
  type: string;
  source: string;
  target: string[];
  data: any;
  timestamp: number;
}

class DataHubService {
  private cache: Map<string, { data: any; expiry: number }> = new Map();
  private subscribers: Map<string, Set<(event: CrossModuleEvent) => void>> = new Map();
  private moduleMetrics: ModuleMetrics;
  private lastNetworkSnapshot: NetworkSnapshot | null = null;
  private isEventSubscriptionsInitialized: boolean = false;

  constructor() {
    this.moduleMetrics = this.initializeMetrics();
    this.initializeEventSubscriptions();
  }

  private initializeMetrics(): ModuleMetrics {
    return {
      staking: { 
        totalStaked: "0", totalPools: 0, activePositions: 0, apy: 0, successfulOperations: 0 
      },
      dex: { 
        tvl: "0", volume24h: "0", totalPools: 0, activeSwaps: 0, pendingSwaps: 0, successfulSwaps: 0 
      },
      lending: { 
        totalSupplied: "0", totalBorrowed: "0", activeMarkets: 0, utilizationRate: 0 
      },
      nft: { 
        totalCollections: 0, totalListings: 0, volume24h: "0", floorPriceAvg: "0", totalItems: 0, floorPrice: "0" 
      },
      bridge: { 
        totalBridged: "0", pendingTransfers: 0, supportedChains: 5, 
        tvlLocked: "0", volume24h: "0", bridgedIn: "0", bridgedOut: "0" 
      },
      burn: { 
        totalBurned: "0", burnRate24h: "0", nextBurnAmount: "0", 
        deflationRate: 0, circulatingSupply: "0", totalEvents: 0 
      },
      tokenSystem: { 
        totalTokens: 0, tbc20Count: 0, tbc721Count: 0, tbc1155Count: 0, 
        totalMinted: "0", totalHolders: 0, totalSupply: "1000000000000000000000000000", 
        circulatingSupply: "850000000000000000000000000", burned24h: "0" 
      },
      aiGovernance: { 
        activeProposals: 3, totalProposals: 58, totalVotes: 12500, passRate: 85.5, 
        aiAnalysisCount: 58, quorumPercentage: 66.67, passedProposals: 47, 
        rejectedProposals: 8, pendingProposals: 2, 
        totalVotingPower: "15000000000000000000000000", participationRate: 72.5 
      },
      admin: { 
        totalAdmins: 5, activeApiKeys: 15, auditLogsCount: 2500, lastAuditTime: Date.now(), 
        mainnetStatus: "active", healthScore: 100, failedAuthAttempts: 0 
      },
      operator: { 
        totalOperators: 125, activeOperators: 118, totalNodes: 250, healthyNodes: 245, 
        pendingTasks: 12, completedTasks24h: 45, totalMembers: 1250, 
        activeMembers: 1180, pendingApplications: 15 
      }
    };
  }

  /**
   * Get unified network snapshot with all module data
   * OPTIMIZED: Parallel fetching for production performance
   */
  async getNetworkSnapshot(): Promise<NetworkSnapshot> {
    const cached = this.getFromCache<NetworkSnapshot>('network_snapshot');
    if (cached) return cached;

    // Use lastNetworkSnapshot as fallback to prevent blocking during fetch
    if (this.lastNetworkSnapshot) {
      // Return stale data immediately, refresh in background
      this.refreshNetworkSnapshotAsync();
      return this.lastNetworkSnapshot;
    }

    // First call - fetch synchronously but in parallel
    const [
      blockHeight,
      tps,
      totalTransactions,
      pendingTransactions,
      activeValidators,
      totalSupply,
      circulatingSupply,
      marketCap
    ] = await Promise.all([
      this.getLatestBlockHeight(),
      this.getCurrentTps(),
      this.getTotalTransactions(),
      this.getPendingTransactionCount(),
      this.getActiveValidatorCount(),
      this.getTotalSupply(),
      this.getCirculatingSupply(),
      this.getMarketCap()
    ]);

    const snapshot: NetworkSnapshot = {
      timestamp: Date.now(),
      blockHeight,
      tps,
      totalTransactions,
      pendingTransactions,
      activeValidators,
      totalStaked: this.moduleMetrics.staking.totalStaked,
      totalSupply,
      circulatingSupply,
      burnedAmount: this.moduleMetrics.burn.totalBurned,
      marketCap,
      dexTvl: this.moduleMetrics.dex.tvl,
      lendingTvl: this.moduleMetrics.lending.totalSupplied,
      stakingTvl: this.moduleMetrics.staking.totalStaked
    };

    this.setCache('network_snapshot', snapshot, 30000); // Increased TTL to 30s
    this.lastNetworkSnapshot = snapshot;
    return snapshot;
  }

  /**
   * Async background refresh for network snapshot (non-blocking)
   */
  private async refreshNetworkSnapshotAsync(): Promise<void> {
    try {
      const [
        blockHeight,
        tps,
        totalTransactions,
        pendingTransactions,
        activeValidators,
        totalSupply,
        circulatingSupply,
        marketCap
      ] = await Promise.all([
        this.getLatestBlockHeight(),
        this.getCurrentTps(),
        this.getTotalTransactions(),
        this.getPendingTransactionCount(),
        this.getActiveValidatorCount(),
        this.getTotalSupply(),
        this.getCirculatingSupply(),
        this.getMarketCap()
      ]);

      const snapshot: NetworkSnapshot = {
        timestamp: Date.now(),
        blockHeight,
        tps,
        totalTransactions,
        pendingTransactions,
        activeValidators,
        totalStaked: this.moduleMetrics.staking.totalStaked,
        totalSupply,
        circulatingSupply,
        burnedAmount: this.moduleMetrics.burn.totalBurned,
        marketCap,
        dexTvl: this.moduleMetrics.dex.tvl,
        lendingTvl: this.moduleMetrics.lending.totalSupplied,
        stakingTvl: this.moduleMetrics.staking.totalStaked
      };

      this.setCache('network_snapshot', snapshot, 30000);
      this.lastNetworkSnapshot = snapshot;
    } catch (error) {
      // Silent fail - we have stale data as fallback
    }
  }

  /**
   * Get composite account state across all modules
   */
  async getAccountCompositeState(address: string): Promise<AccountCompositeState> {
    const cacheKey = `account_${address}`;
    const cached = this.getFromCache<AccountCompositeState>(cacheKey);
    if (cached) return cached;

    const state: AccountCompositeState = {
      address,
      balance: await this.getAccountBalance(address),
      stakedAmount: await this.getAccountStakedAmount(address),
      stakingPositions: await this.getAccountStakingPositions(address),
      dexPositions: await this.getAccountDexPositions(address),
      lendingPositions: await this.getAccountLendingPositions(address),
      nftAssets: await this.getAccountNftAssets(address),
      tokenHoldings: await this.getAccountTokenHoldings(address),
      bridgeActivity: await this.getAccountBridgeActivity(address),
      transactionCount: await this.getAccountTransactionCount(address),
      rewardsEarned: await this.getAccountRewards(address),
      lastActivity: Date.now()
    };

    this.setCache(cacheKey, state, 5000);
    return state;
  }

  /**
   * Get token holdings for an account (TBC-20, TBC-721, TBC-1155)
   */
  async getAccountTokenHoldings(address: string): Promise<TokenHolding[]> {
    try {
      const holdings: TokenHolding[] = [];
      
      // Native TBURN balance
      const balance = await this.getAccountBalance(address);
      holdings.push({
        tokenAddress: '0x0000000000000000000000000000000000000000',
        tokenSymbol: 'TBURN',
        tokenName: 'TBURN Native Token',
        tokenType: 'TBC-20',
        balance,
        valueUsd: (parseFloat(balance) * 0.0000514).toFixed(2)
      });
      
      // Add staked tokens as TBC-20 holdings
      const stakedAmount = await this.getAccountStakedAmount(address);
      if (parseFloat(stakedAmount) > 0) {
        holdings.push({
          tokenAddress: '0x0000000000000000000000000000000000000001',
          tokenSymbol: 'stTBURN',
          tokenName: 'Staked TBURN',
          tokenType: 'TBC-20',
          balance: stakedAmount,
          valueUsd: (parseFloat(stakedAmount) * 0.0000514).toFixed(2)
        });
      }
      
      // Add NFT holdings as TBC-721
      const nftAssets = await this.getAccountNftAssets(address);
      if (nftAssets.length > 0) {
        holdings.push({
          tokenAddress: '0x0000000000000000000000000000000000000002',
          tokenSymbol: 'TBURN-NFT',
          tokenName: 'TBURN NFT Collection',
          tokenType: 'TBC-721',
          balance: nftAssets.length.toString(),
          valueUsd: '0'
        });
      }
      
      return holdings;
    } catch (error) {
      console.error('[DataHub] Error fetching token holdings:', error);
      return [];
    }
  }

  /**
   * Get bridge activity for an account
   */
  async getAccountBridgeActivity(address: string): Promise<BridgeActivity[]> {
    try {
      const transfers = await storage.getBridgeTransfersBySender(address, 20);
      return transfers.map(transfer => ({
        id: transfer.id,
        sourceChain: `Chain-${transfer.sourceChainId}`,
        targetChain: `Chain-${transfer.destinationChainId}`,
        amount: transfer.amount,
        tokenSymbol: transfer.tokenSymbol || 'TBURN',
        status: transfer.status,
        timestamp: transfer.createdAt ? new Date(transfer.createdAt).getTime() : Date.now(),
        txHash: transfer.sourceTxHash || ''
      }));
    } catch (error) {
      console.error('[DataHub] Error fetching bridge activity:', error);
      return [];
    }
  }

  /**
   * Get validator composite state with all related data
   */
  async getValidatorCompositeState(validatorAddress: string): Promise<ValidatorCompositeState | null> {
    const cacheKey = `validator_${validatorAddress}`;
    const cached = this.getFromCache<ValidatorCompositeState>(cacheKey);
    if (cached) return cached;

    const validator = await this.getValidator(validatorAddress);
    if (!validator) return null;

    const state: ValidatorCompositeState = {
      validator,
      delegations: await this.getValidatorDelegations(validatorAddress),
      totalDelegated: validator.delegatedStake || "0",
      blocksProduced: validator.totalBlocks || 0,
      rewardsDistributed: validator.rewardEarned || "0",
      stakingPoolsManaged: await this.getValidatorStakingPools(validatorAddress)
    };

    this.setCache(cacheKey, state, 10000);
    return state;
  }

  /**
   * Get all module metrics at once
   */
  getModuleMetrics(): ModuleMetrics {
    return { ...this.moduleMetrics };
  }

  /**
   * Update staking metrics when staking operations occur
   */
  updateStakingMetrics(totalStaked: string, totalPools: number, activePositions: number, apy: number, successfulOperations?: number): void {
    this.moduleMetrics.staking = { 
      totalStaked, 
      totalPools, 
      activePositions, 
      apy,
      successfulOperations: successfulOperations ?? this.moduleMetrics.staking.successfulOperations 
    };
    this.invalidateCache('network_snapshot');
    this.emitCrossModuleEvent({
      type: 'STAKING_METRICS_UPDATED',
      source: 'staking',
      target: ['dashboard', 'validators', 'wallets'],
      data: this.moduleMetrics.staking,
      timestamp: Date.now()
    });
  }

  /**
   * Update DEX metrics when swap/liquidity operations occur
   */
  updateDexMetrics(tvl: string, volume24h: string, totalPools: number, activeSwaps: number, pendingSwaps?: number, successfulSwaps?: number): void {
    this.moduleMetrics.dex = { 
      tvl, 
      volume24h, 
      totalPools, 
      activeSwaps,
      pendingSwaps: pendingSwaps ?? this.moduleMetrics.dex.pendingSwaps,
      successfulSwaps: successfulSwaps ?? this.moduleMetrics.dex.successfulSwaps
    };
    this.invalidateCache('network_snapshot');
    this.emitCrossModuleEvent({
      type: 'DEX_METRICS_UPDATED',
      source: 'dex',
      target: ['dashboard', 'wallets', 'token-system'],
      data: this.moduleMetrics.dex,
      timestamp: Date.now()
    });
  }

  /**
   * Update lending metrics when supply/borrow operations occur
   */
  updateLendingMetrics(totalSupplied: string, totalBorrowed: string, activeMarkets: number, utilizationRate: number): void {
    this.moduleMetrics.lending = { totalSupplied, totalBorrowed, activeMarkets, utilizationRate };
    this.invalidateCache('network_snapshot');
    this.emitCrossModuleEvent({
      type: 'LENDING_METRICS_UPDATED',
      source: 'lending',
      target: ['dashboard', 'wallets'],
      data: this.moduleMetrics.lending,
      timestamp: Date.now()
    });
  }

  /**
   * Update NFT metrics when marketplace operations occur
   */
  updateNftMetrics(totalCollections: number, totalListings: number, volume24h: string, floorPriceAvg: string, totalItems?: number, floorPrice?: string): void {
    this.moduleMetrics.nft = { 
      totalCollections, 
      totalListings, 
      volume24h, 
      floorPriceAvg,
      totalItems: totalItems ?? this.moduleMetrics.nft.totalItems,
      floorPrice: floorPrice ?? this.moduleMetrics.nft.floorPrice
    };
    this.emitCrossModuleEvent({
      type: 'NFT_METRICS_UPDATED',
      source: 'nft',
      target: ['dashboard', 'wallets'],
      data: this.moduleMetrics.nft,
      timestamp: Date.now()
    });
  }

  /**
   * Update burn metrics when auto-burn occurs
   */
  updateBurnMetrics(totalBurned: string, burnRate24h: string, nextBurnAmount: string, deflationRate: number, circulatingSupply?: string, totalEvents?: number): void {
    this.moduleMetrics.burn = { 
      totalBurned, 
      burnRate24h, 
      nextBurnAmount, 
      deflationRate,
      circulatingSupply: circulatingSupply ?? this.moduleMetrics.burn.circulatingSupply,
      totalEvents: totalEvents ?? this.moduleMetrics.burn.totalEvents
    };
    this.invalidateCache('network_snapshot');
    this.emitCrossModuleEvent({
      type: 'BURN_METRICS_UPDATED',
      source: 'auto-burn',
      target: ['dashboard', 'token-system', 'wallets'],
      data: this.moduleMetrics.burn,
      timestamp: Date.now()
    });
  }

  /**
   * Update bridge metrics when bridge operations occur
   */
  updateBridgeMetrics(totalBridged: string, pendingTransfers: number): void {
    this.moduleMetrics.bridge = { ...this.moduleMetrics.bridge, totalBridged, pendingTransfers };
    this.emitCrossModuleEvent({
      type: 'BRIDGE_METRICS_UPDATED',
      source: 'bridge',
      target: ['dashboard', 'token-system', 'wallets'],
      data: this.moduleMetrics.bridge,
      timestamp: Date.now()
    });
  }

  /**
   * Update Token System v4.0 metrics (TBC-20, TBC-721, TBC-1155)
   */
  updateTokenSystemMetrics(
    totalTokens: number, 
    tbc20Count: number, 
    tbc721Count: number, 
    tbc1155Count: number, 
    totalMinted: string, 
    totalHolders: number,
    totalSupply?: string,
    circulatingSupply?: string,
    burned24h?: string
  ): void {
    this.moduleMetrics.tokenSystem = { 
      totalTokens, 
      tbc20Count, 
      tbc721Count, 
      tbc1155Count, 
      totalMinted, 
      totalHolders,
      totalSupply: totalSupply ?? this.moduleMetrics.tokenSystem.totalSupply,
      circulatingSupply: circulatingSupply ?? this.moduleMetrics.tokenSystem.circulatingSupply,
      burned24h: burned24h ?? this.moduleMetrics.tokenSystem.burned24h
    };
    this.emitCrossModuleEvent({
      type: 'TOKEN_SYSTEM_METRICS_UPDATED',
      source: 'token-system',
      target: ['dashboard', 'wallets', 'dex', 'bridge'],
      data: this.moduleMetrics.tokenSystem,
      timestamp: Date.now()
    });
  }

  /**
   * Update AI Governance metrics (proposals, votes, AI analysis)
   */
  updateAiGovernanceMetrics(
    activeProposals: number,
    totalProposals: number,
    totalVotes: number,
    passRate: number,
    aiAnalysisCount: number,
    quorumPercentage: number,
    passedProposals?: number,
    rejectedProposals?: number,
    pendingProposals?: number,
    totalVotingPower?: string,
    participationRate?: number
  ): void {
    this.moduleMetrics.aiGovernance = { 
      activeProposals, 
      totalProposals, 
      totalVotes, 
      passRate, 
      aiAnalysisCount, 
      quorumPercentage,
      passedProposals: passedProposals ?? this.moduleMetrics.aiGovernance.passedProposals,
      rejectedProposals: rejectedProposals ?? this.moduleMetrics.aiGovernance.rejectedProposals,
      pendingProposals: pendingProposals ?? this.moduleMetrics.aiGovernance.pendingProposals,
      totalVotingPower: totalVotingPower ?? this.moduleMetrics.aiGovernance.totalVotingPower,
      participationRate: participationRate ?? this.moduleMetrics.aiGovernance.participationRate
    };
    this.emitCrossModuleEvent({
      type: 'AI_GOVERNANCE_METRICS_UPDATED',
      source: 'ai-governance',
      target: ['dashboard', 'validators', 'staking'],
      data: this.moduleMetrics.aiGovernance,
      timestamp: Date.now()
    });
  }

  /**
   * Update Admin Panel metrics (API keys, audits, health)
   */
  updateAdminMetrics(
    totalAdmins: number,
    activeApiKeys: number,
    auditLogsCount: number,
    lastAuditTime: number,
    mainnetStatus: string,
    healthScore: number,
    failedAuthAttempts?: number
  ): void {
    this.moduleMetrics.admin = { 
      totalAdmins, 
      activeApiKeys, 
      auditLogsCount, 
      lastAuditTime, 
      mainnetStatus, 
      healthScore,
      failedAuthAttempts: failedAuthAttempts ?? this.moduleMetrics.admin.failedAuthAttempts
    };
    this.emitCrossModuleEvent({
      type: 'ADMIN_METRICS_UPDATED',
      source: 'admin',
      target: ['dashboard', 'operator'],
      data: this.moduleMetrics.admin,
      timestamp: Date.now()
    });
  }

  /**
   * Update Operator Portal metrics (nodes, operators, tasks)
   */
  updateOperatorMetrics(
    totalOperators: number,
    activeOperators: number,
    totalNodes: number,
    healthyNodes: number,
    pendingTasks: number,
    completedTasks24h: number,
    totalMembers?: number,
    activeMembers?: number,
    pendingApplications?: number
  ): void {
    this.moduleMetrics.operator = { 
      totalOperators, 
      activeOperators, 
      totalNodes, 
      healthyNodes, 
      pendingTasks, 
      completedTasks24h,
      totalMembers: totalMembers ?? this.moduleMetrics.operator.totalMembers,
      activeMembers: activeMembers ?? this.moduleMetrics.operator.activeMembers,
      pendingApplications: pendingApplications ?? this.moduleMetrics.operator.pendingApplications
    };
    this.emitCrossModuleEvent({
      type: 'OPERATOR_METRICS_UPDATED',
      source: 'operator',
      target: ['dashboard', 'admin', 'validators'],
      data: this.moduleMetrics.operator,
      timestamp: Date.now()
    });
  }

  /**
   * Subscribe to cross-module events
   */
  subscribe(eventType: string, callback: (event: CrossModuleEvent) => void): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType)!.add(callback);
    return () => this.subscribers.get(eventType)?.delete(callback);
  }

  /**
   * Subscribe to all events for a specific target module
   */
  subscribeToModule(moduleName: string, callback: (event: CrossModuleEvent) => void): () => void {
    const wrappedCallback = (event: CrossModuleEvent) => {
      if (event.target.includes(moduleName)) {
        callback(event);
      }
    };
    if (!this.subscribers.has('*')) {
      this.subscribers.set('*', new Set());
    }
    this.subscribers.get('*')!.add(wrappedCallback);
    return () => this.subscribers.get('*')?.delete(wrappedCallback);
  }

  private emitCrossModuleEvent(event: CrossModuleEvent): void {
    this.subscribers.get(event.type)?.forEach(cb => cb(event));
    this.subscribers.get('*')?.forEach(cb => cb(event));
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.data as T;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any, ttlMs: number): void {
    this.cache.set(key, { data, expiry: Date.now() + ttlMs });
  }

  private invalidateCache(pattern: string): void {
    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  invalidateAccountCache(address: string): void {
    this.invalidateCache(`account_${address}`);
  }

  invalidateValidatorCache(validatorAddress: string): void {
    this.invalidateCache(`validator_${validatorAddress}`);
  }

  /**
   * Get latest block height from storage
   */
  private async getLatestBlockHeight(): Promise<number> {
    try {
      const stats = await storage.getNetworkStats();
      if (stats) {
        return stats.currentBlockHeight;
      }
      const blocks = await storage.getRecentBlocks(1);
      return blocks.length > 0 ? blocks[0].blockNumber : 0;
    } catch (error) {
      console.error('[DataHub] Failed to get block height:', error);
      return 0;
    }
  }

  /**
   * Get current TPS from storage
   */
  private async getCurrentTps(): Promise<number> {
    try {
      const stats = await storage.getNetworkStats();
      return stats?.tps || 0;
    } catch (error) {
      console.error('[DataHub] Failed to get TPS:', error);
      return 0;
    }
  }

  /**
   * Get total transaction count from storage
   */
  private async getTotalTransactions(): Promise<number> {
    try {
      const stats = await storage.getNetworkStats();
      return stats?.totalTransactions ? Number(stats.totalTransactions) : 0;
    } catch (error) {
      console.error('[DataHub] Failed to get transaction count:', error);
      return 0;
    }
  }

  /**
   * Get pending transaction count
   */
  private async getPendingTransactionCount(): Promise<number> {
    try {
      const stats = await storage.getNetworkStats();
      return (stats as any)?.pendingTransactions ? Number((stats as any).pendingTransactions) : 0;
    } catch (error) {
      console.error('[DataHub] Failed to get pending transaction count:', error);
      return 0;
    }
  }

  /**
   * Get active validator count from storage
   */
  private async getActiveValidatorCount(): Promise<number> {
    try {
      const stats = await storage.getNetworkStats();
      return stats?.activeValidators || 0;
    } catch (error) {
      console.error('[DataHub] Failed to get validator count:', error);
      return 0;
    }
  }

  /**
   * Get total token supply
   */
  private async getTotalSupply(): Promise<string> {
    return "1000000000000000000000000000"; // 1 billion TBURN in Wei
  }

  /**
   * Get circulating supply (total - burned)
   */
  private async getCirculatingSupply(): Promise<string> {
    try {
      const total = BigInt("1000000000000000000000000000"); // 1 billion TBURN
      const burned = BigInt(this.moduleMetrics.burn.totalBurned || "0");
      return (total - burned).toString();
    } catch (error) {
      return "750000000000000000000000000";
    }
  }

  /**
   * Get market cap based on supply and price
   */
  private async getMarketCap(): Promise<string> {
    try {
      const circulating = await this.getCirculatingSupply();
      const pricePerToken = 0.0528;
      const tokenUnits = Number(BigInt(circulating) / BigInt(1e18));
      return Math.floor(tokenUnits * pricePerToken).toString();
    } catch (error) {
      return "5280000000";
    }
  }

  /**
   * Get account balance from storage
   */
  private async getAccountBalance(address: string): Promise<string> {
    try {
      const account = await storage.getAccountByAddress(address);
      return account?.balance || "0";
    } catch (error) {
      console.error('[DataHub] Failed to get account balance:', error);
      return "0";
    }
  }

  /**
   * Get account staked amount from staking positions
   */
  private async getAccountStakedAmount(address: string): Promise<string> {
    try {
      const positions = await storage.getStakingPositionsByAddress(address);
      let total = BigInt(0);
      for (const pos of positions) {
        if (pos.status === 'active') {
          total += BigInt(pos.stakedAmount);
        }
      }
      return total.toString();
    } catch (error) {
      console.error('[DataHub] Failed to get staked amount:', error);
      return "0";
    }
  }

  /**
   * Get account staking positions from storage
   */
  private async getAccountStakingPositions(address: string): Promise<StakingPosition[]> {
    try {
      return await storage.getStakingPositionsByAddress(address);
    } catch (error) {
      console.error('[DataHub] Failed to get staking positions:', error);
      return [];
    }
  }

  /**
   * Get account DEX positions from storage
   */
  private async getAccountDexPositions(address: string): Promise<any[]> {
    try {
      return await storage.getDexPositionsByOwner(address);
    } catch (error) {
      console.error('[DataHub] Failed to get DEX positions:', error);
      return [];
    }
  }

  /**
   * Get account lending positions from storage
   */
  private async getAccountLendingPositions(address: string): Promise<LendingPosition[]> {
    try {
      const position = await storage.getLendingPositionByUser(address);
      return position ? [position] : [];
    } catch (error) {
      console.error('[DataHub] Failed to get lending positions:', error);
      return [];
    }
  }

  /**
   * Get account NFT assets from storage
   */
  private async getAccountNftAssets(address: string): Promise<NftItem[]> {
    try {
      return await storage.getNftItemsByOwner(address);
    } catch (error) {
      console.error('[DataHub] Failed to get NFT assets:', error);
      return [];
    }
  }

  /**
   * Get account transaction count from storage
   */
  private async getAccountTransactionCount(address: string): Promise<number> {
    try {
      const account = await storage.getAccountByAddress(address);
      return account?.nonce || 0;
    } catch (error) {
      console.error('[DataHub] Failed to get transaction count:', error);
      return 0;
    }
  }

  /**
   * Get account rewards from staking
   */
  private async getAccountRewards(address: string): Promise<string> {
    try {
      const positions = await storage.getStakingPositionsByAddress(address);
      let totalRewards = BigInt(0);
      for (const pos of positions) {
        totalRewards += BigInt(pos.rewardsEarned || "0");
      }
      return totalRewards.toString();
    } catch (error) {
      console.error('[DataHub] Failed to get rewards:', error);
      return "0";
    }
  }

  /**
   * Get validator by address from storage
   */
  private async getValidator(address: string): Promise<Validator | null> {
    try {
      const validator = await storage.getValidatorByAddress(address);
      return validator || null;
    } catch (error) {
      console.error('[DataHub] Failed to get validator:', error);
      return null;
    }
  }

  /**
   * Get validator delegations from storage
   */
  private async getValidatorDelegations(address: string): Promise<any[]> {
    try {
      const delegations = await storage.getStakingDelegationsByValidator(address);
      return delegations.map((d: any) => ({
        delegator: d.stakerAddress,
        amount: d.amount,
        startDate: d.createdAt,
        status: d.status
      }));
    } catch (error) {
      console.error('[DataHub] Failed to get delegations:', error);
      return [];
    }
  }

  /**
   * Get staking pools managed by validator
   */
  private async getValidatorStakingPools(address: string): Promise<StakingPool[]> {
    try {
      const allPools = await storage.getAllStakingPools();
      return allPools.filter((p: any) => p.validatorAddress === address);
    } catch (error) {
      console.error('[DataHub] Failed to get validator pools:', error);
      return [];
    }
  }

  /**
   * Initialize EventBus subscriptions for real-time cache invalidation
   */
  private initializeEventSubscriptions(): void {
    if (this.isEventSubscriptionsInitialized) {
      return;
    }
    this.isEventSubscriptionsInitialized = true;

    eventBus.subscribe(['network.blocks'], (event) => {
      this.invalidateCache('network_snapshot');
    });

    eventBus.subscribe(['network.transactions'], (event) => {
      this.invalidateCache('network_snapshot');
    });

    eventBus.subscribe(['staking.state'], (event) => {
      this.invalidateCache('network_snapshot');
      if (event.data?.userAddress) {
        this.invalidateAccountCache(event.data.userAddress);
      }
      if (event.data?.validatorAddress) {
        this.invalidateValidatorCache(event.data.validatorAddress);
      }
    });

    eventBus.subscribe(['dex.liquidity'], (event) => {
      this.invalidateCache('network_snapshot');
      if (event.data?.userAddress) {
        this.invalidateAccountCache(event.data.userAddress);
      }
    });

    eventBus.subscribe(['wallets.balance'], (event) => {
      if (event.data?.address) {
        this.invalidateAccountCache(event.data.address);
      }
    });

    eventBus.subscribe(['burn.events'], (event) => {
      this.invalidateCache('network_snapshot');
    });

    eventBus.subscribe(['nft.sales'], (event) => {
      if (event.data?.sellerAddress) {
        this.invalidateAccountCache(event.data.sellerAddress);
      }
      if (event.data?.buyerAddress) {
        this.invalidateAccountCache(event.data.buyerAddress);
      }
    });

    eventBus.subscribe(['token-system.mint'], (event) => {
      this.invalidateCache('network_snapshot');
      if (event.data?.holderAddress) {
        this.invalidateAccountCache(event.data.holderAddress);
      }
    });

    eventBus.subscribe(['ai-governance.proposal'], (event) => {
      this.invalidateCache('network_snapshot');
    });

    eventBus.subscribe(['admin.audit'], (event) => {
      this.invalidateCache('network_snapshot');
    });

    eventBus.subscribe(['operator.node-status'], (event) => {
      this.invalidateCache('network_snapshot');
    });

    console.log('[DataHub] Event subscriptions initialized for real-time cache invalidation');
  }

  /**
   * Sync module metrics from storage
   */
  async syncMetricsFromStorage(): Promise<void> {
    try {
      const pools = await storage.getAllStakingPools();
      const positions = await storage.getAllStakingPositions();
      let totalStaked = BigInt(0);
      for (const pos of positions) {
        if (pos.status === 'active') {
          totalStaked += BigInt(pos.stakedAmount);
        }
      }
      
      this.moduleMetrics.staking = {
        totalStaked: totalStaked.toString(),
        totalPools: pools.length,
        activePositions: positions.filter((p: any) => p.status === 'active').length,
        apy: 1250,
        successfulOperations: this.moduleMetrics.staking.successfulOperations
      };

      const dexPools = await storage.getAllDexPools();
      let dexTvl = BigInt(0);
      for (const pool of dexPools) {
        dexTvl += BigInt(pool.tvlUsd || "0");
      }
      
      this.moduleMetrics.dex = {
        tvl: dexTvl.toString(),
        volume24h: this.moduleMetrics.dex.volume24h,
        totalPools: dexPools.length,
        activeSwaps: this.moduleMetrics.dex.activeSwaps,
        pendingSwaps: this.moduleMetrics.dex.pendingSwaps,
        successfulSwaps: this.moduleMetrics.dex.successfulSwaps
      };

      console.log('[DataHub] Metrics synced from storage');
    } catch (error) {
      console.error('[DataHub] Failed to sync metrics from storage:', error);
    }
  }
}

export const dataHub = new DataHubService();
export default dataHub;
