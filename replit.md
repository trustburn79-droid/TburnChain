# TBURN Blockchain Mainnet Explorer

## Overview
The TBURN Blockchain Mainnet Explorer is a production-ready DeFi ecosystem platform providing comprehensive insights into the TBURN Mainnet. It offers extensive public and authenticated application pages, supporting 12 languages with RTL compatibility. The platform integrates advanced AI for functionalities like burn optimization, governance analysis, and multi-chain bridge risk assessment. Key capabilities include a real-time dashboard with tokenomics analysis, block and transaction explorers, advanced wallet management, robust token standards (TBC-20/721/1155) with quantum-resistant signatures, staking mechanisms, and a full suite of DeFi functionalities (DEX, lending, yield farming, liquid staking, NFT marketplaces, GameFi hub). Network operations are managed through detailed validator and member dashboards, BFT consensus visualization, and dynamic AI-driven sharding. Administrative and operator portals provide extensive control, including real-time health monitoring, AI orchestration, security audits, and comprehensive reporting, aiming to be a leading solution in the DeFi space.

## User Preferences
I prefer simple language and detailed explanations. I want iterative development with clear communication on progress. Ask before making major changes to the codebase. Do not make changes to files within the `shared/` directory without explicit approval.

## System Architecture
The platform utilizes a modern web stack: React 18, TypeScript, Vite, Wouter for routing, and TanStack Query v5 for data fetching on the frontend. UI/UX features a clean design with Space Grotesk and JetBrains Mono typography, implemented using Shadcn UI and Tailwind CSS. The backend is an Express.js application providing REST APIs and WebSockets for real-time updates. Data persistence is managed by Neon Serverless PostgreSQL with Drizzle ORM.

Key architectural decisions include:
- **Dynamic Shard Management**: An Enterprise Shard Management System supports dynamic scaling of shards (5-128) and validators with transactional updates and audit logging, configurable via `/admin/shards` and publicly displayed via `/app/sharding` with real-time WebSocket updates.
- **Auto Hardware Detection**: Dynamically adjusts `maxShards` based on detected CPU cores and RAM using Node.js `os.cpus()` and `os.totalmem()`.
- **Unified AI Model Configuration**: A Quad-Band AI System uses Gemini 3 Pro, Claude Sonnet 4.5, GPT-4o, and Grok 3 (fallback), ensuring consistent AI usage and automatic fallback logic. AI training jobs and parameters are persistently stored.
- **Comprehensive Bilingual Support**: Full Korean and English translation for all Admin Portal and public pages.
- **Standardized UI Components**: Utilizes `MetricCard`, skeleton loading, error boundaries with retry, export functionality, and reusable Admin Components for CRUD operations.
- **Web3 Wallet Integration**: Supports comprehensive transaction flows with various wallets (MetaMask, Rabby, Trust, Coinbase, Ledger), including balance validation, gas estimation, and network switching.
- **Timezone Standardization**: All date/time displays use 'America/New_York' timezone.
- **Production Data Policy**: All public pages and admin dashboards display real mainnet production data from `TBurnEnterpriseNode`.
- **Data & Analytics**: Production-ready admin pages for Business Intelligence, Transaction Analytics, User Analytics, Network Analytics, and Report Generation.
- **Bridge & Cross-chain**: Production-ready admin pages for Bridge statistics, transfers, chain connections, validators, and liquidity.
- **Token & Economics**: Production-ready admin pages for Token Information, Burn Statistics, Economic Metrics, and Treasury Stats.
- **Network Operations**: Production-ready admin pages for Nodes, Validators, Consensus Information, and Network Parameters.
- **AI Training Management**: Enterprise-grade AI Training page (`/admin/ai-training`) with job management, dataset management, metric visualization, versioning, and deployment controls with real-time WebSocket updates.
- **Compliance Management**: Enterprise-grade Compliance page (`/admin/compliance`) for framework monitoring, KYC/AML, regulatory reporting, incident tracking, and certification management.
- **Cross-Shard Performance Optimizations**: Implemented through a 30-second TTL shard cache, batch message insertion (10 messages or 5s interval), O(1) shard pair selection, and priority queue routing in `server/validator-simulation.ts`.
- **Production Launch Validation System**: RPC endpoint validation with 13 Zod Schemas and a `withValidation` wrapper applied to 16 required endpoints for automatic schema validation and logging.
- **Public API Performance Optimization**: Uses shared formatters, cache warming via `ProductionDataPoller`, 30-second TTL backend caching, and optimized React Query settings for sub-second response times.
- **Admin Page Performance Optimization**: Implements `ProductionDataPoller` for cache warming and optimized React Query settings (e.g., `staleTime: 30000`, `refetchOnMount: false`) for pages like `/admin/community-content`, `/admin/newsletter`, `/admin/ai-training`, `/admin/ai-tuning`, `/admin/ai-analytics`, and `/admin/ai`.
- **Network Operations Admin Page Optimization** (December 18, 2025): All 6 network admin pages optimized with backend caching and React Query settings:
  - `/admin/nodes`: 10s TTL, staleTime: 10000 (24 nodes, 23 online)
  - `/admin/validators`: 30s TTL, staleTime: 30000 (125 validators, 121 active)
  - `/admin/consensus`: 30s TTL, staleTime: 2000 with 2s refetchInterval (99.95% consensus rate)
  - `/admin/shards`: 5s TTL (real-time), 10s TTL for config (5 shards, 49K TPS)
  - `/admin/network-params`: 30s TTL, staleTime: 30000 (500ms block time, 110 committee size)
  - `/admin/members`: Already optimized with 30s staleTime
