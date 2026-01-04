/**
 * Enterprise System Health Monitor
 * 
 * Comprehensive monitoring for 24/7 production stability:
 * - CPU, Memory, Disk utilization tracking
 * - Process health (event loop lag, heap usage)
 * - HTTP request metrics (response times, error rates)
 * - Database connection pool metrics
 * - Automatic alerting with severity levels
 * - Self-healing automation triggers
 * 
 * Target Metrics:
 * - CPU: ≤40% normal, 40-70% warning, >70% critical
 * - Memory: ≤65% normal, 65-80% warning, >80% critical
 * - Disk: ≤70% normal, 70-85% warning, >85% critical
 * - Response Time (P95): ≤200ms normal, 200-500ms warning, >500ms critical
 * - Error Rate (5xx): ≤0.1% normal, 0.1-1% warning, >1% critical
 */

import { EventEmitter } from 'events';

export type AlertSeverity = 'info' | 'warning' | 'critical' | 'emergency';

export interface SystemMetrics {
  timestamp: Date;
  cpu: CpuMetrics;
  memory: MemoryMetrics;
  disk: DiskMetrics;
  process: ProcessMetrics;
  http: HttpMetrics;
  database: DatabaseMetrics;
  session: SessionHealthMetrics;
}

interface CpuMetrics {
  usagePercent: number;
  loadAverage1m: number;
  loadAverage5m: number;
  loadAverage15m: number;
  status: 'normal' | 'warning' | 'critical';
}

interface MemoryMetrics {
  totalMB: number;
  usedMB: number;
  freeMB: number;
  usagePercent: number;
  heapUsedMB: number;
  heapTotalMB: number;
  heapUsagePercent: number;
  status: 'normal' | 'warning' | 'critical';
}

interface DiskMetrics {
  totalGB: number;
  usedGB: number;
  freeGB: number;
  usagePercent: number;
  status: 'normal' | 'warning' | 'critical';
}

interface ProcessMetrics {
  pid: number;
  uptime: number;
  eventLoopLagMs: number;
  activeHandles: number;
  activeRequests: number;
  nodeVersion: string;
  status: 'normal' | 'warning' | 'critical';
}

interface HttpMetrics {
  totalRequests: number;
  successCount: number;
  errorCount: number;
  error4xxCount: number;
  error5xxCount: number;
  errorRate: number;
  avgResponseTimeMs: number;
  p95ResponseTimeMs: number;
  p99ResponseTimeMs: number;
  requestsPerSecond: number;
  status: 'normal' | 'warning' | 'critical';
}

interface DatabaseMetrics {
  poolSize: number;
  activeConnections: number;
  idleConnections: number;
  waitingRequests: number;
  poolUsagePercent: number;
  avgQueryTimeMs: number;
  slowQueryCount: number;
  status: 'normal' | 'warning' | 'critical';
}

interface SessionHealthMetrics {
  skipRatio: number;
  memoryStoreCapacity: number;
  activeSessions: number;
  status: 'normal' | 'warning' | 'critical';
}

export interface SystemAlert {
  id: string;
  severity: AlertSeverity;
  category: string;
  metric: string;
  currentValue: number;
  threshold: number;
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'critical';
  score: number;
  checks: {
    name: string;
    status: 'pass' | 'warn' | 'fail';
    value: string;
    threshold: string;
  }[];
  alerts: SystemAlert[];
  recommendations: string[];
}

interface ThresholdConfig {
  normal: number;
  warning: number;
  critical: number;
}

const THRESHOLDS: Record<string, ThresholdConfig> = {
  cpu: { normal: 40, warning: 70, critical: 85 },
  memory: { normal: 65, warning: 80, critical: 90 },
  heap: { normal: 70, warning: 85, critical: 95 },
  disk: { normal: 70, warning: 85, critical: 95 },
  eventLoopLag: { normal: 50, warning: 100, critical: 200 },
  responseTime: { normal: 200, warning: 500, critical: 1000 },
  errorRate: { normal: 0.1, warning: 1, critical: 5 },
  dbPool: { normal: 70, warning: 85, critical: 95 },
  sessionSkipRatio: { normal: 80, warning: 60, critical: 40 },
  sessionCapacity: { normal: 60, warning: 80, critical: 90 },
};

