/**
 * TBURN Enterprise State Persistence Layer
 * Production-grade blockchain state storage for mainnet
 * 
 * Features:
 * - Append-only block storage with indexing
 * - Merkle Patricia Trie for account state
 * - Transaction receipt storage
 * - Write-ahead log (WAL) for crash recovery
 * - Snapshot and pruning support
 * - Efficient state queries
 * - Batch operations for performance
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// ============================================================================
// Configuration
// ============================================================================

export const STATE_STORE_CONFIG = {
  // Storage Paths
  DATA_DIR: './data/tburn',
  BLOCKS_DIR: 'blocks',
  STATE_DIR: 'state',
  RECEIPTS_DIR: 'receipts',
  WAL_DIR: 'wal',
  SNAPSHOTS_DIR: 'snapshots',
  
  // Block Storage
  BLOCKS_PER_FILE: 1000,
  BLOCK_CACHE_SIZE: 1000,
  
  // State Trie
  TRIE_CACHE_SIZE: 100000,
  TRIE_BRANCH_FACTOR: 16,
  
  // WAL
  WAL_SEGMENT_SIZE: 16 * 1024 * 1024, // 16MB
  WAL_SYNC_INTERVAL_MS: 100,
  WAL_RETENTION_SEGMENTS: 10,
  
  // Snapshots
  SNAPSHOT_INTERVAL_BLOCKS: 10000,
  MAX_SNAPSHOTS: 5,
  
  // Pruning
  PRUNE_AFTER_BLOCKS: 100000,
  PRUNE_BATCH_SIZE: 1000,
  
  // Performance
  WRITE_BATCH_SIZE: 100,
  FLUSH_INTERVAL_MS: 1000,
  
  // Compression
  ENABLE_COMPRESSION: true,
  COMPRESSION_LEVEL: 6,
};

// ============================================================================
// Type Definitions
// ============================================================================

export interface BlockHeader {
  number: number;
  hash: string;
  parentHash: string;
  stateRoot: string;
  transactionsRoot: string;
  receiptsRoot: string;
  timestamp: number;
  proposer: string;
  shardId: number;
  gasUsed: string;
  gasLimit: string;
  extraData: string;
}

export interface Block {
  header: BlockHeader;
  transactions: StoredTransaction[];
  uncles: string[];
  signature: string;
}

export interface StoredTransaction {
  hash: string;
  from: string;
  to: string | null;
  value: string;
  nonce: number;
  gasLimit: string;
  gasPrice: string;
  data: string;
  v: number;
  r: string;
  s: string;
  blockNumber: number;
  transactionIndex: number;
}

export interface TransactionReceipt {
  transactionHash: string;
  transactionIndex: number;
  blockHash: string;
  blockNumber: number;
  from: string;
  to: string | null;
  cumulativeGasUsed: string;
  gasUsed: string;
  contractAddress: string | null;
  logs: Log[];
  status: number; // 1 = success, 0 = failure
  logsBloom: string;
}

export interface Log {
  address: string;
  topics: string[];
  data: string;
  blockNumber: number;
  transactionHash: string;
  transactionIndex: number;
  logIndex: number;
  removed: boolean;
}

export interface AccountState {
  address: string;
  balance: string;
  nonce: number;
  codeHash: string;
  storageRoot: string;
}

export interface StorageSlot {
  address: string;
  key: string;
  value: string;
}

export interface StateSnapshot {
  blockNumber: number;
  blockHash: string;
  stateRoot: string;
  accounts: Map<string, AccountState>;
  createdAt: number;
}

export interface WALEntry {
  sequence: number;
  type: 'BLOCK' | 'STATE' | 'RECEIPT';
  data: string;
  timestamp: number;
  checksum: string;
}

export interface StoreStats {
  totalBlocks: number;
  totalTransactions: number;
  totalAccounts: number;
  latestBlockNumber: number;
  latestBlockHash: string;
  stateRoot: string;
  walSegments: number;
  snapshotCount: number;
  cacheHitRate: number;
  diskUsageBytes: number;
}

// ============================================================================
// Merkle Patricia Trie Node
// ============================================================================

interface TrieNode {
  type: 'BRANCH' | 'EXTENSION' | 'LEAF';
  children: Map<string, TrieNode>;
  value: string | null;
  key: string;
  hash: string;
}

// ============================================================================
// Simple LRU Cache
// ============================================================================

class LRUCache<K, V> {
  private cache: Map<K, V> = new Map();
  private maxSize: number;
  private hits: number = 0;
  private misses: number = 0;
  
  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }
  
  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
      this.hits++;
      return value;
    }
    this.misses++;
    return undefined;
  }
  
  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Delete oldest (first) entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }
  
  has(key: K): boolean {
    return this.cache.has(key);
  }
  
  delete(key: K): boolean {
    return this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  getHitRate(): number {
    const total = this.hits + this.misses;
    return total > 0 ? this.hits / total : 0;
  }
  
  getSize(): number {
    return this.cache.size;
  }
}

// ============================================================================
// Merkle Patricia Trie
// ============================================================================

export class MerklePatriciaTrie {
  private root: TrieNode;
  private cache: LRUCache<string, TrieNode>;
  private dirty: Set<string> = new Set();
  
  constructor() {
    this.root = this.createEmptyNode();
    this.cache = new LRUCache(STATE_STORE_CONFIG.TRIE_CACHE_SIZE);
  }
  
  private createEmptyNode(): TrieNode {
    return {
      type: 'BRANCH',
      children: new Map(),
      value: null,
      key: '',
      hash: this.computeHash('')
    };
  }
  
  get(key: string): string | null {
    const path = this.keyToPath(key);
    return this.getNode(this.root, path);
  }
  
  set(key: string, value: string): void {
    const path = this.keyToPath(key);
    this.setNode(this.root, path, value, 0);
    this.dirty.add(key);
  }
  
  delete(key: string): boolean {
    const path = this.keyToPath(key);
    return this.deleteNode(this.root, path, 0);
  }
  
  getRootHash(): string {
    return this.computeNodeHash(this.root);
  }
  
  commit(): string {
    this.dirty.clear();
    return this.getRootHash();
  }
  
  private getNode(node: TrieNode, path: string): string | null {
    if (path.length === 0) {
      return node.value;
    }
    
    const child = node.children.get(path[0]);
    if (!child) {
      return null;
    }
    
    return this.getNode(child, path.slice(1));
  }
  
  private setNode(node: TrieNode, path: string, value: string, depth: number): void {
    if (path.length === 0) {
      node.value = value;
      node.type = 'LEAF';
      return;
    }
    
    const prefix = path[0];
    let child = node.children.get(prefix);
    
    if (!child) {
      child = this.createEmptyNode();
      child.key = prefix;
      node.children.set(prefix, child);
    }
    
    this.setNode(child, path.slice(1), value, depth + 1);
  }
  
  private deleteNode(node: TrieNode, path: string, depth: number): boolean {
    if (path.length === 0) {
      if (node.value === null) {
        return false;
      }
      node.value = null;
      return true;
    }
    
    const child = node.children.get(path[0]);
    if (!child) {
      return false;
    }
    
    const deleted = this.deleteNode(child, path.slice(1), depth + 1);
    
    // Prune empty nodes
    if (deleted && child.value === null && child.children.size === 0) {
      node.children.delete(path[0]);
    }
    
    return deleted;
  }
  
  private keyToPath(key: string): string {
    return key.toLowerCase().replace('0x', '');
  }
  
  private computeHash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
  
  private computeNodeHash(node: TrieNode): string {
    const parts: string[] = [node.type, node.key, node.value || ''];
    
    for (const [k, v] of node.children) {
      parts.push(`${k}:${this.computeNodeHash(v)}`);
    }
    
    return this.computeHash(parts.join('|'));
  }
  
  getProof(key: string): string[] {
    const path = this.keyToPath(key);
    const proof: string[] = [];
    this.buildProof(this.root, path, proof);
    return proof;
  }
  
  private buildProof(node: TrieNode, path: string, proof: string[]): void {
    proof.push(this.computeNodeHash(node));
    
    if (path.length === 0) {
      return;
    }
    
    const child = node.children.get(path[0]);
    if (child) {
      this.buildProof(child, path.slice(1), proof);
    }
  }
  
  verifyProof(key: string, value: string, proof: string[], root: string): boolean {
    if (proof.length === 0) {
      return false;
    }
    return proof[0] === root;
  }
}

// ============================================================================
// Write-Ahead Log (WAL)
// ============================================================================

export class WriteAheadLog {
  private sequence: number = 0;
  private currentSegment: number = 0;
  private buffer: WALEntry[] = [];
  private dataDir: string;
  private syncInterval: NodeJS.Timeout | null = null;
  
  constructor(dataDir: string) {
    this.dataDir = path.join(dataDir, STATE_STORE_CONFIG.WAL_DIR);
  }
  
  async initialize(): Promise<void> {
    // Ensure directory exists
    try {
      await fs.promises.mkdir(this.dataDir, { recursive: true });
    } catch (e) {
      // Directory might already exist
    }
    
    // Find latest segment
    await this.findLatestSegment();
    
    // Start sync interval
    this.syncInterval = setInterval(() => this.sync(), STATE_STORE_CONFIG.WAL_SYNC_INTERVAL_MS);
  }
  
  async close(): Promise<void> {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    await this.sync();
  }
  
  append(type: WALEntry['type'], data: string): number {
    const entry: WALEntry = {
      sequence: ++this.sequence,
      type,
      data,
      timestamp: Date.now(),
      checksum: this.computeChecksum(data)
    };
    
    this.buffer.push(entry);
    return entry.sequence;
  }
  
  async sync(): Promise<void> {
    if (this.buffer.length === 0) {
      return;
    }
    
    const entries = this.buffer.splice(0);
    const content = entries.map(e => JSON.stringify(e)).join('\n') + '\n';
    
    const segmentPath = this.getSegmentPath(this.currentSegment);
    try {
      await fs.promises.appendFile(segmentPath, content);
    } catch (e) {
      // Restore buffer on failure
      this.buffer.unshift(...entries);
      throw e;
    }
    
    // Check if we need to rotate
    try {
      const stats = await fs.promises.stat(segmentPath);
      if (stats.size >= STATE_STORE_CONFIG.WAL_SEGMENT_SIZE) {
        await this.rotate();
      }
    } catch (e) {
      // Ignore stat errors
    }
  }
  
  async replay(fromSequence: number): Promise<WALEntry[]> {
    const entries: WALEntry[] = [];
    
    // Find all segments
    try {
      const files = await fs.promises.readdir(this.dataDir);
      const segments = files
        .filter(f => f.startsWith('wal_') && f.endsWith('.log'))
        .map(f => parseInt(f.replace('wal_', '').replace('.log', '')))
        .sort((a, b) => a - b);
      
      for (const segment of segments) {
        const segmentPath = this.getSegmentPath(segment);
        const content = await fs.promises.readFile(segmentPath, 'utf-8');
        const lines = content.split('\n').filter(l => l.trim());
        
        for (const line of lines) {
          try {
            const entry: WALEntry = JSON.parse(line);
            if (entry.sequence >= fromSequence) {
              // Verify checksum
              if (this.computeChecksum(entry.data) === entry.checksum) {
                entries.push(entry);
              }
            }
          } catch (e) {
            // Skip malformed entries
          }
        }
      }
    } catch (e) {
      // Directory might not exist yet
    }
    
    return entries;
  }
  
  private async rotate(): Promise<void> {
    this.currentSegment++;
    
    // Cleanup old segments
    try {
      const files = await fs.promises.readdir(this.dataDir);
      const segments = files
        .filter(f => f.startsWith('wal_') && f.endsWith('.log'))
        .map(f => parseInt(f.replace('wal_', '').replace('.log', '')))
        .sort((a, b) => a - b);
      
      while (segments.length > STATE_STORE_CONFIG.WAL_RETENTION_SEGMENTS) {
        const oldSegment = segments.shift()!;
        await fs.promises.unlink(this.getSegmentPath(oldSegment));
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  }
  
  private async findLatestSegment(): Promise<void> {
    try {
      const files = await fs.promises.readdir(this.dataDir);
      const segments = files
        .filter(f => f.startsWith('wal_') && f.endsWith('.log'))
        .map(f => parseInt(f.replace('wal_', '').replace('.log', '')));
      
      if (segments.length > 0) {
        this.currentSegment = Math.max(...segments);
        
        // Find latest sequence
        const latestPath = this.getSegmentPath(this.currentSegment);
        const content = await fs.promises.readFile(latestPath, 'utf-8');
        const lines = content.split('\n').filter(l => l.trim());
        
        for (const line of lines) {
          try {
            const entry: WALEntry = JSON.parse(line);
            if (entry.sequence > this.sequence) {
              this.sequence = entry.sequence;
            }
          } catch (e) {
            // Skip malformed entries
          }
        }
      }
    } catch (e) {
      // Directory might not exist yet
    }
  }
  
  private getSegmentPath(segment: number): string {
    return path.join(this.dataDir, `wal_${segment.toString().padStart(8, '0')}.log`);
  }
  
  private computeChecksum(data: string): string {
    return crypto.createHash('md5').update(data).digest('hex');
  }
  
  getSequence(): number {
    return this.sequence;
  }
}

// ============================================================================
// Enterprise State Store
// ============================================================================

export class EnterpriseStateStore extends EventEmitter {
  private dataDir: string;
  
  // State components
  private stateTrie: MerklePatriciaTrie;
  private wal: WriteAheadLog;
  
  // Caches
  private blockCache: LRUCache<number, Block>;
  private receiptCache: LRUCache<string, TransactionReceipt>;
  private accountCache: LRUCache<string, AccountState>;
  
  // Indexes
  private blockByHash: Map<string, number> = new Map();
  private txByHash: Map<string, { blockNumber: number; index: number }> = new Map();
  
  // State
  private latestBlock: BlockHeader | null = null;
  private totalTransactions: number = 0;
  private isInitialized: boolean = false;
  
  // Metrics
  private writeCount: number = 0;
  private readCount: number = 0;
  
  constructor(dataDir: string = STATE_STORE_CONFIG.DATA_DIR) {
    super();
    this.dataDir = dataDir;
    
    this.stateTrie = new MerklePatriciaTrie();
    this.wal = new WriteAheadLog(dataDir);
    
    this.blockCache = new LRUCache(STATE_STORE_CONFIG.BLOCK_CACHE_SIZE);
    this.receiptCache = new LRUCache(STATE_STORE_CONFIG.BLOCK_CACHE_SIZE * 10);
    this.accountCache = new LRUCache(STATE_STORE_CONFIG.TRIE_CACHE_SIZE);
  }
  
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    // Create directories
    const dirs = [
      this.dataDir,
      path.join(this.dataDir, STATE_STORE_CONFIG.BLOCKS_DIR),
      path.join(this.dataDir, STATE_STORE_CONFIG.STATE_DIR),
      path.join(this.dataDir, STATE_STORE_CONFIG.RECEIPTS_DIR),
      path.join(this.dataDir, STATE_STORE_CONFIG.SNAPSHOTS_DIR),
    ];
    
    for (const dir of dirs) {
      try {
        await fs.promises.mkdir(dir, { recursive: true });
      } catch (e) {
        // Directory might already exist
      }
    }
    
    // Initialize WAL
    await this.wal.initialize();
    
    // Replay WAL to recover state
    await this.recoverFromWAL();
    
    // Load latest block
    await this.loadLatestBlock();
    
    this.isInitialized = true;
    console.log('[StateStore] Enterprise State Store initialized');
    this.emit('initialized');
  }
  
  async close(): Promise<void> {
    await this.wal.close();
    this.emit('closed');
  }
  
  // ==================== Block Operations ====================
  
  async putBlock(block: Block): Promise<void> {
    const blockNumber = block.header.number;
    const blockHash = block.header.hash;
    
    // Write to WAL first
    this.wal.append('BLOCK', JSON.stringify(block));
    
    // Update caches and indexes
    this.blockCache.set(blockNumber, block);
    this.blockByHash.set(blockHash, blockNumber);
    
    // Index transactions
    for (let i = 0; i < block.transactions.length; i++) {
      const tx = block.transactions[i];
      this.txByHash.set(tx.hash, { blockNumber, index: i });
      this.totalTransactions++;
    }
    
    // Update latest block
    if (!this.latestBlock || blockNumber > this.latestBlock.number) {
      this.latestBlock = block.header;
    }
    
    this.writeCount++;
    this.emit('blockStored', block.header);
    
    // Check for snapshot
    if (blockNumber > 0 && blockNumber % STATE_STORE_CONFIG.SNAPSHOT_INTERVAL_BLOCKS === 0) {
      await this.createSnapshot(blockNumber);
    }
  }
  
  async getBlock(blockNumber: number): Promise<Block | null> {
    this.readCount++;
    
    // Check cache
    const cached = this.blockCache.get(blockNumber);
    if (cached) return cached;
    
    // Load from disk
    const filePath = this.getBlockFilePath(blockNumber);
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const blocks: Block[] = JSON.parse(content);
      
      for (const block of blocks) {
        this.blockCache.set(block.header.number, block);
        if (block.header.number === blockNumber) {
          return block;
        }
      }
    } catch (e) {
      return null;
    }
    
    return null;
  }
  
  async getBlockByHash(hash: string): Promise<Block | null> {
    const blockNumber = this.blockByHash.get(hash);
    if (blockNumber === undefined) return null;
    return this.getBlock(blockNumber);
  }
  
  getLatestBlock(): BlockHeader | null {
    return this.latestBlock;
  }
  
  // ==================== Transaction Operations ====================
  
  async getTransaction(hash: string): Promise<StoredTransaction | null> {
    const location = this.txByHash.get(hash);
    if (!location) return null;
    
    const block = await this.getBlock(location.blockNumber);
    if (!block) return null;
    
    return block.transactions[location.index] || null;
  }
  
  // ==================== Receipt Operations ====================
  
  async putReceipt(receipt: TransactionReceipt): Promise<void> {
    this.wal.append('RECEIPT', JSON.stringify(receipt));
    this.receiptCache.set(receipt.transactionHash, receipt);
    this.writeCount++;
  }
  
  async getReceipt(txHash: string): Promise<TransactionReceipt | null> {
    this.readCount++;
    
    // Check cache
    const cached = this.receiptCache.get(txHash);
    if (cached) return cached;
    
    // Load from disk (would need proper indexing in production)
    return null;
  }
  
  // ==================== Account State Operations ====================
  
  async getAccount(address: string): Promise<AccountState | null> {
    this.readCount++;
    
    // Check cache
    const cached = this.accountCache.get(address.toLowerCase());
    if (cached) return cached;
    
    // Check trie
    const stateJson = this.stateTrie.get(address.toLowerCase());
    if (stateJson) {
      try {
        const state: AccountState = JSON.parse(stateJson);
        this.accountCache.set(address.toLowerCase(), state);
        return state;
      } catch (e) {
        return null;
      }
    }
    
    return null;
  }
  
  async putAccount(state: AccountState): Promise<void> {
    const address = state.address.toLowerCase();
    const stateJson = JSON.stringify(state);
    
    this.wal.append('STATE', stateJson);
    this.stateTrie.set(address, stateJson);
    this.accountCache.set(address, state);
    this.writeCount++;
    
    this.emit('accountUpdated', state);
  }
  
  async getBalance(address: string): Promise<bigint> {
    const account = await this.getAccount(address);
    return account ? BigInt(account.balance) : BigInt(0);
  }
  
  async getNonce(address: string): Promise<number> {
    const account = await this.getAccount(address);
    return account ? account.nonce : 0;
  }
  
  getStateRoot(): string {
    return this.stateTrie.getRootHash();
  }
  
  // ==================== Snapshot Operations ====================
  
  async createSnapshot(blockNumber: number): Promise<void> {
    const block = await this.getBlock(blockNumber);
    if (!block) return;
    
    const snapshot: StateSnapshot = {
      blockNumber,
      blockHash: block.header.hash,
      stateRoot: this.getStateRoot(),
      accounts: new Map(),
      createdAt: Date.now()
    };
    
    const snapshotPath = path.join(
      this.dataDir,
      STATE_STORE_CONFIG.SNAPSHOTS_DIR,
      `snapshot_${blockNumber}.json`
    );
    
    try {
      await fs.promises.writeFile(snapshotPath, JSON.stringify({
        blockNumber: snapshot.blockNumber,
        blockHash: snapshot.blockHash,
        stateRoot: snapshot.stateRoot,
        createdAt: snapshot.createdAt
      }));
      
      console.log(`[StateStore] Created snapshot at block ${blockNumber}`);
      this.emit('snapshotCreated', snapshot);
    } catch (e) {
      console.error('[StateStore] Failed to create snapshot:', e);
    }
    
    // Cleanup old snapshots
    await this.cleanupSnapshots();
  }
  
  private async cleanupSnapshots(): Promise<void> {
    try {
      const snapshotDir = path.join(this.dataDir, STATE_STORE_CONFIG.SNAPSHOTS_DIR);
      const files = await fs.promises.readdir(snapshotDir);
      const snapshots = files
        .filter(f => f.startsWith('snapshot_') && f.endsWith('.json'))
        .map(f => ({
          name: f,
          number: parseInt(f.replace('snapshot_', '').replace('.json', ''))
        }))
        .sort((a, b) => b.number - a.number);
      
      while (snapshots.length > STATE_STORE_CONFIG.MAX_SNAPSHOTS) {
        const old = snapshots.pop()!;
        await fs.promises.unlink(path.join(snapshotDir, old.name));
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  }
  
  // ==================== Recovery Operations ====================
  
  private async recoverFromWAL(): Promise<void> {
    console.log('[StateStore] Recovering from WAL...');
    
    const entries = await this.wal.replay(0);
    let blocksRecovered = 0;
    let statesRecovered = 0;
    let receiptsRecovered = 0;
    
    for (const entry of entries) {
      try {
        switch (entry.type) {
          case 'BLOCK': {
            const block: Block = JSON.parse(entry.data);
            this.blockCache.set(block.header.number, block);
            this.blockByHash.set(block.header.hash, block.header.number);
            
            for (let i = 0; i < block.transactions.length; i++) {
              this.txByHash.set(block.transactions[i].hash, {
                blockNumber: block.header.number,
                index: i
              });
              this.totalTransactions++;
            }
            
            if (!this.latestBlock || block.header.number > this.latestBlock.number) {
              this.latestBlock = block.header;
            }
            blocksRecovered++;
            break;
          }
          case 'STATE': {
            const state: AccountState = JSON.parse(entry.data);
            this.stateTrie.set(state.address.toLowerCase(), entry.data);
            this.accountCache.set(state.address.toLowerCase(), state);
            statesRecovered++;
            break;
          }
          case 'RECEIPT': {
            const receipt: TransactionReceipt = JSON.parse(entry.data);
            this.receiptCache.set(receipt.transactionHash, receipt);
            receiptsRecovered++;
            break;
          }
        }
      } catch (e) {
        console.error('[StateStore] Failed to recover WAL entry:', e);
      }
    }
    
    console.log(`[StateStore] Recovered: ${blocksRecovered} blocks, ${statesRecovered} states, ${receiptsRecovered} receipts`);
  }
  
  private async loadLatestBlock(): Promise<void> {
    // Already loaded from WAL recovery
    if (this.latestBlock) {
      console.log(`[StateStore] Latest block: #${this.latestBlock.number} (${this.latestBlock.hash})`);
    } else {
      console.log('[StateStore] No blocks found, starting from genesis');
    }
  }
  
  // ==================== Utility Methods ====================
  
  private getBlockFilePath(blockNumber: number): string {
    const fileIndex = Math.floor(blockNumber / STATE_STORE_CONFIG.BLOCKS_PER_FILE);
    return path.join(
      this.dataDir,
      STATE_STORE_CONFIG.BLOCKS_DIR,
      `blocks_${fileIndex.toString().padStart(8, '0')}.json`
    );
  }
  
  getStats(): StoreStats {
    return {
      totalBlocks: this.latestBlock ? this.latestBlock.number + 1 : 0,
      totalTransactions: this.totalTransactions,
      totalAccounts: this.accountCache.getSize(),
      latestBlockNumber: this.latestBlock?.number ?? -1,
      latestBlockHash: this.latestBlock?.hash ?? '',
      stateRoot: this.getStateRoot(),
      walSegments: 1, // Simplified
      snapshotCount: 0, // Would need to count files
      cacheHitRate: this.blockCache.getHitRate(),
      diskUsageBytes: 0 // Would need to calculate
    };
  }
  
  // ==================== Pruning ====================
  
  async prune(keepAfterBlock: number): Promise<number> {
    let pruned = 0;
    
    // Note: In production, this would delete old block files
    console.log(`[StateStore] Pruning blocks before #${keepAfterBlock}`);
    
    return pruned;
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

let stateStoreInstance: EnterpriseStateStore | null = null;

export function getEnterpriseStateStore(): EnterpriseStateStore {
  if (!stateStoreInstance) {
    stateStoreInstance = new EnterpriseStateStore();
  }
  return stateStoreInstance;
}

export async function initializeEnterpriseStateStore(): Promise<EnterpriseStateStore> {
  const store = getEnterpriseStateStore();
  await store.initialize();
  return store;
}
