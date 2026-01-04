/**
 * Enterprise Session Metrics Monitoring System
 * Phase 16: Production Stability Infrastructure
 * 
 * Prometheus-style metrics for session management with real-time tracking,
 * historical aggregation, and alerting capabilities.
 */

interface SessionMetrics {
  created: number;
  skipped: number;
  expired: number;
  active: number;
  publicApiRequests: number;
  internalRequests: number;
  protectedRequests: number;
  latencies: number[];
}

interface MetricsSnapshot {
  timestamp: Date;
  sessionsCreated: number;
  sessionsSkipped: number;
  sessionsExpired: number;
  sessionsActive: number;
  skipRatio: number;
  createRate: number;
  publicApiRequests: number;
  internalRequests: number;
  protectedRequests: number;
  avgLatencyMs: number;
  p99LatencyMs: number;
  storeType: 'memory' | 'redis';
  storeHealth: 'healthy' | 'degraded' | 'unhealthy';
  memoryUsageMb: number;
  redisConnected: boolean;
}

interface AlertThresholds {
  maxCreateRate: number;        // 초당 최대 세션 생성 수
  minSkipRatio: number;         // 최소 스킵 비율 (낮으면 경고)
  maxActiveSession: number;     // 최대 활성 세션 수
  maxLatencyMs: number;         // 최대 레이턴시
}

type AlertLevel = 'info' | 'warning' | 'critical';

interface SessionAlert {
  id: string;
  level: AlertLevel;
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: Date;
  acknowledged: boolean;
}

export class EnterpriseSessionMetrics {
  private static instance: EnterpriseSessionMetrics;
  
  // Current interval metrics
  private currentMetrics: SessionMetrics = {
    created: 0,
    skipped: 0,
    expired: 0,
    active: 0,
    publicApiRequests: 0,
    internalRequests: 0,
    protectedRequests: 0,
    latencies: [],
  };
  
  // Historical snapshots (last 24 hours, 5-minute intervals = 288 snapshots)
  private readonly maxSnapshots = 288;
  private snapshots: MetricsSnapshot[] = [];
  
  // Alerts
  private alerts: SessionAlert[] = [];
  private readonly maxAlerts = 1000;
  
  // Configuration
  private thresholds: AlertThresholds = {
    maxCreateRate: 100,        // 초당 100개 이상 세션 생성 시 경고
    minSkipRatio: 0.7,         // 70% 미만 스킵 시 경고
    maxActiveSession: 8000,    // 8000개 초과 시 경고
    maxLatencyMs: 100,         // 100ms 초과 시 경고
  };
  
  // Timing
  private intervalStartTime: Date = new Date();
  private readonly intervalMs = 5 * 60 * 1000; // 5분
  private snapshotTimer: NodeJS.Timeout | null = null;
  private isRunning = false;
  
  // Store info
  private storeType: 'memory' | 'redis' = 'memory';
  private storeHealth: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  private redisConnected = false;
  private memoryUsageMb = 0;
  
  private constructor() {}
  
  static getInstance(): EnterpriseSessionMetrics {
    if (!EnterpriseSessionMetrics.instance) {
      EnterpriseSessionMetrics.instance = new EnterpriseSessionMetrics();
    }
    return EnterpriseSessionMetrics.instance;
  }
  
  // ============================================================================
  // Metric Recording
  // ============================================================================
  
  recordSessionCreated(latencyMs?: number): void {
    this.currentMetrics.created++;
    if (latencyMs !== undefined) {
      this.currentMetrics.latencies.push(latencyMs);
    }
    this.checkAlerts();
  }
  
  recordSessionSkipped(): void {
    this.currentMetrics.skipped++;
  }
  
  recordSessionExpired(): void {
    this.currentMetrics.expired++;
  }
  
  recordPublicApiRequest(): void {
    this.currentMetrics.publicApiRequests++;
  }
  
  recordInternalRequest(): void {
    this.currentMetrics.internalRequests++;
  }
  
  recordProtectedRequest(): void {
    this.currentMetrics.protectedRequests++;
  }
  
  setActiveSessionCount(count: number): void {
    this.currentMetrics.active = count;
    this.checkAlerts();
  }
  
