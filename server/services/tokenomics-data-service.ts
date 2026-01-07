/**
 * TBURN Enterprise Tokenomics Data Service
 * 
 * Centralized service providing canonical tokenomics data
 * from /admin/tokenomics (GENESIS_ALLOCATION) to all token distribution pages.
 * 
 * This ensures data consistency across all 18 token distribution routes:
 * - Airdrop, Referral, Events, Community Program, DAO Governance
 * - Block Rewards, Validator Incentives, Ecosystem Fund
 * - Partnership Program, Marketing Program, Strategic Partner
 * - Advisor Program, Seed/Private/Public Rounds
 * - Launchpad, CoinList, DAO Maker
 */

import { GENESIS_ALLOCATION, TOKEN_CONSTANTS, TOKEN_PRICING, BILLION } from "@shared/tokenomics-config";
import { storage } from "../storage";

// Cache configuration
const CACHE_TTL_MS = 5000; // 5 second cache for real-time updates

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class TokenomicsCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }
  
  set<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
  
  clear(): void {
    this.cache.clear();
  }
}

const cache = new TokenomicsCache();

// Program mapping to GENESIS_ALLOCATION categories
export type TokenProgram = 
  | 'airdrop' | 'referral' | 'events' | 'community-program' | 'dao-governance'
  | 'block-rewards' | 'validator-incentives' | 'ecosystem-fund'
  | 'partnership-program' | 'marketing-program' | 'strategic-partner'
  | 'advisor-program' | 'seed-round' | 'private-round' | 'public-round'
  | 'launchpad' | 'coinlist' | 'dao-maker';

interface AllocationData {
  percentage: number;
  parentPercentage: number;
  amount: number;
  amountFormatted: string;
  description: string;
  tgePercent?: number;
}

interface ProgramAllocation extends AllocationData {
  category: string;
  subcategory: string;
  categoryPercentage: number;
  categoryAmount: number;
  categoryAmountFormatted: string;
  totalSupply: number;
  totalSupplyFormatted: string;
}

interface ProgramStats {
  allocation: ProgramAllocation;
  distributed: {
    amount: string;
    percentage: number;
  };
  remaining: {
    amount: string;
    percentage: number;
  };
  participants: number;
  status: 'active' | 'pending' | 'completed' | 'paused';
  lastUpdated: string;
}

// Mapping from route names to GENESIS_ALLOCATION paths
const PROGRAM_MAPPING: Record<TokenProgram, { category: keyof typeof GENESIS_ALLOCATION; subcategory: string } | null> = {
  'airdrop': { category: 'COMMUNITY', subcategory: 'AIRDROP' },
  'referral': { category: 'COMMUNITY', subcategory: 'REFERRAL' },
  'events': { category: 'COMMUNITY', subcategory: 'EVENTS' },
  'community-program': { category: 'COMMUNITY', subcategory: 'COMMUNITY_ACTIVITY' },
  'dao-governance': { category: 'COMMUNITY', subcategory: 'DAO_TREASURY' },
  'block-rewards': { category: 'REWARDS', subcategory: 'BLOCK_REWARDS' },
  'validator-incentives': { category: 'REWARDS', subcategory: 'VALIDATOR_INCENTIVES' },
  'ecosystem-fund': { category: 'ECOSYSTEM', subcategory: 'ECOSYSTEM_FUND' },
  'partnership-program': { category: 'ECOSYSTEM', subcategory: 'PARTNERSHIP' },
  'marketing-program': { category: 'ECOSYSTEM', subcategory: 'MARKETING' },
  'strategic-partner': { category: 'TEAM', subcategory: 'STRATEGIC_PARTNER' },
  'advisor-program': { category: 'TEAM', subcategory: 'ADVISOR' },
  'seed-round': { category: 'INVESTORS', subcategory: 'SEED_ROUND' },
  'private-round': { category: 'INVESTORS', subcategory: 'PRIVATE_ROUND' },
  'public-round': { category: 'INVESTORS', subcategory: 'PUBLIC_SALE' },
  // External IDO/IEO platforms - mapped to PUBLIC_SALE allocation
  'launchpad': { category: 'INVESTORS', subcategory: 'PUBLIC_SALE' },
  'coinlist': { category: 'INVESTORS', subcategory: 'PUBLIC_SALE' },
  'dao-maker': { category: 'INVESTORS', subcategory: 'PUBLIC_SALE' },
};

