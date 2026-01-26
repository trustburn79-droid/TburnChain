/**
 * 메모리 안전한 바운디드 캐시 유틸리티
 * 5대 신기술 어댑터에서 무제한 Map 대신 사용
 * 
 * @module bounded-cache
 */

export interface BoundedCacheConfig {
  maxSize: number;
  ttlMs?: number;
  onEvict?: (key: string, value: unknown) => void;
}

interface CacheEntry<T> {
  value: T;
  createdAt: number;
  lastAccessedAt: number;
}

/**
 * LRU (Least Recently Used) 캐시
 * 최대 크기 및 TTL 지원
 */
export class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private config: Required<BoundedCacheConfig>;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config: BoundedCacheConfig) {
    this.config = {
      maxSize: config.maxSize,
      ttlMs: config.ttlMs ?? 0,
      onEvict: config.onEvict ?? (() => {}),
    };

    if (this.config.ttlMs > 0) {
      this.cleanupInterval = setInterval(() => {
        this.evictExpired();
      }, Math.min(this.config.ttlMs, 60000));
    }
  }

  set(key: string, value: T): void {
    const now = Date.now();

    if (this.cache.has(key)) {
      const entry = this.cache.get(key)!;
      entry.value = value;
      entry.lastAccessedAt = now;
      this.cache.delete(key);
      this.cache.set(key, entry);
      return;
    }

    while (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      value,
      createdAt: now,
      lastAccessedAt: now,
    });
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (this.config.ttlMs > 0 && Date.now() - entry.createdAt > this.config.ttlMs) {
      this.delete(key);
      return undefined;
    }

    entry.lastAccessedAt = Date.now();
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.config.onEvict(key, entry.value);
      return this.cache.delete(key);
    }
    return false;
  }

  clear(): void {
    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      this.config.onEvict(key, entry.value);
    });
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }

  values(): T[] {
    return Array.from(this.cache.values()).map(e => e.value);
  }

  entries(): [string, T][] {
    return Array.from(this.cache.entries()).map(([k, e]) => [k, e.value]);
  }

  private evictOldest(): void {
    const oldestKey = this.cache.keys().next().value;
    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  private evictExpired(): void {
    if (this.config.ttlMs <= 0) return;
    const now = Date.now();
    const expiredKeys: string[] = [];

    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      if (now - entry.createdAt > this.config.ttlMs) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => this.delete(key));
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      ttlMs: this.config.ttlMs,
      utilization: this.cache.size / this.config.maxSize,
    };
  }
}

/**
 * 동시성 제한된 비동기 작업 실행기
 */
export class ConcurrencyLimiter {
  private running = 0;
  private queue: Array<() => Promise<void>> = [];
  private maxConcurrency: number;

  constructor(maxConcurrency: number) {
    this.maxConcurrency = maxConcurrency;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const task = async () => {
        this.running++;
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.running--;
          this.processQueue();
        }
      };

      if (this.running < this.maxConcurrency) {
        task();
      } else {
        this.queue.push(task);
      }
    });
  }

  private processQueue(): void {
    if (this.queue.length > 0 && this.running < this.maxConcurrency) {
      const next = this.queue.shift();
      if (next) next();
    }
  }

  getStats() {
    return {
      running: this.running,
      queued: this.queue.length,
      maxConcurrency: this.maxConcurrency,
    };
  }
}

/**
 * 서킷 브레이커
 */
export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeoutMs: number;
  halfOpenMaxCalls: number;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime = 0;
  private halfOpenCalls = 0;
  private config: CircuitBreakerConfig;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: config.failureThreshold ?? 5,
      resetTimeoutMs: config.resetTimeoutMs ?? 30000,
      halfOpenMaxCalls: config.halfOpenMaxCalls ?? 3,
    };
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime > this.config.resetTimeoutMs) {
        this.state = CircuitState.HALF_OPEN;
        this.halfOpenCalls = 0;
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    if (this.state === CircuitState.HALF_OPEN) {
      if (this.halfOpenCalls >= this.config.halfOpenMaxCalls) {
        throw new Error('Circuit breaker HALF_OPEN limit reached');
      }
      this.halfOpenCalls++;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.CLOSED;
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.halfOpenCalls = 0;
  }

  getStats() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      config: this.config,
    };
  }
}

/**
 * 재시도 + 지수 백오프
 */
export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const { maxRetries = 3, baseDelayMs = 100, maxDelayMs = 10000, backoffMultiplier = 2 } = config;

  let lastError: Error | undefined;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        const delay = Math.min(baseDelayMs * Math.pow(backoffMultiplier, attempt), maxDelayMs);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

/**
 * 공유 레이트 리미터 (토큰 버킷)
 */
export class RateLimiter {
  private tokens: number;
  private lastRefillTime: number;
  private config: {
    maxTokens: number;
    refillRatePerSecond: number;
  };

  constructor(maxTokens: number, refillRatePerSecond: number) {
    this.tokens = maxTokens;
    this.lastRefillTime = Date.now();
    this.config = { maxTokens, refillRatePerSecond };
  }

  tryAcquire(tokens = 1): boolean {
    this.refill();
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    return false;
  }

  async acquire(tokens = 1, timeoutMs = 5000): Promise<boolean> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      if (this.tryAcquire(tokens)) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    return false;
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefillTime) / 1000;
    const tokensToAdd = elapsed * this.config.refillRatePerSecond;
    this.tokens = Math.min(this.config.maxTokens, this.tokens + tokensToAdd);
    this.lastRefillTime = now;
  }

  getStats() {
    this.refill();
    return {
      availableTokens: Math.floor(this.tokens),
      maxTokens: this.config.maxTokens,
      refillRatePerSecond: this.config.refillRatePerSecond,
    };
  }
}

/**
 * 타임아웃 래퍼
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  errorMessage = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
}
