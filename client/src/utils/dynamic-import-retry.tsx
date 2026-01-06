/**
 * TBURN Frontend Dynamic Import Retry
 * 청크 로딩 실패 자동 재시도
 * 
 * @version 2.0.0
 * @date 2026-01-06
 */

import React, { 
  lazy, 
  Suspense, 
  Component, 
  ReactNode, 
  LazyExoticComponent,
  ComponentType 
} from 'react';

// ============================================================================
// 설정
// ============================================================================

const CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY: 1000,
  MAX_DELAY: 10000,
  BACKOFF_MULTIPLIER: 2,
  ERROR_RESET_INTERVAL: 60000,
  MAX_ERRORS_BEFORE_RELOAD: 5,
};

// ============================================================================
// 유틸리티
// ============================================================================

function isChunkLoadError(error: any): boolean {
  if (!error) return false;
  const message = String(error.message || '');
  const name = String(error.name || '');
  
  return (
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Loading chunk') ||
    message.includes('ChunkLoadError') ||
    message.includes('Loading CSS chunk') ||
    message.includes('Unable to preload CSS') ||
    message.includes('error loading dynamically imported module') ||
    name === 'ChunkLoadError'
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function clearCacheAndReload(): void {
  // Service Worker 제거
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(reg => reg.unregister());
    });
  }
  
  // 캐시 삭제
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
  
  // 캐시 버스트와 함께 리로드
  setTimeout(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('_reload', Date.now().toString());
    window.location.href = url.toString();
  }, 500);
}

// ============================================================================
// 1. 동적 임포트 재시도 함수
// ============================================================================

export async function retryDynamicImport<T>(
  importFn: () => Promise<T>,
  maxRetries: number = CONFIG.MAX_RETRIES
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`[DynamicImport] 재시도 ${attempt}/${maxRetries}`);
      }
      return await importFn();
    } catch (error: any) {
      lastError = error;
      
      if (!isChunkLoadError(error) || attempt >= maxRetries) {
        throw error;
      }
      
      const delay = Math.min(
        CONFIG.INITIAL_DELAY * Math.pow(CONFIG.BACKOFF_MULTIPLIER, attempt),
        CONFIG.MAX_DELAY
      );
      
      console.warn(`[DynamicImport] 청크 로드 실패, ${delay}ms 후 재시도...`);
      await sleep(delay);
    }
  }
  
  throw lastError;
}

// ============================================================================
// 2. React Lazy 재시도 래퍼
// ============================================================================

type ComponentImport<T extends ComponentType<any>> = () => Promise<{ default: T }>;

export function lazyWithRetry<T extends ComponentType<any>>(
  importFn: ComponentImport<T>
): LazyExoticComponent<T> {
  return lazy(() => retryDynamicImport(importFn));
}

// ============================================================================
// 3. 청크 에러 바운더리
// ============================================================================

interface ChunkErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ChunkErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

export class ChunkErrorBoundary extends Component<
  ChunkErrorBoundaryProps,
  ChunkErrorBoundaryState
> {
  private retryTimeoutId: ReturnType<typeof setTimeout> | null = null;
  
  constructor(props: ChunkErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }
  
  static getDerivedStateFromError(error: Error): Partial<ChunkErrorBoundaryState> {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error): void {
    console.error('[ChunkErrorBoundary] Error:', error);
    
    if (isChunkLoadError(error) && this.state.retryCount < CONFIG.MAX_RETRIES) {
      const delay = CONFIG.INITIAL_DELAY * Math.pow(2, this.state.retryCount);
      
      this.retryTimeoutId = setTimeout(() => {
        this.setState(prev => ({
          hasError: false,
          error: null,
          retryCount: prev.retryCount + 1,
        }));
      }, delay);
    }
  }
  
  componentWillUnmount(): void {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }
  
  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, retryCount: 0 });
  };
  
  handleReload = (): void => {
    window.location.reload();
  };
  
  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.icon}>⚠️</div>
            <h2 style={styles.title}>페이지 로딩 실패</h2>
            <p style={styles.message}>
              네트워크 문제로 페이지를 불러오지 못했습니다.
            </p>
            {this.state.retryCount < CONFIG.MAX_RETRIES && (
              <p style={styles.retryText}>
                자동 재시도 중... ({this.state.retryCount + 1}/{CONFIG.MAX_RETRIES})
              </p>
            )}
            <div style={styles.buttonContainer}>
              <button style={styles.button} onClick={this.handleRetry}>
                다시 시도
              </button>
              <button style={styles.buttonSecondary} onClick={this.handleReload}>
                페이지 새로고침
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// ============================================================================
// 4. 글로벌 에러 핸들러
// ============================================================================

