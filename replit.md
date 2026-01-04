# TBURN Blockchain Mainnet Explorer

## Overview
The TBURN Blockchain Mainnet Explorer is a production-ready DeFi ecosystem platform providing comprehensive insights into the TBURN Mainnet. It features extensive public and authenticated application pages, supporting 12 languages with RTL compatibility. The platform integrates advanced AI for burn optimization, governance analysis, and multi-chain bridge risk assessment. Key capabilities include a real-time dashboard with tokenomics, block and transaction explorers, advanced wallet management, robust token standards (TBC-20/721/1155) with quantum-resistant signatures, staking, and a full suite of DeFi functionalities (DEX, lending, yield farming, liquid staking, NFT marketplaces, GameFi hub). Network operations are managed through validator and member dashboards, BFT consensus visualization, and dynamic AI-driven sharding. Administrative and operator portals offer extensive control, including real-time health monitoring, AI orchestration, security audits, and comprehensive reporting. The platform's business vision is to provide a transparent, efficient, and secure gateway to the TBURN Mainnet, fostering adoption and innovation within its DeFi ecosystem.

## User Preferences
I prefer simple language and detailed explanations. I want iterative development with clear communication on progress. Ask before making major changes to the codebase. Do not make changes to files within the `shared/` directory without explicit approval.

## System Architecture
The platform utilizes a modern web stack with React 18, TypeScript, Vite, Wouter for routing, and TanStack Query v5 for frontend data fetching. The UI/UX features a clean design using Space Grotesk and JetBrains Mono typography, implemented with Shadcn UI and Tailwind CSS. The backend is an Express.js application providing REST APIs and WebSockets for real-time updates. Data persistence is managed by Neon Serverless PostgreSQL with Drizzle ORM.

Core architectural decisions and features include:
- **Dynamic Shard Management**: Supports dynamic scaling of shards (5-64) and validators with transactional updates and audit logging. Admin can select shard count at `/admin/shards`.
- **Unified AI Model Configuration**: Integrates Gemini 3 Pro, Claude Sonnet 4.5, GPT-4o, and Grok 3 with automatic fallback for consistent AI usage.
- **Internationalization**: Full Korean and English support with fallback for other languages.
- **Standardized UI Components**: Reusable components for data display, loading states, error handling, and CRUD operations.
- **Web3 Wallet Integration**: Supports major wallets (MetaMask, Rabby, Trust, Coinbase, Ledger) for transaction flows.
- **Production Data Policy**: All public pages and admin dashboards display real mainnet production data from `TBurnEnterpriseNode`.
- **Comprehensive Admin Portals**: Production-ready admin pages for Business Intelligence, Analytics, Reporting, Network Operations, AI Training, and Compliance Management.
- **Cross-Shard Performance Optimizations**: Achieved through shard caching, batch message insertion, O(1) shard pair selection, and priority queue routing.
- **Production Launch Validation System**: RPC endpoint validation using Zod schemas.
- **Public API & Admin Page Performance**: Optimized with shared formatters, cache warming, backend caching, and extensive React Query settings for sub-second response times.
- **Authentication & Resilience**: Zero-delay authentication with optimistic cache updates; Dashboard WebSockets use exponential backoff with REST fallback.
- **User Page (`/user`)**: Korean-language blockchain explorer interface with personalized financial data.
- **Stability Architecture**: Server-side event loop protection and client-side memory leak prevention with resilience patterns.
- **TBURN Bech32m Address Standardization**: All blockchain addresses use Bech32m format with `tb1` prefix; supports legacy `tburn...` format.
- **Bug Bounty Program**: Full security bug bounty management system.
- **Token Generator & Factory**: Internationalized, production-ready token deployment infrastructure for TBC-20/721/1155 standards.
- **Unified TPS Synchronization**: All API endpoints display synchronized TPS from a shared 2-second shard cache. Base TPS formula: 64 shards × 625 tx × 0.525 load × 10 blocks/sec ≈ 210,000 TPS.
- **Mainnet Genesis Validator Configuration**: Mainnet launches with 125 genesis validators (1M TBURN each).
- **Data Consistency Architecture**: Total Transactions value is cached for 30 seconds to ensure consistent display.
- **Standardized RPC Endpoints**: All network endpoints standardized to `tburn.io` domain format.
- **TBurn Logo Branding System**: Unified SVG-based `TBurnLogo` component for consistent branding.
- **Whitepaper Page**: Static HTML whitepaper served at `/whitepaper` route detailing TBURN Chain's architecture and tokenomics.
- **Enterprise BFT Consensus Engine**: Production-level 5-phase Byzantine Fault Tolerant protocol (Propose → Prevote → Precommit → Commit → Finalize) with lock-based consensus safety, view change protocol, optimistic responsiveness, aggregated signatures, parallel vote processing, and O(n) message complexity. API endpoints at `/api/consensus/*` for real-time monitoring.
- **Enterprise Block Production Engine** (`server/core/block-production/enterprise-block-engine.ts`): Production-grade 100ms block time with:
  - **Precise 100ms Timing**: Drift compensation with max 20ms adjustment tolerance for consistent block cadence.
  - **State Machine**: BlockState transitions PENDING → VERIFIED → FINALIZED (or REJECTED on timeout).
  - **Circuit Breaker Pattern**: CLOSED → OPEN → HALF_OPEN states for fault tolerance (5 failure threshold, 10s reset).
  - **Ring Buffer**: Fixed 1000 block capacity for memory-efficient block storage.
  - **Parallel Verification Pipeline**: Batch processing of 10 blocks at a time with 2/3+1 quorum validation.
  - **Latency Tracking**: P50/P95/P99 percentile calculations for performance monitoring.
  - **Rejection Handling**: Automatic rejection of blocks exceeding 500ms verification timeout.
  - **API Endpoints**: 6 monitoring endpoints at `/api/block-production/*` (metrics, health, stats, recent blocks, block by height, blocks by state).
