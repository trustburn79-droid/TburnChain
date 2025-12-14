/**
 * TBURN Lab 20-Year Tokenomics Simulation Engine v2.1
 * Enterprise-grade calculation engine for tokenomics simulation
 * 
 * Based on "완전 시뮬레이션 표 (최종 조정)" specification
 * Target: Y20 = 69.40억 TBURN
 * 
 * This is a pure frontend calculation engine with NO database dependencies
 */

// Constants
export const BILLION = 100_000_000; // 1억 in base units
export const GENESIS_SUPPLY = 100 * BILLION; // 100억

// Phase definitions
export enum Phase {
  GROWTH = 'GROWTH',           // Y0-Y1: 공격적 성장
  DEFLATION = 'DEFLATION',     // Y2-Y10: 지속 가능한 디플레이션
  EQUILIBRIUM = 'EQUILIBRIUM', // Y11-Y15: 완전 균형
  OPTIMIZATION = 'OPTIMIZATION' // Y16-Y20: 미세 최적화
}

// Period type for Y1 sub-periods
export type PeriodType = 'genesis' | 'quarter' | 'half' | 'year';

// Tokenomics period data structure
export interface TokenomicsPeriod {
  id: string;
  year: number;
  quarter?: 'Q1' | 'Q2' | 'H2';
  periodType: PeriodType;
  phase: Phase;
  startSupply: number;      // 시작 공급 (억 단위)
  blockEmission: number;    // 블록 발행 (억 단위)
  aiBurn: number;           // AI 소각 (억 단위)
  netChange: number;        // 순변화 (억 단위)
  endSupply: number;        // 총 공급 (억 단위)
  changeRate: number;       // 감소율 (%)
  note: string;             // 비고
  noteKey: string;          // Translation key for note
}

// Price forecast data
export interface PriceForecast {
  year: number;
  supply: number;           // 억 단위
  conservative: number;     // 시나리오 A (보수적)
  conservativeGrowth: number;
  neutral: number;          // 시나리오 B (중립적)
  neutralGrowth: number;
  optimistic: number;       // 시나리오 C (낙관적)
  optimisticGrowth: number;
  marketCapNeutral: number; // 시가총액 (중립, 억 달러)
}

// Phase statistics
export interface PhaseStats {
  phase: Phase;
  startYear: number;
  endYear: number;
  startSupply: number;
  endSupply: number;
  totalEmission: number;
  totalBurn: number;
  netChange: number;
  changePercent: number;
}

// Summary statistics
export interface TokenomicsSummary {
  genesisSupply: number;
  finalSupply: number;
  totalDeflation: number;
  deflationPercent: number;
  cumulativeEmission: number;
  cumulativeBurn: number;
  averageAnnualRate: number;
  phaseStats: PhaseStats[];
}

/**
 * Complete tokenomics data based on "완전 시뮬레이션 표 (최종 조정)"
 * All values in 억 (100 million) units
 */
