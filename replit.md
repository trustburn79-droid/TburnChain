# TBURN Blockchain Mainnet Explorer

## Overview
The TBURN Blockchain Mainnet Explorer is a production-ready DeFi ecosystem platform designed to provide comprehensive insights into the TBURN Mainnet. It features extensive public and authenticated application pages, supporting 12 languages with RTL compatibility. The platform integrates advanced AI for burn optimization, governance analysis, and multi-chain bridge risk assessment. Key functionalities include a real-time dashboard with tokenomics analysis, block and transaction explorers, advanced wallet management, robust token standards (TBC-20/721/1155) with quantum-resistant signatures, staking mechanisms, and a full suite of DeFi capabilities (DEX, lending, yield farming, liquid staking, NFT marketplaces, GameFi hub). Network operations are managed through detailed validator and member dashboards, BFT consensus visualization, and dynamic AI-driven sharding. Administrative and operator portals offer extensive control, including real-time health monitoring, AI orchestration, security audits, and comprehensive reporting.

## User Preferences
I prefer simple language and detailed explanations. I want iterative development with clear communication on progress. Ask before making major changes to the codebase. Do not make changes to files within the `shared/` directory without explicit approval.

## System Architecture
The platform utilizes a modern web stack with React 18, TypeScript, Vite, Wouter for routing, and TanStack Query v5 for frontend data fetching. The UI/UX features a clean design using Space Grotesk and JetBrains Mono typography, implemented with Shadcn UI and Tailwind CSS. The backend is an Express.js application providing REST APIs and WebSockets for real-time updates. Data persistence is managed by Neon Serverless PostgreSQL with Drizzle ORM.

