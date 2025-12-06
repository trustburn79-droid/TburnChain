import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { BrowserProvider, formatEther, type Eip1193Provider } from "ethers";

declare global {
  interface Window {
    ethereum?: Eip1193Provider & {
      isMetaMask?: boolean;
      isTrust?: boolean;
      isCoinbaseWallet?: boolean;
      isRabby?: boolean;
      providers?: Array<Eip1193Provider & { isMetaMask?: boolean; isTrust?: boolean; isCoinbaseWallet?: boolean; isRabby?: boolean }>;
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
      request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

export type WalletType = "metamask" | "rabby" | "trust" | "coinbase" | "ledger" | null;

export interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  balance: string | null;
  chainId: number | null;
  walletType: WalletType;
  error: string | null;
}

export interface Web3ContextType extends WalletState {
  connect: (walletType: WalletType) => Promise<boolean>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<boolean>;
  signMessage: (message: string) => Promise<string | null>;
  isWalletAvailable: (walletType: WalletType) => boolean;
  formatAddress: (address: string) => string;
  provider: BrowserProvider | null;
}

const TBURN_CHAIN_ID = 7979;
const TBURN_CHAIN_CONFIG = {
  chainId: `0x${TBURN_CHAIN_ID.toString(16)}`,
  chainName: "TBURN Mainnet",
  nativeCurrency: {
    name: "TBURN",
    symbol: "TBURN",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.tburn.network"],
  blockExplorerUrls: ["https://scan.tburn.network"],
};

const initialState: WalletState = {
  isConnected: false,
  isConnecting: false,
  address: null,
  balance: null,
  chainId: null,
  walletType: null,
  error: null,
};

const Web3Context = createContext<Web3ContextType | null>(null);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>(initialState);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);

  const formatAddressDisplay = useCallback((address: string): string => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  const getProvider = useCallback((walletType: WalletType): Eip1193Provider | null => {
    if (typeof window === "undefined" || !window.ethereum) return null;

    if (window.ethereum.providers?.length) {
      for (const p of window.ethereum.providers) {
        if (walletType === "metamask" && p.isMetaMask) return p;
        if (walletType === "rabby" && p.isRabby) return p;
        if (walletType === "trust" && p.isTrust) return p;
        if (walletType === "coinbase" && p.isCoinbaseWallet) return p;
      }
    }

    if (walletType === "metamask" && window.ethereum.isMetaMask) return window.ethereum;
    if (walletType === "rabby" && window.ethereum.isRabby) return window.ethereum;
    if (walletType === "trust" && window.ethereum.isTrust) return window.ethereum;
    if (walletType === "coinbase" && window.ethereum.isCoinbaseWallet) return window.ethereum;

    return window.ethereum;
  }, []);

  const isWalletAvailable = useCallback((walletType: WalletType): boolean => {
    if (typeof window === "undefined" || !window.ethereum) return false;
    
    if (walletType === "ledger") {
      return !!window.ethereum;
    }

    if (window.ethereum.providers?.length) {
      return window.ethereum.providers.some((p) => {
        if (walletType === "metamask") return p.isMetaMask;
        if (walletType === "rabby") return p.isRabby;
        if (walletType === "trust") return p.isTrust;
        if (walletType === "coinbase") return p.isCoinbaseWallet;
        return false;
      });
    }

    if (walletType === "metamask") return !!window.ethereum.isMetaMask;
    if (walletType === "rabby") return !!window.ethereum.isRabby;
    if (walletType === "trust") return !!window.ethereum.isTrust;
    if (walletType === "coinbase") return !!window.ethereum.isCoinbaseWallet;

    return !!window.ethereum;
  }, []);

  const updateBalance = useCallback(async (browserProvider: BrowserProvider, address: string) => {
    try {
      const balance = await browserProvider.getBalance(address);
      setState((prev) => ({ ...prev, balance: formatEther(balance) }));
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    }
  }, []);

  const connect = useCallback(async (walletType: WalletType): Promise<boolean> => {
    if (!walletType) return false;

    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const ethProvider = getProvider(walletType);
      if (!ethProvider) {
        const walletNames: Record<string, string> = {
          metamask: "MetaMask",
          rabby: "Rabby Wallet",
          trust: "Trust Wallet",
          coinbase: "Coinbase Wallet",
          ledger: "Ledger",
        };
        throw new Error(`${walletNames[walletType]} is not installed`);
      }

      const browserProvider = new BrowserProvider(ethProvider);
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const address = accounts[0];
      const network = await browserProvider.getNetwork();
      const chainId = Number(network.chainId);

      setProvider(browserProvider);
      setState({
        isConnected: true,
        isConnecting: false,
        address,
        balance: null,
        chainId,
        walletType,
        error: null,
      });

      await updateBalance(browserProvider, address);

      localStorage.setItem("tburn_wallet_type", walletType);
      localStorage.setItem("tburn_wallet_address", address);

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to connect wallet";
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }));
      return false;
    }
  }, [getProvider, updateBalance]);

  const disconnect = useCallback(() => {
    setProvider(null);
    setState(initialState);
    localStorage.removeItem("tburn_wallet_type");
    localStorage.removeItem("tburn_wallet_address");
  }, []);

  const switchNetwork = useCallback(async (targetChainId: number): Promise<boolean> => {
    if (!window.ethereum?.request) return false;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
      return true;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && (error as { code: number }).code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [TBURN_CHAIN_CONFIG],
          });
          return true;
        } catch (addError) {
          console.error("Failed to add network:", addError);
          return false;
        }
      }
      console.error("Failed to switch network:", error);
      return false;
    }
  }, []);

  const signMessage = useCallback(async (message: string): Promise<string | null> => {
    if (!provider || !state.address) return null;

    try {
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);
      return signature;
    } catch (error) {
      console.error("Failed to sign message:", error);
      return null;
    }
  }, [provider, state.address]);

  useEffect(() => {
    const savedWalletType = localStorage.getItem("tburn_wallet_type") as WalletType;
    if (savedWalletType && isWalletAvailable(savedWalletType)) {
      connect(savedWalletType);
    }
  }, [connect, isWalletAvailable]);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const accountList = accounts as string[];
      if (accountList.length === 0) {
        disconnect();
      } else if (state.isConnected && accountList[0] !== state.address) {
        setState((prev) => ({ ...prev, address: accountList[0] }));
        if (provider) {
          updateBalance(provider, accountList[0]);
        }
      }
    };

    const handleChainChanged = (chainId: unknown) => {
      const newChainId = typeof chainId === 'string' ? parseInt(chainId, 16) : chainId as number;
      setState((prev) => ({ ...prev, chainId: newChainId }));
    };

    const handleDisconnect = () => {
      disconnect();
    };

    window.ethereum.on?.("accountsChanged", handleAccountsChanged);
    window.ethereum.on?.("chainChanged", handleChainChanged);
    window.ethereum.on?.("disconnect", handleDisconnect);

    return () => {
      window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener?.("chainChanged", handleChainChanged);
      window.ethereum?.removeListener?.("disconnect", handleDisconnect);
    };
  }, [state.isConnected, state.address, provider, disconnect, updateBalance]);

  const value: Web3ContextType = {
    ...state,
    connect,
    disconnect,
    switchNetwork,
    signMessage,
    isWalletAvailable,
    formatAddress: formatAddressDisplay,
    provider,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export function useWeb3(): Web3ContextType {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}

export { TBURN_CHAIN_ID, TBURN_CHAIN_CONFIG };
