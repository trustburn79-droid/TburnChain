/**
 * TBURN Vesting Calculation Engine
 * Production-grade vesting logic supporting TGE, cliff, and linear vesting
 * 
 * Supports:
 * - TGE (Token Generation Event) immediate unlock percentage
 * - Cliff period (months) - no vesting during cliff
 * - Linear vesting over remaining months after cliff
 * - 20-year distribution schedule support (240 months)
 */

export interface VestingConfig {
  totalAmount: bigint;          // Total tokens in wei
  tgePercent: number;           // 0-100, percentage released at TGE
  cliffMonths: number;          // Cliff period in months (0-48)
  vestingMonths: number;        // Total vesting duration in months (0-240)
  startDate: Date;              // TGE date / vesting start
}

export interface VestingStatus {
  totalAmount: bigint;
  tgeAmount: bigint;            // Released at TGE
  vestedAmount: bigint;         // Released through vesting
  unlockedAmount: bigint;       // Total currently unlocked (TGE + vested)
  lockedAmount: bigint;         // Still locked
  unlockedPercent: number;      // 0-100
  lockedPercent: number;        // 0-100
  isInCliff: boolean;           // Currently in cliff period
  cliffEndDate: Date | null;
  vestingEndDate: Date;
  nextUnlockDate: Date | null;  // Next vesting release date
  nextUnlockAmount: bigint;     // Amount at next release
  monthsRemaining: number;
  vestingProgress: number;      // 0-100 progress through vesting period
}

export interface MonthlySchedule {
  month: number;                // 0-indexed from start
  date: Date;
  unlockAmount: bigint;
  cumulativeUnlocked: bigint;
  cumulativePercent: number;
  type: 'tge' | 'cliff_end' | 'vesting' | 'final';
}

const MONTHS_PER_YEAR = 12;
const MAX_VESTING_MONTHS = 240; // 20 years

/**
 * Calculate vesting status at a specific point in time
 */
export function calculateVestingStatus(
  config: VestingConfig,
  atDate: Date = new Date()
): VestingStatus {
  const { totalAmount, tgePercent, cliffMonths, vestingMonths, startDate } = config;
  
  // TGE amount (released immediately at start)
  const tgeAmount = (totalAmount * BigInt(tgePercent)) / BigInt(100);
  const vestableAmount = totalAmount - tgeAmount;
  
  // Calculate months elapsed since start
  const monthsElapsed = getMonthsDiff(startDate, atDate);
  
  // Calculate cliff end date
  const cliffEndDate = cliffMonths > 0 
    ? addMonths(startDate, cliffMonths) 
    : null;
  
  // Calculate vesting end date
  const vestingEndDate = addMonths(startDate, Math.max(vestingMonths, cliffMonths));
  
  // Check if in cliff period
  const isInCliff = cliffMonths > 0 && monthsElapsed < cliffMonths;
  
  // Calculate vested amount
  let vestedAmount = BigInt(0);
  
  if (!isInCliff && vestingMonths > 0) {
    // Months after cliff
    const vestingMonthsAfterCliff = vestingMonths - cliffMonths;
    const monthsVesting = Math.max(0, monthsElapsed - cliffMonths);
    
    if (vestingMonthsAfterCliff > 0) {
      // Linear vesting calculation
      const vestingRatio = Math.min(monthsVesting / vestingMonthsAfterCliff, 1);
      vestedAmount = BigInt(Math.floor(Number(vestableAmount) * vestingRatio));
    } else {
      // No vesting period after cliff - all released at cliff end
      vestedAmount = vestableAmount;
    }
  } else if (vestingMonths === 0 && cliffMonths === 0) {
    // Immediate full unlock (TGE 100%)
    vestedAmount = vestableAmount;
  }
  
  // Total unlocked
  const unlockedAmount = tgeAmount + vestedAmount;
  const lockedAmount = totalAmount - unlockedAmount;
  
  // Percentages
  const unlockedPercent = totalAmount > BigInt(0) 
    ? Number((unlockedAmount * BigInt(10000)) / totalAmount) / 100 
    : 100;
  const lockedPercent = 100 - unlockedPercent;
  
  // Next unlock calculation
  let nextUnlockDate: Date | null = null;
  let nextUnlockAmount = BigInt(0);
  
  if (lockedAmount > BigInt(0)) {
    if (isInCliff) {
      // Next unlock is at cliff end
      nextUnlockDate = cliffEndDate;
      const vestingMonthsAfterCliff = vestingMonths - cliffMonths;
      if (vestingMonthsAfterCliff > 0) {
        nextUnlockAmount = vestableAmount / BigInt(vestingMonthsAfterCliff);
      } else {
        nextUnlockAmount = vestableAmount;
      }
    } else {
      // Next month's vesting
      const currentVestingMonth = monthsElapsed - cliffMonths;
      const vestingMonthsAfterCliff = vestingMonths - cliffMonths;
      if (currentVestingMonth < vestingMonthsAfterCliff) {
        nextUnlockDate = addMonths(startDate, monthsElapsed + 1);
        nextUnlockAmount = vestableAmount / BigInt(vestingMonthsAfterCliff);
      }
    }
  }
  
  // Months remaining
  const monthsRemaining = Math.max(0, vestingMonths - monthsElapsed);
  
  // Vesting progress
  const vestingProgress = vestingMonths > 0 
    ? Math.min(100, (monthsElapsed / vestingMonths) * 100)
    : 100;
  
  return {
    totalAmount,
    tgeAmount,
    vestedAmount,
    unlockedAmount,
    lockedAmount,
    unlockedPercent: Math.round(unlockedPercent * 100) / 100,
    lockedPercent: Math.round(lockedPercent * 100) / 100,
    isInCliff,
    cliffEndDate,
    vestingEndDate,
    nextUnlockDate,
    nextUnlockAmount,
    monthsRemaining,
    vestingProgress: Math.round(vestingProgress * 100) / 100,
  };
}

