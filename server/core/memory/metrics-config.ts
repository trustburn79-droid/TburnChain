/**
 * TBURN Enterprise Metrics Configuration v7.0
 * 
 * Auto-scaling configuration that adapts to available memory
 * Supports both small (512MB) and large (32GB) environments
 * 
 * @version 7.0.0-enterprise
 */

import * as os from 'os';

const detectedRAM = Math.round(os.totalmem() / (1024 * 1024 * 1024));
const detectedCores = os.cpus()?.length || 4;
const isLargeEnv = detectedRAM >= 8;

export const METRICS_CONFIG = {
  // 수집 간격 (환경 적응형)
  COLLECTION_INTERVAL: isLargeEnv ? 10 * 1000 : 30 * 1000,
  CRITICAL_METRICS_INTERVAL: isLargeEnv ? 5 * 1000 : 10 * 1000,
  HEAVY_METRICS_INTERVAL: isLargeEnv ? 30 * 1000 : 60 * 1000,
  
  // 블록 생산 설정
  BLOCK_PRODUCTION: {
    INTERVAL_MS: 100,
    MAX_TX_PER_BLOCK: isLargeEnv ? 21000 : 5000,
    MAX_BLOCK_SIZE: isLargeEnv ? 8 * 1024 * 1024 : 2 * 1024 * 1024,
    KEEP_RECENT_BLOCKS: isLargeEnv ? 1000 : 100,
    FLUSH_INTERVAL: isLargeEnv ? 500 : 1000,
    PARALLEL_VERIFY_WORKERS: Math.min(detectedCores, 8),
  },
  
  // 메트릭 보존 기간
  RETENTION: {
    RAW: isLargeEnv ? 6 * 60 * 60 * 1000 : 1 * 60 * 60 * 1000,
    AGGREGATED_1M: isLargeEnv ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    AGGREGATED_1H: isLargeEnv ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
    AGGREGATED_1D: 365 * 24 * 60 * 60 * 1000,
  },
  
  // 메모리 한도 (자동 스케일링)
  MAX_MEMORY_MB: isLargeEnv ? 2048 : 150,
  MAX_DATAPOINTS: isLargeEnv ? 50000 : 1000,
  
  // 블록 캐시 설정 (자동 스케일링)
  BLOCK_CACHE: {
    IN_MEMORY_BLOCKS: isLargeEnv ? 500 : 50,
    HOT_CACHE_BLOCKS: isLargeEnv ? 2000 : 100,
    WARM_CACHE_BLOCKS: isLargeEnv ? 5000 : 200,
    MAX_CACHE_SIZE_MB: isLargeEnv ? 512 : 15,
    TTL_HOT_MS: 60 * 1000,
    TTL_WARM_MS: 300 * 1000,
    PRELOAD_BLOCKS: isLargeEnv ? 50 : 10,
  },
  
  // GC 임계값 (작은 환경은 더 보수적)
  GC_THRESHOLDS: {
    WARNING: isLargeEnv ? 0.70 : 0.55,
    TRIGGER: isLargeEnv ? 0.75 : 0.60,
    CRITICAL: isLargeEnv ? 0.85 : 0.70,
    EMERGENCY: isLargeEnv ? 0.90 : 0.80,
  },
  
  // 모니터링 간격
  MONITORING_INTERVAL: isLargeEnv ? 5 * 1000 : 10 * 1000,
  HEALTH_CHECK_INTERVAL: 10 * 1000,
  
  // 메모리 풀 설정 (작은 환경에서는 비활성화)
  MEMORY_POOL: {
    ENABLED: isLargeEnv,
    INITIAL_SIZE_MB: isLargeEnv ? 256 : 0,
    MAX_SIZE_MB: isLargeEnv ? 1024 : 0,
    OBJECT_REUSE: isLargeEnv,
    POOL_CLEANUP_INTERVAL: 60 * 1000,
  },
  
  // 힙 스냅샷 설정
  HEAP_SNAPSHOT: {
    ENABLED: isLargeEnv,
    AUTO_CAPTURE_THRESHOLD: 0.85,
    MAX_SNAPSHOTS: 5,
    SNAPSHOT_DIR: '/tmp/tburn-heap-snapshots',
    CAPTURE_INTERVAL_MIN: 5 * 60 * 1000,
  },
  
  // 알림 설정
  ALERTING: {
    ENABLED: true,
    MEMORY_WARNING_THRESHOLD: isLargeEnv ? 0.70 : 0.55,
    MEMORY_CRITICAL_THRESHOLD: isLargeEnv ? 0.85 : 0.70,
    LATENCY_WARNING_MS: 100,
    LATENCY_CRITICAL_MS: 500,
    ERROR_RATE_WARNING: 0.01,
    ERROR_RATE_CRITICAL: 0.05,
    COOLDOWN_MS: 60 * 1000,
  },
  
  // 감지된 하드웨어 프로파일
  HARDWARE: {
    CPU_CORES: detectedCores,
    RAM_GB: detectedRAM,
    TARGET_HEAP_GB: isLargeEnv ? Math.min(detectedRAM / 4, 8) : 0.3,
    MAX_HEAP_GB: isLargeEnv ? Math.min(detectedRAM / 2, 16) : 0.5,
    IS_LARGE_ENV: isLargeEnv,
    DETECTED_AT: new Date().toISOString(),
  },
};

export type MetricsConfigType = typeof METRICS_CONFIG;

// 하드웨어 프로파일 자동 감지
export function detectHardwareProfile(): {
  cpuCores: number;
  ramGB: number;
  profile: 'development' | 'staging' | 'production' | 'enterprise';
} {
  const cpuCores = METRICS_CONFIG.HARDWARE.CPU_CORES;
  const ramGB = METRICS_CONFIG.HARDWARE.RAM_GB;
  
  let profile: 'development' | 'staging' | 'production' | 'enterprise';
  
  if (ramGB >= 32 && cpuCores >= 8) {
    profile = 'enterprise';
  } else if (ramGB >= 16 && cpuCores >= 4) {
    profile = 'production';
  } else if (ramGB >= 8 && cpuCores >= 2) {
    profile = 'staging';
  } else {
    profile = 'development';
  }
  
  return { cpuCores, ramGB, profile };
}
