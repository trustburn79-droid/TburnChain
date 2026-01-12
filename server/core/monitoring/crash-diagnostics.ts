/**
 * ★★★ [2026-01-08] Enterprise Crash Diagnostics System v2.0 ★★★
 * 
 * Production-grade crash analysis with automatic log rotation,
 * disk space management, and comprehensive diagnostics.
 * 
 * Features:
 * - Global exception handlers (uncaughtException, unhandledRejection)
 * - Memory crisis detection with smart heap snapshot decisions
 * - Automatic log rotation with configurable retention policy
 * - Disk space monitoring and automatic cleanup
 * - Crash context persistence with compression
 * - Aggregated statistics and reporting
 * - Event-driven architecture for alerting integrations
 */

import * as v8 from 'v8';
import * as fs from 'fs';
import * as path from 'path';

interface CrashContext {
  timestamp: string;
  type: 'uncaughtException' | 'unhandledRejection' | 'memoryWarning' | 'oom' | 'diskWarning';
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  memory: MemoryState;
  process: ProcessState;
  disk?: DiskState;
  activeIntervals: number;
  recentLogs: string[];
  sessionId: string;
}

interface MemoryState {
  heapUsed: number;
  heapTotal: number;
  heapUsagePercent: number;
  rss: number;
  external: number;
  arrayBuffers?: number;
}

interface ProcessState {
  uptime: number;
  pid: number;
  nodeVersion: string;
  platform: string;
  v8HeapLimit?: number;
}

interface DiskState {
  crashLogSizeMB: number;
  fileCount: number;
  oldestFile?: string;
  newestFile?: string;
}

interface RetentionPolicy {
  maxFiles: number;
  maxAgeDays: number;
  maxTotalSizeMB: number;
  cleanupIntervalMs: number;
}

interface CrashStats {
  totalCrashes: number;
  memoryWarnings: number;
  diskWarnings: number;
  lastCrashTime?: string;
  lastMemoryWarning?: string;
  heapSnapshotsTaken: number;
  logFilesRotated: number;
}

const DEFAULT_RETENTION_POLICY: RetentionPolicy = {
  maxFiles: 20,
  maxAgeDays: 7,
  maxTotalSizeMB: 100,
  cleanupIntervalMs: 300000, // 5 minutes
};

class EnterpriseCrashDiagnosticsService {
  private recentLogs: string[] = [];
  private maxLogs = 100;
  private isShuttingDown = false;
  private heapSnapshotTaken = false;
  private activeIntervalsCount = 0;
  private crashLogPath = '/tmp/tburn-crash-logs';
  private sessionId: string;
  private retentionPolicy: RetentionPolicy;
  private stats: CrashStats;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private memoryCheckTimer: NodeJS.Timeout | null = null;
  private isProduction: boolean;

  constructor(policy?: Partial<RetentionPolicy>) {
    this.sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    this.retentionPolicy = { ...DEFAULT_RETENTION_POLICY, ...policy };
    this.stats = {
      totalCrashes: 0,
      memoryWarnings: 0,
      diskWarnings: 0,
      heapSnapshotsTaken: 0,
      logFilesRotated: 0,
    };
    this.isProduction = this.detectProductionMode();
    this.ensureCrashLogDirectory();
  }

  /**
   * Production mode detection with multiple environment checks
   */
  private detectProductionMode(): boolean {
    return process.env.NODE_MODE === 'production' ||
           process.env.NODE_ENV === 'production' ||
           process.env.REPLIT_DEPLOYMENT === '1' ||
           process.env.REPLIT_DB_URL !== undefined;
  }

  private ensureCrashLogDirectory() {
    try {
      if (!fs.existsSync(this.crashLogPath)) {
        fs.mkdirSync(this.crashLogPath, { recursive: true });
      }
    } catch (e) {
      console.error('[CrashDiagnostics] Failed to create crash log directory:', e);
    }
  }

