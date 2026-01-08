/**
 * TBURN Mainnet Session Bypass Middleware v4.1
 * Enterprise-grade production session management with Disaster Recovery
 * 
 * FIXES:
 * - /rpc?_t=timestamp requests causing MemoryStore overflow
 * - Middleware order issues (session-bypass BEFORE session)
 * - Set-Cookie header still being issued
 * - Production detection mismatch with app.ts
 * 
 * Changes in v4.1:
 * - ★ [2026-01-06] Integrated with centralized session-policy.ts module
 * - Uses shared isAuthRequired function for consistent policy
 * 
 * Target: ≥98% session skip ratio, 99.95% uptime
 * 
 * @author TBURN Development Team
 * @version 4.1.0
 * @date 2026-01-06
 */

import { Request, Response, NextFunction, RequestHandler } from 'express';
import * as sessionModule from 'express-session';
import { EventEmitter } from 'events';
import { METRICS_CONFIG } from '../memory/metrics-config';

// ★ [2026-01-06] Import centralized policy functions
import {
  isAuthRequired as policyIsAuthRequired,
} from './session-policy';

type SessionStore = sessionModule.Store;

export const CONFIG = {
  MEMORY_WARNING_THRESHOLD: 0.60,
  MEMORY_CRITICAL_THRESHOLD: 0.75,
  MEMORY_EMERGENCY_THRESHOLD: 0.85,
  MEMORY_FATAL_THRESHOLD: 0.92,
  SESSION_MAX_AGE: 24 * 60 * 60 * 1000,
  SESSION_CLEANUP_INTERVAL: 30 * 1000,
  MAX_SESSIONS: 5000,
  EMERGENCY_MAX_SESSIONS: 2000,
  TARGET_SKIP_RATIO: 0.98,
  DR_HEALTH_CHECK_INTERVAL: 10 * 1000,
  DR_AUTO_RESTART_THRESHOLD: 3,
  DR_CIRCUIT_BREAKER_TIMEOUT: 60 * 1000,
} as const;

export interface EnvironmentInfo {
  isProduction: boolean;
  isReplit: boolean;
  isDocker: boolean;
  isKubernetes: boolean;
  isHeroku: boolean;
  isVercel: boolean;
  isRender: boolean;
  isRailway: boolean;
  hostname: string;
  nodeEnv: string;
  detectionMethod: string;
}

function detectEnvironment(): EnvironmentInfo {
  const env = process.env;
  let fs: any;
  try {
    fs = require('fs');
  } catch {
    fs = null;
  }
  
  const isReplit = !!(
    env.REPL_SLUG ||
    env.REPL_ID ||
    env.REPL_OWNER ||
    env.REPLIT_DEPLOYMENT === '1' ||
    env.REPLIT_DEV_DOMAIN ||
    env.REPLIT_DB_URL
  );
  
  const isDocker = !!(
    env.DOCKER === '1' ||
    (fs?.existsSync && fs.existsSync('/.dockerenv'))
  );
  
  const isKubernetes = !!(
    env.KUBERNETES_SERVICE_HOST ||
    env.KUBERNETES_PORT
  );
  
  const isHeroku = !!(env.DYNO);
  const isVercel = !!(env.VERCEL || env.VERCEL_ENV);
  const isRender = !!(env.RENDER);
  const isRailway = !!(env.RAILWAY_ENVIRONMENT);
  
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
  } else if (isRender) {
    isProduction = true;
    detectionMethod = 'RENDER';
  } else if (isRailway) {
    isProduction = true;
    detectionMethod = 'RAILWAY';
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
    isRender,
    isRailway,
    hostname: env.HOSTNAME || env.REPL_SLUG || 'unknown',
    nodeEnv: env.NODE_ENV || 'development',
    detectionMethod,
  };
}

export const ENVIRONMENT = detectEnvironment();

