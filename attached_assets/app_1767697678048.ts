/**
 * TBURN Mainnet Express Application v6.0
 * 
 * 해결된 문제들:
 * 1. Internal Server Error (DATABASE_URL 미설정) ✅
 * 2. /rpc?_t=timestamp 에러 ✅
 * 3. 청크 로딩 실패 ✅
 * 4. ★ 10분 유휴 후 첫 요청 에러 ★ (NEW)
 *    - Replit 슬립 모드 대응
 *    - DB 연결 풀 재연결
 *    - 만료 세션 쿠키 처리
 *    - 세션 미들웨어 타임아웃
 * 
 * @version 6.0.0
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
    lastAccess?: number;
  }
}

interface ExtendedRequest extends Request {
  _skipSession?: boolean;
  _coldStart?: boolean;
}

// ============================================================================
// 환경 감지
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
// ★★★ Cold Start / Warm-up 관리 시스템 ★★★
// ============================================================================

class WarmupManager {
  private lastRequestTime: number = Date.now();
  private isWarmingUp: boolean = false;
  private warmupPromise: Promise<void> | null = null;
  private dbPool: any = null;
  private sessionStore: session.Store | null = null;
  
  // 설정
  private readonly IDLE_THRESHOLD = 5 * 60 * 1000;  // 5분 유휴 → 콜드 스타트 감지
  private readonly WARMUP_TIMEOUT = 10000;  // 웜업 최대 10초
  private readonly DB_PING_INTERVAL = 30000;  // 30초마다 DB 핑
  
  constructor() {
    // 주기적 DB 핑 (연결 유지)
    setInterval(() => this.pingDatabase(), this.DB_PING_INTERVAL);
    console.log('[WARMUP] Manager initialized');
  }
  
  setDbPool(pool: any): void {
    this.dbPool = pool;
  }
  
  setSessionStore(store: session.Store): void {
    this.sessionStore = store;
  }
  
  /**
   * 요청 처리 전 콜드 스타트 체크
   */
  async checkAndWarmup(): Promise<boolean> {
    const now = Date.now();
    const idleTime = now - this.lastRequestTime;
    this.lastRequestTime = now;
    
    // 5분 이상 유휴 → 콜드 스타트
    if (idleTime > this.IDLE_THRESHOLD) {
      console.log(`[WARMUP] Cold start detected (idle: ${Math.floor(idleTime / 1000)}s)`);
      await this.performWarmup();
      return true;
    }
    
    return false;
  }
  
  /**
   * 웜업 수행
   */
  private async performWarmup(): Promise<void> {
    if (this.isWarmingUp && this.warmupPromise) {
      return this.warmupPromise;
    }
    
    this.isWarmingUp = true;
    
    this.warmupPromise = new Promise<void>(async (resolve) => {
      const startTime = Date.now();
      
      try {
        // 1. DB 연결 확인/재연결
        await this.ensureDbConnection();
        
        // 2. 세션 스토어 확인
        await this.ensureSessionStore();
        
        const elapsed = Date.now() - startTime;
        console.log(`[WARMUP] Completed in ${elapsed}ms`);
        
      } catch (error: any) {
        console.error('[WARMUP] Error:', error.message);
      } finally {
        this.isWarmingUp = false;
        this.warmupPromise = null;
        resolve();
      }
    });
    
    // 타임아웃 설정
    const timeoutPromise = new Promise<void>((resolve) => {
      setTimeout(() => {
        console.warn('[WARMUP] Timeout reached, proceeding anyway');
        resolve();
      }, this.WARMUP_TIMEOUT);
    });
    
    await Promise.race([this.warmupPromise, timeoutPromise]);
  }
  
  /**
   * DB 연결 확인/재연결
   */
  private async ensureDbConnection(): Promise<void> {
    if (!this.dbPool) return;
    
    try {
      // 연결 테스트
      await this.dbPool.query('SELECT 1');
      console.log('[WARMUP] DB connection OK');
    } catch (error: any) {
      console.log('[WARMUP] DB reconnecting...');
      
      // 기존 연결 정리
      try {
        await this.dbPool.end();
      } catch (e) {
        // 무시
      }
      
      // 재연결은 풀이 자동으로 처리
      // 다음 쿼리에서 새 연결 생성됨
    }
  }
  
  /**
   * 세션 스토어 확인
   */
  private async ensureSessionStore(): Promise<void> {
    if (!this.sessionStore) return;
    
    // MemoryStore는 항상 준비됨
    if ((this.sessionStore as any).sessions !== undefined) {
      console.log('[WARMUP] MemoryStore OK');
      return;
    }
    
    // PostgreSQL 세션 스토어 확인
    try {
      // 세션 테이블 존재 확인
      if (this.dbPool) {
        await this.dbPool.query('SELECT 1 FROM session LIMIT 1');
        console.log('[WARMUP] Session store OK');
      }
    } catch (error: any) {
      console.warn('[WARMUP] Session store check failed:', error.message);
    }
  }
  
  /**
   * 주기적 DB 핑 (연결 유지)
   */
  private async pingDatabase(): Promise<void> {
    if (!this.dbPool) return;
    
    try {
      await this.dbPool.query('SELECT 1');
    } catch (error) {
      // 연결 끊김 - 다음 요청에서 재연결됨
    }
  }
  
  /**
   * 현재 상태
   */
  getStatus(): object {
    return {
      lastRequestTime: new Date(this.lastRequestTime).toISOString(),
      idleSeconds: Math.floor((Date.now() - this.lastRequestTime) / 1000),
      isWarmingUp: this.isWarmingUp,
      hasDbPool: !!this.dbPool,
      hasSessionStore: !!this.sessionStore,
    };
  }
}

