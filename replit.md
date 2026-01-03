# TBURN Blockchain Mainnet Explorer

## Overview
The TBURN Blockchain Mainnet Explorer is a production-ready DeFi ecosystem platform providing comprehensive insights into the TBURN Mainnet. It features extensive public and authenticated application pages, supporting 12 languages with RTL compatibility. The platform integrates advanced AI for burn optimization, governance analysis, and multi-chain bridge risk assessment. Key capabilities include a real-time dashboard with tokenomics, block and transaction explorers, advanced wallet management, robust token standards (TBC-20/721/1155) with quantum-resistant signatures, staking, and a full suite of DeFi functionalities (DEX, lending, yield farming, liquid staking, NFT marketplaces, GameFi hub). Network operations are managed through validator and member dashboards, BFT consensus visualization, and dynamic AI-driven sharding. Administrative and operator portals offer extensive control, including real-time health monitoring, AI orchestration, security audits, and comprehensive reporting. The platform's business vision is to provide a transparent, efficient, and secure gateway to the TBURN Mainnet, fostering adoption and innovation within its DeFi ecosystem.

## User Preferences
I prefer simple language and detailed explanations. I want iterative development with clear communication on progress. Ask before making major changes to the codebase. Do not make changes to files within the `shared/` directory without explicit approval.

## System Architecture
The platform utilizes a modern web stack with React 18, TypeScript, Vite, Wouter for routing, and TanStack Query v5 for frontend data fetching. The UI/UX features a clean design using Space Grotesk and JetBrains Mono typography, implemented with Shadcn UI and Tailwind CSS. The backend is an Express.js application providing REST APIs and WebSockets for real-time updates. Data persistence is managed by Neon Serverless PostgreSQL with Drizzle ORM.

Core architectural decisions and features include:
- **Dynamic Shard Management**: Supports dynamic scaling of shards (5-128) and validators with transactional updates and audit logging.
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
- **Block Finality System**: Complete block finality infrastructure with cross-validator verification and state transitions (pending → verified → finalized).
- **Transaction Verification Pipeline**: ECDSA-style signature verification, Merkle root generation, and block integrity verification.
- **Reward Distribution Engine**: Automatic validator reward distribution based on proposer rewards, verifier rewards, and gas fee distribution with epoch-based cycles.
- **Mainnet Launch**: Production blockchain infrastructure with 125 genesis validators, 64 shards, ~210,000 TPS capacity, complete block finality, and automated reward distribution. 20-year tokenomics with deflationary model.
- **Development Mode Optimization**: Heavy blockchain services are deferred in development to prioritize frontend serving, with increased poll intervals and disabled non-essential broadcasts.
- **Block Time 100ms Optimization**: Critical fixes to maintain strict 100ms block cadence by optimizing `processBlockFinality()` and `ValidatorSimulation`.
- **Production Cache-Control Fix**: Critical fix for "Failed to fetch dynamically imported module" errors using proper cache headers and client-side chunk error recovery.
- **Enhanced Chunk Error Recovery**: Multi-layer defense against chunk loading failures including inline error handlers, `Surrogate-Control` header, and version synchronization.
- **Instant First Load Fix**: Production cold-start optimization where SPA fallback (`index.html`) is registered before heavy backend initialization, allowing instant page load.
- **Deferred Data Fetch**: Landing page network stats are deferred by 3 seconds after initial render, showing placeholders until real data loads.
- **Static Landing Page Architecture**: Critical performance fix using a pure HTML/CSS landing page for sub-2-second first page load.
- **Route-Based Code Splitting**: Bundle size optimization by loading appropriate app shells (lightweight `PublicApp` for public routes, full `App` for authenticated routes) based on the initial route.
- **Token Distribution Admin System**: Complete enterprise-level token distribution management system at `/admin/token-distribution` with 8 programs: Airdrop Claims, Referral Program, Events/Promotions, Community Rewards, DAO Governance, Block Rewards, Validator Incentives, and Ecosystem Grants. Full admin dashboard with real-time monitoring, statistics aggregation, and CRUD operations. Database tables include `token_programs`, `airdrop_claims`, `airdrop_distributions`, `referral_accounts`, `referral_rewards`, `events_catalog`, `event_registrations`, `community_tasks`, `community_contributions`, `dao_proposals`, `dao_votes`, `dao_delegations`, `block_reward_cycles`, `block_reward_payouts`, `validator_incentive_payouts`, `validator_performance_stats`, `ecosystem_grants`, and `grant_milestones`.
- **Enterprise Scalability Infrastructure**: Production-grade scalability system with three core components:
  - **Worker Thread Separation**: `server/workers/` module with `SimulationWorker` for blockchain simulation, `WorkerPool` manager with health checks, auto-restart, and task queuing.
  - **Batch DB Persistence**: `PersistenceBatcher` service with ring buffers for blocks, consensus rounds, and shard metrics. Transaction-based batch flushing with retry/backoff logic.
  - **Adaptive Gas Fee Model**: EIP-1559 style `AdaptiveFeeEngine` with shard-local base fee calculation, priority tips, cross-shard harmonization, and mempool backpressure handling.
  - **Blockchain Orchestrator**: Central coordinator (`server/services/blockchain-orchestrator.ts`) integrating all scalability systems with 100ms block production cycle.
  - **Monitoring APIs**: `/api/enterprise/scalability/*` endpoints for real-time status, gas fees, persistence metrics, and block production stats.

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
- **Real-time Communication**: `ws` (WebSocket library)
- **AI Services**: Anthropic Claude, OpenAI GPT, Google Gemini, xAI Grok
- **Charting**: Recharts
- **Validation**: Zod
- **Authentication**: `express-session`, `bcryptjs`
- **Internationalization**: `react-i18next`