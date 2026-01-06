/**
 * TBURN Enterprise Block Memory Manager v7.0
 * 
 * Production-grade multi-level LRU cache for block memory management
 * Features: Hot/Warm/Cold cache tiers, TTL eviction, preloading
 * 
 * @version 7.0.0-enterprise
 */

import { EventEmitter } from 'events';
import { METRICS_CONFIG } from './metrics-config';

export interface Block {
  number: number;
  hash: string;
  parentHash: string;
  timestamp: number;
  proposer: string;
  transactionCount: number;
  transactions?: string[];
  stateRoot: string;
  gasUsed: string;
  size: number;
  validatorSignatures: number;
  finalityStatus?: 'pending' | 'confirmed' | 'finalized';
  shardId?: number;
}

interface CacheEntry<T> {
  value: T;
  size: number;
  lastAccessed: number;
  accessCount: number;
  createdAt: number;
  tier: 'hot' | 'warm' | 'cold';
}

export interface BlockRetentionPolicy {
  inMemoryBlocks: number;
  hotCacheBlocks: number;
  warmCacheBlocks: number;
  maxCacheSizeMB: number;
  ttlHotMs: number;
  ttlWarmMs: number;
  preloadBlocks: number;
}

export interface CacheStats {
  items: number;
  maxItems: number;
  sizeBytes: number;
  maxSizeBytes: number;
  utilization: number;
  hitRate: number;
  evictions: number;
  promotions: number;
  demotions: number;
}

export class MultiLevelLRUCache<K, V> {
  private hotCache: Map<K, CacheEntry<V>> = new Map();
  private warmCache: Map<K, CacheEntry<V>> = new Map();
  private coldCache: Map<K, CacheEntry<V>> = new Map();
  
  private maxHotItems: number;
  private maxWarmItems: number;
  private maxColdItems: number;
  private maxSizeBytes: number;
  private currentSizeBytes = 0;
  
  private accessOrder: K[] = [];
  private hitCount = 0;
  private missCount = 0;
  private evictionCount = 0;
  private promotionCount = 0;
  private demotionCount = 0;
  
  private ttlHotMs: number;
  private ttlWarmMs: number;
  private ttlCheckTimer: NodeJS.Timeout | null = null;
  
  constructor(
    maxHotItems: number, 
    maxWarmItems: number,
    maxColdItems: number,
    maxSizeMB: number,
    ttlHotMs: number = 60000,
    ttlWarmMs: number = 300000
  ) {
    this.maxHotItems = maxHotItems;
    this.maxWarmItems = maxWarmItems;
    this.maxColdItems = maxColdItems;
    this.maxSizeBytes = maxSizeMB * 1024 * 1024;
    this.ttlHotMs = ttlHotMs;
    this.ttlWarmMs = ttlWarmMs;
    
    // TTL 체크 시작
    this.ttlCheckTimer = setInterval(() => this.evictExpired(), 30000);
  }
  
  set(key: K, value: V, tier: 'hot' | 'warm' = 'hot'): void {
    const size = this.calculateSize(value);
    const now = Date.now();
    
    // 기존 항목 제거
    this.delete(key);
    
    // 공간 확보
    while (this.currentSizeBytes + size > this.maxSizeBytes) {
      if (!this.evictLRU()) break;
    }
    
    const entry: CacheEntry<V> = {
      value,
      size,
      lastAccessed: now,
      accessCount: 1,
      createdAt: now,
      tier,
    };
    
    if (tier === 'hot') {
      this.ensureHotCapacity();
      this.hotCache.set(key, entry);
    } else {
      this.ensureWarmCapacity();
      this.warmCache.set(key, entry);
    }
    
    this.currentSizeBytes += size;
    this.accessOrder.push(key);
  }
  
  get(key: K): V | undefined {
    const now = Date.now();
    
    // Hot 캐시 확인
    let entry = this.hotCache.get(key);
    if (entry) {
      entry.lastAccessed = now;
      entry.accessCount++;
      this.hitCount++;
      return entry.value;
    }
    
    // Warm 캐시 확인 -> Hot으로 승급
    entry = this.warmCache.get(key);
    if (entry) {
      entry.lastAccessed = now;
      entry.accessCount++;
      this.warmCache.delete(key);
      this.ensureHotCapacity();
      entry.tier = 'hot';
      this.hotCache.set(key, entry);
      this.promotionCount++;
      this.hitCount++;
      return entry.value;
    }
    
    // Cold 캐시 확인 -> Warm으로 승급
    entry = this.coldCache.get(key);
    if (entry) {
      entry.lastAccessed = now;
      entry.accessCount++;
      this.coldCache.delete(key);
      this.ensureWarmCapacity();
      entry.tier = 'warm';
      this.warmCache.set(key, entry);
      this.promotionCount++;
      this.hitCount++;
      return entry.value;
    }
    
    this.missCount++;
    return undefined;
  }
  
