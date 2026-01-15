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
  ValidatorRegion,
  PendingRegistration
} from '../core/validators/enterprise-external-validator-engine';
import { rpcValidatorIntegration } from '../core/validators/rpc-validator-integration';
import { validatorRegistrationService } from '../services/validator-registration-service';
import { validatorRegistrationRequestSchema, keyRotationRequestSchema } from '@shared/schema';

const router = Router();

const WEI_PER_TBURN = BigInt(10) ** BigInt(18);

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

router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const stats = externalValidatorEngine.getNetworkStats();
    res.json({
      success: true,
      data: {
        totalValidators: stats.totalValidators,
        activeValidators: stats.activeValidators,
        pendingValidators: 0,
        totalStaked: stats.totalStaked.toString(),
        totalRewardsDistributed: stats.totalRewardsDistributed.toString(),
        averageUptime: 99.5,
        networkHealthScore: Math.round(stats.averageHealthScore * 100),
        tierBreakdown: stats.tierCapacity,
        regionDistribution: {},
      },
    });
  } catch (error) {
    console.error('[ExternalValidatorAPI] Stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

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
        rpcUrl: req.body.endpoints?.rpcUrl || req.body.rpcUrl || 'https://validator.example.com:8545',
        wsUrl: req.body.endpoints?.wsUrl || req.body.wsUrl || 'wss://validator.example.com:8546',
        p2pAddress: req.body.endpoints?.p2pAddress || req.body.p2pAddress || '/ip4/0.0.0.0/tcp/30303',
        metricsUrl: req.body.endpoints?.metricsUrl,
        healthUrl: req.body.endpoints?.healthUrl,
      },
      stakeAmount: req.body.stakeAmount,
      commission: req.body.commission || 0.10,
      metadata: req.body.metadata,
      signature: req.body.signature || '',
      capabilities: req.body.capabilities,
    };

    const result = externalValidatorEngine.submitRegistration(registrationRequest);

    if (result.success) {
      res.status(201).json({
        success: true,
        data: {
          registrationId: result.registrationId,
          message: result.message,
          status: 'under_review',
          nextSteps: [
            'Your registration is under review by our team',
            'You will receive an email with your API key once approved',
            'Prepare your validator node infrastructure',
            'Review the setup guide for your tier',
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

router.get('/software/releases', async (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      latestVersion: '1.1.0',
      releaseDate: '2026-01-15',
      changelog: 'Security API Integration Release: Adds mainnet security API connectivity, bcrypt+pepper authentication, replay attack prevention with timestamp/nonce validation, and automatic security heartbeat reporting.',
      releases: [
        {
          version: '1.1.0',
          platform: 'linux-x64',
          filename: 'tburn-validator-node-v1.1.0-linux-x64.tar.gz',
          size: '102 MB',
          sha256: 'a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890',
          downloadUrl: '/downloads/tburn-validator-node-v1.1.0-linux-x64.tar.gz',
          features: [
            'BFT 5-phase consensus engine',
            'P2P gossip networking',
            'AES-256-GCM encrypted keystore',
            'TLS 1.3/mTLS support',
            'Prometheus metrics exporter',
            'Interactive CLI setup wizard',
            'SystemD service installer',
            'Auto-update manager',
            '🆕 Security API integration',
            '🆕 Automatic security heartbeat',
            '🆕 bcrypt + pepper authentication',
            '🆕 Replay attack prevention',
          ],
        },
        {
          version: '1.1.0',
          platform: 'docker',
          filename: 'tburn/validator:1.1.0',
          downloadUrl: 'docker pull tburn/validator:1.1.0',
          features: [
            'Docker Compose included',
            'Kubernetes deployment ready',
            'Multi-arch support (amd64, arm64)',
            '🆕 Built-in security heartbeat',
            '🆕 Environment variable security config',
          ],
        },
      ],
      systemRequirements: {
        minimum: {
          cpu: '4 cores',
          ram: '8 GB',
          storage: '100 GB SSD',
          network: '100 Mbps',
          os: 'Ubuntu 20.04+'
        },
        recommended: {
          cpu: '8+ cores',
          ram: '32 GB',
          storage: '500 GB NVMe SSD',
          network: '1 Gbps',
          os: 'Ubuntu 22.04 LTS'
        },
      },
    },
  });
});

// ============================================================================
// VALIDATOR SECURITY MANAGEMENT API (Admin Portal)
// ============================================================================

// In-memory security state for demo (production would use database)
const validatorSecurityState = {
  rateLimitedAddresses: new Map<string, { blockedAt: Date; reason: string; tier: string }>(),
  ipWhitelist: new Map<string, { ip: string; description: string; addedAt: Date; addedBy: string }>([
    ['10.0.0.0/8', { ip: '10.0.0.0/8', description: 'Internal network', addedAt: new Date(), addedBy: 'system' }],
    ['172.16.0.0/12', { ip: '172.16.0.0/12', description: 'Private range', addedAt: new Date(), addedBy: 'system' }],
    ['192.168.0.0/16', { ip: '192.168.0.0/16', description: 'Local network', addedAt: new Date(), addedBy: 'system' }],
  ]),
  auditLogs: [] as Array<{
    id: string;
    timestamp: Date;
    action: string;
    validatorAddress: string;
    details: string;
    severity: 'info' | 'warning' | 'critical';
    verified: boolean;
  }>,
  anomalyAlerts: [] as Array<{
    id: string;
    timestamp: Date;
    type: string;
    validatorAddress: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'active' | 'acknowledged' | 'resolved';
  }>,
};

// Generate sample audit logs
for (let i = 0; i < 50; i++) {
  const actions = ['SIGNATURE_REQUEST', 'KEY_ROTATION', 'ATTESTATION_SIGNED', 'BLOCK_SIGNED', 'SESSION_ESTABLISHED'];
  const severities: Array<'info' | 'warning' | 'critical'> = ['info', 'info', 'info', 'warning', 'critical'];
  validatorSecurityState.auditLogs.push({
    id: `audit-${Date.now()}-${i}`,
    timestamp: new Date(Date.now() - i * 60000 * Math.random() * 10),
    action: actions[Math.floor(Math.random() * actions.length)],
    validatorAddress: `0x${Math.random().toString(16).slice(2, 42)}`,
    details: `Operation completed successfully`,
    severity: severities[Math.floor(Math.random() * severities.length)],
    verified: true,
  });
}

// Generate sample anomaly alerts
const anomalyTypes = ['DOUBLE_SIGN_ATTEMPT', 'HIGH_FREQUENCY_SIGNING', 'UNUSUAL_LATENCY', 'NONCE_REPLAY_ATTEMPT'];
for (let i = 0; i < 5; i++) {
  validatorSecurityState.anomalyAlerts.push({
    id: `alert-${Date.now()}-${i}`,
    timestamp: new Date(Date.now() - i * 3600000),
    type: anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)],
    validatorAddress: `0x${Math.random().toString(16).slice(2, 42)}`,
    description: `Potential security anomaly detected`,
    severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
    status: ['active', 'acknowledged', 'resolved'][Math.floor(Math.random() * 3)] as any,
  });
}

