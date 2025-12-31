/**
 * TBURN Block Finality Engine
 * Handles block verification, cross-validator checks, and finality confirmation
 * 
 * This engine operates independently of block production to maintain stability
 */

import { TransactionVerifier, BlockVerifier, ValidatorSignatureGenerator } from '../utils/transaction-verifier';

export interface ValidatorInfo {
  address: string;
  votingPower: string;
  status: string;
}

export interface BlockData {
  number: number;
  hash: string;
  parentHash: string;
  stateRoot: string;
  receiptsRoot: string;
  transactionHashes: string[];
  timestamp: number;
  validatorAddress: string;
}

export interface VerificationVote {
  validatorAddress: string;
  blockHash: string;
  blockNumber: number;
  vote: 'valid' | 'invalid' | 'abstain';
  signature: string;
  votingPower: string;
  verifiedAt: Date;
}

export interface FinalityResult {
  blockNumber: number;
  blockHash: string;
  status: 'pending' | 'confirmed' | 'finalized' | 'rejected';
  totalVotes: number;
  validVotes: number;
  invalidVotes: number;
  abstainVotes: number;
  votingPowerForValid: bigint;
  votingPowerForInvalid: bigint;
  requiredQuorum: bigint;
  finalizedAt?: Date;
  confirmationLatencyMs?: number;
}

export interface BlockReward {
  validatorAddress: string;
  rewardType: 'proposer' | 'verifier' | 'committee';
  rewardAmount: string;
  gasFeesEarned: string;
  participationRole: string;
  votePower: string;
}

export class BlockFinalityEngine {
  private pendingBlocks: Map<number, BlockData> = new Map();
  private verificationVotes: Map<number, VerificationVote[]> = new Map();
  private finalityResults: Map<number, FinalityResult> = new Map();
  
  // Constants for TBURN consensus (2/3 + 1 quorum)
  private readonly QUORUM_NUMERATOR = BigInt(2);
  private readonly QUORUM_DENOMINATOR = BigInt(3);
  private readonly FINALITY_THRESHOLD_BLOCKS = 6; // Blocks after which finality is permanent
  
  // Reward constants (in Wei, 10^18 Wei = 1 TBURN)
  private readonly PROPOSER_REWARD = '2000000000000000000'; // 2 TBURN
  private readonly VERIFIER_REWARD = '100000000000000000'; // 0.1 TBURN per verifier
  private readonly GAS_FEE_PROPOSER_SHARE = 0.7; // 70% to proposer
  private readonly GAS_FEE_VERIFIER_SHARE = 0.3; // 30% distributed to verifiers
  
  /**
   * Register a new block for verification
   */
  registerBlockForVerification(block: BlockData): void {
    this.pendingBlocks.set(block.number, block);
    this.verificationVotes.set(block.number, []);
    this.finalityResults.set(block.number, {
      blockNumber: block.number,
      blockHash: block.hash,
      status: 'pending',
      totalVotes: 0,
      validVotes: 0,
      invalidVotes: 0,
      abstainVotes: 0,
      votingPowerForValid: BigInt(0),
      votingPowerForInvalid: BigInt(0),
      requiredQuorum: BigInt(0),
    });
  }

