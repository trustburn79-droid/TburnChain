/**
 * TBURN External Validator Node
 * Production-grade validator with Remote Signer integration and security modules
 * 
 * Architecture:
 * - Validator node runs block production and attestation
 * - Private keys stored in isolated Signer Service (GCP Secret Manager)
 * - All signing requests sent via mTLS to Signer Service
 * - Advanced security: Rate limiting, anomaly detection, audit logging
 * - Mainnet Security Sync: Real-time status and command synchronization
 * - Hardware Security Module (HSM) ready
 * 
 * Chain ID: 5800 | TBURN Mainnet | Target: 210,000 TPS
 */

import { ValidatorNode } from './core/validator-node.js';
import { SecureRemoteSignerClient } from './core/secure-remote-signer-client.js';
import { P2PNetwork } from './core/p2p-network.js';
import { BlockProducer } from './core/block-producer.js';
import { AttestationService } from './core/attestation-service.js';
import { MetricsServer } from './core/metrics-server.js';
import { MainnetSecurityClient } from './core/mainnet-security-client.js';
import { loadConfig, ValidatorConfig } from './config/validator-config.js';

async function main(): Promise<void> {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║         TBURN External Validator Node v2.1.0-enterprise      ║');
  console.log('║         Chain ID: 5800 | TBURN Mainnet                       ║');
  console.log('║         Remote Signer + Mainnet Security Sync Enabled        ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  try {
    const config = loadConfig();
    
    console.log(`[Main] Network: ${config.network}`);
    console.log(`[Main] Chain ID: ${config.chainId}`);
    console.log(`[Main] Validator: ${config.validatorAddress}`);
    console.log(`[Main] Tier: ${config.tier}`);
    console.log(`[Main] Signer Endpoint: ${config.signerEndpoint}`);
    console.log(`[Main] Security: ENABLED`);
    console.log(`[Main] Mainnet Security Sync: ${config.enableSecuritySync ? 'ENABLED' : 'DISABLED'}`);
    console.log(`[Main] Mainnet API URL: ${config.mainnetApiUrl}`);
    console.log('');

    const enableSecurity = config.enableRateLimiting;
    const strictMode = process.env.SECURITY_STRICT_MODE === 'true';

    const signerClient = new SecureRemoteSignerClient({
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

    const p2pNetwork = new P2PNetwork({
      port: config.p2pPort,
      bootnodes: config.bootnodes,
      maxPeers: 50,
      nodeId: config.nodeId
    });

    const blockProducer = new BlockProducer({
      signerClient,
      validatorAddress: config.validatorAddress,
      blockTimeMs: config.blockTimeMs,
      maxTxPerBlock: config.maxTxPerBlock
    });

    const attestationService = new AttestationService({
      signerClient,
      validatorAddress: config.validatorAddress
    });

    const metricsServer = new MetricsServer({
      port: config.metricsPort,
      validatorAddress: config.validatorAddress
    });

    let mainnetSecurityClient: MainnetSecurityClient | undefined;
    
    if (config.enableSecuritySync && config.mainnetApiKey) {
      console.log('[Main] Initializing Mainnet Security Client...');
      
      mainnetSecurityClient = new MainnetSecurityClient({
        mainnetApiUrl: config.mainnetApiUrl,
        validatorAddress: config.validatorAddress,
        nodeId: config.nodeId,
        apiKey: config.mainnetApiKey,
        syncIntervalMs: config.securitySyncIntervalMs,
        timeout: 30000,
        enableSync: config.enableSecuritySync
      });

      mainnetSecurityClient.on('connected', () => {
        console.log('[Main] ✅ Mainnet Security Client connected');
      });

      mainnetSecurityClient.on('synced', (data) => {
        console.log(`[Main] 🔄 Security synced: blocked=${data.isBlocked}, alerts=${data.activeAlerts?.length || 0}`);
      });

      mainnetSecurityClient.on('blocked', (data) => {
        console.error(`[Main] ⛔ BLOCKED by mainnet: ${data.reason}`);
      });

      mainnetSecurityClient.on('syncFailed', (data) => {
        console.warn(`[Main] ⚠️ Security sync failed after ${data.attempts} attempts`);
      });

      const securityStarted = await mainnetSecurityClient.start();
      if (securityStarted) {
        console.log('[Main] ✅ Mainnet Security Client started successfully');
      } else {
        console.warn('[Main] ⚠️ Mainnet Security Client failed to start, continuing without sync');
      }
    } else {
      console.log('[Main] ℹ️ Mainnet Security Sync disabled or API key not configured');
      console.log('[Main] ℹ️ Set ENABLE_SECURITY_SYNC=true and MAINNET_API_KEY to enable');
    }

    const validatorNode = new ValidatorNode({
      config,
      signerClient,
      p2pNetwork,
      blockProducer,
      attestationService,
      metricsServer,
      mainnetSecurityClient,
      enableSecurity
    });

    validatorNode.on('security:alert', (alert) => {
      console.warn(`[Main] Node Security Alert: ${alert.type}`);
    });

    process.on('SIGINT', async () => {
      console.log('\n[Main] Received SIGINT, shutting down gracefully...');
      if (mainnetSecurityClient) {
        await mainnetSecurityClient.stop();
        console.log('[Main] Mainnet Security Client stopped');
      }
      await validatorNode.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n[Main] Received SIGTERM, shutting down gracefully...');
      if (mainnetSecurityClient) {
        await mainnetSecurityClient.stop();
        console.log('[Main] Mainnet Security Client stopped');
      }
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

  } catch (error) {
    console.error('[Main] Fatal error:', error);
    process.exit(1);
  }
}

main().catch(console.error);
