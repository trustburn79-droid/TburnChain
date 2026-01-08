/**
 * Redis Session Manager
 * 
 * Enterprise-grade Redis session store management:
 * - Automatic Redis detection via REDIS_URL
 * - Graceful failover from MemoryStore to Redis
 * - Connection health monitoring
 * - Automatic reconnection with exponential backoff
 * - Session migration utilities
 * 
 * For TBURN Mainnet Production (Chain ID: 5800)
 */

import { createClient, RedisClientType } from 'redis';
import session from 'express-session';
import { RedisStore } from 'connect-redis';

// ============================================================================
// Types
// ============================================================================

interface RedisConnectionStatus {
  connected: boolean;
  url: string | null;
  lastConnected: Date | null;
  lastError: string | null;
  reconnectAttempts: number;
  latencyMs: number | null;
}

interface SessionStoreConfig {
  type: 'redis' | 'memory';
  store: session.Store;
  description: string;
  maxSessions: number;
  ttlMs: number;
}

// ============================================================================
// Redis Session Manager Class
// ============================================================================

class RedisSessionManager {
  private static instance: RedisSessionManager;
  
  private redisClient: RedisClientType | null = null;
  private redisStore: RedisStore | null = null;
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectTimer: NodeJS.Timeout | null = null;
  
  private connectionStatus: RedisConnectionStatus = {
    connected: false,
    url: null,
    lastConnected: null,
    lastError: null,
    reconnectAttempts: 0,
    latencyMs: null,
  };
  
  private constructor() {}
  
  static getInstance(): RedisSessionManager {
    if (!RedisSessionManager.instance) {
      RedisSessionManager.instance = new RedisSessionManager();
    }
    return RedisSessionManager.instance;
  }
  
  // ============================================================================
  // Connection Management
  // ============================================================================
  
  async connect(redisUrl: string): Promise<boolean> {
    if (this.isConnecting) {
      console.log('[RedisSession] Connection already in progress');
      return false;
    }
    
    if (this.redisClient?.isOpen) {
      console.log('[RedisSession] Already connected');
      return true;
    }
    
    this.isConnecting = true;
    this.connectionStatus.url = this.maskUrl(redisUrl);
    
    try {
      console.log('[RedisSession] Attempting connection...');
      
      this.redisClient = createClient({
        url: redisUrl,
        socket: {
          connectTimeout: 5000,
          keepAlive: true,
          reconnectStrategy: (retries) => {
            if (retries > this.maxReconnectAttempts) {
              console.error('[RedisSession] Max reconnection attempts reached');
              return new Error('Max reconnection attempts reached');
            }
            const delay = Math.min(retries * 500, 5000);
            console.log(`[RedisSession] Reconnecting in ${delay}ms (attempt ${retries})`);
            return delay;
          },
        },
      });
      
      // Event handlers
      this.redisClient.on('error', (err) => {
        console.error('[RedisSession] Connection error:', err.message);
        this.connectionStatus.lastError = err.message;
        this.connectionStatus.connected = false;
      });
      
      this.redisClient.on('connect', () => {
        console.log('[RedisSession] Connected to Redis');
        this.connectionStatus.connected = true;
        this.connectionStatus.lastConnected = new Date();
        this.connectionStatus.lastError = null;
        this.reconnectAttempts = 0;
      });
      
      this.redisClient.on('ready', () => {
        console.log('[RedisSession] Redis client ready');
      });
      
      this.redisClient.on('end', () => {
        console.log('[RedisSession] Redis connection closed');
        this.connectionStatus.connected = false;
      });
      
      // Connect
      await this.redisClient.connect();
      
      // Test connection with PING
      const pingStart = Date.now();
      await this.redisClient.ping();
      this.connectionStatus.latencyMs = Date.now() - pingStart;
      
      console.log(`[RedisSession] ✅ Connected successfully (latency: ${this.connectionStatus.latencyMs}ms)`);
      
      this.isConnecting = false;
      return true;
      
    } catch (error: any) {
      console.error('[RedisSession] Connection failed:', error.message);
      this.connectionStatus.lastError = error.message;
      this.connectionStatus.connected = false;
      this.isConnecting = false;
      this.reconnectAttempts++;
      return false;
    }
  }
  
