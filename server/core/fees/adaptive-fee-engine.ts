import { EventEmitter } from 'events';

// ============================================================================
// Enterprise Configuration Types
// ============================================================================

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
  // Enterprise additions
  twapWindowBlocks: number;
  enableBlobFees: boolean;
  blobBaseFee: bigint;
  blobTargetBlobsPerBlock: number;
  maxBlobsPerBlock: number;
  enablePrediction: boolean;
  predictionHorizonBlocks: number;
}

interface BlockFeeData {
  blockHeight: number;
  shardId: number;
  baseFee: bigint;
  gasUsed: bigint;
  gasLimit: bigint;
  timestamp: number;
  blobGasUsed?: bigint;
  blobGasLimit?: bigint;
}

interface FeeEstimate {
  baseFee: bigint;
  priorityFee: bigint;
  maxFee: bigint;
  estimatedWaitBlocks: number;
  congestionLevel: CongestionLevel;
  // Enterprise additions
  twapBaseFee: bigint;
  predictedBaseFee: bigint;
  blobBaseFee: bigint;
  confidence: number;
}

interface ShardFeeState {
  currentBaseFee: bigint;
  utilizationHistory: number[];
  gasHistory: { used: bigint; limit: bigint }[];
  baseFeeHistory: { fee: bigint; timestamp: number }[];
  lastUpdateBlock: number;
  pendingCount: number;
  // Enterprise additions
  twapBaseFee: bigint;
  volatility: number;
  trendDirection: 'up' | 'down' | 'stable';
  blobBaseFee: bigint;
  blobGasHistory: { used: bigint; limit: bigint }[];
}

type CongestionLevel = 'low' | 'medium' | 'high' | 'critical';

// ============================================================================
// Fee Prediction Engine (TWAP + ML-lite)
// ============================================================================

interface FeePrediction {
  predictedBaseFee: bigint;
  confidence: number;
  trendDirection: 'up' | 'down' | 'stable';
  volatility: number;
  predictedCongestion: CongestionLevel;
}

class FeePredictionEngine {
  private readonly windowSize: number;
  private readonly predictionHorizon: number;
  
  constructor(windowSize: number = 20, predictionHorizon: number = 5) {
    this.windowSize = windowSize;
    this.predictionHorizon = predictionHorizon;
  }
  
  calculateTWAP(baseFeeHistory: { fee: bigint; timestamp: number }[]): bigint {
    if (baseFeeHistory.length === 0) {
      return BigInt('1000000000');
    }
    
    if (baseFeeHistory.length === 1) {
      return baseFeeHistory[0].fee;
    }
    
    const recentHistory = baseFeeHistory.slice(-this.windowSize);
    let weightedSum = BigInt(0);
    let totalWeight = BigInt(0);
    
    for (let i = 0; i < recentHistory.length - 1; i++) {
      const timeDelta = BigInt(recentHistory[i + 1].timestamp - recentHistory[i].timestamp);
      const weight = timeDelta > BigInt(0) ? timeDelta : BigInt(1);
      weightedSum += recentHistory[i].fee * weight;
      totalWeight += weight;
    }
    
    // Add last entry
    const lastEntry = recentHistory[recentHistory.length - 1];
    const lastWeight = BigInt(100); // Default weight for last entry
    weightedSum += lastEntry.fee * lastWeight;
    totalWeight += lastWeight;
    
    return totalWeight > BigInt(0) ? weightedSum / totalWeight : BigInt('1000000000');
  }
  
  predict(state: ShardFeeState): FeePrediction {
    const history = state.baseFeeHistory;
    
    if (history.length < 3) {
      return {
        predictedBaseFee: state.currentBaseFee,
        confidence: 0.5,
        trendDirection: 'stable',
        volatility: 0,
        predictedCongestion: 'low',
      };
    }
    
    // Calculate trend using linear regression
    const recentHistory = history.slice(-this.windowSize);
    const n = recentHistory.length;
    
    let sumX = 0;
    let sumY = BigInt(0);
    let sumXY = BigInt(0);
    let sumX2 = 0;
    
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += recentHistory[i].fee;
      sumXY += recentHistory[i].fee * BigInt(i);
      sumX2 += i * i;
    }
    
    // Calculate slope
    const denominator = n * sumX2 - sumX * sumX;
    const slope = denominator !== 0 
      ? Number((BigInt(n) * sumXY - BigInt(sumX) * sumY) / BigInt(denominator)) / Number(sumY / BigInt(n))
      : 0;
    
