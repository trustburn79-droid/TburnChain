/**
 * TBURN Mainnet Express Application v5.0
 * 
 * 해결된 문제들:
 * 1. Internal Server Error - DATABASE_URL 없을 때 connect-pg-simple 실패 → MemoryStore 폴백
 * 2. /rpc?_t=timestamp - CDN이 쿼리 제거해도 경로 기반으로 스킵
 * 3. 타입 에러 - 모든 타입 명시적 정의
 * 4. 청크 로딩 실패 - 정적 파일을 세션 전에 서빙
 * 5. Set-Cookie 누수 - 완전 차단
 * 6. 메모리 오버플로우 - Disaster Recovery 통합
 * 
 * @version 5.0.0
 * @date 2026-01-06
 */

import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import path from 'path';

// ============================================================================
// 타입 정의
// ============================================================================

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    user?: any;
    authenticated?: boolean;
  }
}

interface ExtendedRequest extends Request {
  _skipSession?: boolean;
}

// ============================================================================
// 환경 감지 (통합)
// ============================================================================

interface EnvironmentInfo {
  isProduction: boolean;
  isReplit: boolean;
  hasDatabase: boolean;
  hostname: string;
  nodeEnv: string;
}

function detectEnvironment(): EnvironmentInfo {
  const env = process.env;
  
  const isReplit = !!(
    env.REPL_SLUG ||
    env.REPL_ID ||
    env.REPLIT_DEPLOYMENT === '1' ||
    env.REPLIT_DEV_DOMAIN
  );
  
  const isProduction = !!(
    env.NODE_ENV === 'production' ||
    env.REPLIT_DEPLOYMENT === '1' ||
    isReplit
  );
  
  // DATABASE_URL 존재 여부 확인 (핵심!)
  const hasDatabase = !!(env.DATABASE_URL && env.DATABASE_URL.length > 10);
  
  return {
    isProduction,
    isReplit,
    hasDatabase,
    hostname: env.HOSTNAME || env.REPL_SLUG || 'localhost',
    nodeEnv: env.NODE_ENV || 'development',
  };
}

const ENV = detectEnvironment();

// ============================================================================
// 콘솔 로그
// ============================================================================

console.log('╔════════════════════════════════════════════════════════════════════╗');
console.log('║          TBURN MAINNET EXPRESS APPLICATION v5.0                     ║');
console.log('╠════════════════════════════════════════════════════════════════════╣');
console.log(`║  NODE_ENV:      ${ENV.nodeEnv.padEnd(50)}║`);
console.log(`║  Production:    ${ENV.isProduction ? 'YES' : 'NO '}${' '.repeat(50)}║`);
console.log(`║  Replit:        ${ENV.isReplit ? 'YES' : 'NO '}${' '.repeat(50)}║`);
console.log(`║  DATABASE_URL:  ${ENV.hasDatabase ? 'SET' : 'NOT SET (using MemoryStore)'}${' '.repeat(ENV.hasDatabase ? 47 : 27)}║`);
console.log('╚════════════════════════════════════════════════════════════════════╝');

// ============================================================================
// Express 앱 초기화
// ============================================================================

const app = express();

// Trust proxy (필수 - Replit, Heroku 등)
app.set('trust proxy', 1);

// ============================================================================
// Step 1: Security Headers
// ============================================================================

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// ============================================================================
// Step 2: CORS
// ============================================================================

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Skip-Session'],
}));

// ============================================================================
// Step 3: Compression
// ============================================================================

app.use(compression());

// ============================================================================
// Step 4: Body Parsers
// ============================================================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================================
// Step 5: Cookie Parser
// ============================================================================

app.use(cookieParser(process.env.COOKIE_SECRET || 'tburn-cookie-secret'));

// ============================================================================
// Step 6: ★★★ PRE-SESSION FILTER ★★★ (가장 중요!)
// CDN이 쿼리 스트링을 제거해도 경로 기반으로 스킵
// ============================================================================

