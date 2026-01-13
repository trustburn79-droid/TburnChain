import { blockPool, txPool } from '../utils/object-pool';
import { db } from '../db';
import { 
  memoryGuardianEvents, 
  memoryGuardianSlaSnapshots, 
  memoryGuardianTrends,
  objectPoolMetrics,
} from '@shared/schema';

// ============================================
// Enterprise Memory Guardian v2.0
// Production-grade memory management system
// with DB persistence
// ============================================

interface MemoryStatus {
  heapUsedMB: number;
  heapTotalMB: number;
  ratio: string;
  rss: number;
  external: number;
  arrayBuffers: number;
}

interface MemoryEvent {
  timestamp: number;
  type: 'check' | 'warning' | 'critical' | 'emergency' | 'cleanup' | 'gc' | 'recovery';
  level: 'info' | 'warn' | 'error' | 'critical';
  message: string;
  heapUsedMB: number;
  heapRatio: number;
  action?: string;
  freedMB?: number;
}

interface MemoryTrend {
  timestamp: number;
  heapUsedMB: number;
  heapTotalMB: number;
  rss: number;
  ratio: number;
}

interface MemoryGuardianConfig {
  checkInterval: number;
  warningThreshold: number;
  criticalThreshold: number;
  emergencyThreshold: number;
  maxHeapMB: number;
  targetHeapMB: number;
  historySize: number;
  trendWindowSize: number;
  adaptiveThresholds: boolean;
  slaTargetUptime: number;
}

interface CleanupStats {
  softCleanups: number;
  aggressiveCleanups: number;
  emergencyCleanups: number;
  gcTriggered: number;
  totalFreedMB: number;
  lastCleanupAt: number | null;
  lastCleanupType: string | null;
  cleanupDurations: number[];
}

interface AlertConfig {
  enabled: boolean;
  webhookUrl?: string;
  cooldownMs: number;
  lastAlertAt: number;
}

class MemoryGuardianEnterprise {
  // ★ [2026-01-08] V8 힙 제한 기반 동적 설정
  private static getV8HeapLimitMB(): number {
    try {
      const v8 = require('v8');
      const stats = v8.getHeapStatistics();
      return Math.floor(stats.heap_size_limit / (1024 * 1024));
    } catch {
      return 2048; // 기본값
    }
  }
  
  private readonly config: MemoryGuardianConfig = (() => {
    const v8HeapMB = MemoryGuardianEnterprise.getV8HeapLimitMB();
    const isReplit = Boolean(process.env.REPL_ID);
    
    // ★ [2026-01-13] Replit 환경에서는 실제 사용 가능한 메모리가 V8 제한보다 높음
    // V8 힙 제한이 낮게 설정되어 있어도 실제 메모리는 더 많이 사용 가능
    // 불필요한 정리 루프를 방지하기 위해 Replit에서는 더 높은 임계값 사용
    const effectiveMaxHeap = isReplit 
      ? Math.max(v8HeapMB * 0.9, 6000)  // Replit: 최소 6GB
      : Math.min(v8HeapMB * 0.9, 7500);
    
    return {
      checkInterval: isReplit ? 30 * 1000 : 10 * 1000,  // Replit: 30초 간격 (부하 감소)
      warningThreshold: 0.70,
      criticalThreshold: 0.85,
      emergencyThreshold: 0.92,
      maxHeapMB: effectiveMaxHeap,
      targetHeapMB: effectiveMaxHeap * 0.8,
      historySize: 360,
      trendWindowSize: 30,
      adaptiveThresholds: true,
      slaTargetUptime: 99.9,
    };
  })();

  private lastGC = Date.now();
  private consecutiveHighMemory = 0;
  private intervalId: NodeJS.Timeout | null = null;
  private isStarted = false;
  private startedAt: number | null = null;
  
  private cleanupCallbacks: Array<() => void> = [];
  private emergencyCallbacks: Array<() => void> = [];
  
  private eventHistory: MemoryEvent[] = [];
  private trendHistory: MemoryTrend[] = [];
  
  private cleanupStats: CleanupStats = {
    softCleanups: 0,
    aggressiveCleanups: 0,
    emergencyCleanups: 0,
    gcTriggered: 0,
    totalFreedMB: 0,
    lastCleanupAt: null,
    lastCleanupType: null,
    cleanupDurations: [],
  };