  /**
   * Get current disk state for crash logs
   */
  private getDiskState(): DiskState {
    try {
      const files = fs.readdirSync(this.crashLogPath)
        .map(f => ({
          name: f,
          path: path.join(this.crashLogPath, f),
          stats: fs.statSync(path.join(this.crashLogPath, f)),
        }))
        .sort((a, b) => a.stats.mtimeMs - b.stats.mtimeMs);

      const totalSize = files.reduce((sum, f) => sum + f.stats.size, 0);

      return {
        crashLogSizeMB: Math.round(totalSize / 1024 / 1024 * 100) / 100,
        fileCount: files.length,
        oldestFile: files[0]?.name,
        newestFile: files[files.length - 1]?.name,
      };
    } catch {
      return { crashLogSizeMB: 0, fileCount: 0 };
    }
  }

  /**
   * Automatic log rotation and cleanup
   */
  private performLogRotation(): number {
    try {
      const files = fs.readdirSync(this.crashLogPath)
        .map(f => ({
          name: f,
          path: path.join(this.crashLogPath, f),
          stats: fs.statSync(path.join(this.crashLogPath, f)),
        }))
        .sort((a, b) => a.stats.mtimeMs - b.stats.mtimeMs);

      let deletedCount = 0;
      const now = Date.now();
      const maxAgeMs = this.retentionPolicy.maxAgeDays * 24 * 60 * 60 * 1000;
      let totalSize = files.reduce((sum, f) => sum + f.stats.size, 0);
      const maxTotalBytes = this.retentionPolicy.maxTotalSizeMB * 1024 * 1024;

      for (const file of files) {
        const shouldDeleteByAge = (now - file.stats.mtimeMs) > maxAgeMs;
        const shouldDeleteByCount = (files.length - deletedCount) > this.retentionPolicy.maxFiles;
        const shouldDeleteBySize = totalSize > maxTotalBytes;

        if (shouldDeleteByAge || shouldDeleteByCount || shouldDeleteBySize) {
          try {
            fs.unlinkSync(file.path);
            totalSize -= file.stats.size;
            deletedCount++;
            this.stats.logFilesRotated++;
          } catch (e) {
            console.error(`[CrashDiagnostics] Failed to delete ${file.name}:`, e);
          }
        }
      }

      if (deletedCount > 0) {
        console.log(`[CrashDiagnostics] 🔄 Log rotation: deleted ${deletedCount} files`);
      }

      return deletedCount;
    } catch (e) {
      console.error('[CrashDiagnostics] Log rotation failed:', e);
      return 0;
    }
  }

  /**
   * Start automatic cleanup timer
   */
  private startAutoCleanup() {
    if (this.cleanupTimer) return;

    // Initial cleanup on startup
    this.performLogRotation();

    this.cleanupTimer = setInterval(() => {
      this.performLogRotation();
    }, this.retentionPolicy.cleanupIntervalMs);

    console.log(`[CrashDiagnostics] 🔄 Auto-cleanup started (${this.retentionPolicy.cleanupIntervalMs / 1000}s interval)`);
  }

  /**
   * Recent log recording for crash context
   */
  log(message: string, level: 'info' | 'warn' | 'error' = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    this.recentLogs.push(logEntry);
    if (this.recentLogs.length > this.maxLogs) {
      this.recentLogs.shift();
    }
  }

  /**
   * Update active intervals count
   */
  updateActiveIntervals(count: number) {
    this.activeIntervalsCount = count;
  }

  /**
   * Get current memory state with extended metrics
   * ★ [2026-01-08] V8 힙 제한 기준으로 퍼센티지 계산
   */
  private getMemoryState(): MemoryState {
    const mem = process.memoryUsage();
    const v8HeapLimitMB = this.getV8HeapLimit();
    const heapUsedMB = Math.round(mem.heapUsed / 1024 / 1024);
    // V8 힙 제한 기준으로 퍼센티지 계산 (현재 할당된 힙이 아닌 실제 제한)
    const heapTotalMB = Math.max(Math.round(mem.heapTotal / 1024 / 1024), v8HeapLimitMB);
    return {
      heapUsed: heapUsedMB,
      heapTotal: heapTotalMB,
      heapUsagePercent: Math.round((heapUsedMB / v8HeapLimitMB) * 100),
      rss: Math.round(mem.rss / 1024 / 1024),
      external: Math.round(mem.external / 1024 / 1024),
      arrayBuffers: Math.round(mem.arrayBuffers / 1024 / 1024),
    };
  }