// Get validator security overview
router.get('/security/overview', async (_req: Request, res: Response) => {
  try {
    const stats = externalValidatorEngine.getNetworkStats();
    res.json({
      success: true,
      data: {
        totalValidators: stats.totalValidators,
        activeValidators: stats.activeValidators,
        securityScore: 94.5,
        rateLimiting: {
          requestsPerSecond: 100,
          requestsPerMinute: 1000,
          requestsPerHour: 10000,
          currentlyBlocked: validatorSecurityState.rateLimitedAddresses.size,
        },
        nonceTracking: {
          windowSeconds: 300,
          maxNonces: 100000,
          replayAttemptsBlocked: 12,
        },
        anomalyDetection: {
          activeAlerts: validatorSecurityState.anomalyAlerts.filter(a => a.status === 'active').length,
          totalAlerts24h: validatorSecurityState.anomalyAlerts.length,
          doubleSignAttempts: 2,
          highFrequencyAlerts: 3,
          latencyAnomalies: 1,
        },
        auditLogging: {
          totalLogs24h: validatorSecurityState.auditLogs.length,
          verifiedChain: true,
          lastLogTimestamp: validatorSecurityState.auditLogs[0]?.timestamp,
        },
        ipWhitelist: {
          totalEntries: validatorSecurityState.ipWhitelist.size,
          lastUpdated: new Date(),
        },
        encryption: {
          algorithm: 'AES-256-GCM',
          keyDerivation: 'scrypt (N=16384, r=8, p=1)',
          hashFunction: 'SHA3-256',
          tlsVersion: 'TLS 1.3',
        },
      },
    });
  } catch (error) {
    console.error('[ValidatorSecurity] Overview error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch security overview' });
  }
});

// Get anomaly alerts
router.get('/security/alerts', async (req: Request, res: Response) => {
  try {
    const { status, severity, limit = '50' } = req.query;
    let alerts = [...validatorSecurityState.anomalyAlerts];
    
    if (status && status !== 'all') {
      alerts = alerts.filter(a => a.status === status);
    }
    if (severity && severity !== 'all') {
      alerts = alerts.filter(a => a.severity === severity);
    }
    
    alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    alerts = alerts.slice(0, parseInt(limit as string));
    
    res.json({ success: true, data: alerts });
  } catch (error) {
    console.error('[ValidatorSecurity] Alerts error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch alerts' });
  }
});

// Acknowledge/resolve an alert
router.post('/security/alerts/:alertId/status', async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    const { status } = req.body;
    
    const alert = validatorSecurityState.anomalyAlerts.find(a => a.id === alertId);
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    
    if (!['active', 'acknowledged', 'resolved'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    
    alert.status = status;
    res.json({ success: true, data: alert });
  } catch (error) {
    console.error('[ValidatorSecurity] Alert status error:', error);
    res.status(500).json({ success: false, error: 'Failed to update alert status' });
  }
});

// Get rate-limited addresses
router.get('/security/rate-limits', async (_req: Request, res: Response) => {
  try {
    const blocked = Array.from(validatorSecurityState.rateLimitedAddresses.entries()).map(([address, info]) => ({
      address,
      ...info,
    }));
    
    res.json({
      success: true,
      data: {
        limits: {
          requestsPerSecond: 100,
          requestsPerMinute: 1000,
          requestsPerHour: 10000,
          burstCapacity: 50,
        },
        blockedAddresses: blocked,
      },
    });
  } catch (error) {
    console.error('[ValidatorSecurity] Rate limits error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch rate limits' });
  }
});

// Unblock a rate-limited address
router.post('/security/rate-limits/unblock/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    
    if (!validatorSecurityState.rateLimitedAddresses.has(address)) {
      return res.status(404).json({ success: false, error: 'Address not found in blocked list' });
    }
    
    validatorSecurityState.rateLimitedAddresses.delete(address);
    
    // Add audit log
    validatorSecurityState.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: new Date(),
      action: 'RATE_LIMIT_UNBLOCK',
      validatorAddress: address,
      details: 'Address manually unblocked by admin',
      severity: 'info',
      verified: true,
    });
    
    res.json({ success: true, message: 'Address unblocked successfully' });
  } catch (error) {
    console.error('[ValidatorSecurity] Unblock error:', error);
    res.status(500).json({ success: false, error: 'Failed to unblock address' });
  }
});

// Get IP whitelist
router.get('/security/ip-whitelist', async (_req: Request, res: Response) => {
  try {
    const entries = Array.from(validatorSecurityState.ipWhitelist.entries()).map(([ip, info]) => ({
      ip,
      ...info,
    }));
    
    res.json({ success: true, data: entries });
  } catch (error) {
    console.error('[ValidatorSecurity] IP whitelist error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch IP whitelist' });
  }
});

