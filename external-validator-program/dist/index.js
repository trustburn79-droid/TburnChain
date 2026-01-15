"use strict";
/**
 * TBURN External Validator Node
 * Production-grade validator with Remote Signer integration and security modules
 *
 * Architecture:
 * - Validator node runs block production and attestation
 * - Private keys stored in isolated Signer Service (GCP Secret Manager)
 * - All signing requests sent via mTLS to Signer Service
 * - Advanced security: Rate limiting, anomaly detection, audit logging
 * - Hardware Security Module (HSM) ready
 *
 * Chain ID: 5800 | TBURN Mainnet | Target: 210,000 TPS
 */
Object.defineProperty(exports, "__esModule", { value: true });
const validator_node_js_1 = require("./core/validator-node.js");
const secure_remote_signer_client_js_1 = require("./core/secure-remote-signer-client.js");
const p2p_network_js_1 = require("./core/p2p-network.js");
const block_producer_js_1 = require("./core/block-producer.js");
const attestation_service_js_1 = require("./core/attestation-service.js");
const metrics_server_js_1 = require("./core/metrics-server.js");
const validator_config_js_1 = require("./config/validator-config.js");
async function main() {
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║         TBURN External Validator Node v2.0.0-secure          ║');
    console.log('║         Chain ID: 5800 | TBURN Mainnet                       ║');
    console.log('║         Remote Signer + Advanced Security Enabled            ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');
    try {
        const config = (0, validator_config_js_1.loadConfig)();
        console.log(`[Main] Network: ${config.network}`);
        console.log(`[Main] Chain ID: ${config.chainId}`);
        console.log(`[Main] Validator: ${config.validatorAddress}`);
        console.log(`[Main] Tier: ${config.tier}`);
        console.log(`[Main] Signer Endpoint: ${config.signerEndpoint}`);
        console.log(`[Main] Security: ENABLED`);
        console.log('');
        const enableSecurity = config.enableRateLimiting;
        const strictMode = process.env.SECURITY_STRICT_MODE === 'true';
        const signerClient = new secure_remote_signer_client_js_1.SecureRemoteSignerClient({
            endpoint: config.signerEndpoint,
            validatorAddress: config.validatorAddress,
            nodeId: config.nodeId,
            caCertPath: config.caCertPath,
            clientCertPath: config.clientCertPath,
            clientKeyPath: config.clientKeyPath,
            timeout: 5000,
            retryAttempts: 3,
            retryDelayMs: 1000,
            enableSecurity,
            strictMode,
            logDir: './logs/signer'
        });
        signerClient.on('security:alert', (alert) => {
            console.warn(`[Main] Security Alert: ${alert.type} - ${alert.message}`);
        });
        signerClient.on('security:blocked', (data) => {
            console.error(`[Main] Validator Blocked: ${data.address} - ${data.reason}`);
        });
        console.log('[Main] Connecting to Remote Signer Service...');
        const signerConnected = await signerClient.connect();
        if (!signerConnected) {
            throw new Error('Failed to connect to Remote Signer Service');
        }
        console.log('[Main] Remote Signer connected successfully');
        console.log(`[Main] Mode: ${signerClient.isProductionMode() ? 'PRODUCTION' : 'MOCK'}`);
        console.log(`[Main] Connection ID: ${signerClient.getConnectionId()}`);
        const p2pNetwork = new p2p_network_js_1.P2PNetwork({
            port: config.p2pPort,
            bootnodes: config.bootnodes,
            maxPeers: 50,
            nodeId: config.nodeId
        });
        const blockProducer = new block_producer_js_1.BlockProducer({
            signerClient,
            validatorAddress: config.validatorAddress,
            blockTimeMs: config.blockTimeMs,
            maxTxPerBlock: config.maxTxPerBlock
        });
        const attestationService = new attestation_service_js_1.AttestationService({
            signerClient,
            validatorAddress: config.validatorAddress
        });
        const metricsServer = new metrics_server_js_1.MetricsServer({
            port: config.metricsPort,
            validatorAddress: config.validatorAddress
        });
        const validatorNode = new validator_node_js_1.ValidatorNode({
            config,
            signerClient,
            p2pNetwork,
            blockProducer,
            attestationService,
            metricsServer,
            enableSecurity
        });
        validatorNode.on('security:alert', (alert) => {
            console.warn(`[Main] Node Security Alert: ${alert.type}`);
        });
        process.on('SIGINT', async () => {
            console.log('\n[Main] Received SIGINT, shutting down gracefully...');
            await validatorNode.stop();
            process.exit(0);
        });
        process.on('SIGTERM', async () => {
            console.log('\n[Main] Received SIGTERM, shutting down gracefully...');
            await validatorNode.stop();
            process.exit(0);
        });
        await validatorNode.start();
        console.log('');
        console.log('╔══════════════════════════════════════════════════════════════╗');
        console.log('║         Validator Node Started Successfully                  ║');
        console.log('║         Security Modules: ACTIVE                             ║');
        console.log('╚══════════════════════════════════════════════════════════════╝');
        console.log(`[Main] P2P Port: ${config.p2pPort}`);
        console.log(`[Main] Metrics: http://localhost:${config.metricsPort}/metrics`);
        console.log(`[Main] Health: http://localhost:${config.metricsPort}/health`);
        console.log(`[Main] Audit Logs: ./logs/signer/`);
        console.log('');
        setInterval(() => {
            const stats = signerClient.getStats();
            const secStats = signerClient.getSecurityStats();
            console.log(`[Main] Stats: requests=${stats.totalRequests}, success=${stats.successfulRequests}, ` +
                `failed=${stats.failedRequests}, avgLatency=${stats.averageLatencyMs.toFixed(2)}ms, ` +
                `securityBlocks=${stats.securityBlocks}, alerts=${secStats.anomalyStats.alertCount}`);
        }, 60000);
    }
    catch (error) {
        console.error('[Main] Fatal error:', error);
        process.exit(1);
    }
}
main().catch(console.error);
//# sourceMappingURL=index.js.map