/**
 * TBURN Enterprise Session Policy Module v1.0.0
 * 
 * CRITICAL: This is the SINGLE SOURCE OF TRUTH for all session bypass policies.
 * All three bypass layers (app.ts, session-bypass.ts, session-bypass-v4.ts) 
 * MUST consume these exports to ensure consistency.
 * 
 * Changes in v1.0.0:
 * - Consolidated AUTH_REQUIRED_PATHS from all modules
 * - Unified SESSION_FREE_PATHS with O(1) Set-based lookups
 * - CIDR-aware trusted IP validation
 * - Single cookie validation function
 * - Prometheus-compatible metrics
 * 
 * @author TBURN Development Team
 * @version 1.0.0
 * @date 2026-01-06
 */

import { Request } from 'express';
import * as fs from 'fs';

// ============================================================================
// Environment Detection (Unified across all modules)
// ============================================================================

export interface EnvironmentInfo {
  isProduction: boolean;
  isReplit: boolean;
  isDocker: boolean;
  isKubernetes: boolean;
  isHeroku: boolean;
  isVercel: boolean;
  hostname: string;
  nodeEnv: string;
  detectionMethod: string;
}

function detectEnvironment(): EnvironmentInfo {
  const env = process.env;
  
  let isDocker = false;
  try {
    isDocker = env.DOCKER === '1' || fs.existsSync('/.dockerenv');
  } catch {
    isDocker = env.DOCKER === '1';
  }
  
  const isReplit = !!(
    env.REPL_SLUG ||
    env.REPL_ID ||
    env.REPLIT_DEPLOYMENT === '1' ||
    env.REPLIT_DEV_DOMAIN ||
    env.REPLIT_DB_URL
  );
  
  const isKubernetes = !!(env.KUBERNETES_SERVICE_HOST || env.KUBERNETES_PORT);
  const isHeroku = !!env.DYNO;
  const isVercel = !!(env.VERCEL || env.VERCEL_ENV);
  
  let isProduction = false;
  let detectionMethod = 'default';
  
  if (env.NODE_ENV === 'production') {
    isProduction = true;
    detectionMethod = 'NODE_ENV';
  } else if (isReplit) {
    isProduction = true;
    detectionMethod = 'REPLIT';
  } else if (isKubernetes) {
    isProduction = true;
    detectionMethod = 'KUBERNETES';
  } else if (isHeroku) {
    isProduction = true;
    detectionMethod = 'HEROKU';
  } else if (isVercel) {
    isProduction = true;
    detectionMethod = 'VERCEL';
  } else if (isDocker) {
    isProduction = true;
    detectionMethod = 'DOCKER';
  }
  
  return {
    isProduction,
    isReplit,
    isDocker,
    isKubernetes,
    isHeroku,
    isVercel,
    hostname: env.HOSTNAME || env.REPL_SLUG || 'unknown',
    nodeEnv: env.NODE_ENV || 'development',
    detectionMethod,
  };
}

export const ENVIRONMENT = detectEnvironment();
// ★ [2026-01-06 CRITICAL FIX] Replit 환경에서는 NODE_ENV와 관계없이 프로덕션으로 간주
export const IS_PRODUCTION = ENVIRONMENT.isProduction || ENVIRONMENT.isReplit;

// ============================================================================
// Configuration Constants
// ============================================================================

export const CONFIG = {
  MEMORY_WARNING_THRESHOLD: 0.70,
  MEMORY_CRITICAL_THRESHOLD: 0.85,
  MEMORY_EMERGENCY_THRESHOLD: 0.95,
  SESSION_MAX_AGE: 24 * 60 * 60 * 1000,
  SESSION_CLEANUP_INTERVAL: 60 * 1000,
  MAX_SESSIONS: 10000,
  TARGET_SKIP_RATIO: 0.95,
} as const;

// ============================================================================
// AUTH REQUIRED PATHS - NEVER SKIP SESSION FOR THESE
// ============================================================================

