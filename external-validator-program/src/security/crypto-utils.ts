/**
 * TBURN Cryptographic Utilities
 * Production-grade cryptographic functions with quantum-resistant preparation
 */

import * as crypto from 'crypto';

export const CRYPTO_CONFIG = {
  HASH_ALGORITHM: 'sha3-256',
  HMAC_ALGORITHM: 'sha3-256',
  SYMMETRIC_ALGORITHM: 'aes-256-gcm',
  KDF_ALGORITHM: 'scrypt',
  KDF_ITERATIONS: 2 ** 17,
  KDF_MEMORY: 2 ** 20,
  KDF_PARALLELISM: 4,
  NONCE_LENGTH: 32,
  IV_LENGTH: 16,
  AUTH_TAG_LENGTH: 16,
  SALT_LENGTH: 32,
  KEY_LENGTH: 32,
  SIGNATURE_EXPIRY_MS: 30000,
  MAX_CLOCK_DRIFT_MS: 5000
};

export class CryptoUtils {
  static generateSecureNonce(): string {
    return crypto.randomBytes(CRYPTO_CONFIG.NONCE_LENGTH).toString('hex');
  }

  static generateSalt(): Buffer {
    return crypto.randomBytes(CRYPTO_CONFIG.SALT_LENGTH);
  }

  static deriveKey(password: string, salt: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      crypto.scrypt(
        password,
        salt,
        CRYPTO_CONFIG.KEY_LENGTH,
        {
          N: CRYPTO_CONFIG.KDF_ITERATIONS,
          r: 8,
          p: CRYPTO_CONFIG.KDF_PARALLELISM,
          maxmem: CRYPTO_CONFIG.KDF_MEMORY
        },
        (err, derivedKey) => {
          if (err) reject(err);
          else resolve(derivedKey);
        }
      );
    });
  }

  static hashSHA3(data: string | Buffer): string {
    return crypto.createHash(CRYPTO_CONFIG.HASH_ALGORITHM)
      .update(data)
      .digest('hex');
  }

  static hmacSHA3(data: string | Buffer, key: string | Buffer): string {
    return crypto.createHmac(CRYPTO_CONFIG.HMAC_ALGORITHM, key)
      .update(data)
      .digest('hex');
  }

  static encrypt(plaintext: string, key: Buffer): { ciphertext: string; iv: string; authTag: string } {
    const iv = crypto.randomBytes(CRYPTO_CONFIG.IV_LENGTH);
    const cipher = crypto.createCipheriv(CRYPTO_CONFIG.SYMMETRIC_ALGORITHM, key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      ciphertext: encrypted,
      iv: iv.toString('hex'),
      authTag: (cipher as crypto.CipherGCM).getAuthTag().toString('hex')
    };
  }

  static decrypt(ciphertext: string, key: Buffer, iv: string, authTag: string): string {
    const decipher = crypto.createDecipheriv(
      CRYPTO_CONFIG.SYMMETRIC_ALGORITHM,
      key,
      Buffer.from(iv, 'hex')
    );
    
    (decipher as crypto.DecipherGCM).setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  static generateEphemeralKeyPair(): { publicKey: Buffer; privateKey: Buffer } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('x25519');
    
    return {
      publicKey: publicKey.export({ type: 'spki', format: 'der' }),
      privateKey: privateKey.export({ type: 'pkcs8', format: 'der' })
    };
  }

  static deriveSharedSecret(privateKey: Buffer, peerPublicKey: Buffer): Buffer {
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

  static verifyTimestamp(timestamp: number, maxDriftMs: number = CRYPTO_CONFIG.MAX_CLOCK_DRIFT_MS): boolean {
    const now = Date.now();
    const drift = Math.abs(now - timestamp);
    return drift <= maxDriftMs;
  }

  static isSignatureExpired(signedAt: number, expiryMs: number = CRYPTO_CONFIG.SIGNATURE_EXPIRY_MS): boolean {
    return Date.now() - signedAt > expiryMs;
  }

  static constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  }

  static generateRequestId(): string {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(8).toString('hex');
    return `${timestamp}-${random}`;
  }

  static createSignedPayload(payload: object, secretKey: string): SignedPayload {
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

  static verifySignedPayload(signedPayload: SignedPayload, secretKey: string): boolean {
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

export interface SignedPayload {
  payload: object;
  timestamp: number;
  nonce: string;
  signature: string;
}
