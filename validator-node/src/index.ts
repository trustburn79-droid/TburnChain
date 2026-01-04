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
import { startApiServer } from './api/routes';
import { ValidatorNodeConfig } from './config/types';
import { DEFAULT_CONFIG } from './config/default';
import { CryptoManager } from './crypto/keys';

export async function createValidatorNode(
  customConfig?: Partial<ValidatorNodeConfig>
): Promise<ValidatorNode> {
  const keyPair = CryptoManager.generateKeyPair();
  
  const config: ValidatorNodeConfig = {
    ...DEFAULT_CONFIG,
    validator: {
      address: keyPair.address,
      privateKey: keyPair.privateKey,
      publicKey: keyPair.publicKey,
      stake: '1000000000000000000000000',
      commission: 0.1,
      name: 'TBURN Validator',
      description: 'TBURN Mainnet Validator Node',
    },
    ...customConfig,
  };

  const node = new ValidatorNode(config);
  
  if (config.api.enabled) {
    startApiServer(node, config.api);
  }

  return node;
}

export async function startValidator(
  configPath?: string
): Promise<ValidatorNode> {
  let config: ValidatorNodeConfig;
  
  if (configPath) {
    const fs = await import('fs');
    const configData = fs.readFileSync(configPath, 'utf-8');
    config = JSON.parse(configData);
  } else {
    const keyPair = CryptoManager.generateKeyPair();
    config = {
      ...DEFAULT_CONFIG,
      validator: {
        address: keyPair.address,
        privateKey: keyPair.privateKey,
        publicKey: keyPair.publicKey,
        stake: '1000000000000000000000000',
        commission: 0.1,
        name: 'TBURN Validator',
        description: 'TBURN Mainnet Validator Node',
      },
    };
  }
  
  const node = new ValidatorNode(config);
  
  if (config.api.enabled) {
    startApiServer(node, config.api);
  }
  
  await node.start();
  
  return node;
}
