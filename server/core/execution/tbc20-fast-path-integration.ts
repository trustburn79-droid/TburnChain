/**
 * TBC-20 Fast Path Integration with Enterprise Infrastructure
 * 
 * Architecture:
 * - FastPathStateAdapter: Async-prefetch + synchronous snapshots
 * - Write batching through existing WAL pipeline
 * - TokenMetadataService-backed cache for token registry
 * - Embedded as early stage in ProductionBlockchainOrchestrator
 * 
 * Performance Target: 8μs/TX for TBC-20 operations
 */

import { EventEmitter } from 'events';
import {
  TburnAddress,
  Transaction,
  ExecutionResult,
  Log,
  Tbc20TokenInfo,
  TBC20_FACTORY,
  TBC20_GAS_COSTS,
  createSuccessResult,
  createRevertResult,
  Tbc20Selectors,
} from '../../utils/tbc20-protocol-constants';

import {
  isValidTburnAddress,
  addressToBytes,
  bytesToAddress,
  computeBalanceSlot,
  computeAllowanceSlot,
  slotToU256,
  u256ToBigInt,
  bigIntToU256,
  bytesToHex,
  hexToBytes,
  parseAddressBytes,
  parseU256,
  addressBytesToH256,
  encodeBool,
  ZERO_ADDRESS,
} from '../../utils/tbc20-address-utils';

import {
  Tbc20Registry,
  getTbc20Registry,
} from '../../services/tbc20-registry';

import {
  TburnTxClassifier,
  TxType,
  ClassificationResult,
} from '../../services/tburn-tx-classifier';

import {
  getEnterpriseStateStore,
  EnterpriseStateStore,
  AccountState,
} from '../state/enterprise-state-store';

import { Tbc20Slots, Tbc20Events } from '../../utils/tbc20-protocol-constants';

export interface StateSnapshot {
  balances: Map<string, bigint>;
  nonces: Map<string, number>;
  storage: Map<string, Uint8Array>;
  timestamp: number;
  blockNumber: number;
}

export interface WriteOperation {
  type: 'balance' | 'nonce' | 'storage';
  address: string;
  slot?: string;
  value: bigint | number | Uint8Array;
}

export interface FastPathStateAdapter {
  getBalance(address: string): bigint;
  setBalance(address: string, balance: bigint): void;
  getNonce(address: string): number;
  setNonce(address: string, nonce: number): void;
  getStorage(address: string, slot: Uint8Array): Uint8Array;
  setStorage(address: string, slot: Uint8Array, value: Uint8Array): void;
  
  loadSnapshot(addresses: string[]): Promise<void>;
  commitWrites(): Promise<void>;
  isStale(): boolean;
  getPendingWriteCount(): number;
}

export class SynchronousStateAdapter implements FastPathStateAdapter {
  private snapshot: StateSnapshot;
  private pendingWrites: WriteOperation[] = [];
  private stateStore: EnterpriseStateStore | null = null;
  private snapshotAge: number = 0;
  private readonly maxSnapshotAgeMs = 1000;
  private eventEmitter: EventEmitter = new EventEmitter();

  constructor() {
    this.snapshot = {
      balances: new Map(),
      nonces: new Map(),
      storage: new Map(),
      timestamp: Date.now(),
      blockNumber: 0,
    };
  }

  private storageKey(address: string, slot: Uint8Array): string {
    return `${address.toLowerCase()}:${bytesToHex(slot)}`;
  }

  getBalance(address: string): bigint {
    const key = address.toLowerCase();
    return this.snapshot.balances.get(key) || BigInt(0);
  }

  setBalance(address: string, balance: bigint): void {
    const key = address.toLowerCase();
    this.snapshot.balances.set(key, balance);
    this.pendingWrites.push({ type: 'balance', address: key, value: balance });
  }

  getNonce(address: string): number {
    const key = address.toLowerCase();
    return this.snapshot.nonces.get(key) || 0;
  }

  setNonce(address: string, nonce: number): void {
    const key = address.toLowerCase();
    this.snapshot.nonces.set(key, nonce);
    this.pendingWrites.push({ type: 'nonce', address: key, value: nonce });
  }

  getStorage(address: string, slot: Uint8Array): Uint8Array {
    const key = this.storageKey(address, slot);
    return this.snapshot.storage.get(key) || new Uint8Array(32);
  }

