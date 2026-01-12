# TBURN Blockchain Mainnet Explorer

## Chain Configuration
- **Chain ID**: 5800 (0x16a8)
- **Currency**: TBURN
- **Network**: TBURN Mainnet
- **Genesis Validators**: 125
- **Target TPS**: 210,000
- **Block Time**: 100ms

## Overview
The TBURN Blockchain Mainnet Explorer is a production-ready DeFi ecosystem platform designed to provide comprehensive insights into the TBURN Mainnet. It features extensive public and authenticated application pages, supporting 12 languages with RTL compatibility. The platform integrates advanced AI for burn optimization, governance analysis, and multi-chain bridge risk assessment. Key capabilities include a real-time dashboard with tokenomics, block and transaction explorers, advanced wallet management, robust token standards (TBC-20/721/1155) with quantum-resistant signatures, staking, and a full suite of DeFi functionalities. The project's vision is to establish a transparent, efficient, and secure gateway to the TBURN Mainnet, thereby fostering adoption and innovation within its DeFi ecosystem.

## User Preferences
I prefer simple language and detailed explanations. I want iterative development with clear communication on progress. Ask before making major changes to the codebase. Do not make changes to files within the `shared/` directory without explicit approval.

## System Architecture
The platform utilizes a modern web stack with React 18, TypeScript, Vite, Wouter for routing, and TanStack Query v5 for frontend data fetching. The UI/UX features a clean design using Space Grotesk and JetBrains Mono typography, implemented with Shadcn UI and Tailwind CSS. The backend is an Express.js application providing REST APIs and WebSockets for real-time updates. Data persistence is managed by Neon Serverless PostgreSQL with Drizzle ORM.

Core architectural decisions include:
- **Dynamic Shard Management**: Supports dynamic scaling of shards (5-64) and validators with transactional updates, targeting 210,000 TPS.
- **Unified AI Model Configuration**: Integrates Gemini 3 Pro, Claude Sonnet 4.5, GPT-4o, and Grok 3 with automatic fallback.
- **Internationalization**: Full 12-language support (en, ko, zh, ja, es, fr, pt, ru, ar, hi, bn, ur) with English as default. RTL support for Arabic and Urdu. Complete i18n coverage for `/referral` (9 sections) and `/block-rewards` (32 translation keys per language covering nav, hero, stats, cta, validators, validatorTypes, halving, distribution, slashingSection, slashing, calculator, activeValidators, faq, ctaSection, footer, toast).
- **Web3 Wallet Integration**: Supports major wallets (MetaMask, Rabby, Trust, Coinbase, Ledger).
- **Production Data Policy**: All public pages and admin dashboards display real mainnet production data from `TBurnEnterpriseNode`.
- **Comprehensive Admin Portals**: Production-ready admin pages for Business Intelligence, Analytics, Reporting, Network Operations, AI Training, and Compliance Management.
- **Enterprise BFT Consensus Engine**: Production-level 5-phase Byzantine Fault Tolerant protocol with lock-based consensus safety.
- **Enterprise Block Production Engine**: Production-grade 100ms block time with drift compensation and parallel verification pipeline.
- **Enterprise Session Policy**: Centralized session bypass policy module as single source of truth for all bypass decisions, including O(1) Set-based path matching and trusted IP validation.
- **Enterprise Scalability Infrastructure**: Resilience patterns including `BlockchainOrchestrator`, `PersistenceBatcher`, and `AdaptiveFeeEngine` with advanced memory and request management (Staged Shard Boot Pipeline, Memory Governor, Request Shedder).
- **Enterprise Validator Orchestrator & Incentives**: Manages 125 genesis validators with performance scoring, slashing, reward distribution, and a 5-tier performance bonus system.
- **Enterprise Cross-Shard Message Router**: Priority queue-based message delivery system for optimal cross-shard communication with consistent hashing, adaptive retry, and circuit breakers.
- **Enterprise Token Distribution System**: Production-grade 100K+ TPS distribution management for various programs with fraud detection and multi-sig approval.
- **Canonical Tokenomics Data Integration**: All 18 token-programs API endpoints now use `TokenomicsDataService` with GENESIS_ALLOCATION as single source of truth. Each endpoint returns canonical allocation data with `source: "/admin/tokenomics"` for data provenance tracking. Covers: airdrop, referral, community, dao, block-rewards, validator-incentives, ecosystem-fund, investment-rounds, launchpad, partnerships, and related programs.
- **Canonical Token Pricing**: All token prices defined in `TOKEN_PRICING` (shared/tokenomics-config.ts) as single source of truth. Seed: $0.04, Private: $0.10, Public/IDO: $0.20, Launch: $0.50. API endpoint: `/api/token-programs/pricing`.
- **Enterprise RPC Pages**: Production-grade RPC endpoint management for mainnet and testnet, including status, interactive API documentation, and performance benchmarking tools.
- **Enterprise System Health Monitor & Diagnostics**: Comprehensive 24/7 monitoring with alerting, self-healing capabilities, and crash analysis including heap snapshot capture.
- **Enterprise Token Custody Mechanism**: Production-grade 4-category custody system (Protocol Automatic, Vesting Contract, Foundation Multisig, Community Pool) with a 20-year distribution schedule.
- **Enterprise Memory Optimization & Guardian**: Automated memory management system with auto-scaling, object pooling, and multi-tier cleanup mechanisms for performance and stability.

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
- **Authentication**: `express-session`, `bcryptjs`
- **Internationalization**: `react-i18next`
## Enterprise Database Separation (2026-01-11)

### 개발/프로덕션 DB 분리 구성
Replit의 새로운 데이터베이스 인프라를 활용하여 개발과 프로덕션 환경의 데이터베이스를 분리합니다.

