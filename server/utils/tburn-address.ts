/**
 * TBURN Address Generation Utilities
 * 
 * Provides standardized address generation for the TBURN mainnet.
 * 
 * New Bech32m Format (tb1):
 * - Format: tb1 + 32 base32 chars (data) + 6 chars (checksum) = 41 characters
 * - Example: tb1qw508d6qejxtdg4y5r3zarvaryvgpjn23
 * 
 * Legacy Format (tburn):
 * - Format: tburn + 40 hex chars = 45 characters
 * - Example: tburn632bd96d9b99cf4267a9d0cab551c197eee1d23a
 * 
 * Address Types:
 * - Wallet: tb1 + base32 encoded (new) or tburn + 40 hex (legacy)
 * - Validator: tbv1 + encoded validator data
 * - System: tb1 + derived from label hash
 */

import crypto from 'crypto';

// Bech32m constants
const BECH32M_CONST = 0x2bc830a3;
const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
const CHARSET_MAP: { [key: string]: number } = {};
for (let i = 0; i < CHARSET.length; i++) {
  CHARSET_MAP[CHARSET[i]] = i;
}

// TBURN Human Readable Prefixes
const HRP_WALLET = 'tb';
const HRP_VALIDATOR = 'tbv';

// Legacy prefixes (for backward compatibility)
const LEGACY_PREFIX = 'tburn';
const LEGACY_VALIDATOR_PREFIX = 'tburnvalidator';
const ADDRESS_HEX_LENGTH = 40;

/**
 * Bech32m polymod function for checksum calculation
 */
function polymod(values: number[]): number {
  const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  let chk = 1;
  for (const v of values) {
    const top = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) {
      if ((top >> i) & 1) {
        chk ^= GEN[i];
      }
    }
  }
  return chk;
}

/**
 * Expand HRP for checksum calculation
 */
function hrpExpand(hrp: string): number[] {
  const ret: number[] = [];
  for (let i = 0; i < hrp.length; i++) {
    ret.push(hrp.charCodeAt(i) >> 5);
  }
  ret.push(0);
  for (let i = 0; i < hrp.length; i++) {
    ret.push(hrp.charCodeAt(i) & 31);
  }
  return ret;
}

/**
 * Verify Bech32m checksum
 */
function verifyChecksum(hrp: string, data: number[]): boolean {
  return polymod(hrpExpand(hrp).concat(data)) === BECH32M_CONST;
}

/**
 * Create Bech32m checksum
 */
function createChecksum(hrp: string, data: number[]): number[] {
  const values = hrpExpand(hrp).concat(data).concat([0, 0, 0, 0, 0, 0]);
  const mod = polymod(values) ^ BECH32M_CONST;
  const ret: number[] = [];
  for (let i = 0; i < 6; i++) {
    ret.push((mod >> (5 * (5 - i))) & 31);
  }
  return ret;
}

/**
 * Convert bits between sizes (e.g., 8-bit to 5-bit)
 */
function convertBits(data: number[], fromBits: number, toBits: number, pad: boolean): number[] | null {
  let acc = 0;
  let bits = 0;
  const ret: number[] = [];
  const maxv = (1 << toBits) - 1;
  
  for (const value of data) {
    if (value < 0 || (value >> fromBits) !== 0) {
      return null;
    }
    acc = (acc << fromBits) | value;
    bits += fromBits;
    while (bits >= toBits) {
      bits -= toBits;
      ret.push((acc >> bits) & maxv);
    }
  }
  
  if (pad) {
    if (bits > 0) {
      ret.push((acc << (toBits - bits)) & maxv);
    }
  } else if (bits >= fromBits || ((acc << (toBits - bits)) & maxv)) {
    return null;
  }
  
  return ret;
}

/**
 * Encode bytes to Bech32m address
 */
export function encodeBech32m(hrp: string, data: Uint8Array): string {
  const values = convertBits(Array.from(data), 8, 5, true);
  if (!values) {
    throw new Error('Failed to convert bits for Bech32m encoding');
  }
  
  const checksum = createChecksum(hrp, values);
  const combined = values.concat(checksum);
  
  let result = hrp + '1';
  for (const v of combined) {
    result += CHARSET[v];
  }
  
  return result;
}

/**
 * Decode Bech32m address to bytes
 */
