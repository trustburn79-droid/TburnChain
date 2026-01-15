/**
 * TBURN Secure Remote Signer Client
 * Production-grade mTLS client with comprehensive security controls
 */
import { EventEmitter } from 'events';
export interface SecureSignerConfig {
    endpoint: string;
    validatorAddress: string;
    nodeId: string;
    caCertPath: string;
    clientCertPath: string;
    clientKeyPath: string;
    timeout: number;
    retryAttempts: number;
    retryDelayMs: number;
    enableSecurity: boolean;
    strictMode: boolean;
    logDir: string;
}
export interface SigningResult {
    success: boolean;
    signature?: string;
    signatureType?: 'ecdsa' | 'bls' | 'ed25519';
    publicKey?: string;
    error?: string;
    requestId: string;
    responseTimeMs: number;
    auditId?: string;
    securityAlerts?: string[];
}
export interface BlockSigningRequest {
    slot: number;
    blockHash: string;
    stateRoot: string;
    parentHash: string;
    transactionRoot: string;
    proposerIndex: number;
}
export interface AttestationRequest {
    slot: number;
    epoch: number;
    beaconBlockRoot: string;
    sourceEpoch: number;
    sourceRoot: string;
    targetEpoch: number;
    targetRoot: string;
}
export declare class SecureRemoteSignerClient extends EventEmitter {
    private config;
    private tlsOptions;
    private securityManager;
    private isConnected;
    private sessionKey;
    private connectionId;
    private useMock;
    private certificateFingerprint;
    private stats;
    constructor(config: SecureSignerConfig);
    connect(): Promise<boolean>;
    private loadAndVerifyTLSCredentials;
    private computeCertFingerprint;
    disconnect(): Promise<void>;
    signBlock(request: BlockSigningRequest): Promise<SigningResult>;
    signAttestation(request: AttestationRequest): Promise<SigningResult>;
    signAggregate(attestations: AttestationRequest[]): Promise<SigningResult>;
    signSyncCommittee(slot: number, beaconBlockRoot: string): Promise<SigningResult>;
    signGovernanceVote(proposalId: string, vote: 'for' | 'against' | 'abstain'): Promise<SigningResult>;
    signWithdrawal(validatorIndex: number, amount: bigint, recipient: string): Promise<SigningResult>;
    private sendSecureSigningRequest;
    private executeSecureRequest;
    private mockSignerRequest;
    healthCheck(): Promise<{
        healthy: boolean;
        latencyMs: number;
        mode: string;
        securityEnabled: boolean;
    }>;
    private executeHealthRequest;
    getStats(): {
        totalRequests: number;
        successfulRequests: number;
        failedRequests: number;
        averageLatencyMs: number;
        securityBlocks: number;
        anomalyAlerts: number;
    };
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
    isReady(): boolean;
    isProductionMode(): boolean;
    getConnectionId(): string;
    getCertificateFingerprint(): string;
    private updateAverageLatency;
    private sleep;
}
//# sourceMappingURL=secure-remote-signer-client.d.ts.map