const warmupManager = new WarmupManager();

// ============================================================================
// 콘솔 로그
// ============================================================================

console.log('╔════════════════════════════════════════════════════════════════════╗');
console.log('║          TBURN MAINNET EXPRESS APPLICATION v6.0                     ║');
console.log('║          Cold Start Protection Enabled                              ║');
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
app.set('trust proxy', 1);

// ============================================================================
// Step 1: ★★★ Cold Start Warmup 미들웨어 ★★★ (가장 먼저!)
// ============================================================================

const coldStartMiddleware: RequestHandler = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const isColdStart = await warmupManager.checkAndWarmup();
    req._coldStart = isColdStart;
    
    if (isColdStart) {
      // 콜드 스타트 후 첫 요청임을 헤더로 표시
      res.setHeader('X-Cold-Start', 'true');
    }
  } catch (error) {
    // 웜업 실패해도 요청은 처리
    console.error('[COLDSTART] Warmup error:', error);
  }
  
  next();
};

app.use(coldStartMiddleware);

// ============================================================================
// Step 2: Security & CORS
// ============================================================================

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Skip-Session'],
}));

app.use(compression());

// ============================================================================
// Step 3: Body & Cookie Parsers
// ============================================================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'tburn-cookie-secret'));

// ============================================================================
// Step 4: Pre-Session Filter (세션 스킵 결정)
// ============================================================================

const SESSION_FREE_PATHS = [
  '/rpc', '/jsonrpc', '/json-rpc', '/eth', '/api/rpc',
  '/ws', '/wss', '/socket', '/socket.io',
  '/health', '/healthz', '/readyz', '/livez', '/ping', '/status', '/metrics',
  '/api/health', '/api/status', '/api/ping', '/api/metrics', '/api/warmup',
  '/api/blocks', '/api/block', '/api/transactions', '/api/tx',
  '/api/validators', '/api/network', '/api/price', '/api/market',
  '/api/explorer', '/api/chain', '/api/stats', '/api/supply', '/api/gas',
  '/api/info', '/api/version', '/api/production-monitor', '/api/session-health',
];

const STATIC_EXTENSIONS = /\.(js|mjs|cjs|jsx|ts|tsx|css|scss|sass|less|png|jpg|jpeg|gif|svg|webp|ico|avif|woff|woff2|ttf|eot|otf|mp3|mp4|webm|ogg|wav|pdf|zip|gz|json|xml|txt|md|yaml|yml|map|wasm)$/i;