export const TOKENOMICS_DATA: TokenomicsPeriod[] = [
  {
    id: 'Y0',
    year: 0,
    periodType: 'genesis',
    phase: Phase.GROWTH,
    startSupply: 100.00,
    blockEmission: 0,
    aiBurn: 0,
    netChange: 0,
    endSupply: 100.00,
    changeRate: 0,
    note: 'Genesis',
    noteKey: 'tokenomics.notes.genesis'
  },
  {
    id: 'Y1-Q1',
    year: 1,
    quarter: 'Q1',
    periodType: 'quarter',
    phase: Phase.GROWTH,
    startSupply: 100.00,
    blockEmission: 0.80,
    aiBurn: 1.00,
    netChange: -0.20,
    endSupply: 99.80,
    changeRate: -0.20,
    note: '초기 유저 유치',
    noteKey: 'tokenomics.notes.y1q1'
  },
  {
    id: 'Y1-Q2',
    year: 1,
    quarter: 'Q2',
    periodType: 'quarter',
    phase: Phase.GROWTH,
    startSupply: 99.80,
    blockEmission: 0.60,
    aiBurn: 1.40,
    netChange: -0.80,
    endSupply: 99.00,
    changeRate: -0.80,
    note: '성장 가속',
    noteKey: 'tokenomics.notes.y1q2'
  },
  {
    id: 'Y1-H2',
    year: 1,
    quarter: 'H2',
    periodType: 'half',
    phase: Phase.GROWTH,
    startSupply: 99.00,
    blockEmission: 1.20,
    aiBurn: 3.20,
    netChange: -2.00,
    endSupply: 97.00,
    changeRate: -2.02,
    note: '생태계 확장',
    noteKey: 'tokenomics.notes.y1h2'
  },
  {
    id: 'Y2',
    year: 2,
    periodType: 'year',
    phase: Phase.DEFLATION,
    startSupply: 97.00,
    blockEmission: 2.00,
    aiBurn: 5.10,
    netChange: -3.10,
    endSupply: 93.90,
    changeRate: -3.20,
    note: '지속 성장',
    noteKey: 'tokenomics.notes.y2'
  },
  {
    id: 'Y3',
    year: 3,
    periodType: 'year',
    phase: Phase.DEFLATION,
    startSupply: 93.90,
    blockEmission: 1.90,
    aiBurn: 5.00,
    netChange: -3.10,
    endSupply: 90.80,
    changeRate: -3.30,
    note: '대량 채택',
    noteKey: 'tokenomics.notes.y3'
  },
  {
    id: 'Y4',
    year: 4,
    periodType: 'year',
    phase: Phase.DEFLATION,
    startSupply: 90.80,
    blockEmission: 1.80,
    aiBurn: 4.90,
    netChange: -3.10,
    endSupply: 87.70,
    changeRate: -3.41,
    note: '기업 통합',
    noteKey: 'tokenomics.notes.y4'
  },
  {
    id: 'Y5',
    year: 5,
    periodType: 'year',
    phase: Phase.DEFLATION,
    startSupply: 87.70,
    blockEmission: 1.70,
    aiBurn: 4.80,
    netChange: -3.10,
    endSupply: 84.60,
    changeRate: -3.53,
    note: '플랫폼 성숙',
    noteKey: 'tokenomics.notes.y5'
  },
  {
    id: 'Y6',
    year: 6,
    periodType: 'year',
    phase: Phase.DEFLATION,
    startSupply: 84.60,
    blockEmission: 1.40,
    aiBurn: 4.20,
    netChange: -2.80,
    endSupply: 81.80,
    changeRate: -3.31,
    note: '첫 반감기',
    noteKey: 'tokenomics.notes.y6'
  },
  {
    id: 'Y7',
    year: 7,
    periodType: 'year',
    phase: Phase.DEFLATION,
    startSupply: 81.80,
    blockEmission: 1.20,
    aiBurn: 4.00,
    netChange: -2.80,
    endSupply: 79.00,
    changeRate: -3.42,
    note: '안정화',
    noteKey: 'tokenomics.notes.y7'
  },
  {
    id: 'Y8',
    year: 8,
    periodType: 'year',
    phase: Phase.DEFLATION,
    startSupply: 79.00,
    blockEmission: 1.00,
    aiBurn: 3.80,
    netChange: -2.80,
    endSupply: 76.20,
    changeRate: -3.54,
    note: '기관급',
    noteKey: 'tokenomics.notes.y8'
  },
  {
    id: 'Y9',
    year: 9,
    periodType: 'year',
    phase: Phase.DEFLATION,
    startSupply: 76.20,
    blockEmission: 0.90,
    aiBurn: 3.60,
    netChange: -2.70,
    endSupply: 73.50,
    changeRate: -3.54,
    note: '두 번째 반감',
    noteKey: 'tokenomics.notes.y9'
  },
  {
    id: 'Y10',
    year: 10,
    periodType: 'year',
    phase: Phase.DEFLATION,
    startSupply: 73.50,
    blockEmission: 0.80,
    aiBurn: 3.50,
    netChange: -2.70,
    endSupply: 70.80,
    changeRate: -3.67,
    note: '10년 달성',
    noteKey: 'tokenomics.notes.y10'
  },
  {
    id: 'Y11',
    year: 11,
    periodType: 'year',
    phase: Phase.EQUILIBRIUM,
    startSupply: 70.80,
    blockEmission: 0.70,
    aiBurn: 1.40,
    netChange: -0.70,
    endSupply: 70.10,
    changeRate: -0.99,
    note: '균형 시작',
    noteKey: 'tokenomics.notes.y11'
  },
  {
    id: 'Y12',
    year: 12,
    periodType: 'year',
    phase: Phase.EQUILIBRIUM,
    startSupply: 70.10,
    blockEmission: 0.65,
    aiBurn: 0.65,
    netChange: 0,
    endSupply: 70.10,
    changeRate: 0,
    note: '완전 균형',
    noteKey: 'tokenomics.notes.y12'
  },
  {
    id: 'Y13',
    year: 13,
    periodType: 'year',
    phase: Phase.EQUILIBRIUM,
    startSupply: 70.10,
    blockEmission: 0.60,
    aiBurn: 0.60,
    netChange: 0,
    endSupply: 70.10,
    changeRate: 0,
    note: '안정 상태',
    noteKey: 'tokenomics.notes.y13'
  },
  {
    id: 'Y14',
    year: 14,
    periodType: 'year',
    phase: Phase.EQUILIBRIUM,
    startSupply: 70.10,
    blockEmission: 0.55,
    aiBurn: 0.55,
    netChange: 0,
    endSupply: 70.10,
    changeRate: 0,
    note: '예측 가능',
    noteKey: 'tokenomics.notes.y14'
  },
  {
    id: 'Y15',
    year: 15,
    periodType: 'year',
    phase: Phase.EQUILIBRIUM,
    startSupply: 70.10,
    blockEmission: 0.50,
    aiBurn: 0.50,
    netChange: 0,
    endSupply: 70.10,
    changeRate: 0,
    note: '균형 종료',
    noteKey: 'tokenomics.notes.y15'
  },
  {
    id: 'Y16',
    year: 16,
    periodType: 'year',
    phase: Phase.OPTIMIZATION,
    startSupply: 70.10,
    blockEmission: 0.45,
    aiBurn: 0.61,
    netChange: -0.16,
    endSupply: 69.94,
    changeRate: -0.23,
    note: '미세 조정',
    noteKey: 'tokenomics.notes.y16'
  },
  {
    id: 'Y17',
    year: 17,
    periodType: 'year',
    phase: Phase.OPTIMIZATION,
    startSupply: 69.94,
    blockEmission: 0.43,
    aiBurn: 0.57,
    netChange: -0.14,
    endSupply: 69.80,
    changeRate: -0.20,
    note: '정밀 관리',
    noteKey: 'tokenomics.notes.y17'
  },
  {
    id: 'Y18',
    year: 18,
    periodType: 'year',
    phase: Phase.OPTIMIZATION,
    startSupply: 69.80,
    blockEmission: 0.41,
    aiBurn: 0.55,
    netChange: -0.14,
    endSupply: 69.66,
    changeRate: -0.20,
    note: '성숙 단계',
    noteKey: 'tokenomics.notes.y18'
  },
  {
    id: 'Y19',
    year: 19,
    periodType: 'year',
    phase: Phase.OPTIMIZATION,
    startSupply: 69.66,
    blockEmission: 0.39,
    aiBurn: 0.53,
    netChange: -0.14,
    endSupply: 69.52,
    changeRate: -0.20,
    note: '탁월함',
    noteKey: 'tokenomics.notes.y19'
  },
  {
    id: 'Y20',
    year: 20,
    periodType: 'year',
    phase: Phase.OPTIMIZATION,
    startSupply: 69.52,
    blockEmission: 0.37,
    aiBurn: 0.49,
    netChange: -0.12,
    endSupply: 69.40,
    changeRate: -0.17,
    note: '비전 완성',
    noteKey: 'tokenomics.notes.y20'
  }
];