const STATIC_EXTENSIONS = new Set([
  '.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx',
  '.css', '.scss', '.sass', '.less', '.styl',
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.avif', '.bmp', '.tiff',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  '.mp3', '.mp4', '.webm', '.ogg', '.wav', '.flac', '.aac', '.m4a', '.avi', '.mov',
  '.pdf', '.zip', '.gz', '.br', '.tar', '.rar', '.7z',
  '.json', '.xml', '.txt', '.md', '.yaml', '.yml', '.csv', '.tsv',
  '.map', '.LICENSE', '.lock', '.wasm',
]);

const STATIC_PREFIXES = [
  '/assets/', '/static/', '/public/', '/dist/', '/build/',
  '/chunks/', '/_chunks/', '/js/', '/css/',
  '/__vite', '/@vite/', '/@fs/', '/@id/', '/@react-refresh',
  '/node_modules/.vite/', '/node_modules/',
  '/_next/',
  '/favicon', '/robots.txt', '/sitemap', '/manifest',
  '/.well-known/', '/sw.js', '/workbox-',
  '/fonts/', '/images/', '/icons/', '/media/',
  '/*.map',
];

const RPC_AND_STATELESS_PATHS = [
  '/rpc', '/rpc/', '/jsonrpc', '/json-rpc', '/api/rpc', '/api/jsonrpc',
  '/v1/rpc', '/v2/rpc', '/eth', '/eth/',
  '/ws', '/ws/', '/wss', '/socket', '/socket.io',
  '/api/health', '/api/status', '/api/metrics', '/api/ping', '/api/version', '/api/info',
  '/health', '/healthz', '/readyz', '/livez', '/ready', '/live', '/status', '/ping', '/metrics',
  '/api/blocks', '/api/block/', '/api/transactions/public', '/api/tx/', '/api/txs',
  '/api/validators/list', '/api/validators/public', '/api/network/stats', '/api/network/info',
  '/api/price', '/api/market', '/api/explorer/', '/api/chain/', '/api/stats', '/api/supply', '/api/gas',
  '/api/production-monitor/', '/api/session-health', '/api/disaster-recovery/',
  '/explorer', '/explorer/', '/scan', '/scan/', '/blocks', '/transactions', '/validators',
  '/staking', '/governance', '/bridge', '/community', '/docs', '/api-docs', '/sdk', '/cli',
];

const INTERNAL_USER_AGENTS = [
  'axios', 'node-fetch', 'got', 'superagent', 'request', 'undici',
  'needle', 'bent', 'phin', 'ky', 'wretch', 'cross-fetch',
  'curl', 'wget', 'httpie', 'postman', 'insomnia', 'httpx',
  'uptimerobot', 'pingdom', 'newrelic', 'datadog', 'prometheus',
  'grafana', 'zabbix', 'nagios', 'healthcheck', 'kube-probe',
  'googlehc', 'amazon-route53', 'statuscake', 'freshping',
  'betteruptime', 'cronitor', 'healthchecks.io',
  'replit', 'heroku', 'vercel', 'netlify', 'cloudflare',
  'aws', 'azure', 'gcp', 'digitalocean', 'render', 'railway',
  'googlebot', 'bingbot', 'yandexbot', 'duckduckbot', 'baiduspider',
  'slurp', 'facebookexternalhit', 'twitterbot', 'linkedinbot',
  'slackbot', 'discordbot', 'telegrambot', 'whatsapp', 'applebot',
  'semrushbot', 'ahrefsbot', 'mj12bot', 'dotbot', 'petalbot',
  'bytespider', 'gptbot', 'claudebot', 'chatgpt', 'anthropic',
  'ccbot', 'ia_archiver', 'archive.org',
  'ethers', 'web3', 'hardhat', 'truffle', 'foundry', 'brownie',
  'metamask', 'walletconnect', 'rainbow', 'coinbase',
  'playwright', 'puppeteer', 'selenium', 'cypress', 'webdriver',
  'jest', 'mocha', 'vitest', 'supertest', 'k6', 'artillery',
];

const INTERNAL_IP_PATTERNS = [
  /^127\./, /^10\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./,
  /^::1$/, /^::ffff:127\./, /^fe80:/i, /^fc00:/i, /^fd00:/i,
  /^0\.0\.0\.0$/, /^localhost$/i,
];

