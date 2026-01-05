/**
 * ★ [2026-01-05] Enterprise Crash Diagnostics System
 * 
 * 프로덕션 "Internal Server Error" 근본 원인 분석을 위한 종합 진단 시스템
 * - 글로벌 예외 핸들러 (uncaughtException, unhandledRejection)
 * - 메모리 위기 감지 및 힙 스냅샷
 * - 크래시 직전 상태 영구 저장
 * - 상세 스택 트레이스 로깅
 */

import * as v8 from 'v8';
import * as fs from 'fs';
import * as path from 'path';

interface CrashContext {
  timestamp: string;
  type: 'uncaughtException' | 'unhandledRejection' | 'memoryWarning' | 'oom';
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  memory: {
    heapUsed: number;
    heapTotal: number;
    heapUsagePercent: number;
    rss: number;
    external: number;
  };
  process: {
    uptime: number;
    pid: number;
    nodeVersion: string;
    platform: string;
  };
  activeIntervals: number;
  recentLogs: string[];
}

class CrashDiagnosticsService {
  private recentLogs: string[] = [];
  private maxLogs = 100;
  private isShuttingDown = false;
  private heapSnapshotTaken = false;
  private activeIntervalsCount = 0;
  private crashLogPath = '/tmp/tburn-crash-logs';

  constructor() {
    this.ensureCrashLogDirectory();
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
   * 최근 로그 기록 (크래시 직전 컨텍스트용)
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
   * 활성 인터벌 카운트 업데이트
   */
  updateActiveIntervals(count: number) {
    this.activeIntervalsCount = count;
  }

  /**
   * 현재 메모리 상태 가져오기
   */
  private getMemoryState() {
    const mem = process.memoryUsage();
    return {
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
      heapUsagePercent: Math.round((mem.heapUsed / mem.heapTotal) * 100),
      rss: Math.round(mem.rss / 1024 / 1024),
      external: Math.round(mem.external / 1024 / 1024),
    };
  }

  /**
   * 크래시 컨텍스트 수집
   */
  private collectCrashContext(
    type: CrashContext['type'],
    error?: Error
  ): CrashContext {
    return {
      timestamp: new Date().toISOString(),
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
      },
      activeIntervals: this.activeIntervalsCount,
      recentLogs: [...this.recentLogs],
    };
  }

  /**
   * 크래시 컨텍스트를 파일에 저장
   */
  private saveCrashContext(context: CrashContext) {
    try {
      const filename = `crash-${Date.now()}.json`;
      const filepath = path.join(this.crashLogPath, filename);
      fs.writeFileSync(filepath, JSON.stringify(context, null, 2));
      console.error(`[CrashDiagnostics] 💾 Crash context saved to: ${filepath}`);
    } catch (e) {
      console.error('[CrashDiagnostics] Failed to save crash context:', e);
    }
  }

  /**
   * 힙 스냅샷 저장 (1회만)
   */
  private takeHeapSnapshot() {
    if (this.heapSnapshotTaken) return;
    
    try {
      const filename = `heapdump-${Date.now()}.heapsnapshot`;
      const filepath = path.join(this.crashLogPath, filename);
      v8.writeHeapSnapshot(filepath);
      this.heapSnapshotTaken = true;
      console.error(`[CrashDiagnostics] 📸 Heap snapshot saved to: ${filepath}`);
    } catch (e) {
      console.error('[CrashDiagnostics] Failed to take heap snapshot:', e);
    }
  }

  /**
   * 메모리 경고 처리 (85% 이상 사용 시)
   */
  handleMemoryWarning() {
    const mem = this.getMemoryState();
    if (mem.heapUsagePercent >= 85 && !this.heapSnapshotTaken) {
      console.error(`[CrashDiagnostics] ⚠️ MEMORY WARNING: ${mem.heapUsagePercent}% heap usage`);
      this.log(`Memory warning: ${mem.heapUsagePercent}% heap usage (${mem.heapUsed}MB / ${mem.heapTotal}MB)`, 'warn');
      
      const context = this.collectCrashContext('memoryWarning');
      this.saveCrashContext(context);
      this.takeHeapSnapshot();
    }
  }

  /**
   * uncaughtException 핸들러
   */
  handleUncaughtException(error: Error) {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    console.error('');
    console.error('═══════════════════════════════════════════════════════════════');
    console.error('[CrashDiagnostics] 🚨 UNCAUGHT EXCEPTION');
    console.error('═══════════════════════════════════════════════════════════════');
    console.error(`Error Name: ${error.name}`);
    console.error(`Error Message: ${error.message}`);
    console.error('');
    console.error('Stack Trace:');
    console.error(error.stack);
    console.error('');

    const context = this.collectCrashContext('uncaughtException', error);
    console.error('Memory State:', JSON.stringify(context.memory, null, 2));
    console.error('Process Uptime:', context.process.uptime, 'seconds');
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
   * unhandledRejection 핸들러
   */
  handleUnhandledRejection(reason: unknown, promise: Promise<unknown>) {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    
    console.error('');
    console.error('═══════════════════════════════════════════════════════════════');
    console.error('[CrashDiagnostics] 🚨 UNHANDLED PROMISE REJECTION');
    console.error('═══════════════════════════════════════════════════════════════');
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
   * process.on('warning') 핸들러
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
   * 프로세스 핸들러 등록
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

    console.log('[CrashDiagnostics] ✅ Process crash handlers registered');
    console.log('[CrashDiagnostics] 📁 Crash logs will be saved to:', this.crashLogPath);
  }

  /**
   * 주기적 메모리 체크 시작 (30초마다)
   */
  startMemoryMonitoring() {
    setInterval(() => {
      this.handleMemoryWarning();
    }, 30000);
    
    console.log('[CrashDiagnostics] ✅ Memory monitoring started (30s interval)');
  }
}

export const crashDiagnostics = new CrashDiagnosticsService();
