# TBURN Blockchain Mainnet Explorer

## Overview
The TBURN Blockchain Mainnet Explorer is a production-ready DeFi platform offering comprehensive insights into the TBURN Mainnet. It provides real-time data, multi-language support, advanced wallet management, staking, and robust token standards (TBC-20/721/1155) with quantum-resistant signatures. The platform integrates AI for burn optimization, governance analysis, and multi-chain bridge risk assessment, aiming to foster adoption and innovation within the TBURN DeFi ecosystem through transparency, efficiency, and security.

## User Preferences
I prefer simple language and detailed explanations. I want iterative development with clear communication on progress. Ask before making major changes to the codebase. Do not make changes to files within the `shared/` directory without explicit approval.

## System Architecture
The platform is built with React 18, TypeScript, Vite, Wouter, and TanStack Query v5. The UI/UX uses Shadcn UI and Tailwind CSS. The backend is an Express.js application with REST APIs and WebSockets, utilizing Neon Serverless PostgreSQL and Drizzle ORM for persistence.

Key architectural features include:
- **Scalability**: Dynamic shard management (5-64 shards), high TPS, and enterprise resilience patterns (`BlockchainOrchestrator`, `PersistenceBatcher`, `AdaptiveFeeEngine`).
- **AI Integration**: Unified configuration for Gemini 3 Pro, Claude Sonnet 4.5, GPT-4o, and Grok 3 with automatic fallback.
- **Internationalization**: Full 12-language support with RTL compatibility.
- **Web3 Wallet Integration**: Supports major wallets (MetaMask, Rabby, Trust, Coinbase, Ledger).
- **Data Policy**: Public and admin pages display real mainnet production data.
- **Admin Portals**: Production-ready portals for Business Intelligence, Analytics, Network Operations, AI Training, and Compliance.
- **Consensus & Block Production**: Enterprise-grade 5-phase BFT consensus, 100ms block time with drift compensation and parallel verification.
- **Validator Management**: Orchestration for 125 genesis validators including performance scoring, slashing, and rewards.
- **Cross-Shard Communication**: Priority queue-based message routing with consistent hashing, adaptive retry, and circuit breakers.
- **Tokenomics**: Canonical data integration for token programs and pricing (`TokenomicsDataService`, `TOKEN_PRICING`).
- **RPC Management**: Production-grade RPC endpoint management with status, interactive documentation, and benchmarking.
- **System Health**: 24/7 monitoring, alerting, and self-healing capabilities.
- **Token Custody**: Production-grade 4-category custody system with a 20-year distribution schedule.
- **Memory Optimization**: Automated management with auto-scaling and object pooling.
- **Database Separation**: Utilizes Replit for separated development and production databases.
- **Delegator Staking**: Comprehensive REST API for staking management.
- **Core Infrastructure**: Transaction Validator, Mempool Service (Fibonacci heap, Bloom filter), State Store (Merkle Patricia Trie, WAL), P2P Network, Fork Choice (LMD-GHOST variant), Genesis Builder, orchestrated by `ProductionBlockchainOrchestrator`.
- **Design Patterns**: Singleton, EventEmitter, LRU Cache, Fibonacci Heap, Bloom Filter, and Write-Ahead Log.
- **Persistence Adapters**: Five Drizzle PostgreSQL adapters for state, sync, bootstrap, block, and validator data with retry logic and write buffering.
- **Sharding & Parallelism**: Shard Processing Coordinator routes transactions to 24 shards; Parallel Shard Block Producer enables horizontal scaling for 100K+ TPS.
- **Remote Signer Architecture**: Isolated key management with GCP Secret Manager, HSM, key rotation, and mTLS.
- **External Validator Program**: Standalone validator node implementation and GCP deployment infrastructure.
- **Security Protocols**: HMAC-SHA256 signature verification, timestamp/nonce validation, rate limiting, mTLS client certificate validation, sensitive data masking, Helmet middleware, HTML escaping, session-bound CSRF protection with auto-retry.
- **Genesis Key Generation**: Production-grade 125 validator key generation and secure storage.
- **Custody Admin System**: Multisig wallet management with 7/11 threshold, Bech32m address validation, and audit logging.
- **Authentication**: Two-step admin authentication with timing-safe password comparison and session-based rate limiting.
- **5대 신기술 통합 시스템** (2026-01-26):
  - **Feature Flag 시스템**: 환경변수로 각 기술을 독립적으로 활성화/비활성화 (`ENABLE_MODULAR_DA`, `ENABLE_RESTAKING`, `ENABLE_ZK_ROLLUP`, `ENABLE_ACCOUNT_ABSTRACTION`, `ENABLE_INTENT_ARCHITECTURE`)
  - **통합 어댑터 패턴**: 기존 시스템 수정 없이 래퍼/어댑터로 신기술 연동
    - `ShardDAAdapter`: 샤딩 ↔ 모듈러 DA 레이어 통합
    - `EnhancedStakingAdapter`: 스테이킹 ↔ 리스테이킹 통합
    - `ZKBridgeAdapter`: 브릿지 ↔ ZK 롤업 통합 (빠른 출금)
    - `SmartWalletAdapter`: 지갑 ↔ 어카운트 추상화 통합 (가스리스 TX, 세션키)
    - `IntentDexAdapter`: DEX ↔ 인텐트 아키텍처 통합 (MEV 보호)
  - **API 엔드포인트**: `/api/advanced-tech/feature-flags`, `/api/advanced-tech/adapters`
  - **목표 성능**: TPS 1,900% 증가, 비용 95% 절감, Web2 수준 UX
  - **⚠️ 토큰노믹스 독립성 보장** (2026-01-26):
    - 리스테이킹 보상은 20년 TBURN 토큰노믹스와 완전히 분리됨
    - 기존 스테이킹 보상: TBURN 토큰 발행 (20년 토큰노믹스 일정)
    - 리스테이킹 보상: AVS 운영자가 지불하는 외부 수수료 (USDT, USDC 등)
    - TBURN 토큰 발행량에 영향 없음
    - 별도 회계 계정(EXTERNAL_AVS_REWARDS)으로 관리
  - **⚠️ 핵심 코어 보호 정책** (2026-01-26):
    - 5대 신기술 어댑터는 TBURN 메인넷 핵심 코어에 영향을 주지 않음
    - 보호되는 핵심 코어 (DO NOT MODIFY):
      - `parallel-shard-block-producer.ts`: 샤드 병렬 블록 생성
      - `shard-processing-coordinator.ts`: 샤드 트랜잭션 라우팅
      - `enterprise-shard-orchestrator.ts`: 샤드 오케스트레이션
      - `enterprise-cross-shard-router.ts`: 크로스샤드 메시징
    - 분리 원칙:
      - 어댑터는 핵심 코어를 import/수정하지 않음
      - 이벤트 기반 느슨한 결합 (EventEmitter)
      - Feature Flag로 완전 비활성화 가능
      - 어댑터 장애 시 핵심 코어 정상 동작 보장
  - **비동기 큐 최적화** (2026-01-26):
    - ShardDAAdapter에 Bounded Buffer 적용 (maxQueueSize: 10,000)
    - 백프레셔 정책: NORMAL → WARNING → CRITICAL → DROPPING
    - Drop Policy: oldest (가장 오래된 항목 먼저 삭제)
    - 지연시간 백분위수 모니터링: P50, P95, P99
    - 샤드 루프 영향 측정: shardLoopImpactMs
  - **조건부 통합 결정 기준** (2026-01-26):
    - 깊은 통합 고려 조건 (현재는 분리 유지):
      1. shardLoopImpactMs > 50ms (기본 임계값)
      2. backpressureState가 CRITICAL 또는 DROPPING
      3. P99 지연시간이 블록 생성 시간의 10% 초과
    - API로 확인: `GET /api/advanced-tech/adapters` → integrationRecommendation
    - 현재 권장: 분리 아키텍처 유지 (어댑터 오버헤드 << 네트워크 지연)
  - **토큰노믹스 자동 배포 시스템** (2026-01-29):
    - **20년 베스팅 스케줄 연동**: GENESIS_ALLOCATION 기반 667개 배포 일정 자동 생성
    - **하이브리드 키 관리**: GCP KMS HSM 6개 키와 핫월렛 연동
    - **카테고리별 KMS 매핑**:
      | 카테고리 | KMS 키 | 할당량 (TBURN) |
      |----------|--------|----------------|
      | COMMUNITY | ecosystem-key | 3,000,000,000 |
      | REWARDS | block-rewards-key | 2,200,000,000 |
      | INVESTORS | investor-vesting-key | 2,000,000,000 |
      | ECOSYSTEM | ecosystem-key | 1,400,000,000 |
      | TEAM | team-vesting-key | 1,100,000,000 |
      | FOUNDATION | treasury-master-key | 300,000,000 |
    - **Wei 변환 규칙**: 모든 TBURN 금액은 내부적으로 wei (10^18) 단위로 저장
    - **Admin API**: `/api/admin/tokenomics-distribution/*` (requireAdmin 미들웨어)
    - **Public API**: `/api/public/v1/tokenomics-distribution/summary` (인증 불필요)

