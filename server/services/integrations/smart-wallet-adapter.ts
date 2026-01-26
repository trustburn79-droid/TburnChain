/**
 * SmartWalletAdapter - 지갑 ↔ 어카운트 추상화 통합 어댑터
 * 
 * 기존 지갑 시스템을 수정하지 않고 AA 기능 확장
 * Feature Flag로 활성화 제어
 */

import { EventEmitter } from 'events';
import { tbc4337Manager, type SmartWalletConfig, type UserOperation } from '../account-abstraction/TBC4337Manager';
import { isFeatureEnabled } from './feature-flags';

export interface LegacyWallet {
  address: string;
  type: 'EOA' | 'CONTRACT';
  createdAt: number;
  balance: bigint;
}

export interface SmartWalletUpgradeResult {
  success: boolean;
  smartWalletAddress?: string;
  error?: string;
}

export interface GaslessTransactionResult {
  success: boolean;
  userOpHash?: string;
  gasSponsored?: bigint;
  error?: string;
}

export interface SmartWalletAdapterConfig {
  enableGaslessTransactions: boolean;
  enableSocialRecovery: boolean;
  enableSessionKeys: boolean;
  defaultPaymaster: string;
  maxGasSponsorPerTx: bigint;
}

const DEFAULT_CONFIG: SmartWalletAdapterConfig = {
  enableGaslessTransactions: true,
  enableSocialRecovery: true,
  enableSessionKeys: true,
  defaultPaymaster: 'tburn-paymaster-001',
  maxGasSponsorPerTx: BigInt('100000000000000'),
};

export class SmartWalletAdapter extends EventEmitter {
  private config: SmartWalletAdapterConfig;
  private upgradedWallets: Map<string, string> = new Map();
  private isRunning: boolean = false;

  private metrics = {
    totalUpgrades: 0,
    successfulUpgrades: 0,
    gaslessTransactions: 0,
    totalGasSponsored: BigInt(0),
    sessionKeysCreated: 0,
    recoveryInitiated: 0,
  };

