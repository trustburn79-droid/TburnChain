# TBURN Blockchain Mainnet Explorer

## Chain Configuration
- **Chain ID**: 5800 (0x16a8)
- **Currency**: TBURN
- **Network**: TBURN Mainnet
- **Genesis Validators**: 125
- **Target TPS**: 210,000
- **Block Time**: 100ms

## Overview
The TBURN Blockchain Mainnet Explorer is a production-ready DeFi ecosystem platform designed to provide comprehensive insights into the TBURN Mainnet. It features extensive public and authenticated application pages, supporting 12 languages with RTL compatibility. The platform integrates advanced AI for burn optimization, governance analysis, and multi-chain bridge risk assessment. Key capabilities include a real-time dashboard with tokenomics, block and transaction explorers, advanced wallet management, robust token standards (TBC-20/721/1155) with quantum-resistant signatures, staking, and a full suite of DeFi functionalities. The project's vision is to establish a transparent, efficient, and secure gateway to the TBURN Mainnet, thereby fostering adoption and innovation within its DeFi ecosystem.

## User Preferences
I prefer simple language and detailed explanations. I want iterative development with clear communication on progress. Ask before making major changes to the codebase. Do not make changes to files within the `shared/` directory without explicit approval.

## System Architecture
The platform utilizes a modern web stack with React 18, TypeScript, Vite, Wouter for routing, and TanStack Query v5 for frontend data fetching. The UI/UX features a clean design using Space Grotesk and JetBrains Mono typography, implemented with Shadcn UI and Tailwind CSS. The backend is an Express.js application providing REST APIs and WebSockets for real-time updates. Data persistence is managed by Neon Serverless PostgreSQL with Drizzle ORM.

Core architectural decisions include:
- **Dynamic Shard Management**: Supports dynamic scaling of shards (5-64) and validators with transactional updates, targeting 210,000 TPS.
- **Unified AI Model Configuration**: Integrates Gemini 3 Pro, Claude Sonnet 4.5, GPT-4o, and Grok 3 with automatic fallback.
- **Internationalization**: Full 12-language support (en, ko, zh, ja, es, fr, pt, ru, ar, hi, bn, ur) with English as default. RTL support for Arabic and Urdu. The `/referral` page has complete i18n coverage across all 9 sections (nav, hero, howItWorks, tiers, dashboard, calculator, leaderboard, faq, footer).
- **Web3 Wallet Integration**: Supports major wallets (MetaMask, Rabby, Trust, Coinbase, Ledger).
- **Production Data Policy**: All public pages and admin dashboards display real mainnet production data from `TBurnEnterpriseNode`.
- **Comprehensive Admin Portals**: Production-ready admin pages for Business Intelligence, Analytics, Reporting, Network Operations, AI Training, and Compliance Management.
- **Enterprise BFT Consensus Engine**: Production-level 5-phase Byzantine Fault Tolerant protocol with lock-based consensus safety.
- **Enterprise Block Production Engine**: Production-grade 100ms block time with drift compensation and parallel verification pipeline.
- **Enterprise Session Policy**: Centralized session bypass policy module as single source of truth for all bypass decisions, including O(1) Set-based path matching and trusted IP validation.
- **Enterprise Scalability Infrastructure**: Resilience patterns including `BlockchainOrchestrator`, `PersistenceBatcher`, and `AdaptiveFeeEngine` with advanced memory and request management (Staged Shard Boot Pipeline, Memory Governor, Request Shedder).
- **Enterprise Validator Orchestrator & Incentives**: Manages 125 genesis validators with performance scoring, slashing, reward distribution, and a 5-tier performance bonus system.
- **Enterprise Cross-Shard Message Router**: Priority queue-based message delivery system for optimal cross-shard communication with consistent hashing, adaptive retry, and circuit breakers.
- **Enterprise Token Distribution System**: Production-grade 100K+ TPS distribution management for various programs with fraud detection and multi-sig approval.
- **Canonical Tokenomics Data Integration**: All 18 token-programs API endpoints now use `TokenomicsDataService` with GENESIS_ALLOCATION as single source of truth. Each endpoint returns canonical allocation data with `source: "/admin/tokenomics"` for data provenance tracking. Covers: airdrop, referral, community, dao, block-rewards, validator-incentives, ecosystem-fund, investment-rounds, launchpad, partnerships, and related programs.
- **Canonical Token Pricing**: All token prices defined in `TOKEN_PRICING` (shared/tokenomics-config.ts) as single source of truth. Seed: $0.04, Private: $0.10, Public/IDO: $0.20, Launch: $0.50. API endpoint: `/api/token-programs/pricing`.
- **Enterprise RPC Pages**: Production-grade RPC endpoint management for mainnet and testnet, including status, interactive API documentation, and performance benchmarking tools.
- **Enterprise System Health Monitor & Diagnostics**: Comprehensive 24/7 monitoring with alerting, self-healing capabilities, and crash analysis including heap snapshot capture.
- **Enterprise Token Custody Mechanism**: Production-grade 4-category custody system (Protocol Automatic, Vesting Contract, Foundation Multisig, Community Pool) with a 20-year distribution schedule.
- **Enterprise Memory Optimization & Guardian**: Automated memory management system with auto-scaling, object pooling, and multi-tier cleanup mechanisms for performance and stability.

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