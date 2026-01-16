# TBURN Blockchain Mainnet Explorer

## Overview
The TBURN Blockchain Mainnet Explorer is a production-ready DeFi ecosystem platform providing comprehensive insights into the TBURN Mainnet. It offers extensive public and authenticated pages in 12 languages with RTL compatibility. Key features include a real-time dashboard with tokenomics, block and transaction explorers, advanced wallet management, robust token standards (TBC-20/721/1155) with quantum-resistant signatures, staking, and a full suite of DeFi functionalities. The platform integrates advanced AI for burn optimization, governance analysis, and multi-chain bridge risk assessment. The project aims to establish a transparent, efficient, and secure gateway to the TBURN Mainnet, fostering adoption and innovation within its DeFi ecosystem.

## User Preferences
I prefer simple language and detailed explanations. I want iterative development with clear communication on progress. Ask before making major changes to the codebase. Do not make changes to files within the `shared/` directory without explicit approval.

## System Architecture
The platform uses a modern web stack: React 18, TypeScript, Vite, Wouter for routing, and TanStack Query v5 for frontend data fetching. The UI/UX features a clean design with Space Grotesk and JetBrains Mono typography, implemented with Shadcn UI and Tailwind CSS. The backend is an Express.js application providing REST APIs and WebSockets. Data persistence is managed by Neon Serverless PostgreSQL with Drizzle ORM.

Core architectural decisions include:
- **Dynamic Shard Management**: Supports dynamic scaling of shards (5-64) and validators with transactional updates, targeting 210,000 TPS.
- **Unified AI Model Configuration**: Integrates Gemini 3 Pro, Claude Sonnet 4.5, GPT-4o, and Grok 3 with automatic fallback.
- **Internationalization**: Full 12-language support with RTL compatibility.
- **Web3 Wallet Integration**: Supports major wallets (MetaMask, Rabby, Trust, Coinbase, Ledger).
- **Production Data Policy**: All public pages and admin dashboards display real mainnet production data from `TBurnEnterpriseNode`.
- **Comprehensive Admin Portals**: Production-ready admin pages for Business Intelligence, Analytics, Reporting, Network Operations, AI Training, and Compliance Management.
- **Enterprise BFT Consensus Engine**: Production-level 5-phase Byzantine Fault Tolerant protocol.
- **Enterprise Block Production Engine**: Production-grade 100ms block time with drift compensation and parallel verification.
- **Enterprise Session Policy**: Centralized session bypass policy module for O(1) Set-based path matching and trusted IP validation.
- **Enterprise Scalability Infrastructure**: Resilience patterns including `BlockchainOrchestrator`, `PersistenceBatcher`, and `AdaptiveFeeEngine`.
- **Enterprise Validator Orchestrator & Incentives**: Manages 125 genesis validators with performance scoring, slashing, reward distribution, and a 5-tier performance bonus system.
- **Enterprise Cross-Shard Message Router**: Priority queue-based message delivery with consistent hashing, adaptive retry, and circuit breakers.
- **Enterprise Token Distribution System**: Production-grade 100K+ TPS distribution management with fraud detection and multi-sig approval.
- **Canonical Tokenomics Data Integration**: All 18 token-programs API endpoints use `TokenomicsDataService` as the single source of truth for allocation data provenance.
- **Canonical Token Pricing**: All token prices are defined in `TOKEN_PRICING` (shared/tokenomics-config.ts) as a single source of truth.
- **Enterprise RPC Pages**: Production-grade RPC endpoint management for mainnet and testnet, including status, interactive API documentation, and performance benchmarking.
- **Enterprise System Health Monitor & Diagnostics**: Comprehensive 24/7 monitoring with alerting, self-healing capabilities, and crash analysis.
- **Enterprise Token Custody Mechanism**: Production-grade 4-category custody system with a 20-year distribution schedule.
- **Enterprise Memory Optimization & Guardian**: Automated memory management with auto-scaling, object pooling, and multi-tier cleanup.
- **Database Separation**: Utilizes Replit's infrastructure for separated development and production databases (`DATABASE_URL`, `DATABASE_URL_PROD`).
- **Enterprise Delegator Staking System**: Comprehensive REST API for delegator staking management (portfolio, unbonding, emergency unstake, reward claiming, auto-compound, redelegation) with specific parameters (21-day unbonding, 7-day redelegation cooldown, 10% emergency unstake penalty).
- **Core Infrastructure Components**: Includes Transaction Validator, Mempool Service (Fibonacci heap, Bloom filter), State Store (Merkle Patricia Trie, WAL), P2P Network (WebSocket gossip, peer scoring), Fork Choice (LMD-GHOST variant), and Genesis Builder, orchestrated by `ProductionBlockchainOrchestrator`.
- **Design Patterns**: Employs Singleton, EventEmitter, LRU Cache, Fibonacci Heap, Bloom Filter, and Write-Ahead Log.
- **Realtime Block Production Pipeline**: Orchestrates block production, typically targeting 100K TPS in production (100ms blocks). Disabled by default for stability, explicitly enabled via `ENABLE_BLOCK_PIPELINE=true`.
- **Pipeline API Endpoints**: Monitoring and control via `/api/pipeline/*`.
- **Drizzle Persistence Adapters**: Five PostgreSQL adapters for state, sync, bootstrap, block, and validator persistence with retry logic and write buffering.
- **Shard Processing Coordinator**: Bridges `RealtimeBlockPipeline` with the Enterprise Sharding System, routing transactions to 24 shards and managing cross-shard communication.
- **Parallel Shard Block Producer**: Enables true horizontal scaling across 24 shards, targeting 100K+ TPS total in production.
- **Polling Interval Optimization**: Client-side polling for network stats set to 30s; server-side `RealtimeMetricsService` polling set to 30s to reduce load.
- **Enterprise Remote Signer Architecture**: Production-grade isolated key management with GCP Secret Manager, HSM support, key rotation, audit logging, and mTLS.
- **External Validator Program**: Standalone validator node implementation for external operators, including Remote Signer Client, Block Producer, and Attestation Service.
- **External Validator Software**: GCP deployment infrastructure for external validators, including scripts for VPC, firewall, Secret Manager, Compute Engine, mTLS certificate deployment, and monitoring.
- **Validator Security Admin Portal**: Admin page `/admin/validator-security` for managing external validator security, including overview, alerts, rate limits, IP whitelist, and audit logs.
- **External Validator Security Sync Protocol**: Production-grade communication with bcrypt+pepper API key hashing, HMAC-SHA256 signatures, and replay attack prevention.
- **External Validator Registration System**: 3-step wizard at `/validator-registration` for external validators with cryptographic proof verification, node info collection (Community, Standard, Pioneer, Genesis tiers), and infrastructure documentation.
- **RPC-Validator Integration**: Integration layer connecting validator engine with RPC gateway, featuring auto-sync, health checks, tier-based rate limiting, and allowlist management.
- **TypeScript Validator SDK**: Comprehensive SDK for programmatic validator management (`external-validator-program/src/sdk/tburn-validator-sdk.ts`).
- **Security Hardening**: Implemented mandatory HMAC-SHA256 signature verification, timestamp/nonce validation, rate limiting, mTLS client certificate validation, and sensitive data masking.
- **Genesis Validator Key Generation System**: Production-grade 125 validator key generation with tiered distribution (Core: 10, Enterprise: 25, Partner: 40, Community: 50), cryptographic key pair generation using ethers.js, and secure database storage via Drizzle ORM. Endpoints: `/api/genesis-validators/status` (public), `/api/genesis-validators/generate` (admin), `/api/genesis-validators` (authenticated list).

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
- **Session Management**: `redis`, `connect-redis`

