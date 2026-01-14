/**
 * TBURN Advanced Rate Limiter
 * Multi-tier rate limiting with sliding window and burst protection
 */

export interface RateLimitConfig {
  maxRequestsPerSecond: number;
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
  burstLimit: number;
  burstWindowMs: number;
  blockDurationMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remainingRequests: number;
  resetAt: number;
  blocked: boolean;
  blockedUntil?: number;
  reason?: string;
}

interface RequestWindow {
  requests: number[];
  blocked: boolean;
  blockedUntil: number;
  violations: number;
}

export class AdvancedRateLimiter {
  private windows: Map<string, RequestWindow> = new Map();
  private config: RateLimitConfig;
  private cleanupInterval: NodeJS.Timeout;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = {
      maxRequestsPerSecond: config.maxRequestsPerSecond ?? 100,
      maxRequestsPerMinute: config.maxRequestsPerMinute ?? 1000,
      maxRequestsPerHour: config.maxRequestsPerHour ?? 10000,
      burstLimit: config.burstLimit ?? 50,
      burstWindowMs: config.burstWindowMs ?? 1000,
      blockDurationMs: config.blockDurationMs ?? 60000
    };

    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  check(identifier: string): RateLimitResult {
    const now = Date.now();
    let window = this.windows.get(identifier);

    if (!window) {
      window = {
        requests: [],
        blocked: false,
        blockedUntil: 0,
        violations: 0
      };
      this.windows.set(identifier, window);
    }

    if (window.blocked && now < window.blockedUntil) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetAt: window.blockedUntil,
        blocked: true,
        blockedUntil: window.blockedUntil,
        reason: 'Temporarily blocked due to rate limit violations'
      };
    }

    if (window.blocked && now >= window.blockedUntil) {
      window.blocked = false;
      window.requests = [];
    }

    window.requests = window.requests.filter(t => now - t < 3600000);

    const lastSecond = window.requests.filter(t => now - t < 1000).length;
    const lastMinute = window.requests.filter(t => now - t < 60000).length;
    const lastHour = window.requests.length;
    const burstWindow = window.requests.filter(t => now - t < this.config.burstWindowMs).length;

    if (burstWindow >= this.config.burstLimit) {
      window.violations++;
      if (window.violations >= 3) {
        window.blocked = true;
        window.blockedUntil = now + this.config.blockDurationMs * window.violations;
      }
      return {
        allowed: false,
        remainingRequests: 0,
        resetAt: now + this.config.burstWindowMs,
        blocked: false,
        reason: 'Burst limit exceeded'
      };
    }

    if (lastSecond >= this.config.maxRequestsPerSecond) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetAt: window.requests[window.requests.length - this.config.maxRequestsPerSecond] + 1000,
        blocked: false,
        reason: 'Per-second rate limit exceeded'
      };
    }

    if (lastMinute >= this.config.maxRequestsPerMinute) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetAt: window.requests[window.requests.length - this.config.maxRequestsPerMinute] + 60000,
        blocked: false,
        reason: 'Per-minute rate limit exceeded'
      };
    }

    if (lastHour >= this.config.maxRequestsPerHour) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetAt: window.requests[0] + 3600000,
        blocked: false,
        reason: 'Per-hour rate limit exceeded'
      };
    }

    window.requests.push(now);

    return {
      allowed: true,
      remainingRequests: Math.min(
        this.config.maxRequestsPerSecond - lastSecond - 1,
        this.config.maxRequestsPerMinute - lastMinute - 1,
        this.config.maxRequestsPerHour - lastHour - 1
      ),
      resetAt: now + 1000,
      blocked: false
    };
  }

  isBlocked(identifier: string): boolean {
    const window = this.windows.get(identifier);
    if (!window) return false;
    return window.blocked && Date.now() < window.blockedUntil;
  }

  getStats(identifier: string): { requests: number; violations: number; blocked: boolean } {
    const window = this.windows.get(identifier);
    if (!window) {
      return { requests: 0, violations: 0, blocked: false };
    }
    return {
      requests: window.requests.length,
      violations: window.violations,
      blocked: window.blocked
    };
  }

  reset(identifier: string): void {
    this.windows.delete(identifier);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, window] of this.windows) {
      window.requests = window.requests.filter(t => now - t < 3600000);
      if (window.requests.length === 0 && !window.blocked) {
        this.windows.delete(key);
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.windows.clear();
  }
}
