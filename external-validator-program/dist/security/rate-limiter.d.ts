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
export declare class AdvancedRateLimiter {
    private windows;
    private config;
    private cleanupInterval;
    constructor(config?: Partial<RateLimitConfig>);
    check(identifier: string): RateLimitResult;
    isBlocked(identifier: string): boolean;
    getStats(identifier: string): {
        requests: number;
        violations: number;
        blocked: boolean;
    };
    reset(identifier: string): void;
    private cleanup;
    destroy(): void;
}
//# sourceMappingURL=rate-limiter.d.ts.map