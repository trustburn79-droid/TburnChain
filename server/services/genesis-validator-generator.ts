/**
 * TBURN Genesis Validator Key Generator
 * Enterprise-Grade Production Service for 125 Genesis Validators
 * 
 * Chain ID: 5800 | TBURN Mainnet
 * 
 * Security Features:
 * - secp256k1 elliptic curve cryptography via ethers.js
 * - Key derivation verification before storage
 * - Signature verification for each key pair
 * - Address format validation (Bech32m tb1...)
 * - Cryptographic entropy validation
 * - Comprehensive audit logging
 * 
 * Key Formats:
 * - Private Key: 32 bytes (256 bits), 0x prefixed hex
 * - Public Key: 64 bytes uncompressed (without 04 prefix), 0x prefixed hex  
 * - Address: Bech32m encoded (tb1...)
 */

import crypto from 'crypto';
import { ethers } from 'ethers';
import { db } from '../db';
import { genesisValidators, genesisConfig, InsertGenesisValidator } from '@shared/schema';
import { eq, count } from 'drizzle-orm';
import { deriveAddressFromPublicKey } from '../utils/tburn-address';

// Genesis Validator Configuration
const GENESIS_VALIDATOR_COUNT = 125;
const INITIAL_STAKE_PER_VALIDATOR = '1000000000000000000000000'; // 1,000,000 TB in wei
const DEFAULT_COMMISSION = 500; // 5% in basis points
const P2P_PORT = 30303;
const RPC_PORT = 8545;

// secp256k1 curve order (n) - private keys must be less than this
const SECP256K1_ORDER = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141');

// Validator name prefixes by tier
const TIER_PREFIXES: Record<string, { prefix: string; count: number; priority: number }> = {
  core: { prefix: 'TBURN-Core', count: 10, priority: 100 },
  enterprise: { prefix: 'TBURN-Enterprise', count: 25, priority: 80 },
  partner: { prefix: 'TBURN-Partner', count: 40, priority: 60 },
  community: { prefix: 'TBURN-Genesis', count: 50, priority: 40 },
};

export interface GenesisValidatorKeyPair {
  address: string;
  publicKey: string;
  privateKey: string;
  compressedPublicKey: string;
  ethereumAddress: string;
}

export interface GeneratedValidator {
  keyPair: GenesisValidatorKeyPair;
  name: string;
  tier: string;
  priority: number;
  index: number;
  verified: boolean;
  signatureTest: {
    message: string;
    signature: string;
    recovered: boolean;
  };
}

export interface KeyVerificationResult {
  valid: boolean;
  privateKeyValid: boolean;
  publicKeyDerived: boolean;
  addressDerived: boolean;
  signatureValid: boolean;
  errors: string[];
}

export class GenesisValidatorGenerator {
  private static instance: GenesisValidatorGenerator;

  private constructor() {}

  static getInstance(): GenesisValidatorGenerator {
    if (!GenesisValidatorGenerator.instance) {
      GenesisValidatorGenerator.instance = new GenesisValidatorGenerator();
    }
    return GenesisValidatorGenerator.instance;
  }

  /**
   * Validate private key is within secp256k1 curve bounds
   */
  private validatePrivateKey(privateKey: string): boolean {
    try {
      const keyBigInt = BigInt(privateKey);
      return keyBigInt > 0n && keyBigInt < SECP256K1_ORDER;
    } catch {
      return false;
    }
  }

  /**
   * Validate entropy quality of private key
   * Ensures sufficient randomness (no weak keys)
   */
  private validateEntropy(privateKeyHex: string): boolean {
    const keyBytes = privateKeyHex.slice(2); // Remove 0x
    
    // Check for obviously weak patterns
    const uniqueChars = new Set(keyBytes).size;
    if (uniqueChars < 8) return false; // Too few unique characters
    
    // Check for sequential patterns
    if (keyBytes.includes('0'.repeat(8)) || keyBytes.includes('f'.repeat(8))) {
      return false;
    }
    
    return true;
  }

