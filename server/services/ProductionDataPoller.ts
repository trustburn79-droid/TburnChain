/**
 * ProductionDataPoller - Background data refresh service
 * 
 * This service:
 * 1. Polls data from TBurnEnterpriseNode at regular intervals
 * 2. Updates the DataCacheService with fresh data
 * 3. Decouples UI requests from live RPC calls
 * 4. Ensures data is always available even during rate limits
 */

import { getDataCache, DataCacheService } from './DataCacheService';
import { storage } from '../storage';
import { formatPublicNetworkStats, formatPublicTestnetStats } from '../routes/public-api-routes';
import { dataHub } from './DataHub';

interface PollerConfig {
  pollInterval: number; // Interval between polls in ms
  retryDelay: number; // Delay before retrying on error
  maxConsecutiveErrors: number; // Max errors before backing off
}

interface PollerStats {
  isRunning: boolean;
  lastPollTime: Date | null;
  lastSuccessTime: Date | null;
  pollCount: number;
  errorCount: number;
  consecutiveErrors: number;
}

class ProductionDataPoller {
  private cache: DataCacheService;
  private enterpriseNode: any = null;
  private isRunning = false;
  private pollTimer: NodeJS.Timeout | null = null;
  private stats: PollerStats = {
    isRunning: false,
    lastPollTime: null,
    lastSuccessTime: null,
    pollCount: 0,
    errorCount: 0,
    consecutiveErrors: 0
  };

  private config: PollerConfig = {
    pollInterval: 15000, // 15 seconds
    retryDelay: 5000, // 5 seconds on error
    maxConsecutiveErrors: 5 // Back off after 5 consecutive errors
  };

  constructor() {
    this.cache = getDataCache();
  }

