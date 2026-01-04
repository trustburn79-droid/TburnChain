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
  // ★ [수정 6] 세션 오버플로우 방지를 위해 용량 증가 및 정리 주기 단축
  sessionStore = new MemoryStore({
    checkPeriod: 60000, // ★ 1분마다 만료된 세션 정리 (기존 5분에서 단축)
    max: 2000, // ★ 최대 2000개 세션으로 증가 (기존 500)
    ttl: 1800000, // ★ 세션 TTL 30분으로 단축 (기존 1시간)
    stale: false, // ★ 만료된 세션 즉시 삭제 (메모리 절약)
    dispose: (key: string) => {
      // 세션 삭제 로깅 (디버깅용)
      if (process.env.DEBUG_SESSION === 'true') {
        console.log(`[Session] Disposed session: ${key.substring(0, 8)}...`);
      }
    }
  });
  sessionStoreType = "MemoryStore (max: 2000, TTL: 30m, cleanup: 1m)";
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
app.use((req: Request, res: Response, next: NextFunction) => {
  // 내부 API 호출 감지 (X-Internal-Request 헤더 또는 localhost fetch)
  const isInternalRequest = req.headers['x-internal-request'] === 'true';
  
  // ★ 세션이 불필요한 경로 - 오직 공개 읽기 전용 API만 (관리자 API 제외)
  // 주의: 너무 광범위한 경로를 포함하면 관리자 인증이 깨짐
  const skipSessionPaths = [
    '/api/public/',              // 공개 API (인증 불필요)
    '/api/health',               // 헬스 체크
    '/health',                   // 루트 헬스 체크
    '/api/public/v1/',           // 공개 API v1
    '/api/shard-cache/',         // 샤드 캐시 API (공개)
    '/api/cross-shard-router/',  // 크로스 샤드 라우터 API (공개)
  ];
  
  // ★ 추가: GET 요청이면서 공개 데이터 조회인 경우만 스킵
  // 관리자 경로(admin, maintenance, config 등)는 반드시 세션 유지
  const publicReadOnlyGetPaths = [
    '/api/network/stats',        // 네트워크 통계 조회
    '/api/shard-cache/',         // 샤드 캐시 API (공개)
    '/api/cross-shard-router/',  // 크로스 샤드 라우터 API (공개)
  ];
  
  // ★ 정확한 경로 매칭 - 하위 경로가 있으면 스킵하지 않음
  const exactPublicGetPaths = [
    '/api/shards',               // 정확히 /api/shards만 (하위 경로 아님)
    '/api/blocks',               // 정확히 /api/blocks만
    '/api/transactions',         // 정확히 /api/transactions만
  ];
  
  // 관리자/인증 필요 경로 패턴 (세션 유지 필수)
  const requiresSession = 
    req.path.includes('/admin') ||
    req.path.includes('/config') ||
    req.path.includes('/maintenance') ||
    req.path.includes('/auth') ||
    req.path.includes('/user') ||
    req.path.includes('/member');
  
  // 이미 인증 쿠키가 있으면 세션 스킵하지 않음
  const hasSessionCookie = !!req.headers.cookie?.includes('connect.sid');
  
  const isPublicReadOnlyGet = req.method === 'GET' && 
    !requiresSession &&
    !hasSessionCookie &&
    (publicReadOnlyGetPaths.some(path => req.path.startsWith(path)) ||
     exactPublicGetPaths.includes(req.path));
  
  const shouldSkipSession = !requiresSession &&
    !hasSessionCookie &&
    (isInternalRequest || 
     skipSessionPaths.some(path => req.path.startsWith(path)) ||
     isPublicReadOnlyGet);
  
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
