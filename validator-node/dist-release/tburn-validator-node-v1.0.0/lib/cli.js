#!/usr/bin/env node
"use strict";
/**
 * TBURN Validator Node CLI
 * Enterprise-Grade Command Line Interface
 *
 * Usage:
 *   tburn-validator setup                    # Interactive setup wizard
 *   tburn-validator start --config validator.json
 *   tburn-validator init --name "My Validator" --region seoul
 *   tburn-validator keys generate
 *   tburn-validator keys import --private-key <key>
 *   tburn-validator keys backup --output backup.json
 *   tburn-validator keys restore --input backup.json
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
const readline = __importStar(require("readline"));
const validator_node_1 = require("./core/validator-node");
const routes_1 = require("./api/routes");
const keys_1 = require("./crypto/keys");
const secure_keystore_1 = require("./crypto/secure-keystore");
const default_1 = require("./config/default");
const logger_1 = require("./utils/logger");
const program = new commander_1.Command();
function createReadlineInterface() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
}
async function prompt(rl, question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}
async function promptPassword(question) {
    return new Promise((resolve) => {
        const stdin = process.stdin;
        const stdout = process.stdout;
        stdout.write(question);
        stdin.setRawMode?.(true);
        stdin.resume();
        stdin.setEncoding('utf8');
        let password = '';
        const onData = (char) => {
            if (char === '\n' || char === '\r' || char === '\u0004') {
                stdin.setRawMode?.(false);
                stdin.pause();
                stdout.write('\n');
                stdin.removeListener('data', onData);
                resolve(password);
            }
            else if (char === '\u0003') {
                process.exit();
            }
            else if (char === '\u007F' || char === '\b') {
                if (password.length > 0) {
                    password = password.slice(0, -1);
                    stdout.write('\b \b');
                }
            }
            else {
                password += char;
                stdout.write('*');
            }
        };
        stdin.on('data', onData);
    });
}
program
    .name('tburn-validator')
    .description('TBURN Mainnet Validator Node - Enterprise Production Grade')
    .version('1.0.0');
program
    .command('setup')
    .description('Interactive setup wizard for new validators (recommended for beginners)')
    .action(async () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║        TBURN VALIDATOR NODE - INTERACTIVE SETUP              ║');
    console.log('║                 Welcome to TBURN Mainnet!                    ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('This wizard will guide you through setting up your validator node.');
    console.log('');
    const rl = createReadlineInterface();
    try {
        // Step 1: Validator Name
        console.log('📋 Step 1/6: Basic Information');
        console.log('─'.repeat(50));
        const name = await prompt(rl, 'Enter your validator name (e.g., "My TBURN Validator"): ') || 'TBURN Validator';
        console.log('');
        // Step 2: Region Selection
        console.log('🌍 Step 2/6: Region Selection');
        console.log('─'.repeat(50));
        console.log('Available regions:');
        default_1.GENESIS_VALIDATORS_REGIONS.forEach((r, i) => {
            console.log(`  ${i + 1}. ${r.region} (${r.datacenter})`);
        });
        const regionInput = await prompt(rl, 'Enter region number (1-7) [default: 1]: ') || '1';
        const regionIndex = Math.max(0, Math.min(parseInt(regionInput) - 1, default_1.GENESIS_VALIDATORS_REGIONS.length - 1));
        const selectedRegion = default_1.GENESIS_VALIDATORS_REGIONS[regionIndex] || default_1.GENESIS_VALIDATORS_REGIONS[0];
        console.log(`Selected: ${selectedRegion.region} (${selectedRegion.datacenter})`);
        console.log('');
        // Step 3: Stake Amount
        console.log('💰 Step 3/6: Stake Configuration');
        console.log('─'.repeat(50));
        console.log('Minimum stake: 1,000,000 TBURN');
        console.log('Recommended stake: 10,000,000+ TBURN for better rewards');
        const stakeInput = await prompt(rl, 'Enter stake amount in TBURN [default: 1000000]: ') || '1000000';
        const stake = Math.max(1000000, parseInt(stakeInput) || 1000000);
        console.log(`Stake: ${stake.toLocaleString()} TBURN`);
        console.log('');
        // Step 4: Commission Rate
        console.log('📊 Step 4/6: Commission Rate');
        console.log('─'.repeat(50));
        console.log('Commission is the fee you take from delegator rewards (0-100%)');
        console.log('Average network rate: 5-10%');
        const commissionInput = await prompt(rl, 'Enter commission rate % [default: 10]: ') || '10';
        const commission = Math.max(0, Math.min(100, parseInt(commissionInput) || 10));
        console.log(`Commission: ${commission}%`);
        console.log('');
        // Step 5: Key Generation or Import
        console.log('🔑 Step 5/6: Key Setup');
        console.log('─'.repeat(50));
        console.log('1. Generate new keys (recommended for new validators)');
        console.log('2. Import existing keys');
        const keyChoice = await prompt(rl, 'Enter choice [default: 1]: ') || '1';
        let keyPair;
        if (keyChoice === '2') {
            console.log('');
            console.log('Enter your existing private key (hex format):');
            const privateKeyInput = await prompt(rl, '> ');
            try {
                const cryptoManager = new keys_1.CryptoManager();
                cryptoManager.loadFromPrivateKey(privateKeyInput);
                keyPair = {
                    privateKey: privateKeyInput,
                    publicKey: cryptoManager.getPublicKeyHex(),
                    address: cryptoManager.getAddress(),
                };
                console.log(`✅ Key imported successfully!`);
                console.log(`   Address: ${keyPair.address}`);
            }
            catch (error) {
                console.error('❌ Invalid private key format. Generating new keys instead.');
                keyPair = keys_1.CryptoManager.generateKeyPair();
            }
        }
        else {
            keyPair = keys_1.CryptoManager.generateKeyPair();
            console.log('✅ New keys generated!');
        }
        console.log('');
        console.log(`   Your Validator Address: ${keyPair.address}`);
        console.log('');
        // Step 6: Password Protection
        console.log('🔐 Step 6/6: Security Setup');
        console.log('─'.repeat(50));
        console.log('Your private key will be encrypted with a password.');
        console.log('⚠️  Remember this password! You will need it to start your validator.');
        console.log('');
        rl.close();
        const password = await promptPassword('Enter a secure password: ');
        const confirmPassword = await promptPassword('Confirm password: ');
        if (password !== confirmPassword) {
            console.error('❌ Passwords do not match. Please run setup again.');
            process.exit(1);
        }
        if (password.length < 8) {
            console.error('❌ Password must be at least 8 characters. Please run setup again.');
            process.exit(1);
        }
        // Initialize secure keystore and import key
        const keystorePath = path.resolve('keystore.enc');
        const keystore = new secure_keystore_1.SecureKeystore({
            path: keystorePath,
            autoLockTimeoutMs: 30 * 60 * 1000,
            maxDecryptionAttempts: 5,
        });
        await keystore.initialize(password);
        const importedKey = await keystore.importKey(keyPair.privateKey);
        keystore.lock();
        // Create configuration with keyId reference (private key stored in keystore)
        const config = {
            ...default_1.DEFAULT_CONFIG,
            validator: {
                address: keyPair.address,
                privateKey: `keystore:${importedKey.keyId}`, // Reference to keystore
                publicKey: keyPair.publicKey,
                stake: (BigInt(stake) * BigInt(10 ** 18)).toString(),
                commission: commission / 100,
                name: name,
                description: `TBURN Mainnet Validator - ${selectedRegion.datacenter}`,
            },
            geo: {
                region: selectedRegion.region,
                datacenter: selectedRegion.datacenter,
                latitude: 37.5665,
                longitude: 126.9780,
                timezone: 'Asia/Seoul',
            },
        };
        // Save configuration (without private key - it's in the keystore)
        const configPath = path.resolve('validator.json');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        // Create backup file
        const backupData = {
            address: keyPair.address,
            publicKey: keyPair.publicKey,
            encryptedPrivateKey: fs.readFileSync(keystorePath, 'utf-8'),
            createdAt: new Date().toISOString(),
            region: selectedRegion.region,
            name: name,
        };
        const backupPath = path.resolve(`backup-${keyPair.address.substring(0, 10)}.json`);
        fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
        console.log('');
        console.log('╔══════════════════════════════════════════════════════════════╗');
        console.log('║                    ✅ SETUP COMPLETE!                        ║');
        console.log('╚══════════════════════════════════════════════════════════════╝');
        console.log('');
        console.log('📁 Files created:');
        console.log(`   • Configuration: ${configPath}`);
        console.log(`   • Encrypted Keystore: ${keystorePath}`);
        console.log(`   • Backup: ${backupPath}`);
        console.log('');
        console.log('📋 Your Validator Details:');
        console.log(`   • Name: ${name}`);
        console.log(`   • Address: ${keyPair.address}`);
        console.log(`   • Region: ${selectedRegion.region} (${selectedRegion.datacenter})`);
        console.log(`   • Stake: ${stake.toLocaleString()} TBURN`);
        console.log(`   • Commission: ${commission}%`);
        console.log('');
        console.log('⚠️  IMPORTANT - Please do these things NOW:');
        console.log('   1. Save your backup file in a secure location');
        console.log('   2. Write down your password and store it safely');
        console.log('   3. Fund your validator address with stake before starting');
        console.log('');
        console.log('🚀 To start your validator, run:');
        console.log('   tburn-validator start --config validator.json');
        console.log('');
    }
    catch (error) {
        rl.close();
        console.error(`❌ Setup failed: ${error.message}`);
        process.exit(1);
    }
});
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
        console.error('');
        console.error('   Quick start options:');
        console.error('   • Run "tburn-validator setup" for guided setup (recommended)');
        console.error('   • Run "tburn-validator init" to create a basic configuration');
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
    // Check if private key references keystore
    const keystorePath = path.resolve('keystore.enc');
    const isKeystoreRef = config.validator.privateKey?.startsWith('keystore:');
    if (isKeystoreRef || (!config.validator.privateKey && fs.existsSync(keystorePath))) {
        console.log('🔐 Loading private key from encrypted keystore...');
        const password = await promptPassword('Enter keystore password: ');
        try {
            const keystore = new secure_keystore_1.SecureKeystore({
                path: keystorePath,
                autoLockTimeoutMs: 30 * 60 * 1000,
                maxDecryptionAttempts: 5,
            });
            const unlocked = await keystore.unlock(password);
            if (!unlocked) {
                console.error('❌ Invalid password or corrupted keystore');
                process.exit(1);
            }
            let privateKeyHex = null;
            if (isKeystoreRef) {
                // Extract keyId from reference
                const keyId = config.validator.privateKey.replace('keystore:', '');
                privateKeyHex = await keystore.exportPrivateKey(keyId);
            }
            else {
                // Try to find key by address
                const keyResult = await keystore.getKeyByAddress(config.validator.address);
                if (keyResult) {
                    privateKeyHex = keyResult.privateKey;
                }
            }
            if (!privateKeyHex) {
                console.error('❌ Private key not found in keystore');
                console.error('   Run "tburn-validator setup" to create a new validator');
                process.exit(1);
            }
            // Replace keystore reference with actual private key
            config.validator.privateKey = privateKeyHex;
            console.log('✅ Private key loaded and verified');
            console.log('');
        }
        catch (error) {
            console.error(`❌ Failed to unlock keystore: ${error.message}`);
            process.exit(1);
        }
    }
    else if (!config.validator.privateKey) {
        console.error('❌ No private key found in configuration or keystore');
        console.error('   Run "tburn-validator setup" to create a new validator');
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
    .argument('<action>', 'Action: generate, show, export, import, backup, restore')
    .option('-c, --config <file>', 'Configuration file path', 'validator.json')
    .option('--private-key <key>', 'Private key for import')
    .option('--output <file>', 'Output file for backup')
    .option('--input <file>', 'Input file for restore')
    .action(async (action, options) => {
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
            console.log('   Consider using "tburn-validator setup" for encrypted storage.');
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
            console.log(`   Name: ${config.validator.name}`);
            console.log(`   Address: ${config.validator.address}`);
            console.log(`   Public Key: ${config.validator.publicKey.substring(0, 60)}...`);
            console.log(`   Private Key: ${config.validator.privateKey ? '(stored in config)' : '(stored in keystore)'}`);
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
                name: config.validator.name,
                region: config.geo?.region,
            };
            console.log(JSON.stringify(exportData, null, 2));
            break;
        }
        case 'import': {
            if (!options.privateKey) {
                console.error('❌ Private key required. Use --private-key <key>');
                process.exit(1);
            }
            try {
                const cryptoManager = new keys_1.CryptoManager();
                cryptoManager.loadFromPrivateKey(options.privateKey);
                console.log('✅ Private key validated successfully!');
                console.log(`   Address: ${cryptoManager.getAddress()}`);
                console.log(`   Public Key: ${cryptoManager.getPublicKeyHex().substring(0, 60)}...`);
                console.log('');
                console.log('To create a configuration with this key, run:');
                console.log('   tburn-validator setup');
                console.log('   (choose "Import existing keys" when prompted)');
            }
            catch (error) {
                console.error(`❌ Invalid private key: ${error.message}`);
                process.exit(1);
            }
            break;
        }
        case 'backup': {
            const configPath = path.resolve(options.config);
            const keystorePath = path.resolve('keystore.enc');
            if (!fs.existsSync(configPath)) {
                console.error(`❌ Configuration file not found: ${configPath}`);
                process.exit(1);
            }
            const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            const backupData = {
                version: '1.0',
                createdAt: new Date().toISOString(),
                address: config.validator.address,
                publicKey: config.validator.publicKey,
                name: config.validator.name,
                region: config.geo?.region,
            };
            if (fs.existsSync(keystorePath)) {
                backupData.encryptedKeystore = fs.readFileSync(keystorePath, 'utf-8');
                backupData.keystoreType = 'encrypted';
            }
            else if (config.validator.privateKey) {
                console.log('⚠️  Warning: Private key is stored in plain text in config.');
                console.log('   Consider using "tburn-validator setup" for encrypted storage.');
                backupData.keystoreType = 'plaintext';
            }
            const outputFile = options.output || `backup-${config.validator.address.substring(0, 10)}-${Date.now()}.json`;
            fs.writeFileSync(outputFile, JSON.stringify(backupData, null, 2));
            console.log(`✅ Backup created: ${outputFile}`);
            console.log('   Store this file securely!');
            break;
        }
        case 'restore': {
            if (!options.input) {
                console.error('❌ Input file required. Use --input <file>');
                process.exit(1);
            }
            if (!fs.existsSync(options.input)) {
                console.error(`❌ Backup file not found: ${options.input}`);
                process.exit(1);
            }
            const backupData = JSON.parse(fs.readFileSync(options.input, 'utf-8'));
            console.log('📋 Backup Contents:');
            console.log(`   Address: ${backupData.address}`);
            console.log(`   Name: ${backupData.name}`);
            console.log(`   Region: ${backupData.region}`);
            console.log(`   Created: ${backupData.createdAt}`);
            console.log(`   Keystore Type: ${backupData.keystoreType}`);
            console.log('');
            if (backupData.encryptedKeystore) {
                const keystorePath = path.resolve('keystore.enc');
                fs.writeFileSync(keystorePath, backupData.encryptedKeystore);
                console.log(`✅ Keystore restored to: ${keystorePath}`);
            }
            console.log('');
            console.log('To complete restoration, run:');
            console.log('   tburn-validator init --name "' + backupData.name + '"');
            console.log('   (or use your existing validator.json if available)');
            break;
        }
        default:
            console.error(`Unknown action: ${action}`);
            console.log('Available actions: generate, show, export, import, backup, restore');
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
program
    .command('help-ko')
    .description('한국어 도움말 표시')
    .action(() => {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║           TBURN 검증자 노드 - 한국어 안내                    ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('📋 시작하기');
    console.log('─'.repeat(50));
    console.log('');
    console.log('1. 대화형 설정 (초보자 권장):');
    console.log('   $ tburn-validator setup');
    console.log('');
    console.log('2. 빠른 설정:');
    console.log('   $ tburn-validator init --name "내 검증자" --region asia-northeast1');
    console.log('');
    console.log('3. 검증자 시작:');
    console.log('   $ tburn-validator start --config validator.json');
    console.log('');
    console.log('📋 키 관리');
    console.log('─'.repeat(50));
    console.log('');
    console.log('• 새 키 생성:    tburn-validator keys generate');
    console.log('• 키 확인:       tburn-validator keys show');
    console.log('• 키 내보내기:   tburn-validator keys export');
    console.log('• 키 가져오기:   tburn-validator keys import --private-key <키>');
    console.log('• 백업 생성:     tburn-validator keys backup --output backup.json');
    console.log('• 백업 복원:     tburn-validator keys restore --input backup.json');
    console.log('');
    console.log('📋 상태 확인');
    console.log('─'.repeat(50));
    console.log('');
    console.log('• 노드 상태:     tburn-validator status');
    console.log('• 지원 지역:     tburn-validator regions');
    console.log('');
    console.log('⚠️  중요 사항');
    console.log('─'.repeat(50));
    console.log('');
    console.log('• 비밀키를 안전하게 보관하세요');
    console.log('• 검증자 시작 전 스테이크를 충전하세요');
    console.log('• 정기적으로 백업을 생성하세요');
    console.log('');
});
program.parse(process.argv);
//# sourceMappingURL=cli.js.map