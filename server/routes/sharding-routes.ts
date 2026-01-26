/**
 * TBURN Enterprise Sharding API Routes
 * Production-grade sharding system endpoints with v6.0 shard scaling
 */

import { Router, Request, Response } from "express";
import {
  getShardOrchestrator,
  startShardOrchestrator,
  SHARD_CONFIG,
} from "../core/sharding/enterprise-shard-orchestrator";
import { shardBootPipeline } from "../core/sharding/shard-boot-pipeline";
import { memoryGovernor } from "../core/sharding/memory-governor";
import { requestShedder } from "../core/sharding/request-shedder";
import { getRealtimeMetricsService } from "../services/RealtimeMetricsService";

const router = Router();

// Ensure orchestrator is running
let orchestratorStarted = false;
function ensureOrchestrator() {
  if (!orchestratorStarted) {
    startShardOrchestrator();
    orchestratorStarted = true;
  }
  return getShardOrchestrator();
}

// ============================================
// PUBLIC SHARDING ENDPOINTS
// ============================================

// ★ [TPS SYNC] GET /api/sharding - Main endpoint for /admin/shards page
// Uses RealtimeMetricsService.getShardSnapshot() for consistent TPS across all pages
router.get('/', async (_req: Request, res: Response) => {
  try {
    const metricsService = getRealtimeMetricsService();
    let snapshot = metricsService.getShardSnapshot();
    
    // ★ [CRITICAL FIX] 캐시가 비어있으면 강제로 DB에서 로드
    if (snapshot.shards.length === 0) {
      console.log('[Sharding] Cache empty, forcing DB reload...');
      await metricsService.forceReloadFromDB();
      snapshot = metricsService.getShardSnapshot();
      console.log(`[Sharding] After reload: ${snapshot.shards.length} shards, TPS: ${snapshot.stats.totalTps}`);
    }
    
    res.json(snapshot);
  } catch (error) {
    console.error('[Sharding] Error getting shard snapshot:', error);
    res.status(503).json({
      shards: [],
      stats: {
        totalShards: 0,
        totalTps: 0,
        avgLoad: 0,
        totalValidators: 0,
        healthyShards: 0,
        pendingRebalance: 0
      },
      loadHistory: []
    });
  }
});