    // Determine trend direction
    let trendDirection: 'up' | 'down' | 'stable';
    if (slope > 0.01) trendDirection = 'up';
    else if (slope < -0.01) trendDirection = 'down';
    else trendDirection = 'stable';
    
    // Calculate volatility
    const avgFee = sumY / BigInt(n);
    let variance = BigInt(0);
    for (const entry of recentHistory) {
      const diff = entry.fee > avgFee ? entry.fee - avgFee : avgFee - entry.fee;
      variance += diff * diff;
    }
    const stdDev = Math.sqrt(Number(variance / BigInt(n)));
    const volatility = avgFee > BigInt(0) ? stdDev / Number(avgFee) : 0;
    
    // Predict future base fee
    const currentFee = state.currentBaseFee;
    const predictionMultiplier = 1 + (slope * this.predictionHorizon);
    const predictedFee = BigInt(Math.floor(Number(currentFee) * predictionMultiplier));
    
    // Calculate confidence based on volatility
    const confidence = Math.max(0.3, Math.min(0.95, 1 - volatility));
    
    // Predict congestion
    const avgUtilization = state.utilizationHistory.length > 0
      ? state.utilizationHistory.reduce((a: number, b: number) => a + b, 0) / state.utilizationHistory.length
      : 0;
    
    let predictedCongestion: CongestionLevel;
    const predictedUtilization = avgUtilization * (1 + slope * 0.5);
    if (predictedUtilization < 0.4) predictedCongestion = 'low';
    else if (predictedUtilization < 0.6) predictedCongestion = 'medium';
    else if (predictedUtilization < 0.8) predictedCongestion = 'high';
    else predictedCongestion = 'critical';
    
    return {
      predictedBaseFee: predictedFee,
      confidence,
      trendDirection,
      volatility,
      predictedCongestion,
    };
  }
}

// ============================================================================
// EIP-4844 Blob Fee Calculator
// ============================================================================

class BlobFeeCalculator {
  private readonly minBlobBaseFee: bigint = BigInt(1);
  private readonly blobBaseFeeUpdateFraction: bigint = BigInt(3338477);
  
  calculateBlobBaseFee(
    parentBlobBaseFee: bigint,
    parentBlobGasUsed: bigint,
    parentBlobGasTarget: bigint
  ): bigint {
    if (parentBlobGasUsed === parentBlobGasTarget) {
      return parentBlobBaseFee;
    }
    
    if (parentBlobGasUsed > parentBlobGasTarget) {
      const excess = parentBlobGasUsed - parentBlobGasTarget;
      const increase = (parentBlobBaseFee * excess) / this.blobBaseFeeUpdateFraction;
      return parentBlobBaseFee + (increase > BigInt(1) ? increase : BigInt(1));
    } else {
      const deficit = parentBlobGasTarget - parentBlobGasUsed;
      const decrease = (parentBlobBaseFee * deficit) / this.blobBaseFeeUpdateFraction;
      const newFee = parentBlobBaseFee - decrease;
      return newFee > this.minBlobBaseFee ? newFee : this.minBlobBaseFee;
    }
  }
  
  estimateBlobGas(blobCount: number): bigint {
    const BLOB_GAS_PER_BLOB = BigInt(131072); // 2^17
    return BigInt(blobCount) * BLOB_GAS_PER_BLOB;
  }
}

// ============================================================================
// Congestion Analyzer
// ============================================================================

interface CongestionAnalysis {
  level: CongestionLevel;
  score: number;
  breakdown: {
    utilizationScore: number;
    feeScore: number;
    mempoolScore: number;
    trendScore: number;
  };
  recommendation: string;
  predictedDuration: number; // blocks until congestion clears
}

