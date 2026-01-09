/**
 * Enterprise Async Handler Utility
 * ================================
 * 
 * Wraps async Express route handlers to ensure all promise rejections
 * are properly caught and forwarded to the Express error handler.
 * 
 * This prevents unhandled promise rejections from causing "Internal Server Error"
 * responses without proper logging or recovery.
 */

import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps an async Express handler to catch errors and pass them to next()
 * This ensures that thrown errors are caught by Express's error handling middleware
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      // Log the error for debugging
      console.error(`[AsyncHandler] Error in ${req.method} ${req.path}:`, error.message);
      
      // Forward to Express error handler
      next(error);
    });
  };
}

/**
 * Wraps an async handler with timeout protection
 * Prevents requests from hanging indefinitely
 */
export function asyncHandlerWithTimeout(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
  timeoutMs: number = 30000
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const timeoutHandle = setTimeout(() => {
      if (!res.headersSent) {
        console.error(`[AsyncHandler] Timeout after ${timeoutMs}ms for ${req.method} ${req.path}`);
        res.status(504).json({
          error: 'Gateway Timeout',
          message: 'Request processing took too long',
          path: req.path
        });
      }
    }, timeoutMs);

    Promise.resolve(fn(req, res, next))
      .then(() => clearTimeout(timeoutHandle))
      .catch((error) => {
        clearTimeout(timeoutHandle);
        console.error(`[AsyncHandler] Error in ${req.method} ${req.path}:`, error.message);
        next(error);
      });
  };
}

/**
 * Safe JSON response wrapper that handles serialization errors
 */
export function safeJsonResponse(res: Response, data: any, status: number = 200): void {
  try {
    if (res.headersSent) {
      console.warn('[SafeJson] Response already sent, skipping');
      return;
    }
    
    // Try to serialize to catch any BigInt or circular reference issues
    const jsonString = JSON.stringify(data);
    res.status(status).type('application/json').send(jsonString);
  } catch (serializationError: any) {
    console.error('[SafeJson] Serialization error:', serializationError.message);
    res.status(500).json({
      error: 'Response Serialization Error',
      message: 'Failed to serialize response data'
    });
  }
}

/**
 * Error recovery helper - attempts to return a fallback response on error
 */
export function withFallback<T>(
  fn: () => Promise<T>,
  fallback: T,
  errorMessage: string = 'Using fallback data'
): Promise<T> {
  return fn().catch((error) => {
    console.warn(`[Fallback] ${errorMessage}:`, error.message);
    return fallback;
  });
}

/**
 * Retry wrapper for transient errors
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 100
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.code === 'ECONNREFUSED' || error.status === 401 || error.status === 403) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

export default asyncHandler;
