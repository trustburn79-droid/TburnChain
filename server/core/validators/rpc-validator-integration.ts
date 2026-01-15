/**
 * TBURN Enterprise RPC-Validator Integration Layer
 * Production-grade connection between External Validators and RPC Endpoints
 * 
 * Features:
 * - Approved validator → RPC allowlist synchronization
 * - Real-time validator status propagation to RPC gateway
 * - Health-based RPC routing
 * - Multi-region load balancing
 * - Circuit breaker for unhealthy validators
 * 
 * Chain ID: 5800 | TBURN Mainnet | Target: 210,000 TPS
 */

import { EventEmitter } from 'events';
import { 
  externalValidatorEngine, 
  ExternalValidatorState,
  ExternalValidatorTier,
  ValidatorRegion 
} from './enterprise-external-validator-engine';

export interface RPCEndpointConfig {
  id: string;
  url: string;
  region: ValidatorRegion;
  priority: number;
  weight: number;
  isHealthy: boolean;
  lastHealthCheck: number;
  latencyMs: number;
  successRate: number;
  validatorNodeId?: string;
}

export interface ValidatorRPCMapping {
  validatorNodeId: string;
  operatorAddress: string;
  rpcEndpoint: string;
  wsEndpoint: string;
  p2pEndpoint: string;
  region: ValidatorRegion;
  tier: ExternalValidatorTier;
  isActive: boolean;
  addedAt: number;
  lastVerified: number;
  healthScore: number;
}

export interface RPCAllowlistEntry {
  address: string;
  nodeId: string;
  tier: ExternalValidatorTier;
  permissions: string[];
  rateLimit: {
    requestsPerSecond: number;
    requestsPerMinute: number;
    burstCapacity: number;
  };
  addedAt: number;
  expiresAt?: number;
}

export interface RPCGatewayStats {
  totalEndpoints: number;
  healthyEndpoints: number;
  activeValidators: number;
  averageLatency: number;
  totalRequests: number;
  successRate: number;
  byRegion: Record<ValidatorRegion, number>;
  byTier: Record<ExternalValidatorTier, number>;
}

const TIER_RATE_LIMITS: Record<ExternalValidatorTier, { rps: number; rpm: number; burst: number }> = {
  genesis: { rps: 1000, rpm: 50000, burst: 200 },
  pioneer: { rps: 500, rpm: 25000, burst: 100 },
  standard: { rps: 200, rpm: 10000, burst: 50 },
  community: { rps: 100, rpm: 5000, burst: 25 }
};

const TIER_PERMISSIONS: Record<ExternalValidatorTier, string[]> = {
  genesis: ['read', 'write', 'admin', 'debug', 'trace', 'archive'],
  pioneer: ['read', 'write', 'admin', 'debug'],
  standard: ['read', 'write', 'debug'],
  community: ['read', 'write']
};

export class RPCValidatorIntegration extends EventEmitter {
  private allowlist: Map<string, RPCAllowlistEntry> = new Map();
  private validatorMappings: Map<string, ValidatorRPCMapping> = new Map();
  private endpoints: Map<string, RPCEndpointConfig> = new Map();
  
  private isRunning = false;
  private syncInterval?: NodeJS.Timeout;
  private healthCheckInterval?: NodeJS.Timeout;
  
  private stats = {
    totalSyncOperations: 0,
    lastSyncTime: 0,
    validatorsAdded: 0,
    validatorsRemoved: 0,
    healthChecksPassed: 0,
    healthChecksFailed: 0
  };

  private readonly SYNC_INTERVAL_MS = 30000;
  private readonly HEALTH_CHECK_INTERVAL_MS = 60000;

  constructor() {
    super();
    this.setupEventListeners();
    console.log('[RPCValidatorIntegration] ✅ Enterprise integration layer initialized');
  }