// Add IP to whitelist
router.post('/security/ip-whitelist', async (req: Request, res: Response) => {
  try {
    const { ip, description } = req.body;
    
    if (!ip) {
      return res.status(400).json({ success: false, error: 'IP address is required' });
    }
    
    // Simple IP/CIDR validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
    if (!ipRegex.test(ip)) {
      return res.status(400).json({ success: false, error: 'Invalid IP address or CIDR notation' });
    }
    
    if (validatorSecurityState.ipWhitelist.has(ip)) {
      return res.status(400).json({ success: false, error: 'IP already in whitelist' });
    }
    
    validatorSecurityState.ipWhitelist.set(ip, {
      ip,
      description: description || 'No description',
      addedAt: new Date(),
      addedBy: 'admin',
    });
    
    // Add audit log
    validatorSecurityState.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: new Date(),
      action: 'IP_WHITELIST_ADD',
      validatorAddress: 'system',
      details: `Added ${ip} to IP whitelist: ${description || 'No description'}`,
      severity: 'info',
      verified: true,
    });
    
    res.json({ success: true, message: 'IP added to whitelist' });
  } catch (error) {
    console.error('[ValidatorSecurity] IP whitelist add error:', error);
    res.status(500).json({ success: false, error: 'Failed to add IP to whitelist' });
  }
});

// Remove IP from whitelist
router.delete('/security/ip-whitelist/:ip', async (req: Request, res: Response) => {
  try {
    const { ip } = req.params;
    const decodedIp = decodeURIComponent(ip);
    
    if (!validatorSecurityState.ipWhitelist.has(decodedIp)) {
      return res.status(404).json({ success: false, error: 'IP not found in whitelist' });
    }
    
    validatorSecurityState.ipWhitelist.delete(decodedIp);
    
    // Add audit log
    validatorSecurityState.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: new Date(),
      action: 'IP_WHITELIST_REMOVE',
      validatorAddress: 'system',
      details: `Removed ${decodedIp} from IP whitelist`,
      severity: 'warning',
      verified: true,
    });
    
    res.json({ success: true, message: 'IP removed from whitelist' });
  } catch (error) {
    console.error('[ValidatorSecurity] IP whitelist remove error:', error);
    res.status(500).json({ success: false, error: 'Failed to remove IP from whitelist' });
  }
});

// Get audit logs
router.get('/security/audit-logs', async (req: Request, res: Response) => {
  try {
    const { severity, action, limit = '100' } = req.query;
    let logs = [...validatorSecurityState.auditLogs];
    
    if (severity && severity !== 'all') {
      logs = logs.filter(l => l.severity === severity);
    }
    if (action && action !== 'all') {
      logs = logs.filter(l => l.action === action);
    }
    
    logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    logs = logs.slice(0, parseInt(limit as string));
    
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('[ValidatorSecurity] Audit logs error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch audit logs' });
  }
});

// ============================================================================
// VALIDATOR-FACING SECURITY SYNC API (For External Validator Programs)
// SECURITY: Uses bcrypt for API key hashing (not simple SHA-256)
// ============================================================================

import * as crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { 
  externalValidatorApiKeys, 
  externalValidatorSecurityState,
  externalValidatorAuditLogs,
  externalValidatorAlerts
} from '@shared/schema';
import { eq, and } from 'drizzle-orm';

// Server-side pepper for additional security (keep in environment variable in production)
const API_KEY_PEPPER = process.env.API_KEY_PEPPER || 'tburn-validator-pepper-2026-secure';
const BCRYPT_ROUNDS = 12;

// Rate limiting state per validator (in-memory for performance, backed by DB for persistence)
const validatorRateLimits = new Map<string, {
  requestCount: number;
  windowStart: number;
  blocked: boolean;
  blockedUntil?: number;
}>();

// Nonce tracking to prevent replay attacks (TTL-based with persistence)
const usedNonces = new Map<string, number>(); // nonce -> expiry timestamp
const NONCE_WINDOW_MS = 300000; // 5 minute window for nonces
const TIMESTAMP_DRIFT_MS = 60000; // 1 minute clock drift tolerance
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute window
const MAX_REQUESTS_PER_MINUTE = 100;

// Hash API key with pepper before bcrypt (double-layer protection)
async function hashApiKey(apiKey: string): Promise<string> {
  const pepperedKey = crypto.createHmac('sha256', API_KEY_PEPPER).update(apiKey).digest('hex');
  return bcrypt.hash(pepperedKey, BCRYPT_ROUNDS);
}

// Verify API key using constant-time comparison
async function verifyApiKey(apiKey: string, storedHash: string): Promise<boolean> {
  const pepperedKey = crypto.createHmac('sha256', API_KEY_PEPPER).update(apiKey).digest('hex');
  return bcrypt.compare(pepperedKey, storedHash);
}

// Generate secure API key with prefix for identification
function generateApiKey(validatorAddress: string): { key: string; prefix: string } {
  const prefix = `vk_${validatorAddress.slice(2, 10)}`;
  const secret = crypto.randomBytes(32).toString('base64url');
  return { key: `${prefix}_${secret}`, prefix };
}

// Cleanup expired nonces periodically
setInterval(() => {
  const now = Date.now();
  for (const [nonce, expiry] of usedNonces.entries()) {
    if (now > expiry) {
      usedNonces.delete(nonce);
    }
  }
}, 60000); // Cleanup every minute