  private alertConfig: AlertConfig = {
    enabled: true,
    cooldownMs: 60000,
    lastAlertAt: 0,
  };

  // DB Persistence Configuration
  private dbPersistenceEnabled = true;
  private lastDbPersist = 0;
  private dbPersistInterval = 60 * 1000; // 1분마다 DB 저장
  private lastSlaPersist = 0;
  private slaPersistInterval = 60 * 60 * 1000; // 1시간마다 SLA 스냅샷
  private lastTrendPersist = 0;
  private trendPersistInterval = 5 * 60 * 1000; // 5분마다 트렌드 저장
  private lastPoolMetricsPersist = 0;
  private poolMetricsPersistInterval = 60 * 1000; // 1분마다 풀 메트릭 저장

  private slaMetrics = {
    totalChecks: 0,
    healthyChecks: 0,
    warningChecks: 0,
    criticalChecks: 0,
    emergencyChecks: 0,
    downtimeMs: 0,
    lastStateChange: Date.now(),
    currentState: 'healthy' as 'healthy' | 'warning' | 'critical' | 'emergency',
  };

  start(): void {
    if (this.isStarted) return;
    this.isStarted = true;
    this.startedAt = Date.now();
    this.intervalId = setInterval(() => this.check(), this.config.checkInterval);
    this.logEvent('info', 'check', 'Memory Guardian v2.0 Enterprise started');
    console.log('[MEMORY-GUARDIAN] ✅ Enterprise v2.0 started (interval: 10s, adaptive: enabled)');
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isStarted = false;
    this.logEvent('info', 'check', 'Memory Guardian stopped');
    console.log('[MEMORY-GUARDIAN] Stopped monitoring');
  }

  registerCleanupCallback(callback: () => void): void {
    this.cleanupCallbacks.push(callback);
  }

  registerEmergencyCallback(callback: () => void): void {
    this.emergencyCallbacks.push(callback);
  }

  private getMemoryStatus(): MemoryStatus {
    const usage = process.memoryUsage();
    const heapUsedMB = usage.heapUsed / 1024 / 1024;
    // ★ [2026-01-08] V8 힙 제한 사용 (표시용)
    const heapTotalMB = this.config.maxHeapMB;
    const ratio = usage.heapUsed / (this.config.maxHeapMB * 1024 * 1024);

    return {
      heapUsedMB: Math.round(heapUsedMB),
      heapTotalMB: Math.round(heapTotalMB),
      ratio: (ratio * 100).toFixed(1),
      rss: Math.round(usage.rss / 1024 / 1024),
      external: Math.round(usage.external / 1024 / 1024),
      arrayBuffers: Math.round(usage.arrayBuffers / 1024 / 1024),
    };
  }

  private logEvent(level: MemoryEvent['level'], type: MemoryEvent['type'], message: string, extra?: Partial<MemoryEvent>): void {
    const status = this.getMemoryStatus();
    const event: MemoryEvent = {
      timestamp: Date.now(),
      type,
      level,
      message,
      heapUsedMB: status.heapUsedMB,
      heapRatio: parseFloat(status.ratio),
      ...extra,
    };

    this.eventHistory.push(event);
    if (this.eventHistory.length > this.config.historySize) {
      this.eventHistory.shift();
    }
  }

  private recordTrend(): void {
    const status = this.getMemoryStatus();
    const trend: MemoryTrend = {
      timestamp: Date.now(),
      heapUsedMB: status.heapUsedMB,
      heapTotalMB: status.heapTotalMB,
      rss: status.rss,
      ratio: parseFloat(status.ratio),
    };

    this.trendHistory.push(trend);
    if (this.trendHistory.length > this.config.historySize) {
      this.trendHistory.shift();
    }
  }

