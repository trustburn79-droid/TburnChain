import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { BrowserProvider, formatEther, type Eip1193Provider, type TransactionRequest, type TransactionResponse } from "ethers";

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
      selectedAddress?: string | null;
    };
  }
}

export type WalletType = "metamask" | "rabby" | "trust" | "coinbase" | "ledger" | null;

export interface MemberInfo {
  id: string;
  accountAddress: string;
  displayName: string | null;
  memberTier: string;
  memberStatus: string;
  kycLevel: string | null;
  isRegistered: boolean;
}

export interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  address: string | null;
  balance: string | null;
  chainId: number | null;
  walletType: WalletType;
  error: string | null;
  lastConnectedAt: number | null;
  connectionAttempts: number;
  memberInfo: MemberInfo | null;
  isFetchingMember: boolean;
}

export interface TransactionConfig {
  to: string;
  value?: string;
  data?: string;
  gasLimit?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
}

export interface PendingTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  status: "pending" | "confirmed" | "failed";
  timestamp: number;
  confirmations: number;
}

export interface Web3ContextType extends WalletState {
  connect: (walletType: WalletType) => Promise<boolean>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<boolean>;
  signMessage: (message: string) => Promise<string | null>;
  signTypedData: (domain: object, types: Record<string, Array<{ name: string; type: string }>>, value: Record<string, unknown>) => Promise<string | null>;
  sendTransaction: (tx: TransactionConfig) => Promise<TransactionResponse | null>;
  isWalletAvailable: (walletType: WalletType) => boolean;
  formatAddress: (address: string) => string;
  refreshBalance: () => Promise<void>;
  validateAddress: (address: string) => boolean;
  isCorrectNetwork: boolean;
  provider: BrowserProvider | null;
  pendingTransactions: PendingTransaction[];
  clearError: () => void;
  getConnectionHealth: () => ConnectionHealth;
  fetchMemberInfo: (address: string) => Promise<MemberInfo | null>;
  registerAsMember: (address: string, displayName?: string) => Promise<MemberInfo | null>;
  refreshMemberInfo: () => Promise<void>;
}

export interface ConnectionHealth {
  isHealthy: boolean;
  latency: number | null;
  lastCheck: number | null;
  consecutiveFailures: number;
}

const TBURN_CHAIN_ID = 6000;
const TBURN_CHAIN_CONFIG = {
  chainId: `0x${TBURN_CHAIN_ID.toString(16)}`,
  chainName: "TBURN Mainnet",
  nativeCurrency: {
    name: "TBURN",
    symbol: "TBURN",
    decimals: 18,
  },
  rpcUrls: ["https://tburn.io/rpc"],
  blockExplorerUrls: ["https://tburn.io/scan"],
};

const CONNECTION_TIMEOUT = 30000;
const MAX_RECONNECTION_ATTEMPTS = 3;
const RECONNECTION_DELAY = 2000;
const HEALTH_CHECK_INTERVAL = 30000;
const BALANCE_REFRESH_INTERVAL = 15000;
const SESSION_EXPIRY_HOURS = 24;

const initialState: WalletState = {
  isConnected: false,
  isConnecting: false,
  isReconnecting: false,
  address: null,
  balance: null,
  chainId: null,
  walletType: null,
  error: null,
  lastConnectedAt: null,
  connectionAttempts: 0,
  memberInfo: null,
  isFetchingMember: false,
};

const Web3Context = createContext<Web3ContextType | null>(null);

function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function secureLog(action: string, data?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "development") {
    const sanitized = data ? { ...data } : {};
    if (sanitized.address && typeof sanitized.address === "string") {
      sanitized.address = `${sanitized.address.slice(0, 8)}...${sanitized.address.slice(-6)}`;
    }
    console.log(`[Web3] ${action}`, sanitized);
  }
}

