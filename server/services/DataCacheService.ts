/**
 * DataCacheService - In-memory cache layer for TBURN mainnet data
 * 
 * This service provides a caching layer that:
 * 1. Stores data with TTL (time-to-live)
 * 2. Returns cached data immediately on rate limits
 * 3. Allows background refresh without blocking API routes
 * 4. Prevents UI freezing from rate limit waits
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  isStale: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  staleHits: number;
  size: number;
  lastUpdate: Date | null;
}

class DataCacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    staleHits: 0,
    size: 0,
    lastUpdate: null
  };

  // Default TTL values in milliseconds
  private readonly DEFAULT_TTL = 30000; // 30 seconds
  private readonly STALE_TTL = 300000; // 5 minutes - serve stale data during rate limits

  // Cache keys
  static readonly KEYS = {
    NETWORK_STATS: 'network_stats',
    RECENT_BLOCKS: 'recent_blocks',
    RECENT_TRANSACTIONS: 'recent_transactions',
    SHARDS: 'shards',
    VALIDATORS: 'validators',
    AI_MODELS: 'ai_models',
    AI_DECISIONS: 'ai_decisions',
    CONTRACTS: 'contracts',
    WALLETS: 'wallets',
    CONSENSUS_STATE: 'consensus_state',
    NODE_HEALTH: 'node_health',
    CROSS_SHARD_MESSAGES: 'cross_shard_messages'
  };

  /**
   * Get data from cache
   * @param key Cache key
   * @param allowStale Whether to return stale data if fresh data is unavailable
   * @returns Cached data or null if not found/expired
   */
  get<T>(key: string, allowStale = true): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;
    
    // Fresh data - return immediately
    if (age < entry.ttl) {
      this.stats.hits++;
      return entry.data;
    }

    // Stale data - return if allowed and within stale TTL
    if (allowStale && age < this.STALE_TTL) {
      this.stats.staleHits++;
      console.log(`[DataCache] Serving stale data for ${key} (age: ${Math.round(age/1000)}s)`);
      return entry.data;
    }

    // Data too old, treat as miss
    this.stats.misses++;
    return null;
  }

  /**
   * Set data in cache
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Optional TTL in milliseconds
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL,
      isStale: false
    };

    this.cache.set(key, entry);
    this.stats.size = this.cache.size;
    this.stats.lastUpdate = new Date();
    
    console.log(`[DataCache] Cached ${key} with TTL ${entry.ttl}ms`);
  }

  /**
   * Check if cache has valid (non-stale) data
   * @param key Cache key
   */
  hasFresh(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    const age = Date.now() - entry.timestamp;
    return age < entry.ttl;
  }

  /**
   * Check if cache has any data (fresh or stale)
   * @param key Cache key
   */
  hasAny(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    const age = Date.now() - entry.timestamp;
    return age < this.STALE_TTL;
  }

  /**
   * Delete specific cache entry
   * @param key Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
    this.stats.size = this.cache.size;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
    console.log('[DataCache] Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get cache entry age in milliseconds
   * @param key Cache key
   */
  getAge(key: string): number | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    return Date.now() - entry.timestamp;
  }

  /**
   * Mark all entries as stale (forces refresh on next request)
   */
  markAllStale(): void {
    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      entry.isStale = true;
    });
    console.log('[DataCache] All entries marked as stale');
  }

  /**
   * Get or fetch data - returns cached data immediately, triggers background refresh if stale
   * @param key Cache key
   * @param fetcher Function to fetch fresh data
   * @param ttl Optional TTL
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T | null> {
    // Try to get from cache first
    const cached = this.get<T>(key, true);
    
    // If we have fresh data, return it
    if (cached !== null && this.hasFresh(key)) {
      return cached;
    }

    // If we have stale data, return it and trigger background refresh
    if (cached !== null) {
      // Background refresh - don't await, don't block
      this.backgroundRefresh(key, fetcher, ttl).catch(err => {
        console.log(`[DataCache] Background refresh failed for ${key}:`, err.message);
      });
      return cached;
    }

    // No cached data - must fetch (but with timeout)
    try {
      const data = await Promise.race([
        fetcher(),
        new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('Fetch timeout')), 5000)
        )
      ]);
      
      if (data !== null) {
        this.set(key, data, ttl);
      }
      return data as T;
    } catch (error: any) {
      console.log(`[DataCache] Fetch failed for ${key}:`, error.message);
      return null;
    }
  }

  /**
   * Background refresh - updates cache without blocking
   */
  private async backgroundRefresh<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<void> {
    try {
      const data = await Promise.race([
        fetcher(),
        new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('Background refresh timeout')), 10000)
        )
      ]);
      
      if (data !== null) {
        this.set(key, data, ttl);
        console.log(`[DataCache] Background refresh completed for ${key}`);
      }
    } catch (error: any) {
      console.log(`[DataCache] Background refresh failed for ${key}:`, error.message);
    }
  }

  /**
   * Pre-warm cache with initial data
   */
  async preWarm(data: { [key: string]: any }, ttl?: number): Promise<void> {
    for (const [key, value] of Object.entries(data)) {
      if (value !== null && value !== undefined) {
        this.set(key, value, ttl);
      }
    }
    console.log(`[DataCache] Pre-warmed ${Object.keys(data).length} entries`);
  }
}

// Singleton instance
let dataCacheInstance: DataCacheService | null = null;

export function getDataCache(): DataCacheService {
  if (!dataCacheInstance) {
    dataCacheInstance = new DataCacheService();
    console.log('[DataCache] Service initialized');
  }
  return dataCacheInstance;
}

export { DataCacheService };
