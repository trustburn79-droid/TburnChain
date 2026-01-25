/**
 * TBURN Tokenomics v4.3 Enterprise Validator
 * 
 * Production-grade validation utility for tokenomics configuration
 * Validates GENESIS_ALLOCATION against official v4.3 documentation
 */

import { GENESIS_ALLOCATION, BILLION } from '../../shared/tokenomics-config';

// Official v4.3 Documentation Reference Matrix
const OFFICIAL_V43_VESTING_MATRIX = {
  // COMMUNITY: 30% = 30억 TBURN
  COMMUNITY: {
    AIRDROP: { amount: 12, tgePercent: 10, cliffMonths: 0, vestingMonths: 12 },
    REFERRAL: { amount: 3, tgePercent: 5, cliffMonths: 0, vestingMonths: 36 },
    EVENTS: { amount: 4, tgePercent: 10, cliffMonths: 0, vestingMonths: 24 },
    COMMUNITY_ACTIVITY: { amount: 3, tgePercent: 0, cliffMonths: 3, vestingMonths: 36 },
    DAO_TREASURY: { amount: 8, tgePercent: 0, cliffMonths: 12, vestingMonths: 48 },
  },
  // REWARDS: 22% = 22억 TBURN
  REWARDS: {
    BLOCK_REWARDS: { amount: 14.5, tgePercent: 0, cliffMonths: 0, vestingMonths: 240 },
    VALIDATOR_INCENTIVES: { amount: 7.5, tgePercent: 0, cliffMonths: 0, vestingMonths: 60 },
  },
  // INVESTORS: 20% = 20억 TBURN
  INVESTORS: {
    SEED_ROUND: { amount: 5, tgePercent: 0, cliffMonths: 12, vestingMonths: 24 },
    PRIVATE_ROUND: { amount: 9, tgePercent: 5, cliffMonths: 9, vestingMonths: 18 },
    PUBLIC_SALE: { amount: 6, tgePercent: 15, cliffMonths: 3, vestingMonths: 9 },
  },
  // ECOSYSTEM: 14% = 14억 TBURN
  ECOSYSTEM: {
    ECOSYSTEM_FUND: { amount: 7, tgePercent: 0, cliffMonths: 0, vestingMonths: 60 },
    PARTNERSHIP: { amount: 4, tgePercent: 0, cliffMonths: 6, vestingMonths: 24 },
    MARKETING: { amount: 3, tgePercent: 15, cliffMonths: 0, vestingMonths: 24 },
  },
  // TEAM: 11% = 11억 TBURN
  TEAM: {
    CORE_TEAM: { amount: 7, tgePercent: 0, cliffMonths: 18, vestingMonths: 36 },
    ADVISOR: { amount: 2, tgePercent: 0, cliffMonths: 12, vestingMonths: 24 },
    STRATEGIC_PARTNER: { amount: 2, tgePercent: 0, cliffMonths: 6, vestingMonths: 18 },
  },
  // FOUNDATION: 3% = 3억 TBURN
  FOUNDATION: {
    OPERATIONS_RESERVE: { amount: 1.5, tgePercent: 30, cliffMonths: 0, vestingMonths: 24 },
    EMERGENCY_RESERVE: { amount: 1, tgePercent: 50, cliffMonths: 0, vestingMonths: 12 },
    STRATEGIC_INVESTMENT: { amount: 0.5, tgePercent: 0, cliffMonths: 6, vestingMonths: 18 },
  },
} as const;

// Official v4.3 Category Percentages
const OFFICIAL_CATEGORY_PERCENTAGES = {
  COMMUNITY: 30,
  REWARDS: 22,
  INVESTORS: 20,
  ECOSYSTEM: 14,
  TEAM: 11,
  FOUNDATION: 3,
} as const;

export interface ValidationResult {
  passed: boolean;
  category: string;
  subcategory: string;
  field: string;
  expected: number;
  actual: number;
  message: string;
}

