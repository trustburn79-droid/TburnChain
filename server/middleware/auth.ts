/**
 * TBURN Enterprise Authentication Middleware
 * Centralized authentication and authorization for all API routes
 * 
 * Security: Production-grade session-based authentication with admin protection
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.SITE_PASSWORD;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "trustburn79@gmail.com";

const ADMIN_RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const ADMIN_MAX_ATTEMPTS = 5;
const ADMIN_LOCKOUT_DURATION = 60 * 60 * 1000;

const adminAttemptStore = new Map<string, { attempts: number; resetTime: number; lockedUntil?: number }>();

setInterval(() => {
  const now = Date.now();
  const entries = Array.from(adminAttemptStore.entries());
  for (const [key, value] of entries) {
    if (value.resetTime < now && (!value.lockedUntil || value.lockedUntil < now)) {
      adminAttemptStore.delete(key);
    }
  }
}, 60000);

declare module 'express-session' {
  interface SessionData {
    authenticated?: boolean;
    adminAuthenticated?: boolean;
    userId?: number;
    email?: string;
    walletAddress?: string;
  }
}

function logAdminAttempt(ip: string, success: boolean, sessionId?: string): void {
  const timestamp = new Date().toISOString();
  const status = success ? '✅ SUCCESS' : '❌ FAILED';
  console.log(`[AdminAuth] ${timestamp} | ${status} | IP: ${ip} | Session: ${sessionId || 'N/A'}`);
}

function checkAdminRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = adminAttemptStore.get(ip);
  
  if (record?.lockedUntil && record.lockedUntil > now) {
    return { allowed: false, retryAfter: Math.ceil((record.lockedUntil - now) / 1000) };
  }
  
  if (!record || record.resetTime < now) {
    return { allowed: true };
  }
  
  if (record.attempts >= ADMIN_MAX_ATTEMPTS) {
    record.lockedUntil = now + ADMIN_LOCKOUT_DURATION;
    console.warn(`[AdminAuth] ⚠️ IP ${ip} locked out for ${ADMIN_LOCKOUT_DURATION / 60000} minutes after ${ADMIN_MAX_ATTEMPTS} failed attempts`);
    return { allowed: false, retryAfter: Math.ceil(ADMIN_LOCKOUT_DURATION / 1000) };
  }
  
  return { allowed: true };
}

function recordAdminAttempt(ip: string, success: boolean): void {
  const now = Date.now();
  
  if (success) {
    adminAttemptStore.delete(ip);
    return;
  }
  
  const record = adminAttemptStore.get(ip);
  if (!record || record.resetTime < now) {
    adminAttemptStore.set(ip, { attempts: 1, resetTime: now + ADMIN_RATE_LIMIT_WINDOW });
  } else {
    record.attempts++;
  }
}

/**
 * Require admin authentication
 * Checks for admin session only - no header-based password bypass
 * Use /api/admin/login endpoint to authenticate
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  console.log('[Admin] requireAdmin check - sessionID:', req.sessionID, 'adminAuthenticated:', req.session?.adminAuthenticated, 'path:', req.path);
  
  if (req.session?.adminAuthenticated) {
    console.log('[Admin] ✅ Admin access granted for session:', req.sessionID);
    return next();
  }
  
  console.log('[Admin] ❌ Admin access denied - not authenticated');
  res.status(401).json({ 
    error: 'Admin authentication required',
    message: 'Please login as admin to access this resource'
  });
}

/**
 * Admin login handler - use this to authenticate as admin
 * POST /api/admin/login with { password: string }
 */
