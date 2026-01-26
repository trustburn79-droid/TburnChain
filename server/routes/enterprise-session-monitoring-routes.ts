/**
 * Enterprise Session Monitoring API Routes v2.0
 * Phase 16: Production-Grade Observability Infrastructure
 * 
 * Features:
 * - Enhanced telemetry with granular endpoint metrics
 * - Advanced alerting with policy management
 * - Enterprise soak testing with baselines
 * - SLA reporting and compliance
 * - Webhook configuration for notifications
 */

import { Router, Request, Response } from 'express';
import { enterpriseSessionMetrics } from '../core/monitoring/enterprise-session-metrics';
import { enterpriseSoakTest } from '../core/testing/enterprise-soak-test-orchestrator';
import { resilientStore } from '../core/sessions/resilient-session-store';

const router = Router();

// ============================================================================
// Enterprise Session Metrics Endpoints
// ============================================================================

router.get('/telemetry/session/enterprise/status', (req: Request, res: Response) => {
  try {
    const status = enterpriseSessionMetrics.getStatus();
    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

router.get('/telemetry/session/enterprise/prometheus', (req: Request, res: Response) => {
  try {
    const metrics = enterpriseSessionMetrics.getPrometheusMetrics();
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send(metrics);
  } catch (error) {
    res.status(503).send(`# Error: ${(error as Error).message}`);
  }
});

router.get('/telemetry/session/enterprise/history', (req: Request, res: Response) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const data = enterpriseSessionMetrics.getHistoricalData(hours);
    res.json({
      success: true,
      data,
      count: data.length,
      hours,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

router.get('/telemetry/session/enterprise/hourly', (req: Request, res: Response) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const data = enterpriseSessionMetrics.getHourlyAggregates(hours);
    res.json({
      success: true,
      data,
      count: data.length,
      hours,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

router.get('/telemetry/session/enterprise/security', (req: Request, res: Response) => {
  try {
    const metrics = enterpriseSessionMetrics.getSecurityMetrics();
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// ============================================================================
// Enterprise Alert Management
// ============================================================================

router.get('/telemetry/session/enterprise/alerts', (req: Request, res: Response) => {
  try {
    const activeOnly = req.query.active === 'true';
    const limit = parseInt(req.query.limit as string) || 100;
    
    const alerts = activeOnly 
      ? enterpriseSessionMetrics.getActiveAlerts()
      : enterpriseSessionMetrics.getAllAlerts(limit);
    
    res.json({
      success: true,
      data: alerts,
      count: alerts.length,
      activeOnly,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

router.post('/telemetry/session/enterprise/alerts/:id/acknowledge', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { acknowledgedBy } = req.body;
    
    const acknowledged = enterpriseSessionMetrics.acknowledgeAlert(id, acknowledgedBy || 'system');
    
    res.json({
      success: acknowledged,
      message: acknowledged ? 'Alert acknowledged' : 'Alert not found or not firing',
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// ============================================================================
// Alert Policy Management
// ============================================================================

router.get('/telemetry/session/enterprise/policies', (req: Request, res: Response) => {
  try {
    const policies = enterpriseSessionMetrics.getAlertPolicies();
    res.json({
      success: true,
      data: policies,
      count: policies.length,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

router.post('/telemetry/session/enterprise/policies', (req: Request, res: Response) => {
  try {
    const policy = req.body;
    
    if (!policy.id || !policy.name || !policy.metricType || policy.threshold === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: id, name, metricType, threshold',
      });
    }
    
    enterpriseSessionMetrics.addAlertPolicy({
      id: policy.id,
      name: policy.name,
      metricType: policy.metricType,
      operator: policy.operator || 'gt',
      threshold: policy.threshold,
      severity: policy.severity || 'warning',
      evaluationPeriodMinutes: policy.evaluationPeriodMinutes || 5,
      consecutiveBreaches: policy.consecutiveBreaches || 1,
      suppressionWindowMinutes: policy.suppressionWindowMinutes || 60,
      webhookUrl: policy.webhookUrl,
      enabled: policy.enabled !== false,
    });
    
    res.json({
      success: true,
      message: 'Policy created',
      policy,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

router.patch('/telemetry/session/enterprise/policies/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updated = enterpriseSessionMetrics.updateAlertPolicy(id, updates);
    
    res.json({
      success: updated,
      message: updated ? 'Policy updated' : 'Policy not found',
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

router.delete('/telemetry/session/enterprise/policies/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = enterpriseSessionMetrics.deleteAlertPolicy(id);
    
    res.json({
      success: deleted,
      message: deleted ? 'Policy deleted' : 'Policy not found',
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// ============================================================================
// Enterprise Soak Testing
// ============================================================================

router.get('/enterprise/status', (req: Request, res: Response) => {
  try {
    const status = enterpriseSoakTest.getStatus();
    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

router.post('/enterprise/run', async (req: Request, res: Response) => {
  try {
    const { scenario = 'quick_check', options } = req.body;
    const run = await enterpriseSoakTest.startTest(scenario, options);
    
    res.json({
      success: true,
      message: 'Enterprise soak test started',
      data: {
        runId: run.runId,
        scenario: run.scenario.name,
        type: run.scenario.type,
        durationMinutes: run.scenario.durationMinutes,
        status: run.status,
        baselineId: run.baselineId,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

router.post('/enterprise/stop', (req: Request, res: Response) => {
  try {
    enterpriseSoakTest.stopTest();
    
    res.json({
      success: true,
      message: 'Soak test stopped',
      status: enterpriseSoakTest.getStatus(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

router.get('/enterprise/run/:runId', (req: Request, res: Response) => {
  try {
    const { runId } = req.params;
    const run = enterpriseSoakTest.getRun(runId);
    
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
    res.status(503).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

router.get('/enterprise/history', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const history = enterpriseSoakTest.getHistory(limit);
    
    res.json({
      success: true,
      data: history.map(run => ({
        runId: run.runId,
        scenario: run.scenario.name,
        type: run.scenario.type,
        status: run.status,
        startedAt: run.startedAt,
        endedAt: run.endedAt,
        summary: run.summary ? {
          totalRequests: run.summary.totalRequests,
          successRate: run.summary.successRate,
          p99LatencyMs: run.summary.p99LatencyMs,
          slaViolations: run.summary.slaViolations.length,
          regressions: run.summary.regressions.length,
        } : null,
        hasBaseline: !!run.baselineId,
        regressionStatus: run.regressionReport?.overallStatus,
      })),
      count: history.length,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

router.get('/enterprise/anomalies', (req: Request, res: Response) => {
  try {
    const anomalies = enterpriseSoakTest.getAnomalies();
    res.json({
      success: true,
      data: anomalies,
      count: anomalies.length,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// ============================================================================
// Baseline Management
// ============================================================================

router.get('/enterprise/baselines', (req: Request, res: Response) => {
  try {
    const baselines = enterpriseSoakTest.getAllBaselines();
    res.json({
      success: true,
      data: baselines,
      count: baselines.length,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

router.post('/enterprise/baselines', (req: Request, res: Response) => {
  try {
    const { name, runId } = req.body;
    
    if (!name || !runId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, runId',
      });
    }
    
    const baseline = enterpriseSoakTest.createBaseline(name, runId);
    
    if (!baseline) {
      return res.status(400).json({
        success: false,
        error: 'Failed to create baseline. Run not found or incomplete.',
      });
    }
    
    res.json({
      success: true,
      message: 'Baseline created',
      data: baseline,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

router.patch('/enterprise/baselines/:id/tolerances', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tolerances = req.body;
    
    const updated = enterpriseSoakTest.updateBaselineTolerances(id, tolerances);
    
    res.json({
      success: updated,
      message: updated ? 'Tolerances updated' : 'Baseline not found',
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// ============================================================================
// SLA Reporting
// ============================================================================

router.get('/enterprise/sla-report', (req: Request, res: Response) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const history = enterpriseSoakTest.getHistory(100);
    
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    const recentRuns = history.filter(r => r.startedAt >= cutoff);
    
    const totalRuns = recentRuns.length;
    const passedRuns = recentRuns.filter(r => r.status === 'completed' && (!r.regressionReport || r.regressionReport.overallStatus === 'pass')).length;
    const failedRuns = recentRuns.filter(r => r.status === 'failed' || (r.regressionReport && r.regressionReport.overallStatus === 'fail')).length;
    const warningRuns = totalRuns - passedRuns - failedRuns;
    
    const allViolations = recentRuns
      .filter(r => r.summary)
      .flatMap(r => r.summary!.slaViolations);
    
    const violationCounts: Record<string, number> = {};
    allViolations.forEach(v => {
      const key = v.split(':')[0];
      violationCounts[key] = (violationCounts[key] || 0) + 1;
    });
    
    res.json({
      success: true,
      data: {
        period: {
          hours,
          from: cutoff.toISOString(),
          to: new Date().toISOString(),
        },
        summary: {
          totalRuns,
          passedRuns,
          failedRuns,
          warningRuns,
          passRate: totalRuns > 0 ? (passedRuns / totalRuns * 100).toFixed(2) + '%' : 'N/A',
        },
        slaViolations: {
          total: allViolations.length,
          byType: violationCounts,
        },
        recentFailures: recentRuns
          .filter(r => r.status === 'failed')
          .map(r => ({
            runId: r.runId,
            scenario: r.scenario.name,
            startedAt: r.startedAt,
            issues: r.issues,
          })),
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// ============================================================================
// SLA Synchronization (Phase 17)
// ============================================================================

router.get('/enterprise/sla-sync/status', (req: Request, res: Response) => {
  try {
    const status = enterpriseSoakTest.getSLASyncStatus();
    
    res.json({
      success: true,
      data: {
        scenarios: status,
        summary: {
          totalScenarios: status.length,
          readyToSync: status.filter(s => s.canSync).length,
          needsMoreRuns: status.filter(s => !s.canSync).length,
        },
        recommendations: status.filter(s => !s.canSync).map(s => 
          `${s.scenario}: Need ${3 - s.runsAvailable} more completed runs for SLA calibration`
        ),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

router.post('/enterprise/sla-sync/:scenario', (req: Request, res: Response) => {
  try {
    const { scenario } = req.params;
    
    const result = enterpriseSoakTest.syncSLATargets(scenario);
    
    if (!result.updated) {
      res.status(400).json({
        success: false,
        message: 'Cannot sync SLA targets',
        recommendations: result.recommendations,
      });
      return;
    }
    
    res.json({
      success: true,
      data: {
        scenario: result.scenario,
        oldTargets: result.oldTargets,
        newTargets: result.newTargets,
        recommendations: result.recommendations,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

router.post('/enterprise/sla-sync/all', (req: Request, res: Response) => {
  try {
    const status = enterpriseSoakTest.getSLASyncStatus();
    const syncable = status.filter(s => s.canSync);
    
    if (syncable.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No scenarios ready for SLA sync. Run at least 3 tests per scenario first.',
        status,
      });
      return;
    }
    
    const results = syncable.map(s => ({
      scenario: s.scenario,
      result: enterpriseSoakTest.syncSLATargets(s.scenario),
    }));
    
    res.json({
      success: true,
      data: {
        synced: results.length,
        results: results.map(r => ({
          scenario: r.scenario,
          updated: r.result.updated,
          newTargets: r.result.newTargets,
          recommendations: r.result.recommendations,
        })),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// ============================================================================
// Baseline Test Scheduler (Phase 17)
// ============================================================================

router.get('/enterprise/scheduler/status', (req: Request, res: Response) => {
  try {
    const status = enterpriseSoakTest.getSchedulerStatus();
    
    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

router.post('/enterprise/scheduler/start', (req: Request, res: Response) => {
  try {
    const { intervalHours, scenario } = req.body;
    
    const result = enterpriseSoakTest.startScheduler({
      intervalHours: intervalHours ? parseInt(intervalHours) : undefined,
      scenario,
    });
    
    res.json({
      success: result.started,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

router.post('/enterprise/scheduler/stop', (req: Request, res: Response) => {
  try {
    const result = enterpriseSoakTest.stopScheduler();
    
    res.json({
      success: result.stopped,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

router.post('/enterprise/scheduler/trigger', async (req: Request, res: Response) => {
  try {
    const { scenario } = req.body;
    
    const result = await enterpriseSoakTest.triggerBaselineRun(scenario);
    
    res.json({
      success: result.triggered,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// ============================================================================
// Resilient Store Enhanced Endpoints
// ============================================================================

router.get('/session-store/enterprise/health', async (req: Request, res: Response) => {
  try {
    const health = resilientStore.getHealth();
    
    const statusCode = health.circuitState === 'open' ? 503 : 200;
    
    res.status(statusCode).json({
      success: health.circuitState !== 'open',
      data: {
        ...health,
        recommendation: health.fallbackActive 
          ? 'System operating in degraded mode. Consider investigating Redis connection.'
          : 'All systems nominal.',
        metrics: {
          memoryUsagePercent: ((health.memorySessionCount / health.memoryMaxSessions) * 100).toFixed(2),
          circuitHealth: health.circuitState === 'closed' ? 'healthy' : 
                         health.circuitState === 'half-open' ? 'recovering' : 'degraded',
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

router.post('/session-store/enterprise/failover', (req: Request, res: Response) => {
  try {
    resilientStore.forceFailover();
    
    res.json({
      success: true,
      message: 'Failover initiated',
      health: resilientStore.getHealth(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

router.post('/session-store/enterprise/recover', (req: Request, res: Response) => {
  try {
    resilientStore.forceRecovery();
    
    res.json({
      success: true,
      message: 'Recovery initiated',
      health: resilientStore.getHealth(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// ============================================================================
// Combined Dashboard Data
// ============================================================================

router.get('/dashboard/enterprise/session-overview', async (req: Request, res: Response) => {
  try {
    const metricsStatus = enterpriseSessionMetrics.getStatus();
    const storeHealth = resilientStore.getHealth();
    const soakStatus = enterpriseSoakTest.getStatus();
    
    res.json({
      success: true,
      data: {
        metrics: {
          isRunning: metricsStatus.isRunning,
          currentSnapshot: metricsStatus.currentSnapshot,
          alerts: metricsStatus.alerts,
          policies: metricsStatus.policies,
        },
        store: {
          primaryStore: storeHealth.primaryStore,
          fallbackActive: storeHealth.fallbackActive,
          circuitState: storeHealth.circuitState,
          redisConnected: storeHealth.redisConnected,
        },
        soakTesting: {
          isRunning: soakStatus.isRunning,
          currentRun: soakStatus.currentRun ? {
            runId: soakStatus.currentRun.runId,
            scenario: soakStatus.currentRun.scenario.name,
            status: soakStatus.currentRun.status,
          } : null,
          activeBaselines: soakStatus.activeBaselines,
          anomaliesDetected: soakStatus.anomaliesDetected,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

export default router;
