/**
 * TBURN Enterprise Memory Manager v7.0
 * 
 * Production-grade memory management for 32GB enterprise environment
 * Features: Auto-scaling, heap snapshots, memory pooling, adaptive GC
 * 
 * @version 7.0.0-enterprise
 */

import { EventEmitter } from 'events';
import { METRICS_CONFIG, detectHardwareProfile } from './metrics-config';
import { metricsAggregator } from './metrics-aggregator';
import { blockMemoryManager } from './block-memory-manager';
import { crashDiagnostics } from '../monitoring/crash-diagnostics';
import * as fs from 'fs';
import * as path from 'path';

export interface MemoryConfig {
  maxHeapMB: number;
  targetHeapMB: number;
  gcThreshold: number;
  criticalThreshold: number;
  emergencyThreshold: number;
  checkIntervalMs: number;
  enableHeapSnapshot: boolean;
  enableMemoryPooling: boolean;
  adaptiveGC: boolean;
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
  heapGrowthRate: number;
  estimatedTimeToOOM: number | null;
  memoryPool: {
    enabled: boolean;
    allocated: number;
    available: number;
    utilization: number;
  };
}

export interface HeapSnapshot {
  timestamp: number;
  heapUsedMB: number;
  heapTotalMB: number;
  reason: string;
  filepath: string;
}

