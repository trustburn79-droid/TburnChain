/**
 * TokenRegistry - Unified token registry for all deployed tokens
 * Connects token-generator, token-system, and admin-token-issuance pages
 * Production-ready for Dec 22nd mainnet launch
 */

export interface RegisteredToken {
  id: string;
  name: string;
  symbol: string;
  contractAddress: string;
  standard: "TBC-20" | "TBC-721" | "TBC-1155";
  totalSupply: string;
  decimals: number;
  deployerAddress: string;
  deploymentTxHash: string;
  deployedAt: string;
  blockNumber: number;
  // Token features
  mintable: boolean;
  burnable: boolean;
  pausable: boolean;
  maxSupply?: string;
  // NFT specific
  baseUri?: string;
  royaltyPercentage?: number;
  royaltyRecipient?: string;
  // AI features
  aiOptimizationEnabled: boolean;
  aiBurnOptimization?: boolean;
  aiPriceOracle?: boolean;
  aiSupplyManagement?: boolean;
  // Security features
  quantumResistant: boolean;
  mevProtection: boolean;
  zkPrivacy?: boolean;
  // Statistics
  holders: number;
  transactionCount: number;
  volume24h: string;
  // Status
  status: "pending" | "active" | "paused" | "verified" | "failed";
  verified: boolean;
  auditStatus?: "pending" | "in_progress" | "verified" | "failed";
  securityScore?: number;
  // Deployment source
  deploymentSource: "token-generator" | "token-factory" | "token-system" | "admin";
  deploymentMode: "wallet" | "simulation" | "admin";
}

export interface TokenRegistryStats {
  totalTokens: number;
  activeTokens: number;
  pendingTokens: number;
  pausedTokens: number;
  verifiedTokens: number;
  byStandard: {
    "TBC-20": number;
    "TBC-721": number;
    "TBC-1155": number;
  };
  bySource: {
    "token-generator": number;
    "token-factory": number;
    "token-system": number;
    "admin": number;
  };
  totalHolders: number;
  totalTransactions: number;
}

class TokenRegistry {
  private static instance: TokenRegistry;
  private tokens: Map<string, RegisteredToken> = new Map();
  private initialized: boolean = false;

  private constructor() {}

  static getInstance(): TokenRegistry {
    if (!TokenRegistry.instance) {
      TokenRegistry.instance = new TokenRegistry();
    }
    return TokenRegistry.instance;
  }

  initialize(): void {
    if (this.initialized) return;
    this.initialized = true;
    console.log("[TokenRegistry] ✅ Initialized - Unified token registry active");
  }

  registerToken(token: RegisteredToken): void {
    const key = token.contractAddress.toLowerCase();
    this.tokens.set(key, {
      ...token,
      contractAddress: token.contractAddress.toLowerCase(),
    });
    console.log(`[TokenRegistry] Token registered: ${token.name} (${token.symbol}) - ${token.standard}`);
  }

  updateToken(contractAddress: string, updates: Partial<RegisteredToken>): boolean {
    const key = contractAddress.toLowerCase();
    const existing = this.tokens.get(key);
    if (!existing) return false;

    this.tokens.set(key, { ...existing, ...updates });
    console.log(`[TokenRegistry] Token updated: ${existing.name} (${existing.symbol})`);
    return true;
  }

  getToken(contractAddress: string): RegisteredToken | undefined {
    return this.tokens.get(contractAddress.toLowerCase());
  }

  getAllTokens(): RegisteredToken[] {
    return Array.from(this.tokens.values())
      .sort((a, b) => new Date(b.deployedAt).getTime() - new Date(a.deployedAt).getTime());
  }

  getTokensByDeployer(deployerAddress: string): RegisteredToken[] {
    return this.getAllTokens().filter(
      t => t.deployerAddress.toLowerCase() === deployerAddress.toLowerCase()
    );
  }

  getTokensByStandard(standard: "TBC-20" | "TBC-721" | "TBC-1155"): RegisteredToken[] {
    return this.getAllTokens().filter(t => t.standard === standard);
  }

  getTokensByStatus(status: RegisteredToken["status"]): RegisteredToken[] {
    return this.getAllTokens().filter(t => t.status === status);
  }

  getTokensBySource(source: RegisteredToken["deploymentSource"]): RegisteredToken[] {
    return this.getAllTokens().filter(t => t.deploymentSource === source);
  }

  getActiveTokens(): RegisteredToken[] {
    return this.getAllTokens().filter(t => t.status === "active" || t.status === "verified");
  }

  getStats(): TokenRegistryStats {
    const allTokens = this.getAllTokens();
    
    return {
      totalTokens: allTokens.length,
      activeTokens: allTokens.filter(t => t.status === "active" || t.status === "verified").length,
      pendingTokens: allTokens.filter(t => t.status === "pending").length,
      pausedTokens: allTokens.filter(t => t.status === "paused").length,
      verifiedTokens: allTokens.filter(t => t.verified).length,
      byStandard: {
        "TBC-20": allTokens.filter(t => t.standard === "TBC-20").length,
        "TBC-721": allTokens.filter(t => t.standard === "TBC-721").length,
        "TBC-1155": allTokens.filter(t => t.standard === "TBC-1155").length,
      },
      bySource: {
        "token-generator": allTokens.filter(t => t.deploymentSource === "token-generator").length,
        "token-factory": allTokens.filter(t => t.deploymentSource === "token-factory").length,
        "token-system": allTokens.filter(t => t.deploymentSource === "token-system").length,
        "admin": allTokens.filter(t => t.deploymentSource === "admin").length,
      },
      totalHolders: allTokens.reduce((sum, t) => sum + t.holders, 0),
      totalTransactions: allTokens.reduce((sum, t) => sum + t.transactionCount, 0),
    };
  }

  // Convert to admin token format for /api/admin/tokens
  toAdminTokenFormat(token: RegisteredToken): any {
    return {
      id: token.id,
      name: token.name,
      symbol: token.symbol,
      standard: token.standard,
      totalSupply: this.formatSupply(token.totalSupply, token.decimals),
      circulatingSupply: this.formatSupply(token.totalSupply, token.decimals),
      holders: token.holders,
      status: token.status === "verified" ? "active" : token.status,
      aiEnabled: token.aiOptimizationEnabled,
      contractAddress: token.contractAddress,
      deployerAddress: token.deployerAddress,
      deployedAt: token.deployedAt,
      deploymentSource: token.deploymentSource,
      verified: token.verified,
      securityScore: token.securityScore,
    };
  }

  private formatSupply(supply: string, decimals: number): string {
    try {
      const num = parseFloat(supply) / Math.pow(10, decimals);
      if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
      if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
      if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
      return num.toFixed(2);
    } catch {
      return supply;
    }
  }

  // Pause/resume token
  pauseToken(contractAddress: string): boolean {
    return this.updateToken(contractAddress, { status: "paused" });
  }

  resumeToken(contractAddress: string): boolean {
    return this.updateToken(contractAddress, { status: "active" });
  }

  // Verify token
  verifyToken(contractAddress: string, securityScore: number = 95): boolean {
    return this.updateToken(contractAddress, { 
      status: "verified", 
      verified: true,
      auditStatus: "verified",
      securityScore,
    });
  }

  // Export for admin
  exportAllTokens(): any[] {
    return this.getAllTokens().map(t => this.toAdminTokenFormat(t));
  }
}

export const tokenRegistry = TokenRegistry.getInstance();
