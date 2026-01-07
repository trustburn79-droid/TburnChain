// ============================================
// Enterprise Object Pool v2.0
// Production-grade object reuse system
// ============================================

interface PoolMetrics {
  acquireCount: number;
  releaseCount: number;
  createCount: number;
  evictCount: number;
  hitCount: number;
  missCount: number;
  peakSize: number;
  totalWaitTimeMs: number;
  lastAcquireAt: number | null;
  lastReleaseAt: number | null;
}

interface PoolHistory {
  timestamp: number;
  size: number;
  hitRate: number;
  acquireRate: number;
}

interface PoolConfig {
  maxSize: number;
  minSize: number;
  shrinkThreshold: number;
  growThreshold: number;
  adaptiveEnabled: boolean;
  historySize: number;
}

export class ObjectPoolEnterprise<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (obj: T) => void;
  private config: PoolConfig;
  
  private metrics: PoolMetrics = {
    acquireCount: 0,
    releaseCount: 0,
    createCount: 0,
    evictCount: 0,
    hitCount: 0,
    missCount: 0,
    peakSize: 0,
    totalWaitTimeMs: 0,
    lastAcquireAt: null,
    lastReleaseAt: null,
  };

  private history: PoolHistory[] = [];
  private lastHistoryRecord = 0;
  private historyInterval = 60000;

  constructor(
    factory: () => T,
    reset: (obj: T) => void,
    config: Partial<PoolConfig> = {}
  ) {
    this.factory = factory;
    this.reset = reset;
    this.config = {
      maxSize: config.maxSize ?? 1000,
      minSize: config.minSize ?? 0,
      shrinkThreshold: config.shrinkThreshold ?? 0.2,
      growThreshold: config.growThreshold ?? 0.8,
      adaptiveEnabled: config.adaptiveEnabled ?? true,
      historySize: config.historySize ?? 60,
    };
  }

  acquire(): T {
    const startTime = Date.now();
    this.metrics.acquireCount++;
    this.metrics.lastAcquireAt = startTime;

    let obj: T;
    if (this.pool.length > 0) {
      obj = this.pool.pop()!;
      this.metrics.hitCount++;
    } else {
      obj = this.factory();
      this.metrics.createCount++;
      this.metrics.missCount++;
    }

    this.metrics.totalWaitTimeMs += Date.now() - startTime;
    this.recordHistoryIfNeeded();
    
    return obj;
  }

  release(obj: T): void {
    this.metrics.releaseCount++;
    this.metrics.lastReleaseAt = Date.now();

    if (this.pool.length < this.config.maxSize) {
      this.reset(obj);
      this.pool.push(obj);
      
      if (this.pool.length > this.metrics.peakSize) {
        this.metrics.peakSize = this.pool.length;
      }
    } else {
      this.metrics.evictCount++;
    }

    this.recordHistoryIfNeeded();
  }

  prewarm(count: number): void {
    const toCreate = Math.min(count, this.config.maxSize - this.pool.length);
    for (let i = 0; i < toCreate; i++) {
      this.pool.push(this.factory());
      this.metrics.createCount++;
    }
    if (this.pool.length > this.metrics.peakSize) {
      this.metrics.peakSize = this.pool.length;
    }
  }

  shrink(targetSize?: number): number {
    const target = targetSize ?? this.config.minSize;
    const toRemove = Math.max(0, this.pool.length - target);
    if (toRemove > 0) {
      this.pool.splice(0, toRemove);
      this.metrics.evictCount += toRemove;
    }
    return toRemove;
  }

  private recordHistoryIfNeeded(): void {
    const now = Date.now();
    if (now - this.lastHistoryRecord >= this.historyInterval) {
      this.lastHistoryRecord = now;
      
      const hitRate = this.metrics.acquireCount > 0
        ? this.metrics.hitCount / this.metrics.acquireCount
        : 0;
      
      const acquireRate = this.history.length > 0
        ? (this.metrics.acquireCount - (this.history[this.history.length - 1]?.acquireRate || 0)) / 
          ((now - (this.history[this.history.length - 1]?.timestamp || now)) / 1000)
        : 0;

      this.history.push({
        timestamp: now,
        size: this.pool.length,
        hitRate,
        acquireRate: this.metrics.acquireCount,
      });

      if (this.history.length > this.config.historySize) {
        this.history.shift();
      }
    }
  }

  get size(): number {
    return this.pool.length;
  }

  getStats(): {
    poolSize: number;
    acquireCount: number;
    releaseCount: number;
    createCount: number;
    hitRate: string;
    missRate: string;
    evictCount: number;
    peakSize: number;
    efficiency: string;
  } {
    const hitRate = this.metrics.acquireCount > 0 
      ? (this.metrics.hitCount / this.metrics.acquireCount * 100).toFixed(1)
      : '0.0';
    
    const missRate = this.metrics.acquireCount > 0
      ? (this.metrics.missCount / this.metrics.acquireCount * 100).toFixed(1)
      : '0.0';

    const efficiency = this.metrics.createCount > 0
      ? ((this.metrics.acquireCount - this.metrics.createCount) / this.metrics.acquireCount * 100).toFixed(1)
      : '0.0';

    return {
      poolSize: this.pool.length,
      acquireCount: this.metrics.acquireCount,
      releaseCount: this.metrics.releaseCount,
      createCount: this.metrics.createCount,
      hitRate: `${hitRate}%`,
      missRate: `${missRate}%`,
      evictCount: this.metrics.evictCount,
      peakSize: this.metrics.peakSize,
      efficiency: `${efficiency}%`,
    };
  }

  getDetailedMetrics(): PoolMetrics & { 
    currentSize: number; 
    maxSize: number;
    utilization: string;
    avgWaitTimeMs: string;
  } {
    const utilization = this.config.maxSize > 0
      ? (this.pool.length / this.config.maxSize * 100).toFixed(1)
      : '0.0';

    const avgWaitTimeMs = this.metrics.acquireCount > 0
      ? (this.metrics.totalWaitTimeMs / this.metrics.acquireCount).toFixed(3)
      : '0.000';

    return {
      ...this.metrics,
      currentSize: this.pool.length,
      maxSize: this.config.maxSize,
      utilization: `${utilization}%`,
      avgWaitTimeMs: `${avgWaitTimeMs}ms`,
    };
  }

  getHistory(): PoolHistory[] {
    return [...this.history];
  }

  getPrometheusMetrics(name: string): string {
    const stats = this.getStats();
    const lines: string[] = [
      `# HELP tburn_pool_${name}_size Current pool size`,
      `# TYPE tburn_pool_${name}_size gauge`,
      `tburn_pool_${name}_size ${this.pool.length}`,
      '',
      `# HELP tburn_pool_${name}_acquire_total Total acquire operations`,
      `# TYPE tburn_pool_${name}_acquire_total counter`,
      `tburn_pool_${name}_acquire_total ${this.metrics.acquireCount}`,
      '',
      `# HELP tburn_pool_${name}_hit_total Total pool hits`,
      `# TYPE tburn_pool_${name}_hit_total counter`,
      `tburn_pool_${name}_hit_total ${this.metrics.hitCount}`,
      '',
      `# HELP tburn_pool_${name}_miss_total Total pool misses`,
      `# TYPE tburn_pool_${name}_miss_total counter`,
      `tburn_pool_${name}_miss_total ${this.metrics.missCount}`,
      '',
      `# HELP tburn_pool_${name}_create_total Total objects created`,
      `# TYPE tburn_pool_${name}_create_total counter`,
      `tburn_pool_${name}_create_total ${this.metrics.createCount}`,
      '',
      `# HELP tburn_pool_${name}_evict_total Total objects evicted`,
      `# TYPE tburn_pool_${name}_evict_total counter`,
      `tburn_pool_${name}_evict_total ${this.metrics.evictCount}`,
      '',
      `# HELP tburn_pool_${name}_peak_size Peak pool size`,
      `# TYPE tburn_pool_${name}_peak_size gauge`,
      `tburn_pool_${name}_peak_size ${this.metrics.peakSize}`,
    ];

    return lines.join('\n');
  }

  clear(): void {
    const cleared = this.pool.length;
    this.pool.length = 0;
    this.metrics.evictCount += cleared;
  }

  resetMetrics(): void {
    this.metrics = {
      acquireCount: 0,
      releaseCount: 0,
      createCount: 0,
      evictCount: 0,
      hitCount: 0,
      missCount: 0,
      peakSize: this.pool.length,
      totalWaitTimeMs: 0,
      lastAcquireAt: null,
      lastReleaseAt: null,
    };
    this.history = [];
  }

  getConfig(): PoolConfig {
    return { ...this.config };
  }
}

