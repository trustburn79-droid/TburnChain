/**
 * TBC-20 Token Registry
 * Tracks all TBC-20 tokens and their metadata for Fast Path optimization
 */

import {
  TburnAddress,
  Tbc20TokenInfo,
  TBC20_FACTORY,
  createDefaultTbc20TokenInfo,
} from '../utils/tbc20-protocol-constants';
import { addressesEqual } from '../utils/tbc20-address-utils';

interface RegistryStats {
  totalTokens: number;
  optimizableCount: number;
  factoryTokenCount: number;
}

export class Tbc20Registry {
  private tokens: Map<string, Tbc20TokenInfo> = new Map();
  private factoryTokens: Set<string> = new Set();
  private optimizableTokens: Set<string> = new Set();
  private stats: RegistryStats = {
    totalTokens: 0,
    optimizableCount: 0,
    factoryTokenCount: 0,
  };

  constructor() {
    this.registerBuiltInTokens();
  }

  private registerBuiltInTokens(): void {
    const tburn: Tbc20TokenInfo = {
      ...createDefaultTbc20TokenInfo(),
      address: "tb1tburn00000000000000000000000000000000",
      name: "TBURN",
      symbol: "TBURN",
      decimals: 18,
      maxSupply: BigInt("10000000000") * BigInt("1000000000000000000"),
      burnable: true,
      aiOptimized: true,
      factory: TBC20_FACTORY,
    };
    this.register(tburn);
  }

  register(info: Tbc20TokenInfo): void {
    const key = info.address.toLowerCase();
    
    if (addressesEqual(info.factory, TBC20_FACTORY)) {
      this.factoryTokens.add(key);
      this.stats.factoryTokenCount++;
    }
    
    if (info.aiOptimized) {
      this.optimizableTokens.add(key);
      this.stats.optimizableCount++;
    }
    
    this.tokens.set(key, info);
    this.stats.totalTokens++;
  }

  unregister(address: TburnAddress): boolean {
    const key = address.toLowerCase();
    const info = this.tokens.get(key);
    if (!info) return false;
    
    this.tokens.delete(key);
    this.factoryTokens.delete(key);
    this.optimizableTokens.delete(key);
    
    this.stats.totalTokens--;
    if (info.aiOptimized) this.stats.optimizableCount--;
    if (addressesEqual(info.factory, TBC20_FACTORY)) this.stats.factoryTokenCount--;
    
    return true;
  }

  isTbc20(address: string): boolean {
    return this.factoryTokens.has(address.toLowerCase());
  }

  isFastPathEligible(address: string): boolean {
    return this.optimizableTokens.has(address.toLowerCase());
  }

  get(address: string): Tbc20TokenInfo | null {
    return this.tokens.get(address.toLowerCase()) || null;
  }

  contains(address: string): boolean {
    return this.tokens.has(address.toLowerCase());
  }

  getStats(): RegistryStats {
    return { ...this.stats };
  }

  getAllTokens(): Tbc20TokenInfo[] {
    return Array.from(this.tokens.values());
  }

  getOptimizableTokens(): Tbc20TokenInfo[] {
    return Array.from(this.tokens.values()).filter(t => t.aiOptimized);
  }

  updateTokenInfo(address: string, updates: Partial<Tbc20TokenInfo>): boolean {
    const key = address.toLowerCase();
    const info = this.tokens.get(key);
    if (!info) return false;
    
    const oldAiOptimized = info.aiOptimized;
    const updatedInfo = { ...info, ...updates };
    this.tokens.set(key, updatedInfo);
    
    if (oldAiOptimized !== updatedInfo.aiOptimized) {
      if (updatedInfo.aiOptimized) {
        this.optimizableTokens.add(key);
        this.stats.optimizableCount++;
      } else {
        this.optimizableTokens.delete(key);
        this.stats.optimizableCount--;
      }
    }
    
    return true;
  }

  clear(): void {
    this.tokens.clear();
    this.factoryTokens.clear();
    this.optimizableTokens.clear();
    this.stats = { totalTokens: 0, optimizableCount: 0, factoryTokenCount: 0 };
  }
}

let registryInstance: Tbc20Registry | null = null;

export function getTbc20Registry(): Tbc20Registry {
  if (!registryInstance) {
    registryInstance = new Tbc20Registry();
  }
  return registryInstance;
}

export function resetTbc20Registry(): void {
  registryInstance = null;
}
