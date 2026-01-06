/**
 * TBURN Enterprise Block Memory Manager v6.0
 * 
 * LRU cache-based block memory management for optimal memory usage
 * Automatically evicts old blocks while maintaining recent block access
 * 
 * @version 6.0.0-enterprise
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
}

interface CacheEntry<T> {
  value: T;
  size: number;
  lastAccessed: number;
  accessCount: number;
}

export interface BlockRetentionPolicy {
  inMemoryBlocks: number;
  hotCacheBlocks: number;
  maxCacheSizeMB: number;
}

export class LRUCache<K, V> {
  private cache: Map<K, CacheEntry<V>> = new Map();
  private maxItems: number;
  private maxSizeBytes: number;
  private currentSizeBytes = 0;
  private accessOrder: K[] = [];
  
  constructor(maxItems: number, maxSizeMB: number = 100) {
    this.maxItems = maxItems;
    this.maxSizeBytes = maxSizeMB * 1024 * 1024;
  }
  
  set(key: K, value: V): void {
    const size = this.calculateSize(value);
    
    // 기존 항목 제거
    if (this.cache.has(key)) {
      const existing = this.cache.get(key)!;
      this.currentSizeBytes -= existing.size;
      this.removeFromAccessOrder(key);
    }
    
    // 공간 확보
    while (
      (this.cache.size >= this.maxItems || 
       this.currentSizeBytes + size > this.maxSizeBytes) &&
      this.cache.size > 0
    ) {
      this.evictLRU();
    }
    
    // 새 항목 추가
    this.cache.set(key, {
      value,
      size,
      lastAccessed: Date.now(),
      accessCount: 1,
    });
    this.currentSizeBytes += size;
    this.accessOrder.push(key);
  }
  
  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    
    // 접근 정보 업데이트
    entry.lastAccessed = Date.now();
    entry.accessCount++;
    
    // 접근 순서 업데이트
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
    
    return entry.value;
  }
  
  has(key: K): boolean {
    return this.cache.has(key);
  }
  
  delete(key: K): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    this.currentSizeBytes -= entry.size;
    this.removeFromAccessOrder(key);
    return this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.currentSizeBytes = 0;
  }
  
  private evictLRU(): void {
    if (this.accessOrder.length === 0) return;
    
    const lruKey = this.accessOrder.shift()!;
    const entry = this.cache.get(lruKey);
    if (entry) {
      this.currentSizeBytes -= entry.size;
      this.cache.delete(lruKey);
    }
  }
  
  private removeFromAccessOrder(key: K): void {
    const index = this.accessOrder.indexOf(key);
    if (index !== -1) {
      this.accessOrder.splice(index, 1);
    }
  }
  
  private calculateSize(value: V): number {
    return JSON.stringify(value).length * 2; // UTF-16
  }
  
  evictBefore(threshold: K extends number ? number : never): void {
    if (typeof threshold !== 'number') return;
    
    const keysToRemove: K[] = [];
    for (const key of this.cache.keys()) {
      if (typeof key === 'number' && key < threshold) {
        keysToRemove.push(key);
      }
    }
    
    for (const key of keysToRemove) {
      this.delete(key);
    }
  }
  
  getSize(): number {
    return this.cache.size;
  }
  
  getSizeBytes(): number {
    return this.currentSizeBytes;
  }
  
  getStats(): {
    items: number;
    maxItems: number;
    sizeBytes: number;
    maxSizeBytes: number;
    utilization: number;
  } {
    return {
      items: this.cache.size,
      maxItems: this.maxItems,
      sizeBytes: this.currentSizeBytes,
      maxSizeBytes: this.maxSizeBytes,
      utilization: this.currentSizeBytes / this.maxSizeBytes,
    };
  }
}

export class BlockMemoryManager extends EventEmitter {
  private readonly policy: BlockRetentionPolicy;
  private blockCache: LRUCache<number, Block>;
  private lastBlockNumber = 0;
  private totalBlocksProcessed = 0;
  private evictionCount = 0;
  private startTime = Date.now();
  
  constructor(policy?: Partial<BlockRetentionPolicy>) {
    super();
    
    this.policy = {
      inMemoryBlocks: policy?.inMemoryBlocks || 
        METRICS_CONFIG.BLOCK_CACHE.IN_MEMORY_BLOCKS,
      hotCacheBlocks: policy?.hotCacheBlocks || 
        METRICS_CONFIG.BLOCK_CACHE.HOT_CACHE_BLOCKS,
      maxCacheSizeMB: policy?.maxCacheSizeMB || 
        METRICS_CONFIG.BLOCK_CACHE.MAX_CACHE_SIZE_MB,
    };
    
    this.blockCache = new LRUCache<number, Block>(
      this.policy.inMemoryBlocks,
      this.policy.maxCacheSizeMB
    );
  }
  
  // 블록 추가 (자동 LRU 관리)
  addBlock(block: Block): void {
    this.blockCache.set(block.number, block);
    this.lastBlockNumber = Math.max(this.lastBlockNumber, block.number);
    this.totalBlocksProcessed++;
    
    // 주기적 GC 힌트
    if (block.number % 100 === 0) {
      this.triggerGCHint();
    }
    
    this.emit('blockAdded', { 
      blockNumber: block.number, 
      cacheSize: this.blockCache.getSize() 
    });
  }
  
  // 블록 조회 (LRU 캐시)
  getBlock(blockNumber: number): Block | undefined {
    return this.blockCache.get(blockNumber);
  }
  
  // 최근 블록들 조회
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
  
  // 블록 범위 조회
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
  
  // 오래된 블록 제거
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
  
  // 캐시 정리
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
    maxBlocks: number;
    maxSizeMB: number;
    lastBlockNumber: number;
    totalBlocksProcessed: number;
    evictionCount: number;
    uptime: number;
    utilization: number;
  } {
    const cacheStats = this.blockCache.getStats();
    
    return {
      cacheSize: cacheStats.items,
      cacheSizeBytes: cacheStats.sizeBytes,
      maxBlocks: this.policy.inMemoryBlocks,
      maxSizeMB: this.policy.maxCacheSizeMB,
      lastBlockNumber: this.lastBlockNumber,
      totalBlocksProcessed: this.totalBlocksProcessed,
      evictionCount: this.evictionCount,
      uptime: Date.now() - this.startTime,
      utilization: cacheStats.utilization,
    };
  }
}

// 싱글톤 인스턴스
export const blockMemoryManager = new BlockMemoryManager();
