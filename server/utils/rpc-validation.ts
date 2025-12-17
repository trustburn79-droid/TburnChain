/**
 * RPC Response Validation Utilities
 * Prevents schema drift between Enterprise Node and frontend expectations
 * 
 * PROBLEM SOLVED: 
 * - Prevents 404 errors from missing endpoints
 * - Prevents schema type mismatches (e.g., avgBlockTime: float vs integer)
 * - Provides runtime validation logging for early detection
 * 
 * USAGE:
 * 1. Use createValidatedHandler() for handlers with schema validation
 * 2. Use registerRoute() to register and track endpoints
 * 3. Call verifyRequiredEndpoints() at startup to catch missing routes
 */

import { z } from 'zod';
import { Request, Response, NextFunction, Express, Router } from 'express';

// ============================================
// ENDPOINT REGISTRY SYSTEM
// Tracks all registered RPC endpoints to prevent 404s
// ============================================

interface EndpointDefinition {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  responseSchema?: z.ZodSchema;
  requestSchema?: z.ZodSchema;
  registeredAt: Date;
  lastAccessed?: Date;
  accessCount: number;
}

class EndpointRegistry {
  private endpoints: Map<string, EndpointDefinition> = new Map();
  private missingEndpointLogs: Array<{ path: string; method: string; timestamp: Date; count: number }> = [];

  getKey(method: string, path: string): string {
    return `${method.toUpperCase()}:${path}`;
  }

  register(definition: Omit<EndpointDefinition, 'registeredAt' | 'accessCount'>): void {
    const key = this.getKey(definition.method, definition.path);
    this.endpoints.set(key, {
      ...definition,
      registeredAt: new Date(),
      accessCount: 0
    });
    console.log(`[Endpoint Registry] Registered: ${definition.method} ${definition.path}`);
  }

  recordAccess(method: string, path: string): void {
    const key = this.getKey(method, path);
    const endpoint = this.endpoints.get(key);
    if (endpoint) {
      endpoint.lastAccessed = new Date();
      endpoint.accessCount++;
    }
  }

  isRegistered(method: string, path: string): boolean {
    return this.endpoints.has(this.getKey(method, path));
  }

  recordMissingEndpoint(method: string, path: string): void {
    const existing = this.missingEndpointLogs.find(
      log => log.path === path && log.method === method
    );
    if (existing) {
      existing.count++;
      existing.timestamp = new Date();
    } else {
      this.missingEndpointLogs.push({
        path,
        method,
        timestamp: new Date(),
        count: 1
      });
    }
    console.error(`[Endpoint Registry] ⚠️ Missing endpoint accessed: ${method} ${path}`);
  }

  getMissingEndpointReport(): Array<{ path: string; method: string; timestamp: Date; count: number }> {
    return [...this.missingEndpointLogs].sort((a, b) => b.count - a.count);
  }

  getRegisteredEndpoints(): EndpointDefinition[] {
    return Array.from(this.endpoints.values());
  }

  getEndpointStats(): { 
    total: number; 
    byMethod: Record<string, number>; 
    missingAttempts: number;
  } {
    const byMethod: Record<string, number> = {};
    const endpointValues = Array.from(this.endpoints.values());
    for (const endpoint of endpointValues) {
      byMethod[endpoint.method] = (byMethod[endpoint.method] || 0) + 1;
    }
    return {
      total: this.endpoints.size,
      byMethod,
      missingAttempts: this.missingEndpointLogs.reduce((sum, log) => sum + log.count, 0)
    };
  }
}

export const endpointRegistry = new EndpointRegistry();

// ============================================
// RESPONSE SCHEMAS (Shared Contract)
// Single source of truth for RPC response types
// ============================================

// Shard snapshot schema matching generateShards() output
export const ShardSnapshotSchema = z.object({
  id: z.string(), // "1", "2" etc - string format
  shardId: z.number().int(),
  name: z.string(),
  status: z.enum(['active', 'inactive', 'syncing', 'error']),
  blockHeight: z.number().int(),
  transactionCount: z.number().int(),
  validatorCount: z.number().int(),
  tps: z.number().int(),
  load: z.number().int(),
  peakTps: z.number().int(),
  avgBlockTime: z.number().int(), // CRITICAL: Must be integer (milliseconds)
  crossShardTxCount: z.number().int(),
  stateSize: z.string(), // CRITICAL: Must be string format (e.g., "150GB")
  lastSyncedAt: z.string(),
  mlOptimizationScore: z.number().int(),
  predictedLoad: z.number().int(),
  rebalanceCount: z.number().int(),
  aiRecommendation: z.enum(['stable', 'monitor', 'optimize']),
  profilingScore: z.number().int(),
  capacityUtilization: z.number().int()
});

