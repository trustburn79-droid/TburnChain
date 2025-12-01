/**
 * TBURN Enterprise API Routes
 * Unified endpoints for cross-module data access and orchestration
 */

import { Router, Request, Response } from 'express';
import { dataHub } from '../services/DataHub';
import { eventBus } from '../services/EventBus';
import { 
  stakingOrchestrator,
  dexOrchestrator,
  bridgeOrchestrator,
  autoBurnOrchestrator,
  nftOrchestrator
} from '../services/orchestration';

const router = Router();

// ============================================
// Network Snapshot Endpoints
// ============================================

/**
 * GET /api/enterprise/snapshot
 * Get unified network snapshot with all module data
 */
router.get('/snapshot', async (req: Request, res: Response) => {
  try {
    const snapshot = await dataHub.getNetworkSnapshot();
    const moduleMetrics = dataHub.getModuleMetrics();

    res.json({
      success: true,
      data: {
        network: snapshot,
        modules: moduleMetrics,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch network snapshot',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/enterprise/accounts/:address
 * Get composite account state across all modules
 */
router.get('/accounts/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const accountState = await dataHub.getAccountCompositeState(address);

    res.json({
      success: true,
      data: accountState
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch account state',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/enterprise/validators/:address
 * Get composite validator state with all related data
 */
router.get('/validators/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const validatorState = await dataHub.getValidatorCompositeState(address);

    if (!validatorState) {
      return res.status(404).json({
        success: false,
        error: 'Validator not found'
      });
    }

    res.json({
      success: true,
      data: validatorState
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch validator state',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/enterprise/metrics
 * Get all module metrics at once
 */
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = dataHub.getModuleMetrics();
    const stakingMetrics = stakingOrchestrator.getMetrics();
    const dexMetrics = dexOrchestrator.getMetrics();
    const bridgeMetrics = bridgeOrchestrator.getMetrics();
    const burnMetrics = autoBurnOrchestrator.getMetrics();
    const nftMetrics = nftOrchestrator.getMetrics();

    res.json({
      success: true,
      data: {
        aggregated: metrics,
        staking: stakingMetrics,
        dex: dexMetrics,
        bridge: bridgeMetrics,
        burn: burnMetrics,
        nft: nftMetrics,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch metrics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================
// Staking Orchestration Endpoints
// ============================================

/**
 * POST /api/enterprise/staking/stake
 * Execute stake operation with cross-module updates
 */
router.post('/staking/stake', async (req: Request, res: Response) => {
  try {
    const { userAddress, validatorAddress, amount, poolId } = req.body;

    if (!userAddress || !validatorAddress || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userAddress, validatorAddress, amount'
      });
    }

    const result = await stakingOrchestrator.stake({
      userAddress,
      validatorAddress,
      amount,
      poolId
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Stake operation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/enterprise/staking/unstake
 * Execute unstake operation with cross-module updates
 */
router.post('/staking/unstake', async (req: Request, res: Response) => {
  try {
    const { userAddress, validatorAddress, amount, poolId } = req.body;

    if (!userAddress || !validatorAddress || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userAddress, validatorAddress, amount'
      });
    }

    const result = await stakingOrchestrator.unstake({
      userAddress,
      validatorAddress,
      amount,
      poolId
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Unstake operation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/enterprise/staking/claim-rewards
 * Claim staking rewards with cross-module updates
 */
router.post('/staking/claim-rewards', async (req: Request, res: Response) => {
  try {
    const { userAddress, validatorAddress, poolId } = req.body;

    if (!userAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: userAddress'
      });
    }

    const result = await stakingOrchestrator.claimRewards({
      userAddress,
      validatorAddress,
      poolId
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Claim rewards failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================
// DEX Orchestration Endpoints
// ============================================

/**
 * POST /api/enterprise/dex/swap
 * Execute swap with cross-module updates
 */
router.post('/dex/swap', async (req: Request, res: Response) => {
  try {
    const { userAddress, poolId, tokenIn, tokenOut, amountIn, minAmountOut, slippageTolerance } = req.body;

    if (!userAddress || !poolId || !tokenIn || !tokenOut || !amountIn) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const result = await dexOrchestrator.swap({
      userAddress,
      poolId,
      tokenIn,
      tokenOut,
      amountIn,
      minAmountOut: minAmountOut || '0',
      slippageTolerance
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Swap operation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/enterprise/dex/add-liquidity
 * Add liquidity with cross-module updates
 */
router.post('/dex/add-liquidity', async (req: Request, res: Response) => {
  try {
    const { userAddress, poolId, token0Amount, token1Amount, minLpTokens } = req.body;

    if (!userAddress || !poolId || !token0Amount || !token1Amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const result = await dexOrchestrator.addLiquidity({
      userAddress,
      poolId,
      token0Amount,
      token1Amount,
      minLpTokens
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Add liquidity failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/enterprise/dex/remove-liquidity
 * Remove liquidity with cross-module updates
 */
router.post('/dex/remove-liquidity', async (req: Request, res: Response) => {
  try {
    const { userAddress, poolId, lpTokenAmount, minToken0, minToken1 } = req.body;

    if (!userAddress || !poolId || !lpTokenAmount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const result = await dexOrchestrator.removeLiquidity({
      userAddress,
      poolId,
      lpTokenAmount,
      minToken0,
      minToken1
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Remove liquidity failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================
// Bridge Orchestration Endpoints
// ============================================

/**
 * POST /api/enterprise/bridge/transfer
 * Initiate bridge transfer with cross-module updates
 */
router.post('/bridge/transfer', async (req: Request, res: Response) => {
  try {
    const { userAddress, amount, sourceChain, targetChain, tokenAddress, recipientAddress } = req.body;

    if (!userAddress || !amount || !sourceChain || !targetChain || !tokenAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const result = await bridgeOrchestrator.initiateTransfer({
      userAddress,
      amount,
      sourceChain,
      targetChain,
      tokenAddress,
      recipientAddress
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Bridge transfer failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/enterprise/bridge/claim
 * Claim completed bridge transfer
 */
router.post('/bridge/claim', async (req: Request, res: Response) => {
  try {
    const { userAddress, transferId, proof } = req.body;

    if (!userAddress || !transferId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const result = await bridgeOrchestrator.claimTransfer({
      userAddress,
      transferId,
      proof: proof || []
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Claim transfer failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/enterprise/bridge/chains
 * Get supported bridge chains
 */
router.get('/bridge/chains', async (req: Request, res: Response) => {
  try {
    const chains = bridgeOrchestrator.getSupportedChains();
    res.json({
      success: true,
      data: chains
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get supported chains'
    });
  }
});

// ============================================
// Auto-Burn Endpoints
// ============================================

/**
 * GET /api/enterprise/burn/metrics
 * Get burn metrics
 */
router.get('/burn/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = autoBurnOrchestrator.getMetrics();
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get burn metrics'
    });
  }
});

/**
 * GET /api/enterprise/burn/history
 * Get burn history
 */
router.get('/burn/history', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const history = autoBurnOrchestrator.getBurnHistory(limit);
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get burn history'
    });
  }
});

/**
 * GET /api/enterprise/burn/projected
 * Get projected burn for next period
 */
router.get('/burn/projected', async (req: Request, res: Response) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const projected = autoBurnOrchestrator.getProjectedBurn(hours);
    res.json({
      success: true,
      data: {
        periodHours: hours,
        projectedBurn: projected
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get projected burn'
    });
  }
});

// ============================================
// NFT Marketplace Endpoints
// ============================================

/**
 * POST /api/enterprise/nft/list
 * List NFT for sale
 */
router.post('/nft/list', async (req: Request, res: Response) => {
  try {
    const { sellerAddress, collectionId, tokenId, price, currency, expiresAt } = req.body;

    if (!sellerAddress || !collectionId || !tokenId || !price) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const result = await nftOrchestrator.listNft({
      sellerAddress,
      collectionId,
      tokenId,
      price,
      currency: currency || 'TBURN',
      expiresAt
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'List NFT failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/enterprise/nft/buy
 * Buy NFT
 */
router.post('/nft/buy', async (req: Request, res: Response) => {
  try {
    const { buyerAddress, listingId, price } = req.body;

    if (!buyerAddress || !listingId || !price) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const result = await nftOrchestrator.buyNft({
      buyerAddress,
      listingId,
      price
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Buy NFT failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================
// Event Bus Endpoints
// ============================================

/**
 * GET /api/enterprise/events/history
 * Get event history for a channel
 */
router.get('/events/history/:channel', async (req: Request, res: Response) => {
  try {
    const { channel } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const history = eventBus.getEventHistory(channel as any, limit);
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get event history'
    });
  }
});

/**
 * GET /api/enterprise/events/recent
 * Get all recent events across channels
 */
router.get('/events/recent', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const events = eventBus.getAllRecentEvents(limit);
    
    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get recent events'
    });
  }
});

/**
 * GET /api/enterprise/events/stats
 * Get event channel statistics
 */
router.get('/events/stats', async (req: Request, res: Response) => {
  try {
    const stats = eventBus.getChannelStats();
    const wsClientCount = eventBus.getWebSocketClientCount();
    
    res.json({
      success: true,
      data: {
        channels: stats,
        connectedClients: wsClientCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get event stats'
    });
  }
});

// ============================================
// Health & System Endpoints
// ============================================

/**
 * GET /api/enterprise/health
 * Get enterprise system health status
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const snapshot = await dataHub.getNetworkSnapshot();
    const metrics = dataHub.getModuleMetrics();
    const wsClients = eventBus.getWebSocketClientCount();

    res.json({
      success: true,
      data: {
        status: 'healthy',
        services: {
          dataHub: 'operational',
          eventBus: 'operational',
          orchestrators: {
            staking: 'operational',
            dex: 'operational',
            bridge: 'operational',
            autoBurn: 'operational',
            nft: 'operational'
          }
        },
        network: {
          blockHeight: snapshot.blockHeight,
          tps: snapshot.tps
        },
        connections: {
          websocketClients: wsClients
        },
        timestamp: Date.now()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
