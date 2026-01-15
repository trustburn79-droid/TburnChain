/**
 * TBURN Nonce Tracker
 * Prevents replay attacks by tracking used nonces
 */
export interface NonceConfig {
    maxAge: number;
    maxSize: number;
    cleanupInterval: number;
}
export declare class NonceTracker {
    private usedNonces;
    private config;
    private cleanupInterval;
    constructor(config?: Partial<NonceConfig>);
    use(nonce: string, validatorAddress: string): boolean;
    isUsed(nonce: string, validatorAddress: string): boolean;
    private findOldest;
    private cleanup;
    getStats(): {
        size: number;
        oldestAge: number;
    };
    destroy(): void;
}
//# sourceMappingURL=nonce-tracker.d.ts.map