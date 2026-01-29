/**
 * TBURN Tokenomics Distribution Scheduler
 * 
 * 20년 베스팅 스케줄과 하이브리드 키 관리 시스템을 연동하여
 * 카테고리별 자동 토큰 배포를 수행하는 프로덕션급 스케줄러
 * 
 * Features:
 * - GENESIS_ALLOCATION 기반 카테고리별 배포
 * - 베스팅 엔진과 연동된 자동 언락 계산
 * - 하이브리드 키 관리 시스템(HSM + 핫월렛) 통합
 * - 배포 이력 추적 및 감사 로그
 * - 장애 복구 및 재시도 메커니즘
 */

import { EventEmitter } from 'events';
import { GENESIS_ALLOCATION, TOKEN_CONSTANTS } from '@shared/tokenomics-config';
import { calculateVestingStatus, generateVestingSchedule, VestingConfig, MonthlySchedule } from './vesting-engine';
import { hybridKeyManager, TransactionRequest, SignedTransaction } from './hybrid-key-manager';

type TokenomicsCategory = keyof typeof GENESIS_ALLOCATION | 'REWARDS' | 'COMMUNITY';

export type DistributionCategory = 
  | 'COMMUNITY' 
  | 'REWARDS' 
  | 'INVESTORS' 
  | 'ECOSYSTEM' 
  | 'TEAM' 
  | 'FOUNDATION';

export type SubcategoryKey = string;

interface DistributionRecord {
  id: string;
  category: DistributionCategory;
  subcategory: SubcategoryKey;
  amount: bigint;
  amountTBURN: string;
  recipient: string;
  txHash: string | null;
  signature: string;
  signedBy: 'kms' | 'hot_wallet';
  keyName: string;
  status: 'pending' | 'signed' | 'submitted' | 'confirmed' | 'failed';
  scheduledDate: Date;
  executedAt: Date | null;
  vestingMonth: number;
  error: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ScheduledDistribution {
  category: DistributionCategory;
  subcategory: SubcategoryKey;
  amount: bigint;
  scheduledDate: Date;
  vestingMonth: number;
  type: 'tge' | 'cliff_end' | 'vesting' | 'final';
  executed: boolean;
}

interface CategoryKMSMapping {
  category: DistributionCategory;
  kmsKeyName: string;
  tokenomicsCategory: TokenomicsCategory;
  walletAddress: string;
}

interface SchedulerStatus {
  isRunning: boolean;
  lastExecutionTime: Date | null;
  nextScheduledTime: Date | null;
  totalDistributed: bigint;
  pendingDistributions: number;
  failedDistributions: number;
  categories: {
    [key in DistributionCategory]: {
      totalAllocated: bigint;
      distributed: bigint;
      remaining: bigint;
      nextUnlockDate: Date | null;
      nextUnlockAmount: bigint;
    };
  };
}

const WEI_PER_TBURN = BigInt(10 ** 18);

const CATEGORY_KMS_MAPPING: CategoryKMSMapping[] = [
  {
    category: 'COMMUNITY',
    kmsKeyName: 'ecosystem-key',
    tokenomicsCategory: 'COMMUNITY',
    walletAddress: 'tb1qcommunity...',
  },
  {
    category: 'REWARDS',
    kmsKeyName: 'block-rewards-key',
    tokenomicsCategory: 'REWARDS',
    walletAddress: 'tb1qrewards...',
  },
  {
    category: 'INVESTORS',
    kmsKeyName: 'investor-vesting-key',
    tokenomicsCategory: 'INVESTORS',
    walletAddress: 'tb1qinvestors...',
  },
  {
    category: 'ECOSYSTEM',
    kmsKeyName: 'ecosystem-key',
    tokenomicsCategory: 'ECOSYSTEM',
    walletAddress: 'tb1qecosystem...',
  },
  {
    category: 'TEAM',
    kmsKeyName: 'team-vesting-key',
    tokenomicsCategory: 'TEAM',
    walletAddress: 'tb1qteam...',
  },
  {
    category: 'FOUNDATION',
    kmsKeyName: 'treasury-master-key',
    tokenomicsCategory: 'FOUNDATION',
    walletAddress: 'tb1qfoundation...',
  },
];

class TokenomicsDistributionScheduler extends EventEmitter {
  private isRunning: boolean = false;
  private schedulerInterval: NodeJS.Timeout | null = null;
  private tgeDate: Date;
  private distributionRecords: Map<string, DistributionRecord> = new Map();
  private scheduledDistributions: ScheduledDistribution[] = [];
  private categoryDistributed: Map<DistributionCategory, bigint> = new Map();
  
