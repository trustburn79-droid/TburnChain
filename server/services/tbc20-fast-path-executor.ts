/**
 * TBURN TBC-20 Fast Path Executor
 * Production-Ready Implementation v2
 * 
 * EVM을 우회하고 직접 상태를 조작하여 8μs/TX 달성
 * Factory: tb1xepm7flrnk8s567dzhg27wyxth08mex0fckt2y
 */

import {
  TburnAddress,
  Transaction,
  ExecutionResult,
  Log,
  Tbc20TokenInfo,
  Tbc20Selectors,
  Tbc20Slots,
  Tbc20Events,
  TBC20_GAS_COSTS,
  createSuccessResult,
  createRevertResult,
} from '../utils/tbc20-protocol-constants';

import {
  isValidTburnAddress,
  addressToBytes,
  bytesToAddress,
  computeBalanceSlot,
  computeAllowanceSlot,
  slotToU256,
  parseAddressBytes,
  parseU256,
  u256ToBigInt,
  bigIntToU256,
  addressBytesToH256,
  encodeBool,
  bytesToHex,
  ZERO_ADDRESS,
} from '../utils/tbc20-address-utils';

import { Tbc20Registry, getTbc20Registry } from './tbc20-registry';

export interface StateDB {
  getBalance(address: TburnAddress): bigint;
  setBalance(address: TburnAddress, balance: bigint): void;
  getNonce(address: TburnAddress): number;
  setNonce(address: TburnAddress, nonce: number): void;
  getStorage(address: TburnAddress, slot: Uint8Array): Uint8Array;
  setStorage(address: TburnAddress, slot: Uint8Array, value: Uint8Array): void;
}

export class InMemoryState implements StateDB {
  private balances: Map<string, bigint> = new Map();
  private nonces: Map<string, number> = new Map();
  private storage: Map<string, Uint8Array> = new Map();

  getBalance(address: TburnAddress): bigint {
    return this.balances.get(address.toLowerCase()) || BigInt(0);
  }

  setBalance(address: TburnAddress, balance: bigint): void {
    this.balances.set(address.toLowerCase(), balance);
  }

  getNonce(address: TburnAddress): number {
    return this.nonces.get(address.toLowerCase()) || 0;
  }

  setNonce(address: TburnAddress, nonce: number): void {
    this.nonces.set(address.toLowerCase(), nonce);
  }

  private storageKey(address: TburnAddress, slot: Uint8Array): string {
    return `${address.toLowerCase()}:${bytesToHex(slot)}`;
  }

  getStorage(address: TburnAddress, slot: Uint8Array): Uint8Array {
    return this.storage.get(this.storageKey(address, slot)) || new Uint8Array(32);
  }

  setStorage(address: TburnAddress, slot: Uint8Array, value: Uint8Array): void {
    this.storage.set(this.storageKey(address, slot), value);
  }

  clear(): void {
    this.balances.clear();
    this.nonces.clear();
    this.storage.clear();
  }
}

interface ExecutorStats {
  transferCount: number;
  transferFromCount: number;
  approveCount: number;
  burnCount: number;
  failCount: number;
  totalGasUsed: bigint;
  averageExecutionTimeUs: number;
}

function arraysEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export class Tbc20FastPathExecutor {
  private state: StateDB;
  private registry: Tbc20Registry;
  private stats: ExecutorStats = {
    transferCount: 0,
    transferFromCount: 0,
    approveCount: 0,
    burnCount: 0,
    failCount: 0,
    totalGasUsed: BigInt(0),
    averageExecutionTimeUs: 0,
  };
  private executionTimes: number[] = [];
  private readonly maxExecutionTimeSamples = 1000;

  constructor(state?: StateDB, registry?: Tbc20Registry) {
    this.state = state || new InMemoryState();
    this.registry = registry || getTbc20Registry();
  }

  isEligible(tx: Transaction): boolean {
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
      return this.recordFailure(createRevertResult("No target address"));
    }

    const token = tx.to;
    const selector = tx.data.slice(0, 4);

    const info = this.registry.get(token);
    if (!info) {
      return this.recordFailure(createRevertResult("Token not registered"));
    }

    if (info.pausable && this.isPaused(token)) {
      return this.recordFailure(createRevertResult("Token is paused"));
    }

    let result: ExecutionResult;

    if (arraysEqual(selector, Tbc20Selectors.TRANSFER)) {
      this.stats.transferCount++;
      result = this.executeTransfer(tx, token, info);
    } else if (arraysEqual(selector, Tbc20Selectors.TRANSFER_FROM)) {
      this.stats.transferFromCount++;
      result = this.executeTransferFrom(tx, token, info);
    } else if (arraysEqual(selector, Tbc20Selectors.APPROVE)) {
      this.stats.approveCount++;
      result = this.executeApprove(tx, token, info);
    } else if (arraysEqual(selector, Tbc20Selectors.BURN)) {
      this.stats.burnCount++;
      result = this.executeBurn(tx, token, info);
    } else {
      result = createRevertResult("Unsupported function");
    }

    const endTime = performance.now();
    this.recordExecutionTime((endTime - startTime) * 1000);

    if (!result.success) {
      this.stats.failCount++;
    } else {
      this.stats.totalGasUsed += BigInt(result.gasUsed);
    }

    return result;
  }

  private executeTransfer(
    tx: Transaction,
    token: TburnAddress,
    _info: Tbc20TokenInfo
  ): ExecutionResult {
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

    const senderBalanceBytes = this.state.getStorage(token, senderSlot);
    const senderBalance = u256ToBigInt(senderBalanceBytes);

    if (senderBalance < amount) {
      return createRevertResult("TBC20: insufficient balance");
    }

    const newSenderBalance = bigIntToU256(senderBalance - amount);
    this.state.setStorage(token, senderSlot, newSenderBalance);

    const toBalanceBytes = this.state.getStorage(token, toSlot);
    const toBalance = u256ToBigInt(toBalanceBytes);
    const newToBalance = bigIntToU256(toBalance + amount);
    this.state.setStorage(token, toSlot, newToBalance);

    const nonce = this.state.getNonce(sender);
    this.state.setNonce(sender, nonce + 1);

    const log = this.createTransferLog(token, sender, to, amountBytes);

    return createSuccessResult(TBC20_GAS_COSTS.TRANSFER, encodeBool(true), [log]);
  }

  private executeTransferFrom(
    tx: Transaction,
    token: TburnAddress,
    _info: Tbc20TokenInfo
  ): ExecutionResult {
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
    const allowanceBytes = this.state.getStorage(token, allowanceSlot);
    const allowance = u256ToBigInt(allowanceBytes);

    if (allowance < amount) {
      return createRevertResult("TBC20: insufficient allowance");
    }

    const fromSlot = computeBalanceSlot(fromBytes);
    const fromBalanceBytes = this.state.getStorage(token, fromSlot);
    const fromBalance = u256ToBigInt(fromBalanceBytes);

    if (fromBalance < amount) {
      return createRevertResult("TBC20: insufficient balance");
    }

    const newAllowance = bigIntToU256(allowance - amount);
    this.state.setStorage(token, allowanceSlot, newAllowance);

    const newFromBalance = bigIntToU256(fromBalance - amount);
    this.state.setStorage(token, fromSlot, newFromBalance);

    const toSlot = computeBalanceSlot(toBytes);
    const toBalanceBytes = this.state.getStorage(token, toSlot);
    const toBalance = u256ToBigInt(toBalanceBytes);
    const newToBalance = bigIntToU256(toBalance + amount);
    this.state.setStorage(token, toSlot, newToBalance);

    const nonce = this.state.getNonce(spender);
    this.state.setNonce(spender, nonce + 1);

    const log = this.createTransferLog(token, from, to, amountBytes);

    return createSuccessResult(TBC20_GAS_COSTS.TRANSFER_FROM, encodeBool(true), [log]);
  }

  private executeApprove(
    tx: Transaction,
    token: TburnAddress,
    _info: Tbc20TokenInfo
  ): ExecutionResult {
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
    this.state.setStorage(token, allowanceSlot, amountBytes);

    const nonce = this.state.getNonce(owner);
    this.state.setNonce(owner, nonce + 1);

    const log = this.createApprovalLog(token, owner, spender, amountBytes);

    return createSuccessResult(TBC20_GAS_COSTS.APPROVE, encodeBool(true), [log]);
  }

  private executeBurn(
    tx: Transaction,
    token: TburnAddress,
    info: Tbc20TokenInfo
  ): ExecutionResult {
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
    const senderBalanceBytes = this.state.getStorage(token, senderSlot);
    const senderBalance = u256ToBigInt(senderBalanceBytes);

    if (senderBalance < amount) {
      return createRevertResult("TBC20: insufficient balance for burn");
    }

    const newSenderBalance = bigIntToU256(senderBalance - amount);
    this.state.setStorage(token, senderSlot, newSenderBalance);

    const totalSupplySlot = slotToU256(Tbc20Slots.TOTAL_SUPPLY);
    const totalSupplyBytes = this.state.getStorage(token, totalSupplySlot);
    const totalSupply = u256ToBigInt(totalSupplyBytes);
    const newTotalSupply = bigIntToU256(totalSupply - amount);
    this.state.setStorage(token, totalSupplySlot, newTotalSupply);

    const nonce = this.state.getNonce(sender);
    this.state.setNonce(sender, nonce + 1);

    const log = this.createTransferLog(token, sender, ZERO_ADDRESS, amountBytes);

    return createSuccessResult(TBC20_GAS_COSTS.BURN, new Uint8Array(0), [log]);
  }

  private isPaused(token: TburnAddress): boolean {
    const pausedSlot = slotToU256(Tbc20Slots.PAUSED);
    const paused = this.state.getStorage(token, pausedSlot);
    return paused[31] === 1;
  }

  private createTransferLog(
    token: TburnAddress,
    from: TburnAddress,
    to: TburnAddress,
    amount: Uint8Array
  ): Log {
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

  private createApprovalLog(
    token: TburnAddress,
    owner: TburnAddress,
    spender: TburnAddress,
    amount: Uint8Array
  ): Log {
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

  private recordFailure(result: ExecutionResult): ExecutionResult {
    this.stats.failCount++;
    return result;
  }

  private recordExecutionTime(microseconds: number): void {
    this.executionTimes.push(microseconds);
    if (this.executionTimes.length > this.maxExecutionTimeSamples) {
      this.executionTimes.shift();
    }
    const sum = this.executionTimes.reduce((a, b) => a + b, 0);
    this.stats.averageExecutionTimeUs = sum / this.executionTimes.length;
  }

  getStats(): ExecutorStats {
    return { ...this.stats };
  }

  getState(): StateDB {
    return this.state;
  }

  getRegistry(): Tbc20Registry {
    return this.registry;
  }

  resetStats(): void {
    this.stats = {
      transferCount: 0,
      transferFromCount: 0,
      approveCount: 0,
      burnCount: 0,
      failCount: 0,
      totalGasUsed: BigInt(0),
      averageExecutionTimeUs: 0,
    };
    this.executionTimes = [];
  }
}

let executorInstance: Tbc20FastPathExecutor | null = null;

export function getTbc20FastPathExecutor(): Tbc20FastPathExecutor {
  if (!executorInstance) {
    executorInstance = new Tbc20FastPathExecutor();
  }
  return executorInstance;
}

export function resetTbc20FastPathExecutor(): void {
  executorInstance = null;
}

export function createTbc20Transaction(params: {
  sender: TburnAddress;
  to: TburnAddress;
  selector: Uint8Array;
  args: Uint8Array[];
  nonce?: number;
  gasLimit?: number;
  gasPrice?: bigint;
}): Transaction {
  const data = new Uint8Array(4 + params.args.reduce((sum, arg) => sum + arg.length, 0));
  data.set(params.selector, 0);
  let offset = 4;
  for (const arg of params.args) {
    data.set(arg, offset);
    offset += arg.length;
  }

  return {
    hash: new Uint8Array(32),
    sender: params.sender,
    to: params.to,
    value: BigInt(0),
    data,
    nonce: params.nonce || 0,
    gasLimit: params.gasLimit || 100000,
    gasPrice: params.gasPrice || BigInt(1),
  };
}

export function createTransferTransaction(
  sender: TburnAddress,
  token: TburnAddress,
  to: TburnAddress,
  amount: bigint
): Transaction {
  const toBytes = addressToBytes(to) || new Uint8Array(20);
  const toPadded = new Uint8Array(32);
  toPadded.set(toBytes, 12);
  
  return createTbc20Transaction({
    sender,
    to: token,
    selector: Tbc20Selectors.TRANSFER,
    args: [toPadded, bigIntToU256(amount)],
  });
}

export function createApproveTransaction(
  owner: TburnAddress,
  token: TburnAddress,
  spender: TburnAddress,
  amount: bigint
): Transaction {
  const spenderBytes = addressToBytes(spender) || new Uint8Array(20);
  const spenderPadded = new Uint8Array(32);
  spenderPadded.set(spenderBytes, 12);
  
  return createTbc20Transaction({
    sender: owner,
    to: token,
    selector: Tbc20Selectors.APPROVE,
    args: [spenderPadded, bigIntToU256(amount)],
  });
}

export function createBurnTransaction(
  sender: TburnAddress,
  token: TburnAddress,
  amount: bigint
): Transaction {
  return createTbc20Transaction({
    sender,
    to: token,
    selector: Tbc20Selectors.BURN,
    args: [bigIntToU256(amount)],
  });
}
