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

import * as crypto from 'crypto';
import { createModuleLogger } from '../utils/logger';

const log = createModuleLogger('PeerAuth');

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

interface NonceEntry {
  nonce: string;
  timestamp: number;
  peerId: string;
}

export class PeerAuthenticator {
  private myNodeId: string;
  private myPublicKey: string;
  private signFunction: (message: string) => string;
  private verifyFunction: (publicKey: string, message: string, signature: string) => boolean;
  
  private usedNonces: Map<string, NonceEntry> = new Map();
  private pendingChallenges: Map<string, { challenge: string; timestamp: number }> = new Map();
  private authenticatedPeers: Map<string, PeerIdentity> = new Map();
  
  private readonly NONCE_EXPIRY_MS = 60000; // 1 minute
  private readonly CHALLENGE_EXPIRY_MS = 30000; // 30 seconds
  private readonly MAX_TIMESTAMP_DRIFT_MS = 30000; // 30 seconds

  constructor(
    nodeId: string,
    publicKey: string,
    signFunction: (message: string) => string,
    verifyFunction: (publicKey: string, message: string, signature: string) => boolean
  ) {
    this.myNodeId = nodeId;
    this.myPublicKey = publicKey;
    this.signFunction = signFunction;
    this.verifyFunction = verifyFunction;

    // Cleanup expired nonces periodically
    setInterval(() => this.cleanupExpired(), 60000);
  }

  createIdentityAttestation(chainId: number, networkId: string): PeerIdentity {
    const timestamp = Date.now();
    const nonce = crypto.randomBytes(32).toString('hex');

    const message = this.buildIdentityMessage({
      nodeId: this.myNodeId,
      publicKey: this.myPublicKey,
      address: this.deriveAddress(this.myPublicKey),
      chainId,
      networkId,
      timestamp,
      nonce,
    });

    const signature = this.signFunction(message);

    return {
      nodeId: this.myNodeId,
      publicKey: this.myPublicKey,
      address: this.deriveAddress(this.myPublicKey),
      chainId,
      networkId,
      timestamp,
      nonce,
      signature,
    };
  }

  verifyIdentityAttestation(identity: PeerIdentity, expectedChainId: number, expectedNetworkId: string): {
    valid: boolean;
    reason?: string;
  } {
    // Check chain and network ID
    if (identity.chainId !== expectedChainId) {
      return { valid: false, reason: 'Chain ID mismatch' };
    }

    if (identity.networkId !== expectedNetworkId) {
      return { valid: false, reason: 'Network ID mismatch' };
    }

    // Check timestamp freshness
    const now = Date.now();
    if (Math.abs(now - identity.timestamp) > this.MAX_TIMESTAMP_DRIFT_MS) {
      return { valid: false, reason: 'Timestamp drift too large' };
    }

    // Check nonce reuse
    if (this.usedNonces.has(identity.nonce)) {
      return { valid: false, reason: 'Nonce replay detected' };
    }

    // Verify signature
    const message = this.buildIdentityMessage(identity);
    const signatureValid = this.verifyFunction(identity.publicKey, message, identity.signature);

    if (!signatureValid) {
      return { valid: false, reason: 'Invalid signature' };
    }

    // Verify address matches public key
    const derivedAddress = this.deriveAddress(identity.publicKey);
    if (derivedAddress !== identity.address) {
      return { valid: false, reason: 'Address does not match public key' };
    }

    // Store nonce to prevent replay
    this.usedNonces.set(identity.nonce, {
      nonce: identity.nonce,
      timestamp: now,
      peerId: identity.nodeId,
    });

    // Store authenticated peer
    this.authenticatedPeers.set(identity.nodeId, identity);

    log.info('Peer identity verified', { nodeId: identity.nodeId, address: identity.address });

    return { valid: true };
  }

  createChallenge(peerId: string): string {
    const challenge = crypto.randomBytes(32).toString('hex');
    
    this.pendingChallenges.set(peerId, {
      challenge,
      timestamp: Date.now(),
    });

    return challenge;
  }

