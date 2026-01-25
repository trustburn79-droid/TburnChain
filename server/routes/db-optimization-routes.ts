/**
 * TBURN Database Optimization API Routes
 * Enterprise-grade database management endpoints
 * 
 * Security: All endpoints require admin authentication
 * Chain ID: 5800 | TBURN Mainnet
 */

import { Router, Request, Response } from "express";
import {
  applyEnterpriseIndexes,
  getIndexStatistics,
  analyzeTokenDistributionTables,
} from "../db/enterprise-index-optimization";
import { db } from "../db";
import { sql } from "drizzle-orm";
import { requireAdmin } from "../middleware/auth";

const router = Router();

router.use(requireAdmin);

// GET /api/admin/db/status - Database optimization status
router.get('/status', async (_req: Request, res: Response) => {
  try {
    const stats = await getIndexStatistics();
    
    // Get current database stats
    const tableStats = await db.execute(sql`
      SELECT 
        schemaname,
        relname as table_name,
        n_live_tup as row_count,
        n_dead_tup as dead_rows,
        last_vacuum,
        last_analyze
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
      ORDER BY n_live_tup DESC
      LIMIT 30
    `);
    
    // Get index usage stats
    const indexStats = await db.execute(sql`
      SELECT 
        schemaname,
        relname as table_name,
        indexrelname as index_name,
        idx_scan as scans,
        idx_tup_read as tuples_read,
        idx_tup_fetch as tuples_fetched
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
      ORDER BY idx_scan DESC
      LIMIT 50
    `);
    
    res.json({
      success: true,
      data: {
        enterpriseIndexes: stats,
        tableStats: tableStats.rows || [],
        indexUsage: indexStats.rows || [],
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[DB Optimization] Status endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// POST /api/admin/db/apply-indexes - Apply enterprise indexes
router.post('/apply-indexes', async (_req: Request, res: Response) => {
  try {
    console.log('[DB Optimization] Starting index application...');
    
    const result = await applyEnterpriseIndexes();
    
    res.json({
      success: result.success,
      data: {
        applied: result.applied,
        failed: result.failed,
        errors: result.errors,
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[DB Optimization] Apply indexes endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// POST /api/admin/db/analyze - Run ANALYZE on tables
router.post('/analyze', async (_req: Request, res: Response) => {
  try {
    console.log('[DB Optimization] Starting table analysis...');
    
    await analyzeTokenDistributionTables();
    
    res.json({
      success: true,
      message: 'Table analysis completed successfully',
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[DB Optimization] Analyze endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// GET /api/admin/db/index-stats - Get detailed index statistics
router.get('/index-stats', async (_req: Request, res: Response) => {
  try {
    const stats = await getIndexStatistics();
    
    // Get detailed index info from PostgreSQL
    const detailedStats = await db.execute(sql`
      SELECT 
        t.relname as table_name,
        i.relname as index_name,
        pg_size_pretty(pg_relation_size(i.oid)) as index_size,
        ix.indisunique as is_unique,
        ix.indisprimary as is_primary,
        ix.indisvalid as is_valid,
        s.idx_scan as scan_count,
        s.idx_tup_read as tuples_read,
        s.idx_tup_fetch as tuples_fetched
      FROM pg_class t
      JOIN pg_index ix ON t.oid = ix.indrelid
      JOIN pg_class i ON i.oid = ix.indexrelid
      LEFT JOIN pg_stat_user_indexes s ON s.indexrelid = i.oid
      WHERE t.relkind = 'r'
        AND t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      ORDER BY pg_relation_size(i.oid) DESC
      LIMIT 100
    `);
    
    res.json({
      success: true,
      data: {
        enterpriseIndexSpec: stats,
        currentIndexes: detailedStats.rows || [],
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[DB Optimization] Index stats endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// GET /api/admin/db/table-sizes - Get table size statistics
router.get('/table-sizes', async (_req: Request, res: Response) => {
  try {
    const tableSizes = await db.execute(sql`
      SELECT 
        relname as table_name,
        pg_size_pretty(pg_total_relation_size(c.oid)) as total_size,
        pg_size_pretty(pg_relation_size(c.oid)) as table_size,
        pg_size_pretty(pg_indexes_size(c.oid)) as indexes_size,
        (SELECT count(*) FROM information_schema.columns 
         WHERE table_name = c.relname AND table_schema = 'public') as column_count
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relkind = 'r'
        AND n.nspname = 'public'
      ORDER BY pg_total_relation_size(c.oid) DESC
      LIMIT 50
    `);
    
    res.json({
      success: true,
      data: {
        tables: tableSizes.rows || [],
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[DB Optimization] Table sizes endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// GET /api/admin/db/slow-queries - Get potentially slow query patterns
router.get('/slow-queries', async (_req: Request, res: Response) => {
  try {
    // Get tables with missing indexes (high seq scan ratio)
    const missingIndexes = await db.execute(sql`
      SELECT 
        schemaname,
        relname as table_name,
        seq_scan,
        idx_scan,
        CASE WHEN (seq_scan + idx_scan) > 0 
          THEN ROUND(100.0 * seq_scan / (seq_scan + idx_scan), 2) 
          ELSE 0 
        END as seq_scan_percent,
        n_live_tup as row_count
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
        AND n_live_tup > 1000
        AND seq_scan > 0
      ORDER BY seq_scan_percent DESC
      LIMIT 20
    `);
    
    // Get unused indexes
    const unusedIndexes = await db.execute(sql`
      SELECT 
        schemaname,
        relname as table_name,
        indexrelname as index_name,
        pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
        idx_scan as scan_count
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
        AND idx_scan = 0
        AND indexrelname NOT LIKE '%pkey%'
      ORDER BY pg_relation_size(indexrelid) DESC
      LIMIT 20
    `);
    
    res.json({
      success: true,
      data: {
        tablesNeedingIndexes: missingIndexes.rows || [],
        unusedIndexes: unusedIndexes.rows || [],
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[DB Optimization] Slow queries endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// POST /api/admin/db/vacuum - Run VACUUM on specific tables
router.post('/vacuum', async (req: Request, res: Response) => {
  try {
    const { tables } = req.body;
    
    if (!tables || !Array.isArray(tables) || tables.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Tables array required',
      });
    }
    
    const results: { table: string; success: boolean; error?: string }[] = [];
    
    for (const table of tables) {
      try {
        // Validate table name to prevent SQL injection
        const validTableName = /^[a-z_][a-z0-9_]*$/i.test(table);
        if (!validTableName) {
          results.push({ table, success: false, error: 'Invalid table name' });
          continue;
        }
        
        await db.execute(sql.raw(`VACUUM ANALYZE ${table}`));
        results.push({ table, success: true });
      } catch (error) {
        console.error(`[DB Optimization] VACUUM failed for ${table}:`, error);
        results.push({
          table,
          success: false,
          error: 'Operation failed',
        });
      }
    }
    
    res.json({
      success: results.every(r => r.success),
      data: { results },
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[DB Optimization] VACUUM error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// GET /api/admin/db/health - Overall database health check
router.get('/health', async (_req: Request, res: Response) => {
  try {
    // Get connection count
    const connections = await db.execute(sql`
      SELECT 
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active,
        count(*) FILTER (WHERE state = 'idle') as idle,
        count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_tx
      FROM pg_stat_activity
      WHERE datname = current_database()
    `);
    
    // Get database size
    const dbSize = await db.execute(sql`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    `);
    
    // Get cache hit ratio
    const cacheHit = await db.execute(sql`
      SELECT 
        ROUND(100.0 * sum(blks_hit) / nullif(sum(blks_hit) + sum(blks_read), 0), 2) as cache_hit_ratio
      FROM pg_stat_database
      WHERE datname = current_database()
    `);
    
    // Get table count
    const tableCount = await db.execute(sql`
      SELECT count(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);
    
    // Get index count
    const indexCount = await db.execute(sql`
      SELECT count(*) as count 
      FROM pg_indexes 
      WHERE schemaname = 'public'
    `);
    
    const connectionData = connections.rows?.[0] as any;
    const sizeData = dbSize.rows?.[0] as any;
    const cacheData = cacheHit.rows?.[0] as any;
    const tableData = tableCount.rows?.[0] as any;
    const indexData = indexCount.rows?.[0] as any;
    
    res.json({
      success: true,
      data: {
        status: 'healthy',
        connections: {
          total: Number(connectionData?.total_connections || 0),
          active: Number(connectionData?.active || 0),
          idle: Number(connectionData?.idle || 0),
          idleInTransaction: Number(connectionData?.idle_in_tx || 0),
        },
        database: {
          size: sizeData?.size || 'unknown',
          cacheHitRatio: Number(cacheData?.cache_hit_ratio || 0),
          tableCount: Number(tableData?.count || 0),
          indexCount: Number(indexData?.count || 0),
        },
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[DB Optimization] Health check endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export function registerDbOptimizationRoutes(app: any) {
  app.use('/api/admin/db', router);
}

export default router;
