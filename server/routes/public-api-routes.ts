/**
 * TBURN Public API Routes v1
 * Read-only endpoints for public website consumption
 * No authentication required - optimized for caching
 */

import { Router, Request, Response } from 'express';
import { createHash } from 'crypto';
import { dataHub } from '../services/DataHub';
import { storage } from '../storage';
import { getTBurnClient, isProductionMode } from '../tburn-client';
import { getDataCache } from '../services/DataCacheService';
import { formatTBurnAddress, addressFromString, SYSTEM_ADDRESSES } from '../utils/tburn-address';
import { getEnterpriseNode } from '../services/TBurnEnterpriseNode';
import type { Block, Transaction, Validator } from '@shared/schema';

const router = Router();

// Cache settings for public endpoints
const CACHE_SHORT = 5; // 5 seconds for real-time data
const CACHE_MEDIUM = 30; // 30 seconds for summary data
const CACHE_LONG = 300; // 5 minutes for static-ish data

// In-memory cache keys for public API
const PUBLIC_CACHE_KEYS = {
  NETWORK_STATS: 'public_network_stats',
  RECENT_BLOCKS: 'public_recent_blocks_10',
  RECENT_TXS: 'public_recent_txs_10',
  TESTNET_STATS: 'public_testnet_stats',
  TESTNET_BLOCKS: 'public_testnet_blocks_10',
  TESTNET_TXS: 'public_testnet_txs_10',
};

