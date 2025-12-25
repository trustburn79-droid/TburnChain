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
- **Mainnet Genesis Validator Configuration (Dec 25 Launch)**: Mainnet launches with 1,600 validators (Foundation team pool) across 64 shards for real ~210,000 TPS. Validators will be progressively replaced with community validators as they join. This ensures legal compliance with real network capacity from day one.
- **Explorer Page Network Stats Fix**: Explorer pages fetch real-time network stats from `/api/network/stats` for accurate display of TPS, total transactions, and block height.
- **Standardized RPC Endpoints**: All network endpoints standardized to `tburn.io` domain format for RPC, WebSocket, API, and Explorer services across all configurations.
- **TBurn Logo Branding System**: Unified SVG-based `TBurnLogo` component for consistent branding across all application pages, supporting gradient/solid colors and text options.
- **Whitepaper Page**: Static HTML whitepaper served at `/whitepaper` route. The whitepaper v8.0 includes detailed information about TBURN Chain's architecture, Triple-Band AI system, consensus mechanism, tokenomics, and roadmap.

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