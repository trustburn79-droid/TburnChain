/**
 * TBURN Surge-Aware Request Shedder v6.0
 * 
 * Manages request load during shard scaling operations to prevent
 * event loop blocking and upstream timeouts.
 * 
 * Key features:
 * - Priority-based endpoint classification
 * - Cached response short-circuiting
 * - Degraded mode with automatic recovery
 * - Event loop lag monitoring
 * 
 * @author TBURN Development Team
 * @version 6.0.0
 */

import { Request, Response, NextFunction } from 'express';
import { EventEmitter } from 'events';

export type EndpointPriority = 'critical' | 'normal' | 'deferrable';

export interface ShedderConfig {
  criticalEndpoints: string[];
  deferrableEndpoints: string[];
  cachedResponseTtlMs: number;
  maxEventLoopLagMs: number;
  degradedModeDurationMs: number;
  checkIntervalMs: number;
}

export interface CachedResponse {
  data: any;
  cachedAt: number;
  expiresAt: number;
  path: string;
}

export interface ShedderMetrics {
  isScalingInProgress: boolean;
  isDegradedMode: boolean;
  eventLoopLagMs: number;
  totalSheddedRequests: number;
  cachedResponsesServed: number;
  degradedModeEntries: number;
  lastDegradedModeAt: number | null;
}

const DEFAULT_CONFIG: ShedderConfig = {
  criticalEndpoints: [
    '/api/auth/',
    '/api/health',
    '/health',
    '/healthz',
    '/rpc',
    '/api/session-health',
    '/api/public/v1/network/stats',
  ],
  deferrableEndpoints: [
    '/api/admin/',
    '/api/analytics/',
    '/api/validators/list',
    '/api/blocks',
    '/api/transactions',
    '/api/ai-training/',
    '/api/compliance/',
    '/api/reporting/',
  ],
  cachedResponseTtlMs: 30000,
  maxEventLoopLagMs: 150,
  degradedModeDurationMs: 60000,
  checkIntervalMs: 1000,
};

export class RequestShedder extends EventEmitter {
  private config: ShedderConfig;
  private isScalingInProgress = false;
  private isDegradedMode = false;
  private degradedModeStartedAt = 0;
  private responseCache: Map<string, CachedResponse> = new Map();
  private eventLoopLagMs = 0;
  private lastEventLoopCheck = Date.now();
  private checkTimer: NodeJS.Timeout | null = null;
  
  private metrics: ShedderMetrics = {
    isScalingInProgress: false,
    isDegradedMode: false,
    eventLoopLagMs: 0,
    totalSheddedRequests: 0,
    cachedResponsesServed: 0,
    degradedModeEntries: 0,
    lastDegradedModeAt: null,
  };
  
  constructor(config: Partial<ShedderConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startEventLoopMonitoring();
    console.log('[RequestShedder] ✅ Initialized surge-aware request shedding');
    console.log(`[RequestShedder] Max event loop lag: ${this.config.maxEventLoopLagMs}ms, Degraded duration: ${this.config.degradedModeDurationMs}ms`);
  }
  
  /**
   * Start event loop lag monitoring
   */
  private startEventLoopMonitoring(): void {
    this.checkTimer = setInterval(() => {
      const now = Date.now();
      const expectedInterval = this.config.checkIntervalMs;
      const actualInterval = now - this.lastEventLoopCheck;
      this.eventLoopLagMs = Math.max(0, actualInterval - expectedInterval);
      this.lastEventLoopCheck = now;
      this.metrics.eventLoopLagMs = this.eventLoopLagMs;
      
      if (this.eventLoopLagMs > this.config.maxEventLoopLagMs && !this.isDegradedMode) {
        this.enterDegradedMode('Event loop lag exceeded threshold');
      }
      
      if (this.isDegradedMode) {
        const elapsed = now - this.degradedModeStartedAt;
        if (elapsed >= this.config.degradedModeDurationMs && this.eventLoopLagMs < this.config.maxEventLoopLagMs) {
          this.exitDegradedMode();
        }
      }
      
      this.cleanupExpiredCache();
    }, this.config.checkIntervalMs);
  }
  
  /**
   * Set scaling in progress flag
   */
  setScalingInProgress(inProgress: boolean): void {
    this.isScalingInProgress = inProgress;
    this.metrics.isScalingInProgress = inProgress;
    
    if (inProgress) {
      console.log('[RequestShedder] ⚡ Scaling started - enabling request shedding');
    } else {
      console.log('[RequestShedder] ✅ Scaling complete - disabling request shedding');
    }
    
    this.emit('scalingStateChange', { isScalingInProgress: inProgress });
  }
  
