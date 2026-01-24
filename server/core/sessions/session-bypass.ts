/**
 * Enterprise Session Bypass Module v3.1.0
 * 
 * Purpose: 24/7/365 무중단 운영을 위한 세션 바이패스
 * 
 * CRITICAL: This module prevents MemoryStore overflow that causes
 * "Internal Server Error" and "upstream request timeout" after 1-2 hours
 * 
 * Changes in v3.1:
 * - ★ [2026-01-06] Integrated with centralized session-policy.ts module
 * - Uses shared isAuthRequired, isSessionFree, isTrustedIP functions
 * - Consistent policy across all bypass layers
 * - CIDR-aware trusted IP validation
 * - Enhanced Prometheus metrics
 * 
 * Changes in v3.0:
 * - Enhanced environment detection (unified with app.ts)
 * - Aggressive session skip for bots, crawlers, internal requests
 * - Set-Cookie header blocking for skipped sessions
 * - Memory-based emergency cleanup
 * - Comprehensive metrics collection
 * - Target: ≥95% session skip ratio for production stability
 */

import { Request, Response, NextFunction, RequestHandler } from 'express';
import session from 'express-session';
import * as fs from 'fs';
import { METRICS_CONFIG } from '../memory/metrics-config';

// ★ [2026-01-06] Import centralized policy functions
import {
  isAuthRequired as policyIsAuthRequired,
  isSessionFree as policyIsSessionFree,
  isStaticAsset as policyIsStaticAsset,
  isTrustedIP as policyIsTrustedIP,
  isInternalUserAgent as policyIsInternalUA,
  hasValidSessionCookie as policyHasValidSessionCookie,
  hasCacheBustParam as policyHasCacheBustParam,
  isValidSkipSessionHeader,
  makeBypassDecision,
  recordBypassDecision,
  getBypassMetrics,
  getPrometheusMetrics,
  ENVIRONMENT as POLICY_ENVIRONMENT,
  IS_PRODUCTION as POLICY_IS_PRODUCTION,
  CONFIG as POLICY_CONFIG,
} from './session-policy';

// ============================================================================
// Configuration Constants
// ============================================================================

export const CONFIG = {
  // Memory thresholds
  MEMORY_WARNING_THRESHOLD: 0.70,    // 70% - start warning
  MEMORY_CRITICAL_THRESHOLD: 0.85,   // 85% - emergency cleanup
  MEMORY_EMERGENCY_THRESHOLD: 0.95,  // 95% - full clear
  
  // Session settings
  SESSION_MAX_AGE: 24 * 60 * 60 * 1000,  // 24 hours
  SESSION_CLEANUP_INTERVAL: 60 * 1000,    // 1 minute cleanup
  MAX_SESSIONS: 10000,                     // Maximum session count
  
  // Skip ratio target
  TARGET_SKIP_RATIO: 0.95,  // Target ≥95% skip
} as const;

// ============================================================================
// Environment Detection (Unified)
// ============================================================================

interface EnvironmentInfo {
  isProduction: boolean;
  isReplit: boolean;
  isDocker: boolean;
  isKubernetes: boolean;
  hostname: string;
  nodeEnv: string;
}

function detectEnvironment(): EnvironmentInfo {
  const env = process.env;
  
  let isDocker = false;
  try {
    isDocker = env.DOCKER === '1' || fs.existsSync('/.dockerenv');
  } catch {
    isDocker = env.DOCKER === '1';
  }
  
  return {
    isProduction: 
      env.NODE_ENV === 'production' ||
      env.REPL_SLUG !== undefined ||
      env.REPLIT_DEPLOYMENT === '1' ||
      env.REPLIT_DEV_DOMAIN !== undefined ||
      env.KUBERNETES_SERVICE_HOST !== undefined ||
      env.DYNO !== undefined,  // Heroku
      
    isReplit: 
      env.REPL_SLUG !== undefined ||
      env.REPLIT_DEPLOYMENT === '1' ||
      env.REPLIT_DEV_DOMAIN !== undefined,
      
    isDocker,
      
    isKubernetes:
      env.KUBERNETES_SERVICE_HOST !== undefined,
      
    hostname: env.HOSTNAME || env.REPL_SLUG || 'unknown',
    nodeEnv: env.NODE_ENV || 'development',
  };
}

