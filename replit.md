# TBURN Blockchain Mainnet Explorer

## Overview
The TBURN Blockchain Mainnet Explorer is a production-ready DeFi ecosystem platform providing comprehensive insights into the TBURN Mainnet. It features extensive public and authenticated application pages, supporting 12 languages with RTL compatibility, and integrates advanced AI for burn optimization, governance analysis, and multi-chain bridge risk assessment. Key capabilities include a real-time dashboard with tokenomics, block and transaction explorers, advanced wallet management, robust token standards (TBC-20/721/1155) with quantum-resistant signatures, staking, and a full suite of DeFi functionalities. The business vision is to provide a transparent, efficient, and secure gateway to the TBURN Mainnet, fostering adoption and innovation within its DeFi ecosystem.

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
- **Production Stability v6.0**: Enterprise-grade shard scaling with staged boot pipeline, memory governor, and request shedding. Key improvements:
  - Set-based O(1) exact path lookup (replaces O(n) linear scan)
  - Sorted prefix arrays for longest-match-first optimization
  - URL decoding attack prevention via sanitizePath()
  - X-Skip-Session header trust validation (internal proxies only)
  - Session skip metrics with per-reason counters and skip ratio tracking
  - /tmp disk monitoring endpoint (/api/tmp-status)
  - MemoryStore automatic fallback when DATABASE_URL is not set
  - **v6.0 Staged Shard Boot Pipeline**: Intent queue, shell warming, async streaming, readiness confirmation (max 2 concurrent, 5s spacing), circuit breaker (5 failures threshold, 60s reset)
  - **v6.0 Memory Governor**: Dynamic ceiling calculation, shard hibernation, diff-based compaction (75% warn, 85% defer, 90% hibernate, 2% hysteresis, EWMA alpha 0.3)
  - **v6.0 Request Shedder**: Priority-based endpoint classification, cached responses, degraded mode (adaptive 50-300ms threshold, 100 RPS backpressure)
  - **v6.0 API Endpoints**: `/api/sharding/v6/prometheus`, `/api/sharding/v6/health`, `/api/sharding/v6/metrics`, `/api/sharding/v6/pipeline`, `/api/sharding/v6/memory`, `/api/sharding/v6/shedder`
- **Phase 18 v6.0 Database Infrastructure**: Enterprise-grade metrics persistence for shard scaling modules:
  - **v6_shard_pipeline_metrics** (23 columns): Intent queue, activation percentiles (p50/p95/p99), circuit breaker state, health checks
  - **v6_memory_governor_metrics** (30 columns): Heap usage, EWMA smoothing, memory trends, GC metrics, hibernation tracking, threshold history
  - **v6_request_shedder_metrics** (27 columns): Event loop lag, adaptive thresholds, shedding by priority, cache metrics, backpressure tracking
  - **v6_scaling_events** (19 columns): Combined event log with severity, state transitions, correlation IDs, duration tracking
  - **v6_health_snapshots_hourly** (27 columns): Hourly aggregates for historical analysis, event summaries, SLA tracking
  - **28 optimized indexes** for time-series queries, state filtering, correlation lookups, and percentile analysis
- **Enterprise Session Monitoring**: Production-grade session metrics and observability system with Prometheus export, historical tracking, and alerting.
- **Enterprise Session Policy v7.0**: Centralized session bypass policy module (`session-policy.ts`) as single source of truth for all bypass decisions:
  - O(1) Set-based path matching for session-free and auth-required paths
  - CIDR-aware trusted IP validation for X-Skip-Session header security
  - Unified cookie validation with signed cookie support
  - Centralized bypass decision function across all three bypass layers
  - Prometheus metrics export at `/api/session-policy/prometheus`
  - JSON metrics endpoint at `/api/session-policy/metrics`
  - Enterprise logging system with LogLevel enum and log buffering
