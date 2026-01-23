/**
 * Enterprise Shard Cache API Routes
 * TBURN Blockchain Mainnet - Phase 13
 * 
 * High-performance caching endpoints for shard data
 * 
 * Security: GET endpoints are public for monitoring
 * POST endpoints (warm, invalidate, benchmark) require authentication
 */

import { Router, Request, Response } from 'express';
import { 
  getEnterpriseShardCache, 
  shutdownEnterpriseShardCache,
  type ShardData,
  type ShardPair 
} from '../core/caching/enterprise-shard-cache';
import { requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * GET /api/shard-cache/status
 * Get cache status and health
 */
router.get('/status', (_req: Request, res: Response) => {
  try {
    const cache = getEnterpriseShardCache();
    const stats = cache.getStats();
    
    res.json({
      success: true,
      data: {
        status: 'healthy',
        ttlMs: 2000,
        hitRate: (stats.hitRateEwma * 100).toFixed(2) + '%',
        avgLatencyUs: stats.avgLatencyUs.toFixed(0),
        shardCacheSize: stats.shardCacheSize,
        pairCacheSize: stats.pairCacheSize,
        routeCacheSize: stats.routeCacheSize,
        pairIndexSize: stats.pairIndexSize,
        version: stats.version,
      },
    });
  } catch (error) {
    console.error('[ShardCache] Status error:', error);
    res.status(500).json({ success: false, error: 'Failed to get cache status' });
  }
});

/**
 * GET /api/shard-cache/stats
 * Get detailed cache statistics
 */
router.get('/stats', (_req: Request, res: Response) => {
  try {
    const cache = getEnterpriseShardCache();
    const stats = cache.getStats();
    
    res.json({
      success: true,
      data: {
        hits: stats.hits,
        misses: stats.misses,
        evictions: stats.evictions,
        warmings: stats.warmings,
        hitRateEwma: stats.hitRateEwma,
        avgLatencyUs: stats.avgLatencyUs,
        memoryBytes: stats.memoryBytes,
        shardCacheSize: stats.shardCacheSize,
        pairCacheSize: stats.pairCacheSize,
        routeCacheSize: stats.routeCacheSize,
        pairIndexSize: stats.pairIndexSize,
        version: stats.version,
      },
    });
  } catch (error) {
    console.error('[ShardCache] Stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to get cache stats' });
  }
});

/**
 * GET /api/shard-cache/shard/:id
 * Get cached shard by ID - O(1)
 */
router.get('/shard/:id', async (req: Request, res: Response) => {
  try {
    const shardId = parseInt(req.params.id);
    if (isNaN(shardId)) {
      return res.status(400).json({ success: false, error: 'Invalid shard ID' });
    }
    
    const cache = getEnterpriseShardCache();
    const shard = await cache.getShard(shardId);
    
    if (shard) {
      res.json({ success: true, data: shard, cached: true });
    } else {
      res.json({ success: true, data: null, cached: false });
    }
  } catch (error) {
    console.error('[ShardCache] Get shard error:', error);
    res.status(500).json({ success: false, error: 'Failed to get shard' });
  }
});

/**
 * GET /api/shard-cache/shards
 * Get all cached shards - O(1)
 */
router.get('/shards', async (_req: Request, res: Response) => {
  try {
    const cache = getEnterpriseShardCache();
    const shards = await cache.getAllShards();
    
    if (shards) {
      res.json({ success: true, data: shards, cached: true, count: shards.length });
    } else {
      res.json({ success: true, data: null, cached: false });
    }
  } catch (error) {
    console.error('[ShardCache] Get all shards error:', error);
    res.status(500).json({ success: false, error: 'Failed to get shards' });
  }
});

/**
 * GET /api/shard-cache/pair/:source/:target
 * Get shard pair by source and target - O(1)
 */
router.get('/pair/:source/:target', (req: Request, res: Response) => {
  try {
    const sourceShardId = parseInt(req.params.source);
    const targetShardId = parseInt(req.params.target);
    
    if (isNaN(sourceShardId) || isNaN(targetShardId)) {
      return res.status(400).json({ success: false, error: 'Invalid shard IDs' });
    }
    
    const cache = getEnterpriseShardCache();
    const pair = cache.selectOptimalShardPair(sourceShardId, targetShardId);
    
    if (pair) {
      res.json({ success: true, data: pair, cached: true });
    } else {
      res.json({ success: true, data: null, cached: false });
    }
  } catch (error) {
    console.error('[ShardCache] Get pair error:', error);
    res.status(500).json({ success: false, error: 'Failed to get shard pair' });
  }
});

/**
 * POST /api/shard-cache/warm
 * Warm cache proactively
 */
router.post('/warm', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const cache = getEnterpriseShardCache();
    await cache.warmCache();
    
    const stats = cache.getStats();
    res.json({
      success: true,
      message: 'Cache warmed successfully',
      data: {
        shardCacheSize: stats.shardCacheSize,
        pairIndexSize: stats.pairIndexSize,
      },
    });
  } catch (error) {
    console.error('[ShardCache] Warm error:', error);
    res.status(500).json({ success: false, error: 'Failed to warm cache' });
  }
});

