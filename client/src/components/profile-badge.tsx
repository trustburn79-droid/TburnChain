import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Wallet,
  User,
  LogOut,
  Copy,
  Check,
  Shield,
  Coins,
  ChevronRight,
  Plus,
  Home,
  LayoutGrid,
  ScanLine,
  TreeDeciduous,
  Image as ImageIcon,
  Bug,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useWeb3 } from "@/lib/web3-context";
import type { WalletType } from "@/lib/web3-context";

interface MemberInfo {
  id: string;
  displayName: string;
  email: string;
  accountAddress: string;
  memberTier: string;
  memberStatus: string;
  kycLevel: string;
  balance?: string;
  stakedBalance?: string;
  createdAt?: string;
}

interface ProfileBadgeProps {
  className?: string;
  onLogout?: () => void;
}

export function ProfileBadge({ className = "", onLogout }: ProfileBadgeProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isConnected, address, connect, isConnecting, balance: web3Balance, refreshBalance, walletType } = useWeb3();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      requestAnimationFrame(() => {
        setPosition({
          x: e.clientX - dragStartRef.current.x,
          y: e.clientY - dragStartRef.current.y,
        });
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleDragStart = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('[role="button"]')) {
      return;
    }
    e.preventDefault();
    if (dragRef.current) {
      dragStartRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
      setIsDragging(true);
    }
  };

  const { data: authCheck } = useQuery<{ authenticated: boolean; memberId?: string; memberEmail?: string; hasMemberId?: boolean }>({
    queryKey: ["/api/auth/check"],
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const { data: memberInfo, isLoading } = useQuery<MemberInfo>({
    queryKey: ["/api/auth/me"],
    enabled: authCheck?.authenticated === true,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  const { data: walletMemberInfo } = useQuery<MemberInfo>({
    queryKey: ["/api/members/by-address", address],
    enabled: !authCheck?.authenticated && isConnected && !!address,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  const { data: myWallets } = useQuery<{ address: string; walletName: string | null }[]>({
    queryKey: ["/api/wallet/my-wallets"],
    enabled: authCheck?.authenticated === true && authCheck?.hasMemberId === true,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const response = await fetch("/api/wallet/my-wallets", { credentials: 'include' });
      if (!response.ok) return [];
      return response.json();
    },
  });

  const isAuthenticated = authCheck?.authenticated || isConnected;
  const currentMember = memberInfo || walletMemberInfo;
  const currentEmail = memberInfo?.email || authCheck?.memberEmail;
  const walletAddress = currentMember?.accountAddress || (myWallets && myWallets.length > 0 ? myWallets[0].address : null) || address;

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/check"], { authenticated: false });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/check"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setIsOpen(false);
      if (onLogout) {
        onLogout();
      } else {
        window.location.href = "/login";
      }
    },
    onError: (error) => {
      console.error("Logout error:", error);
      toast({
        title: t("common.error", "오류"),
        description: t("profile.logoutError", "로그아웃 중 오류가 발생했습니다"),
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <Link href="/login">
        <Button
          variant="ghost"
          size="sm"
          className={`gap-2 text-gray-400 hover:text-white ${className}`}
          data-testid="button-login"
        >
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">{t("common.login", "로그인")}</span>
        </Button>
      </Link>
    );
  }

  const getInitial = (name?: string, email?: string) => {
    const source = name || email || "";
    if (!source) return "?";
    const englishMatch = source.match(/[a-zA-Z]/);
    if (englishMatch) {
      return englishMatch[0].toUpperCase();
    }
    const cleaned = source.replace(/@.*/, "").trim();
    return cleaned.charAt(0).toUpperCase() || "?";
  };

  const getTierLabel = (tier?: string) => {
    switch (tier) {
      case "genesis_validator":
        return "Genesis";
      case "enterprise_validator":
        return "Enterprise";
      case "active_validator":
        return "Validator";
      case "delegated_staker":
        return "Staker";
      case "basic_user":
        return "Basic";
      default:
        return "Member";
    }
  };

  const copyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast({
        title: t("common.copied", "복사됨"),
        description: t("profile.addressCopied", "지갑 주소가 복사되었습니다"),
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnectWallet = async (selectedWalletType: WalletType) => {
    try {
      const success = await connect(selectedWalletType);
      if (success) {
        // Refresh balance immediately after successful connection
        await refreshBalance();
        // Invalidate related queries to refresh member data
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        queryClient.invalidateQueries({ queryKey: ["/api/members/by-address"] });
        queryClient.invalidateQueries({ queryKey: ["/api/wallet/my-wallets"] });
        
        toast({
          title: t("profile.walletConnected", "지갑 연결됨"),
          description: t("profile.walletConnectedDesc", "지갑이 성공적으로 연결되었습니다"),
        });
        setShowWalletModal(false);
      }
    } catch (error) {
      toast({
        title: t("common.error", "오류"),
        description: t("profile.walletConnectError", "지갑 연결 중 오류가 발생했습니다"),
        variant: "destructive",
      });
    }
  };

  const formatBalance = (balance?: string, isWeb3Balance = false) => {
    if (!balance) return "0.00";
    // Web3 balance is already formatted in ether (e.g., "1.234567")
    // API balance is in Wei (large number that needs division by 1e18)
    let num: number;
    if (isWeb3Balance) {
      num = parseFloat(balance);
    } else {
      // Check if it looks like Wei (very large number) or already formatted
      const parsed = parseFloat(balance);
      // If the number is very large (> 1e10), treat it as Wei
      num = parsed > 1e10 ? parsed / 1e18 : parsed;
    }
    return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  };
  
  // Get the display balance - prefer web3 balance when wallet is connected
  const displayBalance = isConnected && web3Balance 
    ? formatBalance(web3Balance, true) 
    : formatBalance(currentMember?.balance);

  const formatAddress = (addr: string) => {
    if (addr.length <= 14) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
  };

  const initial = getInitial(currentMember?.displayName, currentEmail || currentMember?.email || address || undefined);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={`relative rounded-full h-9 w-9 p-0 ${className}`}
        onClick={() => setIsOpen(true)}
        data-testid="button-profile-badge"
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-[#FCD535] text-[#181A20] font-semibold text-sm">
            {initial}
          </AvatarFallback>
        </Avatar>
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setPosition({ x: 0, y: 0 });
        }
      }}>
        <DialogContent 
          ref={dragRef}
          className="sm:max-w-[360px] p-0 gap-0 border border-border/40 shadow-lg will-change-transform fixed top-16 right-4 translate-x-0 translate-y-0 data-[state=open]:slide-in-from-top-2"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            cursor: isDragging ? 'grabbing' : 'default',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            left: 'auto',
          }}
        >
          <DialogHeader
            className="cursor-grab active:cursor-grabbing select-none px-5 pt-5 pb-4 border-b border-border/40"
            onMouseDown={handleDragStart}
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11">
                <AvatarFallback className="bg-[#FCD535] text-[#181A20] font-bold text-base">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-base font-semibold truncate">
                  {isLoading ? (
                    <Skeleton className="h-5 w-28" />
                  ) : (
                    currentMember?.displayName || currentEmail || (address ? formatAddress(address) : t("profile.anonymous", "익명"))
                  )}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {getTierLabel(currentMember?.memberTier)}
                </p>
              </div>
            </div>
            <DialogDescription className="sr-only">
              {t("profile.description", "회원 정보")}
            </DialogDescription>
          </DialogHeader>

          {/* Wallet Connect Button - Below email, above icons */}
          <div className="px-4 py-3 border-b border-border/40">
            {isConnected && web3Balance ? (
              <div className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
                <div className="flex items-center gap-3">
                  <Wallet className="h-4 w-4 text-green-400 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-sm text-green-400 font-medium">{t("profile.walletConnected", "지갑 연결됨")}</span>
                    <span className="text-xs text-green-300/70 font-mono">{address ? formatAddress(address) : ""}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-green-400">{formatBalance(web3Balance, true)}</span>
                  <span className="text-xs text-green-300/70 ml-1">TBURN</span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowWalletModal(true)}
                className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border border-blue-500/30 transition-colors cursor-pointer group"
                data-testid="button-connect-external-wallet"
              >
                <div className="flex items-center gap-3">
                  <Wallet className="h-4 w-4 text-blue-400 shrink-0" />
                  <span className="text-sm text-blue-400 font-medium">{t("profile.connectWallet", "지갑연결")}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>

          {/* Quick Navigation Icons */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/40 bg-muted/20">
            <Link href="/" onClick={() => setIsOpen(false)}>
              <button className="p-2 rounded-lg hover:bg-muted/60 transition-colors" title={t("nav.home", "홈")} data-testid="nav-home">
                <Home className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            </Link>
            <Link href="/user" onClick={() => setIsOpen(false)}>
              <button className="p-2 rounded-lg hover:bg-muted/60 transition-colors" title={t("nav.user", "사용자")} data-testid="nav-user">
                <User className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            </Link>
            <Link href="/app" onClick={() => setIsOpen(false)}>
              <button className="p-2 rounded-lg hover:bg-muted/60 transition-colors" title={t("nav.apps", "앱")} data-testid="nav-apps">
                <LayoutGrid className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            </Link>
            <Link href="/tree" onClick={() => setIsOpen(false)}>
              <button className="p-2 rounded-lg hover:bg-muted/60 transition-colors" title={t("nav.tree", "트리")} data-testid="nav-tree">
                <TreeDeciduous className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            </Link>
            <Link href="/scan" onClick={() => setIsOpen(false)}>
              <button className="p-2 rounded-lg hover:bg-muted/60 transition-colors" title={t("nav.explorer", "탐색기")} data-testid="nav-explorer">
                <ScanLine className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            </Link>
            <Link href="/token-generator" onClick={() => setIsOpen(false)}>
              <button className="p-2 rounded-lg hover:bg-muted/60 transition-colors" title={t("nav.tokenGenerator", "토큰생성")} data-testid="nav-token-generator">
                <Coins className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            </Link>
            <Link href="/nft-marketplace" onClick={() => setIsOpen(false)}>
              <button className="p-2 rounded-lg hover:bg-muted/60 transition-colors" title={t("nav.nftMarket", "NFT마켓")} data-testid="nav-nft-marketplace">
                <ImageIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            </Link>
            <Link href="/security-audit" onClick={() => setIsOpen(false)}>
              <button className="p-2 rounded-lg hover:bg-muted/60 transition-colors" title={t("nav.securityAudit", "보안감사")} data-testid="nav-security-audit">
                <Shield className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            </Link>
            <Link href="/bug-bounty" onClick={() => setIsOpen(false)}>
              <button className="p-2 rounded-lg hover:bg-muted/60 transition-colors" title={t("nav.bugBounty", "버그바운티")} data-testid="nav-bug-bounty">
                <Bug className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            </Link>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Wallet className="h-4 w-4 text-muted-foreground shrink-0" />
                {walletAddress ? (
                  <span className="font-mono text-sm truncate">{formatAddress(walletAddress)}</span>
                ) : (
                  <Link href="/user?createWallet=true" onClick={() => setIsOpen(false)}>
                    <span className="text-sm text-[#FCD535] hover:underline flex items-center gap-1" data-testid="button-create-wallet">
                      <Plus className="h-3.5 w-3.5" />
                      {t("profile.createWallet", "지갑생성")}
                    </span>
                  </Link>
                )}
              </div>
              {walletAddress && (
                <button
                  onClick={copyAddress}
                  className="p-1.5 hover:bg-muted rounded transition-colors"
                  data-testid="button-copy-address"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              )}
            </div>

            <Link href="/user?tab=wallet&action=create" onClick={() => setIsOpen(false)}>
              <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <Plus className="h-4 w-4 text-[#FCD535] shrink-0" />
                  <span className="text-sm text-[#FCD535]">{t("profile.createNewWallet", "지갑생성")}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            <div className="grid grid-cols-2 gap-2">
              <div className="py-3 px-3 rounded-lg bg-muted/40">
                <div className="flex items-center gap-2 mb-1">
                  <Coins className="h-3.5 w-3.5 text-[#FCD535]" />
                  <span className="text-xs text-muted-foreground">{t("profile.balance", "잔액")}</span>
                  {isConnected && walletType && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 font-medium">
                      {walletType.toUpperCase()}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold" data-testid="text-wallet-balance">
                  {isLoading ? <Skeleton className="h-4 w-16" /> : `${displayBalance} TBURN`}
                </p>
              </div>

              <div className="py-3 px-3 rounded-lg bg-muted/40">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-xs text-muted-foreground">{t("profile.staked", "스테이킹")}</span>
                </div>
                <p className="text-sm font-semibold">
                  {isLoading ? <Skeleton className="h-4 w-16" /> : `${formatBalance(currentMember?.stakedBalance)} TBURN`}
                </p>
              </div>
            </div>
          </div>

          <div className="px-4 pb-4 pt-1 space-y-1 border-t border-border/40">
            <Link href="/user">
              <button
                className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors group"
                onClick={() => setIsOpen(false)}
                data-testid="button-go-dashboard"
              >
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{t("profile.myDashboard", "내 대시보드")}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </button>
            </Link>

            <button
              className="w-full flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-red-500/10 transition-colors text-red-500"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">{t("profile.logout", "로그아웃")}</span>
              {logoutMutation.isPending && (
                <div className="h-3.5 w-3.5 border-2 border-red-300 border-t-red-500 rounded-full animate-spin ml-auto" />
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Wallet Connection Modal */}
      <Dialog open={showWalletModal} onOpenChange={setShowWalletModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-400" />
              {t("profile.connectWallet", "지갑연결")}
            </DialogTitle>
            <DialogDescription>
              {t("profile.selectWalletToConnect", "연결할 지갑을 선택하세요")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <button
              onClick={() => handleConnectWallet('metamask')}
              disabled={isConnecting}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border/40 hover:bg-muted/50 transition-colors disabled:opacity-50"
              data-testid="button-connect-metamask"
            >
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <span className="text-lg">🦊</span>
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold">MetaMask</p>
                <p className="text-xs text-muted-foreground">{t("profile.popularWallet", "가장 인기있는 지갑")}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>

            <button
              onClick={() => handleConnectWallet('coinbase')}
              disabled={isConnecting}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border/40 hover:bg-muted/50 transition-colors disabled:opacity-50"
              data-testid="button-connect-coinbase"
            >
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <span className="text-lg">🔵</span>
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold">Coinbase Wallet</p>
                <p className="text-xs text-muted-foreground">{t("profile.secureWallet", "안전한 지갑")}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>

            <button
              onClick={() => handleConnectWallet('rabby')}
              disabled={isConnecting}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border/40 hover:bg-muted/50 transition-colors disabled:opacity-50"
              data-testid="button-connect-rabby"
            >
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <span className="text-lg">🐰</span>
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold">Rabby Wallet</p>
                <p className="text-xs text-muted-foreground">{t("profile.defiWallet", "DeFi 전용 지갑")}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>

            <button
              onClick={() => handleConnectWallet('trust')}
              disabled={isConnecting}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border/40 hover:bg-muted/50 transition-colors disabled:opacity-50"
              data-testid="button-connect-trust"
            >
              <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
                <span className="text-lg">🛡️</span>
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold">Trust Wallet</p>
                <p className="text-xs text-muted-foreground">{t("profile.mobileWallet", "모바일 지갑")}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          {isConnecting && (
            <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
              <div className="h-4 w-4 border-2 border-blue-300 border-t-blue-500 rounded-full animate-spin" />
              {t("profile.connecting", "연결 중...")}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
