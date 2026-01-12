# TBURN Blockchain Mainnet Explorer

## Overview
The TBURN Blockchain Mainnet Explorer is a production-ready DeFi ecosystem platform designed to provide comprehensive insights into the TBURN Mainnet. It features extensive public and authenticated application pages, supporting 12 languages with RTL compatibility. The platform integrates advanced AI for burn optimization, governance analysis, and multi-chain bridge risk assessment. Key capabilities include a real-time dashboard with tokenomics, block and transaction explorers, advanced wallet management, robust token standards (TBC-20/721/1155) with quantum-resistant signatures, staking, and a full suite of DeFi functionalities. The project's vision is to establish a transparent, efficient, and secure gateway to the TBURN Mainnet, thereby fostering adoption and innovation within its DeFi ecosystem.

## User Preferences
I prefer simple language and detailed explanations. I want iterative development with clear communication on progress. Ask before making major changes to the codebase. Do not make changes to files within the `shared/` directory without explicit approval.

## System Architecture
The platform utilizes a modern web stack with React 18, TypeScript, Vite, Wouter for routing, and TanStack Query v5 for frontend data fetching. The UI/UX features a clean design using Space Grotesk and JetBrains Mono typography, implemented with Shadcn UI and Tailwind CSS. The backend is an Express.js application providing REST APIs and WebSockets for real-time updates. Data persistence is managed by Neon Serverless PostgreSQL with Drizzle ORM.

Core architectural decisions include:
- **Dynamic Shard Management**: Supports dynamic scaling of shards (5-64) and validators with transactional updates, targeting 210,000 TPS.
- **Unified AI Model Configuration**: Integrates Gemini 3 Pro, Claude Sonnet 4.5, GPT-4o, and Grok 3 with automatic fallback.
- **Internationalization**: Full 12-language support with RTL compatibility for Arabic and Urdu, ensuring comprehensive i18n coverage.
- **Web3 Wallet Integration**: Supports major wallets (MetaMask, Rabby, Trust, Coinbase, Ledger).
- **Production Data Policy**: All public pages and admin dashboards display real mainnet production data from `TBurnEnterpriseNode`.
- **Comprehensive Admin Portals**: Production-ready admin pages for Business Intelligence, Analytics, Reporting, Network Operations, AI Training, and Compliance Management.
- **Enterprise BFT Consensus Engine**: Production-level 5-phase Byzantine Fault Tolerant protocol with lock-based consensus safety.
- **Enterprise Block Production Engine**: Production-grade 100ms block time with drift compensation and parallel verification pipeline.
- **Enterprise Session Policy**: Centralized session bypass policy module for all bypass decisions, including O(1) Set-based path matching and trusted IP validation.
- **Enterprise Scalability Infrastructure**: Resilience patterns including `BlockchainOrchestrator`, `PersistenceBatcher`, and `AdaptiveFeeEngine` with advanced memory and request management.
- **Enterprise Validator Orchestrator & Incentives**: Manages 125 genesis validators with performance scoring, slashing, reward distribution, and a 5-tier performance bonus system.
- **Enterprise Cross-Shard Message Router**: Priority queue-based message delivery system for optimal cross-shard communication with consistent hashing, adaptive retry, and circuit breakers.
- **Enterprise Token Distribution System**: Production-grade 100K+ TPS distribution management for various programs with fraud detection and multi-sig approval.
- **Canonical Tokenomics Data Integration**: All 18 token-programs API endpoints use `TokenomicsDataService` with `GENESIS_ALLOCATION` as the single source of truth for allocation data provenance.
- **Canonical Token Pricing**: All token prices are defined in `TOKEN_PRICING` (shared/tokenomics-config.ts) as a single source of truth.
- **Enterprise RPC Pages**: Production-grade RPC endpoint management for mainnet and testnet, including status, interactive API documentation, and performance benchmarking.
- **Enterprise System Health Monitor & Diagnostics**: Comprehensive 24/7 monitoring with alerting, self-healing capabilities, and crash analysis.
- **Enterprise Token Custody Mechanism**: Production-grade 4-category custody system with a 20-year distribution schedule.
- **Enterprise Memory Optimization & Guardian**: Automated memory management system with auto-scaling, object pooling, and multi-tier cleanup mechanisms.
- **Database Separation**: Utilizes Replit's infrastructure for separated development and production databases, managed via environment variables (`DATABASE_URL`, `DATABASE_URL_PROD`).
- **Enterprise Delegator Staking System**: Provides a comprehensive REST API for delegator staking management, including portfolio summary, unbonding, emergency unstake, reward claiming, auto-compound toggling, and redelegation. Staking parameters include a 21-day unbonding period, 7-day redelegation cooldown, and a 10% emergency unstake penalty.
- **Core Infrastructure Components**: Includes a Transaction Validator, Mempool Service (Fibonacci heap, Bloom filter), State Store (Merkle Patricia Trie, WAL), P2P Network (WebSocket gossip, peer scoring), Fork Choice (LMD-GHOST variant), and Genesis Builder. These are orchestrated by the `ProductionBlockchainOrchestrator`.
- **Design Patterns**: Employs Singleton for component management, EventEmitter for loose coupling, LRU Cache for efficiency, Fibonacci Heap for mempool priority, Bloom Filter for duplicate detection, and Write-Ahead Log for crash recovery.
- **Realtime Block Production Pipeline**: Production-grade block production system (`server/core/pipeline/realtime-block-pipeline.ts`) with automatic startup after 30s delay. DEV_SAFE_MODE settings: 500ms block interval, 6,000 tx/block, achieving 12K sustained TPS at 97% efficiency. Production mode targets 100K TPS with 100ms blocks.
- **Pipeline API Endpoints**: Monitoring and control via `/api/pipeline/*` (stats, blocks, start, stop, health, config, benchmark). Session bypass enabled for unauthenticated monitoring access.
- **Drizzle Persistence Adapters**: Five PostgreSQL adapters (state, sync, bootstrap, block, validator) in `server/core/persistence/drizzle-persistence-adapters.ts` with retry logic and write buffering for enterprise reliability.
- **Shard Processing Coordinator**: Bridges RealtimeBlockPipeline with Enterprise Sharding System (`server/core/pipeline/shard-processing-coordinator.ts`). Routes transactions to 24 shards, manages 15% cross-shard ratio, integrates with Cross-Shard Router (WAL-enabled message durability). Auto-starts with BlockPipeline.
- **Parallel Shard Block Producer**: Enables true horizontal scaling across 24 shards (`server/core/pipeline/parallel-shard-block-producer.ts`). Each shard independently produces blocks at 200ms intervals, targeting 2,500 TPS per shard (60K TPS total). Features jitter-based timing to avoid synchronization, singleton pattern, EventEmitter for loose coupling. API endpoints: `/api/pipeline/parallel/stats`, `/api/pipeline/parallel/start`, `/api/pipeline/parallel/stop`, `/api/pipeline/combined/stats`. DEV_SAFE_MODE caps at 1,250 TPS/shard (30K total).

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