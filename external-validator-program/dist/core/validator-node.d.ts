/**
 * TBURN Validator Node
 * Main orchestrator for validator operations with security integration
 */
import { EventEmitter } from 'events';
import { SecureRemoteSignerClient } from './secure-remote-signer-client.js';
import { P2PNetwork } from './p2p-network.js';
import { BlockProducer } from './block-producer.js';
import { AttestationService } from './attestation-service.js';
import { MetricsServer } from './metrics-server.js';
import { MainnetSecurityClient } from './mainnet-security-client.js';
import { ValidatorConfig } from '../config/validator-config.js';
export interface ValidatorNodeConfig {
    config: ValidatorConfig;
    signerClient: SecureRemoteSignerClient;
    p2pNetwork: P2PNetwork;
    blockProducer: BlockProducer;
    attestationService: AttestationService;
    metricsServer: MetricsServer;
    mainnetSecurityClient?: MainnetSecurityClient;
    enableSecurity?: boolean;
}
export interface ValidatorStatus {
    isRunning: boolean;
    isProposing: boolean;
    isAttesting: boolean;
    connectedPeers: number;
    currentSlot: number;
    currentEpoch: number;
    blocksProposed: number;
    attestationsMade: number;
    uptime: number;
    signerStatus: 'connected' | 'disconnected' | 'error';
    securityStatus: {
        enabled: boolean;
        alertCount: number;
        blocked: boolean;
        lastCheck: number;
    };
}
export declare class ValidatorNode extends EventEmitter {
    private config;
    private signerClient;
    private p2pNetwork;
    private blockProducer;
    private attestationService;
    private metricsServer;
    private mainnetSecurityClient?;
    private auditLogger;
    private isRunning;
    private startTime;
    private heartbeatInterval?;
    private slotInterval?;
    private securityCheckInterval?;
    private securityReportInterval?;
    private currentSlot;
    private currentEpoch;
    private blocksProposed;
    private attestationsMade;
    private securityAlertCount;
    private lastSecurityCheck;
    private enableSecurity;
    private isBlockedByMainnet;
    constructor(nodeConfig: ValidatorNodeConfig);
    private setupMainnetSecurityHandlers;
    private setupEventHandlers;
    start(): Promise<void>;
    stop(): Promise<void>;
    private startSlotTimer;
    private startHeartbeat;
    private startSecurityMonitoring;
    private performSecurityCheck;
    private shouldProposeBlock;
    private hashSlotWithValidator;
    private sendHeartbeat;
    getStatus(): ValidatorStatus;
    getSecurityStats(): {
        rateLimitStats: {
            requests: number;
            violations: number;
            blocked: boolean;
        };
        nonceStats: {
            size: number;
            oldestAge: number;
        };
        anomalyStats: {
            totalSignings: number;
            totalFailures: number;
            avgLatency: number;
            alertCount: number;
        };
        isBlocked: boolean;
    };
    getSignerStats(): {
        totalRequests: number;
        successfulRequests: number;
        failedRequests: number;
        averageLatencyMs: number;
        securityBlocks: number;
        anomalyAlerts: number;
    };
    getConfig(): ValidatorConfig;
    isSecurityEnabled(): boolean;
}
//# sourceMappingURL=validator-node.d.ts.map