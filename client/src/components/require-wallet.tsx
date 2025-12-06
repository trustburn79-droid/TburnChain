import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useWeb3, TBURN_CHAIN_ID } from "@/lib/web3-context";
import { WalletConnectModal } from "./wallet-connect-modal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Wallet, AlertTriangle, Shield, Lock, ArrowRight } from "lucide-react";

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
  const { isConnected, chainId, switchNetwork } = useWeb3();
  const [modalOpen, setModalOpen] = useState(false);

  const isCorrectNetwork = chainId === TBURN_CHAIN_ID;

  if (!isConnected) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[400px] p-4" data-testid="container-require-wallet">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Wallet className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle data-testid="title-require-wallet">
                {title || t("wallet.connectRequired")}
              </CardTitle>
              <CardDescription data-testid="desc-require-wallet">
                {description || t("wallet.connectRequiredDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-muted/50">
                  <Shield className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{t("wallet.secure")}</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <Lock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{t("wallet.nonCustodial")}</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <Wallet className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{t("wallet.yourKeys")}</p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                {t("wallet.supportedWallets")}
              </p>
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

            <Button
              size="lg"
              className="w-full gap-2"
              onClick={() => switchNetwork(TBURN_CHAIN_ID)}
              data-testid="button-switch-network-prompt"
            >
              {t("wallet.switchToTburn")}
              <ArrowRight className="h-4 w-4" />
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
  const { isConnected } = useWeb3();
  const [modalOpen, setModalOpen] = useState(false);

  if (isConnected) return null;

  return (
    <>
      <Alert className="mb-4" data-testid="banner-wallet-required">
        <Wallet className="h-4 w-4" />
        <AlertTitle>{t("wallet.walletRequired")}</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>{t("wallet.walletRequiredBanner")}</span>
          <Button size="sm" onClick={() => setModalOpen(true)} data-testid="button-connect-banner">
            {t("wallet.connectWallet")}
          </Button>
        </AlertDescription>
      </Alert>
      <WalletConnectModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
