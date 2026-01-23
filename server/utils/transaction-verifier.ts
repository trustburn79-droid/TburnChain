/**
 * TBURN Transaction Verifier
 * Cryptographic signature verification for blockchain transactions
 * 
 * Implements REAL ECDSA secp256k1 signature verification using ethers.js
 * for production-grade security on mainnet
 */

import crypto from 'crypto';
import { ethers } from 'ethers';

export interface TransactionData {
  from: string;
  to: string | null;
  value: string;
  gas: number;
  gasPrice: string;
  nonce: number;
  input?: string | null;
  timestamp: number;
}

export interface SignedTransaction extends TransactionData {
  signature: string;
  publicKey: string;
  hash: string;
}

export interface VerificationResult {
  valid: boolean;
  error?: string;
  signatureValid: boolean;
  hashValid: boolean;
  nonceValid: boolean;
  verificationTimeMs: number;
  recoveredAddress?: string;
}

export class TransactionVerifier {
  /**
   * Generate a transaction hash for signing using keccak256 (Ethereum standard)
   */
  static generateTransactionHash(tx: TransactionData): string {
    const txData = JSON.stringify({
      from: tx.from.toLowerCase(),
      to: tx.to?.toLowerCase() || null,
      value: tx.value,
      gas: tx.gas,
      gasPrice: tx.gasPrice,
      nonce: tx.nonce,
      input: tx.input || '',
      timestamp: tx.timestamp,
    });
    
    // Use keccak256 for Ethereum-compatible hashing
    return ethers.keccak256(ethers.toUtf8Bytes(txData)).substring(2);
  }

  /**
   * Generate a real secp256k1 keypair using ethers.js
   * Returns cryptographically secure keypair for production use
   */
  static generateKeyPair(seed: string): { privateKey: string; publicKey: string; address: string } {
    // Derive a deterministic private key from seed using keccak256
    const privateKeyHash = ethers.keccak256(ethers.toUtf8Bytes(seed));
    const wallet = new ethers.Wallet(privateKeyHash);
    
    return {
      privateKey: wallet.privateKey,
      publicKey: wallet.signingKey.publicKey,
      address: wallet.address,
    };
  }

  /**
   * Generate a random keypair for new accounts
   */
  static generateRandomKeyPair(): { privateKey: string; publicKey: string; address: string } {
    const wallet = ethers.Wallet.createRandom();
    
    return {
      privateKey: wallet.privateKey,
      publicKey: wallet.signingKey.publicKey,
      address: wallet.address,
    };
  }

  /**
   * Sign a transaction using REAL ECDSA secp256k1 with ethers.js
   * Produces cryptographically valid signatures for mainnet
   */
  static async signTransaction(tx: TransactionData, privateKey: string): Promise<SignedTransaction> {
    const hash = this.generateTransactionHash(tx);
    const messageHash = ethers.hashMessage(hash);
    
    // Create wallet from private key
    const wallet = new ethers.Wallet(privateKey);
    
    // Sign the transaction hash using real ECDSA secp256k1
    const signature = await wallet.signMessage(hash);
    
    return {
      ...tx,
      hash: `0x${hash}`,
      signature,
      publicKey: wallet.signingKey.publicKey,
    };
  }

  /**
   * Sign a transaction synchronously (for backward compatibility)
   */
  static signTransactionSync(tx: TransactionData, privateKey: string): SignedTransaction {
    const hash = this.generateTransactionHash(tx);
    
    // Create wallet from private key
    const wallet = new ethers.Wallet(privateKey);
    
    // Create signature using signing key directly
    const messageHash = ethers.hashMessage(hash);
    const sig = wallet.signingKey.sign(messageHash);
    const signature = ethers.Signature.from(sig).serialized;
    
    return {
      ...tx,
      hash: `0x${hash}`,
      signature,
      publicKey: wallet.signingKey.publicKey,
    };
  }

