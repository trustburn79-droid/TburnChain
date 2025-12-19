import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Bech32m encoding for TBURN addresses (client-side)
const BECH32M_CONST = 0x2bc830a3;
const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

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

function createChecksum(hrp: string, data: number[]): number[] {
  const values = hrpExpand(hrp).concat(data).concat([0, 0, 0, 0, 0, 0]);
  const mod = polymod(values) ^ BECH32M_CONST;
  const ret: number[] = [];
  for (let i = 0; i < 6; i++) {
    ret.push((mod >> (5 * (5 - i))) & 31);
  }
  return ret;
}

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
  }
  
  return ret;
}

/**
 * Encode bytes to Bech32m address (client-side)
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
 * FNV-1a based deterministic hash for consistent address generation
 * Creates 20-byte output for Bech32m encoding (matching server behavior)
 */
function deterministicHash(str: string): Uint8Array {
  const bytes: number[] = [];
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  
  for (let i = 0; i < str.length; i++) {
    h1 ^= str.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= str.charCodeAt(i);
    h2 = Math.imul(h2, 0x811c9dc5);
  }
  
  for (let i = 0; i < 20; i++) {
    const mix = (h1 >>> (i % 24)) ^ (h2 >>> ((i + 7) % 24));
    bytes.push((mix + i * 37) & 0xff);
    h1 = Math.imul(h1 ^ (i * 17), 0x01000193);
    h2 = Math.imul(h2 ^ (i * 31), 0x811c9dc5);
  }
  
  return new Uint8Array(bytes);
}

/**
 * Convert hex string to Uint8Array (20 bytes for address)
 */
function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const paddedHex = cleanHex.padEnd(40, '0').slice(0, 40);
  const bytes = new Uint8Array(20);
  for (let i = 0; i < 20; i++) {
    bytes[i] = parseInt(paddedHex.slice(i * 2, i * 2 + 2), 16) || 0;
  }
  return bytes;
}

/**
 * Generate consistent tb1 address from a seed string (client-side)
 * Uses deterministic hashing to match server-side addressFromString behavior
 */
export function generateTb1Address(seed: string): string {
  const data = deterministicHash(seed);
  return encodeBech32m('tb', data);
}

/**
 * Generate consistent tb1 address from a hex string (e.g., 0x... address or hash)
 * Properly converts hex bytes to Bech32m format
 */
export function hexToTb1Address(hexStr: string): string {
  const bytes = hexToBytes(hexStr);
  return encodeBech32m('tb', bytes);
}
