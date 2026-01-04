/**
 * Enterprise Database Optimizer
 * 
 * Production-grade database optimization for session monitoring:
 * - Tiered data retention (30 days / 18 months / 5 years)
 * - Automated rollup aggregation (hourly → daily)
 * - Connection pool optimization
 * - Query performance monitoring
 * - Partition-style cleanup via time-based deletion
 */

import { db, executeWithRetry } from '../../db';
import { 
  sessionMetricsByEndpoint, 
  sessionMetricsHourly, 
  sessionMetricsDailyRollup,
  sessionAlertEvents,
  soakTestRuns,
  soakTestMetrics 
} from '@shared/schema';
import { sql, lt, and, gte, eq, desc } from 'drizzle-orm';

// ============================================================================
// Configuration
// ============================================================================

interface RetentionConfig {
  endpointMetricsDays: number;      // 5-minute granular data (default: 30 days)
  hourlyAggregatesMonths: number;   // Hourly aggregates (default: 18 months)
  dailyRollupsYears: number;        // Daily rollups (default: 5 years)
  alertEventsDays: number;          // Resolved alerts (default: 90 days)
  soakTestRunsDays: number;         // Soak test results (default: 180 days)
}

interface CleanupStats {
  endpointMetricsDeleted: number;
  hourlyAggregatesDeleted: number;
  alertEventsDeleted: number;
  soakTestRunsDeleted: number;
  executionTimeMs: number;
}

interface RollupStats {
  hoursProcessed: number;
  daysGenerated: number;
  executionTimeMs: number;
}

// ============================================================================
// Enterprise Database Optimizer Class
// ============================================================================

export class EnterpriseDbOptimizer {
  private static instance: EnterpriseDbOptimizer;
  
  private retentionConfig: RetentionConfig = {
    endpointMetricsDays: 30,
    hourlyAggregatesMonths: 18,
    dailyRollupsYears: 5,
    alertEventsDays: 90,
    soakTestRunsDays: 180,
  };
  
  private cleanupInterval: NodeJS.Timeout | null = null;
  private rollupInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  private lastCleanup: Date | null = null;
  private lastRollup: Date | null = null;
  private cleanupStats: CleanupStats[] = [];
  private rollupStats: RollupStats[] = [];
  
  private constructor() {}
  
  static getInstance(): EnterpriseDbOptimizer {
    if (!EnterpriseDbOptimizer.instance) {
      EnterpriseDbOptimizer.instance = new EnterpriseDbOptimizer();
    }
    return EnterpriseDbOptimizer.instance;
  }
  
  // ============================================================================
  // Lifecycle Management
  // ============================================================================
  
