/**
 * EnhancedStakingAdapter - 스테이킹 ↔ 리스테이킹 통합 어댑터
 * 
 * 기존 스테이킹 시스템을 수정하지 않고 리스테이킹 기능 확장
 * Feature Flag로 활성화 제어
 * 
 * 통합 효과:
 * - 기존 스테이킹 포지션을 AVS에 리스테이킹
 * - 슬래싱 리스크 관리
 * - 추가 수익 창출
 */

import { EventEmitter } from 'events';
import { restakingManager, type RestakingPosition, type AVSInfo } from '../restaking/RestakingManager';
import { isFeatureEnabled } from './feature-flags';

export interface StakingPosition {
  positionId: string;
  walletAddress: string;
  amount: bigint;
  validatorId: string;
  stakedAt: number;
  lockPeriod: number;
}

export interface RestakingRequest {
  positionId: string;
  avsId: string;
  percentage: number;
}

export interface RestakingResult {
  success: boolean;
  restakingPositionId?: string;
  avsId?: string;
  amount?: bigint;
  error?: string;
}

export interface EnhancedStakingAdapterConfig {
  maxRestakingPercentage: number;
  minRestakingAmount: bigint;
  cooldownPeriodMs: number;
  enableAutoRestaking: boolean;
}

const DEFAULT_CONFIG: EnhancedStakingAdapterConfig = {
  maxRestakingPercentage: 80,
  minRestakingAmount: BigInt('1000000000000000000000'),
  cooldownPeriodMs: 24 * 60 * 60 * 1000,
  enableAutoRestaking: false,
};

export class EnhancedStakingAdapter extends EventEmitter {
  private config: EnhancedStakingAdapterConfig;
  private restakingHistory: Map<string, RestakingResult[]> = new Map();
  private isRunning: boolean = false;

  private metrics = {
    totalRestakingRequests: 0,
    successfulRestakings: 0,
    failedRestakings: 0,
    totalRestaked: BigInt(0),
    averageRestakingPercentage: 0,
  };

  constructor(config: Partial<EnhancedStakingAdapterConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async start(): Promise<void> {
    if (!isFeatureEnabled('ENABLE_RESTAKING')) {
      console.log('[EnhancedStakingAdapter] 리스테이킹 비활성화 상태 - 어댑터 시작 건너뜀');
      return;
    }

    if (this.isRunning) {
      console.log('[EnhancedStakingAdapter] 이미 실행 중');
      return;
    }

    this.isRunning = true;
    console.log('[EnhancedStakingAdapter] ✅ 스테이킹-리스테이킹 어댑터 시작');
    console.log(`[EnhancedStakingAdapter] 📊 최대 리스테이킹 비율: ${this.config.maxRestakingPercentage}%`);

    this.emit('started');
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;
    this.isRunning = false;
    console.log('[EnhancedStakingAdapter] ✅ 어댑터 중지됨');
    this.emit('stopped');
  }

  /**
   * 기존 스테이킹 포지션을 리스테이킹
   */
  async restakePosition(
    stakingPosition: StakingPosition,
    request: RestakingRequest
  ): Promise<RestakingResult> {
    if (!isFeatureEnabled('ENABLE_RESTAKING')) {
      return {
        success: false,
        error: 'Restaking feature is disabled',
      };
    }

    this.metrics.totalRestakingRequests++;

    if (request.percentage > this.config.maxRestakingPercentage) {
      return {
        success: false,
        error: `Restaking percentage exceeds maximum (${this.config.maxRestakingPercentage}%)`,
      };
    }

    const restakingAmount = (stakingPosition.amount * BigInt(request.percentage)) / BigInt(100);

    if (restakingAmount < this.config.minRestakingAmount) {
      return {
        success: false,
        error: `Restaking amount below minimum (${this.config.minRestakingAmount})`,
      };
    }

    try {
      const avsAllocations = new Map<string, bigint>();
      avsAllocations.set(request.avsId, restakingAmount);
      
      const position = await restakingManager.restake(
        stakingPosition.walletAddress,
        restakingAmount,
        avsAllocations
      );

      this.metrics.successfulRestakings++;
      this.metrics.totalRestaked += restakingAmount;
      this.updateAveragePercentage(request.percentage);

      const result: RestakingResult = {
        success: true,
        restakingPositionId: position.positionId,
        avsId: request.avsId,
        amount: restakingAmount,
      };

      this.addToHistory(stakingPosition.positionId, result);
      this.emit('positionRestaked', { stakingPosition, restakingPosition: position });

      return result;
    } catch (error) {
      this.metrics.failedRestakings++;

      const result: RestakingResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      this.addToHistory(stakingPosition.positionId, result);
      return result;
    }
  }

  /**
   * 리스테이킹 해제
   */
  async unstakeFromAVS(
    restakingPositionId: string,
    amount: bigint
  ): Promise<RestakingResult> {
    if (!isFeatureEnabled('ENABLE_RESTAKING')) {
      return {
        success: false,
        error: 'Restaking feature is disabled',
      };
    }

    try {
      await restakingManager.requestUnstake(restakingPositionId);

      return {
        success: true,
        restakingPositionId,
        amount,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 리스테이킹 가능한 AVS 목록 조회
   */
  getAvailableAVS(): AVSInfo[] {
    if (!isFeatureEnabled('ENABLE_RESTAKING')) {
      return [];
    }

    return restakingManager.getAVSList();
  }

  /**
   * 포지션의 리스테이킹 상태 조회
   */
  async getRestakingStatus(walletAddress: string): Promise<RestakingPosition[]> {
    if (!isFeatureEnabled('ENABLE_RESTAKING')) {
      return [];
    }

    const position = restakingManager.getPosition(walletAddress);
    return position ? [position] : [];
  }

  private addToHistory(positionId: string, result: RestakingResult): void {
    const history = this.restakingHistory.get(positionId) || [];
    history.push(result);
    if (history.length > 100) history.shift();
    this.restakingHistory.set(positionId, history);
  }

  private updateAveragePercentage(newPercentage: number): void {
    const total = this.metrics.successfulRestakings;
    this.metrics.averageRestakingPercentage = 
      (this.metrics.averageRestakingPercentage * (total - 1) + newPercentage) / total;
  }

  getMetrics() {
    return {
      totalRestakingRequests: this.metrics.totalRestakingRequests,
      successfulRestakings: this.metrics.successfulRestakings,
      failedRestakings: this.metrics.failedRestakings,
      totalRestaked: this.metrics.totalRestaked.toString(),
      averageRestakingPercentage: this.metrics.averageRestakingPercentage,
      isRunning: this.isRunning,
      featureEnabled: isFeatureEnabled('ENABLE_RESTAKING'),
    };
  }

  getStatus() {
    return {
      enabled: isFeatureEnabled('ENABLE_RESTAKING'),
      running: this.isRunning,
      config: this.config,
      metrics: this.getMetrics(),
      availableAVS: this.getAvailableAVS().length,
    };
  }
}

export const enhancedStakingAdapter = new EnhancedStakingAdapter();