/**
 * Price forecast data based on v2.1 specification
 * All prices in USD, market cap in 억 달러
 */
export const PRICE_FORECAST_DATA: PriceForecast[] = [
  { year: 0, supply: 100.00, conservative: 0.50, conservativeGrowth: 0, neutral: 0.50, neutralGrowth: 0, optimistic: 0.50, optimisticGrowth: 0, marketCapNeutral: 50 },
  { year: 1, supply: 97.00, conservative: 0.85, conservativeGrowth: 70, neutral: 1.25, neutralGrowth: 150, optimistic: 2.50, optimisticGrowth: 400, marketCapNeutral: 121 },
  { year: 2, supply: 93.90, conservative: 0.98, conservativeGrowth: 15, neutral: 1.56, neutralGrowth: 25, optimistic: 3.50, optimisticGrowth: 40, marketCapNeutral: 146 },
  { year: 3, supply: 90.80, conservative: 1.13, conservativeGrowth: 15, neutral: 1.95, neutralGrowth: 25, optimistic: 4.90, optimisticGrowth: 40, marketCapNeutral: 177 },
  { year: 4, supply: 87.70, conservative: 1.30, conservativeGrowth: 15, neutral: 2.44, neutralGrowth: 25, optimistic: 6.86, optimisticGrowth: 40, marketCapNeutral: 214 },
  { year: 5, supply: 84.60, conservative: 1.49, conservativeGrowth: 15, neutral: 3.05, neutralGrowth: 25, optimistic: 9.60, optimisticGrowth: 40, marketCapNeutral: 258 },
  { year: 6, supply: 81.80, conservative: 1.67, conservativeGrowth: 12, neutral: 3.66, neutralGrowth: 20, optimistic: 12.48, optimisticGrowth: 30, marketCapNeutral: 299 },
  { year: 7, supply: 79.00, conservative: 1.87, conservativeGrowth: 12, neutral: 4.39, neutralGrowth: 20, optimistic: 16.22, optimisticGrowth: 30, marketCapNeutral: 347 },
  { year: 8, supply: 76.20, conservative: 2.09, conservativeGrowth: 12, neutral: 5.27, neutralGrowth: 20, optimistic: 21.09, optimisticGrowth: 30, marketCapNeutral: 402 },
  { year: 9, supply: 73.50, conservative: 2.34, conservativeGrowth: 12, neutral: 6.32, neutralGrowth: 20, optimistic: 27.42, optimisticGrowth: 30, marketCapNeutral: 465 },
  { year: 10, supply: 70.80, conservative: 2.62, conservativeGrowth: 12, neutral: 7.58, neutralGrowth: 20, optimistic: 35.65, optimisticGrowth: 30, marketCapNeutral: 537 },
  { year: 11, supply: 70.10, conservative: 2.75, conservativeGrowth: 5, neutral: 8.34, neutralGrowth: 10, optimistic: 40.99, optimisticGrowth: 15, marketCapNeutral: 585 },
  { year: 12, supply: 70.10, conservative: 2.89, conservativeGrowth: 5, neutral: 9.17, neutralGrowth: 10, optimistic: 47.14, optimisticGrowth: 15, marketCapNeutral: 643 },
  { year: 13, supply: 70.10, conservative: 3.03, conservativeGrowth: 5, neutral: 10.09, neutralGrowth: 10, optimistic: 54.21, optimisticGrowth: 15, marketCapNeutral: 707 },
  { year: 14, supply: 70.10, conservative: 3.18, conservativeGrowth: 5, neutral: 11.10, neutralGrowth: 10, optimistic: 62.34, optimisticGrowth: 15, marketCapNeutral: 778 },
  { year: 15, supply: 70.10, conservative: 3.34, conservativeGrowth: 5, neutral: 12.21, neutralGrowth: 10, optimistic: 71.69, optimisticGrowth: 15, marketCapNeutral: 856 },
  { year: 16, supply: 69.94, conservative: 3.44, conservativeGrowth: 3, neutral: 12.82, neutralGrowth: 5, optimistic: 77.43, optimisticGrowth: 8, marketCapNeutral: 897 },
  { year: 17, supply: 69.80, conservative: 3.54, conservativeGrowth: 3, neutral: 13.46, neutralGrowth: 5, optimistic: 83.62, optimisticGrowth: 8, marketCapNeutral: 940 },
  { year: 18, supply: 69.66, conservative: 3.65, conservativeGrowth: 3, neutral: 14.13, neutralGrowth: 5, optimistic: 90.31, optimisticGrowth: 8, marketCapNeutral: 984 },
  { year: 19, supply: 69.52, conservative: 3.76, conservativeGrowth: 3, neutral: 14.84, neutralGrowth: 5, optimistic: 97.53, optimisticGrowth: 8, marketCapNeutral: 1032 },
  { year: 20, supply: 69.40, conservative: 3.87, conservativeGrowth: 3, neutral: 15.58, neutralGrowth: 5, optimistic: 105.33, optimisticGrowth: 8, marketCapNeutral: 1081 }
];

