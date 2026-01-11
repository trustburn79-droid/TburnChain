/**
 * TBURN Enterprise External Validator API Routes
 * Production-grade REST API for external validator management
 */

import { Router, Request, Response } from 'express';
import { 
  externalValidatorEngine, 
  RegistrationRequest, 
  HeartbeatRequest,
  ExternalValidatorTier,
  ValidatorRegion 
} from '../core/validators/enterprise-external-validator-engine';

const router = Router();

const WEI_PER_TBURN = 10n ** 18n;

function formatValidatorResponse(validator: any) {
  return {
    nodeId: validator.nodeId,
    operatorAddress: validator.operatorAddress,
    operatorName: validator.operatorName,
    region: validator.region,
    status: validator.status,
    tier: validator.tier,
    connection: {
      isConnected: validator.connectionState.isConnected,
      latencyMs: validator.connectionState.latencyMs,
      protocol: validator.connectionState.protocol,
    },
    stake: {
      selfStake: (validator.stakeInfo.selfStake / WEI_PER_TBURN).toString(),
      delegatedStake: (validator.stakeInfo.delegatedStake / WEI_PER_TBURN).toString(),
      totalStake: (validator.stakeInfo.totalStake / WEI_PER_TBURN).toString(),
      commission: validator.stakeInfo.commission,
    },
    performance: {
      blocksProposed: validator.performanceMetrics.blocksProposed,
      blocksVerified: validator.performanceMetrics.blocksVerified,
      blocksMissed: validator.performanceMetrics.blocksMissed,
      uptime: validator.performanceMetrics.uptime,
      averageLatencyMs: validator.performanceMetrics.averageLatencyMs,
      successRate: validator.performanceMetrics.successRate,
    },
    rewards: {
      totalEarned: (validator.rewardInfo.totalEarned / WEI_PER_TBURN).toString(),
      pendingRewards: (validator.rewardInfo.pendingRewards / WEI_PER_TBURN).toString(),
      estimatedDailyReward: (validator.rewardInfo.estimatedDailyReward / WEI_PER_TBURN).toString(),
      estimatedApy: (validator.rewardInfo.estimatedApy * 100).toFixed(2) + '%',
    },
    healthScore: validator.healthScore,
    shardAssignment: validator.shardAssignment,
    capabilities: validator.capabilities,
    registrationTime: validator.registrationTime,
    lastHeartbeat: validator.lastHeartbeat,
  };
}

router.get('/network-stats', async (_req: Request, res: Response) => {
  try {
    const stats = externalValidatorEngine.getNetworkStats();
    res.json({
      success: true,
      data: {
        totalValidators: stats.totalValidators,
        activeValidators: stats.activeValidators,
        totalStaked: (BigInt(stats.totalStaked) / WEI_PER_TBURN).toString() + ' TBURN',
        averageHealthScore: stats.averageHealthScore,
        totalRewardsDistributed: (BigInt(stats.totalRewardsDistributed) / WEI_PER_TBURN).toString() + ' TBURN',
        averageApy: (stats.averageApy * 100).toFixed(2) + '%',
        tierCapacity: stats.tierCapacity,
        genesisValidators: 125,
        maxExternalValidators: 375,
        targetTps: 210000,
        blockTimeMs: 100,
      },
    });
  } catch (error) {
    console.error('[ExternalValidatorAPI] Network stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch network stats' });
  }
});

router.get('/tiers', async (_req: Request, res: Response) => {
  try {
    const tiers: ExternalValidatorTier[] = ['genesis', 'pioneer', 'standard', 'community'];
    const stats = externalValidatorEngine.getNetworkStats();
    
    const tierDetails = tiers.map(tier => {
      const guide = externalValidatorEngine.getSetupGuide(tier);
      const capacity = stats.tierCapacity[tier];
      
      return {
        tier,
        minStake: guide.requirements.minStake,
        maxCommission: guide.requirements.maxCommission,
        currentValidators: capacity.current,
        maxValidators: capacity.max,
        availableSlots: capacity.max - capacity.current,
        estimatedApy: tier === 'genesis' ? '25%' : tier === 'pioneer' ? '20%' : tier === 'standard' ? '15%' : '12%',
        benefits: tier === 'genesis' 
          ? ['Priority block production', 'Governance voting power', 'Premium support', 'Early access to features', 'Exclusive airdrops']
          : tier === 'pioneer'
          ? ['Enhanced block production', 'Governance participation', 'Priority support', 'Beta feature access']
          : tier === 'standard'
          ? ['Standard block production', 'Basic governance rights', 'Community support']
          : ['Community block production', 'Basic participation'],
      };
    });

    res.json({ success: true, data: tierDetails });
  } catch (error) {
    console.error('[ExternalValidatorAPI] Tiers error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tier information' });
  }
});

