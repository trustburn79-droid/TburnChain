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