## Security Documentation (2026-01-26)

### SQL Injection Prevention
모든 데이터베이스 쿼리는 Drizzle ORM의 파라미터화된 쿼리를 사용합니다.

**sql.raw() 사용 위치 및 검증 방식:**
| 파일 | 용도 | 검증 방식 |
|------|------|----------|
| `server/routes/db-optimization-routes.ts` | VACUUM ANALYZE | 정규식 검증 (`/^[a-z_][a-z0-9_]*$/i`) |
| `server/routes/token-vesting-routes.ts` | NOT IN 쿼리 | 하드코딩된 상수 배열 (EXCLUDED_TYPES) |
| `server/core/db/enterprise-db-optimizer.ts` | 테이블 통계 | 화이트리스트 검증 |
| `server/db/enterprise-index-optimization.ts` | ANALYZE | 내부 테이블 목록만 사용 |

**입력 검증 유틸리티:**
- `server/utils/sql-security.ts`: `getSafeSortColumn`, `getSafeSortOrder`, `sanitizeSearchString`

### XSS Prevention
- Helmet 미들웨어로 보안 헤더 적용 (`server/app.ts`)
- 프로덕션에서 nonce 기반 CSP (`server/index-prod.ts`, `server/middleware/csp-nonce.ts`)
- `dangerouslySetInnerHTML`은 정적 코드 하이라이팅에만 사용 (사용자 입력 없음)

