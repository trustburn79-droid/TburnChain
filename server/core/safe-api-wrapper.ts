/**
 * ★ SafeApiWrapper - Enterprise-grade API error handling
 * 
 * [2026-01-09] CRITICAL FIX for recurring "Internal Server Error" (500)
 * 
 * Root cause: ECONNREFUSED errors to local RPC (127.0.0.1:8545) were 
 * propagating through routes, causing 10+ 500 errors from a single 
 * underlying RPC connectivity failure.
 * 
 * Solution: This wrapper catches RPC failures and returns cached/static
 * data with a degraded-mode flag instead of throwing 500 errors.
 */

import { Response } from 'express';
import { getDataCache } from '../services/DataCacheService';

export interface SafeCallOptions {
  cacheKey?: string;
  cacheTtl?: number;
  fallbackData?: any;
  logPrefix?: string;
  returnPartial?: boolean;
}

export interface SafeCallResult<T> {
  success: boolean;
  data: T | null;
  degraded: boolean;
  error?: string;
  source: 'live' | 'cache' | 'fallback' | 'static';
}

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
];

const RATE_LIMIT_PATTERNS = [
  'Rate Limited',
  '429',
  'Too Many Requests',
  'isRateLimited',
];

let rpcHealthState = {
  isHealthy: true,
  lastFailure: 0,
  consecutiveFailures: 0,
  lastSuccessfulResponse: 0,
  failureCount: 0,
  recoveryAttempts: 0,
};

export function getRpcHealthState() {
  return { ...rpcHealthState };
}

export function isRpcError(error: any): boolean {
  if (!error) return false;
  const message = error.message || error.toString();
  return RPC_ERROR_PATTERNS.some(pattern => message.includes(pattern));
}

export function isRateLimitError(error: any): boolean {
  if (!error) return false;
  if (error.isRateLimited) return true;
  if (error.statusCode === 429) return true;
  const message = error.message || error.toString();
  return RATE_LIMIT_PATTERNS.some(pattern => message.includes(pattern));
}

function updateRpcHealth(success: boolean) {
  const now = Date.now();
  if (success) {
    rpcHealthState.isHealthy = true;
    rpcHealthState.consecutiveFailures = 0;
    rpcHealthState.lastSuccessfulResponse = now;
    rpcHealthState.recoveryAttempts = 0;
  } else {
    rpcHealthState.lastFailure = now;
    rpcHealthState.consecutiveFailures++;
    rpcHealthState.failureCount++;
    
    if (rpcHealthState.consecutiveFailures >= 3) {
      rpcHealthState.isHealthy = false;
    }
  }
}

/**
 * Safely execute an async function with automatic fallback to cache/static data
 * 
 * @example
 * const result = await safeCall(
 *   async () => tburnClient.getNetworkStats(),
 *   { cacheKey: 'network_stats', fallbackData: defaultNetworkStats }
 * );
 * 
 * if (result.success) {
 *   return res.json(result.data);
 * } else {
 *   return res.status(503).json({ error: result.error, degraded: true });
 * }
 */
