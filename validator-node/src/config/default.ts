/**
 * TBURN Validator Node Default Configuration
 * Production-Grade Enterprise Defaults
 */

import { ValidatorNodeConfig } from './types';
import * as crypto from 'crypto';

export const DEFAULT_CONFIG: Omit<ValidatorNodeConfig, 'validator'> = {
  nodeId: crypto.randomUUID(),
  chainId: 5800,
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

export const GENESIS_VALIDATORS_REGIONS = [
  { region: 'asia-northeast1', datacenter: 'Seoul', count: 25 },
  { region: 'asia-northeast2', datacenter: 'Tokyo', count: 20 },
  { region: 'asia-southeast1', datacenter: 'Singapore', count: 15 },
  { region: 'us-east1', datacenter: 'New York', count: 20 },
  { region: 'us-west1', datacenter: 'Los Angeles', count: 15 },
  { region: 'europe-west1', datacenter: 'Frankfurt', count: 15 },
  { region: 'europe-west2', datacenter: 'London', count: 15 },
];

export const CHAIN_CONSTANTS = {
  CHAIN_ID: 5800,
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