const STATIC_PREFIXES = [
  '/assets', '/static', '/public', '/dist', '/build', '/chunks',
  '/js', '/css', '/fonts', '/images', '/icons', '/media',
  '/__vite', '/@vite', '/@fs', '/_next', '/node_modules',
  '/favicon', '/robots.txt', '/sitemap', '/manifest',
];

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

const preSessionFilter: RequestHandler = (req: ExtendedRequest, res: Response, next: NextFunction) => {
  const url = req.url || req.originalUrl || '/';
  const pathOnly = url.split('?')[0].toLowerCase();
  const method = req.method?.toUpperCase() || 'GET';
  
  let shouldSkip = false;
  
  // 1. 세션 프리 경로
  for (const freePath of SESSION_FREE_PATHS) {
    if (pathOnly === freePath || pathOnly.startsWith(freePath + '/')) {
      shouldSkip = true;
      break;
    }
  }
  
  // 2. 정적 파일 확장자
  if (!shouldSkip && STATIC_EXTENSIONS.test(pathOnly)) {
    shouldSkip = true;
  }
  
  // 3. 정적 파일 경로
  if (!shouldSkip) {
    for (const prefix of STATIC_PREFIXES) {
      if (pathOnly.startsWith(prefix)) {
        shouldSkip = true;
        break;
      }
    }
  }
  
  // 4. OPTIONS/HEAD
  if (!shouldSkip && (method === 'OPTIONS' || method === 'HEAD')) {
    shouldSkip = true;
  }
  
  // 5. 헤더 기반 스킵
  if (!shouldSkip && req.headers['x-skip-session'] === 'true') {
    shouldSkip = true;
  }
  
  // 6. WebSocket
  if (!shouldSkip && req.headers['upgrade']?.toLowerCase() === 'websocket') {
    shouldSkip = true;
  }
  
  // 7. 캐시버스팅 파라미터
  if (!shouldSkip && /[?&](_t|_|t|timestamp|ts|cachebust|cb|nocache|v|nonce|rand)=/i.test(url)) {
    shouldSkip = true;
  }
  
  if (shouldSkip) {
    req._skipSession = true;
    (req as any).session = null;
    (req as any).sessionID = null;
    blockSetCookie(res);
  }
  
  next();
};

app.use(preSessionFilter);

// ============================================================================
// Step 5: 정적 파일 서빙 (세션 전에!)
// ============================================================================

const staticOptions: express.static.ServeStaticOptions = {
  maxAge: ENV.isProduction ? '1y' : 0,
  etag: true,
  lastModified: true,
  index: false,
  immutable: ENV.isProduction,
  setHeaders: (res: Response, filePath: string) => {
    res.removeHeader('Set-Cookie');
    if (/-[a-zA-Z0-9]{8,}\.(js|css|woff2?)$/.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  },
};

app.use('/assets', express.static(path.join(process.cwd(), 'public/assets'), staticOptions));
app.use('/assets', express.static(path.join(process.cwd(), 'dist/assets'), staticOptions));
app.use('/assets', express.static(path.join(process.cwd(), 'dist/public/assets'), staticOptions));
app.use('/static', express.static(path.join(process.cwd(), 'public/static'), staticOptions));
app.use('/dist', express.static(path.join(process.cwd(), 'dist'), staticOptions));

app.use('/assets/*', (req: Request, res: Response) => {
  res.status(404).set('Cache-Control', 'no-store').json({ error: 'Asset not found' });
});

// ============================================================================
// Step 6: ★★★ 세션 스토어 설정 (재연결 로직 포함) ★★★
// ============================================================================

let sessionStore: session.Store;
let usingMemoryStore = false;
let dbPool: any = null;

if (ENV.hasDatabase) {
  try {
    const connectPgSimple = require('connect-pg-simple')(session);
    const { Pool } = require('pg');
    
    // ★ 재연결 로직이 포함된 풀 설정
    dbPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: ENV.isProduction ? { rejectUnauthorized: false } : false,
      max: 10,
      min: 2,  // 최소 연결 유지
      idleTimeoutMillis: 60000,  // 60초 (30초에서 증가)
      connectionTimeoutMillis: 10000,  // 연결 타임아웃 10초
      allowExitOnIdle: false,  // 유휴 시에도 풀 유지
    });
    
    // 연결 에러 핸들러
    dbPool.on('error', (err: Error) => {
      console.error('[DB] Pool error:', err.message);
      // 자동 재연결됨
    });
    
    // 연결 성공 로그
    dbPool.on('connect', () => {
      console.log('[DB] New connection established');
    });
    
    // 초기 연결 테스트
    dbPool.query('SELECT 1').then(() => {
      console.log('[DB] ✓ Initial connection successful');
    }).catch((err: Error) => {
      console.error('[DB] Initial connection failed:', err.message);
    });
    
    sessionStore = new connectPgSimple({
      pool: dbPool,
      tableName: 'session',
      createTableIfMissing: true,
      pruneSessionInterval: 60,  // 60초마다 만료 세션 정리
      errorLog: (err: Error) => {
        console.error('[SESSION-STORE] Error:', err.message);
      },
    });
    
    // 웜업 매니저에 등록
    warmupManager.setDbPool(dbPool);
    warmupManager.setSessionStore(sessionStore);
    
    console.log('[SESSION] ✓ Using PostgreSQL session store with reconnection');
    
  } catch (error: any) {
    console.error('[SESSION] PostgreSQL setup failed:', error.message);
    sessionStore = new session.MemoryStore();
    usingMemoryStore = true;
  }
} else {
  console.log('[SESSION] Using MemoryStore');
  sessionStore = new session.MemoryStore();
  usingMemoryStore = true;
  warmupManager.setSessionStore(sessionStore);
}

