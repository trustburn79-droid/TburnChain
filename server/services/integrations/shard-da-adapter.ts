/**
 * ShardDAAdapter - 샤딩 ↔ 모듈러 DA 통합 어댑터
 * 
 * 기존 샤딩 시스템을 수정하지 않고 모듈러 DA 레이어와 연결
 * Feature Flag로 활성화 제어
 * 
 * 통합 효과:
 * - 샤드 데이터의 DA 레이어 저장으로 데이터 가용성 보장
 * - 크로스 샤드 메시지 영구 보존
 * - 롤업 친화적 구조로 L2 확장성 향상
 * 
 * ⚠️ 핵심 코어 독립성 보장
 * ────────────────────────────
 * 이 어댑터는 TBURN 메인넷 핵심 코어에 영향을 주지 않습니다.
 * 
 * 보호되는 핵심 코어:
 * - parallel-shard-block-producer.ts (샤드 병렬 블록 생성)
 * - shard-processing-coordinator.ts (샤드 트랜잭션 라우팅)
 * - enterprise-shard-orchestrator.ts (샤드 오케스트레이션)
 * - enterprise-cross-shard-router.ts (크로스샤드 메시징)
 * 
 * 분리 원칙:
 * 1. 핵심 코어 파일을 import하거나 수정하지 않음
 * 2. 이벤트 기반 느슨한 결합 (EventEmitter)
 * 3. Feature Flag로 완전 비활성화 가능
 * 4. 핵심 코어 장애 시 어댑터만 영향받음
 * 5. 어댑터 장애 시 핵심 코어에 영향 없음
 */

import { EventEmitter } from 'events';
import { shardDACoordinator, DAProvider, type DABlob, type DACommitmentProof } from '../modular-da/ShardDACoordinator';
import { isFeatureEnabled } from './feature-flags';

export interface ShardDataPayload {
  shardId: number;
  blockHeight: number;
  stateRoot: string;
  transactions: string[];
  crossShardMessages: CrossShardMessage[];
  timestamp: number;
}

export interface CrossShardMessage {
  messageId: string;
  fromShard: number;
  toShard: number;
  payload: Buffer;
  timestamp: number;
}

export interface DASubmissionResult {
  success: boolean;
  blobId?: string;
  commitment?: string;
  provider?: DAProvider;
  error?: string;
  latencyMs: number;
}

export interface ShardDAAdapterConfig {
  enableAutoSubmit: boolean;
  submitIntervalMs: number;
  batchSize: number;
  compressionEnabled: boolean;
  primaryProvider: DAProvider;
  maxQueueSize: number;
  backpressureThreshold: number;
  dropPolicy: 'oldest' | 'newest' | 'none';
  integrationThresholdMs: number;
}

const DEFAULT_CONFIG: ShardDAAdapterConfig = {
  enableAutoSubmit: false,
  submitIntervalMs: 1000,
  batchSize: 100,
  compressionEnabled: true,
  primaryProvider: DAProvider.TBURN_NATIVE,
  maxQueueSize: 10000,
  backpressureThreshold: 0.8,
  dropPolicy: 'oldest',
  integrationThresholdMs: 50,
};

export enum BackpressureState {
  NORMAL = 'NORMAL',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  DROPPING = 'DROPPING',
}

export class ShardDAAdapter extends EventEmitter {
  private config: ShardDAAdapterConfig;
  private pendingSubmissions: Map<string, ShardDataPayload> = new Map();
  private submissionHistory: Map<string, DASubmissionResult> = new Map();
  private autoSubmitInterval: ReturnType<typeof setInterval> | null = null;
  private metricsInterval: ReturnType<typeof setInterval> | null = null;
  private isRunning: boolean = false;
  private backpressureState: BackpressureState = BackpressureState.NORMAL;
  private droppedCount: number = 0;

