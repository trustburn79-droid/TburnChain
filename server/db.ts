import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "@shared/schema";
import ws from "ws";

// ═══════════════════════════════════════════════════════════════════════════════
// ★ [2026-01-11] ENTERPRISE DATABASE SEPARATION
// ═══════════════════════════════════════════════════════════════════════════════
// 
// 환경별 데이터베이스 분리 구성:
// - 개발 환경: DATABASE_URL (기존 Neon DB) - 워크플로우/개발용
// - 프로덕션 환경: DATABASE_URL_PROD (Replit 프로덕션 DB) - 퍼블리싱 서버용
//
// 감지 우선순위:
// 1. REPLIT_DEPLOYMENT=1 → 프로덕션 DB 사용
// 2. NODE_ENV=production + !REPLIT_DEV_DOMAIN → 프로덕션 DB 사용
// 3. 그 외 → 개발 DB 사용
// ═══════════════════════════════════════════════════════════════════════════════

// Environment detection for database selection
const IS_REPLIT_DEPLOYMENT = process.env.REPLIT_DEPLOYMENT === '1';
const IS_PRODUCTION_ENV = process.env.NODE_ENV === 'production';
const HAS_DEV_DOMAIN = !!process.env.REPLIT_DEV_DOMAIN;

// Determine if we should use production database
// Production: deployed via Replit OR production env without dev domain
const USE_PRODUCTION_DB = IS_REPLIT_DEPLOYMENT || (IS_PRODUCTION_ENV && !HAS_DEV_DOMAIN);

// Database URL selection with security validation
function getDatabaseUrl(): string {
  const devUrl = process.env.DATABASE_URL;
  const prodUrl = process.env.DATABASE_URL_PROD;
  
  if (USE_PRODUCTION_DB) {
    // Production mode: prefer DATABASE_URL_PROD, fallback to DATABASE_URL
    if (prodUrl) {
      console.log('[DB Enterprise] 🚀 Using PRODUCTION database (DATABASE_URL_PROD)');
      console.log('[DB Enterprise] Environment:', {
        REPLIT_DEPLOYMENT: IS_REPLIT_DEPLOYMENT,
        NODE_ENV: process.env.NODE_ENV,
        HAS_DEV_DOMAIN: HAS_DEV_DOMAIN
      });
      return prodUrl;
    }
    
    // Fallback: if no prod URL, use dev URL but warn
    if (devUrl) {
      console.warn('[DB Enterprise] ⚠️ DATABASE_URL_PROD not set, falling back to DATABASE_URL');
      console.warn('[DB Enterprise] ⚠️ This means dev and prod share the same database!');
      return devUrl;
    }
    
    throw new Error('[DB Enterprise] ❌ No database URL configured for production!');
  }
  
  // Development mode: use DATABASE_URL
  if (devUrl) {
    console.log('[DB Enterprise] 🔧 Using DEVELOPMENT database (DATABASE_URL)');
    console.log('[DB Enterprise] Environment:', {
      REPLIT_DEPLOYMENT: IS_REPLIT_DEPLOYMENT,
      NODE_ENV: process.env.NODE_ENV,
      HAS_DEV_DOMAIN: HAS_DEV_DOMAIN
    });
    return devUrl;
  }
  
  throw new Error('[DB Enterprise] ❌ DATABASE_URL is not set for development!');
}

// Get the appropriate database URL
const DATABASE_CONNECTION_URL = getDatabaseUrl();

// Export environment info for other modules
export const dbEnvironment = {
  isProduction: USE_PRODUCTION_DB,
  isDevelopment: !USE_PRODUCTION_DB,
  hasSeparateProductionDb: !!process.env.DATABASE_URL_PROD,
  environmentName: USE_PRODUCTION_DB ? 'PRODUCTION' : 'DEVELOPMENT'
};

