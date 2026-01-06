/**
 * TBURN Enterprise Metrics Aggregator v6.0
 * 
 * Memory-efficient metric aggregation with circular buffer storage
 * and automatic downsampling (1-minute, 1-hour aggregates)
 * 
 * @version 6.0.0-enterprise
 */

import { EventEmitter } from 'events';
import { CircularBuffer, MetricPoint } from './circular-buffer';
import { METRICS_CONFIG } from './metrics-config';

export interface AggregatedMetric {
  timestamp: number;
  name: string;
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
  p50: number;
  p95: number;
  p99: number;
}

interface MetricBucket {
  values: number[];
  count: number;
  sum: number;
  min: number;
  max: number;
}

export class MetricsAggregator extends EventEmitter {
  private rawMetrics: CircularBuffer<MetricPoint>;
  private aggregated1m: Map<string, AggregatedMetric> = new Map();
  private aggregated1h: Map<string, AggregatedMetric> = new Map();
  
  private aggregateMinuteTimer: NodeJS.Timeout | null = null;
  private aggregateHourTimer: NodeJS.Timeout | null = null;
  private cleanupTimer: NodeJS.Timeout | null = null;
  
  private isRunning = false;
  private startTime = Date.now();
  
  constructor() {
    super();
    
    // 원본 데이터: 최근 1시간만 (원형 버퍼로 메모리 고정)
    // 30초 간격 × 20개 메트릭 타입 × 120개 (1시간분) = 2400
    const bufferCapacity = Math.ceil(
      (METRICS_CONFIG.RETENTION.RAW / METRICS_CONFIG.COLLECTION_INTERVAL) * 20
    );
    this.rawMetrics = new CircularBuffer<MetricPoint>(
      Math.min(bufferCapacity, METRICS_CONFIG.MAX_DATAPOINTS)
    );
  }
  
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    
    // 1분마다 집계
    this.aggregateMinuteTimer = setInterval(
      () => this.aggregateToMinute(),
      60 * 1000
    );
    
    // 1시간마다 집계
    this.aggregateHourTimer = setInterval(
      () => this.aggregateToHour(),
      60 * 60 * 1000
    );
    
    // 10분마다 정리
    this.cleanupTimer = setInterval(
      () => this.cleanup(),
      10 * 60 * 1000
    );
    