// ============================================================================
// Step 7: ★★★ 세션 미들웨어 (타임아웃 + 에러 복구) ★★★
// ============================================================================

const baseSessionMiddleware = session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'tburn-session-secret-change-me-32chars',
  name: 'connect.sid',
  resave: false,
  saveUninitialized: false,
  rolling: true,  // 활동 시 세션 갱신
  proxy: ENV.isProduction,
  cookie: {
    secure: ENV.isProduction,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax',
  },
});

/**
 * ★ 세션 미들웨어 래퍼 - 타임아웃 + 에러 복구
 */
const SESSION_TIMEOUT = 5000;  // 5초 타임아웃

const wrappedSessionMiddleware: RequestHandler = (req: ExtendedRequest, res: Response, next: NextFunction) => {
  // 이미 스킵 결정됨
  if (req._skipSession) {
    return next();
  }
  
  let completed = false;
  
  // 타임아웃 설정
  const timeoutId = setTimeout(() => {
    if (completed) return;
    completed = true;
    
    console.warn('[SESSION] Timeout - skipping session for this request');
    
    // 세션 없이 진행
    (req as any).session = null;
    res.setHeader('X-Session-Timeout', 'true');
    next();
  }, SESSION_TIMEOUT);
  
  // 세션 미들웨어 실행
  baseSessionMiddleware(req, res, (err?: any) => {
    if (completed) return;
    completed = true;
    clearTimeout(timeoutId);
    
    if (err) {
      console.error('[SESSION] Middleware error:', err.message);
      
      // ★ 세션 에러 시 쿠키 삭제하고 진행
      res.clearCookie('connect.sid', {
        path: '/',
        httpOnly: true,
        secure: ENV.isProduction,
        sameSite: 'lax',
      });
      
      // 세션 없이 진행 (에러를 전파하지 않음!)
      (req as any).session = null;
      res.setHeader('X-Session-Error', 'recovered');
      return next();  // next(err) 대신 next()
    }
    
    // 세션 마지막 접근 시간 업데이트
    if (req.session) {
      req.session.lastAccess = Date.now();
    }
    
    next();
  });
};

app.use(wrappedSessionMiddleware);

// ============================================================================
// Step 8: ★★★ 만료된 세션 쿠키 복구 미들웨어 ★★★
// ============================================================================