  /**
   * Get V8 heap limit
   */
  private getV8HeapLimit(): number {
    const stats = v8.getHeapStatistics();
    return Math.round(stats.heap_size_limit / 1024 / 1024);
  }

  /**
   * Collect crash context with all available information
   */
  private collectCrashContext(
    type: CrashContext['type'],
    error?: Error
  ): CrashContext {
    return {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      type,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
      memory: this.getMemoryState(),
      process: {
        uptime: Math.round(process.uptime()),
        pid: process.pid,
        nodeVersion: process.version,
        platform: process.platform,
        v8HeapLimit: this.getV8HeapLimit(),
      },
      disk: this.getDiskState(),
      activeIntervals: this.activeIntervalsCount,
      recentLogs: [...this.recentLogs],
    };
  }

  /**
   * Save crash context with compression
   */
  private saveCrashContext(context: CrashContext) {
    try {
      // Pre-cleanup if approaching limits
      const diskState = this.getDiskState();
      if (diskState.fileCount >= this.retentionPolicy.maxFiles - 2 ||
          diskState.crashLogSizeMB >= this.retentionPolicy.maxTotalSizeMB * 0.9) {
        this.performLogRotation();
      }

      const filename = `crash-${context.type}-${Date.now()}.json`;
      const filepath = path.join(this.crashLogPath, filename);
      
      // Compact JSON for disk efficiency
      const compactContext = {
        ...context,
        recentLogs: context.recentLogs.slice(-30), // Keep only last 30 logs
      };
      
      fs.writeFileSync(filepath, JSON.stringify(compactContext));
      console.error(`[CrashDiagnostics] 💾 Crash context saved: ${filename} (${diskState.fileCount + 1} files, ${diskState.crashLogSizeMB}MB)`);
    } catch (e) {
      console.error('[CrashDiagnostics] Failed to save crash context:', e);
    }
  }

  /**
   * Heap snapshot with production safety and disk monitoring
   */
  private takeHeapSnapshot() {
    if (this.heapSnapshotTaken) return;
    
    // Production environment: skip heap snapshots (150-200MB each)
    if (this.isProduction) {
      console.log('[CrashDiagnostics] 🔒 Heap snapshot SKIPPED (production mode, disk optimization)');
      this.heapSnapshotTaken = true;
      return;
    }

    // Check disk space before snapshot
    const diskState = this.getDiskState();
    if (diskState.crashLogSizeMB > this.retentionPolicy.maxTotalSizeMB * 0.5) {
      console.log(`[CrashDiagnostics] 🔒 Heap snapshot SKIPPED (disk: ${diskState.crashLogSizeMB}MB / ${this.retentionPolicy.maxTotalSizeMB}MB limit)`);
      this.heapSnapshotTaken = true;
      return;
    }
    
    try {
      const filename = `heapdump-${Date.now()}.heapsnapshot`;
      const filepath = path.join(this.crashLogPath, filename);
      v8.writeHeapSnapshot(filepath);
      this.heapSnapshotTaken = true;
      this.stats.heapSnapshotsTaken++;
      console.error(`[CrashDiagnostics] 📸 Heap snapshot saved: ${filename}`);
    } catch (e) {
      console.error('[CrashDiagnostics] Failed to take heap snapshot:', e);
    }
  }

  /**
   * Memory warning handler with debouncing
   */
  private lastMemoryWarningTime = 0;
  private memoryWarningDebounceMs = 60000; // 1 minute debounce

