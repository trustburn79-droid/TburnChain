/**
 * TBURN Adaptive Memory Governor v6.0 Enterprise
 * 
 * Production-grade memory management with predictive scaling,
 * GC integration, and comprehensive observability.
 * 
 * Key features:
 * - Dynamic memory ceiling with headroom calculation
 * - Per-shard footprint tracking with EWMA smoothing
 * - Predictive memory pressure detection
 * - LRU-based shard hibernation
 * - GC coordination and optimization
 * - Prometheus-compatible metrics export
 * - Hysteresis for state transitions
 * 
 * @author TBURN Development Team
 * @version 6.0.0-enterprise
 */

import { EventEmitter } from 'events';
import { crashDiagnostics } from '../monitoring/crash-diagnostics';
import { METRICS_CONFIG } from '../memory/metrics-config';

export type MemoryState = 'normal' | 'warning' | 'deferred' | 'hibernating' | 'critical';

export interface MemorySnapshot {
  timestamp: number;
  heapUsedMB: number;
  heapTotalMB: number;
  heapUsagePercent: number;
  externalMB: number;
  rssMemoryMB: number;
  arrayBuffersMB: number;
  state: MemoryState;
  trend: 'stable' | 'increasing' | 'decreasing';
  projectedPeakPercent: number;
}

export interface ShardMemoryInfo {
  shardId: number;
  estimatedMB: number;
  actualMB: number;
  ewmaActualMB: number;
  lastAccessedAt: number;
  accessCount: number;
  isHibernated: boolean;
  hibernatedAt: number | null;
}

export interface GovernorConfig {
  heapWarningThreshold: number;
  heapDeferThreshold: number;
  heapHibernateThreshold: number;
  heapCriticalThreshold: number;
  shardMemoryEstimateMB: number;
  maxTotalShardMemoryMB: number;
  monitorIntervalMs: number;
  hibernationCooldownMs: number;
  ewmaAlpha: number;
  hysteresisPercent: number;
  gcThresholdPercent: number;
  historyWindowSize: number;
  trendWindowSize: number;
}

export interface GovernorMetrics {
  currentState: MemoryState;
  heapUsagePercent: number;
  heapUsedMB: number;
  heapTotalMB: number;
  activeShardsMemoryMB: number;
  activeShardCount: number;
  hibernatedShardCount: number;
  deferredActivations: number;
  totalHibernations: number;
  totalWakeups: number;
  gcRequestCount: number;
  lastGcAt: number | null;
  lastStateChange: number;
  stateTransitions: number;
  memoryTrend: 'stable' | 'increasing' | 'decreasing';
  projectedPeakPercent: number;
  uptime: number;
}

export interface GovernorHealthStatus {
  healthy: boolean;
  status: 'healthy' | 'degraded' | 'critical';
  memoryState: MemoryState;
  recommendations: string[];
  metrics: GovernorMetrics;
  lastCheck: number;
}

const DEFAULT_CONFIG: GovernorConfig = {
  heapWarningThreshold: 0.75,
  heapDeferThreshold: 0.85,
  heapHibernateThreshold: 0.90,
  heapCriticalThreshold: 0.95,
  shardMemoryEstimateMB: 15,
  maxTotalShardMemoryMB: 800,
  monitorIntervalMs: 5000,
  hibernationCooldownMs: 30000,
  ewmaAlpha: 0.3,
  hysteresisPercent: 2,
  gcThresholdPercent: 80,
  historyWindowSize: 60,
  trendWindowSize: 10,
};

export class MemoryGovernor extends EventEmitter {
  private config: GovernorConfig;
  private currentState: MemoryState = 'normal';
  private shardMemoryMap: Map<number, ShardMemoryInfo> = new Map();
  private hibernatedShards: Set<number> = new Set();
  private monitorTimer: NodeJS.Timeout | null = null;
  private lastHibernationTime = 0;
  private lastGcTime: number | null = null;
  private deferredActivations = 0;
  private totalHibernations = 0;
  private totalWakeups = 0;
  private gcRequestCount = 0;
  private lastStateChange = Date.now();
  private stateTransitions = 0;
  private startTime = Date.now();
  
