import { ethers, BrowserProvider, JsonRpcSigner, Network } from "ethers";

export const TBURN_MAINNET_CONFIG = {
  chainId: 5800,
  chainIdHex: "0x16a8",
  name: "TBURN Mainnet",
  currency: {
    name: "TBURN",
    symbol: "TBURN",
    decimals: 18,
  },
  rpcUrls: [
    "https://tburn.io/rpc",
    "https://tburn.io",
    "https://mainnet.tburn.network/rpc",
  ],
  blockExplorerUrls: ["https://tburn.io/scan"],
  iconUrls: ["https://tburn.network/logo.png"],
};

export interface Web3State {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  chainId: number | null;
  balance: string | null;
  isCorrectNetwork: boolean;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  error: string | null;
}

export interface TransactionRequest {
  to: string;
  data: string;
  value?: bigint;
  gasLimit?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
}

export interface TransactionResult {
  hash: string;
  blockNumber: number;
  gasUsed: bigint;
  status: "success" | "failed";
  confirmations: number;
  contractAddress?: string;
}

export interface GasEstimate {
  gasLimit: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  estimatedCostWei: bigint;
  estimatedCostTB: string;
}

class Web3ProviderService {
  private static instance: Web3ProviderService;
  private provider: BrowserProvider | null = null;
  private signer: JsonRpcSigner | null = null;
  private listeners: Set<(state: Web3State) => void> = new Set();
  private state: Web3State = {
    isConnected: false,
    isConnecting: false,
    address: null,
    chainId: null,
    balance: null,
    isCorrectNetwork: false,
    provider: null,
    signer: null,
    error: null,
  };

  private constructor() {
    if (typeof window !== "undefined" && window.ethereum) {
      this.setupEventListeners();
    }
  }

  static getInstance(): Web3ProviderService {
    if (!Web3ProviderService.instance) {
      Web3ProviderService.instance = new Web3ProviderService();
    }
    return Web3ProviderService.instance;
  }

  private setupEventListeners(): void {
    const ethereum = window.ethereum;
    if (!ethereum || typeof ethereum.on !== 'function') return;

    ethereum.on("accountsChanged", (accounts: unknown) => {
      const accountList = accounts as string[];
      if (accountList.length === 0) {
        this.disconnect();
      } else {
        this.updateState();
      }
    });

    ethereum.on("chainChanged", (chainId: unknown) => {
      const numericChainId = parseInt(chainId as string, 16);
      this.state.chainId = numericChainId;
      this.state.isCorrectNetwork = numericChainId === TBURN_MAINNET_CONFIG.chainId;
      this.updateState();
    });

    ethereum.on("disconnect", () => {
      this.disconnect();
    });
  }

  subscribe(listener: (state: Web3State) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }

  private async updateState(): Promise<void> {
    if (!this.provider || !this.signer) return;

    try {
      const address = await this.signer.getAddress();
      const network = await this.provider.getNetwork();
      const balance = await this.provider.getBalance(address);

      this.state = {
        ...this.state,
        address,
        chainId: Number(network.chainId),
        balance: ethers.formatEther(balance),
        isCorrectNetwork: Number(network.chainId) === TBURN_MAINNET_CONFIG.chainId,
        provider: this.provider,
        signer: this.signer,
        error: null,
      };
      this.notifyListeners();
    } catch (error) {
      console.error("Error updating web3 state:", error);
    }
  }

  isMetaMaskInstalled(): boolean {
    return typeof window !== "undefined" && typeof window.ethereum !== "undefined";
  }

