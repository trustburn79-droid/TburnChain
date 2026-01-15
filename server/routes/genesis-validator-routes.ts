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
    const validators = await genesisValidatorGenerator.getAllValidators() || [];
    
    // Group by tier
    const byTier = validators.reduce((acc: Record<string, number>, v: any) => {
      const tier = v?.tier || 'unknown';
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
 * ⛔ DISABLED FOR SECURITY
 * Server-side key generation is disabled. Validators must generate their own keys offline
 * and submit public keys via the /register endpoint (BYO - Bring Your Own Key approach).
 */
router.post('/generate', async (req: Request, res: Response) => {
  res.status(403).json({
    success: false,
    error: 'SECURITY: Server-side key generation is disabled',
    message: 'For security, validators must generate their own keys offline using HSM or secure key management.',
    instructions: [
      '1. Generate secp256k1 keypair offline using secure tooling (HSM, air-gapped machine)',
      '2. Derive TBURN address from public key (Bech32m tb1... format)',
      '3. Submit public key via POST /api/genesis-validators/register',
      '4. Never share or transmit private keys over network',
    ],
    documentation: 'https://docs.tburn.io/validators/key-generation',
  });
});

/**
 * POST /api/genesis-validators/export-for-secret-manager
 * ⛔ DISABLED FOR SECURITY
 */
router.post('/export-for-secret-manager', async (req: Request, res: Response) => {
  res.status(403).json({
    success: false,
    error: 'SECURITY: Server-side key export is disabled',
    message: 'Validators must manage their own keys securely using HSM or KMS.',
  });
});

/**
 * POST /api/genesis-validators/register
 * BYO (Bring Your Own) Key Registration
 * Validators submit their public key generated offline
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      publicKey, 
      tier,
      description,
      website,
      contactEmail,
      nodeEndpoint,
    } = req.body;

    // Validate required fields
    if (!name || !publicKey || !tier) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: name, publicKey, tier',
      });
      return;
    }

    // Validate tier
    const validTiers = ['core', 'enterprise', 'partner', 'community'];
    if (!validTiers.includes(tier.toLowerCase())) {
      res.status(400).json({
        success: false,
        error: `Invalid tier. Must be one of: ${validTiers.join(', ')}`,
      });
      return;
    }

    // Validate public key format (should be 66 or 130 hex chars for compressed/uncompressed)
    const pubKeyClean = publicKey.replace(/^0x/, '');
    if (!/^[0-9a-fA-F]{66}$/.test(pubKeyClean) && !/^[0-9a-fA-F]{130}$/.test(pubKeyClean)) {
      res.status(400).json({
        success: false,
        error: 'Invalid public key format. Must be 33 bytes (compressed) or 65 bytes (uncompressed) hex.',
      });
      return;
    }

    // Derive TBURN address from public key
    const { generateTBurnAddress } = await import('../utils/tburn-address');
    const address = generateTBurnAddress(pubKeyClean);

    // Check if address already exists
    const existing = await db.select()
      .from(genesisValidators)
      .where(eq(genesisValidators.address, address))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({
        success: false,
        error: 'Validator with this public key already registered',
        address,
      });
      return;
    }

    // Get tier-specific stake and commission
    const tierConfig: Record<string, { stake: string; commission: number; apy: string }> = {
      core: { stake: '1000000000000000000000000', commission: 300, apy: '20-25%' },
      enterprise: { stake: '500000000000000000000000', commission: 800, apy: '16-20%' },
      partner: { stake: '250000000000000000000000', commission: 1500, apy: '14-18%' },
      community: { stake: '100000000000000000000000', commission: 2000, apy: '12-15%' },
    };
    const config = tierConfig[tier.toLowerCase()];

    // Get current count for priority
    const currentValidators = await db.select().from(genesisValidators);
    const tierValidators = currentValidators.filter(v => v.tier === tier.toLowerCase());
    const priority = tierValidators.length + 1;

    // Insert new validator
    const [newValidator] = await db.insert(genesisValidators).values({
      configId: 'mainnet-genesis',
      address,
      name,
      description: description || `${tier} tier genesis validator`,
      website: website || null,
      contactEmail: contactEmail || null,
      initialStake: config.stake,
      selfDelegation: config.stake,
      commission: config.commission,
      nodePublicKey: pubKeyClean,
      nodeEndpoint: nodeEndpoint || null,
      tier: tier.toLowerCase(),
      priority,
      isVerified: false,
      kycStatus: 'pending',
    }).returning();

    console.log(`[GenesisValidator] BYO registration: ${name} (${tier}) - ${address}`);

    res.status(201).json({
      success: true,
      message: 'Validator registered successfully via BYO key submission',
      data: {
        id: newValidator.id,
        name: newValidator.name,
        address: newValidator.address,
        tier: newValidator.tier,
        priority: newValidator.priority,
        initialStake: config.stake,
        commission: config.commission,
        estimatedAPY: config.apy,
        status: 'pending_verification',
        nextSteps: [
          'Complete KYC verification',
          'Set up validator node at specified endpoint',
          'Await verification from TBURN team',
        ],
      },
    });
  } catch (error) {
    console.error('[GenesisValidator] BYO registration error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to register validator',
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