#### 환경 변수 설정
| 환경 변수 | 용도 | 환경 |
|-----------|------|------|
| `DATABASE_URL` | 개발 DB 연결 문자열 | 개발 (워크플로우) |
| `DATABASE_URL_PROD` | 프로덕션 DB 연결 문자열 | 프로덕션 (퍼블리싱) |

#### 환경 감지 우선순위
1. `REPLIT_DEPLOYMENT=1` → 프로덕션 DB 사용
2. `NODE_ENV=production` + `!REPLIT_DEV_DOMAIN` → 프로덕션 DB 사용
3. 그 외 → 개발 DB 사용

#### API 엔드포인트
- `GET /api/db-environment` - DB 환경 상태 조회
- `GET /api/health` - 헬스체크 (DB 정보 포함)

#### 마이그레이션 도구
```bash
# 드라이런 (테스트)
MIGRATION_DRY_RUN=true tsx server/db-migration.ts

# 실제 마이그레이션
tsx server/db-migration.ts
```

#### 유지보수 모드
- `MAINTENANCE_MODE=true` - 모든 쓰기 작업 차단
- `MAINTENANCE_READ_ONLY=true` - 읽기만 허용
- `MAINTENANCE_MESSAGE` - 사용자 정의 메시지

## Production Tuning (2026-01-11)

### 120K+ Sustained TPS Configuration
Core engine parameters optimized for real-world mainnet deployment:

#### Cross-Shard Router (`enterprise-cross-shard-router.ts`)
| Parameter | Before | After | Rationale |
|-----------|--------|-------|-----------|
| Ring Buffer Capacity | 256K | 384K | Higher burst capacity |
| WAL Segment Size | 16MB | 32MB | Reduced I/O pressure |

#### Dynamic Sharding (`enterprise-shard-orchestrator.ts`)
| Parameter | Before | After | Rationale |
|-----------|--------|-------|-----------|
| Scale Up Threshold | 85% | 82% | Faster response to load spikes |
| Scale Cooldown | 60s | 30s | Quicker adaptation |
| Ring Buffer Size | 128K | 192K | Higher throughput |
| Max Batch Size | 256 | 384 | Better batching |

#### Block Production (`enterprise-block-engine.ts`)
| Parameter | Before | After | Rationale |
|-----------|--------|-------|-----------|
| Batch Verification Size | 10 | 192 | Parallel verification pipeline |
| Max Pending Blocks | 1000 | 1500 | Burst handling capacity |

#### BFT Consensus (`enterprise-bft-engine.ts`)
| Parameter | Before | After | Rationale |
|-----------|--------|-------|-----------|
| Vote Buffer Size | 10K | 16K | Higher validator throughput |
| Metrics Window | 1K | 2K | Better trend analysis |
| Signature Workers | 4 (implicit) | 8 | Parallel BLS aggregation |
| Vote Aggregation Batch | - | 64 | Parallel vote processing |

#### Adaptive Fee Engine (`adaptive-fee-engine.ts`)
| Parameter | Before | After | Rationale |
|-----------|--------|-------|-----------|
| Mempool Threshold | 1000 | 850 | Earlier backpressure (85%) |
| Surge Multiplier | 10x | 12x | Stronger spam deterrent |
| Cross-Shard Harmony | 0.30 | 0.35 | Better fee consistency |
| Target Blobs/Block | 3 | 4 | Higher throughput |
| Max Blobs/Block | 6 | 8 | Burst capacity |

### Monitoring Thresholds
- Verification queue >70%
- Consensus round >180ms
- Router back-pressure activation
- Shard utilization >82%
- Mempool >85%

## Enterprise Delegator Staking System (2026-01-12)

### Staking Portfolio API
Comprehensive REST API for delegator staking management with real-time portfolio tracking:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/user/:address/staking-portfolio` | GET | Full portfolio summary, positions, unbonding, rewards |
| `/api/user/:address/unbondings` | GET | Unbonding positions with countdown |
| `/api/user/:address/undelegate` | POST | Initiate 21-day unbonding |
| `/api/user/:address/emergency-unstake` | POST | Emergency unstake with 10% penalty |
| `/api/user/:address/claim-staking` | POST | Batch or individual reward claiming |
| `/api/user/:address/auto-compound` | POST | Toggle auto-compound setting |
| `/api/user/:address/redelegate` | POST | Move stake between validators (7-day) |
| `/api/user/:address/reward-history` | GET | Paginated reward history |

### Staking Parameters
- **Unbonding Period**: 21 days standard
- **Redelegation Cooldown**: 7 days
- **Emergency Unstake Penalty**: 10%
- **Minimum Delegation**: 100 TBURN
- **Auto-Compound**: Per-user toggle

### Portfolio Data Structure
```typescript
interface StakingPortfolio {
  summary: {
    totalStaked, totalPendingRewards, totalEarned,
    totalUnbonding, totalPortfolioValue, avgApy,
    activePositions, unbondingPositions, autoCompoundEnabled
  };
  positions: Array<{
    validatorId, validatorName, stakedAmount, currentApy,
    pendingRewards, dailyReward, validatorRiskScore
  }>;
  unbonding: Array<{
    amount, remainingDays, progressPercent, canEmergencyUnstake
  }>;
  rewardHistory: Array<{ amount, rewardType, claimed, createdAt }>;
}
```

### Frontend Components (user.tsx)
- Portfolio summary cards (Total Staked, Pending Rewards, Avg APY)
- Active delegations table with risk badges
- Unbonding countdown with progress bars
- Claim rewards dialog with batch/auto-compound options
- Auto-compound toggle button
