/**
 * TBURN Mainnet Express Application v4.0
 * Enterprise-grade production configuration
 * 
 * CRITICAL FIXES:
 * 1. /rpc?_t=timestamp causing MemoryStore overflow → FIXED
 * 2. Middleware order: pre-session filter → cookie → session bypass → session
 * 3. Set-Cookie header leaking → BLOCKED
 * 4. Production detection unified with session-bypass.ts
 * 5. Disaster Recovery integrated
 * 
 * MIDDLEWARE ORDER (CRITICAL):
 * 1. Trust proxy
 * 2. Security (helmet, cors)
 * 3. Compression
 * 4. Body parsers
 * 5. Cookie parser
 * 6. ★ PRE-SESSION FILTER ★ (blocks RPC/stateless BEFORE session)
 * 7. Session bypass middleware (wraps session)
 * 8. Static files
 * 9. Routes
 * 10. Error handlers
 * 
 * @version 4.0.0
 * @date 2026-01-06
 */

import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';

import { 
  createSessionBypassMiddleware,
  createPreSessionMiddleware,
  setSessionStore,
  sessionHealthCheck,
  ENVIRONMENT,
  getSessionMetrics,
  disasterRecovery,
  CONFIG,
} from './session-bypass-v4';

// ============================================================================
// App Initialization
// ============================================================================

const app = express();

// Trust proxy (MUST be first for correct IP detection)
app.set('trust proxy', 1);

console.log('╔════════════════════════════════════════════════════════════════════╗');
console.log('║          TBURN MAINNET EXPRESS APPLICATION v4.0                     ║');
console.log('╠════════════════════════════════════════════════════════════════════╣');
console.log(`║  Environment: ${ENVIRONMENT.nodeEnv.padEnd(52)}║`);
console.log(`║  Production:  ${ENVIRONMENT.isProduction ? 'YES' : 'NO '} (detected via ${ENVIRONMENT.detectionMethod})${' '.repeat(35 - ENVIRONMENT.detectionMethod.length)}║`);
console.log(`║  Replit:      ${ENVIRONMENT.isReplit ? 'YES' : 'NO '}${' '.repeat(50)}║`);
console.log(`║  Kubernetes:  ${ENVIRONMENT.isKubernetes ? 'YES' : 'NO '}${' '.repeat(50)}║`);
console.log('╚════════════════════════════════════════════════════════════════════╝');

// ============================================================================
// Step 1: Security Headers (Helmet)
// ============================================================================

