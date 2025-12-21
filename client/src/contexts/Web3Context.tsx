import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { web3Provider, type Web3State, type GasEstimate, type TransactionResult, type TransactionRequest, TBURN_MAINNET_CONFIG } from "@/lib/web3-provider";

interface Web3ContextType extends Web3State {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
  estimateGas: (tx: TransactionRequest) => Promise<GasEstimate>;
  sendTransaction: (tx: TransactionRequest) => Promise<TransactionResult>;
  deployContract: (bytecode: string, constructorArgs?: string) => Promise<TransactionResult>;
  isMetaMaskInstalled: boolean;
  networkConfig: typeof TBURN_MAINNET_CONFIG;
}

const Web3Context = createContext<Web3ContextType | null>(null);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Web3State>(web3Provider.getState());
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);

  useEffect(() => {
    setIsMetaMaskInstalled(web3Provider.isMetaMaskInstalled());
    
    const unsubscribe = web3Provider.subscribe((newState) => {
      setState(newState);
    });

    return () => unsubscribe();
  }, []);

  const connect = useCallback(async () => {
    await web3Provider.connect();
  }, []);

  const disconnect = useCallback(() => {
    web3Provider.disconnect();
  }, []);

  const switchNetwork = useCallback(async () => {
    await web3Provider.switchToTBurnNetwork();
  }, []);

  const estimateGas = useCallback(async (tx: TransactionRequest) => {
    return web3Provider.estimateGas(tx);
  }, []);

  const sendTransaction = useCallback(async (tx: TransactionRequest) => {
    return web3Provider.sendTransaction(tx);
  }, []);

  const deployContract = useCallback(async (bytecode: string, constructorArgs?: string) => {
    return web3Provider.deployContract(bytecode, constructorArgs || "");
  }, []);

  const value: Web3ContextType = {
    ...state,
    connect,
    disconnect,
    switchNetwork,
    estimateGas,
    sendTransaction,
    deployContract,
    isMetaMaskInstalled,
    networkConfig: TBURN_MAINNET_CONFIG,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3(): Web3ContextType {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}

export function useWallet() {
  const web3 = useWeb3();
  
  return {
    address: web3.address,
    balance: web3.balance,
    isConnected: web3.isConnected,
    isConnecting: web3.isConnecting,
    isCorrectNetwork: web3.isCorrectNetwork,
    chainId: web3.chainId,
    error: web3.error,
    connect: web3.connect,
    disconnect: web3.disconnect,
    switchNetwork: web3.switchNetwork,
    isMetaMaskInstalled: web3.isMetaMaskInstalled,
  };
}
