"use strict";
/**
 * TBURN Mainnet Security Client
 * Communicates with the main system's Validator Security API
 * Syncs security status, receives commands, and reports alerts
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainnetSecurityClient = void 0;
const https = __importStar(require("https"));
const http = __importStar(require("http"));
const events_1 = require("events");
const crypto_utils_js_1 = require("../security/crypto-utils.js");
class MainnetSecurityClient extends events_1.EventEmitter {
    config;
    syncInterval;
    lastSyncData = null;
    isConnected = false;
    reconnectAttempts = 0;
    maxReconnectAttempts = 5;
    constructor(config) {
        super();
        this.config = config;
        console.log(`[MainnetSecurityClient] Initialized for ${config.validatorAddress}`);
        console.log(`[MainnetSecurityClient] API URL: ${config.mainnetApiUrl}`);
        console.log(`[MainnetSecurityClient] Sync Interval: ${config.syncIntervalMs}ms`);
    }
    async start() {
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
        }
        catch (error) {
            console.error('[MainnetSecurityClient] Failed to start:', error);
            return false;
        }
    }
    async stop() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = undefined;
        }
        this.isConnected = false;
        this.emit('disconnected');
        console.log('[MainnetSecurityClient] Stopped');
    }
    startSyncLoop() {
        this.syncInterval = setInterval(async () => {
            await this.performSecuritySync();
        }, this.config.syncIntervalMs);
    }
    async performSecuritySync() {
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
                activeAlerts: (statusData.activeAlerts || []).map((a) => ({
                    id: a.id,
                    type: a.type,
                    severity: a.severity,
                    message: a.message,
                    timestamp: new Date(a.timestamp),
                    status: 'active',
                })),
                lastSyncTime: new Date(statusData.syncedAt || Date.now()),
            };
            this.reconnectAttempts = 0;
            if (this.lastSyncData.isBlocked) {
                this.emit('blocked', { reason: this.lastSyncData.blockReason });
            }
            this.emit('synced', this.lastSyncData);
            return true;
        }
        catch (error) {
            this.reconnectAttempts++;
            console.error(`[MainnetSecurityClient] Sync failed (attempt ${this.reconnectAttempts}):`, error);
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                this.emit('syncFailed', { attempts: this.reconnectAttempts });
            }
            return false;
        }
    }
    async reportSecurityStatus(report) {
        try {
            const endpoint = `${this.config.mainnetApiUrl}/api/external-validators/security/report`;
            const requestId = crypto_utils_js_1.CryptoUtils.generateRequestId();
            const payload = {
                ...report,
                requestId,
                signature: this.signReport(report),
            };
            await this.httpRequest(endpoint, 'POST', payload);
            console.log(`[MainnetSecurityClient] Security report sent: ${requestId}`);
            return true;
        }
        catch (error) {
            console.error('[MainnetSecurityClient] Failed to send security report:', error);
            return false;
        }
    }
    async acknowledgeAlert(alertId) {
        try {
            const endpoint = `${this.config.mainnetApiUrl}/api/external-validators/security/alerts/${alertId}/acknowledge`;
            await this.httpRequest(endpoint, 'POST', {
                validatorAddress: this.config.validatorAddress,
                nodeId: this.config.nodeId,
                acknowledgedAt: Date.now(),
            });
            console.log(`[MainnetSecurityClient] Alert ${alertId} acknowledged`);
            return true;
        }
        catch (error) {
            console.error('[MainnetSecurityClient] Failed to acknowledge alert:', error);
            return false;
        }
    }
    async fetchMySecurityStatus() {
        const endpoint = `${this.config.mainnetApiUrl}/api/external-validators/security/my-status`;
        return this.httpRequest(endpoint, 'GET');
    }
    async sendSecurityHeartbeat(data) {
        const endpoint = `${this.config.mainnetApiUrl}/api/external-validators/security/heartbeat`;
        return this.httpRequest(endpoint, 'POST', data);
    }
    async httpRequest(url, method, body) {
        return new Promise((resolve, reject) => {
            const parsedUrl = new URL(url);
            const isHttps = parsedUrl.protocol === 'https:';
            const lib = isHttps ? https : http;
            // Generate timestamp and nonce for replay protection
            const timestamp = Date.now().toString();
            const nonce = crypto_utils_js_1.CryptoUtils.generateNonce();
            // Generate HMAC signature for request integrity
            const bodyStr = body ? JSON.stringify(body) : '';
            const signaturePayload = `${timestamp}:${nonce}:${bodyStr}`;
            const signature = crypto_utils_js_1.CryptoUtils.hmacSHA256(this.config.apiKey, signaturePayload);
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
                        }
                        else if (res.statusCode === 401 || res.statusCode === 403) {
                            reject(new Error(`Authentication failed: ${res.statusCode}`));
                        }
                        else {
                            reject(new Error(`Request failed: ${res.statusCode}`));
                        }
                    }
                    catch (e) {
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
    signReport(report) {
        const data = JSON.stringify({
            validatorAddress: report.validatorAddress,
            nodeId: report.nodeId,
            timestamp: report.timestamp,
        });
        return crypto_utils_js_1.CryptoUtils.hashSHA3(data + this.config.apiKey);
    }
    getLastSyncData() {
        return this.lastSyncData;
    }
    isValidatorBlocked() {
        return this.lastSyncData?.isBlocked || false;
    }
    getBlockReason() {
        return this.lastSyncData?.blockReason;
    }
    getRateLimitConfig() {
        return this.lastSyncData?.rateLimitConfig || {
            requestsPerSecond: 100,
            requestsPerMinute: 1000,
            burstCapacity: 50,
        };
    }
    getActiveAlerts() {
        return this.lastSyncData?.activeAlerts || [];
    }
    isConnectedToMainnet() {
        return this.isConnected;
    }
    getConfig() {
        return this.config;
    }
}
exports.MainnetSecurityClient = MainnetSecurityClient;
//# sourceMappingURL=mainnet-security-client.js.map