  has(key: K): boolean {
    return this.hotCache.has(key) || 
           this.warmCache.has(key) || 
           this.coldCache.has(key);
  }
  
  delete(key: K): boolean {
    let entry = this.hotCache.get(key);
    if (entry) {
      this.currentSizeBytes -= entry.size;
      this.hotCache.delete(key);
      this.removeFromAccessOrder(key);
      return true;
    }
    
    entry = this.warmCache.get(key);
    if (entry) {
      this.currentSizeBytes -= entry.size;
      this.warmCache.delete(key);
      this.removeFromAccessOrder(key);
      return true;
    }
    
    entry = this.coldCache.get(key);
    if (entry) {
      this.currentSizeBytes -= entry.size;
      this.coldCache.delete(key);
      this.removeFromAccessOrder(key);
      return true;
    }
    
    return false;
  }
  
  clear(): void {
    this.hotCache.clear();
    this.warmCache.clear();
    this.coldCache.clear();
    this.accessOrder = [];
    this.currentSizeBytes = 0;
  }
  
  private ensureHotCapacity(): void {
    while (this.hotCache.size >= this.maxHotItems) {
      const demoted = this.demoteOldestHot();
      if (!demoted) break;
    }
  }
  
  private ensureWarmCapacity(): void {
    while (this.warmCache.size >= this.maxWarmItems) {
      const demoted = this.demoteOldestWarm();
      if (!demoted) break;
    }
  }
  
  private demoteOldestHot(): boolean {
    let oldestKey: K | null = null;
    let oldestTime = Infinity;
    
    for (const [key, entry] of this.hotCache) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey === null) return false;
    
    const entry = this.hotCache.get(oldestKey)!;
    this.hotCache.delete(oldestKey);
    
    // Warm으로 강등
    if (this.warmCache.size < this.maxWarmItems) {
      entry.tier = 'warm';
      this.warmCache.set(oldestKey, entry);
      this.demotionCount++;
    } else {
      // Cold로 강등
      entry.tier = 'cold';
      this.coldCache.set(oldestKey, entry);
      this.demotionCount++;
      this.ensureColdCapacity();
    }
    
