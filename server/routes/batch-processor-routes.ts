/**
 * Enterprise Batch Processor API Routes
 * TBURN Blockchain Mainnet - Phase 14
 * 
 * High-performance batch message insertion endpoints
 * 
 * Security:
 * - GET endpoints are public for monitoring
 * - POST endpoints (insert, benchmark) require authentication
 */

import { Router, Request, Response, NextFunction } from 'express';
import {
  getEnterpriseBatchProcessor,
  createEnterpriseBatchProcessor,
  shutdownEnterpriseBatchProcessor,
  type BatchMessage,
  type BatchResult,
  type BatchStats,
  BATCH_CONFIG,
} from '../core/messaging/enterprise-batch-processor';
import { getEnterpriseCrossShardRouter } from '../core/messaging/enterprise-cross-shard-router';

const router = Router();

/**
 * Admin authentication middleware for mutation endpoints
 */
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.session?.authenticated || req.session?.isAdmin) {
    return next();
  }
  
  const adminPassword = process.env.ADMIN_PASSWORD;
  const providedPassword = req.headers['x-admin-password'];
  if (adminPassword && providedPassword === adminPassword) {
    return next();
  }
  
  return res.status(401).json({ 
    success: false, 
    error: 'Authentication required for batch operations' 
  });
}

// ============================================================================
// Status & Monitoring (Public)
// ============================================================================

/**
 * GET /api/batch-processor/status
 * Get processor status and health
 */
router.get('/status', (_req: Request, res: Response) => {
  try {
    const processor = getEnterpriseBatchProcessor();
    const stats = processor.getStats();
    
    res.json({
      success: true,
      data: {
        status: stats.state === 'RUNNING' ? 'healthy' : 'degraded',
        state: stats.state,
        circuitBreaker: processor.getCircuitBreakerState(),
        queueDepth: stats.currentQueueDepth,
        currentBatchSize: stats.currentBatchSize,
        ewmaThroughput: Math.round(stats.ewmaThroughput),
        uptimeMs: stats.uptimeMs,
      },
    });
  } catch (error) {
    console.error('[BatchProcessor] Status error:', error);
    res.status(500).json({ success: false, error: 'Failed to get processor status' });
  }
});

/**
 * GET /api/batch-processor/stats
 * Get detailed processor statistics
 */
router.get('/stats', (_req: Request, res: Response) => {
  try {
    const processor = getEnterpriseBatchProcessor();
    const stats = processor.getStats();
    
    res.json({
      success: true,
      data: {
        totalBatchesProcessed: stats.totalBatchesProcessed,
        totalMessagesProcessed: stats.totalMessagesProcessed,
        totalMessagesSucceeded: stats.totalMessagesSucceeded,
        totalMessagesFailed: stats.totalMessagesFailed,
        currentQueueDepth: stats.currentQueueDepth,
        currentBatchSize: stats.currentBatchSize,
        avgProcessingTimeMs: stats.avgProcessingTimeMs.toFixed(2),
        avgThroughputMps: Math.round(stats.avgThroughputMps),
        peakThroughputMps: Math.round(stats.peakThroughputMps),
        ewmaThroughput: Math.round(stats.ewmaThroughput),
        ewmaLatency: stats.ewmaLatency.toFixed(2),
        memoryUsageMb: stats.memoryUsageMb.toFixed(2),
        bufferPoolUtilization: (stats.bufferPoolUtilization * 100).toFixed(1) + '%',
        uptimeMs: stats.uptimeMs,
        state: stats.state,
      },
    });
  } catch (error) {
    console.error('[BatchProcessor] Stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to get stats' });
  }
});

/**
 * GET /api/batch-processor/health
 * Health check endpoint
 */
router.get('/health', (_req: Request, res: Response) => {
  try {
    const processor = getEnterpriseBatchProcessor();
    const stats = processor.getStats();
    const circuitState = processor.getCircuitBreakerState();
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    let message = 'Batch processor operating normally';
    
    if (stats.state !== 'RUNNING') {
      status = 'degraded';
      message = `Processor in ${stats.state} state`;
    }
    if (circuitState === 'OPEN') {
      status = 'unhealthy';
      message = 'Circuit breaker open - downstream failures detected';
    }
    if (stats.currentQueueDepth > BATCH_CONFIG.MAX_QUEUE_SIZE * 0.9) {
      status = 'degraded';
      message = 'Queue near capacity';
    }
    
    res.json({
      success: true,
      data: {
        status,
        message,
        state: stats.state,
        circuitBreaker: circuitState,
        queueUtilization: ((stats.currentQueueDepth / BATCH_CONFIG.MAX_QUEUE_SIZE) * 100).toFixed(1) + '%',
      },
    });
  } catch (error) {
    console.error('[BatchProcessor] Health check error:', error);
    res.status(500).json({ 
      success: false, 
      data: { status: 'unhealthy', message: 'Health check failed' },
    });
  }
});

