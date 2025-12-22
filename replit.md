# TBURN Blockchain Mainnet Explorer

## Overview
The TBURN Blockchain Mainnet Explorer is a production-ready DeFi ecosystem platform providing comprehensive insights into the TBURN Mainnet. It features extensive public and authenticated application pages, supporting 12 languages with RTL compatibility. The platform integrates advanced AI for burn optimization, governance analysis, and multi-chain bridge risk assessment. Key capabilities include a real-time dashboard with tokenomics, block and transaction explorers, advanced wallet management, robust token standards (TBC-20/721/1155) with quantum-resistant signatures, staking, and a full suite of DeFi functionalities (DEX, lending, yield farming, liquid staking, NFT marketplaces, GameFi hub). Network operations are managed through validator and member dashboards, BFT consensus visualization, and dynamic AI-driven sharding. Administrative and operator portals offer extensive control, including real-time health monitoring, AI orchestration, security audits, and comprehensive reporting.

## User Preferences
I prefer simple language and detailed explanations. I want iterative development with clear communication on progress. Ask before making major changes to the codebase. Do not make changes to files within the `shared/` directory without explicit approval.

## System Architecture
The platform utilizes a modern web stack with React 18, TypeScript, Vite, Wouter for routing, and TanStack Query v5 for frontend data fetching. The UI/UX features a clean design using Space Grotesk and JetBrains Mono typography, implemented with Shadcn UI and Tailwind CSS. The backend is an Express.js application providing REST APIs and WebSockets for real-time updates. Data persistence is managed by Neon Serverless PostgreSQL with Drizzle ORM.