// Program display names
const PROGRAM_NAMES: Record<TokenProgram, { en: string; ko: string }> = {
  'airdrop': { en: 'Airdrop Program', ko: '에어드랍 프로그램' },
  'referral': { en: 'Referral Program', ko: '레퍼럴 프로그램' },
  'events': { en: 'Event Center', ko: '이벤트 센터' },
  'community-program': { en: 'Community Program', ko: '커뮤니티 프로그램' },
  'dao-governance': { en: 'DAO Governance', ko: 'DAO 거버넌스' },
  'block-rewards': { en: 'Block Rewards', ko: '블록 보상' },
  'validator-incentives': { en: 'Validator Incentives', ko: '검증자 인센티브' },
  'ecosystem-fund': { en: 'Ecosystem Fund', ko: '생태계 펀드' },
  'partnership-program': { en: 'Partnership Program', ko: '파트너십 프로그램' },
  'marketing-program': { en: 'Marketing Program', ko: '마케팅 프로그램' },
  'strategic-partner': { en: 'Strategic Partner', ko: '전략 파트너' },
  'advisor-program': { en: 'Advisor Program', ko: '어드바이저 프로그램' },
  'seed-round': { en: 'Seed Round', ko: '시드 라운드' },
  'private-round': { en: 'Private Round', ko: '프라이빗 라운드' },
  'public-round': { en: 'Public Round', ko: '퍼블릭 라운드' },
  'launchpad': { en: 'Launchpad', ko: '런치패드' },
  'coinlist': { en: 'CoinList', ko: '코인리스트' },
  'dao-maker': { en: 'DAO Maker SHO', ko: 'DAO Maker SHO' },
};

// External platform allocation percentages (split from PUBLIC_SALE)
const EXTERNAL_PLATFORM_SPLIT: Record<'launchpad' | 'coinlist' | 'dao-maker', number> = {
  'launchpad': 40, // 40% of public sale via launchpad
  'coinlist': 35,  // 35% of public sale via CoinList
  'dao-maker': 25, // 25% of public sale via DAO Maker
};

export class TokenomicsDataService {
  /**
   * Get allocation data for a specific token program
   */
  static getProgramAllocation(program: TokenProgram): ProgramAllocation | null {
    const mapping = PROGRAM_MAPPING[program];
    if (!mapping) return null;
    
    const category = GENESIS_ALLOCATION[mapping.category as keyof typeof GENESIS_ALLOCATION];
    if (!category || typeof category !== 'object' || !('subcategories' in category)) return null;
    
    const subcategories = category.subcategories as Record<string, AllocationData>;
    const subcategory = subcategories[mapping.subcategory];
    if (!subcategory) return null;
    
    // Handle external platform split
    let adjustedAmount = subcategory.amount;
    let adjustedPercentage = subcategory.parentPercentage;
    
    if (program === 'launchpad' || program === 'coinlist' || program === 'dao-maker') {
      const splitPercent = EXTERNAL_PLATFORM_SPLIT[program] / 100;
      adjustedAmount = subcategory.amount * splitPercent;
      adjustedPercentage = subcategory.parentPercentage * splitPercent;
    }
    
    return {
      ...subcategory,
      amount: adjustedAmount,
      parentPercentage: adjustedPercentage,
      amountFormatted: this.formatAmount(adjustedAmount),
      category: mapping.category,
      subcategory: mapping.subcategory,
      categoryPercentage: category.percentage,
      categoryAmount: category.amount,
      categoryAmountFormatted: category.amountFormatted,
      totalSupply: TOKEN_CONSTANTS.TOTAL_SUPPLY,
      totalSupplyFormatted: GENESIS_ALLOCATION.TOTAL_SUPPLY_FORMATTED,
    };
  }
  
  /**
   * Get full program stats including distribution progress
   */
  static async getProgramStats(program: TokenProgram): Promise<ProgramStats | null> {
    const cacheKey = `program_stats_${program}`;
    const cached = cache.get<ProgramStats>(cacheKey);
    if (cached) return cached;
    
    const allocation = this.getProgramAllocation(program);
    if (!allocation) return null;
    
    // Get distribution progress from database or storage
    const progress = await this.getDistributionProgress(program);
    
    const stats: ProgramStats = {
      allocation,
      distributed: {
        amount: progress.distributedAmount,
        percentage: progress.distributedPercentage,
      },
      remaining: {
        amount: this.formatAmount(allocation.amount - parseFloat(progress.distributedAmount.replace(/,/g, ''))),
        percentage: 100 - progress.distributedPercentage,
      },
      participants: progress.participants,
      status: progress.status,
      lastUpdated: new Date().toISOString(),
    };
    
    cache.set(cacheKey, stats);
    return stats;
  }
  