// 세션이 필요 없는 경로들 (쿼리 스트링 무관)
const SESSION_FREE_PATHS = [
  // RPC 엔드포인트 (PRIMARY)
  '/rpc',
  '/jsonrpc',
  '/json-rpc',
  '/eth',
  '/api/rpc',
  
  // WebSocket
  '/ws',
  '/wss',
  '/socket',
  '/socket.io',
  
  // Health checks
  '/health',
  '/healthz',
  '/readyz',
  '/livez',
  '/ping',
  '/status',
  '/metrics',
  '/api/health',
  '/api/status',
  '/api/ping',
  '/api/metrics',
  
  // Public API
  '/api/blocks',
  '/api/block',
  '/api/transactions',
  '/api/tx',
  '/api/validators',
  '/api/network',
  '/api/price',
  '/api/market',
  '/api/explorer',
  '/api/chain',
  '/api/stats',
  '/api/supply',
  '/api/gas',
  '/api/info',
  '/api/version',
  
  // Monitoring
  '/api/production-monitor',
  '/api/session-health',
  '/api/disaster-recovery',
];

// 정적 파일 확장자
const STATIC_EXTENSIONS = /\.(js|mjs|cjs|jsx|ts|tsx|css|scss|sass|less|png|jpg|jpeg|gif|svg|webp|ico|avif|bmp|woff|woff2|ttf|eot|otf|mp3|mp4|webm|ogg|wav|pdf|zip|gz|json|xml|txt|md|yaml|yml|map|wasm)$/i;

// 정적 파일 경로 접두사
const STATIC_PREFIXES = [
  '/assets',
  '/static',
  '/public',
  '/dist',
  '/build',
  '/chunks',
  '/js',
  '/css',
  '/fonts',
  '/images',
  '/icons',
  '/media',
  '/__vite',
  '/@vite',
  '/@fs',
  '/_next',
  '/node_modules',
  '/favicon',
  '/robots.txt',
  '/sitemap',
  '/manifest',
];

/**
 * Pre-Session Filter - 세션 미들웨어 전에 실행
 * CDN이 쿼리 스트링을 제거해도 작동
 */
const preSessionFilter: RequestHandler = (req: ExtendedRequest, res: Response, next: NextFunction) => {
  const url = req.url || req.originalUrl || '/';
  const path = url.split('?')[0].toLowerCase();
  const method = req.method?.toUpperCase() || 'GET';
  
  let shouldSkip = false;
  let skipReason = '';
  
  // 1. 세션 프리 경로 체크 (쿼리 스트링 무관!)
  for (const freePath of SESSION_FREE_PATHS) {
    if (path === freePath || path.startsWith(freePath + '/')) {
      shouldSkip = true;
      skipReason = `session_free_path:${freePath}`;
      break;
    }
  }
  
  // 2. 정적 파일 확장자 체크
  if (!shouldSkip && STATIC_EXTENSIONS.test(path)) {
    shouldSkip = true;
    skipReason = 'static_extension';
  }
  
  // 3. 정적 파일 경로 접두사 체크
  if (!shouldSkip) {
    for (const prefix of STATIC_PREFIXES) {
      if (path.startsWith(prefix)) {
        shouldSkip = true;
        skipReason = `static_prefix:${prefix}`;
        break;
      }
    }
  }
  
  // 4. OPTIONS/HEAD 메서드
  if (!shouldSkip && (method === 'OPTIONS' || method === 'HEAD')) {
    shouldSkip = true;
    skipReason = `method:${method}`;
  }
  
  // 5. 헤더 기반 스킵 (CDN이 추가할 수 있음)
  if (!shouldSkip && req.headers['x-skip-session'] === 'true') {
    shouldSkip = true;
    skipReason = 'header:x-skip-session';
  }
  
  // 6. WebSocket 업그레이드
  if (!shouldSkip && req.headers['upgrade']?.toLowerCase() === 'websocket') {
    shouldSkip = true;
    skipReason = 'websocket_upgrade';
  }
  
  // 7. 캐시버스팅 쿼리 파라미터 (CDN이 제거하지 않은 경우)
  if (!shouldSkip && /[?&](_t|_|t|timestamp|ts|cachebust|cb|nocache|v|nonce|rand)=/i.test(url)) {
    shouldSkip = true;
    skipReason = 'cache_bust_param';
  }
  
  // 8. 타임스탬프 쿼리 값 (숫자만 있는 경우)
  if (!shouldSkip && /[?&][^=]+=\d{10,13}(&|$)/.test(url)) {
    shouldSkip = true;
    skipReason = 'timestamp_param';
  }
  
  if (shouldSkip) {
    // 스킵 플래그 설정
    req._skipSession = true;
    (req as any).session = null;
    (req as any).sessionID = null;
    
    // Set-Cookie 헤더 차단
    blockSetCookie(res);
    
    // 디버그 로그 (샘플링)
    if (Math.random() < 0.001) {
      console.log(`[PRE-SESSION] Skip: ${skipReason} | ${method} ${url}`);
    }
  }
  
  next();
};

