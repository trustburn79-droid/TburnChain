/**
 * TBURN Nonce Tracker
 * Prevents replay attacks by tracking used nonces
 */

export interface NonceConfig {
  maxAge: number;
  maxSize: number;
  cleanupInterval: number;
}

interface NonceEntry {
  nonce: string;
  timestamp: number;
  validatorAddress: string;
}

export class NonceTracker {
  private usedNonces: Map<string, NonceEntry> = new Map();
  private config: NonceConfig;
  private cleanupInterval: NodeJS.Timeout;

  constructor(config: Partial<NonceConfig> = {}) {
    this.config = {
      maxAge: config.maxAge ?? 300000,
      maxSize: config.maxSize ?? 100000,
      cleanupInterval: config.cleanupInterval ?? 60000
    };

    this.cleanupInterval = setInterval(() => this.cleanup(), this.config.cleanupInterval);
  }

  use(nonce: string, validatorAddress: string): boolean {
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

  isUsed(nonce: string, validatorAddress: string): boolean {
    const key = `${validatorAddress}:${nonce}`;
    return this.usedNonces.has(key);
  }

  private findOldest(): string | null {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.usedNonces) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  private cleanup(): void {
    const now = Date.now();
    const cutoff = now - this.config.maxAge;

    for (const [key, entry] of this.usedNonces) {
      if (entry.timestamp < cutoff) {
        this.usedNonces.delete(key);
      }
    }
  }

  getStats(): { size: number; oldestAge: number } {
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

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.usedNonces.clear();
  }
}
