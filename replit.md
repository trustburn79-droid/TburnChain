# TBURN Blockchain Mainnet Explorer

## Overview
The TBURN Blockchain Mainnet Explorer is a production-ready DeFi ecosystem platform designed to provide comprehensive insights into the TBURN Mainnet. It features extensive public and authenticated application pages, supporting 12 languages with RTL compatibility. The platform integrates advanced AI for burn optimization, governance analysis, and multi-chain bridge risk assessment. Key functionalities include a real-time dashboard with tokenomics analysis, block and transaction explorers, advanced wallet management, robust token standards (TBC-20/721/1155) with quantum-resistant signatures, staking mechanisms, and a full suite of DeFi capabilities (DEX, lending, yield farming, liquid staking, NFT marketplaces, GameFi hub). Network operations are managed through detailed validator and member dashboards, BFT consensus visualization, and dynamic AI-driven sharding. Administrative and operator portals offer extensive control, including real-time health monitoring, AI orchestration, security audits, and comprehensive reporting.

## User Preferences
I prefer simple language and detailed explanations. I want iterative development with clear communication on progress. Ask before making major changes to the codebase. Do not make changes to files within the `shared/` directory without explicit approval.

## System Architecture
The platform utilizes a modern web stack with React 18, TypeScript, Vite, Wouter for routing, and TanStack Query v5 for frontend data fetching. The UI/UX features a clean design using Space Grotesk and JetBrains Mono typography, implemented with Shadcn UI and Tailwind CSS. The backend is an Express.js application providing REST APIs and WebSockets for real-time updates. Data persistence is managed by Neon Serverless PostgreSQL with Drizzle ORM.

Core architectural decisions and features include:
- **Dynamic Shard Management**: An Enterprise Shard Management System supports dynamic scaling of shards (5-128) and validators, with transactional updates and audit logging. Auto hardware detection adjusts `maxShards` based on CPU cores and RAM.
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
- **Public API & Admin Page Performance Optimization**: Utilizes shared formatters, cache warming via `ProductionDataPoller`, backend caching (30-second TTL), and optimized React Query settings for sub-second response times and efficient data fetching across all dashboards, including network operations, AI management, global app queries, DeFi pages, bridge, operations, user management, governance, developer tools, monitoring, finance, and support.
- **Public App Page React Query Optimization**: All 12 public app pages (/app, /app/blocks, /app/transactions, /app/wallets, /app/wallet-dashboard, /app/token-system, /app/bridge, /app/governance, /app/burn, /app/staking, /app/staking/rewards, /app/staking/sdk) are optimized with `staleTime` matching `refetchInterval`, `refetchOnMount: false`, and `refetchOnWindowFocus: false` for instant navigation and reduced API calls. TTLs range from 5s (real-time transfers) to 60s (slow-changing configs).
- **Health and Security Dashboards**: Dynamically calculate health and security scores based on live enterprise node and AI service data.

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