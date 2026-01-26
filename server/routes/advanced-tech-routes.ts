/**
 * Advanced Technology Routes - 5대 신기술 API 라우트
 * 
 * 모듈러 DA, 리스테이킹, ZK 롤업, 어카운트 추상화, 인텐트 아키텍처
 * 
 * Security: Zod 검증, 크기 제한, 인증 미들웨어 적용
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { shardDACoordinator, DAProvider } from '../services/modular-da/ShardDACoordinator';
import { restakingManager } from '../services/restaking/RestakingManager';
import { zkRollupManager } from '../services/zk-rollup/ZKRollupManager';
import { tbc4337Manager } from '../services/account-abstraction/TBC4337Manager';
import { intentNetworkManager, IntentType } from '../services/intent-network/IntentNetworkManager';
import { validateCsrf } from '../middleware/csrf';
import { featureFlags, getActiveFeatures, logFeatureStatus, isFeatureEnabled } from '../services/integrations/feature-flags';
import { shardDAAdapter } from '../services/integrations/shard-da-adapter';
import { enhancedStakingAdapter } from '../services/integrations/enhanced-staking-adapter';
import { zkBridgeAdapter } from '../services/integrations/zk-bridge-adapter';
import { smartWalletAdapter } from '../services/integrations/smart-wallet-adapter';
import { intentDexAdapter } from '../services/integrations/intent-dex-adapter';

const router = Router();

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  if (req.session?.userId || req.session?.isAdmin) {
    return next();
  }
  return res.status(401).json({
    error: 'Unauthorized',
    message: 'Authentication required for this operation',
    code: 'AUTH_REQUIRED',
  });
}

const MAX_BLOB_SIZE = 128 * 1024;
const MAX_INTENT_DESC_LENGTH = 1000;
const MAX_CALLDATA_SIZE = 64 * 1024;

const blobSubmitSchema = z.object({
  shardId: z.number().int().min(0).max(63),
  data: z.string().max(MAX_BLOB_SIZE * 1.4),
});

const stakeSchema = z.object({
  walletAddress: z.string().regex(/^tb1[a-z0-9]{38,42}$/, 'Invalid TBURN address'),
  amount: z.string().regex(/^\d+(\.\d+)?$/, 'Invalid amount format'),
  avsId: z.string().max(64).optional(),
});

const l2SubmitSchema = z.object({
  from: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid address'),
  to: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid address'),
  value: z.string().regex(/^\d+$/, 'Invalid value'),
  data: z.string().max(MAX_CALLDATA_SIZE).optional(),
  nonce: z.number().int().min(0).optional(),
});

const bridgeDepositSchema = z.object({
  l1Address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid L1 address'),
  l2Address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid L2 address'),
  amount: z.string().regex(/^\d+$/, 'Invalid amount'),
  tokenAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
});

const bridgeWithdrawSchema = z.object({
  l2Address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid L2 address'),
  l1Address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid L1 address'),
  amount: z.string().regex(/^\d+$/, 'Invalid amount'),
  tokenAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
});

const walletCreateSchema = z.object({
  owner: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid owner address'),
  salt: z.number().int().min(0).optional(),
  modules: z.array(z.string()).max(10).optional(),
});

const userOpSubmitSchema = z.object({
  sender: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid sender'),
  nonce: z.number().int().min(0),
  callData: z.string().max(MAX_CALLDATA_SIZE),
  callGasLimit: z.number().int().min(21000).max(30000000),
  verificationGasLimit: z.number().int().min(21000).max(10000000),
  preVerificationGas: z.number().int().min(0).max(1000000),
  maxFeePerGas: z.string().regex(/^\d+$/, 'Invalid gas fee'),
  maxPriorityFeePerGas: z.string().regex(/^\d+$/, 'Invalid priority fee'),
  paymasterAndData: z.string().max(MAX_CALLDATA_SIZE).optional(),
  signature: z.string().max(1024).optional(),
});

const intentNaturalSchema = z.object({
  description: z.string().min(1).max(MAX_INTENT_DESC_LENGTH),
  userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid user address'),
});

const intentSubmitSchema = z.object({
  type: z.enum(['SWAP', 'BRIDGE', 'STAKE', 'LEND', 'LIMIT_ORDER', 'RECURRING']),
  userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid user address'),
  params: z.object({
    tokenIn: z.string().optional(),
    tokenOut: z.string().optional(),
    amountIn: z.string().optional(),
    minAmountOut: z.string().optional(),
    deadline: z.number().optional(),
    slippageTolerance: z.number().min(0).max(50).optional(),
  }),
  constraints: z.object({
    maxGasPrice: z.string().optional(),
    deadline: z.number().optional(),
    preferredDEXs: z.array(z.string()).max(10).optional(),
  }).optional(),
});

const optimalPathSchema = z.object({
  tokenIn: z.string(),
  tokenOut: z.string(),
  amountIn: z.string().regex(/^\d+$/, 'Invalid amount'),
  options: z.object({
    maxHops: z.number().int().min(1).max(5).optional(),
    includeGasEstimate: z.boolean().optional(),
  }).optional(),
});

function validateBody<T>(schema: z.ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: result.error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      });
    }
    req.body = result.data;
    next();
  };
}

function parseDecimalToBigInt(value: string, decimals: number): bigint {
  const parts = value.split('.');
  const wholePart = parts[0] || '0';
  let fractionalPart = parts[1] || '';
  
  if (fractionalPart.length > decimals) {
    fractionalPart = fractionalPart.substring(0, decimals);
  } else {
    fractionalPart = fractionalPart.padEnd(decimals, '0');
  }
  
  return BigInt(wholePart + fractionalPart);
}

// ============================================================================
// 모듈러 DA 라우트
// ============================================================================

/**
 * GET /api/da/stats
 * DA 통계 조회
 */
