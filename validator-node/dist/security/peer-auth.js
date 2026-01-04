"use strict";
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
exports.PeerAuthenticator = void 0;
const crypto = __importStar(require("crypto"));
const logger_1 = require("../utils/logger");
const log = (0, logger_1.createModuleLogger)('PeerAuth');
class PeerAuthenticator {
    myNodeId;
    myPublicKey;
    signFunction;
    verifyFunction;
    usedNonces = new Map();
    pendingChallenges = new Map();
    authenticatedPeers = new Map();
    NONCE_EXPIRY_MS = 60000; // 1 minute
    CHALLENGE_EXPIRY_MS = 30000; // 30 seconds
    MAX_TIMESTAMP_DRIFT_MS = 30000; // 30 seconds
    constructor(nodeId, publicKey, signFunction, verifyFunction) {
        this.myNodeId = nodeId;
        this.myPublicKey = publicKey;
        this.signFunction = signFunction;
        this.verifyFunction = verifyFunction;
        // Cleanup expired nonces periodically
        setInterval(() => this.cleanupExpired(), 60000);
    }
    createIdentityAttestation(chainId, networkId) {
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
    verifyIdentityAttestation(identity, expectedChainId, expectedNetworkId) {
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
    createChallenge(peerId) {
        const challenge = crypto.randomBytes(32).toString('hex');
        this.pendingChallenges.set(peerId, {
            challenge,
            timestamp: Date.now(),
        });
        return challenge;
    }
    signChallenge(challenge) {
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
    verifyChallenge(peerId, publicKey, response) {
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
    isAuthenticated(peerId) {
        return this.authenticatedPeers.has(peerId);
    }
    getAuthenticatedPeer(peerId) {
        return this.authenticatedPeers.get(peerId);
    }
    removePeer(peerId) {
        this.authenticatedPeers.delete(peerId);
        this.pendingChallenges.delete(peerId);
    }
    buildIdentityMessage(identity) {
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
    deriveAddress(publicKeyHex) {
        const hash = crypto.createHash('sha256').update(Buffer.from(publicKeyHex, 'hex')).digest();
        const ripemd = crypto.createHash('ripemd160').update(hash).digest();
        return 'tb1' + ripemd.toString('hex').substring(0, 38);
    }
    cleanupExpired() {
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
    getStats() {
        return {
            authenticatedPeers: this.authenticatedPeers.size,
            pendingChallenges: this.pendingChallenges.size,
            usedNonces: this.usedNonces.size,
        };
    }
}
exports.PeerAuthenticator = PeerAuthenticator;
//# sourceMappingURL=peer-auth.js.map