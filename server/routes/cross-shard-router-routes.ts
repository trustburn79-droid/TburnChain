/**
 * TBURN Enterprise Cross-Shard Router API Routes
 * Production-grade API endpoints for cross-shard message routing
 */

import { Router, Request, Response } from 'express';
import {
  getEnterpriseCrossShardRouter,
  initializeEnterpriseCrossShardRouter,
  shutdownEnterpriseCrossShardRouter,
  MessagePriority,
  RouterStats,
  RouteMetrics,
  CircuitState,
} from '../core/messaging/enterprise-cross-shard-router';

const router = Router();

// ============================================================================
// Router Status & Health
// ============================================================================

router.get('/status', (req: Request, res: Response) => {
  try {
    const router = getEnterpriseCrossShardRouter();
    const stats = router.getStats();
    const isHealthy = router.isHealthy();
    const isRunning = router.getIsRunning();
    
    res.json({
      success: true,
      data: {
        status: isHealthy ? 'healthy' : 'degraded',
        isRunning: isRunning,
        uptimeMs: stats.uptimeMs,
        activeRoutes: stats.activeRoutes,
        degradedRoutes: stats.degradedRoutes,
        circuitsBroken: stats.circuitsBroken,
        currentQueueDepth: stats.currentQueueDepth,
        tpsInstant: stats.tpsInstant,
        tpsEwma: stats.tpsEwma,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get router status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/stats', (req: Request, res: Response) => {
  try {
    const router = getEnterpriseCrossShardRouter();
    const stats = router.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get router stats'
    });
  }
});

router.get('/health', (req: Request, res: Response) => {
  try {
    const router = getEnterpriseCrossShardRouter();
    const isHealthy = router.isHealthy();
    
    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'ok' : 'degraded',
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: Date.now()
    });
  }
});

// ============================================================================
// Message Operations
// ============================================================================

router.post('/send', async (req: Request, res: Response) => {
  try {
    const { sourceShard, targetShard, payload, priority, nonce, ttlMs, metadata } = req.body;
    
    if (sourceShard === undefined || targetShard === undefined || !payload) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: sourceShard, targetShard, payload'
      });
      return;
    }
    
    const validPriorities: MessagePriority[] = ['CRITICAL', 'HIGH', 'NORMAL', 'LOW'];
    const msgPriority: MessagePriority = validPriorities.includes(priority) ? priority : 'NORMAL';
    
    const router = getEnterpriseCrossShardRouter();
    const result = await router.sendMessage(
      Number(sourceShard),
      Number(targetShard),
      payload,
      msgPriority,
      { nonce, ttlMs, metadata }
    );
    
    if (result.success) {
      res.status(201).json({
        success: true,
        data: {
          messageId: result.messageId,
          sourceShard,
          targetShard,
          priority: msgPriority
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        messageId: result.messageId
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to send message',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/send/batch', async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;
    
    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Messages array is required'
      });
      return;
    }
    
    const router = getEnterpriseCrossShardRouter();
    const results = [];
    
    for (const msg of messages) {
      const { sourceShard, targetShard, payload, priority, nonce, ttlMs, metadata } = msg;
      const result = await router.sendMessage(
        Number(sourceShard),
        Number(targetShard),
        payload,
        priority || 'NORMAL',
        { nonce, ttlMs, metadata }
      );
      results.push(result);
    }
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    res.status(201).json({
      success: true,
      data: {
        totalMessages: messages.length,
        successful,
        failed,
        results
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to send batch messages'
    });
  }
});

// ============================================================================
// Route Metrics
// ============================================================================

