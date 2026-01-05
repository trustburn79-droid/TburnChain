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
  let chunkErrorCount = 0;
  const MAX_ERRORS_BEFORE_RELOAD = 3;
  const ERROR_RESET_TIMEOUT = 60000;
  
  setInterval(() => {
    chunkErrorCount = 0;
  }, ERROR_RESET_TIMEOUT);
  
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
        
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then(registrations => {
            registrations.forEach(reg => reg.unregister());
          });
        }
        
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
          });
        }
        
        setTimeout(() => {
          window.location.href = window.location.href.split('?')[0] + 
            '?_reload=' + Date.now();
        }, 1000);
      }
    }
  });
  
  window.addEventListener('error', (event) => {
    if (event.target instanceof HTMLScriptElement) {
      const src = (event.target as HTMLScriptElement).src || '';
      
      if (src.includes('/assets/') && src.endsWith('.js')) {
        chunkErrorCount++;
        console.error(`[ChunkErrorHandler] Script load error: ${src}`);
        
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
    
    const isChunkError = 
      error.message?.includes('Failed to fetch dynamically imported module') ||
      error.message?.includes('Loading chunk') ||
      error.message?.includes('ChunkLoadError');
    
    if (isChunkError) {
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
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