    console.log('[MetricsAggregator] Started with buffer capacity:', 
      this.rawMetrics.getCapacity());
  }
  
  stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    
    if (this.aggregateMinuteTimer) {
      clearInterval(this.aggregateMinuteTimer);
      this.aggregateMinuteTimer = null;
    }
    if (this.aggregateHourTimer) {
      clearInterval(this.aggregateHourTimer);
      this.aggregateHourTimer = null;
    }
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    
    console.log('[MetricsAggregator] Stopped');
  }
  
  // 메트릭 추가 (원형 버퍼 - 자동 오래된 데이터 제거)
  record(name: string, value: number, tags?: Record<string, string>): void {
    const metric: MetricPoint = {
      timestamp: Date.now(),
      name,
      value,
      tags,
    };
    this.rawMetrics.push(metric);
  }
  
  // 1분 집계
  private aggregateToMinute(): void {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    
    const recentMetrics = this.rawMetrics.filter(
      m => m.timestamp >= oneMinuteAgo
    );
    
    // 메트릭 이름별로 그룹화
    const grouped = new Map<string, number[]>();
    for (const metric of recentMetrics) {
      const values = grouped.get(metric.name) || [];
      values.push(metric.value);
      grouped.set(metric.name, values);
    }
    
    // 각 메트릭에 대해 집계 계산
    for (const [name, values] of grouped) {
      const aggregated = this.computeAggregates(name, values, now);
      const key = `${name}:${Math.floor(now / 60000)}`;
      this.aggregated1m.set(key, aggregated);
    }
    
    // 24시간 이상 된 1분 집계 삭제
    this.cleanupOldAggregates(this.aggregated1m, 24 * 60);
    
    this.emit('minuteAggregated', { timestamp: now, count: grouped.size });
  }
  
  // 1시간 집계
  private aggregateToHour(): void {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    
    // 지난 1시간의 1분 집계에서 데이터 수집
    const hourlyData = new Map<string, number[]>();
    
    for (const [key, agg] of this.aggregated1m) {
      const [name, timestampKey] = key.split(':');
      const timestamp = parseInt(timestampKey) * 60000;
      
      if (timestamp >= oneHourAgo && timestamp < now) {
        const values = hourlyData.get(name) || [];
        values.push(agg.avg); // 평균값들을 사용
        hourlyData.set(name, values);
      }
    }
    
    // 1시간 집계 계산
    for (const [name, values] of hourlyData) {
      const aggregated = this.computeAggregates(name, values, now);
      const key = `${name}:${Math.floor(now / 3600000)}`;
      this.aggregated1h.set(key, aggregated);
    }
    
    // 7일 이상 된 1시간 집계 삭제
    this.cleanupOldAggregates(this.aggregated1h, 7 * 24);
    
    this.emit('hourAggregated', { timestamp: now, count: hourlyData.size });
  }
  
  private computeAggregates(
    name: string, 
    values: number[], 
    timestamp: number
  ): AggregatedMetric {
    if (values.length === 0) {
      return {
        timestamp,
        name,
        count: 0,
        sum: 0,
        avg: 0,
        min: 0,
        max: 0,
        p50: 0,
        p95: 0,
        p99: 0,
      };
    }
    
    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    
    return {
      timestamp,
      name,
      count: values.length,
      sum,
      avg: sum / values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: this.percentile(sorted, 0.5),
      p95: this.percentile(sorted, 0.95),
      p99: this.percentile(sorted, 0.99),
    };
  }
  
  private percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    const index = Math.ceil(p * sorted.length) - 1;
    return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
  }
  
  private cleanupOldAggregates(
    map: Map<string, AggregatedMetric>, 
    maxEntries: number
  ): void {
    if (map.size <= maxEntries) return;
    
    // 가장 오래된 항목들 삭제
    const entries = Array.from(map.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const toRemove = entries.slice(0, map.size - maxEntries);
    for (const [key] of toRemove) {
      map.delete(key);
    }
  }
  
  private cleanup(): void {
    const memUsage = process.memoryUsage();
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
    
    if (heapUsedMB > METRICS_CONFIG.MAX_MEMORY_MB) {
      console.warn('[MetricsAggregator] Memory limit reached, forcing cleanup');
      
      // 강제 정리: 오래된 집계 데이터 삭제
      this.cleanupOldAggregates(this.aggregated1m, 6 * 60);  // 6시간만 유지
      this.cleanupOldAggregates(this.aggregated1h, 3 * 24);  // 3일만 유지
      
      this.emit('forceCleanup', { heapUsedMB, timestamp: Date.now() });
      
      if (typeof global.gc === 'function') {
        global.gc();
      }
    }
  }
  
  forceCleanup(): void {
    this.aggregated1m.clear();
    this.aggregated1h.clear();
    this.rawMetrics.clear();
    
    if (typeof global.gc === 'function') {
      global.gc();
    }
    
    console.log('[MetricsAggregator] Force cleanup completed');
  }
  
  // 메트릭 조회
  getRecentMetrics(name: string, durationMs: number): MetricPoint[] {
    const since = Date.now() - durationMs;
    return this.rawMetrics.filter(
      m => m.name === name && m.timestamp >= since
    );
  }
  
  getMinuteAggregates(name: string, count: number): AggregatedMetric[] {
    const results: AggregatedMetric[] = [];
    const now = Date.now();
    
    for (let i = 0; i < count; i++) {
      const key = `${name}:${Math.floor((now - i * 60000) / 60000)}`;
      const agg = this.aggregated1m.get(key);
      if (agg) results.push(agg);
    }
    
    return results.reverse();
  }
  
  getHourAggregates(name: string, count: number): AggregatedMetric[] {
    const results: AggregatedMetric[] = [];
    const now = Date.now();
    
    for (let i = 0; i < count; i++) {
      const key = `${name}:${Math.floor((now - i * 3600000) / 3600000)}`;
      const agg = this.aggregated1h.get(key);
      if (agg) results.push(agg);
    }
    
    return results.reverse();
  }
  
  getStats(): {
    rawCount: number;
    rawCapacity: number;
    minute1Count: number;
    hour1Count: number;
    memoryUsage: { bytes: number; items: number };
    uptime: number;
  } {
    return {
      rawCount: this.rawMetrics.getSize(),
      rawCapacity: this.rawMetrics.getCapacity(),
      minute1Count: this.aggregated1m.size,
      hour1Count: this.aggregated1h.size,
      memoryUsage: this.rawMetrics.getMemoryUsage(),
      uptime: Date.now() - this.startTime,
    };
  }
}

// 싱글톤 인스턴스
export const metricsAggregator = new MetricsAggregator();