- **Enterprise Scalability Infrastructure**: Resilience patterns including `BlockchainOrchestrator`, `PersistenceBatcher`, and `AdaptiveFeeEngine`.
- **Enterprise Validator Orchestrator**: Production-grade validator management for 125 genesis validators with performance scoring, slashing, and reward distribution.
- **Enterprise Validator Performance Tracking**: Telemetry system with percentile tracking, SLA monitoring, and real-time alerting.
- **Enterprise Reward Distribution Engine**: Epoch-based reward system with O(1) lookups, priority queue batch processing, and gas price tracking.
- **Performance-Based Validator Incentive System**: 5-tier performance bonus system with automatic distribution, streak bonuses, and consistency bonuses.
- **Token Distribution Admin System**: Enterprise-level management for various token programs (Airdrops, Referrals, Community Rewards, DAO Governance).
- **Enterprise Cross-Shard Message Router**: Priority queue-based message delivery system for optimal cross-shard communication with consistent hashing, adaptive retry, and circuit breakers.
- **Enterprise Shard Cache**: Multi-level LRU cache with O(1) shard pair selection, TTL, and preemptive cache warming.
- **Enterprise Batch Processor**: High-throughput batch message insertion system targeting 200K+ TPS with lock-free concurrent priority queue, adaptive batch sizing, and parallel processing.
- **Enterprise Shard Rebalancer**: Threshold-based automatic shard rebalancing system for optimal load distribution with EWMA-based load prediction and zero-downtime live migration.
- **Enterprise Token Distribution System**: Production-grade 100K+ TPS distribution management with 8 specialized programs, featuring lock-free priority queue, token bucket rate limiting, circuit breaker pattern, fraud detection engine, eligibility verification, and multi-sig approval workflow.
- **Enterprise Distribution Database Schema**: 8 optimized tables for high-TPS operations including distribution_programs, distribution_claims, and audit logs.
- **Enterprise RPC Pages**: Production-grade RPC endpoint management for mainnet and testnet, including status, interactive API documentation with live tester and SDK examples, and performance benchmarking tools.
- **Enterprise System Health Monitor**: Comprehensive 24/7 system monitoring with automatic alerting, self-healing capabilities, and Prometheus-compatible metrics export, tracking CPU, Memory, Disk, HTTP, DB, and Session metrics.
- **Enterprise Crash Diagnostics System**: Production-grade crash analysis with uncaughtException/unhandledRejection handlers, heap snapshot capture at 85% memory, crash context persistence to `/tmp/tburn-crash-logs/`, and detailed Express error middleware with stack traces and memory state.
- **Enterprise Token Custody Mechanism**: Production-grade 4-category custody system with clear distinction between programmatic (53%) and foundation-managed (47%) token portions:
  - **Protocol Automatic (22%)**: On-chain automatic execution including block rewards, staking rewards, and burn mechanisms
  - **Vesting Contract (31%)**: Smart contract-based time-locked release for team, advisor, and investor allocations
  - **Foundation Multisig (17%)**: 3/5 multisig with 7-day (168-hour) timelock for treasury and strategic reserves
  - **Community Pool (30%)**: DAO governance voting-based distribution for ecosystem grants, marketing, and community events
- **Multisig Wallet Management**: 7 database tables for custody tracking (multisigWallets, multisigSigners, custodyTransactions, custodyTransactionApprovals, vestingContracts, custodyDistributionSchedule, custodyQuarterlyReports)
- **20-Year Distribution Schedule**: Verified custody mechanism-based annual token release plan summing exactly to 500B TBURN with stacked area visualization and cumulative progress tracking
- **Enterprise Memory Optimization v7.0**: Production-grade auto-scaling memory management:
  - **METRICS_CONFIG**: Auto-detecting hardware profile with dynamic configuration for small (512MB) and large (32GB+) environments
  - **CircularBuffer**: High-performance ring buffer with batch operations, time-range filtering, reduce/aggregate functions, and dynamic resizing
  - **MetricsAggregator**: Multi-tier aggregation (1min/1hour/1day), anomaly detection with severity levels (low/medium/high/critical), trend analysis with growth rate calculation, Prometheus export
  - **BlockMemoryManager**: Multi-tier LRU cache (Hot/Warm/Cold tiers), TTL-based eviction (60s hot, 300s warm), automatic tier promotion/demotion, hit rate tracking
  - **MemoryManager**: Adaptive GC with heap growth prediction, memory pooling for object/buffer reuse, heap snapshot capture to `/tmp/tburn-heap-snapshots/`, OOM time estimation
  - **API Endpoints**: 8 endpoints - `/api/memory/metrics`, `/api/memory/detailed`, `/api/memory/prometheus`, `/api/memory/gc`, `/api/memory/anomalies`, `/api/memory/snapshots`, `/api/memory/block-cache`
  - **Hardware Detection**: Automatic RAM/CPU detection via os module, adaptive thresholds based on environment size
  - **QueryClient Enhancement**: Server error retry with 3 attempts for 500 errors
  - **Warmup Integration**: DB keep-alive with 30s interval, session-free warmup path

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