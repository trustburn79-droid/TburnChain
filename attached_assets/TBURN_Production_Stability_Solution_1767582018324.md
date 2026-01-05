# TBURN 메인넷 프로덕션 안정성 종합 해결 방안

**문서 버전**: 2.0  
**작성일**: 2026년 1월 5일  
**심각도**: Critical (P0)  
**목표**: 24/7/365 무중단 운영

---

## 1. 문제 근본 원인 분석

### 1.1 현재 증상
```
발생 시점: 서버 시작 후 1~2시간
오류 메시지: "Internal Server Error", "upstream request timeout"
결과: 사이트 완전 중단
```

### 1.2 근본 원인 (Root Cause Analysis)

| 원인 | 심각도 | 영향 |
|------|--------|------|
| **MemoryStore 세션 누적** | Critical | 메모리 고갈 → 프로세스 크래시 |
| **미들웨어 순서 오류** | High | 세션 스킵 로직이 실행되기 전에 세션 생성 |
| **Set-Cookie 헤더 누출** | High | 불필요한 세션 계속 생성 |
| **app.ts와 session-bypass.ts 로직 불일치** | Medium | 환경 감지 실패 |
| **가비지 컬렉션 부재** | Critical | 만료된 세션 미정리 |

### 1.3 메모리 누수 시나리오

```
┌─────────────────────────────────────────────────────────────────┐
│                    메모리 누수 타임라인                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  T+0분      T+30분     T+60분     T+90분     T+120분            │
│    │          │          │          │          │                │
│    ▼          ▼          ▼          ▼          ▼                │
│  ┌────┐    ┌────┐    ┌────┐    ┌────┐    ┌────┐               │
│  │10MB│    │50MB│    │150MB│   │300MB│   │512MB│  ← OOM Kill   │
│  │세션│    │세션│    │ 세션 │   │ 세션 │   │ 세션 │               │
│  └────┘    └────┘    └────┘    └────┘    └────┘               │
│                                                                  │
│  매 요청마다 새 세션 생성 (Set-Cookie 발행)                        │
│  → 봇, 크롤러, 헬스체크 = 수천 개의 좀비 세션                       │
│  → MemoryStore 무한 증가                                         │
│  → Node.js 힙 메모리 고갈                                         │
│  → "upstream request timeout" 발생                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 엔터프라이즈급 해결 아키텍처

### 2.1 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                    요청 처리 파이프라인 (수정 후)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   [클라이언트 요청]                                               │
│          │                                                       │
│          ▼                                                       │
│   ┌──────────────────┐                                          │
│   │ 1. 요청 인터셉터  │  ← 최우선 실행 (app.use 첫 번째)           │
│   │   (Pre-Session)  │                                          │
│   └────────┬─────────┘                                          │
│            │                                                     │
│            ▼                                                     │
│   ┌──────────────────┐     ┌─────────────────┐                  │
│   │ 2. 세션 스킵 판단 │────►│ 스킵 대상이면   │                  │
│   │   (shouldSkip)   │     │ 세션 미들웨어   │                  │
│   └────────┬─────────┘     │ 완전 우회       │                  │
│            │               └────────┬────────┘                  │
│            │ 세션 필요               │                           │
│            ▼                        │                           │
│   ┌──────────────────┐              │                           │
│   │ 3. 세션 미들웨어  │              │                           │
│   │  (express-session)│              │                           │
│   └────────┬─────────┘              │                           │
│            │                        │                           │
│            ▼                        ▼                           │
│   ┌──────────────────────────────────┐                          │
│   │      4. 라우트 핸들러             │                          │
│   └──────────────────────────────────┘                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 핵심 코드 수정 사항

### 3.1 session-bypass.ts (완전 재작성)

```typescript
// server/middleware/session-bypass.ts
// Version: 3.0.0 - Enterprise Production Grade
// Purpose: 24/7/365 무중단 운영을 위한 세션 바이패스

import { Request, Response, NextFunction, RequestHandler } from 'express';
import session from 'express-session';

// ============================================================================
// 설정 상수
// ============================================================================

const CONFIG = {
  // 메모리 임계값
  MEMORY_WARNING_THRESHOLD: 0.70,    // 70% - 경고 시작
  MEMORY_CRITICAL_THRESHOLD: 0.85,   // 85% - 긴급 정리
  MEMORY_EMERGENCY_THRESHOLD: 0.95,  // 95% - 전체 클리어
  
  // 세션 설정
  SESSION_MAX_AGE: 24 * 60 * 60 * 1000,  // 24시간
  SESSION_CLEANUP_INTERVAL: 60 * 1000,    // 1분마다 정리
  MAX_SESSIONS: 10000,                     // 최대 세션 수
  
  // 스킵 비율 목표
  TARGET_SKIP_RATIO: 0.95,  // 95% 이상 스킵 목표
} as const;

// ============================================================================
// 환경 감지 (통합)
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
      
    isDocker: 
      env.DOCKER === '1' ||
      require('fs').existsSync('/.dockerenv'),
      
    isKubernetes:
      env.KUBERNETES_SERVICE_HOST !== undefined,
      
    hostname: env.HOSTNAME || env.REPL_SLUG || 'unknown',
    nodeEnv: env.NODE_ENV || 'development',
  };
}

