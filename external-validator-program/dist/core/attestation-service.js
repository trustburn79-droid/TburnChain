"use strict";
/**
 * TBURN Attestation Service
 * Handles attestation creation and signing via Remote Signer
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
exports.AttestationService = void 0;
const events_1 = require("events");
const crypto = __importStar(require("crypto"));
class AttestationService extends events_1.EventEmitter {
    signerClient;
    validatorAddress;
    attesting = false;
    attestationsMade = 0;
    lastSourceEpoch = 0;
    lastSourceRoot = '0x' + '0'.repeat(64);
    constructor(config) {
        super();
        this.signerClient = config.signerClient;
        this.validatorAddress = config.validatorAddress;
    }
    async attest(slot, epoch) {
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
            const attestation = {
                ...attestationData,
                signature: signResult.signature,
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
        }
        catch (error) {
            console.error('[AttestationService] Attestation error:', error);
            return null;
        }
        finally {
            this.attesting = false;
        }
    }
    async aggregateAttestations(attestations) {
        if (attestations.length === 0) {
            return null;
        }
        const firstAttestation = attestations[0];
        const signResult = await this.signerClient.signAggregate(attestations.map(a => ({
            slot: a.slot,
            epoch: a.epoch,
            beaconBlockRoot: a.beaconBlockRoot,
            sourceEpoch: a.sourceEpoch,
            sourceRoot: a.sourceRoot,
            targetEpoch: a.targetEpoch,
            targetRoot: a.targetRoot
        })));
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
    isAttesting() {
        return this.attesting;
    }
    getAttestationsMade() {
        return this.attestationsMade;
    }
    generateHash(data) {
        return '0x' + crypto.createHash('sha256').update(data).digest('hex');
    }
    generateAggregationBits() {
        const bits = new Uint8Array(64);
        for (let i = 0; i < bits.length; i++) {
            bits[i] = Math.random() > 0.3 ? 1 : 0;
        }
        return '0x' + Buffer.from(bits).toString('hex');
    }
}
exports.AttestationService = AttestationService;
//# sourceMappingURL=attestation-service.js.map