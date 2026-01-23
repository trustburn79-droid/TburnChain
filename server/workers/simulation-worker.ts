import { parentPort, workerData } from 'worker_threads';
import * as crypto from 'crypto';
import {
  WorkerMessage,
  WorkerMessageType,
  BlockProcessRequest,
  BlockProcessResult,
  ConsensusRoundRequest,
  ConsensusRoundResult,
  ShardSnapshotRequest,
  ShardSnapshotResult,
  ValidatorRotationRequest,
  ValidatorRotationResult,
  CrossShardMessageRequest,
  CrossShardMessageResult,
  HealthCheckResponse,
} from '@shared/worker-messages';

interface WorkerState {
  workerId: number;
  startTime: number;
  processedBlocks: number;
  processedConsensusRounds: number;
  isHealthy: boolean;
  lastHeartbeat: number;
}

const state: WorkerState = {
  workerId: workerData?.workerId || 0,
  startTime: Date.now(),
  processedBlocks: 0,
  processedConsensusRounds: 0,
  isHealthy: true,
  lastHeartbeat: Date.now(),
};

const hashBuffer = Buffer.alloc(32);

function generateHash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function generateMerkleRoot(hashes: string[]): string {
  if (hashes.length === 0) return 'bh1' + '0'.repeat(64);
  if (hashes.length === 1) return hashes[0];
  
  const pairs: string[] = [];
  for (let i = 0; i < hashes.length; i += 2) {
    const left = hashes[i];
    const right = hashes[i + 1] || left;
    pairs.push(generateHash(left + right));
  }
  return generateMerkleRoot(pairs);
}