// Recent block schema matching /api/blocks/recent output
export const RecentBlockSchema = z.object({
  id: z.string(),
  blockNumber: z.number().int(),
  blockHash: z.string(),
  parentHash: z.string(),
  timestamp: z.number().int(),
  validatorAddress: z.string(),
  transactionCount: z.number().int(),
  gasUsed: z.string(),
  gasLimit: z.string(),
  size: z.number().int(),
  shardId: z.number().int(),
  hashAlgorithm: z.string(),
  consensusDuration: z.number().int(),
  rewards: z.string(),
  createdAt: z.string()
});

export const NetworkStatsSchema = z.object({
  tps: z.number(),
  totalTransactions: z.number(),
  activeValidators: z.number().int(),
  currentBlock: z.number().int(),
  pendingTransactions: z.number().int(),
  gasPrice: z.string(),
  networkLoad: z.number()
});

export const NodeHealthSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy', 'unknown']),
  uptime: z.number(),
  memoryUsage: z.number(),
  cpuUsage: z.number(),
  diskUsage: z.number(),
  peerCount: z.number().int(),
  isSyncing: z.boolean(),
  syncProgress: z.number(),
  lastBlockTime: z.number().int()
});

export const CrossShardMessageSchema = z.object({
  id: z.string(),
  fromShard: z.number().int(),
  toShard: z.number().int(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  timestamp: z.number().int(),
  type: z.string(),
  payload: z.any().optional()
});

// ============================================
// ADDITIONAL PRODUCTION ENDPOINT SCHEMAS
// ============================================

// Health Check - /health
export const HealthCheckSchema = z.object({
  status: z.string(),
  node: z.string()
});

// Full Network Stats - /api/network/stats
export const NetworkStatsFullSchema = z.object({
  id: z.string(),
  currentBlockHeight: z.number().int(),
  tps: z.number().int(),
  peakTps: z.number().int(),
  avgBlockTime: z.number().int(),
  blockTimeP99: z.number().int(),
  slaUptime: z.number().int(),
  latency: z.number().int(),
  latencyP99: z.number().int(),
  activeValidators: z.number().int(),
  totalValidators: z.number().int(),
  totalTransactions: z.number().int(),
  totalAccounts: z.number().int(),
  shardCount: z.number().int(),
  tpsPerShard: z.number().int(),
  validatorsPerShard: z.number().int(),
  tokenPrice: z.union([z.number(), z.string().transform(v => parseFloat(v) || 0)]),
  priceChangePercent: z.union([z.number(), z.string().transform(v => parseFloat(v) || 0)]),
  marketCap: z.union([z.number(), z.string().transform(v => parseFloat(v) || 0)]),
  circulatingSupply: z.string(),
  totalSupply: z.string(),
  stakedAmount: z.string(),
  burnedTokens: z.string(),
  successRate: z.number().int(),
  updatedAt: z.string(),
  gasBalanceEmb: z.number().int(),
  trendAnalysisScore: z.number().int(),
  anomalyDetectionScore: z.number().int(),
  patternMatchingScore: z.number().int(),
  timeseriesScore: z.number().int(),
  healingEventsCount: z.number().int(),
  anomaliesDetected: z.number().int()
});

// Full Cross-shard Message - /api/cross-shard/messages
export const CrossShardMessageFullSchema = z.object({
  id: z.string(),
  messageId: z.string(),
  fromShard: z.number().int(),
  toShard: z.number().int(),
  type: z.string(),
  status: z.enum(['pending', 'processing', 'completed', 'confirmed', 'failed']),
  timestamp: z.number().int(),
  payload: z.any().optional()
});

// AI Model - /api/ai/models
export const AIModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  band: z.string(),
  status: z.enum(['active', 'inactive', 'standby']),
  provider: z.string(),
  requestCount: z.number().int(),
  successCount: z.number().int(),
  failureCount: z.number().int(),
  avgResponseTime: z.number().int(),
  totalCost: z.string(),
  lastUsed: z.string(),
  cacheHitRate: z.number().int(),
  accuracy: z.number().int(),
  uptime: z.number().int(),
  feedbackLearningScore: z.number().int(),
  crossBandInteractions: z.number().int(),
  strategicDecisions: z.number().int(),
  tacticalDecisions: z.number().int(),
  operationalDecisions: z.number().int(),
  modelWeight: z.number().int(),
  consensusContribution: z.number().int()
});