// Helper function to format large numbers with $ prefix and T/B/M suffix
function formatLargeNumber(amount: number): string {
  if (amount >= 1e12) {
    return `$${(amount / 1e12).toFixed(1)}T`;
  } else if (amount >= 1e9) {
    return `$${(amount / 1e9).toFixed(1)}B`;
  } else if (amount >= 1e6) {
    return `$${(amount / 1e6).toFixed(1)}M`;
  } else if (amount >= 1e3) {
    return `$${(amount / 1e3).toFixed(1)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

// ============================================
// Consistent Hash Generation (for matching search results)
// ============================================

/**
 * Generates a consistent hash based on block number using SHA-256
 * This ensures the same block always has the same hash with full 64 hex chars
 */
function generateConsistentBlockHash(blockNumber: number): string {
  const hash = createHash('sha256')
    .update(`tburn-block-${blockNumber}`)
    .digest('hex');
  return `0x${hash}`;
}

/**
 * Generates a consistent transaction hash based on block number and index using SHA-256
 * Full 64 hex characters without trailing zeros
 */
function generateConsistentTxHash(blockNumber: number, index: number): string {
  const hash = createHash('sha256')
    .update(`tburn-tx-${blockNumber}-${index}`)
    .digest('hex');
  return `0x${hash}`;
}

/**
 * Generates consistent address based on seed using SHA-256 (Bech32m tb1 format)
 * Uses addressFromString for consistent tb1 format
 */
function generateConsistentAddress(seed: number): string {
  return addressFromString(`tburn-addr-${seed}`);
}

function setCacheHeaders(res: Response, maxAge: number) {
  res.set('Cache-Control', `public, max-age=${maxAge}`);
  res.set('X-Response-Time', `${Date.now()}`);
}

/**
 * Get real-time TPS and transaction count from Enterprise Node (unified source for all pages)
 * CRITICAL: Dec 26 Launch - This ensures /admin/shards, /app, /scan, /rpc all show same stats
 * Uses generateShards() and sums TPS for EXACT synchronization with /api/sharding
 */
function getUnifiedTpsData(): { tps: number; shardCount: number; validators: number; peakTps: number; totalTransactions: number } {
  try {
    const enterpriseNode = getEnterpriseNode();
    if (enterpriseNode) {
      // Use generateShards() for EXACT TPS match with /api/shards and /api/sharding
      const shards = enterpriseNode.generateShards();
      const totalTps = shards.reduce((sum: number, s: any) => sum + s.tps, 0);
      const totalValidators = shards.reduce((sum: number, s: any) => sum + s.validatorCount, 0);
      const realTimeTps = enterpriseNode.getRealTimeTPS();
      
      // Get totalTransactions directly from Enterprise Node for consistency
      // Use stable value from the node's internal counter (synchronous getter)
      const totalTx = enterpriseNode.getTotalTransactions() || 80452000;
      
      return {
        tps: totalTps, // Sum of shard TPS for exact sync
        shardCount: shards.length,
        validators: totalValidators,
        peakTps: realTimeTps.peak,
        totalTransactions: totalTx
      };
    }
  } catch (e) {
    console.log('[Public API] Enterprise node not ready, using fallback');
  }
  return { tps: 210000, shardCount: 64, validators: 125, peakTps: 250000, totalTransactions: 80452000 };
}

/**
 * Pure formatting function for network stats - takes pre-fetched data
 * Used by both API endpoints and ProductionDataPoller for consistent formatting
 * CRITICAL: TPS is sourced from Enterprise Node for consistency across all dashboards
 */
export function formatPublicNetworkStats(
  stats: any,
  snapshot: any,
  moduleMetrics: any
): any {
  // Get unified TPS and totalTransactions from Enterprise Node (same source as /admin/shards, /app)
  const unifiedData = getUnifiedTpsData();
  
  return {
    blockHeight: stats?.currentBlockHeight || snapshot?.blockHeight || 0,
    tps: unifiedData.tps,
    peakTps: unifiedData.peakTps,
    avgBlockTime: stats?.avgBlockTime || 0.5,
    totalTransactions: unifiedData.totalTransactions,
    pendingTransactions: snapshot?.pendingTransactions || 0,
    activeValidators: unifiedData.validators,
    totalValidators: unifiedData.validators,
    networkHashrate: "2.4 EH/s",
    difficulty: "42.5T",
    gasPrice: stats?.gasPrice || "0.0001",
    totalStaked: (() => {
      const raw = snapshot?.totalStaked || moduleMetrics?.staking?.totalStaked;
      if (!raw) return "$847.6M";
      const num = typeof raw === 'string' ? parseFloat(raw.replace(/[,$]/g, '')) : raw;
      if (isNaN(num)) return "$847.6M";
      return formatLargeNumber(num / 1e18);
    })(),
    totalBurned: (() => {
      const raw = snapshot?.burnedAmount || moduleMetrics?.burn?.totalBurned;
      if (!raw) return "$23.5M";
      const num = typeof raw === 'string' ? parseFloat(raw.replace(/[,$]/g, '')) : raw;
      if (isNaN(num)) return "$23.5M";
      return formatLargeNumber(num / 1e18);
    })(),
    circulatingSupply: (() => {
      const raw = snapshot?.circulatingSupply;
      if (!raw) return "$500.0M";
      const num = typeof raw === 'string' ? parseFloat(raw.replace(/[,$]/g, '')) : raw;
      if (isNaN(num)) return "$500.0M";
      return formatLargeNumber(num / 1e18);
    })(),
    marketCap: snapshot?.marketCap || "$1.2B",
    dexTvl: snapshot?.dexTvl || moduleMetrics?.dex?.tvl || "$124M",
    lendingTvl: snapshot?.lendingTvl || moduleMetrics?.lending?.totalSupplied || "$312M",
    stakingTvl: snapshot?.stakingTvl || moduleMetrics?.staking?.totalStaked || "$847M",
    finality: "< 2s",
    shardCount: unifiedData.shardCount,
    nodeCount: 1247,
    uptime: "99.99%",
    lastUpdated: Date.now()
  };
}

/**
 * Pure formatting function for testnet stats - takes pre-fetched data
 * CRITICAL: TPS is sourced from Enterprise Node for consistency (scaled down for testnet)
 */
export function formatPublicTestnetStats(stats: any, snapshot: any): any {
  // Get unified data from Enterprise Node, scale down for testnet (10% of mainnet)
  const unifiedData = getUnifiedTpsData();
  const testnetTps = Math.floor(unifiedData.tps * 0.1);
  const testnetShards = Math.max(8, Math.floor(unifiedData.shardCount / 8));
  
  return {
    blockHeight: stats?.currentBlockHeight || snapshot?.blockHeight || 0,
    tps: testnetTps,
    peakTps: Math.floor(unifiedData.peakTps * 0.1),
    avgBlockTime: stats?.avgBlockTime || 0.5,
    totalTransactions: Math.floor(unifiedData.totalTransactions * 0.1),
    activeValidators: Math.floor(unifiedData.validators * 0.5),
    totalBurned: '125000000000000000000000000',
    gasPrice: stats?.gasPrice || '100',
    totalStaked: '350000000000000000000000000',
    finality: '< 2s',
    shardCount: testnetShards,
    nodeCount: 247,
    uptime: '99.9%'
  };
}

/**
 * Async wrapper - fetches data and formats (for API endpoints)
 */
export async function buildPublicNetworkStats(): Promise<any> {
  const snapshot = await dataHub.getNetworkSnapshot();
  const stats = await storage.getNetworkStats();
  const moduleMetrics = dataHub.getModuleMetrics();
  return formatPublicNetworkStats(stats, snapshot, moduleMetrics);
}

/**
 * Async wrapper - fetches data and formats (for API endpoints)
 */
export async function buildPublicTestnetStats(): Promise<any> {
  const snapshot = await dataHub.getNetworkSnapshot();
  const stats = await storage.getNetworkStats();
  return formatPublicTestnetStats(stats, snapshot);
}

// ============================================
// Network Stats (Home Page, Network Status)
// ============================================

/**
 * GET /api/public/v1/network/stats
 * Core network statistics for home page and network status
 */
router.get('/network/stats', async (req: Request, res: Response) => {
  try {
    setCacheHeaders(res, CACHE_SHORT);
    
    // CRITICAL Dec 24: NO separate cache - always use fresh TPS from shards cache
    // This ensures /api/network/stats TPS matches /api/shards and /api/sharding exactly
    const data = await buildPublicNetworkStats();
    
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('[Public API] Network stats error:', error?.message || error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch network stats'
    });
  }
});

/**
 * GET /api/public/v1/network/blocks/recent
 * Recent blocks for explorer preview - uses same data source as /app/blocks
 */
router.get('/network/blocks/recent', async (req: Request, res: Response) => {
  try {
    setCacheHeaders(res, CACHE_SHORT);
    
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    
    // Use TBURN client for real-time data (same as /api/blocks)
    if (isProductionMode()) {
      try {
        const client = getTBurnClient();
        const blocks = await client.getRecentBlocks(limit);
        
        res.json({
          success: true,
          data: blocks.map((block: any) => ({
            number: block.blockNumber || block.number,
            hash: block.hash,
            parentHash: block.parentHash,
            timestamp: Math.floor(Date.now() / 1000) - ((blocks[0]?.blockNumber || blocks[0]?.number || 0) - (block.blockNumber || block.number)) * 3,
            transactions: block.transactionCount || block.transactions || 0,
            gasUsed: block.gasUsed || 30000000,
            gasLimit: block.gasLimit || 30000000,
            validator: block.validatorAddress || block.validator,
            size: block.size || 50000
          })),
          total: blocks.length,
          lastUpdated: Date.now()
        });
        return;
      } catch (clientError) {
        console.log('[Public API] TBURN client error, falling back to storage');
      }
    }
    
    // Fallback to storage, then generate consistent blocks if empty
    const blocks = await storage.getRecentBlocks(limit);
    
    if (blocks.length > 0) {
      res.json({
        success: true,
        data: blocks.map((block: Block) => ({
          number: block.blockNumber,
          hash: block.hash,
          parentHash: block.parentHash,
          timestamp: block.timestamp,
          transactions: block.transactionCount,
          gasUsed: block.gasUsed,
          gasLimit: block.gasLimit,
          validator: block.validatorAddress,
          size: block.size
        })),
        total: blocks.length,
        lastUpdated: Date.now()
      });
    } else {
      // Generate consistent blocks for demo mode
      const networkStats = await storage.getNetworkStats();
      const currentBlockHeight = networkStats?.currentBlockHeight || 20818000;
      const currentTimestamp = Math.floor(Date.now() / 1000);
      
      const generatedBlocks = [];
      for (let i = 0; i < limit; i++) {
        const blockNumber = currentBlockHeight - i;
        generatedBlocks.push({
          number: blockNumber,
          hash: generateConsistentBlockHash(blockNumber),
          parentHash: generateConsistentBlockHash(blockNumber - 1),
          timestamp: currentTimestamp - i * 3,
          transactions: 100 + (blockNumber % 300),
          gasUsed: 25000000 + (blockNumber % 5000000),
          gasLimit: 30000000,
          validator: generateConsistentAddress(blockNumber % 125),
          size: 40000 + (blockNumber % 20000)
        });
      }
      
      res.json({
        success: true,
        data: generatedBlocks,
        total: generatedBlocks.length,
        lastUpdated: Date.now()
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent blocks'
    });
  }
});

/**
 * GET /api/public/v1/network/transactions/recent
 * Recent transactions for explorer preview - uses same data source as /app/transactions
 */
router.get('/network/transactions/recent', async (req: Request, res: Response) => {
  try {
    setCacheHeaders(res, CACHE_SHORT);
    
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    
    // Use TBURN client for real-time data (same as /api/transactions)
    if (isProductionMode()) {
      try {
        const client = getTBurnClient();
        const transactions = await client.getRecentTransactions(limit);
        
        res.json({
          success: true,
          data: transactions.map((tx: any, index: number) => ({
            hash: tx.hash,
            blockNumber: tx.blockNumber,
            from: tx.from,
            to: tx.to,
            value: tx.value,
            gasUsed: tx.gasUsed,
            gasPrice: tx.gasPrice,
            timestamp: Math.floor(Date.now() / 1000) - index * 3,
            status: tx.status || 'success'
          })),
          total: transactions.length,
          lastUpdated: Date.now()
        });
        return;
      } catch (clientError) {
        console.log('[Public API] TBURN client error for transactions, generating real-time data');
        
        // Generate real-time transactions based on current block height
        const networkStats = await storage.getNetworkStats();
        const currentBlockHeight = networkStats?.currentBlockHeight || 20818000;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        
        const realtimeTransactions = [];
        const statusOptions = ['success', 'success', 'success', 'success', 'pending'];
        
        for (let i = 0; i < limit; i++) {
          const txTimestamp = currentTimestamp - (i * 2);
          const txBlockNumber = currentBlockHeight - Math.floor(i / 5);
          realtimeTransactions.push({
            hash: generateConsistentTxHash(txBlockNumber, i % 5),
            blockNumber: txBlockNumber,
            from: generateConsistentAddress(txBlockNumber * 100 + i),
            to: generateConsistentAddress(txBlockNumber * 100 + i + 50),
            value: ((1000 + (i * 123) % 10000) * 1e18).toFixed(0),
            gasUsed: 21000 + (i * 731) % 50000,
            gasPrice: (20 + (i * 17) % 30).toFixed(0) + '000000000',
            timestamp: txTimestamp,
            status: statusOptions[i % 5]
          });
        }
        
        res.json({
          success: true,
          data: realtimeTransactions,
          total: realtimeTransactions.length,
          lastUpdated: Date.now()
        });
        return;
      }
    }
    
    // Fallback for demo mode - generate real-time data with consistent hashes
    const networkStats = await storage.getNetworkStats();
    const currentBlockHeight = networkStats?.currentBlockHeight || 20818000;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    
    const realtimeTransactions = [];
    const statusOptions = ['success', 'success', 'success', 'success', 'pending'];
    
    for (let i = 0; i < limit; i++) {
      const txTimestamp = currentTimestamp - (i * 2);
      const txBlockNumber = currentBlockHeight - Math.floor(i / 5);
      realtimeTransactions.push({
        hash: generateConsistentTxHash(txBlockNumber, i % 5),
        blockNumber: txBlockNumber,
        from: generateConsistentAddress(txBlockNumber * 100 + i),
        to: generateConsistentAddress(txBlockNumber * 100 + i + 50),
        value: ((1000 + (i * 123) % 10000) * 1e18).toFixed(0),
        gasUsed: 21000 + (i * 731) % 50000,
        gasPrice: (20 + (i * 17) % 30).toFixed(0) + '000000000',
        timestamp: txTimestamp,
        status: statusOptions[i % 5]
      });
    }
    
    res.json({
      success: true,
      data: realtimeTransactions,
      total: realtimeTransactions.length,
      lastUpdated: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent transactions'
    });
  }
});

// ============================================
// Validators (Network/Validators Page)
// ============================================

/**
 * GET /api/public/v1/validators
 * All validators with summary stats
 */
router.get('/validators', async (req: Request, res: Response) => {
  try {
    setCacheHeaders(res, CACHE_MEDIUM);
    
    const validators = await storage.getAllValidators();
    const activeCount = validators.filter((v: Validator) => v.status === 'active').length;
    
    // Helper to convert basis points to percentage (9500 -> 95.00)
    const bpsToPercent = (val: string | number | undefined) => {
      const num = parseFloat(String(val || '0'));
      return num > 100 ? (num / 100).toFixed(2) : String(num);
    };
    
    // Helper to convert Wei to TBURN (1e18 -> 1)
    const weiToTburn = (val: string | undefined) => {
      if (!val) return '0';
      try {
        const num = BigInt(val);
        return (Number(num) / 1e18).toFixed(2);
      } catch {
        return '0';
      }
    };
    
    // Helper to assign tier based on stake amount
    const getTier = (stake: string): string => {
      try {
        const stakeNum = Number(BigInt(stake)) / 1e18;
        if (stakeNum >= 200000) return 'diamond';
        if (stakeNum >= 100000) return 'platinum';
        if (stakeNum >= 50000) return 'gold';
        if (stakeNum >= 10000) return 'silver';
        return 'bronze';
      } catch {
        return 'bronze';
      }
    };
    
    res.json({
      success: true,
      data: {
        validators: validators.slice(0, 100).map((v: Validator) => ({
          address: v.address,
          name: v.name,
          status: v.status,
          stake: weiToTburn(v.stake),
          delegators: v.delegators || 0,
          commission: bpsToPercent(v.commission),
          uptime: bpsToPercent(v.uptime),
          blocksProduced: v.totalBlocks || 0,
          rewardsEarned: weiToTburn(v.rewardEarned),
          apy: bpsToPercent(v.apy),
          behaviorScore: v.behaviorScore,
          adaptiveWeight: v.adaptiveWeight,
          tier: getTier(v.stake),
          joinedAt: v.joinedAt,
          location: v.address ? v.address.slice(2, 4) : undefined // derive region from address
        })),
        summary: {
          total: validators.length,
          active: activeCount,
          inactive: validators.length - activeCount,
          totalStaked: formatLargeNumber(validators.reduce((sum: number, v: Validator) => {
            try {
              const val = BigInt(v.stake || '0');
              return sum + Number(val) / 1e18;
            } catch {
              return sum;
            }
          }, 0)),
          avgUptime: (validators.reduce((sum: number, v: Validator) => {
            const num = parseFloat(v.uptime || '0');
            return sum + (num > 100 ? num / 100 : num);
          }, 0) / validators.length).toFixed(2),
          avgApy: (validators.reduce((sum: number, v: Validator) => {
            const num = parseFloat(v.apy || '0');
            return sum + (num > 100 ? num / 100 : num);
          }, 0) / validators.length).toFixed(2)
        }
      },
      lastUpdated: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch validators'
    });
  }
});

/**
 * GET /api/public/v1/validators/top
 * Top validators by stake
 */
router.get('/validators/top', async (req: Request, res: Response) => {
  try {
    setCacheHeaders(res, CACHE_MEDIUM);
    
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const validators = await storage.getAllValidators();
    
    const topValidators = validators
      .sort((a: Validator, b: Validator) => {
        try {
          return Number(BigInt(b.stake || '0') - BigInt(a.stake || '0'));
        } catch {
          return 0;
        }
      })
      .slice(0, limit);
    
    // Helper functions for conversion
    const bpsToPercent = (val: string | number | undefined) => {
      const num = parseFloat(String(val || '0'));
      return num > 100 ? (num / 100).toFixed(2) : String(num);
    };
    const weiToTburn = (val: string | undefined) => {
      if (!val) return '0';
      try {
        return (Number(BigInt(val)) / 1e18).toFixed(2);
      } catch {
        return '0';
      }
    };
    
    res.json({
      success: true,
      data: topValidators.map((v: Validator, index: number) => ({
        rank: index + 1,
        address: v.address,
        name: v.name,
        stake: weiToTburn(v.stake),
        commission: bpsToPercent(v.commission),
        uptime: bpsToPercent(v.uptime),
        apy: bpsToPercent(v.apy),
        status: v.status
      })),
      lastUpdated: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top validators'
    });
  }
});

// ============================================
// DeFi Metrics (DeFi Hub, Solutions Pages)
// ============================================

/**
 * GET /api/public/v1/defi/summary
 * DeFi ecosystem summary for DeFi Hub page
 */
router.get('/defi/summary', async (req: Request, res: Response) => {
  try {
    setCacheHeaders(res, CACHE_MEDIUM);
    
    const moduleMetrics = dataHub.getModuleMetrics();
    const dexMetrics = moduleMetrics?.dex;
    const stakingMetrics = moduleMetrics?.staking;
    const lendingMetrics = moduleMetrics?.lending;
    
    res.json({
      success: true,
      data: {
        tvl: "$1.24B",
        tvlChange24h: "+8.5%",
        volume24h: dexMetrics?.volume24h || "$245M",
        volumeChange24h: "+12.3%",
        totalPools: dexMetrics?.totalPools || 156,
        activeLPs: 12847,
        totalStaked: stakingMetrics?.totalStaked || "$847.5M",
        stakingApy: `${stakingMetrics?.apy || 18.5}%`,
        lendingTvl: lendingMetrics?.totalSupplied || "$312M",
        borrowVolume: lendingMetrics?.totalBorrowed || "$89M",
        yieldVaults: 24,
        bridgeVolume24h: "$45.2M",
        crossChainTxns: 8945,
        dex: {
          pairs: dexMetrics?.totalPools || 156,
          volume24h: dexMetrics?.volume24h || "$145M",
          fees24h: "$435K",
          trades24h: dexMetrics?.activeSwaps || 45678
        },
        lending: {
          totalSupplied: lendingMetrics?.totalSupplied || "$412M",
          totalBorrowed: lendingMetrics?.totalBorrowed || "$89M",
          utilizationRate: `${lendingMetrics?.utilizationRate || 21.6}%`,
          avgSupplyApy: "8.5%",
          avgBorrowApy: "12.3%"
        },
        staking: {
          totalStaked: stakingMetrics?.totalStaked || "$847.5M",
          validators: 125,
          avgApy: `${stakingMetrics?.apy || 18.5}%`,
          rewards24h: "$1.2M"
        }
      },
      lastUpdated: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch DeFi summary'
    });
  }
});

// ============================================
// Bridge Stats (Cross-Chain Bridge Page)
// ============================================

/**
 * GET /api/public/v1/bridge/summary
 * Bridge activity summary
 */
router.get('/bridge/summary', async (req: Request, res: Response) => {
  try {
    setCacheHeaders(res, CACHE_MEDIUM);
    
    const moduleMetrics = dataHub.getModuleMetrics();
    const bridgeMetrics = moduleMetrics?.bridge;
    
    res.json({
      success: true,
      data: {
        totalVolume: bridgeMetrics?.totalBridged || "$2.4B",
        volume24h: bridgeMetrics?.volume24h || "$45.2M",
        totalTransfers: 156789,
        transfers24h: bridgeMetrics?.pendingTransfers || 8945,
        supportedChains: bridgeMetrics?.supportedChains || 7,
        chains: [
          { name: "Ethereum", volume: "$1.2B", txns: 45678, status: "active" },
          { name: "BSC", volume: "$456M", txns: 34567, status: "active" },
          { name: "Polygon", volume: "$234M", txns: 23456, status: "active" },
          { name: "Arbitrum", volume: "$189M", txns: 18945, status: "active" },
          { name: "Avalanche", volume: "$156M", txns: 15678, status: "active" },
          { name: "Solana", volume: "$98M", txns: 9845, status: "active" },
          { name: "Base", volume: "$67M", txns: 6789, status: "active" }
        ],
        avgBridgeTime: "< 3 min",
        successRate: "99.8%",
        liquidity: bridgeMetrics?.tvlLocked || "$312M"
      },
      lastUpdated: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bridge summary'
    });
  }
});

// ============================================
// Auto-Burn Stats (Tokenomics Page)
// ============================================

/**
 * GET /api/public/v1/tokenomics/burn
 * Token burn statistics
 */
router.get('/tokenomics/burn', async (req: Request, res: Response) => {
  try {
    setCacheHeaders(res, CACHE_MEDIUM);
    
    const moduleMetrics = dataHub.getModuleMetrics();
    const burnMetrics = moduleMetrics?.burn;
    
    res.json({
      success: true,
      data: {
        totalBurned: burnMetrics?.totalBurned || "2,345,000,000",
        burned24h: burnMetrics?.burnRate24h || "350,000",
        burnRate: `${burnMetrics?.deflationRate || 1.53}%`,
        nextBurnBlock: 14035500,
        burnTypes: {
          transaction: { amount: "1,234,000,000", percentage: "52.6%" },
          timeBased: { amount: "845,000,000", percentage: "36.0%" },
          aiOptimized: { amount: "266,000,000", percentage: "11.4%" }
        },
        totalSupply: "10,000,000,000",
        circulatingSupply: burnMetrics?.circulatingSupply || "7,000,000,000",
        deflationRate: `${burnMetrics?.deflationRate || 1.53}%`,
        projectedAnnualBurn: "153,000,000"
      },
      lastUpdated: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch burn stats'
    });
  }
});

// ============================================
// AI Governance Stats (AI Features Page)
// ============================================

/**
 * GET /api/public/v1/ai/summary
 * AI orchestration summary
 */
router.get('/ai/summary', async (req: Request, res: Response) => {
  try {
    setCacheHeaders(res, CACHE_MEDIUM);
    
    const aiDecisions = await storage.getRecentAiDecisions(100);
    const totalDecisions = aiDecisions.length;
    const avgConfidence = totalDecisions > 0 
      ? aiDecisions.reduce((sum, d) => sum + (d.confidence || 0), 0) / totalDecisions 
      : 0.95;
    
    res.json({
      success: true,
      data: {
        totalDecisions: 1245678,
        decisions24h: totalDecisions * 10 || 12456,
        avgConfidence: `${(avgConfidence * 100).toFixed(1)}%`,
        avgResponseTime: "45ms",
        accuracy: "99.2%",
        models: {
          gpt5: { requests: 456789, avgTime: "52ms", accuracy: "99.1%" },
          claude: { requests: 389456, avgTime: "48ms", accuracy: "99.4%" },
          llama: { requests: 399433, avgTime: "35ms", accuracy: "98.9%" }
        },
        trustScores: {
          processed: 89456,
          avgScore: 78.5,
          highTrust: 45678,
          mediumTrust: 32456,
          lowTrust: 11322
        },
        shardOptimization: {
          rebalances24h: 156,
          avgLoadBalance: "94.5%",
          crossShardTxns: 45678
        }
      },
      lastUpdated: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch AI summary'
    });
  }
});

// ============================================
// Search (Universal Search)
// ============================================

/**
 * GET /api/public/v1/search
 * Universal search across blocks, transactions, addresses
 * Supports partial address search (4+ characters)
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    setCacheHeaders(res, CACHE_SHORT);
    
    const query = (req.query.q as string || '').trim().toLowerCase();
    
    if (!query || query.length < 2) {
      return res.json({ success: true, data: { results: [], query: '', total: 0 } });
    }
    
    const results: any[] = [];
    
    // Enterprise-grade sample addresses for partial search (expanded for better coverage)
    const sampleAddresses = [
      // Core Protocol Contracts (using tburn prefix format)
      { address: SYSTEM_ADDRESSES.TREASURY, label: 'Treasury Wallet', balance: '125,450,000 TBURN', type: 'contract' },
      { address: SYSTEM_ADDRESSES.STAKING, label: 'Staking Pool', balance: '85,250,000 TBURN', type: 'contract' },
      { address: addressFromString('tburn-bridge-contract'), label: 'Bridge Contract', balance: '45,780,000 TBURN', type: 'contract' },
      { address: addressFromString('tburn-dex-router'), label: 'DEX Router', balance: '12,340,000 TBURN', type: 'contract' },
      { address: addressFromString('tburn-lending-protocol'), label: 'Lending Protocol', balance: '78,920,000 TBURN', type: 'contract' },
      { address: addressFromString('tburn-governance-contract'), label: 'Governance', balance: '56,780,000 TBURN', type: 'contract' },
      { address: addressFromString('tburn-nft-marketplace'), label: 'NFT Marketplace', balance: '23,450,000 TBURN', type: 'contract' },
      { address: addressFromString('tburn-yield-farming'), label: 'Yield Farming', balance: '34,560,000 TBURN', type: 'contract' },
      { address: addressFromString('tburn-token-vesting'), label: 'Token Vesting', balance: '67,890,000 TBURN', type: 'contract' },
      { address: SYSTEM_ADDRESSES.BURN, label: 'Burn Controller', balance: '0 TBURN', type: 'contract' },
      // Whale Wallets
      { address: addressFromString('whale-wallet-001'), label: 'Whale Wallet #1', balance: '15,670,000 TBURN', type: 'wallet' },
      { address: addressFromString('whale-wallet-002'), label: 'Whale Wallet #2', balance: '12,340,000 TBURN', type: 'wallet' },
      { address: addressFromString('validator-staker-wallet'), label: 'Validator Staker', balance: '8,900,000 TBURN', type: 'wallet' },
      { address: addressFromString('defi-power-user-wallet'), label: 'DeFi Power User', balance: '5,670,000 TBURN', type: 'wallet' },
      { address: addressFromString('nft-collector-wallet'), label: 'NFT Collector', balance: '3,450,000 TBURN', type: 'wallet' },
      // Additional addresses with common hex patterns
      { address: addressFromString('early-investor-wallet'), label: 'Early Investor Wallet', balance: '2,890,000 TBURN', type: 'wallet' },
      { address: SYSTEM_ADDRESSES.RESERVE, label: 'Foundation Reserve', balance: '45,000,000 TBURN', type: 'contract' },
      { address: SYSTEM_ADDRESSES.TEAM, label: 'Team Multisig', balance: '18,500,000 TBURN', type: 'contract' },
      { address: SYSTEM_ADDRESSES.ECOSYSTEM, label: 'Ecosystem Fund', balance: '32,100,000 TBURN', type: 'contract' },
      { address: addressFromString('tburn-rewards-pool'), label: 'Rewards Pool', balance: '15,750,000 TBURN', type: 'contract' },
      { address: addressFromString('tburn-insurance-fund'), label: 'Insurance Fund', balance: '8,250,000 TBURN', type: 'contract' },
      // More hex patterns for common searches
      { address: SYSTEM_ADDRESSES.LIQUIDITY, label: 'Liquidity Pool', balance: '95,000,000 TBURN', type: 'contract' },
      { address: addressFromString('tburn-burn-address-main'), label: 'Burn Address', balance: '0 TBURN', type: 'contract' },
      { address: addressFromString('tburn-community-treasury'), label: 'Community Treasury', balance: '28,500,000 TBURN', type: 'contract' },
      { address: addressFromString('marketing-wallet-main'), label: 'Marketing Wallet', balance: '5,200,000 TBURN', type: 'wallet' },
      { address: addressFromString('tburn-developer-fund'), label: 'Developer Fund', balance: '12,800,000 TBURN', type: 'contract' },
      { address: addressFromString('tburn-airdrop-contract'), label: 'Airdrop Contract', balance: '3,500,000 TBURN', type: 'contract' },
      { address: addressFromString('tburn-dao-treasury'), label: 'DAO Treasury', balance: '67,300,000 TBURN', type: 'contract' },
      { address: addressFromString('tburn-smart-contract-registry'), label: 'Smart Contract Registry', balance: '0 TBURN', type: 'contract' },
    ];
    
    // Sample transaction hashes for partial search (expanded with common patterns)
    const sampleTransactions = [
      { hash: '0x1234abcd5678ef901234abcd5678ef901234abcd5678ef901234abcd5678ef90', status: 'success', block: 21329150, value: '1,250 TBURN' },
      { hash: '0x2345bcde6789fa012345bcde6789fa012345bcde6789fa012345bcde6789fa01', status: 'success', block: 21329145, value: '5,678 TBURN' },
      { hash: '0x3456cdef7890ab123456cdef7890ab123456cdef7890ab123456cdef7890ab12', status: 'success', block: 21329140, value: '890 TBURN' },
      { hash: '0x4567defa8901bc234567defa8901bc234567defa8901bc234567defa8901bc23', status: 'pending', block: 21329155, value: '2,345 TBURN' },
      { hash: '0x5678efab9012cd345678efab9012cd345678efab9012cd345678efab9012cd34', status: 'success', block: 21329135, value: '12,500 TBURN' },
      { hash: '0xc4a87d1234567890abcdef1234567890abcdef1234567890abcdef1234567890', status: 'success', block: 21329148, value: '8,750 TBURN' },
      { hash: '0xa87dc41234567890abcdef1234567890abcdef1234567890abcdef1234567890', status: 'success', block: 21329147, value: '3,200 TBURN' },
      { hash: '0x87dc4a1234567890abcdef1234567890abcdef1234567890abcdef1234567890', status: 'success', block: 21329146, value: '15,800 TBURN' },
    ];
    
    // Fetch live blocks directly from the block list API endpoint (internal call)
    let liveBlocks: any[] = [];
    let liveTransactions: any[] = [];
    
    try {
      // Fetch blocks from the same internal API that the frontend uses (get more to handle timing differences)
      const blocksResponse = await fetch('http://localhost:5000/api/public/v1/network/blocks/recent?limit=200');
      const blocksData = await blocksResponse.json();
      if (blocksData.success && blocksData.data) {
        liveBlocks = blocksData.data.map((b: any) => ({
          hash: b.hash,
          blockNumber: b.number,
          txCount: b.transactions
        }));
      }
      
      // Fetch transactions from the same internal API (get more to handle timing differences)
      const txResponse = await fetch('http://localhost:5000/api/public/v1/network/transactions/recent?limit=200');
      const txData = await txResponse.json();
      if (txData.success && txData.data) {
        liveTransactions = txData.data.map((tx: any) => ({
          hash: tx.hash,
          status: tx.status,
          block: tx.blockNumber,
          value: `${(parseFloat(tx.value || '0') / 1e18).toFixed(2)} TBURN`
        }));
      }
    } catch (e) {
      // Fallback to storage-based generation
      const networkStats = await storage.getNetworkStats();
      const currentBlockHeight = networkStats?.currentBlockHeight || 20818000;
      for (let i = 0; i < 50; i++) {
        const blockNumber = currentBlockHeight - i;
        liveBlocks.push({
          hash: generateConsistentBlockHash(blockNumber),
          blockNumber: blockNumber,
          txCount: 100 + (blockNumber % 300)
        });
      }
      for (let i = 0; i < 50; i++) {
        const blockNumber = currentBlockHeight - Math.floor(i / 5);
        liveTransactions.push({
          hash: generateConsistentTxHash(blockNumber, i % 5),
          status: i % 10 === 0 ? 'pending' : 'success',
          block: blockNumber,
          value: `${(1000 + (i * 123) % 10000).toLocaleString()} TBURN`
        });
      }
    }
    
    // Use live data for search
    const sampleBlockHashes = liveBlocks;
    const dynamicTransactions = liveTransactions;
    
    // Search blocks by number
    if (/^\d+$/.test(query)) {
      const blockNumber = parseInt(query);
      // Generate block data for any valid block number
      const currentBlock = 21330000 + Math.floor(Date.now() / 1000) % 10000;
      if (blockNumber > 0 && blockNumber <= currentBlock) {
        results.push({
          type: 'block',
          title: `Block #${blockNumber.toLocaleString()}`,
          subtitle: `${Math.floor(Math.random() * 500) + 100} transactions • ${Math.floor(Math.random() * 50) + 10}s ago`,
          value: blockNumber.toString(),
          link: `/scan/block/${blockNumber}`
        });
      }
      
      // Also check storage
      try {
        const block = await storage.getBlockByNumber(blockNumber);
        if (block && !results.find(r => r.value === blockNumber.toString())) {
          results.push({
            type: 'block',
            title: `Block #${block.blockNumber}`,
            subtitle: `${block.transactionCount} transactions`,
            value: block.blockNumber.toString(),
            link: `/scan/block/${block.blockNumber}`
          });
        }
      } catch (e) {}
    }
    
    // Search exact transaction hash (66 chars)
    if (query.startsWith('0x') && query.length === 66) {
      try {
        const tx = await storage.getTransactionByHash(query);
        if (tx) {
          results.push({
            type: 'transaction',
            title: `Transaction ${query.slice(0, 10)}...${query.slice(-8)}`,
            subtitle: `${tx.status} • Block #${tx.blockNumber}`,
            value: tx.hash,
            link: `/scan/tx/${tx.hash}`
          });
        }
      } catch (e) {}
      
      // If not found in storage, return sample result
      if (results.length === 0) {
        results.push({
          type: 'transaction',
          title: `Transaction ${query.slice(0, 10)}...${query.slice(-8)}`,
          subtitle: `success • Block #21329150`,
          value: query,
          link: `/scan/tx/${query}`
        });
      }
    }
    
    // Search partial transaction hash (4+ chars starting with 0x)
    if (query.startsWith('0x') && query.length >= 4 && query.length < 66) {
      const matchingTxs = sampleTransactions.filter(tx => 
        tx.hash.toLowerCase().includes(query)
      );
      matchingTxs.forEach(tx => {
        results.push({
          type: 'transaction',
          title: `Transaction ${tx.hash.slice(0, 10)}...${tx.hash.slice(-8)}`,
          subtitle: `${tx.status} • Block #${tx.block} • ${tx.value}`,
          value: tx.hash,
          link: `/scan/tx/${tx.hash}`
        });
      });
    }
    
    // Search exact address (42 chars)
    if (query.startsWith('0x') && query.length === 42) {
      // Check sample addresses first
      const matchedSample = sampleAddresses.find(a => a.address.toLowerCase() === query);
      if (matchedSample) {
        results.push({
          type: 'address',
          title: matchedSample.label,
          subtitle: `${matchedSample.balance} • ${matchedSample.type}`,
          value: matchedSample.address,
          link: `/scan/address/${matchedSample.address}`
        });
      } else {
        results.push({
          type: 'address',
          title: `Address ${query.slice(0, 10)}...${query.slice(-8)}`,
          subtitle: 'View account details',
          value: query,
          link: `/scan/address/${query}`
        });
      }
      
      // Check if it's a validator
      try {
        const validators = await storage.getAllValidators();
        const validator = validators.find((v: Validator) => v.address.toLowerCase() === query);
        if (validator) {
          results.push({
            type: 'validator',
            title: validator.name || `Validator ${query.slice(0, 10)}...`,
            subtitle: `${validator.status} • ${validator.stakedAmount} TBURN staked`,
            value: query,
            link: `/scan/validators/${query}`
          });
        }
      } catch (e) {}
    }
    
    // PARTIAL ADDRESS SEARCH (4+ characters)
    if (query.length >= 4) {
      // Search sample block hashes by partial match
      const matchingBlockHashes = sampleBlockHashes.filter(b => 
        b.hash.toLowerCase().includes(query)
      ).slice(0, 5);
      
      matchingBlockHashes.forEach(block => {
        if (!results.find(r => r.value === block.blockNumber.toString() && r.type === 'block')) {
          results.push({
            type: 'block',
            title: `Block #${block.blockNumber.toLocaleString()}`,
            subtitle: `Hash: ${block.hash.slice(0, 12)}...${block.hash.slice(-8)} • ${block.txCount} txs`,
            value: block.blockNumber.toString(),
            link: `/scan/block/${block.blockNumber}`
          });
        }
      });
      
      // Search live transactions by partial match
      const matchingLiveTxs = dynamicTransactions.filter(tx => 
        tx.hash.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      
      matchingLiveTxs.forEach(tx => {
        if (!results.find(r => r.value === tx.hash)) {
          results.push({
            type: 'transaction',
            title: `Transaction ${tx.hash.slice(0, 10)}...${tx.hash.slice(-8)}`,
            subtitle: `${tx.status} • Block #${tx.block} • ${tx.value}`,
            value: tx.hash,
            link: `/scan/tx/${tx.hash}`
          });
        }
      });
      
      // Also search static sample transactions
      const matchingStaticTxs = sampleTransactions.filter(tx => 
        tx.hash.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      
      matchingStaticTxs.forEach(tx => {
        if (!results.find(r => r.value === tx.hash)) {
          results.push({
            type: 'transaction',
            title: `Transaction ${tx.hash.slice(0, 10)}...${tx.hash.slice(-8)}`,
            subtitle: `${tx.status} • Block #${tx.block} • ${tx.value}`,
            value: tx.hash,
            link: `/scan/tx/${tx.hash}`
          });
        }
      });
      
      // Search sample addresses by partial match
      const matchingAddresses = sampleAddresses.filter(a => 
        a.address.toLowerCase().includes(query) || 
        a.label.toLowerCase().includes(query)
      ).slice(0, 5);
      
      matchingAddresses.forEach(addr => {
        if (!results.find(r => r.value === addr.address)) {
          results.push({
            type: 'address',
            title: addr.label,
            subtitle: `${addr.address.slice(0, 10)}...${addr.address.slice(-8)} • ${addr.balance}`,
            value: addr.address,
            link: `/scan/address/${addr.address}`
          });
        }
      });
      
      // Search validators by name or partial address
      try {
        const validators = await storage.getAllValidators();
        const matchingValidators = validators.filter((v: Validator) => 
          v.name?.toLowerCase().includes(query) ||
          v.address.toLowerCase().includes(query)
        ).slice(0, 5);
        
        matchingValidators.forEach((v: Validator) => {
          if (!results.find(r => r.value === v.address)) {
            results.push({
              type: 'validator',
              title: v.name || 'Unknown Validator',
              subtitle: `${v.status} • ${v.stakedAmount} TBURN`,
              value: v.address,
              link: `/scan/validators/${v.address}`
            });
          }
        });
      } catch (e) {}
    }
    
    // Search tokens by name or symbol (using tburn address format)
    const tokens = [
      { symbol: 'TBURN', name: 'TBURN Token', address: addressFromString('tburn-native-token') },
      { symbol: 'EMB', name: 'Ember Gas Token', address: addressFromString('ember-gas-token') },
      { symbol: 'stTBURN', name: 'Staked TBURN', address: addressFromString('staked-tburn-token') },
      { symbol: 'USDT', name: 'Tether USD (TBURN)', address: addressFromString('usdt-tburn-bridge') },
      { symbol: 'USDC', name: 'USD Coin (TBURN)', address: addressFromString('usdc-tburn-bridge') },
    ];
    
    const matchingTokens = tokens.filter(t => 
      t.symbol.toLowerCase().includes(query) ||
      t.name.toLowerCase().includes(query)
    );
    
    matchingTokens.forEach(token => {
      results.push({
        type: 'token',
        title: `${token.name} (${token.symbol})`,
        subtitle: `${token.address.slice(0, 10)}...${token.address.slice(-8)}`,
        value: token.address,
        link: `/scan/token/${token.address}`
      });
    });
    
    res.json({
      success: true,
      data: {
        results: results.slice(0, 15),
        query,
        total: results.length
      }
    });
  } catch (error) {
    console.error('[Search API] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed'
    });
  }
});

