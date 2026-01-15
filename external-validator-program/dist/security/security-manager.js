"use strict";
/**
 * TBURN Security Manager
 * Centralized security orchestration for validator operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogger = exports.AnomalyDetector = exports.IPWhitelistManager = exports.NonceTracker = exports.AdvancedRateLimiter = exports.CRYPTO_CONFIG = exports.CryptoUtils = exports.SecurityManager = void 0;
const events_1 = require("events");
const rate_limiter_js_1 = require("./rate-limiter.js");
const nonce_tracker_js_1 = require("./nonce-tracker.js");
const ip_whitelist_js_1 = require("./ip-whitelist.js");
const anomaly_detector_js_1 = require("./anomaly-detector.js");
const audit_logger_js_1 = require("./audit-logger.js");
const crypto_utils_js_1 = require("./crypto-utils.js");
class SecurityManager extends events_1.EventEmitter {
    config;
    rateLimiter;
    nonceTracker;
    ipWhitelist;
    anomalyDetector;
    auditLogger;
    blockedValidators = new Set();
    constructor(config = {}) {
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
        this.rateLimiter = new rate_limiter_js_1.AdvancedRateLimiter({
            maxRequestsPerSecond: 100,
            maxRequestsPerMinute: 1000,
            maxRequestsPerHour: 10000,
            burstLimit: 50,
            blockDurationMs: 300000
        });
        this.nonceTracker = new nonce_tracker_js_1.NonceTracker({
            maxAge: 300000,
            maxSize: 100000
        });
        this.ipWhitelist = new ip_whitelist_js_1.IPWhitelistManager({
            enabled: this.config.enableIPWhitelist,
            allowedSubnets: ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16']
        });
        this.anomalyDetector = new anomaly_detector_js_1.AnomalyDetector({
            maxSigningsPerMinute: 200,
            maxFailuresPerMinute: 10,
            alertCallback: (alert) => this.handleAlert(alert)
        });
        this.auditLogger = new audit_logger_js_1.AuditLogger({
            logDir: this.config.logDir,
            enableConsole: true,
            enableFile: true,
            enableIntegrity: true
        });
        this.auditLogger.info('SECURITY', 'MANAGER_INITIALIZED', {
            config: this.config
        });
    }
    async validateRequest(context) {
        const alerts = [];
        let allowed = true;
        let reason;
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
        let ipCheck;
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
        if (!crypto_utils_js_1.CryptoUtils.verifyTimestamp(context.timestamp)) {
            this.auditLogger.security('VALIDATION', 'TIMESTAMP_INVALID', {
                timestamp: context.timestamp,
                serverTime: Date.now(),
                maxDrift: crypto_utils_js_1.CRYPTO_CONFIG.MAX_CLOCK_DRIFT_MS
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
        let rateLimit;
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
    recordSigningResult(context, success, latencyMs) {
        const alerts = this.anomalyDetector.recordSigning(context.validatorAddress, context.slot || 0, latencyMs, success);
        if (success) {
            this.auditLogger.info('SIGNING', 'SUCCESS', {
                operation: context.operation,
                slot: context.slot,
                latencyMs
            }, context);
        }
        else {
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
    handleAlert(alert) {
        this.emit('alert', alert);
        const level = alert.severity === 'critical' || alert.severity === 'high' ? 'SECURITY' : 'WARN';
        this.auditLogger.log(level, 'ANOMALY', alert.type, alert.details, {
            validatorAddress: alert.validatorAddress
        });
        if (alert.type === 'DOUBLE_SIGNING_ATTEMPT') {
            this.blockValidator(alert.validatorAddress, 'Double signing attempt detected');
        }
    }
    blockValidator(address, reason) {
        this.blockedValidators.add(address);
        this.auditLogger.security('ACCESS', 'VALIDATOR_BLOCKED', {
            reason
        }, { validatorAddress: address });
        this.emit('validatorBlocked', { address, reason });
        setTimeout(() => {
            this.unblockValidator(address);
        }, 3600000);
    }
    unblockValidator(address) {
        this.blockedValidators.delete(address);
        this.auditLogger.info('ACCESS', 'VALIDATOR_UNBLOCKED', {}, {
            validatorAddress: address
        });
        this.emit('validatorUnblocked', { address });
    }
    isValidatorBlocked(address) {
        return this.blockedValidators.has(address);
    }
    getSecurityStats(validatorAddress) {
        return {
            rateLimitStats: this.rateLimiter.getStats(validatorAddress),
            nonceStats: this.nonceTracker.getStats(),
            anomalyStats: this.anomalyDetector.getStats(validatorAddress),
            isBlocked: this.blockedValidators.has(validatorAddress)
        };
    }
    getAuditLog() {
        return this.auditLogger;
    }
    destroy() {
        this.rateLimiter.destroy();
        this.nonceTracker.destroy();
        this.anomalyDetector.destroy();
        this.auditLogger.info('SECURITY', 'MANAGER_SHUTDOWN', {});
    }
}
exports.SecurityManager = SecurityManager;
var crypto_utils_js_2 = require("./crypto-utils.js");
Object.defineProperty(exports, "CryptoUtils", { enumerable: true, get: function () { return crypto_utils_js_2.CryptoUtils; } });
Object.defineProperty(exports, "CRYPTO_CONFIG", { enumerable: true, get: function () { return crypto_utils_js_2.CRYPTO_CONFIG; } });
var rate_limiter_js_2 = require("./rate-limiter.js");
Object.defineProperty(exports, "AdvancedRateLimiter", { enumerable: true, get: function () { return rate_limiter_js_2.AdvancedRateLimiter; } });
var nonce_tracker_js_2 = require("./nonce-tracker.js");
Object.defineProperty(exports, "NonceTracker", { enumerable: true, get: function () { return nonce_tracker_js_2.NonceTracker; } });
var ip_whitelist_js_2 = require("./ip-whitelist.js");
Object.defineProperty(exports, "IPWhitelistManager", { enumerable: true, get: function () { return ip_whitelist_js_2.IPWhitelistManager; } });
var anomaly_detector_js_2 = require("./anomaly-detector.js");
Object.defineProperty(exports, "AnomalyDetector", { enumerable: true, get: function () { return anomaly_detector_js_2.AnomalyDetector; } });
var audit_logger_js_2 = require("./audit-logger.js");
Object.defineProperty(exports, "AuditLogger", { enumerable: true, get: function () { return audit_logger_js_2.AuditLogger; } });
//# sourceMappingURL=security-manager.js.map