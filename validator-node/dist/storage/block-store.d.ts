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
import { Block, Transaction, StorageConfig } from '../config/types';
export declare class BlockStore {
    private config;
    private blockIndexByHeight;
    private blockIndexByHash;
    private txIndex;
    private latestHeight;
    private blockDataFile;
    private indexFile;
    private walFile;
    private isOpen;
    constructor(config: StorageConfig);
    open(): Promise<void>;
    close(): Promise<void>;
    private loadIndex;
    private saveIndex;
    putBlock(block: Block): Promise<void>;
    getBlock(heightOrHash: number | string): Promise<Block | null>;
    getBlocksByRange(startHeight: number, endHeight: number): Promise<Block[]>;
    getTransaction(hash: string): Promise<{
        tx: Transaction;
        block: Block;
    } | null>;
    getLatestBlock(): Promise<Block | null>;
    getLatestHeight(): number;
    hasBlock(heightOrHash: number | string): boolean;
    prune(keepBlocks: number): Promise<number>;
    getStats(): {
        totalBlocks: number;
        totalTransactions: number;
        latestHeight: number;
        storageSize: number;
    };
}
export declare class StateStore {
    private config;
    private state;
    private stateFile;
    private isOpen;
    constructor(config: StorageConfig);
    open(): Promise<void>;
    close(): Promise<void>;
    save(): Promise<void>;
    get<T>(key: string): T | undefined;
    set(key: string, value: unknown): void;
    delete(key: string): void;
    has(key: string): boolean;
    getBalance(address: string): bigint;
    setBalance(address: string, balance: bigint): void;
    getNonce(address: string): number;
    setNonce(address: string, nonce: number): void;
    computeStateRoot(): string;
}
//# sourceMappingURL=block-store.d.ts.map