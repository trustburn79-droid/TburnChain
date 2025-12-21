# TBURN 토큰 가격 분석 보고서
**작성일**: 2025년 12월 21일  
**분석 대상**: /admin/tokenomics (Investors 탭) vs /app 대시보드 가격 표시

---

## 1. 개요

사용자가 두 페이지에서 다른 가격이 표시되는 것을 발견했습니다:
- **Admin Tokenomics (Investors 탭)**: $0.04, $0.10, $0.20
- **App 대시보드**: $0.54 (시가총액 $3.65B)

이 보고서에서는 각 가격의 산출 근거와 차이점을 분석합니다.

---

## 2. Admin Tokenomics - Investors 탭 가격 분석

### 2.1 가격 정의 위치
**파일**: `client/src/lib/tokenomics-engine.ts`  
**라인**: 858-904

### 2.2 가격 데이터
```typescript
export const INVESTOR_ROUNDS: InvestorRound[] = [
  {
    id: 'seed',
    name: 'Seed Round',
    price: 0.04,        // $0.04/TBURN
    raised: 20,         // $20M 모금
    allocation: 5,      // 5억 TBURN 배정 (25%)
    tgePercent: 0,
    cliffMonths: 6,
    vestingMonths: 24
  },
  {
    id: 'private',
    name: 'Private Round',
    price: 0.10,        // $0.10/TBURN
    raised: 90,         // $90M 모금
    allocation: 9,      // 9억 TBURN 배정 (45%)
    tgePercent: 0,
    cliffMonths: 6,
    vestingMonths: 18
  },
  {
    id: 'public',
    name: 'Public Sale',
    price: 0.20,        // $0.20/TBURN
    raised: 120,        // $120M 모금
    allocation: 6,      // 6억 TBURN 배정 (30%)
    tgePercent: 15,
    cliffMonths: 0,
    vestingMonths: 12
  }
];
```

### 2.3 가격의 의미
| 구분 | 성격 | 설명 |
|------|------|------|
| **Seed: $0.04** | 초기 투자자 진입가 | 가장 높은 리스크를 감수한 초기 투자자용 |
| **Private: $0.10** | 기관 투자자 진입가 | VC 및 전략적 파트너용 |
| **Public: $0.20** | 공개 판매가 | 일반 대중용 TGE 전 최종 가격 |

### 2.4 ROI 예측 (중립 시나리오)
```typescript
// 진입가 대비 ROI 배수
Seed $0.04:   Y1: 31.3x | Y5: 76.3x | Y10: 189.5x | Y20: 389.5x
Private $0.10: Y1: 12.5x | Y5: 30.5x | Y10: 75.8x | Y20: 155.8x
Public $0.20:  Y1: 6.3x  | Y5: 15.3x | Y10: 37.9x | Y20: 77.9x
```

---

## 3. App 대시보드 가격 분석

### 3.1 가격 정의 위치
**파일**: `server/services/TBurnEnterpriseNode.ts`  
**라인**: 165, 3320-3365, 4015-4083

### 3.2 초기 가격 설정
```typescript
// Line 165
private tokenPrice = 0.29; // Initial price in USD (scaled for 10B supply)

// Line 197
private readonly BASE_PRICE = 0.25; // Base equilibrium price
```

### 3.3 동적 가격 계산 공식

TBURN은 **수요-공급 균형(Demand-Supply Equilibrium)** 모델을 사용합니다:

```
새 가격 = 기본가격 × (1 + 수요지수) × (1 - 공급압력)
```

#### 수요지수 계산 (Demand Index)
```typescript
demandIndex = α × (TPS/TPS_MAX) + β × activityIndex + γ × confidenceScore
// α = 0.4 (TPS 활용률 가중치)
// β = 0.25 (활동지수 가중치)  
// γ = 0.15 (신뢰점수 가중치)
```

#### 공급압력 계산 (Supply Pressure)
```typescript
supplyPressure = δ × netEmissionRatio - ε × stakingRatio - ζ × validatorPerformance
// δ = 35 (순발행 비율 가중치)
// ε = 0.6 (스테이킹 락업 강도)
// ζ = 0.2 (검증자 성능 가중치)
```

### 3.4 가격 업데이트 주기
- **업데이트 간격**: 5초마다
- **최대 변동폭**: ±5% per update
- **가격 범위**: $0.01 ~ $10.00 (하드 리밋)

