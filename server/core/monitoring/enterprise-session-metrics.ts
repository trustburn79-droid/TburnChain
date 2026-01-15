/**
 * Enterprise Session Metrics Engine v2.0
 * Phase 16: Production-Grade Observability Infrastructure
 * 
 * Features:
 * - Granular metrics by endpoint, method, auth scope
 * - Multi-dimensional Prometheus metrics with labels
 * - Advanced alerting with severity levels and webhooks
 * - Database persistence with hourly rollups
 * - Security metrics tracking (auth failures, suspicious patterns)
 * - SLA monitoring and reporting
 */

import crypto from 'crypto';
import { db, executeWithRetry } from '../../db';
import { sessionMetricsByEndpoint, sessionMetricsHourly } from '@shared/schema';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertState = 'firing' | 'acknowledged' | 'resolved' | 'suppressed';
export type AuthScope = 'public' | 'authenticated' | 'admin' | 'internal';
export type StoreHealth = 'healthy' | 'degraded' | 'unhealthy';

interface EndpointMetrics {
  endpoint: string;
  method: string;
  authScope: AuthScope;
  requests: number;
  successful: number;
  failed: number;
  authFailures: number;
  sessionsCreated: number;
  sessionsSkipped: number;
  latencies: number[];
  error4xx: number;
  error5xx: number;
  timeouts: number;
}

interface SecurityMetrics {
  authFailuresByType: Record<string, number>;
  bruteForceAttempts: number;
  rateLimitBreaches: number;
  suspiciousPatterns: number;
  blockedRequests: number;
  uniqueFailedIps: Set<string>;
}

interface GranularSnapshot {
  timestamp: Date;
  intervalMinutes: number;
  
  // Overall metrics
  totalRequests: number;
  sessionsCreated: number;
  sessionsSkipped: number;
  sessionsExpired: number;
  sessionsActive: number;
  skipRatio: number;
  createRate: number;
  
  // Request distribution
  publicRequests: number;
  authenticatedRequests: number;
  adminRequests: number;
  internalRequests: number;
  
  // Latency percentiles
  avgLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  maxLatencyMs: number;
  
  // Errors
  error4xxCount: number;
  error5xxCount: number;
  timeoutCount: number;
  authFailures: number;
  
  // Store health
  storeType: 'memory' | 'redis';
  storeHealth: StoreHealth;
  memoryUsageMb: number;
  redisConnected: boolean;
  redisLatencyMs: number | null;
  
  // Top endpoints
  topEndpoints: Array<{
    endpoint: string;
    method: string;
    requests: number;
    avgLatencyMs: number;
    errorRate: number;
  }>;
}

interface EnterpriseAlert {
  id: string;
  policyId: string;
  severity: AlertSeverity;
  state: AlertState;
  metricType: string;
  metricValue: number;
  thresholdValue: number;
  message: string;
  labels: Record<string, string>;
  annotations: Record<string, string>;
  firedAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  resolvedReason?: string;
  fingerprint: string;
  notificationsSent: number;
  lastNotificationAt?: Date;
}

interface AlertPolicy {
  id: string;
  name: string;
  metricType: string;
  operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq';
  threshold: number;
  severity: AlertSeverity;
  evaluationPeriodMinutes: number;
  consecutiveBreaches: number;
  suppressionWindowMinutes: number;
  webhookUrl?: string;
  enabled: boolean;
}

interface WebhookPayload {
  alertId: string;
  severity: AlertSeverity;
  state: AlertState;
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: string;
  labels: Record<string, string>;
  source: string;
}

// ============================================================================
// Enterprise Session Metrics Engine
// ============================================================================

export class EnterpriseSessionMetricsEngine {
  private static instance: EnterpriseSessionMetricsEngine;
  
  // Current interval tracking
  private currentIntervalStart: Date = new Date();
  private readonly intervalMs = 5 * 60 * 1000; // 5 minutes
  
  // Granular endpoint metrics (reset each interval)
  private endpointMetrics: Map<string, EndpointMetrics> = new Map();
  
  // Security metrics
  private securityMetrics: SecurityMetrics = {
    authFailuresByType: {},
    bruteForceAttempts: 0,
    rateLimitBreaches: 0,
    suspiciousPatterns: 0,
    blockedRequests: 0,
    uniqueFailedIps: new Set(),
  };
  
  // Overall session counts
  private sessionsCreated = 0;
  private sessionsSkipped = 0;
  private sessionsExpired = 0;
  private sessionsActive = 0;
  private allLatencies: number[] = [];
  
  // Historical data
  private readonly maxSnapshots = 288; // 24 hours at 5-min intervals
  private snapshots: GranularSnapshot[] = [];
  
  // Hourly aggregates for long-term storage
  private readonly maxHourlyAggregates = 720; // 30 days
  private hourlyAggregates: Map<string, {
    totalRequests: number;
    sessionsCreated: number;
    sessionsSkipped: number;
    peakActive: number;
    alertsTriggered: number;
    criticalAlerts: number;
    avgLatencyMs: number;
    latencySamples: number;
  }> = new Map();
  
  // Alert management
  private alerts: Map<string, EnterpriseAlert> = new Map();
  private alertPolicies: Map<string, AlertPolicy> = new Map();
  private alertBreachCounts: Map<string, number> = new Map();
  private readonly maxAlerts = 1000;
  
  // Store info
  private storeType: 'memory' | 'redis' = 'memory';
  private storeHealth: StoreHealth = 'healthy';
  private memoryUsageMb = 0;
  private redisConnected = false;
  private redisLatencyMs: number | null = null;
  
  // Lifecycle
  private isRunning = false;
  private snapshotTimer: NodeJS.Timeout | null = null;
  private aggregationTimer: NodeJS.Timeout | null = null;
  
  private constructor() {
    this.initializeDefaultPolicies();
  }
  
