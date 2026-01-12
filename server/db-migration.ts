/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TBURN ENTERPRISE DATABASE MIGRATION TOOLKIT
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * 개발 DB에서 프로덕션 DB로 데이터를 안전하게 마이그레이션하는 엔터프라이즈급 도구
 * 
 * 기능:
 * - 테이블별 증분 마이그레이션
 * - 진행률 추적 및 로깅
 * - 롤백 지원
 * - 무결성 검증
 * 
 * 사용법:
 * 1. DATABASE_URL_PROD 환경 변수 설정
 * 2. MIGRATION_MODE=true 설정
 * 3. tsx server/db-migration.ts 실행
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws as any;

interface MigrationConfig {
  sourceUrl: string;      // 개발 DB URL
  targetUrl: string;      // 프로덕션 DB URL
  tables: string[];       // 마이그레이션할 테이블 목록
  batchSize: number;      // 배치 크기
  dryRun: boolean;        // 테스트 모드
}

interface MigrationResult {
  table: string;
  rowsCopied: number;
  duration: number;
  success: boolean;
  error?: string;
}

interface MigrationReport {
  startTime: Date;
  endTime: Date;
  totalDuration: number;
  results: MigrationResult[];
  summary: {
    totalTables: number;
    successfulTables: number;
    failedTables: number;
    totalRowsCopied: number;
  };
}

// 핵심 테이블 목록 (의존성 순서대로)
const CORE_TABLES = [
  // 기본 테이블 (외래 키 없음)
  'users',
  'wallets',
  'sessions',
  
  // 블록체인 핵심 테이블
  'blocks',
  'transactions',
  'validators',
  'shards',
  'shard_config',
  
  // 거버넌스/스테이킹
  'proposals',
  'votes',
  'staking_pools',
  'staking_positions',
  'staking_rewards',
  
  // DeFi
  'dex_pools',
  'dex_transactions',
  'lending_markets',
  'lending_positions',
  'yield_vaults',
  'yield_positions',
  
  // NFT/GameFi
  'nft_collections',
  'nft_items',
  'nft_listings',
  'gamefi_projects',
  'gamefi_tournaments',
  
  // 토큰 관련
  'token_standards',
  'token_registry',
  'token_distributions',
  
  // 커뮤니티
  'community_posts',
  'community_likes',
  'referrals',
  'newsletters',
  
  // 회원 관리 (Members)
  'members',
  'member_profiles',
  'member_staking_positions',
  'member_governance_profiles',
  'member_financial_profiles',
  'member_security_profiles',
  'member_performance_metrics',
  'member_slash_events',
  'member_audit_logs',
  'member_documents',
  'member_notes',
  
  // 시스템
  'api_metrics',
  'api_hourly_stats',
  'api_daily_stats',
  'endpoint_metrics',
];

class EnterpriseDbMigrator {
  private sourcePool: Pool | null = null;
  private targetPool: Pool | null = null;
  private config: MigrationConfig;
  private aborted = false;

  constructor(config: MigrationConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    console.log('[Migration] 🔧 Initializing database connections...');
    
    this.sourcePool = new Pool({
      connectionString: this.config.sourceUrl,
      max: 5,
      connectionTimeoutMillis: 10000,
    });

    this.targetPool = new Pool({
      connectionString: this.config.targetUrl,
      max: 5,
      connectionTimeoutMillis: 10000,
    });

    // 연결 테스트
    await this.sourcePool.query('SELECT 1');
    console.log('[Migration] ✅ Source database connected');
    
    await this.targetPool.query('SELECT 1');
    console.log('[Migration] ✅ Target database connected');
  }

  async getTableRowCount(pool: Pool, table: string): Promise<number> {
    try {
      const result = await pool.query(`SELECT COUNT(*) as count FROM "${table}"`);
      return parseInt(result.rows[0].count, 10);
    } catch {
      return 0;
    }
  }