  private check(): void {
    const usage = process.memoryUsage();
    const ratio = usage.heapUsed / (this.config.maxHeapMB * 1024 * 1024);
    const status = this.getMemoryStatus();

    this.recordTrend();
    this.slaMetrics.totalChecks++;

    const previousState = this.slaMetrics.currentState;

    if (ratio >= this.config.emergencyThreshold) {
      this.slaMetrics.emergencyChecks++;
      this.slaMetrics.currentState = 'emergency';
      this.handleEmergency(status);
    } else if (ratio >= this.config.criticalThreshold) {
      this.slaMetrics.criticalChecks++;
      this.slaMetrics.currentState = 'critical';
      this.handleCritical(status);
    } else if (ratio >= this.config.warningThreshold) {
      this.slaMetrics.warningChecks++;
      this.slaMetrics.currentState = 'warning';
      this.handleWarning(status);
    } else {
      this.slaMetrics.healthyChecks++;
      this.slaMetrics.currentState = 'healthy';
      this.consecutiveHighMemory = 0;
    }

    if (previousState !== this.slaMetrics.currentState) {
      if (previousState !== 'healthy' && this.slaMetrics.currentState === 'healthy') {
        this.logEvent('info', 'recovery', `Recovered from ${previousState} state`);
        this.persistEventToDB('recovery', 'info', previousState);
      } else {
        this.persistEventToDB('state_change', 
          this.slaMetrics.currentState === 'emergency' ? 'critical' : 
          this.slaMetrics.currentState === 'critical' ? 'error' : 'warn',
          previousState
        );
      }
      this.slaMetrics.lastStateChange = Date.now();
    }

    if (this.slaMetrics.currentState !== 'healthy') {
      this.slaMetrics.downtimeMs += this.config.checkInterval;
    }

    this.runPeriodicPersistence();
  }

  private handleWarning(status: MemoryStatus): void {
    console.warn(`[MEMORY-GUARDIAN] ⚠️ Warning: ${status.ratio}% (${status.heapUsedMB}MB / ${this.config.maxHeapMB}MB)`);
    this.logEvent('warn', 'warning', `Memory warning threshold reached: ${status.ratio}%`);
    this.softCleanup();
  }

  private handleCritical(status: MemoryStatus): void {
    console.error(`[MEMORY-GUARDIAN] 🔴 Critical: ${status.ratio}% (${status.heapUsedMB}MB / ${this.config.maxHeapMB}MB)`);
    this.logEvent('error', 'critical', `Memory critical threshold reached: ${status.ratio}%`);
    this.consecutiveHighMemory++;
    this.aggressiveCleanup();

    if (this.consecutiveHighMemory >= 3) {
      this.handleEmergency(status);
    }

    this.triggerAlert('critical', status);
  }

  private handleEmergency(status: MemoryStatus): void {
    console.error(`[MEMORY-GUARDIAN] 🚨 EMERGENCY: ${status.ratio}% (${status.heapUsedMB}MB / ${this.config.maxHeapMB}MB)`);
    this.logEvent('critical', 'emergency', `Memory emergency threshold reached: ${status.ratio}%`);
    this.emergencyCleanup();

    this.triggerAlert('emergency', status);

    setTimeout(() => {
      const newUsage = process.memoryUsage();
      const newRatio = newUsage.heapUsed / (this.config.maxHeapMB * 1024 * 1024);
      const freedMB = status.heapUsedMB - Math.round(newUsage.heapUsed / 1024 / 1024);

      if (newRatio >= this.config.emergencyThreshold) {
        console.error('[MEMORY-GUARDIAN] 🔄 Memory still critical after cleanup');
        this.logEvent('critical', 'emergency', 'Emergency cleanup failed to reduce memory', { freedMB });
      } else {
        console.log('[MEMORY-GUARDIAN] ✅ Emergency cleanup successful');
        this.logEvent('info', 'recovery', `Emergency cleanup successful, freed ${freedMB}MB`, { freedMB });
        this.consecutiveHighMemory = 0;
      }
    }, 5000);
  }

  private triggerAlert(severity: 'critical' | 'emergency', status: MemoryStatus): void {
    if (!this.alertConfig.enabled) return;
    if (Date.now() - this.alertConfig.lastAlertAt < this.alertConfig.cooldownMs) return;

    this.alertConfig.lastAlertAt = Date.now();
    console.log(`[MEMORY-GUARDIAN] 🔔 Alert triggered: ${severity} - ${status.ratio}%`);
  }

