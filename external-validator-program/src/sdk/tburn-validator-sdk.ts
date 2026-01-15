/**
 * TBURN Validator SDK
 * TypeScript client SDK for programmatic access to TBURN Mainnet Validator APIs
 * 
 * Features:
 * - Validator Registration
 * - Security Sync & Status
 * - RPC Integration
 * - Multi-language Ready (i18n compatible)
 * 
 * Chain ID: 5800 | TBURN Mainnet | Target: 210,000 TPS
 */

import { EventEmitter } from 'events';
import * as crypto from 'crypto';

export type ValidatorTier = 'genesis' | 'pioneer' | 'standard' | 'community';
export type ValidatorRegion = 'global' | 'us-east' | 'us-west' | 'eu-west' | 'eu-central' | 
  'asia-east' | 'asia-south' | 'asia-southeast' | 'oceania' | 'south-america' | 'africa';
export type RegistrationStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

export interface SDKConfig {
  mainnetApiUrl: string;
  apiKey?: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelayMs?: number;
}

export interface RegistrationRequest {
  operatorAddress: string;
  operatorName: string;
  region: ValidatorRegion;
  stakeAmount: string;
  tier: ValidatorTier;
  publicKey: string;
  nodeEndpoint?: string;
  metadata?: {
    organization?: string;
    website?: string;
    email?: string;
    description?: string;
    infrastructure?: string;
    experience?: string;
  };
  multiSigAddresses?: string[];
}

export interface RegistrationResult {
  success: boolean;
  registrationId?: string;
  message?: string;
  error?: string;
  estimatedReviewTime?: string;
}

export interface ValidatorStatus {
  nodeId: string;
  address: string;
  status: 'active' | 'inactive' | 'jailed' | 'slashed' | 'pending';
  tier: ValidatorTier;
  uptime: number;
  blocksProduced: number;
  lastBlock?: number;
  lastHeartbeat?: Date;
  healthScore: number;
  rewards: {
    pending: string;
    claimed: string;
    total: string;
  };
  rpcEnabled: boolean;
  isBlocked: boolean;
}

export interface SecurityStatus {
  isBlocked: boolean;
  blockReason?: string;
  activeAlerts: SecurityAlert[];
  lastSync: Date;
  rateLimitStatus: {
    current: number;
    limit: number;
    remaining: number;
    resetsAt: Date;
  };
}

export interface SecurityAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

export interface RPCEndpoint {
  region: ValidatorRegion;
  endpoint: string;
  wsEndpoint: string;
  tier: ValidatorTier;
  healthScore: number;
  latencyMs: number;
}

export interface NetworkStats {
  chainId: number;
  blockHeight: number;
  tps: number;
  validators: {
    total: number;
    active: number;
    jailed: number;
  };
  shards: number;
  networkVersion: string;
}

export class TBurnValidatorSDK extends EventEmitter {
  private config: Required<SDKConfig>;
  private apiKey?: string;
  private validatorAddress?: string;
  private nodeId?: string;
  
  constructor(config: SDKConfig) {
    super();
    
    this.config = {
      mainnetApiUrl: config.mainnetApiUrl.replace(/\/$/, ''),
      apiKey: config.apiKey || '',
      timeout: config.timeout || 30000,
      retryAttempts: config.retryAttempts || 3,
      retryDelayMs: config.retryDelayMs || 1000
    };
    
    this.apiKey = config.apiKey;
  }

  setCredentials(validatorAddress: string, nodeId: string, apiKey: string): void {
    this.validatorAddress = validatorAddress;
    this.nodeId = nodeId;
    this.apiKey = apiKey;
    this.config.apiKey = apiKey;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: any,
    authenticated: boolean = false
  ): Promise<T> {
    const url = `${this.config.mainnetApiUrl}${endpoint}`;
    const timestamp = Date.now().toString();
    const nonce = crypto.randomBytes(16).toString('hex');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-SDK-Version': '2.1.0',
      'X-Timestamp': timestamp,
      'X-Nonce': nonce
    };

