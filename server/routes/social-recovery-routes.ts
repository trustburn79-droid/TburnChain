/**
 * Social Recovery API Routes
 * 
 * 프로덕션 레벨 엔터프라이즈급 소셜 복구 API
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { enterpriseSocialRecoveryService } from '../services/account-abstraction/EnterpriseSocialRecoveryService';

const router = Router();

const setupGuardiansSchema = z.object({
  walletAddress: z.string().min(1),
  guardians: z.array(z.object({
    address: z.string().min(1),
    email: z.string().email().optional(),
    name: z.string().optional(),
  })).min(2).max(7),
  threshold: z.number().int().positive().optional(),
});

const addGuardianSchema = z.object({
  walletAddress: z.string().min(1),
  guardian: z.object({
    address: z.string().min(1),
    email: z.string().email().optional(),
    name: z.string().optional(),
  }),
  ownerSignature: z.string().min(1),
});

const removeGuardianSchema = z.object({
  walletAddress: z.string().min(1),
  guardianAddress: z.string().min(1),
  ownerSignature: z.string().min(1),
});

const initiateRecoverySchema = z.object({
  walletAddress: z.string().min(1),
  initiatorEmail: z.string().email(),
  newOwnerAddress: z.string().min(1),
});

const approveRecoverySchema = z.object({
  sessionId: z.string().uuid(),
  guardianAddress: z.string().min(1),
  signature: z.string().min(1),
});

const rejectRecoverySchema = z.object({
  sessionId: z.string().uuid(),
  guardianAddress: z.string().min(1),
  reason: z.string().optional(),
});

const cancelRecoverySchema = z.object({
  sessionId: z.string().uuid(),
  ownerSignature: z.string().min(1),
  reason: z.string().optional(),
});

router.post('/guardians/setup', async (req: Request, res: Response) => {
  try {
    const parseResult = setupGuardiansSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid request', details: parseResult.error.errors });
    }

    const { walletAddress, guardians, threshold } = parseResult.data;
    const result = await enterpriseSocialRecoveryService.setupGuardians(walletAddress, guardians, threshold);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      guardiansAdded: result.guardiansAdded,
      message: `Successfully configured ${result.guardiansAdded} guardians`,
    });
  } catch (error) {
    console.error('[SocialRecovery] Setup guardians error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/guardians/add', async (req: Request, res: Response) => {
  try {
    const parseResult = addGuardianSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid request', details: parseResult.error.errors });
    }

    const { walletAddress, guardian, ownerSignature } = parseResult.data;
    const result = await enterpriseSocialRecoveryService.addGuardian(walletAddress, guardian, ownerSignature);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      guardianId: result.guardianId,
      message: 'Guardian added successfully',
    });
  } catch (error) {
    console.error('[SocialRecovery] Add guardian error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/guardians/remove', async (req: Request, res: Response) => {
  try {
    const parseResult = removeGuardianSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid request', details: parseResult.error.errors });
    }

    const { walletAddress, guardianAddress, ownerSignature } = parseResult.data;
    const result = await enterpriseSocialRecoveryService.removeGuardian(walletAddress, guardianAddress, ownerSignature);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      message: 'Guardian removed successfully',
    });
  } catch (error) {
    console.error('[SocialRecovery] Remove guardian error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/guardians/:walletAddress', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    const config = enterpriseSocialRecoveryService.getWalletRecoveryConfig(walletAddress);

    res.json({
      success: true,
      walletAddress: walletAddress.toLowerCase(),
      guardians: config.guardians.map(g => ({
        id: g.id,
        address: g.walletAddress,
        name: g.name,
        addedAt: g.addedAt,
        isActive: g.isActive,
        trustScore: g.trustScore,
      })),
      threshold: config.threshold,
      isProtected: config.isProtected,
      hasActiveRecovery: !!config.activeSession,
    });
  } catch (error) {
    console.error('[SocialRecovery] Get guardians error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/recovery/initiate', async (req: Request, res: Response) => {
  try {
    const parseResult = initiateRecoverySchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid request', details: parseResult.error.errors });
    }

    const { walletAddress, initiatorEmail, newOwnerAddress } = parseResult.data;
    const result = await enterpriseSocialRecoveryService.initiateRecovery(
      walletAddress,
      initiatorEmail,
      newOwnerAddress,
      {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      }
    );

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      sessionId: result.sessionId,
      message: 'Recovery session initiated. Guardians will be notified.',
    });
  } catch (error) {
    console.error('[SocialRecovery] Initiate recovery error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/recovery/approve', async (req: Request, res: Response) => {
  try {
    const parseResult = approveRecoverySchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid request', details: parseResult.error.errors });
    }

    const { sessionId, guardianAddress, signature } = parseResult.data;
    const result = await enterpriseSocialRecoveryService.approveRecovery(sessionId, guardianAddress, signature);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      remainingApprovals: result.remainingApprovals,
      message: result.remainingApprovals === 0 
        ? 'Threshold reached! Timelock period started.'
        : `Approval recorded. ${result.remainingApprovals} more approvals needed.`,
    });
  } catch (error) {
    console.error('[SocialRecovery] Approve recovery error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/recovery/reject', async (req: Request, res: Response) => {
  try {
    const parseResult = rejectRecoverySchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid request', details: parseResult.error.errors });
    }

    const { sessionId, guardianAddress, reason } = parseResult.data;
    const result = await enterpriseSocialRecoveryService.rejectRecovery(sessionId, guardianAddress, reason);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      message: 'Recovery rejected by guardian.',
    });
  } catch (error) {
    console.error('[SocialRecovery] Reject recovery error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/recovery/execute/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const result = await enterpriseSocialRecoveryService.executeRecovery(sessionId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      newOwner: result.newOwner,
      message: 'Recovery executed successfully. Wallet ownership has been transferred.',
    });
  } catch (error) {
    console.error('[SocialRecovery] Execute recovery error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/recovery/cancel', async (req: Request, res: Response) => {
  try {
    const parseResult = cancelRecoverySchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid request', details: parseResult.error.errors });
    }

    const { sessionId, ownerSignature, reason } = parseResult.data;
    const result = await enterpriseSocialRecoveryService.cancelRecovery(sessionId, ownerSignature, reason);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      message: 'Recovery session cancelled.',
    });
  } catch (error) {
    console.error('[SocialRecovery] Cancel recovery error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/recovery/session/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const session = enterpriseSocialRecoveryService.getRecoverySession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Recovery session not found' });
    }

    res.json({
      success: true,
      session: {
        sessionId: session.sessionId,
        walletAddress: session.walletAddress,
        newOwnerAddress: session.newOwnerAddress,
        status: session.status,
        requiredApprovals: session.requiredApprovals,
        currentApprovals: session.currentApprovals,
        approvedGuardians: session.approvedGuardians,
        rejectedGuardians: session.rejectedGuardians,
        initiatedAt: session.initiatedAt,
        timelockEndsAt: session.timelockEndsAt,
        expiresAt: session.expiresAt,
        executedAt: session.executedAt,
        securityLevel: session.securityLevel,
        auditLog: session.auditLog,
      },
    });
  } catch (error) {
    console.error('[SocialRecovery] Get session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/recovery/wallet/:walletAddress', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    const config = enterpriseSocialRecoveryService.getWalletRecoveryConfig(walletAddress);

    res.json({
      success: true,
      walletAddress: walletAddress.toLowerCase(),
      isProtected: config.isProtected,
      guardianCount: config.guardians.length,
      threshold: config.threshold,
      activeSession: config.activeSession ? {
        sessionId: config.activeSession.sessionId,
        status: config.activeSession.status,
        currentApprovals: config.activeSession.currentApprovals,
        requiredApprovals: config.activeSession.requiredApprovals,
        timelockEndsAt: config.activeSession.timelockEndsAt,
      } : null,
    });
  } catch (error) {
    console.error('[SocialRecovery] Get wallet recovery status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const stats = enterpriseSocialRecoveryService.getStats();

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('[SocialRecovery] Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export function registerSocialRecoveryRoutes(app: any): void {
  app.use('/api/social-recovery', router);
  console.log('[Routes] ✅ Social Recovery routes registered (/api/social-recovery/*)');
}

export default router;