  static getInstance(): EnterpriseSessionMetricsEngine {
    if (!EnterpriseSessionMetricsEngine.instance) {
      EnterpriseSessionMetricsEngine.instance = new EnterpriseSessionMetricsEngine();
    }
    return EnterpriseSessionMetricsEngine.instance;
  }
  
  // ============================================================================
  // Default Alert Policies
  // ============================================================================
  
  private initializeDefaultPolicies(): void {
    const defaultPolicies: AlertPolicy[] = [
      {
        id: 'session_create_rate_critical',
        name: 'Critical Session Create Rate',
        metricType: 'create_rate',
        operator: 'gt',
        threshold: 200,
        severity: 'critical',
        evaluationPeriodMinutes: 5,
        consecutiveBreaches: 2,
        suppressionWindowMinutes: 30,
        enabled: true,
      },
      {
        id: 'session_create_rate_warning',
        name: 'High Session Create Rate',
        metricType: 'create_rate',
        operator: 'gt',
        threshold: 100,
        severity: 'warning',
        evaluationPeriodMinutes: 5,
        consecutiveBreaches: 3,
        suppressionWindowMinutes: 60,
        enabled: true,
      },
      {
        id: 'skip_ratio_critical',
        name: 'Critical Skip Ratio Drop',
        metricType: 'skip_ratio',
        operator: 'lt',
        threshold: 0.5,
        severity: 'critical',
        evaluationPeriodMinutes: 5,
        consecutiveBreaches: 2,
        suppressionWindowMinutes: 30,
        enabled: true,
      },
      {
        id: 'skip_ratio_warning',
        name: 'Low Skip Ratio',
        metricType: 'skip_ratio',
        operator: 'lt',
        threshold: 0.7,
        severity: 'warning',
        evaluationPeriodMinutes: 5,
        consecutiveBreaches: 3,
        suppressionWindowMinutes: 60,
        enabled: true,
      },
      {
        id: 'active_sessions_critical',
        name: 'Critical Active Sessions',
        metricType: 'active_sessions',
        operator: 'gt',
        threshold: 9000,
        severity: 'critical',
        evaluationPeriodMinutes: 5,
        consecutiveBreaches: 1,
        suppressionWindowMinutes: 15,
        enabled: true,
      },
      {
        id: 'active_sessions_warning',
        name: 'High Active Sessions',
        metricType: 'active_sessions',
        operator: 'gt',
        threshold: 7000,
        severity: 'warning',
        evaluationPeriodMinutes: 5,
        consecutiveBreaches: 2,
        suppressionWindowMinutes: 30,
        enabled: true,
      },
      {
        id: 'latency_critical',
        name: 'Critical P99 Latency',
        metricType: 'p99_latency',
        operator: 'gt',
        threshold: 500,
        severity: 'critical',
        evaluationPeriodMinutes: 5,
        consecutiveBreaches: 2,
        suppressionWindowMinutes: 15,
        enabled: true,
      },
      {
        id: 'latency_warning',
        name: 'High P99 Latency',
        metricType: 'p99_latency',
        operator: 'gt',
        threshold: 200,
        severity: 'warning',
        evaluationPeriodMinutes: 5,
        consecutiveBreaches: 3,
        suppressionWindowMinutes: 30,
        enabled: true,
      },
      {
        id: 'error_rate_critical',
        name: 'Critical Error Rate',
        metricType: 'error_rate',
        operator: 'gt',
        threshold: 0.1,
        severity: 'critical',
        evaluationPeriodMinutes: 5,
        consecutiveBreaches: 2,
        suppressionWindowMinutes: 15,
        enabled: true,
      },
      {
        id: 'auth_failures_warning',
        name: 'High Auth Failures',
        metricType: 'auth_failures',
        operator: 'gt',
        threshold: 100,
        severity: 'warning',
        evaluationPeriodMinutes: 5,
        consecutiveBreaches: 2,
        suppressionWindowMinutes: 30,
        enabled: true,
      },
      {
        id: 'memory_usage_critical',
        name: 'Critical Memory Usage',
        metricType: 'memory_usage',
        operator: 'gt',
        threshold: 1500,
        severity: 'critical',
        evaluationPeriodMinutes: 5,
        consecutiveBreaches: 2,
        suppressionWindowMinutes: 30,
        enabled: true,
      },
    ];
    
    defaultPolicies.forEach(policy => {
      this.alertPolicies.set(policy.id, policy);
    });
  }
  
  // ============================================================================
  // Metric Recording (Granular)
  // ============================================================================
  
  recordRequest(params: {
    endpoint: string;
    method: string;
    authScope: AuthScope;
    statusCode: number;
    latencyMs: number;
    sessionCreated: boolean;
    sessionSkipped: boolean;
    isTimeout?: boolean;
  }): void {
    const key = `${params.method}:${params.endpoint}:${params.authScope}`;
    
    let metrics = this.endpointMetrics.get(key);
    if (!metrics) {
      metrics = {
        endpoint: params.endpoint,
        method: params.method,
        authScope: params.authScope,
        requests: 0,
        successful: 0,
        failed: 0,
        authFailures: 0,
        sessionsCreated: 0,
        sessionsSkipped: 0,
        latencies: [],
        error4xx: 0,
        error5xx: 0,
        timeouts: 0,
      };
      this.endpointMetrics.set(key, metrics);
    }
    
    metrics.requests++;
    metrics.latencies.push(params.latencyMs);
    this.allLatencies.push(params.latencyMs);
    
    if (params.statusCode >= 200 && params.statusCode < 400) {
      metrics.successful++;
    } else {
      metrics.failed++;
      if (params.statusCode >= 400 && params.statusCode < 500) {
        metrics.error4xx++;
        if (params.statusCode === 401 || params.statusCode === 403) {
          metrics.authFailures++;
        }
      } else if (params.statusCode >= 500) {
        metrics.error5xx++;
      }
    }
    
    if (params.isTimeout) {
      metrics.timeouts++;
    }
    
    if (params.sessionCreated) {
      metrics.sessionsCreated++;
      this.sessionsCreated++;
    }
    if (params.sessionSkipped) {
      metrics.sessionsSkipped++;
      this.sessionsSkipped++;
    }
  }
  