### Authentication & Authorization
- `crypto.timingSafeEqual`로 비밀번호 비교 (타이밍 공격 방지)
- bcrypt 해싱 (라운드 10-12)
- Rate Limiting: 5회 실패 → 15분 윈도우 → 1시간 락아웃
- 세션 기반 인증: `requireAdmin`, `requireAuth` 미들웨어

### CSRF Protection
- 세션 바인딩 CSRF 토큰 (32바이트, 1시간 만료)
- `validateCsrf` 미들웨어로 상태 변경 라우트 보호
- `timingSafeEqual`로 토큰 비교

### Public Endpoint Protection (2026-01-26)
공개 POST 엔드포인트에 Rate Limiting 및 Zod 스키마 검증 적용:
| 엔드포인트 | Rate Limiter | 제한 |
|-----------|--------------|------|
| `/api/bug-bounty` | bugBountyLimiter | 24시간당 5회 |
| `/api/newsletter/subscribe` | newsletterLimiter | 1시간당 5회 |
| `/api/investment-inquiry` | publicSubmitLimiter | 10분당 10회 |
| `/api/airdrop/claim` | publicSubmitLimiter | 10분당 10회 |
| `/api/referral/apply` | publicSubmitLimiter | 10분당 10회 |
| `/api/events/register` | publicSubmitLimiter | 10분당 10회 |
| `/api/events/claim` | publicSubmitLimiter | 10분당 10회 |

**스키마 정의:** `server/schemas/public-endpoint-schemas.ts`
**미들웨어:** `server/middleware/public-rate-limiter.ts`

## External Dependencies
- **Database**: Neon Serverless PostgreSQL
- **ORM**: Drizzle ORM
- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **UI Library**: Shadcn UI
- **Styling**: Tailwind CSS
- **Data Fetching**: TanStack Query v5
- **Routing**: Wouter
- **Real-time Communication**: `ws`
- **AI Services**: Anthropic Claude, OpenAI GPT, Google Gemini, xAI Grok
- **Charting**: Recharts
- **Validation**: Zod
- **Authentication**: `express-session`, `bcryptjs`, `connect-redis`, `redis`
- **Internationalization**: `react-i18next`