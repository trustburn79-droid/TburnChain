# 🏦 TBURN 토큰 이코노믹스 엔터프라이즈 가이드

## 📋 개요
TBURN 블록체인의 토큰 경제 시스템은 총 발행량 100M TBURN을 기반으로 검증자 인센티브, 네트워크 보안, 토큰 가치 안정성을 균형있게 고려하여 설계되었습니다.

## 📊 토큰 배분 전략

### 초기 토큰 배분 (100,000,000 TBURN)

| 카테고리 | 수량 | 비율 | 용도 |
|---------|------|------|------|
| 🏆 검증자 보상 풀 | 35,000,000 | 35% | 네트워크 보안 및 검증자 인센티브 |
| 👥 커뮤니티 인센티브 | 20,000,000 | 20% | 생태계 성장 및 커뮤니티 보상 |
| 💧 생태계 유동성 | 15,000,000 | 15% | DEX 유동성 및 시장 조성 |
| 🔬 개발/R&D 펀드 | 12,000,000 | 12% | 기술 개발 및 연구 |
| 🏛️ 재무부 리저브 | 8,000,000 | 8% | 긴급 상황 대비 예비 자금 |
| 💰 초기 유통 | 10,000,000 | 10% | 초기 시장 유동성 |

```
┌─────────────────────────────────────┐
│  TBURN 100M 토큰 배분 차트          │
├─────────────────────────────────────┤
│ ████████████████ 35% 검증자 보상    │
│ █████████ 20% 커뮤니티              │
│ ███████ 15% 생태계 유동성           │
│ █████ 12% 개발/R&D                  │
│ ███ 8% 재무부                       │
│ ████ 10% 초기 유통                  │
└─────────────────────────────────────┘
```

## ⚡ 동적 가스 가격 메커니즘

### 기본 구조
가스 가격은 네트워크 상황에 따라 동적으로 조정되어 경제적 효율성을 유지합니다.

```typescript
effectiveGasPrice = baseGasPrice × congestionMultiplier × QoSFactor
```

### 파라미터 설명

| 파라미터 | 값/범위 | 설명 |
|---------|--------|------|
| `baseGasPrice` | 0.00001 TBURN | 기본 가스 가격 |
| `congestionMultiplier` | 0.05 ~ 0.2 | 네트워크 혼잡도에 따른 계수 |
| `QoSFactor` | 0.8 ~ 1.2 | 서비스 품질 계수 |
| **실효 가격 범위** | 0.0000008 ~ 0.000003 TBURN | 최종 가스 가격 |

### 연간 가스 수수료 목표
- **목표 수수료**: 연간 6M TBURN 이하
- **블록당 평균 수수료**: ~0.6 TBURN
- **트랜잭션당 평균 비용**: 0.00016 ~ 0.0006 TBURN

## 💎 검증자 보상 구조

### 블록당 보상 계산

#### 1. 발행 보상 (Emission Rewards)
```
발행 보상 = (연간 인플레이션율 × 유통 공급량) / 연간 블록 수

예시 (1년차):
= (3% × 100,000,000) / 10,512,000
= 0.285 TBURN/블록
```

#### 2. 가스 수수료 분배
```
총 가스 수수료 = gasUsed × effectiveGasPrice

분배 구조:
├─ 블록 제안자: 30%
├─ 위임자 풀: 30%
├─ 보안 리저브: 20%
└─ 소각(Burn): 20%
```

### 검증자별 보상 가중치 공식

```typescript
validatorReward = (
    stakeWeight × 0.6 +        // 스테이킹 가중치 (60%)
    performanceScore × 0.25 +   // 성능 점수 (25%)
    uptime × 0.15               // 가동시간 (15%)
) × (RewardBlock / ΣWeights)
```

#### 스테이크 가중치 계산
- **최소 스테이킹**: 50,000 TBURN
- **최대 스테이킹**: 800,000 TBURN
- **로그 스케일 적용**: 대규모 스테이커의 지배 방지

## 📈 인플레이션/디플레이션 스케줄

### 10년 공급량 전망

| 연도 | 인플레이션율 | 발행량 | 소각 예상 | 순 공급량 | 누적 공급량 |
|------|------------|--------|----------|----------|------------|
| 1년차 | 3.0% | 3.0M | 1.0M | 2.0M | 102.0M |
| 2년차 | 2.5% | 2.6M | 1.0M | 1.6M | 103.6M |
| 3년차 | 2.5% | 2.6M | 1.1M | 1.5M | 105.1M |
| 4년차 | 2.0% | 2.1M | 1.1M | 1.0M | 106.1M |
| 5년차 | 2.0% | 2.1M | 1.1M | 1.0M | 107.1M |
| 6년차 | 1.5% | 1.6M | 1.2M | 0.4M | 107.5M |
| 7년차 | 1.5% | 1.6M | 1.2M | 0.4M | 107.9M |
| 8년차 | 1.0% | 1.1M | 1.2M | -0.1M | 107.8M |
| 9년차 | 1.0% | 1.1M | 1.2M | -0.1M | 107.7M |
| 10년차 | 1.0% | 1.1M | 1.2M | -0.1M | 107.6M |

