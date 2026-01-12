/**
 * TBURN Realtime Block Pipeline API Routes
 * Exposes pipeline stats and controls for monitoring
 */

import { Router, Request, Response } from 'express';
import { getRealtimeBlockPipeline } from '../core/pipeline/realtime-block-pipeline';

const router = Router();

/**
 * GET /api/pipeline/stats
 * Get current pipeline statistics
 */
router.get('/stats', (_req: Request, res: Response) => {
  try {
    const pipeline = getRealtimeBlockPipeline();
    const stats = pipeline.getStats();
    
    res.json({
      success: true,
      data: stats,
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * GET /api/pipeline/blocks
 * Get recent blocks from pipeline buffer
 */
router.get('/blocks', (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const pipeline = getRealtimeBlockPipeline();
    const blocks = pipeline.getRecentBlocks(limit);
    
    res.json({
      success: true,
      data: blocks.map(b => ({
        number: b.number,
        hash: b.hash,
        parentHash: b.parentHash,
        timestamp: b.timestamp,
        proposer: b.proposer,
        transactionCount: b.transactionCount,
        gasUsed: b.gasUsed.toString(),
        shardId: b.shardId,
      })),
      count: blocks.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * POST /api/pipeline/start
 * Start the realtime block pipeline
 */
router.post('/start', async (_req: Request, res: Response) => {
  try {
    const pipeline = getRealtimeBlockPipeline();
    
    if (pipeline.isActive()) {
      res.json({
        success: true,
        message: 'Pipeline already running',
        stats: pipeline.getStats(),
      });
      return;
    }
    
    await pipeline.start();
    
    res.json({
      success: true,
      message: 'Pipeline started',
      stats: pipeline.getStats(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * POST /api/pipeline/stop
 * Stop the realtime block pipeline
 */
router.post('/stop', async (_req: Request, res: Response) => {
  try {
    const pipeline = getRealtimeBlockPipeline();
    
    if (!pipeline.isActive()) {
      res.json({
        success: true,
        message: 'Pipeline already stopped',
      });
      return;
    }
    
    await pipeline.stop();
    
    res.json({
      success: true,
      message: 'Pipeline stopped',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * GET /api/pipeline/health
 * Health check for pipeline
 */
router.get('/health', (_req: Request, res: Response) => {
  try {
    const pipeline = getRealtimeBlockPipeline();
    const stats = pipeline.getStats();
    
    const healthy = !stats.isRunning || (
      stats.currentTPS > 0 &&
      Date.now() - stats.lastBlockTime < 5000
    );
    
    res.status(healthy ? 200 : 503).json({
      healthy,
      isRunning: stats.isRunning,
      currentTPS: stats.currentTPS,
      lastBlockAgo: stats.lastBlockTime ? Date.now() - stats.lastBlockTime : null,
    });
  } catch (error) {
    res.status(500).json({
      healthy: false,
      error: (error as Error).message,
    });
  }
});

/**
 * GET /api/pipeline/config
 * Get current pipeline configuration
 */
router.get('/config', (_req: Request, res: Response) => {
  try {
    const pipeline = getRealtimeBlockPipeline();
    const config = pipeline.getConfig();
    
    res.json({
      success: true,
      data: {
        ...config,
        mode: config.DEV_SAFE_MODE ? 'DEV_SAFE_MODE' : 'PRODUCTION',
        theoreticalMaxTPS: Math.floor(config.MAX_TX_PER_BLOCK * (1000 / config.BLOCK_INTERVAL_MS)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * GET /api/pipeline/benchmark
 * Get detailed benchmark information
 */
router.get('/benchmark', (_req: Request, res: Response) => {
  try {
    const pipeline = getRealtimeBlockPipeline();
    const stats = pipeline.getStats();
    const config = pipeline.getConfig();
    
    const theoreticalMaxTPS = Math.floor(config.MAX_TX_PER_BLOCK * (1000 / config.BLOCK_INTERVAL_MS));
    const efficiency = stats.averageTPS > 0 ? (stats.averageTPS / theoreticalMaxTPS * 100).toFixed(2) : 0;
    
    res.json({
      success: true,
      data: {
        mode: config.DEV_SAFE_MODE ? 'DEV_SAFE_MODE' : 'PRODUCTION',
        config: {
          blockIntervalMs: config.BLOCK_INTERVAL_MS,
          maxTxPerBlock: config.MAX_TX_PER_BLOCK,
          targetTPS: config.TARGET_TPS,
        },
        performance: {
          currentTPS: stats.currentTPS,
          averageTPS: stats.averageTPS,
          peakTPS: stats.peakTPS,
          blocksPerSecond: stats.blocksPerSecond,
          totalBlocks: stats.blocksProduced,
          totalTransactions: stats.transactionsProcessed,
        },
        theoretical: {
          maxTPS: theoreticalMaxTPS,
          efficiency: `${efficiency}%`,
          targetTPS: config.TARGET_TPS,
        },
        uptime: {
          seconds: stats.uptime,
          formatted: formatUptime(stats.uptime),
        },
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(0)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

export default router;

console.log('[Pipeline] ✅ Pipeline API routes registered');
