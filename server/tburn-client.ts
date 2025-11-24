import WebSocket from 'ws';
import { request } from 'undici';

export interface TBurnNodeConfig {
  rpcUrl: string;
  wsUrl: string;
  apiKey: string;
}

export interface BlockData {
  height: number;
  hash: string;
  timestamp: number;
  transactionCount: number;
  proposer: string;
  size: number;
  gasUsed: string;
  gasLimit: string;
}

export interface TransactionData {
  hash: string;
  blockHeight: number;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gasUsed: string;
  timestamp: number;
  status: 'success' | 'failed';
  nonce: number;
}

export interface NetworkStats {
  currentBlockHeight: number;
  totalTransactions: number;
  tps: number;
  peakTps: number;
  avgBlockTime: number;
  activeValidators: number;
  totalValidators: number;
  networkHashrate: string;
}

export interface ValidatorData {
  address: string;
  moniker: string;
  votingPower: string;
  commission: number;
  status: 'active' | 'inactive' | 'jailed';
  uptime: number;
  delegators: number;
  selfStake: string;
  totalStake: string;
  missedBlocks: number;
}

export class TBurnClient {
  private config: TBurnNodeConfig;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 5000;
  private eventHandlers: Map<string, Set<(data: any) => void>> = new Map();
  private sessionCookie: string | null = null;
  private isAuthenticated = false;
  private lastRequestTime = 0;
  private minRequestInterval = 2000; // Increased to 2 seconds to prevent rate limiting
  private requestRetries = 0;
  private maxRequestRetries = 3;
  private requestQueue: Promise<any> = Promise.resolve(); // Sequential request queue
  private rateLimitedUntil = 0; // Track when rate limiting expires
  private concurrentRequests = 0; // Track concurrent requests
  private maxConcurrentRequests = 1; // Limit to 1 concurrent request

  constructor(config: TBurnNodeConfig) {
    this.config = config;
  }

  async authenticate(): Promise<boolean> {
    if (this.isAuthenticated) {
      return true;
    }

    // Check if we're still rate limited before attempting authentication
    const now = Date.now();
    if (this.rateLimitedUntil > now) {
      const waitTime = this.rateLimitedUntil - now;
      console.log(`[TBURN Client] Delaying authentication due to rate limit, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    try {
      const { statusCode, headers, body } = await request(`${this.config.rpcUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          password: this.config.apiKey,
        }),
      });

      await body.text();

      if (statusCode === 429) {
        // Handle rate limiting during authentication
        const retryAfter = headers['retry-after'];
        const delay = retryAfter ? parseInt(retryAfter as string) * 1000 : 30000;
        console.log(`[TBURN Client] Authentication failed: 429`);
        this.rateLimitedUntil = Date.now() + delay;
        return false;
      }

      if (statusCode !== 200) {
        console.error('[TBURN Client] Authentication failed:', statusCode);
        return false;
      }

      const setCookieHeader = headers['set-cookie'];
      if (setCookieHeader) {
        if (Array.isArray(setCookieHeader)) {
          this.sessionCookie = setCookieHeader[0].split(';')[0];
        } else {
          this.sessionCookie = setCookieHeader.split(';')[0];
        }
        console.log('[TBURN Client] Session cookie captured:', this.sessionCookie.substring(0, 30) + '...');
      } else {
        console.log('[TBURN Client] Warning: No set-cookie header received');
      }