/**
 * GET /api/batch-processor/queue
 * Get queue depth by priority
 */
router.get('/queue', (_req: Request, res: Response) => {
  try {
    const processor = getEnterpriseBatchProcessor();
    const depthByPriority = processor.getQueueDepthByPriority();
    
    const queue: Record<string, number> = {};
    depthByPriority.forEach((count, priority) => {
      queue[priority] = count;
    });
    
    res.json({
      success: true,
      data: {
        totalDepth: processor.getQueueDepth(),
        byPriority: queue,
        maxCapacity: BATCH_CONFIG.MAX_QUEUE_SIZE,
        utilization: ((processor.getQueueDepth() / BATCH_CONFIG.MAX_QUEUE_SIZE) * 100).toFixed(2) + '%',
      },
    });
  } catch (error) {
    console.error('[BatchProcessor] Queue status error:', error);
    res.status(500).json({ success: false, error: 'Failed to get queue status' });
  }
});

/**
 * GET /api/batch-processor/config
 * Get current batch configuration
 */
router.get('/config', (_req: Request, res: Response) => {
  try {
    const processor = getEnterpriseBatchProcessor();
    const sizerStats = processor.getBatchSizerStats();
    
    res.json({
      success: true,
      data: {
        batchSizeMin: BATCH_CONFIG.BATCH_SIZE_MIN,
        batchSizeMax: BATCH_CONFIG.BATCH_SIZE_MAX,
        currentBatchSize: sizerStats.currentSize,
        chunkSize: BATCH_CONFIG.CHUNK_SIZE,
        parallelChunks: BATCH_CONFIG.PARALLEL_CHUNKS,
        maxQueueSize: BATCH_CONFIG.MAX_QUEUE_SIZE,
        flushIntervalMs: BATCH_CONFIG.FLUSH_INTERVAL_MS,
        walGroupSize: BATCH_CONFIG.WAL_GROUP_SIZE,
        priorityWeights: BATCH_CONFIG.PRIORITY_WEIGHTS,
      },
    });
  } catch (error) {
    console.error('[BatchProcessor] Config error:', error);
    res.status(500).json({ success: false, error: 'Failed to get config' });
  }
});

// ============================================================================
// Batch Operations (Admin Required)
// ============================================================================

/**
 * POST /api/batch-processor/insert
 * Insert a batch of messages for processing
 */
router.post('/insert', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;
    
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Messages array is required and must not be empty',
      });
    }
    
    if (messages.length > BATCH_CONFIG.BATCH_SIZE_MAX * 10) {
      return res.status(400).json({
        success: false,
        error: `Batch size exceeds maximum (${BATCH_CONFIG.BATCH_SIZE_MAX * 10})`,
      });
    }
    
    const processor = getEnterpriseBatchProcessor();
    const result = await processor.insertBatch(messages as BatchMessage[]);
    
    res.status(result.status === 'COMPLETED' ? 201 : result.status === 'PARTIAL' ? 207 : 500).json({
      success: result.status !== 'FAILED',
      data: {
        batchId: result.batchId,
        status: result.status,
        totalMessages: result.totalMessages,
        successCount: result.successCount,
        failureCount: result.failureCount,
        processingTimeMs: result.processingTimeMs,
        throughputMps: Math.round(result.throughputMps),
      },
      errors: result.errors,
    });
  } catch (error) {
    console.error('[BatchProcessor] Insert error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to insert batch',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/batch-processor/insert/direct
 * Insert and process batch directly (synchronous processing)
 */
router.post('/insert/direct', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;
    
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Messages array is required and must not be empty',
      });
    }
    
    const processor = getEnterpriseBatchProcessor();
    const result = await processor.insertBatchDirect(messages as BatchMessage[]);
    
    res.status(result.status === 'COMPLETED' ? 201 : result.status === 'PARTIAL' ? 207 : 500).json({
      success: result.status !== 'FAILED',
      data: {
        batchId: result.batchId,
        status: result.status,
        totalMessages: result.totalMessages,
        successCount: result.successCount,
        failureCount: result.failureCount,
        processingTimeMs: result.processingTimeMs,
        throughputMps: Math.round(result.throughputMps),
        avgLatencyUs: ((result.processingTimeMs / result.totalMessages) * 1000).toFixed(2),
      },
      errors: result.errors,
    });
  } catch (error) {
    console.error('[BatchProcessor] Direct insert error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process batch directly',
    });
  }
});

/**
 * POST /api/batch-processor/benchmark
 * Run performance benchmark
 */
router.post('/benchmark', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { messageCount = 100000 } = req.body;
    const count = Math.min(Math.max(messageCount, 1000), 1000000);
    
    const processor = getEnterpriseBatchProcessor();
    const result = await processor.benchmark(count);
    
    res.json({
      success: true,
      data: {
        totalMessages: result.totalMessages,
        totalTimeMs: result.totalTimeMs,
        throughputMps: Math.round(result.throughputMps),
        avgLatencyUs: result.avgLatencyUs.toFixed(3),
        successRate: (result.successRate * 100).toFixed(2) + '%',
        opsPerSecond: Math.round(result.throughputMps),
      },
    });
  } catch (error) {
    console.error('[BatchProcessor] Benchmark error:', error);
    res.status(500).json({ success: false, error: 'Failed to run benchmark' });
  }
});

