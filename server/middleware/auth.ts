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

declare module 'express-session' {
  interface SessionData {
    authenticated?: boolean;
    adminAuthenticated?: boolean;
    userId?: number;
    email?: string;
    walletAddress?: string;
  }
}

/**
 * Require admin authentication
 * Checks for admin session or valid admin password header
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  console.log('[Admin] requireAdmin check - sessionID:', req.sessionID, 'adminAuthenticated:', req.session?.adminAuthenticated, 'path:', req.path);
  
  if (req.session?.adminAuthenticated) {
    console.log('[Admin] ✅ Admin access granted for session:', req.sessionID);
    return next();
  }
  
  if (req.session?.authenticated) {
    const adminPassword = req.headers['x-admin-password'] as string;
    
    if (!ADMIN_PASSWORD) {
      console.error('[Admin] CRITICAL: ADMIN_PASSWORD environment variable not set!');
      res.status(500).json({ error: 'Server configuration error' });
      return;
    }
    
    if (adminPassword && crypto.timingSafeEqual(
      Buffer.from(adminPassword),
      Buffer.from(ADMIN_PASSWORD)
    )) {
      console.log('[Admin] ✅ Admin access granted via password header');
      return next();
    }
  }
  
  console.log('[Admin] ❌ Admin access denied - not authenticated');
  res.status(401).json({ 
    error: 'Admin authentication required',
    message: 'Please login as admin to access this resource'
  });
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
    const { eq, and, gt } = await import('drizzle-orm');
    
    const [code] = await db.select()
      .from(validatorInvitationCodes)
      .where(and(
        eq(validatorInvitationCodes.code, invitationCode),
        eq(validatorInvitationCodes.isActive, true),
        gt(validatorInvitationCodes.maxUses, validatorInvitationCodes.usedCount)
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
    res.status(500).json({
      error: 'Failed to validate invitation code'
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