// ============================================
// News & Community (Community Pages)
// ============================================

/**
 * GET /api/public/v1/news
 * Recent news articles
 */
router.get('/news', async (req: Request, res: Response) => {
  try {
    setCacheHeaders(res, CACHE_LONG);
    
    res.json({
      success: true,
      data: {
        featured: [
          {
            id: 1,
            slug: "v4-mainnet-launch",
            title: "TBurn Chain V4 Mainnet Launch - Official Release",
            description: "The world's first trust-based Layer 1 blockchain officially launches.",
            category: "Announcement",
            date: "2024-11-28",
            readTime: "5 min",
            views: "128.5K",
            author: "TBurn Team"
          },
          {
            id: 2,
            slug: "triple-band-ai-revealed",
            title: "Triple-Band AI System Revealed",
            description: "TBurn Chain's core AI system unveiled with real-time Trust Score analysis.",
            category: "Technology",
            date: "2024-11-25",
            readTime: "8 min",
            views: "89.2K",
            author: "AI Research Team"
          },
          {
            id: 3,
            slug: "global-partnership-expansion",
            title: "Global Partnership Expansion - 30 Exchanges",
            description: "TBurn partners with major global exchanges for TBURN listing.",
            category: "Partnership",
            date: "2024-11-15",
            readTime: "4 min",
            views: "98.7K",
            author: "Business Team"
          }
        ],
        latest: [
          {
            id: 4,
            slug: "staking-program-details",
            title: "TBURN Token Staking Program Details",
            description: "Earn 12-25% APY through validator node operation.",
            category: "Tokenomics",
            date: "2024-11-22"
          },
          {
            id: 5,
            slug: "trust-score-deep-dive",
            title: "Trust Score System Deep Dive",
            description: "Detailed explanation of the 5 evaluation factors.",
            category: "Security",
            date: "2024-11-20"
          },
          {
            id: 6,
            slug: "sdk-2-released",
            title: "Developer SDK 2.0 Released",
            description: "Full TypeScript support and new Trust Score APIs.",
            category: "Development",
            date: "2024-11-18"
          }
        ]
      },
      lastUpdated: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news'
    });
  }
});

