# TBURN Blockchain Mainnet Explorer

## Overview
The TBURN Blockchain Mainnet Explorer is a production-ready DeFi ecosystem platform designed to provide comprehensive insights into the TBURN Mainnet. It features extensive public and authenticated application pages, supporting 12 languages with full RTL compatibility. The platform integrates advanced AI for functionalities such as burn optimization, governance analysis, and multi-chain bridge risk assessment. Key capabilities include a real-time dashboard with tokenomics analysis, block and transaction explorers, advanced wallet management, and support for robust token standards (TBC-20/721/1155) with quantum-resistant signatures. It also incorporates staking mechanisms, a full suite of DeFi functionalities (DEX, lending, yield farming, liquid staking, NFT marketplaces), and a GameFi hub. Network operations are managed through detailed validator and member dashboards, BFT consensus visualization, and dynamic AI-driven sharding. Administrative and operator portals provide extensive control, including real-time health monitoring, AI orchestration, security audits, and comprehensive reporting, aiming to be a leading solution in the DeFi space.

## User Preferences
I prefer simple language and detailed explanations. I want iterative development with clear communication on progress. Ask before making major changes to the codebase. Do not make changes to files within the `shared/` directory without explicit approval.

## System Architecture
The platform is built with a modern web stack. The frontend leverages React 18, TypeScript, Vite, Wouter for routing, and TanStack Query v5 for data fetching. UI/UX emphasizes a clean design with Space Grotesk typography for text and JetBrains Mono for code, implemented using Shadcn UI and Tailwind CSS. The backend is an Express.js application providing REST APIs and WebSocket for real-time updates. Data persistence is handled by PostgreSQL (Neon Serverless) with Drizzle ORM.

Key architectural decisions include:
- **Dynamic Shard Management**: Enterprise Shard Management System allows dynamic scaling of shards (5-128) and validators with transactional updates and audit logging. Admin configuration via `/admin/shards` and public display via `/app/sharding`, with real-time updates via WebSocket.
- **Auto Hardware Detection**: Uses Node.js `os.cpus()` and `os.totalmem()` to automatically detect CPU cores and RAM on startup. The system dynamically adjusts `maxShards` based on hardware capacity (development: 8 cores/32GB → 8 shards, staging: 16/64GB → 16 shards, production: 32/256GB → 64 shards, enterprise: 64/512GB → 128 shards). Hardware limits are enforced on database config load to ensure system stability.
- **Unified AI Model Configuration**: Utilizes a Quad-Band AI System with Gemini 3 Pro, Claude Sonnet 4.5, GPT-4o, and Grok 3 (fallback), ensuring consistent AI model usage and automatic fallback logic. AI training jobs and parameters are persistently stored in the database.
- **Comprehensive Bilingual Support**: Full Korean and English translation system across all Admin Portal and public pages.
- **Standardized UI Components**: Utilizes `MetricCard`, skeleton loading states, error boundaries with retry, and export functionality (CSV/JSON). Reusable Admin Components (`DetailSheet`, `AdminFormDialog`, `ConfirmationDialog`, `ActionMenu`, `StatusBadge`) for CRUD operations.
- **API Data Handling**: Consistent patterns for icon rendering and data retrieval.
- **Enhanced Security**: Access control, audit logging, and threat detection integrated into the Admin Portal.
- **Web3 Wallet Integration**: Comprehensive transaction flow support with connection to various wallets (MetaMask, Rabby, Trust, Coinbase, Ledger), including balance validation, gas estimation, and network switching.
- **Timezone Standardization**: All date/time displays across the application use the 'America/New_York' timezone.
- **Production Data Policy**: All public pages and admin dashboards display real mainnet production data from `TBurnEnterpriseNode`, without simulation or mock data.
- **Data & Analytics**: Production-ready admin pages for Business Intelligence, Transaction Analytics, User Analytics, Network Analytics, and Report Generation, all fetching data from `TBurnEnterpriseNode`.
- **Bridge & Cross-chain**: Production-ready admin pages for Bridge statistics, transfers, chain connections, validators, and liquidity, integrated with `TBurnEnterpriseNode`.
- **Token & Economics**: Production-ready admin pages for Token Information, Burn Statistics, Economic Metrics, and Treasury Stats, integrated with `TBurnEnterpriseNode`.
- **Network Operations**: Production-ready admin pages for Nodes, Validators, Consensus Information, and Network Parameters, integrated with `TBurnEnterpriseNode`.
- **AI Training Management**: Enterprise-grade AI Training page (`/admin/ai-training`) with:
  - Training Jobs tab: Job creation, monitoring, pause/resume/cancel functionality
  - Datasets tab: Enhanced dataset management with quality metrics
  - Metrics tab: Training accuracy and loss visualization
  - Versions tab: Model version history and deployment controls
  - Deployments tab: Production model deployments with canary releases, health monitoring, rollback capability
  - Real-time WebSocket updates for training progress
- **Compliance Management**: Enterprise-grade Compliance page (`/admin/compliance`) with:
  - Frameworks tab: Regulatory compliance framework monitoring (SOC2, GDPR, PCI-DSS, ISO27001, etc.)
  - KYC/AML tab: Customer verification and anti-money laundering monitoring with verification metrics
  - Regulatory Reports tab: Compliance report generation and audit trail
  - Incidents tab: Security incident tracking and resolution monitoring
  - Certifications tab: Industry certification management with expiry tracking
  - Dynamic compliance scoring with risk indicators and framework metadata
- **Cross-Shard Performance Optimizations**: Enterprise-grade cross-shard messaging optimizations in `server/validator-simulation.ts`:
  - **Shard Cache with TTL**: 30-second TTL cache for shard data to avoid repeated DB queries
  - **Batch Message Insertion**: Cross-shard messages are buffered and batch-inserted (10 messages or 5s interval) with priority queue ordering
  - **O(1) Shard Pair Selection**: Modular arithmetic replaces O(n) while loops for random shard pair selection
  - **Priority Queue Routing**: Weighted composite scoring (priority 40%, reputation 35%, network 25%) ensures high-priority messages are processed first

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