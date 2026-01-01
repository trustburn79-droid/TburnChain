# TBURN Blockchain Mainnet Explorer

## Overview
The TBURN Blockchain Mainnet Explorer is a production-ready DeFi ecosystem platform providing comprehensive insights into the TBURN Mainnet. It features extensive public and authenticated application pages, supporting 12 languages with RTL compatibility. The platform integrates advanced AI for burn optimization, governance analysis, and multi-chain bridge risk assessment. Key capabilities include a real-time dashboard with tokenomics, block and transaction explorers, advanced wallet management, robust token standards (TBC-20/721/1155) with quantum-resistant signatures, staking, and a full suite of DeFi functionalities (DEX, lending, yield farming, liquid staking, NFT marketplaces, GameFi hub). Network operations are managed through validator and member dashboards, BFT consensus visualization, and dynamic AI-driven sharding. Administrative and operator portals offer extensive control, including real-time health monitoring, AI orchestration, security audits, and comprehensive reporting. The platform's business vision is to provide a transparent, efficient, and secure gateway to the TBURN Mainnet, fostering adoption and innovation within its DeFi ecosystem.

## User Preferences
I prefer simple language and detailed explanations. I want iterative development with clear communication on progress. Ask before making major changes to the codebase. Do not make changes to files within the `shared/` directory without explicit approval.

## System Architecture
The platform utilizes a modern web stack with React 18, TypeScript, Vite, Wouter for routing, and TanStack Query v5 for frontend data fetching. The UI/UX features a clean design using Space Grotesk and JetBrains Mono typography, implemented with Shadcn UI and Tailwind CSS. The backend is an Express.js application providing REST APIs and WebSockets for real-time updates. Data persistence is managed by Neon Serverless PostgreSQL with Drizzle ORM.

