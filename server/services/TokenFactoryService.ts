import { ethers, JsonRpcProvider, Wallet, Contract, TransactionReceipt } from "ethers";
import { tokenRegistry, RegisteredToken } from "./TokenRegistry";
import { generateRandomTBurnAddress, formatTBurnAddress, generateSystemAddress } from "../utils/tburn-address";

const TBURN_MAINNET_RPC = process.env.TBURN_RPC_URL || "http://localhost:8545";
const TBURN_CHAIN_ID = 5800; // TBURN Mainnet Chain ID

// Factory addresses using TBURN's native tb1 Bech32m format
const TBC20_FACTORY_ADDRESS = process.env.TBC20_FACTORY_ADDRESS || generateSystemAddress('tburn-factory-tbc20');
const TBC721_FACTORY_ADDRESS = process.env.TBC721_FACTORY_ADDRESS || generateSystemAddress('tburn-factory-tbc721');
const TBC1155_FACTORY_ADDRESS = process.env.TBC1155_FACTORY_ADDRESS || generateSystemAddress('tburn-factory-tbc1155');

const LAUNCH_DATE = new Date("2024-12-22T00:00:00-05:00");

const TBC20_FACTORY_ABI = [
  "function createToken(string name, string symbol, uint256 initialSupply, uint8 decimals, bool mintable, bool burnable, bool pausable, uint256 maxSupply, bool aiOptimized, bool quantumResistant) external returns (address)",
  "function getDeployedTokens(address deployer) external view returns (address[])",
  "event TokenCreated(address indexed token, address indexed owner, string name, string symbol, uint256 initialSupply)",
];

const TBC721_FACTORY_ABI = [
  "function createNFT(string name, string symbol, string baseUri, uint256 maxSupply, uint96 royaltyPercentage, address royaltyRecipient, bool aiOptimized, bool quantumResistant) external returns (address)",
  "event NFTCreated(address indexed nft, address indexed owner, string name, string symbol, uint256 maxSupply)",
];

const TBC1155_FACTORY_ABI = [
  "function createMultiToken(string name, string uri, bool mintable, bool burnable, bool aiOptimized, bool quantumResistant) external returns (address)",
  "event MultiTokenCreated(address indexed token, address indexed owner, string name)",
];

export interface TokenDeploymentRequest {
  standard: "TBC-20" | "TBC-721" | "TBC-1155";
  name: string;
  symbol: string;
  deployerAddress: string;
  totalSupply?: string;
  decimals?: number;
  mintable?: boolean;
  burnable?: boolean;
  pausable?: boolean;
  maxSupply?: string;
  baseUri?: string;
  royaltyPercentage?: number;
  royaltyRecipient?: string;
  aiOptimizationEnabled?: boolean;
  quantumResistant?: boolean;
  mevProtection?: boolean;
}

export interface DeploymentTransaction {
  to: string;
  data: string;
  gasLimit: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  chainId: number;
  nonce?: number;
}

export interface GasEstimation {
  gasLimit: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  estimatedCostWei: string;
  estimatedCostTB: string;
}

export interface DeploymentResult {
  success: boolean;
  contractAddress?: string;
  transactionHash?: string;
  blockNumber?: number;
  gasUsed?: string;
  error?: string;
}

export interface TokenMetadata {
  id: string;
  name: string;
  symbol: string;
  standard: string;
  contractAddress: string;
  deployerAddress: string;
  totalSupply: string;
  decimals: number;
  mintable: boolean;
  burnable: boolean;
  pausable: boolean;
  aiOptimizationEnabled: boolean;
  quantumResistant: boolean;
  mevProtection: boolean;
  deploymentTxHash: string;
  deployedAt: string;
  blockNumber: number;
  status: "pending" | "confirmed" | "failed";
}

class TokenFactoryService {
  private static instance: TokenFactoryService;
  private provider: JsonRpcProvider;
  private deployedTokens: Map<string, TokenMetadata> = new Map();

  private constructor() {
    this.provider = new JsonRpcProvider(TBURN_MAINNET_RPC, {
      chainId: TBURN_CHAIN_ID,
      name: "TBURN Mainnet",
    });
  }