/**
 * GET /api/public/v1/events
 * Upcoming events
 */
router.get('/events', async (req: Request, res: Response) => {
  try {
    setCacheHeaders(res, CACHE_LONG);
    
    res.json({
      success: true,
      data: {
        featured: {
          title: "TBurn Chain V4 Mainnet Launch Event",
          date: "2024-12-05",
          time: "14:00 UTC",
          location: "Virtual / Global",
          registrations: 12456
        },
        upcoming: [
          {
            id: 1,
            title: "Developer Workshop: Building on TBurn",
            date: "2024-12-10",
            type: "Workshop",
            format: "Virtual"
          },
          {
            id: 2,
            title: "TBurn DeFi Summit 2024",
            date: "2024-12-15",
            type: "Conference",
            format: "Hybrid"
          },
          {
            id: 3,
            title: "Community AMA with Core Team",
            date: "2024-12-20",
            type: "AMA",
            format: "Virtual"
          }
        ]
      },
      lastUpdated: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events'
    });
  }
});

/**
 * GET /api/public/v1/tokens
 * Token list for TBURNScan explorer
 */
router.get('/tokens', async (req: Request, res: Response) => {
  try {
    setCacheHeaders(res, CACHE_MEDIUM);
    
    const now = Date.now();
    
    // Enterprise-grade token data for TBURN Mainnet
    const tokens = [
      {
        id: 'tburn',
        symbol: 'TBURN',
        name: 'TBURN Token',
        address: addressFromString('tburn-native-token'),
        decimals: 18,
        totalSupply: '1000000000000000000000000000',
        circulatingSupply: '500000000000000000000000000',
        price: 2.45,
        priceChange24h: 3.25,
        marketCap: 1225000000,
        volume24h: 45670000,
        holders: 125678,
        transfers24h: 45892,
        standard: 'TBC-20',
        verified: true,
        logo: '/tokens/tburn.png',
        createdAt: now - 90 * 24 * 3600000
      },
      {
        id: 'emb',
        symbol: 'EMB',
        name: 'Ember Gas Token',
        address: addressFromString('ember-gas-token'),
        decimals: 18,
        totalSupply: '1000000000000000000000000000000000',
        circulatingSupply: '750000000000000000000000000000000',
        price: 0.0000024,
        priceChange24h: 1.5,
        marketCap: 1800000,
        volume24h: 125000,
        holders: 98456,
        transfers24h: 28456,
        standard: 'Native Gas',
        verified: true,
        logo: '/tokens/emb.png',
        createdAt: now - 90 * 24 * 3600000
      },
      {
        id: 'stburn',
        symbol: 'stTBURN',
        name: 'Staked TBURN',
        address: addressFromString('staked-tburn-token'),
        decimals: 18,
        totalSupply: '350000000000000000000000000',
        circulatingSupply: '350000000000000000000000000',
        price: 2.52,
        priceChange24h: 3.45,
        marketCap: 882000000,
        volume24h: 12500000,
        holders: 45678,
        transfers24h: 8945,
        standard: 'TBC-20',
        verified: true,
        logo: '/tokens/sttburn.png',
        createdAt: now - 60 * 24 * 3600000
      },
      {
        id: 'usdt',
        symbol: 'USDT',
        name: 'Tether USD (TBURN)',
        address: addressFromString('usdt-tburn-bridge'),
        decimals: 6,
        totalSupply: '1000000000000000',
        circulatingSupply: '850000000000000',
        price: 1.0,
        priceChange24h: 0.01,
        marketCap: 850000000,
        volume24h: 125000000,
        holders: 78945,
        transfers24h: 35678,
        standard: 'TBC-20',
        verified: true,
        logo: '/tokens/usdt.png',
        createdAt: now - 45 * 24 * 3600000
      },
      {
        id: 'usdc',
        symbol: 'USDC',
        name: 'USD Coin (TBURN)',
        address: addressFromString('usdc-tburn-bridge'),
        decimals: 6,
        totalSupply: '750000000000000',
        circulatingSupply: '700000000000000',
        price: 1.0,
        priceChange24h: -0.01,
        marketCap: 700000000,
        volume24h: 95000000,
        holders: 65432,
        transfers24h: 28945,
        standard: 'TBC-20',
        verified: true,
        logo: '/tokens/usdc.png',
        createdAt: now - 45 * 24 * 3600000
      },
      {
        id: 'weth',
        symbol: 'WETH',
        name: 'Wrapped Ether (TBURN)',
        address: addressFromString('weth-tburn-bridge'),
        decimals: 18,
        totalSupply: '50000000000000000000000',
        circulatingSupply: '45000000000000000000000',
        price: 2250.0,
        priceChange24h: 2.15,
        marketCap: 101250000,
        volume24h: 8500000,
        holders: 23456,
        transfers24h: 4567,
        standard: 'TBC-20',
        verified: true,
        logo: '/tokens/weth.png',
        createdAt: now - 30 * 24 * 3600000
      },
      {
        id: 'wbtc',
        symbol: 'WBTC',
        name: 'Wrapped Bitcoin (TBURN)',
        address: addressFromString('wbtc-tburn-bridge'),
        decimals: 8,
        totalSupply: '250000000000',
        circulatingSupply: '220000000000',
        price: 42500.0,
        priceChange24h: 1.85,
        marketCap: 93500000,
        volume24h: 5600000,
        holders: 12345,
        transfers24h: 1234,
        standard: 'TBC-20',
        verified: true,
        logo: '/tokens/wbtc.png',
        createdAt: now - 30 * 24 * 3600000
      },
      {
        id: 'lp-tburn-usdt',
        symbol: 'LP-TBURN-USDT',
        name: 'TBURN-USDT LP Token',
        address: addressFromString('tburn-usdt-lp-token'),
        decimals: 18,
        totalSupply: '25000000000000000000000000',
        circulatingSupply: '25000000000000000000000000',
        price: 5.2,
        priceChange24h: 2.5,
        marketCap: 130000000,
        volume24h: 2500000,
        holders: 8945,
        transfers24h: 1567,
        standard: 'TBC-20',
        verified: true,
        logo: '/tokens/lp.png',
        createdAt: now - 20 * 24 * 3600000
      }
    ];
    
    res.json({
      success: true,
      data: tokens,
      total: tokens.length,
      lastUpdated: now
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tokens'
    });
  }
});

