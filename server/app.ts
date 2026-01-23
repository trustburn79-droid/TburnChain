import { type Server } from "node:http";
import express, {
  type Express,
  type Request,
  Response,
  NextFunction,
} from "express";
import helmet from "helmet";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import createMemoryStore from "memorystore";
import { createClient } from "redis";
import { Pool } from "@neondatabase/serverless";
import { registerRoutes } from "./routes";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { initializeBlockchainOrchestrator, shutdownBlockchainOrchestrator } from "./services/blockchain-orchestrator";
import { memoryGuardian } from "./services/memory-guardian";
import { never500ErrorHandler, getErrorHealthStats } from "./core/never-500-handler";

// ★ [수정 1] connect-redis 불러오는 방식 변경 (ESM 호환)
import { RedisStore } from "connect-redis";
import { sessionMetrics } from "./core/monitoring/session-metrics";
import { 
  shouldBypassSession, 
  blockSetCookie, 
  createSkipSession,
  checkMemoryStoreCapacity,
  performEmergencyCleanup,
  forceClearAllSessions,
  IS_PRODUCTION,
  updateMetrics,
  setSessionStore as setBypassSessionStore
} from "./core/sessions/session-bypass";
import { productionMonitor } from "./core/monitoring/enterprise-production-monitor";
import { crashDiagnostics } from "./core/monitoring/crash-diagnostics";
import { disasterRecovery } from "./core/monitoring/disaster-recovery";
import { 
  createSessionBypassMiddleware as createSessionBypassV4,
  createPreSessionMiddleware,
  setSessionStore as setBypassSessionStoreV4,
  disasterRecovery as disasterRecoveryV4,
  ENVIRONMENT as ENV_V4,
  getSessionMetrics as getSessionMetricsV4,
  CONFIG as CONFIG_V4,
} from "./core/sessions/session-bypass-v4";

// ★ [2026-01-06] Import centralized session policy module
import {
  isAuthRequired as policyIsAuthRequired,
  isTrustedIP as policyIsTrustedIP,
  isValidSkipSessionHeader,
  recordBypassDecision,
  getPrometheusMetrics as getPolicyPrometheusMetrics,
} from "./core/sessions/session-policy";

// ★ [2026-01-05] 프로세스 크래시 핸들러 즉시 등록 (최우선)
// uncaughtException, unhandledRejection 핸들러가 모든 에러를 캡처
crashDiagnostics.registerProcessHandlers();
crashDiagnostics.startMemoryMonitoring();

declare module "express-session" {
  interface SessionData {
    authenticated?: boolean;
    adminAuthenticated?: boolean;
    memberId?: string;
    memberEmail?: string;
    memberAddress?: string;
    emailVerified?: string;
    emailVerifiedAt?: string;
    googleId?: string;
    googleEmail?: string;
    googleName?: string;
    googlePicture?: string;
    pendingGoogleUser?: {
      googleId: string;
      email: string;
      name: string;
      picture: string;
    };
  }
}

const PgSession = connectPgSimple(session);
const MemoryStore = createMemoryStore(session);

// Fix BigInt JSON serialization
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

export const app = express();

// ★ [수정 2] Nginx 프록시 신뢰 설정 (필수)
app.set('trust proxy', 1);

// ★ [2026-01-23] Security: Helmet middleware with CSP headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "wss:", "ws:", "https:"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// ============================================================================
// ★ [v5.1 ENTERPRISE] PRE-SESSION FILTER WITH PERFORMANCE & SECURITY HARDENING
// ============================================================================
// Key Features:
// - Set-based O(1) exact path lookup (replaces O(n) linear scan)
// - Sorted prefix array for early termination binary search
// - URL decoding attack prevention
// - X-Skip-Session header trust validation (internal proxies only)
// - Prometheus-compatible metrics tracking
// - CDN query string removal immunity via path-based matching

// ★ [v5.1] Session Skip Metrics (Prometheus-compatible)
const sessionSkipMetrics = {
  totalRequests: 0,
  skippedRequests: 0,
  skipReasons: {
    header: 0,
    exactPath: 0,
    prefixPath: 0,
    staticExt: 0,
    staticPrefix: 0,
    method: 0,
    websocket: 0,
    cacheBust: 0,
  },
  lastReset: Date.now(),
};

