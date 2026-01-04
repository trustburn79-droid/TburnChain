/**
 * TBURN Validator Cryptographic Key Management
 * Enterprise-Grade Key Generation, Signing, and Verification
 */
export interface KeyPair {
    privateKey: string;
    publicKey: string;
    address: string;
}
export interface SignedMessage {
    message: string;
    signature: string;
    publicKey: string;
}
export declare class CryptoManager {
    private privateKey;
    private publicKey;
    private address;
    static generateKeyPair(): KeyPair;
    static generateValidatorAddress(): string;
    static hashBlock(data: object): string;
    static hashTransaction(tx: object): string;
    static generateMerkleRoot(hashes: string[]): string;
    static verifySignature(message: string, signature: string, publicKeyHex: string): boolean;
    static aggregateSignatures(signatures: string[]): string;
    loadFromPrivateKey(privateKeyHex: string): void;
    sign(message: string): string;
    verify(message: string, signature: string): boolean;
    getAddress(): string;
    getPublicKeyHex(): string;
}
export declare class QuantumResistantSigner {
    private static readonly HASH_CHAIN_LENGTH;
    private hashChain;
    private currentIndex;
    constructor(seed: string);
    private generateHashChain;
    signOneTime(message: string): {
        signature: string;
        index: number;
    };
    static verifyOneTime(message: string, signature: string, publicKey: string, index: number): boolean;
    getRemainingSignatures(): number;
}
//# sourceMappingURL=keys.d.ts.map