/**
 * TBURN Enterprise Key Management API Routes
 * Production-Grade REST API for Hybrid Key Management
 * 
 * Security: All endpoints require admin authentication
 * Audit: All operations are logged
 * 
 * Chain ID: 5800 | TBURN Mainnet
 */

import { Router, Request, Response } from 'express';
import { hybridKeyManager, TransactionRequest } from '../services/hybrid-key-manager';
import { gcpKmsClient } from '../core/kms/gcp-kms-client';
import { requireAdmin, createRateLimiter } from '../middleware/auth';
import { z } from 'zod';
import crypto from 'crypto';

const router = Router();

const keyManagementRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 30,
});

const signTransactionSchema = z.object({
  to: z.string().min(1),
  amount: z.string().min(1),
  category: z.enum(['COMMUNITY', 'REWARDS', 'INVESTORS', 'ECOSYSTEM', 'TEAM', 'FOUNDATION']),
  subcategory: z.string().optional(),
  memo: z.string().optional(),
});

const refillSchema = z.object({
  amount: z.string().optional(),
});

const updatePolicySchema = z.object({
  smallTransferThreshold: z.string().optional(),
  mediumTransferThreshold: z.string().optional(),
  largeTransferThreshold: z.string().optional(),
  requireMultisigThreshold: z.string().optional(),
});

const updateConfigSchema = z.object({
  minBalance: z.string().optional(),
  maxBalance: z.string().optional(),
  refillThreshold: z.string().optional(),
  refillAmount: z.string().optional(),
  dailyBudget: z.string().optional(),
  checkIntervalMs: z.number().optional(),
});

router.get('/status', keyManagementRateLimiter, async (req: Request, res: Response) => {
  try {
    const status = hybridKeyManager.getStatus();
    
    res.json({
      success: true,
      data: {
        ...status,
        chainId: 5800,
        network: 'TBURN Mainnet',
        version: '1.0.0',
      },
    });
  } catch (error) {
    console.error('[KeyManagement] Status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get status',
    });
  }
});

router.get('/kms/status', requireAdmin, async (req: Request, res: Response) => {
  try {
    const status = gcpKmsClient.getStatus();
    const keys = gcpKmsClient.getAllKeys();
    
    res.json({
      success: true,
      data: {
        ...status,
        keys: keys.map(k => ({
          name: k.name,
          purpose: k.purpose,
          category: k.category,
          algorithm: k.algorithm,
          protectionLevel: k.protectionLevel,
        })),
      },
    });
  } catch (error) {
    console.error('[KeyManagement] KMS status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get KMS status',
    });
  }
});

router.get('/kms/keys', requireAdmin, async (req: Request, res: Response) => {
  try {
    const keys = gcpKmsClient.getAllKeys();
    
    res.json({
      success: true,
      data: {
        count: keys.length,
        keys: keys.map(k => ({
          name: k.name,
          purpose: k.purpose,
          category: k.category,
          algorithm: k.algorithm,
          protectionLevel: k.protectionLevel,
        })),
      },
    });
  } catch (error) {
    console.error('[KeyManagement] Get keys error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get keys',
    });
  }
});

router.get('/kms/audit-logs', requireAdmin, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);
    const logs = gcpKmsClient.getAuditLogs(limit);
    
    res.json({
      success: true,
      data: {
        count: logs.length,
        logs,
      },
    });
  } catch (error) {
    console.error('[KeyManagement] Get KMS audit logs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get audit logs',
    });
  }
});

router.get('/hot-wallet', requireAdmin, async (req: Request, res: Response) => {
  try {
    const status = hybridKeyManager.getStatus();
    const balance = hybridKeyManager.getHotWalletBalance();
    
    res.json({
      success: true,
      data: {
        ...status.hotWallet,
        ...balance,
        routingPolicy: status.routingPolicy,
      },
    });
  } catch (error) {
    console.error('[KeyManagement] Hot wallet error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get hot wallet status',
    });
  }
});