  setStorage(address: string, slot: Uint8Array, value: Uint8Array): void {
    const key = this.storageKey(address, slot);
    this.snapshot.storage.set(key, value);
    this.pendingWrites.push({ 
      type: 'storage', 
      address: address.toLowerCase(), 
      slot: bytesToHex(slot),
      value 
    });
  }

  async loadSnapshot(addresses: string[]): Promise<void> {
    if (!this.stateStore) {
      try {
        this.stateStore = getEnterpriseStateStore();
      } catch {
        console.log('[FastPath] StateStore not available, using in-memory only');
        this.snapshot.timestamp = Date.now();
        return;
      }
    }

    for (const addr of addresses) {
      const key = addr.toLowerCase();
      try {
        const account = await this.stateStore.getAccount(key);
        if (account) {
          this.snapshot.balances.set(key, BigInt(account.balance));
          this.snapshot.nonces.set(key, account.nonce);
        }
      } catch {
      }
    }

    this.snapshot.timestamp = Date.now();
    this.snapshotAge = 0;
  }

  async commitWrites(): Promise<void> {
    if (this.pendingWrites.length === 0) return;
    
    if (!this.stateStore) {
      this.pendingWrites = [];
      return;
    }

    const accountUpdates = new Map<string, { balance?: bigint; nonce?: number }>();
    
    for (const write of this.pendingWrites) {
      if (write.type === 'balance') {
        const existing = accountUpdates.get(write.address) || {};
        existing.balance = write.value as bigint;
        accountUpdates.set(write.address, existing);
      } else if (write.type === 'nonce') {
        const existing = accountUpdates.get(write.address) || {};
        existing.nonce = write.value as number;
        accountUpdates.set(write.address, existing);
      }
    }

    for (const [address, updates] of Array.from(accountUpdates.entries())) {
      try {
        const existingAccount = await this.stateStore.getAccount(address);
        const newAccount: AccountState = {
          address,
          balance: updates.balance !== undefined ? updates.balance.toString() : (existingAccount?.balance || '0'),
          nonce: updates.nonce !== undefined ? updates.nonce : (existingAccount?.nonce || 0),
          codeHash: existingAccount?.codeHash || '',
          storageRoot: existingAccount?.storageRoot || '',
        };
        await this.stateStore.putAccount(newAccount);
      } catch (e) {
        console.error('[FastPath] Failed to commit account update:', e);
      }
    }

    this.pendingWrites = [];
    this.eventEmitter.emit('committed', { count: accountUpdates.size });
  }

  isStale(): boolean {
    return Date.now() - this.snapshot.timestamp > this.maxSnapshotAgeMs;
  }

  getPendingWriteCount(): number {
    return this.pendingWrites.length;
  }

  getSnapshotStats() {
    return {
      balanceCount: this.snapshot.balances.size,
      nonceCount: this.snapshot.nonces.size,
      storageCount: this.snapshot.storage.size,
      age: Date.now() - this.snapshot.timestamp,
      pendingWrites: this.pendingWrites.length,
    };
  }

  on(event: string, listener: (...args: unknown[]) => void): void {
    this.eventEmitter.on(event, listener);
  }

  clear(): void {
    this.snapshot = {
      balances: new Map(),
      nonces: new Map(),
      storage: new Map(),
      timestamp: Date.now(),
      blockNumber: 0,
    };
    this.pendingWrites = [];
  }
}

function arraysEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export interface FastPathMetrics {
  totalExecuted: number;
  fastPathExecuted: number;
  fullEvmFallback: number;
  fastPathRatio: number;
  averageTimeUs: number;
  totalGasUsed: bigint;
  pendingWrites: number;
  snapshotAge: number;
}

export class Tbc20FastPathEngine {
  private stateAdapter: SynchronousStateAdapter;
  private registry: Tbc20Registry;
  private metrics: FastPathMetrics;
  private executionTimes: number[] = [];
  private readonly maxExecutionSamples = 1000;
  private eventEmitter: EventEmitter = new EventEmitter();
  private enabled: boolean = true;

  constructor(stateAdapter?: SynchronousStateAdapter, registry?: Tbc20Registry) {
    this.stateAdapter = stateAdapter || new SynchronousStateAdapter();
    this.registry = registry || getTbc20Registry();
    this.metrics = this.createDefaultMetrics();
  }