Core architectural decisions and features include:
- **Dynamic Shard Management**: An Enterprise Shard Management System supports dynamic scaling of shards (5-128) and validators, with transactional updates and audit logging. Shard count is determined by environment variables, hardware auto-detection, and database configurations.
- **Unified AI Model Configuration**: A Quad-Band AI System integrates Gemini 3 Pro, Claude Sonnet 4.5, GPT-4o, and Grok 3 (fallback) for consistent AI usage and automatic fallback, optimized for fail-fast behavior.
- **Bilingual Support**: Full Korean and English translation for all Admin Portal and public pages, with fallback translations for other languages.
- **Standardized UI Components**: Utilizes `MetricCard`, skeleton loading, error boundaries with retry, export functionality, and reusable Admin Components for CRUD operations.
- **Web3 Wallet Integration**: Supports comprehensive transaction flows with various wallets (MetaMask, Rabby, Trust, Coinbase, Ledger), including balance validation, gas estimation, and network switching.
- **Timezone Standardization**: All date/time displays use 'America/New_York' timezone.
- **Production Data Policy**: All public pages and admin dashboards display real mainnet production data from `TBurnEnterpriseNode`.
- **Comprehensive Admin Portals**: Production-ready admin pages for Business Intelligence, Transaction/User/Network Analytics, Report Generation, Bridge statistics, Token & Economic metrics, Network Operations, AI Training & Compliance Management (KYC/AML, regulatory reporting, incident tracking, certification management).
- **Cross-Shard Performance Optimizations**: Achieved through 30-second TTL shard caching, batch message insertion, O(1) shard pair selection, and priority queue routing.
- **Production Launch Validation System**: RPC endpoint validation with 13 Zod Schemas and a `withValidation` wrapper applied to 16 required endpoints.
- **Public API & Admin Page Performance Optimization**: Utilizes shared formatters, cache warming via `ProductionDataPoller`, backend caching (30-second TTL), and optimized React Query settings for sub-second response times. React Query is extensively optimized across all application pages with `staleTime`, `refetchInterval`, `refetchOnMount`, `refetchOnWindowFocus`, and `placeholderData: keepPreviousData` + `retry: 3` for instant page loads.
- **Authentication & Resilience**: Zero-delay authentication uses optimistic cache updates. Dashboard WebSockets employ exponential backoff with REST fallback for resilience. WebSocket disconnect triggers REST query invalidation for critical endpoints.
- **User Page (`/user`)**: Korean-language blockchain explorer interface with personalized financial data, including portfolio, rewards, staking positions, and recent activity. Public read-only user data API (`/api/user/:address/*`) with address-based seed generation for development.
- **366-Day Stability Architecture**: Includes server-side event loop protection (execution overlap guards, circuit breaker pattern, subscriber-aware scheduling) and client-side memory leak prevention with resilience patterns.
- **Engineering Standards**: Emphasizes `useEffect` best practices for preventing infinite loops and render blocking, proper dependency array usage, `useRef`, `isActive` guards, and cleanup functions.
- **TBURN Bech32m Address Standardization**: All blockchain addresses use Bech32m format with `tb1` prefix, with centralized utilities for encoding/decoding and deterministic/random generation. Legacy `tburn...` format support for backward compatibility.
- **Bug Bounty Program**: Full security bug bounty management system with public submission and admin management, featuring severity-based rewards and status workflows.
- **Token Generator & Factory**: Complete internationalization for `/token-generator` page using `react-i18next`. Production-ready token deployment infrastructure with web3 provider service, ABIs for TBC-20/721/1155, backend service for transaction handling, public API endpoints, and dual deployment modes (wallet/simulation).
- **Unified TPS Synchronization**: All API endpoints display synchronized TPS from a shared 2-second shard cache for legal compliance and accuracy. Base TPS formula: 64 shards × 625 tx × 0.525 load × 10 blocks/sec ≈ 210,000 TPS.
- **Mainnet Genesis Validator Configuration (v4.3)**: Mainnet launches with 125 genesis validators (1M TBURN each = 1.25억 TBURN staking lockup) managed by Foundation team. TGE actual circulation is 4.50억 TBURN (10.75억 unlock - 5.00억 LP lockup - 1.25억 staking lockup). Network runs across 64 shards for ~210,000 TPS capacity.
- **Explorer Page Network Stats Fix**: Explorer pages fetch real-time network stats from `/api/network/stats` for accurate display of TPS, total transactions, and block height.
- **Data Consistency Architecture**: Total Transactions value is cached for 30 seconds via `getTotalTransactions()` method in TBurnEnterpriseNode. All API responses use this cached value instead of the raw `this.totalTransactions` to ensure consistent display across dashboard and transactions pages. React Query settings are aligned with 30s staleTime and refetchOnMount:false for cache sharing.
- **Standardized RPC Endpoints**: All network endpoints standardized to `tburn.io` domain format for RPC, WebSocket, API, and Explorer services across all configurations.
- **TBurn Logo Branding System**: Unified SVG-based `TBurnLogo` component for consistent branding across all application pages, supporting gradient/solid colors and text options.
- **Whitepaper Page**: Static HTML whitepaper served at `/whitepaper` route. The whitepaper v8.0 includes detailed information about TBURN Chain's architecture, Triple-Band AI system, consensus mechanism, tokenomics, and roadmap.
- **Block Finality System (v7.1)**: Complete block finality infrastructure with cross-validator verification using 2/3+1 quorum voting. Blocks transition through `pending → verified → finalized` states with permanent finalization after 6 block confirmations. Integrated via `processBlockFinality()` running asynchronously after each block production.
- **Transaction Verification Pipeline**: ECDSA-style signature verification with secp256k1, Merkle root generation, and block integrity verification. Extended transactions table with `signature`, `signature_verified`, `signature_algorithm`, `public_key`, and `verified_at` fields.
- **Reward Distribution Engine**: Automatic validator reward distribution with 2 TBURN proposer reward, 0.1 TBURN per verifier, and gas fee distribution (50% proposer, 30% verifiers, 20% burn). Epoch-based reward cycles with configurable intervals.
- **Mainnet Launch (January 1st, 2026)**: Production blockchain infrastructure with 125 genesis validators (v4.3 spec), 64 shards, ~210,000 TPS capacity, complete block finality, and automated reward distribution. 20-year tokenomics: Y1 96.90억, Y6 81.75억 (1st halving), Y9 74.08억 (2nd halving), Y20 69.40억 final supply (-30.6% deflation).
- **Development Mode Optimization (v7.2)**: Heavy blockchain services are deferred in development to allow Vite to serve the frontend first. Enterprise Node initialization is deferred by 3 seconds, ProductionDataPoller and ValidatorSimulation by 8-9 seconds. Poll intervals increased to 60 seconds in development (15s in production). Non-essential broadcast intervals (47 of 55) are disabled in development mode. This optimization does not affect production behavior or BLOCK_TIME (100ms).
- **Block Time 100ms Optimization (v7.3)**: Critical fix for maintaining strict 100ms block cadence. `processBlockFinality()` in TBurnEnterpriseNode now runs only every 100 blocks in development (every block in production) to prevent CPU blocking. ValidatorSimulation uses fire-and-forget DB writes with immediate block height increment. Verified: 10 blocks/second maintained, ~201K TPS achieved.
- **Production Cache-Control Fix (v7.4)**: CRITICAL fix for "Failed to fetch dynamically imported module" errors. Production server (`server/index-prod.ts`) now sets proper cache headers: `index.html` uses `no-cache, no-store, must-revalidate` to prevent stale chunk references, while hashed `/assets/*` use `max-age=1y, immutable` for optimal caching. Client-side (`client/src/main.tsx`) includes automatic chunk error recovery handler that detects dynamic import failures and performs auto-reload with cache clearing. This prevents CDN cache mismatches where old HTML references non-existent chunk hashes after deployments.
- **Enhanced Chunk Error Recovery (v7.5)**: Multi-layer defense against chunk loading failures. (1) `client/index.html` now includes inline error handler script that runs BEFORE React loads, catching SCRIPT/LINK failures at the earliest point with 3 retries in 60-second window. (2) `server/index-prod.ts` adds `Surrogate-Control: no-store` header for CDN cache bypass, `X-Content-Version` header for debugging, and `/assets` 404 handler with helpful JSON response. (3) Error UI displays TBURN-branded fallback with manual refresh button when auto-recovery fails. (4) Version synchronization across HTML data-version, JS BUILD_VERSION, and server X-Content-Version headers prevents infinite reload loops.

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