Core architectural decisions and features include:
- **Dynamic Shard Management**: An Enterprise Shard Management System supports dynamic scaling of shards (5-128) and validators, with transactional updates and audit logging. Shard count is determined by: (1) `MAX_SHARDS` environment variable (highest priority), (2) Hardware auto-detection (cores × 2, RAM ÷ 4), (3) Database `shard_configurations.current_shard_count`. TPS per shard = `tpsPerShard` (10,000) × load% (35-70%). For production deployment, set `MAX_SHARDS=64` in PM2 `ecosystem.config.js` and ensure DB has `min_shards=5`, `max_shards=64` for proper dropdown range.
- **Unified AI Model Configuration**: A Quad-Band AI System integrates Gemini 3 Pro, Claude Sonnet 4.5, GPT-4o, and Grok 3 (fallback) for consistent AI usage and automatic fallback.
- **Comprehensive Bilingual Support**: Full Korean and English translation for all Admin Portal and public pages.
- **Standardized UI Components**: Utilizes `MetricCard`, skeleton loading, error boundaries with retry, export functionality, and reusable Admin Components for CRUD operations.
- **Web3 Wallet Integration**: Supports comprehensive transaction flows with various wallets (MetaMask, Rabby, Trust, Coinbase, Ledger), including balance validation, gas estimation, and network switching.
- **Timezone Standardization**: All date/time displays use 'America/New_York' timezone.
- **Production Data Policy**: All public pages and admin dashboards display real mainnet production data from `TBurnEnterpriseNode`.
- **Data & Analytics**: Production-ready admin pages for Business Intelligence, Transaction Analytics, User Analytics, Network Analytics, and Report Generation.
- **Bridge & Cross-chain**: Production-ready admin pages for Bridge statistics, transfers, chain connections, validators, and liquidity.
- **Token & Economics**: Production-ready admin pages for Token Information, Burn Statistics, Economic Metrics, and Treasury Stats.
- **Network Operations**: Production-ready admin pages for Nodes, Validators, Consensus Information, and Network Parameters.
- **AI Training & Compliance Management**: Enterprise-grade admin pages for AI training job management, dataset management, metric visualization, versioning, deployment controls, framework monitoring, KYC/AML, regulatory reporting, incident tracking, and certification management.
- **Cross-Shard Performance Optimizations**: Achieved through 30-second TTL shard caching, batch message insertion, O(1) shard pair selection, and priority queue routing.
- **Production Launch Validation System**: RPC endpoint validation with 13 Zod Schemas and a `withValidation` wrapper applied to 16 required endpoints.
- **Public API & Admin Page Performance Optimization**: Utilizes shared formatters, cache warming via `ProductionDataPoller`, backend caching (30-second TTL), and optimized React Query settings for sub-second response times.
- **Public App Page React Query Optimization**: All public app pages (wallet-dashboard, ai-orchestration, smart-contracts, transaction-simulator) are optimized with `staleTime` matching `refetchInterval`, `refetchOnMount: true`, and `refetchOnWindowFocus: false`.
- **DeFi Application Pages React Query Optimization**: All 8 DeFi pages are optimized with `staleTime` matching `refetchInterval`, `refetchOnMount: false`, and `refetchOnWindowFocus: false`.
- **Network Operations Pages Optimization**: Consensus, sharding, cross-shard, and community pages are optimized with `staleTime` matching `refetchInterval`, `refetchOnMount: false`, `refetchOnWindowFocus: false`.
- **Zero-Delay Authentication**: Login flow uses optimistic cache updates via `queryClient.setQueryData`.
- **Public DeFi Stats API Access**: Dashboard DeFi stats endpoints are public read-only APIs that don't require authentication.
- **Public App Page Rendering**: The `AuthenticatedApp` component renders the full application shell regardless of authentication status, allowing unauthenticated users to browse.
- **React Query Instant Page Loads**: All 15+ app pages use `placeholderData: keepPreviousData` + `retry: 3` to eliminate loading spinners.
- **WebSocket REST Fallback**: WebSocket disconnect triggers REST query invalidation for 12 critical endpoints.
- **Dashboard WebSocket Resilience**: Dashboard uses WebSocket with exponential backoff reconnection (1s-30s, max 5 attempts, 60s cooldown reset) and REST fallback.
- **Vite HMR in Replit**: HMR is disabled in Replit environments to prevent WebSocket connection failures.
- **HTML Loading Indicator**: A static loading spinner is added in `client/index.html` for immediate visual feedback.
- **AI Service Fail-Fast Optimization**: `AIServiceManager.makeRequest()` checks for available providers before entering retry loops.
- **User Page (`/user`)**: Korean-language blockchain explorer interface with 5 sections (Dashboard, Wallet & Transfer, Staking, Governance, Network Status). Features user-centric dashboard showing personalized financial data: portfolio overview (liquid + staked balance), unclaimed rewards summary, mining rewards breakdown by source, staking positions with APY per validator, event participation (airdrops/campaigns/governance rewards), and recent activity feed.
- **User Data API (`/api/user/:address/*`)**: Public read-only endpoints for user-specific data including overview, mining-rewards, staking-positions, staking-rewards, events, and activities. Uses address-based seed generation for consistent sample data during development.
- **366-Day Stability Architecture**: Includes server-side event loop protection (execution overlap guards, circuit breaker pattern, subscriber-aware scheduling) and client-side memory leak prevention (WebSocket reconnection limits, orphan listener prevention, timer cleanup) with resilience patterns (REST fallback, graceful degradation, component unmount guards).
- **Engineering Standards**: Emphasizes `useEffect` best practices for preventing infinite loops and render blocking, including proper dependency array usage, `useRef` for index/counter tracking, `isActive` guards for async operations, and consistent cleanup functions.
- **TBURN Bech32m Address Standardization**: All blockchain addresses use Bech32m format with `tb1` prefix (~41 characters: `tb1` + base32 data + 6-char checksum). Example: `tb1edmprvaftt65lkp2x6v8fmjvst5spfruj47kwm`. Centralized utilities in `server/utils/tburn-address.ts` provide `encodeBech32m()`/`decodeBech32m()` for Bech32m encoding per BIP-350, deterministic address generation (SHA-256 hashing), random address generation, and validator address formatting. Legacy `tburn...` format (45 chars) is supported via `migrateLegacyAddress()` for backward compatibility. Transaction hashes remain in `0x` format (64-char hex).
- **Bug Bounty Program**: Full security bug bounty management system with public submission (/bug-bounty) and admin management (/admin/bug-bounty). Features severity-based rewards (Critical: $1M, High: $50K, Medium: $10K, Low: $2K, Informational: $500), status workflow (pending → reviewing → accepted/rejected/duplicate → paid), and Hall of Fame display. Public endpoints (/api/bug-bounty) allow anonymous submissions without authentication. Admin endpoints use session-based auth with dashboard stats, filtering by status, and reward management.
- **Token Generator i18n Implementation**: Complete internationalization for /token-generator page using react-i18next with `tokenGenerator.*` translation namespace. Features TEMPLATE_LOCALE_KEYS and FEATURE_LOCALE_KEYS mappings for dynamic content, console deployment logs (`tokenGenerator.console.*`), security vulnerability messages (`tokenGenerator.security.*`), all with defaultValue fallbacks. Full translations in en/ko/ja/zh, English fallbacks in ar/bn/es/fr/hi/pt/ru/ur for professional translation.
- **Token Factory Production Deployment**: Complete production-ready token deployment infrastructure for Dec 22nd mainnet launch. Includes: (1) Web3 provider service (`client/src/lib/web3-provider.ts`) for TBURN Mainnet Chain ID 7979 with MetaMask integration; (2) Token factory ABIs (`client/src/lib/token-factory-abi.ts`) for TBC-20/721/1155 standards; (3) Backend TokenFactoryService (`server/services/TokenFactoryService.ts`) for gas estimation, transaction building, receipt waiting; (4) Public API endpoints at `/api/token-factory/*` (status, estimate-gas, build-transaction, confirm-deployment, validate, simulate-deploy, wait-receipt, my-tokens); (5) Dual deployment modes (wallet mode for real MetaMask deployment, simulation mode for testing); (6) Factory addresses configurable via environment variables (TBC20_FACTORY_ADDRESS, TBC721_FACTORY_ADDRESS, TBC1155_FACTORY_ADDRESS, TBURN_RPC_URL); (7) Factory status endpoint with launch readiness checks and warnings.

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