  static getInstance(): TokenFactoryService {
    if (!TokenFactoryService.instance) {
      TokenFactoryService.instance = new TokenFactoryService();
    }
    return TokenFactoryService.instance;
  }

  async checkConnection(): Promise<{ connected: boolean; blockNumber?: number; error?: string }> {
    try {
      const blockNumber = await this.provider.getBlockNumber();
      return { connected: true, blockNumber };
    } catch (error: any) {
      return { connected: false, error: error.message };
    }
  }

  getFactoryAddress(standard: "TBC-20" | "TBC-721" | "TBC-1155"): string {
    switch (standard) {
      case "TBC-20":
        return TBC20_FACTORY_ADDRESS;
      case "TBC-721":
        return TBC721_FACTORY_ADDRESS;
      case "TBC-1155":
        return TBC1155_FACTORY_ADDRESS;
      default:
        throw new Error(`Unsupported token standard: ${standard}`);
    }
  }

  encodeDeploymentData(request: TokenDeploymentRequest): string {
    const iface = this.getFactoryInterface(request.standard);
    
    switch (request.standard) {
      case "TBC-20": {
        const initialSupply = ethers.parseUnits(
          request.totalSupply || "1000000",
          request.decimals || 18
        );
        const maxSupply = request.maxSupply
          ? ethers.parseUnits(request.maxSupply, request.decimals || 18)
          : BigInt(0);

        return iface.encodeFunctionData("createToken", [
          request.name,
          request.symbol,
          initialSupply,
          request.decimals || 18,
          request.mintable ?? false,
          request.burnable ?? true,
          request.pausable ?? false,
          maxSupply,
          request.aiOptimizationEnabled ?? true,
          request.quantumResistant ?? true,
        ]);
      }

      case "TBC-721": {
        const royaltyBps = Math.floor((request.royaltyPercentage || 0) * 100);
        return iface.encodeFunctionData("createNFT", [
          request.name,
          request.symbol,
          request.baseUri || "",
          request.maxSupply || "10000",
          royaltyBps,
          request.royaltyRecipient || request.deployerAddress,
          request.aiOptimizationEnabled ?? true,
          request.quantumResistant ?? true,
        ]);
      }

      case "TBC-1155": {
        return iface.encodeFunctionData("createMultiToken", [
          request.name,
          request.baseUri || "",
          request.mintable ?? true,
          request.burnable ?? true,
          request.aiOptimizationEnabled ?? true,
          request.quantumResistant ?? true,
        ]);
      }

      default:
        throw new Error(`Unsupported token standard: ${request.standard}`);
    }
  }

  private getFactoryInterface(standard: "TBC-20" | "TBC-721" | "TBC-1155"): ethers.Interface {
    switch (standard) {
      case "TBC-20":
        return new ethers.Interface(TBC20_FACTORY_ABI);
      case "TBC-721":
        return new ethers.Interface(TBC721_FACTORY_ABI);
      case "TBC-1155":
        return new ethers.Interface(TBC1155_FACTORY_ABI);
      default:
        throw new Error(`Unsupported token standard: ${standard}`);
    }
  }

  async estimateGas(request: TokenDeploymentRequest): Promise<GasEstimation> {
    const factoryAddress = this.getFactoryAddress(request.standard);
    const data = this.encodeDeploymentData(request);

    try {
      const gasLimit = await this.provider.estimateGas({
        from: request.deployerAddress,
        to: factoryAddress,
        data,
      });

      const feeData = await this.provider.getFeeData();
      const gasLimitWithBuffer = (gasLimit * BigInt(120)) / BigInt(100);
      const maxFeePerGas = feeData.maxFeePerGas || ethers.parseUnits("10", "gwei");
      const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || ethers.parseUnits("1", "gwei");
      const estimatedCostWei = gasLimitWithBuffer * maxFeePerGas;

      return {
        gasLimit: gasLimitWithBuffer.toString(),
        maxFeePerGas: maxFeePerGas.toString(),
        maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
        estimatedCostWei: estimatedCostWei.toString(),
        estimatedCostTB: ethers.formatEther(estimatedCostWei),
      };
    } catch (error: any) {
      console.log("[TokenFactory] RPC estimation failed, using fallback values");
      const fallbackGas = BigInt(500000);
      const fallbackFee = ethers.parseUnits("10", "gwei");
      const estimatedCost = fallbackGas * fallbackFee;

      return {
        gasLimit: fallbackGas.toString(),
        maxFeePerGas: fallbackFee.toString(),
        maxPriorityFeePerGas: ethers.parseUnits("1", "gwei").toString(),
        estimatedCostWei: estimatedCost.toString(),
        estimatedCostTB: ethers.formatEther(estimatedCost),
      };
    }
  }

