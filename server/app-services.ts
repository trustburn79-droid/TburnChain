import { type Server } from "node:http";
import express, { type Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { registerRoutes } from "./routes";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { log } from "./app";
import { initializeBlockchainOrchestrator, shutdownBlockchainOrchestrator } from "./services/blockchain-orchestrator";
import { 
  shouldBypassSession, 
  blockSetCookie, 
  createSkipSession,
  checkMemoryStoreCapacity,
  IS_PRODUCTION
} from "./core/sessions/session-bypass";

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
  // ★ [2026-01-04 프로덕션 안정성] 프록시 신뢰 설정
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
  
  // ★ [2026-01-05 프로덕션 안정성 v3.0] - 통합 환경 감지
  // session-bypass.ts의 IS_PRODUCTION을 직접 사용하여 app.ts와 완전히 동일한 환경 감지
  // 이전 문제: 다른 환경 감지 로직 (REPL_SLUG && !REPL_ID) 사용 → 프로덕션에서 세션 스킵 실패
  // 수정: IS_PRODUCTION을 session-bypass.ts에서 import하여 단일 진실 소스(Single Source of Truth) 유지
  const cookieSecure = IS_PRODUCTION || process.env.COOKIE_SECURE === "true";
  
  // ★ 프로덕션 환경 감지 로깅 (디버깅용)
  console.log(`[app-services] Environment Detection: IS_PRODUCTION=${IS_PRODUCTION}, ` +
    `REPLIT_DEPLOYMENT=${process.env.REPLIT_DEPLOYMENT}, ` +
    `NODE_ENV=${process.env.NODE_ENV}`);
  
  // ★ [CRITICAL FIX] 프로덕션 MemoryStore 설정 - app.ts와 동일하게 설정
  const maxSessions = IS_PRODUCTION ? 10000 : 2000; // 프로덕션 10000 / 개발 2000 (app.ts와 동일)
  const sessionStore = new MemoryStore({
    checkPeriod: 30000,     // ★ 30초마다 만료된 세션 정리 (더 적극적)
    max: maxSessions,       // ★ 프로덕션 10000 / 개발 2000 (app.ts와 동일)
    ttl: 1800000,           // 세션 TTL 30분
    stale: false,           // 만료된 세션 즉시 삭제
    dispose: (key: string) => {
      if (process.env.DEBUG_SESSION === 'true') {
        console.log(`[Session] Disposed: ${key.substring(0, 8)}...`);
      }
    }
  });

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

  // ★ [2026-01-04 프로덕션 안정성 수정] 통합 세션 바이패스 모듈 사용
  // app.ts와 동일한 세션 스킵 로직으로 개발/프로덕션 환경 일관성 유지
  app.use((req: Request, res: Response, next: NextFunction) => {
    // ★ 통합 세션 바이패스 모듈 사용 (개발/프로덕션 일관성)
    const bypassResult = shouldBypassSession(req);
    
    if (bypassResult.shouldSkip) {
      sessionSkipCount++;
      
      // ★ [핵심 수정] Set-Cookie 헤더 차단 - 세션 스킵 시 쿠키 설정 방지
      blockSetCookie(res);
      
      // 세션 없이 빈 세션 객체만 제공 (세션 저장소에 저장하지 않음)
      (req as any).session = createSkipSession();
      
      // 디버깅용 로깅 (선택적)
      if (process.env.DEBUG_SESSION === 'true') {
        console.log(`[Session Skip] ${req.method} ${req.path} - reason: ${bypassResult.reason}`);
      }
      
      return next();
    }
    
    sessionCreateCount++;
    
    // ★ MemoryStore 용량 모니터링 (프로덕션 안정성)
    const activeCount = sessionCreateCount;
    checkMemoryStoreCapacity(activeCount, maxSessions);
    
    // 5분마다 세션 사용량 리포트
    const now = Date.now();
    if (now - lastSessionReport > 300000) {
      const total = sessionCreateCount + sessionSkipCount;
      const skipRatio = total > 0 ? ((sessionSkipCount / total) * 100).toFixed(1) : '0';
      console.log(`[Session Monitor] Created: ${sessionCreateCount}, Skipped: ${sessionSkipCount}, Skip Ratio: ${skipRatio}%`);
      lastSessionReport = now;
    }
    
    return sessionMiddleware(req, res, next);
  });

  log(`Session store: MemoryStore (max: ${maxSessions}, TTL: 30m, cleanup: 30s)`, "session");
  log(`Session skip: Enabled for public APIs and internal calls (path-normalized)`, "session");

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
        log(`✅ Enterprise Scalability initialized${IS_DEV ? ' (dev mode)' : ''}`, "scalability");
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
      await shutdownBlockchainOrchestrator();
    } catch (e) {
      // Ignore shutdown errors
    }
    process.exit(0);
  });
}
