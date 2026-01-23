/**
 * TBURN Frontend Dynamic Import Retry Utility v1.0
 * 
 * Handles "Failed to fetch dynamically imported module" errors
 * Common causes:
 * - Network instability during chunk loading
 * - Server overload rejecting requests
 * - Deployment cache invalidation
 * - Session cookie interference with static files
 */

import { lazy, Suspense, Component, ReactNode, LazyExoticComponent, ComponentType } from 'react';

const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY: 1000,
  MAX_DELAY: 10000,
  BACKOFF_MULTIPLIER: 2,
  JITTER: 0.1,
};

async function clearModuleCacheBeforeRetry(): Promise<void> {
  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      for (const name of cacheNames) {
        const cache = await caches.open(name);
        const requests = await cache.keys();
        for (const request of requests) {
          if (request.url.includes('/assets/') && request.url.endsWith('.js')) {
            await cache.delete(request);
          }
        }
      }
    }
  } catch (e) {
    console.warn('[DynamicImport] Cache clear failed:', e);
  }
}

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
      if (attempt > 0) {
        console.log(`[DynamicImport] Retry attempt ${attempt}/${maxRetries}`);
        await clearModuleCacheBeforeRetry();
      }
      
      return await importFn();
    } catch (error: any) {
      lastError = error;
      
      const isChunkError = 
        error.message?.includes('Failed to fetch dynamically imported module') ||
        error.message?.includes('Loading chunk') ||
        error.message?.includes('ChunkLoadError') ||
        error.name === 'ChunkLoadError';
      
      if (!isChunkError || attempt >= maxRetries) {
        throw error;
      }
      
      options?.onRetry?.(attempt + 1, error);
      
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

export function lazyWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): LazyExoticComponent<T> {
  return lazy(() => retryDynamicImport(importFn, {
    onRetry: (attempt, error) => {
      console.warn(`[LazyComponent] Retry ${attempt}: ${error.message}`);
    },
  }));
}

export function installChunkErrorHandler(): void {
  // Disabled automatic reload to prevent infinite refresh loops
  // The inline script in index.html handles cache clearing with proper loop prevention
  console.log('[ChunkErrorHandler] Chunk error handler disabled (handled by index.html)');
}

export function createLazyRoute(
  importFn: () => Promise<{ default: ComponentType<any> }>
): ReactNode {
  const LazyComponent = lazyWithRetry(importFn);
  
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </div>
    }>
      <LazyComponent />
    </Suspense>
  );
}

interface ChunkErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ChunkErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ChunkErrorBoundary extends Component<ChunkErrorBoundaryProps, ChunkErrorBoundaryState> {
  constructor(props: ChunkErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error): ChunkErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[ChunkErrorBoundary] Caught error:', error, errorInfo);
    // Removed auto-reload to prevent infinite refresh loops
    // User can manually refresh using the button
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
          <h2>페이지 로딩 실패</h2>
          <p>잠시 후 자동으로 새로고침됩니다...</p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '10px 20px', marginTop: '10px', cursor: 'pointer' }}
          >
            지금 새로고침
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

export default {
  retryDynamicImport,
  lazyWithRetry,
  installChunkErrorHandler,
  createLazyRoute,
  ChunkErrorBoundary,
};