  /**
   * Simulate cross-validator verification
   * In production, this would be triggered by P2P network messages
   */
  simulateValidatorVerification(
    blockNumber: number,
    validators: ValidatorInfo[]
  ): VerificationVote[] {
    const block = this.pendingBlocks.get(blockNumber);
    if (!block) {
      throw new Error(`Block ${blockNumber} not registered for verification`);
    }

    const votes: VerificationVote[] = [];
    
    // Calculate total voting power
    let totalVotingPower = BigInt(0);
    for (const validator of validators) {
      totalVotingPower += BigInt(validator.votingPower || '0');
    }

    // Simulate each validator's verification
    for (const validator of validators) {
      if (validator.status !== 'active') continue;
      
      // Simulate block verification (in production: actual block integrity check)
      const verificationResult = BlockVerifier.verifyBlockIntegrity(
        block.hash,
        block.number,
        block.parentHash,
        block.stateRoot,
        block.receiptsRoot,
        block.transactionHashes,
        block.timestamp
      );
      
      // Determine vote based on verification result
      // Simulating 99%+ valid rate for mainnet
      const random = Math.random();
      let vote: 'valid' | 'invalid' | 'abstain';
      if (random < 0.995) {
        vote = verificationResult.valid ? 'valid' : 'invalid';
      } else if (random < 0.998) {
        vote = 'abstain';
      } else {
        vote = 'invalid';
      }
      
      const signature = ValidatorSignatureGenerator.generateVerificationSignature(
        validator.address,
        block.hash,
        block.number,
        vote
      );
      
      const verificationVote: VerificationVote = {
        validatorAddress: validator.address,
        blockHash: block.hash,
        blockNumber: block.number,
        vote,
        signature,
        votingPower: validator.votingPower,
        verifiedAt: new Date(),
      };
      
      votes.push(verificationVote);
    }
    
    // Store votes
    this.verificationVotes.set(blockNumber, votes);
    
    return votes;
  }

  /**
   * Process votes and determine block finality
   */
  processVotesForFinality(
    blockNumber: number,
    totalVotingPower: bigint
  ): FinalityResult {
    const votes = this.verificationVotes.get(blockNumber) || [];
    const block = this.pendingBlocks.get(blockNumber);
    
    if (!block) {
      throw new Error(`Block ${blockNumber} not found`);
    }
    
    const startTime = Date.now();
    
    let validVotes = 0;
    let invalidVotes = 0;
    let abstainVotes = 0;
    let votingPowerForValid = BigInt(0);
    let votingPowerForInvalid = BigInt(0);
    
    for (const vote of votes) {
      const power = BigInt(vote.votingPower || '0');
      
      switch (vote.vote) {
        case 'valid':
          validVotes++;
          votingPowerForValid += power;
          break;
        case 'invalid':
          invalidVotes++;
          votingPowerForInvalid += power;
          break;
        case 'abstain':
          abstainVotes++;
          break;
      }
    }
    
    // Calculate required quorum (2/3 + 1 of total voting power)
    const requiredQuorum = (totalVotingPower * this.QUORUM_NUMERATOR / this.QUORUM_DENOMINATOR) + BigInt(1);
    
    // Determine finality status
    let status: FinalityResult['status'];
    if (votingPowerForValid >= requiredQuorum) {
      status = 'confirmed';
    } else if (votingPowerForInvalid >= requiredQuorum) {
      status = 'rejected';
    } else {
      status = 'pending';
    }
    
    const result: FinalityResult = {
      blockNumber,
      blockHash: block.hash,
      status,
      totalVotes: votes.length,
      validVotes,
      invalidVotes,
      abstainVotes,
      votingPowerForValid,
      votingPowerForInvalid,
      requiredQuorum,
      finalizedAt: status === 'confirmed' ? new Date() : undefined,
      confirmationLatencyMs: Date.now() - startTime,
    };
    
    this.finalityResults.set(blockNumber, result);
    
    return result;
  }

  /**
   * Check if a block should be upgraded from confirmed to finalized
   */
  checkForPermanentFinality(currentBlockNumber: number): number[] {
    const finalizedBlocks: number[] = [];
    
    for (const [blockNumber, result] of Array.from(this.finalityResults.entries())) {
      if (result.status === 'confirmed' && 
          currentBlockNumber - blockNumber >= this.FINALITY_THRESHOLD_BLOCKS) {
        result.status = 'finalized';
        finalizedBlocks.push(blockNumber);
      }
    }
    
    return finalizedBlocks;
  }