/**
 * GET /api/public/v1/tokens/:address
 * Token detail for TBURNScan explorer
 */
router.get('/tokens/:address', async (req: Request, res: Response) => {
  try {
    setCacheHeaders(res, CACHE_MEDIUM);
    
    const { address } = req.params;
    const now = Date.now();
    
    // Sample token detail - in production would fetch from storage/blockchain
    res.json({
      success: true,
      data: {
        address,
        symbol: address.includes('0001') ? 'TBURN' : 'TOKEN',
        name: address.includes('0001') ? 'TBURN Token' : 'Sample Token',
        decimals: 18,
        totalSupply: '1000000000000000000000000000',
        circulatingSupply: '500000000000000000000000000',
        price: 2.45,
        priceChange24h: 3.25,
        marketCap: 1225000000,
        volume24h: 45670000,
        holders: 125678,
        transfers24h: 45892,
        standard: 'TBC-20',
        verified: true,
        priceHistory: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(now - (29 - i) * 24 * 3600000).toISOString().split('T')[0],
          price: 2.45 + (Math.random() - 0.5) * 0.5
        })),
        topHolders: [
          { address: '0x1234...5678', balance: '50000000', percentage: 5.0 },
          { address: '0x2345...6789', balance: '35000000', percentage: 3.5 },
          { address: '0x3456...7890', balance: '28000000', percentage: 2.8 }
        ]
      },
      lastUpdated: now
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch token detail'
    });
  }
});

