# TBURN Blockchain Mainnet Explorer

## Overview
The TBURN Blockchain Mainnet Explorer is a production-ready DeFi platform designed to provide comprehensive insights into the TBURN Mainnet. It features real-time data, multi-language support, and a complete suite of DeFi functionalities, including advanced wallet management, staking, and robust token standards (TBC-20/721/1155) with quantum-resistant signatures. The platform integrates AI for burn optimization, governance analysis, and multi-chain bridge risk assessment. Its primary goal is to foster adoption and innovation within the TBURN DeFi ecosystem by offering a transparent, efficient, and secure gateway.

## User Preferences
I prefer simple language and detailed explanations. I want iterative development with clear communication on progress. Ask before making major changes to the codebase. Do not make changes to files within the `shared/` directory without explicit approval.

## System Architecture
The platform utilizes a modern web stack: React 18, TypeScript, Vite, Wouter, and TanStack Query v5. The UI/UX is built with Shadcn UI and Tailwind CSS, featuring Space Grotesk and JetBrains Mono fonts. The backend is an Express.js application providing REST APIs and WebSockets, with data persisted in Neon Serverless PostgreSQL using Drizzle ORM.

Key architectural decisions and features include:
- **Dynamic Shard Management**: Supports dynamic scaling of shards (5-64) and validators for high TPS.
- **Unified AI Model Configuration**: Integrates Gemini 3 Pro, Claude Sonnet 4.5, GPT-4o, and Grok 3 with automatic fallback.
- **Internationalization**: Full 12-language support with RTL compatibility.
- **Web3 Wallet Integration**: Supports major wallets (MetaMask, Rabby, Trust, Coinbase, Ledger).
- **Production Data Policy**: All public and admin pages display real mainnet production data from `TBurnEnterpriseNode`.
- **Comprehensive Admin Portals**: Production-ready admin pages for Business Intelligence, Analytics, Network Operations, AI Training, and Compliance.
- **Enterprise BFT Consensus Engine**: Production-level 5-phase Byzantine Fault Tolerant protocol.
- **Enterprise Block Production Engine**: 100ms block time with drift compensation and parallel verification.
- **Enterprise Scalability Infrastructure**: Resilience patterns including `BlockchainOrchestrator`, `PersistenceBatcher`, and `AdaptiveFeeEngine`.
- **Enterprise Validator Orchestrator & Incentives**: Manages 125 genesis validators with performance scoring, slashing, and reward distribution.
- **Enterprise Cross-Shard Message Router**: Priority queue-based message delivery with consistent hashing, adaptive retry, and circuit breakers.
- **Enterprise Token Distribution System**: Production-grade 100K+ TPS distribution with fraud detection and multi-sig approval.
- **Canonical Tokenomics Data Integration**: All 18 token-programs API endpoints use `TokenomicsDataService` as the single source of truth.
- **Canonical Token Pricing**: All token prices are defined in `TOKEN_PRICING` (shared/tokenomics-config.ts).
- **Enterprise RPC Pages**: Production-grade RPC endpoint management with status, interactive API documentation, and performance benchmarking.
- **Enterprise System Health Monitor & Diagnostics**: 24/7 monitoring with alerting and self-healing capabilities.
- **Enterprise Token Custody Mechanism**: Production-grade 4-category custody system with a 20-year distribution schedule.
- **Enterprise Memory Optimization & Guardian**: Automated memory management with auto-scaling and object pooling.
- **Database Separation**: Utilizes Replit's infrastructure for separated development and production databases.
- **Enterprise Delegator Staking System**: Comprehensive REST API for delegator staking management with specific parameters.
- **Core Infrastructure Components**: Includes Transaction Validator, Mempool Service (Fibonacci heap, Bloom filter), State Store (Merkle Patricia Trie, WAL), P2P Network, Fork Choice (LMD-GHOST variant), and Genesis Builder, orchestrated by `ProductionBlockchainOrchestrator`.
- **Design Patterns**: Employs Singleton, EventEmitter, LRU Cache, Fibonacci Heap, Bloom Filter, and Write-Ahead Log.
- **Realtime Block Production Pipeline**: Orchestrates block production, targeting 100K TPS (100ms blocks), disabled by default.
- **Drizzle Persistence Adapters**: Five PostgreSQL adapters for state, sync, bootstrap, block, and validator persistence with retry logic and write buffering.
- **Shard Processing Coordinator**: Bridges `RealtimeBlockPipeline` with the Enterprise Sharding System, routing transactions to 24 shards and managing cross-shard communication.
- **Parallel Shard Block Producer**: Enables true horizontal scaling across 24 shards, targeting 100K+ TPS total.
- **Polling Interval Optimization**: Client-side polling for network stats set to 30s; server-side `RealtimeMetricsService` polling set to 30s.
- **Enterprise Remote Signer Architecture**: Production-grade isolated key management with GCP Secret Manager, HSM support, key rotation, and mTLS.
- **External Validator Program**: Standalone validator node implementation including Remote Signer Client, Block Producer, and Attestation Service.
- **External Validator Software**: GCP deployment infrastructure for external validators with scripts for VPC, firewall, and Compute Engine.
- **Validator Security Admin Portal**: Admin page `/admin/validator-security` for managing external validator security.
- **External Validator Security Sync Protocol**: Production-grade communication with bcrypt+pepper API key hashing, HMAC-SHA256 signatures, and replay attack prevention.
- **External Validator Registration System**: 3-step wizard at `/validator-registration` for external validators with cryptographic proof verification.
- **RPC-Validator Integration**: Integration layer connecting validator engine with RPC gateway, featuring auto-sync, health checks, tier-based rate limiting, and allowlist management.
- **TypeScript Validator SDK**: Comprehensive SDK for programmatic validator management (`external-validator-program/src/sdk/tburn-validator-sdk.ts`).
- **Security Hardening**: Implemented mandatory HMAC-SHA256 signature verification, timestamp/nonce validation, rate limiting, mTLS client certificate validation, sensitive data masking, Helmet middleware with Content-Security-Policy headers, and HTML escaping for user-facing error messages.
- **Genesis Validator Key Generation System**: Production-grade 125 validator key generation with tiered distribution and secure database storage.
- **Enterprise Custody Admin System**: Production-grade multisig wallet management at `/admin/custody-signers` with 7/11 threshold configuration, Bech32m address validation (tb1 format), test/production credential modes, and comprehensive audit logging.
- **Session Policy for Admin Routes**: `/api/custody-admin` routes added to `AUTH_REQUIRED_PREFIX_LIST` in `session-policy.ts` to ensure proper session handling for all custody operations.

