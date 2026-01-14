/**
 * TBURN External Validator Node
 * Production-grade validator with Remote Signer integration
 * 
 * Architecture:
 * - Validator node runs block production and attestation
 * - Private keys stored in isolated Signer Service (GCP Secret Manager)
 * - All signing requests sent via mTLS to Signer Service
 * - Hardware Security Module (HSM) ready
 * 
 * Chain ID: 5800 | TBURN Mainnet | Target: 210,000 TPS
 */

import { ValidatorNode } from './core/validator-node.js';
import { RemoteSignerClient } from './core/remote-signer-client.js';
import { P2PNetwork } from './core/p2p-network.js';
import { BlockProducer } from './core/block-producer.js';
import { AttestationService } from './core/attestation-service.js';
import { MetricsServer } from './core/metrics-server.js';
import { loadConfig, ValidatorConfig } from './config/validator-config.js';

async function main(): Promise<void> {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║         TBURN External Validator Node v1.0.0                 ║');
  console.log('║         Chain ID: 5800 | TBURN Mainnet                       ║');
  console.log('║         Remote Signer Architecture Enabled                   ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  try {
    const config = loadConfig();
    
    console.log(`[Main] Network: ${config.network}`);
    console.log(`[Main] Chain ID: ${config.chainId}`);
    console.log(`[Main] Validator: ${config.validatorAddress}`);
    console.log(`[Main] Tier: ${config.tier}`);
    console.log(`[Main] Signer Endpoint: ${config.signerEndpoint}`);
    console.log('');

    const signerClient = new RemoteSignerClient({
      endpoint: config.signerEndpoint,
      validatorAddress: config.validatorAddress,
      nodeId: config.nodeId,
      caCertPath: config.caCertPath,
      clientCertPath: config.clientCertPath,
      clientKeyPath: config.clientKeyPath,
      timeout: 5000,
      retryAttempts: 3
    });

    console.log('[Main] Connecting to Remote Signer Service...');
    const signerConnected = await signerClient.connect();
    if (!signerConnected) {
      throw new Error('Failed to connect to Remote Signer Service');
    }
    console.log('[Main] Remote Signer connected successfully');

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

    const validatorNode = new ValidatorNode({
      config,
      signerClient,
      p2pNetwork,
      blockProducer,
      attestationService,
      metricsServer
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
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log(`[Main] P2P Port: ${config.p2pPort}`);
    console.log(`[Main] Metrics: http://localhost:${config.metricsPort}/metrics`);
    console.log(`[Main] Health: http://localhost:${config.metricsPort}/health`);
    console.log('');

  } catch (error) {
    console.error('[Main] Fatal error:', error);
    process.exit(1);
  }
}

main().catch(console.error);
