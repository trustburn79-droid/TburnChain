import { type Server } from "node:http";
import express, { type Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { registerRoutes } from "./routes";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { log } from "./app";

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
  // Session configuration - MemoryStore for Autoscale (no Redis delay)
  const sessionStore = new MemoryStore({
    checkPeriod: 86400000,
  });

  const cookieSecure = process.env.COOKIE_SECURE === "true";

  app.use(
    session({
      store: sessionStore,
      secret: process.env.SESSION_SECRET || "tburn-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: cookieSecure,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "lax",
      },
      proxy: true,
    })
  );

  log(`Session store: MemoryStore (Production Autoscale)`, "session");

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
}