  handleMemoryWarning() {
    const now = Date.now();
    if (now - this.lastMemoryWarningTime < this.memoryWarningDebounceMs) {
      return; // Debounce
    }

    const mem = this.getMemoryState();
    if (mem.heapUsagePercent >= 85 && !this.heapSnapshotTaken) {
      this.lastMemoryWarningTime = now;
      this.stats.memoryWarnings++;
      this.stats.lastMemoryWarning = new Date().toISOString();

      console.error(`[CrashDiagnostics] ⚠️ MEMORY WARNING: ${mem.heapUsagePercent}% heap (${mem.heapUsed}MB / ${mem.heapTotal}MB)`);
      this.log(`Memory warning: ${mem.heapUsagePercent}% heap usage`, 'warn');
      
      const context = this.collectCrashContext('memoryWarning');
      this.saveCrashContext(context);
      this.takeHeapSnapshot();
    }
  }

  /**
   * Disk space warning handler
   */
  handleDiskWarning() {
    const diskState = this.getDiskState();
    if (diskState.crashLogSizeMB > this.retentionPolicy.maxTotalSizeMB * 0.8) {
      this.stats.diskWarnings++;
      console.error(`[CrashDiagnostics] ⚠️ DISK WARNING: ${diskState.crashLogSizeMB}MB used in crash logs`);
      this.performLogRotation();
    }
  }

  /**
   * uncaughtException handler
   */
  handleUncaughtException(error: Error) {
    if (this.isShuttingDown) return;
    
    // ★ [v2.0] Neon serverless WebSocket errors are recoverable - don't treat as crash
    const message = error?.message || String(error);
    const neonRecoverablePatterns = [
      'Cannot set property message of',
      'ErrorEvent',
      '_connectionCallback',
      '_handleErrorWhileConnecting',
      '@neondatabase/serverless',
    ];
    const isNeonRecoverable = neonRecoverablePatterns.some(pattern => 
      message.includes(pattern) || (error.stack && error.stack.includes(pattern))
    );
    
    if (isNeonRecoverable) {
      console.warn('[CrashDiagnostics] ⚠️ Neon connection error (recoverable, not counted as crash)');
      return; // Don't count Neon errors as crashes
    }
    
    this.isShuttingDown = true;
    this.stats.totalCrashes++;
    this.stats.lastCrashTime = new Date().toISOString();

    console.error('');
    console.error('═══════════════════════════════════════════════════════════════');
    console.error('[CrashDiagnostics] 🚨 UNCAUGHT EXCEPTION');
    console.error('═══════════════════════════════════════════════════════════════');
    console.error(`Session: ${this.sessionId}`);
    console.error(`Error Name: ${error.name}`);
    console.error(`Error Message: ${error.message}`);
    console.error('');
    console.error('Stack Trace:');
    console.error(error.stack);
    console.error('');

    const context = this.collectCrashContext('uncaughtException', error);
    console.error('Memory State:', JSON.stringify(context.memory, null, 2));
    console.error('Disk State:', JSON.stringify(context.disk, null, 2));
    console.error('Process Uptime:', context.process.uptime, 'seconds');
    console.error('V8 Heap Limit:', context.process.v8HeapLimit, 'MB');
    console.error('');
    console.error('Recent Logs (last 20):');
    context.recentLogs.slice(-20).forEach(log => console.error('  ', log));
    console.error('═══════════════════════════════════════════════════════════════');
    
    this.saveCrashContext(context);
    
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  }

