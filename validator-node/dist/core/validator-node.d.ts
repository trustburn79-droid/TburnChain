/**
 * TBURN Validator Node Core
 * Enterprise-Grade Standalone Validator Implementation
 *
 * This is the main entry point for running a validator node.
 * Coordinates all subsystems: P2P, Consensus, Storage, API
 */
import { EventEmitter } from 'events';
import { ValidatorNodeConfig, Transaction, NodeStatus, ValidatorMetrics } from '../config/types';
export interface MempoolTransaction extends Omit<Transaction, 'gasPrice'> {
    receivedAt: number;
    gasPrice: bigint;
    originalGasPrice: string;
}
export declare class ValidatorNode extends EventEmitter {
    private config;
    private cryptoManager;
    private p2pNetwork;
    private consensusEngine;
    private blockStore;
    private stateStore;
    private mempool;
    private pendingTxByAccount;
    private isRunning;
    private startTime;
    private metrics;
    constructor(config: ValidatorNodeConfig);
    private setupEventHandlers;
    start(): Promise<void>;
    stop(): Promise<void>;
    private waitForPeers;
    private fetchValidatorSet;
    private createBlockProposal;
    private selectTransactionsForBlock;
    private handleFinalizedBlock;
    private applyTransaction;
    private handleIncomingBlock;
    private handleIncomingTransaction;
    submitTransaction(tx: Transaction): Promise<string>;
    private startMetricsCollection;
    getStatus(): NodeStatus;
    getMetrics(): ValidatorMetrics;
    getMempoolSize(): number;
    getPeers(): import("../config/types").PeerInfo[];
    getConfig(): ValidatorNodeConfig;
}
//# sourceMappingURL=validator-node.d.ts.map