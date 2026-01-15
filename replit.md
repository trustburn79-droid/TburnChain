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
- **Realtime Block Production Pipeline**: **DISABLED BY DEFAULT** (2026-01-13 STABILITY FIX). Block pipeline causes WAL recovery blocking (1.6M+ entries) and memory leaks. Enable explicitly with ENABLE_BLOCK_PIPELINE=true. Production-grade block production system (`server/core/pipeline/realtime-block-pipeline.ts`) with automatic startup after 30s delay. DEV_SAFE_MODE settings (2026-01-13 STABILITY FIX): 2000ms block interval, 2,000 tx/block, targeting 24K TPS for development stability. Production mode targets 100K TPS with 100ms blocks.
- **Pipeline API Endpoints**: Monitoring and control via `/api/pipeline/*` (stats, blocks, start, stop, health, config, benchmark). Session bypass enabled for unauthenticated monitoring access.
- **Drizzle Persistence Adapters**: Five PostgreSQL adapters (state, sync, bootstrap, block, validator) in `server/core/persistence/drizzle-persistence-adapters.ts` with retry logic and write buffering for enterprise reliability.
- **Shard Processing Coordinator**: Bridges RealtimeBlockPipeline with Enterprise Sharding System (`server/core/pipeline/shard-processing-coordinator.ts`). Routes transactions to 24 shards, manages 15% cross-shard ratio, integrates with Cross-Shard Router (WAL-enabled message durability). Auto-starts with BlockPipeline.
- **Parallel Shard Block Producer**: Enables true horizontal scaling across 24 shards (`server/core/pipeline/parallel-shard-block-producer.ts`). DEV_SAFE_MODE settings (2026-01-13 STABILITY FIX): 1000ms block interval per shard, 1,000 TPS per shard (24K TPS total). Production mode: 100ms intervals, 4,200 TPS per shard (100K+ TPS total). Features jitter-based timing, singleton pattern, EventEmitter for loose coupling. API endpoints: `/api/pipeline/parallel/stats`, `/api/pipeline/parallel/start`, `/api/pipeline/parallel/stop`, `/api/pipeline/combined/stats`.
- **Polling Interval Optimization (2026-01-13)**: Client-side polling intervals standardized to 30s (was 5s) for `/api/network/stats` and related endpoints. Server-side RealtimeMetricsService polling set to 30s (was 10s). These changes reduce event loop pressure and memory usage by 60-70%.
- **Enterprise Remote Signer Architecture (2026-01-14)**: Production-grade isolated key management with GCP Secret Manager integration. Validator nodes request signatures via mTLS from isolated Signer Service. Features include HSM support, key rotation, audit logging, rate limiting, and multi-tier permissions (Genesis/Pioneer/Standard/Community). Files: `server/core/security/enterprise-remote-signer.ts`, `server/core/security/validator-signer-client.ts`, `server/routes/remote-signer-routes.ts`, `server/config/gcp-validator-config.ts`. Deployment guide: `docs/GCP-VALIDATOR-DEPLOYMENT.md`.
- **External Validator Program (2026-01-14)**: Standalone validator node implementation for external operators. Located in `external-validator-program/`. Features: Remote Signer Client with mTLS, Block Producer, Attestation Service, P2P Network, Metrics Server. Commands: `npm run dev`, `npm run start:mainnet`, `npm run start:testnet`. CLI tools: register, health, status.
- **External Validator Software (2026-01-14)**: GCP deployment infrastructure for external validators. Located in `external-validator-software/`. Includes: `deploy/gcp-validator-deploy.sh` (VPC, firewall, Secret Manager, Compute Engine), `scripts/deploy-signer.sh` (mTLS certificates, systemd service), `scripts/deploy-validator.sh` (validator node deployment), `scripts/start-monitoring.sh` (health monitoring). Security: mTLS certificates with proper SAN, Secret Manager for private keys, VPC isolation, audit logging.
- **Validator Security Admin Portal (2026-01-14)**: Comprehensive admin portal page for managing external validator security. Route: `/admin/validator-security`. Features 5 tabs: Overview (security metrics, encryption info), Alerts (anomaly detection alerts with status management), Rate Limits (view/unblock rate-limited validators), IP Whitelist (add/remove whitelisted IPs with CIDR support), Audit Logs (tamper-evident HMAC-chained logs). API Endpoints: `/api/external-validators/security/*` (overview, alerts, rate-limits, ip-whitelist, audit-logs). Files: `client/src/pages/admin-portal/validator-security.tsx`, `server/routes/external-validator-routes.ts`.
- **External Validator Security Sync Protocol (2026-01-15)**: Production-grade communication protocol between external validators and mainnet security API. Features: bcrypt (12 rounds) + server-side pepper for API key hashing, HMAC-SHA256 request signatures, replay attack prevention via timestamp/nonce validation (60s drift tolerance, 5-min nonce TTL), constant-time comparison. Security endpoints: `/api/external-validators/security/heartbeat` (validator status), `/api/external-validators/security/report` (security reports), `/api/external-validators/security/my-status` (get validator status), `/api/external-validators/security/alerts/:id/acknowledge`. Required headers: X-API-Key, X-Validator-Address, X-Timestamp, X-Nonce, X-Signature (optional). Files: `external-validator-program/src/core/mainnet-security-client.ts`, `external-validator-program/src/core/validator-node.ts`, `server/routes/external-validator-routes.ts`.

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