// Export metrics for monitoring endpoint
export function getSessionSkipMetrics() {
  const uptime = Date.now() - sessionSkipMetrics.lastReset;
  const skipRatio = sessionSkipMetrics.totalRequests > 0 
    ? (sessionSkipMetrics.skippedRequests / sessionSkipMetrics.totalRequests * 100).toFixed(2)
    : '0.00';
  return {
    ...sessionSkipMetrics,
    skipRatio: `${skipRatio}%`,
    uptimeMs: uptime,
    uptimeHuman: `${Math.floor(uptime / 3600000)}h ${Math.floor((uptime % 3600000) / 60000)}m`,
  };
}

// ★ [v5.1] Exact path Set for O(1) lookup (vs O(n) array scan)
const SESSION_FREE_EXACT_PATHS = new Set([
  '/rpc', '/jsonrpc', '/json-rpc', '/eth', '/api/rpc',
  '/ws', '/wss', '/socket', '/socket.io',
  '/health', '/healthz', '/readyz', '/livez', '/ping', '/status', '/metrics',
  '/api/health', '/api/status', '/api/ping', '/api/metrics',
  '/api/blocks', '/api/block', '/api/transactions', '/api/tx', '/api/txs',
  '/api/validators', '/api/network', '/api/price', '/api/market',
  '/api/explorer', '/api/chain', '/api/stats', '/api/supply', '/api/gas',
  '/api/info', '/api/version',
  '/api/production-monitor', '/api/session-health', '/api/disaster-recovery',
  '/explorer', '/scan', '/blocks', '/transactions', '/validators',
  '/staking', '/governance', '/bridge', '/community', '/docs', '/api-docs', '/sdk', '/cli',
]);

// ★ [v5.1] Prefix paths sorted by length (longest first for greedy match)
const SESSION_FREE_PREFIX_PATHS = [
  '/api/transactions/', '/api/validators/', '/api/production-',
  '/api/session-', '/api/disaster-', '/api/explorer/', '/api/blocks/',
  '/api/network/', '/api/market/', '/api/chain/', '/api/stats/',
  '/transactions/', '/validators/', '/governance/', '/community/',
  '/explorer/', '/staking/', '/bridge/', '/api-docs/', '/blocks/',
  '/socket.io/', '/scan/', '/docs/', '/sdk/', '/cli/', '/rpc/', '/ws/',
  // External validator public endpoints (public or API key auth, not session auth)
  '/api/external-validators/rpc-integration/stats',
  '/api/external-validators/rpc-integration/check/',
  '/api/external-validators/security/',
  '/api/external-validators/register',
  '/api/external-validators/tiers',
  '/api/external-validators/status/',
].sort((a, b) => b.length - a.length);

// ★ [v5.1] Static extension Set for O(1) lookup
const STATIC_EXTENSIONS = new Set([
  '.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.css', '.scss', '.sass', '.less',
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.avif', '.bmp',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  '.mp3', '.mp4', '.webm', '.ogg', '.wav',
  '.pdf', '.zip', '.gz', '.json', '.xml', '.txt', '.md', '.yaml', '.yml', '.map', '.wasm',
]);

// ★ [v5.1] Static prefixes sorted by length
const STATIC_PREFIXES = [
  '/node_modules/', '/__vite/', '/@vite/', '/@fs/', '/_next/',
  '/assets/', '/static/', '/public/', '/dist/', '/build/', '/chunks/',
  '/images/', '/icons/', '/fonts/', '/media/', '/js/', '/css/',
  '/favicon', '/robots.txt', '/sitemap', '/manifest',
].sort((a, b) => b.length - a.length);

const CACHE_BUST_REGEX = /[?&](_t|_|t|timestamp|ts|cachebust|cb|nocache|v|ver|nonce|rand)=/i;
const TIMESTAMP_REGEX = /[?&][^=]+=\d{10,13}(&|$)/;

// ★ [v5.1] Trusted proxy IPs for X-Skip-Session header (security hardening)
const TRUSTED_PROXIES = new Set([
  '127.0.0.1', '::1', 'localhost',
  // Replit internal proxies
  '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16',
]);

function isTrustedProxy(ip: string): boolean {
  if (!ip) return false;
  const cleanIp = ip.split(',')[0].trim();
  if (TRUSTED_PROXIES.has(cleanIp)) return true;
  // Check private IP ranges
  if (cleanIp.startsWith('10.') || cleanIp.startsWith('172.') || cleanIp.startsWith('192.168.')) return true;
  return false;
}

