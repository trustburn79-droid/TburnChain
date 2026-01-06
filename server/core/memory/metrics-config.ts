/**
 * TBURN Enterprise Metrics Configuration v6.0
 * 
 * Optimized intervals for memory-efficient metric collection
 * Based on production requirements: TPS maintenance + memory optimization
 * 
 * @version 6.0.0-enterprise
 */

export const METRICS_CONFIG = {
  // ★ 기존: 5초 → 변경: 30초 (프로덕션 권장)
  COLLECTION_INTERVAL: 30 * 1000,
  
  // 실시간 필요한 메트릭만 짧은 주기
  CRITICAL_METRICS_INTERVAL: 10 * 1000,  // TPS, 에러율
  
  // 무거운 메트릭은 긴 주기
  HEAVY_METRICS_INTERVAL: 60 * 1000,     // 상세 블록 분석
  
  // 블록 생산 설정 (초당 10블록 유지)
  BLOCK_PRODUCTION: {
    INTERVAL_MS: 100,           // 100ms (초당 10블록)
    MAX_TX_PER_BLOCK: 5000,     // 블록당 최대 트랜잭션
    MAX_BLOCK_SIZE: 2 * 1024 * 1024, // 2MB 블록 크기 제한
    KEEP_RECENT_BLOCKS: 100,    // 메모리에 100블록만 유지 (10초분)
    FLUSH_INTERVAL: 1000,       // 1초마다 디스크 플러시
  },
  
  // 메트릭 보존 기간
  RETENTION: {
    RAW: 1 * 60 * 60 * 1000,              // 1시간 (원본)
    AGGREGATED_1M: 24 * 60 * 60 * 1000,   // 24시간 (1분 집계)
    AGGREGATED_1H: 7 * 24 * 60 * 60 * 1000, // 7일 (1시간 집계)
  },
  
  // 메모리 한도 (Replit 512MB 환경 최적화)
  MAX_MEMORY_MB: 400,  // 메트릭용 최대 400MB
  MAX_DATAPOINTS: 10000, // 최대 데이터포인트
  
  // 블록 캐시 설정
  BLOCK_CACHE: {
    IN_MEMORY_BLOCKS: 1000,     // 최근 1000블록만 메모리 (100초분)
    HOT_CACHE_BLOCKS: 5000,     // 5000블록 LRU 캐시
    MAX_CACHE_SIZE_MB: 100,     // 100MB 최대
  },
  
  // GC 임계값
  GC_THRESHOLDS: {
    WARNING: 0.70,      // 70% 사용 시 경고
    TRIGGER: 0.75,      // 75% 사용 시 GC 트리거
    CRITICAL: 0.85,     // 85% 사용 시 강제 정리
    EMERGENCY: 0.90,    // 90% 사용 시 비상 정리
  },
  
  // 모니터링 간격
  MONITORING_INTERVAL: 10 * 1000,  // 10초
};

export type MetricsConfigType = typeof METRICS_CONFIG;
