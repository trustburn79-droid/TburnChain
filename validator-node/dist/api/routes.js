"use strict";
/**
 * TBURN Validator Node API Routes
 * Enterprise-Grade REST API for Validator Management
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
exports.createApiRouter = createApiRouter;
exports.startApiServer = startApiServer;
const express_1 = __importStar(require("express"));
const logger_1 = require("../utils/logger");
const log = (0, logger_1.createModuleLogger)('API');
function createApiRouter(node, config) {
    const router = (0, express_1.Router)();
    const rateLimits = new Map();
    const rateLimitMiddleware = (req, res, next) => {
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const now = Date.now();
        let entry = rateLimits.get(ip);
        if (!entry || now > entry.resetTime) {
            entry = { count: 0, resetTime: now + config.rateLimit.windowMs };
            rateLimits.set(ip, entry);
        }
        entry.count++;
        if (entry.count > config.rateLimit.maxRequests) {
            res.status(429).json({ error: 'Rate limit exceeded' });
            return;
        }
        next();
    };
    const authMiddleware = (req, res, next) => {
        if (!config.authentication.enabled) {
            return next();
        }
        const apiKey = req.header(config.authentication.apiKeyHeader);
        if (!apiKey || !config.authentication.apiKeys.includes(apiKey)) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        next();
    };
    router.use(rateLimitMiddleware);
    router.get('/health', (_req, res) => {
        const status = node.getStatus();
        res.json({
            status: 'healthy',
            nodeId: status.nodeId,
            chainId: status.chainId,
            height: status.currentHeight,
            peers: status.peersCount,
            uptime: status.uptime,
        });
    });
    router.get('/status', (_req, res) => {
        res.json(node.getStatus());
    });
    router.get('/metrics', (_req, res) => {
        res.json(node.getMetrics());
    });
    router.get('/peers', (_req, res) => {
        res.json({
            count: node.getPeers().length,
            peers: node.getPeers(),
        });
    });
    router.get('/mempool', authMiddleware, (_req, res) => {
        res.json({
            size: node.getMempoolSize(),
            maxSize: node.getConfig().security.maxMempoolSize,
        });
    });
    router.get('/consensus', (_req, res) => {
        const status = node.getStatus();
        res.json(status.consensusState);
    });
    router.post('/transactions', authMiddleware, express_1.default.json(), async (req, res) => {
        try {
            const tx = req.body;
            if (!tx.from || !tx.to || !tx.value) {
                res.status(400).json({ error: 'Invalid transaction format' });
                return;
            }
            const hash = await node.submitTransaction(tx);
            res.json({ hash, status: 'pending' });
        }
        catch (error) {
            log.error('Transaction submission failed', { error: error.message });
            res.status(500).json({ error: 'Transaction submission failed' });
        }
    });
    router.get('/blocks/latest', async (_req, res) => {
        const status = node.getStatus();
        res.json({
            height: status.currentHeight,
            timestamp: Date.now(),
        });
    });
    router.get('/validator', (_req, res) => {
        const config = node.getConfig();
        res.json({
            address: config.validator.address,
            name: config.validator.name,
            stake: config.validator.stake,
            commission: config.validator.commission,
            region: config.geo.region,
            datacenter: config.geo.datacenter,
        });
    });
    router.get('/config', authMiddleware, (_req, res) => {
        const config = node.getConfig();
        res.json({
            nodeId: config.nodeId,
            chainId: config.chainId,
            networkId: config.networkId,
            network: {
                listenPort: config.network.listenPort,
                maxPeers: config.network.maxPeers,
            },
            consensus: config.consensus,
            geo: config.geo,
        });
    });
    router.post('/admin/stop', authMiddleware, async (_req, res) => {
        log.warn('Received stop command via API');
        res.json({ status: 'stopping' });
        setTimeout(async () => {
            await node.stop();
            process.exit(0);
        }, 1000);
    });
    return router;
}
function startApiServer(node, config) {
    if (!config.enabled) {
        log.info('API server disabled');
        return;
    }
    const app = (0, express_1.default)();
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', config.corsOrigins.join(','));
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-API-Key');
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        next();
    });
    app.use('/api/v1', createApiRouter(node, config));
    app.use((err, _req, res, _next) => {
        log.error('API error', { error: err.message });
        res.status(500).json({ error: 'Internal server error' });
    });
    app.listen(config.port, config.host, () => {
        log.info('API server started', { host: config.host, port: config.port });
    });
}
//# sourceMappingURL=routes.js.map