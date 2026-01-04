"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateStore = exports.BlockStore = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const logger_1 = require("../utils/logger");
const log = (0, logger_1.createModuleLogger)('BlockStore');
class BlockStore {
    config;
    blockIndexByHeight = new Map();
    blockIndexByHash = new Map();
    txIndex = new Map();
    latestHeight = 0;
    blockDataFile;
    indexFile;
    walFile;
    isOpen = false;
    constructor(config) {
        this.config = config;
        this.blockDataFile = path.join(config.blockDbPath, 'blocks.dat');
        this.indexFile = path.join(config.blockDbPath, 'index.json');
        this.walFile = path.join(config.blockDbPath, 'wal.log');
    }
    async open() {
        if (this.isOpen)
            return;
        if (!fs.existsSync(this.config.blockDbPath)) {
            fs.mkdirSync(this.config.blockDbPath, { recursive: true });
        }
        await this.loadIndex();
        this.isOpen = true;
        log.info('Block store opened', { latestHeight: this.latestHeight });
    }
    async close() {
        if (!this.isOpen)
            return;
        await this.saveIndex();
        this.isOpen = false;
        log.info('Block store closed');
    }
    async loadIndex() {
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
        }
        catch (err) {
            log.error('Failed to load index', { error: err.message });
        }
    }
    async saveIndex() {
        const index = {
            latestHeight: this.latestHeight,
            blocks: Array.from(this.blockIndexByHeight.values()),
            transactions: Array.from(this.txIndex.values()),
        };
        const tempFile = this.indexFile + '.tmp';
        fs.writeFileSync(tempFile, JSON.stringify(index));
        fs.renameSync(tempFile, this.indexFile);
    }
    async putBlock(block) {
        if (!this.isOpen)
            throw new Error('Block store not open');
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
        const indexEntry = {
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
    async getBlock(heightOrHash) {
        if (!this.isOpen)
            throw new Error('Block store not open');
        let indexEntry;
        if (typeof heightOrHash === 'number') {
            indexEntry = this.blockIndexByHeight.get(heightOrHash);
        }
        else {
            indexEntry = this.blockIndexByHash.get(heightOrHash);
        }
        if (!indexEntry)
            return null;
        try {
            const fd = fs.openSync(this.blockDataFile, 'r');
            const buffer = Buffer.alloc(indexEntry.size);
            fs.readSync(fd, buffer, 0, indexEntry.size, indexEntry.offset);
            fs.closeSync(fd);
            return JSON.parse(buffer.toString());
        }
        catch (err) {
            log.error('Failed to read block', { error: err.message });
            return null;
        }
    }
    async getBlocksByRange(startHeight, endHeight) {
        const blocks = [];
        for (let height = startHeight; height <= endHeight; height++) {
            const block = await this.getBlock(height);
            if (block) {
                blocks.push(block);
            }
        }
        return blocks;
    }
    async getTransaction(hash) {
        if (!this.isOpen)
            throw new Error('Block store not open');
        const txEntry = this.txIndex.get(hash);
        if (!txEntry)
            return null;
        const block = await this.getBlock(txEntry.blockHeight);
        if (!block)
            return null;
        const tx = block.transactions[txEntry.index];
        return { tx, block };
    }
    async getLatestBlock() {
        return this.getBlock(this.latestHeight);
    }
    getLatestHeight() {
        return this.latestHeight;
    }
    hasBlock(heightOrHash) {
        if (typeof heightOrHash === 'number') {
            return this.blockIndexByHeight.has(heightOrHash);
        }
        return this.blockIndexByHash.has(heightOrHash);
    }
    async prune(keepBlocks) {
        if (!this.config.pruneBlocks)
            return 0;
        const pruneBeforeHeight = this.latestHeight - keepBlocks;
        if (pruneBeforeHeight <= 0)
            return 0;
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
    getStats() {
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
exports.BlockStore = BlockStore;
class StateStore {
    config;
    state = new Map();
    stateFile;
    isOpen = false;
    constructor(config) {
        this.config = config;
        this.stateFile = path.join(config.stateDbPath, 'state.json');
    }
    async open() {
        if (this.isOpen)
            return;
        if (!fs.existsSync(this.config.stateDbPath)) {
            fs.mkdirSync(this.config.stateDbPath, { recursive: true });
        }
        if (fs.existsSync(this.stateFile)) {
            try {
                const data = fs.readFileSync(this.stateFile, 'utf-8');
                const parsed = JSON.parse(data);
                this.state = new Map(Object.entries(parsed));
            }
            catch (err) {
                log.error('Failed to load state', { error: err.message });
            }
        }
        this.isOpen = true;
        log.info('State store opened', { entries: this.state.size });
    }
    async close() {
        if (!this.isOpen)
            return;
        await this.save();
        this.isOpen = false;
    }
    async save() {
        const data = {};
        for (const [key, value] of this.state) {
            data[key] = value;
        }
        const tempFile = this.stateFile + '.tmp';
        fs.writeFileSync(tempFile, JSON.stringify(data));
        fs.renameSync(tempFile, this.stateFile);
    }
    get(key) {
        return this.state.get(key);
    }
    set(key, value) {
        this.state.set(key, value);
    }
    delete(key) {
        this.state.delete(key);
    }
    has(key) {
        return this.state.has(key);
    }
    getBalance(address) {
        const key = `balance:${address}`;
        const balance = this.state.get(key);
        return balance ? BigInt(balance) : BigInt(0);
    }
    setBalance(address, balance) {
        const key = `balance:${address}`;
        this.state.set(key, balance.toString());
    }
    getNonce(address) {
        const key = `nonce:${address}`;
        return this.state.get(key) || 0;
    }
    setNonce(address, nonce) {
        const key = `nonce:${address}`;
        this.state.set(key, nonce);
    }
    computeStateRoot() {
        const sortedKeys = Array.from(this.state.keys()).sort();
        const entries = sortedKeys.map(k => `${k}:${JSON.stringify(this.state.get(k))}`);
        return crypto.createHash('sha256').update(entries.join('|')).digest('hex');
    }
}
exports.StateStore = StateStore;
//# sourceMappingURL=block-store.js.map