# TBURN Blockchain Explorer - System Architecture

## Overview
The TBURN Blockchain Explorer is a production-grade, enterprise-level blockchain monitoring platform featuring real-time network analytics, AI orchestration management, and comprehensive developer tools.

---

## Technology Stack

### Frontend
- **React 18**: UI framework with hooks and concurrent features
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Wouter**: Lightweight routing (4KB)
- **TanStack Query v5**: Server state management
- **Shadcn UI**: Component library
- **Tailwind CSS**: Utility-first styling
- **Recharts**: Data visualization
- **Monaco Editor**: Smart contract IDE

### Backend
- **Node.js 20**: Runtime environment
- **Express.js**: Web framework
- **WebSocket (ws)**: Real-time communication
- **Drizzle ORM**: Type-safe database access
- **Zod**: Schema validation
- **Express Session**: Session management

### Database
- **PostgreSQL 16**: Primary database (Neon Serverless)
- **8 Core Tables**: blocks, transactions, accounts, validators, smart_contracts, ai_models, shards, network_stats
- **Indexing**: Optimized for high-throughput queries

### Infrastructure
- **Multi-Cloud**: AWS, GCP, Azure support
- **CDN**: CloudFlare / CloudFront
- **Monitoring**: Prometheus + Grafana
- **CI/CD**: GitHub Actions

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │Dashboard │  │  Blocks  │  │   TXs    │  │Validators│  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │    AI    │  │ Sharding │  │Contracts │  │  Health  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Express)                      │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐ │
│  │  REST API      │  │  WebSocket     │  │ Auth Session │ │
│  │  /api/*        │  │  /ws           │  │              │ │
│  └────────────────┘  └────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                 Business Logic Layer                        │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐ │
│  │Storage Service │  │WebSocket Server│  │Broadcast Mgr │ │
│  │(DbStorage)     │  │(Real-time)     │  │(Events)      │ │
│  └────────────────┘  └────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer (Drizzle ORM)                  │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌─────┐ │
│  │ Blocks │  │  TXs   │  │Accounts│  │Validate│  │Shards│ │
│  └────────┘  └────────┘  └────────┘  └────────┘  └─────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Database (Neon)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Frontend Architecture

```
client/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # Shadcn base components
│   │   ├── app-sidebar.tsx
│   │   ├── theme-provider.tsx
│   │   ├── DemoBanner.tsx
│   │   └── SmartContractEditor.tsx
│   ├── pages/             # Route pages
│   │   ├── dashboard.tsx
│   │   ├── blocks.tsx
│   │   ├── transactions.tsx
│   │   ├── validators.tsx
│   │   ├── ai-orchestration.tsx
│   │   ├── sharding.tsx
│   │   ├── smart-contracts.tsx
│   │   ├── node-health.tsx
│   │   ├── performance-metrics.tsx
│   │   ├── consensus.tsx
│   │   └── transaction-simulator.tsx
│   ├── lib/               # Utilities
│   │   ├── queryClient.ts # TanStack Query config
│   │   ├── format.ts      # Formatting helpers
│   │   └── utils.ts
│   ├── hooks/             # Custom hooks
│   └── App.tsx            # Main app component
```

### Backend Architecture

```
server/
├── routes.ts              # API routes
├── storage.ts             # Storage abstraction
├── websocket.ts           # WebSocket server
├── index.ts               # Entry point
└── vite.ts                # Vite SSR integration
```

### Shared Schema

```
shared/
└── schema.ts              # Drizzle schemas & Zod validators
```

---

## Database Schema

### Tables

**1. network_stats**
- id, tps, blockHeight, activeValidators, totalTransactions
- avgBlockTime, networkHashrate, lastUpdated

**2. blocks**
- id, hash, number, timestamp, validator
- transactionCount, gasUsed, gasLimit, reward

**3. transactions**
- id, hash, from, to, value
- gasPrice, gasUsed, status, blockNumber, timestamp

**4. accounts**
- id, address, balance, transactionCount
- contractCode, lastActive

**5. validators**
- id, address, name, stake, commission
- apy, uptime, blocksProduced, isActive

**6. smart_contracts**
- id, address, name, creator, balance
- transactionCount, verified, deployedAt

**7. ai_models**
- id, name, role, requestCount
- avgResponseTime, successRate, cost
- cacheHitRate, lastUsed

**8. shards**
- id, name, tps, blockHeight
- load, validators, isActive

---

## Key Features

### 1. Real-Time Updates (WebSocket)
```typescript
// Server: broadcast network stats every 3s
setInterval(() => {
  broadcast('stats', {
    tps: getCurrentTPS(),
    blockHeight: getBlockHeight(),
    activeValidators: getActiveValidators()
  });
}, 3000);

// Client: subscribe to updates
useQuery({
  queryKey: ["/api/stats"],
  refetchInterval: 5000 // Fallback polling
});
```

### 2. Session-Based Authentication
```typescript
// Login endpoint
app.post("/api/auth/login", (req, res) => {
  if (req.body.password === PASSWORD) {
    req.session.authenticated = true;
    res.json({ success: true });
  }
});

// Protected routes
function requireAuth(req, res, next) {
  if (!req.session?.authenticated) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}
```

### 3. Data Persistence (PostgreSQL)
```typescript
// Storage interface
interface IStorage {
  getNetworkStats(): Promise<NetworkStats>;
  getBlocks(limit: number): Promise<Block[]>;
  createTransaction(tx: InsertTransaction): Promise<Transaction>;
}

// Database implementation
class DbStorage implements IStorage {
  async getNetworkStats() {
    return db.select().from(networkStats).orderBy(desc(networkStats.id)).limit(1);
  }
}
```

### 4. Transaction Simulator
```typescript
// POST /api/simulator/broadcast
app.post("/api/simulator/broadcast", requireAuth, async (req, res) => {
  const validated = broadcastTransactionSchema.parse(req.body);
  const tx = await storage.createTransaction({
    hash: generateHash(),
    from: validated.from,
    to: validated.to,
    value: validated.amount,
    status: "success"
  });
  broadcast('transaction', tx);
  res.json({ success: true, transaction: tx });
});
```

### 5. AI Orchestration Dashboard
```typescript
// Triple-Band AI System
interface AIModel {
  name: "GPT-5" | "Claude Sonnet 4.5" | "Llama-3.1-70B";
  role: "Strategic" | "Tactical" | "Operational";
  requestCount: number;
  avgResponseTime: number;
  cacheHitRate: number; // Basis points (0-10000)
}

// Display cache hit rate as percentage
const cacheHitPercentage = (model.cacheHitRate / 100).toFixed(1) + "%";
```

### 6. Smart Contract IDE (Monaco Editor)
```typescript
// 6 pre-built templates
const TEMPLATES = {
  erc20: "ERC-20 Token contract",
  erc721: "NFT contract",
  staking: "Staking with rewards",
  dao: "DAO governance",
  marketplace: "NFT marketplace",
  multisig: "Multi-signature wallet"
};

// Compile & Deploy simulation
const handleCompile = async () => {
  const result = {
    gasEstimate: Math.random() * 500000 + 1000000,
    contractSize: (Math.random() * 5 + 1).toFixed(1)
  };
  setCompileResult(result);
};
```

---

## Data Flow

### Request Flow (REST API)
```
User → Frontend (React)
  → apiRequest (TanStack Query)
    → Express Route Handler
      → Storage Service (DbStorage)
        → Drizzle ORM
          → PostgreSQL
            → Response
              → JSON Serialization (BigInt → String)
                → Frontend Update
```

### Real-Time Flow (WebSocket)
```
Server Event → WebSocket Broadcast
  → All Connected Clients
    → Frontend WebSocket Handler
      → TanStack Query Invalidation
        → Component Re-render
```

---

## Performance Optimizations

### 1. Database Indexing
```sql
CREATE INDEX idx_blocks_number ON blocks(number);
CREATE INDEX idx_transactions_hash ON transactions(hash);
CREATE INDEX idx_validators_address ON validators(address);
```

### 2. Query Optimization
```typescript
// Limit results
const blocks = await db.select()
  .from(blocks)
  .orderBy(desc(blocks.number))
  .limit(50); // Only fetch what's needed

// Use specific columns
const stats = await db.select({
  tps: networkStats.tps,
  blockHeight: networkStats.blockHeight
}).from(networkStats);
```

### 3. Client-Side Caching
```typescript
// TanStack Query configuration
queryClient.setQueryDefaults(['/api/stats'], {
  staleTime: 5000,     // Consider fresh for 5s
  cacheTime: 300000,   // Keep in cache for 5min
  refetchInterval: 5000 // Refetch every 5s
});
```

### 4. WebSocket Throttling
```typescript
// Broadcast at controlled intervals
setInterval(() => {
  broadcast('stats', getCurrentStats());
}, 3000); // Every 3 seconds

setInterval(() => {
  broadcast('block', getLatestBlock());
}, 100); // Simulated ~98ms block time
```

---

## Security Architecture

### 1. Authentication Layer
```typescript
// Session-based auth (24-hour duration)
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: NODE_ENV === 'production'
  }
}));
```

### 2. WebSocket Security
```typescript
// Verify session cookie
wss.on('connection', (ws, req) => {
  if (!req.headers.cookie?.includes('connect.sid')) {
    ws.close();
    return;
  }
  clients.add(ws);
});
```

### 3. Input Validation
```typescript
// Zod schema validation
const broadcastTransactionSchema = z.object({
  from: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  to: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  amount: z.string(),
  gasLimit: z.string()
});
```

### 4. Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000           // 1000 requests per minute
});

app.use('/api/', limiter);
```

---

## Scalability Considerations

### Horizontal Scaling
- **Stateless API**: No in-memory state (use Redis for sessions)
- **Load Balancer**: Distribute across multiple instances
- **Database Read Replicas**: Separate read/write workloads

### Vertical Scaling
- **Database**: Scale PostgreSQL (CPU, memory, storage)
- **Application**: Increase container resources

### Caching Strategy
- **CDN**: Cache static assets (JS, CSS, images)
- **Redis**: Cache frequently accessed data (network stats)
- **Browser Cache**: Leverage HTTP caching headers

---

## Monitoring & Observability

### Metrics
- **Performance**: TPS, block time, latency
- **System**: CPU, memory, disk, network
- **Application**: Request rate, error rate, response time
- **Database**: Query time, connection pool, slow queries

### Logging
- **Access Logs**: HTTP requests (nginx/Apache)
- **Application Logs**: Errors, warnings, info (Winston/Pino)
- **Database Logs**: Slow queries, connection errors

### Alerts
- **Uptime**: Network downtime > 1 minute
- **Performance**: TPS < 300K, block time > 150ms
- **System**: CPU > 80%, memory > 90%
- **Errors**: Error rate > 1%

---

## Testing Strategy

### Unit Tests
- **Components**: React component testing (Vitest)
- **Utilities**: Format functions, helpers
- **Storage**: Mock database operations

### Integration Tests
- **API Routes**: Express route handlers
- **Database**: Drizzle ORM queries
- **WebSocket**: Real-time communication

### End-to-End Tests
- **Playwright**: User workflows
- **Scenarios**: Login, browse blocks, create transaction, deploy contract

---

## Future Enhancements

### Planned Features
1. **Advanced Analytics**: Historical charts, trend analysis
2. **GraphQL API**: Flexible data querying
3. **Multi-Chain Support**: Cross-chain explorer
4. **Advanced Search**: Full-text search, filters
5. **Notifications**: Email/SMS alerts for events
6. **API Keys**: Developer API access tokens
7. **Export**: CSV/JSON data export
8. **Mobile App**: iOS/Android native apps

### Technical Debt
1. **Testing**: Increase test coverage to 80%+
2. **Documentation**: API docs, tutorials
3. **Performance**: Optimize database queries
4. **Security**: Penetration testing, audit

---

## Contributing

### Development Workflow
1. Fork repository
2. Create feature branch
3. Write tests
4. Submit pull request
5. Code review
6. Merge to main

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb style guide
- **Prettier**: Code formatting
- **Commit**: Conventional commits

---

## References

- **Drizzle ORM**: https://orm.drizzle.team/
- **TanStack Query**: https://tanstack.com/query/latest
- **Shadcn UI**: https://ui.shadcn.com/
- **Neon PostgreSQL**: https://neon.tech/
- **Recharts**: https://recharts.org/

---

## Support

- **Documentation**: https://docs.tburn.io
- **Discord**: https://discord.gg/tburn
- **GitHub**: https://github.com/tburn/explorer
- **Email**: dev@tburn.io