// AI Decision - /api/ai/decisions
export const AIDecisionSchema = z.object({
  id: z.string(),
  band: z.string(),
  modelName: z.string(),
  decision: z.string(),
  impact: z.string(),
  category: z.string(),
  shardId: z.number().int(),
  validatorAddress: z.string(),
  status: z.string(),
  metadata: z.object({
    confidence: z.number().int(),
    responseTimeMs: z.number().int(),
    blockHeight: z.number().int(),
    gasUsed: z.number().int(),
    feedbackScore: z.number().int()
  }),
  createdAt: z.string(),
  executedAt: z.string()
});

// Wallet - /api/wallets
export const WalletSchema = z.object({
  address: z.string(),
  balance: z.string(),
  balanceEmb: z.string().optional(),
  type: z.string(),
  label: z.string().optional(),
  tags: z.array(z.string()).optional(),
  transactionCount: z.number().int(),
  lastActivity: z.string(),
  createdAt: z.string()
});

// Contract - /api/contracts
export const ContractSchema = z.object({
  id: z.string(),
  address: z.string(),
  name: z.string(),
  type: z.string(),
  creator: z.string(),
  deployedAt: z.string(),
  transactionCount: z.number().int(),
  balance: z.string(),
  verified: z.boolean(),
  verificationStatus: z.string(),
  lastActivity: z.string(),
  gasUsed: z.string(),
  bytecode: z.string(),
  abi: z.any().nullable(),
  sourceCode: z.any().nullable()
});

// Transaction - /api/transactions/:hash
export const TransactionSchema = z.object({
  id: z.string(),
  hash: z.string(),
  blockNumber: z.number().int(),
  blockHash: z.string(),
  timestamp: z.number().int(),
  fromAddress: z.string(),
  toAddress: z.string(),
  value: z.string(),
  gasPrice: z.string(),
  gasLimit: z.string(),
  gasUsed: z.string(),
  inputData: z.string(),
  status: z.enum(['pending', 'confirmed', 'failed']),
  type: z.string(),
  shardId: z.number().int(),
  nonce: z.number().int(),
  signatureType: z.string(),
  fee: z.string(),
  createdAt: z.string()
});

// Performance Metrics - /api/performance
export const PerformanceMetricsSchema = z.object({
  timestamp: z.number().int(),
  networkUptime: z.number(),
  transactionSuccessRate: z.number(),
  averageBlockTime: z.number(),
  peakTps: z.number().int(),
  currentTps: z.number().int(),
  blockProductionRate: z.number().int(),
  totalTransactions: z.number().int(),
  totalBlocks: z.number().int(),
  validatorParticipation: z.number(),
  consensusLatency: z.number().int(),
  resourceUtilization: z.object({
    cpu: z.number(),
    memory: z.number(),
    disk: z.number(),
    network: z.number()
  }),
  shardPerformance: z.object({
    totalShards: z.number().int(),
    activeShards: z.number().int(),
    averageTpsPerShard: z.number().int(),
    crossShardLatency: z.number().int()
  })
});

// Consensus Round - /api/consensus/rounds
export const ConsensusRoundSchema = z.object({
  id: z.string(),
  blockHeight: z.number().int(),
  roundNumber: z.number().int(),
  proposerAddress: z.string(),
  startTime: z.number().int(),
  endTime: z.number().int().nullable(),
  phasesJson: z.string(),
  finalHash: z.string().nullable(),
  aiParticipation: z.array(z.object({
    modelName: z.string(),
    confidence: z.number(),
    role: z.string(),
    status: z.string().optional()
  })),
  participationRate: z.number(),
  createdAt: z.string()
});

