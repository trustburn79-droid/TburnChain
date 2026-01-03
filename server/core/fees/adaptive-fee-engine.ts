import { EventEmitter } from 'events';

interface ShardUtilization {
  shardId: number;
  gasUsed: bigint;
  gasLimit: bigint;
  utilizationRate: number;
  pendingTransactions: number;
  timestamp: number;
}

interface FeeConfig {
  minBaseFee: bigint;
  maxBaseFee: bigint;
  targetUtilization: number;
  baseFeeChangeDenominator: bigint;
  maxPriorityFeePerGas: bigint;
  elasticityMultiplier: number;
  historyWindowBlocks: number;
  crossShardHarmonizationWeight: number;
  mempoolBackpressureThreshold: number;
  surgePriceMultiplierMax: number;
}

interface BlockFeeData {
  blockHeight: number;
  shardId: number;
  baseFee: bigint;
  gasUsed: bigint;
  gasLimit: bigint;
  timestamp: number;
}

interface FeeEstimate {
  baseFee: bigint;
  priorityFee: bigint;
  maxFee: bigint;
  estimatedWaitBlocks: number;
  congestionLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface ShardFeeState {
  currentBaseFee: bigint;
  utilizationHistory: number[];
  gasHistory: { used: bigint; limit: bigint }[];
  lastUpdateBlock: number;
  pendingCount: number;
}

const DEFAULT_FEE_CONFIG: FeeConfig = {
  minBaseFee: BigInt('1000000000'),
  maxBaseFee: BigInt('500000000000'),
  targetUtilization: 0.5,
  baseFeeChangeDenominator: BigInt(8),
  maxPriorityFeePerGas: BigInt('100000000000'),
  elasticityMultiplier: 2,
  historyWindowBlocks: 20,
  crossShardHarmonizationWeight: 0.3,
  mempoolBackpressureThreshold: 1000,
  surgePriceMultiplierMax: 10,
};

const GWEI = BigInt('1000000000');

export class AdaptiveFeeEngine extends EventEmitter {
  private config: FeeConfig;
  private shardStates: Map<number, ShardFeeState> = new Map();
  private globalBaseFee: bigint;
  private networkCongestionScore: number = 0;
  private totalPendingTransactions: number = 0;
  
  private metrics = {
    totalFeeCalculations: 0,
    averageBaseFee: BigInt(0),
    peakBaseFee: BigInt(0),
    baseFeeUpdates: 0,
    backpressureEvents: 0,
    harmonizationAdjustments: 0,
  };

  constructor(config: Partial<FeeConfig> = {}) {
    super();
    this.config = { ...DEFAULT_FEE_CONFIG, ...config };
    this.globalBaseFee = this.config.minBaseFee;
  }

  initializeShard(shardId: number, initialBaseFee?: bigint): void {
    const baseFee = initialBaseFee || this.config.minBaseFee;
    
    this.shardStates.set(shardId, {
      currentBaseFee: baseFee,
      utilizationHistory: [],
      gasHistory: [],
      lastUpdateBlock: 0,
      pendingCount: 0,
    });
  }

  processBlock(data: BlockFeeData): bigint {
    let state = this.shardStates.get(data.shardId);
    
    if (!state) {
      this.initializeShard(data.shardId);
      state = this.shardStates.get(data.shardId)!;
    }
    
    const gasLimit = data.gasLimit > BigInt(0) ? data.gasLimit : BigInt(30000000);
    const utilizationRate = Number(data.gasUsed * BigInt(10000) / gasLimit) / 10000;
    
    state.utilizationHistory.push(utilizationRate);
    state.gasHistory.push({ used: data.gasUsed, limit: gasLimit });
    
    if (state.utilizationHistory.length > this.config.historyWindowBlocks) {
      state.utilizationHistory.shift();
      state.gasHistory.shift();
    }
    
    const newBaseFee = this.calculateNewBaseFee(state, utilizationRate);
    
    const harmonizedFee = this.applyGlobalHarmonization(data.shardId, newBaseFee);
    
    const finalFee = this.applyBackpressure(harmonizedFee, state.pendingCount);
    
    state.currentBaseFee = finalFee;
    state.lastUpdateBlock = data.blockHeight;
    
    this.updateGlobalMetrics();
    this.metrics.baseFeeUpdates++;
    
    this.emit('baseFeeUpdate', {
      shardId: data.shardId,
      blockHeight: data.blockHeight,
      oldBaseFee: state.currentBaseFee,
      newBaseFee: finalFee,
      utilizationRate,
    });
    
    return finalFee;
  }

