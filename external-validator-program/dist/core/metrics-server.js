"use strict";
/**
 * TBURN Metrics Server
 * Exposes Prometheus-compatible metrics and health endpoints
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
exports.MetricsServer = void 0;
const events_1 = require("events");
const http = __importStar(require("http"));
class MetricsServer extends events_1.EventEmitter {
    config;
    server;
    startTime = 0;
    metrics = {
        blocksProposed: 0,
        attestationsMade: 0,
        signingRequests: 0,
        signingErrors: 0,
        peerCount: 0,
        currentSlot: 0,
        currentEpoch: 0
    };
    constructor(config) {
        super();
        this.config = config;
    }
    async start() {
        this.startTime = Date.now();
        this.server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });
        return new Promise((resolve, reject) => {
            this.server.listen(this.config.port, () => {
                console.log(`[MetricsServer] Listening on port ${this.config.port}`);
                resolve();
            });
            this.server.on('error', reject);
        });
    }
    async stop() {
        if (!this.server) {
            return;
        }
        return new Promise((resolve) => {
            this.server.close(() => {
                console.log('[MetricsServer] Stopped');
                resolve();
            });
        });
    }
    handleRequest(req, res) {
        const url = req.url || '/';
        if (url === '/health') {
            this.handleHealthCheck(res);
        }
        else if (url === '/metrics') {
            this.handleMetrics(res);
        }
        else if (url === '/status') {
            this.handleStatus(res);
        }
        else {
            res.writeHead(404);
            res.end('Not Found');
        }
    }
    handleHealthCheck(res) {
        const uptime = Date.now() - this.startTime;
        const isHealthy = uptime > 0;
        res.writeHead(isHealthy ? 200 : 503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: isHealthy ? 'healthy' : 'unhealthy',
            uptime,
            validatorAddress: this.config.validatorAddress,
            timestamp: new Date().toISOString()
        }));
    }
    handleMetrics(res) {
        const uptime = (Date.now() - this.startTime) / 1000;
        const metricsText = `
# HELP tburn_validator_blocks_proposed_total Total blocks proposed
# TYPE tburn_validator_blocks_proposed_total counter
tburn_validator_blocks_proposed_total{validator="${this.config.validatorAddress}"} ${this.metrics.blocksProposed}

# HELP tburn_validator_attestations_made_total Total attestations made
# TYPE tburn_validator_attestations_made_total counter
tburn_validator_attestations_made_total{validator="${this.config.validatorAddress}"} ${this.metrics.attestationsMade}

# HELP tburn_validator_signing_requests_total Total signing requests
# TYPE tburn_validator_signing_requests_total counter
tburn_validator_signing_requests_total{validator="${this.config.validatorAddress}"} ${this.metrics.signingRequests}

# HELP tburn_validator_signing_errors_total Total signing errors
# TYPE tburn_validator_signing_errors_total counter
tburn_validator_signing_errors_total{validator="${this.config.validatorAddress}"} ${this.metrics.signingErrors}

# HELP tburn_validator_peer_count Current peer count
# TYPE tburn_validator_peer_count gauge
tburn_validator_peer_count{validator="${this.config.validatorAddress}"} ${this.metrics.peerCount}

# HELP tburn_validator_current_slot Current slot number
# TYPE tburn_validator_current_slot gauge
tburn_validator_current_slot{validator="${this.config.validatorAddress}"} ${this.metrics.currentSlot}

# HELP tburn_validator_current_epoch Current epoch number
# TYPE tburn_validator_current_epoch gauge
tburn_validator_current_epoch{validator="${this.config.validatorAddress}"} ${this.metrics.currentEpoch}

# HELP tburn_validator_uptime_seconds Validator uptime in seconds
# TYPE tburn_validator_uptime_seconds gauge
tburn_validator_uptime_seconds{validator="${this.config.validatorAddress}"} ${uptime}
`.trim();
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(metricsText);
    }
    handleStatus(res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            validatorAddress: this.config.validatorAddress,
            uptime: Date.now() - this.startTime,
            metrics: this.metrics,
            timestamp: new Date().toISOString()
        }));
    }
    updateMetrics(updates) {
        Object.assign(this.metrics, updates);
    }
    incrementMetric(key, value = 1) {
        this.metrics[key] += value;
    }
}
exports.MetricsServer = MetricsServer;
//# sourceMappingURL=metrics-server.js.map