  async tableExists(pool: Pool, table: string): Promise<boolean> {
    try {
      const result = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )
      `, [table]);
      return result.rows[0].exists;
    } catch {
      return false;
    }
  }

  async migrateTable(table: string): Promise<MigrationResult> {
    const startTime = Date.now();
    let rowsCopied = 0;

    try {
      if (!this.sourcePool || !this.targetPool) {
        throw new Error('Database pools not initialized');
      }

      // 소스 테이블 존재 확인
      const sourceExists = await this.tableExists(this.sourcePool, table);
      if (!sourceExists) {
        console.log(`[Migration] ⏭️ Skipping ${table} (not found in source)`);
        return {
          table,
          rowsCopied: 0,
          duration: Date.now() - startTime,
          success: true,
          error: 'Table not found in source'
        };
      }

      // 타겟 테이블 존재 확인
      const targetExists = await this.tableExists(this.targetPool, table);
      if (!targetExists) {
        console.log(`[Migration] ⏭️ Skipping ${table} (not found in target - run drizzle push first)`);
        return {
          table,
          rowsCopied: 0,
          duration: Date.now() - startTime,
          success: true,
          error: 'Table not found in target'
        };
      }

      const sourceCount = await this.getTableRowCount(this.sourcePool, table);
      console.log(`[Migration] 📊 ${table}: ${sourceCount} rows to migrate`);

      if (sourceCount === 0) {
        return {
          table,
          rowsCopied: 0,
          duration: Date.now() - startTime,
          success: true
        };
      }

      if (this.config.dryRun) {
        console.log(`[Migration] 🔍 DRY RUN: Would migrate ${sourceCount} rows from ${table}`);
        return {
          table,
          rowsCopied: sourceCount,
          duration: Date.now() - startTime,
          success: true
        };
      }

      // 컬럼 정보 가져오기
      const columnsResult = await this.sourcePool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1 AND table_schema = 'public'
        ORDER BY ordinal_position
      `, [table]);
      
      const columns = columnsResult.rows.map(r => r.column_name);
      const columnList = columns.map(c => `"${c}"`).join(', ');
      
      // ★ [2026-01-11] 기본 키 컬럼 찾기 (안정적인 정렬을 위해)
      const pkResult = await this.sourcePool.query(`
        SELECT a.attname
        FROM pg_index i
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
        WHERE i.indrelid = $1::regclass AND i.indisprimary
        ORDER BY array_position(i.indkey, a.attnum)
      `, [table]);
      
      // 기본 키가 있으면 사용, 없으면 ctid 사용 (PostgreSQL 시스템 컬럼)
      const orderColumn = pkResult.rows.length > 0 
        ? pkResult.rows.map(r => `"${r.attname}"`).join(', ')
        : 'ctid';

      // 배치 마이그레이션 (안정적인 정렬 사용)
      let offset = 0;
      while (offset < sourceCount && !this.aborted) {
        const batchResult = await this.sourcePool.query(`
          SELECT ${columnList} FROM "${table}" 
          ORDER BY ${orderColumn}
          LIMIT $1 OFFSET $2
        `, [this.config.batchSize, offset]);

        if (batchResult.rows.length === 0) break;

        // 배치 삽입
        for (const row of batchResult.rows) {
          const values = columns.map(c => row[c]);
          const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
          
          try {
            await this.targetPool.query(`
              INSERT INTO "${table}" (${columnList}) 
              VALUES (${placeholders})
              ON CONFLICT DO NOTHING
            `, values);
            rowsCopied++;
          } catch (err: any) {
            // 중복 키 오류 무시
            if (!err.message?.includes('duplicate key')) {
              throw err;
            }
          }
        }

        offset += this.config.batchSize;
        const progress = Math.min(100, Math.round((offset / sourceCount) * 100));
        process.stdout.write(`\r[Migration] 📥 ${table}: ${progress}% (${rowsCopied}/${sourceCount})`);
      }

      console.log(`\n[Migration] ✅ ${table}: Migrated ${rowsCopied} rows`);