// ★ [v5.1] URL decode attack prevention
function sanitizePath(url: string): string {
  try {
    let path = url.split('?')[0].toLowerCase();
    // Decode URL to prevent %2F bypass attacks
    path = decodeURIComponent(path);
    // Remove double slashes
    path = path.replace(/\/+/g, '/');
    // Remove trailing slash for consistency
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    return path;
  } catch {
    // If decoding fails, use original
    return url.split('?')[0].toLowerCase();
  }
}

// ★ [v5.1] Get file extension efficiently
function getExtension(path: string): string {
  const lastDot = path.lastIndexOf('.');
  if (lastDot === -1 || lastDot === path.length - 1) return '';
  const lastSlash = path.lastIndexOf('/');
  if (lastDot < lastSlash) return '';
  return path.slice(lastDot).toLowerCase();
}

app.use((req: Request, res: Response, next: NextFunction) => {
  sessionSkipMetrics.totalRequests++;
  const method = (req.method || 'GET').toUpperCase();
  const clientIp = (req.ip || req.socket.remoteAddress || '').toString();
  
  // ★ [v5.1 SECURITY] Only trust X-Skip-Session from internal proxies
  const skipHeader = req.headers['x-skip-session'] === 'true' || req.headers['x-skip-session'] === '1';
  const trustedSkipHeader = skipHeader && isTrustedProxy(clientIp);
  
  // ★ [v5.1] Use original URL if CDN preserved it (with sanitization)
  const originalUrl = (req.headers['x-original-url'] as string) || req.url || '';
  const url = originalUrl || req.url || '';
  const path = sanitizePath(url);
  
  let shouldSkip = false;
  let skipReason = '';
  
  // ★ [2026-01-06 CRITICAL FIX] NEVER skip session for auth-required paths
  // This takes absolute precedence over ALL other bypass rules
  // Uses centralized policy module for consistent path detection
  const isAuthRequiredPath = policyIsAuthRequired(path);
  
  if (isAuthRequiredPath) {
    // Auth-required paths must NEVER skip session - go directly to next()
    next();
    return;
  }
  
  // 1. 헤더 기반 스킵 (신뢰할 수 있는 프록시만)
  if (trustedSkipHeader) {
    shouldSkip = true;
    skipReason = 'header';
    sessionSkipMetrics.skipReasons.header++;
  }
  
  // 2. 정확한 경로 매칭 (O(1) Set lookup)
  if (!shouldSkip && SESSION_FREE_EXACT_PATHS.has(path)) {
    shouldSkip = true;
    skipReason = 'exactPath';
    sessionSkipMetrics.skipReasons.exactPath++;
  }
  
  // 3. 접두사 경로 매칭 (longest match first)
  if (!shouldSkip) {
    for (const prefix of SESSION_FREE_PREFIX_PATHS) {
      if (path.startsWith(prefix)) {
        shouldSkip = true;
        skipReason = 'prefixPath';
        sessionSkipMetrics.skipReasons.prefixPath++;
        break;
      }
    }
  }
  
  // 4. 정적 파일 확장자 (O(1) Set lookup)
  if (!shouldSkip) {
    const ext = getExtension(path);
    if (ext && STATIC_EXTENSIONS.has(ext)) {
      shouldSkip = true;
      skipReason = 'staticExt';
      sessionSkipMetrics.skipReasons.staticExt++;
    }
  }
  
  // 5. 정적 파일 경로 접두사 (longest match first)
  if (!shouldSkip) {
    for (const prefix of STATIC_PREFIXES) {
      if (path.startsWith(prefix)) {
        shouldSkip = true;
        skipReason = 'staticPrefix';
        sessionSkipMetrics.skipReasons.staticPrefix++;
        break;
      }
    }
  }
  
  // 6. OPTIONS/HEAD 메서드
  if (!shouldSkip && (method === 'OPTIONS' || method === 'HEAD')) {
    shouldSkip = true;
    skipReason = 'method';
    sessionSkipMetrics.skipReasons.method++;
  }
  
  // 7. WebSocket 업그레이드
  if (!shouldSkip && req.headers['upgrade']?.toLowerCase() === 'websocket') {
    shouldSkip = true;
    skipReason = 'websocket';
    sessionSkipMetrics.skipReasons.websocket++;
  }
  
  // 8. 캐시버스팅 쿼리
  if (!shouldSkip && (CACHE_BUST_REGEX.test(url) || TIMESTAMP_REGEX.test(url))) {
    shouldSkip = true;
    skipReason = 'cacheBust';
    sessionSkipMetrics.skipReasons.cacheBust++;
  }
  
  if (shouldSkip) {
    sessionSkipMetrics.skippedRequests++;
    (req as any)._skipSession = true;
    (req as any)._skipReason = skipReason;
    (req as any).session = null;
    (req as any).sessionID = null;
    
    // Block Set-Cookie header
    const originalSetHeader = res.setHeader.bind(res);
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
  }
  
  next();
});

