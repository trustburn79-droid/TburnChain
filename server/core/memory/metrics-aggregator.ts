/**
 * TBURN Enterprise Metrics Aggregator v7.0
 * 
 * Production-grade metric aggregation with advanced analytics
 * Includes percentile calculations, anomaly detection, and trend analysis
 * 
 * @version 7.0.0-enterprise
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
  p90: number;
  p95: number;
  p99: number;
  stdDev: number;
  rate: number;           // 변화율
  trend: 'up' | 'down' | 'stable';
}

export interface AnomalyDetection {
  timestamp: number;
  metricName: string;
  value: number;
  expected: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
}

interface TrendData {
  values: number[];
  timestamps: number[];
  avg: number;
  stdDev: number;
}

export class MetricsAggregator extends EventEmitter {
  private rawMetrics: CircularBuffer<MetricPoint>;
  private aggregated1m: Map<string, AggregatedMetric> = new Map();
  private aggregated1h: Map<string, AggregatedMetric> = new Map();
  private aggregated1d: Map<string, AggregatedMetric> = new Map();
  
  private trendData: Map<string, TrendData> = new Map();
  private anomalies: AnomalyDetection[] = [];
  
  private aggregateMinuteTimer: NodeJS.Timeout | null = null;
  private aggregateHourTimer: NodeJS.Timeout | null = null;
  private aggregateDayTimer: NodeJS.Timeout | null = null;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private anomalyCheckTimer: NodeJS.Timeout | null = null;
  
  private isRunning = false;
  private startTime = Date.now();
  private recordCount = 0;
  
  constructor() {
    super();
    
    // 32GB 환경: 대용량 버퍼 (10초 간격 × 100개 메트릭 × 360개 (1시간분) = 36000)
    const bufferCapacity = Math.min(
      Math.ceil((METRICS_CONFIG.RETENTION.RAW / METRICS_CONFIG.COLLECTION_INTERVAL) * 100),
      METRICS_CONFIG.MAX_DATAPOINTS
    );
    this.rawMetrics = new CircularBuffer<MetricPoint>(bufferCapacity);
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
    
    // 1일마다 집계
    this.aggregateDayTimer = setInterval(
      () => this.aggregateToDay(),
      24 * 60 * 60 * 1000
    );
    
    // 5분마다 정리
    this.cleanupTimer = setInterval(
      () => this.cleanup(),
      5 * 60 * 1000
    );
    
    // 30초마다 이상 탐지
    this.anomalyCheckTimer = setInterval(
      () => this.detectAnomalies(),
      30 * 1000
    );
    
    console.log('[MetricsAggregator] Started with buffer capacity:', 
      this.rawMetrics.getCapacity());
  }
  
  stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    
    const timers = [
      this.aggregateMinuteTimer,
      this.aggregateHourTimer,
      this.aggregateDayTimer,
      this.cleanupTimer,
      this.anomalyCheckTimer,
    ];
    
    for (const timer of timers) {
      if (timer) clearInterval(timer);
    }
    
    this.aggregateMinuteTimer = null;
    this.aggregateHourTimer = null;
    this.aggregateDayTimer = null;
    this.cleanupTimer = null;
    this.anomalyCheckTimer = null;
    
    console.log('[MetricsAggregator] Stopped');
  }
  
  // 메트릭 추가
  record(name: string, value: number, tags?: Record<string, string>): void {
    const metric: MetricPoint = {
      timestamp: Date.now(),
      name,
      value,
      tags,
    };
    this.rawMetrics.push(metric);
    this.recordCount++;
    
    // 트렌드 데이터 업데이트
    this.updateTrendData(name, value, metric.timestamp);
  }
  
  // 배치 기록 (고성능)
  recordBatch(metrics: Array<{ name: string; value: number; tags?: Record<string, string> }>): void {
    const now = Date.now();
    for (const m of metrics) {
      this.rawMetrics.push({
        timestamp: now,
        name: m.name,
        value: m.value,
        tags: m.tags,
      });
      this.updateTrendData(m.name, m.value, now);
    }
    this.recordCount += metrics.length;
  }
  
  private updateTrendData(name: string, value: number, timestamp: number): void {
    let trend = this.trendData.get(name);
    if (!trend) {
      trend = { values: [], timestamps: [], avg: 0, stdDev: 0 };
      this.trendData.set(name, trend);
    }
    
    trend.values.push(value);
    trend.timestamps.push(timestamp);
    
    // 최근 100개만 유지
    if (trend.values.length > 100) {
      trend.values.shift();
      trend.timestamps.shift();
    }
    
    // 통계 업데이트
    trend.avg = trend.values.reduce((a, b) => a + b, 0) / trend.values.length;
    trend.stdDev = this.calculateStdDev(trend.values, trend.avg);
  }
  
  // 1분 집계
  private aggregateToMinute(): void {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    
    const recentMetrics = this.rawMetrics.filterByTimeRange(oneMinuteAgo, now);
    
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
    
    // 7일 이상 된 1분 집계 삭제
    this.cleanupOldAggregates(this.aggregated1m, 7 * 24 * 60);
    
    this.emit('minuteAggregated', { timestamp: now, count: grouped.size });
  }
  
  // 1시간 집계
  private aggregateToHour(): void {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    
    const hourlyData = new Map<string, number[]>();
    
    for (const [key, agg] of this.aggregated1m) {
      const [name, timestampKey] = key.split(':');
      const timestamp = parseInt(timestampKey) * 60000;
      
      if (timestamp >= oneHourAgo && timestamp < now) {
        const values = hourlyData.get(name) || [];
        values.push(agg.avg);
        hourlyData.set(name, values);
      }
    }
    
    for (const [name, values] of hourlyData) {
      const aggregated = this.computeAggregates(name, values, now);
      const key = `${name}:${Math.floor(now / 3600000)}`;
      this.aggregated1h.set(key, aggregated);
    }
    
    // 30일 이상 된 1시간 집계 삭제
    this.cleanupOldAggregates(this.aggregated1h, 30 * 24);
    
    this.emit('hourAggregated', { timestamp: now, count: hourlyData.size });
  }
  
  // 1일 집계
  private aggregateToDay(): void {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    
    const dailyData = new Map<string, number[]>();
    
    for (const [key, agg] of this.aggregated1h) {
      const [name, timestampKey] = key.split(':');
      const timestamp = parseInt(timestampKey) * 3600000;
      
      if (timestamp >= oneDayAgo && timestamp < now) {
        const values = dailyData.get(name) || [];
        values.push(agg.avg);
        dailyData.set(name, values);
      }
    }
    
    for (const [name, values] of dailyData) {
      const aggregated = this.computeAggregates(name, values, now);
      const key = `${name}:${Math.floor(now / 86400000)}`;
      this.aggregated1d.set(key, aggregated);
    }
    
    // 1년 이상 된 1일 집계 삭제
    this.cleanupOldAggregates(this.aggregated1d, 365);
    
    this.emit('dayAggregated', { timestamp: now, count: dailyData.size });
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
        p90: 0,
        p95: 0,
        p99: 0,
        stdDev: 0,
        rate: 0,
        trend: 'stable',
      };
    }
    
    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const stdDev = this.calculateStdDev(values, avg);
    
    // 트렌드 분석
    const trendInfo = this.trendData.get(name);
    let trend: 'up' | 'down' | 'stable' = 'stable';
    let rate = 0;
    
    if (trendInfo && trendInfo.values.length >= 3) {
      const recentAvg = trendInfo.values.slice(-3).reduce((a, b) => a + b, 0) / 3;
      const oldAvg = trendInfo.values.slice(0, 3).reduce((a, b) => a + b, 0) / 
        Math.min(3, trendInfo.values.length);
      
      rate = oldAvg !== 0 ? ((recentAvg - oldAvg) / oldAvg) * 100 : 0;
      
      if (rate > 10) trend = 'up';
      else if (rate < -10) trend = 'down';
    }
    
    return {
      timestamp,
      name,
      count: values.length,
      sum,
      avg,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: this.percentile(sorted, 0.5),
      p90: this.percentile(sorted, 0.9),
      p95: this.percentile(sorted, 0.95),
      p99: this.percentile(sorted, 0.99),
      stdDev,
      rate,
      trend,
    };
  }
  
  private calculateStdDev(values: number[], avg: number): number {
    if (values.length < 2) return 0;
    const sumSquares = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0);
    return Math.sqrt(sumSquares / (values.length - 1));
  }
  
  private percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    const index = Math.ceil(p * sorted.length) - 1;
    return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
  }
  
  // 이상 탐지
  private detectAnomalies(): void {
    const now = Date.now();
    
    for (const [name, trend] of this.trendData) {
      if (trend.values.length < 10) continue;
      
      const lastValue = trend.values[trend.values.length - 1];
      const deviation = Math.abs(lastValue - trend.avg) / (trend.stdDev || 1);
      
      if (deviation > 3) {
        const severity = deviation > 5 ? 'critical' : 
                        deviation > 4 ? 'high' : 
                        deviation > 3.5 ? 'medium' : 'low';
        
        const anomaly: AnomalyDetection = {
          timestamp: now,
          metricName: name,
          value: lastValue,
          expected: trend.avg,
          deviation,
          severity,
          message: `${name} deviated by ${deviation.toFixed(2)} std devs (value: ${lastValue.toFixed(2)}, expected: ${trend.avg.toFixed(2)})`,
        };
        
        this.anomalies.push(anomaly);
        this.emit('anomalyDetected', anomaly);
        
        // 최근 100개만 유지
        if (this.anomalies.length > 100) {
          this.anomalies.shift();
        }
      }
    }
  }
  
  private cleanupOldAggregates(
    map: Map<string, AggregatedMetric>, 
    maxEntries: number
  ): void {
    if (map.size <= maxEntries) return;
    
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
    
    if (heapUsedMB > METRICS_CONFIG.MAX_MEMORY_MB * 0.8) {
      console.warn('[MetricsAggregator] Memory limit approaching, forcing cleanup');
      
      this.cleanupOldAggregates(this.aggregated1m, 24 * 60);
      this.cleanupOldAggregates(this.aggregated1h, 7 * 24);
      this.cleanupOldAggregates(this.aggregated1d, 30);
      
      // 트렌드 데이터 정리
      for (const [, trend] of this.trendData) {
        if (trend.values.length > 50) {
          trend.values = trend.values.slice(-50);
          trend.timestamps = trend.timestamps.slice(-50);
        }
      }
      
      this.emit('forceCleanup', { heapUsedMB, timestamp: Date.now() });
      
      if (typeof global.gc === 'function') {
        global.gc();
      }
    }
  }
  
  forceCleanup(): void {
    this.aggregated1m.clear();
    this.aggregated1h.clear();
    this.aggregated1d.clear();
    this.trendData.clear();
    this.anomalies = [];
    this.rawMetrics.clear();
    
    if (typeof global.gc === 'function') {
      global.gc();
    }
    
    console.log('[MetricsAggregator] Force cleanup completed');
  }
  
  // 메트릭 조회
  getRecentMetrics(name: string, durationMs: number): MetricPoint[] {
    const since = Date.now() - durationMs;
    return this.rawMetrics.filterByTimeRange(since);
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
  
  getDayAggregates(name: string, count: number): AggregatedMetric[] {
    const results: AggregatedMetric[] = [];
    const now = Date.now();
    
    for (let i = 0; i < count; i++) {
      const key = `${name}:${Math.floor((now - i * 86400000) / 86400000)}`;
      const agg = this.aggregated1d.get(key);
      if (agg) results.push(agg);
    }
    
    return results.reverse();
  }
  
  getAnomalies(since?: number): AnomalyDetection[] {
    if (!since) return [...this.anomalies];
    return this.anomalies.filter(a => a.timestamp >= since);
  }
  
  getTrend(name: string): TrendData | undefined {
    return this.trendData.get(name);
  }
  
  getStats(): {
    rawCount: number;
    rawCapacity: number;
    minute1Count: number;
    hour1Count: number;
    day1Count: number;
    trendMetrics: number;
    anomalyCount: number;
    memoryUsage: { bytes: number; items: number };
    uptime: number;
    recordsPerSecond: number;
  } {
    const uptime = (Date.now() - this.startTime) / 1000;
    
    return {
      rawCount: this.rawMetrics.getSize(),
      rawCapacity: this.rawMetrics.getCapacity(),
      minute1Count: this.aggregated1m.size,
      hour1Count: this.aggregated1h.size,
      day1Count: this.aggregated1d.size,
      trendMetrics: this.trendData.size,
      anomalyCount: this.anomalies.length,
      memoryUsage: this.rawMetrics.getMemoryUsage(),
      uptime: Date.now() - this.startTime,
      recordsPerSecond: this.recordCount / uptime,
    };
  }
  
  // Prometheus 형식 출력
  getPrometheusMetrics(): string {
    const stats = this.getStats();
    
    return [
      `# HELP tburn_metrics_raw_count Raw metric count in buffer`,
      `# TYPE tburn_metrics_raw_count gauge`,
      `tburn_metrics_raw_count ${stats.rawCount}`,
      ``,
      `# HELP tburn_metrics_raw_capacity Raw metric buffer capacity`,
      `# TYPE tburn_metrics_raw_capacity gauge`,
      `tburn_metrics_raw_capacity ${stats.rawCapacity}`,
      ``,
      `# HELP tburn_metrics_aggregated_1m 1-minute aggregates count`,
      `# TYPE tburn_metrics_aggregated_1m gauge`,
      `tburn_metrics_aggregated_1m ${stats.minute1Count}`,
      ``,
      `# HELP tburn_metrics_aggregated_1h 1-hour aggregates count`,
      `# TYPE tburn_metrics_aggregated_1h gauge`,
      `tburn_metrics_aggregated_1h ${stats.hour1Count}`,
      ``,
      `# HELP tburn_metrics_anomaly_count Detected anomalies count`,
      `# TYPE tburn_metrics_anomaly_count gauge`,
      `tburn_metrics_anomaly_count ${stats.anomalyCount}`,
      ``,
      `# HELP tburn_metrics_records_per_second Records ingested per second`,
      `# TYPE tburn_metrics_records_per_second gauge`,
      `tburn_metrics_records_per_second ${stats.recordsPerSecond.toFixed(2)}`,
    ].join('\n');
  }
}

// 싱글톤 인스턴스
export const metricsAggregator = new MetricsAggregator();
