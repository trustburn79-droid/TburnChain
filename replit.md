# TBURN Blockchain Mainnet Explorer

## Overview
The TBURN Blockchain Mainnet Explorer is a professional-grade tool designed to provide comprehensive insights into the TBURN blockchain. Similar to explorers like Solana or Etherscan, it offers real-time network monitoring, AI orchestration management, validator tracking, a smart contract interface, sharding system monitoring, and detailed node health dashboards. The project aims to deliver a robust and user-friendly platform for observing and interacting with the TBURN mainnet, targeting a broad audience from developers to blockchain enthusiasts.

## User Preferences
I prefer simple language and detailed explanations. I want iterative development with clear communication on progress. Ask before making major changes to the codebase. Ensure all new features have comprehensive test coverage. Do not make changes to files within the `shared/` directory without explicit approval.

## System Architecture

### UI/UX Decisions
The explorer adopts a professional, data-centric aesthetic with a focus on readability and clear presentation of complex blockchain data.
- **Typography**: Inter for UI elements and IBM Plex Mono for code, addresses, and hashes.
- **Color Scheme**: Blue tones for primary interactive elements, cyan for highlights, green for success indicators, and red for errors/failed transactions. Full dark mode support is implemented.
- **Components**: Utilizes Shadcn UI for base components, enhanced with custom hover/active states (`hover-elevate`, `active-elevate-2`). Consistent spacing and `rounded-md` border radii are applied throughout.
- **Data Visualization**: Recharts is used for displaying network overview charts and other statistical graphs.

### Technical Implementations
- **Frontend**: Built with React 18, TypeScript, Vite, Wouter for routing, and TanStack Query v5 for data fetching and state management.
- **Backend**: Implemented using Express.js for REST APIs and `ws` library for WebSocket real-time communication.
- **Database**: PostgreSQL (Neon Serverless) is used with Drizzle ORM for schema definition and interaction. DbStorage provides an abstraction layer over PostgreSQL.
- **Real-time Updates**: WebSocket connections provide live updates for network statistics and new blocks.
- **Data Handling**: BigInt values are serialized to strings for JSON responses. Token amounts are stored in Wei-unit strings and formatted for display. Timestamps are Unix seconds.
- **Transaction Simulator**: Features interactive transaction creation, broadcasting, form validation (address format, gas limits), and server-side Zod validation.

### Feature Specifications
- **Dashboard**: Real-time network stats (TPS, block height, validators), recent blocks, transactions, and network charts.
- **Blocks & Transactions**: Comprehensive explorers with detailed views, search, and filter capabilities.
- **Validators**: Tracking of active/inactive validators, stake, commission, APY, uptime, and performance metrics.
- **AI Orchestration**: Monitoring of AI models (GPT-5, Claude Sonnet 4.5) with request counts, response times, costs, and cache hit rates.
- **Sharding**: Multi-shard monitoring (Alpha, Beta, Gamma, Delta, Epsilon) with per-shard TPS, block height, load, and validator distribution.
- **Smart Contracts**: Tracking deployed contracts, verification status, transaction counts, balances, and an interaction interface.
- **Node Health**: Display of system metrics (CPU, memory, disk), network metrics (RPC/WebSocket connections), uptime, and sync status.

### System Design Choices
- **Monorepo Structure**: `client/` for frontend, `server/` for backend, and `shared/` for common types and schemas.
- **ORM**: Drizzle ORM is used for type-safe database interactions and schema management.
- **Data Persistence**: All critical data is persisted in the PostgreSQL database.
- **Authentication**: Session-based authentication protects API routes and WebSocket connections.

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

## Authentication & Security

### Password Protection
- **Password**: `tburn7979` (configurable in `server/routes.ts`)
- **Login Page**: Presented on first access to the site
- **Session Duration**: 24 hours with automatic revalidation every 60 seconds
- **Protected Routes**: All `/api/*` endpoints except `/api/auth/*`
- **WebSocket Protection**: Requires session cookie for real-time updates

### Development vs Production
**Current Implementation** (Development):
- In-memory session store (lost on server restart)
- Basic WebSocket authentication (checks cookie presence only)
- Suitable for development and testing environments

**Production Requirements**:
1. **Session Store**: Use persistent store (Redis, PostgreSQL with `connect-pg-simple`)
2. **SESSION_SECRET**: Set strong secret via environment variable
3. **Cookie Settings**: Enable secure flags (`secure: true`, `httpOnly: true`, `sameSite: 'strict'`)
4. **WebSocket Auth**: Implement proper session verification:
   - Parse and verify signed session cookies
   - Load session from persistent store
   - Validate `session.authenticated === true`
5. **Rate Limiting**: Add authentication attempt limits
6. **HTTPS**: Deploy with TLS/SSL certificates

See `server/routes.ts` comments for detailed security implementation guidance.

## Known Limitations

### Security (Development Only)
- WebSocket authentication only checks cookie presence, not validity
- Session store is in-memory (not persistent across restarts)
- No rate limiting on authentication attempts
- **Action Required**: Implement production-grade security before deployment

### Vite HMR WebSocket Warning
- Browser console shows Vite HMR WebSocket errors in Replit environment
- This is a Replit/Vite internal issue and does not affect application functionality
- Application WebSocket (`/ws`) works correctly

## Recent Changes (November 21, 2025)

### New Features
1. ✅ **PostgreSQL Database Integration**
   - Neon Serverless PostgreSQL with Drizzle ORM
   - 8 tables: blocks, transactions, accounts, validators, smart_contracts, ai_models, shards, network_stats
   - Database seeding with 100 transactions, 50 blocks, 10 validators
   - Data persistence across server restarts

2. ✅ **Password Protection & Authentication**
   - Session-based authentication with `express-session`
   - Login page with form validation
   - All API and WebSocket routes protected
   - Auto-revalidation every 60 seconds + on window focus

3. ✅ **Transaction Simulator**
   - Interactive transaction creation with validation
   - Address regex validation (0x + 40 hex characters)
   - Server-side Zod schema validation
   - Three preset transaction types
   - Transactions saved to PostgreSQL database