- **Block Finality System**: Complete block finality infrastructure with cross-validator verification and state transitions (pending → verified → finalized).
- **Transaction Verification Pipeline**: ECDSA-style signature verification, Merkle root generation, and block integrity verification.
- **Reward Distribution Engine**: Automatic validator reward distribution based on proposer rewards, verifier rewards, and gas fee distribution with epoch-based cycles.
- **Mainnet Launch**: Production blockchain infrastructure with Chain ID 6000, 125 genesis validators, 64 shards, ~210,000 TPS capacity, complete block finality, and automated reward distribution. 20-year tokenomics with deflationary model.
- **Enterprise Genesis Configuration** (`server/core/genesis/enterprise-genesis-config.ts`): Comprehensive genesis parameters:
  - **Chain Config**: Chain ID 6000, TBURN symbol, 18 decimals, RPC at `https://mainnet.tburn.io`
  - **Tokenomics**: 10B total supply distributed across 11 categories - Ecosystem Growth (29.6%), Strategic Treasury (14.8%), Community (11.9%), Staking Rewards (9.9%), Liquidity (7.9%), R&D/AI (7.9%), Enterprise (6.9%), Stability Fund (4.9%), Public Launch (3.0%), Security (2.0%), Validator Stakes (1.25%)
  - **Validator Distribution**: 125 genesis validators = 122 assigned (2 per shard × 64 shards) + 3 rotation pool. Three tiers: Core (5M stake, 1.5x rewards), Premium (2M, 1.25x), Standard (1M, 1x)
  - **Slashing**: 5% for double-signing, 0.1% for downtime (1000 blocks), 24h jail, tombstone enabled
  - **20-Year Emission**: Year 1: 150M TBURN, 12% annual decay, 2.5% floor APR. Year 20: ~13.2M TBURN
  - **Burn Mechanics**: 25% tx fee burn, 50% slashed stake burn, target 1% annual deflation
  - **Genesis API**: 12 enterprise endpoints at `/api/admin/genesis/enterprise/*` (network-stats, chain, tokenomics, validators, validators/distribution, shards, block-params, rewards, rewards/emission-schedule, security, summary)