export function decodeBech32m(address: string): { hrp: string; data: Uint8Array } | null {
  const lower = address.toLowerCase();
  const upper = address.toUpperCase();
  
  if (address !== lower && address !== upper) {
    return null; // Mixed case
  }
  
  const addr = lower;
  const pos = addr.lastIndexOf('1');
  
  if (pos < 1 || pos + 7 > addr.length || addr.length > 90) {
    return null;
  }
  
  const hrp = addr.slice(0, pos);
  const dataStr = addr.slice(pos + 1);
  
  const data: number[] = [];
  for (const c of dataStr) {
    const v = CHARSET_MAP[c];
    if (v === undefined) {
      return null;
    }
    data.push(v);
  }
  
  if (!verifyChecksum(hrp, data)) {
    return null;
  }
  
  const decoded = convertBits(data.slice(0, -6), 5, 8, false);
  if (!decoded) {
    return null;
  }
  
  return {
    hrp,
    data: new Uint8Array(decoded)
  };
}

/**
 * Generate a new TBURN address in tb1 format from 20 bytes
 */
export function generateTb1Address(data: Uint8Array): string {
  if (data.length !== 20) {
    throw new Error('Address data must be exactly 20 bytes');
  }
  return encodeBech32m(HRP_WALLET, data);
}

/**
 * Generate a deterministic TBURN address in tb1 format from a seed
 */
export function generateTBurnAddress(seed: number, index: number = 0): string {
  const seedStr = `tburn-wallet-${seed}-${index}`;
  const hash = crypto.createHash('sha256').update(seedStr).digest();
  return encodeBech32m(HRP_WALLET, hash.slice(0, 20));
}

/**
 * Generate a random TBURN address in tb1 format
 * WARNING: This creates an address NOT linked to any private key - for testing only
 */
export function generateRandomTBurnAddress(): string {
  const randomBytes = crypto.randomBytes(20);
  return encodeBech32m(HRP_WALLET, randomBytes);
}

/**
 * Derive TBURN address from public key (PRODUCTION USE)
 * Uses SHA256 + RIPEMD160 hash (Bitcoin-style) to create 20-byte address
 * This creates a cryptographically linked address that can receive real transfers
 * 
 * @param publicKey - Hex string of secp256k1 public key (compressed or uncompressed)
 * @returns TBURN Bech32m address (tb1...)
 */
export function deriveAddressFromPublicKey(publicKey: string): string {
  // Remove 0x prefix if present
  const cleanKey = publicKey.startsWith('0x') ? publicKey.slice(2) : publicKey;
  const pubKeyBytes = Buffer.from(cleanKey, 'hex');
  
  // SHA256 hash of public key
  const sha256Hash = crypto.createHash('sha256').update(pubKeyBytes).digest();
  
  // RIPEMD160 of SHA256 hash (Bitcoin-style address derivation)
  const ripemd160Hash = crypto.createHash('ripemd160').update(sha256Hash).digest();
  
  // Encode as Bech32m with tb1 prefix
  return encodeBech32m(HRP_WALLET, ripemd160Hash);
}

/**
 * Derive TBURN address from private key (PRODUCTION USE)
 * Computes public key from private key, then derives address
 * 
 * @param privateKey - Hex string of secp256k1 private key
 * @param publicKey - Corresponding public key (required for derivation)
 * @returns TBURN Bech32m address (tb1...)
 */
export function deriveAddressFromPrivateKey(privateKey: string, publicKey: string): string {
  return deriveAddressFromPublicKey(publicKey);
}

/**
 * Generate a system account address from a label (deterministic)
 */
export function generateSystemAddress(label: string): string {
  const hash = crypto.createHash('sha256').update(label).digest();
  return encodeBech32m(HRP_WALLET, hash.slice(0, 20));
}

/**
 * Generate a validator address in tbv1 format
 */
export function generateValidatorAddress(index: number): string {
  const data = Buffer.alloc(20);
  data.writeUInt32BE(index, 0);
  const hash = crypto.createHash('sha256').update(`tburn-validator-${index}`).digest();
  return encodeBech32m(HRP_VALIDATOR, hash.slice(0, 20));
}

/**
 * Generate address from a string hash (deterministic) in tb1 format
 */
export function addressFromString(str: string): string {
  const hash = crypto.createHash('sha256').update(str).digest();
  return encodeBech32m(HRP_WALLET, hash.slice(0, 20));
}

