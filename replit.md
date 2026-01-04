# TBURN Blockchain Mainnet Explorer

## Overview
The TBURN Blockchain Mainnet Explorer is a production-ready DeFi ecosystem platform providing comprehensive insights into the TBURN Mainnet. It features extensive public and authenticated application pages, supporting 12 languages with RTL compatibility. The platform integrates advanced AI for burn optimization, governance analysis, and multi-chain bridge risk assessment. Key capabilities include a real-time dashboard with tokenomics, block and transaction explorers, advanced wallet management, robust token standards (TBC-20/721/1155) with quantum-resistant signatures, staking, and a full suite of DeFi functionalities (DEX, lending, yield farming, liquid staking, NFT marketplaces, GameFi hub). The platform's business vision is to provide a transparent, efficient, and secure gateway to the TBURN Mainnet, fostering adoption and innovation within its DeFi ecosystem.

## User Preferences
I prefer simple language and detailed explanations. I want iterative development with clear communication on progress. Ask before making major changes to the codebase. Do not make changes to files within the `shared/` directory without explicit approval.

## System Architecture
The platform utilizes a modern web stack with React 18, TypeScript, Vite, Wouter for routing, and TanStack Query v5 for frontend data fetching. The UI/UX features a clean design using Space Grotesk and JetBrains Mono typography, implemented with Shadcn UI and Tailwind CSS. The backend is an Express.js application providing REST APIs and WebSockets for real-time updates. Data persistence is managed by Neon Serverless PostgreSQL with Drizzle ORM.

Core architectural decisions and features include:
- **Dynamic Shard Management**: Supports dynamic scaling of shards (5-64) and validators with transactional updates. Includes an Enterprise Dynamic Sharding Orchestrator targeting 210,000 TPS with EWMA-based metrics, O(1) cross-shard routing, circuit breakers, and automatic scaling.
- **Unified AI Model Configuration**: Integrates Gemini 3 Pro, Claude Sonnet 4.5, GPT-4o, and Grok 3 with automatic fallback.
- **Internationalization**: Full Korean and English support with fallback for other languages.
- **Web3 Wallet Integration**: Supports major wallets (MetaMask, Rabby, Trust, Coinbase, Ledger).
- **Production Data Policy**: All public pages and admin dashboards display real mainnet production data from `TBurnEnterpriseNode`.
- **Comprehensive Admin Portals**: Production-ready admin pages for Business Intelligence, Analytics, Reporting, Network Operations, AI Training, and Compliance Management.
- **Enterprise BFT Consensus Engine**: Production-level 5-phase Byzantine Fault Tolerant protocol with lock-based consensus safety, view change protocol, and aggregated signatures.
- **Enterprise Block Production Engine**: Production-grade 100ms block time with drift compensation, state machine, circuit breaker pattern, and parallel verification pipeline.
- **Block Finality System**: Complete block finality infrastructure with cross-validator verification.
- **Transaction Verification Pipeline**: ECDSA-style signature verification, Merkle root generation, and block integrity verification.
- **Reward Distribution Engine**: Automatic validator reward distribution based on proposer rewards, verifier rewards, and gas fee distribution.
- **Mainnet Launch Configuration**: Chain ID 6000, 125 genesis validators, 64 shards, ~210,000 TPS capacity, 20-year deflationary tokenomics, and various burn mechanics.
- **Performance Optimizations**: Includes instant first load, deferred data fetch, static landing page architecture, route-based code splitting, and enhanced chunk error recovery.
- **Production Stability (2026-01-04)**: Critical fix for MemoryStore session overflow causing "Internal Server Error" and "upstream request timeout". Implemented refined conditional session middleware that:
  - Skips session creation for public read-only APIs (/api/public/*, /api/network/stats)
  - Uses exact path matching for /api/shards, /api/blocks, /api/transactions (not subpaths)
  - Protects admin paths (/admin, /config, /maintenance, /auth, /user, /member) - sessions always created
  - Preserves sessions for requests with existing connect.sid cookie
  - MemoryStore optimized: production 5000 max / dev 2000 max, 30-minute TTL, 1-minute cleanup cycle
  - Session monitoring with skip ratio reporting every 5-10 minutes
- **Enterprise Scalability Infrastructure**: Production-grade resilience patterns including `BlockchainOrchestrator` (Circuit Breaker, Health Check, Alert Manager), `PersistenceBatcher` (Priority Queue, Dead Letter Queue, Write-Ahead Log), and `AdaptiveFeeEngine` (EIP-1559 style with TWAP, Fee Prediction, EIP-4844 Blob Fees).
- **Enterprise Validator Orchestrator**: Production-grade validator management for 125 genesis validators (1M TBURN each) with O(1) lookups, EWMA performance scoring (α=0.3), 32K ring buffer metrics, weighted random selection, committee formation, slashing (5% double-sign, 0.1% downtime), jailing (24h), tombstoning, and reward distribution (40% proposer, 50% verifier, 10% burn). API endpoints at `/api/validators/*`.
- **Enterprise Validator Performance Tracking**: Production-grade telemetry system with percentile tracking (P50/P95/P99), SLA monitoring (99.90% uptime, 250ms P99 latency targets), real-time alerting with escalation levels (0-5), slashing detection pipeline with confirmation requirements, and debounce windows. Database tables: `validator_performance_snapshots`, `validator_latency_events`, `validator_slash_events`, `validator_sla_alerts`. API endpoints at `/api/validators/telemetry/*`, `/api/validators/alerts/*`, `/api/validators/slashing/*`.
- **Enterprise Reward Distribution Engine**: Production-grade epoch-based reward system with O(1) lookups, priority queue batch processing (1000/batch), 32K ring buffer history, EWMA gas price tracking, circuit breaker pattern, write-ahead logging for crash recovery. Features include: proposer rewards (40%), verifier rewards (50%), burn allocation (10%), gas fee distribution (EIP-1559 style), staking APY calculation (12.5% base, 5-25% range), and commission handling. API endpoints at `/api/rewards/*`.
- **Performance-Based Validator Incentive System**: 5-tier performance bonus system with automatic distribution. Tiers: Bronze (0-59, 1.0x), Silver (60-74, 1.05x), Gold (75-84, 1.12x), Platinum (85-94, 1.18x), Diamond (95-100, 1.25x). Includes streak bonuses (up to 20% for consecutive high-performance epochs), consistency bonuses (up to 8% for stable performance variance), and 10-epoch performance history tracking. Auto-distribution scheduler with configurable intervals (default 100s), priority-based batch processing (10-1000 rewards per batch), 3 retry attempts with 5s delay, and epoch-based auto-finalization. API endpoints at `/api/rewards/incentives/*` and `/api/rewards/auto-distribution/*`.
- **Token Distribution Admin System**: Enterprise-level management for various token programs (Airdrops, Referrals, Community Rewards, DAO Governance, etc.).

## External Dependencies
- **Database**: Neon Serverless PostgreSQL with 1,100 enterprise-grade indexes (60 dedicated incentive system indexes + 41 performance tracking indexes + 219 enterprise indexes across 52+ categories including validator orchestration, sharding, token distribution, consensus, reward distribution, and core blockchain tables). New tables: `validator_incentive_states`, `validator_performance_epochs`, `reward_distribution_schedules`, `reward_distribution_batches`, `validator_incentive_tier_stats`.
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