  private softCleanup(): void {
    const startTime = Date.now();
    const beforeMB = this.getMemoryStatus().heapUsedMB;

    blockPool.clear();
    txPool.clear();

    this.cleanupCallbacks.forEach(cb => {
      try { cb(); } catch (e) { console.error('[MEMORY-GUARDIAN] Cleanup callback error:', e); }
    });

    if (Date.now() - this.lastGC > 30000 && global.gc) {
      global.gc();
      this.lastGC = Date.now();
      this.cleanupStats.gcTriggered++;
      console.log('[MEMORY-GUARDIAN] Soft GC triggered');
    }

    const afterMB = this.getMemoryStatus().heapUsedMB;
    const freedMB = beforeMB - afterMB;
    const duration = Date.now() - startTime;

    this.cleanupStats.softCleanups++;
    this.cleanupStats.totalFreedMB += Math.max(0, freedMB);
    this.cleanupStats.lastCleanupAt = Date.now();
    this.cleanupStats.lastCleanupType = 'soft';
    this.cleanupStats.cleanupDurations.push(duration);
    if (this.cleanupStats.cleanupDurations.length > 100) {
      this.cleanupStats.cleanupDurations.shift();
    }

    this.logEvent('info', 'cleanup', `Soft cleanup completed`, { action: 'soft', freedMB });
    this.persistEventToDB('cleanup', 'info', undefined, 'soft', Math.max(0, freedMB), duration);
  }

  private aggressiveCleanup(): void {
    const startTime = Date.now();
    const beforeMB = this.getMemoryStatus().heapUsedMB;

    this.softCleanup();

    this.cleanupCallbacks.forEach(cb => {
      try { cb(); } catch (e) { console.error('[MEMORY-GUARDIAN] Cleanup callback error:', e); }
    });

    if (global.gc) {
      global.gc();
      this.lastGC = Date.now();
      this.cleanupStats.gcTriggered++;
      console.log('[MEMORY-GUARDIAN] Aggressive GC triggered');
    }

    const afterMB = this.getMemoryStatus().heapUsedMB;
    const freedMB = beforeMB - afterMB;
    const duration = Date.now() - startTime;

    this.cleanupStats.aggressiveCleanups++;
    this.cleanupStats.totalFreedMB += Math.max(0, freedMB);
    this.cleanupStats.lastCleanupAt = Date.now();
    this.cleanupStats.lastCleanupType = 'aggressive';
    this.cleanupStats.cleanupDurations.push(duration);
    if (this.cleanupStats.cleanupDurations.length > 100) {
      this.cleanupStats.cleanupDurations.shift();
    }

    this.logEvent('warn', 'cleanup', `Aggressive cleanup completed`, { action: 'aggressive', freedMB });
    this.persistEventToDB('cleanup', 'warn', undefined, 'aggressive', Math.max(0, freedMB), duration);
  }

  private emergencyCleanup(): void {
    const startTime = Date.now();
    const beforeMB = this.getMemoryStatus().heapUsedMB;

    console.log('[MEMORY-GUARDIAN] Executing emergency cleanup...');

    blockPool.clear();
    txPool.clear();

    this.emergencyCallbacks.forEach(cb => {
      try { cb(); } catch (e) { console.error('[MEMORY-GUARDIAN] Emergency callback error:', e); }
    });

    if (global.gc) {
      global.gc();
      setTimeout(() => { if (global.gc) global.gc(); }, 1000);
      setTimeout(() => { if (global.gc) global.gc(); }, 2000);
      this.lastGC = Date.now();
      this.cleanupStats.gcTriggered += 3;
      console.log('[MEMORY-GUARDIAN] Triple GC triggered');
    }

    const afterMB = this.getMemoryStatus().heapUsedMB;
    const freedMB = beforeMB - afterMB;
    const duration = Date.now() - startTime;

    this.cleanupStats.emergencyCleanups++;
    this.cleanupStats.totalFreedMB += Math.max(0, freedMB);
    this.cleanupStats.lastCleanupAt = Date.now();
    this.cleanupStats.lastCleanupType = 'emergency';
    this.cleanupStats.cleanupDurations.push(duration);
    if (this.cleanupStats.cleanupDurations.length > 100) {
      this.cleanupStats.cleanupDurations.shift();
    }

    this.logEvent('critical', 'cleanup', `Emergency cleanup completed`, { action: 'emergency', freedMB });
    this.persistEventToDB('cleanup', 'critical', undefined, 'emergency', Math.max(0, freedMB), duration);
  }

