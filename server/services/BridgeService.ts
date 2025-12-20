import { db } from "../db";
import { eq, and, desc, gte, lte, sql, or } from "drizzle-orm";
import {
  bridgeChains,
  bridgeRoutes,
  bridgeTransfers,
  bridgeLiquidityPools,
  bridgeLiquidityProviders,
  bridgeValidators,
  bridgeFeeConfigs,
  bridgeSecurityEvents,
  bridgeAnalytics,
  bridgeActivity,
  type BridgeChain,
  type InsertBridgeChain,
  type BridgeRoute,
  type InsertBridgeRoute,
  type BridgeTransfer,
  type InsertBridgeTransfer,
  type BridgeLiquidityPool,
  type InsertBridgeLiquidityPool,
  type BridgeLiquidityProvider,
  type InsertBridgeLiquidityProvider,
  type BridgeValidator,
  type InsertBridgeValidator,
  type BridgeFeeConfig,
  type InsertBridgeFeeConfig,
  type BridgeSecurityEvent,
  type InsertBridgeSecurityEvent,
  type BridgeAnalytics,
  type InsertBridgeAnalytics,
  type BridgeActivity,
  type InsertBridgeActivity,
  type BridgeOverview,
} from "@shared/schema";

const PRECISION = BigInt("1000000000000000000");

function randomBigIntString(min: bigint, max: bigint): string {
  const range = max - min;
  const random = BigInt(Math.floor(Math.random() * Number(range)));
  return (min + random).toString();
}

