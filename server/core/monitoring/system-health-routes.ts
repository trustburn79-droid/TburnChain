/**
 * System Health Monitoring API Routes
 * 
 * Unified API endpoints for comprehensive system monitoring:
 * - /api/system-health/status - Overall health status
 * - /api/system-health/metrics - Current system metrics
 * - /api/system-health/metrics/history - Historical metrics
 * - /api/system-health/alerts - Active and historical alerts
 * - /api/system-health/channels - Alert channel configuration
 */

import { Router, Request, Response } from 'express';
import { systemHealthMonitor } from './enterprise-system-health';
import { alertingService } from './enterprise-alerting';

const router = Router();

router.get('/status', (_req: Request, res: Response) => {
  try {
    const healthCheck = systemHealthMonitor.getHealthCheck();
    const alertStats = alertingService.getAlertStats();
    
    const statusCode = 
      healthCheck.status === 'critical' ? 503 :
      healthCheck.status === 'unhealthy' ? 500 :
      healthCheck.status === 'degraded' ? 200 : 200;
    
    res.status(statusCode).json({
      success: true,
      data: {
        status: healthCheck.status,
        score: healthCheck.score,
        checks: healthCheck.checks,
        activeAlerts: healthCheck.alerts.length,
        recommendations: healthCheck.recommendations,
        alertStats: {
          lastHour: alertStats.lastHour,
          last24Hours: alertStats.last24Hours,
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get health status',
    });
  }
});

router.get('/metrics', (_req: Request, res: Response) => {
  try {
    const metrics = systemHealthMonitor.getMetrics();
    
    if (!metrics) {
      return res.status(503).json({
        success: false,
        error: 'Metrics not yet available',
      });
    }
    
    res.json({
      success: true,
      data: {
        timestamp: metrics.timestamp,
        cpu: {
          usage: metrics.cpu.usagePercent,
          loadAverage: {
            '1m': metrics.cpu.loadAverage1m,
            '5m': metrics.cpu.loadAverage5m,
            '15m': metrics.cpu.loadAverage15m,
          },
          status: metrics.cpu.status,
        },
        memory: {
          total: metrics.memory.totalMB,
          used: metrics.memory.usedMB,
          free: metrics.memory.freeMB,
          usage: metrics.memory.usagePercent,
          heap: {
            used: metrics.memory.heapUsedMB,
            total: metrics.memory.heapTotalMB,
            usage: metrics.memory.heapUsagePercent,
          },
          status: metrics.memory.status,
        },
        disk: {
          total: metrics.disk.totalGB,
          used: metrics.disk.usedGB,
          free: metrics.disk.freeGB,
          usage: metrics.disk.usagePercent,
          status: metrics.disk.status,
        },
        process: {
          pid: metrics.process.pid,
          uptime: metrics.process.uptime,
          eventLoopLag: metrics.process.eventLoopLagMs,
          activeHandles: metrics.process.activeHandles,
          nodeVersion: metrics.process.nodeVersion,
          status: metrics.process.status,
        },
        http: {
          totalRequests: metrics.http.totalRequests,
          successCount: metrics.http.successCount,
          errorCount: metrics.http.errorCount,
          errorRate: metrics.http.errorRate,
          responseTime: {
            avg: metrics.http.avgResponseTimeMs,
            p95: metrics.http.p95ResponseTimeMs,
            p99: metrics.http.p99ResponseTimeMs,
          },
          requestsPerSecond: metrics.http.requestsPerSecond,
          status: metrics.http.status,
        },
        database: {
          pool: {
            size: metrics.database.poolSize,
            active: metrics.database.activeConnections,
            idle: metrics.database.idleConnections,
            waiting: metrics.database.waitingRequests,
            usage: metrics.database.poolUsagePercent,
          },
          avgQueryTime: metrics.database.avgQueryTimeMs,
          slowQueries: metrics.database.slowQueryCount,
          status: metrics.database.status,
        },
        session: {
          skipRatio: metrics.session.skipRatio,
          memoryStoreCapacity: metrics.session.memoryStoreCapacity,
          activeSessions: metrics.session.activeSessions,
          status: metrics.session.status,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get metrics',
    });
  }
});

router.get('/metrics/history', (req: Request, res: Response) => {
  try {
    const minutes = parseInt(req.query.minutes as string) || 60;
    const history = systemHealthMonitor.getMetricsHistory(Math.min(minutes, 360));
    
    const summary = history.map(m => ({
      timestamp: m.timestamp,
      cpu: m.cpu.usagePercent,
      memory: m.memory.usagePercent,
      heap: m.memory.heapUsagePercent,
      disk: m.disk.usagePercent,
      eventLoopLag: m.process.eventLoopLagMs,
      responseTimeP95: m.http.p95ResponseTimeMs,
      errorRate: m.http.errorRate,
      sessionSkipRatio: m.session.skipRatio,
      sessionCapacity: m.session.memoryStoreCapacity,
    }));
    
    res.json({
      success: true,
      data: {
        period: `${minutes} minutes`,
        dataPoints: summary.length,
        history: summary,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get metrics history',
    });
  }
});

router.get('/alerts', (req: Request, res: Response) => {
  try {
    const activeAlerts = systemHealthMonitor.getActiveAlerts();
    const limit = parseInt(req.query.limit as string) || 50;
    const alertHistory = alertingService.getAlertHistory(limit);
    const stats = alertingService.getAlertStats();
    
    res.json({
      success: true,
      data: {
        active: activeAlerts,
        activeCount: activeAlerts.length,
        history: alertHistory,
        stats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get alerts',
    });
  }
});

router.get('/channels', (_req: Request, res: Response) => {
  try {
    const channels = alertingService.getChannels();
    const rules = alertingService.getRules();
    
    res.json({
      success: true,
      data: {
        channels: channels.map(c => ({
          id: c.id,
          name: c.name,
          type: c.type,
          enabled: c.enabled,
          minSeverity: c.config.minSeverity,
        })),
        rules: rules.map(r => ({
          id: r.id,
          name: r.name,
          severity: r.severity,
          enabled: r.enabled,
          cooldownMinutes: r.cooldownMinutes,
        })),
        alertingEnabled: alertingService.isActive(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get channels',
    });
  }
});

router.get('/self-healing', (_req: Request, res: Response) => {
  try {
    const history = systemHealthMonitor.getSelfHealingHistory();
    
    res.json({
      success: true,
      data: {
        enabled: true,
        actions: history,
        totalActions: history.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get self-healing history',
    });
  }
});

router.get('/thresholds', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      cpu: { normal: '≤40%', warning: '40-70%', critical: '>70%' },
      memory: { normal: '≤65%', warning: '65-80%', critical: '>80%' },
      heap: { normal: '≤70%', warning: '70-85%', critical: '>85%' },
      disk: { normal: '≤70%', warning: '70-85%', critical: '>85%' },
      eventLoopLag: { normal: '≤50ms', warning: '50-100ms', critical: '>100ms' },
      responseTime: { normal: '≤200ms', warning: '200-500ms', critical: '>500ms' },
      errorRate: { normal: '≤0.1%', warning: '0.1-1%', critical: '>1%' },
      dbPool: { normal: '≤70%', warning: '70-85%', critical: '>85%' },
      sessionSkipRatio: { normal: '≥80%', warning: '60-80%', critical: '<60%' },
      sessionCapacity: { normal: '≤60%', warning: '60-80%', critical: '>80%' },
    },
  });
});

router.get('/prometheus', (_req: Request, res: Response) => {
  try {
    const metrics = systemHealthMonitor.getMetrics();
    
    if (!metrics) {
      return res.status(503).send('# Metrics not yet available\n');
    }
    
    const lines: string[] = [
      '# HELP tburn_cpu_usage_percent CPU usage percentage',
      '# TYPE tburn_cpu_usage_percent gauge',
      `tburn_cpu_usage_percent ${metrics.cpu.usagePercent}`,
      '',
      '# HELP tburn_memory_usage_percent Memory usage percentage',
      '# TYPE tburn_memory_usage_percent gauge',
      `tburn_memory_usage_percent ${metrics.memory.usagePercent}`,
      '',
      '# HELP tburn_heap_usage_percent Heap usage percentage',
      '# TYPE tburn_heap_usage_percent gauge',
      `tburn_heap_usage_percent ${metrics.memory.heapUsagePercent}`,
      '',
      '# HELP tburn_disk_usage_percent Disk usage percentage',
      '# TYPE tburn_disk_usage_percent gauge',
      `tburn_disk_usage_percent ${metrics.disk.usagePercent}`,
      '',
      '# HELP tburn_event_loop_lag_ms Event loop lag in milliseconds',
      '# TYPE tburn_event_loop_lag_ms gauge',
      `tburn_event_loop_lag_ms ${metrics.process.eventLoopLagMs}`,
      '',
      '# HELP tburn_http_requests_total Total HTTP requests',
      '# TYPE tburn_http_requests_total counter',
      `tburn_http_requests_total ${metrics.http.totalRequests}`,
      '',
      '# HELP tburn_http_errors_total Total HTTP 5xx errors',
      '# TYPE tburn_http_errors_total counter',
      `tburn_http_errors_total ${metrics.http.error5xxCount}`,
      '',
      '# HELP tburn_http_error_rate_percent HTTP error rate percentage',
      '# TYPE tburn_http_error_rate_percent gauge',
      `tburn_http_error_rate_percent ${metrics.http.errorRate}`,
      '',
      '# HELP tburn_http_response_time_p95_ms P95 response time in milliseconds',
      '# TYPE tburn_http_response_time_p95_ms gauge',
      `tburn_http_response_time_p95_ms ${metrics.http.p95ResponseTimeMs}`,
      '',
      '# HELP tburn_session_skip_ratio_percent Session skip ratio percentage',
      '# TYPE tburn_session_skip_ratio_percent gauge',
      `tburn_session_skip_ratio_percent ${metrics.session.skipRatio}`,
      '',
      '# HELP tburn_session_capacity_percent Session MemoryStore capacity percentage',
      '# TYPE tburn_session_capacity_percent gauge',
      `tburn_session_capacity_percent ${metrics.session.memoryStoreCapacity}`,
      '',
      '# HELP tburn_active_sessions Active session count',
      '# TYPE tburn_active_sessions gauge',
      `tburn_active_sessions ${metrics.session.activeSessions}`,
      '',
      '# HELP tburn_process_uptime_seconds Process uptime in seconds',
      '# TYPE tburn_process_uptime_seconds counter',
      `tburn_process_uptime_seconds ${Math.round(metrics.process.uptime)}`,
      '',
    ];
    
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send(lines.join('\n'));
  } catch (error) {
    res.status(500).send('# Failed to generate metrics\n');
  }
});

export const systemHealthRoutes = router;
