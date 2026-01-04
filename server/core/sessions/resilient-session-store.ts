/**
 * Enterprise Resilient Session Store
 * Phase 16: Production Stability Infrastructure
 * 
 * Provides a unified session store interface with:
 * - Redis as primary store (when REDIS_URL is configured)
 * - Automatic fallback to MemoryStore on Redis failure
 * - Connection pooling and health checks
 * - Circuit breaker pattern for failover
 * - Automatic reconnection with exponential backoff
 */

import session from 'express-session';
import MemoryStore from 'memorystore';
import { createClient, RedisClientType } from 'redis';
import { RedisStore } from 'connect-redis';
import { sessionMetrics } from '../monitoring/session-metrics';

type StoreType = 'redis' | 'memory';
type CircuitState = 'closed' | 'open' | 'half-open';

interface StoreHealth {
  primaryStore: StoreType;
  fallbackActive: boolean;
  redisConnected: boolean;
  redisLatencyMs: number | null;
  memorySessionCount: number;
  memoryMaxSessions: number;
  circuitState: CircuitState;
  consecutiveFailures: number;
  lastFailoverAt: Date | null;
  failoverCount: number;
}

interface ResilientStoreConfig {
  redisUrl?: string;
  memoryMaxSessions?: number;
  memoryCheckPeriod?: number;
  memoryTtl?: number;
  circuitOpenThreshold?: number;      // Failures before opening circuit
  circuitHalfOpenTimeout?: number;    // MS before trying half-open
  circuitCloseThreshold?: number;     // Successes in half-open before closing
  healthCheckInterval?: number;       // MS between health checks
  reconnectBaseDelay?: number;        // Base delay for reconnection
  reconnectMaxDelay?: number;         // Max delay for reconnection
}

const DEFAULT_CONFIG: Required<ResilientStoreConfig> = {
  redisUrl: '',
  memoryMaxSessions: 10000,
  memoryCheckPeriod: 30000,
  memoryTtl: 1800000, // 30 minutes
  circuitOpenThreshold: 5,
  circuitHalfOpenTimeout: 30000,
  circuitCloseThreshold: 3,
  healthCheckInterval: 10000,
  reconnectBaseDelay: 1000,
  reconnectMaxDelay: 60000,
};

export class ResilientSessionStore {
  private static instance: ResilientSessionStore;
  
  private config: Required<ResilientStoreConfig>;
  private redisClient: RedisClientType | null = null;
  private redisStore: InstanceType<typeof RedisStore> | null = null;
  private memoryStore: session.Store;
  
  // State
  private primaryStore: StoreType = 'memory';
  private fallbackActive = false;
  private redisConnected = false;
  private isInitialized = false;
  
  // Circuit breaker
  private circuitState: CircuitState = 'closed';
  private consecutiveFailures = 0;
  private consecutiveSuccesses = 0;
  private lastFailoverAt: Date | null = null;
  private failoverCount = 0;
  private circuitOpenedAt: Date | null = null;
  
  // Reconnection
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  
  // Health check
  private healthCheckTimer: NodeJS.Timeout | null = null;
  private lastHealthCheck: Date | null = null;
  private lastRedisLatency: number | null = null;
  
  private constructor(config: ResilientStoreConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Initialize memory store as fallback
    const MemoryStoreSession = MemoryStore(session);
    this.memoryStore = new MemoryStoreSession({
      checkPeriod: this.config.memoryCheckPeriod,
      max: this.config.memoryMaxSessions,
      ttl: this.config.memoryTtl,
      stale: false,
    }) as unknown as session.Store;
    
    console.log('[ResilientStore] Memory fallback store initialized');
  }
  
  static getInstance(config?: ResilientStoreConfig): ResilientSessionStore {
    if (!ResilientSessionStore.instance) {
      ResilientSessionStore.instance = new ResilientSessionStore(config);
    }
    return ResilientSessionStore.instance;
  }
  
  // ============================================================================
  // Initialization
  // ============================================================================
  
