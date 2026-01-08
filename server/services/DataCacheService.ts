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
  // ★ [2026-01-06 메모리 안정성 v3.1] 극단적 TTL 최적화
  private readonly DEFAULT_TTL = 60000; // 60 seconds (longer cache = less frequent updates = less memory churn)
  private readonly STALE_TTL = 90000; // 1.5 minutes (aggressive cleanup)
  
  // ★ [v3.1] 메모리 누수 방지 설정 - 최소 캐시 크기
  private readonly MAX_CACHE_SIZE = 15; // ★ 극단적 축소: 15개 (essential data only)
  private readonly CLEANUP_INTERVAL = 60000; // ★ 60초로 늘림 (오버헤드 감소)
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // 주기적인 메모리 정리 시작
    this.startCleanupTimer();
  }

  /**
   * ★ 주기적인 캐시 정리 시작
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) return;
    
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpired();
      this.enforceMaxSize();
      this.logMemoryUsage();
    }, this.CLEANUP_INTERVAL);
    
    console.log('[DataCache] Cleanup timer started (interval: 30s)');
  }

  /**
   * ★ 만료된 캐시 항목 정리
   */
  private cleanupExpired(): void {
    const now = Date.now();
    let cleaned = 0;
    
    // ★ ES5 호환 반복자 사용
    const entries = Array.from(this.cache.entries());
    for (let i = 0; i < entries.length; i++) {
      const [key, entry] = entries[i];
      const age = now - entry.timestamp;
      if (age > this.STALE_TTL) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      this.stats.size = this.cache.size;
      console.log(`[DataCache] Cleaned ${cleaned} expired entries, remaining: ${this.cache.size}`);
    }
  }

  /**
   * ★ 최대 캐시 크기 유지 (LRU 방식)
   */
  private enforceMaxSize(): void {
    if (this.cache.size <= this.MAX_CACHE_SIZE) return;
    
    // 가장 오래된 항목부터 삭제
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const toRemove = this.cache.size - this.MAX_CACHE_SIZE;
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
    
    this.stats.size = this.cache.size;
    console.log(`[DataCache] Enforced max size, removed ${toRemove} oldest entries`);
  }

  /**
   * ★ 메모리 사용량 로깅 및 압박 시 자동 GC 트리거
   */
  private logMemoryUsage(): void {
    const used = process.memoryUsage();
    const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
    // ★ [2026-01-08] V8 힙 제한 사용 (동적 로드)
    let heapLimitMB = 8240;
    try {
      const v8 = require('v8');
      heapLimitMB = v8.getHeapStatistics().heap_size_limit / (1024 * 1024);
    } catch {}
    const heapRatio = heapUsedMB / heapLimitMB;
    
    console.log(`[Memory] Heap: ${heapUsedMB}MB / ${Math.round(heapLimitMB)}MB, Cache entries: ${this.cache.size}`);
    
    // ★ [2026-01-04 메모리 안정성 v3.0] 자동 메모리 보호
    if (heapRatio > 0.85) {
      console.warn(`[Memory] ⚠️ High heap usage (${Math.round(heapRatio * 100)}%), triggering emergency cleanup`);
      
      // 긴급 캐시 정리 - 절반만 유지
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toRemove = Math.ceil(entries.length / 2);
      for (let i = 0; i < toRemove; i++) {
        this.cache.delete(entries[i][0]);
      }
      this.stats.size = this.cache.size;
      
      // GC 트리거 (if available)
      if (global.gc) {
        global.gc();
        console.log('[Memory] 🔄 Triggered garbage collection');
      }
    }
  }
  
  /**
   * ★ 강제 캐시 전체 정리 (긴급 상황용)
   */
  public emergencyClear(): void {
    const previousSize = this.cache.size;
    this.cache.clear();
    this.stats.size = 0;
    console.log(`[DataCache] ⚠️ Emergency clear: removed ${previousSize} entries`);
    
    if (global.gc) {
      global.gc();
      console.log('[DataCache] 🔄 Triggered garbage collection after emergency clear');
    }
  }

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
   * Delete a specific cache entry
   * @param key Cache key to delete
   * @returns true if the key existed and was deleted, false otherwise
   */
  del(key: string): boolean {
    const existed = this.cache.has(key);
    if (existed) {
      this.cache.delete(key);
      this.stats.size = this.cache.size;
      console.log(`[DataCache] Deleted ${key}`);
    }
    return existed;
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
   * Clear all cache entries matching a pattern (prefix)
   * @param pattern Pattern prefix to match
   */
  clearPattern(pattern: string): void {
    let cleared = 0;
    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      if (key.startsWith(pattern)) {
        this.cache.delete(key);
        cleared++;
      }
    }
    this.stats.size = this.cache.size;
    if (cleared > 0) {
      console.log(`[DataCache] Cleared ${cleared} entries matching pattern: ${pattern}`);
    }
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
