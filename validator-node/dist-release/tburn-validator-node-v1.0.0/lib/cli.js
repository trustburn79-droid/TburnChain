#!/usr/bin/env node
"use strict";
/**
 * TBURN Validator Node CLI
 * Enterprise-Grade Command Line Interface
 *
 * Usage:
 *   tburn-validator start --config validator.json
 *   tburn-validator init --name "My Validator" --region seoul
 *   tburn-validator status
 *   tburn-validator keys generate
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
const commander_1 = require("commander");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const validator_node_1 = require("./core/validator-node");
const routes_1 = require("./api/routes");
const keys_1 = require("./crypto/keys");
const default_1 = require("./config/default");
const logger_1 = require("./utils/logger");
const program = new commander_1.Command();
program
    .name('tburn-validator')
    .description('TBURN Mainnet Validator Node - Enterprise Production Grade')
    .version('1.0.0');
program
    .command('init')
    .description('Initialize a new validator node configuration')
    .option('-n, --name <name>', 'Validator name', 'TBURN Validator')
    .option('-r, --region <region>', 'Geographic region', 'asia-northeast1')
    .option('-d, --datacenter <datacenter>', 'Datacenter location', 'Seoul')
    .option('-o, --output <file>', 'Output configuration file', 'validator.json')
    .option('--stake <amount>', 'Stake amount in TBURN', '1000000')
    .option('--commission <percent>', 'Commission rate (0-100)', '10')
    .action(async (options) => {
    console.log('🔧 Initializing TBURN Validator Node...\n');
    const keyPair = keys_1.CryptoManager.generateKeyPair();
    console.log('🔑 Generated validator keys:');
    console.log(`   Address: ${keyPair.address}`);
    console.log(`   Public Key: ${keyPair.publicKey.substring(0, 40)}...`);
    console.log('');
    const config = {
        ...default_1.DEFAULT_CONFIG,
        validator: {
            address: keyPair.address,
            privateKey: keyPair.privateKey,
            publicKey: keyPair.publicKey,
            stake: (BigInt(options.stake) * BigInt(10 ** 18)).toString(),
            commission: parseFloat(options.commission) / 100,
            name: options.name,
            description: `TBURN Mainnet Validator - ${options.datacenter}`,
        },
        geo: {
            region: options.region,
            datacenter: options.datacenter,
            latitude: 37.5665,
            longitude: 126.9780,
            timezone: 'Asia/Seoul',
        },
    };
    const outputPath = path.resolve(options.output);
    fs.writeFileSync(outputPath, JSON.stringify(config, null, 2));
    console.log(`✅ Configuration saved to: ${outputPath}`);
    console.log('');
    console.log('⚠️  IMPORTANT: Securely backup your private key!');
    console.log('   The private key is stored in the configuration file.');
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Fund your validator address with stake');
    console.log('   2. Register your validator on the network');
    console.log(`   3. Start the node: tburn-validator start --config ${options.output}`);
});
program
    .command('start')
    .description('Start the validator node')
    .option('-c, --config <file>', 'Configuration file path', 'validator.json')
    .option('-d, --data-dir <dir>', 'Data directory override')
    .option('-p, --port <port>', 'P2P listen port override')
    .option('--api-port <port>', 'API server port override')
    .option('--log-level <level>', 'Log level (debug, info, warn, error)', 'info')
    .option('--solo', 'Start in solo mode (no peer requirements)')
    .action(async (options) => {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║           TBURN MAINNET VALIDATOR NODE v1.0.0                ║');
    console.log('║           Enterprise Production Grade                        ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log(`║  Chain ID: ${default_1.CHAIN_CONSTANTS.CHAIN_ID}                                                ║`);
    console.log(`║  Network: ${default_1.CHAIN_CONSTANTS.NETWORK_ID}                                    ║`);
    console.log(`║  Block Time: ${default_1.CHAIN_CONSTANTS.BLOCK_TIME_MS}ms                                           ║`);
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');
    const configPath = path.resolve(options.config);
    if (!fs.existsSync(configPath)) {
        console.error(`❌ Configuration file not found: ${configPath}`);
        console.error('   Run "tburn-validator init" to create a new configuration.');
        process.exit(1);
    }
    let config;
    try {
        const configData = fs.readFileSync(configPath, 'utf-8');
        config = JSON.parse(configData);
    }
    catch (error) {
        console.error(`❌ Failed to parse configuration file: ${error.message}`);
        process.exit(1);
    }
    if (options.dataDir) {
        config.storage.dataDir = options.dataDir;
        config.storage.blockDbPath = path.join(options.dataDir, 'blocks');
        config.storage.stateDbPath = path.join(options.dataDir, 'state');
        config.storage.txPoolPath = path.join(options.dataDir, 'txpool');
    }
    if (options.port) {
        config.network.listenPort = parseInt(options.port);
    }
    if (options.apiPort) {
        config.api.port = parseInt(options.apiPort);
    }
    if (options.logLevel) {
        config.monitoring.logLevel = options.logLevel;
    }
    if (options.solo) {
        config.network.minPeers = 0;
        config.network.bootstrapPeers = [];
    }
    logger_1.Logger.getInstance().configure({
        level: config.monitoring.logLevel,
        format: config.monitoring.logFormat,
        nodeId: config.nodeId,
    });
    console.log('📋 Validator Configuration:');
    console.log(`   Name: ${config.validator.name}`);
    console.log(`   Address: ${config.validator.address}`);
    console.log(`   Region: ${config.geo.region} (${config.geo.datacenter})`);
    console.log(`   Stake: ${BigInt(config.validator.stake) / BigInt(10 ** 18)} TBURN`);
    console.log(`   Commission: ${config.validator.commission * 100}%`);
    console.log('');
    const node = new validator_node_1.ValidatorNode(config);
    (0, routes_1.startApiServer)(node, config.api);
    process.on('SIGINT', async () => {
        console.log('\n🛑 Received SIGINT, shutting down gracefully...');
        await node.stop();
        process.exit(0);
    });
    process.on('SIGTERM', async () => {
        console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
        await node.stop();
        process.exit(0);
    });
    try {
        await node.start();
        console.log('');
        console.log('✅ Validator node is running!');
        console.log('');
        console.log('📊 Status endpoints:');
        console.log(`   Health: http://${config.api.host}:${config.api.port}/api/v1/health`);
        console.log(`   Status: http://${config.api.host}:${config.api.port}/api/v1/status`);
        console.log(`   Metrics: http://${config.api.host}:${config.api.port}/api/v1/metrics`);
        console.log('');
        console.log('Press Ctrl+C to stop the node');
    }
    catch (error) {
        console.error(`❌ Failed to start validator node: ${error.message}`);
        process.exit(1);
    }
});
program
    .command('keys')
    .description('Key management commands')
    .argument('<action>', 'Action: generate, show, export')
    .option('-c, --config <file>', 'Configuration file path', 'validator.json')
    .action((action, options) => {
    switch (action) {
        case 'generate': {
            const keyPair = keys_1.CryptoManager.generateKeyPair();
            console.log('🔑 New Key Pair Generated:');
            console.log('');
            console.log(`Address:     ${keyPair.address}`);
            console.log(`Public Key:  ${keyPair.publicKey}`);
            console.log(`Private Key: ${keyPair.privateKey}`);
            console.log('');
            console.log('⚠️  Store your private key securely!');
            break;
        }
        case 'show': {
            const configPath = path.resolve(options.config);
            if (!fs.existsSync(configPath)) {
                console.error(`❌ Configuration file not found: ${configPath}`);
                process.exit(1);
            }
            const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            console.log('🔑 Validator Keys:');
            console.log(`   Address: ${config.validator.address}`);
            console.log(`   Public Key: ${config.validator.publicKey.substring(0, 60)}...`);
            break;
        }
        case 'export': {
            const configPath = path.resolve(options.config);
            if (!fs.existsSync(configPath)) {
                console.error(`❌ Configuration file not found: ${configPath}`);
                process.exit(1);
            }
            const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            const exportData = {
                address: config.validator.address,
                publicKey: config.validator.publicKey,
            };
            console.log(JSON.stringify(exportData, null, 2));
            break;
        }
        default:
            console.error(`Unknown action: ${action}`);
            console.log('Available actions: generate, show, export');
            process.exit(1);
    }
});
program
    .command('status')
    .description('Check the status of a running validator node')
    .option('-u, --url <url>', 'Validator API URL', 'http://localhost:8080')
    .action(async (options) => {
    try {
        const response = await fetch(`${options.url}/api/v1/status`);
        const status = await response.json();
        console.log('📊 Validator Node Status:');
        console.log('');
        console.log(`   Node ID: ${status.nodeId}`);
        console.log(`   Chain ID: ${status.chainId}`);
        console.log(`   Version: ${status.version}`);
        console.log(`   Is Syncing: ${status.isSyncing}`);
        console.log(`   Current Height: ${status.currentHeight}`);
        console.log(`   Peers: ${status.peersCount}`);
        console.log(`   Uptime: ${Math.floor(status.uptime / 1000)}s`);
        console.log('');
        console.log('📈 Consensus State:');
        console.log(`   Height: ${status.consensusState.height}`);
        console.log(`   Round: ${status.consensusState.round}`);
        console.log(`   Phase: ${status.consensusState.phase}`);
    }
    catch (error) {
        console.error(`❌ Failed to connect to validator: ${error.message}`);
        console.log(`   Make sure the validator is running at ${options.url}`);
        process.exit(1);
    }
});
program
    .command('regions')
    .description('List supported geographic regions')
    .action(() => {
    console.log('🌍 Supported Validator Regions:\n');
    console.log('Region              | Datacenter    | Target Validators');
    console.log('─'.repeat(60));
    for (const region of default_1.GENESIS_VALIDATORS_REGIONS) {
        const regionPadded = region.region.padEnd(18);
        const dcPadded = region.datacenter.padEnd(13);
        console.log(`${regionPadded} | ${dcPadded} | ${region.count}`);
    }
    console.log('');
    console.log(`Total Genesis Validators: ${default_1.CHAIN_CONSTANTS.MAX_VALIDATORS}`);
});
program.parse(process.argv);
//# sourceMappingURL=cli.js.map