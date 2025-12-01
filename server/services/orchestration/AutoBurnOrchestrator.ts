/**
 * Auto-Burn Orchestrator - Manages token burn operations
 * Ensures burns update token supply, wallets, and network metrics
 * With proper lifecycle management and concurrency guards
 */

import { dataHub } from '../DataHub';
import { eventBus } from '../EventBus';

export interface BurnCommand {
  amount: string;
  source: 'transaction_fee' | 'governance' | 'bridge_fee' | 'dex_fee' | 'scheduled' | 'manual';
  txHash?: string;
}

export interface BurnScheduleCommand {
  amount: string;
  executeAt: number;
  recurring?: boolean;
  interval?: number;
}

export interface BurnResult {
  success: boolean;
  burnId?: string;
  txHash?: string;
  message: string;
  affectedModules: string[];
  newTotalBurned?: string;
  newCirculatingSupply?: string;
  deflationRate?: number;
}

class AutoBurnOrchestratorService {
  private totalBurned: bigint = BigInt("25000000000000000000000000");
  private burnRate24h: bigint = BigInt("150000000000000000000000");
  private nextBurnAmount: bigint = BigInt("50000000000000000000000");
  private deflationRate: number = 250;
  private totalSupply: bigint = BigInt("1000000000000000000000000000");
  private burnHistory: Array<{ id: string; amount: string; source: string; timestamp: number }> = [];
  
  private scheduledBurnInterval: NodeJS.Timeout | null = null;
  private isBurnInProgress: boolean = false;
  private isInitialized: boolean = false;

  constructor() {
    if (!this.isInitialized) {
      this.initializeMetrics();
      this.startAutoBurnSchedule();
      this.isInitialized = true;
    }
  }

  private initializeMetrics(): void {
    dataHub.updateBurnMetrics(
      this.totalBurned.toString(),
      this.burnRate24h.toString(),
      this.nextBurnAmount.toString(),
      this.deflationRate
    );
  }

  private startAutoBurnSchedule(): void {
    if (this.scheduledBurnInterval) {
      clearInterval(this.scheduledBurnInterval);
    }
    
    this.scheduledBurnInterval = setInterval(() => {
      this.executeScheduledBurn();
    }, 60000);
  }

  /**
   * Stop the scheduled burn interval for graceful shutdown
   */
  stopSchedule(): void {
    if (this.scheduledBurnInterval) {
      clearInterval(this.scheduledBurnInterval);
      this.scheduledBurnInterval = null;
    }
  }

  /**
   * Execute immediate burn with cross-module updates
   */
  async executeBurn(command: BurnCommand): Promise<BurnResult> {
    const { amount, source, txHash } = command;

    try {
      const burnAmount = BigInt(amount);

      this.totalBurned += burnAmount;
      this.burnRate24h += burnAmount;

      const circulatingSupply = this.totalSupply - this.totalBurned;
      this.deflationRate = Number((this.burnRate24h * BigInt(10000)) / this.totalSupply);

      dataHub.updateBurnMetrics(
        this.totalBurned.toString(),
        this.burnRate24h.toString(),
        this.nextBurnAmount.toString(),
        this.deflationRate
      );

      const burnId = `burn_${Date.now()}_${Math.random().toString(36).slice(2)}`;

      this.burnHistory.push({
        id: burnId,
        amount,
        source,
        timestamp: Date.now()
      });

      eventBus.publish({
        channel: 'burn.events',
        type: 'BURN_EXECUTED',
        data: {
          burnId,
          amount,
          source,
          totalBurned: this.totalBurned.toString(),
          newCirculatingSupply: circulatingSupply.toString(),
          deflationRate: this.deflationRate,
          txHash: txHash || `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`,
          timestamp: Date.now()
        },
        timestamp: Date.now(),
        sourceModule: 'auto-burn',
        affectedModules: ['token-system', 'dashboard', 'wallets']
      });

      eventBus.publish({
        channel: 'network.stats',
        type: 'SUPPLY_BURNED',
        data: {
          amount,
          totalBurned: this.totalBurned.toString(),
          circulatingSupply: circulatingSupply.toString(),
          deflationRate: this.deflationRate,
          timestamp: Date.now()
        },
        timestamp: Date.now(),
        sourceModule: 'auto-burn',
        affectedModules: ['dashboard', 'token-system']
      });

      return {
        success: true,
        burnId,
        txHash: txHash || `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`,
        message: `Successfully burned ${amount} tokens from ${source}`,
        affectedModules: ['auto-burn', 'token-system', 'dashboard'],
        newTotalBurned: this.totalBurned.toString(),
        newCirculatingSupply: circulatingSupply.toString(),
        deflationRate: this.deflationRate / 100
      };
    } catch (error) {
      return {
        success: false,
        message: `Burn operation failed: ${error}`,
        affectedModules: []
      };
    }
  }