/**
 * POST /api/shard-cache/invalidate
 * Invalidate all caches
 */
router.post('/invalidate', requireAdmin, (_req: Request, res: Response) => {
  try {
    const cache = getEnterpriseShardCache();
    cache.invalidateAll();
    
    res.json({ success: true, message: 'Cache invalidated successfully' });
  } catch (error) {
    console.error('[ShardCache] Invalidate error:', error);
    res.status(500).json({ success: false, error: 'Failed to invalidate cache' });
  }
});

/**
 * GET /api/shard-cache/route/:from/:to
 * Get cached route between shards - O(1)
 */
router.get('/route/:from/:to', (req: Request, res: Response) => {
  try {
    const fromShardId = parseInt(req.params.from);
    const toShardId = parseInt(req.params.to);
    
    if (isNaN(fromShardId) || isNaN(toShardId)) {
      return res.status(400).json({ success: false, error: 'Invalid shard IDs' });
    }
    
    const cache = getEnterpriseShardCache();
    const routeKey = `${fromShardId}->${toShardId}`;
    const route = cache.getRoute(routeKey);
    
    if (route) {
      res.json({ success: true, data: route, cached: true });
    } else {
      // Try to get via pair selection as fallback
      const pair = cache.selectOptimalShardPair(fromShardId, toShardId);
      if (pair) {
        res.json({ 
          success: true, 
          data: { 
            routeKey: pair.routeKey,
            sourceShardId: pair.sourceShardId,
            targetShardId: pair.targetShardId,
            latencyMs: pair.latencyMs,
            healthScore: pair.healthScore,
          }, 
          cached: true,
          fromPairIndex: true,
        });
      } else {
        res.json({ success: true, data: null, cached: false });
      }
    }
  } catch (error) {
    console.error('[ShardCache] Get route error:', error);
    res.status(500).json({ success: false, error: 'Failed to get route' });
  }
});

/**
 * GET /api/shard-cache/health
 * Get cache health status
 */
router.get('/health', (_req: Request, res: Response) => {
  try {
    const cache = getEnterpriseShardCache();
    const stats = cache.getStats();
    
    // Determine health status based on metrics
    const hitRate = stats.hitRateEwma;
    const avgLatencyUs = stats.avgLatencyUs;
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    let message = 'Cache operating normally';
    
    if (hitRate < 0.3) {
      status = 'degraded';
      message = 'Low hit rate - consider cache warming';
    }
    if (avgLatencyUs > 1000) {
      status = 'degraded';
      message = 'High latency detected';
    }
    if (stats.shardCacheSize === 0 && stats.pairCacheSize === 0) {
      status = 'unhealthy';
      message = 'Cache empty - requires initialization';
    }
    
    res.json({
      success: true,
      data: {
        status,
        message,
        hitRate: (hitRate * 100).toFixed(2) + '%',
        avgLatencyUs: avgLatencyUs.toFixed(2),
        cachePopulated: stats.shardCacheSize > 0 || stats.pairCacheSize > 0,
        version: stats.version,
      },
    });
  } catch (error) {
    console.error('[ShardCache] Health check error:', error);
    res.status(500).json({ 
      success: false, 
      data: { status: 'unhealthy', message: 'Health check failed' },
    });
  }
});

/**
 * POST /api/shard-cache/benchmark
 * Run cache performance benchmark
 */
router.post('/benchmark', requireAdmin, (req: Request, res: Response) => {
  try {
    const { iterations = 10000 } = req.body;
    const cache = getEnterpriseShardCache();
    
    const startTime = Date.now();
    let hits = 0;
    let misses = 0;
    
    // Populate cache first
    const testShards: ShardData[] = [];
    for (let i = 0; i < 64; i++) {
      testShards.push({
        id: i,
        name: `shard-${i}`,
        status: 'active',
        validators: 10,
        tps: 3000 + Math.random() * 1000,
        avgBlockTime: 100,
        totalTransactions: 1000000,
        load: 50,
      });
    }
    cache.setAllShards(testShards);
    
    // Run O(1) pair selection benchmark
    const pairStartTime = Date.now();
    for (let i = 0; i < iterations; i++) {
      const source = Math.floor(Math.random() * 64);
      const target = Math.floor(Math.random() * 64);
      if (source !== target) {
        const pair = cache.selectOptimalShardPair(source, target);
        if (pair) hits++;
        else misses++;
      }
    }
    const pairDuration = Date.now() - pairStartTime;
    
    const totalDuration = Date.now() - startTime;
    const opsPerSecond = Math.round((iterations / pairDuration) * 1000);
    
    res.json({
      success: true,
      data: {
        iterations,
        totalDurationMs: totalDuration,
        pairSelectionDurationMs: pairDuration,
        hits,
        misses,
        hitRate: ((hits / (hits + misses)) * 100).toFixed(2) + '%',
        opsPerSecond,
        avgLatencyUs: ((pairDuration * 1000) / iterations).toFixed(2),
      },
    });
  } catch (error) {
    console.error('[ShardCache] Benchmark error:', error);
    res.status(500).json({ success: false, error: 'Failed to run benchmark' });
  }
});

export default router;
