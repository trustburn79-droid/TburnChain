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
const VERIFICATION_CODE_TTL_SECONDS = 600; // 10 minutes

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
  private memoryVerificationCodeStore = new Map<string, { code: string; expiry: number; attempts: number }>();
  
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
        
        const multi = this.redisClient.multi();
        multi.incr(redisKey);
        multi.pTTL(redisKey);
        
        const results = await multi.exec();
        const count = results[0] as unknown as number;
        const ttl = results[1] as unknown as number;
        
        // Set expiry when key is first created (ttl === -2 means key doesn't exist)
        // or when key has no expiry (ttl === -1)
        if (count === 1 || ttl === -1 || ttl === -2) {
          await this.redisClient.expire(redisKey, windowSeconds);
        }
        
        // Use windowMs as default if no valid TTL (should not happen after expire is set)
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
    
    // Cleanup expired verification codes
    const verificationEntries = Array.from(this.memoryVerificationCodeStore.entries());
    for (const [key, record] of verificationEntries) {
      if (record.expiry < now) {
        this.memoryVerificationCodeStore.delete(key);
      }
    }
  }
  
  getStatus(): { connected: boolean; source: 'redis' | 'memory' } {
    return {
      connected: this.isConnected,
      source: this.isConnected ? 'redis' : 'memory'
    };
  }
  
  /**
   * Store a verification code for email 2FA
   * @param key Unique key (e.g., signerId:transactionId)
   * @param code 6-digit verification code
   * @param ttlSeconds Time-to-live in seconds (default 10 minutes)
   */
  async storeVerificationCode(key: string, code: string, ttlSeconds: number = VERIFICATION_CODE_TTL_SECONDS): Promise<{ success: boolean; source: 'redis' | 'memory' }> {
    const redisKey = `verification:${key}`;
    const data = JSON.stringify({ code, attempts: 0 });
    
    if (this.isConnected && this.redisClient?.isOpen) {
      try {
        await this.redisClient.set(redisKey, data, { EX: ttlSeconds });
        console.log(`[SecurityService] Verification code stored in Redis: ${key}`);
        return { success: true, source: 'redis' };
      } catch (error) {
        console.warn('[SecurityService] Redis store verification code failed, using memory:', error);
      }
    }
    
    // Memory fallback
    this.memoryVerificationCodeStore.set(key, {
      code,
      expiry: Date.now() + (ttlSeconds * 1000),
      attempts: 0
    });
    console.log(`[SecurityService] Verification code stored in memory: ${key}`);
    return { success: true, source: 'memory' };
  }
  
  /**
   * Verify a code and consume it if valid
   * @param key Unique key (e.g., signerId:transactionId)
   * @param inputCode Code entered by user
   * @returns { valid: boolean, reason?: string }
   */
  async verifyAndConsumeCode(key: string, inputCode: string): Promise<{ valid: boolean; reason?: string; source: 'redis' | 'memory' }> {
    const redisKey = `verification:${key}`;
    const MAX_ATTEMPTS = 5;
    
    if (this.isConnected && this.redisClient?.isOpen) {
      try {
        const storedData = await this.redisClient.get(redisKey);
        if (!storedData) {
          return { valid: false, reason: 'CODE_NOT_FOUND', source: 'redis' };
        }
        
        const { code, attempts } = JSON.parse(storedData);
        
        // Check max attempts
        if (attempts >= MAX_ATTEMPTS) {
          await this.redisClient.del(redisKey);
          return { valid: false, reason: 'MAX_ATTEMPTS_EXCEEDED', source: 'redis' };
        }
        
        if (inputCode !== code) {
          // Increment attempts
          const ttl = await this.redisClient.ttl(redisKey);
          await this.redisClient.set(redisKey, JSON.stringify({ code, attempts: attempts + 1 }), { EX: ttl > 0 ? ttl : VERIFICATION_CODE_TTL_SECONDS });
          return { valid: false, reason: 'INVALID_CODE', source: 'redis' };
        }
        
        // Valid code - delete it (one-time use)
        await this.redisClient.del(redisKey);
        return { valid: true, source: 'redis' };
      } catch (error) {
        console.warn('[SecurityService] Redis verify code failed, using memory:', error);
      }
    }
    
    // Memory fallback
    return this.memoryVerifyCode(key, inputCode);
  }
  
  private memoryVerifyCode(key: string, inputCode: string): { valid: boolean; reason?: string; source: 'redis' | 'memory' } {
    const MAX_ATTEMPTS = 5;
    const record = this.memoryVerificationCodeStore.get(key);
    
    if (!record || record.expiry < Date.now()) {
      this.memoryVerificationCodeStore.delete(key);
      return { valid: false, reason: 'CODE_NOT_FOUND', source: 'memory' };
    }
    
    if (record.attempts >= MAX_ATTEMPTS) {
      this.memoryVerificationCodeStore.delete(key);
      return { valid: false, reason: 'MAX_ATTEMPTS_EXCEEDED', source: 'memory' };
    }
    
    if (inputCode !== record.code) {
      record.attempts++;
      return { valid: false, reason: 'INVALID_CODE', source: 'memory' };
    }
    
    // Valid code - delete it (one-time use)
    this.memoryVerificationCodeStore.delete(key);
    return { valid: true, source: 'memory' };
  }
  
  /**
   * Check if a verification code exists for the given key
   */
  async hasVerificationCode(key: string): Promise<boolean> {
    const redisKey = `verification:${key}`;
    
    if (this.isConnected && this.redisClient?.isOpen) {
      try {
        const exists = await this.redisClient.exists(redisKey);
        return exists === 1;
      } catch (error) {
        console.warn('[SecurityService] Redis check verification code failed:', error);
      }
    }
    
    const record = this.memoryVerificationCodeStore.get(key);
    return !!record && record.expiry > Date.now();
  }
  
  /**
   * Delete verification code (e.g., on cancel)
   */
  async deleteVerificationCode(key: string): Promise<void> {
    const redisKey = `verification:${key}`;
    
    if (this.isConnected && this.redisClient?.isOpen) {
      try {
        await this.redisClient.del(redisKey);
      } catch (error) {
        console.warn('[SecurityService] Redis delete verification code failed:', error);
      }
    }
    
    this.memoryVerificationCodeStore.delete(key);
  }
  
  /**
   * Generate a 6-digit verification code
   */
  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
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