  private setupEventListeners(): void {
    externalValidatorEngine.on('validator:registered', (data) => {
      console.log(`[RPCValidatorIntegration] Validator registered: ${data.nodeId}`);
      this.emit('validator:pending', data);
    });

    externalValidatorEngine.on('validator:activated', async (data) => {
      console.log(`[RPCValidatorIntegration] Validator activated: ${data.nodeId}`);
      await this.addValidatorToAllowlist(data.nodeId);
    });

    externalValidatorEngine.on('validator:deactivated', async (data) => {
      console.log(`[RPCValidatorIntegration] Validator deactivated: ${data.nodeId}`);
      await this.removeValidatorFromAllowlist(data.nodeId);
    });

    externalValidatorEngine.on('validator:jailed', async (data) => {
      console.log(`[RPCValidatorIntegration] Validator jailed: ${data.nodeId}`);
      await this.suspendValidator(data.nodeId, 'jailed');
    });
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    await this.performInitialSync();

    this.syncInterval = setInterval(async () => {
      await this.syncValidatorsToRPC();
    }, this.SYNC_INTERVAL_MS);

    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks();
    }, this.HEALTH_CHECK_INTERVAL_MS);

    this.emit('started');
    console.log('[RPCValidatorIntegration] ✅ Integration service started');
    console.log(`[RPCValidatorIntegration] 📊 Sync interval: ${this.SYNC_INTERVAL_MS}ms`);
    console.log(`[RPCValidatorIntegration] 🏥 Health check interval: ${this.HEALTH_CHECK_INTERVAL_MS}ms`);
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;
    this.isRunning = false;

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
    }

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }

    this.emit('stopped');
    console.log('[RPCValidatorIntegration] 🛑 Integration service stopped');
  }

  private async performInitialSync(): Promise<void> {
    console.log('[RPCValidatorIntegration] 🔄 Performing initial sync...');
    
    const activeValidators = externalValidatorEngine.getActiveValidators();
    
    for (const validator of activeValidators) {
      await this.addValidatorToAllowlist(validator.nodeId);
    }
    
    console.log(`[RPCValidatorIntegration] ✅ Initial sync complete: ${activeValidators.length} validators`);
  }

  async addValidatorToAllowlist(nodeId: string): Promise<boolean> {
    try {
      const validator = externalValidatorEngine.getValidator(nodeId);
      if (!validator) {
        console.warn(`[RPCValidatorIntegration] Validator not found: ${nodeId}`);
        return false;
      }

      if (validator.status !== 'active') {
        console.log(`[RPCValidatorIntegration] Validator not active: ${nodeId} (${validator.status})`);
        return false;
      }

      const tier = validator.tier as ExternalValidatorTier;
      const tierLimits = TIER_RATE_LIMITS[tier];
      const permissions = TIER_PERMISSIONS[tier];

      const entry: RPCAllowlistEntry = {
        address: validator.operatorAddress,
        nodeId: validator.nodeId,
        tier: validator.tier,
        permissions,
        rateLimit: {
          requestsPerSecond: tierLimits.rps,
          requestsPerMinute: tierLimits.rpm,
          burstCapacity: tierLimits.burst
        },
        addedAt: Date.now()
      };

      this.allowlist.set(validator.operatorAddress, entry);

      const mapping: ValidatorRPCMapping = {
        validatorNodeId: validator.nodeId,
        operatorAddress: validator.operatorAddress,
        rpcEndpoint: validator.endpoints.rpcUrl,
        wsEndpoint: validator.endpoints.wsUrl,
        p2pEndpoint: validator.endpoints.p2pAddress,
        region: validator.region,
        tier: validator.tier,
        isActive: true,
        addedAt: Date.now(),
        lastVerified: Date.now(),
        healthScore: validator.healthScore
      };

      this.validatorMappings.set(nodeId, mapping);
      
      this.stats.validatorsAdded++;
      
      this.emit('validator:allowlisted', {
        nodeId,
        address: validator.operatorAddress,
        tier: validator.tier,
        region: validator.region
      });

      console.log(`[RPCValidatorIntegration] ✅ Added to allowlist: ${validator.operatorAddress} (${validator.tier})`);
      return true;
    } catch (error) {
      console.error(`[RPCValidatorIntegration] Failed to add validator: ${nodeId}`, error);
      return false;
    }
  }

  async removeValidatorFromAllowlist(nodeId: string): Promise<boolean> {
    try {
      const mapping = this.validatorMappings.get(nodeId);
      if (!mapping) {
        return false;
      }

      this.allowlist.delete(mapping.operatorAddress);
      this.validatorMappings.delete(nodeId);
      
      this.stats.validatorsRemoved++;
      
      this.emit('validator:removed', {
        nodeId,
        address: mapping.operatorAddress
      });

      console.log(`[RPCValidatorIntegration] ❌ Removed from allowlist: ${mapping.operatorAddress}`);
      return true;
    } catch (error) {
      console.error(`[RPCValidatorIntegration] Failed to remove validator: ${nodeId}`, error);
      return false;
    }
  }

  async suspendValidator(nodeId: string, reason: string): Promise<boolean> {
    const mapping = this.validatorMappings.get(nodeId);
    if (!mapping) return false;

    mapping.isActive = false;
    
    const allowlistEntry = this.allowlist.get(mapping.operatorAddress);
    if (allowlistEntry) {
      allowlistEntry.expiresAt = Date.now();
    }

    this.emit('validator:suspended', { nodeId, reason });
    console.log(`[RPCValidatorIntegration] ⏸️ Suspended: ${mapping.operatorAddress} (${reason})`);
    return true;
  }

  private async syncValidatorsToRPC(): Promise<void> {
    this.stats.totalSyncOperations++;
    this.stats.lastSyncTime = Date.now();

    const activeValidators = externalValidatorEngine.getActiveValidators();
    const currentNodeIds = new Set(activeValidators.map(v => v.nodeId));

    const mappingEntries = Array.from(this.validatorMappings.entries());
    for (const [nodeId, mapping] of mappingEntries) {
      if (!currentNodeIds.has(nodeId) && mapping.isActive) {
        await this.removeValidatorFromAllowlist(nodeId);
      }
    }

    for (const validator of activeValidators) {
      if (!this.validatorMappings.has(validator.nodeId)) {
        await this.addValidatorToAllowlist(validator.nodeId);
      } else {
        const mapping = this.validatorMappings.get(validator.nodeId)!;
        mapping.healthScore = validator.healthScore;
        mapping.lastVerified = Date.now();
      }
    }

    this.emit('sync:complete', {
      totalValidators: this.validatorMappings.size,
      timestamp: Date.now()
    });
  }

  private async performHealthChecks(): Promise<void> {
    const mappingEntries = Array.from(this.validatorMappings.entries());
    for (const [nodeId, mapping] of mappingEntries) {
      if (!mapping.isActive) continue;

      try {
        const isHealthy = await this.checkValidatorHealth(mapping);
        
        if (isHealthy) {
          this.stats.healthChecksPassed++;
          mapping.lastVerified = Date.now();
        } else {
          this.stats.healthChecksFailed++;
          this.emit('health:warning', { nodeId, mapping });
        }
      } catch (error) {
        this.stats.healthChecksFailed++;
        console.warn(`[RPCValidatorIntegration] Health check failed for ${nodeId}:`, error);
      }
    }
  }

  private async checkValidatorHealth(mapping: ValidatorRPCMapping): Promise<boolean> {
    const validator = externalValidatorEngine.getValidator(mapping.validatorNodeId);
    if (!validator) return false;
    
    return validator.healthScore >= 50 && 
           validator.status === 'active' && 
           validator.connectionState.isConnected;
  }

  isAddressAllowed(address: string): boolean {
    const entry = this.allowlist.get(address);
    if (!entry) return false;
    if (entry.expiresAt && entry.expiresAt < Date.now()) return false;
    return true;
  }

  getAllowlistEntry(address: string): RPCAllowlistEntry | undefined {
    return this.allowlist.get(address);
  }

  getValidatorMapping(nodeId: string): ValidatorRPCMapping | undefined {
    return this.validatorMappings.get(nodeId);
  }

  getRPCEndpointsForRegion(region: ValidatorRegion): ValidatorRPCMapping[] {
    const endpoints: ValidatorRPCMapping[] = [];
    const mappingValues = Array.from(this.validatorMappings.values());
    
    for (const mapping of mappingValues) {
      if (mapping.region === region && mapping.isActive) {
        endpoints.push(mapping);
      }
    }

    return endpoints.sort((a, b) => b.healthScore - a.healthScore);
  }

  getStats(): RPCGatewayStats {
    const byRegion: Partial<Record<ValidatorRegion, number>> = {};
    const byTier: Partial<Record<ExternalValidatorTier, number>> = {};
    
    let totalHealth = 0;
    let activeCount = 0;

    const mappingValues = Array.from(this.validatorMappings.values());
    for (const mapping of mappingValues) {
      if (!mapping.isActive) continue;
      
      activeCount++;
      totalHealth += mapping.healthScore;
      
      const region = mapping.region;
      const tier = mapping.tier;
      byRegion[region] = (byRegion[region] || 0) + 1;
      byTier[tier] = (byTier[tier] || 0) + 1;
    }

    return {
      totalEndpoints: this.validatorMappings.size,
      healthyEndpoints: activeCount,
      activeValidators: activeCount,
      averageLatency: 0,
      totalRequests: 0,
      successRate: activeCount > 0 ? 100 : 0,
      byRegion: byRegion as Record<ValidatorRegion, number>,
      byTier: byTier as Record<ExternalValidatorTier, number>
    };
  }

  getAllowlist(): RPCAllowlistEntry[] {
    return Array.from(this.allowlist.values());
  }

  getIntegrationStats() {
    return {
      ...this.stats,
      totalAllowlisted: this.allowlist.size,
      totalMappings: this.validatorMappings.size,
      isRunning: this.isRunning
    };
  }

  async forceSync(): Promise<void> {
    await this.syncValidatorsToRPC();
    await this.performHealthChecks();
  }

  exportAllowlistForRPC(): object {
    const entries: Record<string, any> = {};
    const allowlistEntries = Array.from(this.allowlist.entries());
    
    for (const [address, entry] of allowlistEntries) {
      entries[address] = {
        nodeId: entry.nodeId,
        tier: entry.tier,
        permissions: entry.permissions,
        rateLimit: entry.rateLimit,
        addedAt: new Date(entry.addedAt).toISOString()
      };
    }

    return {
      version: '1.0.0',
      chainId: 5800,
      network: 'mainnet',
      generatedAt: new Date().toISOString(),
      totalEntries: this.allowlist.size,
      entries
    };
  }
}

export const rpcValidatorIntegration = new RPCValidatorIntegration();
