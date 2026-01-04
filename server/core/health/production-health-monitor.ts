/**
 * Production Health Monitor
 * 
 * Enterprise-grade health monitoring for 24/7 production stability:
 * - Event loop lag monitoring
 * - Memory pressure detection
 * - Session store health
 * - Auto-recovery triggers
 * - Health endpoints for Replit's deployment system
 * 
 * CRITICAL: This prevents "upstream request timeout" and "Internal Server Error"
 * by detecting problems early and enabling graceful degradation
 */

import { Request, Response, NextFunction, Router } from 'express';

// ============================================================================
// Health State
// ============================================================================

interface HealthState {
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  eventLoopLagMs: number;
  memoryUsageMb: number;
  memoryLimitMb: number;
  sessionStoreHealthy: boolean;
  sessionCount: number;
  uptime: number;
  errorCount5min: number;
  requestCount5min: number;
  avgResponseTimeMs: number;
}

interface ErrorTracking {
  timestamp: number;
  path: string;
  statusCode: number;
  message: string;
}

// ============================================================================
// Production Health Monitor Class
// ============================================================================

class ProductionHealthMonitor {
  private static instance: ProductionHealthMonitor;
  
  private isRunning = false;
  private checkInterval: NodeJS.Timeout | null = null;
  private eventLoopLagInterval: NodeJS.Timeout | null = null;
  
  private healthState: HealthState = {
    status: 'healthy',
    lastCheck: new Date(),
    eventLoopLagMs: 0,
    memoryUsageMb: 0,
    memoryLimitMb: 1536, // Default for Replit
    sessionStoreHealthy: true,
    sessionCount: 0,
    uptime: 0,
    errorCount5min: 0,
    requestCount5min: 0,
    avgResponseTimeMs: 0,
  };
  
  // Error tracking for 5-minute window
  private recentErrors: ErrorTracking[] = [];
  private recentResponseTimes: number[] = [];
  private requestCount = 0;
  
  // Thresholds
  private readonly EVENT_LOOP_LAG_WARNING_MS = 100;
  private readonly EVENT_LOOP_LAG_CRITICAL_MS = 500;
  // ★ [2026-01-04] Higher threshold during startup to prevent false alarms
  private readonly EVENT_LOOP_LAG_STARTUP_CRITICAL_MS = 5000; // 5 seconds during startup
  private readonly STARTUP_GRACE_PERIOD_MS = 60000; // 60 seconds startup grace period
  private readonly MEMORY_WARNING_PERCENT = 0.7;
  private readonly MEMORY_CRITICAL_PERCENT = 0.85;
  private readonly ERROR_RATE_WARNING = 0.05; // 5%
  private readonly ERROR_RATE_CRITICAL = 0.15; // 15%
  
  private lastEventLoopCheck = process.hrtime.bigint();
  private startTime = Date.now();
  
  private constructor() {}
  
  static getInstance(): ProductionHealthMonitor {
    if (!ProductionHealthMonitor.instance) {
      ProductionHealthMonitor.instance = new ProductionHealthMonitor();
    }
    return ProductionHealthMonitor.instance;
  }
  
  // ============================================================================
  // Lifecycle
  // ============================================================================
  
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    
    // Event loop lag monitoring (every 100ms)
    this.eventLoopLagInterval = setInterval(() => {
      this.measureEventLoopLag();
    }, 100);
    
    // Full health check (every 10 seconds)
    this.checkInterval = setInterval(() => {
      this.performHealthCheck();
    }, 10000);
    
