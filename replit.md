# TBURN Blockchain Mainnet Explorer

## Overview
The TBURN Blockchain Mainnet Explorer is a professional-grade tool for comprehensive insights into the TBURN blockchain. It offers real-time network monitoring, AI orchestration management, validator tracking, a smart contract interface, sharding system monitoring, and detailed node health dashboards. The project aims to provide a robust and user-friendly platform for observing and interacting with the TBURN mainnet for developers and blockchain enthusiasts. The explorer fully visualizes all 7 core patent technologies of TBURN v7.0, providing comprehensive monitoring and insights into the blockchain's advanced features.

**Latest Updates (November 26, 2025):**
- **Operator Portal Enterprise Upgrade**: Complete back-office for TBURN network management
  - **Dashboard**: Real-time system health cards, KPI trend charts (Recharts), alert center with severity queue, Zod validation
  - **Member Management**: Bulk actions, CSV export, advanced date filters, activity timeline, notes CRUD with timestamps
  - **Validator Operations (4-tab)**: Applications, Performance metrics, Slashing history tracking, Reward calculator with tier comparison
  - **Security Audit (4-tab)**: Events with filters, Threat Monitor (24h activity chart, severity pie chart, live feed, geo-location), IP Blocklist management, Audit Logs
  - **Compliance Reports (4-tab)**: Reports list with CSV export, Templates (5 report types), Auto-scheduling with toggle controls, Compliance checklist with score and category breakdown
  - Routes: `/operator`, `/operator/members`, `/operator/validators`, `/operator/security`, `/operator/reports`
  - Authentication: Admin password via sessionStorage with `x-admin-password` header
  - Context: `AdminPasswordProvider` in `client/src/hooks/use-admin-password.tsx`
  - E2E Tests: All pages verified with Playwright (21/21 steps passing)
- **Tiered Validator System**: Implemented 3-tier validator structure for scalable tokenomics
  - Tier 1: Active Committee - Max 512 validators, 200K+ TBURN stake, 8% target APY
  - Tier 2: Standby Validators - Max 4,488 validators, 50K+ TBURN stake, 4% target APY
  - Tier 3: Delegators - Unlimited, 100+ TBURN delegation, 5% target APY
  - Configuration: `shared/tokenomics-config.ts`
- **Dynamic Emission Model**: Sustainable tokenomics with burn mechanism
  - Base Emission: 5,000 TBURN/day, 20% burn rate
  - Net Emission: 4,000 TBURN/day (1.5% annual inflation)
  - Formula: BaseEmission × min(1.15, sqrt(EffectiveStake / 32M))
  - Pool allocation: 50% Tier 1, 30% Tier 2, 20% Tier 3
- **Tokenomics API Endpoints**:
  - `GET /api/tokenomics/tiers` - Returns tier configuration, emission, and staking data
  - `GET /api/tokenomics/tier/:stakeTBURN` - Determines tier for given stake amount
  - `GET /api/tokenomics/estimate-rewards` - Calculates estimated rewards for stake
- **Enhanced Dashboard & Validators UI**:
  - Dashboard: Tokenomics section with daily emission/burn stats and tier summaries
  - Validators: Tier badges (Tier 1/2/3), detailed APY display, reward pool breakdown
  - Visual tier indicators with gradient colors (amber=Tier1, blue=Tier2, gray=Tier3)

**Previous Updates (November 25, 2025):**
- **TBURN Gas Unit: Ember (EMB)**: Implemented TBURN's unique gas unit system throughout the chain
  - 1 TBURN = 1,000,000 Ember (EMB)
  - Standard Gas Price: 10 EMB (0.00001 TBURN)
  - Gas tiers: Economy (5 EMB), Standard (10 EMB), Express (25 EMB), Instant (50 EMB)
  - All transaction fees, gas prices, and estimated costs now display in EMB
  - Conversion utilities: `tburnToEmber()`, `emberToTburn()`, `formatEmber()`, `formatGasPriceEmber()`
- **Enterprise Wallet Stability**: Fixed wallet data flickering and NaN issues
  - 100 consistent wallets with deterministic addresses and power-law balance distribution
  - Complete schema: balance, stakedBalance, unstakedBalance, rewardsEarned
  - Unified wallet count (100) across API and WebSocket broadcasts
- **Data Source Status API**: Added `/api/system/data-source` endpoint for transparent data source identification
  - Automatically detects if connected to external mainnet or local simulation
  - Returns: `dataSourceType`, `isSimulated`, `nodeUrl`, `message`, `connectionStatus`
- **Improved Data Source Badge**: Enhanced UI badge with real-time API status
  - Shows "Simulated" (amber) when using local TBurnEnterpriseNode
  - Shows "Mainnet" (green) when connected to external TBURN node
  - Tooltip shows detailed connection info on hover
- **External Mainnet Connection Support**: System now supports connecting to external TBURN nodes
  - Set `TBURN_NODE_URL` environment variable to external node URL
  - Set `TBURN_WS_URL` for WebSocket connection
  - Set `TBURN_API_KEY` for authentication
  - Dashboard automatically updates badge based on connection type