/**
 * Set-Cookie 헤더 차단 함수
 */
function blockSetCookie(res: Response): void {
  const originalSetHeader = res.setHeader.bind(res);
  
  res.setHeader = function(name: string, value: any): Response {
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

// Pre-Session Filter 적용 (가장 먼저!)
app.use(preSessionFilter);

// ============================================================================
// Step 7: ★★★ 정적 파일 서빙 (세션 전에!) ★★★
// ============================================================================

const staticOptions: express.static.ServeStaticOptions = {
  maxAge: ENV.isProduction ? '1y' : 0,
  etag: true,
  lastModified: true,
  index: false,
  immutable: ENV.isProduction,
  setHeaders: (res: Response, filePath: string) => {
    // Set-Cookie 제거
    res.removeHeader('Set-Cookie');
    
    // 해시된 파일에 immutable 캐시
    if (/-[a-zA-Z0-9]{8,}\.(js|css|woff2?)$/.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
    
    // 폰트에 CORS
    if (/\.(woff2?|ttf|eot|otf)$/.test(filePath)) {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  },
};

// Vite 청크 파일 서빙 (가장 중요)
app.use('/assets', express.static(path.join(process.cwd(), 'public/assets'), staticOptions));
app.use('/assets', express.static(path.join(process.cwd(), 'dist/assets'), staticOptions));
app.use('/assets', express.static(path.join(process.cwd(), 'dist/public/assets'), staticOptions));
app.use('/assets', express.static(path.join(process.cwd(), 'client/dist/assets'), staticOptions));

// 기타 정적 경로
app.use('/static', express.static(path.join(process.cwd(), 'public/static'), staticOptions));
app.use('/dist', express.static(path.join(process.cwd(), 'dist'), staticOptions));
app.use('/public', express.static(path.join(process.cwd(), 'public'), staticOptions));

// 정적 파일 404 핸들러 (HTML 대신 JSON 반환)
app.use('/assets/*', (req: Request, res: Response) => {
  console.warn(`[STATIC] Missing: ${req.originalUrl}`);
  res.status(404)
    .set('Cache-Control', 'no-store')
    .json({ error: 'Asset not found', path: req.originalUrl });
});

// ============================================================================
// Step 8: ★★★ 세션 스토어 설정 ★★★
// DATABASE_URL 없으면 MemoryStore 사용 (핵심 수정!)
// ============================================================================

let sessionStore: session.Store;
let usingMemoryStore = false;

// DATABASE_URL 체크 (가장 중요한 수정!)
if (ENV.hasDatabase) {
  try {
    // PostgreSQL 세션 스토어 시도
    const connectPgSimple = require('connect-pg-simple')(session);
    const { Pool } = require('pg');
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: ENV.isProduction ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
    
    // 연결 테스트
    pool.query('SELECT 1').then(() => {
      console.log('[SESSION] ✓ PostgreSQL 연결 성공');
    }).catch((err: Error) => {
      console.error('[SESSION] PostgreSQL 연결 실패:', err.message);
    });
    
    sessionStore = new connectPgSimple({
      pool,
      tableName: 'session',
      createTableIfMissing: true,
    });
    
    console.log('[SESSION] ✓ Using PostgreSQL session store');
  } catch (error: any) {
    console.error('[SESSION] PostgreSQL 설정 실패, MemoryStore로 폴백:', error.message);
    sessionStore = new session.MemoryStore();
    usingMemoryStore = true;
  }
} else {
  // DATABASE_URL 없음 → MemoryStore 사용 (핵심!)
  console.log('[SESSION] DATABASE_URL not set, using MemoryStore');
  sessionStore = new session.MemoryStore();
  usingMemoryStore = true;
}

if (usingMemoryStore && ENV.isProduction) {
  console.warn('╔════════════════════════════════════════════════════════════════════╗');
  console.warn('║  ⚠️  WARNING: Using MemoryStore in PRODUCTION                       ║');
  console.warn('║  Session bypass is CRITICAL for stability.                          ║');
  console.warn('║  Set DATABASE_URL for PostgreSQL session store.                     ║');
  console.warn('╚════════════════════════════════════════════════════════════════════╝');
}

// ============================================================================
// Step 9: 세션 미들웨어 생성 (직접 app.use 하지 않음!)
// ============================================================================

const sessionMiddleware = session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'tburn-session-secret-change-me-32chars',
  name: 'connect.sid',
  resave: false,
  saveUninitialized: false,  // 빈 세션 저장 안함 (핵심!)
  rolling: false,
  proxy: ENV.isProduction,
  cookie: {
    secure: ENV.isProduction,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24시간
    sameSite: 'lax',
  },
});

// ============================================================================
// Step 10: ★★★ 조건부 세션 미들웨어 ★★★
// _skipSession 플래그가 있으면 세션 미들웨어 완전 스킵
// ============================================================================

const conditionalSessionMiddleware: RequestHandler = (req: ExtendedRequest, res: Response, next: NextFunction) => {
  // Pre-Session Filter에서 스킵 플래그 설정했으면 세션 미들웨어 실행 안함
  if (req._skipSession) {
    return next();
  }
  
  // 세션 미들웨어 실행
  return sessionMiddleware(req, res, next);
};

app.use(conditionalSessionMiddleware);

// ============================================================================
// Step 11: Health Check 엔드포인트
// ============================================================================

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: ENV.nodeEnv,
    production: ENV.isProduction,
    sessionStore: usingMemoryStore ? 'MemoryStore' : 'PostgreSQL',
  });
});