const CACHE_BUST_PARAMS = [
  '_t', '_', 't', 'timestamp', 'ts', 'cachebust', 'cb', 'nocache', 'nc',
  'v', 'ver', 'version', 'bust', 'rand', 'random', 'r', 'nonce',
];

const AUTH_REQUIRED_PATHS = [
  '/api/auth/', '/api/session', '/api/user', '/api/admin',
  '/api/enterprise/admin',  // Enterprise admin portal routes require authentication
  '/api/wallet/private', '/api/transaction/sign', '/api/stake/manage',
  '/api/governance/vote', '/api/profile', '/api/settings',
  '/api/notifications', '/api/private/',
  '/login', '/register', '/dashboard', '/profile', '/settings',
  '/admin', '/account',
];

let sessionStore: sessionModule.MemoryStore | null = null;

export function setSessionStore(store: sessionModule.MemoryStore): void {
  sessionStore = store;
}

export function getSessionStore(): sessionModule.MemoryStore | null {
  return sessionStore;
}

class SessionMetricsCollector extends EventEmitter {
  private _totalRequests = 0;
  private _skippedRequests = 0;
  private _sessionRequests = 0;
  private _activeSessions = 0;
  private _skipReasons = new Map<string, number>();
  private _lastHealthCheck = Date.now();
  private _consecutiveFailures = 0;
  private _circuitBreakerOpen = false;
  private _circuitBreakerOpenedAt = 0;
  
  get totalRequests() { return this._totalRequests; }
  get skippedRequests() { return this._skippedRequests; }
  get sessionRequests() { return this._sessionRequests; }
  get activeSessions() { return this._activeSessions; }
  set activeSessions(val: number) { this._activeSessions = val; }
  get skipReasons() { return this._skipReasons; }
  
  get skipRatio(): number {
    return this._totalRequests > 0 ? this._skippedRequests / this._totalRequests : 0;
  }
  
  get isCircuitBreakerOpen(): boolean {
    if (this._circuitBreakerOpen) {
      if (Date.now() - this._circuitBreakerOpenedAt > CONFIG.DR_CIRCUIT_BREAKER_TIMEOUT) {
        this._circuitBreakerOpen = false;
        this._consecutiveFailures = 0;
        console.log('[DR] Circuit breaker closed - timeout elapsed');
      }
    }
    return this._circuitBreakerOpen;
  }
  
  recordRequest(skipped: boolean, reason?: string): void {
    this._totalRequests++;
    if (skipped) {
      this._skippedRequests++;
      if (reason) {
        this._skipReasons.set(reason, (this._skipReasons.get(reason) || 0) + 1);
      }
    } else {
      this._sessionRequests++;
    }
  }
  
  recordHealthCheckResult(healthy: boolean): void {
    this._lastHealthCheck = Date.now();
    if (healthy) {
      this._consecutiveFailures = 0;
    } else {
      this._consecutiveFailures++;
      if (this._consecutiveFailures >= CONFIG.DR_AUTO_RESTART_THRESHOLD) {
        this.triggerCircuitBreaker();
      }
    }
  }
  
  triggerCircuitBreaker(): void {
    if (!this._circuitBreakerOpen) {
      this._circuitBreakerOpen = true;
      this._circuitBreakerOpenedAt = Date.now();
      console.log('[DR] ⚠️ CIRCUIT BREAKER OPENED - All sessions blocked');
      this.emit('circuitBreakerOpen');
    }
  }
  
  getHealthStatus(): 'healthy' | 'degraded' | 'critical' | 'fatal' {
    const memUsage = process.memoryUsage();
    // ★ [2026-01-08] V8 힙 제한 사용
    const heapLimitBytes = (METRICS_CONFIG.HARDWARE.V8_HEAP_LIMIT_MB || 8240) * 1024 * 1024;
    const memRatio = memUsage.heapUsed / heapLimitBytes;
    
    if (this._circuitBreakerOpen || memRatio > CONFIG.MEMORY_FATAL_THRESHOLD) return 'fatal';
    if (memRatio > CONFIG.MEMORY_CRITICAL_THRESHOLD || this._activeSessions > CONFIG.MAX_SESSIONS) return 'critical';
    if (memRatio > CONFIG.MEMORY_WARNING_THRESHOLD || this.skipRatio < CONFIG.TARGET_SKIP_RATIO) return 'degraded';
    return 'healthy';
  }
  
