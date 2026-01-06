import { QueryClient, QueryFunction } from "@tanstack/react-query";

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
    throw new Error(`${res.status}: ${text}`);
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
    return await res.json();
  };

// Retry function that handles 5xx errors with exponential backoff
// ★ [v6.0] 10분 유휴 후 첫 요청 에러 자동 복구
const retryFn = (failureCount: number, error: Error) => {
  // Always retry 503 errors (service initializing) up to 12 times (~60 seconds)
  if (error instanceof ServiceInitializingError) {
    return failureCount < 12;
  }
  // ★ [v6.0] 500 에러 재시도 (cold start 복구)
  if (error instanceof ServerError) {
    console.warn(`[QueryClient] Server error ${error.status}, retry ${failureCount + 1}/3`);
    return failureCount < 3;
  }
  // For other errors, retry twice (same as original behavior)
  return failureCount < 2;
};

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