const ENVIRONMENT = detectEnvironment();

// Export IS_PRODUCTION for external use
// ★ [2026-01-06 CRITICAL FIX] Replit 환경에서는 NODE_ENV와 관계없이 프로덕션으로 간주
// 이전: ENVIRONMENT.isProduction && process.env.NODE_ENV !== 'development' (Replit에서 false 반환)
// 수정: Replit 감지 시 무조건 프로덕션 (512MB 메모리 환경)
export const IS_PRODUCTION = ENVIRONMENT.isProduction || ENVIRONMENT.isReplit;

// ============================================================================
// Session Skip Path Configuration
// ============================================================================

// Static asset extensions that never need sessions
const STATIC_EXTENSIONS = new Set([
  '.js', '.mjs', '.cjs',
  '.css', '.scss', '.sass', '.less',
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.avif',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  '.mp3', '.mp4', '.webm', '.ogg', '.wav',
  '.pdf', '.zip', '.gz', '.br',
  '.json', '.xml', '.txt', '.md',
  '.map', '.LICENSE',
]);

// Static path prefixes
const STATIC_PREFIXES = [
  '/assets/',
  '/static/',
  '/public/',
  '/dist/',
  '/build/',
  '/node_modules/',
  '/_next/',
  '/__vite',
  '/@vite',
  '/@fs',
  '/favicon',
  '/robots.txt',
  '/sitemap',
  '/manifest',
  '/.well-known/',
  '/src/',
];

// Internal/automated User-Agent patterns
const INTERNAL_USER_AGENTS = [
  // HTTP clients
  'axios', 'node-fetch', 'got', 'superagent', 'request',
  'undici', 'needle', 'bent', 'phin',
  
  // Command line tools
  'curl', 'wget', 'httpie', 'postman', 'insomnia',
  
  // Monitoring/health checks
  'uptimerobot', 'pingdom', 'newrelic', 'datadog',
  'prometheus', 'grafana', 'zabbix', 'nagios',
  'healthcheck', 'kube-probe', 'googlehc',
  
  // Cloud services
  'replit', 'heroku', 'vercel', 'netlify', 'cloudflare',
  'aws', 'azure', 'gcp', 'digitalocean',
  
  // Bots/crawlers
  'googlebot', 'bingbot', 'yandexbot', 'duckduckbot',
  'baiduspider', 'slurp', 'facebookexternalhit',
  'twitterbot', 'linkedinbot', 'slackbot', 'discordbot',
  'telegrambot', 'whatsapp', 'applebot',
  'semrushbot', 'ahrefsbot', 'mj12bot', 'dotbot',
  'petalbot', 'bytespider', 'gptbot', 'claudebot',
  
  // Testing tools
  'playwright', 'puppeteer', 'selenium', 'cypress',
  'jest', 'mocha', 'vitest',
  
  // Generic patterns
  'bot', 'crawler', 'spider', 'monitor', 'check', 'probe', 'health',
];

// Internal IP patterns
const INTERNAL_IP_PATTERNS = [
  /^127\./,                    // localhost
  /^10\./,                     // Class A private
  /^172\.(1[6-9]|2\d|3[01])\./, // Class B private
  /^192\.168\./,               // Class C private
  /^::1$/,                     // IPv6 localhost
  /^::ffff:127\./,             // IPv6 mapped localhost
  /^fe80:/i,                   // IPv6 link-local
  /^fc00:/i,                   // IPv6 unique local
  /^fd00:/i,                   // IPv6 unique local
];

// Auth-required paths (must NOT skip session)
const AUTH_REQUIRED_PATHS = [
  '/api/auth/',
  '/api/auth',
  '/api/session',
  '/api/user',
  '/api/admin',
  '/api/custody-admin',     // ★ [2026-01-23] Custody admin requires session for all operations
  '/api/enterprise/admin',  // ★ [2026-01-06] Enterprise admin portal routes require authentication
  '/api/wallet',
  '/api/transaction',
  '/api/stake',
  '/api/governance',
  '/api/oauth',
  '/api/google',
  '/api/csrf',
  '/api/member',
  '/login',
  '/register',
  '/dashboard',
  '/profile',
  '/settings',
  '/admin',
  '/config',
  '/maintenance',
  '/logout',
];

