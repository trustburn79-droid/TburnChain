/**
 * TBURN Redis Security Service
 * Production-grade distributed rate limiting and replay attack prevention
 * 
 * Features:
 * - Redis-backed rate limiting for clustered deployments
 * - Distributed nonce tracking with TTL
 * - Automatic fallback to in-memory when Redis unavailable
 * - Connection health monitoring
 * 
 * Chain ID: 5800 | TBURN Mainnet
 */

import { createClient, RedisClientType } from 'redis';

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const NONCE_TTL_SECONDS = 300;

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
  source: 'redis' | 'memory';
}

class RedisSecurityService {
  private static instance: RedisSecurityService;
  
  private redisClient: RedisClientType | null = null;
  private isConnected = false;
  private isConnecting = false;
  
  private memoryRateLimitStore = new Map<string, { count: number; resetTime: number }>();
  private memoryNonceStore = new Map<string, number>();
  
  private constructor() {
    setInterval(() => this.cleanupMemoryStores(), 60000);
  }
  
  static getInstance(): RedisSecurityService {
    if (!RedisSecurityService.instance) {
      RedisSecurityService.instance = new RedisSecurityService();
    }
    return RedisSecurityService.instance;
  }
  
  async connect(): Promise<boolean> {
    const redisUrl = process.env.REDIS_URL;
    
    if (!redisUrl) {
      console.log('[SecurityService] No REDIS_URL configured, using in-memory fallback');
      return false;
    }
    
    if (this.isConnecting) {
      return false;
    }
    
    if (this.isConnected && this.redisClient?.isOpen) {
      return true;
    }
    
    this.isConnecting = true;
    
    try {
      this.redisClient = createClient({
        url: redisUrl,
        socket: {
          connectTimeout: 5000,
          reconnectStrategy: (retries) => {
            if (retries > 5) {
              console.warn('[SecurityService] Redis reconnection failed, using memory fallback');
              return false;
            }
            return Math.min(retries * 500, 3000);
          }
        }
      });
      
      this.redisClient.on('error', (err) => {
        console.error('[SecurityService] Redis error:', err.message);
        this.isConnected = false;
      });
      
      this.redisClient.on('ready', () => {
        console.log('[SecurityService] ✅ Redis connected for security operations');
        this.isConnected = true;
      });
      
      this.redisClient.on('end', () => {
        console.log('[SecurityService] Redis disconnected');
        this.isConnected = false;
      });
      
      await this.redisClient.connect();
      this.isConnected = true;
      this.isConnecting = false;
      return true;
    } catch (error) {
      console.error('[SecurityService] Redis connection failed:', error);
      this.isConnecting = false;
      this.isConnected = false;
      return false;
    }
  }
  
  async checkRateLimit(key: string, maxRequests: number, windowMs: number = RATE_LIMIT_WINDOW_MS): Promise<RateLimitResult> {
    const redisKey = `ratelimit:${key}`;
    
    if (this.isConnected && this.redisClient?.isOpen) {
      try {
        const windowSeconds = Math.ceil(windowMs / 1000);
        const now = Date.now();
        
        const multi = this.redisClient.multi();
        multi.incr(redisKey);
        multi.pTTL(redisKey);
        
        const results = await multi.exec();
        const count = results[0] as number;
        const ttl = results[1] as number;
        
        if (ttl === -1) {
          await this.redisClient.expire(redisKey, windowSeconds);
        }
        
        const resetIn = ttl > 0 ? ttl : windowMs;
        
        return {
          allowed: count <= maxRequests,
          remaining: Math.max(0, maxRequests - count),
          resetIn,
          source: 'redis'
        };
      } catch (error) {
        console.warn('[SecurityService] Redis rate limit check failed, using memory:', error);
      }
    }
    
    return this.memoryCheckRateLimit(key, maxRequests, windowMs);
  }
  
  private memoryCheckRateLimit(key: string, maxRequests: number, windowMs: number): RateLimitResult {
    const now = Date.now();
    const record = this.memoryRateLimitStore.get(key);
    
    if (!record || record.resetTime < now) {
      this.memoryRateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs, source: 'memory' };
    }
    
    if (record.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetIn: record.resetTime - now, source: 'memory' };
    }
    
    record.count++;
    return { 
      allowed: true, 
      remaining: maxRequests - record.count, 
      resetIn: record.resetTime - now,
      source: 'memory'
    };
  }
  
  async checkAndUseNonce(nonce: string, ttlSeconds: number = NONCE_TTL_SECONDS): Promise<{ valid: boolean; source: 'redis' | 'memory' }> {
    const redisKey = `nonce:${nonce}`;
    
    if (this.isConnected && this.redisClient?.isOpen) {
      try {
        const result = await this.redisClient.set(redisKey, '1', {
          NX: true,
          EX: ttlSeconds
        });
        
        return { valid: result === 'OK', source: 'redis' };
      } catch (error) {
        console.warn('[SecurityService] Redis nonce check failed, using memory:', error);
      }
    }
    
    return this.memoryCheckNonce(nonce, ttlSeconds);
  }
  
  private memoryCheckNonce(nonce: string, ttlSeconds: number): { valid: boolean; source: 'redis' | 'memory' } {
    const now = Date.now();
    const expiry = this.memoryNonceStore.get(nonce);
    
    if (expiry && expiry > now) {
      return { valid: false, source: 'memory' };
    }
    
    this.memoryNonceStore.set(nonce, now + (ttlSeconds * 1000));
    return { valid: true, source: 'memory' };
  }
  
  private cleanupMemoryStores(): void {
    const now = Date.now();
    
    const rateLimitEntries = Array.from(this.memoryRateLimitStore.entries());
    for (const [key, value] of rateLimitEntries) {
      if (value.resetTime < now) {
        this.memoryRateLimitStore.delete(key);
      }
    }
    
    const nonceEntries = Array.from(this.memoryNonceStore.entries());
    for (const [key, expiry] of nonceEntries) {
      if (expiry < now) {
        this.memoryNonceStore.delete(key);
      }
    }
  }
  
  getStatus(): { connected: boolean; source: 'redis' | 'memory' } {
    return {
      connected: this.isConnected,
      source: this.isConnected ? 'redis' : 'memory'
    };
  }
  
  async disconnect(): Promise<void> {
    if (this.redisClient?.isOpen) {
      await this.redisClient.quit();
    }
    this.isConnected = false;
    this.redisClient = null;
  }
}

export const redisSecurityService = RedisSecurityService.getInstance();

export async function initializeSecurityService(): Promise<void> {
  await redisSecurityService.connect();
  const status = redisSecurityService.getStatus();
  console.log(`[SecurityService] ✅ Initialized (source: ${status.source})`);
}