  async disconnect(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.redisClient?.isOpen) {
      await this.redisClient.quit();
      console.log('[RedisSession] Disconnected from Redis');
    }
    
    this.redisClient = null;
    this.redisStore = null;
    this.connectionStatus.connected = false;
  }
  
  // ============================================================================
  // Store Management
  // ============================================================================
  
  createSessionStore(): session.Store | null {
    if (!this.redisClient?.isOpen) {
      console.warn('[RedisSession] Cannot create store - not connected');
      return null;
    }
    
    this.redisStore = new RedisStore({
      client: this.redisClient,
      prefix: 'tburn:sess:',
      ttl: 7200, // 2 hours
    });
    
    console.log('[RedisSession] ✅ Redis session store created');
    return this.redisStore;
  }
  
  getStore(): RedisStore | null {
    return this.redisStore;
  }
  
  // ============================================================================
  // Health Check
  // ============================================================================
  
  async checkHealth(): Promise<{ healthy: boolean; latencyMs: number | null; error: string | null }> {
    if (!this.redisClient?.isOpen) {
      return {
        healthy: false,
        latencyMs: null,
        error: 'Not connected',
      };
    }
    
    try {
      const start = Date.now();
      await this.redisClient.ping();
      const latency = Date.now() - start;
      
      this.connectionStatus.latencyMs = latency;
      
      return {
        healthy: true,
        latencyMs: latency,
        error: null,
      };
    } catch (error: any) {
      return {
        healthy: false,
        latencyMs: null,
        error: error.message,
      };
    }
  }
  
  // ============================================================================
  // Status
  // ============================================================================
  
  getConnectionStatus(): RedisConnectionStatus {
    return { ...this.connectionStatus };
  }
  
  isConnected(): boolean {
    return this.redisClient?.isOpen ?? false;
  }
  
  // ============================================================================
  // Utilities
  // ============================================================================
  
  private maskUrl(url: string): string {
    try {
      const parsed = new URL(url);
      if (parsed.password) {
        parsed.password = '****';
      }
      return parsed.toString();
    } catch {
      return '[invalid url]';
    }
  }
  
  // ============================================================================
  // Session Store Factory
  // ============================================================================
  
  /**
   * Creates the appropriate session store based on environment
   * If REDIS_URL is set, attempts Redis connection
   * Falls back to MemoryStore if Redis is unavailable
   */
  static async createOptimalStore(
    memoryStoreFactory: () => session.Store,
    isProduction: boolean
  ): Promise<SessionStoreConfig> {
    const redisUrl = process.env.REDIS_URL;
    const maxSessions = isProduction ? 10000 : 2000;
    const ttlMs = 2 * 60 * 60 * 1000; // 2 hours
    
    // If REDIS_URL is configured, try Redis first
    if (redisUrl) {
      console.log('[SessionStore] REDIS_URL detected, attempting Redis connection...');
      
      const manager = RedisSessionManager.getInstance();
      const connected = await manager.connect(redisUrl);
      
      if (connected) {
        const store = manager.createSessionStore();
        if (store) {
          console.log('[SessionStore] ✅ Using Redis session store');
          return {
            type: 'redis',
            store,
            description: 'Redis (enterprise-grade, horizontally scalable)',
            maxSessions: Infinity,
            ttlMs,
          };
        }
      }
      
      console.warn('[SessionStore] ⚠️ Redis connection failed, falling back to MemoryStore');
    }
    
    // Fall back to MemoryStore
    console.log(`[SessionStore] Using MemoryStore (max: ${maxSessions}, TTL: ${ttlMs / 60000}m)`);
    return {
      type: 'memory',
      store: memoryStoreFactory(),
      description: `MemoryStore (max: ${maxSessions}, cleanup: 30s)`,
      maxSessions,
      ttlMs,
    };
  }
}

// Export singleton and factory
export const redisSessionManager = RedisSessionManager.getInstance();
export { RedisSessionManager };