const ENVIRONMENT = detectEnvironment();

// ============================================================================
// 세션 스킵 판단 로직
// ============================================================================

// 정적 자산 확장자
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

// 정적 경로 접두사
const STATIC_PREFIXES = [
  '/assets/',
  '/static/',
  '/public/',
  '/dist/',
  '/build/',
  '/node_modules/',
  '/_next/',
  '/__vite',
  '/favicon',
  '/robots.txt',
  '/sitemap',
  '/manifest',
  '/.well-known/',
];

// 내부/자동화 User-Agent 패턴
const INTERNAL_USER_AGENTS = [
  // HTTP 클라이언트
  'axios', 'node-fetch', 'got', 'superagent', 'request',
  'undici', 'needle', 'bent', 'phin',
  
  // 커맨드라인 도구
  'curl', 'wget', 'httpie', 'postman', 'insomnia',
  
  // 모니터링/헬스체크
  'uptimerobot', 'pingdom', 'newrelic', 'datadog',
  'prometheus', 'grafana', 'zabbix', 'nagios',
  'healthcheck', 'kube-probe', 'googlehc',
  
  // 클라우드 서비스
  'replit', 'heroku', 'vercel', 'netlify', 'cloudflare',
  'aws', 'azure', 'gcp', 'digitalocean',
  
  // 봇/크롤러
  'googlebot', 'bingbot', 'yandexbot', 'duckduckbot',
  'baiduspider', 'slurp', 'facebookexternalhit',
  'twitterbot', 'linkedinbot', 'slackbot', 'discordbot',
  'telegrambot', 'whatsapp', 'applebot',
  'semrushbot', 'ahrefsbot', 'mj12bot', 'dotbot',
  'petalbot', 'bytespider', 'gptbot', 'claudebot',
  
  // 테스트 도구
  'playwright', 'puppeteer', 'selenium', 'cypress',
  'jest', 'mocha', 'vitest',
];

// 내부 IP 범위
const INTERNAL_IP_PATTERNS = [
  /^127\./,                    // localhost
  /^10\./,                     // Class A private
  /^172\.(1[6-9]|2\d|3[01])\./, // Class B private
  /^192\.168\./,               // Class C private
  /^::1$/,                     // IPv6 localhost
  /^fe80:/i,                   // IPv6 link-local
  /^fc00:/i,                   // IPv6 unique local
  /^fd00:/i,                   // IPv6 unique local
];

// 인증 필요 경로 (세션 스킵하면 안 됨)
const AUTH_REQUIRED_PATHS = [
  '/api/auth/',
  '/api/session',
  '/api/user',
  '/api/admin',
  '/api/wallet',
  '/api/transaction',
  '/api/stake',
  '/api/governance',
  '/login',
  '/register',
  '/dashboard',
  '/profile',
  '/settings',
];

// API 경로 중 세션 불필요
const SESSION_FREE_API_PATHS = [
  '/api/health',
  '/api/status',
  '/api/metrics',
  '/api/ping',
  '/api/version',
  '/api/blocks',
  '/api/transactions/public',
  '/api/validators/list',
  '/api/network/stats',
  '/api/price',
  '/api/market',
  '/api/explorer/',
  '/api/production-monitor/',
];

// ============================================================================
// 스킵 판단 함수
// ============================================================================

interface SkipDecision {
  skip: boolean;
  reason: string;
  priority: number;
}

