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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Wallet,
  Mail,
  User,
  LogOut,
  Copy,
  Check,
  Shield,
  Coins,
  ExternalLink,
  Sparkles,
  TrendingUp,
  Zap,
  ChevronRight,
  Crown,
  Star,
  Activity,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useWeb3 } from "@/lib/web3-context";

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
  const { isConnected, address } = useWeb3();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
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

  if (!isAuthenticated) {
    return null;
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

  const getTierConfig = (tier?: string) => {
    switch (tier) {
      case "genesis_validator":
        return {
          label: "Genesis Validator",
          icon: Crown,
          gradient: "from-purple-500 via-violet-500 to-indigo-500",
          bgGlow: "bg-purple-500/20",
          borderColor: "border-purple-500/50",
          textColor: "text-purple-400",
          badgeBg: "bg-gradient-to-r from-purple-600 to-violet-600",
        };
      case "enterprise_validator":
        return {
          label: "Enterprise Validator",
          icon: Star,
          gradient: "from-indigo-500 via-blue-500 to-cyan-500",
          bgGlow: "bg-indigo-500/20",
          borderColor: "border-indigo-500/50",
          textColor: "text-indigo-400",
          badgeBg: "bg-gradient-to-r from-indigo-600 to-blue-600",
        };
      case "active_validator":
        return {
          label: "Active Validator",
          icon: Zap,
          gradient: "from-emerald-500 via-green-500 to-teal-500",
          bgGlow: "bg-emerald-500/20",
          borderColor: "border-emerald-500/50",
          textColor: "text-emerald-400",
          badgeBg: "bg-gradient-to-r from-emerald-600 to-green-600",
        };
      case "delegated_staker":
        return {
          label: "Delegated Staker",
          icon: TrendingUp,
          gradient: "from-blue-500 via-cyan-500 to-teal-500",
          bgGlow: "bg-blue-500/20",
          borderColor: "border-blue-500/50",
          textColor: "text-blue-400",
          badgeBg: "bg-gradient-to-r from-blue-600 to-cyan-600",
        };
      default:
        return {
          label: tier || "Member",
          icon: User,
          gradient: "from-slate-500 via-gray-500 to-zinc-500",
          bgGlow: "bg-slate-500/20",
          borderColor: "border-slate-500/50",
          textColor: "text-slate-400",
          badgeBg: "bg-gradient-to-r from-slate-600 to-gray-600",
        };
    }
  };

  const copyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast({
        title: t("common.copied", "복사됨"),
        description: t("profile.addressCopied", "지갑 주소가 클립보드에 복사되었습니다"),
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

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

  const formatBalance = (balance?: string) => {
    if (!balance) return "0.00";
    const num = parseFloat(balance) / 1e18;
    return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  };

  const formatWalletAddress = (addr: string) => {
    if (addr.length <= 16) return addr;
    return `${addr.slice(0, 10)}...${addr.slice(-8)}`;
  };

  const initial = getInitial(currentMember?.displayName, currentEmail || currentMember?.email || address || undefined);
  const tierConfig = getTierConfig(currentMember?.memberTier);
  const TierIcon = tierConfig.icon;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={`relative rounded-full h-10 w-10 p-0 overflow-visible group ${className}`}
        onClick={() => setIsOpen(true)}
        data-testid="button-profile-badge"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <Avatar className="h-9 w-9 border-2 border-cyan-500/30 group-hover:border-cyan-400/60 transition-all duration-300 ring-2 ring-transparent group-hover:ring-cyan-500/20">
          <AvatarFallback className="bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 text-white font-bold text-sm">
            {initial}
          </AvatarFallback>
        </Avatar>
        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background animate-pulse" />
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setPosition({ x: 0, y: 0 });
        }
      }}>
        <DialogContent 
          ref={dragRef}
          className="sm:max-w-[420px] p-0 overflow-hidden border-0 shadow-2xl will-change-transform bg-gradient-to-b from-background via-background to-background/95 dark:from-slate-900 dark:via-slate-900/98 dark:to-slate-950"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            cursor: isDragging ? 'grabbing' : 'default',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${tierConfig.gradient} opacity-[0.03] pointer-events-none`} />
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
          
          <DialogHeader
            className="relative cursor-grab active:cursor-grabbing select-none p-6 pb-4"
            onMouseDown={handleDragStart}
          >
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className={`absolute -inset-1 rounded-full ${tierConfig.bgGlow} blur-lg animate-pulse`} />
                <Avatar className={`relative h-16 w-16 border-2 ${tierConfig.borderColor} ring-4 ring-background shadow-xl`}>
                  <AvatarFallback className={`bg-gradient-to-br ${tierConfig.gradient} text-white font-bold text-xl`}>
                    {initial}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-3 border-background flex items-center justify-center">
                  <Activity className="h-3 w-3 text-white animate-pulse" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0 pt-1">
                <DialogTitle className="text-xl font-bold tracking-tight mb-1.5">
                  {isLoading ? (
                    <Skeleton className="h-6 w-36" />
                  ) : (
                    <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                      {currentMember?.displayName || currentEmail || currentMember?.email || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : t("profile.anonymous", "익명"))}
                    </span>
                  )}
                </DialogTitle>
                
                <Badge className={`${tierConfig.badgeBg} text-white border-0 px-2.5 py-0.5 text-xs font-medium shadow-lg`}>
                  <TierIcon className="h-3 w-3 mr-1" />
                  {tierConfig.label}
                </Badge>
              </div>
            </div>
            <DialogDescription className="sr-only">
              {t("profile.description", "회원 정보")}
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-6 space-y-4">
            <div className="relative group">
              <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-indigo-500/30 opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />
              <div className="relative rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                      <Wallet className="h-4 w-4 text-cyan-500" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">{t("profile.walletAddress", "지갑 주소")}</span>
                  </div>
                  {walletAddress && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 text-xs gap-1.5 hover:bg-cyan-500/10 hover:text-cyan-500 transition-colors"
                      onClick={copyAddress}
                      data-testid="button-copy-address"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="text-emerald-500">{t("common.copied", "복사됨")}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>{t("common.copy", "복사")}</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
                
                {walletAddress ? (
                  <div className="relative">
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-slate-900/50 to-slate-800/50 dark:from-slate-800/50 dark:to-slate-700/50" />
                    <div className="relative font-mono text-sm px-4 py-3 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-cyan-600 dark:text-cyan-400 font-semibold tracking-wide">
                          {formatWalletAddress(walletAddress)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link href="/user?createWallet=true">
                    <button 
                      className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-cyan-500/30 hover:border-cyan-500/60 bg-cyan-500/5 hover:bg-cyan-500/10 transition-all duration-200 group/create"
                      onClick={() => setIsOpen(false)}
                      data-testid="button-create-wallet"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Sparkles className="h-4 w-4 text-cyan-500 group-hover/create:animate-pulse" />
                        <span className="text-sm font-medium text-cyan-600 dark:text-cyan-400">
                          {t("profile.createWallet", "새 지갑 생성하기")}
                        </span>
                        <ChevronRight className="h-4 w-4 text-cyan-500 group-hover/create:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                  </Link>
                )}
              </div>
            </div>

            {(currentEmail || currentMember?.email) && (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border/30 bg-muted/30">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-violet-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">{t("profile.email", "이메일")}</p>
                  <p className="text-sm font-medium truncate">{currentEmail || currentMember?.email}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="relative group/balance overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl opacity-0 group-hover/balance:opacity-100 transition-opacity" />
                <div className="relative p-4 rounded-xl border border-border/30 bg-card/30 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                      <Coins className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">{t("profile.balance", "잔액")}</span>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-lg font-bold tracking-tight">
                      {isLoading ? <Skeleton className="h-5 w-20" /> : formatBalance(currentMember?.balance)}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">TBURN</p>
                  </div>
                </div>
              </div>

              <div className="relative group/staked overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-xl opacity-0 group-hover/staked:opacity-100 transition-opacity" />
                <div className="relative p-4 rounded-xl border border-border/30 bg-card/30 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <Shield className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">{t("profile.staked", "스테이킹")}</span>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-lg font-bold tracking-tight">
                      {isLoading ? <Skeleton className="h-5 w-20" /> : formatBalance(currentMember?.stakedBalance)}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">TBURN</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            <div className="space-y-2">
              <Link href="/user">
                <Button
                  variant="outline"
                  className="w-full h-11 justify-between gap-2 rounded-xl border-border/50 hover:bg-primary/5 hover:border-primary/30 transition-all group/dash"
                  onClick={() => setIsOpen(false)}
                  data-testid="button-go-dashboard"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover/dash:from-primary/30 group-hover/dash:to-primary/20 transition-colors">
                      <User className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="font-medium">{t("profile.myDashboard", "내 대시보드")}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover/dash:text-primary group-hover/dash:translate-x-0.5 transition-all" />
                </Button>
              </Link>

              <Button
                variant="ghost"
                className="w-full h-11 justify-between gap-2 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-all group/logout"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                data-testid="button-logout"
              >
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-red-500/10 flex items-center justify-center group-hover/logout:bg-red-500/20 transition-colors">
                    <LogOut className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-medium">{t("profile.logout", "로그아웃")}</span>
                </div>
                {logoutMutation.isPending && (
                  <div className="h-4 w-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
