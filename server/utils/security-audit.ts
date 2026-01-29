/**
 * Security Audit Utilities
 * Enterprise-grade security verification for TBURN Mainnet
 * 
 * @module security-audit
 * @version 1.0.0
 * @created 2026-01-29
 * 
 * This module provides utilities to verify security middleware coverage
 * and detect potential vulnerabilities in the application.
 */

import { Express, Router } from 'express';

export interface RouteSecurityInfo {
  method: string;
  path: string;
  hasAuth: boolean;
  hasCsrf: boolean;
  hasRateLimit: boolean;
  isPublic: boolean;
  middlewareStack: string[];
}

export interface SecurityAuditResult {
  timestamp: Date;
  totalRoutes: number;
  protectedRoutes: number;
  unprotectedMutationRoutes: RouteSecurityInfo[];
  publicRoutes: RouteSecurityInfo[];
  csrfProtectedRoutes: number;
  rateLimitedRoutes: number;
  recommendations: string[];
}

const MUTATION_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];
const PUBLIC_ROUTE_PATTERNS = [
  /^\/api\/public\//,
  /^\/api\/health/,
  /^\/api\/status/,
  /^\/api\/warmup/,
  /^\/health$/,
];

const AUTH_MIDDLEWARE_PATTERNS = [
  'requireAdmin',
  'requireAuth',
  'authenticate',
  'verifyToken',
  'sessionCheck',
];

const CSRF_MIDDLEWARE_PATTERNS = [
  'validateCsrf',
  'csrfProtection',
  'verifyCsrf',
];

const RATE_LIMIT_PATTERNS = [
  'rateLimiter',
  'rateLimit',
  'limiter',
  'throttle',
];

/**
 * Extract middleware names from route stack
 */
function extractMiddlewareNames(stack: any[]): string[] {
  return stack
    .filter(layer => layer.name && layer.name !== '<anonymous>')
    .map(layer => layer.name);
}

/**
 * Check if a route path matches public patterns
 */
function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTE_PATTERNS.some(pattern => pattern.test(path));
}

/**
 * Check if middleware stack contains authentication
 */
function hasAuthMiddleware(middlewares: string[]): boolean {
  return middlewares.some(mw => 
    AUTH_MIDDLEWARE_PATTERNS.some(pattern => 
      mw.toLowerCase().includes(pattern.toLowerCase())
    )
  );
}

/**
 * Check if middleware stack contains CSRF protection
 */
function hasCsrfMiddleware(middlewares: string[]): boolean {
  return middlewares.some(mw => 
    CSRF_MIDDLEWARE_PATTERNS.some(pattern => 
      mw.toLowerCase().includes(pattern.toLowerCase())
    )
  );
}

/**
 * Check if middleware stack contains rate limiting
 */
function hasRateLimitMiddleware(middlewares: string[]): boolean {
  return middlewares.some(mw => 
    RATE_LIMIT_PATTERNS.some(pattern => 
      mw.toLowerCase().includes(pattern.toLowerCase())
    )
  );
}

/**
 * Analyze a single route for security coverage
 */
function analyzeRoute(method: string, path: string, stack: any[]): RouteSecurityInfo {
  const middlewares = extractMiddlewareNames(stack);
  
  return {
    method,
    path,
    hasAuth: hasAuthMiddleware(middlewares),
    hasCsrf: hasCsrfMiddleware(middlewares),
    hasRateLimit: hasRateLimitMiddleware(middlewares),
    isPublic: isPublicRoute(path),
    middlewareStack: middlewares,
  };
}

/**
 * Extract all routes from Express app
 */
