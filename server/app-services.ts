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
  // ★ [2026-01-04 프로덕션 안정성 수정] - 세션 오버플로우 완전 방지
  // 프로덕션 환경 자동 감지 - Autoscale 배포 시 HTTPS가 자동으로 활성화됨
  const isProduction = process.env.NODE_ENV === "production" || (process.env.REPL_SLUG && !process.env.REPL_ID);
  const cookieSecure = isProduction || process.env.COOKIE_SECURE === "true";
  
  // ★ [CRITICAL FIX] 프로덕션 MemoryStore 설정 - app.ts와 동일하게 설정
  const maxSessions = isProduction ? 10000 : 2000; // 프로덕션 10000 / 개발 2000 (app.ts와 동일)
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

  // ★ [2026-01-04 프로덕션 안정성 수정] 조건부 세션 미들웨어
  // 내부 호출 및 공개 API에서 세션 생성 건너뛰기 - 경로 정규화 적용
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
    const skipSessionPrefixes = [
      '/api/public',                // 공개 API 전체
      '/api/health',                // 헬스 체크
      '/health',                    // 루트 헬스 체크
      '/api/shard-cache',           // 샤드 캐시 API 전체
      '/api/cross-shard-router',    // 크로스 샤드 라우터 API 전체
      '/api/shard-rebalancer',      // 샤드 리밸런서 API 전체
      '/api/batch-processor',       // 배치 프로세서 API 전체
      '/api/validators/status',     // 검증자 상태 (공개)
      '/api/validators/stats',      // 검증자 통계 (공개)
      '/api/rewards/stats',         // 보상 통계 (공개)
      '/api/rewards/epoch',         // 에포크 정보 (공개)
      '/api/network/stats',         // 네트워크 통계 (공개)
      '/api/scalability',           // 확장성 API (공개)
      '/api/consensus/state',       // 합의 상태 (공개)
      '/api/block-production',      // 블록 생산 (공개)
    ];
    
    // ★ 정확히 일치해야 하는 GET 경로
    const exactGetPaths = [
      '/api/shards',                // 샤드 목록
      '/api/blocks',                // 블록 목록
      '/api/transactions',          // 트랜잭션 목록
      '/api/wallets',               // 지갑 목록
      '/api/contracts',             // 컨트랙트 목록
    ];
    
    // ★ 관리자/인증 필요 경로 패턴 (세션 유지 필수)
    const requiresSession = 
      normalizedPath.includes('/admin') ||
      normalizedPath.includes('/config') ||
      normalizedPath.includes('/maintenance') ||
      normalizedPath.includes('/auth') ||
      normalizedPath.includes('/user') ||
      normalizedPath.includes('/member') ||
      normalizedPath.includes('/login') ||
      normalizedPath.includes('/logout') ||
      normalizedPath.includes('/session') ||
      (req.method !== 'GET' && (
        normalizedPath.includes('/start') ||
        normalizedPath.includes('/stop') ||
        normalizedPath.includes('/benchmark')
      ));
    
    // 이미 인증 쿠키가 있으면 세션 스킵하지 않음
    const hasSessionCookie = !!req.headers.cookie?.includes('connect.sid');
    
    // ★ 접두사 매칭 함수 - 정규화된 경로와 비교
    const matchesPrefix = skipSessionPrefixes.some(prefix => 
      normalizedPath === prefix || normalizedPath.startsWith(prefix + '/')
    );
    
    // ★ 정확한 경로 매칭
    const matchesExact = req.method === 'GET' && exactGetPaths.includes(normalizedPath);
    
    // ★ 세션 스킵 조건: 
    // 1. 관리자 경로가 아니고
    // 2. (내부 요청이거나 공개 API 경로) - 내부 요청은 쿠키 유무와 관계없이 스킵
    // 3. 외부 요청의 경우 쿠키가 있으면 기존 세션 사용
    const shouldSkipSession = !requiresSession && (
      isInternalRequest ||  // ★ 내부 요청은 항상 스킵 (쿠키 유무 관계없음)
      (!hasSessionCookie && (matchesPrefix || matchesExact))  // 외부 요청: 쿠키 없고 공개 경로
    );
    
    if (shouldSkipSession) {
      sessionSkipCount++;
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