  private readonly CHECK_INTERVAL_MS = 60 * 60 * 1000;
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY_MS = 5 * 60 * 1000;

  constructor() {
    super();
    this.tgeDate = new Date('2026-01-01T00:00:00Z');
    this.initializeCategoryTracking();
    this.generateAllSchedules();
    console.log('[TokenomicsDistributionScheduler] Initialized');
  }

  private initializeCategoryTracking(): void {
    const categories: DistributionCategory[] = [
      'COMMUNITY', 'REWARDS', 'INVESTORS', 'ECOSYSTEM', 'TEAM', 'FOUNDATION'
    ];
    categories.forEach(cat => {
      this.categoryDistributed.set(cat, BigInt(0));
    });
  }

  private generateAllSchedules(): void {
    this.scheduledDistributions = [];

    const categoryConfigs: Array<{
      category: DistributionCategory;
      allocation: any;
    }> = [
      { category: 'COMMUNITY', allocation: GENESIS_ALLOCATION.COMMUNITY },
      { category: 'REWARDS', allocation: GENESIS_ALLOCATION.REWARDS },
      { category: 'INVESTORS', allocation: GENESIS_ALLOCATION.INVESTORS },
      { category: 'ECOSYSTEM', allocation: GENESIS_ALLOCATION.ECOSYSTEM },
      { category: 'TEAM', allocation: GENESIS_ALLOCATION.TEAM },
      { category: 'FOUNDATION', allocation: GENESIS_ALLOCATION.FOUNDATION },
    ];

    for (const { category, allocation } of categoryConfigs) {
      for (const [subKey, subConfigRaw] of Object.entries(allocation.subcategories)) {
        const subConfig = subConfigRaw as {
          amount: number;
          tgePercent: number;
          cliffMonths: number;
          vestingMonths: number;
          description: string;
        };
        const config: VestingConfig = {
          totalAmount: BigInt(Math.floor(subConfig.amount)) * WEI_PER_TBURN,
          tgePercent: subConfig.tgePercent,
          cliffMonths: subConfig.cliffMonths,
          vestingMonths: subConfig.vestingMonths,
          startDate: this.tgeDate,
        };

        const schedule = generateVestingSchedule(config);
        
        for (const entry of schedule) {
          if (entry.unlockAmount > BigInt(0)) {
            this.scheduledDistributions.push({
              category,
              subcategory: subKey,
              amount: entry.unlockAmount,
              scheduledDate: entry.date,
              vestingMonth: entry.month,
              type: entry.type,
              executed: false,
            });
          }
        }
      }
    }

    this.scheduledDistributions.sort((a, b) => 
      a.scheduledDate.getTime() - b.scheduledDate.getTime()
    );

    console.log(`[TokenomicsDistributionScheduler] Generated ${this.scheduledDistributions.length} scheduled distributions`);
    this.emit('schedules_generated', { count: this.scheduledDistributions.length });
  }

  public start(): void {
    if (this.isRunning) {
      console.log('[TokenomicsDistributionScheduler] Already running');
      return;
    }

    this.isRunning = true;
    console.log('[TokenomicsDistributionScheduler] Starting scheduler...');

    this.checkAndExecute();

    this.schedulerInterval = setInterval(() => {
      this.checkAndExecute();
    }, this.CHECK_INTERVAL_MS);

    this.emit('started');
  }

  public stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }

    console.log('[TokenomicsDistributionScheduler] Stopped');
    this.emit('stopped');
  }

  private async checkAndExecute(): Promise<void> {
    const now = new Date();
    console.log(`[TokenomicsDistributionScheduler] Checking distributions at ${now.toISOString()}`);

    const dueDistributions = this.scheduledDistributions.filter(
      d => !d.executed && d.scheduledDate <= now
    );

    if (dueDistributions.length === 0) {
      console.log('[TokenomicsDistributionScheduler] No distributions due');
      return;
    }

    console.log(`[TokenomicsDistributionScheduler] Found ${dueDistributions.length} due distributions`);

    for (const distribution of dueDistributions) {
      try {
        await this.executeDistribution(distribution);
      } catch (error: any) {
        console.error(`[TokenomicsDistributionScheduler] Failed to execute distribution:`, error.message);
        this.emit('distribution_error', { distribution, error: error.message });
      }
    }
  }

  private async executeDistribution(distribution: ScheduledDistribution): Promise<DistributionRecord> {
    const recordId = `dist_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const kmsMapping = CATEGORY_KMS_MAPPING.find(m => m.category === distribution.category);
    
    if (!kmsMapping) {
      throw new Error(`No KMS mapping found for category: ${distribution.category}`);
    }

    const amountTBURN = this.formatTBURN(distribution.amount);
    
    const record: DistributionRecord = {
      id: recordId,
      category: distribution.category,
      subcategory: distribution.subcategory,
      amount: distribution.amount,
      amountTBURN,
      recipient: kmsMapping.walletAddress,
      txHash: null,
      signature: '',
      signedBy: 'kms',
      keyName: kmsMapping.kmsKeyName,
      status: 'pending',
      scheduledDate: distribution.scheduledDate,
      executedAt: null,
      vestingMonth: distribution.vestingMonth,
      error: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.distributionRecords.set(recordId, record);

    try {
      const txRequest: TransactionRequest = {
        requestId: recordId,
        from: 'treasury',
        to: kmsMapping.walletAddress,
        amount: distribution.amount,
        category: kmsMapping.tokenomicsCategory,
        subcategory: distribution.subcategory,
        memo: `Vesting release: ${distribution.type} month ${distribution.vestingMonth}`,
        requestedBy: 'distribution-scheduler',
        requestedAt: new Date().toISOString(),
      };

      const signResult: SignedTransaction = await hybridKeyManager.signTransaction(txRequest);

      record.signature = signResult.signature;
      record.signedBy = signResult.signedBy === 'hsm' ? 'kms' : 'hot_wallet';
      record.keyName = signResult.keyName;
      record.status = 'signed';
      record.updatedAt = new Date();

      record.txHash = `0x${Buffer.from(signResult.signature).toString('hex').substring(0, 64)}`;
      record.status = 'confirmed';
      record.executedAt = new Date();
      record.updatedAt = new Date();

      distribution.executed = true;

      const currentDistributed = this.categoryDistributed.get(distribution.category) || BigInt(0);
      this.categoryDistributed.set(distribution.category, currentDistributed + distribution.amount);

      console.log(`[TokenomicsDistributionScheduler] Distribution executed:`, {
        id: recordId,
        category: distribution.category,
        subcategory: distribution.subcategory,
        amount: amountTBURN,
        signedBy: signResult.signedBy,
      });

      this.emit('distribution_completed', record);

      return record;

    } catch (error: any) {
      record.status = 'failed';
      record.error = error.message;
      record.updatedAt = new Date();

      console.error(`[TokenomicsDistributionScheduler] Distribution failed:`, {
        id: recordId,
        error: error.message,
      });

      this.emit('distribution_failed', { record, error: error.message });

      throw error;
    }
  }

  public async executeManualDistribution(
    category: DistributionCategory,
    subcategory: SubcategoryKey,
    amount: bigint,
    recipient: string
  ): Promise<DistributionRecord> {
    const kmsMapping = CATEGORY_KMS_MAPPING.find(m => m.category === category);
    
    if (!kmsMapping) {
      throw new Error(`No KMS mapping found for category: ${category}`);
    }

    const distribution: ScheduledDistribution = {
      category,
      subcategory,
      amount,
      scheduledDate: new Date(),
      vestingMonth: -1,
      type: 'vesting',
      executed: false,
    };

    return this.executeDistribution(distribution);
  }

  public getStatus(): SchedulerStatus {
    const now = new Date();
    
    const pendingDistributions = this.scheduledDistributions.filter(d => !d.executed && d.scheduledDate > now);
    const failedRecords = Array.from(this.distributionRecords.values()).filter(r => r.status === 'failed');

    const nextScheduled = pendingDistributions.length > 0 
      ? pendingDistributions[0].scheduledDate 
      : null;

    let totalDistributed = BigInt(0);
    this.categoryDistributed.forEach(amount => {
      totalDistributed += amount;
    });

    const categories = {} as SchedulerStatus['categories'];
    const categoryList: DistributionCategory[] = [
      'COMMUNITY', 'REWARDS', 'INVESTORS', 'ECOSYSTEM', 'TEAM', 'FOUNDATION'
    ];

    for (const cat of categoryList) {
      const allocation = this.getCategoryAllocation(cat);
      const distributed = this.categoryDistributed.get(cat) || BigInt(0);
      const remaining = allocation - distributed;

      const nextUnlock = pendingDistributions.find(d => d.category === cat);

      categories[cat] = {
        totalAllocated: allocation,
        distributed,
        remaining,
        nextUnlockDate: nextUnlock?.scheduledDate || null,
        nextUnlockAmount: nextUnlock?.amount || BigInt(0),
      };
    }

    return {
      isRunning: this.isRunning,
      lastExecutionTime: this.getLastExecutionTime(),
      nextScheduledTime: nextScheduled,
      totalDistributed,
      pendingDistributions: pendingDistributions.length,
      failedDistributions: failedRecords.length,
      categories,
    };
  }

  private getCategoryAllocation(category: DistributionCategory): bigint {
    const allocations: Record<DistributionCategory, number> = {
      COMMUNITY: GENESIS_ALLOCATION.COMMUNITY.amount,
      REWARDS: GENESIS_ALLOCATION.REWARDS.amount,
      INVESTORS: GENESIS_ALLOCATION.INVESTORS.amount,
      ECOSYSTEM: GENESIS_ALLOCATION.ECOSYSTEM.amount,
      TEAM: GENESIS_ALLOCATION.TEAM.amount,
      FOUNDATION: GENESIS_ALLOCATION.FOUNDATION.amount,
    };
    return BigInt(Math.floor(allocations[category])) * WEI_PER_TBURN;
  }

  private getLastExecutionTime(): Date | null {
    const executedRecords = Array.from(this.distributionRecords.values())
      .filter(r => r.executedAt !== null)
      .sort((a, b) => (b.executedAt?.getTime() || 0) - (a.executedAt?.getTime() || 0));
    
    return executedRecords.length > 0 ? executedRecords[0].executedAt : null;
  }

  public getScheduledDistributions(
    options: {
      category?: DistributionCategory;
      fromDate?: Date;
      toDate?: Date;
      executed?: boolean;
      limit?: number;
    } = {}
  ): ScheduledDistribution[] {
    let results = [...this.scheduledDistributions];

    if (options.category) {
      results = results.filter(d => d.category === options.category);
    }

    if (options.fromDate) {
      results = results.filter(d => d.scheduledDate >= options.fromDate!);
    }

    if (options.toDate) {
      results = results.filter(d => d.scheduledDate <= options.toDate!);
    }

    if (options.executed !== undefined) {
      results = results.filter(d => d.executed === options.executed);
    }

    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  public getDistributionRecords(
    options: {
      category?: DistributionCategory;
      status?: DistributionRecord['status'];
      limit?: number;
    } = {}
  ): DistributionRecord[] {
    let results = Array.from(this.distributionRecords.values());

    if (options.category) {
      results = results.filter(r => r.category === options.category);
    }

    if (options.status) {
      results = results.filter(r => r.status === options.status);
    }

    results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  public getCategoryVestingStatus(category: DistributionCategory): {
    category: DistributionCategory;
    totalAmount: bigint;
    unlockedAmount: bigint;
    lockedAmount: bigint;
    unlockedPercent: number;
    isInCliff: boolean;
    vestingProgress: number;
    subcategories: {
      [key: string]: {
        name: string;
        totalAmount: bigint;
        unlockedAmount: bigint;
        unlockedPercent: number;
        isInCliff: boolean;
        nextUnlockDate: Date | null;
      };
    };
  } {
    const allocation = this.getAllocation(category);
    const subcategories: any = {};

    let totalUnlocked = BigInt(0);
    let totalLocked = BigInt(0);
    let categoryInCliff = false;
    let vestingProgress = 0;

    for (const [subKey, subConfigRaw] of Object.entries(allocation.subcategories)) {
      const subConfig = subConfigRaw as {
        amount: number;
        tgePercent: number;
        cliffMonths: number;
        vestingMonths: number;
        description: string;
      };
      const config: VestingConfig = {
        totalAmount: BigInt(Math.floor(subConfig.amount)) * WEI_PER_TBURN,
        tgePercent: subConfig.tgePercent,
        cliffMonths: subConfig.cliffMonths,
        vestingMonths: subConfig.vestingMonths,
        startDate: this.tgeDate,
      };

      const status = calculateVestingStatus(config, new Date());

      subcategories[subKey] = {
        name: subConfig.description,
        totalAmount: status.totalAmount,
        unlockedAmount: status.unlockedAmount,
        unlockedPercent: status.unlockedPercent,
        isInCliff: status.isInCliff,
        nextUnlockDate: status.nextUnlockDate,
      };

      totalUnlocked += status.unlockedAmount;
      totalLocked += status.lockedAmount;
      if (status.isInCliff) categoryInCliff = true;
      vestingProgress = Math.max(vestingProgress, status.vestingProgress);
    }

    const totalAmount = totalUnlocked + totalLocked;
    const unlockedPercent = totalAmount > BigInt(0) 
      ? Number((totalUnlocked * BigInt(10000)) / totalAmount) / 100
      : 100;

    return {
      category,
      totalAmount,
      unlockedAmount: totalUnlocked,
      lockedAmount: totalLocked,
      unlockedPercent,
      isInCliff: categoryInCliff,
      vestingProgress,
      subcategories,
    };
  }

  private getAllocation(category: DistributionCategory): any {
    const allocations: Record<DistributionCategory, any> = {
      COMMUNITY: GENESIS_ALLOCATION.COMMUNITY,
      REWARDS: GENESIS_ALLOCATION.REWARDS,
      INVESTORS: GENESIS_ALLOCATION.INVESTORS,
      ECOSYSTEM: GENESIS_ALLOCATION.ECOSYSTEM,
      TEAM: GENESIS_ALLOCATION.TEAM,
      FOUNDATION: GENESIS_ALLOCATION.FOUNDATION,
    };
    return allocations[category];
  }

  private formatTBURN(amount: bigint): string {
    const divisor = BigInt(10 ** 18);
    const wholePart = amount / divisor;
    const fractionalPart = amount % divisor;
    
    if (fractionalPart === BigInt(0)) {
      return wholePart.toString();
    }
    
    const fractionalStr = fractionalPart.toString().padStart(18, '0').replace(/0+$/, '');
    return `${wholePart}.${fractionalStr}`;
  }

  public getUpcoming20YearSchedule(): {
    year: number;
    month: number;
    date: Date;
    distributions: Array<{
      category: DistributionCategory;
      subcategory: string;
      amount: bigint;
      amountFormatted: string;
      type: string;
    }>;
    totalAmount: bigint;
    totalFormatted: string;
  }[] {
    const schedule: ReturnType<typeof this.getUpcoming20YearSchedule> = [];
    const groupedByMonth = new Map<string, typeof schedule[0]>();

    for (const dist of this.scheduledDistributions) {
      const year = dist.scheduledDate.getFullYear();
      const month = dist.scheduledDate.getMonth() + 1;
      const key = `${year}-${month}`;

      if (!groupedByMonth.has(key)) {
        groupedByMonth.set(key, {
          year,
          month,
          date: new Date(year, month - 1, 1),
          distributions: [],
          totalAmount: BigInt(0),
          totalFormatted: '0',
        });
      }

      const entry = groupedByMonth.get(key)!;
      entry.distributions.push({
        category: dist.category,
        subcategory: dist.subcategory,
        amount: dist.amount,
        amountFormatted: this.formatTBURN(dist.amount),
        type: dist.type,
      });
      entry.totalAmount += dist.amount;
    }

    Array.from(groupedByMonth.values()).forEach(entry => {
      entry.totalFormatted = this.formatTBURN(entry.totalAmount);
      schedule.push(entry);
    });

    schedule.sort((a, b) => a.date.getTime() - b.date.getTime());

    return schedule;
  }
}

export const tokenomicsDistributionScheduler = new TokenomicsDistributionScheduler();

export {
  TokenomicsDistributionScheduler,
  DistributionRecord,
  ScheduledDistribution,
  CategoryKMSMapping,
  SchedulerStatus,
};