/**
 * Y1 Quarterly milestones
 */
export interface Y1Milestone {
  period: 'Q1' | 'Q2' | 'H2';
  weeks: string;
  description: string;
  descriptionKey: string;
  validators: string;
  tps: string;
  wallets?: string;
  tvl?: string;
  stakingAPY: string;
}

export const Y1_MILESTONES: Y1Milestone[] = [
  {
    period: 'Q1',
    weeks: 'Week 1-12',
    description: '초기 검증자 및 사용자 유치',
    descriptionKey: 'tokenomics.y1.q1.description',
    validators: '500+',
    tps: '10K',
    stakingAPY: '25-30%'
  },
  {
    period: 'Q2',
    weeks: 'Week 13-26',
    description: 'DeFi 생태계 기반 구축',
    descriptionKey: 'tokenomics.y1.q2.description',
    validators: '2,000+',
    tps: '50K',
    tvl: '$10M+',
    stakingAPY: '20-25%'
  },
  {
    period: 'H2',
    weeks: 'Month 7-12',
    description: '완전한 DeFi + NFT + GameFi 생태계',
    descriptionKey: 'tokenomics.y1.h2.description',
    validators: '10,000+',
    tps: '100K',
    wallets: '2,000,000+',
    tvl: '$100M+',
    stakingAPY: '15-20%'
  }
];

/**
 * Calculate summary statistics from tokenomics data
 */
export function calculateSummary(): TokenomicsSummary {
  const periods = TOKENOMICS_DATA;
  const genesis = periods[0];
  const final = periods[periods.length - 1];
  
  let cumulativeEmission = 0;
  let cumulativeBurn = 0;
  
  periods.forEach(p => {
    cumulativeEmission += p.blockEmission;
    cumulativeBurn += p.aiBurn;
  });
  
  const totalDeflation = genesis.startSupply - final.endSupply;
  const deflationPercent = (totalDeflation / genesis.startSupply) * 100;
  
  // Calculate phase stats
  const phaseStats: PhaseStats[] = [
    calculatePhaseStats(Phase.GROWTH, 0, 1),
    calculatePhaseStats(Phase.DEFLATION, 2, 10),
    calculatePhaseStats(Phase.EQUILIBRIUM, 11, 15),
    calculatePhaseStats(Phase.OPTIMIZATION, 16, 20)
  ];
  
  // Average annual rate (excluding Y0)
  const yearsCount = 20;
  const averageAnnualRate = deflationPercent / yearsCount;
  
  return {
    genesisSupply: genesis.startSupply,
    finalSupply: final.endSupply,
    totalDeflation,
    deflationPercent,
    cumulativeEmission: Math.round(cumulativeEmission * 100) / 100,
    cumulativeBurn: Math.round(cumulativeBurn * 100) / 100,
    averageAnnualRate: Math.round(averageAnnualRate * 100) / 100,
    phaseStats
  };
}

/**
 * Calculate statistics for a specific phase
 */