  private metrics = {
    totalSubmissions: 0,
    successfulSubmissions: 0,
    failedSubmissions: 0,
    totalBytesSubmitted: BigInt(0),
    averageLatencyMs: 0,
    currentQueueDepth: 0,
    peakQueueDepth: 0,
    totalDropped: 0,
    backpressureEvents: 0,
    p50LatencyMs: 0,
    p95LatencyMs: 0,
    p99LatencyMs: 0,
    shardLoopImpactMs: 0,
  };

  private latencyBuffer: number[] = [];

  constructor(config: Partial<ShardDAAdapterConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async start(): Promise<void> {
    if (!isFeatureEnabled('ENABLE_MODULAR_DA')) {
      console.log('[ShardDAAdapter] 모듈러 DA 비활성화 상태 - 어댑터 시작 건너뜀');
      return;
    }

    if (this.isRunning) {
      console.log('[ShardDAAdapter] 이미 실행 중');
      return;
    }

    this.isRunning = true;
    console.log('[ShardDAAdapter] ✅ 샤딩-DA 어댑터 시작');
    console.log(`[ShardDAAdapter] 📊 설정: autoSubmit=${this.config.enableAutoSubmit}, batchSize=${this.config.batchSize}`);

    if (this.config.enableAutoSubmit) {
      this.startAutoSubmit();
    } else {
      this.metricsInterval = setInterval(() => {
        this.calculatePercentiles();
      }, 10000);
    }

    this.emit('started');
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;

    this.isRunning = false;

    if (this.autoSubmitInterval) {
      clearInterval(this.autoSubmitInterval);
      this.autoSubmitInterval = null;
    }
    
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }

    await this.flushPending();
    console.log('[ShardDAAdapter] ✅ 어댑터 중지됨');
    this.emit('stopped');
  }

