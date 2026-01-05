/**
 * TBURN Frontend Dynamic Import Retry Utility
 * 
 * Handles "Failed to fetch dynamically imported module" errors
 * Common causes:
 * - Network instability during chunk loading
 * - Server overload rejecting requests
 * - Deployment cache invalidation
 * - Session cookie interference with static files
 * 
 * @version 1.0.0
 * @date 2026-01-06
 */

// ============================================================================
// Configuration
// ============================================================================

const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY: 1000,  // 1 second
  MAX_DELAY: 10000,     // 10 seconds
  BACKOFF_MULTIPLIER: 2,
  JITTER: 0.1,          // 10% jitter
};

// ============================================================================
// Dynamic Import with Retry
// ============================================================================

/**
 * Wrapper for dynamic imports with automatic retry on failure
 * 
 * @example
 * // Instead of:
 * const Module = lazy(() => import('./MyComponent'));
 * 
 * // Use:
 * const Module = lazy(() => retryDynamicImport(() => import('./MyComponent')));
 */
export async function retryDynamicImport<T>(
  importFn: () => Promise<T>,
  options?: {
    maxRetries?: number;
    onRetry?: (attempt: number, error: Error) => void;
  }
): Promise<T> {
  const maxRetries = options?.maxRetries ?? RETRY_CONFIG.MAX_RETRIES;
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Clear module cache on retry to force fresh fetch
      if (attempt > 0) {
        // Add cache-busting query param for retry attempts
        const bustCache = `?retry=${attempt}&t=${Date.now()}`;
        console.log(`[DynamicImport] Retry attempt ${attempt}/${maxRetries}`);
      }
      
      return await importFn();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a chunk loading error
      const isChunkError = 
        error.message?.includes('Failed to fetch dynamically imported module') ||
        error.message?.includes('Loading chunk') ||
        error.message?.includes('ChunkLoadError') ||
        error.name === 'ChunkLoadError';
      
      if (!isChunkError || attempt >= maxRetries) {
        throw error;
      }
      
      // Call retry callback
      options?.onRetry?.(attempt + 1, error);
      
      // Calculate delay with exponential backoff and jitter
      const baseDelay = Math.min(
        RETRY_CONFIG.INITIAL_DELAY * Math.pow(RETRY_CONFIG.BACKOFF_MULTIPLIER, attempt),
        RETRY_CONFIG.MAX_DELAY
      );
      const jitter = baseDelay * RETRY_CONFIG.JITTER * (Math.random() - 0.5) * 2;
      const delay = baseDelay + jitter;
      
      console.warn(`[DynamicImport] Chunk load failed, retrying in ${Math.round(delay)}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

// ============================================================================
// Lazy Component with Retry (React)
// ============================================================================

/**
 * React lazy with built-in retry
 * 
 * @example
 * const ScanRoutes = lazyWithRetry(() => import('./ScanRoutes'));
 */
export function lazyWithRetry<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  // Dynamic import React if using in Node environment
  const React = require('react');
  
  return React.lazy(() => retryDynamicImport(importFn, {
    onRetry: (attempt, error) => {
      console.warn(`[LazyComponent] Retry ${attempt}: ${error.message}`);
    },
  }));
}

// ============================================================================
// Global Error Handler for Chunk Errors
// ============================================================================

/**
 * Install global handler for chunk loading errors
 * Automatically refreshes page on persistent chunk errors
 */
export function installChunkErrorHandler(): void {
  // Track chunk errors
  let chunkErrorCount = 0;
  const MAX_ERRORS_BEFORE_RELOAD = 3;
  const ERROR_RESET_TIMEOUT = 60000; // 1 minute
  
  // Reset error count periodically
  setInterval(() => {
    chunkErrorCount = 0;
  }, ERROR_RESET_TIMEOUT);
  
  // Handle unhandled promise rejections (chunk errors often surface here)
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    
    const isChunkError = 
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.message?.includes('Loading chunk') ||
      error?.message?.includes('ChunkLoadError') ||
      error?.name === 'ChunkLoadError';
    
    if (isChunkError) {
      chunkErrorCount++;
      console.error(`[ChunkErrorHandler] Chunk error ${chunkErrorCount}/${MAX_ERRORS_BEFORE_RELOAD}`);
      
      if (chunkErrorCount >= MAX_ERRORS_BEFORE_RELOAD) {
        console.warn('[ChunkErrorHandler] Too many chunk errors, reloading page...');
        
        // Clear service worker cache if present
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then(registrations => {
            registrations.forEach(reg => reg.unregister());
          });
        }
        
        // Clear browser cache for this page
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
          });
        }
        
        // Reload with cache bust
        setTimeout(() => {
          window.location.href = window.location.href.split('?')[0] + 
            '?_reload=' + Date.now();
        }, 1000);
      }
    }
  });
  
  // Handle script errors (fallback for some browsers)
  window.addEventListener('error', (event) => {
    if (event.target instanceof HTMLScriptElement) {
      const src = event.target.src || '';
      
      if (src.includes('/assets/') && src.endsWith('.js')) {
        chunkErrorCount++;
        console.error(`[ChunkErrorHandler] Script load error: ${src}`);
        
        // Try to reload the script
        if (chunkErrorCount < MAX_ERRORS_BEFORE_RELOAD) {
          const newScript = document.createElement('script');
          newScript.src = src + (src.includes('?') ? '&' : '?') + '_retry=' + Date.now();
          newScript.async = true;
          document.head.appendChild(newScript);
        }
      }
    }
  }, true);
  
  console.log('[ChunkErrorHandler] Installed global chunk error handler');
}

// ============================================================================
// Vite Plugin for Retry (vite.config.ts)
// ============================================================================

/**
 * Vite configuration to add retry wrapper to dynamic imports
 * 
 * Add to vite.config.ts:
 * 
 * ```typescript
 * import { defineConfig } from 'vite';
 * 
 * export default defineConfig({
 *   build: {
 *     rollupOptions: {
 *       output: {
 *         // Add manual chunks for better caching
 *         manualChunks: {
 *           'react-vendor': ['react', 'react-dom', 'react-router-dom'],
 *           'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
 *         },
 *       },
 *     },
 *   },
 *   // Improve chunk loading
 *   optimizeDeps: {
 *     include: ['react', 'react-dom'],
 *   },
 * });
 * ```
 */

// ============================================================================
// React Router Lazy Route Helper
// ============================================================================

/**
 * Create a lazy route component with retry support
 * 
 * @example
 * // routes.tsx
 * import { createLazyRoute } from './dynamic-import-retry';
 * 
 * export const routes = [
 *   {
 *     path: '/scan',
 *     element: createLazyRoute(() => import('./pages/ScanRoutes')),
 *   },
 * ];
 */
export function createLazyRoute(
  importFn: () => Promise<{ default: React.ComponentType<any> }>
): React.ReactNode {
  const React = require('react');
  const LazyComponent = lazyWithRetry(importFn);
  
  return React.createElement(
    React.Suspense,
    { 
      fallback: React.createElement('div', { 
        style: { 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        } 
      }, 'Loading...')
    },
    React.createElement(LazyComponent)
  );
}

// ============================================================================
// Error Boundary for Chunk Errors (React)
// ============================================================================

/**
 * Error boundary that handles chunk loading errors
 * 
 * @example
 * <ChunkErrorBoundary>
 *   <Suspense fallback={<Loading />}>
 *     <LazyComponent />
 *   </Suspense>
 * </ChunkErrorBoundary>
 */
export class ChunkErrorBoundary extends require('react').Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ChunkErrorBoundary] Caught error:', error, errorInfo);
    
    // Check if it's a chunk error
    const isChunkError = 
      error.message?.includes('Failed to fetch dynamically imported module') ||
      error.message?.includes('Loading chunk') ||
      error.message?.includes('ChunkLoadError');
    
    if (isChunkError) {
      // Auto-retry by reloading the page after a delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }
  
  render() {
    if (this.state.hasError) {
      const React = require('react');
      
      return this.props.fallback || React.createElement(
        'div',
        { 
          style: { 
            padding: '20px', 
            textAlign: 'center',
            fontFamily: 'system-ui, sans-serif',
          } 
        },
        React.createElement('h2', null, '페이지 로딩 실패'),
        React.createElement('p', null, '잠시 후 자동으로 새로고침됩니다...'),
        React.createElement(
          'button',
          { 
            onClick: () => window.location.reload(),
            style: {
              padding: '10px 20px',
              marginTop: '10px',
              cursor: 'pointer',
            }
          },
          '지금 새로고침'
        )
      );
    }
    
    return this.props.children;
  }
}

// ============================================================================
// Usage Example
// ============================================================================

/*
// main.tsx or App.tsx

import { installChunkErrorHandler, lazyWithRetry, ChunkErrorBoundary } from './dynamic-import-retry';

// Install global handler on app start
installChunkErrorHandler();

// Lazy load routes with retry
const ScanRoutes = lazyWithRetry(() => import('./pages/ScanRoutes'));
const Dashboard = lazyWithRetry(() => import('./pages/Dashboard'));

function App() {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/scan/*" element={<ScanRoutes />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </ChunkErrorBoundary>
  );
}
*/

export default {
  retryDynamicImport,
  lazyWithRetry,
  installChunkErrorHandler,
  createLazyRoute,
  ChunkErrorBoundary,
};
