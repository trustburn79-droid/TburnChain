import { useState } from "react";
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
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";

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
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: authCheck } = useQuery<{ authenticated: boolean; memberId?: string }>({
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

  if (!authCheck?.authenticated) {
    return null;
  }

  const getInitial = (name?: string) => {
    if (!name) return "?";
    const cleaned = name.replace(/@.*/, "").trim();
    return cleaned.charAt(0).toUpperCase();
  };

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case "genesis_validator":
        return "bg-purple-500";
      case "enterprise_validator":
        return "bg-indigo-500";
      case "active_validator":
        return "bg-green-500";
      case "delegated_staker":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTierLabel = (tier?: string) => {
    switch (tier) {
      case "genesis_validator":
        return "Genesis Validator";
      case "enterprise_validator":
        return "Enterprise Validator";
      case "active_validator":
        return "Active Validator";
      case "delegated_staker":
        return "Delegated Staker";
      case "basic_user":
        return "Basic User";
      default:
        return tier || "Member";
    }
  };

  const copyAddress = async () => {
    if (memberInfo?.accountAddress) {
      await navigator.clipboard.writeText(memberInfo.accountAddress);
      setCopied(true);
      toast({
        title: t("common.copied", "복사됨"),
        description: t("profile.addressCopied", "지갑 주소가 복사되었습니다"),
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

  const initial = getInitial(memberInfo?.displayName);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={`relative rounded-full h-9 w-9 ${className}`}
        onClick={() => setIsOpen(true)}
        data-testid="button-profile-badge"
      >
        <Avatar className="h-8 w-8 border-2 border-primary/20 hover:border-primary/50 transition-colors">
          <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold text-sm">
            {initial}
          </AvatarFallback>
        </Avatar>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-primary/30">
                <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold text-lg">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-lg font-semibold">
                  {isLoading ? <Skeleton className="h-5 w-32" /> : memberInfo?.displayName || t("profile.anonymous", "익명")}
                </span>
                <Badge className={`w-fit mt-1 ${getTierColor(memberInfo?.memberTier)}`}>
                  {getTierLabel(memberInfo?.memberTier)}
                </Badge>
              </div>
            </DialogTitle>
            <DialogDescription className="sr-only">
              {t("profile.description", "회원 정보")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Wallet className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{t("profile.walletAddress", "지갑 주소")}</p>
                  <p className="font-mono text-sm truncate">
                    {isLoading ? <Skeleton className="h-4 w-48" /> : memberInfo?.accountAddress}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={copyAddress}
                  data-testid="button-copy-address"
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              {memberInfo?.email && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{t("profile.email", "이메일")}</p>
                    <p className="text-sm">{memberInfo.email}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Coins className="h-5 w-5 text-cyan-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t("profile.balance", "잔액")}</p>
                    <p className="text-sm font-semibold">
                      {isLoading ? <Skeleton className="h-4 w-16" /> : `${formatBalance(memberInfo?.balance)} TBURN`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Shield className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t("profile.staked", "스테이킹")}</p>
                    <p className="text-sm font-semibold">
                      {isLoading ? <Skeleton className="h-4 w-16" /> : `${formatBalance(memberInfo?.stakedBalance)} TBURN`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <Link href="/user">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => setIsOpen(false)}
                  data-testid="button-go-dashboard"
                >
                  <User className="h-4 w-4" />
                  {t("profile.myDashboard", "내 대시보드")}
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </Button>
              </Link>

              <Button
                variant="destructive"
                className="w-full justify-start gap-2"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4" />
                {t("profile.logout", "로그아웃")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
