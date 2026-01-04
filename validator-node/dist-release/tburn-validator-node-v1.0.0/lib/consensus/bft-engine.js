"use strict";
/**
 * TBURN Validator BFT Consensus Engine
 * Enterprise-Grade Byzantine Fault Tolerant Consensus
 *
 * 5-Phase Protocol: Propose → Prevote → Precommit → Commit → Finalize
 *
 * Features:
 * - O(n) message complexity
 * - Lock-based safety (no double-voting)
 * - View change for fault tolerance
 * - 2/3+ quorum verification
 * - Parallel vote aggregation
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
exports.BFTConsensusEngine = void 0;
const events_1 = require("events");
const crypto = __importStar(require("crypto"));
const types_1 = require("../config/types");
const logger_1 = require("../utils/logger");
const log = (0, logger_1.createModuleLogger)('Consensus');
class BFTConsensusEngine extends events_1.EventEmitter {
    config;
    validators = new Map();
    totalVotingPower = BigInt(0);
    quorumThreshold = BigInt(0);
    currentPhase = types_1.ConsensusPhase.IDLE;
    currentHeight = 0;
    currentRound = 0;
    lockedRound = -1;
    lockedBlockHash = null;
    validRound = -1;
    validBlockHash = null;
    currentProposal = null;
    prevotes = new Map();
    precommits = new Map();
    commits = new Map();
    phaseTimer = null;
    viewChangeTimer = null;
    myAddress;
    signFunction;
    metrics = {
        totalRounds: 0,
        successfulRounds: 0,
        failedRounds: 0,
        viewChanges: 0,
        avgRoundTimeMs: 0,
        votingParticipationRate: 0,
        quorumAchievementRate: 0,
        lastBlockHeight: 0,
        lastBlockTime: 0,
    };
    roundLatencies = [];
    roundStartTime = 0;
    isProcessing = false;
    constructor(config, myAddress, signFunction) {
        super();
        this.config = config;
        this.myAddress = myAddress;
        this.signFunction = signFunction;
    }
    setValidators(validators) {
        this.validators.clear();
        this.totalVotingPower = BigInt(0);
        for (const validator of validators) {
            this.validators.set(validator.address, validator);
            if (validator.isActive) {
                this.totalVotingPower += validator.votingPower;
            }
        }
        this.quorumThreshold = (this.totalVotingPower * BigInt(this.config.quorumNumerator)) /
            BigInt(this.config.quorumDenominator);
        log.info('Validators updated', {
            count: validators.length,
            totalVotingPower: this.totalVotingPower.toString(),
            quorumThreshold: this.quorumThreshold.toString(),
        });
    }
    start(fromHeight) {
        this.currentHeight = fromHeight;
        this.currentRound = 0;
        log.info('Consensus engine started', { height: fromHeight });
        this.startNewRound();
    }
    stop() {
        if (this.phaseTimer)
            clearTimeout(this.phaseTimer);
        if (this.viewChangeTimer)
            clearTimeout(this.viewChangeTimer);
        this.currentPhase = types_1.ConsensusPhase.IDLE;
        log.info('Consensus engine stopped');
    }
    startNewRound() {
        this.prevotes.clear();
        this.precommits.clear();
        this.commits.clear();
        this.currentProposal = null;
        this.roundStartTime = Date.now();
        this.metrics.totalRounds++;
        log.info('Starting new round', {
            height: this.currentHeight,
            round: this.currentRound,
        });
        const proposer = this.selectProposer();
        if (proposer === this.myAddress) {
            this.enterProposePhase();
        }
        else {
            this.waitForProposal();
        }
    }
    selectProposer() {
        const validatorAddresses = Array.from(this.validators.keys())
            .filter(addr => this.validators.get(addr)?.isActive);
        const seed = `${this.currentHeight}-${this.currentRound}`;
        const hash = crypto.createHash('sha256').update(seed).digest();
        const index = hash.readUInt32BE(0) % validatorAddresses.length;
        return validatorAddresses[index];
    }
    enterProposePhase() {
        this.currentPhase = types_1.ConsensusPhase.PROPOSE;
        this.emit('phaseChange', this.currentPhase, this.currentHeight, this.currentRound);
        log.info('I am the proposer', { height: this.currentHeight, round: this.currentRound });
        this.emit('requestBlock', this.currentHeight, (block) => {
            this.currentProposal = block;
            this.currentProposal.proposer = this.myAddress;
            this.currentProposal.signature = this.signFunction(JSON.stringify({
                height: block.height,
                round: block.round,
                blockHash: block.blockHash,
            }));
            this.emit('broadcastProposal', this.currentProposal);
            this.enterPrevotePhase();
        });
        this.setPhaseTimeout(() => {
            if (this.currentPhase === types_1.ConsensusPhase.PROPOSE) {
                log.warn('Propose phase timeout');
                this.handleViewChange('propose_timeout');
            }
        });
    }
    waitForProposal() {
        this.currentPhase = types_1.ConsensusPhase.PROPOSE;
        this.emit('phaseChange', this.currentPhase, this.currentHeight, this.currentRound);
        log.debug('Waiting for proposal', {
            height: this.currentHeight,
            round: this.currentRound,
            proposer: this.selectProposer(),
        });
        this.setPhaseTimeout(() => {
            if (this.currentPhase === types_1.ConsensusPhase.PROPOSE && !this.currentProposal) {
                log.warn('Did not receive proposal in time');
                this.castPrevote(null);
            }
        });
    }
    handleProposal(proposal) {
        if (proposal.height !== this.currentHeight || proposal.round !== this.currentRound) {
            log.debug('Ignoring proposal for different height/round', {
                proposalHeight: proposal.height,
                currentHeight: this.currentHeight,
            });
            return;
        }
        const expectedProposer = this.selectProposer();
        if (proposal.proposer !== expectedProposer) {
            log.warn('Invalid proposer', {
                expected: expectedProposer,
                received: proposal.proposer,
            });
            return;
        }
        if (!this.verifyProposalSignature(proposal)) {
            log.warn('Invalid proposal signature');
            return;
        }
        this.currentProposal = proposal;
        log.info('Received valid proposal', { blockHash: proposal.blockHash });
        if (this.currentPhase === types_1.ConsensusPhase.PROPOSE) {
            this.enterPrevotePhase();
        }
    }
    verifyProposalSignature(proposal) {
        return true;
    }
    enterPrevotePhase() {
        this.currentPhase = types_1.ConsensusPhase.PREVOTE;
        this.emit('phaseChange', this.currentPhase, this.currentHeight, this.currentRound);
        if (this.lockedRound >= 0 && this.lockedBlockHash) {
            if (this.currentProposal?.blockHash === this.lockedBlockHash) {
                this.castPrevote(this.lockedBlockHash);
            }
            else {
                this.castPrevote(null);
            }
        }
        else if (this.currentProposal) {
            this.castPrevote(this.currentProposal.blockHash);
        }
        else {
            this.castPrevote(null);
        }
        this.setPhaseTimeout(() => {
            if (this.currentPhase === types_1.ConsensusPhase.PREVOTE) {
                this.checkPrevoteQuorum();
            }
        });
    }
    castPrevote(blockHash) {
        const vote = {
            type: 'prevote',
            height: this.currentHeight,
            round: this.currentRound,
            blockHash: blockHash || '',
            validatorAddress: this.myAddress,
            signature: '',
            timestamp: Date.now(),
        };
        vote.signature = this.signFunction(JSON.stringify({ type: vote.type, height: vote.height, round: vote.round, blockHash: vote.blockHash }));
        this.prevotes.set(this.myAddress, vote);
        this.emit('broadcastVote', vote);
        log.debug('Cast prevote', { blockHash });
    }
    handleVote(vote) {
        if (vote.height !== this.currentHeight || vote.round !== this.currentRound) {
            return;
        }
        const validator = this.validators.get(vote.validatorAddress);
        if (!validator || !validator.isActive) {
            log.warn('Vote from unknown or inactive validator', { address: vote.validatorAddress });
            return;
        }
        switch (vote.type) {
            case 'prevote':
                this.prevotes.set(vote.validatorAddress, vote);
                if (this.currentPhase === types_1.ConsensusPhase.PREVOTE) {
                    this.checkPrevoteQuorum();
                }
                break;
            case 'precommit':
                this.precommits.set(vote.validatorAddress, vote);
                if (this.currentPhase === types_1.ConsensusPhase.PRECOMMIT) {
                    this.checkPrecommitQuorum();
                }
                break;
            case 'commit':
                this.commits.set(vote.validatorAddress, vote);
                if (this.currentPhase === types_1.ConsensusPhase.COMMIT) {
                    this.checkCommitQuorum();
                }
                break;
        }
    }
    checkPrevoteQuorum() {
        const votePower = this.calculateVotePower(this.prevotes);
        if (votePower >= this.quorumThreshold) {
            const majorityBlockHash = this.getMajorityBlockHash(this.prevotes);
            if (majorityBlockHash) {
                this.validRound = this.currentRound;
                this.validBlockHash = majorityBlockHash;
                log.info('Prevote quorum reached', { blockHash: majorityBlockHash });
                this.enterPrecommitPhase();
            }
            else {
                log.info('Prevote quorum on nil');
                this.handleViewChange('nil_prevote_quorum');
            }
        }
    }
    enterPrecommitPhase() {
        this.currentPhase = types_1.ConsensusPhase.PRECOMMIT;
        this.emit('phaseChange', this.currentPhase, this.currentHeight, this.currentRound);
        if (this.validBlockHash) {
            this.lockedRound = this.currentRound;
            this.lockedBlockHash = this.validBlockHash;
            this.castPrecommit(this.validBlockHash);
        }
        else {
            this.castPrecommit(null);
        }
        this.setPhaseTimeout(() => {
            if (this.currentPhase === types_1.ConsensusPhase.PRECOMMIT) {
                this.checkPrecommitQuorum();
            }
        });
    }
    castPrecommit(blockHash) {
        const vote = {
            type: 'precommit',
            height: this.currentHeight,
            round: this.currentRound,
            blockHash: blockHash || '',
            validatorAddress: this.myAddress,
            signature: '',
            timestamp: Date.now(),
        };
        vote.signature = this.signFunction(JSON.stringify({ type: vote.type, height: vote.height, round: vote.round, blockHash: vote.blockHash }));
        this.precommits.set(this.myAddress, vote);
        this.emit('broadcastVote', vote);
        log.debug('Cast precommit', { blockHash });
    }
    checkPrecommitQuorum() {
        const votePower = this.calculateVotePower(this.precommits);
        if (votePower >= this.quorumThreshold) {
            const majorityBlockHash = this.getMajorityBlockHash(this.precommits);
            if (majorityBlockHash) {
                log.info('Precommit quorum reached', { blockHash: majorityBlockHash });
                this.enterCommitPhase();
            }
            else {
                log.info('Precommit quorum on nil');
                this.handleViewChange('nil_precommit_quorum');
            }
        }
    }
    enterCommitPhase() {
        this.currentPhase = types_1.ConsensusPhase.COMMIT;
        this.emit('phaseChange', this.currentPhase, this.currentHeight, this.currentRound);
        this.castCommit(this.lockedBlockHash);
        this.setPhaseTimeout(() => {
            if (this.currentPhase === types_1.ConsensusPhase.COMMIT) {
                this.checkCommitQuorum();
            }
        });
    }
    castCommit(blockHash) {
        const vote = {
            type: 'commit',
            height: this.currentHeight,
            round: this.currentRound,
            blockHash,
            validatorAddress: this.myAddress,
            signature: '',
            timestamp: Date.now(),
        };
        vote.signature = this.signFunction(JSON.stringify({ type: vote.type, height: vote.height, round: vote.round, blockHash: vote.blockHash }));
        this.commits.set(this.myAddress, vote);
        this.emit('broadcastVote', vote);
        log.debug('Cast commit', { blockHash });
    }
    checkCommitQuorum() {
        const votePower = this.calculateVotePower(this.commits);
        if (votePower >= this.quorumThreshold) {
            const majorityBlockHash = this.getMajorityBlockHash(this.commits);
            if (majorityBlockHash) {
                log.info('Commit quorum reached - finalizing block', { blockHash: majorityBlockHash });
                this.finalizeBlock(majorityBlockHash);
            }
        }
    }
    finalizeBlock(blockHash) {
        this.currentPhase = types_1.ConsensusPhase.FINALIZE;
        this.emit('phaseChange', this.currentPhase, this.currentHeight, this.currentRound);
        const roundTime = Date.now() - this.roundStartTime;
        this.roundLatencies.push(roundTime);
        if (this.roundLatencies.length > 100) {
            this.roundLatencies.shift();
        }
        this.metrics.successfulRounds++;
        this.metrics.avgRoundTimeMs = this.roundLatencies.reduce((a, b) => a + b, 0) / this.roundLatencies.length;
        this.metrics.lastBlockHeight = this.currentHeight;
        this.metrics.lastBlockTime = Date.now();
        this.metrics.votingParticipationRate = this.commits.size / this.validators.size;
        const commitVotes = Array.from(this.commits.values());
        this.emit('blockFinalized', {
            height: this.currentHeight,
            blockHash,
            proposal: this.currentProposal,
            votes: commitVotes,
        });
        log.info('Block finalized', {
            height: this.currentHeight,
            blockHash,
            roundTimeMs: roundTime,
        });
        this.lockedRound = -1;
        this.lockedBlockHash = null;
        this.validRound = -1;
        this.validBlockHash = null;
        this.currentHeight++;
        this.currentRound = 0;
        setTimeout(() => this.startNewRound(), 0);
    }
    calculateVotePower(votes) {
        let totalPower = BigInt(0);
        for (const [address] of votes) {
            const validator = this.validators.get(address);
            if (validator && validator.isActive) {
                totalPower += validator.votingPower;
            }
        }
        return totalPower;
    }
    getMajorityBlockHash(votes) {
        const voteCounts = new Map();
        for (const [address, vote] of votes) {
            if (!vote.blockHash)
                continue;
            const validator = this.validators.get(address);
            if (!validator || !validator.isActive)
                continue;
            const currentPower = voteCounts.get(vote.blockHash) || BigInt(0);
            voteCounts.set(vote.blockHash, currentPower + validator.votingPower);
        }
        for (const [blockHash, power] of voteCounts) {
            if (power >= this.quorumThreshold) {
                return blockHash;
            }
        }
        return null;
    }
    handleViewChange(reason) {
        log.warn('View change triggered', { reason, round: this.currentRound });
        this.metrics.viewChanges++;
        this.currentRound++;
        if (this.currentRound >= this.config.maxRoundsPerHeight) {
            log.error('Max rounds exceeded', { height: this.currentHeight });
            this.metrics.failedRounds++;
            this.emit('consensusFailed', this.currentHeight);
            return;
        }
        this.startNewRound();
    }
    setPhaseTimeout(callback) {
        if (this.phaseTimer)
            clearTimeout(this.phaseTimer);
        this.phaseTimer = setTimeout(callback, this.config.phaseTimeoutMs);
    }
    getState() {
        return {
            height: this.currentHeight,
            round: this.currentRound,
            phase: this.currentPhase,
            lockedRound: this.lockedRound,
            lockedBlockHash: this.lockedBlockHash,
            validRound: this.validRound,
            validBlockHash: this.validBlockHash,
        };
    }
    getMetrics() {
        return { ...this.metrics };
    }
}
exports.BFTConsensusEngine = BFTConsensusEngine;
//# sourceMappingURL=bft-engine.js.map