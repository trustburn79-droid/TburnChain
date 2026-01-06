/**
 * TBURN Cold Start Warmup Manager
 * 
 * 10분 유휴 후 첫 요청 에러 방지:
 * - Cold start 감지 (5분 이상 유휴)
 * - DB 연결 재확인/재연결
 * - 세션 스토어 확인
 * - 주기적 DB 핑 (연결 유지)
 * 
 * @version 1.0.0
 */

import { Pool } from '@neondatabase/serverless';
import session from 'express-session';

export class WarmupManager {
  private lastRequestTime: number = Date.now();
  private isWarmingUp: boolean = false;
  private warmupPromise: Promise<void> | null = null;
  private dbPool: Pool | null = null;
  private sessionStore: session.Store | null = null;
  private pingInterval: NodeJS.Timeout | null = null;

  private readonly IDLE_THRESHOLD = 5 * 60 * 1000;
  private readonly WARMUP_TIMEOUT = 10000;
  private readonly DB_PING_INTERVAL = 30000;

  constructor() {
    console.log('[WARMUP] Manager initialized');
  }

  start(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    this.pingInterval = setInterval(() => this.pingDatabase(), this.DB_PING_INTERVAL);
    console.log('[WARMUP] DB keep-alive ping started (30s interval)');
  }

  stop(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  setDbPool(pool: Pool): void {
    this.dbPool = pool;
  }

  setSessionStore(store: session.Store): void {
    this.sessionStore = store;
  }

  async checkAndWarmup(): Promise<boolean> {
    const now = Date.now();
    const idleTime = now - this.lastRequestTime;
    this.lastRequestTime = now;

    if (idleTime > this.IDLE_THRESHOLD) {
      console.log(`[WARMUP] Cold start detected (idle: ${Math.floor(idleTime / 1000)}s)`);
      await this.performWarmup();
      return true;
    }

    return false;
  }

  private async performWarmup(): Promise<void> {
    if (this.isWarmingUp && this.warmupPromise) {
      return this.warmupPromise;
    }

    this.isWarmingUp = true;

    this.warmupPromise = new Promise<void>(async (resolve) => {
      const startTime = Date.now();

      try {
        await this.ensureDbConnection();
        await this.ensureSessionStore();

        const elapsed = Date.now() - startTime;
        console.log(`[WARMUP] Completed in ${elapsed}ms`);
      } catch (error: any) {
        console.error('[WARMUP] Error:', error.message);
      } finally {
        this.isWarmingUp = false;
        this.warmupPromise = null;
        resolve();
      }
    });

    const timeoutPromise = new Promise<void>((resolve) => {
      setTimeout(() => {
        console.warn('[WARMUP] Timeout reached, proceeding anyway');
        resolve();
      }, this.WARMUP_TIMEOUT);
    });

    await Promise.race([this.warmupPromise, timeoutPromise]);
  }

  private async ensureDbConnection(): Promise<void> {
    if (!this.dbPool) return;

    try {
      await this.dbPool.query('SELECT 1');
      console.log('[WARMUP] DB connection OK');
    } catch (error: any) {
      console.log('[WARMUP] DB connection check failed:', error.message);
    }
  }

  private async ensureSessionStore(): Promise<void> {
    if (!this.sessionStore) return;

    if ((this.sessionStore as any).sessions !== undefined) {
      console.log('[WARMUP] MemoryStore OK');
      return;
    }

    if (this.dbPool) {
      try {
        await this.dbPool.query('SELECT 1 FROM session LIMIT 1');
        console.log('[WARMUP] Session store OK');
      } catch (error: any) {
        console.warn('[WARMUP] Session store check failed:', error.message);
      }
    }
  }

  private async pingDatabase(): Promise<void> {
    if (!this.dbPool) return;

    try {
      await this.dbPool.query('SELECT 1');
    } catch (error) {
    }
  }

  getStatus(): object {
    return {
      lastRequestTime: new Date(this.lastRequestTime).toISOString(),
      idleSeconds: Math.floor((Date.now() - this.lastRequestTime) / 1000),
      isWarmingUp: this.isWarmingUp,
      hasDbPool: !!this.dbPool,
      hasSessionStore: !!this.sessionStore,
    };
  }
}

export const warmupManager = new WarmupManager();
