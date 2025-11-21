# TBURN Blockchain Mainnet Explorer

## Project Overview
A professional blockchain explorer similar to Solana/Etherscan, built for the TBURN blockchain mainnet. The project features real-time network monitoring, AI orchestration management, validator tracking, smart contract interface, sharding system monitoring, and comprehensive node health dashboards.

**Status**: MVP Complete ✅  
**Last Updated**: November 21, 2025

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Wouter (routing), TanStack Query v5
- **Backend**: Express.js, WebSocket (ws library)
- **Storage**: In-memory (MemStorage) with mock data - ready for cloud migration
- **UI**: Shadcn UI, Tailwind CSS, Radix UI primitives
- **AI Integrations**: Anthropic Claude 4.5 Sonnet, OpenAI GPT-5 (via Replit AI Integrations)
- **Data Visualization**: Recharts

## Project Structure
```
├── client/src/
│   ├── pages/           # All application pages
│   │   ├── dashboard.tsx        # Main explorer dashboard
│   │   ├── blocks.tsx           # Block explorer
│   │   ├── transactions.tsx     # Transaction explorer
│   │   ├── validators.tsx       # Validator management
│   │   ├── ai-orchestration.tsx # AI models dashboard
│   │   ├── sharding.tsx         # Sharding monitoring
│   │   ├── smart-contracts.tsx  # Smart contracts interface
│   │   └── node-health.tsx      # Node health dashboard
│   ├── components/
│   │   ├── ui/          # Shadcn UI components
│   │   ├── app-sidebar.tsx      # Navigation sidebar
│   │   ├── stat-card.tsx        # Reusable stat card
│   │   └── live-indicator.tsx   # Live status indicator
│   └── lib/
│       ├── format.ts    # Formatting utilities (addresses, tokens, time)
│       └── queryClient.ts       # TanStack Query configuration
├── server/
│   ├── routes.ts        # REST API + WebSocket server
│   ├── storage.ts       # IStorage interface + MemStorage implementation
│   └── app.ts           # Express app configuration
└── shared/
    └── schema.ts        # TypeScript types & Drizzle schemas
```

## Features Implemented

### 1. Dashboard (/)
- Real-time network statistics (TPS, block height, active validators)
- Recent blocks table with live updates
- Recent transactions table
- Network overview charts

### 2. Blocks (/blocks)
- Comprehensive block explorer
- Block details: number, hash, timestamp, transactions count, validator
- Gas usage, size, shard ID
- Search and filter functionality

### 3. Transactions (/transactions)
- Transaction history with status badges (success/failed/pending)
- Transaction details: hash, from/to addresses, value, gas
- Smart contract creation tracking
- Shard-aware transaction routing

### 4. Validators (/validators)
- Active/inactive/jailed validator tracking
- Validator statistics: stake, commission, APY, uptime
- Delegator counts and voting power
- Performance metrics

### 5. AI Orchestration (/ai-orchestration)
- AI model monitoring (GPT-5, Claude Sonnet 4.5, Llama 3)
- Request/success/failure counts
- Average response times
- Cost tracking and cache hit rates

### 6. Sharding (/sharding)
- Multi-shard monitoring (5 shards: Alpha, Beta, Gamma, Delta, Epsilon)
- Per-shard TPS, block height, load percentage
- Validator distribution across shards
- Transaction routing visualization

### 7. Smart Contracts (/smart-contracts)
- Deployed contracts tracking
- Contract verification status
- Transaction counts and balances
- Contract interaction interface

### 8. Node Health (/node-health)
- System metrics: CPU, memory, disk usage
- Network metrics: RPC/WebSocket connections, peer count
- Uptime tracking
- Sync status monitoring

### 9. Transaction Simulator (/simulator) ✅ NEW
- Interactive transaction creation and broadcasting
- Form validation: address format (0x + 40 hex), gas limits, numeric values
- Three preset transaction types:
  - Simple Transfer (1.5 TBURN, gas 21000)
  - Contract Creation (empty "to", gas 500000, includes input data)
  - Large Transfer (100 TBURN, gas 50000, random shard)
