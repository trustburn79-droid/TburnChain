/**
 * TBC-20 Fast Path API Routes
 * Exposes endpoints for TBC-20 token operations and metrics
 */

import { Router, Request, Response } from 'express';
import {
  getTbc20FastPathEngine,
  createTestTransaction,
} from '../core/execution/tbc20-fast-path-integration';
import { getTbc20Registry } from '../services/tbc20-registry';
import {
  Tbc20Selectors,
  TBC20_FACTORY,
  TBC721_FACTORY,
  TBC1155_FACTORY,
  Tbc20TokenInfo,
  createDefaultTbc20TokenInfo,
} from '../utils/tbc20-protocol-constants';
import {
  isValidTburnAddress,
  addressToBytes,
  bigIntToU256,
} from '../utils/tbc20-address-utils';
import { tbc20Telemetry } from '../services/tbc20-fast-path-telemetry';
import { runCrossShardBurstTests } from '../tests/tbc20-cross-shard-burst-test';

const router = Router();

tbc20Telemetry.start();

router.get('/metrics', (_req: Request, res: Response) => {
  try {
    const engine = getTbc20FastPathEngine();
    const metrics = engine.getMetrics();
    const registry = engine.getRegistry();
    const registryStats = registry.getStats();
    
    res.json({
      success: true,
      data: {
        execution: {
          totalExecuted: metrics.totalExecuted,
          fastPathExecuted: metrics.fastPathExecuted,
          fullEvmFallback: metrics.fullEvmFallback,
          fastPathRatio: metrics.fastPathRatio,
          averageTimeUs: metrics.averageTimeUs,
          totalGasUsed: metrics.totalGasUsed.toString(),
          pendingWrites: metrics.pendingWrites,
        },
        registry: {
          totalTokens: registryStats.totalTokens,
          optimizableCount: registryStats.optimizableCount,
          factoryTokenCount: registryStats.factoryTokenCount,
        },
        performance: {
          targetTimeUs: 8,
          currentTimeUs: metrics.averageTimeUs,
          meetsTarget: metrics.averageTimeUs <= 8 || metrics.totalExecuted === 0,
        },
        enabled: engine.isEnabled(),
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Failed to get fast path metrics',
    });
  }
});

router.get('/registry', (_req: Request, res: Response) => {
  try {
    const registry = getTbc20Registry();
    const tokens = registry.getAllTokens();
    const stats = registry.getStats();
    
    res.json({
      success: true,
      data: {
        stats,
        tokens: tokens.map(t => ({
          address: t.address,
          name: t.name,
          symbol: t.symbol,
          decimals: t.decimals,
          aiOptimized: t.aiOptimized,
          burnable: t.burnable,
          mintable: t.mintable,
          factory: t.factory,
        })),
        factories: {
          TBC20: TBC20_FACTORY,
          TBC721: TBC721_FACTORY,
          TBC1155: TBC1155_FACTORY,
        },
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Failed to get registry',
    });
  }
});

router.post('/registry/token', (req: Request, res: Response) => {
  try {
    const { address, name, symbol, decimals, maxSupply, aiOptimized } = req.body;
    
    if (!address || !isValidTburnAddress(address)) {
      res.status(400).json({
        success: false,
        error: 'Invalid TBURN address',
      });
      return;
    }
    
    if (!name || !symbol) {
      res.status(400).json({
        success: false,
        error: 'Name and symbol are required',
      });
      return;
    }
    
    const registry = getTbc20Registry();
    
    if (registry.contains(address)) {
      res.status(409).json({
        success: false,
        error: 'Token already registered',
      });
      return;
    }
    
    const tokenInfo: Tbc20TokenInfo = {
      ...createDefaultTbc20TokenInfo(),
      address,
      name,
      symbol,
      decimals: decimals || 18,
      maxSupply: BigInt(maxSupply || 0),
      aiOptimized: aiOptimized !== false,
      factory: TBC20_FACTORY,
    };
    
    registry.register(tokenInfo);
    
    res.json({
      success: true,
      data: {
        address,
        name,
        symbol,
        aiOptimized: tokenInfo.aiOptimized,
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Failed to register token',
    });
  }
});

router.get('/registry/token/:address', (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const registry = getTbc20Registry();
    const token = registry.get(address);
    
    if (!token) {
      res.status(404).json({
        success: false,
        error: 'Token not found',
      });
      return;
    }
    
    res.json({
      success: true,
      data: {
        ...token,
        maxSupply: token.maxSupply.toString(),
        initialSupply: token.initialSupply.toString(),
        isFastPathEligible: registry.isFastPathEligible(address),
        isTbc20: registry.isTbc20(address),
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Failed to get token',
    });
  }
});

router.post('/check-eligibility', (req: Request, res: Response) => {
  try {
    const { sender, to, data } = req.body;
    
    if (!sender || !to) {
      res.status(400).json({
        success: false,
        error: 'sender and to are required',
      });
      return;
    }
    
    const engine = getTbc20FastPathEngine();
    const registry = engine.getRegistry();
    
    const txData = data ? Buffer.from(data.replace('0x', ''), 'hex') : new Uint8Array(0);
    
    const tx = {
      hash: new Uint8Array(32),
      sender,
      to,
      value: BigInt(0),
      data: new Uint8Array(txData),
      nonce: 0,
      gasLimit: 100000,
      gasPrice: BigInt(1),
    };
    
    const isEligible = engine.isEligible(tx);
    const tokenInfo = registry.get(to);
    
    let functionName = 'unknown';
    if (txData.length >= 4) {
      const selector = txData.slice(0, 4);
      if (arraysEqual(selector, Tbc20Selectors.TRANSFER)) functionName = 'transfer';
      else if (arraysEqual(selector, Tbc20Selectors.TRANSFER_FROM)) functionName = 'transferFrom';
      else if (arraysEqual(selector, Tbc20Selectors.APPROVE)) functionName = 'approve';
      else if (arraysEqual(selector, Tbc20Selectors.BURN)) functionName = 'burn';
    }
    
    res.json({
      success: true,
      data: {
        eligible: isEligible,
        reason: isEligible ? 'Transaction can use fast path' : getIneligibilityReason(tx, registry),
        function: functionName,
        tokenRegistered: !!tokenInfo,
        aiOptimized: tokenInfo?.aiOptimized || false,
        estimatedTimeUs: isEligible ? 8 : 100,
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Failed to check eligibility',
    });
  }
});

function arraysEqual(a: Uint8Array | Buffer, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function getIneligibilityReason(tx: { to: string | null; data: Uint8Array }, registry: ReturnType<typeof getTbc20Registry>): string {
  if (!tx.to) return 'No target address';
  if (!isValidTburnAddress(tx.to)) return 'Invalid TBURN address format';
  if (tx.data.length < 4) return 'No function selector in data';
  if (!registry.contains(tx.to)) return 'Token not registered';
  if (!registry.isFastPathEligible(tx.to)) return 'Token not optimized for fast path';
  
  const selector = tx.data.slice(0, 4);
  const supported = 
    arraysEqual(selector, Tbc20Selectors.TRANSFER) ||
    arraysEqual(selector, Tbc20Selectors.TRANSFER_FROM) ||
    arraysEqual(selector, Tbc20Selectors.APPROVE) ||
    arraysEqual(selector, Tbc20Selectors.BURN);
  
  if (!supported) return 'Function not supported by fast path';
  
  return 'Unknown reason';
}

router.post('/enable', (_req: Request, res: Response) => {
  try {
    const engine = getTbc20FastPathEngine();
    engine.setEnabled(true);
    
    res.json({
      success: true,
      data: { enabled: true },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Failed to enable fast path',
    });
  }
});

router.post('/disable', (_req: Request, res: Response) => {
  try {
    const engine = getTbc20FastPathEngine();
    engine.setEnabled(false);
    
    res.json({
      success: true,
      data: { enabled: false },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Failed to disable fast path',
    });
  }
});

router.post('/reset-metrics', (_req: Request, res: Response) => {
  try {
    const engine = getTbc20FastPathEngine();
    engine.resetMetrics();
    
    res.json({
      success: true,
      data: { metricsReset: true },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Failed to reset metrics',
    });
  }
});

router.post('/flush', async (_req: Request, res: Response) => {
  try {
    const engine = getTbc20FastPathEngine();
    await engine.commitPendingWrites();
    
    res.json({
      success: true,
      data: { flushed: true },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Failed to flush pending writes',
    });
  }
});

router.get('/benchmark', async (_req: Request, res: Response) => {
  try {
    const engine = getTbc20FastPathEngine();
    const registry = engine.getRegistry();
    
    const testToken = "tb1benchmarktoken00000000000000000000000";
    if (!registry.contains(testToken)) {
      registry.register({
        ...createDefaultTbc20TokenInfo(),
        address: testToken,
        name: "Benchmark Token",
        symbol: "BENCH",
        aiOptimized: true,
        factory: TBC20_FACTORY,
      });
    }
    
    const iterations = 1000;
    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const toBytes = new Uint8Array(32);
      toBytes.set(new Uint8Array(20).fill(i % 256), 12);
      const amount = bigIntToU256(BigInt(1000));
      
      const tx = createTestTransaction(
        "tb1sender12345678901234567890123456789012",
        testToken,
        Tbc20Selectors.TRANSFER,
        toBytes,
        amount
      );
      
      const start = performance.now();
      engine.isEligible(tx);
      const end = performance.now();
      times.push((end - start) * 1000);
    }
    
    const sum = times.reduce((a, b) => a + b, 0);
    const avg = sum / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    const sorted = [...times].sort((a, b) => a - b);
    const p50 = sorted[Math.floor(times.length * 0.5)];
    const p95 = sorted[Math.floor(times.length * 0.95)];
    const p99 = sorted[Math.floor(times.length * 0.99)];
    
    res.json({
      success: true,
      data: {
        iterations,
        averageTimeUs: avg,
        minTimeUs: min,
        maxTimeUs: max,
        p50TimeUs: p50,
        p95TimeUs: p95,
        p99TimeUs: p99,
        estimatedTps: 1000000 / avg,
        meetsTarget: avg <= 8,
        targetTimeUs: 8,
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Failed to run benchmark',
    });
  }
});

router.get('/state-stats', (_req: Request, res: Response) => {
  try {
    const engine = getTbc20FastPathEngine();
    const stateAdapter = engine.getStateAdapter();
    const stats = stateAdapter.getSnapshotStats();
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Failed to get state stats',
    });
  }
});

router.get('/telemetry', (_req: Request, res: Response) => {
  try {
    const stats = tbc20Telemetry.getAggregatedStats();
    const thresholds = tbc20Telemetry.getThresholds();
    
    res.json({
      success: true,
      data: {
        stats,
        thresholds,
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Failed to get telemetry',
    });
  }
});

router.get('/telemetry/shards', (_req: Request, res: Response) => {
  try {
    const shardMetrics = tbc20Telemetry.getAllShardMetrics();
    
    res.json({
      success: true,
      data: {
        shards: shardMetrics,
        count: shardMetrics.length,
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Failed to get shard metrics',
    });
  }
});

router.get('/telemetry/shard/:shardId', (req: Request, res: Response) => {
  try {
    const shardId = parseInt(req.params.shardId, 10);
    if (isNaN(shardId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid shard ID',
      });
      return;
    }
    
    const metrics = tbc20Telemetry.getShardMetrics(shardId);
    const alerts = tbc20Telemetry.getAlertsByShard(shardId);
    
    res.json({
      success: true,
      data: {
        metrics: metrics || null,
        alerts: alerts.slice(-20),
        alertCount: alerts.length,
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Failed to get shard metrics',
    });
  }
});

router.get('/telemetry/alerts', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const type = req.query.type as 'warning' | 'critical' | undefined;
    
    let alerts;
    if (type === 'warning' || type === 'critical') {
      alerts = tbc20Telemetry.getAlertsByType(type);
    } else {
      alerts = tbc20Telemetry.getRecentAlerts(limit);
    }
    
    res.json({
      success: true,
      data: {
        alerts,
        count: alerts.length,
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Failed to get alerts',
    });
  }
});

router.post('/telemetry/thresholds', (req: Request, res: Response) => {
  try {
    const thresholds = req.body;
    tbc20Telemetry.updateThresholds(thresholds);
    
    res.json({
      success: true,
      data: {
        thresholds: tbc20Telemetry.getThresholds(),
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Failed to update thresholds',
    });
  }
});

router.post('/telemetry/record', (req: Request, res: Response) => {
  try {
    const { shardId, ...metrics } = req.body;
    
    if (typeof shardId !== 'number') {
      res.status(400).json({
        success: false,
        error: 'shardId is required',
      });
      return;
    }
    
    tbc20Telemetry.recordShardMetrics(shardId, metrics);
    
    res.json({
      success: true,
      data: { recorded: true },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Failed to record metrics',
    });
  }
});

router.delete('/telemetry/alerts', (_req: Request, res: Response) => {
  try {
    tbc20Telemetry.clearAlerts();
    
    res.json({
      success: true,
      data: { cleared: true },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Failed to clear alerts',
    });
  }
});

router.get('/telemetry/prometheus', (_req: Request, res: Response) => {
  try {
    const metrics = tbc20Telemetry.exportPrometheusMetrics();
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send(metrics);
  } catch (error) {
    res.status(503).send('# Error exporting metrics');
  }
});

router.post('/test/cross-shard-burst', async (req: Request, res: Response) => {
  try {
    const config = req.body || {};
    
    const safeConfig = {
      numShards: Math.min(config.numShards || 24, 24),
      txPerShard: Math.min(config.txPerShard || 50, 100),
      fastPathRatio: config.fastPathRatio || 0.85,
      burstSize: Math.min(config.burstSize || 25, 50),
      targetLatencyUs: config.targetLatencyUs || 50,
    };
    
    console.log('[TBC20-Test] Starting cross-shard burst test...');
    const result = await runCrossShardBurstTests(safeConfig);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[TBC20-Test] Cross-shard burst test failed:', error);
    res.status(503).json({
      success: false,
      error: 'Cross-shard burst test failed',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