/**
 * Generate full monthly schedule for vesting contract
 */
export function generateVestingSchedule(config: VestingConfig): MonthlySchedule[] {
  const { totalAmount, tgePercent, cliffMonths, vestingMonths, startDate } = config;
  const schedule: MonthlySchedule[] = [];
  
  const tgeAmount = (totalAmount * BigInt(tgePercent)) / BigInt(100);
  const vestableAmount = totalAmount - tgeAmount;
  const vestingMonthsAfterCliff = Math.max(0, vestingMonths - cliffMonths);
  
  // TGE release (month 0)
  if (tgePercent > 0) {
    schedule.push({
      month: 0,
      date: new Date(startDate),
      unlockAmount: tgeAmount,
      cumulativeUnlocked: tgeAmount,
      cumulativePercent: tgePercent,
      type: 'tge',
    });
  }
  
  // If immediate unlock (no vesting)
  if (vestingMonths === 0 && cliffMonths === 0) {
    if (tgePercent < 100) {
      schedule.push({
        month: 0,
        date: new Date(startDate),
        unlockAmount: vestableAmount,
        cumulativeUnlocked: totalAmount,
        cumulativePercent: 100,
        type: 'tge',
      });
    }
    return schedule;
  }
  
  // Monthly vesting after cliff
  const monthlyVestAmount = vestingMonthsAfterCliff > 0 
    ? vestableAmount / BigInt(vestingMonthsAfterCliff)
    : vestableAmount;
  
  let cumulative = tgeAmount;
  
  for (let month = cliffMonths; month <= vestingMonths; month++) {
    if (month === 0 && tgePercent > 0) continue; // Skip TGE month if already added
    
    const isCliffEnd = month === cliffMonths && cliffMonths > 0;
    const isFinal = month === vestingMonths;
    
    // Calculate remaining for final month to handle rounding
    let unlockAmount = monthlyVestAmount;
    if (isFinal) {
      unlockAmount = totalAmount - cumulative;
    }
    
    if (unlockAmount <= BigInt(0)) continue;
    
    cumulative += unlockAmount;
    const cumulativePercent = Number((cumulative * BigInt(10000)) / totalAmount) / 100;
    
    schedule.push({
      month,
      date: addMonths(startDate, month),
      unlockAmount,
      cumulativeUnlocked: cumulative,
      cumulativePercent: Math.round(cumulativePercent * 100) / 100,
      type: isCliffEnd ? 'cliff_end' : (isFinal ? 'final' : 'vesting'),
    });
  }
  
  return schedule;
}

/**
 * Get vesting configuration by transaction type
 * Maps custody transaction types to enterprise program vesting configs
 */
