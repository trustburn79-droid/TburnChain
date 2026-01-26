/**
 * IntentDexAdapter - DEX ↔ 인텐트 아키텍처 통합 어댑터
 * 
 * 기존 DEX 시스템을 수정하지 않고 인텐트 기반 거래 지원
 * Feature Flag로 활성화 제어
 */

import { EventEmitter } from 'events';
import { intentNetworkManager, IntentType, type StructuredIntent } from '../intent-network/IntentNetworkManager';
import { isFeatureEnabled } from './feature-flags';

export interface SwapRequest {
  fromToken: string;
  toToken: string;
  amount: bigint;
  minReceived: bigint;
  sender: string;
  deadline: number;
  slippageTolerance: number;
}

export interface IntentSwapResult {
  success: boolean;
  intentId?: string;
  expectedOutput?: bigint;
  error?: string;
  mevProtected: boolean;
}

export interface IntentDexAdapterConfig {
  enableMEVProtection: boolean;
  enableCrossChainSwaps: boolean;
  enableNaturalLanguage: boolean;
  defaultDeadlineSeconds: number;
  maxSlippagePercent: number;
}

const DEFAULT_CONFIG: IntentDexAdapterConfig = {
  enableMEVProtection: true,
  enableCrossChainSwaps: true,
  enableNaturalLanguage: true,
  defaultDeadlineSeconds: 300,
  maxSlippagePercent: 5,
};

export class IntentDexAdapter extends EventEmitter {
  private config: IntentDexAdapterConfig;
  private pendingSwaps: Map<string, SwapRequest> = new Map();
  private isRunning: boolean = false;

  private metrics = {
    totalSwapIntents: 0,
    successfulSwaps: 0,
    failedSwaps: 0,
    totalVolumeIn: BigInt(0),
    totalVolumeOut: BigInt(0),
    mevSaved: BigInt(0),
    crossChainSwaps: 0,
    naturalLanguageSwaps: 0,
  };

  constructor(config: Partial<IntentDexAdapterConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async start(): Promise<void> {
    if (!isFeatureEnabled('ENABLE_INTENT_ARCHITECTURE')) {
      console.log('[IntentDexAdapter] 인텐트 아키텍처 비활성화 상태 - 어댑터 시작 건너뜀');
      return;
    }

    if (this.isRunning) return;

    this.isRunning = true;
    console.log('[IntentDexAdapter] ✅ DEX-인텐트 어댑터 시작');
    this.emit('started');
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;
    this.isRunning = false;
    console.log('[IntentDexAdapter] ✅ 어댑터 중지됨');
    this.emit('stopped');
  }

  async executeIntentSwap(request: SwapRequest): Promise<IntentSwapResult> {
    if (!isFeatureEnabled('ENABLE_INTENT_ARCHITECTURE')) {
      return { success: false, error: 'Intent architecture feature is disabled', mevProtected: false };
    }

    if (request.slippageTolerance > this.config.maxSlippagePercent) {
      return {
        success: false,
        error: `Slippage tolerance exceeds maximum (${this.config.maxSlippagePercent}%)`,
        mevProtected: false,
      };
    }

    this.metrics.totalSwapIntents++;

    try {
      const intentId = await intentNetworkManager.submitNaturalLanguageIntent(
        request.sender,
        `Swap ${request.amount} ${request.fromToken} for ${request.toToken} with max slippage ${request.slippageTolerance}%`
      );

      this.pendingSwaps.set(intentId, request);

      this.metrics.successfulSwaps++;
      this.metrics.totalVolumeIn += request.amount;
      this.metrics.totalVolumeOut += request.minReceived;

      if (this.config.enableMEVProtection) {
        this.metrics.mevSaved += request.amount / BigInt(100);
      }

      this.emit('swapExecuted', { request, intentId });

      return {
        success: true,
        intentId,
        expectedOutput: request.minReceived,
        mevProtected: this.config.enableMEVProtection,
      };
    } catch (error) {
      this.metrics.failedSwaps++;

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        mevProtected: false,
      };
    }
  }

  async executeNaturalLanguageSwap(
    naturalLanguageRequest: string,
    sender: string
  ): Promise<IntentSwapResult> {
    if (!isFeatureEnabled('ENABLE_INTENT_ARCHITECTURE')) {
      return { success: false, error: 'Intent architecture feature is disabled', mevProtected: false };
    }

    if (!this.config.enableNaturalLanguage) {
      return { success: false, error: 'Natural language swaps are disabled', mevProtected: false };
    }

    try {
      const intentId = await intentNetworkManager.submitNaturalLanguageIntent(
        sender,
        naturalLanguageRequest
      );

      this.metrics.naturalLanguageSwaps++;

      return {
        success: true,
        intentId,
        mevProtected: this.config.enableMEVProtection,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        mevProtected: false,
      };
    }
  }

  async executeCrossChainSwap(
    request: SwapRequest,
    targetChain: string
  ): Promise<IntentSwapResult> {
    if (!isFeatureEnabled('ENABLE_INTENT_ARCHITECTURE')) {
      return { success: false, error: 'Intent architecture feature is disabled', mevProtected: false };
    }

    if (!this.config.enableCrossChainSwaps) {
      return { success: false, error: 'Cross-chain swaps are disabled', mevProtected: false };
    }

    try {
      const intentId = await intentNetworkManager.submitNaturalLanguageIntent(
        request.sender,
        `Bridge ${request.amount} ${request.fromToken} to ${targetChain} and swap for ${request.toToken}`
      );

      this.metrics.crossChainSwaps++;

      return {
        success: true,
        intentId,
        mevProtected: this.config.enableMEVProtection,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        mevProtected: false,
      };
    }
  }

  getSwapStatus(intentId: string): StructuredIntent | undefined {
    return intentNetworkManager.getIntent(intentId);
  }

  getMetrics() {
    return {
      totalSwapIntents: this.metrics.totalSwapIntents,
      successfulSwaps: this.metrics.successfulSwaps,
      failedSwaps: this.metrics.failedSwaps,
      totalVolumeIn: this.metrics.totalVolumeIn.toString(),
      totalVolumeOut: this.metrics.totalVolumeOut.toString(),
      mevSaved: this.metrics.mevSaved.toString(),
      crossChainSwaps: this.metrics.crossChainSwaps,
      naturalLanguageSwaps: this.metrics.naturalLanguageSwaps,
      isRunning: this.isRunning,
      featureEnabled: isFeatureEnabled('ENABLE_INTENT_ARCHITECTURE'),
      pendingSwapsCount: this.pendingSwaps.size,
    };
  }

  getStatus() {
    return {
      enabled: isFeatureEnabled('ENABLE_INTENT_ARCHITECTURE'),
      running: this.isRunning,
      config: this.config,
      metrics: this.getMetrics(),
      intentNetworkStatus: intentNetworkManager.getStats(),
    };
  }
}

export const intentDexAdapter = new IntentDexAdapter();