function calculatePhaseStats(phase: Phase, startYear: number, endYear: number): PhaseStats {
  const periods = TOKENOMICS_DATA.filter(p => p.year >= startYear && p.year <= endYear);
  
  if (periods.length === 0) {
    return {
      phase,
      startYear,
      endYear,
      startSupply: 0,
      endSupply: 0,
      totalEmission: 0,
      totalBurn: 0,
      netChange: 0,
      changePercent: 0
    };
  }
  
  const startSupply = periods[0].startSupply;
  const endSupply = periods[periods.length - 1].endSupply;
  
  let totalEmission = 0;
  let totalBurn = 0;
  
  periods.forEach(p => {
    totalEmission += p.blockEmission;
    totalBurn += p.aiBurn;
  });
  
  const netChange = endSupply - startSupply;
  const changePercent = (netChange / startSupply) * 100;
  
  return {
    phase,
    startYear,
    endYear,
    startSupply,
    endSupply,
    totalEmission: Math.round(totalEmission * 100) / 100,
    totalBurn: Math.round(totalBurn * 100) / 100,
    netChange: Math.round(netChange * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100
  };
}

/**
 * Get periods by phase
 */
export function getPeriodsByPhase(phase: Phase): TokenomicsPeriod[] {
  return TOKENOMICS_DATA.filter(p => p.phase === phase);
}

/**
 * Get period by ID
 */
export function getPeriodById(id: string): TokenomicsPeriod | undefined {
  return TOKENOMICS_DATA.find(p => p.id === id);
}

/**
 * Get Y1 sub-periods
 */
export function getY1Periods(): TokenomicsPeriod[] {
  return TOKENOMICS_DATA.filter(p => p.year === 1);
}

/**
 * Get price forecast for a specific year
 */
export function getPriceForecast(year: number): PriceForecast | undefined {
  return PRICE_FORECAST_DATA.find(p => p.year === year);
}

/**
 * Calculate ROI from genesis to a specific year
 */
export function calculateROI(year: number, scenario: 'conservative' | 'neutral' | 'optimistic'): number {
  const genesis = PRICE_FORECAST_DATA[0];
  const target = PRICE_FORECAST_DATA.find(p => p.year === year);
  
  if (!genesis || !target) return 0;
  
  const startPrice = genesis[scenario];
  const endPrice = target[scenario];
  
  return ((endPrice - startPrice) / startPrice) * 100;
}

/**
 * Format supply value (억 단위)
 */
export function formatSupply(value: number, locale: string = 'ko'): string {
  if (locale === 'ko') {
    return `${value.toFixed(2)}억`;
  }
  return `${(value / 10).toFixed(2)}B`;
}

/**
 * Format change rate as percentage
 */
export function formatChangeRate(rate: number): string {
  if (rate === 0) return '0.00%';
  const sign = rate > 0 ? '+' : '';
  return `${sign}${rate.toFixed(2)}%`;
}

/**
 * Format currency value
 */
export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Format market cap (억 달러)
 */
export function formatMarketCap(value: number, locale: string = 'ko'): string {
  if (locale === 'ko') {
    return `$${value.toLocaleString()}억`;
  }
  return `$${(value / 10).toFixed(1)}B`;
}

/**
 * Get phase color for UI
 */
export function getPhaseColor(phase: Phase): string {
  switch (phase) {
    case Phase.GROWTH:
      return 'hsl(142, 76%, 36%)'; // Green
    case Phase.DEFLATION:
      return 'hsl(25, 95%, 53%)'; // Orange
    case Phase.EQUILIBRIUM:
      return 'hsl(217, 91%, 60%)'; // Blue
    case Phase.OPTIMIZATION:
      return 'hsl(280, 87%, 53%)'; // Purple
    default:
      return 'hsl(0, 0%, 50%)';
  }
}

/**
 * Get phase badge variant
 */
export function getPhaseBadgeVariant(phase: Phase): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (phase) {
    case Phase.GROWTH:
      return 'default';
    case Phase.DEFLATION:
      return 'destructive';
    case Phase.EQUILIBRIUM:
      return 'secondary';
    case Phase.OPTIMIZATION:
      return 'outline';
    default:
      return 'default';
  }
}

/**
 * Generate chart data for supply over time
 */
export function getSupplyChartData(): { period: string; supply: number; emission: number; burn: number }[] {
  return TOKENOMICS_DATA.map(p => ({
    period: p.id,
    supply: p.endSupply,
    emission: p.blockEmission,
    burn: p.aiBurn
  }));
}

/**
 * Generate chart data for price forecast
 */
export function getPriceChartData(): { year: number; conservative: number; neutral: number; optimistic: number }[] {
  return PRICE_FORECAST_DATA.map(p => ({
    year: p.year,
    conservative: p.conservative,
    neutral: p.neutral,
    optimistic: p.optimistic
  }));
}

/**
 * Generate chart data for market cap
 */
export function getMarketCapChartData(): { year: number; marketCap: number }[] {
  return PRICE_FORECAST_DATA.map(p => ({
    year: p.year,
    marketCap: p.marketCapNeutral
  }));
}

// Export summary for quick access
export const TOKENOMICS_SUMMARY = calculateSummary();

// ============================================================================
// TOKENOMICS v2.0 - Genesis Distribution & Investor Data
// ============================================================================

/**
 * Genesis Distribution Category
 */
export interface GenesisCategory {
  id: string;
  name: string;
  nameKey: string;
  amount: number;           // 억 단위
  percentage: number;       // %
  description: string;
  descriptionKey: string;
  subcategories?: GenesisSubcategory[];
}

export interface GenesisSubcategory {
  id: string;
  name: string;
  nameKey: string;
  amount: number;           // 억 단위
  percentage: number;       // % of parent
  description?: string;
}

/**
 * Genesis Distribution - 100억 TBURN
 * Based on v2.0 specification
 */