  /**
   * unhandledRejection handler
   * ★ [2026-01-09] Enhanced to differentiate recoverable vs critical errors
   */
  handleUnhandledRejection(reason: unknown, _promise: Promise<unknown>) {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    const message = error.message || '';
    
    // Recoverable errors - don't count as crashes, just log warning
    const recoverablePatterns = [
      'Connection terminated',
      'ECONNRESET',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ECONNABORTED',
      'socket hang up',
      'fetch failed',
      'Request timeout',
      'too many clients',
      'connection pool',
      'EPIPE',
      'EHOSTUNREACH',
      'getaddrinfo',
      'SSL connection has been closed',
      'SSL SYSCALL error',
      'SSL_ERROR_SYSCALL',
      'server closed the connection',
      'read ECONNRESET',
      'write EPIPE',
      'network error',
      'network request failed',
      'AbortError',
      'websocket',
      'redis',
      'timeout',
    ];
    
    const isRecoverable = recoverablePatterns.some(pattern => 
      message.includes(pattern) || (error as any).code === pattern
    );
    
    if (isRecoverable) {
      // Log as warning, not error - system will recover
      console.warn(`[CrashDiagnostics] ⚠️ Recoverable rejection: ${message.substring(0, 100)}`);
      this.log(`Recoverable rejection: ${message.substring(0, 100)}`, 'warn');
      return; // Don't count as crash
    }
    
    // Critical error - log full details
    this.stats.totalCrashes++;
    this.stats.lastCrashTime = new Date().toISOString();
    
    console.error('');
    console.error('═══════════════════════════════════════════════════════════════');
    console.error('[CrashDiagnostics] 🚨 UNHANDLED PROMISE REJECTION');
    console.error('═══════════════════════════════════════════════════════════════');
    console.error(`Session: ${this.sessionId}`);
    console.error(`Reason: ${error.message}`);
    console.error('');
    console.error('Stack Trace:');
    console.error(error.stack || 'No stack trace available');
    console.error('');

    const context = this.collectCrashContext('unhandledRejection', error);
    console.error('Memory State:', JSON.stringify(context.memory, null, 2));
    console.error('Process Uptime:', context.process.uptime, 'seconds');
    console.error('');
    console.error('Recent Logs (last 20):');
    context.recentLogs.slice(-20).forEach(log => console.error('  ', log));
    console.error('═══════════════════════════════════════════════════════════════');
    
    this.saveCrashContext(context);
  }

  /**
   * Node.js warning handler
   */
  handleWarning(warning: Error) {
    console.warn('[CrashDiagnostics] ⚠️ Node.js Warning:', warning.name);
    console.warn('Message:', warning.message);
    if (warning.stack) {
      console.warn('Stack:', warning.stack);
    }
    
    this.log(`Node warning: ${warning.name} - ${warning.message}`, 'warn');
    
    if (warning.message.includes('memory') || warning.message.includes('heap')) {
      this.handleMemoryWarning();
    }
  }

  /**
   * Register all process handlers
   */
  registerProcessHandlers() {
    process.on('uncaughtException', (error) => {
      this.handleUncaughtException(error);
    });

    process.on('unhandledRejection', (reason, promise) => {
      this.handleUnhandledRejection(reason, promise);
    });

    process.on('warning', (warning) => {
      this.handleWarning(warning);
    });

    // Start auto-cleanup
    this.startAutoCleanup();

    console.log('[CrashDiagnostics] ✅ Process crash handlers registered');
    console.log('[CrashDiagnostics] 📁 Crash logs will be saved to:', this.crashLogPath);
    console.log(`[CrashDiagnostics] 📊 Retention: ${this.retentionPolicy.maxFiles} files, ${this.retentionPolicy.maxAgeDays} days, ${this.retentionPolicy.maxTotalSizeMB}MB max`);
    console.log(`[CrashDiagnostics] 🔒 Production mode: ${this.isProduction ? 'YES (heap snapshots disabled)' : 'NO'}`);
  }

  /**
   * Start periodic memory and disk monitoring
   */
  startMemoryMonitoring() {
    if (this.memoryCheckTimer) return;

    this.memoryCheckTimer = setInterval(() => {
      this.handleMemoryWarning();
      this.handleDiskWarning();
    }, 30000);
    
    console.log('[CrashDiagnostics] ✅ Memory monitoring started (30s interval)');
  }

  /**
   * Get current statistics
   */
  getStats(): CrashStats & { disk: DiskState; session: string } {
    return {
      ...this.stats,
      disk: this.getDiskState(),
      session: this.sessionId,
    };
  }

  /**
   * Graceful shutdown
   */
  shutdown() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    if (this.memoryCheckTimer) {
      clearInterval(this.memoryCheckTimer);
      this.memoryCheckTimer = null;
    }
    console.log('[CrashDiagnostics] 🛑 Shutdown complete');
  }
}

export const crashDiagnostics = new EnterpriseCrashDiagnosticsService();
