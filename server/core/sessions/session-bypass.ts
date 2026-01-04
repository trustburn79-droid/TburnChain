/**
 * Enterprise Session Bypass Module
 * 
 * Centralized session skip logic to ensure consistency between:
 * - Development environment
 * - Production environment (Autoscale deployment)
 * 
 * CRITICAL: This module prevents MemoryStore overflow that causes
 * "Internal Server Error" and "upstream request timeout" after 30-60 minutes
 * 
 * Session Skip Rules:
 * 1. Localhost requests (127.0.0.1, ::1) - always skip, even with cookies
 * 2. Empty User-Agent - skip (internal/headless requests)
 * 3. Axios/node-fetch/undici User-Agent - skip (internal HTTP clients)
 * 4. Public API paths - skip for requests without existing session cookies
 * 5. Internal monitoring paths - always skip
 */

import { Request, Response } from 'express';

// ============================================================================
// Session Skip Path Configuration
// ============================================================================

// Paths that ALWAYS skip session (regardless of cookies)
export const ALWAYS_SKIP_PREFIXES = [
  '/api/internal',              // Internal monitoring API (Phase 16)
  '/api/soak-tests',            // Soak test API (Phase 16)
  '/api/public',                // Public API
  '/api/health',                // Health checks
  '/health',                    // Root health check
  '/api/db-optimizer',          // DB optimizer internal API
];

// Paths that skip session for non-authenticated requests
export const PUBLIC_API_PREFIXES = [
  '/api/shard-cache',           // Shard cache API
  '/api/cross-shard-router',    // Cross-shard router API
  '/api/shard-rebalancer',      // Shard rebalancer API
  '/api/batch-processor',       // Batch processor API
  '/api/validators/status',     // Validator status (public)
  '/api/validators/stats',      // Validator stats (public)
  '/api/rewards/stats',         // Rewards stats (public)
  '/api/rewards/epoch',         // Epoch info (public)
  '/api/network/stats',         // Network stats (public)
  '/api/scalability',           // Scalability API (public)
  '/api/consensus/state',       // Consensus state (public)
  '/api/block-production',      // Block production (public)
];

// Exact GET paths that skip session for non-authenticated requests
export const EXACT_GET_PATHS = [
  '/api/shards',                // Shard list
  '/api/blocks',                // Block list
  '/api/transactions',          // Transaction list
  '/api/wallets',               // Wallet list
  '/api/contracts',             // Contract list
];

// User agents that indicate internal/automated requests
export const INTERNAL_USER_AGENTS = [
  'node-fetch',
  'undici',
  'axios',
  'got',
  'node',
  'curl',
  'wget',
  'python-requests',
  'httpie',
];

// Paths that ALWAYS require session (never skip)
export const AUTH_REQUIRED_PATTERNS = [
  '/admin',
  '/config',
  '/maintenance',
  '/auth',
  '/user',
  '/member',
  '/login',
  '/logout',
  '/session',
];

// ============================================================================
// Session Bypass Detection
// ============================================================================

export interface SessionBypassResult {
  shouldSkip: boolean;
  reason: string;
  isInternalRequest: boolean;
  hasSessionCookie: boolean;
}

/**
 * Determines if a request should bypass session creation
 * 
 * @param req Express request object
 * @returns SessionBypassResult with skip decision and reason
 */