router.get('/setup-guide/:tier', async (req: Request, res: Response) => {
  try {
    const tier = req.params.tier as ExternalValidatorTier;
    const validTiers: ExternalValidatorTier[] = ['genesis', 'pioneer', 'standard', 'community'];
    
    if (!validTiers.includes(tier)) {
      return res.status(400).json({ success: false, error: 'Invalid tier specified' });
    }

    const guide = externalValidatorEngine.getSetupGuide(tier);
    res.json({ success: true, data: guide });
  } catch (error) {
    console.error('[ExternalValidatorAPI] Setup guide error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch setup guide' });
  }
});

router.get('/regions', async (_req: Request, res: Response) => {
  try {
    const regions: ValidatorRegion[] = [
      'us-east', 'us-west', 'eu-west', 'eu-central',
      'asia-east', 'asia-south', 'asia-southeast',
      'oceania', 'south-america', 'africa'
    ];

    const counts = externalValidatorEngine.getValidatorCount();
    
    const regionDetails = regions.map(region => ({
      region,
      displayName: region.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
      currentValidators: counts.byRegion[region] || 0,
      maxValidators: 20,
      availableSlots: 20 - (counts.byRegion[region] || 0),
    }));

    res.json({ success: true, data: regionDetails });
  } catch (error) {
    console.error('[ExternalValidatorAPI] Regions error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch region information' });
  }
});

router.post('/register', async (req: Request, res: Response) => {
  try {
    const registrationRequest: RegistrationRequest = {
      operatorAddress: req.body.operatorAddress,
      operatorName: req.body.operatorName,
      region: req.body.region,
      endpoints: {
        rpcUrl: req.body.endpoints?.rpcUrl || req.body.rpcUrl,
        wsUrl: req.body.endpoints?.wsUrl || req.body.wsUrl,
        p2pAddress: req.body.endpoints?.p2pAddress || req.body.p2pAddress,
        metricsUrl: req.body.endpoints?.metricsUrl,
        healthUrl: req.body.endpoints?.healthUrl,
      },
      stakeAmount: req.body.stakeAmount,
      commission: req.body.commission || 0.10,
      metadata: req.body.metadata,
      signature: req.body.signature || '',
      capabilities: req.body.capabilities,
    };

    const result = await externalValidatorEngine.registerValidator(registrationRequest);

    if (result.success) {
      res.status(201).json({
        success: true,
        data: {
          nodeId: result.nodeId,
          apiKey: result.apiKey,
          tier: result.tier,
          estimatedActivationBlock: result.estimatedActivation,
          message: result.message,
          nextSteps: [
            'Store your API key securely - it will not be shown again',
            'Complete stake deposit to activate your validator',
            'Configure your node with the provided nodeId',
            'Start sending heartbeats to maintain active status',
          ],
        },
      });
    } else {
      res.status(400).json({ success: false, error: result.message });
    }
  } catch (error) {
    console.error('[ExternalValidatorAPI] Registration error:', error);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

router.post('/heartbeat', async (req: Request, res: Response) => {
  try {
    const heartbeatRequest: HeartbeatRequest = {
      nodeId: req.body.nodeId,
      apiKey: req.body.apiKey || req.headers['x-api-key'] as string,
      timestamp: req.body.timestamp || Date.now(),
      metrics: {
        cpuUsage: req.body.metrics?.cpuUsage || 0,
        memoryUsage: req.body.metrics?.memoryUsage || 0,
        diskUsage: req.body.metrics?.diskUsage || 0,
        networkBandwidth: req.body.metrics?.networkBandwidth || 0,
        pendingTxCount: req.body.metrics?.pendingTxCount || 0,
        peerCount: req.body.metrics?.peerCount || 0,
        latestBlockHeight: req.body.metrics?.latestBlockHeight || 0,
        syncStatus: req.body.metrics?.syncStatus || 'synced',
      },
      version: req.body.version || '1.0.0',
    };

    const result = await externalValidatorEngine.processHeartbeat(heartbeatRequest);
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          serverTime: result.serverTime,
          nextHeartbeatMs: result.nextHeartbeatMs,
          commands: result.commands,
          shardUpdates: result.shardUpdates,
        },
      });
    } else {
      res.status(401).json({ success: false, error: 'Invalid authentication or rate limited' });
    }
  } catch (error) {
    console.error('[ExternalValidatorAPI] Heartbeat error:', error);
    res.status(500).json({ success: false, error: 'Heartbeat processing failed' });
  }
});