  private createDefaultMetrics(): FastPathMetrics {
    return {
      totalExecuted: 0,
      fastPathExecuted: 0,
      fullEvmFallback: 0,
      fastPathRatio: 0,
      averageTimeUs: 0,
      totalGasUsed: BigInt(0),
      pendingWrites: 0,
      snapshotAge: 0,
    };
  }

  isEligible(tx: Transaction): boolean {
    if (!this.enabled) return false;
    if (!tx.to) return false;
    if (!isValidTburnAddress(tx.to)) return false;
    if (tx.data.length < 4) return false;
    if (!this.registry.isFastPathEligible(tx.to)) return false;
    
    const selector = tx.data.slice(0, 4);
    return (
      arraysEqual(selector, Tbc20Selectors.TRANSFER) ||
      arraysEqual(selector, Tbc20Selectors.TRANSFER_FROM) ||
      arraysEqual(selector, Tbc20Selectors.APPROVE) ||
      arraysEqual(selector, Tbc20Selectors.BURN)
    );
  }

  execute(tx: Transaction): ExecutionResult {
    const startTime = performance.now();
    
    if (!tx.to) {
      return this.recordResult(createRevertResult("No target address"), startTime, false);
    }

    const token = tx.to;
    const info = this.registry.get(token);
    if (!info) {
      return this.recordResult(createRevertResult("Token not registered"), startTime, false);
    }

    if (info.pausable && this.isPaused(token)) {
      return this.recordResult(createRevertResult("Token is paused"), startTime, false);
    }

    const selector = tx.data.slice(0, 4);
    let result: ExecutionResult;

    if (arraysEqual(selector, Tbc20Selectors.TRANSFER)) {
      result = this.executeTransfer(tx, token, info);
    } else if (arraysEqual(selector, Tbc20Selectors.TRANSFER_FROM)) {
      result = this.executeTransferFrom(tx, token, info);
    } else if (arraysEqual(selector, Tbc20Selectors.APPROVE)) {
      result = this.executeApprove(tx, token, info);
    } else if (arraysEqual(selector, Tbc20Selectors.BURN)) {
      result = this.executeBurn(tx, token, info);
    } else {
      result = createRevertResult("Unsupported function");
    }

    return this.recordResult(result, startTime, true);
  }

  private recordResult(result: ExecutionResult, startTime: number, wasFastPath: boolean): ExecutionResult {
    const endTime = performance.now();
    const executionTimeUs = (endTime - startTime) * 1000;
    
    this.metrics.totalExecuted++;
    if (wasFastPath) {
      this.metrics.fastPathExecuted++;
    } else {
      this.metrics.fullEvmFallback++;
    }
    
    if (result.success) {
      this.metrics.totalGasUsed += BigInt(result.gasUsed);
    }
    
    this.executionTimes.push(executionTimeUs);
    if (this.executionTimes.length > this.maxExecutionSamples) {
      this.executionTimes.shift();
    }
    const sum = this.executionTimes.reduce((a, b) => a + b, 0);
    this.metrics.averageTimeUs = sum / this.executionTimes.length;
    this.metrics.fastPathRatio = this.metrics.fastPathExecuted / this.metrics.totalExecuted;
    this.metrics.pendingWrites = this.stateAdapter.getPendingWriteCount();
    
    return result;
  }

  private executeTransfer(tx: Transaction, token: TburnAddress, _info: Tbc20TokenInfo): ExecutionResult {
    const sender = tx.sender;

    if (tx.data.length < 68) {
      return createRevertResult("Invalid calldata: too short for transfer");
    }

    const toBytes = parseAddressBytes(tx.data.slice(16, 36));
    const to = bytesToAddress(toBytes);
    const amountBytes = parseU256(tx.data.slice(36, 68));
    const amount = u256ToBigInt(amountBytes);

    const senderBytes = addressToBytes(sender);
    if (!senderBytes) {
      return createRevertResult("Invalid sender address");
    }

    const senderSlot = computeBalanceSlot(senderBytes);
    const toSlot = computeBalanceSlot(toBytes);

    const senderBalanceBytes = this.stateAdapter.getStorage(token, senderSlot);
    const senderBalance = u256ToBigInt(senderBalanceBytes);

    if (senderBalance < amount) {
      return createRevertResult("TBC20: insufficient balance");
    }

    const newSenderBalance = bigIntToU256(senderBalance - amount);
    this.stateAdapter.setStorage(token, senderSlot, newSenderBalance);

    const toBalanceBytes = this.stateAdapter.getStorage(token, toSlot);
    const toBalance = u256ToBigInt(toBalanceBytes);
    const newToBalance = bigIntToU256(toBalance + amount);
    this.stateAdapter.setStorage(token, toSlot, newToBalance);

    const nonce = this.stateAdapter.getNonce(sender);
    this.stateAdapter.setNonce(sender, nonce + 1);

    const log = this.createTransferLog(token, sender, to, amountBytes);
    return createSuccessResult(TBC20_GAS_COSTS.TRANSFER, encodeBool(true), [log]);
  }

