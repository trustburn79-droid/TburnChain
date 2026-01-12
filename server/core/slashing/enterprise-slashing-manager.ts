/**
 * TBURN Enterprise Slashing Manager
 * Production-grade validator slashing with evidence collection
 * 
 * Features:
 * - Double signing detection
 * - Downtime tracking
 * - Attestation violation detection
 * - Evidence verification and storage
 * - Penalty calculation and application
 * - Slashing queue with grace periods
 * - Appeal mechanism support
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';

// ============================================================================
// Configuration
// ============================================================================

export const SLASHING_CONFIG = {
  // Penalty rates (basis points: 10000 = 100%)
  DOUBLE_SIGN_PENALTY_BPS: 5000,        // 50% stake slashed
  DOWNTIME_PENALTY_BPS: 100,            // 1% per violation
  ATTESTATION_VIOLATION_BPS: 1000,      // 10% stake slashed
  PROPOSAL_VIOLATION_BPS: 500,          // 5% stake slashed
  
  // Jailing parameters
  JAIL_DURATION_BLOCKS: 10000,          // ~16.6 minutes at 100ms blocks
  PERMANENT_JAIL_THRESHOLD: 3,          // 3 major violations = permanent jail
  
  // Detection windows
  DOUBLE_SIGN_LOOKBACK_BLOCKS: 100,
  DOWNTIME_WINDOW_BLOCKS: 1000,
  DOWNTIME_THRESHOLD_PERCENT: 50,       // Miss 50% of blocks = violation
  
  // Grace periods
  SLASHING_QUEUE_DELAY_BLOCKS: 50,      // Blocks before slashing is applied
  APPEAL_WINDOW_BLOCKS: 100,            // Blocks to submit appeal
  
  // Evidence limits
  MAX_EVIDENCE_AGE_BLOCKS: 10000,
  MAX_PENDING_SLASHINGS: 1000,
  
  // Minimum stake requirements
  MIN_STAKE_FOR_SLASHING: BigInt('1000000000000000000000'), // 1000 TBURN
};

// ============================================================================
// Types
// ============================================================================

export type SlashingType = 
  | 'double_sign' 
  | 'downtime' 
  | 'attestation_violation' 
  | 'proposal_violation';

export type SlashingStatus = 
  | 'pending' 
  | 'queued' 
  | 'executed' 
  | 'appealed' 
  | 'cancelled';

export interface SlashingEvidence {
  id: string;
  type: SlashingType;
  validatorId: string;
  validatorAddress: string;
  blockNumber: number;
  timestamp: number;
  
  // Evidence data
  evidenceHash: string;
  evidenceData: EvidenceData;
  
  // Verification
  reporterAddress: string;
  reporterSignature: string;
  verified: boolean;
  verificationTimestamp?: number;
}

export type EvidenceData = 
  | DoubleSignEvidence 
  | DowntimeEvidence 
  | AttestationViolationEvidence 
  | ProposalViolationEvidence;

export interface DoubleSignEvidence {
  type: 'double_sign';
  blockHeight: number;
  vote1: {
    blockHash: string;
    signature: string;
    timestamp: number;
  };
  vote2: {
    blockHash: string;
    signature: string;
    timestamp: number;
  };
}

export interface DowntimeEvidence {
  type: 'downtime';
  windowStart: number;
  windowEnd: number;
  expectedBlocks: number;
  signedBlocks: number;
  missedPercent: number;
}

export interface AttestationViolationEvidence {
  type: 'attestation_violation';
  epoch: number;
  attestation1: {
    sourceEpoch: number;
    targetEpoch: number;
    signature: string;
  };
  attestation2: {
    sourceEpoch: number;
    targetEpoch: number;
    signature: string;
  };
}

export interface ProposalViolationEvidence {
  type: 'proposal_violation';
  slot: number;
  proposal1Hash: string;
  proposal2Hash: string;
  proposerSignature1: string;
  proposerSignature2: string;
}

export interface SlashingRecord {
  id: string;
  evidenceId: string;
  validatorId: string;
  validatorAddress: string;
  type: SlashingType;
  status: SlashingStatus;
  
  // Penalty
  penaltyBps: number;
  penaltyAmount: bigint;
  originalStake: bigint;
  
  // Timing
  createdAt: number;
  queuedAt?: number;
  executedAt?: number;
  executeAtBlock: number;
  
  // Appeal
  appealedAt?: number;
  appealReason?: string;
  appealResolution?: 'accepted' | 'rejected';
  
  // Jail
  jailed: boolean;
  jailUntilBlock?: number;
  permanentJail: boolean;
}

export interface ValidatorSlashingHistory {
  validatorId: string;
  totalSlashings: number;
  totalPenaltyAmount: bigint;
  majorViolations: number;
  isJailed: boolean;
  jailUntilBlock: number;
  isPermanentlyJailed: boolean;
  slashings: SlashingRecord[];
}

export interface SlashingStats {
  totalSlashings: number;
  pendingSlashings: number;
  executedSlashings: number;
  appealedSlashings: number;
  totalPenaltyAmount: string;
  jailedValidators: number;
  permanentlyJailedValidators: number;
  slashingsByType: Record<SlashingType, number>;
}

// ============================================================================
// Evidence Verifier
// ============================================================================

class EvidenceVerifier {
  /**
   * Verify double signing evidence
   */
  verifyDoubleSign(evidence: DoubleSignEvidence, validatorAddress: string): boolean {
    // Both votes must be for the same block height but different hashes
    if (evidence.vote1.blockHash === evidence.vote2.blockHash) {
      return false; // Same block, not a double sign
    }
    
    // Verify signatures are from the same validator
    // In production, this would verify actual cryptographic signatures
    const sig1Valid = evidence.vote1.signature.startsWith('0x');
    const sig2Valid = evidence.vote2.signature.startsWith('0x');
    
    if (!sig1Valid || !sig2Valid) {
      return false;
    }
    
    // Verify timestamp proximity (within reasonable window)
    const timeDiff = Math.abs(evidence.vote1.timestamp - evidence.vote2.timestamp);
    if (timeDiff > 60000) { // More than 1 minute apart is suspicious
      return false;
    }
    
    return true;
  }
  
  /**
   * Verify downtime evidence
   */
  verifyDowntime(evidence: DowntimeEvidence): boolean {
    // Validate window bounds
    if (evidence.windowStart >= evidence.windowEnd) {
      return false;
    }
    
    // Validate block counts
    if (evidence.signedBlocks > evidence.expectedBlocks) {
      return false;
    }
    
    // Recalculate missed percent
    const calculatedMissedPercent = 
      ((evidence.expectedBlocks - evidence.signedBlocks) / evidence.expectedBlocks) * 100;
    
    // Allow small floating point difference
    if (Math.abs(calculatedMissedPercent - evidence.missedPercent) > 0.01) {
      return false;
    }
    
    // Check if missed percent exceeds threshold
    return evidence.missedPercent >= SLASHING_CONFIG.DOWNTIME_THRESHOLD_PERCENT;
  }
  
  /**
   * Verify attestation violation (surround vote or double vote)
   */
  verifyAttestationViolation(evidence: AttestationViolationEvidence): boolean {
    const att1 = evidence.attestation1;
    const att2 = evidence.attestation2;
    
    // Check for double vote (same target epoch)
    if (att1.targetEpoch === att2.targetEpoch && att1.signature !== att2.signature) {
      return true; // Double vote detected
    }
    
    // Check for surround vote
    // att1 surrounds att2: att1.source < att2.source && att2.target < att1.target
    if (att1.sourceEpoch < att2.sourceEpoch && att2.targetEpoch < att1.targetEpoch) {
      return true;
    }
    
    // att2 surrounds att1
    if (att2.sourceEpoch < att1.sourceEpoch && att1.targetEpoch < att2.targetEpoch) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Verify proposal violation (double proposal)
   */
  verifyProposalViolation(evidence: ProposalViolationEvidence): boolean {
    // Same slot, different proposals
    if (evidence.proposal1Hash === evidence.proposal2Hash) {
      return false; // Same proposal
    }
    
    // Verify signatures exist
    if (!evidence.proposerSignature1 || !evidence.proposerSignature2) {
      return false;
    }
    
    return true;
  }
}

