/**
 * TBURN Mainnet Security Client
 * Communicates with the main system's Validator Security API
 * Syncs security status, receives commands, and reports alerts
 */

import * as https from 'https';
import * as http from 'http';
import { EventEmitter } from 'events';
import { CryptoUtils } from '../security/crypto-utils.js';

export interface MainnetSecurityConfig {
  mainnetApiUrl: string;
  validatorAddress: string;
  nodeId: string;
  apiKey: string;
  syncIntervalMs: number;
  timeout: number;
  enableSync: boolean;
}

export interface SecuritySyncData {
  isBlocked: boolean;
  blockReason?: string;
  rateLimitConfig: {
    requestsPerSecond: number;
    requestsPerMinute: number;
    burstCapacity: number;
  };
  ipWhitelist: string[];
  activeAlerts: SecurityAlert[];
  lastSyncTime: Date;
}

export interface SecurityAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  status: 'active' | 'acknowledged' | 'resolved';
}

export interface SecurityReport {
  validatorAddress: string;
  nodeId: string;
  timestamp: number;
  metrics: {
    signingRequests: number;
    blockedRequests: number;
    rateLimitHits: number;
    replayAttemptsBlocked: number;
    averageLatencyMs: number;
    securityAlertCount: number;
  };
  status: {
    isOperational: boolean;
    securityEnabled: boolean;
    lastSecurityCheck: number;
    uptime: number;
  };
  alerts: Array<{
    type: string;
    severity: string;
    message: string;
    timestamp: number;
  }>;
}

export class MainnetSecurityClient extends EventEmitter {
  private config: MainnetSecurityConfig;
  private syncInterval?: NodeJS.Timeout;
  private lastSyncData: SecuritySyncData | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(config: MainnetSecurityConfig) {
    super();
    this.config = config;
    
    console.log(`[MainnetSecurityClient] Initialized for ${config.validatorAddress}`);
    console.log(`[MainnetSecurityClient] API URL: ${config.mainnetApiUrl}`);
    console.log(`[MainnetSecurityClient] Sync Interval: ${config.syncIntervalMs}ms`);
  }

  async start(): Promise<boolean> {
    if (!this.config.enableSync) {
      console.log('[MainnetSecurityClient] Sync disabled, running in standalone mode');
      return true;
    }

    try {
      console.log('[MainnetSecurityClient] Starting security sync...');
      
      const initialSync = await this.performSecuritySync();
      if (!initialSync) {
        console.warn('[MainnetSecurityClient] Initial sync failed, will retry');
      }

      this.startSyncLoop();
      this.isConnected = true;
      this.emit('connected');
      
      console.log('[MainnetSecurityClient] Security sync started successfully');
      return true;
    } catch (error) {
      console.error('[MainnetSecurityClient] Failed to start:', error);
      return false;
    }
  }