  toJSON() {
    return {
      totalRequests: this._totalRequests,
      skippedRequests: this._skippedRequests,
      sessionRequests: this._sessionRequests,
      skipRatio: this.skipRatio,
      activeSessions: this._activeSessions,
      healthStatus: this.getHealthStatus(),
      circuitBreakerOpen: this._circuitBreakerOpen,
      consecutiveFailures: this._consecutiveFailures,
      lastHealthCheck: new Date(this._lastHealthCheck).toISOString(),
    };
  }
}

export const metrics = new SessionMetricsCollector();

export function getSessionMetrics() {
  return { ...metrics.toJSON(), skipReasons: metrics.skipReasons };
}

function getExtension(path: string): string | null {
  const lastDot = path.lastIndexOf('.');
  if (lastDot === -1 || lastDot === path.length - 1) return null;
  const ext = path.slice(lastDot).toLowerCase();
  if (ext.includes('/')) return null;
  return ext;
}

function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    return ips.trim();
  }
  return req.headers['x-real-ip'] as string || req.socket?.remoteAddress || req.ip || 'unknown';
}

function isInternalIP(ip: string): boolean {
  return INTERNAL_IP_PATTERNS.some(pattern => pattern.test(ip));
}

// ★ [2026-01-06] Use centralized policy function for consistent auth path detection
function isAuthRequired(path: string): boolean {
  return policyIsAuthRequired(path);
}

function isRPCOrStatelessPath(path: string): boolean {
  return RPC_AND_STATELESS_PATHS.some(rpcPath => path === rpcPath || path.startsWith(rpcPath));
}

function hasCacheBustParam(url: string): boolean {
  const queryStart = url.indexOf('?');
  if (queryStart === -1) return false;
  
  const queryString = url.slice(queryStart + 1).toLowerCase();
  
  for (const param of CACHE_BUST_PARAMS) {
    if (queryString.includes(`${param}=`) || queryString.startsWith(`${param}=`) || queryString.includes(`&${param}=`)) {
      return true;
    }
  }
  
  const parts = queryString.split('&');
  for (const part of parts) {
    const [, value] = part.split('=');
    if (value && /^\d{10,13}$/.test(value)) return true;
  }
  
  return false;
}

function getSessionCount(): number {
  if (!sessionStore) return 0;
  const sessions = (sessionStore as any).sessions;
  if (!sessions) return 0;
  return Object.keys(sessions).length;
}

export interface SkipDecision {
  skip: boolean;
  reason: string;
  priority: number;
  confidence: 'high' | 'medium' | 'low';
}

