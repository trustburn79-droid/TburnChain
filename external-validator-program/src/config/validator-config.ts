/**
 * TBURN Validator Configuration
 * Loads and validates configuration from environment variables
 */

import * as crypto from 'crypto';

export type ValidatorTier = 'genesis' | 'pioneer' | 'standard' | 'community';
export type Network = 'mainnet' | 'testnet';

export interface ValidatorConfig {
  network: Network;
  chainId: number;
  validatorAddress: string;
  publicKey: string;
  validatorName: string;
  tier: ValidatorTier;
  nodeId: string;
  
  signerEndpoint: string;
  caCertPath: string;
  clientCertPath: string;
  clientKeyPath: string;
  
  gcpProjectId: string;
  gcpRegion: string;
  gcpSecretName: string;
  
  rpcEndpoint: string;
  wsEndpoint: string;
  bootnodes: string[];
  
  p2pPort: number;
  rpcPort: number;
  wsPort: number;
  metricsPort: number;
  
  stakeAmount: bigint;
  commissionRate: number;
  
  blockTimeMs: number;
  maxTxPerBlock: number;
  heartbeatIntervalMs: number;
  
  logLevel: string;
  enableCloudLogging: boolean;
  enableCloudMonitoring: boolean;
  enableMetrics: boolean;
  enableRateLimiting: boolean;
  maxSignRequestsPerSec: number;
}

export function loadConfig(): ValidatorConfig {
  const network = (process.env.TBURN_NETWORK || 'mainnet') as Network;
  const chainId = network === 'mainnet' ? 5800 : 5801;
  
  const validatorAddress = getRequiredEnv('VALIDATOR_ADDRESS');
  validateAddress(validatorAddress);
  
  const publicKey = getRequiredEnv('VALIDATOR_PUBLIC_KEY');
  
  const tier = (process.env.VALIDATOR_TIER || 'standard') as ValidatorTier;
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
    maxSignRequestsPerSec: parseInt(process.env.MAX_SIGN_REQUESTS_PER_SEC || '100')
  };
}

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}

function validateAddress(address: string): void {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error(`Invalid validator address format: ${address}`);
  }
}

function validateTier(tier: string): void {
  const validTiers = ['genesis', 'pioneer', 'standard', 'community'];
  if (!validTiers.includes(tier)) {
    throw new Error(`Invalid tier: ${tier}. Must be one of: ${validTiers.join(', ')}`);
  }
}

function getMinStakeForTier(tier: ValidatorTier): string {
  const minStakes: Record<ValidatorTier, string> = {
    genesis: '1000000',
    pioneer: '500000',
    standard: '200000',
    community: '100000'
  };
  return minStakes[tier];
}

function validateStakeForTier(stake: bigint, tier: ValidatorTier): void {
  const minStake = BigInt(getMinStakeForTier(tier));
  if (stake < minStake) {
    throw new Error(`Stake amount ${stake} is below minimum ${minStake} for tier ${tier}`);
  }
}

function generateNodeId(address: string): string {
  const hash = crypto.createHash('sha256').update(address + Date.now()).digest('hex');
  return `tburn-validator-${hash.slice(0, 16)}`;
}

function parseBootnodes(bootnodes: string): string[] {
  if (!bootnodes) return [];
  return bootnodes.split(',').map(node => node.trim()).filter(Boolean);
}

export const TIER_CONFIG = {
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