  signChallenge(challenge: string): ChallengeResponse {
    const timestamp = Date.now();
    const message = `challenge:${challenge}:${timestamp}`;
    const signature = this.signFunction(message);

    return {
      challenge,
      response: crypto.createHash('sha256').update(challenge + this.myNodeId).digest('hex'),
      timestamp,
      signature,
    };
  }

  verifyChallenge(peerId: string, publicKey: string, response: ChallengeResponse): {
    valid: boolean;
    reason?: string;
  } {
    const pending = this.pendingChallenges.get(peerId);

    if (!pending) {
      return { valid: false, reason: 'No pending challenge' };
    }

    // Check challenge matches
    if (pending.challenge !== response.challenge) {
      return { valid: false, reason: 'Challenge mismatch' };
    }

    // Check challenge not expired
    if (Date.now() - pending.timestamp > this.CHALLENGE_EXPIRY_MS) {
      this.pendingChallenges.delete(peerId);
      return { valid: false, reason: 'Challenge expired' };
    }

    // Verify timestamp freshness
    if (Math.abs(Date.now() - response.timestamp) > this.MAX_TIMESTAMP_DRIFT_MS) {
      return { valid: false, reason: 'Response timestamp drift too large' };
    }

    // Verify signature
    const message = `challenge:${response.challenge}:${response.timestamp}`;
    const signatureValid = this.verifyFunction(publicKey, message, response.signature);

    if (!signatureValid) {
      return { valid: false, reason: 'Invalid response signature' };
    }

    // Verify response hash
    const expectedResponse = crypto.createHash('sha256').update(response.challenge + peerId).digest('hex');
    if (response.response !== expectedResponse) {
      return { valid: false, reason: 'Invalid response hash' };
    }

    // Clean up
    this.pendingChallenges.delete(peerId);

    log.info('Challenge-response verified', { peerId });

    return { valid: true };
  }

  isAuthenticated(peerId: string): boolean {
    return this.authenticatedPeers.has(peerId);
  }

  getAuthenticatedPeer(peerId: string): PeerIdentity | undefined {
    return this.authenticatedPeers.get(peerId);
  }

  removePeer(peerId: string): void {
    this.authenticatedPeers.delete(peerId);
    this.pendingChallenges.delete(peerId);
  }

  private buildIdentityMessage(identity: Omit<PeerIdentity, 'signature'>): string {
    return JSON.stringify({
      nodeId: identity.nodeId,
      publicKey: identity.publicKey,
      address: identity.address,
      chainId: identity.chainId,
      networkId: identity.networkId,
      timestamp: identity.timestamp,
      nonce: identity.nonce,
    });
  }

  private deriveAddress(publicKeyHex: string): string {
    const hash = crypto.createHash('sha256').update(Buffer.from(publicKeyHex, 'hex')).digest();
    const ripemd = crypto.createHash('ripemd160').update(hash).digest();
    return 'tb1' + ripemd.toString('hex').substring(0, 38);
  }

  private cleanupExpired(): void {
    const now = Date.now();

    // Cleanup expired nonces
    for (const [nonce, entry] of this.usedNonces) {
      if (now - entry.timestamp > this.NONCE_EXPIRY_MS) {
        this.usedNonces.delete(nonce);
      }
    }

    // Cleanup expired challenges
    for (const [peerId, pending] of this.pendingChallenges) {
      if (now - pending.timestamp > this.CHALLENGE_EXPIRY_MS) {
        this.pendingChallenges.delete(peerId);
      }
    }
  }

  getStats(): {
    authenticatedPeers: number;
    pendingChallenges: number;
    usedNonces: number;
  } {
    return {
      authenticatedPeers: this.authenticatedPeers.size,
      pendingChallenges: this.pendingChallenges.size,
      usedNonces: this.usedNonces.size,
    };
  }
}
