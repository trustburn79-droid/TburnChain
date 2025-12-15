/**
 * Enterprise Connection Health Monitor & Circuit Breaker
 * 
 * Features:
 * 1. Periodic health checks for critical services
 * 2. Automatic recovery attempts on failure
 * 3. Circuit breaker pattern to prevent cascade failures
 * 4. Health status reporting via WebSocket
 */

import { EventEmitter } from 'events';

// ============================================
// CIRCUIT BREAKER PATTERN
// Prevents cascade failures by opening circuit on repeated errors
// ============================================

export enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation - requests pass through
  OPEN = 'OPEN',         // Circuit tripped - requests blocked
  HALF_OPEN = 'HALF_OPEN' // Testing recovery - limited requests allowed
}

interface CircuitBreakerConfig {
  name: string;
  failureThreshold: number;     // Number of failures before opening
  successThreshold: number;     // Successes needed in half-open to close
  timeout: number;              // Time in ms before attempting half-open
  resetTimeout: number;         // Time in ms before resetting failure count
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private successes: number = 0;
  private lastFailureTime: number = 0;
  private lastStateChange: number = Date.now();
  private config: CircuitBreakerConfig;
  private halfOpenTimeout: NodeJS.Timeout | null = null;

  constructor(config: Partial<CircuitBreakerConfig> & { name: string }) {
    this.config = {
      failureThreshold: 5,
      successThreshold: 3,
      timeout: 30000,        // 30 seconds
      resetTimeout: 60000,   // 1 minute
      ...config
    };
  }

  getState(): CircuitState {
    return this.state;
  }

  getStats() {
    return {
      name: this.config.name,
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime ? new Date(this.lastFailureTime).toISOString() : null,
      lastStateChange: new Date(this.lastStateChange).toISOString(),
      config: this.config
    };
  }

  canExecute(): boolean {
    const now = Date.now();

    // Auto-reset if enough time has passed since last failure
    if (this.state === CircuitState.CLOSED && 
        this.lastFailureTime && 
        now - this.lastFailureTime > this.config.resetTimeout) {
      this.failures = 0;
    }

    // Check if we should transition from OPEN to HALF_OPEN
    if (this.state === CircuitState.OPEN && 
        now - this.lastStateChange > this.config.timeout) {
      this.transitionTo(CircuitState.HALF_OPEN);
    }

    return this.state !== CircuitState.OPEN;
  }

  recordSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++;
      if (this.successes >= this.config.successThreshold) {
        this.transitionTo(CircuitState.CLOSED);
        this.failures = 0;
        this.successes = 0;
      }
    } else if (this.state === CircuitState.CLOSED) {
      // Reduce failure count on success (gradual recovery)
      this.failures = Math.max(0, this.failures - 1);
    }
  }

  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      // Immediate trip back to OPEN on failure in half-open
      this.transitionTo(CircuitState.OPEN);
      this.successes = 0;
    } else if (this.state === CircuitState.CLOSED && 
               this.failures >= this.config.failureThreshold) {
      this.transitionTo(CircuitState.OPEN);
    }
  }

  private transitionTo(newState: CircuitState): void {
    console.log(`[CircuitBreaker:${this.config.name}] ${this.state} → ${newState}`);
    this.state = newState;
    this.lastStateChange = Date.now();

    // Clear any existing timeout
    if (this.halfOpenTimeout) {
      clearTimeout(this.halfOpenTimeout);
      this.halfOpenTimeout = null;
    }

    // Schedule transition to half-open if circuit is open
    if (newState === CircuitState.OPEN) {
      this.halfOpenTimeout = setTimeout(() => {
        this.transitionTo(CircuitState.HALF_OPEN);
      }, this.config.timeout);
    }
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (!this.canExecute()) {
      throw new Error(`Circuit breaker ${this.config.name} is OPEN - request blocked`);
    }

    try {
      const result = await operation();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  forceClose(): void {
    this.transitionTo(CircuitState.CLOSED);
    this.failures = 0;
    this.successes = 0;
  }

  forceOpen(): void {
    this.transitionTo(CircuitState.OPEN);
  }
}

// ============================================
// SERVICE HEALTH STATUS
// ============================================

export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  UNKNOWN = 'unknown'
}

interface ServiceHealth {
  name: string;
  status: HealthStatus;
  lastCheck: Date;
  lastSuccess: Date | null;
  consecutiveFailures: number;
  responseTime: number | null;
  error?: string;
  circuitBreaker?: CircuitBreaker;
}

interface HealthCheckResult {
  success: boolean;
  responseTime: number;
  error?: string;
}

// ============================================
// CONNECTION HEALTH MONITOR
// Monitors all critical services and triggers recovery
// ============================================

export class ConnectionHealthMonitor extends EventEmitter {
  private services: Map<string, ServiceHealth> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();