export function shouldSkipSession(req: Request): SkipDecision {
  // ★ [2026-01-06 PRODUCTION FIX] Check X-Original-URL header for CDN/proxy preserved URLs
  const originalUrl = (req.headers['x-original-url'] as string) || req.url || req.originalUrl || '/';
  const url = originalUrl;
  const path = url.split('?')[0].toLowerCase();
  const method = (req.method || 'GET').toUpperCase();
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();
  const accept = (req.headers['accept'] || '').toLowerCase();
  const ip = getClientIP(req);
  const contentType = (req.headers['content-type'] || '').toLowerCase();
  
  // ★ [2026-01-06 CRITICAL FIX] Priority -1: NEVER skip session for auth-required paths
  // This takes absolute precedence over ALL other bypass rules
  const authRequired = isAuthRequired(path);
  if (path.includes('enterprise/admin') || path.includes('/admin/')) {
    console.log(`[SessionBypass] Auth check - path: ${path}, url: ${url}, authRequired: ${authRequired}`);
  }
  if (authRequired) {
    return { skip: false, reason: 'auth_required_path', priority: -1, confidence: 'high' };
  }
  
  // ★ [2026-01-06 PRODUCTION FIX] Priority 0: Header-based session skip
  // CDN/Load Balancer may strip query strings but can set headers
  const skipHeader = req.headers['x-skip-session'] === 'true' || 
                     req.headers['x-skip-session'] === '1';
  if (skipHeader) {
    return { skip: true, reason: 'x-skip-session_header', priority: 0, confidence: 'high' };
  }
  
  if (metrics.isCircuitBreakerOpen) {
    return { skip: true, reason: 'circuit_breaker_open', priority: 0, confidence: 'high' };
  }
  
  if (isRPCOrStatelessPath(path)) {
    return { skip: true, reason: `rpc_stateless:${path}`, priority: 1, confidence: 'high' };
  }
  
  if (hasCacheBustParam(url)) {
    return { skip: true, reason: 'cache_bust_param', priority: 2, confidence: 'high' };
  }
  
  if (req.headers['upgrade']?.toLowerCase() === 'websocket') {
    return { skip: true, reason: 'websocket_upgrade', priority: 3, confidence: 'high' };
  }
  
  const ext = getExtension(path);
  if (ext && STATIC_EXTENSIONS.has(ext)) {
    return { skip: true, reason: `static_ext:${ext}`, priority: 4, confidence: 'high' };
  }
  
  for (const prefix of STATIC_PREFIXES) {
    if (path.startsWith(prefix)) {
      return { skip: true, reason: `static_prefix:${prefix}`, priority: 5, confidence: 'high' };
    }
  }
  
  if (contentType.includes('application/json') && method === 'POST') {
    if (path.includes('rpc') || path.includes('jsonrpc')) {
      return { skip: true, reason: 'jsonrpc_request', priority: 6, confidence: 'high' };
    }
  }
  
  if (isInternalIP(ip) && !isAuthRequired(path)) {
    return { skip: true, reason: `internal_ip:${ip}`, priority: 7, confidence: 'high' };
  }
  
  if (userAgent && !isAuthRequired(path)) {
    for (const pattern of INTERNAL_USER_AGENTS) {
      if (userAgent.includes(pattern)) {
        return { skip: true, reason: `internal_ua:${pattern}`, priority: 8, confidence: 'high' };
      }
    }
  }
  
  if ((!userAgent || userAgent.length < 10) && method === 'GET' && !isAuthRequired(path)) {
    return { skip: true, reason: 'empty_ua', priority: 9, confidence: 'medium' };
  }
  
  if (method === 'OPTIONS' || method === 'HEAD') {
    return { skip: true, reason: `method:${method}`, priority: 10, confidence: 'high' };
  }
  
  if (accept && !accept.includes('text/html') && !accept.includes('*/*')) {
    if (!isAuthRequired(path)) {
      if (accept.includes('application/json')) {
        return { skip: true, reason: 'api_json_accept', priority: 11, confidence: 'medium' };
      }
      return { skip: true, reason: 'non_browser_accept', priority: 11, confidence: 'medium' };
    }
  }
  
  if (ENVIRONMENT.isProduction) {
    const hasCookie = !!(req.cookies?.['connect.sid'] || req.headers.cookie?.includes('connect.sid'));
    if (!hasCookie && !isAuthRequired(path)) {
      return { skip: true, reason: 'no_session_cookie', priority: 12, confidence: 'medium' };
    }
  }
  
  return { skip: false, reason: 'session_required', priority: 99, confidence: 'high' };
}

function emergencySessionCleanup(targetPercentage: number): number {
  if (!sessionStore) return 0;
  
  const sessions = (sessionStore as any).sessions;
  if (!sessions) return 0;
  
  const sessionIds = Object.keys(sessions);
  const deleteCount = Math.floor(sessionIds.length * targetPercentage);
  
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
  
  console.log(`[SESSION-BYPASS] Emergency cleanup: deleted ${deleted}/${sessionIds.length} sessions`);
  return deleted;
}