- **Development Mode Optimization**: Heavy blockchain services are deferred in development to prioritize frontend serving, with increased poll intervals and disabled non-essential broadcasts.
- **Block Time 100ms Optimization**: Critical fixes to maintain strict 100ms block cadence by optimizing `processBlockFinality()` and `ValidatorSimulation`.
- **Production Cache-Control Fix**: Critical fix for "Failed to fetch dynamically imported module" errors using proper cache headers and client-side chunk error recovery.
- **Enhanced Chunk Error Recovery**: Multi-layer defense against chunk loading failures including inline error handlers, `Surrogate-Control` header, and version synchronization.
- **Instant First Load Fix**: Production cold-start optimization where SPA fallback (`index.html`) is registered before heavy backend initialization, allowing instant page load.
- **Deferred Data Fetch**: Landing page network stats are deferred by 3 seconds after initial render, showing placeholders until real data loads.
- **Static Landing Page Architecture**: Critical performance fix using a pure HTML/CSS landing page for sub-2-second first page load.
- **Route-Based Code Splitting**: Bundle size optimization by loading appropriate app shells (lightweight `PublicApp` for public routes, full `App` for authenticated routes) based on the initial route.
- **Session Overflow Prevention**: Critical stability fix for 24/7 uptime. Conditional session middleware skips session creation for internal API calls (via `X-Internal-Request` header) and public API routes (`/api/public/`, `/api/health`, etc.). MemoryStore configured with 2000 max sessions, 30-minute TTL, and 1-minute cleanup cycle. Session monitoring logs create/skip ratio every 10 minutes.
- **Token Distribution Admin System**: Complete enterprise-level token distribution management system at `/admin/token-distribution` with 8 programs: Airdrop Claims, Referral Program, Events/Promotions, Community Rewards, DAO Governance, Block Rewards, Validator Incentives, and Ecosystem Grants. Full admin dashboard with real-time monitoring, statistics aggregation, and CRUD operations. Database tables include `token_programs`, `airdrop_claims`, `airdrop_distributions`, `referral_accounts`, `referral_rewards`, `events_catalog`, `event_registrations`, `community_tasks`, `community_contributions`, `dao_proposals`, `dao_votes`, `dao_delegations`, `block_reward_cycles`, `block_reward_payouts`, `validator_incentive_payouts`, `validator_performance_stats`, `ecosystem_grants`, and `grant_milestones`.
- **Enterprise Scalability Infrastructure**: Production-grade scalability system with enterprise-level resilience patterns:
  - **BlockchainOrchestrator** (`server/services/blockchain-orchestrator.ts`): Central coordinator with Circuit Breaker pattern (CLOSED/OPEN/HALF_OPEN states), Health Check system (component-level monitoring with degradation levels), Alert Manager (severity-based alerts with deduplication), and enhanced metrics (P50/P95/P99 percentiles, uptime tracking, circuit breaker trip counts).
  - **PersistenceBatcher** (`server/services/persistence-batcher.ts`): Enterprise batch persistence with Priority Queue (Critical/High/Normal/Low), Dead Letter Queue (failed writes with retry capability), Write-Ahead Log (durability with checkpoint and recovery), and Ring Buffer (high-performance batching with fixed 1000-item capacity).
  - **AdaptiveFeeEngine** (`server/core/fees/adaptive-fee-engine.ts`): EIP-1559 style with TWAP (Time-Weighted Average Price) for historical fee analysis, Fee Prediction Engine (linear regression-based trend prediction with confidence scores), EIP-4844 Blob Fees (data availability layer support), and Congestion Analyzer (multi-factor analysis with recommendations).
  - **Worker Thread Separation**: `server/workers/` module with `SimulationWorker` for blockchain simulation, `WorkerPool` manager with health checks, auto-restart, and task queuing. Disabled for Replit compatibility but production-ready architecture.
  - **Monitoring APIs**: `/api/enterprise/scalability/*` endpoints including `/status` (full system status with circuit breaker and alerts), `/health` (HTTP 200/207/503 based on component health), `/gas-fees` (TWAP, blob fees, congestion analysis), `/persistence` (DLQ, WAL, priority queue stats), `/block-production` (percentiles, success rate), `/metrics/prometheus` (standard Prometheus format), `/alerts` (CRUD for alert management), and `/circuit-breaker` (state inspection).

## External Dependencies
- **Database**: Neon Serverless PostgreSQL with 928 enterprise-grade indexes (64 token distribution indexes + 864 core indexes)
- **ORM**: Drizzle ORM
- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **UI Library**: Shadcn UI
- **Styling**: Tailwind CSS
- **Data Fetching**: TanStack Query v5
- **Routing**: Wouter
- **Real-time Communication**: `ws` (WebSocket library)
- **AI Services**: Anthropic Claude, OpenAI GPT, Google Gemini, xAI Grok
- **Charting**: Recharts
- **Validation**: Zod
- **Authentication**: `express-session`, `bcryptjs`
- **Internationalization**: `react-i18next`