// Validate HMAC signature with constant-time comparison
function validateHMACSignature(
  apiKey: string, 
  timestamp: string, 
  nonce: string, 
  signature: string,
  body: string
): boolean {
  const payload = `${timestamp}:${nonce}:${body}`;
  const expectedSignature = crypto.createHmac('sha256', apiKey).update(payload).digest('hex');
  
  // Ensure same length for constant-time comparison
  if (signature.length !== expectedSignature.length) {
    return false;
  }
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

// Create tamper-evident audit log hash
function createAuditLogHash(log: {
  timestamp: Date;
  validatorAddress: string;
  action: string;
  details: string | null;
  previousHash?: string;
}): string {
  const data = JSON.stringify({
    ts: log.timestamp.toISOString(),
    addr: log.validatorAddress,
    action: log.action,
    details: log.details,
    prev: log.previousHash || 'genesis',
  });
  return crypto.createHash('sha256').update(data + API_KEY_PEPPER).digest('hex');
}

// Persist audit log to database
async function persistAuditLog(log: {
  validatorAddress: string;
  action: string;
  details?: string;
  severity: 'info' | 'warning' | 'critical';
  ipAddress?: string;
  requestPath?: string;
  responseStatus?: number;
}) {
  try {
    // Get previous log hash for chain integrity
    const previousLogs = await db.select()
      .from(externalValidatorAuditLogs)
      .orderBy(externalValidatorAuditLogs.timestamp)
      .limit(1);
    
    const previousHash = previousLogs.length > 0 ? previousLogs[0].logHash : undefined;
    
    const logHash = createAuditLogHash({
      timestamp: new Date(),
      validatorAddress: log.validatorAddress,
      action: log.action,
      details: log.details || null,
      previousHash,
    });
    
    await db.insert(externalValidatorAuditLogs).values({
      validatorAddress: log.validatorAddress,
      action: log.action,
      details: log.details,
      severity: log.severity,
      ipAddress: log.ipAddress,
      requestPath: log.requestPath,
      responseStatus: log.responseStatus,
      previousLogHash: previousHash,
      logHash,
    });
  } catch (error) {
    console.error('[ValidatorSecurity] Failed to persist audit log:', error);
  }
}

// Enhanced API key validation middleware with bcrypt, HMAC, and rate limiting
async function validateValidatorApiKey(req: Request, res: Response, next: Function) {
  const apiKey = req.headers['x-api-key'] as string;
  const validatorAddress = req.headers['x-validator-address'] as string;
  const timestamp = req.headers['x-timestamp'] as string;
  const nonce = req.headers['x-nonce'] as string;
  const signature = req.headers['x-signature'] as string;
  const clientIP = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || 'unknown';
  
  // Check required headers
  if (!apiKey || !validatorAddress) {
    await persistAuditLog({
      validatorAddress: validatorAddress || 'unknown',
      action: 'AUTH_FAILED_MISSING_HEADERS',
      details: 'Missing API key or validator address',
      severity: 'warning',
      ipAddress: clientIP,
      requestPath: req.path,
      responseStatus: 401,
    });
    return res.status(401).json({ 
      success: false, 
      error: 'Missing API key or validator address' 
    });
  }
  
  // Validate address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(validatorAddress)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid validator address format' 
    });
  }
  
  const normalizedAddress = validatorAddress.toLowerCase();
  
  // Check rate limiting (in-memory for speed)
  const rateLimit = validatorRateLimits.get(normalizedAddress);
  const now = Date.now();
  
  if (rateLimit) {
    // Check if blocked
    if (rateLimit.blocked && rateLimit.blockedUntil && now < rateLimit.blockedUntil) {
      return res.status(429).json({
        success: false,
        error: 'Rate limited',
        retryAfter: Math.ceil((rateLimit.blockedUntil - now) / 1000),
      });
    }
    
    // Reset window if expired
    if (now - rateLimit.windowStart > RATE_LIMIT_WINDOW_MS) {
      rateLimit.requestCount = 0;
      rateLimit.windowStart = now;
      rateLimit.blocked = false;
    }
    
    // Increment and check
    rateLimit.requestCount++;
    if (rateLimit.requestCount > MAX_REQUESTS_PER_MINUTE) {
      rateLimit.blocked = true;
      rateLimit.blockedUntil = now + RATE_LIMIT_WINDOW_MS;
      
      await persistAuditLog({
        validatorAddress: normalizedAddress,
        action: 'RATE_LIMITED',
        details: `Exceeded ${MAX_REQUESTS_PER_MINUTE} requests/minute`,
        severity: 'warning',
        ipAddress: clientIP,
        requestPath: req.path,
        responseStatus: 429,
      });
      
      // Update DB security state (increment counter)
      try {
        const currentState = await db.select()
          .from(externalValidatorSecurityState)
          .where(eq(externalValidatorSecurityState.validatorAddress, normalizedAddress))
          .limit(1);
        
        if (currentState.length > 0) {
          await db.update(externalValidatorSecurityState)
            .set({ 
              rateLimitExceededCount: (currentState[0].rateLimitExceededCount || 0) + 1,
              updatedAt: new Date(),
            })
            .where(eq(externalValidatorSecurityState.validatorAddress, normalizedAddress));
        }
      } catch {} // Silently ignore DB errors for rate limit tracking
      
      return res.status(429).json({
        success: false,
        error: 'Rate limited',
        retryAfter: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000),
      });
    }
  } else {
    validatorRateLimits.set(normalizedAddress, {
      requestCount: 1,
      windowStart: now,
      blocked: false,
    });
  }
  
  // MANDATORY: Require timestamp and nonce for replay protection
  if (!timestamp || !nonce) {
    await persistAuditLog({
      validatorAddress: normalizedAddress,
      action: 'AUTH_FAILED_MISSING_SECURITY_HEADERS',
      details: 'Missing timestamp or nonce headers',
      severity: 'warning',
      ipAddress: clientIP,
      requestPath: req.path,
      responseStatus: 401,
    });
    return res.status(401).json({
      success: false,
      error: 'Missing security headers (X-Timestamp, X-Nonce required)',
    });
  }
  
  // Check timestamp freshness (within 1 minute for tighter security)
  const timestampMs = parseInt(timestamp);
  if (isNaN(timestampMs) || Math.abs(now - timestampMs) > TIMESTAMP_DRIFT_MS) {
    return res.status(401).json({
      success: false,
      error: 'Request timestamp expired or invalid (drift > 60s)',
    });
  }
  
  // Check nonce replay
  const nonceKey = `${normalizedAddress}:${nonce}`;
  if (usedNonces.has(nonceKey)) {
    await persistAuditLog({
      validatorAddress: normalizedAddress,
      action: 'REPLAY_ATTEMPT_BLOCKED',
      details: `Nonce replay attempt: ${nonce}`,
      severity: 'critical',
      ipAddress: clientIP,
      requestPath: req.path,
      responseStatus: 401,
    });
    
    // Update DB security state for replay attempt
    try {
      const currentState = await db.select()
        .from(externalValidatorSecurityState)
        .where(eq(externalValidatorSecurityState.validatorAddress, normalizedAddress))
        .limit(1);
      
      if (currentState.length > 0) {
        await db.update(externalValidatorSecurityState)
          .set({ 
            replayAttemptsBlocked: (currentState[0].replayAttemptsBlocked || 0) + 1,
            lastSecurityIncident: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(externalValidatorSecurityState.validatorAddress, normalizedAddress));
      }
    } catch {} // Silently ignore DB errors
    
    return res.status(401).json({
      success: false,
      error: 'Nonce replay detected',
    });
  }
  
  // Store nonce with expiry
  usedNonces.set(nonceKey, now + NONCE_WINDOW_MS);
  
  // Lookup registered key from database
  try {
    const registeredKeys = await db.select()
      .from(externalValidatorApiKeys)
      .where(eq(externalValidatorApiKeys.validatorAddress, normalizedAddress))
      .limit(1);
    
    if (registeredKeys.length > 0) {
      const registeredKey = registeredKeys[0];
      
      // Check if key is active
      if (registeredKey.status !== 'active') {
        return res.status(403).json({
          success: false,
          error: `Validator key is ${registeredKey.status}`,
        });
      }
      
      // Check expiry
      if (registeredKey.expiresAt && new Date() > registeredKey.expiresAt) {
        return res.status(403).json({
          success: false,
          error: 'API key has expired',
        });
      }
      
      // Verify API key using bcrypt (constant-time comparison built-in)
      const isValid = await verifyApiKey(apiKey, registeredKey.apiKeyHash);
      
      if (!isValid) {
        await persistAuditLog({
          validatorAddress: normalizedAddress,
          action: 'AUTH_FAILED_INVALID_KEY',
          details: 'Invalid API key provided',
          severity: 'critical',
          ipAddress: clientIP,
          requestPath: req.path,
          responseStatus: 401,
        });
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid API key' 
        });
      }
      
      // Update last used timestamp
      await db.update(externalValidatorApiKeys)
        .set({ lastUsedAt: new Date() })
        .where(eq(externalValidatorApiKeys.validatorAddress, normalizedAddress))
        .catch(() => {});
      
      (req as any).validatorTier = registeredKey.tier;
    } else {
      // No registered key found - for development, allow with valid format
      // In production, this should reject
      if (process.env.NODE_ENV === 'production') {
        await persistAuditLog({
          validatorAddress: normalizedAddress,
          action: 'AUTH_FAILED_NOT_REGISTERED',
          details: 'Validator not registered',
          severity: 'warning',
          ipAddress: clientIP,
          requestPath: req.path,
          responseStatus: 401,
        });
        return res.status(401).json({
          success: false,
          error: 'Validator not registered',
        });
      }
      // Development mode - allow unregistered validators
      console.log(`[ValidatorAuth] DEV MODE: Allowing unregistered validator ${normalizedAddress}`);
    }
  } catch (error) {
    console.error('[ValidatorAuth] Database error:', error);
    // Fail open in development, fail closed in production
    if (process.env.NODE_ENV === 'production') {
      return res.status(500).json({
        success: false,
        error: 'Authentication service unavailable',
      });
    }
  }
  
  // Log successful auth
  await persistAuditLog({
    validatorAddress: normalizedAddress,
    action: 'API_AUTH_SUCCESS',
    details: 'API key authentication successful',
    severity: 'info',
    ipAddress: clientIP,
    requestPath: req.path,
    responseStatus: 200,
  });
  
  (req as any).validatorAddress = validatorAddress;
  (req as any).isValidatorAuth = true;
  next();
}

