import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWeb3, type WalletType, isMobileDevice, hasMobileApp, openWalletApp } from "@/lib/web3-context";
import { Wallet, AlertCircle, CheckCircle2, Loader2, ExternalLink, Smartphone, Monitor, X } from "lucide-react";

interface WalletOption {
  id: WalletType;
  name: string;
  icon: string;
  description: string;
  popular?: boolean;
  browserOnly?: boolean;
}

const WALLET_OPTIONS: WalletOption[] = [
  {
    id: "metamask",
    name: "MetaMask",
    icon: "🦊",
    description: "The most popular Web3 wallet",
    popular: true,
  },
  {
    id: "rabby",
    name: "Rabby",
    icon: "🐰",
    description: "A better browser extension wallet",
    browserOnly: true,
  },
  {
    id: "trust",
    name: "Trust Wallet",
    icon: "🛡️",
    description: "Secure multi-chain wallet",
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    icon: "🔵",
    description: "By Coinbase Exchange",
  },
  {
    id: "ledger",
    name: "Ledger",
    icon: "📟",
    description: "Hardware wallet security",
  },
];

interface WalletConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type ConnectionStep = "select" | "connecting" | "network" | "success" | "error";

export function WalletConnectionModal({ open, onOpenChange, onSuccess }: WalletConnectionModalProps) {
  const { 
    connect, 
    disconnect,
    switchNetwork, 
    isConnected, 
    isConnecting, 
    address, 
    error, 
    isCorrectNetwork,
    isWalletAvailable,
    formatAddress,
    clearError,
  } = useWeb3();

  const [step, setStep] = useState<ConnectionStep>("select");
  const [selectedWallet, setSelectedWallet] = useState<WalletType>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const isMobile = isMobileDevice();

  useEffect(() => {
    if (open) {
      setStep("select");
      setSelectedWallet(null);
      setConnectionError(null);
      clearError();
    }
  }, [open, clearError]);

  useEffect(() => {
    if (isConnected && step === "connecting") {
      if (!isCorrectNetwork) {
        setStep("network");
      } else {
        setStep("success");
        setTimeout(() => {
          onOpenChange(false);
          onSuccess?.();
        }, 1500);
      }
    }
  }, [isConnected, isCorrectNetwork, step, onOpenChange, onSuccess]);

  useEffect(() => {
    if (error && step === "connecting") {
      setConnectionError(error);
      setStep("error");
    }
  }, [error, step]);

  const handleWalletSelect = async (walletType: WalletType) => {
    if (!walletType) return;
    
    setSelectedWallet(walletType);
    setConnectionError(null);
    clearError();

    if (isMobile && hasMobileApp(walletType) && !isWalletAvailable(walletType)) {
      openWalletApp(walletType);
      return;
    }

    if (!isWalletAvailable(walletType)) {
      setConnectionError(`${WALLET_OPTIONS.find(w => w.id === walletType)?.name} is not installed. Please install the extension and try again.`);
      setStep("error");
      return;
    }

    setStep("connecting");
    
    try {
      const success = await connect(walletType);
      if (!success) {
        setConnectionError("Failed to connect wallet. Please try again.");
        setStep("error");
      }
    } catch (err: any) {
      if (err.code === 4001) {
        setConnectionError("Connection rejected. Please approve the connection request in your wallet.");
      } else {
        setConnectionError(err.message || "Failed to connect wallet");
      }
      setStep("error");
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      const success = await switchNetwork(5800);
      if (success) {
        setStep("success");
        setTimeout(() => {
          onOpenChange(false);
          onSuccess?.();
        }, 1500);
      }
    } catch (err: any) {
      setConnectionError("Failed to switch network. Please add TBURN network manually.");
    }
  };

  const handleRetry = () => {
    setStep("select");
    setSelectedWallet(null);
    setConnectionError(null);
    clearError();
  };

  const handleDisconnect = () => {
    disconnect();
    setStep("select");
  };

  const renderContent = () => {
    switch (step) {
      case "select":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              {isMobile ? (
                <>
                  <Smartphone className="h-4 w-4" />
                  <span>Mobile detected - tap to open wallet app</span>
                </>
              ) : (
                <>
                  <Monitor className="h-4 w-4" />
                  <span>Select your preferred wallet</span>
                </>
              )}
            </div>
            
            <div className="grid gap-2">
              {WALLET_OPTIONS.map((wallet) => {
                const isAvailable = isWalletAvailable(wallet.id);
                const showMobileHint = isMobile && hasMobileApp(wallet.id) && !isAvailable;
                
                if (isMobile && wallet.browserOnly) return null;
                
                return (
                  <button
                    key={wallet.id}
                    onClick={() => handleWalletSelect(wallet.id)}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-all duration-200 group w-full text-left"
                    data-testid={`wallet-option-${wallet.id}`}
                  >
                    <span className="text-3xl">{wallet.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{wallet.name}</span>
                        {wallet.popular && (
                          <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                            Popular
                          </span>
                        )}
                        {isAvailable && (
                          <span className="px-2 py-0.5 text-xs bg-green-500/10 text-green-500 rounded-full">
                            Installed
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{wallet.description}</p>
                    </div>
                    {showMobileHint ? (
                      <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 group-hover:border-primary transition-colors" />
                    )}
                  </button>
                );
              })}
            </div>

            {isConnected && address && (
              <div className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-green-500">Connected</p>
                      <p className="text-xs text-muted-foreground">{formatAddress(address)}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDisconnect}
                    data-testid="button-disconnect"
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      case "connecting":
        return (
          <div className="py-12 text-center space-y-6">
            <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Connecting to {WALLET_OPTIONS.find(w => w.id === selectedWallet)?.name}</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Please approve the connection request in your wallet
              </p>
            </div>
            <Button variant="outline" onClick={handleRetry} data-testid="button-cancel-connect">
              Cancel
            </Button>
          </div>
        );

      case "network":
        return (
          <div className="py-8 text-center space-y-6">
            <div className="mx-auto w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Wrong Network</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Please switch to TBURN Mainnet (Chain ID: 5800)
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button onClick={handleSwitchNetwork} className="w-full" data-testid="button-switch-network">
                Switch to TBURN Mainnet
              </Button>
              <Button variant="outline" onClick={() => { onOpenChange(false); onSuccess?.(); }} data-testid="button-continue-anyway">
                Continue Anyway
              </Button>
            </div>
          </div>
        );

      case "success":
        return (
          <div className="py-12 text-center space-y-6">
            <div className="mx-auto w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-500">Connected Successfully</h3>
              <p className="text-sm text-muted-foreground mt-2">
                {address && formatAddress(address)}
              </p>
            </div>
          </div>
        );

      case "error":
        return (
          <div className="py-8 text-center space-y-6">
            <div className="mx-auto w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
              <X className="h-10 w-10 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-destructive">Connection Failed</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                {connectionError || "An unexpected error occurred"}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button onClick={handleRetry} className="w-full" data-testid="button-retry-connect">
                Try Again
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-close-error">
                Close
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="wallet-connection-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            Connect Wallet
          </DialogTitle>
          <DialogDescription>
            Connect your wallet to access TBURN ecosystem features
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}

export function useWalletModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { isConnected, address, disconnect, formatAddress, isCorrectNetwork } = useWeb3();

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return {
    isOpen,
    openModal,
    closeModal,
    setIsOpen,
    isConnected,
    address,
    disconnect,
    formatAddress,
    isCorrectNetwork,
  };
}