router.get('/routes', (req: Request, res: Response) => {
  try {
    const router = getEnterpriseCrossShardRouter();
    const circuitStates = router.getAllRouteCircuitStates();
    
    const routes: { routeId: string; circuitState: CircuitState }[] = [];
    circuitStates.forEach((state, routeId) => {
      routes.push({ routeId, circuitState: state });
    });
    
    res.json({
      success: true,
      data: {
        totalRoutes: routes.length,
        routes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get routes'
    });
  }
});

router.get('/routes/:sourceShard/:targetShard', (req: Request, res: Response) => {
  try {
    const sourceShard = parseInt(req.params.sourceShard);
    const targetShard = parseInt(req.params.targetShard);
    
    if (isNaN(sourceShard) || isNaN(targetShard)) {
      res.status(400).json({
        success: false,
        error: 'Invalid shard IDs'
      });
      return;
    }
    
    const router = getEnterpriseCrossShardRouter();
    const metrics = router.getRouteMetrics(sourceShard, targetShard);
    
    if (!metrics) {
      res.status(404).json({
        success: false,
        error: 'Route not found'
      });
      return;
    }
    
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get route metrics'
    });
  }
});

// ============================================================================
// Queue Depth & Priority
// ============================================================================

router.get('/queue/depth', (req: Request, res: Response) => {
  try {
    const router = getEnterpriseCrossShardRouter();
    const stats = router.getStats();
    const depthByPriority = router.getQueueDepthByPriority();
    
    const priorities: { priority: string; depth: number }[] = [];
    depthByPriority.forEach((depth, priority) => {
      priorities.push({ priority, depth });
    });
    
    res.json({
      success: true,
      data: {
        totalDepth: stats.currentQueueDepth,
        byPriority: priorities
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get queue depth'
    });
  }
});

// ============================================================================
// Shard Operations
// ============================================================================

router.get('/shards', (req: Request, res: Response) => {
  try {
    const router = getEnterpriseCrossShardRouter();
    const stats = router.getStats();
    
    const shards: { shardId: number; health: string }[] = [];
    for (let i = 0; i < 64; i++) {
      const health = router.getShardHealth(i);
      if (health) {
        shards.push({
          shardId: i,
          health: health.health
        });
      }
    }
    
    res.json({
      success: true,
      data: {
        totalShards: shards.length,
        shards
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get shards'
    });
  }
});

router.get('/shards/:shardId', (req: Request, res: Response) => {
  try {
    const shardId = parseInt(req.params.shardId);
    
    if (isNaN(shardId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid shard ID'
      });
      return;
    }
    
    const router = getEnterpriseCrossShardRouter();
    const health = router.getShardHealth(shardId);
    
    if (!health) {
      res.status(404).json({
        success: false,
        error: 'Shard not found'
      });
      return;
    }
    
    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get shard health'
    });
  }
});

router.post('/shards/:shardId/add', (req: Request, res: Response) => {
  try {
    const shardId = parseInt(req.params.shardId);
    
    if (isNaN(shardId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid shard ID'
      });
      return;
    }
    
    const router = getEnterpriseCrossShardRouter();
    router.addShard(shardId);
    
    res.json({
      success: true,
      message: `Shard ${shardId} added successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to add shard'
    });
  }
});

router.delete('/shards/:shardId', (req: Request, res: Response) => {
  try {
    const shardId = parseInt(req.params.shardId);
    
    if (isNaN(shardId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid shard ID'
      });
      return;
    }
    
    const router = getEnterpriseCrossShardRouter();
    router.removeShard(shardId);
    
    res.json({
      success: true,
      message: `Shard ${shardId} removed successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to remove shard'
    });
  }
});

// ============================================================================
// Circuit Breaker States
// ============================================================================