router.post('/hot-wallet/refill', requireAdmin, async (req: Request, res: Response) => {
  try {
    const parsed = refillSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body',
        details: parsed.error.errors,
      });
    }

    const amount = parsed.data.amount 
      ? BigInt(parsed.data.amount) 
      : undefined;

    const success = await hybridKeyManager.refillHotWallet(amount);
    const newStatus = hybridKeyManager.getStatus();
    
    res.json({
      success,
      data: {
        message: success ? 'Hot wallet refilled' : 'Refill failed',
        hotWallet: newStatus.hotWallet,
      },
    });
  } catch (error) {
    console.error('[KeyManagement] Refill error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refill hot wallet',
    });
  }
});

router.post('/hot-wallet/lock', requireAdmin, async (req: Request, res: Response) => {
  try {
    const reason = req.body.reason || 'Admin lock';
    hybridKeyManager.lockHotWallet(reason);
    
    res.json({
      success: true,
      data: {
        message: 'Hot wallet locked',
        reason,
      },
    });
  } catch (error) {
    console.error('[KeyManagement] Lock error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to lock hot wallet',
    });
  }
});

router.post('/hot-wallet/unlock', requireAdmin, async (req: Request, res: Response) => {
  try {
    const authorizedBy = (req as any).adminUser || 'admin';
    hybridKeyManager.unlockHotWallet(authorizedBy);
    
    res.json({
      success: true,
      data: {
        message: 'Hot wallet unlocked',
        authorizedBy,
      },
    });
  } catch (error) {
    console.error('[KeyManagement] Unlock error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unlock hot wallet',
    });
  }
});

router.post('/sign', requireAdmin, async (req: Request, res: Response) => {
  try {
    const parsed = signTransactionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body',
        details: parsed.error.errors,
      });
    }

    const request: TransactionRequest = {
      requestId: crypto.randomUUID(),
      from: 'treasury',
      to: parsed.data.to,
      amount: BigInt(parsed.data.amount),
      category: parsed.data.category,
      subcategory: parsed.data.subcategory,
      memo: parsed.data.memo,
      requestedBy: (req as any).adminUser || 'admin',
      requestedAt: new Date().toISOString(),
    };

    const signedTx = await hybridKeyManager.signTransaction(request);
    
    res.json({
      success: true,
      data: signedTx,
    });
  } catch (error) {
    console.error('[KeyManagement] Sign error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sign transaction',
    });
  }
});

router.get('/routing/preview', requireAdmin, async (req: Request, res: Response) => {
  try {
    const amount = req.query.amount as string;
    const category = req.query.category as string;

    if (!amount || !category) {
      return res.status(400).json({
        success: false,
        error: 'amount and category query parameters are required',
      });
    }

    const method = hybridKeyManager.determineSigningMethod(
      BigInt(amount),
      category
    );

    const status = hybridKeyManager.getStatus();
    
    res.json({
      success: true,
      data: {
        amount,
        category,
        signingMethod: method,
        thresholds: status.routingPolicy,
        explanation: getRoutingExplanation(method, BigInt(amount), category),
      },
    });
  } catch (error) {
    console.error('[KeyManagement] Routing preview error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to preview routing',
    });
  }
});

function getRoutingExplanation(
  method: 'hot-wallet' | 'hsm' | 'multisig',
  amount: bigint,
  category: string
): string {
  switch (method) {
    case 'hot-wallet':
      return `Amount is below medium threshold or category is REWARDS. Using hot wallet for fast signing.`;
    case 'hsm':
      return `Amount requires HSM signing for security. GCP Cloud KMS will be used.`;
    case 'multisig':
      return `Large transfer requires 7/11 multisig approval. Transaction will be queued for signatures.`;
    default:
      return 'Unknown routing method';
  }
}

router.put('/routing/policy', requireAdmin, async (req: Request, res: Response) => {
  try {
    const parsed = updatePolicySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body',
        details: parsed.error.errors,
      });
    }

    const policy: any = {};
    if (parsed.data.smallTransferThreshold) {
      policy.smallTransferThreshold = BigInt(parsed.data.smallTransferThreshold);
    }
    if (parsed.data.mediumTransferThreshold) {
      policy.mediumTransferThreshold = BigInt(parsed.data.mediumTransferThreshold);
    }
    if (parsed.data.largeTransferThreshold) {
      policy.largeTransferThreshold = BigInt(parsed.data.largeTransferThreshold);
    }
    if (parsed.data.requireMultisigThreshold) {
      policy.requireMultisigThreshold = BigInt(parsed.data.requireMultisigThreshold);
    }

    hybridKeyManager.updateRoutingPolicy(policy);
    const status = hybridKeyManager.getStatus();
    
    res.json({
      success: true,
      data: {
        message: 'Routing policy updated',
        routingPolicy: status.routingPolicy,
      },
    });
  } catch (error) {
    console.error('[KeyManagement] Update policy error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update routing policy',
    });
  }
});