**주요 특징**:
- 8년차부터 디플레이션 전환 (소각 > 발행)
- 10년 후 순 공급량: ~107.6M TBURN
- 장기적 희소성 증대

## 💰 검증자 수익성 분석

### 연간 수익 구조

#### 개별 검증자 기준 (평균)
```
기본 발행 보상:     24,000 TBURN/년
가스 수수료 분배:   24,000 TBURN/년
─────────────────────────────────
총 예상 수익:       48,000 TBURN/년

평균 스테이킹:     425,000 TBURN
예상 APY:          ~11.3%
```

### 스테이킹 규모별 APY

| 스테이킹 규모 | 연간 보상 | APY |
|-------------|----------|-----|
| 50,000 TBURN | 6,500 TBURN | 13.0% |
| 200,000 TBURN | 24,000 TBURN | 12.0% |
| 425,000 TBURN | 48,000 TBURN | 11.3% |
| 800,000 TBURN | 80,000 TBURN | 10.0% |

## 🔥 가스 수수료 소각 메커니즘

### 소각 계산
```
블록당 가스 사용:    25-30M gas
효과적 가스 가격:    ~0.000002 TBURN
블록당 총 수수료:    ~0.6 TBURN

소각량 (20%):       0.12 TBURN/블록
일일 소각:          3,456 TBURN
연간 소각:          ~1,260,000 TBURN
```

### 순 인플레이션 영향
```
총 발행 (3%):       3,000,000 TBURN
총 소각:           -1,260,000 TBURN
─────────────────────────────────
순 인플레이션:       1,740,000 TBURN (1.74%)
```

## 🛠️ 기술 구현 사양

### 1. 토큰 이코노믹스 모듈 구조

```typescript
// shared/tokenomics.ts
export const TOKENOMICS_CONFIG = {
  // 토큰 공급
  TOTAL_SUPPLY: 100_000_000,
  INITIAL_CIRCULATION: 10_000_000,
  VALIDATOR_POOL: 35_000_000,
  COMMUNITY_POOL: 20_000_000,
  ECOSYSTEM_POOL: 15_000_000,
  DEVELOPMENT_FUND: 12_000_000,
  TREASURY_RESERVE: 8_000_000,
  
  // 인플레이션 스케줄 (연도별 %)
  ANNUAL_INFLATION_SCHEDULE: [
    3.0,  // Year 1
    2.5,  // Year 2
    2.5,  // Year 3
    2.0,  // Year 4
    2.0,  // Year 5
    1.5,  // Year 6
    1.5,  // Year 7
    1.0,  // Year 8
    1.0,  // Year 9
    1.0   // Year 10+
  ],
  
  // 가스 가격
  GAS_PRICE: {
    BASE: 0.00001,
    CONGESTION_MULTIPLIER: {
      MIN: 0.05,
      MAX: 0.2
    },
    QOS_FACTOR: {
      MIN: 0.8,
      MAX: 1.2
    }
  },
  
  // 수수료 분배
  FEE_DISTRIBUTION: {
    PROPOSER: 0.30,        // 30% to block proposer
    DELEGATORS: 0.30,      // 30% to delegator pool
    SECURITY_RESERVE: 0.20, // 20% to security fund
    BURN: 0.20             // 20% burned
  },
  
  // 검증자 보상 가중치
  VALIDATOR_WEIGHTS: {
    STAKE: 0.60,
    PERFORMANCE: 0.25,
    UPTIME: 0.15
  },
  
  // 네트워크 파라미터
  NETWORK: {
    BLOCKS_PER_YEAR: 10_512_000,  // ~3 second blocks
    MIN_VALIDATOR_STAKE: 50_000,
    MAX_VALIDATOR_STAKE: 800_000,
    VALIDATOR_COMMISSION_DEFAULT: 0.05,  // 5%
    VALIDATOR_COMMISSION_MAX: 0.20       // 20%
  }
};
```

### 2. 데이터베이스 스키마 확장

```sql
-- 토큰 이코노믹스 상태 테이블
CREATE TABLE tokenomics_state (
  id SERIAL PRIMARY KEY,
  current_supply NUMERIC(20, 6) NOT NULL,
  circulating_supply NUMERIC(20, 6) NOT NULL,
  total_burned NUMERIC(20, 6) NOT NULL DEFAULT 0,
  total_rewards_distributed NUMERIC(20, 6) NOT NULL DEFAULT 0,
  current_inflation_rate NUMERIC(5, 2) NOT NULL,
  last_halving_block BIGINT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 검증자 보상 스냅샷
CREATE TABLE validator_reward_snapshots (
  id SERIAL PRIMARY KEY,
  validator_address VARCHAR(66) NOT NULL,
  block_number BIGINT NOT NULL,
  emission_reward NUMERIC(20, 6) NOT NULL,
  fee_reward NUMERIC(20, 6) NOT NULL,
  total_reward NUMERIC(20, 6) NOT NULL,
  stake_weight NUMERIC(5, 4) NOT NULL,
  performance_score NUMERIC(5, 4) NOT NULL,
  uptime_score NUMERIC(5, 4) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  INDEX idx_validator_block (validator_address, block_number)
);

-- 가스 수수료 기록
CREATE TABLE gas_fee_history (
  id SERIAL PRIMARY KEY,
  block_number BIGINT NOT NULL,
  total_gas_used BIGINT NOT NULL,
  effective_gas_price NUMERIC(20, 10) NOT NULL,
  total_fees NUMERIC(20, 6) NOT NULL,
  proposer_share NUMERIC(20, 6) NOT NULL,
  delegator_share NUMERIC(20, 6) NOT NULL,
  security_share NUMERIC(20, 6) NOT NULL,
  burned_amount NUMERIC(20, 6) NOT NULL,
  congestion_multiplier NUMERIC(5, 4) NOT NULL,
  qos_factor NUMERIC(5, 4) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  INDEX idx_block_fees (block_number)
);
```

