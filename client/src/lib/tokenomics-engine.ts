/**
 * TBURN 20년 토큰 이코노미 마스터 플랜 v4.3.0 Production Ready
 * Enterprise-grade calculation engine for tokenomics simulation
 * 
 * 시행일: 2025년 12월 22일 (TGE)
 * 계획 기간: 2025년 12월 22일 ~ 2045년 12월 22일 (20년)
 * 상태: ✅ 최종 승인 - 제네시스 풀 실행 준비 완료
 * 작성: TBURN Foundation
 * 
 * v4.3 주요 변경사항:
 * - 보상: 23% → 22% (블록보상 14.5억, 검증자 7.5억)
 * - 생태계: 15% → 14% (펀드 7억)
 * - 팀: 12% → 11% (코어팀 7억)
 * - 재단 운영 예비금: 0% → 3% (+3% 신설)
 * - 투자자 TGE: 업계 표준 적용 (시드 0%, 프라이빗 5%, 퍼블릭 15%)
 * 
 * 핵심 수치:
 * - 총 발행량 (고정): 10,000,000,000 TBURN (100억)
 * - 20년 후 최종 공급량: 6,940,000,000 TBURN (69.4억)
 * - 총 디플레이션: -30.60% (-30.6억 TBURN)
 * - 20년 총 블록 발행: +19.75억 TBURN
 * - 20년 총 AI 소각: -50.35억 TBURN
 * - 블록 시간: 0.5초
 * - 연간 블록 수: 63,072,000개
 * 
 * This is a pure frontend calculation engine with NO database dependencies
 */

// Constants
export const BILLION = 100_000_000; // 1억 in base units
export const GENESIS_SUPPLY = 100 * BILLION; // 100억

/**
 * v4.3 문서 사양 Phase 분류
 * 
 * 참고: 문서 Section 2.1(개요)과 2.2(상세 스케줄) 간 Y5 수치 차이 존재
 * - 2.1 개요: 100억 → 84.60억 (-15.4%)
 * - 2.2 상세: 100억 → 84.50억 (계산: 100-3.10×5=84.50)
 * 
 * 코드는 2.2 상세 스케줄의 정밀 계산 수치(84.50억)를 기준으로 함
 */
export enum Phase {
  GROWTH = 'GROWTH',           // Phase 1 성장기: Y0(Genesis)+Y1-Y5 (100억 → 84.50억, -15.5%)
  DEFLATION = 'DEFLATION',     // Phase 2 디플레이션기: Y6-Y10 (84.50억 → 71.63억, -15.2%)
  EQUILIBRIUM = 'EQUILIBRIUM', // Phase 3 균형기: Y11-Y15 (71.63억 → 70.88억, -1.05%)
  OPTIMIZATION = 'OPTIMIZATION' // Phase 4 최적화기: Y16-Y20 (70.88억 → 69.40억, -2.09%)
}

/**
 * v4.3 문서 사양 제네시스 검증자 설정
 * 문서 Section 4.1: 125명 × 100만 TBURN = 1.25억 TBURN
 */
export const GENESIS_VALIDATOR_CONFIG = {
  validatorCount: 125,         // 제네시스 검증자 수
  stakePerValidator: 1000000,  // 100만 TBURN (1M)
  totalStake: 125000000,       // 1.25억 TBURN 총 스테이킹
  totalStakeBillion: 1.25,     // 억 단위
  stakingLockupDays: 365,      // 365일 락업
  note: 'TGE 스테이킹 락업 (유통량 미포함)'
};

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
 * v4.3 문서 사양 20년 토큰노믹스 스케줄
 * 문서 Section 2.2 연도별 상세 스케줄 참조
 * All values in 억 (100 million) units
 */
export const TOKENOMICS_DATA: TokenomicsPeriod[] = [
  // Y0 - 메인넷 런칭 (2025.12.22)
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
    note: '메인넷 런칭',
    noteKey: 'tokenomics.notes.genesis'
  },
  // Phase 1: 성장기 (Y1-Y5) - 100억 → 84.50억 (-15.5%)
  {
    id: 'Y1',
    year: 1,
    periodType: 'year',
    phase: Phase.GROWTH,
    startSupply: 100.00,
    blockEmission: 2.50,
    aiBurn: 5.60,
    netChange: -3.10,
    endSupply: 96.90,
    changeRate: -3.10,
    note: '거래소 상장, AI 서비스 런칭',
    noteKey: 'tokenomics.notes.y1'
  },
  {
    id: 'Y2',
    year: 2,
    periodType: 'year',
    phase: Phase.GROWTH,
    startSupply: 96.90,
    blockEmission: 2.00,
    aiBurn: 5.10,
    netChange: -3.10,
    endSupply: 93.80,
    changeRate: -3.20,
    note: '글로벌 확장, AI 에이전트',
    noteKey: 'tokenomics.notes.y2'
  },
  {
    id: 'Y3',
    year: 3,
    periodType: 'year',
    phase: Phase.GROWTH,
    startSupply: 93.80,
    blockEmission: 1.90,
    aiBurn: 5.00,
    netChange: -3.10,
    endSupply: 90.70,
    changeRate: -3.30,
    note: '대량 채택, 업계 표준',
    noteKey: 'tokenomics.notes.y3'
  },
  {
    id: 'Y4',
    year: 4,
    periodType: 'year',
    phase: Phase.GROWTH,
    startSupply: 90.70,
    blockEmission: 1.80,
    aiBurn: 4.90,
    netChange: -3.10,
    endSupply: 87.60,
    changeRate: -3.42,
    note: '기업 통합, Fortune 500',
    noteKey: 'tokenomics.notes.y4'
  },
  {
    id: 'Y5',
    year: 5,
    periodType: 'year',
    phase: Phase.GROWTH,
    startSupply: 87.60,
    blockEmission: 1.70,
    aiBurn: 4.80,
    netChange: -3.10,
    endSupply: 84.50,
    changeRate: -3.54,
    note: '플랫폼 성숙, 1차 반감기 준비',
    noteKey: 'tokenomics.notes.y5'
  },
  // Phase 2: 디플레이션기 (Y6-Y10) - 84.50억 → 71.63억 (-15.2%)
  {
    id: 'Y6',
    year: 6,
    periodType: 'year',
    phase: Phase.DEFLATION,
    startSupply: 84.50,
    blockEmission: 0.85,
    aiBurn: 3.60,
    netChange: -2.75,
    endSupply: 81.75,
    changeRate: -3.25,
    note: '⚡ 1차 반감기 (50% 감소)',
    noteKey: 'tokenomics.notes.y6'
  },
  {
    id: 'Y7',
    year: 7,
    periodType: 'year',
    phase: Phase.DEFLATION,
    startSupply: 81.75,
    blockEmission: 0.80,
    aiBurn: 3.40,
    netChange: -2.60,
    endSupply: 79.15,
    changeRate: -3.18,
    note: '디플레이션 가속',
    noteKey: 'tokenomics.notes.y7'
  },
  {
    id: 'Y8',
    year: 8,
    periodType: 'year',
    phase: Phase.DEFLATION,
    startSupply: 79.15,
    blockEmission: 0.75,
    aiBurn: 3.20,
    netChange: -2.45,
    endSupply: 76.70,
    changeRate: -3.09,
    note: 'AI 생태계 확장',
    noteKey: 'tokenomics.notes.y8'
  },
  {
    id: 'Y9',
    year: 9,
    periodType: 'year',
    phase: Phase.DEFLATION,
    startSupply: 76.70,
    blockEmission: 0.38,
    aiBurn: 3.00,
    netChange: -2.62,
    endSupply: 74.08,
    changeRate: -3.42,
    note: '⚡ 2차 반감기 (75% 감소)',
    noteKey: 'tokenomics.notes.y9'
  },
  {
    id: 'Y10',
    year: 10,
    periodType: 'year',
    phase: Phase.DEFLATION,
    startSupply: 74.08,
    blockEmission: 0.35,
    aiBurn: 2.80,
    netChange: -2.45,
    endSupply: 71.63,
    changeRate: -3.31,
    note: 'Phase 2 완료',
    noteKey: 'tokenomics.notes.y10'
  },
  // Phase 3: 균형기 (Y11-Y15) - 71.63억 → 70.88억 (-1.0%)
  {
    id: 'Y11',
    year: 11,
    periodType: 'year',
    phase: Phase.EQUILIBRIUM,
    startSupply: 71.63,
    blockEmission: 0.50,
    aiBurn: 0.65,
    netChange: -0.15,
    endSupply: 71.48,
    changeRate: -0.21,
    note: '균형 단계 진입',
    noteKey: 'tokenomics.notes.y11'
  },
  {
    id: 'Y12',
    year: 12,
    periodType: 'year',
    phase: Phase.EQUILIBRIUM,
    startSupply: 71.48,
    blockEmission: 0.48,
    aiBurn: 0.63,
    netChange: -0.15,
    endSupply: 71.33,
    changeRate: -0.21,
    note: '안정화 유지',
    noteKey: 'tokenomics.notes.y12'
  },
  {
    id: 'Y13',
    year: 13,
    periodType: 'year',
    phase: Phase.EQUILIBRIUM,
    startSupply: 71.33,
    blockEmission: 0.46,
    aiBurn: 0.61,
    netChange: -0.15,
    endSupply: 71.18,
    changeRate: -0.21,
    note: '균형 유지',
    noteKey: 'tokenomics.notes.y13'
  },
  {
    id: 'Y14',
    year: 14,
    periodType: 'year',
    phase: Phase.EQUILIBRIUM,
    startSupply: 71.18,
    blockEmission: 0.44,
    aiBurn: 0.59,
    netChange: -0.15,
    endSupply: 71.03,
    changeRate: -0.21,
    note: '성숙 단계',
    noteKey: 'tokenomics.notes.y14'
  },
  {
    id: 'Y15',
    year: 15,
    periodType: 'year',
    phase: Phase.EQUILIBRIUM,
    startSupply: 71.03,
    blockEmission: 0.42,
    aiBurn: 0.57,
    netChange: -0.15,
    endSupply: 70.88,
    changeRate: -0.21,
    note: 'Phase 3 완료',
    noteKey: 'tokenomics.notes.y15'
  },
  // Phase 4: 최적화기 (Y16-Y20) - 70.88억 → 69.40억 (-2.1%)
  {
    id: 'Y16',
    year: 16,
    periodType: 'year',
    phase: Phase.OPTIMIZATION,
    startSupply: 70.88,
    blockEmission: 0.45,
    aiBurn: 0.59,
    netChange: -0.14,
    endSupply: 70.74,
    changeRate: -0.20,
    note: '최적화 단계',
    noteKey: 'tokenomics.notes.y16'
  },
  {
    id: 'Y17',
    year: 17,
    periodType: 'year',
    phase: Phase.OPTIMIZATION,
    startSupply: 70.74,
    blockEmission: 0.43,
    aiBurn: 0.57,
    netChange: -0.14,
    endSupply: 70.60,
    changeRate: -0.20,
    note: '미세 조정',
    noteKey: 'tokenomics.notes.y17'
  },
  {
    id: 'Y18',
    year: 18,
    periodType: 'year',
    phase: Phase.OPTIMIZATION,
    startSupply: 70.60,
    blockEmission: 0.41,
    aiBurn: 0.55,
    netChange: -0.14,
    endSupply: 70.46,
    changeRate: -0.20,
    note: '성숙 단계',
    noteKey: 'tokenomics.notes.y18'
  },
  {
    id: 'Y19',
    year: 19,
    periodType: 'year',
    phase: Phase.OPTIMIZATION,
    startSupply: 70.46,
    blockEmission: 0.39,
    aiBurn: 0.53,
    netChange: -0.14,
    endSupply: 70.32,
    changeRate: -0.20,
    note: '탁월함',
    noteKey: 'tokenomics.notes.y19'
  },
  {
    id: 'Y20',
    year: 20,
    periodType: 'year',
    phase: Phase.OPTIMIZATION,
    startSupply: 70.32,
    blockEmission: 0.37,
    aiBurn: 0.49,
    netChange: -0.12,
    endSupply: 69.40,
    changeRate: -0.17,
    note: '🏆 20년 비전 완성!',
    noteKey: 'tokenomics.notes.y20'
  }
];