- Random transaction generator
- Real-time transaction preview with estimated fees
- Support for contract creation (empty "to" address)
- Server-side Zod validation
- Automatic wei/Gwei conversion for token amounts and gas prices

## API Endpoints

### Network Stats
- `GET /api/network/stats` - Current network statistics

### Blocks
- `GET /api/blocks` - All blocks
- `GET /api/blocks/recent?limit=10` - Recent blocks
- `GET /api/blocks/:blockNumber` - Block by number

### Transactions
- `GET /api/transactions` - All transactions
- `GET /api/transactions/recent?limit=10` - Recent transactions
- `GET /api/transactions/:hash` - Transaction by hash

### Validators
- `GET /api/validators` - All validators
- `GET /api/validators/:address` - Validator by address

### Smart Contracts
- `GET /api/contracts` - All contracts
- `GET /api/contracts/:address` - Contract by address

### Transaction Simulator
- `POST /api/transactions` - Create a new transaction (Zod validated)

### AI Models
- `GET /api/ai/models` - All AI models
- `GET /api/ai/models/:name` - AI model by name

### Sharding
- `GET /api/shards` - All shards
- `GET /api/shards/:id` - Shard by ID

### Node Health
- `GET /api/node/health` - Node health metrics

## WebSocket Real-Time Updates

**Endpoint**: `ws://[host]:5000/ws`

### Message Types
1. **network_stats_update** - Broadcast every 5 seconds
   - Current TPS, block height, validator counts
   
2. **new_block** - Broadcast every 2 seconds
   - New block information

## Data Formats & Important Notes

### BigInt Handling
- All BigInt values are automatically serialized to strings in JSON responses
- `BigInt.prototype.toJSON` is extended in `server/app.ts`
- Frontend formatters handle both string and number inputs safely

### Token Amounts
- **Storage**: Wei-unit strings (18 decimals) - e.g., "1000000000000000000" for 1 TBURN
- **Display**: formatTokenAmount() with automatic decimal conversion
- **Validator Stakes**: TBURN-unit strings - e.g., "1234567" for 1.23M TBURN

### Timestamps
- Unix timestamps in seconds (BigInt)
- Converted to milliseconds for JavaScript Date objects

### Gas Prices
- Stored as wei-unit strings (9 decimals for Gwei)

## Design System

### Colors
Following a professional, data-centric blockchain explorer aesthetic:
- **Typography**: Inter (UI), IBM Plex Mono (code/addresses)
- **Primary**: Blue tones for interactive elements
- **Accent**: Cyan for highlights and live indicators
- **Success**: Green for successful transactions
- **Destructive**: Red for failed transactions/errors
- **Dark Mode**: Full support via ThemeProvider

### Components
- Shadcn UI for all base components
- Custom hover/active states via `hover-elevate` and `active-elevate-2` utilities
- Consistent spacing and border radius (rounded-md)

## Known Issues & Limitations

### Current Limitations
1. **Mock Data**: All data is currently stored in-memory
   - Ready for cloud migration with real blockchain backend
   - No persistence across server restarts

2. **WebSocket Security**: No authentication or rate limiting
   - Suitable for development/testing
   - Needs hardening for production deployment

3. **Data Validation**: Limited input validation on API endpoints
   - Assumes well-formed data from blockchain backend

### Vite HMR WebSocket Warning
- Browser console shows Vite HMR WebSocket errors in Replit environment
- This is a Replit/Vite internal issue and does not affect application functionality
- Application WebSocket (`/ws`) works correctly

## Future Enhancements

### Immediate Priorities (for Production)
1. Connect to real TBURN blockchain backend
2. Implement WebSocket authentication & rate limiting
3. Add comprehensive error handling
4. Implement data caching strategies
5. Add transaction search by hash/address
6. Block detail pages with full transaction list

