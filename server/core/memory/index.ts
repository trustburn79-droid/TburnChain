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

import { metricsAggregator as _metricsAggregator } from './metrics-aggregator';
import { memoryManager as _memoryManager } from './memory-manager';

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
  _metricsAggregator.start();
  _memoryManager.start();
  
  console.log('[MemoryModule] ✅ All memory management systems initialized');
}

/**
 * Shutdown all memory management systems
 */
export function shutdownMemoryManagement(): void {
  _metricsAggregator.stop();
  _memoryManager.stop();
  
  console.log('[MemoryModule] Memory management systems stopped');
}