function clearAllSessions(): void {
  if (!sessionStore) return;
  
  const sessions = (sessionStore as any).sessions;
  if (!sessions) return;
  
  const count = Object.keys(sessions).length;
  for (const key of Object.keys(sessions)) {
    delete sessions[key];
  }
  
  console.log(`[SESSION-BYPASS] CRITICAL: Cleared all ${count} sessions`);
}

function blockSetCookieHeader(res: Response, reason: string): void {
  const originalSetHeader = res.setHeader.bind(res);
  const originalWriteHead = res.writeHead.bind(res);
  let headersProcessed = false;
  
  res.setHeader = function(name: string, value: any) {
    if (name.toLowerCase() === 'set-cookie') {
      if (Array.isArray(value)) {
        value = value.filter((v: string) => !v.includes('connect.sid'));
        if (value.length === 0) return res;
      } else if (typeof value === 'string' && value.includes('connect.sid')) {
        return res;
      }
    }
    return originalSetHeader(name, value);
  };
  
  res.writeHead = function(statusCode: number, statusMessage?: string | any, headers?: any) {
    if (!headersProcessed) {
      headersProcessed = true;
      
      const existingCookie = res.getHeader('set-cookie');
      if (existingCookie) {
        if (Array.isArray(existingCookie)) {
          const filtered = existingCookie.filter((v: string) => !v.includes('connect.sid'));
          if (filtered.length === 0) {
            res.removeHeader('set-cookie');
          } else {
            originalSetHeader('set-cookie', filtered);
          }
        } else if (typeof existingCookie === 'string' && existingCookie.includes('connect.sid')) {
          res.removeHeader('set-cookie');
        }
      }
    }
    
    if (typeof statusMessage === 'object') {
      headers = statusMessage;
      statusMessage = undefined;
    }
    
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
    
    if (statusMessage) {
      return originalWriteHead(statusCode, statusMessage, headers);
    } else {
      return originalWriteHead(statusCode, headers);
    }
  };
}

export interface DisasterRecoveryStatus {
  enabled: boolean;
  circuitBreakerOpen: boolean;
  lastHealthCheck: string;
  consecutiveFailures: number;
  memoryStatus: {
    heapUsed: string;
    heapTotal: string;
    usage: string;
    threshold: string;
  };
  sessionStatus: {
    count: number;
    max: number;
    utilization: string;
  };
  actions: {
    emergencyCleanupTriggered: number;
    fullClearTriggered: number;
    circuitBreakerTriggered: number;
  };
}

class DisasterRecoveryManager {
  private emergencyCleanupCount = 0;
  private fullClearCount = 0;
  private circuitBreakerCount = 0;
  private enabled = true;
  private intervalId: NodeJS.Timeout | null = null;
  
  start(): void {
    if (this.intervalId) return;
    
    console.log('[DR] Disaster Recovery Manager v4.0 started');
    
    this.intervalId = setInterval(() => {
      this.performHealthCheck();
    }, CONFIG.DR_HEALTH_CHECK_INTERVAL);
  }
  
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  performHealthCheck(): void {
    const sessionCount = getSessionCount();
    metrics.activeSessions = sessionCount;
    
    const memUsage = process.memoryUsage();
    // ★ [2026-01-08] V8 힙 제한 사용
    const heapLimitBytes = (METRICS_CONFIG.HARDWARE.V8_HEAP_LIMIT_MB || 8240) * 1024 * 1024;
    const memRatio = memUsage.heapUsed / heapLimitBytes;
    
    let healthy = true;
    
    if (memRatio > CONFIG.MEMORY_FATAL_THRESHOLD) {
      console.log(`[DR] FATAL: Memory ${(memRatio * 100).toFixed(1)}% - triggering full clear and circuit breaker`);
      clearAllSessions();
      this.fullClearCount++;
      metrics.triggerCircuitBreaker();
      this.circuitBreakerCount++;
      healthy = false;
    } else if (memRatio > CONFIG.MEMORY_EMERGENCY_THRESHOLD) {
      console.log(`[DR] EMERGENCY: Memory ${(memRatio * 100).toFixed(1)}% - clearing all sessions`);
      clearAllSessions();
      this.fullClearCount++;
      healthy = false;
    } else if (memRatio > CONFIG.MEMORY_CRITICAL_THRESHOLD) {
      console.log(`[DR] CRITICAL: Memory ${(memRatio * 100).toFixed(1)}% - emergency cleanup 70%`);
      emergencySessionCleanup(0.7);
      this.emergencyCleanupCount++;
      healthy = false;
    } else if (memRatio > CONFIG.MEMORY_WARNING_THRESHOLD) {
      console.log(`[DR] WARNING: Memory ${(memRatio * 100).toFixed(1)}% - emergency cleanup 40%`);
      emergencySessionCleanup(0.4);
      this.emergencyCleanupCount++;
    }
    
    if (sessionCount > CONFIG.MAX_SESSIONS) {
      console.log(`[DR] Sessions (${sessionCount}) > max (${CONFIG.MAX_SESSIONS}) - emergency cleanup`);
      emergencySessionCleanup(0.5);
      this.emergencyCleanupCount++;
      healthy = false;
    } else if (sessionCount > CONFIG.EMERGENCY_MAX_SESSIONS && memRatio > CONFIG.MEMORY_WARNING_THRESHOLD) {
      console.log(`[DR] Sessions elevated (${sessionCount}) with memory pressure - cleanup 30%`);
      emergencySessionCleanup(0.3);
      this.emergencyCleanupCount++;
    }
    
    metrics.recordHealthCheckResult(healthy);
  }
  
