import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/components/theme-provider";
import { useWeb3 } from "@/lib/web3-context";
import { WalletConnectModal } from "@/components/wallet-connect-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Flame, Wallet, Layers, Gavel, Globe, RefreshCw, Shield, Coins,
  ArrowUp, ArrowDown, CheckCircle, ExternalLink, Sun, Moon, ChevronDown,
  Zap, TrendingUp, Users, Activity, Clock, AlertTriangle, Vote,
  Lock, Unlock, Send, Copy, Eye, EyeOff, ChevronRight, Award,
  BarChart3, PieChart, Cpu, HardDrive, Network, Radio, Loader2,
  LogOut, Settings, Bell, Star, Boxes, GitBranch, Timer, CircleDot,
  Menu, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatNumber } from "@/lib/formatters";
import { LanguageSelector } from "@/components/language-selector";
import type { NetworkStats, StakingStats } from "@shared/schema";

type Section = "dashboard" | "wallet" | "staking" | "governance" | "network";

interface GovernanceProposal {
  id: string;
  proposer: string;
  title: string;
  description: string;
  status: string;
  votesFor: string;
  votesAgainst: string;
  votesAbstain: string;
  totalVoters: number;
  quorumReached: boolean;
  votingEnds: string;
  createdAt: string;
  riskScore: number;
  aiAnalysis?: {
    model: string;
    confidence: number;
    economicImpact: number;
    securityImpact: number;
    recommendation: string;
  };
}

interface Block {
  blockNumber: number;
  transactions: number;
  burned: number;
  timestamp: number;
  validator?: string;
  gasUsed?: number;
}

interface BurnStats {
  totalBurned: string;
  burnedToday: string;
  burned7d: string;
  burned30d: string;
  transactionBurns: string;
  currentBurnRate: number;
  burnProgress: number;
}

interface ValidatorResponse {
  validators: ApiValidator[];
}

interface ApiValidator {
  address: string;
  name: string;
  status: string;
  stake: string;
  delegators: number;
  commission: number;
  uptime: number;
  blocksProduced: number;
  rewards: string;
  aiTrustScore: number;
  votingPower: number;
  tier: number;
  region: string;
}

interface ShardInfo {
  id: number;
  name: string;
  status: string;
  validators: number;
  transactions: number;
  load: number;
}

interface UserStakingInfo {
  totalStaked: string;
  pendingRewards: string;
  delegations: Array<{
    validatorAddress: string;
    validatorName: string;
    amount: string;
    rewards: string;
  }>;
  unbonding: Array<{
    amount: string;
    completionTime: string;
  }>;
}

interface TransactionHistory {
  hash: string;
  type: string;
  from: string;
  to: string;
  amount: string;
  burned: string;
  status: string;
  timestamp: string;
  blockNumber: number;
}

interface UserOverview {
  address: string;
  liquidBalance: string;
  totalStaked: string;
  totalPortfolioValue: string;
  pendingRewards: string;
  miningRewards: {
    total: string;
    unclaimed: string;
    last24h: string;
    last7d: string;
  };
  stakingRewards: {
    total: string;
    unclaimed: string;
    averageApy: string;
    activePositions: number;
  };
  eventRewards: {
    total: string;
    claimable: string;
    pendingEvents: number;
    eligibleEvents: number;
  };
  totalUnclaimedRewards: string;
}

interface UserMiningReward {
  id: string;
  amount: string;
  source: string;
  epoch: number;
  blockNumber: number;
  txHash: string;
  claimed: boolean;
  createdAt: string;
}

interface UserStakingPosition {
  id: string;
  validatorId: string;
  validatorName: string;
  stakedAmount: string;
  currentValue: string;
  currentApy: string;
  pendingRewards: string;
  totalRewardsEarned: string;
  status: string;
  lockPeriodDays: number;
  unlockDate: string | null;
  stakedAt: string;
}

interface UserStakingReward {
  id: string;
  positionId: string;
  validatorId: string;
  amount: string;
  rewardType: string;
  epoch: number;
  apy: string;
  txHash: string;
  claimed: boolean;
  autoCompounded: boolean;
  createdAt: string;
}

interface UserEventParticipation {
  id: string;
  eventId: string;
  eventName: string;
  eventType: string;
  eventDescription: string;
  status: string;
  rewardAmount: string;
  rewardToken: string;
  eventStartDate: string;
  eventEndDate: string;
  claimDeadline: string | null;
  claimedAt: string | null;
}

interface UserActivity {
  id: string;
  activityType: string;
  category: string;
  title: string;
  description: string;
  amount: string | null;
  token: string;
  txHash: string;
  createdAt: string;
}

const transferFormSchema = z.object({
  recipientAddress: z.string().min(1, "주소를 입력해주세요").regex(/^0x[a-fA-F0-9]{40}$/, "유효한 TBURN 주소를 입력해주세요"),
  amount: z.string().min(1, "수량을 입력해주세요").refine((val) => parseFloat(val) > 0, "0보다 큰 수량을 입력해주세요"),
});

const delegateFormSchema = z.object({
  validatorAddress: z.string().min(1, "검증자를 선택해주세요"),
  amount: z.string().min(1, "수량을 입력해주세요").refine((val) => parseFloat(val) >= 100, "최소 100 TB 이상 위임 가능합니다"),
});

type TransferFormValues = z.infer<typeof transferFormSchema>;
type DelegateFormValues = z.infer<typeof delegateFormSchema>;

const formatBurnAmount = (val: string | undefined): string => {
  if (!val) return "0";
  const num = parseFloat(val);
  if (isNaN(num)) return "0";
  if (num >= 1e21) return `${(num / 1e21).toFixed(2)}Z`;
  if (num >= 1e18) return `${(num / 1e18).toFixed(2)}E`;
  if (num >= 1e15) return `${(num / 1e15).toFixed(2)}P`;
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toFixed(2);
};

const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return "방금 전";
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  return `${diffDays}일 전`;
};