class CongestionAnalyzer {
  analyze(
    shardStates: Map<number, ShardFeeState>,
    globalBaseFee: bigint,
    maxBaseFee: bigint,
    mempoolThreshold: number
  ): CongestionAnalysis {
    const shardArray = Array.from(shardStates.values());
    
    // Calculate utilization score
    let totalUtilization = 0;
    let shardCount = 0;
    for (const state of shardArray) {
      if (state.utilizationHistory.length > 0) {
        const avgUtilization = state.utilizationHistory.reduce((a: number, b: number) => a + b, 0) / state.utilizationHistory.length;
        totalUtilization += avgUtilization;
        shardCount++;
      }
    }
    const avgUtilization = shardCount > 0 ? totalUtilization / shardCount : 0;
    const utilizationScore = avgUtilization * 100;
    
    // Calculate fee score
    const feeRatio = Number(globalBaseFee * BigInt(100) / maxBaseFee);
    const feeScore = feeRatio;
    
    // Calculate mempool score
    let totalPending = 0;
    for (const state of shardArray) {
      totalPending += state.pendingCount;
    }
    const mempoolRatio = Math.min(totalPending / (mempoolThreshold * shardArray.length), 1);
    const mempoolScore = mempoolRatio * 100;
    
    // Calculate trend score
    let upwardTrends = 0;
    for (const state of shardArray) {
      if (state.trendDirection === 'up') upwardTrends++;
    }
    const trendScore = shardArray.length > 0 ? (upwardTrends / shardArray.length) * 100 : 0;
    
    // Calculate overall score
    const score = (utilizationScore * 0.35) + (feeScore * 0.25) + (mempoolScore * 0.25) + (trendScore * 0.15);
    
    // Determine level
    let level: CongestionLevel;
    if (score < 25) level = 'low';
    else if (score < 50) level = 'medium';
    else if (score < 75) level = 'high';
    else level = 'critical';
    
    // Generate recommendation
    let recommendation: string;
    let predictedDuration: number;
    
    switch (level) {
      case 'low':
        recommendation = 'Network is operating normally. Low priority transactions will clear quickly.';
        predictedDuration = 1;
        break;
      case 'medium':
        recommendation = 'Moderate congestion. Consider using priority fees for faster confirmation.';
        predictedDuration = 3;
        break;
      case 'high':
        recommendation = 'High congestion. Recommend increasing priority fee or waiting for lower activity.';
        predictedDuration = 10;
        break;
      case 'critical':
        recommendation = 'Critical congestion. Only urgent transactions should be submitted. Consider significant priority fee increase.';
        predictedDuration = 25;
        break;
    }
    
    return {
      level,
      score,
      breakdown: {
        utilizationScore,
        feeScore,
        mempoolScore,
        trendScore,
      },
      recommendation,
      predictedDuration,
    };
  }
}

// ============================================================================
// Default Configuration
// ============================================================================

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
  // Enterprise defaults
  twapWindowBlocks: 20,
  enableBlobFees: true,
  blobBaseFee: BigInt('1000000000'),
  blobTargetBlobsPerBlock: 3,
  maxBlobsPerBlock: 6,
  enablePrediction: true,
  predictionHorizonBlocks: 5,
};

const GWEI = BigInt('1000000000');

// ============================================================================
// Main Adaptive Fee Engine (Enterprise Enhanced)
// ============================================================================

export class AdaptiveFeeEngine extends EventEmitter {
  private config: FeeConfig;
  private shardStates: Map<number, ShardFeeState> = new Map();
  private globalBaseFee: bigint;
  private networkCongestionScore: number = 0;
  private totalPendingTransactions: number = 0;
  
  // Enterprise components
  private predictionEngine: FeePredictionEngine;
  private blobFeeCalculator: BlobFeeCalculator;
  private congestionAnalyzer: CongestionAnalyzer;
  private globalBlobBaseFee: bigint;
  
  private metrics = {
    totalFeeCalculations: 0,
    averageBaseFee: BigInt(0),
    peakBaseFee: BigInt(0),
    baseFeeUpdates: 0,
    backpressureEvents: 0,
    harmonizationAdjustments: 0,
    // Enterprise metrics
    twapCalculations: 0,
    predictions: 0,
    blobFeeUpdates: 0,
    accuratePredictions: 0,
    predictionAccuracy: 0,
  };

  constructor(config: Partial<FeeConfig> = {}) {
    super();
    this.config = { ...DEFAULT_FEE_CONFIG, ...config };
    this.globalBaseFee = this.config.minBaseFee;
    this.globalBlobBaseFee = this.config.blobBaseFee;
    
    // Initialize enterprise components
    this.predictionEngine = new FeePredictionEngine(
      this.config.twapWindowBlocks,
      this.config.predictionHorizonBlocks
    );
    this.blobFeeCalculator = new BlobFeeCalculator();
    this.congestionAnalyzer = new CongestionAnalyzer();
  }