  private calculateNewBaseFee(state: ShardFeeState, currentUtilization: number): bigint {
    const currentBaseFee = state.currentBaseFee;
    const targetUtilization = this.config.targetUtilization;
    
    const utilizationDelta = currentUtilization - targetUtilization;
    
    if (Math.abs(utilizationDelta) < 0.05) {
      return currentBaseFee;
    }
    
    const denominator = this.config.baseFeeChangeDenominator;
    let feeChange: bigint;
    
    if (utilizationDelta > 0) {
      const overUtilization = utilizationDelta / (1 - targetUtilization);
      const changeMultiplier = BigInt(Math.floor(overUtilization * 100));
      feeChange = (currentBaseFee * changeMultiplier) / (denominator * BigInt(100));
    } else {
      const underUtilization = Math.abs(utilizationDelta) / targetUtilization;
      const changeMultiplier = BigInt(Math.floor(underUtilization * 100));
      feeChange = (currentBaseFee * changeMultiplier) / (denominator * BigInt(100));
      feeChange = -feeChange;
    }
    
    let newBaseFee = currentBaseFee + feeChange;
    
    if (newBaseFee < this.config.minBaseFee) {
      newBaseFee = this.config.minBaseFee;
    } else if (newBaseFee > this.config.maxBaseFee) {
      newBaseFee = this.config.maxBaseFee;
    }
    
    return newBaseFee;
  }

  private applyGlobalHarmonization(shardId: number, localFee: bigint): bigint {
    const weight = this.config.crossShardHarmonizationWeight;
    
    let totalFee = BigInt(0);
    let count = 0;
    
    for (const [id, state] of this.shardStates) {
      if (id !== shardId) {
        totalFee += state.currentBaseFee;
        count++;
      }
    }
    
    if (count === 0) {
      return localFee;
    }
    
    const averageOtherFee = totalFee / BigInt(count);
    
    const localWeight = BigInt(Math.floor((1 - weight) * 1000));
    const globalWeight = BigInt(Math.floor(weight * 1000));
    
    const harmonizedFee = (localFee * localWeight + averageOtherFee * globalWeight) / BigInt(1000);
    
    if (harmonizedFee !== localFee) {
      this.metrics.harmonizationAdjustments++;
    }
    
    return harmonizedFee;
  }

  private applyBackpressure(baseFee: bigint, pendingCount: number): bigint {
    if (pendingCount <= this.config.mempoolBackpressureThreshold) {
      return baseFee;
    }
    
    const backpressureRatio = pendingCount / this.config.mempoolBackpressureThreshold;
    const multiplier = Math.min(backpressureRatio, this.config.surgePriceMultiplierMax);
    
    const surgedFee = baseFee * BigInt(Math.floor(multiplier * 100)) / BigInt(100);
    
    this.metrics.backpressureEvents++;
    
    return surgedFee > this.config.maxBaseFee ? this.config.maxBaseFee : surgedFee;
  }

  private updateGlobalMetrics(): void {
    let totalFee = BigInt(0);
    let maxFee = BigInt(0);
    let count = 0;
    
    for (const state of this.shardStates.values()) {
      totalFee += state.currentBaseFee;
      if (state.currentBaseFee > maxFee) {
        maxFee = state.currentBaseFee;
      }
      count++;
    }
    
    if (count > 0) {
      this.globalBaseFee = totalFee / BigInt(count);
      this.metrics.averageBaseFee = this.globalBaseFee;
      this.metrics.peakBaseFee = maxFee;
    }
    
    this.networkCongestionScore = this.calculateCongestionScore();
  }

  private calculateCongestionScore(): number {
    let totalUtilization = 0;
    let count = 0;
    
    for (const state of this.shardStates.values()) {
      if (state.utilizationHistory.length > 0) {
        const avgUtilization = 
          state.utilizationHistory.reduce((a, b) => a + b, 0) / 
          state.utilizationHistory.length;
        totalUtilization += avgUtilization;
        count++;
      }
    }
    
    if (count === 0) return 0;
    
    const avgUtilization = totalUtilization / count;
    
    const feeRatio = Number(this.globalBaseFee * BigInt(100) / this.config.maxBaseFee) / 100;
    
    const pendingRatio = Math.min(
      this.totalPendingTransactions / (this.config.mempoolBackpressureThreshold * this.shardStates.size),
      1
    );
    
    return (avgUtilization * 0.4 + feeRatio * 0.3 + pendingRatio * 0.3) * 100;
  }