export const GENESIS_DISTRIBUTION: GenesisCategory[] = [
  {
    id: 'block_rewards',
    name: '블록 보상 리저브',
    nameKey: 'tokenomics.genesis.blockRewards',
    amount: 23,
    percentage: 23,
    description: '검증자 보상을 통한 네트워크 보안 유지 (20년 지속 가능)',
    descriptionKey: 'tokenomics.genesis.blockRewards.desc'
  },
  {
    id: 'community',
    name: '커뮤니티 & 에어드랍',
    nameKey: 'tokenomics.genesis.community',
    amount: 30,
    percentage: 30,
    description: '진정한 탈중앙화 및 커뮤니티 주도 성장',
    descriptionKey: 'tokenomics.genesis.community.desc',
    subcategories: [
      { id: 'initial_validators', name: '초기 검증자', nameKey: 'tokenomics.genesis.initialValidators', amount: 8, percentage: 26.7 },
      { id: 'airdrop', name: '에어드랍 프로그램', nameKey: 'tokenomics.genesis.airdrop', amount: 10, percentage: 33.3 },
      { id: 'community_rewards', name: '커뮤니티 보상', nameKey: 'tokenomics.genesis.communityRewards', amount: 7, percentage: 23.3 },
      { id: 'dao_treasury', name: 'DAO 트레저리', nameKey: 'tokenomics.genesis.daoTreasury', amount: 5, percentage: 16.7 }
    ]
  },
  {
    id: 'investors',
    name: '투자자',
    nameKey: 'tokenomics.genesis.investors',
    amount: 20,
    percentage: 20,
    description: '초기 개발 자금 조달 및 유동성 확보',
    descriptionKey: 'tokenomics.genesis.investors.desc',
    subcategories: [
      { id: 'seed', name: 'Seed Round', nameKey: 'tokenomics.genesis.seed', amount: 5, percentage: 25 },
      { id: 'private', name: 'Private Round', nameKey: 'tokenomics.genesis.private', amount: 9, percentage: 45 },
      { id: 'public', name: 'Public Sale', nameKey: 'tokenomics.genesis.public', amount: 6, percentage: 30 }
    ]
  },
  {
    id: 'foundation',
    name: '재단 & 생태계',
    nameKey: 'tokenomics.genesis.foundation',
    amount: 15,
    percentage: 15,
    description: '장기 운영 및 생태계 개발 지원',
    descriptionKey: 'tokenomics.genesis.foundation.desc',
    subcategories: [
      { id: 'foundation_ops', name: '재단 운영', nameKey: 'tokenomics.genesis.foundationOps', amount: 5, percentage: 33.3 },
      { id: 'ecosystem_fund', name: '생태계 펀드', nameKey: 'tokenomics.genesis.ecosystemFund', amount: 7, percentage: 46.7 },
      { id: 'marketing', name: '마케팅 & 성장', nameKey: 'tokenomics.genesis.marketing', amount: 2, percentage: 13.3 },
      { id: 'partnerships', name: '파트너십', nameKey: 'tokenomics.genesis.partnerships', amount: 1, percentage: 6.7 }
    ]
  },
  {
    id: 'team',
    name: '팀 & 어드바이저',
    nameKey: 'tokenomics.genesis.team',
    amount: 12,
    percentage: 12,
    description: '핵심 팀 동기부여 및 장기 참여 유도',
    descriptionKey: 'tokenomics.genesis.team.desc',
    subcategories: [
      { id: 'core_team', name: '코어 팀', nameKey: 'tokenomics.genesis.coreTeam', amount: 8, percentage: 66.7 },
      { id: 'advisors', name: '어드바이저', nameKey: 'tokenomics.genesis.advisors', amount: 2, percentage: 16.7 },
      { id: 'strategic_partners', name: '전략적 파트너', nameKey: 'tokenomics.genesis.strategicPartners', amount: 2, percentage: 16.7 }
    ]
  }
];

/**
 * Investor Round Information
 */
export interface InvestorRound {
  id: 'seed' | 'private' | 'public';
  name: string;
  nameKey: string;
  allocation: number;       // 억 단위
  allocationPercent: number; // % of investor pool
  price: number;            // USD per TBURN
  raised: number;           // USD (백만)
  minInvestment: number;    // USD
  maxInvestment: number;    // USD
  tgePercent: number;       // % released at TGE
  cliffMonths: number;      // Cliff period in months
  vestingMonths: number;    // Vesting period in months
  totalMonths: number;      // Total lock period
}

export const INVESTOR_ROUNDS: InvestorRound[] = [
  {
    id: 'seed',
    name: 'Seed Round',
    nameKey: 'tokenomics.investors.seed',
    allocation: 5,
    allocationPercent: 25,
    price: 0.04,
    raised: 20,
    minInvestment: 100000,
    maxInvestment: 2000000,
    tgePercent: 0,
    cliffMonths: 6,
    vestingMonths: 24,
    totalMonths: 30
  },
  {
    id: 'private',
    name: 'Private Round',
    nameKey: 'tokenomics.investors.private',
    allocation: 9,
    allocationPercent: 45,
    price: 0.10,
    raised: 90,
    minInvestment: 250000,
    maxInvestment: 5000000,
    tgePercent: 0,
    cliffMonths: 6,
    vestingMonths: 18,
    totalMonths: 24
  },
  {
    id: 'public',
    name: 'Public Sale',
    nameKey: 'tokenomics.investors.public',
    allocation: 6,
    allocationPercent: 30,
    price: 0.20,
    raised: 120,
    minInvestment: 100,
    maxInvestment: 100000,
    tgePercent: 15,
    cliffMonths: 0,
    vestingMonths: 12,
    totalMonths: 12
  }
];

/**
 * Total Fundraising: $230M
 */
export const TOTAL_FUNDRAISING = 230; // Million USD

/**
 * Investor ROI Projections (Neutral Scenario)
 */
export interface InvestorROI {
  roundId: 'seed' | 'private' | 'public';
  entryPrice: number;
  y1: { price: number; roi: number };
  y5: { price: number; roi: number };
  y10: { price: number; roi: number };
  y20: { price: number; roi: number };
}

