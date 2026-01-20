/**
 * TBURN TBC-20 Protocol Constants
 * Production-Ready Implementation v2
 * Bech32m Native Address Support
 */

export type TburnAddress = string;

export type AddressBytes = Uint8Array;

export type U256 = Uint8Array;

export type TxHash = Uint8Array;

export const TBURN_HRP = "tb1";

export const TBC20_FACTORY = "tb1xepm7flrnk8s567dzhg27wyxth08mex0fckt2y";

export const TBC721_FACTORY = "tb1e0hyzzqye4uwqu52kc8zalz44flskyzjvwtwgk";

export const TBC1155_FACTORY = "tb1zrfj9epszf0ktfawnfl9g5qupekp4meh7969lv";

export const Tbc20Selectors = {
  TRANSFER: new Uint8Array([0xa9, 0x05, 0x9c, 0xbb]),
  TRANSFER_FROM: new Uint8Array([0x23, 0xb8, 0x72, 0xdd]),
  APPROVE: new Uint8Array([0x09, 0x5e, 0xa7, 0xb3]),
  BURN: new Uint8Array([0x42, 0x96, 0x6c, 0x68]),
  MINT: new Uint8Array([0x40, 0xc1, 0x0f, 0x19]),
  BALANCE_OF: new Uint8Array([0x70, 0xa0, 0x82, 0x31]),
} as const;

export const Tbc20Slots = {
  BALANCES: 0,
  ALLOWANCES: 1,
  TOTAL_SUPPLY: 2,
  NAME: 3,
  SYMBOL: 4,
  DECIMALS: 5,
  MAX_SUPPLY: 10,
  FLAGS: 11,
  OWNER: 12,
  PAUSED: 13,
} as const;

export const Tbc20Events = {
  TRANSFER: new Uint8Array([
    0xdd, 0xf2, 0x52, 0xad, 0x1b, 0xe2, 0xc8, 0x9b,
    0x69, 0xc2, 0xb0, 0x68, 0xfc, 0x37, 0x8d, 0xaa,
    0x95, 0x2b, 0xa7, 0xf1, 0x63, 0xc4, 0xa1, 0x16,
    0x28, 0xf5, 0x5a, 0x4d, 0xf5, 0x23, 0xb3, 0xef
  ]),
  APPROVAL: new Uint8Array([
    0x8c, 0x5b, 0xe1, 0xe5, 0xeb, 0xec, 0x7d, 0x5b,
    0xd1, 0x4f, 0x71, 0x42, 0x7d, 0x1e, 0x84, 0xf3,
    0xdd, 0x03, 0x14, 0xc0, 0xf7, 0xb2, 0x29, 0x1e,
    0x5b, 0x20, 0x0a, 0xc8, 0xc7, 0xc3, 0xb9, 0x25
  ]),
} as const;

export enum TokenStandard {
  TBC20 = "TBC20",
  TBC721 = "TBC721",
  TBC1155 = "TBC1155",
}

export interface Tbc20TokenInfo {
  address: TburnAddress;
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: bigint;
  maxSupply: bigint;
  mintable: boolean;
  burnable: boolean;
  pausable: boolean;
  aiOptimized: boolean;
  quantumResistant: boolean;
  mevProtection: boolean;
  zkPrivacy: boolean;
  factory: TburnAddress;
  deployedAtBlock: number;
}

export function createDefaultTbc20TokenInfo(): Tbc20TokenInfo {
  return {
    address: "",
    name: "",
    symbol: "",
    decimals: 18,
    initialSupply: BigInt(0),
    maxSupply: BigInt(0),
    mintable: false,
    burnable: true,
    pausable: false,
    aiOptimized: true,
    quantumResistant: true,
    mevProtection: true,
    zkPrivacy: false,
    factory: TBC20_FACTORY,
    deployedAtBlock: 0,
  };
}

export interface Transaction {
  hash: TxHash;
  sender: TburnAddress;
  to: TburnAddress | null;
  value: bigint;
  data: Uint8Array;
  nonce: number;
  gasLimit: number;
  gasPrice: bigint;
}

export interface Log {
  address: TburnAddress;
  topics: Uint8Array[];
  data: Uint8Array;
}

export interface ExecutionResult {
  success: boolean;
  gasUsed: number;
  output: Uint8Array;
  logs: Log[];
  error: string | null;
}

export function createSuccessResult(gasUsed: number, output: Uint8Array, logs: Log[]): ExecutionResult {
  return {
    success: true,
    gasUsed,
    output,
    logs,
    error: null,
  };
}

export function createRevertResult(reason: string): ExecutionResult {
  return {
    success: false,
    gasUsed: 0,
    output: new Uint8Array(0),
    logs: [],
    error: reason,
  };
}

export const TBC20_GAS_COSTS = {
  TRANSFER: 51000,
  TRANSFER_FROM: 65000,
  APPROVE: 46000,
  BURN: 35000,
} as const;