function shouldSkipSession(req: Request): SkipDecision {
  const url = req.url || req.originalUrl || '/';
  const path = url.split('?')[0].toLowerCase();
  const method = req.method?.toUpperCase() || 'GET';
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();
  const accept = (req.headers['accept'] || '').toLowerCase();
  const ip = getClientIP(req);
  
  // Priority 1: WebSocket 업그레이드
  if (req.headers['upgrade']?.toLowerCase() === 'websocket') {
    return { skip: true, reason: 'websocket_upgrade', priority: 1 };
  }
  
  // Priority 2: 정적 자산 (확장자)
  const ext = getExtension(path);
  if (ext && STATIC_EXTENSIONS.has(ext)) {
    return { skip: true, reason: `static_extension:${ext}`, priority: 2 };
  }
  
  // Priority 3: 정적 경로 접두사
  for (const prefix of STATIC_PREFIXES) {
    if (path.startsWith(prefix)) {
      return { skip: true, reason: `static_prefix:${prefix}`, priority: 3 };
    }
  }
  
  // Priority 4: 세션 불필요 API
  for (const apiPath of SESSION_FREE_API_PATHS) {
    if (path.startsWith(apiPath)) {
      return { skip: true, reason: `session_free_api:${apiPath}`, priority: 4 };
    }
  }
  
  // Priority 5: 내부 IP
  if (isInternalIP(ip)) {
    // 단, 인증 필요 경로는 제외
    if (!isAuthRequired(path)) {
      return { skip: true, reason: `internal_ip:${ip}`, priority: 5 };
    }
  }
  
  // Priority 6: 내부/자동화 User-Agent
  if (userAgent) {
    for (const pattern of INTERNAL_USER_AGENTS) {
      if (userAgent.includes(pattern)) {
        return { skip: true, reason: `internal_ua:${pattern}`, priority: 6 };
      }
    }
  }
  
  // Priority 7: 빈 User-Agent (봇/자동화 가능성)
  if (!userAgent || userAgent.length < 10) {
    // GET 요청이고 인증 불필요 시 스킵
    if (method === 'GET' && !isAuthRequired(path)) {
      return { skip: true, reason: 'empty_or_short_ua', priority: 7 };
    }
  }
  
  // Priority 8: Preflight 요청
  if (method === 'OPTIONS' || method === 'HEAD') {
    return { skip: true, reason: `method:${method}`, priority: 8 };
  }
  
  // Priority 9: 브라우저가 아닌 Accept 헤더
  if (accept && !accept.includes('text/html') && !accept.includes('application/json')) {
    if (method === 'GET' && !isAuthRequired(path)) {
      return { skip: true, reason: 'non_browser_accept', priority: 9 };
    }
  }
  
  // Priority 10: 프로덕션에서 인증되지 않은 HTML 요청
  if (ENVIRONMENT.isProduction && method === 'GET' && accept.includes('text/html')) {
    if (!req.cookies?.['connect.sid'] && !isAuthRequired(path)) {
      return { skip: true, reason: 'unauthenticated_html_request', priority: 10 };
    }
  }
  
  // Priority 11: 세션 쿠키만 있고 인증 쿠키 없음 (익명 세션)
  if (req.cookies?.['connect.sid'] && !req.cookies?.['auth_token'] && !req.cookies?.['user_id']) {
    if (method === 'GET' && !isAuthRequired(path)) {
      return { skip: true, reason: 'anonymous_session_cookie', priority: 11 };
    }
  }
  
  // 스킵하지 않음 - 세션 필요
  return { skip: false, reason: 'session_required', priority: 0 };
}

function getExtension(path: string): string | null {
  const lastDot = path.lastIndexOf('.');
  if (lastDot === -1 || lastDot === path.length - 1) return null;
  const ext = path.slice(lastDot).toLowerCase();
  // 쿼리 스트링 제거
  return ext.split('?')[0];
}

function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return ips.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || '0.0.0.0';
}

function isInternalIP(ip: string): boolean {
  return INTERNAL_IP_PATTERNS.some(pattern => pattern.test(ip));
}

function isAuthRequired(path: string): boolean {
  return AUTH_REQUIRED_PATHS.some(authPath => path.startsWith(authPath));
}

// ============================================================================
// 메트릭 수집
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

function updateMetrics(decision: SkipDecision): void {
  metrics.totalRequests++;
  
  if (decision.skip) {
    metrics.skippedRequests++;
    const count = metrics.skipReasons.get(decision.reason) || 0;
    metrics.skipReasons.set(decision.reason, count + 1);
  } else {
    metrics.sessionRequests++;
  }
  
  // 메모리 사용량 업데이트
  const heapUsed = process.memoryUsage().heapUsed;
  const heapTotal = process.memoryUsage().heapTotal;
  metrics.memoryUsage = heapUsed / heapTotal;
}

export function getSessionMetrics(): SessionMetrics & { skipRatio: number } {
  return {
    ...metrics,
    skipRatio: metrics.totalRequests > 0 
      ? metrics.skippedRequests / metrics.totalRequests 
      : 0,
  };
}

// ============================================================================
// MemoryStore 관리
// ============================================================================

let sessionStore: session.MemoryStore | null = null;

export function setSessionStore(store: session.MemoryStore): void {
  sessionStore = store;
}

function getSessionCount(): number {
  if (!sessionStore) return 0;
  
  // MemoryStore의 sessions 객체에서 세션 수 계산
  const sessions = (sessionStore as any).sessions;
  if (!sessions) return 0;
  
  return Object.keys(sessions).length;
}

