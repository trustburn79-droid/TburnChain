import { EventEmitter } from 'events';

export interface TelemetryThresholds {
  maxPendingWrites: number;
  maxSnapshotAgeMs: number;
  maxExecutionTimeUs: number;
  warnPendingWriteRatio: number;
  warnSnapshotAgeRatio: number;
}

export interface ShardTelemetryMetrics {
  shardId: number;
  pendingWriteDepth: number;
  snapshotAgeMs: number;
  lastExecutionTimeUs: number;
  avgExecutionTimeUs: number;
  txProcessed: number;
  txFailed: number;
  fastPathHitRate: number;
  timestamp: number;
}

export interface TelemetryAlert {
  type: 'warning' | 'critical';
  category: 'pending_writes' | 'snapshot_age' | 'execution_time' | 'throughput';
  shardId: number;
  message: string;
  currentValue: number;
  threshold: number;
  timestamp: number;
}

const DEFAULT_THRESHOLDS: TelemetryThresholds = {
  maxPendingWrites: 1000,
  maxSnapshotAgeMs: 100,
  maxExecutionTimeUs: 50,
  warnPendingWriteRatio: 0.7,
  warnSnapshotAgeRatio: 0.8,
};

class TBC20FastPathTelemetry extends EventEmitter {
  private static instance: TBC20FastPathTelemetry;
  private thresholds: TelemetryThresholds;
  private shardMetrics: Map<number, ShardTelemetryMetrics>;
  private alertHistory: TelemetryAlert[];
  private readonly maxAlertHistory = 1000;
  private checkInterval: NodeJS.Timeout | null = null;
  private readonly checkIntervalMs = 5000;

  private constructor() {
    super();
    this.thresholds = { ...DEFAULT_THRESHOLDS };
    this.shardMetrics = new Map();
    this.alertHistory = [];
  }

  static getInstance(): TBC20FastPathTelemetry {
    if (!TBC20FastPathTelemetry.instance) {
      TBC20FastPathTelemetry.instance = new TBC20FastPathTelemetry();
    }
    return TBC20FastPathTelemetry.instance;
  }