// Session-free API paths
const SESSION_FREE_API_PATHS = [
  '/api/health',
  '/api/status',
  '/api/metrics',
  '/api/ping',
  '/api/version',
  '/api/blocks',
  '/api/transactions/public',
  '/api/transactions/recent',
  '/api/validators/list',
  '/api/validators/status',
  '/api/validators/stats',
  '/api/network/stats',
  '/api/network/info',
  '/api/price',
  '/api/market',
  '/api/explorer/',
  '/api/production-monitor/',
  '/api/session-health',
  '/api/internal',
  '/api/soak-tests',
  '/api/db-optimizer',
  '/api/public',
  '/api/enterprise',
  '/api/shard-cache',
  '/api/cross-shard-router',
  '/api/shard-rebalancer',
  '/api/batch-processor',
  '/api/rewards/stats',
  '/api/rewards/epoch',
  '/api/scalability',
  '/api/consensus/state',
  '/api/consensus/info',
  '/api/consensus/rounds',
  '/api/block-production',
  '/api/pipeline',
  '/api/dex/pools',
  '/api/dex/pairs',
  '/api/lending/markets',
  '/api/yield/vaults',
  '/api/lst/pools',
  '/api/nft/collections',
  '/api/bridge/chains',
  '/api/gamefi/projects',
  '/api/launchpad/projects',
  '/api/community/content',
  '/api/newsletter',
  '/api/launch-event',
  '/api/shards',
  '/api/wallets',
  '/api/contracts',
  '/api/ai/models',
  '/api/ai/decisions',
  '/api/node/health',
  '/api/performance',
  '/health',
  // ★ [2026-01-05 v3.2] RPC 페이지 추가 - 세션 불필요
  '/rpc',
  '/api/rpc',
  '/rpc-docs',
  '/api/rpc-docs',
  '/docs',
  '/api/docs',
  // ★ 추가 공개 페이지
  '/explorer',
  '/blocks',
  '/transactions',
  '/validators',
  '/staking',
  '/governance',
  '/tokenomics',
  '/ecosystem',
  '/bridge',
  '/defi',
  '/nft',
  '/gamefi',
  '/launchpad',
  '/community',
  '/custody',
  '/distribution',
];

// ★ [2026-01-05 v3.2] 타임스탬프 쿼리 파라미터 패턴
// ?_t=1767653039282 형태의 캐시 버스팅 파라미터 감지
const CACHE_BUST_PARAMS = ['_t', '_ts', '_timestamp', '_v', '_version', 'v', 't', 'ts'];

// ============================================================================
// Skip Decision Interface
// ============================================================================

export interface SkipDecision {
  skip: boolean;
  reason: string;
  priority: number;
}

export interface SessionBypassResult {
  shouldSkip: boolean;
  reason: string;
  isInternalRequest: boolean;
  hasSessionCookie: boolean;
}

// ============================================================================
// Skip Decision Function
// ============================================================================

function getExtension(path: string): string | null {
  const lastDot = path.lastIndexOf('.');
  if (lastDot === -1 || lastDot === path.length - 1) return null;
  const ext = path.slice(lastDot).toLowerCase();
  return ext.split('?')[0];
}

function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return ips.split(',')[0].trim();
  }
  const xRealIp = req.headers['x-real-ip'];
  if (xRealIp) {
    return typeof xRealIp === 'string' ? xRealIp : xRealIp[0];
  }
  return req.ip || req.socket?.remoteAddress || '0.0.0.0';
}

function isInternalIP(ip: string): boolean {
  if (!ip) return false;
  return INTERNAL_IP_PATTERNS.some(pattern => pattern.test(ip));
}

// ★ [2026-01-06] Use centralized policy function for consistent auth path detection
function isAuthRequired(path: string): boolean {
  return policyIsAuthRequired(path);
}