  getStatus(): {
    status: string;
    memory: MemoryStatus;
    consecutiveHighMemory: number;
    objectPools: { block: any; tx: any };
    uptime: number;
    cleanupStats: CleanupStats;
    sla: { uptimePercent: string; healthyPercent: string };
  } {
    const status = this.getMemoryStatus();
    const ratio = parseFloat(status.ratio) / 100;

    let statusLabel = 'healthy';
    if (ratio >= this.config.emergencyThreshold) {
      statusLabel = 'emergency';
    } else if (ratio >= this.config.criticalThreshold) {
      statusLabel = 'critical';
    } else if (ratio >= this.config.warningThreshold) {
      statusLabel = 'warning';
    }

    const uptime = this.startedAt ? Date.now() - this.startedAt : 0;
    const uptimePercent = uptime > 0 ? ((uptime - this.slaMetrics.downtimeMs) / uptime * 100).toFixed(3) : '100.000';
    const healthyPercent = this.slaMetrics.totalChecks > 0 
      ? (this.slaMetrics.healthyChecks / this.slaMetrics.totalChecks * 100).toFixed(2) 
      : '100.00';

    return {
      status: statusLabel,
      memory: status,
      consecutiveHighMemory: this.consecutiveHighMemory,
      objectPools: {
        block: blockPool.getStats(),
        tx: txPool.getStats(),
      },
      uptime,
      cleanupStats: this.cleanupStats,
      sla: {
        uptimePercent,
        healthyPercent,
      },
    };
  }

  getEventHistory(limit: number = 100): MemoryEvent[] {
    return this.eventHistory.slice(-limit);
  }

  getTrendHistory(limit: number = 60): MemoryTrend[] {
    return this.trendHistory.slice(-limit);
  }

  getTrendAnalysis(): {
    avgHeapMB: number;
    maxHeapMB: number;
    minHeapMB: number;
    growthRateMBPerMin: number;
    estimatedTimeToWarningMin: number | null;
    volatility: number;
  } {
    if (this.trendHistory.length < 2) {
      return {
        avgHeapMB: 0,
        maxHeapMB: 0,
        minHeapMB: 0,
        growthRateMBPerMin: 0,
        estimatedTimeToWarningMin: null,
        volatility: 0,
      };
    }

    const recentTrends = this.trendHistory.slice(-this.config.trendWindowSize);
    const heapValues = recentTrends.map(t => t.heapUsedMB);

    const avgHeapMB = heapValues.reduce((a, b) => a + b, 0) / heapValues.length;
    const maxHeapMB = Math.max(...heapValues);
    const minHeapMB = Math.min(...heapValues);

    const first = recentTrends[0];
    const last = recentTrends[recentTrends.length - 1];
    const timeDiffMin = (last.timestamp - first.timestamp) / 60000;
    const heapDiff = last.heapUsedMB - first.heapUsedMB;
    const growthRateMBPerMin = timeDiffMin > 0 ? heapDiff / timeDiffMin : 0;

    let estimatedTimeToWarningMin: number | null = null;
    if (growthRateMBPerMin > 0) {
      const warningThresholdMB = this.config.maxHeapMB * this.config.warningThreshold;
      const remaining = warningThresholdMB - last.heapUsedMB;
      if (remaining > 0) {
        estimatedTimeToWarningMin = remaining / growthRateMBPerMin;
      }
    }

    const variance = heapValues.reduce((sum, val) => sum + Math.pow(val - avgHeapMB, 2), 0) / heapValues.length;
    const volatility = Math.sqrt(variance);

    return {
      avgHeapMB: Math.round(avgHeapMB),
      maxHeapMB,
      minHeapMB,
      growthRateMBPerMin: Math.round(growthRateMBPerMin * 100) / 100,
      estimatedTimeToWarningMin: estimatedTimeToWarningMin ? Math.round(estimatedTimeToWarningMin) : null,
      volatility: Math.round(volatility * 100) / 100,
    };
  }

