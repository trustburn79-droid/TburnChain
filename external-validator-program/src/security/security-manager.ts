/**
 * TBURN Security Manager
 * Centralized security orchestration for validator operations
 */

import { EventEmitter } from 'events';
import { AdvancedRateLimiter, RateLimitResult } from './rate-limiter.js';
import { NonceTracker } from './nonce-tracker.js';
import { IPWhitelistManager, IPCheckResult } from './ip-whitelist.js';
import { AnomalyDetector, AnomalyAlert } from './anomaly-detector.js';
import { AuditLogger, AuditEntry } from './audit-logger.js';
import { CryptoUtils, CRYPTO_CONFIG } from './crypto-utils.js';

export interface SecurityConfig {
  enableRateLimiting: boolean;
  enableNonceTracking: boolean;
  enableIPWhitelist: boolean;
  enableAnomalyDetection: boolean;
  enableAuditLogging: boolean;
  strictMode: boolean;
  logDir: string;
}

export interface SecurityCheckResult {
  allowed: boolean;
  reason?: string;
  alerts: AnomalyAlert[];
  rateLimit?: RateLimitResult;
  ipCheck?: IPCheckResult;
}

export interface SigningSecurityContext {
  validatorAddress: string;
  requestId: string;
  operation: string;
  ip: string;
  nonce: string;
  timestamp: number;
  slot?: number;
}

export class SecurityManager extends EventEmitter {
  private config: SecurityConfig;
  private rateLimiter: AdvancedRateLimiter;
  private nonceTracker: NonceTracker;
  private ipWhitelist: IPWhitelistManager;
  private anomalyDetector: AnomalyDetector;
  private auditLogger: AuditLogger;
  private blockedValidators: Set<string> = new Set();

  constructor(config: Partial<SecurityConfig> = {}) {
    super();
    
    this.config = {
      enableRateLimiting: config.enableRateLimiting ?? true,
      enableNonceTracking: config.enableNonceTracking ?? true,
      enableIPWhitelist: config.enableIPWhitelist ?? true,
      enableAnomalyDetection: config.enableAnomalyDetection ?? true,
      enableAuditLogging: config.enableAuditLogging ?? true,
      strictMode: config.strictMode ?? false,
      logDir: config.logDir ?? './logs'
    };

    this.rateLimiter = new AdvancedRateLimiter({
      maxRequestsPerSecond: 100,
      maxRequestsPerMinute: 1000,
      maxRequestsPerHour: 10000,
      burstLimit: 50,
      blockDurationMs: 300000
    });

    this.nonceTracker = new NonceTracker({
      maxAge: 300000,
      maxSize: 100000
    });

    this.ipWhitelist = new IPWhitelistManager({
      enabled: this.config.enableIPWhitelist,
      allowedSubnets: ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16']
    });

    this.anomalyDetector = new AnomalyDetector({
      maxSigningsPerMinute: 200,
      maxFailuresPerMinute: 10,
      alertCallback: (alert) => this.handleAlert(alert)
    });

    this.auditLogger = new AuditLogger({
      logDir: this.config.logDir,
      enableConsole: true,
      enableFile: true,
      enableIntegrity: true
    });

    this.auditLogger.info('SECURITY', 'MANAGER_INITIALIZED', {
      config: this.config
    });
  }

  async validateRequest(context: SigningSecurityContext): Promise<SecurityCheckResult> {
    const alerts: AnomalyAlert[] = [];
    let allowed = true;
    let reason: string | undefined;

    if (this.blockedValidators.has(context.validatorAddress)) {
      this.auditLogger.security('ACCESS', 'BLOCKED_VALIDATOR', {
        reason: 'Validator is blocked'
      }, context);
      
      return {
        allowed: false,
        reason: 'Validator is temporarily blocked',
        alerts: []
      };
    }

    let ipCheck: IPCheckResult | undefined;
    if (this.config.enableIPWhitelist) {
      ipCheck = this.ipWhitelist.check(context.ip);
      if (!ipCheck.allowed) {
        this.auditLogger.security('ACCESS', 'IP_REJECTED', {
          ip: context.ip,
          reason: ipCheck.reason
        }, context);
        
        return {
          allowed: false,
          reason: ipCheck.reason,
          alerts: [],
          ipCheck
        };
      }
    }

    if (!CryptoUtils.verifyTimestamp(context.timestamp)) {
      this.auditLogger.security('VALIDATION', 'TIMESTAMP_INVALID', {
        timestamp: context.timestamp,
        serverTime: Date.now(),
        maxDrift: CRYPTO_CONFIG.MAX_CLOCK_DRIFT_MS
      }, context);
      
      return {
        allowed: false,
        reason: 'Request timestamp is outside acceptable range',
        alerts: []
      };
    }

    if (this.config.enableNonceTracking) {
      if (!this.nonceTracker.use(context.nonce, context.validatorAddress)) {
        this.auditLogger.security('VALIDATION', 'NONCE_REUSED', {
          nonce: context.nonce
        }, context);
        
        return {
          allowed: false,
          reason: 'Nonce already used (potential replay attack)',
          alerts: []
        };
      }
    }

    let rateLimit: RateLimitResult | undefined;
    if (this.config.enableRateLimiting) {
      rateLimit = this.rateLimiter.check(context.validatorAddress);
      if (!rateLimit.allowed) {
        this.auditLogger.warn('RATE_LIMIT', 'EXCEEDED', {
          remaining: rateLimit.remainingRequests,
          resetAt: rateLimit.resetAt,
          reason: rateLimit.reason
        }, context);
        
        if (this.config.strictMode && rateLimit.blocked) {
          this.blockValidator(context.validatorAddress, 'Rate limit violation');
        }
        
        return {
          allowed: false,
          reason: rateLimit.reason,
          alerts: [],
          rateLimit
        };
      }
    }

    this.auditLogger.info('REQUEST', 'VALIDATED', {
      operation: context.operation,
      slot: context.slot
    }, context);

    return {
      allowed,
      reason,
      alerts,
      rateLimit,
      ipCheck
    };
  }

