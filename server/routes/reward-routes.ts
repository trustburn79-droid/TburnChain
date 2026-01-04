/**
 * TBURN Enterprise Reward Distribution API Routes
 * Production-grade REST API for reward management
 * 
 * Endpoints:
 * - GET  /api/rewards/status - Engine status and metrics
 * - GET  /api/rewards/statistics - Detailed statistics
 * - GET  /api/rewards/epoch/:epoch - Epoch summary
 * - GET  /api/rewards/epoch/:epoch/gas - Epoch gas metrics
 * - GET  /api/rewards/validator/:id - Validator rewards
 * - GET  /api/rewards/validator/:id/pending - Pending rewards
 * - GET  /api/rewards/validator/:id/history - Reward history
 * - POST /api/rewards/calculate - Calculate block rewards
 * - POST /api/rewards/epoch/start - Start new epoch
 * - POST /api/rewards/epoch/finalize - Finalize epoch
 * - POST /api/rewards/process-batch - Process reward batch
 * - POST /api/rewards/staking/calculate - Calculate staking rewards
 * - POST /api/rewards/cleanup - Cleanup old data
 */

import { Router, Request, Response } from 'express';
import { 
  enterpriseRewardEngine,
  ValidatorReward,
  EpochRewardSummary
} from '../core/rewards/enterprise-reward-distribution-engine';

const router = Router();

// ============================================
// STATUS & STATISTICS
// ============================================

/**
 * GET /api/rewards/status
 * Get reward engine status and basic metrics
 */
router.get('/status', (_req: Request, res: Response) => {
  try {
    const stats = enterpriseRewardEngine.getStatistics();
    
    res.json({
      success: true,
      data: {
        status: 'operational',
        currentEpoch: stats.currentEpoch,
        circuitBreaker: stats.circuitBreakerStatus,
        metrics: {
          totalDistributed: stats.totalDistributed,
          totalBurned: stats.totalBurned,
          totalGasCollected: stats.totalGasCollected,
          completedEpochs: stats.completedEpochs,
          pendingRewards: stats.pendingRewards,
          batchesProcessed: stats.batchesProcessed,
          rewardsCalculated: stats.rewardsCalculated
        },
        gasPrice: {
          ewma: stats.ewmaGasPrice
        }
      },
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    });
  }
});

/**
 * GET /api/rewards/statistics
 * Get detailed reward statistics
 */
router.get('/statistics', (_req: Request, res: Response) => {
  try {
    const metrics = enterpriseRewardEngine.getDetailedMetrics();
    
    res.json({
      success: true,
      data: {
        config: {
          proposerShare: metrics.config.proposerShare,
          verifierShare: metrics.config.verifierShare,
          burnShare: metrics.config.burnShare,
          blocksPerEpoch: metrics.config.blocksPerEpoch,
          baseApy: metrics.config.baseApy
        },
        epochs: metrics.epochMetrics,
        validators: metrics.validatorMetrics,
        gas: metrics.gasMetrics,
        processing: metrics.processingMetrics,
        health: {
          circuitBreakerOpen: metrics.healthMetrics.circuitBreaker.isOpen,
          failureCount: metrics.healthMetrics.circuitBreaker.failureCount,
          walEntries: metrics.healthMetrics.walEntries,
          historySize: metrics.healthMetrics.rewardHistorySize
        }
      },
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    });
  }
});

// ============================================
// EPOCH MANAGEMENT
// ============================================

/**
 * GET /api/rewards/epoch/:epoch
 * Get epoch summary
 */