app.get('/healthz', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

app.get('/readyz', (req: Request, res: Response) => {
  const memUsage = process.memoryUsage();
  const memRatio = memUsage.heapUsed / memUsage.heapTotal;
  
  if (memRatio < 0.90) {
    res.status(200).send('READY');
  } else {
    res.status(503).json({
      ready: false,
      reason: 'high_memory',
      usage: `${(memRatio * 100).toFixed(1)}%`,
    });
  }
});

// 세션 헬스 체크
app.get('/api/session-health', (req: Request, res: Response) => {
  const memUsage = process.memoryUsage();
  
  let sessionCount = 0;
  if (usingMemoryStore && sessionStore) {
    const sessions = (sessionStore as any).sessions;
    if (sessions) {
      sessionCount = Object.keys(sessions).length;
    }
  }
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    sessionStore: usingMemoryStore ? 'MemoryStore' : 'PostgreSQL',
    activeSessions: sessionCount,
    memory: {
      heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      usage: `${((memUsage.heapUsed / memUsage.heapTotal) * 100).toFixed(2)}%`,
    },
    uptime: Math.floor(process.uptime()),
    environment: ENV,
  });
});

// ============================================================================
// Step 12: RPC 엔드포인트 (세션 없이 처리)
// ============================================================================

app.all('/rpc', (req: Request, res: Response) => {
  if (req.method === 'POST') {
    const body = req.body || {};
    res.json({
      jsonrpc: '2.0',
      id: body.id || null,
      result: {
        status: 'ok',
        blockNumber: '0x' + Math.floor(Date.now() / 1000).toString(16),
      },
    });
  } else {
    res.json({
      jsonrpc: '2.0',
      id: null,
      result: { status: 'ok', method: req.method },
    });
  }
});

app.all('/rpc/*', (req: Request, res: Response) => {
  res.json({ jsonrpc: '2.0', id: null, result: { status: 'ok' } });
});

// ============================================================================
// Step 13: API 라우트 예시
// ============================================================================

// 공개 API (세션 불필요)
app.get('/api/blocks/latest', (req: Request, res: Response) => {
  res.json({
    blockNumber: 21332811 + Math.floor(Math.random() * 100),
    timestamp: Date.now(),
    transactions: Math.floor(Math.random() * 100),
  });
});

