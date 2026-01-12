/**
 * Enterprise Disaster Recovery Manager v3.0.0
 * 
 * Purpose: 24/7/365 무중단 운영을 위한 엔터프라이즈급 재해 복구 시스템
 * 
 * Features:
 * - Memory monitoring with V8 heap statistics
 * - Request/error rate tracking
 * - Response time monitoring
 * - Automatic emergency handling
 * - Graceful shutdown/restart
 * - Signal handlers (SIGTERM, SIGINT)
 * - ★ [v3.0] Enterprise Session Protection
 * - ★ [v3.0] Proactive MemoryStore overflow prevention
 * - ★ [v3.0] Session metrics integration
 * 
 * v3.0.0 Changes:
 * - Enterprise session protection with proactive cleanup
 * - MemoryStore overflow prevention
 * - Session metrics integration
 * - Enhanced memory relief with session-aware cleanup
 * - Auto-restart disabled to prevent loops
 */

import { EventEmitter } from 'events';
import { Request, Response, NextFunction } from 'express';
import { METRICS_CONFIG } from '../memory/metrics-config';
import { 
  forceClearAllSessions, 
  emergencySessionCleanup,
  getSessionMetrics,
  setSessionStore 
} from '../sessions/session-bypass';

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
  // ★ [v3.0] Session protection settings
  sessionProtection: {
    enabled: boolean;
    maxSessions: number;
    warningThreshold: number;      // % of max sessions
    criticalThreshold: number;     // % of max sessions  
    emergencyThreshold: number;    // % of max sessions
    proactiveCleanupInterval: number; // ms
  };
}