  initializeShard(shardId: number, initialBaseFee?: bigint): void {
    const baseFee = initialBaseFee || this.config.minBaseFee;
    
    this.shardStates.set(shardId, {
      currentBaseFee: baseFee,
      utilizationHistory: [],
      gasHistory: [],
      baseFeeHistory: [{ fee: baseFee, timestamp: Date.now() }],
      lastUpdateBlock: 0,
      pendingCount: 0,
      // Enterprise fields
      twapBaseFee: baseFee,
      volatility: 0,
      trendDirection: 'stable',
      blobBaseFee: this.config.blobBaseFee,
      blobGasHistory: [],
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
    
    // Update history
    state.utilizationHistory.push(utilizationRate);
    state.gasHistory.push({ used: data.gasUsed, limit: gasLimit });
    
    if (state.utilizationHistory.length > this.config.historyWindowBlocks) {
      state.utilizationHistory.shift();
      state.gasHistory.shift();
    }
    
    // Calculate new base fee
    const newBaseFee = this.calculateNewBaseFee(state, utilizationRate);
    
    // Apply harmonization
    const harmonizedFee = this.applyGlobalHarmonization(data.shardId, newBaseFee);
    
    // Apply backpressure
    const finalFee = this.applyBackpressure(harmonizedFee, state.pendingCount);
    
    // Update state
    state.currentBaseFee = finalFee;
    state.lastUpdateBlock = data.blockHeight;
    state.baseFeeHistory.push({ fee: finalFee, timestamp: data.timestamp });
    
    // Trim history
    if (state.baseFeeHistory.length > this.config.twapWindowBlocks * 2) {
      state.baseFeeHistory.shift();
    }
    
    // Calculate TWAP
    state.twapBaseFee = this.predictionEngine.calculateTWAP(state.baseFeeHistory);
    this.metrics.twapCalculations++;
    
    // Update prediction
    if (this.config.enablePrediction) {
      const prediction = this.predictionEngine.predict(state);
      state.volatility = prediction.volatility;
      state.trendDirection = prediction.trendDirection;
      this.metrics.predictions++;
    }
    
    // Process blob fees if enabled
    if (this.config.enableBlobFees && data.blobGasUsed !== undefined && data.blobGasLimit !== undefined) {
      const blobGasTarget = data.blobGasLimit / BigInt(2);
      state.blobBaseFee = this.blobFeeCalculator.calculateBlobBaseFee(
        state.blobBaseFee,
        data.blobGasUsed,
        blobGasTarget
      );
      state.blobGasHistory.push({ used: data.blobGasUsed, limit: data.blobGasLimit });
      
      if (state.blobGasHistory.length > this.config.historyWindowBlocks) {
        state.blobGasHistory.shift();
      }
      
      this.metrics.blobFeeUpdates++;
    }
    
    this.updateGlobalMetrics();
    this.metrics.baseFeeUpdates++;
    
    this.emit('baseFeeUpdate', {
      shardId: data.shardId,
      blockHeight: data.blockHeight,
      oldBaseFee: state.currentBaseFee.toString(),
      newBaseFee: finalFee.toString(),
      twapBaseFee: state.twapBaseFee.toString(),
      utilizationRate,
      trendDirection: state.trendDirection,
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
    
    const entries = Array.from(this.shardStates.entries());
    for (const [id, state] of entries) {
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
    let totalBlobFee = BigInt(0);
    let maxFee = BigInt(0);
    let count = 0;
    
    const values = Array.from(this.shardStates.values());
    for (const state of values) {
      totalFee += state.currentBaseFee;
      totalBlobFee += state.blobBaseFee;
      if (state.currentBaseFee > maxFee) {
        maxFee = state.currentBaseFee;
      }
      count++;
    }
    
    if (count > 0) {
      this.globalBaseFee = totalFee / BigInt(count);
      this.globalBlobBaseFee = totalBlobFee / BigInt(count);
      this.metrics.averageBaseFee = this.globalBaseFee;
      this.metrics.peakBaseFee = maxFee;
    }
    
    this.networkCongestionScore = this.calculateCongestionScore();
  }

  private calculateCongestionScore(): number {
    let totalUtilization = 0;
    let count = 0;
    
    const values = Array.from(this.shardStates.values());
    for (const state of values) {
      if (state.utilizationHistory.length > 0) {
        const avgUtilization = state.utilizationHistory.reduce((a: number, b: number) => a + b, 0) / state.utilizationHistory.length;
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
    const values = Array.from(this.shardStates.values());
    for (const s of values) {
      this.totalPendingTransactions += s.pendingCount;
    }
  }

  estimateFee(shardId: number, priorityLevel: 'low' | 'medium' | 'high' = 'medium'): FeeEstimate {
    this.metrics.totalFeeCalculations++;
    
    const state = this.shardStates.get(shardId);
    const baseFee = state?.currentBaseFee || this.globalBaseFee;
    const twapBaseFee = state?.twapBaseFee || baseFee;
    const blobBaseFee = state?.blobBaseFee || this.globalBlobBaseFee;
    
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
    
    // Get prediction
    let predictedBaseFee = baseFee;
    let confidence = 0.5;
    
    if (this.config.enablePrediction && state) {
      const prediction = this.predictionEngine.predict(state);
      predictedBaseFee = prediction.predictedBaseFee;
      confidence = prediction.confidence;
    }
    
    let congestionLevel: CongestionLevel;
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
      twapBaseFee,
      predictedBaseFee,
      blobBaseFee,
      confidence,
    };
  }

  getCongestionAnalysis(): CongestionAnalysis {
    return this.congestionAnalyzer.analyze(
      this.shardStates,
      this.globalBaseFee,
      this.config.maxBaseFee,
      this.config.mempoolBackpressureThreshold
    );
  }

  getShardPrediction(shardId: number): FeePrediction | null {
    const state = this.shardStates.get(shardId);
    if (!state) return null;
    
    return this.predictionEngine.predict(state);
  }

  getShardFeeState(shardId: number): ShardFeeState | undefined {
    return this.shardStates.get(shardId);
  }

  getGlobalBaseFee(): bigint {
    return this.globalBaseFee;
  }

  getGlobalBlobBaseFee(): bigint {
    return this.globalBlobBaseFee;
  }

  getNetworkCongestionScore(): number {
    return this.networkCongestionScore;
  }

  getMetrics(): typeof this.metrics & {
    globalBaseFee: string;
    globalBlobBaseFee: string;
    congestionScore: number;
    totalShards: number;
    totalPendingTransactions: number;
  } {
    return {
      ...this.metrics,
      averageBaseFee: this.metrics.averageBaseFee,
      peakBaseFee: this.metrics.peakBaseFee,
      globalBaseFee: this.globalBaseFee.toString(),
      globalBlobBaseFee: this.globalBlobBaseFee.toString(),
      congestionScore: this.networkCongestionScore,
      totalShards: this.shardStates.size,
      totalPendingTransactions: this.totalPendingTransactions,
    };
  }

  getAllShardFees(): Array<{ shardId: number; baseFee: string; twapBaseFee: string; blobBaseFee: string; utilization: number; pending: number; trend: string }> {
    const result: Array<{ shardId: number; baseFee: string; twapBaseFee: string; blobBaseFee: string; utilization: number; pending: number; trend: string }> = [];
    
    const entries = Array.from(this.shardStates.entries());
    for (const [shardId, state] of entries) {
      const avgUtilization = state.utilizationHistory.length > 0
        ? state.utilizationHistory.reduce((a: number, b: number) => a + b, 0) / state.utilizationHistory.length
        : 0;
      
      result.push({
        shardId,
        baseFee: state.currentBaseFee.toString(),
        twapBaseFee: state.twapBaseFee.toString(),
        blobBaseFee: state.blobBaseFee.toString(),
        utilization: avgUtilization,
        pending: state.pendingCount,
        trend: state.trendDirection,
      });
    }
    
    return result;
  }
}

// ============================================================================
// Singleton Management
// ============================================================================

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
    console.log(`   - TWAP enabled: ${config?.twapWindowBlocks || 20} block window`);
    console.log(`   - Blob fees: ${config?.enableBlobFees !== false ? 'enabled' : 'disabled'}`);
    console.log(`   - Prediction: ${config?.enablePrediction !== false ? 'enabled' : 'disabled'}`);
  }
  return feeEngineInstance;
}

// Export types
export type {
  FeeConfig,
  FeeEstimate,
  ShardFeeState,
  BlockFeeData,
  CongestionLevel,
  CongestionAnalysis,
  FeePrediction,
};
