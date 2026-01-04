/**
 * Enterprise Session Bypass Module v2.0
 * 
 * Centralized session skip logic to ensure consistency between:
 * - Development environment
 * - Production environment (Autoscale deployment)
 * 
 * CRITICAL: This module prevents MemoryStore overflow that causes
 * "Internal Server Error" and "upstream request timeout" after 30-60 minutes
 * 
 * Session Skip Rules (Priority Order):
 * 1. Localhost requests (127.0.0.1, ::1, 10.x.x.x, 172.x.x.x) - ALWAYS skip, even with cookies
 * 2. Empty User-Agent - ALWAYS skip (internal/headless requests)
 * 3. Axios/node-fetch/undici User-Agent - ALWAYS skip (internal HTTP clients)
 * 4. X-Internal-Request header - ALWAYS skip
 * 5. Internal monitoring paths - ALWAYS skip
 * 6. Public API paths - skip for requests without existing session cookies
 * 7. Static assets - ALWAYS skip
 * 8. WebSocket upgrades - ALWAYS skip
 * 
 * Target: ≥80% session skip ratio for production stability
 */

import { Request, Response } from 'express';

// ============================================================================
// Production Environment Detection
// ============================================================================

// ★ [수정] 프로덕션 환경 정확히 감지
// Replit Autoscale 배포 시에만 true, 개발 환경에서는 false
// - REPLIT_DEPLOYMENT='1' (Autoscale 배포 시 설정됨)
// - NODE_ENV='production' (명시적 프로덕션 모드)
// - REPL_ID가 있으면서 REPLIT_DEV_DOMAIN이 없으면 배포 환경
export const IS_PRODUCTION = (
  process.env.REPLIT_DEPLOYMENT === '1' ||
  process.env.NODE_ENV === 'production' ||
  (process.env.REPL_ID && !process.env.REPLIT_DEV_DOMAIN)
) && process.env.NODE_ENV !== 'development';

// ============================================================================
// Session Skip Path Configuration (Extended for Production Stability)
// ============================================================================

// Paths that ALWAYS skip session (regardless of cookies) - Extended list
export const ALWAYS_SKIP_PREFIXES = [
  // Internal APIs
  '/api/internal',              // Internal monitoring API (Phase 16)
  '/api/soak-tests',            // Soak test API (Phase 16)
  '/api/db-optimizer',          // DB optimizer internal API
  '/api/production-monitor',    // Production monitoring API
  
  // Public APIs
  '/api/public',                // Public API v1
  '/api/health',                // Health checks
  '/health',                    // Root health check
  
  // Enterprise infrastructure
  '/api/enterprise',            // Enterprise services
  '/api/metrics',               // Prometheus metrics
  
  // Static assets
  '/assets',                    // Static assets
  '/static',                    // Static files
  '/@vite',                     // Vite dev assets
  '/@fs',                       // Vite file system
  '/node_modules',              // Node modules
  
  // Favicon and manifest
  '/favicon',                   // Favicon
  '/manifest',                  // Web manifest
  '/robots.txt',                // Robots.txt
  '/sitemap',                   // Sitemap
];

// Paths that skip session for non-authenticated requests - Extended list
export const PUBLIC_API_PREFIXES = [
  // Shard APIs
  '/api/shard-cache',           // Shard cache API
  '/api/cross-shard-router',    // Cross-shard router API
  '/api/shard-rebalancer',      // Shard rebalancer API
  '/api/batch-processor',       // Batch processor API
  
  // Validator APIs
  '/api/validators/status',     // Validator status (public)
  '/api/validators/stats',      // Validator stats (public)
  '/api/validators/list',       // Validator list (public)
  
  // Network APIs
  '/api/rewards/stats',         // Rewards stats (public)
  '/api/rewards/epoch',         // Epoch info (public)
  '/api/network/stats',         // Network stats (public)
  '/api/network/info',          // Network info (public)
  
  // Scalability APIs
  '/api/scalability',           // Scalability API (public)
  '/api/consensus/state',       // Consensus state (public)
  '/api/consensus/info',        // Consensus info (public)
  '/api/block-production',      // Block production (public)
  
  // DeFi Public APIs
  '/api/dex/pools',             // DEX pools (public read)
  '/api/dex/pairs',             // DEX pairs (public read)
  '/api/lending/markets',       // Lending markets (public read)
  '/api/yield/vaults',          // Yield vaults (public read)
  '/api/lst/pools',             // LST pools (public read)
  '/api/nft/collections',       // NFT collections (public read)
  '/api/bridge/chains',         // Bridge chains (public read)
  '/api/gamefi/projects',       // GameFi projects (public read)
  '/api/launchpad/projects',    // Launchpad projects (public read)
  
  // Community APIs
  '/api/community/content',     // Community content (public read)
  '/api/newsletter',            // Newsletter (public)
  
  // Launch event
  '/api/launch-event',          // Launch event (public read)
];