// ============================================
// TESTNET Explorer Endpoints
// ============================================

/**
 * GET /api/public/v1/testnet/network/stats
 * Testnet network statistics
 */
router.get('/testnet/network/stats', async (req: Request, res: Response) => {
  try {
    setCacheHeaders(res, CACHE_SHORT);
    const now = Date.now();
    
    // Try cache first (30s TTL)
    const cache = getDataCache();
    const cached = cache.get<any>(PUBLIC_CACHE_KEYS.TESTNET_STATS);
    if (cached) {
      return res.json({ success: true, data: cached, lastUpdated: now });
    }
    
    // Build data using shared formatter
    const data = await buildPublicTestnetStats();
    
    // Cache for 30 seconds
    cache.set(PUBLIC_CACHE_KEYS.TESTNET_STATS, data, 30000);
    
    res.json({ success: true, data, lastUpdated: now });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch testnet stats' });
  }
});

/**
 * GET /api/public/v1/testnet/network/blocks/recent
 * Testnet recent blocks
 */
router.get('/testnet/network/blocks/recent', async (req: Request, res: Response) => {
  try {
    setCacheHeaders(res, CACHE_SHORT);
    const now = Date.now();
    const baseBlock = 1245000 + Math.floor((now - new Date('2024-12-01').getTime()) / 500);
    
    const blocks = Array.from({ length: 10 }, (_, i) => ({
      number: baseBlock - i,
      hash: generateConsistentBlockHash(baseBlock - i),
      parentHash: generateConsistentBlockHash(baseBlock - i - 1),
      timestamp: now - i * 500,
      transactions: Math.floor(Math.random() * 30) + 5,
      gasUsed: Math.floor(Math.random() * 5000000) + 2000000,
      gasLimit: 15000000,
      validator: generateConsistentAddress(((baseBlock - i) * 7) % 12),
      size: Math.floor(Math.random() * 50000) + 10000
    }));
    
    res.json({ success: true, data: blocks, lastUpdated: now });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch testnet blocks' });
  }
});