export const INVESTOR_ROI_DATA: InvestorROI[] = [
  {
    roundId: 'seed',
    entryPrice: 0.04,
    y1: { price: 1.25, roi: 31.25 },
    y5: { price: 3.05, roi: 76.25 },
    y10: { price: 7.58, roi: 189.50 },
    y20: { price: 15.58, roi: 389.50 }
  },
  {
    roundId: 'private',
    entryPrice: 0.10,
    y1: { price: 1.25, roi: 12.50 },
    y5: { price: 3.05, roi: 30.50 },
    y10: { price: 7.58, roi: 75.80 },
    y20: { price: 15.58, roi: 155.80 }
  },
  {
    roundId: 'public',
    entryPrice: 0.20,
    y1: { price: 1.25, roi: 6.25 },
    y5: { price: 3.05, roi: 15.25 },
    y10: { price: 7.58, roi: 37.90 },
    y20: { price: 15.58, roi: 77.90 }
  }
];

/**
 * Calculate investor ROI at a specific year
 */
export function calculateInvestorROI(
  roundId: 'seed' | 'private' | 'public',
  year: number,
  scenario: 'conservative' | 'neutral' | 'optimistic' = 'neutral'
): number {
  const round = INVESTOR_ROUNDS.find(r => r.id === roundId);
  const priceData = PRICE_FORECAST_DATA.find(p => p.year === year);
  
  if (!round || !priceData) return 0;
  
  const targetPrice = priceData[scenario];
  return targetPrice / round.price;
}

/**
 * Vesting Schedule Definition
 */
export interface VestingSchedule {
  id: string;
  category: string;
  categoryKey: string;
  tgePercent: number;
  cliffMonths: number;
  vestingMonths: number;
  totalMonths: number;
  description: string;
  descriptionKey: string;
}

export const VESTING_SCHEDULES: VestingSchedule[] = [
  {
    id: 'seed',
    category: 'Seed Round',
    categoryKey: 'tokenomics.vesting.seed',
    tgePercent: 0,
    cliffMonths: 6,
    vestingMonths: 24,
    totalMonths: 30,
    description: '6개월 클리프, 24개월 선형 베스팅',
    descriptionKey: 'tokenomics.vesting.seed.desc'
  },
  {
    id: 'private',
    category: 'Private Round',
    categoryKey: 'tokenomics.vesting.private',
    tgePercent: 0,
    cliffMonths: 6,
    vestingMonths: 18,
    totalMonths: 24,
    description: '6개월 클리프, 18개월 선형 베스팅',
    descriptionKey: 'tokenomics.vesting.private.desc'
  },
  {
    id: 'public',
    category: 'Public Sale',
    categoryKey: 'tokenomics.vesting.public',
    tgePercent: 15,
    cliffMonths: 0,
    vestingMonths: 12,
    totalMonths: 12,
    description: 'TGE 15%, 12개월 선형 베스팅',
    descriptionKey: 'tokenomics.vesting.public.desc'
  },
  {
    id: 'team',
    category: '팀',
    categoryKey: 'tokenomics.vesting.team',
    tgePercent: 0,
    cliffMonths: 12,
    vestingMonths: 60,
    totalMonths: 72,
    description: '12개월 클리프, 60개월 선형 베스팅',
    descriptionKey: 'tokenomics.vesting.team.desc'
  },
  {
    id: 'advisors',
    category: '어드바이저',
    categoryKey: 'tokenomics.vesting.advisors',
    tgePercent: 0,
    cliffMonths: 6,
    vestingMonths: 36,
    totalMonths: 42,
    description: '6개월 클리프, 36개월 선형 베스팅',
    descriptionKey: 'tokenomics.vesting.advisors.desc'
  },
  {
    id: 'initial_validators',
    category: '초기 검증자',
    categoryKey: 'tokenomics.vesting.validators',
    tgePercent: 25,
    cliffMonths: 0,
    vestingMonths: 24,
    totalMonths: 24,
    description: 'TGE 25%, 24개월 선형 베스팅',
    descriptionKey: 'tokenomics.vesting.validators.desc'
  }
];

/**
 * Calculate vesting unlock at a specific month
 */
export function calculateVestingUnlock(schedule: VestingSchedule, month: number): number {
  if (month < 0) return 0;
  
  // TGE unlock
  if (month === 0) return schedule.tgePercent;
  
  // During cliff period
  if (month <= schedule.cliffMonths) return schedule.tgePercent;
  
  // After vesting complete
  if (month >= schedule.totalMonths) return 100;
  
  // During vesting
  const remainingPercent = 100 - schedule.tgePercent;
  const monthsAfterCliff = month - schedule.cliffMonths;
  const vestingProgress = Math.min(monthsAfterCliff / schedule.vestingMonths, 1);
  
  return schedule.tgePercent + (remainingPercent * vestingProgress);
}

/**
 * Generate vesting chart data for a schedule
 */
export function getVestingChartData(scheduleId: string): { month: number; unlocked: number }[] {
  const schedule = VESTING_SCHEDULES.find(s => s.id === scheduleId);
  if (!schedule) return [];
  
  const data: { month: number; unlocked: number }[] = [];
  for (let month = 0; month <= schedule.totalMonths; month++) {
    data.push({
      month,
      unlocked: Math.round(calculateVestingUnlock(schedule, month) * 100) / 100
    });
  }
  return data;
}

