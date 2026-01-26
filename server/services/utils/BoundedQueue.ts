/**
 * BoundedQueue - 바운드 큐 및 백프레셔 메커니즘
 * 
 * 고부하 시 메모리 고갈 방지를 위한 엔터프라이즈급 큐 시스템
 * - 최대 크기 제한
 * - 백프레셔 신호
 * - 오래된 항목 자동 제거
 * - 메트릭 수집
 */

import { EventEmitter } from 'events';

export interface BoundedQueueOptions {
  maxSize: number;
  highWaterMark?: number;
  lowWaterMark?: number;
  ttlMs?: number;
  evictionPolicy?: 'fifo' | 'priority' | 'ttl';
  name?: string;
}

export interface QueueItem<T> {
  data: T;
  timestamp: number;
  priority?: number;
}

export interface QueueMetrics {
  size: number;
  maxSize: number;
  totalEnqueued: number;
  totalDequeued: number;
  totalDropped: number;
  totalExpired: number;
  isPaused: boolean;
  utilizationPercent: number;
}

export class BoundedQueue<T> extends EventEmitter {
  private queue: QueueItem<T>[] = [];
  private readonly options: Required<BoundedQueueOptions>;
  private metrics: QueueMetrics;
  private isPaused: boolean = false;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(options: BoundedQueueOptions) {
    super();
    
    this.options = {
      maxSize: options.maxSize,
      highWaterMark: options.highWaterMark ?? Math.floor(options.maxSize * 0.8),
      lowWaterMark: options.lowWaterMark ?? Math.floor(options.maxSize * 0.5),
      ttlMs: options.ttlMs ?? 0,
      evictionPolicy: options.evictionPolicy ?? 'fifo',
      name: options.name ?? 'BoundedQueue',
    };

    this.metrics = {
      size: 0,
      maxSize: this.options.maxSize,
      totalEnqueued: 0,
      totalDequeued: 0,
      totalDropped: 0,
      totalExpired: 0,
      isPaused: false,
      utilizationPercent: 0,
    };

    if (this.options.ttlMs > 0) {
      this.startCleanup();
    }
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.removeExpired();
    }, Math.min(this.options.ttlMs, 60000));
  }

  private removeExpired(): void {
    if (this.options.ttlMs <= 0) return;

    const now = Date.now();
    const expireTime = now - this.options.ttlMs;
    let expired = 0;

    this.queue = this.queue.filter(item => {
      if (item.timestamp < expireTime) {
        expired++;
        return false;
      }
      return true;
    });

    if (expired > 0) {
      this.metrics.totalExpired += expired;
      this.updateMetrics();
      this.emit('expired', expired);
    }
  }

  private updateMetrics(): void {
    this.metrics.size = this.queue.length;
    this.metrics.utilizationPercent = (this.queue.length / this.options.maxSize) * 100;
    this.metrics.isPaused = this.isPaused;
  }

  enqueue(data: T, priority: number = 0): boolean {
    if (this.queue.length >= this.options.maxSize) {
      if (this.options.evictionPolicy === 'fifo') {
        const evicted = this.queue.shift();
        if (evicted) {
          this.metrics.totalDropped++;
          this.emit('dropped', evicted.data);
        }
      } else {
        this.metrics.totalDropped++;
        this.emit('rejected', data);
        return false;
      }
    }

    const item: QueueItem<T> = {
      data,
      timestamp: Date.now(),
      priority,
    };

    if (this.options.evictionPolicy === 'priority') {
      const insertIndex = this.queue.findIndex(q => (q.priority ?? 0) < priority);
      if (insertIndex === -1) {
        this.queue.push(item);
      } else {
        this.queue.splice(insertIndex, 0, item);
      }
    } else {
      this.queue.push(item);
    }

    this.metrics.totalEnqueued++;
    this.updateMetrics();

    if (!this.isPaused && this.queue.length >= this.options.highWaterMark) {
      this.isPaused = true;
      this.emit('backpressure', true);
    }

    return true;
  }

  dequeue(): T | undefined {
    const item = this.queue.shift();
    if (!item) return undefined;

    this.metrics.totalDequeued++;
    this.updateMetrics();

    if (this.isPaused && this.queue.length <= this.options.lowWaterMark) {
      this.isPaused = false;
      this.emit('backpressure', false);
    }

    return item.data;
  }

  peek(): T | undefined {
    return this.queue[0]?.data;
  }

  size(): number {
    return this.queue.length;
  }

  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  isFull(): boolean {
    return this.queue.length >= this.options.maxSize;
  }

  isBackpressured(): boolean {
    return this.isPaused;
  }

  clear(): void {
    this.queue = [];
    this.updateMetrics();
    if (this.isPaused) {
      this.isPaused = false;
      this.emit('backpressure', false);
    }
  }

  getMetrics(): QueueMetrics {
    return { ...this.metrics };
  }

  toArray(): T[] {
    return this.queue.map(item => item.data);
  }

  drain(count?: number): T[] {
    const drainCount = count ?? this.queue.length;
    const items: T[] = [];
    
    for (let i = 0; i < drainCount && this.queue.length > 0; i++) {
      const item = this.dequeue();
      if (item !== undefined) {
        items.push(item);
      }
    }
    
    return items;
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
    this.removeAllListeners();
  }
}