  private memoryHistory: number[] = [];
  private snapshotHistory: MemorySnapshot[] = [];
  
  constructor(config: Partial<GovernorConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startMonitoring();
    console.log('[MemoryGovernor] ✅ Initialized adaptive memory management (Enterprise)');
    console.log(`[MemoryGovernor] Thresholds: warn=${this.config.heapWarningThreshold * 100}%, defer=${this.config.heapDeferThreshold * 100}%, hibernate=${this.config.heapHibernateThreshold * 100}%`);
    console.log(`[MemoryGovernor] Hysteresis: ${this.config.hysteresisPercent}%, EWMA alpha: ${this.config.ewmaAlpha}`);
  }
  
  private startMonitoring(): void {
    this.monitorTimer = setInterval(() => {
      this.checkMemoryState();
    }, this.config.monitorIntervalMs);
    
    this.checkMemoryState();
  }
  
  private checkMemoryState(): void {
    const snapshot = this.getMemorySnapshot();
    
    this.memoryHistory.push(snapshot.heapUsagePercent);
    if (this.memoryHistory.length > this.config.historyWindowSize) {
      this.memoryHistory.shift();
    }
    
    this.snapshotHistory.push(snapshot);
    if (this.snapshotHistory.length > this.config.historyWindowSize) {
      this.snapshotHistory.shift();
    }
    
    const newState = this.calculateStateWithHysteresis(snapshot.heapUsagePercent);
    
    if (newState !== this.currentState) {
      const oldState = this.currentState;
      this.currentState = newState;
      this.lastStateChange = Date.now();
      this.stateTransitions++;
      
      this.emit('stateChange', { oldState, newState, snapshot });
      console.log(`[MemoryGovernor] State: ${oldState} → ${newState} (heap: ${snapshot.heapUsagePercent.toFixed(1)}%)`);
      
      if (newState === 'hibernating' || newState === 'critical') {
        this.triggerEmergencyActions(snapshot);
      }
    }
    
    if (snapshot.heapUsagePercent >= this.config.gcThresholdPercent) {
      this.requestGarbageCollection();
    }
  }
  
  private calculateStateWithHysteresis(heapUsagePercent: number): MemoryState {
    const usage = heapUsagePercent / 100;
    const hysteresis = this.config.hysteresisPercent / 100;
    
    const getThreshold = (base: number, direction: 'up' | 'down') => {
      return direction === 'up' ? base : base - hysteresis;
    };
    
    const isRising = this.isMemoryRising();
    
    if (usage >= this.config.heapCriticalThreshold) {
      return 'critical';
    }
    
    if (this.currentState === 'critical') {
      if (usage < getThreshold(this.config.heapCriticalThreshold, 'down')) {
        return 'hibernating';
      }
      return 'critical';
    }
    
    if (usage >= getThreshold(this.config.heapHibernateThreshold, isRising ? 'up' : 'down')) {
      return 'hibernating';
    }
    
    if (this.currentState === 'hibernating') {
      if (usage < getThreshold(this.config.heapHibernateThreshold, 'down')) {
        return 'deferred';
      }
      return 'hibernating';
    }
    
    if (usage >= getThreshold(this.config.heapDeferThreshold, isRising ? 'up' : 'down')) {
      return 'deferred';
    }
    
    if (this.currentState === 'deferred') {
      if (usage < getThreshold(this.config.heapDeferThreshold, 'down')) {
        return 'warning';
      }
      return 'deferred';
    }
    
    if (usage >= getThreshold(this.config.heapWarningThreshold, isRising ? 'up' : 'down')) {
      return 'warning';
    }
    
    if (this.currentState === 'warning') {
      if (usage < getThreshold(this.config.heapWarningThreshold, 'down')) {
        return 'normal';
      }
      return 'warning';
    }
    
    return 'normal';
  }
  
