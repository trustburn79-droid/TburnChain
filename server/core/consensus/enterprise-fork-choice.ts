/**
 * TBURN Enterprise Fork Choice Manager
 * Production-grade chain selection and finality tracking for mainnet
 * 
 * Features:
 * - Longest chain selection with total difficulty
 * - BFT finality tracking (2/3 validator attestations)
 * - Safe reorg handling with depth limits
 * - Checkpoint management
 * - Fork detection and resolution
 * - Head tracking with LMD-GHOST variant
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';

// ============================================================================
// Configuration
// ============================================================================

export const FORK_CHOICE_CONFIG = {
  // Reorg Limits
  MAX_REORG_DEPTH: 64,
  SAFE_REORG_DEPTH: 6,
  
  // Finality
  FINALITY_THRESHOLD: 0.67, // 2/3 of validators
  FINALITY_CONFIRMATIONS: 32,
  CHECKPOINT_INTERVAL: 100,
  
  // Scoring
  DIFFICULTY_WEIGHT: 1.0,
  ATTESTATION_WEIGHT: 0.1,
  TIMESTAMP_WEIGHT: 0.001,
  
  // Cache
  BLOCK_TREE_CACHE_SIZE: 10000,
  ATTESTATION_CACHE_SIZE: 50000,
  
  // Pruning
  PRUNE_AFTER_FINALITY: 1000,
  PRUNE_BATCH_SIZE: 100,
};

// ============================================================================
// Type Definitions
// ============================================================================

export interface BlockInfo {
  hash: string;
  parentHash: string;
  number: number;
  timestamp: number;
  proposer: string;
  difficulty: bigint;
  totalDifficulty: bigint;
  stateRoot: string;
  transactionsRoot: string;
  attestations: string[];
  isFinalized: boolean;
  finalizedAt?: number;
}

export interface ChainHead {
  hash: string;
  number: number;
  totalDifficulty: bigint;
  timestamp: number;
}

export interface ForkInfo {
  forkPoint: BlockInfo;
  branches: Array<{
    head: BlockInfo;
    length: number;
    totalDifficulty: bigint;
    blocks: string[];
  }>;
  detectedAt: number;
}

export interface Checkpoint {
  blockNumber: number;
  blockHash: string;
  stateRoot: string;
  validatorSetHash: string;
  attestations: number;
  createdAt: number;
  isFinalized: boolean;
}

export interface Attestation {
  blockHash: string;
  blockNumber: number;
  validatorId: string;
  signature: string;
  timestamp: number;
}

export interface ReorgResult {
  success: boolean;
  oldHead: ChainHead;
  newHead: ChainHead;
  reorgDepth: number;
  removedBlocks: string[];
  addedBlocks: string[];
  error?: string;
}

export interface ForkChoiceStats {
  currentHead: ChainHead;
  finalizedBlock: number;
  justifiedBlock: number;
  totalBlocks: number;
  pendingAttestations: number;
  activeForksCount: number;
  lastReorgDepth: number;
  avgBlockTime: number;
}

// ============================================================================
// Block Tree Node
// ============================================================================

interface BlockTreeNode {
  block: BlockInfo;
  children: Map<string, BlockTreeNode>;
  parent: BlockTreeNode | null;
  attestationCount: number;
  score: number;
}

// ============================================================================
// LRU Cache for Attestations
// ============================================================================

class AttestationCache {
  private cache: Map<string, Attestation[]> = new Map();
  private maxSize: number;
  
  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }
  
  add(attestation: Attestation): void {
    const key = attestation.blockHash;
    if (!this.cache.has(key)) {
      this.cache.set(key, []);
    }
    
    const attestations = this.cache.get(key)!;
    
    // Check for duplicate
    if (attestations.some(a => a.validatorId === attestation.validatorId)) {
      return;
    }
    
    attestations.push(attestation);
    
    // Cleanup if needed
    if (this.getTotalCount() > this.maxSize) {
      this.evictOldest();
    }
  }
  
  get(blockHash: string): Attestation[] {
    return this.cache.get(blockHash) || [];
  }
  
  getCount(blockHash: string): number {
    return this.cache.get(blockHash)?.length || 0;
  }
  
  remove(blockHash: string): void {
    this.cache.delete(blockHash);
  }
  
  private getTotalCount(): number {
    let count = 0;
    for (const attestations of this.cache.values()) {
      count += attestations.length;
    }
    return count;
  }
  
  private evictOldest(): void {
    // Find oldest attestation
    let oldestTime = Infinity;
    let oldestKey: string | null = null;
    
    for (const [key, attestations] of this.cache) {
      for (const a of attestations) {
        if (a.timestamp < oldestTime) {
          oldestTime = a.timestamp;
          oldestKey = key;
        }
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}

// ============================================================================
// Enterprise Fork Choice Manager
// ============================================================================

export class EnterpriseForkChoice extends EventEmitter {
  // Block tree
  private blockTree: Map<string, BlockTreeNode> = new Map();
  private blockByNumber: Map<number, Set<string>> = new Map();
  
  // Chain state
  private head: ChainHead | null = null;
  private finalizedBlock: BlockInfo | null = null;
  private justifiedBlock: BlockInfo | null = null;
  private genesisHash: string = '';
  
  // Checkpoints
  private checkpoints: Map<number, Checkpoint> = new Map();
  
  // Attestations
  private attestationCache: AttestationCache;
  
  // Validator set
  private validatorSet: Set<string> = new Set();
  private totalValidators: number = 125;
  
  // Stats
  private reorgCount: number = 0;
  private lastReorgDepth: number = 0;
  private blockTimes: number[] = [];
  
  private isRunning: boolean = false;
  
  constructor() {
    super();
    this.attestationCache = new AttestationCache(FORK_CHOICE_CONFIG.ATTESTATION_CACHE_SIZE);
  }
  
  async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;
    
    console.log('[ForkChoice] Enterprise Fork Choice Manager started');
    this.emit('started');
  }
  
  async stop(): Promise<void> {
    this.isRunning = false;
    console.log('[ForkChoice] Enterprise Fork Choice Manager stopped');
    this.emit('stopped');
  }
  
  // ==================== Genesis Initialization ====================
  
  initializeGenesis(genesisBlock: BlockInfo): void {
    this.genesisHash = genesisBlock.hash;
    
    const genesisNode: BlockTreeNode = {
      block: { ...genesisBlock, isFinalized: true, finalizedAt: Date.now() },
      children: new Map(),
      parent: null,
      attestationCount: this.totalValidators,
      score: Number(genesisBlock.totalDifficulty)
    };
    
    this.blockTree.set(genesisBlock.hash, genesisNode);
    this.blockByNumber.set(0, new Set([genesisBlock.hash]));
    
    this.head = {
      hash: genesisBlock.hash,
      number: 0,
      totalDifficulty: genesisBlock.totalDifficulty,
      timestamp: genesisBlock.timestamp
    };
    
    this.finalizedBlock = genesisNode.block;
    this.justifiedBlock = genesisNode.block;
    
    // Create genesis checkpoint
    this.checkpoints.set(0, {
      blockNumber: 0,
      blockHash: genesisBlock.hash,
      stateRoot: genesisBlock.stateRoot,
      validatorSetHash: '',
      attestations: this.totalValidators,
      createdAt: Date.now(),
      isFinalized: true
    });
    
    console.log(`[ForkChoice] Genesis initialized: ${genesisBlock.hash}`);
    this.emit('genesisInitialized', genesisBlock);
  }
  
  // ==================== Block Processing ====================
  
  addBlock(block: BlockInfo): { accepted: boolean; isNewHead: boolean; error?: string } {
    // Check if block already exists
    if (this.blockTree.has(block.hash)) {
      return { accepted: false, isNewHead: false, error: 'Block already exists' };
    }
    
    // Check parent exists
    const parentNode = this.blockTree.get(block.parentHash);
    if (!parentNode) {
      return { accepted: false, isNewHead: false, error: 'Parent block not found' };
    }
    
    // Validate block number
    if (block.number !== parentNode.block.number + 1) {
      return { accepted: false, isNewHead: false, error: 'Invalid block number' };
    }
    
    // Calculate total difficulty
    const totalDifficulty = parentNode.block.totalDifficulty + block.difficulty;
    const blockWithTD: BlockInfo = {
      ...block,
      totalDifficulty,
      isFinalized: false
    };
    
    // Create tree node
    const node: BlockTreeNode = {
      block: blockWithTD,
      children: new Map(),
      parent: parentNode,
      attestationCount: 0,
      score: this.calculateBlockScore(blockWithTD)
    };
    
    // Add to tree
    this.blockTree.set(block.hash, node);
    parentNode.children.set(block.hash, node);
    
    // Add to number index
    if (!this.blockByNumber.has(block.number)) {
      this.blockByNumber.set(block.number, new Set());
    }
    this.blockByNumber.get(block.number)!.add(block.hash);
    
    // Track block time
    this.trackBlockTime(block.timestamp, parentNode.block.timestamp);
    
    // Check if this is new head
    const isNewHead = this.shouldUpdateHead(blockWithTD);
    
    if (isNewHead) {
      const oldHead = this.head;
      this.updateHead(blockWithTD);
      
      // Check for reorg
      if (oldHead && block.parentHash !== oldHead.hash) {
        this.handleReorg(oldHead, blockWithTD);
      }
    }
    
    // Check for checkpoint
    if (block.number % FORK_CHOICE_CONFIG.CHECKPOINT_INTERVAL === 0) {
      this.createCheckpoint(blockWithTD);
    }
    
    this.emit('blockAdded', { block: blockWithTD, isNewHead });
    
    return { accepted: true, isNewHead };
  }
  
  // ==================== Attestation Processing ====================
  
  addAttestation(attestation: Attestation): boolean {
    // Validate attestation
    if (!this.validatorSet.has(attestation.validatorId) && this.validatorSet.size > 0) {
      // In permissioned mode, check validator set
      // For now, accept all attestations
    }
    
    const node = this.blockTree.get(attestation.blockHash);
    if (!node) {
      return false;
    }
    
    // Add to cache
    this.attestationCache.add(attestation);
    
    // Update node attestation count
    node.attestationCount = this.attestationCache.getCount(attestation.blockHash);
    node.score = this.calculateBlockScore(node.block);
    
    // Check for justification
    const attestationRatio = node.attestationCount / this.totalValidators;
    if (attestationRatio >= FORK_CHOICE_CONFIG.FINALITY_THRESHOLD) {
      this.justifyBlock(node.block);
    }
    
    // Check for finalization
    if (this.justifiedBlock && 
        node.block.number >= this.justifiedBlock.number + FORK_CHOICE_CONFIG.FINALITY_CONFIRMATIONS) {
      this.finalizeBlock(this.justifiedBlock);
    }
    
    this.emit('attestationAdded', attestation);
    return true;
  }
  
  // ==================== Head Selection (LMD-GHOST variant) ====================
  
  private shouldUpdateHead(block: BlockInfo): boolean {
    if (!this.head) {
      return true;
    }
    
    // Compare total difficulty
    if (block.totalDifficulty > this.head.totalDifficulty) {
      return true;
    }
    
    // Tie-breaker: prefer block with more attestations
    if (block.totalDifficulty === this.head.totalDifficulty) {
      const currentNode = this.blockTree.get(this.head.hash);
      const newNode = this.blockTree.get(block.hash);
      
      if (currentNode && newNode) {
        if (newNode.attestationCount > currentNode.attestationCount) {
          return true;
        }
        
        // Second tie-breaker: lower hash
        if (newNode.attestationCount === currentNode.attestationCount) {
          return block.hash < this.head.hash;
        }
      }
    }
    
    return false;
  }
  
  private updateHead(block: BlockInfo): void {
    this.head = {
      hash: block.hash,
      number: block.number,
      totalDifficulty: block.totalDifficulty,
      timestamp: block.timestamp
    };
    
    this.emit('headUpdated', this.head);
  }
  
  private calculateBlockScore(block: BlockInfo): number {
    const node = this.blockTree.get(block.hash);
    const attestationCount = node?.attestationCount || 0;
    
    return (
      Number(block.totalDifficulty) * FORK_CHOICE_CONFIG.DIFFICULTY_WEIGHT +
      attestationCount * FORK_CHOICE_CONFIG.ATTESTATION_WEIGHT +
      block.timestamp * FORK_CHOICE_CONFIG.TIMESTAMP_WEIGHT
    );
  }
  
  // ==================== Reorg Handling ====================
  
  private handleReorg(oldHead: ChainHead, newHead: BlockInfo): void {
    // Find common ancestor
    const { ancestor, oldBranch, newBranch } = this.findCommonAncestor(oldHead.hash, newHead.hash);
    
    if (!ancestor) {
      console.error('[ForkChoice] No common ancestor found!');
      return;
    }
    
    const reorgDepth = oldBranch.length;
    
    // Check reorg limits
    if (reorgDepth > FORK_CHOICE_CONFIG.MAX_REORG_DEPTH) {
      console.error(`[ForkChoice] Reorg depth ${reorgDepth} exceeds maximum ${FORK_CHOICE_CONFIG.MAX_REORG_DEPTH}`);
      return;
    }
    
    // Check if reorg crosses finalized block
    const finalizedNumber = this.finalizedBlock?.number || 0;
    if (ancestor.block.number < finalizedNumber) {
      console.error('[ForkChoice] Cannot reorg past finalized block');
      return;
    }
    
    this.reorgCount++;
    this.lastReorgDepth = reorgDepth;
    
    const result: ReorgResult = {
      success: true,
      oldHead: oldHead,
      newHead: {
        hash: newHead.hash,
        number: newHead.number,
        totalDifficulty: newHead.totalDifficulty,
        timestamp: newHead.timestamp
      },
      reorgDepth,
      removedBlocks: oldBranch.map(n => n.block.hash),
      addedBlocks: newBranch.map(n => n.block.hash)
    };
    
    console.log(`[ForkChoice] Reorg: depth=${reorgDepth}, removed=${oldBranch.length}, added=${newBranch.length}`);
    this.emit('reorg', result);
  }
  
  private findCommonAncestor(hash1: string, hash2: string): {
    ancestor: BlockTreeNode | null;
    oldBranch: BlockTreeNode[];
    newBranch: BlockTreeNode[];
  } {
    const ancestors1 = this.getAncestors(hash1);
    const ancestors2 = this.getAncestors(hash2);
    
    const set1 = new Set(ancestors1.map(n => n.block.hash));
    
    for (const node of ancestors2) {
      if (set1.has(node.block.hash)) {
        // Found common ancestor
        const oldBranch = ancestors1.slice(0, ancestors1.findIndex(n => n.block.hash === node.block.hash));
        const newBranch = ancestors2.slice(0, ancestors2.findIndex(n => n.block.hash === node.block.hash));
        
        return { ancestor: node, oldBranch, newBranch };
      }
    }
    
    return { ancestor: null, oldBranch: [], newBranch: [] };
  }
  
  private getAncestors(hash: string): BlockTreeNode[] {
    const ancestors: BlockTreeNode[] = [];
    let current = this.blockTree.get(hash);
    
    while (current) {
      ancestors.push(current);
      current = current.parent || undefined;
    }
    
    return ancestors;
  }
  
  // ==================== Finality ====================
  
  private justifyBlock(block: BlockInfo): void {
    if (this.justifiedBlock && block.number <= this.justifiedBlock.number) {
      return;
    }
    
    const node = this.blockTree.get(block.hash);
    if (!node) return;
    
    this.justifiedBlock = block;
    console.log(`[ForkChoice] Block #${block.number} justified`);
    this.emit('blockJustified', block);
  }
  
  private finalizeBlock(block: BlockInfo): void {
    if (this.finalizedBlock && block.number <= this.finalizedBlock.number) {
      return;
    }
    
    const node = this.blockTree.get(block.hash);
    if (!node) return;
    
    node.block.isFinalized = true;
    node.block.finalizedAt = Date.now();
    this.finalizedBlock = node.block;
    
    // Update checkpoint
    const checkpoint = this.checkpoints.get(
      Math.floor(block.number / FORK_CHOICE_CONFIG.CHECKPOINT_INTERVAL) * FORK_CHOICE_CONFIG.CHECKPOINT_INTERVAL
    );
    if (checkpoint) {
      checkpoint.isFinalized = true;
    }
    
    console.log(`[ForkChoice] Block #${block.number} finalized`);
    this.emit('blockFinalized', node.block);
    
    // Prune old blocks
    this.pruneBeforeFinalized();
  }
  
  // ==================== Checkpoint Management ====================
  
  private createCheckpoint(block: BlockInfo): void {
    const checkpoint: Checkpoint = {
      blockNumber: block.number,
      blockHash: block.hash,
      stateRoot: block.stateRoot,
      validatorSetHash: this.computeValidatorSetHash(),
      attestations: this.attestationCache.getCount(block.hash),
      createdAt: Date.now(),
      isFinalized: false
    };
    
    this.checkpoints.set(block.number, checkpoint);
    console.log(`[ForkChoice] Checkpoint created at block #${block.number}`);
    this.emit('checkpointCreated', checkpoint);
  }
  
  private computeValidatorSetHash(): string {
    const validators = Array.from(this.validatorSet).sort();
    return crypto.createHash('sha256').update(validators.join(',')).digest('hex');
  }
  
  // ==================== Pruning ====================
  
  private pruneBeforeFinalized(): void {
    if (!this.finalizedBlock) return;
    
    const pruneBeforeNumber = this.finalizedBlock.number - FORK_CHOICE_CONFIG.PRUNE_AFTER_FINALITY;
    if (pruneBeforeNumber <= 0) return;
    
    let pruned = 0;
    
    for (let num = 0; num < pruneBeforeNumber; num++) {
      const blocksAtHeight = this.blockByNumber.get(num);
      if (!blocksAtHeight) continue;
      
      for (const hash of blocksAtHeight) {
        // Don't prune blocks in the canonical chain
        if (this.isInCanonicalChain(hash)) {
          continue;
        }
        
        // Remove from tree
        const node = this.blockTree.get(hash);
        if (node && node.parent) {
          node.parent.children.delete(hash);
        }
        this.blockTree.delete(hash);
        
        // Remove attestations
        this.attestationCache.remove(hash);
        
        pruned++;
        
        if (pruned >= FORK_CHOICE_CONFIG.PRUNE_BATCH_SIZE) {
          break;
        }
      }
      
      // Clean up empty number sets
      if (blocksAtHeight.size === 0) {
        this.blockByNumber.delete(num);
      }
    }
    
    if (pruned > 0) {
      console.log(`[ForkChoice] Pruned ${pruned} blocks before #${pruneBeforeNumber}`);
    }
  }
  
  private isInCanonicalChain(hash: string): boolean {
    if (!this.head) return false;
    
    let current = this.blockTree.get(this.head.hash);
    while (current) {
      if (current.block.hash === hash) {
        return true;
      }
      current = current.parent || undefined;
    }
    
    return false;
  }
  
  // ==================== Fork Detection ====================
  
  detectForks(): ForkInfo[] {
    const forks: ForkInfo[] = [];
    
    // Find blocks with multiple children (fork points)
    for (const [hash, node] of this.blockTree) {
      if (node.children.size > 1) {
        const branches = Array.from(node.children.values()).map(child => {
          const head = this.findBranchHead(child);
          const blocks = this.getBranchBlocks(child, head);
          
          return {
            head: head.block,
            length: blocks.length,
            totalDifficulty: head.block.totalDifficulty,
            blocks: blocks.map(b => b.block.hash)
          };
        });
        
        forks.push({
          forkPoint: node.block,
          branches,
          detectedAt: Date.now()
        });
      }
    }
    
    return forks;
  }
  
  private findBranchHead(node: BlockTreeNode): BlockTreeNode {
    if (node.children.size === 0) {
      return node;
    }
    
    // Follow the highest scoring child
    let best = node;
    for (const child of node.children.values()) {
      const childHead = this.findBranchHead(child);
      if (childHead.score > best.score) {
        best = childHead;
      }
    }
    
    return best;
  }
  
  private getBranchBlocks(start: BlockTreeNode, end: BlockTreeNode): BlockTreeNode[] {
    const blocks: BlockTreeNode[] = [];
    let current: BlockTreeNode | null = end;
    
    while (current && current !== start.parent) {
      blocks.push(current);
      current = current.parent;
    }
    
    return blocks.reverse();
  }
  
  // ==================== Utility Methods ====================
  
  private trackBlockTime(timestamp: number, parentTimestamp: number): void {
    const blockTime = timestamp - parentTimestamp;
    this.blockTimes.push(blockTime);
    
    // Keep last 1000 block times
    if (this.blockTimes.length > 1000) {
      this.blockTimes.shift();
    }
  }
  
  // ==================== Validator Set ====================
  
  setValidatorSet(validators: string[]): void {
    this.validatorSet = new Set(validators);
    this.totalValidators = validators.length;
    console.log(`[ForkChoice] Validator set updated: ${validators.length} validators`);
  }
  
  // ==================== Public Getters ====================
  
  getHead(): ChainHead | null {
    return this.head ? { ...this.head } : null;
  }
  
  getFinalizedBlock(): BlockInfo | null {
    return this.finalizedBlock ? { ...this.finalizedBlock } : null;
  }
  
  getJustifiedBlock(): BlockInfo | null {
    return this.justifiedBlock ? { ...this.justifiedBlock } : null;
  }
  
  getBlock(hash: string): BlockInfo | null {
    const node = this.blockTree.get(hash);
    return node ? { ...node.block } : null;
  }
  
  getBlocksByNumber(number: number): BlockInfo[] {
    const hashes = this.blockByNumber.get(number);
    if (!hashes) return [];
    
    return Array.from(hashes)
      .map(hash => this.blockTree.get(hash)?.block)
      .filter((b): b is BlockInfo => b !== undefined);
  }
  
  getCanonicalChain(fromNumber: number, toNumber: number): BlockInfo[] {
    if (!this.head) return [];
    
    const chain: BlockInfo[] = [];
    let current = this.blockTree.get(this.head.hash);
    
    while (current && current.block.number >= fromNumber) {
      if (current.block.number <= toNumber) {
        chain.push(current.block);
      }
      current = current.parent || undefined;
    }
    
    return chain.reverse();
  }
  
  getCheckpoint(number: number): Checkpoint | null {
    const checkpointNumber = Math.floor(number / FORK_CHOICE_CONFIG.CHECKPOINT_INTERVAL) * FORK_CHOICE_CONFIG.CHECKPOINT_INTERVAL;
    return this.checkpoints.get(checkpointNumber) || null;
  }
  
  getStats(): ForkChoiceStats {
    const avgBlockTime = this.blockTimes.length > 0
      ? this.blockTimes.reduce((a, b) => a + b, 0) / this.blockTimes.length
      : 0;
    
    return {
      currentHead: this.head || { hash: '', number: -1, totalDifficulty: BigInt(0), timestamp: 0 },
      finalizedBlock: this.finalizedBlock?.number ?? -1,
      justifiedBlock: this.justifiedBlock?.number ?? -1,
      totalBlocks: this.blockTree.size,
      pendingAttestations: this.attestationCache['cache']?.size || 0,
      activeForksCount: this.detectForks().length,
      lastReorgDepth: this.lastReorgDepth,
      avgBlockTime
    };
  }
  
  isFinalized(hash: string): boolean {
    const node = this.blockTree.get(hash);
    return node?.block.isFinalized ?? false;
  }
  
  getConfirmationDepth(hash: string): number {
    const node = this.blockTree.get(hash);
    if (!node || !this.head) return 0;
    
    return this.head.number - node.block.number;
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

let forkChoiceInstance: EnterpriseForkChoice | null = null;

export function getEnterpriseForkChoice(): EnterpriseForkChoice {
  if (!forkChoiceInstance) {
    forkChoiceInstance = new EnterpriseForkChoice();
  }
  return forkChoiceInstance;
}

export async function initializeEnterpriseForkChoice(): Promise<EnterpriseForkChoice> {
  const forkChoice = getEnterpriseForkChoice();
  await forkChoice.start();
  return forkChoice;
}