const AUTH_REQUIRED_PREFIX_LIST = [
  '/api/auth',
  '/api/session',
  '/api/user',
  '/api/admin',
  '/api/enterprise/admin',
  '/api/wallet',
  '/api/transaction',
  '/api/stake',
  '/api/governance/vote',
  '/api/governance/proposal',
  '/api/oauth',
  '/api/google',
  '/api/csrf',
  '/api/member',
  '/api/notifications',
  '/api/private',
  '/api/profile',
  '/api/settings',
  '/login',
  '/register',
  '/dashboard',
  '/profile',
  '/settings',
  '/admin',
  '/config',
  '/maintenance',
  '/logout',
  '/account',
] as const;

const AUTH_REQUIRED_PREFIXES_SET: Set<string> = new Set(AUTH_REQUIRED_PREFIX_LIST);
const AUTH_REQUIRED_PREFIXES_SORTED = [...AUTH_REQUIRED_PREFIX_LIST].sort((a, b) => b.length - a.length);

export function isAuthRequired(path: string): boolean {
  const normalizedPath = path.toLowerCase();
  
  if (AUTH_REQUIRED_PREFIXES_SET.has(normalizedPath)) {
    return true;
  }
  
  for (const prefix of AUTH_REQUIRED_PREFIXES_SORTED) {
    if (normalizedPath.startsWith(prefix)) {
      return true;
    }
  }
  
  return false;
}

// ============================================================================
// SESSION FREE PATHS - O(1) Set-based lookup
// ============================================================================

const SESSION_FREE_EXACT_PATHS = new Set([
  '/api/health',
  '/api/status',
  '/api/metrics',
  '/api/ping',
  '/api/version',
  '/api/info',
  '/api/warmup',
  '/api/investment-inquiry',
  '/health',
  '/healthz',
  '/readyz',
  '/livez',
  '/ready',
  '/live',
  '/status',
  '/ping',
  '/metrics',
  '/rpc',
  '/jsonrpc',
  '/json-rpc',
  '/ws',
  '/wss',
  '/api/websocket/prometheus',
]);

const SESSION_FREE_PREFIX_LIST = [
  '/api/blocks',
  '/api/transactions/public',
  '/api/transactions/recent',
  '/api/validators/list',
  '/api/validators/status',
  '/api/validators/stats',
  '/api/validators/public',
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
  '/api/enterprise-node/',
  '/api/gas',
  '/api/supply',
  '/api/chain/',
  '/api/stats',
  '/api/rpc',
  '/api/jsonrpc',
  '/api/sharding/',
  '/api/tmp-status',
  '/api/disaster-recovery/',
  '/api/memory/',
  '/rpc/',
  '/explorer/',
  '/blocks/',
  '/scan/',
  // External validator security sync (API key auth, not session auth)
  '/api/external-validators/security/my-status',
  '/api/external-validators/security/report',
  '/api/external-validators/security/heartbeat',
  '/api/external-validators/security/alerts/',
] as const;

const SESSION_FREE_PREFIXES_SORTED = [...SESSION_FREE_PREFIX_LIST].sort((a, b) => b.length - a.length);

export function isSessionFree(path: string): boolean {
  const normalizedPath = path.toLowerCase();
  
  if (SESSION_FREE_EXACT_PATHS.has(normalizedPath)) {
    return true;
  }
  
  for (const prefix of SESSION_FREE_PREFIXES_SORTED) {
    if (normalizedPath.startsWith(prefix)) {
      return true;
    }
  }
  
  return false;
}

// ============================================================================
// STATIC ASSETS - O(1) Set-based lookup
// ============================================================================

const STATIC_EXTENSIONS = new Set([
  '.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx',
  '.css', '.scss', '.sass', '.less',
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.avif',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  '.mp3', '.mp4', '.webm', '.ogg', '.wav',
  '.pdf', '.zip', '.gz', '.br', '.tar',
  '.json', '.xml', '.txt', '.md', '.yaml', '.yml',
  '.map', '.LICENSE', '.lock', '.wasm',
]);

const STATIC_PREFIXES = [
  '/assets/',
  '/static/',
  '/public/',
  '/dist/',
  '/build/',
  '/chunks/',
  '/_chunks/',
  '/js/',
  '/css/',
  '/__vite',
  '/@vite',
  '/@fs',
  '/@id/',
  '/@react-refresh',
  '/node_modules/',
  '/_next/',
  '/favicon',
  '/robots.txt',
  '/sitemap',
  '/manifest',
  '/.well-known/',
  '/sw.js',
  '/workbox-',
  '/fonts/',
  '/images/',
  '/icons/',
  '/media/',
  '/src/',
] as const;