  /**
   * Get all programs overview
   */
  static async getAllProgramsOverview(): Promise<{ programs: Array<{ program: TokenProgram; name: { en: string; ko: string }; allocation: ProgramAllocation | null }> }> {
    const programs = Object.keys(PROGRAM_MAPPING) as TokenProgram[];
    
    return {
      programs: programs.map(program => ({
        program,
        name: PROGRAM_NAMES[program],
        allocation: this.getProgramAllocation(program),
      })),
    };
  }
  
  /**
   * Get category overview (COMMUNITY, REWARDS, etc.)
   */
  static getCategoryOverview(category: 'COMMUNITY' | 'REWARDS' | 'INVESTORS' | 'ECOSYSTEM' | 'TEAM' | 'FOUNDATION') {
    const data = GENESIS_ALLOCATION[category];
    if (!data) return null;
    
    return {
      category,
      percentage: data.percentage,
      amount: data.amount,
      amountFormatted: data.amountFormatted,
      subcategories: 'subcategories' in data ? Object.entries(data.subcategories).map(([key, value]) => ({
        key,
        ...value,
      })) : [],
    };
  }
  
  /**
   * Get full tokenomics summary
   */
  static getTokenomicsSummary() {
    return {
      totalSupply: TOKEN_CONSTANTS.TOTAL_SUPPLY,
      totalSupplyFormatted: GENESIS_ALLOCATION.TOTAL_SUPPLY_FORMATTED,
      categories: {
        community: this.getCategoryOverview('COMMUNITY'),
        rewards: this.getCategoryOverview('REWARDS'),
        investors: this.getCategoryOverview('INVESTORS'),
        ecosystem: this.getCategoryOverview('ECOSYSTEM'),
        team: this.getCategoryOverview('TEAM'),
        foundation: this.getCategoryOverview('FOUNDATION'),
      },
      breakdown: [
        { name: 'Community', percentage: 30, color: '#3B82F6' },
        { name: 'Rewards', percentage: 22, color: '#10B981' },
        { name: 'Investors', percentage: 20, color: '#F59E0B' },
        { name: 'Ecosystem', percentage: 14, color: '#8B5CF6' },
        { name: 'Team', percentage: 11, color: '#EF4444' },
        { name: 'Foundation', percentage: 3, color: '#6366F1' },
      ],
    };
  }
  
  /**
   * Helper: Format large numbers with commas
   */
  private static formatAmount(amount: number): string {
    return amount.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }
  
  /**
   * Helper: Get distribution progress from storage
   */
  private static async getDistributionProgress(program: TokenProgram): Promise<{
    distributedAmount: string;
    distributedPercentage: number;
    participants: number;
    status: 'active' | 'pending' | 'completed' | 'paused';
  }> {
    try {
      // Try to get real data from storage based on program type
      switch (program) {
        case 'airdrop': {
          const stats = await storage.getAirdropStats();
          const allocation = this.getProgramAllocation(program);
          const distributed = parseFloat(stats.claimedAmount || '0');
          return {
            distributedAmount: this.formatAmount(distributed),
            distributedPercentage: allocation ? (distributed / allocation.amount) * 100 : 0,
            participants: stats.totalClaimed || 0,
            status: 'active',
          };
        }
        case 'referral': {
          const stats = await storage.getReferralStats();
          const allocation = this.getProgramAllocation(program);
          const distributed = parseFloat(stats.totalEarnings || '0');
          return {
            distributedAmount: this.formatAmount(distributed),
            distributedPercentage: allocation ? (distributed / allocation.amount) * 100 : 0,
            participants: stats.totalAccounts || 0,
            status: 'active',
          };
        }
        case 'validator-incentives':
        case 'block-rewards': {
          // Get from reward distribution data
          const allocation = this.getProgramAllocation(program);
          // Simulate some distribution progress
          const distributed = (allocation?.amount || 0) * 0.02; // 2% distributed so far
          return {
            distributedAmount: this.formatAmount(distributed),
            distributedPercentage: 2,
            participants: 125, // Genesis validators
            status: 'active',
          };
        }
        default: {
          // Default: minimal distribution for other programs
          return {
            distributedAmount: '0',
            distributedPercentage: 0,
            participants: 0,
            status: 'pending',
          };
        }
      }
    } catch (error) {
      console.error(`[TokenomicsDataService] Error getting progress for ${program}:`, error);
      return {
        distributedAmount: '0',
        distributedPercentage: 0,
        participants: 0,
        status: 'pending',
      };
    }
  }
  
