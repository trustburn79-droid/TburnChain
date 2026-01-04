"use strict";
/**
 * TBURN Validator Node Default Configuration
 * Production-Grade Enterprise Defaults
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
exports.CHAIN_CONSTANTS = exports.GENESIS_VALIDATORS_REGIONS = exports.DEFAULT_CONFIG = void 0;
const crypto = __importStar(require("crypto"));
exports.DEFAULT_CONFIG = {
    nodeId: crypto.randomUUID(),
    chainId: 6000,
    networkId: 'tburn-mainnet',
    network: {
        listenHost: '0.0.0.0',
        listenPort: 26656,
        rpcPort: 8545,
        wsPort: 8546,
        bootstrapPeers: [
            'tcp://seed1.tburn.io:26656',
            'tcp://seed2.tburn.io:26656',
            'tcp://seed3.tburn.io:26656',
        ],
        maxPeers: 50,
        minPeers: 10,
        connectionTimeout: 10000,
        heartbeatInterval: 5000,
        discoveryInterval: 30000,
        natTraversal: true,
    },
    consensus: {
        blockTimeMs: 100,
        maxBlockSize: 5 * 1024 * 1024,
        maxTransactionsPerBlock: 10000,
        phaseTimeoutMs: 50,
        viewChangeTimeoutMs: 500,
        maxRoundsPerHeight: 10,
        quorumNumerator: 2,
        quorumDenominator: 3,
    },
    storage: {
        dataDir: './data',
        blockDbPath: './data/blocks',
        stateDbPath: './data/state',
        txPoolPath: './data/txpool',
        pruneBlocks: false,
        pruneAfterBlocks: 1000000,
        compactionInterval: 3600000,
        cacheSize: 512 * 1024 * 1024,
    },
    api: {
        enabled: true,
        host: '0.0.0.0',
        port: 8080,
        corsOrigins: ['*'],
        rateLimit: {
            windowMs: 60000,
            maxRequests: 1000,
        },
        authentication: {
            enabled: false,
            apiKeyHeader: 'X-API-Key',
            apiKeys: [],
        },
    },
    monitoring: {
        enabled: true,
        metricsPort: 9090,
        healthCheckInterval: 5000,
        prometheusEnabled: true,
        logLevel: 'info',
        logFormat: 'json',
    },
    security: {
        maxMempoolSize: 50000,
        maxPendingTxPerAccount: 100,
        antiDdos: {
            enabled: true,
            maxConnectionsPerIp: 10,
            banDurationMs: 300000,
        },
        quantumResistant: true,
        mevProtection: true,
    },
    geo: {
        region: 'unknown',
        datacenter: 'unknown',
        latitude: 0,
        longitude: 0,
        timezone: 'UTC',
    },
};
exports.GENESIS_VALIDATORS_REGIONS = [
    { region: 'asia-northeast1', datacenter: 'Seoul', count: 25 },
    { region: 'asia-northeast2', datacenter: 'Tokyo', count: 20 },
    { region: 'asia-southeast1', datacenter: 'Singapore', count: 15 },
    { region: 'us-east1', datacenter: 'New York', count: 20 },
    { region: 'us-west1', datacenter: 'Los Angeles', count: 15 },
    { region: 'europe-west1', datacenter: 'Frankfurt', count: 15 },
    { region: 'europe-west2', datacenter: 'London', count: 15 },
];
exports.CHAIN_CONSTANTS = {
    CHAIN_ID: 6000,
    NETWORK_ID: 'tburn-mainnet',
    GENESIS_BLOCK_HASH: '0x0000000000000000000000000000000000000000000000000000000000000000',
    GENESIS_TIMESTAMP: 1735689600000,
    BLOCK_TIME_MS: 100,
    EPOCH_BLOCKS: 1000,
    MAX_VALIDATORS: 125,
    MIN_STAKE: '1000000000000000000000000',
    TOTAL_SUPPLY: '1000000000000000000000000000',
    DECIMALS: 18,
    SYMBOL: 'TBURN',
    NAME: 'TBURN Token',
};
//# sourceMappingURL=default.js.map