  async initialize(): Promise<session.Store> {
    if (this.isInitialized) {
      return this.getActiveStore();
    }
    
    const redisUrl = this.config.redisUrl || process.env.REDIS_URL;
    
    if (redisUrl) {
      try {
        await this.initializeRedis(redisUrl);
        this.primaryStore = 'redis';
        this.isInitialized = true;
        this.startHealthChecks();
        console.log('[ResilientStore] Initialized with Redis as primary store');
      } catch (error) {
        console.error('[ResilientStore] Redis initialization failed, using MemoryStore:', error);
        this.primaryStore = 'memory';
        this.fallbackActive = true;
        this.isInitialized = true;
      }
    } else {
      console.log('[ResilientStore] No REDIS_URL configured, using MemoryStore');
      this.primaryStore = 'memory';
      this.isInitialized = true;
    }
    
    this.updateMetrics();
    return this.getActiveStore();
  }
  
  private async initializeRedis(url: string): Promise<void> {
    this.redisClient = createClient({
      url,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            this.handleRedisFailure(new Error('Max reconnection attempts reached'));
            return new Error('Max reconnection attempts reached');
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });
    
    // Event handlers
    this.redisClient.on('connect', () => {
      console.log('[ResilientStore] Redis connected');
      this.redisConnected = true;
      this.handleRedisSuccess();
    });
    
    this.redisClient.on('ready', () => {
      console.log('[ResilientStore] Redis ready');
      this.redisConnected = true;
    });
    
    this.redisClient.on('error', (err) => {
      console.error('[ResilientStore] Redis error:', err.message);
      this.handleRedisFailure(err);
    });
    
    this.redisClient.on('end', () => {
      console.log('[ResilientStore] Redis connection closed');
      this.redisConnected = false;
    });
    
    // Connect
    await this.redisClient.connect();
    
    // Create Redis store
    this.redisStore = new RedisStore({
      client: this.redisClient,
      prefix: 'tburn:sess:',
      ttl: Math.floor(this.config.memoryTtl / 1000), // seconds
    });
    
    this.redisConnected = true;
  }
  
  // ============================================================================
  // Circuit Breaker
  // ============================================================================
  
  private handleRedisFailure(error: Error): void {
    this.consecutiveFailures++;
    this.consecutiveSuccesses = 0;
    
    console.log(`[ResilientStore] Redis failure #${this.consecutiveFailures}: ${error.message}`);
    
    if (this.circuitState === 'closed' && 
        this.consecutiveFailures >= this.config.circuitOpenThreshold) {
      this.openCircuit();
    } else if (this.circuitState === 'half-open') {
      this.openCircuit();
    }
    
    this.updateMetrics();
  }
  
  private handleRedisSuccess(): void {
    this.consecutiveSuccesses++;
    this.consecutiveFailures = 0;
    
    if (this.circuitState === 'half-open' && 
        this.consecutiveSuccesses >= this.config.circuitCloseThreshold) {
      this.closeCircuit();
    }
    
    this.updateMetrics();
  }
  
  private openCircuit(): void {
    if (this.circuitState === 'open') return;
    
    this.circuitState = 'open';
    this.circuitOpenedAt = new Date();
    this.fallbackActive = true;
    this.failoverCount++;
    this.lastFailoverAt = new Date();
    
    console.log(`[ResilientStore] Circuit OPENED - Failover #${this.failoverCount} to MemoryStore`);
    
    // Schedule half-open transition
    setTimeout(() => {
      this.tryHalfOpen();
    }, this.config.circuitHalfOpenTimeout);
    
    this.updateMetrics();
  }
  
  private tryHalfOpen(): void {
    if (this.circuitState !== 'open') return;
    
    this.circuitState = 'half-open';
    this.consecutiveSuccesses = 0;
    console.log('[ResilientStore] Circuit HALF-OPEN - Testing Redis connection');
    
    // Test Redis connection
    this.testRedisConnection();
  }
  
  private closeCircuit(): void {
    this.circuitState = 'closed';
    this.fallbackActive = false;
    this.consecutiveFailures = 0;
    console.log('[ResilientStore] Circuit CLOSED - Redis restored as primary');
    this.updateMetrics();
  }
  
