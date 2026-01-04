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
import { EventEmitter } from 'events';
import { ConsensusConfig, ConsensusState, Vote } from '../config/types';
export interface ValidatorInfo {
    address: string;
    votingPower: bigint;
    publicKey: string;
    isActive: boolean;
}
export interface BlockProposal {
    height: number;
    round: number;
    proposer: string;
    parentHash: string;
    blockHash: string;
    stateRoot: string;
    transactionsRoot: string;
    timestamp: number;
    transactions: unknown[];
    signature: string;
}
export interface ConsensusMetrics {
    totalRounds: number;
    successfulRounds: number;
    failedRounds: number;
    viewChanges: number;
    avgRoundTimeMs: number;
    votingParticipationRate: number;
    quorumAchievementRate: number;
    lastBlockHeight: number;
    lastBlockTime: number;
}
export declare class BFTConsensusEngine extends EventEmitter {
    private config;
    private validators;
    private totalVotingPower;
    private quorumThreshold;
    private currentPhase;
    private currentHeight;
    private currentRound;
    private lockedRound;
    private lockedBlockHash;
    private validRound;
    private validBlockHash;
    private currentProposal;
    private prevotes;
    private precommits;
    private commits;
    private phaseTimer;
    private viewChangeTimer;
    private myAddress;
    private signFunction;
    private metrics;
    private roundLatencies;
    private roundStartTime;
    private isProcessing;
    constructor(config: ConsensusConfig, myAddress: string, signFunction: (message: string) => string);
    setValidators(validators: ValidatorInfo[]): void;
    start(fromHeight: number): void;
    stop(): void;
    private startNewRound;
    private selectProposer;
    private enterProposePhase;
    private waitForProposal;
    handleProposal(proposal: BlockProposal): void;
    private verifyProposalSignature;
    private enterPrevotePhase;
    private castPrevote;
    handleVote(vote: Vote): void;
    private checkPrevoteQuorum;
    private enterPrecommitPhase;
    private castPrecommit;
    private checkPrecommitQuorum;
    private enterCommitPhase;
    private castCommit;
    private checkCommitQuorum;
    private finalizeBlock;
    private calculateVotePower;
    private getMajorityBlockHash;
    private handleViewChange;
    private setPhaseTimeout;
    getState(): ConsensusState;
    getMetrics(): ConsensusMetrics;
}
//# sourceMappingURL=bft-engine.d.ts.map