export function getVestingConfigByType(transactionType: string): {
  tgePercent: number;
  cliffMonths: number;
  vestingMonths: number;
  vestingEnabled: boolean;
} {
  const VESTING_CONFIGS: Record<string, { tge: number; cliff: number; vesting: number; enabled: boolean }> = {
    // Team & Advisors - 4 year vesting, 1 year cliff
    team_allocation: { tge: 0, cliff: 12, vesting: 48, enabled: true },
    advisor_allocation: { tge: 0, cliff: 12, vesting: 36, enabled: true },
    
    // Investors - Various terms
    seed_round: { tge: 5, cliff: 6, vesting: 24, enabled: true },
    private_round: { tge: 10, cliff: 3, vesting: 18, enabled: true },
    public_round: { tge: 25, cliff: 0, vesting: 12, enabled: true },
    strategic_partner: { tge: 0, cliff: 6, vesting: 24, enabled: true },
    
    // Ecosystem
    ecosystem_grant: { tge: 20, cliff: 3, vesting: 24, enabled: true },
    ecosystem_fund: { tge: 10, cliff: 6, vesting: 36, enabled: true },
    
    // Community programs - Faster unlock
    airdrop: { tge: 50, cliff: 0, vesting: 6, enabled: true },
    community: { tge: 30, cliff: 0, vesting: 12, enabled: true },
    referral: { tge: 50, cliff: 0, vesting: 6, enabled: true },
    
    // Staking & Rewards - Immediate or short-term
    staking_rewards: { tge: 100, cliff: 0, vesting: 0, enabled: false },
    validator_rewards: { tge: 100, cliff: 0, vesting: 0, enabled: false },
    block_rewards: { tge: 100, cliff: 0, vesting: 0, enabled: false },
    
    // Operations - Immediate
    operational: { tge: 100, cliff: 0, vesting: 0, enabled: false },
    infrastructure: { tge: 100, cliff: 0, vesting: 0, enabled: false },
    
    // Marketing & Exchange
    marketing: { tge: 25, cliff: 0, vesting: 12, enabled: true },
    exchange_listing: { tge: 50, cliff: 0, vesting: 6, enabled: true },
    
    // Reserve & Security
    reserve: { tge: 0, cliff: 12, vesting: 60, enabled: true },
    security: { tge: 100, cliff: 0, vesting: 0, enabled: false },
    
    // DAO
    dao_treasury: { tge: 10, cliff: 6, vesting: 48, enabled: true },
    dao_governance: { tge: 10, cliff: 6, vesting: 48, enabled: true },
    
    // Default - No vesting
    default: { tge: 100, cliff: 0, vesting: 0, enabled: false },
  };
  
  const config = VESTING_CONFIGS[transactionType] || VESTING_CONFIGS.default;
  
  return {
    tgePercent: config.tge,
    cliffMonths: config.cliff,
    vestingMonths: config.vesting,
    vestingEnabled: config.enabled,
  };
}

/**
 * Format amount for display (TBURN with 8 decimals)
 */
export function formatTBURN(amountWei: bigint, decimals: number = 8): string {
  const divisor = BigInt(10) ** BigInt(decimals);
  const whole = amountWei / divisor;
  const remainder = amountWei % divisor;
  
  if (remainder === BigInt(0)) {
    return whole.toLocaleString();
  }
  
  const remainderStr = remainder.toString().padStart(decimals, '0');
  const trimmed = remainderStr.replace(/0+$/, '');
  return `${whole.toLocaleString()}.${trimmed}`;
}

/**
 * Parse TBURN amount string to bigint wei
 */
export function parseTBURN(amount: string, decimals: number = 8): bigint {
  const cleanAmount = amount.replace(/,/g, '');
  const parts = cleanAmount.split('.');
  const whole = BigInt(parts[0] || '0');
  
  let fractional = BigInt(0);
  if (parts[1]) {
    const fracStr = parts[1].padEnd(decimals, '0').slice(0, decimals);
    fractional = BigInt(fracStr);
  }
  
  const divisor = BigInt(10) ** BigInt(decimals);
  return whole * divisor + fractional;
}

// Helper: Add months to date
function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

// Helper: Get months difference between dates
function getMonthsDiff(start: Date, end: Date): number {
  const years = end.getFullYear() - start.getFullYear();
  const months = end.getMonth() - start.getMonth();
  const days = end.getDate() - start.getDate();
  
  let totalMonths = years * 12 + months;
  
  // If we haven't reached the day of month yet, subtract one month
  if (days < 0) {
    totalMonths -= 1;
  }
  
  return Math.max(0, totalMonths);
}

export const VestingEngine = {
  calculateVestingStatus,
  generateVestingSchedule,
  getVestingConfigByType,
  formatTBURN,
  parseTBURN,
  MAX_VESTING_MONTHS,
};

export default VestingEngine;
