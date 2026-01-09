/**
 * ★ SafeErrorResponse - Never return 500 status codes
 * 
 * [2026-01-09] CRITICAL: All error responses use this utility
 * to ensure 500 errors are converted to 503 (service unavailable)
 */

import { Response } from 'express';

const RPC_ERROR_PATTERNS = [
  'ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ENETUNREACH',
  'EHOSTUNREACH', 'ECONNRESET', 'connect ECONNREFUSED',
  'socket hang up', 'network timeout', 'fetch failed', 'getaddrinfo'
];

function isRpcError(error: any): boolean {
  if (!error) return false;
  const message = (error.message || error.toString()).toLowerCase();
  const code = error.code || '';
  return RPC_ERROR_PATTERNS.some(p => message.includes(p.toLowerCase()) || code === p);
}

function getRequestId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Send a safe error response - NEVER returns 500
 * 
 * @example
 * catch (error) {
 *   return safeErrorResponse(res, error, 'Failed to fetch data');
 * }
 */
export function safeErrorResponse(
  res: Response,
  error: any,
  userMessage: string = 'An error occurred'
): Response {
  const requestId = getRequestId();
  const errorMessage = error?.message || 'Unknown error';
  
  if (isRpcError(error)) {
    console.log(`[SafeError:503] RPC: ${userMessage} - ${errorMessage} [${requestId}]`);
    return res.status(503).json({
      error: userMessage,
      message: 'Service temporarily unavailable. Please try again.',
      degraded: true,
      retryAfter: 30,
      requestId,
    });
  }
  
  if (error?.isRateLimited || error?.statusCode === 429) {
    const retryAfter = error?.retryAfter || 30;
    console.log(`[SafeError:429] Rate limit: ${userMessage} [${requestId}]`);
    return res.status(429).json({
      error: 'Too many requests',
      retryAfter,
      requestId,
    });
  }
  
  if (error?.statusCode === 400 || error?.status === 400) {
    return res.status(400).json({
      error: userMessage,
      message: errorMessage,
      requestId,
    });
  }
  
  if (error?.statusCode === 404 || error?.status === 404) {
    return res.status(404).json({
      error: 'Not found',
      message: userMessage,
      requestId,
    });
  }
  
  console.error(`[SafeError:503] App: ${userMessage} - ${errorMessage} [${requestId}]`);
  return res.status(503).json({
    error: userMessage,
    message: 'An unexpected condition occurred. Please try again.',
    degraded: true,
    retryAfter: 10,
    requestId,
  });
}

/**
 * Convert common 500 patterns to safe 503 responses
 * Use this in catch blocks instead of res.status(500)
 * 
 * @example
 * // Before:
 * res.status(500).json({ error: 'Failed to fetch' });
 * 
 * // After:
 * return safe503(res, 'Failed to fetch');
 */
export function safe503(res: Response, message: string, error?: any): Response {
  const requestId = getRequestId();
  
  if (error) {
    const errorMessage = error?.message || 'Unknown';
    console.log(`[Safe503] ${message} - ${errorMessage} [${requestId}]`);
  }
  
  return res.status(503).json({
    error: message,
    message: 'Service temporarily unavailable.',
    degraded: true,
    retryAfter: 10,
    requestId,
  });
}

export default {
  safeErrorResponse,
  safe503,
};