  constructor(config: Partial<SmartWalletAdapterConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async start(): Promise<void> {
    if (!isFeatureEnabled('ENABLE_ACCOUNT_ABSTRACTION')) {
      console.log('[SmartWalletAdapter] 어카운트 추상화 비활성화 상태 - 어댑터 시작 건너뜀');
      return;
    }

    if (this.isRunning) return;

    this.isRunning = true;
    console.log('[SmartWalletAdapter] ✅ 지갑-AA 어댑터 시작');
    this.emit('started');
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;
    this.isRunning = false;
    console.log('[SmartWalletAdapter] ✅ 어댑터 중지됨');
    this.emit('stopped');
  }

  async upgradeToSmartWallet(
    legacyWallet: LegacyWallet,
    guardians?: string[]
  ): Promise<SmartWalletUpgradeResult> {
    if (!isFeatureEnabled('ENABLE_ACCOUNT_ABSTRACTION')) {
      return { success: false, error: 'Account abstraction feature is disabled' };
    }

    this.metrics.totalUpgrades++;

    if (this.upgradedWallets.has(legacyWallet.address)) {
      return {
        success: true,
        smartWalletAddress: this.upgradedWallets.get(legacyWallet.address),
      };
    }

    try {
      const walletConfig: SmartWalletConfig = {
        owner: legacyWallet.address,
        guardians: guardians || [],
        recoveryThreshold: Math.max(1, Math.floor((guardians?.length || 0) / 2)),
        sessionKeys: [],
        modules: [],
      };

      const smartWalletAddress = await tbc4337Manager.createSmartWallet(walletConfig);
      this.upgradedWallets.set(legacyWallet.address, smartWalletAddress);
      this.metrics.successfulUpgrades++;

      this.emit('walletUpgraded', { legacy: legacyWallet, smartWalletAddress });

      return { success: true, smartWalletAddress };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async executeGaslessTransaction(
    walletAddress: string,
    target: string,
    value: bigint,
    calldata: string
  ): Promise<GaslessTransactionResult> {
    if (!isFeatureEnabled('ENABLE_ACCOUNT_ABSTRACTION')) {
      return { success: false, error: 'Account abstraction feature is disabled' };
    }

    if (!this.config.enableGaslessTransactions) {
      return { success: false, error: 'Gasless transactions are disabled' };
    }

    try {
      const userOp: UserOperation = {
        sender: walletAddress,
        nonce: BigInt(0),
        initCode: Buffer.alloc(0),
        callData: Buffer.from(calldata, 'hex'),
        callGasLimit: BigInt(100000),
        verificationGasLimit: BigInt(50000),
        preVerificationGas: BigInt(21000),
        maxFeePerGas: BigInt(1000000000),
        maxPriorityFeePerGas: BigInt(100000000),
        paymasterAndData: Buffer.from(this.config.defaultPaymaster),
        signature: Buffer.alloc(65),
      };

      const userOpHash = await tbc4337Manager.submitUserOp(userOp);
      this.metrics.gaslessTransactions++;
      this.metrics.totalGasSponsored += BigInt(21000) * BigInt(1000000000);

      this.emit('gaslessExecuted', { wallet: walletAddress, userOpHash });

      return {
        success: true,
        userOpHash,
        gasSponsored: BigInt(21000) * BigInt(1000000000),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async createSessionKey(
    walletAddress: string,
    permissions: string[],
    expiresIn: number
  ): Promise<{ success: boolean; sessionKey?: string; error?: string }> {
    if (!isFeatureEnabled('ENABLE_ACCOUNT_ABSTRACTION')) {
      return { success: false, error: 'Account abstraction feature is disabled' };
    }

    if (!this.config.enableSessionKeys) {
      return { success: false, error: 'Session keys are disabled' };
    }

    try {
      const keyConfig = {
        key: `session-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        validUntil: Date.now() + expiresIn,
        validAfter: Date.now(),
        spendingLimit: BigInt('1000000000000000000'),
        allowedSelectors: permissions,
        allowedTargets: [],
      };

      await tbc4337Manager.addSessionKey(walletAddress, keyConfig, Buffer.alloc(65));
      this.metrics.sessionKeysCreated++;

      return { success: true, sessionKey: keyConfig.key };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async initiateRecovery(
    walletAddress: string,
    newOwner: string,
    guardianSignatures: string[]
  ): Promise<{ success: boolean; recoveryId?: string; error?: string }> {
    if (!isFeatureEnabled('ENABLE_ACCOUNT_ABSTRACTION')) {
      return { success: false, error: 'Account abstraction feature is disabled' };
    }

    if (!this.config.enableSocialRecovery) {
      return { success: false, error: 'Social recovery is disabled' };
    }

    try {
      const recoveryId = await tbc4337Manager.initiateRecovery(
        walletAddress,
        newOwner,
        Buffer.from(guardianSignatures[0] || '', 'hex'),
        guardianSignatures[1] || walletAddress
      );

      this.metrics.recoveryInitiated++;

      return { success: true, recoveryId };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  getSmartWalletAddress(legacyAddress: string): string | undefined {
    return this.upgradedWallets.get(legacyAddress);
  }

  getMetrics() {
    return {
      totalUpgrades: this.metrics.totalUpgrades,
      successfulUpgrades: this.metrics.successfulUpgrades,
      gaslessTransactions: this.metrics.gaslessTransactions,
      totalGasSponsored: this.metrics.totalGasSponsored.toString(),
      sessionKeysCreated: this.metrics.sessionKeysCreated,
      recoveryInitiated: this.metrics.recoveryInitiated,
      isRunning: this.isRunning,
      featureEnabled: isFeatureEnabled('ENABLE_ACCOUNT_ABSTRACTION'),
    };
  }

  getStatus() {
    return {
      enabled: isFeatureEnabled('ENABLE_ACCOUNT_ABSTRACTION'),
      running: this.isRunning,
      config: {
        ...this.config,
        maxGasSponsorPerTx: this.config.maxGasSponsorPerTx.toString(),
      },
      metrics: this.getMetrics(),
      upgradedWalletCount: this.upgradedWallets.size,
    };
  }
}

export const smartWalletAdapter = new SmartWalletAdapter();