  getPrometheusMetrics(): string {
    const status = this.getMemoryStatus();
    const analysis = this.getTrendAnalysis();
    const uptime = this.startedAt ? Date.now() - this.startedAt : 0;

    const lines: string[] = [
      '# HELP tburn_memory_guardian_heap_used_mb Current heap memory used in MB',
      '# TYPE tburn_memory_guardian_heap_used_mb gauge',
      `tburn_memory_guardian_heap_used_mb ${status.heapUsedMB}`,
      '',
      '# HELP tburn_memory_guardian_heap_ratio Current heap usage ratio',
      '# TYPE tburn_memory_guardian_heap_ratio gauge',
      `tburn_memory_guardian_heap_ratio ${parseFloat(status.ratio) / 100}`,
      '',
      '# HELP tburn_memory_guardian_rss_mb Resident set size in MB',
      '# TYPE tburn_memory_guardian_rss_mb gauge',
      `tburn_memory_guardian_rss_mb ${status.rss}`,
      '',
      '# HELP tburn_memory_guardian_cleanup_total Total cleanup operations',
      '# TYPE tburn_memory_guardian_cleanup_total counter',
      `tburn_memory_guardian_cleanup_total{level="soft"} ${this.cleanupStats.softCleanups}`,
      `tburn_memory_guardian_cleanup_total{level="aggressive"} ${this.cleanupStats.aggressiveCleanups}`,
      `tburn_memory_guardian_cleanup_total{level="emergency"} ${this.cleanupStats.emergencyCleanups}`,
      '',
      '# HELP tburn_memory_guardian_gc_triggered_total Total GC triggers',
      '# TYPE tburn_memory_guardian_gc_triggered_total counter',
      `tburn_memory_guardian_gc_triggered_total ${this.cleanupStats.gcTriggered}`,
      '',
      '# HELP tburn_memory_guardian_freed_mb_total Total memory freed in MB',
      '# TYPE tburn_memory_guardian_freed_mb_total counter',
      `tburn_memory_guardian_freed_mb_total ${this.cleanupStats.totalFreedMB}`,
      '',
      '# HELP tburn_memory_guardian_sla_checks_total Total SLA checks by state',
      '# TYPE tburn_memory_guardian_sla_checks_total counter',
      `tburn_memory_guardian_sla_checks_total{state="healthy"} ${this.slaMetrics.healthyChecks}`,
      `tburn_memory_guardian_sla_checks_total{state="warning"} ${this.slaMetrics.warningChecks}`,
      `tburn_memory_guardian_sla_checks_total{state="critical"} ${this.slaMetrics.criticalChecks}`,
      `tburn_memory_guardian_sla_checks_total{state="emergency"} ${this.slaMetrics.emergencyChecks}`,
      '',
      '# HELP tburn_memory_guardian_uptime_seconds Guardian uptime in seconds',
      '# TYPE tburn_memory_guardian_uptime_seconds gauge',
      `tburn_memory_guardian_uptime_seconds ${Math.round(uptime / 1000)}`,
      '',
      '# HELP tburn_memory_guardian_growth_rate_mb_per_min Memory growth rate',
      '# TYPE tburn_memory_guardian_growth_rate_mb_per_min gauge',
      `tburn_memory_guardian_growth_rate_mb_per_min ${analysis.growthRateMBPerMin}`,
      '',
      '# HELP tburn_memory_guardian_consecutive_high_memory Consecutive high memory events',
      '# TYPE tburn_memory_guardian_consecutive_high_memory gauge',
      `tburn_memory_guardian_consecutive_high_memory ${this.consecutiveHighMemory}`,
    ];

    return lines.join('\n');
  }

  forceCleanup(level: 'soft' | 'aggressive' | 'emergency' = 'soft'): void {
    console.log(`[MEMORY-GUARDIAN] Manual ${level} cleanup requested`);
    this.logEvent('info', 'cleanup', `Manual ${level} cleanup triggered`);

    switch (level) {
      case 'soft':
        this.softCleanup();
        break;
      case 'aggressive':
        this.aggressiveCleanup();
        break;
      case 'emergency':
        this.emergencyCleanup();
        break;
    }
  }

  getConfig(): MemoryGuardianConfig {
    return { ...this.config };
  }

  getSLAReport(): {
    totalChecks: number;
    healthyChecks: number;
    warningChecks: number;
    criticalChecks: number;
    emergencyChecks: number;
    uptimeMs: number;
    downtimeMs: number;
    uptimePercent: string;
    healthyPercent: string;
    targetMet: boolean;
    currentState: string;
  } {
    const uptime = this.startedAt ? Date.now() - this.startedAt : 0;
    const uptimePercent = uptime > 0 ? (uptime - this.slaMetrics.downtimeMs) / uptime * 100 : 100;

    return {
      ...this.slaMetrics,
      uptimeMs: uptime,
      uptimePercent: uptimePercent.toFixed(3),
      healthyPercent: this.slaMetrics.totalChecks > 0 
        ? (this.slaMetrics.healthyChecks / this.slaMetrics.totalChecks * 100).toFixed(2)
        : '100.00',
      targetMet: uptimePercent >= this.config.slaTargetUptime,
    };
  }