  private executeTransferFrom(tx: Transaction, token: TburnAddress, _info: Tbc20TokenInfo): ExecutionResult {
    const spender = tx.sender;

    if (tx.data.length < 100) {
      return createRevertResult("Invalid calldata: too short for transferFrom");
    }

    const fromBytes = parseAddressBytes(tx.data.slice(16, 36));
    const from = bytesToAddress(fromBytes);
    const toBytes = parseAddressBytes(tx.data.slice(48, 68));
    const to = bytesToAddress(toBytes);
    const amountBytes = parseU256(tx.data.slice(68, 100));
    const amount = u256ToBigInt(amountBytes);

    const spenderBytes = addressToBytes(spender);
    if (!spenderBytes) {
      return createRevertResult("Invalid spender address");
    }

    const allowanceSlot = computeAllowanceSlot(fromBytes, spenderBytes);
    const allowanceBytes = this.stateAdapter.getStorage(token, allowanceSlot);
    const allowance = u256ToBigInt(allowanceBytes);

    if (allowance < amount) {
      return createRevertResult("TBC20: insufficient allowance");
    }

    const fromSlot = computeBalanceSlot(fromBytes);
    const fromBalanceBytes = this.stateAdapter.getStorage(token, fromSlot);
    const fromBalance = u256ToBigInt(fromBalanceBytes);

    if (fromBalance < amount) {
      return createRevertResult("TBC20: insufficient balance");
    }

    const newAllowance = bigIntToU256(allowance - amount);
    this.stateAdapter.setStorage(token, allowanceSlot, newAllowance);

    const newFromBalance = bigIntToU256(fromBalance - amount);
    this.stateAdapter.setStorage(token, fromSlot, newFromBalance);

    const toSlot = computeBalanceSlot(toBytes);
    const toBalanceBytes = this.stateAdapter.getStorage(token, toSlot);
    const toBalance = u256ToBigInt(toBalanceBytes);
    const newToBalance = bigIntToU256(toBalance + amount);
    this.stateAdapter.setStorage(token, toSlot, newToBalance);

    const nonce = this.stateAdapter.getNonce(spender);
    this.stateAdapter.setNonce(spender, nonce + 1);

    const log = this.createTransferLog(token, from, to, amountBytes);
    return createSuccessResult(TBC20_GAS_COSTS.TRANSFER_FROM, encodeBool(true), [log]);
  }

  private executeApprove(tx: Transaction, token: TburnAddress, _info: Tbc20TokenInfo): ExecutionResult {
    const owner = tx.sender;

    if (tx.data.length < 68) {
      return createRevertResult("Invalid calldata: too short for approve");
    }

    const spenderBytes = parseAddressBytes(tx.data.slice(16, 36));
    const spender = bytesToAddress(spenderBytes);
    const amountBytes = parseU256(tx.data.slice(36, 68));

    const ownerBytes = addressToBytes(owner);
    if (!ownerBytes) {
      return createRevertResult("Invalid owner address");
    }

    const allowanceSlot = computeAllowanceSlot(ownerBytes, spenderBytes);
    this.stateAdapter.setStorage(token, allowanceSlot, amountBytes);

    const nonce = this.stateAdapter.getNonce(owner);
    this.stateAdapter.setNonce(owner, nonce + 1);

    const log = this.createApprovalLog(token, owner, spender, amountBytes);
    return createSuccessResult(TBC20_GAS_COSTS.APPROVE, encodeBool(true), [log]);
  }