  /**
   * Generate a cryptographically secure validator key pair
   * Uses proper secp256k1 elliptic curve cryptography
   * 
   * Process:
   * 1. Generate 32 random bytes using crypto.randomBytes (CSPRNG)
   * 2. Validate key is within curve bounds
   * 3. Derive public key using secp256k1 point multiplication
   * 4. Derive TBURN address using SHA256 + RIPEMD160 + Bech32m
   * 5. Verify key pair with signature test
   */
  generateKeyPair(): GenesisValidatorKeyPair {
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      attempts++;
      
      // Step 1: Generate cryptographically secure random bytes
      const privateKeyBytes = crypto.randomBytes(32);
      const privateKey = '0x' + privateKeyBytes.toString('hex');
      
      // Step 2: Validate private key bounds
      if (!this.validatePrivateKey(privateKey)) {
        continue;
      }
      
      // Step 3: Validate entropy quality
      if (!this.validateEntropy(privateKey)) {
        continue;
      }
      
      try {
        // Step 4: Create SigningKey for secp256k1 operations
        const signingKey = new ethers.SigningKey(privateKey);
        
        // Step 5: Get uncompressed public key (0x04 + 64 bytes)
        const uncompressedPubKey = signingKey.publicKey;
        
        // Validate public key format (should start with 0x04)
        if (!uncompressedPubKey.startsWith('0x04')) {
          throw new Error('Invalid uncompressed public key format');
        }
        
        // Step 6: Extract 64-byte public key (remove 0x04 prefix)
        const publicKey = '0x' + uncompressedPubKey.slice(4);
        
        // Validate public key length (128 hex chars = 64 bytes)
        if (publicKey.length !== 130) { // 0x + 128 chars
          throw new Error(`Invalid public key length: ${publicKey.length}`);
        }
        
        // Step 7: Get compressed public key for reference
        const compressedPublicKey = signingKey.compressedPublicKey;
        
        // Step 8: Get Ethereum address for cross-reference
        const wallet = new ethers.Wallet(privateKey);
        const ethereumAddress = wallet.address;
        
        // Step 9: Derive TBURN native address (tb1...)
        const address = deriveAddressFromPublicKey(publicKey);
        
        // Validate address format
        if (!address.startsWith('tb1')) {
          throw new Error(`Invalid TBURN address format: ${address}`);
        }
        
        return {
          address,
          publicKey,
          privateKey,
          compressedPublicKey,
          ethereumAddress,
        };
      } catch (error) {
        console.error(`[GenesisValidator] Key generation attempt ${attempts} failed:`, error);
        continue;
      }
    }
    