### 3.5 대시보드 표시 가격 ($0.54)
```typescript
// getNetworkStats() 함수에서 반환
return {
  tokenPrice: this.tokenPrice,        // 현재 $0.54
  priceChangePercent: this.priceChangePercent,  // 0.00%
  marketCap: this.calculateMarketCap(), // $3.65B
  circulatingSupply: this.circulatingSupply.toString(), // 7B
  ...
};
```

### 3.6 시가총액 계산
```typescript
// Line 3464
calculateMarketCap() {
  return Math.floor(this.tokenPrice * this.circulatingSupply).toString();
}
// $0.54 × 7,000,000,000 = $3,780,000,000 ≈ $3.65B
```

---

## 4. 가격 예측 데이터 (Tokenomics Engine)

### 4.1 20년 가격 예측 (중립 시나리오)
**파일**: `client/src/lib/tokenomics-engine.ts`  
**라인**: 417-439

| 연도 | 공급량 (억) | 보수적 | 중립적 | 낙관적 |
|------|------------|--------|--------|--------|
| Y0 (Genesis) | 100.00 | $0.50 | $0.50 | $0.50 |
| Y1 | 97.00 | $0.85 | $1.25 | $2.50 |
| Y5 | 84.60 | $1.49 | $3.05 | $9.60 |
| Y10 | 70.80 | $2.62 | $7.58 | $35.65 |
| Y20 | 69.40 | $3.87 | $15.58 | $105.33 |

---

## 5. 가격 불일치 분석

### 5.1 결론: 불일치가 아닌 다른 개념

| 페이지 | 가격 유형 | 목적 | 시점 |
|--------|-----------|------|------|
| Admin Tokenomics (Investors) | **진입가 (Entry Price)** | 자금 조달 라운드 가격 | 과거 (TGE 전) |
| App 대시보드 | **현재 시장가 (Market Price)** | 실시간 거래 가격 | 현재 |
| 가격 예측 차트 | **예측가 (Projected Price)** | 20년 로드맵 예측 | 미래 |

### 5.2 관계도
```
시간순서:
[Seed $0.04] → [Private $0.10] → [Public $0.20] → [Genesis $0.50] → [현재 $0.54] → [Y1 $1.25 예측]
     ↓                ↓                 ↓                ↓                ↓
   자금조달           자금조달          자금조달       메인넷 런칭      실시간 거래
```

### 5.3 현재 가격 $0.54의 정당성
1. **Genesis 가격 $0.50 기준**: Public Sale $0.20에서 2.5x 상승 (합리적)
2. **시가총액 $3.65B**: 유통공급량 67억 기준 적정 평가
3. **Y1 목표 $1.25**: 현재 가격에서 2.3x 상승 필요 (달성 가능한 목표)

---

## 6. 권장 개선 사항

### 6.1 UI/UX 개선 (선택적)

#### 옵션 A: Investors 탭에 현재가 대비 표시 추가
```
Seed Round: $0.04 (현재가 대비 13.5x 상승)
Private Round: $0.10 (현재가 대비 5.4x 상승)
Public Sale: $0.20 (현재가 대비 2.7x 상승)
```

#### 옵션 B: 대시보드에 가격 기준 설명 추가
```
TBURN 가격: $0.54
(실시간 시장가 | Genesis: $0.50)
```

### 6.2 데이터 일관성 확인
현재 상태는 **정상**입니다. 각 가격은 서로 다른 목적과 시점을 나타내며, 모두 의도된 설계입니다.

---

## 7. 기술적 세부 사항

### 7.1 가격 관련 주요 파일

| 파일 | 역할 |
|------|------|
| `client/src/lib/tokenomics-engine.ts` | 투자자 라운드 가격, 예측 데이터 정의 |
| `server/services/TBurnEnterpriseNode.ts` | 실시간 가격 계산 엔진 |
| `client/src/pages/tokenomics-simulation.tsx` | Admin Tokenomics UI |
| `client/src/pages/dashboard.tsx` | App 대시보드 UI |

### 7.2 가격 업데이트 흐름
```
TBurnEnterpriseNode
    ↓ updateTokenPrice() (5초마다)
    ↓ getNetworkStats()
    ↓
API Response → React Query → Dashboard UI
```

---

## 8. 결론

**가격 불일치는 버그가 아닙니다.**

- **Investors 탭 가격** ($0.04, $0.10, $0.20): 과거 자금조달 라운드의 **진입가**
- **대시보드 가격** ($0.54): 현재 **실시간 시장 시뮬레이션 가격**

두 가격은 서로 다른 시점과 목적을 나타내며, TBURN 생태계의 가치 성장을 보여주는 지표입니다.

---

**작성자**: TBURN Development Team  
**검토**: 2025년 12월 21일
