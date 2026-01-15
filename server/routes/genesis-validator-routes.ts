/**
 * TBURN Genesis Validator Management API Routes
 * Production-grade REST API for genesis validator key generation and management
 * 
 * Security: These routes require admin authentication
 * Chain ID: 5800 | TBURN Mainnet
 */

import { Router, Request, Response } from 'express';
import { genesisValidatorGenerator } from '../services/genesis-validator-generator';
import { db } from '../db';
import { genesisValidators, genesisConfig } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

const router = Router();

/**
 * GET /api/genesis-validators/status
 * Get current genesis validator status and count
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const count = await genesisValidatorGenerator.getValidatorCount();
    const validators = await genesisValidatorGenerator.getAllValidators();
    
    // Group by tier
    const byTier = validators.reduce((acc, v) => {
      const tier = v.tier || 'unknown';
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      success: true,
      data: {
        totalCount: count,
        targetCount: 125,
        byTier,
        isComplete: count >= 125,
        chainId: 5800,
        network: 'TBURN Mainnet',
      },
    });
  } catch (error) {
    console.error('[GenesisValidator] Status error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get status',
    });
  }
});

/**
 * GET /api/genesis-validators
 * List all genesis validators (without private keys)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const validators = await genesisValidatorGenerator.getAllValidators();
    
    res.json({
      success: true,
      data: {
        count: validators.length,
        validators,
      },
    });
  } catch (error) {
    console.error('[GenesisValidator] List error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list validators',
    });
  }
});

/**
 * GET /api/genesis-validators/:address
 * Get single genesis validator by address
 */
router.get('/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    
    const validators = await db.select()
      .from(genesisValidators)
      .where(eq(genesisValidators.address, address.toLowerCase()))
      .limit(1);

    if (validators.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Validator not found',
      });
      return;
    }

    // Remove sensitive data before returning
    const validator = validators[0];
    res.json({
      success: true,
      data: {
        id: validator.id,
        address: validator.address,
        name: validator.name,
        tier: validator.tier,
        priority: validator.priority,
        nodePublicKey: validator.nodePublicKey,
        initialStake: validator.initialStake,
        commission: validator.commission,
        status: validator.status,
        isVerified: validator.isVerified,
        createdAt: validator.createdAt,
      },
    });
  } catch (error) {
    console.error('[GenesisValidator] Get error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get validator',
    });
  }
});

/**
 * POST /api/genesis-validators/generate
 * Generate 125 genesis validator key pairs
 * 
 * ⚠️ CRITICAL SECURITY WARNING:
 * This endpoint returns private keys ONCE. They must be:
 * 1. Immediately exported to a secure location (GCP Secret Manager, HSM, etc.)
 * 2. Never logged or stored in plaintext
 * 3. The response should be consumed immediately and not cached
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    console.log('[GenesisValidator] Starting 125 validator key generation...');
    
    // Check if already generated
    const currentCount = await genesisValidatorGenerator.getValidatorCount();
    if (currentCount >= 125) {
      res.json({
        success: true,
        message: `Already have ${currentCount} genesis validators. Generation skipped.`,
        data: {
          alreadyGenerated: true,
          count: currentCount,
        },
      });
      return;
    }

    // Generate all validators
    const result = await genesisValidatorGenerator.generateAndSaveAllValidators();

    if (!result.success) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate validators',
        errors: result.errors,
      });
      return;
    }

    console.log(`[GenesisValidator] Generated ${result.saved} validators, skipped ${result.skipped}`);

    // Return the validators with private keys
    // ⚠️ This is the ONLY time private keys are exposed
    res.json({
      success: true,
      message: `Generated ${result.saved} genesis validators`,
      warning: 'CRITICAL: Private keys are shown ONLY ONCE. Export them immediately to a secure location.',
      data: {
        configId: result.configId,
        saved: result.saved,
        skipped: result.skipped,
        total: result.validators.length,
        validators: result.validators.map(v => ({
          index: v.index,
          name: v.name,
          tier: v.tier,
          address: v.address,
          publicKey: v.publicKey,
          privateKey: v.privateKey, // ⚠️ EXPORT IMMEDIATELY
        })),
        errors: result.errors,
      },
    });
  } catch (error) {
    console.error('[GenesisValidator] Generation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate validators',
    });
  }
});

/**
 * POST /api/genesis-validators/export-for-secret-manager
 * Generate validators and format output for GCP Secret Manager import
 */
router.post('/export-for-secret-manager', async (req: Request, res: Response) => {
  try {
    const currentCount = await genesisValidatorGenerator.getValidatorCount();
    
    if (currentCount >= 125) {
      res.json({
        success: false,
        error: 'Validators already exist. Cannot export private keys after initial generation.',
        message: 'Private keys are only available during initial generation. Re-deploy or use backup.',
      });
      return;
    }

    // Generate and format for Secret Manager
    const result = await genesisValidatorGenerator.generateAndSaveAllValidators();

    if (!result.success) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate validators',
        errors: result.errors,
      });
      return;
    }

    // Format for Secret Manager
    const secretManagerFormat = genesisValidatorGenerator.formatForSecretManager(
      result.validators.map(v => ({
        name: v.name,
        address: v.address,
        privateKey: v.privateKey,
      }))
    );

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="tburn-genesis-validators-secrets.json"');
    res.send(secretManagerFormat);
  } catch (error) {
    console.error('[GenesisValidator] Export error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export validators',
    });
  }
});

/**
 * GET /api/genesis-validators/by-tier/:tier
 * Get validators filtered by tier
 */
router.get('/by-tier/:tier', async (req: Request, res: Response) => {
  try {
    const { tier } = req.params;
    const validTiers = ['core', 'enterprise', 'partner', 'community', 'genesis'];
    
    if (!validTiers.includes(tier.toLowerCase())) {
      res.status(400).json({
        success: false,
        error: `Invalid tier. Must be one of: ${validTiers.join(', ')}`,
      });
      return;
    }

    const validators = await db.select({
      id: genesisValidators.id,
      address: genesisValidators.address,
      name: genesisValidators.name,
      tier: genesisValidators.tier,
      priority: genesisValidators.priority,
      nodePublicKey: genesisValidators.nodePublicKey,
      status: genesisValidators.status,
      isVerified: genesisValidators.isVerified,
    })
      .from(genesisValidators)
      .where(eq(genesisValidators.tier, tier.toLowerCase()))
      .orderBy(desc(genesisValidators.priority));

    res.json({
      success: true,
      data: {
        tier,
        count: validators.length,
        validators,
      },
    });
  } catch (error) {
    console.error('[GenesisValidator] Filter by tier error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to filter validators',
    });
  }
});

/**
 * POST /api/genesis-validators/verify/:address
 * Mark a validator as verified (admin only)
 */
router.post('/verify/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const { verifiedBy } = req.body;

    const updated = await db.update(genesisValidators)
      .set({
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBy: verifiedBy || 'admin',
        updatedAt: new Date(),
      })
      .where(eq(genesisValidators.address, address.toLowerCase()))
      .returning();

    if (updated.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Validator not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Validator verified successfully',
      data: {
        address: updated[0].address,
        name: updated[0].name,
        isVerified: updated[0].isVerified,
        verifiedAt: updated[0].verifiedAt,
      },
    });
  } catch (error) {
    console.error('[GenesisValidator] Verify error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify validator',
    });
  }
});

export function registerGenesisValidatorRoutes(app: any): void {
  app.use('/api/genesis-validators', router);
  console.log('[GenesisValidators] ✅ Genesis validator routes registered');
}

export default router;