export function isStaticAsset(path: string): boolean {
  const lastDot = path.lastIndexOf('.');
  if (lastDot !== -1) {
    const ext = path.slice(lastDot).toLowerCase().split('?')[0];
    if (STATIC_EXTENSIONS.has(ext)) {
      return true;
    }
  }
  
  for (const prefix of STATIC_PREFIXES) {
    if (path.startsWith(prefix)) {
      return true;
    }
  }
  
  return false;
}

// ============================================================================
// INTERNAL USER AGENTS - O(1) Set-based detection
// ============================================================================

const INTERNAL_USER_AGENTS_SET = new Set([
  'axios', 'node-fetch', 'got', 'superagent', 'request', 'undici',
  'needle', 'bent', 'phin', 'ky', 'wretch', 'cross-fetch',
  'curl', 'wget', 'httpie', 'postman', 'insomnia',
  'uptimerobot', 'pingdom', 'newrelic', 'datadog', 'prometheus',
  'grafana', 'zabbix', 'nagios', 'healthcheck', 'kube-probe',
  'googlehc', 'amazon-route53', 'statuscake',
  'replit', 'heroku', 'vercel', 'netlify', 'cloudflare',
  'googlebot', 'bingbot', 'yandexbot', 'duckduckbot', 'baiduspider',
  'facebookexternalhit', 'twitterbot', 'linkedinbot',
  'slackbot', 'discordbot', 'telegrambot', 'whatsapp', 'applebot',
  'gptbot', 'claudebot', 'chatgpt', 'anthropic',
  'playwright', 'puppeteer', 'selenium', 'cypress',
  'jest', 'mocha', 'vitest',
]);

const BOT_PATTERNS = ['bot', 'crawler', 'spider', 'monitor', 'check', 'probe', 'health'];

const INTERNAL_USER_AGENTS_ARRAY = Array.from(INTERNAL_USER_AGENTS_SET);

export function isInternalUserAgent(userAgent: string): boolean {
  if (!userAgent) return true;
  
  const ua = userAgent.toLowerCase();
  
  for (const agent of INTERNAL_USER_AGENTS_ARRAY) {
    if (ua.includes(agent)) {
      return true;
    }
  }
  
  for (const pattern of BOT_PATTERNS) {
    if (ua.includes(pattern)) {
      return true;
    }
  }
  
  return false;
}

// ============================================================================
// TRUSTED IP VALIDATION - CIDR-aware
// ============================================================================

interface CIDRRange {
  network: number[];
  maskBits: number;
  isIPv6: boolean;
}

const TRUSTED_CIDR_RANGES: CIDRRange[] = [
  { network: [127, 0, 0, 0], maskBits: 8, isIPv6: false },
  { network: [10, 0, 0, 0], maskBits: 8, isIPv6: false },
  { network: [172, 16, 0, 0], maskBits: 12, isIPv6: false },
  { network: [192, 168, 0, 0], maskBits: 16, isIPv6: false },
  { network: [0, 0, 0, 0], maskBits: 32, isIPv6: false },
];

function parseIPv4(ip: string): number[] | null {
  const cleanIP = ip.replace(/^::ffff:/, '');
  const parts = cleanIP.split('.').map(Number);
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
    return null;
  }
  return parts;
}

function ipMatchesCIDR(ip: number[], cidr: CIDRRange): boolean {
  if (cidr.isIPv6) return false;
  
  const fullMaskBits = cidr.maskBits;
  const fullBytes = Math.floor(fullMaskBits / 8);
  const remainingBits = fullMaskBits % 8;
  
  for (let i = 0; i < fullBytes; i++) {
    if (ip[i] !== cidr.network[i]) return false;
  }
  
  if (remainingBits > 0 && fullBytes < 4) {
    const mask = 0xFF << (8 - remainingBits);
    if ((ip[fullBytes] & mask) !== (cidr.network[fullBytes] & mask)) {
      return false;
    }
  }
  
  return true;
}