export default function UserPage() {
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const trustScoreCanvasRef = useRef<HTMLCanvasElement>(null);
  const [blockFeed, setBlockFeed] = useState<Block[]>([]);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  
  const {
    isConnected,
    isConnecting,
    address,
    balance,
    walletType,
    memberInfo,
    connect,
    disconnect,
    formatAddress,
    sendTransaction,
    refreshBalance,
  } = useWeb3();

  const { data: networkStats } = useQuery<NetworkStats>({
    queryKey: ["/api/network/stats"],
    staleTime: 5000,
    refetchInterval: 5000,
    retry: 1,
  });

  const { data: stakingStats } = useQuery<StakingStats | null>({
    queryKey: ["/api/staking/stats"],
    staleTime: 10000,
    refetchInterval: 10000,
    retry: false,
    queryFn: async () => {
      try {
        const res = await fetch("/api/staking/stats", { credentials: "include" });
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },
  });

  const { data: validatorResponse } = useQuery<ValidatorResponse>({
    queryKey: ["/api/validators"],
    staleTime: 15000,
    refetchInterval: 15000,
    retry: 1,
  });
  const validators = validatorResponse?.validators || [];

  const { data: burnStats } = useQuery<BurnStats>({
    queryKey: ["/api/burn/stats"],
    staleTime: 10000,
    refetchInterval: 10000,
    retry: 1,
  });

  const { data: proposals } = useQuery<GovernanceProposal[] | null>({
    queryKey: ["/api/governance/proposals"],
    staleTime: 30000,
    refetchInterval: 30000,
    retry: false,
    queryFn: async () => {
      try {
        const res = await fetch("/api/governance/proposals", { credentials: "include" });
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },
  });

  const { data: shards } = useQuery<ShardInfo[]>({
    queryKey: ["/api/shards"],
    staleTime: 10000,
    refetchInterval: 10000,
    retry: 1,
    queryFn: async () => {
      try {
        const res = await fetch("/api/shards", { credentials: "include" });
        if (!res.ok) return [];
        return await res.json();
      } catch {
        return [];
      }
    },
  });

  // User-specific data queries (only fetch when wallet connected)
  const { data: userOverview, isLoading: userOverviewLoading } = useQuery<UserOverview | null>({
    queryKey: ["/api/user", address, "overview"],
    staleTime: 30000,
    refetchInterval: 30000,
    enabled: isConnected && !!address,
    queryFn: async () => {
      if (!address) return null;
      try {
        const res = await fetch(`/api/user/${address}/overview`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.success ? data.data : null;
      } catch {
        return null;
      }
    },
  });

  const { data: userMiningRewards } = useQuery<{ rewards: UserMiningReward[]; summary: any } | null>({
    queryKey: ["/api/user", address, "mining-rewards"],
    staleTime: 30000,
    refetchInterval: 30000,
    enabled: isConnected && !!address,
    queryFn: async () => {
      if (!address) return null;
      try {
        const res = await fetch(`/api/user/${address}/mining-rewards?limit=10`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.success ? data.data : null;
      } catch {
        return null;
      }
    },
  });

  const { data: userStakingPositions } = useQuery<{ positions: UserStakingPosition[]; summary: any } | null>({
    queryKey: ["/api/user", address, "staking-positions"],
    staleTime: 30000,
    refetchInterval: 30000,
    enabled: isConnected && !!address,
    queryFn: async () => {
      if (!address) return null;
      try {
        const res = await fetch(`/api/user/${address}/staking-positions`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.success ? data.data : null;
      } catch {
        return null;
      }
    },
  });

  const { data: userStakingRewards } = useQuery<{ rewards: UserStakingReward[]; summary: any } | null>({
    queryKey: ["/api/user", address, "staking-rewards"],
    staleTime: 30000,
    refetchInterval: 30000,
    enabled: isConnected && !!address,
    queryFn: async () => {
      if (!address) return null;
      try {
        const res = await fetch(`/api/user/${address}/staking-rewards?limit=10`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.success ? data.data : null;
      } catch {
        return null;
      }
    },
  });

  const { data: userEvents } = useQuery<{ events: UserEventParticipation[]; summary: any } | null>({
    queryKey: ["/api/user", address, "events"],
    staleTime: 30000,
    refetchInterval: 30000,
    enabled: isConnected && !!address,
    queryFn: async () => {
      if (!address) return null;
      try {
        const res = await fetch(`/api/user/${address}/events`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.success ? data.data : null;
      } catch {
        return null;
      }
    },
  });

  const { data: userActivities } = useQuery<{ activities: UserActivity[] } | null>({
    queryKey: ["/api/user", address, "activities"],
    staleTime: 30000,
    refetchInterval: 30000,
    enabled: isConnected && !!address,
    queryFn: async () => {
      if (!address) return null;
      try {
        const res = await fetch(`/api/user/${address}/activities?limit=10`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.success ? data.data : null;
      } catch {
        return null;
      }
    },
  });

  const blockHeightRef = useRef(0);
  
  useEffect(() => {
    if (activeSection !== "network") return;
    if (networkStats?.currentBlockHeight) {
      blockHeightRef.current = networkStats.currentBlockHeight;
    }
    const interval = setInterval(() => {
      blockHeightRef.current += 1;
      const newBlock: Block = {
        blockNumber: blockHeightRef.current,
        transactions: networkStats?.tps ? Math.floor(networkStats.tps * 0.5 + Math.random() * networkStats.tps * 0.2) : 50000,
        burned: Math.floor(Math.random() * 150 + 50),
        timestamp: Date.now(),
        validator: validators[Math.floor(Math.random() * validators.length)]?.name || "Validator",
        gasUsed: Math.floor(Math.random() * 30000000),
      };
      setBlockFeed((prev) => [newBlock, ...prev.slice(0, 9)]);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSection, networkStats?.currentBlockHeight, networkStats?.tps, validators]);

  const avgTrustScore = useMemo(() => {
    if (validators.length === 0) return 92;
    return Math.round(validators.reduce((sum, v) => sum + (v.aiTrustScore / 100), 0) / validators.length);
  }, [validators]);

  useEffect(() => {
    const canvas = trustScoreCanvasRef.current;
    if (!canvas || activeSection !== "dashboard") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDark = theme === "dark";
    const score = avgTrustScore;
    const radius = 80;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const lineWidth = 12;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, "#3B82F6");
    gradient.addColorStop(1, "#10B981");

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + (score / 100) * Math.PI * 2);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.stroke();
  }, [theme, activeSection, avgTrustScore]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/network/stats"] });
    queryClient.invalidateQueries({ queryKey: ["/api/staking/stats"] });
    queryClient.invalidateQueries({ queryKey: ["/api/burn/stats"] });
    queryClient.invalidateQueries({ queryKey: ["/api/validators"] });
    if (isConnected) {
      refreshBalance();
    }
    toast({ title: "데이터 갱신 중", description: "최신 데이터를 불러오고 있습니다." });
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };


  const handleDisconnect = () => {
    disconnect();
    toast({ title: "지갑 연결 해제", description: "지갑 연결이 해제되었습니다." });
  };

  const navItems = [
    { id: "dashboard" as Section, label: "대시보드", icon: Shield, badge: null },
    { id: "wallet" as Section, label: "지갑 & 전송", icon: Wallet, badge: null },
    { id: "staking" as Section, label: "스테이킹", icon: Layers, badge: isConnected ? "Active" : null },
    { id: "governance" as Section, label: "거버넌스", icon: Gavel, badge: proposals && proposals.length > 0 ? `${proposals.length}` : null },
    { id: "network" as Section, label: "네트워크", icon: Globe, badge: null },
  ];

  const totalBurned = formatBurnAmount(burnStats?.totalBurned);
  const burnPercentage = burnStats?.burnProgress ? Math.min(burnStats.burnProgress * 100, 100) : 0.27;

  const handleNavClick = (sectionId: Section) => {
    setActiveSection(sectionId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans antialiased bg-slate-50 text-slate-800 dark:bg-[#0B1120] dark:text-[#E2E8F0]">
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      <aside className={`
        fixed lg:relative inset-y-0 left-0 w-72 flex flex-col z-40 
        transition-transform duration-300 ease-in-out
        border-r bg-white border-slate-200 dark:bg-[#0F172A] dark:border-gray-800
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 lg:p-6 flex items-center justify-between border-b border-slate-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 flex items-center justify-center text-white font-bold text-xl lg:text-2xl shadow-lg shadow-blue-500/20">
              T
            </div>
            <div>
              <h1 className="font-bold text-lg lg:text-xl tracking-tight text-slate-900 dark:text-white">
                TBURN
              </h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] lg:text-xs text-emerald-500 font-medium">Mainnet v4.0.2</span>
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden" 
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-1 p-3 lg:p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                data-testid={`nav-${item.id}`}
                className={`w-full flex items-center justify-between px-3 lg:px-4 py-2.5 lg:py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/20 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-gray-800/50 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? "text-blue-500" : ""}`} />
                  {item.label}
                </div>
                {item.badge && (
                  <Badge variant="secondary" className="text-[10px] h-5 px-2">
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-gray-800">
          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20 p-4 rounded-xl border border-orange-200/50 dark:border-orange-500/20">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-medium text-slate-600 dark:text-gray-300">누적 소각량</span>
              <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
            </div>
            <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white mb-2">
              {totalBurned} TB
            </div>
            <Progress value={burnPercentage} className="h-2" />
            <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-2">
              목표 대비 {burnPercentage.toFixed(2)}% 달성
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-50 dark:bg-[#0B1120] transition-colors duration-300 w-full">
        <div className="absolute inset-0 opacity-30 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        <header className="h-14 lg:h-16 border-b border-slate-200 dark:border-gray-800 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-xl flex items-center justify-between px-3 sm:px-4 lg:px-8 z-10">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden" 
              onClick={() => setMobileMenuOpen(true)}
              data-testid="button-mobile-menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-full border border-emerald-200 dark:border-emerald-500/20">
              <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse" />
              <span className="text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Live
              </span>
            </div>
            
            <Separator orientation="vertical" className="h-4 sm:h-6 hidden sm:block" />
            
            <div className="hidden sm:flex items-center gap-2 lg:gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-1 sm:gap-2">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                <span className="hidden md:inline text-slate-600 dark:text-gray-400">TPS:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {networkStats?.tps ? formatNumber(networkStats.tps) : "---"}
                </span>
              </div>
              <div className="hidden md:flex items-center gap-1 sm:gap-2">
                <Boxes className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                <span className="text-slate-600 dark:text-gray-400">블록:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  #{networkStats?.currentBlockHeight ? formatNumber(networkStats.currentBlockHeight) : "---"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
            <Button variant="ghost" size="icon" onClick={handleRefresh} data-testid="button-refresh-header" className="h-8 w-8 lg:h-9 lg:w-9">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <LanguageSelector />
            <Button variant="ghost" size="icon" onClick={toggleTheme} data-testid="button-theme-toggle" className="h-8 w-8 lg:h-9 lg:w-9">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Separator orientation="vertical" className="h-4 sm:h-6 hidden sm:block" />
            <Button variant="ghost" size="icon" className="hidden sm:flex h-8 w-8 lg:h-9 lg:w-9">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden sm:flex h-8 w-8 lg:h-9 lg:w-9">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 scroll-smooth relative z-0">
          {activeSection === "dashboard" && (
            <DashboardSection
              isConnected={isConnected}
              address={address}
              balance={balance}
              networkStats={networkStats}
              userOverview={userOverview}
              userMiningRewards={userMiningRewards}
              userStakingPositions={userStakingPositions}
              userStakingRewards={userStakingRewards}
              userEvents={userEvents}
              userActivities={userActivities}
              userOverviewLoading={userOverviewLoading}
              onRefresh={handleRefresh}
              onConnectWallet={() => setWalletModalOpen(true)}
            />
          )}
          {activeSection === "wallet" && (
            <WalletSection
              isConnected={isConnected}
              address={address}
              balance={balance}
              onConnectWallet={() => setWalletModalOpen(true)}
            />
          )}
          {activeSection === "staking" && (
            <StakingSection
              isConnected={isConnected}
              stakingStats={stakingStats}
              validators={validators}
              onConnectWallet={() => setWalletModalOpen(true)}
            />
          )}
          {activeSection === "governance" && (
            <GovernanceSection
              isConnected={isConnected}
              proposals={proposals || []}
              onConnectWallet={() => setWalletModalOpen(true)}
            />
          )}
          {activeSection === "network" && (
            <NetworkSection
              networkStats={networkStats}
              blockFeed={blockFeed}
              shards={shards || []}
              validators={validators}
            />
          )}
        </div>
      </main>

      <WalletConnectModal open={walletModalOpen} onOpenChange={setWalletModalOpen} />
    </div>
  );
}

function DashboardSection({
  isConnected,
  address,
  balance,
  networkStats,
  userOverview,
  userMiningRewards,
  userStakingPositions,
  userStakingRewards,
  userEvents,
  userActivities,
  userOverviewLoading,
  onRefresh,
  onConnectWallet,
}: {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  networkStats: NetworkStats | undefined;
  userOverview: UserOverview | null | undefined;
  userMiningRewards: { rewards: UserMiningReward[]; summary: any } | null | undefined;
  userStakingPositions: { positions: UserStakingPosition[]; summary: any } | null | undefined;
  userStakingRewards: { rewards: UserStakingReward[]; summary: any } | null | undefined;
  userEvents: { events: UserEventParticipation[]; summary: any } | null | undefined;
  userActivities: { activities: UserActivity[] } | null | undefined;
  userOverviewLoading: boolean;
  onRefresh: () => void;
  onConnectWallet: () => void;
}) {
  const { t } = useTranslation();

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      airdrop: t('userPage.airdrop'),
      campaign: t('userPage.campaign'),
      governance_reward: t('userPage.governance'),
      referral: t('userPage.referral'),
      bug_bounty: 'Bug Bounty',
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      claimed: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
      eligible: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
      pending: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400',
      expired: 'bg-slate-100 text-slate-500 dark:bg-slate-500/20 dark:text-slate-400',
    };
    const labels: Record<string, string> = {
      claimed: t('userPage.claimed'),
      eligible: t('userPage.eligible'),
      pending: t('common.pending'),
      expired: t('userPage.expired'),
    };
    return <Badge className={styles[status] || styles.pending}>{labels[status] || status}</Badge>;
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, typeof Wallet> = {
      transfer_in: ArrowDown,
      transfer_out: ArrowUp,
      stake: Lock,
      unstake: Unlock,
      claim_reward: Award,
      vote: Vote,
      event_participation: Star,
    };
    return icons[type] || Activity;
  };

  return (
    <section className="space-y-4 sm:space-y-6" data-testid="section-dashboard">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {t('userPage.title')}
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-gray-400">
            {isConnected ? t('userPage.pageDescription') : t('userPage.connectWalletDescription')}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {!isConnected && (
            <Button onClick={onConnectWallet} className="flex-1 sm:flex-none bg-gradient-to-r from-blue-500 to-purple-600 text-sm" data-testid="button-connect-dashboard">
              <Wallet className="w-4 h-4 mr-2" /> {t('userPage.connectWallet')}
            </Button>
          )}
          <Button variant="outline" onClick={onRefresh} data-testid="button-refresh" className="flex-1 sm:flex-none text-sm">
            <RefreshCw className="w-4 h-4 mr-2" /> {t('common.refresh')}
          </Button>
        </div>
      </div>

      {/* Wallet Connect Banner (only when not connected) */}
      {!isConnected && (
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-xl p-4 border border-blue-200 dark:border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">{t('userPage.connectWallet')}</p>
              <p className="text-xs text-slate-500 dark:text-gray-400">{t('userPage.connectWalletDescription')}</p>
            </div>
          </div>
          <Button onClick={onConnectWallet} size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600 text-xs" data-testid="button-connect-cta">
            <Wallet className="w-3 h-3 mr-1" /> {t('common.connect')}
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isConnected && userOverviewLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      )}

      {/* Portfolio Overview - Always show layout */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 sm:w-5 sm:h-5 opacity-80" />
            <span className="text-xs sm:text-sm opacity-80">{t('userPage.totalAssets')}</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono">
            {isConnected ? (userOverview?.totalPortfolioValue || parseFloat(balance || "0").toFixed(2)) : "0.00"} TB
          </p>
          <p className="text-[10px] sm:text-xs opacity-70 mt-1">
            {t('userPage.liquidBalance')}: {isConnected ? (userOverview?.liquidBalance || balance || "0") : "0"} TB
          </p>
        </div>
        
        <div className="bg-white dark:bg-[#151E32] rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
            <span className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">{t('userPage.staking')}</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {isConnected ? (userOverview?.totalStaked || "0") : "0"} TB
          </p>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-1">
            {t('userPage.stakingAPY')} {isConnected ? (userOverview?.stakingRewards?.averageApy || "12.5") : "0.0"}%
          </p>
        </div>
        
        <div className="bg-white dark:bg-[#151E32] rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-emerald-200 dark:border-emerald-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
            <span className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">{t('userPage.unclaimedRewards')}</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-500">
            {isConnected ? (userOverview?.totalUnclaimedRewards || "0") : "0"} TB
          </p>
          <Button 
            size="sm" 
            className="mt-2 w-full bg-emerald-500 hover:bg-emerald-600 text-xs h-7" 
            data-testid="button-claim-all"
            disabled={!isConnected}
          >
            {t('userPage.claimAll')}
          </Button>
        </div>
        
        <div className="bg-white dark:bg-[#151E32] rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
            <span className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">{t('userPage.eventRewards')}</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-yellow-500">
            {isConnected ? (userOverview?.eventRewards?.claimable || "0") : "0"} TB
          </p>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-1">
            {t('userPage.eligibleEvents', { count: isConnected ? (userOverview?.eventRewards?.eligibleEvents || 0) : 0 })}
          </p>
        </div>
      </div>

      {/* Rewards Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Mining Rewards */}
        <div className="bg-white dark:bg-[#151E32] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
              {t('userPage.miningRewards')}
            </h3>
            <Badge variant="secondary" className="text-xs">
              {t('userPage.events', { count: isConnected ? (userMiningRewards?.rewards?.length || 0) : 0 })}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-slate-50 dark:bg-[#0B1120] rounded-lg">
              <p className="text-xs text-slate-500 dark:text-gray-400">{t('userPage.totalEarned')}</p>
              <p className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                {isConnected ? (userOverview?.miningRewards?.total || "0") : "0"} TB
              </p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
              <p className="text-xs text-slate-500 dark:text-gray-400">{t('userPage.unclaimed')}</p>
              <p className="text-lg font-bold font-mono text-blue-500">
                {isConnected ? (userOverview?.miningRewards?.unclaimed || "0") : "0"} TB
              </p>
            </div>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {isConnected && userMiningRewards?.rewards?.slice(0, 5).map((reward) => (
              <div key={reward.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-[#0B1120] rounded-lg text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${reward.claimed ? 'bg-slate-400' : 'bg-blue-500'}`} />
                  <span className="text-slate-600 dark:text-gray-300 text-xs">
                    {reward.source === 'block_production' ? t('userPage.blockProduction') : reward.source === 'validation' ? t('userPage.validation') : t('userPage.feeDistribution')}
                  </span>
                </div>
                <span className={`font-mono font-medium ${reward.claimed ? 'text-slate-500' : 'text-blue-500'}`}>
                  +{reward.amount} TB
                </span>
              </div>
            ))}
            {!isConnected && (
              <p className="text-xs text-slate-400 text-center py-4">{t('userPage.noDataConnectWallet', { section: t('userPage.rewardsSection') })}</p>
            )}
          </div>
        </div>

        {/* Staking Rewards */}
        <div className="bg-white dark:bg-[#151E32] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
              {t('userPage.stakingInterest')}
            </h3>
            <Badge variant="secondary" className="text-xs">
              {t('userPage.positions', { count: isConnected ? (userStakingPositions?.positions?.length || 0) : 0 })}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-slate-50 dark:bg-[#0B1120] rounded-lg">
              <p className="text-xs text-slate-500 dark:text-gray-400">{t('userPage.totalInterestEarned')}</p>
              <p className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                {isConnected ? (userOverview?.stakingRewards?.total || "0") : "0"} TB
              </p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-lg">
              <p className="text-xs text-slate-500 dark:text-gray-400">{t('userPage.pendingRewards')}</p>
              <p className="text-lg font-bold font-mono text-purple-500">
                {isConnected ? (userOverview?.pendingRewards || "0") : "0"} TB
              </p>
            </div>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {isConnected && userStakingPositions?.positions?.map((pos) => (
              <div key={pos.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-[#0B1120] rounded-lg text-sm">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white text-xs">{pos.validatorName}</p>
                  <p className="text-[10px] text-slate-400">{pos.stakedAmount} TB {t('userPage.staked')}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-purple-500 font-medium">+{pos.pendingRewards} TB</p>
                  <p className="text-[10px] text-emerald-500">APY {pos.currentApy}%</p>
                </div>
              </div>
            ))}
            {!isConnected && (
              <p className="text-xs text-slate-400 text-center py-4">{t('userPage.noDataConnectWallet', { section: t('userPage.stakingSection') })}</p>
            )}
          </div>
        </div>
      </div>

      {/* Events & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Event Participation */}
        <div className="bg-white dark:bg-[#151E32] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
              {t('userPage.eventParticipation')}
            </h3>
            <Badge variant="secondary" className="text-xs">
              {t('userPage.events', { count: isConnected ? (userEvents?.summary?.total || 0) : 0 })}
            </Badge>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {isConnected && userEvents?.events?.map((event) => (
              <div key={event.id} className="p-3 bg-slate-50 dark:bg-[#0B1120] rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {getEventTypeLabel(event.eventType)}
                    </Badge>
                    <span className="font-medium text-slate-900 dark:text-white text-sm">{event.eventName}</span>
                  </div>
                  {getStatusBadge(event.status)}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-slate-400">{event.eventDescription}</span>
                  <span className="font-mono font-bold text-yellow-500">{event.rewardAmount} TB</span>
                </div>
                {event.status === 'eligible' && (
                  <Button size="sm" className="w-full mt-2 bg-yellow-500 hover:bg-yellow-600 text-xs h-7">
                    {t('userPage.claimReward')}
                  </Button>
                )}
              </div>
            ))}
            {!isConnected && (
              <p className="text-xs text-slate-400 text-center py-4">{t('userPage.noDataConnectWallet', { section: t('userPage.eventsSection') })}</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-[#151E32] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
              {t('userPage.recentActivity')}
            </h3>
            <Button variant="ghost" size="sm" className="text-xs">
              {t('userPage.viewAll')} <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {isConnected && userActivities?.activities?.slice(0, 8).map((activity) => {
              const IconComponent = getActivityIcon(activity.activityType);
              return (
                <div key={activity.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-[#0B1120] rounded-lg transition-colors">
                  <div className={`p-2 rounded-lg ${
                    activity.category === 'rewards' ? 'bg-emerald-100 dark:bg-emerald-500/20' :
                    activity.category === 'staking' ? 'bg-purple-100 dark:bg-purple-500/20' :
                    activity.category === 'wallet' ? 'bg-blue-100 dark:bg-blue-500/20' :
                    'bg-slate-100 dark:bg-slate-500/20'
                  }`}>
                    <IconComponent className={`w-4 h-4 ${
                      activity.category === 'rewards' ? 'text-emerald-500' :
                      activity.category === 'staking' ? 'text-purple-500' :
                      activity.category === 'wallet' ? 'text-blue-500' :
                      'text-slate-500'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{activity.title}</p>
                    <p className="text-xs text-slate-400">{formatTimeAgo(activity.createdAt)}</p>
                  </div>
                  {activity.amount && (
                    <span className={`font-mono text-sm font-medium ${
                      activity.activityType === 'transfer_out' ? 'text-red-500' : 'text-emerald-500'
                    }`}>
                      {activity.activityType === 'transfer_out' ? '-' : '+'}{activity.amount} TB
                    </span>
                  )}
                </div>
              );
            })}
            {!isConnected && (
              <p className="text-xs text-slate-400 text-center py-4">{t('userPage.noDataConnectWallet', { section: t('userPage.activitySection') })}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: typeof Zap;
  trend?: number;
  color: "blue" | "purple" | "orange" | "green";
}) {
  const colors = {
    blue: "bg-blue-100 dark:bg-blue-500/20 text-blue-500",
    purple: "bg-purple-100 dark:bg-purple-500/20 text-purple-500",
    orange: "bg-orange-100 dark:bg-orange-500/20 text-orange-500",
    green: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500",
  };

  return (
    <div className="bg-white dark:bg-[#151E32] rounded-lg sm:rounded-xl p-3 sm:p-5 border border-slate-200 dark:border-gray-800 shadow-sm">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className={`p-1.5 sm:p-2.5 rounded-md sm:rounded-lg ${colors[color]}`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        {trend !== undefined && (
          <span className={`text-[10px] sm:text-xs font-medium ${trend >= 0 ? "text-emerald-500" : "text-red-500"}`}>
            {trend >= 0 ? "+" : ""}{trend}%
          </span>
        )}
      </div>
      <p className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-400 mb-0.5 sm:mb-1">{title}</p>
      <p className="text-lg sm:text-2xl font-bold font-mono text-slate-900 dark:text-white truncate">{value}</p>
      <p className="text-[10px] sm:text-xs text-slate-400 dark:text-gray-500">{subtitle}</p>
    </div>
  );
}

function WalletSection({
  isConnected,
  address,
  balance,
  onConnectWallet,
}: {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  onConnectWallet: () => void;
}) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("transfer");
  
  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      recipientAddress: "",
      amount: "",
    },
  });

  const watchedAmount = form.watch("amount");
  const numAmount = parseFloat(watchedAmount || "0");
  const burnFee = numAmount * 0.005;
  const networkFee = 0.0001;
  const totalDeduction = numAmount + burnFee + networkFee;
  const hasInsufficientBalance = isConnected && parseFloat(balance || "0") < totalDeduction;

  const onSubmit = (data: TransferFormValues) => {
    if (!isConnected) {
      toast({ title: "지갑 연결 필요", description: "전송을 위해 지갑을 연결해주세요.", variant: "destructive" });
      return;
    }
    toast({ title: "전송 요청됨", description: `${data.amount} TB를 ${data.recipientAddress.slice(0, 10)}...로 전송 중입니다.` });
  };

  const recentTransactions = [
    { hash: "0x1a2b...3c4d", type: "sent", to: "0x8F2e...9B1c", amount: 500, burned: 2.5, time: "5분 전", status: "completed" },
    { hash: "0x5e6f...7g8h", type: "received", from: "0x3D4e...5F6g", amount: 1200, time: "2시간 전", status: "completed" },
    { hash: "0x9i0j...1k2l", type: "staked", validator: "TBURN Foundation", amount: 5000, time: "1일 전", status: "completed" },
  ];

  if (!isConnected) {
    return (
      <section className="space-y-4 sm:space-y-6" data-testid="section-wallet">
        <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] bg-white dark:bg-[#151E32] rounded-xl sm:rounded-2xl border border-slate-200 dark:border-gray-800 p-4 sm:p-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-4 sm:mb-6">
            <Wallet className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 text-center">지갑을 연결하세요</h3>
          <p className="text-sm sm:text-base text-slate-500 dark:text-gray-400 text-center mb-4 sm:mb-6 max-w-md px-2">
            TBURN 토큰을 전송하고 거래 내역을 확인하려면 지갑을 연결해주세요.
          </p>
          <Button onClick={onConnectWallet} className="bg-gradient-to-r from-blue-500 to-purple-600 w-full sm:w-auto" data-testid="button-connect-wallet-section">
            <Wallet className="w-4 h-4 mr-2" /> 지갑 연결
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4 sm:space-y-6" data-testid="section-wallet">
      <div className="flex justify-between items-start flex-wrap gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">지갑 & 전송</h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-gray-400">TBURN 토큰을 안전하게 전송하고 관리하세요.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-3 sm:mb-4">
              <TabsTrigger value="transfer" className="text-sm">전송</TabsTrigger>
              <TabsTrigger value="history" className="text-sm">거래 내역</TabsTrigger>
            </TabsList>

            <TabsContent value="transfer">
              <div className="bg-white dark:bg-[#151E32] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-gray-800 shadow-sm">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="recipientAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 dark:text-gray-300">받는 주소</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="0x..."
                              className="font-mono bg-slate-50 dark:bg-[#0B1120] border-slate-200 dark:border-gray-700"
                              {...field}
                              data-testid="input-recipient"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between">
                            <FormLabel className="text-slate-700 dark:text-gray-300">전송 수량</FormLabel>
                            <span className="text-xs text-slate-500 dark:text-gray-400">
                              잔액: {parseFloat(balance || "0").toFixed(4)} TB
                            </span>
                          </div>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="number"
                                placeholder="0.00"
                                className="font-mono pr-16 bg-slate-50 dark:bg-[#0B1120] border-slate-200 dark:border-gray-700"
                                {...field}
                                data-testid="input-amount"
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
                                TB
                              </span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="bg-slate-50 dark:bg-[#0B1120] rounded-xl p-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-gray-400">전송 수량</span>
                        <span className="font-mono text-slate-800 dark:text-white">{numAmount.toFixed(4)} TB</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-gray-400 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-500" /> 소각 수수료 (0.5%)
                        </span>
                        <span className="font-mono text-orange-500">{burnFee.toFixed(4)} TB</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-gray-400">네트워크 수수료</span>
                        <span className="font-mono text-slate-800 dark:text-white">{networkFee} TB</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-700 dark:text-gray-300">총 차감</span>
                        <span className={`font-mono ${hasInsufficientBalance ? "text-red-500" : "text-slate-900 dark:text-white"}`}>
                          {totalDeduction.toFixed(4)} TB
                        </span>
                      </div>
                      {hasInsufficientBalance && (
                        <div className="flex items-center gap-2 text-xs text-red-500">
                          <AlertTriangle className="w-4 h-4" />
                          잔액이 부족합니다
                        </div>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      disabled={hasInsufficientBalance || !watchedAmount}
                      data-testid="button-submit-transfer"
                    >
                      <Send className="w-4 h-4 mr-2" /> 전송하기
                    </Button>
                  </form>
                </Form>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="bg-white dark:bg-[#151E32] rounded-2xl p-6 border border-slate-200 dark:border-gray-800 shadow-sm">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">최근 거래</h3>
                <div className="space-y-3">
                  {recentTransactions.map((tx, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#0B1120] rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          tx.type === "sent" ? "bg-red-100 dark:bg-red-500/20 text-red-500" :
                          tx.type === "received" ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500" :
                          "bg-blue-100 dark:bg-blue-500/20 text-blue-500"
                        }`}>
                          {tx.type === "sent" ? <ArrowUp className="w-4 h-4" /> :
                           tx.type === "received" ? <ArrowDown className="w-4 h-4" /> :
                           <Lock className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {tx.type === "sent" ? "전송" : tx.type === "received" ? "수신" : "스테이킹"}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-gray-400">{tx.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-mono font-bold ${
                          tx.type === "sent" ? "text-red-500" : "text-emerald-500"
                        }`}>
                          {tx.type === "sent" ? "-" : "+"}{tx.amount} TB
                        </p>
                        {tx.burned && (
                          <p className="text-xs text-orange-500 flex items-center justify-end gap-1">
                            <Flame className="w-3 h-3" /> {tx.burned} TB
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="w-8 h-8" />
              <div>
                <p className="text-sm text-white/70">총 잔액</p>
                <p className="text-3xl font-bold font-mono">
                  {parseFloat(balance || "0").toFixed(4)}
                </p>
              </div>
            </div>
            <p className="text-xs text-white/60 font-mono truncate">{address}</p>
          </div>

          <div className="bg-white dark:bg-[#151E32] rounded-2xl p-6 border border-slate-200 dark:border-gray-800 shadow-sm">
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">빠른 액션</h4>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Copy className="w-4 h-4 mr-2" /> 주소 복사
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" /> 익스플로러에서 보기
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" /> 포트폴리오 분석
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StakingSection({
  isConnected,
  stakingStats,
  validators,
  onConnectWallet,
}: {
  isConnected: boolean;
  stakingStats: StakingStats | null | undefined;
  validators: ApiValidator[];
  onConnectWallet: () => void;
}) {
  const [selectedValidator, setSelectedValidator] = useState<string | null>(null);
  const [delegateAmount, setDelegateAmount] = useState("");
  const { toast } = useToast();

  const handleDelegate = () => {
    if (!selectedValidator || !delegateAmount) {
      toast({ title: "입력 필요", description: "검증자와 수량을 선택해주세요.", variant: "destructive" });
      return;
    }
    toast({ title: "위임 요청됨", description: `${delegateAmount} TB를 위임 중입니다.` });
  };

  const formatStake = (stake: string): string => {
    const num = parseFloat(stake);
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toFixed(0);
  };

  return (
    <section className="space-y-4 sm:space-y-6" data-testid="section-staking">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">스테이킹</h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-gray-400">검증자에게 토큰을 위임하고 보상을 받으세요.</p>
        </div>
        {!isConnected && (
          <Button onClick={onConnectWallet} className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600" data-testid="button-connect-staking">
            <Wallet className="w-4 h-4 mr-2" /> 지갑 연결
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <MetricCard
          title="총 TVL"
          value={formatBurnAmount(stakingStats?.totalValueLocked)}
          subtitle="TB"
          icon={Lock}
          color="blue"
        />
        <MetricCard
          title="평균 APY"
          value={`${stakingStats?.averageApy?.toFixed(1) || "12.5"}%`}
          subtitle="연간 수익률"
          icon={TrendingUp}
          trend={2.3}
          color="green"
        />
        <MetricCard
          title="활성 스테이커"
          value={formatNumber(stakingStats?.totalStakers || 0)}
          subtitle="명"
          icon={Users}
          color="purple"
        />
        <MetricCard
          title="총 보상 분배"
          value={formatBurnAmount(stakingStats?.totalRewardsDistributed)}
          subtitle="TB"
          icon={Award}
          color="orange"
        />
      </div>

      {isConnected && (
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">빠른 위임</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-slate-500 dark:text-gray-400 mb-2 block">검증자 선택</label>
              <select
                className="w-full p-3 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white"
                value={selectedValidator || ""}
                onChange={(e) => setSelectedValidator(e.target.value)}
                data-testid="select-validator"
              >
                <option value="">검증자를 선택하세요</option>
                {validators.slice(0, 10).map((v) => (
                  <option key={v.address} value={v.address}>
                    {v.name} (APY: {stakingStats?.averageApy?.toFixed(1) || "12.5"}%)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-500 dark:text-gray-400 mb-2 block">위임 수량</label>
              <Input
                type="number"
                placeholder="최소 100 TB"
                value={delegateAmount}
                onChange={(e) => setDelegateAmount(e.target.value)}
                className="bg-white dark:bg-[#0B1120] border-slate-200 dark:border-gray-700"
                data-testid="input-delegate-amount"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleDelegate}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
                disabled={!selectedValidator || !delegateAmount}
                data-testid="button-delegate"
              >
                <Lock className="w-4 h-4 mr-2" /> 위임하기
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#151E32] rounded-2xl border border-slate-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-gray-800">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">검증자 목록</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-500 dark:text-gray-400 uppercase bg-slate-50 dark:bg-[#0B1120]">
                <th className="p-4 font-medium">순위</th>
                <th className="p-4 font-medium">검증자</th>
                <th className="p-4 font-medium text-center">AI 점수</th>
                <th className="p-4 font-medium text-right">스테이킹</th>
                <th className="p-4 font-medium text-right">위임자</th>
                <th className="p-4 font-medium text-right">수수료</th>
                <th className="p-4 font-medium text-center">가동률</th>
                <th className="p-4 font-medium text-center">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
              {validators.slice(0, 10).map((validator, index) => (
                <tr key={validator.address} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4 text-slate-500 font-mono">#{index + 1}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://api.dicebear.com/7.x/identicon/svg?seed=${validator.address}`}
                        className="w-10 h-10 rounded-full"
                        alt={validator.name}
                      />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{validator.name}</p>
                        <p className="text-xs text-slate-400">{validator.region}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                      {(validator.aiTrustScore / 100).toFixed(1)}
                    </Badge>
                  </td>
                  <td className="p-4 text-right font-mono text-slate-900 dark:text-white">
                    {formatStake(validator.stake)} TB
                  </td>
                  <td className="p-4 text-right text-slate-600 dark:text-gray-400">
                    {formatNumber(validator.delegators)}
                  </td>
                  <td className="p-4 text-right text-slate-600 dark:text-gray-400">
                    {validator.commission}%
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Progress value={validator.uptime} className="w-16 h-2" />
                      <span className="text-xs text-slate-500">{validator.uptime}%</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedValidator(validator.address);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      data-testid={`button-select-validator-${validator.address}`}
                    >
                      선택
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function GovernanceSection({
  isConnected,
  proposals,
  onConnectWallet,
}: {
  isConnected: boolean;
  proposals: GovernanceProposal[];
  onConnectWallet: () => void;
}) {
  const { toast } = useToast();

  const parseVotes = (votes: string): number => {
    const num = parseFloat(votes);
    return isNaN(num) ? 0 : num;
  };

  const handleVote = (proposalId: string, vote: "for" | "against" | "abstain") => {
    if (!isConnected) {
      toast({ title: "지갑 연결 필요", description: "투표를 위해 지갑을 연결해주세요.", variant: "destructive" });
      return;
    }
    toast({ title: "투표 완료", description: `제안서 #${proposalId}에 투표했습니다.` });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400";
      case "passed": return "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400";
      case "rejected": return "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400";
      default: return "bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400";
    }
  };

  return (
    <section className="space-y-4 sm:space-y-6" data-testid="section-governance">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">거버넌스</h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-gray-400">TBURN 네트워크의 미래를 결정하는 투표에 참여하세요.</p>
        </div>
        {!isConnected && (
          <Button onClick={onConnectWallet} className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600" data-testid="button-connect-governance">
            <Wallet className="w-4 h-4 mr-2" /> 지갑 연결
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
        <MetricCard
          title="활성 제안"
          value={proposals.filter(p => p.status.toLowerCase() === "active").length.toString()}
          subtitle="진행 중"
          icon={Vote}
          color="blue"
        />
        <MetricCard
          title="총 제안"
          value={proposals.length.toString()}
          subtitle="전체"
          icon={Gavel}
          color="purple"
        />
        <MetricCard
          title="참여율"
          value="67.8%"
          subtitle="평균"
          icon={Users}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {proposals.slice(0, 6).map((proposal) => {
          const votesFor = parseVotes(proposal.votesFor);
          const votesAgainst = parseVotes(proposal.votesAgainst);
          const votesAbstain = parseVotes(proposal.votesAbstain);
          const totalVotes = votesFor + votesAgainst + votesAbstain;
          const forPercentage = totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0;
          const againstPercentage = totalVotes > 0 ? (votesAgainst / totalVotes) * 100 : 0;

          return (
            <div
              key={proposal.id}
              className="bg-white dark:bg-[#151E32] rounded-2xl p-6 border border-slate-200 dark:border-gray-800 shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(proposal.status)}>
                    {proposal.status}
                  </Badge>
                  <span className="text-xs text-slate-400">#{proposal.id}</span>
                </div>
                {proposal.aiAnalysis && (
                  <Badge variant="outline" className="text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    AI 분석
                  </Badge>
                )}
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
                {proposal.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-gray-400 mb-4 line-clamp-2">
                {proposal.description}
              </p>

              {proposal.aiAnalysis && (
                <div className="bg-slate-50 dark:bg-[#0B1120] rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Cpu className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium text-slate-600 dark:text-gray-400">AI 분석 결과</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-gray-300">{proposal.aiAnalysis.recommendation}</p>
                  <div className="flex gap-4 mt-2 text-xs">
                    <span className="text-slate-500">신뢰도: {proposal.aiAnalysis.confidence}%</span>
                    <span className="text-slate-500">경제 영향: {proposal.aiAnalysis.economicImpact}%</span>
                  </div>
                </div>
              )}

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-500">찬성 {forPercentage.toFixed(1)}%</span>
                  <span className="text-red-500">반대 {againstPercentage.toFixed(1)}%</span>
                </div>
                <div className="relative h-2 bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-emerald-500 transition-all"
                    style={{ width: `${forPercentage}%` }}
                  />
                  <div
                    className="absolute right-0 top-0 h-full bg-red-500 transition-all"
                    style={{ width: `${againstPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>총 {formatNumber(proposal.totalVoters)}명 참여</span>
                  <span>{proposal.quorumReached ? "정족수 충족" : "정족수 미달"}</span>
                </div>
              </div>

              {proposal.status.toLowerCase() === "active" && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500/30 dark:text-emerald-400"
                    onClick={() => handleVote(proposal.id, "for")}
                    data-testid={`button-vote-for-${proposal.id}`}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" /> 찬성
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400"
                    onClick={() => handleVote(proposal.id, "against")}
                    data-testid={`button-vote-against-${proposal.id}`}
                  >
                    <AlertTriangle className="w-4 h-4 mr-1" /> 반대
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {proposals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-[#151E32] rounded-2xl border border-slate-200 dark:border-gray-800">
          <Gavel className="w-12 h-12 text-slate-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-bold text-slate-600 dark:text-gray-400">활성 제안 없음</h3>
          <p className="text-sm text-slate-400 dark:text-gray-500">현재 진행 중인 거버넌스 제안이 없습니다.</p>
        </div>
      )}
    </section>
  );
}

function NetworkSection({
  networkStats,
  blockFeed,
  shards,
  validators,
}: {
  networkStats: NetworkStats | undefined;
  blockFeed: Block[];
  shards: ShardInfo[];
  validators: ApiValidator[];
}) {
  const stats = [
    {
      label: "TPS",
      value: networkStats?.tps ? formatNumber(networkStats.tps) : "---",
      icon: Zap,
      color: "text-blue-500",
    },
    {
      label: "블록 시간",
      value: networkStats?.avgBlockTime ? `${networkStats.avgBlockTime.toFixed(2)}s` : "0.5s",
      icon: Timer,
      color: "text-purple-500",
    },
    {
      label: "활성 검증자",
      value: networkStats?.activeValidators?.toString() || validators.length.toString(),
      icon: Users,
      color: "text-emerald-500",
    },
    {
      label: "네트워크 가동률",
      value: networkStats?.slaUptime ? `${networkStats.slaUptime.toFixed(2)}%` : "99.99%",
      icon: Activity,
      color: "text-orange-500",
    },
  ];

  return (
    <section className="space-y-4 sm:space-y-6" data-testid="section-network">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">네트워크 상태</h2>
        <p className="text-sm sm:text-base text-slate-500 dark:text-gray-400">TBURN 메인넷의 실시간 상태를 모니터링하세요.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-[#151E32] p-3 sm:p-5 rounded-lg sm:rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm"
            >
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
                <span className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-400 uppercase truncate">{stat.label}</span>
              </div>
              <p className={`text-xl sm:text-3xl font-mono font-bold ${stat.color} truncate`}>
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
        <div className="bg-white dark:bg-[#151E32] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Radio className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 animate-pulse" />
              실시간 블록 피드
            </h3>
          </div>
          <div className="space-y-2 max-h-60 sm:max-h-80 overflow-hidden relative">
            <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-16 bg-gradient-to-t from-white dark:from-[#151E32] to-transparent z-10 pointer-events-none" />
            {blockFeed.map((block, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 sm:p-3 bg-slate-50 dark:bg-[#0B1120] rounded-lg text-xs sm:text-sm animate-fade-in"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-500/20 rounded-md sm:rounded-lg flex items-center justify-center">
                    <Boxes className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-mono font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                      #{formatNumber(block.blockNumber)}
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-400 truncate max-w-[80px] sm:max-w-none">{block.validator}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-600 dark:text-gray-400 text-xs sm:text-sm">
                    {formatNumber(block.transactions)} txns
                  </p>
                  <p className="text-[10px] sm:text-xs text-orange-500 flex items-center justify-end gap-1">
                    <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {block.burned} TB
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#151E32] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-gray-800 shadow-sm">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
            <GitBranch className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
            샤드 상태
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {shards.slice(0, 5).map((shard) => (
              <div
                key={shard.id}
                className="flex items-center justify-between p-2 sm:p-3 bg-slate-50 dark:bg-[#0B1120] rounded-lg"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${
                    shard.status === "active" ? "bg-emerald-500" : "bg-yellow-500"
                  }`} />
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white">{shard.name}</p>
                    <p className="text-[10px] sm:text-xs text-slate-400">{shard.validators} 검증자</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Progress value={shard.load} className="w-12 sm:w-20 h-1.5 sm:h-2" />
                    <span className="text-[10px] sm:text-xs text-slate-500">{shard.load}%</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-slate-400">{formatNumber(shard.transactions)} txns</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#151E32] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-gray-800 shadow-sm">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
          <Network className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
          네트워크 성능
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <div className="text-center p-3 sm:p-4 bg-slate-50 dark:bg-[#0B1120] rounded-lg sm:rounded-xl">
            <p className="text-lg sm:text-2xl font-bold font-mono text-blue-500">{networkStats?.peakTps ? formatNumber(networkStats.peakTps) : "---"}</p>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-400">Peak TPS</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-slate-50 dark:bg-[#0B1120] rounded-lg sm:rounded-xl">
            <p className="text-lg sm:text-2xl font-bold font-mono text-purple-500">{networkStats?.latency || "---"}ms</p>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-400">평균 지연</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-slate-50 dark:bg-[#0B1120] rounded-lg sm:rounded-xl">
            <p className="text-lg sm:text-2xl font-bold font-mono text-emerald-500">{shards.length || 8}</p>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-400">활성 샤드</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-slate-50 dark:bg-[#0B1120] rounded-lg sm:rounded-xl">
            <p className="text-lg sm:text-2xl font-bold font-mono text-orange-500">{networkStats?.blockTimeP99?.toFixed(2) || "0.8"}s</p>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-400">P99 블록 시간</p>
          </div>
        </div>
      </div>
    </section>
  );
}