- **CSRF Protection for Admin Routes**: Session-bound CSRF token validation for custody-admin mutating operations (POST/PUT/PATCH/DELETE). Tokens expire after 1 hour with automatic retry on expiry.

## Recent Changes (2026-01-24)
- **Direct Admin Authentication**: Simplified admin login to direct email + password authentication
  - Single-step login at `/api/admin/auth/login` with email and password
  - Admin credentials: tburnceo@gmail.com (hardcoded for stability)
  - Secure password comparison using `crypto.timingSafeEqual()` to prevent timing attacks
  - Session-based authentication with `req.session.adminAuthenticated = true`
- **Security Hardening for Admin Auth**:
  - Added `secureCompare()` helper function for constant-time string comparison
  - All password comparisons (login, verify-password, middleware) use timing-safe comparison
  - Rate limiting via `loginLimiter` middleware on admin auth endpoints
  - Explicit session save with error handling for persistence reliability
- AdminPasswordPrompt now uses apiRequest for consistent error handling with CSRF token support
- Session-based rate limiting (email primary, sessionID fallback) instead of IP-based for better accuracy
- Implemented CSRF protection for custody-admin routes with session-bound tokens
- Added automatic CSRF token retry on expiry in client-side API requests
- Fixed timingSafeEqual length check to prevent potential crashes
- Fixed session authentication issue for custody-admin routes by adding `/api/custody-admin` to AUTH_REQUIRED_PREFIX_LIST in session-policy.ts
- Fixed audit log recording to use correct DB column names (action_type, performed_at, etc.)
- Fixed error message display to show user-friendly Korean messages instead of raw JSON
- Custody admin signer management now fully functional with proper session persistence across page reloads

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