// GET /api/sharding/status - System status overview
router.get('/status', (_req: Request, res: Response) => {
  try {
    const orchestrator = ensureOrchestrator();
    const status = orchestrator.getSystemStatus();
    
    res.json({
      success: true,
      data: status,
      config: {
        minShards: SHARD_CONFIG.MIN_SHARDS,
        maxShards: SHARD_CONFIG.MAX_SHARDS,
        tpsPerShard: SHARD_CONFIG.TPS_PER_SHARD,
        targetTotalTps: SHARD_CONFIG.TARGET_TOTAL_TPS,
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[Sharding] Error getting system status:', error);
    res.status(503).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// GET /api/sharding/metrics - Global metrics
router.get('/metrics', (_req: Request, res: Response) => {
  try {
    const orchestrator = ensureOrchestrator();
    const metrics = orchestrator.getGlobalMetrics();
    
    res.json({
      success: true,
      data: {
        ...metrics,
        uptime: Date.now() - metrics.uptime,
        formattedUptime: formatUptime(Date.now() - metrics.uptime),
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[Sharding] Error getting global metrics:', error);
    res.status(503).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// GET /api/sharding/shards - All shards summary
router.get('/shards', (_req: Request, res: Response) => {
  try {
    const orchestrator = ensureOrchestrator();
    const shards = orchestrator.getAllShards();
    
    const summary = shards.map(shard => ({
      id: shard.id,
      state: shard.state,
      circuitState: shard.circuitState,
      validatorCount: shard.validators.length,
      metrics: {
        currentTps: shard.metrics.currentTps,
        averageTps: shard.metrics.averageTps,
        utilizationPercent: Math.round(shard.metrics.utilizationPercent),
        queueDepth: shard.metrics.queueDepth,
        latencyP50Ms: Math.round(shard.metrics.latencyP50Ms * 100) / 100,
        latencyP95Ms: Math.round(shard.metrics.latencyP95Ms * 100) / 100,
      },
    }));

    res.json({
      success: true,
      data: {
        count: shards.length,
        shards: summary,
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[Sharding] Error getting all shards:', error);
    res.status(503).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// GET /api/sharding/shards/:id - Single shard details
router.get('/shards/:id', (req: Request, res: Response) => {
  try {
    const orchestrator = ensureOrchestrator();
    const shardId = parseInt(req.params.id);
    
    if (isNaN(shardId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid shard ID',
      });
    }

    const shard = orchestrator.getShard(shardId);
    
    if (!shard) {
      return res.status(404).json({
        success: false,
        error: `Shard ${shardId} not found`,
      });
    }

    res.json({
      success: true,
      data: {
        id: shard.id,
        state: shard.state,
        circuitState: shard.circuitState,
        validators: shard.validators,
        metrics: shard.metrics,
        bufferUtilization: shard.ringBuffer.getUtilization(),
        bufferCapacity: shard.ringBuffer.getCapacity(),
        pendingMessages: {
          critical: shard.priorityQueues.get('CRITICAL')?.length || 0,
          high: shard.priorityQueues.get('HIGH')?.length || 0,
          normal: shard.priorityQueues.get('NORMAL')?.length || 0,
          low: shard.priorityQueues.get('LOW')?.length || 0,
        },
        createdAt: shard.createdAt,
        lastActiveAt: shard.lastActiveAt,
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error(`[Sharding] Error getting shard ${req.params.id} details:`, error);
    res.status(503).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// GET /api/sharding/shards/:id/metrics - Shard metrics
router.get('/shards/:id/metrics', (req: Request, res: Response) => {
  try {
    const orchestrator = ensureOrchestrator();
    const shardId = parseInt(req.params.id);
    
    if (isNaN(shardId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid shard ID',
      });
    }

    const metrics = orchestrator.getShardMetrics(shardId);
    
    if (!metrics) {
      return res.status(404).json({
        success: false,
        error: `Shard ${shardId} not found`,
      });
    }

    res.json({
      success: true,
      data: metrics,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error(`[Sharding] Error getting shard ${req.params.id} metrics:`, error);
    res.status(503).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// GET /api/sharding/scaling-history - Scaling events history
router.get('/scaling-history', (_req: Request, res: Response) => {
  try {
    const orchestrator = ensureOrchestrator();
    const history = orchestrator.getScalingHistory();
    
    res.json({
      success: true,
      data: {
        totalEvents: history.length,
        events: history.map(event => ({
          ...event,
          formattedDate: new Date(event.timestamp).toISOString(),
        })),
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[Sharding] Error getting scaling history:', error);
    res.status(503).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// GET /api/sharding/circuit-breakers - Circuit breaker states
router.get('/circuit-breakers', (_req: Request, res: Response) => {
  try {
    const orchestrator = ensureOrchestrator();
    const states = orchestrator.getCircuitBreakerStatus();
    
    const summary = {
      total: states.size,
      closed: 0,
      open: 0,
      halfOpen: 0,
      shards: [] as { shardId: number; state: string }[],
    };

    for (const [shardId, state] of states) {
      summary.shards.push({ shardId, state });
      if (state === 'CLOSED') summary.closed++;
      else if (state === 'OPEN') summary.open++;
      else summary.halfOpen++;
    }

    res.json({
      success: true,
      data: summary,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[Sharding] Error getting circuit breaker status:', error);
    res.status(503).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// GET /api/sharding/config - Configuration
router.get('/config', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      shard: {
        minShards: SHARD_CONFIG.MIN_SHARDS,
        maxShards: SHARD_CONFIG.MAX_SHARDS,
        defaultShards: SHARD_CONFIG.DEFAULT_SHARDS,
        validatorsPerShard: SHARD_CONFIG.VALIDATORS_PER_SHARD,
        rotationPoolSize: SHARD_CONFIG.ROTATION_POOL_SIZE,
      },
      performance: {
        tpsPerShard: SHARD_CONFIG.TPS_PER_SHARD,
        targetTotalTps: SHARD_CONFIG.TARGET_TOTAL_TPS,
        maxTpsPerShard: SHARD_CONFIG.MAX_TPS_PER_SHARD,
      },
      scaling: {
        scaleUpThreshold: SHARD_CONFIG.SCALE_UP_THRESHOLD,
        scaleDownThreshold: SHARD_CONFIG.SCALE_DOWN_THRESHOLD,
        cooldownMs: SHARD_CONFIG.SCALE_COOLDOWN_MS,
      },
      metrics: {
        intervalMs: SHARD_CONFIG.METRICS_INTERVAL_MS,
        ewmaAlpha: SHARD_CONFIG.EWMA_ALPHA,
      },
      routing: {
        priorityLevels: SHARD_CONFIG.PRIORITY_LEVELS,
        messageTimeoutMs: SHARD_CONFIG.MESSAGE_TIMEOUT_MS,
        retryLimit: SHARD_CONFIG.RETRY_LIMIT,
      },
      buffer: {
        ringBufferSize: SHARD_CONFIG.RING_BUFFER_SIZE,
        batchSizeMin: SHARD_CONFIG.BATCH_SIZE_MIN,
        batchSizeMax: SHARD_CONFIG.BATCH_SIZE_MAX,
      },
      circuitBreaker: {
        failureThreshold: SHARD_CONFIG.FAILURE_THRESHOLD,
        successThreshold: SHARD_CONFIG.SUCCESS_THRESHOLD,
        halfOpenTimeoutMs: SHARD_CONFIG.HALF_OPEN_TIMEOUT_MS,
      },
    },
    timestamp: Date.now(),
  });
});

// GET /api/sharding/health - Health check
router.get('/health', (_req: Request, res: Response) => {
  try {
    const orchestrator = ensureOrchestrator();
    const status = orchestrator.getSystemStatus();
    
    const healthy = status.degradedShards === 0 && status.activeShards === status.shardCount;
    const degraded = status.degradedShards > 0 && status.degradedShards < status.shardCount / 2;
    
    let healthStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    let httpStatus = 200;
    
    if (!healthy && degraded) {
      healthStatus = 'degraded';
      httpStatus = 207;
    } else if (!healthy && !degraded) {
      healthStatus = 'unhealthy';
      httpStatus = 503;
    }

    res.status(httpStatus).json({
      success: true,
      status: healthStatus,
      data: {
        shards: {
          total: status.shardCount,
          active: status.activeShards,
          degraded: status.degradedShards,
        },
        performance: {
          currentTps: status.totalTps,
          targetTps: status.targetTps,
          utilizationPercent: status.utilizationPercent,
        },
        latency: status.latency,
        uptime: status.uptime,
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[Sharding] Error getting health status:', error);
    res.status(503).json({
      success: false,
      status: 'error',
      error: 'Internal server error',
    });
  }
});

// GET /api/sharding/performance - Performance dashboard data
router.get('/performance', (_req: Request, res: Response) => {
  try {
    const orchestrator = ensureOrchestrator();
    const status = orchestrator.getSystemStatus();
    const allMetrics = orchestrator.getAllShardMetrics();
    
    // Calculate aggregate statistics
    const tpsValues = allMetrics.map(m => m.currentTps);
    const utilizationValues = allMetrics.map(m => m.utilizationPercent);
    const latencyP50Values = allMetrics.map(m => m.latencyP50Ms);
    const latencyP95Values = allMetrics.map(m => m.latencyP95Ms);
    const latencyP99Values = allMetrics.map(m => m.latencyP99Ms);
    
    const avgTps = tpsValues.reduce((a, b) => a + b, 0) / tpsValues.length;
    const maxTps = Math.max(...tpsValues);
    const minTps = Math.min(...tpsValues);
    
    const avgUtilization = utilizationValues.reduce((a, b) => a + b, 0) / utilizationValues.length;
    const maxUtilization = Math.max(...utilizationValues);
    
    res.json({
      success: true,
      data: {
        summary: {
          totalTps: status.totalTps,
          targetTps: SHARD_CONFIG.TARGET_TOTAL_TPS,
          achievedPercent: Math.round((status.totalTps / SHARD_CONFIG.TARGET_TOTAL_TPS) * 100),
          shardCount: status.shardCount,
          activeShards: status.activeShards,
        },
        tps: {
          total: status.totalTps,
          average: Math.round(avgTps),
          max: maxTps,
          min: minTps,
          perShard: SHARD_CONFIG.TPS_PER_SHARD,
        },
        utilization: {
          average: Math.round(avgUtilization),
          max: Math.round(maxUtilization),
          scaleUpThreshold: SHARD_CONFIG.SCALE_UP_THRESHOLD * 100,
          scaleDownThreshold: SHARD_CONFIG.SCALE_DOWN_THRESHOLD * 100,
        },
        latency: {
          p50: {
            average: Math.round(latencyP50Values.reduce((a, b) => a + b, 0) / latencyP50Values.length * 100) / 100,
            max: Math.round(Math.max(...latencyP50Values) * 100) / 100,
          },
          p95: {
            average: Math.round(latencyP95Values.reduce((a, b) => a + b, 0) / latencyP95Values.length * 100) / 100,
            max: Math.round(Math.max(...latencyP95Values) * 100) / 100,
          },
          p99: {
            average: Math.round(latencyP99Values.reduce((a, b) => a + b, 0) / latencyP99Values.length * 100) / 100,
            max: Math.round(Math.max(...latencyP99Values) * 100) / 100,
          },
        },
        messages: {
          crossShard: status.crossShardMessages,
          scalingEvents: status.scalingEvents,
        },
        uptime: {
          ms: status.uptime,
          formatted: formatUptime(status.uptime),
        },
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[Sharding] Error getting performance data:', error);
    res.status(503).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// ============================================
// V6.0 SHARD SCALING CORE ENDPOINTS
// ============================================

// GET /api/sharding/v6/prometheus - Prometheus metrics for all v6.0 modules
router.get('/v6/prometheus', (_req: Request, res: Response) => {
  try {
    const pipelineMetrics = shardBootPipeline.toPrometheusMetrics();
    const governorMetrics = memoryGovernor.toPrometheusMetrics();
    const shedderMetrics = requestShedder.toPrometheusMetrics();
    
    const combined = [
      '# TBURN v6.0 Shard Scaling Core Metrics',
      '# Generated at ' + new Date().toISOString(),
      '',
      '# === SHARD BOOT PIPELINE ===',
      pipelineMetrics,
      '',
      '# === MEMORY GOVERNOR ===',
      governorMetrics,
      '',
      '# === REQUEST SHEDDER ===',
      shedderMetrics,
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(combined);
  } catch (error) {
    console.error('[Sharding] Error generating Prometheus metrics:', error);
    res.status(503).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// GET /api/sharding/v6/health - Combined health status of all v6.0 modules
router.get('/v6/health', (_req: Request, res: Response) => {
  try {
    const pipelineHealth = shardBootPipeline.getHealthStatus();
    const governorHealth = memoryGovernor.getHealthStatus();
    const shedderHealth = requestShedder.getHealthStatus();
    
    const overallHealthy = pipelineHealth.healthy && 
                           governorHealth.healthy && 
                           shedderHealth.healthy;
    
    const overallStatus = !overallHealthy 
      ? (governorHealth.status === 'critical' || shedderHealth.status === 'overloaded' 
         ? 'critical' 
         : 'degraded')
      : 'healthy';
    
    res.json({
      success: true,
      data: {
        overall: {
          healthy: overallHealthy,
          status: overallStatus,
        },
        pipeline: pipelineHealth,
        memoryGovernor: governorHealth,
        requestShedder: shedderHealth,
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[Sharding] Error getting v6 health status:', error);
    res.status(503).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// GET /api/sharding/v6/metrics - JSON metrics for all v6.0 modules
router.get('/v6/metrics', (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        pipeline: shardBootPipeline.getMetrics(),
        memoryGovernor: memoryGovernor.getMetrics(),
        requestShedder: requestShedder.getMetrics(),
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[Sharding] Error getting v6 metrics:', error);
    res.status(503).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// GET /api/sharding/v6/pipeline - Shard boot pipeline status
router.get('/v6/pipeline', (_req: Request, res: Response) => {
  try {
    const metrics = shardBootPipeline.getMetrics();
    const health = shardBootPipeline.getHealthStatus();
    const shells = shardBootPipeline.getAllShells();
    
    res.json({
      success: true,
      data: {
        health,
        metrics,
        activeShells: shells.map(s => ({
          id: s.id,
          status: s.status,
          loadProgress: s.loadProgress,
          validatorCount: s.validatorCount,
          memoryFootprintMB: s.memoryFootprintMB,
          healthCheckPassed: s.healthCheckPassed,
          activationDurationMs: s.activationDurationMs,
        })),
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[Sharding] Error getting pipeline status:', error);
    res.status(503).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// GET /api/sharding/v6/memory - Memory governor status
router.get('/v6/memory', (_req: Request, res: Response) => {
  try {
    const metrics = memoryGovernor.getMetrics();
    const health = memoryGovernor.getHealthStatus();
    const snapshot = memoryGovernor.getMemorySnapshot();
    
    res.json({
      success: true,
      data: {
        health,
        metrics,
        snapshot,
        thresholds: {
          warning: 75,
          defer: 85,
          hibernate: 90,
          critical: 95,
        },
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[Sharding] Error getting memory governor status:', error);
    res.status(503).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// GET /api/sharding/v6/shedder - Request shedder status
router.get('/v6/shedder', (_req: Request, res: Response) => {
  try {
    const metrics = requestShedder.getMetrics();
    const health = requestShedder.getHealthStatus();
    
    res.json({
      success: true,
      data: {
        health,
        metrics,
        config: {
          maxEventLoopLagMs: 150,
          degradedModeDurationMs: 60000,
          cachedResponseTtlMs: 30000,
          backpressureThreshold: 100,
        },
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[Sharding] Error getting request shedder status:', error);
    res.status(503).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// POST /api/sharding/v6/pipeline/reset-circuit-breaker - Reset circuit breaker
router.post('/v6/pipeline/reset-circuit-breaker', (_req: Request, res: Response) => {
  try {
    shardBootPipeline.resetCircuitBreaker();
    res.json({
      success: true,
      message: 'Circuit breaker reset successfully',
      newState: shardBootPipeline.getMetrics().circuitBreakerState,
    });
  } catch (error) {
    console.error('[Sharding] Error resetting circuit breaker:', error);
    res.status(503).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// POST /api/sharding/v6/shedder/clear-cache - Clear response cache
router.post('/v6/shedder/clear-cache', (_req: Request, res: Response) => {
  try {
    const cleared = requestShedder.clearCache();
    res.json({
      success: true,
      message: `Cleared ${cleared} cached entries`,
      newCacheSize: requestShedder.getMetrics().cacheSize,
    });
  } catch (error) {
    console.error('[Sharding] Error clearing cache:', error);
    res.status(503).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// POST /api/sharding/v6/shedder/exit-degraded - Force exit degraded mode
router.post('/v6/shedder/exit-degraded', (_req: Request, res: Response) => {
  try {
    requestShedder.forceExitDegradedMode();
    res.json({
      success: true,
      message: 'Degraded mode force-exited',
      isDegradedMode: requestShedder.getMetrics().isDegradedMode,
    });
  } catch (error) {
    console.error('[Sharding] Error exiting degraded mode:', error);
    res.status(503).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Helper function to format uptime
function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

export function registerShardingRoutes(app: any) {
  app.use('/api/sharding', router);
}

export default router;