    return true;
  }
  
  private demoteOldestWarm(): boolean {
    let oldestKey: K | null = null;
    let oldestTime = Infinity;
    
    for (const [key, entry] of this.warmCache) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey === null) return false;
    
    const entry = this.warmCache.get(oldestKey)!;
    this.warmCache.delete(oldestKey);
    
    // Cold로 강등
    entry.tier = 'cold';
    this.coldCache.set(oldestKey, entry);
    this.demotionCount++;
    this.ensureColdCapacity();
    
    return true;
  }
  
  private ensureColdCapacity(): void {
    while (this.coldCache.size > this.maxColdItems) {
      this.evictColdest();
    }
  }
  
  private evictColdest(): void {
    let oldestKey: K | null = null;
    let oldestTime = Infinity;
    
    for (const [key, entry] of this.coldCache) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey !== null) {
      const entry = this.coldCache.get(oldestKey)!;
      this.currentSizeBytes -= entry.size;
      this.coldCache.delete(oldestKey);
      this.removeFromAccessOrder(oldestKey);
      this.evictionCount++;
    }
  }
  
  private evictLRU(): boolean {
    // Cold -> Warm -> Hot 순서로 제거
    if (this.coldCache.size > 0) {
      this.evictColdest();
      return true;
    }
    
    if (this.warmCache.size > 0) {
      this.demoteOldestWarm();
      this.evictColdest();
      return true;
    }
    
    if (this.hotCache.size > 0) {
      this.demoteOldestHot();
      this.demoteOldestWarm();
      this.evictColdest();
      return true;
    }
    
    return false;
  }
  
  private evictExpired(): void {
    const now = Date.now();
    
    // Hot 캐시 TTL 체크
    for (const [key, entry] of this.hotCache) {
      if (now - entry.createdAt > this.ttlHotMs) {
        this.hotCache.delete(key);
        entry.tier = 'warm';
        this.warmCache.set(key, entry);
        this.demotionCount++;
      }
    }
    
    // Warm 캐시 TTL 체크
    for (const [key, entry] of this.warmCache) {
      if (now - entry.createdAt > this.ttlWarmMs) {
        this.warmCache.delete(key);
        entry.tier = 'cold';
        this.coldCache.set(key, entry);
        this.demotionCount++;
      }
    }
    
    this.ensureColdCapacity();
  }
  
  private removeFromAccessOrder(key: K): void {
    const index = this.accessOrder.indexOf(key);
    if (index !== -1) {
      this.accessOrder.splice(index, 1);
    }
  }
  
  private calculateSize(value: V): number {
    try {
      return JSON.stringify(value).length * 2;
    } catch {
      return 512;
    }
  }
  
  evictBefore(threshold: K extends number ? number : never): void {
    if (typeof threshold !== 'number') return;
    
    const evictFromCache = (cache: Map<K, CacheEntry<V>>) => {
      const keysToRemove: K[] = [];
      for (const key of cache.keys()) {
        if (typeof key === 'number' && key < threshold) {
          keysToRemove.push(key);
        }
      }
      for (const key of keysToRemove) {
        const entry = cache.get(key);
        if (entry) {
          this.currentSizeBytes -= entry.size;
          cache.delete(key);
          this.evictionCount++;
        }
      }
    };
    
    evictFromCache(this.hotCache);
    evictFromCache(this.warmCache);
    evictFromCache(this.coldCache);
  }
  
  getSize(): number {
    return this.hotCache.size + this.warmCache.size + this.coldCache.size;
  }
  
  getSizeBytes(): number {
    return this.currentSizeBytes;
  }
  
  getStats(): CacheStats {
    const totalItems = this.getSize();
    const totalQueries = this.hitCount + this.missCount;
    
    return {
      items: totalItems,
      maxItems: this.maxHotItems + this.maxWarmItems + this.maxColdItems,
      sizeBytes: this.currentSizeBytes,
      maxSizeBytes: this.maxSizeBytes,
      utilization: totalItems > 0 ? this.currentSizeBytes / this.maxSizeBytes : 0,
      hitRate: totalQueries > 0 ? this.hitCount / totalQueries : 0,
      evictions: this.evictionCount,
      promotions: this.promotionCount,
      demotions: this.demotionCount,
    };
  }
  
  getTierStats(): { hot: number; warm: number; cold: number } {
    return {
      hot: this.hotCache.size,
      warm: this.warmCache.size,
      cold: this.coldCache.size,
    };
  }
  
  destroy(): void {
    if (this.ttlCheckTimer) {
      clearInterval(this.ttlCheckTimer);
      this.ttlCheckTimer = null;
    }
    this.clear();
  }
}

export class BlockMemoryManager extends EventEmitter {
  private readonly policy: BlockRetentionPolicy;
  private blockCache: MultiLevelLRUCache<number, Block>;
  private lastBlockNumber = 0;
  private totalBlocksProcessed = 0;
  private evictionCount = 0;
  private startTime = Date.now();
  
  constructor(policy?: Partial<BlockRetentionPolicy>) {
    super();
    
    const cacheConfig = METRICS_CONFIG.BLOCK_CACHE;
    
    this.policy = {
      inMemoryBlocks: policy?.inMemoryBlocks || cacheConfig.IN_MEMORY_BLOCKS,
      hotCacheBlocks: policy?.hotCacheBlocks || cacheConfig.HOT_CACHE_BLOCKS,
      warmCacheBlocks: policy?.warmCacheBlocks || cacheConfig.WARM_CACHE_BLOCKS || 50000,
      maxCacheSizeMB: policy?.maxCacheSizeMB || cacheConfig.MAX_CACHE_SIZE_MB,
      ttlHotMs: policy?.ttlHotMs || cacheConfig.TTL_HOT_MS || 60000,
      ttlWarmMs: policy?.ttlWarmMs || cacheConfig.TTL_WARM_MS || 300000,
      preloadBlocks: policy?.preloadBlocks || cacheConfig.PRELOAD_BLOCKS || 100,
    };
    
    this.blockCache = new MultiLevelLRUCache<number, Block>(
      this.policy.hotCacheBlocks,
      this.policy.warmCacheBlocks,
      this.policy.inMemoryBlocks * 2,  // Cold는 2배
      this.policy.maxCacheSizeMB,
      this.policy.ttlHotMs,
      this.policy.ttlWarmMs
    );
    
    console.log('[BlockMemoryManager] Initialized with policy:', {
      hotBlocks: this.policy.hotCacheBlocks,
      warmBlocks: this.policy.warmCacheBlocks,
      maxCacheMB: this.policy.maxCacheSizeMB,
    });
  }
  
