# TBURN Blockchain Mainnet Explorer

## Overview
The TBURN Blockchain Mainnet Explorer is a production-ready DeFi ecosystem platform providing comprehensive insights into the TBURN Mainnet. It features extensive public and authenticated application pages, supporting 12 languages with RTL compatibility. The platform integrates advanced AI for burn optimization, governance analysis, and multi-chain bridge risk assessment. Key capabilities include a real-time dashboard with tokenomics, block and transaction explorers, advanced wallet management, robust token standards (TBC-20/721/1155) with quantum-resistant signatures, staking, and a full suite of DeFi functionalities (DEX, lending, yield farming, liquid staking, NFT marketplaces, GameFi hub). The business vision is to provide a transparent, efficient, and secure gateway to the TBURN Mainnet, fostering adoption and innovation within its DeFi ecosystem.

## User Preferences
I prefer simple language and detailed explanations. I want iterative development with clear communication on progress. Ask before making major changes to the codebase. Do not make changes to files within the `shared/` directory without explicit approval.

## System Architecture
The platform utilizes a modern web stack with React 18, TypeScript, Vite, Wouter for routing, and TanStack Query v5 for frontend data fetching. The UI/UX features a clean design using Space Grotesk and JetBrains Mono typography, implemented with Shadcn UI and Tailwind CSS. The backend is an Express.js application providing REST APIs and WebSockets for real-time updates. Data persistence is managed by Neon Serverless PostgreSQL with Drizzle ORM.

Core architectural decisions and features include:
- **Dynamic Shard Management**: Supports dynamic scaling of shards (5-64) and validators with transactional updates, targeting 210,000 TPS.
- **Unified AI Model Configuration**: Integrates Gemini 3 Pro, Claude Sonnet 4.5, GPT-4o, and Grok 3 with automatic fallback.
- **Internationalization**: Full Korean and English support with fallback for other languages.
- **Web3 Wallet Integration**: Supports major wallets (MetaMask, Rabby, Trust, Coinbase, Ledger).
- **Production Data Policy**: All public pages and admin dashboards display real mainnet production data from `TBurnEnterpriseNode`.
- **Comprehensive Admin Portals**: Production-ready admin pages for Business Intelligence, Analytics, Reporting, Network Operations, AI Training, and Compliance Management.
- **Enterprise BFT Consensus Engine**: Production-level 5-phase Byzantine Fault Tolerant protocol with lock-based consensus safety.
- **Enterprise Block Production Engine**: Production-grade 100ms block time with drift compensation and parallel verification pipeline.
- **Block Finality System**: Complete block finality infrastructure with cross-validator verification.
- **Transaction Verification Pipeline**: ECDSA-style signature verification, Merkle root generation, and block integrity verification.
- **Reward Distribution Engine**: Automatic validator reward distribution based on proposer rewards, verifier rewards, and gas fee distribution.
- **Mainnet Launch Configuration**: Chain ID 6000, 125 genesis validators, 64 shards, ~210,000 TPS capacity, 20-year deflationary tokenomics, and various burn mechanics.
- **Performance Optimizations**: Includes instant first load, deferred data fetch, static landing page architecture, and route-based code splitting.
- **Production Stability v2.0**: Enhanced session bypass module with 98%+ skip ratio targeting. Features production environment detection, 22+ User-Agent patterns for internal/bot detection, static asset filtering, internal IP detection (localhost, Docker, private networks), auth-critical path protection, Set-Cookie header blocking, and WebSocket upgrade handling. Prevents MemoryStore overflow for 24/7 stability.
- **Enterprise Session Monitoring**: Production-grade session metrics and observability system with Prometheus export, historical tracking, and alerting.
- **Enterprise Scalability Infrastructure**: Resilience patterns including `BlockchainOrchestrator`, `PersistenceBatcher`, and `AdaptiveFeeEngine`.
- **Enterprise Validator Orchestrator**: Production-grade validator management for 125 genesis validators with performance scoring, committee formation, slashing, jailing, tombstoning, and reward distribution.
- **Enterprise Validator Performance Tracking**: Telemetry system with percentile tracking, SLA monitoring, and real-time alerting.
- **Enterprise Reward Distribution Engine**: Epoch-based reward system with O(1) lookups, priority queue batch processing, and gas price tracking.
- **Performance-Based Validator Incentive System**: 5-tier performance bonus system with automatic distribution, streak bonuses, and consistency bonuses.
- **Token Distribution Admin System**: Enterprise-level management for various token programs (Airdrops, Referrals, Community Rewards, DAO Governance).
- **Enterprise Cross-Shard Message Router**: Priority queue-based message delivery system for optimal cross-shard communication with consistent hashing, adaptive retry, and circuit breakers.
- **Enterprise Shard Cache**: Multi-level LRU cache with O(1) shard pair selection, TTL, and preemptive cache warming.
- **Enterprise Batch Processor**: High-throughput batch message insertion system targeting 200K+ TPS with lock-free concurrent priority queue, adaptive batch sizing, and parallel processing.
- **Enterprise Shard Rebalancer**: Threshold-based automatic shard rebalancing system for optimal load distribution with EWMA-based load prediction and zero-downtime live migration.
- **Enterprise Token Distribution System**: Production-grade 100K+ TPS distribution management with 8 specialized programs (Airdrop, Referral, Events, Community, DAO Treasury, Block Rewards, Validator Incentives, Ecosystem Fund). Features lock-free priority queue, token bucket rate limiting, circuit breaker pattern, fraud detection engine, eligibility verification, and multi-sig approval workflow (AUTO/SINGLE/MULTI/COMMITTEE).
- **Enterprise Distribution Database Schema**: 8 optimized tables for high-TPS operations including distribution_programs, distribution_claims (with partial indexes for pending/processing), distribution_batches, distribution_claim_approvals, distribution_audit_events (immutable compliance logs), distribution_fraud_assessments, distribution_rate_limits, and distribution_metrics_history (time-series for monitoring).

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

## Production Stability (24/7 Operation)

### Session Management
The application uses MemoryStore by default for session management. For 24/7 production stability:

1. **Session Skip Ratio Target**: ≥80% (currently achieving 96%+)
2. **Emergency Cleanup**: Automatic cleanup at 80% capacity, forced clear at 95%
3. **HTML Page Skip**: Anonymous HTML page visits don't create sessions

### Known Issues & Solutions
- **Internal Server Error after 1-2 hours**: Caused by MemoryStore overflow
  - Solution: Enhanced session bypass (implemented), emergency cleanup (implemented)
  - Permanent Solution: Configure Redis session store with `REDIS_URL` environment variable

### Redis Session Store (Recommended for High Traffic)
To enable Redis session store:
1. Add `REDIS_URL` environment variable with your Redis connection string
2. The application will automatically switch from MemoryStore to Redis

### Monitoring Endpoints
- `/api/production-monitor/dashboard`: Real-time session metrics and health status
- Session skip ratio, MemoryStore capacity, active alerts