export function isTrustedIP(ip: string | undefined): boolean {
  if (!ip) return false;
  
  const cleanIP = ip.split(',')[0].trim();
  
  if (cleanIP === '::1' || cleanIP === 'localhost') {
    return true;
  }
  
  const parsed = parseIPv4(cleanIP);
  if (!parsed) return false;
  
  for (const cidr of TRUSTED_CIDR_RANGES) {
    if (ipMatchesCIDR(parsed, cidr)) {
      return true;
    }
  }
  
  return false;
}

// ============================================================================
// COOKIE VALIDATION - Centralized
// ============================================================================

export function hasValidSessionCookie(req: Request): boolean {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return false;
  
  return cookieHeader.includes('connect.sid=s%3A') || 
         cookieHeader.includes('connect.sid=s:');
}

export function getSessionIdFromCookie(req: Request): string | null {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  
  const match = cookieHeader.match(/connect\.sid=([^;]+)/);
  if (!match) return null;
  
  return decodeURIComponent(match[1]);
}

// ============================================================================
// CACHE BUST PARAMETER DETECTION
// ============================================================================

const CACHE_BUST_PARAMS = new Set([
  '_t', '_', 't', 'timestamp', 'ts', 'cachebust', 'cb', 'nocache', 'nc',
  'v', 'ver', 'version', 'bust', 'rand', 'random', 'r', 'nonce',
]);

export function hasCacheBustParam(url: string): boolean {
  const queryStart = url.indexOf('?');
  if (queryStart === -1) return false;
  
  const queryString = url.slice(queryStart + 1);
  const params = queryString.split('&');
  
  for (const param of params) {
    const key = param.split('=')[0].toLowerCase();
    if (CACHE_BUST_PARAMS.has(key)) {
      return true;
    }
  }
  
  return false;
}

// ============================================================================
// X-SKIP-SESSION HEADER VALIDATION
// ============================================================================

export function isValidSkipSessionHeader(req: Request): boolean {
  const skipHeader = req.headers['x-skip-session'];
  if (skipHeader !== 'true' && skipHeader !== '1') {
    return false;
  }
  
  const clientIP = req.ip || 
                   req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
                   req.socket.remoteAddress;
  
  if (!isTrustedIP(clientIP)) {
    console.warn(`[SessionPolicy] Untrusted IP attempted X-Skip-Session: ${clientIP}`);
    return false;
  }
  
  const internalHeader = req.headers['x-internal-request'];
  if (internalHeader === 'true') {
    return true;
  }
  
  return isTrustedIP(clientIP);
}

// ============================================================================
// UNIFIED BYPASS DECISION
// ============================================================================

export interface BypassDecision {
  shouldSkip: boolean;
  reason: string;
  isInternalRequest: boolean;
  hasSessionCookie: boolean;
  priority: number;
}