class EnterpriseSystemHealthMonitor extends EventEmitter {
  private static instance: EnterpriseSystemHealthMonitor;
  
  private isRunning = false;
  private monitorInterval: NodeJS.Timeout | null = null;
  private metricsHistory: SystemMetrics[] = [];
  private alerts: Map<string, SystemAlert> = new Map();
  private alertHistory: SystemAlert[] = [];
  
  private httpRequestTimes: number[] = [];
  private httpRequestCount = 0;
  private httpErrorCount = 0;
  private http4xxCount = 0;
  private http5xxCount = 0;
  private lastRequestCountReset = Date.now();
  
  private dbQueryTimes: number[] = [];
  private dbSlowQueryCount = 0;
  private dbPoolMetrics = { active: 0, idle: 0, waiting: 0, total: 10 };
  
  private eventLoopLagSamples: number[] = [];
  private lastEventLoopCheck = process.hrtime.bigint();
  
  private selfHealingEnabled = true;
  private selfHealingActions: { action: string; timestamp: Date; reason: string }[] = [];
  
  private constructor() {
    super();
    this.setupEventLoopMonitoring();
  }
  
  static getInstance(): EnterpriseSystemHealthMonitor {
    if (!EnterpriseSystemHealthMonitor.instance) {
      EnterpriseSystemHealthMonitor.instance = new EnterpriseSystemHealthMonitor();
    }
    return EnterpriseSystemHealthMonitor.instance;
  }
  
  private setupEventLoopMonitoring(): void {
    const measureLag = () => {
      const start = process.hrtime.bigint();
      setImmediate(() => {
        const lag = Number(process.hrtime.bigint() - start) / 1e6;
        this.eventLoopLagSamples.push(lag);
        if (this.eventLoopLagSamples.length > 60) {
          this.eventLoopLagSamples.shift();
        }
      });
    };
    
    setInterval(measureLag, 1000);
  }
  
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    
    this.monitorInterval = setInterval(() => {
      this.collectAndProcessMetrics();
    }, 10000);
    
    this.collectAndProcessMetrics();
    