// ★ [v4.0] Also add the comprehensive pre-session middleware from v4
app.use(createPreSessionMiddleware());

// ★ [2026-01-04 프로덕션 안정성] 요청 타임아웃 보호
// 75초 타임아웃으로 "upstream request timeout" 방지
app.use((req: Request, res: Response, next: NextFunction) => {
  const TIMEOUT_MS = 75000;
  let timeoutCleared = false;
  
  const timeoutId = setTimeout(() => {
    // 이미 타이머가 취소되었거나 응답이 완료된 경우 무시
    if (timeoutCleared || res.headersSent || res.writableEnded) {
      return;
    }
    console.error(`[Timeout] Request timeout after ${TIMEOUT_MS}ms: ${req.method} ${req.path}`);
    try {
      res.status(504).json({ 
        error: 'Gateway Timeout',
        message: 'Request processing took too long',
        path: req.path
      });
    } catch (e) {
      // 응답 작성 실패 시 무시 (이미 종료된 연결)
    }
  }, TIMEOUT_MS);
  
  // 응답 완료 시 타임아웃 즉시 취소 (메모리 누수 방지)
  const clearTimeoutHandler = () => {
    if (!timeoutCleared) {
      timeoutCleared = true;
      clearTimeout(timeoutId);
    }
  };
  res.on('finish', clearTimeoutHandler);
  res.on('close', clearTimeoutHandler);
  
  next();
});

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

// ★ [수정 3] 세션 스토어 단순화 - REDIS_URL 있을 때만 Redis 사용
const REDIS_URL = process.env.REDIS_URL;
const hasRedis = !!REDIS_URL; // REDIS_URL이 명시적으로 설정된 경우만 Redis 사용

// ★ [2026-01-05 프로덕션 안정성 v3.0] 환경 감지 통합
// session-bypass.ts의 IS_PRODUCTION을 직접 사용하여 개발/프로덕션 일관성 보장
// 이전: app.ts에서 별도로 프로덕션 감지 → 불일치 발생 → 프로덕션에서 세션 스킵 실패
// 현재: IS_PRODUCTION을 session-bypass.ts에서 import하여 단일 진실 소스(Single Source of Truth) 유지
const cookieSecure = IS_PRODUCTION || process.env.COOKIE_SECURE === "true";

// ★ 프로덕션 환경 감지 로깅 (디버깅용)
console.log(`[Session] Environment Detection: IS_PRODUCTION=${IS_PRODUCTION}, ` +
  `REPLIT_DEPLOYMENT=${process.env.REPLIT_DEPLOYMENT}, ` +
  `NODE_ENV=${process.env.NODE_ENV}, ` +
  `REPL_ID=${process.env.REPL_ID ? 'set' : 'unset'}, ` +
  `REPLIT_DEV_DOMAIN=${process.env.REPLIT_DEV_DOMAIN ? 'set' : 'unset'}`);

let sessionStore: session.Store;
let sessionStoreType: string;
let isUsingMemoryStore = false;
let memoryStoreRef: InstanceType<typeof MemoryStore> | null = null;