  /**
   * Execute scheduled auto-burn with concurrency guard
   */
  private async executeScheduledBurn(): Promise<void> {
    if (this.isBurnInProgress) {
      console.log('[AutoBurn] Skipping scheduled burn - previous burn still in progress');
      return;
    }

    if (this.nextBurnAmount > BigInt(0)) {
      const burnAmount = (this.nextBurnAmount * BigInt(Math.floor(Math.random() * 10) + 1)) / BigInt(100);
      
      if (burnAmount > BigInt(0)) {
        this.isBurnInProgress = true;
        try {
          await this.executeBurn({
            amount: burnAmount.toString(),
            source: 'scheduled'
          });
        } catch (error) {
          console.error('[AutoBurn] Scheduled burn failed:', error);
        } finally {
          this.isBurnInProgress = false;
        }
      }
    }
  }

  /**
   * Process transaction fee burn
   */
  async processTransactionFeeBurn(txHash: string, gasUsed: bigint, gasPrice: bigint): Promise<BurnResult> {
    const totalFee = gasUsed * gasPrice;
    const burnAmount = (totalFee * BigInt(50)) / BigInt(100);

    return this.executeBurn({
      amount: burnAmount.toString(),
      source: 'transaction_fee',
      txHash
    });
  }

  /**
   * Process DEX fee burn
   */
  async processDexFeeBurn(swapId: string, feeAmount: string): Promise<BurnResult> {
    const burnAmount = (BigInt(feeAmount) * BigInt(30)) / BigInt(100);

    return this.executeBurn({
      amount: burnAmount.toString(),
      source: 'dex_fee',
      txHash: swapId
    });
  }

  /**
   * Process bridge fee burn
   */
  async processBridgeFeeBurn(transferId: string, feeAmount: string): Promise<BurnResult> {
    const burnAmount = (BigInt(feeAmount) * BigInt(20)) / BigInt(100);

    return this.executeBurn({
      amount: burnAmount.toString(),
      source: 'bridge_fee',
      txHash: transferId
    });
  }

  /**
   * Get burn history
   */
  getBurnHistory(limit: number = 50): Array<{ id: string; amount: string; source: string; timestamp: number }> {
    return this.burnHistory.slice(-limit);
  }

  /**
   * Get current burn metrics
   */
  getMetrics() {
    return {
      totalBurned: this.totalBurned.toString(),
      burnRate24h: this.burnRate24h.toString(),
      nextBurnAmount: this.nextBurnAmount.toString(),
      deflationRate: this.deflationRate,
      circulatingSupply: (this.totalSupply - this.totalBurned).toString()
    };
  }

  /**
   * Calculate projected burn for next period
   */
  getProjectedBurn(periodHours: number = 24): string {
    const hourlyRate = this.burnRate24h / BigInt(24);
    return (hourlyRate * BigInt(periodHours)).toString();
  }
}

export const autoBurnOrchestrator = new AutoBurnOrchestratorService();
export default autoBurnOrchestrator;