router.get('/epoch/:epoch', (req: Request, res: Response) => {
  try {
    const epochNumber = parseInt(req.params.epoch);
    
    if (isNaN(epochNumber)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid epoch number',
        timestamp: Date.now()
      });
    }

    const summary = enterpriseRewardEngine.getEpochSummary(epochNumber);
    
    if (!summary) {
      return res.status(404).json({
        success: false,
        error: `Epoch ${epochNumber} not found`,
        timestamp: Date.now()
      });
    }

    // Convert Map to object for JSON serialization
    const validatorRewardsObj: Record<string, any> = {};
    summary.validatorRewards.forEach((reward, validatorId) => {
      validatorRewardsObj[validatorId] = {
        blocksProposed: reward.blocksProposed,
        blocksVerified: reward.blocksVerified,
        proposerRewards: reward.proposerRewards.toString(),
        verifierRewards: reward.verifierRewards.toString(),
        totalReward: reward.totalReward.toString(),
        performanceScore: reward.performanceScore
      };
    });

    res.json({
      success: true,
      data: {
        epochNumber: summary.epochNumber,
        config: {
          startBlock: summary.epochConfig.startBlock,
          endBlock: summary.epochConfig.endBlock,
          blocksPerEpoch: summary.epochConfig.blocksPerEpoch
        },
        blocks: {
          total: summary.totalBlocks,
          missed: summary.missedBlocks,
          productionRate: summary.blockProductionRate
        },
        rewards: {
          proposerTotal: summary.totalProposerRewards.toString(),
          verifierTotal: summary.totalVerifierRewards.toString(),
          burned: summary.totalBurned.toString(),
          distributed: summary.totalDistributed.toString()
        },
        gas: {
          totalUsed: summary.totalGasUsed.toString(),
          totalFees: summary.totalGasFees.toString(),
          avgPrice: summary.avgGasPrice.toString()
        },
        timing: {
          avgBlockTime: summary.avgBlockTime,
          maxBlockTime: summary.maxBlockTime,
          minBlockTime: summary.minBlockTime
        },
        status: summary.status,
        finalizedAt: summary.finalizedAt,
        validatorCount: Object.keys(validatorRewardsObj).length,
        validatorRewards: validatorRewardsObj
      },
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    });
  }
});

/**
 * GET /api/rewards/epoch/:epoch/gas
 * Get epoch gas accumulator details
 */
router.get('/epoch/:epoch/gas', (req: Request, res: Response) => {
  try {
    const epochNumber = parseInt(req.params.epoch);
    
    if (isNaN(epochNumber)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid epoch number',
        timestamp: Date.now()
      });
    }

    const gasAcc = enterpriseRewardEngine.getGasAccumulator(epochNumber);
    
    if (!gasAcc) {
      return res.status(404).json({
        success: false,
        error: `Gas accumulator for epoch ${epochNumber} not found`,
        timestamp: Date.now()
      });
    }

    res.json({
      success: true,
      data: {
        epochNumber: gasAcc.epochNumber,
        totalFees: gasAcc.totalFees.toString(),
        totalGasUsed: gasAcc.totalGasUsed.toString(),
        transactionCount: gasAcc.transactionCount,
        pricing: {
          avgGasPrice: gasAcc.avgGasPrice.toString(),
          maxGasPrice: gasAcc.maxGasPrice.toString(),
          minGasPrice: gasAcc.minGasPrice.toString(),
          baseFee: gasAcc.baseFee.toString(),
          priorityFees: gasAcc.priorityFees.toString()
        },
        blockCount: gasAcc.feesByBlock.size
      },
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    });
  }
});

/**
 * POST /api/rewards/epoch/start
 * Start a new epoch
 */
router.post('/epoch/start', (req: Request, res: Response) => {
  try {
    const { epochNumber, startBlock } = req.body;
    
    if (typeof epochNumber !== 'number' || typeof startBlock !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Missing epochNumber or startBlock',
        timestamp: Date.now()
      });
    }

    const epochConfig = enterpriseRewardEngine.startNewEpoch(epochNumber, startBlock);

    res.json({
      success: true,
      data: {
        epochNumber: epochConfig.epochNumber,
        startBlock: epochConfig.startBlock,
        endBlock: epochConfig.endBlock,
        blocksPerEpoch: epochConfig.blocksPerEpoch,
        targetBlockTime: epochConfig.targetBlockTime,
        startTimestamp: epochConfig.startTimestamp
      },
      message: `Epoch ${epochNumber} started at block ${startBlock}`,
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    });
  }
});

/**
 * POST /api/rewards/epoch/finalize
 * Finalize an epoch
 */
router.post('/epoch/finalize', (req: Request, res: Response) => {
  try {
    const { epochNumber, endBlock } = req.body;
    
    if (typeof epochNumber !== 'number' || typeof endBlock !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Missing epochNumber or endBlock',
        timestamp: Date.now()
      });
    }

    const summary = enterpriseRewardEngine.finalizeEpoch(epochNumber, endBlock);

    res.json({
      success: true,
      data: {
        epochNumber: summary.epochNumber,
        status: summary.status,
        totalBlocks: summary.totalBlocks,
        totalDistributed: summary.totalDistributed.toString(),
        totalBurned: summary.totalBurned.toString(),
        validatorCount: summary.validatorRewards.size,
        finalizedAt: summary.finalizedAt
      },
      message: `Epoch ${epochNumber} finalized`,
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    });
  }
});

// ============================================
// VALIDATOR REWARDS
// ============================================

/**
 * GET /api/rewards/validator/:id
 * Get validator reward summary
 */
