"use strict";
/**
 * TBURN Validator Cryptographic Key Management
 * Enterprise-Grade Key Generation, Signing, and Verification
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
exports.QuantumResistantSigner = exports.CryptoManager = void 0;
const crypto = __importStar(require("crypto"));
class CryptoManager {
    privateKey = null;
    publicKey = null;
    address = '';
    static generateKeyPair() {
        const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
        const privateKeyHex = privateKey.export({ type: 'pkcs8', format: 'der' }).toString('hex');
        const publicKeyHex = publicKey.export({ type: 'spki', format: 'der' }).toString('hex');
        const addressHash = crypto.createHash('sha256').update(publicKeyHex).digest('hex');
        const address = `tb1${addressHash.substring(0, 38)}`;
        return {
            privateKey: privateKeyHex,
            publicKey: publicKeyHex,
            address,
        };
    }
    static generateValidatorAddress() {
        const keyPair = CryptoManager.generateKeyPair();
        return keyPair.address;
    }
    static hashBlock(data) {
        const serialized = JSON.stringify(data, Object.keys(data).sort());
        return crypto.createHash('sha256').update(serialized).digest('hex');
    }
    static hashTransaction(tx) {
        const serialized = JSON.stringify(tx, Object.keys(tx).sort());
        return `0x${crypto.createHash('sha256').update(serialized).digest('hex')}`;
    }
    static generateMerkleRoot(hashes) {
        if (hashes.length === 0) {
            return '0x' + '0'.repeat(64);
        }
        if (hashes.length === 1) {
            return hashes[0];
        }
        const layers = [hashes];
        while (layers[layers.length - 1].length > 1) {
            const currentLayer = layers[layers.length - 1];
            const newLayer = [];
            for (let i = 0; i < currentLayer.length; i += 2) {
                const left = currentLayer[i];
                const right = currentLayer[i + 1] || left;
                const combined = crypto.createHash('sha256')
                    .update(left + right)
                    .digest('hex');
                newLayer.push(`0x${combined}`);
            }
            layers.push(newLayer);
        }
        return layers[layers.length - 1][0];
    }
    static verifySignature(message, signature, publicKeyHex) {
        try {
            const publicKey = crypto.createPublicKey({
                key: Buffer.from(publicKeyHex, 'hex'),
                format: 'der',
                type: 'spki',
            });
            return crypto.verify(null, Buffer.from(message), publicKey, Buffer.from(signature, 'hex'));
        }
        catch {
            return false;
        }
    }
    static aggregateSignatures(signatures) {
        const combined = signatures.join('');
        return crypto.createHash('sha256').update(combined).digest('hex');
    }
    loadFromPrivateKey(privateKeyHex) {
        this.privateKey = crypto.createPrivateKey({
            key: Buffer.from(privateKeyHex, 'hex'),
            format: 'der',
            type: 'pkcs8',
        });
        this.publicKey = crypto.createPublicKey(this.privateKey);
        const publicKeyHex = this.publicKey.export({ type: 'spki', format: 'der' }).toString('hex');
        const addressHash = crypto.createHash('sha256').update(publicKeyHex).digest('hex');
        this.address = `tb1${addressHash.substring(0, 38)}`;
    }
    sign(message) {
        if (!this.privateKey) {
            throw new Error('Private key not loaded');
        }
        const signature = crypto.sign(null, Buffer.from(message), this.privateKey);
        return signature.toString('hex');
    }
    verify(message, signature) {
        if (!this.publicKey) {
            throw new Error('Public key not loaded');
        }
        return crypto.verify(null, Buffer.from(message), this.publicKey, Buffer.from(signature, 'hex'));
    }
    getAddress() {
        return this.address;
    }
    getPublicKeyHex() {
        if (!this.publicKey) {
            throw new Error('Public key not loaded');
        }
        return this.publicKey.export({ type: 'spki', format: 'der' }).toString('hex');
    }
}
exports.CryptoManager = CryptoManager;
class QuantumResistantSigner {
    static HASH_CHAIN_LENGTH = 256;
    hashChain = [];
    currentIndex = 0;
    constructor(seed) {
        this.generateHashChain(seed);
    }
    generateHashChain(seed) {
        let current = seed;
        for (let i = 0; i < QuantumResistantSigner.HASH_CHAIN_LENGTH; i++) {
            current = crypto.createHash('sha256').update(current).digest('hex');
            this.hashChain.push(current);
        }
    }
    signOneTime(message) {
        if (this.currentIndex >= this.hashChain.length) {
            throw new Error('Hash chain exhausted - regenerate key pair');
        }
        const messageHash = crypto.createHash('sha256').update(message).digest('hex');
        const signature = crypto.createHash('sha256')
            .update(messageHash + this.hashChain[this.currentIndex])
            .digest('hex');
        return {
            signature,
            index: this.currentIndex++,
        };
    }
    static verifyOneTime(message, signature, publicKey, index) {
        const messageHash = crypto.createHash('sha256').update(message).digest('hex');
        const expectedSignature = crypto.createHash('sha256')
            .update(messageHash + publicKey)
            .digest('hex');
        return signature === expectedSignature;
    }
    getRemainingSignatures() {
        return this.hashChain.length - this.currentIndex;
    }
}
exports.QuantumResistantSigner = QuantumResistantSigner;
//# sourceMappingURL=keys.js.map