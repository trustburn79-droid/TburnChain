import { Worker } from 'worker_threads';
import { EventEmitter } from 'events';
import * as path from 'path';
import {
  WorkerMessage,
  WorkerMessageType,
  WorkerPoolConfig,
  DEFAULT_WORKER_POOL_CONFIG,
  HealthCheckResponse,
  BlockProcessRequest,
  BlockProcessResult,
  ConsensusRoundRequest,
  ConsensusRoundResult,
  ShardSnapshotRequest,
  ShardSnapshotResult,
} from '@shared/worker-messages';

interface WorkerInfo {
  worker: Worker;
  workerId: number;
  status: 'idle' | 'busy' | 'unhealthy';
  lastHeartbeat: number;
  restartCount: number;
  processedTasks: number;
  pendingTasks: Map<string, {
    resolve: (result: unknown) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }>;
}

export class WorkerPool extends EventEmitter {
  private workers: Map<number, WorkerInfo> = new Map();
  private config: WorkerPoolConfig;
  private nextWorkerId: number = 0;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private taskQueue: Array<{
    type: WorkerMessageType;
    payload: unknown;
    resolve: (result: unknown) => void;
    reject: (error: Error) => void;
  }> = [];
  private isShuttingDown: boolean = false;
  private workerPath: string;
  
  private metrics = {
    totalTasksProcessed: 0,
    totalTasksFailed: 0,
    averageTaskDuration: 0,
    peakWorkerCount: 0,
    workerRestarts: 0,
  };

  constructor(config: Partial<WorkerPoolConfig> = {}) {
    super();
    this.config = { ...DEFAULT_WORKER_POOL_CONFIG, ...config };
    this.workerPath = path.join(__dirname, 'simulation-worker.js');
  }

  async initialize(): Promise<void> {
    console.log(`🔧 WorkerPool: Initializing with ${this.config.minWorkers} workers`);
    
    const initPromises: Promise<void>[] = [];
    for (let i = 0; i < this.config.minWorkers; i++) {
      initPromises.push(this.spawnWorker());
    }
    
    await Promise.all(initPromises);
    
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckIntervalMs);
    
