import pg from 'pg';

const { Client } = pg;

async function vacuumFull() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();
  console.log('🧹 VACUUM FULL 시작 (디스크 공간 회수)...\n');

  const tables = [
    'blocks',
    'consensus_rounds',
    'cross_shard_messages',
    'ai_decisions',
    'ai_usage_logs',
    'governance_prevalidations'
  ];

  // 시작 전 용량 확인
  const beforeSize = await client.query(`SELECT pg_size_pretty(pg_database_size(current_database())) as size`);
  console.log(`📦 시작 전 DB 용량: ${beforeSize.rows[0]?.size}\n`);

  for (const table of tables) {
    try {
      console.log(`⏳ ${table} VACUUM FULL 실행 중...`);
      const start = Date.now();
      await client.query(`VACUUM FULL ${table}`);
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      console.log(`   ✅ ${table} 완료 (${elapsed}초)\n`);
    } catch (error: any) {
      console.log(`   ❌ ${table} 실패: ${error.message}\n`);
    }
  }

  // 완료 후 용량 확인
  const afterSize = await client.query(`SELECT pg_size_pretty(pg_database_size(current_database())) as size`);
  console.log(`📦 완료 후 DB 용량: ${afterSize.rows[0]?.size}`);
  console.log('\n✨ VACUUM FULL 완료!');

  await client.end();
}

vacuumFull().catch(console.error);
