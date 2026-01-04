/**
 * Block Production API Routes
 * Real-time monitoring endpoints for enterprise block production
 */

import { Router, Request, Response } from 'express';
import {
  getEnterpriseBlockEngine,
  BlockState,
  CircuitState
} from '../core/block-production';

const router = Router();

/**
 * GET /api/block-production/metrics
 * Get current block production metrics
 */
router.get('/metrics', (req: Request, res: Response) => {
  try {
    const engine = getEnterpriseBlockEngine();
    const metrics = engine.getMetrics();
    
    res.json({
      success: true,
      data: {
        production: {
          blocksProduced: metrics.blocksProduced,
          blocksVerified: metrics.blocksVerified,
          blocksFinalized: metrics.blocksFinalized,
          blocksRejected: metrics.blocksRejected
        },
        performance: {
          avgBlockTimeMs: Math.round(metrics.avgBlockTimeMs),
          p50LatencyMs: Math.round(metrics.p50LatencyMs),
          p95LatencyMs: Math.round(metrics.p95LatencyMs),
          p99LatencyMs: Math.round(metrics.p99LatencyMs),
          targetBlockTimeMs: 100
        },
        throughput: {
          currentTps: metrics.currentTps,
          peakTps: metrics.peakTps
        },
        status: {
          circuitState: metrics.circuitState,
          lastBlockHeight: metrics.lastBlockHeight,
          lastBlockTimestamp: metrics.lastBlockTimestamp,
          pendingBlocks: metrics.pendingBlocks,
          verificationQueueSize: metrics.verificationQueueSize,
          isActive: engine.isActive()
        }
      },
      timestamp: Date.now()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/block-production/blocks/recent
 * Get recent produced blocks
 */
router.get('/blocks/recent', (req: Request, res: Response) => {
  try {
    const engine = getEnterpriseBlockEngine();
    const count = Math.min(parseInt(req.query.count as string) || 10, 100);
    const blocks = engine.getRecentBlocks(count);
    
    res.json({
      success: true,
      data: blocks.map(b => ({
        height: b.height,
        hash: b.hash,
        parentHash: b.parentHash,
        timestamp: b.timestamp,
        proposer: b.proposerAddress,
        transactionCount: b.transactionCount,
        gasUsed: b.gasUsed.toString(),
        size: b.size,
        shardId: b.shardId,
        state: b.state,
        createdAt: b.createdAt,
        verifiedAt: b.verifiedAt,
        finalizedAt: b.finalizedAt,
        signatureCount: b.verificationSignatures.length,
        votingPowerConfirmed: b.votingPowerConfirmed.toString(),
        requiredQuorum: b.requiredQuorum.toString()
      })),
      count: blocks.length,
      timestamp: Date.now()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/block-production/blocks/:height
 * Get specific block by height
 */
router.get('/blocks/:height', (req: Request, res: Response) => {
  try {
    const engine = getEnterpriseBlockEngine();
    const height = parseInt(req.params.height);
    
    if (isNaN(height)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid block height'
      });
    }
    
    const block = engine.getBlock(height);
    
    if (!block) {
      return res.status(404).json({
        success: false,
        error: `Block ${height} not found`
      });
    }
    
    res.json({
      success: true,
      data: {
        height: block.height,
        hash: block.hash,
        parentHash: block.parentHash,
        stateRoot: block.stateRoot,
        receiptsRoot: block.receiptsRoot,
        timestamp: block.timestamp,
        proposer: block.proposerAddress,
        transactionCount: block.transactionCount,
        gasUsed: block.gasUsed.toString(),
        size: block.size,
        shardId: block.shardId,
        state: block.state,
        createdAt: block.createdAt,
        verifiedAt: block.verifiedAt,
        finalizedAt: block.finalizedAt,
        signatures: block.verificationSignatures,
        votingPowerConfirmed: block.votingPowerConfirmed.toString(),
        requiredQuorum: block.requiredQuorum.toString()
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/block-production/blocks/state/:state
 * Get blocks by state (pending, verified, finalized, rejected)
 */
router.get('/blocks/state/:state', (req: Request, res: Response) => {
  try {
    const engine = getEnterpriseBlockEngine();
    const stateParam = req.params.state.toLowerCase();
    
    const stateMap: Record<string, BlockState> = {
      'pending': BlockState.PENDING,
      'verified': BlockState.VERIFIED,
      'finalized': BlockState.FINALIZED,
      'rejected': BlockState.REJECTED
    };
    
    const state = stateMap[stateParam];
    if (!state) {
      return res.status(400).json({
        success: false,
        error: `Invalid state. Must be one of: ${Object.keys(stateMap).join(', ')}`
      });
    }
    
    const blocks = engine.getBlocksByState(state);
    
    res.json({
      success: true,
      data: blocks.map(b => ({
        height: b.height,
        hash: b.hash,
        timestamp: b.timestamp,
        transactionCount: b.transactionCount,
        state: b.state
      })),
      state: stateParam,
      count: blocks.length,
      timestamp: Date.now()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/block-production/health
 * Health check for block production system
 */
router.get('/health', (req: Request, res: Response) => {
  try {
    const engine = getEnterpriseBlockEngine();
    const metrics = engine.getMetrics();
    
    const isHealthy = engine.isActive() && 
                      metrics.circuitState === CircuitState.CLOSED &&
                      metrics.avgBlockTimeMs < 150;
    
    const status = {
      healthy: isHealthy,
      checks: {
        engineActive: engine.isActive(),
        circuitClosed: metrics.circuitState === CircuitState.CLOSED,
        blockTimeNormal: metrics.avgBlockTimeMs < 150,
        noPendingBacklog: metrics.pendingBlocks < 100
      },
      circuitState: metrics.circuitState,
      avgBlockTimeMs: Math.round(metrics.avgBlockTimeMs),
      pendingBlocks: metrics.pendingBlocks
    };
    
    res.status(isHealthy ? 200 : 503).json({
      success: true,
      data: status,
      timestamp: Date.now()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/block-production/stats
 * Get production statistics summary
 */
router.get('/stats', (req: Request, res: Response) => {
  try {
    const engine = getEnterpriseBlockEngine();
    const metrics = engine.getMetrics();
    const recentBlocks = engine.getRecentBlocks(100);
    
    const totalTx = recentBlocks.reduce((sum, b) => sum + b.transactionCount, 0);
    const avgTxPerBlock = recentBlocks.length > 0 
      ? Math.round(totalTx / recentBlocks.length) 
      : 0;
    
    const gasUsed = recentBlocks.reduce((sum, b) => sum + b.gasUsed, BigInt(0));
    
    res.json({
      success: true,
      data: {
        summary: {
          currentHeight: metrics.lastBlockHeight,
          blocksProduced: metrics.blocksProduced,
          blocksFinalized: metrics.blocksFinalized,
          finalizationRate: metrics.blocksProduced > 0
            ? ((metrics.blocksFinalized / metrics.blocksProduced) * 100).toFixed(2) + '%'
            : '0%'
        },
        recentPerformance: {
          blocksAnalyzed: recentBlocks.length,
          totalTransactions: totalTx,
          avgTransactionsPerBlock: avgTxPerBlock,
          totalGasUsed: gasUsed.toString(),
          avgGasPerBlock: recentBlocks.length > 0
            ? (gasUsed / BigInt(recentBlocks.length)).toString()
            : '0'
        },
        latency: {
          p50: metrics.p50LatencyMs,
          p95: metrics.p95LatencyMs,
          p99: metrics.p99LatencyMs,
          average: Math.round(metrics.avgBlockTimeMs)
        },
        throughput: {
          currentTps: metrics.currentTps,
          peakTps: metrics.peakTps,
          estimatedDailyBlocks: 864000 // 10 blocks/second * 86400 seconds
        }
      },
      timestamp: Date.now()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