Core architectural decisions and features include:
- **Dynamic Shard Management**: An Enterprise Shard Management System supports dynamic scaling of shards (5-128) and validators, with transactional updates and audit logging. Auto hardware detection adjusts `maxShards` based on CPU cores and RAM.
- **Unified AI Model Configuration**: A Quad-Band AI System integrates Gemini 3 Pro, Claude Sonnet 4.5, GPT-4o, and Grok 3 (fallback) for consistent AI usage and automatic fallback.
- **Comprehensive Bilingual Support**: Full Korean and English translation for all Admin Portal and public pages.
- **Standardized UI Components**: Utilizes `MetricCard`, skeleton loading, error boundaries with retry, export functionality, and reusable Admin Components for CRUD operations.
- **Web3 Wallet Integration**: Supports comprehensive transaction flows with various wallets (MetaMask, Rabby, Trust, Coinbase, Ledger), including balance validation, gas estimation, and network switching.
- **Timezone Standardization**: All date/time displays use 'America/New_York' timezone.
- **Production Data Policy**: All public pages and admin dashboards display real mainnet production data from `TBurnEnterpriseNode`.
- **Data & Analytics**: Production-ready admin pages for Business Intelligence, Transaction Analytics, User Analytics, Network Analytics, and Report Generation.
- **Bridge & Cross-chain**: Production-ready admin pages for Bridge statistics, transfers, chain connections, validators, and liquidity.
- **Token & Economics**: Production-ready admin pages for Token Information, Burn Statistics, Economic Metrics, and Treasury Stats.
- **Network Operations**: Production-ready admin pages for Nodes, Validators, Consensus Information, and Network Parameters.
- **AI Training & Compliance Management**: Enterprise-grade admin pages for AI training job management, dataset management, metric visualization, versioning, deployment controls, framework monitoring, KYC/AML, regulatory reporting, incident tracking, and certification management.
- **Cross-Shard Performance Optimizations**: Achieved through 30-second TTL shard caching, batch message insertion, O(1) shard pair selection, and priority queue routing.
- **Production Launch Validation System**: RPC endpoint validation with 13 Zod Schemas and a `withValidation` wrapper applied to 16 required endpoints.
- **Public API & Admin Page Performance Optimization**: Utilizes shared formatters, cache warming via `ProductionDataPoller`, backend caching (30-second TTL), and optimized React Query settings for sub-second response times and efficient data fetching across all dashboards, including network operations, AI management, global app queries, DeFi pages, bridge, operations, user management, governance, developer tools, monitoring, finance, and support.
- **Public App Page React Query Optimization**: All public app pages including wallet-dashboard, ai-orchestration, smart-contracts, and transaction-simulator are optimized with `staleTime` matching `refetchInterval`, `refetchOnMount: true`, and `refetchOnWindowFocus: false` for instant navigation and reduced API calls. TTLs range from 15s (activities) to 60s (slow-changing configs).
- **DeFi Application Pages React Query Optimization**: All 8 DeFi pages (/app/dex, /app/lending, /app/yield-farming, /app/liquid-staking, /app/nft-marketplace, /app/nft-launchpad, /app/gamefi) are optimized with `staleTime` matching `refetchInterval`, `refetchOnMount: false`, and `refetchOnWindowFocus: false`. Dialog-level queries use 15s staleTime for responsive user experience.
- **Network Operations Pages Optimization**: Pages /app/consensus, /app/sharding, /app/cross-shard, and /app/community are optimized with staleTime matching refetchInterval, refetchOnMount: false, refetchOnWindowFocus: false. Consensus uses 5s client polling with 3s server-side WebSocket broadcasts for balanced responsiveness without overloading.
- **Performance-Optimized Polling Intervals**: Server-side polling reduced from 500ms to 2000-3000ms for block_updates, consensus_state, and consensus_rounds to prevent CPU overload while maintaining responsive real-time updates.
- **Zero-Delay Authentication**: Login flow uses optimistic cache updates (`queryClient.setQueryData`) instead of waiting for server roundtrips. After POST /api/auth/login succeeds, the cache is immediately updated and navigation occurs instantly. Background sync happens via fire-and-forget invalidateQueries.
- **Public DeFi Stats API Access**: Dashboard DeFi stats endpoints (DEX, Lending, Staking, Yield, Liquid Staking, NFT, Launchpad, GameFi) are public read-only APIs that don't require authentication. This ensures dashboard data loads immediately without login dependency. Public endpoints include: `/api/staking/stats`, `/api/staking/pools`, `/api/staking/tiers`, `/api/staking/rewards/current`, `/api/staking/rewards/cycles`, `/api/staking/unbonding`, `/api/staking/slashing`, `/api/dex/stats`, `/api/dex/pools`, `/api/lending/stats`, `/api/lending/markets`.
- **Public App Page Rendering**: The `AuthenticatedApp` component renders the full application shell (sidebar, header, pages) regardless of authentication status. This allows unauthenticated users to browse the blockchain explorer and view public DeFi data. The logout button is conditionally shown only for authenticated users. Sensitive operations (staking, trading, wallet actions) still require wallet connection.
- **React Query Cold-Start Data Loading**: Fixed `staleTime: Infinity` + `refetchOnMount: false` preventing initial HTTP requests on empty cache. Now uses `staleTime: 30000` (30s) and `refetchOnMount: true` across all DeFi pages to ensure data loads on component mount.
- **React Query Instant Page Loads**: All 15+ app pages use `placeholderData: keepPreviousData` + `retry: 3` pattern to eliminate loading spinners during refetch and provide resilient data fetching. This ensures users see existing data while new data loads in the background.
- **WebSocket REST Fallback**: WebSocket disconnect triggers REST query invalidation for 12 critical endpoints (/api/network/stats, /api/dex/stats, etc.) to ensure data availability during connection issues.
- **Health and Security Dashboards**: Dynamically calculate health and security scores based on live enterprise node and AI service data.
- **Dashboard WebSocket Resilience**: Dashboard uses WebSocket with exponential backoff reconnection (1s-30s, max 5 attempts, 60s cooldown reset). REST fallback triggers on every reconnect attempt ensuring continuous data loading. `isActive` guard prevents memory leaks on component unmount.
- **Vite HMR in Replit**: HMR is disabled in Replit environments (`hmr: isReplit ? false : { server }`) to prevent WebSocket connection failures from blocking React app mounting. Local development outside Replit retains full HMR functionality. This ensures reliable initial page loads in Replit's dynamic preview environment.
- **HTML Loading Indicator**: Added a static loading spinner in `client/index.html` that displays immediately during JavaScript bundle load, preventing blank white screens and providing instant visual feedback.
- **Stable Text Animation Hook**: The `useRotatingScramble` hook in `Home.tsx` uses `useRef` for index tracking and runs effect only once (empty dependency array) to prevent infinite re-renders.
- **AI Service Fail-Fast Optimization**: `AIServiceManager.makeRequest()` checks for available providers before entering retry loops. If all providers are rate-limited, it throws immediately instead of blocking the event loop. `switchToNextProvider()` returns boolean to signal exhaustion, and the loop breaks immediately when no providers remain. Retry timeouts reduced to 500-2000ms (from 2000-10000ms) to minimize delays.