/**
 * Fund Usage Plan - $230M Total
 */
export interface FundUsage {
  category: string;
  categoryKey: string;
  amount: number;         // Million USD
  percentage: number;     // %
  subcategories: { name: string; amount: number }[];
}

export const FUND_USAGE: FundUsage[] = [
  {
    category: '개발',
    categoryKey: 'tokenomics.funds.development',
    amount: 92,
    percentage: 40,
    subcategories: [
      { name: '코어 프로토콜', amount: 40 },
      { name: '스마트 컨트랙트', amount: 20 },
      { name: '인프라', amount: 15 },
      { name: '보안', amount: 10 },
      { name: '연구개발', amount: 7 }
    ]
  },
  {
    category: '마케팅',
    categoryKey: 'tokenomics.funds.marketing',
    amount: 57.5,
    percentage: 25,
    subcategories: [
      { name: '브랜드 구축', amount: 20 },
      { name: '퍼포먼스 마케팅', amount: 15 },
      { name: '커뮤니티', amount: 10 },
      { name: 'PR/미디어', amount: 7.5 },
      { name: '이벤트', amount: 5 }
    ]
  },
  {
    category: '운영',
    categoryKey: 'tokenomics.funds.operations',
    amount: 46,
    percentage: 20,
    subcategories: [
      { name: '인건비', amount: 25 },
      { name: '사무실', amount: 8 },
      { name: '인프라', amount: 7 },
      { name: '보험', amount: 4 },
      { name: '기타', amount: 2 }
    ]
  },
  {
    category: '법률/규제',
    categoryKey: 'tokenomics.funds.legal',
    amount: 23,
    percentage: 10,
    subcategories: [
      { name: '법률 자문', amount: 10 },
      { name: '규제 준수', amount: 7 },
      { name: '라이선스', amount: 4 },
      { name: '감사', amount: 2 }
    ]
  },
  {
    category: '리저브',
    categoryKey: 'tokenomics.funds.reserve',
    amount: 11.5,
    percentage: 5,
    subcategories: [
      { name: '긴급 자금', amount: 11.5 }
    ]
  }
];

/**
 * DAO Treasury Information
 */
export interface DAOTreasuryInfo {
  totalAmount: number;      // 억 단위
  governance: {
    proposalThreshold: number;  // TBURN required for proposal
    quorumGeneral: number;      // % quorum for general proposals
    quorumImportant: number;    // % quorum for important proposals
    approvalGeneral: number;    // % approval for general
    approvalImportant: number;  // % approval for important
    votingPeriodDays: number;
    discussionPeriodDays: number;
    validatorWeight: number;    // Validator vote weight multiplier
  };
  usageLimits: {
    perQuarter: number;     // 억 단위
    perYear: number;        // 억 단위
  };
  allocations: {
    category: string;
    amount: number;
    description: string;
  }[];
}

export const DAO_TREASURY: DAOTreasuryInfo = {
  totalAmount: 5,
  governance: {
    proposalThreshold: 100000,
    quorumGeneral: 20,
    quorumImportant: 30,
    approvalGeneral: 60,
    approvalImportant: 70,
    votingPeriodDays: 7,
    discussionPeriodDays: 3,
    validatorWeight: 1.5
  },
  usageLimits: {
    perQuarter: 0.25,
    perYear: 1
  },
  allocations: [
    { category: '긴급 블록 보상 보충', amount: 3, description: '리저브 부족 시 긴급 보충' },
    { category: '전략적 파트너십', amount: 1, description: '거래소 리스팅, 블록체인 통합' },
    { category: '생태계 투자', amount: 1.5, description: '프로젝트 인큐베이션, 스타트업 투자' },
    { category: '마케팅 캠페인', amount: 1, description: '대규모 이벤트, 글로벌 확장' },
    { category: '개발자 그랜트', amount: 0.5, description: '대형 프로젝트 지원' },
    { category: '위기 대응 펀드', amount: 0.5, description: '보안 사고, 네트워크 공격 대응' }
  ]
};

/**
 * Get genesis distribution chart data
 */
export function getGenesisDistributionChartData(): { name: string; value: number; percentage: number }[] {
  return GENESIS_DISTRIBUTION.map(cat => ({
    name: cat.name,
    value: cat.amount,
    percentage: cat.percentage
  }));
}

/**
 * Get investor comparison chart data
 */
export function getInvestorComparisonData(): { round: string; price: number; allocation: number; raised: number }[] {
  return INVESTOR_ROUNDS.map(r => ({
    round: r.name,
    price: r.price,
    allocation: r.allocation,
    raised: r.raised
  }));
}

/**
 * Get all vesting schedules chart data
 */
export function getAllVestingChartData(): { month: number; [key: string]: number }[] {
  const maxMonths = Math.max(...VESTING_SCHEDULES.map(s => s.totalMonths));
  const data: { month: number; [key: string]: number }[] = [];
  
  for (let month = 0; month <= maxMonths; month++) {
    const point: { month: number; [key: string]: number } = { month };
    VESTING_SCHEDULES.forEach(schedule => {
      point[schedule.id] = Math.round(calculateVestingUnlock(schedule, month) * 100) / 100;
    });
    data.push(point);
  }
  
  return data;
}