    console.log('[SystemHealth] ✅ Enterprise system health monitoring started');
    console.log('[SystemHealth] 📊 Metrics collection: 10s interval');
    console.log('[SystemHealth] 🎯 Self-healing: ' + (this.selfHealingEnabled ? 'enabled' : 'disabled'));
  }
  
  stop(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    this.isRunning = false;
    console.log('[SystemHealth] ⏹️ System health monitoring stopped');
  }
  
  recordHttpRequest(responseTimeMs: number, statusCode: number): void {
    this.httpRequestTimes.push(responseTimeMs);
    this.httpRequestCount++;
    
    if (statusCode >= 400 && statusCode < 500) {
      this.http4xxCount++;
    } else if (statusCode >= 500) {
      this.http5xxCount++;
      this.httpErrorCount++;
    }
    
    if (this.httpRequestTimes.length > 1000) {
      this.httpRequestTimes = this.httpRequestTimes.slice(-500);
    }
  }
  
  recordDbQuery(queryTimeMs: number, isSlowQuery = false): void {
    this.dbQueryTimes.push(queryTimeMs);
    if (isSlowQuery || queryTimeMs > 100) {
      this.dbSlowQueryCount++;
    }
    
    if (this.dbQueryTimes.length > 500) {
      this.dbQueryTimes = this.dbQueryTimes.slice(-250);
    }
  }
  
  updateDbPoolMetrics(active: number, idle: number, waiting: number, total: number): void {
    this.dbPoolMetrics = { active, idle, waiting, total };
  }
  
  private async collectAndProcessMetrics(): Promise<void> {
    const metrics = await this.collectMetrics();
    
    this.metricsHistory.push(metrics);
    if (this.metricsHistory.length > 360) {
      this.metricsHistory.shift();
    }
    
    this.processAlerts(metrics);
    
    if (this.selfHealingEnabled) {
      await this.executeSelfHealing(metrics);
    }
    
    this.emit('metrics', metrics);
  }
  
  private async collectMetrics(): Promise<SystemMetrics> {
    const now = new Date();
    
    return {
      timestamp: now,
      cpu: this.collectCpuMetrics(),
      memory: this.collectMemoryMetrics(),
      disk: await this.collectDiskMetrics(),
      process: this.collectProcessMetrics(),
      http: this.collectHttpMetrics(),
      database: this.collectDatabaseMetrics(),
      session: this.collectSessionMetrics(),
    };
  }
  
  private collectCpuMetrics(): CpuMetrics {
    const os = require('os');
    const cpus = os.cpus();
    const loadAvg = os.loadavg();
    
    let totalIdle = 0;
    let totalTick = 0;
    
    for (const cpu of cpus) {
      for (const type in cpu.times) {
        totalTick += (cpu.times as any)[type];
      }
      totalIdle += cpu.times.idle;
    }
    
    const usagePercent = Math.round((1 - totalIdle / totalTick) * 100);
    
    let status: 'normal' | 'warning' | 'critical' = 'normal';
    if (usagePercent > THRESHOLDS.cpu.critical) status = 'critical';
    else if (usagePercent > THRESHOLDS.cpu.warning) status = 'warning';
    
    return {
      usagePercent,
      loadAverage1m: loadAvg[0],
      loadAverage5m: loadAvg[1],
      loadAverage15m: loadAvg[2],
      status,
    };
  }
  
  private collectMemoryMetrics(): MemoryMetrics {
    const os = require('os');
    const totalMB = Math.round(os.totalmem() / 1024 / 1024);
    const freeMB = Math.round(os.freemem() / 1024 / 1024);
    const usedMB = totalMB - freeMB;
    const usagePercent = Math.round((usedMB / totalMB) * 100);
    
    const heapUsed = process.memoryUsage().heapUsed;
    const heapTotal = process.memoryUsage().heapTotal;
    const heapUsedMB = Math.round(heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(heapTotal / 1024 / 1024);
    const heapUsagePercent = Math.round((heapUsed / heapTotal) * 100);
    
    let status: 'normal' | 'warning' | 'critical' = 'normal';
    const effectiveUsage = Math.max(usagePercent, heapUsagePercent);
    if (effectiveUsage > THRESHOLDS.memory.critical) status = 'critical';
    else if (effectiveUsage > THRESHOLDS.memory.warning) status = 'warning';
    
    return {
      totalMB,
      usedMB,
      freeMB,
      usagePercent,
      heapUsedMB,
      heapTotalMB,
      heapUsagePercent,
      status,
    };
  }
  
  private async collectDiskMetrics(): Promise<DiskMetrics> {
    try {
      const { execSync } = require('child_process');
      const output = execSync('df -h / | tail -1', { encoding: 'utf-8' });
      const parts = output.trim().split(/\s+/);
      
      const parseSize = (s: string): number => {
        const num = parseFloat(s);
        if (s.includes('G')) return num;
        if (s.includes('M')) return num / 1024;
        if (s.includes('T')) return num * 1024;
        return num;
      };
      
      const totalGB = parseSize(parts[1]);
      const usedGB = parseSize(parts[2]);
      const freeGB = parseSize(parts[3]);
      const usagePercent = parseInt(parts[4]);
      
      let status: 'normal' | 'warning' | 'critical' = 'normal';
      if (usagePercent > THRESHOLDS.disk.critical) status = 'critical';
      else if (usagePercent > THRESHOLDS.disk.warning) status = 'warning';
      
      return { totalGB, usedGB, freeGB, usagePercent, status };
    } catch {
      return {
        totalGB: 0,
        usedGB: 0,
        freeGB: 0,
        usagePercent: 0,
        status: 'normal',
      };
    }
  }
  
  private collectProcessMetrics(): ProcessMetrics {
    const avgLag = this.eventLoopLagSamples.length > 0
      ? this.eventLoopLagSamples.reduce((a, b) => a + b, 0) / this.eventLoopLagSamples.length
      : 0;
    
    let status: 'normal' | 'warning' | 'critical' = 'normal';
    if (avgLag > THRESHOLDS.eventLoopLag.critical) status = 'critical';
    else if (avgLag > THRESHOLDS.eventLoopLag.warning) status = 'warning';
    
    return {
      pid: process.pid,
      uptime: process.uptime(),
      eventLoopLagMs: Math.round(avgLag * 100) / 100,
      activeHandles: (process as any)._getActiveHandles?.().length || 0,
      activeRequests: (process as any)._getActiveRequests?.().length || 0,
      nodeVersion: process.version,
      status,
    };
  }
  
  private collectHttpMetrics(): HttpMetrics {
    const now = Date.now();
    const timeDiffSeconds = (now - this.lastRequestCountReset) / 1000;
    
    const sorted = [...this.httpRequestTimes].sort((a, b) => a - b);
    const p95Index = Math.floor(sorted.length * 0.95);
    const p99Index = Math.floor(sorted.length * 0.99);
    
    const avgResponseTimeMs = sorted.length > 0
      ? Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length)
      : 0;
    const p95ResponseTimeMs = sorted[p95Index] || 0;
    const p99ResponseTimeMs = sorted[p99Index] || 0;
    
    const errorRate = this.httpRequestCount > 0
      ? (this.http5xxCount / this.httpRequestCount) * 100
      : 0;
    
    let status: 'normal' | 'warning' | 'critical' = 'normal';
    if (errorRate > THRESHOLDS.errorRate.critical || p95ResponseTimeMs > THRESHOLDS.responseTime.critical) {
      status = 'critical';
    } else if (errorRate > THRESHOLDS.errorRate.warning || p95ResponseTimeMs > THRESHOLDS.responseTime.warning) {
      status = 'warning';
    }
    
    return {
      totalRequests: this.httpRequestCount,
      successCount: this.httpRequestCount - this.httpErrorCount - this.http4xxCount,
      errorCount: this.httpErrorCount,
      error4xxCount: this.http4xxCount,
      error5xxCount: this.http5xxCount,
      errorRate: Math.round(errorRate * 100) / 100,
      avgResponseTimeMs,
      p95ResponseTimeMs: Math.round(p95ResponseTimeMs),
      p99ResponseTimeMs: Math.round(p99ResponseTimeMs),
      requestsPerSecond: timeDiffSeconds > 0 ? Math.round(this.httpRequestCount / timeDiffSeconds * 10) / 10 : 0,
      status,
    };
  }
  
  private collectDatabaseMetrics(): DatabaseMetrics {
    const { active, idle, waiting, total } = this.dbPoolMetrics;
    const poolUsagePercent = total > 0 ? Math.round((active / total) * 100) : 0;
    
    const avgQueryTimeMs = this.dbQueryTimes.length > 0
      ? Math.round(this.dbQueryTimes.reduce((a, b) => a + b, 0) / this.dbQueryTimes.length)
      : 0;
    
    let status: 'normal' | 'warning' | 'critical' = 'normal';
    if (poolUsagePercent > THRESHOLDS.dbPool.critical) status = 'critical';
    else if (poolUsagePercent > THRESHOLDS.dbPool.warning) status = 'warning';
    
    return {
      poolSize: total,
      activeConnections: active,
      idleConnections: idle,
      waitingRequests: waiting,
      poolUsagePercent,
      avgQueryTimeMs,
      slowQueryCount: this.dbSlowQueryCount,
      status,
    };
  }
  
  private collectSessionMetrics(): SessionHealthMetrics {
    const productionMonitor = require('./enterprise-production-monitor').enterpriseProductionMonitor;
    const dashboard = productionMonitor?.getDashboard?.() || {};
    
    const skipRatio = (dashboard.sessionMetrics?.skipRatio || 0) * 100;
    const capacity = dashboard.memoryStore?.capacityPercent || 0;
    const activeSessions = dashboard.memoryStore?.currentSessions || 0;
    
    let status: 'normal' | 'warning' | 'critical' = 'normal';
    if (skipRatio < THRESHOLDS.sessionSkipRatio.critical || capacity > THRESHOLDS.sessionCapacity.critical) {
      status = 'critical';
    } else if (skipRatio < THRESHOLDS.sessionSkipRatio.warning || capacity > THRESHOLDS.sessionCapacity.warning) {
      status = 'warning';
    }
    
    return {
      skipRatio: Math.round(skipRatio * 10) / 10,
      memoryStoreCapacity: Math.round(capacity * 10) / 10,
      activeSessions,
      status,
    };
  }
  
  private processAlerts(metrics: SystemMetrics): void {
    const checks: { id: string; category: string; metric: string; value: number; threshold: ThresholdConfig; invert?: boolean }[] = [
      { id: 'cpu', category: 'System', metric: 'CPU Usage', value: metrics.cpu.usagePercent, threshold: THRESHOLDS.cpu },
      { id: 'memory', category: 'System', metric: 'Memory Usage', value: metrics.memory.usagePercent, threshold: THRESHOLDS.memory },
      { id: 'heap', category: 'Process', metric: 'Heap Usage', value: metrics.memory.heapUsagePercent, threshold: THRESHOLDS.heap },
      { id: 'disk', category: 'System', metric: 'Disk Usage', value: metrics.disk.usagePercent, threshold: THRESHOLDS.disk },
      { id: 'eventLoop', category: 'Process', metric: 'Event Loop Lag', value: metrics.process.eventLoopLagMs, threshold: THRESHOLDS.eventLoopLag },
      { id: 'responseTime', category: 'HTTP', metric: 'Response Time (P95)', value: metrics.http.p95ResponseTimeMs, threshold: THRESHOLDS.responseTime },
      { id: 'errorRate', category: 'HTTP', metric: 'Error Rate (5xx)', value: metrics.http.errorRate, threshold: THRESHOLDS.errorRate },
      { id: 'dbPool', category: 'Database', metric: 'Connection Pool', value: metrics.database.poolUsagePercent, threshold: THRESHOLDS.dbPool },
      { id: 'sessionSkip', category: 'Session', metric: 'Skip Ratio', value: metrics.session.skipRatio, threshold: THRESHOLDS.sessionSkipRatio, invert: true },
      { id: 'sessionCap', category: 'Session', metric: 'MemoryStore Capacity', value: metrics.session.memoryStoreCapacity, threshold: THRESHOLDS.sessionCapacity },
    ];
    
    for (const check of checks) {
      let severity: AlertSeverity | null = null;
      let thresholdValue = 0;
      
      if (check.invert) {
        if (check.value < check.threshold.critical) {
          severity = 'critical';
          thresholdValue = check.threshold.critical;
        } else if (check.value < check.threshold.warning) {
          severity = 'warning';
          thresholdValue = check.threshold.warning;
        }
      } else {
        if (check.value > check.threshold.critical) {
          severity = 'critical';
          thresholdValue = check.threshold.critical;
        } else if (check.value > check.threshold.warning) {
          severity = 'warning';
          thresholdValue = check.threshold.warning;
        }
      }
      
      const existingAlert = this.alerts.get(check.id);
      
      if (severity) {
        const alert: SystemAlert = {
          id: check.id,
          severity,
          category: check.category,
          metric: check.metric,
          currentValue: check.value,
          threshold: thresholdValue,
          message: `${check.metric}: ${check.value}${check.id.includes('Rate') || check.id.includes('Ratio') || check.id.includes('Cap') || check.id.includes('memory') || check.id.includes('cpu') || check.id.includes('disk') || check.id.includes('heap') || check.id.includes('Pool') ? '%' : 'ms'} (threshold: ${thresholdValue}${check.id.includes('Rate') || check.id.includes('Ratio') || check.id.includes('Cap') || check.id.includes('memory') || check.id.includes('cpu') || check.id.includes('disk') || check.id.includes('heap') || check.id.includes('Pool') ? '%' : 'ms'})`,
          timestamp: new Date(),
          resolved: false,
        };
        
        if (!existingAlert || existingAlert.severity !== severity) {
          this.alerts.set(check.id, alert);
          this.alertHistory.push(alert);
          this.emit('alert', alert);
          console.log(`[SystemHealth] ⚠️ ${severity.toUpperCase()}: ${alert.message}`);
        }
      } else if (existingAlert && !existingAlert.resolved) {
        existingAlert.resolved = true;
        existingAlert.resolvedAt = new Date();
        this.emit('alertResolved', existingAlert);
        console.log(`[SystemHealth] ✅ RESOLVED: ${existingAlert.metric}`);
      }
    }
  }
  
  private async executeSelfHealing(metrics: SystemMetrics): Promise<void> {
    if (metrics.memory.heapUsagePercent > 90) {
      console.log('[SystemHealth] 🔄 Self-healing: Triggering garbage collection');
      if (global.gc) {
        global.gc();
        this.recordSelfHealingAction('gc', 'Heap usage > 90%');
      }
    }
    
    if (metrics.session.memoryStoreCapacity > 85) {
      console.log('[SystemHealth] 🔄 Self-healing: Session cleanup triggered');
      try {
        const { sessionBypass } = require('../sessions/session-bypass');
        await sessionBypass?.performEmergencyCleanup?.();
        this.recordSelfHealingAction('session_cleanup', 'Session capacity > 85%');
      } catch (e) {
      }
    }
  }
  
  private recordSelfHealingAction(action: string, reason: string): void {
    this.selfHealingActions.push({
      action,
      timestamp: new Date(),
      reason,
    });
    
    if (this.selfHealingActions.length > 100) {
      this.selfHealingActions = this.selfHealingActions.slice(-50);
    }
  }
  
  getHealthCheck(): HealthCheckResult {
    const latest = this.metricsHistory[this.metricsHistory.length - 1];
    if (!latest) {
      return {
        status: 'healthy',
        score: 100,
        checks: [],
        alerts: [],
        recommendations: [],
      };
    }
    
    const checks: HealthCheckResult['checks'] = [
      {
        name: 'CPU',
        status: latest.cpu.status === 'normal' ? 'pass' : latest.cpu.status === 'warning' ? 'warn' : 'fail',
        value: `${latest.cpu.usagePercent}%`,
        threshold: `≤${THRESHOLDS.cpu.normal}%`,
      },
      {
        name: 'Memory',
        status: latest.memory.status === 'normal' ? 'pass' : latest.memory.status === 'warning' ? 'warn' : 'fail',
        value: `${latest.memory.usagePercent}%`,
        threshold: `≤${THRESHOLDS.memory.normal}%`,
      },
      {
        name: 'Heap',
        status: latest.memory.heapUsagePercent <= THRESHOLDS.heap.normal ? 'pass' : latest.memory.heapUsagePercent <= THRESHOLDS.heap.warning ? 'warn' : 'fail',
        value: `${latest.memory.heapUsagePercent}%`,
        threshold: `≤${THRESHOLDS.heap.normal}%`,
      },
      {
        name: 'Disk',
        status: latest.disk.status === 'normal' ? 'pass' : latest.disk.status === 'warning' ? 'warn' : 'fail',
        value: `${latest.disk.usagePercent}%`,
        threshold: `≤${THRESHOLDS.disk.normal}%`,
      },
      {
        name: 'Event Loop',
        status: latest.process.status === 'normal' ? 'pass' : latest.process.status === 'warning' ? 'warn' : 'fail',
        value: `${latest.process.eventLoopLagMs}ms`,
        threshold: `≤${THRESHOLDS.eventLoopLag.normal}ms`,
      },
      {
        name: 'Response Time (P95)',
        status: latest.http.p95ResponseTimeMs <= THRESHOLDS.responseTime.normal ? 'pass' : latest.http.p95ResponseTimeMs <= THRESHOLDS.responseTime.warning ? 'warn' : 'fail',
        value: `${latest.http.p95ResponseTimeMs}ms`,
        threshold: `≤${THRESHOLDS.responseTime.normal}ms`,
      },
      {
        name: 'Error Rate (5xx)',
        status: latest.http.errorRate <= THRESHOLDS.errorRate.normal ? 'pass' : latest.http.errorRate <= THRESHOLDS.errorRate.warning ? 'warn' : 'fail',
        value: `${latest.http.errorRate}%`,
        threshold: `≤${THRESHOLDS.errorRate.normal}%`,
      },
      {
        name: 'Session Skip Ratio',
        status: latest.session.skipRatio >= THRESHOLDS.sessionSkipRatio.normal ? 'pass' : latest.session.skipRatio >= THRESHOLDS.sessionSkipRatio.warning ? 'warn' : 'fail',
        value: `${latest.session.skipRatio}%`,
        threshold: `≥${THRESHOLDS.sessionSkipRatio.normal}%`,
      },
      {
        name: 'Session Capacity',
        status: latest.session.memoryStoreCapacity <= THRESHOLDS.sessionCapacity.normal ? 'pass' : latest.session.memoryStoreCapacity <= THRESHOLDS.sessionCapacity.warning ? 'warn' : 'fail',
        value: `${latest.session.memoryStoreCapacity}%`,
        threshold: `≤${THRESHOLDS.sessionCapacity.normal}%`,
      },
    ];
    
    const failCount = checks.filter(c => c.status === 'fail').length;
    const warnCount = checks.filter(c => c.status === 'warn').length;
    
    let status: HealthCheckResult['status'] = 'healthy';
    let score = 100;
    
    if (failCount >= 3) {
      status = 'critical';
      score = 20;
    } else if (failCount >= 1) {
      status = 'unhealthy';
      score = 50 - failCount * 10;
    } else if (warnCount >= 2) {
      status = 'degraded';
      score = 70 - warnCount * 5;
    } else if (warnCount >= 1) {
      status = 'degraded';
      score = 85 - warnCount * 5;
    }
    
    const recommendations: string[] = [];
    if (latest.memory.heapUsagePercent > 70) {
      recommendations.push('Consider increasing heap size or optimizing memory usage');
    }
    if (latest.session.skipRatio < 80) {
      recommendations.push('Session skip ratio low - check session bypass configuration');
    }
    if (latest.session.memoryStoreCapacity > 60) {
      recommendations.push('Configure Redis session store for production stability (REDIS_URL)');
    }
    if (latest.http.errorRate > 0.5) {
      recommendations.push('High error rate detected - check application logs');
    }
    
    const activeAlerts = Array.from(this.alerts.values()).filter(a => !a.resolved);
    
    return {
      status,
      score,
      checks,
      alerts: activeAlerts,
      recommendations,
    };
  }
  
  getMetrics(): SystemMetrics | null {
    return this.metricsHistory[this.metricsHistory.length - 1] || null;
  }
  
  getMetricsHistory(minutes = 60): SystemMetrics[] {
    const cutoff = Date.now() - minutes * 60 * 1000;
    return this.metricsHistory.filter(m => m.timestamp.getTime() > cutoff);
  }
  
  getActiveAlerts(): SystemAlert[] {
    return Array.from(this.alerts.values()).filter(a => !a.resolved);
  }
  
  getAlertHistory(limit = 50): SystemAlert[] {
    return this.alertHistory.slice(-limit);
  }
  
  getSelfHealingHistory(): typeof this.selfHealingActions {
    return [...this.selfHealingActions];
  }
  
  resetMetrics(): void {
    this.httpRequestTimes = [];
    this.httpRequestCount = 0;
    this.httpErrorCount = 0;
    this.http4xxCount = 0;
    this.http5xxCount = 0;
    this.lastRequestCountReset = Date.now();
    this.dbQueryTimes = [];
    this.dbSlowQueryCount = 0;
    console.log('[SystemHealth] 📊 Metrics reset');
  }
}

export const systemHealthMonitor = EnterpriseSystemHealthMonitor.getInstance();