  start(config?: Partial<RetentionConfig>): void {
    if (this.isRunning) {
      console.log('[DbOptimizer] Already running');
      return;
    }
    
    if (config) {
      this.retentionConfig = { ...this.retentionConfig, ...config };
    }
    
    this.isRunning = true;
    
    // Run daily cleanup at 3 AM (check every hour)
    this.cleanupInterval = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 3 && now.getMinutes() < 5) {
        this.runRetentionCleanup().catch(err => {
          console.error('[DbOptimizer] Cleanup failed:', err.message);
        });
      }
    }, 60 * 60 * 1000); // Check every hour
    
    // Run hourly rollup aggregation
    this.rollupInterval = setInterval(() => {
      this.runDailyRollupAggregation().catch(err => {
        console.error('[DbOptimizer] Rollup failed:', err.message);
      });
    }, 60 * 60 * 1000); // Every hour
    
    console.log('[DbOptimizer] ✅ Enterprise Database Optimizer started');
    console.log(`[DbOptimizer] 📊 Retention: Endpoint ${this.retentionConfig.endpointMetricsDays}d, ` +
      `Hourly ${this.retentionConfig.hourlyAggregatesMonths}mo, ` +
      `Daily ${this.retentionConfig.dailyRollupsYears}yr`);
  }
  
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    if (this.rollupInterval) {
      clearInterval(this.rollupInterval);
      this.rollupInterval = null;
    }
    this.isRunning = false;
    console.log('[DbOptimizer] Stopped');
  }
  
  // ============================================================================
  // Data Retention / Cleanup
  // ============================================================================
  
  async runRetentionCleanup(): Promise<CleanupStats> {
    const startTime = Date.now();
    const stats: CleanupStats = {
      endpointMetricsDeleted: 0,
      hourlyAggregatesDeleted: 0,
      alertEventsDeleted: 0,
      soakTestRunsDeleted: 0,
      executionTimeMs: 0,
    };
    
    console.log('[DbOptimizer] 🧹 Starting retention cleanup...');
    
    try {
      // 1. Clean endpoint metrics (30 days)
      const endpointCutoff = new Date();
      endpointCutoff.setDate(endpointCutoff.getDate() - this.retentionConfig.endpointMetricsDays);
      
      const endpointResult = await executeWithRetry(
        async () => db.delete(sessionMetricsByEndpoint)
          .where(lt(sessionMetricsByEndpoint.bucketTime, endpointCutoff)),
        'Cleanup endpoint metrics',
        3
      );
      stats.endpointMetricsDeleted = (endpointResult as any).rowCount || 0;
      
      // 2. Clean hourly aggregates (18 months)
      const hourlyCutoff = new Date();
      hourlyCutoff.setMonth(hourlyCutoff.getMonth() - this.retentionConfig.hourlyAggregatesMonths);
      
      const hourlyResult = await executeWithRetry(
        async () => db.delete(sessionMetricsHourly)
          .where(lt(sessionMetricsHourly.hourBucket, hourlyCutoff)),
        'Cleanup hourly aggregates',
        3
      );
      stats.hourlyAggregatesDeleted = (hourlyResult as any).rowCount || 0;
      
      // 3. Clean resolved alerts (90 days)
      const alertCutoff = new Date();
      alertCutoff.setDate(alertCutoff.getDate() - this.retentionConfig.alertEventsDays);
      
      const alertResult = await executeWithRetry(
        async () => db.delete(sessionAlertEvents)
          .where(and(
            eq(sessionAlertEvents.state, 'resolved'),
            lt(sessionAlertEvents.firedAt, alertCutoff)
          )),
        'Cleanup alert events',
        3
      );
      stats.alertEventsDeleted = (alertResult as any).rowCount || 0;
      
      // 4. Clean soak test data (180 days)
      const soakCutoff = new Date();
      soakCutoff.setDate(soakCutoff.getDate() - this.retentionConfig.soakTestRunsDays);
      
      // Clean soak test metrics first (child table)
      await executeWithRetry(
        async () => db.delete(soakTestMetrics)
          .where(lt(soakTestMetrics.metricTime, soakCutoff)),
        'Cleanup soak test metrics',
        3
      );
      
      // Then clean soak test runs
      const soakResult = await executeWithRetry(
        async () => db.delete(soakTestRuns)
          .where(lt(soakTestRuns.startedAt, soakCutoff)),
        'Cleanup soak test runs',
        3
      );
      stats.soakTestRunsDeleted = (soakResult as any).rowCount || 0;
      
      stats.executionTimeMs = Date.now() - startTime;
      this.lastCleanup = new Date();
      this.cleanupStats.push(stats);
      
      // Keep only last 30 cleanup stats
      if (this.cleanupStats.length > 30) {
        this.cleanupStats.shift();
      }
      
      console.log(`[DbOptimizer] ✅ Cleanup complete in ${stats.executionTimeMs}ms`);
      console.log(`[DbOptimizer]   - Endpoint metrics: ${stats.endpointMetricsDeleted} rows`);
      console.log(`[DbOptimizer]   - Hourly aggregates: ${stats.hourlyAggregatesDeleted} rows`);
      console.log(`[DbOptimizer]   - Alert events: ${stats.alertEventsDeleted} rows`);
      console.log(`[DbOptimizer]   - Soak test runs: ${stats.soakTestRunsDeleted} rows`);
      
      return stats;
      
    } catch (error) {
      console.error('[DbOptimizer] Cleanup error:', (error as Error).message);
      stats.executionTimeMs = Date.now() - startTime;
      return stats;
    }
  }
  
  // ============================================================================
  // Daily Rollup Aggregation
  // ============================================================================
  
  async runDailyRollupAggregation(): Promise<RollupStats> {
    const startTime = Date.now();
    const stats: RollupStats = {
      hoursProcessed: 0,
      daysGenerated: 0,
      executionTimeMs: 0,
    };
    
    try {
      // Find the last processed day
      const lastRollup = await db.select({ dayBucket: sessionMetricsDailyRollup.dayBucket })
        .from(sessionMetricsDailyRollup)
        .orderBy(desc(sessionMetricsDailyRollup.dayBucket))
        .limit(1);
      
      const lastProcessedDay = lastRollup.length > 0 
        ? new Date(lastRollup[0].dayBucket)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: start 30 days ago
      
      // Process each complete day since last rollup
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      let currentDay = new Date(lastProcessedDay);
      currentDay.setDate(currentDay.getDate() + 1);
      currentDay.setHours(0, 0, 0, 0);
      
      while (currentDay < today) {
        const nextDay = new Date(currentDay);
        nextDay.setDate(nextDay.getDate() + 1);
        
        // Get hourly data for this day
        const hourlyData = await db.select()
          .from(sessionMetricsHourly)
          .where(and(
            gte(sessionMetricsHourly.hourBucket, currentDay),
            lt(sessionMetricsHourly.hourBucket, nextDay)
          ));
        
        if (hourlyData.length > 0) {
          stats.hoursProcessed += hourlyData.length;
          
          // Aggregate hourly data into daily
          const dailyAggregate = this.aggregateHourlyToDaily(hourlyData, currentDay);
          
          // Insert daily rollup
          await executeWithRetry(
            async () => db.insert(sessionMetricsDailyRollup).values(dailyAggregate)
              .onConflictDoNothing(),
            'Insert daily rollup',
            3
          );
          
          stats.daysGenerated++;
        }
        
        currentDay = nextDay;
      }
      
      stats.executionTimeMs = Date.now() - startTime;
      this.lastRollup = new Date();
      this.rollupStats.push(stats);
      
      // Keep only last 30 rollup stats
      if (this.rollupStats.length > 30) {
        this.rollupStats.shift();
      }
      
      if (stats.daysGenerated > 0) {
        console.log(`[DbOptimizer] 📊 Rollup complete: ${stats.daysGenerated} days generated ` +
          `from ${stats.hoursProcessed} hours in ${stats.executionTimeMs}ms`);
      }
      
      return stats;
      
    } catch (error) {
      console.error('[DbOptimizer] Rollup error:', (error as Error).message);
      stats.executionTimeMs = Date.now() - startTime;
      return stats;
    }
  }
  
  private aggregateHourlyToDaily(
    hourlyData: Array<typeof sessionMetricsHourly.$inferSelect>,
    dayBucket: Date
  ): typeof sessionMetricsDailyRollup.$inferInsert {
    
    const totalSessionsCreated = hourlyData.reduce((sum, h) => sum + (h.totalSessionsCreated || 0), 0);
    const totalSessionsSkipped = hourlyData.reduce((sum, h) => sum + (h.totalSessionsSkipped || 0), 0);
    const totalSessionsExpired = hourlyData.reduce((sum, h) => sum + (h.totalSessionsExpired || 0), 0);
    
    const activeSessionCounts = hourlyData.map(h => parseFloat(h.avgActiveSessionCount || '0'));
    const avgActiveSessionCount = activeSessionCounts.length > 0
      ? (activeSessionCounts.reduce((a, b) => a + b, 0) / activeSessionCounts.length).toFixed(2)
      : '0.00';
    
    const peakActiveSessionCount = Math.max(...hourlyData.map(h => h.peakActiveSessionCount || 0));
    const minActiveSessionCount = Math.min(...hourlyData.map(h => h.peakActiveSessionCount || 0).filter(v => v > 0));
    
    const skipRatios = hourlyData.map(h => parseFloat(h.avgSkipRatio || '0')).filter(v => v > 0);
    const avgSkipRatio = skipRatios.length > 0
      ? (skipRatios.reduce((a, b) => a + b, 0) / skipRatios.length).toFixed(6)
      : '0.000000';
    const minSkipRatio = skipRatios.length > 0 ? Math.min(...skipRatios).toFixed(6) : '0.000000';
    const maxSkipRatio = skipRatios.length > 0 ? Math.max(...skipRatios).toFixed(6) : '0.000000';
    
    const totalPublicRequests = hourlyData.reduce((sum, h) => sum + (h.totalPublicRequests || 0), 0);
    const totalInternalRequests = hourlyData.reduce((sum, h) => sum + (h.totalInternalRequests || 0), 0);
    const totalProtectedRequests = hourlyData.reduce((sum, h) => sum + (h.totalProtectedRequests || 0), 0);
    const totalRequests = totalPublicRequests + totalInternalRequests + totalProtectedRequests;
    const totalAuthFailures = hourlyData.reduce((sum, h) => sum + (h.totalAuthFailures || 0), 0);
    
    const latencies = hourlyData.map(h => parseFloat(h.avgLatencyMs || '0')).filter(v => v > 0);
    const avgLatencyMs = latencies.length > 0
      ? (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(3)
      : '0.000';
    const peakLatencyMs = latencies.length > 0 ? Math.max(...latencies).toFixed(3) : '0.000';
    
    const totalAlertsTriggered = hourlyData.reduce((sum, h) => sum + (h.alertsTriggered || 0), 0);
    const totalCriticalAlerts = hourlyData.reduce((sum, h) => sum + (h.criticalAlerts || 0), 0);
    const totalWarningAlerts = hourlyData.reduce((sum, h) => sum + (h.warningAlerts || 0), 0);
    
    const totalFailoverEvents = hourlyData.reduce((sum, h) => sum + (h.failoverEvents || 0), 0);
    const totalUnhealthyMinutes = hourlyData.reduce((sum, h) => sum + (h.unhealthyMinutes || 0), 0);
    const uptimePercent = ((24 * 60 - totalUnhealthyMinutes) / (24 * 60) * 100).toFixed(3);
    
    const slaMet = totalUnhealthyMinutes < 15 && totalCriticalAlerts === 0;
    
    return {
      dayBucket,
      totalSessionsCreated,
      totalSessionsSkipped,
      totalSessionsExpired,
      avgActiveSessionCount,
      peakActiveSessionCount,
      minActiveSessionCount: minActiveSessionCount === Infinity ? 0 : minActiveSessionCount,
      avgSkipRatio,
      minSkipRatio,
      maxSkipRatio,
      totalRequests,
      totalPublicRequests,
      totalInternalRequests,
      totalProtectedRequests,
      totalAuthFailures,
      avgLatencyMs,
      peakLatencyMs,
      totalError4xxCount: 0,
      totalError5xxCount: 0,
      totalTimeoutCount: 0,
      primaryStoreType: hourlyData[0]?.primaryStoreType || 'memory',
      totalFailoverEvents,
      totalUnhealthyMinutes,
      uptimePercent,
      totalAlertsTriggered,
      totalCriticalAlerts,
      totalWarningAlerts,
      slaMet,
      slaBreachMinutes: totalUnhealthyMinutes > 15 ? totalUnhealthyMinutes - 15 : 0,
    };
  }
  
  // ============================================================================
  // Query Optimization Helpers
  // ============================================================================
  
  async analyzeTableStats(): Promise<Record<string, { rowCount: number; sizeBytes: number }>> {
    try {
      const tables = [
        'session_metrics_by_endpoint',
        'session_metrics_hourly',
        'session_metrics_daily_rollup',
        'session_alert_events',
        'session_alert_policies',
        'soak_test_runs',
        'soak_test_metrics',
      ];
      
      const stats: Record<string, { rowCount: number; sizeBytes: number }> = {};
      
      for (const table of tables) {
        try {
          const countResult = await db.execute(sql`SELECT COUNT(*) as count FROM ${sql.raw(table)}`);
          const sizeResult = await db.execute(sql`SELECT pg_relation_size(${table}) as size`);
          
          stats[table] = {
            rowCount: parseInt((countResult as any)[0]?.count || '0'),
            sizeBytes: parseInt((sizeResult as any)[0]?.size || '0'),
          };
        } catch (e) {
          stats[table] = { rowCount: 0, sizeBytes: 0 };
        }
      }
      
      return stats;
      
    } catch (error) {
      console.error('[DbOptimizer] Table stats error:', (error as Error).message);
      return {};
    }
  }
  
  async runVacuumAnalyze(): Promise<boolean> {
    try {
      // Run VACUUM ANALYZE on session monitoring tables
      const tables = [
        'session_metrics_by_endpoint',
        'session_metrics_hourly',
        'session_alert_events',
      ];
      
      for (const table of tables) {
        await db.execute(sql`ANALYZE ${sql.raw(table)}`);
      }
      
      console.log('[DbOptimizer] ✅ ANALYZE complete on session monitoring tables');
      return true;
      
    } catch (error) {
      console.error('[DbOptimizer] VACUUM/ANALYZE error:', (error as Error).message);
      return false;
    }
  }
  
  // ============================================================================
  // Status & Metrics
  // ============================================================================
  
  getStatus(): {
    isRunning: boolean;
    retentionConfig: RetentionConfig;
    lastCleanup: Date | null;
    lastRollup: Date | null;
    recentCleanupStats: CleanupStats[];
    recentRollupStats: RollupStats[];
  } {
    return {
      isRunning: this.isRunning,
      retentionConfig: this.retentionConfig,
      lastCleanup: this.lastCleanup,
      lastRollup: this.lastRollup,
      recentCleanupStats: this.cleanupStats.slice(-10),
      recentRollupStats: this.rollupStats.slice(-10),
    };
  }
  
  updateRetentionConfig(config: Partial<RetentionConfig>): void {
    this.retentionConfig = { ...this.retentionConfig, ...config };
    console.log('[DbOptimizer] Retention config updated:', this.retentionConfig);
  }
}

// Export singleton
export const dbOptimizer = EnterpriseDbOptimizer.getInstance();
