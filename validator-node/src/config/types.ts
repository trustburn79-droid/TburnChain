/**
 * TBURN Validator Node Configuration Types
 * Enterprise Production-Grade Type Definitions
 */

export interface ValidatorNodeConfig {
  nodeId: string;
  chainId: number;
  networkId: string;
  
  validator: ValidatorConfig;
  network: NetworkConfig;
  consensus: ConsensusConfig;
  storage: StorageConfig;
  api: ApiConfig;
  monitoring: MonitoringConfig;
  security: SecurityConfig;
  geo: GeoConfig;
}

export interface ValidatorConfig {
  address: string;
  privateKey: string;
  publicKey: string;
  stake: string;
  commission: number;
  name: string;
  description: string;
  website?: string;
  contact?: string;
}

export interface NetworkConfig {
  listenHost: string;
  listenPort: number;
  rpcPort: number;
  wsPort: number;
  bootstrapPeers: string[];
  maxPeers: number;
  minPeers: number;
  connectionTimeout: number;
  heartbeatInterval: number;
  discoveryInterval: number;
  natTraversal: boolean;
}

export interface ConsensusConfig {
  blockTimeMs: number;
  maxBlockSize: number;
  maxTransactionsPerBlock: number;
  phaseTimeoutMs: number;
  viewChangeTimeoutMs: number;
  maxRoundsPerHeight: number;
  quorumNumerator: number;
  quorumDenominator: number;
}

export interface StorageConfig {
  dataDir: string;
  blockDbPath: string;
  stateDbPath: string;
  txPoolPath: string;
  pruneBlocks: boolean;
  pruneAfterBlocks: number;
  compactionInterval: number;
  cacheSize: number;
}

export interface ApiConfig {
  enabled: boolean;
  host: string;
  port: number;
  corsOrigins: string[];
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  authentication: {
    enabled: boolean;
    apiKeyHeader: string;
    apiKeys: string[];
  };
}

export interface MonitoringConfig {
  enabled: boolean;
  metricsPort: number;
  healthCheckInterval: number;
  alertWebhookUrl?: string;
  prometheusEnabled: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  logFormat: 'json' | 'text';
  logFile?: string;
}

export interface SecurityConfig {
  maxMempoolSize: number;
  maxPendingTxPerAccount: number;
  antiDdos: {
    enabled: boolean;
    maxConnectionsPerIp: number;
    banDurationMs: number;
  };
  quantumResistant: boolean;
  mevProtection: boolean;
}

export interface GeoConfig {
  region: string;
  datacenter: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface PeerInfo {
  nodeId: string;
  address: string;
  port: number;
  publicKey: string;
  region: string;
  latencyMs: number;
  lastSeen: number;
  isActive: boolean;
  protocolVersion: string;
}

export interface BlockHeader {
  height: number;
  hash: string;
  parentHash: string;
  stateRoot: string;
  transactionsRoot: string;
  receiptsRoot: string;
  timestamp: number;
  proposer: string;
  signature: string;
  shardId: number;
  chainId: number;
}

export interface Block extends BlockHeader {
  transactions: Transaction[];
  votes: Vote[];
  size: number;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  nonce: number;
  gasLimit: number;
  gasPrice: string;
  data: string;
  signature: string;
  timestamp: number;
  shardId: number;
}

export interface Vote {
  type: 'prevote' | 'precommit' | 'commit';
  height: number;
  round: number;
  blockHash: string;
  validatorAddress: string;
  signature: string;
  timestamp: number;
}

export interface ConsensusState {
  height: number;
  round: number;
  phase: ConsensusPhase;
  lockedRound: number;
  lockedBlockHash: string | null;
  validRound: number;
  validBlockHash: string | null;
}

export enum ConsensusPhase {
  IDLE = 0,
  PROPOSE = 1,
  PREVOTE = 2,
  PRECOMMIT = 3,
  COMMIT = 4,
  FINALIZE = 5
}

export interface NodeStatus {
  nodeId: string;
  version: string;
  chainId: number;
  networkId: string;
  isValidator: boolean;
  isSyncing: boolean;
  currentHeight: number;
  highestKnownHeight: number;
  peersCount: number;
  consensusState: ConsensusState;
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface ValidatorMetrics {
  blocksProposed: number;
  blocksMissed: number;
  votesSubmitted: number;
  uptime: number;
  latencyP50: number;
  latencyP95: number;
  latencyP99: number;
  rewardsEarned: string;
  slashingEvents: number;
  performanceScore: number;
}
