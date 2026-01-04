/**
 * Enterprise Production Monitor
 * 
 * Production-grade monitoring system for 24/7 mainnet stability:
 * - Session skip ratio tracking (target ~80%)
 * - Prometheus metrics export for external monitoring
 * - MemoryStore capacity alerts with Redis migration recommendations
 * - Real-time dashboard API endpoints
 * - Automatic alerting and escalation
 * 
 * Chain ID: 6000 | Target: 210,000 TPS | 125 Genesis Validators
 */

import { Router, Request, Response } from 'express';
import { healthMonitor } from '../health/production-health-monitor';

// ============================================================================
// Types
// ============================================================================

interface SessionMetrics {
  skipCount: number;
  createCount: number;
  skipRatio: number;
  lastCalculated: Date;
  history: { timestamp: Date; skipRatio: number }[];
}

interface MemoryStoreMetrics {
  currentSessions: number;
  maxSessions: number;
  capacityPercent: number;
  isWarning: boolean;
  isCritical: boolean;
  estimatedTimeToFull: number | null; // minutes
}

interface AlertConfig {
  name: string;
  threshold: number;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  triggered: boolean;
  lastTriggered: Date | null;
  cooldownMinutes: number;
}

interface PrometheusMetric {
  name: string;
  type: 'gauge' | 'counter' | 'histogram';
  help: string;
  value: number | string;
  labels?: Record<string, string>;
}

// ============================================================================
// Enterprise Production Monitor Class
// ============================================================================

class EnterpriseProductionMonitor {
  private static instance: EnterpriseProductionMonitor;
  
  private isRunning = false;
  private monitorInterval: NodeJS.Timeout | null = null;
  
  // Session metrics
  private sessionMetrics: SessionMetrics = {
    skipCount: 0,
    createCount: 0,
    skipRatio: 0,
    lastCalculated: new Date(),
    history: [],
  };
  
  // MemoryStore metrics
  private memoryStoreMetrics: MemoryStoreMetrics = {
    currentSessions: 0,
    maxSessions: 10000,
    capacityPercent: 0,
    isWarning: false,
    isCritical: false,
    estimatedTimeToFull: null,
  };
  
  // Session growth tracking for estimation
  private sessionGrowthHistory: { timestamp: number; count: number }[] = [];
  
  // Alert configurations
  private alerts: AlertConfig[] = [
    {
      name: 'session_skip_ratio_low',
      threshold: 0.7, // Below 70% skip ratio
      severity: 'warning',
      message: 'Session skip ratio below 70% - MemoryStore may overflow',
      triggered: false,
      lastTriggered: null,
      cooldownMinutes: 15,
    },
    {
      name: 'session_skip_ratio_critical',
      threshold: 0.5, // Below 50% skip ratio
      severity: 'critical',
      message: 'CRITICAL: Session skip ratio below 50% - Production instability imminent',
      triggered: false,
      lastTriggered: null,
      cooldownMinutes: 5,
    },
    {
      name: 'memory_store_warning',
      threshold: 0.7, // 70% capacity
      severity: 'warning',
      message: 'MemoryStore at 70% capacity - Consider enabling Redis',
      triggered: false,
      lastTriggered: null,
      cooldownMinutes: 15,
    },
    {
      name: 'memory_store_critical',
      threshold: 0.9, // 90% capacity
      severity: 'critical',
      message: 'CRITICAL: MemoryStore at 90% capacity - Redis required immediately',
      triggered: false,
      lastTriggered: null,
      cooldownMinutes: 5,
    },
    {
      name: 'event_loop_lag',
      threshold: 500, // 500ms lag
      severity: 'critical',
      message: 'CRITICAL: Event loop lag exceeds 500ms - Server unresponsive',
      triggered: false,
      lastTriggered: null,
      cooldownMinutes: 2,
    },
    {
      name: 'memory_pressure',
      threshold: 0.85, // 85% heap
      severity: 'critical',
      message: 'CRITICAL: Memory usage above 85% - OOM risk',
      triggered: false,
      lastTriggered: null,
      cooldownMinutes: 5,
    },
  ];
  
  // Redis recommendation state
  private redisRecommended = false;
  private redisRecommendationReason = '';
  