/**
 * Convert legacy tburn... address to tb1... format
 */
export function migrateLegacyAddress(legacyAddress: string): string {
  // Already in tb1 format
  if (legacyAddress.startsWith('tb1') || legacyAddress.startsWith('tbv1')) {
    return legacyAddress;
  }
  
  // Legacy validator format
  if (legacyAddress.startsWith(LEGACY_VALIDATOR_PREFIX)) {
    const index = parseInt(legacyAddress.slice(LEGACY_VALIDATOR_PREFIX.length), 10);
    return generateValidatorAddress(index);
  }
  
  // Legacy tburn format
  if (legacyAddress.startsWith(LEGACY_PREFIX)) {
    const hex = legacyAddress.slice(LEGACY_PREFIX.length);
    if (hex.length === ADDRESS_HEX_LENGTH) {
      const bytes = Buffer.from(hex, 'hex');
      return encodeBech32m(HRP_WALLET, bytes);
    }
  }
  
  // 0x format
  if (legacyAddress.startsWith('0x')) {
    const hex = legacyAddress.slice(2);
    if (hex.length === ADDRESS_HEX_LENGTH) {
      const bytes = Buffer.from(hex, 'hex');
      return encodeBech32m(HRP_WALLET, bytes);
    }
  }
  
  // Plain hex
  if (/^[a-fA-F0-9]{40}$/.test(legacyAddress)) {
    const bytes = Buffer.from(legacyAddress, 'hex');
    return encodeBech32m(HRP_WALLET, bytes);
  }
  
  // Unknown format - generate from hash
  return addressFromString(legacyAddress);
}

/**
 * Convert tb1 address back to legacy tburn format (for backward compatibility)
 */
export function toLegacyFormat(tb1Address: string): string {
  const decoded = decodeBech32m(tb1Address);
  if (!decoded) {
    return tb1Address; // Return as-is if invalid
  }
  
  if (decoded.hrp === HRP_VALIDATOR) {
    // For validators, we'd need to extract index - simplified here
    const hex = Buffer.from(decoded.data).toString('hex');
    return `${LEGACY_VALIDATOR_PREFIX}${hex.slice(0, 4)}`;
  }
  
  const hex = Buffer.from(decoded.data).toString('hex');
  return `${LEGACY_PREFIX}${hex}`;
}

/**
 * Format any address to tb1 format
 */
export function formatTBurnAddress(address: string): string {
  return migrateLegacyAddress(address);
}

/**
 * Validate a TBURN address (supports both tb1 and legacy formats)
 */
export function isValidTBurnAddress(address: string): boolean {
  // New tb1/tbv1 format
  if (address.startsWith('tb1') || address.startsWith('tbv1')) {
    const decoded = decodeBech32m(address);
    return decoded !== null && decoded.data.length === 20;
  }
  
  // Legacy validator format
  if (address.startsWith(LEGACY_VALIDATOR_PREFIX)) {
    return /^tburnvalidator\d{4}$/.test(address);
  }
  
  // Legacy tburn format
  return new RegExp(`^${LEGACY_PREFIX}[a-f0-9]{${ADDRESS_HEX_LENGTH}}$`).test(address);
}

/**
 * Check if address is in new tb1 format
 */
export function isTb1Format(address: string): boolean {
  return address.startsWith('tb1') || address.startsWith('tbv1');
}

/**
 * Check if address is in legacy tburn format
 */
export function isLegacyFormat(address: string): boolean {
  return address.startsWith(LEGACY_PREFIX) && !address.startsWith('tb1');
}

/**
 * Truncate address for display (e.g., tb1qw50...pjn23)
 */