// Legacy compatibility wrapper
export class ObjectPool<T> extends ObjectPoolEnterprise<T> {
  constructor(
    factory: () => T,
    reset: (obj: T) => void,
    maxSize = 1000
  ) {
    super(factory, reset, { maxSize });
  }
}

interface PoolableBlock {
  number: number;
  hash: string;
  parentHash: string;
  timestamp: number;
  transactions: string[];
  stateRoot: string;
  receiptsRoot: string;
  gasUsed: number;
  gasLimit: number;
  validator: string;
}

interface PoolableTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  data: string;
  nonce: number;
  gasPrice: string;
  gasLimit: number;
}

export const blockPool = new ObjectPoolEnterprise<PoolableBlock>(
  () => ({
    number: 0,
    hash: '',
    parentHash: '',
    timestamp: 0,
    transactions: [],
    stateRoot: '',
    receiptsRoot: '',
    gasUsed: 0,
    gasLimit: 0,
    validator: '',
  }),
  (block) => {
    block.number = 0;
    block.hash = '';
    block.parentHash = '';
    block.timestamp = 0;
    block.transactions.length = 0;
    block.stateRoot = '';
    block.receiptsRoot = '';
    block.gasUsed = 0;
    block.gasLimit = 0;
    block.validator = '';
  },
  { maxSize: 100, minSize: 10, adaptiveEnabled: true }
);

