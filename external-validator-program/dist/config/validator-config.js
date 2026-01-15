"use strict";
/**
 * TBURN Validator Configuration
 * Loads and validates configuration from environment variables
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
exports.TIER_CONFIG = void 0;
exports.loadConfig = loadConfig;
const crypto = __importStar(require("crypto"));
function loadConfig() {
    const network = (process.env.TBURN_NETWORK || 'mainnet');
    const chainId = network === 'mainnet' ? 5800 : 5801;
    const validatorAddress = getRequiredEnv('VALIDATOR_ADDRESS');
    validateAddress(validatorAddress);
    const publicKey = getRequiredEnv('VALIDATOR_PUBLIC_KEY');
    const tier = (process.env.VALIDATOR_TIER || 'standard');
    validateTier(tier);
    const stakeAmount = BigInt(process.env.STAKE_AMOUNT || getMinStakeForTier(tier));
    validateStakeForTier(stakeAmount, tier);
    const nodeId = process.env.NODE_ID || generateNodeId(validatorAddress);
    return {
        network,
        chainId,
        validatorAddress,
        publicKey,
        validatorName: process.env.VALIDATOR_NAME || 'TBurnValidator',
        tier,
        nodeId,
        signerEndpoint: getRequiredEnv('SIGNER_ENDPOINT'),
        caCertPath: process.env.SIGNER_CA_CERT_PATH || '/etc/tburn/certs/ca.crt',
        clientCertPath: process.env.CLIENT_CERT_PATH || '/etc/tburn/certs/client.crt',
        clientKeyPath: process.env.CLIENT_KEY_PATH || '/etc/tburn/certs/client.key',
        gcpProjectId: process.env.GCP_PROJECT_ID || 'tburn-mainnet-prod',
        gcpRegion: process.env.GCP_REGION || 'asia-northeast3',
        gcpSecretName: process.env.GCP_SECRET_NAME || '',
        rpcEndpoint: process.env.TBURN_RPC_ENDPOINT ||
            (network === 'mainnet' ? 'https://rpc.tburn.network' : 'https://testnet-rpc.tburn.network'),
        wsEndpoint: process.env.TBURN_WS_ENDPOINT ||
            (network === 'mainnet' ? 'wss://ws.tburn.network' : 'wss://testnet-ws.tburn.network'),
        bootnodes: parseBootnodes(process.env.TBURN_P2P_BOOTNODES || ''),
        p2pPort: parseInt(process.env.P2P_PORT || '30303'),
        rpcPort: parseInt(process.env.RPC_PORT || '8545'),
        wsPort: parseInt(process.env.WS_PORT || '8546'),
        metricsPort: parseInt(process.env.METRICS_PORT || '8080'),
        stakeAmount,
        commissionRate: parseFloat(process.env.COMMISSION_RATE || '0.10'),
        blockTimeMs: parseInt(process.env.BLOCK_TIME_MS || '100'),
        maxTxPerBlock: parseInt(process.env.MAX_TX_PER_BLOCK || '2000'),
        heartbeatIntervalMs: parseInt(process.env.HEARTBEAT_INTERVAL_MS || '30000'),
        logLevel: process.env.LOG_LEVEL || 'info',
        enableCloudLogging: process.env.ENABLE_CLOUD_LOGGING === 'true',
        enableCloudMonitoring: process.env.ENABLE_CLOUD_MONITORING === 'true',
        enableMetrics: process.env.ENABLE_METRICS !== 'false',
        enableRateLimiting: process.env.ENABLE_RATE_LIMITING !== 'false',
        maxSignRequestsPerSec: parseInt(process.env.MAX_SIGN_REQUESTS_PER_SEC || '100'),
        mainnetApiUrl: process.env.MAINNET_API_URL ||
            (network === 'mainnet' ? 'https://api.tburn.network' : 'https://testnet-api.tburn.network'),
        mainnetApiKey: process.env.MAINNET_API_KEY || '',
        enableSecuritySync: process.env.ENABLE_SECURITY_SYNC !== 'false',
        securitySyncIntervalMs: parseInt(process.env.SECURITY_SYNC_INTERVAL_MS || '60000'),
    };
}
function getRequiredEnv(key) {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Required environment variable ${key} is not set`);
    }
    return value;
}
function validateAddress(address) {
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        throw new Error(`Invalid validator address format: ${address}`);
    }
}
function validateTier(tier) {
    const validTiers = ['genesis', 'pioneer', 'standard', 'community'];
    if (!validTiers.includes(tier)) {
        throw new Error(`Invalid tier: ${tier}. Must be one of: ${validTiers.join(', ')}`);
    }
}
function getMinStakeForTier(tier) {
    const minStakes = {
        genesis: '1000000',
        pioneer: '500000',
        standard: '200000',
        community: '100000'
    };
    return minStakes[tier];
}
function validateStakeForTier(stake, tier) {
    const minStake = BigInt(getMinStakeForTier(tier));
    if (stake < minStake) {
        throw new Error(`Stake amount ${stake} is below minimum ${minStake} for tier ${tier}`);
    }
}
function generateNodeId(address) {
    const hash = crypto.createHash('sha256').update(address + Date.now()).digest('hex');
    return `tburn-validator-${hash.slice(0, 16)}`;
}
function parseBootnodes(bootnodes) {
    if (!bootnodes)
        return [];
    return bootnodes.split(',').map(node => node.trim()).filter(Boolean);
}
exports.TIER_CONFIG = {
    genesis: {
        minStake: 1000000n,
        maxSlots: 50,
        apyRange: '20-25%',
        commission: '1-5%',
        permissions: ['SIGN_BLOCK', 'SIGN_ATTESTATION', 'SIGN_GOVERNANCE', 'SIGN_WITHDRAWAL']
    },
    pioneer: {
        minStake: 500000n,
        maxSlots: 100,
        apyRange: '16-20%',
        commission: '5-15%',
        permissions: ['SIGN_BLOCK', 'SIGN_ATTESTATION', 'SIGN_GOVERNANCE']
    },
    standard: {
        minStake: 200000n,
        maxSlots: 150,
        apyRange: '14-18%',
        commission: '10-20%',
        permissions: ['SIGN_BLOCK', 'SIGN_ATTESTATION']
    },
    community: {
        minStake: 100000n,
        maxSlots: 75,
        apyRange: '12-15%',
        commission: '15-30%',
        permissions: ['SIGN_BLOCK', 'SIGN_ATTESTATION']
    }
};
//# sourceMappingURL=validator-config.js.map