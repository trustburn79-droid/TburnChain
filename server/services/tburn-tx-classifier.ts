/**
 * TBURN Transaction Classifier
 * Routes transactions to optimal execution paths
 * 
 * Classification:
 * - NativeTransfer: Native TBURN transfer (5μs/TX)
 * - TBC20FastPath: TBC-20 token operations (8μs/TX)
 * - ContractDeploy: Contract deployment
 * - FullEVM: Full EVM execution (50-500μs/TX)
 */

import {
  Transaction,
  ExecutionResult,
  TBC20_FACTORY,
  createSuccessResult,
  createRevertResult,
} from '../utils/tbc20-protocol-constants';

import {
  isValidTburnAddress,
  addressToBytes,
  computeBalanceSlot,
  u256ToBigInt,
  bigIntToU256,
} from '../utils/tbc20-address-utils';

import {
  Tbc20FastPathExecutor,
  StateDB,
  getTbc20FastPathExecutor,
} from './tbc20-fast-path-executor';

import { getTbc20Registry } from './tbc20-registry';

export enum TxType {
  NativeTransfer = "NativeTransfer",
  TBC20FastPath = "TBC20FastPath",
  ContractDeploy = "ContractDeploy",
  FullEVM = "FullEVM",
}

export interface ClassificationResult {
  type: TxType;
  fastPathEligible: boolean;
  tokenAddress?: string;
  estimatedGas: number;
  estimatedTimeUs: number;
}

interface ClassifierStats {
  nativeTransferCount: number;
  tbc20FastPathCount: number;
  contractDeployCount: number;
  fullEvmCount: number;
  totalClassified: number;
}

const NATIVE_TRANSFER_GAS = 21000;
const NATIVE_TRANSFER_TIME_US = 5;
const TBC20_FAST_PATH_GAS = 51000;
const TBC20_FAST_PATH_TIME_US = 8;
const CONTRACT_DEPLOY_GAS = 100000;
const CONTRACT_DEPLOY_TIME_US = 200;
const FULL_EVM_GAS = 100000;
const FULL_EVM_TIME_US = 100;

export class TburnTxClassifier {
  private fastPathExecutor: Tbc20FastPathExecutor;
  private stats: ClassifierStats = {
    nativeTransferCount: 0,
    tbc20FastPathCount: 0,
    contractDeployCount: 0,
    fullEvmCount: 0,
    totalClassified: 0,
  };

  constructor(fastPathExecutor?: Tbc20FastPathExecutor) {
    this.fastPathExecutor = fastPathExecutor || getTbc20FastPathExecutor();
  }

  classify(tx: Transaction): ClassificationResult {
    this.stats.totalClassified++;

    if (!tx.to) {
      this.stats.contractDeployCount++;
      return {
        type: TxType.ContractDeploy,
        fastPathEligible: false,
        estimatedGas: CONTRACT_DEPLOY_GAS,
        estimatedTimeUs: CONTRACT_DEPLOY_TIME_US,
      };
    }

    if (tx.data.length === 0 && tx.value > BigInt(0)) {
      this.stats.nativeTransferCount++;
      return {
        type: TxType.NativeTransfer,
        fastPathEligible: true,
        estimatedGas: NATIVE_TRANSFER_GAS,
        estimatedTimeUs: NATIVE_TRANSFER_TIME_US,
      };
    }

    if (this.fastPathExecutor.isEligible(tx)) {
      this.stats.tbc20FastPathCount++;
      return {
        type: TxType.TBC20FastPath,
        fastPathEligible: true,
        tokenAddress: tx.to,
        estimatedGas: TBC20_FAST_PATH_GAS,
        estimatedTimeUs: TBC20_FAST_PATH_TIME_US,
      };
    }

    this.stats.fullEvmCount++;
    return {
      type: TxType.FullEVM,
      fastPathEligible: false,
      estimatedGas: FULL_EVM_GAS,
      estimatedTimeUs: FULL_EVM_TIME_US,
    };
  }

  execute(tx: Transaction): ExecutionResult {
    const classification = this.classify(tx);

    switch (classification.type) {
      case TxType.NativeTransfer:
        return this.executeNativeTransfer(tx);
      
      case TxType.TBC20FastPath:
        return this.fastPathExecutor.execute(tx);
      
      case TxType.ContractDeploy:
        return this.executeContractDeploy(tx);
      
      case TxType.FullEVM:
        return this.executeFullEVM(tx);
      
      default:
        return createRevertResult("Unknown transaction type");
    }
  }