// Patched WebSocket to work around Neon serverless bug
// Neon tries to set ErrorEvent.message which is read-only, causing crash
class PatchedWebSocket extends ws {
  constructor(url: string | URL, protocols?: string | string[]) {
    super(url, protocols);
    
    // Intercept error events and convert ErrorEvent to plain Error
    const originalEmit = this.emit.bind(this);
    this.emit = (event: string | symbol, ...args: any[]): boolean => {
      if (event === 'error' && args[0]) {
        const err = args[0];
        // Convert ErrorEvent to a plain Error with writable properties
        if (err && typeof err === 'object' && err.constructor?.name === 'ErrorEvent') {
          const plainError = new Error(err.message || 'WebSocket error');
          (plainError as any).code = err.error?.code || 'ECONNRESET';
          (plainError as any).cause = err.error;
          return originalEmit(event, plainError);
        }
      }
      return originalEmit(event, ...args);
    };
  }
}

// Configure WebSocket for Neon serverless in Node.js
neonConfig.webSocketConstructor = PatchedWebSocket as any;

// ═══════════════════════════════════════════════════════════════════════════════
// ENTERPRISE POOL CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════
// Optimized for blockchain TPS monitoring workloads:
// - max: 20 connections for batch flush + concurrent reads (production)
// - max: 10 connections for development (lower resource usage)
// - statement_timeout: 3s to prevent long-running queries
// - idle_in_transaction_session_timeout: 30s to reclaim stuck connections
// ═══════════════════════════════════════════════════════════════════════════════

const poolConfig = {
  connectionString: DATABASE_CONNECTION_URL,
  max: USE_PRODUCTION_DB ? 20 : 10,  // Higher pool for production
  idleTimeoutMillis: USE_PRODUCTION_DB ? 30000 : 60000,  // Faster cleanup in prod
  connectionTimeoutMillis: 10000,   // Wait 10s max for connection
  allowExitOnIdle: true,            // Allow clean exit when idle
  statement_timeout: USE_PRODUCTION_DB ? 3000 : 5000,  // Stricter timeout in prod
};

console.log('[DB Enterprise] Pool config:', {
  environment: dbEnvironment.environmentName,
  maxConnections: poolConfig.max,
  statementTimeout: poolConfig.statement_timeout,
  idleTimeout: poolConfig.idleTimeoutMillis
});

export const pool = new Pool(poolConfig);

// Handle pool errors gracefully - don't crash the process
pool.on("error", (err) => {
  console.error(`[DB Pool ${dbEnvironment.environmentName}] Connection error (will reconnect):`, err.message);
});

export const db = drizzle(pool, { schema });

// ═══════════════════════════════════════════════════════════════════════════════
// MAINTENANCE MODE FLAG
// ═══════════════════════════════════════════════════════════════════════════════
// Set MAINTENANCE_MODE=true to block write operations during migrations
// ═══════════════════════════════════════════════════════════════════════════════

export const maintenanceMode = {
  enabled: process.env.MAINTENANCE_MODE === 'true',
  readOnly: process.env.MAINTENANCE_READ_ONLY === 'true',
  message: process.env.MAINTENANCE_MESSAGE || 'System is under maintenance. Please try again later.',
  
  check(): void {
    if (this.enabled) {
      throw new Error(`[MAINTENANCE] ${this.message}`);
    }
  },
  
  checkWrite(): void {
    if (this.enabled || this.readOnly) {
      throw new Error(`[MAINTENANCE] Write operations are temporarily disabled. ${this.message}`);
    }
  }
};

