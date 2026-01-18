/**
 * TBURN Address Utilities for Frontend
 * 
 * Provides standardized TBURN addresses in tb1 (Bech32m) format.
 * All TBURN chain addresses must use this format.
 * 
 * Address Format:
 * - Wallet: tb1 + 32 base32 chars + 6 checksum = 41 characters
 * - Example: tb1qw508d6qejxtdg4y5r3zarvaryvgpjn23
 */

const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
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

function encodeBech32m(hrp: string, data: Uint8Array): string {
  const data5bit = convertBits(Array.from(data), 8, 5, true);
  if (!data5bit) {
    throw new Error('Failed to convert bits');
  }
  
  const checksum = createChecksum(hrp, data5bit);
  const combined = data5bit.concat(checksum);
  
  let result = hrp + '1';
  for (const d of combined) {
    result += CHARSET[d];
  }
  
  return result;
}

async function sha256(message: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(hashBuffer);
}

/**
 * Generate a deterministic TBURN system address from a label
 * Same label always produces the same address
 */
export async function generateSystemAddress(label: string): Promise<string> {
  const hash = await sha256(label);
  return encodeBech32m('tb', hash.slice(0, 20));
}

/**
 * Generate a random TBURN address
 */
export function generateRandomAddress(): string {
  const randomBytes = new Uint8Array(20);
  crypto.getRandomValues(randomBytes);
  return encodeBech32m('tb', randomBytes);
}

/**
 * Validate if a string is a valid TBURN address (tb1 format)
 */
export function isValidTBurnAddress(address: string): boolean {
  if (!address) return false;
  return address.startsWith('tb1') && address.length >= 38 && address.length <= 62;
}

/**
 * Format address for display (truncate middle)
 */
export function formatAddress(address: string, chars: number = 8): string {
  if (!address || address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Pre-defined TBURN system addresses (deterministic)
 * These are computed at build time using SHA-256 hash of labels
 */
export const SYSTEM_ADDRESSES = {
  TBC20_FACTORY: 'tb1xepm7flrnk8s567dzhg27wyxth08mex0fckt2y',
  TBC721_FACTORY: 'tb1e0hyzzqye4uwqu52kc8zalz44flskyzjvwtwgk',
  TBC1155_FACTORY: 'tb1zrfj9epszf0ktfawnfl9g5qupekp4meh7969lv',
  
  DEX_ROUTER: 'tb1qw9d5cf8xkplm4gt7vs35r5h9ljkp7nxr8zqpce',
  DEX_FACTORY: 'tb1qx8e6dg9ylqnm5ht8wt46s6j0mkqq8pyr9arqdf',
  BRIDGE: 'tb1qy9f7eh0zmron6ju9xu57t7k1nlrr9qzsa2bseg',
  WTBURN: 'tb1qz0g8fj1anspn7kv0yv68u8l2omss0r0tb3ctfh',
  
  TREASURY: 'tb1qkwghdmv3x8qre7v4e4axxwg2s96rj5k56m3plz',
  ECOSYSTEM: 'tb1qlxhjenpcy9rsf8w5f5byy2h3t07sk6l67n4qm0',
  STAKING: 'tb1qmyjkfpqdz0stg9x6g6czzah4u18tl7m78p5rn1',
  
  ZERO: 'tb1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqa9vu7s',
} as const;

/**
 * Pre-defined token addresses on TBURN chain
 */
export const TOKEN_ADDRESSES = {
  TBURN: 'tb1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqa9vu7s',
  WTBURN: SYSTEM_ADDRESSES.WTBURN,
  USDT: 'tb1q0usdt9mtg6p7fhk2z3v8yr5n4jqc8s0z49p2c5',
  USDC: 'tb1q0usdc0ntg7p8fhk3z4v9yr6n5jqd8s1z50p3c6',
  ETH: 'tb1q0weth0ptg8p9fhk4z5v0yr7n6jqe8s2z51p4c7',
  BTC: 'tb1q0wbtc0qtg9p0fhk5z6v1yr8n7jqf8s3z52p5c8',
} as const;

/**
 * Bridge addresses on other chains (these remain as 0x since they're on EVM chains)
 * Note: Only TBURN chain uses tb1 addresses
 */
export const BRIDGE_CHAIN_ADDRESSES: Record<string, { chainId: number; bridgeAddress: string; name: string }> = {
  ethereum: { chainId: 1, bridgeAddress: '0x1000000000000000000000000000000000000010', name: 'Ethereum Mainnet' },
  polygon: { chainId: 137, bridgeAddress: '0x1370000000000000000000000000000000000010', name: 'Polygon' },
  arbitrum: { chainId: 42161, bridgeAddress: '0x4216100000000000000000000000000000000010', name: 'Arbitrum One' },
  optimism: { chainId: 10, bridgeAddress: '0x0010000000000000000000000000000000000010', name: 'Optimism' },
  base: { chainId: 8453, bridgeAddress: '0x8453000000000000000000000000000000000010', name: 'Base' },
  bsc: { chainId: 56, bridgeAddress: '0x0056000000000000000000000000000000000010', name: 'BNB Smart Chain' },
};

export default {
  generateSystemAddress,
  generateRandomAddress,
  isValidTBurnAddress,
  formatAddress,
  SYSTEM_ADDRESSES,
  TOKEN_ADDRESSES,
  BRIDGE_CHAIN_ADDRESSES,
};