  updateStoreInfo(info: {
    type?: 'memory' | 'redis';
    health?: 'healthy' | 'degraded' | 'unhealthy';
    redisConnected?: boolean;
    memoryUsageMb?: number;
  }): void {
    if (info.type !== undefined) this.storeType = info.type;
    if (info.health !== undefined) this.storeHealth = info.health;
    if (info.redisConnected !== undefined) this.redisConnected = info.redisConnected;
    if (info.memoryUsageMb !== undefined) this.memoryUsageMb = info.memoryUsageMb;
  }
  
  // ============================================================================
  // Prometheus-Style Metrics Export
  // ============================================================================
  
  getPrometheusMetrics(): string {
    const snapshot = this.getCurrentSnapshot();
    const lines: string[] = [];
    
    // Counters
    lines.push('# HELP tburn_session_create_total Total sessions created');
    lines.push('# TYPE tburn_session_create_total counter');
    lines.push(`tburn_session_create_total ${this.getTotalCreated()}`);
    
    lines.push('# HELP tburn_session_skip_total Total sessions skipped');
    lines.push('# TYPE tburn_session_skip_total counter');
    lines.push(`tburn_session_skip_total ${this.getTotalSkipped()}`);
    
    lines.push('# HELP tburn_session_expire_total Total sessions expired');
    lines.push('# TYPE tburn_session_expire_total counter');
    lines.push(`tburn_session_expire_total ${this.getTotalExpired()}`);
    
    // Gauges
    lines.push('# HELP tburn_session_active_gauge Current active sessions');
    lines.push('# TYPE tburn_session_active_gauge gauge');
    lines.push(`tburn_session_active_gauge ${snapshot.sessionsActive}`);
    
    lines.push('# HELP tburn_session_skip_ratio Session skip ratio');
    lines.push('# TYPE tburn_session_skip_ratio gauge');
    lines.push(`tburn_session_skip_ratio ${snapshot.skipRatio.toFixed(6)}`);
    
    lines.push('# HELP tburn_session_create_rate Sessions created per second');
    lines.push('# TYPE tburn_session_create_rate gauge');
    lines.push(`tburn_session_create_rate ${snapshot.createRate.toFixed(4)}`);
    
    lines.push('# HELP tburn_session_latency_avg_ms Average session latency in milliseconds');
    lines.push('# TYPE tburn_session_latency_avg_ms gauge');
    lines.push(`tburn_session_latency_avg_ms ${snapshot.avgLatencyMs.toFixed(3)}`);
    
    lines.push('# HELP tburn_session_latency_p99_ms P99 session latency in milliseconds');
    lines.push('# TYPE tburn_session_latency_p99_ms gauge');
    lines.push(`tburn_session_latency_p99_ms ${snapshot.p99LatencyMs.toFixed(3)}`);
    
    // Store info
    lines.push('# HELP tburn_session_store_type Session store type (0=memory, 1=redis)');
    lines.push('# TYPE tburn_session_store_type gauge');
    lines.push(`tburn_session_store_type ${this.storeType === 'redis' ? 1 : 0}`);
    
    lines.push('# HELP tburn_session_store_healthy Session store health (1=healthy, 0=unhealthy)');
    lines.push('# TYPE tburn_session_store_healthy gauge');
    lines.push(`tburn_session_store_healthy ${this.storeHealth === 'healthy' ? 1 : 0}`);
    
    lines.push('# HELP tburn_session_redis_connected Redis connection status');
    lines.push('# TYPE tburn_session_redis_connected gauge');
    lines.push(`tburn_session_redis_connected ${this.redisConnected ? 1 : 0}`);
    
    lines.push('# HELP tburn_session_memory_usage_mb Memory usage in MB');
    lines.push('# TYPE tburn_session_memory_usage_mb gauge');
    lines.push(`tburn_session_memory_usage_mb ${this.memoryUsageMb.toFixed(2)}`);
    
    // Request distribution
    lines.push('# HELP tburn_session_public_requests Public API requests');
    lines.push('# TYPE tburn_session_public_requests counter');
    lines.push(`tburn_session_public_requests ${this.getTotalPublicRequests()}`);
    
    lines.push('# HELP tburn_session_internal_requests Internal requests');
    lines.push('# TYPE tburn_session_internal_requests counter');
    lines.push(`tburn_session_internal_requests ${this.getTotalInternalRequests()}`);
    
    lines.push('# HELP tburn_session_protected_requests Protected requests');
    lines.push('# TYPE tburn_session_protected_requests counter');
    lines.push(`tburn_session_protected_requests ${this.getTotalProtectedRequests()}`);
    
    // Alerts
    lines.push('# HELP tburn_session_alerts_active Active alert count');
    lines.push('# TYPE tburn_session_alerts_active gauge');
    lines.push(`tburn_session_alerts_active ${this.getActiveAlerts().length}`);
    
    return lines.join('\n');
  }
  