/**
 * v4.3 문서 사양 기준 가격 예측 데이터
 * Supply는 TOKENOMICS_DATA의 endSupply와 일치
 */
export const PRICE_FORECAST_DATA: PriceForecast[] = [
  { year: 0, supply: 100.00, conservative: 0.50, conservativeGrowth: 0, neutral: 0.50, neutralGrowth: 0, optimistic: 0.50, optimisticGrowth: 0, marketCapNeutral: 50 },
  { year: 1, supply: 96.90, conservative: 0.85, conservativeGrowth: 70, neutral: 1.25, neutralGrowth: 150, optimistic: 2.50, optimisticGrowth: 400, marketCapNeutral: 121 },
  { year: 2, supply: 93.80, conservative: 0.98, conservativeGrowth: 15, neutral: 1.56, neutralGrowth: 25, optimistic: 3.50, optimisticGrowth: 40, marketCapNeutral: 146 },
  { year: 3, supply: 90.70, conservative: 1.13, conservativeGrowth: 15, neutral: 1.95, neutralGrowth: 25, optimistic: 4.90, optimisticGrowth: 40, marketCapNeutral: 177 },
  { year: 4, supply: 87.60, conservative: 1.30, conservativeGrowth: 15, neutral: 2.44, neutralGrowth: 25, optimistic: 6.86, optimisticGrowth: 40, marketCapNeutral: 214 },
  { year: 5, supply: 84.50, conservative: 1.49, conservativeGrowth: 15, neutral: 3.05, neutralGrowth: 25, optimistic: 9.60, optimisticGrowth: 40, marketCapNeutral: 258 },
  { year: 6, supply: 81.75, conservative: 1.67, conservativeGrowth: 12, neutral: 3.66, neutralGrowth: 20, optimistic: 12.48, optimisticGrowth: 30, marketCapNeutral: 299 },
  { year: 7, supply: 79.15, conservative: 1.87, conservativeGrowth: 12, neutral: 4.39, neutralGrowth: 20, optimistic: 16.22, optimisticGrowth: 30, marketCapNeutral: 347 },
  { year: 8, supply: 76.70, conservative: 2.09, conservativeGrowth: 12, neutral: 5.27, neutralGrowth: 20, optimistic: 21.09, optimisticGrowth: 30, marketCapNeutral: 402 },
  { year: 9, supply: 74.08, conservative: 2.34, conservativeGrowth: 12, neutral: 6.32, neutralGrowth: 20, optimistic: 27.42, optimisticGrowth: 30, marketCapNeutral: 465 },
  { year: 10, supply: 71.63, conservative: 2.62, conservativeGrowth: 12, neutral: 7.58, neutralGrowth: 20, optimistic: 35.65, optimisticGrowth: 30, marketCapNeutral: 537 },
  { year: 11, supply: 71.48, conservative: 2.75, conservativeGrowth: 5, neutral: 8.34, neutralGrowth: 10, optimistic: 40.99, optimisticGrowth: 15, marketCapNeutral: 585 },
  { year: 12, supply: 71.33, conservative: 2.89, conservativeGrowth: 5, neutral: 9.17, neutralGrowth: 10, optimistic: 47.14, optimisticGrowth: 15, marketCapNeutral: 643 },
  { year: 13, supply: 71.18, conservative: 3.03, conservativeGrowth: 5, neutral: 10.09, neutralGrowth: 10, optimistic: 54.21, optimisticGrowth: 15, marketCapNeutral: 707 },
  { year: 14, supply: 71.03, conservative: 3.18, conservativeGrowth: 5, neutral: 11.10, neutralGrowth: 10, optimistic: 62.34, optimisticGrowth: 15, marketCapNeutral: 778 },
  { year: 15, supply: 70.88, conservative: 3.34, conservativeGrowth: 5, neutral: 12.21, neutralGrowth: 10, optimistic: 71.69, optimisticGrowth: 15, marketCapNeutral: 856 },
  { year: 16, supply: 70.74, conservative: 3.44, conservativeGrowth: 3, neutral: 12.82, neutralGrowth: 5, optimistic: 77.43, optimisticGrowth: 8, marketCapNeutral: 897 },
  { year: 17, supply: 70.60, conservative: 3.54, conservativeGrowth: 3, neutral: 13.46, neutralGrowth: 5, optimistic: 83.62, optimisticGrowth: 8, marketCapNeutral: 940 },
  { year: 18, supply: 70.46, conservative: 3.65, conservativeGrowth: 3, neutral: 14.13, neutralGrowth: 5, optimistic: 90.31, optimisticGrowth: 8, marketCapNeutral: 984 },
  { year: 19, supply: 70.32, conservative: 3.76, conservativeGrowth: 3, neutral: 14.84, neutralGrowth: 5, optimistic: 97.53, optimisticGrowth: 8, marketCapNeutral: 1032 },
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
  
  // v4.3 문서 사양 Phase 분류
  // Phase 1 성장기: Y0(Genesis)+Y1~Y5, Phase 2 디플레이션기: Y6~Y10
  // Phase 3 균형기: Y11~Y15, Phase 4 최적화기: Y16~Y20
  const phaseStats: PhaseStats[] = [
    calculatePhaseStats(Phase.GROWTH, 0, 5),
    calculatePhaseStats(Phase.DEFLATION, 6, 10),
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
 * Based on v4.3 Production Ready specification
 * 재단 운영 예비금 3% 신설 + 업계 표준 투자자 TGE 적용
 */
export const GENESIS_DISTRIBUTION: GenesisCategory[] = [
  {
    id: 'community',
    name: '커뮤니티',
    nameKey: 'tokenomics.genesis.community',
    amount: 30,
    percentage: 30,
    description: '커뮤니티 보상, 에어드랍 및 탈중앙화 성장 이니셔티브',
    descriptionKey: 'tokenomics.genesis.community.desc',
    subcategories: [
      { id: 'airdrop', name: '에어드랍', nameKey: 'tokenomics.genesis.airdrop', amount: 12, percentage: 40 },
      { id: 'referral', name: '레퍼럴', nameKey: 'tokenomics.genesis.referral', amount: 3, percentage: 10 },
      { id: 'events', name: '이벤트', nameKey: 'tokenomics.genesis.events', amount: 4, percentage: 13.3 },
      { id: 'community_rewards', name: '커뮤니티활동', nameKey: 'tokenomics.genesis.communityRewards', amount: 3, percentage: 10 },
      { id: 'dao_treasury', name: 'DAO 트레저리', nameKey: 'tokenomics.genesis.daoTreasury', amount: 8, percentage: 26.7 }
    ]
  },
  {
    id: 'rewards',
    name: '보상',
    nameKey: 'tokenomics.genesis.rewards',
    amount: 22,
    percentage: 22,
    description: '네트워크 보안을 위한 블록 보상 및 검증자 인센티브 (v4.3: 23%→22%)',
    descriptionKey: 'tokenomics.genesis.rewards.desc',
    subcategories: [
      { id: 'block_rewards', name: '블록 보상', nameKey: 'tokenomics.genesis.blockRewards', amount: 14.5, percentage: 65.9 },
      { id: 'validator_incentives', name: '검증자 인센티브', nameKey: 'tokenomics.genesis.validatorIncentives', amount: 7.5, percentage: 34.1 }
    ]
  },
  {
    id: 'investors',
    name: '투자자',
    nameKey: 'tokenomics.genesis.investors',
    amount: 20,
    percentage: 20,
    description: '시드, 프라이빗 및 퍼블릭 라운드 배분 (업계 표준 TGE 적용)',
    descriptionKey: 'tokenomics.genesis.investors.desc',
    subcategories: [
      { id: 'seed', name: 'Seed Round (TGE 0%)', nameKey: 'tokenomics.genesis.seed', amount: 5, percentage: 25 },
      { id: 'private', name: 'Private Round (TGE 5%)', nameKey: 'tokenomics.genesis.private', amount: 9, percentage: 45 },
      { id: 'public', name: 'Public Sale (TGE 15%)', nameKey: 'tokenomics.genesis.public', amount: 6, percentage: 30 }
    ]
  },
  {
    id: 'ecosystem',
    name: '생태계',
    nameKey: 'tokenomics.genesis.ecosystem',
    amount: 14,
    percentage: 14,
    description: '그랜트, 파트너십 및 생태계 개발 이니셔티브 (v4.3: 15%→14%)',
    descriptionKey: 'tokenomics.genesis.ecosystem.desc',
    subcategories: [
      { id: 'ecosystem_fund', name: '생태계 펀드', nameKey: 'tokenomics.genesis.ecosystemFund', amount: 7, percentage: 50 },
      { id: 'partnerships', name: '파트너십', nameKey: 'tokenomics.genesis.partnerships', amount: 4, percentage: 28.6 },
      { id: 'marketing', name: '마케팅', nameKey: 'tokenomics.genesis.marketing', amount: 3, percentage: 21.4 }
    ]
  },
  {
    id: 'team',
    name: '팀',
    nameKey: 'tokenomics.genesis.team',
    amount: 11,
    percentage: 11,
    description: '4년 베스팅 스케줄이 있는 코어 팀 및 어드바이저 (v4.3: 12%→11%)',
    descriptionKey: 'tokenomics.genesis.team.desc',
    subcategories: [
      { id: 'core_team', name: '코어 팀', nameKey: 'tokenomics.genesis.coreTeam', amount: 7, percentage: 63.6 },
      { id: 'advisors', name: '어드바이저', nameKey: 'tokenomics.genesis.advisors', amount: 2, percentage: 18.2 },
      { id: 'strategic_partners', name: '전략 파트너', nameKey: 'tokenomics.genesis.strategicPartners', amount: 2, percentage: 18.2 }
    ]
  },
  {
    id: 'foundation_reserve',
    name: '재단 운영 예비금',
    nameKey: 'tokenomics.genesis.foundationReserve',
    amount: 3,
    percentage: 3,
    description: '초기 운영, 체인 활성화, 긴급 대응을 위한 TGE 가용 물량 (v4.3 신설)',
    descriptionKey: 'tokenomics.genesis.foundationReserve.desc',
    subcategories: [
      { id: 'operations', name: '운영 예비금 (TGE 30%)', nameKey: 'tokenomics.genesis.operations', amount: 1.5, percentage: 50 },
      { id: 'emergency', name: '긴급 예비금 (TGE 50%)', nameKey: 'tokenomics.genesis.emergency', amount: 1.0, percentage: 33.3 },
      { id: 'strategic_investment', name: '전략 투자', nameKey: 'tokenomics.genesis.strategicInvestment', amount: 0.5, percentage: 16.7 }
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

/**
 * Investor Rounds - v4.3 업계 표준 TGE 적용
 * 원칙: 높은 가격 참여 → 높은 TGE (공정성 원칙)
 */
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
    tgePercent: 0, // 최저가 참여 → TGE 없음
    cliffMonths: 12,
    vestingMonths: 24,
    totalMonths: 36
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
    tgePercent: 5, // 중간가 참여 → 소량 TGE (0.45억)
    cliffMonths: 9,
    vestingMonths: 18,
    totalMonths: 27
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
    tgePercent: 15, // 최고가 참여 → 적정 TGE (0.90억)
    cliffMonths: 3,
    vestingMonths: 9,
    totalMonths: 12
  }
];

// v4.3 투자자 TGE 합계: 1.35억 TBURN (시드 0 + 프라이빗 0.45 + 퍼블릭 0.90)
export const INVESTOR_TGE_TOTAL = 1.35;

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

/**
 * Vesting Schedules - v4.3 업계 표준 TGE 적용
 */
export const VESTING_SCHEDULES: VestingSchedule[] = [
  {
    id: 'seed',
    category: 'Seed Round',
    categoryKey: 'tokenomics.vesting.seed',
    tgePercent: 0,
    cliffMonths: 12,
    vestingMonths: 24,
    totalMonths: 36,
    description: 'TGE 0%, 12개월 클리프, 24개월 선형 베스팅 (Y3 완료)',
    descriptionKey: 'tokenomics.vesting.seed.desc'
  },
  {
    id: 'private',
    category: 'Private Round',
    categoryKey: 'tokenomics.vesting.private',
    tgePercent: 5,
    cliffMonths: 9,
    vestingMonths: 18,
    totalMonths: 27,
    description: 'TGE 5%, 9개월 클리프, 18개월 선형 베스팅 (Y2.5 완료)',
    descriptionKey: 'tokenomics.vesting.private.desc'
  },
  {
    id: 'public',
    category: 'Public Sale',
    categoryKey: 'tokenomics.vesting.public',
    tgePercent: 15,
    cliffMonths: 3,
    vestingMonths: 9,
    totalMonths: 12,
    description: 'TGE 15%, 3개월 클리프, 9개월 선형 베스팅 (Y1 완료)',
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

// ============================================================
// v4.0.0 Production Ready - 메인넷 제네시스 풀 추가 데이터
// ============================================================

/**
 * Year-1 체인 활성화 이벤트 예산 총괄 (v4.0)
 */
export interface Y1ActivationBudget {
  category: string;
  categoryKey: string;
  amount: number; // 억 TBURN
  description: string;
  descriptionKey: string;
}

export const Y1_ACTIVATION_BUDGET: Y1ActivationBudget[] = [
  { category: 'Year-1 이벤트 캘린더', categoryKey: 'tokenomics.y1.eventCalendar', amount: 3.20, description: '월별 이벤트', descriptionKey: 'tokenomics.y1.eventCalendar.desc' },
  { category: '분기별 시즌 이벤트', categoryKey: 'tokenomics.y1.seasonalEvents', amount: 2.50, description: 'Q1~Q4 특별 이벤트', descriptionKey: 'tokenomics.y1.seasonalEvents.desc' },
  { category: '런칭 캠페인 (TGE +30일)', categoryKey: 'tokenomics.y1.launchCampaign', amount: 1.25, description: '초기 부트스트랩', descriptionKey: 'tokenomics.y1.launchCampaign.desc' },
  { category: '예비 예산', categoryKey: 'tokenomics.y1.reserve', amount: 0.80, description: '긴급/추가 이벤트', descriptionKey: 'tokenomics.y1.reserve.desc' }
];

export const Y1_ACTIVATION_TOTAL = 7.75; // 억 TBURN

/**
 * 런칭 캠페인 (TGE +30일) - v4.0
 */
export interface LaunchCampaignEvent {
  name: string;
  nameKey: string;
  description: string;
  descriptionKey: string;
  reward: number; // 억 TBURN
  participants: number;
}

export const LAUNCH_CAMPAIGN_EVENTS: LaunchCampaignEvent[] = [
  { name: '🚀 First Mover Bonus', nameKey: 'tokenomics.launch.firstMover', description: '첫 10,000개 지갑에 각 10,000 TBURN 지급', descriptionKey: 'tokenomics.launch.firstMover.desc', reward: 1.00, participants: 10000 },
  { name: '📈 Staking Race', nameKey: 'tokenomics.launch.stakingRace', description: '스테이킹 상위 100명에게 추가 10% 보상', descriptionKey: 'tokenomics.launch.stakingRace.desc', reward: 0.20, participants: 100 },
  { name: '📢 Social Blast', nameKey: 'tokenomics.launch.socialBlast', description: '#TBURNLaunch 해시태그 캠페인, 무작위 1,000명', descriptionKey: 'tokenomics.launch.socialBlast.desc', reward: 0.05, participants: 1000 }
];

export const LAUNCH_CAMPAIGN_TOTAL = 1.25; // 억 TBURN

/**
 * 분기별 시즌 이벤트 - v4.0
 */
export interface SeasonalEvent {
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  name: string;
  nameKey: string;
  reward: number; // 억 TBURN
  description: string;
  descriptionKey: string;
}

export const SEASONAL_EVENTS: SeasonalEvent[] = [
  { quarter: 'Q1', name: '🌸 Spring Festival', nameKey: 'tokenomics.seasonal.spring', reward: 0.50, description: '봄맞이 스테이킹 부스트 (+10%), 특별 NFT 에어드랍', descriptionKey: 'tokenomics.seasonal.spring.desc' },
  { quarter: 'Q2', name: '☀️ Summer DeFi', nameKey: 'tokenomics.seasonal.summer', reward: 0.50, description: 'DeFi 참여 보상 2배, LP 마이닝 이벤트', descriptionKey: 'tokenomics.seasonal.summer.desc' },
  { quarter: 'Q3', name: '🍂 Autumn Governance', nameKey: 'tokenomics.seasonal.autumn', reward: 0.50, description: '거버넌스 참여 보상 3배, DAO 제안 대회', descriptionKey: 'tokenomics.seasonal.autumn.desc' },
  { quarter: 'Q4', name: '❄️ Winter Celebration', nameKey: 'tokenomics.seasonal.winter', reward: 1.00, description: '연말 대규모 에어드랍, 홀더 감사 이벤트', descriptionKey: 'tokenomics.seasonal.winter.desc' }
];

/**
 * Year-1 이벤트 캘린더 (월별 상세) - v4.0
 */
export interface MonthlyEvent {
  date: string;
  name: string;
  nameKey: string;
  amount: number; // 억 TBURN
  condition: string;
  conditionKey: string;
  distribution: string;
  distributionKey: string;
}

export const Y1_EVENT_CALENDAR: MonthlyEvent[] = [
  { date: '상장일', name: '🚀 런칭 에어드랍', nameKey: 'tokenomics.events.launchAirdrop', amount: 0.40, condition: '소셜 미션 완료', conditionKey: 'tokenomics.events.launchAirdrop.condition', distribution: '선착순 + 추첨', distributionKey: 'tokenomics.events.launchAirdrop.dist' },
  { date: '2026.02', name: '📱 지갑 활성화 캠페인', nameKey: 'tokenomics.events.walletActivation', amount: 0.20, condition: '첫 트랜잭션 발생', conditionKey: 'tokenomics.events.walletActivation.condition', distribution: '자동 지급', distributionKey: 'tokenomics.events.walletActivation.dist' },
  { date: '2026.03', name: '🎉 Binance 상장 기념', nameKey: 'tokenomics.events.binanceListing', amount: 0.30, condition: '거래량 달성', conditionKey: 'tokenomics.events.binanceListing.condition', distribution: '비례 배분', distributionKey: 'tokenomics.events.binanceListing.dist' },
  { date: '2026.04', name: '🏆 트레이딩 대회', nameKey: 'tokenomics.events.tradingCompetition', amount: 0.20, condition: '거래량 순위', conditionKey: 'tokenomics.events.tradingCompetition.condition', distribution: '순위별 지급', distributionKey: 'tokenomics.events.tradingCompetition.dist' },
  { date: '2026.05', name: '🌐 dApp 체험 이벤트', nameKey: 'tokenomics.events.dappExperience', amount: 0.15, condition: '3개 이상 dApp 사용', conditionKey: 'tokenomics.events.dappExperience.condition', distribution: '미션 완료', distributionKey: 'tokenomics.events.dappExperience.dist' },
  { date: '2026.06', name: '💎 스테이킹 부스트', nameKey: 'tokenomics.events.stakingBoost', amount: 0.25, condition: '30일 이상 스테이킹', conditionKey: 'tokenomics.events.stakingBoost.condition', distribution: '스테이킹 비례', distributionKey: 'tokenomics.events.stakingBoost.dist' },
  { date: '2026.07', name: '🎨 NFT 캠페인', nameKey: 'tokenomics.events.nftCampaign', amount: 0.15, condition: 'NFT 민팅/거래', conditionKey: 'tokenomics.events.nftCampaign.condition', distribution: '활동 기반', distributionKey: 'tokenomics.events.nftCampaign.dist' },
  { date: '2026.08', name: '👥 커뮤니티 밋업', nameKey: 'tokenomics.events.communityMeetup', amount: 0.10, condition: '오프라인 참여', conditionKey: 'tokenomics.events.communityMeetup.condition', distribution: '참석자 배분', distributionKey: 'tokenomics.events.communityMeetup.dist' },
  { date: '2026.09', name: '🔥 번 이벤트', nameKey: 'tokenomics.events.burnEvent', amount: 0.20, condition: '토큰 소각 참여', conditionKey: 'tokenomics.events.burnEvent.condition', distribution: '소각량 비례', distributionKey: 'tokenomics.events.burnEvent.dist' },
  { date: '2026.10', name: '🎃 할로윈 특별', nameKey: 'tokenomics.events.halloween', amount: 0.10, condition: '테마 미션', conditionKey: 'tokenomics.events.halloween.condition', distribution: '미션 완료', distributionKey: 'tokenomics.events.halloween.dist' },
  { date: '2026.11', name: '🦃 추수감사 이벤트', nameKey: 'tokenomics.events.thanksgiving', amount: 0.15, condition: '장기 홀더 보상', conditionKey: 'tokenomics.events.thanksgiving.condition', distribution: '보유 기간 비례', distributionKey: 'tokenomics.events.thanksgiving.dist' },
  { date: '2026.12~01', name: '🎄 연말 페스티벌', nameKey: 'tokenomics.events.yearEnd', amount: 0.30, condition: '종합 활동', conditionKey: 'tokenomics.events.yearEnd.condition', distribution: '활동 점수 기반', distributionKey: 'tokenomics.events.yearEnd.dist' },
  { date: '2027.02', name: '🎂 1주년 기념', nameKey: 'tokenomics.events.anniversary', amount: 0.50, condition: '1년 홀더 + 활동자', conditionKey: 'tokenomics.events.anniversary.condition', distribution: '복합 기준', distributionKey: 'tokenomics.events.anniversary.dist' }
];

/**
 * TGE 즉시 언락 (Day 0: 2025년 12월 22일) - v4.0
 */
export interface TGEUnlock {
  category: string;
  categoryKey: string;
  tgePercent: number;
  amount: number; // 억 TBURN
  purpose: string;
  purposeKey: string;
}

/**
 * TGE 언락 - v4.3 문서 사양 (Year-1 문서 Section 4.2)
 * 
 * 커뮤니티: 에어드랍 1.20억, 레퍼럴 0.15억, 이벤트 0.40억
 * 생태계: 마케팅 0.45억
 * 투자자: 프라이빗 0.45억 (5%), 퍼블릭 0.90억 (15%)
 * 재단: 운영 0.45억 (30%), 긴급 0.50억 (50%)
 * 락업: DEX LP 5.00억, 제네시스 검증자 1.25억
 * 
 * TGE 전체 합계: 10.75억 TBURN
 */
export const TGE_UNLOCKS: TGEUnlock[] = [
  // 커뮤니티 TGE (1.75억)
  { category: '에어드랍 (12억 중)', categoryKey: 'tokenomics.tge.airdrop', tgePercent: 10, amount: 1.20, purpose: '초기 커뮤니티 활성화', purposeKey: 'tokenomics.tge.airdrop.purpose' },
  { category: '레퍼럴 보상 (3억 중)', categoryKey: 'tokenomics.tge.referral', tgePercent: 5, amount: 0.15, purpose: '추천인 보상 즉시 지급', purposeKey: 'tokenomics.tge.referral.purpose' },
  { category: '이벤트/캠페인 (4억 중)', categoryKey: 'tokenomics.tge.events', tgePercent: 10, amount: 0.40, purpose: '런칭 이벤트 보상', purposeKey: 'tokenomics.tge.events.purpose' },
  // 생태계 TGE (0.45억)
  { category: '마케팅 (3억 중)', categoryKey: 'tokenomics.tge.marketing', tgePercent: 15, amount: 0.45, purpose: '런칭 마케팅 즉시 집행', purposeKey: 'tokenomics.tge.marketing.purpose' },
  // 투자자 TGE (1.35억)
  { category: '프라이빗 라운드 (9억 중)', categoryKey: 'tokenomics.tge.private', tgePercent: 5, amount: 0.45, purpose: '업계 표준 TGE - 중간가 참여', purposeKey: 'tokenomics.tge.private.purpose' },
  { category: '퍼블릭 세일 (6억 중)', categoryKey: 'tokenomics.tge.public', tgePercent: 15, amount: 0.90, purpose: '업계 표준 TGE - 최고가 참여', purposeKey: 'tokenomics.tge.public.purpose' },
  // 재단 예비금 TGE (0.95억)
  { category: '재단 운영 예비금 (1.5억 중)', categoryKey: 'tokenomics.tge.foundationOps', tgePercent: 30, amount: 0.45, purpose: '초기 운영비, 체인 활성화', purposeKey: 'tokenomics.tge.foundationOps.purpose' },
  { category: '재단 긴급 예비금 (1.0억 중)', categoryKey: 'tokenomics.tge.foundationEmergency', tgePercent: 50, amount: 0.50, purpose: '긴급 대응, 체인 안정화', purposeKey: 'tokenomics.tge.foundationEmergency.purpose' },
  // 락업 물량 (6.25억 - 유통량 미포함)
  { category: 'DEX 유동성', categoryKey: 'tokenomics.tge.dexLiquidity', tgePercent: 100, amount: 5.00, purpose: '초기 유동성 풀 공급 (LP 락업 365일)', purposeKey: 'tokenomics.tge.dexLiquidity.purpose' },
  { category: '제네시스 검증자', categoryKey: 'tokenomics.tge.genesisValidators', tgePercent: 100, amount: 1.25, purpose: '125개 검증자 스테이킹 (1M TBURN/검증자, 락업)', purposeKey: 'tokenomics.tge.genesisValidators.purpose' }
];

// v4.3 문서 사양 TGE 합계: 10.75억 TBURN (10.75%)
// 에어드랍 1.20 + 마케팅 0.45 + 레퍼럴 0.15 + 이벤트 0.40 + DEX 5.00 + 검증자 1.25
// 투자자 TGE: 1.35억 (프라이빗 0.45 + 퍼블릭 0.90)
// 재단 예비금 TGE: 0.95억 (운영 0.45 + 긴급 0.50)
export const TGE_TOTAL_UNLOCK = 10.75; // 억 TBURN (전체 공급의 10.75%)
export const TGE_ACTUAL_CIRCULATION = 4.50; // 억 TBURN - v4.3 문서 사양 (LP/스테이킹 제외)

/**
 * DEX 유동성 풀 설정 - v4.0
 */
export interface DEXLiquidityPool {
  pool: string;
  poolKey: string;
  tburnAmount: number; // 억 TBURN
  pairAmount: string;
  initialTVL: string;
}

export const DEX_LIQUIDITY_POOLS: DEXLiquidityPool[] = [
  { pool: 'TBURN/USDT', poolKey: 'tokenomics.dex.tburnUsdt', tburnAmount: 3.00, pairAmount: '$150M USDT', initialTVL: '$300M' },
  { pool: 'TBURN/WETH', poolKey: 'tokenomics.dex.tburnWeth', tburnAmount: 2.00, pairAmount: '25,000 ETH', initialTVL: '$200M' }
];

export const DEX_LP_LOCKUP_DAYS = 365; // 2025.12.22 → 2026.12.22
export const DEX_INITIAL_PRICE = 0.50; // $0.50 / TBURN
export const DEX_TOTAL_TVL = '$500M';

/**
 * AI 기반 소각 메커니즘 - v4.0
 */
export interface BurnMechanism {
  type: string;
  typeKey: string;
  y1Amount: number; // 억 TBURN
  description: string;
  descriptionKey: string;
}

export const BURN_MECHANISMS: BurnMechanism[] = [
  { type: '1. TX 수수료 소각 (50%)', typeKey: 'tokenomics.burn.txFee', y1Amount: 0.50, description: '트랜잭션 수수료의 50% 자동 소각', descriptionKey: 'tokenomics.burn.txFee.desc' },
  { type: '2. 브릿지 수수료 소각 (30%)', typeKey: 'tokenomics.burn.bridgeFee', y1Amount: 0.30, description: '크로스체인 브릿지 수수료 소각', descriptionKey: 'tokenomics.burn.bridgeFee.desc' },
  { type: '3. DeFi 프로토콜 소각', typeKey: 'tokenomics.burn.defi', y1Amount: 0.50, description: 'DEX 스왑 수수료 0.05% 소각', descriptionKey: 'tokenomics.burn.defi.desc' },
  { type: '4. 트레저리 바이백 & 소각', typeKey: 'tokenomics.burn.buyback', y1Amount: 1.30, description: '분기별 바이백 (Q1: 0.20, Q2: 0.30, H2: 0.80)', descriptionKey: 'tokenomics.burn.buyback.desc' },
  { type: '5. 검증자 슬래싱 소각', typeKey: 'tokenomics.burn.slashing', y1Amount: 0.05, description: '슬래싱 토큰 100% 소각', descriptionKey: 'tokenomics.burn.slashing.desc' },
  { type: '6. AI 동적 소각', typeKey: 'tokenomics.burn.aiDynamic', y1Amount: 2.95, description: 'AI 알고리즘 기반 적응형 소각', descriptionKey: 'tokenomics.burn.aiDynamic.desc' }
];

export const Y1_TOTAL_BURN = 5.60; // 억 TBURN

/**
 * 반감기 일정 - v4.0
 */
export interface HalvingSchedule {
  event: string;
  eventKey: string;
  year: number;
  yearLabel: string;
  reductionPercent: number;
  note: string;
  noteKey: string;
}

export const HALVING_SCHEDULE: HalvingSchedule[] = [
  { event: '1차 반감기', eventKey: 'tokenomics.halving.first', year: 6, yearLabel: 'Y6 (2031년)', reductionPercent: -17.6, note: 'Phase 2 시작', noteKey: 'tokenomics.halving.first.note' },
  { event: '2차 반감기', eventKey: 'tokenomics.halving.second', year: 9, yearLabel: 'Y9 (2034년)', reductionPercent: -10, note: '가속 디플레이션', noteKey: 'tokenomics.halving.second.note' }
];

/**
 * 4단계 Phase 전략 - v4.0
 */
export interface PhaseStrategy {
  phase: string;
  phaseKey: string;
  period: string;
  supplyChange: string;
  changePercent: string;
  goal: string;
  goalKey: string;
}

export const PHASE_STRATEGY: PhaseStrategy[] = [
  { phase: 'Phase 1: 성장기', phaseKey: 'tokenomics.phase.growth', period: 'Y1~Y5', supplyChange: '100억 → 84.6억', changePercent: '-15.4%', goal: '생태계 구축, 채택 확대', goalKey: 'tokenomics.phase.growth.goal' },
  { phase: 'Phase 2: 디플레이션기', phaseKey: 'tokenomics.phase.deflation', period: 'Y6~Y10', supplyChange: '84.6억 → 70.8억', changePercent: '-16.3%', goal: '반감기, 가속 소각', goalKey: 'tokenomics.phase.deflation.goal' },
  { phase: 'Phase 3: 균형기', phaseKey: 'tokenomics.phase.equilibrium', period: 'Y11~Y15', supplyChange: '70.8억 → 70.1억', changePercent: '-1.0%', goal: '발행=소각 균형', goalKey: 'tokenomics.phase.equilibrium.goal' },
  { phase: 'Phase 4: 최적화기', phaseKey: 'tokenomics.phase.optimization', period: 'Y16~Y20', supplyChange: '70.1억 → 69.4억', changePercent: '-1.0%', goal: '미세 조정, 비전 완성', goalKey: 'tokenomics.phase.optimization.goal' }
];

/**
 * 문서 정보 - v4.3 Production Ready
 */
export const TOKENOMICS_DOC_INFO = {
  title: 'TBURN 20년 토큰 이코노미 마스터 플랜',
  version: '4.3.0 Production Ready',
  status: '최종 승인 - 제네시스 풀 실행 준비 완료',
  effectiveDate: '2025년 12월 22일',
  planPeriod: '2025년 12월 22일 ~ 2045년 12월 22일 (20년)',
  genesisSupply: '100억 TBURN',
  finalSupply: '69.4억 TBURN',
  totalDeflation: '-30.60%',
  blockRewardPool: '14.5억 TBURN (반감기: Y6, Y9)',
  y1ActivationBudget: '7.75억 TBURN',
  blockTime: '0.5초',
  annualBlocks: 63072000,
  author: 'TBURN Foundation',
  v43Changes: {
    rewards: '23% → 22% (블록보상 14.5억, 검증자 7.5억)',
    ecosystem: '15% → 14% (펀드 7억)',
    team: '12% → 11% (코어팀 7억)',
    foundationReserve: '0% → 3% (운영 1.5억, 긴급 1.0억, 전략 0.5억)',
    investorTGE: '시드 0%, 프라이빗 5%, 퍼블릭 15%'
  }
};

// ============================================================================
// Year-1 토큰 배분 실행 마스터플랜 v4.0.0 Production
// ============================================================================

/**
 * TGE 스마트 컨트랙트 실행 파라미터 - v4.0
 */
export const TGE_CONTRACT_PARAMS = {
  network: 'TBURN Mainnet',
  chainId: 6000,
  tgeTimestamp: 1766275200, // 2025-12-22 00:00:00 UTC
  tokenName: 'TBURN',
  tokenSymbol: 'TBURN',
  decimals: 18,
  totalSupplyWei: '10000000000000000000000000000', // 100억 (Wei)
  blockTime: 0.5, // 초 (500ms)
  monthlyBlocks: 5184000, // 월간 블록 수
  gasUnit: 'Ember (EMB)',
  gasConversion: '1 TBURN = 1,000,000 EMB'
};

/**
 * TGE 즉시 언락 상세 (Day 0) - v4.0
 */
export interface TGEUnlockDetail {
  category: string;
  categoryKey: string;
  tgePercent: number;
  amountBillion: number; // 억 단위
  amountTBURN: number; // TBURN 단위
  purpose: string;
  purposeKey: string;
}

/**
 * TGE 즉시 언락 상세 - v4.3 업계 표준 TGE 적용
 */
export const TGE_UNLOCK_DETAILS: TGEUnlockDetail[] = [
  { category: '에어드랍', categoryKey: 'tokenomics.tgeDetail.airdrop', tgePercent: 10, amountBillion: 1.20, amountTBURN: 120000000, purpose: '초기 커뮤니티 활성화', purposeKey: 'tokenomics.tgeDetail.airdrop.purpose' },
  { category: '마케팅', categoryKey: 'tokenomics.tgeDetail.marketing', tgePercent: 15, amountBillion: 0.45, amountTBURN: 45000000, purpose: '런칭 마케팅 즉시 집행', purposeKey: 'tokenomics.tgeDetail.marketing.purpose' },
  { category: '레퍼럴 보상', categoryKey: 'tokenomics.tgeDetail.referral', tgePercent: 5, amountBillion: 0.15, amountTBURN: 15000000, purpose: '레퍼럴 프로그램 시작', purposeKey: 'tokenomics.tgeDetail.referral.purpose' },
  { category: '이벤트/캠페인', categoryKey: 'tokenomics.tgeDetail.events', tgePercent: 10, amountBillion: 0.40, amountTBURN: 40000000, purpose: '런칭 이벤트 보상', purposeKey: 'tokenomics.tgeDetail.events.purpose' },
  { category: 'DEX 유동성', categoryKey: 'tokenomics.tgeDetail.dex', tgePercent: 100, amountBillion: 5.00, amountTBURN: 500000000, purpose: 'LP 락업 365일', purposeKey: 'tokenomics.tgeDetail.dex.purpose' },
  { category: '제네시스 검증자', categoryKey: 'tokenomics.tgeDetail.validators', tgePercent: 100, amountBillion: 1.25, amountTBURN: 125000000, purpose: '스테이킹 락업', purposeKey: 'tokenomics.tgeDetail.validators.purpose' },
  { category: '프라이빗 라운드', categoryKey: 'tokenomics.tgeDetail.private', tgePercent: 5, amountBillion: 0.45, amountTBURN: 45000000, purpose: '업계 표준 TGE - 중간가 참여', purposeKey: 'tokenomics.tgeDetail.private.purpose' },
  { category: '퍼블릭 세일', categoryKey: 'tokenomics.tgeDetail.public', tgePercent: 15, amountBillion: 0.90, amountTBURN: 90000000, purpose: '업계 표준 TGE - 최고가 참여', purposeKey: 'tokenomics.tgeDetail.public.purpose' },
  { category: '재단 운영 예비금', categoryKey: 'tokenomics.tgeDetail.foundationOps', tgePercent: 30, amountBillion: 0.45, amountTBURN: 45000000, purpose: '초기 운영비, 체인 활성화', purposeKey: 'tokenomics.tgeDetail.foundationOps.purpose' },
  { category: '재단 긴급 예비금', categoryKey: 'tokenomics.tgeDetail.foundationEmergency', tgePercent: 50, amountBillion: 0.50, amountTBURN: 50000000, purpose: '긴급 대응, 체인 안정화', purposeKey: 'tokenomics.tgeDetail.foundationEmergency.purpose' }
];

/**
 * v4.3 문서 사양 TGE 합계 및 실제 유통량 계산
 * 
 * TGE 전체 언락: 10.75억 (10.75%)
 * - 에어드랍: 1.20억, 레퍼럴: 0.15억, 이벤트: 0.40억
 * - 마케팅: 0.45억
 * - 프라이빗: 0.45억, 퍼블릭: 0.90억 (투자자 TGE: 1.35억)
 * - 운영 예비금: 0.45억, 긴급 예비금: 0.50억 (재단 TGE: 0.95억)
 * - DEX 유동성: 5.00억 (LP 락업 365일, 유통량 미포함)
 * - 제네시스 검증자: 1.25억 (스테이킹 락업 365일, 유통량 미포함)
 * 
 * 실제 유통량 = 10.75억 - 5.00억(LP) - 1.25억(스테이킹) = 4.50억
 */
export const TGE_TOTALS = {
  totalUnlock: 10.75,      // 억 TBURN - TGE 전체 언락량 (10.75%)
  lpLockup: 5.00,          // 억 TBURN - DEX LP 락업 (유통량 미포함)
  stakingLockup: 1.25,     // 억 TBURN - 제네시스 검증자 스테이킹 (유통량 미포함)
  investorTGE: 1.35,       // 억 TBURN - 투자자 TGE (프라이빗 0.45 + 퍼블릭 0.90)
  foundationTGE: 0.95,     // 억 TBURN - 재단 예비금 TGE (운영 0.45 + 긴급 0.50)
  actualCirculation: 4.50  // 억 TBURN - v4.3 문서 사양 실제 유통량 (LP/스테이킹 제외)
};

/**
 * 19개 카테고리 베스팅 컨트랙트 설정 - v4.3
 * v4.3 변경: 투자자 TGE 업계 표준 적용, 재단 운영 예비금 3% 신설
 */
export interface VestingCategory {
  id: string;
  category: string;
  categoryKey: string;
  parentCategory: '커뮤니티' | '보상' | '투자자' | '생태계' | '팀' | '재단 예비금';
  allocationPercent: number;
  totalAmount: number; // 억 TBURN
  tgePercent: number;
  cliffMonths: number;
  vestingMonths: number;
  vestingType: 'linear' | 'halving';
  y1ReleasePercent: number;
  y1ReleaseAmount: number; // 억 TBURN
}

/**
 * v4.3 문서 사양 기준 베스팅 카테고리
 * 문서 Section 5.1 전체 카테고리 베스팅 매트릭스 참조
 */
export const VESTING_CATEGORIES: VestingCategory[] = [
  // 커뮤니티 (30%)
  { id: 'airdrop', category: '에어드랍', categoryKey: 'tokenomics.vesting.airdrop', parentCategory: '커뮤니티', allocationPercent: 12, totalAmount: 12.00, tgePercent: 10, cliffMonths: 0, vestingMonths: 12, vestingType: 'linear', y1ReleasePercent: 100, y1ReleaseAmount: 12.00 },
  { id: 'referral', category: '레퍼럴 보상', categoryKey: 'tokenomics.vesting.referral', parentCategory: '커뮤니티', allocationPercent: 3, totalAmount: 3.00, tgePercent: 5, cliffMonths: 0, vestingMonths: 36, vestingType: 'linear', y1ReleasePercent: 36.7, y1ReleaseAmount: 1.10 },
  { id: 'events', category: '이벤트/캠페인', categoryKey: 'tokenomics.vesting.events', parentCategory: '커뮤니티', allocationPercent: 4, totalAmount: 4.00, tgePercent: 10, cliffMonths: 0, vestingMonths: 24, vestingType: 'linear', y1ReleasePercent: 55, y1ReleaseAmount: 2.20 },
  { id: 'community', category: '커뮤니티 활동', categoryKey: 'tokenomics.vesting.community', parentCategory: '커뮤니티', allocationPercent: 3, totalAmount: 3.00, tgePercent: 0, cliffMonths: 3, vestingMonths: 36, vestingType: 'linear', y1ReleasePercent: 25, y1ReleaseAmount: 0.75 },
  { id: 'dao', category: 'DAO 트레저리', categoryKey: 'tokenomics.vesting.dao', parentCategory: '커뮤니티', allocationPercent: 8, totalAmount: 8.00, tgePercent: 0, cliffMonths: 12, vestingMonths: 48, vestingType: 'linear', y1ReleasePercent: 0, y1ReleaseAmount: 0.00 },
  // 보상 (22%) - v4.3: 23%→22%
  { id: 'blockReward', category: '블록 보상', categoryKey: 'tokenomics.vesting.blockReward', parentCategory: '보상', allocationPercent: 14.5, totalAmount: 14.50, tgePercent: 0, cliffMonths: 0, vestingMonths: 240, vestingType: 'halving', y1ReleasePercent: 17.2, y1ReleaseAmount: 2.50 },
  { id: 'validatorIncentive', category: '검증자 인센티브', categoryKey: 'tokenomics.vesting.validatorIncentive', parentCategory: '보상', allocationPercent: 7.5, totalAmount: 7.50, tgePercent: 0, cliffMonths: 0, vestingMonths: 60, vestingType: 'linear', y1ReleasePercent: 20, y1ReleaseAmount: 1.50 },
  // 투자자 (20%) - v4.3 업계 표준 TGE 적용
  { id: 'seed', category: '시드 라운드', categoryKey: 'tokenomics.vesting.seed', parentCategory: '투자자', allocationPercent: 5, totalAmount: 5.00, tgePercent: 0, cliffMonths: 12, vestingMonths: 24, vestingType: 'linear', y1ReleasePercent: 0, y1ReleaseAmount: 0.00 },
  { id: 'private', category: '프라이빗 라운드', categoryKey: 'tokenomics.vesting.private', parentCategory: '투자자', allocationPercent: 9, totalAmount: 9.00, tgePercent: 5, cliffMonths: 9, vestingMonths: 18, vestingType: 'linear', y1ReleasePercent: 21.7, y1ReleaseAmount: 1.95 },
  { id: 'public', category: '퍼블릭 세일', categoryKey: 'tokenomics.vesting.public', parentCategory: '투자자', allocationPercent: 6, totalAmount: 6.00, tgePercent: 15, cliffMonths: 3, vestingMonths: 9, vestingType: 'linear', y1ReleasePercent: 95, y1ReleaseAmount: 5.70 },
  // 생태계 (14%) - v4.3: 15%→14%
  { id: 'ecosystem', category: '생태계 펀드', categoryKey: 'tokenomics.vesting.ecosystem', parentCategory: '생태계', allocationPercent: 7, totalAmount: 7.00, tgePercent: 0, cliffMonths: 0, vestingMonths: 60, vestingType: 'linear', y1ReleasePercent: 20, y1ReleaseAmount: 1.40 },
  { id: 'partnership', category: '파트너십', categoryKey: 'tokenomics.vesting.partnership', parentCategory: '생태계', allocationPercent: 4, totalAmount: 4.00, tgePercent: 0, cliffMonths: 6, vestingMonths: 24, vestingType: 'linear', y1ReleasePercent: 16.7, y1ReleaseAmount: 0.67 },
  { id: 'marketing', category: '마케팅', categoryKey: 'tokenomics.vesting.marketing', parentCategory: '생태계', allocationPercent: 3, totalAmount: 3.00, tgePercent: 15, cliffMonths: 0, vestingMonths: 24, vestingType: 'linear', y1ReleasePercent: 57.7, y1ReleaseAmount: 1.73 },
  // 팀 (11%) - v4.3: 12%→11%
  { id: 'coreTeam', category: '코어 팀', categoryKey: 'tokenomics.vesting.coreTeam', parentCategory: '팀', allocationPercent: 7, totalAmount: 7.00, tgePercent: 0, cliffMonths: 18, vestingMonths: 36, vestingType: 'linear', y1ReleasePercent: 0, y1ReleaseAmount: 0.00 },
  { id: 'advisor', category: '어드바이저', categoryKey: 'tokenomics.vesting.advisor', parentCategory: '팀', allocationPercent: 2, totalAmount: 2.00, tgePercent: 0, cliffMonths: 12, vestingMonths: 24, vestingType: 'linear', y1ReleasePercent: 0, y1ReleaseAmount: 0.00 },
  { id: 'strategicPartner', category: '전략 파트너', categoryKey: 'tokenomics.vesting.strategicPartner', parentCategory: '팀', allocationPercent: 2, totalAmount: 2.00, tgePercent: 0, cliffMonths: 6, vestingMonths: 18, vestingType: 'linear', y1ReleasePercent: 25, y1ReleaseAmount: 0.50 },
  // 재단 운영 예비금 (3%) - v4.3 신설
  { id: 'foundationOps', category: '운영 예비금', categoryKey: 'tokenomics.vesting.foundationOps', parentCategory: '재단 예비금', allocationPercent: 1.5, totalAmount: 1.50, tgePercent: 30, cliffMonths: 0, vestingMonths: 24, vestingType: 'linear', y1ReleasePercent: 65.3, y1ReleaseAmount: 0.98 },
  { id: 'foundationEmergency', category: '긴급 예비금', categoryKey: 'tokenomics.vesting.foundationEmergency', parentCategory: '재단 예비금', allocationPercent: 1.0, totalAmount: 1.00, tgePercent: 50, cliffMonths: 0, vestingMonths: 12, vestingType: 'linear', y1ReleasePercent: 100, y1ReleaseAmount: 1.00 },
  { id: 'strategicInvestment', category: '전략 투자', categoryKey: 'tokenomics.vesting.strategicInvestment', parentCategory: '재단 예비금', allocationPercent: 0.5, totalAmount: 0.50, tgePercent: 0, cliffMonths: 6, vestingMonths: 18, vestingType: 'linear', y1ReleasePercent: 34, y1ReleaseAmount: 0.17 }
];

/**
 * Year-1 월별 종합 언락표 (억 TBURN) - v4.3
 * TGE부터 M12까지 19개 카테고리별 월별 배분 (투자자 TGE 및 재단 예비금 포함)
 */
export interface MonthlyUnlockData {
  category: string;
  categoryId: string;
  tge: number;
  m1: number;
  m2: number;
  m3: number;
  m4: number;
  m5: number;
  m6: number;
  m7: number;
  m8: number;
  m9: number;
  m10: number;
  m11: number;
  m12: number;
  y1Total: number;
  note: string;
}

/**
 * v4.3 문서 사양 Y1 월별 종합 언락표 (억 TBURN)
 * 문서 Section 6.1 참조 - M12 누적 31.65억
 */
export const Y1_MONTHLY_UNLOCKS: MonthlyUnlockData[] = [
  // 커뮤니티 (30%) - 문서 에어드랍 열
  { category: '에어드랍', categoryId: 'airdrop', tge: 1.200, m1: 0.900, m2: 0.900, m3: 0.900, m4: 0.900, m5: 0.900, m6: 0.900, m7: 0.900, m8: 0.900, m9: 0.900, m10: 0.900, m11: 0.900, m12: 0.900, y1Total: 12.000, note: 'TGE 10%+12M 선형 (100%)' },
  { category: '레퍼럴', categoryId: 'referral', tge: 0.150, m1: 0.079, m2: 0.079, m3: 0.079, m4: 0.079, m5: 0.079, m6: 0.079, m7: 0.079, m8: 0.079, m9: 0.079, m10: 0.079, m11: 0.079, m12: 0.079, y1Total: 1.100, note: 'TGE 5%+36M 선형' },
  { category: '이벤트', categoryId: 'events', tge: 0.400, m1: 0.150, m2: 0.150, m3: 0.150, m4: 0.150, m5: 0.150, m6: 0.150, m7: 0.150, m8: 0.150, m9: 0.150, m10: 0.150, m11: 0.150, m12: 0.150, y1Total: 2.200, note: 'TGE 10%+24M 선형' },
  { category: '커뮤니티활동', categoryId: 'community', tge: 0.000, m1: 0.000, m2: 0.000, m3: 0.000, m4: 0.083, m5: 0.083, m6: 0.083, m7: 0.083, m8: 0.083, m9: 0.083, m10: 0.083, m11: 0.083, m12: 0.083, y1Total: 0.750, note: '3M 클리프+36M 선형' },
  { category: 'DAO 트레저리', categoryId: 'dao', tge: 0.000, m1: 0.000, m2: 0.000, m3: 0.000, m4: 0.000, m5: 0.000, m6: 0.000, m7: 0.000, m8: 0.000, m9: 0.000, m10: 0.000, m11: 0.000, m12: 0.000, y1Total: 0.000, note: '12M 클리프' },
  // 보상 (22%) - 문서 보상 열: 월간 0.33억
  { category: '블록보상', categoryId: 'blockReward', tge: 0.000, m1: 0.208, m2: 0.208, m3: 0.208, m4: 0.208, m5: 0.208, m6: 0.208, m7: 0.208, m8: 0.208, m9: 0.208, m10: 0.208, m11: 0.208, m12: 0.208, y1Total: 2.500, note: '블록 생성 즉시' },
  { category: '검증자 인센티브', categoryId: 'validatorIncentive', tge: 0.000, m1: 0.125, m2: 0.125, m3: 0.125, m4: 0.125, m5: 0.125, m6: 0.125, m7: 0.125, m8: 0.125, m9: 0.125, m10: 0.125, m11: 0.125, m12: 0.125, y1Total: 1.500, note: '성과 기반 월간' },
  // 투자자 (20%) - 문서 투자자 열: TGE 1.35억, M4-M9 퍼블릭 0.57억, M10-M12 1.05억
  { category: '시드 라운드', categoryId: 'seed', tge: 0.000, m1: 0.000, m2: 0.000, m3: 0.000, m4: 0.000, m5: 0.000, m6: 0.000, m7: 0.000, m8: 0.000, m9: 0.000, m10: 0.000, m11: 0.000, m12: 0.000, y1Total: 0.000, note: 'TGE 0%+12M 클리프' },
  { category: '프라이빗', categoryId: 'private', tge: 0.450, m1: 0.000, m2: 0.000, m3: 0.000, m4: 0.000, m5: 0.000, m6: 0.000, m7: 0.000, m8: 0.000, m9: 0.000, m10: 0.480, m11: 0.480, m12: 0.480, y1Total: 1.950, note: 'TGE 5%+9M 클리프+18M 선형' },
  { category: '퍼블릭 세일', categoryId: 'public', tge: 0.900, m1: 0.000, m2: 0.000, m3: 0.000, m4: 0.570, m5: 0.570, m6: 0.570, m7: 0.570, m8: 0.570, m9: 0.570, m10: 0.570, m11: 0.570, m12: 0.570, y1Total: 5.700, note: 'TGE 15%+3M 클리프+9M 선형' },
  // 생태계 (14%) - 문서 생태계 열: TGE 1.00억, M1-M6 0.27억, M7-M12 0.50억
  { category: '생태계 펀드', categoryId: 'ecosystem', tge: 0.000, m1: 0.117, m2: 0.117, m3: 0.117, m4: 0.117, m5: 0.117, m6: 0.117, m7: 0.117, m8: 0.117, m9: 0.117, m10: 0.117, m11: 0.117, m12: 0.117, y1Total: 1.400, note: '그랜트 기반' },
  { category: '파트너십', categoryId: 'partnership', tge: 0.000, m1: 0.000, m2: 0.000, m3: 0.000, m4: 0.000, m5: 0.000, m6: 0.000, m7: 0.111, m8: 0.111, m9: 0.111, m10: 0.111, m11: 0.111, m12: 0.111, y1Total: 0.670, note: '6M 클리프+24M 선형' },
  { category: '마케팅', categoryId: 'marketing', tge: 0.450, m1: 0.107, m2: 0.107, m3: 0.107, m4: 0.107, m5: 0.107, m6: 0.107, m7: 0.107, m8: 0.107, m9: 0.107, m10: 0.107, m11: 0.107, m12: 0.107, y1Total: 1.730, note: 'TGE 15%+24M 선형' },
  // 팀 (11%) - 문서: Y1 해제 0.50억 (전략 파트너만)
  { category: '코어 팀', categoryId: 'coreTeam', tge: 0.000, m1: 0.000, m2: 0.000, m3: 0.000, m4: 0.000, m5: 0.000, m6: 0.000, m7: 0.000, m8: 0.000, m9: 0.000, m10: 0.000, m11: 0.000, m12: 0.000, y1Total: 0.000, note: '18M 클리프' },
  { category: '어드바이저', categoryId: 'advisor', tge: 0.000, m1: 0.000, m2: 0.000, m3: 0.000, m4: 0.000, m5: 0.000, m6: 0.000, m7: 0.000, m8: 0.000, m9: 0.000, m10: 0.000, m11: 0.000, m12: 0.000, y1Total: 0.000, note: '12M 클리프' },
  { category: '전략 파트너', categoryId: 'strategicPartner', tge: 0.000, m1: 0.000, m2: 0.000, m3: 0.000, m4: 0.000, m5: 0.000, m6: 0.000, m7: 0.083, m8: 0.083, m9: 0.083, m10: 0.083, m11: 0.083, m12: 0.083, y1Total: 0.500, note: '6M 클리프+18M 선형' },
  // 재단 운영 예비금 (3%) - 문서 재단예비금 열: TGE 0.95억, M1-M6 0.07억, M7-M12 0.10억
  { category: '운영 예비금', categoryId: 'foundationOps', tge: 0.450, m1: 0.044, m2: 0.044, m3: 0.044, m4: 0.044, m5: 0.044, m6: 0.044, m7: 0.044, m8: 0.044, m9: 0.044, m10: 0.044, m11: 0.044, m12: 0.044, y1Total: 0.980, note: 'TGE 30%+24M 선형' },
  { category: '긴급 예비금', categoryId: 'foundationEmergency', tge: 0.500, m1: 0.042, m2: 0.042, m3: 0.042, m4: 0.042, m5: 0.042, m6: 0.042, m7: 0.042, m8: 0.042, m9: 0.042, m10: 0.042, m11: 0.042, m12: 0.042, y1Total: 1.000, note: 'TGE 50%+12M 선형' },
  { category: '전략 투자', categoryId: 'strategicInvestment', tge: 0.000, m1: 0.000, m2: 0.000, m3: 0.000, m4: 0.000, m5: 0.000, m6: 0.000, m7: 0.028, m8: 0.028, m9: 0.028, m10: 0.028, m11: 0.028, m12: 0.028, y1Total: 0.170, note: '6M 클리프+18M 선형' }
];

/**
 * v4.3 문서 사양 월별 합계 및 누적 (억 TBURN)
 * 문서 Section 6.1 참조 - M12 누적 31.65억
 */
export const Y1_MONTHLY_TOTALS = {
  monthly: { tge: 4.50, m1: 1.57, m2: 1.57, m3: 1.57, m4: 2.20, m5: 2.20, m6: 2.20, m7: 2.40, m8: 2.40, m9: 2.40, m10: 2.88, m11: 2.88, m12: 2.88 },
  cumulative: { tge: 4.50, m1: 6.07, m2: 7.64, m3: 9.21, m4: 11.41, m5: 13.61, m6: 15.81, m7: 18.21, m8: 20.61, m9: 23.01, m10: 25.89, m11: 28.77, m12: 31.65 },
  y1Total: 33.03 // 억 TBURN - v4.3 문서 사양 Y1 총 배분량
};

/**
 * 락업 조건 및 덤핑 방지 메커니즘 - v4.3 문서 사양
 */
export const LOCKUP_CONDITIONS = {
  dexLiquidity: {
    tburnUsdtPool: { tburn: 3.00, usdt: '$150M', tvl: '$300M' },
    tburnWethPool: { tburn: 2.00, weth: '25,000 ETH', tvl: '$200M' },
    lpLockupDays: 365,
    lockupPeriod: '2025.12.22 → 2026.12.22',
    lockupContract: 'CertiK 감사 완료',
    multisig: '5/7 멀티시그 + 7일 타임락 비상 언락',
    initialPrice: 0.50
  },
  genesisValidators: {
    validatorCount: 125, // v4.3 문서: 125개 (팀 운영)
    stakePerValidator: 1000000, // 1,000,000 TBURN
    totalStake: 125000000, // TBURN (1.25억)
    source: '코어 팀 배분 (7억) 중 사용',
    unbondingPeriod: 21, // 일
    slashingDowntime: '1%', // 사건당
    slashingDoubleSign: '5% + 영구 감옥 (Jailing)',
    minSelfDelegation: '10%',
    commissionRate: '10% (5-20% 조정 가능)'
  },
  dumpingPrevention: {
    dailySellLimit: '보유량의 5% / 일 (에어드랍 수령자)',
    largeSellCooldown: '일일 한도 초과 시 7일 쿨다운',
    stakingIncentive: '에어드랍 토큰 스테이킹 시 APY +5% 보너스',
    holdingBonus: '30일 이상 홀딩 시 추가 보상 지급'
  }
};

/**
 * Y1 소각 스케줄 - 출처별 목표 (억 TBURN) - v4.0
 */
export interface Y1BurnSource {
  source: string;
  sourceKey: string;
  y1Target: number; // 억 TBURN
  mechanism: string;
  mechanismKey: string;
}

export const Y1_BURN_SOURCES: Y1BurnSource[] = [
  { source: 'TX 수수료 소각', sourceKey: 'tokenomics.y1Burn.txFee', y1Target: 0.50, mechanism: '트랜잭션 수수료의 50% 자동 소각', mechanismKey: 'tokenomics.y1Burn.txFee.mech' },
  { source: '브릿지 수수료 소각', sourceKey: 'tokenomics.y1Burn.bridge', y1Target: 0.30, mechanism: '크로스체인 브릿지 수수료의 30% 소각', mechanismKey: 'tokenomics.y1Burn.bridge.mech' },
  { source: 'DeFi 프로토콜 소각', sourceKey: 'tokenomics.y1Burn.defi', y1Target: 0.50, mechanism: 'DEX 스왑 수수료 0.05% 소각', mechanismKey: 'tokenomics.y1Burn.defi.mech' },
  { source: '트레저리 바이백', sourceKey: 'tokenomics.y1Burn.buyback', y1Target: 1.30, mechanism: 'Q1: 0.20억, Q2: 0.30억, H2: 0.80억', mechanismKey: 'tokenomics.y1Burn.buyback.mech' },
  { source: '검증자 슬래싱 소각', sourceKey: 'tokenomics.y1Burn.slashing', y1Target: 0.05, mechanism: '슬래싱된 토큰 100% 소각', mechanismKey: 'tokenomics.y1Burn.slashing.mech' },
  { source: 'AI 동적 소각', sourceKey: 'tokenomics.y1Burn.aiDynamic', y1Target: 2.95, mechanism: 'AI 알고리즘 기반 시장 상황 반응형 소각', mechanismKey: 'tokenomics.y1Burn.aiDynamic.mech' }
];

export const Y1_BURN_TOTAL = 5.60; // 억 TBURN

/**
 * Y1 분기별 공급량 변화 요약 - v4.0
 */
export interface QuarterlySupplyChange {
  quarter: string;
  quarterKey: string;
  startSupply: number; // 억
  blockEmission: number; // 억
  aiBurn: number; // 억
  endSupply: number; // 억
  netChange: number; // 억
  cumulativeChange: string;
}

export const Y1_QUARTERLY_SUPPLY: QuarterlySupplyChange[] = [
  { quarter: 'Q1 종료', quarterKey: 'tokenomics.y1Supply.q1', startSupply: 100.00, blockEmission: 0.80, aiBurn: -1.00, endSupply: 99.80, netChange: -0.20, cumulativeChange: '-0.20%' },
  { quarter: 'Q2 종료', quarterKey: 'tokenomics.y1Supply.q2', startSupply: 99.80, blockEmission: 0.60, aiBurn: -1.40, endSupply: 99.00, netChange: -0.80, cumulativeChange: '-1.00%' },
  { quarter: 'Y1 종료', quarterKey: 'tokenomics.y1Supply.y1', startSupply: 99.00, blockEmission: 1.20, aiBurn: -3.20, endSupply: 97.00, netChange: -2.00, cumulativeChange: '-3.00%' }
];

/**
 * 카테고리별 Y1 배분 요약 - v4.0
 */
export interface CategoryY1Summary {
  category: string;
  categoryKey: string;
  totalAllocation: number; // 억
  tgeAmount: number; // 억
  y1Release: number; // 억
  y1Percent: number; // %
}

/**
 * v4.3 문서 사양 카테고리별 Y1 배분 요약
 * 문서 Section 5.1 베스팅 매트릭스 참조
 */
export const Y1_CATEGORY_SUMMARY: CategoryY1Summary[] = [
  { category: '커뮤니티 (30%)', categoryKey: 'tokenomics.category.community', totalAllocation: 30.00, tgeAmount: 1.75, y1Release: 16.05, y1Percent: 53.5 },
  { category: '보상 (22%)', categoryKey: 'tokenomics.category.rewards', totalAllocation: 22.00, tgeAmount: 0.00, y1Release: 4.00, y1Percent: 18.2 },
  { category: '투자자 (20%)', categoryKey: 'tokenomics.category.investors', totalAllocation: 20.00, tgeAmount: 1.35, y1Release: 7.65, y1Percent: 38.3 },
  { category: '생태계 (14%)', categoryKey: 'tokenomics.category.ecosystem', totalAllocation: 14.00, tgeAmount: 0.45, y1Release: 3.80, y1Percent: 27.1 },
  { category: '팀 (11%)', categoryKey: 'tokenomics.category.team', totalAllocation: 11.00, tgeAmount: 0.00, y1Release: 0.50, y1Percent: 4.5 },
  { category: '재단 예비금 (3%)', categoryKey: 'tokenomics.category.foundationReserve', totalAllocation: 3.00, tgeAmount: 0.95, y1Release: 2.15, y1Percent: 71.7 }
];

/**
 * v4.3 문서 사양 Y1 합계
 * 문서 Section 1.2 핵심 지표 참조
 */
export const Y1_TOTALS = {
  totalAllocation: 100.00, // 억
  tgeAmount: 4.50, // 억 - 문서 사양 TGE 실제 유통량
  y1Release: 33.03, // 억 - 문서 사양 Y1 총 배분량
  y1Percent: 33.03
};