/**
 * POST /api/batch-processor/start
 * Start the batch processor
 */
router.post('/start', requireAdmin, async (req: Request, res: Response) => {
  try {
    const processor = getEnterpriseBatchProcessor();
    await processor.start();
    
    res.json({
      success: true,
      message: 'Batch processor started',
      data: { state: processor.getState() },
    });
  } catch (error) {
    console.error('[BatchProcessor] Start error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start batch processor',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/batch-processor/stop
 * Stop the batch processor (with graceful drain)
 */
router.post('/stop', requireAdmin, async (req: Request, res: Response) => {
  try {
    const processor = getEnterpriseBatchProcessor();
    await processor.stop();
    
    res.json({
      success: true,
      message: 'Batch processor stopped',
      data: { state: processor.getState() },
    });
  } catch (error) {
    console.error('[BatchProcessor] Stop error:', error);
    res.status(500).json({ success: false, error: 'Failed to stop batch processor' });
  }
});

/**
 * POST /api/batch-processor/pause
 * Pause batch processing
 */
router.post('/pause', requireAdmin, (_req: Request, res: Response) => {
  try {
    const processor = getEnterpriseBatchProcessor();
    processor.pause();
    
    res.json({
      success: true,
      message: 'Batch processor paused',
      data: { state: processor.getState() },
    });
  } catch (error) {
    console.error('[BatchProcessor] Pause error:', error);
    res.status(500).json({ success: false, error: 'Failed to pause batch processor' });
  }
});

/**
 * POST /api/batch-processor/resume
 * Resume batch processing
 */
router.post('/resume', requireAdmin, (_req: Request, res: Response) => {
  try {
    const processor = getEnterpriseBatchProcessor();
    processor.resume();
    
    res.json({
      success: true,
      message: 'Batch processor resumed',
      data: { state: processor.getState() },
    });
  } catch (error) {
    console.error('[BatchProcessor] Resume error:', error);
    res.status(500).json({ success: false, error: 'Failed to resume batch processor' });
  }
});

// ============================================================================
// Integration with Cross-Shard Router
// ============================================================================

/**
 * POST /api/batch-processor/cross-shard/batch
 * High-performance batch insertion for cross-shard messages
 * This integrates with the Enterprise Cross-Shard Router
 */
router.post('/cross-shard/batch', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;
    
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Messages array is required',
      });
    }
    
    const startTime = Date.now();
    const crossShardRouter = getEnterpriseCrossShardRouter();
    
    // Process in parallel chunks for maximum throughput
    const chunkSize = BATCH_CONFIG.CHUNK_SIZE;
    const chunks: typeof messages[] = [];
    
    for (let i = 0; i < messages.length; i += chunkSize) {
      chunks.push(messages.slice(i, i + chunkSize));
    }
    
    const chunkResults = await Promise.all(
      chunks.map(async (chunk) => {
        const results = await Promise.allSettled(
          chunk.map(msg => 
            crossShardRouter.sendMessage(
              Number(msg.sourceShard),
              Number(msg.targetShard),
              msg.payload,
              msg.priority || 'NORMAL',
              { nonce: msg.nonce, ttlMs: msg.ttlMs, metadata: msg.metadata }
            )
          )
        );
        
        let successCount = 0;
        let failureCount = 0;
        const messageIds: string[] = [];
        
        for (const result of results) {
          if (result.status === 'fulfilled' && result.value.success) {
            successCount++;
            messageIds.push(result.value.messageId || '');
          } else {
            failureCount++;
          }
        }
        
        return { successCount, failureCount, messageIds };
      })
    );
    
    const totalSuccess = chunkResults.reduce((sum, r) => sum + r.successCount, 0);
    const totalFailed = chunkResults.reduce((sum, r) => sum + r.failureCount, 0);
    const allMessageIds = chunkResults.flatMap(r => r.messageIds);
    const processingTimeMs = Date.now() - startTime;
    const throughputMps = messages.length / (processingTimeMs / 1000);
    
    res.status(totalFailed === 0 ? 201 : totalFailed === messages.length ? 500 : 207).json({
      success: totalFailed < messages.length,
      data: {
        totalMessages: messages.length,
        successCount: totalSuccess,
        failureCount: totalFailed,
        processingTimeMs,
        throughputMps: Math.round(throughputMps),
        avgLatencyUs: ((processingTimeMs / messages.length) * 1000).toFixed(2),
        messageIds: allMessageIds.slice(0, 100), // Limit response size
      },
    });
  } catch (error) {
    console.error('[BatchProcessor] Cross-shard batch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process cross-shard batch',
    });
  }
});

export default router;