app.use(helmet({
  contentSecurityPolicy: ENVIRONMENT.isProduction ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));

// ============================================================================
// Step 2: CORS
// ============================================================================

app.use(cors({
  origin: ENVIRONMENT.isProduction 
    ? process.env.ALLOWED_ORIGINS?.split(',') || true
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// ============================================================================
// Step 3: Compression
// ============================================================================

app.use(compression({
  filter: (req, res) => {
    // Don't compress RPC responses (they're usually small)
    if (req.url?.includes('/rpc')) return false;
    return compression.filter(req, res);
  },
}));

// ============================================================================
// Step 4: Body Parsers (BEFORE session)
// ============================================================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================================
// Step 5: Cookie Parser (BEFORE session - needed for decision making)
// ============================================================================

app.use(cookieParser(process.env.COOKIE_SECRET || 'tburn-cookie-secret'));

// ============================================================================
// Step 6: ★ PRE-SESSION FILTER ★ (CRITICAL - MUST be BEFORE session)
// This blocks RPC and stateless requests BEFORE session middleware even loads
// ============================================================================

/**
 * Fast-path filter for RPC and stateless requests
 * This prevents express-session from even being invoked for these paths
 */
const RPC_PATHS = ['/rpc', '/jsonrpc', '/json-rpc', '/eth', '/ws', '/wss'];
const HEALTH_PATHS = ['/health', '/healthz', '/readyz', '/livez', '/ping', '/status', '/metrics'];
const CACHE_BUST_REGEX = /[?&](_t|_|t|timestamp|ts|cachebust|cb|nocache|v|ver|nonce|rand)=/i;
const TIMESTAMP_REGEX = /[?&][^=]+=\d{10,13}(&|$)/;

const preSessionFilter: RequestHandler = (req, res, next) => {
  const url = req.url || '';
  const path = url.split('?')[0].toLowerCase();
  
  // Check if this is a stateless request
  const isRPC = RPC_PATHS.some(p => path.startsWith(p));
  const isHealth = HEALTH_PATHS.some(p => path.startsWith(p) || path.startsWith(`/api${p}`));
  const hasCacheBust = CACHE_BUST_REGEX.test(url) || TIMESTAMP_REGEX.test(url);
  const isStatic = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|json|map)$/i.test(path);
  
  if (isRPC || isHealth || hasCacheBust || isStatic) {
    // Mark request to skip session
    (req as any)._skipSession = true;
    (req as any).session = null;
    (req as any).sessionID = null;
    
    // Block Set-Cookie header for these requests
    const originalSetHeader = res.setHeader.bind(res);
    res.setHeader = function(name: string, value: any) {
      if (name.toLowerCase() === 'set-cookie') {
        // Filter out connect.sid cookies
        if (Array.isArray(value)) {
          value = value.filter((v: string) => !v.includes('connect.sid'));
          if (value.length === 0) return res;
        } else if (typeof value === 'string' && value.includes('connect.sid')) {
          return res;
        }
      }
      return originalSetHeader(name, value);
    };
  }
  
  next();
};

app.use(preSessionFilter);

// Also add the more comprehensive pre-session middleware
app.use(createPreSessionMiddleware());

// ============================================================================
// Step 6.5: ★ STATIC FILES BEFORE SESSION ★ (CRITICAL for chunk loading)
// Serve static files BEFORE any session logic to prevent chunk loading failures
// ============================================================================

/**
 * Vite/Webpack chunk files MUST be served without session overhead
 * Pattern: /assets/ScanRoutes-CsSDnY9W.js
 */
const staticFileOptions = {
  maxAge: ENVIRONMENT.isProduction ? '1y' : 0,
  etag: true,
  lastModified: true,
  index: false,
  immutable: ENVIRONMENT.isProduction,  // Cache-Control: immutable for hashed files
  setHeaders: (res: Response, path: string) => {
    // Ensure no session cookie for static files
    res.removeHeader('Set-Cookie');
    
    // Strong caching for hashed files (contains hash like -CsSDnY9W)
    if (/-[a-zA-Z0-9]{8,}\.(js|css|woff2?|ttf|eot)$/.test(path)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
    
    // CORS for fonts
    if (/\.(woff2?|ttf|eot|otf)$/.test(path)) {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  },
};

// Serve /assets BEFORE session (Vite puts chunks here)
app.use('/assets', express.static('public/assets', staticFileOptions));
app.use('/assets', express.static('dist/assets', staticFileOptions));

// Also check dist/client/assets for SSR builds
app.use('/assets', express.static('dist/client/assets', staticFileOptions));

// Fallback static paths
app.use('/static', express.static('public/static', staticFileOptions));
app.use('/dist', express.static('dist', staticFileOptions));
app.use('/public', express.static('public', staticFileOptions));

// ============================================================================
// Step 7: Session Store Setup
// ============================================================================

let sessionStore: session.Store;

// Check for Redis (STRONGLY recommended for production)
if (process.env.REDIS_URL) {
  try {
    const RedisStore = require('connect-redis').default;
    const { createClient } = require('redis');
    
    const redisClient = createClient({ 
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries: number) => {
          if (retries > 10) {
            console.error('[APP] Redis connection failed after 10 retries');
            return new Error('Redis connection failed');
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });
    
    redisClient.on('error', (err: Error) => {
      console.error('[APP] Redis Client Error:', err.message);
    });
    
    redisClient.on('connect', () => {
      console.log('[APP] ✓ Redis connected successfully');
    });
    
    redisClient.connect().catch((err: Error) => {
      console.error('[APP] Redis initial connection failed:', err.message);
    });
    
    sessionStore = new RedisStore({ 
      client: redisClient,
      prefix: 'tburn:sess:',
      ttl: 86400,  // 24 hours
    });
    
    console.log('[APP] ✓ Using Redis session store (production ready)');
  } catch (error) {
    console.error('[APP] Redis setup failed, falling back to MemoryStore:', error);
    const memoryStore = new session.MemoryStore();
    sessionStore = memoryStore;
    setSessionStore(memoryStore);
  }
} else {
  // MemoryStore fallback (NOT recommended for production)
  const memoryStore = new session.MemoryStore();
  sessionStore = memoryStore;
  setSessionStore(memoryStore);
  
  if (ENVIRONMENT.isProduction) {
    console.warn('╔════════════════════════════════════════════════════════════════════╗');
    console.warn('║  ⚠️  WARNING: Using MemoryStore in PRODUCTION!                      ║');
    console.warn('║  This WILL cause memory issues and server crashes.                  ║');
    console.warn('║  Session bypass is CRITICAL for stability.                          ║');
    console.warn('║  Set REDIS_URL environment variable for production use.             ║');
    console.warn('╚════════════════════════════════════════════════════════════════════╝');
  }
  
  console.log('[APP] Using MemoryStore session store');
}

// ============================================================================
// Step 8: Create Session Middleware (DO NOT app.use() directly!)
// ============================================================================

const sessionMiddleware = session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'tburn-session-secret-change-in-production-32chars',
  name: 'connect.sid',
  resave: false,
  saveUninitialized: false,  // CRITICAL: Must be false to prevent empty sessions
  rolling: false,
  proxy: ENVIRONMENT.isProduction,
  cookie: {
    secure: ENVIRONMENT.isProduction,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax',
    domain: ENVIRONMENT.isProduction ? process.env.COOKIE_DOMAIN : undefined,
  },
});

// ============================================================================
// Step 9: ★ CONDITIONAL SESSION MIDDLEWARE ★
// Only apply session if not already skipped by pre-filter
// ============================================================================

const conditionalSessionMiddleware: RequestHandler = (req, res, next) => {
  // If pre-filter marked this to skip, don't invoke session at all
  if ((req as any)._skipSession) {
    return next();
  }
  
  // Otherwise, use the session bypass middleware
  return sessionBypassMiddleware(req, res, next);
};

// Create session bypass middleware
const sessionBypassMiddleware = createSessionBypassMiddleware({
  sessionMiddleware,
  enableMetrics: true,
  enableDisasterRecovery: !process.env.REDIS_URL,  // Only for MemoryStore
  debug: !ENVIRONMENT.isProduction,
});

app.use(conditionalSessionMiddleware);

// ============================================================================
// Step 10: Additional Static Files & Favicon
// (Main static files are served in Step 6.5 BEFORE session)
// ============================================================================

app.use('/favicon.ico', express.static('public/favicon.ico'));
app.use('/robots.txt', express.static('public/robots.txt'));
app.use('/manifest.json', express.static('public/manifest.json'));

// ============================================================================
// Step 11: Health Check Endpoints (Session NOT needed)
// ============================================================================

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: ENVIRONMENT.nodeEnv,
    production: ENVIRONMENT.isProduction,
  });
});