function extractRoutes(app: Express): { method: string; path: string; stack: any[] }[] {
  const routes: { method: string; path: string; stack: any[] }[] = [];
  
  function processStack(stack: any[], basePath: string = '') {
    for (const layer of stack) {
      if (layer.route) {
        const routePath = basePath + (layer.route.path || '');
        for (const [method, handler] of Object.entries(layer.route.methods)) {
          if (handler) {
            routes.push({
              method: method.toUpperCase(),
              path: routePath,
              stack: layer.route.stack || [],
            });
          }
        }
      } else if (layer.name === 'router' && layer.handle?.stack) {
        const routerPath = layer.regexp?.source
          ?.replace(/\\\//g, '/')
          ?.replace(/\^|\$|\?|\(\?.*\)/g, '')
          || basePath;
        processStack(layer.handle.stack, routerPath);
      }
    }
  }
  
  if ((app as any)._router?.stack) {
    processStack((app as any)._router.stack);
  }
  
  return routes;
}

/**
 * Run a security audit on the Express application
 * Checks for authentication, CSRF, and rate limiting coverage
 */
export function runSecurityAudit(app: Express): SecurityAuditResult {
  const routes = extractRoutes(app);
  const analyzedRoutes = routes.map(r => analyzeRoute(r.method, r.path, r.stack));
  
  const unprotectedMutations = analyzedRoutes.filter(r => 
    MUTATION_METHODS.includes(r.method) &&
    !r.hasAuth &&
    !r.isPublic
  );
  
  const publicRoutes = analyzedRoutes.filter(r => r.isPublic);
  const protectedRoutes = analyzedRoutes.filter(r => r.hasAuth);
  const csrfProtected = analyzedRoutes.filter(r => r.hasCsrf);
  const rateLimited = analyzedRoutes.filter(r => r.hasRateLimit);
  
  const recommendations: string[] = [];
  
  if (unprotectedMutations.length > 0) {
    recommendations.push(
      `CRITICAL: ${unprotectedMutations.length} mutation routes lack authentication. ` +
      `Routes: ${unprotectedMutations.slice(0, 3).map(r => `${r.method} ${r.path}`).join(', ')}` +
      (unprotectedMutations.length > 3 ? '...' : '')
    );
  }
  
  const mutationsWithoutCsrf = analyzedRoutes.filter(r =>
    MUTATION_METHODS.includes(r.method) &&
    r.hasAuth &&
    !r.hasCsrf &&
    !r.isPublic
  );
  
  if (mutationsWithoutCsrf.length > 0) {
    recommendations.push(
      `MEDIUM: ${mutationsWithoutCsrf.length} authenticated mutation routes lack CSRF protection.`
    );
  }
  
  const publicMutations = publicRoutes.filter(r => MUTATION_METHODS.includes(r.method));
  const publicWithoutRateLimit = publicMutations.filter(r => !r.hasRateLimit);
  
  if (publicWithoutRateLimit.length > 0) {
    recommendations.push(
      `HIGH: ${publicWithoutRateLimit.length} public mutation routes lack rate limiting. ` +
      `Routes: ${publicWithoutRateLimit.slice(0, 3).map(r => `${r.method} ${r.path}`).join(', ')}`
    );
  }
  
  if (recommendations.length === 0) {
    recommendations.push('All security checks passed. No immediate concerns detected.');
  }
  
  return {
    timestamp: new Date(),
    totalRoutes: analyzedRoutes.length,
    protectedRoutes: protectedRoutes.length,
    unprotectedMutationRoutes: unprotectedMutations,
    publicRoutes,
    csrfProtectedRoutes: csrfProtected.length,
    rateLimitedRoutes: rateLimited.length,
    recommendations,
  };
}

/**
 * Log security audit results to console
 */
export function logSecurityAudit(result: SecurityAuditResult): void {
  console.log('\n========================================');
  console.log('    SECURITY AUDIT REPORT');
  console.log('========================================');
  console.log(`Timestamp: ${result.timestamp.toISOString()}`);
  console.log(`Total Routes: ${result.totalRoutes}`);
  console.log(`Protected Routes: ${result.protectedRoutes}`);
  console.log(`Public Routes: ${result.publicRoutes.length}`);
  console.log(`CSRF Protected: ${result.csrfProtectedRoutes}`);
  console.log(`Rate Limited: ${result.rateLimitedRoutes}`);
  console.log('----------------------------------------');
  console.log('RECOMMENDATIONS:');
  result.recommendations.forEach((rec, i) => {
    console.log(`  ${i + 1}. ${rec}`);
  });
  console.log('========================================\n');
}

/**
 * Middleware verification helper
 * Ensures required middleware is present on a route
 * 
 * @param analyzedRoute - Route analysis result from runSecurityAudit
 * @param requirements - Required security features
 * @returns Validation result with missing requirements
 */
export function verifyMiddleware(
  analyzedRoute: RouteSecurityInfo,
  requirements: {
    requireAuth?: boolean;
    requireCsrf?: boolean;
    requireRateLimit?: boolean;
  }
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  if (requirements.requireAuth && !analyzedRoute.hasAuth) {
    missing.push('authentication');
  }
  
  if (requirements.requireCsrf && !analyzedRoute.hasCsrf) {
    missing.push('csrf_protection');
  }
  
  if (requirements.requireRateLimit && !analyzedRoute.hasRateLimit) {
    missing.push('rate_limiting');
  }
  
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Verify security requirements for mutation endpoints
 * Returns list of endpoints failing verification
 */
export function verifyMutationEndpoints(
  auditResult: SecurityAuditResult
): { endpoint: string; issues: string[] }[] {
  const failures: { endpoint: string; issues: string[] }[] = [];
  
  for (const route of auditResult.unprotectedMutationRoutes) {
    const verification = verifyMiddleware(route, {
      requireAuth: true,
      requireCsrf: true,
    });
    
    if (!verification.valid) {
      failures.push({
        endpoint: `${route.method} ${route.path}`,
        issues: verification.missing,
      });
    }
  }
  
  return failures;
}

export default {
  runSecurityAudit,
  logSecurityAudit,
  verifyMiddleware,
  verifyMutationEndpoints,
  isPublicRoute,
  hasAuthMiddleware,
  hasCsrfMiddleware,
  hasRateLimitMiddleware,
};