router.get('/validator/:id', (req: Request, res: Response) => {
  try {
    const validatorId = req.params.id;
    
    const pendingRewards = enterpriseRewardEngine.getValidatorPendingRewards(validatorId);
    const totalRewards = enterpriseRewardEngine.getValidatorTotalRewards(validatorId);
    const recentHistory = enterpriseRewardEngine.getValidatorRewardHistory(validatorId, 10);

    res.json({
      success: true,
      data: {
        validatorId,
        rewards: {
          pending: pendingRewards.toString(),
          total: totalRewards.toString()
        },
        recentActivity: recentHistory.map(r => ({
          id: r.id,
          epochNumber: r.epochNumber,
          blockNumber: r.blockNumber,
          rewardType: r.rewardType,
          totalReward: r.totalReward.toString(),
          status: r.status,
          calculatedAt: r.calculatedAt,
          distributedAt: r.distributedAt
        }))
      },
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    });
  }
});

/**
 * GET /api/rewards/validator/:id/pending
 * Get validator pending rewards
 */
router.get('/validator/:id/pending', (req: Request, res: Response) => {
  try {
    const validatorId = req.params.id;
    const pendingRewards = enterpriseRewardEngine.getValidatorPendingRewards(validatorId);

    res.json({
      success: true,
      data: {
        validatorId,
        pendingRewards: pendingRewards.toString(),
        pendingRewardsTBURN: (Number(pendingRewards) / 1e18).toFixed(4)
      },
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    });
  }
});

/**
 * GET /api/rewards/validator/:id/history
 * Get validator reward history
 */
router.get('/validator/:id/history', (req: Request, res: Response) => {
  try {
    const validatorId = req.params.id;
    const limit = parseInt(req.query.limit as string) || 100;
    
    const history = enterpriseRewardEngine.getValidatorRewardHistory(validatorId, limit);

    res.json({
      success: true,
      data: {
        validatorId,
        count: history.length,
        rewards: history.map(r => ({
          id: r.id,
          epochNumber: r.epochNumber,
          blockNumber: r.blockNumber,
          rewardType: r.rewardType,
          baseReward: r.baseReward.toString(),
          gasReward: r.gasReward.toString(),
          performanceBonus: r.performanceBonus.toString(),
          totalReward: r.totalReward.toString(),
          status: r.status,
          priority: r.priority,
          calculatedAt: r.calculatedAt,
          distributedAt: r.distributedAt,
          batchId: r.batchId
        }))
      },
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    });
  }
});

// ============================================
// REWARD CALCULATION
// ============================================

/**
 * POST /api/rewards/calculate
 * Calculate block rewards
 */
router.post('/calculate', (req: Request, res: Response) => {
  try {
    const {
      blockNumber,
      proposerAddress,
      proposerId,
      verifiers,
      gasUsed,
      gasPrice,
      performanceScores
    } = req.body;

    if (!blockNumber || !proposerAddress || !proposerId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: blockNumber, proposerAddress, proposerId',
        timestamp: Date.now()
      });
    }

    // Convert performance scores to Map
    const perfScoresMap = new Map<string, number>(
      Object.entries(performanceScores || {}).map(([k, v]) => [k, v as number])
    );

    // Calculate rewards
    const rewards = enterpriseRewardEngine.calculateBlockRewards(
      blockNumber,
      proposerAddress,
      proposerId,
      verifiers || [],
      BigInt(gasUsed || '0'),
      BigInt(gasPrice || '1000000000'),
      perfScoresMap
    );

    res.json({
      success: true,
      data: {
        blockNumber,
        rewardsCalculated: rewards.length,
        rewards: rewards.map(r => ({
          validatorId: r.validatorId,
          rewardType: r.rewardType,
          baseReward: r.baseReward.toString(),
          gasReward: r.gasReward.toString(),
          performanceBonus: r.performanceBonus.toString(),
          totalReward: r.totalReward.toString(),
          status: r.status
        })),
        totalDistributed: rewards.reduce((sum, r) => sum + r.totalReward, BigInt(0)).toString()
      },
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    });
  }
});

/**
 * POST /api/rewards/staking/calculate
 * Calculate staking rewards for delegators
 */