// ★ [수정 4] 세션 스토어 선택 - 안전한 폴백
// REDIS_URL이 명시적으로 설정된 경우에만 Redis 사용, 그 외에는 MemoryStore
if (hasRedis) {
  // Redis가 설정된 환경: Redis 사용
  console.log(`[Init] Attempting to connect to Redis...`);

  // Upstash 및 TLS 지원 Redis 서비스를 위한 설정
  // rediss:// URL은 TLS 연결 필요
  const isTLS = REDIS_URL!.startsWith('rediss://');
  
  const redisClient = createClient({ 
    url: REDIS_URL,
    socket: isTLS ? {
      tls: true,
      rejectUnauthorized: false, // Upstash 인증서 허용
    } : undefined,
  });

  redisClient.on("error", (err) => {
    console.error("[Redis] Connection Error:", err);
  });
  redisClient.on("connect", () => {
    log("✅ Redis connected successfully", "session");
  });
  redisClient.on("ready", () => {
    log("✅ Redis ready for commands", "session");
  });

  // Redis 클라이언트 연결 시작
  redisClient.connect().catch(console.error);

  // 세션 스토어로 Redis 지정
  sessionStore = new RedisStore({ 
    client: redisClient,
    prefix: "tburn:",
  });
  sessionStoreType = "Redis (TLS: " + isTLS + ")";
} else {
  // Redis가 없는 환경: MemoryStore 사용 (Replit 개발 및 Autoscale 배포 모두)
  // ★ [수정 6] 프로덕션 안정성 v3.1 - 메모리 최적화
  // 세션 수 대폭 축소로 메모리 절약 (5000 → 2000)
  const maxSessions = IS_PRODUCTION ? 2000 : 1000;
  const memStore = new MemoryStore({
    checkPeriod: 60000, // ★ [v3.1] 60초마다 만료된 세션 정리 (오버헤드 감소)
    max: maxSessions, // ★ [v3.1] 프로덕션 2000 / 개발 1000 (메모리 절약)
    ttl: 900000, // ★ [v3.1] 세션 TTL 15분으로 단축 (메모리 회수 빠르게)
    stale: false, // ★ 만료된 세션 즉시 삭제 (메모리 절약)
    dispose: (key: string) => {
      // 세션 삭제 로깅 (디버깅용)
      if (process.env.DEBUG_SESSION === 'true') {
        console.log(`[Session] Disposed session: ${key.substring(0, 8)}...`);
      }
    }
  });
  sessionStore = memStore;
  memoryStoreRef = memStore;
  isUsingMemoryStore = true;
  sessionStoreType = `MemoryStore (max: ${maxSessions}, TTL: 30m, cleanup: 30s)`;
  console.log(`[Session] ⚠️ Using MemoryStore - for production scale, configure REDIS_URL`);
  
  // ★ [v3.0] MemoryStore를 재해복구 시스템에 등록
  disasterRecovery.setSessionStore(memStore);
  
  // ★ [v3.0] session-bypass에도 세션 스토어 등록 (activeSessions 카운트용)
  setBypassSessionStore(memStore);
  
  // ★ [v4.0] session-bypass-v4에도 세션 스토어 등록
  setBypassSessionStoreV4(memStore);
}

// ★ [v3.0] Redis를 사용하는 경우에도 세션 스토어 등록
if (hasRedis) {
  disasterRecovery.setSessionStore(sessionStore);
  setBypassSessionStore(sessionStore);
  // ★ [v4.0] Redis도 v4 시스템에 등록
  setBypassSessionStoreV4(sessionStore as any);
}

// ★ [수정 5] 세션 미들웨어 - 내부 API 호출에서는 세션 생성 건너뛰기
// 내부 호출(ProductionDataPoller, DataCache 등)에서 세션이 생성되면 MemoryStore가 30-60분 내에 가득 차서 서버 에러 발생
const sessionMiddleware = session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || "tburn-secret-key-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: cookieSecure,   // ★ 프로덕션에서 HTTPS 전용 쿠키 자동 활성화
    httpOnly: true, // 자바스크립트 접근 방지 (보안)
    maxAge: 2 * 60 * 60 * 1000, // ★ 2시간으로 단축 (메모리 누수 방지)
    sameSite: cookieSecure ? "none" : "lax", // ★ HTTPS 환경에서는 none으로 설정 (크로스 도메인 지원)
  },
  proxy: true, // ★ 항상 프록시 신뢰 (Nginx 뒤에서 작동)
});

// ★ 세션 모니터링을 위한 카운터
let sessionCreateCount = 0;
let sessionSkipCount = 0;
let lastSessionReport = Date.now();

// ★ [수정 7] 실제 활성 세션 수 조회 함수 - 정확한 MemoryStore 용량 모니터링
function getActiveSessionCount(): number {
  if (isUsingMemoryStore && memoryStoreRef) {
    // memorystore 내부 LRU 캐시의 itemCount 속성 사용
    const store = (memoryStoreRef as any).store;
    if (store && typeof store.itemCount === 'number') {
      return store.itemCount;
    }
  }
  // Redis 또는 기타 스토어 - 생성 카운트로 추정
  return sessionCreateCount;
}