export interface ValidationReport {
  timestamp: string;
  version: string;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  successRate: number;
  results: ValidationResult[];
  summary: {
    categoryPercentages: { passed: boolean; details: string };
    totalSupply: { passed: boolean; details: string };
    vestingSchedules: { passed: boolean; details: string };
    amountAllocations: { passed: boolean; details: string };
  };
}

/**
 * Validate GENESIS_ALLOCATION against official v4.3 documentation
 */
export function validateTokenomicsConfig(): ValidationReport {
  const results: ValidationResult[] = [];
  
  // 1. Validate Category Percentages
  const categories = ['COMMUNITY', 'REWARDS', 'INVESTORS', 'ECOSYSTEM', 'TEAM', 'FOUNDATION'] as const;
  
  for (const category of categories) {
    const expected = OFFICIAL_CATEGORY_PERCENTAGES[category];
    const actual = GENESIS_ALLOCATION[category].percentage;
    
    results.push({
      passed: expected === actual,
      category,
      subcategory: '-',
      field: 'percentage',
      expected,
      actual,
      message: expected === actual 
        ? `✅ ${category} percentage matches: ${actual}%`
        : `❌ ${category} percentage mismatch: expected ${expected}%, got ${actual}%`,
    });
  }
  
  // 2. Validate Total Supply
  const totalSupply = GENESIS_ALLOCATION.TOTAL_SUPPLY;
  const expectedTotalSupply = 10 * BILLION;
  results.push({
    passed: totalSupply === expectedTotalSupply,
    category: 'TOTAL_SUPPLY',
    subcategory: '-',
    field: 'amount',
    expected: expectedTotalSupply,
    actual: totalSupply,
    message: totalSupply === expectedTotalSupply
      ? `✅ Total supply matches: ${totalSupply.toLocaleString()} TBURN`
      : `❌ Total supply mismatch: expected ${expectedTotalSupply.toLocaleString()}, got ${totalSupply.toLocaleString()}`,
  });
  
  // 3. Validate each subcategory's vesting schedule
  for (const [category, subcats] of Object.entries(OFFICIAL_V43_VESTING_MATRIX)) {
    for (const [subcat, expected] of Object.entries(subcats)) {
      const categoryData = GENESIS_ALLOCATION[category as keyof typeof GENESIS_ALLOCATION];
      
      if (typeof categoryData === 'object' && categoryData !== null && 'subcategories' in categoryData) {
        const subcatData = (categoryData.subcategories as any)[subcat];
        
        if (!subcatData) {
          results.push({
            passed: false,
            category,
            subcategory: subcat,
            field: 'existence',
            expected: 1,
            actual: 0,
            message: `❌ ${category}.${subcat} not found in GENESIS_ALLOCATION`,
          });
          continue;
        }
        
        // Check amount (in billions)
        const expectedAmount = expected.amount * BILLION / 10; // Convert to TBURN
        const actualAmount = subcatData.amount;
        results.push({
          passed: Math.abs(actualAmount - expectedAmount) < 1000, // Allow small tolerance
          category,
          subcategory: subcat,
          field: 'amount',
          expected: expectedAmount,
          actual: actualAmount,
          message: Math.abs(actualAmount - expectedAmount) < 1000
            ? `✅ ${category}.${subcat} amount matches: ${(actualAmount / BILLION * 10).toFixed(2)}억`
            : `❌ ${category}.${subcat} amount mismatch: expected ${expected.amount}억, got ${(actualAmount / BILLION * 10).toFixed(2)}억`,
        });
        
        // Check TGE percent
        const actualTge = subcatData.tgePercent ?? -1;
        results.push({
          passed: actualTge === expected.tgePercent,
          category,
          subcategory: subcat,
          field: 'tgePercent',
          expected: expected.tgePercent,
          actual: actualTge,
          message: actualTge === expected.tgePercent
            ? `✅ ${category}.${subcat} TGE matches: ${actualTge}%`
            : `❌ ${category}.${subcat} TGE mismatch: expected ${expected.tgePercent}%, got ${actualTge}%`,
        });
        
        // Check cliff months
        const actualCliff = subcatData.cliffMonths ?? -1;
        results.push({
          passed: actualCliff === expected.cliffMonths,
          category,
          subcategory: subcat,
          field: 'cliffMonths',
          expected: expected.cliffMonths,
          actual: actualCliff,
          message: actualCliff === expected.cliffMonths
            ? `✅ ${category}.${subcat} cliff matches: ${actualCliff}M`
            : `❌ ${category}.${subcat} cliff mismatch: expected ${expected.cliffMonths}M, got ${actualCliff}M`,
        });
        
        // Check vesting months
        const actualVesting = subcatData.vestingMonths ?? -1;
        results.push({
          passed: actualVesting === expected.vestingMonths,
          category,
          subcategory: subcat,
          field: 'vestingMonths',
          expected: expected.vestingMonths,
          actual: actualVesting,
          message: actualVesting === expected.vestingMonths
            ? `✅ ${category}.${subcat} vesting matches: ${actualVesting}M`
            : `❌ ${category}.${subcat} vesting mismatch: expected ${expected.vestingMonths}M, got ${actualVesting}M`,
        });
      }
    }
  }
  
  // Calculate summary
  const passedChecks = results.filter(r => r.passed).length;
  const failedChecks = results.filter(r => !r.passed).length;
  const totalChecks = results.length;
  
  const categoryResults = results.filter(r => r.field === 'percentage');
  const amountResults = results.filter(r => r.field === 'amount');
  const vestingResults = results.filter(r => ['tgePercent', 'cliffMonths', 'vestingMonths'].includes(r.field));
  
  return {
    timestamp: new Date().toISOString(),
    version: 'v4.3',
    totalChecks,
    passedChecks,
    failedChecks,
    successRate: Math.round((passedChecks / totalChecks) * 100 * 100) / 100,
    results,
    summary: {
      categoryPercentages: {
        passed: categoryResults.every(r => r.passed),
        details: `${categoryResults.filter(r => r.passed).length}/${categoryResults.length} categories match`,
      },
      totalSupply: {
        passed: results.find(r => r.category === 'TOTAL_SUPPLY')?.passed ?? false,
        details: 'Total supply: 100억 TBURN',
      },
      vestingSchedules: {
        passed: vestingResults.every(r => r.passed),
        details: `${vestingResults.filter(r => r.passed).length}/${vestingResults.length} vesting configs match`,
      },
      amountAllocations: {
        passed: amountResults.every(r => r.passed),
        details: `${amountResults.filter(r => r.passed).length}/${amountResults.length} amounts match`,
      },
    },
  };
}