  addBlock(block: Block, tier: 'hot' | 'warm' = 'hot'): void {
    this.blockCache.set(block.number, block, tier);
    this.lastBlockNumber = Math.max(this.lastBlockNumber, block.number);
    this.totalBlocksProcessed++;
    
    // 주기적 GC 힌트
    if (block.number % 1000 === 0) {
      this.triggerGCHint();
    }
    
    this.emit('blockAdded', { 
      blockNumber: block.number, 
      cacheSize: this.blockCache.getSize(),
      tier,
    });
  }
  
  // 배치 추가 (고성능)
  addBlocks(blocks: Block[], tier: 'hot' | 'warm' = 'warm'): void {
    for (const block of blocks) {
      this.blockCache.set(block.number, block, tier);
      this.lastBlockNumber = Math.max(this.lastBlockNumber, block.number);
    }
    this.totalBlocksProcessed += blocks.length;
    
    this.emit('blocksAdded', { count: blocks.length, cacheSize: this.blockCache.getSize() });
  }
  
  getBlock(blockNumber: number): Block | undefined {
    return this.blockCache.get(blockNumber);
  }
  
  getRecentBlocks(count: number): Block[] {
    const blocks: Block[] = [];
    
    for (let i = 0; i < count; i++) {
      const blockNumber = this.lastBlockNumber - i;
      const block = this.blockCache.get(blockNumber);
      if (block) {
        blocks.push(block);
      }
    }
    
    return blocks;
  }
  
  getBlockRange(start: number, end: number): Block[] {
    const blocks: Block[] = [];
    
    for (let i = start; i <= end; i++) {
      const block = this.blockCache.get(i);
      if (block) {
        blocks.push(block);
      }
    }
    
    return blocks;
  }
  
  evictOldBlocks(): void {
    const cutoff = this.lastBlockNumber - this.policy.inMemoryBlocks;
    const beforeSize = this.blockCache.getSize();
    
    this.blockCache.evictBefore(cutoff as any);
    
    const evicted = beforeSize - this.blockCache.getSize();
    if (evicted > 0) {
      this.evictionCount += evicted;
      this.emit('blocksEvicted', { count: evicted, cutoff });
    }
  }
  
  clear(): void {
    this.blockCache.clear();
    this.emit('cacheCleared');
  }
  
  private triggerGCHint(): void {
    if (typeof global.gc === 'function') {
      setImmediate(() => global.gc!());
    }
  }
  
  getStats(): {
    cacheSize: number;
    cacheSizeBytes: number;
    tierStats: { hot: number; warm: number; cold: number };
    maxBlocks: number;
    maxSizeMB: number;
    lastBlockNumber: number;
    totalBlocksProcessed: number;
    evictionCount: number;
    uptime: number;
    hitRate: number;
    utilization: number;
  } {
    const cacheStats = this.blockCache.getStats();
    const tierStats = this.blockCache.getTierStats();
    
    return {
      cacheSize: cacheStats.items,
      cacheSizeBytes: cacheStats.sizeBytes,
      tierStats,
      maxBlocks: this.policy.hotCacheBlocks + this.policy.warmCacheBlocks,
      maxSizeMB: this.policy.maxCacheSizeMB,
      lastBlockNumber: this.lastBlockNumber,
      totalBlocksProcessed: this.totalBlocksProcessed,
      evictionCount: cacheStats.evictions,
      uptime: Date.now() - this.startTime,
      hitRate: cacheStats.hitRate,
      utilization: cacheStats.utilization,
    };
  }
  
  destroy(): void {
    this.blockCache.destroy();
  }
}

// 싱글톤 인스턴스
export const blockMemoryManager = new BlockMemoryManager();
