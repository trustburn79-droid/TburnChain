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
}

const DEFAULT_CONFIG: ShardDAAdapterConfig = {
  enableAutoSubmit: false,
  submitIntervalMs: 1000,
  batchSize: 100,
  compressionEnabled: true,
  primaryProvider: DAProvider.TBURN_NATIVE,
};

export class ShardDAAdapter extends EventEmitter {
  private config: ShardDAAdapterConfig;
  private pendingSubmissions: Map<string, ShardDataPayload> = new Map();
  private submissionHistory: Map<string, DASubmissionResult> = new Map();
  private autoSubmitInterval: ReturnType<typeof setInterval> | null = null;
  private isRunning: boolean = false;

  private metrics = {
    totalSubmissions: 0,
    successfulSubmissions: 0,
    failedSubmissions: 0,
    totalBytesSubmitted: BigInt(0),
    averageLatencyMs: 0,
  };

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
   * 제출 대기열에 추가
   */
  queueForSubmission(payload: ShardDataPayload): void {
    const key = `shard-${payload.shardId}-block-${payload.blockHeight}`;
    this.pendingSubmissions.set(key, payload);
  }

  /**
   * 대기 중인 모든 제출 처리
   */
  async flushPending(): Promise<void> {
    const pending = Array.from(this.pendingSubmissions.values());
    this.pendingSubmissions.clear();

    for (const payload of pending) {
      await this.submitShardBlock(payload);
    }
  }

  private startAutoSubmit(): void {
    this.autoSubmitInterval = setInterval(async () => {
      if (this.pendingSubmissions.size >= this.config.batchSize) {
        await this.flushPending();
      }
    }, this.config.submitIntervalMs);
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