  // ============================================================================
  // Snapshot Management
  // ============================================================================
  
  private getCurrentSnapshot(): MetricsSnapshot {
    const now = new Date();
    const elapsedSeconds = (now.getTime() - this.intervalStartTime.getTime()) / 1000;
    const total = this.currentMetrics.created + this.currentMetrics.skipped;
    
    // Calculate percentiles
    const sortedLatencies = [...this.currentMetrics.latencies].sort((a, b) => a - b);
    const avgLatency = sortedLatencies.length > 0
      ? sortedLatencies.reduce((a, b) => a + b, 0) / sortedLatencies.length
      : 0;
    const p99Index = Math.floor(sortedLatencies.length * 0.99);
    const p99Latency = sortedLatencies.length > 0 ? sortedLatencies[p99Index] || 0 : 0;
    
    return {
      timestamp: now,
      sessionsCreated: this.currentMetrics.created,
      sessionsSkipped: this.currentMetrics.skipped,
      sessionsExpired: this.currentMetrics.expired,
      sessionsActive: this.currentMetrics.active,
      skipRatio: total > 0 ? this.currentMetrics.skipped / total : 1,
      createRate: elapsedSeconds > 0 ? this.currentMetrics.created / elapsedSeconds : 0,
      publicApiRequests: this.currentMetrics.publicApiRequests,
      internalRequests: this.currentMetrics.internalRequests,
      protectedRequests: this.currentMetrics.protectedRequests,
      avgLatencyMs: avgLatency,
      p99LatencyMs: p99Latency,
      storeType: this.storeType,
      storeHealth: this.storeHealth,
      memoryUsageMb: this.memoryUsageMb,
      redisConnected: this.redisConnected,
    };
  }
  
  private takeSnapshot(): void {
    const snapshot = this.getCurrentSnapshot();
    this.snapshots.push(snapshot);
    
    // Limit snapshot history
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }
    
    // Reset current interval metrics
    this.currentMetrics = {
      created: 0,
      skipped: 0,
      expired: 0,
      active: this.currentMetrics.active, // Preserve active count
      publicApiRequests: 0,
      internalRequests: 0,
      protectedRequests: 0,
      latencies: [],
    };
    this.intervalStartTime = new Date();
    
