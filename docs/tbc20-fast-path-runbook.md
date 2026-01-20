# TBC-20 Fast Path 운영 런북

## 개요

TBC-20 Fast Path는 EVM 바이패스를 통해 TBC-20 토큰 작업에 대해 8μs/TX 성능을 달성하는 최적화된 실행 경로입니다. 이 런북은 운영팀이 Fast Path 시스템을 안전하게 관리하기 위한 가이드를 제공합니다.

---

## 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────────┐
│                    Transaction Classifier                        │
│  (TBC-20 selector 검증 → fast path / EVM fallback 라우팅)        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
           ┌───────────────┴───────────────┐
           ▼                               ▼
┌──────────────────────┐       ┌──────────────────────┐
│   TBC-20 Fast Path   │       │   Standard EVM       │
│   (8μs/TX target)    │       │   (20μs/TX)          │
└──────────┬───────────┘       └──────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────┐
│                   FastPathStateAdapter                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│  │  Async Prefetch │→→│   Sync Snapshot │→→│  Write Buffer   │   │
│  │  (balances,     │  │   (read-only)   │  │  (WAL batch)    │   │
│  │   allowances)   │  │                 │  │                 │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────┐
│                    EnterpriseStateStore                           │
│  (Merkle Patricia Trie + Write-Ahead Log)                        │
└──────────────────────────────────────────────────────────────────┘
```

---

## 토큰 레지스트리 관리

### 레지스트리 구조

```typescript
interface TBC20TokenInfo {
  address: string;           // tb1 Bech32m 주소
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
  aiOptimized: boolean;      // fast path 적격 여부
  factoryDeployed: boolean;  // factory 배포 여부
  registeredAt: number;
  lastVerified: number;
}
```

### 신규 토큰 등록

**사전 요구사항:**
1. 토큰이 TBC-20 Factory(`tb1xepm7flrnk8s567dzhg27wyxth08mex0fckt2y`)에서 배포됨
2. 표준화된 슬롯 레이아웃 사용 (balances: 0, allowances: 1, totalSupply: 2)
3. `aiOptimized` 플래그가 true로 설정됨

**등록 절차:**

```bash
# 1. 토큰 검증
curl -X POST https://api.tburn.io/api/tbc20-fast-path/registry/verify \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tokenAddress": "tb1..."}'

# 2. 레지스트리에 추가
curl -X POST https://api.tburn.io/api/tbc20-fast-path/registry/add \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tokenAddress": "tb1...",
    "name": "Token Name",
    "symbol": "TKN",
    "decimals": 18,
    "aiOptimized": true
  }'

# 3. 등록 확인
curl https://api.tburn.io/api/tbc20-fast-path/registry/tb1...
```

### 토큰 제거

**주의사항:**
- 활성 거래가 진행 중인 토큰은 제거 전 pause 상태로 전환해야 함
- 제거 후 해당 토큰의 모든 작업은 EVM fallback으로 처리됨

```bash
# 1. 토큰 pause (soft disable)
curl -X POST https://api.tburn.io/api/tbc20-fast-path/registry/pause \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"tokenAddress": "tb1..."}'

# 2. pending 트랜잭션 완료 대기 (최소 30초)
sleep 30

# 3. 레지스트리에서 제거
curl -X DELETE https://api.tburn.io/api/tbc20-fast-path/registry/tb1... \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Pause 전파 관리

### Pause 상태 종류

| 상태 | 설명 | Fast Path | EVM Fallback |
|------|------|-----------|--------------|
| `active` | 정상 운영 | ✅ 사용 | ❌ 비활성 |
| `paused` | 일시 중지 | ❌ 비활성 | ✅ 사용 |
| `deprecated` | 폐기 예정 | ❌ 비활성 | ✅ 사용 |
| `removed` | 제거됨 | ❌ 비활성 | ✅ 사용 |

### 전체 시스템 Pause

**긴급 상황에서 전체 Fast Path 비활성화:**

```bash
# 전체 Fast Path 비활성화
curl -X POST https://api.tburn.io/api/tbc20-fast-path/system/pause \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"reason": "Emergency maintenance"}'

# 상태 확인
curl https://api.tburn.io/api/tbc20-fast-path/system/status

# 재활성화
curl -X POST https://api.tburn.io/api/tbc20-fast-path/system/resume \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 샤드별 Pause

특정 샤드에서 병목 발생 시:

```bash
# 샤드 12의 Fast Path 비활성화
curl -X POST https://api.tburn.io/api/tbc20-fast-path/shard/12/pause \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"reason": "High pending write depth"}'

# 샤드 12 재활성화
curl -X POST https://api.tburn.io/api/tbc20-fast-path/shard/12/resume \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 텔레메트리 및 알림

### 주요 메트릭

| 메트릭 | 경고 임계값 | 위험 임계값 | 설명 |
|--------|------------|------------|------|
| `pendingWriteDepth` | 700 (70%) | 1000 (100%) | 대기 중인 쓰기 작업 수 |
| `snapshotAgeMs` | 80ms (80%) | 100ms (100%) | 스냅샷 생성 후 경과 시간 |
| `avgExecutionTimeUs` | 40μs | 50μs | 평균 실행 시간 |
| `fastPathHitRate` | < 0.9 | < 0.7 | Fast Path 적중률 |

### Prometheus 메트릭 엔드포인트

```bash
curl https://api.tburn.io/api/tbc20-fast-path/metrics/prometheus
```