export async function safeCall<T>(
  fn: () => Promise<T>,
  options: SafeCallOptions = {}
): Promise<SafeCallResult<T>> {
  const {
    cacheKey,
    cacheTtl = 60000,
    fallbackData,
    logPrefix = '[SafeCall]',
  } = options;

  const cache = getDataCache();

  try {
    const data = await fn();
    updateRpcHealth(true);
    
    if (cacheKey && cache && data) {
      cache.set(cacheKey, data, cacheTtl);
    }
    
    return {
      success: true,
      data,
      degraded: false,
      source: 'live',
    };
  } catch (error: any) {
    const errorMessage = error.message || 'Unknown error';
    
    if (isRpcError(error)) {
      updateRpcHealth(false);
      console.log(`${logPrefix} RPC error (using fallback): ${errorMessage}`);
    } else if (isRateLimitError(error)) {
      console.log(`${logPrefix} Rate limited (using cache): ${errorMessage}`);
    } else {
      console.error(`${logPrefix} Unexpected error:`, errorMessage);
    }

    if (cacheKey && cache) {
      const cached = cache.get(cacheKey);
      if (cached) {
        console.log(`${logPrefix} Returning cached data for ${cacheKey}`);
        return {
          success: true,
          data: cached as T,
          degraded: true,
          source: 'cache',
        };
      }
    }

    if (fallbackData !== undefined) {
      console.log(`${logPrefix} Returning fallback data`);
      return {
        success: true,
        data: fallbackData as T,
        degraded: true,
        source: 'fallback',
      };
    }

    return {
      success: false,
      data: null,
      degraded: true,
      error: isRpcError(error) 
        ? 'Service temporarily unavailable. Please try again later.'
        : errorMessage,
      source: 'static',
    };
  }
}

/**
 * Express middleware helper - wraps async route handlers with safe error handling
 * Automatically returns 503 for RPC errors instead of 500
 */
export function safeRouteHandler(
  handler: (req: any, res: Response, next?: any) => Promise<any>,
  options: SafeCallOptions = {}
) {
  return async (req: any, res: Response, next: any) => {
    try {
      await handler(req, res, next);
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error';
      const logPrefix = options.logPrefix || '[Route]';
      
      if (isRpcError(error)) {
        updateRpcHealth(false);
        console.log(`${logPrefix} RPC connectivity error (503): ${errorMessage}`);
        return res.status(503).json({
          error: 'Service temporarily unavailable',
          degraded: true,
          retryAfter: 30,
        });
      }
      
      if (isRateLimitError(error)) {
        const retryAfter = error.retryAfter || 30;
        console.log(`${logPrefix} Rate limited (429), retry after ${retryAfter}s`);
        return res.status(429).json({
          error: 'Too many requests. Please try again later.',
          retryAfter,
        });
      }

      console.error(`${logPrefix} Unhandled error:`, errorMessage);
      return res.status(500).json({
        error: 'An unexpected error occurred',
        requestId: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      });
    }
  };
}

/**
 * Utility to send a safe JSON response with degraded mode indication
 */
export function sendSafeResponse<T>(
  res: Response,
  result: SafeCallResult<T>,
  options: { successStatus?: number; errorStatus?: number } = {}
) {
  const { successStatus = 200, errorStatus = 503 } = options;
  
  if (result.success && result.data !== null) {
    const response: any = result.data;
    if (result.degraded) {
      if (typeof response === 'object' && !Array.isArray(response)) {
        response._meta = {
          degraded: true,
          source: result.source,
          timestamp: Date.now(),
        };
      }
    }
    return res.status(successStatus).json(response);
  }
  
  return res.status(errorStatus).json({
    error: result.error || 'Service temporarily unavailable',
    degraded: true,
    retryAfter: 30,
  });
}

/**
 * Health check endpoint data
 */
export function getApiHealthStatus() {
  const now = Date.now();
  const timeSinceLastFailure = rpcHealthState.lastFailure 
    ? now - rpcHealthState.lastFailure 
    : null;
  const timeSinceLastSuccess = rpcHealthState.lastSuccessfulResponse 
    ? now - rpcHealthState.lastSuccessfulResponse 
    : null;
    
  return {
    rpcHealthy: rpcHealthState.isHealthy,
    consecutiveFailures: rpcHealthState.consecutiveFailures,
    totalFailures: rpcHealthState.failureCount,
    lastFailureMs: timeSinceLastFailure,
    lastSuccessMs: timeSinceLastSuccess,
    status: rpcHealthState.isHealthy ? 'healthy' : 'degraded',
  };
}

export default {
  safeCall,
  safeRouteHandler,
  sendSafeResponse,
  isRpcError,
  isRateLimitError,
  getRpcHealthState,
  getApiHealthStatus,
};
