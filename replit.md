# TBURN Blockchain Mainnet Explorer

## Overview
The TBURN Blockchain Mainnet Explorer is a professional-grade tool for comprehensive insights into the TBURN blockchain. It provides real-time network monitoring, AI orchestration management, validator tracking, smart contract interaction, sharding system monitoring, and detailed node health dashboards. The project aims to offer a robust and user-friendly platform for observing and interacting with the TBURN mainnet, catering to both developers and blockchain enthusiasts. It fully visualizes all 7 core patent technologies of TBURN v7.0, offering deep insights into the blockchain's advanced features, including AI-enhanced enterprise token standards, dynamic emission models, and a unique gas unit system.

## User Preferences
I prefer simple language and detailed explanations. I want iterative development with clear communication on progress. Ask before making major changes to the codebase. Ensure all new features have comprehensive test coverage. Do not make changes to files within the `shared/` directory without explicit approval.

## System Architecture

### UI/UX Decisions
The explorer features a professional, data-centric aesthetic with Inter font for UI and IBM Plex Mono for code, utilizing a blue-toned color scheme with full dark mode support. Shadcn UI provides base components with custom hover/active states, consistent spacing, and `rounded-md` border radii. Recharts is employed for data visualization across various dashboards.

### Technical Implementations
The frontend uses React 18, TypeScript, Vite, Wouter for routing, and TanStack Query v5 for data fetching. The backend uses Express.js for REST APIs and `ws` for WebSocket communication. Data persistence is handled by PostgreSQL (Neon Serverless) with Drizzle ORM. Real-time updates are managed via WebSockets. The system includes an Admin Panel with production-grade error handling.

### Feature Specifications

#### Explorer Pages
- **Dashboard**: Real-time network statistics, tokenomics overview, DeFi ecosystem metrics, recent blocks/transactions with live WebSocket updates.
- **Blocks & Transactions**: Detailed explorers with search/filter capabilities, TBURN v7.0 Multi-Hash Cryptographic System support (SHA3-512, BLAKE3, Poseidon).
- **Validators**: Tracks 156 active validators with stake amounts, commission rates, APY (12-18%), uptime, behavior scores, and adaptive weights via AI-Enhanced Committee BFT.

#### DeFi Ecosystem
- **DEX/AMM** (`/app/dex`): Full-featured decentralized exchange with 4 AMM curve types:
  - Constant-Product (xy=k) for volatile pairs
  - Stable Swap with low slippage for pegged assets
  - Concentrated Liquidity for capital efficiency
  - Multi-Asset/Weighted Pools for index-like exposure
  - Features: AI-Optimized Routing, MEV Protection, Circuit Breakers, liquidity mining rewards
  
- **Lending Protocol** (`/app/lending`): Enterprise-grade lending with Jump Rate interest model:
  - **Core Operations**: Supply, Withdraw, Borrow, Repay, Liquidate
  - **Interest Rates**: Variable and Stable rate modes for borrowing
  - **Collateral Management**: Collateral Factor, Liquidation Threshold (80%), Liquidation Penalty (5%)
  - **Risk Monitoring**: Health Factor tracking, at-risk/liquidatable position alerts, 24hr liquidation history
  - **UI Tabs**: Overview (market list), My Position (supplied/borrowed assets), Supply, Borrow, Liquidations

- **Staking** (`/app/staking`): Comprehensive staking system with:
  - **Pool Tiers**: Bronze, Silver, Gold, Platinum, Diamond with increasing APY boosts
  - **APY Range**: Base 8-15% with tier boosts up to +3%
  - **Features**: Lock periods (30-365 days), early withdrawal penalties, auto-compounding
  - **AI Insights**: APY prediction (30-day forecast), trend analysis (bullish/bearish), confidence scores
  - **Rewards Calculator**: Daily/weekly/monthly/yearly projections based on amount, pool, and duration
  - **Validator Insights**: Top validator scores, uptime tracking, per-validator APY