  // ============================================
  // DB Persistence Methods
  // ============================================

  private async persistEventToDB(
    eventType: string,
    eventLevel: string,
    previousState?: string,
    cleanupType?: string,
    freedMB?: number,
    cleanupDurationMs?: number,
    alertSeverity?: string,
    alertMessage?: string
  ): Promise<void> {
    if (!this.dbPersistenceEnabled || !db) return;

    try {
      const status = this.getMemoryStatus();
      await db.insert(memoryGuardianEvents).values({
        eventType,
        eventLevel,
        heapUsedMB: status.heapUsedMB,
        heapTotalMB: status.heapTotalMB,
        heapRatio: parseFloat(status.ratio) / 100,
        rssMB: status.rss,
        externalMB: status.external,
        previousState,
        currentState: this.slaMetrics.currentState,
        cleanupType,
        freedMB,
        cleanupDurationMs,
        alertSeverity,
        alertMessage,
        consecutiveHighMemory: this.consecutiveHighMemory,
        occurredAt: new Date(),
      });
    } catch (error) {
      console.warn('[MEMORY-GUARDIAN] DB event persist failed:', error);
    }
  }

  private async persistSlaToDB(): Promise<void> {
    if (!this.dbPersistenceEnabled || !db) return;
    if (Date.now() - this.lastSlaPersist < this.slaPersistInterval) return;

    try {
      const now = new Date();
      const periodStart = new Date(this.lastSlaPersist || (this.startedAt || Date.now()));
      const uptime = this.startedAt ? Date.now() - this.startedAt : 0;
      const uptimePercent = uptime > 0 ? (uptime - this.slaMetrics.downtimeMs) / uptime * 100 : 100;
      const healthyPercent = this.slaMetrics.totalChecks > 0 
        ? this.slaMetrics.healthyChecks / this.slaMetrics.totalChecks * 100 
        : 100;

      const heapValues = this.trendHistory.map(t => t.heapUsedMB);
      const avgHeap = heapValues.length > 0 ? heapValues.reduce((a, b) => a + b, 0) / heapValues.length : 0;
      const maxHeap = heapValues.length > 0 ? Math.max(...heapValues) : 0;
      const minHeap = heapValues.length > 0 ? Math.min(...heapValues) : 0;
      const avgRatio = this.trendHistory.length > 0 
        ? this.trendHistory.reduce((a, b) => a + b.ratio, 0) / this.trendHistory.length / 100
        : 0;

      await db.insert(memoryGuardianSlaSnapshots).values({
        snapshotPeriod: 'hourly',
        periodStart,
        periodEnd: now,
        totalChecks: this.slaMetrics.totalChecks,
        healthyChecks: this.slaMetrics.healthyChecks,
        warningChecks: this.slaMetrics.warningChecks,
        criticalChecks: this.slaMetrics.criticalChecks,
        emergencyChecks: this.slaMetrics.emergencyChecks,
        uptimeMs: uptime,
        downtimeMs: this.slaMetrics.downtimeMs,
        uptimePercent,
        healthyPercent,
        slaTarget: this.config.slaTargetUptime,
        slaTargetMet: uptimePercent >= this.config.slaTargetUptime,
        softCleanups: this.cleanupStats.softCleanups,
        aggressiveCleanups: this.cleanupStats.aggressiveCleanups,
        emergencyCleanups: this.cleanupStats.emergencyCleanups,
        gcTriggered: this.cleanupStats.gcTriggered,
        totalFreedMB: this.cleanupStats.totalFreedMB,
        avgHeapUsedMB: avgHeap,
        maxHeapUsedMB: maxHeap,
        minHeapUsedMB: minHeap,
        avgHeapRatio: avgRatio,
      });

      this.lastSlaPersist = Date.now();
      console.log('[MEMORY-GUARDIAN] 📊 SLA snapshot persisted to DB');
    } catch (error) {
      console.warn('[MEMORY-GUARDIAN] DB SLA persist failed:', error);
    }
  }