function hasValidSessionCookie(req: Request): boolean {
  const cookie = req.headers.cookie || '';
  return cookie.includes('connect.sid');
}

function isStaticAsset(path: string): boolean {
  const ext = getExtension(path);
  if (ext && STATIC_EXTENSIONS.has(ext)) {
    return true;
  }
  
  for (const prefix of STATIC_PREFIXES) {
    if (path.startsWith(prefix)) {
      return true;
    }
  }
  
  if (path.includes('.hot-update.')) {
    return true;
  }
  
  return false;
}

function isSessionFreeAPI(path: string): boolean {
  const normalizedPath = path.toLowerCase();
  return SESSION_FREE_API_PATHS.some(apiPath => 
    normalizedPath === apiPath || normalizedPath.startsWith(apiPath)
  );
}

function detectInternalRequest(req: Request, userAgent: string, hasInternalHeader: boolean): boolean {
  if (hasInternalHeader) {
    return true;
  }
  
  const ip = getClientIP(req);
  if (isInternalIP(ip)) {
    return true;
  }
  
  if (!userAgent || userAgent.length < 10) {
    return true;
  }
  
  const lowerUA = userAgent.toLowerCase();
  for (const pattern of INTERNAL_USER_AGENTS) {
    if (lowerUA.includes(pattern)) {
      return true;
    }
  }
  
  return false;
}

/**
 * ★ [2026-01-05 v3.2] 타임스탬프 캐시 버스팅 파라미터 감지
 * ?_t=1767653039282 형태의 파라미터가 있으면 캐시 버스팅 요청으로 판단
 */
function hasCacheBustParam(url: string): boolean {
  const queryStart = url.indexOf('?');
  if (queryStart === -1) return false;
  
  const queryString = url.slice(queryStart + 1);
  const params = queryString.split('&');
  
  for (const param of params) {
    const [key] = param.split('=');
    if (key && CACHE_BUST_PARAMS.includes(key.toLowerCase())) {
      return true;
    }
  }
  return false;
}

/**
 * Determines if a request should bypass session creation
 * CRITICAL: This function must be fast and aggressive to prevent session overflow
 * 
 * ★ [2026-01-05 v3.2] 강화된 세션 바이패스 로직:
 * - 타임스탬프 쿼리 파라미터 (?_t=xxx) 감지 및 스킵
 * - RPC 페이지 세션 스킵
 * - 공개 페이지 세션 스킵
 */
