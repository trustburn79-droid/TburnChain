/**
 * Disaster Recovery Manager v2.0.0
 * 
 * Purpose: 24/7/365 무중단 운영을 위한 재해 복구 시스템
 * 
 * Features:
 * - Memory monitoring with V8 heap statistics
 * - Request/error rate tracking
 * - Response time monitoring
 * - Automatic emergency handling
 * - Graceful shutdown/restart
 * - Signal handlers (SIGTERM, SIGINT)
 * 
 * v2.0.0 Changes:
 * - Enhanced memory relief without --expose-gc
 * - Aggressive cache clearing on emergency
 * - Interval/timer cleanup system
 * - Memory pressure trigger via large allocations
 * - Auto-restart enabled for production stability
 */

import { EventEmitter } from 'events';
import { Request, Response, NextFunction } from 'express';

// ============================================================================
// Configuration
// ============================================================================

interface DisasterRecoveryConfig {
  memoryThresholds: {
    warning: number;
    critical: number;
    emergency: number;
  };
  errorRateThresholds: {
    warning: number;
    critical: number;
    emergency: number;
  };
  responseTimeThresholds: {
    warning: number;
    critical: number;
    emergency: number;
  };
  healthCheckInterval: number;
  recovery: {
    autoRestart: boolean;
    gracefulShutdownTimeout: number;
  };
}

const DEFAULT_CONFIG: DisasterRecoveryConfig = {
  memoryThresholds: {
    warning: 0.70,
    critical: 0.85,
    emergency: 0.95,
  },
  errorRateThresholds: {
    warning: 0.01,    // 1%
    critical: 0.05,   // 5%
    emergency: 0.10,  // 10%
  },
  responseTimeThresholds: {
    warning: 1000,    // 1s
    critical: 3000,   // 3s
    emergency: 10000, // 10s
  },
  healthCheckInterval: 30000,  // 30 seconds
  recovery: {
    autoRestart: true,  // ★ [v2.0] ENABLED for production stability
    gracefulShutdownTimeout: 5000,
  },
};

// ★ [v2.0] Global registry for managed intervals/timers
const managedIntervals: Set<NodeJS.Timeout> = new Set();
const managedTimeouts: Set<NodeJS.Timeout> = new Set();

export function registerManagedInterval(interval: NodeJS.Timeout): void {
  managedIntervals.add(interval);
}

export function registerManagedTimeout(timeout: NodeJS.Timeout): void {
  managedTimeouts.add(timeout);
}

export function unregisterManagedInterval(interval: NodeJS.Timeout): void {
  managedIntervals.delete(interval);
}

export function clearAllManagedIntervals(): number {
  let cleared = 0;
  managedIntervals.forEach(interval => {
    clearInterval(interval);
    cleared++;
  });
  managedIntervals.clear();
  return cleared;
}

export function clearAllManagedTimeouts(): number {
  let cleared = 0;
  managedTimeouts.forEach(timeout => {
    clearTimeout(timeout);
    cleared++;
  });
  managedTimeouts.clear();
  return cleared;
}

// ============================================================================
// Metrics
// ============================================================================

interface Metrics {
  requestCount: number;
  errorCount: number;
  totalResponseTime: number;
  lastCheck: number;
}

type HealthStatus = 'healthy' | 'warning' | 'critical' | 'emergency';

// ============================================================================
// Disaster Recovery Manager
// ============================================================================

class DisasterRecoveryManager extends EventEmitter {
  private config: DisasterRecoveryConfig;
  private metrics: Metrics;
  private checkInterval: NodeJS.Timeout | null = null;
  private isShuttingDown: boolean = false;
  private startTime: number;
  
  constructor(config: Partial<DisasterRecoveryConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.metrics = {
      requestCount: 0,
      errorCount: 0,
      totalResponseTime: 0,
      lastCheck: Date.now(),
    };
    this.startTime = Date.now();
  }
  
  /**
   * Start the disaster recovery monitoring
   */
  start(): void {
    if (this.checkInterval) {
      return;
    }
    
    console.log('[DR] Disaster Recovery Manager started');
    
    this.checkInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval);
    
    this.setupMemoryMonitoring();
    this.setupSignalHandlers();
    
