/**
 * TBURN Token Vesting & Schedule API Routes
 * Production-grade endpoints for /token-schedule and /token-details pages
 */

import { Router, Request, Response } from "express";
import { db } from "../db";
import { custodyTransactions, vestingContracts } from "@shared/schema";
import { eq, desc, and, sql, gte, lte, or } from "drizzle-orm";
import { z } from "zod";
import { nanoid } from "nanoid";
import VestingEngine, { 
  calculateVestingStatus, 
  generateVestingSchedule, 
  getVestingConfigByType,
  VestingConfig 
} from "../services/vesting-engine";

const router = Router();

// ========================================
// Token Schedule API (Aggregate View)
// ========================================

/**
 * GET /api/token-schedule
 * Returns aggregated token distribution schedule across all programs
 */
router.get("/token-schedule", async (req: Request, res: Response) => {
  try {
    // Fetch all custody transactions with vesting info
    const transactions = await db
      .select()
      .from(custodyTransactions)
      .orderBy(desc(custodyTransactions.proposedAt));

    // Calculate aggregate schedules
    const now = new Date();
    const programSummaries: Record<string, {
      program: string;
      programDisplayName: string;
      totalAllocated: bigint;
      unlocked: bigint;
      locked: bigint;
      unlockedPercent: number;
      transactionCount: number;
      vestingEnabled: boolean;
      averageCliffMonths: number;
      averageVestingMonths: number;
    }> = {};

    let totalAllocated = BigInt(0);
    let totalUnlocked = BigInt(0);
    let totalLocked = BigInt(0);

    for (const tx of transactions) {
      const amount = BigInt(tx.amount || "0");
      const program = tx.transactionType;
      
      // Calculate vesting status for this transaction
      let unlocked = amount;
      let locked = BigInt(0);
      
      if (tx.vestingEnabled && tx.vestingStartDate) {
        const config: VestingConfig = {
          totalAmount: amount,
          tgePercent: tx.tgePercent || 100,
          cliffMonths: tx.cliffMonths || 0,
          vestingMonths: tx.vestingMonths || 0,
          startDate: new Date(tx.vestingStartDate),
        };
        const status = calculateVestingStatus(config, now);
        unlocked = status.unlockedAmount;
        locked = status.lockedAmount;
      }

      totalAllocated += amount;
      totalUnlocked += unlocked;
      totalLocked += locked;

      if (!programSummaries[program]) {
        programSummaries[program] = {
          program,
          programDisplayName: formatProgramName(program),
          totalAllocated: 0n,
          unlocked: 0n,
          locked: 0n,
          unlockedPercent: 0,
          transactionCount: 0,
          vestingEnabled: false,
          averageCliffMonths: 0,
          averageVestingMonths: 0,
        };
      }

      programSummaries[program].totalAllocated += amount;
      programSummaries[program].unlocked += unlocked;
      programSummaries[program].locked += locked;
      programSummaries[program].transactionCount += 1;
      programSummaries[program].vestingEnabled = programSummaries[program].vestingEnabled || tx.vestingEnabled;
      programSummaries[program].averageCliffMonths += tx.cliffMonths || 0;
      programSummaries[program].averageVestingMonths += tx.vestingMonths || 0;
    }

    // Calculate percentages and averages
    const programs = Object.values(programSummaries).map(p => ({
      ...p,
      totalAllocated: p.totalAllocated.toString(),
      unlocked: p.unlocked.toString(),
      locked: p.locked.toString(),
      unlockedPercent: p.totalAllocated > BigInt(0) 
        ? Math.round(Number((p.unlocked * BigInt(10000)) / p.totalAllocated) / 100 * 100) / 100
        : 100,
      averageCliffMonths: p.transactionCount > 0 
        ? Math.round(p.averageCliffMonths / p.transactionCount) 
        : 0,
      averageVestingMonths: p.transactionCount > 0 
        ? Math.round(p.averageVestingMonths / p.transactionCount) 
        : 0,
    }));

    // Generate 20-year distribution schedule
    const schedule = generate20YearSchedule(transactions);

    res.json({
      success: true,
      timestamp: now.toISOString(),
      summary: {
        totalAllocated: totalAllocated.toString(),
        totalUnlocked: totalUnlocked.toString(),
        totalLocked: totalLocked.toString(),
        unlockedPercent: totalAllocated > BigInt(0) 
          ? Math.round(Number((totalUnlocked * BigInt(10000)) / totalAllocated) / 100 * 100) / 100
          : 100,
        lockedPercent: totalAllocated > BigInt(0) 
          ? Math.round(Number((totalLocked * BigInt(10000)) / totalAllocated) / 100 * 100) / 100
          : 0,
        totalTransactions: transactions.length,
        activeVestingContracts: transactions.filter(t => t.vestingEnabled).length,
      },
      programs,
      schedule,
    });
  } catch (error: any) {
    console.error("[Token Schedule] Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/token-details
 * Returns individual token allocations with vesting status
 */
router.get("/token-details", async (req: Request, res: Response) => {
  try {
    const { program, status, recipient } = req.query;
    
    let query = db.select().from(custodyTransactions);
    
    // Apply filters
    const conditions = [];
    if (program && typeof program === 'string') {
      conditions.push(eq(custodyTransactions.transactionType, program));
    }
    if (status && typeof status === 'string') {
      conditions.push(eq(custodyTransactions.status, status));
    }
    if (recipient && typeof recipient === 'string') {
      conditions.push(
        or(
          sql`${custodyTransactions.recipientAddress} ILIKE ${'%' + recipient + '%'}`,
          sql`${custodyTransactions.recipientName} ILIKE ${'%' + recipient + '%'}`
        )
      );
    }

    const transactions = await db
      .select()
      .from(custodyTransactions)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(custodyTransactions.proposedAt));

    const now = new Date();
    
    const details = transactions.map(tx => {
      const amount = BigInt(tx.amount || "0");
      let vestingStatus = null;
      let schedule = null;

      if (tx.vestingEnabled && tx.vestingStartDate) {
        const config: VestingConfig = {
          totalAmount: amount,
          tgePercent: tx.tgePercent || 100,
          cliffMonths: tx.cliffMonths || 0,
          vestingMonths: tx.vestingMonths || 0,
          startDate: new Date(tx.vestingStartDate),
        };
        
        const rawStatus = calculateVestingStatus(config, now);
        vestingStatus = {
          totalAmount: rawStatus.totalAmount.toString(),
          tgeAmount: rawStatus.tgeAmount.toString(),
          vestedAmount: rawStatus.vestedAmount.toString(),
          unlockedAmount: rawStatus.unlockedAmount.toString(),
          lockedAmount: rawStatus.lockedAmount.toString(),
          unlockedPercent: rawStatus.unlockedPercent,
          lockedPercent: rawStatus.lockedPercent,
          isInCliff: rawStatus.isInCliff,
          cliffEndDate: rawStatus.cliffEndDate?.toISOString() || null,
          vestingEndDate: rawStatus.vestingEndDate.toISOString(),
          nextUnlockDate: rawStatus.nextUnlockDate?.toISOString() || null,
          nextUnlockAmount: rawStatus.nextUnlockAmount.toString(),
          monthsRemaining: rawStatus.monthsRemaining,
          vestingProgress: rawStatus.vestingProgress,
        };

        const rawSchedule = generateVestingSchedule(config);
        schedule = rawSchedule.map(s => ({
          month: s.month,
          date: s.date.toISOString(),
          unlockAmount: s.unlockAmount.toString(),
          cumulativeUnlocked: s.cumulativeUnlocked.toString(),
          cumulativePercent: s.cumulativePercent,
          type: s.type,
        }));
      }

      return {
        transactionId: tx.transactionId,
        transactionType: tx.transactionType,
        transactionTypeDisplay: formatProgramName(tx.transactionType),
        recipientAddress: tx.recipientAddress,
        recipientName: tx.recipientName,
        amount: tx.amount,
        amountUsd: tx.amountUsd,
        status: tx.status,
        purpose: tx.purpose,
        justification: tx.justification,
        proposedAt: tx.proposedAt?.toISOString(),
        executedAt: tx.executedAt?.toISOString() || null,
        
        // Vesting info
        vestingEnabled: tx.vestingEnabled,
        tgePercent: tx.tgePercent,
        cliffMonths: tx.cliffMonths,
        vestingMonths: tx.vestingMonths,
        vestingStartDate: tx.vestingStartDate?.toISOString() || null,
        vestingContractId: tx.vestingContractId,
        
        // Calculated status
        vestingStatus,
        schedule,
      };
    });

    res.json({
      success: true,
      timestamp: now.toISOString(),
      count: details.length,
      filters: { program, status, recipient },
      allocations: details,
    });
  } catch (error: any) {
    console.error("[Token Details] Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/token-details/:transactionId
 * Returns detailed vesting info for a specific transaction
 */
router.get("/token-details/:transactionId", async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;
    
    const [tx] = await db
      .select()
      .from(custodyTransactions)
      .where(eq(custodyTransactions.transactionId, transactionId))
      .limit(1);

    if (!tx) {
      return res.status(404).json({ success: false, error: "Transaction not found" });
    }

    const now = new Date();
    const amount = BigInt(tx.amount || "0");
    let vestingStatus = null;
    let schedule = null;

    if (tx.vestingEnabled && tx.vestingStartDate) {
      const config: VestingConfig = {
        totalAmount: amount,
        tgePercent: tx.tgePercent || 100,
        cliffMonths: tx.cliffMonths || 0,
        vestingMonths: tx.vestingMonths || 0,
        startDate: new Date(tx.vestingStartDate),
      };
      
      const rawStatus = calculateVestingStatus(config, now);
      vestingStatus = {
        totalAmount: rawStatus.totalAmount.toString(),
        tgeAmount: rawStatus.tgeAmount.toString(),
        vestedAmount: rawStatus.vestedAmount.toString(),
        unlockedAmount: rawStatus.unlockedAmount.toString(),
        lockedAmount: rawStatus.lockedAmount.toString(),
        unlockedPercent: rawStatus.unlockedPercent,
        lockedPercent: rawStatus.lockedPercent,
        isInCliff: rawStatus.isInCliff,
        cliffEndDate: rawStatus.cliffEndDate?.toISOString() || null,
        vestingEndDate: rawStatus.vestingEndDate.toISOString(),
        nextUnlockDate: rawStatus.nextUnlockDate?.toISOString() || null,
        nextUnlockAmount: rawStatus.nextUnlockAmount.toString(),
        monthsRemaining: rawStatus.monthsRemaining,
        vestingProgress: rawStatus.vestingProgress,
      };

      schedule = generateVestingSchedule(config).map(s => ({
        month: s.month,
        date: s.date.toISOString(),
        unlockAmount: s.unlockAmount.toString(),
        cumulativeUnlocked: s.cumulativeUnlocked.toString(),
        cumulativePercent: s.cumulativePercent,
        type: s.type,
      }));
    }

    res.json({
      success: true,
      timestamp: now.toISOString(),
      transaction: {
        transactionId: tx.transactionId,
        transactionType: tx.transactionType,
        transactionTypeDisplay: formatProgramName(tx.transactionType),
        recipientAddress: tx.recipientAddress,
        recipientName: tx.recipientName,
        amount: tx.amount,
        amountUsd: tx.amountUsd,
        status: tx.status,
        purpose: tx.purpose,
        justification: tx.justification,
        proposedAt: tx.proposedAt?.toISOString(),
        executedAt: tx.executedAt?.toISOString() || null,
        vestingEnabled: tx.vestingEnabled,
        tgePercent: tx.tgePercent,
        cliffMonths: tx.cliffMonths,
        vestingMonths: tx.vestingMonths,
        vestingStartDate: tx.vestingStartDate?.toISOString() || null,
        vestingContractId: tx.vestingContractId,
      },
      vestingStatus,
      schedule,
    });
  } catch (error: any) {
    console.error("[Token Details] Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/vesting-contracts/create
 * Creates a vesting contract for a custody transaction
 */
router.post("/vesting-contracts/create", async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      transactionId: z.string(),
      tgePercent: z.number().min(0).max(100).optional(),
      cliffMonths: z.number().min(0).max(48).optional(),
      vestingMonths: z.number().min(0).max(240).optional(),
      vestingStartDate: z.string().datetime().optional(),
    });

    const data = schema.parse(req.body);

    // Get the transaction
    const [tx] = await db
      .select()
      .from(custodyTransactions)
      .where(eq(custodyTransactions.transactionId, data.transactionId))
      .limit(1);

    if (!tx) {
      return res.status(404).json({ success: false, error: "Transaction not found" });
    }

    // Get default vesting config for this type
    const defaultConfig = getVestingConfigByType(tx.transactionType);
    
    const tgePercent = data.tgePercent ?? defaultConfig.tgePercent;
    const cliffMonths = data.cliffMonths ?? defaultConfig.cliffMonths;
    const vestingMonths = data.vestingMonths ?? defaultConfig.vestingMonths;
    const vestingStartDate = data.vestingStartDate 
      ? new Date(data.vestingStartDate) 
      : new Date();
    const vestingEnabled = vestingMonths > 0 || cliffMonths > 0 || tgePercent < 100;

    // Generate contract ID
    const contractId = `vc-${tx.transactionType}-${nanoid(8)}`;

    // Create vesting contract in DB
    const vestingEndDate = new Date(vestingStartDate);
    vestingEndDate.setMonth(vestingEndDate.getMonth() + Math.max(vestingMonths, cliffMonths));

    const cliffEndDate = cliffMonths > 0 ? new Date(vestingStartDate) : null;
    if (cliffEndDate) {
      cliffEndDate.setMonth(cliffEndDate.getMonth() + cliffMonths);
    }

    await db.insert(vestingContracts).values({
      contractId,
      contractAddress: `tb1q${nanoid(32)}`,
      contractName: `${formatProgramName(tx.transactionType)} Vesting`,
      categoryId: tx.transactionType,
      categoryName: formatProgramName(tx.transactionType),
      totalAllocation: tx.amount,
      releasedAmount: "0",
      remainingAmount: tx.amount,
      tgePercent,
      cliffMonths,
      vestingMonths,
      vestingType: "linear",
      tgeDate: vestingStartDate,
      cliffEndDate,
      vestingEndDate,
      status: "active",
      isVerified: false,
      metadata: { transactionId: tx.transactionId },
    });

    // Update transaction with vesting info
    await db
      .update(custodyTransactions)
      .set({
        vestingContractId: contractId,
        vestingEnabled,
        tgePercent,
        cliffMonths,
        vestingMonths,
        vestingStartDate,
        updatedAt: new Date(),
      })
      .where(eq(custodyTransactions.transactionId, data.transactionId));

    res.json({
      success: true,
      contractId,
      vestingConfig: {
        vestingEnabled,
        tgePercent,
        cliffMonths,
        vestingMonths,
        vestingStartDate: vestingStartDate.toISOString(),
        vestingEndDate: vestingEndDate.toISOString(),
        cliffEndDate: cliffEndDate?.toISOString() || null,
      },
    });
  } catch (error: any) {
    console.error("[Vesting Contract] Create error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/vesting-contracts/batch-create
 * Creates vesting contracts for multiple transactions at once
 */
router.post("/vesting-contracts/batch-create", async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      transactionIds: z.array(z.string()).optional(),
      applyDefaults: z.boolean().default(true),
    });

    const data = schema.parse(req.body);

    // Get transactions to process
    let transactions;
    if (data.transactionIds && data.transactionIds.length > 0) {
      transactions = await db
        .select()
        .from(custodyTransactions)
        .where(sql`${custodyTransactions.transactionId} = ANY(${data.transactionIds})`);
    } else {
      // Get all transactions without vesting contracts
      transactions = await db
        .select()
        .from(custodyTransactions)
        .where(sql`${custodyTransactions.vestingContractId} IS NULL`);
    }

    const results = [];
    const now = new Date();

    for (const tx of transactions) {
      const defaultConfig = getVestingConfigByType(tx.transactionType);
      
      if (!defaultConfig.vestingEnabled) {
        // Mark as no vesting needed
        await db
          .update(custodyTransactions)
          .set({
            vestingEnabled: false,
            tgePercent: 100,
            cliffMonths: 0,
            vestingMonths: 0,
            vestingStartDate: now,
            updatedAt: now,
          })
          .where(eq(custodyTransactions.transactionId, tx.transactionId));

        results.push({
          transactionId: tx.transactionId,
          status: "no_vesting",
          reason: "Transaction type does not require vesting",
        });
        continue;
      }

      const contractId = `vc-${tx.transactionType}-${nanoid(8)}`;
      const vestingStartDate = now;
      
      const vestingEndDate = new Date(vestingStartDate);
      vestingEndDate.setMonth(vestingEndDate.getMonth() + Math.max(defaultConfig.vestingMonths, defaultConfig.cliffMonths));

      const cliffEndDate = defaultConfig.cliffMonths > 0 ? new Date(vestingStartDate) : null;
      if (cliffEndDate) {
        cliffEndDate.setMonth(cliffEndDate.getMonth() + defaultConfig.cliffMonths);
      }

      try {
        // Create vesting contract
        await db.insert(vestingContracts).values({
          contractId,
          contractAddress: `tb1q${nanoid(32)}`,
          contractName: `${formatProgramName(tx.transactionType)} Vesting`,
          categoryId: tx.transactionType,
          categoryName: formatProgramName(tx.transactionType),
          totalAllocation: tx.amount,
          releasedAmount: "0",
          remainingAmount: tx.amount,
          tgePercent: defaultConfig.tgePercent,
          cliffMonths: defaultConfig.cliffMonths,
          vestingMonths: defaultConfig.vestingMonths,
          vestingType: "linear",
          tgeDate: vestingStartDate,
          cliffEndDate,
          vestingEndDate,
          status: "active",
          isVerified: false,
          metadata: { transactionId: tx.transactionId },
        });

        // Update transaction
        await db
          .update(custodyTransactions)
          .set({
            vestingContractId: contractId,
            vestingEnabled: true,
            tgePercent: defaultConfig.tgePercent,
            cliffMonths: defaultConfig.cliffMonths,
            vestingMonths: defaultConfig.vestingMonths,
            vestingStartDate,
            updatedAt: now,
          })
          .where(eq(custodyTransactions.transactionId, tx.transactionId));

        results.push({
          transactionId: tx.transactionId,
          status: "created",
          contractId,
          vestingConfig: defaultConfig,
        });
      } catch (err: any) {
        results.push({
          transactionId: tx.transactionId,
          status: "error",
          error: err.message,
        });
      }
    }

    res.json({
      success: true,
      processed: results.length,
      created: results.filter(r => r.status === "created").length,
      noVesting: results.filter(r => r.status === "no_vesting").length,
      errors: results.filter(r => r.status === "error").length,
      results,
    });
  } catch (error: any) {
    console.error("[Vesting Contract] Batch create error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// Helper Functions
// ========================================

function formatProgramName(type: string): string {
  const names: Record<string, string> = {
    team_allocation: "Team Allocation",
    advisor_allocation: "Advisor Allocation",
    seed_round: "Seed Round",
    private_round: "Private Round",
    public_round: "Public Round",
    strategic_partner: "Strategic Partner",
    ecosystem_grant: "Ecosystem Grant",
    ecosystem_fund: "Ecosystem Fund",
    airdrop: "Community Airdrop",
    community: "Community Program",
    referral: "Referral Program",
    staking_rewards: "Staking Rewards",
    validator_rewards: "Validator Rewards",
    block_rewards: "Block Rewards",
    operational: "Operational",
    infrastructure: "Infrastructure",
    marketing: "Marketing",
    exchange_listing: "Exchange Listing",
    reserve: "Reserve Fund",
    security: "Security & Bug Bounty",
    dao_treasury: "DAO Treasury",
    dao_governance: "DAO Governance",
  };
  return names[type] || type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function generate20YearSchedule(transactions: any[]): any[] {
  const schedule: any[] = [];
  const startYear = new Date().getFullYear();
  
  for (let year = startYear; year <= startYear + 20; year++) {
    let yearUnlocked = BigInt(0);
    let yearTotal = BigInt(0);
    
    for (const tx of transactions) {
      const amount = BigInt(tx.amount || "0");
      yearTotal += amount;
      
      if (!tx.vestingEnabled || !tx.vestingStartDate) {
        yearUnlocked += amount;
        continue;
      }
      
      const startDate = new Date(tx.vestingStartDate);
      const yearEnd = new Date(year, 11, 31);
      
      const config: VestingConfig = {
        totalAmount: amount,
        tgePercent: tx.tgePercent || 100,
        cliffMonths: tx.cliffMonths || 0,
        vestingMonths: tx.vestingMonths || 0,
        startDate,
      };
      
      const status = calculateVestingStatus(config, yearEnd);
      yearUnlocked += status.unlockedAmount;
    }
    
    schedule.push({
      year,
      totalAllocated: yearTotal.toString(),
      unlocked: yearUnlocked.toString(),
      locked: (yearTotal - yearUnlocked).toString(),
      unlockedPercent: yearTotal > BigInt(0) 
        ? Math.round(Number((yearUnlocked * BigInt(10000)) / yearTotal) / 100 * 100) / 100
        : 100,
    });
  }
  
  return schedule;
}

// ========================================
// Enterprise Tokenomics Validation API
// ========================================

import { validateTokenomicsConfig, validateCustodyTransactions } from "../utils/tokenomics-validator";

/**
 * GET /api/tokenomics/validate
 * Enterprise-grade validation of tokenomics configuration against official v4.3
 */
router.get("/tokenomics/validate", async (req: Request, res: Response) => {
  try {
    // 1. Validate GENESIS_ALLOCATION
    const configReport = validateTokenomicsConfig();
    
    // 2. Fetch custody transactions from DB
    const transactions = await db
      .select({
        transaction_type: custodyTransactions.transactionType,
        amount: custodyTransactions.amount,
        tge_percent: custodyTransactions.tgePercent,
        cliff_months: custodyTransactions.cliffMonths,
        vesting_months: custodyTransactions.vestingMonths,
      })
      .from(custodyTransactions);
    
    // 3. Validate custody transactions
    const custodyReport = validateCustodyTransactions(
      transactions.map(tx => ({
        transaction_type: tx.transaction_type,
        amount: tx.amount || "0",
        tge_percent: tx.tge_percent || 0,
        cliff_months: tx.cliff_months || 0,
        vesting_months: tx.vesting_months || 0,
      }))
    );
    
    // 4. Combined validation result
    const allPassed = configReport.failedChecks === 0 && custodyReport.failedChecks === 0;
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      version: "v4.3",
      overallStatus: allPassed ? "PASSED" : "FAILED",
      genesisAllocationValidation: {
        status: configReport.failedChecks === 0 ? "PASSED" : "FAILED",
        totalChecks: configReport.totalChecks,
        passedChecks: configReport.passedChecks,
        failedChecks: configReport.failedChecks,
        successRate: configReport.successRate,
        summary: configReport.summary,
        failedResults: configReport.results.filter(r => !r.passed),
      },
      custodyTransactionValidation: {
        status: custodyReport.failedChecks === 0 ? "PASSED" : "FAILED",
        totalChecks: custodyReport.totalChecks,
        passedChecks: custodyReport.passedChecks,
        failedChecks: custodyReport.failedChecks,
        successRate: custodyReport.successRate,
        transactionCount: transactions.length,
        failedResults: custodyReport.results.filter(r => !r.passed),
      },
    });
  } catch (error) {
    console.error("Tokenomics validation error:", error);
    res.status(500).json({
      success: false,
      error: "Validation failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/tokenomics/validate/detailed
 * Full detailed validation report with all results
 */
router.get("/tokenomics/validate/detailed", async (req: Request, res: Response) => {
  try {
    const configReport = validateTokenomicsConfig();
    
    const transactions = await db
      .select({
        transaction_type: custodyTransactions.transactionType,
        amount: custodyTransactions.amount,
        tge_percent: custodyTransactions.tgePercent,
        cliff_months: custodyTransactions.cliffMonths,
        vesting_months: custodyTransactions.vestingMonths,
      })
      .from(custodyTransactions);
    
    const custodyReport = validateCustodyTransactions(
      transactions.map(tx => ({
        transaction_type: tx.transaction_type,
        amount: tx.amount || "0",
        tge_percent: tx.tge_percent || 0,
        cliff_months: tx.cliff_months || 0,
        vesting_months: tx.vesting_months || 0,
      }))
    );
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      version: "v4.3",
      genesisAllocationValidation: configReport,
      custodyTransactionValidation: custodyReport,
    });
  } catch (error) {
    console.error("Detailed validation error:", error);
    res.status(500).json({
      success: false,
      error: "Validation failed",
    });
  }
});

export default router;
