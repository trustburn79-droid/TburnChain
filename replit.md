# TBURN Blockchain Mainnet Explorer

## Overview
The TBURN Blockchain Mainnet Explorer is a professional-grade tool for comprehensive insights into the TBURN blockchain. It offers real-time network monitoring, AI orchestration management, validator tracking, a smart contract interface, sharding system monitoring, and detailed node health dashboards. The project aims to provide a robust and user-friendly platform for observing and interacting with the TBURN mainnet for developers and blockchain enthusiasts. The explorer fully visualizes all 7 core patent technologies of TBURN v7.0, providing comprehensive monitoring and insights into the blockchain's advanced features.

## User Preferences
I prefer simple language and detailed explanations. I want iterative development with clear communication on progress. Ask before making major changes to the codebase. Ensure all new features have comprehensive test coverage. Do not make changes to files within the `shared/` directory without explicit approval.

## System Architecture

### UI/UX Decisions
The explorer uses a professional, data-centric aesthetic with Inter for UI and IBM Plex Mono for code. It employs a blue-toned color scheme with full dark mode support. Shadcn UI provides base components with custom hover/active states, consistent spacing, and `rounded-md` border radii. Recharts is used for data visualization.

### Technical Implementations
The frontend is built with React 18, TypeScript, Vite, Wouter for routing, and TanStack Query v5 for data fetching. The backend uses Express.js for REST APIs and `ws` for WebSocket communication. PostgreSQL (Neon Serverless) with Drizzle ORM provides data persistence via a DbStorage abstraction. Real-time updates are handled by WebSockets. BigInt values are serialized to strings, and token amounts are in Wei-unit strings. Timestamps are Unix seconds. A transaction simulator includes interactive creation, broadcasting, and Zod validation.

### Feature Specifications
- **Dashboard**: Real-time network stats, recent blocks, transactions, and charts.
- **Blocks & Transactions**: Detailed explorers with search/filter, supporting TBURN v7.0 Multi-Hash Cryptographic System (BLAKE3, SHA3-512, SHA-256).
- **Validators**: AI-Enhanced Committee BFT with Reputation + Performance + AI Trust Score, tracking active/inactive validators, stake, commission, APY, uptime, behavior score, and adaptive weight.
- **AI Orchestration**: Triple-Band AI monitoring (GPT-5, Claude Sonnet 4.5, Llama 4) with feedback learning, cross-band interactions, model weight, request counts, response times, costs, cache hit rates, and a real-time AI Decision Stream.
- **Sharding**: Dynamic AI-Driven Sharding with ML-based optimization, monitoring multiple shards with ML optimization score, predicted load, profiling score, capacity utilization, AI recommendations, per-shard TPS, block height, load, and validator distribution.
- **Smart Contracts**: Tracking deployed contracts, verification, transaction counts, balances, and an interaction interface.
- **Node Health**: Predictive Self-Healing System using 4 AI algorithms (Trend Analysis, Anomaly Detection, Pattern Matching, Timeseries Forecast), displaying system metrics (CPU, memory, disk), network metrics, uptime, and sync status.
- **API Key Management**: Secure admin interface for generating, managing, and revoking API keys with bcrypt hashing and one-time display.

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