router.put('/hot-wallet/config', requireAdmin, async (req: Request, res: Response) => {
  try {
    const parsed = updateConfigSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body',
        details: parsed.error.errors,
      });
    }

    const config: any = {};
    if (parsed.data.minBalance) {
      config.minBalance = BigInt(parsed.data.minBalance);
    }
    if (parsed.data.maxBalance) {
      config.maxBalance = BigInt(parsed.data.maxBalance);
    }
    if (parsed.data.refillThreshold) {
      config.refillThreshold = BigInt(parsed.data.refillThreshold);
    }
    if (parsed.data.refillAmount) {
      config.refillAmount = BigInt(parsed.data.refillAmount);
    }
    if (parsed.data.dailyBudget) {
      config.dailyBudget = BigInt(parsed.data.dailyBudget);
    }
    if (parsed.data.checkIntervalMs) {
      config.checkIntervalMs = parsed.data.checkIntervalMs;
    }

    hybridKeyManager.updateHotWalletConfig(config);
    const status = hybridKeyManager.getStatus();
    
    res.json({
      success: true,
      data: {
        message: 'Hot wallet config updated',
        hotWallet: status.hotWallet,
      },
    });
  } catch (error) {
    console.error('[KeyManagement] Update config error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update hot wallet config',
    });
  }
});

router.get('/audit-logs', requireAdmin, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);
    const category = req.query.category as string;
    
    const logs = category 
      ? hybridKeyManager.getAuditLogsByCategory(category, limit)
      : hybridKeyManager.getAuditLogs(limit);
    
    res.json({
      success: true,
      data: {
        count: logs.length,
        category: category || 'all',
        logs,
      },
    });
  } catch (error) {
    console.error('[KeyManagement] Get audit logs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get audit logs',
    });
  }
});

router.get('/statistics', requireAdmin, async (req: Request, res: Response) => {
  try {
    const status = hybridKeyManager.getStatus();
    const kmsStatus = gcpKmsClient.getStatus();
    
    res.json({
      success: true,
      data: {
        hybrid: status.statistics,
        kms: {
          totalSignatures: kmsStatus.totalSignatures,
          failureCount: kmsStatus.failureCount,
          averageLatencyMs: kmsStatus.averageLatencyMs,
          lastSignatureAt: kmsStatus.lastSignatureAt,
        },
        summary: {
          totalTransactions: status.statistics.totalTransactions,
          hsmUsagePercent: status.statistics.totalTransactions > 0
            ? Math.round((status.statistics.hsmSignatures / status.statistics.totalTransactions) * 100)
            : 0,
          hotWalletUsagePercent: status.statistics.totalTransactions > 0
            ? Math.round((status.statistics.hotWalletSignatures / status.statistics.totalTransactions) * 100)
            : 0,
          multisigUsagePercent: status.statistics.totalTransactions > 0
            ? Math.round((status.statistics.multisigSignatures / status.statistics.totalTransactions) * 100)
            : 0,
        },
      },
    });
  } catch (error) {
    console.error('[KeyManagement] Get statistics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics',
    });
  }
});

router.get('/category-keys', requireAdmin, async (req: Request, res: Response) => {
  try {
    const categories = ['COMMUNITY', 'REWARDS', 'INVESTORS', 'ECOSYSTEM', 'TEAM', 'FOUNDATION'];
    const categoryKeys = categories.map(category => {
      const key = gcpKmsClient.getKeyForCategory(category);
      return {
        category,
        hasKey: !!key,
        keyName: key?.name || null,
        purpose: key?.purpose || null,
        protectionLevel: key?.protectionLevel || null,
      };
    });
    
    res.json({
      success: true,
      data: {
        categoryKeys,
      },
    });
  } catch (error) {
    console.error('[KeyManagement] Get category keys error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get category keys',
    });
  }
});

export default router;