  buildDeploymentTransaction(request: TokenDeploymentRequest, gasEstimation: GasEstimation): DeploymentTransaction {
    const factoryAddress = this.getFactoryAddress(request.standard);
    const data = this.encodeDeploymentData(request);

    return {
      to: factoryAddress,
      data,
      gasLimit: gasEstimation.gasLimit,
      maxFeePerGas: gasEstimation.maxFeePerGas,
      maxPriorityFeePerGas: gasEstimation.maxPriorityFeePerGas,
      chainId: TBURN_CHAIN_ID,
    };
  }

  async processDeploymentReceipt(
    request: TokenDeploymentRequest,
    txHash: string,
    receipt: {
      blockNumber: number;
      gasUsed: string;
      status: number;
      logs: Array<{ topics: string[]; data: string; address: string }>;
    }
  ): Promise<DeploymentResult> {
    if (receipt.status !== 1) {
      return {
        success: false,
        transactionHash: txHash,
        error: "Transaction failed on-chain",
      };
    }

    const contractAddress = this.extractContractAddress(request.standard, receipt.logs);

    if (!contractAddress) {
      return {
        success: false,
        transactionHash: txHash,
        error: "Could not extract contract address from logs",
      };
    }

    const tokenMetadata: TokenMetadata = {
      id: `${request.standard.toLowerCase()}-${Date.now()}`,
      name: request.name,
      symbol: request.symbol,
      standard: request.standard,
      contractAddress,
      deployerAddress: request.deployerAddress,
      totalSupply: request.totalSupply || (request.standard === "TBC-20" ? "1000000" : "0"),
      decimals: request.decimals || (request.standard === "TBC-20" ? 18 : 0),
      mintable: request.mintable ?? false,
      burnable: request.burnable ?? true,
      pausable: request.pausable ?? false,
      aiOptimizationEnabled: request.aiOptimizationEnabled ?? true,
      quantumResistant: request.quantumResistant ?? true,
      mevProtection: request.mevProtection ?? true,
      deploymentTxHash: txHash,
      deployedAt: new Date().toISOString(),
      blockNumber: receipt.blockNumber,
      status: "confirmed",
    };

    this.deployedTokens.set(contractAddress.toLowerCase(), tokenMetadata);

    // Register in unified TokenRegistry for admin panel integration
    const registeredToken: RegisteredToken = {
      id: tokenMetadata.id,
      name: tokenMetadata.name,
      symbol: tokenMetadata.symbol,
      contractAddress: tokenMetadata.contractAddress,
      standard: request.standard,
      totalSupply: tokenMetadata.totalSupply,
      decimals: tokenMetadata.decimals,
      deployerAddress: tokenMetadata.deployerAddress,
      deploymentTxHash: txHash,
      deployedAt: tokenMetadata.deployedAt,
      blockNumber: receipt.blockNumber,
      mintable: tokenMetadata.mintable,
      burnable: tokenMetadata.burnable,
      pausable: tokenMetadata.pausable,
      maxSupply: request.maxSupply,
      baseUri: request.baseUri,
      royaltyPercentage: request.royaltyPercentage,
      royaltyRecipient: request.royaltyRecipient,
      aiOptimizationEnabled: tokenMetadata.aiOptimizationEnabled,
      quantumResistant: tokenMetadata.quantumResistant,
      mevProtection: tokenMetadata.mevProtection,
      holders: 1,
      transactionCount: 1,
      volume24h: "0",
      status: "active",
      verified: false,
      deploymentSource: "token-factory",
      deploymentMode: "wallet",
    };
    await tokenRegistry.registerToken(registeredToken);

    return {
      success: true,
      contractAddress,
      transactionHash: txHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed,
    };
  }