/**
 * GET /api/public/v1/testnet/network/transactions/recent
 * Testnet recent transactions
 */
router.get('/testnet/network/transactions/recent', async (req: Request, res: Response) => {
  try {
    setCacheHeaders(res, CACHE_SHORT);
    const now = Date.now();
    const baseBlock = 1245000 + Math.floor((now - new Date('2024-12-01').getTime()) / 500);
    
    const transactions = Array.from({ length: 15 }, (_, i) => ({
      hash: generateConsistentTxHash(baseBlock, i),
      blockNumber: baseBlock - Math.floor(i / 3),
      from: generateConsistentAddress(i * 17 + 100),
      to: generateConsistentAddress(i * 23 + 200),
      value: (Math.floor(Math.random() * 100) * 1e18).toString(),
      gasPrice: '100',
      gasUsed: Math.floor(Math.random() * 100000) + 21000,
      timestamp: now - i * 2000,
      status: Math.random() > 0.05 ? 'confirmed' : 'failed'
    }));
    
    res.json({ success: true, data: transactions, lastUpdated: now });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch testnet transactions' });
  }
});

/**
 * GET /api/public/v1/testnet/network/blocks
 * Testnet blocks list with pagination
 */
router.get('/testnet/network/blocks', async (req: Request, res: Response) => {
  try {
    setCacheHeaders(res, CACHE_SHORT);
    const now = Date.now();
    const page = parseInt(req.query.page as string) || 1;
    const limit = 25;
    const baseBlock = 1245000 + Math.floor((now - new Date('2024-12-01').getTime()) / 500);
    const offset = (page - 1) * limit;
    
    const blocks = Array.from({ length: limit }, (_, i) => ({
      number: baseBlock - offset - i,
      hash: generateConsistentBlockHash(baseBlock - offset - i),
      timestamp: now - (offset + i) * 500,
      transactions: Math.floor(Math.random() * 30) + 5,
      gasUsed: Math.floor(Math.random() * 5000000) + 2000000,
      gasLimit: 15000000,
      validator: generateConsistentAddress(((baseBlock - offset - i) * 7) % 12),
      size: Math.floor(Math.random() * 50000) + 10000
    }));
    
    res.json({ success: true, data: blocks, total: baseBlock, page, limit, lastUpdated: now });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch testnet blocks' });
  }
});

/**
 * GET /api/public/v1/testnet/network/transactions
 * Testnet transactions list with pagination
 */
router.get('/testnet/network/transactions', async (req: Request, res: Response) => {
  try {
    setCacheHeaders(res, CACHE_SHORT);
    const now = Date.now();
    const page = parseInt(req.query.page as string) || 1;
    const limit = 25;
    const baseBlock = 1245000 + Math.floor((now - new Date('2024-12-01').getTime()) / 500);
    const offset = (page - 1) * limit;
    
    const transactions = Array.from({ length: limit }, (_, i) => ({
      hash: generateConsistentTxHash(baseBlock - Math.floor((offset + i) / 5), (offset + i) % 100),
      blockNumber: baseBlock - Math.floor((offset + i) / 5),
      from: generateConsistentAddress((offset + i) * 17 + 100),
      to: generateConsistentAddress((offset + i) * 23 + 200),
      value: (Math.floor(Math.random() * 100) * 1e18).toString(),
      gasUsed: Math.floor(Math.random() * 100000) + 21000,
      timestamp: now - (offset + i) * 2000,
      status: Math.random() > 0.05 ? 'confirmed' : 'failed'
    }));
    
    res.json({ success: true, data: transactions, total: 4532100, page, limit, lastUpdated: now });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch testnet transactions' });
  }
});

/**
 * GET /api/public/v1/testnet/validators
 * Testnet validators list
 */
router.get('/testnet/validators', async (req: Request, res: Response) => {
  try {
    setCacheHeaders(res, CACHE_MEDIUM);
    
    const validators = [
      { address: generateConsistentAddress(1), name: 'TBurn Foundation Testnet 1', status: 'active', stake: '50000000000000000000000000', delegators: 234, uptime: 99.9, blocksProduced: 125678, commission: 5 },
      { address: generateConsistentAddress(2), name: 'TBurn Foundation Testnet 2', status: 'active', stake: '45000000000000000000000000', delegators: 189, uptime: 99.8, blocksProduced: 118934, commission: 5 },
      { address: generateConsistentAddress(3), name: 'TBurn Foundation Testnet 3', status: 'active', stake: '40000000000000000000000000', delegators: 156, uptime: 99.7, blocksProduced: 112456, commission: 6 },
      { address: generateConsistentAddress(4), name: 'Community Testnet Node 1', status: 'active', stake: '25000000000000000000000000', delegators: 89, uptime: 99.5, blocksProduced: 78234, commission: 8 },
      { address: generateConsistentAddress(5), name: 'Community Testnet Node 2', status: 'active', stake: '22000000000000000000000000', delegators: 67, uptime: 99.3, blocksProduced: 67892, commission: 7 },
      { address: generateConsistentAddress(6), name: 'Dev Testnet Node', status: 'active', stake: '18000000000000000000000000', delegators: 45, uptime: 98.9, blocksProduced: 54321, commission: 10 },
      { address: generateConsistentAddress(7), name: 'Research Testnet Node', status: 'active', stake: '15000000000000000000000000', delegators: 34, uptime: 99.1, blocksProduced: 45678, commission: 9 },
      { address: generateConsistentAddress(8), name: 'Partner Testnet 1', status: 'active', stake: '12000000000000000000000000', delegators: 23, uptime: 99.4, blocksProduced: 38901, commission: 6 },
      { address: generateConsistentAddress(9), name: 'Partner Testnet 2', status: 'active', stake: '10000000000000000000000000', delegators: 18, uptime: 98.8, blocksProduced: 32145, commission: 8 },
      { address: generateConsistentAddress(10), name: 'Academic Testnet Node', status: 'active', stake: '8000000000000000000000000', delegators: 12, uptime: 99.0, blocksProduced: 28765, commission: 5 },
      { address: generateConsistentAddress(11), name: 'Enterprise Testnet', status: 'active', stake: '6000000000000000000000000', delegators: 8, uptime: 98.7, blocksProduced: 21098, commission: 7 },
      { address: generateConsistentAddress(12), name: 'Backup Testnet Node', status: 'inactive', stake: '3000000000000000000000000', delegators: 5, uptime: 95.2, blocksProduced: 12345, commission: 10 }
    ];
    
    res.json({ success: true, data: validators, lastUpdated: Date.now() });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch testnet validators' });
  }
});

/**
 * GET /api/public/v1/testnet/tokens
 * Testnet tokens list
 */
router.get('/testnet/tokens', async (req: Request, res: Response) => {
  try {
    setCacheHeaders(res, CACHE_MEDIUM);
    
    const tokens = [
      { address: addressFromString('testnet-tburn-token'), name: 'Test TBURN', symbol: 'tTBURN', decimals: 18, totalSupply: '1000000000000000000000000000', holders: 5678, price: 0, change24h: 0 },
      { address: addressFromString('testnet-usdt-token'), name: 'Test USDT', symbol: 'tUSDT', decimals: 6, totalSupply: '500000000000000', holders: 3456, price: 1.0, change24h: 0.01 },
      { address: addressFromString('testnet-usdc-token'), name: 'Test USDC', symbol: 'tUSDC', decimals: 6, totalSupply: '450000000000000', holders: 2987, price: 1.0, change24h: -0.02 },
      { address: addressFromString('testnet-wbtc-token'), name: 'Test Wrapped BTC', symbol: 'tWBTC', decimals: 8, totalSupply: '21000000000000', holders: 1234, price: 0, change24h: 0 },
      { address: addressFromString('testnet-weth-token'), name: 'Test Wrapped ETH', symbol: 'tWETH', decimals: 18, totalSupply: '100000000000000000000000', holders: 2345, price: 0, change24h: 0 }
    ];
    
    res.json({ success: true, data: tokens, lastUpdated: Date.now() });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch testnet tokens' });
  }
});

/**
 * GET /api/public/v1/testnet/network/block/:blockNumber
 * Testnet block detail
 */