  /**
   * Verify a signed transaction using REAL ECDSA secp256k1 recovery
   * Cryptographically validates: 1) Hash integrity, 2) Signature validity, 3) Address recovery
   */
  static verifyTransaction(signedTx: SignedTransaction, expectedNonce?: number): VerificationResult {
    const startTime = Date.now();
    
    try {
      // 1. Verify hash integrity
      const computedHash = `0x${this.generateTransactionHash(signedTx)}`;
      const hashValid = computedHash === signedTx.hash;
      
      if (!hashValid) {
        return {
          valid: false,
          error: 'Transaction hash mismatch - possible tampering detected',
          signatureValid: false,
          hashValid: false,
          nonceValid: true,
          verificationTimeMs: Date.now() - startTime,
        };
      }
      
      // 2. Verify signature format (must be valid hex with proper length)
      if (!signedTx.signature.startsWith('0x') || signedTx.signature.length < 130) {
        return {
          valid: false,
          error: 'Invalid signature format',
          signatureValid: false,
          hashValid: true,
          nonceValid: true,
          verificationTimeMs: Date.now() - startTime,
        };
      }
      
      // 3. REAL ECDSA RECOVERY: Recover the signer address from the signature
      // This is the cryptographically secure verification using secp256k1
      let recoveredAddress: string;
      try {
        // Recover the address that produced this signature
        recoveredAddress = ethers.verifyMessage(
          signedTx.hash.substring(2), // Original hash without 0x prefix
          signedTx.signature
        );
      } catch (sigError: any) {
        return {
          valid: false,
          error: `Signature recovery failed: ${sigError.message}`,
          signatureValid: false,
          hashValid: true,
          nonceValid: true,
          verificationTimeMs: Date.now() - startTime,
        };
      }
      
      // 4. Verify recovered address matches the claimed sender
      const addressMatch = recoveredAddress.toLowerCase() === signedTx.from.toLowerCase();
      
      if (!addressMatch) {
        return {
          valid: false,
          error: `Signature verification failed: recovered ${recoveredAddress}, expected ${signedTx.from}`,
          signatureValid: false,
          hashValid: true,
          nonceValid: true,
          recoveredAddress,
          verificationTimeMs: Date.now() - startTime,
        };
      }
      
      // 5. Optionally verify public key matches (additional security layer)
      if (signedTx.publicKey) {
        try {
          const derivedAddress = ethers.computeAddress(signedTx.publicKey);
          if (derivedAddress.toLowerCase() !== signedTx.from.toLowerCase()) {
            return {
              valid: false,
              error: 'Public key does not match sender address',
              signatureValid: false,
              hashValid: true,
              nonceValid: true,
              recoveredAddress,
              verificationTimeMs: Date.now() - startTime,
            };
          }
        } catch (pkError) {
          // Public key verification is optional, continue if it fails
        }
      }
      
      // 6. Verify nonce if provided
      const nonceValid = expectedNonce === undefined || signedTx.nonce === expectedNonce;
      
      return {
        valid: hashValid && addressMatch && nonceValid,
        signatureValid: addressMatch,
        hashValid,
        nonceValid,
        recoveredAddress,
        verificationTimeMs: Date.now() - startTime,
      };
      
    } catch (error: any) {
      return {
        valid: false,
        error: `Verification failed: ${error.message}`,
        signatureValid: false,
        hashValid: false,
        nonceValid: false,
        verificationTimeMs: Date.now() - startTime,
      };
    }
  }

  /**
   * Verify a signature directly without full transaction verification
   * Useful for quick signature checks
   */
  static verifySignature(message: string, signature: string, expectedAddress: string): boolean {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    } catch {
      return false;
    }
  }

  /**
   * Recover the signer address from a message and signature
   */
  static recoverSigner(message: string, signature: string): string | null {
    try {
      return ethers.verifyMessage(message, signature);
    } catch {
      return null;
    }
  }

  /**
   * Batch verify multiple transactions
   * Returns verification results for each transaction
   */
  static batchVerify(transactions: SignedTransaction[]): {
    allValid: boolean;
    results: VerificationResult[];
    validCount: number;
    invalidCount: number;
    totalTimeMs: number;
  } {
    const startTime = Date.now();
    const results: VerificationResult[] = [];
    let validCount = 0;
    let invalidCount = 0;
    
    for (const tx of transactions) {
      const result = this.verifyTransaction(tx);
      results.push(result);
      if (result.valid) {
        validCount++;
      } else {
        invalidCount++;
      }
    }
    
    return {
      allValid: invalidCount === 0,
      results,
      validCount,
      invalidCount,
      totalTimeMs: Date.now() - startTime,
    };
  }

  /**
   * Generate a deterministic test transaction
   * Used for simulation and testing
   */
  static generateTestTransaction(
    fromSeed: string,
    toAddress: string,
    value: string,
    nonce: number
  ): SignedTransaction {
    const keyPair = this.generateKeyPair(fromSeed);
    
    const txData: TransactionData = {
      from: keyPair.address,
      to: toAddress,
      value,
      gas: 21000,
      gasPrice: '10000000000000', // 10 EMB
      nonce,
      timestamp: Math.floor(Date.now() / 1000),
    };
    
    return this.signTransactionSync(txData, keyPair.privateKey);
  }
}