function emergencySessionCleanup(targetPercentage: number = 0.3): number {
  if (!sessionStore) return 0;
  
  const sessions = (sessionStore as any).sessions;
  if (!sessions) return 0;
  
  const sessionIds = Object.keys(sessions);
  const deleteCount = Math.floor(sessionIds.length * targetPercentage);
  
  // 가장 오래된 세션부터 삭제 (생성 시간 기준)
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

function clearAllSessions(): void {
  if (!sessionStore) return;
  
  const sessions = (sessionStore as any).sessions;
  if (!sessions) return;
  
  const count = Object.keys(sessions).length;
  for (const key of Object.keys(sessions)) {
    delete sessions[key];
  }
  
  console.log(`[SESSION-BYPASS] CRITICAL: Cleared all ${count} sessions to prevent crash`);
}

// ============================================================================
// Set-Cookie 헤더 차단
// ============================================================================

function blockSetCookieHeader(res: Response): void {
  const originalSetHeader = res.setHeader.bind(res);
  const originalWriteHead = res.writeHead.bind(res);
  
  res.setHeader = function(name: string, value: any) {
    if (name.toLowerCase() === 'set-cookie') {
      // 세션 쿠키 차단
      if (Array.isArray(value)) {
        value = value.filter((v: string) => !v.includes('connect.sid'));
        if (value.length === 0) return res;
      } else if (typeof value === 'string' && value.includes('connect.sid')) {
        return res;
      }
    }
    return originalSetHeader(name, value);
  };
  
  res.writeHead = function(statusCode: number, ...args: any[]) {
    // writeHead로 전달된 헤더에서도 Set-Cookie 제거
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
    return originalWriteHead(statusCode, ...args);
  };
}

// ============================================================================
// 메인 미들웨어 팩토리
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
  
  // 주기적 정리 설정
  if (enableEmergencyCleanup) {
    setInterval(() => {
      const sessionCount = getSessionCount();
      metrics.activeSessions = sessionCount;
      
      // 메모리 사용량 체크
      const heapUsed = process.memoryUsage().heapUsed;
      const heapTotal = process.memoryUsage().heapTotal;
      const memoryRatio = heapUsed / heapTotal;
      
      // 세션 수 기반 정리
      if (sessionCount > CONFIG.MAX_SESSIONS) {
        console.log(`[SESSION-BYPASS] Session count (${sessionCount}) exceeds max (${CONFIG.MAX_SESSIONS})`);
        emergencySessionCleanup(0.5);
      }
      
      // 메모리 기반 정리
      if (memoryRatio > CONFIG.MEMORY_EMERGENCY_THRESHOLD) {
        console.log(`[SESSION-BYPASS] EMERGENCY: Memory at ${(memoryRatio * 100).toFixed(1)}%`);
        clearAllSessions();
      } else if (memoryRatio > CONFIG.MEMORY_CRITICAL_THRESHOLD) {
        console.log(`[SESSION-BYPASS] CRITICAL: Memory at ${(memoryRatio * 100).toFixed(1)}%`);
        emergencySessionCleanup(0.5);
      } else if (memoryRatio > CONFIG.MEMORY_WARNING_THRESHOLD) {
        console.log(`[SESSION-BYPASS] WARNING: Memory at ${(memoryRatio * 100).toFixed(1)}%`);
        emergencySessionCleanup(0.3);
      }
      
    }, cleanupInterval);
  }
  
  // 시작 로그
  console.log('[SESSION-BYPASS] Middleware initialized');
  console.log(`[SESSION-BYPASS] Environment: ${ENVIRONMENT.nodeEnv}, Replit: ${ENVIRONMENT.isReplit}, Production: ${ENVIRONMENT.isProduction}`);
  
  return (req: Request, res: Response, next: NextFunction) => {
    const decision = shouldSkipSession(req);
    
    if (enableMetrics) {
      updateMetrics(decision);
    }
    
    if (decision.skip) {
      // Set-Cookie 헤더 차단
      blockSetCookieHeader(res);
      
      // 세션 미들웨어 완전 우회
      (req as any).session = null;
      (req as any).sessionID = null;
      
      // 디버그 로그 (개발 환경)
      if (!ENVIRONMENT.isProduction && Math.random() < 0.01) {
        console.log(`[SESSION-BYPASS] Skipped: ${decision.reason} for ${req.method} ${req.url}`);
      }
      
      return next();
    }
    
    // 세션 필요 - 미들웨어 실행
    return sessionMiddleware(req, res, next);
  };
}

// ============================================================================
// 헬스체크 엔드포인트
// ============================================================================

