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

import { createModuleLogger } from '../utils/logger';

const log = createModuleLogger('RateLimiter');

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  burstLimit: number;
  adaptiveEnabled: boolean;
  reputationEnabled: boolean;
  circuitBreakerThreshold: number;
}

interface TokenBucket {
  tokens: number;
  lastRefill: number;
  violations: number;
  firstViolation: number;
}

interface ReputationScore {
  score: number;
  requests: number;
  blocks: number;
  lastUpdated: number;
}

export class AdvancedRateLimiter {
  private config: RateLimitConfig;
  private buckets: Map<string, TokenBucket> = new Map();
  private reputations: Map<string, ReputationScore> = new Map();
  private circuitBreakerOpen: boolean = false;
  private circuitBreakerOpenedAt: number = 0;
  private globalRequestCount: number = 0;
  private lastSecond: number = 0;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = {
      windowMs: 60000,
      maxRequests: 100,
      burstLimit: 20,
      adaptiveEnabled: true,
      reputationEnabled: true,
      circuitBreakerThreshold: 1000,
      ...config,
    };

    // Cleanup old entries periodically
    setInterval(() => this.cleanup(), 60000);
  }

  check(identifier: string): { allowed: boolean; retryAfterMs?: number; reason?: string } {
    // Circuit breaker check
    if (this.circuitBreakerOpen) {
      if (Date.now() - this.circuitBreakerOpenedAt > 30000) {
        this.circuitBreakerOpen = false;
        log.info('Circuit breaker closed');
      } else {
        return { allowed: false, retryAfterMs: 30000, reason: 'circuit_breaker' };
      }
    }

    // Global rate check
    const currentSecond = Math.floor(Date.now() / 1000);
    if (currentSecond !== this.lastSecond) {
      if (this.globalRequestCount > this.config.circuitBreakerThreshold) {
        this.circuitBreakerOpen = true;
        this.circuitBreakerOpenedAt = Date.now();
        log.warn('Circuit breaker opened', { requests: this.globalRequestCount });
      }
      this.globalRequestCount = 0;
      this.lastSecond = currentSecond;
    }
    this.globalRequestCount++;

    // Get or create token bucket
    let bucket = this.buckets.get(identifier);
    const now = Date.now();

    if (!bucket) {
      bucket = {
        tokens: this.config.burstLimit,
        lastRefill: now,
        violations: 0,
        firstViolation: 0,
      };
      this.buckets.set(identifier, bucket);
    }

    // Refill tokens
    const timePassed = now - bucket.lastRefill;
    const refillRate = this.config.maxRequests / this.config.windowMs;
    const tokensToAdd = timePassed * refillRate;
    bucket.tokens = Math.min(this.config.burstLimit, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    // Apply reputation modifier
    if (this.config.reputationEnabled) {
      const reputation = this.getReputation(identifier);
      if (reputation.score < 0.5) {
        bucket.tokens = Math.min(bucket.tokens, this.config.burstLimit * reputation.score);
      }
    }

    // Check if request is allowed
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      this.updateReputation(identifier, true);
      return { allowed: true };
    }

    // Rate limited
    bucket.violations++;
    if (bucket.firstViolation === 0) {
      bucket.firstViolation = now;
    }

    this.updateReputation(identifier, false);

    const retryAfterMs = Math.ceil((1 - bucket.tokens) / refillRate);
    
    log.debug('Rate limited', { identifier, violations: bucket.violations });

    return {
      allowed: false,
      retryAfterMs,
      reason: 'rate_limit',
    };
  }

  private getReputation(identifier: string): ReputationScore {
    let reputation = this.reputations.get(identifier);
    
    if (!reputation) {
      reputation = {
        score: 1.0,
        requests: 0,
        blocks: 0,
        lastUpdated: Date.now(),
      };
      this.reputations.set(identifier, reputation);
    }

    // Decay reputation over time
    const hoursSinceUpdate = (Date.now() - reputation.lastUpdated) / 3600000;
    if (hoursSinceUpdate > 1) {
      reputation.score = Math.min(1.0, reputation.score + hoursSinceUpdate * 0.1);
      reputation.lastUpdated = Date.now();
    }

    return reputation;
  }

  private updateReputation(identifier: string, allowed: boolean): void {
    if (!this.config.reputationEnabled) return;

    const reputation = this.getReputation(identifier);
    reputation.requests++;

    if (!allowed) {
      reputation.blocks++;
      reputation.score = Math.max(0.1, reputation.score - 0.05);
    } else if (reputation.score < 1.0) {
      reputation.score = Math.min(1.0, reputation.score + 0.01);
    }

    reputation.lastUpdated = Date.now();
  }

  ban(identifier: string, durationMs: number): void {
    const bucket: TokenBucket = {
      tokens: -1000000,
      lastRefill: Date.now() + durationMs,
      violations: 1000,
      firstViolation: Date.now(),
    };
    this.buckets.set(identifier, bucket);

    const reputation = this.getReputation(identifier);
    reputation.score = 0;

    log.warn('Identifier banned', { identifier, durationMs });
  }

  unban(identifier: string): void {
    this.buckets.delete(identifier);
    this.reputations.delete(identifier);
    log.info('Identifier unbanned', { identifier });
  }

  getStats(): {
    totalBuckets: number;
    circuitBreakerOpen: boolean;
    globalRps: number;
    bannedCount: number;
  } {
    const bannedCount = Array.from(this.buckets.values())
      .filter(b => b.tokens < -100000).length;

    return {
      totalBuckets: this.buckets.size,
      circuitBreakerOpen: this.circuitBreakerOpen,
      globalRps: this.globalRequestCount,
      bannedCount,
    };
  }

  private cleanup(): void {
    const now = Date.now();
    const staleThreshold = now - this.config.windowMs * 10;

    for (const [key, bucket] of this.buckets) {
      if (bucket.lastRefill < staleThreshold && bucket.tokens >= 0) {
        this.buckets.delete(key);
      }
    }

    for (const [key, reputation] of this.reputations) {
      if (reputation.lastUpdated < staleThreshold) {
        this.reputations.delete(key);
      }
    }
  }
}

export class PeerRateLimiter extends AdvancedRateLimiter {
  private peerScores: Map<string, number> = new Map();

  constructor() {
    super({
      windowMs: 1000,
      maxRequests: 100,
      burstLimit: 50,
      adaptiveEnabled: true,
      reputationEnabled: true,
      circuitBreakerThreshold: 5000,
    });
  }

  checkPeer(peerId: string, messageType: string): { allowed: boolean; reason?: string } {
    const identifier = `${peerId}:${messageType}`;
    const result = this.check(identifier);

    if (!result.allowed) {
      const currentScore = this.peerScores.get(peerId) || 100;
      this.peerScores.set(peerId, Math.max(0, currentScore - 5));
    }

    return result;
  }

  getPeerScore(peerId: string): number {
    return this.peerScores.get(peerId) || 100;
  }

  isPeerTrusted(peerId: string): boolean {
    return this.getPeerScore(peerId) >= 50;
  }
}
