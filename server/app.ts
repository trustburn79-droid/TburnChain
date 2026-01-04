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
import { 
  shouldBypassSession, 
  blockSetCookie, 
  createSkipSession,
  checkMemoryStoreCapacity 
} from "./core/sessions/session-bypass";
import { productionMonitor } from "./core/monitoring/enterprise-production-monitor";

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

// ★ 쿠키 보안 설정 - 프로덕션 환경 자동 감지
// Replit Autoscale 배포 시 HTTPS가 자동으로 활성화되므로 secure 쿠키 필요
// ★ [수정] 프로덕션 환경 감지 - session-bypass.ts와 일관성 유지
const isProduction = (
  process.env.REPLIT_DEPLOYMENT === '1' ||
  process.env.NODE_ENV === 'production' ||
  (process.env.REPL_ID && !process.env.REPLIT_DEV_DOMAIN)
) && process.env.NODE_ENV !== 'development';
const cookieSecure = isProduction || process.env.COOKIE_SECURE === "true";

let sessionStore: session.Store;
let sessionStoreType: string;
let isUsingMemoryStore = false;
let memoryStoreRef: InstanceType<typeof MemoryStore> | null = null;

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
  const memStore = new MemoryStore({
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
  sessionStore = memStore;
  memoryStoreRef = memStore;
  isUsingMemoryStore = true;
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
    maxSessions: isProduction ? 10000 : 2000,
    getActiveCount: getActiveSessionCount
  };
}

// ★ [2026-01-04 프로덕션 안정성 수정] - 통합 세션 바이패스 모듈 사용
// ★ 조건부 세션 미들웨어: 내부 호출 및 세션이 불필요한 경로 건너뛰기
app.use((req: Request, res: Response, next: NextFunction) => {
  // ★ 통합 세션 바이패스 모듈 사용 (개발/프로덕션 일관성)
  const bypassResult = shouldBypassSession(req);
  
  if (bypassResult.shouldSkip) {
    sessionSkipCount++;
    
    // ★ [핵심 수정] Set-Cookie 헤더 차단 - 세션 스킵 시 쿠키 설정 방지
    blockSetCookie(res);
    
    // 세션 없이 빈 세션 객체만 제공 (세션 저장소에 저장하지 않음)
    (req as any).session = createSkipSession();
    
    // ★ [엔터프라이즈 모니터링] 세션 스킵 기록
    productionMonitor.recordSessionSkip();
    
    // 디버깅용 로깅 (선택적)
    if (process.env.DEBUG_SESSION === 'true') {
      console.log(`[Session Skip] ${req.method} ${req.path} - reason: ${bypassResult.reason}`);
    }
    
    return next();
  }
  
  sessionCreateCount++;
  
  // ★ [엔터프라이즈 모니터링] 세션 생성 기록
  productionMonitor.recordSessionCreate();
  
  // ★ MemoryStore 용량 모니터링 (프로덕션 안정성)
  const maxSessions = isProduction ? 10000 : 2000;
  const activeCount = getActiveSessionCount();
  checkMemoryStoreCapacity(activeCount, maxSessions);
  
  // ★ [엔터프라이즈 모니터링] MemoryStore 용량 업데이트 - 실제 활성 세션 수 사용
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

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    // ★ [Production Stability] 에러 로깅 (throw 대신)
    console.error(`[Error Handler] ${req.method} ${req.path}: ${status} - ${message}`);
    if (err.stack) {
      console.error(`[Error Stack] ${err.stack}`);
    }
    
    // 응답이 이미 전송된 경우 무시
    if (res.headersSent) {
      return;
    }
    
    res.status(status).json({ 
      message,
      path: req.path,
      timestamp: new Date().toISOString()
    });
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