export function Web3Provider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>(initialState);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);
  const [connectionHealth, setConnectionHealth] = useState<ConnectionHealth>({
    isHealthy: true,
    latency: null,
    lastCheck: null,
    consecutiveFailures: 0,
  });

  const healthCheckRef = useRef<NodeJS.Timeout | null>(null);
  const balanceRefreshRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const clearAllTimeouts = useCallback(() => {
    if (healthCheckRef.current) clearInterval(healthCheckRef.current);
    if (balanceRefreshRef.current) clearInterval(balanceRefreshRef.current);
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
  }, []);

  const formatAddressDisplay = useCallback((address: string): string => {
    if (!address || !isValidEthereumAddress(address)) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  const validateAddress = useCallback((address: string): boolean => {
    return isValidEthereumAddress(address);
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const fetchMemberInfo = useCallback(async (address: string): Promise<MemberInfo | null> => {
    if (!address || !isValidEthereumAddress(address)) return null;
    
    setState(prev => ({ ...prev, isFetchingMember: true }));
    
    try {
      const response = await fetch(`/api/members/address/${address}`);
      
      if (response.ok) {
        const member = await response.json();
        const memberInfo: MemberInfo = {
          id: member.id,
          accountAddress: member.accountAddress,
          displayName: member.displayName,
          memberTier: member.memberTier || 'community_member',
          memberStatus: member.memberStatus || 'active',
          kycLevel: member.kycLevel || 'none',
          isRegistered: true,
        };
        
        if (mountedRef.current) {
          setState(prev => ({ ...prev, memberInfo, isFetchingMember: false }));
        }
        secureLog("Member found", { memberId: member.id, tier: member.memberTier });
        return memberInfo;
      } else if (response.status === 404) {
        const unregisteredInfo: MemberInfo = {
          id: '',
          accountAddress: address,
          displayName: null,
          memberTier: 'unregistered',
          memberStatus: 'pending',
          kycLevel: null,
          isRegistered: false,
        };
        
        if (mountedRef.current) {
          setState(prev => ({ ...prev, memberInfo: unregisteredInfo, isFetchingMember: false }));
        }
        secureLog("Member not found - unregistered wallet", { address });
        return unregisteredInfo;
      }
      
      throw new Error("Failed to fetch member info");
    } catch (error) {
      secureLog("Member fetch error", { error: String(error) });
      if (mountedRef.current) {
        setState(prev => ({ ...prev, isFetchingMember: false }));
      }
      return null;
    }
  }, []);

  const registerAsMember = useCallback(async (address: string, displayName?: string): Promise<MemberInfo | null> => {
    if (!address || !isValidEthereumAddress(address)) return null;
    
    setState(prev => ({ ...prev, isFetchingMember: true }));
    
    try {
      const response = await fetch('/api/members/register-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          accountAddress: address,
          displayName: displayName || `Wallet ${address.slice(0, 8)}`,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to register member");
      }
      
      // Registration successful - now fetch the complete member data
      // This ensures UI reflects the full authoritative member payload
      secureLog("Member registration POST successful, fetching full data");
      const refreshedMemberInfo = await fetchMemberInfo(address);
      
      return refreshedMemberInfo;
    } catch (error) {
      secureLog("Member registration error", { error: String(error) });
      return null;
    } finally {
      if (mountedRef.current) {
        setState(prev => ({ ...prev, isFetchingMember: false }));
      }
    }
  }, [fetchMemberInfo]);

  const refreshMemberInfo = useCallback(async () => {
    if (state.address) {
      await fetchMemberInfo(state.address);
    }
  }, [state.address, fetchMemberInfo]);

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
    if (!mountedRef.current) return;
    
    try {
      const startTime = Date.now();
      const balance = await browserProvider.getBalance(address);
      const latency = Date.now() - startTime;
      
      if (mountedRef.current) {
        setState(prev => ({ ...prev, balance: formatEther(balance) }));
        setConnectionHealth(prev => ({
          ...prev,
          latency,
          lastCheck: Date.now(),
          consecutiveFailures: 0,
          isHealthy: true,
        }));
      }
    } catch (error) {
      secureLog("Balance fetch failed", { error: String(error) });
      if (mountedRef.current) {
        setConnectionHealth(prev => ({
          ...prev,
          consecutiveFailures: prev.consecutiveFailures + 1,
          isHealthy: prev.consecutiveFailures < 3,
        }));
      }
    }
  }, []);

  const refreshBalance = useCallback(async () => {
    if (provider && state.address) {
      await updateBalance(provider, state.address);
    }
  }, [provider, state.address, updateBalance]);

  const startHealthMonitoring = useCallback((browserProvider: BrowserProvider, address: string) => {
    if (healthCheckRef.current) clearInterval(healthCheckRef.current);
    if (balanceRefreshRef.current) clearInterval(balanceRefreshRef.current);

    healthCheckRef.current = setInterval(async () => {
      if (!mountedRef.current) return;
      try {
        const startTime = Date.now();
        await browserProvider.getBlockNumber();
        const latency = Date.now() - startTime;
        
        setConnectionHealth(prev => ({
          isHealthy: true,
          latency,
          lastCheck: Date.now(),
          consecutiveFailures: 0,
        }));
      } catch {
        setConnectionHealth(prev => ({
          ...prev,
          consecutiveFailures: prev.consecutiveFailures + 1,
          isHealthy: prev.consecutiveFailures < 3,
        }));
      }
    }, HEALTH_CHECK_INTERVAL);

    balanceRefreshRef.current = setInterval(() => {
      updateBalance(browserProvider, address);
    }, BALANCE_REFRESH_INTERVAL);
  }, [updateBalance]);

  const isSessionValid = useCallback((): boolean => {
    const savedTimestamp = localStorage.getItem("tburn_wallet_timestamp");
    if (!savedTimestamp) return false;
    
    const timestamp = parseInt(savedTimestamp, 10);
    const expiryTime = SESSION_EXPIRY_HOURS * 60 * 60 * 1000;
    return Date.now() - timestamp < expiryTime;
  }, []);

  const connect = useCallback(async (walletType: WalletType): Promise<boolean> => {
    if (!walletType) return false;

    setState(prev => ({ 
      ...prev, 
      isConnecting: true, 
      error: null,
      connectionAttempts: prev.connectionAttempts + 1,
    }));

    secureLog("Connection attempt", { walletType, attempt: state.connectionAttempts + 1 });

    const connectionPromise = new Promise<boolean>(async (resolve, reject) => {
      connectionTimeoutRef.current = setTimeout(() => {
        reject(new Error("Connection timeout - wallet did not respond"));
      }, CONNECTION_TIMEOUT);

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
          throw new Error(`${walletNames[walletType]} is not installed. Please install the wallet extension and refresh the page.`);
        }

        const browserProvider = new BrowserProvider(ethProvider);
        const accounts = await browserProvider.send("eth_requestAccounts", []);
        
        if (!accounts || accounts.length === 0) {
          throw new Error("No accounts found. Please unlock your wallet and try again.");
        }

        const address = accounts[0];
        
        if (!isValidEthereumAddress(address)) {
          throw new Error("Invalid wallet address received");
        }

        const network = await browserProvider.getNetwork();
        const chainId = Number(network.chainId);

        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
        }

        if (!mountedRef.current) {
          resolve(false);
          return;
        }

        setProvider(browserProvider);
        const now = Date.now();
        
        setState({
          isConnected: true,
          isConnecting: false,
          isReconnecting: false,
          address,
          balance: null,
          chainId,
          walletType,
          error: null,
          lastConnectedAt: now,
          connectionAttempts: 0,
        });

        await updateBalance(browserProvider, address);
        startHealthMonitoring(browserProvider, address);

        localStorage.setItem("tburn_wallet_type", walletType);
        localStorage.setItem("tburn_wallet_address", address);
        localStorage.setItem("tburn_wallet_timestamp", now.toString());

        secureLog("Connection successful", { walletType, chainId });
        
        // Fetch member info after successful connection
        fetchMemberInfo(address).catch(() => {
          secureLog("Member info fetch failed silently");
        });
        
        resolve(true);
      } catch (error) {
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
        }
        reject(error);
      }
    });

    try {
      return await connectionPromise;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to connect wallet";
      
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          isConnecting: false,
          isReconnecting: false,
          error: errorMessage,
        }));
      }
      
      secureLog("Connection failed", { error: errorMessage });
      return false;
    }
  }, [getProvider, updateBalance, startHealthMonitoring, state.connectionAttempts]);

  const attemptReconnection = useCallback(async () => {
    const savedWalletType = localStorage.getItem("tburn_wallet_type") as WalletType;
    const savedAddress = localStorage.getItem("tburn_wallet_address");
    
    if (!savedWalletType || !savedAddress || !isSessionValid()) {
      localStorage.removeItem("tburn_wallet_type");
      localStorage.removeItem("tburn_wallet_address");
      localStorage.removeItem("tburn_wallet_timestamp");
      return;
    }

    if (state.connectionAttempts >= MAX_RECONNECTION_ATTEMPTS) {
      secureLog("Max reconnection attempts reached");
      setState(prev => ({ ...prev, isReconnecting: false }));
      return;
    }

    setState(prev => ({ ...prev, isReconnecting: true }));
    
    const success = await connect(savedWalletType);
    
    if (!success && mountedRef.current && state.connectionAttempts < MAX_RECONNECTION_ATTEMPTS) {
      reconnectTimeoutRef.current = setTimeout(() => {
        attemptReconnection();
      }, RECONNECTION_DELAY * (state.connectionAttempts + 1));
    }
  }, [connect, isSessionValid, state.connectionAttempts]);

  const disconnect = useCallback(() => {
    secureLog("Disconnecting wallet");
    
    clearAllTimeouts();
    setProvider(null);
    setPendingTransactions([]);
    setState(initialState);
    setConnectionHealth({
      isHealthy: true,
      latency: null,
      lastCheck: null,
      consecutiveFailures: 0,
    });
    
    localStorage.removeItem("tburn_wallet_type");
    localStorage.removeItem("tburn_wallet_address");
    localStorage.removeItem("tburn_wallet_timestamp");
  }, [clearAllTimeouts]);

  const switchNetwork = useCallback(async (targetChainId: number): Promise<boolean> => {
    if (!window.ethereum?.request) return false;

    secureLog("Switching network", { targetChainId });

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
      return true;
    } catch (error: unknown) {
      if (error && typeof error === "object" && "code" in error && (error as { code: number }).code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [TBURN_CHAIN_CONFIG],
          });
          return true;
        } catch (addError) {
          secureLog("Failed to add network", { error: String(addError) });
          setState(prev => ({ 
            ...prev, 
            error: "Failed to add TBURN network. Please add it manually." 
          }));
          return false;
        }
      }
      secureLog("Failed to switch network", { error: String(error) });
      setState(prev => ({ 
        ...prev, 
        error: "Failed to switch network. Please try again." 
      }));
      return false;
    }
  }, []);

  const signMessage = useCallback(async (message: string): Promise<string | null> => {
    if (!provider || !state.address) {
      setState(prev => ({ ...prev, error: "Wallet not connected" }));
      return null;
    }

    secureLog("Signing message", { messageLength: message.length });

    try {
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);
      secureLog("Message signed successfully");
      return signature;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to sign message";
      secureLog("Message signing failed", { error: errorMessage });
      setState(prev => ({ ...prev, error: errorMessage }));
      return null;
    }
  }, [provider, state.address]);

  const signTypedData = useCallback(async (
    domain: object, 
    types: Record<string, Array<{ name: string; type: string }>>, 
    value: Record<string, unknown>
  ): Promise<string | null> => {
    if (!provider || !state.address) {
      setState(prev => ({ ...prev, error: "Wallet not connected" }));
      return null;
    }

    secureLog("Signing typed data");

    try {
      const signer = await provider.getSigner();
      const signature = await signer.signTypedData(domain, types, value);
      secureLog("Typed data signed successfully");
      return signature;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to sign typed data";
      secureLog("Typed data signing failed", { error: errorMessage });
      setState(prev => ({ ...prev, error: errorMessage }));
      return null;
    }
  }, [provider, state.address]);

  const sendTransaction = useCallback(async (config: TransactionConfig): Promise<TransactionResponse | null> => {
    if (!provider || !state.address) {
      setState(prev => ({ ...prev, error: "Wallet not connected" }));
      return null;
    }

    if (!isValidEthereumAddress(config.to)) {
      setState(prev => ({ ...prev, error: "Invalid recipient address" }));
      return null;
    }

    secureLog("Sending transaction", { to: config.to, value: config.value });

    try {
      const signer = await provider.getSigner();
      
      const tx: TransactionRequest = {
        to: config.to,
        value: config.value ? BigInt(config.value) : undefined,
        data: config.data,
        gasLimit: config.gasLimit,
        maxFeePerGas: config.maxFeePerGas,
        maxPriorityFeePerGas: config.maxPriorityFeePerGas,
      };

      const response = await signer.sendTransaction(tx);
      
      const pendingTx: PendingTransaction = {
        hash: response.hash,
        from: state.address,
        to: config.to,
        value: config.value || "0",
        status: "pending",
        timestamp: Date.now(),
        confirmations: 0,
      };
      
      setPendingTransactions(prev => [...prev, pendingTx]);

      response.wait().then(receipt => {
        if (mountedRef.current && receipt) {
          setPendingTransactions(prev => 
            prev.map(t => 
              t.hash === response.hash 
                ? { ...t, status: receipt.status === 1 ? "confirmed" : "failed", confirmations: 1 }
                : t
            )
          );
          refreshBalance();
        }
      }).catch(() => {
        if (mountedRef.current) {
          setPendingTransactions(prev => 
            prev.map(t => 
              t.hash === response.hash 
                ? { ...t, status: "failed" }
                : t
            )
          );
        }
      });

      secureLog("Transaction sent", { hash: response.hash });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send transaction";
      secureLog("Transaction failed", { error: errorMessage });
      setState(prev => ({ ...prev, error: errorMessage }));
      return null;
    }
  }, [provider, state.address, refreshBalance]);

  const getConnectionHealth = useCallback((): ConnectionHealth => {
    return connectionHealth;
  }, [connectionHealth]);

  useEffect(() => {
    mountedRef.current = true;
    
    const savedWalletType = localStorage.getItem("tburn_wallet_type") as WalletType;
    if (savedWalletType && isWalletAvailable(savedWalletType) && isSessionValid()) {
      attemptReconnection();
    }

    return () => {
      mountedRef.current = false;
      clearAllTimeouts();
    };
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const accountList = accounts as string[];
      secureLog("Accounts changed", { count: accountList.length });
      
      if (accountList.length === 0) {
        disconnect();
      } else if (state.isConnected && accountList[0] !== state.address) {
        const newAddress = accountList[0];
        if (isValidEthereumAddress(newAddress)) {
          setState(prev => ({ ...prev, address: newAddress }));
          localStorage.setItem("tburn_wallet_address", newAddress);
          if (provider) {
            updateBalance(provider, newAddress);
          }
        }
      }
    };

    const handleChainChanged = (chainId: unknown) => {
      const newChainId = typeof chainId === "string" ? parseInt(chainId, 16) : chainId as number;
      secureLog("Chain changed", { chainId: newChainId });
      setState(prev => ({ ...prev, chainId: newChainId }));
    };

    const handleDisconnect = () => {
      secureLog("Wallet disconnected event received");
      disconnect();
    };

    const handleConnect = () => {
      secureLog("Wallet connected event received");
      if (!state.isConnected && state.walletType) {
        attemptReconnection();
      }
    };

    window.ethereum.on?.("accountsChanged", handleAccountsChanged);
    window.ethereum.on?.("chainChanged", handleChainChanged);
    window.ethereum.on?.("disconnect", handleDisconnect);
    window.ethereum.on?.("connect", handleConnect);

    return () => {
      window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener?.("chainChanged", handleChainChanged);
      window.ethereum?.removeListener?.("disconnect", handleDisconnect);
      window.ethereum?.removeListener?.("connect", handleConnect);
    };
  }, [state.isConnected, state.address, state.walletType, provider, disconnect, updateBalance, attemptReconnection]);

  const isCorrectNetwork = state.chainId === TBURN_CHAIN_ID;

  const value: Web3ContextType = {
    ...state,
    connect,
    disconnect,
    switchNetwork,
    signMessage,
    signTypedData,
    sendTransaction,
    isWalletAvailable,
    formatAddress: formatAddressDisplay,
    refreshBalance,
    validateAddress,
    isCorrectNetwork,
    provider,
    pendingTransactions,
    clearError,
    getConnectionHealth,
    fetchMemberInfo,
    registerAsMember,
    refreshMemberInfo,
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