// ★ 세션 스토어 정보 내보내기 (productionMonitor에서 사용)
export function getSessionStoreInfo() {
  return {
    isUsingMemoryStore,
    memoryStoreRef,
    maxSessions: IS_PRODUCTION ? 2000 : 1000,  // ★ [v3.1] 메모리 최적화
    getActiveCount: getActiveSessionCount
  };
}

// ★ [2026-01-05 v3.1] 두 단계 미들웨어 구조 - 세션 완전 바이패스
// Phase 1: 바이패스 결정 미들웨어 (express-session 이전에 실행)
app.use((req: Request, res: Response, next: NextFunction) => {
  const bypassResult = shouldBypassSession(req);
  
  // ★ [v3.0] 모든 요청에 대해 메트릭 업데이트 - DR에서 skip ratio 정확히 추적
  updateMetrics(bypassResult);
  
  if (bypassResult.shouldSkip) {
    // ★ [CRITICAL] req.skipSession 플래그 설정 - Phase 2에서 세션 생성 완전 방지
    (req as any).skipSession = true;
    sessionSkipCount++;
    
    // Set-Cookie 헤더 차단 - 세션 쿠키 누출 방지
    blockSetCookie(res);
    
    // 빈 세션 객체 제공 (MemoryStore에 저장되지 않음)
    (req as any).session = createSkipSession();
    
    // ★ [v3.0] 엔터프라이즈 세션 메트릭에 기록 - DR에서 skip ratio 추적 가능
    sessionMetrics.recordSessionSkipped();
    
    // 엔터프라이즈 모니터링
    productionMonitor.recordSessionSkip();
    
    if (process.env.DEBUG_SESSION === 'true') {
      console.log(`[Session Skip] ${req.method} ${req.path} - reason: ${bypassResult.reason}`);
    }
  }
  
  next();
});

// ★ Phase 2: 조건부 세션 미들웨어 - skipSession=true인 경우 express-session 완전 스킵
app.use((req: Request, res: Response, next: NextFunction) => {
  // ★ [v4.0] _skipSession 또는 skipSession 플래그가 있으면 express-session 실행하지 않음
  if ((req as any).skipSession || (req as any)._skipSession) {
    return next();
  }
  
  sessionCreateCount++;
  
  // ★ [v3.0] 엔터프라이즈 세션 메트릭에 기록 - DR에서 skip ratio 추적 가능
  sessionMetrics.recordSessionCreated();
  
  productionMonitor.recordSessionCreate();
  
  // ★ MemoryStore 용량 모니터링 (세션 생성 시에만)
  const maxSessions = IS_PRODUCTION ? 10000 : 2000;
  const activeCount = getActiveSessionCount();
  const capacityResult = checkMemoryStoreCapacity(activeCount, maxSessions);
  
  // ★ [CRITICAL] 긴급 정리 - 80% 이상 시 자동 정리
  if (capacityResult.percentUsed >= 0.8 && isUsingMemoryStore && memoryStoreRef) {
    performEmergencyCleanup(memoryStoreRef, activeCount, maxSessions);
  }
  
  // ★ [NUCLEAR OPTION] 95% 이상 시 전체 세션 삭제 (서버 크래시 방지)
  if (capacityResult.percentUsed >= 0.95 && isUsingMemoryStore && memoryStoreRef) {
    forceClearAllSessions(memoryStoreRef);
  }
  
  productionMonitor.updateMemoryStoreMetrics(activeCount, maxSessions);
  
  // 10분마다 세션 사용량 리포트
  const now = Date.now();
  if (now - lastSessionReport > 600000) {
    const total = sessionCreateCount + sessionSkipCount;
    const skipRatio = total > 0 ? (sessionSkipCount / total * 100).toFixed(1) : '0';
    console.log(`[Session Monitor] Created: ${sessionCreateCount}, Skipped: ${sessionSkipCount}, ` +
      `Ratio: ${skipRatio}% skipped`);
    lastSessionReport = now;
  }
  
  // express-session 실제 실행 (세션 생성)
  return sessionMiddleware(req, res, next);
});

log(`Cookie secure: ${cookieSecure} (set COOKIE_SECURE=true for HTTPS-only)`, "session");

