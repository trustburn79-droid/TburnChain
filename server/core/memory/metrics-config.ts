/**
 * TBURN Enterprise Metrics Configuration v7.0
 * 
 * Auto-scaling configuration that adapts to available memory
 * Supports both small (512MB) and large (32GB) environments
 * 
 * @version 7.0.1-enterprise
 * @updated 2026-01-06: Added V8 heap detection for Replit environments
 */

import * as os from 'os';
import * as v8 from 'v8';

const detectedRAM = Math.round(os.totalmem() / (1024 * 1024 * 1024));
const detectedCores = os.cpus()?.length || 4;

// V8 힙 제한 감지 (Replit 환경에서 실제 사용 가능한 힙 확인)
const heapStats = v8.getHeapStatistics();
const v8HeapLimitMB = Math.floor(heapStats.heap_size_limit / (1024 * 1024));
const isReplitEnv = Boolean(process.env.REPL_ID);

// ★ [2026-01-08] DEV_SAFE_MODE 기본 활성화 - 빠른 페이지 로딩 우선
// 힙은 크게 유지 (OOM 방지), 무거운 엔터프라이즈 초기화는 비활성화
// 엔터프라이즈 기능 필요시: DEV_SAFE_MODE=false 환경변수 설정
const envDevSafeMode = process.env.DEV_SAFE_MODE;
export const DEV_SAFE_MODE = envDevSafeMode === 'false' ? false : true; // 기본값 true (빠른 시작)

// V8 힙 2GB 이상이어도 DEV_SAFE_MODE 우선 적용
// isLargeEnv는 힙 설정에만 영향, 시작 시간에는 영향 없음
const isLargeEnv = !DEV_SAFE_MODE && v8HeapLimitMB >= 2048;

console.log(`[METRICS_CONFIG] V8 heap limit: ${v8HeapLimitMB}MB, Replit: ${isReplitEnv}, DEV_SAFE_MODE: ${DEV_SAFE_MODE}, isLargeEnv: ${isLargeEnv}`);

export const METRICS_CONFIG = {
  // 수집 간격 (환경 적응형) - 프로덕션 안정성을 위해 더 긴 간격
  COLLECTION_INTERVAL: isLargeEnv ? 10 * 1000 : 120 * 1000,
  CRITICAL_METRICS_INTERVAL: isLargeEnv ? 5 * 1000 : 60 * 1000,
  HEAVY_METRICS_INTERVAL: isLargeEnv ? 30 * 1000 : 300 * 1000,
  
  // 블록 생산 설정 - 메모리 절약을 위해 축소
  BLOCK_PRODUCTION: {
    INTERVAL_MS: 100,
    MAX_TX_PER_BLOCK: isLargeEnv ? 21000 : 2000,
    MAX_BLOCK_SIZE: isLargeEnv ? 8 * 1024 * 1024 : 1 * 1024 * 1024,
    KEEP_RECENT_BLOCKS: isLargeEnv ? 1000 : 25,
    FLUSH_INTERVAL: isLargeEnv ? 500 : 2000,
    PARALLEL_VERIFY_WORKERS: Math.min(detectedCores, isLargeEnv ? 8 : 2),
  },
  
  // 메트릭 보존 기간 - 프로덕션 안정성을 위해 더 짧은 보존
  RETENTION: {
    RAW: isLargeEnv ? 6 * 60 * 60 * 1000 : 15 * 60 * 1000,
    AGGREGATED_1M: isLargeEnv ? 7 * 24 * 60 * 60 * 1000 : 6 * 60 * 60 * 1000,
    AGGREGATED_1H: isLargeEnv ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    AGGREGATED_1D: isLargeEnv ? 365 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
  },
  
  // 메모리 한도 (자동 스케일링) - 프로덕션 안정성을 위해 더 작은 한도
  MAX_MEMORY_MB: isLargeEnv ? 2048 : 30,
  MAX_DATAPOINTS: isLargeEnv ? 50000 : 100,
  
  // 블록 캐시 설정 (자동 스케일링) - 프로덕션 안정성을 위해 대폭 축소
  BLOCK_CACHE: {
    IN_MEMORY_BLOCKS: isLargeEnv ? 500 : 5,
    HOT_CACHE_BLOCKS: isLargeEnv ? 2000 : 10,
    WARM_CACHE_BLOCKS: isLargeEnv ? 5000 : 20,
    MAX_CACHE_SIZE_MB: isLargeEnv ? 512 : 2,
    TTL_HOT_MS: isLargeEnv ? 60 * 1000 : 15 * 1000,
    TTL_WARM_MS: isLargeEnv ? 300 * 1000 : 30 * 1000,
    PRELOAD_BLOCKS: isLargeEnv ? 50 : 0,
  },
  
  // GC 임계값 - 프로덕션 안정성을 위해 더 일찍 정리
  GC_THRESHOLDS: {
    WARNING: isLargeEnv ? 0.70 : 0.40,
    TRIGGER: isLargeEnv ? 0.75 : 0.50,
    CRITICAL: isLargeEnv ? 0.85 : 0.60,
    EMERGENCY: isLargeEnv ? 0.90 : 0.70,
  },
  
  // 모니터링 간격 - 덜 자주 체크하여 오버헤드 감소
  MONITORING_INTERVAL: isLargeEnv ? 5 * 1000 : 30 * 1000,
  HEALTH_CHECK_INTERVAL: isLargeEnv ? 10 * 1000 : 30 * 1000,
  
  // 메모리 풀 설정 (작은 환경에서는 비활성화)
  MEMORY_POOL: {
    ENABLED: isLargeEnv,
    INITIAL_SIZE_MB: isLargeEnv ? 256 : 0,
    MAX_SIZE_MB: isLargeEnv ? 1024 : 0,
    OBJECT_REUSE: isLargeEnv,
    POOL_CLEANUP_INTERVAL: 60 * 1000,
  },
  
  // 힙 스냅샷 설정 - 작은 환경에서 비활성화
  HEAP_SNAPSHOT: {
    ENABLED: false,
    AUTO_CAPTURE_THRESHOLD: 0.85,
    MAX_SNAPSHOTS: 3,
    SNAPSHOT_DIR: '/tmp/tburn-heap-snapshots',
    CAPTURE_INTERVAL_MIN: 10 * 60 * 1000,
  },
  
  // 알림 설정 - 더 일찍 경고
  ALERTING: {
    ENABLED: true,
    MEMORY_WARNING_THRESHOLD: isLargeEnv ? 0.70 : 0.40,
    MEMORY_CRITICAL_THRESHOLD: isLargeEnv ? 0.85 : 0.60,
    LATENCY_WARNING_MS: 100,
    LATENCY_CRITICAL_MS: 500,
    ERROR_RATE_WARNING: 0.01,
    ERROR_RATE_CRITICAL: 0.05,
    COOLDOWN_MS: 120 * 1000,
  },
  
  // 감지된 하드웨어 프로파일 - V8 힙 최대 활용
  HARDWARE: {
    CPU_CORES: detectedCores,
    RAM_GB: detectedRAM,
    V8_HEAP_LIMIT_MB: v8HeapLimitMB,
    // ★ [2026-01-08] V8 힙 기준으로 최대 활용 (8GB 힙 → 6GB 타깃, 7GB 최대)
    TARGET_HEAP_GB: Math.min(v8HeapLimitMB / 1024 * 0.75, 6), // V8 힙의 75%, 최대 6GB
    MAX_HEAP_GB: Math.min(v8HeapLimitMB / 1024 * 0.9, 7.5),   // V8 힙의 90%, 최대 7.5GB
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