export function shouldBypassSession(req: Request): SessionBypassResult {
  const normalizedPath = normalizePath(req.path);
  const userAgent = req.headers['user-agent'] || '';
  const hasInternalHeader = req.headers['x-internal-request'] === 'true';
  
  // Detect internal requests
  const isInternalRequest = detectInternalRequest(req, userAgent, hasInternalHeader);
  
  // Check for existing session cookie
  const hasSessionCookie = hasValidSessionCookie(req);
  
  // 1. Always skip for internal monitoring paths
  if (matchesPrefix(normalizedPath, ALWAYS_SKIP_PREFIXES)) {
    return {
      shouldSkip: true,
      reason: 'always_skip_path',
      isInternalRequest,
      hasSessionCookie,
    };
  }
  
  // 2. Always skip for internal requests (localhost, axios, empty UA)
  if (isInternalRequest) {
    return {
      shouldSkip: true,
      reason: 'internal_request',
      isInternalRequest: true,
      hasSessionCookie,
    };
  }
  
  // 3. Check if path requires authentication
  if (requiresAuthentication(normalizedPath, req.method)) {
    return {
      shouldSkip: false,
      reason: 'auth_required_path',
      isInternalRequest,
      hasSessionCookie,
    };
  }
  
  // 4. Skip public API paths for requests without session cookies
  if (!hasSessionCookie) {
    if (matchesPrefix(normalizedPath, PUBLIC_API_PREFIXES)) {
      return {
        shouldSkip: true,
        reason: 'public_api_no_cookie',
        isInternalRequest,
        hasSessionCookie,
      };
    }
    
    if (req.method === 'GET' && EXACT_GET_PATHS.includes(normalizedPath)) {
      return {
        shouldSkip: true,
        reason: 'exact_get_no_cookie',
        isInternalRequest,
        hasSessionCookie,
      };
    }
  }
  
  // 5. Don't skip - need session
  return {
    shouldSkip: false,
    reason: 'session_required',
    isInternalRequest,
    hasSessionCookie,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function normalizePath(path: string): string {
  // Remove trailing slash for consistent matching
  return path.endsWith('/') && path.length > 1 
    ? path.slice(0, -1) 
    : path;
}

function detectInternalRequest(req: Request, userAgent: string, hasInternalHeader: boolean): boolean {
  // Check X-Internal-Request header
  if (hasInternalHeader) {
    return true;
  }
  
  // Check for localhost IP
  const ip = req.ip || '';
  if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1') {
    return true;
  }
  
  // Check for empty User-Agent (headless/internal requests)
  if (userAgent === '') {
    return true;
  }
  
  // Check for known internal HTTP client User-Agents
  const lowerUA = userAgent.toLowerCase();
  for (const internalUA of INTERNAL_USER_AGENTS) {
    if (lowerUA.includes(internalUA)) {
      return true;
    }
  }
  
  return false;
}

function hasValidSessionCookie(req: Request): boolean {
  const cookie = req.headers.cookie || '';
  return cookie.includes('connect.sid');
}

function matchesPrefix(path: string, prefixes: string[]): boolean {
  return prefixes.some(prefix => 
    path === prefix || path.startsWith(prefix + '/')
  );
}

function requiresAuthentication(path: string, method: string): boolean {
  // Check auth-required patterns
  for (const pattern of AUTH_REQUIRED_PATTERNS) {
    if (path.includes(pattern)) {
      return true;
    }
  }
  
  // POST/PUT/DELETE on protected routes
  if (method !== 'GET') {
    if (path.includes('/start') || 
        path.includes('/stop') || 
        path.includes('/benchmark')) {
      return true;
    }
  }
  
  return false;
}

// ============================================================================
// Set-Cookie Header Blocking
// ============================================================================

/**
 * Blocks Set-Cookie header from being sent
 * Call this when session should be skipped
 */
export function blockSetCookie(res: Response): void {
  // Override setHeader to block Set-Cookie
  const originalSetHeader = res.setHeader.bind(res);
  res.setHeader = function(name: string, value: any) {
    if (name.toLowerCase() === 'set-cookie') {
      // Block Set-Cookie header for skipped sessions
      return res;
    }
    return originalSetHeader(name, value);
  };
  
  // Also remove any existing Set-Cookie header
  res.removeHeader('Set-Cookie');
}

/**
 * Creates a minimal fake session object for skipped requests
 */
export function createSkipSession(): any {
  return {
    id: 'skip-session',
    cookie: {},
    regenerate: (cb: any) => cb && cb(),
    destroy: (cb: any) => cb && cb(),
    reload: (cb: any) => cb && cb(),
    save: (cb: any) => cb && cb(),
    touch: () => {},
  };
}

// ============================================================================
// MemoryStore Capacity Monitoring
// ============================================================================

let memoryStoreWarningThreshold = 0.7; // 70% capacity warning
let lastCapacityWarning = 0;
const CAPACITY_WARNING_INTERVAL = 60000; // 1 minute between warnings

export function checkMemoryStoreCapacity(
  currentSessions: number,
  maxSessions: number
): { isWarning: boolean; isCritical: boolean; percentUsed: number } {
  const percentUsed = currentSessions / maxSessions;
  const isWarning = percentUsed >= memoryStoreWarningThreshold;
  const isCritical = percentUsed >= 0.9;
  
  const now = Date.now();
  if (isWarning && now - lastCapacityWarning > CAPACITY_WARNING_INTERVAL) {
    lastCapacityWarning = now;
    console.warn(
      `[Session] ⚠️ MemoryStore capacity warning: ${(percentUsed * 100).toFixed(1)}% ` +
      `(${currentSessions}/${maxSessions}) - Consider enabling Redis`
    );
  }
  
  if (isCritical) {
    console.error(
      `[Session] 🚨 CRITICAL: MemoryStore at ${(percentUsed * 100).toFixed(1)}% capacity! ` +
      `Server may become unresponsive.`
    );
  }
  
  return { isWarning, isCritical, percentUsed };
}

export function setMemoryStoreWarningThreshold(threshold: number): void {
  memoryStoreWarningThreshold = Math.max(0.5, Math.min(0.95, threshold));
}