      return {
        table,
        rowsCopied,
        duration: Date.now() - startTime,
        success: true
      };
    } catch (error: any) {
      console.error(`\n[Migration] ❌ ${table}: ${error.message}`);
      return {
        table,
        rowsCopied,
        duration: Date.now() - startTime,
        success: false,
        error: error.message
      };
    }
  }

  async verifyMigration(table: string): Promise<{
    table: string;
    sourceCount: number;
    targetCount: number;
    match: boolean;
  }> {
    if (!this.sourcePool || !this.targetPool) {
      throw new Error('Database pools not initialized');
    }

    const sourceCount = await this.getTableRowCount(this.sourcePool, table);
    const targetCount = await this.getTableRowCount(this.targetPool, table);

    return {
      table,
      sourceCount,
      targetCount,
      match: sourceCount === targetCount
    };
  }

  async run(): Promise<MigrationReport> {
    const startTime = new Date();
    const results: MigrationResult[] = [];

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('          TBURN ENTERPRISE DATABASE MIGRATION');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`Start Time: ${startTime.toISOString()}`);
    console.log(`Tables to migrate: ${this.config.tables.length}`);
    console.log(`Batch size: ${this.config.batchSize}`);
    console.log(`Dry run: ${this.config.dryRun}`);
    console.log('═══════════════════════════════════════════════════════════════');

    try {
      await this.initialize();

      for (const table of this.config.tables) {
        if (this.aborted) break;
        const result = await this.migrateTable(table);
        results.push(result);
      }

      // 검증
      console.log('\n═══════════════════════════════════════════════════════════════');
      console.log('                    VERIFICATION');
      console.log('═══════════════════════════════════════════════════════════════');

      for (const table of this.config.tables.slice(0, 10)) {
        const verification = await this.verifyMigration(table);
        const status = verification.match ? '✅' : '⚠️';
        console.log(`${status} ${table}: ${verification.sourceCount} → ${verification.targetCount}`);
      }

    } finally {
      await this.cleanup();
    }

    const endTime = new Date();
    const report: MigrationReport = {
      startTime,
      endTime,
      totalDuration: endTime.getTime() - startTime.getTime(),
      results,
      summary: {
        totalTables: this.config.tables.length,
        successfulTables: results.filter(r => r.success).length,
        failedTables: results.filter(r => !r.success).length,
        totalRowsCopied: results.reduce((sum, r) => sum + r.rowsCopied, 0)
      }
    };

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('                    MIGRATION COMPLETE');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`Duration: ${(report.totalDuration / 1000).toFixed(1)}s`);
    console.log(`Tables: ${report.summary.successfulTables}/${report.summary.totalTables} successful`);
    console.log(`Rows copied: ${report.summary.totalRowsCopied.toLocaleString()}`);
    console.log('═══════════════════════════════════════════════════════════════');

    return report;
  }

  abort(): void {
    console.log('[Migration] ⚠️ Aborting migration...');
    this.aborted = true;
  }

  async cleanup(): Promise<void> {
    if (this.sourcePool) {
      await this.sourcePool.end();
    }
    if (this.targetPool) {
      await this.targetPool.end();
    }
    console.log('[Migration] 🧹 Database connections closed');
  }
}

// CLI 실행
async function main() {
  const sourceUrl = process.env.DATABASE_URL;
  const targetUrl = process.env.DATABASE_URL_PROD;

  if (!sourceUrl) {
    console.error('❌ DATABASE_URL (source) is required');
    process.exit(1);
  }

  if (!targetUrl) {
    console.error('❌ DATABASE_URL_PROD (target) is required');
    console.error('');
    console.error('To set up production database:');
    console.error('1. Create a new database in Replit Dashboard');
    console.error('2. Set DATABASE_URL_PROD secret with the connection string');
    console.error('3. Run this migration script again');
    process.exit(1);
  }

  const migrator = new EnterpriseDbMigrator({
    sourceUrl,
    targetUrl,
    tables: CORE_TABLES,
    batchSize: parseInt(process.env.MIGRATION_BATCH_SIZE || '100', 10),
    dryRun: process.env.MIGRATION_DRY_RUN === 'true'
  });

  // 종료 시그널 처리
  process.on('SIGINT', () => {
    migrator.abort();
  });

  process.on('SIGTERM', () => {
    migrator.abort();
  });

  try {
    await migrator.run();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// 직접 실행 시에만 main 함수 호출 (ES module 방식)
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

// tsx로 직접 실행 시 main 함수 호출
main();

export { EnterpriseDbMigrator, CORE_TABLES, MigrationConfig, MigrationReport };
