import { ethers } from "ethers";
import { randomBytes, createHash } from "crypto";
import { 
  deriveAddressFromPublicKey,
  generateTBurnAddress,
  isValidTBurnAddress,
  isTb1Format
} from "../utils/tburn-address";

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

  /**
   * Generate a PRODUCTION wallet with cryptographically linked address
   * Address is derived from public key using SHA256 + RIPEMD160
   * This ensures the private key can sign transactions for this address
   */
  generateWallet(): TBurnWallet {
    // Generate secp256k1 key pair
    const wallet = ethers.Wallet.createRandom();
    const publicKey = wallet.signingKey.publicKey;
    // Derive TBURN address from public key (cryptographically linked)
    const tburnAddress = deriveAddressFromPublicKey(publicKey);
    
    return {
      address: tburnAddress,
      publicKey: publicKey,
      chainId: TBURN_CHAIN_ID,
      network: TBURN_NETWORK_NAME,
      createdAt: new Date(),
    };
  }

  /**
   * Generate a PRODUCTION wallet with private key for external transfers
   * Address is cryptographically derived from the public key
   * Private key can sign real transactions for this address
   */
  generateWalletWithPrivateKey(): TBurnWallet & { privateKey: string } {
    // Generate secp256k1 key pair
    const wallet = ethers.Wallet.createRandom();
    const publicKey = wallet.signingKey.publicKey;
    // Derive TBURN address from public key (cryptographically linked)
    const tburnAddress = deriveAddressFromPublicKey(publicKey);
    
    return {
      address: tburnAddress,
      publicKey: publicKey,
      privateKey: wallet.privateKey,
      chainId: TBURN_CHAIN_ID,
      network: TBURN_NETWORK_NAME,
      createdAt: new Date(),
    };
  }

  /**
   * Generate a deterministic PRODUCTION wallet from seed
   * Address is cryptographically derived from the public key
   */
  generateDeterministicWallet(seed: string): TBurnWallet {
    const hash = createHash("sha256").update(seed).digest("hex");
    const wallet = new ethers.Wallet(`0x${hash}`);
    const publicKey = wallet.signingKey.publicKey;
    // Derive TBURN address from public key (cryptographically linked)
    const tburnAddress = deriveAddressFromPublicKey(publicKey);
    
    return {
      address: tburnAddress,
      publicKey: publicKey,
      chainId: TBURN_CHAIN_ID,
      network: TBURN_NETWORK_NAME,
      createdAt: new Date(),
    };
  }

  validateAddress(address: string): boolean {
    // Support both TBURN Bech32m (tb1...) and legacy Ethereum (0x...) formats
    return isValidTBurnAddress(address) || ethers.isAddress(address);
  }

  formatAddress(address: string): string {
    if (!this.validateAddress(address)) {
      throw new Error("Invalid TBURN address format");
    }
    // If it's a tb1 address, return as-is
    if (isTb1Format(address)) {
      return address;
    }
    // If it's an Ethereum address, format with checksum
    return ethers.getAddress(address);
  }

  getAddressChecksum(address: string): string {
    if (isTb1Format(address)) {
      return address; // Bech32m has built-in checksum
    }
    return ethers.getAddress(address);
  }

  getWalletMetadata(): TBurnWalletMetadata {
    return {
      version: TBURN_WALLET_VERSION,
      algorithm: "secp256k1",
      chainId: TBURN_CHAIN_ID,
      networkName: TBURN_NETWORK_NAME,
      addressPrefix: "tb1",
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
