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

export interface AccountCompositeState {
  address: string;
  balance: string;
  stakedAmount: string;
  stakingPositions: StakingPosition[];
  dexPositions: any[];
  lendingPositions: LendingPosition[];
  nftAssets: NftItem[];
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
  };
  dex: {
    tvl: string;
    volume24h: string;
    totalPools: number;
    activeSwaps: number;
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
  };
  bridge: {
    totalBridged: string;
    pendingTransfers: number;
    supportedChains: number;
  };
  burn: {
    totalBurned: string;
    burnRate24h: string;
    nextBurnAmount: string;
    deflationRate: number;
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
      staking: { totalStaked: "0", totalPools: 0, activePositions: 0, apy: 0 },
      dex: { tvl: "0", volume24h: "0", totalPools: 0, activeSwaps: 0 },
      lending: { totalSupplied: "0", totalBorrowed: "0", activeMarkets: 0, utilizationRate: 0 },
      nft: { totalCollections: 0, totalListings: 0, volume24h: "0", floorPriceAvg: "0" },
      bridge: { totalBridged: "0", pendingTransfers: 0, supportedChains: 5 },
      burn: { totalBurned: "0", burnRate24h: "0", nextBurnAmount: "0", deflationRate: 0 }
    };
  }

  /**
   * Get unified network snapshot with all module data
   */
  async getNetworkSnapshot(): Promise<NetworkSnapshot> {
    const cached = this.getFromCache<NetworkSnapshot>('network_snapshot');
    if (cached) return cached;

    const snapshot: NetworkSnapshot = {
      timestamp: Date.now(),
      blockHeight: await this.getLatestBlockHeight(),
      tps: await this.getCurrentTps(),
      totalTransactions: await this.getTotalTransactions(),
      activeValidators: await this.getActiveValidatorCount(),
      totalStaked: this.moduleMetrics.staking.totalStaked,
      totalSupply: await this.getTotalSupply(),
      circulatingSupply: await this.getCirculatingSupply(),
      burnedAmount: this.moduleMetrics.burn.totalBurned,
      marketCap: await this.getMarketCap(),
      dexTvl: this.moduleMetrics.dex.tvl,
      lendingTvl: this.moduleMetrics.lending.totalSupplied,
      stakingTvl: this.moduleMetrics.staking.totalStaked
    };

    this.setCache('network_snapshot', snapshot, 10000);
    this.lastNetworkSnapshot = snapshot;
    return snapshot;
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
      transactionCount: await this.getAccountTransactionCount(address),
      rewardsEarned: await this.getAccountRewards(address),
      lastActivity: Date.now()
    };

    this.setCache(cacheKey, state, 5000);
    return state;
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
  updateStakingMetrics(totalStaked: string, totalPools: number, activePositions: number, apy: number): void {
    this.moduleMetrics.staking = { totalStaked, totalPools, activePositions, apy };
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
  updateDexMetrics(tvl: string, volume24h: string, totalPools: number, activeSwaps: number): void {
    this.moduleMetrics.dex = { tvl, volume24h, totalPools, activeSwaps };
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
  updateNftMetrics(totalCollections: number, totalListings: number, volume24h: string, floorPriceAvg: string): void {
    this.moduleMetrics.nft = { totalCollections, totalListings, volume24h, floorPriceAvg };
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
  updateBurnMetrics(totalBurned: string, burnRate24h: string, nextBurnAmount: string, deflationRate: number): void {
    this.moduleMetrics.burn = { totalBurned, burnRate24h, nextBurnAmount, deflationRate };
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
      return blocks.length > 0 ? blocks[0].height : 0;
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
    try {
      const stats = await storage.getNetworkStats();
      return stats?.totalSupply || "1000000000000000000000000000";
    } catch (error) {
      return "1000000000000000000000000000";
    }
  }

  /**
   * Get circulating supply (total - burned)
   */
  private async getCirculatingSupply(): Promise<string> {
    try {
      const stats = await storage.getNetworkStats();
      const total = BigInt(stats?.totalSupply || "1000000000000000000000000000");
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
      const positions = await storage.getStakingPositionsByUser(address);
      let total = BigInt(0);
      for (const pos of positions) {
        if (pos.status === 'active') {
          total += BigInt(pos.amount);
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
      return await storage.getStakingPositionsByUser(address);
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
      return await storage.getDexPositionsByUser(address);
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
      return await storage.getLendingPositionsByUser(address);
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
      return await storage.getNftsByOwner(address);
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
      const positions = await storage.getStakingPositionsByUser(address);
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
      return await storage.getValidator(address);
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
      const positions = await storage.getStakingPositionsByValidator(address);
      return positions.map(p => ({
        delegator: p.userAddress,
        amount: p.amount,
        startDate: p.startDate,
        status: p.status
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
      const allPools = await storage.getStakingPools();
      return allPools.filter(p => p.validatorAddress === address);
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

    console.log('[DataHub] Event subscriptions initialized for real-time cache invalidation');
  }

  /**
   * Sync module metrics from storage
   */
  async syncMetricsFromStorage(): Promise<void> {
    try {
      const pools = await storage.getStakingPools();
      const positions = await storage.getAllStakingPositions();
      let totalStaked = BigInt(0);
      for (const pos of positions) {
        if (pos.status === 'active') {
          totalStaked += BigInt(pos.amount);
        }
      }
      
      this.moduleMetrics.staking = {
        totalStaked: totalStaked.toString(),
        totalPools: pools.length,
        activePositions: positions.filter(p => p.status === 'active').length,
        apy: 1250
      };

      const dexPools = await storage.getDexPools();
      let dexTvl = BigInt(0);
      for (const pool of dexPools) {
        dexTvl += BigInt(pool.totalValueLocked || "0");
      }
      
      this.moduleMetrics.dex = {
        tvl: dexTvl.toString(),
        volume24h: this.moduleMetrics.dex.volume24h,
        totalPools: dexPools.length,
        activeSwaps: this.moduleMetrics.dex.activeSwaps
      };

      console.log('[DataHub] Metrics synced from storage');
    } catch (error) {
      console.error('[DataHub] Failed to sync metrics from storage:', error);
    }
  }
}

export const dataHub = new DataHubService();
export default dataHub;
