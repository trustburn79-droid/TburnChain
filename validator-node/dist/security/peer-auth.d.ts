/**
 * TBURN Peer Authentication
 * Enterprise-Grade Peer Identity Verification
 *
 * Features:
 * - Challenge-response authentication
 * - Peer identity attestation
 * - Nonce replay protection
 * - Peer certificate validation
 * - Handshake hardening
 */
export interface PeerIdentity {
    nodeId: string;
    publicKey: string;
    address: string;
    chainId: number;
    networkId: string;
    timestamp: number;
    nonce: string;
    signature: string;
}
export interface ChallengeResponse {
    challenge: string;
    response: string;
    timestamp: number;
    signature: string;
}
export declare class PeerAuthenticator {
    private myNodeId;
    private myPublicKey;
    private signFunction;
    private verifyFunction;
    private usedNonces;
    private pendingChallenges;
    private authenticatedPeers;
    private readonly NONCE_EXPIRY_MS;
    private readonly CHALLENGE_EXPIRY_MS;
    private readonly MAX_TIMESTAMP_DRIFT_MS;
    constructor(nodeId: string, publicKey: string, signFunction: (message: string) => string, verifyFunction: (publicKey: string, message: string, signature: string) => boolean);
    createIdentityAttestation(chainId: number, networkId: string): PeerIdentity;
    verifyIdentityAttestation(identity: PeerIdentity, expectedChainId: number, expectedNetworkId: string): {
        valid: boolean;
        reason?: string;
    };
    createChallenge(peerId: string): string;
    signChallenge(challenge: string): ChallengeResponse;
    verifyChallenge(peerId: string, publicKey: string, response: ChallengeResponse): {
        valid: boolean;
        reason?: string;
    };
    isAuthenticated(peerId: string): boolean;
    getAuthenticatedPeer(peerId: string): PeerIdentity | undefined;
    removePeer(peerId: string): void;
    private buildIdentityMessage;
    private deriveAddress;
    private cleanupExpired;
    getStats(): {
        authenticatedPeers: number;
        pendingChallenges: number;
        usedNonces: number;
    };
}
//# sourceMappingURL=peer-auth.d.ts.map