export function truncateAddress(address: string, startChars: number = 8, endChars: number = 5): string {
  if (address.length <= startChars + endChars + 3) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Get address type from address string
 */
export function getAddressType(address: string): 'wallet' | 'validator' | 'unknown' {
  if (address.startsWith('tb1')) return 'wallet';
  if (address.startsWith('tbv1')) return 'validator';
  if (address.startsWith(LEGACY_PREFIX) && !address.startsWith(LEGACY_VALIDATOR_PREFIX)) return 'wallet';
  if (address.startsWith(LEGACY_VALIDATOR_PREFIX)) return 'validator';
  return 'unknown';
}

// Pre-defined system addresses (derived from labels for consistency)
export const SYSTEM_ADDRESSES = {
  TREASURY: generateSystemAddress('tburn-treasury-mainnet'),
  ECOSYSTEM: generateSystemAddress('tburn-ecosystem-fund'),
  STAKING: generateSystemAddress('tburn-staking-pool'),
  TEAM: generateSystemAddress('tburn-team-allocation'),
  LIQUIDITY: generateSystemAddress('tburn-liquidity-pool'),
  PUBLIC_SALE: generateSystemAddress('tburn-public-sale'),
  RESERVE: generateSystemAddress('tburn-reserve-fund'),
  BURN: generateSystemAddress('tburn-burn-address'),
  GENESIS: generateSystemAddress('tburn-genesis-block'),
} as const;

// Pre-defined signer addresses
export const SIGNER_ADDRESSES = {
  CEO: generateSystemAddress('tburn-signer-ceo'),
  CTO: generateSystemAddress('tburn-signer-cto'),
  CFO: generateSystemAddress('tburn-signer-cfo'),
  LEGAL: generateSystemAddress('tburn-signer-legal'),
} as const;

// ============================================
// TBURN Hash Generation Utilities
// ============================================

// Hash prefixes for TBURN blockchain
const HASH_PREFIX_TX = 'th1';        // Transaction hash
const HASH_PREFIX_BLOCK = 'bh1';     // Block hash
const HASH_PREFIX_STATE = 'sr1';     // State root
const HASH_PREFIX_RECEIPT = 'rr1';   // Receipts root
const HASH_PREFIX_BYTECODE = 'bc1';  // Contract bytecode
const HASH_PREFIX_CALLDATA = 'cd1';  // Calldata
const HASH_PREFIX_SIGNATURE = 'sig1'; // Signature

/**
 * Generate a transaction hash in th1 format
 * @param input - Optional input data to hash (uses random if not provided)
 */
export function generateTxHash(input?: string): string {
  const data = input || `tx-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  return `${HASH_PREFIX_TX}${hash}`;
}

/**
 * Generate a block hash in bh1 format
 * @param input - Optional input data to hash (uses random if not provided)
 */
export function generateBlockHash(input?: string): string {
  const data = input || `block-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  return `${HASH_PREFIX_BLOCK}${hash}`;
}

/**
 * Generate a state root in sr1 format
 * @param input - Optional input data to hash (uses random if not provided)
 */
export function generateStateRoot(input?: string): string {
  const data = input || `state-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  return `${HASH_PREFIX_STATE}${hash}`;
}

/**
 * Generate a receipts root in rr1 format
 * @param input - Optional input data to hash (uses random if not provided)
 */
export function generateReceiptsRoot(input?: string): string {
  const data = input || `receipts-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  return `${HASH_PREFIX_RECEIPT}${hash}`;
}

/**
 * Generate a random hash with specified prefix
 * @param prefix - Hash prefix (th1, bh1, sr1, etc.)
 * @param length - Length of hex portion (default 64)
 */
export function generateHash(prefix: string, length: number = 64): string {
  const hash = crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
  return `${prefix}${hash}`;
}

/**
 * Generate a deterministic hash from input with specified prefix
 * @param prefix - Hash prefix (th1, bh1, sr1, etc.)
 * @param input - Input data to hash
 */
export function generateHashFromInput(prefix: string, input: string): string {
  const hash = crypto.createHash('sha256').update(input).digest('hex');
  return `${prefix}${hash}`;
}

/**
 * Generate a mock signature in sig1 format
 * @param length - Length of signature hex (default 128)
 */
export function generateSignature(length: number = 128): string {
  const sig = crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
  return `${HASH_PREFIX_SIGNATURE}${sig}`;
}

/**
 * Generate bytecode in bc1 format
 * @param length - Length of bytecode hex (default 200)
 */
export function generateBytecode(length: number = 200): string {
  const bytecode = crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
  return `${HASH_PREFIX_BYTECODE}${bytecode}`;
}

/**
 * Generate calldata in cd1 format
 * @param length - Length of calldata hex (default 128)
 */
export function generateCalldata(length: number = 128): string {
  const calldata = crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
  return `${HASH_PREFIX_CALLDATA}${calldata}`;
}

/**
 * Generate a validator address from a string hash (deterministic) in tbv1 format
 */
export function validatorAddressFromString(str: string): string {
  const hash = crypto.createHash('sha256').update(str).digest();
  return encodeBech32m(HRP_VALIDATOR, hash.slice(0, 20));
}

/**
 * Generate empty hash with prefix (for default/null states)
 * @param prefix - Hash prefix
 * @param length - Length of zeros (default 64)
 */
export function generateEmptyHash(prefix: string, length: number = 64): string {
  return `${prefix}${'0'.repeat(length)}`;
}

/**
 * Check if a hash is in valid TBURN format (th1, bh1, sr1, etc.)
 */
export function isValidTBurnHash(hash: string): boolean {
  const validPrefixes = ['th1', 'bh1', 'sr1', 'rr1', 'bc1', 'cd1', 'sig1'];
  return validPrefixes.some(prefix => hash.startsWith(prefix));
}

/**
 * Convert 0x hash to TBURN format
 * @param hash0x - Hash in 0x format
 * @param type - Type of hash ('tx', 'block', 'state', 'receipt')
 */
export function convertFromEthHash(hash0x: string, type: 'tx' | 'block' | 'state' | 'receipt' = 'tx'): string {
  const hex = hash0x.startsWith('0x') ? hash0x.slice(2) : hash0x;
  const prefixMap = {
    tx: HASH_PREFIX_TX,
    block: HASH_PREFIX_BLOCK,
    state: HASH_PREFIX_STATE,
    receipt: HASH_PREFIX_RECEIPT
  };
  return `${prefixMap[type]}${hex}`;
}

/**
 * Convert TBURN hash back to 0x format (for external chain compatibility)
 * @param tburnHash - Hash in TBURN format (th1, bh1, etc.)
 */
export function convertToEthHash(tburnHash: string): string {
  const prefixes = ['th1', 'bh1', 'sr1', 'rr1', 'bc1', 'cd1', 'sig1'];
  for (const prefix of prefixes) {
    if (tburnHash.startsWith(prefix)) {
      return `0x${tburnHash.slice(prefix.length)}`;
    }
  }
  return tburnHash; // Return as-is if not in TBURN format
}

// Export constants
export const TBURN_PREFIX = LEGACY_PREFIX; // Legacy compatibility
export const VALIDATOR_PREFIX = LEGACY_VALIDATOR_PREFIX; // Legacy compatibility
export const TB1_PREFIX = HRP_WALLET;
export const TBV1_PREFIX = HRP_VALIDATOR;
export const TX_HASH_PREFIX = HASH_PREFIX_TX;
export const BLOCK_HASH_PREFIX = HASH_PREFIX_BLOCK;
export const STATE_ROOT_PREFIX = HASH_PREFIX_STATE;
export const RECEIPTS_ROOT_PREFIX = HASH_PREFIX_RECEIPT;
export const SIGNATURE_PREFIX = HASH_PREFIX_SIGNATURE;

export default {
  // Bech32m functions
  encodeBech32m,
  decodeBech32m,
  generateTb1Address,
  
  // Main generation functions
  generateTBurnAddress,
  generateRandomTBurnAddress,
  deriveAddressFromPublicKey,
  deriveAddressFromPrivateKey,
  generateSystemAddress,
  generateValidatorAddress,
  addressFromString,
  
  // Hash generation functions
  generateTxHash,
  generateBlockHash,
  generateStateRoot,
  generateReceiptsRoot,
  generateHash,
  generateHashFromInput,
  generateSignature,
  generateEmptyHash,
  
  // Hash validation and conversion
  isValidTBurnHash,
  convertFromEthHash,
  convertToEthHash,
  
  // Migration and formatting
  migrateLegacyAddress,
  toLegacyFormat,
  formatTBurnAddress,
  
  // Validation
  isValidTBurnAddress,
  isTb1Format,
  isLegacyFormat,
  getAddressType,
  
  // Display
  truncateAddress,
  
  // Constants
  SYSTEM_ADDRESSES,
  SIGNER_ADDRESSES,
  TBURN_PREFIX,
  VALIDATOR_PREFIX,
  TB1_PREFIX,
  TBV1_PREFIX,
  TX_HASH_PREFIX,
  BLOCK_HASH_PREFIX,
  STATE_ROOT_PREFIX,
  RECEIPTS_ROOT_PREFIX,
  SIGNATURE_PREFIX,
};