  private async testRedisConnection(): Promise<void> {
    if (!this.redisClient) return;
    
    try {
      const start = Date.now();
      await this.redisClient.ping();
      this.lastRedisLatency = Date.now() - start;
      this.handleRedisSuccess();
    } catch (error) {
      this.handleRedisFailure(error as Error);
    }
  }
  
  // ============================================================================
  // Health Checks
  // ============================================================================
  
  private startHealthChecks(): void {
    if (this.healthCheckTimer) return;
    
    this.healthCheckTimer = setInterval(async () => {
      await this.performHealthCheck();
    }, this.config.healthCheckInterval);
    
    console.log('[ResilientStore] Health checks started');
  }
  
  private async performHealthCheck(): Promise<void> {
    this.lastHealthCheck = new Date();
    
    if (this.redisClient && this.circuitState !== 'open') {
      try {
        const start = Date.now();
        await this.redisClient.ping();
        this.lastRedisLatency = Date.now() - start;
        this.redisConnected = true;
        
        if (this.circuitState === 'half-open') {
          this.handleRedisSuccess();
        }
      } catch (error) {
        this.redisConnected = false;
        this.handleRedisFailure(error as Error);
      }
    }
    
    this.updateMetrics();
  }
  
  // ============================================================================
  // Store Access
  // ============================================================================
  
  getActiveStore(): session.Store {
    if (this.primaryStore === 'redis' && this.redisStore && !this.fallbackActive) {
      return this.redisStore as unknown as session.Store;
    }
    return this.memoryStore as unknown as session.Store;
  }
  
  getHealth(): StoreHealth {
    let memorySessionCount = 0;
    try {
      // Attempt to get session count from memory store
      (this.memoryStore as any).all?.((err: Error, sessions: Record<string, any>) => {
        if (!err && sessions) {
          memorySessionCount = Object.keys(sessions).length;
        }
      });
    } catch {
      // Ignore errors
    }
    
    return {
      primaryStore: this.primaryStore,
      fallbackActive: this.fallbackActive,
      redisConnected: this.redisConnected,
      redisLatencyMs: this.lastRedisLatency,
      memorySessionCount,
      memoryMaxSessions: this.config.memoryMaxSessions,
      circuitState: this.circuitState,
      consecutiveFailures: this.consecutiveFailures,
      lastFailoverAt: this.lastFailoverAt,
      failoverCount: this.failoverCount,
    };
  }
  
  private updateMetrics(): void {
    sessionMetrics.updateStoreInfo({
      type: this.fallbackActive ? 'memory' : this.primaryStore,
      health: this.getStoreHealthStatus(),
      redisConnected: this.redisConnected,
    });
  }
  
  private getStoreHealthStatus(): 'healthy' | 'degraded' | 'unhealthy' {
    if (this.primaryStore === 'redis') {
      if (this.fallbackActive) return 'degraded';
      if (!this.redisConnected) return 'unhealthy';
      return 'healthy';
    }
    return 'healthy';
  }
  
  // ============================================================================
  // Lifecycle
  // ============================================================================
  
  async shutdown(): Promise<void> {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.redisClient) {
      try {
        await this.redisClient.quit();
      } catch (error) {
        console.error('[ResilientStore] Error closing Redis connection:', error);
      }
    }
    
    console.log('[ResilientStore] Shutdown complete');
  }
  
  // ============================================================================
  // Force Failover (for testing)
  // ============================================================================
  
  forceFailover(): void {
    console.log('[ResilientStore] Forced failover initiated');
    this.openCircuit();
  }
  
  forceRecovery(): void {
    console.log('[ResilientStore] Forced recovery initiated');
    this.closeCircuit();
  }
}

// Export singleton factory
export const createResilientStore = (config?: ResilientStoreConfig): ResilientSessionStore => {
  return ResilientSessionStore.getInstance(config);
};

export const resilientStore = ResilientSessionStore.getInstance();