  // Configuration
  private readonly CHECK_INTERVAL_MS = 30000;  // Check every 30 seconds
  private readonly FAILURE_THRESHOLD = 3;       // Failures before degraded
  private readonly UNHEALTHY_THRESHOLD = 5;     // Failures before unhealthy
  private readonly RECOVERY_CHECK_INTERVAL = 10000; // Recovery check every 10s

  constructor() {
    super();
  }

  registerService(
    name: string, 
    healthCheck: () => Promise<HealthCheckResult>,
    circuitBreakerConfig?: Partial<CircuitBreakerConfig>
  ): void {
    // Create circuit breaker for this service
    const circuitBreaker = new CircuitBreaker({
      name,
      ...circuitBreakerConfig
    });
    this.circuitBreakers.set(name, circuitBreaker);

    this.services.set(name, {
      name,
      status: HealthStatus.UNKNOWN,
      lastCheck: new Date(),
      lastSuccess: null,
      consecutiveFailures: 0,
      responseTime: null,
      circuitBreaker
    });

    console.log(`[HealthMonitor] Registered service: ${name}`);
  }

  async checkService(name: string, healthCheck: () => Promise<HealthCheckResult>): Promise<void> {
    const service = this.services.get(name);
    if (!service) return;

    const circuitBreaker = this.circuitBreakers.get(name);
    if (circuitBreaker && !circuitBreaker.canExecute()) {
      // Circuit is open - skip check but update status
      service.status = HealthStatus.UNHEALTHY;
      service.error = 'Circuit breaker is OPEN';
      return;
    }

    const startTime = Date.now();
    try {
      const result = await healthCheck();
      const responseTime = Date.now() - startTime;

      if (result.success) {
        circuitBreaker?.recordSuccess();
        
        service.status = HealthStatus.HEALTHY;
        service.lastSuccess = new Date();
        service.consecutiveFailures = 0;
        service.responseTime = responseTime;
        service.error = undefined;

        this.emit('serviceHealthy', { name, responseTime });
      } else {
        throw new Error(result.error || 'Health check failed');
      }
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      circuitBreaker?.recordFailure();

      service.consecutiveFailures++;
      service.responseTime = responseTime;
      service.error = error.message;
      service.lastCheck = new Date();

      // Determine health status based on failure count
      if (service.consecutiveFailures >= this.UNHEALTHY_THRESHOLD) {
        service.status = HealthStatus.UNHEALTHY;
        this.emit('serviceUnhealthy', { name, error: error.message, failures: service.consecutiveFailures });
      } else if (service.consecutiveFailures >= this.FAILURE_THRESHOLD) {
        service.status = HealthStatus.DEGRADED;
        this.emit('serviceDegraded', { name, error: error.message, failures: service.consecutiveFailures });
      }

      console.warn(`[HealthMonitor] ${name} check failed (${service.consecutiveFailures}): ${error.message}`);
    }

    service.lastCheck = new Date();
  }

  start(healthChecks: Map<string, () => Promise<HealthCheckResult>>): void {
    if (this.isRunning) {
      console.warn('[HealthMonitor] Already running');
      return;
    }

    console.log('[HealthMonitor] Starting health monitoring...');
    this.isRunning = true;

    // Register all health checks
    Array.from(healthChecks.entries()).forEach(([name, checkFn]) => {
      if (!this.services.has(name)) {
        this.registerService(name, checkFn);
      }
    });

    // Run initial check
    this.runAllChecks(healthChecks);

    // Schedule periodic checks
    this.checkInterval = setInterval(() => {
      this.runAllChecks(healthChecks);
    }, this.CHECK_INTERVAL_MS);

    console.log(`[HealthMonitor] ✅ Started with ${this.services.size} services`);
  }