// Full Node Health - /api/node/health
export const NodeHealthFullSchema = z.object({
  status: z.string(),
  timestamp: z.number().int(),
  blockHeight: z.number().int(),
  uptime: z.number().int(),
  syncStatus: z.object({
    synced: z.boolean(),
    currentBlock: z.number().int(),
    highestBlock: z.number().int(),
    progress: z.number()
  }),
  systemMetrics: z.object({
    cpuUsage: z.number(),
    memoryUsage: z.number(),
    diskUsage: z.number(),
    networkLatency: z.number().int()
  }),
  selfHealing: z.object({
    trendAnalysis: z.number(),
    anomalyDetection: z.number(),
    patternMatching: z.number(),
    timeseries: z.number()
  }),
  predictions: z.object({
    nextIssue: z.number().int(),
    issueType: z.string(),
    confidence: z.number()
  })
});

// ============================================
// VALIDATION LOGGER
// Tracks validation failures for monitoring
// ============================================

interface ValidationError {
  endpoint: string;
  method: string;
  timestamp: Date;
  errors: z.ZodError['issues'];
  responseData?: unknown;
}

class ValidationLogger {
  private errors: ValidationError[] = [];
  private maxErrors = 1000; // Keep last N errors

  logError(error: ValidationError): void {
    this.errors.push(error);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }
    
    console.error(`[RPC Validation] ❌ Schema validation failed for ${error.method} ${error.endpoint} (${error.errors.length} issues)`);
  }

  getRecentErrors(limit = 50): ValidationError[] {
    return this.errors.slice(-limit);
  }

  getErrorStats(): { 
    total: number; 
    byEndpoint: Record<string, number>; 
    last24h: number;
  } {
    const byEndpoint: Record<string, number> = {};
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    let last24h = 0;

    for (const error of this.errors) {
      byEndpoint[error.endpoint] = (byEndpoint[error.endpoint] || 0) + 1;
      if (error.timestamp > oneDayAgo) {
        last24h++;
      }
    }

    return {
      total: this.errors.length,
      byEndpoint,
      last24h
    };
  }

  clearErrors(): void {
    this.errors = [];
  }
}

export const validationLogger = new ValidationLogger();

// ============================================
// VALIDATION WRAPPER HELPER
// Wraps RPC handlers with automatic validation
// ============================================

type AsyncHandler = (req: Request, res: Response, next?: NextFunction) => Promise<void> | void;

interface WithValidationOptions<T> {
  responseSchema: z.ZodSchema<T>;
  requestSchema?: z.ZodSchema;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description?: string;
}

// Custom error class for 404 responses
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export function withValidation<T>(
  options: WithValidationOptions<T>,
  handler: (req: Request) => Promise<T> | T
): AsyncHandler {
  // Register the endpoint
  endpointRegistry.register({
    path: options.endpoint,
    method: options.method,
    description: options.description || 'RPC Endpoint',
    responseSchema: options.responseSchema,
    requestSchema: options.requestSchema
  });

  return async (req: Request, res: Response): Promise<void> => {
    try {
      // Record access
      endpointRegistry.recordAccess(options.method, options.endpoint);

      // Validate request body if schema provided
      if (options.requestSchema && options.method !== 'GET') {
        const requestValidation = options.requestSchema.safeParse(req.body);
        if (!requestValidation.success) {
          validationLogger.logError({
            endpoint: options.endpoint,
            method: options.method,
            timestamp: new Date(),
            errors: requestValidation.error.issues,
            responseData: req.body
          });
          res.status(400).json({
            error: 'Request validation failed',
            issues: requestValidation.error.issues
          });
          return;
        }
      }

      // Execute handler
      const result = await handler(req);

      // Validate response
      const validation = options.responseSchema.safeParse(result);
      if (!validation.success) {
        validationLogger.logError({
          endpoint: options.endpoint,
          method: options.method,
          timestamp: new Date(),
          errors: validation.error.issues,
          responseData: result
        });
        
        // Log once without full error details to prevent memory issues
        console.warn(`[RPC Validation] ⚠️ Response schema mismatch for ${options.method} ${options.endpoint} (${validation.error.issues.length} issues)`);
      }

      res.json(result);
    } catch (error) {
      // Handle 404 errors specifically
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
        return;
      }
      
      console.error(`[RPC Handler] Error in ${options.method} ${options.endpoint}:`, error);
      res.status(500).json({ 
        error: 'Internal server error',
        endpoint: options.endpoint
      });
    }
  };
}

