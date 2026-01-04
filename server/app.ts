import { type Server } from "node:http";
import express, {
  type Express,
  type Request,
  Response,
  NextFunction,
} from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import createMemoryStore from "memorystore";
import { createClient } from "redis";
import { Pool } from "@neondatabase/serverless";
import { registerRoutes } from "./routes";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { initializeBlockchainOrchestrator, shutdownBlockchainOrchestrator } from "./services/blockchain-orchestrator";

// ★ [수정 1] connect-redis 불러오는 방식 변경 (ESM 호환)
import { RedisStore } from "connect-redis";
import { sessionMetrics } from "./core/monitoring/session-metrics";

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

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

// ★ [수정 3] 세션 스토어 단순화 - REDIS_URL 있을 때만 Redis 사용
const REDIS_URL = process.env.REDIS_URL;
const hasRedis = !!REDIS_URL; // REDIS_URL이 명시적으로 설정된 경우만 Redis 사용

// ★ 쿠키 보안 설정 - 프로덕션 환경 자동 감지
// Replit Autoscale 배포 시 HTTPS가 자동으로 활성화되므로 secure 쿠키 필요
const isProduction = process.env.NODE_ENV === "production" || !process.env.REPL_ID;
const cookieSecure = isProduction || process.env.COOKIE_SECURE === "true";

let sessionStore: session.Store;
let sessionStoreType: string;

