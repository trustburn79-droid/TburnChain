/**
 * TBURN Secure Keystore
 * Enterprise-Grade Key Management with Encryption
 *
 * Features:
 * - AES-256-GCM encrypted key storage
 * - Argon2id key derivation
 * - HSM/KMS provider interface
 * - Key rotation and versioning
 * - Secure memory handling
 */
export interface KeystoreConfig {
    path: string;
    passwordHash?: string;
    kmsProvider?: 'local' | 'vault' | 'aws-kms' | 'gcp-kms';
    kmsEndpoint?: string;
    kmsCredentials?: Record<string, string>;
    autoLockTimeoutMs?: number;
    maxDecryptionAttempts?: number;
}
export interface EncryptedKey {
    version: number;
    algorithm: string;
    kdf: string;
    kdfParams: {
        salt: string;
        iterations: number;
        memory: number;
        parallelism: number;
    };
    iv: string;
    ciphertext: string;
    mac: string;
    createdAt: string;
    rotatedAt?: string;
    keyId: string;
}
export interface KeyMetadata {
    keyId: string;
    address: string;
    publicKey: string;
    version: number;
    createdAt: Date;
    lastUsed: Date;
    usageCount: number;
    isActive: boolean;
}
export declare class SecureKeystore {
    private config;
    private isUnlocked;
    private derivedKey;
    private lockTimeout;
    private decryptionAttempts;
    private keyCache;
    constructor(config: KeystoreConfig);
    initialize(password: string): Promise<void>;
    unlock(password: string): Promise<boolean>;
    lock(): void;
    private resetLockTimer;
    private deriveKey;
    private getOrCreateSalt;
    generateKey(name?: string): Promise<{
        keyId: string;
        address: string;
        publicKey: string;
    }>;
    importKey(privateKeyHex: string): Promise<{
        keyId: string;
        address: string;
        publicKey: string;
    }>;
    sign(keyId: string, message: Buffer): Promise<Buffer>;
    verify(publicKeyHex: string, message: Buffer, signature: Buffer): Promise<boolean>;
    rotateKey(keyId: string): Promise<string>;
    private encryptKey;
    private decryptKey;
    private getPrivateKey;
    private saveKey;
    private loadKeystore;
    private updateKeyUsage;
    private deactivateKey;
    private deriveAddress;
    private ensureUnlocked;
    getKeyMetadata(keyId: string): KeyMetadata | undefined;
    listKeys(): KeyMetadata[];
    isLocked(): boolean;
}
//# sourceMappingURL=secure-keystore.d.ts.map