/**
 * TBURN Validator Block Storage
 * Enterprise-Grade Persistent Block Storage with LevelDB-style interface
 * 
 * Features:
 * - Append-only block storage
 * - Indexed lookups by height and hash
 * - Transaction index
 * - State snapshots
 * - Pruning support
 * - Write-ahead logging
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { Block, BlockHeader, Transaction, StorageConfig } from '../config/types';
import { createModuleLogger } from '../utils/logger';

const log = createModuleLogger('BlockStore');

interface BlockIndex {
  height: number;
  hash: string;
  offset: number;
  size: number;
  timestamp: number;
}

interface TransactionIndex {
  hash: string;
  blockHeight: number;
  blockHash: string;
  index: number;
}

export class BlockStore {
  private config: StorageConfig;
  private blockIndexByHeight: Map<number, BlockIndex> = new Map();
  private blockIndexByHash: Map<string, BlockIndex> = new Map();
  private txIndex: Map<string, TransactionIndex> = new Map();
  private latestHeight: number = 0;
  private blockDataFile: string;
  private indexFile: string;
  private walFile: string;
  private isOpen: boolean = false;

  constructor(config: StorageConfig) {
    this.config = config;
    this.blockDataFile = path.join(config.blockDbPath, 'blocks.dat');
    this.indexFile = path.join(config.blockDbPath, 'index.json');
    this.walFile = path.join(config.blockDbPath, 'wal.log');
  }

  async open(): Promise<void> {
    if (this.isOpen) return;

    if (!fs.existsSync(this.config.blockDbPath)) {
      fs.mkdirSync(this.config.blockDbPath, { recursive: true });
    }

    await this.loadIndex();
    this.isOpen = true;
    log.info('Block store opened', { latestHeight: this.latestHeight });
  }

  async close(): Promise<void> {
    if (!this.isOpen) return;

    await this.saveIndex();
    this.isOpen = false;
    log.info('Block store closed');
  }

  private async loadIndex(): Promise<void> {
    if (!fs.existsSync(this.indexFile)) {
      log.info('No existing index found, starting fresh');
      return;
    }

    try {
      const data = fs.readFileSync(this.indexFile, 'utf-8');
      const index = JSON.parse(data);

      for (const entry of index.blocks) {
        this.blockIndexByHeight.set(entry.height, entry);
        this.blockIndexByHash.set(entry.hash, entry);
      }

      for (const entry of index.transactions) {
        this.txIndex.set(entry.hash, entry);
      }

      this.latestHeight = index.latestHeight || 0;

      log.info('Index loaded', {
        blocks: this.blockIndexByHeight.size,
        transactions: this.txIndex.size,
      });
    } catch (err) {
      log.error('Failed to load index', { error: (err as Error).message });
    }
  }

  private async saveIndex(): Promise<void> {
    const index = {
      latestHeight: this.latestHeight,
      blocks: Array.from(this.blockIndexByHeight.values()),
      transactions: Array.from(this.txIndex.values()),
    };

    const tempFile = this.indexFile + '.tmp';
    fs.writeFileSync(tempFile, JSON.stringify(index));
    fs.renameSync(tempFile, this.indexFile);
  }

  async putBlock(block: Block): Promise<void> {
    if (!this.isOpen) throw new Error('Block store not open');

    if (block.height <= this.latestHeight && this.latestHeight > 0) {
      throw new Error(`Block height ${block.height} already exists`);
    }

    const serialized = JSON.stringify(block);
    const walEntry = `${Date.now()}|PUT|${block.hash}|${serialized}\n`;
    fs.appendFileSync(this.walFile, walEntry);

    const stats = fs.existsSync(this.blockDataFile) 
      ? fs.statSync(this.blockDataFile) 
      : { size: 0 };
    const offset = stats.size;

    fs.appendFileSync(this.blockDataFile, serialized + '\n');

    const indexEntry: BlockIndex = {
      height: block.height,
      hash: block.hash,
      offset,
      size: serialized.length,
      timestamp: block.timestamp,
    };

    this.blockIndexByHeight.set(block.height, indexEntry);
    this.blockIndexByHash.set(block.hash, indexEntry);

    for (let i = 0; i < block.transactions.length; i++) {
      const tx = block.transactions[i];
      this.txIndex.set(tx.hash, {
        hash: tx.hash,
        blockHeight: block.height,
        blockHash: block.hash,
        index: i,
      });
    }

    this.latestHeight = block.height;

    if (this.latestHeight % 100 === 0) {
      await this.saveIndex();
    }

    log.debug('Block stored', { height: block.height, hash: block.hash });
  }

  async getBlock(heightOrHash: number | string): Promise<Block | null> {
    if (!this.isOpen) throw new Error('Block store not open');

    let indexEntry: BlockIndex | undefined;

    if (typeof heightOrHash === 'number') {
      indexEntry = this.blockIndexByHeight.get(heightOrHash);
    } else {
      indexEntry = this.blockIndexByHash.get(heightOrHash);
    }

    if (!indexEntry) return null;

    try {
      const fd = fs.openSync(this.blockDataFile, 'r');
      const buffer = Buffer.alloc(indexEntry.size);
      fs.readSync(fd, buffer, 0, indexEntry.size, indexEntry.offset);
      fs.closeSync(fd);

      return JSON.parse(buffer.toString());
    } catch (err) {
      log.error('Failed to read block', { error: (err as Error).message });
      return null;
    }
  }

  async getBlocksByRange(startHeight: number, endHeight: number): Promise<Block[]> {
    const blocks: Block[] = [];

    for (let height = startHeight; height <= endHeight; height++) {
      const block = await this.getBlock(height);
      if (block) {
        blocks.push(block);
      }
    }

    return blocks;
  }

  async getTransaction(hash: string): Promise<{ tx: Transaction; block: Block } | null> {
    if (!this.isOpen) throw new Error('Block store not open');

    const txEntry = this.txIndex.get(hash);
    if (!txEntry) return null;

    const block = await this.getBlock(txEntry.blockHeight);
    if (!block) return null;

    const tx = block.transactions[txEntry.index];
    return { tx, block };
  }

  async getLatestBlock(): Promise<Block | null> {
    return this.getBlock(this.latestHeight);
  }

  getLatestHeight(): number {
    return this.latestHeight;
  }

  hasBlock(heightOrHash: number | string): boolean {
    if (typeof heightOrHash === 'number') {
      return this.blockIndexByHeight.has(heightOrHash);
    }
    return this.blockIndexByHash.has(heightOrHash);
  }

  async prune(keepBlocks: number): Promise<number> {
    if (!this.config.pruneBlocks) return 0;

    const pruneBeforeHeight = this.latestHeight - keepBlocks;
    if (pruneBeforeHeight <= 0) return 0;

    let prunedCount = 0;

    for (const [height, entry] of this.blockIndexByHeight) {
      if (height < pruneBeforeHeight) {
        this.blockIndexByHeight.delete(height);
        this.blockIndexByHash.delete(entry.hash);
        prunedCount++;
      }
    }

    log.info('Pruned old blocks', { count: prunedCount });
    await this.saveIndex();

    return prunedCount;
  }

  getStats(): {
    totalBlocks: number;
    totalTransactions: number;
    latestHeight: number;
    storageSize: number;
  } {
    const storageSize = fs.existsSync(this.blockDataFile)
      ? fs.statSync(this.blockDataFile).size
      : 0;

    return {
      totalBlocks: this.blockIndexByHeight.size,
      totalTransactions: this.txIndex.size,
      latestHeight: this.latestHeight,
      storageSize,
    };
  }
}

export class StateStore {
  private config: StorageConfig;
  private state: Map<string, unknown> = new Map();
  private stateFile: string;
  private isOpen: boolean = false;

  constructor(config: StorageConfig) {
    this.config = config;
    this.stateFile = path.join(config.stateDbPath, 'state.json');
  }

  async open(): Promise<void> {
    if (this.isOpen) return;

    if (!fs.existsSync(this.config.stateDbPath)) {
      fs.mkdirSync(this.config.stateDbPath, { recursive: true });
    }

    if (fs.existsSync(this.stateFile)) {
      try {
        const data = fs.readFileSync(this.stateFile, 'utf-8');
        const parsed = JSON.parse(data);
        this.state = new Map(Object.entries(parsed));
      } catch (err) {
        log.error('Failed to load state', { error: (err as Error).message });
      }
    }

    this.isOpen = true;
    log.info('State store opened', { entries: this.state.size });
  }

  async close(): Promise<void> {
    if (!this.isOpen) return;
    await this.save();
    this.isOpen = false;
  }

  async save(): Promise<void> {
    const data: Record<string, unknown> = {};
    for (const [key, value] of this.state) {
      data[key] = value;
    }

    const tempFile = this.stateFile + '.tmp';
    fs.writeFileSync(tempFile, JSON.stringify(data));
    fs.renameSync(tempFile, this.stateFile);
  }

  get<T>(key: string): T | undefined {
    return this.state.get(key) as T | undefined;
  }

  set(key: string, value: unknown): void {
    this.state.set(key, value);
  }

  delete(key: string): void {
    this.state.delete(key);
  }

  has(key: string): boolean {
    return this.state.has(key);
  }

  getBalance(address: string): bigint {
    const key = `balance:${address}`;
    const balance = this.state.get(key) as string | undefined;
    return balance ? BigInt(balance) : BigInt(0);
  }

  setBalance(address: string, balance: bigint): void {
    const key = `balance:${address}`;
    this.state.set(key, balance.toString());
  }

  getNonce(address: string): number {
    const key = `nonce:${address}`;
    return (this.state.get(key) as number) || 0;
  }

  setNonce(address: string, nonce: number): void {
    const key = `nonce:${address}`;
    this.state.set(key, nonce);
  }

  computeStateRoot(): string {
    const sortedKeys = Array.from(this.state.keys()).sort();
    const entries = sortedKeys.map(k => `${k}:${JSON.stringify(this.state.get(k))}`);
    return crypto.createHash('sha256').update(entries.join('|')).digest('hex');
  }
}
