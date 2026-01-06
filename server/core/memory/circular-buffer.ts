/**
 * TBURN Enterprise Circular Buffer v7.0
 * 
 * High-performance fixed-memory circular buffer for metric storage
 * With ring buffer optimization and batch operations
 * 
 * @version 7.0.0-enterprise
 */

export interface MetricPoint {
  timestamp: number;
  name: string;
  value: number;
  tags?: Record<string, string>;
}

export interface BufferStats {
  size: number;
  capacity: number;
  utilization: number;
  memoryBytes: number;
  oldestTimestamp: number | null;
  newestTimestamp: number | null;
  overwrites: number;
}

export class CircularBuffer<T> {
  private buffer: (T | undefined)[];
  private head = 0;
  private tail = 0;
  private size = 0;
  private overwriteCount = 0;
  private memoryEstimate = 0;
  
  constructor(private capacity: number) {
    this.buffer = new Array(capacity);
  }
  
  push(item: T): void {
    const itemSize = this.estimateItemSize(item);
    
    if (this.size >= this.capacity) {
      // 오래된 데이터 메모리 추적
      const oldItem = this.buffer[this.head];
      if (oldItem) {
        this.memoryEstimate -= this.estimateItemSize(oldItem);
      }
      this.overwriteCount++;
    }
    
    this.buffer[this.tail] = item;
    this.memoryEstimate += itemSize;
    this.tail = (this.tail + 1) % this.capacity;
    
    if (this.size < this.capacity) {
      this.size++;
    } else {
      this.head = (this.head + 1) % this.capacity;
    }
  }
  
  // 배치 푸시 (고성능)
  pushBatch(items: T[]): void {
    for (const item of items) {
      this.push(item);
    }
  }
  
  get(index: number): T | undefined {
    if (index < 0 || index >= this.size) {
      return undefined;
    }
    const actualIndex = (this.head + index) % this.capacity;
    return this.buffer[actualIndex];
  }
  
  // 최신 N개 조회 (O(n))
  getLatest(count: number): T[] {
    const result: T[] = [];
    const actualCount = Math.min(count, this.size);
    
    for (let i = this.size - actualCount; i < this.size; i++) {
      const item = this.get(i);
      if (item !== undefined) {
        result.push(item);
      }
    }
    return result;
  }
  
  // 최신 1개 조회 (O(1))
  getLast(): T | undefined {
    if (this.size === 0) return undefined;
    const lastIndex = (this.tail - 1 + this.capacity) % this.capacity;
    return this.buffer[lastIndex];
  }
  
  // 조건 필터링
  filter(predicate: (item: T) => boolean): T[] {
    const result: T[] = [];
    for (let i = 0; i < this.size; i++) {
      const idx = (this.head + i) % this.capacity;
      const item = this.buffer[idx];
      if (item !== undefined && predicate(item)) {
        result.push(item);
      }
    }
    return result;
  }
  
  // 시간 범위 필터 (MetricPoint 전용, 최적화)
  filterByTimeRange(since: number, until: number = Date.now()): T[] {
    const result: T[] = [];
    
    // 뒤에서부터 탐색 (최신 데이터부터)
    for (let i = this.size - 1; i >= 0; i--) {
      const idx = (this.head + i) % this.capacity;
      const item = this.buffer[idx] as any;
      
      if (item?.timestamp === undefined) continue;
      
      if (item.timestamp < since) break; // 범위 이전이면 중단
      if (item.timestamp <= until) {
        result.unshift(item as T);
      }
    }
    
    return result;
  }
  
  forEach(callback: (item: T, index: number) => void): void {
    for (let i = 0; i < this.size; i++) {
      const idx = (this.head + i) % this.capacity;
      const item = this.buffer[idx];
      if (item !== undefined) {
        callback(item, i);
      }
    }
  }
  
  map<U>(callback: (item: T, index: number) => U): U[] {
    const result: U[] = [];
    this.forEach((item, index) => {
      result.push(callback(item, index));
    });
    return result;
  }
  
  reduce<U>(callback: (acc: U, item: T, index: number) => U, initial: U): U {
    let acc = initial;
    this.forEach((item, index) => {
      acc = callback(acc, item, index);
    });
    return acc;
  }
  
  // 집계 함수들 (MetricPoint 전용)
  aggregate(name?: string): {
    count: number;
    sum: number;
    avg: number;
    min: number;
    max: number;
  } {
    let count = 0;
    let sum = 0;
    let min = Infinity;
    let max = -Infinity;
    
    this.forEach((item: any) => {
      if (name && item.name !== name) return;
      if (typeof item.value !== 'number') return;
      
      count++;
      sum += item.value;
      min = Math.min(min, item.value);
      max = Math.max(max, item.value);
    });
    
    return {
      count,
      sum,
      avg: count > 0 ? sum / count : 0,
      min: count > 0 ? min : 0,
      max: count > 0 ? max : 0,
    };
  }
  
  toArray(): T[] {
    return this.filter(() => true);
  }
  
  clear(): void {
    this.buffer = new Array(this.capacity);
    this.head = 0;
    this.tail = 0;
    this.size = 0;
    this.memoryEstimate = 0;
    this.overwriteCount = 0;
  }
  
  // 용량 조절 (데이터 유지)
  resize(newCapacity: number): void {
    const items = this.toArray();
    this.capacity = newCapacity;
    this.buffer = new Array(newCapacity);
    this.head = 0;
    this.tail = 0;
    this.size = 0;
    this.memoryEstimate = 0;
    
    // 최신 데이터부터 새 용량만큼만 유지
    const toKeep = items.slice(-newCapacity);
    this.pushBatch(toKeep);
  }
  
  getSize(): number {
    return this.size;
  }
  
  getCapacity(): number {
    return this.capacity;
  }
  
  isFull(): boolean {
    return this.size === this.capacity;
  }
  
  isEmpty(): boolean {
    return this.size === 0;
  }
  
  private estimateItemSize(item: T): number {
    try {
      return JSON.stringify(item).length * 2;
    } catch {
      return 256; // 기본 추정
    }
  }
  
  getMemoryUsage(): { bytes: number; items: number } {
    return { 
      bytes: this.memoryEstimate, 
      items: this.size 
    };
  }
  
  getStats(): BufferStats {
    let oldestTimestamp: number | null = null;
    let newestTimestamp: number | null = null;
    
    if (this.size > 0) {
      const first = this.get(0) as any;
      const last = this.getLast() as any;
      oldestTimestamp = first?.timestamp ?? null;
      newestTimestamp = last?.timestamp ?? null;
    }
    
    return {
      size: this.size,
      capacity: this.capacity,
      utilization: this.size / this.capacity,
      memoryBytes: this.memoryEstimate,
      oldestTimestamp,
      newestTimestamp,
      overwrites: this.overwriteCount,
    };
  }
}
