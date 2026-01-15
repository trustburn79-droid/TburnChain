/**
 * TBURN Security Manager
 * Centralized security orchestration for validator operations
 */
import { EventEmitter } from 'events';
import { RateLimitResult } from './rate-limiter.js';
import { IPCheckResult } from './ip-whitelist.js';
import { AnomalyAlert } from './anomaly-detector.js';
import { AuditLogger } from './audit-logger.js';
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
export declare class SecurityManager extends EventEmitter {
    private config;
    private rateLimiter;
    private nonceTracker;
    private ipWhitelist;
    private anomalyDetector;
    private auditLogger;
    private blockedValidators;
    constructor(config?: Partial<SecurityConfig>);
    validateRequest(context: SigningSecurityContext): Promise<SecurityCheckResult>;
    recordSigningResult(context: SigningSecurityContext, success: boolean, latencyMs: number): AnomalyAlert[];
    private handleAlert;
    blockValidator(address: string, reason: string): void;
    unblockValidator(address: string): void;
    isValidatorBlocked(address: string): boolean;
    getSecurityStats(validatorAddress: string): {
        rateLimitStats: {
            requests: number;
            violations: number;
            blocked: boolean;
        };
        nonceStats: {
            size: number;
            oldestAge: number;
        };
        anomalyStats: {
            totalSignings: number;
            totalFailures: number;
            avgLatency: number;
            alertCount: number;
        };
        isBlocked: boolean;
    };
    getAuditLog(): AuditLogger;
    destroy(): void;
}
export { CryptoUtils, CRYPTO_CONFIG } from './crypto-utils.js';
export { AdvancedRateLimiter } from './rate-limiter.js';
export { NonceTracker } from './nonce-tracker.js';
export { IPWhitelistManager } from './ip-whitelist.js';
export { AnomalyDetector, AnomalyAlert } from './anomaly-detector.js';
export { AuditLogger, AuditEntry } from './audit-logger.js';
//# sourceMappingURL=security-manager.d.ts.map