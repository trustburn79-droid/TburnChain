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
  // ★ 메모리 누수 방지: 짧은 정리 주기 + 최대 세션 수 제한
  sessionStore = new MemoryStore({
    checkPeriod: 300000, // 5분마다 만료된 세션 정리 (메모리 누수 방지)
    max: 500, // 최대 500개 세션 (초과 시 가장 오래된 세션 삭제)
    ttl: 3600000, // 세션 TTL 1시간 (메모리에서 빠르게 해제)
    stale: true, // 만료된 세션도 일시적으로 허용 (사용자 경험 개선)
  });
  sessionStoreType = "MemoryStore (max: 500, TTL: 1h)";
  console.log(`[Session] ⚠️ Using MemoryStore - for production scale, configure REDIS_URL`);
}

app.use(
  session({
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
  })
);

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