    console.log('[HealthMonitor] ✅ Production health monitoring started');
    console.log('[HealthMonitor] 📊 Event loop lag check: 100ms, Full check: 10s');
  }
  
  stop(): void {
    if (this.eventLoopLagInterval) {
      clearInterval(this.eventLoopLagInterval);
      this.eventLoopLagInterval = null;
    }
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log('[HealthMonitor] Stopped');
  }
  
  // ============================================================================
  // Measurements
  // ============================================================================
  
  private measureEventLoopLag(): void {
    const now = process.hrtime.bigint();
    const expectedMs = 100;
    const actualMs = Number(now - this.lastEventLoopCheck) / 1_000_000;
    const lag = Math.max(0, actualMs - expectedMs);
    
    this.healthState.eventLoopLagMs = lag;
    this.lastEventLoopCheck = now;
    
    // ★ [2026-01-04] Use higher threshold during startup to prevent false alarms
    const timeSinceStart = Date.now() - this.startTime;
    const isStartupPhase = timeSinceStart < this.STARTUP_GRACE_PERIOD_MS;
    const criticalThreshold = isStartupPhase 
      ? this.EVENT_LOOP_LAG_STARTUP_CRITICAL_MS 
      : this.EVENT_LOOP_LAG_CRITICAL_MS;
    
    // Log critical event loop lag (suppressed during startup grace period)
    if (lag > criticalThreshold) {
      if (isStartupPhase) {
        // During startup, only log if truly catastrophic (>5s)
        console.warn(`[HealthMonitor] ⚠️ Startup event loop lag: ${lag.toFixed(0)}ms (grace period: ${Math.ceil((this.STARTUP_GRACE_PERIOD_MS - timeSinceStart)/1000)}s remaining)`);
      } else {
        console.error(`[HealthMonitor] 🚨 CRITICAL event loop lag: ${lag.toFixed(0)}ms`);
      }
    }
  }
  
  private performHealthCheck(): void {
    const memory = process.memoryUsage();
    const heapUsedMb = memory.heapUsed / 1024 / 1024;
    
    this.healthState.memoryUsageMb = heapUsedMb;
    this.healthState.uptime = process.uptime();
    this.healthState.lastCheck = new Date();
    
    // Calculate 5-minute metrics
    const now = Date.now();
    const fiveMinAgo = now - 5 * 60 * 1000;
    
    this.recentErrors = this.recentErrors.filter(e => e.timestamp > fiveMinAgo);
    this.recentResponseTimes = this.recentResponseTimes.slice(-1000); // Keep last 1000
    
    this.healthState.errorCount5min = this.recentErrors.length;
    this.healthState.requestCount5min = this.requestCount;
    
    if (this.recentResponseTimes.length > 0) {
      this.healthState.avgResponseTimeMs = 
        this.recentResponseTimes.reduce((a, b) => a + b, 0) / this.recentResponseTimes.length;
    }
    
    // Determine overall status
    this.determineStatus();
    
    // Prune old data
    if (this.requestCount > 100000) {
      this.requestCount = 0;
    }
  }
  
  private determineStatus(): void {
    const memoryPercent = this.healthState.memoryUsageMb / this.healthState.memoryLimitMb;
    const errorRate = this.healthState.requestCount5min > 0 
      ? this.healthState.errorCount5min / this.healthState.requestCount5min 
      : 0;
    
    // Critical conditions
    if (
      this.healthState.eventLoopLagMs > this.EVENT_LOOP_LAG_CRITICAL_MS ||
      memoryPercent > this.MEMORY_CRITICAL_PERCENT ||
      errorRate > this.ERROR_RATE_CRITICAL
    ) {
      this.healthState.status = 'unhealthy';
      return;
    }
    
    // Warning conditions
    if (
      this.healthState.eventLoopLagMs > this.EVENT_LOOP_LAG_WARNING_MS ||
      memoryPercent > this.MEMORY_WARNING_PERCENT ||
      errorRate > this.ERROR_RATE_WARNING
    ) {
      this.healthState.status = 'degraded';
      return;
    }
    
    this.healthState.status = 'healthy';
  }
  
  // ============================================================================
  // Request Tracking Middleware
  // ============================================================================
  
  trackRequest(): (req: Request, res: Response, next: NextFunction) => void {
    return (req, res, next) => {
      const start = Date.now();
      this.requestCount++;
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        this.recentResponseTimes.push(duration);
        
        // Track errors (5xx)
        if (res.statusCode >= 500) {
          this.recentErrors.push({
            timestamp: Date.now(),
            path: req.path,
            statusCode: res.statusCode,
            message: res.statusMessage || 'Server Error',
          });
        }
      });
      
      next();
    };
  }
  
  // ============================================================================
  // Health Endpoints
  // ============================================================================
  
  getRoutes(): Router {
    const router = Router();
    
    // Basic health check (for Replit's deployment system)
    router.get('/health', (req, res) => {
      const state = this.healthState;
      
      // Return 503 if unhealthy (triggers Replit restart)
      if (state.status === 'unhealthy') {
        return res.status(503).json({
          status: 'unhealthy',
          reason: this.getUnhealthyReason(),
          timestamp: new Date().toISOString(),
        });
      }
      
      res.json({
        status: state.status,
        uptime: Math.floor(state.uptime),
        timestamp: new Date().toISOString(),
      });
    });
    
    // Detailed health check (for monitoring dashboards)
    router.get('/health/detailed', (req, res) => {
      res.json({
        success: true,
        data: {
          ...this.healthState,
          memoryPercent: (this.healthState.memoryUsageMb / this.healthState.memoryLimitMb * 100).toFixed(1),
          errorRate: this.healthState.requestCount5min > 0 
            ? (this.healthState.errorCount5min / this.healthState.requestCount5min * 100).toFixed(2)
            : '0.00',
          recentErrors: this.recentErrors.slice(-10),
        },
      });
    });
    
    // Liveness probe (for k8s-style health checks)
    router.get('/health/live', (req, res) => {
      res.status(200).json({ alive: true });
    });
    
    // Readiness probe (for traffic routing)
    router.get('/health/ready', (req, res) => {
      if (this.healthState.status === 'unhealthy') {
        return res.status(503).json({ ready: false, reason: this.getUnhealthyReason() });
      }
      res.status(200).json({ ready: true });
    });
    
    return router;
  }
  
  private getUnhealthyReason(): string {
    const reasons: string[] = [];
    
    if (this.healthState.eventLoopLagMs > this.EVENT_LOOP_LAG_CRITICAL_MS) {
      reasons.push(`event_loop_lag:${this.healthState.eventLoopLagMs.toFixed(0)}ms`);
    }
    
    const memoryPercent = this.healthState.memoryUsageMb / this.healthState.memoryLimitMb;
    if (memoryPercent > this.MEMORY_CRITICAL_PERCENT) {
      reasons.push(`memory:${(memoryPercent * 100).toFixed(1)}%`);
    }
    
    const errorRate = this.healthState.requestCount5min > 0 
      ? this.healthState.errorCount5min / this.healthState.requestCount5min 
      : 0;
    if (errorRate > this.ERROR_RATE_CRITICAL) {
      reasons.push(`error_rate:${(errorRate * 100).toFixed(1)}%`);
    }
    
    return reasons.join(', ') || 'unknown';
  }
  
  // ============================================================================
  // Status Getters
  // ============================================================================
  
  getStatus(): HealthState {
    return { ...this.healthState };
  }
  
  isHealthy(): boolean {
    return this.healthState.status === 'healthy';
  }
  
  setSessionStoreHealth(healthy: boolean, sessionCount: number): void {
    this.healthState.sessionStoreHealthy = healthy;
    this.healthState.sessionCount = sessionCount;
  }
  
  setMemoryLimit(limitMb: number): void {
    this.healthState.memoryLimitMb = limitMb;
  }
}

// Export singleton
export const healthMonitor = ProductionHealthMonitor.getInstance();
