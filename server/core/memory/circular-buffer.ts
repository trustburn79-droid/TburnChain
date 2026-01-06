/**
 * TBURN Enterprise Circular Buffer v6.0
 * 
 * Fixed-memory circular buffer implementation for metric storage
 * Automatically overwrites oldest data when capacity is reached
 * 
 * @version 6.0.0-enterprise
 */

export interface MetricPoint {
  timestamp: number;
  name: string;
  value: number;
  tags?: Record<string, string>;
}

export class CircularBuffer<T> {
  private buffer: (T | undefined)[];
  private head = 0;
  private tail = 0;
  private size = 0;
  
  constructor(private capacity: number) {
    this.buffer = new Array(capacity);
  }
  
  push(item: T): void {
    this.buffer[this.tail] = item;
    this.tail = (this.tail + 1) % this.capacity;
    
    if (this.size < this.capacity) {
      this.size++;
    } else {
      // 가장 오래된 데이터 덮어쓰기
      this.head = (this.head + 1) % this.capacity;
    }
  }
  
  get(index: number): T | undefined {
    if (index < 0 || index >= this.size) {
      return undefined;
    }
    const actualIndex = (this.head + index) % this.capacity;
    return this.buffer[actualIndex];
  }
  
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
  
  toArray(): T[] {
    return this.filter(() => true);
  }
  
  clear(): void {
    this.buffer = new Array(this.capacity);
    this.head = 0;
    this.tail = 0;
    this.size = 0;
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
  
  getMemoryUsage(): { bytes: number; items: number } {
    let bytes = 0;
    this.forEach((item) => {
      bytes += JSON.stringify(item).length * 2; // UTF-16
    });
    return { bytes, items: this.size };
  }
}