// 메모리 풀 객체 재사용
class MemoryPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private maxSize: number;
  private allocated = 0;
  
  constructor(factory: () => T, maxSize: number = 1000) {
    this.factory = factory;
    this.maxSize = maxSize;
  }
  
  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    this.allocated++;
    return this.factory();
  }
  
  release(item: T): void {
    if (this.pool.length < this.maxSize) {
      this.pool.push(item);
    }
  }
  
  clear(): void {
    this.pool = [];
  }
  
  getStats(): { poolSize: number; allocated: number; maxSize: number } {
    return {
      poolSize: this.pool.length,
      allocated: this.allocated,
      maxSize: this.maxSize,
    };
  }
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
  
  // 힙 성장 추적
  private heapHistory: Array<{ timestamp: number; heapUsedMB: number }> = [];
  private heapGrowthRate = 0;
  
  // 힙 스냅샷
  private snapshots: HeapSnapshot[] = [];
  private lastSnapshotTime = 0;
  
  // 메모리 풀
  private objectPool: MemoryPool<Record<string, any>>;
  private bufferPool: MemoryPool<Buffer>;
  
  constructor(config?: Partial<MemoryConfig>) {
    super();
    
    const hardware = detectHardwareProfile();
    const thresholds = METRICS_CONFIG.GC_THRESHOLDS;
    const heapConfig = METRICS_CONFIG.HEAP_SNAPSHOT;
    const poolConfig = METRICS_CONFIG.MEMORY_POOL;
    
    this.config = {
      maxHeapMB: config?.maxHeapMB || METRICS_CONFIG.HARDWARE.MAX_HEAP_GB * 1024,
      targetHeapMB: config?.targetHeapMB || METRICS_CONFIG.HARDWARE.TARGET_HEAP_GB * 1024,
      gcThreshold: config?.gcThreshold || thresholds.TRIGGER,
      criticalThreshold: config?.criticalThreshold || thresholds.CRITICAL,
      emergencyThreshold: config?.emergencyThreshold || thresholds.EMERGENCY,
      checkIntervalMs: config?.checkIntervalMs || METRICS_CONFIG.MONITORING_INTERVAL,
      enableHeapSnapshot: config?.enableHeapSnapshot ?? heapConfig.ENABLED,
      enableMemoryPooling: config?.enableMemoryPooling ?? poolConfig.ENABLED,
      adaptiveGC: config?.adaptiveGC ?? true,
    };
    
    // 메모리 풀 초기화
    this.objectPool = new MemoryPool(() => ({}), 10000);
    this.bufferPool = new MemoryPool(() => Buffer.alloc(1024), 1000);
    
    // 스냅샷 디렉토리 확인
    if (this.config.enableHeapSnapshot) {
      this.ensureSnapshotDir();
    }
    
    console.log('[MemoryManager] Initialized with hardware profile:', hardware.profile);
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
      targetHeapMB: this.config.targetHeapMB,
      gcThreshold: `${this.config.gcThreshold * 100}%`,
      criticalThreshold: `${this.config.criticalThreshold * 100}%`,
      checkIntervalMs: this.config.checkIntervalMs,
      adaptiveGC: this.config.adaptiveGC,
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
    const now = Date.now();
    
    // 힙 히스토리 업데이트
    this.heapHistory.push({ timestamp: now, heapUsedMB });
    if (this.heapHistory.length > 60) {
      this.heapHistory.shift();
    }
    
    // 성장률 계산
    this.calculateHeapGrowthRate();
    
    // 메트릭 기록
    metricsAggregator.record('memory.heap_used_mb', heapUsedMB);
    metricsAggregator.record('memory.heap_total_mb', heapTotalMB);
    metricsAggregator.record('memory.heap_usage_percent', ratio * 100);
    metricsAggregator.record('memory.rss_mb', usage.rss / 1024 / 1024);
    metricsAggregator.record('memory.external_mb', usage.external / 1024 / 1024);
    metricsAggregator.record('memory.growth_rate', this.heapGrowthRate);
    
    // 적응형 GC 임계값
    const effectiveGcThreshold = this.config.adaptiveGC 
      ? this.calculateAdaptiveThreshold(ratio)
      : this.config.gcThreshold;
    
    // 상태 결정 및 조치
    if (ratio > this.config.emergencyThreshold) {
      this.consecutiveCriticalCount++;
      console.error(
        `[MemoryManager] EMERGENCY - Heap: ${heapUsedMB.toFixed(0)}MB / ` +
        `${heapTotalMB.toFixed(0)}MB (${(ratio * 100).toFixed(1)}%)`
      );
      
      // CrashDiagnostics 연동: 긴급 상황 기록
      crashDiagnostics.handleMemoryWarning();
      crashDiagnostics.log(
        `EMERGENCY: Heap ${heapUsedMB.toFixed(0)}MB / ${heapTotalMB.toFixed(0)}MB (${(ratio * 100).toFixed(1)}%)`,
        'error'
      );
      
      this.emergencyCleanup();
      this.captureHeapSnapshot('emergency');
      this.emit('emergency', { heapUsedMB, heapTotalMB, ratio });
    } else if (ratio > this.config.criticalThreshold) {
      this.consecutiveCriticalCount++;
      console.warn(
        `[MemoryManager] CRITICAL - Heap: ${heapUsedMB.toFixed(0)}MB / ` +
        `${heapTotalMB.toFixed(0)}MB (${(ratio * 100).toFixed(1)}%)`
      );
      
      // CrashDiagnostics 연동: 위험 상황 기록
      crashDiagnostics.handleMemoryWarning();
      crashDiagnostics.log(
        `CRITICAL: Heap ${heapUsedMB.toFixed(0)}MB / ${heapTotalMB.toFixed(0)}MB (${(ratio * 100).toFixed(1)}%)`,
        'warn'
      );
      
      this.aggressiveCleanup();
      this.emit('critical', { heapUsedMB, heapTotalMB, ratio });
    } else if (ratio > effectiveGcThreshold) {
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
    
    // 연속 critical 경고
    if (this.consecutiveCriticalCount >= 5) {
      console.error(
        '[MemoryManager] Memory consistently critical - consider process restart'
      );
      this.emit('persistentCritical', { 
        consecutiveCount: this.consecutiveCriticalCount,
        heapUsedMB,
        heapTotalMB,
        estimatedTimeToOOM: this.estimateTimeToOOM(),
      });
    }
  }
  
  private calculateAdaptiveThreshold(currentRatio: number): number {
    // 성장률이 높으면 더 일찍 GC 트리거
    if (this.heapGrowthRate > 10) {
      return this.config.gcThreshold - 0.10; // 10% 더 일찍
    } else if (this.heapGrowthRate > 5) {
      return this.config.gcThreshold - 0.05; // 5% 더 일찍
    }
    return this.config.gcThreshold;
  }
  
  private calculateHeapGrowthRate(): void {
    if (this.heapHistory.length < 10) {
      this.heapGrowthRate = 0;
      return;
    }
    
    const recent = this.heapHistory.slice(-10);
    const first = recent[0];
    const last = recent[recent.length - 1];
    
    const timeDiffSec = (last.timestamp - first.timestamp) / 1000;
    const memDiffMB = last.heapUsedMB - first.heapUsedMB;
    
    this.heapGrowthRate = timeDiffSec > 0 ? (memDiffMB / timeDiffSec) * 60 : 0; // MB/min
  }
  
  private estimateTimeToOOM(): number | null {
    if (this.heapGrowthRate <= 0) return null;
    
    const currentHeap = this.heapHistory[this.heapHistory.length - 1]?.heapUsedMB || 0;
    const remainingMB = this.config.maxHeapMB - currentHeap;
    
    return remainingMB / this.heapGrowthRate; // minutes
  }
  
  private triggerGC(): void {
    if (typeof global.gc === 'function') {
      global.gc();
      this.lastGcTime = Date.now();
      this.gcCount++;
      metricsAggregator.record('memory.gc_triggered', 1);
    }
  }
  
  private aggressiveCleanup(): void {
    // 1. 블록 캐시 일부 정리
    blockMemoryManager.evictOldBlocks();
    
    // 2. 메모리 풀 정리
    if (this.config.enableMemoryPooling) {
      this.objectPool.clear();
      this.bufferPool.clear();
    }
    
    // 3. GC 트리거
    this.triggerGC();
    
    // 4. 100ms 후 다시 GC
    setTimeout(() => {
      if (typeof global.gc === 'function') {
        global.gc();
      }
    }, 100);
    
    metricsAggregator.record('memory.aggressive_cleanup', 1);
  }
  
  private emergencyCleanup(): void {
    this.emergencyCleanupCount++;
    
    // 1. 모든 캐시 정리
    blockMemoryManager.clear();
    metricsAggregator.forceCleanup();
    
    // 2. 메모리 풀 정리
    this.objectPool.clear();
    this.bufferPool.clear();
    
    // 3. 힙 히스토리 정리
    this.heapHistory = [];
    
    // 4. 강제 GC 다중 실행
    if (typeof global.gc === 'function') {
      global.gc();
      setTimeout(() => global.gc!(), 100);
      setTimeout(() => global.gc!(), 500);
      setTimeout(() => global.gc!(), 1000);
    }
    
    metricsAggregator.record('memory.emergency_cleanup', 1);
    
    // 5. 5초 후 상태 확인
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
  
  private ensureSnapshotDir(): void {
    const dir = METRICS_CONFIG.HEAP_SNAPSHOT.SNAPSHOT_DIR;
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    } catch (err) {
      console.warn('[MemoryManager] Could not create snapshot directory:', err);
    }
  }
  
  private captureHeapSnapshot(reason: string): void {
    if (!this.config.enableHeapSnapshot) return;
    
    const now = Date.now();
    const minInterval = METRICS_CONFIG.HEAP_SNAPSHOT.CAPTURE_INTERVAL_MIN;
    
    if (now - this.lastSnapshotTime < minInterval) {
      console.log('[MemoryManager] Skipping snapshot - too soon since last');
      return;
    }
    
    try {
      const usage = process.memoryUsage();
      const filepath = path.join(
        METRICS_CONFIG.HEAP_SNAPSHOT.SNAPSHOT_DIR,
        `heap-${now}-${reason}.json`
      );
      
      // 간단한 메모리 상태 저장 (V8 힙 스냅샷은 무거움)
      const snapshot: HeapSnapshot = {
        timestamp: now,
        heapUsedMB: usage.heapUsed / 1024 / 1024,
        heapTotalMB: usage.heapTotal / 1024 / 1024,
        reason,
        filepath,
      };
      
      fs.writeFileSync(filepath, JSON.stringify({
        ...snapshot,
        rss: usage.rss,
        external: usage.external,
        arrayBuffers: usage.arrayBuffers,
        heapHistory: this.heapHistory.slice(-10),
        gcCount: this.gcCount,
        emergencyCleanupCount: this.emergencyCleanupCount,
      }, null, 2));
      
      this.snapshots.push(snapshot);
      this.lastSnapshotTime = now;
      
      // 최대 스냅샷 수 유지
      while (this.snapshots.length > METRICS_CONFIG.HEAP_SNAPSHOT.MAX_SNAPSHOTS) {
        const old = this.snapshots.shift();
        if (old) {
          try {
            fs.unlinkSync(old.filepath);
          } catch {}
        }
      }
      
      console.log(`[MemoryManager] Heap snapshot saved: ${filepath}`);
    } catch (err) {
      console.warn('[MemoryManager] Could not save heap snapshot:', err);
    }
  }
  
  forceCleanup(): void {
    console.log('[MemoryManager] Force cleanup requested');
    this.emergencyCleanup();
  }
  
  // 메모리 풀 접근
  acquireObject(): Record<string, any> {
    return this.objectPool.acquire();
  }
  
  releaseObject(obj: Record<string, any>): void {
    // 객체 초기화
    for (const key of Object.keys(obj)) {
      delete obj[key];
    }
    this.objectPool.release(obj);
  }
  
  acquireBuffer(): Buffer {
    return this.bufferPool.acquire();
  }
  
  releaseBuffer(buf: Buffer): void {
    buf.fill(0);
    this.bufferPool.release(buf);
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
    
    const objectPoolStats = this.objectPool.getStats();
    const bufferPoolStats = this.bufferPool.getStats();
    
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
      heapGrowthRate: this.heapGrowthRate,
      estimatedTimeToOOM: this.estimateTimeToOOM(),
      memoryPool: {
        enabled: this.config.enableMemoryPooling,
        allocated: objectPoolStats.allocated + bufferPoolStats.allocated,
        available: objectPoolStats.poolSize + bufferPoolStats.poolSize,
        utilization: this.config.enableMemoryPooling 
          ? (objectPoolStats.poolSize + bufferPoolStats.poolSize) / 
            (objectPoolStats.maxSize + bufferPoolStats.maxSize)
          : 0,
      },
    };
  }
  
  getSnapshots(): HeapSnapshot[] {
    return [...this.snapshots];
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
      `# HELP tburn_memory_rss_bytes RSS memory in bytes`,
      `# TYPE tburn_memory_rss_bytes gauge`,
      `tburn_memory_rss_bytes ${m.rssMB * 1024 * 1024}`,
      ``,
      `# HELP tburn_memory_external_bytes External memory in bytes`,
      `# TYPE tburn_memory_external_bytes gauge`,
      `tburn_memory_external_bytes ${m.externalMB * 1024 * 1024}`,
      ``,
      `# HELP tburn_memory_gc_count Total GC invocations`,
      `# TYPE tburn_memory_gc_count counter`,
      `tburn_memory_gc_count ${m.gcCount}`,
      ``,
      `# HELP tburn_memory_emergency_cleanup_count Emergency cleanup invocations`,
      `# TYPE tburn_memory_emergency_cleanup_count counter`,
      `tburn_memory_emergency_cleanup_count ${m.emergencyCleanupCount}`,
      ``,
      `# HELP tburn_memory_growth_rate_mb_per_min Heap growth rate in MB/min`,
      `# TYPE tburn_memory_growth_rate_mb_per_min gauge`,
      `tburn_memory_growth_rate_mb_per_min ${m.heapGrowthRate.toFixed(2)}`,
      ``,
      `# HELP tburn_memory_time_to_oom_minutes Estimated time to OOM in minutes`,
      `# TYPE tburn_memory_time_to_oom_minutes gauge`,
      `tburn_memory_time_to_oom_minutes ${m.estimatedTimeToOOM?.toFixed(2) || -1}`,
      ``,
      `# HELP tburn_memory_pool_objects Pooled objects count`,
      `# TYPE tburn_memory_pool_objects gauge`,
      `tburn_memory_pool_objects ${m.memoryPool.available}`,
      ``,
      `# HELP tburn_memory_state Memory state (0=normal, 1=warning, 2=critical, 3=emergency)`,
      `# TYPE tburn_memory_state gauge`,
      `tburn_memory_state ${['normal', 'warning', 'critical', 'emergency'].indexOf(m.state)}`,
    ].join('\n');
  }
}

// 싱글톤 인스턴스
export const memoryManager = new MemoryManager();