  recordSigningResult(
    context: SigningSecurityContext,
    success: boolean,
    latencyMs: number
  ): AnomalyAlert[] {
    const alerts = this.anomalyDetector.recordSigning(
      context.validatorAddress,
      context.slot || 0,
      latencyMs,
      success
    );

    if (success) {
      this.auditLogger.info('SIGNING', 'SUCCESS', {
        operation: context.operation,
        slot: context.slot,
        latencyMs
      }, context);
    } else {
      this.auditLogger.warn('SIGNING', 'FAILED', {
        operation: context.operation,
        slot: context.slot,
        latencyMs
      }, context);
    }

    for (const alert of alerts) {
      if (alert.severity === 'critical' && this.config.strictMode) {
        this.blockValidator(context.validatorAddress, alert.message);
      }
    }

    return alerts;
  }

  private handleAlert(alert: AnomalyAlert): void {
    this.emit('alert', alert);

    const level = alert.severity === 'critical' || alert.severity === 'high' ? 'SECURITY' : 'WARN';
    this.auditLogger.log(level, 'ANOMALY', alert.type, alert.details, {
      validatorAddress: alert.validatorAddress
    });

    if (alert.type === 'DOUBLE_SIGNING_ATTEMPT') {
      this.blockValidator(alert.validatorAddress, 'Double signing attempt detected');
    }
  }

  blockValidator(address: string, reason: string): void {
    this.blockedValidators.add(address);
    
    this.auditLogger.security('ACCESS', 'VALIDATOR_BLOCKED', {
      reason
    }, { validatorAddress: address });

    this.emit('validatorBlocked', { address, reason });

    setTimeout(() => {
      this.unblockValidator(address);
    }, 3600000);
  }

  unblockValidator(address: string): void {
    this.blockedValidators.delete(address);
    
    this.auditLogger.info('ACCESS', 'VALIDATOR_UNBLOCKED', {}, {
      validatorAddress: address
    });

    this.emit('validatorUnblocked', { address });
  }

  isValidatorBlocked(address: string): boolean {
    return this.blockedValidators.has(address);
  }

  getSecurityStats(validatorAddress: string): {
    rateLimitStats: { requests: number; violations: number; blocked: boolean };
    nonceStats: { size: number; oldestAge: number };
    anomalyStats: { totalSignings: number; totalFailures: number; avgLatency: number; alertCount: number };
    isBlocked: boolean;
  } {
    return {
      rateLimitStats: this.rateLimiter.getStats(validatorAddress),
      nonceStats: this.nonceTracker.getStats(),
      anomalyStats: this.anomalyDetector.getStats(validatorAddress),
      isBlocked: this.blockedValidators.has(validatorAddress)
    };
  }

  getAuditLog(): AuditLogger {
    return this.auditLogger;
  }

  destroy(): void {
    this.rateLimiter.destroy();
    this.nonceTracker.destroy();
    this.anomalyDetector.destroy();
    
    this.auditLogger.info('SECURITY', 'MANAGER_SHUTDOWN', {});
  }
}

export { CryptoUtils, CRYPTO_CONFIG } from './crypto-utils.js';
export { AdvancedRateLimiter } from './rate-limiter.js';
export { NonceTracker } from './nonce-tracker.js';
export { IPWhitelistManager } from './ip-whitelist.js';
export { AnomalyDetector, AnomalyAlert } from './anomaly-detector.js';
export { AuditLogger, AuditEntry } from './audit-logger.js';