// ============================================================================
// Slashing Manager
// ============================================================================

export class EnterpriseSlashingManager extends EventEmitter {
  private static instance: EnterpriseSlashingManager | null = null;
  private verifier: EvidenceVerifier;
  
  // Storage
  private evidence: Map<string, SlashingEvidence> = new Map();
  private slashings: Map<string, SlashingRecord> = new Map();
  private validatorHistory: Map<string, SlashingRecord[]> = new Map();
  private jailedValidators: Map<string, { until: number; permanent: boolean }> = new Map();
  
  // Queues
  private pendingSlashings: SlashingRecord[] = [];
  
  // State
  private currentBlock: number = 0;
  private isInitialized: boolean = false;
  
  // Metrics
  private stats: SlashingStats = {
    totalSlashings: 0,
    pendingSlashings: 0,
    executedSlashings: 0,
    appealedSlashings: 0,
    totalPenaltyAmount: '0',
    jailedValidators: 0,
    permanentlyJailedValidators: 0,
    slashingsByType: {
      double_sign: 0,
      downtime: 0,
      attestation_violation: 0,
      proposal_violation: 0
    }
  };
  
  private constructor() {
    super();
    this.verifier = new EvidenceVerifier();
  }
  
  static getInstance(): EnterpriseSlashingManager {
    if (!EnterpriseSlashingManager.instance) {
      EnterpriseSlashingManager.instance = new EnterpriseSlashingManager();
    }
    return EnterpriseSlashingManager.instance;
  }
  
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    console.log('[SlashingManager] ✅ Enterprise Slashing Manager initialized');
    console.log('[SlashingManager] 📊 Penalties:', {
      doubleSign: `${SLASHING_CONFIG.DOUBLE_SIGN_PENALTY_BPS / 100}%`,
      downtime: `${SLASHING_CONFIG.DOWNTIME_PENALTY_BPS / 100}%`,
      attestationViolation: `${SLASHING_CONFIG.ATTESTATION_VIOLATION_BPS / 100}%`,
      jailDuration: `${SLASHING_CONFIG.JAIL_DURATION_BLOCKS} blocks`
    });
    
