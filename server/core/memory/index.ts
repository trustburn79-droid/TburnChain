/**
 * TBURN Enterprise Memory Management Module v7.0
 * 
 * Production-grade memory optimization for 32GB enterprise environment
 * - Advanced metrics configuration and collection
 * - High-performance circular buffer with batch operations
 * - Multi-level metrics aggregation with anomaly detection
 * - Multi-tier LRU block cache (Hot/Warm/Cold)
 * - Adaptive GC with memory pooling and heap snapshots
 * 
 * @version 7.0.0-enterprise
 */

import { metricsAggregator as _metricsAggregator } from './metrics-aggregator';
import { memoryManager as _memoryManager } from './memory-manager';
import { blockMemoryManager as _blockMemoryManager } from './block-memory-manager';

export { 
  METRICS_CONFIG, 
  detectHardwareProfile,
  type MetricsConfigType 
} from './metrics-config';

export { 
  CircularBuffer, 
  type MetricPoint,
  type BufferStats 
} from './circular-buffer';

export { 
  MetricsAggregator, 
  metricsAggregator,
  type AggregatedMetric,
  type AnomalyDetection 
} from './metrics-aggregator';

export { 
  BlockMemoryManager, 
  blockMemoryManager,
  MultiLevelLRUCache,
  type Block,
  type BlockRetentionPolicy,
  type CacheStats 
} from './block-memory-manager';

export { 
  MemoryManager, 
  memoryManager,
  type MemoryConfig,
  type MemoryMetrics,
  type HeapSnapshot 
} from './memory-manager';

/**
 * Initialize all memory management systems
 */
export function initializeMemoryManagement(): void {
  _metricsAggregator.start();
  _memoryManager.start();
  
  console.log('[MemoryModule] ✅ All memory management systems initialized (v7.0 Enterprise)');
}

/**
 * Shutdown all memory management systems
 */
export function shutdownMemoryManagement(): void {
  _metricsAggregator.stop();
  _memoryManager.stop();
  _blockMemoryManager.destroy();
  
  console.log('[MemoryModule] Memory management systems stopped');
}

/**
 * Get comprehensive system memory status
 */
export function getMemoryStatus(): {
  memory: ReturnType<typeof _memoryManager.getMetrics>;
  aggregator: ReturnType<typeof _metricsAggregator.getStats>;
  blockCache: ReturnType<typeof _blockMemoryManager.getStats>;
  timestamp: string;
} {
  return {
    memory: _memoryManager.getMetrics(),
    aggregator: _metricsAggregator.getStats(),
    blockCache: _blockMemoryManager.getStats(),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Force system-wide memory cleanup
 */
export function forceGlobalCleanup(): void {
  _memoryManager.forceCleanup();
  console.log('[MemoryModule] Global cleanup completed');
}