  private async runAllChecks(healthChecks: Map<string, () => Promise<HealthCheckResult>>): Promise<void> {
    const checkPromises: Promise<void>[] = [];

    Array.from(healthChecks.entries()).forEach(([name, checkFn]) => {
      checkPromises.push(this.checkService(name, checkFn));
    });

    await Promise.allSettled(checkPromises);
    this.emit('checksCompleted', this.getOverallHealth());
  }

  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log('[HealthMonitor] Stopped');
  }

  getServiceHealth(name: string): ServiceHealth | undefined {
    return this.services.get(name);
  }

  getOverallHealth(): {
    status: HealthStatus;
    services: Record<string, ServiceHealth>;
    circuitBreakers: Record<string, ReturnType<CircuitBreaker['getStats']>>;
  } {
    const services: Record<string, ServiceHealth> = {};
    const circuitBreakerStats: Record<string, ReturnType<CircuitBreaker['getStats']>> = {};
    
    let hasUnhealthy = false;
    let hasDegraded = false;

    Array.from(this.services.entries()).forEach(([name, service]) => {
      services[name] = { ...service };
      
      const cb = this.circuitBreakers.get(name);
      if (cb) {
        circuitBreakerStats[name] = cb.getStats();
      }

      if (service.status === HealthStatus.UNHEALTHY) hasUnhealthy = true;
      if (service.status === HealthStatus.DEGRADED) hasDegraded = true;
    });

    let overallStatus = HealthStatus.HEALTHY;
    if (hasUnhealthy) overallStatus = HealthStatus.UNHEALTHY;
    else if (hasDegraded) overallStatus = HealthStatus.DEGRADED;

    return {
      status: overallStatus,
      services,
      circuitBreakers: circuitBreakerStats
    };
  }

  getCircuitBreaker(name: string): CircuitBreaker | undefined {
    return this.circuitBreakers.get(name);
  }

  // Force recovery attempt for a specific service
  async attemptRecovery(name: string, recoveryFn: () => Promise<boolean>): Promise<boolean> {
    const service = this.services.get(name);
    const circuitBreaker = this.circuitBreakers.get(name);

    if (!service) {
      console.warn(`[HealthMonitor] Unknown service: ${name}`);
      return false;
    }

    console.log(`[HealthMonitor] Attempting recovery for: ${name}`);
    
    try {
      const recovered = await recoveryFn();
      
      if (recovered) {
        service.status = HealthStatus.HEALTHY;
        service.consecutiveFailures = 0;
        service.lastSuccess = new Date();
        service.error = undefined;
        circuitBreaker?.forceClose();
        
        this.emit('serviceRecovered', { name });
        console.log(`[HealthMonitor] ✅ ${name} recovered successfully`);
        return true;
      }
    } catch (error: any) {
      console.error(`[HealthMonitor] Recovery failed for ${name}: ${error.message}`);
    }

    return false;
  }
}

// ============================================
// CRITICAL CONFIGURATION VALIDATOR
// Validates required environment and config at startup
// ============================================

export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  config: Record<string, string | boolean>;
}

export function validateCriticalConfiguration(): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const config: Record<string, string | boolean> = {};

  console.log('[ConfigValidator] Validating critical configuration...');

  // Required environment variables
  const requiredEnvVars = [
    'DATABASE_URL',
    'SESSION_SECRET'
  ];

  // Recommended but not required
  const recommendedEnvVars = [
    'TBURN_API_KEY',
    'ADMIN_PASSWORD',
    'GEMINI_API_KEY'
  ];

  // Check required variables
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (!value || value.trim() === '') {
      errors.push(`Missing required environment variable: ${envVar}`);
      config[envVar] = false;
    } else {
      config[envVar] = `[SET: ${value.substring(0, 4)}...]`;
    }
  }

  // Check recommended variables
  for (const envVar of recommendedEnvVars) {
    const value = process.env[envVar];
    if (!value || value.trim() === '') {
      warnings.push(`Missing recommended environment variable: ${envVar}`);
      config[envVar] = false;
    } else {
      config[envVar] = `[SET: ${value.substring(0, 4)}...]`;
    }
  }

  // Validate TBURN_API_KEY format if present
  const tburnApiKey = process.env.TBURN_API_KEY;
  if (tburnApiKey) {
    if (tburnApiKey.length < 8) {
      warnings.push('TBURN_API_KEY is shorter than recommended (8+ characters)');
    }
    config['TBURN_API_KEY_LENGTH'] = `${tburnApiKey.length} chars`;
  }

  // Check database connectivity format
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && !dbUrl.includes('postgresql://') && !dbUrl.includes('postgres://')) {
    errors.push('DATABASE_URL does not appear to be a valid PostgreSQL connection string');
  }

  // Validate NODE_ENV
  const nodeEnv = process.env.NODE_ENV || 'development';
  config['NODE_ENV'] = nodeEnv;
  if (nodeEnv === 'production') {
    console.log('[ConfigValidator] Running in PRODUCTION mode');
    
    // Stricter validation for production
    if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
      errors.push('SESSION_SECRET must be at least 32 characters in production');
    }
  }

  const isValid = errors.length === 0;

  if (errors.length > 0) {
    console.error('[ConfigValidator] ❌ Configuration validation failed:');
    errors.forEach(e => console.error(`  - ${e}`));
  }

  if (warnings.length > 0) {
    console.warn('[ConfigValidator] ⚠️ Configuration warnings:');
    warnings.forEach(w => console.warn(`  - ${w}`));
  }

  if (isValid) {
    console.log('[ConfigValidator] ✅ Configuration validation passed');
  }

  return { isValid, errors, warnings, config };
}

// ============================================
// SINGLETON INSTANCES
// ============================================

let healthMonitorInstance: ConnectionHealthMonitor | null = null;

export function getHealthMonitor(): ConnectionHealthMonitor {
  if (!healthMonitorInstance) {
    healthMonitorInstance = new ConnectionHealthMonitor();
  }
  return healthMonitorInstance;
}

export function resetHealthMonitor(): void {
  if (healthMonitorInstance) {
    healthMonitorInstance.stop();
    healthMonitorInstance = null;
  }
}
