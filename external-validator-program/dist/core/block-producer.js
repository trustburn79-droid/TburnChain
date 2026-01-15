"use strict";
/**
 * TBURN Block Producer
 * Handles block proposal and signing via Remote Signer
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockProducer = void 0;
const events_1 = require("events");
const crypto = __importStar(require("crypto"));
class BlockProducer extends events_1.EventEmitter {
    signerClient;
    validatorAddress;
    blockTimeMs;
    maxTxPerBlock;
    producing = false;
    lastBlockHash = '0x' + '0'.repeat(64);
    blocksProduced = 0;
    constructor(config) {
        super();
        this.signerClient = config.signerClient;
        this.validatorAddress = config.validatorAddress;
        this.blockTimeMs = config.blockTimeMs;
        this.maxTxPerBlock = config.maxTxPerBlock;
    }
    async produceBlock(slot) {
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
            const block = {
                ...blockData,
                blockHash,
                signature: signResult.signature
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
        }
        catch (error) {
            console.error('[BlockProducer] Block production error:', error);
            return null;
        }
        finally {
            this.producing = false;
        }
    }
    isProposing() {
        return this.producing;
    }
    getBlocksProduced() {
        return this.blocksProduced;
    }
    getLastBlockHash() {
        return this.lastBlockHash;
    }
    generateHash(data) {
        return '0x' + crypto.createHash('sha256').update(data).digest('hex');
    }
    getProposerIndex() {
        return parseInt(this.validatorAddress.slice(2, 10), 16) % 125;
    }
}
exports.BlockProducer = BlockProducer;
//# sourceMappingURL=block-producer.js.map