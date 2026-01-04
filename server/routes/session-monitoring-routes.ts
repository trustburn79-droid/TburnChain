/**
 * Enterprise Session Monitoring API Routes
 * Phase 16: Production Stability Infrastructure
 */

import { Router, Request, Response } from 'express';
import { sessionMetrics } from '../core/monitoring/session-metrics';
import { resilientStore } from '../core/sessions/resilient-session-store';
import { soakTestOrchestrator } from '../core/testing/soak-test-orchestrator';

const router = Router();

// ============================================================================
// Session Metrics Endpoints
// ============================================================================

// GET /api/internal/telemetry/session/status - Current session metrics status
router.get('/telemetry/session/status', (req: Request, res: Response) => {
  try {
    const status = sessionMetrics.getStatus();
    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// GET /api/internal/telemetry/session/prometheus - Prometheus-style metrics
router.get('/telemetry/session/prometheus', (req: Request, res: Response) => {
  try {
    const metrics = sessionMetrics.getPrometheusMetrics();
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send(metrics);
  } catch (error) {
    res.status(500).send(`# Error: ${(error as Error).message}`);
  }
});

// GET /api/internal/telemetry/session/history - Historical session data
router.get('/telemetry/session/history', (req: Request, res: Response) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const data = sessionMetrics.getHistoricalData(hours);
    res.json({
      success: true,
      data,
      count: data.length,
      hours,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// GET /api/internal/telemetry/session/alerts - Session alerts
router.get('/telemetry/session/alerts', (req: Request, res: Response) => {
  try {
    const activeOnly = req.query.active === 'true';
    const limit = parseInt(req.query.limit as string) || 100;
    
    const alerts = activeOnly 
      ? sessionMetrics.getActiveAlerts()
      : sessionMetrics.getAllAlerts(limit);
    
    res.json({
      success: true,
      data: alerts,
      count: alerts.length,
      activeOnly,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// POST /api/internal/telemetry/session/alerts/:id/acknowledge - Acknowledge alert
router.post('/telemetry/session/alerts/:id/acknowledge', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const acknowledged = sessionMetrics.acknowledgeAlert(id);
    
    res.json({
      success: acknowledged,
      message: acknowledged ? 'Alert acknowledged' : 'Alert not found',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// POST /api/internal/telemetry/session/thresholds - Update alert thresholds
router.post('/telemetry/session/thresholds', (req: Request, res: Response) => {
  try {
    const thresholds = req.body;
    sessionMetrics.updateThresholds(thresholds);
    
    res.json({
      success: true,
      message: 'Thresholds updated',
      thresholds: sessionMetrics.getStatus().thresholds,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// ============================================================================
// Session Store Health Endpoints
// ============================================================================

// GET /api/internal/session-store/health - Session store health
router.get('/session-store/health', async (req: Request, res: Response) => {
  try {
    const health = resilientStore.getHealth();
    
    const statusCode = health.circuitState === 'open' ? 503 : 200;
    
    res.status(statusCode).json({
      success: health.circuitState !== 'open',
      data: health,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// POST /api/internal/session-store/failover - Force failover (for testing)
router.post('/session-store/failover', (req: Request, res: Response) => {
  try {
    resilientStore.forceFailover();
    
    res.json({
      success: true,
      message: 'Failover initiated',
      health: resilientStore.getHealth(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// POST /api/internal/session-store/recover - Force recovery (for testing)
router.post('/session-store/recover', (req: Request, res: Response) => {
  try {
    resilientStore.forceRecovery();
    
    res.json({
      success: true,
      message: 'Recovery initiated',
      health: resilientStore.getHealth(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// ============================================================================
// Soak Test Endpoints
// ============================================================================

// GET /api/soak-tests/status - Current soak test status
router.get('/soak-tests/status', (req: Request, res: Response) => {
  try {
    const status = soakTestOrchestrator.getStatus();
    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// POST /api/soak-tests/run - Start a soak test
router.post('/soak-tests/run', async (req: Request, res: Response) => {
  try {
    const { scenario = 'quick_check', options } = req.body;
    const run = await soakTestOrchestrator.startTest(scenario, options);
    
    res.json({
      success: true,
      message: 'Soak test started',
      data: {
        runId: run.runId,
        scenario: run.scenario.name,
        durationMinutes: run.scenario.durationMinutes,
        status: run.status,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// POST /api/soak-tests/stop - Stop current soak test
router.post('/soak-tests/stop', (req: Request, res: Response) => {
  try {
    soakTestOrchestrator.stopTest();
    
    res.json({
      success: true,
      message: 'Soak test stopped',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// GET /api/soak-tests/:runId - Get specific run details
router.get('/soak-tests/:runId', (req: Request, res: Response) => {
  try {
    const { runId } = req.params;
    const run = soakTestOrchestrator.getRun(runId);
    
    if (!run) {
      return res.status(404).json({
        success: false,
        error: 'Run not found',
      });
    }
    
    res.json({
      success: true,
      data: run,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// GET /api/soak-tests/history - Get test history
router.get('/soak-tests/history', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const history = soakTestOrchestrator.getHistory(limit);
    
    res.json({
      success: true,
      data: history.map(run => ({
        runId: run.runId,
        scenario: run.scenario.name,
        status: run.status,
        startedAt: run.startedAt,
        endedAt: run.endedAt,
        summary: run.summary,
      })),
      count: history.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// ============================================================================
// Memory Telemetry Endpoints
// ============================================================================

// GET /api/internal/telemetry/memory - Memory usage metrics
router.get('/telemetry/memory', (req: Request, res: Response) => {
  try {
    const memory = process.memoryUsage();
    const uptime = process.uptime();
    
    res.json({
      success: true,
      data: {
        heapUsedMb: (memory.heapUsed / 1024 / 1024).toFixed(2),
        heapTotalMb: (memory.heapTotal / 1024 / 1024).toFixed(2),
        externalMb: (memory.external / 1024 / 1024).toFixed(2),
        rssMb: (memory.rss / 1024 / 1024).toFixed(2),
        arrayBuffersMb: (memory.arrayBuffers / 1024 / 1024).toFixed(2),
        uptimeSeconds: uptime.toFixed(0),
        uptimeHours: (uptime / 3600).toFixed(2),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// GET /api/internal/telemetry/memory/prometheus - Memory metrics in Prometheus format
router.get('/telemetry/memory/prometheus', (req: Request, res: Response) => {
  try {
    const memory = process.memoryUsage();
    const uptime = process.uptime();
    
    const lines = [
      '# HELP tburn_memory_heap_used_bytes Heap memory used in bytes',
      '# TYPE tburn_memory_heap_used_bytes gauge',
      `tburn_memory_heap_used_bytes ${memory.heapUsed}`,
      '',
      '# HELP tburn_memory_heap_total_bytes Total heap memory in bytes',
      '# TYPE tburn_memory_heap_total_bytes gauge',
      `tburn_memory_heap_total_bytes ${memory.heapTotal}`,
      '',
      '# HELP tburn_memory_external_bytes External memory in bytes',
      '# TYPE tburn_memory_external_bytes gauge',
      `tburn_memory_external_bytes ${memory.external}`,
      '',
      '# HELP tburn_memory_rss_bytes Resident Set Size in bytes',
      '# TYPE tburn_memory_rss_bytes gauge',
      `tburn_memory_rss_bytes ${memory.rss}`,
      '',
      '# HELP tburn_process_uptime_seconds Process uptime in seconds',
      '# TYPE tburn_process_uptime_seconds counter',
      `tburn_process_uptime_seconds ${uptime}`,
    ];
    
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send(lines.join('\n'));
  } catch (error) {
    res.status(500).send(`# Error: ${(error as Error).message}`);
  }
});

export default router;
