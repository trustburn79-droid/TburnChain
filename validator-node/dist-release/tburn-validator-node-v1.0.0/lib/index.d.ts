/**
 * TBURN Validator Node
 * Enterprise Production-Grade Standalone Validator
 *
 * Main Entry Point
 */
export { ValidatorNode } from './core/validator-node';
export { BFTConsensusEngine, type ValidatorInfo, type BlockProposal, type ConsensusMetrics } from './consensus/bft-engine';
export { P2PNetwork, MessageType, type P2PMessage } from './network/p2p';
export { BlockStore, StateStore } from './storage/block-store';
export { CryptoManager, QuantumResistantSigner, type KeyPair, type SignedMessage } from './crypto/keys';
export { createApiRouter, startApiServer } from './api/routes';
export { Logger, createModuleLogger } from './utils/logger';
export { DEFAULT_CONFIG, CHAIN_CONSTANTS, GENESIS_VALIDATORS_REGIONS } from './config/default';
export * from './config/types';
import { ValidatorNode } from './core/validator-node';
import { ValidatorNodeConfig } from './config/types';
export declare function createValidatorNode(customConfig?: Partial<ValidatorNodeConfig>): Promise<ValidatorNode>;
export declare function startValidator(configPath?: string): Promise<ValidatorNode>;
//# sourceMappingURL=index.d.ts.map