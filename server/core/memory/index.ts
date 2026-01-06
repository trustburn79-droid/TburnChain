/**
 * TBURN Enterprise Memory Management Module v6.0
 * 
 * Complete memory optimization system with:
 * - Metrics configuration and collection
 * - Circular buffer for fixed-memory storage
 * - Metrics aggregation with downsampling
 * - LRU block cache management
 * - Automatic GC and emergency cleanup
 * 
 * @version 6.0.0-enterprise
 */

export { METRICS_CONFIG, type MetricsConfigType } from './metrics-config';
export { CircularBuffer, type MetricPoint } from './circular-buffer';
export { 
  MetricsAggregator, 
  metricsAggregator,
  type AggregatedMetric 
} from './metrics-aggregator';
export { 
  BlockMemoryManager, 
  blockMemoryManager,
  LRUCache,
  type Block,
  type BlockRetentionPolicy 
} from './block-memory-manager';
export { 
  MemoryManager, 
  memoryManager,
  type MemoryConfig,
  type MemoryMetrics 
} from './memory-manager';

/**
 * Initialize all memory management systems
 */
export function initializeMemoryManagement(): void {
  const { metricsAggregator } = require('./metrics-aggregator');
  const { memoryManager } = require('./memory-manager');
  
  metricsAggregator.start();
  memoryManager.start();
  
  console.log('[MemoryModule] ✅ All memory management systems initialized');
}

/**
 * Shutdown all memory management systems
 */
export function shutdownMemoryManagement(): void {
  const { metricsAggregator } = require('./metrics-aggregator');
  const { memoryManager } = require('./memory-manager');
  
  metricsAggregator.stop();
  memoryManager.stop();
  
  console.log('[MemoryModule] Memory management systems stopped');
}
