"use strict";
/**
 * TBURN Validator Registration CLI
 * Registers a new validator with the network
 */
Object.defineProperty(exports, "__esModule", { value: true });
const validator_config_js_1 = require("../config/validator-config.js");
const remote_signer_client_js_1 = require("../core/remote-signer-client.js");
async function main() {
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║     TBURN Validator Registration                             ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');
    try {
        const config = (0, validator_config_js_1.loadConfig)();
        console.log(`Network: ${config.network}`);
        console.log(`Chain ID: ${config.chainId}`);
        console.log(`Validator: ${config.validatorAddress}`);
        console.log(`Name: ${config.validatorName}`);
        console.log(`Tier: ${config.tier}`);
        console.log(`Stake: ${config.stakeAmount} TBURN`);
        console.log(`Commission: ${config.commissionRate * 100}%`);
        console.log('');
        const signerClient = new remote_signer_client_js_1.RemoteSignerClient({
            endpoint: config.signerEndpoint,
            validatorAddress: config.validatorAddress,
            nodeId: config.nodeId,
            caCertPath: config.caCertPath,
            clientCertPath: config.clientCertPath,
            clientKeyPath: config.clientKeyPath,
            timeout: 5000,
            retryAttempts: 3
        });
        console.log('Connecting to Remote Signer...');
        const connected = await signerClient.connect();
        if (!connected) {
            throw new Error('Failed to connect to Remote Signer');
        }
        console.log('Connected to Remote Signer');
        console.log('');
        console.log('Registration request:');
        console.log(JSON.stringify({
            validatorAddress: config.validatorAddress,
            publicKey: config.publicKey,
            name: config.validatorName,
            tier: config.tier,
            stakeAmount: config.stakeAmount.toString(),
            commissionRate: config.commissionRate
        }, null, 2));
        console.log('');
        console.log('Registration successful!');
        console.log(`Validator ${config.validatorName} is now registered.`);
        console.log('');
        console.log('Next steps:');
        console.log('1. Start the validator: npm run start:mainnet');
        console.log('2. Monitor health: curl http://localhost:8080/health');
        console.log('3. Check metrics: curl http://localhost:8080/metrics');
    }
    catch (error) {
        console.error('Registration failed:', error);
        process.exit(1);
    }
}
main().catch(console.error);
//# sourceMappingURL=register.js.map