  private extractContractAddress(
    standard: "TBC-20" | "TBC-721" | "TBC-1155",
    logs: Array<{ topics: string[]; data: string; address: string }>
  ): string | null {
    const iface = this.getFactoryInterface(standard);
    let eventName: string;

    switch (standard) {
      case "TBC-20":
        eventName = "TokenCreated";
        break;
      case "TBC-721":
        eventName = "NFTCreated";
        break;
      case "TBC-1155":
        eventName = "MultiTokenCreated";
        break;
      default:
        return null;
    }

    for (const log of logs) {
      try {
        const parsed = iface.parseLog({
          topics: log.topics,
          data: log.data,
        });
        if (parsed && parsed.name === eventName) {
          return parsed.args[0] as string;
        }
      } catch {
        continue;
      }
    }

    return null;
  }

  getDeployedTokens(deployerAddress?: string): TokenMetadata[] {
    const tokens = Array.from(this.deployedTokens.values());
    if (deployerAddress) {
      return tokens.filter(
        (t) => t.deployerAddress.toLowerCase() === deployerAddress.toLowerCase()
      );
    }
    return tokens;
  }

  getTokenByAddress(contractAddress: string): TokenMetadata | undefined {
    return this.deployedTokens.get(contractAddress.toLowerCase());
  }

  async validateTokenContract(contractAddress: string): Promise<{
    valid: boolean;
    name?: string;
    symbol?: string;
    totalSupply?: string;
    owner?: string;
    error?: string;
  }> {
    try {
      const tokenAbi = [
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function totalSupply() view returns (uint256)",
        "function owner() view returns (address)",
      ];

      const contract = new Contract(contractAddress, tokenAbi, this.provider);
      
      const [name, symbol, totalSupply, owner] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.totalSupply(),
        contract.owner().catch(() => null),
      ]);

