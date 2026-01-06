/**
 * TBURN Adaptive Memory Governor v6.0
 * 
 * Manages memory allocation for shard operations to prevent OOM
 * and ensure stable operation under high load.
 * 
 * Key features:
 * - Dynamic memory ceiling calculation
 * - Per-shard footprint projection
 * - Shard hibernation for memory recovery
 * - Diff-based state compaction
 * 
 * @author TBURN Development Team
 * @version 6.0.0
 */

import { EventEmitter } from 'events';
import v8 from 'v8';

export type MemoryState = 'normal' | 'warning' | 'deferred' | 'hibernating' | 'critical';

export interface MemorySnapshot {
  timestamp: number;
  heapUsedMB: number;
  heapTotalMB: number;
  heapUsagePercent: number;
  externalMB: number;
  rssMemoryMB: number;
  state: MemoryState;
}

export interface ShardMemoryInfo {
  shardId: number;
  estimatedMB: number;
  actualMB: number;
  lastAccessedAt: number;
  isHibernated: boolean;
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
}

export interface GovernorMetrics {
  currentState: MemoryState;
  heapUsagePercent: number;
  activeShardsMemoryMB: number;
  hibernatedShards: number;
  deferredActivations: number;
  totalHibernations: number;
  lastStateChange: number;
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
};

export class MemoryGovernor extends EventEmitter {
  private config: GovernorConfig;
  private currentState: MemoryState = 'normal';
  private shardMemoryMap: Map<number, ShardMemoryInfo> = new Map();
  private hibernatedShards: Set<number> = new Set();
  private monitorTimer: NodeJS.Timeout | null = null;
  private lastHibernationTime = 0;
  private deferredActivations = 0;
  private totalHibernations = 0;
  private lastStateChange = Date.now();
  
  constructor(config: Partial<GovernorConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startMonitoring();
    console.log('[MemoryGovernor] ✅ Initialized adaptive memory management');
    console.log(`[MemoryGovernor] Thresholds: warn=${this.config.heapWarningThreshold * 100}%, defer=${this.config.heapDeferThreshold * 100}%, hibernate=${this.config.heapHibernateThreshold * 100}%`);
  }
  
  /**
   * Start periodic memory monitoring
   */
  private startMonitoring(): void {
    this.monitorTimer = setInterval(() => {
      this.checkMemoryState();
    }, this.config.monitorIntervalMs);
  }
  
  /**
   * Check and update memory state
   */
  private checkMemoryState(): void {
    const snapshot = this.getMemorySnapshot();
    const newState = this.calculateState(snapshot.heapUsagePercent);
    
    if (newState !== this.currentState) {
      const oldState = this.currentState;
      this.currentState = newState;
      this.lastStateChange = Date.now();
      
      this.emit('stateChange', { oldState, newState, snapshot });
      console.log(`[MemoryGovernor] State: ${oldState} → ${newState} (heap: ${snapshot.heapUsagePercent.toFixed(1)}%)`);
      
      if (newState === 'hibernating' || newState === 'critical') {
        this.triggerEmergencyActions(snapshot);
      }
    }
  }
  
  /**
   * Calculate memory state from heap usage
   */
  private calculateState(heapUsagePercent: number): MemoryState {
    const usage = heapUsagePercent / 100;
    
    if (usage >= this.config.heapCriticalThreshold) {
      return 'critical';
    } else if (usage >= this.config.heapHibernateThreshold) {
      return 'hibernating';
    } else if (usage >= this.config.heapDeferThreshold) {
      return 'deferred';
    } else if (usage >= this.config.heapWarningThreshold) {
      return 'warning';
    }
    return 'normal';
  }
  
  /**
   * Get current memory snapshot
   */
  getMemorySnapshot(): MemorySnapshot {
    const heapStats = v8.getHeapStatistics();
    const heapUsedMB = heapStats.used_heap_size / (1024 * 1024);
    const heapTotalMB = heapStats.heap_size_limit / (1024 * 1024);
    const heapUsagePercent = (heapUsedMB / heapTotalMB) * 100;
    
    return {
      timestamp: Date.now(),
      heapUsedMB: Math.round(heapUsedMB),
      heapTotalMB: Math.round(heapTotalMB),
      heapUsagePercent,
      externalMB: Math.round(heapStats.external_memory / (1024 * 1024)),
      rssMemoryMB: Math.round(process.memoryUsage().rss / (1024 * 1024)),
      state: this.currentState,
    };
  }
  
