/**
 * ★ Never500Handler - Enterprise-grade Error Boundary
 * 
 * [2026-01-09] CRITICAL: Absolute prevention of "Internal Server Error" (500)
 * 
 * Design principles:
 * 1. NEVER return 500 for RPC/network errors → 503 with retry
 * 2. NEVER return 500 for rate limits → 429 with retry-after
 * 3. NEVER return 500 for validation errors → 400 with details
 * 4. For genuine application errors → 503 with safe fallback (not 500)
 * 5. Auto-recovery: Return cached/static data during degraded mode
 */

import { Request, Response, NextFunction } from 'express';
import { getDataCache } from '../services/DataCacheService';

const RPC_ERROR_PATTERNS = [
  'ECONNREFUSED',
  'ETIMEDOUT', 
  'ENOTFOUND',
  'ENETUNREACH',
  'EHOSTUNREACH',
  'ECONNRESET',
  'connect ECONNREFUSED',
  'socket hang up',
  'network timeout',
  'Request timeout',
  'fetch failed',
  'getaddrinfo',
  'certificate',
  'CERT_',
  'UNABLE_TO_GET_ISSUER_CERT',
];

const RATE_LIMIT_PATTERNS = [
  'Rate Limited',
  'rate limit',
  '429',
  'Too Many Requests',
  'isRateLimited',
  'quota exceeded',
  'throttle',
];

const VALIDATION_PATTERNS = [
  'validation',
  'invalid',
  'required',
  'must be',
  'expected',
  'missing',
  'not found',
  'does not exist',
];

interface ErrorStats {
  totalErrors: number;
  rpcErrors: number;
  rateLimitErrors: number;
  validationErrors: number;
  appErrors: number;
  recoveredErrors: number;
  lastError: number;
  consecutiveErrors: number;
}

const errorStats: ErrorStats = {
  totalErrors: 0,
  rpcErrors: 0,
  rateLimitErrors: 0,
  validationErrors: 0,
  appErrors: 0,
  recoveredErrors: 0,
  lastError: 0,
  consecutiveErrors: 0,
};

let circuitBreakerOpen = false;
let circuitBreakerOpenedAt = 0;
const CIRCUIT_BREAKER_THRESHOLD = 10;
const CIRCUIT_BREAKER_RESET_MS = 30000;

function isRpcError(error: any): boolean {
  if (!error) return false;
  const message = (error.message || error.toString()).toLowerCase();
  const code = error.code || '';
  return RPC_ERROR_PATTERNS.some(pattern => 
    message.includes(pattern.toLowerCase()) || code === pattern
  );
}

function isRateLimitError(error: any): boolean {
  if (!error) return false;
  if (error.isRateLimited) return true;
  if (error.statusCode === 429 || error.status === 429) return true;
  const message = (error.message || error.toString()).toLowerCase();
  return RATE_LIMIT_PATTERNS.some(pattern => message.includes(pattern.toLowerCase()));
}

function isValidationError(error: any): boolean {
  if (!error) return false;
  if (error.statusCode === 400 || error.status === 400) return true;
  const message = (error.message || error.toString()).toLowerCase();
  return VALIDATION_PATTERNS.some(pattern => message.includes(pattern.toLowerCase()));
}

function checkCircuitBreaker(): boolean {
  if (!circuitBreakerOpen) return false;
  
  const now = Date.now();
  if (now - circuitBreakerOpenedAt > CIRCUIT_BREAKER_RESET_MS) {
    circuitBreakerOpen = false;
    console.log('[CircuitBreaker] Reset after recovery period');
    return false;
  }
  return true;
}

function updateErrorStats(errorType: 'rpc' | 'rateLimit' | 'validation' | 'app', recovered: boolean) {
  errorStats.totalErrors++;
  errorStats.lastError = Date.now();
  
  switch (errorType) {
    case 'rpc': errorStats.rpcErrors++; break;
    case 'rateLimit': errorStats.rateLimitErrors++; break;
    case 'validation': errorStats.validationErrors++; break;
    case 'app': errorStats.appErrors++; break;
  }
  
  if (recovered) {
    errorStats.recoveredErrors++;
    errorStats.consecutiveErrors = 0;
  } else {
    errorStats.consecutiveErrors++;
    
    if (errorStats.consecutiveErrors >= CIRCUIT_BREAKER_THRESHOLD) {
      circuitBreakerOpen = true;
      circuitBreakerOpenedAt = Date.now();
      console.error('[CircuitBreaker] OPENED due to consecutive errors');
    }
  }
}

function getRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export interface SafeRouteOptions {
  cacheKey?: string;
  cacheTtl?: number;
  fallbackData?: any;
  fallbackFn?: (req: Request) => any;
  logPrefix?: string;
  skipCircuitBreaker?: boolean;
}

export type AsyncRouteHandler = (req: Request, res: Response, next?: NextFunction) => Promise<any>;

/**
 * Wraps an async route handler to NEVER return 500 errors
 * 
 * @example
 * router.get('/api/data', wrapSafeRoute(async (req, res) => {
 *   const data = await riskyOperation();
 *   res.json(data);
 * }, { cacheKey: 'data', fallbackData: [] }));
 */
export function wrapSafeRoute(
  handler: AsyncRouteHandler,
  options: SafeRouteOptions = {}
): AsyncRouteHandler {
  const {
    cacheKey,
    cacheTtl = 60000,
    fallbackData,
    fallbackFn,
    logPrefix = '[SafeRoute]',
    skipCircuitBreaker = false,
  } = options;

  return async (req: Request, res: Response, next?: NextFunction) => {
    const requestId = getRequestId();
    const startTime = Date.now();
    
    if (!skipCircuitBreaker && checkCircuitBreaker()) {
      const cache = getDataCache();
      if (cacheKey && cache) {
        const cached = cache.get(cacheKey);
        if (cached) {
          console.log(`${logPrefix} Circuit breaker open - returning cached data`);
          return res.status(200).json({
            ...cached,
            _meta: { degraded: true, source: 'circuit-breaker', requestId }
          });
        }
      }
      
      if (fallbackData !== undefined) {
        console.log(`${logPrefix} Circuit breaker open - returning fallback`);
        return res.status(200).json({
          ...fallbackData,
          _meta: { degraded: true, source: 'circuit-breaker-fallback', requestId }
        });
      }
      
      if (fallbackFn) {
        try {
          const fallback = await fallbackFn(req);
          return res.status(200).json({
            ...fallback,
            _meta: { degraded: true, source: 'circuit-breaker-fn', requestId }
          });
        } catch (e) {
          // Continue to try handler
        }
      }
    }

    try {
      await handler(req, res, next);
      errorStats.consecutiveErrors = 0;
      
      const duration = Date.now() - startTime;
      if (duration > 5000) {
        console.warn(`${logPrefix} Slow request: ${req.method} ${req.path} took ${duration}ms`);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error';
      const cache = getDataCache();
      
      if (isRpcError(error)) {
        updateErrorStats('rpc', false);
        console.log(`${logPrefix} RPC error [${requestId}]: ${errorMessage}`);
        
        if (cacheKey && cache) {
          const cached = cache.get(cacheKey);
          if (cached) {
            updateErrorStats('rpc', true);
            console.log(`${logPrefix} Recovered with cached data`);
            return res.status(200).json({
              ...(typeof cached === 'object' ? cached : { data: cached }),
              _meta: { degraded: true, source: 'cache', requestId }
            });
          }
        }
        
        if (fallbackData !== undefined) {
          updateErrorStats('rpc', true);
          return res.status(200).json({
            ...(typeof fallbackData === 'object' ? fallbackData : { data: fallbackData }),
            _meta: { degraded: true, source: 'fallback', requestId }
          });
        }
        
        if (fallbackFn) {
          try {
            const fallback = await fallbackFn(req);
            updateErrorStats('rpc', true);
            return res.status(200).json({
              ...(typeof fallback === 'object' ? fallback : { data: fallback }),
              _meta: { degraded: true, source: 'fallback-fn', requestId }
            });
          } catch (e) {
            // Continue to 503
          }
        }
        
        return res.status(503).json({
          error: 'Service temporarily unavailable',
          message: 'Please try again in a few moments.',
          degraded: true,
          retryAfter: 30,
          requestId,
        });
      }
      
      if (isRateLimitError(error)) {
        updateErrorStats('rateLimit', false);
        const retryAfter = error.retryAfter || 30;
        console.log(`${logPrefix} Rate limited [${requestId}]: ${errorMessage}`);
        
        if (cacheKey && cache) {
          const cached = cache.get(cacheKey);
          if (cached) {
            updateErrorStats('rateLimit', true);
            return res.status(200).json({
              ...(typeof cached === 'object' ? cached : { data: cached }),
              _meta: { degraded: true, source: 'cache-rate-limited', requestId }
            });
          }
        }
        
        return res.status(429).json({
          error: 'Too many requests',
          message: 'Please slow down and try again.',
          retryAfter,
          requestId,
        });
      }
      
      if (isValidationError(error)) {
        updateErrorStats('validation', false);
        return res.status(400).json({
          error: 'Invalid request',
          message: errorMessage,
          requestId,
        });
      }
      
      updateErrorStats('app', false);
      console.error(`${logPrefix} Application error [${requestId}]: ${errorMessage}`);
      
      if (cacheKey && cache) {
        const cached = cache.get(cacheKey);
        if (cached) {
          updateErrorStats('app', true);
          console.log(`${logPrefix} Recovered app error with cache`);
          return res.status(200).json({
            ...(typeof cached === 'object' ? cached : { data: cached }),
            _meta: { degraded: true, source: 'error-recovery-cache', requestId }
          });
        }
      }
      
      if (fallbackData !== undefined) {
        updateErrorStats('app', true);
        return res.status(200).json({
          ...(typeof fallbackData === 'object' ? fallbackData : { data: fallbackData }),
          _meta: { degraded: true, source: 'error-recovery-fallback', requestId }
        });
      }
      
      return res.status(503).json({
        error: 'Service temporarily unavailable',
        message: 'An unexpected condition occurred. Please try again.',
        degraded: true,
        retryAfter: 10,
        requestId,
      });
    }
  };
}

/**
 * Global error handler that NEVER returns 500
 * Install as the last middleware in Express
 */
export function never500ErrorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  if (res.headersSent) {
    return;
  }

  const requestId = getRequestId();
  const errorMessage = err.message || 'Unknown error';
  
  if (isRpcError(err)) {
    updateErrorStats('rpc', false);
    console.log(`[GlobalError:503] RPC: ${req.method} ${req.path} - ${errorMessage} [${requestId}]`);
    return res.status(503).json({
      error: 'Service temporarily unavailable',
      message: 'Please try again shortly.',
      degraded: true,
      retryAfter: 30,
      requestId,
    });
  }
  
  if (isRateLimitError(err)) {
    updateErrorStats('rateLimit', false);
    const retryAfter = err.retryAfter || 30;
    console.log(`[GlobalError:429] Rate limit: ${req.method} ${req.path} [${requestId}]`);
    return res.status(429).json({
      error: 'Too many requests',
      retryAfter,
      requestId,
    });
  }
  
  if (isValidationError(err)) {
    updateErrorStats('validation', false);
    return res.status(400).json({
      error: 'Invalid request',
      message: errorMessage,
      requestId,
    });
  }
  
  updateErrorStats('app', false);
  console.error(`[GlobalError:503] ${req.method} ${req.path} - ${errorMessage} [${requestId}]`);
  
  return res.status(503).json({
    error: 'Service temporarily unavailable',
    message: 'An unexpected condition occurred. Please try again.',
    degraded: true,
    retryAfter: 10,
    requestId,
  });
}

