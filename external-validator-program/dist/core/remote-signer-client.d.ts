/**
 * TBURN Remote Signer Client
 * Production-grade mTLS client for secure Remote Signer Service
 *
 * Features:
 * - Real mTLS authentication with certificate verification
 * - Automatic retry with exponential backoff
 * - Request signing and verification
 * - Comprehensive audit logging
 * - Connection pooling and keepalive
 */
import { EventEmitter } from 'events';
export interface RemoteSignerConfig {
    endpoint: string;
    validatorAddress: string;
    nodeId: string;
    caCertPath: string;
    clientCertPath: string;
    clientKeyPath: string;
    timeout: number;
    retryAttempts: number;
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
export declare class RemoteSignerClient extends EventEmitter {
    private config;
    private tlsOptions;
    private isConnected;
    private clientKey;
    private useMock;
    private stats;
    constructor(config: RemoteSignerConfig);
    connect(): Promise<boolean>;
    private loadTLSCredentials;
    disconnect(): Promise<void>;
    signBlock(request: BlockSigningRequest): Promise<SigningResult>;
    signAttestation(request: AttestationRequest): Promise<SigningResult>;
    signAggregate(attestations: AttestationRequest[]): Promise<SigningResult>;
    signSyncCommittee(slot: number, beaconBlockRoot: string): Promise<SigningResult>;
    signGovernanceVote(proposalId: string, vote: 'for' | 'against' | 'abstain'): Promise<SigningResult>;
    signWithdrawal(validatorIndex: number, amount: bigint, recipient: string): Promise<SigningResult>;
    private sendSigningRequest;
    private executeHttpsRequest;
    private mockSignerRequest;
    private signRequestPayload;
    healthCheck(): Promise<{
        healthy: boolean;
        latencyMs: number;
        mode: string;
    }>;
    private executeHealthRequest;
    getStats(): {
        totalRequests: number;
        successfulRequests: number;
        failedRequests: number;
        averageLatencyMs: number;
    };
    isReady(): boolean;
    isProductionMode(): boolean;
    private updateAverageLatency;
    private sleep;
}
//# sourceMappingURL=remote-signer-client.d.ts.map