  updateMempoolState(shardId: number, pendingCount: number): void {
    const state = this.shardStates.get(shardId);
    if (state) {
      state.pendingCount = pendingCount;
    }
    
    this.totalPendingTransactions = 0;
    for (const s of this.shardStates.values()) {
      this.totalPendingTransactions += s.pendingCount;
    }
  }

  estimateFee(shardId: number, priorityLevel: 'low' | 'medium' | 'high' = 'medium'): FeeEstimate {
    this.metrics.totalFeeCalculations++;
    
    const state = this.shardStates.get(shardId);
    const baseFee = state?.currentBaseFee || this.globalBaseFee;
    
    let priorityMultiplier: number;
    let estimatedWaitBlocks: number;
    
    switch (priorityLevel) {
      case 'low':
        priorityMultiplier = 0.8;
        estimatedWaitBlocks = 10;
        break;
      case 'high':
        priorityMultiplier = 2.0;
        estimatedWaitBlocks = 1;
        break;
      default:
        priorityMultiplier = 1.0;
        estimatedWaitBlocks = 3;
    }
    
    const priorityFee = BigInt(Math.floor(Number(GWEI) * 2 * priorityMultiplier));
    
    const maxFee = baseFee * BigInt(2) + priorityFee;
    
    let congestionLevel: 'low' | 'medium' | 'high' | 'critical';
    if (this.networkCongestionScore < 25) {
      congestionLevel = 'low';
    } else if (this.networkCongestionScore < 50) {
      congestionLevel = 'medium';
    } else if (this.networkCongestionScore < 75) {
      congestionLevel = 'high';
    } else {
      congestionLevel = 'critical';
    }
    
    return {
      baseFee,
      priorityFee,
      maxFee,
      estimatedWaitBlocks,
      congestionLevel,
    };
  }

  getShardFeeState(shardId: number): ShardFeeState | undefined {
    return this.shardStates.get(shardId);
  }

  getGlobalBaseFee(): bigint {
    return this.globalBaseFee;
  }

  getNetworkCongestionScore(): number {
    return this.networkCongestionScore;
  }

  getMetrics(): typeof this.metrics & {
    globalBaseFee: string;
    congestionScore: number;
    totalShards: number;
    totalPendingTransactions: number;
  } {
    return {
      ...this.metrics,
      averageBaseFee: this.metrics.averageBaseFee,
      peakBaseFee: this.metrics.peakBaseFee,
      globalBaseFee: this.globalBaseFee.toString(),
      congestionScore: this.networkCongestionScore,
      totalShards: this.shardStates.size,
      totalPendingTransactions: this.totalPendingTransactions,
    };
  }

  getAllShardFees(): Map<number, { baseFee: string; utilization: number; pending: number }> {
    const result = new Map();
    
    for (const [shardId, state] of this.shardStates) {
      const avgUtilization = state.utilizationHistory.length > 0
        ? state.utilizationHistory.reduce((a, b) => a + b, 0) / state.utilizationHistory.length
        : 0;
      
      result.set(shardId, {
        baseFee: state.currentBaseFee.toString(),
        utilization: avgUtilization,
        pending: state.pendingCount,
      });
    }
    
    return result;
  }
}

let feeEngineInstance: AdaptiveFeeEngine | null = null;

export function getAdaptiveFeeEngine(): AdaptiveFeeEngine {
  if (!feeEngineInstance) {
    feeEngineInstance = new AdaptiveFeeEngine();
  }
  return feeEngineInstance;
}

export function initializeAdaptiveFeeEngine(
  config?: Partial<FeeConfig>,
  shardCount: number = 5
): AdaptiveFeeEngine {
  if (!feeEngineInstance) {
    feeEngineInstance = new AdaptiveFeeEngine(config);
    
    for (let i = 0; i < shardCount; i++) {
      feeEngineInstance.initializeShard(i);
    }
    
    console.log(`⛽ AdaptiveFeeEngine: Initialized for ${shardCount} shards`);
  }
  return feeEngineInstance;
}
