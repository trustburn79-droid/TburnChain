import { blockPool, txPool } from '../utils/object-pool';

interface MemoryStatus {
  heapUsedMB: number;
  heapTotalMB: number;
  ratio: string;
  rss: number;
  external: number;
  arrayBuffers: number;
}

interface MemoryGuardianConfig {
  checkInterval: number;
  warningThreshold: number;
  criticalThreshold: number;
  emergencyThreshold: number;
  maxHeapMB: number;
  targetHeapMB: number;
}

class MemoryGuardian {
  private readonly config: MemoryGuardianConfig = {
    checkInterval: 10 * 1000,
    warningThreshold: 0.70,
    criticalThreshold: 0.85,
    emergencyThreshold: 0.92,
    maxHeapMB: 2048,
    targetHeapMB: 1400,
  };

  private lastGC = Date.now();
  private consecutiveHighMemory = 0;
  private intervalId: NodeJS.Timeout | null = null;
  private isStarted = false;
  private cleanupCallbacks: Array<() => void> = [];
  private emergencyCallbacks: Array<() => void> = [];

  start(): void {
    if (this.isStarted) return;
    this.isStarted = true;
    this.intervalId = setInterval(() => this.check(), this.config.checkInterval);
    console.log('[MEMORY-GUARDIAN] Started monitoring (interval: 10s)');
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isStarted = false;
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
    const heapTotalMB = usage.heapTotal / 1024 / 1024;
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

  private check(): void {
    const usage = process.memoryUsage();
    const ratio = usage.heapUsed / (this.config.maxHeapMB * 1024 * 1024);
    const status = this.getMemoryStatus();

    if (ratio >= this.config.emergencyThreshold) {
      this.handleEmergency(status);
    } else if (ratio >= this.config.criticalThreshold) {
      this.handleCritical(status);
    } else if (ratio >= this.config.warningThreshold) {
      this.handleWarning(status);
    } else {
      this.consecutiveHighMemory = 0;
    }
  }

  private handleWarning(status: MemoryStatus): void {
    console.warn(`[MEMORY-GUARDIAN] ⚠️ Warning: ${status.ratio}% (${status.heapUsedMB}MB / ${this.config.maxHeapMB}MB)`);
    this.softCleanup();
  }

  private handleCritical(status: MemoryStatus): void {
    console.error(`[MEMORY-GUARDIAN] 🔴 Critical: ${status.ratio}% (${status.heapUsedMB}MB / ${this.config.maxHeapMB}MB)`);
    this.consecutiveHighMemory++;
    this.aggressiveCleanup();

    if (this.consecutiveHighMemory >= 3) {
      this.handleEmergency(status);
    }
  }

  private handleEmergency(status: MemoryStatus): void {
    console.error(`[MEMORY-GUARDIAN] 🚨 EMERGENCY: ${status.ratio}% (${status.heapUsedMB}MB / ${this.config.maxHeapMB}MB)`);
    this.emergencyCleanup();

    setTimeout(() => {
      const newUsage = process.memoryUsage();
      const newRatio = newUsage.heapUsed / (this.config.maxHeapMB * 1024 * 1024);

      if (newRatio >= this.config.emergencyThreshold) {
        console.error('[MEMORY-GUARDIAN] 🔄 Memory still critical after cleanup');
      } else {
        console.log('[MEMORY-GUARDIAN] ✅ Emergency cleanup successful');
        this.consecutiveHighMemory = 0;
      }
    }, 5000);
  }

  private softCleanup(): void {
    blockPool.clear();
    txPool.clear();

    this.cleanupCallbacks.forEach(cb => {
      try { cb(); } catch (e) { console.error('[MEMORY-GUARDIAN] Cleanup callback error:', e); }
    });

    if (Date.now() - this.lastGC > 30000 && global.gc) {
      global.gc();
      this.lastGC = Date.now();
      console.log('[MEMORY-GUARDIAN] Soft GC triggered');
    }
  }

  private aggressiveCleanup(): void {
    this.softCleanup();

    this.cleanupCallbacks.forEach(cb => {
      try { cb(); } catch (e) { console.error('[MEMORY-GUARDIAN] Cleanup callback error:', e); }
    });

    if (global.gc) {
      global.gc();
      this.lastGC = Date.now();
      console.log('[MEMORY-GUARDIAN] Aggressive GC triggered');
    }
  }

  private emergencyCleanup(): void {
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
      console.log('[MEMORY-GUARDIAN] Triple GC triggered');
    }
  }

  getStatus(): { status: string; memory: MemoryStatus; consecutiveHighMemory: number; objectPools: { block: any; tx: any } } {
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

    return {
      status: statusLabel,
      memory: status,
      consecutiveHighMemory: this.consecutiveHighMemory,
      objectPools: {
        block: blockPool.getStats(),
        tx: txPool.getStats(),
      },
    };
  }

  forceCleanup(level: 'soft' | 'aggressive' | 'emergency' = 'soft'): void {
    const status = this.getMemoryStatus();
    console.log(`[MEMORY-GUARDIAN] Manual ${level} cleanup requested`);

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
}

export const memoryGuardian = new MemoryGuardian();