      return {
        valid: true,
        name,
        symbol,
        totalSupply: totalSupply.toString(),
        owner: owner || undefined,
      };
    } catch (error: any) {
      return {
        valid: false,
        error: error.message,
      };
    }
  }

  async generateMockDeploymentForSimulation(request: TokenDeploymentRequest): Promise<{
    token: TokenMetadata;
    transaction: {
      hash: string;
      blockNumber: number;
      gasUsed: string;
      status: string;
    };
  }> {
    // Generate TBURN Bech32m address (tb1...) instead of 0x format
    const contractAddress = generateRandomTBurnAddress();

    // Transaction hash remains in 0x format per TBURN spec
    const txRandomBytes = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 256).toString(16).padStart(2, "0")
    ).join("");
    const txHash = `0x${txRandomBytes}`;
    
    // Format deployer address to TBURN Bech32m format if it's in 0x format
    const formattedDeployerAddress = request.deployerAddress.startsWith('0x') 
      ? formatTBurnAddress(request.deployerAddress) 
      : request.deployerAddress;

    const token: TokenMetadata = {
      id: `${request.standard.toLowerCase()}-${Date.now()}`,
      name: request.name,
      symbol: request.symbol,
      standard: request.standard,
      contractAddress,
      deployerAddress: formattedDeployerAddress,
      totalSupply: request.totalSupply || (request.standard === "TBC-20" ? "1000000" : "0"),
      decimals: request.decimals || (request.standard === "TBC-20" ? 18 : 0),
      mintable: request.mintable ?? false,
      burnable: request.burnable ?? true,
      pausable: request.pausable ?? false,
      aiOptimizationEnabled: request.aiOptimizationEnabled ?? true,
      quantumResistant: request.quantumResistant ?? true,
      mevProtection: request.mevProtection ?? true,
      deploymentTxHash: txHash,
      deployedAt: new Date().toISOString(),
      blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
      status: "confirmed",
    };

    this.deployedTokens.set(contractAddress.toLowerCase(), token);

    // Register in unified TokenRegistry for admin panel integration (simulation mode)
    const registeredToken: RegisteredToken = {
      id: token.id,
      name: token.name,
      symbol: token.symbol,
      contractAddress: token.contractAddress,
      standard: request.standard,
      totalSupply: token.totalSupply,
      decimals: token.decimals,
      deployerAddress: token.deployerAddress,
      deploymentTxHash: txHash,
      deployedAt: token.deployedAt,
      blockNumber: token.blockNumber,
      mintable: token.mintable,
      burnable: token.burnable,
      pausable: token.pausable,
      maxSupply: request.maxSupply,
      baseUri: request.baseUri,
      royaltyPercentage: request.royaltyPercentage,
      royaltyRecipient: request.royaltyRecipient,
      aiOptimizationEnabled: token.aiOptimizationEnabled,
      quantumResistant: token.quantumResistant,
      mevProtection: token.mevProtection,
      holders: 1,
      transactionCount: 1,
      volume24h: "0",
      status: "active",
      verified: false,
      deploymentSource: "token-generator",
      deploymentMode: "simulation",
    };
    await tokenRegistry.registerToken(registeredToken);

    return {
      token,
      transaction: {
        hash: txHash,
        blockNumber: token.blockNumber,
        gasUsed: (Math.floor(Math.random() * 300000) + 200000).toString(),
        status: "success",
      },
    };
  }

  async waitForTransactionReceipt(
    txHash: string,
    confirmations: number = 1,
    timeout: number = 60000
  ): Promise<{
    receipt: TransactionReceipt | null;
    status: "success" | "failed" | "timeout";
    error?: string;
  }> {
    try {
      const receipt = await Promise.race([
        this.provider.waitForTransaction(txHash, confirmations),
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error("Transaction timeout")), timeout)
        ),
      ]);

      if (!receipt) {
        return { receipt: null, status: "timeout", error: "Transaction confirmation timeout" };
      }

      return {
        receipt,
        status: receipt.status === 1 ? "success" : "failed",
      };
    } catch (error: any) {
      if (error.message === "Transaction timeout") {
        return { receipt: null, status: "timeout", error: "Transaction confirmation timeout" };
      }
      return { receipt: null, status: "failed", error: error.message };
    }
  }

  async getFactoryStatus(): Promise<{
    isReady: boolean;
    rpcConnected: boolean;
    blockNumber?: number;
    factories: {
      TBC20: { address: string; isConfigured: boolean };
      TBC721: { address: string; isConfigured: boolean };
      TBC1155: { address: string; isConfigured: boolean };
    };
    launchReady: boolean;
    launchDate: string;
    deployedTokensCount: number;
    warnings: string[];
  }> {
    const warnings: string[] = [];
    
    const isPlaceholderAddress = (addr: string) => addr.startsWith("0x1000000000000000000");
    
    if (isPlaceholderAddress(TBC20_FACTORY_ADDRESS)) {
      warnings.push("TBC20_FACTORY_ADDRESS uses placeholder - set environment variable for production");
    }
    if (isPlaceholderAddress(TBC721_FACTORY_ADDRESS)) {
      warnings.push("TBC721_FACTORY_ADDRESS uses placeholder - set environment variable for production");
    }
    if (isPlaceholderAddress(TBC1155_FACTORY_ADDRESS)) {
      warnings.push("TBC1155_FACTORY_ADDRESS uses placeholder - set environment variable for production");
    }

    const rpcConnection = await this.checkConnection();
    if (!rpcConnection.connected) {
      warnings.push(`RPC connection failed: ${rpcConnection.error}`);
    }

    const factories = {
      TBC20: {
        address: TBC20_FACTORY_ADDRESS,
        isConfigured: !isPlaceholderAddress(TBC20_FACTORY_ADDRESS),
      },
      TBC721: {
        address: TBC721_FACTORY_ADDRESS,
        isConfigured: !isPlaceholderAddress(TBC721_FACTORY_ADDRESS),
      },
      TBC1155: {
        address: TBC1155_FACTORY_ADDRESS,
        isConfigured: !isPlaceholderAddress(TBC1155_FACTORY_ADDRESS),
      },
    };

    const isReady = rpcConnection.connected && warnings.length === 0;

    return {
      isReady,
      rpcConnected: rpcConnection.connected,
      blockNumber: rpcConnection.blockNumber,
      factories,
      launchReady: isReady,
      launchDate: LAUNCH_DATE.toISOString(),
      deployedTokensCount: this.deployedTokens.size,
      warnings,
    };
  }
}

export const tokenFactoryService = TokenFactoryService.getInstance();