const DEFAULT_CONFIG: DisasterRecoveryConfig = {
  memoryThresholds: {
    warning: 0.50,     // ★ [v3.1] 50%에서 경고 시작 (메모리 여유 확보)
    critical: 0.65,    // ★ [v3.1] 65%에서 위험 (더 일찍 정리)
    emergency: 0.80,   // ★ [v3.1] 80%에서 긴급 (크래시 방지)
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
  healthCheckInterval: 60000,  // ★ [v3.1] 60초로 늘림 (오버헤드 감소)
  recovery: {
    autoRestart: true,  // ★ [v4.0] RE-ENABLED with loop prevention
    gracefulShutdownTimeout: 5000,
  },
  // ★ [v3.0] Enterprise session protection
  sessionProtection: {
    enabled: true,
    maxSessions: 5000,           // ★ [v3.1] 5000으로 축소 (메모리 절약)
    warningThreshold: 0.50,      // ★ [v3.1] 50% - start warning
    criticalThreshold: 0.70,     // ★ [v3.1] 70% - emergency cleanup
    emergencyThreshold: 0.85,    // ★ [v3.1] 85% - full clear
    proactiveCleanupInterval: 120000, // ★ [v3.1] 2분으로 늘림
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

// ★ [v4.0] Restart loop prevention - tracks restart attempts (global singleton)
const RESTART_LOOP_PREVENTION = {
  maxRestartsPerWindow: 3,    // Maximum restarts allowed
  windowMs: 300000,           // 5 minute window
  restartTimes: [] as number[],
  lastRestartAttempt: 0,
  handlersRegistered: false,  // ★ [v4.1] Prevent duplicate handler registration
};

class DisasterRecoveryManager extends EventEmitter {
  private config: DisasterRecoveryConfig;
  private metrics: Metrics;
  private checkInterval: NodeJS.Timeout | null = null;
  private sessionCheckInterval: NodeJS.Timeout | null = null;
  private isShuttingDown: boolean = false;
  private startTime: number;
  
  // ★ [v3.0] Session store reference for direct cleanup
  private sessionStoreRef: any = null;
  private sessionCleanupCount: number = 0;
  private lastSessionCleanup: number = 0;
  
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
    
    // ★ [v4.0] Setup uncaughtException and unhandledRejection handlers
    this.setupCrashHandlers();
  }
  
  /**
   * ★ [v4.0] Check if restart is allowed (loop prevention)
   */
  private canRestart(): boolean {
    const now = Date.now();
    
    // Clean up old restart times outside the window
    RESTART_LOOP_PREVENTION.restartTimes = RESTART_LOOP_PREVENTION.restartTimes.filter(
      time => now - time < RESTART_LOOP_PREVENTION.windowMs
    );
    
    // Check if we've exceeded the restart limit
    if (RESTART_LOOP_PREVENTION.restartTimes.length >= RESTART_LOOP_PREVENTION.maxRestartsPerWindow) {
      console.error(`[DR] ⚠️ Restart loop detected: ${RESTART_LOOP_PREVENTION.restartTimes.length} restarts in ${RESTART_LOOP_PREVENTION.windowMs / 60000} minutes`);
      console.error('[DR] ⚠️ Entering degraded mode instead of restart to prevent loop');
      return false;
    }
    
    return true;
  }
  
  /**
   * ★ [v4.0] Record a restart attempt
   */
  private recordRestartAttempt(): void {
    RESTART_LOOP_PREVENTION.restartTimes.push(Date.now());
    RESTART_LOOP_PREVENTION.lastRestartAttempt = Date.now();
  }
  
  /**
   * ★ [v4.0] Setup crash handlers for uncaughtException and unhandledRejection
   * ★ [v4.1] Idempotent - only registers once globally
   */
  private setupCrashHandlers(): void {
    // ★ [v4.1] Prevent duplicate handler registration across hot reloads
    if (RESTART_LOOP_PREVENTION.handlersRegistered) {
      console.log('[DR] Crash handlers already registered (skipping duplicate)');
      return;
    }
    RESTART_LOOP_PREVENTION.handlersRegistered = true;
    
    // Store reference to current instance for handler callbacks
    const manager = this;
    
    // Handle uncaught exceptions - prevent complete crash
    process.on('uncaughtException', (error) => {
      const message = error?.message || String(error);
      
      // ★ [v4.2] Neon serverless WebSocket errors are recoverable - don't restart
      const neonRecoverablePatterns = [
        'Cannot set property message of',
        'ErrorEvent',
        '_connectionCallback',
        '_handleErrorWhileConnecting',
        'neon',
        'serverless',
      ];
      const isNeonRecoverable = neonRecoverablePatterns.some(pattern => 
        message.includes(pattern) || (error.stack && error.stack.includes(pattern))
      );
      
      if (isNeonRecoverable) {
        console.warn(`[DR] ⚠️ Neon connection error (recoverable): ${message.substring(0, 100)}`);
        console.warn('[DR] Database will auto-reconnect on next query');
        return; // Don't restart for Neon connection errors
      }
      
      console.error('[DR] ⚠️ UNCAUGHT EXCEPTION - Attempting recovery');
      console.error('[DR] Error:', message);
      console.error('[DR] Stack:', error.stack);
      
      // Try emergency memory relief first
      try {
        manager.emergencyMemoryRelief();
      } catch (e) {
        console.error('[DR] Emergency relief failed:', e);
      }
      
      // Check if we should restart or stay in degraded mode
      // ★ [v4.1] gracefulRestart now handles all restart gating internally
      if (manager.config.recovery.autoRestart) {
        console.log('[DR] Initiating graceful restart after exception...');
        manager.gracefulRestart();
      } else {
        console.log('[DR] Staying alive in degraded mode (auto-restart disabled)');
        manager.emit('degradedMode', 'uncaughtException');
      }
    });
    
    // Handle unhandled promise rejections - prevent complete crash  
    process.on('unhandledRejection', (reason: any) => {
      const message = reason?.message || String(reason);
      
      // Some rejections are recoverable (network errors, timeouts, etc.)
      const recoverablePatterns = ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET', 'socket hang up'];
      const isRecoverable = recoverablePatterns.some(pattern => message.includes(pattern));
      
      if (isRecoverable) {
        console.warn(`[DR] ⚠️ Recoverable rejection: ${message.substring(0, 100)}`);
        return; // Don't restart for recoverable errors
      }
      
      console.error('[DR] ⚠️ UNHANDLED REJECTION - Attempting recovery');
      console.error('[DR] Reason:', message);
      
      // Try emergency cleanup
      try {
        manager.emergencyMemoryRelief();
      } catch (e) {
        console.error('[DR] Emergency relief failed:', e);
      }
      
      // Most unhandled rejections shouldn't require restart
      manager.emit('degradedMode', 'unhandledRejection');
    });
    
    console.log('[DR] ✅ Crash handlers registered (auto-recovery enabled)');
  }
  
  /**
   * ★ [v3.0] Set session store reference for direct cleanup
   */
  setSessionStore(store: any): void {
    this.sessionStoreRef = store;
    setSessionStore(store); // Also set in session-bypass module
    console.log('[DR] Session store registered for disaster recovery');
  }
  
  /**
   * ★ [v3.0] Get session store reference
   */
  getSessionStore(): any {
    return this.sessionStoreRef;
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
    
    // ★ [v3.0] Start proactive session protection monitoring
    if (this.config.sessionProtection.enabled) {
      this.startSessionProtection();
    }
    
    this.setupMemoryMonitoring();
    this.setupSignalHandlers();
    
    this.emit('started');
  }
  
  /**
   * ★ [v3.0] Start proactive session protection monitoring
   */
  private startSessionProtection(): void {
    if (this.sessionCheckInterval) {
      return;
    }
    
    console.log('[DR] Starting proactive session protection...');
    
    this.sessionCheckInterval = setInterval(() => {
      this.performSessionHealthCheck();
    }, this.config.sessionProtection.proactiveCleanupInterval);
    
    console.log(`[DR] Session protection started (interval: ${this.config.sessionProtection.proactiveCleanupInterval}ms)`);
  }
  
  /**
   * ★ [v3.0] Perform session health check and proactive cleanup
   */
  private performSessionHealthCheck(): void {
    if (!this.sessionStoreRef) {
      return;
    }
    
    try {
      // Get current session count
      const sessionMetrics = getSessionMetrics();
      const currentSessions = sessionMetrics.activeSessions || this.getSessionCount();
      const maxSessions = this.config.sessionProtection.maxSessions;
      const usageRatio = currentSessions / maxSessions;
      
      // Update metrics
      this.emit('sessionCheck', {
        currentSessions,
        maxSessions,
        usageRatio,
        skipRatio: sessionMetrics.skipRatio,
      });
      
      // Proactive cleanup based on thresholds
      if (usageRatio >= this.config.sessionProtection.emergencyThreshold) {
        console.error(`[DR] 🚨 SESSION EMERGENCY: ${(usageRatio * 100).toFixed(1)}% capacity - clearing all sessions`);
        this.performEmergencySessionClear();
      } else if (usageRatio >= this.config.sessionProtection.criticalThreshold) {
        console.warn(`[DR] ⚠️ SESSION CRITICAL: ${(usageRatio * 100).toFixed(1)}% capacity - cleaning 50%`);
        this.performSessionCleanup(0.5);
      } else if (usageRatio >= this.config.sessionProtection.warningThreshold) {
        console.log(`[DR] SESSION WARNING: ${(usageRatio * 100).toFixed(1)}% capacity - cleaning 30%`);
        this.performSessionCleanup(0.3);
      }
      
      // Log session skip ratio for monitoring
      if (sessionMetrics.skipRatio < 0.8 && sessionMetrics.totalRequests > 100) {
        console.warn(`[DR] ⚠️ Low session skip ratio: ${(sessionMetrics.skipRatio * 100).toFixed(1)}% - target is ≥80%`);
      }
      
    } catch (e) {
      console.error('[DR] Session health check failed:', e);
    }
  }
  
  /**
   * ★ [v3.0] Get current session count from store
   */
  private getSessionCount(): number {
    if (!this.sessionStoreRef) return 0;
    
    try {
      // Try LRU cache itemCount (memorystore)
      const store = (this.sessionStoreRef as any).store;
      if (store && typeof store.itemCount === 'number') {
        return store.itemCount;
      }
      
      // Try sessions object (express-session default MemoryStore)
      const sessions = (this.sessionStoreRef as any).sessions;
      if (sessions && typeof sessions === 'object') {
        return Object.keys(sessions).length;
      }
    } catch (e) {
      // Ignore errors
    }
    
    return 0;
  }
  
  /**
   * ★ [v3.0] Perform proactive session cleanup
   */
  private performSessionCleanup(targetPercentage: number): void {
    const now = Date.now();
    
    // Rate limit cleanup (minimum 30 seconds between cleanups)
    if (now - this.lastSessionCleanup < 30000) {
      return;
    }
    
    this.lastSessionCleanup = now;
    this.sessionCleanupCount++;
    
    console.log(`[DR] Performing session cleanup #${this.sessionCleanupCount} (target: ${(targetPercentage * 100).toFixed(0)}%)`);
    
    try {
      const cleaned = emergencySessionCleanup(targetPercentage);
      console.log(`[DR] Session cleanup complete: ${cleaned} sessions removed`);
      this.emit('sessionCleanup', { cleaned, targetPercentage });
    } catch (e) {
      console.error('[DR] Session cleanup failed:', e);
    }
  }
  
  /**
   * ★ [v3.0] Emergency: Clear all sessions
   */
  private performEmergencySessionClear(): void {
    console.error('[DR] 🔥 EMERGENCY SESSION CLEAR - clearing all sessions to prevent crash');
    
    try {
      forceClearAllSessions(this.sessionStoreRef);
      this.emit('emergencySessionClear');
      console.log('[DR] Emergency session clear complete');
    } catch (e) {
      console.error('[DR] Emergency session clear failed:', e);
    }
  }
  
  /**
   * Stop the disaster recovery monitoring
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    // ★ [v3.0] Stop session protection
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
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
    // ★ [2026-01-08] V8 힙 제한 사용
    const heapLimitBytes = (METRICS_CONFIG.HARDWARE.V8_HEAP_LIMIT_MB || 8240) * 1024 * 1024;
    const heapPercent = mem.heapUsed / heapLimitBytes;
    
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
    
    // ★ [2026-01-08] V8 힙 제한 사용 (표시용)
    const heapLimitMB = METRICS_CONFIG.HARDWARE.V8_HEAP_LIMIT_MB || 8240;
    
    return {
      status,
      uptime: Math.round((Date.now() - this.startTime) / 1000),
      memory: {
        heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
        heapTotal: Math.round(heapLimitMB),
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
    
    // ★ [v4.1] Auto-restart with loop prevention handled inside gracefulRestart
    if (this.config.recovery.autoRestart && !this.isShuttingDown) {
      console.log('[DR] Initiating graceful restart...');
      this.gracefulRestart(); // Loop prevention handled internally
    }
  }
  
  /**
   * ★ [v3.0] Aggressive memory relief without --expose-gc
   * Enhanced with direct session cleanup
   */
  private emergencyMemoryRelief(): void {
    console.log('[DR] ⚡ Starting emergency memory relief...');
    
    // Stage 1: Clear all managed intervals/timeouts
    const clearedIntervals = clearAllManagedIntervals();
    const clearedTimeouts = clearAllManagedTimeouts();
    console.log(`[DR] Cleared ${clearedIntervals} intervals, ${clearedTimeouts} timeouts`);
    
    // Stage 2: Clear caches (will be implemented via event)
    console.log('[DR] Clearing all caches...');
    this.emit('clearCaches');
    
    // ★ [v3.0] Stage 3: Session preservation
    // IMPORTANT: Sessions are stored in Redis and don't affect server heap memory.
    // Clearing sessions breaks admin authentication and provides no memory benefit.
    // Skip session clearing to maintain user authentication state.
    console.log('[DR] Skipping session clear (stored in Redis, does not affect heap)');
    
    // Stage 4: Force V8 memory pressure via allocation/deallocation
    console.log('[DR] Triggering V8 memory pressure...');
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
      // Use let instead of const to allow reassignment
      for (let i = 0; i < 3; i++) {
        let temp: number[] | null = new Array(1024 * 1024).fill(0);
        // Immediately dereference
        temp = null;
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
   * ★ [v4.1] All restart gating handled internally for consistency
   */
  private gracefulRestart(): void {
    if (this.isShuttingDown) {
      console.log('[DR] Already shutting down, ignoring restart request');
      return;
    }
    
    // ★ [v4.1] Centralized restart gating - check and record here
    if (!this.canRestart()) {
      console.log('[DR] Restart blocked by loop prevention, entering degraded mode');
      this.emit('degradedMode', 'restartBlocked');
      return;
    }
    
    // Record this restart attempt
    this.recordRestartAttempt();
    
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
