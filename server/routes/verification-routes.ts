/**
import { addressFromString } from "../utils/tburn-address";
 * TBURN Enterprise Verification API Routes
 * 
 * Monitoring and control endpoints for the verification pipeline
 */

import { Router, Request, Response } from 'express';
import {
  getEnterpriseTransactionVerifier,
  getEnterpriseBlockVerifier,
  EnterpriseMerkleTree,
} from '../core/verification';

const router = Router();

/**
 * GET /api/verification/metrics
 * Get current verification pipeline metrics
 */
router.get('/metrics', (req: Request, res: Response) => {
  try {
    const txVerifier = getEnterpriseTransactionVerifier();
    const blockVerifier = getEnterpriseBlockVerifier();
    
    const txMetrics = txVerifier.getMetrics();
    const blockMetrics = blockVerifier.getMetrics();
    
    res.json({
      success: true,
      data: {
        transaction: {
          totalVerifications: txMetrics.totalVerifications,
          successfulVerifications: txMetrics.successfulVerifications,
          failedVerifications: txMetrics.failedVerifications,
          successRate: txMetrics.totalVerifications > 0 
            ? (txMetrics.successfulVerifications / txMetrics.totalVerifications * 100).toFixed(2) + '%'
            : '0%',
          avgVerificationTimeUs: txMetrics.avgVerificationTimeUs.toFixed(2),
          p50LatencyUs: txMetrics.p50LatencyUs.toFixed(2),
          p95LatencyUs: txMetrics.p95LatencyUs.toFixed(2),
          p99LatencyUs: txMetrics.p99LatencyUs.toFixed(2),
          throughputTxPerSec: txMetrics.throughputTxPerSec.toFixed(2),
          circuitBreakerState: txMetrics.circuitBreakerState,
          uptimeMs: txMetrics.uptime,
        },
        block: {
          totalVerifications: blockMetrics.totalVerifications,
          successfulVerifications: blockMetrics.successfulVerifications,
          failedVerifications: blockMetrics.failedVerifications,
          successRate: blockMetrics.totalVerifications > 0 
            ? (blockMetrics.successfulVerifications / blockMetrics.totalVerifications * 100).toFixed(2) + '%'
            : '0%',
          merkleTreeCache: blockMetrics.merkleTreeCacheStats,
          circuitBreakerState: blockMetrics.circuitBreakerState,
        },
      },
      timestamp: Date.now(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/verification/health
 * Health check for verification pipeline
 */
router.get('/health', (req: Request, res: Response) => {
  try {
    const txVerifier = getEnterpriseTransactionVerifier();
    const blockVerifier = getEnterpriseBlockVerifier();
    
    const txMetrics = txVerifier.getMetrics();
    const blockMetrics = blockVerifier.getMetrics();
    
    const txCircuitOk = txMetrics.circuitBreakerState !== 'open';
    const blockCircuitOk = blockMetrics.circuitBreakerState !== 'open';
    
    const healthy = txCircuitOk && blockCircuitOk;
    
    res.status(healthy ? 200 : 503).json({
      success: true,
      data: {
        status: healthy ? 'healthy' : 'degraded',
        transactionVerifier: {
          status: txCircuitOk ? 'operational' : 'circuit_open',
          circuitState: txMetrics.circuitBreakerState,
        },
        blockVerifier: {
          status: blockCircuitOk ? 'operational' : 'circuit_open',
          circuitState: blockMetrics.circuitBreakerState,
        },
      },
      timestamp: Date.now(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/verification/verify-transaction
 * Verify a single signed transaction
 */
router.post('/verify-transaction', async (req: Request, res: Response) => {
  try {
    const { transaction, expectedNonce } = req.body;
    
    if (!transaction || !transaction.hash || !transaction.signature || !transaction.from) {
      return res.status(400).json({
        success: false,
        error: 'Missing required transaction fields (hash, signature, from)',
      });
    }
    
    const verifier = getEnterpriseTransactionVerifier();
    const result = verifier.verifyTransaction(transaction, expectedNonce);
    
    res.json({
      success: true,
      data: {
        valid: result.valid,
        signatureValid: result.signatureValid,
        hashValid: result.hashValid,
        nonceValid: result.nonceValid,
        recoveredAddress: result.recoveredAddress,
        verificationTimeUs: result.verificationTimeNs / 1000,
        error: result.error,
      },
      timestamp: Date.now(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/verification/verify-batch
 * Verify a batch of transactions
 */
router.post('/verify-batch', async (req: Request, res: Response) => {
  try {
    const { transactions, parallel = true } = req.body;
    
    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required transactions array',
      });
    }
    
    if (transactions.length > 10000) {
      return res.status(400).json({
        success: false,
        error: 'Batch size exceeds maximum of 10,000 transactions',
      });
    }
    
    const verifier = getEnterpriseTransactionVerifier();
    
    const result = parallel 
      ? await verifier.verifyBatchParallel(transactions)
      : await verifier.verifyBatch(transactions);
    
    res.json({
      success: true,
      data: {
        totalCount: result.totalCount,
        validCount: result.validCount,
        invalidCount: result.invalidCount,
        successRate: result.totalCount > 0 
          ? (result.validCount / result.totalCount * 100).toFixed(2) + '%'
          : '0%',
        totalTimeMs: result.totalTimeMs,
        avgTimePerTxUs: result.avgTimePerTxUs.toFixed(2),
        throughputTxPerSec: result.throughputTxPerSec.toFixed(2),
        invalidTransactions: result.results
          .filter(r => !r.valid)
          .map(r => ({ txHash: r.txHash, error: r.error })),
      },
      timestamp: Date.now(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/verification/generate-merkle-root
 * Generate Merkle root from transaction hashes
 */
router.post('/generate-merkle-root', (req: Request, res: Response) => {
  try {
    const { txHashes, parallel = true, batchSize = 1000 } = req.body;
    
    if (!txHashes || !Array.isArray(txHashes)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required txHashes array',
      });
    }
    
    const startTime = Date.now();
    const merkleTree = new EnterpriseMerkleTree();
    
    const root = parallel 
      ? merkleTree.buildParallel(txHashes, batchSize)
      : merkleTree.build(txHashes);
    
    const timeMs = Date.now() - startTime;
    
    res.json({
      success: true,
      data: {
        merkleRoot: root,
        txCount: txHashes.length,
        generationTimeMs: timeMs,
        cacheStats: merkleTree.getCacheStats(),
      },
      timestamp: Date.now(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/verification/generate-merkle-proof
 * Generate Merkle proof for a specific transaction
 */
router.post('/generate-merkle-proof', (req: Request, res: Response) => {
  try {
    const { txHashes, index } = req.body;
    
    if (!txHashes || !Array.isArray(txHashes)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required txHashes array',
      });
    }
    
    if (index === undefined || index < 0 || index >= txHashes.length) {
      return res.status(400).json({
        success: false,
        error: 'Invalid index',
      });
    }
    
    const merkleTree = new EnterpriseMerkleTree();
    merkleTree.build(txHashes);
    
    const proof = merkleTree.getProof(index);
    
    if (!proof) {
      return res.status(400).json({
        success: false,
        error: 'Failed to generate proof',
      });
    }
    
    res.json({
      success: true,
      data: proof,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/verification/verify-merkle-proof
 * Verify a Merkle proof
 */
router.post('/verify-merkle-proof', (req: Request, res: Response) => {
  try {
    const { leaf, proof, root, index } = req.body;
    
    if (!leaf || !proof || !root || index === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields (leaf, proof, root, index)',
      });
    }
    
    const merkleTree = new EnterpriseMerkleTree();
    const valid = merkleTree.verifyProof(leaf, proof, root, index);
    
    res.json({
      success: true,
      data: { valid },
      timestamp: Date.now(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/verification/verify-block
 * Verify block integrity
 */
router.post('/verify-block', (req: Request, res: Response) => {
  try {
    const { block, transactionHashes, expectedParentHash } = req.body;
    
    if (!block || !block.hash || !block.blockNumber) {
      return res.status(400).json({
        success: false,
        error: 'Missing required block fields',
      });
    }
    
    const verifier = getEnterpriseBlockVerifier();
    const result = verifier.verifyBlockIntegrity(
      block,
      transactionHashes || [],
      expectedParentHash
    );
    
    res.json({
      success: true,
      data: result,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/verification/reset-metrics
 * Reset verification metrics (requires authentication)
 */
router.post('/reset-metrics', (req: Request, res: Response) => {
  try {
    const txVerifier = getEnterpriseTransactionVerifier();
    const blockVerifier = getEnterpriseBlockVerifier();
    
    txVerifier.resetMetrics();
    blockVerifier.clearCache();
    
    res.json({
      success: true,
      message: 'Verification metrics reset successfully',
      timestamp: Date.now(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/verification/benchmark
 * Run a quick benchmark of the verification pipeline
 */
router.get('/benchmark', async (req: Request, res: Response) => {
  try {
    const count = Math.min(parseInt(req.query.count as string) || 100, 1000);
    
    const { TransactionVerifier } = await import('../utils/transaction-verifier');
    
    const testTxs: any[] = [];
    for (let i = 0; i < count; i++) {
      const tx = TransactionVerifier.generateTestTransaction(
        `test-seed-${i}`,
        addressFromString('verification-test-1'),
        '1000000000000000000',
        i
      );
      testTxs.push(tx);
    }
    
    const verifier = getEnterpriseTransactionVerifier();
    
    const sequentialStart = Date.now();
    await verifier.verifyBatch(testTxs);
    const sequentialTime = Date.now() - sequentialStart;
    
    const parallelStart = Date.now();
    const result = await verifier.verifyBatchParallel(testTxs);
    const parallelTime = Date.now() - parallelStart;
    
    res.json({
      success: true,
      data: {
        transactionCount: count,
        sequential: {
          totalTimeMs: sequentialTime,
          throughputTxPerSec: (count * 1000) / sequentialTime,
        },
        parallel: {
          totalTimeMs: parallelTime,
          throughputTxPerSec: (count * 1000) / parallelTime,
          validCount: result.validCount,
          invalidCount: result.invalidCount,
        },
        improvement: `${((sequentialTime / parallelTime - 1) * 100).toFixed(1)}% faster with parallel`,
      },
      timestamp: Date.now(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
