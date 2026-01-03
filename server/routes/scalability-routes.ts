import type { Express, Request, Response } from "express";
import { getBlockchainOrchestrator } from "../services/blockchain-orchestrator";
import { getPersistenceBatcher } from "../services/persistence-batcher";
import { getAdaptiveFeeEngine } from "../core/fees/adaptive-fee-engine";

export function registerScalabilityRoutes(app: Express): void {
  
  app.get("/api/enterprise/scalability/status", async (req: Request, res: Response) => {
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
          systemHealth: {
            workerThreadsEnabled: !!status.workerPool,
            batchPersistenceEnabled: !!status.persistenceBatcher,
            adaptiveFeesEnabled: !!status.feeEngine,
            overallStatus: 'healthy',
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  app.get("/api/enterprise/scalability/worker-pool", async (req: Request, res: Response) => {
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
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  app.get("/api/enterprise/scalability/persistence", async (req: Request, res: Response) => {
    try {
      const batcher = getPersistenceBatcher();
      const metrics = batcher.getMetrics();
      
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
            pending: {
              blocks: metrics.pendingBlocks,
              consensusRounds: metrics.pendingConsensusRounds,
              shardMetrics: metrics.pendingShardMetrics,
              crossShardMessages: metrics.pendingCrossShardMessages,
              networkMetrics: metrics.pendingNetworkMetrics,
            },
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  app.get("/api/enterprise/scalability/gas-fees", async (req: Request, res: Response) => {
    try {
      const feeEngine = getAdaptiveFeeEngine();
      const metrics = feeEngine.getMetrics();
      const shardFees = feeEngine.getAllShardFees();
      
      const shardFeesArray: Array<{
        shardId: number;
        baseFee: string;
        utilization: number;
        pending: number;
      }> = [];
      
      shardFees.forEach((value, key) => {
        shardFeesArray.push({
          shardId: key,
          ...value,
        });
      });
      
      res.json({
        success: true,
        data: {
          globalBaseFee: metrics.globalBaseFee,
          globalBaseFeeGwei: (BigInt(metrics.globalBaseFee) / BigInt('1000000000')).toString(),
          congestionScore: metrics.congestionScore,
          totalShards: metrics.totalShards,
          totalPendingTransactions: metrics.totalPendingTransactions,
          metrics: {
            totalFeeCalculations: metrics.totalFeeCalculations,
            baseFeeUpdates: metrics.baseFeeUpdates,
            backpressureEvents: metrics.backpressureEvents,
            harmonizationAdjustments: metrics.harmonizationAdjustments,
          },
          shardFees: shardFeesArray,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  app.get("/api/enterprise/scalability/fee-estimate/:shardId", async (req: Request, res: Response) => {
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
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  app.get("/api/enterprise/scalability/block-production", async (req: Request, res: Response) => {
    try {
      const orchestrator = getBlockchainOrchestrator();
      const metrics = orchestrator.getMetrics();
      
      res.json({
        success: true,
        data: {
          currentBlockHeight: orchestrator.getCurrentBlockHeight(),
          currentEpoch: orchestrator.getCurrentEpoch(),
          blocksProduced: metrics.blocksProduced,
          consensusRoundsCompleted: metrics.consensusRoundsCompleted,
          crossShardMessagesProcessed: metrics.crossShardMessagesProcessed,
          averageBlockTime: metrics.averageBlockTime,
          targetBlockTime: 100,
          blockTimeDeviation: Math.abs(metrics.averageBlockTime - 100),
          isOnTarget: metrics.averageBlockTime >= 95 && metrics.averageBlockTime <= 105,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  console.log("✅ Enterprise scalability routes registered");
}
