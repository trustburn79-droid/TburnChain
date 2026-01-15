/**
 * TBURN Attestation Service
 * Handles attestation creation and signing via Remote Signer
 */
import { EventEmitter } from 'events';
export interface AttestationRequest {
    slot: number;
    epoch: number;
    beaconBlockRoot: string;
    sourceEpoch: number;
    sourceRoot: string;
    targetEpoch: number;
    targetRoot: string;
}
export interface SignerClient {
    signAttestation(request: AttestationRequest): Promise<{
        success: boolean;
        signature?: string;
        error?: string;
    }>;
    signAggregate(attestations: AttestationRequest[]): Promise<{
        success: boolean;
        signature?: string;
        error?: string;
    }>;
}
export interface AttestationServiceConfig {
    signerClient: SignerClient;
    validatorAddress: string;
}
export interface Attestation {
    slot: number;
    epoch: number;
    beaconBlockRoot: string;
    sourceEpoch: number;
    sourceRoot: string;
    targetEpoch: number;
    targetRoot: string;
    signature: string;
    aggregationBits: string;
}
export declare class AttestationService extends EventEmitter {
    private signerClient;
    private validatorAddress;
    private attesting;
    private attestationsMade;
    private lastSourceEpoch;
    private lastSourceRoot;
    constructor(config: AttestationServiceConfig);
    attest(slot: number, epoch: number): Promise<Attestation | null>;
    aggregateAttestations(attestations: Attestation[]): Promise<string | null>;
    isAttesting(): boolean;
    getAttestationsMade(): number;
    private generateHash;
    private generateAggregationBits;
}
//# sourceMappingURL=attestation-service.d.ts.map