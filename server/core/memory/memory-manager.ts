/**
 * TBURN Enterprise Memory Manager v6.0
 * 
 * Production-grade memory management with automatic GC,
 * emergency cleanup, and comprehensive monitoring
 * 
 * @version 6.0.0-enterprise
 */

import { EventEmitter } from 'events';
import { METRICS_CONFIG } from './metrics-config';
import { metricsAggregator } from './metrics-aggregator';
import { blockMemoryManager } from './block-memory-manager';

export interface MemoryConfig {
  maxHeapMB: number;
  gcThreshold: number;
  criticalThreshold: number;
  emergencyThreshold: number;
  checkIntervalMs: number;
}

export interface MemoryMetrics {
  heapUsedMB: number;
  heapTotalMB: number;
  externalMB: number;
  rssMB: number;
  arrayBuffersMB: number;
  heapUsagePercent: number;
  state: 'normal' | 'warning' | 'critical' | 'emergency';
  lastGcAt: number | null;
  gcCount: number;
  emergencyCleanupCount: number;
  uptime: number;
}

export class MemoryManager extends EventEmitter {
  private config: MemoryConfig;
  private monitorTimer: NodeJS.Timeout | null = null;
  private isRunning = false;
  private startTime = Date.now();
  private lastGcTime: number | null = null;
  private gcCount = 0;
  private emergencyCleanupCount = 0;
  private consecutiveCriticalCount = 0;
  
  constructor(config?: Partial<MemoryConfig>) {
    super();
    
    this.config = {
      maxHeapMB: config?.maxHeapMB || 512, // Replit 환경
      gcThreshold: config?.gcThreshold || METRICS_CONFIG.GC_THRESHOLDS.TRIGGER,
      criticalThreshold: config?.criticalThreshold || METRICS_CONFIG.GC_THRESHOLDS.CRITICAL,
      emergencyThreshold: config?.emergencyThreshold || METRICS_CONFIG.GC_THRESHOLDS.EMERGENCY,
      checkIntervalMs: config?.checkIntervalMs || METRICS_CONFIG.MONITORING_INTERVAL,
    };
  }
  
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    
    this.monitorTimer = setInterval(
      () => this.checkMemory(),
      this.config.checkIntervalMs
    );
    
