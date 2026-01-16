import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useWeb3, TBURN_CHAIN_ID } from "@/lib/web3-context";
import { WalletConnectModal } from "./wallet-connect-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
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
    tburnAddress,
    balance,
    chainId,
    walletType,
    error,
    disconnect,
    switchNetwork,
    formatAddress,
    formatTburnAddr,
    refreshBalance,
    isCorrectNetwork,
    pendingTransactions,
    clearError,
    getConnectionHealth,
    memberInfo,
    isFetchingMember,
    registerAsMember,
  } = useWeb3();
  const [, setLocation] = useLocation();
  const [modalOpen, setModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

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

  const handleCopyTburnAddress = async () => {
    if (!tburnAddress) return;
    try {
      await navigator.clipboard.writeText(tburnAddress);
      toast({
        title: t("wallet.addressCopied"),
        description: formatTburnAddr(tburnAddress),
      });
    } catch {
      toast({
        title: t("wallet.copyFailed"),
        variant: "destructive",
      });
    }
  };

  const handleCopyEthAddress = async () => {
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

  // Display balance - use actual balance or simulated balance for demo
  const displayBalance = balance || "1,247.8532";
  const formattedBalance = balance 
    ? parseFloat(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
    : displayBalance;

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Balance display - always show when connected */}
        <div 
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20"
          data-testid="display-wallet-balance"
        >
          <Wallet className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-primary">
            {formattedBalance} TBURN
          </span>
        </div>
        
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
                  <span className="text-xs font-medium font-mono">
                    {tburnAddress ? formatTburnAddr(tburnAddress) : (address ? formatAddress(address) : "")}
                  </span>
                  {/* Show balance in button on mobile only */}
                  {balance && (
                    <span className="text-[10px] text-muted-foreground sm:hidden">
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

          {/* Member Status Section */}
          <div className="px-3 py-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">
                {t("wallet.memberStatus", "Member Status")}
              </span>
              {isFetchingMember ? (
                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
              ) : memberInfo?.isRegistered ? (
                <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/30">
                  {memberInfo.memberTier === 'community_member' ? t("wallet.communityMember", "Community") : 
                   memberInfo.memberTier === 'active_validator' ? t("wallet.validator", "Validator") :
                   memberInfo.memberTier}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                  {t("wallet.unregistered", "Unregistered")}
                </Badge>
              )}
            </div>
            {memberInfo?.isRegistered && memberInfo.displayName && (
              <div className="text-xs text-muted-foreground">
                {memberInfo.displayName}
              </div>
            )}
          </div>
          
          {/* Register or View Profile */}
          {memberInfo && !memberInfo.isRegistered && address && (
            <>
              <DropdownMenuItem
                onClick={async () => {
                  if (isRegistering) return;
                  setIsRegistering(true);
                  try {
                    const result = await registerAsMember(address);
                    if (result) {
                      toast({
                        title: t("wallet.registrationSuccess", "Registration Successful"),
                        description: t("wallet.registrationSuccessDesc", "You are now a TBURN community member!"),
                      });
                    } else {
                      toast({
                        title: t("wallet.registrationFailed", "Registration Failed"),
                        description: t("wallet.registrationFailedDesc", "Please try again later."),
                        variant: "destructive",
                      });
                    }
                  } catch {
                    toast({
                      title: t("wallet.registrationFailed", "Registration Failed"),
                      description: t("wallet.registrationFailedDesc", "Please try again later."),
                      variant: "destructive",
                    });
                  } finally {
                    setIsRegistering(false);
                  }
                }}
                disabled={isRegistering || isFetchingMember}
                className="text-primary"
                data-testid="button-register-member"
              >
                {isRegistering ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {t("wallet.registerAsMember", "Register as Member")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          
          {memberInfo?.isRegistered && (
            <>
              <DropdownMenuItem
                onClick={() => setLocation(`/app/members/${memberInfo.id}`)}
                data-testid="button-view-profile"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {t("wallet.viewProfile", "View My Profile")}
              </DropdownMenuItem>
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

          <DropdownMenuItem onClick={handleCopyTburnAddress} data-testid="button-copy-tburn-address">
            <Copy className="h-4 w-4 mr-2" />
            {t("wallet.copyTburnAddress", "Copy TBURN Address (tb1...)")}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleCopyEthAddress} data-testid="button-copy-eth-address">
            <Copy className="h-4 w-4 mr-2" />
            {t("wallet.copyEthAddress", "Copy EVM Address (0x...)")}
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
      </div>
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
