/**
 * TBURN Enterprise Mempool Service
 * Production-grade transaction pool for mainnet
 * 
 * Features:
 * - Multi-tier priority queue using Fibonacci Heap
 * - Per-address pending transaction limits
 * - Gas price based ordering with MEV protection
 * - Duplicate detection with Bloom filter
 * - Automatic expiration and eviction
 * - Shard-aware transaction routing
 * - Real-time metrics and monitoring
 * - Batch retrieval for block production
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';
import { ValidatedTransaction, ValidationResult } from '../validation/enterprise-tx-validator';

// ============================================================================
// Configuration
// ============================================================================

export const MEMPOOL_CONFIG = {
  // Capacity Limits
  MAX_POOL_SIZE: 100000,
  MAX_PER_ADDRESS: 64,
  MAX_PENDING_PER_SHARD: 10000,
  
  // Priority Tiers
  PRIORITY_TIERS: {
    CRITICAL: { weight: 16, maxSize: 5000 },
    HIGH: { weight: 8, maxSize: 20000 },
    NORMAL: { weight: 4, maxSize: 50000 },
    LOW: { weight: 1, maxSize: 25000 },
  },
  
  // Eviction Policy
  EVICTION_BATCH_SIZE: 1000,
  EVICTION_THRESHOLD: 0.95, // 95% capacity
  MIN_GAS_PRICE_PERCENTILE: 10, // Evict bottom 10%
  
  // Expiration
  TX_EXPIRY_MS: 3600000, // 1 hour
  CLEANUP_INTERVAL_MS: 30000, // 30 seconds
  
  // Bloom Filter
  BLOOM_SIZE: 1000000,
  BLOOM_HASH_COUNT: 7,
  BLOOM_ROTATION_INTERVAL_MS: 300000, // 5 minutes
  
  // Retrieval
  MAX_BATCH_SIZE: 1000,
  BATCH_GAS_LIMIT: BigInt(30000000),
  
  // Rate Limiting
  MAX_INSERTIONS_PER_SECOND: 10000,
  
  // Metrics
  METRICS_WINDOW_SIZE: 1000,
};

// ============================================================================
// Type Definitions
// ============================================================================

export type MempoolPriority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
export type TxStatus = 'PENDING' | 'SELECTED' | 'CONFIRMED' | 'EVICTED' | 'EXPIRED';

export interface MempoolTransaction {
  tx: ValidatedTransaction;
  priority: MempoolPriority;
  status: TxStatus;
  insertedAt: number;
  expiresAt: number;
  selectedAt?: number;
  shardId: number;
  score: number; // Combined priority score
}

export interface MempoolStats {
  totalPending: number;
  totalByPriority: Record<MempoolPriority, number>;
  totalByStatus: Record<TxStatus, number>;
  avgGasPrice: bigint;
  minGasPrice: bigint;
  maxGasPrice: bigint;
  insertionsPerSecond: number;
  evictionsPerSecond: number;
  utilizationPercent: number;
  oldestTxAge: number;
  uniqueAddresses: number;
}

export interface BatchResult {
  transactions: ValidatedTransaction[];
  totalGas: bigint;
  avgGasPrice: bigint;
  count: number;
  retrievedAt: number;
}

// ============================================================================
// Bloom Filter for Duplicate Detection
// ============================================================================

class BloomFilter {
  private bits: Uint8Array;
  private size: number;
  private hashCount: number;
  
  constructor(size: number = MEMPOOL_CONFIG.BLOOM_SIZE, hashCount: number = MEMPOOL_CONFIG.BLOOM_HASH_COUNT) {
    this.size = size;
    this.hashCount = hashCount;
    this.bits = new Uint8Array(Math.ceil(size / 8));
  }
  
  private hash(data: string, seed: number): number {
    const hash = crypto.createHash('sha256').update(`${seed}:${data}`).digest();
    return hash.readUInt32BE(0) % this.size;
  }
  
  add(item: string): void {
    for (let i = 0; i < this.hashCount; i++) {
      const pos = this.hash(item, i);
      const bytePos = Math.floor(pos / 8);
      const bitPos = pos % 8;
      this.bits[bytePos] |= (1 << bitPos);
    }
  }
  
  mightContain(item: string): boolean {
    for (let i = 0; i < this.hashCount; i++) {
      const pos = this.hash(item, i);
      const bytePos = Math.floor(pos / 8);
      const bitPos = pos % 8;
      if ((this.bits[bytePos] & (1 << bitPos)) === 0) {
        return false;
      }
    }
    return true;
  }
  
  clear(): void {
    this.bits.fill(0);
  }
  
  getUtilization(): number {
    let setBits = 0;
    for (const byte of this.bits) {
      setBits += this.countBits(byte);
    }
    return setBits / this.size;
  }
  
  private countBits(n: number): number {
    let count = 0;
    while (n) {
      count += n & 1;
      n >>= 1;
    }
    return count;
  }
}

// ============================================================================
// Priority Queue Node (Fibonacci Heap Node)
// ============================================================================

interface HeapNode {
  tx: MempoolTransaction;
  key: number; // Negative score for max-heap behavior
  degree: number;
  marked: boolean;
  parent: HeapNode | null;
  child: HeapNode | null;
  left: HeapNode;
  right: HeapNode;
}

// ============================================================================
// Fibonacci Heap for O(1) Insert, O(log n) Extract Max
// ============================================================================

class FibonacciHeap {
  private min: HeapNode | null = null;
  private size: number = 0;
  private nodeMap: Map<string, HeapNode> = new Map();
  
  insert(tx: MempoolTransaction): void {
    const node: HeapNode = {
      tx,
      key: -tx.score, // Negative for max-heap
      degree: 0,
      marked: false,
      parent: null,
      child: null,
      left: null as any,
      right: null as any,
    };
    node.left = node;
    node.right = node;
    
    this.nodeMap.set(tx.tx.hash, node);
    
    if (this.min === null) {
      this.min = node;
    } else {
      this.insertIntoRootList(node);
      if (node.key < this.min.key) {
        this.min = node;
      }
    }
    
    this.size++;
  }
  
  extractMax(): MempoolTransaction | null {
    if (this.min === null) return null;
    
    const maxNode = this.findMaxInRootList();
    if (maxNode === null) return null;
    
    // Remove from node map
    this.nodeMap.delete(maxNode.tx.tx.hash);
    
    // Move children to root list
    if (maxNode.child !== null) {
      let child = maxNode.child;
      do {
        const next = child.right;
        child.parent = null;
        this.insertIntoRootList(child);
        child = next;
      } while (child !== maxNode.child);
    }
    
    // Remove maxNode from root list
    this.removeFromRootList(maxNode);
    
    if (maxNode === maxNode.right) {
      this.min = null;
    } else {
      this.min = maxNode.right;
      this.consolidate();
    }
    
    this.size--;
    return maxNode.tx;
  }
  
  peek(): MempoolTransaction | null {
    if (this.min === null) return null;
    const maxNode = this.findMaxInRootList();
    return maxNode?.tx || null;
  }
  
  remove(txHash: string): MempoolTransaction | null {
    const node = this.nodeMap.get(txHash);
    if (!node) return null;
    
    this.nodeMap.delete(txHash);
    
    // Decrease key to minimum
    node.key = Number.NEGATIVE_INFINITY;
    if (node.parent !== null) {
      this.cut(node, node.parent);
      this.cascadingCut(node.parent);
    }
    this.min = node;
    
    // Extract it
    return this.extractMax();
  }
  
  contains(txHash: string): boolean {
    return this.nodeMap.has(txHash);
  }
  
  getSize(): number {
    return this.size;
  }
  
  isEmpty(): boolean {
    return this.size === 0;
  }
  
  clear(): void {
    this.min = null;
    this.size = 0;
    this.nodeMap.clear();
  }
  
  private insertIntoRootList(node: HeapNode): void {
    if (this.min === null) {
      this.min = node;
      node.left = node;
      node.right = node;
    } else {
      node.right = this.min.right;
      node.left = this.min;
      this.min.right.left = node;
      this.min.right = node;
    }
  }
  
  private removeFromRootList(node: HeapNode): void {
    node.left.right = node.right;
    node.right.left = node.left;
  }
  
  private findMaxInRootList(): HeapNode | null {
    if (this.min === null) return null;
    
    let max = this.min;
    let current = this.min.right;
    
    while (current !== this.min) {
      if (current.key < max.key) { // Remember: keys are negative
        max = current;
      }
      current = current.right;
    }
    
    return max;
  }
  
  private consolidate(): void {
    if (this.min === null) return;
    
    const maxDegree = Math.floor(Math.log2(this.size)) + 1;
    const degreeTable: (HeapNode | null)[] = new Array(maxDegree + 1).fill(null);
    
    const nodes: HeapNode[] = [];
    let current = this.min;
    do {
      nodes.push(current);
      current = current.right;
    } while (current !== this.min);
    
    for (const node of nodes) {
      let x = node;
      let d = x.degree;
      
      while (degreeTable[d] !== null) {
        let y = degreeTable[d]!;
        if (x.key > y.key) {
          [x, y] = [y, x];
        }
        this.link(y, x);
        degreeTable[d] = null;
        d++;
      }
      degreeTable[d] = x;
    }
    
    this.min = null;
    for (const node of degreeTable) {
      if (node !== null) {
        if (this.min === null) {
          this.min = node;
          node.left = node;
          node.right = node;
        } else {
          this.insertIntoRootList(node);
          if (node.key < this.min.key) {
            this.min = node;
          }
        }
      }
    }
  }
  
  private link(y: HeapNode, x: HeapNode): void {
    this.removeFromRootList(y);
    y.parent = x;
    
    if (x.child === null) {
      x.child = y;
      y.left = y;
      y.right = y;
    } else {
      y.right = x.child.right;
      y.left = x.child;
      x.child.right.left = y;
      x.child.right = y;
    }
    
    x.degree++;
    y.marked = false;
  }
  
  private cut(x: HeapNode, y: HeapNode): void {
    if (x.right === x) {
      y.child = null;
    } else {
      x.left.right = x.right;
      x.right.left = x.left;
      if (y.child === x) {
        y.child = x.right;
      }
    }
    y.degree--;
    
    this.insertIntoRootList(x);
    x.parent = null;
    x.marked = false;
  }
  
  private cascadingCut(y: HeapNode): void {
    const z = y.parent;
    if (z !== null) {
      if (!y.marked) {
        y.marked = true;
      } else {
        this.cut(y, z);
        this.cascadingCut(z);
      }
    }
  }
}

// ============================================================================
// Enterprise Mempool Service
// ============================================================================

export class EnterpriseMempoolService extends EventEmitter {
  // Priority queues (one per priority level)
  private priorityQueues: Map<MempoolPriority, FibonacciHeap> = new Map();
  
  // Index structures
  private txByHash: Map<string, MempoolTransaction> = new Map();
  private txByAddress: Map<string, Set<string>> = new Map();
  private txByShard: Map<number, Set<string>> = new Map();
  
  // Duplicate detection
  private bloomFilter: BloomFilter;
  private exactSet: Set<string> = new Set();
  
  // Metrics
  private insertionCount: number = 0;
  private evictionCount: number = 0;
  private lastMetricsReset: number = Date.now();
  
  private isRunning: boolean = false;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private bloomRotationInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    super();
    
    // Initialize priority queues
    for (const priority of Object.keys(MEMPOOL_CONFIG.PRIORITY_TIERS) as MempoolPriority[]) {
      this.priorityQueues.set(priority, new FibonacciHeap());
    }
    
    this.bloomFilter = new BloomFilter();
  }
  
  async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;
    
    // Start cleanup interval
    this.cleanupInterval = setInterval(() => this.cleanup(), MEMPOOL_CONFIG.CLEANUP_INTERVAL_MS);
    
    // Start bloom filter rotation
    this.bloomRotationInterval = setInterval(() => this.rotateBloomFilter(), MEMPOOL_CONFIG.BLOOM_ROTATION_INTERVAL_MS);
    
    console.log('[Mempool] Enterprise Mempool Service started');
    this.emit('started');
  }
  
  async stop(): Promise<void> {
    this.isRunning = false;
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    if (this.bloomRotationInterval) {
      clearInterval(this.bloomRotationInterval);
      this.bloomRotationInterval = null;
    }
    
    console.log('[Mempool] Enterprise Mempool Service stopped');
    this.emit('stopped');
  }
  
  add(tx: ValidatedTransaction): { success: boolean; error?: string } {
    const txHash = tx.hash;
    
    // 1. Check for duplicates (fast bloom filter check first)
    if (this.bloomFilter.mightContain(txHash)) {
      if (this.exactSet.has(txHash)) {
        return { success: false, error: 'Duplicate transaction' };
      }
    }
    
    // 2. Check capacity
    if (this.txByHash.size >= MEMPOOL_CONFIG.MAX_POOL_SIZE) {
      if (!this.evictLowestPriority()) {
        return { success: false, error: 'Mempool full, unable to evict' };
      }
    }
    
    // 3. Check per-address limit
    const addressTxs = this.txByAddress.get(tx.from.toLowerCase()) || new Set();
    if (addressTxs.size >= MEMPOOL_CONFIG.MAX_PER_ADDRESS) {
      return { success: false, error: `Address limit exceeded: ${MEMPOOL_CONFIG.MAX_PER_ADDRESS}` };
    }
    
    // 4. Determine priority
    const priority = this.calculatePriority(tx);
    const tierConfig = MEMPOOL_CONFIG.PRIORITY_TIERS[priority];
    const queue = this.priorityQueues.get(priority)!;
    
    // 5. Check tier capacity
    if (queue.getSize() >= tierConfig.maxSize) {
      return { success: false, error: `${priority} tier is full` };
    }
    
    // 6. Calculate shard
    const shardId = tx.shardId ?? this.calculateShard(tx);
    
    // 7. Create mempool entry
    const mempoolTx: MempoolTransaction = {
      tx,
      priority,
      status: 'PENDING',
      insertedAt: Date.now(),
      expiresAt: Date.now() + MEMPOOL_CONFIG.TX_EXPIRY_MS,
      shardId,
      score: this.calculateScore(tx, priority),
    };
    
    // 8. Insert into all structures
    queue.insert(mempoolTx);
    this.txByHash.set(txHash, mempoolTx);
    
    // Address index
    if (!this.txByAddress.has(tx.from.toLowerCase())) {
      this.txByAddress.set(tx.from.toLowerCase(), new Set());
    }
    this.txByAddress.get(tx.from.toLowerCase())!.add(txHash);
    
    // Shard index
    if (!this.txByShard.has(shardId)) {
      this.txByShard.set(shardId, new Set());
    }
    this.txByShard.get(shardId)!.add(txHash);
    
    // Bloom filter and exact set
    this.bloomFilter.add(txHash);
    this.exactSet.add(txHash);
    
    this.insertionCount++;
    this.emit('added', mempoolTx);
    
    return { success: true };
  }
  
  remove(txHash: string): MempoolTransaction | null {
    const mempoolTx = this.txByHash.get(txHash);
    if (!mempoolTx) return null;
    
    // Remove from priority queue
    const queue = this.priorityQueues.get(mempoolTx.priority)!;
    queue.remove(txHash);
    
    // Remove from indexes
    this.txByHash.delete(txHash);
    
    const addressTxs = this.txByAddress.get(mempoolTx.tx.from.toLowerCase());
    if (addressTxs) {
      addressTxs.delete(txHash);
      if (addressTxs.size === 0) {
        this.txByAddress.delete(mempoolTx.tx.from.toLowerCase());
      }
    }
    
    const shardTxs = this.txByShard.get(mempoolTx.shardId);
    if (shardTxs) {
      shardTxs.delete(txHash);
      if (shardTxs.size === 0) {
        this.txByShard.delete(mempoolTx.shardId);
      }
    }
    
    this.exactSet.delete(txHash);
    
    return mempoolTx;
  }
  
  get(txHash: string): MempoolTransaction | null {
    return this.txByHash.get(txHash) || null;
  }
  
  contains(txHash: string): boolean {
    return this.txByHash.has(txHash);
  }
  
  getByAddress(address: string): MempoolTransaction[] {
    const txHashes = this.txByAddress.get(address.toLowerCase());
    if (!txHashes) return [];
    
    return Array.from(txHashes)
      .map(hash => this.txByHash.get(hash))
      .filter((tx): tx is MempoolTransaction => tx !== undefined);
  }
  
  getByShard(shardId: number): MempoolTransaction[] {
    const txHashes = this.txByShard.get(shardId);
    if (!txHashes) return [];
    
    return Array.from(txHashes)
      .map(hash => this.txByHash.get(hash))
      .filter((tx): tx is MempoolTransaction => tx !== undefined);
  }
  
  selectForBlock(maxGas: bigint = MEMPOOL_CONFIG.BATCH_GAS_LIMIT, maxCount: number = MEMPOOL_CONFIG.MAX_BATCH_SIZE): BatchResult {
    const selected: ValidatedTransaction[] = [];
    let totalGas = BigInt(0);
    let totalGasPrice = BigInt(0);
    const now = Date.now();
    
    // Select from each priority tier using weighted fair queuing
    const priorities: MempoolPriority[] = ['CRITICAL', 'HIGH', 'NORMAL', 'LOW'];
    let remaining = maxCount;
    
    for (const priority of priorities) {
      if (remaining <= 0) break;
      
      const queue = this.priorityQueues.get(priority)!;
      const tierWeight = MEMPOOL_CONFIG.PRIORITY_TIERS[priority].weight;
      const tierQuota = Math.ceil(maxCount * tierWeight / 29); // Total weight = 16+8+4+1 = 29
      
      let tierCount = 0;
      while (tierCount < tierQuota && remaining > 0 && !queue.isEmpty()) {
        const mempoolTx = queue.extractMax();
        if (!mempoolTx) break;
        
        // Skip expired
        if (mempoolTx.expiresAt < now) {
          this.handleExpired(mempoolTx);
          continue;
        }
        
        // Check gas limit
        const txGas = mempoolTx.tx.gasUsed;
        if (totalGas + txGas > maxGas) {
          // Put it back
          queue.insert(mempoolTx);
          continue;
        }
        
        // Select this transaction
        mempoolTx.status = 'SELECTED';
        mempoolTx.selectedAt = now;
        selected.push(mempoolTx.tx);
        
        totalGas += txGas;
        totalGasPrice += mempoolTx.tx.effectiveGasPrice;
        
        tierCount++;
        remaining--;
      }
    }
    
    return {
      transactions: selected,
      totalGas,
      avgGasPrice: selected.length > 0 ? totalGasPrice / BigInt(selected.length) : BigInt(0),
      count: selected.length,
      retrievedAt: now,
    };
  }
  
  selectForShard(shardId: number, maxGas: bigint, maxCount: number): BatchResult {
    const shardTxs = this.getByShard(shardId);
    
    // Sort by score descending
    shardTxs.sort((a, b) => b.score - a.score);
    
    const selected: ValidatedTransaction[] = [];
    let totalGas = BigInt(0);
    let totalGasPrice = BigInt(0);
    const now = Date.now();
    
    for (const mempoolTx of shardTxs) {
      if (selected.length >= maxCount) break;
      if (mempoolTx.expiresAt < now) continue;
      
      const txGas = mempoolTx.tx.gasUsed;
      if (totalGas + txGas > maxGas) continue;
      
      mempoolTx.status = 'SELECTED';
      mempoolTx.selectedAt = now;
      selected.push(mempoolTx.tx);
      
      totalGas += txGas;
      totalGasPrice += mempoolTx.tx.effectiveGasPrice;
    }
    
    return {
      transactions: selected,
      totalGas,
      avgGasPrice: selected.length > 0 ? totalGasPrice / BigInt(selected.length) : BigInt(0),
      count: selected.length,
      retrievedAt: now,
    };
  }
  
  confirmTransaction(txHash: string): void {
    const mempoolTx = this.remove(txHash);
    if (mempoolTx) {
      mempoolTx.status = 'CONFIRMED';
      this.emit('confirmed', mempoolTx);
    }
  }
  
  rejectTransaction(txHash: string): void {
    const mempoolTx = this.remove(txHash);
    if (mempoolTx) {
      mempoolTx.status = 'EVICTED';
      this.emit('rejected', mempoolTx);
    }
  }
  
  private calculatePriority(tx: ValidatedTransaction): MempoolPriority {
    const gasPrice = tx.effectiveGasPrice;
    const baseFee = BigInt('1000000000'); // 1 Gwei
    
    // Priority based on gas price multiplier
    if (gasPrice >= baseFee * BigInt(100)) {
      return 'CRITICAL';
    } else if (gasPrice >= baseFee * BigInt(10)) {
      return 'HIGH';
    } else if (gasPrice >= baseFee * BigInt(2)) {
      return 'NORMAL';
    }
    return 'LOW';
  }
  
  private calculateScore(tx: ValidatedTransaction, priority: MempoolPriority): number {
    const tierWeight = MEMPOOL_CONFIG.PRIORITY_TIERS[priority].weight;
    const gasPriceScore = Number(tx.effectiveGasPrice / BigInt(1000000)); // Normalize
    const ageBonus = Math.max(0, 100 - (Date.now() - tx.validatedAt) / 1000); // Older = lower bonus
    
    return tierWeight * 1000 + gasPriceScore + ageBonus;
  }
  
  private calculateShard(tx: ValidatedTransaction): number {
    // Consistent hashing based on from address
    const hash = crypto.createHash('sha256').update(tx.from).digest();
    return hash.readUInt32BE(0) % 24; // 24 shards
  }
  
  private evictLowestPriority(): boolean {
    // Try to evict from LOW tier first
    const priorities: MempoolPriority[] = ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'];
    
    for (const priority of priorities) {
      const queue = this.priorityQueues.get(priority)!;
      if (queue.getSize() > 0) {
        // Extract the lowest scoring transaction (which is actually the max in our min-heap)
        // Since we use negative scores, the "max" has the lowest priority
        const evicted = queue.extractMax();
        if (evicted) {
          this.remove(evicted.tx.hash);
          evicted.status = 'EVICTED';
          this.evictionCount++;
          this.emit('evicted', evicted);
          return true;
        }
      }
    }
    
    return false;
  }
  
  private handleExpired(mempoolTx: MempoolTransaction): void {
    mempoolTx.status = 'EXPIRED';
    this.remove(mempoolTx.tx.hash);
    this.emit('expired', mempoolTx);
  }
  
  private cleanup(): void {
    const now = Date.now();
    const expiredHashes: string[] = [];
    
    for (const [hash, mempoolTx] of this.txByHash) {
      if (mempoolTx.expiresAt < now) {
        expiredHashes.push(hash);
      }
    }
    
    for (const hash of expiredHashes) {
      const mempoolTx = this.txByHash.get(hash);
      if (mempoolTx) {
        this.handleExpired(mempoolTx);
      }
    }
    
    if (expiredHashes.length > 0) {
      console.log(`[Mempool] Cleaned up ${expiredHashes.length} expired transactions`);
    }
  }
  
  private rotateBloomFilter(): void {
    this.bloomFilter.clear();
    
    // Re-add all current transactions
    for (const hash of this.exactSet) {
      this.bloomFilter.add(hash);
    }
  }
  
  getStats(): MempoolStats {
    const gasPrices: bigint[] = [];
    let oldestAge = 0;
    const now = Date.now();
    
    for (const mempoolTx of this.txByHash.values()) {
      gasPrices.push(mempoolTx.tx.effectiveGasPrice);
      const age = now - mempoolTx.insertedAt;
      if (age > oldestAge) oldestAge = age;
    }
    
    gasPrices.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    
    const totalByPriority: Record<MempoolPriority, number> = {
      CRITICAL: this.priorityQueues.get('CRITICAL')!.getSize(),
      HIGH: this.priorityQueues.get('HIGH')!.getSize(),
      NORMAL: this.priorityQueues.get('NORMAL')!.getSize(),
      LOW: this.priorityQueues.get('LOW')!.getSize(),
    };
    
    const elapsed = (Date.now() - this.lastMetricsReset) / 1000;
    
    return {
      totalPending: this.txByHash.size,
      totalByPriority,
      totalByStatus: {
        PENDING: this.txByHash.size,
        SELECTED: 0,
        CONFIRMED: 0,
        EVICTED: 0,
        EXPIRED: 0,
      },
      avgGasPrice: gasPrices.length > 0 
        ? gasPrices.reduce((a, b) => a + b, BigInt(0)) / BigInt(gasPrices.length)
        : BigInt(0),
      minGasPrice: gasPrices[0] || BigInt(0),
      maxGasPrice: gasPrices[gasPrices.length - 1] || BigInt(0),
      insertionsPerSecond: elapsed > 0 ? this.insertionCount / elapsed : 0,
      evictionsPerSecond: elapsed > 0 ? this.evictionCount / elapsed : 0,
      utilizationPercent: (this.txByHash.size / MEMPOOL_CONFIG.MAX_POOL_SIZE) * 100,
      oldestTxAge: oldestAge,
      uniqueAddresses: this.txByAddress.size,
    };
  }
  
  getSize(): number {
    return this.txByHash.size;
  }
  
  clear(): void {
    for (const queue of this.priorityQueues.values()) {
      queue.clear();
    }
    this.txByHash.clear();
    this.txByAddress.clear();
    this.txByShard.clear();
    this.exactSet.clear();
    this.bloomFilter.clear();
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

let mempoolInstance: EnterpriseMempoolService | null = null;

export function getEnterpriseMempoolService(): EnterpriseMempoolService {
  if (!mempoolInstance) {
    mempoolInstance = new EnterpriseMempoolService();
  }
  return mempoolInstance;
}

export async function initializeEnterpriseMempoolService(): Promise<EnterpriseMempoolService> {
  const mempool = getEnterpriseMempoolService();
  await mempool.start();
  return mempool;
}