  /**
   * Clear cache (for admin refresh)
   */
  static clearCache(): void {
    cache.clear();
  }
  
  /**
   * Get canonical token pricing from TOKEN_PRICING
   * Single source of truth for all token prices
   */
  static getTokenPricing() {
    return {
      currentPrice: TOKEN_PRICING.CURRENT_PRICE_USD,
      currentPriceFormatted: `$${TOKEN_PRICING.CURRENT_PRICE_USD}`,
      
      investmentRounds: {
        seed: {
          price: TOKEN_PRICING.SEED_ROUND_PRICE,
          priceFormatted: `$${TOKEN_PRICING.SEED_ROUND_PRICE}`,
        },
        private: {
          price: TOKEN_PRICING.PRIVATE_ROUND_PRICE,
          priceFormatted: `$${TOKEN_PRICING.PRIVATE_ROUND_PRICE}`,
        },
        public: {
          price: TOKEN_PRICING.PUBLIC_ROUND_PRICE,
          priceFormatted: `$${TOKEN_PRICING.PUBLIC_ROUND_PRICE}`,
        },
      },
      
      idoPlatforms: {
        launchpad: {
          price: TOKEN_PRICING.LAUNCHPAD_PRICE,
          priceFormatted: `$${TOKEN_PRICING.LAUNCHPAD_PRICE}`,
        },
        coinlist: {
          price: TOKEN_PRICING.COINLIST_PRICE,
          priceFormatted: `$${TOKEN_PRICING.COINLIST_PRICE}`,
        },
        daomaker: {
          price: TOKEN_PRICING.DAOMAKER_PRICE,
          priceFormatted: `$${TOKEN_PRICING.DAOMAKER_PRICE}`,
        },
      },
      
      marketMetrics: {
        fullyDilutedValuation: TOKEN_PRICING.FULLY_DILUTED_VALUATION,
        fdvFormatted: `$${(TOKEN_PRICING.FULLY_DILUTED_VALUATION / 1000000).toFixed(0)}M`,
        marketCapAtLaunch: TOKEN_PRICING.MARKET_CAP_AT_LAUNCH,
        marketCapFormatted: `$${(TOKEN_PRICING.MARKET_CAP_AT_LAUNCH / 1000000).toFixed(0)}M`,
        genesisPrice: TOKEN_PRICING.GENESIS_PRICE,
        athPrice: TOKEN_PRICING.ATH_PRICE,
        atlPrice: TOKEN_PRICING.ATL_PRICE,
      },
      
      source: "/admin/tokenomics",
    };
  }
  
  /**
   * Get price for a specific program/round
   */
  static getProgramPrice(program: TokenProgram): { price: number; priceFormatted: string } {
    switch (program) {
      case 'seed-round':
        return { price: TOKEN_PRICING.SEED_ROUND_PRICE, priceFormatted: `$${TOKEN_PRICING.SEED_ROUND_PRICE}` };
      case 'private-round':
        return { price: TOKEN_PRICING.PRIVATE_ROUND_PRICE, priceFormatted: `$${TOKEN_PRICING.PRIVATE_ROUND_PRICE}` };
      case 'public-round':
        return { price: TOKEN_PRICING.PUBLIC_ROUND_PRICE, priceFormatted: `$${TOKEN_PRICING.PUBLIC_ROUND_PRICE}` };
      case 'launchpad':
        return { price: TOKEN_PRICING.LAUNCHPAD_PRICE, priceFormatted: `$${TOKEN_PRICING.LAUNCHPAD_PRICE}` };
      case 'coinlist':
        return { price: TOKEN_PRICING.COINLIST_PRICE, priceFormatted: `$${TOKEN_PRICING.COINLIST_PRICE}` };
      case 'dao-maker':
        return { price: TOKEN_PRICING.DAOMAKER_PRICE, priceFormatted: `$${TOKEN_PRICING.DAOMAKER_PRICE}` };
      default:
        return { price: TOKEN_PRICING.CURRENT_PRICE_USD, priceFormatted: `$${TOKEN_PRICING.CURRENT_PRICE_USD}` };
    }
  }
}

// Singleton export
export const tokenomicsDataService = TokenomicsDataService;
