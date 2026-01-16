/**
 * TBURN Validator Invitation Code Routes
 * Manages invitation codes for genesis validator registration
 * Implements tier-based quotas and access control
 * 
 * Security:
 * - Public: /quotas (read-only summary)
 * - Public: /validate (code validation, rate limited)
 * - Admin only: /admin/* (code generation, listing)
 * - Protected: /use (requires valid code)
 */

import { Router, Request, Response } from 'express';
import { db } from '../db';
import { validatorInvitationCodes, genesisValidators } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import crypto from 'crypto';
import { requireAdmin, createRateLimiter } from '../middleware/auth';

const router = Router();

const validateRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 10,
});

const useCodeRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 5,
});

const TIER_QUOTAS: Record<string, number> = {
  core: 10,
  enterprise: 25,
  partner: 40,
  community: 50
};

function generateInvitationCode(tier: string): string {
  const prefix = tier.substring(0, 2).toUpperCase();
  const randomPart = crypto.randomBytes(8).toString('hex').toUpperCase();
  return `TB-${prefix}-${randomPart}`;
}

router.get('/quotas', async (_req: Request, res: Response) => {
  try {
    const tierCounts = await db
      .select({
        tier: genesisValidators.tier,
        count: sql<number>`COUNT(*)::int`
      })
      .from(genesisValidators)
      .groupBy(genesisValidators.tier);

    const quotas = Object.entries(TIER_QUOTAS).map(([tier, total]) => {
      const registered = tierCounts.find(t => t.tier === tier)?.count || 0;
      return {
        tier,
        total,
        registered,
        remaining: Math.max(0, total - registered),
        isFull: registered >= total
      };
    });

    const totalRegistered = quotas.reduce((sum, q) => sum + q.registered, 0);
    const totalSlots = Object.values(TIER_QUOTAS).reduce((sum, v) => sum + v, 0);

    res.json({
      success: true,
      data: {
        quotas,
        summary: {
          totalSlots,
          totalRegistered,
          totalRemaining: totalSlots - totalRegistered
        }
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('[InvitationCodes] Error fetching quotas:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch tier quotas' 
    });
  }
});

router.post('/validate', validateRateLimiter, async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invitation code is required'
      });
    }

    const normalizedCode = code.trim().toUpperCase();

    const [invitation] = await db
      .select()
      .from(validatorInvitationCodes)
      .where(eq(validatorInvitationCodes.code, normalizedCode));

    if (!invitation) {
      return res.status(404).json({
        success: false,
        error: 'Invalid invitation code'
      });
    }

    if (invitation.isUsed) {
      return res.status(400).json({
        success: false,
        error: 'Invitation code has already been used'
      });
    }

    if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Invitation code has expired'
      });
    }

    const tierRegistered = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(genesisValidators)
      .where(eq(genesisValidators.tier, invitation.tier));

    const currentCount = tierRegistered[0]?.count || 0;
    const tierQuota = TIER_QUOTAS[invitation.tier] || 0;

    if (currentCount >= tierQuota) {
      return res.status(400).json({
        success: false,
        error: `${invitation.tier} tier has reached maximum capacity`
      });
    }

    res.json({
      success: true,
      data: {
        valid: true,
        tier: invitation.tier,
        remainingSlots: tierQuota - currentCount,
        expiresAt: invitation.expiresAt
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('[InvitationCodes] Error validating code:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to validate invitation code' 
    });
  }
});

router.post('/admin/generate', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { tier, count = 1, expiresInDays = 30, notes, createdBy = 'admin' } = req.body;

    if (!tier || !TIER_QUOTAS[tier]) {
      return res.status(400).json({
        success: false,
        error: 'Valid tier is required (core, enterprise, partner, community)'
      });
    }

    const numCodes = Math.min(Math.max(1, parseInt(count) || 1), 100);
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (parseInt(expiresInDays) || 30));

    const generatedCodes: string[] = [];

    for (let i = 0; i < numCodes; i++) {
      const code = generateInvitationCode(tier);
      
      await db.insert(validatorInvitationCodes).values({
        code,
        tier,
        isUsed: false,
        expiresAt,
        createdBy,
        notes: notes || `Generated for ${tier} tier validators`
      });

      generatedCodes.push(code);
    }

    res.json({
      success: true,
      data: {
        codes: generatedCodes,
        tier,
        count: generatedCodes.length,
        expiresAt
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('[InvitationCodes] Error generating codes:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate invitation codes' 
    });
  }
});

router.get('/admin/list', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { tier, used } = req.query;

    let query = db.select().from(validatorInvitationCodes);

    const codes = await query;

    let filteredCodes = codes;
    
    if (tier && typeof tier === 'string') {
      filteredCodes = filteredCodes.filter(c => c.tier === tier);
    }
    
    if (used !== undefined) {
      const isUsed = used === 'true';
      filteredCodes = filteredCodes.filter(c => c.isUsed === isUsed);
    }

    const summary = {
      total: filteredCodes.length,
      used: filteredCodes.filter(c => c.isUsed).length,
      available: filteredCodes.filter(c => !c.isUsed).length,
      expired: filteredCodes.filter(c => c.expiresAt && new Date(c.expiresAt) < new Date()).length
    };

    res.json({
      success: true,
      data: {
        codes: filteredCodes,
        summary
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('[InvitationCodes] Error listing codes:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to list invitation codes' 
    });
  }
});

router.post('/use', useCodeRateLimiter, async (req: Request, res: Response) => {
  try {
    const { code, validatorAddress } = req.body;

    if (!code || !validatorAddress) {
      return res.status(400).json({
        success: false,
        error: 'Code and validator address are required'
      });
    }

    const normalizedCode = code.trim().toUpperCase();

    const [invitation] = await db
      .select()
      .from(validatorInvitationCodes)
      .where(eq(validatorInvitationCodes.code, normalizedCode));

    if (!invitation) {
      return res.status(404).json({
        success: false,
        error: 'Invalid invitation code'
      });
    }

    if (invitation.isUsed) {
      return res.status(400).json({
        success: false,
        error: 'Invitation code has already been used'
      });
    }

    if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Invitation code has expired'
      });
    }

    await db
      .update(validatorInvitationCodes)
      .set({
        isUsed: true,
        usedBy: validatorAddress,
        usedAt: new Date()
      })
      .where(eq(validatorInvitationCodes.id, invitation.id));

    res.json({
      success: true,
      data: {
        codeId: invitation.id,
        tier: invitation.tier,
        usedBy: validatorAddress
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('[InvitationCodes] Error using code:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to use invitation code' 
    });
  }
});

export default router;
