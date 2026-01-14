/**
 * TBURN Enterprise Remote Signer API Routes
 * Production-grade REST API for remote signing operations
 */

import { Router, Request, Response } from 'express';
import { 
  remoteSignerService, 
  SigningRequest,
  ValidatorTier 
} from '../core/security/enterprise-remote-signer';

const router = Router();

router.get('/health', async (_req: Request, res: Response) => {
  try {
    const health = await remoteSignerService.healthCheck();
    res.json({
      success: true,
      healthy: health.healthy,
      details: health.details,
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      healthy: false,
      error: 'Health check failed' 
    });
  }
});

router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const stats = remoteSignerService.getStats();
    res.json({
      success: true,
      data: {
        totalRequests: stats.totalRequests,
        successfulSignings: stats.successfulSignings,
        failedSignings: stats.failedSignings,
        successRate: stats.totalRequests > 0 
          ? ((stats.successfulSignings / stats.totalRequests) * 100).toFixed(2) + '%'
          : 'N/A',
        averageResponseTimeMs: stats.averageResponseTimeMs.toFixed(2),
        activeValidators: stats.activeValidators,
        keyRotations: stats.keyRotations,
        uptime: stats.uptime,
        lastHealthCheck: new Date(stats.lastHealthCheck).toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

router.get('/validators', async (_req: Request, res: Response) => {
  try {
    const validators = remoteSignerService.getAllValidators();
    res.json({
      success: true,
      count: validators.length,
      data: validators.map(v => ({
        validatorAddress: v.validatorAddress,
        publicKey: v.publicKey,
        tier: v.tier,
        keyVersion: v.keyVersion,
        createdAt: new Date(v.createdAt).toISOString(),
        rotatedAt: v.rotatedAt ? new Date(v.rotatedAt).toISOString() : null,
        permissions: {
          canSignBlocks: v.permissions.canSignBlocks,
          canSignAttestations: v.permissions.canSignAttestations,
          canSignGovernance: v.permissions.canSignGovernance,
          canSignWithdrawals: v.permissions.canSignWithdrawals,
          maxDailySignings: v.permissions.maxDailySignings
        },
        metadata: {
          operatorName: v.metadata.operatorName,
          region: v.metadata.region,
          nodeId: v.metadata.nodeId
        }
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch validators' });
  }
});

router.get('/validators/:tier', async (req: Request, res: Response) => {
  try {
    const tier = req.params.tier as ValidatorTier;
    const validTiers: ValidatorTier[] = ['genesis', 'pioneer', 'standard', 'community'];
    
    if (!validTiers.includes(tier)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid tier. Must be: genesis, pioneer, standard, or community' 
      });
    }
    
    const validators = remoteSignerService.getValidatorsByTier(tier);
    res.json({
      success: true,
      tier,
      count: validators.length,
      data: validators.map(v => ({
        validatorAddress: v.validatorAddress,
        publicKey: v.publicKey,
        keyVersion: v.keyVersion,
        metadata: v.metadata
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch validators by tier' });
  }
});

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { 
      validatorAddress, 
      privateKey, 
      publicKey, 
      operatorName, 
      region, 
      nodeId, 
      tier 
    } = req.body;

    if (!validatorAddress || !privateKey || !publicKey || !operatorName || !nodeId || !tier) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: validatorAddress, privateKey, publicKey, operatorName, nodeId, tier'
      });
    }

    const validTiers: ValidatorTier[] = ['genesis', 'pioneer', 'standard', 'community'];
    if (!validTiers.includes(tier)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid tier. Must be: genesis, pioneer, standard, or community'
      });
    }

    const result = await remoteSignerService.registerValidator({
      validatorAddress,
      privateKey,
      publicKey,
      operatorName,
      region: region || 'asia-northeast3',
      nodeId,
      tier
    });

    if (result.success) {
      res.status(201).json({
        success: true,
        message: result.message,
        secretName: result.secretName,
        validatorAddress
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message
      });
    }
  } catch (error) {
    console.error('[RemoteSignerAPI] Registration error:', error);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

router.post('/sign', async (req: Request, res: Response) => {
  try {
    const signingRequest: SigningRequest = req.body;

    if (!signingRequest.requestId || !signingRequest.validatorAddress || 
        !signingRequest.operation || !signingRequest.payload) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: requestId, validatorAddress, operation, payload'
      });
    }

    const response = await remoteSignerService.processSigningRequest(signingRequest);

    if (response.success) {
      res.json({
        success: true,
        requestId: response.requestId,
        signature: response.signature,
        signatureType: response.signatureType,
        publicKey: response.publicKey,
        auditId: response.auditId,
        timestamp: response.timestamp
      });
    } else {
      res.status(400).json({
        success: false,
        requestId: response.requestId,
        error: response.error,
        auditId: response.auditId
      });
    }
  } catch (error) {
    console.error('[RemoteSignerAPI] Signing error:', error);
    res.status(500).json({ success: false, error: 'Signing request failed' });
  }
});

router.post('/rotate-key', async (req: Request, res: Response) => {
  try {
    const { validatorAddress, newPrivateKey } = req.body;

    if (!validatorAddress || !newPrivateKey) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: validatorAddress, newPrivateKey'
      });
    }

    const success = await remoteSignerService.rotateValidatorKey(validatorAddress, newPrivateKey);

    if (success) {
      res.json({
        success: true,
        message: 'Key rotated successfully',
        validatorAddress
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Key rotation failed. Validator may not be registered.'
      });
    }
  } catch (error) {
    console.error('[RemoteSignerAPI] Key rotation error:', error);
    res.status(500).json({ success: false, error: 'Key rotation failed' });
  }
});

router.delete('/validators/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    if (!address) {
      return res.status(400).json({
        success: false,
        error: 'Validator address required'
      });
    }

    const success = await remoteSignerService.unregisterValidator(address);

    if (success) {
      res.json({
        success: true,
        message: 'Validator unregistered successfully',
        validatorAddress: address
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Validator not found'
      });
    }
  } catch (error) {
    console.error('[RemoteSignerAPI] Unregistration error:', error);
    res.status(500).json({ success: false, error: 'Unregistration failed' });
  }
});

router.get('/audit-logs', async (req: Request, res: Response) => {
  try {
    const count = parseInt(req.query.count as string) || 100;
    const logs = remoteSignerService.getAuditLogs(count);
    
    res.json({
      success: true,
      count: logs.length,
      data: logs.map(log => ({
        auditId: log.auditId,
        requestId: log.requestId,
        validatorAddress: log.validatorAddress,
        operation: log.operation,
        success: log.success,
        timestamp: new Date(log.timestamp).toISOString(),
        nodeId: log.nodeId,
        responseTimeMs: log.responseTimeMs,
        keyVersion: log.keyVersion,
        errorReason: log.errorReason
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch audit logs' });
  }
});

router.get('/audit-logs/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const count = parseInt(req.query.count as string) || 50;
    const logs = remoteSignerService.getAuditLogsByValidator(address, count);
    
    res.json({
      success: true,
      validatorAddress: address,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch validator audit logs' });
  }
});

router.get('/expiring-keys', async (_req: Request, res: Response) => {
  try {
    const expiringKeys = await remoteSignerService.checkKeyExpiration();
    
    res.json({
      success: true,
      count: expiringKeys.length,
      data: expiringKeys.map(key => ({
        validatorAddress: key.validatorAddress,
        expiresAt: key.expiresAt ? new Date(key.expiresAt).toISOString() : null,
        keyVersion: key.keyVersion,
        tier: key.tier
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to check expiring keys' });
  }
});

export default router;