// Exact GET paths that skip session for non-authenticated requests
export const EXACT_GET_PATHS = [
  '/api/shards',                // Shard list
  '/api/blocks',                // Block list
  '/api/blocks/recent',         // Recent blocks
  '/api/transactions',          // Transaction list
  '/api/transactions/recent',   // Recent transactions
  '/api/wallets',               // Wallet list
  '/api/contracts',             // Contract list
  '/api/ai/models',             // AI models list
  '/api/ai/decisions',          // AI decisions list
  '/api/node/health',           // Node health
  '/api/performance',           // Performance stats
  '/api/consensus/rounds',      // Consensus rounds
];

// User agents that indicate internal/automated requests - Extended list
export const INTERNAL_USER_AGENTS = [
  'node-fetch',
  'undici',
  'axios',
  'got',
  'node',
  'curl',
  'wget',
  'python-requests',
  'httpie',
  'insomnia',
  'postman',
  'rest-client',
  'http-client',
  'java',
  'ruby',
  'perl',
  'php',
  'go-http',
  'apache-httpclient',
  'okhttp',
  'request',
  'superagent',
];

// Paths that ALWAYS require session (never skip) - Strict list
export const AUTH_REQUIRED_PATTERNS = [
  '/admin',                     // Admin panel
  '/config',                    // Configuration
  '/maintenance',               // Maintenance mode
  '/api/auth',                  // Authentication endpoints
  '/api/user',                  // User data endpoints
  '/api/member',                // Member endpoints
  '/login',                     // Login page
  '/logout',                    // Logout page
  '/session',                   // Session management
  '/api/session',               // Session API
];

// ============================================================================
// Session Bypass Detection
// ============================================================================

export interface SessionBypassResult {
  shouldSkip: boolean;
  reason: string;
  isInternalRequest: boolean;
  hasSessionCookie: boolean;
}

/**
 * Determines if a request should bypass session creation
 * CRITICAL: This function must be fast and aggressive to prevent session overflow
 * 
 * @param req Express request object
 * @returns SessionBypassResult with skip decision and reason
 */