    this.emit('started');
  }
  
  /**
   * Stop the disaster recovery monitoring
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    console.log('[DR] Disaster Recovery Manager stopped');
    this.emit('stopped');
  }
  
  /**
   * Record a request for metrics
   */
  recordRequest(responseTime: number, isError: boolean): void {
    this.metrics.requestCount++;
    this.metrics.totalResponseTime += responseTime;
    
    if (isError) {
      this.metrics.errorCount++;
    }
  }
  
  /**
   * Get current health status
   */
  getHealthStatus(): {
    status: HealthStatus;
    uptime: number;
    memory: {
      heapUsed: number;
      heapTotal: number;
      heapPercent: number;
      rss: number;
    };
    requests: {
      total: number;
      errors: number;
      errorRate: number;
      avgResponseTime: number;
    };
    issues: string[];
  } {
    const mem = process.memoryUsage();
    const heapPercent = mem.heapUsed / mem.heapTotal;
    
    const requestCount = this.metrics.requestCount || 1;
    const errorRate = this.metrics.errorCount / requestCount;
    const avgResponseTime = this.metrics.totalResponseTime / requestCount;
    
    let status: HealthStatus = 'healthy';
    const issues: string[] = [];
    
    // Memory check
    if (heapPercent > this.config.memoryThresholds.emergency) {
      status = 'emergency';
      issues.push(`Memory EMERGENCY: ${(heapPercent * 100).toFixed(1)}%`);
    } else if (heapPercent > this.config.memoryThresholds.critical) {
      status = 'critical';
      issues.push(`Memory CRITICAL: ${(heapPercent * 100).toFixed(1)}%`);
    } else if (heapPercent > this.config.memoryThresholds.warning) {
      if (status === 'healthy') status = 'warning';
      issues.push(`Memory WARNING: ${(heapPercent * 100).toFixed(1)}%`);
    }
    
    // Error rate check
    if (errorRate > this.config.errorRateThresholds.emergency) {
      status = 'emergency';
      issues.push(`Error rate EMERGENCY: ${(errorRate * 100).toFixed(2)}%`);
    } else if (errorRate > this.config.errorRateThresholds.critical) {
      if (status !== 'emergency') status = 'critical';
      issues.push(`Error rate CRITICAL: ${(errorRate * 100).toFixed(2)}%`);
    }
    
    // Response time check
    if (avgResponseTime > this.config.responseTimeThresholds.emergency) {
      status = 'emergency';
      issues.push(`Response time EMERGENCY: ${avgResponseTime.toFixed(0)}ms`);
    } else if (avgResponseTime > this.config.responseTimeThresholds.critical) {
      if (status !== 'emergency') status = 'critical';
      issues.push(`Response time CRITICAL: ${avgResponseTime.toFixed(0)}ms`);
    }
    
    return {
      status,
      uptime: Math.round((Date.now() - this.startTime) / 1000),
      memory: {
        heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
        heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
        heapPercent: Math.round(heapPercent * 100),
        rss: Math.round(mem.rss / 1024 / 1024),
      },
      requests: {
        total: this.metrics.requestCount,
        errors: this.metrics.errorCount,
        errorRate: Math.round(errorRate * 10000) / 100,
        avgResponseTime: Math.round(avgResponseTime),
      },
      issues,
    };
  }
  
  /**
   * Perform periodic health check
   */
  private performHealthCheck(): void {
    const healthStatus = this.getHealthStatus();
    
    this.emit('healthCheck', healthStatus);
    
    if (healthStatus.status === 'emergency') {
      this.handleEmergency(healthStatus.issues);
    } else if (healthStatus.status === 'critical') {
      this.handleCritical(healthStatus.issues);
    }
    
    // Reset metrics after check
    this.metrics = {
      requestCount: 0,
      errorCount: 0,
      totalResponseTime: 0,
      lastCheck: Date.now(),
    };
  }
  
  /**
   * Handle emergency situation
   */
  private handleEmergency(issues: string[]): void {
    console.error('[DR] EMERGENCY DETECTED:', issues.join(', '));
    this.emit('emergency', issues);
    
    // ★ [v2.0] Aggressive memory relief - multiple stages
    this.emergencyMemoryRelief();
    
    // Force garbage collection if available
    this.tryGarbageCollection();
    
    // Auto-restart if enabled
    if (this.config.recovery.autoRestart && !this.isShuttingDown) {
      console.log('[DR] Initiating graceful restart...');
      this.gracefulRestart();
    }
  }
  
  /**
   * ★ [v2.0] Aggressive memory relief without --expose-gc
   */
  private emergencyMemoryRelief(): void {
    console.log('[DR] ⚡ Starting emergency memory relief...');
    
    // Stage 1: Clear all managed intervals/timeouts
    const clearedIntervals = clearAllManagedIntervals();
    const clearedTimeouts = clearAllManagedTimeouts();
    console.log(`[DR] Cleared ${clearedIntervals} intervals, ${clearedTimeouts} timeouts`);
    
    // Stage 2: Clear caches (will be implemented via event)
    this.emit('clearCaches');
    
    // Stage 3: Clear session store (will be implemented via event)
    this.emit('clearSessions');
    
    // Stage 4: Force V8 memory pressure via allocation/deallocation
    this.triggerV8MemoryPressure();
    
    console.log('[DR] ✅ Emergency memory relief complete');
  }
  
  /**
   * ★ [v2.0] Trigger V8 memory pressure without --expose-gc
   * Creates and immediately dereferences large allocations to trigger internal GC
   */
  private triggerV8MemoryPressure(): void {
    try {
      console.log('[DR] Triggering V8 memory pressure...');
      
      // Create then immediately discard large arrays to trigger V8's internal GC
      for (let i = 0; i < 3; i++) {
        const _temp = new Array(1024 * 1024).fill(0);
        // Immediately dereference
        (_temp as any) = null;
      }
      
      // Use setImmediate to allow V8 to schedule GC
      setImmediate(() => {
        // Empty callback - just gives V8 a chance to clean up
      });
      
    } catch (e) {
      console.warn('[DR] Memory pressure trigger failed:', e);
    }
  }
  
  /**
   * Handle critical situation
   */
  private handleCritical(issues: string[]): void {
    console.warn('[DR] CRITICAL DETECTED:', issues.join(', '));
    this.emit('critical', issues);
    
    // Try garbage collection
    this.tryGarbageCollection();
  }
  
  /**
   * Attempt garbage collection with graceful fallback
   * NOTE: Requires Node.js to be started with --expose-gc flag for gc() to be available
   */
  private gcWarningLogged = false;
  
  private tryGarbageCollection(): void {
    try {
      if (typeof global.gc === 'function') {
        console.log('[DR] Forcing garbage collection...');
        global.gc();
      } else if (!this.gcWarningLogged) {
        this.gcWarningLogged = true;
        console.log('[DR] ⚠️ global.gc() not available. Start Node.js with --expose-gc flag for emergency GC.');
        console.log('[DR] Using alternative memory relief: clearing caches and triggering V8 pressure...');
      }
    } catch (e) {
      if (!this.gcWarningLogged) {
        this.gcWarningLogged = true;
        console.log('[DR] ⚠️ gc() call failed. For production, start with: node --expose-gc server.js');
      }
    }
  }
  
  /**
   * Set up V8 heap monitoring
   */
  private setupMemoryMonitoring(): void {
    try {
      const v8 = require('v8');
      
      setInterval(() => {
        const heapStats = v8.getHeapStatistics();
        const usedHeapRatio = heapStats.used_heap_size / heapStats.heap_size_limit;
        
        if (usedHeapRatio > 0.90) {
          console.warn(`[DR] V8 heap usage: ${(usedHeapRatio * 100).toFixed(1)}%`);
          this.emit('memoryWarning', usedHeapRatio);
        }
      }, 30000);
    } catch (e) {
      console.log('[DR] V8 heap monitoring not available');
    }
  }
  
  /**
   * Set up process signal handlers
   */
  private setupSignalHandlers(): void {
    // Graceful shutdown on SIGTERM
    process.on('SIGTERM', () => {
      if (this.isShuttingDown) return;
      console.log('[DR] SIGTERM received, initiating graceful shutdown...');
      this.gracefulShutdown();
    });
    
    // Graceful shutdown on SIGINT
    process.on('SIGINT', () => {
      if (this.isShuttingDown) return;
      console.log('[DR] SIGINT received, initiating graceful shutdown...');
      this.gracefulShutdown();
    });
  }
  
  /**
   * Perform graceful shutdown
   */
  private gracefulShutdown(): void {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;
    
    this.emit('shutdown');
    
    console.log('[DR] Stopping new connections...');
    this.stop();
    
    // Wait for existing connections to complete
    setTimeout(() => {
      console.log('[DR] Shutdown complete');
      process.exit(0);
    }, this.config.recovery.gracefulShutdownTimeout);
  }
  
  /**
   * Perform graceful restart
   */
  private gracefulRestart(): void {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;
    
    this.emit('restart');
    
    console.log('[DR] Initiating restart...');
    
    // Exit with code 1 so process manager can restart
    setTimeout(() => {
      process.exit(1);
    }, this.config.recovery.gracefulShutdownTimeout);
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const disasterRecovery = new DisasterRecoveryManager();

// ============================================================================
// Express Middleware
// ============================================================================

export function disasterRecoveryMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      const isError = res.statusCode >= 500;
      disasterRecovery.recordRequest(responseTime, isError);
    });
    
    next();
  };
}

// ============================================================================
// Exports
// ============================================================================

export { DisasterRecoveryManager, DisasterRecoveryConfig, HealthStatus };