## Recent Changes (2026-01-16)

### Production Cold Start Fix (CRITICAL)
- **Fast-Path API Responses**: Added lightweight static data responses for critical public APIs (`/api/network/stats`, `/api/validators`, `/api/auth/check`) during cold start to prevent Replit Autoscale proxy timeout (30s) from causing 500 errors.
- **Production Environment Variables**: Set `DEV_SAFE_MODE=true` and `SKIP_VALIDATOR_SIMULATION=true` in production environment to reduce cold start time.
- **Architecture Clarification**: BlockPipeline is a visualization/simulation component only; real production blockchain uses separate validator-node stack (HotStuff BFT consensus, mempool, state engine) that operates independently.

### Security Hardening for Mainnet Launch
- **Admin Authentication Overhaul**: Removed header-based password bypass; admin routes now require session-based authentication via `handleAdminLogin` function with rate limiting (5 attempts/15 min), 1-hour lockout after failed attempts, and audit logging.
- **Redis Security Service**: New `server/services/redis-security-service.ts` provides distributed rate limiting and nonce tracking for multi-instance deployments with automatic in-memory fallback.
- **External Validator API Migration**: Migrated from in-memory to Redis-backed rate limiting and nonce stores for clustered deployment support.
- **Genesis/DB Routes Protection**: Added `requireAdmin` middleware to `genesis-routes.ts` and `db-optimization-routes.ts`.
- **Event Loop Lag Bug Fix**: Fixed 900ms false positive warnings in `production-health-monitor.ts` caused by hardcoded `expectedMs` value.

### Performance and Routing Fixes
- **BlockPipeline Disabled**: Set `ENABLE_BLOCK_PIPELINE=false` in environment to prevent 36-second startup lag caused by WAL recovery (860K+ entries). This keeps the server responsive for production use.
- **Validator Page Fix**: Removed `AuthGuard` from `/validator` route in `client/src/App.tsx` - the Validator Command Center is now a public page accessible without authentication.

### Security Files Reference
- `server/middleware/auth.ts` - Centralized authentication middleware with admin rate limiting
- `server/services/redis-security-service.ts` - Redis-backed distributed security service
- `server/index-prod.ts` - Production entry point with cold start fast-path handlers