  /**
   * Enter degraded mode
   */
  enterDegradedMode(reason: string): void {
    if (this.isDegradedMode) return;
    
    this.isDegradedMode = true;
    this.degradedModeStartedAt = Date.now();
    this.metrics.isDegradedMode = true;
    this.metrics.degradedModeEntries++;
    this.metrics.lastDegradedModeAt = this.degradedModeStartedAt;
    
    console.log(`[RequestShedder] ⚠️ Entering degraded mode: ${reason}`);
    this.emit('degradedModeEnter', { reason, timestamp: this.degradedModeStartedAt });
  }
  
  /**
   * Exit degraded mode
   */
  exitDegradedMode(): void {
    if (!this.isDegradedMode) return;
    
    this.isDegradedMode = false;
    this.metrics.isDegradedMode = false;
    
    const duration = Date.now() - this.degradedModeStartedAt;
    console.log(`[RequestShedder] ✅ Exiting degraded mode after ${duration}ms`);
    this.emit('degradedModeExit', { duration });
  }
  
  /**
   * Get endpoint priority
   */
  getEndpointPriority(path: string): EndpointPriority {
    for (const pattern of this.config.criticalEndpoints) {
      if (path.startsWith(pattern)) {
        return 'critical';
      }
    }
    
    for (const pattern of this.config.deferrableEndpoints) {
      if (path.startsWith(pattern)) {
        return 'deferrable';
      }
    }
    
    return 'normal';
  }
  
  /**
   * Check if request should be shed
   */
  shouldShedRequest(path: string): { shed: boolean; reason?: string; cachedResponse?: any } {
    if (!this.isScalingInProgress && !this.isDegradedMode) {
      return { shed: false };
    }
    
    const priority = this.getEndpointPriority(path);
    
    if (priority === 'critical') {
      return { shed: false };
    }
    
    if (priority === 'deferrable' || this.isDegradedMode) {
      const cached = this.getCachedResponse(path);
      if (cached) {
        this.metrics.cachedResponsesServed++;
        return { 
          shed: true, 
          reason: 'Serving cached response during scaling', 
          cachedResponse: cached.data 
        };
      }
      
      this.metrics.totalSheddedRequests++;
      return { 
        shed: true, 
        reason: this.isDegradedMode 
          ? 'Degraded mode - request deferred' 
          : 'Scaling in progress - request deferred'
      };
    }
    
    return { shed: false };
  }
  
  /**
   * Cache a response for later use
   */
  cacheResponse(path: string, data: any): void {
    const now = Date.now();
    this.responseCache.set(path, {
      data,
      cachedAt: now,
      expiresAt: now + this.config.cachedResponseTtlMs,
      path,
    });
  }
  
  /**
   * Get cached response if valid
   */
  getCachedResponse(path: string): CachedResponse | null {
    const cached = this.responseCache.get(path);
    if (!cached) return null;
    
    if (Date.now() > cached.expiresAt) {
      this.responseCache.delete(path);
      return null;
    }
    
    return cached;
  }
  
  /**
   * Cleanup expired cache entries
   */
  private cleanupExpiredCache(): void {
    const now = Date.now();
    for (const [path, cached] of this.responseCache.entries()) {
      if (now > cached.expiresAt) {
        this.responseCache.delete(path);
      }
    }
  }
  
  /**
   * Get metrics
   */
  getMetrics(): ShedderMetrics {
    return { ...this.metrics };
  }
  
  /**
   * Express middleware for request shedding
   */
  middleware(): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      const path = req.path;
      const shedResult = this.shouldShedRequest(path);
      
      if (shedResult.shed) {
        if (shedResult.cachedResponse) {
          return res.json(shedResult.cachedResponse);
        }
        
        return res
          .status(503)
          .header('Retry-After', '30')
          .json({
            error: 'Service temporarily unavailable',
            reason: shedResult.reason,
            retryAfter: 30,
          });
      }
      
      const originalJson = res.json.bind(res);
      res.json = (data: any) => {
        const priority = this.getEndpointPriority(path);
        if (priority === 'deferrable' || priority === 'normal') {
          this.cacheResponse(path, data);
        }
        return originalJson(data);
      };
      
      next();
    };
  }
  
  /**
   * Cleanup
   */
  destroy(): void {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
    this.responseCache.clear();
    this.removeAllListeners();
  }
}

export const requestShedder = new RequestShedder();
