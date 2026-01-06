/**
 * TBURN Enterprise Metrics Configuration v7.0
 * 
 * Production-grade configuration for 32GB RAM enterprise environment
 * Optimized for high-throughput blockchain operations (~210K TPS)
 * 
 * @version 7.0.0-enterprise
 */

export const METRICS_CONFIG = {
  // 수집 간격 (프로덕션 최적화)
  COLLECTION_INTERVAL: 10 * 1000,        // 10초 (정밀 모니터링)
  CRITICAL_METRICS_INTERVAL: 5 * 1000,   // 5초 (TPS, 에러율, 지연시간)
  HEAVY_METRICS_INTERVAL: 30 * 1000,     // 30초 (상세 블록 분석)
  
  // 블록 생산 설정 (초당 10블록 유지)
  BLOCK_PRODUCTION: {
    INTERVAL_MS: 100,              // 100ms (초당 10블록)
    MAX_TX_PER_BLOCK: 21000,       // 블록당 최대 트랜잭션 (210K TPS / 10 blocks)
    MAX_BLOCK_SIZE: 8 * 1024 * 1024, // 8MB 블록 크기 제한
    KEEP_RECENT_BLOCKS: 1000,      // 메모리에 1000블록 유지 (100초분)
    FLUSH_INTERVAL: 500,           // 500ms마다 디스크 플러시
    PARALLEL_VERIFY_WORKERS: 8,    // 8코어 병렬 검증
  },
  
  // 메트릭 보존 기간 (엔터프라이즈급)
  RETENTION: {
    RAW: 6 * 60 * 60 * 1000,              // 6시간 (원본)
    AGGREGATED_1M: 7 * 24 * 60 * 60 * 1000, // 7일 (1분 집계)
    AGGREGATED_1H: 30 * 24 * 60 * 60 * 1000, // 30일 (1시간 집계)
    AGGREGATED_1D: 365 * 24 * 60 * 60 * 1000, // 1년 (1일 집계)
  },
  
  // 메모리 한도 (32GB RAM - 25% 할당)
  MAX_MEMORY_MB: 8192,           // 8GB 메트릭 전용
  MAX_DATAPOINTS: 100000,        // 최대 100K 데이터포인트
  
  // 블록 캐시 설정 (32GB 환경)
  BLOCK_CACHE: {
    IN_MEMORY_BLOCKS: 1000,      // 최근 1000블록 메모리 (100초분)
    HOT_CACHE_BLOCKS: 10000,     // 10000블록 LRU 캐시 (~17분)
    WARM_CACHE_BLOCKS: 50000,    // 50000블록 워밍 캐시 (~83분)
    MAX_CACHE_SIZE_MB: 2048,     // 2GB 최대
    TTL_HOT_MS: 60 * 1000,       // 핫 캐시 TTL 60초
    TTL_WARM_MS: 300 * 1000,     // 워밍 캐시 TTL 5분
    PRELOAD_BLOCKS: 100,         // 시작 시 100블록 프리로드
  },
  
  // GC 임계값 (32GB 환경 - 여유있게)
  GC_THRESHOLDS: {
    WARNING: 0.70,      // 70% 사용 시 경고
    TRIGGER: 0.75,      // 75% 사용 시 GC 트리거
    CRITICAL: 0.85,     // 85% 사용 시 강제 정리
    EMERGENCY: 0.90,    // 90% 사용 시 비상 정리
  },
  
  // 모니터링 간격
  MONITORING_INTERVAL: 5 * 1000,   // 5초 모니터링
  HEALTH_CHECK_INTERVAL: 10 * 1000, // 10초 헬스체크
  
  // 메모리 풀 설정
  MEMORY_POOL: {
    ENABLED: true,
    INITIAL_SIZE_MB: 512,        // 초기 512MB 풀
    MAX_SIZE_MB: 4096,           // 최대 4GB 풀
    OBJECT_REUSE: true,          // 객체 재사용 활성화
    POOL_CLEANUP_INTERVAL: 60 * 1000, // 1분마다 풀 정리
  },
  
  // 힙 스냅샷 설정
  HEAP_SNAPSHOT: {
    ENABLED: true,
    AUTO_CAPTURE_THRESHOLD: 0.85, // 85% 이상 시 자동 캡처
    MAX_SNAPSHOTS: 10,           // 최대 10개 스냅샷 유지
    SNAPSHOT_DIR: '/tmp/tburn-heap-snapshots',
    CAPTURE_INTERVAL_MIN: 5 * 60 * 1000, // 최소 5분 간격
  },
  
  // 알림 설정
  ALERTING: {
    ENABLED: true,
    MEMORY_WARNING_THRESHOLD: 0.70,
    MEMORY_CRITICAL_THRESHOLD: 0.85,
    LATENCY_WARNING_MS: 100,
    LATENCY_CRITICAL_MS: 500,
    ERROR_RATE_WARNING: 0.01,     // 1%
    ERROR_RATE_CRITICAL: 0.05,   // 5%
    COOLDOWN_MS: 60 * 1000,      // 알림 쿨다운 1분
  },
  
  // 하드웨어 프로파일
  HARDWARE: {
    CPU_CORES: 8,
    RAM_GB: 32,
    TARGET_HEAP_GB: 8,            // 목표 힙 8GB
    MAX_HEAP_GB: 16,              // 최대 힙 16GB
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