  private isMemoryRising(): boolean {
    if (this.memoryHistory.length < this.config.trendWindowSize) {
      return false;
    }
    
    const recent = this.memoryHistory.slice(-this.config.trendWindowSize);
    const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
    const secondHalf = recent.slice(Math.floor(recent.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    return secondAvg > firstAvg + 1;
  }
  
  private getMemoryTrend(): 'stable' | 'increasing' | 'decreasing' {
    if (this.memoryHistory.length < this.config.trendWindowSize) {
      return 'stable';
    }
    
    const recent = this.memoryHistory.slice(-this.config.trendWindowSize);
    const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
    const secondHalf = recent.slice(Math.floor(recent.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const diff = secondAvg - firstAvg;
    if (Math.abs(diff) < 2) return 'stable';
    return diff > 0 ? 'increasing' : 'decreasing';
  }
  
  private predictPeakUsage(): number {
    if (this.memoryHistory.length < 5) {
      return this.memoryHistory[this.memoryHistory.length - 1] || 0;
    }
    
    const trend = this.getMemoryTrend();
    const current = this.memoryHistory[this.memoryHistory.length - 1];
    
    if (trend === 'stable') return current;
    
    const recent = this.memoryHistory.slice(-5);
    const avgChange = (recent[recent.length - 1] - recent[0]) / (recent.length - 1);
    
    return Math.min(100, current + (avgChange * 5));
  }
  
  getMemorySnapshot(): MemorySnapshot {
    const memUsage = process.memoryUsage();
    const heapUsedMB = memUsage.heapUsed / (1024 * 1024);
    const heapTotalMB = memUsage.heapTotal / (1024 * 1024);
    
    // ★ [2026-01-08] V8 힙 제한 사용 - METRICS_CONFIG와 동기화
    // METRICS_CONFIG.HARDWARE.V8_HEAP_LIMIT_MB를 사용하여 일관성 유지
    const heapLimit = METRICS_CONFIG.HARDWARE.V8_HEAP_LIMIT_MB || 8240;
    const heapUsagePercent = (heapUsedMB / heapLimit) * 100;
    
    return {
      timestamp: Date.now(),
      heapUsedMB: Math.round(heapUsedMB * 100) / 100,
      heapTotalMB: Math.round(heapLimit * 100) / 100,
      heapUsagePercent,
      externalMB: Math.round(memUsage.external / (1024 * 1024) * 100) / 100,
      rssMemoryMB: Math.round(memUsage.rss / (1024 * 1024) * 100) / 100,
      arrayBuffersMB: Math.round((memUsage.arrayBuffers || 0) / (1024 * 1024) * 100) / 100,
      state: this.currentState,
      trend: this.getMemoryTrend(),
      projectedPeakPercent: this.predictPeakUsage(),
    };
  }
  
  shouldDeferActivation(shardId: number): { defer: boolean; reason?: string } {
    const snapshot = this.getMemorySnapshot();
    
    if (this.currentState === 'critical') {
      this.deferredActivations++;
      return { defer: true, reason: 'Memory critical - no activations allowed' };
    }
    
    if (this.currentState === 'hibernating') {
      this.deferredActivations++;
      return { defer: true, reason: 'Memory hibernating - activation deferred' };
    }
    
    if (this.currentState === 'deferred') {
      const projectedUsage = this.projectMemoryAfterActivation(1);
      if (projectedUsage > this.config.heapHibernateThreshold * 100) {
        this.deferredActivations++;
        return { defer: true, reason: `Projected usage ${projectedUsage.toFixed(1)}% exceeds hibernate threshold` };
      }
    }
    
    const totalShardMemory = this.getTotalShardMemory();
    if (totalShardMemory + this.config.shardMemoryEstimateMB > this.config.maxTotalShardMemoryMB) {
      this.deferredActivations++;
      return { defer: true, reason: `Total shard memory limit reached (${totalShardMemory.toFixed(0)}/${this.config.maxTotalShardMemoryMB}MB)` };
    }
    
    const projectedPeak = this.predictPeakUsage();
    if (projectedPeak > this.config.heapDeferThreshold * 100) {
      this.deferredActivations++;
      return { defer: true, reason: `Projected peak usage ${projectedPeak.toFixed(1)}% exceeds defer threshold` };
    }
    
    return { defer: false };
  }
  
  projectMemoryAfterActivation(shardCount: number): number {
    const snapshot = this.getMemorySnapshot();
    const additionalMemoryMB = shardCount * this.config.shardMemoryEstimateMB;
    const projectedUsedMB = snapshot.heapUsedMB + additionalMemoryMB;
    return (projectedUsedMB / snapshot.heapTotalMB) * 100;
  }
  
  registerShard(shardId: number, estimatedMB: number = this.config.shardMemoryEstimateMB): void {
    const existing = this.shardMemoryMap.get(shardId);
    
    this.shardMemoryMap.set(shardId, {
      shardId,
      estimatedMB,
      actualMB: estimatedMB,
      ewmaActualMB: existing?.ewmaActualMB || estimatedMB,
      lastAccessedAt: Date.now(),
      accessCount: (existing?.accessCount || 0) + 1,
      isHibernated: false,
      hibernatedAt: null,
    });
    
    this.hibernatedShards.delete(shardId);
  }
  
  updateShardMemory(shardId: number, actualMB: number): void {
    const info = this.shardMemoryMap.get(shardId);
    if (info) {
      info.actualMB = actualMB;
      info.ewmaActualMB = (this.config.ewmaAlpha * actualMB) + 
                          ((1 - this.config.ewmaAlpha) * info.ewmaActualMB);
      info.lastAccessedAt = Date.now();
      info.accessCount++;
    }
  }
  
  touchShard(shardId: number): void {
    const info = this.shardMemoryMap.get(shardId);
    if (info) {
      info.lastAccessedAt = Date.now();
      info.accessCount++;
    }
  }
  
  unregisterShard(shardId: number): void {
    this.shardMemoryMap.delete(shardId);
    this.hibernatedShards.delete(shardId);
  }
  
  getTotalShardMemory(): number {
    let total = 0;
    for (const info of this.shardMemoryMap.values()) {
      if (!info.isHibernated) {
        total += info.ewmaActualMB;
      }
    }
    return total;
  }
  
  private triggerEmergencyActions(snapshot: MemorySnapshot): void {
    const now = Date.now();
    
    // CrashDiagnostics 연동: 메모리 경고 기록
    crashDiagnostics.handleMemoryWarning();
    crashDiagnostics.log(
      `Memory emergency: ${snapshot.heapUsagePercent.toFixed(1)}% heap, state=${this.currentState}`,
      'error'
    );
    
    if (now - this.lastHibernationTime < this.config.hibernationCooldownMs) {
      return;
    }
    
    const shardsToHibernate = this.currentState === 'critical' ? 4 : 2;
    const coldShards = this.findColdestShards(shardsToHibernate);
    
    for (const shardInfo of coldShards) {
      this.hibernateShard(shardInfo.shardId);
    }
    
    this.requestGarbageCollection();
    
    this.lastHibernationTime = now;
    
    this.emit('emergencyAction', {
      action: 'hibernate',
      shardIds: coldShards.map(s => s.shardId),
      snapshot,
      gcRequested: true,
    });
  }
  
  private findColdestShards(count: number): ShardMemoryInfo[] {
    const activeShards = Array.from(this.shardMemoryMap.values())
      .filter(s => !s.isHibernated)
      .sort((a, b) => {
        const aScore = a.lastAccessedAt - (a.accessCount * 1000);
        const bScore = b.lastAccessedAt - (b.accessCount * 1000);
        return aScore - bScore;
      });
    
    return activeShards.slice(0, count);
  }
  
  hibernateShard(shardId: number): boolean {
    const info = this.shardMemoryMap.get(shardId);
    if (!info || info.isHibernated) {
      return false;
    }
    
    info.isHibernated = true;
    info.hibernatedAt = Date.now();
    this.hibernatedShards.add(shardId);
    this.totalHibernations++;
    
    this.emit('shardHibernated', { 
      shardId, 
      freedMemoryMB: info.ewmaActualMB,
      hibernatedAt: info.hibernatedAt,
    });
    console.log(`[MemoryGovernor] 💤 Shard ${shardId} hibernated, freed ~${info.ewmaActualMB.toFixed(1)}MB`);
    
    return true;
  }
  
  wakeupShard(shardId: number): boolean {
    const info = this.shardMemoryMap.get(shardId);
    if (!info || !info.isHibernated) {
      return false;
    }
    
    const deferCheck = this.shouldDeferActivation(shardId);
    if (deferCheck.defer) {
      console.log(`[MemoryGovernor] ⏸️ Shard ${shardId} wakeup deferred: ${deferCheck.reason}`);
      return false;
    }
    
    const hibernationDuration = Date.now() - (info.hibernatedAt || Date.now());
    
    info.isHibernated = false;
    info.hibernatedAt = null;
    info.lastAccessedAt = Date.now();
    this.hibernatedShards.delete(shardId);
    this.totalWakeups++;
    
    this.emit('shardWoken', { 
      shardId,
      hibernationDurationMs: hibernationDuration,
    });
    console.log(`[MemoryGovernor] ⏰ Shard ${shardId} woken up after ${Math.round(hibernationDuration / 1000)}s`);
    
    return true;
  }
  
  isShardHibernated(shardId: number): boolean {
    return this.hibernatedShards.has(shardId);
  }
  
  getState(): MemoryState {
    return this.currentState;
  }
  
  canActivate(): boolean {
    return this.currentState === 'normal' || this.currentState === 'warning';
  }
  
  getMetrics(): GovernorMetrics {
    const snapshot = this.getMemorySnapshot();
    
    return {
      currentState: this.currentState,
      heapUsagePercent: snapshot.heapUsagePercent,
      heapUsedMB: snapshot.heapUsedMB,
      heapTotalMB: snapshot.heapTotalMB,
      activeShardsMemoryMB: this.getTotalShardMemory(),
      activeShardCount: this.shardMemoryMap.size - this.hibernatedShards.size,
      hibernatedShardCount: this.hibernatedShards.size,
      deferredActivations: this.deferredActivations,
      totalHibernations: this.totalHibernations,
      totalWakeups: this.totalWakeups,
      gcRequestCount: this.gcRequestCount,
      lastGcAt: this.lastGcTime,
      lastStateChange: this.lastStateChange,
      stateTransitions: this.stateTransitions,
      memoryTrend: snapshot.trend,
      projectedPeakPercent: snapshot.projectedPeakPercent,
      uptime: Date.now() - this.startTime,
    };
  }
  
  getHealthStatus(): GovernorHealthStatus {
    const metrics = this.getMetrics();
    const recommendations: string[] = [];
    
    if (this.currentState === 'critical') {
      recommendations.push('CRITICAL: Reduce active shards immediately');
      recommendations.push('Consider increasing heap size or reducing workload');
    } else if (this.currentState === 'hibernating') {
      recommendations.push('High memory pressure - some shards hibernated');
      recommendations.push('Monitor for recovery or scale down');
    } else if (this.currentState === 'deferred') {
      recommendations.push('Memory elevated - new activations deferred');
    } else if (metrics.memoryTrend === 'increasing') {
      recommendations.push('Memory trending upward - monitor closely');
    }
    
    if (this.hibernatedShards.size > 10) {
      recommendations.push(`${this.hibernatedShards.size} shards hibernated - consider scaling resources`);
    }
    
    const isHealthy = this.currentState === 'normal' || this.currentState === 'warning';
    const isCritical = this.currentState === 'critical';
    
    return {
      healthy: isHealthy,
      status: isCritical ? 'critical' : (isHealthy ? 'healthy' : 'degraded'),
      memoryState: this.currentState,
      recommendations,
      metrics,
      lastCheck: Date.now(),
    };
  }
  
  requestGarbageCollection(): boolean {
    const now = Date.now();
    
    if (this.lastGcTime && (now - this.lastGcTime) < 10000) {
      return false;
    }
    
    if (global.gc) {
      try {
        global.gc();
        this.gcRequestCount++;
        this.lastGcTime = now;
        console.log('[MemoryGovernor] 🗑️ Garbage collection completed');
        this.emit('gcCompleted', { timestamp: now });
        return true;
      } catch (error) {
        console.error('[MemoryGovernor] ❌ GC failed:', error);
      }
    }
    return false;
  }
  
  toPrometheusMetrics(): string {
    const m = this.getMetrics();
    const lines: string[] = [];
    
    lines.push('# HELP tburn_memory_heap_usage_percent Current heap usage percentage');
    lines.push('# TYPE tburn_memory_heap_usage_percent gauge');
    lines.push(`tburn_memory_heap_usage_percent ${m.heapUsagePercent.toFixed(2)}`);
    
    lines.push('# HELP tburn_memory_heap_used_mb Current heap used in MB');
    lines.push('# TYPE tburn_memory_heap_used_mb gauge');
    lines.push(`tburn_memory_heap_used_mb ${m.heapUsedMB}`);
    
    lines.push('# HELP tburn_memory_heap_total_mb Total heap available in MB');
    lines.push('# TYPE tburn_memory_heap_total_mb gauge');
    lines.push(`tburn_memory_heap_total_mb ${m.heapTotalMB}`);
    
    lines.push('# HELP tburn_memory_state Current memory state (0=normal, 1=warning, 2=deferred, 3=hibernating, 4=critical)');
    lines.push('# TYPE tburn_memory_state gauge');
    const stateNum = { normal: 0, warning: 1, deferred: 2, hibernating: 3, critical: 4 }[m.currentState] || 0;
    lines.push(`tburn_memory_state ${stateNum}`);
    
    lines.push('# HELP tburn_memory_active_shards_mb Memory used by active shards in MB');
    lines.push('# TYPE tburn_memory_active_shards_mb gauge');
    lines.push(`tburn_memory_active_shards_mb ${m.activeShardsMemoryMB.toFixed(2)}`);
    
    lines.push('# HELP tburn_memory_active_shard_count Number of active shards');
    lines.push('# TYPE tburn_memory_active_shard_count gauge');
    lines.push(`tburn_memory_active_shard_count ${m.activeShardCount}`);
    
    lines.push('# HELP tburn_memory_hibernated_shard_count Number of hibernated shards');
    lines.push('# TYPE tburn_memory_hibernated_shard_count gauge');
    lines.push(`tburn_memory_hibernated_shard_count ${m.hibernatedShardCount}`);
    
    lines.push('# HELP tburn_memory_deferred_activations Total deferred activations');
    lines.push('# TYPE tburn_memory_deferred_activations counter');
    lines.push(`tburn_memory_deferred_activations ${m.deferredActivations}`);
    
    lines.push('# HELP tburn_memory_total_hibernations Total shard hibernations');
    lines.push('# TYPE tburn_memory_total_hibernations counter');
    lines.push(`tburn_memory_total_hibernations ${m.totalHibernations}`);
    
    lines.push('# HELP tburn_memory_total_wakeups Total shard wakeups');
    lines.push('# TYPE tburn_memory_total_wakeups counter');
    lines.push(`tburn_memory_total_wakeups ${m.totalWakeups}`);
    
    lines.push('# HELP tburn_memory_gc_requests Total GC requests');
    lines.push('# TYPE tburn_memory_gc_requests counter');
    lines.push(`tburn_memory_gc_requests ${m.gcRequestCount}`);
    
    lines.push('# HELP tburn_memory_state_transitions Total state transitions');
    lines.push('# TYPE tburn_memory_state_transitions counter');
    lines.push(`tburn_memory_state_transitions ${m.stateTransitions}`);
    
    lines.push('# HELP tburn_memory_projected_peak_percent Projected peak memory usage');
    lines.push('# TYPE tburn_memory_projected_peak_percent gauge');
    lines.push(`tburn_memory_projected_peak_percent ${m.projectedPeakPercent.toFixed(2)}`);
    
    return lines.join('\n');
  }
  
  destroy(): void {
    if (this.monitorTimer) {
      clearInterval(this.monitorTimer);
      this.monitorTimer = null;
    }
    this.shardMemoryMap.clear();
    this.hibernatedShards.clear();
    this.memoryHistory = [];
    this.snapshotHistory = [];
    this.removeAllListeners();
  }
}

export const memoryGovernor = new MemoryGovernor();
