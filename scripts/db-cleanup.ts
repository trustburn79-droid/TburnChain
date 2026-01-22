import pg from 'pg';

const { Client } = pg;

async function cleanup() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();
  console.log('🔥 개발 DB 대용량 정리 시작...\n');

  const tables = [
    { name: 'blocks', keep: 300000 },
    { name: 'consensus_rounds', keep: 260000 },
    { name: 'cross_shard_messages', keep: 210000 },
    { name: 'ai_decisions', keep: 12000 },
    { name: 'ai_usage_logs', keep: 12000 },
    { name: 'governance_prevalidations', keep: 3700 },
  ];

  for (const table of tables) {
    try {
      console.log(`📊 ${table.name} 처리 중...`);
      
      const countResult = await client.query(`SELECT COUNT(*)::int as cnt FROM ${table.name}`);
      const currentCount = countResult.rows[0]?.cnt || 0;
      console.log(`   현재 행 수: ${currentCount.toLocaleString()}`);
      
      if (currentCount <= table.keep) {
        console.log(`   ✅ 이미 충분히 작음, 스킵\n`);
        continue;
      }

      const toDelete = currentCount - table.keep;
      console.log(`   삭제 예정: ${toDelete.toLocaleString()}행`);

      await client.query(`
        DELETE FROM ${table.name} 
        WHERE id IN (
          SELECT id FROM ${table.name} 
          ORDER BY id ASC 
          LIMIT ${toDelete}
        )
      `);
      
      console.log(`   ✅ 삭제 완료\n`);
    } catch (error) {
      console.error(`   ❌ 오류: ${error}\n`);
    }
  }

  console.log('🧹 VACUUM 실행 중 (공간 회수)...');
  for (const table of tables) {
    try {
      await client.query(`VACUUM ${table.name}`);
      console.log(`   ✅ ${table.name} VACUUM 완료`);
    } catch (error) {
      console.log(`   ⚠️ ${table.name} VACUUM 실패 (정상일 수 있음)`);
    }
  }

  console.log('\n✨ 정리 완료!');
  
  const sizeResult = await client.query(`SELECT pg_size_pretty(pg_database_size(current_database())) as total_size`);
  console.log(`📦 최종 DB 용량: ${sizeResult.rows[0]?.total_size}`);

  await client.end();
}

cleanup().catch(console.error);