router.get('/validators', async (req: Request, res: Response) => {
  try {
    const { status, tier, region, limit = '50', offset = '0' } = req.query;
    
    let validators = externalValidatorEngine.getAllValidators();

    if (status) {
      validators = validators.filter(v => v.status === status);
    }
    if (tier) {
      validators = validators.filter(v => v.tier === tier);
    }
    if (region) {
      validators = validators.filter(v => v.region === region);
    }

    const total = validators.length;
    validators = validators.slice(Number(offset), Number(offset) + Number(limit));

    res.json({
      success: true,
      data: {
        validators: validators.map(formatValidatorResponse),
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
          hasMore: Number(offset) + Number(limit) < total,
        },
      },
    });
  } catch (error) {
    console.error('[ExternalValidatorAPI] List validators error:', error);
    res.status(500).json({ success: false, error: 'Failed to list validators' });
  }
});

router.get('/validators/active', async (_req: Request, res: Response) => {
  try {
    const validators = externalValidatorEngine.getActiveValidators();
    res.json({
      success: true,
      data: {
        count: validators.length,
        validators: validators.map(formatValidatorResponse),
      },
    });
  } catch (error) {
    console.error('[ExternalValidatorAPI] Active validators error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch active validators' });
  }
});

router.get('/validator/:nodeId', async (req: Request, res: Response) => {
  try {
    const { nodeId } = req.params;
    const validator = externalValidatorEngine.getValidator(nodeId);

    if (!validator) {
      return res.status(404).json({ success: false, error: 'Validator not found' });
    }

    res.json({
      success: true,
      data: formatValidatorResponse(validator),
    });
  } catch (error) {
    console.error('[ExternalValidatorAPI] Get validator error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch validator' });
  }
});

router.get('/validator/address/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const validator = externalValidatorEngine.getValidatorByAddress(address);

    if (!validator) {
      return res.status(404).json({ success: false, error: 'Validator not found for address' });
    }

    res.json({
      success: true,
      data: formatValidatorResponse(validator),
    });
  } catch (error) {
    console.error('[ExternalValidatorAPI] Get validator by address error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch validator' });
  }
});

router.post('/validator/:nodeId/stake', async (req: Request, res: Response) => {
  try {
    const { nodeId } = req.params;
    const { apiKey, stakeAmount } = req.body;
    const key = apiKey || req.headers['x-api-key'] as string;

    if (!key) {
      return res.status(401).json({ success: false, error: 'API key required' });
    }

    const result = await externalValidatorEngine.updateStake(nodeId, key, BigInt(stakeAmount));
    
    if (result.success) {
      res.json({ success: true, message: result.message });
    } else {
      res.status(400).json({ success: false, error: result.message });
    }
  } catch (error) {
    console.error('[ExternalValidatorAPI] Update stake error:', error);
    res.status(500).json({ success: false, error: 'Failed to update stake' });
  }
});

router.post('/validator/:nodeId/unbond', async (req: Request, res: Response) => {
  try {
    const { nodeId } = req.params;
    const { apiKey } = req.body;
    const key = apiKey || req.headers['x-api-key'] as string;

    if (!key) {
      return res.status(401).json({ success: false, error: 'API key required' });
    }

    const result = await externalValidatorEngine.initiateUnbonding(nodeId, key);
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        unbondingEndBlock: result.unbondingEndBlock,
      });
    } else {
      res.status(400).json({ success: false, error: result.message });
    }
  } catch (error) {
    console.error('[ExternalValidatorAPI] Unbond error:', error);
    res.status(500).json({ success: false, error: 'Failed to initiate unbonding' });
  }
});

