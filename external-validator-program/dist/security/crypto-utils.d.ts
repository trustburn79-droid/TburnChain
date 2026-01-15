/**
 * TBURN Cryptographic Utilities
 * Production-grade cryptographic functions with quantum-resistant preparation
 */
export declare const CRYPTO_CONFIG: {
    HASH_ALGORITHM: string;
    HMAC_ALGORITHM: string;
    SYMMETRIC_ALGORITHM: string;
    KDF_ALGORITHM: string;
    KDF_N: number;
    KDF_R: number;
    KDF_P: number;
    KDF_MAXMEM: number;
    NONCE_LENGTH: number;
    IV_LENGTH: number;
    AUTH_TAG_LENGTH: number;
    SALT_LENGTH: number;
    KEY_LENGTH: number;
    SIGNATURE_EXPIRY_MS: number;
    MAX_CLOCK_DRIFT_MS: number;
};
export declare class CryptoUtils {
    static generateSecureNonce(): string;
    static generateSalt(): Buffer;
    static deriveKey(password: string, salt: Buffer): Promise<Buffer>;
    static hashSHA3(data: string | Buffer): string;
    static hmacSHA3(data: string | Buffer, key: string | Buffer): string;
    static hmacSHA256(key: string | Buffer, data: string | Buffer): string;
    static generateNonce(): string;
    static encrypt(plaintext: string, key: Buffer): {
        ciphertext: string;
        iv: string;
        authTag: string;
    };
    static decrypt(ciphertext: string, key: Buffer, iv: string, authTag: string): string;
    static generateEphemeralKeyPair(): {
        publicKey: Buffer;
        privateKey: Buffer;
    };
    static deriveSharedSecret(privateKey: Buffer, peerPublicKey: Buffer): Buffer;
    static verifyTimestamp(timestamp: number, maxDriftMs?: number): boolean;
    static isSignatureExpired(signedAt: number, expiryMs?: number): boolean;
    static constantTimeCompare(a: string, b: string): boolean;
    static generateRequestId(): string;
    static createSignedPayload(payload: object, secretKey: string): SignedPayload;
    static verifySignedPayload(signedPayload: SignedPayload, secretKey: string): boolean;
}
export interface SignedPayload {
    payload: object;
    timestamp: number;
    nonce: string;
    signature: string;
}
//# sourceMappingURL=crypto-utils.d.ts.map