  private executeBurn(tx: Transaction, token: TburnAddress, info: Tbc20TokenInfo): ExecutionResult {
    if (!info.burnable) {
      return createRevertResult("Token is not burnable");
    }

    const sender = tx.sender;

    if (tx.data.length < 36) {
      return createRevertResult("Invalid calldata: too short for burn");
    }

    const amountBytes = parseU256(tx.data.slice(4, 36));
    const amount = u256ToBigInt(amountBytes);

    const senderBytes = addressToBytes(sender);
    if (!senderBytes) {
      return createRevertResult("Invalid sender address");
    }

    const senderSlot = computeBalanceSlot(senderBytes);
    const senderBalanceBytes = this.stateAdapter.getStorage(token, senderSlot);
    const senderBalance = u256ToBigInt(senderBalanceBytes);

    if (senderBalance < amount) {
      return createRevertResult("TBC20: insufficient balance for burn");
    }

    const newSenderBalance = bigIntToU256(senderBalance - amount);
    this.stateAdapter.setStorage(token, senderSlot, newSenderBalance);

    const totalSupplySlot = slotToU256(Tbc20Slots.TOTAL_SUPPLY);
    const totalSupplyBytes = this.stateAdapter.getStorage(token, totalSupplySlot);
    const totalSupply = u256ToBigInt(totalSupplyBytes);
    const newTotalSupply = bigIntToU256(totalSupply - amount);
    this.stateAdapter.setStorage(token, totalSupplySlot, newTotalSupply);

    const nonce = this.stateAdapter.getNonce(sender);
    this.stateAdapter.setNonce(sender, nonce + 1);

    const log = this.createTransferLog(token, sender, ZERO_ADDRESS, amountBytes);
    return createSuccessResult(TBC20_GAS_COSTS.BURN, new Uint8Array(0), [log]);
  }

  private isPaused(token: TburnAddress): boolean {
    const pausedSlot = slotToU256(Tbc20Slots.PAUSED);
    const paused = this.stateAdapter.getStorage(token, pausedSlot);
    return paused[31] === 1;
  }

  private createTransferLog(token: TburnAddress, from: TburnAddress, to: TburnAddress, amount: Uint8Array): Log {
    const fromBytes = addressToBytes(from) || new Uint8Array(20);
    const toBytes = addressToBytes(to) || new Uint8Array(20);
    
    return {
      address: token,
      topics: [
        Tbc20Events.TRANSFER,
        addressBytesToH256(fromBytes),
        addressBytesToH256(toBytes),
      ],
      data: amount,
    };
  }

  private createApprovalLog(token: TburnAddress, owner: TburnAddress, spender: TburnAddress, amount: Uint8Array): Log {
    const ownerBytes = addressToBytes(owner) || new Uint8Array(20);
    const spenderBytes = addressToBytes(spender) || new Uint8Array(20);
    
    return {
      address: token,
      topics: [
        Tbc20Events.APPROVAL,
        addressBytesToH256(ownerBytes),
        addressBytesToH256(spenderBytes),
      ],
      data: amount,
    };
  }

  async preloadAddresses(addresses: string[]): Promise<void> {
    await this.stateAdapter.loadSnapshot(addresses);
  }

  async commitPendingWrites(): Promise<void> {
    await this.stateAdapter.commitWrites();
  }

  getMetrics(): FastPathMetrics {
    return { ...this.metrics };
  }

  getStateAdapter(): SynchronousStateAdapter {
    return this.stateAdapter;
  }

  getRegistry(): Tbc20Registry {
    return this.registry;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  resetMetrics(): void {
    this.metrics = this.createDefaultMetrics();
    this.executionTimes = [];
  }

  on(event: string, listener: (...args: unknown[]) => void): void {
    this.eventEmitter.on(event, listener);
  }
}

let engineInstance: Tbc20FastPathEngine | null = null;

export function getTbc20FastPathEngine(): Tbc20FastPathEngine {
  if (!engineInstance) {
    engineInstance = new Tbc20FastPathEngine();
  }
  return engineInstance;
}

export function resetTbc20FastPathEngine(): void {
  engineInstance = null;
}

export function createTestTransaction(
  sender: string,
  token: string,
  selector: Uint8Array,
  ...args: Uint8Array[]
): Transaction {
  const dataLength = 4 + args.reduce((sum, arg) => sum + arg.length, 0);
  const data = new Uint8Array(dataLength);
  data.set(selector, 0);
  let offset = 4;
  for (const arg of args) {
    data.set(arg, offset);
    offset += arg.length;
  }

  return {
    hash: new Uint8Array(32),
    sender,
    to: token,
    value: BigInt(0),
    data,
    nonce: 0,
    gasLimit: 100000,
    gasPrice: BigInt(1),
  };
}
