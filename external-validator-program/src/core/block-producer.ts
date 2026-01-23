/**
 * TBURN Block Producer
 * Handles block proposal and signing via Remote Signer
 */

import { EventEmitter } from 'events';
import * as crypto from 'crypto';

export interface SignerClient {
  signBlock(request: {
    slot: number;
    blockHash: string;
    stateRoot: string;
    parentHash: string;
    transactionRoot: string;
    proposerIndex: number;
  }): Promise<{ success: boolean; signature?: string; error?: string }>;
}

export interface BlockProducerConfig {
  signerClient: SignerClient;
  validatorAddress: string;
  blockTimeMs: number;
  maxTxPerBlock: number;
}

export interface ProducedBlock {
  slot: number;
  blockHash: string;
  parentHash: string;
  stateRoot: string;
  transactionRoot: string;
  timestamp: number;
  proposer: string;
  signature: string;
  txCount: number;
}

export class BlockProducer extends EventEmitter {
  private signerClient: SignerClient;
  private validatorAddress: string;
  private blockTimeMs: number;
  private maxTxPerBlock: number;
  private producing = false;
  private lastBlockHash = 'bh1' + '0'.repeat(64);
  private blocksProduced = 0;

  constructor(config: BlockProducerConfig) {
    super();
    this.signerClient = config.signerClient;
    this.validatorAddress = config.validatorAddress;
    this.blockTimeMs = config.blockTimeMs;
    this.maxTxPerBlock = config.maxTxPerBlock;
  }

  async produceBlock(slot: number): Promise<ProducedBlock | null> {
    if (this.producing) {
      console.log('[BlockProducer] Already producing a block');
      return null;
    }

    this.producing = true;
    const startTime = Date.now();

    try {
      const txCount = Math.floor(Math.random() * this.maxTxPerBlock) + 100;
      
      const blockData = {
        slot,
        parentHash: this.lastBlockHash,
        stateRoot: this.generateHash(`state-${slot}`),
        transactionRoot: this.generateHash(`txroot-${slot}-${txCount}`),
        timestamp: Date.now(),
        proposer: this.validatorAddress,
        txCount
      };

      const blockHash = this.generateHash(JSON.stringify(blockData));

      const signResult = await this.signerClient.signBlock({
        slot,
        blockHash,
        stateRoot: blockData.stateRoot,
        parentHash: blockData.parentHash,
        transactionRoot: blockData.transactionRoot,
        proposerIndex: this.getProposerIndex()
      });

      if (!signResult.success) {
        console.error('[BlockProducer] Block signing failed:', signResult.error);
        return null;
      }

      const block: ProducedBlock = {
        ...blockData,
        blockHash,
        signature: signResult.signature!
      };

      this.lastBlockHash = blockHash;
      this.blocksProduced++;

      const productionTime = Date.now() - startTime;
      console.log(`[BlockProducer] Block produced in ${productionTime}ms: slot ${slot}, ${txCount} txs`);

      this.emit('block:produced', {
        slot,
        blockHash,
        txCount,
        productionTimeMs: productionTime
      });

      return block;

    } catch (error) {
      console.error('[BlockProducer] Block production error:', error);
      return null;
    } finally {
      this.producing = false;
    }
  }

  isProposing(): boolean {
    return this.producing;
  }

  getBlocksProduced(): number {
    return this.blocksProduced;
  }

  getLastBlockHash(): string {
    return this.lastBlockHash;
  }

  private generateHash(data: string): string {
    return 'bh1' + crypto.createHash('sha256').update(data).digest('hex');
  }

  private getProposerIndex(): number {
    return parseInt(this.validatorAddress.slice(2, 10), 16) % 125;
  }
}