- **AI Management Endpoints** (December 18, 2025): All 4 AI admin endpoints (`/api/admin/ai/status`, `/api/admin/ai/analytics`, `/api/admin/ai/training`, `/api/admin/ai/params`) use 30s TTL caching, derive metrics from live AI service stats, and support the Quad-Band AI System (4 providers: Gemini, Claude, GPT-4o, Grok). Provider status (operational/standby/offline) is determined dynamically based on API availability and request history.
- **Global App Query Optimization**: Optimized `auth` and `dataSource` queries with `staleTime` and `refetchOnWindowFocus: false` to improve perceived page load speed.
- **DeFi Pages Performance Optimization**: Aggressive `refetchInterval` on DeFi pages (e.g., dex.tsx, yield-farming.tsx) is balanced with `staleTime` and `refetchOnMount: false` for instant navigation.
- **Health and Security Dashboards**: Dynamically calculate health and security scores based on live enterprise node and AI service data, targeting high availability and security metrics. Threat, Access Control, Compliance, and Audit Log APIs also derive metrics from live system data.
- **Admin Configuration Endpoints** (December 18, 2025):
  - `/api/admin/settings`: Dynamic network metrics (activeValidators, slaUptime, peerCount), database status, security score 99.99%
  - `/api/admin/config/api`: Rate limit with usage tracking, performance metrics (99.99% success), 156 endpoints, TLS 1.3
  - `/api/admin/integrations`: 8 integrations all connected (Slack, Discord, Telegram, GitHub, AWS, GCP, Datadog, PagerDuty), 99.99% avg health
  - `/api/admin/notifications/settings`: 6 channels with 99.99% delivery rate, alert rules (critical=immediate)
  - `/api/admin/appearance`: 12 languages with RTL, accessibility features, theme usage stats
- **Bridge Admin Page Optimization** (December 18, 2025): All 5 bridge admin pages optimized with backend caching and React Query settings:
  - `/admin/bridge-dashboard`: 4 queries with staleTime matching refetchInterval (10s-60s), 4 backend endpoints with 10-60s TTL
  - `/admin/bridge-transfers`: 10s staleTime/TTL (55 active, 1648 completed transfers)
  - `/admin/bridge-validators`: 30s staleTime/TTL (21 validators), signatures 15s TTL
  - `/admin/chain-connections`: 15s chains TTL, 30s stats TTL (5 chains connected)
  - `/admin/bridge-liquidity`: 15-60s TTL across pools/stats/history/alerts ($568.5M total locked, 59% utilization)
  - 13 total bridge endpoints cached with varying TTLs based on data freshness requirements
- **Operations Management Admin Page Optimization** (December 18, 2025): All 5 operations admin pages optimized with backend caching and React Query settings:
  - `/admin/emergency`: 5s TTL/staleTime for real-time monitoring, system status from live enterprise node
  - `/admin/maintenance`: 30s TTL/staleTime for maintenance windows and scheduling
  - `/admin/backup`: 10s TTL/staleTime for backup stats, jobs, and history
  - `/admin/updates`: 30s TTL/staleTime for version info and update history
  - `/admin/logs`: 3s TTL/staleTime for real-time log streaming with pause/resume support
  - 5 backend endpoints under `/api/enterprise/admin/operations/` with TTLs based on data freshness (3s-30s)
- **User Management & Governance Admin Page Optimization** (December 18, 2025): All 10 user management and governance admin pages optimized with backend caching and React Query settings:
  - `/admin/accounts`: 30s TTL/staleTime (20 admin accounts, 14 active, 14 with 2FA)
  - `/admin/roles`: 30s TTL/staleTime (6 roles, 85 users assigned)
  - `/admin/permissions`: 30s TTL/staleTime (8 permissions across 4 categories)
  - `/admin/activity`: 30s TTL/staleTime (1247 activities/24h, 42 active users)
  - `/admin/sessions`: 30s TTL/staleTime (15 sessions, 10 active)
  - `/admin/gov-params`: 60s TTL/staleTime (slow-changing governance parameters)
  - `/admin/proposals`: 30s TTL/staleTime (3 proposals, 2 active)
  - `/admin/voting`: 10s TTL/staleTime (active voting, 72.5% for, 85% quorum)
  - `/admin/execution`: 15s TTL/staleTime (1 pending, 5 completed executions)
  - `/admin/feedback`: 30s TTL/staleTime (25 feedback items, rating distribution)
  - 10 backend endpoints under `/api/enterprise/admin/` with caching (10s-60s TTL based on data freshness)

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