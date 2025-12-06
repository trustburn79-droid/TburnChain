import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useWeb3, type WalletType } from "@/lib/web3-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ExternalLink, AlertCircle, CheckCircle, Wallet, Shield, Usb, Hexagon } from "lucide-react";

interface WalletOption {
  id: WalletType;
  name: string;
  icon: JSX.Element;
  description: string;
  installUrl: string;
  category: "browser" | "hardware";
}

const WALLET_OPTIONS: WalletOption[] = [
  {
    id: "metamask",
    name: "MetaMask",
    icon: (
      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
        <Hexagon className="h-5 w-5 text-white" />
      </div>
    ),
    description: "wallet.metamaskDesc",
    installUrl: "https://metamask.io/download/",
    category: "browser",
  },
  {
    id: "rabby",
    name: "Rabby Wallet",
    icon: (
      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <span className="text-white font-bold text-sm">R</span>
      </div>
    ),
    description: "wallet.rabbyDesc",
    installUrl: "https://rabby.io/",
    category: "browser",
  },
  {
    id: "trust",
    name: "Trust Wallet",
    icon: (
      <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
        <Shield className="h-5 w-5 text-white" />
      </div>
    ),
    description: "wallet.trustDesc",
    installUrl: "https://trustwallet.com/browser-extension",
    category: "browser",
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    icon: (
      <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
        <div className="h-4 w-4 rounded-full bg-white" />
      </div>
    ),
    description: "wallet.coinbaseDesc",
    installUrl: "https://www.coinbase.com/wallet/downloads",
    category: "browser",
  },
  {
    id: "ledger",
    name: "Ledger",
    icon: (
      <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center">
        <Usb className="h-5 w-5 text-white" />
      </div>
    ),
    description: "wallet.ledgerDesc",
    installUrl: "https://www.ledger.com/ledger-live",
    category: "hardware",
  },
];

interface WalletConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletConnectModal({ open, onOpenChange }: WalletConnectModalProps) {
  const { t } = useTranslation();
  const { connect, isConnecting, error, isWalletAvailable } = useWeb3();
  const [connectingWallet, setConnectingWallet] = useState<WalletType>(null);

  const handleConnect = async (walletType: WalletType) => {
    if (!walletType) return;
    
    setConnectingWallet(walletType);
    const success = await connect(walletType);
    setConnectingWallet(null);
    
    if (success) {
      onOpenChange(false);
    }
  };

  const browserWallets = WALLET_OPTIONS.filter((w) => w.category === "browser");
  const hardwareWallets = WALLET_OPTIONS.filter((w) => w.category === "hardware");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-wallet-connect">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" data-testid="title-wallet-connect">
            <Wallet className="h-5 w-5" />
            {t("wallet.connectWallet")}
          </DialogTitle>
          <DialogDescription data-testid="desc-wallet-connect">
            {t("wallet.connectDesc")}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" data-testid="alert-wallet-error">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              {t("wallet.browserWallets")}
            </h4>
            <div className="space-y-2">
              {browserWallets.map((wallet) => {
                const isAvailable = isWalletAvailable(wallet.id);
                const isLoading = isConnecting && connectingWallet === wallet.id;

                return (
                  <div
                    key={wallet.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover-elevate"
                    data-testid={`wallet-option-${wallet.id}`}
                  >
                    <div className="flex items-center gap-3">
                      {wallet.icon}
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {wallet.name}
                          {isAvailable && (
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                              {t("wallet.detected")}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {t(wallet.description)}
                        </p>
                      </div>
                    </div>
                    
                    {isAvailable ? (
                      <Button
                        size="sm"
                        onClick={() => handleConnect(wallet.id)}
                        disabled={isConnecting}
                        data-testid={`button-connect-${wallet.id}`}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            {t("wallet.connecting")}
                          </>
                        ) : (
                          t("wallet.connect")
                        )}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        data-testid={`button-install-${wallet.id}`}
                      >
                        <a href={wallet.installUrl} target="_blank" rel="noopener noreferrer">
                          {t("wallet.install")}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              {t("wallet.hardwareWallets")}
            </h4>
            <div className="space-y-2">
              {hardwareWallets.map((wallet) => {
                const isAvailable = isWalletAvailable(wallet.id);
                const isLoading = isConnecting && connectingWallet === wallet.id;

                return (
                  <div
                    key={wallet.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover-elevate"
                    data-testid={`wallet-option-${wallet.id}`}
                  >
                    <div className="flex items-center gap-3">
                      {wallet.icon}
                      <div>
                        <div className="font-medium">{wallet.name}</div>
                        <p className="text-xs text-muted-foreground">
                          {t(wallet.description)}
                        </p>
                      </div>
                    </div>
                    
                    {isAvailable ? (
                      <Button
                        size="sm"
                        onClick={() => handleConnect(wallet.id)}
                        disabled={isConnecting}
                        data-testid={`button-connect-${wallet.id}`}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            {t("wallet.connecting")}
                          </>
                        ) : (
                          t("wallet.connect")
                        )}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        data-testid={`button-install-${wallet.id}`}
                      >
                        <a href={wallet.installUrl} target="_blank" rel="noopener noreferrer">
                          {t("wallet.getStarted")}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground" data-testid="text-wallet-security">
          <Shield className="h-4 w-4 inline-block mr-1" />
          {t("wallet.securityNote")}
        </div>
      </DialogContent>
    </Dialog>
  );
}