      this.isAuthenticated = true;
      console.log('[TBURN Client] Successfully authenticated');
      return true;
    } catch (error) {
      console.error('[TBURN Client] Authentication error:', error);
      return false;
    }
  }

  private async request<T>(endpoint: string, method = 'GET', body?: any, customHeaders?: Record<string, string>): Promise<T> {
    // Queue requests to prevent concurrent API calls
    return this.requestQueue = this.requestQueue.then(async () => {
      // Check if we're still rate limited
      const now = Date.now();
      if (this.rateLimitedUntil > now) {
        const waitTime = this.rateLimitedUntil - now;
        console.log(`[TBURN Client] Still rate limited, waiting ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      
      // Rate limiting to avoid 429 errors
      const timeSinceLastRequest = now - this.lastRequestTime;
      if (timeSinceLastRequest < this.minRequestInterval) {
        const delay = this.minRequestInterval - timeSinceLastRequest;
        console.log(`[TBURN Client] Rate limiting: waiting ${delay}ms before request`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      this.lastRequestTime = Date.now();
      
      return this._executeRequest<T>(endpoint, method, body, customHeaders);
    });
  }

  private async _executeRequest<T>(endpoint: string, method = 'GET', body?: any, customHeaders?: Record<string, string>): Promise<T> {
    
    if (!this.isAuthenticated) {
      await this.authenticate();
    }

    const url = `${this.config.rpcUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      ...customHeaders, // Merge custom headers
    };

    if (this.sessionCookie) {
      headers['cookie'] = this.sessionCookie;
      console.log(`[TBURN Client] Sending cookie: ${this.sessionCookie.substring(0, 30)}...`);
    }

    const options: any = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    console.log(`[TBURN Client] Requesting: ${method} ${url}`);
    
    try {
      const response = await request(url, options);
      console.log(`[TBURN Client] Response: ${response.statusCode}`);
      
      if (response.statusCode !== 200) {
        if (response.statusCode === 401) {
          console.log(`[TBURN Client] 401 Unauthorized for ${endpoint}, attempting re-authentication...`);
          this.isAuthenticated = false;
          this.sessionCookie = null;
          const reauth = await this.authenticate();
          if (!reauth) {
            throw new Error(`TBURN API Error: Re-authentication failed`);
          }
          return this.request<T>(endpoint, method, body);
        }
        
        // Handle rate limiting with exponential backoff
        if (response.statusCode === 429) {
          const retryAfterHeader = response.headers['retry-after'];
          const retryAfterValue = Array.isArray(retryAfterHeader) ? retryAfterHeader[0] : retryAfterHeader;
          const delay = retryAfterValue ? parseInt(retryAfterValue) * 1000 : 30000; // Increased to 30 seconds default
          console.log(`[TBURN Client] Rate limited (429), will retry after ${delay}ms...`);
          
          // Set rate limited until time to prevent other requests
          this.rateLimitedUntil = Date.now() + delay;
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return this._executeRequest<T>(endpoint, method, body, customHeaders);
        }
        
        // Handle server errors with limited retry
        if (response.statusCode >= 500 && response.statusCode < 600) {
          if (this.requestRetries < this.maxRequestRetries) {
            this.requestRetries++;
            const delay = Math.pow(2, this.requestRetries) * 1000; // Exponential backoff
            console.log(`[TBURN Client] Server error (${response.statusCode}), retrying in ${delay}ms (attempt ${this.requestRetries}/${this.maxRequestRetries})...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return this.request<T>(endpoint, method, body, customHeaders);
          }
          console.log(`[TBURN Client] Server error (${response.statusCode}) for ${endpoint}, max retries reached. Falling back to simulated data.`);
        }
        
        const errorText = await response.body.text();
        console.error(`[TBURN Client] API Error: ${response.statusCode}`, errorText);
        const error: any = new Error(`TBURN API Error: ${response.statusCode} - ${errorText}`);
        error.statusCode = response.statusCode;
        error.shouldFallback = response.statusCode >= 500 || response.statusCode === 429;
        throw error;
      }

      // Reset retry counter on success
      this.requestRetries = 0;
      
      // Enterprise-grade response validation
      const contentType = response.headers['content-type'] || '';
      const responseText = await response.body.text();
      
      // Detect HTML responses (endpoint not implemented or misconfigured)
      if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
        console.warn(`[TBURN Client] HTML response detected for ${endpoint} - endpoint may not be implemented`);
        const error: any = new Error(`TBURN API Error: Endpoint returned HTML instead of JSON - ${endpoint} may not be implemented on mainnet`);
        error.statusCode = response.statusCode;
        error.isHtmlResponse = true;
        error.endpoint = endpoint;
        throw error;
      }

      // Validate JSON content type
      if (!contentType.includes('application/json') && !contentType.includes('text/plain')) {
        console.warn(`[TBURN Client] Unexpected content-type: ${contentType} for ${endpoint}`);
      }

      // Parse and return JSON
      try {
        return JSON.parse(responseText) as T;
      } catch (parseError) {
        console.error(`[TBURN Client] JSON parse error for ${endpoint}:`, responseText.substring(0, 200));
        const error: any = new Error(`TBURN API Error: Invalid JSON response from ${endpoint}`);
        error.statusCode = response.statusCode;
        error.isParseError = true;
        error.responsePreview = responseText.substring(0, 200);
        throw error;
      }
    } catch (error: any) {
      console.error(`[TBURN Client] Request error for ${endpoint}:`, error.message);
      throw error;
    }
  }

  async getNetworkStats(): Promise<NetworkStats> {
    return this.request<NetworkStats>('/api/network/stats');
  }

  async getRecentBlocks(limit = 10): Promise<BlockData[]> {
    return this.request<BlockData[]>(`/api/blocks/recent?limit=${limit}`);
  }

  async getBlock(heightOrHash: number | string): Promise<BlockData> {
    return this.request<BlockData>(`/api/blocks/${heightOrHash}`);
  }

  async getRecentTransactions(limit = 20): Promise<TransactionData[]> {
    return this.request<TransactionData[]>(`/api/transactions/recent?limit=${limit}`);
  }

  async getTransaction(hash: string): Promise<TransactionData> {
    return this.request<TransactionData>(`/api/transactions/${hash}`);
  }

  async getValidators(): Promise<ValidatorData[]> {
    return this.request<ValidatorData[]>('/api/validators');
  }

  async getValidator(address: string): Promise<ValidatorData> {
    return this.request<ValidatorData>(`/api/validators/${address}`);
  }

  async getContracts(): Promise<any[]> {
    return this.request<any[]>('/api/contracts');
  }

  async getContract(address: string): Promise<any> {
    return this.request<any>(`/api/contracts/${address}`);
  }

  async getAIModels(): Promise<any[]> {
    return this.request<any[]>('/api/ai/models');
  }

  async getAIModel(name: string): Promise<any> {
    return this.request<any>(`/api/ai/models/${name}`);
  }

  async getAIDecisions(limit?: number): Promise<any[]> {
    const query = limit ? `?limit=${limit}` : '';
    return this.request<any[]>(`/api/ai/decisions${query}`);
  }

  async getRecentAIDecisions(limit?: number): Promise<any[]> {
    const query = limit ? `?limit=${limit}` : '';
    return this.request<any[]>(`/api/ai/decisions/recent${query}`);
  }

  async getAIDecision(id: string): Promise<any> {
    return this.request<any>(`/api/ai/decisions/${id}`);
  }

  async getShards(): Promise<any[]> {
    return this.request<any[]>('/api/shards');
  }

  async getCrossShardMessages(limit?: number): Promise<any[]> {
    const query = limit ? `?limit=${limit}` : '';
    return this.request<any[]>(`/api/cross-shard/messages${query}`);
  }

  async getCrossShardMessage(id: string): Promise<any> {
    return this.request<any>(`/api/cross-shard/messages/${id}`);
  }

  async getWalletBalances(limit?: number): Promise<any[]> {
    const query = limit ? `?limit=${limit}` : '';
    return this.request<any[]>(`/api/wallets${query}`);
  }

  async getWalletBalance(address: string): Promise<any> {
    return this.request<any>(`/api/wallets/${address}`);
  }

  async getConsensusRounds(limit?: number): Promise<any[]> {
    const query = limit ? `?limit=${limit}` : '';
    return this.request<any[]>(`/api/consensus/rounds${query}`);
  }

  async getConsensusRound(blockHeight: number): Promise<any> {
    return this.request<any>(`/api/consensus/rounds/${blockHeight}`);
  }

  async getConsensusState(): Promise<any> {
    return this.request<any>('/api/consensus/current');
  }

  async getShard(id: number): Promise<any> {
    return this.request<any>(`/api/shards/${id}`);
  }

  connectWebSocket(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      console.log('[TBURN WS] Already connected or connecting');
      return;
    }

    const wsUrl = this.config.wsUrl;
    const headers: any = {};
    
    if (this.sessionCookie) {
      headers.Cookie = this.sessionCookie;
    }

    console.log(`[TBURN WS] Connecting to ${wsUrl}...`);
    this.ws = new WebSocket(wsUrl, { headers });

    this.ws.on('open', () => {
      console.log('[TBURN WS] Connected successfully');
      this.reconnectAttempts = 0;
      
      this.ws?.send(JSON.stringify({
        type: 'subscribe',
        channels: ['blocks', 'transactions', 'network']
      }));
    });

    this.ws.on('message', (data: WebSocket.Data) => {
      try {
        const message = JSON.parse(data.toString());
        const handlers = this.eventHandlers.get(message.type);
        if (handlers) {
          handlers.forEach(handler => handler(message.data));
        }
      } catch (error) {
        console.error('[TBURN WS] Failed to parse message:', error);
      }
    });

    this.ws.on('error', (error) => {
      console.error('[TBURN WS] Error:', error.message);
    });

    this.ws.on('close', () => {
      console.log('[TBURN WS] Connection closed');
      this.ws = null;
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`[TBURN WS] Reconnecting in ${this.reconnectDelay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        setTimeout(() => this.connectWebSocket(), this.reconnectDelay);
      } else {
        console.error('[TBURN WS] Max reconnection attempts reached');
      }
    });
  }

  on(event: string, handler: (data: any) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  off(event: string, handler: (data: any) => void): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.reconnectAttempts = this.maxReconnectAttempts;
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  // Admin Control Methods
  async restartMainnet(adminPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('[TBURN Client] Attempting mainnet restart with admin credentials');
      const headers: Record<string, string> = {};
      
      if (adminPassword) {
        headers['X-Admin-Password'] = adminPassword;
      }
      
      const response = await this.request<{ success: boolean; message: string }>(
        '/api/admin/restart',
        'POST',
        {},
        headers
      );
      return response;
    } catch (error: any) {
      console.error('[TBURN Client] Restart mainnet error:', error);
      return {
        success: false,
        message: error.message || 'Failed to restart mainnet',
      };
    }
  }

  async checkMainnetHealth(adminPassword: string): Promise<{ healthy: boolean; details: any }> {
    try {
      console.log('[TBURN Client] Performing mainnet health check with admin credentials');
      const headers: Record<string, string> = {};
      
      if (adminPassword) {
        headers['X-Admin-Password'] = adminPassword;
      }
      
      const response = await this.request<{ healthy: boolean; details: any }>(
        '/api/admin/health',
        'GET',
        undefined,
        headers
      );
      return response;
    } catch (error: any) {
      console.error('[TBURN Client] Health check error:', error);
      return {
        healthy: false,
        details: { error: error.message || 'Health check failed' },
      };
    }
  }
}

let tburnClient: TBurnClient | null = null;

export function getTBurnClient(): TBurnClient {
  if (!tburnClient) {
    const config: TBurnNodeConfig = {
      rpcUrl: process.env.TBURN_NODE_URL || 'http://localhost:3000',
      wsUrl: process.env.TBURN_WS_URL || 'ws://localhost:3000/ws',
      apiKey: process.env.TBURN_API_KEY || '',
    };
    
    tburnClient = new TBurnClient(config);
    
    // Check both NODE_MODE and NODE_ENV for production detection
    if (process.env.NODE_MODE === 'production' || process.env.NODE_ENV === 'production') {
      console.log('[TBURN Client] Initializing TBURN mainnet connection...');
      tburnClient.authenticate().then((success) => {
        if (success) {
          console.log('[TBURN Client] Connected to TBURN mainnet successfully');
          tburnClient?.connectWebSocket();
        } else {
          console.error('[TBURN Client] Failed to connect to TBURN mainnet');
        }
      }).catch((error) => {
        console.error('[TBURN Client] Connection error:', error);
      });
    }
  }
  
  return tburnClient;
}

export function isProductionMode(): boolean {
  // Check both NODE_MODE (our custom env var) and NODE_ENV (standard env var)
  return process.env.NODE_MODE === 'production' || process.env.NODE_ENV === 'production';
}