  async connect(): Promise<Web3State> {
    if (!this.isMetaMaskInstalled()) {
      this.state = {
        ...this.state,
        error: "MetaMask is not installed. Please install MetaMask to continue.",
      };
      this.notifyListeners();
      throw new Error("MetaMask is not installed");
    }

    this.state = { ...this.state, isConnecting: true, error: null };
    this.notifyListeners();

    try {
      const ethereum = window.ethereum!;
      this.provider = new BrowserProvider(ethereum);
      
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      }) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }

      this.signer = await this.provider.getSigner();
      const address = await this.signer.getAddress();
      const network = await this.provider.getNetwork();
      const balance = await this.provider.getBalance(address);

      this.state = {
        isConnected: true,
        isConnecting: false,
        address,
        chainId: Number(network.chainId),
        balance: ethers.formatEther(balance),
        isCorrectNetwork: Number(network.chainId) === TBURN_MAINNET_CONFIG.chainId,
        provider: this.provider,
        signer: this.signer,
        error: null,
      };
      this.notifyListeners();

      return this.state;
    } catch (error: any) {
      const errorMessage = 
        error.code === 4001
          ? "Connection rejected by user"
          : error.message || "Failed to connect wallet";

      this.state = {
        ...this.state,
        isConnecting: false,
        error: errorMessage,
      };
      this.notifyListeners();
      throw error;
    }
  }

  disconnect(): void {
    this.provider = null;
    this.signer = null;
    this.state = {
      isConnected: false,
      isConnecting: false,
      address: null,
      chainId: null,
      balance: null,
      isCorrectNetwork: false,
      provider: null,
      signer: null,
      error: null,
    };
    this.notifyListeners();
  }

  async switchToTBurnNetwork(): Promise<void> {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: TBURN_MAINNET_CONFIG.chainIdHex }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await this.addTBurnNetwork();
      } else {
        throw switchError;
      }
    }

    await this.updateState();
  }

  async addTBurnNetwork(): Promise<void> {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: TBURN_MAINNET_CONFIG.chainIdHex,
          chainName: TBURN_MAINNET_CONFIG.name,
          nativeCurrency: TBURN_MAINNET_CONFIG.currency,
          rpcUrls: TBURN_MAINNET_CONFIG.rpcUrls,
          blockExplorerUrls: TBURN_MAINNET_CONFIG.blockExplorerUrls,
          iconUrls: TBURN_MAINNET_CONFIG.iconUrls,
        },
      ],
    });
  }

  async estimateGas(tx: TransactionRequest): Promise<GasEstimate> {
    if (!this.provider || !this.signer) {
      throw new Error("Wallet not connected");
    }

    const feeData = await this.provider.getFeeData();
    const gasLimit = await this.provider.estimateGas({
      from: await this.signer.getAddress(),
      to: tx.to,
      data: tx.data,
      value: tx.value || BigInt(0),
    });

    const gasLimitWithBuffer = (gasLimit * BigInt(115)) / BigInt(100);
    const maxFeePerGas = feeData.maxFeePerGas || ethers.parseUnits("10", "gwei");
    const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || ethers.parseUnits("1", "gwei");
    const estimatedCostWei = gasLimitWithBuffer * maxFeePerGas;

    return {
      gasLimit: gasLimitWithBuffer,
      maxFeePerGas,
      maxPriorityFeePerGas,
      estimatedCostWei,
      estimatedCostTB: ethers.formatEther(estimatedCostWei),
    };
  }

  async sendTransaction(tx: TransactionRequest): Promise<TransactionResult> {
    if (!this.signer) {
      throw new Error("Wallet not connected");
    }

    if (!this.state.isCorrectNetwork) {
      throw new Error("Please switch to TBURN Mainnet");
    }

    const gasEstimate = await this.estimateGas(tx);

    const transaction = await this.signer.sendTransaction({
      to: tx.to,
      data: tx.data,
      value: tx.value || BigInt(0),
      gasLimit: tx.gasLimit || gasEstimate.gasLimit,
      maxFeePerGas: tx.maxFeePerGas || gasEstimate.maxFeePerGas,
      maxPriorityFeePerGas: tx.maxPriorityFeePerGas || gasEstimate.maxPriorityFeePerGas,
    });

    const receipt = await transaction.wait(1);

    if (!receipt) {
      throw new Error("Transaction failed - no receipt");
    }

    return {
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed,
      status: receipt.status === 1 ? "success" : "failed",
      confirmations: 1,
      contractAddress: receipt.contractAddress || undefined,
    };
  }

  async deployContract(bytecode: string, constructorArgs: string = ""): Promise<TransactionResult> {
    if (!this.signer) {
      throw new Error("Wallet not connected");
    }

    if (!this.state.isCorrectNetwork) {
      throw new Error("Please switch to TBURN Mainnet");
    }

    const deployData = bytecode + constructorArgs;

    const gasEstimate = await this.provider!.estimateGas({
      from: await this.signer.getAddress(),
      data: deployData,
    });

    const gasLimitWithBuffer = (gasEstimate * BigInt(120)) / BigInt(100);
    const feeData = await this.provider!.getFeeData();

    const transaction = await this.signer.sendTransaction({
      data: deployData,
      gasLimit: gasLimitWithBuffer,
      maxFeePerGas: feeData.maxFeePerGas || ethers.parseUnits("10", "gwei"),
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || ethers.parseUnits("1", "gwei"),
    });

    const receipt = await transaction.wait(2);

    if (!receipt || !receipt.contractAddress) {
      throw new Error("Contract deployment failed");
    }

    return {
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed,
      status: receipt.status === 1 ? "success" : "failed",
      confirmations: 2,
      contractAddress: receipt.contractAddress,
    };
  }

  getState(): Web3State {
    return this.state;
  }

  getProvider(): BrowserProvider | null {
    return this.provider;
  }

  getSigner(): JsonRpcSigner | null {
    return this.signer;
  }
}

export const web3Provider = Web3ProviderService.getInstance();