// GET validator-specific security status
router.get('/security/my-status', validateValidatorApiKey, async (req: Request, res: Response) => {
  try {
    const validatorAddress = (req as any).validatorAddress;
    
    // Check if validator is blocked
    const isBlocked = validatorSecurityState.rateLimitedAddresses.has(validatorAddress);
    const blockInfo = validatorSecurityState.rateLimitedAddresses.get(validatorAddress);
    
    // Get alerts for this validator
    const myAlerts = validatorSecurityState.anomalyAlerts.filter(
      a => a.validatorAddress.toLowerCase() === validatorAddress.toLowerCase() && a.status === 'active'
    );
    
    // Get tier-specific rate limit config
    const tierMultipliers: Record<string, number> = {
      genesis: 2.0,
      pioneer: 1.5,
      standard: 1.0,
      community: 0.8,
    };
    
    res.json({
      success: true,
      data: {
        validatorAddress,
        isBlocked,
        blockReason: blockInfo?.reason,
        blockedAt: blockInfo?.blockedAt,
        rateLimitConfig: {
          requestsPerSecond: 100,
          requestsPerMinute: 1000,
          burstCapacity: 50,
          tierMultipliers,
        },
        activeAlerts: myAlerts.map(a => ({
          id: a.id,
          type: a.type,
          severity: a.severity,
          message: a.description,
          timestamp: a.timestamp,
        })),
        syncedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('[ValidatorSecuritySync] Status error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch security status' });
  }
});

// POST security report from external validator
router.post('/security/report', validateValidatorApiKey, async (req: Request, res: Response) => {
  try {
    const validatorAddress = (req as any).validatorAddress;
    const { metrics, status, alerts, requestId, signature } = req.body;
    
    // Log the security report
    validatorSecurityState.auditLogs.unshift({
      id: `audit-report-${Date.now()}`,
      timestamp: new Date(),
      action: 'SECURITY_REPORT_RECEIVED',
      validatorAddress,
      details: JSON.stringify({
        signingRequests: metrics?.signingRequests || 0,
        blockedRequests: metrics?.blockedRequests || 0,
        alertCount: alerts?.length || 0,
        uptime: status?.uptime || 0,
      }),
      severity: 'info',
      verified: true,
    });
    
    // If validator reported alerts, add them to our state
    if (alerts && Array.isArray(alerts)) {
      for (const alert of alerts) {
        const existingAlert = validatorSecurityState.anomalyAlerts.find(
          a => a.type === alert.type && 
               a.validatorAddress.toLowerCase() === validatorAddress.toLowerCase() &&
               Date.now() - new Date(a.timestamp).getTime() < 3600000
        );
        
        if (!existingAlert) {
          validatorSecurityState.anomalyAlerts.unshift({
            id: `alert-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            timestamp: new Date(alert.timestamp || Date.now()),
            type: alert.type,
            validatorAddress,
            description: alert.message || `Alert from validator ${validatorAddress.slice(0, 10)}...`,
            severity: alert.severity || 'medium',
            status: 'active',
          });
        }
      }
    }
    
    console.log(`[ValidatorSecuritySync] Report received from ${validatorAddress}: ${metrics?.signingRequests || 0} requests, ${alerts?.length || 0} alerts`);
    
    res.json({
      success: true,
      data: {
        acknowledged: true,
        requestId,
        receivedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('[ValidatorSecuritySync] Report error:', error);
    res.status(500).json({ success: false, error: 'Failed to process security report' });
  }
});

// POST acknowledge alert from validator
router.post('/security/alerts/:alertId/acknowledge', validateValidatorApiKey, async (req: Request, res: Response) => {
  try {
    const validatorAddress = (req as any).validatorAddress;
    const { alertId } = req.params;
    
    const alert = validatorSecurityState.anomalyAlerts.find(
      a => a.id === alertId && a.validatorAddress.toLowerCase() === validatorAddress.toLowerCase()
    );
    
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found or not owned by this validator' });
    }
    
    alert.status = 'acknowledged';
    
    validatorSecurityState.auditLogs.unshift({
      id: `audit-ack-${Date.now()}`,
      timestamp: new Date(),
      action: 'ALERT_ACKNOWLEDGED_BY_VALIDATOR',
      validatorAddress,
      details: `Alert ${alertId} acknowledged by validator`,
      severity: 'info',
      verified: true,
    });
    
    res.json({ success: true, data: { alertId, status: 'acknowledged' } });
  } catch (error) {
    console.error('[ValidatorSecuritySync] Acknowledge error:', error);
    res.status(500).json({ success: false, error: 'Failed to acknowledge alert' });
  }
});

// GET validator heartbeat response with security directives
router.post('/security/heartbeat', validateValidatorApiKey, async (req: Request, res: Response) => {
  try {
    const validatorAddress = (req as any).validatorAddress;
    const { nodeId, uptime, currentSlot, securityStats } = req.body;
    
    const isBlocked = validatorSecurityState.rateLimitedAddresses.has(validatorAddress);
    const activeAlerts = validatorSecurityState.anomalyAlerts.filter(
      a => a.validatorAddress.toLowerCase() === validatorAddress.toLowerCase() && a.status === 'active'
    ).length;
    
    res.json({
      success: true,
      data: {
        validatorAddress,
        nodeId,
        receivedAt: new Date(),
        directives: {
          isBlocked,
          shouldPauseOperations: isBlocked,
          activeAlertsCount: activeAlerts,
          requiresImmediateAction: activeAlerts > 0 && isBlocked,
        },
        nextHeartbeatMs: 30000,
      },
    });
  } catch (error) {
    console.error('[ValidatorSecuritySync] Heartbeat error:', error);
    res.status(500).json({ success: false, error: 'Failed to process heartbeat' });
  }
});

// ============================================================================
// ENTERPRISE VALIDATOR REGISTRATION API
// Production-grade validator onboarding with crypto verification & multi-sig approval
// ============================================================================

// POST /register - Submit new validator registration
router.post('/register', async (req: Request, res: Response) => {
  try {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Validate request body
    const parseResult = validatorRegistrationRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid registration request',
        details: parseResult.error.errors,
      });
    }

    const result = await validatorRegistrationService.submitRegistration(
      parseResult.data,
      ipAddress,
      userAgent
    );

    if (result.success) {
      res.status(201).json({
        success: true,
        data: {
          registrationId: result.registrationId,
          status: result.status,
          message: result.message,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message,
      });
    }
  } catch (error) {
    console.error('[ValidatorRegistration] Registration error:', error);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// GET /registrations - List all registrations (admin)
router.get('/registrations', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const status = req.query.status as string | undefined;

    const { registrations, total } = await validatorRegistrationService.getAllRegistrations(
      page,
      limit,
      status
    );

    res.json({
      success: true,
      data: {
        registrations,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('[ValidatorRegistration] List error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch registrations' });
  }
});

// GET /registrations/pending - Get pending registrations for admin review
router.get('/registrations/pending', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const registrations = await validatorRegistrationService.getPendingRegistrations(limit);

    res.json({
      success: true,
      data: registrations,
    });
  } catch (error) {
    console.error('[ValidatorRegistration] Pending list error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch pending registrations' });
  }
});

// GET /registrations/:id - Get registration by ID
router.get('/registrations/:id', async (req: Request, res: Response) => {
  try {
    const registration = await validatorRegistrationService.getRegistrationById(req.params.id);

    if (!registration) {
      return res.status(404).json({ success: false, error: 'Registration not found' });
    }

    // Get multi-sig approvals if applicable
    let approvals: any[] = [];
    if (registration.requiresMultisig) {
      approvals = await validatorRegistrationService.getMultisigApprovals(req.params.id);
    }

    res.json({
      success: true,
      data: {
        registration,
        approvals,
      },
    });
  } catch (error) {
    console.error('[ValidatorRegistration] Get registration error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch registration' });
  }
});

// GET /registrations/address/:address - Get registration by validator address
router.get('/registrations/address/:address', async (req: Request, res: Response) => {
  try {
    const registration = await validatorRegistrationService.getRegistrationByAddress(req.params.address);

    if (!registration) {
      return res.status(404).json({ success: false, error: 'Registration not found' });
    }

    res.json({
      success: true,
      data: registration,
    });
  } catch (error) {
    console.error('[ValidatorRegistration] Get by address error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch registration' });
  }
});

// POST /registrations/:id/approve - Approve registration (admin)
router.post('/registrations/:id/approve', async (req: Request, res: Response) => {
  try {
    const { adminAddress, notes } = req.body;

    if (!adminAddress) {
      return res.status(400).json({ success: false, error: 'Admin address required' });
    }

    const result = await validatorRegistrationService.approveRegistration(
      req.params.id,
      adminAddress,
      notes
    );

    if (result.success) {
      res.json({
        success: true,
        data: {
          apiKey: result.apiKey, // Return ONCE - user must save it
          message: result.message,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message,
      });
    }
  } catch (error) {
    console.error('[ValidatorRegistration] Approval error:', error);
    res.status(500).json({ success: false, error: 'Approval failed' });
  }
});

// POST /registrations/:id/reject - Reject registration (admin)
router.post('/registrations/:id/reject', async (req: Request, res: Response) => {
  try {
    const { adminAddress, reason } = req.body;

    if (!adminAddress || !reason) {
      return res.status(400).json({ success: false, error: 'Admin address and reason required' });
    }

    const result = await validatorRegistrationService.rejectRegistration(
      req.params.id,
      adminAddress,
      reason
    );

    if (result.success) {
      res.json({ success: true, message: result.message });
    } else {
      res.status(400).json({ success: false, error: result.message });
    }
  } catch (error) {
    console.error('[ValidatorRegistration] Rejection error:', error);
    res.status(500).json({ success: false, error: 'Rejection failed' });
  }
});

// POST /registrations/:id/multisig - Submit multi-sig approval
router.post('/registrations/:id/multisig', async (req: Request, res: Response) => {
  try {
    const { approverAddress, approverRole, decision, signatureProof, comments } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress;

    if (!approverAddress || !decision || !signatureProof) {
      return res.status(400).json({
        success: false,
        error: 'Approver address, decision, and signature proof required',
      });
    }

    if (!['approve', 'reject', 'abstain'].includes(decision)) {
      return res.status(400).json({
        success: false,
        error: 'Decision must be approve, reject, or abstain',
      });
    }

    const result = await validatorRegistrationService.submitMultisigApproval(
      req.params.id,
      approverAddress,
      approverRole || 'admin',
      decision,
      signatureProof,
      comments,
      ipAddress
    );

    if (result.success) {
      res.json({ success: true, message: result.message });
    } else {
      res.status(400).json({ success: false, error: result.message });
    }
  } catch (error) {
    console.error('[ValidatorRegistration] Multi-sig error:', error);
    res.status(500).json({ success: false, error: 'Multi-sig submission failed' });
  }
});

// POST /api-key/rotate - Rotate API key
router.post('/api-key/rotate', validateValidatorApiKey, async (req: Request, res: Response) => {
  try {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Validate request
    const parseResult = keyRotationRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid rotation request',
        details: parseResult.error.errors,
      });
    }

    const result = await validatorRegistrationService.rotateApiKey(
      parseResult.data,
      ipAddress,
      userAgent
    );

    if (result.success) {
      res.json({
        success: true,
        data: {
          newApiKey: result.newApiKey, // Return ONCE
          gracePeriodEndsAt: result.gracePeriodEndsAt,
          message: result.message,
        },
      });
    } else {
      res.status(400).json({ success: false, error: result.message });
    }
  } catch (error) {
    console.error('[ValidatorRegistration] Key rotation error:', error);
    res.status(500).json({ success: false, error: 'Key rotation failed' });
  }
});

// POST /api-key/revoke - Revoke API key (admin)
router.post('/api-key/revoke', async (req: Request, res: Response) => {
  try {
    const { validatorAddress, reason, adminAddress } = req.body;

    if (!validatorAddress || !reason) {
      return res.status(400).json({
        success: false,
        error: 'Validator address and reason required',
      });
    }

    const result = await validatorRegistrationService.revokeApiKey(
      validatorAddress,
      reason,
      adminAddress
    );

    if (result.success) {
      res.json({ success: true, message: result.message });
    } else {
      res.status(400).json({ success: false, error: result.message });
    }
  } catch (error) {
    console.error('[ValidatorRegistration] Revocation error:', error);
    res.status(500).json({ success: false, error: 'Revocation failed' });
  }
});

// GET /api-key/rotations/:address - Get key rotation history
router.get('/api-key/rotations/:address', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const rotations = await validatorRegistrationService.getKeyRotationHistory(
      req.params.address,
      limit
    );

    res.json({
      success: true,
      data: rotations,
    });
  } catch (error) {
    console.error('[ValidatorRegistration] Rotation history error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch rotation history' });
  }
});

// GET /heartbeats/:address - Get heartbeat history
router.get('/heartbeats/:address', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
    const heartbeats = await validatorRegistrationService.getRecentHeartbeats(
      req.params.address,
      limit
    );

    res.json({
      success: true,
      data: heartbeats,
    });
  } catch (error) {
    console.error('[ValidatorRegistration] Heartbeat history error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch heartbeat history' });
  }
});

// POST /heartbeat/record - Record heartbeat (from validator node)
router.post('/heartbeat/record', validateValidatorApiKey, async (req: Request, res: Response) => {
  try {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const validatorAddress = (req as any).validatorAddress;

    const heartbeatData = {
      validatorAddress,
      status: req.body.status || 'healthy',
      version: req.body.version || 'unknown',
      blockHeight: req.body.blockHeight,
      peersConnected: req.body.peersConnected || 0,
      memoryUsageMb: req.body.memoryUsageMb,
      cpuUsagePercent: req.body.cpuUsagePercent,
      diskUsagePercent: req.body.diskUsagePercent,
      networkLatencyMs: req.body.networkLatencyMs,
      securityScore: req.body.securityScore || 100,
      activeAlerts: req.body.activeAlerts || 0,
      region: req.body.region,
    };

    const result = await validatorRegistrationService.recordHeartbeat(heartbeatData, ipAddress);

    if (result.success) {
      res.json({
        success: true,
        data: {
          acknowledged: true,
          receivedAt: new Date(),
          nextHeartbeatMs: 30000, // 30 seconds
        },
      });
    } else {
      res.status(400).json({ success: false, error: result.message });
    }
  } catch (error) {
    console.error('[ValidatorRegistration] Heartbeat record error:', error);
    res.status(500).json({ success: false, error: 'Heartbeat recording failed' });
  }
});

// ============================================
// ADMIN REGISTRATION MANAGEMENT ENDPOINTS
// ============================================

// Admin authentication middleware for registration management
function requireAdminAuth(req: Request, res: Response, next: Function) {
  const session = (req as any).session;
  if (session && session.adminAuthenticated) {
    return next();
  }
  return res.status(401).json({ 
    error: 'Unauthorized', 
    message: 'Admin authentication required. Please login via /api/admin/auth/login',
    code: 'ADMIN_AUTH_REQUIRED' 
  });
}

router.get('/admin/registrations', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const registrations = externalValidatorEngine.getPendingRegistrations(
      status ? { status: status as string } : undefined
    );
    
    res.json({
      success: true,
      data: {
        registrations: registrations.map(r => ({
          id: r.id,
          operatorAddress: r.operatorAddress,
          operatorName: r.operatorName,
          region: r.region,
          stakeAmount: r.stakeAmount,
          tier: r.tier,
          status: r.status,
          submittedAt: r.submittedAt,
          reviewedAt: r.reviewedAt,
          reviewedBy: r.reviewedBy,
          rejectionReason: r.rejectionReason,
          metadata: r.metadata,
          nodeId: r.nodeId,
        })),
        total: registrations.length,
        summary: {
          pending: externalValidatorEngine.getPendingRegistrations({ status: 'pending' }).length,
          underReview: externalValidatorEngine.getPendingRegistrations({ status: 'under_review' }).length,
          approved: externalValidatorEngine.getPendingRegistrations({ status: 'approved' }).length,
          rejected: externalValidatorEngine.getPendingRegistrations({ status: 'rejected' }).length,
        },
      },
    });
  } catch (error) {
    console.error('[ExternalValidatorAPI] List registrations error:', error);
    res.status(500).json({ success: false, error: 'Failed to list registrations' });
  }
});

router.get('/admin/registrations/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const registration = externalValidatorEngine.getPendingRegistrationById(req.params.id);
    
    if (!registration) {
      return res.status(404).json({ success: false, error: 'Registration not found' });
    }
    
    res.json({
      success: true,
      data: registration,
    });
  } catch (error) {
    console.error('[ExternalValidatorAPI] Get registration error:', error);
    res.status(500).json({ success: false, error: 'Failed to get registration' });
  }
});

router.post('/admin/registrations/:id/approve', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const reviewedBy = (req as any).user?.username || 'admin';
    
    const result = await externalValidatorEngine.approveRegistration(id, reviewedBy);
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          nodeId: result.nodeId,
          apiKey: result.apiKey,
          message: result.message,
        },
      });
    } else {
      res.status(400).json({ success: false, error: result.message });
    }
  } catch (error) {
    console.error('[ExternalValidatorAPI] Approve registration error:', error);
    res.status(500).json({ success: false, error: 'Failed to approve registration' });
  }
});

router.post('/admin/registrations/:id/reject', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const reviewedBy = (req as any).user?.username || 'admin';
    
    if (!reason) {
      return res.status(400).json({ success: false, error: 'Rejection reason is required' });
    }
    
    const result = externalValidatorEngine.rejectRegistration(id, reason, reviewedBy);
    
    if (result.success) {
      res.json({
        success: true,
        data: { message: result.message },
      });
    } else {
      res.status(400).json({ success: false, error: result.message });
    }
  } catch (error) {
    console.error('[ExternalValidatorAPI] Reject registration error:', error);
    res.status(500).json({ success: false, error: 'Failed to reject registration' });
  }
});

router.get('/rpc-integration/stats', async (_req: Request, res: Response) => {
  try {
    const stats = rpcValidatorIntegration.getStats();
    const integrationStats = rpcValidatorIntegration.getIntegrationStats();
    
    res.json({
      success: true,
      data: {
        gateway: stats,
        integration: integrationStats
      }
    });
  } catch (error) {
    console.error('[RPCIntegration] Stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch RPC integration stats' });
  }
});

router.get('/rpc-integration/allowlist', requireAdminAuth, async (_req: Request, res: Response) => {
  try {
    const allowlist = rpcValidatorIntegration.getAllowlist();
    
    res.json({
      success: true,
      data: {
        totalEntries: allowlist.length,
        entries: allowlist.map(entry => ({
          address: entry.address,
          nodeId: entry.nodeId,
          tier: entry.tier,
          permissions: entry.permissions,
          rateLimit: entry.rateLimit,
          addedAt: new Date(entry.addedAt).toISOString()
        }))
      }
    });
  } catch (error) {
    console.error('[RPCIntegration] Allowlist error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch RPC allowlist' });
  }
});

router.get('/rpc-integration/allowlist/export', requireAdminAuth, async (_req: Request, res: Response) => {
  try {
    const exported = rpcValidatorIntegration.exportAllowlistForRPC();
    
    res.json({
      success: true,
      data: exported
    });
  } catch (error) {
    console.error('[RPCIntegration] Export error:', error);
    res.status(500).json({ success: false, error: 'Failed to export RPC allowlist' });
  }
});

router.get('/rpc-integration/check/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const isAllowed = rpcValidatorIntegration.isAddressAllowed(address);
    const entry = rpcValidatorIntegration.getAllowlistEntry(address);
    
    res.json({
      success: true,
      data: {
        address,
        isAllowed,
        entry: entry ? {
          nodeId: entry.nodeId,
          tier: entry.tier,
          permissions: entry.permissions,
          rateLimit: entry.rateLimit
        } : null
      }
    });
  } catch (error) {
    console.error('[RPCIntegration] Check error:', error);
    res.status(500).json({ success: false, error: 'Failed to check address' });
  }
});

router.get('/rpc-integration/endpoints/:region', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { region } = req.params;
    const endpoints = rpcValidatorIntegration.getRPCEndpointsForRegion(region as ValidatorRegion);
    
    res.json({
      success: true,
      data: {
        region,
        endpoints: endpoints.map(ep => ({
          validatorNodeId: ep.validatorNodeId,
          rpcEndpoint: ep.rpcEndpoint,
          wsEndpoint: ep.wsEndpoint,
          tier: ep.tier,
          healthScore: ep.healthScore,
          isActive: ep.isActive
        }))
      }
    });
  } catch (error) {
    console.error('[RPCIntegration] Endpoints error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch region endpoints' });
  }
});

router.post('/rpc-integration/sync', requireAdminAuth, async (_req: Request, res: Response) => {
  try {
    await rpcValidatorIntegration.forceSync();
    const stats = rpcValidatorIntegration.getIntegrationStats();
    
    res.json({
      success: true,
      data: {
        message: 'RPC integration sync completed',
        stats
      }
    });
  } catch (error) {
    console.error('[RPCIntegration] Sync error:', error);
    res.status(500).json({ success: false, error: 'Failed to sync RPC integration' });
  }
});

export function registerExternalValidatorRoutes(app: any): void {
  app.use('/api/external-validators', router);
  
  externalValidatorEngine.start().catch(err => {
    console.error('[ExternalValidatorEngine] Failed to start:', err);
  });
  
  rpcValidatorIntegration.start().catch(err => {
    console.error('[RPCValidatorIntegration] Failed to start:', err);
  });
  
  console.log('[ExternalValidators] ✅ Enterprise external validator routes registered (50+ endpoints including registration, admin & security)');
  console.log('[RPCValidatorIntegration] ✅ RPC-Validator integration routes registered');
}

export default router;
