import { type Server } from "node:http";
import express, { type Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { registerRoutes } from "./routes";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { log } from "./app";
import { initializeBlockchainOrchestrator, shutdownBlockchainOrchestrator } from "./services/blockchain-orchestrator";

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

const MemoryStore = createMemoryStore(session);

// Fix BigInt JSON serialization
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export default async function runAppServices(
  app: Express,
  server: Server,
): Promise<void> {
  // ★ [CRITICAL FIX] 프로덕션 MemoryStore 설정 - 오버플로우 방지
  const sessionStore = new MemoryStore({
    checkPeriod: 60000,     // 1분마다 만료된 세션 정리 (기존 24시간에서 단축!)
    max: 5000,              // 최대 5000개 세션 (프로덕션 용량 증가)
    ttl: 1800000,           // 세션 TTL 30분 (기존 24시간에서 단축!)
    stale: false,           // 만료된 세션 즉시 삭제
    dispose: (key: string) => {
      if (process.env.DEBUG_SESSION === 'true') {
        console.log(`[Session] Disposed: ${key.substring(0, 8)}...`);
      }
    }
  });

  // ★ 프로덕션 환경 자동 감지 - Autoscale 배포 시 HTTPS가 자동으로 활성화됨
  const isProduction = process.env.NODE_ENV === "production" || (process.env.REPL_SLUG && !process.env.REPL_ID);
  const cookieSecure = isProduction || process.env.COOKIE_SECURE === "true";

  // ★ 세션 미들웨어 정의
  const sessionMiddleware = session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || "tburn-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: cookieSecure,
      httpOnly: true,
      maxAge: 2 * 60 * 60 * 1000, // 2시간으로 단축 (메모리 절약)
      sameSite: cookieSecure ? "none" : "lax",
    },
    proxy: true,
  });

  // ★ 세션 모니터링 카운터
  let sessionCreateCount = 0;
  let sessionSkipCount = 0;
  let lastSessionReport = Date.now();

  // ★ [CRITICAL FIX] 조건부 세션 미들웨어 - 내부 호출 및 공개 API에서 세션 생성 건너뛰기
  // 이 로직 없이는 ProductionDataPoller, DataCache 등 내부 호출이 세션을 생성하여
  // MemoryStore가 30-60분 내에 가득 차서 "Internal Server Error" 발생
  app.use((req: Request, res: Response, next: NextFunction) => {
    // 내부 API 호출 감지 (X-Internal-Request 헤더)
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
      '/api/shard-rebalancer/',    // 샤드 리밸런서 API (공개)
      '/api/batch-processor/',     // 배치 프로세서 API (공개)
    ];
    
    // ★ 추가: GET 요청이면서 공개 데이터 조회인 경우만 스킵
    // 관리자 경로(admin, maintenance, config 등)는 반드시 세션 유지
    const publicReadOnlyGetPaths = [
      '/api/network/stats',        // 네트워크 통계 조회
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
    
    // 5분마다 세션 사용량 리포트
    const now = Date.now();
    if (now - lastSessionReport > 300000) {
      const skipRatio = ((sessionSkipCount / (sessionCreateCount + sessionSkipCount)) * 100).toFixed(1);
      console.log(`[Session Monitor] Created: ${sessionCreateCount}, Skipped: ${sessionSkipCount}, Skip Ratio: ${skipRatio}%`);
      lastSessionReport = now;
    }
    
    return sessionMiddleware(req, res, next);
  });

  log(`Session store: MemoryStore (max: 5000, TTL: 30m, cleanup: 1m)`, "session");
  log(`Session skip: Enabled for public APIs and internal calls`, "session");

  // Google OAuth Configuration
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "https://tburn.io/api/auth/google/callback";

  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    }, (accessToken, refreshToken, profile, done) => {
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
  }

  // JSON parsing
  app.use(express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    }
  }));
  app.use(express.urlencoded({ extended: false }));

  // Request logging middleware
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

  // Register all API routes (this initializes heavy services)
  // Pass existing server for WebSocket support
  await registerRoutes(app, server);

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  log(`✅ All API routes registered`, "services");

  // Initialize Enterprise Scalability Infrastructure (synchronous - lightweight init only)
  const IS_DEV = process.env.NODE_ENV === 'development';
  try {
    // Initialize Blockchain Orchestrator with all subsystems
    // Worker threads disabled for Replit, other subsystems use lightweight mode
    initializeBlockchainOrchestrator({
      shardCount: 5,
      validatorsPerShard: 25,
      blockTimeMs: IS_DEV ? 1000 : 100,
      enableWorkerThreads: false,  // Disabled for Replit compatibility
      enableBatchPersistence: true,
      enableAdaptiveFees: true,
      batchFlushIntervalMs: IS_DEV ? 5000 : 1000,
    }).then(() => {
      log(`✅ Enterprise Scalability initialized${IS_DEV ? ' (dev mode)' : ''}`, "scalability");
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
}
