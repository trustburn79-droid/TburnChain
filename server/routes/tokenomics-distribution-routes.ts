/**
 * TBURN Tokenomics Distribution API Routes
 * 
 * 20년 베스팅 스케줄 기반 토큰 자동 배포 API
 * 하이브리드 키 관리 시스템(HSM + 핫월렛) 연동
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { 
  tokenomicsDistributionScheduler,
  DistributionCategory,
} from '../services/tokenomics-distribution-scheduler';
import { requireAdmin } from '../middleware/auth';

const router = Router();

const ManualDistributionSchema = z.object({
  category: z.enum(['COMMUNITY', 'REWARDS', 'INVESTORS', 'ECOSYSTEM', 'TEAM', 'FOUNDATION']),
  subcategory: z.string().min(1),
  amount: z.string().regex(/^\d+(\.\d+)?$/, 'Invalid amount format'),
  recipient: z.string().min(1),
});

router.get('/status', requireAdmin, async (req: Request, res: Response) => {
  try {
    const status = tokenomicsDistributionScheduler.getStatus();
    
    const formattedCategories: Record<string, any> = {};
    for (const [key, value] of Object.entries(status.categories)) {
      formattedCategories[key] = {
        totalAllocated: value.totalAllocated.toString(),
        distributed: value.distributed.toString(),
        remaining: value.remaining.toString(),
        nextUnlockDate: value.nextUnlockDate?.toISOString() || null,
        nextUnlockAmount: value.nextUnlockAmount.toString(),
      };
    }

    res.json({
      success: true,
      data: {
        isRunning: status.isRunning,
        lastExecutionTime: status.lastExecutionTime?.toISOString() || null,
        nextScheduledTime: status.nextScheduledTime?.toISOString() || null,
        totalDistributed: status.totalDistributed.toString(),
        pendingDistributions: status.pendingDistributions,
        failedDistributions: status.failedDistributions,
        categories: formattedCategories,
      },
    });
  } catch (error: any) {
    console.error('[TokenomicsDistributionRoutes] Error getting status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get scheduler status',
      message: error.message 
    });
  }
});

router.post('/start', requireAdmin, async (req: Request, res: Response) => {
  try {
    tokenomicsDistributionScheduler.start();
    res.json({
      success: true,
      message: 'Distribution scheduler started',
    });
  } catch (error: any) {
    console.error('[TokenomicsDistributionRoutes] Error starting scheduler:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to start scheduler',
      message: error.message 
    });
  }
});

router.post('/stop', requireAdmin, async (req: Request, res: Response) => {
  try {
    tokenomicsDistributionScheduler.stop();
    res.json({
      success: true,
      message: 'Distribution scheduler stopped',
    });
  } catch (error: any) {
    console.error('[TokenomicsDistributionRoutes] Error stopping scheduler:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to stop scheduler',
      message: error.message 
    });
  }
});

router.get('/scheduled', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { category, executed, limit } = req.query;
    
    const distributions = tokenomicsDistributionScheduler.getScheduledDistributions({
      category: category as DistributionCategory | undefined,
      executed: executed !== undefined ? executed === 'true' : undefined,
      limit: limit ? parseInt(limit as string, 10) : 100,
    });

    const formatted = distributions.map(d => ({
      category: d.category,
      subcategory: d.subcategory,
      amount: d.amount.toString(),
      scheduledDate: d.scheduledDate.toISOString(),
      vestingMonth: d.vestingMonth,
      type: d.type,
      executed: d.executed,
    }));

    res.json({
      success: true,
      data: {
        count: formatted.length,
        distributions: formatted,
      },
    });
  } catch (error: any) {
    console.error('[TokenomicsDistributionRoutes] Error getting scheduled distributions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get scheduled distributions',
      message: error.message 
    });
  }
});

router.get('/records', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { category, status, limit } = req.query;
    
    const records = tokenomicsDistributionScheduler.getDistributionRecords({
      category: category as DistributionCategory | undefined,
      status: status as any,
      limit: limit ? parseInt(limit as string, 10) : 50,
    });

    const formatted = records.map(r => ({
      id: r.id,
      category: r.category,
      subcategory: r.subcategory,
      amount: r.amount.toString(),
      amountTBURN: r.amountTBURN,
      recipient: r.recipient,
      txHash: r.txHash,
      signedBy: r.signedBy,
      keyName: r.keyName,
      status: r.status,
      scheduledDate: r.scheduledDate.toISOString(),
      executedAt: r.executedAt?.toISOString() || null,
      vestingMonth: r.vestingMonth,
      error: r.error,
      createdAt: r.createdAt.toISOString(),
    }));

    res.json({
      success: true,
      data: {
        count: formatted.length,
        records: formatted,
      },
    });
  } catch (error: any) {
    console.error('[TokenomicsDistributionRoutes] Error getting distribution records:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get distribution records',
      message: error.message 
    });
  }
});

router.get('/vesting/:category', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    
    const validCategories = ['COMMUNITY', 'REWARDS', 'INVESTORS', 'ECOSYSTEM', 'TEAM', 'FOUNDATION'];
    if (!validCategories.includes(category.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category',
        validCategories,
      });
    }

    const vestingStatus = tokenomicsDistributionScheduler.getCategoryVestingStatus(
      category.toUpperCase() as DistributionCategory
    );

    const formattedSubcategories: Record<string, any> = {};
    for (const [key, value] of Object.entries(vestingStatus.subcategories)) {
      formattedSubcategories[key] = {
        name: value.name,
        totalAmount: value.totalAmount.toString(),
        unlockedAmount: value.unlockedAmount.toString(),
        unlockedPercent: value.unlockedPercent,
        isInCliff: value.isInCliff,
        nextUnlockDate: value.nextUnlockDate?.toISOString() || null,
      };
    }

    res.json({
      success: true,
      data: {
        category: vestingStatus.category,
        totalAmount: vestingStatus.totalAmount.toString(),
        unlockedAmount: vestingStatus.unlockedAmount.toString(),
        lockedAmount: vestingStatus.lockedAmount.toString(),
        unlockedPercent: vestingStatus.unlockedPercent,
        isInCliff: vestingStatus.isInCliff,
        vestingProgress: vestingStatus.vestingProgress,
        subcategories: formattedSubcategories,
      },
    });
  } catch (error: any) {
    console.error('[TokenomicsDistributionRoutes] Error getting vesting status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get vesting status',
      message: error.message 
    });
  }
});

router.get('/schedule/20-year', requireAdmin, async (req: Request, res: Response) => {
  try {
    const schedule = tokenomicsDistributionScheduler.getUpcoming20YearSchedule();

    const formatted = schedule.map(entry => ({
      year: entry.year,
      month: entry.month,
      date: entry.date.toISOString(),
      distributionCount: entry.distributions.length,
      totalAmount: entry.totalAmount.toString(),
      totalFormatted: entry.totalFormatted,
      categories: entry.distributions.reduce((acc, d) => {
        if (!acc[d.category]) {
          acc[d.category] = { count: 0, amount: BigInt(0) };
        }
        acc[d.category].count++;
        acc[d.category].amount += d.amount;
        return acc;
      }, {} as Record<string, { count: number; amount: bigint }>),
    }));

    const formattedFinal = formatted.map(entry => ({
      ...entry,
      categories: Object.fromEntries(
        Object.entries(entry.categories).map(([k, v]) => [k, { count: v.count, amount: v.amount.toString() }])
      ),
    }));

    res.json({
      success: true,
      data: {
        totalMonths: formattedFinal.length,
        schedule: formattedFinal,
      },
    });
  } catch (error: any) {
    console.error('[TokenomicsDistributionRoutes] Error getting 20-year schedule:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get 20-year schedule',
      message: error.message 
    });
  }
});

router.post('/execute-manual', requireAdmin, async (req: Request, res: Response) => {
  try {
    const validation = ManualDistributionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.errors,
      });
    }

    const { category, subcategory, amount, recipient } = validation.data;

    const amountBigInt = BigInt(Math.floor(parseFloat(amount) * 10 ** 18));

    const record = await tokenomicsDistributionScheduler.executeManualDistribution(
      category as DistributionCategory,
      subcategory,
      amountBigInt,
      recipient
    );

    res.json({
      success: true,
      data: {
        id: record.id,
        category: record.category,
        subcategory: record.subcategory,
        amount: record.amount.toString(),
        amountTBURN: record.amountTBURN,
        recipient: record.recipient,
        txHash: record.txHash,
        signedBy: record.signedBy,
        status: record.status,
        executedAt: record.executedAt?.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[TokenomicsDistributionRoutes] Error executing manual distribution:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to execute manual distribution',
      message: error.message 
    });
  }
});

router.get('/summary', async (req: Request, res: Response) => {
  try {
    const status = tokenomicsDistributionScheduler.getStatus();
    
    const categories = ['COMMUNITY', 'REWARDS', 'INVESTORS', 'ECOSYSTEM', 'TEAM', 'FOUNDATION'] as const;
    const categorySummary = categories.map(cat => {
      const catStatus = status.categories[cat];
      return {
        category: cat,
        totalAllocatedTBURN: Number(catStatus.totalAllocated / BigInt(10 ** 18)),
        distributedTBURN: Number(catStatus.distributed / BigInt(10 ** 18)),
        remainingTBURN: Number(catStatus.remaining / BigInt(10 ** 18)),
        progressPercent: catStatus.totalAllocated > BigInt(0) 
          ? Number((catStatus.distributed * BigInt(10000)) / catStatus.totalAllocated) / 100
          : 100,
        nextUnlockDate: catStatus.nextUnlockDate?.toISOString() || null,
      };
    });

    res.json({
      success: true,
      data: {
        isSchedulerRunning: status.isRunning,
        totalDistributedTBURN: Number(status.totalDistributed / BigInt(10 ** 18)),
        pendingDistributions: status.pendingDistributions,
        failedDistributions: status.failedDistributions,
        categories: categorySummary,
      },
    });
  } catch (error: any) {
    console.error('[TokenomicsDistributionRoutes] Error getting summary:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get distribution summary',
      message: error.message 
    });
  }
});

export default router;