**주요 메트릭:**
```prometheus
# 샤드별 pending write depth
tbc20_fast_path_pending_writes{shard="0"} 45
tbc20_fast_path_pending_writes{shard="1"} 32

# 샤드별 스냅샷 age
tbc20_fast_path_snapshot_age_ms{shard="0"} 12.5
tbc20_fast_path_snapshot_age_ms{shard="1"} 8.3

# 샤드별 실행 시간
tbc20_fast_path_execution_time_us{shard="0"} 7.8
tbc20_fast_path_execution_time_us{shard="1"} 8.1

# 전역 통계
tbc20_fast_path_tx_processed_total 15432567
tbc20_fast_path_tx_failed_total 234
tbc20_fast_path_hit_rate 0.9876
```

### 알림 대응 가이드

#### 경고: Pending Write Depth 높음

```
⚠️ Shard 5: Pending write depth approaching limit (750/1000)
```

**대응 절차:**
1. 해당 샤드의 트래픽 패턴 확인
2. WAL flush 상태 확인
3. 필요시 샤드 pause 후 drain

```bash
# 상태 확인
curl https://api.tburn.io/api/tbc20-fast-path/shard/5/metrics

# WAL flush 강제 실행
curl -X POST https://api.tburn.io/api/tbc20-fast-path/shard/5/flush \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### 위험: Snapshot Age 초과

```
🚨 Shard 8: Snapshot age CRITICAL (105ms/100ms)
```

**대응 절차:**
1. 즉시 해당 샤드 pause
2. 스냅샷 재생성 트리거
3. 원인 분석 후 재활성화

```bash
# 샤드 pause
curl -X POST https://api.tburn.io/api/tbc20-fast-path/shard/8/pause \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"reason": "Critical snapshot age"}'

# 스냅샷 갱신
curl -X POST https://api.tburn.io/api/tbc20-fast-path/shard/8/refresh-snapshot \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 상태 확인 후 재활성화
curl -X POST https://api.tburn.io/api/tbc20-fast-path/shard/8/resume \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 트러블슈팅

### 문제: Fast Path 적중률 저하

**증상:** `fastPathHitRate` < 0.9

**원인 및 해결:**

1. **레지스트리 미등록 토큰 증가**
   ```bash
   # 미등록 토큰 트래픽 확인
   curl https://api.tburn.io/api/tbc20-fast-path/metrics/unregistered
   
   # 빈번한 토큰 등록
   curl -X POST https://api.tburn.io/api/tbc20-fast-path/registry/add ...
   ```

2. **비표준 슬롯 레이아웃 토큰**
   ```bash
   # 슬롯 레이아웃 검증 실패 토큰 확인
   curl https://api.tburn.io/api/tbc20-fast-path/metrics/layout-failures
   ```

3. **복잡한 트랜잭션 증가 (transferFrom with hooks)**
   - 이러한 트랜잭션은 의도적으로 EVM으로 라우팅됨
   - 정상 동작으로 간주

### 문제: 실행 시간 증가

**증상:** `avgExecutionTimeUs` > 12μs

**진단:**
```bash
# 상세 실행 프로파일 확인
curl https://api.tburn.io/api/tbc20-fast-path/metrics/profile

# 결과 예시:
{
  "prefetchTimeUs": 2.1,
  "validationTimeUs": 0.8,
  "executionTimeUs": 5.2,
  "commitTimeUs": 3.9,
  "totalTimeUs": 12.0
}
```

**해결:**
- `prefetchTimeUs` 높음: 캐시 예열 필요
- `commitTimeUs` 높음: WAL 배칭 튜닝 필요

### 문제: 트랜잭션 실패 증가

**증상:** 갑작스러운 실패율 증가

**진단:**
```bash
# 실패 원인 분석
curl https://api.tburn.io/api/tbc20-fast-path/metrics/failures

# 결과 예시:
{
  "insufficientBalance": 45,
  "insufficientAllowance": 12,
  "invalidSignature": 0,
  "staleSnapshot": 3,
  "writeConflict": 0
}
```

**대응:**
- `staleSnapshot` > 0: 스냅샷 갱신 빈도 증가 필요
- `writeConflict` > 0: 동시성 문제, 샤드 분리 검토

---

## 유지보수 절차

### 정기 점검 (매주)

1. 레지스트리 상태 검토
2. 메트릭 트렌드 분석
3. 알림 히스토리 검토
4. 미등록 토큰 트래픽 확인

### 업그레이드 절차

1. **준비**
   ```bash
   # 전체 시스템 pause
   curl -X POST https://api.tburn.io/api/tbc20-fast-path/system/pause \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -d '{"reason": "Scheduled upgrade"}'
   
   # pending 작업 drain 대기
   curl https://api.tburn.io/api/tbc20-fast-path/system/drain-status
   ```

2. **업그레이드 실행**
   - 코드 배포
   - 서비스 재시작

3. **검증**
   ```bash
   # 상태 확인
   curl https://api.tburn.io/api/tbc20-fast-path/system/status
   
   # 테스트 트랜잭션 실행
   curl -X POST https://api.tburn.io/api/tbc20-fast-path/test \
     -H "Authorization: Bearer $ADMIN_TOKEN"
   ```

4. **재활성화**
   ```bash
   curl -X POST https://api.tburn.io/api/tbc20-fast-path/system/resume \
     -H "Authorization: Bearer $ADMIN_TOKEN"
   ```

---

## 연락처

- **운영팀**: ops@tburn.io
- **긴급 상황**: +82-xxx-xxxx-xxxx
- **Slack**: #tburn-fast-path-ops

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|----------|
| 2026-01-20 | 1.0 | 초기 런북 생성 |