function processBlock(request: BlockProcessRequest): BlockProcessResult {
  const startTime = Date.now();
  
  try {
    const txHashes = request.transactions.map(tx => tx.hash);
    const transactionsRoot = generateMerkleRoot(txHashes);
    
    const totalGas = request.transactions.reduce((sum, tx) => sum + tx.gasLimit, 0);
    
    const stateRoot = generateHash(
      `${request.blockHeight}:${request.shardId}:${Date.now()}:${request.parentHash}`
    );
    
    const receiptsRoot = generateHash(
      `receipts:${request.blockHeight}:${txHashes.join(',')}`
    );
    
    const blockHash = generateHash(
      `${request.parentHash}:${stateRoot}:${transactionsRoot}:${receiptsRoot}:${request.blockHeight}`
    );
    
    state.processedBlocks++;
    
    return {
      blockHash: 'bh1' + blockHash,
      blockHeight: request.blockHeight,
      shardId: request.shardId,
      stateRoot: 'sr1' + stateRoot,
      transactionsRoot: 'th1' + transactionsRoot,
      receiptsRoot: 'rr1' + receiptsRoot,
      gasUsed: totalGas,
      timestamp: Date.now(),
      success: true,
    };
  } catch (error) {
    return {
      blockHash: '',
      blockHeight: request.blockHeight,
      shardId: request.shardId,
      stateRoot: '',
      transactionsRoot: '',
      receiptsRoot: '',
      gasUsed: 0,
      timestamp: Date.now(),
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function processConsensusRound(request: ConsensusRoundRequest): ConsensusRoundResult {
  const startTime = Date.now();
  
  const votesFor = request.validators.filter(v => v.vote).length;
  const votesAgainst = request.validators.length - votesFor;
  const quorumThreshold = Math.ceil(request.validators.length * 0.67);
  const quorumReached = votesFor >= quorumThreshold;
  
  state.processedConsensusRounds++;
  
  return {
    roundNumber: request.roundNumber,
    epoch: request.epoch,
    finalized: quorumReached && request.phase === 'commit',
    votesFor,
    votesAgainst,
    quorumReached,
    finalPhase: request.phase,
    processingTimeMs: Date.now() - startTime,
  };
}

function processShardSnapshot(request: ShardSnapshotRequest): ShardSnapshotResult {
  const baseAccounts = 50000 + request.shardId * 10000;
  const randomVariation = Math.floor(Math.random() * 5000);
  
  return {
    shardId: request.shardId,
    blockHeight: request.blockHeight,
    stateRoot: 'sr1' + generateHash(`shard:${request.shardId}:${request.blockHeight}:${Date.now()}`),
    accountCount: baseAccounts + randomVariation,
    storageBytes: (baseAccounts + randomVariation) * 256,
    tps: 3000 + Math.floor(Math.random() * 500),
    latency: 15 + Math.floor(Math.random() * 10),
    pendingMessages: Math.floor(Math.random() * 50),
  };
}

function processValidatorRotation(request: ValidatorRotationRequest): ValidatorRotationResult {
  const rotationCount = Math.ceil(request.currentValidators.length * request.rotationPercentage);
  const shuffled = [...request.currentValidators].sort(() => Math.random() - 0.5);
  
  const rotatedOut = shuffled.slice(0, rotationCount);
  const rotatedIn = Array.from({ length: rotationCount }, (_, i) => 
    `new-validator-${request.epoch}-${request.shardId}-${i}`
  );
  
  const newCommittee = [
    ...shuffled.slice(rotationCount),
    ...rotatedIn,
  ];
  
  return {
    epoch: request.epoch,
    shardId: request.shardId,
    newCommittee,
    rotatedOut,
    rotatedIn,
  };
}

function processCrossShardMessage(request: CrossShardMessageRequest): CrossShardMessageResult {
  const baseLatency = Math.abs(request.targetShardId - request.sourceShardId) * 5;
  const networkJitter = Math.random() * 10;
  
  return {
    messageId: request.messageId,
    delivered: true,
    latencyMs: Math.floor(baseLatency + networkJitter),
    retries: Math.random() > 0.95 ? 1 : 0,
  };
}

function getHealthStatus(): HealthCheckResponse {
  const memUsage = process.memoryUsage();
  // ★ [2026-01-08] V8 힙 제한 사용
  let heapLimitBytes = memUsage.heapTotal;
  try {
    const v8 = require('v8');
    heapLimitBytes = v8.getHeapStatistics().heap_size_limit;
  } catch {}
  
  return {
    workerId: state.workerId,
    status: state.isHealthy ? 'healthy' : 'degraded',
    uptime: Date.now() - state.startTime,
    processedBlocks: state.processedBlocks,
    processedConsensusRounds: state.processedConsensusRounds,
    memoryUsage: memUsage.heapUsed / heapLimitBytes,
    cpuUsage: 0,
    lastHeartbeat: state.lastHeartbeat,
  };
}

function sendMessage(message: WorkerMessage): void {
  if (parentPort) {
    parentPort.postMessage(message);
  }
}

function handleMessage(message: WorkerMessage): void {
  state.lastHeartbeat = Date.now();
  
  try {
    switch (message.type) {
      case WorkerMessageType.INIT:
        sendMessage({
          type: WorkerMessageType.INIT_COMPLETE,
          id: message.id,
          timestamp: Date.now(),
          payload: { workerId: state.workerId },
        });
        break;
        
      case WorkerMessageType.PROCESS_BLOCK:
        const blockResult = processBlock(message.payload as BlockProcessRequest);
        sendMessage({
          type: WorkerMessageType.BLOCK_RESULT,
          id: message.id,
          timestamp: Date.now(),
          payload: blockResult,
        });
        break;
        
      case WorkerMessageType.CONSENSUS_ROUND:
        const consensusResult = processConsensusRound(message.payload as ConsensusRoundRequest);
        sendMessage({
          type: WorkerMessageType.CONSENSUS_RESULT,
          id: message.id,
          timestamp: Date.now(),
          payload: consensusResult,
        });
        break;
        
      case WorkerMessageType.SHARD_SNAPSHOT:
        const snapshotResult = processShardSnapshot(message.payload as ShardSnapshotRequest);
        sendMessage({
          type: WorkerMessageType.SHARD_RESULT,
          id: message.id,
          timestamp: Date.now(),
          payload: snapshotResult,
        });
        break;
        
      case WorkerMessageType.VALIDATOR_ROTATION:
        const rotationResult = processValidatorRotation(message.payload as ValidatorRotationRequest);
        sendMessage({
          type: WorkerMessageType.ROTATION_RESULT,
          id: message.id,
          timestamp: Date.now(),
          payload: rotationResult,
        });
        break;
        
      case WorkerMessageType.CROSS_SHARD_MESSAGE:
        const crossShardResult = processCrossShardMessage(message.payload as CrossShardMessageRequest);
        sendMessage({
          type: WorkerMessageType.CROSS_SHARD_RESULT,
          id: message.id,
          timestamp: Date.now(),
          payload: crossShardResult,
        });
        break;
        
      case WorkerMessageType.HEALTH_CHECK:
        sendMessage({
          type: WorkerMessageType.HEALTH_RESPONSE,
          id: message.id,
          timestamp: Date.now(),
          payload: getHealthStatus(),
        });
        break;
        
      case WorkerMessageType.SHUTDOWN:
        state.isHealthy = false;
        sendMessage({
          type: WorkerMessageType.SHUTDOWN,
          id: message.id,
          timestamp: Date.now(),
          payload: { acknowledged: true, workerId: state.workerId },
        });
        process.exit(0);
        break;
        
      default:
        sendMessage({
          type: WorkerMessageType.ERROR,
          id: message.id,
          timestamp: Date.now(),
          payload: { error: `Unknown message type: ${message.type}` },
        });
    }
  } catch (error) {
    sendMessage({
      type: WorkerMessageType.ERROR,
      id: message.id,
      timestamp: Date.now(),
      payload: { 
        error: error instanceof Error ? error.message : 'Unknown error',
        workerId: state.workerId 
      },
    });
  }
}

if (parentPort) {
  parentPort.on('message', handleMessage);
  
  sendMessage({
    type: WorkerMessageType.INIT_COMPLETE,
    id: 'startup',
    timestamp: Date.now(),
    payload: { 
      workerId: state.workerId,
      message: `Worker ${state.workerId} initialized and ready` 
    },
  });
}

process.on('uncaughtException', (error) => {
  console.error(`Worker ${state.workerId} uncaught exception:`, error);
  state.isHealthy = false;
  if (parentPort) {
    sendMessage({
      type: WorkerMessageType.ERROR,
      id: 'uncaughtException',
      timestamp: Date.now(),
      payload: { error: error.message, fatal: true, workerId: state.workerId },
    });
  }
});

process.on('unhandledRejection', (reason) => {
  console.error(`Worker ${state.workerId} unhandled rejection:`, reason);
});