/**
 * Health check data for monitoring
 */
export function getErrorHealthStats() {
  return {
    ...errorStats,
    circuitBreakerOpen,
    circuitBreakerOpenedAt: circuitBreakerOpen ? circuitBreakerOpenedAt : null,
    recoveryRate: errorStats.totalErrors > 0 
      ? ((errorStats.recoveredErrors / errorStats.totalErrors) * 100).toFixed(1) + '%'
      : '100%',
  };
}

/**
 * Reset error stats (for testing)
 */
export function resetErrorStats() {
  errorStats.totalErrors = 0;
  errorStats.rpcErrors = 0;
  errorStats.rateLimitErrors = 0;
  errorStats.validationErrors = 0;
  errorStats.appErrors = 0;
  errorStats.recoveredErrors = 0;
  errorStats.lastError = 0;
  errorStats.consecutiveErrors = 0;
  circuitBreakerOpen = false;
}

/**
 * Express async handler wrapper that catches all errors
 * This is the simplest form - just catches and passes to error middleware
 */
export function asyncHandler(fn: AsyncRouteHandler): AsyncRouteHandler {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error: any) {
      if (next) {
        next(error);
      } else {
        never500ErrorHandler(error, req, res, () => {});
      }
    }
  };
}

export default {
  wrapSafeRoute,
  never500ErrorHandler,
  asyncHandler,
  getErrorHealthStats,
  resetErrorStats,
  isRpcError,
  isRateLimitError,
  isValidationError,
};
