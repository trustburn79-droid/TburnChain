/**
 * TBURN Attestation Service
 * Handles attestation creation and signing via Remote Signer
 */

import { EventEmitter } from 'events';
import * as crypto from 'crypto';
import { RemoteSignerClient } from './remote-signer-client.js';

export interface AttestationServiceConfig {
  signerClient: RemoteSignerClient;
  validatorAddress: string;
}

export interface Attestation {
  slot: number;
  epoch: number;
  beaconBlockRoot: string;
  sourceEpoch: number;
  sourceRoot: string;
  targetEpoch: number;
  targetRoot: string;
  signature: string;
  aggregationBits: string;
}

export class AttestationService extends EventEmitter {
  private signerClient: RemoteSignerClient;
  private validatorAddress: string;
  private attesting = false;
  private attestationsMade = 0;
  private lastSourceEpoch = 0;
  private lastSourceRoot = '0x' + '0'.repeat(64);

  constructor(config: AttestationServiceConfig) {
    super();
    this.signerClient = config.signerClient;
    this.validatorAddress = config.validatorAddress;
  }

  async attest(slot: number, epoch: number): Promise<Attestation | null> {
    if (this.attesting) {
      return null;
    }

    this.attesting = true;

    try {
      const beaconBlockRoot = this.generateHash(`beacon-${slot}`);
      const targetRoot = this.generateHash(`target-${epoch}`);

      const attestationData = {
        slot,
        epoch,
        beaconBlockRoot,
        sourceEpoch: this.lastSourceEpoch,
        sourceRoot: this.lastSourceRoot,
        targetEpoch: epoch,
        targetRoot
      };

      const signResult = await this.signerClient.signAttestation(attestationData);

      if (!signResult.success) {
        console.error('[AttestationService] Attestation signing failed:', signResult.error);
        return null;
      }

      const attestation: Attestation = {
        ...attestationData,
        signature: signResult.signature!,
        aggregationBits: this.generateAggregationBits()
      };

      this.lastSourceEpoch = epoch;
      this.lastSourceRoot = targetRoot;
      this.attestationsMade++;

      this.emit('attestation:made', {
        slot,
        epoch,
        beaconBlockRoot
      });

      return attestation;

    } catch (error) {
      console.error('[AttestationService] Attestation error:', error);
      return null;
    } finally {
      this.attesting = false;
    }
  }

  async aggregateAttestations(attestations: Attestation[]): Promise<string | null> {
    if (attestations.length === 0) {
      return null;
    }

    const firstAttestation = attestations[0];
    const signResult = await this.signerClient.signAggregate(
      attestations.map(a => ({
        slot: a.slot,
        epoch: a.epoch,
        beaconBlockRoot: a.beaconBlockRoot,
        sourceEpoch: a.sourceEpoch,
        sourceRoot: a.sourceRoot,
        targetEpoch: a.targetEpoch,
        targetRoot: a.targetRoot
      }))
    );

    if (!signResult.success) {
      console.error('[AttestationService] Aggregate signing failed:', signResult.error);
      return null;
    }

    this.emit('aggregate:produced', {
      slot: firstAttestation.slot,
      count: attestations.length
    });

    return signResult.signature || null;
  }

  isAttesting(): boolean {
    return this.attesting;
  }

  getAttestationsMade(): number {
    return this.attestationsMade;
  }

  private generateHash(data: string): string {
    return '0x' + crypto.createHash('sha256').update(data).digest('hex');
  }

  private generateAggregationBits(): string {
    const bits = new Uint8Array(64);
    for (let i = 0; i < bits.length; i++) {
      bits[i] = Math.random() > 0.3 ? 1 : 0;
    }
    return '0x' + Buffer.from(bits).toString('hex');
  }
}
