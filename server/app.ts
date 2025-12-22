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

// ★ [수정 1] connect-redis 불러오는 방식 변경 (ESM 호환)
import { RedisStore } from "connect-redis";

declare module "express-session" {
  interface SessionData {
    authenticated?: boolean;
    adminAuthenticated?: boolean;
    memberId?: string;
    memberEmail?: string;
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

// ★ [수정 3] Redis URL 강제 설정 (환경변수 없으면 로컬호스트 사용)
// 이렇게 해야 구글 서버에 설치된 Redis를 32개 코어가 같이 씁니다.
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const isProduction = process.env.NODE_ENV === "production" || true; // ★ 강제로 프로덕션 모드 (HTTPS 사용 위해)
const isReplit = process.env.REPL_ID !== undefined; // Replit 환경 감지

let sessionStore: session.Store;
let sessionStoreType: string;

// ★ [수정 4] Redis 연결 로직 강화
// Replit 환경에서는 MemoryStore 사용, 프로덕션(구글 클라우드)에서는 Redis 사용
if (isReplit) {
  // Replit 개발 환경: MemoryStore 사용 (Redis 없음)
  sessionStore = new MemoryStore({
    checkPeriod: 86400000, // prune expired entries every 24h
  });
  sessionStoreType = "MemoryStore (Replit Development)";
} else {
  // 프로덕션 환경 (구글 클라우드): Redis 사용
  console.log(`[Init] Attempting to connect to Redis at ${REDIS_URL}...`);

  const redisClient = createClient({ url: REDIS_URL });

  redisClient.on("error", (err) => {
    console.error("[Redis] Connection Error:", err);
  });
  redisClient.on("connect", () => {
    log("✅ Redis connected successfully (Cluster Mode Ready)", "session");
  });

  // Redis 클라이언트 연결 시작
  redisClient.connect().catch(console.error);

  // 세션 스토어로 Redis 지정
  sessionStore = new RedisStore({ 
    client: redisClient,
    prefix: "tburn:", // 키 충돌 방지용 접두사
  });
  sessionStoreType = "Redis (Enterprise Cluster Mode)";
}

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || "tburn-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: !isReplit,   // ★ HTTPS 필수 (Nginx 뒤에 있으므로 true), Replit에서는 false
      httpOnly: true, // 자바스크립트 접근 방지 (보안)
      maxAge: 24 * 60 * 60 * 1000, // 24시간
      sameSite: "lax", 
    },
    proxy: !isReplit, // ★ Nginx 프록시 설정 (Replit에서는 false)
  })
);

log(`Session store: ${sessionStoreType}`, "session");

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

  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
}