### Phase 2
1. Advanced analytics and charts
2. Historical data tracking
3. Smart contract source code viewer
4. Token transfer tracking
5. Validator delegation interface
6. Network governance interface

### Phase 3
1. Mobile responsive design optimization
2. Progressive Web App (PWA) support
3. Multi-language support
4. Advanced filtering and search
5. Export data functionality
6. Notification system for events

## Cloud Migration Checklist

When migrating to AWS/GCP/Azure:

### Backend
- [ ] Replace MemStorage with PostgreSQL/MongoDB
- [ ] Implement Redis for caching
- [ ] Set up WebSocket authentication (JWT)
- [ ] Add rate limiting (Redis-based)
- [ ] Configure CORS properly
- [ ] Set up monitoring (CloudWatch/Stackdriver)
- [ ] Implement proper logging

### Infrastructure
- [ ] Container setup (Docker)
- [ ] Kubernetes configuration (optional)
- [ ] Load balancer setup
- [ ] Auto-scaling policies
- [ ] Database backups
- [ ] CDN for static assets

### Security
- [ ] HTTPS/TLS certificates
- [ ] API key management
- [ ] DDoS protection
- [ ] Security headers
- [ ] Input sanitization
- [ ] SQL injection prevention

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (frontend + backend)
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Environment Variables

Currently using Replit environment:
- `PORT` - Server port (default: 5000)
- `SESSION_SECRET` - Session secret (auto-configured)
- AI integration keys managed by Replit AI Integrations

For production deployment, configure:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `BLOCKCHAIN_RPC_URL` - TBURN blockchain RPC endpoint
- `BLOCKCHAIN_WS_URL` - TBURN blockchain WebSocket endpoint
- `JWT_SECRET` - JWT signing secret
- Additional API keys as needed

## Testing

### Manual Testing Checklist
- [x] Dashboard loads and displays network stats
- [x] Blocks page shows block list
- [x] Transactions page shows transaction list
- [x] Validators page shows validator stats
- [x] AI Orchestration page shows model metrics
- [x] Sharding page shows shard information
- [x] Smart Contracts page shows contract list
- [x] Node Health page shows system metrics
- [x] Sidebar navigation works correctly
- [x] Dark mode toggle functions
- [x] All API endpoints return data
- [x] No runtime errors in browser console (except Vite HMR warning)

### E2E Testing
Automated end-to-end tests completed successfully using Playwright:
- All pages load without errors
- Navigation between pages works
- API responses are correct
- UI elements display expected data

## Recent Changes (November 21, 2025)

### New Features
1. ✅ **Transaction Simulator** - Complete implementation with validation and presets
   - Address regex validation (0x + 40 hex characters)
   - Gas limit and numeric input validation
   - Server-side Zod schema validation
   - Contract creation support (empty "to" field allowed)
   - Three preset transaction types
   - Real-time transaction preview

### Fixed Issues  
1. ✅ BigInt JSON serialization - Added toJSON method to BigInt.prototype
2. ✅ Token amount formatting - Fixed validators stake display to use formatNumber
3. ✅ Scientific notation in wei values - Use BigInt for large number generation
4. ✅ Safe formatTokenAmount - Added fallback handling for non-wei values
5. ✅ **Type consistency** - Fixed bigint mode: "number" to use regular numbers throughout
6. ✅ **Mock data BigInt bug** - Removed all BigInt literals from mock data generation
7. ✅ **Transaction sorting crash** - Fixed 500 error when fetching transactions after creation

### Optimizations
1. TanStack Query v5 for efficient data fetching
2. Skeleton loading states for better UX
3. Responsive layouts with Tailwind
4. WebSocket connection for real-time updates
5. Consistent data types across frontend and backend

## Contact & Support

For questions or issues:
- Check the code comments for implementation details
- Review shared/schema.ts for data structures
- See design_guidelines.md for UI/UX standards

---

**Note**: This is a development version running on Replit. For production deployment, follow the Cloud Migration Checklist above.