  async stop(): Promise<void> {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
    }
    this.isConnected = false;
    this.emit('disconnected');
    console.log('[MainnetSecurityClient] Stopped');
  }

  private startSyncLoop(): void {
    this.syncInterval = setInterval(async () => {
      await this.performSecuritySync();
    }, this.config.syncIntervalMs);
  }

  private async performSecuritySync(): Promise<boolean> {
    try {
      // Use the dedicated validator-scoped endpoint
      const response = await this.fetchMySecurityStatus();

      if (!response?.success || !response?.data) {
        throw new Error('Invalid response from security status endpoint');
      }

      const statusData = response.data;
      
      this.lastSyncData = {
        isBlocked: statusData.isBlocked || false,
        blockReason: statusData.blockReason,
        rateLimitConfig: {
          requestsPerSecond: statusData.rateLimitConfig?.requestsPerSecond || 100,
          requestsPerMinute: statusData.rateLimitConfig?.requestsPerMinute || 1000,
          burstCapacity: statusData.rateLimitConfig?.burstCapacity || 50,
        },
        ipWhitelist: [],
        activeAlerts: (statusData.activeAlerts || []).map((a: any) => ({
          id: a.id,
          type: a.type,
          severity: a.severity,
          message: a.message,
          timestamp: new Date(a.timestamp),
          status: 'active' as const,
        })),
        lastSyncTime: new Date(statusData.syncedAt || Date.now()),
      };

      this.reconnectAttempts = 0;
      
      if (this.lastSyncData.isBlocked) {
        this.emit('blocked', { reason: this.lastSyncData.blockReason });
      }

      this.emit('synced', this.lastSyncData);
      return true;
    } catch (error) {
      this.reconnectAttempts++;
      console.error(`[MainnetSecurityClient] Sync failed (attempt ${this.reconnectAttempts}):`, error);
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.emit('syncFailed', { attempts: this.reconnectAttempts });
      }
      
      return false;
    }
  }

  async reportSecurityStatus(report: SecurityReport): Promise<boolean> {
    try {
      const endpoint = `${this.config.mainnetApiUrl}/api/external-validators/security/report`;
      
      const requestId = CryptoUtils.generateRequestId();
      const payload = {
        ...report,
        requestId,
        signature: this.signReport(report),
      };

      await this.httpRequest(endpoint, 'POST', payload);
      
      console.log(`[MainnetSecurityClient] Security report sent: ${requestId}`);
      return true;
    } catch (error) {
      console.error('[MainnetSecurityClient] Failed to send security report:', error);
      return false;
    }
  }

  async acknowledgeAlert(alertId: string): Promise<boolean> {
    try {
      const endpoint = `${this.config.mainnetApiUrl}/api/external-validators/security/alerts/${alertId}/acknowledge`;
      
      await this.httpRequest(endpoint, 'POST', {
        validatorAddress: this.config.validatorAddress,
        nodeId: this.config.nodeId,
        acknowledgedAt: Date.now(),
      });

      console.log(`[MainnetSecurityClient] Alert ${alertId} acknowledged`);
      return true;
    } catch (error) {
      console.error('[MainnetSecurityClient] Failed to acknowledge alert:', error);
      return false;
    }
  }

  private async fetchMySecurityStatus(): Promise<any> {
    const endpoint = `${this.config.mainnetApiUrl}/api/external-validators/security/my-status`;
    return this.httpRequest(endpoint, 'GET');
  }

  async sendSecurityHeartbeat(data: {
    nodeId: string;
    uptime: number;
    currentSlot: number;
    securityStats: any;
  }): Promise<any> {
    const endpoint = `${this.config.mainnetApiUrl}/api/external-validators/security/heartbeat`;
    return this.httpRequest(endpoint, 'POST', data);
  }

  private async httpRequest(url: string, method: string, body?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const isHttps = parsedUrl.protocol === 'https:';
      const lib = isHttps ? https : http;

      // Generate timestamp and nonce for replay protection
      const timestamp = Date.now().toString();
      const nonce = CryptoUtils.generateNonce();
      
      // Generate HMAC signature for request integrity
      const bodyStr = body ? JSON.stringify(body) : '';
      const signaturePayload = `${timestamp}:${nonce}:${bodyStr}`;
      const signature = CryptoUtils.hmacSHA256(this.config.apiKey, signaturePayload);

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method,
        timeout: this.config.timeout,
        headers: {
          'Content-Type': 'application/json',
          'X-Validator-Address': this.config.validatorAddress,
          'X-Node-ID': this.config.nodeId,
          'X-API-Key': this.config.apiKey,
          'X-Timestamp': timestamp,
          'X-Nonce': nonce,
          'X-Signature': signature,
        },
      };

      const req = lib.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            if (res.statusCode === 200 || res.statusCode === 201) {
              resolve(data ? JSON.parse(data) : {});
            } else if (res.statusCode === 401 || res.statusCode === 403) {
              reject(new Error(`Authentication failed: ${res.statusCode}`));
            } else {
              reject(new Error(`Request failed: ${res.statusCode}`));
            }
          } catch (e) {
            reject(new Error(`Failed to parse response: ${e}`));
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  }

  private signReport(report: SecurityReport): string {
    const data = JSON.stringify({
      validatorAddress: report.validatorAddress,
      nodeId: report.nodeId,
      timestamp: report.timestamp,
    });
    return CryptoUtils.hashSHA3(data + this.config.apiKey);
  }

  getLastSyncData(): SecuritySyncData | null {
    return this.lastSyncData;
  }

  isValidatorBlocked(): boolean {
    return this.lastSyncData?.isBlocked || false;
  }

  getBlockReason(): string | undefined {
    return this.lastSyncData?.blockReason;
  }

  getRateLimitConfig(): { requestsPerSecond: number; requestsPerMinute: number; burstCapacity: number } {
    return this.lastSyncData?.rateLimitConfig || {
      requestsPerSecond: 100,
      requestsPerMinute: 1000,
      burstCapacity: 50,
    };
  }

  getActiveAlerts(): SecurityAlert[] {
    return this.lastSyncData?.activeAlerts || [];
  }

  isConnectedToMainnet(): boolean {
    return this.isConnected;
  }

  getConfig(): MainnetSecurityConfig {
    return this.config;
  }
}
