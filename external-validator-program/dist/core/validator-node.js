"use strict";
/**
 * TBURN Validator Node
 * Main orchestrator for validator operations with security integration
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
exports.ValidatorNode = void 0;
const events_1 = require("events");
const index_js_1 = require("../security/index.js");
const crypto = __importStar(require("crypto"));
class ValidatorNode extends events_1.EventEmitter {
    config;
    signerClient;
    p2pNetwork;
    blockProducer;
    attestationService;
    metricsServer;
    mainnetSecurityClient;
    auditLogger;
    isRunning = false;
    startTime = 0;
    heartbeatInterval;
    slotInterval;
    securityCheckInterval;
    securityReportInterval;
    currentSlot = 0;
    currentEpoch = 0;
    blocksProposed = 0;
    attestationsMade = 0;
    securityAlertCount = 0;
    lastSecurityCheck = 0;
    enableSecurity;
    isBlockedByMainnet = false;
    constructor(nodeConfig) {
        super();
        this.config = nodeConfig.config;
        this.signerClient = nodeConfig.signerClient;
        this.p2pNetwork = nodeConfig.p2pNetwork;
        this.blockProducer = nodeConfig.blockProducer;
        this.attestationService = nodeConfig.attestationService;
        this.metricsServer = nodeConfig.metricsServer;
        this.mainnetSecurityClient = nodeConfig.mainnetSecurityClient;
        this.enableSecurity = nodeConfig.enableSecurity ?? true;
        this.auditLogger = new index_js_1.AuditLogger({
            logDir: './logs/validator',
            enableConsole: true,
            enableFile: true,
            enableIntegrity: true
        });
        this.setupEventHandlers();
        this.setupMainnetSecurityHandlers();
        this.auditLogger.info('VALIDATOR', 'NODE_INITIALIZED', {
            validatorAddress: this.config.validatorAddress,
            network: this.config.network,
            securityEnabled: this.enableSecurity,
            mainnetSyncEnabled: !!this.mainnetSecurityClient
        });
    }
    setupMainnetSecurityHandlers() {
        if (!this.mainnetSecurityClient)
            return;
        this.mainnetSecurityClient.on('blocked', (data) => {
            this.isBlockedByMainnet = true;
            this.auditLogger.security('MAINNET', 'VALIDATOR_BLOCKED', {
                reason: data.reason
            }, { validatorAddress: this.config.validatorAddress });
            console.error(`[ValidatorNode] BLOCKED by mainnet: ${data.reason}`);
            this.emit('mainnet:blocked', data);
        });
        this.mainnetSecurityClient.on('synced', (syncData) => {
            this.isBlockedByMainnet = syncData.isBlocked;
            if (syncData.activeAlerts?.length > 0) {
                this.auditLogger.warn('MAINNET', 'ACTIVE_ALERTS', {
                    count: syncData.activeAlerts.length
                });
            }
            this.emit('mainnet:synced', syncData);
        });
        this.mainnetSecurityClient.on('syncFailed', (data) => {
            this.auditLogger.error('MAINNET', 'SYNC_FAILED', {
                attempts: data.attempts
            });
            this.emit('mainnet:syncFailed', data);
        });
    }
    setupEventHandlers() {
        this.signerClient.on('signing:success', (data) => {
            this.auditLogger.info('SIGNING', 'SUCCESS', {
                operation: data.operation,
                responseTimeMs: data.responseTimeMs
            }, { validatorAddress: this.config.validatorAddress, requestId: data.requestId });
        });
        this.signerClient.on('signing:error', (data) => {
            this.auditLogger.error('SIGNING', 'FAILED', {
                operation: data.operation,
                error: data.error
            }, { validatorAddress: this.config.validatorAddress, requestId: data.requestId });
        });
        this.signerClient.on('security:alert', (alert) => {
            this.securityAlertCount++;
            this.auditLogger.security('SECURITY', 'ALERT_RECEIVED', {
                type: alert.type,
                severity: alert.severity,
                message: alert.message
            }, { validatorAddress: alert.validatorAddress });
            this.emit('security:alert', alert);
        });
        this.signerClient.on('security:blocked', (data) => {
            this.auditLogger.security('SECURITY', 'VALIDATOR_BLOCKED', {
                reason: data.reason
            }, { validatorAddress: data.address });
            this.emit('security:blocked', data);
        });
        this.blockProducer.on('block:produced', (data) => {
            this.blocksProposed++;
            this.auditLogger.info('BLOCK', 'PRODUCED', {
                slot: data.slot,
                txCount: data.txCount,
                blockHash: data.blockHash
            }, { validatorAddress: this.config.validatorAddress });
            this.emit('block:produced', data);
        });
        this.attestationService.on('attestation:made', (data) => {
            this.attestationsMade++;
            this.auditLogger.info('ATTESTATION', 'MADE', {
                slot: data.slot,
                epoch: data.epoch
            }, { validatorAddress: this.config.validatorAddress });
            this.emit('attestation:made', data);
        });
        this.p2pNetwork.on('peer:connected', (data) => {
            this.auditLogger.info('P2P', 'PEER_CONNECTED', {
                peerId: data.peerId
            });
        });
        this.p2pNetwork.on('peer:disconnected', (data) => {
            this.auditLogger.info('P2P', 'PEER_DISCONNECTED', {
                peerId: data.peerId
            });
        });
    }
    async start() {
        if (this.isRunning) {
            console.log('[ValidatorNode] Already running');
            return;
        }
        this.auditLogger.info('VALIDATOR', 'STARTING', {
            network: this.config.network,
            chainId: this.config.chainId
        });
        console.log('[ValidatorNode] Starting validator node...');
        this.startTime = Date.now();
        this.isRunning = true;
        await this.p2pNetwork.start();
        console.log('[ValidatorNode] P2P network started');
        await this.metricsServer.start();
        console.log('[ValidatorNode] Metrics server started');
        this.startSlotTimer();
        this.startHeartbeat();
        if (this.enableSecurity) {
            this.startSecurityMonitoring();
        }
        this.auditLogger.info('VALIDATOR', 'STARTED', {
            uptime: 0
        });
        this.emit('started');
        console.log('[ValidatorNode] Validator node started successfully');
    }
    async stop() {
        if (!this.isRunning) {
            return;
        }
        this.auditLogger.info('VALIDATOR', 'STOPPING', {
            uptime: Date.now() - this.startTime
        });
        console.log('[ValidatorNode] Stopping validator node...');
        this.isRunning = false;
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = undefined;
        }
        if (this.slotInterval) {
            clearInterval(this.slotInterval);
            this.slotInterval = undefined;
        }
        if (this.securityCheckInterval) {
            clearInterval(this.securityCheckInterval);
            this.securityCheckInterval = undefined;
        }
        await this.signerClient.disconnect();
        await this.p2pNetwork.stop();
        await this.metricsServer.stop();
        this.auditLogger.info('VALIDATOR', 'STOPPED', {
            totalBlocksProposed: this.blocksProposed,
            totalAttestations: this.attestationsMade,
            securityAlerts: this.securityAlertCount
        });
        this.emit('stopped');
        console.log('[ValidatorNode] Validator node stopped');
    }
    startSlotTimer() {
        const slotDuration = this.config.blockTimeMs;
        this.slotInterval = setInterval(async () => {
            this.currentSlot++;
            if (this.currentSlot % 32 === 0) {
                this.currentEpoch++;
                this.auditLogger.info('EPOCH', 'TRANSITION', {
                    newEpoch: this.currentEpoch,
                    slot: this.currentSlot
                });
            }
            if (this.shouldProposeBlock()) {
                try {
                    await this.blockProducer.produceBlock(this.currentSlot);
                }
                catch (error) {
                    this.auditLogger.error('BLOCK', 'PRODUCTION_FAILED', {
                        slot: this.currentSlot,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    });
                }
            }
            try {
                await this.attestationService.attest(this.currentSlot, this.currentEpoch);
            }
            catch (error) {
                this.auditLogger.error('ATTESTATION', 'FAILED', {
                    slot: this.currentSlot,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }, slotDuration);
        console.log(`[ValidatorNode] Slot timer started (${slotDuration}ms per slot)`);
    }
    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            this.sendHeartbeat();
        }, this.config.heartbeatIntervalMs);
        console.log(`[ValidatorNode] Heartbeat started (${this.config.heartbeatIntervalMs}ms interval)`);
    }
    startSecurityMonitoring() {
        this.securityCheckInterval = setInterval(() => {
            this.performSecurityCheck();
        }, 60000);
        console.log('[ValidatorNode] Security monitoring started (60s interval)');
    }
    async performSecurityCheck() {
        this.lastSecurityCheck = Date.now();
        const signerStats = this.signerClient.getSecurityStats();
        if (signerStats.isBlocked) {
            this.auditLogger.security('SECURITY', 'VALIDATOR_BLOCKED_STATUS', {
                stats: signerStats
            });
        }
        if (signerStats.anomalyStats.alertCount > 0) {
            this.auditLogger.warn('SECURITY', 'ANOMALY_SUMMARY', {
                alertCount: signerStats.anomalyStats.alertCount,
                totalSignings: signerStats.anomalyStats.totalSignings,
                totalFailures: signerStats.anomalyStats.totalFailures,
                avgLatency: signerStats.anomalyStats.avgLatency
            });
        }
        this.emit('security:check', {
            timestamp: this.lastSecurityCheck,
            stats: signerStats
        });
    }
    shouldProposeBlock() {
        const hash = this.hashSlotWithValidator(this.currentSlot);
        const proposerIndex = parseInt(hash.slice(0, 8), 16) % 125;
        const validatorIndex = parseInt(this.config.validatorAddress.slice(2, 10), 16) % 125;
        return proposerIndex === validatorIndex;
    }
    hashSlotWithValidator(slot) {
        return crypto.createHash('sha256')
            .update(`${slot}-${this.config.chainId}`)
            .digest('hex');
    }
    async sendHeartbeat() {
        const status = this.getStatus();
        console.log(`[ValidatorNode] Heartbeat: slot ${status.currentSlot}, epoch ${status.currentEpoch}, peers ${status.connectedPeers}`);
        this.emit('heartbeat', status);
        // Send security heartbeat to mainnet if connected
        if (this.mainnetSecurityClient?.isConnectedToMainnet()) {
            try {
                const securityStats = this.signerClient.getSecurityStats();
                await this.mainnetSecurityClient.sendSecurityHeartbeat({
                    nodeId: this.config.nodeId,
                    uptime: status.uptime,
                    currentSlot: status.currentSlot,
                    securityStats: {
                        signingRequests: securityStats.anomalyStats?.totalSignings || 0,
                        blockedRequests: securityStats.rateLimitStats?.blocked ? 1 : 0,
                        rateLimitHits: securityStats.rateLimitStats?.violations || 0,
                        replayAttemptsBlocked: 0, // Tracked separately if needed
                        lastSecurityCheck: this.lastSecurityCheck,
                    },
                });
            }
            catch (error) {
                console.warn('[ValidatorNode] Failed to send security heartbeat to mainnet:', error);
            }
        }
    }
    getStatus() {
        return {
            isRunning: this.isRunning,
            isProposing: this.blockProducer.isProposing(),
            isAttesting: this.attestationService.isAttesting(),
            connectedPeers: this.p2pNetwork.getPeerCount(),
            currentSlot: this.currentSlot,
            currentEpoch: this.currentEpoch,
            blocksProposed: this.blocksProposed,
            attestationsMade: this.attestationsMade,
            uptime: this.isRunning ? Date.now() - this.startTime : 0,
            signerStatus: this.signerClient.isReady() ? 'connected' : 'disconnected',
            securityStatus: {
                enabled: this.enableSecurity,
                alertCount: this.securityAlertCount,
                blocked: false,
                lastCheck: this.lastSecurityCheck
            }
        };
    }
    getSecurityStats() {
        return this.signerClient.getSecurityStats();
    }
    getSignerStats() {
        return this.signerClient.getStats();
    }
    getConfig() {
        return this.config;
    }
    isSecurityEnabled() {
        return this.enableSecurity;
    }
}
exports.ValidatorNode = ValidatorNode;
//# sourceMappingURL=validator-node.js.map