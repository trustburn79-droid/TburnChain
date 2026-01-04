/**
 * TBURN Enterprise BFT Consensus Module
 * 
 * Exports:
 * - EnterpriseBFTEngine: Core 5-phase BFT consensus implementation
 * - ConsensusCoordinator: Integration layer with blockchain infrastructure
 * - Types and enums for consensus operations
 */

export {
  EnterpriseBFTEngine,
  enterpriseBFTEngine,
  ConsensusPhase,
  VoteType,
  ConsensusState,
  type ValidatorInfo,
  type BlockProposal,
  type Vote,
  type AggregatedVotes,
  type ConsensusRoundState,
  type ConsensusMetrics,
  type ViewChangeRequest
} from './enterprise-bft-engine';

export {
  ConsensusCoordinator,
  consensusCoordinator,
  type ConsensusStats,
  type ConsensusConfig
} from './consensus-coordinator';
