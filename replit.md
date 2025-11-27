# TBURN Blockchain Mainnet Explorer

## Overview
The TBURN Blockchain Mainnet Explorer is a professional-grade tool designed for comprehensive insights into the TBURN blockchain. It provides real-time network monitoring, AI orchestration management, validator tracking, a smart contract interface, sharding system monitoring, and detailed node health dashboards. The project aims to offer a robust and user-friendly platform for observing and interacting with the TBURN mainnet, catering to both developers and blockchain enthusiasts. It fully visualizes all 7 core patent technologies of TBURN v7.0, offering deep insights into the blockchain's advanced features, including AI-enhanced enterprise token standards, dynamic emission models, and a unique gas unit system.

## User Preferences
I prefer simple language and detailed explanations. I want iterative development with clear communication on progress. Ask before making major changes to the codebase. Ensure all new features have comprehensive test coverage. Do not make changes to files within the `shared/` directory without explicit approval.

## System Architecture

### UI/UX Decisions
The explorer features a professional, data-centric aesthetic with Inter font for UI and IBM Plex Mono for code, utilizing a blue-toned color scheme with full dark mode support. Shadcn UI provides base components with custom hover/active states, consistent spacing, and `rounded-md` border radii. Recharts is employed for data visualization across various dashboards.

### Technical Implementations
The frontend is built with React 18, TypeScript, Vite, Wouter for routing, and TanStack Query v5 for data fetching. The backend uses Express.js for REST APIs and `ws` for WebSocket communication. Data persistence is handled by PostgreSQL (Neon Serverless) with Drizzle ORM through a DbStorage abstraction. Real-time updates are managed via WebSockets. BigInt values are serialized to strings, and token amounts are handled as Wei-unit strings. Timestamps are in Unix seconds. The system includes an Admin Panel with production-grade error handling, displaying real API errors and managing data source states (live, cached, failed).

### Feature Specifications
- **Dashboard**: Displays real-time network statistics, recent blocks, transactions, and charts.
- **Blocks & Transactions**: Provides detailed explorers with search and filter capabilities, supporting TBURN v7.0 Multi-Hash Cryptographic System (BLAKE3, SHA3-512, SHA-256).
- **Validators**: Tracks active/inactive validators, stake, commission, APY, uptime, behavior score, and adaptive weight, powered by an AI-Enhanced Committee BFT with Reputation + Performance + AI Trust Score. Includes a 3-tier validator structure for scalable tokenomics.
- **AI Orchestration**: Monitors Triple-Band AI (GPT-5, Claude Sonnet 4.5, Llama 4) with feedback learning, cross-band interactions, and a real-time AI Decision Stream, displaying model weights, request counts, response times, costs, and cache hit rates.
- **Sharding**: Monitors Dynamic AI-Driven Sharding with ML-based optimization, showing per-shard TPS, block height, load, and validator distribution.
- **Smart Contracts**: Tracks deployed contracts, verification, transaction counts, balances, and offers an interaction interface.
- **Node Health**: Utilizes a Predictive Self-Healing System based on four AI algorithms (Trend Analysis, Anomaly Detection, Pattern Matching, Timeseries Forecast) to display system metrics (CPU, memory, disk), network metrics, uptime, and sync status.
- **Token System v4.0**: Implements AI-Enhanced Enterprise Token Standards (TBC-20, TBC-721, TBC-1155) with quantum-resistant security, AI burn optimization, cross-chain bridging with AI risk assessment, AI Governance for proposal analysis, and an Auto-Burn System.
- **Operator Portal**: A comprehensive back-office for network management, including dashboards, member management, validator operations, security audits, and compliance reports.
- **API Key Management**: Provides a secure admin interface for generating, managing, and revoking API keys.
- **Admin Control Panel**: A production-only mainnet management interface for real-time health monitoring, mainnet pause detection, remote restart, and comprehensive health checks.

### DeFi Ecosystem (Phase 1: DEX/AMM)
The TBURN DeFi Ecosystem implements enterprise-grade decentralized finance infrastructure:

- **DEX/AMM Engine**: Full-featured decentralized exchange with multiple AMM curve types:
  - Constant-Product AMM (x*y=k) for standard token pairs
  - Stable Swap AMM (StableSwap curve) for pegged asset pairs
  - Concentrated Liquidity for capital-efficient positions
  - Multi-Asset/Weighted Pools for index-style baskets
  - AI-Optimized Routing for optimal swap paths

- **Liquidity Management**: 
  - LP token minting/burning with position tracking
  - Concentrated liquidity positions with tick ranges
  - Real-time APY calculations and fee accrual

- **Security Features**:
  - MEV Protection (sandwich/frontrunning detection)
  - Circuit Breakers (price deviation, volume surge, liquidity drain)
  - TWAP Oracle for manipulation resistance
  - Flashloan Guards

- **Real-Time Data**:
  - WebSocket broadcasts: pool stats (10s), recent swaps (5s), price feeds (2s), circuit breakers (30s)
  - Price history with OHLC data
  - Volume and fee analytics

- **DEX Schema**: 11 tables (dex_pools, dex_pool_assets, dex_pool_ticks, dex_positions, dex_swaps, dex_price_history, dex_twap_observations, dex_circuit_breakers, dex_mev_events, dex_pool_analytics, dex_route_cache)

### DeFi Ecosystem (Phase 2: Lending/Borrowing)
The TBURN Lending/Borrowing protocol provides enterprise-grade decentralized lending infrastructure:

- **Interest Rate Model**: Jump Rate model with configurable parameters:
  - Base Rate: 2% APY
  - Optimal Utilization: 80%
  - Slope 1: 4% (below optimal)
  - Slope 2: 60% (above optimal - kink rate)
  - Real-time rate calculations based on utilization

- **Collateral Management**:
  - Collateral Factor: 75% (max borrow value vs collateral)
  - Liquidation Threshold: 80%
  - Liquidation Penalty: 5%
  - Health Factor monitoring (liquidation at HF < 1.0)
  - Multi-asset collateral support

- **Core Operations**:
  - Supply: Deposit assets to earn interest
  - Withdraw: Remove supplied assets with accrued interest
  - Borrow: Take collateralized loans
  - Repay: Pay back borrowed amounts
  - Liquidate: Close unhealthy positions with bonus

- **Real-Time Data**:
  - WebSocket broadcasts: markets (10s), risk monitor (15s), transactions (5s), rates (30s), liquidations (20s)
  - Live APY calculations and position updates
  - Risk metrics and health factor monitoring

- **Lending Schema**: 8 tables (lending_markets, lending_supplies, lending_borrows, lending_positions, lending_liquidations, lending_rate_history, lending_config, lending_interest_snapshots)

### System Design Choices
The project adopts a monorepo structure, separating `client/`, `server/`, and `shared/` components. Drizzle ORM is used for type-safe database interactions. Critical data is persisted in PostgreSQL, and session-based authentication secures API routes and WebSocket connections.

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