  /**
   * Check if shard activation should be deferred
   */
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
        return { defer: true, reason: `Projected usage ${projectedUsage.toFixed(1)}% exceeds limit` };
      }
    }
    
    const totalShardMemory = this.getTotalShardMemory();
    if (totalShardMemory + this.config.shardMemoryEstimateMB > this.config.maxTotalShardMemoryMB) {
      this.deferredActivations++;
      return { defer: true, reason: 'Total shard memory limit reached' };
    }
    
    return { defer: false };
  }
  
  /**
   * Project memory usage after activating N shards
   */
  projectMemoryAfterActivation(shardCount: number): number {
    const snapshot = this.getMemorySnapshot();
    const additionalMemoryMB = shardCount * this.config.shardMemoryEstimateMB;
    const projectedUsedMB = snapshot.heapUsedMB + additionalMemoryMB;
    return (projectedUsedMB / snapshot.heapTotalMB) * 100;
  }
  
  /**
   * Register shard memory footprint
   */
  registerShard(shardId: number, estimatedMB: number = this.config.shardMemoryEstimateMB): void {
    this.shardMemoryMap.set(shardId, {
      shardId,
      estimatedMB,
      actualMB: estimatedMB,
      lastAccessedAt: Date.now(),
      isHibernated: false,
    });
  }
  
  /**
   * Update shard memory footprint
   */
  updateShardMemory(shardId: number, actualMB: number): void {
    const info = this.shardMemoryMap.get(shardId);
    if (info) {
      info.actualMB = actualMB;
      info.lastAccessedAt = Date.now();
    }
  }
  
  /**
   * Mark shard as accessed (for LRU tracking)
   */
  touchShard(shardId: number): void {
    const info = this.shardMemoryMap.get(shardId);
    if (info) {
      info.lastAccessedAt = Date.now();
    }
  }
  
  /**
   * Unregister shard
   */
  unregisterShard(shardId: number): void {
    this.shardMemoryMap.delete(shardId);
    this.hibernatedShards.delete(shardId);
  }
  
  /**
   * Get total memory used by active shards
   */
  getTotalShardMemory(): number {
    let total = 0;
    for (const info of this.shardMemoryMap.values()) {
      if (!info.isHibernated) {
        total += info.actualMB;
      }
    }
    return total;
  }
  
  /**
   * Trigger emergency actions when memory is critical
   */
  private triggerEmergencyActions(snapshot: MemorySnapshot): void {
    const now = Date.now();
    
    if (now - this.lastHibernationTime < this.config.hibernationCooldownMs) {
      return;
    }
    
    const coldShards = this.findColdestShards(2);
    
    for (const shardInfo of coldShards) {
      this.hibernateShard(shardInfo.shardId);
    }
    
    this.lastHibernationTime = now;
    
    this.emit('emergencyAction', {
      action: 'hibernate',
      shardIds: coldShards.map(s => s.shardId),
      snapshot,
    });
  }
  
  /**
   * Find coldest (least recently used) shards
   */
  private findColdestShards(count: number): ShardMemoryInfo[] {
    const activeShards = Array.from(this.shardMemoryMap.values())
      .filter(s => !s.isHibernated)
      .sort((a, b) => a.lastAccessedAt - b.lastAccessedAt);
    
    return activeShards.slice(0, count);
  }
  
  /**
   * Hibernate a shard to free memory
   */
  hibernateShard(shardId: number): boolean {
    const info = this.shardMemoryMap.get(shardId);
    if (!info || info.isHibernated) {
      return false;
    }
    
    info.isHibernated = true;
    this.hibernatedShards.add(shardId);
    this.totalHibernations++;
    
    this.emit('shardHibernated', { shardId, freedMemoryMB: info.actualMB });
    console.log(`[MemoryGovernor] 💤 Shard ${shardId} hibernated, freed ~${info.actualMB}MB`);
    
    return true;
  }
  
  /**
   * Wake up a hibernated shard
   */
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
    
    info.isHibernated = false;
    info.lastAccessedAt = Date.now();
    this.hibernatedShards.delete(shardId);
    
    this.emit('shardWoken', { shardId });
    console.log(`[MemoryGovernor] ⏰ Shard ${shardId} woken up`);
    
    return true;
  }
  
  /**
   * Check if shard is hibernated
   */
  isShardHibernated(shardId: number): boolean {
    return this.hibernatedShards.has(shardId);
  }
  
  /**
   * Get current state
   */
  getState(): MemoryState {
    return this.currentState;
  }
  
  /**
   * Check if activations are allowed
   */
  canActivate(): boolean {
    return this.currentState === 'normal' || this.currentState === 'warning';
  }
  
  /**
   * Get governor metrics
   */
  getMetrics(): GovernorMetrics {
    return {
      currentState: this.currentState,
      heapUsagePercent: this.getMemorySnapshot().heapUsagePercent,
      activeShardsMemoryMB: this.getTotalShardMemory(),
      hibernatedShards: this.hibernatedShards.size,
      deferredActivations: this.deferredActivations,
      totalHibernations: this.totalHibernations,
      lastStateChange: this.lastStateChange,
    };
  }
  
  /**
   * Force garbage collection if available
   */
  requestGarbageCollection(): boolean {
    if (global.gc) {
      global.gc();
      console.log('[MemoryGovernor] 🗑️ Forced garbage collection');
      return true;
    }
    return false;
  }
  
  /**
   * Cleanup
   */
  destroy(): void {
    if (this.monitorTimer) {
      clearInterval(this.monitorTimer);
      this.monitorTimer = null;
    }
    this.shardMemoryMap.clear();
    this.hibernatedShards.clear();
    this.removeAllListeners();
  }
}

export const memoryGovernor = new MemoryGovernor();