log(`Session store: ${sessionStoreType}`, "session");

// ★ [Phase 16] 엔터프라이즈 세션 메트릭 모니터링 시작
sessionMetrics.start();
log("Enterprise session metrics monitoring started", "session");

// ============================================
// Google OAuth Configuration
// ============================================
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "https://tburn.io/api/auth/google/callback";

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_CALLBACK_URL,
  }, (accessToken, refreshToken, profile, done) => {
    // Return profile data directly - we'll handle user creation in the callback
    const userData = {
      googleId: profile.id,
      email: profile.emails?.[0]?.value || "",
      name: profile.displayName || "",
      picture: profile.photos?.[0]?.value || "",
    };
    return done(null, userData);
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });

  app.use(passport.initialize());
  // ★ [v4.0] passport.session()을 조건부로 실행 - skipSession 또는 _skipSession=true면 스킵
  app.use((req: Request, res: Response, next: NextFunction) => {
    if ((req as any).skipSession || (req as any)._skipSession) {
      return next(); // 세션 스킵된 요청에는 passport.session() 실행 안함
    }
    return passport.session()(req, res, next);
  });
  
  log(`✅ Google OAuth configured (Callback: ${GOOGLE_CALLBACK_URL})`, "auth");
} else {
  log(`⚠️ Google OAuth not configured - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET`, "auth");
}

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
if (ADMIN_PASSWORD) {
  log(`✅ ADMIN_PASSWORD loaded`, "security");
} else {
  log(`⚠️ WARNING: ADMIN_PASSWORD not set!`, "security");
}

app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

export default async function runApp(
  setup: (app: Express, server: Server) => Promise<void>,
) {
  const server = await registerRoutes(app);

  // ★ [2026-01-10] Enterprise Never500 Error Handler v5.0
  // CRITICAL: Absolute prevention of "Internal Server Error" (500)
  // All unhandled errors are classified and returned with proper status codes:
  // - RPC/Network errors → 503 with cache fallback
  // - Rate limits → 429 with retry-after
  // - Validation errors → 400 with details
  // - All other errors → 503 (NEVER 500) with auto-recovery
  app.use(never500ErrorHandler);
  
  // ★ Error health monitoring endpoint for diagnostics
  app.get('/api/internal/error-health', (_req, res) => {
    res.json({
      ...getErrorHealthStats(),
      memoryUsage: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        uptime: Math.round(process.uptime()),
      },
    });
  });

  await setup(app, server);

  // ★ [2026-01-05 CRITICAL FIX] 프로덕션에서 BlockchainOrchestrator 비활성화
  // Autoscale 512MB 환경에서 고빈도 interval들이 70-90분 후 힙 메모리 고갈 유발
  if (IS_PRODUCTION) {
    log(`🔒 Production mode - BlockchainOrchestrator DISABLED for memory stability`, "scalability");
    log(`📊 Using lightweight static data mode for 24/7/365 operation`, "scalability");
  } else {
    // Development: Initialize Enterprise Scalability Infrastructure
    const IS_DEV = process.env.NODE_ENV === 'development';
    try {
      initializeBlockchainOrchestrator({
        shardCount: 5,
        validatorsPerShard: 25,
        blockTimeMs: IS_DEV ? 1000 : 100,
        enableWorkerThreads: false,  // Disabled for Replit compatibility
        enableBatchPersistence: true,
        enableAdaptiveFees: true,
        batchFlushIntervalMs: IS_DEV ? 5000 : 1000,
      }).then(() => {
        log(`✅ Enterprise Scalability initialized (dev mode)`, "scalability");
      }).catch((error) => {
        log(`⚠️ Scalability init error: ${error}`, "scalability");
      });
    } catch (error) {
      log(`⚠️ Scalability setup error: ${error}`, "scalability");
    }
  }

  // Graceful shutdown handler
  process.on('SIGTERM', async () => {
    log(`🛑 SIGTERM received, shutting down gracefully...`, "shutdown");
    try {
      memoryGuardian.stop();
      await shutdownBlockchainOrchestrator();
    } catch (e) {
      // Ignore shutdown errors
    }
    process.exit(0);
  });

  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    
    // ★ [v7.0] Start Memory Guardian for automated memory management
    memoryGuardian.start();
    log(`🛡️ Memory Guardian started - monitoring heap usage`, "memory");
  });
}