  // ★ [2026-01-04] Startup grace period to prevent false alarms
  private startTime = Date.now();
  private readonly STARTUP_GRACE_PERIOD_MS = 120000; // 2 minutes startup grace period
  
  private constructor() {}
  
  static getInstance(): EnterpriseProductionMonitor {
    if (!EnterpriseProductionMonitor.instance) {
      EnterpriseProductionMonitor.instance = new EnterpriseProductionMonitor();
    }
    return EnterpriseProductionMonitor.instance;
  }
  
  // ============================================================================
  // Lifecycle
  // ============================================================================
  
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    
    // Monitor every 30 seconds
    this.monitorInterval = setInterval(() => {
      this.collectMetrics();
      this.checkAlerts();
      this.updateRedisRecommendation();
    }, 30000);
    
    // Initial collection
    this.collectMetrics();
    
    console.log('[ProductionMonitor] ✅ Enterprise production monitoring started');
    console.log('[ProductionMonitor] 📊 Metrics collection: 30s, Alert check: 30s');
    console.log('[ProductionMonitor] 🎯 Session skip ratio target: ≥80%');
  }
  
  stop(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    this.isRunning = false;
    console.log('[ProductionMonitor] Stopped');
  }
  
  // ============================================================================
  // Metrics Collection
  // ============================================================================
  
  private collectMetrics(): void {
    const now = new Date();
    
    // Calculate skip ratio
    const total = this.sessionMetrics.skipCount + this.sessionMetrics.createCount;
    if (total > 0) {
      this.sessionMetrics.skipRatio = this.sessionMetrics.skipCount / total;
    }
    this.sessionMetrics.lastCalculated = now;
    
    // Keep 24 hours of history (one entry per 30 seconds = 2880 entries)
    this.sessionMetrics.history.push({
      timestamp: now,
      skipRatio: this.sessionMetrics.skipRatio,
    });
    if (this.sessionMetrics.history.length > 2880) {
      this.sessionMetrics.history.shift();
    }
    
    // Track session growth for time-to-full estimation
    this.sessionGrowthHistory.push({
      timestamp: Date.now(),
      count: this.memoryStoreMetrics.currentSessions,
    });
    if (this.sessionGrowthHistory.length > 60) { // Keep last 30 minutes
      this.sessionGrowthHistory.shift();
    }
    
    // Calculate estimated time to full
    this.calculateTimeToFull();
  }
  
  private calculateTimeToFull(): void {
    if (this.sessionGrowthHistory.length < 4) {
      this.memoryStoreMetrics.estimatedTimeToFull = null;
      return;
    }
    
    // Calculate growth rate from last 10 minutes
    const recentHistory = this.sessionGrowthHistory.slice(-20);
    const firstEntry = recentHistory[0];
    const lastEntry = recentHistory[recentHistory.length - 1];
    
    const timeDiffMinutes = (lastEntry.timestamp - firstEntry.timestamp) / 60000;
    const sessionGrowth = lastEntry.count - firstEntry.count;
    
    if (timeDiffMinutes === 0 || sessionGrowth <= 0) {
      this.memoryStoreMetrics.estimatedTimeToFull = null;
      return;
    }
    
    const growthRatePerMinute = sessionGrowth / timeDiffMinutes;
    const remainingCapacity = this.memoryStoreMetrics.maxSessions - this.memoryStoreMetrics.currentSessions;
    
    if (growthRatePerMinute > 0) {
      this.memoryStoreMetrics.estimatedTimeToFull = Math.round(remainingCapacity / growthRatePerMinute);
    } else {
      this.memoryStoreMetrics.estimatedTimeToFull = null;
    }
  }
  
  // ============================================================================
  // Alert System
  // ============================================================================
  
  private checkAlerts(): void {
    const now = new Date();
    
    // ★ [2026-01-04] Skip alerts during startup grace period
    const timeSinceStart = Date.now() - this.startTime;
    const isStartupPhase = timeSinceStart < this.STARTUP_GRACE_PERIOD_MS;
    
    for (const alert of this.alerts) {
      // Check cooldown
      if (alert.lastTriggered) {
        const cooldownMs = alert.cooldownMinutes * 60 * 1000;
        if (now.getTime() - alert.lastTriggered.getTime() < cooldownMs) {
          continue;
        }
      }
      
      let shouldTrigger = false;
      
      switch (alert.name) {
        case 'session_skip_ratio_low':
          // Suppress during startup - skip ratio needs time to stabilize
          if (isStartupPhase) break;
          shouldTrigger = this.sessionMetrics.skipRatio < alert.threshold && 
                          this.sessionMetrics.skipRatio >= 0.5;
          break;
        case 'session_skip_ratio_critical':
          // Suppress during startup - skip ratio needs time to stabilize
          if (isStartupPhase) break;
          shouldTrigger = this.sessionMetrics.skipRatio < alert.threshold;
          break;
        case 'memory_store_warning':
          shouldTrigger = this.memoryStoreMetrics.capacityPercent >= alert.threshold * 100 &&
                          this.memoryStoreMetrics.capacityPercent < 90;
          break;
        case 'memory_store_critical':
          shouldTrigger = this.memoryStoreMetrics.capacityPercent >= alert.threshold * 100;
          break;
        case 'event_loop_lag':
          // Suppress during startup - event loop lag is expected during initialization
          if (isStartupPhase) break;
          const healthStatus = healthMonitor.getStatus();
          shouldTrigger = healthStatus.eventLoopLagMs > alert.threshold;
          break;
        case 'memory_pressure':
          const health = healthMonitor.getStatus();
          const memPercent = health.memoryUsageMb / health.memoryLimitMb;
          shouldTrigger = memPercent > alert.threshold;
          break;
      }
      
      if (shouldTrigger && !alert.triggered) {
        alert.triggered = true;
        alert.lastTriggered = now;
        this.emitAlert(alert);
      } else if (!shouldTrigger && alert.triggered) {
        alert.triggered = false;
      }
    }
  }
  
  private emitAlert(alert: AlertConfig): void {
    const prefix = alert.severity === 'critical' ? '🚨' : '⚠️';
    console.log(`[ProductionMonitor] ${prefix} ALERT [${alert.severity.toUpperCase()}]: ${alert.message}`);
    
    // Log additional context
    console.log(`[ProductionMonitor] 📊 Current metrics:
  - Session skip ratio: ${(this.sessionMetrics.skipRatio * 100).toFixed(1)}%
  - MemoryStore capacity: ${this.memoryStoreMetrics.capacityPercent.toFixed(1)}%
  - Sessions: ${this.memoryStoreMetrics.currentSessions}/${this.memoryStoreMetrics.maxSessions}
  - Time to full: ${this.memoryStoreMetrics.estimatedTimeToFull ?? 'N/A'} minutes`);
  }
  
  // ============================================================================
  // Redis Recommendation
  // ============================================================================
  
  private updateRedisRecommendation(): void {
    const reasons: string[] = [];
    
    if (this.memoryStoreMetrics.capacityPercent >= 70) {
      reasons.push(`MemoryStore at ${this.memoryStoreMetrics.capacityPercent.toFixed(1)}% capacity`);
    }
    
    if (this.sessionMetrics.skipRatio < 0.7) {
      reasons.push(`Session skip ratio ${(this.sessionMetrics.skipRatio * 100).toFixed(1)}% (target: ≥80%)`);
    }
    
    if (this.memoryStoreMetrics.estimatedTimeToFull !== null && 
        this.memoryStoreMetrics.estimatedTimeToFull < 60) {
      reasons.push(`Estimated ${this.memoryStoreMetrics.estimatedTimeToFull} minutes until MemoryStore full`);
    }
    
    this.redisRecommended = reasons.length > 0;
    this.redisRecommendationReason = reasons.join('; ');
  }
  
  // ============================================================================
  // Public API
  // ============================================================================
  
  recordSessionSkip(): void {
    this.sessionMetrics.skipCount++;
  }
  
  recordSessionCreate(): void {
    this.sessionMetrics.createCount++;
  }
  
  updateMemoryStoreMetrics(currentSessions: number, maxSessions: number): void {
    this.memoryStoreMetrics.currentSessions = currentSessions;
    this.memoryStoreMetrics.maxSessions = maxSessions;
    this.memoryStoreMetrics.capacityPercent = (currentSessions / maxSessions) * 100;
    this.memoryStoreMetrics.isWarning = this.memoryStoreMetrics.capacityPercent >= 70;
    this.memoryStoreMetrics.isCritical = this.memoryStoreMetrics.capacityPercent >= 90;
  }
  
  getSessionMetrics(): SessionMetrics {
    return { ...this.sessionMetrics };
  }
  
  getMemoryStoreMetrics(): MemoryStoreMetrics {
    return { ...this.memoryStoreMetrics };
  }
  
  getActiveAlerts(): AlertConfig[] {
    return this.alerts.filter(a => a.triggered);
  }
  
  getRedisRecommendation(): { recommended: boolean; reason: string } {
    return {
      recommended: this.redisRecommended,
      reason: this.redisRecommendationReason,
    };
  }
  
  // ============================================================================
  // Prometheus Metrics Export
  // ============================================================================
  
  getPrometheusMetrics(): string {
    const healthStatus = healthMonitor.getStatus();
    const metrics: PrometheusMetric[] = [
      // Session metrics
      {
        name: 'tburn_session_skip_total',
        type: 'counter',
        help: 'Total number of skipped sessions',
        value: this.sessionMetrics.skipCount,
      },
      {
        name: 'tburn_session_create_total',
        type: 'counter',
        help: 'Total number of created sessions',
        value: this.sessionMetrics.createCount,
      },
      {
        name: 'tburn_session_skip_ratio',
        type: 'gauge',
        help: 'Ratio of skipped sessions (target: 0.8)',
        value: this.sessionMetrics.skipRatio,
      },
      // MemoryStore metrics
      {
        name: 'tburn_memorystore_sessions',
        type: 'gauge',
        help: 'Current number of sessions in MemoryStore',
        value: this.memoryStoreMetrics.currentSessions,
      },
      {
        name: 'tburn_memorystore_max_sessions',
        type: 'gauge',
        help: 'Maximum sessions allowed in MemoryStore',
        value: this.memoryStoreMetrics.maxSessions,
      },
      {
        name: 'tburn_memorystore_capacity_percent',
        type: 'gauge',
        help: 'MemoryStore capacity percentage',
        value: this.memoryStoreMetrics.capacityPercent,
      },
      // Health metrics
      {
        name: 'tburn_event_loop_lag_ms',
        type: 'gauge',
        help: 'Event loop lag in milliseconds',
        value: healthStatus.eventLoopLagMs,
      },
      {
        name: 'tburn_memory_usage_mb',
        type: 'gauge',
        help: 'Memory usage in megabytes',
        value: healthStatus.memoryUsageMb,
      },
      {
        name: 'tburn_memory_limit_mb',
        type: 'gauge',
        help: 'Memory limit in megabytes',
        value: healthStatus.memoryLimitMb,
      },
      {
        name: 'tburn_uptime_seconds',
        type: 'gauge',
        help: 'Server uptime in seconds',
        value: healthStatus.uptime,
      },
      {
        name: 'tburn_error_count_5min',
        type: 'gauge',
        help: 'Number of errors in the last 5 minutes',
        value: healthStatus.errorCount5min,
      },
      {
        name: 'tburn_request_count_5min',
        type: 'gauge',
        help: 'Number of requests in the last 5 minutes',
        value: healthStatus.requestCount5min,
      },
      {
        name: 'tburn_avg_response_time_ms',
        type: 'gauge',
        help: 'Average response time in milliseconds',
        value: healthStatus.avgResponseTimeMs,
      },
      // Alert metrics
      {
        name: 'tburn_active_alerts',
        type: 'gauge',
        help: 'Number of active alerts',
        value: this.getActiveAlerts().length,
      },
      // Redis recommendation
      {
        name: 'tburn_redis_recommended',
        type: 'gauge',
        help: 'Whether Redis is recommended (1=yes, 0=no)',
        value: this.redisRecommended ? 1 : 0,
      },
    ];
    
    // Format as Prometheus text
    return metrics.map(m => {
      const labelStr = m.labels 
        ? `{${Object.entries(m.labels).map(([k, v]) => `${k}="${v}"`).join(',')}}`
        : '';
      return `# HELP ${m.name} ${m.help}\n# TYPE ${m.name} ${m.type}\n${m.name}${labelStr} ${m.value}`;
    }).join('\n\n');
  }
  
  // ============================================================================
  // Routes
  // ============================================================================
  
  getRoutes(): Router {
    const router = Router();
    
    // Dashboard API
    router.get('/dashboard', (req: Request, res: Response) => {
      const healthStatus = healthMonitor.getStatus();
      res.json({
        success: true,
        data: {
          session: {
            skipRatio: this.sessionMetrics.skipRatio,
            skipRatioPercent: (this.sessionMetrics.skipRatio * 100).toFixed(1),
            skipCount: this.sessionMetrics.skipCount,
            createCount: this.sessionMetrics.createCount,
            targetMet: this.sessionMetrics.skipRatio >= 0.8,
          },
          memoryStore: {
            currentSessions: this.memoryStoreMetrics.currentSessions,
            maxSessions: this.memoryStoreMetrics.maxSessions,
            capacityPercent: this.memoryStoreMetrics.capacityPercent.toFixed(1),
            isWarning: this.memoryStoreMetrics.isWarning,
            isCritical: this.memoryStoreMetrics.isCritical,
            estimatedTimeToFullMinutes: this.memoryStoreMetrics.estimatedTimeToFull,
          },
          health: {
            status: healthStatus.status,
            eventLoopLagMs: healthStatus.eventLoopLagMs,
            memoryUsageMb: healthStatus.memoryUsageMb.toFixed(1),
            memoryPercent: ((healthStatus.memoryUsageMb / healthStatus.memoryLimitMb) * 100).toFixed(1),
            errorRate: healthStatus.requestCount5min > 0 
              ? ((healthStatus.errorCount5min / healthStatus.requestCount5min) * 100).toFixed(2)
              : '0.00',
            uptime: Math.floor(healthStatus.uptime),
          },
          alerts: {
            active: this.getActiveAlerts().map(a => ({
              name: a.name,
              severity: a.severity,
              message: a.message,
              triggeredAt: a.lastTriggered,
            })),
            count: this.getActiveAlerts().length,
          },
          redis: this.getRedisRecommendation(),
          timestamp: new Date().toISOString(),
        },
      });
    });
    
    // Session skip ratio history
    router.get('/session/history', (req: Request, res: Response) => {
      const limit = Math.min(parseInt(req.query.limit as string) || 120, 2880);
      res.json({
        success: true,
        data: {
          history: this.sessionMetrics.history.slice(-limit),
          currentRatio: this.sessionMetrics.skipRatio,
          target: 0.8,
        },
      });
    });
    
    // Prometheus metrics endpoint
    router.get('/metrics', (req: Request, res: Response) => {
      res.set('Content-Type', 'text/plain; version=0.0.4');
      res.send(this.getPrometheusMetrics());
    });
    
    // Redis recommendation
    router.get('/redis/recommendation', (req: Request, res: Response) => {
      const recommendation = this.getRedisRecommendation();
      res.json({
        success: true,
        data: {
          ...recommendation,
          currentStore: process.env.REDIS_URL ? 'Redis' : 'MemoryStore',
          memoryStoreCapacity: this.memoryStoreMetrics.capacityPercent.toFixed(1),
          sessionSkipRatio: (this.sessionMetrics.skipRatio * 100).toFixed(1),
          action: recommendation.recommended 
            ? 'Set REDIS_URL environment variable to enable Redis session store'
            : 'MemoryStore is sufficient for current load',
        },
      });
    });
    
    // Force alert check
    router.post('/alerts/check', (req: Request, res: Response) => {
      this.checkAlerts();
      res.json({
        success: true,
        data: {
          activeAlerts: this.getActiveAlerts().length,
          alerts: this.getActiveAlerts().map(a => ({
            name: a.name,
            severity: a.severity,
            message: a.message,
          })),
        },
      });
    });
    
    return router;
  }
}

// Export singleton
export const productionMonitor = EnterpriseProductionMonitor.getInstance();