export function shouldBypassSession(req: Request): SessionBypassResult {
  const normalizedPath = normalizePath(req.path);
  const userAgent = req.headers['user-agent'] || '';
  const hasInternalHeader = req.headers['x-internal-request'] === 'true';
  
  // Fast path: Check for existing session cookie first
  const hasSessionCookie = hasValidSessionCookie(req);
  
  // ★ [Priority 0] WebSocket upgrade requests - ALWAYS skip
  if (req.headers.upgrade === 'websocket') {
    return {
      shouldSkip: true,
      reason: 'websocket_upgrade',
      isInternalRequest: false,
      hasSessionCookie,
    };
  }
  
  // ★ [Priority 1] Static assets and files - ALWAYS skip (no session needed)
  if (isStaticAsset(normalizedPath)) {
    return {
      shouldSkip: true,
      reason: 'static_asset',
      isInternalRequest: false,
      hasSessionCookie,
    };
  }
  
  // ★ [Priority 2] Always skip paths - regardless of cookies
  if (matchesPrefix(normalizedPath, ALWAYS_SKIP_PREFIXES)) {
    return {
      shouldSkip: true,
      reason: 'always_skip_path',
      isInternalRequest: false,
      hasSessionCookie,
    };
  }
  
  // Detect internal requests (localhost, empty UA, axios, etc.)
  const isInternalRequest = detectInternalRequest(req, userAgent, hasInternalHeader);
  
  // ★ [Priority 3] Internal requests - ALWAYS skip (even with cookies)
  if (isInternalRequest) {
    return {
      shouldSkip: true,
      reason: 'internal_request',
      isInternalRequest: true,
      hasSessionCookie,
    };
  }
  
  // ★ [Priority 4] Check if path requires authentication - DO NOT skip
  if (requiresAuthentication(normalizedPath, req.method)) {
    return {
      shouldSkip: false,
      reason: 'auth_required_path',
      isInternalRequest,
      hasSessionCookie,
    };
  }
  
  // ★ [Priority 5] Public API paths - skip if no cookie
  if (!hasSessionCookie) {
    // Public API prefixes
    if (matchesPrefix(normalizedPath, PUBLIC_API_PREFIXES)) {
      return {
        shouldSkip: true,
        reason: 'public_api_no_cookie',
        isInternalRequest,
        hasSessionCookie,
      };
    }
    
    // Exact GET paths
    if (req.method === 'GET' && EXACT_GET_PATHS.includes(normalizedPath)) {
      return {
        shouldSkip: true,
        reason: 'exact_get_no_cookie',
        isInternalRequest,
        hasSessionCookie,
      };
    }
    
    // ★ [Production Stability] Any GET request to /api/ without cookie should skip
    // EXCEPT: Auth-related paths that need sessions for CSRF/nonces
    if (IS_PRODUCTION && req.method === 'GET' && normalizedPath.startsWith('/api/')) {
      // ★ [중요] 인증 관련 경로는 세션 필요 - 제외
      const authCriticalPaths = [
        '/api/auth',        // 인증 체크
        '/api/session',     // 세션 관리
        '/api/oauth',       // OAuth 콜백
        '/api/google',      // Google OAuth
        '/api/csrf',        // CSRF 토큰
      ];
      
      const isAuthCritical = authCriticalPaths.some(prefix => 
        normalizedPath === prefix || normalizedPath.startsWith(prefix + '/')
      );
      
      if (!isAuthCritical) {
        return {
          shouldSkip: true,
          reason: 'production_api_get_no_cookie',
          isInternalRequest,
          hasSessionCookie,
        };
      }
    }
  }
  
  // ★ [Priority 6] HTML Page Requests without authenticated cookie
  // CRITICAL: This is the main fix for MemoryStore overflow after 1-2 hours
  // Anonymous page visits don't need persistent sessions
  if (!hasSessionCookie && req.method === 'GET') {
    const acceptHeader = req.headers.accept || '';
    const isHtmlRequest = acceptHeader.includes('text/html') || 
                          acceptHeader === '*/*' ||
                          acceptHeader === '';
    
    // Skip session for public HTML pages (not admin/login)
    if (isHtmlRequest && !requiresAuthentication(normalizedPath, 'GET')) {
      return {
        shouldSkip: true,
        reason: 'public_html_no_cookie',
        isInternalRequest,
        hasSessionCookie,
      };
    }
  }
  
  // ★ [Priority 7] Requests with anonymous session cookie but not authenticated
  // If user has a tburn_session cookie but is NOT logged in, skip session recreation
  // This prevents session accumulation from repeat visitors
  if (hasSessionCookie && req.method === 'GET') {
    // Check if this is just a browsing session (not authenticated)
    // Only skip if not accessing auth-critical paths
    const authPaths = ['/api/auth', '/api/session', '/admin', '/login', '/api/user'];
    const isAuthPath = authPaths.some(p => normalizedPath.startsWith(p));
    
    if (!isAuthPath) {
      // Let existing session continue but don't create new ones
      // The session middleware will handle existing sessions
      return {
        shouldSkip: false,
        reason: 'existing_session',
        isInternalRequest,
        hasSessionCookie,
      };
    }
  }
  
  // ★ [Priority 8] Don't skip - need session
  return {
    shouldSkip: false,
    reason: 'session_required',
    isInternalRequest,
    hasSessionCookie,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function normalizePath(path: string): string {
  // Remove trailing slash for consistent matching
  return path.endsWith('/') && path.length > 1 
    ? path.slice(0, -1) 
    : path;
}

// Static asset extensions that never need session
const STATIC_EXTENSIONS = [
  '.js', '.mjs', '.cjs',        // JavaScript
  '.css', '.scss', '.less',     // Styles
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.avif', // Images
  '.woff', '.woff2', '.ttf', '.eot', '.otf',  // Fonts
  '.json', '.xml', '.txt',      // Data files
  '.mp4', '.webm', '.ogg', '.mp3', '.wav',    // Media
  '.pdf', '.doc', '.docx',      // Documents
  '.map', '.br', '.gz',         // Source maps, compressed
];

/**
 * Check if the request is for a static asset
 * Static assets never need sessions
 */
function isStaticAsset(path: string): boolean {
  // Check file extension
  const ext = path.substring(path.lastIndexOf('.')).toLowerCase();
  if (STATIC_EXTENSIONS.includes(ext)) {
    return true;
  }
  
  // Check common static asset patterns
  if (path.includes('/assets/') || 
      path.includes('/static/') || 
      path.includes('/@vite/') ||
      path.includes('/@fs/') ||
      path.includes('/node_modules/') ||
      path.startsWith('/src/') ||
      path.includes('.hot-update.')) {
    return true;
  }
  
  return false;
}

/**
 * Detect internal/automated requests that should never create sessions
 * CRITICAL: This must be comprehensive for production stability
 */
function detectInternalRequest(req: Request, userAgent: string, hasInternalHeader: boolean): boolean {
  // ★ [1] Check X-Internal-Request header
  if (hasInternalHeader) {
    return true;
  }
  
  // ★ [2] Check for localhost/internal IPs (even through proxy)
  const ip = getClientIP(req);
  if (isInternalIP(ip)) {
    return true;
  }
  
  // ★ [3] Check for empty User-Agent (headless/internal requests)
  if (userAgent === '' || userAgent === undefined) {
    return true;
  }
  
  // ★ [4] Check for known internal HTTP client User-Agents
  const lowerUA = userAgent.toLowerCase();
  for (const internalUA of INTERNAL_USER_AGENTS) {
    if (lowerUA.includes(internalUA)) {
      return true;
    }
  }
  
  // ★ [5] Check for bot/crawler User-Agents (they don't need sessions)
  if (lowerUA.includes('bot') || 
      lowerUA.includes('crawler') || 
      lowerUA.includes('spider') ||
      lowerUA.includes('monitor') ||
      lowerUA.includes('check') ||
      lowerUA.includes('probe') ||
      lowerUA.includes('health')) {
    return true;
  }
  
  return false;
}

/**
 * Get the real client IP, handling proxy headers
 */
function getClientIP(req: Request): string {
  // Check X-Forwarded-For header (standard proxy header)
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (xForwardedFor) {
    const ips = typeof xForwardedFor === 'string' 
      ? xForwardedFor.split(',').map(ip => ip.trim())
      : xForwardedFor;
    return ips[0] || req.ip || '';
  }
  
  // Check X-Real-IP header (Nginx)
  const xRealIp = req.headers['x-real-ip'];
  if (xRealIp) {
    return typeof xRealIp === 'string' ? xRealIp : xRealIp[0];
  }
  
  // Fallback to req.ip (Express trust proxy)
  return req.ip || '';
}

/**
 * Check if IP is internal (localhost, private network, etc.)
 */
function isInternalIP(ip: string): boolean {
  if (!ip) return false;
  
  // Localhost
  if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1') {
    return true;
  }
  
  // Private networks (10.x.x.x, 172.16-31.x.x, 192.168.x.x)
  if (ip.startsWith('10.') || 
      ip.startsWith('192.168.') ||
      ip.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) {
    return true;
  }
  
  // IPv6 private (fc00::/7, fe80::/10)
  if (ip.startsWith('fc') || ip.startsWith('fd') || ip.startsWith('fe80')) {
    return true;
  }
  
  // Docker internal networks
  if (ip.startsWith('172.17.') || ip.startsWith('172.18.')) {
    return true;
  }
  
  return false;
}

function hasValidSessionCookie(req: Request): boolean {
  const cookie = req.headers.cookie || '';
  return cookie.includes('connect.sid');
}

function matchesPrefix(path: string, prefixes: string[]): boolean {
  return prefixes.some(prefix => 
    path === prefix || path.startsWith(prefix + '/')
  );
}

function requiresAuthentication(path: string, method: string): boolean {
  // Check auth-required patterns
  for (const pattern of AUTH_REQUIRED_PATTERNS) {
    if (path.includes(pattern)) {
      return true;
    }
  }
  
  // POST/PUT/DELETE on protected routes
  if (method !== 'GET') {
    if (path.includes('/start') || 
        path.includes('/stop') || 
        path.includes('/benchmark')) {
      return true;
    }
  }
  
  return false;
}

// ============================================================================
// Set-Cookie Header Blocking
// ============================================================================

/**
 * Blocks Set-Cookie header from being sent
 * Call this when session should be skipped
 * CRITICAL: This prevents session cookie leaks that cause MemoryStore overflow
 */
export function blockSetCookie(res: Response): void {
  // ★ [1] Override setHeader to block Set-Cookie
  const originalSetHeader = res.setHeader.bind(res);
  res.setHeader = function(name: string, value: any) {
    if (name.toLowerCase() === 'set-cookie') {
      // Block Set-Cookie header for skipped sessions
      return res;
    }
    return originalSetHeader(name, value);
  };
  
  // ★ [2] Override appendHeader/writeHead to catch all Set-Cookie attempts
  const originalWriteHead = res.writeHead?.bind(res);
  if (originalWriteHead) {
    (res as any).writeHead = function(statusCode: number, statusMessage?: string | any, headers?: any) {
      // Handle different overload signatures
      let finalHeaders = headers;
      if (typeof statusMessage === 'object') {
        finalHeaders = statusMessage;
        statusMessage = undefined;
      }
      
      // Remove Set-Cookie from headers if present
      if (finalHeaders) {
        if (typeof finalHeaders === 'object') {
          delete finalHeaders['set-cookie'];
          delete finalHeaders['Set-Cookie'];
        }
      }
      
      // Remove any existing Set-Cookie header
      res.removeHeader('Set-Cookie');
      res.removeHeader('set-cookie');
      
      if (statusMessage !== undefined) {
        return originalWriteHead(statusCode, statusMessage, finalHeaders);
      }
      return originalWriteHead(statusCode, finalHeaders);
    };
  }
  
  // ★ [3] Also remove any existing Set-Cookie header
  res.removeHeader('Set-Cookie');
  res.removeHeader('set-cookie');
}

/**
 * Creates a minimal fake session object for skipped requests
 */
export function createSkipSession(): any {
  return {
    id: 'skip-session',
    cookie: {},
    regenerate: (cb: any) => cb && cb(),
    destroy: (cb: any) => cb && cb(),
    reload: (cb: any) => cb && cb(),
    save: (cb: any) => cb && cb(),
    touch: () => {},
  };
}

// ============================================================================
// MemoryStore Capacity Monitoring
// ============================================================================

let memoryStoreWarningThreshold = 0.7; // 70% capacity warning
let lastCapacityWarning = 0;
const CAPACITY_WARNING_INTERVAL = 60000; // 1 minute between warnings

export function checkMemoryStoreCapacity(
  currentSessions: number,
  maxSessions: number
): { isWarning: boolean; isCritical: boolean; percentUsed: number } {
  const percentUsed = currentSessions / maxSessions;
  const isWarning = percentUsed >= memoryStoreWarningThreshold;
  const isCritical = percentUsed >= 0.9;
  
  const now = Date.now();
  if (isWarning && now - lastCapacityWarning > CAPACITY_WARNING_INTERVAL) {
    lastCapacityWarning = now;
    console.warn(
      `[Session] ⚠️ MemoryStore capacity warning: ${(percentUsed * 100).toFixed(1)}% ` +
      `(${currentSessions}/${maxSessions}) - Consider enabling Redis`
    );
  }
  
  if (isCritical) {
    console.error(
      `[Session] 🚨 CRITICAL: MemoryStore at ${(percentUsed * 100).toFixed(1)}% capacity! ` +
      `Server may become unresponsive.`
    );
  }
  
  return { isWarning, isCritical, percentUsed };
}

export function setMemoryStoreWarningThreshold(threshold: number): void {
  memoryStoreWarningThreshold = Math.max(0.5, Math.min(0.95, threshold));
}

// ============================================================================
// Emergency MemoryStore Cleanup (CRITICAL for 24/7 stability)
// ============================================================================

let lastEmergencyCleanup = 0;
const EMERGENCY_CLEANUP_INTERVAL = 30000; // 30 seconds between cleanups
let emergencyCleanupCount = 0;

/**
 * Performs emergency cleanup on MemoryStore when capacity is critical
 * CRITICAL: This prevents 500 errors from MemoryStore overflow
 * 
 * @param memoryStoreRef Reference to the MemoryStore instance
 * @param currentSessions Current session count
 * @param maxSessions Maximum allowed sessions
 * @returns Number of sessions cleared (0 if no cleanup needed)
 */
export function performEmergencyCleanup(
  memoryStoreRef: any,
  currentSessions: number,
  maxSessions: number
): number {
  const percentUsed = currentSessions / maxSessions;
  const now = Date.now();
  
  // Only cleanup when critical (>80%) and not too frequently
  if (percentUsed < 0.8 || now - lastEmergencyCleanup < EMERGENCY_CLEANUP_INTERVAL) {
    return 0;
  }
  
  lastEmergencyCleanup = now;
  emergencyCleanupCount++;
  
  try {
    // Get the internal LRU store
    const store = memoryStoreRef?.store;
    if (!store) {
      console.warn('[Session] ⚠️ Cannot access MemoryStore internal store for cleanup');
      return 0;
    }
    
    // Calculate how many sessions to remove (clear 30% when critical)
    const targetRemoval = Math.floor(maxSessions * 0.3);
    let removed = 0;
    
    console.warn(
      `[Session] 🚨 EMERGENCY CLEANUP #${emergencyCleanupCount}: ` +
      `${(percentUsed * 100).toFixed(1)}% capacity (${currentSessions}/${maxSessions}). ` +
      `Removing oldest ${targetRemoval} sessions...`
    );
    
    // Use LRU prune/clear methods if available
    if (typeof store.prune === 'function') {
      // memorystore LRU has prune method
      store.prune();
      removed = Math.min(targetRemoval, currentSessions);
    } else if (typeof store.keys === 'function') {
      // Manual removal of oldest entries
      const keys = [...store.keys()];
      const toRemove = keys.slice(0, targetRemoval);
      
      for (const key of toRemove) {
        if (typeof store.del === 'function') {
          store.del(key);
          removed++;
        } else if (typeof store.delete === 'function') {
          store.delete(key);
          removed++;
        }
      }
    }
    
    console.log(`[Session] ✅ Emergency cleanup completed: ${removed} sessions removed`);
    return removed;
    
  } catch (error) {
    console.error(`[Session] ❌ Emergency cleanup failed:`, error);
    return 0;
  }
}

/**
 * Force clear all sessions (nuclear option for critical situations)
 * Use only when server is about to crash
 */
export function forceClearAllSessions(memoryStoreRef: any): boolean {
  try {
    const store = memoryStoreRef?.store;
    if (!store) return false;
    
    console.error('[Session] 🔥 FORCE CLEARING ALL SESSIONS - Critical capacity reached');
    
    if (typeof store.clear === 'function') {
      store.clear();
      console.log('[Session] ✅ All sessions cleared');
      return true;
    } else if (typeof store.reset === 'function') {
      store.reset();
      console.log('[Session] ✅ Session store reset');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('[Session] ❌ Force clear failed:', error);
    return false;
  }
}

/**
 * Get emergency cleanup statistics
 */
export function getEmergencyCleanupStats() {
  return {
    cleanupCount: emergencyCleanupCount,
    lastCleanup: lastEmergencyCleanup,
    timeSinceLastCleanup: Date.now() - lastEmergencyCleanup,
  };
}