router.post('/staking/calculate', (req: Request, res: Response) => {
  try {
    const { delegations, epochNumber } = req.body;

    if (!delegations || !Array.isArray(delegations)) {
      return res.status(400).json({
        success: false,
        error: 'Missing delegations array',
        timestamp: Date.now()
      });
    }

    // Convert staked amounts to bigint
    const convertedDelegations = delegations.map((d: any) => ({
      delegatorAddress: d.delegatorAddress,
      validatorAddress: d.validatorAddress,
      validatorId: d.validatorId,
      stakedAmount: BigInt(d.stakedAmount || '0'),
      validatorCommission: d.validatorCommission || 500
    }));

    const rewards = enterpriseRewardEngine.calculateStakingRewards(
      convertedDelegations,
      epochNumber || enterpriseRewardEngine.getCurrentEpoch()
    );

    res.json({
      success: true,
      data: {
        epochNumber: epochNumber || enterpriseRewardEngine.getCurrentEpoch(),
        delegationsProcessed: rewards.length,
        rewards: rewards.map(r => ({
          delegatorAddress: r.delegatorAddress,
          validatorAddress: r.validatorAddress,
          rewardAmount: r.rewardAmount.toString(),
          commissionPaid: r.commissionPaid.toString(),
          netReward: r.netReward.toString(),
          apy: r.apy
        })),
        totalRewards: rewards.reduce((sum, r) => sum + r.rewardAmount, BigInt(0)).toString()
      },
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    });
  }
});

// ============================================
// BATCH PROCESSING
// ============================================

/**
 * POST /api/rewards/batch/start
 * Start batch processing
 */
router.post('/batch/start', (_req: Request, res: Response) => {
  try {
    enterpriseRewardEngine.startBatchProcessing();
    
    res.json({
      success: true,
      message: 'Batch processing started',
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    });
  }
});

/**
 * POST /api/rewards/batch/stop
 * Stop batch processing
 */
router.post('/batch/stop', (_req: Request, res: Response) => {
  try {
    enterpriseRewardEngine.stopBatchProcessing();
    
    res.json({
      success: true,
      message: 'Batch processing stopped',
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    });
  }
});

/**
 * GET /api/rewards/batch/:id
 * Get batch status
 */
router.get('/batch/:id', (req: Request, res: Response) => {
  try {
    const batchId = req.params.id;
    const batch = enterpriseRewardEngine.getBatchStatus(batchId);

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: `Batch ${batchId} not found`,
        timestamp: Date.now()
      });
    }

    res.json({
      success: true,
      data: {
        batchId: batch.batchId,
        epochNumber: batch.epochNumber,
        rewardCount: batch.rewards.length,
        totalAmount: batch.totalAmount.toString(),
        priority: batch.priority,
        status: batch.status,
        createdAt: batch.createdAt,
        processedAt: batch.processedAt,
        txHashes: batch.txHashes,
        retryCount: batch.retryCount,
        error: batch.error
      },
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    });
  }
});

// ============================================
// MAINTENANCE & RECOVERY
// ============================================

/**
 * POST /api/rewards/validation/mode
 * Set validator validation mode (strict or graceful)
 */
router.post('/validation/mode', (req: Request, res: Response) => {
  try {
    const { strict } = req.body;
    
    if (typeof strict !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid "strict" boolean field',
        timestamp: Date.now()
      });
    }

    enterpriseRewardEngine.setStrictValidation(strict);
    
    res.json({
      success: true,
      data: {
        mode: strict ? 'strict' : 'graceful'
      },
      message: `Validator validation mode set to ${strict ? 'STRICT' : 'GRACEFUL'}`,
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    });
  }
});

/**
 * POST /api/rewards/wal/replay
 * Replay pending WAL entries for crash recovery
 */
router.post('/wal/replay', (_req: Request, res: Response) => {
  try {
    const result = enterpriseRewardEngine.replayWriteAheadLog();
    
    res.json({
      success: true,
      data: result,
      message: `WAL replay complete: ${result.replayed} replayed, ${result.failed} failed, ${result.skipped} skipped`,
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    });
  }
});

/**
 * GET /api/rewards/wal/stats
 * Get WAL statistics
 */
router.get('/wal/stats', (_req: Request, res: Response) => {
  try {
    const stats = enterpriseRewardEngine.getWALStats();
    
    res.json({
      success: true,
      data: stats,
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    });
  }
});

/**
 * POST /api/rewards/cleanup
 * Cleanup old data
 */
router.post('/cleanup', (req: Request, res: Response) => {
  try {
    const keepEpochs = parseInt(req.body.keepEpochs) || 100;
    const result = enterpriseRewardEngine.cleanupOldData(keepEpochs);

    res.json({
      success: true,
      data: {
        epochsCleaned: result.epochsCleaned,
        batchesCleaned: result.batchesCleaned,
        walEntriesCleaned: result.walEntriesCleaned
      },
      message: 'Cleanup completed',
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    });
  }
});

export { router as rewardRoutes };
export default router;