router.get('/validator/:nodeId/rewards', async (req: Request, res: Response) => {
  try {
    const { nodeId } = req.params;
    const validator = externalValidatorEngine.getValidator(nodeId);

    if (!validator) {
      return res.status(404).json({ success: false, error: 'Validator not found' });
    }

    res.json({
      success: true,
      data: {
        totalEarned: (validator.rewardInfo.totalEarned / WEI_PER_TBURN).toString() + ' TBURN',
        pendingRewards: (validator.rewardInfo.pendingRewards / WEI_PER_TBURN).toString() + ' TBURN',
        claimedRewards: (validator.rewardInfo.claimedRewards / WEI_PER_TBURN).toString() + ' TBURN',
        proposerRewards: (validator.rewardInfo.proposerRewards / WEI_PER_TBURN).toString() + ' TBURN',
        verifierRewards: (validator.rewardInfo.verifierRewards / WEI_PER_TBURN).toString() + ' TBURN',
        commissionEarned: (validator.rewardInfo.commissionEarned / WEI_PER_TBURN).toString() + ' TBURN',
        estimatedDailyReward: (validator.rewardInfo.estimatedDailyReward / WEI_PER_TBURN).toString() + ' TBURN',
        estimatedApy: (validator.rewardInfo.estimatedApy * 100).toFixed(2) + '%',
        lastClaimTime: validator.rewardInfo.lastClaimTime,
      },
    });
  } catch (error) {
    console.error('[ExternalValidatorAPI] Get rewards error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch rewards' });
  }
});

router.post('/validator/:nodeId/claim-rewards', async (req: Request, res: Response) => {
  try {
    const { nodeId } = req.params;
    const { apiKey } = req.body;
    const key = apiKey || req.headers['x-api-key'] as string;

    if (!key) {
      return res.status(401).json({ success: false, error: 'API key required' });
    }

    const result = await externalValidatorEngine.claimRewards(nodeId, key);
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        claimedAmount: result.amount ? (BigInt(result.amount) / WEI_PER_TBURN).toString() + ' TBURN' : '0 TBURN',
      });
    } else {
      res.status(400).json({ success: false, error: result.message });
    }
  } catch (error) {
    console.error('[ExternalValidatorAPI] Claim rewards error:', error);
    res.status(500).json({ success: false, error: 'Failed to claim rewards' });
  }
});

router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const { sortBy = 'stake', limit = '20' } = req.query;
    
    let validators = externalValidatorEngine.getActiveValidators();

    switch (sortBy) {
      case 'stake':
        validators.sort((a, b) => Number(b.stakeInfo.totalStake - a.stakeInfo.totalStake));
        break;
      case 'blocks':
        validators.sort((a, b) => b.performanceMetrics.blocksProposed - a.performanceMetrics.blocksProposed);
        break;
      case 'health':
        validators.sort((a, b) => b.healthScore - a.healthScore);
        break;
      case 'rewards':
        validators.sort((a, b) => Number(b.rewardInfo.totalEarned - a.rewardInfo.totalEarned));
        break;
      case 'uptime':
        validators.sort((a, b) => b.performanceMetrics.uptime - a.performanceMetrics.uptime);
        break;
    }

    validators = validators.slice(0, Number(limit));

    res.json({
      success: true,
      data: {
        sortBy,
        validators: validators.map((v, index) => ({
          rank: index + 1,
          ...formatValidatorResponse(v),
        })),
      },
    });
  } catch (error) {
    console.error('[ExternalValidatorAPI] Leaderboard error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch leaderboard' });
  }
});

router.get('/health', async (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: Date.now(),
      version: '1.0.0',
      endpoints: {
        registration: '/api/external-validators/register',
        heartbeat: '/api/external-validators/heartbeat',
        validators: '/api/external-validators/validators',
        networkStats: '/api/external-validators/network-stats',
      },
    },
  });
});

export function registerExternalValidatorRoutes(app: any): void {
  app.use('/api/external-validators', router);
  
  externalValidatorEngine.start().catch(err => {
    console.error('[ExternalValidatorEngine] Failed to start:', err);
  });
  
  console.log('[ExternalValidators] ✅ Enterprise external validator routes registered (18 endpoints)');
}

export default router;
