export class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (obj: T) => void;
  private maxSize: number;
  private acquireCount = 0;
  private releaseCount = 0;
  private createCount = 0;

  constructor(
    factory: () => T,
    reset: (obj: T) => void,
    maxSize = 1000
  ) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;
  }

  acquire(): T {
    this.acquireCount++;
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    this.createCount++;
    return this.factory();
  }

  release(obj: T): void {
    this.releaseCount++;
    if (this.pool.length < this.maxSize) {
      this.reset(obj);
      this.pool.push(obj);
    }
  }

  get size(): number {
    return this.pool.length;
  }

  getStats(): { poolSize: number; acquireCount: number; releaseCount: number; createCount: number; hitRate: string } {
    const hitRate = this.acquireCount > 0 
      ? ((this.acquireCount - this.createCount) / this.acquireCount * 100).toFixed(1)
      : '0.0';
    return {
      poolSize: this.pool.length,
      acquireCount: this.acquireCount,
      releaseCount: this.releaseCount,
      createCount: this.createCount,
      hitRate: `${hitRate}%`,
    };
  }

  clear(): void {
    this.pool.length = 0;
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

export const blockPool = new ObjectPool<PoolableBlock>(
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
  100
);

export const txPool = new ObjectPool<PoolableTransaction>(
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
  5000
);
