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
- **Dashboard**: Displays real-time network statistics, recent blocks, and transactions.
- **Blocks & Transactions**: Provides detailed explorers with search and filter capabilities, supporting TBURN v7.0 Multi-Hash Cryptographic System.
- **Validators**: Tracks validators, stake, commission, APY, uptime, behavior score, and adaptive weight, powered by an AI-Enhanced Committee BFT.
- **AI Orchestration**: Enterprise-level Triple-Band AI monitoring (GPT-5, Claude Sonnet 4.5, Llama 4) with detailed analytics, Recharts visualizations, feedback learning, and a real-time AI Decision Stream.
- **Sharding**: Monitors Dynamic AI-Driven Sharding with ML-based optimization, showing per-shard TPS, block height, load, and validator distribution.
- **Smart Contracts**: Tracks deployed contracts, verification, transaction counts, balances, and offers an interaction interface.
- **Node Health**: Utilizes a Predictive Self-Healing System based on four AI algorithms to display system metrics, network metrics, uptime, and sync status.
- **Token System v4.0**: Implements AI-Enhanced Enterprise Token Standards (TBC-20, TBC-721, TBC-1155) with quantum-resistant security, AI burn optimization, cross-chain bridging with AI risk assessment, AI Governance, and an Auto-Burn System.
- **Operator Portal**: A comprehensive back-office for network management, including dashboards, member management, validator operations, security audits, and compliance reports.
- **API Key Management**: Provides a secure admin interface for generating, managing, and revoking API keys.
- **Admin Control Panel**: A production-only mainnet management interface for real-time health monitoring, mainnet pause detection, remote restart, and comprehensive health checks.
- **Enterprise Search**: Universal search system supporting blocks, transactions, addresses, and validators with real-time autocomplete, keyboard navigation, type-based filtering, and public API access.
- **Internationalization (i18n)**: Complete 12-language support with enterprise-grade translations, including RTL support for Arabic and Urdu.
- **DeFi Ecosystem (DEX/AMM)**: Full-featured decentralized exchange with multiple AMM curve types (Constant-Product, Stable Swap, Concentrated Liquidity, Multi-Asset/Weighted Pools), AI-Optimized Routing, liquidity management, and security features like MEV Protection and Circuit Breakers.
- **DeFi Ecosystem (Lending/Borrowing)**: Enterprise-grade decentralized lending protocol with a Jump Rate model, collateral management (Collateral Factor, Liquidation Threshold, Liquidation Penalty), and core operations (Supply, Withdraw, Borrow, Repay, Liquidate).

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