  private async persistTrendToDB(): Promise<void> {
    if (!this.dbPersistenceEnabled || !db) return;
    if (Date.now() - this.lastTrendPersist < this.trendPersistInterval) return;

    try {
      const analysis = this.getTrendAnalysis();
      const status = this.getMemoryStatus();

      await db.insert(memoryGuardianTrends).values({
        windowMinutes: this.config.trendWindowSize,
        recordedAt: new Date(),
        growthRateMBPerMin: analysis.growthRateMBPerMin,
        estimatedTimeToWarningMs: analysis.estimatedTimeToWarning > 0 ? analysis.estimatedTimeToWarning : null,
        estimatedTimeToCriticalMs: null,
        volatility: analysis.volatility,
        volatilityLevel: analysis.volatility < 10 ? 'low' : analysis.volatility < 30 ? 'medium' : 'high',
        trendDirection: analysis.trend,
        trendStrength: Math.min(Math.abs(analysis.growthRateMBPerMin) / 10, 1),
        sampleCount: analysis.sampleCount,
        currentHeapMB: status.heapUsedMB,
        currentRatio: parseFloat(status.ratio) / 100,
        currentState: this.slaMetrics.currentState,
        predictedPeakMB: analysis.growthRateMBPerMin > 0 
          ? status.heapUsedMB + (analysis.growthRateMBPerMin * 60)
          : null,
        confidenceScore: Math.min(analysis.sampleCount / this.config.trendWindowSize, 1),
      });

      this.lastTrendPersist = Date.now();
    } catch (error) {
      console.warn('[MEMORY-GUARDIAN] DB trend persist failed:', error);
    }
  }

  private async persistPoolMetricsToDB(): Promise<void> {
    if (!this.dbPersistenceEnabled || !db) return;
    if (Date.now() - this.lastPoolMetricsPersist < this.poolMetricsPersistInterval) return;

    try {
      const now = new Date();
      
      const blockStats = blockPool.getNumericMetrics();
      await db.insert(objectPoolMetrics).values({
        poolName: 'block',
        recordedAt: now,
        currentSize: blockStats.currentSize,
        maxSize: blockStats.maxSize,
        minSize: 10,
        peakSize: blockStats.peakSize,
        utilization: blockStats.utilization,
        acquireCount: blockStats.acquireCount,
        releaseCount: blockStats.releaseCount,
        createCount: blockStats.createCount,
        evictCount: blockStats.evictCount,
        hitCount: blockStats.hitCount,
        missCount: blockStats.missCount,
        hitRate: blockStats.hitRate,
        missRate: blockStats.missRate,
        totalWaitTimeMs: blockStats.totalWaitTimeMs,
        avgWaitTimeMs: blockStats.avgWaitTimeMs,
        efficiency: blockStats.efficiency,
        prewarmEvents: 0,
        shrinkEvents: 0,
      });

      const txStats = txPool.getNumericMetrics();
      await db.insert(objectPoolMetrics).values({
        poolName: 'transaction',
        recordedAt: now,
        currentSize: txStats.currentSize,
        maxSize: txStats.maxSize,
        minSize: 100,
        peakSize: txStats.peakSize,
        utilization: txStats.utilization,
        acquireCount: txStats.acquireCount,
        releaseCount: txStats.releaseCount,
        createCount: txStats.createCount,
        evictCount: txStats.evictCount,
        hitCount: txStats.hitCount,
        missCount: txStats.missCount,
        hitRate: txStats.hitRate,
        missRate: txStats.missRate,
        totalWaitTimeMs: txStats.totalWaitTimeMs,
        avgWaitTimeMs: txStats.avgWaitTimeMs,
        efficiency: txStats.efficiency,
        prewarmEvents: 0,
        shrinkEvents: 0,
      });

      this.lastPoolMetricsPersist = Date.now();
    } catch (error) {
      console.warn('[MEMORY-GUARDIAN] DB pool metrics persist failed:', error);
    }
  }

  async runPeriodicPersistence(): Promise<void> {
    await Promise.all([
      this.persistSlaToDB(),
      this.persistTrendToDB(),
      this.persistPoolMetricsToDB(),
    ]);
  }

  setDbPersistenceEnabled(enabled: boolean): void {
    this.dbPersistenceEnabled = enabled;
    console.log(`[MEMORY-GUARDIAN] DB persistence ${enabled ? 'enabled' : 'disabled'}`);
  }
}

export const memoryGuardian = new MemoryGuardianEnterprise();
