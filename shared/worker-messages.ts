export enum WorkerMessageType {
  INIT = 'INIT',
  INIT_COMPLETE = 'INIT_COMPLETE',
  PROCESS_BLOCK = 'PROCESS_BLOCK',
  BLOCK_RESULT = 'BLOCK_RESULT',
  CONSENSUS_ROUND = 'CONSENSUS_ROUND',
  CONSENSUS_RESULT = 'CONSENSUS_RESULT',
  SHARD_SNAPSHOT = 'SHARD_SNAPSHOT',
  SHARD_RESULT = 'SHARD_RESULT',
  VALIDATOR_ROTATION = 'VALIDATOR_ROTATION',
  ROTATION_RESULT = 'ROTATION_RESULT',
  CROSS_SHARD_MESSAGE = 'CROSS_SHARD_MESSAGE',
  CROSS_SHARD_RESULT = 'CROSS_SHARD_RESULT',
  HEALTH_CHECK = 'HEALTH_CHECK',
  HEALTH_RESPONSE = 'HEALTH_RESPONSE',
  SHUTDOWN = 'SHUTDOWN',
  ERROR = 'ERROR',
  METRICS_UPDATE = 'METRICS_UPDATE',
  BATCH_PERSIST = 'BATCH_PERSIST',
  BATCH_PERSIST_RESULT = 'BATCH_PERSIST_RESULT',
}

export interface WorkerMessage {
  type: WorkerMessageType;
  id: string;
  timestamp: number;
  payload: unknown;
}

export interface BlockProcessRequest {
  blockHeight: number;
  parentHash: string;
  shardId: number;
  transactions: TransactionData[];
  proposerValidatorId: string;
  epoch: number;
  round: number;
}

export interface TransactionData {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gasLimit: number;
  nonce: number;
  data?: string;
  shardId: number;
}

export interface BlockProcessResult {
  blockHash: string;
  blockHeight: number;
  shardId: number;
  stateRoot: string;
  transactionsRoot: string;
  receiptsRoot: string;
  gasUsed: number;
  timestamp: number;
  success: boolean;
  error?: string;
}

export interface ConsensusRoundRequest {
  roundNumber: number;
  epoch: number;
  blockHash: string;
  proposerId: string;
  validators: ValidatorVote[];
  phase: 'propose' | 'prevote' | 'precommit' | 'commit';
}

export interface ValidatorVote {
  validatorId: string;
  vote: boolean;
  signature: string;
  timestamp: number;
}

export interface ConsensusRoundResult {
  roundNumber: number;
  epoch: number;
  finalized: boolean;
  votesFor: number;
  votesAgainst: number;
  quorumReached: boolean;
  finalPhase: string;
  processingTimeMs: number;
}

export interface ShardSnapshotRequest {
  shardId: number;
  blockHeight: number;
  includeMetrics: boolean;
}

export interface ShardSnapshotResult {
  shardId: number;
  blockHeight: number;
  stateRoot: string;
  accountCount: number;
  storageBytes: number;
  tps: number;
  latency: number;
  pendingMessages: number;
}

export interface ValidatorRotationRequest {
  epoch: number;
  shardId: number;
  currentValidators: string[];
  rotationPercentage: number;
}

export interface ValidatorRotationResult {
  epoch: number;
  shardId: number;
  newCommittee: string[];
  rotatedOut: string[];
  rotatedIn: string[];
}

export interface CrossShardMessageRequest {
  messageId: string;
  sourceShardId: number;
  targetShardId: number;
  payload: string;
  priority: number;
  timestamp: number;
}

export interface CrossShardMessageResult {
  messageId: string;
  delivered: boolean;
  latencyMs: number;
  retries: number;
}

export interface HealthCheckResponse {
  workerId: number;
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  processedBlocks: number;
  processedConsensusRounds: number;
  memoryUsage: number;
  cpuUsage: number;
  lastHeartbeat: number;
}

export interface BatchPersistRequest {
  blocks: BlockProcessResult[];
  consensusRounds: ConsensusRoundResult[];
  shardSnapshots: ShardSnapshotResult[];
  crossShardMessages: CrossShardMessageResult[];
  metrics: MetricsData;
}

export interface MetricsData {
  timestamp: number;
  tps: number;
  blockTime: number;
  gasUsed: number;
  activeValidators: number;
  shardUtilization: Record<number, number>;
  mempool: {
    pending: number;
    queued: number;
    baseFee: string;
  };
}

export interface BatchPersistResult {
  success: boolean;
  blocksWritten: number;
  consensusRoundsWritten: number;
  shardSnapshotsWritten: number;
  crossShardMessagesWritten: number;
  duration: number;
  error?: string;
}

export interface WorkerPoolConfig {
  minWorkers: number;
  maxWorkers: number;
  idleTimeoutMs: number;
  healthCheckIntervalMs: number;
  restartOnFailure: boolean;
  maxRestarts: number;
  restartDelayMs: number;
}

export const DEFAULT_WORKER_POOL_CONFIG: WorkerPoolConfig = {
  minWorkers: 2,
  maxWorkers: 8,
  idleTimeoutMs: 30000,
  healthCheckIntervalMs: 5000,
  restartOnFailure: true,
  maxRestarts: 5,
  restartDelayMs: 1000,
};
