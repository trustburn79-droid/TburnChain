/**
 * Enterprise Shard Rebalancer API Routes
 * TBURN Blockchain Mainnet - Phase 15
 * 
 * RESTful API endpoints for shard rebalancing operations
 */

import { Router, Request, Response } from 'express';
import {
  EnterpriseShardRebalancer,
  createEnterpriseShardRebalancer,
  REBALANCER_CONFIG,
  type ShardLoadMetrics,
} from '../core/sharding/enterprise-shard-rebalancer';
import { EnterpriseShardOrchestrator } from '../core/sharding/enterprise-shard-orchestrator';

const router = Router();

// ============================================================================
// Instances
// ============================================================================

let rebalancerInstance: EnterpriseShardRebalancer | null = null;
let orchestratorInstance: EnterpriseShardOrchestrator | null = null;

function getOrchestrator(): EnterpriseShardOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new EnterpriseShardOrchestrator();
  }
  return orchestratorInstance;
}

function getRebalancer(): EnterpriseShardRebalancer {
  if (!rebalancerInstance) {
    const orchestrator = getOrchestrator();
    
    const metricsProvider = (): ShardLoadMetrics[] => {
      const shards = orchestrator.getAllShards();
      return shards.map(shard => ({
        shardId: shard.id,
        state: shard.state,
        circuitState: shard.circuitState,
        currentTps: shard.metrics.currentTps,
        averageTps: shard.metrics.averageTps,
        peakTps: shard.metrics.peakTps,
        utilizationPercent: shard.metrics.utilizationPercent,
        queueDepth: shard.metrics.queueDepth,
        pendingMessages: shard.metrics.pendingMessages,
        latencyP50Ms: shard.metrics.latencyP50Ms,
        latencyP95Ms: shard.metrics.latencyP95Ms,
        latencyP99Ms: shard.metrics.latencyP99Ms,
        validatorCount: shard.validators.length,
      }));
    };
    
    rebalancerInstance = createEnterpriseShardRebalancer(metricsProvider);
    
    rebalancerInstance.on('rebalance:completed', (data) => {
      console.log(`[ShardRebalancer] Rebalance completed: ${data.successCount}/${data.decisions.length} decisions in ${data.duration}ms`);
    });
    
    rebalancerInstance.on('migration:planned', (plan) => {
      console.log(`[ShardRebalancer] Migration planned: shard ${plan.sourceShardId} -> ${plan.targetShardId}`);
    });
    
    rebalancerInstance.on('scale:up', (data) => {
      console.log(`[ShardRebalancer] Scale-up triggered: ${data.reason}`);
    });
    
    rebalancerInstance.on('scale:down', (data) => {
      console.log(`[ShardRebalancer] Scale-down triggered: ${data.reason}`);
    });
  }
  return rebalancerInstance;
}

// ============================================================================
// Helper Functions
// ============================================================================

function validateAdminAuth(req: Request): boolean {
  const adminPassword = req.headers['x-admin-password'] as string;
  return adminPassword === process.env.ADMIN_PASSWORD;
}

function sendSuccess(res: Response, data: any): void {
  res.json({ success: true, data });
}

function sendError(res: Response, message: string, status: number = 500): void {
  res.status(status).json({ success: false, error: message });
}

// ============================================================================
// GET Endpoints (Public)
// ============================================================================

router.get('/status', (_req: Request, res: Response) => {
  try {
    const rebalancer = getRebalancer();
    const stats = rebalancer.getStats();
    
    sendSuccess(res, {
      state: stats.state,
      uptimeMs: stats.uptimeMs,
      currentImbalanceRatio: stats.currentImbalanceRatio.toFixed(3),
      hotShards: stats.hotShards,
      coldShards: stats.coldShards,
      warmShards: stats.warmShards,
      pendingDecisions: stats.pendingDecisions,
    });
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : 'Unknown error');
  }
});

router.get('/stats', (_req: Request, res: Response) => {
  try {
    const rebalancer = getRebalancer();
    sendSuccess(res, rebalancer.getStats());
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : 'Unknown error');
  }
});

router.get('/health', (_req: Request, res: Response) => {
  try {
    const rebalancer = getRebalancer();
    const stats = rebalancer.getStats();
    
    const isHealthy = stats.state !== 'IDLE' && 
                      stats.currentImbalanceRatio < REBALANCER_CONFIG.THRESHOLDS.IMBALANCE_RATIO * 1.5;
    
    sendSuccess(res, {
      healthy: isHealthy,
      state: stats.state,
      imbalanceRatio: stats.currentImbalanceRatio.toFixed(3),
      rebalanceSuccess: stats.totalRebalances > 0 
        ? ((stats.successfulRebalances / stats.totalRebalances) * 100).toFixed(2) + '%'
        : 'N/A',
      lastRebalanceAt: stats.lastRebalanceAt || null,
    });
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : 'Unknown error');
  }
});

