import type { Express, Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { getEnterpriseNode } from "../services/TBurnEnterpriseNode";
import { tburnWalletService } from "../services/TBurnWalletService";
import { db } from "../db";
import { 
  walletBalances,
  walletPerformanceHistory,
  walletActionLog,
  walletStreamingCheckpoint,
  transactions,
  members,
  insertWalletActionLogSchema,
} from "@shared/schema";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
const WEI_REGEX = /^\d+$/;

const sendTransactionSchema = z.object({
  toAddress: z.string().regex(ETH_ADDRESS_REGEX, "Invalid recipient address"),
  amount: z.string().regex(WEI_REGEX, "Amount must be a valid number"),
  gasLimit: z.string().regex(WEI_REGEX).optional().default("21000"),
  gasPrice: z.string().regex(WEI_REGEX).optional(),
  memo: z.string().max(256).optional(),
});

const swapTokenSchema = z.object({
  tokenIn: z.string().min(1),
  tokenOut: z.string().min(1),
  amountIn: z.string().regex(WEI_REGEX),
  slippageBps: z.number().int().min(1).max(5000).optional().default(50),
  deadline: z.number().int().positive().optional(),
});

const timeRangeSchema = z.enum(["1H", "1D", "1W", "1M", "1Y"]).optional().default("1W");

function formatBalance(weiBalance: string): string {
  const balanceNum = parseFloat(weiBalance) / 1e18;
  return balanceNum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculateUsdValue(burnBalance: string, tokenPrice: number): string {
  const balanceNum = parseFloat(burnBalance) / 1e18;
  return (balanceNum * tokenPrice).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function registerWalletDashboardRoutes(
  app: Express, 
  requireAuth: (req: Request, res: Response, next: () => void) => void
) {
  const enterpriseNode = getEnterpriseNode();

  app.get("/api/wallet/balance", async (req: Request, res: Response) => {
    try {
      const address = (req.query.address as string) || "0x9a4c8d2f5e3b7a1c6e9d4f8a2b5c7e3f1a4d2f5e";
      
      const nodeStatus = enterpriseNode.getStatus();
      const tokenEconomics = enterpriseNode.getTokenEconomics();
      const tokenPrice = tokenEconomics.tokenPrice || 0.29;
      const priceChange = tokenEconomics.priceChangePercent || 0;
      
      let walletData = await db.select().from(walletBalances).where(eq(walletBalances.address, address)).limit(1);
      
      let balance = "15847000000000000000000";
      let stakedBalance = "5000000000000000000000";
      
      if (walletData.length > 0) {
        balance = walletData[0].balance;
        stakedBalance = walletData[0].stakedBalance;
      }

      const totalBalance = (BigInt(balance) + BigInt(stakedBalance)).toString();
      const balanceFormatted = formatBalance(totalBalance);
      const balanceUsd = calculateUsdValue(totalBalance, tokenPrice);

      res.json({
        address,
        balance: balanceFormatted,
        balanceWei: totalBalance,
        balanceUsd,
        stakedBalance: formatBalance(stakedBalance),
        stakedBalanceWei: stakedBalance,
        availableBalance: formatBalance(balance),
        availableBalanceWei: balance,
        change24h: priceChange,
        tokenPrice,
        networkStatus: nodeStatus.isSyncing ? "syncing" : "operational",
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[WalletDashboard] Balance error:", error);
      res.status(500).json({ error: "Failed to fetch wallet balance" });
    }
  });

  // Get all wallets created in this session (public endpoint for user page)
  app.get("/api/wallet/my-wallets", async (req: Request, res: Response) => {
    try {
      // Get all tb1 format wallets (newly created wallets use Bech32m format)
      const wallets = await db.select({
        address: walletBalances.address,
        balance: walletBalances.balance,
        firstSeenAt: walletBalances.firstSeenAt,
      })
      .from(walletBalances)
      .where(sql`${walletBalances.address} LIKE 'tb1%'`)
      .orderBy(desc(walletBalances.firstSeenAt))
      .limit(50);

      res.json(wallets.map(w => ({
        address: w.address,
        balance: w.balance ? (parseFloat(w.balance) / 1e18).toFixed(4) : "0",
        createdAt: w.firstSeenAt?.toISOString() || new Date().toISOString(),
      })));
    } catch (error) {
      console.error("[WalletDashboard] My wallets error:", error);
      res.status(500).json({ error: "Failed to fetch wallets" });
    }
  });

  app.get("/api/wallet/performance", async (req: Request, res: Response) => {
    try {
      const address = (req.query.address as string) || "0x9a4c8d2f5e3b7a1c6e9d4f8a2b5c7e3f1a4d2f5e";
      const range = timeRangeSchema.parse(req.query.range);
      
      const tokenEconomics = enterpriseNode.getTokenEconomics();
      const tokenPrice = tokenEconomics.tokenPrice || 0.29;
      const baseBalance = 15847;
      
      const dataPoints: { day: string; value: number; usdValue: number }[] = [];
      const now = new Date();
      
      let days = 7;
      let labels: string[] = [];
      
      switch (range) {
        case "1H":
          days = 1;
          labels = Array.from({ length: 12 }, (_, i) => `${i * 5}m`);
          break;
        case "1D":
          days = 1;
          labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
          break;
        case "1W":
          days = 7;
          labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
          break;
        case "1M":
          days = 30;
          labels = Array.from({ length: 30 }, (_, i) => `${i + 1}`);
          break;
        case "1Y":
          days = 12;
          labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          break;
      }

      const volatility = 0.05;
      let currentValue = baseBalance * (1 - volatility * 2);
      
      for (let i = 0; i < labels.length; i++) {
        const randomChange = (Math.random() - 0.3) * volatility * currentValue;
        currentValue = Math.max(currentValue + randomChange, baseBalance * 0.8);
        
        if (i === labels.length - 1) {
          currentValue = baseBalance;
        }
        
        dataPoints.push({
          day: labels[i],
          value: Math.round(currentValue * 100) / 100,
          usdValue: Math.round(currentValue * tokenPrice * 100) / 100,
        });
      }

      res.json({
        address,
        timeRange: range,
        dataPoints,
        summary: {
          startValue: dataPoints[0]?.value || 0,
          endValue: dataPoints[dataPoints.length - 1]?.value || 0,
          change: ((dataPoints[dataPoints.length - 1]?.value || 0) - (dataPoints[0]?.value || 0)),
          changePercent: (((dataPoints[dataPoints.length - 1]?.value || 0) / (dataPoints[0]?.value || 1)) - 1) * 100,
          high: Math.max(...dataPoints.map(d => d.value)),
          low: Math.min(...dataPoints.map(d => d.value)),
        },
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[WalletDashboard] Performance error:", error);
      res.status(500).json({ error: "Failed to fetch performance data" });
    }
  });

  app.get("/api/wallet/activities", async (req: Request, res: Response) => {
    try {
      const address = (req.query.address as string) || "0x9a4c8d2f5e3b7a1c6e9d4f8a2b5c7e3f1a4d2f5e";
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const cursor = req.query.cursor as string;

      const activities = await db.select()
        .from(walletActionLog)
        .where(eq(walletActionLog.walletAddress, address))
        .orderBy(desc(walletActionLog.initiatedAt))
        .limit(limit);

      const formattedActivities = activities.map(a => ({
        id: a.id,
        type: a.actionType as 'sent' | 'received' | 'swap',
        amount: formatBalance(a.amount),
        amountWei: a.amount,
        address: a.toAddress || a.fromAddress || "",
        txHash: a.txHash,
        status: a.status,
        tokenPair: a.tokenPair,
        timestamp: formatRelativeTime(a.initiatedAt),
        timestampIso: a.initiatedAt.toISOString(),
      }));

      res.json({
        address,
        activities: formattedActivities,
        hasMore: activities.length === limit,
        nextCursor: activities.length > 0 ? activities[activities.length - 1].id : null,
      });
    } catch (error) {
      console.error("[WalletDashboard] Activities error:", error);
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  app.post("/api/wallet/send", requireAuth, async (req: Request, res: Response) => {
    try {
      const fromAddress = (req.query.address as string) || "0x9a4c8d2f5e3b7a1c6e9d4f8a2b5c7e3f1a4d2f5e";
      const validation = sendTransactionSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid request", 
          details: validation.error.errors 
        });
      }

      const { toAddress, amount, gasLimit, gasPrice, memo } = validation.data;
      
      const tokenEconomics = enterpriseNode.getTokenEconomics();
      const tokenPrice = tokenEconomics.tokenPrice || 0.29;
      const amountUsd = calculateUsdValue(amount, tokenPrice);

      const [actionLog] = await db.insert(walletActionLog).values({
        walletAddress: fromAddress,
        actionType: "send",
        status: "pending",
        amount,
        amountUsd: amountUsd.replace(/,/g, ""),
        toAddress,
        gasPrice: gasPrice || "10000000000000",
        metadata: { memo, gasLimit },
      }).returning();

      setTimeout(async () => {
        try {
          const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
          const blockNumber = enterpriseNode.getStatus().currentBlock;
          
          await db.update(walletActionLog)
            .set({
              status: "confirmed",
              txHash,
              blockNumber,
              gasUsed: 21000,
              confirmedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(walletActionLog.id, actionLog.id));
        } catch (err) {
          await db.update(walletActionLog)
            .set({
              status: "failed",
              errorMessage: "Transaction simulation failed",
              failedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(walletActionLog.id, actionLog.id));
        }
      }, 3000);

      res.json({
        success: true,
        actionId: actionLog.id,
        status: "pending",
        message: "Transaction submitted successfully",
        estimatedConfirmation: "~3 seconds",
      });
    } catch (error) {
      console.error("[WalletDashboard] Send error:", error);
      res.status(500).json({ error: "Failed to send transaction" });
    }
  });

  app.post("/api/wallet/receive", requireAuth, async (req: Request, res: Response) => {
    try {
      const address = (req.query.address as string) || "0x9a4c8d2f5e3b7a1c6e9d4f8a2b5c7e3f1a4d2f5e";
      
      const qrData = {
        address,
        network: "TBURN Mainnet",
        chainId: 7979,
        symbol: "TBURN",
      };

      res.json({
        success: true,
        address,
        qrPayload: JSON.stringify(qrData),
        deepLink: `tburn://send?to=${address}&network=mainnet`,
        instructions: [
          "Scan QR code with your wallet app",
          "Or copy the address to send TBURN tokens",
          "Ensure you're on TBURN Mainnet (Chain ID: 7979)",
        ],
      });
    } catch (error) {
      console.error("[WalletDashboard] Receive error:", error);
      res.status(500).json({ error: "Failed to generate receive address" });
    }
  });

  app.post("/api/wallet/swap", requireAuth, async (req: Request, res: Response) => {
    try {
      const address = (req.query.address as string) || "0x9a4c8d2f5e3b7a1c6e9d4f8a2b5c7e3f1a4d2f5e";
      const validation = swapTokenSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid request", 
          details: validation.error.errors 
        });
      }

      const { tokenIn, tokenOut, amountIn, slippageBps } = validation.data;
      const tokenEconomics = enterpriseNode.getTokenEconomics();
      const tokenPrice = tokenEconomics.tokenPrice || 0.29;
      
      const rate = tokenIn === "TBURN" ? tokenPrice : 1 / tokenPrice;
      const amountOut = (parseFloat(amountIn) * rate * (1 - slippageBps / 10000)).toString();

      const [actionLog] = await db.insert(walletActionLog).values({
        walletAddress: address,
        actionType: "swap",
        status: "pending",
        amount: amountIn,
        amountUsd: (parseFloat(amountIn) / 1e18 * tokenPrice).toFixed(2),
        tokenPair: `${tokenIn}/${tokenOut}`,
        swapRate: rate.toString(),
        slippage: slippageBps,
        metadata: { amountOut, tokenIn, tokenOut },
      }).returning();

      setTimeout(async () => {
        const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
        await db.update(walletActionLog)
          .set({
            status: "confirmed",
            txHash,
            blockNumber: enterpriseNode.getStatus().currentBlock,
            confirmedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(walletActionLog.id, actionLog.id));
      }, 2000);

      res.json({
        success: true,
        actionId: actionLog.id,
        status: "pending",
        quote: {
          tokenIn,
          tokenOut,
          amountIn,
          amountOut,
          rate,
          slippageBps,
          priceImpact: 0.12,
        },
        message: "Swap submitted successfully",
      });
    } catch (error) {
      console.error("[WalletDashboard] Swap error:", error);
      res.status(500).json({ error: "Failed to execute swap" });
    }
  });

  app.get("/api/wallet/action/:actionId", async (req: Request, res: Response) => {
    try {
      const { actionId } = req.params;
      
      const [action] = await db.select()
        .from(walletActionLog)
        .where(eq(walletActionLog.id, actionId))
        .limit(1);

      if (!action) {
        return res.status(404).json({ error: "Action not found" });
      }

      res.json({
        id: action.id,
        type: action.actionType,
        status: action.status,
        amount: formatBalance(action.amount),
        amountUsd: action.amountUsd,
        txHash: action.txHash,
        blockNumber: action.blockNumber,
        gasUsed: action.gasUsed?.toString(),
        fee: action.fee,
        initiatedAt: action.initiatedAt.toISOString(),
        confirmedAt: action.confirmedAt?.toISOString(),
        errorMessage: action.errorMessage,
      });
    } catch (error) {
      console.error("[WalletDashboard] Action status error:", error);
      res.status(500).json({ error: "Failed to fetch action status" });
    }
  });

  app.get("/api/wallet/gas-estimate", async (req: Request, res: Response) => {
    try {
      const actionType = req.query.type as string || "send";
      
      const gasLimits: Record<string, number> = {
        send: 21000,
        swap: 150000,
        stake: 100000,
        unstake: 80000,
        claim: 50000,
      };

      const gasLimit = gasLimits[actionType] || 21000;
      const gasPrice = "10000000000000";
      const totalFee = (BigInt(gasLimit) * BigInt(gasPrice)).toString();
      const tokenEconomics = enterpriseNode.getTokenEconomics();
      const tokenPrice = tokenEconomics.tokenPrice || 0.29;
      const feeUsd = (parseFloat(totalFee) / 1e18 * tokenPrice).toFixed(4);

      res.json({
        gasLimit,
        gasPrice,
        gasPriceEmber: "10",
        totalFee,
        totalFeeFormatted: formatBalance(totalFee),
        totalFeeUsd: feeUsd,
        estimatedTime: "~3 seconds",
      });
    } catch (error) {
      console.error("[WalletDashboard] Gas estimate error:", error);
      res.status(500).json({ error: "Failed to estimate gas" });
    }
  });

  app.post("/api/wallet/create", requireAuth, async (req: Request, res: Response) => {
    try {
      let walletData = tburnWalletService.generateWalletWithPrivateKey();
      const chainConfig = tburnWalletService.getChainConfig();

      let retries = 0;
      const maxRetries = 3;
      let memberId: string | null = null;
      
      while (retries < maxRetries) {
        try {
          const existing = await db.select().from(walletBalances).where(eq(walletBalances.address, walletData.address)).limit(1);
          if (existing.length === 0) {
            // Insert wallet balance record
            await db.insert(walletBalances).values({
              address: walletData.address,
            });
            enterpriseNode.registerWallet(walletData.address, "0");
            
            // Also create a member record for admin tracking
            const existingMember = await db.select().from(members).where(eq(members.accountAddress, walletData.address)).limit(1);
            if (existingMember.length === 0) {
              const memberResult = await storage.createMember({
                accountAddress: walletData.address,
                publicKey: walletData.publicKey,
                displayName: `Wallet ${walletData.address.slice(0, 8)}...${walletData.address.slice(-6)}`,
                entityType: "individual",
                memberTier: "basic_user",
                memberStatus: "active",
                kycLevel: "none",
                amlRiskScore: 0,
                sanctionsCheckPassed: false,
                pepStatus: false,
              });
              memberId = memberResult.id;
              console.log(`[WalletDashboard] Created member record: ${memberId} for wallet: ${walletData.address}`);
            }
            break;
          }
          walletData = tburnWalletService.generateWalletWithPrivateKey();
          retries++;
        } catch (insertError) {
          console.error("[WalletDashboard] Insert error:", insertError);
          walletData = tburnWalletService.generateWalletWithPrivateKey();
          retries++;
          if (retries >= maxRetries) throw insertError;
        }
      }

      res.json({
        success: true,
        wallet: {
          address: walletData.address,
          publicKey: walletData.publicKey,
          privateKey: walletData.privateKey,
          chainId: walletData.chainId,
          network: walletData.network,
          createdAt: walletData.createdAt.toISOString(),
        },
        memberId,
        chainConfig,
        warning: "IMPORTANT: Save your private key securely. It will not be shown again!",
      });
    } catch (error) {
      console.error("[WalletDashboard] Create wallet error:", error);
      res.status(500).json({ error: "Failed to create wallet" });
    }
  });

  console.log("[WalletDashboard] Routes registered successfully");
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

