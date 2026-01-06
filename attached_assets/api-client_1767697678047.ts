/**
 * TBURN API Client with Auto-Retry
 * 
 * 10분 유휴 후 첫 요청 500 에러 자동 복구
 * - 500 에러 시 자동 재시도 (최대 3회)
 * - 지수 백오프 딜레이
 * - 세션 만료 시 쿠키 삭제 및 리다이렉트
 * 
 * @version 1.0.0
 */

// ============================================================================
// 설정
// ============================================================================

const CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY: 500,
  MAX_DELAY: 5000,
  BACKOFF_MULTIPLIER: 2,
  RETRY_STATUS_CODES: [500, 502, 503, 504],
};

// ============================================================================
// 유틸리티
// ============================================================================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function deleteCookie(name: string): void {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

// ============================================================================
// API Client
// ============================================================================

interface FetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number, error: Error | Response) => void;
}

interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
  status: number;
  retried: boolean;
  retryCount: number;
}

/**
 * Fetch with automatic retry on 5xx errors
 */
export async function fetchWithRetry<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const {
    retries = CONFIG.MAX_RETRIES,
    retryDelay = CONFIG.INITIAL_DELAY,
    onRetry,
    ...fetchOptions
  } = options;
  
  let lastError: Error | null = null;
  let lastResponse: Response | null = null;
  let retryCount = 0;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        credentials: 'include',  // 쿠키 포함
      });
      
      // 성공 또는 재시도 불필요한 에러
      if (response.ok || !CONFIG.RETRY_STATUS_CODES.includes(response.status)) {
        
        // 세션 만료 응답 처리
        if (response.status === 401) {
          const data = await response.json().catch(() => ({}));
          
          if (data.code === 'SESSION_EXPIRED' || data.code === 'NO_SESSION') {
            console.warn('[API] Session expired, clearing cookie');
            deleteCookie('connect.sid');
            
            // 로그인 페이지로 리다이렉트 (선택적)
            // window.location.href = '/login';
          }
          
          return {
            data: null,
            error: data.error || 'Unauthorized',
            status: response.status,
            retried: retryCount > 0,
            retryCount,
          };
        }
        
        // 정상 응답
        if (response.ok) {
          const data = await response.json().catch(() => null);
          return {
            data,
            error: null,
            status: response.status,
            retried: retryCount > 0,
            retryCount,
          };
        }
        
        // 4xx 에러 (재시도 안함)
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
        return {
          data: null,
          error: errorData.error || `HTTP ${response.status}`,
          status: response.status,
          retried: retryCount > 0,
          retryCount,
        };
      }
      
      // 5xx 에러 - 재시도 대상
      lastResponse = response;
      
      if (attempt < retries) {
        retryCount++;
        
        // 콜백 호출
        onRetry?.(attempt + 1, response);
        
        // 지수 백오프 딜레이
        const delay = Math.min(
          retryDelay * Math.pow(CONFIG.BACKOFF_MULTIPLIER, attempt),
          CONFIG.MAX_DELAY
        );
        
        console.warn(`[API] ${response.status} error, retry ${attempt + 1}/${retries} in ${delay}ms`);
        
        await sleep(delay);
      }
      
    } catch (error: any) {
      lastError = error;
      
      if (attempt < retries) {
        retryCount++;
        onRetry?.(attempt + 1, error);
        
        const delay = Math.min(
          retryDelay * Math.pow(CONFIG.BACKOFF_MULTIPLIER, attempt),
          CONFIG.MAX_DELAY
        );
        
        console.warn(`[API] Network error, retry ${attempt + 1}/${retries} in ${delay}ms:`, error.message);
        
        await sleep(delay);
      }
    }
  }
  
  // 모든 재시도 실패
  console.error('[API] All retries failed');
  
  // 5xx 에러로 실패한 경우 세션 문제일 수 있음
  if (lastResponse && lastResponse.status >= 500) {
    // retry 응답 확인
    try {
      const errorData = await lastResponse.json();
      if (errorData.retry) {
        console.log('[API] Server suggests retry, clearing session cookie');
        deleteCookie('connect.sid');
      }
    } catch (e) {}
  }
  
  return {
    data: null,
    error: lastError?.message || `HTTP ${lastResponse?.status || 'unknown'}`,
    status: lastResponse?.status || 0,
    retried: true,
    retryCount,
  };
}

// ============================================================================
// Convenience Methods
// ============================================================================

export const api = {
  async get<T = any>(url: string, options?: FetchOptions): Promise<ApiResponse<T>> {
    return fetchWithRetry<T>(url, { ...options, method: 'GET' });
  },
  
  async post<T = any>(url: string, body?: any, options?: FetchOptions): Promise<ApiResponse<T>> {
    return fetchWithRetry<T>(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  
  async put<T = any>(url: string, body?: any, options?: FetchOptions): Promise<ApiResponse<T>> {
    return fetchWithRetry<T>(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  
  async delete<T = any>(url: string, options?: FetchOptions): Promise<ApiResponse<T>> {
    return fetchWithRetry<T>(url, { ...options, method: 'DELETE' });
  },
};

// ============================================================================
// React Query / SWR 통합용 Fetcher
// ============================================================================

/**
 * React Query용 fetcher
 * 
 * @example
 * const { data } = useQuery(['blocks'], () => queryFetcher('/api/blocks/latest'));
 */
export async function queryFetcher<T = any>(url: string): Promise<T> {
  const result = await fetchWithRetry<T>(url);
  
  if (result.error) {
    throw new Error(result.error);
  }
  
  return result.data as T;
}

/**
 * SWR용 fetcher
 * 
 * @example
 * const { data } = useSWR('/api/blocks/latest', swrFetcher);
 */
export async function swrFetcher<T = any>(url: string): Promise<T> {
  return queryFetcher<T>(url);
}

// ============================================================================
// 페이지 로드 시 서버 웜업
// ============================================================================

/**
 * 앱 시작 시 서버 웜업 요청
 * Cold start 방지
 */
export async function warmupServer(): Promise<boolean> {
  try {
    const response = await fetch('/api/warmup', {
      method: 'GET',
      credentials: 'include',
    });
    
    const data = await response.json();
    
    if (data.status === 'warm') {
      console.log('[WARMUP] Server is warm');
      return true;
    } else {
      console.log('[WARMUP] Server was cold, now warming up');
      return false;
    }
  } catch (error) {
    console.warn('[WARMUP] Failed:', error);
    return false;
  }
}

// ============================================================================
// Visibility Change Handler
// ============================================================================

/**
 * 탭 활성화 시 서버 웜업
 * 사용자가 다른 탭에 있다가 돌아올 때 cold start 방지
 */
export function installVisibilityWarmup(): () => void {
  let lastVisibleTime = Date.now();
  const IDLE_THRESHOLD = 5 * 60 * 1000; // 5분
  
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      const idleTime = Date.now() - lastVisibleTime;
      
      if (idleTime > IDLE_THRESHOLD) {
        console.log(`[WARMUP] Tab active after ${Math.floor(idleTime / 1000)}s idle`);
        warmupServer();
      }
    } else {
      lastVisibleTime = Date.now();
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // 초기 웜업
  warmupServer();
  
  // Cleanup 함수 반환
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}

// ============================================================================
// Export
// ============================================================================

export default {
  fetchWithRetry,
  api,
  queryFetcher,
  swrFetcher,
  warmupServer,
  installVisibilityWarmup,
};
