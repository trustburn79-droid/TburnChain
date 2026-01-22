-- 개발 DB 대용량 정리 스크립트
-- 90%의 오래된 데이터 삭제 (최신 10%만 유지)

-- 1. blocks 테이블 (90% 삭제)
DELETE FROM blocks 
WHERE id NOT IN (
  SELECT id FROM blocks 
  ORDER BY id DESC 
  LIMIT (SELECT COUNT(*) / 10 FROM blocks)
);

-- 2. consensus_rounds 테이블 (90% 삭제)
DELETE FROM consensus_rounds 
WHERE id NOT IN (
  SELECT id FROM consensus_rounds 
  ORDER BY id DESC 
  LIMIT (SELECT COUNT(*) / 10 FROM consensus_rounds)
);

-- 3. cross_shard_messages 테이블 (90% 삭제)
DELETE FROM cross_shard_messages 
WHERE id NOT IN (
  SELECT id FROM cross_shard_messages 
  ORDER BY id DESC 
  LIMIT (SELECT COUNT(*) / 10 FROM cross_shard_messages)
);

-- 4. ai_decisions 테이블 (90% 삭제)
DELETE FROM ai_decisions 
WHERE id NOT IN (
  SELECT id FROM ai_decisions 
  ORDER BY id DESC 
  LIMIT (SELECT COUNT(*) / 10 FROM ai_decisions)
);

-- 5. ai_usage_logs 테이블 (90% 삭제)
DELETE FROM ai_usage_logs 
WHERE id NOT IN (
  SELECT id FROM ai_usage_logs 
  ORDER BY id DESC 
  LIMIT (SELECT COUNT(*) / 10 FROM ai_usage_logs)
);

-- 6. governance_prevalidations 테이블 (90% 삭제)
DELETE FROM governance_prevalidations 
WHERE id NOT IN (
  SELECT id FROM governance_prevalidations 
  ORDER BY id DESC 
  LIMIT (SELECT COUNT(*) / 10 FROM governance_prevalidations)
);

-- 공간 회수
VACUUM FULL blocks;
VACUUM FULL consensus_rounds;
VACUUM FULL cross_shard_messages;
VACUUM FULL ai_decisions;
VACUUM FULL ai_usage_logs;
VACUUM FULL governance_prevalidations;