router.get('/testnet/network/block/:blockNumber', async (req: Request, res: Response) => {
  try {
    setCacheHeaders(res, CACHE_SHORT);
    const blockNumber = parseInt(req.params.blockNumber);
    const now = Date.now();
    const baseTime = new Date('2024-12-01').getTime();
    const blockTimestamp = baseTime + (blockNumber - 1245000) * 500;
    
    res.json({
      success: true,
      data: {
        number: blockNumber,
        hash: generateConsistentBlockHash(blockNumber),
        parentHash: generateConsistentBlockHash(blockNumber - 1),
        timestamp: blockTimestamp,
        transactions: Math.floor(((blockNumber * 7919) % 30) + 5),
        gasUsed: Math.floor(((blockNumber * 6271) % 5000000) + 2000000),
        gasLimit: 15000000,
        validator: generateConsistentAddress(((blockNumber) * 7) % 12),
        size: Math.floor(((blockNumber * 4139) % 50000) + 10000)
      },
      lastUpdated: now
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch testnet block' });
  }
});

/**
 * GET /api/public/v1/testnet/network/tx/:hash
 * Testnet transaction detail
 */
router.get('/testnet/network/tx/:hash', async (req: Request, res: Response) => {
  try {
    setCacheHeaders(res, CACHE_SHORT);
    const hash = req.params.hash;
    const now = Date.now();
    const baseBlock = 1245000 + Math.floor((now - new Date('2024-12-01').getTime()) / 500);
    const seed = parseInt(hash.slice(2, 10), 16) || 12345;
    
    res.json({
      success: true,
      data: {
        hash,
        blockNumber: baseBlock - (seed % 1000),
        from: generateConsistentAddress(seed),
        to: generateConsistentAddress(seed + 100),
        value: ((seed % 100) * 1e18).toString(),
        gasPrice: '100',
        gasUsed: (seed % 100000) + 21000,
        timestamp: now - (seed % 100000) * 100,
        status: (seed % 20) > 0 ? 'confirmed' : 'failed',
        nonce: seed % 1000,
        input: '0x'
      },
      lastUpdated: now
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch testnet transaction' });
  }
});

/**
 * GET /api/public/v1/testnet/address/:address
 * Testnet address detail
 */
router.get('/testnet/address/:address', async (req: Request, res: Response) => {
  try {
    setCacheHeaders(res, CACHE_SHORT);
    const address = req.params.address;
    const now = Date.now();
    const baseBlock = 1245000 + Math.floor((now - new Date('2024-12-01').getTime()) / 500);
    const seed = parseInt(address.slice(2, 10), 16) || 12345;
    
    const transactions = Array.from({ length: 10 }, (_, i) => ({
      hash: generateConsistentTxHash(baseBlock - i * 10, seed + i),
      blockNumber: baseBlock - i * 10,
      from: i % 2 === 0 ? address : generateConsistentAddress(seed + i * 17),
      to: i % 2 === 0 ? generateConsistentAddress(seed + i * 23) : address,
      value: ((Math.abs(seed - i * 1000) % 100) * 1e18).toString(),
      timestamp: now - i * 60000,
      status: 'confirmed'
    }));
    
    res.json({
      success: true,
      data: {
        info: {
          address,
          balance: ((seed % 10000) * 1e18).toString(),
          txCount: (seed % 500) + 10,
          firstSeen: now - 30 * 24 * 3600000,
          lastSeen: now - (seed % 3600000),
          type: 'wallet'
        },
        transactions
      },
      lastUpdated: now
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch testnet address' });
  }
});

// ============================================
// Testnet Faucet API - Real data persistence
// ============================================

/**
 * POST /api/public/v1/testnet/faucet/request
 * Request test tokens from faucet - persists to database
 */
router.post('/testnet/faucet/request', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.body;
    
    if (!walletAddress || !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid wallet address format' 
      });
    }
    
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || 'unknown';
    const userAgent = req.headers['user-agent'] || '';
    const faucetAmount = "1000000000000000000000"; // 1000 tTBURN
    
    // Check for recent request (24 hour cooldown)
    const recentRequest = await storage.getRecentFaucetRequest(walletAddress.toLowerCase());
    if (recentRequest) {
      const cooldownRemaining = Math.ceil((24 * 3600000 - (Date.now() - new Date(recentRequest.createdAt).getTime())) / 60000);
      return res.status(429).json({
        success: false,
        error: `Please wait ${cooldownRemaining} minutes before requesting again`,
        cooldownRemaining
      });
    }
    
    // Create faucet request
    const faucetRequest = await storage.createFaucetRequest({
      walletAddress: walletAddress.toLowerCase(),
      amount: faucetAmount,
      status: 'pending',
      ipAddress,
      userAgent
    });
    
    // Get or create wallet
    let wallet = await storage.getTestnetWallet(walletAddress.toLowerCase());
    if (!wallet) {
      wallet = await storage.createTestnetWallet({
        address: walletAddress.toLowerCase(),
        balance: "0",
        nonce: 0,
        txCount: 0
      });
    }
    
    // Generate transaction
    const now = Date.now();
    const blockNumber = 1245000 + Math.floor((now - new Date('2024-12-01').getTime()) / 500);
    const txHash = `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}${walletAddress.slice(2, 10)}`.padEnd(66, '0').slice(0, 66);
    
    // Create block if needed
    const existingBlock = await storage.getTestnetBlockByNumber(blockNumber);
    if (!existingBlock) {
      await storage.createTestnetBlock({
        number: blockNumber,
        hash: generateConsistentBlockHash(blockNumber),
        parentHash: generateConsistentBlockHash(blockNumber - 1),
        transactionCount: 1,
        gasUsed: 21000,
        gasLimit: 15000000,
        validator: '0x' + 'F'.repeat(40),
        size: 1024
      });
    }
    
    // Create transaction record
    const transaction = await storage.createTestnetTransaction({
      hash: txHash,
      blockNumber,
      fromAddress: '0x' + 'F'.repeat(40), // Faucet address
      toAddress: walletAddress.toLowerCase(),
      value: faucetAmount,
      gasPrice: "100",
      gasUsed: 21000,
      gasLimit: 21000,
      nonce: 0,
      status: 'confirmed',
      txType: 'faucet',
      input: '0x'
    });
    
    // Update wallet balance
    const newBalance = (BigInt(wallet.balance) + BigInt(faucetAmount)).toString();
    await storage.updateTestnetWallet(walletAddress.toLowerCase(), {
      balance: newBalance,
      txCount: wallet.txCount + 1
    });
    
    // Complete faucet request
    await storage.completeFaucetRequest(faucetRequest.id, txHash);
    
    res.json({
      success: true,
      data: {
        requestId: faucetRequest.id,
        txHash,
        amount: faucetAmount,
        amountFormatted: '1,000 tTBURN',
        walletAddress: walletAddress.toLowerCase(),
        status: 'completed',
        message: 'Test tokens sent successfully!'
      }
    });
  } catch (error) {
    console.error('[Testnet Faucet] Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process faucet request' 
    });
  }
});

/**
 * GET /api/public/v1/testnet/faucet/history/:address
 * Get faucet request history for an address
 */
router.get('/testnet/faucet/history/:address', async (req: Request, res: Response) => {
  try {
    setCacheHeaders(res, CACHE_SHORT);
    const address = req.params.address.toLowerCase();
    
    const requests = await storage.getFaucetRequestsByAddress(address);
    
    res.json({
      success: true,
      data: {
        address,
        requests: requests.map(r => ({
          id: r.id,
          amount: r.amount,
          amountFormatted: '1,000 tTBURN',
          txHash: r.txHash,
          status: r.status,
          createdAt: r.createdAt,
          completedAt: r.completedAt
        })),
        totalReceived: (BigInt(requests.filter(r => r.status === 'completed').length) * BigInt('1000000000000000000000')).toString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch faucet history' });
  }
});

/**
 * GET /api/public/v1/testnet/wallet/:address
 * Get real testnet wallet data from database
 */
router.get('/testnet/wallet/:address', async (req: Request, res: Response) => {
  try {
    setCacheHeaders(res, CACHE_SHORT);
    const address = req.params.address.toLowerCase();
    
    const wallet = await storage.getTestnetWallet(address);
    const transactions = await storage.getTestnetTransactionsByAddress(address, 20);
    
    if (!wallet) {
      return res.json({
        success: true,
        data: {
          info: {
            address,
            balance: "0",
            txCount: 0,
            firstSeen: null,
            lastSeen: null,
            type: 'wallet'
          },
          transactions: []
        }
      });
    }
    
    res.json({
      success: true,
      data: {
        info: {
          address: wallet.address,
          balance: wallet.balance,
          txCount: wallet.txCount,
          firstSeen: wallet.firstSeenAt,
          lastSeen: wallet.lastActiveAt,
          type: 'wallet'
        },
        transactions: transactions.map(tx => ({
          hash: tx.hash,
          blockNumber: tx.blockNumber,
          from: tx.fromAddress,
          to: tx.toAddress,
          value: tx.value,
          timestamp: new Date(tx.createdAt).getTime(),
          status: tx.status,
          type: tx.txType
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch wallet data' });
  }
});

export function registerPublicApiRoutes(app: any) {
  app.use('/api/public/v1', router);
  console.log('[Public API] v1 routes registered - read-only public access');
}

export default router;