  /**
   * Calculate and distribute block rewards
   */
  calculateBlockRewards(
    blockNumber: number,
    proposerAddress: string,
    gasFeesCollected: string,
    verifierAddresses: string[]
  ): BlockReward[] {
    const rewards: BlockReward[] = [];
    
    // Proposer reward (fixed + gas fees share)
    const gasFeesProposer = BigInt(Math.floor(
      Number(BigInt(gasFeesCollected)) * this.GAS_FEE_PROPOSER_SHARE
    ));
    
    rewards.push({
      validatorAddress: proposerAddress,
      rewardType: 'proposer',
      rewardAmount: this.PROPOSER_REWARD,
      gasFeesEarned: gasFeesProposer.toString(),
      participationRole: 'proposer',
      votePower: '0', // Will be filled by caller
    });
    
    // Verifier rewards (split among all verifiers)
    if (verifierAddresses.length > 0) {
      const gasFeesVerifier = BigInt(Math.floor(
        Number(BigInt(gasFeesCollected)) * this.GAS_FEE_VERIFIER_SHARE / verifierAddresses.length
      ));
      
      for (const address of verifierAddresses) {
        rewards.push({
          validatorAddress: address,
          rewardType: 'verifier',
          rewardAmount: this.VERIFIER_REWARD,
          gasFeesEarned: gasFeesVerifier.toString(),
          participationRole: 'verifier',
          votePower: '0', // Will be filled by caller
        });
      }
    }
    
    return rewards;
  }

  /**
   * Get finality status for a block
   */
  getFinalityStatus(blockNumber: number): FinalityResult | undefined {
    return this.finalityResults.get(blockNumber);
  }

  /**
   * Get all pending blocks awaiting finality
   */
  getPendingBlocks(): BlockData[] {
    return Array.from(this.pendingBlocks.values()).filter(
      block => {
        const result = this.finalityResults.get(block.number);
        return result && result.status === 'pending';
      }
    );
  }

  /**
   * Clean up finalized blocks from memory
   */
  cleanupFinalizedBlocks(keepLastN: number = 100): number {
    const blockNumbers = Array.from(this.finalityResults.keys()).sort((a, b) => b - a);
    let cleaned = 0;
    
    for (let i = keepLastN; i < blockNumbers.length; i++) {
      const blockNumber = blockNumbers[i];
      const result = this.finalityResults.get(blockNumber);
      
      if (result && result.status === 'finalized') {
        this.pendingBlocks.delete(blockNumber);
        this.verificationVotes.delete(blockNumber);
        this.finalityResults.delete(blockNumber);
        cleaned++;
      }
    }
    
    return cleaned;
  }

  /**
   * Get verification statistics
   */
  getStatistics(): {
    pendingBlocks: number;
    confirmedBlocks: number;
    finalizedBlocks: number;
    rejectedBlocks: number;
    totalVotesProcessed: number;
    avgConfirmationLatency: number;
  } {
    let pending = 0;
    let confirmed = 0;
    let finalized = 0;
    let rejected = 0;
    let totalVotes = 0;
    let totalLatency = 0;
    let latencyCount = 0;
    
    for (const result of Array.from(this.finalityResults.values())) {
      totalVotes += result.totalVotes;
      
      switch (result.status) {
        case 'pending': pending++; break;
        case 'confirmed': confirmed++; break;
        case 'finalized': finalized++; break;
        case 'rejected': rejected++; break;
      }
      
      if (result.confirmationLatencyMs) {
        totalLatency += result.confirmationLatencyMs;
        latencyCount++;
      }
    }
    
    return {
      pendingBlocks: pending,
      confirmedBlocks: confirmed,
      finalizedBlocks: finalized,
      rejectedBlocks: rejected,
      totalVotesProcessed: totalVotes,
      avgConfirmationLatency: latencyCount > 0 ? totalLatency / latencyCount : 0,
    };
  }
}

// Export singleton instance
export const blockFinalityEngine = new BlockFinalityEngine();

export default BlockFinalityEngine;