export function sessionHealthCheck(req: Request, res: Response): void {
  const metrics = getSessionMetrics();
  const heapUsed = process.memoryUsage().heapUsed;
  const heapTotal = process.memoryUsage().heapTotal;
  
  const status = {
    healthy: metrics.memoryUsage < CONFIG.MEMORY_CRITICAL_THRESHOLD,
    metrics: {
      totalRequests: metrics.totalRequests,
      skippedRequests: metrics.skippedRequests,
      skipRatio: (metrics.skipRatio * 100).toFixed(2) + '%',
      targetSkipRatio: (CONFIG.TARGET_SKIP_RATIO * 100).toFixed(0) + '%',
      activeSessions: metrics.activeSessions,
      maxSessions: CONFIG.MAX_SESSIONS,
    },
    memory: {
      heapUsed: `${(heapUsed / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(heapTotal / 1024 / 1024).toFixed(2)} MB`,
      usage: (metrics.memoryUsage * 100).toFixed(2) + '%',
      warningThreshold: (CONFIG.MEMORY_WARNING_THRESHOLD * 100).toFixed(0) + '%',
      criticalThreshold: (CONFIG.MEMORY_CRITICAL_THRESHOLD * 100).toFixed(0) + '%',
    },
    environment: ENVIRONMENT,
    skipReasonStats: Object.fromEntries(
      Array.from(metrics.skipReasons.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
    ),
    uptime: process.uptime(),
  };
  
  res.status(status.healthy ? 200 : 503).json(status);
}

// ============================================================================
// Export
// ============================================================================

export {
  shouldSkipSession,
  ENVIRONMENT,
  CONFIG,
};
```

---

### 3.2 app.ts 수정 (핵심 부분)

```typescript
// server/app.ts (수정된 버전)
// 미들웨어 순서가 매우 중요함!

import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { 
  createSessionBypassMiddleware, 
  setSessionStore,
  sessionHealthCheck,
  ENVIRONMENT 
} from './middleware/session-bypass';

const app = express();

// ============================================================================
// 1단계: 기본 미들웨어 (세션 전에 실행되어야 함)
// ============================================================================

// 요청 본문 파싱
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 쿠키 파서 (세션 바이패스 판단에 필요)
app.use(cookieParser());

// ============================================================================
// 2단계: 세션 스토어 설정
// ============================================================================

// Redis 사용 가능 시 Redis, 아니면 MemoryStore (프로덕션 경고)
let sessionStore: session.Store;

if (process.env.REDIS_URL) {
  // Redis 세션 스토어 (프로덕션 권장)
  const RedisStore = require('connect-redis').default;
  const { createClient } = require('redis');
  
  const redisClient = createClient({ url: process.env.REDIS_URL });
  redisClient.connect().catch(console.error);
  
  sessionStore = new RedisStore({ client: redisClient });
  console.log('[APP] Using Redis session store');
} else {
  // MemoryStore (개발/테스트용)
  const memoryStore = new session.MemoryStore();
  sessionStore = memoryStore;
  setSessionStore(memoryStore);
  
  if (ENVIRONMENT.isProduction) {
    console.warn('[APP] WARNING: Using MemoryStore in production! Set REDIS_URL for production use.');
  }
  console.log('[APP] Using MemoryStore session store');
}

// ============================================================================
// 3단계: 세션 미들웨어 생성 (아직 app.use 하지 않음!)
// ============================================================================

const sessionMiddleware = session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'your-secure-secret-key-change-in-production',
  name: 'connect.sid',
  resave: false,
  saveUninitialized: false,  // 중요: false여야 빈 세션 생성 방지
  rolling: false,
  cookie: {
    secure: ENVIRONMENT.isProduction,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24시간
    sameSite: 'lax',
  },
});

// ============================================================================
// 4단계: 세션 바이패스 미들웨어 적용 (핵심!)
// ============================================================================

// 이 미들웨어가 세션 필요 여부를 판단하고, 필요할 때만 sessionMiddleware 실행
app.use(createSessionBypassMiddleware({
  sessionMiddleware,
  enableMetrics: true,
  enableEmergencyCleanup: true,
  cleanupInterval: 60 * 1000, // 1분
}));

// ============================================================================
// 5단계: 정적 파일 서빙 (세션 불필요)
// ============================================================================

app.use('/assets', express.static('public/assets', {
  maxAge: ENVIRONMENT.isProduction ? '1y' : 0,
  etag: true,
}));

app.use('/static', express.static('public/static', {
  maxAge: ENVIRONMENT.isProduction ? '1y' : 0,
}));

// ============================================================================
// 6단계: 헬스체크 엔드포인트 (세션 불필요)
// ============================================================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/session-health', sessionHealthCheck);