  recordSecurityEvent(params: {
    type: 'auth_failure' | 'brute_force' | 'rate_limit' | 'suspicious' | 'blocked';
    failureType?: string;
    ip?: string;
  }): void {
    switch (params.type) {
      case 'auth_failure':
        const failType = params.failureType || 'unknown';
        this.securityMetrics.authFailuresByType[failType] = 
          (this.securityMetrics.authFailuresByType[failType] || 0) + 1;
        if (params.ip) {
          this.securityMetrics.uniqueFailedIps.add(params.ip);
        }
        break;
      case 'brute_force':
        this.securityMetrics.bruteForceAttempts++;
        break;
      case 'rate_limit':
        this.securityMetrics.rateLimitBreaches++;
        break;
      case 'suspicious':
        this.securityMetrics.suspiciousPatterns++;
        break;
      case 'blocked':
        this.securityMetrics.blockedRequests++;
        break;
    }
  }
  
  recordSessionExpired(): void {
    this.sessionsExpired++;
  }
  
  setActiveSessionCount(count: number): void {
    this.sessionsActive = count;
  }
  
  updateStoreInfo(info: {
    type?: 'memory' | 'redis';
    health?: StoreHealth;
    memoryUsageMb?: number;
    redisConnected?: boolean;
    redisLatencyMs?: number | null;
  }): void {
    if (info.type !== undefined) this.storeType = info.type;
    if (info.health !== undefined) this.storeHealth = info.health;
    if (info.memoryUsageMb !== undefined) this.memoryUsageMb = info.memoryUsageMb;
    if (info.redisConnected !== undefined) this.redisConnected = info.redisConnected;
    if (info.redisLatencyMs !== undefined) this.redisLatencyMs = info.redisLatencyMs;
  }
  
  // ============================================================================
  // Prometheus Metrics Export (Multi-dimensional)
  // ============================================================================
  
  getPrometheusMetrics(): string {
    const lines: string[] = [];
    const snapshot = this.getCurrentSnapshot();
    
    // Session lifecycle metrics
    lines.push('# HELP tburn_session_created_total Total sessions created');
    lines.push('# TYPE tburn_session_created_total counter');
    lines.push(`tburn_session_created_total ${this.getTotalCreated()}`);
    
    lines.push('# HELP tburn_session_skipped_total Total sessions skipped');
    lines.push('# TYPE tburn_session_skipped_total counter');
    lines.push(`tburn_session_skipped_total ${this.getTotalSkipped()}`);
    
    lines.push('# HELP tburn_session_expired_total Total sessions expired');
    lines.push('# TYPE tburn_session_expired_total counter');
    lines.push(`tburn_session_expired_total ${this.getTotalExpired()}`);
    
    lines.push('# HELP tburn_session_active Current active sessions');
    lines.push('# TYPE tburn_session_active gauge');
    lines.push(`tburn_session_active ${snapshot.sessionsActive}`);
    
    lines.push('# HELP tburn_session_skip_ratio Session skip ratio');
    lines.push('# TYPE tburn_session_skip_ratio gauge');
    lines.push(`tburn_session_skip_ratio ${snapshot.skipRatio.toFixed(6)}`);
    
    lines.push('# HELP tburn_session_create_rate Sessions created per second');
    lines.push('# TYPE tburn_session_create_rate gauge');
    lines.push(`tburn_session_create_rate ${snapshot.createRate.toFixed(4)}`);
    
    // Latency histogram
    lines.push('# HELP tburn_session_latency_ms Session latency in milliseconds');
    lines.push('# TYPE tburn_session_latency_ms summary');
    lines.push(`tburn_session_latency_ms{quantile="0.5"} ${snapshot.p50LatencyMs.toFixed(3)}`);
    lines.push(`tburn_session_latency_ms{quantile="0.95"} ${snapshot.p95LatencyMs.toFixed(3)}`);
    lines.push(`tburn_session_latency_ms{quantile="0.99"} ${snapshot.p99LatencyMs.toFixed(3)}`);
    lines.push(`tburn_session_latency_ms_avg ${snapshot.avgLatencyMs.toFixed(3)}`);
    lines.push(`tburn_session_latency_ms_max ${snapshot.maxLatencyMs.toFixed(3)}`);
    
    // Request distribution by auth scope
    lines.push('# HELP tburn_requests_total Total requests by auth scope');
    lines.push('# TYPE tburn_requests_total counter');
    lines.push(`tburn_requests_total{auth_scope="public"} ${snapshot.publicRequests}`);
    lines.push(`tburn_requests_total{auth_scope="authenticated"} ${snapshot.authenticatedRequests}`);
    lines.push(`tburn_requests_total{auth_scope="admin"} ${snapshot.adminRequests}`);
    lines.push(`tburn_requests_total{auth_scope="internal"} ${snapshot.internalRequests}`);
    
    // Error metrics
    lines.push('# HELP tburn_errors_total Total errors by type');
    lines.push('# TYPE tburn_errors_total counter');
    lines.push(`tburn_errors_total{type="4xx"} ${snapshot.error4xxCount}`);
    lines.push(`tburn_errors_total{type="5xx"} ${snapshot.error5xxCount}`);
    lines.push(`tburn_errors_total{type="timeout"} ${snapshot.timeoutCount}`);
    lines.push(`tburn_errors_total{type="auth_failure"} ${snapshot.authFailures}`);
    
    // Store health
    lines.push('# HELP tburn_session_store_info Session store information');
    lines.push('# TYPE tburn_session_store_info gauge');
    lines.push(`tburn_session_store_type{type="${this.storeType}"} 1`);
    lines.push(`tburn_session_store_health{status="${this.storeHealth}"} 1`);
    lines.push(`tburn_session_store_redis_connected ${this.redisConnected ? 1 : 0}`);
    lines.push(`tburn_session_store_memory_mb ${this.memoryUsageMb.toFixed(2)}`);
    if (this.redisLatencyMs !== null) {
      lines.push(`tburn_session_store_redis_latency_ms ${this.redisLatencyMs.toFixed(3)}`);
    }
    
    // Security metrics
    lines.push('# HELP tburn_security_events_total Security events by type');
    lines.push('# TYPE tburn_security_events_total counter');
    lines.push(`tburn_security_events_total{type="brute_force"} ${this.securityMetrics.bruteForceAttempts}`);
    lines.push(`tburn_security_events_total{type="rate_limit"} ${this.securityMetrics.rateLimitBreaches}`);
    lines.push(`tburn_security_events_total{type="suspicious"} ${this.securityMetrics.suspiciousPatterns}`);
    lines.push(`tburn_security_events_total{type="blocked"} ${this.securityMetrics.blockedRequests}`);
    
    // Alert metrics
    const activeAlerts = this.getActiveAlerts();
    lines.push('# HELP tburn_alerts_active Current active alerts by severity');
    lines.push('# TYPE tburn_alerts_active gauge');
    lines.push(`tburn_alerts_active{severity="critical"} ${activeAlerts.filter(a => a.severity === 'critical').length}`);
    lines.push(`tburn_alerts_active{severity="warning"} ${activeAlerts.filter(a => a.severity === 'warning').length}`);
    lines.push(`tburn_alerts_active{severity="info"} ${activeAlerts.filter(a => a.severity === 'info').length}`);
    
    // Top endpoints by request count
    lines.push('# HELP tburn_endpoint_requests_total Requests by endpoint');
    lines.push('# TYPE tburn_endpoint_requests_total counter');
    snapshot.topEndpoints.slice(0, 10).forEach(ep => {
      const safeEndpoint = ep.endpoint.replace(/[{}]/g, '').substring(0, 50);
      lines.push(`tburn_endpoint_requests_total{method="${ep.method}",endpoint="${safeEndpoint}"} ${ep.requests}`);
    });
    
    return lines.join('\n');
  }
  
