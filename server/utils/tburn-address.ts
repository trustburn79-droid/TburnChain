/**
 * TBURN Address Generation Utilities
 * 
 * Provides standardized address generation for the TBURN mainnet.
 * All addresses follow the format: tburn + 40 hex characters = 45 characters total
 * 
 * Address Types:
 * - Wallet: tburn + 40 hex chars (e.g., tburn632bd96d9b99cf4267a9d0cab551c197eee1d23a)
 * - Validator: tburnvalidator + identifier (e.g., tburnvalidator0001)
 * - System: tburn + derived hex from label (e.g., tburnf4a8c2e7b9d1f6a8c2e5b9d3f7a1c4e8b2d6f9a3)
 */

import crypto from 'crypto';

// TBURN address prefix (no number suffix)
const TBURN_PREFIX = 'tburn';
const VALIDATOR_PREFIX = 'tburnvalidator';
const ADDRESS_HEX_LENGTH = 40;

/**
 * Generate a deterministic TBURN address from a seed
 */
export function generateTBurnAddress(seed: number, index: number = 0): string {
  const segments: string[] = [];
  let current = seed + index * 7919;
  
  for (let i = 0; i < 5; i++) {
    current = (current * 6271 + 2963) & 0xFFFFFFFF;
    segments.push(current.toString(16).padStart(8, '0').slice(-8));
  }
  
  return `${TBURN_PREFIX}${segments.join('')}`;
}

/**
 * Generate a random TBURN address using crypto
 */
export function generateRandomTBurnAddress(): string {
  return `${TBURN_PREFIX}${crypto.randomBytes(20).toString('hex')}`;
}

/**
 * Generate a system account address from a label
 * Derives a deterministic address by hashing the label
 */
export function generateSystemAddress(label: string): string {
  const hash = crypto.createHash('sha256').update(label).digest('hex');
  return `${TBURN_PREFIX}${hash.slice(0, ADDRESS_HEX_LENGTH)}`;
}

/**
 * Generate a validator address with an identifier
 */
export function generateValidatorAddress(index: number): string {
  return `${VALIDATOR_PREFIX}${index.toString().padStart(4, '0')}`;
}

/**
 * Format an existing address to TBURN format
 * Converts 0x addresses to tburn format
 */
export function formatTBurnAddress(address: string): string {
  if (address.startsWith(TBURN_PREFIX)) {
    return address;
  }
  
  if (address.startsWith('0x')) {
    return `${TBURN_PREFIX}${address.slice(2).toLowerCase()}`;
  }
  
  // If it's just hex, add prefix
  if (/^[a-fA-F0-9]{40}$/.test(address)) {
    return `${TBURN_PREFIX}${address.toLowerCase()}`;
  }
  
  return address;
}

/**
 * Validate a TBURN address format
 */
export function isValidTBurnAddress(address: string): boolean {
  if (address.startsWith(VALIDATOR_PREFIX)) {
    return /^tburnvalidator\d{4}$/.test(address);
  }
  return new RegExp(`^${TBURN_PREFIX}[a-f0-9]{${ADDRESS_HEX_LENGTH}}$`).test(address);
}

/**
 * Truncate address for display (e.g., tburn632b...d23a)
 */
export function truncateAddress(address: string, startChars: number = 9, endChars: number = 4): string {
  if (address.length <= startChars + endChars + 3) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Generate address from a string hash (deterministic)
 */
export function addressFromString(str: string): string {
  const hash = crypto.createHash('sha256').update(str).digest('hex');
  return `${TBURN_PREFIX}${hash.slice(0, ADDRESS_HEX_LENGTH)}`;
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

export default {
  generateTBurnAddress,
  generateRandomTBurnAddress,
  generateSystemAddress,
  generateValidatorAddress,
  formatTBurnAddress,
  isValidTBurnAddress,
  truncateAddress,
  addressFromString,
  SYSTEM_ADDRESSES,
  SIGNER_ADDRESSES,
  TBURN_PREFIX,
  VALIDATOR_PREFIX,
};