export function makeBypassDecision(req: Request): BypassDecision {
  const url = req.url || req.originalUrl || '/';
  const path = url.split('?')[0].toLowerCase();
  const method = req.method?.toUpperCase() || 'GET';
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();
  const hasSessionCookie = hasValidSessionCookie(req);
  
  const clientIP = req.ip || 
                   req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
                   req.socket.remoteAddress;
  const isInternalIP = isTrustedIP(clientIP);
  const isInternalUA = isInternalUserAgent(userAgent);
  const isInternalRequest = isInternalIP || isInternalUA;
  
  if (isAuthRequired(path)) {
    return { 
      shouldSkip: false, 
      reason: 'auth_required', 
      isInternalRequest, 
      hasSessionCookie,
      priority: -1 
    };
  }
  
  if (req.headers['upgrade']?.toLowerCase() === 'websocket') {
    return { 
      shouldSkip: true, 
      reason: 'websocket_upgrade', 
      isInternalRequest, 
      hasSessionCookie,
      priority: 0 
    };
  }
  
  if (isStaticAsset(path)) {
    return { 
      shouldSkip: true, 
      reason: 'static_asset', 
      isInternalRequest, 
      hasSessionCookie,
      priority: 1 
    };
  }
  
  if (method === 'GET' && hasCacheBustParam(url)) {
    return { 
      shouldSkip: true, 
      reason: 'cache_bust_param', 
      isInternalRequest, 
      hasSessionCookie,
      priority: 2 
    };
  }
  
  if (isSessionFree(path)) {
    return { 
      shouldSkip: true, 
      reason: 'session_free_path', 
      isInternalRequest, 
      hasSessionCookie,
      priority: 3 
    };
  }
  
  if (isValidSkipSessionHeader(req)) {
    return { 
      shouldSkip: true, 
      reason: 'valid_skip_header', 
      isInternalRequest, 
      hasSessionCookie,
      priority: 4 
    };
  }
  
  if (isInternalRequest && method === 'GET') {
    return { 
      shouldSkip: true, 
      reason: 'internal_request', 
      isInternalRequest, 
      hasSessionCookie,
      priority: 5 
    };
  }
  
  if (method === 'OPTIONS' || method === 'HEAD') {
    return { 
      shouldSkip: true, 
      reason: 'preflight_request', 
      isInternalRequest, 
      hasSessionCookie,
      priority: 6 
    };
  }
  
  if (IS_PRODUCTION && method === 'GET' && path.startsWith('/api/') && !hasSessionCookie) {
    return { 
      shouldSkip: true, 
      reason: 'production_api_get_no_cookie', 
      isInternalRequest, 
      hasSessionCookie,
      priority: 7 
    };
  }
  
  if (!hasSessionCookie && method === 'GET') {
    const accept = (req.headers['accept'] || '').toLowerCase();
    const isHtmlRequest = accept.includes('text/html') || accept === '*/*' || accept === '';
    if (isHtmlRequest) {
      return { 
        shouldSkip: true, 
        reason: 'public_html_no_cookie', 
        isInternalRequest, 
        hasSessionCookie,
        priority: 8 
      };
    }
  }
  
  return { 
    shouldSkip: false, 
    reason: 'session_required', 
    isInternalRequest, 
    hasSessionCookie,
    priority: 100 
  };
}

// ============================================================================
// METRICS COLLECTION
// ============================================================================

interface PolicyMetrics {
  totalRequests: number;
  bypassedRequests: number;
  sessionRequests: number;
  bypassReasons: Map<string, number>;
  authRequiredHits: number;
  lastResetTime: number;
}

const metrics: PolicyMetrics = {
  totalRequests: 0,
  bypassedRequests: 0,
  sessionRequests: 0,
  bypassReasons: new Map(),
  authRequiredHits: 0,
  lastResetTime: Date.now(),
};

export function recordBypassDecision(decision: BypassDecision): void {
  metrics.totalRequests++;
  
  if (decision.shouldSkip) {
    metrics.bypassedRequests++;
  } else {
    metrics.sessionRequests++;
    if (decision.reason === 'auth_required') {
      metrics.authRequiredHits++;
    }
  }
  
  const count = metrics.bypassReasons.get(decision.reason) || 0;
  metrics.bypassReasons.set(decision.reason, count + 1);
}

export function getBypassMetrics(): {
  skipRatio: number;
  totalRequests: number;
  bypassedRequests: number;
  sessionRequests: number;
  authRequiredHits: number;
  bypassReasons: Record<string, number>;
  uptimeSeconds: number;
} {
  const uptimeSeconds = Math.floor((Date.now() - metrics.lastResetTime) / 1000);
  const skipRatio = metrics.totalRequests > 0 
    ? metrics.bypassedRequests / metrics.totalRequests 
    : 0;
  
  return {
    skipRatio,
    totalRequests: metrics.totalRequests,
    bypassedRequests: metrics.bypassedRequests,
    sessionRequests: metrics.sessionRequests,
    authRequiredHits: metrics.authRequiredHits,
    bypassReasons: Object.fromEntries(metrics.bypassReasons),
    uptimeSeconds,
  };
}

export function resetMetrics(): void {
  metrics.totalRequests = 0;
  metrics.bypassedRequests = 0;
  metrics.sessionRequests = 0;
  metrics.bypassReasons.clear();
  metrics.authRequiredHits = 0;
  metrics.lastResetTime = Date.now();
}

// ============================================================================
// PROMETHEUS EXPORT
// ============================================================================