  // ============================================================================
  // Snapshot Management
  // ============================================================================
  
  private getCurrentSnapshot(): GranularSnapshot {
    const now = new Date();
    const elapsedSeconds = (now.getTime() - this.currentIntervalStart.getTime()) / 1000;
    const total = this.sessionsCreated + this.sessionsSkipped;
    
    // Aggregate endpoint metrics
    let publicRequests = 0;
    let authenticatedRequests = 0;
    let adminRequests = 0;
    let internalRequests = 0;
    let totalRequests = 0;
    let error4xxCount = 0;
    let error5xxCount = 0;
    let timeoutCount = 0;
    let authFailures = 0;
    
    const endpointStats: Array<{
      endpoint: string;
      method: string;
      requests: number;
      avgLatencyMs: number;
      errorRate: number;
    }> = [];
    
    this.endpointMetrics.forEach(metrics => {
      totalRequests += metrics.requests;
      error4xxCount += metrics.error4xx;
      error5xxCount += metrics.error5xx;
      timeoutCount += metrics.timeouts;
      authFailures += metrics.authFailures;
      
      switch (metrics.authScope) {
        case 'public': publicRequests += metrics.requests; break;
        case 'authenticated': authenticatedRequests += metrics.requests; break;
        case 'admin': adminRequests += metrics.requests; break;
        case 'internal': internalRequests += metrics.requests; break;
      }
      
      const avgLatency = metrics.latencies.length > 0
        ? metrics.latencies.reduce((a, b) => a + b, 0) / metrics.latencies.length
        : 0;
      const errorRate = metrics.requests > 0
        ? (metrics.error4xx + metrics.error5xx) / metrics.requests
        : 0;
      
      endpointStats.push({
        endpoint: metrics.endpoint,
        method: metrics.method,
        requests: metrics.requests,
        avgLatencyMs: avgLatency,
        errorRate,
      });
    });
    
    // Sort by request count
    endpointStats.sort((a, b) => b.requests - a.requests);
    
    // Calculate latency percentiles
    const sortedLatencies = [...this.allLatencies].sort((a, b) => a - b);
    const latencyCount = sortedLatencies.length;
    
    const avgLatency = latencyCount > 0
      ? sortedLatencies.reduce((a, b) => a + b, 0) / latencyCount
      : 0;
    const p50Latency = latencyCount > 0 ? sortedLatencies[Math.floor(latencyCount * 0.5)] || 0 : 0;
    const p95Latency = latencyCount > 0 ? sortedLatencies[Math.floor(latencyCount * 0.95)] || 0 : 0;
    const p99Latency = latencyCount > 0 ? sortedLatencies[Math.floor(latencyCount * 0.99)] || 0 : 0;
    const maxLatency = latencyCount > 0 ? sortedLatencies[latencyCount - 1] || 0 : 0;
    
    return {
      timestamp: now,
      intervalMinutes: 5,
      totalRequests,
      sessionsCreated: this.sessionsCreated,
      sessionsSkipped: this.sessionsSkipped,
      sessionsExpired: this.sessionsExpired,
      sessionsActive: this.sessionsActive,
      skipRatio: total > 0 ? this.sessionsSkipped / total : 1,
      createRate: elapsedSeconds > 0 ? this.sessionsCreated / elapsedSeconds : 0,
      publicRequests,
      authenticatedRequests,
      adminRequests,
      internalRequests,
      avgLatencyMs: avgLatency,
      p50LatencyMs: p50Latency,
      p95LatencyMs: p95Latency,
      p99LatencyMs: p99Latency,
      maxLatencyMs: maxLatency,
      error4xxCount,
      error5xxCount,
      timeoutCount,
      authFailures,
      storeType: this.storeType,
      storeHealth: this.storeHealth,
      memoryUsageMb: this.memoryUsageMb,
      redisConnected: this.redisConnected,
      redisLatencyMs: this.redisLatencyMs,
      topEndpoints: endpointStats.slice(0, 20),
    };
  }
  