export function shouldBypassSession(req: Request): SessionBypassResult {
  const url = req.url || req.originalUrl || '/';
  const path = url.split('?')[0].toLowerCase();
  const method = req.method?.toUpperCase() || 'GET';
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();
  const accept = (req.headers['accept'] || '').toLowerCase();
  const hasInternalHeader = req.headers['x-internal-request'] === 'true';
  const hasSessionCookie = hasValidSessionCookie(req);
  
  // ★ [2026-01-06 CRITICAL FIX] PRIORITY -1: Auth-required paths NEVER skip session
  // This check MUST come before ALL other checks to ensure session is always loaded
  if (isAuthRequired(path)) {
    return { shouldSkip: false, reason: 'auth_required_priority', isInternalRequest: false, hasSessionCookie };
  }
  
  // ★ [PRIORITY 0] 타임스탬프 캐시 버스팅 파라미터가 있는 GET 요청 스킵
  // ?_t=1767653039282 형태의 요청은 브라우저 새로고침/탭 복구로 세션 불필요
  if (method === 'GET' && hasCacheBustParam(url) && !isAuthRequired(path)) {
    return { shouldSkip: true, reason: 'cache_bust_param', isInternalRequest: false, hasSessionCookie };
  }
  
  // Priority 1: WebSocket upgrade
  if (req.headers['upgrade']?.toLowerCase() === 'websocket') {
    return { shouldSkip: true, reason: 'websocket_upgrade', isInternalRequest: false, hasSessionCookie };
  }
  
  // Priority 2: Static assets (extensions)
  if (isStaticAsset(path)) {
    return { shouldSkip: true, reason: 'static_asset', isInternalRequest: false, hasSessionCookie };
  }
  
  // Priority 3: Session-free API paths (includes /rpc, /explorer, etc.)
  if (isSessionFreeAPI(path)) {
    return { shouldSkip: true, reason: 'session_free_api', isInternalRequest: false, hasSessionCookie };
  }
  
  // Priority 4: Internal requests (localhost, empty UA, axios, etc.)
  const isInternalRequest = detectInternalRequest(req, userAgent, hasInternalHeader);
  if (isInternalRequest && !isAuthRequired(path)) {
    return { shouldSkip: true, reason: 'internal_request', isInternalRequest: true, hasSessionCookie };
  }
  
  // Priority 5: Check if path requires authentication - DO NOT skip
  if (isAuthRequired(path)) {
    return { shouldSkip: false, reason: 'auth_required', isInternalRequest, hasSessionCookie };
  }
  
  // Priority 6: Preflight requests
  if (method === 'OPTIONS' || method === 'HEAD') {
    return { shouldSkip: true, reason: 'preflight_request', isInternalRequest, hasSessionCookie };
  }
  
  // Priority 7: Non-browser Accept header
  if (accept && !accept.includes('text/html') && !accept.includes('application/json')) {
    if (method === 'GET') {
      return { shouldSkip: true, reason: 'non_browser_accept', isInternalRequest, hasSessionCookie };
    }
  }
  
  // Priority 8: Production - unauthenticated API GET requests without cookie
  if (IS_PRODUCTION && method === 'GET' && path.startsWith('/api/') && !hasSessionCookie) {
    return { shouldSkip: true, reason: 'production_api_get_no_cookie', isInternalRequest, hasSessionCookie };
  }
  
  // Priority 9: Public HTML page without cookie
  if (!hasSessionCookie && method === 'GET') {
    const isHtmlRequest = accept.includes('text/html') || accept === '*/*' || accept === '';
    if (isHtmlRequest) {
      return { shouldSkip: true, reason: 'public_html_no_cookie', isInternalRequest, hasSessionCookie };
    }
  }
  
  // Priority 10: Has cookie but browsing (not auth path)
  if (hasSessionCookie && method === 'GET') {
    const authPaths = ['/api/auth', '/api/session', '/admin', '/login', '/api/user'];
    const isAuthPath = authPaths.some(p => path.startsWith(p));
    if (!isAuthPath) {
      return { shouldSkip: false, reason: 'existing_session', isInternalRequest, hasSessionCookie };
    }
  }
  
  // Default: Need session
  return { shouldSkip: false, reason: 'session_required', isInternalRequest, hasSessionCookie };
}

// ============================================================================
// Metrics Collection
// ============================================================================

interface SessionMetrics {
  totalRequests: number;
  skippedRequests: number;
  sessionRequests: number;
  skipReasons: Map<string, number>;
  lastReset: Date;
  memoryUsage: number;
  activeSessions: number;
}

const metrics: SessionMetrics = {
  totalRequests: 0,
  skippedRequests: 0,
  sessionRequests: 0,
  skipReasons: new Map(),
  lastReset: new Date(),
  memoryUsage: 0,
  activeSessions: 0,
};

export function updateMetrics(decision: SessionBypassResult): void {
  metrics.totalRequests++;
  
  if (decision.shouldSkip) {
    metrics.skippedRequests++;
    const count = metrics.skipReasons.get(decision.reason) || 0;
    metrics.skipReasons.set(decision.reason, count + 1);
  } else {
    metrics.sessionRequests++;
  }
  
  const heapUsed = process.memoryUsage().heapUsed;
  // ★ [2026-01-08] V8 힙 제한 사용
  const heapLimitBytes = (METRICS_CONFIG.HARDWARE.V8_HEAP_LIMIT_MB || 8240) * 1024 * 1024;
  metrics.memoryUsage = heapUsed / heapLimitBytes;
  
  // ★ [v3.0] 활성 세션 수 업데이트 - DR에서 정확한 용량 추적
  metrics.activeSessions = getSessionCount();
}

