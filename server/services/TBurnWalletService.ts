import { ethers } from "ethers";
import { randomBytes, createHash } from "crypto";

export interface TBurnWallet {
  address: string;
  publicKey: string;
  privateKeyEncrypted?: string;
  chainId: number;
  network: string;
  createdAt: Date;
}

export interface TBurnWalletMetadata {
  version: string;
  algorithm: string;
  chainId: number;
  networkName: string;
  addressPrefix: string;
}

const TBURN_CHAIN_ID = 7979;
const TBURN_NETWORK_NAME = "TBURN Mainnet";
const TBURN_WALLET_VERSION = "1.0.0";

export class TBurnWalletService {
  private static instance: TBurnWalletService;

  private constructor() {}

  static getInstance(): TBurnWalletService {
    if (!TBurnWalletService.instance) {
      TBurnWalletService.instance = new TBurnWalletService();
    }
    return TBurnWalletService.instance;
  }

  generateWallet(): TBurnWallet {
    const wallet = ethers.Wallet.createRandom();
    
    return {
      address: wallet.address,
      publicKey: wallet.publicKey,
      chainId: TBURN_CHAIN_ID,
      network: TBURN_NETWORK_NAME,
      createdAt: new Date(),
    };
  }

  generateWalletWithPrivateKey(): TBurnWallet & { privateKey: string } {
    const wallet = ethers.Wallet.createRandom();
    
    return {
      address: wallet.address,
      publicKey: wallet.publicKey,
      privateKey: wallet.privateKey,
      chainId: TBURN_CHAIN_ID,
      network: TBURN_NETWORK_NAME,
      createdAt: new Date(),
    };
  }

  generateDeterministicWallet(seed: string): TBurnWallet {
    const hash = createHash("sha256").update(seed).digest("hex");
    const wallet = new ethers.Wallet(`0x${hash}`);
    
    return {
      address: wallet.address,
      publicKey: wallet.publicKey,
      chainId: TBURN_CHAIN_ID,
      network: TBURN_NETWORK_NAME,
      createdAt: new Date(),
    };
  }

  validateAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  formatAddress(address: string): string {
    if (!this.validateAddress(address)) {
      throw new Error("Invalid TBURN address format");
    }
    return ethers.getAddress(address);
  }

  getAddressChecksum(address: string): string {
    return ethers.getAddress(address);
  }

  getWalletMetadata(): TBurnWalletMetadata {
    return {
      version: TBURN_WALLET_VERSION,
      algorithm: "secp256k1",
      chainId: TBURN_CHAIN_ID,
      networkName: TBURN_NETWORK_NAME,
      addressPrefix: "0x",
    };
  }

  generateMultipleWallets(count: number): TBurnWallet[] {
    const wallets: TBurnWallet[] = [];
    for (let i = 0; i < count; i++) {
      wallets.push(this.generateWallet());
    }
    return wallets;
  }

  deriveAddressFromPublicKey(publicKey: string): string {
    return ethers.computeAddress(publicKey);
  }

  signMessage(privateKey: string, message: string): Promise<string> {
    const wallet = new ethers.Wallet(privateKey);
    return wallet.signMessage(message);
  }

  verifySignature(message: string, signature: string, expectedAddress: string): boolean {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    } catch {
      return false;
    }
  }

  getChainConfig() {
    return {
      chainId: TBURN_CHAIN_ID,
      chainName: TBURN_NETWORK_NAME,
      nativeCurrency: {
        name: "TBURN",
        symbol: "TBURN",
        decimals: 18,
      },
      rpcUrls: ["https://mainnet.tburn.io/rpc"],
      blockExplorerUrls: ["https://explorer.tburn.io"],
    };
  }
}

export const tburnWalletService = TBurnWalletService.getInstance();
