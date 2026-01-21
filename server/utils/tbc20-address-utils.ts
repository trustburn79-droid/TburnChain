/**
 * TBURN TBC-20 Address Utilities
 * Bech32m Native Address Support
 */

import { createHash } from 'crypto';
import {
  TburnAddress,
  AddressBytes,
  TBURN_HRP,
  TBC20_FACTORY,
  TBC721_FACTORY,
  TBC1155_FACTORY,
  TokenStandard,
} from './tbc20-protocol-constants';

const BECH32M_CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
const BECH32M_CONST = 0x2bc830a3;

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

function verifyChecksum(hrp: string, data: number[]): boolean {
  return polymod(hrpExpand(hrp).concat(data)) === BECH32M_CONST;
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
  } else if (bits >= fromBits || ((acc << (toBits - bits)) & maxv)) {
    return null;
  }
  return ret;
}

export function encodeBech32m(hrp: string, data: Uint8Array): string {
  const data5bit = convertBits(Array.from(data), 8, 5, true);
  if (!data5bit) {
    throw new Error("Failed to convert to 5-bit");
  }
  const checksum = createChecksum(hrp, data5bit);
  const combined = data5bit.concat(checksum);
  let result = hrp + "1";
  for (const d of combined) {
    result += BECH32M_CHARSET[d];
  }
  return result;
}

export function decodeBech32m(str: string): { hrp: string; data: Uint8Array } | null {
  const lower = str.toLowerCase();
  const pos = lower.lastIndexOf("1");
  if (pos < 1 || pos + 7 > lower.length || lower.length > 90) {
    return null;
  }
  const hrp = lower.slice(0, pos);
  const dataStr = lower.slice(pos + 1);
  const data: number[] = [];
  for (const c of dataStr) {
    const idx = BECH32M_CHARSET.indexOf(c);
    if (idx === -1) {
      return null;
    }
    data.push(idx);
  }
  if (!verifyChecksum(hrp, data)) {
    return null;
  }
  const decoded = convertBits(data.slice(0, -6), 5, 8, false);
  if (!decoded) {
    return null;
  }
  return { hrp, data: new Uint8Array(decoded) };
}

export function sha256(data: Uint8Array | string): Uint8Array {
  const hash = createHash('sha256');
  hash.update(typeof data === 'string' ? Buffer.from(data) : Buffer.from(data));
  return new Uint8Array(hash.digest());
}

export function generateSystemAddress(label: string): TburnAddress {
  const hash = sha256(label);
  return encodeBech32m(TBURN_HRP, hash.slice(0, 20));
}

export function isValidTburnAddress(address: string): boolean {
  if (!address.toLowerCase().startsWith("tb1")) {
    return false;
  }
  if (address.length < 43) {
    return false;
  }
  const decoded = decodeBech32m(address);
  return decoded !== null && decoded.hrp === TBURN_HRP;
}

export function addressToBytes(address: string): Uint8Array | null {
  if (!isValidTburnAddress(address)) {
    return null;
  }
  const decoded = decodeBech32m(address);
  if (!decoded || decoded.data.length < 20) {
    return null;
  }
  return decoded.data.slice(0, 20);
}

export function bytesToAddress(bytes: Uint8Array): TburnAddress {
  const data = bytes.length >= 20 ? bytes.slice(0, 20) : bytes;
  return encodeBech32m(TBURN_HRP, data);
}

export function addressesEqual(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

export function isFactoryAddress(address: string): TokenStandard | null {
  if (addressesEqual(address, TBC20_FACTORY)) {
    return TokenStandard.TBC20;
  } else if (addressesEqual(address, TBC721_FACTORY)) {
    return TokenStandard.TBC721;
  } else if (addressesEqual(address, TBC1155_FACTORY)) {
    return TokenStandard.TBC1155;
  }
  return null;
}

export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
  }
  return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function computeBalanceSlot(address: Uint8Array): Uint8Array {
  const data = new Uint8Array(64);
  data.set(address, 12);
  data[63] = 0;
  return sha256(data);
}

export function computeAllowanceSlot(owner: Uint8Array, spender: Uint8Array): Uint8Array {
  const data1 = new Uint8Array(64);
  data1.set(owner, 12);
  data1[63] = 1;
  const ownerSlot = sha256(data1);
  
  const data2 = new Uint8Array(64);
  data2.set(spender, 12);
  data2.set(ownerSlot, 32);
  return sha256(data2);
}

export function slotToU256(slot: number): Uint8Array {
  const result = new Uint8Array(32);
  result[31] = slot;
  return result;
}

export function parseAddressBytes(data: Uint8Array): Uint8Array {
  const result = new Uint8Array(20);
  if (data.length >= 20) {
    result.set(data.slice(0, 20));
  }
  return result;
}

export function parseU256(data: Uint8Array): Uint8Array {
  const result = new Uint8Array(32);
  if (data.length >= 32) {
    result.set(data.slice(0, 32));
  }
  return result;
}

export function u256ToBigInt(value: Uint8Array): bigint {
  let result = BigInt(0);
  for (let i = 0; i < value.length; i++) {
    result = (result << BigInt(8)) | BigInt(value[i]);
  }
  return result;
}

export function bigIntToU256(value: bigint): Uint8Array {
  const result = new Uint8Array(32);
  let v = value;
  for (let i = 31; i >= 0; i--) {
    result[i] = Number(v & BigInt(0xff));
    v = v >> BigInt(8);
  }
  return result;
}

export function addressBytesToH256(address: Uint8Array): Uint8Array {
  const result = new Uint8Array(32);
  result.set(address, 12);
  return result;
}

export function encodeBool(value: boolean): Uint8Array {
  const result = new Uint8Array(32);
  if (value) {
    result[31] = 1;
  }
  return result;
}

export const ZERO_ADDRESS = bytesToAddress(new Uint8Array(20));

/**
 * Convert 0x hex address to tb1 bech32m address
 */
export function hexToTb1(hexAddress: string): string {
  const bytes = hexToBytes(hexAddress);
  return encodeBech32m(TBURN_HRP, bytes);
}

/**
 * Convert tb1 bech32m address to 0x hex address
 */
export function tb1ToHex(tb1Address: string): string | null {
  const decoded = decodeBech32m(tb1Address);
  if (!decoded || decoded.data.length < 20) {
    return null;
  }
  return '0x' + bytesToHex(decoded.data.slice(0, 20));
}

/**
 * Normalize address to 0x format for database queries
 * Accepts both tb1 and 0x formats
 */
export function normalizeToHex(address: string): string | null {
  if (address.startsWith('0x')) {
    return address.toLowerCase();
  }
  if (address.startsWith('tb1')) {
    return tb1ToHex(address);
  }
  return null;
}
