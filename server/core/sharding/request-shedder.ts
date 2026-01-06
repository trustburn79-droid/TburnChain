/**
 * TBURN Surge-Aware Request Shedder v6.0 Enterprise
 * 
 * Production-grade request load management with adaptive thresholds,
 * priority queuing, and comprehensive observability.
 * 
 * Key features:
 * - Priority-based endpoint classification with regex support
 * - Adaptive event loop lag thresholds
 * - Backpressure signaling to upstream services
 * - Response caching with cache-control headers
 * - Prometheus-compatible metrics export
 * - Graceful degradation with automatic recovery
 * - Request rate limiting integration
 * 
 * @author TBURN Development Team
 * @version 6.0.0-enterprise
 */

import { Request, Response, NextFunction } from 'express';
import { EventEmitter } from 'events';

export type EndpointPriority = 'critical' | 'high' | 'normal' | 'low' | 'deferrable';

export interface ShedderConfig {
  criticalEndpoints: string[];
  highPriorityEndpoints: string[];
  deferrableEndpoints: string[];
  cachedResponseTtlMs: number;
  maxEventLoopLagMs: number;
  adaptiveThresholdMinMs: number;
  adaptiveThresholdMaxMs: number;
  degradedModeDurationMs: number;
  checkIntervalMs: number;
  maxCacheSize: number;
  backpressureThreshold: number;
  recoveryThresholdMs: number;
  requestQueueMaxSize: number;
}

export interface CachedResponse {
  data: any;
  cachedAt: number;
  expiresAt: number;
  path: string;
  hitCount: number;
  size: number;
}

export interface ShedderMetrics {
  isScalingInProgress: boolean;
  isDegradedMode: boolean;
  eventLoopLagMs: number;
  avgEventLoopLagMs: number;
  maxEventLoopLagMs: number;
  adaptiveThresholdMs: number;
  totalSheddedRequests: number;
  cachedResponsesServed: number;
  cacheHitRate: number;
  cacheSize: number;
  degradedModeEntries: number;
  degradedModeDurationMs: number;
  lastDegradedModeAt: number | null;
  backpressureActive: boolean;
  requestsPerSecond: number;
  uptime: number;
}

export interface ShedderHealthStatus {
  healthy: boolean;
  status: 'healthy' | 'degraded' | 'overloaded';
  eventLoopHealth: boolean;
  cacheHealth: boolean;
  backpressureStatus: boolean;
  recommendations: string[];
  metrics: ShedderMetrics;
  lastCheck: number;
}

