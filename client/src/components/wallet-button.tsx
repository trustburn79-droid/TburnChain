import { useState } from "react";
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
  Coins,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function WalletButton() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const {
    isConnected,
    address,
    balance,
    chainId,
    walletType,
    disconnect,
    switchNetwork,
    formatAddress,
  } = useWeb3();
  const [modalOpen, setModalOpen] = useState(false);

  const isCorrectNetwork = chainId === TBURN_CHAIN_ID;

  const handleCopyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    toast({
      title: t("wallet.addressCopied"),
      description: address,
    });
  };

  const handleSwitchNetwork = async () => {
    const success = await switchNetwork(TBURN_CHAIN_ID);
    if (success) {
      toast({
        title: t("wallet.networkSwitched"),
        description: t("wallet.connectedToTburn"),
      });
    } else {
      toast({
        title: t("wallet.networkSwitchFailed"),
        description: t("wallet.addNetworkManually"),
        variant: "destructive",
      });
    }
  };

  const getWalletIcon = () => {
    switch (walletType) {
      case "metamask":
        return <span className="text-orange-500 font-bold">M</span>;
      case "rabby":
        return <span className="text-purple-500 font-bold">R</span>;
      case "trust":
        return <span className="text-blue-500 font-bold">T</span>;
      case "coinbase":
        return <span className="text-blue-600 font-bold">C</span>;
      case "ledger":
        return <span className="text-black dark:text-white font-bold">L</span>;
      default:
        return <Wallet className="h-4 w-4" />;
    }
  };

  if (!isConnected) {
    return (
      <>
        <Button
          onClick={() => setModalOpen(true)}
          className="gap-2"
          data-testid="button-connect-wallet"
        >
          <Wallet className="h-4 w-4" />
          {t("wallet.connectWallet")}
        </Button>
        <WalletConnectModal open={modalOpen} onOpenChange={setModalOpen} />
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2" data-testid="button-wallet-menu">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                {getWalletIcon()}
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
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56" data-testid="menu-wallet-options">
          <div className="px-2 py-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {t("wallet.connectedWith")}
              </span>
              <Badge variant="outline" className="text-xs capitalize">
                {walletType}
              </Badge>
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
  const { isConnected, chainId } = useWeb3();
  const isCorrectNetwork = chainId === TBURN_CHAIN_ID;

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

  return (
    <Badge variant="outline" className="text-green-600 border-green-600" data-testid="badge-wallet-connected">
      <CheckCircle className="h-3 w-3 mr-1" />
      {t("wallet.connected")}
    </Badge>
  );
}
