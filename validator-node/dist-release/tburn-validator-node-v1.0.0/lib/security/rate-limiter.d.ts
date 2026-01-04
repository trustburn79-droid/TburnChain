/**
 * TBURN Advanced Rate Limiter
 * Enterprise-Grade DDoS Protection
 *
 * Features:
 * - Token bucket algorithm
 * - Sliding window rate limiting
 * - Adaptive rate limiting based on load
 * - IP reputation scoring
 * - Circuit breaker pattern
 */
export interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
    burstLimit: number;
    adaptiveEnabled: boolean;
    reputationEnabled: boolean;
    circuitBreakerThreshold: number;
}
export declare class AdvancedRateLimiter {
    private config;
    private buckets;
    private reputations;
    private circuitBreakerOpen;
    private circuitBreakerOpenedAt;
    private globalRequestCount;
    private lastSecond;
    constructor(config?: Partial<RateLimitConfig>);
    check(identifier: string): {
        allowed: boolean;
        retryAfterMs?: number;
        reason?: string;
    };
    private getReputation;
    private updateReputation;
    ban(identifier: string, durationMs: number): void;
    unban(identifier: string): void;
    getStats(): {
        totalBuckets: number;
        circuitBreakerOpen: boolean;
        globalRps: number;
        bannedCount: number;
    };
    private cleanup;
}
export declare class PeerRateLimiter extends AdvancedRateLimiter {
    private peerScores;
    constructor();
    checkPeer(peerId: string, messageType: string): {
        allowed: boolean;
        reason?: string;
    };
    getPeerScore(peerId: string): number;
    isPeerTrusted(peerId: string): boolean;
}
//# sourceMappingURL=rate-limiter.d.ts.map