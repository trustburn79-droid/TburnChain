# TBURN Blockchain Mainnet Explorer

## Overview
The TBURN Blockchain Mainnet Explorer is a professional-grade tool for comprehensive insights into the TBURN blockchain. It offers real-time network monitoring, AI orchestration management, validator tracking, a smart contract interface, sharding system monitoring, and detailed node health dashboards. The project aims to provide a robust and user-friendly platform for observing and interacting with the TBURN mainnet for developers and blockchain enthusiasts. The explorer fully visualizes all 7 core patent technologies of TBURN v7.0, providing comprehensive monitoring and insights into the blockchain's advanced features.

**Latest Updates (November 24, 2025):**
- **Production Data Stability Enhancement**: Eliminated UI flickering and race conditions on Cross-Shard and Wallets pages
  - Fixed AI Decisions Zod validation errors by making all schema fields optional (`.partial()`) to handle incomplete mainnet API responses
  - Increased WebSocket snapshot broadcast intervals to production-safe values: AI Decisions (60s), Cross-Shard (30s), Wallets (30s)
  - Implemented deep data comparison in WebSocket channel to skip identical updates, preventing unnecessary cache invalidation
  - Verified 35-second stability with no flickering via end-to-end Playwright testing
- **Data Source Indicators**: Added visual badges to distinguish between real mainnet data and demo/simulated data on dashboard cards
  - Green "Mainnet" badge for production data
  - Amber "Demo Data" badge for simulated/development data
  - Badges appear on main stat cards and in the header for clear data source identification
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