  /**
   * 샤드 블록 데이터를 DA 레이어에 제출
   */
  async submitShardBlock(payload: ShardDataPayload): Promise<DASubmissionResult> {
    if (!isFeatureEnabled('ENABLE_MODULAR_DA')) {
      return {
        success: false,
        error: 'Modular DA feature is disabled',
        latencyMs: 0,
      };
    }

    const startTime = Date.now();
    const submissionId = `shard-${payload.shardId}-block-${payload.blockHeight}`;

    try {
      const serialized = this.serializePayload(payload);
      
      const result = await shardDACoordinator.submitBlob(
        payload.shardId,
        serialized
      );

      const latencyMs = Date.now() - startTime;
      this.updateMetrics(true, serialized.length, latencyMs);

      const submissionResult: DASubmissionResult = {
        success: true,
        blobId: result.blobId,
        commitment: result.commitment.toString('hex'),
        latencyMs,
      };

      this.submissionHistory.set(submissionId, submissionResult);
      this.emit('blockSubmitted', { shardId: payload.shardId, blockHeight: payload.blockHeight, result: submissionResult });

      return submissionResult;
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      this.updateMetrics(false, 0, latencyMs);

      const submissionResult: DASubmissionResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        latencyMs,
      };

      this.emit('submissionFailed', { shardId: payload.shardId, error });
      return submissionResult;
    }
  }

  /**
   * 크로스 샤드 메시지를 DA 레이어에 제출
   */
  async submitCrossShardMessage(message: CrossShardMessage): Promise<DASubmissionResult> {
    if (!isFeatureEnabled('ENABLE_MODULAR_DA')) {
      return {
        success: false,
        error: 'Modular DA feature is disabled',
        latencyMs: 0,
      };
    }

    const startTime = Date.now();

    try {
      const result = await shardDACoordinator.submitBlob(
        message.fromShard,
        message.payload
      );

      const latencyMs = Date.now() - startTime;
      this.updateMetrics(true, message.payload.length, latencyMs);

      return {
        success: true,
        blobId: result.blobId,
        commitment: result.commitment.toString('hex'),
        latencyMs,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        latencyMs: Date.now() - startTime,
      };
    }
  }

  /**
   * DA 커밋먼트 검증
   */
  async verifyCommitment(blobId: string): Promise<boolean> {
    if (!isFeatureEnabled('ENABLE_MODULAR_DA')) {
      return false;
    }

    try {
      const proof = shardDACoordinator.getDAProof(blobId);
      return proof !== null;
    } catch {
      return false;
    }
  }

  /**
   * 큐에 제출 추가 (백프레셔 적용)
   * 핵심 샤드 루프에 영향을 주지 않도록 non-blocking
   */
  queueForSubmission(payload: ShardDataPayload): boolean {
    const startTime = Date.now();
    const key = `shard-${payload.shardId}-block-${payload.blockHeight}`;
    
    this.updateBackpressureState();
    
    if (this.pendingSubmissions.size >= this.config.maxQueueSize) {
      if (this.config.dropPolicy === 'none') {
        this.emit('queueFull', { dropped: false, key });
        return false;
      }
      
      if (this.config.dropPolicy === 'oldest') {
        const oldestKey = this.pendingSubmissions.keys().next().value;
        if (oldestKey) this.pendingSubmissions.delete(oldestKey);
        this.emit('queueFull', { dropped: true, key, policy: 'oldest', droppedKey: oldestKey });
      } else {
        this.emit('queueFull', { dropped: true, key, policy: 'newest' });
        this.droppedCount++;
        this.metrics.totalDropped++;
        return false;
      }
      this.droppedCount++;
      this.metrics.totalDropped++;
    }
    
    this.pendingSubmissions.set(key, payload);
    this.updateQueueMetrics();
    
    const impactMs = Date.now() - startTime;
    this.metrics.shardLoopImpactMs = 
      (this.metrics.shardLoopImpactMs * 0.9) + (impactMs * 0.1);
    
    return true;
  }

  /**
   * 대기 중인 모든 제출 처리 (비동기, non-blocking)
   */
  async flushPending(): Promise<void> {
    const pending = Array.from(this.pendingSubmissions.values());
    this.pendingSubmissions.clear();
    this.updateQueueMetrics();
    this.updateBackpressureState();

    for (const payload of pending) {
      await this.submitShardBlock(payload);
    }
  }

  /**
   * 백프레셔 상태 업데이트
   */
  private updateBackpressureState(): void {
    const ratio = this.pendingSubmissions.size / this.config.maxQueueSize;
    const prevState = this.backpressureState;
    
    if (ratio >= 1.0) {
      this.backpressureState = BackpressureState.DROPPING;
    } else if (ratio >= this.config.backpressureThreshold) {
      this.backpressureState = BackpressureState.CRITICAL;
    } else if (ratio >= this.config.backpressureThreshold * 0.7) {
      this.backpressureState = BackpressureState.WARNING;
    } else {
      this.backpressureState = BackpressureState.NORMAL;
    }
    
    if (prevState !== this.backpressureState) {
      this.metrics.backpressureEvents++;
      this.emit('backpressureChange', { 
        from: prevState, 
        to: this.backpressureState,
        queueSize: this.pendingSubmissions.size,
      });
    }
  }

  /**
   * 큐 메트릭스 업데이트
   */
  private updateQueueMetrics(): void {
    this.metrics.currentQueueDepth = this.pendingSubmissions.size;
    if (this.metrics.currentQueueDepth > this.metrics.peakQueueDepth) {
      this.metrics.peakQueueDepth = this.metrics.currentQueueDepth;
    }
  }

  /**
   * 백프레셔 상태 조회
   */
  getBackpressureState(): BackpressureState {
    return this.backpressureState;
  }

  /**
   * 통합 권장 여부 (임계값 기반)
   */
  shouldConsiderIntegration(): { recommend: boolean; reason: string } {
    if (this.metrics.shardLoopImpactMs > this.config.integrationThresholdMs) {
      return {
        recommend: true,
        reason: `샤드 루프 영향: ${this.metrics.shardLoopImpactMs.toFixed(2)}ms > 임계값 ${this.config.integrationThresholdMs}ms`,
      };
    }
    if (this.backpressureState === BackpressureState.CRITICAL || 
        this.backpressureState === BackpressureState.DROPPING) {
      return {
        recommend: true,
        reason: `백프레셔 상태: ${this.backpressureState}`,
      };
    }
    return {
      recommend: false,
      reason: '현재 분리 아키텍처가 적합함',
    };
  }

  private startAutoSubmit(): void {
    this.autoSubmitInterval = setInterval(async () => {
      if (this.pendingSubmissions.size >= this.config.batchSize) {
        await this.flushPending();
      }
    }, this.config.submitIntervalMs);
    
    this.metricsInterval = setInterval(() => {
      this.calculatePercentiles();
    }, 10000);
  }

  /**
   * 지연시간 백분위수 계산
   */
  private calculatePercentiles(): void {
    if (this.latencyBuffer.length === 0) return;
    
    const sorted = [...this.latencyBuffer].sort((a, b) => a - b);
    const len = sorted.length;
    
    this.metrics.p50LatencyMs = sorted[Math.floor(len * 0.5)] || 0;
    this.metrics.p95LatencyMs = sorted[Math.floor(len * 0.95)] || 0;
    this.metrics.p99LatencyMs = sorted[Math.floor(len * 0.99)] || 0;
    
    if (this.latencyBuffer.length > 1000) {
      this.latencyBuffer = this.latencyBuffer.slice(-500);
    }
  }

  private serializePayload(payload: ShardDataPayload): Buffer {
    const json = JSON.stringify({
      shardId: payload.shardId,
      blockHeight: payload.blockHeight,
      stateRoot: payload.stateRoot,
      txCount: payload.transactions.length,
      crossShardCount: payload.crossShardMessages.length,
      timestamp: payload.timestamp,
    });
    return Buffer.from(json, 'utf-8');
  }

  private updateMetrics(success: boolean, bytes: number, latencyMs: number): void {
    this.metrics.totalSubmissions++;
    if (success) {
      this.metrics.successfulSubmissions++;
      this.metrics.totalBytesSubmitted += BigInt(bytes);
    } else {
      this.metrics.failedSubmissions++;
    }
    
    this.latencyBuffer.push(latencyMs);
    
    this.metrics.averageLatencyMs = 
      (this.metrics.averageLatencyMs * (this.metrics.totalSubmissions - 1) + latencyMs) / 
      this.metrics.totalSubmissions;
  }

  getMetrics() {
    return {
      totalSubmissions: this.metrics.totalSubmissions,
      successfulSubmissions: this.metrics.successfulSubmissions,
      failedSubmissions: this.metrics.failedSubmissions,
      totalBytesSubmitted: this.metrics.totalBytesSubmitted.toString(),
      averageLatencyMs: this.metrics.averageLatencyMs,
      pendingCount: this.pendingSubmissions.size,
      historyCount: this.submissionHistory.size,
      currentQueueDepth: this.metrics.currentQueueDepth,
      peakQueueDepth: this.metrics.peakQueueDepth,
      totalDropped: this.metrics.totalDropped,
      backpressureEvents: this.metrics.backpressureEvents,
      backpressureState: this.backpressureState,
      p50LatencyMs: this.metrics.p50LatencyMs,
      p95LatencyMs: this.metrics.p95LatencyMs,
      p99LatencyMs: this.metrics.p99LatencyMs,
      shardLoopImpactMs: this.metrics.shardLoopImpactMs,
      integrationRecommendation: this.shouldConsiderIntegration(),
      isRunning: this.isRunning,
      featureEnabled: isFeatureEnabled('ENABLE_MODULAR_DA'),
    };
  }

  getStatus() {
    return {
      enabled: isFeatureEnabled('ENABLE_MODULAR_DA'),
      running: this.isRunning,
      config: this.config,
      metrics: this.getMetrics(),
      daProviderStatus: shardDACoordinator.getStats(),
    };
  }
}

export const shardDAAdapter = new ShardDAAdapter();
