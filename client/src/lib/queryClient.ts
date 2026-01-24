import { QueryClient, QueryFunction } from "@tanstack/react-query";

// ★ [v7.0] Track consecutive server errors for auto-recovery
let consecutiveServerErrors = 0;
const MAX_CONSECUTIVE_ERRORS_BEFORE_REFRESH = 5;

class ServiceInitializingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServiceInitializingError';
  }
}

class ServerError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ServerError';
    this.status = status;
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    if (res.status === 503) {
      throw new ServiceInitializingError('Backend services are starting up. Retrying...');
    }
    if (res.status >= 500 && res.status < 600) {
      throw new ServerError(`Server error: ${res.status}`, res.status);
    }
    const text = (await res.text()) || res.statusText;
    let errorMessage = text;
    try {
      const jsonError = JSON.parse(text);
      if (jsonError.error) {
        errorMessage = jsonError.error;
      } else if (jsonError.message) {
        errorMessage = jsonError.message;
      }
    } catch {
    }
    throw new Error(errorMessage);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    let url: string;
    if (queryKey.length === 1) {
      url = queryKey[0] as string;
    } else if (queryKey.length === 2 && typeof queryKey[1] === "string" && queryKey[1].includes("=")) {
      url = `${queryKey[0]}?${queryKey[1]}`;
    } else {
      url = queryKey.join("/");
    }
    
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    
    // ★ [v7.0] Reset error counter on successful response
    consecutiveServerErrors = 0;
    
    return await res.json();
  };

// Retry function that handles 5xx errors with exponential backoff
// ★ [v7.0] Enhanced cold start recovery with auto-refresh
const retryFn = (failureCount: number, error: Error) => {
  // Always retry 503 errors (service initializing) up to 12 times (~60 seconds)
  if (error instanceof ServiceInitializingError) {
    consecutiveServerErrors++;
    return failureCount < 12;
  }
  // ★ [v7.0] 500 에러 재시도 (cold start 복구) - 5번까지 확장
  if (error instanceof ServerError) {
    consecutiveServerErrors++;
    console.warn(`[QueryClient] Server error ${error.status}, retry ${failureCount + 1}/5, consecutive: ${consecutiveServerErrors}`);
    
    // After too many consecutive errors, trigger page refresh
    if (consecutiveServerErrors >= MAX_CONSECUTIVE_ERRORS_BEFORE_REFRESH) {
      console.warn('[QueryClient] Too many server errors, triggering page refresh in 2s...');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      return false; // Stop retrying, refresh will handle it
    }
    
    return failureCount < 5; // Increased from 3 to 5
  }
  // For other errors, retry twice (same as original behavior)
  return failureCount < 2;
};

// Reset consecutive error counter on successful query
export function resetConsecutiveErrors() {
  consecutiveServerErrors = 0;
}

// Retry delay with exponential backoff for 5xx errors
const retryDelay = (attemptIndex: number, error: Error) => {
  if (error instanceof ServiceInitializingError) {
    // 503: retry every 5 seconds (matching server's retryAfter: 5)
    return 5000;
  }
  // ★ [v6.0] 500 에러: 지수 백오프 (500ms, 1s, 2s)
  if (error instanceof ServerError) {
    return Math.min(500 * Math.pow(2, attemptIndex), 5000);
  }
  // Default: exponential backoff
  return Math.min(1000 * 2 ** attemptIndex, 30000);
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 30000,
      retry: retryFn,
      retryDelay: retryDelay,
    },
    mutations: {
      retry: false,
    },
  },
});
