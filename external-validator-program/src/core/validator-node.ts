/**
 * TBURN Validator Node
 * Main orchestrator for validator operations
 */

import { EventEmitter } from 'events';
import { RemoteSignerClient } from './remote-signer-client.js';
import { P2PNetwork } from './p2p-network.js';
import { BlockProducer } from './block-producer.js';
import { AttestationService } from './attestation-service.js';
import { MetricsServer } from './metrics-server.js';
import { ValidatorConfig } from '../config/validator-config.js';

export interface ValidatorNodeConfig {
  config: ValidatorConfig;
  signerClient: RemoteSignerClient;
  p2pNetwork: P2PNetwork;
  blockProducer: BlockProducer;
  attestationService: AttestationService;
  metricsServer: MetricsServer;
}

export interface ValidatorStatus {
  isRunning: boolean;
  isProposing: boolean;
  isAttesting: boolean;
  connectedPeers: number;
  currentSlot: number;
  currentEpoch: number;
  blocksProposed: number;
  attestationsMade: number;
  uptime: number;
  signerStatus: 'connected' | 'disconnected' | 'error';
}

export class ValidatorNode extends EventEmitter {
  private config: ValidatorConfig;
  private signerClient: RemoteSignerClient;
  private p2pNetwork: P2PNetwork;
  private blockProducer: BlockProducer;
  private attestationService: AttestationService;
  private metricsServer: MetricsServer;
  
  private isRunning = false;
  private startTime = 0;
  private heartbeatInterval?: NodeJS.Timeout;
  private slotInterval?: NodeJS.Timeout;
  
  private currentSlot = 0;
  private currentEpoch = 0;
  private blocksProposed = 0;
  private attestationsMade = 0;

  constructor(nodeConfig: ValidatorNodeConfig) {
    super();
    this.config = nodeConfig.config;
    this.signerClient = nodeConfig.signerClient;
    this.p2pNetwork = nodeConfig.p2pNetwork;
    this.blockProducer = nodeConfig.blockProducer;
    this.attestationService = nodeConfig.attestationService;
    this.metricsServer = nodeConfig.metricsServer;

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.signerClient.on('signing:success', (data) => {
      console.log(`[ValidatorNode] Signing success: ${data.operation} (${data.responseTimeMs}ms)`);
    });

    this.signerClient.on('signing:error', (data) => {
      console.error(`[ValidatorNode] Signing error: ${data.operation} - ${data.error}`);
    });

    this.blockProducer.on('block:produced', (data) => {
      this.blocksProposed++;
      console.log(`[ValidatorNode] Block produced: slot ${data.slot}, ${data.txCount} txs`);
      this.emit('block:produced', data);
    });

    this.attestationService.on('attestation:made', (data) => {
      this.attestationsMade++;
      console.log(`[ValidatorNode] Attestation made: slot ${data.slot}, epoch ${data.epoch}`);
      this.emit('attestation:made', data);
    });

    this.p2pNetwork.on('peer:connected', (data) => {
      console.log(`[ValidatorNode] Peer connected: ${data.peerId}`);
    });

    this.p2pNetwork.on('peer:disconnected', (data) => {
      console.log(`[ValidatorNode] Peer disconnected: ${data.peerId}`);
    });
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('[ValidatorNode] Already running');
      return;
    }

    console.log('[ValidatorNode] Starting validator node...');
    this.startTime = Date.now();
    this.isRunning = true;

    await this.p2pNetwork.start();
    console.log('[ValidatorNode] P2P network started');

    await this.metricsServer.start();
    console.log('[ValidatorNode] Metrics server started');

    this.startSlotTimer();
    this.startHeartbeat();

    this.emit('started');
    console.log('[ValidatorNode] Validator node started successfully');
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    console.log('[ValidatorNode] Stopping validator node...');
    this.isRunning = false;

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }

    if (this.slotInterval) {
      clearInterval(this.slotInterval);
      this.slotInterval = undefined;
    }

    await this.signerClient.disconnect();
    await this.p2pNetwork.stop();
    await this.metricsServer.stop();

    this.emit('stopped');
    console.log('[ValidatorNode] Validator node stopped');
  }

  private startSlotTimer(): void {
    const slotDuration = this.config.blockTimeMs;
    
    this.slotInterval = setInterval(async () => {
      this.currentSlot++;
      
      if (this.currentSlot % 32 === 0) {
        this.currentEpoch++;
      }

      if (this.shouldProposeBlock()) {
        await this.blockProducer.produceBlock(this.currentSlot);
      }

      await this.attestationService.attest(this.currentSlot, this.currentEpoch);
      
    }, slotDuration);

    console.log(`[ValidatorNode] Slot timer started (${slotDuration}ms per slot)`);
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, this.config.heartbeatIntervalMs);

    console.log(`[ValidatorNode] Heartbeat started (${this.config.heartbeatIntervalMs}ms interval)`);
  }

  private shouldProposeBlock(): boolean {
    const hash = this.hashSlotWithValidator(this.currentSlot);
    const proposerIndex = parseInt(hash.slice(0, 8), 16) % 125;
    
    const validatorIndex = parseInt(this.config.validatorAddress.slice(2, 10), 16) % 125;
    
    return proposerIndex === validatorIndex;
  }

  private hashSlotWithValidator(slot: number): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256')
      .update(`${slot}-${this.config.chainId}`)
      .digest('hex');
  }

  private async sendHeartbeat(): Promise<void> {
    const status = this.getStatus();
    
    console.log(`[ValidatorNode] Heartbeat: slot ${status.currentSlot}, epoch ${status.currentEpoch}, peers ${status.connectedPeers}`);
    
    this.emit('heartbeat', status);
  }

  getStatus(): ValidatorStatus {
    return {
      isRunning: this.isRunning,
      isProposing: this.blockProducer.isProposing(),
      isAttesting: this.attestationService.isAttesting(),
      connectedPeers: this.p2pNetwork.getPeerCount(),
      currentSlot: this.currentSlot,
      currentEpoch: this.currentEpoch,
      blocksProposed: this.blocksProposed,
      attestationsMade: this.attestationsMade,
      uptime: this.isRunning ? Date.now() - this.startTime : 0,
      signerStatus: this.signerClient.isReady() ? 'connected' : 'disconnected'
    };
  }

  getConfig(): ValidatorConfig {
    return this.config;
  }
}