## 366-Day Stability Architecture

### Event Loop Protection (Server-Side)
1. **Execution Overlap Guards**: The `createTrackedInterval` helper function (server/routes.ts lines 69-110) wraps all 54+ intervals with automatic overlap protection. Each interval is tracked in `intervalExecutionState` Map with `isRunning` flags. The guardedCallback wrapper:
   - Checks `state.isRunning` and skips execution if previous run is still active
   - Logs warnings every 10 skips to track overlap frequency
   - Uses try-finally to ensure `isRunning` is reset even on errors
   ```typescript
   // Built into createTrackedInterval - no manual guards needed
   const guardedCallback = async () => {
     if (state.isRunning) { state.skipCount++; return; }
     state.isRunning = true;
     try { await callback(); } finally { state.isRunning = false; }
   };
   ```

2. **Circuit Breaker Pattern**: ProductionDataPoller implements circuit breaker with:
   - Threshold: 10 consecutive errors → circuit OPEN
   - Half-open test: After 60 seconds, allows single request
   - Auto-close: On successful half-open request
   - Jitter: Random 0-2000ms delay added to polling interval

3. **Subscriber-Aware Scheduling**: All 30+ WebSocket broadcast intervals check `clients.size === 0` before executing, skipping work when no clients are connected.

### Memory Leak Prevention (Client-Side)
1. **WebSocket Reconnection Limits**: Max 5 reconnection attempts with exponential backoff (1s-30s). After 60 seconds of stable connection, attempts counter resets.

2. **Orphan Listener Prevention**: `useWebSocketChannel` hook uses `isActiveRef` guard pattern:
   - Separate cleanup useEffect sets `isActiveRef.current = false` on unmount
   - Message processing checks guard before executing
   - Prevents stale closures from processing messages after navigation

3. **Timer Cleanup**: All timers (reconnect timeout, cooldown reset) properly cleared in useEffect cleanup functions.

### Resilience Patterns
- **REST Fallback**: WebSocket disconnect triggers invalidation of 12 critical query endpoints
- **Graceful Degradation**: When max reconnect attempts reached, system relies on REST polling
- **Component Unmount Guards**: `isActiveRef` pattern prevents reconnection attempts during React cleanup

## Engineering Standards - Preventing Infinite Loops and Render Blocking

### useEffect Best Practices
1. **Never include state setters in dependency arrays that are called inside the effect**
   - BAD: `useEffect(() => { setCount(count + 1) }, [count])` → Infinite loop
   - GOOD: Use `useRef` for mutable values that shouldn't trigger re-renders

2. **Timer-based effects must use refs for index/counter tracking**
   ```typescript
   // GOOD pattern
   const indexRef = useRef(0);
   useEffect(() => {
     const interval = setInterval(() => {
       indexRef.current = (indexRef.current + 1) % items.length;
     }, 3000);
     return () => clearInterval(interval);
   }, []); // Empty dependency array
   ```

3. **WebSocket effects must include `isActive` guard**
   ```typescript
   useEffect(() => {
     let isActive = true;
     const ws = new WebSocket(url);
     ws.onmessage = () => { if (isActive) { /* update */ } };
     return () => { isActive = false; ws.close(); };
   }, []);
   ```

4. **Always clean up timers and subscriptions in return function**

### Code Review Checklist
- [ ] Does the effect have state variables in dependencies that are mutated inside the effect?
- [ ] Are all `setInterval`/`setTimeout` properly cleared in cleanup?
- [ ] Does the effect use `isActive` or `isMounted` guards for async operations?
- [ ] For animation hooks: Is index tracking done via `useRef` not `useState`?

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