export function installChunkErrorHandler(): void {
  if (typeof window === 'undefined') return;
  
  let errorCount = 0;
  
  // 에러 카운트 리셋
  setInterval(() => {
    errorCount = 0;
  }, CONFIG.ERROR_RESET_INTERVAL);
  
  // Unhandled Promise Rejection
  window.addEventListener('unhandledrejection', (event) => {
    if (isChunkLoadError(event.reason)) {
      errorCount++;
      console.error(`[ChunkHandler] 청크 에러 (${errorCount}/${CONFIG.MAX_ERRORS_BEFORE_RELOAD})`);
      
      if (errorCount >= CONFIG.MAX_ERRORS_BEFORE_RELOAD) {
        console.warn('[ChunkHandler] 에러 한도 초과, 페이지 새로고침...');
        clearCacheAndReload();
      }
    }
  });
  
  // Script Error
  window.addEventListener('error', (event) => {
    const target = event.target as HTMLElement;
    
    if (target instanceof HTMLScriptElement) {
      const src = target.src || '';
      
      if (src.includes('/assets/') && src.endsWith('.js')) {
        errorCount++;
        console.error(`[ChunkHandler] 스크립트 로드 실패: ${src}`);
        
        if (errorCount >= CONFIG.MAX_ERRORS_BEFORE_RELOAD) {
          clearCacheAndReload();
        }
      }
    }
  }, true);
  
  console.log('[ChunkHandler] 글로벌 청크 에러 핸들러 설치됨');
}

// ============================================================================
// 5. LazyRoute 컴포넌트
// ============================================================================

interface LazyRouteProps {
  importFn: ComponentImport<ComponentType<any>>;
  fallback?: ReactNode;
}

export function LazyRoute({ importFn, fallback }: LazyRouteProps): JSX.Element {
  const LazyComponent = lazyWithRetry(importFn);
  
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={fallback || <DefaultLoading />}>
        <LazyComponent />
      </Suspense>
    </ChunkErrorBoundary>
  );
}

// ============================================================================
// 6. 기본 로딩 컴포넌트
// ============================================================================

function DefaultLoading(): JSX.Element {
  return (
    <div style={styles.loadingContainer}>
      <div style={styles.spinner} />
      <p style={styles.loadingText}>로딩 중...</p>
    </div>
  );
}

// ============================================================================
// 스타일
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
    backgroundColor: '#0a0a0b',
  },
  card: {
    textAlign: 'center',
    padding: '40px',
    backgroundColor: '#1a1a1b',
    borderRadius: '12px',
    border: '1px solid #333',
    maxWidth: '400px',
  },
  icon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  title: {
    color: '#ffffff',
    fontSize: '20px',
    fontWeight: 600,
    margin: '0 0 12px 0',
  },
  message: {
    color: '#888',
    fontSize: '14px',
    margin: '0 0 8px 0',
  },
  retryText: {
    color: '#f59e0b',
    fontSize: '12px',
    margin: '0 0 20px 0',
  },
  buttonContainer: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    marginTop: '20px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#000',
    backgroundColor: '#f59e0b',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  buttonSecondary: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#fff',
    backgroundColor: 'transparent',
    border: '1px solid #444',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#0a0a0b',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #333',
    borderTop: '3px solid #f59e0b',
    borderRadius: '50%',
    animation: 'tburn-spin 1s linear infinite',
  },
  loadingText: {
    color: '#888',
    marginTop: '16px',
    fontSize: '14px',
  },
};

// CSS 애니메이션 주입
if (typeof document !== 'undefined') {
  const styleId = 'tburn-chunk-styles';
  if (!document.getElementById(styleId)) {
    const styleSheet = document.createElement('style');
    styleSheet.id = styleId;
    styleSheet.textContent = `
      @keyframes tburn-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(styleSheet);
  }
}

// ============================================================================
// Export
// ============================================================================

export default {
  retryDynamicImport,
  lazyWithRetry,
  ChunkErrorBoundary,
  LazyRoute,
  installChunkErrorHandler,
};