    console.log(`✅ WorkerPool: ${this.workers.size} workers ready`);
  }

  private async spawnWorker(): Promise<void> {
    const workerId = this.nextWorkerId++;
    
    return new Promise((resolve, reject) => {
      try {
        const worker = new Worker(this.workerPath, {
          workerData: { workerId },
        });
        
        const workerInfo: WorkerInfo = {
          worker,
          workerId,
          status: 'idle',
          lastHeartbeat: Date.now(),
          restartCount: 0,
          processedTasks: 0,
          pendingTasks: new Map(),
        };
        
        worker.on('message', (message: WorkerMessage) => {
          this.handleWorkerMessage(workerId, message);
        });
        
        worker.on('error', (error) => {
          console.error(`Worker ${workerId} error:`, error);
          this.handleWorkerFailure(workerId, error);
        });
        
        worker.on('exit', (code) => {
          if (!this.isShuttingDown && code !== 0) {
            console.warn(`Worker ${workerId} exited with code ${code}`);
            this.handleWorkerExit(workerId, code);
          }
        });
        
        worker.once('online', () => {
          this.workers.set(workerId, workerInfo);
          this.metrics.peakWorkerCount = Math.max(this.metrics.peakWorkerCount, this.workers.size);
          resolve();
        });
        
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleWorkerMessage(workerId: number, message: WorkerMessage): void {
    const workerInfo = this.workers.get(workerId);
    if (!workerInfo) return;
    
    workerInfo.lastHeartbeat = Date.now();
    
    const pendingTask = workerInfo.pendingTasks.get(message.id);
    if (pendingTask) {
      clearTimeout(pendingTask.timeout);
      workerInfo.pendingTasks.delete(message.id);
      workerInfo.status = 'idle';
      workerInfo.processedTasks++;
      this.metrics.totalTasksProcessed++;
      
      if (message.type === WorkerMessageType.ERROR) {
        pendingTask.reject(new Error((message.payload as { error: string }).error));
        this.metrics.totalTasksFailed++;
      } else {
        pendingTask.resolve(message.payload);
      }
      
      this.processQueuedTasks();
    }
    
    this.emit('workerMessage', { workerId, message });
  }

  private handleWorkerFailure(workerId: number, error: Error): void {
    const workerInfo = this.workers.get(workerId);
    if (!workerInfo) return;
    
    workerInfo.status = 'unhealthy';
    
    for (const [taskId, task] of workerInfo.pendingTasks) {
      clearTimeout(task.timeout);
      task.reject(error);
      this.metrics.totalTasksFailed++;
    }
    workerInfo.pendingTasks.clear();
    
    if (this.config.restartOnFailure && workerInfo.restartCount < this.config.maxRestarts) {
      this.restartWorker(workerId);
    }
    
    this.emit('workerFailure', { workerId, error });
  }

  private handleWorkerExit(workerId: number, code: number): void {
    this.handleWorkerFailure(workerId, new Error(`Worker exited with code ${code}`));
  }

  private async restartWorker(workerId: number): Promise<void> {
    const workerInfo = this.workers.get(workerId);
    if (!workerInfo) return;
    
    console.log(`🔄 WorkerPool: Restarting worker ${workerId} (attempt ${workerInfo.restartCount + 1})`);
    
    try {
      await workerInfo.worker.terminate();
    } catch (e) {
    }
    
    this.workers.delete(workerId);
    this.metrics.workerRestarts++;
    
    await new Promise(resolve => setTimeout(resolve, this.config.restartDelayMs));
    
    if (!this.isShuttingDown && this.workers.size < this.config.minWorkers) {
      await this.spawnWorker();
    }
  }

  private performHealthCheck(): void {
    const now = Date.now();
    const unhealthyThreshold = this.config.healthCheckIntervalMs * 3;
    
    for (const [workerId, workerInfo] of this.workers) {
      if (now - workerInfo.lastHeartbeat > unhealthyThreshold) {
        workerInfo.status = 'unhealthy';
        console.warn(`Worker ${workerId} appears unhealthy (no heartbeat)`);
        
        if (this.config.restartOnFailure) {
          this.restartWorker(workerId);
        }
      }
    }
    
    if (this.taskQueue.length > 0 && this.workers.size < this.config.maxWorkers) {
      const idleWorkers = Array.from(this.workers.values()).filter(w => w.status === 'idle').length;
      if (idleWorkers === 0) {
        this.spawnWorker().catch(console.error);
      }
    }
  }

  private getIdleWorker(): WorkerInfo | undefined {
    for (const workerInfo of this.workers.values()) {
      if (workerInfo.status === 'idle') {
        return workerInfo;
      }
    }
    return undefined;
  }

  private processQueuedTasks(): void {
    while (this.taskQueue.length > 0) {
      const idleWorker = this.getIdleWorker();
      if (!idleWorker) break;
      
      const task = this.taskQueue.shift();
      if (task) {
        this.executeOnWorker(idleWorker, task.type, task.payload)
          .then(task.resolve)
          .catch(task.reject);
      }
    }
  }

  private executeOnWorker(
    workerInfo: WorkerInfo,
    type: WorkerMessageType,
    payload: unknown
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const messageId = `${workerInfo.workerId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const timeout = setTimeout(() => {
        workerInfo.pendingTasks.delete(messageId);
        workerInfo.status = 'unhealthy';
        reject(new Error(`Task timeout on worker ${workerInfo.workerId}`));
      }, 30000);
      
      workerInfo.pendingTasks.set(messageId, { resolve, reject, timeout });
      workerInfo.status = 'busy';
      
      const message: WorkerMessage = {
        type,
        id: messageId,
        timestamp: Date.now(),
        payload,
      };
      
      workerInfo.worker.postMessage(message);
    });
  }

  async execute<T>(type: WorkerMessageType, payload: unknown): Promise<T> {
    if (this.isShuttingDown) {
      throw new Error('WorkerPool is shutting down');
    }
    
    const idleWorker = this.getIdleWorker();
    
    if (idleWorker) {
      return this.executeOnWorker(idleWorker, type, payload) as Promise<T>;
    }
    
    return new Promise((resolve, reject) => {
      this.taskQueue.push({
        type,
        payload,
        resolve: resolve as (result: unknown) => void,
        reject,
      });
    });
  }

  async processBlock(request: BlockProcessRequest): Promise<BlockProcessResult> {
    return this.execute<BlockProcessResult>(WorkerMessageType.PROCESS_BLOCK, request);
  }

  async processConsensusRound(request: ConsensusRoundRequest): Promise<ConsensusRoundResult> {
    return this.execute<ConsensusRoundResult>(WorkerMessageType.CONSENSUS_ROUND, request);
  }

  async processShardSnapshot(request: ShardSnapshotRequest): Promise<ShardSnapshotResult> {
    return this.execute<ShardSnapshotResult>(WorkerMessageType.SHARD_SNAPSHOT, request);
  }

  async getWorkerHealth(): Promise<HealthCheckResponse[]> {
    const healthPromises = Array.from(this.workers.values()).map(workerInfo =>
      this.executeOnWorker(workerInfo, WorkerMessageType.HEALTH_CHECK, {})
        .then(result => result as HealthCheckResponse)
        .catch(() => ({
          workerId: workerInfo.workerId,
          status: 'unhealthy' as const,
          uptime: 0,
          processedBlocks: 0,
          processedConsensusRounds: 0,
          memoryUsage: 0,
          cpuUsage: 0,
          lastHeartbeat: 0,
        }))
    );
    
    return Promise.all(healthPromises);
  }

  getMetrics(): typeof this.metrics & { activeWorkers: number; queuedTasks: number } {
    return {
      ...this.metrics,
      activeWorkers: this.workers.size,
      queuedTasks: this.taskQueue.length,
    };
  }

  async shutdown(): Promise<void> {
    console.log('🛑 WorkerPool: Shutting down...');
    this.isShuttingDown = true;
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    for (const task of this.taskQueue) {
      task.reject(new Error('WorkerPool shutting down'));
    }
    this.taskQueue = [];
    
    const shutdownPromises = Array.from(this.workers.values()).map(workerInfo => {
      for (const [, task] of workerInfo.pendingTasks) {
        clearTimeout(task.timeout);
        task.reject(new Error('WorkerPool shutting down'));
      }
      
      return workerInfo.worker.terminate();
    });
    
    await Promise.all(shutdownPromises);
    this.workers.clear();
    
    console.log('✅ WorkerPool: Shutdown complete');
  }
}

let workerPoolInstance: WorkerPool | null = null;

export function getWorkerPool(): WorkerPool {
  if (!workerPoolInstance) {
    workerPoolInstance = new WorkerPool();
  }
  return workerPoolInstance;
}

export async function initializeWorkerPool(config?: Partial<WorkerPoolConfig>): Promise<WorkerPool> {
  if (workerPoolInstance) {
    return workerPoolInstance;
  }
  
  workerPoolInstance = new WorkerPool(config);
  await workerPoolInstance.initialize();
  return workerPoolInstance;
}

export async function shutdownWorkerPool(): Promise<void> {
  if (workerPoolInstance) {
    await workerPoolInstance.shutdown();
    workerPoolInstance = null;
  }
}