export async function handleAdminLogin(req: Request, res: Response): Promise<void> {
  const ip = getClientIP(req);
  const password = req.body?.password;
  
  const rateLimitCheck = checkAdminRateLimit(ip);
  if (!rateLimitCheck.allowed) {
    logAdminAttempt(ip, false, req.sessionID);
    res.status(429).json({
      error: 'Too many failed attempts',
      message: `Account locked. Please try again in ${rateLimitCheck.retryAfter} seconds.`,
      retryAfter: rateLimitCheck.retryAfter
    });
    return;
  }
  
  if (!ADMIN_PASSWORD) {
    console.error('[Admin] CRITICAL: ADMIN_PASSWORD environment variable not set!');
    res.status(503).json({ error: 'Service temporarily unavailable' });
    return;
  }
  
  if (!password || typeof password !== 'string') {
    recordAdminAttempt(ip, false);
    logAdminAttempt(ip, false, req.sessionID);
    res.status(400).json({ error: 'Password required' });
    return;
  }
  
  try {
    const passwordBuffer = Buffer.from(password);
    const adminBuffer = Buffer.from(ADMIN_PASSWORD);
    
    if (passwordBuffer.length !== adminBuffer.length || 
        !crypto.timingSafeEqual(passwordBuffer, adminBuffer)) {
      recordAdminAttempt(ip, false);
      logAdminAttempt(ip, false, req.sessionID);
      res.status(401).json({ error: 'Invalid admin password' });
      return;
    }
    
    recordAdminAttempt(ip, true);
    req.session.adminAuthenticated = true;
    req.session.authenticated = true;
    
    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    logAdminAttempt(ip, true, req.sessionID);
    console.log('[Admin] ✅ Admin session established for:', req.sessionID);
    
    res.json({
      success: true,
      message: 'Admin login successful',
      sessionId: req.sessionID
    });
  } catch (error) {
    console.error('[Admin] Login error:', error);
    res.status(503).json({ error: 'Service temporarily unavailable' });
  }
}

/**
 * Require any authenticated session (user or admin)
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (req.session?.authenticated || req.session?.adminAuthenticated) {
    return next();
  }
  
  res.status(401).json({ 
    error: 'Authentication required',
    message: 'Please login to access this resource'
  });
}

/**
 * Optional authentication - populates user info if authenticated, continues regardless
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  next();
}

/**
 * Require invitation code for validator registration
 * Validates invitation code from header or body
 */
export async function requireInvitationCode(req: Request, res: Response, next: NextFunction): Promise<void> {
  const invitationCode = req.headers['x-invitation-code'] as string || req.body?.invitationCode;
  
  if (!invitationCode) {
    res.status(403).json({
      error: 'Invitation code required',
      message: 'Valid invitation code is required for validator registration'
    });
    return;
  }
  
  try {
    const { db } = await import('../db');
    const { validatorInvitationCodes } = await import('@shared/schema');
    const { eq, and } = await import('drizzle-orm');
    
    const [code] = await db.select()
      .from(validatorInvitationCodes)
      .where(and(
        eq(validatorInvitationCodes.code, invitationCode),
        eq(validatorInvitationCodes.isUsed, false)
      ))
      .limit(1);
    
    if (!code) {
      res.status(403).json({
        error: 'Invalid invitation code',
        message: 'The provided invitation code is invalid, expired, or has reached its usage limit'
      });
      return;
    }
    
    if (code.expiresAt && new Date(code.expiresAt) < new Date()) {
      res.status(403).json({
        error: 'Invitation code expired',
        message: 'The provided invitation code has expired'
      });
      return;
    }
    
    (req as any).invitationCode = code;
    next();
  } catch (error) {
    console.error('[Auth] Invitation code validation error:', error);
    res.status(503).json({
      error: 'Service temporarily unavailable'
    });
  }
}

/**
 * Rate limiting middleware factory
 */
export function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: Request) => string;
}) {
  const store = new Map<string, { count: number; resetTime: number }>();
  
  setInterval(() => {
    const now = Date.now();
    const entries = Array.from(store.entries());
    for (const [key, value] of entries) {
      if (value.resetTime < now) {
        store.delete(key);
      }
    }
  }, 60000);
  
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = options.keyGenerator 
      ? options.keyGenerator(req) 
      : getClientIP(req);
    
    const now = Date.now();
    const record = store.get(key);
    
    if (!record || record.resetTime < now) {
      store.set(key, { count: 1, resetTime: now + options.windowMs });
      res.setHeader('X-RateLimit-Limit', options.maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', (options.maxRequests - 1).toString());
      return next();
    }
    
    if (record.count >= options.maxRequests) {
      res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
      return;
    }
    
    record.count++;
    res.setHeader('X-RateLimit-Limit', options.maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', (options.maxRequests - record.count).toString());
    next();
  };
}

function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

export { getClientIP };
