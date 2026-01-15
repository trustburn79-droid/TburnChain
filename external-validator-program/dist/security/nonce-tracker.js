"use strict";
/**
 * TBURN Nonce Tracker
 * Prevents replay attacks by tracking used nonces
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NonceTracker = void 0;
class NonceTracker {
    usedNonces = new Map();
    config;
    cleanupInterval;
    constructor(config = {}) {
        this.config = {
            maxAge: config.maxAge ?? 300000,
            maxSize: config.maxSize ?? 100000,
            cleanupInterval: config.cleanupInterval ?? 60000
        };
        this.cleanupInterval = setInterval(() => this.cleanup(), this.config.cleanupInterval);
    }
    use(nonce, validatorAddress) {
        const key = `${validatorAddress}:${nonce}`;
        if (this.usedNonces.has(key)) {
            console.warn(`[NonceTracker] Replay attack detected: nonce ${nonce} already used by ${validatorAddress}`);
            return false;
        }
        if (this.usedNonces.size >= this.config.maxSize) {
            this.cleanup();
            if (this.usedNonces.size >= this.config.maxSize) {
                const oldest = this.findOldest();
                if (oldest) {
                    this.usedNonces.delete(oldest);
                }
            }
        }
        this.usedNonces.set(key, {
            nonce,
            timestamp: Date.now(),
            validatorAddress
        });
        return true;
    }
    isUsed(nonce, validatorAddress) {
        const key = `${validatorAddress}:${nonce}`;
        return this.usedNonces.has(key);
    }
    findOldest() {
        let oldestKey = null;
        let oldestTime = Infinity;
        for (const [key, entry] of this.usedNonces) {
            if (entry.timestamp < oldestTime) {
                oldestTime = entry.timestamp;
                oldestKey = key;
            }
        }
        return oldestKey;
    }
    cleanup() {
        const now = Date.now();
        const cutoff = now - this.config.maxAge;
        for (const [key, entry] of this.usedNonces) {
            if (entry.timestamp < cutoff) {
                this.usedNonces.delete(key);
            }
        }
    }
    getStats() {
        let oldestTime = Date.now();
        for (const entry of this.usedNonces.values()) {
            if (entry.timestamp < oldestTime) {
                oldestTime = entry.timestamp;
            }
        }
        return {
            size: this.usedNonces.size,
            oldestAge: Date.now() - oldestTime
        };
    }
    destroy() {
        clearInterval(this.cleanupInterval);
        this.usedNonces.clear();
    }
}
exports.NonceTracker = NonceTracker;
//# sourceMappingURL=nonce-tracker.js.map