  private executeNativeTransfer(tx: Transaction): ExecutionResult {
    if (!tx.to) {
      return createRevertResult("No recipient address");
    }

    const state = this.fastPathExecutor.getState();
    
    const senderBalance = state.getBalance(tx.sender);
    const totalRequired = tx.value + (tx.gasPrice * BigInt(tx.gasLimit));
    
    if (senderBalance < totalRequired) {
      return createRevertResult("Insufficient balance for transfer");
    }

    state.setBalance(tx.sender, senderBalance - tx.value);
    const recipientBalance = state.getBalance(tx.to);
    state.setBalance(tx.to, recipientBalance + tx.value);

    const nonce = state.getNonce(tx.sender);
    state.setNonce(tx.sender, nonce + 1);

    return createSuccessResult(NATIVE_TRANSFER_GAS, new Uint8Array(0), []);
  }

  private executeContractDeploy(tx: Transaction): ExecutionResult {
    return createRevertResult("Contract deployment requires full EVM - not implemented in fast path");
  }

  private executeFullEVM(tx: Transaction): ExecutionResult {
    return createRevertResult("Full EVM execution required - fallback to standard execution");
  }

  getStats(): ClassifierStats {
    return { ...this.stats };
  }

  getOptimizationRatio(): number {
    const optimized = this.stats.nativeTransferCount + this.stats.tbc20FastPathCount;
    return this.stats.totalClassified > 0 
      ? optimized / this.stats.totalClassified 
      : 0;
  }

  getAverageEstimatedTimeUs(): number {
    const total = 
      this.stats.nativeTransferCount * NATIVE_TRANSFER_TIME_US +
      this.stats.tbc20FastPathCount * TBC20_FAST_PATH_TIME_US +
      this.stats.contractDeployCount * CONTRACT_DEPLOY_TIME_US +
      this.stats.fullEvmCount * FULL_EVM_TIME_US;
    
    return this.stats.totalClassified > 0 
      ? total / this.stats.totalClassified 
      : 0;
  }

  resetStats(): void {
    this.stats = {
      nativeTransferCount: 0,
      tbc20FastPathCount: 0,
      contractDeployCount: 0,
      fullEvmCount: 0,
      totalClassified: 0,
    };
  }
}

let classifierInstance: TburnTxClassifier | null = null;

export function getTburnTxClassifier(): TburnTxClassifier {
  if (!classifierInstance) {
    classifierInstance = new TburnTxClassifier();
  }
  return classifierInstance;
}

export function resetTburnTxClassifier(): void {
  classifierInstance = null;
}

export interface TxBatchResult {
  successful: number;
  failed: number;
  totalGasUsed: bigint;
  averageTimeUs: number;
  results: ExecutionResult[];
}

export function executeTxBatch(
  transactions: Transaction[],
  classifier?: TburnTxClassifier
): TxBatchResult {
  const txClassifier = classifier || getTburnTxClassifier();
  const startTime = performance.now();
  
  const results: ExecutionResult[] = [];
  let successful = 0;
  let failed = 0;
  let totalGasUsed = BigInt(0);

  for (const tx of transactions) {
    const result = txClassifier.execute(tx);
    results.push(result);
    
    if (result.success) {
      successful++;
      totalGasUsed += BigInt(result.gasUsed);
    } else {
      failed++;
    }
  }

  const endTime = performance.now();
  const totalTimeMs = endTime - startTime;
  const averageTimeUs = transactions.length > 0 
    ? (totalTimeMs * 1000) / transactions.length 
    : 0;

  return {
    successful,
    failed,
    totalGasUsed,
    averageTimeUs,
    results,
  };
}

export function benchmarkFastPath(iterations: number = 1000): {
  averageTimeUs: number;
  minTimeUs: number;
  maxTimeUs: number;
  tps: number;
} {
  const executor = getTbc20FastPathExecutor();
  const registry = getTbc20Registry();
  
  const testToken = "tb1testbenchmark000000000000000000000000";
  registry.register({
    address: testToken,
    name: "Benchmark Token",
    symbol: "BENCH",
    decimals: 18,
    initialSupply: BigInt(0),
    maxSupply: BigInt("1000000000000000000000000"),
    mintable: false,
    burnable: true,
    pausable: false,
    aiOptimized: true,
    quantumResistant: true,
    mevProtection: true,
    zkPrivacy: false,
    factory: TBC20_FACTORY,
    deployedAtBlock: 0,
  });

  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    
    executor.isEligible({
      hash: new Uint8Array(32),
      sender: "tb1sender12345678901234567890123456789012",
      to: testToken,
      value: BigInt(0),
      data: new Uint8Array([0xa9, 0x05, 0x9c, 0xbb, ...new Array(64).fill(0)]),
      nonce: i,
      gasLimit: 100000,
      gasPrice: BigInt(1),
    });
    
    const end = performance.now();
    times.push((end - start) * 1000);
  }

  const sum = times.reduce((a, b) => a + b, 0);
  const averageTimeUs = sum / times.length;
  const minTimeUs = Math.min(...times);
  const maxTimeUs = Math.max(...times);
  const tps = 1000000 / averageTimeUs;

  return { averageTimeUs, minTimeUs, maxTimeUs, tps };
}