    console.log('[MemoryManager] Started with config:', {
      maxHeapMB: this.config.maxHeapMB,
      gcThreshold: `${this.config.gcThreshold * 100}%`,
      criticalThreshold: `${this.config.criticalThreshold * 100}%`,
      checkIntervalMs: this.config.checkIntervalMs,
    });
  }
  
  stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    
    if (this.monitorTimer) {
      clearInterval(this.monitorTimer);
      this.monitorTimer = null;
    }
    
    console.log('[MemoryManager] Stopped');
  }
  
  private checkMemory(): void {
    const usage = process.memoryUsage();
    const heapUsedMB = usage.heapUsed / 1024 / 1024;
    const heapTotalMB = usage.heapTotal / 1024 / 1024;
    const ratio = usage.heapUsed / usage.heapTotal;
    
    // 메트릭 기록
    metricsAggregator.record('memory.heap_used_mb', heapUsedMB);
    metricsAggregator.record('memory.heap_total_mb', heapTotalMB);
    metricsAggregator.record('memory.heap_usage_percent', ratio * 100);
    
    // 상태 결정 및 조치
    if (ratio > this.config.emergencyThreshold) {
      this.consecutiveCriticalCount++;
      console.error(
        `[MemoryManager] EMERGENCY - Heap: ${heapUsedMB.toFixed(0)}MB / ` +
        `${heapTotalMB.toFixed(0)}MB (${(ratio * 100).toFixed(1)}%)`
      );
      this.emergencyCleanup();
      this.emit('emergency', { heapUsedMB, heapTotalMB, ratio });
    } else if (ratio > this.config.criticalThreshold) {
      this.consecutiveCriticalCount++;
      console.warn(
        `[MemoryManager] CRITICAL - Heap: ${heapUsedMB.toFixed(0)}MB / ` +
        `${heapTotalMB.toFixed(0)}MB (${(ratio * 100).toFixed(1)}%)`
      );
      this.aggressiveCleanup();
      this.emit('critical', { heapUsedMB, heapTotalMB, ratio });
    } else if (ratio > this.config.gcThreshold) {
      this.consecutiveCriticalCount = 0;
      console.log(
        `[MemoryManager] WARNING - Triggering GC, Heap: ${heapUsedMB.toFixed(0)}MB ` +
        `(${(ratio * 100).toFixed(1)}%)`
      );
      this.triggerGC();
      this.emit('warning', { heapUsedMB, heapTotalMB, ratio });
    } else {
      this.consecutiveCriticalCount = 0;
    }
    
    // 연속 5회 이상 critical 상태면 추가 경고
    if (this.consecutiveCriticalCount >= 5) {
      console.error(
        '[MemoryManager] Memory consistently critical - consider process restart'
      );
      this.emit('persistentCritical', { 
        consecutiveCount: this.consecutiveCriticalCount,
        heapUsedMB,
        heapTotalMB,
      });
    }
  }
  
  private triggerGC(): void {
    if (typeof global.gc === 'function') {
      global.gc();
      this.lastGcTime = Date.now();
      this.gcCount++;
    }
  }
  
  private aggressiveCleanup(): void {
    // 1. 블록 캐시 일부 정리
    blockMemoryManager.evictOldBlocks();
    
    // 2. GC 트리거
    this.triggerGC();
    
    // 3. 100ms 후 다시 GC
    setTimeout(() => {
      if (typeof global.gc === 'function') {
        global.gc();
      }
    }, 100);
  }
  
  private emergencyCleanup(): void {
    this.emergencyCleanupCount++;
    
    // 1. 모든 캐시 정리
    blockMemoryManager.clear();
    metricsAggregator.forceCleanup();
    
    // 2. 강제 GC 다중 실행
    if (typeof global.gc === 'function') {
      global.gc();
      setTimeout(() => global.gc!(), 100);
      setTimeout(() => global.gc!(), 500);
      setTimeout(() => global.gc!(), 1000);
    }
    
    // 3. 5초 후 상태 확인
    setTimeout(() => {
      const usage = process.memoryUsage();
      const ratio = usage.heapUsed / usage.heapTotal;
      
      if (ratio > this.config.emergencyThreshold) {
        console.error(
          '[MemoryManager] Still emergency after cleanup - ' +
          `${(ratio * 100).toFixed(1)}%`
        );
        this.emit('cleanupFailed', { ratio });
      } else {
        console.log(
          '[MemoryManager] Emergency cleanup successful - ' +
          `${(ratio * 100).toFixed(1)}%`
        );
        this.emit('cleanupSuccess', { ratio });
      }
    }, 5000);
  }
  
  forceCleanup(): void {
    console.log('[MemoryManager] Force cleanup requested');
    this.emergencyCleanup();
  }
  
  getMetrics(): MemoryMetrics {
    const usage = process.memoryUsage();
    const heapUsedMB = usage.heapUsed / 1024 / 1024;
    const heapTotalMB = usage.heapTotal / 1024 / 1024;
    const ratio = usage.heapUsed / usage.heapTotal;
    
    let state: MemoryMetrics['state'] = 'normal';
    if (ratio > this.config.emergencyThreshold) state = 'emergency';
    else if (ratio > this.config.criticalThreshold) state = 'critical';
    else if (ratio > this.config.gcThreshold) state = 'warning';
    
    return {
      heapUsedMB,
      heapTotalMB,
      externalMB: usage.external / 1024 / 1024,
      rssMB: usage.rss / 1024 / 1024,
      arrayBuffersMB: usage.arrayBuffers / 1024 / 1024,
      heapUsagePercent: ratio * 100,
      state,
      lastGcAt: this.lastGcTime,
      gcCount: this.gcCount,
      emergencyCleanupCount: this.emergencyCleanupCount,
      uptime: Date.now() - this.startTime,
    };
  }
  
  getPrometheusMetrics(): string {
    const m = this.getMetrics();
    
    return [
      `# HELP tburn_memory_heap_used_bytes Heap memory used in bytes`,
      `# TYPE tburn_memory_heap_used_bytes gauge`,
      `tburn_memory_heap_used_bytes ${m.heapUsedMB * 1024 * 1024}`,
      ``,
      `# HELP tburn_memory_heap_total_bytes Total heap memory in bytes`,
      `# TYPE tburn_memory_heap_total_bytes gauge`,
      `tburn_memory_heap_total_bytes ${m.heapTotalMB * 1024 * 1024}`,
      ``,
      `# HELP tburn_memory_heap_usage_percent Heap usage percentage`,
      `# TYPE tburn_memory_heap_usage_percent gauge`,
      `tburn_memory_heap_usage_percent ${m.heapUsagePercent}`,
      ``,
      `# HELP tburn_memory_gc_count Total GC invocations`,
      `# TYPE tburn_memory_gc_count counter`,
      `tburn_memory_gc_count ${m.gcCount}`,
      ``,
      `# HELP tburn_memory_emergency_cleanup_count Emergency cleanup invocations`,
      `# TYPE tburn_memory_emergency_cleanup_count counter`,
      `tburn_memory_emergency_cleanup_count ${m.emergencyCleanupCount}`,
    ].join('\n');
  }
}

// 싱글톤 인스턴스
export const memoryManager = new MemoryManager();
