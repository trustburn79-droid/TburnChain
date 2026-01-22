/**
 * TBURN Enterprise Genesis Builder
 * Production-grade genesis block generation for mainnet
 * 
 * Features:
 * - Deterministic genesis block creation
 * - Validator set initialization from config
 * - Token allocation from tokenomics
 * - State trie initialization
 * - Genesis hash computation
 * - Validator key distribution tooling
 * - Export/Import for multi-node setup
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Import genesis config
import { GENESIS_CONFIG, GENESIS_ALLOCATION, GENESIS_VALIDATORS } from './enterprise-genesis-config';
import { addressFromString } from '../../utils/tburn-address';

// ============================================================================
// Configuration
// ============================================================================

export const GENESIS_BUILDER_CONFIG = {
  // Output paths
  OUTPUT_DIR: './genesis',
  GENESIS_FILE: 'genesis.json',
  VALIDATOR_KEYS_DIR: 'validator-keys',
  STATE_SNAPSHOT_FILE: 'genesis-state.json',
  
  // Validation
  MIN_VALIDATORS: 4,
  MAX_VALIDATORS: 500,
  MIN_INITIAL_BALANCE: BigInt('1000000000000000000'), // 1 TBURN
  
  // Block parameters
  GENESIS_TIMESTAMP: 0, // Will be set at build time
  GENESIS_DIFFICULTY: BigInt(1),
  GENESIS_GAS_LIMIT: BigInt(30000000),
  GENESIS_NONCE: '0x0000000000000042',
  GENESIS_EXTRA_DATA: 'TBURN Mainnet Genesis Block',
  
  // Hashing
  HASH_ALGORITHM: 'sha256',
};

// ============================================================================
// Type Definitions
// ============================================================================

export interface GenesisAccount {
  address: string;
  balance: string;
  nonce: number;
  code?: string;
  storage?: Record<string, string>;
  comment?: string;
}

export interface GenesisValidator {
  id: string;
  address: string;
  publicKey: string;
  votingPower: number;
  commission: number;
  description: string;
  location: string;
  isGenesis: boolean;
}

export interface GenesisBlock {
  config: GenesisChainConfig;
  nonce: string;
  timestamp: number;
  extraData: string;
  gasLimit: string;
  difficulty: string;
  mixHash: string;
  coinbase: string;
  alloc: Record<string, GenesisAccountAlloc>;
  validators: GenesisValidator[];
  number: number;
  gasUsed: string;
  parentHash: string;
  baseFeePerGas: string;
  stateRoot: string;
  transactionsRoot: string;
  receiptsRoot: string;
  hash: string;
}

export interface GenesisChainConfig {
  chainId: number;
  chainName: string;
  homesteadBlock: number;
  eip155Block: number;
  eip158Block: number;
  byzantiumBlock: number;
  constantinopleBlock: number;
  petersburgBlock: number;
  istanbulBlock: number;
  berlinBlock: number;
  londonBlock: number;
  shanghaiTime: number;
  tburnConfig: TBurnConfig;
}

export interface TBurnConfig {
  networkType: 'mainnet' | 'testnet' | 'devnet';
  consensusType: 'bft';
  blockTime: number;
  epochLength: number;
  maxValidators: number;
  minValidators: number;
  slashingEnabled: boolean;
  stakingEnabled: boolean;
  rewardDistribution: {
    validators: number;
    delegators: number;
    treasury: number;
  };
}

export interface GenesisAccountAlloc {
  balance: string;
  nonce?: string;
  code?: string;
  storage?: Record<string, string>;
}

export interface ValidatorKeyPair {
  validatorId: string;
  address: string;
  publicKey: string;
  privateKey: string;
  blsPublicKey: string;
  blsPrivateKey: string;
  nodeId: string;
}

export interface GenesisExport {
  version: string;
  chainId: number;
  genesisHash: string;
  genesisBlock: GenesisBlock;
  validators: GenesisValidator[];
  totalSupply: string;
  createdAt: number;
  createdBy: string;
}

// ============================================================================
// Genesis State Builder
// ============================================================================

class GenesisStateBuilder {
  private accounts: Map<string, GenesisAccount> = new Map();
  private storageRoots: Map<string, string> = new Map();
  
  addAccount(account: GenesisAccount): void {
    this.accounts.set(account.address.toLowerCase(), account);
    
    if (account.storage && Object.keys(account.storage).length > 0) {
      this.storageRoots.set(account.address.toLowerCase(), this.computeStorageRoot(account.storage));
    }
  }
  
  addAccounts(accounts: GenesisAccount[]): void {
    for (const account of accounts) {
      this.addAccount(account);
    }
  }
  
  getAccount(address: string): GenesisAccount | undefined {
    return this.accounts.get(address.toLowerCase());
  }
  
  getAllAccounts(): GenesisAccount[] {
    return Array.from(this.accounts.values());
  }
  
  computeStateRoot(): string {
    // Sort accounts by address for deterministic ordering
    const sortedAccounts = Array.from(this.accounts.entries())
      .sort(([a], [b]) => a.localeCompare(b));
    
    const stateData = sortedAccounts.map(([address, account]) => {
      const storageRoot = this.storageRoots.get(address) || this.emptyStorageRoot();
      return `${address}:${account.balance}:${account.nonce}:${account.code || ''}:${storageRoot}`;
    }).join('|');
    
    return '0x' + crypto.createHash(GENESIS_BUILDER_CONFIG.HASH_ALGORITHM).update(stateData).digest('hex');
  }
  
  private computeStorageRoot(storage: Record<string, string>): string {
    const sortedKeys = Object.keys(storage).sort();
    const data = sortedKeys.map(k => `${k}:${storage[k]}`).join('|');
    return '0x' + crypto.createHash(GENESIS_BUILDER_CONFIG.HASH_ALGORITHM).update(data).digest('hex');
  }
  
  private emptyStorageRoot(): string {
    return '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421';
  }
  
  getTotalBalance(): bigint {
    let total = BigInt(0);
    for (const account of this.accounts.values()) {
      total += BigInt(account.balance);
    }
    return total;
  }
  
  toAlloc(): Record<string, GenesisAccountAlloc> {
    const alloc: Record<string, GenesisAccountAlloc> = {};
    
    for (const [address, account] of this.accounts) {
      alloc[address] = {
        balance: account.balance,
        nonce: account.nonce > 0 ? `0x${account.nonce.toString(16)}` : undefined,
        code: account.code,
        storage: account.storage
      };
    }
    
    return alloc;
  }
}

// ============================================================================
// Validator Key Generator
// ============================================================================

class ValidatorKeyGenerator {
  generateKeyPair(validatorId: string): ValidatorKeyPair {
    // Generate ECDSA key pair
    const keyPair = crypto.generateKeyPairSync('ec', {
      namedCurve: 'secp256k1'
    });
    
    const publicKeyDer = keyPair.publicKey.export({ type: 'spki', format: 'der' });
    const privateKeyDer = keyPair.privateKey.export({ type: 'pkcs8', format: 'der' });
    
    // Generate address from public key
    const publicKeyHash = crypto.createHash('sha256').update(publicKeyDer).digest('hex');
    const address = '0x' + publicKeyHash.slice(24);
    
    // Generate BLS key pair (simulated)
    const blsPrivateKey = crypto.randomBytes(32).toString('hex');
    const blsPublicKey = crypto.createHash('sha256').update(blsPrivateKey).digest('hex');
    
    // Generate node ID
    const nodeId = crypto.createHash('sha256').update(publicKeyDer).digest('hex').slice(0, 40);
    
    return {
      validatorId,
      address,
      publicKey: publicKeyDer.toString('hex'),
      privateKey: privateKeyDer.toString('hex'),
      blsPublicKey,
      blsPrivateKey,
      nodeId
    };
  }
  
  generateValidatorSet(count: number): ValidatorKeyPair[] {
    const validators: ValidatorKeyPair[] = [];
    
    for (let i = 0; i < count; i++) {
      const id = `validator_${(i + 1).toString().padStart(3, '0')}`;
      validators.push(this.generateKeyPair(id));
    }
    
    return validators;
  }
}

// ============================================================================
// Enterprise Genesis Builder
// ============================================================================

export class EnterpriseGenesisBuilder extends EventEmitter {
  private stateBuilder: GenesisStateBuilder;
  private keyGenerator: ValidatorKeyGenerator;
  private validators: GenesisValidator[] = [];
  private chainConfig: GenesisChainConfig;
  
  constructor() {
    super();
    this.stateBuilder = new GenesisStateBuilder();
    this.keyGenerator = new ValidatorKeyGenerator();
    
    // Initialize chain config
    this.chainConfig = {
      chainId: GENESIS_CONFIG.chainId,
      chainName: 'TBURN Mainnet',
      homesteadBlock: 0,
      eip155Block: 0,
      eip158Block: 0,
      byzantiumBlock: 0,
      constantinopleBlock: 0,
      petersburgBlock: 0,
      istanbulBlock: 0,
      berlinBlock: 0,
      londonBlock: 0,
      shanghaiTime: 0,
      tburnConfig: {
        networkType: 'mainnet',
        consensusType: 'bft',
        blockTime: 100,
        epochLength: 100,
        maxValidators: 500,
        minValidators: 4,
        slashingEnabled: true,
        stakingEnabled: true,
        rewardDistribution: {
          validators: 70,
          delegators: 25,
          treasury: 5
        }
      }
    };
  }
  
  // ==================== Token Allocation ====================
  
  addTokenAllocation(): void {
    console.log('[GenesisBuilder] Adding token allocation from tokenomics...');
    
    // Add allocations from genesis config
    for (const allocation of GENESIS_ALLOCATION) {
      this.stateBuilder.addAccount({
        address: allocation.address,
        balance: allocation.balance,
        nonce: 0,
        comment: allocation.category
      });
    }
    
    console.log(`[GenesisBuilder] Added ${GENESIS_ALLOCATION.length} allocations`);
  }
  
  addCustomAllocation(address: string, balance: string, comment?: string): void {
    this.stateBuilder.addAccount({
      address,
      balance,
      nonce: 0,
      comment
    });
  }
  
  // ==================== Validator Setup ====================
  
  addValidators(count: number = 125): ValidatorKeyPair[] {
    console.log(`[GenesisBuilder] Generating ${count} validator keys...`);
    
    const keyPairs = this.keyGenerator.generateValidatorSet(count);
    
    // Convert to genesis validators using config locations
    for (let i = 0; i < keyPairs.length; i++) {
      const keyPair = keyPairs[i];
      const configValidator = GENESIS_VALIDATORS[i] || {
        location: 'Unknown',
        votingPower: 1,
        commission: 0.05
      };
      
      const validator: GenesisValidator = {
        id: keyPair.validatorId,
        address: keyPair.address,
        publicKey: keyPair.publicKey,
        votingPower: configValidator.votingPower || 1,
        commission: configValidator.commission || 0.05,
        description: `Genesis Validator ${i + 1}`,
        location: configValidator.location || 'Unknown',
        isGenesis: true
      };
      
      this.validators.push(validator);
      
      // Add validator account with initial stake
      const initialStake = '10000000000000000000000'; // 10,000 TBURN
      this.stateBuilder.addAccount({
        address: keyPair.address,
        balance: initialStake,
        nonce: 0,
        comment: `Validator ${i + 1} stake`
      });
    }
    
    console.log(`[GenesisBuilder] Added ${this.validators.length} validators`);
    return keyPairs;
  }
  
  addExistingValidators(validators: GenesisValidator[]): void {
    for (const validator of validators) {
      this.validators.push(validator);
    }
  }
  
  // ==================== Contract Deployment ====================
  
  addSystemContracts(): void {
    // Staking contract
    this.stateBuilder.addAccount({
      address: addressFromString('tburn-system-staking'),
      balance: '0',
      nonce: 0,
      code: '0x', // Placeholder for staking contract bytecode
      comment: 'Staking System Contract'
    });
    
    // Slashing contract
    this.stateBuilder.addAccount({
      address: addressFromString('tburn-system-slashing'),
      balance: '0',
      nonce: 0,
      code: '0x',
      comment: 'Slashing System Contract'
    });
    
    // Rewards contract
    this.stateBuilder.addAccount({
      address: addressFromString('tburn-system-rewards'),
      balance: '0',
      nonce: 0,
      code: '0x',
      comment: 'Rewards Distribution Contract'
    });
    
    // Governance contract
    this.stateBuilder.addAccount({
      address: addressFromString('tburn-system-governance'),
      balance: '0',
      nonce: 0,
      code: '0x',
      comment: 'Governance System Contract'
    });
    
    // Bridge contract
    this.stateBuilder.addAccount({
      address: addressFromString('tburn-system-bridge'),
      balance: '0',
      nonce: 0,
      code: '0x',
      comment: 'Bridge System Contract'
    });
    
    console.log('[GenesisBuilder] Added system contracts');
  }
  
  // ==================== Genesis Block Generation ====================
  
  build(timestamp?: number): GenesisBlock {
    console.log('[GenesisBuilder] Building genesis block...');
    
    const genesisTimestamp = timestamp || Math.floor(Date.now() / 1000);
    
    // Compute roots
    const stateRoot = this.stateBuilder.computeStateRoot();
    const transactionsRoot = this.emptyRoot();
    const receiptsRoot = this.emptyRoot();
    
    // Build block
    const block: GenesisBlock = {
      config: this.chainConfig,
      nonce: GENESIS_BUILDER_CONFIG.GENESIS_NONCE,
      timestamp: genesisTimestamp,
      extraData: this.encodeExtraData(GENESIS_BUILDER_CONFIG.GENESIS_EXTRA_DATA),
      gasLimit: '0x' + GENESIS_BUILDER_CONFIG.GENESIS_GAS_LIMIT.toString(16),
      difficulty: '0x' + GENESIS_BUILDER_CONFIG.GENESIS_DIFFICULTY.toString(16),
      mixHash: '0x' + '0'.repeat(64),
      coinbase: '0x' + '0'.repeat(40),
      alloc: this.stateBuilder.toAlloc(),
      validators: this.validators,
      number: 0,
      gasUsed: '0x0',
      parentHash: '0x' + '0'.repeat(64),
      baseFeePerGas: '0x3b9aca00', // 1 Gwei
      stateRoot,
      transactionsRoot,
      receiptsRoot,
      hash: '' // Will be computed
    };
    
    // Compute block hash
    block.hash = this.computeBlockHash(block);
    
    console.log(`[GenesisBuilder] Genesis block built: ${block.hash}`);
    console.log(`[GenesisBuilder] Total supply: ${this.stateBuilder.getTotalBalance().toString()} wei`);
    console.log(`[GenesisBuilder] Validators: ${this.validators.length}`);
    console.log(`[GenesisBuilder] Accounts: ${Object.keys(block.alloc).length}`);
    
    this.emit('genesisBuilt', block);
    
    return block;
  }
  
  private emptyRoot(): string {
    return '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421';
  }
  
  private encodeExtraData(data: string): string {
    const hex = Buffer.from(data).toString('hex');
    return '0x' + hex.padEnd(64, '0');
  }
  
  private computeBlockHash(block: GenesisBlock): string {
    const data = [
      block.parentHash,
      block.coinbase,
      block.stateRoot,
      block.transactionsRoot,
      block.receiptsRoot,
      block.number.toString(),
      block.gasLimit,
      block.gasUsed,
      block.timestamp.toString(),
      block.extraData,
      block.mixHash,
      block.nonce
    ].join('');
    
    return '0x' + crypto.createHash(GENESIS_BUILDER_CONFIG.HASH_ALGORITHM).update(data).digest('hex');
  }
  
  // ==================== Export/Import ====================
  
  async export(outputDir: string = GENESIS_BUILDER_CONFIG.OUTPUT_DIR): Promise<GenesisExport> {
    const genesisBlock = this.build();
    
    // Create output directory
    try {
      await fs.promises.mkdir(outputDir, { recursive: true });
    } catch (e) {
      // Directory might exist
    }
    
    const genesisExport: GenesisExport = {
      version: '1.0.0',
      chainId: this.chainConfig.chainId,
      genesisHash: genesisBlock.hash,
      genesisBlock,
      validators: this.validators,
      totalSupply: this.stateBuilder.getTotalBalance().toString(),
      createdAt: Date.now(),
      createdBy: 'TBURN Genesis Builder'
    };
    
    // Write genesis file
    const genesisPath = path.join(outputDir, GENESIS_BUILDER_CONFIG.GENESIS_FILE);
    await fs.promises.writeFile(genesisPath, JSON.stringify(genesisExport, null, 2));
    
    console.log(`[GenesisBuilder] Genesis exported to ${genesisPath}`);
    
    return genesisExport;
  }
  
  async exportValidatorKeys(
    keyPairs: ValidatorKeyPair[],
    outputDir: string = GENESIS_BUILDER_CONFIG.OUTPUT_DIR
  ): Promise<void> {
    const keysDir = path.join(outputDir, GENESIS_BUILDER_CONFIG.VALIDATOR_KEYS_DIR);
    
    try {
      await fs.promises.mkdir(keysDir, { recursive: true });
    } catch (e) {
      // Directory might exist
    }
    
    for (const keyPair of keyPairs) {
      const keyFile = {
        validatorId: keyPair.validatorId,
        address: keyPair.address,
        publicKey: keyPair.publicKey,
        blsPublicKey: keyPair.blsPublicKey,
        nodeId: keyPair.nodeId
      };
      
      const secretFile = {
        validatorId: keyPair.validatorId,
        privateKey: keyPair.privateKey,
        blsPrivateKey: keyPair.blsPrivateKey
      };
      
      // Write public key file
      await fs.promises.writeFile(
        path.join(keysDir, `${keyPair.validatorId}.pub.json`),
        JSON.stringify(keyFile, null, 2)
      );
      
      // Write private key file
      await fs.promises.writeFile(
        path.join(keysDir, `${keyPair.validatorId}.key.json`),
        JSON.stringify(secretFile, null, 2)
      );
    }
    
    console.log(`[GenesisBuilder] Validator keys exported to ${keysDir}`);
  }
  
  static async import(genesisPath: string): Promise<GenesisExport> {
    const content = await fs.promises.readFile(genesisPath, 'utf-8');
    return JSON.parse(content);
  }
  
  // ==================== Validation ====================
  
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check validators
    if (this.validators.length < GENESIS_BUILDER_CONFIG.MIN_VALIDATORS) {
      errors.push(`Minimum ${GENESIS_BUILDER_CONFIG.MIN_VALIDATORS} validators required, got ${this.validators.length}`);
    }
    
    if (this.validators.length > GENESIS_BUILDER_CONFIG.MAX_VALIDATORS) {
      errors.push(`Maximum ${GENESIS_BUILDER_CONFIG.MAX_VALIDATORS} validators allowed, got ${this.validators.length}`);
    }
    
    // Check total supply
    const totalSupply = this.stateBuilder.getTotalBalance();
    if (totalSupply <= BigInt(0)) {
      errors.push('Total supply must be greater than 0');
    }
    
    // Check for duplicate addresses
    const addresses = new Set<string>();
    for (const account of this.stateBuilder.getAllAccounts()) {
      const addr = account.address.toLowerCase();
      if (addresses.has(addr)) {
        errors.push(`Duplicate address: ${addr}`);
      }
      addresses.add(addr);
    }
    
    // Check validator addresses
    for (const validator of this.validators) {
      const addr = validator.address.toLowerCase();
      if (addresses.has(addr)) {
        // This is expected - validators should have accounts
      } else {
        errors.push(`Validator ${validator.id} address not in allocation`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  // ==================== Utility ====================
  
  getStats(): {
    validatorCount: number;
    accountCount: number;
    totalSupply: string;
    chainId: number;
  } {
    return {
      validatorCount: this.validators.length,
      accountCount: this.stateBuilder.getAllAccounts().length,
      totalSupply: this.stateBuilder.getTotalBalance().toString(),
      chainId: this.chainConfig.chainId
    };
  }
  
  reset(): void {
    this.stateBuilder = new GenesisStateBuilder();
    this.validators = [];
  }
}

// ============================================================================
// Builder Factory Functions
// ============================================================================

export async function buildMainnetGenesis(): Promise<GenesisBlock> {
  const builder = new EnterpriseGenesisBuilder();
  
  // Add token allocation
  builder.addTokenAllocation();
  
  // Add system contracts
  builder.addSystemContracts();
  
  // Add validators (125 for mainnet)
  const keyPairs = builder.addValidators(125);
  
  // Validate
  const validation = builder.validate();
  if (!validation.valid) {
    console.error('[GenesisBuilder] Validation errors:', validation.errors);
    throw new Error('Genesis validation failed');
  }
  
  // Build
  const genesis = builder.build();
  
  // Export
  await builder.export();
  await builder.exportValidatorKeys(keyPairs);
  
  return genesis;
}

export async function buildTestnetGenesis(validatorCount: number = 20): Promise<GenesisBlock> {
  const builder = new EnterpriseGenesisBuilder();
  
  // Modify chain config for testnet
  builder['chainConfig'].chainId = 5801; // Testnet chain ID
  builder['chainConfig'].chainName = 'TBURN Testnet';
  builder['chainConfig'].tburnConfig.networkType = 'testnet';
  
  // Add token allocation
  builder.addTokenAllocation();
  
  // Add system contracts
  builder.addSystemContracts();
  
  // Add validators
  builder.addValidators(validatorCount);
  
  // Build
  return builder.build();
}

export async function buildDevnetGenesis(): Promise<GenesisBlock> {
  const builder = new EnterpriseGenesisBuilder();
  
  // Modify chain config for devnet
  builder['chainConfig'].chainId = 5802; // Devnet chain ID
  builder['chainConfig'].chainName = 'TBURN Devnet';
  builder['chainConfig'].tburnConfig.networkType = 'devnet';
  builder['chainConfig'].tburnConfig.slashingEnabled = false;
  
  // Add minimal allocation
  builder.addCustomAllocation(
    addressFromString('tburn-dev-account'),
    '1000000000000000000000000000', // 1B TBURN
    'Dev Account'
  );
  
  // Add minimal validators
  builder.addValidators(4);
  
  // Build
  return builder.build();
}

// ============================================================================
// Singleton Export
// ============================================================================

let genesisBuilderInstance: EnterpriseGenesisBuilder | null = null;

export function getEnterpriseGenesisBuilder(): EnterpriseGenesisBuilder {
  if (!genesisBuilderInstance) {
    genesisBuilderInstance = new EnterpriseGenesisBuilder();
  }
  return genesisBuilderInstance;
}