/**
 * Validate custody transactions against GENESIS_ALLOCATION
 */
export function validateCustodyTransactions(
  transactions: Array<{
    transaction_type: string;
    amount: string;
    tge_percent: number;
    cliff_months: number;
    vesting_months: number;
  }>
): ValidationReport {
  const results: ValidationResult[] = [];
  
  // Map transaction types to GENESIS_ALLOCATION keys
  const typeMapping: Record<string, { category: string; subcategory: string }> = {
    airdrop: { category: 'COMMUNITY', subcategory: 'AIRDROP' },
    community_referral: { category: 'COMMUNITY', subcategory: 'REFERRAL' },
    community_events: { category: 'COMMUNITY', subcategory: 'EVENTS' },
    community_activity: { category: 'COMMUNITY', subcategory: 'COMMUNITY_ACTIVITY' },
    dao_treasury: { category: 'COMMUNITY', subcategory: 'DAO_TREASURY' },
    block_rewards: { category: 'REWARDS', subcategory: 'BLOCK_REWARDS' },
    validator_incentives: { category: 'REWARDS', subcategory: 'VALIDATOR_INCENTIVES' },
    seed_round: { category: 'INVESTORS', subcategory: 'SEED_ROUND' },
    private_round: { category: 'INVESTORS', subcategory: 'PRIVATE_ROUND' },
    public_sale: { category: 'INVESTORS', subcategory: 'PUBLIC_SALE' },
    ecosystem_fund: { category: 'ECOSYSTEM', subcategory: 'ECOSYSTEM_FUND' },
    partnership: { category: 'ECOSYSTEM', subcategory: 'PARTNERSHIP' },
    marketing: { category: 'ECOSYSTEM', subcategory: 'MARKETING' },
    core_team: { category: 'TEAM', subcategory: 'CORE_TEAM' },
    advisors: { category: 'TEAM', subcategory: 'ADVISOR' },
    strategic_partner: { category: 'TEAM', subcategory: 'STRATEGIC_PARTNER' },
    operations_reserve: { category: 'FOUNDATION', subcategory: 'OPERATIONS_RESERVE' },
    emergency_reserve: { category: 'FOUNDATION', subcategory: 'EMERGENCY_RESERVE' },
    strategic_investment: { category: 'FOUNDATION', subcategory: 'STRATEGIC_INVESTMENT' },
  };
  
  for (const tx of transactions) {
    const mapping = typeMapping[tx.transaction_type];
    if (!mapping) {
      results.push({
        passed: false,
        category: 'UNKNOWN',
        subcategory: tx.transaction_type,
        field: 'mapping',
        expected: 1,
        actual: 0,
        message: `❌ Unknown transaction type: ${tx.transaction_type}`,
      });
      continue;
    }
    
    const categoryMatrix = OFFICIAL_V43_VESTING_MATRIX[mapping.category as keyof typeof OFFICIAL_V43_VESTING_MATRIX];
    const expected = categoryMatrix ? (categoryMatrix as Record<string, typeof categoryMatrix[keyof typeof categoryMatrix]>)[mapping.subcategory] : undefined;
    if (!expected) continue;
    
    // Check TGE
    results.push({
      passed: tx.tge_percent === expected.tgePercent,
      category: mapping.category,
      subcategory: mapping.subcategory,
      field: 'tgePercent',
      expected: expected.tgePercent,
      actual: tx.tge_percent,
      message: tx.tge_percent === expected.tgePercent
        ? `✅ ${tx.transaction_type} TGE matches: ${tx.tge_percent}%`
        : `❌ ${tx.transaction_type} TGE mismatch: expected ${expected.tgePercent}%, got ${tx.tge_percent}%`,
    });
    
    // Check cliff
    results.push({
      passed: tx.cliff_months === expected.cliffMonths,
      category: mapping.category,
      subcategory: mapping.subcategory,
      field: 'cliffMonths',
      expected: expected.cliffMonths,
      actual: tx.cliff_months,
      message: tx.cliff_months === expected.cliffMonths
        ? `✅ ${tx.transaction_type} cliff matches: ${tx.cliff_months}M`
        : `❌ ${tx.transaction_type} cliff mismatch: expected ${expected.cliffMonths}M, got ${tx.cliff_months}M`,
    });
    
    // Check vesting
    results.push({
      passed: tx.vesting_months === expected.vestingMonths,
      category: mapping.category,
      subcategory: mapping.subcategory,
      field: 'vestingMonths',
      expected: expected.vestingMonths,
      actual: tx.vesting_months,
      message: tx.vesting_months === expected.vestingMonths
        ? `✅ ${tx.transaction_type} vesting matches: ${tx.vesting_months}M`
        : `❌ ${tx.transaction_type} vesting mismatch: expected ${expected.vestingMonths}M, got ${tx.vesting_months}M`,
    });
  }
  
  const passedChecks = results.filter(r => r.passed).length;
  const failedChecks = results.filter(r => !r.passed).length;
  const totalChecks = results.length;
  
  return {
    timestamp: new Date().toISOString(),
    version: 'v4.3',
    totalChecks,
    passedChecks,
    failedChecks,
    successRate: Math.round((passedChecks / totalChecks) * 100 * 100) / 100,
    results,
    summary: {
      categoryPercentages: { passed: true, details: 'N/A for custody validation' },
      totalSupply: { passed: true, details: 'N/A for custody validation' },
      vestingSchedules: {
        passed: results.every(r => r.passed),
        details: `${passedChecks}/${totalChecks} custody transactions match official v4.3`,
      },
      amountAllocations: { passed: true, details: 'N/A for custody validation' },
    },
  };
}

export default { validateTokenomicsConfig, validateCustodyTransactions };