  getStatus(): DisasterRecoveryStatus {
    const memUsage = process.memoryUsage();
    const sessionCount = getSessionCount();
    // ★ [2026-01-08] V8 힙 제한 사용
    const heapLimitMB = METRICS_CONFIG.HARDWARE.V8_HEAP_LIMIT_MB;
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
    
    return {
      enabled: this.enabled,
      circuitBreakerOpen: metrics.isCircuitBreakerOpen,
      lastHealthCheck: new Date().toISOString(),
      consecutiveFailures: (metrics as any)._consecutiveFailures || 0,
      memoryStatus: {
        heapUsed: `${heapUsedMB.toFixed(2)} MB`,
        heapTotal: `${heapLimitMB.toFixed(2)} MB`,
        usage: `${((heapUsedMB / heapLimitMB) * 100).toFixed(2)}%`,
        threshold: `${(CONFIG.MEMORY_CRITICAL_THRESHOLD * 100).toFixed(0)}%`,
      },
      sessionStatus: {
        count: sessionCount,
        max: CONFIG.MAX_SESSIONS,
        utilization: `${((sessionCount / CONFIG.MAX_SESSIONS) * 100).toFixed(2)}%`,
      },
      actions: {
        emergencyCleanupTriggered: this.emergencyCleanupCount,
        fullClearTriggered: this.fullClearCount,
        circuitBreakerTriggered: this.circuitBreakerCount,
      },
    };
  }
}

export const disasterRecovery = new DisasterRecoveryManager();

export interface SessionBypassOptions {
  sessionMiddleware: RequestHandler;
  enableMetrics?: boolean;
  enableDisasterRecovery?: boolean;
  debug?: boolean;
}

export function createSessionBypassMiddleware(options: SessionBypassOptions): RequestHandler {
  const {
    sessionMiddleware,
    enableMetrics = true,
    enableDisasterRecovery = true,
    debug = false,
  } = options;
  
  if (enableDisasterRecovery) {
    disasterRecovery.start();
  }
  
  console.log('[SESSION-BYPASS] ════════════════════════════════════════════');
  console.log('[SESSION-BYPASS] Middleware v4.0 initialized');
  console.log(`[SESSION-BYPASS] Environment: ${ENVIRONMENT.nodeEnv}`);
  console.log(`[SESSION-BYPASS] Production: ${ENVIRONMENT.isProduction} (${ENVIRONMENT.detectionMethod})`);
  console.log(`[SESSION-BYPASS] Target skip ratio: ${(CONFIG.TARGET_SKIP_RATIO * 100).toFixed(0)}%`);
  console.log(`[SESSION-BYPASS] Disaster Recovery: ${enableDisasterRecovery ? 'ENABLED' : 'DISABLED'}`);
  console.log('[SESSION-BYPASS] ════════════════════════════════════════════');
  
  return (req: Request, res: Response, next: NextFunction) => {
    const decision = shouldSkipSession(req);
    
    if (enableMetrics) {
      metrics.recordRequest(decision.skip, decision.reason);
    }
    
    if (decision.skip) {
      blockSetCookieHeader(res, decision.reason);
      
      (req as any).session = null;
      (req as any).sessionID = null;
      (req as any).sessionStore = null;
      
      if (debug && Math.random() < 0.001) {
        console.log(`[SESSION-BYPASS] Skip: ${decision.reason} | ${req.method} ${req.url}`);
      }
      
      return next();
    }
    
    return sessionMiddleware(req, res, next);
  };
}

