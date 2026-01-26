/**
 * EnhancedStakingAdapter - 스테이킹 ↔ 리스테이킹 통합 어댑터
 * 
 * 기존 스테이킹 시스템을 수정하지 않고 리스테이킹 기능 확장
 * Feature Flag로 활성화 제어
 * 
 * 통합 효과:
 * - 기존 스테이킹 포지션을 AVS에 리스테이킹
 * - 슬래싱 리스크 관리
 * - 추가 수익 창출 (외부 AVS 운영자 수수료에서 발생)
 * 
 * ⚠️ 동시성 처리 정책:
 * ──────────────────────
 * 이 어댑터는 ConcurrencyLimiter(3)를 사용하여 동시 리스테이킹 작업을 제한합니다.
 * - 최대 3개의 동시 리스테이킹 작업만 허용
 * - 사용자별 쿨다운 기간(기본 24시간)으로 반복 제출 방지
 * - CircuitBreaker로 장애 격리, retryWithBackoff + withTimeout으로 복원력 확보
 * 
 * ⚠️ 중요: 토큰노믹스 독립성 보장
 * ────────────────────────────────
 * 리스테이킹을 통한 추가 수익은 20년 TBURN 토큰노믹스와 완전히 분리됩니다.
 * 
 * 1. 보상 출처: AVS 운영자가 지불하는 외부 수수료 (USDT, USDC 등)
 *    - TBURN 토큰 발행량과 무관
 *    - 20년 분배 일정에 영향 없음
 * 
 * 2. 분리 원칙:
 *    - 기존 스테이킹 보상: 20년 토큰노믹스에 따른 TBURN 토큰 분배
 *    - 리스테이킹 보상: AVS 운영자가 지불하는 별도 수수료 (스테이블코인)
 * 
 * 3. 회계 분리:
 *    - 리스테이킹 보상은 별도 계정(EXTERNAL_AVS_REWARDS)으로 관리
 *    - 토큰노믹스 발행량 계산에 포함되지 않음
 */

import { EventEmitter } from 'events';
import { restakingManager, type RestakingPosition, type AVSInfo } from '../restaking/RestakingManager';
import { isFeatureEnabled } from './feature-flags';
import { 
  LRUCache, 
  CircuitBreaker, 
  ConcurrencyLimiter,
  retryWithBackoff,
  withTimeout 
} from './utils/bounded-cache';

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
  private restakingHistory: LRUCache<RestakingResult[]>;
  private lastRestakeTime: Map<string, number> = new Map();
  private isRunning: boolean = false;
  private circuitBreaker: CircuitBreaker;
  private concurrencyLimiter: ConcurrencyLimiter;

  private metrics = {
    totalRestakingRequests: 0,
    successfulRestakings: 0,
    failedRestakings: 0,
    totalRestaked: BigInt(0),
    averageRestakingPercentage: 0,
    cooldownRejections: 0,
    circuitBreakerTrips: 0,
  };

  constructor(config: Partial<EnhancedStakingAdapterConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    this.restakingHistory = new LRUCache<RestakingResult[]>({
      maxSize: 500,
      ttlMs: 7 * 24 * 60 * 60 * 1000,
      onEvict: (key) => {
        this.emit('historyEvicted', { positionId: key });
      },
    });

    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeoutMs: 60000,
      halfOpenMaxCalls: 2,
    });

    this.concurrencyLimiter = new ConcurrencyLimiter(3);
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
   * 쿨다운 체크
   */
  private checkCooldown(positionId: string): boolean {
    const lastTime = this.lastRestakeTime.get(positionId);
    if (!lastTime) return true;
    return Date.now() - lastTime >= this.config.cooldownPeriodMs;
  }

  /**
   * 기존 스테이킹 포지션을 리스테이킹
   * 쿨다운 + 서킷 브레이커 + 재시도 적용
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

    if (!this.checkCooldown(stakingPosition.positionId)) {
      this.metrics.cooldownRejections++;
      return {
        success: false,
        error: `Cooldown period not elapsed (${this.config.cooldownPeriodMs}ms)`,
      };
    }

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
      const position = await this.concurrencyLimiter.execute(async () => {
        return await this.circuitBreaker.execute(async () => {
          return await retryWithBackoff(
            async () => {
              const avsAllocations = new Map<string, bigint>();
              avsAllocations.set(request.avsId, restakingAmount);
              
              return await withTimeout(
                () => restakingManager.restake(
                  stakingPosition.walletAddress,
                  restakingAmount,
                  avsAllocations
                ),
                30000,
                'Restaking operation timed out'
              );
            },
            { maxRetries: 2, baseDelayMs: 500, maxDelayMs: 5000 }
          );
        });
      });

      this.metrics.successfulRestakings++;
      this.metrics.totalRestaked += restakingAmount;
      this.updateAveragePercentage(request.percentage);
      this.lastRestakeTime.set(stakingPosition.positionId, Date.now());

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
      
      if ((error as Error).message?.includes('Circuit breaker')) {
        this.metrics.circuitBreakerTrips++;
      }

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
    if (history.length > 50) history.shift();
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
      cooldownRejections: this.metrics.cooldownRejections,
      circuitBreakerTrips: this.metrics.circuitBreakerTrips,
      circuitBreakerState: this.circuitBreaker.getState(),
      historyStats: this.restakingHistory.getStats(),
      activeCooldowns: this.lastRestakeTime.size,
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
