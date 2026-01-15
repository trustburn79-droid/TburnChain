/**
 * TBURN Block Producer
 * Handles block proposal and signing via Remote Signer
 */
import { EventEmitter } from 'events';
export interface SignerClient {
    signBlock(request: {
        slot: number;
        blockHash: string;
        stateRoot: string;
        parentHash: string;
        transactionRoot: string;
        proposerIndex: number;
    }): Promise<{
        success: boolean;
        signature?: string;
        error?: string;
    }>;
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
export declare class BlockProducer extends EventEmitter {
    private signerClient;
    private validatorAddress;
    private blockTimeMs;
    private maxTxPerBlock;
    private producing;
    private lastBlockHash;
    private blocksProduced;
    constructor(config: BlockProducerConfig);
    produceBlock(slot: number): Promise<ProducedBlock | null>;
    isProposing(): boolean;
    getBlocksProduced(): number;
    getLastBlockHash(): string;
    private generateHash;
    private getProposerIndex;
}
//# sourceMappingURL=block-producer.d.ts.map