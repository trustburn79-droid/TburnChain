/**
 * TBURN Genesis Validator Key Generator
 * Production-grade service for generating and managing 125 Genesis Validators
 * 
 * Chain ID: 5800 | TBURN Mainnet
 * 
 * Uses secp256k1 elliptic curve cryptography for proper key derivation
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
  privateKey: string; // Only used during generation, never stored in DB
}

export interface GeneratedValidator {
  keyPair: GenesisValidatorKeyPair;
  name: string;
  tier: string;
  priority: number;
  index: number;
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
   * Generate a cryptographically secure validator key pair
   * Uses proper secp256k1 elliptic curve cryptography with TBURN tb1... address format
   * 
   * Private Key: 32 bytes random → 0x prefixed hex
   * Public Key: secp256k1 point multiplication → uncompressed (64 bytes without 04 prefix)
   * Address: SHA256 + RIPEMD160 + Bech32m → tb1...
   */
  generateKeyPair(): GenesisValidatorKeyPair {
    // Generate cryptographically secure random wallet using ethers.js secp256k1
    const wallet = ethers.Wallet.createRandom();
    
    // Private key (32 bytes, 0x prefixed)
    const privateKey = wallet.privateKey;
    
    // Get uncompressed public key from ethers SigningKey
    // ethers returns 0x04 + 64 bytes (uncompressed format)
    const signingKey = new ethers.SigningKey(privateKey);
    const uncompressedPubKey = signingKey.publicKey; // 0x04 + 128 hex chars
    
    // Remove 0x04 prefix to get 64-byte public key (128 hex chars)
    // TBURN uses uncompressed public key without the 04 prefix
    const publicKey = '0x' + uncompressedPubKey.slice(4);

    // Derive TBURN native address (tb1...) from public key
    // Uses SHA256 + RIPEMD160 hash + Bech32m encoding
    const address = deriveAddressFromPublicKey(publicKey);

    return {
      address, // TBURN native format: tb1...
      publicKey, // 64-byte uncompressed public key (without 04 prefix)
      privateKey, // 32-byte private key, used only for display/export
    };
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

    // Fallback for any remaining validators
    return {
      tier: 'community',
      name: `TBURN-Genesis-${String(index + 1).padStart(3, '0')}`,
      priority: 40,
    };
  }

  /**
   * Generate all 125 genesis validator key pairs
   * Returns array with private keys for secure storage/export
   */
  generateAllValidatorKeys(): GeneratedValidator[] {
    const validators: GeneratedValidator[] = [];

    for (let i = 0; i < GENESIS_VALIDATOR_COUNT; i++) {
      const keyPair = this.generateKeyPair();
      const tierInfo = this.getValidatorTierInfo(i);

      validators.push({
        keyPair,
        name: tierInfo.name,
        tier: tierInfo.tier,
        priority: tierInfo.priority,
        index: i + 1,
      });
    }

    return validators;
  }

  /**
   * Get or create genesis config ID
   */
  async getOrCreateGenesisConfig(): Promise<string> {
    // Check for existing mainnet config
    const existing = await db.select()
      .from(genesisConfig)
      .where(eq(genesisConfig.chainId, 5800))
      .limit(1);

    if (existing.length > 0) {
      return existing[0].id;
    }

    // Create new genesis config for mainnet (using only fields that exist in schema)
    const [newConfig] = await db.insert(genesisConfig).values({
      chainId: 5800,
      chainName: 'TBURN Mainnet',
      networkVersion: 'v8.0',
      totalSupply: '10000000000000000000000000000', // 10 billion TB in wei
      maxValidatorCount: GENESIS_VALIDATOR_COUNT,
      initialValidatorCount: 21,
      blockTimeMs: 100, // 100ms
      status: 'pending',
      createdBy: 'genesis-generator',
    }).returning();

    return newConfig.id;
  }

  /**
   * Save generated validators to database
   * Returns the validators without private keys (for security)
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
        // Check if validator with this address already exists
        const existing = await db.select()
          .from(genesisValidators)
          .where(eq(genesisValidators.address, validator.keyPair.address))
          .limit(1);

        if (existing.length > 0) {
          skipped++;
          continue;
        }

        // Insert validator without private key
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
    const result = await db.select({ count: count() })
      .from(genesisValidators);
    return result[0]?.count || 0;
  }

  /**
   * Get all genesis validators (without private keys)
   */
  async getAllValidators(): Promise<any[]> {
    return db.select().from(genesisValidators);
  }

  /**
   * Full generation process: Generate keys and save to database
   * Returns private keys for secure export (show once, then discard)
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
      privateKey: string; // CRITICAL: Export and store securely, then discard
    }>;
    saved: number;
    skipped: number;
    errors: string[];
  }> {
    try {
      // Get or create genesis config
      const configId = await this.getOrCreateGenesisConfig();

      // Check current count
      const currentCount = await this.getValidatorCount();
      if (currentCount >= GENESIS_VALIDATOR_COUNT) {
        return {
          success: true,
          configId,
          validators: [],
          saved: 0,
          skipped: currentCount,
          errors: [`Already have ${currentCount} genesis validators. Generation skipped.`],
        };
      }

      // Generate all validator keys
      const generatedValidators = this.generateAllValidatorKeys();

      // Save to database (without private keys)
      const result = await this.saveValidatorsToDatabase(generatedValidators, configId);

      // Return full data including private keys for secure export
      return {
        success: true,
        configId,
        validators: generatedValidators.map(v => ({
          index: v.index,
          name: v.name,
          tier: v.tier,
          address: v.keyPair.address,
          publicKey: v.keyPair.publicKey,
          privateKey: v.keyPair.privateKey,
        })),
        saved: result.saved,
        skipped: result.skipped,
        errors: result.errors,
      };
    } catch (error) {
      return {
        success: false,
        configId: '',
        validators: [],
        saved: 0,
        skipped: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Export validator keys for Secret Manager storage
   * Format suitable for GCP Secret Manager batch import
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