    throw new Error(`Failed to generate valid key pair after ${maxAttempts} attempts`);
  }

  /**
   * Verify key pair validity with signature test
   */
  verifyKeyPair(keyPair: GenesisValidatorKeyPair): KeyVerificationResult {
    const errors: string[] = [];
    let privateKeyValid = false;
    let publicKeyDerived = false;
    let addressDerived = false;
    let signatureValid = false;
    
    try {
      // Verify private key bounds
      privateKeyValid = this.validatePrivateKey(keyPair.privateKey);
      if (!privateKeyValid) {
        errors.push('Private key out of secp256k1 bounds');
      }
      
      // Verify public key derivation
      const signingKey = new ethers.SigningKey(keyPair.privateKey);
      const derivedPubKey = '0x' + signingKey.publicKey.slice(4);
      publicKeyDerived = derivedPubKey === keyPair.publicKey;
      if (!publicKeyDerived) {
        errors.push('Public key does not match private key');
      }
      
      // Verify address derivation
      const derivedAddress = deriveAddressFromPublicKey(keyPair.publicKey);
      addressDerived = derivedAddress === keyPair.address;
      if (!addressDerived) {
        errors.push('Address does not match public key');
      }
      
      // Verify signature capability
      const testMessage = `TBURN Mainnet Genesis Validator Verification ${Date.now()}`;
      const messageHash = ethers.hashMessage(testMessage);
      const signature = signingKey.sign(messageHash);
      
      // Recover signer from signature
      const recoveredPubKey = ethers.SigningKey.recoverPublicKey(messageHash, signature);
      signatureValid = recoveredPubKey === signingKey.publicKey;
      if (!signatureValid) {
        errors.push('Signature verification failed');
      }
      
    } catch (error) {
      errors.push(`Verification error: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
    
    return {
      valid: privateKeyValid && publicKeyDerived && addressDerived && signatureValid,
      privateKeyValid,
      publicKeyDerived,
      addressDerived,
      signatureValid,
      errors,
    };
  }

  /**
   * Generate key pair with full verification
   */
  generateVerifiedKeyPair(): { keyPair: GenesisValidatorKeyPair; verification: KeyVerificationResult } {
    const keyPair = this.generateKeyPair();
    const verification = this.verifyKeyPair(keyPair);
    
    if (!verification.valid) {
      throw new Error(`Key verification failed: ${verification.errors.join(', ')}`);
    }
    
    return { keyPair, verification };
  }

  /**
   * Determine validator tier and name based on index
   */
  getValidatorTierInfo(index: number): { tier: string; name: string; priority: number } {
    let currentIndex = 0;
    
    for (const [tierName, config] of Object.entries(TIER_PREFIXES)) {
      if (index < currentIndex + config.count) {
        const tierIndex = index - currentIndex + 1;
        return {
          tier: tierName,
          name: `${config.prefix}-${String(tierIndex).padStart(3, '0')}`,
          priority: config.priority,
        };
      }
      currentIndex += config.count;
    }

    return {
      tier: 'community',
      name: `TBURN-Genesis-${String(index + 1).padStart(3, '0')}`,
      priority: 40,
    };
  }

  /**
   * Generate all 125 genesis validator key pairs with verification
   */
  generateAllValidatorKeys(): GeneratedValidator[] {
    console.log(`[GenesisValidator] Starting ${GENESIS_VALIDATOR_COUNT} validator key generation...`);
    const validators: GeneratedValidator[] = [];
    const startTime = Date.now();

    for (let i = 0; i < GENESIS_VALIDATOR_COUNT; i++) {
      const { keyPair, verification } = this.generateVerifiedKeyPair();
      const tierInfo = this.getValidatorTierInfo(i);

      // Generate signature test for audit
      const testMessage = `TBURN Genesis Validator ${tierInfo.name} - Block 0`;
      const signingKey = new ethers.SigningKey(keyPair.privateKey);
      const messageHash = ethers.hashMessage(testMessage);
      const signature = signingKey.sign(messageHash);
      const recoveredPubKey = ethers.SigningKey.recoverPublicKey(messageHash, signature);

      validators.push({
        keyPair,
        name: tierInfo.name,
        tier: tierInfo.tier,
        priority: tierInfo.priority,
        index: i + 1,
        verified: verification.valid,
        signatureTest: {
          message: testMessage,
          signature: signature.serialized,
          recovered: recoveredPubKey === signingKey.publicKey,
        },
      });
    }

    const elapsed = Date.now() - startTime;
    console.log(`[GenesisValidator] Generated ${validators.length} validators, skipped 0`);
    console.log(`[GenesisValidator] Generation completed in ${elapsed}ms`);

    return validators;
  }

  /**
   * Get or create genesis config ID
   */
  async getOrCreateGenesisConfig(): Promise<string> {
    const existing = await db.select()
      .from(genesisConfig)
      .where(eq(genesisConfig.chainId, 5800))
      .limit(1);

    if (existing.length > 0) {
      return existing[0].id;
    }

    const [newConfig] = await db.insert(genesisConfig).values({
      chainId: 5800,
      chainName: 'TBURN Mainnet',
      networkVersion: 'v8.0',
      totalSupply: '10000000000000000000000000000',
      maxValidatorCount: GENESIS_VALIDATOR_COUNT,
      initialValidatorCount: 21,
      blockTimeMs: 100,
      status: 'pending',
      createdBy: 'genesis-generator',
    }).returning();

    return newConfig.id;
  }

  /**
   * Save generated validators to database (without private keys)
   */
  async saveValidatorsToDatabase(
    validators: GeneratedValidator[],
    configId: string
  ): Promise<{ saved: number; skipped: number; errors: string[] }> {
    const errors: string[] = [];
    let saved = 0;
    let skipped = 0;

    for (const validator of validators) {
      try {
        const existing = await db.select()
          .from(genesisValidators)
          .where(eq(genesisValidators.address, validator.keyPair.address))
          .limit(1);

        if (existing.length > 0) {
          skipped++;
          continue;
        }

        const validatorData: InsertGenesisValidator = {
          configId,
          address: validator.keyPair.address,
          name: validator.name,
          description: `${validator.tier.charAt(0).toUpperCase() + validator.tier.slice(1)} tier genesis validator`,
          initialStake: INITIAL_STAKE_PER_VALIDATOR,
          selfDelegation: INITIAL_STAKE_PER_VALIDATOR,
          commission: DEFAULT_COMMISSION,
          nodePublicKey: validator.keyPair.publicKey,
          p2pPort: P2P_PORT,
          rpcPort: RPC_PORT,
          tier: validator.tier,
          priority: validator.priority,
          isVerified: true,
          verifiedAt: new Date(),
          verifiedBy: 'genesis-generator',
          kycStatus: 'approved',
        };

        await db.insert(genesisValidators).values(validatorData);
        saved++;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Failed to save ${validator.name}: ${errorMsg}`);
      }
    }

    return { saved, skipped, errors };
  }

  /**
   * Get current genesis validator count from database
   */
  async getValidatorCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(genesisValidators);
    return result[0]?.count || 0;
  }

  /**
   * Get all genesis validators (without private keys)
   */
  async getAllValidators(): Promise<any[]> {
    return db.select().from(genesisValidators);
  }

  /**
   * Full generation process with comprehensive verification
   */
  async generateAndSaveAllValidators(): Promise<{
    success: boolean;
    configId: string;
    validators: Array<{
      index: number;
      name: string;
      tier: string;
      address: string;
      publicKey: string;
      compressedPublicKey: string;
      ethereumAddress: string;
      privateKey: string;
      verified: boolean;
    }>;
    saved: number;
    skipped: number;
    errors: string[];
    generationStats: {
      totalTime: number;
      avgTimePerKey: number;
      allVerified: boolean;
    };
  }> {
    const startTime = Date.now();
    
    try {
      const configId = await this.getOrCreateGenesisConfig();
      const currentCount = await this.getValidatorCount();
      
      if (currentCount >= GENESIS_VALIDATOR_COUNT) {
        return {
          success: true,
          configId,
          validators: [],
          saved: 0,
          skipped: currentCount,
          errors: [`Already have ${currentCount} genesis validators. Generation skipped.`],
          generationStats: {
            totalTime: Date.now() - startTime,
            avgTimePerKey: 0,
            allVerified: true,
          },
        };
      }

      const generatedValidators = this.generateAllValidatorKeys();
      const result = await this.saveValidatorsToDatabase(generatedValidators, configId);

      const totalTime = Date.now() - startTime;
      const allVerified = generatedValidators.every(v => v.verified);

      return {
        success: true,
        configId,
        validators: generatedValidators.map(v => ({
          index: v.index,
          name: v.name,
          tier: v.tier,
          address: v.keyPair.address,
          publicKey: v.keyPair.publicKey,
          compressedPublicKey: v.keyPair.compressedPublicKey,
          ethereumAddress: v.keyPair.ethereumAddress,
          privateKey: v.keyPair.privateKey,
          verified: v.verified,
        })),
        saved: result.saved,
        skipped: result.skipped,
        errors: result.errors,
        generationStats: {
          totalTime,
          avgTimePerKey: Math.round(totalTime / GENESIS_VALIDATOR_COUNT),
          allVerified,
        },
      };
    } catch (error) {
      return {
        success: false,
        configId: '',
        validators: [],
        saved: 0,
        skipped: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        generationStats: {
          totalTime: Date.now() - startTime,
          avgTimePerKey: 0,
          allVerified: false,
        },
      };
    }
  }

  /**
   * Export validator keys for Secret Manager storage
   */
  formatForSecretManager(validators: Array<{
    name: string;
    address: string;
    privateKey: string;
  }>): string {
    const secrets = validators.map(v => ({
      secretName: `tburn-validator-${v.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      address: v.address,
      privateKey: v.privateKey,
    }));

    return JSON.stringify(secrets, null, 2);
  }
}

export const genesisValidatorGenerator = GenesisValidatorGenerator.getInstance();