// ★ [수정 4] 세션 스토어 선택 - 안전한 폴백
// REDIS_URL이 명시적으로 설정된 경우에만 Redis 사용, 그 외에는 MemoryStore
if (hasRedis) {
  // Redis가 설정된 환경: Redis 사용
  console.log(`[Init] Attempting to connect to Redis...`);

  const redisClient = createClient({ url: REDIS_URL });

  redisClient.on("error", (err) => {
    console.error("[Redis] Connection Error:", err);
  });
  redisClient.on("connect", () => {
    log("✅ Redis connected successfully", "session");
  });

  // Redis 클라이언트 연결 시작
  redisClient.connect().catch(console.error);

  // 세션 스토어로 Redis 지정
  sessionStore = new RedisStore({ 
    client: redisClient,
    prefix: "tburn:",
  });
  sessionStoreType = "Redis";
} else {
  // Redis가 없는 환경: MemoryStore 사용 (Replit 개발 및 Autoscale 배포 모두)
  // ★ [수정 6] 프로덕션 안정성 - 세션 오버플로우 완전 방지
  // 프로덕션에서는 10000개로 증가, 개발에서는 2000개
  const maxSessions = isProduction ? 10000 : 2000;
  sessionStore = new MemoryStore({
    checkPeriod: 30000, // ★ 30초마다 만료된 세션 정리 (더 적극적)
    max: maxSessions, // ★ 프로덕션 10000 / 개발 2000
    ttl: 1800000, // ★ 세션 TTL 30분
    stale: false, // ★ 만료된 세션 즉시 삭제 (메모리 절약)
    dispose: (key: string) => {
      // 세션 삭제 로깅 (디버깅용)
      if (process.env.DEBUG_SESSION === 'true') {
        console.log(`[Session] Disposed session: ${key.substring(0, 8)}...`);
      }
    }
  });
  sessionStoreType = `MemoryStore (max: ${maxSessions}, TTL: 30m, cleanup: 30s)`;
  console.log(`[Session] ⚠️ Using MemoryStore - for production scale, configure REDIS_URL`);
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

// ★ 조건부 세션 미들웨어: 내부 호출 및 세션이 불필요한 경로 건너뛰기
// ★ [2026-01-04 프로덕션 안정성 수정] - 세션 오버플로우 완전 방지
app.use((req: Request, res: Response, next: NextFunction) => {
  // ★ 경로 정규화 - 트레일링 슬래시 제거하여 일관된 매칭
  const normalizedPath = req.path.endsWith('/') && req.path.length > 1 
    ? req.path.slice(0, -1) 
    : req.path;
  
  // 내부 API 호출 감지 (X-Internal-Request 헤더 또는 특정 User-Agent)
  // ★ axios, node-fetch, undici, got 등 모든 내부 HTTP 클라이언트 감지
  const userAgent = req.headers['user-agent'] || '';
  const isInternalRequest = 
    req.headers['x-internal-request'] === 'true' ||
    userAgent.includes('node-fetch') ||
    userAgent.includes('undici') ||
    userAgent.includes('axios') ||
    userAgent.includes('got') ||
    userAgent.includes('node') ||
    userAgent === '' ||  // 빈 User-Agent는 내부 호출로 간주
    req.ip === '127.0.0.1' ||
    req.ip === '::1' ||
    req.ip === '::ffff:127.0.0.1';
  
  // ★ [프로덕션 안정성] 세션 스킵 경로 - 접두사 기반 매칭 (슬래시 없이)
  // 이 경로들은 공개 API이며 세션이 필요하지 않음
  const skipSessionPrefixes = [
    '/api/public',                // 공개 API 전체
    '/api/health',                // 헬스 체크
    '/health',                    // 루트 헬스 체크
    '/api/shard-cache',           // 샤드 캐시 API 전체 ★ 슬래시 제거
    '/api/cross-shard-router',    // 크로스 샤드 라우터 API 전체 ★ 슬래시 제거
    '/api/shard-rebalancer',      // 샤드 리밸런서 API 전체 ★ 슬래시 제거
    '/api/batch-processor',       // 배치 프로세서 API 전체 ★ 슬래시 제거
    '/api/validators/status',     // 검증자 상태 (공개)
    '/api/validators/stats',      // 검증자 통계 (공개)
    '/api/rewards/stats',         // 보상 통계 (공개)
    '/api/rewards/epoch',         // 에포크 정보 (공개)
    '/api/network/stats',         // 네트워크 통계 (공개)
    '/api/scalability',           // 확장성 API (공개)
    '/api/consensus/state',       // 합의 상태 (공개)
    '/api/block-production',      // 블록 생산 (공개)
    '/api/internal',              // 내부 모니터링 API (★ Phase 16)
    '/api/soak-tests',            // Soak 테스트 API (★ Phase 16)
  ];
  
  // ★ 정확히 일치해야 하는 GET 경로 (하위 경로 스킵 안 함)
  const exactGetPaths = [
    '/api/shards',                // 샤드 목록
    '/api/blocks',                // 블록 목록
    '/api/transactions',          // 트랜잭션 목록
    '/api/wallets',               // 지갑 목록
    '/api/contracts',             // 컨트랙트 목록
  ];
  
  // ★ 접두사 매칭 함수 - skipSessionPrefixes 확인 (requiresSession보다 먼저 체크)
  const matchesSkipPrefix = skipSessionPrefixes.some(prefix => 
    normalizedPath === prefix || normalizedPath.startsWith(prefix + '/')
  );
  
  // ★ 관리자/인증 필요 경로 패턴 (세션 유지 필수) - 더 포괄적인 체크
  // 단, skipSessionPrefixes에 매칭되면 세션 필요 없음 (내부 모니터링 API 우선)
  const requiresSession = !matchesSkipPrefix && (
    normalizedPath.includes('/admin') ||
    normalizedPath.includes('/config') ||
    normalizedPath.includes('/maintenance') ||
    normalizedPath.includes('/auth') ||
    normalizedPath.includes('/user') ||
    normalizedPath.includes('/member') ||
    normalizedPath.includes('/login') ||
    normalizedPath.includes('/logout') ||
    normalizedPath.includes('/session') ||
    // POST/PUT/DELETE on protected routes
    (req.method !== 'GET' && (
      normalizedPath.includes('/start') ||
      normalizedPath.includes('/stop') ||
      normalizedPath.includes('/benchmark')
    ))
  );
  
  // 이미 인증 쿠키가 있으면 세션 스킵하지 않음 (기존 세션 유지)
  const hasSessionCookie = !!req.headers.cookie?.includes('connect.sid');
  
  // ★ 정확한 경로 매칭
  const matchesExact = req.method === 'GET' && exactGetPaths.includes(normalizedPath);
  
  // ★ 세션 스킵 조건: 
  // 1. 관리자 경로가 아니고
  // 2. (내부 요청이거나 공개 API 경로) - 내부 요청은 쿠키 유무와 관계없이 스킵
  // 3. 외부 요청의 경우 쿠키가 있으면 기존 세션 사용
  const shouldSkipSession = !requiresSession && (
    isInternalRequest ||  // ★ 내부 요청은 항상 스킵 (쿠키 유무 관계없음)
    (!hasSessionCookie && (matchesSkipPrefix || matchesExact))  // 외부 요청: 쿠키 없고 공개 경로
  );
  
  if (shouldSkipSession) {
    sessionSkipCount++;
    // 세션 없이 빈 세션 객체만 제공 (세션 저장소에 저장하지 않음)
    (req as any).session = {
      id: 'skip-session',
      cookie: {},
      regenerate: (cb: any) => cb && cb(),
      destroy: (cb: any) => cb && cb(),
      reload: (cb: any) => cb && cb(),
      save: (cb: any) => cb && cb(),
      touch: () => {},
    };
    return next();
  }
  
  sessionCreateCount++;
  
  // 10분마다 세션 사용량 리포트
  const now = Date.now();
  if (now - lastSessionReport > 600000) {
    console.log(`[Session Monitor] Created: ${sessionCreateCount}, Skipped: ${sessionSkipCount}, Ratio: ${(sessionSkipCount / (sessionCreateCount + sessionSkipCount) * 100).toFixed(1)}% skipped`);
    lastSessionReport = now;
  }
  
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
  app.use(passport.session());
  
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

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  await setup(app, server);

  // Initialize Enterprise Scalability Infrastructure (dev mode)
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

  // Graceful shutdown handler
  process.on('SIGTERM', async () => {
    log(`🛑 SIGTERM received, shutting down gracefully...`, "shutdown");
    try {
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
  });
}