const DEFAULT_CONFIG: ShedderConfig = {
  criticalEndpoints: [
    '/api/auth/',
    '/api/health',
    '/health',
    '/healthz',
    '/ready',
    '/live',
    '/rpc',
    '/api/session-health',
    '/api/public/v1/network/stats',
  ],
  highPriorityEndpoints: [
    '/api/shards',
    '/api/blocks',
    '/api/transactions',
    '/api/wallets/',
    '/api/staking/',
  ],
  deferrableEndpoints: [
    '/api/admin/',
    '/api/analytics/',
    '/api/validators/list',
    '/api/ai-training/',
    '/api/compliance/',
    '/api/reporting/',
    '/api/system-health/history',
  ],
  cachedResponseTtlMs: 30000,
  maxEventLoopLagMs: 150,
  adaptiveThresholdMinMs: 50,
  adaptiveThresholdMaxMs: 300,
  degradedModeDurationMs: 60000,
  checkIntervalMs: 1000,
  maxCacheSize: 1000,
  backpressureThreshold: 100,
  recoveryThresholdMs: 50,
  requestQueueMaxSize: 500,
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
  private startTime = Date.now();
  
  private lagHistory: number[] = [];
  private requestTimestamps: number[] = [];
  private cacheHits = 0;
  private cacheMisses = 0;
  private adaptiveThresholdMs: number;
  private totalDegradedTime = 0;
  private backpressureActive = false;
  private maxObservedLag = 0;
  
  private metrics: ShedderMetrics = {
    isScalingInProgress: false,
    isDegradedMode: false,
    eventLoopLagMs: 0,
    avgEventLoopLagMs: 0,
    maxEventLoopLagMs: 0,
    adaptiveThresholdMs: 0,
    totalSheddedRequests: 0,
    cachedResponsesServed: 0,
    cacheHitRate: 0,
    cacheSize: 0,
    degradedModeEntries: 0,
    degradedModeDurationMs: 0,
    lastDegradedModeAt: null,
    backpressureActive: false,
    requestsPerSecond: 0,
    uptime: 0,
  };
  
  constructor(config: Partial<ShedderConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.adaptiveThresholdMs = this.config.maxEventLoopLagMs;
    this.startEventLoopMonitoring();
    console.log('[RequestShedder] ✅ Initialized surge-aware request shedding (Enterprise)');
    console.log(`[RequestShedder] Max event loop lag: ${this.config.maxEventLoopLagMs}ms, Degraded duration: ${this.config.degradedModeDurationMs}ms`);
    console.log(`[RequestShedder] Adaptive threshold range: ${this.config.adaptiveThresholdMinMs}-${this.config.adaptiveThresholdMaxMs}ms`);
  }
  
  private startEventLoopMonitoring(): void {
    this.checkTimer = setInterval(() => {
      const now = Date.now();
      const expectedInterval = this.config.checkIntervalMs;
      const actualInterval = now - this.lastEventLoopCheck;
      this.eventLoopLagMs = Math.max(0, actualInterval - expectedInterval);
      this.lastEventLoopCheck = now;
      
      this.lagHistory.push(this.eventLoopLagMs);
      if (this.lagHistory.length > 60) {
        this.lagHistory.shift();
      }
      
      this.maxObservedLag = Math.max(this.maxObservedLag, this.eventLoopLagMs);
      
      this.updateAdaptiveThreshold();
      
      this.updateMetrics();
      
      if (this.eventLoopLagMs > this.adaptiveThresholdMs && !this.isDegradedMode) {
        this.enterDegradedMode(`Event loop lag ${this.eventLoopLagMs}ms exceeded adaptive threshold ${this.adaptiveThresholdMs}ms`);
      }
      
      if (this.isDegradedMode) {
        this.totalDegradedTime += this.config.checkIntervalMs;
        
        const elapsed = now - this.degradedModeStartedAt;
        const recentLag = this.getAverageRecentLag(5);
        
        if (elapsed >= this.config.degradedModeDurationMs && 
            recentLag < this.config.recoveryThresholdMs) {
          this.exitDegradedMode();
        }
      }
      
      this.updateBackpressure();
      
      this.cleanupExpiredCache();
      this.enforeCacheSize();
    }, this.config.checkIntervalMs);
  }
  
  private updateAdaptiveThreshold(): void {
    const avgLag = this.getAverageRecentLag(30);
    
    if (avgLag < 20) {
      this.adaptiveThresholdMs = Math.max(
        this.config.adaptiveThresholdMinMs,
        this.adaptiveThresholdMs - 5
      );
    } else if (avgLag > 100 && this.adaptiveThresholdMs < this.config.adaptiveThresholdMaxMs) {
      this.adaptiveThresholdMs = Math.min(
        this.config.adaptiveThresholdMaxMs,
        this.adaptiveThresholdMs + 10
      );
    }
  }
  
  private getAverageRecentLag(count: number): number {
    if (this.lagHistory.length === 0) return 0;
    const recent = this.lagHistory.slice(-count);
    return recent.reduce((a, b) => a + b, 0) / recent.length;
  }
  
  private updateBackpressure(): void {
    const now = Date.now();
    const oneSecondAgo = now - 1000;
    this.requestTimestamps = this.requestTimestamps.filter(t => t > oneSecondAgo);
    
    const rps = this.requestTimestamps.length;
    const shouldActivate = rps > this.config.backpressureThreshold || this.eventLoopLagMs > 200;
    
    if (shouldActivate !== this.backpressureActive) {
      this.backpressureActive = shouldActivate;
      this.metrics.backpressureActive = shouldActivate;
      
      if (shouldActivate) {
        console.log(`[RequestShedder] ⚠️ Backpressure ACTIVE (RPS: ${rps}, Lag: ${this.eventLoopLagMs}ms)`);
        this.emit('backpressureActivated', { rps, lag: this.eventLoopLagMs });
      } else {
        console.log('[RequestShedder] ✅ Backpressure released');
        this.emit('backpressureReleased', { rps, lag: this.eventLoopLagMs });
      }
    }
  }
  
  private updateMetrics(): void {
    const totalRequests = this.cacheHits + this.cacheMisses;
    
    this.metrics.eventLoopLagMs = this.eventLoopLagMs;
    this.metrics.avgEventLoopLagMs = this.getAverageRecentLag(60);
    this.metrics.maxEventLoopLagMs = this.maxObservedLag;
    this.metrics.adaptiveThresholdMs = this.adaptiveThresholdMs;
    this.metrics.cacheSize = this.responseCache.size;
    this.metrics.cacheHitRate = totalRequests > 0 ? (this.cacheHits / totalRequests) * 100 : 0;
    this.metrics.degradedModeDurationMs = this.totalDegradedTime;
    this.metrics.requestsPerSecond = this.requestTimestamps.length;
    this.metrics.uptime = Date.now() - this.startTime;
  }
  
  setScalingInProgress(inProgress: boolean): void {
    if (this.isScalingInProgress === inProgress) return;
    
    this.isScalingInProgress = inProgress;
    this.metrics.isScalingInProgress = inProgress;
    
    if (inProgress) {
      console.log('[RequestShedder] ⚡ Scaling started - enabling request shedding');
    } else {
      console.log('[RequestShedder] ✅ Scaling complete - disabling request shedding');
    }
    
    this.emit('scalingStateChange', { isScalingInProgress: inProgress });
  }
  
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
  
  exitDegradedMode(): void {
    if (!this.isDegradedMode) return;
    
    this.isDegradedMode = false;
    this.metrics.isDegradedMode = false;
    
    const duration = Date.now() - this.degradedModeStartedAt;
    console.log(`[RequestShedder] ✅ Exiting degraded mode after ${duration}ms`);
    this.emit('degradedModeExit', { duration });
  }
  
  getEndpointPriority(path: string): EndpointPriority {
    for (const pattern of this.config.criticalEndpoints) {
      if (this.matchesPattern(path, pattern)) {
        return 'critical';
      }
    }
    
    for (const pattern of this.config.highPriorityEndpoints) {
      if (this.matchesPattern(path, pattern)) {
        return 'high';
      }
    }
    
    for (const pattern of this.config.deferrableEndpoints) {
      if (this.matchesPattern(path, pattern)) {
        return 'deferrable';
      }
    }
    
    return 'normal';
  }
  
  private matchesPattern(path: string, pattern: string): boolean {
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      return regex.test(path);
    }
    return path.startsWith(pattern);
  }
  
  shouldShedRequest(path: string): { shed: boolean; reason?: string; cachedResponse?: any; retryAfter?: number } {
    this.requestTimestamps.push(Date.now());
    
    if (!this.isScalingInProgress && !this.isDegradedMode && !this.backpressureActive) {
      return { shed: false };
    }
    
    const priority = this.getEndpointPriority(path);
    
    if (priority === 'critical') {
      return { shed: false };
    }
    
    if (priority === 'high' && !this.backpressureActive && this.eventLoopLagMs < 200) {
      return { shed: false };
    }
    
    const cached = this.getCachedResponse(path);
    if (cached) {
      this.cacheHits++;
      this.metrics.cachedResponsesServed++;
      return { 
        shed: true, 
        reason: 'Serving cached response during load management', 
        cachedResponse: cached.data 
      };
    }
    this.cacheMisses++;
    
    if (priority === 'deferrable' || this.backpressureActive || this.eventLoopLagMs > 200) {
      this.metrics.totalSheddedRequests++;
      
      const retryAfter = this.calculateRetryAfter();
      
      return { 
        shed: true, 
        reason: this.getSheddingReason(),
        retryAfter,
      };
    }
    
    return { shed: false };
  }
  
  private getSheddingReason(): string {
    if (this.backpressureActive) return 'Backpressure active - request deferred';
    if (this.isDegradedMode) return 'Degraded mode - request deferred';
    if (this.isScalingInProgress) return 'Scaling in progress - request deferred';
    return 'Load management - request deferred';
  }
  
  private calculateRetryAfter(): number {
    if (this.isScalingInProgress) return 30;
    if (this.backpressureActive) return 10;
    if (this.eventLoopLagMs > 300) return 20;
    return 5;
  }
  
  cacheResponse(path: string, data: any): void {
    const now = Date.now();
    const dataStr = JSON.stringify(data);
    const size = dataStr.length;
    
    this.responseCache.set(path, {
      data,
      cachedAt: now,
      expiresAt: now + this.config.cachedResponseTtlMs,
      path,
      hitCount: 0,
      size,
    });
  }
  
  getCachedResponse(path: string): CachedResponse | null {
    const cached = this.responseCache.get(path);
    if (!cached) return null;
    
    if (Date.now() > cached.expiresAt) {
      this.responseCache.delete(path);
      return null;
    }
    
    cached.hitCount++;
    return cached;
  }
  
  private cleanupExpiredCache(): void {
    const now = Date.now();
    for (const [path, cached] of this.responseCache.entries()) {
      if (now > cached.expiresAt) {
        this.responseCache.delete(path);
      }
    }
  }
  
  private enforeCacheSize(): void {
    if (this.responseCache.size <= this.config.maxCacheSize) return;
    
    const entries = Array.from(this.responseCache.entries())
      .sort((a, b) => a[1].cachedAt - b[1].cachedAt);
    
    const toRemove = entries.slice(0, entries.length - this.config.maxCacheSize);
    for (const [path] of toRemove) {
      this.responseCache.delete(path);
    }
  }
  
  getMetrics(): ShedderMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }
  
  getHealthStatus(): ShedderHealthStatus {
    const metrics = this.getMetrics();
    const recommendations: string[] = [];
    
    const eventLoopHealth = metrics.avgEventLoopLagMs < 100;
    const cacheHealth = metrics.cacheSize < this.config.maxCacheSize * 0.9;
    const backpressureStatus = !this.backpressureActive;
    
    if (!eventLoopHealth) {
      recommendations.push(`High event loop lag (avg: ${metrics.avgEventLoopLagMs.toFixed(0)}ms) - consider reducing load`);
    }
    
    if (!cacheHealth) {
      recommendations.push('Cache near capacity - consider increasing cache size or reducing TTL');
    }
    
    if (!backpressureStatus) {
      recommendations.push('Backpressure active - upstream services should reduce request rate');
    }
    
    if (this.isDegradedMode) {
      recommendations.push('Currently in degraded mode - some requests are being deferred');
    }
    
    const healthy = eventLoopHealth && cacheHealth && backpressureStatus && !this.isDegradedMode;
    const overloaded = !eventLoopHealth && !backpressureStatus;
    
    return {
      healthy,
      status: overloaded ? 'overloaded' : (healthy ? 'healthy' : 'degraded'),
      eventLoopHealth,
      cacheHealth,
      backpressureStatus,
      recommendations,
      metrics,
      lastCheck: Date.now(),
    };
  }
  
  middleware(): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      const path = req.path;
      const shedResult = this.shouldShedRequest(path);
      
      if (shedResult.shed) {
        if (shedResult.cachedResponse) {
          res.setHeader('X-Cache', 'HIT');
          res.setHeader('X-Cache-Age', Math.round((Date.now() - this.getCachedResponse(path)?.cachedAt!) / 1000).toString());
          return res.json(shedResult.cachedResponse);
        }
        
        res.setHeader('X-Shed-Reason', shedResult.reason || 'unknown');
        if (this.backpressureActive) {
          res.setHeader('X-Backpressure', 'true');
        }
        
        return res
          .status(503)
          .header('Retry-After', (shedResult.retryAfter || 30).toString())
          .json({
            error: 'Service temporarily unavailable',
            reason: shedResult.reason,
            retryAfter: shedResult.retryAfter || 30,
            backpressure: this.backpressureActive,
          });
      }
      
      const originalJson = res.json.bind(res);
      res.json = (data: any) => {
        const priority = this.getEndpointPriority(path);
        if (priority !== 'critical' && data && typeof data === 'object') {
          this.cacheResponse(path, data);
        }
        res.setHeader('X-Cache', 'MISS');
        return originalJson(data);
      };
      
      next();
    };
  }
  
  toPrometheusMetrics(): string {
    const m = this.getMetrics();
    const lines: string[] = [];
    
    lines.push('# HELP tburn_shedder_event_loop_lag_ms Current event loop lag in milliseconds');
    lines.push('# TYPE tburn_shedder_event_loop_lag_ms gauge');
    lines.push(`tburn_shedder_event_loop_lag_ms ${m.eventLoopLagMs}`);
    
    lines.push('# HELP tburn_shedder_avg_event_loop_lag_ms Average event loop lag over 60s');
    lines.push('# TYPE tburn_shedder_avg_event_loop_lag_ms gauge');
    lines.push(`tburn_shedder_avg_event_loop_lag_ms ${m.avgEventLoopLagMs.toFixed(2)}`);
    
    lines.push('# HELP tburn_shedder_max_event_loop_lag_ms Maximum observed event loop lag');
    lines.push('# TYPE tburn_shedder_max_event_loop_lag_ms gauge');
    lines.push(`tburn_shedder_max_event_loop_lag_ms ${m.maxEventLoopLagMs}`);
    
    lines.push('# HELP tburn_shedder_adaptive_threshold_ms Current adaptive threshold');
    lines.push('# TYPE tburn_shedder_adaptive_threshold_ms gauge');
    lines.push(`tburn_shedder_adaptive_threshold_ms ${m.adaptiveThresholdMs}`);
    
    lines.push('# HELP tburn_shedder_total_shed_requests Total requests shed');
    lines.push('# TYPE tburn_shedder_total_shed_requests counter');
    lines.push(`tburn_shedder_total_shed_requests ${m.totalSheddedRequests}`);
    
    lines.push('# HELP tburn_shedder_cached_responses_served Total cached responses served');
    lines.push('# TYPE tburn_shedder_cached_responses_served counter');
    lines.push(`tburn_shedder_cached_responses_served ${m.cachedResponsesServed}`);
    
    lines.push('# HELP tburn_shedder_cache_hit_rate Cache hit rate percentage');
    lines.push('# TYPE tburn_shedder_cache_hit_rate gauge');
    lines.push(`tburn_shedder_cache_hit_rate ${m.cacheHitRate.toFixed(2)}`);
    
    lines.push('# HELP tburn_shedder_cache_size Current cache size');
    lines.push('# TYPE tburn_shedder_cache_size gauge');
    lines.push(`tburn_shedder_cache_size ${m.cacheSize}`);
    
    lines.push('# HELP tburn_shedder_degraded_mode_active Is degraded mode active');
    lines.push('# TYPE tburn_shedder_degraded_mode_active gauge');
    lines.push(`tburn_shedder_degraded_mode_active ${m.isDegradedMode ? 1 : 0}`);
    
    lines.push('# HELP tburn_shedder_degraded_mode_entries Total degraded mode entries');
    lines.push('# TYPE tburn_shedder_degraded_mode_entries counter');
    lines.push(`tburn_shedder_degraded_mode_entries ${m.degradedModeEntries}`);
    
    lines.push('# HELP tburn_shedder_backpressure_active Is backpressure active');
    lines.push('# TYPE tburn_shedder_backpressure_active gauge');
    lines.push(`tburn_shedder_backpressure_active ${m.backpressureActive ? 1 : 0}`);
    
    lines.push('# HELP tburn_shedder_requests_per_second Current requests per second');
    lines.push('# TYPE tburn_shedder_requests_per_second gauge');
    lines.push(`tburn_shedder_requests_per_second ${m.requestsPerSecond}`);
    
    lines.push('# HELP tburn_shedder_scaling_in_progress Is scaling in progress');
    lines.push('# TYPE tburn_shedder_scaling_in_progress gauge');
    lines.push(`tburn_shedder_scaling_in_progress ${m.isScalingInProgress ? 1 : 0}`);
    
    return lines.join('\n');
  }
  
  forceExitDegradedMode(): void {
    this.exitDegradedMode();
    console.log('[RequestShedder] 🔄 Degraded mode force-exited');
  }
  
  clearCache(): number {
    const size = this.responseCache.size;
    this.responseCache.clear();
    console.log(`[RequestShedder] 🗑️ Cache cleared (${size} entries)`);
    return size;
  }
  
  destroy(): void {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
    this.responseCache.clear();
    this.lagHistory = [];
    this.requestTimestamps = [];
    this.removeAllListeners();
  }
}

export const requestShedder = new RequestShedder();