  start(): void {
    if (this.checkInterval) return;
    
    this.checkInterval = setInterval(() => {
      this.checkAllShards();
    }, this.checkIntervalMs);

    console.log('[TBC20-Telemetry] ✅ Shard telemetry monitoring started');
    console.log(`[TBC20-Telemetry] 📊 Thresholds: pending=${this.thresholds.maxPendingWrites}, snapshotAge=${this.thresholds.maxSnapshotAgeMs}ms, execTime=${this.thresholds.maxExecutionTimeUs}μs`);
  }

  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('[TBC20-Telemetry] ⏹️ Shard telemetry monitoring stopped');
    }
  }

  updateThresholds(thresholds: Partial<TelemetryThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
    console.log('[TBC20-Telemetry] 🔧 Thresholds updated:', this.thresholds);
  }

  getThresholds(): TelemetryThresholds {
    return { ...this.thresholds };
  }

  recordShardMetrics(shardId: number, metrics: Partial<ShardTelemetryMetrics>): void {
    const existing = this.shardMetrics.get(shardId) || this.createDefaultMetrics(shardId);
    
    const updated: ShardTelemetryMetrics = {
      ...existing,
      ...metrics,
      shardId,
      timestamp: Date.now(),
    };

    if (metrics.lastExecutionTimeUs !== undefined) {
      const alpha = 0.1;
      updated.avgExecutionTimeUs = existing.avgExecutionTimeUs * (1 - alpha) + metrics.lastExecutionTimeUs * alpha;
    }

    this.shardMetrics.set(shardId, updated);
    this.checkShardThresholds(updated);
  }

  private createDefaultMetrics(shardId: number): ShardTelemetryMetrics {
    return {
      shardId,
      pendingWriteDepth: 0,
      snapshotAgeMs: 0,
      lastExecutionTimeUs: 0,
      avgExecutionTimeUs: 8,
      txProcessed: 0,
      txFailed: 0,
      fastPathHitRate: 1.0,
      timestamp: Date.now(),
    };
  }

  private checkShardThresholds(metrics: ShardTelemetryMetrics): void {
    const { shardId, pendingWriteDepth, snapshotAgeMs, avgExecutionTimeUs } = metrics;
    const now = Date.now();

    const pendingWriteRatio = pendingWriteDepth / this.thresholds.maxPendingWrites;
    if (pendingWriteRatio >= 1.0) {
      this.emitAlert({
        type: 'critical',
        category: 'pending_writes',
        shardId,
        message: `Shard ${shardId}: Pending write depth CRITICAL (${pendingWriteDepth}/${this.thresholds.maxPendingWrites})`,
        currentValue: pendingWriteDepth,
        threshold: this.thresholds.maxPendingWrites,
        timestamp: now,
      });
    } else if (pendingWriteRatio >= this.thresholds.warnPendingWriteRatio) {
      this.emitAlert({
        type: 'warning',
        category: 'pending_writes',
        shardId,
        message: `Shard ${shardId}: Pending write depth approaching limit (${pendingWriteDepth}/${this.thresholds.maxPendingWrites})`,
        currentValue: pendingWriteDepth,
        threshold: this.thresholds.maxPendingWrites,
        timestamp: now,
      });
    }

    const snapshotAgeRatio = snapshotAgeMs / this.thresholds.maxSnapshotAgeMs;
    if (snapshotAgeRatio >= 1.0) {
      this.emitAlert({
        type: 'critical',
        category: 'snapshot_age',
        shardId,
        message: `Shard ${shardId}: Snapshot age CRITICAL (${snapshotAgeMs}ms/${this.thresholds.maxSnapshotAgeMs}ms)`,
        currentValue: snapshotAgeMs,
        threshold: this.thresholds.maxSnapshotAgeMs,
        timestamp: now,
      });
    } else if (snapshotAgeRatio >= this.thresholds.warnSnapshotAgeRatio) {
      this.emitAlert({
        type: 'warning',
        category: 'snapshot_age',
        shardId,
        message: `Shard ${shardId}: Snapshot age approaching limit (${snapshotAgeMs}ms/${this.thresholds.maxSnapshotAgeMs}ms)`,
        currentValue: snapshotAgeMs,
        threshold: this.thresholds.maxSnapshotAgeMs,
        timestamp: now,
      });
    }

    if (avgExecutionTimeUs > this.thresholds.maxExecutionTimeUs) {
      this.emitAlert({
        type: 'warning',
        category: 'execution_time',
        shardId,
        message: `Shard ${shardId}: Average execution time exceeds target (${avgExecutionTimeUs.toFixed(1)}μs/${this.thresholds.maxExecutionTimeUs}μs)`,
        currentValue: avgExecutionTimeUs,
        threshold: this.thresholds.maxExecutionTimeUs,
        timestamp: now,
      });
    }
  }

  private emitAlert(alert: TelemetryAlert): void {
    this.alertHistory.push(alert);
    if (this.alertHistory.length > this.maxAlertHistory) {
      this.alertHistory.shift();
    }

    this.emit('alert', alert);
    
    const prefix = alert.type === 'critical' ? '🚨' : '⚠️';
    console.log(`[TBC20-Telemetry] ${prefix} ${alert.message}`);
  }

  private checkAllShards(): void {
    const now = Date.now();
    const entries = Array.from(this.shardMetrics.entries());
    for (const [shardId, metrics] of entries) {
      const staleness = now - metrics.timestamp;
      if (staleness > 30000) {
        console.log(`[TBC20-Telemetry] ⚠️ Shard ${shardId} metrics stale (${(staleness / 1000).toFixed(1)}s since last update)`);
      }
    }
  }

  getShardMetrics(shardId: number): ShardTelemetryMetrics | undefined {
    return this.shardMetrics.get(shardId);
  }

  getAllShardMetrics(): ShardTelemetryMetrics[] {
    return Array.from(this.shardMetrics.values());
  }

  getRecentAlerts(limit: number = 50): TelemetryAlert[] {
    return this.alertHistory.slice(-limit);
  }

  getAlertsByType(type: 'warning' | 'critical'): TelemetryAlert[] {
    return this.alertHistory.filter(a => a.type === type);
  }

  getAlertsByShard(shardId: number): TelemetryAlert[] {
    return this.alertHistory.filter(a => a.shardId === shardId);
  }

  getAggregatedStats(): {
    totalShards: number;
    activeShards: number;
    totalTxProcessed: number;
    totalTxFailed: number;
    avgPendingWrites: number;
    avgSnapshotAge: number;
    avgExecutionTime: number;
    globalFastPathHitRate: number;
    warningCount: number;
    criticalCount: number;
  } {
    const metrics = this.getAllShardMetrics();
    const now = Date.now();
    const activeThreshold = 60000;

    const activeMetrics = metrics.filter(m => now - m.timestamp < activeThreshold);
    
    const totalTxProcessed = metrics.reduce((sum, m) => sum + m.txProcessed, 0);
    const totalTxFailed = metrics.reduce((sum, m) => sum + m.txFailed, 0);
    
    const avgPendingWrites = activeMetrics.length > 0
      ? activeMetrics.reduce((sum, m) => sum + m.pendingWriteDepth, 0) / activeMetrics.length
      : 0;
    
    const avgSnapshotAge = activeMetrics.length > 0
      ? activeMetrics.reduce((sum, m) => sum + m.snapshotAgeMs, 0) / activeMetrics.length
      : 0;
    
    const avgExecutionTime = activeMetrics.length > 0
      ? activeMetrics.reduce((sum, m) => sum + m.avgExecutionTimeUs, 0) / activeMetrics.length
      : 0;

    const globalFastPathHitRate = activeMetrics.length > 0
      ? activeMetrics.reduce((sum, m) => sum + m.fastPathHitRate, 0) / activeMetrics.length
      : 0;

    const recentAlerts = this.alertHistory.filter(a => now - a.timestamp < 300000);
    const warningCount = recentAlerts.filter(a => a.type === 'warning').length;
    const criticalCount = recentAlerts.filter(a => a.type === 'critical').length;

    return {
      totalShards: metrics.length,
      activeShards: activeMetrics.length,
      totalTxProcessed,
      totalTxFailed,
      avgPendingWrites,
      avgSnapshotAge,
      avgExecutionTime,
      globalFastPathHitRate,
      warningCount,
      criticalCount,
    };
  }

  clearAlerts(): void {
    this.alertHistory = [];
    console.log('[TBC20-Telemetry] 🗑️ Alert history cleared');
  }

  exportPrometheusMetrics(): string {
    const stats = this.getAggregatedStats();
    const metrics = this.getAllShardMetrics();
    
    let output = '# HELP tbc20_fast_path_total_shards Total number of shards with telemetry data\n';
    output += '# TYPE tbc20_fast_path_total_shards gauge\n';
    output += `tbc20_fast_path_total_shards ${stats.totalShards}\n\n`;

    output += '# HELP tbc20_fast_path_active_shards Number of active shards (updated within 60s)\n';
    output += '# TYPE tbc20_fast_path_active_shards gauge\n';
    output += `tbc20_fast_path_active_shards ${stats.activeShards}\n\n`;

    output += '# HELP tbc20_fast_path_tx_processed_total Total transactions processed\n';
    output += '# TYPE tbc20_fast_path_tx_processed_total counter\n';
    output += `tbc20_fast_path_tx_processed_total ${stats.totalTxProcessed}\n\n`;

    output += '# HELP tbc20_fast_path_tx_failed_total Total transactions failed\n';
    output += '# TYPE tbc20_fast_path_tx_failed_total counter\n';
    output += `tbc20_fast_path_tx_failed_total ${stats.totalTxFailed}\n\n`;

    output += '# HELP tbc20_fast_path_avg_pending_writes Average pending write depth\n';
    output += '# TYPE tbc20_fast_path_avg_pending_writes gauge\n';
    output += `tbc20_fast_path_avg_pending_writes ${stats.avgPendingWrites.toFixed(2)}\n\n`;

    output += '# HELP tbc20_fast_path_avg_snapshot_age_ms Average snapshot age in milliseconds\n';
    output += '# TYPE tbc20_fast_path_avg_snapshot_age_ms gauge\n';
    output += `tbc20_fast_path_avg_snapshot_age_ms ${stats.avgSnapshotAge.toFixed(2)}\n\n`;

    output += '# HELP tbc20_fast_path_avg_execution_time_us Average execution time in microseconds\n';
    output += '# TYPE tbc20_fast_path_avg_execution_time_us gauge\n';
    output += `tbc20_fast_path_avg_execution_time_us ${stats.avgExecutionTime.toFixed(2)}\n\n`;

    output += '# HELP tbc20_fast_path_hit_rate Global fast path hit rate\n';
    output += '# TYPE tbc20_fast_path_hit_rate gauge\n';
    output += `tbc20_fast_path_hit_rate ${stats.globalFastPathHitRate.toFixed(4)}\n\n`;

    output += '# HELP tbc20_fast_path_pending_writes Pending write depth per shard\n';
    output += '# TYPE tbc20_fast_path_pending_writes gauge\n';
    for (const m of metrics) {
      output += `tbc20_fast_path_pending_writes{shard="${m.shardId}"} ${m.pendingWriteDepth}\n`;
    }
    output += '\n';

    output += '# HELP tbc20_fast_path_snapshot_age_ms Snapshot age per shard in milliseconds\n';
    output += '# TYPE tbc20_fast_path_snapshot_age_ms gauge\n';
    for (const m of metrics) {
      output += `tbc20_fast_path_snapshot_age_ms{shard="${m.shardId}"} ${m.snapshotAgeMs}\n`;
    }
    output += '\n';

    output += '# HELP tbc20_fast_path_execution_time_us Execution time per shard in microseconds\n';
    output += '# TYPE tbc20_fast_path_execution_time_us gauge\n';
    for (const m of metrics) {
      output += `tbc20_fast_path_execution_time_us{shard="${m.shardId}"} ${m.avgExecutionTimeUs.toFixed(2)}\n`;
    }

    return output;
  }
}

export const tbc20Telemetry = TBC20FastPathTelemetry.getInstance();