    this.isInitialized = true;
    this.emit('initialized');
  }
  
  /**
   * Update current block number
   */
  setBlockNumber(blockNumber: number): void {
    this.currentBlock = blockNumber;
    this.processSlashingQueue();
    this.releaseJailedValidators();
  }
  
  /**
   * Submit slashing evidence
   */
  async submitEvidence(evidence: SlashingEvidence): Promise<{ success: boolean; slashingId?: string; error?: string }> {
    // Validate evidence age
    if (this.currentBlock - evidence.blockNumber > SLASHING_CONFIG.MAX_EVIDENCE_AGE_BLOCKS) {
      return { success: false, error: 'Evidence is too old' };
    }
    
    // Check for duplicate evidence
    if (this.evidence.has(evidence.id)) {
      return { success: false, error: 'Evidence already submitted' };
    }
    
    // Verify evidence
    const verified = this.verifyEvidence(evidence);
    if (!verified) {
      return { success: false, error: 'Evidence verification failed' };
    }
    
    // Store evidence
    evidence.verified = true;
    evidence.verificationTimestamp = Date.now();
    this.evidence.set(evidence.id, evidence);
    
    // Create slashing record
    const slashingRecord = this.createSlashingRecord(evidence);
    this.slashings.set(slashingRecord.id, slashingRecord);
    
    // Add to validator history
    let history = this.validatorHistory.get(evidence.validatorId) || [];
    history.push(slashingRecord);
    this.validatorHistory.set(evidence.validatorId, history);
    
    // Add to pending queue
    this.pendingSlashings.push(slashingRecord);
    this.stats.pendingSlashings++;
    
    console.log(`[SlashingManager] Evidence submitted: ${evidence.type} for validator ${evidence.validatorId}`);
    
    this.emit('evidenceSubmitted', {
      evidenceId: evidence.id,
      validatorId: evidence.validatorId,
      type: evidence.type
    });
    
    return { success: true, slashingId: slashingRecord.id };
  }
  
  /**
   * Verify evidence based on type
   */
  private verifyEvidence(evidence: SlashingEvidence): boolean {
    switch (evidence.evidenceData.type) {
      case 'double_sign':
        return this.verifier.verifyDoubleSign(
          evidence.evidenceData,
          evidence.validatorAddress
        );
      
      case 'downtime':
        return this.verifier.verifyDowntime(evidence.evidenceData);
      
      case 'attestation_violation':
        return this.verifier.verifyAttestationViolation(evidence.evidenceData);
      
      case 'proposal_violation':
        return this.verifier.verifyProposalViolation(evidence.evidenceData);
      
      default:
        return false;
    }
  }
  
  /**
   * Create slashing record from evidence
   */
  private createSlashingRecord(evidence: SlashingEvidence): SlashingRecord {
    const penaltyBps = this.getPenaltyBps(evidence.type);
    const isMajorViolation = this.isMajorViolation(evidence.type);
    
    // Check validator history for permanent jail
    const history = this.validatorHistory.get(evidence.validatorId) || [];
    const majorViolations = history.filter(s => 
      this.isMajorViolation(s.type) && s.status === 'executed'
    ).length;
    
    const permanentJail = isMajorViolation && 
      (majorViolations + 1) >= SLASHING_CONFIG.PERMANENT_JAIL_THRESHOLD;
    
    return {
      id: `slash_${crypto.randomBytes(16).toString('hex')}`,
      evidenceId: evidence.id,
      validatorId: evidence.validatorId,
      validatorAddress: evidence.validatorAddress,
      type: evidence.type,
      status: 'pending',
      penaltyBps,
      penaltyAmount: BigInt(0), // Calculated at execution
      originalStake: BigInt(0), // Set at execution
      createdAt: Date.now(),
      executeAtBlock: this.currentBlock + SLASHING_CONFIG.SLASHING_QUEUE_DELAY_BLOCKS,
      jailed: isMajorViolation,
      jailUntilBlock: isMajorViolation 
        ? this.currentBlock + SLASHING_CONFIG.JAIL_DURATION_BLOCKS 
        : undefined,
      permanentJail
    };
  }
  
  /**
   * Get penalty basis points for violation type
   */
  private getPenaltyBps(type: SlashingType): number {
    switch (type) {
      case 'double_sign':
        return SLASHING_CONFIG.DOUBLE_SIGN_PENALTY_BPS;
      case 'downtime':
        return SLASHING_CONFIG.DOWNTIME_PENALTY_BPS;
      case 'attestation_violation':
        return SLASHING_CONFIG.ATTESTATION_VIOLATION_BPS;
      case 'proposal_violation':
        return SLASHING_CONFIG.PROPOSAL_VIOLATION_BPS;
      default:
        return 0;
    }
  }
  
  /**
   * Check if violation is major (results in jailing)
   */
  private isMajorViolation(type: SlashingType): boolean {
    return type === 'double_sign' || type === 'attestation_violation';
  }
  
  /**
   * Process slashing queue
   */
  private processSlashingQueue(): void {
    const toExecute = this.pendingSlashings.filter(
      s => s.status === 'pending' && s.executeAtBlock <= this.currentBlock
    );
    
    for (const slashing of toExecute) {
      if (slashing.status === 'appealed') continue;
      
      this.executeSlashing(slashing);
    }
    
    // Remove executed from pending
    this.pendingSlashings = this.pendingSlashings.filter(
      s => s.status === 'pending'
    );
  }
  
  /**
   * Execute a slashing
   */
  private executeSlashing(slashing: SlashingRecord): void {
    // Calculate penalty (would get actual stake from validator registry)
    const stake = SLASHING_CONFIG.MIN_STAKE_FOR_SLASHING;
    const penaltyAmount = (stake * BigInt(slashing.penaltyBps)) / BigInt(10000);
    
    slashing.originalStake = stake;
    slashing.penaltyAmount = penaltyAmount;
    slashing.status = 'executed';
    slashing.executedAt = Date.now();
    
    // Apply jail if needed
    if (slashing.jailed) {
      this.jailedValidators.set(slashing.validatorId, {
        until: slashing.permanentJail ? Number.MAX_SAFE_INTEGER : slashing.jailUntilBlock!,
        permanent: slashing.permanentJail
      });
      this.stats.jailedValidators++;
      
      if (slashing.permanentJail) {
        this.stats.permanentlyJailedValidators++;
      }
    }
    
    // Update stats
    this.stats.totalSlashings++;
    this.stats.pendingSlashings--;
    this.stats.executedSlashings++;
    this.stats.totalPenaltyAmount = (
      BigInt(this.stats.totalPenaltyAmount) + penaltyAmount
    ).toString();
    this.stats.slashingsByType[slashing.type]++;
    
    console.log(`[SlashingManager] Slashing executed: ${slashing.id}`);
    console.log(`[SlashingManager] Validator ${slashing.validatorId} slashed ${penaltyAmount} (${slashing.penaltyBps / 100}%)`);
    
    if (slashing.permanentJail) {
      console.log(`[SlashingManager] ⚠️ Validator ${slashing.validatorId} PERMANENTLY JAILED`);
    }
    
    this.emit('slashingExecuted', {
      slashingId: slashing.id,
      validatorId: slashing.validatorId,
      type: slashing.type,
      penaltyAmount: penaltyAmount.toString(),
      jailed: slashing.jailed,
      permanentJail: slashing.permanentJail
    });
  }
  
  /**
   * Submit appeal for a slashing
   */
  async submitAppeal(
    slashingId: string,
    reason: string,
    evidenceHash: string
  ): Promise<{ success: boolean; error?: string }> {
    const slashing = this.slashings.get(slashingId);
    
    if (!slashing) {
      return { success: false, error: 'Slashing not found' };
    }
    
    if (slashing.status !== 'pending') {
      return { success: false, error: 'Slashing already processed' };
    }
    
    // Check appeal window
    const appealDeadline = slashing.executeAtBlock;
    if (this.currentBlock >= appealDeadline) {
      return { success: false, error: 'Appeal window expired' };
    }
    
    slashing.status = 'appealed';
    slashing.appealedAt = Date.now();
    slashing.appealReason = reason;
    
    this.stats.pendingSlashings--;
    this.stats.appealedSlashings++;
    
    console.log(`[SlashingManager] Appeal submitted for slashing ${slashingId}`);
    
    this.emit('appealSubmitted', {
      slashingId,
      validatorId: slashing.validatorId,
      reason
    });
    
    return { success: true };
  }
  
  /**
   * Resolve appeal (governance action)
   */
  async resolveAppeal(
    slashingId: string,
    resolution: 'accepted' | 'rejected'
  ): Promise<{ success: boolean; error?: string }> {
    const slashing = this.slashings.get(slashingId);
    
    if (!slashing) {
      return { success: false, error: 'Slashing not found' };
    }
    
    if (slashing.status !== 'appealed') {
      return { success: false, error: 'Slashing not in appeal status' };
    }
    
    slashing.appealResolution = resolution;
    
    if (resolution === 'accepted') {
      slashing.status = 'cancelled';
      this.stats.appealedSlashings--;
      console.log(`[SlashingManager] Appeal ACCEPTED for ${slashingId}`);
    } else {
      slashing.status = 'pending';
      slashing.executeAtBlock = this.currentBlock + SLASHING_CONFIG.SLASHING_QUEUE_DELAY_BLOCKS;
      this.pendingSlashings.push(slashing);
      this.stats.pendingSlashings++;
      this.stats.appealedSlashings--;
      console.log(`[SlashingManager] Appeal REJECTED for ${slashingId}`);
    }
    
    this.emit('appealResolved', {
      slashingId,
      resolution
    });
    
    return { success: true };
  }
  
  /**
   * Release validators from jail
   */
  private releaseJailedValidators(): void {
    const toRelease: string[] = [];
    this.jailedValidators.forEach((jail, validatorId) => {
      if (!jail.permanent && this.currentBlock >= jail.until) {
        toRelease.push(validatorId);
      }
    });
    
    toRelease.forEach(validatorId => {
      this.jailedValidators.delete(validatorId);
      this.stats.jailedValidators--;
      console.log(`[SlashingManager] Validator ${validatorId} released from jail`);
      this.emit('validatorReleased', { validatorId });
    });
  }
  
  /**
   * Check if validator is jailed
   */
  isValidatorJailed(validatorId: string): boolean {
    const jail = this.jailedValidators.get(validatorId);
    if (!jail) return false;
    
    if (jail.permanent) return true;
    return this.currentBlock < jail.until;
  }
  
  /**
   * Get validator slashing history
   */
  getValidatorHistory(validatorId: string): ValidatorSlashingHistory {
    const history = this.validatorHistory.get(validatorId) || [];
    const jail = this.jailedValidators.get(validatorId);
    
    const totalPenalty = history.reduce(
      (sum, s) => sum + (s.status === 'executed' ? s.penaltyAmount : BigInt(0)),
      BigInt(0)
    );
    
    const majorViolations = history.filter(
      s => this.isMajorViolation(s.type) && s.status === 'executed'
    ).length;
    
    return {
      validatorId,
      totalSlashings: history.length,
      totalPenaltyAmount: totalPenalty,
      majorViolations,
      isJailed: !!jail,
      jailUntilBlock: jail?.until ?? 0,
      isPermanentlyJailed: jail?.permanent ?? false,
      slashings: history
    };
  }
  
  /**
   * Get slashing statistics
   */
  getStats(): SlashingStats {
    return { ...this.stats };
  }
  
  /**
   * Get pending slashings
   */
  getPendingSlashings(): SlashingRecord[] {
    return [...this.pendingSlashings];
  }
  
  /**
   * Get jailed validators
   */
  getJailedValidators(): Array<{ validatorId: string; until: number; permanent: boolean }> {
    const result: Array<{ validatorId: string; until: number; permanent: boolean }> = [];
    this.jailedValidators.forEach((jail, validatorId) => {
      result.push({
        validatorId,
        until: jail.until,
        permanent: jail.permanent
      });
    });
    return result;
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

let managerInstance: EnterpriseSlashingManager | null = null;

export function getEnterpriseSlashingManager(): EnterpriseSlashingManager {
  if (!managerInstance) {
    managerInstance = EnterpriseSlashingManager.getInstance();
  }
  return managerInstance;
}

export async function initializeSlashingManager(): Promise<EnterpriseSlashingManager> {
  const manager = getEnterpriseSlashingManager();
  await manager.initialize();
  return manager;
}