// Detailed session health check
app.get('/api/session-health', sessionHealthCheck);

// Disaster Recovery status
app.get('/api/disaster-recovery/status', (req, res) => {
  const status = disasterRecovery.getStatus();
  res.json({
    ...status,
    timestamp: new Date().toISOString(),
  });
});

// Production monitoring dashboard
app.get('/api/production-monitor/dashboard', (req, res) => {
  const metrics = getSessionMetrics();
  const memUsage = process.memoryUsage();
  const drStatus = disasterRecovery.getStatus();
  
  res.json({
    status: drStatus.circuitBreakerOpen ? 'critical' : 'operational',
    timestamp: new Date().toISOString(),
    sessionMetrics: {
      totalRequests: metrics.totalRequests,
      skippedRequests: metrics.skippedRequests,
      sessionRequests: metrics.sessionRequests,
      skipRatio: `${(metrics.skipRatio * 100).toFixed(2)}%`,
      targetSkipRatio: `${(CONFIG.TARGET_SKIP_RATIO * 100).toFixed(0)}%`,
      activeSessions: metrics.activeSessions,
      maxSessions: CONFIG.MAX_SESSIONS,
      skipReasons: Object.fromEntries(
        Array.from(metrics.skipReasons.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
      ),
    },
    memory: {
      heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`,
      usage: `${((memUsage.heapUsed / memUsage.heapTotal) * 100).toFixed(2)}%`,
    },
    disasterRecovery: drStatus,
    uptime: {
      seconds: Math.floor(process.uptime()),
      formatted: formatUptime(process.uptime()),
    },
    environment: ENVIRONMENT,
    usingRedis: !!process.env.REDIS_URL,
  });
});

// Kubernetes/Docker liveness probe
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Kubernetes/Docker readiness probe
app.get('/readyz', (req, res) => {
  const metrics = getSessionMetrics();
  const memUsage = process.memoryUsage();
  const memRatio = memUsage.heapUsed / memUsage.heapTotal;
  const drStatus = disasterRecovery.getStatus();
  
  // Check if system is ready to receive traffic
  const ready = !drStatus.circuitBreakerOpen && 
                memRatio < 0.85 && 
                metrics.activeSessions < CONFIG.MAX_SESSIONS;
  
  if (ready) {
    res.status(200).send('READY');
  } else {
    res.status(503).json({
      ready: false,
      reason: drStatus.circuitBreakerOpen 
        ? 'circuit_breaker_open' 
        : memRatio >= 0.85 
          ? 'high_memory' 
          : 'too_many_sessions',
      memoryUsage: `${(memRatio * 100).toFixed(1)}%`,
      sessions: metrics.activeSessions,
    });
  }
});

// ============================================================================
// Step 12: RPC Endpoint (Session NOT needed)
// ============================================================================

// RPC endpoint handler - explicitly no session
app.all('/rpc', (req, res) => {
  // This should never create a session
  // Handle JSON-RPC request here
  
  if (req.method === 'POST') {
    const body = req.body;
    
    // Basic JSON-RPC response
    res.json({
      jsonrpc: '2.0',
      id: body?.id || null,
      result: {
        status: 'ok',
        blockNumber: '0x' + Math.floor(Date.now() / 1000).toString(16),
      },
    });
  } else {
    res.json({
      jsonrpc: '2.0',
      id: null,
      result: { status: 'ok', method: req.method },
    });
  }
});

// Also handle /rpc with any query parameters
app.all('/rpc/*', (req, res) => {
  res.json({
    jsonrpc: '2.0',
    id: null,
    result: { status: 'ok' },
  });
});

// ============================================================================
// Step 13: API Routes
// ============================================================================

// Example public routes (no session needed)
app.get('/api/blocks/latest', (req, res) => {
  res.json({
    blockNumber: 21332811 + Math.floor(Math.random() * 100),
    timestamp: Date.now(),
    transactions: Math.floor(Math.random() * 100),
  });
});

app.get('/api/network/stats', (req, res) => {
  res.json({
    tps: 50908,
    validators: 110,
    totalValidators: 125,
    uptime: 99.95,
  });
});

// Example protected routes (session needed)
app.get('/api/user/profile', (req, res) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  res.json({ 
    userId: req.session.userId,
    // ... user data
  });
});

// ============================================================================
// Step 14: SPA Fallback
// ============================================================================

app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.url.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not Found' });
  }
  
  // Don't serve for RPC paths
  if (req.url.startsWith('/rpc')) {
    return res.status(404).json({ error: 'Not Found' });
  }
  
  res.sendFile('index.html', { root: 'public' });
});

// ============================================================================
// Step 15: Error Handlers
// ============================================================================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.url,
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[APP] Error:', err);
  
  // Don't leak error details in production
  const message = ENVIRONMENT.isProduction 
    ? 'Internal Server Error' 
    : err.message;
  
  res.status(err.status || 500).json({ 
    error: message,
    ...(ENVIRONMENT.isProduction ? {} : { stack: err.stack }),
  });
});

// ============================================================================
// Step 16: Graceful Shutdown
// ============================================================================

let isShuttingDown = false;

function gracefulShutdown(signal: string): void {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  console.log(`[APP] ${signal} received, shutting down gracefully...`);
  
  // Stop disaster recovery
  disasterRecovery.stop();
  
  // Give time for in-flight requests
  setTimeout(() => {
    console.log('[APP] Shutdown complete');
    process.exit(0);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Uncaught exception handler
process.on('uncaughtException', (err) => {
  console.error('[APP] Uncaught Exception:', err);
  // Give time for logging before exit
  setTimeout(() => process.exit(1), 1000);
});

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('[APP] Unhandled Rejection at:', promise, 'reason:', reason);
});

// ============================================================================
// Utility Functions
// ============================================================================

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);
  
  return parts.join(' ');
}

// ============================================================================
// Export
// ============================================================================

export default app;
export { app };