router.get('/snapshots', (_req: Request, res: Response) => {
  try {
    const rebalancer = getRebalancer();
    const snapshots = rebalancer.getCurrentSnapshots();
    
    const summary = {
      count: snapshots.length,
      temperatures: {
        hot: snapshots.filter(s => s.temperature === 'HOT').length,
        warm: snapshots.filter(s => s.temperature === 'WARM').length,
        cool: snapshots.filter(s => s.temperature === 'COOL').length,
        cold: snapshots.filter(s => s.temperature === 'COLD').length,
      },
      avgUtilization: snapshots.length > 0
        ? (snapshots.reduce((sum, s) => sum + s.utilization, 0) / snapshots.length).toFixed(3)
        : 0,
      avgTps: snapshots.length > 0
        ? Math.round(snapshots.reduce((sum, s) => sum + s.tps, 0) / snapshots.length)
        : 0,
    };
    
    sendSuccess(res, { summary, snapshots });
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : 'Unknown error');
  }
});

router.get('/decisions', (_req: Request, res: Response) => {
  try {
    const rebalancer = getRebalancer();
    
    sendSuccess(res, {
      pending: rebalancer.getPendingDecisions(),
      history: rebalancer.getDecisionHistory().slice(-50),
    });
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : 'Unknown error');
  }
});

router.get('/migrations', (_req: Request, res: Response) => {
  try {
    const rebalancer = getRebalancer();
    
    sendSuccess(res, {
      active: rebalancer.getActiveMigrations(),
    });
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : 'Unknown error');
  }
});

router.get('/thresholds', (_req: Request, res: Response) => {
  try {
    const rebalancer = getRebalancer();
    sendSuccess(res, rebalancer.getThresholds());
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : 'Unknown error');
  }
});

router.get('/config', (_req: Request, res: Response) => {
  try {
    sendSuccess(res, {
      thresholds: REBALANCER_CONFIG.THRESHOLDS,
      hysteresis: REBALANCER_CONFIG.HYSTERESIS,
      ewma: REBALANCER_CONFIG.EWMA,
      rebalance: REBALANCER_CONFIG.REBALANCE,
      weights: REBALANCER_CONFIG.WEIGHTS,
    });
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : 'Unknown error');
  }
});

// ============================================================================
// POST Endpoints (Admin Only)
// ============================================================================

router.post('/start', async (req: Request, res: Response) => {
  try {
    if (!validateAdminAuth(req)) {
      return sendError(res, 'Unauthorized', 401);
    }
    
    const rebalancer = getRebalancer();
    await rebalancer.start();
    
    sendSuccess(res, {
      message: 'Rebalancer started',
      state: rebalancer.getState(),
    });
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : 'Unknown error');
  }
});

router.post('/stop', async (req: Request, res: Response) => {
  try {
    if (!validateAdminAuth(req)) {
      return sendError(res, 'Unauthorized', 401);
    }
    
    const rebalancer = getRebalancer();
    await rebalancer.stop();
    
    sendSuccess(res, {
      message: 'Rebalancer stopped',
      state: rebalancer.getState(),
    });
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : 'Unknown error');
  }
});

router.post('/pause', (req: Request, res: Response) => {
  try {
    if (!validateAdminAuth(req)) {
      return sendError(res, 'Unauthorized', 401);
    }
    
    const rebalancer = getRebalancer();
    rebalancer.pause();
    
    sendSuccess(res, {
      message: 'Rebalancer paused',
      state: rebalancer.getState(),
    });
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : 'Unknown error');
  }
});

router.post('/resume', (req: Request, res: Response) => {
  try {
    if (!validateAdminAuth(req)) {
      return sendError(res, 'Unauthorized', 401);
    }
    
    const rebalancer = getRebalancer();
    rebalancer.resume();
    
    sendSuccess(res, {
      message: 'Rebalancer resumed',
      state: rebalancer.getState(),
    });
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : 'Unknown error');
  }
});

router.post('/force-rebalance', (req: Request, res: Response) => {
  try {
    if (!validateAdminAuth(req)) {
      return sendError(res, 'Unauthorized', 401);
    }
    
    const rebalancer = getRebalancer();
    rebalancer.forceRebalance();
    
    sendSuccess(res, {
      message: 'Forced rebalance triggered',
      state: rebalancer.getState(),
    });
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : 'Unknown error');
  }
});

router.post('/benchmark', async (req: Request, res: Response) => {
  try {
    if (!validateAdminAuth(req)) {
      return sendError(res, 'Unauthorized', 401);
    }
    
    const iterations = parseInt(req.body?.iterations) || 10000;
    const rebalancer = getRebalancer();
    const result = await rebalancer.benchmark(iterations);
    
    sendSuccess(res, result);
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : 'Unknown error');
  }
});

export default router;