// ============================================
// VALIDATION HELPERS
// Type-safe data transformers
// ============================================

export function ensureInteger(value: number | string | undefined, defaultValue: number): number {
  if (value === undefined) return defaultValue;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return defaultValue;
  return Math.round(num);
}

export function ensureString(value: unknown, defaultValue: string): string {
  if (value === undefined || value === null) return defaultValue;
  return String(value);
}

export function formatStateSize(sizeInGB: number): string {
  return `${sizeInGB}GB`;
}

export function formatBlockTime(timeInMs: number): number {
  return Math.round(timeInMs); // Always return integer milliseconds
}

// ============================================
// REQUIRED ENDPOINTS CHECKER
// Ensures critical endpoints are registered
// ============================================

export const REQUIRED_ENDPOINTS = [
  { method: 'GET', path: '/health', description: 'Health check' },
  { method: 'GET', path: '/api/shards', description: 'List all shards' },
  { method: 'GET', path: '/api/shards/:id', description: 'Get shard by ID' },
  { method: 'GET', path: '/api/blocks/recent', description: 'Get recent blocks' },
  { method: 'GET', path: '/api/network/stats', description: 'Network statistics' },
  { method: 'GET', path: '/api/node/health', description: 'Node health status' },
  { method: 'GET', path: '/api/cross-shard/messages', description: 'Cross-shard messages' },
  { method: 'GET', path: '/api/wallets', description: 'List wallets' },
  { method: 'GET', path: '/api/wallets/:address', description: 'Get wallet by address' },
  { method: 'GET', path: '/api/transactions/:hash', description: 'Get transaction by hash' },
  { method: 'GET', path: '/api/contracts', description: 'List contracts' },
  { method: 'GET', path: '/api/contracts/:address', description: 'Get contract by address' },
  { method: 'GET', path: '/api/ai/models', description: 'List AI models' },
  { method: 'GET', path: '/api/ai/decisions', description: 'List AI decisions' },
  { method: 'GET', path: '/api/consensus/rounds', description: 'Consensus rounds' },
  { method: 'GET', path: '/api/performance', description: 'Performance metrics' }
] as const;

export function checkRequiredEndpoints(): { 
  missing: typeof REQUIRED_ENDPOINTS[number][]; 
  registered: typeof REQUIRED_ENDPOINTS[number][];
} {
  const missing: typeof REQUIRED_ENDPOINTS[number][] = [];
  const registered: typeof REQUIRED_ENDPOINTS[number][] = [];

  for (const endpoint of REQUIRED_ENDPOINTS) {
    // Normalize path for comparison (remove :param placeholders)
    const normalizedPath = endpoint.path.replace(/:[^/]+/g, '*');
    const isRegistered = endpointRegistry.getRegisteredEndpoints().some(e => {
      const registeredNormalized = e.path.replace(/:[^/]+/g, '*');
      return e.method === endpoint.method && registeredNormalized === normalizedPath;
    });

    if (isRegistered) {
      registered.push(endpoint);
    } else {
      missing.push(endpoint);
    }
  }

  if (missing.length > 0) {
    console.warn(`[Endpoint Registry] ⚠️ Missing required endpoints:`);
    missing.forEach(e => console.warn(`  - ${e.method} ${e.path}: ${e.description}`));
  }

  return { missing, registered };
}

// ============================================
// MONITORING ENDPOINT MIDDLEWARE
// Add to express app for health monitoring
// ============================================

export function getValidationMonitoringEndpoints() {
  return {
    '/api/internal/validation/stats': (_req: Request, res: Response) => {
      res.json({
        endpoints: endpointRegistry.getEndpointStats(),
        validation: validationLogger.getErrorStats(),
        requiredEndpoints: checkRequiredEndpoints(),
        timestamp: new Date().toISOString()
      });
    },
    '/api/internal/validation/errors': (_req: Request, res: Response) => {
      res.json({
        errors: validationLogger.getRecentErrors(100),
        timestamp: new Date().toISOString()
      });
    },
    '/api/internal/validation/missing-endpoints': (_req: Request, res: Response) => {
      res.json({
        missingEndpoints: endpointRegistry.getMissingEndpointReport(),
        timestamp: new Date().toISOString()
      });
    }
  };
}
