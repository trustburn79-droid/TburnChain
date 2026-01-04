/**
 * TBURN Validator Node Core
 * Enterprise-Grade Standalone Validator Implementation
 *
 * This is the main entry point for running a validator node.
 * Coordinates all subsystems: P2P, Consensus, Storage, API
 *
 * Security Features:
 * - AES-256-GCM encrypted keystore with Argon2id key derivation
 * - Token bucket DDoS protection with circuit breaker
 * - TLS 1.3 / mTLS for secure communications
 * - Challenge-response peer authentication with nonce replay protection
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
    private secureKeystore;
    private rateLimiter;
    private peerRateLimiter;
    private tlsManager;
    private peerAuthenticator;
    private mempool;
    private pendingTxByAccount;
    private isRunning;
    private startTime;
    private securityEnabled;
    private metrics;
    constructor(config: ValidatorNodeConfig);
    /**
     * Initialize secure keystore for key management
     */
    initializeSecureKeystore(password: string): Promise<void>;
    /**
     * Initialize TLS for secure communications
     */
    initializeTLS(): Promise<void>;
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