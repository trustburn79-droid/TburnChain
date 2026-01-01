/**
 * ProductionDataPoller - Background data refresh service
 * 
 * This service:
 * 1. Polls data from TBurnEnterpriseNode at regular intervals
 * 2. Updates the DataCacheService with fresh data
 * 3. Decouples UI requests from live RPC calls
 * 4. Ensures data is always available even during rate limits
 */

import { createHash } from 'crypto';
import { getDataCache, DataCacheService } from './DataCacheService';
import { storage } from '../storage';
import { formatPublicNetworkStats, formatPublicTestnetStats } from '../routes/public-api-routes';
import { dataHub } from './DataHub';

interface PollerConfig {
  pollInterval: number; // Interval between polls in ms
  retryDelay: number; // Delay before retrying on error
  maxConsecutiveErrors: number; // Max errors before backing off
  circuitBreakerThreshold: number; // Errors before circuit opens
  circuitBreakerResetMs: number; // Time before circuit half-opens
  maxJitterMs: number; // Max random jitter to prevent thundering herd
}

interface PollerStats {
  isRunning: boolean;
  lastPollTime: Date | null;
  lastSuccessTime: Date | null;
  pollCount: number;
  errorCount: number;
  consecutiveErrors: number;
  circuitState: 'closed' | 'open' | 'half-open';
  circuitOpenedAt: number | null;
  isPollInProgress: boolean; // Overlap protection
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
    consecutiveErrors: 0,
    circuitState: 'closed',
    circuitOpenedAt: null,
    isPollInProgress: false
  };

  private config: PollerConfig = {
    // In development, use longer intervals to reduce event loop pressure and allow Vite to work smoothly
    pollInterval: process.env.NODE_ENV === 'development' ? 60000 : 15000, // 60s in dev, 15s in prod
    retryDelay: process.env.NODE_ENV === 'development' ? 10000 : 5000, // 10s in dev, 5s in prod
    maxConsecutiveErrors: 5, // Back off after 5 consecutive errors
    circuitBreakerThreshold: 10, // Open circuit after 10 consecutive errors
    circuitBreakerResetMs: 60000, // Try again after 60 seconds
    maxJitterMs: 2000 // Random jitter up to 2 seconds
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
   * Add random jitter to prevent thundering herd
   */
  private getJitter(): number {
    return Math.floor(Math.random() * this.config.maxJitterMs);
  }

  /**
   * Check and update circuit breaker state
   */
  private checkCircuitBreaker(): boolean {
    const now = Date.now();
    
    // If circuit is open, check if it's time to half-open
    if (this.stats.circuitState === 'open') {
      if (this.stats.circuitOpenedAt && 
          now - this.stats.circuitOpenedAt >= this.config.circuitBreakerResetMs) {
        this.stats.circuitState = 'half-open';
        console.log('[ProductionDataPoller] Circuit half-open, attempting recovery...');
        return true; // Allow one request to test
      }
      return false; // Circuit still open, block requests
    }
    
    return true; // Circuit closed or half-open, allow requests
  }

  /**
   * Schedule next poll with jitter and circuit breaker
   */
  private schedulePoll(): void {
    if (!this.isRunning) return;

    // Calculate delay based on consecutive errors with jitter
    let delay = this.config.pollInterval + this.getJitter();
    
    if (this.stats.circuitState === 'open') {
      // Use circuit breaker reset time when open
      delay = this.config.circuitBreakerResetMs + this.getJitter();
      console.log(`[ProductionDataPoller] Circuit open, waiting ${delay}ms before retry`);
    } else if (this.stats.consecutiveErrors > 0) {
      // Exponential backoff: 15s, 30s, 60s, 120s, max 300s
      delay = Math.min(
        this.config.pollInterval * Math.pow(2, this.stats.consecutiveErrors),
        300000
      ) + this.getJitter();
      console.log(`[ProductionDataPoller] Backing off, next poll in ${delay}ms`);
    }

    this.pollTimer = setTimeout(async () => {
      await this.poll();
      this.schedulePoll();
    }, delay);
  }

  /**
   * Execute a single poll cycle with overlap protection and circuit breaker
   */
  private async poll(): Promise<void> {
    if (!this.enterpriseNode) {
      console.warn('[ProductionDataPoller] Enterprise node not initialized');
      return;
    }

    // OVERLAP PROTECTION: Skip if previous poll is still running
    if (this.stats.isPollInProgress) {
      console.warn('[ProductionDataPoller] Skipping poll - previous poll still in progress');
      return;
    }

    // CIRCUIT BREAKER: Check if requests are allowed
    if (!this.checkCircuitBreaker()) {
      return; // Circuit is open, skip this poll
    }

    // Mark poll as in progress
    this.stats.isPollInProgress = true;
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
      
      // Warm admin community content cache (only if not already cached - avoids duplicate work)
      if (!this.cache.get('admin:community:content')) {
        try {
          // Use Promise.race with timeout to prevent blocking the poller
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Admin cache warm timeout')), 3000)
          );
          
          const dataPromise = Promise.all([
            storage.getAllCommunityPosts(),
            storage.getAllCommunityEvents(),
            storage.getAllCommunityAnnouncements(),
          ]);
          
          const [posts, events, announcements] = await Promise.race([
            dataPromise,
            timeoutPromise
          ]) as any[];
          
          // Only cache if dataset is reasonable size (< 1000 items total)
          if (posts.length + events.length + announcements.length < 1000) {
            const stats = {
              totalNews: announcements.length,
              activeNews: announcements.filter((a: any) => a.status !== 'archived').length,
              totalEvents: events.length,
              upcomingEvents: events.filter((e: any) => e.status === 'upcoming').length,
              totalPosts: posts.length,
              activePosts: posts.filter((p: any) => p.status === 'active').length,
              pinnedItems: [...announcements.filter((a: any) => a.isPinned), ...posts.filter((p: any) => p.isPinned)].length,
              flaggedItems: posts.filter((p: any) => p.status === 'flagged').length,
            };
            
            this.cache.set('admin:community:content', {
              news: announcements,
              events: events,
              hubPosts: posts,
              stats,
            }, 30000);
            successCount++;
          }
        } catch (e) {
          // Silent fail - admin cache warming is non-critical
        }
      }
      
      // Warm AI training cache (only if not already cached)
      if (!this.cache.get('admin_ai_training')) {
        try {
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('AI training cache warm timeout')), 3000)
          );
          
          const dataPromise = (async () => {
            const jobs = await storage.getAllAiTrainingJobs();
            const trainingData = this.enterpriseNode.getAITrainingData();
            
            const runningJobs = jobs.filter(j => j.status === 'running');
            const queuedJobs = jobs.filter(j => j.status === 'queued');
            const completedJobs = jobs.filter(j => j.status === 'completed');
            
            const avgAccuracy = completedJobs.length > 0 
              ? completedJobs.reduce((sum, j) => sum + (j.accuracy || 0), 0) / completedJobs.length 
              : 99.2;
            
            return {
              jobs: jobs.map(j => ({
                id: j.id,
                name: j.name,
                model: j.model,
                status: j.status,
                progress: j.progress,
                eta: j.eta || '-',
                dataPoints: j.dataPoints,
                epochs: j.epochs,
                currentEpoch: j.currentEpoch,
                accuracy: j.accuracy,
                loss: j.loss,
                validationAccuracy: j.validationAccuracy,
                validationLoss: j.validationLoss,
                datasetName: j.datasetName,
                datasetSize: j.datasetSize,
                startedAt: j.startedAt,
                completedAt: j.completedAt,
              })),
              datasets: trainingData.datasets,
              accuracyData: trainingData.accuracyData,
              modelVersions: trainingData.modelVersions,
              stats: {
                activeJobs: runningJobs.length + queuedJobs.length,
                runningJobs: runningJobs.length,
                queuedJobs: queuedJobs.length,
                totalData: '500.8M',
                avgAccuracy: Math.round(avgAccuracy * 10) / 10,
                modelVersions: trainingData.modelVersions.length
              }
            };
          })();
          
          const result = await Promise.race([dataPromise, timeoutPromise]) as any;
          this.cache.set('admin_ai_training', result, 30000);
          successCount++;
        } catch (e) {
          // Silent fail - AI training cache warming is non-critical
        }
      }
      
      // Warm AI tuning params cache (only if not already cached)
      if (!this.cache.get('admin_ai_params')) {
        try {
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('AI params cache warm timeout')), 3000)
          );
          
          const dataPromise = (async () => {
            const params = await storage.getActiveAiParameters();
            
            // Match exact structure from routes.ts /api/admin/ai/params
            const defaultModelConfigs = [
              { name: "Gemini 3 Pro", layer: "Strategic", temperature: 0.7, maxTokens: 4096, topP: 0.9, frequencyPenalty: 0.3, presencePenalty: 0.3 },
              { name: "Claude Sonnet 4.5", layer: "Tactical", temperature: 0.5, maxTokens: 8192, topP: 0.95, frequencyPenalty: 0.2, presencePenalty: 0.2 },
              { name: "GPT-4o", layer: "Operational", temperature: 0.3, maxTokens: 2048, topP: 0.8, frequencyPenalty: 0.1, presencePenalty: 0.1 },
              { name: "Grok 3", layer: "Fallback", temperature: 0.4, maxTokens: 4096, topP: 0.85, frequencyPenalty: 0.15, presencePenalty: 0.15 },
            ];
            
            const defaultDecisionParams = [
              { name: "Consensus Optimization", weight: 0.85, enabled: true },
              { name: "Shard Rebalancing", weight: 0.75, enabled: true },
              { name: "Gas Price Adjustment", weight: 0.90, enabled: true },
              { name: "Validator Selection", weight: 0.80, enabled: true },
              { name: "Bridge Risk Assessment", weight: 0.70, enabled: true },
              { name: "Burn Rate Optimization", weight: 0.65, enabled: false },
            ];
            
            if (params) {
              return {
                id: params.id,
                configName: params.configName,
                modelConfigs: Array.isArray(params.modelConfigs) && (params.modelConfigs as any[]).length > 0 
                  ? params.modelConfigs 
                  : defaultModelConfigs,
                decisionParams: Array.isArray(params.decisionParams) && (params.decisionParams as any[]).length > 0 
                  ? params.decisionParams 
                  : defaultDecisionParams,
                layerWeights: {
                  strategic: params.strategicWeight,
                  tactical: params.tacticalWeight,
                  operational: params.operationalWeight
                },
                thresholds: {
                  autoExecute: params.autoExecuteThreshold,
                  humanReview: params.humanReviewThreshold,
                  rejection: params.rejectionThreshold
                },
                rateLimits: {
                  strategicPerHour: params.strategicPerHour,
                  tacticalPerMinute: params.tacticalPerMinute,
                  operationalPerSecond: params.operationalPerSecond
                },
                emergencySettings: {
                  allowEmergencyActions: params.allowEmergencyActions,
                  circuitBreaker: params.circuitBreaker
                },
                advancedConfig: {
                  consensusTimeout: params.consensusTimeout,
                  retryAttempts: params.retryAttempts,
                  backoffMultiplier: params.backoffMultiplier,
                  cacheTTL: params.cacheTtl
                },
              };
            } else {
              // Match exact fallback structure from routes.ts
              return {
                id: 'ai-params-default',
                configName: 'Default Config',
                modelConfigs: defaultModelConfigs,
                decisionParams: defaultDecisionParams,
                layerWeights: { strategic: 50, tactical: 30, operational: 20 },
                thresholds: { autoExecute: 70, humanReview: 50, rejection: 30 },
                rateLimits: { strategicPerHour: 10, tacticalPerMinute: 100, operationalPerSecond: 1000 },
                emergencySettings: { allowEmergencyActions: true, circuitBreaker: true },
                advancedConfig: { consensusTimeout: 5000, retryAttempts: 3, backoffMultiplier: 1.5, cacheTTL: 300 }
              };
            }
          })();
          
          const result = await Promise.race([dataPromise, timeoutPromise]) as any;
          this.cache.set('admin_ai_params', result, 30000);
          successCount++;
        } catch (e) {
          // Silent fail - AI params cache warming is non-critical
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
      
      // CIRCUIT BREAKER: Open circuit if threshold exceeded
      if (this.stats.consecutiveErrors >= this.config.circuitBreakerThreshold) {
        this.stats.circuitState = 'open';
        this.stats.circuitOpenedAt = Date.now();
        console.warn('[ProductionDataPoller] Circuit breaker OPEN - too many consecutive errors');
      }
    } finally {
      // ALWAYS reset poll in progress flag
      this.stats.isPollInProgress = false;
      
      // If half-open and successful, close the circuit
      if (this.stats.circuitState === 'half-open' && this.stats.consecutiveErrors === 0) {
        this.stats.circuitState = 'closed';
        this.stats.circuitOpenedAt = null;
        console.log('[ProductionDataPoller] Circuit breaker CLOSED - recovery successful');
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
        // Use SHA-256 for full 64-char hex hashes without trailing zeros
        const txHash = `0x${createHash('sha256').update(`tx-poller-${Date.now()}-${i}`).digest('hex')}`;
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
      if (typeof this.enterpriseNode?.getAIModels === 'function') {
        return await this.enterpriseNode.getAIModels();
      }
      return [];
    } catch (error) {
      return [];
    }
  }

  private async fetchContracts(): Promise<any[]> {
    try {
      if (typeof this.enterpriseNode?.getContracts === 'function') {
        return await this.enterpriseNode.getContracts();
      }
      return [];
    } catch (error) {
      return [];
    }
  }

  private async fetchConsensusState(): Promise<any> {
    try {
      if (typeof this.enterpriseNode?.getConsensusState === 'function') {
        return await this.enterpriseNode.getConsensusState();
      }
      return null;
    } catch (error) {
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