export class BoundedMap<K, V> extends EventEmitter {
  private map: Map<K, { value: V; timestamp: number }> = new Map();
  private readonly maxSize: number;
  private readonly ttlMs: number;
  private readonly name: string;
  private totalEvicted: number = 0;

  constructor(maxSize: number, ttlMs: number = 0, name: string = 'BoundedMap') {
    super();
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
    this.name = name;

    if (ttlMs > 0) {
      setInterval(() => this.cleanupExpired(), Math.min(ttlMs, 60000));
    }
  }

  private cleanupExpired(): void {
    if (this.ttlMs <= 0) return;
    
    const now = Date.now();
    const expireTime = now - this.ttlMs;
    const keysToDelete: K[] = [];

    this.map.forEach((entry, key) => {
      if (entry.timestamp < expireTime) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.map.delete(key));

    if (keysToDelete.length > 0) {
      this.totalEvicted += keysToDelete.length;
      this.emit('expired', keysToDelete.length);
    }
  }

  set(key: K, value: V): boolean {
    if (this.map.size >= this.maxSize && !this.map.has(key)) {
      const firstKey = this.map.keys().next().value;
      if (firstKey !== undefined) {
        this.map.delete(firstKey);
        this.totalEvicted++;
        this.emit('evicted', firstKey);
      }
    }

    this.map.set(key, { value, timestamp: Date.now() });
    return true;
  }

  get(key: K): V | undefined {
    const entry = this.map.get(key);
    if (!entry) return undefined;

    if (this.ttlMs > 0 && Date.now() - entry.timestamp > this.ttlMs) {
      this.map.delete(key);
      return undefined;
    }

    return entry.value;
  }

  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: K): boolean {
    return this.map.delete(key);
  }

  size(): number {
    return this.map.size;
  }

  clear(): void {
    this.map.clear();
  }

  keys(): IterableIterator<K> {
    return this.map.keys();
  }

  values(): V[] {
    return Array.from(this.map.values()).map(e => e.value);
  }

  entries(): [K, V][] {
    const result: [K, V][] = [];
    this.map.forEach((e, k) => result.push([k, e.value]));
    return result;
  }

  getMetrics(): { size: number; maxSize: number; totalEvicted: number } {
    return {
      size: this.map.size,
      maxSize: this.maxSize,
      totalEvicted: this.totalEvicted,
    };
  }
}

export const createBoundedQueue = <T>(
  name: string,
  maxSize: number,
  options?: Partial<BoundedQueueOptions>
): BoundedQueue<T> => {
  const queue = new BoundedQueue<T>({
    name,
    maxSize,
    ...options,
  });

  queue.on('backpressure', (isPaused: boolean) => {
    console.log(`[${name}] Backpressure ${isPaused ? 'ACTIVATED' : 'RELEASED'} - Queue size: ${queue.size()}/${maxSize}`);
  });

  queue.on('dropped', () => {
    const metrics = queue.getMetrics();
    if (metrics.totalDropped % 100 === 0) {
      console.warn(`[${name}] Total dropped: ${metrics.totalDropped}`);
    }
  });

  return queue;
};