**Previous Updates (November 24, 2025):**
- **Critical Stability Fix - Eliminated Duplicate WebSocket Broadcasts**: Resolved data disappearance and flickering on Wallets and Cross-Shard pages
- **Production Data Stability Enhancement**: Eliminated UI flickering and race conditions on Cross-Shard and Wallets pages
- **Data Source Indicators**: Added visual badges to distinguish between real mainnet data and demo/simulated data on dashboard cards
- **Production Environment Improvements**: Enhanced API error handling and initialization for production deployments
- **Enterprise Performance Optimization**: Fully restored production-level performance with 100ms block time (10 blocks/second)
- **Memory Management Enhancement**: Increased data rotation limits to enterprise levels (1000 blocks, 5000 transactions) for 50,000+ TPS support
- **TPS Performance**: Achieved target 50,000+ TPS capability through optimized block production and transaction processing

## User Preferences
I prefer simple language and detailed explanations. I want iterative development with clear communication on progress. Ask before making major changes to the codebase. Ensure all new features have comprehensive test coverage. Do not make changes to files within the `shared/` directory without explicit approval.

## System Architecture

### UI/UX Decisions
The explorer uses a professional, data-centric aesthetic with Inter for UI and IBM Plex Mono for code. It employs a blue-toned color scheme with full dark mode support. Shadcn UI provides base components with custom hover/active states, consistent spacing, and `rounded-md` border radii. Recharts is used for data visualization.

### Technical Implementations
The frontend is built with React 18, TypeScript, Vite, Wouter for routing, and TanStack Query v5 for data fetching. The backend uses Express.js for REST APIs and `ws` for WebSocket communication. PostgreSQL (Neon Serverless) with Drizzle ORM provides data persistence via a DbStorage abstraction. Real-time updates are handled by WebSockets. BigInt values are serialized to strings, and token amounts are in Wei-unit strings. Timestamps are Unix seconds. A transaction simulator includes interactive creation, broadcasting, and Zod validation.

**Admin Panel Production-Grade Error Handling**: Implements a real failure tracking system that shows actual system state without masking issues. Features include:
- **Failure History**: Persists up to 100 recent failures to localStorage with timestamps, status codes, and endpoints
- **Real Failure Display**: Shows actual API errors (401, 429, 500, 502) without fallback to fake data
- **Data Source States**: "live" (real-time data), "cached" (last known good), or "failed" (no data available)
- **Visual Failure Indicators**: Cards show "---" and "No data" with reduced opacity when APIs fail
- **Error Classification**: Distinguishes between rate limits (429), authentication failures (401), API errors (500/502), and network issues

### Feature Specifications
- **Dashboard**: Real-time network stats, recent blocks, transactions, and charts.
- **Blocks & Transactions**: Detailed explorers with search/filter, supporting TBURN v7.0 Multi-Hash Cryptographic System (BLAKE3, SHA3-512, SHA-256).
- **Validators**: AI-Enhanced Committee BFT with Reputation + Performance + AI Trust Score, tracking active/inactive validators, stake, commission, APY, uptime, behavior score, and adaptive weight.
- **AI Orchestration**: Triple-Band AI monitoring (GPT-5, Claude Sonnet 4.5, Llama 4) with feedback learning, cross-band interactions, model weight, request counts, response times, costs, cache hit rates, and a real-time AI Decision Stream.
- **Sharding**: Dynamic AI-Driven Sharding with ML-based optimization, monitoring multiple shards with ML optimization score, predicted load, profiling score, capacity utilization, AI recommendations, per-shard TPS, block height, load, and validator distribution.
- **Smart Contracts**: Tracking deployed contracts, verification, transaction counts, balances, and an interaction interface.
- **Node Health**: Predictive Self-Healing System using 4 AI algorithms (Trend Analysis, Anomaly Detection, Pattern Matching, Timeseries Forecast), displaying system metrics (CPU, memory, disk), network metrics, uptime, and sync status.
- **API Key Management**: Secure admin interface for generating, managing, and revoking API keys with bcrypt hashing and one-time display.
- **Admin Control Panel**: Production-only mainnet management interface with:
  - Real-time mainnet health monitoring (block production, TPS, last block time)
  - Mainnet pause detection with critical alerts (detects >1 hour block production stalls)
  - Remote mainnet restart capability via POST /api/admin/restart endpoint
  - Comprehensive health check via POST /api/admin/health endpoint
  - Status dashboard with last block timestamp, TPS metrics, and peak TPS history
  - Automatic recovery status tracking with expected 30-60s restart time

### System Design Choices
The project utilizes a monorepo structure (`client/`, `server/`, `shared/`). Drizzle ORM ensures type-safe database interactions. All critical data is persisted in PostgreSQL. Session-based authentication protects API routes and WebSocket connections.

## External Dependencies
- **Database**: Neon Serverless PostgreSQL
- **ORM**: Drizzle ORM
- **Frontend Framework**: React 18
- **UI Component Library**: Shadcn UI
- **Styling**: Tailwind CSS
- **Data Fetching**: TanStack Query v5
- **Routing**: Wouter
- **WebSocket**: `ws` library
- **AI Integrations**: Anthropic Claude 4.5 Sonnet, OpenAI GPT-5 (via Replit AI Integrations)
- **Data Visualization**: Recharts
- **Validation**: Zod
- **Session Management**: `express-session`
- **Password Hashing**: bcryptjs