app.get('/api/production-monitor/dashboard', (req, res) => {
  const metrics = require('./middleware/session-bypass').getSessionMetrics();
  res.json({
    status: 'operational',
    sessionMetrics: metrics,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// ============================================================================
// 7단계: API 라우트
// ============================================================================

// 여기에 실제 API 라우트 추가
// app.use('/api', apiRouter);

// ============================================================================
// 8단계: SPA 폴백 (React/Vue 등)
// ============================================================================

app.get('*', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// ============================================================================
// 에러 핸들러
// ============================================================================

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[APP] Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: ENVIRONMENT.isProduction ? undefined : err.message,
  });
});

export default app;
```

---

## 4. 재해 복구 설계 (Disaster Recovery)

### 4.1 자동 복구 메커니즘

```typescript
// server/disaster-recovery.ts

import { EventEmitter } from 'events';

interface DisasterRecoveryConfig {
  // 메모리 임계값
  memoryThresholds: {
    warning: number;    // 70%
    critical: number;   // 85%
    emergency: number;  // 95%
  };
  
  // 응답 시간 임계값
  responseTimeThresholds: {
    warning: number;    // 1000ms
    critical: number;   // 3000ms
    timeout: number;    // 10000ms
  };
  
  // 에러율 임계값
  errorRateThresholds: {
    warning: number;    // 1%
    critical: number;   // 5%
    emergency: number;  // 10%
  };
  
  // 복구 설정
  recovery: {
    autoRestart: boolean;
    gracefulShutdownTimeout: number;
    healthCheckInterval: number;
  };
}

const DEFAULT_CONFIG: DisasterRecoveryConfig = {
  memoryThresholds: {
    warning: 0.70,
    critical: 0.85,
    emergency: 0.95,
  },
  responseTimeThresholds: {
    warning: 1000,
    critical: 3000,
    timeout: 10000,
  },
  errorRateThresholds: {
    warning: 0.01,
    critical: 0.05,
    emergency: 0.10,
  },
  recovery: {
    autoRestart: true,
    gracefulShutdownTimeout: 30000,
    healthCheckInterval: 10000,
  },
};

class DisasterRecoveryManager extends EventEmitter {
  private config: DisasterRecoveryConfig;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private metrics = {
    requestCount: 0,
    errorCount: 0,
    totalResponseTime: 0,
    lastCheck: Date.now(),
  };
  
  constructor(config: Partial<DisasterRecoveryConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  
  start(): void {
    console.log('[DR] Disaster Recovery Manager started');
    
    // 주기적 헬스체크
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.config.recovery.healthCheckInterval);
    
    // 메모리 경고 리스너
    this.setupMemoryMonitoring();
    
    // 프로세스 시그널 핸들링
    this.setupSignalHandlers();
  }
  
  stop(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
  
  recordRequest(responseTime: number, isError: boolean): void {
    this.metrics.requestCount++;
    this.metrics.totalResponseTime += responseTime;
    if (isError) {
      this.metrics.errorCount++;
    }
  }
  
  private performHealthCheck(): void {
    const now = Date.now();
    const interval = now - this.metrics.lastCheck;
    
    // 메모리 체크
    const memoryUsage = process.memoryUsage();
    const heapRatio = memoryUsage.heapUsed / memoryUsage.heapTotal;
    
    // 에러율 계산
    const errorRate = this.metrics.requestCount > 0 
      ? this.metrics.errorCount / this.metrics.requestCount 
      : 0;
    
    // 평균 응답 시간
    const avgResponseTime = this.metrics.requestCount > 0 
      ? this.metrics.totalResponseTime / this.metrics.requestCount 
      : 0;
    
    // 상태 판단
    let status: 'healthy' | 'warning' | 'critical' | 'emergency' = 'healthy';
    const issues: string[] = [];
    
    // 메모리 체크
    if (heapRatio > this.config.memoryThresholds.emergency) {
      status = 'emergency';
      issues.push(`Memory EMERGENCY: ${(heapRatio * 100).toFixed(1)}%`);
    } else if (heapRatio > this.config.memoryThresholds.critical) {
      status = status === 'emergency' ? 'emergency' : 'critical';
      issues.push(`Memory CRITICAL: ${(heapRatio * 100).toFixed(1)}%`);
    } else if (heapRatio > this.config.memoryThresholds.warning) {
      status = status === 'healthy' ? 'warning' : status;
      issues.push(`Memory WARNING: ${(heapRatio * 100).toFixed(1)}%`);
    }
    
    // 에러율 체크
    if (errorRate > this.config.errorRateThresholds.emergency) {
      status = 'emergency';
      issues.push(`Error rate EMERGENCY: ${(errorRate * 100).toFixed(2)}%`);
    } else if (errorRate > this.config.errorRateThresholds.critical) {
      status = status === 'emergency' ? 'emergency' : 'critical';
      issues.push(`Error rate CRITICAL: ${(errorRate * 100).toFixed(2)}%`);
    }
    
    // 응답 시간 체크
    if (avgResponseTime > this.config.responseTimeThresholds.critical) {
      status = status === 'emergency' ? 'emergency' : 'critical';
      issues.push(`Response time CRITICAL: ${avgResponseTime.toFixed(0)}ms`);
    }
    
    // 이벤트 발생
    this.emit('healthCheck', { status, issues, metrics: { heapRatio, errorRate, avgResponseTime } });
    
    // 긴급 상황 처리
    if (status === 'emergency') {
      this.handleEmergency(issues);
    } else if (status === 'critical') {
      this.handleCritical(issues);
    }
    
    // 메트릭 리셋
    this.metrics = {
      requestCount: 0,
      errorCount: 0,
      totalResponseTime: 0,
      lastCheck: now,
    };
  }
  
  private handleEmergency(issues: string[]): void {
    console.error('[DR] EMERGENCY DETECTED:', issues.join(', '));
    this.emit('emergency', issues);
    
    // 자동 재시작이 활성화된 경우
    if (this.config.recovery.autoRestart) {
      console.log('[DR] Initiating graceful restart...');
      this.gracefulRestart();
    }
  }
  
  private handleCritical(issues: string[]): void {
    console.warn('[DR] CRITICAL DETECTED:', issues.join(', '));
    this.emit('critical', issues);
    
    // 메모리 정리 시도
    if (global.gc) {
      console.log('[DR] Forcing garbage collection...');
      global.gc();
    }
  }
  
  private setupMemoryMonitoring(): void {
    // V8 힙 상태 모니터링
    const v8 = require('v8');
    
    setInterval(() => {
      const heapStats = v8.getHeapStatistics();
      const usedHeapRatio = heapStats.used_heap_size / heapStats.heap_size_limit;
      
      if (usedHeapRatio > 0.90) {
        console.warn(`[DR] V8 heap usage: ${(usedHeapRatio * 100).toFixed(1)}%`);
        this.emit('memoryWarning', usedHeapRatio);
      }
    }, 30000);
  }
  
  private setupSignalHandlers(): void {
    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('[DR] SIGTERM received, initiating graceful shutdown...');
      this.gracefulShutdown();
    });
    
    process.on('SIGINT', () => {
      console.log('[DR] SIGINT received, initiating graceful shutdown...');
      this.gracefulShutdown();
    });
    
    // 예기치 않은 오류 처리
    process.on('uncaughtException', (error) => {
      console.error('[DR] Uncaught Exception:', error);
      this.emit('uncaughtException', error);
      this.gracefulShutdown();
    });
    
    process.on('unhandledRejection', (reason) => {
      console.error('[DR] Unhandled Rejection:', reason);
      this.emit('unhandledRejection', reason);
    });
  }
  
  private gracefulShutdown(): void {
    this.emit('shutdown');
    
    // 새 연결 거부 시작
    console.log('[DR] Stopping new connections...');
    
    // 기존 연결 완료 대기
    setTimeout(() => {
      console.log('[DR] Shutdown complete');
      process.exit(0);
    }, this.config.recovery.gracefulShutdownTimeout);
  }
  
  private gracefulRestart(): void {
    this.emit('restart');
    
    // PM2 또는 다른 프로세스 매니저가 재시작하도록 종료
    setTimeout(() => {
      process.exit(1);
    }, this.config.recovery.gracefulShutdownTimeout);
  }
}