const sessionRecoveryMiddleware: RequestHandler = (req: ExtendedRequest, res: Response, next: NextFunction) => {
  // 세션이 있어야 하는 경로인데 세션이 없는 경우
  const needsSession = req.url.startsWith('/api/user') || 
                       req.url.startsWith('/api/auth') ||
                       req.url.startsWith('/dashboard') ||
                       req.url.startsWith('/profile');
  
  const hasSessionCookie = !!(req.cookies?.['connect.sid']);
  const hasSession = !!(req.session && req.session.id);
  
  // 쿠키는 있는데 세션이 없으면 (만료됨)
  if (needsSession && hasSessionCookie && !hasSession) {
    console.log('[SESSION] Stale cookie detected, clearing');
    
    res.clearCookie('connect.sid', {
      path: '/',
      httpOnly: true,
      secure: ENV.isProduction,
      sameSite: 'lax',
    });
    
    // 로그인 필요한 API면 401 반환
    if (req.url.startsWith('/api/')) {
      return res.status(401).json({
        error: 'Session expired',
        code: 'SESSION_EXPIRED',
        message: 'Please refresh the page or login again',
      });
    }
  }
  
  next();
};

app.use(sessionRecoveryMiddleware);

// ============================================================================
// Step 9: Health Check & Warmup 엔드포인트
// ============================================================================

// 기본 헬스 체크
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: ENV.nodeEnv,
    production: ENV.isProduction,
    sessionStore: usingMemoryStore ? 'MemoryStore' : 'PostgreSQL',
    coldStart: (req as ExtendedRequest)._coldStart || false,
  });
});

// ★ 웜업 엔드포인트 (외부에서 주기적 호출 가능)
app.get('/api/warmup', async (req, res) => {
  const startTime = Date.now();
  
  try {
    // DB 핑
    if (dbPool) {
      await dbPool.query('SELECT 1');
    }
    
    const elapsed = Date.now() - startTime;
    
    res.json({
      status: 'warm',
      elapsed: `${elapsed}ms`,
      warmupStatus: warmupManager.getStatus(),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'cold',
      error: error.message,
      warmupStatus: warmupManager.getStatus(),
    });
  }
});

app.get('/healthz', (req, res) => res.status(200).send('OK'));

app.get('/readyz', async (req, res) => {
  const memUsage = process.memoryUsage();
  const memRatio = memUsage.heapUsed / memUsage.heapTotal;
  
  // DB 연결 체크
  let dbOk = true;
  if (dbPool) {
    try {
      await dbPool.query('SELECT 1');
    } catch {
      dbOk = false;
    }
  }
  
  const ready = memRatio < 0.90 && dbOk;
  
  if (ready) {
    res.status(200).send('READY');
  } else {
    res.status(503).json({
      ready: false,
      memory: `${(memRatio * 100).toFixed(1)}%`,
      database: dbOk ? 'OK' : 'ERROR',
    });
  }
});

// 세션 헬스 체크
app.get('/api/session-health', (req, res) => {
  const memUsage = process.memoryUsage();
  
  let sessionCount = 0;
  if (usingMemoryStore && sessionStore) {
    const sessions = (sessionStore as any).sessions;
    if (sessions) sessionCount = Object.keys(sessions).length;
  }
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    sessionStore: usingMemoryStore ? 'MemoryStore' : 'PostgreSQL',
    activeSessions: sessionCount,
    warmupStatus: warmupManager.getStatus(),
    memory: {
      heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      usage: `${((memUsage.heapUsed / memUsage.heapTotal) * 100).toFixed(2)}%`,
    },
    uptime: Math.floor(process.uptime()),
  });
});

// ============================================================================
// Step 10: RPC 엔드포인트
// ============================================================================

app.all('/rpc', (req, res) => {
  if (req.method === 'POST') {
    const body = req.body || {};
    res.json({
      jsonrpc: '2.0',
      id: body.id || null,
      result: { status: 'ok', blockNumber: '0x' + Math.floor(Date.now() / 1000).toString(16) },
    });
  } else {
    res.json({ jsonrpc: '2.0', id: null, result: { status: 'ok' } });
  }
});

app.all('/rpc/*', (req, res) => {
  res.json({ jsonrpc: '2.0', id: null, result: { status: 'ok' } });
});