- **Governance** (`/app/governance`): AI-powered decentralized governance:
  - **Proposal Management**: Draft, Active, Succeeded, Defeated, Queued, Executed, Cancelled statuses
  - **Voting**: For/Against/Abstain with quorum tracking and participation metrics
  - **AI Analysis**: Claude 4.5 Sonnet-powered proposal analysis with confidence scores
  - **Impact Assessment**: Economic impact (+/-), Security impact (0-100)
  - **Predicted Outcomes**: AI-driven vote predictions with key influencing factors
  - **Statistics**: Total proposals, pass rate, average participation, AI prediction accuracy

#### Network Monitoring
- **AI Orchestration** (`/app/ai-orchestration`): Triple-Band AI monitoring:
  - GPT-5 for natural language processing and complex reasoning
  - Claude Sonnet 4.5 for analytical tasks and code review
  - Llama 4 for lightweight inference and local processing
  - Features: Real-time AI Decision Stream, feedback learning, performance analytics via Recharts

- **Node Health** (`/app/node-health`): Predictive Self-Healing System with 4 AI algorithms:
  - **Trend Analysis**: Historical pattern recognition for performance forecasting
  - **Anomaly Detection**: Real-time deviation alerts and automatic mitigation
  - **Pattern Matching**: Behavior correlation across network nodes
  - **Timeseries Forecasting**: Predictive resource utilization modeling
  - **System Metrics**: CPU/Memory/Disk usage with color-coded status (green/yellow/red)
  - **Network Metrics**: Latency (P50, P95, P99), bandwidth utilization, peer connections
  - **Overall Health Score**: Composite metric from all system/network components

- **Sharding** (`/app/sharding`): Dynamic AI-Driven Sharding:
  - Per-shard metrics: TPS, block height, load percentage, validator distribution
  - ML-based optimization for automatic shard rebalancing
  - Cross-shard communication monitoring

#### Token System
- **Token System v4.0** (`/app/tokens`): AI-Enhanced Enterprise Token Standards:
  - **TBC-20**: Fungible tokens with quantum-resistant signatures, AI burn optimization
  - **TBC-721**: NFTs with metadata standards, royalty enforcement, cross-chain bridging
  - **TBC-1155**: Multi-tokens with batch operations, dynamic supply management
  - **Auto-Burn System**: Algorithmic supply reduction based on network activity
  - **Cross-Chain Bridging**: AI risk assessment for bridge transactions

#### Administration
- **Operator Portal** (`/app/operator`): Enterprise back-office:
  - Network dashboard, member management, validator operations
  - Security audits, compliance reports, access control
  
- **Admin Control Panel** (`/app/admin`): Production mainnet management:
  - Real-time health monitoring, mainnet pause detection
  - Remote restart capabilities, comprehensive health checks
  
- **API Key Management** (`/app/api-keys`): Secure key lifecycle:
  - Generate, rotate, revoke API keys
  - Usage analytics, rate limit configuration

#### Cross-Cutting Features
- **Enterprise Search**: Universal search across blocks, transactions, addresses, validators with autocomplete and keyboard navigation
- **Internationalization (i18n)**: 12-language support (en, ko, zh, ja, hi, es, fr, ar, bn, ru, pt, ur) with RTL for Arabic/Urdu
- **Typography**: Space Grotesk for headings/body, JetBrains Mono for terminal/code elements

### System Design Choices
The project adopts a monorepo structure, separating `client/`, `server/`, and `shared/` components. Drizzle ORM is used for type-safe database interactions. Critical data is persisted in PostgreSQL, and session-based authentication secures API routes and WebSocket connections. The Enterprise Integration Architecture includes a DataHub Service for unified cross-module data orchestration, an EventBus Service with 34 channels, and Enterprise API Routes for public read-only access.

## External Dependencies
- **Database**: Neon Serverless PostgreSQL
- **ORM**: Drizzle ORM
- **Frontend Framework**: React 18
- **UI Component Library**: Shadcn UI
- **Styling**: Tailwind CSS
- **Data Fetching**: TanStack Query v5
- **Routing**: Wouter
- **WebSocket**: `ws` library
- **AI Integrations**: Anthropic Claude 4.5 Sonnet, OpenAI GPT-5
- **Data Visualization**: Recharts
- **Validation**: Zod
- **Session Management**: `express-session`
- **Password Hashing**: bcryptjs