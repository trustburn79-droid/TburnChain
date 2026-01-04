/**
 * TBURN BFT Consensus API Routes
 * Enterprise-grade monitoring and control endpoints
 */

import { Router, Request, Response } from 'express';
import { consensusCoordinator } from '../core/consensus/consensus-coordinator';
import { enterpriseBFTEngine, ConsensusPhase } from '../core/consensus/enterprise-bft-engine';

const router = Router();

/**
 * GET /api/consensus/stats
 * Get comprehensive consensus statistics
 */
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const stats = consensusCoordinator.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('[ConsensusAPI] Error fetching stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch consensus stats' });
  }
});

/**
 * GET /api/consensus/metrics
 * Get BFT engine performance metrics
 */
router.get('/metrics', async (_req: Request, res: Response) => {
  try {
    const metrics = enterpriseBFTEngine.getMetrics();
    const health = consensusCoordinator.getHealthStatus();
    
    res.json({
      success: true,
      data: {
        metrics,
        health,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('[ConsensusAPI] Error fetching metrics:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch metrics' });
  }
});

/**
 * GET /api/consensus/phase
 * Get current consensus phase information
 */
router.get('/phase', async (_req: Request, res: Response) => {
  try {
    const phaseInfo = enterpriseBFTEngine.getPhaseInfo();
    const roundState = enterpriseBFTEngine.getRoundState();
    const breakdown = consensusCoordinator.getPhaseBreakdown();
    
    res.json({
      success: true,
      data: {
        current: {
          phase: phaseInfo.phase,
          phaseName: phaseInfo.phaseName,
          phaseTimeMs: phaseInfo.phaseTime,
          height: roundState.height,
          round: roundState.round
        },
        phases: [
          { number: 1, name: 'PROPOSE', description: 'Block proposal by designated validator', targetTimeMs: 20 },
          { number: 2, name: 'PREVOTE', description: 'Validators prevote on proposal validity', targetTimeMs: 20 },
          { number: 3, name: 'PRECOMMIT', description: 'Validators precommit after quorum prevotes', targetTimeMs: 20 },
          { number: 4, name: 'COMMIT', description: 'Final commit after quorum precommits', targetTimeMs: 20 },
          { number: 5, name: 'FINALIZE', description: 'Block finalization and state transition', targetTimeMs: 20 }
        ],
        breakdown,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('[ConsensusAPI] Error fetching phase info:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch phase info' });
  }
});

/**
 * GET /api/consensus/health
 * Get consensus system health status
 */
router.get('/health', async (_req: Request, res: Response) => {
  try {
    const health = consensusCoordinator.getHealthStatus();
    const metrics = enterpriseBFTEngine.getMetrics();
    
    const statusCode = health.status === 'healthy' ? 200 : 
                       health.status === 'degraded' ? 207 : 503;
    
    res.status(statusCode).json({
      success: health.status !== 'unhealthy',
      data: {
        status: health.status,
        score: health.score,
        details: health.details,
        performance: {
          successRate: metrics.quorumAchievementRate.toFixed(2) + '%',
          avgRoundTimeMs: metrics.avgRoundTimeMs.toFixed(2),
          p50LatencyMs: metrics.p50LatencyMs,
          p95LatencyMs: metrics.p95LatencyMs,
          p99LatencyMs: metrics.p99LatencyMs,
          viewChanges: metrics.viewChanges,
          participationRate: metrics.votingParticipationRate.toFixed(2) + '%'
        },
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('[ConsensusAPI] Error fetching health:', error);
    res.status(503).json({ success: false, error: 'Failed to fetch health status' });
  }
});

/**
 * GET /api/consensus/round
 * Get current round state details
 */
router.get('/round', async (_req: Request, res: Response) => {
  try {
    const roundState = enterpriseBFTEngine.getRoundState();
    
    res.json({
      success: true,
      data: {
        height: roundState.height,
        round: roundState.round,
        phase: ConsensusPhase[roundState.phase],
        proposer: roundState.proposer,
        lockedRound: roundState.lockedRound,
        lockedBlockHash: roundState.lockedBlockHash,
        validRound: roundState.validRound,
        validBlockHash: roundState.validBlockHash,
        votes: {
          prevotes: roundState.prevotes.size,
          precommits: roundState.precommits.size,
          commits: roundState.commits.size
        },
        timing: {
          startTime: roundState.startTime,
          elapsedMs: Date.now() - roundState.startTime,
          phaseStartTimes: roundState.phaseStartTimes
        },
        proposal: roundState.proposal ? {
          blockHash: roundState.proposal.blockHash,
          parentHash: roundState.proposal.parentHash,
          timestamp: roundState.proposal.timestamp
        } : null,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('[ConsensusAPI] Error fetching round state:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch round state' });
  }
});

/**
 * GET /api/consensus/blocks/recent
 * Get recent finalized blocks
 */
router.get('/blocks/recent', async (_req: Request, res: Response) => {
  try {
    const stats = consensusCoordinator.getStats();
    
    res.json({
      success: true,
      data: {
        currentHeight: stats.currentHeight,
        recentBlocks: stats.recentBlocks,
        avgRoundTimeMs: stats.metrics.avgRoundTimeMs,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('[ConsensusAPI] Error fetching recent blocks:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch recent blocks' });
  }
});

/**
 * GET /api/consensus/tps
 * Get current TPS metrics
 */
router.get('/tps', async (_req: Request, res: Response) => {
  try {
    const metrics = enterpriseBFTEngine.getMetrics();
    
    res.json({
      success: true,
      data: {
        currentTPS: Math.round(metrics.currentTPS),
        peakTPS: Math.round(metrics.peakTPS),
        totalTransactions: metrics.totalTransactions,
        lastBlockHeight: metrics.lastBlockHeight,
        lastBlockTime: metrics.lastBlockTime,
        avgBlockTimeMs: metrics.avgRoundTimeMs,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('[ConsensusAPI] Error fetching TPS:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch TPS metrics' });
  }
});

/**
 * GET /api/consensus/config
 * Get consensus configuration
 */
router.get('/config', async (_req: Request, res: Response) => {
  try {
    const config = consensusCoordinator.getConfig();
    const stats = consensusCoordinator.getStats();
    
    res.json({
      success: true,
      data: {
        config: {
          blockTimeMs: config.blockTimeMs,
          phaseTimeoutMs: config.phaseTimeoutMs,
          viewChangeTimeoutMs: config.viewChangeTimeoutMs,
          maxRoundsPerHeight: config.maxRoundsPerHeight,
          quorum: `${config.quorumNumerator}/${config.quorumDenominator}`
        },
        validators: {
          active: stats.activeValidators,
          totalVotingPower: stats.totalVotingPower,
          quorumThreshold: stats.quorumThreshold
        },
        protocol: {
          name: 'TBURN BFT',
          version: '2.0.0',
          phases: 5,
          phaseNames: ['PROPOSE', 'PREVOTE', 'PRECOMMIT', 'COMMIT', 'FINALIZE'],
          features: [
            'Lock-based consensus safety',
            'View change protocol',
            'Optimistic responsiveness',
            'Aggregated signatures',
            'Parallel vote processing'
          ]
        },
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('[ConsensusAPI] Error fetching config:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch consensus config' });
  }
});

/**
 * GET /api/consensus/summary
 * Get a comprehensive summary for dashboard display
 */
router.get('/summary', async (_req: Request, res: Response) => {
  try {
    const stats = consensusCoordinator.getStats();
    const health = consensusCoordinator.getHealthStatus();
    const phaseInfo = enterpriseBFTEngine.getPhaseInfo();
    const metrics = stats.metrics;
    
    res.json({
      success: true,
      data: {
        status: {
          health: health.status,
          healthScore: health.score,
          isRunning: consensusCoordinator.isActive(),
          currentHeight: stats.currentHeight,
          currentRound: stats.currentRound,
          currentPhase: stats.currentPhase
        },
        performance: {
          successRate: metrics.quorumAchievementRate.toFixed(2),
          avgRoundTimeMs: Math.round(metrics.avgRoundTimeMs),
          p50LatencyMs: metrics.p50LatencyMs,
          p95LatencyMs: metrics.p95LatencyMs,
          p99LatencyMs: metrics.p99LatencyMs,
          viewChanges: metrics.viewChanges,
          totalRounds: metrics.totalRounds
        },
        throughput: {
          currentTPS: Math.round(metrics.currentTPS),
          peakTPS: Math.round(metrics.peakTPS),
          totalTransactions: metrics.totalTransactions,
          blocksProduced: stats.currentHeight
        },
        validators: {
          active: stats.activeValidators,
          totalVotingPower: stats.totalVotingPower,
          participationRate: metrics.votingParticipationRate.toFixed(2)
        },
        phases: {
          current: phaseInfo.phaseName,
          phaseTimeMs: phaseInfo.phaseTime,
          avgPhaseTimes: metrics.avgPhaseTimesMs.slice(1, 6).map(t => Math.round(t))
        },
        recentBlocks: stats.recentBlocks.slice(-5).map(b => ({
          height: b.height,
          hash: b.hash.substring(0, 18) + '...',
          timeMs: b.roundTimeMs
        })),
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('[ConsensusAPI] Error fetching summary:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch consensus summary' });
  }
});

export default router;