export function getPrometheusMetrics(): string {
  const m = getBypassMetrics();
  
  let output = '';
  output += '# HELP tburn_session_bypass_total Total session bypass decisions\n';
  output += '# TYPE tburn_session_bypass_total counter\n';
  output += `tburn_session_bypass_total{result="skipped"} ${m.bypassedRequests}\n`;
  output += `tburn_session_bypass_total{result="session"} ${m.sessionRequests}\n`;
  output += '\n';
  
  output += '# HELP tburn_session_skip_ratio Session skip ratio\n';
  output += '# TYPE tburn_session_skip_ratio gauge\n';
  output += `tburn_session_skip_ratio ${m.skipRatio.toFixed(4)}\n`;
  output += '\n';
  
  output += '# HELP tburn_auth_required_hits Auth-required path hits\n';
  output += '# TYPE tburn_auth_required_hits counter\n';
  output += `tburn_auth_required_hits ${m.authRequiredHits}\n`;
  output += '\n';
  
  output += '# HELP tburn_session_bypass_by_reason Bypass decisions by reason\n';
  output += '# TYPE tburn_session_bypass_by_reason counter\n';
  for (const [reason, count] of Object.entries(m.bypassReasons)) {
    output += `tburn_session_bypass_by_reason{reason="${reason}"} ${count}\n`;
  }
  
  return output;
}

// ============================================================================
// ENTERPRISE LOGGING SYSTEM
// ============================================================================

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4,
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  context?: Record<string, unknown>;
}

const LOG_BUFFER: LogEntry[] = [];
const MAX_LOG_BUFFER = 1000;
let currentLogLevel = IS_PRODUCTION ? LogLevel.INFO : LogLevel.DEBUG;

export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level;
}

function formatLog(entry: LogEntry): string {
  const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];
  const levelName = levelNames[entry.level] || 'UNKNOWN';
  const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
  return `[${entry.timestamp}] [${levelName}] [${entry.module}] ${entry.message}${contextStr}`;
}

function log(level: LogLevel, module: string, message: string, context?: Record<string, unknown>): void {
  if (level < currentLogLevel) return;
  
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    module,
    message,
    context,
  };
  
  LOG_BUFFER.push(entry);
  if (LOG_BUFFER.length > MAX_LOG_BUFFER) {
    LOG_BUFFER.shift();
  }
  
  const formatted = formatLog(entry);
  switch (level) {
    case LogLevel.ERROR:
    case LogLevel.CRITICAL:
      console.error(formatted);
      break;
    case LogLevel.WARN:
      console.warn(formatted);
      break;
    default:
      console.log(formatted);
  }
}

export const logger = {
  debug: (module: string, message: string, context?: Record<string, unknown>) => 
    log(LogLevel.DEBUG, module, message, context),
  info: (module: string, message: string, context?: Record<string, unknown>) => 
    log(LogLevel.INFO, module, message, context),
  warn: (module: string, message: string, context?: Record<string, unknown>) => 
    log(LogLevel.WARN, module, message, context),
  error: (module: string, message: string, context?: Record<string, unknown>) => 
    log(LogLevel.ERROR, module, message, context),
  critical: (module: string, message: string, context?: Record<string, unknown>) => 
    log(LogLevel.CRITICAL, module, message, context),
};

export function getRecentLogs(count: number = 100, minLevel: LogLevel = LogLevel.INFO): LogEntry[] {
  return LOG_BUFFER
    .filter(entry => entry.level >= minLevel)
    .slice(-count);
}

export function getLogsPrometheus(): string {
  const counts = { DEBUG: 0, INFO: 0, WARN: 0, ERROR: 0, CRITICAL: 0 };
  for (const entry of LOG_BUFFER) {
    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];
    const levelName = levelNames[entry.level] || 'UNKNOWN';
    if (levelName in counts) {
      counts[levelName as keyof typeof counts]++;
    }
  }
  
  let output = '# HELP tburn_session_policy_logs_total Log entries by level\n';
  output += '# TYPE tburn_session_policy_logs_total counter\n';
  for (const [level, count] of Object.entries(counts)) {
    output += `tburn_session_policy_logs_total{level="${level}"} ${count}\n`;
  }
  return output;
}

// ============================================================================
// EXPORTS FOR BACKWARD COMPATIBILITY
// ============================================================================

export const AUTH_REQUIRED_PATTERNS = AUTH_REQUIRED_PREFIX_LIST;
export const SESSION_FREE_API_PATHS = SESSION_FREE_PREFIX_LIST;
export const STATIC_PREFIXES_LIST = STATIC_PREFIXES;
