/**
 * Enterprise Database Optimizer API Routes
 * 
 * Production-grade endpoints for database optimization:
 * - Retention policy management
 * - Manual cleanup triggers
 * - Rollup aggregation control
 * - Table statistics and health
 */

import { Router } from 'express';
import { dbOptimizer } from '../core/db/enterprise-db-optimizer';

const router = Router();

// ============================================================================
// Status & Configuration
// ============================================================================

router.get('/status', (req, res) => {
  try {
    const status = dbOptimizer.getStatus();
    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

router.post('/retention/config', (req, res) => {
  try {
    const config = req.body;
    dbOptimizer.updateRetentionConfig(config);
    res.json({
      success: true,
      message: 'Retention config updated',
      data: dbOptimizer.getStatus().retentionConfig,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// ============================================================================
// Manual Operations
// ============================================================================

router.post('/cleanup/run', async (req, res) => {
  try {
    console.log('[DbOptimizer API] Manual cleanup triggered');
    const stats = await dbOptimizer.runRetentionCleanup();
    res.json({
      success: true,
      message: 'Cleanup completed',
      data: stats,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

router.post('/rollup/run', async (req, res) => {
  try {
    console.log('[DbOptimizer API] Manual rollup triggered');
    const stats = await dbOptimizer.runDailyRollupAggregation();
    res.json({
      success: true,
      message: 'Rollup completed',
      data: stats,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

router.post('/vacuum/run', async (req, res) => {
  try {
    console.log('[DbOptimizer API] Manual VACUUM/ANALYZE triggered');
    const success = await dbOptimizer.runVacuumAnalyze();
    res.json({
      success,
      message: success ? 'VACUUM/ANALYZE completed' : 'VACUUM/ANALYZE failed',
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// ============================================================================
// Table Statistics
// ============================================================================

router.get('/tables/stats', async (req, res) => {
  try {
    const stats = await dbOptimizer.analyzeTableStats();
    
    const formatted = Object.entries(stats).map(([table, data]) => ({
      table,
      rowCount: data.rowCount,
      sizeBytes: data.sizeBytes,
      sizeMb: (data.sizeBytes / (1024 * 1024)).toFixed(2),
    }));
    
    const totalSizeBytes = Object.values(stats).reduce((sum, s) => sum + s.sizeBytes, 0);
    const totalRows = Object.values(stats).reduce((sum, s) => sum + s.rowCount, 0);
    
    res.json({
      success: true,
      data: {
        tables: formatted,
        summary: {
          totalTables: formatted.length,
          totalRows,
          totalSizeBytes,
          totalSizeMb: (totalSizeBytes / (1024 * 1024)).toFixed(2),
        },
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// ============================================================================
// Lifecycle Control
// ============================================================================

router.post('/start', (req, res) => {
  try {
    const config = req.body;
    dbOptimizer.start(config);
    res.json({
      success: true,
      message: 'Database optimizer started',
      data: dbOptimizer.getStatus(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

router.post('/stop', (req, res) => {
  try {
    dbOptimizer.stop();
    res.json({
      success: true,
      message: 'Database optimizer stopped',
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

export default router;