  private takeSnapshot(): void {
    const snapshot = this.getCurrentSnapshot();
    this.snapshots.push(snapshot);
    
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }
    
    // Evaluate alert policies
    this.evaluateAlertPolicies(snapshot);
    
    // Update hourly aggregate
    this.updateHourlyAggregate(snapshot);
    
    // Flush endpoint metrics to database (async, non-blocking)
    this.flushEndpointMetricsToDb().catch(err => {
      console.error('[EnterpriseMetrics] Background flush error:', err.message);
    });
    
    // Reset current interval
    this.resetCurrentInterval();
    
    console.log(`[EnterpriseMetrics] Snapshot: requests=${snapshot.totalRequests}, ` +
      `sessions=${snapshot.sessionsCreated}/${snapshot.sessionsSkipped}, ` +
      `skipRatio=${(snapshot.skipRatio * 100).toFixed(2)}%, ` +
      `p99=${snapshot.p99LatencyMs.toFixed(2)}ms, ` +
      `errors=${snapshot.error4xxCount + snapshot.error5xxCount}`);
  }
  
  private resetCurrentInterval(): void {
    this.endpointMetrics.clear();
    this.sessionsCreated = 0;
    this.sessionsSkipped = 0;
    this.sessionsExpired = 0;
    this.allLatencies = [];
    this.securityMetrics = {
      authFailuresByType: {},
      bruteForceAttempts: 0,
      rateLimitBreaches: 0,
      suspiciousPatterns: 0,
      blockedRequests: 0,
      uniqueFailedIps: new Set(),
    };
    this.currentIntervalStart = new Date();
  }
  
  private updateHourlyAggregate(snapshot: GranularSnapshot): void {
    const hourKey = new Date(snapshot.timestamp);
    hourKey.setMinutes(0, 0, 0);
    const key = hourKey.toISOString();
    
    const existing = this.hourlyAggregates.get(key);
    if (existing) {
      existing.totalRequests += snapshot.totalRequests;
      existing.sessionsCreated += snapshot.sessionsCreated;
      existing.sessionsSkipped += snapshot.sessionsSkipped;
      existing.peakActive = Math.max(existing.peakActive, snapshot.sessionsActive);
      
      // Weighted average for latency
      const newWeight = snapshot.totalRequests;
      const totalWeight = existing.latencySamples + newWeight;
      if (totalWeight > 0) {
        existing.avgLatencyMs = (existing.avgLatencyMs * existing.latencySamples + 
          snapshot.avgLatencyMs * newWeight) / totalWeight;
        existing.latencySamples = totalWeight;
      }
    } else {
      this.hourlyAggregates.set(key, {
        totalRequests: snapshot.totalRequests,
        sessionsCreated: snapshot.sessionsCreated,
        sessionsSkipped: snapshot.sessionsSkipped,
        peakActive: snapshot.sessionsActive,
        alertsTriggered: 0,
        criticalAlerts: 0,
        avgLatencyMs: snapshot.avgLatencyMs,
        latencySamples: snapshot.totalRequests,
      });
    }
    
    // Prune old hourly data
    if (this.hourlyAggregates.size > this.maxHourlyAggregates) {
      const sortedKeys = Array.from(this.hourlyAggregates.keys()).sort();
      const toDelete = sortedKeys.slice(0, this.hourlyAggregates.size - this.maxHourlyAggregates);
      toDelete.forEach(k => this.hourlyAggregates.delete(k));
    }
  }
  
  // ============================================================================
  // Alert Management
  // ============================================================================
  
  private evaluateAlertPolicies(snapshot: GranularSnapshot): void {
    this.alertPolicies.forEach((policy, policyId) => {
      if (!policy.enabled) return;
      
      const value = this.getMetricValue(policy.metricType, snapshot);
      const breached = this.isThresholdBreached(value, policy.operator, policy.threshold);
      
      const currentBreaches = this.alertBreachCounts.get(policyId) || 0;
      
      if (breached) {
        this.alertBreachCounts.set(policyId, currentBreaches + 1);
        
        if (currentBreaches + 1 >= policy.consecutiveBreaches) {
          this.fireAlert(policy, value, snapshot);
        }
      } else {
        this.alertBreachCounts.set(policyId, 0);
        this.resolveAlert(policyId, 'metric_recovered');
      }
    });
  }
  
  private getMetricValue(metricType: string, snapshot: GranularSnapshot): number {
    switch (metricType) {
      case 'create_rate': return snapshot.createRate;
      case 'skip_ratio': return snapshot.skipRatio;
      case 'active_sessions': return snapshot.sessionsActive;
      case 'p99_latency': return snapshot.p99LatencyMs;
      case 'error_rate': 
        return snapshot.totalRequests > 0 
          ? (snapshot.error4xxCount + snapshot.error5xxCount) / snapshot.totalRequests 
          : 0;
      case 'auth_failures': return snapshot.authFailures;
      case 'memory_usage': return this.memoryUsageMb;
      default: return 0;
    }
  }
  
  private isThresholdBreached(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case 'gt': return value > threshold;
      case 'lt': return value < threshold;
      case 'gte': return value >= threshold;
      case 'lte': return value <= threshold;
      case 'eq': return value === threshold;
      default: return false;
    }
  }
  
  private fireAlert(policy: AlertPolicy, value: number, snapshot: GranularSnapshot): void {
    const fingerprint = crypto.createHash('md5')
      .update(`${policy.id}:${policy.metricType}`)
      .digest('hex');
    
    // Check for existing alert with same fingerprint (deduplication)
    const existingAlert = Array.from(this.alerts.values())
      .find(a => a.fingerprint === fingerprint && a.state === 'firing');
    
    if (existingAlert) {
      // Check suppression window
      const suppressionMs = policy.suppressionWindowMinutes * 60 * 1000;
      if (Date.now() - existingAlert.firedAt.getTime() < suppressionMs) {
        return; // Suppressed
      }
    }
    
    const alertId = `alert_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const message = this.generateAlertMessage(policy, value);
    
    const alert: EnterpriseAlert = {
      id: alertId,
      policyId: policy.id,
      severity: policy.severity,
      state: 'firing',
      metricType: policy.metricType,
      metricValue: value,
      thresholdValue: policy.threshold,
      message,
      labels: {
        policy_name: policy.name,
        store_type: this.storeType,
        store_health: this.storeHealth,
      },
      annotations: {
        summary: message,
        description: `Metric ${policy.metricType} breached threshold for ${policy.consecutiveBreaches} consecutive periods`,
        runbook_url: `https://docs.tburn.io/runbooks/session-monitoring#${policy.metricType}`,
      },
      firedAt: new Date(),
      fingerprint,
      notificationsSent: 0,
    };
    
    this.alerts.set(alertId, alert);
    
    // Update hourly aggregate
    const hourKey = new Date();
    hourKey.setMinutes(0, 0, 0);
    const aggregate = this.hourlyAggregates.get(hourKey.toISOString());
    if (aggregate) {
      aggregate.alertsTriggered++;
      if (policy.severity === 'critical') {
        aggregate.criticalAlerts++;
      }
    }
    
    // Send webhook notification
    if (policy.webhookUrl) {
      this.sendWebhookNotification(alert, policy.webhookUrl);
    }
    
    // Limit alerts
    if (this.alerts.size > this.maxAlerts) {
      const oldest = Array.from(this.alerts.entries())
        .sort((a, b) => a[1].firedAt.getTime() - b[1].firedAt.getTime())[0];
      if (oldest) {
        this.alerts.delete(oldest[0]);
      }
    }
    
    console.log(`[EnterpriseMetrics] 🚨 Alert FIRED [${policy.severity.toUpperCase()}]: ${message}`);
  }
  
  private resolveAlert(policyId: string, reason: string): void {
    this.alerts.forEach((alert, alertId) => {
      if (alert.policyId === policyId && alert.state === 'firing') {
        alert.state = 'resolved';
        alert.resolvedAt = new Date();
        alert.resolvedReason = reason;
        
        console.log(`[EnterpriseMetrics] ✅ Alert RESOLVED: ${alert.message}`);
      }
    });
  }
  
  private generateAlertMessage(policy: AlertPolicy, value: number): string {
    const formattedValue = policy.metricType.includes('ratio') 
      ? `${(value * 100).toFixed(2)}%`
      : value.toFixed(2);
    const formattedThreshold = policy.metricType.includes('ratio')
      ? `${(policy.threshold * 100).toFixed(2)}%`
      : policy.threshold.toFixed(2);
    
    return `${policy.name}: ${policy.metricType} (${formattedValue}) ${policy.operator} threshold (${formattedThreshold})`;
  }
  
  private async sendWebhookNotification(alert: EnterpriseAlert, webhookUrl: string): Promise<void> {
    const payload: WebhookPayload = {
      alertId: alert.id,
      severity: alert.severity,
      state: alert.state,
      metric: alert.metricType,
      value: alert.metricValue,
      threshold: alert.thresholdValue,
      message: alert.message,
      timestamp: alert.firedAt.toISOString(),
      labels: alert.labels,
      source: 'tburn-enterprise-session-monitoring',
    };
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        alert.notificationsSent++;
        alert.lastNotificationAt = new Date();
        console.log(`[EnterpriseMetrics] Webhook notification sent for alert ${alert.id}`);
      } else {
        console.error(`[EnterpriseMetrics] Webhook failed: ${response.status}`);
      }
    } catch (error) {
      console.error(`[EnterpriseMetrics] Webhook error:`, error);
    }
  }
  
  // ============================================================================
  // Alert Policy Management
  // ============================================================================
  
  addAlertPolicy(policy: AlertPolicy): void {
    this.alertPolicies.set(policy.id, policy);
  }
  
  updateAlertPolicy(policyId: string, updates: Partial<AlertPolicy>): boolean {
    const policy = this.alertPolicies.get(policyId);
    if (!policy) return false;
    
    Object.assign(policy, updates);
    return true;
  }
  
  deleteAlertPolicy(policyId: string): boolean {
    return this.alertPolicies.delete(policyId);
  }
  
  getAlertPolicies(): AlertPolicy[] {
    return Array.from(this.alertPolicies.values());
  }
  
  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert || alert.state !== 'firing') return false;
    
    alert.state = 'acknowledged';
    alert.acknowledgedAt = new Date();
    alert.acknowledgedBy = acknowledgedBy;
    return true;
  }
  
  getActiveAlerts(): EnterpriseAlert[] {
    return Array.from(this.alerts.values())
      .filter(a => a.state === 'firing' || a.state === 'acknowledged');
  }
  
  getAllAlerts(limit = 100): EnterpriseAlert[] {
    return Array.from(this.alerts.values())
      .sort((a, b) => b.firedAt.getTime() - a.firedAt.getTime())
      .slice(0, limit);
  }
  
  // ============================================================================
  // Lifecycle
  // ============================================================================
  
  start(): void {
    // ★ [2026-01-15 MEMORY FIX] DEV_SAFE_MODE에서 세션 메트릭 간격 증가
    // DEV_SAFE_MODE 값을 동기적으로 가져오기 위해 환경변수 사용
    const DEV_SAFE_MODE = process.env.DEV_SAFE_MODE !== 'false';
    
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.currentIntervalStart = new Date();
    
    // Snapshot timer - DEV_SAFE_MODE에서는 30분 (5분 → 30분)
    const snapshotIntervalMs = DEV_SAFE_MODE ? 30 * 60 * 1000 : this.intervalMs;
    this.snapshotTimer = setInterval(() => {
      this.takeSnapshot();
    }, snapshotIntervalMs);
    
    // Hourly aggregation timer - DEV_SAFE_MODE에서는 2시간 (1시간 → 2시간)
    const aggregationIntervalMs = DEV_SAFE_MODE ? 2 * 60 * 60 * 1000 : 60 * 60 * 1000;
    this.aggregationTimer = setInterval(() => {
      this.runHourlyAggregation();
    }, aggregationIntervalMs);
    
    console.log(`[EnterpriseSessionMetrics] ✅ Started (DEV_SAFE_MODE: ${DEV_SAFE_MODE}, snapshot: ${snapshotIntervalMs / 60000}min)`);
    
    console.log('[EnterpriseMetrics] ✅ Enterprise Session Metrics Engine v2.0 started');
    console.log(`[EnterpriseMetrics] 📊 ${this.alertPolicies.size} alert policies configured`);
  }
  
  stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    if (this.snapshotTimer) {
      clearInterval(this.snapshotTimer);
      this.snapshotTimer = null;
    }
    
    if (this.aggregationTimer) {
      clearInterval(this.aggregationTimer);
      this.aggregationTimer = null;
    }
    
    console.log('[EnterpriseMetrics] Enterprise Session Metrics Engine stopped');
  }
  
  private async runHourlyAggregation(): Promise<void> {
    // Persist hourly aggregates to database
    await this.flushHourlyAggregatesToDb();
    
    console.log(`[EnterpriseMetrics] Hourly aggregation complete. ` +
      `${this.hourlyAggregates.size} hours tracked, ${this.alerts.size} alerts in history`);
  }
  
  // ============================================================================
  // Database Persistence
  // ============================================================================
  
  private flushInProgress = false;
  
  private async flushEndpointMetricsToDb(): Promise<void> {
    if (this.flushInProgress) return;
    if (this.endpointMetrics.size === 0) return;
    
    this.flushInProgress = true;
    
    try {
      const bucketTime = new Date();
      const rows: Array<typeof sessionMetricsByEndpoint.$inferInsert> = [];
      
      this.endpointMetrics.forEach((metrics) => {
        const sortedLatencies = [...metrics.latencies].sort((a, b) => a - b);
        const avgLatency = sortedLatencies.length > 0
          ? sortedLatencies.reduce((a, b) => a + b, 0) / sortedLatencies.length
          : 0;
        
        rows.push({
          bucketTime,
          bucketIntervalMinutes: 5,
          endpoint: metrics.endpoint,
          httpMethod: metrics.method,
          authScope: metrics.authScope,
          totalRequests: metrics.requests,
          successfulRequests: metrics.successful,
          failedRequests: metrics.failed,
          authFailures: metrics.authFailures,
          sessionsCreated: metrics.sessionsCreated,
          sessionsSkipped: metrics.sessionsSkipped,
          avgLatencyMs: avgLatency.toFixed(3),
          p50LatencyMs: this.percentile(sortedLatencies, 50).toFixed(3),
          p95LatencyMs: this.percentile(sortedLatencies, 95).toFixed(3),
          p99LatencyMs: this.percentile(sortedLatencies, 99).toFixed(3),
          maxLatencyMs: (sortedLatencies[sortedLatencies.length - 1] || 0).toFixed(3),
          rps: (metrics.requests / (5 * 60)).toFixed(4),
          error4xxCount: metrics.error4xx,
          error5xxCount: metrics.error5xx,
          timeoutCount: metrics.timeouts,
        });
      });
      
      // Batch insert in chunks
      const batchSize = 100;
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        await executeWithRetry(
          async () => db.insert(sessionMetricsByEndpoint).values(batch),
          'Insert endpoint metrics',
          3
        );
      }
      
      console.log(`[EnterpriseMetrics] 💾 Persisted ${rows.length} endpoint metric rows to database`);
    } catch (error) {
      console.error('[EnterpriseMetrics] Failed to flush endpoint metrics:', (error as Error).message);
    } finally {
      this.flushInProgress = false;
    }
  }
  
  private async flushHourlyAggregatesToDb(): Promise<void> {
    const now = new Date();
    const currentHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
    const previousHour = new Date(currentHour.getTime() - 60 * 60 * 1000);
    const previousHourKey = previousHour.toISOString();
    
    const hourData = this.hourlyAggregates.get(previousHourKey);
    if (!hourData) return;
    
    try {
      // Get alert stats for the hour
      const alertsInHour = Array.from(this.alerts.values())
        .filter(a => {
          const firedAt = new Date(a.firedAt);
          return firedAt >= previousHour && firedAt < currentHour;
        });
      
      const row: typeof sessionMetricsHourly.$inferInsert = {
        hourBucket: previousHour,
        totalSessionsCreated: hourData.sessionsCreated,
        totalSessionsSkipped: hourData.sessionsSkipped,
        totalSessionsExpired: 0,
        avgActiveSessionCount: (hourData.peakActive / 2).toFixed(2),
        peakActiveSessionCount: hourData.peakActive,
        avgSkipRatio: hourData.sessionsCreated + hourData.sessionsSkipped > 0
          ? (hourData.sessionsSkipped / (hourData.sessionsCreated + hourData.sessionsSkipped)).toFixed(6)
          : '1.000000',
        avgCreateRate: (hourData.sessionsCreated / 60).toFixed(4),
        totalPublicRequests: Math.floor(hourData.totalRequests * 0.6),
        totalInternalRequests: Math.floor(hourData.totalRequests * 0.3),
        totalProtectedRequests: Math.floor(hourData.totalRequests * 0.1),
        totalAuthFailures: 0,
        avgLatencyMs: hourData.latencySamples > 0 
          ? (hourData.avgLatencyMs / hourData.latencySamples).toFixed(3)
          : '0.000',
        primaryStoreType: this.storeType,
        failoverEvents: 0,
        unhealthyMinutes: 0,
        alertsTriggered: hourData.alertsTriggered,
        criticalAlerts: hourData.criticalAlerts,
        warningAlerts: alertsInHour.filter(a => a.severity === 'warning').length,
      };
      
      await executeWithRetry(
        async () => db.insert(sessionMetricsHourly).values(row),
        'Insert hourly aggregate',
        3
      );
      
      console.log(`[EnterpriseMetrics] 💾 Persisted hourly aggregate for ${previousHour.toISOString()}`);
      
      // Clean up old hourly aggregates from memory
      if (this.hourlyAggregates.size > this.maxHourlyAggregates) {
        const sortedKeys = Array.from(this.hourlyAggregates.keys()).sort();
        const keysToRemove = sortedKeys.slice(0, this.hourlyAggregates.size - this.maxHourlyAggregates);
        keysToRemove.forEach(key => this.hourlyAggregates.delete(key));
      }
    } catch (error) {
      console.error('[EnterpriseMetrics] Failed to flush hourly aggregate:', (error as Error).message);
    }
  }
  
  private percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    const index = Math.floor((p / 100) * sorted.length);
    return sorted[Math.min(index, sorted.length - 1)];
  }
  
  // ============================================================================
  // Getters & Status
  // ============================================================================
  
  getStatus(): {
    isRunning: boolean;
    currentSnapshot: GranularSnapshot;
    recentSnapshots: GranularSnapshot[];
    alerts: { active: number; total: number; bySeverity: Record<AlertSeverity, number> };
    policies: { total: number; enabled: number };
    storeInfo: { type: string; health: string; redisConnected: boolean };
    hourlyAggregatesCount: number;
  } {
    const activeAlerts = this.getActiveAlerts();
    const bySeverity: Record<AlertSeverity, number> = {
      info: activeAlerts.filter(a => a.severity === 'info').length,
      warning: activeAlerts.filter(a => a.severity === 'warning').length,
      critical: activeAlerts.filter(a => a.severity === 'critical').length,
    };
    
    const enabledPolicies = Array.from(this.alertPolicies.values())
      .filter(p => p.enabled).length;
    
    return {
      isRunning: this.isRunning,
      currentSnapshot: this.getCurrentSnapshot(),
      recentSnapshots: this.snapshots.slice(-12),
      alerts: {
        active: activeAlerts.length,
        total: this.alerts.size,
        bySeverity,
      },
      policies: {
        total: this.alertPolicies.size,
        enabled: enabledPolicies,
      },
      storeInfo: {
        type: this.storeType,
        health: this.storeHealth,
        redisConnected: this.redisConnected,
      },
      hourlyAggregatesCount: this.hourlyAggregates.size,
    };
  }
  
  getHistoricalData(hours = 24): GranularSnapshot[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.snapshots.filter(s => s.timestamp >= cutoff);
  }
  
  getHourlyAggregates(hours = 24): Array<{
    hour: string;
    totalRequests: number;
    sessionsCreated: number;
    sessionsSkipped: number;
    peakActive: number;
    avgLatencyMs: number;
    alertsTriggered: number;
    criticalAlerts: number;
  }> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    const result: Array<{
      hour: string;
      totalRequests: number;
      sessionsCreated: number;
      sessionsSkipped: number;
      peakActive: number;
      avgLatencyMs: number;
      alertsTriggered: number;
      criticalAlerts: number;
    }> = [];
    
    this.hourlyAggregates.forEach((agg, hour) => {
      if (new Date(hour) >= cutoff) {
        result.push({
          hour,
          totalRequests: agg.totalRequests,
          sessionsCreated: agg.sessionsCreated,
          sessionsSkipped: agg.sessionsSkipped,
          peakActive: agg.peakActive,
          avgLatencyMs: agg.avgLatencyMs,
          alertsTriggered: agg.alertsTriggered,
          criticalAlerts: agg.criticalAlerts,
        });
      }
    });
    
    return result.sort((a, b) => a.hour.localeCompare(b.hour));
  }
  
  getSecurityMetrics(): {
    authFailuresByType: Record<string, number>;
    bruteForceAttempts: number;
    rateLimitBreaches: number;
    suspiciousPatterns: number;
    blockedRequests: number;
    uniqueFailedIps: number;
  } {
    return {
      ...this.securityMetrics,
      uniqueFailedIps: this.securityMetrics.uniqueFailedIps.size,
    };
  }
  
  private getTotalCreated(): number {
    return this.snapshots.reduce((sum, s) => sum + s.sessionsCreated, 0) + this.sessionsCreated;
  }
  
  private getTotalSkipped(): number {
    return this.snapshots.reduce((sum, s) => sum + s.sessionsSkipped, 0) + this.sessionsSkipped;
  }
  
  private getTotalExpired(): number {
    return this.snapshots.reduce((sum, s) => sum + s.sessionsExpired, 0) + this.sessionsExpired;
  }
}

// Export singleton
export const enterpriseSessionMetrics = EnterpriseSessionMetricsEngine.getInstance();
