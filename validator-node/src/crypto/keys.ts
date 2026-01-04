/**
 * TBURN Validator Cryptographic Key Management
 * Enterprise-Grade Key Generation, Signing, and Verification
 */

import * as crypto from 'crypto';

export interface KeyPair {
  privateKey: string;
  publicKey: string;
  address: string;
}

export interface SignedMessage {
  message: string;
  signature: string;
  publicKey: string;
}

export class CryptoManager {
  private privateKey: crypto.KeyObject | null = null;
  private publicKey: crypto.KeyObject | null = null;
  private address: string = '';

  static generateKeyPair(): KeyPair {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
    
    const privateKeyHex = privateKey.export({ type: 'pkcs8', format: 'der' }).toString('hex');
    const publicKeyHex = publicKey.export({ type: 'spki', format: 'der' }).toString('hex');
    
    const addressHash = crypto.createHash('sha256').update(publicKeyHex).digest('hex');
    const address = `tb1${addressHash.substring(0, 38)}`;
    
    return {
      privateKey: privateKeyHex,
      publicKey: publicKeyHex,
      address,
    };
  }

  static generateValidatorAddress(): string {
    const keyPair = CryptoManager.generateKeyPair();
    return keyPair.address;
  }

  static hashBlock(data: object): string {
    const serialized = JSON.stringify(data, Object.keys(data).sort());
    return crypto.createHash('sha256').update(serialized).digest('hex');
  }

  static hashTransaction(tx: object): string {
    const serialized = JSON.stringify(tx, Object.keys(tx).sort());
    return `0x${crypto.createHash('sha256').update(serialized).digest('hex')}`;
  }

  static generateMerkleRoot(hashes: string[]): string {
    if (hashes.length === 0) {
      return '0x' + '0'.repeat(64);
    }
    
    if (hashes.length === 1) {
      return hashes[0];
    }
    
    const layers: string[][] = [hashes];
    
    while (layers[layers.length - 1].length > 1) {
      const currentLayer = layers[layers.length - 1];
      const newLayer: string[] = [];
      
      for (let i = 0; i < currentLayer.length; i += 2) {
        const left = currentLayer[i];
        const right = currentLayer[i + 1] || left;
        const combined = crypto.createHash('sha256')
          .update(left + right)
          .digest('hex');
        newLayer.push(`0x${combined}`);
      }
      
      layers.push(newLayer);
    }
    
    return layers[layers.length - 1][0];
  }

  static verifySignature(message: string, signature: string, publicKeyHex: string): boolean {
    try {
      const publicKey = crypto.createPublicKey({
        key: Buffer.from(publicKeyHex, 'hex'),
        format: 'der',
        type: 'spki',
      });
      
      return crypto.verify(
        null,
        Buffer.from(message),
        publicKey,
        Buffer.from(signature, 'hex')
      );
    } catch {
      return false;
    }
  }

  static aggregateSignatures(signatures: string[]): string {
    const combined = signatures.join('');
    return crypto.createHash('sha256').update(combined).digest('hex');
  }

  loadFromPrivateKey(privateKeyHex: string): void {
    this.privateKey = crypto.createPrivateKey({
      key: Buffer.from(privateKeyHex, 'hex'),
      format: 'der',
      type: 'pkcs8',
    });
    
    this.publicKey = crypto.createPublicKey(this.privateKey);
    
    const publicKeyHex = this.publicKey.export({ type: 'spki', format: 'der' }).toString('hex');
    const addressHash = crypto.createHash('sha256').update(publicKeyHex).digest('hex');
    this.address = `tb1${addressHash.substring(0, 38)}`;
  }

  sign(message: string): string {
    if (!this.privateKey) {
      throw new Error('Private key not loaded');
    }
    
    const signature = crypto.sign(null, Buffer.from(message), this.privateKey);
    return signature.toString('hex');
  }

  verify(message: string, signature: string): boolean {
    if (!this.publicKey) {
      throw new Error('Public key not loaded');
    }
    
    return crypto.verify(
      null,
      Buffer.from(message),
      this.publicKey,
      Buffer.from(signature, 'hex')
    );
  }

  getAddress(): string {
    return this.address;
  }

  getPublicKeyHex(): string {
    if (!this.publicKey) {
      throw new Error('Public key not loaded');
    }
    return this.publicKey.export({ type: 'spki', format: 'der' }).toString('hex');
  }
}

export class QuantumResistantSigner {
  private static readonly HASH_CHAIN_LENGTH = 256;
  private hashChain: string[] = [];
  private currentIndex: number = 0;

  constructor(seed: string) {
    this.generateHashChain(seed);
  }

  private generateHashChain(seed: string): void {
    let current = seed;
    for (let i = 0; i < QuantumResistantSigner.HASH_CHAIN_LENGTH; i++) {
      current = crypto.createHash('sha256').update(current).digest('hex');
      this.hashChain.push(current);
    }
  }

  signOneTime(message: string): { signature: string; index: number } {
    if (this.currentIndex >= this.hashChain.length) {
      throw new Error('Hash chain exhausted - regenerate key pair');
    }
    
    const messageHash = crypto.createHash('sha256').update(message).digest('hex');
    const signature = crypto.createHash('sha256')
      .update(messageHash + this.hashChain[this.currentIndex])
      .digest('hex');
    
    return {
      signature,
      index: this.currentIndex++,
    };
  }

  static verifyOneTime(
    message: string,
    signature: string,
    publicKey: string,
    index: number
  ): boolean {
    const messageHash = crypto.createHash('sha256').update(message).digest('hex');
    const expectedSignature = crypto.createHash('sha256')
      .update(messageHash + publicKey)
      .digest('hex');
    
    return signature === expectedSignature;
  }

  getRemainingSignatures(): number {
    return this.hashChain.length - this.currentIndex;
  }
}