export function getSessionMetrics(): SessionMetrics & { skipRatio: number; skipReasonsObject: Record<string, number> } {
  const skipReasonsObject: Record<string, number> = {};
  metrics.skipReasons.forEach((value, key) => {
    skipReasonsObject[key] = value;
  });
  
  return {
    ...metrics,
    skipRatio: metrics.totalRequests > 0 
      ? metrics.skippedRequests / metrics.totalRequests 
      : 0,
    skipReasonsObject,
  };
}

export function resetMetrics(): void {
  metrics.totalRequests = 0;
  metrics.skippedRequests = 0;
  metrics.sessionRequests = 0;
  metrics.skipReasons.clear();
  metrics.lastReset = new Date();
}

// ============================================================================
// MemoryStore Management
// ============================================================================

let sessionStore: session.MemoryStore | any = null;

export function setSessionStore(store: session.MemoryStore | any): void {
  sessionStore = store;
}

export function getSessionCount(): number {
  if (!sessionStore) return 0;
  
  // Try to access internal sessions object
  const sessions = (sessionStore as any).sessions;
  if (sessions && typeof sessions === 'object') {
    return Object.keys(sessions).length;
  }
  
  // Try LRU cache
  const store = (sessionStore as any).store;
  if (store && typeof store.itemCount === 'number') {
    return store.itemCount;
  }
  
  return 0;
}

export function emergencySessionCleanup(targetPercentage: number = 0.3): number {
  if (!sessionStore) return 0;
  
  const sessions = (sessionStore as any).sessions;
  if (!sessions) {
    // Try LRU cache cleanup
    const store = (sessionStore as any).store;
    if (store && typeof store.prune === 'function') {
      store.prune();
      console.log(`[SESSION-BYPASS] Emergency prune executed on LRU cache`);
      return 0;
    }
    return 0;
  }
  
  const sessionIds = Object.keys(sessions);
  const deleteCount = Math.floor(sessionIds.length * targetPercentage);
  
  // Delete oldest sessions first
  const sortedIds = sessionIds.sort((a, b) => {
    try {
      const sessionA = JSON.parse(sessions[a]);
      const sessionB = JSON.parse(sessions[b]);
      const timeA = sessionA.cookie?.expires ? new Date(sessionA.cookie.expires).getTime() : 0;
      const timeB = sessionB.cookie?.expires ? new Date(sessionB.cookie.expires).getTime() : 0;
      return timeA - timeB;
    } catch {
      return 0;
    }
  });
  
  let deleted = 0;
  for (let i = 0; i < deleteCount && i < sortedIds.length; i++) {
    delete sessions[sortedIds[i]];
    deleted++;
  }
  
  console.log(`[SESSION-BYPASS] Emergency cleanup: deleted ${deleted} sessions`);
  return deleted;
}

export function forceClearAllSessions(memoryStoreRef?: any): void {
  const store = memoryStoreRef || sessionStore;
  if (!store) return;
  
  const sessions = (store as any).sessions;
  if (sessions) {
    const count = Object.keys(sessions).length;
    for (const key of Object.keys(sessions)) {
      delete sessions[key];
    }
    console.log(`[SESSION-BYPASS] CRITICAL: Cleared all ${count} sessions to prevent crash`);
    return;
  }
  
  // Try LRU cache
  const lruStore = (store as any).store;
  if (lruStore && typeof lruStore.reset === 'function') {
    lruStore.reset();
    console.log(`[SESSION-BYPASS] CRITICAL: Reset LRU cache to prevent crash`);
  }
}

// ============================================================================
// Set-Cookie Header Blocking
// ============================================================================

/**
 * Blocks Set-Cookie header from being sent
 * CRITICAL: This prevents session cookie leaks that cause MemoryStore overflow
 */