router.get('/da/stats', async (req: Request, res: Response) => {
  try {
    const stats = shardDACoordinator.getStats();
    res.json({
      success: true,
      data: {
        totalBlobsSubmitted: stats.totalBlobsSubmitted,
        totalBlobsVerified: stats.totalBlobsVerified,
        totalDataBytes: stats.totalDataBytes.toString(),
        averageLatency: stats.averageLatency,
        failureCount: stats.failureCount,
        lastCommitmentHeight: stats.lastCommitmentHeight,
        providers: Array.from(stats.providerStats.entries()).map(([key, value]) => ({
          provider: key,
          ...value,
        })),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/da/providers
 * DA 제공자 목록
 */
router.get('/da/providers', async (req: Request, res: Response) => {
  try {
    const providers = Object.values(DAProvider);
    const statuses = await Promise.all(
      providers.map(async (p) => {
        const status = await shardDACoordinator.getProviderStatus(p);
        return { provider: p, ...status };
      })
    );
    res.json({ success: true, data: statuses.filter(s => s) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/da/blob/submit
 * 블롭 제출 (Zod 검증 적용)
 */
router.post('/da/blob/submit', requireAuth, validateCsrf, validateBody(blobSubmitSchema), async (req: Request, res: Response) => {
  try {
    const { shardId, data } = req.body;
    const decodedData = Buffer.from(data, 'base64');
    if (decodedData.length > MAX_BLOB_SIZE) {
      return res.status(400).json({ success: false, error: `Blob size exceeds maximum of ${MAX_BLOB_SIZE} bytes` });
    }
    const proof = await shardDACoordinator.submitBlob(shardId, decodedData);
    res.json({
      success: true,
      data: {
        blobId: proof.blobId,
        commitment: proof.commitment.toString('hex'),
        height: proof.height,
        shares: proof.shares,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/da/shard/:shardId
 * 샤드 DA 상태 조회
 */
router.get('/da/shard/:shardId', async (req: Request, res: Response) => {
  try {
    const shardId = parseInt(req.params.shardId);
    const status = shardDACoordinator.getShardDAStatus(shardId);
    if (!status) {
      return res.status(404).json({ success: false, error: 'Shard not found' });
    }
    res.json({
      success: true,
      data: {
        shardId: status.shardId,
        provider: status.provider,
        namespace: status.namespace.toString('hex'),
        queueLength: status.blobQueue.length,
        sequenceCounter: status.sequenceCounter.toString(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// 리스테이킹 라우트
// ============================================================================

/**
 * GET /api/restaking/stats
 * 리스테이킹 통계 조회
 */
router.get('/restaking/stats', async (req: Request, res: Response) => {
  try {
    const stats = restakingManager.getStats();
    const rsTBURNInfo = restakingManager.getRsTBURNInfo();
    res.json({
      success: true,
      data: {
        totalRestaked: stats.totalRestaked.toString(),
        totalRsTBURN: stats.totalRsTBURN.toString(),
        activePositions: stats.activePositions,
        operatorCount: stats.operatorCount,
        avsCount: stats.avsCount,
        totalRewardsDistributed: stats.totalRewardsDistributed.toString(),
        averageAPY: stats.averageAPY,
        totalSlashed: stats.totalSlashed.toString(),
        rsTBURN: {
          totalSupply: rsTBURNInfo.totalSupply.toString(),
          totalUnderlying: rsTBURNInfo.totalUnderlying.toString(),
          exchangeRate: rsTBURNInfo.exchangeRate.toString(),
          apy: rsTBURNInfo.apy,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/restaking/avs
 * AVS 목록 조회
 */
router.get('/restaking/avs', async (req: Request, res: Response) => {
  try {
    const avsList = restakingManager.getAVSList().map(avs => ({
      ...avs,
      totalStake: avs.totalStake.toString(),
      minStake: avs.minStake.toString(),
      maxStakePerOperator: avs.maxStakePerOperator.toString(),
    }));
    res.json({ success: true, data: avsList });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/restaking/avs/:avsId
 * AVS 상세 조회
 */
router.get('/restaking/avs/:avsId', async (req: Request, res: Response) => {
  try {
    const avs = restakingManager.getAVS(req.params.avsId);
    if (!avs) {
      return res.status(404).json({ success: false, error: 'AVS not found' });
    }
    res.json({
      success: true,
      data: {
        ...avs,
        totalStake: avs.totalStake.toString(),
        minStake: avs.minStake.toString(),
        maxStakePerOperator: avs.maxStakePerOperator.toString(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/restaking/operators
 * 운영자 목록 조회
 */
router.get('/restaking/operators', async (req: Request, res: Response) => {
  try {
    const operators = restakingManager.getOperators().map(op => ({
      ...op,
      totalDelegation: op.totalDelegation.toString(),
    }));
    res.json({ success: true, data: operators });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/restaking/stake
 * 리스테이킹 (Zod 검증 적용)
 */
router.post('/restaking/stake', requireAuth, validateCsrf, validateBody(stakeSchema), async (req: Request, res: Response) => {
  try {
    const { walletAddress, amount, avsId } = req.body;
    const parsedAmount = parseDecimalToBigInt(amount, 18);
    const avsAllocations = avsId ? new Map([[avsId, parsedAmount]]) : undefined;
    const position = await restakingManager.restake(
      walletAddress,
      parsedAmount,
      avsAllocations
    );
    res.json({
      success: true,
      data: {
        positionId: position.positionId,
        amount: position.amount.toString(),
        rsTBURNBalance: position.rsTBURNBalance.toString(),
        state: position.state,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/restaking/position/:positionId
 * 포지션 조회
 */
router.get('/restaking/position/:positionId', async (req: Request, res: Response) => {
  try {
    const position = restakingManager.getPosition(req.params.positionId);
    if (!position) {
      return res.status(404).json({ success: false, error: 'Position not found' });
    }
    res.json({
      success: true,
      data: {
        ...position,
        amount: position.amount.toString(),
        rsTBURNBalance: position.rsTBURNBalance.toString(),
        rewards: position.rewards.toString(),
        avsAllocations: Object.fromEntries(
          Array.from(position.avsAllocations.entries()).map(([k, v]) => [k, v.toString()])
        ),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// ZK 롤업 라우트
// ============================================================================

/**
 * GET /api/zk/stats
 * ZK 롤업 통계 조회
 */
router.get('/zk/stats', async (req: Request, res: Response) => {
  try {
    const stats = zkRollupManager.getStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/zk/state
 * L2 상태 조회
 */
router.get('/zk/state', async (req: Request, res: Response) => {
  try {
    const state = zkRollupManager.getL2State();
    res.json({
      success: true,
      data: {
        batchNumber: state.batchNumber,
        stateRoot: state.stateRoot.toString('hex'),
        transactionCount: state.transactionCount,
        lastBlockTimestamp: state.lastBlockTimestamp,
        pendingWithdrawals: state.pendingWithdrawals,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/zk/l2/submit
 * L2 트랜잭션 제출 (Zod 검증 적용)
 */
router.post('/zk/l2/submit', requireAuth, validateCsrf, validateBody(l2SubmitSchema), async (req: Request, res: Response) => {
  try {
    const txHash = await zkRollupManager.submitL2Transaction(req.body);
    res.json({ success: true, data: { txHash } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/zk/bridge/deposit
 * L1 → L2 브릿지 (Zod 검증 적용)
 */
router.post('/zk/bridge/deposit', requireAuth, validateCsrf, validateBody(bridgeDepositSchema), async (req: Request, res: Response) => {
  try {
    const { l1Address, l2Address, amount, tokenAddress } = req.body;
    const l1TxHash = `0x${randomBytes(32).toString('hex')}`;
    await zkRollupManager.bridgeToL2(l1TxHash, l2Address, BigInt(amount), tokenAddress);
    res.json({ success: true, message: 'Bridged to L2', l1TxHash });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/zk/bridge/withdraw
 * L2 → L1 출금 (Zod 검증 적용)
 */
router.post('/zk/bridge/withdraw', requireAuth, validateCsrf, validateBody(bridgeWithdrawSchema), async (req: Request, res: Response) => {
  try {
    const { l2Address, l1Address, amount, tokenAddress } = req.body;
    const txHash = await zkRollupManager.withdrawToL1(l2Address, l1Address, BigInt(amount), tokenAddress);
    res.json({ success: true, data: { txHash } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/zk/balance/:address
 * L2 잔액 조회
 */
router.get('/zk/balance/:address', async (req: Request, res: Response) => {
  try {
    const balance = zkRollupManager.getBalance(req.params.address);
    res.json({
      success: true,
      data: {
        address: req.params.address,
        balance: balance.toString(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/zk/proof/:batchNumber
 * 증명 조회
 */
router.get('/zk/proof/:batchNumber', async (req: Request, res: Response) => {
  try {
    const proof = zkRollupManager.getProof(parseInt(req.params.batchNumber));
    if (!proof) {
      return res.status(404).json({ success: false, error: 'Proof not found' });
    }
    res.json({
      success: true,
      data: {
        batchNumber: proof.batchNumber,
        oldStateRoot: proof.oldStateRoot.toString('hex'),
        newStateRoot: proof.newStateRoot.toString('hex'),
        txBatchHash: proof.txBatchHash.toString('hex'),
        timestamp: proof.timestamp,
        verifiedOnL1: proof.verifiedOnL1,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// 어카운트 추상화 라우트
// ============================================================================

/**
 * GET /api/aa/stats
 * AA 통계 조회
 */
router.get('/aa/stats', async (req: Request, res: Response) => {
  try {
    const stats = tbc4337Manager.getStats();
    res.json({
      success: true,
      data: {
        totalWallets: stats.totalWallets,
        totalUserOps: stats.totalUserOps,
        totalPaymasterSponsored: stats.totalPaymasterSponsored.toString(),
        activeSessionKeys: stats.activeSessionKeys,
        pendingRecoveries: stats.pendingRecoveries,
        bundlerQueueSize: stats.bundlerQueueSize,
        averageGasCost: stats.averageGasCost.toString(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/aa/wallet/create
 * 스마트 월렛 생성 (Zod 검증 적용)
 */
router.post('/aa/wallet/create', requireAuth, validateCsrf, validateBody(walletCreateSchema), async (req: Request, res: Response) => {
  try {
    const address = await tbc4337Manager.createSmartWallet(req.body);
    res.json({ success: true, data: { address } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/aa/wallet/:address
 * 지갑 정보 조회
 */
router.get('/aa/wallet/:address', async (req: Request, res: Response) => {
  try {
    const info = tbc4337Manager.getWalletInfo(req.params.address);
    if (!info) {
      return res.status(404).json({ success: false, error: 'Wallet not found' });
    }
    res.json({
      success: true,
      data: {
        ...info,
        balance: info.balance.toString(),
        nonce: info.nonce.toString(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/aa/userop/submit
 * UserOperation 제출 (Zod 검증 적용)
 */
router.post('/aa/userop/submit', requireAuth, validateCsrf, validateBody(userOpSubmitSchema), async (req: Request, res: Response) => {
  try {
    const userOp = {
      sender: req.body.sender,
      nonce: BigInt(req.body.nonce),
      callGasLimit: BigInt(req.body.callGasLimit),
      verificationGasLimit: BigInt(req.body.verificationGasLimit),
      preVerificationGas: BigInt(req.body.preVerificationGas),
      maxFeePerGas: BigInt(req.body.maxFeePerGas),
      maxPriorityFeePerGas: BigInt(req.body.maxPriorityFeePerGas),
      initCode: Buffer.alloc(0),
      callData: Buffer.from(req.body.callData, 'hex'),
      paymasterAndData: Buffer.from(req.body.paymasterAndData || '', 'hex'),
      signature: Buffer.from(req.body.signature || '', 'hex'),
    };
    const hash = await tbc4337Manager.submitUserOp(userOp);
    res.json({ success: true, data: { userOpHash: hash } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/aa/paymasters
 * Paymaster 목록 조회
 */
router.get('/aa/paymasters', async (req: Request, res: Response) => {
  try {
    const paymasters = tbc4337Manager.getPaymasters().map(p => ({
      ...p,
      balance: p.balance.toString(),
      totalSponsored: p.totalSponsored.toString(),
    }));
    res.json({ success: true, data: paymasters });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// 인텐트 아키텍처 라우트
// ============================================================================

/**
 * GET /api/intent/stats
 * 인텐트 네트워크 통계
 */
router.get('/intent/stats', async (req: Request, res: Response) => {
  try {
    const stats = intentNetworkManager.getStats();
    res.json({
      success: true,
      data: {
        totalIntents: stats.totalIntents,
        pendingIntents: stats.pendingIntents,
        filledIntents: stats.filledIntents,
        totalVolume: stats.totalVolume.toString(),
        activeSolvers: stats.activeSolvers,
        averageFillTime: stats.averageFillTime,
        mevProtectedPercentage: stats.mevProtectedPercentage,
        totalMEVSaved: stats.totalMEVSaved.toString(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/intent/solvers
 * 솔버 목록 조회
 */
router.get('/intent/solvers', async (req: Request, res: Response) => {
  try {
    const solvers = intentNetworkManager.getSolvers().map(s => ({
      ...s,
      stake: s.stake.toString(),
      totalVolume: s.totalVolume.toString(),
    }));
    res.json({ success: true, data: solvers });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/intent/submit/natural
 * 자연어 인텐트 제출 (Zod 검증 적용)
 */
router.post('/intent/submit/natural', requireAuth, validateCsrf, validateBody(intentNaturalSchema), async (req: Request, res: Response) => {
  try {
    const { userAddress, description } = req.body;
    const intentId = await intentNetworkManager.submitNaturalLanguageIntent(userAddress, description);
    res.json({ success: true, data: { intentId } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/intent/submit
 * 구조화된 인텐트 제출 (Zod 검증 적용)
 */
router.post('/intent/submit', requireAuth, validateCsrf, validateBody(intentSubmitSchema), async (req: Request, res: Response) => {
  try {
    const { userAddress, type, params, constraints } = req.body;
    const intentId = await intentNetworkManager.submitStructuredIntent(
      userAddress,
      type as IntentType,
      params.tokenIn || 'TBURN',
      BigInt(params.amountIn || '0'),
      params.tokenOut || 'ETH',
      BigInt(params.minAmountOut || '0'),
      constraints,
      constraints?.deadline
    );
    res.json({ success: true, data: { intentId } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/intent/:intentId
 * 인텐트 조회
 */
router.get('/intent/:intentId', async (req: Request, res: Response) => {
  try {
    const intent = intentNetworkManager.getIntent(req.params.intentId);
    if (!intent) {
      return res.status(404).json({ success: false, error: 'Intent not found' });
    }
    res.json({
      success: true,
      data: {
        ...intent,
        inputAmount: intent.inputAmount.toString(),
        minOutputAmount: intent.minOutputAmount.toString(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/intent/:intentId/bids
 * 인텐트에 대한 입찰 조회
 */
router.get('/intent/:intentId/bids', async (req: Request, res: Response) => {
  try {
    const bids = intentNetworkManager.getBidsForIntent(req.params.intentId).map(b => ({
      ...b,
      outputAmount: b.outputAmount.toString(),
      signature: b.signature.toString('hex'),
    }));
    res.json({ success: true, data: bids });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/intent/:intentId/execute
 * 인텐트 실행
 */
router.post('/intent/:intentId/execute', requireAuth, validateCsrf, async (req: Request, res: Response) => {
  try {
    const result = await intentNetworkManager.executeIntent(req.params.intentId);
    res.json({
      success: true,
      data: {
        ...result,
        expectedOutput: result.expectedOutput.toString(),
        actualOutput: result.actualOutput.toString(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/intent/:intentId/mev-status
 * MEV 보호 상태 조회
 */
router.get('/intent/:intentId/mev-status', async (req: Request, res: Response) => {
  try {
    const status = intentNetworkManager.getMEVProtectionStatus(req.params.intentId);
    if (!status) {
      return res.status(404).json({ success: false, error: 'MEV status not found' });
    }
    res.json({
      success: true,
      data: {
        ...status,
        savedAmount: status.savedAmount.toString(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/intent/path/optimal
 * 최적 경로 탐색 (Zod 검증 적용)
 */
router.post('/intent/path/optimal', requireAuth, validateCsrf, validateBody(optimalPathSchema), async (req: Request, res: Response) => {
  try {
    const { tokenIn, tokenOut, amountIn } = req.body;
    const path = await intentNetworkManager.findOptimalPath(
      tokenIn,
      tokenOut,
      BigInt(amountIn)
    );
    res.json({
      success: true,
      data: path.map(step => ({
        ...step,
        expectedOutput: step.expectedOutput.toString(),
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// 통합 대시보드 라우트
// ============================================================================

/**
 * GET /api/advanced-tech/overview
 * 5대 신기술 통합 개요
 */
router.get('/advanced-tech/overview', async (req: Request, res: Response) => {
  try {
    const daStats = shardDACoordinator.getStats();
    const restakingStats = restakingManager.getStats();
    const zkStats = zkRollupManager.getStats();
    const aaStats = tbc4337Manager.getStats();
    const intentStats = intentNetworkManager.getStats();

    res.json({
      success: true,
      data: {
        modularDA: {
          totalBlobs: daStats.totalBlobsSubmitted,
          totalDataBytes: daStats.totalDataBytes.toString(),
          averageLatency: daStats.averageLatency,
        },
        restaking: {
          totalRestaked: restakingStats.totalRestaked.toString(),
          activePositions: restakingStats.activePositions,
          avsCount: restakingStats.avsCount,
          averageAPY: restakingStats.averageAPY,
        },
        zkRollup: {
          currentBatch: zkStats.currentBatch,
          totalTransactions: zkStats.totalTransactions,
          l2TPS: zkStats.l2TPS,
          gasSavingsPercent: zkStats.gasSavingsPercent,
        },
        accountAbstraction: {
          totalWallets: aaStats.totalWallets,
          totalUserOps: aaStats.totalUserOps,
          totalPaymasterSponsored: aaStats.totalPaymasterSponsored.toString(),
        },
        intentNetwork: {
          totalIntents: intentStats.totalIntents,
          filledIntents: intentStats.filledIntents,
          activeSolvers: intentStats.activeSolvers,
          totalMEVSaved: intentStats.totalMEVSaved.toString(),
        },
        performanceMetrics: {
          expectedTPSGain: '1900%',
          expectedCostReduction: '95%',
          targetTVL: '$2B+',
          uxLevel: 'Web2',
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/advanced-tech/feature-flags
 * 5대 신기술 Feature Flag 상태 조회
 */
router.get('/advanced-tech/feature-flags', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      featureFlags,
      activeFeatures: getActiveFeatures(),
    },
  });
});

/**
 * GET /api/advanced-tech/adapters
 * 5대 신기술 어댑터 상태 조회
 */
router.get('/advanced-tech/adapters', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      shardDA: shardDAAdapter.getStatus(),
      enhancedStaking: enhancedStakingAdapter.getStatus(),
      zkBridge: zkBridgeAdapter.getStatus(),
      smartWallet: smartWalletAdapter.getStatus(),
      intentDex: intentDexAdapter.getStatus(),
    },
  });
});

/**
 * 어댑터 초기화 함수
 */
export async function initializeAdvancedTechAdapters(): Promise<void> {
  console.log('[AdvancedTech] 5대 신기술 통합 어댑터 초기화 시작...');
  logFeatureStatus();

  await Promise.all([
    shardDAAdapter.start(),
    enhancedStakingAdapter.start(),
    zkBridgeAdapter.start(),
    smartWalletAdapter.start(),
    intentDexAdapter.start(),
  ]);

  console.log('[AdvancedTech] ✅ 모든 어댑터 초기화 완료');
}

export default router;