export function createPreSessionMiddleware(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const url = req.url || req.originalUrl || '/';
    const path = url.split('?')[0].toLowerCase();
    
    // ★ [2026-01-06 CRITICAL FIX] NEVER skip session for auth-required paths
    const isAuthRequiredPath = path.startsWith('/api/admin') || 
                                path.startsWith('/api/enterprise/admin') ||
                                path.startsWith('/api/auth') ||
                                path.startsWith('/api/session') ||
                                path.startsWith('/api/user') ||
                                path.startsWith('/api/oauth') ||
                                path.startsWith('/api/member');
    
    if (isAuthRequiredPath) {
      // Auth-required paths must NEVER skip session
      next();
      return;
    }
    
    if (isRPCOrStatelessPath(path) || hasCacheBustParam(url)) {
      (req as any).session = null;
      (req as any).sessionID = null;
      (req as any)._skipSession = true;
      
      blockSetCookieHeader(res, 'pre_session_skip');
    }
    
    next();
  };
}

export function sessionHealthCheck(req: Request, res: Response): void {
  const sessionCount = getSessionCount();
  const memUsage = process.memoryUsage();
  // ★ [2026-01-08] V8 힙 제한 사용
  const heapLimitBytes = (METRICS_CONFIG.HARDWARE.V8_HEAP_LIMIT_MB || 8240) * 1024 * 1024;
  const memRatio = memUsage.heapUsed / heapLimitBytes;
  
  const status = metrics.getHealthStatus();
  const healthy = status === 'healthy' || status === 'degraded';
  
  const response = {
    status,
    healthy,
    timestamp: new Date().toISOString(),
    metrics: {
      totalRequests: metrics.totalRequests,
      skippedRequests: metrics.skippedRequests,
      sessionRequests: metrics.sessionRequests,
      skipRatio: `${(metrics.skipRatio * 100).toFixed(2)}%`,
      targetSkipRatio: `${(CONFIG.TARGET_SKIP_RATIO * 100).toFixed(0)}%`,
      skipRatioMet: metrics.skipRatio >= CONFIG.TARGET_SKIP_RATIO,
      activeSessions: sessionCount,
      maxSessions: CONFIG.MAX_SESSIONS,
    },
    memory: {
      heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`,
      usage: `${(memRatio * 100).toFixed(2)}%`,
      thresholds: {
        warning: `${(CONFIG.MEMORY_WARNING_THRESHOLD * 100).toFixed(0)}%`,
        critical: `${(CONFIG.MEMORY_CRITICAL_THRESHOLD * 100).toFixed(0)}%`,
        emergency: `${(CONFIG.MEMORY_EMERGENCY_THRESHOLD * 100).toFixed(0)}%`,
        fatal: `${(CONFIG.MEMORY_FATAL_THRESHOLD * 100).toFixed(0)}%`,
      },
    },
    disasterRecovery: disasterRecovery.getStatus(),
    environment: ENVIRONMENT,
    skipReasonStats: Object.fromEntries(
      Array.from(metrics.skipReasons.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
    ),
    uptime: {
      seconds: Math.floor(process.uptime()),
      formatted: formatUptime(process.uptime()),
    },
  };
  
  res.status(healthy ? 200 : 503).json(response);
}

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

export default createSessionBypassMiddleware;