    if (authenticated && this.apiKey && this.validatorAddress) {
      headers['X-API-Key'] = this.apiKey;
      headers['X-Validator-Address'] = this.validatorAddress;
      
      const signatureData = `${method}:${endpoint}:${timestamp}:${nonce}:${JSON.stringify(body || {})}`;
      const signature = crypto
        .createHmac('sha256', this.apiKey)
        .update(signatureData)
        .digest('hex');
      headers['X-Signature'] = signature;
    }

    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
        
        const response = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || data.message || `HTTP ${response.status}`);
        }
        
        return data as T;
      } catch (error: any) {
        lastError = error;
        
        if (attempt < this.config.retryAttempts) {
          await this.delay(this.config.retryDelayMs * attempt);
        }
      }
    }
    
    throw lastError || new Error('Request failed');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async register(request: RegistrationRequest): Promise<RegistrationResult> {
    try {
      const response = await this.request<any>('POST', '/api/external-validators/register', request);
      
      return {
        success: response.success,
        registrationId: response.data?.registrationId,
        message: response.data?.message,
        estimatedReviewTime: response.data?.estimatedReviewTime
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getRegistrationStatus(registrationId: string): Promise<{
    status: RegistrationStatus;
    details?: any;
  }> {
    const response = await this.request<any>(
      'GET',
      `/api/external-validators/registration/${registrationId}`,
      undefined,
      false
    );
    
    return {
      status: response.data?.status,
      details: response.data
    };
  }

  async getValidatorStatus(): Promise<ValidatorStatus> {
    if (!this.validatorAddress || !this.apiKey) {
      throw new Error('Credentials not set. Call setCredentials() first.');
    }
    
    const response = await this.request<any>(
      'GET',
      '/api/external-validators/security/my-status',
      undefined,
      true
    );
    
    return {
      nodeId: response.data?.nodeId || this.nodeId || '',
      address: this.validatorAddress,
      status: response.data?.status || 'pending',
      tier: response.data?.tier || 'community',
      uptime: response.data?.uptime || 0,
      blocksProduced: response.data?.blocksProduced || 0,
      lastBlock: response.data?.lastBlock,
      lastHeartbeat: response.data?.lastHeartbeat ? new Date(response.data.lastHeartbeat) : undefined,
      healthScore: response.data?.healthScore || 0,
      rewards: {
        pending: response.data?.rewards?.pending || '0',
        claimed: response.data?.rewards?.claimed || '0',
        total: response.data?.rewards?.total || '0'
      },
      rpcEnabled: response.data?.rpcEnabled || false,
      isBlocked: response.data?.isBlocked || false
    };
  }

  async getSecurityStatus(): Promise<SecurityStatus> {
    if (!this.validatorAddress || !this.apiKey) {
      throw new Error('Credentials not set. Call setCredentials() first.');
    }
    
    const response = await this.request<any>(
      'GET',
      '/api/external-validators/security/my-status',
      undefined,
      true
    );
    
    return {
      isBlocked: response.data?.isBlocked || false,
      blockReason: response.data?.blockReason,
      activeAlerts: (response.data?.activeAlerts || []).map((a: any) => ({
        id: a.id,
        type: a.type,
        severity: a.severity,
        message: a.message,
        timestamp: new Date(a.timestamp),
        acknowledged: a.acknowledged || false
      })),
      lastSync: new Date(response.data?.lastSync || Date.now()),
      rateLimitStatus: {
        current: response.data?.rateLimit?.current || 0,
        limit: response.data?.rateLimit?.limit || 1000,
        remaining: response.data?.rateLimit?.remaining || 1000,
        resetsAt: new Date(response.data?.rateLimit?.resetsAt || Date.now() + 60000)
      }
    };
  }

  async acknowledgeAlert(alertId: string): Promise<boolean> {
    if (!this.apiKey) {
      throw new Error('Credentials not set. Call setCredentials() first.');
    }
    
    const response = await this.request<any>(
      'POST',
      `/api/external-validators/security/alerts/${alertId}/acknowledge`,
      undefined,
      true
    );
    
    return response.success === true;
  }

  async sendHeartbeat(metrics?: {
    blocksProduced?: number;
    attestations?: number;
    uptime?: number;
    cpuUsage?: number;
    memoryUsage?: number;
    diskUsage?: number;
  }): Promise<boolean> {
    if (!this.validatorAddress || !this.apiKey) {
      throw new Error('Credentials not set. Call setCredentials() first.');
    }
    
    const response = await this.request<any>(
      'POST',
      '/api/external-validators/security/heartbeat',
      {
        nodeId: this.nodeId,
        validatorAddress: this.validatorAddress,
        metrics: {
          ...metrics,
          timestamp: Date.now()
        }
      },
      true
    );
    
    this.emit('heartbeat', { success: response.success });
    
    return response.success === true;
  }

  async submitSecurityReport(report: {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    details: string;
    evidence?: any;
  }): Promise<boolean> {
    if (!this.apiKey) {
      throw new Error('Credentials not set. Call setCredentials() first.');
    }
    
    const response = await this.request<any>(
      'POST',
      '/api/external-validators/security/report',
      report,
      true
    );
    
    return response.success === true;
  }

  async getRPCEndpoints(region?: ValidatorRegion): Promise<RPCEndpoint[]> {
    const endpoint = region 
      ? `/api/external-validators/rpc-integration/endpoints/${region}`
      : '/api/external-validators/rpc-integration/endpoints/global';
    
    const response = await this.request<any>('GET', endpoint);
    
    return (response.data?.endpoints || []).map((ep: any) => ({
      region: ep.region || region || 'global',
      endpoint: ep.rpcEndpoint,
      wsEndpoint: ep.wsEndpoint,
      tier: ep.tier,
      healthScore: ep.healthScore || 100,
      latencyMs: ep.latencyMs || 0
    }));
  }

  async getNetworkStats(): Promise<NetworkStats> {
    const response = await this.request<any>('GET', '/api/network/stats');
    
    return {
      chainId: response.data?.chainId || 5800,
      blockHeight: response.data?.blockHeight || 0,
      tps: response.data?.tps || 0,
      validators: {
        total: response.data?.validators?.total || 0,
        active: response.data?.validators?.active || 0,
        jailed: response.data?.validators?.jailed || 0
      },
      shards: response.data?.shards || 24,
      networkVersion: response.data?.networkVersion || '2.1.0'
    };
  }

  async isRPCAllowed(): Promise<boolean> {
    if (!this.validatorAddress) {
      return false;
    }
    
    const response = await this.request<any>(
      'GET',
      `/api/external-validators/rpc-integration/check/${this.validatorAddress}`
    );
    
    return response.data?.isAllowed === true;
  }

  async rotateApiKey(): Promise<{ newApiKey: string; expiresAt: Date }> {
    if (!this.apiKey) {
      throw new Error('Credentials not set. Call setCredentials() first.');
    }
    
    const response = await this.request<any>(
      'POST',
      '/api/external-validators/key/rotate',
      undefined,
      true
    );
    
    if (response.success && response.data?.apiKey) {
      this.apiKey = response.data.apiKey;
      this.config.apiKey = response.data.apiKey;
    }
    
    return {
      newApiKey: response.data?.apiKey,
      expiresAt: new Date(response.data?.expiresAt || Date.now() + 365 * 24 * 60 * 60 * 1000)
    };
  }

  getVersion(): string {
    return '2.1.0';
  }

  getChainId(): number {
    return 5800;
  }
}

export function createTBurnSDK(config: SDKConfig): TBurnValidatorSDK {
  return new TBurnValidatorSDK(config);
}

export default TBurnValidatorSDK;