function generateAddress(): string {
  return "0x" + Array.from({ length: 40 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
}

function generateTxHash(): string {
  return "0x" + Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
}

export class BridgeService {
  private static instance: BridgeService;
  private initialized = false;

  private constructor() {}

  static getInstance(): BridgeService {
    if (!BridgeService.instance) {
      BridgeService.instance = new BridgeService();
    }
    return BridgeService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const existingChains = await db.select().from(bridgeChains).limit(1);
      if (existingChains.length === 0) {
        await this.generateDemoData();
      }
      this.initialized = true;
      console.log("[Bridge] Service initialized successfully");
    } catch (error) {
      console.error("[Bridge] Initialization error:", error);
      throw error;
    }
  }

  private async generateDemoData(): Promise<void> {
    console.log("[Bridge] Generating demo data...");

    const chainConfigs = [
      { chainId: 7979, name: "TBURN Mainnet", symbol: "TBURN", nativeCurrency: "TBURN", isEvm: true, avgBlockTime: 100, confirmations: 1 },
      { chainId: 1, name: "Ethereum", symbol: "ETH", nativeCurrency: "ETH", isEvm: true, avgBlockTime: 12000, confirmations: 12 },
      { chainId: 56, name: "BNB Chain", symbol: "BNB", nativeCurrency: "BNB", isEvm: true, avgBlockTime: 3000, confirmations: 15 },
      { chainId: 137, name: "Polygon", symbol: "MATIC", nativeCurrency: "MATIC", isEvm: true, avgBlockTime: 2000, confirmations: 256 },
      { chainId: 42161, name: "Arbitrum One", symbol: "ARB", nativeCurrency: "ETH", isEvm: true, avgBlockTime: 250, confirmations: 64 },
      { chainId: 10, name: "Optimism", symbol: "OP", nativeCurrency: "ETH", isEvm: true, avgBlockTime: 2000, confirmations: 64 },
      { chainId: 43114, name: "Avalanche", symbol: "AVAX", nativeCurrency: "AVAX", isEvm: true, avgBlockTime: 2000, confirmations: 6 },
      { chainId: 250, name: "Fantom", symbol: "FTM", nativeCurrency: "FTM", isEvm: true, avgBlockTime: 1000, confirmations: 5 },
    ];

    for (const config of chainConfigs) {
      const chain: InsertBridgeChain = {
        chainId: config.chainId,
        name: config.name,
        symbol: config.symbol,
        nativeCurrency: config.nativeCurrency,
        networkType: "mainnet",
        status: "active",
        isEvm: config.isEvm,
        avgBlockTime: config.avgBlockTime,
        confirmationsRequired: config.confirmations,
        bridgeContractAddress: generateAddress(),
        tokenFactoryAddress: generateAddress(),
        totalLiquidity: randomBigIntString(BigInt("100000") * PRECISION, BigInt("10000000") * PRECISION),
        volume24h: randomBigIntString(BigInt("10000") * PRECISION, BigInt("500000") * PRECISION),
        volumeTotal: randomBigIntString(BigInt("10000000") * PRECISION, BigInt("100000000") * PRECISION),
        txCount24h: Math.floor(Math.random() * 5000) + 500,
        txCountTotal: Math.floor(Math.random() * 500000) + 50000,
        avgTransferTime: Math.floor(Math.random() * 180000) + 30000,
        successRate: 9900 + Math.floor(Math.random() * 100),
        aiRiskScore: Math.floor(Math.random() * 200),
        supportsEip1559: config.chainId !== 56,
      };
      await db.insert(bridgeChains).values(chain);
    }

    const tokens = [
      { symbol: "TBURN", address: "0x0000000000000000000000000000000000000001" },
      { symbol: "USDT", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7" },
      { symbol: "USDC", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" },
      { symbol: "WBTC", address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599" },
      { symbol: "WETH", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" },
    ];

    const routeTypes = ["lock_mint", "burn_mint", "liquidity_pool", "atomic_swap"];
    
    for (let i = 0; i < chainConfigs.length; i++) {
      for (let j = 0; j < chainConfigs.length; j++) {
        if (i === j) continue;
        if (Math.random() < 0.3) continue;
        
        const sourceChain = chainConfigs[i];
        const destChain = chainConfigs[j];
        
        for (const token of tokens.slice(0, Math.floor(Math.random() * 3) + 2)) {
          const route: InsertBridgeRoute = {
            sourceChainId: sourceChain.chainId,
            destinationChainId: destChain.chainId,
            tokenAddress: token.address,
            tokenSymbol: token.symbol,
            tokenDecimals: token.symbol === "USDT" || token.symbol === "USDC" ? 6 : 18,
            wrappedTokenAddress: generateAddress(),
            routeType: routeTypes[Math.floor(Math.random() * routeTypes.length)],
            status: Math.random() > 0.1 ? "active" : "paused",
            minAmount: (BigInt(1) * PRECISION).toString(),
            maxAmount: (BigInt(1000000) * PRECISION).toString(),
            dailyLimit: (BigInt(10000000) * PRECISION).toString(),
            dailyUsed: randomBigIntString(BigInt(0), BigInt(1000000) * PRECISION),
            baseFee: randomBigIntString(BigInt(0), BigInt(10) * PRECISION),
            feePercent: Math.floor(Math.random() * 50) + 10,
            estimatedTime: Math.floor(Math.random() * 300000) + 60000,
            avgTime: Math.floor(Math.random() * 180000) + 30000,
            successRate: 9800 + Math.floor(Math.random() * 200),
            volume24h: randomBigIntString(BigInt(1000) * PRECISION, BigInt(100000) * PRECISION),
            volumeTotal: randomBigIntString(BigInt(1000000) * PRECISION, BigInt(10000000) * PRECISION),
            txCount24h: Math.floor(Math.random() * 1000) + 50,
            txCountTotal: Math.floor(Math.random() * 100000) + 5000,
            liquidityAvailable: randomBigIntString(BigInt(10000) * PRECISION, BigInt(1000000) * PRECISION),
            aiOptimized: Math.random() > 0.2,
            aiPriority: Math.floor(Math.random() * 100),
          };
          await db.insert(bridgeRoutes).values(route);
        }
      }
    }

    for (const chain of chainConfigs) {
      for (const token of tokens) {
        const pool: InsertBridgeLiquidityPool = {
          chainId: chain.chainId,
          tokenAddress: token.address,
          tokenSymbol: token.symbol,
          tokenDecimals: token.symbol === "USDT" || token.symbol === "USDC" ? 6 : 18,
          poolAddress: generateAddress(),
          totalLiquidity: randomBigIntString(BigInt(100000) * PRECISION, BigInt(5000000) * PRECISION),
          availableLiquidity: randomBigIntString(BigInt(50000) * PRECISION, BigInt(4000000) * PRECISION),
          lockedLiquidity: randomBigIntString(BigInt(10000) * PRECISION, BigInt(1000000) * PRECISION),
          utilizationRate: Math.floor(Math.random() * 6000) + 1000,
          minLiquidity: (BigInt(10000) * PRECISION).toString(),
          targetLiquidity: (BigInt(1000000) * PRECISION).toString(),
          lpTokenAddress: generateAddress(),
          lpTokenSupply: randomBigIntString(BigInt(10000) * PRECISION, BigInt(1000000) * PRECISION),
          lpApy: Math.floor(Math.random() * 2000) + 300,
          totalFeesEarned: randomBigIntString(BigInt(1000) * PRECISION, BigInt(100000) * PRECISION),
          fees24h: randomBigIntString(BigInt(10) * PRECISION, BigInt(1000) * PRECISION),
          volume24h: randomBigIntString(BigInt(10000) * PRECISION, BigInt(500000) * PRECISION),
          txCount24h: Math.floor(Math.random() * 500) + 20,
          providerCount: Math.floor(Math.random() * 100) + 5,
          status: Math.random() > 0.1 ? "active" : "rebalancing",
          rebalanceThreshold: 8000,
          aiManagedRebalance: Math.random() > 0.3,
        };
        await db.insert(bridgeLiquidityPools).values(pool);
      }
    }

    const validatorNames = [
      "TBURN Foundation", "Sentinel Labs", "Quantum Guard", "Chain Watchers",
      "Bridge Protocol", "Cross-Chain DAO", "Secure Relayer", "AI Validator Node",
      "Enterprise Bridge", "Multi-Chain Security", "Atomic Relayer", "Guardian Network"
    ];

    for (const name of validatorNames) {
      const validator: InsertBridgeValidator = {
        address: generateAddress(),
        name: name,
        operatorAddress: generateAddress(),
        status: Math.random() > 0.1 ? "active" : "inactive",
        stake: randomBigIntString(BigInt(100000) * PRECISION, BigInt(10000000) * PRECISION),
        minStake: (BigInt(100000) * PRECISION).toString(),
        commission: Math.floor(Math.random() * 1000) + 100,
        uptime: 9500 + Math.floor(Math.random() * 500),
        attestationsProcessed: Math.floor(Math.random() * 100000) + 5000,
        attestationsValid: Math.floor(Math.random() * 95000) + 4750,
        attestationsFailed: Math.floor(Math.random() * 500),
        slashCount: Math.floor(Math.random() * 3),
        slashedAmount: randomBigIntString(BigInt(0), BigInt(1000) * PRECISION),
        rewardsEarned: randomBigIntString(BigInt(10000) * PRECISION, BigInt(500000) * PRECISION),
        rewardsClaimed: randomBigIntString(BigInt(5000) * PRECISION, BigInt(400000) * PRECISION),
        supportedChains: chainConfigs.slice(0, Math.floor(Math.random() * 5) + 3).map(c => c.chainId),
        avgResponseTime: Math.floor(Math.random() * 5000) + 500,
        lastActiveAt: new Date(),
        aiTrustScore: 7500 + Math.floor(Math.random() * 2500),
        reputationScore: 8000 + Math.floor(Math.random() * 2000),
      };
      await db.insert(bridgeValidators).values(validator);
    }

    const statuses = ["pending", "confirming", "bridging", "relaying", "completed", "failed"];
    for (let i = 0; i < 50; i++) {
      const sourceChain = chainConfigs[Math.floor(Math.random() * chainConfigs.length)];
      let destChain = chainConfigs[Math.floor(Math.random() * chainConfigs.length)];
      while (destChain.chainId === sourceChain.chainId) {
        destChain = chainConfigs[Math.floor(Math.random() * chainConfigs.length)];
      }
      const token = tokens[Math.floor(Math.random() * tokens.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const transfer: InsertBridgeTransfer = {
        sourceChainId: sourceChain.chainId,
        destinationChainId: destChain.chainId,
        senderAddress: generateAddress(),
        recipientAddress: generateAddress(),
        tokenAddress: token.address,
        tokenSymbol: token.symbol,
        amount: randomBigIntString(BigInt(100) * PRECISION, BigInt(100000) * PRECISION),
        amountReceived: status === "completed" ? randomBigIntString(BigInt(99) * PRECISION, BigInt(99000) * PRECISION) : null,
        feeAmount: randomBigIntString(BigInt(1) * PRECISION, BigInt(100) * PRECISION),
        feeToken: token.symbol,
        status: status,
        sourceTxHash: generateTxHash(),
        destinationTxHash: status === "completed" ? generateTxHash() : null,
        sourceBlockNumber: Math.floor(Math.random() * 1000000) + 100000,
        destinationBlockNumber: status === "completed" ? Math.floor(Math.random() * 1000000) + 100000 : null,
        confirmations: status === "completed" ? destChain.confirmations : Math.floor(Math.random() * destChain.confirmations),
        requiredConfirmations: destChain.confirmations,
        estimatedArrival: new Date(Date.now() + Math.floor(Math.random() * 600000)),
        actualArrival: status === "completed" ? new Date(Date.now() - Math.floor(Math.random() * 3600000)) : null,
        retryCount: status === "failed" ? Math.floor(Math.random() * 3) + 1 : 0,
        aiVerified: Math.random() > 0.3,
        aiRiskScore: Math.floor(Math.random() * 500),
      };
      await db.insert(bridgeTransfers).values(transfer);
    }

    const eventTypes = ["transfer_initiated", "transfer_completed", "transfer_failed", "liquidity_added", "liquidity_removed", "validator_joined", "security_alert"];
    for (let i = 0; i < 100; i++) {
      const chain = chainConfigs[Math.floor(Math.random() * chainConfigs.length)];
      const token = tokens[Math.floor(Math.random() * tokens.length)];
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

      const activity: InsertBridgeActivity = {
        eventType: eventType,
        chainId: chain.chainId,
        walletAddress: generateAddress(),
        amount: randomBigIntString(BigInt(10) * PRECISION, BigInt(10000) * PRECISION),
        tokenSymbol: token.symbol,
        txHash: generateTxHash(),
      };
      await db.insert(bridgeActivity).values(activity);
    }

    console.log("[Bridge] Demo data generated successfully");
  }

  async getChains(status?: string): Promise<BridgeChain[]> {
    if (status) {
      return db.select().from(bridgeChains).where(eq(bridgeChains.status, status)).orderBy(desc(bridgeChains.volume24h));
    }
    return db.select().from(bridgeChains).orderBy(desc(bridgeChains.volume24h));
  }

  async getChainById(chainId: number): Promise<BridgeChain | null> {
    const result = await db.select().from(bridgeChains).where(eq(bridgeChains.chainId, chainId)).limit(1);
    return result[0] || null;
  }

  async getRoutes(sourceChainId?: number, destinationChainId?: number): Promise<BridgeRoute[]> {
    const conditions = [];
    if (sourceChainId) conditions.push(eq(bridgeRoutes.sourceChainId, sourceChainId));
    if (destinationChainId) conditions.push(eq(bridgeRoutes.destinationChainId, destinationChainId));
    
    if (conditions.length > 0) {
      return db.select().from(bridgeRoutes).where(and(...conditions)).orderBy(desc(bridgeRoutes.aiPriority));
    }
    return db.select().from(bridgeRoutes).orderBy(desc(bridgeRoutes.volume24h));
  }

  async getActiveRoutes(): Promise<BridgeRoute[]> {
    return db.select().from(bridgeRoutes).where(eq(bridgeRoutes.status, "active")).orderBy(desc(bridgeRoutes.aiPriority));
  }

  async getRouteById(id: string): Promise<BridgeRoute | null> {
    const result = await db.select().from(bridgeRoutes).where(eq(bridgeRoutes.id, id)).limit(1);
    return result[0] || null;
  }

  async getOptimalRoute(sourceChainId: number, destinationChainId: number, tokenSymbol: string): Promise<BridgeRoute | null> {
    const result = await db.select().from(bridgeRoutes)
      .where(and(
        eq(bridgeRoutes.sourceChainId, sourceChainId),
        eq(bridgeRoutes.destinationChainId, destinationChainId),
        eq(bridgeRoutes.tokenSymbol, tokenSymbol),
        eq(bridgeRoutes.status, "active")
      ))
      .orderBy(desc(bridgeRoutes.aiPriority))
      .limit(1);
    return result[0] || null;
  }

  async getTransfers(walletAddress?: string, status?: string, limit: number = 50): Promise<BridgeTransfer[]> {
    const conditions = [];
    if (walletAddress) {
      conditions.push(or(
        eq(bridgeTransfers.senderAddress, walletAddress),
        eq(bridgeTransfers.recipientAddress, walletAddress)
      ));
    }
    if (status) conditions.push(eq(bridgeTransfers.status, status));

    if (conditions.length > 0) {
      return db.select().from(bridgeTransfers)
        .where(and(...conditions))
        .orderBy(desc(bridgeTransfers.createdAt))
        .limit(limit);
    }
    return db.select().from(bridgeTransfers).orderBy(desc(bridgeTransfers.createdAt)).limit(limit);
  }

  async getTransferById(id: string): Promise<BridgeTransfer | null> {
    const result = await db.select().from(bridgeTransfers).where(eq(bridgeTransfers.id, id)).limit(1);
    return result[0] || null;
  }

  async getTransferByHash(txHash: string): Promise<BridgeTransfer | null> {
    const result = await db.select().from(bridgeTransfers)
      .where(or(
        eq(bridgeTransfers.sourceTxHash, txHash),
        eq(bridgeTransfers.destinationTxHash, txHash)
      ))
      .limit(1);
    return result[0] || null;
  }

  async createTransfer(data: InsertBridgeTransfer): Promise<BridgeTransfer> {
    const result = await db.insert(bridgeTransfers).values(data).returning();
    
    await db.insert(bridgeActivity).values({
      eventType: "transfer_initiated",
      chainId: data.sourceChainId,
      walletAddress: data.senderAddress,
      amount: data.amount,
      tokenSymbol: data.tokenSymbol,
      txHash: data.sourceTxHash || null,
    });
    
    return result[0];
  }

  async updateTransferStatus(id: string, status: string, updates?: Partial<InsertBridgeTransfer>): Promise<BridgeTransfer | null> {
    const result = await db.update(bridgeTransfers)
      .set({ status, ...updates, updatedAt: new Date() })
      .where(eq(bridgeTransfers.id, id))
      .returning();
    
    if (result[0]) {
      const eventType = status === "completed" ? "transfer_completed" : status === "failed" ? "transfer_failed" : null;
      if (eventType) {
        await db.insert(bridgeActivity).values({
          eventType,
          chainId: result[0].destinationChainId,
          transferId: id,
          walletAddress: result[0].recipientAddress,
          amount: result[0].amountReceived || result[0].amount,
          tokenSymbol: result[0].tokenSymbol,
          txHash: result[0].destinationTxHash || null,
        });
      }
    }
    
    return result[0] || null;
  }

  async getLiquidityPools(chainId?: number, status?: string): Promise<BridgeLiquidityPool[]> {
    const conditions = [];
    if (chainId) conditions.push(eq(bridgeLiquidityPools.chainId, chainId));
    if (status) conditions.push(eq(bridgeLiquidityPools.status, status));

    if (conditions.length > 0) {
      return db.select().from(bridgeLiquidityPools)
        .where(and(...conditions))
        .orderBy(desc(bridgeLiquidityPools.totalLiquidity));
    }
    return db.select().from(bridgeLiquidityPools).orderBy(desc(bridgeLiquidityPools.totalLiquidity));
  }

  async getLiquidityPoolById(id: string): Promise<BridgeLiquidityPool | null> {
    const result = await db.select().from(bridgeLiquidityPools).where(eq(bridgeLiquidityPools.id, id)).limit(1);
    return result[0] || null;
  }

  async getLiquidityProviders(poolId: string): Promise<BridgeLiquidityProvider[]> {
    return db.select().from(bridgeLiquidityProviders)
      .where(eq(bridgeLiquidityProviders.poolId, poolId))
      .orderBy(desc(bridgeLiquidityProviders.depositedAmount));
  }

  async getValidators(status?: string): Promise<BridgeValidator[]> {
    if (status) {
      return db.select().from(bridgeValidators)
        .where(eq(bridgeValidators.status, status))
        .orderBy(desc(bridgeValidators.stake));
    }
    return db.select().from(bridgeValidators).orderBy(desc(bridgeValidators.stake));
  }

  async getValidatorById(id: string): Promise<BridgeValidator | null> {
    const result = await db.select().from(bridgeValidators).where(eq(bridgeValidators.id, id)).limit(1);
    return result[0] || null;
  }

  async getValidatorByAddress(address: string): Promise<BridgeValidator | null> {
    const result = await db.select().from(bridgeValidators).where(eq(bridgeValidators.address, address)).limit(1);
    return result[0] || null;
  }

  async getFeeConfigs(routeId?: string): Promise<BridgeFeeConfig[]> {
    if (routeId) {
      return db.select().from(bridgeFeeConfigs).where(eq(bridgeFeeConfigs.routeId, routeId));
    }
    return db.select().from(bridgeFeeConfigs).where(eq(bridgeFeeConfigs.isActive, true));
  }

  async calculateFee(routeId: string, amount: string): Promise<{ feeAmount: string; feePercent: number }> {
    const route = await this.getRouteById(routeId);
    if (!route) {
      return { feeAmount: "0", feePercent: 0 };
    }

    const amountBigInt = BigInt(amount);
    const feePercent = route.feePercent || 30;
    const baseFee = BigInt(route.baseFee || "0");
    
    const percentFee = (amountBigInt * BigInt(feePercent)) / BigInt(10000);
    const totalFee = baseFee + percentFee;

    return { 
      feeAmount: totalFee.toString(), 
      feePercent 
    };
  }

  async getSecurityEvents(severity?: string, status?: string, limit: number = 50): Promise<BridgeSecurityEvent[]> {
    const conditions = [];
    if (severity) conditions.push(eq(bridgeSecurityEvents.severity, severity));
    if (status) conditions.push(eq(bridgeSecurityEvents.status, status));

    if (conditions.length > 0) {
      return db.select().from(bridgeSecurityEvents)
        .where(and(...conditions))
        .orderBy(desc(bridgeSecurityEvents.createdAt))
        .limit(limit);
    }
    return db.select().from(bridgeSecurityEvents).orderBy(desc(bridgeSecurityEvents.createdAt)).limit(limit);
  }

  async createSecurityEvent(data: InsertBridgeSecurityEvent): Promise<BridgeSecurityEvent> {
    const result = await db.insert(bridgeSecurityEvents).values(data).returning();
    
    await db.insert(bridgeActivity).values({
      eventType: "security_alert",
      chainId: data.sourceChainId || null,
      walletAddress: data.walletAddress || null,
      amount: data.amount || null,
      txHash: data.txHash || null,
    });
    
    return result[0];
  }

  async getActivity(limit: number = 100): Promise<BridgeActivity[]> {
    return db.select().from(bridgeActivity).orderBy(desc(bridgeActivity.createdAt)).limit(limit);
  }

  async getActivityByChain(chainId: number, limit: number = 50): Promise<BridgeActivity[]> {
    return db.select().from(bridgeActivity)
      .where(eq(bridgeActivity.chainId, chainId))
      .orderBy(desc(bridgeActivity.createdAt))
      .limit(limit);
  }

  async getOverview(): Promise<BridgeOverview> {
    const [chains, routes, validators, transfers, activity] = await Promise.all([
      this.getChains(),
      this.getRoutes(),
      this.getValidators(),
      this.getTransfers(undefined, undefined, 20),
      this.getActivity(50),
    ]);

    const activeChains = chains.filter(c => c.status === "active");
    const activeRoutes = routes.filter(r => r.status === "active");
    const activeValidators = validators.filter(v => v.status === "active");

    let totalLiquidity = BigInt(0);
    let totalVolume = BigInt(0);
    let volume24h = BigInt(0);
    let transferCount24h = 0;
    let fees24h = BigInt(0);

    for (const chain of chains) {
      totalLiquidity += BigInt(chain.totalLiquidity || "0");
      totalVolume += BigInt(chain.volumeTotal || "0");
      volume24h += BigInt(chain.volume24h || "0");
      transferCount24h += chain.txCount24h || 0;
    }

    const avgTransferTime = chains.length > 0 
      ? Math.floor(chains.reduce((sum, c) => sum + (c.avgTransferTime || 0), 0) / chains.length)
      : 0;

    const successRate = chains.length > 0
      ? Math.floor(chains.reduce((sum, c) => sum + (c.successRate || 0), 0) / chains.length)
      : 9900;

    const securityEvents = await this.getSecurityEvents("critical", "active", 10);

    return {
      totalChains: chains.length,
      activeChains: activeChains.length,
      totalRoutes: routes.length,
      activeRoutes: activeRoutes.length,
      totalValidators: validators.length,
      activeValidators: activeValidators.length,
      totalLiquidity: totalLiquidity.toString(),
      totalVolume: totalVolume.toString(),
      volume24h: volume24h.toString(),
      transferCount24h,
      avgTransferTime,
      successRate,
      fees24h: fees24h.toString(),
      securityEventsCount: securityEvents.length,
      topChains: activeChains.slice(0, 5),
      recentTransfers: transfers,
      recentActivity: activity,
    };
  }

  async getAnalytics(): Promise<BridgeAnalytics | null> {
    const result = await db.select().from(bridgeAnalytics).orderBy(desc(bridgeAnalytics.snapshotAt)).limit(1);
    return result[0] || null;
  }

  async createAnalyticsSnapshot(): Promise<BridgeAnalytics> {
    const overview = await this.getOverview();
    
    const snapshot: InsertBridgeAnalytics = {
      totalChains: overview.totalChains,
      activeChains: overview.activeChains,
      totalRoutes: overview.totalRoutes,
      activeRoutes: overview.activeRoutes,
      totalValidators: overview.totalValidators,
      activeValidators: overview.activeValidators,
      totalLiquidity: overview.totalLiquidity,
      totalVolume: overview.totalVolume,
      volume24h: overview.volume24h,
      transferCount24h: overview.transferCount24h,
      avgTransferTime: overview.avgTransferTime,
      successRate: overview.successRate,
      fees24h: overview.fees24h,
      securityEventsCount: overview.securityEventsCount,
    };

    const result = await db.insert(bridgeAnalytics).values(snapshot).returning();
    return result[0];
  }

  async initiateTransfer(data: {
    sourceChainId: number;
    destinationChainId: number;
    amount: string;
    tokenSymbol?: string;
    recipientAddress?: string;
  }): Promise<BridgeTransfer> {
    const senderAddress = "0xTBURNEnterprise" + Array.from({ length: 32 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    
    const recipientAddress = data.recipientAddress || "0xTBURNEnterprise" + Array.from({ length: 32 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join("");

    const route = await this.getOptimalRoute(
      data.sourceChainId,
      data.destinationChainId,
      data.tokenSymbol || "TBURN"
    );

    const destChain = await this.getChainById(data.destinationChainId);
    const confirmationsRequired = destChain?.confirmationsRequired || 12;

    const { feeAmount } = await this.calculateFee(
      route?.id || "",
      data.amount
    );

    const transferData: InsertBridgeTransfer = {
      routeId: route?.id || null,
      sourceChainId: data.sourceChainId,
      destinationChainId: data.destinationChainId,
      senderAddress,
      recipientAddress,
      tokenAddress: route?.tokenAddress || "0x0000000000000000000000000000000000000001",
      tokenSymbol: data.tokenSymbol || "TBURN",
      amount: data.amount,
      feeAmount: feeAmount,
      feeToken: data.tokenSymbol || "TBURN",
      status: "pending",
      sourceTxHash: generateTxHash(),
      sourceBlockNumber: Math.floor(Math.random() * 1000000) + 100000,
      confirmations: 0,
      requiredConfirmations: confirmationsRequired,
      estimatedArrival: new Date(Date.now() + (route?.estimatedTime || 180000)),
      aiVerified: true,
      aiRiskScore: Math.floor(Math.random() * 100),
    };

    const transfer = await this.createTransfer(transferData);

    setTimeout(async () => {
      try {
        await this.updateTransferStatus(transfer.id, "confirming", { confirmations: Math.floor(confirmationsRequired / 3) });
        
        setTimeout(async () => {
          try {
            await this.updateTransferStatus(transfer.id, "bridging", { confirmations: Math.floor(confirmationsRequired * 2 / 3) });
            
            setTimeout(async () => {
              try {
                await this.updateTransferStatus(transfer.id, "relaying", { confirmations: confirmationsRequired - 1 });
              } catch (err) {
                console.error("[Bridge] Error updating to relaying:", err);
              }
            }, 5000);
          } catch (err) {
            console.error("[Bridge] Error updating to bridging:", err);
          }
        }, 5000);
      } catch (err) {
        console.error("[Bridge] Error updating to confirming:", err);
      }
    }, 3000);

    return transfer;
  }

  async claimTransfer(id: string): Promise<BridgeTransfer | null> {
    const transfer = await this.getTransferById(id);
    if (!transfer) {
      return null;
    }

    if (transfer.status === "completed") {
      return transfer;
    }

    if (!["relaying", "bridging", "confirming", "pending"].includes(transfer.status)) {
      throw new Error(`Cannot claim transfer with status: ${transfer.status}`);
    }

    const amountBigInt = BigInt(transfer.amount);
    const feeBigInt = BigInt(transfer.feeAmount || "0");
    const amountReceived = (amountBigInt - feeBigInt).toString();

    const updatedTransfer = await this.updateTransferStatus(id, "completed", {
      destinationTxHash: generateTxHash(),
      destinationBlockNumber: Math.floor(Math.random() * 1000000) + 100000,
      confirmations: transfer.requiredConfirmations,
      amountReceived,
      actualArrival: new Date(),
    });

    return updatedTransfer;
  }

  async refundTransfer(id: string): Promise<BridgeTransfer | null> {
    const transfer = await this.getTransferById(id);
    if (!transfer) {
      return null;
    }

    if (transfer.status === "refunded") {
      return transfer;
    }

    if (!["failed", "pending", "expired"].includes(transfer.status)) {
      throw new Error(`Cannot refund transfer with status: ${transfer.status}. Only failed, pending, or expired transfers can be refunded.`);
    }

    const refundTxHash = generateTxHash();
    const existingMetadata = typeof transfer.metadata === 'object' && transfer.metadata !== null 
      ? transfer.metadata as Record<string, unknown>
      : {};

    const updatedTransfer = await this.updateTransferStatus(id, "refunded", {
      metadata: {
        ...existingMetadata,
        refundTxHash,
        refundInitiated: new Date().toISOString(),
        refundConfirmed: new Date().toISOString(),
      },
    });

    return updatedTransfer;
  }
}

export const bridgeService = BridgeService.getInstance();
