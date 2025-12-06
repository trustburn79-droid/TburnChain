import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useWeb3, TBURN_CHAIN_ID } from "@/lib/web3-context";
import { WalletConnectModal } from "./wallet-connect-modal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  AlertTriangle, 
  Shield, 
  Lock, 
  ArrowRight, 
  Loader2,
  CheckCircle,
  Fingerprint,
  Key
} from "lucide-react";

interface RequireWalletProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  requireCorrectNetwork?: boolean;
}

export function RequireWallet({
  children,
  title,
  description,
  requireCorrectNetwork = true,
}: RequireWalletProps) {
  const { t } = useTranslation();
  const { isConnected, isConnecting, isReconnecting, chainId, switchNetwork, isCorrectNetwork } = useWeb3();
  const [modalOpen, setModalOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const handleSwitchNetwork = async () => {
    setIsSwitching(true);
    await switchNetwork(TBURN_CHAIN_ID);
    setIsSwitching(false);
  };

  if (!isConnected) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[400px] p-4" data-testid="container-require-wallet">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                {isConnecting || isReconnecting ? (
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                ) : (
                  <Wallet className="h-8 w-8 text-primary" />
                )}
              </div>
              <CardTitle data-testid="title-require-wallet">
                {isReconnecting 
                  ? t("wallet.reconnecting") 
                  : title || t("wallet.connectRequired")}
              </CardTitle>
              <CardDescription data-testid="desc-require-wallet">
                {isReconnecting 
                  ? t("wallet.reconnectingDesc")
                  : description || t("wallet.connectRequiredDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isConnecting && !isReconnecting && (
                <Button
                  size="lg"
                  className="w-full gap-2"
                  onClick={() => setModalOpen(true)}
                  data-testid="button-connect-prompt"
                >
                  <Wallet className="h-5 w-5" />
                  {t("wallet.connectWallet")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}

              {(isConnecting || isReconnecting) && (
                <Button size="lg" className="w-full gap-2" disabled>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {isReconnecting ? t("wallet.reconnecting") : t("wallet.connecting")}
                </Button>
              )}

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-lg bg-muted/50">
                  <Shield className="h-5 w-5 mx-auto mb-1 text-green-500" />
                  <p className="text-xs text-muted-foreground">{t("wallet.secure")}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <Lock className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                  <p className="text-xs text-muted-foreground">{t("wallet.nonCustodial")}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <Key className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                  <p className="text-xs text-muted-foreground">{t("wallet.yourKeys")}</p>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">
                  {t("wallet.supportedWallets")}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="outline" className="text-xs">MetaMask</Badge>
                  <Badge variant="outline" className="text-xs">Rabby</Badge>
                  <Badge variant="outline" className="text-xs">Trust</Badge>
                  <Badge variant="outline" className="text-xs">Coinbase</Badge>
                  <Badge variant="outline" className="text-xs">Ledger</Badge>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2 text-left">
                  <Fingerprint className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                      {t("wallet.securityTip")}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                      {t("wallet.securityTipDesc")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <WalletConnectModal open={modalOpen} onOpenChange={setModalOpen} />
      </>
    );
  }

  if (requireCorrectNetwork && !isCorrectNetwork) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4" data-testid="container-wrong-network">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle data-testid="title-wrong-network">
              {t("wallet.wrongNetworkTitle")}
            </CardTitle>
            <CardDescription data-testid="desc-wrong-network">
              {t("wallet.wrongNetworkDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive" className="text-left">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{t("wallet.currentNetwork")}</AlertTitle>
              <AlertDescription>
                Chain ID: {chainId} ({t("wallet.notTburnMainnet")})
              </AlertDescription>
            </Alert>

            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium text-green-700 dark:text-green-300">
                  {t("wallet.requiredNetwork")}
                </span>
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                TBURN Mainnet (Chain ID: {TBURN_CHAIN_ID})
              </p>
            </div>

            <Button
              size="lg"
              className="w-full gap-2"
              onClick={handleSwitchNetwork}
              disabled={isSwitching}
              data-testid="button-switch-network-prompt"
            >
              {isSwitching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("wallet.switchingNetwork")}
                </>
              ) : (
                <>
                  {t("wallet.switchToTburn")}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground">
              {t("wallet.networkSwitchHelp")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

export function WalletRequiredBanner() {
  const { t } = useTranslation();
  const { isConnected, isConnecting, isReconnecting, isCorrectNetwork } = useWeb3();
  const [modalOpen, setModalOpen] = useState(false);

  if (isConnected && isCorrectNetwork) return null;

  if (isReconnecting) {
    return (
      <Alert className="mb-4 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20" data-testid="banner-wallet-reconnecting">
        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        <AlertTitle className="text-blue-700 dark:text-blue-300">{t("wallet.reconnecting")}</AlertTitle>
        <AlertDescription className="text-blue-600 dark:text-blue-400">
          {t("wallet.reconnectingDesc")}
        </AlertDescription>
      </Alert>
    );
  }

  if (isConnected && !isCorrectNetwork) {
    return (
      <Alert className="mb-4 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20" data-testid="banner-wrong-network">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-700 dark:text-yellow-300">{t("wallet.wrongNetworkTitle")}</AlertTitle>
        <AlertDescription className="flex items-center justify-between text-yellow-600 dark:text-yellow-400">
          <span>{t("wallet.wrongNetworkBanner")}</span>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <Alert className="mb-4 border-primary/20 bg-primary/5" data-testid="banner-wallet-required">
        <Wallet className="h-4 w-4 text-primary" />
        <AlertTitle>{t("wallet.walletRequired")}</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>{t("wallet.walletRequiredBanner")}</span>
          <Button 
            size="sm" 
            onClick={() => setModalOpen(true)} 
            disabled={isConnecting}
            data-testid="button-connect-banner"
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                {t("wallet.connecting")}
              </>
            ) : (
              t("wallet.connectWallet")
            )}
          </Button>
        </AlertDescription>
      </Alert>
      <WalletConnectModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