### 3. API 엔드포인트

```typescript
// 토큰 이코노믹스 요약
GET /api/tokenomics/summary
Response: {
  totalSupply: string,
  circulatingSupply: string,
  totalBurned: string,
  currentInflationRate: number,
  blockReward: string,
  avgGasPrice: string,
  validatorAPY: number
}

// 검증자 보상 내역
GET /api/validators/:address/rewards
Query: { from: timestamp, to: timestamp }
Response: {
  totalRewards: string,
  emissionRewards: string,
  feeRewards: string,
  averageAPY: number,
  rewardHistory: Array<RewardSnapshot>
}

// 가스 통계
GET /api/gas/statistics
Response: {
  currentGasPrice: string,
  avgGasPrice24h: string,
  totalBurned24h: string,
  congestionLevel: "low" | "medium" | "high"
}
```

## 📊 모니터링 대시보드 요구사항

### 실시간 메트릭
1. **공급량 추적**
   - 현재 총 공급량
   - 유통 공급량
   - 락업된 토큰
   - 소각된 토큰

2. **인플레이션 메트릭**
   - 현재 인플레이션율
   - 일일/월간/연간 발행량
   - 순 인플레이션 (발행 - 소각)

3. **검증자 메트릭**
   - 평균 APY
   - 총 스테이킹 규모
   - 활성 검증자 수
   - 보상 분포 차트

4. **가스 메트릭**
   - 실시간 가스 가격
   - 24시간 평균 가격
   - 네트워크 혼잡도
   - 소각률 추이

### 알림 설정
- 소각 > 발행 (디플레이션 전환)
- 검증자 APY < 8% (최소 수익률 미달)
- 가스 가격 급등 (>10x 베이스 가격)
- 순환 공급량 임계값 도달

## 🎯 핵심 성과 지표 (KPI)

| 지표 | 목표 | 측정 주기 |
|-----|------|----------|
| 검증자 APY | 10-15% | 일일 |
| 순 인플레이션율 | <2% | 월간 |
| 네트워크 보안 (스테이킹 비율) | >60% | 주간 |
| 가스 수수료 수익 | <6M TBURN/년 | 분기 |
| 토큰 소각률 | >1M TBURN/년 | 월간 |
| 검증자 참여율 | >95% | 일일 |
| 위임자 수 | 지속 증가 | 월간 |

## 🔮 장기 전망 및 조정 메커니즘

### 거버넌스 조정 가능 파라미터
- 인플레이션 스케줄
- 가스 가격 베이스라인
- 수수료 분배 비율
- 소각 비율
- 검증자 보상 가중치
- 최소/최대 스테이킹 한도

### 자동 조정 메커니즘
1. **혼잡도 기반 가스 가격**: 네트워크 사용량에 따른 자동 조정
2. **성능 기반 보상**: 검증자 성능에 따른 보상 차등화
3. **동적 소각률**: 인플레이션 목표에 따른 소각 비율 조정

### 비상 대응 계획
- **과도한 인플레이션**: 소각률 상향 조정
- **검증자 이탈**: 긴급 보상 인상
- **가격 급락**: 재무부 리저브 활용
- **네트워크 공격**: 보안 리저브 펀드 활용

## 📚 참고 자료 및 벤치마크

### 유사 블록체인 비교
| 네트워크 | 총 공급량 | 인플레이션율 | 검증자 APY | 가스 소각 |
|---------|----------|------------|-----------|----------|
| TBURN | 100M | 3%→1% | 11.3% | 20% |
| Ethereum | 120M | ~0.5% | 3-5% | 100% |
| Cosmos | 286M | 7-20% | 15-20% | 0% |
| Solana | 570M | 5-7% | 6-8% | 50% |

### 차별화 요소
1. **균형잡힌 소각 메커니즘**: 20% 소각으로 인플레이션 상쇄
2. **동적 가스 조정**: 네트워크 상황 반영
3. **다층 보상 구조**: 스테이킹+성능+가동시간 고려
4. **장기 디플레이션**: 8년차 이후 순 감소

---

*이 문서는 TBURN v7.0 메인넷의 공식 토큰 이코노믹스 가이드입니다.*
*최종 업데이트: 2025년 11월*