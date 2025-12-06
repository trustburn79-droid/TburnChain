import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useWeb3, TBURN_CHAIN_ID } from "@/lib/web3-context";
import { WalletConnectModal } from "./wallet-connect-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Wallet,
  LogOut,
  Copy,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  RefreshCw,
  Loader2,
  Activity,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function WalletButton() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const {
    isConnected,
    isConnecting,
    isReconnecting,
    address,
    balance,
    chainId,
    walletType,
    error,
    disconnect,
    switchNetwork,
    formatAddress,
    refreshBalance,
    isCorrectNetwork,
    pendingTransactions,
    clearError,
    getConnectionHealth,
  } = useWeb3();
  const [modalOpen, setModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const pendingCount = pendingTransactions.filter(tx => tx.status === "pending").length;
  const connectionHealth = getConnectionHealth();

  useEffect(() => {
    if (error) {
      toast({
        title: t("wallet.error"),
        description: error,
        variant: "destructive",
      });
      clearError();
    }
  }, [error, toast, t, clearError]);

  const handleCopyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      toast({
        title: t("wallet.addressCopied"),
        description: formatAddress(address),
      });
    } catch {
      toast({
        title: t("wallet.copyFailed"),
        variant: "destructive",
      });
    }
  };

  const handleSwitchNetwork = async () => {
    const success = await switchNetwork(TBURN_CHAIN_ID);
    if (success) {
      toast({
        title: t("wallet.networkSwitched"),
        description: t("wallet.connectedToTburn"),
      });
    }
  };

  const handleRefreshBalance = async () => {
    setIsRefreshing(true);
    await refreshBalance();
    setIsRefreshing(false);
    toast({
      title: t("wallet.balanceRefreshed"),
    });
  };

  const getWalletIcon = () => {
    switch (walletType) {
      case "metamask":
        return <span className="text-orange-500 font-bold text-xs">M</span>;
      case "rabby":
        return <span className="text-purple-500 font-bold text-xs">R</span>;
      case "trust":
        return <span className="text-blue-500 font-bold text-xs">T</span>;
      case "coinbase":
        return <span className="text-blue-600 font-bold text-xs">C</span>;
      case "ledger":
        return <span className="text-black dark:text-white font-bold text-xs">L</span>;
      default:
        return <Wallet className="h-3 w-3" />;
    }
  };

  const getConnectionStatusIcon = () => {
    if (!connectionHealth.isHealthy) {
      return <WifiOff className="h-3 w-3 text-red-500" />;
    }
    if (connectionHealth.latency && connectionHealth.latency > 1000) {
      return <Wifi className="h-3 w-3 text-yellow-500" />;
    }
    return <Wifi className="h-3 w-3 text-green-500" />;
  };

  if (!isConnected) {
    return (
      <>
        <Button
          onClick={() => setModalOpen(true)}
          className="gap-2"
          disabled={isConnecting || isReconnecting}
          data-testid="button-connect-wallet"
        >
          {isConnecting || isReconnecting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {isReconnecting ? t("wallet.reconnecting") : t("wallet.connecting")}
            </>
          ) : (
            <>
              <Wallet className="h-4 w-4" />
              {t("wallet.connectWallet")}
            </>
          )}
        </Button>
        <WalletConnectModal open={modalOpen} onOpenChange={setModalOpen} />
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 relative" data-testid="button-wallet-menu">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center relative">
                {getWalletIcon()}
                <div className="absolute -bottom-0.5 -right-0.5">
                  {getConnectionStatusIcon()}
                </div>
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-xs font-medium">
                  {address ? formatAddress(address) : ""}
                </span>
                {balance && (
                  <span className="text-[10px] text-muted-foreground">
                    {parseFloat(balance).toFixed(4)} TBURN
                  </span>
                )}
              </div>
              {!isCorrectNetwork && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    {t("wallet.wrongNetwork")}
                  </TooltipContent>
                </Tooltip>
              )}
              {pendingCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {pendingCount}
                </Badge>
              )}
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64" data-testid="menu-wallet-options">
          <div className="px-3 py-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">
                {t("wallet.connectedWith")}
              </span>
              <Badge variant="outline" className="text-xs capitalize">
                {walletType}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{t("wallet.status")}</span>
              <div className="flex items-center gap-1">
                {connectionHealth.isHealthy ? (
                  <>
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-green-600">{t("wallet.healthy")}</span>
                    {connectionHealth.latency && (
                      <span className="text-muted-foreground">({connectionHealth.latency}ms)</span>
                    )}
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 text-red-500" />
                    <span className="text-red-600">{t("wallet.unstable")}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <DropdownMenuSeparator />
          
          {!isCorrectNetwork && (
            <>
              <DropdownMenuItem
                onClick={handleSwitchNetwork}
                className="text-yellow-600 dark:text-yellow-400"
                data-testid="button-switch-network"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                {t("wallet.switchToTburn")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {pendingCount > 0 && (
            <>
              <div className="px-3 py-2">
                <div className="flex items-center gap-2 text-xs">
                  <Activity className="h-3 w-3 text-blue-500 animate-pulse" />
                  <span>{t("wallet.pendingTransactions", { count: pendingCount })}</span>
                </div>
              </div>
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuItem 
            onClick={handleRefreshBalance} 
            disabled={isRefreshing}
            data-testid="button-refresh-balance"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {t("wallet.refreshBalance")}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleCopyAddress} data-testid="button-copy-address">
            <Copy className="h-4 w-4 mr-2" />
            {t("wallet.copyAddress")}
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild data-testid="button-view-explorer">
            <a
              href={`/app/wallets/${address}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {t("wallet.viewInExplorer")}
            </a>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={disconnect}
            className="text-destructive"
            data-testid="button-disconnect-wallet"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {t("wallet.disconnect")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <WalletConnectModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}

export function WalletStatusBadge() {
  const { t } = useTranslation();
  const { isConnected, isCorrectNetwork, isReconnecting, getConnectionHealth } = useWeb3();
  const connectionHealth = getConnectionHealth();

  if (isReconnecting) {
    return (
      <Badge variant="outline" className="text-blue-600 border-blue-600" data-testid="badge-wallet-reconnecting">
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        {t("wallet.reconnecting")}
      </Badge>
    );
  }

  if (!isConnected) {
    return (
      <Badge variant="outline" className="text-muted-foreground" data-testid="badge-wallet-disconnected">
        <Wallet className="h-3 w-3 mr-1" />
        {t("wallet.notConnected")}
      </Badge>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <Badge variant="outline" className="text-yellow-600 border-yellow-600" data-testid="badge-wallet-wrong-network">
        <AlertTriangle className="h-3 w-3 mr-1" />
        {t("wallet.wrongNetwork")}
      </Badge>
    );
  }

  if (!connectionHealth.isHealthy) {
    return (
      <Badge variant="outline" className="text-orange-600 border-orange-600" data-testid="badge-wallet-unstable">
        <WifiOff className="h-3 w-3 mr-1" />
        {t("wallet.unstable")}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-green-600 border-green-600" data-testid="badge-wallet-connected">
      <CheckCircle className="h-3 w-3 mr-1" />
      {t("wallet.connected")}
    </Badge>
  );
}