if (maintenanceMode.enabled) {
  console.warn('[DB Enterprise] ⚠️ MAINTENANCE MODE ENABLED - All operations blocked');
} else if (maintenanceMode.readOnly) {
  console.warn('[DB Enterprise] ⚠️ READ-ONLY MODE - Write operations blocked');
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

// Utility function for retrying DB operations
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  operationName: string = "DB operation",
  maxRetries: number = 3
): Promise<T | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      const isConnectionError = error?.message?.includes("Connection terminated") ||
                                error?.message?.includes("ECONNREFUSED") ||
                                error?.message?.includes("ECONNRESET") ||
                                error?.message?.includes("connection");
      
      if (isConnectionError && attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.warn(`[DB ${dbEnvironment.environmentName}] ${operationName} failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      console.error(`[DB ${dbEnvironment.environmentName}] ${operationName} failed after ${attempt} attempts:`, error.message);
      return null;
    }
  }
  return null;
}

// Health check function for database connectivity
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  environment: string;
  latencyMs: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    await pool.query('SELECT 1');
    return {
      healthy: true,
      environment: dbEnvironment.environmentName,
      latencyMs: Date.now() - start
    };
  } catch (error: any) {
    return {
      healthy: false,
      environment: dbEnvironment.environmentName,
      latencyMs: Date.now() - start,
      error: error.message
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL ERROR HANDLING
// ═══════════════════════════════════════════════════════════════════════════════
// Enhanced to handle transient error types gracefully for 24/7 stability
// ═══════════════════════════════════════════════════════════════════════════════

process.on('unhandledRejection', (reason: any) => {
  const message = reason?.message || String(reason);
  const code = reason?.code;
  
  // Transient network/connection errors - suppress without crashing
  const transientErrors = [
    'Connection terminated',
    'ECONNRESET',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'ECONNABORTED',
    'socket hang up',
    'Client network socket disconnected',
    'getaddrinfo',
    'connect ECONNREFUSED',
    'read ECONNRESET',
    'write EPIPE',
    'EPIPE',
    'EHOSTUNREACH',
    'fetch failed',
    'Request timeout',
    'SSL SYSCALL error',
    'SSL_ERROR_SYSCALL',
    'network error',
    'network request failed',
    'AbortError',
  ];
  
  const isTransient = transientErrors.some(err => 
    message.includes(err) || code === err
  );
  
  if (isTransient) {
    console.warn(`[DB ${dbEnvironment.environmentName}] Transient network error (recovered):`, message.substring(0, 100));
    return;
  }
  
  // Database-specific errors that are recoverable
  const dbRecoverableErrors = [
    'too many clients',
    'connection pool timeout',
    'remaining connection slots',
    'terminating connection due to administrator',
    'server closed the connection unexpectedly',
    'SSL connection has been closed unexpectedly',
  ];
  
  const isDbRecoverable = dbRecoverableErrors.some(err => 
    message.toLowerCase().includes(err.toLowerCase())
  );
  
  if (isDbRecoverable) {
    console.warn(`[DB ${dbEnvironment.environmentName}] Database connection error (will retry):`, message.substring(0, 100));
    return;
  }
  
  // Check for known critical errors that should be logged but not crash
  const knownNonCriticalPatterns = [
    'fetch', 'request', 'api', 'websocket', 'http', 'redis',
    'timeout', 'network', 'socket', 'connection', 'refused'
  ];
  
  const isLikelyNonCritical = knownNonCriticalPatterns.some(pattern =>
    message.toLowerCase().includes(pattern)
  );
  
  if (isLikelyNonCritical) {
    console.warn('[Unhandled Rejection] Non-critical:', message.substring(0, 150));
    return;
  }
  
  // Unknown errors - log with full details for debugging
  console.error('[Unhandled Rejection] ⚠️ Unknown error type:', message);
  if (reason?.stack) {
    console.error('[Unhandled Rejection Stack]:', reason.stack.split('\n').slice(0, 5).join('\n'));
  }
});

// Log successful initialization
console.log(`[DB Enterprise] ✅ Database initialized for ${dbEnvironment.environmentName} environment`);
console.log(`[DB Enterprise] Separate prod DB configured: ${dbEnvironment.hasSeparateProductionDb ? 'YES ✅' : 'NO ⚠️'}`);
