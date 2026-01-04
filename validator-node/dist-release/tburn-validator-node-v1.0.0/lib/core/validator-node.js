"use strict";
/**
 * TBURN Validator Node Core
 * Enterprise-Grade Standalone Validator Implementation
 *
 * This is the main entry point for running a validator node.
 * Coordinates all subsystems: P2P, Consensus, Storage, API
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidatorNode = void 0;
const events_1 = require("events");
const p2p_1 = require("../network/p2p");
const bft_engine_1 = require("../consensus/bft-engine");
const block_store_1 = require("../storage/block-store");
const keys_1 = require("../crypto/keys");
const logger_1 = require("../utils/logger");
const default_1 = require("../config/default");
const log = (0, logger_1.createModuleLogger)('ValidatorNode');
class ValidatorNode extends events_1.EventEmitter {
    config;
    cryptoManager;
    p2pNetwork;
    consensusEngine;
    blockStore;
    stateStore;
    mempool = new Map();
    pendingTxByAccount = new Map();
    isRunning = false;
    startTime = 0;
    metrics = {
        blocksProposed: 0,
        blocksMissed: 0,
        votesSubmitted: 0,
        uptime: 0,
        latencyP50: 0,
        latencyP95: 0,
        latencyP99: 0,
        rewardsEarned: '0',
        slashingEvents: 0,
        performanceScore: 100,
    };
    constructor(config) {
        super();
        this.config = config;
        logger_1.Logger.getInstance().configure({
            level: config.monitoring.logLevel,
            format: config.monitoring.logFormat,
            nodeId: config.nodeId,
            logFile: config.monitoring.logFile,
        });
        this.cryptoManager = new keys_1.CryptoManager();
        this.cryptoManager.loadFromPrivateKey(config.validator.privateKey);
        this.p2pNetwork = new p2p_1.P2PNetwork(config.network, config.nodeId, (msg) => this.cryptoManager.sign(msg));
        this.consensusEngine = new bft_engine_1.BFTConsensusEngine(config.consensus, config.validator.address, (msg) => this.cryptoManager.sign(msg));
        this.blockStore = new block_store_1.BlockStore(config.storage);
        this.stateStore = new block_store_1.StateStore(config.storage);
        this.setupEventHandlers();
    }
    setupEventHandlers() {
        this.p2pNetwork.on('block', (block) => {
            log.debug('Received block from network', { height: block.height, hash: block.hash });
            this.handleIncomingBlock(block);
        });
        this.p2pNetwork.on('transaction', (tx) => {
            this.handleIncomingTransaction(tx);
        });
        this.p2pNetwork.on('vote', (vote) => {
            this.consensusEngine.handleVote(vote);
        });
        this.p2pNetwork.on('consensus', (message) => {
            if (message.payload.type === 'proposal') {
                this.consensusEngine.handleProposal(message.payload);
            }
        });
        this.p2pNetwork.on('peerConnected', (peer) => {
            log.info('Peer connected', { nodeId: peer.nodeId, region: peer.region });
            this.emit('peerConnected', peer);
        });
        this.p2pNetwork.on('peerDisconnected', (peer) => {
            log.info('Peer disconnected', { nodeId: peer.nodeId });
            this.emit('peerDisconnected', peer);
        });
        this.consensusEngine.on('requestBlock', (height, callback) => {
            const proposal = this.createBlockProposal(height);
            callback(proposal);
        });
        this.consensusEngine.on('broadcastProposal', (proposal) => {
            this.p2pNetwork.broadcast(p2p_1.MessageType.CONSENSUS_MESSAGE, {
                type: 'proposal',
                ...proposal,
            });
            this.metrics.blocksProposed++;
        });
        this.consensusEngine.on('broadcastVote', (vote) => {
            this.p2pNetwork.broadcast(p2p_1.MessageType.VOTE, vote);
            this.metrics.votesSubmitted++;
        });
        this.consensusEngine.on('blockFinalized', async (data) => {
            await this.handleFinalizedBlock(data);
        });
        this.consensusEngine.on('phaseChange', (phase, height, round) => {
            log.debug('Consensus phase change', { phase, height, round });
        });
    }
    async start() {
        if (this.isRunning) {
            throw new Error('Validator node is already running');
        }
        log.info('Starting TBURN Validator Node', {
            nodeId: this.config.nodeId,
            chainId: this.config.chainId,
            address: this.config.validator.address,
            region: this.config.geo.region,
        });
        try {
            await this.blockStore.open();
            await this.stateStore.open();
            log.info('Storage initialized');
            await this.p2pNetwork.start();
            log.info('P2P network started');
            await this.waitForPeers();
            const validators = await this.fetchValidatorSet();
            this.consensusEngine.setValidators(validators);
            const latestHeight = this.blockStore.getLatestHeight();
            this.consensusEngine.start(latestHeight + 1);
            log.info('Consensus engine started', { fromHeight: latestHeight + 1 });
            this.isRunning = true;
            this.startTime = Date.now();
            this.startMetricsCollection();
            log.info('TBURN Validator Node started successfully', {
                address: this.config.validator.address,
                stake: this.config.validator.stake,
                peers: this.p2pNetwork.getPeerCount(),
            });
            this.emit('started');
        }
        catch (error) {
            log.error('Failed to start validator node', { error: error.message });
            throw error;
        }
    }
    async stop() {
        if (!this.isRunning)
            return;
        log.info('Stopping TBURN Validator Node');
        this.consensusEngine.stop();
        await this.p2pNetwork.stop();
        await this.blockStore.close();
        await this.stateStore.close();
        this.isRunning = false;
        log.info('TBURN Validator Node stopped');
        this.emit('stopped');
    }
    async waitForPeers() {
        const maxWaitTime = 60000;
        const checkInterval = 1000;
        let waited = 0;
        log.info('Waiting for peer connections', { minPeers: this.config.network.minPeers });
        while (waited < maxWaitTime) {
            if (this.p2pNetwork.getPeerCount() >= this.config.network.minPeers) {
                log.info('Minimum peers connected', { count: this.p2pNetwork.getPeerCount() });
                return;
            }
            await new Promise(resolve => setTimeout(resolve, checkInterval));
            waited += checkInterval;
        }
        if (this.p2pNetwork.getPeerCount() === 0) {
            log.warn('No peers connected after timeout, starting in solo mode');
        }
        else {
            log.warn('Could not reach minimum peers', {
                current: this.p2pNetwork.getPeerCount(),
                target: this.config.network.minPeers,
            });
        }
    }
    async fetchValidatorSet() {
        const validators = [];
        validators.push({
            address: this.config.validator.address,
            votingPower: BigInt(this.config.validator.stake),
            publicKey: this.cryptoManager.getPublicKeyHex(),
            isActive: true,
        });
        for (const peer of this.p2pNetwork.getPeers()) {
            validators.push({
                address: peer.nodeId,
                votingPower: BigInt(default_1.CHAIN_CONSTANTS.MIN_STAKE),
                publicKey: peer.publicKey,
                isActive: peer.isActive,
            });
        }
        return validators;
    }
    createBlockProposal(height) {
        const parentBlock = this.blockStore.getLatestHeight() > 0
            ? { hash: '', stateRoot: '' }
            : { hash: default_1.CHAIN_CONSTANTS.GENESIS_BLOCK_HASH, stateRoot: '' };
        const transactions = this.selectTransactionsForBlock();
        const transactionsRoot = keys_1.CryptoManager.generateMerkleRoot(transactions.map(tx => tx.hash));
        const stateRoot = this.stateStore.computeStateRoot();
        const blockData = {
            height,
            round: 0,
            parentHash: parentBlock.hash,
            stateRoot,
            transactionsRoot,
            timestamp: Date.now(),
            transactions,
        };
        const blockHash = keys_1.CryptoManager.hashBlock(blockData);
        return {
            height,
            round: 0,
            proposer: this.config.validator.address,
            parentHash: parentBlock.hash,
            blockHash: `0x${blockHash}`,
            stateRoot,
            transactionsRoot,
            timestamp: Date.now(),
            transactions,
            signature: '',
        };
    }
    selectTransactionsForBlock() {
        const maxTxs = this.config.consensus.maxTransactionsPerBlock;
        const sortedTxs = Array.from(this.mempool.values())
            .sort((a, b) => {
            const priceDiff = b.gasPrice - a.gasPrice;
            if (priceDiff !== BigInt(0)) {
                return priceDiff > 0 ? 1 : -1;
            }
            return a.receivedAt - b.receivedAt;
        })
            .slice(0, maxTxs);
        return sortedTxs.map(mempoolTx => ({
            hash: mempoolTx.hash,
            from: mempoolTx.from,
            to: mempoolTx.to,
            value: mempoolTx.value,
            nonce: mempoolTx.nonce,
            gasLimit: mempoolTx.gasLimit,
            gasPrice: mempoolTx.originalGasPrice,
            data: mempoolTx.data,
            signature: mempoolTx.signature,
            timestamp: mempoolTx.timestamp,
            shardId: mempoolTx.shardId,
        }));
    }
    async handleFinalizedBlock(data) {
        const block = {
            height: data.height,
            hash: data.blockHash,
            parentHash: data.proposal.parentHash,
            stateRoot: data.proposal.stateRoot,
            transactionsRoot: data.proposal.transactionsRoot,
            receiptsRoot: '',
            timestamp: data.proposal.timestamp,
            proposer: data.proposal.proposer,
            signature: data.proposal.signature,
            shardId: 0,
            chainId: this.config.chainId,
            transactions: data.proposal.transactions,
            votes: data.votes,
            size: 0,
        };
        await this.blockStore.putBlock(block);
        for (const tx of block.transactions) {
            this.mempool.delete(tx.hash);
            const accountTxs = this.pendingTxByAccount.get(tx.from);
            if (accountTxs) {
                accountTxs.delete(tx.hash);
            }
            await this.applyTransaction(tx);
        }
        await this.stateStore.save();
        log.info('Block finalized and stored', {
            height: block.height,
            hash: block.hash,
            txCount: block.transactions.length,
        });
        this.emit('blockFinalized', block);
    }
    async applyTransaction(tx) {
        const fromBalance = this.stateStore.getBalance(tx.from);
        const toBalance = this.stateStore.getBalance(tx.to);
        const value = BigInt(tx.value);
        const gasCost = BigInt(tx.gasLimit) * BigInt(tx.gasPrice);
        if (fromBalance >= value + gasCost) {
            this.stateStore.setBalance(tx.from, fromBalance - value - gasCost);
            this.stateStore.setBalance(tx.to, toBalance + value);
            this.stateStore.setNonce(tx.from, tx.nonce + 1);
        }
    }
    handleIncomingBlock(block) {
        const latestHeight = this.blockStore.getLatestHeight();
        if (block.height <= latestHeight) {
            log.debug('Ignoring old block', { blockHeight: block.height, latestHeight });
            return;
        }
        if (block.height > latestHeight + 1) {
            log.info('Missing blocks detected, initiating sync', {
                localHeight: latestHeight,
                receivedHeight: block.height,
            });
            return;
        }
    }
    handleIncomingTransaction(tx) {
        if (this.mempool.has(tx.hash)) {
            return;
        }
        if (this.mempool.size >= this.config.security.maxMempoolSize) {
            log.warn('Mempool full, rejecting transaction');
            return;
        }
        const accountTxs = this.pendingTxByAccount.get(tx.from) || new Set();
        if (accountTxs.size >= this.config.security.maxPendingTxPerAccount) {
            log.warn('Too many pending txs for account', { account: tx.from });
            return;
        }
        const mempoolTx = {
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: tx.value,
            nonce: tx.nonce,
            gasLimit: tx.gasLimit,
            data: tx.data,
            signature: tx.signature,
            timestamp: tx.timestamp,
            shardId: tx.shardId,
            receivedAt: Date.now(),
            gasPrice: BigInt(tx.gasPrice),
            originalGasPrice: tx.gasPrice,
        };
        this.mempool.set(tx.hash, mempoolTx);
        accountTxs.add(tx.hash);
        this.pendingTxByAccount.set(tx.from, accountTxs);
        log.debug('Transaction added to mempool', { hash: tx.hash });
    }
    async submitTransaction(tx) {
        tx.hash = keys_1.CryptoManager.hashTransaction(tx);
        this.handleIncomingTransaction(tx);
        this.p2pNetwork.broadcast(p2p_1.MessageType.NEW_TRANSACTION, tx);
        return tx.hash;
    }
    startMetricsCollection() {
        setInterval(() => {
            this.metrics.uptime = (Date.now() - this.startTime) / 1000;
            const consensusMetrics = this.consensusEngine.getMetrics();
            this.metrics.latencyP50 = consensusMetrics.avgRoundTimeMs;
            if (consensusMetrics.totalRounds > 0) {
                this.metrics.performanceScore =
                    (consensusMetrics.successfulRounds / consensusMetrics.totalRounds) * 100;
            }
        }, this.config.monitoring.healthCheckInterval);
    }
    getStatus() {
        return {
            nodeId: this.config.nodeId,
            version: '1.0.0',
            chainId: this.config.chainId,
            networkId: this.config.networkId,
            isValidator: true,
            isSyncing: false,
            currentHeight: this.blockStore.getLatestHeight(),
            highestKnownHeight: this.blockStore.getLatestHeight(),
            peersCount: this.p2pNetwork.getPeerCount(),
            consensusState: this.consensusEngine.getState(),
            uptime: Date.now() - this.startTime,
            memoryUsage: process.memoryUsage().heapUsed,
            cpuUsage: 0,
        };
    }
    getMetrics() {
        return { ...this.metrics };
    }
    getMempoolSize() {
        return this.mempool.size;
    }
    getPeers() {
        return this.p2pNetwork.getPeers();
    }
    getConfig() {
        return this.config;
    }
}
exports.ValidatorNode = ValidatorNode;
//# sourceMappingURL=validator-node.js.map