app.get('/api/network/stats', (req: Request, res: Response) => {
  res.json({
    tps: 50908,
    validators: 110,
    totalValidators: 125,
    uptime: 99.95,
  });
});

// 보호된 API (세션 필요)
app.get('/api/user/profile', (req: Request, res: Response) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json({ userId: req.session.userId });
});

// ============================================================================
// Step 14: SPA Fallback
// ============================================================================

app.get('*', (req: Request, res: Response) => {
  // API 라우트는 404
  if (req.url.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not Found' });
  }
  
  // RPC 라우트는 404
  if (req.url.startsWith('/rpc')) {
    return res.status(404).json({ error: 'Not Found' });
  }
  
  // SPA index.html 서빙
  const indexPaths = [
    path.join(process.cwd(), 'dist/public/index.html'),
    path.join(process.cwd(), 'public/index.html'),
    path.join(process.cwd(), 'dist/index.html'),
    path.join(process.cwd(), 'client/dist/index.html'),
  ];
  
  for (const indexPath of indexPaths) {
    try {
      if (require('fs').existsSync(indexPath)) {
        return res.sendFile(indexPath);
      }
    } catch (e) {
      // 계속 시도
    }
  }
  
  res.status(404).send('index.html not found');
});

// ============================================================================
// Step 15: 에러 핸들러
// ============================================================================

// 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found', path: req.url });
});

// 글로벌 에러 핸들러
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[APP] Error:', err.message);
  
  const message = ENV.isProduction ? 'Internal Server Error' : err.message;
  
  res.status(err.status || 500).json({
    error: message,
    ...(ENV.isProduction ? {} : { stack: err.stack }),
  });
});

// ============================================================================
// Step 16: Graceful Shutdown
// ============================================================================

process.on('SIGTERM', () => {
  console.log('[APP] SIGTERM received, shutting down...');
  setTimeout(() => process.exit(0), 5000);
});

process.on('SIGINT', () => {
  console.log('[APP] SIGINT received, shutting down...');
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  console.error('[APP] Uncaught Exception:', err);
  setTimeout(() => process.exit(1), 1000);
});

process.on('unhandledRejection', (reason) => {
  console.error('[APP] Unhandled Rejection:', reason);
});

// ============================================================================
// Step 17: MemoryStore 자동 정리 (Disaster Recovery)
// ============================================================================

if (usingMemoryStore) {
  setInterval(() => {
    const memUsage = process.memoryUsage();
    const memRatio = memUsage.heapUsed / memUsage.heapTotal;
    
    const sessions = (sessionStore as any).sessions;
    if (!sessions) return;
    
    const sessionCount = Object.keys(sessions).length;
    
    // 메모리 기반 정리
    if (memRatio > 0.90) {
      console.log(`[DR] CRITICAL: Memory ${(memRatio * 100).toFixed(1)}% - clearing all sessions`);
      for (const key of Object.keys(sessions)) {
        delete sessions[key];
      }
    } else if (memRatio > 0.80) {
      console.log(`[DR] WARNING: Memory ${(memRatio * 100).toFixed(1)}% - cleaning 50% sessions`);
      const keys = Object.keys(sessions);
      const deleteCount = Math.floor(keys.length * 0.5);
      for (let i = 0; i < deleteCount; i++) {
        delete sessions[keys[i]];
      }
    } else if (memRatio > 0.70) {
      console.log(`[DR] ELEVATED: Memory ${(memRatio * 100).toFixed(1)}% - cleaning 30% sessions`);
      const keys = Object.keys(sessions);
      const deleteCount = Math.floor(keys.length * 0.3);
      for (let i = 0; i < deleteCount; i++) {
        delete sessions[keys[i]];
      }
    }
    
    // 세션 수 기반 정리
    if (sessionCount > 5000) {
      console.log(`[DR] Sessions (${sessionCount}) > 5000 - cleaning 40%`);
      const keys = Object.keys(sessions);
      const deleteCount = Math.floor(keys.length * 0.4);
      for (let i = 0; i < deleteCount; i++) {
        delete sessions[keys[i]];
      }
    }
    
  }, 30000); // 30초마다
  
  console.log('[DR] Disaster Recovery enabled for MemoryStore');
}

// ============================================================================
// Export
// ============================================================================

export default app;
export { app };