router.get('/circuits', (req: Request, res: Response) => {
  try {
    const router = getEnterpriseCrossShardRouter();
    const states = router.getAllRouteCircuitStates();
    
    let closed = 0;
    let open = 0;
    let halfOpen = 0;
    
    const circuits: { routeId: string; state: CircuitState }[] = [];
    states.forEach((state, routeId) => {
      circuits.push({ routeId, state });
      if (state === 'CLOSED') closed++;
      else if (state === 'OPEN') open++;
      else if (state === 'HALF_OPEN') halfOpen++;
    });
    
    res.json({
      success: true,
      data: {
        summary: { closed, open, halfOpen },
        circuits
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get circuit states'
    });
  }
});

// ============================================================================
// Latency Metrics
// ============================================================================

router.get('/latency', (req: Request, res: Response) => {
  try {
    const router = getEnterpriseCrossShardRouter();
    const stats = router.getStats();
    
    res.json({
      success: true,
      data: {
        p50Ms: stats.latencyP50Ms,
        p95Ms: stats.latencyP95Ms,
        p99Ms: stats.latencyP99Ms,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get latency metrics'
    });
  }
});

// ============================================================================
// Throughput Metrics
// ============================================================================

router.get('/throughput', (req: Request, res: Response) => {
  try {
    const router = getEnterpriseCrossShardRouter();
    const stats = router.getStats();
    
    res.json({
      success: true,
      data: {
        tpsInstant: stats.tpsInstant,
        tpsEwma: stats.tpsEwma,
        totalMessagesSent: stats.totalMessagesSent,
        totalMessagesDelivered: stats.totalMessagesDelivered,
        totalMessagesFailed: stats.totalMessagesFailed,
        totalMessagesExpired: stats.totalMessagesExpired,
        totalMessagesDeduplicated: stats.totalMessagesDeduplicated,
        successRate: stats.totalMessagesSent > 0 
          ? ((stats.totalMessagesDelivered / stats.totalMessagesSent) * 100).toFixed(2) + '%'
          : '0%',
        timestamp: Date.now()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get throughput metrics'
    });
  }
});

// ============================================================================
// WAL & Durability
// ============================================================================

router.get('/wal/stats', (req: Request, res: Response) => {
  try {
    const router = getEnterpriseCrossShardRouter();
    const stats = router.getStats();
    
    res.json({
      success: true,
      data: {
        segmentCount: stats.walSegmentCount,
        bytesWritten: stats.walBytesWritten,
        bloomFilterRotations: stats.bloomFilterRotations,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get WAL stats'
    });
  }
});

// ============================================================================
// Admin Operations
// ============================================================================

router.post('/admin/start', async (req: Request, res: Response) => {
  try {
    const shardCount = req.body.shardCount || 64;
    await initializeEnterpriseCrossShardRouter(shardCount);
    
    res.json({
      success: true,
      message: `Cross-shard router started with ${shardCount} shards`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to start router'
    });
  }
});

router.post('/admin/stop', async (req: Request, res: Response) => {
  try {
    await shutdownEnterpriseCrossShardRouter();
    
    res.json({
      success: true,
      message: 'Cross-shard router stopped'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to stop router'
    });
  }
});

router.post('/admin/restart', async (req: Request, res: Response) => {
  try {
    const shardCount = req.body.shardCount || 64;
    
    await shutdownEnterpriseCrossShardRouter();
    await initializeEnterpriseCrossShardRouter(shardCount);
    
    res.json({
      success: true,
      message: `Cross-shard router restarted with ${shardCount} shards`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to restart router'
    });
  }
});

// ============================================================================
// Benchmark Endpoint
// ============================================================================

router.post('/benchmark', async (req: Request, res: Response) => {
  try {
    const { messageCount = 1000, concurrency = 10 } = req.body;
    const router = getEnterpriseCrossShardRouter();
    
    const startTime = Date.now();
    const results = [];
    
    for (let i = 0; i < messageCount; i++) {
      const sourceShard = Math.floor(Math.random() * 64);
      const targetShard = Math.floor(Math.random() * 64);
      
      const result = await router.sendMessage(
        sourceShard,
        targetShard,
        { benchmarkId: i, data: `test-${i}` },
        'NORMAL'
      );
      results.push(result);
    }
    
    const endTime = Date.now();
    const durationMs = endTime - startTime;
    const tps = (messageCount / (durationMs / 1000)).toFixed(2);
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    res.json({
      success: true,
      data: {
        messageCount,
        durationMs,
        tps: parseFloat(tps),
        successful,
        failed,
        successRate: ((successful / messageCount) * 100).toFixed(2) + '%'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Benchmark failed'
    });
  }
});

export default router;
