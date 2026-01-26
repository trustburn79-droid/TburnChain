import type { Express, Request, Response } from "express";
import { safeErrorResponse, safe503 } from "../core/safe-error-response";
import { getBlockchainOrchestrator } from "../services/blockchain-orchestrator";
import { getPersistenceBatcher } from "../services/persistence-batcher";
import { getAdaptiveFeeEngine } from "../core/fees/adaptive-fee-engine";
import rateLimit from "express-rate-limit";

const scalabilityLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

export function registerScalabilityRoutes(app: Express): void {
  
  app.get("/api/enterprise/scalability/status", scalabilityLimiter, async (req: Request, res: Response) => {
    try {
      const orchestrator = getBlockchainOrchestrator();
      const status = orchestrator.getDetailedStatus();
      
      res.json({
        success: true,
        data: {
          timestamp: Date.now(),
          orchestrator: status.orchestrator,
          workerPool: status.workerPool,
          persistenceBatcher: status.persistenceBatcher,
          feeEngine: status.feeEngine,
          systemHealth: status.systemHealth,
          circuitBreaker: status.circuitBreaker,
          alertStats: status.alertStats,
        },
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  app.get("/api/enterprise/scalability/health", scalabilityLimiter, async (req: Request, res: Response) => {
    try {
      const orchestrator = getBlockchainOrchestrator();
      const health = orchestrator.getSystemHealth();
      
      const statusCode = health.overall === 'healthy' ? 200 : 
                         health.overall === 'degraded' ? 207 : 503;
      
      res.status(statusCode).json({
        success: health.overall !== 'critical',
        data: {
          overall: health.overall,
          uptime: health.uptime,
          lastFullCheck: health.lastFullCheck,
          components: health.components.map(c => ({
            name: c.name,
            status: c.status,
            latencyMs: c.latencyMs,
            consecutiveFailures: c.consecutiveFailures,
          })),
        },
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  app.get("/api/enterprise/scalability/alerts", scalabilityLimiter, async (req: Request, res: Response) => {
    try {
      const orchestrator = getBlockchainOrchestrator();
      const severity = req.query.severity as 'info' | 'warning' | 'error' | 'critical' | undefined;
      const alerts = orchestrator.getActiveAlerts(severity);
      const stats = orchestrator.getAlertStats();
      
      res.json({
        success: true,
        data: {
          stats,
          alerts: alerts.slice(0, 100),
        },
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  app.post("/api/enterprise/scalability/alerts/:alertId/acknowledge", scalabilityLimiter, async (req: Request, res: Response) => {
    try {
      const orchestrator = getBlockchainOrchestrator();
      const acknowledged = orchestrator.acknowledgeAlert(req.params.alertId);
      
      res.json({
        success: acknowledged,
        message: acknowledged ? 'Alert acknowledged' : 'Alert not found',
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  app.get("/api/enterprise/scalability/circuit-breaker", scalabilityLimiter, async (req: Request, res: Response) => {
    try {
      const orchestrator = getBlockchainOrchestrator();
      const cbState = orchestrator.getCircuitBreakerState();
      
      res.json({
        success: true,
        data: cbState ? {
          enabled: true,
          ...cbState,
        } : {
          enabled: false,
          message: 'Circuit breaker is not enabled',
        },
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  app.get("/api/enterprise/scalability/worker-pool", scalabilityLimiter, async (req: Request, res: Response) => {
    try {
      const orchestrator = getBlockchainOrchestrator();
      const status = orchestrator.getDetailedStatus();
      
      if (!status.workerPool) {
        res.json({
          success: true,
          data: {
            enabled: false,
            message: 'Worker pool is not enabled',
          },
        });
        return;
      }
      
      res.json({
        success: true,
        data: {
          enabled: true,
          metrics: status.workerPool,
        },
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  app.get("/api/enterprise/scalability/persistence", scalabilityLimiter, async (req: Request, res: Response) => {
    try {
      const batcher = getPersistenceBatcher();
      const metrics = batcher.getMetrics();
      const dlqStats = batcher.getDeadLetterQueueStats();
      const walStats = batcher.getWALStats();
      const priorityStats = batcher.getPriorityQueueStats();
      
      res.json({
        success: true,
        data: {
          enabled: true,
          metrics: {
            totalBlocksWritten: metrics.totalBlocksWritten,
            totalConsensusRoundsWritten: metrics.totalConsensusRoundsWritten,
            totalCrossShardWritten: metrics.totalCrossShardWritten,
            totalFlushes: metrics.totalFlushes,
            totalErrors: metrics.totalErrors,
            averageFlushDuration: metrics.averageFlushDuration,
            lastFlushTime: metrics.lastFlushTime,
            successfulRetries: metrics.successfulRetries,
            failedRetries: metrics.failedRetries,
            pending: {
              blocks: metrics.pendingBlocks,
              consensusRounds: metrics.pendingConsensusRounds,
              shardMetrics: metrics.pendingShardMetrics,
              crossShardMessages: metrics.pendingCrossShardMessages,
              networkMetrics: metrics.pendingNetworkMetrics,
            },
          },
          enterprise: {
            deadLetterQueue: dlqStats,
            writeAheadLog: walStats,
            priorityQueue: priorityStats,
            ringBufferUtilization: metrics.ringBufferUtilization,
          },
        },
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  app.post("/api/enterprise/scalability/persistence/retry-dlq", scalabilityLimiter, async (req: Request, res: Response) => {
    try {
      const batcher = getPersistenceBatcher();
      const count = typeof req.body?.count === 'number' ? req.body.count : 10;
      const retried = batcher.retryDeadLetterItems(count);
      
      res.json({
        success: true,
        data: {
          retriedCount: retried,
        },
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  app.get("/api/enterprise/scalability/gas-fees", scalabilityLimiter, async (req: Request, res: Response) => {
    try {
      const feeEngine = getAdaptiveFeeEngine();
      const metrics = feeEngine.getMetrics();
      const shardFees = feeEngine.getAllShardFees();
      const congestionAnalysis = feeEngine.getCongestionAnalysis();
      
      res.json({
        success: true,
        data: {
          globalBaseFee: metrics.globalBaseFee,
          globalBaseFeeGwei: (BigInt(metrics.globalBaseFee) / BigInt('1000000000')).toString(),
          globalBlobBaseFee: metrics.globalBlobBaseFee,
          congestionScore: metrics.congestionScore,
          totalShards: metrics.totalShards,
          totalPendingTransactions: metrics.totalPendingTransactions,
          metrics: {
            totalFeeCalculations: metrics.totalFeeCalculations,
            baseFeeUpdates: metrics.baseFeeUpdates,
            backpressureEvents: metrics.backpressureEvents,
            harmonizationAdjustments: metrics.harmonizationAdjustments,
            twapCalculations: metrics.twapCalculations,
            predictions: metrics.predictions,
            blobFeeUpdates: metrics.blobFeeUpdates,
          },
          congestionAnalysis,
          shardFees,
        },
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  app.get("/api/enterprise/scalability/fee-estimate/:shardId", scalabilityLimiter, async (req: Request, res: Response) => {
    try {
      const shardId = parseInt(req.params.shardId, 10);
      const priority = (req.query.priority as 'low' | 'medium' | 'high') || 'medium';
      
      if (isNaN(shardId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid shard ID',
        });
        return;
      }
      
      const feeEngine = getAdaptiveFeeEngine();
      const estimate = feeEngine.estimateFee(shardId, priority);
      const prediction = feeEngine.getShardPrediction(shardId);
      
      res.json({
        success: true,
        data: {
          shardId,
          priority,
          baseFee: estimate.baseFee.toString(),
          baseFeeGwei: (estimate.baseFee / BigInt('1000000000')).toString(),
          priorityFee: estimate.priorityFee.toString(),
          priorityFeeGwei: (estimate.priorityFee / BigInt('1000000000')).toString(),
          maxFee: estimate.maxFee.toString(),
          maxFeeGwei: (estimate.maxFee / BigInt('1000000000')).toString(),
          estimatedWaitBlocks: estimate.estimatedWaitBlocks,
          estimatedWaitMs: estimate.estimatedWaitBlocks * 100,
          congestionLevel: estimate.congestionLevel,
          twapBaseFee: estimate.twapBaseFee.toString(),
          predictedBaseFee: estimate.predictedBaseFee.toString(),
          blobBaseFee: estimate.blobBaseFee.toString(),
          confidence: estimate.confidence,
          prediction: prediction ? {
            trendDirection: prediction.trendDirection,
            volatility: prediction.volatility,
            predictedCongestion: prediction.predictedCongestion,
          } : null,
        },
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  app.get("/api/enterprise/scalability/block-production", scalabilityLimiter, async (req: Request, res: Response) => {
    try {
      const orchestrator = getBlockchainOrchestrator();
      const metrics = orchestrator.getMetrics();
      const stats = orchestrator.getBlockProductionStats();
      const config = orchestrator.getConfig();
      
      res.json({
        success: true,
        data: {
          currentBlockHeight: orchestrator.getCurrentBlockHeight(),
          currentEpoch: orchestrator.getCurrentEpoch(),
          config: {
            shardCount: config.shardCount,
            validatorsPerShard: config.validatorsPerShard,
            blockTimeMs: config.blockTimeMs,
          },
          metrics: {
            blocksProduced: metrics.blocksProduced,
            consensusRoundsCompleted: metrics.consensusRoundsCompleted,
            crossShardMessagesProcessed: metrics.crossShardMessagesProcessed,
            averageBlockTime: metrics.averageBlockTime,
            failedBlocks: metrics.failedBlocks,
            circuitBreakerTrips: metrics.circuitBreakerTrips,
            uptimeSeconds: metrics.uptimeSeconds,
          },
          stats: {
            totalBlocks: stats.totalBlocks,
            successfulBlocks: stats.successfulBlocks,
            failedBlocks: stats.failedBlocks,
            successRate: stats.totalBlocks > 0 ? (stats.successfulBlocks / stats.totalBlocks * 100).toFixed(2) + '%' : '100%',
            blockTimes: {
              average: stats.averageBlockTime,
              min: stats.minBlockTime === Infinity ? 0 : stats.minBlockTime,
              max: stats.maxBlockTime,
              p50: stats.blockTimesP50,
              p95: stats.blockTimesP95,
              p99: stats.blockTimesP99,
            },
          },
          performance: {
            targetBlockTime: config.blockTimeMs,
            blockTimeDeviation: Math.abs(metrics.averageBlockTime - config.blockTimeMs),
            isOnTarget: metrics.averageBlockTime >= config.blockTimeMs * 0.95 && 
                        metrics.averageBlockTime <= config.blockTimeMs * 1.05,
          },
        },
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  app.get("/api/enterprise/scalability/metrics/prometheus", scalabilityLimiter, async (req: Request, res: Response) => {
    try {
      const orchestrator = getBlockchainOrchestrator();
      const metrics = orchestrator.getMetrics();
      const feeEngine = getAdaptiveFeeEngine();
      const feeMetrics = feeEngine.getMetrics();
      const batcher = getPersistenceBatcher();
      const batcherMetrics = batcher.getMetrics();
      
      const lines: string[] = [
        '# HELP tburn_blocks_produced_total Total number of blocks produced',
        '# TYPE tburn_blocks_produced_total counter',
        `tburn_blocks_produced_total ${metrics.blocksProduced}`,
        '',
        '# HELP tburn_failed_blocks_total Total number of failed blocks',
        '# TYPE tburn_failed_blocks_total counter',
        `tburn_failed_blocks_total ${metrics.failedBlocks}`,
        '',
        '# HELP tburn_average_block_time_ms Average block production time in milliseconds',
        '# TYPE tburn_average_block_time_ms gauge',
        `tburn_average_block_time_ms ${metrics.averageBlockTime}`,
        '',
        '# HELP tburn_block_time_p50_ms 50th percentile block time',
        '# TYPE tburn_block_time_p50_ms gauge',
        `tburn_block_time_p50_ms ${metrics.blockTimeP50}`,
        '',
        '# HELP tburn_block_time_p95_ms 95th percentile block time',
        '# TYPE tburn_block_time_p95_ms gauge',
        `tburn_block_time_p95_ms ${metrics.blockTimeP95}`,
        '',
        '# HELP tburn_block_time_p99_ms 99th percentile block time',
        '# TYPE tburn_block_time_p99_ms gauge',
        `tburn_block_time_p99_ms ${metrics.blockTimeP99}`,
        '',
        '# HELP tburn_network_congestion Network congestion score 0-100',
        '# TYPE tburn_network_congestion gauge',
        `tburn_network_congestion ${metrics.networkCongestion}`,
        '',
        '# HELP tburn_global_base_fee_wei Global base fee in wei',
        '# TYPE tburn_global_base_fee_wei gauge',
        `tburn_global_base_fee_wei ${feeMetrics.globalBaseFee}`,
        '',
        '# HELP tburn_persistence_flush_total Total persistence flushes',
        '# TYPE tburn_persistence_flush_total counter',
        `tburn_persistence_flush_total ${batcherMetrics.totalFlushes}`,
        '',
        '# HELP tburn_persistence_errors_total Total persistence errors',
        '# TYPE tburn_persistence_errors_total counter',
        `tburn_persistence_errors_total ${batcherMetrics.totalErrors}`,
        '',
        '# HELP tburn_uptime_seconds System uptime in seconds',
        '# TYPE tburn_uptime_seconds counter',
        `tburn_uptime_seconds ${metrics.uptimeSeconds}`,
        '',
        '# HELP tburn_circuit_breaker_trips_total Total circuit breaker trips',
        '# TYPE tburn_circuit_breaker_trips_total counter',
        `tburn_circuit_breaker_trips_total ${metrics.circuitBreakerTrips}`,
      ];
      
      res.set('Content-Type', 'text/plain; charset=utf-8');
      res.send(lines.join('\n'));
    } catch (error) {
      res.status(503).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  console.log("✅ Enterprise scalability routes registered");
}