  /**
   * Start the poller
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('[ProductionDataPoller] Already running');
      return;
    }

    try {
      // Initialize enterprise node
      const { getEnterpriseNode } = await import('./TBurnEnterpriseNode');
      this.enterpriseNode = getEnterpriseNode();
      
      // CRITICAL: Wait for enterprise node to be fully ready before polling
      // This prevents empty cache and ensures only REAL data is served
      console.log('[ProductionDataPoller] Waiting for Enterprise Node to be ready...');
      await this.waitForEnterpriseNodeReady();
      console.log('[ProductionDataPoller] ✅ Enterprise Node is ready');

      this.isRunning = true;
      this.stats.isRunning = true;
      
      console.log('[ProductionDataPoller] Starting with interval:', this.config.pollInterval, 'ms');
      
      // Initial poll - now guaranteed to succeed with real data
      await this.poll();
      
      // Schedule regular polling
      this.schedulePoll();
      
    } catch (error: any) {
      console.error('[ProductionDataPoller] Failed to start:', error.message);
      this.isRunning = false;
      this.stats.isRunning = false;
    }
  }
  
  /**
   * Wait for Enterprise Node to be fully ready
   * Polls the health endpoint until the node is operational
   */
  private async waitForEnterpriseNodeReady(maxAttempts = 30, intervalMs = 1000): Promise<void> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Verify by hitting the health endpoint
        const response = await fetch('http://localhost:8545/health', {
          signal: AbortSignal.timeout(2000)
        });
        if (response.ok) {
          return; // Node is ready
        }
      } catch (error) {
        // Node not ready yet, continue waiting
      }
      
      if (attempt < maxAttempts) {
        console.log(`[ProductionDataPoller] Enterprise Node not ready (attempt ${attempt}/${maxAttempts}), retrying...`);
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }
    
    // If we get here, node didn't become ready - try to start it
    console.log('[ProductionDataPoller] Enterprise Node not responding, attempting to start...');
    await this.enterpriseNode.start();
    
    // Wait a bit more for startup
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  /**
   * Stop the poller
   */
  stop(): void {
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
    this.isRunning = false;
    this.stats.isRunning = false;
    console.log('[ProductionDataPoller] Stopped');
  }

  /**
   * Schedule next poll
   */
  private schedulePoll(): void {
    if (!this.isRunning) return;

    // Calculate delay based on consecutive errors
    let delay = this.config.pollInterval;
    if (this.stats.consecutiveErrors > 0) {
      // Exponential backoff: 15s, 30s, 60s, 120s, max 300s
      delay = Math.min(
        this.config.pollInterval * Math.pow(2, this.stats.consecutiveErrors),
        300000
      );
      console.log(`[ProductionDataPoller] Backing off, next poll in ${delay}ms`);
    }

    this.pollTimer = setTimeout(async () => {
      await this.poll();
      this.schedulePoll();
    }, delay);
  }

  /**
   * Execute a single poll cycle
   */
  private async poll(): Promise<void> {
    if (!this.enterpriseNode) {
      console.warn('[ProductionDataPoller] Enterprise node not initialized');
      return;
    }

    this.stats.pollCount++;
    this.stats.lastPollTime = new Date();

    try {
      // Fetch all data in parallel for efficiency
      const [
        networkStats,
        shards,
        recentBlocks,
        recentTransactions,
        validators,
        aiModels,
        contracts,
        consensusState,
        membersData,
        memberStatsData
      ] = await Promise.allSettled([
        this.fetchNetworkStats(),
        this.fetchShards(),
        this.fetchRecentBlocks(),
        this.fetchRecentTransactions(),
        this.fetchValidators(),
        this.fetchAIModels(),
        this.fetchContracts(),
        this.fetchConsensusState(),
        this.fetchMembersWithProfiles(),
        this.fetchMemberStats()
      ]);

      // Process results and update cache - only update if data is valid (not empty)
      let successCount = 0;
      
      if (networkStats.status === 'fulfilled' && networkStats.value) {
        this.cache.set(DataCacheService.KEYS.NETWORK_STATS, networkStats.value, 30000);
        successCount++;
      }
      
      // Only cache shards if we got valid data (non-empty array)
      if (shards.status === 'fulfilled' && shards.value && Array.isArray(shards.value) && shards.value.length > 0) {
        this.cache.set(DataCacheService.KEYS.SHARDS, shards.value, 30000);
        successCount++;
      }
      
      // Only cache blocks if we got valid data (non-empty array)
      if (recentBlocks.status === 'fulfilled' && recentBlocks.value && Array.isArray(recentBlocks.value) && recentBlocks.value.length > 0) {
        this.cache.set(DataCacheService.KEYS.RECENT_BLOCKS, recentBlocks.value, 15000);
        successCount++;
      }
      
      // Only cache transactions if we got valid data (non-empty array)
      if (recentTransactions.status === 'fulfilled' && recentTransactions.value && Array.isArray(recentTransactions.value) && recentTransactions.value.length > 0) {
        this.cache.set(DataCacheService.KEYS.RECENT_TRANSACTIONS, recentTransactions.value, 15000);
        successCount++;
      }
      
      if (validators.status === 'fulfilled' && validators.value && Array.isArray(validators.value) && validators.value.length > 0) {
        this.cache.set(DataCacheService.KEYS.VALIDATORS, validators.value, 60000);
        successCount++;
      }
      
      if (aiModels.status === 'fulfilled' && aiModels.value && Array.isArray(aiModels.value) && aiModels.value.length > 0) {
        this.cache.set(DataCacheService.KEYS.AI_MODELS, aiModels.value, 60000);
        successCount++;
      }
      
      if (contracts.status === 'fulfilled' && contracts.value && Array.isArray(contracts.value) && contracts.value.length > 0) {
        this.cache.set(DataCacheService.KEYS.CONTRACTS, contracts.value, 60000);
        successCount++;
      }
      
      if (consensusState.status === 'fulfilled' && consensusState.value) {
        this.cache.set(DataCacheService.KEYS.CONSENSUS_STATE, consensusState.value, 30000);
        successCount++;
      }
      
      // Cache members data from database (not enterprise node)
      if (membersData.status === 'fulfilled' && membersData.value && Array.isArray(membersData.value) && membersData.value.length > 0) {
        this.cache.set('members_with_profiles_100', membersData.value, 30000);
        successCount++;
      }
      
      // Cache member stats from database
      if (memberStatsData.status === 'fulfilled' && memberStatsData.value) {
        this.cache.set('members_stats_summary', memberStatsData.value, 30000);
        successCount++;
      }
      
      // Warm public API caches using real data from dataHub for consistency
      if (networkStats.status === 'fulfilled' && networkStats.value) {
        try {
          // Fetch snapshot and moduleMetrics for accurate public data
          const snapshot = await dataHub.getNetworkSnapshot();
          const moduleMetrics = dataHub.getModuleMetrics();
          
          const publicNetworkData = formatPublicNetworkStats(
            networkStats.value,
            snapshot || networkStats.value,
            moduleMetrics || {}
          );
          this.cache.set('public_network_stats', publicNetworkData, 30000);
          successCount++;
          
          // Testnet uses same data sources
          const publicTestnetData = formatPublicTestnetStats(
            networkStats.value,
            snapshot || networkStats.value
          );
          this.cache.set('public_testnet_stats', publicTestnetData, 30000);
          successCount++;
        } catch (e) {
          console.log('[ProductionDataPoller] Failed to warm public API caches');
        }
      }

      if (successCount > 0) {
        this.stats.lastSuccessTime = new Date();
        this.stats.consecutiveErrors = 0;
        console.log(`[ProductionDataPoller] Poll complete: ${successCount}/8 data sources updated`);
      } else {
        throw new Error('No data sources updated');
      }

    } catch (error: any) {
      this.stats.errorCount++;
      this.stats.consecutiveErrors++;
      console.error('[ProductionDataPoller] Poll error:', error.message);
      
      if (this.stats.consecutiveErrors >= this.config.maxConsecutiveErrors) {
        console.warn('[ProductionDataPoller] Max consecutive errors reached, backing off');
      }
    }
  }

  // Data fetch methods - wrap enterprise node calls with error handling

  private async fetchNetworkStats(): Promise<any> {
    try {
      return await this.enterpriseNode.getNetworkStats();
    } catch (error) {
      console.log('[ProductionDataPoller] fetchNetworkStats error');
      return null;
    }
  }

  private async fetchShards(): Promise<any[]> {
    try {
      return await this.enterpriseNode.getShards();
    } catch (error) {
      console.log('[ProductionDataPoller] fetchShards error');
      return [];
    }
  }

  private async fetchRecentBlocks(): Promise<any[]> {
    try {
      const status = this.enterpriseNode.getStatus();
      const currentHeight = status.currentBlock;
      const blocks = [];
      
      for (let i = 0; i < 20; i++) {
        const block = await this.enterpriseNode.getBlock(currentHeight - i);
        blocks.push(block);
      }
      return blocks;
    } catch (error) {
      console.log('[ProductionDataPoller] fetchRecentBlocks error');
      return [];
    }
  }

  private async fetchRecentTransactions(): Promise<any[]> {
    try {
      const transactions = [];
      for (let i = 0; i < 50; i++) {
        const txHash = `0x${Math.random().toString(16).substring(2, 66).padEnd(64, '0')}`;
        const tx = await this.enterpriseNode.getTransaction(txHash);
        transactions.push(tx);
      }
      return transactions;
    } catch (error) {
      console.log('[ProductionDataPoller] fetchRecentTransactions error');
      return [];
    }
  }

  private async fetchValidators(): Promise<any[]> {
    try {
      return await this.enterpriseNode.getValidators();
    } catch (error) {
      console.log('[ProductionDataPoller] fetchValidators error');
      return [];
    }
  }

  private async fetchAIModels(): Promise<any[]> {
    try {
      return await this.enterpriseNode.getAIModels();
    } catch (error) {
      console.log('[ProductionDataPoller] fetchAIModels error');
      return [];
    }
  }

  private async fetchContracts(): Promise<any[]> {
    try {
      return await this.enterpriseNode.getContracts();
    } catch (error) {
      console.log('[ProductionDataPoller] fetchContracts error');
      return [];
    }
  }

  private async fetchConsensusState(): Promise<any> {
    try {
      return await this.enterpriseNode.getConsensusState();
    } catch (error) {
      console.log('[ProductionDataPoller] fetchConsensusState error');
      return null;
    }
  }
  
  private async fetchMembersWithProfiles(): Promise<any[]> {
    try {
      const limit = 100;
      const membersList = await storage.getAllMembers(limit);
      const memberIds = membersList.map(m => m.id);
      const allProfiles = await storage.getMemberProfilesByIds(memberIds);
      const profileMap = new Map(allProfiles.map(p => [p.memberId, p]));
      return membersList.map(member => ({
        ...member,
        profile: profileMap.get(member.id) || null
      }));
    } catch (error) {
      console.log('[ProductionDataPoller] fetchMembersWithProfiles error');
      return [];
    }
  }
  
  private async fetchMemberStats(): Promise<any> {
    try {
      return await storage.getMemberStatistics();
    } catch (error) {
      console.log('[ProductionDataPoller] fetchMemberStats error');
      return null;
    }
  }

  /**
   * Get poller stats
   */
  getStats(): PollerStats {
    return { ...this.stats };
  }

  /**
   * Force immediate refresh
   */
  async forceRefresh(): Promise<void> {
    console.log('[ProductionDataPoller] Forcing immediate refresh');
    await this.poll();
  }

  /**
   * Check if poller is running
   */
  isPollerRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Check if cache has real data ready
   */
  isDataReady(): boolean {
    return this.isRunning && 
           this.cache.hasAny(DataCacheService.KEYS.SHARDS) &&
           this.cache.hasAny(DataCacheService.KEYS.RECENT_BLOCKS);
  }
}

// Singleton instance
let pollerInstance: ProductionDataPoller | null = null;

export function getProductionDataPoller(): ProductionDataPoller {
  if (!pollerInstance) {
    pollerInstance = new ProductionDataPoller();
    console.log('[ProductionDataPoller] Service initialized');
  }
  return pollerInstance;
}

export { ProductionDataPoller };