export function blockSetCookie(res: Response): void {
  const originalSetHeader = res.setHeader.bind(res);
  const originalWriteHead = res.writeHead?.bind(res);
  
  res.setHeader = function(name: string, value: any) {
    if (name.toLowerCase() === 'set-cookie') {
      // Filter out session cookies
      if (Array.isArray(value)) {
        value = value.filter((v: string) => !v.includes('connect.sid'));
        if (value.length === 0) return res;
      } else if (typeof value === 'string' && value.includes('connect.sid')) {
        return res;
      }
    }
    return originalSetHeader(name, value);
  };
  
  if (originalWriteHead) {
    (res as any).writeHead = function(statusCode: number, ...args: any[]) {
      const headers = args.find(arg => typeof arg === 'object' && !Array.isArray(arg));
      if (headers) {
        for (const key of Object.keys(headers)) {
          if (key.toLowerCase() === 'set-cookie') {
            const value = headers[key];
            if (Array.isArray(value)) {
              headers[key] = value.filter((v: string) => !v.includes('connect.sid'));
              if (headers[key].length === 0) delete headers[key];
            } else if (typeof value === 'string' && value.includes('connect.sid')) {
              delete headers[key];
            }
          }
        }
      }
      
      res.removeHeader('Set-Cookie');
      res.removeHeader('set-cookie');
      
      return originalWriteHead(statusCode, ...args);
    };
  }
  
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

let lastCapacityWarning = 0;
const CAPACITY_WARNING_INTERVAL = 60000;

export function checkMemoryStoreCapacity(
  currentSessions: number,
  maxSessions: number
): { isWarning: boolean; isCritical: boolean; percentUsed: number } {
  const percentUsed = currentSessions / maxSessions;
  const isWarning = percentUsed >= CONFIG.MEMORY_WARNING_THRESHOLD;
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

// ============================================================================
// Emergency Cleanup Tracking
// ============================================================================

let lastEmergencyCleanup = 0;
const EMERGENCY_CLEANUP_INTERVAL = 30000;
let emergencyCleanupCount = 0;

export function performEmergencyCleanup(
  memoryStoreRef: any,
  currentSessions: number,
  maxSessions: number
): number {
  const percentUsed = currentSessions / maxSessions;
  const now = Date.now();
  
  if (percentUsed < 0.8 || now - lastEmergencyCleanup < EMERGENCY_CLEANUP_INTERVAL) {
    return 0;
  }
  
  lastEmergencyCleanup = now;
  emergencyCleanupCount++;
  
  console.log(`[SESSION-BYPASS] Performing emergency cleanup #${emergencyCleanupCount} at ${(percentUsed * 100).toFixed(1)}% capacity`);
  
  try {
    const store = (memoryStoreRef as any).store;
    if (store && typeof store.prune === 'function') {
      store.prune();
    }
    
    // Also trigger GC if available
    if (global.gc) {
      global.gc();
    }
    
    return 1;
  } catch (error) {
    console.error('[SESSION-BYPASS] Emergency cleanup error:', error);
    return 0;
  }
}

// ============================================================================
// Session Bypass Middleware Factory
// ============================================================================

export interface SessionBypassOptions {
  sessionMiddleware: RequestHandler;
  enableMetrics?: boolean;
  enableEmergencyCleanup?: boolean;
  cleanupInterval?: number;
}

export function createSessionBypassMiddleware(options: SessionBypassOptions): RequestHandler {
  const {
    sessionMiddleware,
    enableMetrics = true,
    enableEmergencyCleanup = true,
    cleanupInterval = CONFIG.SESSION_CLEANUP_INTERVAL,
  } = options;
  
  // Set up periodic cleanup
  if (enableEmergencyCleanup) {
    setInterval(() => {
      const sessionCount = getSessionCount();
      metrics.activeSessions = sessionCount;
      
      const heapUsed = process.memoryUsage().heapUsed;
      // ★ [2026-01-08] V8 힙 제한 사용
      const heapLimitBytes = (METRICS_CONFIG.HARDWARE.V8_HEAP_LIMIT_MB || 8240) * 1024 * 1024;
      const memoryRatio = heapUsed / heapLimitBytes;
      
      // Session count based cleanup
      if (sessionCount > CONFIG.MAX_SESSIONS) {
        console.log(`[SESSION-BYPASS] Session count (${sessionCount}) exceeds max (${CONFIG.MAX_SESSIONS})`);
        emergencySessionCleanup(0.5);
      }
      
      // Memory based cleanup
      if (memoryRatio > CONFIG.MEMORY_EMERGENCY_THRESHOLD) {
        console.log(`[SESSION-BYPASS] EMERGENCY: Memory at ${(memoryRatio * 100).toFixed(1)}%`);
        forceClearAllSessions();
      } else if (memoryRatio > CONFIG.MEMORY_CRITICAL_THRESHOLD) {
        console.log(`[SESSION-BYPASS] CRITICAL: Memory at ${(memoryRatio * 100).toFixed(1)}%`);
        emergencySessionCleanup(0.5);
      } else if (memoryRatio > CONFIG.MEMORY_WARNING_THRESHOLD) {
        console.log(`[SESSION-BYPASS] WARNING: Memory at ${(memoryRatio * 100).toFixed(1)}%`);
        emergencySessionCleanup(0.3);
      }
      
    }, cleanupInterval);
  }
  
  console.log('[SESSION-BYPASS] Middleware initialized v3.0.0');
  console.log(`[SESSION-BYPASS] Environment: ${ENVIRONMENT.nodeEnv}, Replit: ${ENVIRONMENT.isReplit}, Production: ${ENVIRONMENT.isProduction}`);
  
  return (req: Request, res: Response, next: NextFunction) => {
    const decision = shouldBypassSession(req);
    
    if (enableMetrics) {
      updateMetrics(decision);
    }
    
    if (decision.shouldSkip) {
      // Block Set-Cookie header
      blockSetCookie(res);
      
      // Provide fake session object
      (req as any).session = createSkipSession();
      
      return next();
    }
    
    // Use actual session middleware
    return sessionMiddleware(req, res, next);
  };
}

// ============================================================================
// Health Check Endpoint Data
// ============================================================================

export function getSessionHealthData(): {
  healthy: boolean;
  metrics: {
    totalRequests: number;
    skippedRequests: number;
    sessionRequests: number;
    skipRatio: string;
    activeSessions: number;
    skipReasons: Record<string, number>;
  };
  memory: {
    heapUsed: number;
    heapTotal: number;
    heapPercent: number;
    rss: number;
  };
  config: {
    maxSessions: number;
    isProduction: boolean;
    sessionStoreType: string;
  };
} {
  const mem = process.memoryUsage();
  const metricsData = getSessionMetrics();
  
  // ★ [2026-01-08] V8 힙 제한 사용
  const heapLimitBytes = (METRICS_CONFIG.HARDWARE.V8_HEAP_LIMIT_MB || 8240) * 1024 * 1024;
  const heapPercent = (mem.heapUsed / heapLimitBytes) * 100;
  const healthy = heapPercent < 90 && metricsData.activeSessions < CONFIG.MAX_SESSIONS * 0.9;
  
  // ★ [2026-01-08] V8 힙 제한 사용 (표시용)
  const heapLimitMB = METRICS_CONFIG.HARDWARE.V8_HEAP_LIMIT_MB || 8240;
  
  return {
    healthy,
    metrics: {
      totalRequests: metricsData.totalRequests,
      skippedRequests: metricsData.skippedRequests,
      sessionRequests: metricsData.sessionRequests,
      skipRatio: (metricsData.skipRatio * 100).toFixed(2) + '%',
      activeSessions: metricsData.activeSessions,
      skipReasons: metricsData.skipReasonsObject,
    },
    memory: {
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotal: Math.round(heapLimitMB),
      heapPercent: Math.round(heapPercent),
      rss: Math.round(mem.rss / 1024 / 1024),
    },
    config: {
      maxSessions: CONFIG.MAX_SESSIONS,
      isProduction: IS_PRODUCTION,
      sessionStoreType: sessionStore ? 'configured' : 'not_set',
    },
  };
}

// Also export legacy names for backward compatibility
export const ALWAYS_SKIP_PREFIXES = [...STATIC_PREFIXES, ...SESSION_FREE_API_PATHS.map(p => p.endsWith('/') ? p : p)];
export const PUBLIC_API_PREFIXES = SESSION_FREE_API_PATHS;
export const EXACT_GET_PATHS = SESSION_FREE_API_PATHS;
export const AUTH_REQUIRED_PATTERNS = AUTH_REQUIRED_PATHS;