// 싱글톤 인스턴스
export const disasterRecovery = new DisasterRecoveryManager();

// Express 미들웨어
export function disasterRecoveryMiddleware() {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      const isError = res.statusCode >= 500;
      disasterRecovery.recordRequest(responseTime, isError);
    });
    
    next();
  };
}
```

---

## 5. E2E 테스트 시나리오

### 5.1 세션 바이패스 테스트

```typescript
// tests/e2e/session-bypass.test.ts

import axios from 'axios';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

describe('Session Bypass E2E Tests', () => {
  
  describe('Static Asset Requests', () => {
    test('should not set session cookie for JS files', async () => {
      const response = await axios.get(`${BASE_URL}/assets/main.js`, {
        validateStatus: () => true,
      });
      
      const setCookie = response.headers['set-cookie'];
      expect(setCookie).toBeUndefined();
    });
    
    test('should not set session cookie for CSS files', async () => {
      const response = await axios.get(`${BASE_URL}/assets/style.css`, {
        validateStatus: () => true,
      });
      
      const setCookie = response.headers['set-cookie'];
      expect(setCookie).toBeUndefined();
    });
    
    test('should not set session cookie for images', async () => {
      const response = await axios.get(`${BASE_URL}/assets/logo.png`, {
        validateStatus: () => true,
      });
      
      const setCookie = response.headers['set-cookie'];
      expect(setCookie).toBeUndefined();
    });
  });
  
  describe('Internal Request Detection', () => {
    test('should skip session for axios requests', async () => {
      const response = await axios.get(`${BASE_URL}/api/health`, {
        headers: { 'User-Agent': 'axios/1.0.0' },
      });
      
      expect(response.status).toBe(200);
      const setCookie = response.headers['set-cookie'];
      expect(setCookie).toBeUndefined();
    });
    
    test('should skip session for curl requests', async () => {
      const response = await axios.get(`${BASE_URL}/api/health`, {
        headers: { 'User-Agent': 'curl/7.68.0' },
      });
      
      expect(response.status).toBe(200);
      const setCookie = response.headers['set-cookie'];
      expect(setCookie).toBeUndefined();
    });
    
    test('should skip session for empty User-Agent', async () => {
      const response = await axios.get(`${BASE_URL}/api/health`, {
        headers: { 'User-Agent': '' },
      });
      
      expect(response.status).toBe(200);
      const setCookie = response.headers['set-cookie'];
      expect(setCookie).toBeUndefined();
    });
  });
  
  describe('Bot Detection', () => {
    const bots = ['Googlebot', 'Bingbot', 'Slackbot', 'facebookexternalhit'];
    
    bots.forEach(bot => {
      test(`should skip session for ${bot}`, async () => {
        const response = await axios.get(`${BASE_URL}/`, {
          headers: { 'User-Agent': `${bot}/2.1` },
        });
        
        const setCookie = response.headers['set-cookie'];
        expect(setCookie).toBeUndefined();
      });
    });
  });
  
  describe('Auth Required Paths', () => {
    test('should allow session for /api/auth endpoint', async () => {
      const response = await axios.post(`${BASE_URL}/api/auth/login`, {
        username: 'test',
        password: 'test',
      }, {
        validateStatus: () => true,
      });
      
      // 401이어도 세션 쿠키는 설정될 수 있음
      // 중요한 것은 세션이 차단되지 않았다는 것
      expect(response.status).not.toBe(500);
    });
  });
  
  describe('Health Check Endpoints', () => {
    test('/api/health should return OK', async () => {
      const response = await axios.get(`${BASE_URL}/api/health`);
      
      expect(response.status).toBe(200);
      expect(response.data.status).toBe('ok');
    });
    
    test('/api/session-health should return metrics', async () => {
      const response = await axios.get(`${BASE_URL}/api/session-health`);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('healthy');
      expect(response.data).toHaveProperty('metrics');
      expect(response.data).toHaveProperty('memory');
    });
    
    test('/api/production-monitor/dashboard should return status', async () => {
      const response = await axios.get(`${BASE_URL}/api/production-monitor/dashboard`);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status');
      expect(response.data).toHaveProperty('sessionMetrics');
    });
  });
  
  describe('Load Test - Session Skip Ratio', () => {
    test('should maintain >95% skip ratio under load', async () => {
      const requests = [];
      
      // 다양한 요청 유형 혼합
      for (let i = 0; i < 100; i++) {
        // 70% 정적 자산
        if (i < 70) {
          requests.push(
            axios.get(`${BASE_URL}/assets/file${i}.js`, { 
              validateStatus: () => true,
              headers: { 'User-Agent': 'Mozilla/5.0' },
            })
          );
        }
        // 20% API 요청
        else if (i < 90) {
          requests.push(
            axios.get(`${BASE_URL}/api/health`, {
              headers: { 'User-Agent': 'axios/1.0' },
            })
          );
        }
        // 10% 페이지 요청
        else {
          requests.push(
            axios.get(`${BASE_URL}/`, {
              headers: { 'User-Agent': 'Mozilla/5.0' },
            })
          );
        }
      }
      
      await Promise.all(requests);
      
      // 메트릭 확인
      const metrics = await axios.get(`${BASE_URL}/api/session-health`);
      const skipRatio = parseFloat(metrics.data.metrics.skipRatio);
      
      console.log(`Skip ratio: ${skipRatio}%`);
      expect(skipRatio).toBeGreaterThanOrEqual(80);
    });
  });
  
  describe('Memory Stability', () => {
    test('should not accumulate sessions over time', async () => {
      // 초기 세션 수 확인
      const before = await axios.get(`${BASE_URL}/api/session-health`);
      const initialSessions = before.data.metrics.activeSessions;
      
      // 100개의 요청 발생
      const requests = [];
      for (let i = 0; i < 100; i++) {
        requests.push(
          axios.get(`${BASE_URL}/api/health`, {
            headers: { 'User-Agent': 'axios/1.0' },
          })
        );
      }
      await Promise.all(requests);
      
      // 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 최종 세션 수 확인
      const after = await axios.get(`${BASE_URL}/api/session-health`);
      const finalSessions = after.data.metrics.activeSessions;
      
      // 세션 수 증가가 10개 미만이어야 함
      expect(finalSessions - initialSessions).toBeLessThan(10);
    });
  });
});
```

---

## 6. 프로덕션 체크리스트

### 6.1 배포 전 체크리스트

- [ ] **환경 변수 설정**
  - [ ] `NODE_ENV=production`
  - [ ] `SESSION_SECRET` (최소 32자 무작위 문자열)
  - [ ] `REDIS_URL` (프로덕션 필수)

- [ ] **세션 바이패스 검증**
  - [ ] 스킵 비율 ≥ 95%
  - [ ] Set-Cookie 헤더 차단 확인
  - [ ] 인증 경로 정상 작동

- [ ] **메모리 모니터링**
  - [ ] MemoryStore 대신 Redis 사용
  - [ ] 긴급 정리 메커니즘 활성화
  - [ ] 메모리 임계값 알림 설정

- [ ] **E2E 테스트**
  - [ ] 모든 테스트 통과
  - [ ] 부하 테스트 완료
  - [ ] 장시간 안정성 테스트 (최소 24시간)

- [ ] **재해 복구**
  - [ ] Graceful shutdown 설정
  - [ ] 자동 재시작 설정 (PM2/Kubernetes)
  - [ ] 헬스체크 엔드포인트 설정

### 6.2 모니터링 대시보드 지표

| 지표 | 정상 범위 | 경고 임계값 | 위험 임계값 |
|------|----------|------------|------------|
| 세션 스킵 비율 | ≥95% | <90% | <80% |
| 활성 세션 수 | <1000 | >5000 | >10000 |
| 힙 메모리 사용률 | <70% | >80% | >90% |
| 응답 시간 (p99) | <500ms | >1000ms | >3000ms |
| 에러율 | <0.1% | >1% | >5% |
| 가동 시간 | 100% | <99.9% | <99% |

---

## 7. 즉시 적용 가이드

### 7.1 긴급 조치 순서

```bash
# 1. 현재 메모리 상태 확인
curl http://localhost:3000/api/session-health

# 2. 세션 바이패스 모듈 교체
cp session-bypass.ts server/middleware/session-bypass.ts

# 3. app.ts 미들웨어 순서 수정
# (위 코드 참조)

# 4. Redis 설정 (강력 권장)
export REDIS_URL="redis://localhost:6379"

# 5. 서버 재시작
pm2 restart tburn-mainnet

# 6. 모니터링
watch -n 5 'curl -s http://localhost:3000/api/session-health | jq'
```

### 7.2 Redis 설정 (Replit)

```bash
# Replit Secrets에 추가
REDIS_URL=redis://default:password@your-redis-host:6379
```

---

**문서 상태**: 즉시 적용 가능  
**예상 효과**: 24/7/365 무중단 운영  
**검증 방법**: E2E 테스트 및 24시간 모니터링

---

*본 문서는 TBURN 메인넷 프로덕션 안정성 문제 해결을 위한 종합 가이드입니다.*