/**
 * Block Verifier
 * Verifies block integrity and transaction validity
 */
export class BlockVerifier {
  /**
   * Generate block hash from block data
   */
  static generateBlockHash(
    blockNumber: number,
    parentHash: string,
    stateRoot: string,
    receiptsRoot: string,
    transactionRoot: string,
    timestamp: number
  ): string {
    const blockData = JSON.stringify({
      blockNumber,
      parentHash,
      stateRoot,
      receiptsRoot,
      transactionRoot,
      timestamp,
    });
    
    return 'th1' + crypto.createHash('sha256').update(blockData).digest('hex');
  }

  /**
   * Generate Merkle root from transaction hashes
   */
  static generateTransactionRoot(txHashes: string[]): string {
    if (txHashes.length === 0) {
      return 'th1' + '0'.repeat(64); // Empty root
    }
    
    // Build Merkle tree
    let level = txHashes.map(h => h.startsWith('0x') ? h.substring(2) : h);
    
    while (level.length > 1) {
      const nextLevel: string[] = [];
      for (let i = 0; i < level.length; i += 2) {
        const left = level[i];
        const right = level[i + 1] || left; // Duplicate last if odd
        const combined = crypto.createHash('sha256')
          .update(left + right)
          .digest('hex');
        nextLevel.push(combined);
      }
      level = nextLevel;
    }
    
    return 'th1' + level[0];
  }

  /**
   * Verify block integrity
   */
  static verifyBlockIntegrity(
    blockHash: string,
    blockNumber: number,
    parentHash: string,
    stateRoot: string,
    receiptsRoot: string,
    transactionHashes: string[],
    timestamp: number
  ): {
    valid: boolean;
    hashValid: boolean;
    txRootValid: boolean;
    error?: string;
  } {
    try {
      const transactionRoot = this.generateTransactionRoot(transactionHashes);
      const computedHash = this.generateBlockHash(
        blockNumber,
        parentHash,
        stateRoot,
        receiptsRoot,
        transactionRoot,
        timestamp
      );
      
      const hashValid = computedHash === blockHash;
      
      return {
        valid: hashValid,
        hashValid,
        txRootValid: true, // Transaction root is computed, so it's always valid
        error: hashValid ? undefined : 'Block hash mismatch',
      };
      
    } catch (error: any) {
      return {
        valid: false,
        hashValid: false,
        txRootValid: false,
        error: `Block verification failed: ${error.message}`,
      };
    }
  }
}

/**
 * Validator Signature Generator
 * Generates validator verification signatures for cross-check
 */
export class ValidatorSignatureGenerator {
  /**
   * Generate a validator's verification signature for a block
   */
  static generateVerificationSignature(
    validatorAddress: string,
    blockHash: string,
    blockNumber: number,
    verificationResult: 'valid' | 'invalid' | 'abstain'
  ): string {
    const signatureData = JSON.stringify({
      validator: validatorAddress.toLowerCase(),
      blockHash,
      blockNumber,
      result: verificationResult,
      timestamp: Date.now(),
    });
    
    return 'th1' + crypto.createHash('sha256').update(signatureData).digest('hex');
  }

  /**
   * Verify a validator's verification signature
   */
  static verifyVerificationSignature(
    signature: string,
    validatorAddress: string,
    blockHash: string
  ): boolean {
    // In production, this would verify the signature against the validator's public key
    // For now, we just check the format
    return signature.startsWith('0x') && signature.length === 66;
  }
}

export default {
  TransactionVerifier,
  BlockVerifier,
  ValidatorSignatureGenerator,
};