export const txPool = new ObjectPoolEnterprise<PoolableTransaction>(
  () => ({
    hash: '',
    from: '',
    to: '',
    value: '0',
    data: '',
    nonce: 0,
    gasPrice: '0',
    gasLimit: 0,
  }),
  (tx) => {
    tx.hash = '';
    tx.from = '';
    tx.to = '';
    tx.value = '0';
    tx.data = '';
    tx.nonce = 0;
    tx.gasPrice = '0';
    tx.gasLimit = 0;
  },
  { maxSize: 5000, minSize: 100, adaptiveEnabled: true }
);

export function getAllPoolsPrometheusMetrics(): string {
  return [
    blockPool.getPrometheusMetrics('block'),
    '',
    txPool.getPrometheusMetrics('transaction'),
  ].join('\n');
}

export function getAllPoolsStats(): {
  block: ReturnType<typeof blockPool.getStats>;
  transaction: ReturnType<typeof txPool.getStats>;
  combined: {
    totalAcquires: number;
    totalCreates: number;
    overallHitRate: string;
    overallEfficiency: string;
  };
} {
  const blockStats = blockPool.getStats();
  const txStats = txPool.getStats();

  const totalAcquires = blockStats.acquireCount + txStats.acquireCount;
  const totalCreates = blockStats.createCount + txStats.createCount;
  const overallHitRate = totalAcquires > 0
    ? ((totalAcquires - totalCreates) / totalAcquires * 100).toFixed(1)
    : '0.0';

  return {
    block: blockStats,
    transaction: txStats,
    combined: {
      totalAcquires,
      totalCreates,
      overallHitRate: `${overallHitRate}%`,
      overallEfficiency: overallHitRate + '%',
    },
  };
}