// ============================================================================
// Step 11: API 라우트
// ============================================================================

app.get('/api/blocks/latest', (req, res) => {
  res.json({
    blockNumber: 21332811 + Math.floor(Math.random() * 100),
    timestamp: Date.now(),
  });
});

app.get('/api/network/stats', (req, res) => {
  res.json({ tps: 50908, validators: 110, uptime: 99.95 });
});

app.get('/api/user/profile', (req, res) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Unauthorized', code: 'NO_SESSION' });
  }
  res.json({ userId: req.session.userId });
});

// ============================================================================
// Step 12: SPA Fallback
// ============================================================================

app.get('*', (req, res) => {
  if (req.url.startsWith('/api/') || req.url.startsWith('/rpc')) {
    return res.status(404).json({ error: 'Not Found' });
  }
  
  const indexPaths = [
    path.join(process.cwd(), 'dist/public/index.html'),
    path.join(process.cwd(), 'public/index.html'),
    path.join(process.cwd(), 'dist/index.html'),
  ];
  
  for (const indexPath of indexPaths) {
    try {
      if (require('fs').existsSync(indexPath)) {
        return res.sendFile(indexPath);
      }
    } catch (e) {}
  }
  
  res.status(404).send('index.html not found');
});

// ============================================================================
// Step 13: ★★★ 글로벌 에러 핸들러 (세션 에러 복구) ★★★
// ============================================================================

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.url });
});

// 글로벌 에러 핸들러
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[APP] Error:', err.message);
  
  // ★ 세션 관련 에러 특별 처리
  if (err.message?.includes('session') || 
      err.message?.includes('connect.sid') ||
      err.code === 'ECONNREFUSED' ||
      err.code === 'ENOTFOUND') {
    
    // 쿠키 삭제
    res.clearCookie('connect.sid', {
      path: '/',
      httpOnly: true,
      secure: ENV.isProduction,
      sameSite: 'lax',
    });
    
    // 새로고침 유도 (HTML 요청인 경우)
    const acceptsHtml = req.headers.accept?.includes('text/html');
    if (acceptsHtml && !req.url.startsWith('/api/')) {
      return res.redirect(req.originalUrl);
    }
    
    return res.status(503).json({
      error: 'Service temporarily unavailable',
      code: 'SESSION_ERROR',
      message: 'Please refresh the page',
      retry: true,
    });
  }
  
  const message = ENV.isProduction ? 'Internal Server Error' : err.message;
  res.status(err.status || 500).json({ error: message });
});

// ============================================================================
// Step 14: Graceful Shutdown
// ============================================================================

const shutdown = async (signal: string) => {
  console.log(`[APP] ${signal} received, shutting down...`);
  
  // DB 풀 종료
  if (dbPool) {
    try {
      await dbPool.end();
      console.log('[DB] Pool closed');
    } catch (e) {}
  }
  
  setTimeout(() => process.exit(0), 5000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('uncaughtException', (err) => {
  console.error('[APP] Uncaught Exception:', err);
  setTimeout(() => process.exit(1), 1000);
});
process.on('unhandledRejection', (reason) => {
  console.error('[APP] Unhandled Rejection:', reason);
});

// ============================================================================
// Step 15: MemoryStore 자동 정리
// ============================================================================

if (usingMemoryStore) {
  setInterval(() => {
    const memUsage = process.memoryUsage();
    const memRatio = memUsage.heapUsed / memUsage.heapTotal;
    
    const sessions = (sessionStore as any).sessions;
    if (!sessions) return;
    
    const sessionCount = Object.keys(sessions).length;
    
    if (memRatio > 0.85 || sessionCount > 5000) {
      console.log(`[DR] Cleanup: Memory ${(memRatio * 100).toFixed(1)}%, Sessions ${sessionCount}`);
      const keys = Object.keys(sessions);
      const deleteCount = Math.floor(keys.length * 0.5);
      for (let i = 0; i < deleteCount; i++) {
        delete sessions[keys[i]];
      }
    }
  }, 30000);
}

// ============================================================================
// Export
// ============================================================================

export default app;
export { app };