    // Log snapshot
    console.log(`[SessionMetrics] Snapshot: created=${snapshot.sessionsCreated}, skipped=${snapshot.sessionsSkipped}, skipRatio=${(snapshot.skipRatio * 100).toFixed(2)}%, active=${snapshot.sessionsActive}`);
  }
  
  // ============================================================================
  // Alert Management
  // ============================================================================
  
  private checkAlerts(): void {
    const snapshot = this.getCurrentSnapshot();
    
    // Check create rate
    if (snapshot.createRate > this.thresholds.maxCreateRate) {
      this.addAlert('warning', 'create_rate', snapshot.createRate, this.thresholds.maxCreateRate,
        `Session create rate (${snapshot.createRate.toFixed(2)}/s) exceeds threshold (${this.thresholds.maxCreateRate}/s)`);
    }
    
    // Check skip ratio
    if (snapshot.skipRatio < this.thresholds.minSkipRatio && snapshot.sessionsCreated + snapshot.sessionsSkipped > 100) {
      this.addAlert('warning', 'skip_ratio', snapshot.skipRatio, this.thresholds.minSkipRatio,
        `Session skip ratio (${(snapshot.skipRatio * 100).toFixed(2)}%) below threshold (${(this.thresholds.minSkipRatio * 100).toFixed(2)}%)`);
    }
    
    // Check active sessions
    if (snapshot.sessionsActive > this.thresholds.maxActiveSession) {
      this.addAlert('critical', 'active_sessions', snapshot.sessionsActive, this.thresholds.maxActiveSession,
        `Active sessions (${snapshot.sessionsActive}) exceed threshold (${this.thresholds.maxActiveSession})`);
    }
    
    // Check latency
    if (snapshot.p99LatencyMs > this.thresholds.maxLatencyMs) {
      this.addAlert('warning', 'latency', snapshot.p99LatencyMs, this.thresholds.maxLatencyMs,
        `Session P99 latency (${snapshot.p99LatencyMs.toFixed(2)}ms) exceeds threshold (${this.thresholds.maxLatencyMs}ms)`);
    }
  }
  
  private addAlert(level: AlertLevel, metric: string, value: number, threshold: number, message: string): void {
    // Deduplicate recent alerts
    const recentAlert = this.alerts.find(
      a => a.metric === metric && !a.acknowledged &&
          (Date.now() - a.timestamp.getTime()) < 60000
    );
    if (recentAlert) return;
    
    const alert: SessionAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      level,
      message,
      metric,
      value,
      threshold,
      timestamp: new Date(),
      acknowledged: false,
    };
    
    this.alerts.push(alert);
    if (this.alerts.length > this.maxAlerts) {
      this.alerts.shift();
    }
    
    console.log(`[SessionMetrics] Alert [${level.toUpperCase()}]: ${message}`);
  }
  
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }
  
  getActiveAlerts(): SessionAlert[] {
    return this.alerts.filter(a => !a.acknowledged);
  }
  
  getAllAlerts(limit = 100): SessionAlert[] {
    return this.alerts.slice(-limit);
  }
  
  // ============================================================================
  // Lifecycle
  // ============================================================================
  
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.intervalStartTime = new Date();
    
    // Take snapshots every 5 minutes
    this.snapshotTimer = setInterval(() => {
      this.takeSnapshot();
    }, this.intervalMs);
    
    console.log('[SessionMetrics] Enterprise session metrics monitoring started');
  }
  
  stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.snapshotTimer) {
      clearInterval(this.snapshotTimer);
      this.snapshotTimer = null;
    }
    
    console.log('[SessionMetrics] Enterprise session metrics monitoring stopped');
  }
  
  // ============================================================================
  // Getters
  // ============================================================================
  
  getStatus(): {
    isRunning: boolean;
    currentInterval: MetricsSnapshot;
    recentSnapshots: MetricsSnapshot[];
    alerts: { active: number; total: number };
    storeInfo: { type: string; health: string; redisConnected: boolean };
    thresholds: AlertThresholds;
  } {
    return {
      isRunning: this.isRunning,
      currentInterval: this.getCurrentSnapshot(),
      recentSnapshots: this.snapshots.slice(-12), // Last hour
      alerts: {
        active: this.getActiveAlerts().length,
        total: this.alerts.length,
      },
      storeInfo: {
        type: this.storeType,
        health: this.storeHealth,
        redisConnected: this.redisConnected,
      },
      thresholds: this.thresholds,
    };
  }
  
  getHistoricalData(hours = 24): MetricsSnapshot[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.snapshots.filter(s => s.timestamp >= cutoff);
  }
  
  private getTotalCreated(): number {
    return this.snapshots.reduce((sum, s) => sum + s.sessionsCreated, 0) + this.currentMetrics.created;
  }
  
  private getTotalSkipped(): number {
    return this.snapshots.reduce((sum, s) => sum + s.sessionsSkipped, 0) + this.currentMetrics.skipped;
  }
  
  private getTotalExpired(): number {
    return this.snapshots.reduce((sum, s) => sum + s.sessionsExpired, 0) + this.currentMetrics.expired;
  }
  
  private getTotalPublicRequests(): number {
    return this.snapshots.reduce((sum, s) => sum + s.publicApiRequests, 0) + this.currentMetrics.publicApiRequests;
  }
  
  private getTotalInternalRequests(): number {
    return this.snapshots.reduce((sum, s) => sum + s.internalRequests, 0) + this.currentMetrics.internalRequests;
  }
  
  private getTotalProtectedRequests(): number {
    return this.snapshots.reduce((sum, s) => sum + s.protectedRequests, 0) + this.currentMetrics.protectedRequests;
  }
  
  updateThresholds(thresholds: Partial<AlertThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }
}

// Export singleton
export const sessionMetrics = EnterpriseSessionMetrics.getInstance();
