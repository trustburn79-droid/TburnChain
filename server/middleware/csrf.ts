/**
 * CSRF Protection Middleware for TBURN Admin Routes
 * Implements double-submit cookie pattern with session-bound tokens
 */

import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

const CSRF_HEADER_NAME = "x-csrf-token";
const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_TOKEN_LENGTH = 32;

declare module "express-session" {
  interface SessionData {
    csrfToken?: string;
    csrfTokenCreatedAt?: number;
  }
}

/**
 * Generate a cryptographically secure CSRF token
 */
function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
}

/**
 * CSRF token generation endpoint handler
 * GET /api/csrf - Returns a new CSRF token for the session
 */
export async function getCsrfToken(req: Request, res: Response): Promise<void> {
  try {
    const session = (req as any).session;
    
    if (!session) {
      res.status(401).json({ success: false, error: "Session required" });
      return;
    }

    if (!session.csrfToken || isTokenExpired(session.csrfTokenCreatedAt)) {
      session.csrfToken = generateCsrfToken();
      session.csrfTokenCreatedAt = Date.now();
    }

    res.json({ 
      success: true, 
      token: session.csrfToken,
      expiresIn: 3600
    });
  } catch (error: any) {
    console.error("[CSRF] Error generating token:", error);
    res.status(500).json({ success: false, error: "Failed to generate CSRF token" });
  }
}

/**
 * Check if CSRF token has expired (1 hour validity)
 */
function isTokenExpired(createdAt?: number): boolean {
  if (!createdAt) return true;
  const TOKEN_VALIDITY_MS = 60 * 60 * 1000;
  return Date.now() - createdAt > TOKEN_VALIDITY_MS;
}

/**
 * CSRF validation middleware
 * Validates the X-CSRF-Token header against the session token
 * Only applies to state-changing methods (POST, PUT, PATCH, DELETE)
 */
export function validateCsrf(req: Request, res: Response, next: NextFunction): void {
  const method = req.method.toUpperCase();

  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    return next();
  }

  const session = (req as any).session;
  
  if (!session) {
    res.status(401).json({ 
      success: false, 
      error: "세션이 필요합니다.",
      code: "CSRF_NO_SESSION" 
    });
    return;
  }

  const headerToken = req.get(CSRF_HEADER_NAME);
  const sessionToken = session.csrfToken;

  if (!headerToken) {
    res.status(403).json({ 
      success: false, 
      error: "CSRF 토큰이 누락되었습니다. 페이지를 새로고침 후 다시 시도해주세요.",
      code: "CSRF_MISSING_TOKEN" 
    });
    return;
  }

  if (!sessionToken) {
    res.status(403).json({ 
      success: false, 
      error: "세션 토큰이 없습니다. 다시 로그인해주세요.",
      code: "CSRF_NO_SESSION_TOKEN" 
    });
    return;
  }

  if (isTokenExpired(session.csrfTokenCreatedAt)) {
    res.status(403).json({ 
      success: false, 
      error: "CSRF 토큰이 만료되었습니다. 페이지를 새로고침 후 다시 시도해주세요.",
      code: "CSRF_TOKEN_EXPIRED" 
    });
    return;
  }

  if (!crypto.timingSafeEqual(
    Buffer.from(headerToken, "utf8"),
    Buffer.from(sessionToken, "utf8")
  )) {
    console.warn(`[CSRF] Token mismatch for session. IP: ${req.ip}`);
    res.status(403).json({ 
      success: false, 
      error: "CSRF 토큰이 유효하지 않습니다. 페이지를 새로고침 후 다시 시도해주세요.",
      code: "CSRF_INVALID_TOKEN" 
    });
    return;
  }

  next();
}

/**
 * Optional: Middleware to refresh CSRF token after each successful mutation
 * Prevents token reuse attacks
 */
export function refreshCsrfAfterMutation(req: Request, res: Response, next: NextFunction): void {
  const originalSend = res.send.bind(res);
  
  res.send = function(body: any): Response {
    const session = (req as any).session;
    if (session && res.statusCode >= 200 && res.statusCode < 300) {
      session.csrfToken = generateCsrfToken();
      session.csrfTokenCreatedAt = Date.now();
    }
    return originalSend(body);
  };
  
  next();
}
