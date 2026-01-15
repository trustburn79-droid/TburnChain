"use strict";
/**
 * TBURN Cryptographic Utilities
 * Production-grade cryptographic functions with quantum-resistant preparation
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
exports.CryptoUtils = exports.CRYPTO_CONFIG = void 0;
const crypto = __importStar(require("crypto"));
exports.CRYPTO_CONFIG = {
    HASH_ALGORITHM: 'sha3-256',
    HMAC_ALGORITHM: 'sha3-256',
    SYMMETRIC_ALGORITHM: 'aes-256-gcm',
    KDF_ALGORITHM: 'scrypt',
    KDF_N: 2 ** 14,
    KDF_R: 8,
    KDF_P: 1,
    KDF_MAXMEM: 64 * 1024 * 1024,
    NONCE_LENGTH: 32,
    IV_LENGTH: 16,
    AUTH_TAG_LENGTH: 16,
    SALT_LENGTH: 32,
    KEY_LENGTH: 32,
    SIGNATURE_EXPIRY_MS: 30000,
    MAX_CLOCK_DRIFT_MS: 5000
};
class CryptoUtils {
    static generateSecureNonce() {
        return crypto.randomBytes(exports.CRYPTO_CONFIG.NONCE_LENGTH).toString('hex');
    }
    static generateSalt() {
        return crypto.randomBytes(exports.CRYPTO_CONFIG.SALT_LENGTH);
    }
    static deriveKey(password, salt) {
        return new Promise((resolve, reject) => {
            crypto.scrypt(password, salt, exports.CRYPTO_CONFIG.KEY_LENGTH, {
                N: exports.CRYPTO_CONFIG.KDF_N,
                r: exports.CRYPTO_CONFIG.KDF_R,
                p: exports.CRYPTO_CONFIG.KDF_P,
                maxmem: exports.CRYPTO_CONFIG.KDF_MAXMEM
            }, (err, derivedKey) => {
                if (err)
                    reject(err);
                else
                    resolve(derivedKey);
            });
        });
    }
    static hashSHA3(data) {
        return crypto.createHash(exports.CRYPTO_CONFIG.HASH_ALGORITHM)
            .update(data)
            .digest('hex');
    }
    static hmacSHA3(data, key) {
        return crypto.createHmac(exports.CRYPTO_CONFIG.HMAC_ALGORITHM, key)
            .update(data)
            .digest('hex');
    }
    static hmacSHA256(key, data) {
        return crypto.createHmac('sha256', key)
            .update(data)
            .digest('hex');
    }
    static generateNonce() {
        return crypto.randomBytes(16).toString('hex');
    }
    static encrypt(plaintext, key) {
        const iv = crypto.randomBytes(exports.CRYPTO_CONFIG.IV_LENGTH);
        const cipher = crypto.createCipheriv(exports.CRYPTO_CONFIG.SYMMETRIC_ALGORITHM, key, iv);
        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return {
            ciphertext: encrypted,
            iv: iv.toString('hex'),
            authTag: cipher.getAuthTag().toString('hex')
        };
    }
    static decrypt(ciphertext, key, iv, authTag) {
        const decipher = crypto.createDecipheriv(exports.CRYPTO_CONFIG.SYMMETRIC_ALGORITHM, key, Buffer.from(iv, 'hex'));
        decipher.setAuthTag(Buffer.from(authTag, 'hex'));
        let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    static generateEphemeralKeyPair() {
        const { publicKey, privateKey } = crypto.generateKeyPairSync('x25519');
        return {
            publicKey: publicKey.export({ type: 'spki', format: 'der' }),
            privateKey: privateKey.export({ type: 'pkcs8', format: 'der' })
        };
    }
    static deriveSharedSecret(privateKey, peerPublicKey) {
        const privKeyObj = crypto.createPrivateKey({
            key: privateKey,
            format: 'der',
            type: 'pkcs8'
        });
        const pubKeyObj = crypto.createPublicKey({
            key: peerPublicKey,
            format: 'der',
            type: 'spki'
        });
        return crypto.diffieHellman({
            privateKey: privKeyObj,
            publicKey: pubKeyObj
        });
    }
    static verifyTimestamp(timestamp, maxDriftMs = exports.CRYPTO_CONFIG.MAX_CLOCK_DRIFT_MS) {
        const now = Date.now();
        const drift = Math.abs(now - timestamp);
        return drift <= maxDriftMs;
    }
    static isSignatureExpired(signedAt, expiryMs = exports.CRYPTO_CONFIG.SIGNATURE_EXPIRY_MS) {
        return Date.now() - signedAt > expiryMs;
    }
    static constantTimeCompare(a, b) {
        if (a.length !== b.length) {
            return false;
        }
        return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
    }
    static generateRequestId() {
        const timestamp = Date.now().toString(36);
        const random = crypto.randomBytes(8).toString('hex');
        return `${timestamp}-${random}`;
    }
    static createSignedPayload(payload, secretKey) {
        const timestamp = Date.now();
        const nonce = this.generateSecureNonce();
        const data = JSON.stringify(payload);
        const message = `${timestamp}.${nonce}.${data}`;
        const signature = this.hmacSHA3(message, secretKey);
        return {
            payload,
            timestamp,
            nonce,
            signature
        };
    }
    static verifySignedPayload(signedPayload, secretKey) {
        const { payload, timestamp, nonce, signature } = signedPayload;
        if (!this.verifyTimestamp(timestamp)) {
            return false;
        }
        if (this.isSignatureExpired(timestamp)) {
            return false;
        }
        const data = JSON.stringify(payload);
        const message = `${timestamp}.${nonce}.${data}`;
        const expectedSignature = this.hmacSHA3(message, secretKey);
        return this.constantTimeCompare(signature, expectedSignature);
    }
}
exports.CryptoUtils = CryptoUtils;
//# sourceMappingURL=crypto-utils.js.map