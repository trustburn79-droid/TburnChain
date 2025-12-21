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
  Menu, X, Crown, Info, Image, ImageIcon, Plus, Play, Gamepad2, Rocket,
  Home, HelpCircle, ScanLine, FileText, Bug
} from "lucide-react";
import { PhishingWarningBanner } from "@/components/phishing-warning-banner";
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

type Section = "dashboard" | "wallet" | "stakingDashboard" | "delegationValidator" | "defi" | "nft" | "governance" | "network";

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
  recipientAddress: z.string().min(1).regex(/^tb1[a-z0-9]{38}$/, "Address must be a valid 41-character Bech32m address starting with tb1"),
  amount: z.string().min(1).refine((val) => parseFloat(val) > 0),
});

const delegateFormSchema = z.object({
  validatorAddress: z.string().min(1),
  amount: z.string().min(1).refine((val) => parseFloat(val) >= 100),
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

const formatTimeAgo = (timestamp: string, t: (key: string, options?: Record<string, unknown>) => string): string => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return t('userPage.timeAgo.justNow');
  if (diffMins < 60) return t('userPage.timeAgo.minutesAgo', { count: diffMins });
  if (diffHours < 24) return t('userPage.timeAgo.hoursAgo', { count: diffHours });
  return t('userPage.timeAgo.daysAgo', { count: diffDays });
};

export default function UserPage() {
  const getInitialSection = (): Section => {
    const params = new URLSearchParams(window.location.search);
    const section = params.get('section');
    const validSections: Section[] = ["dashboard", "wallet", "stakingDashboard", "delegationValidator", "defi", "nft", "governance", "network"];
    if (section && validSections.includes(section as Section)) {
      return section as Section;
    }
    return "dashboard";
  };
  
  const [activeSection, setActiveSection] = useState<Section>(getInitialSection);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();
  const trustScoreCanvasRef = useRef<HTMLCanvasElement>(null);
  const [blockFeed, setBlockFeed] = useState<Block[]>([]);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleNotificationClick = () => {
    setNotificationsEnabled(!notificationsEnabled);
    toast({
      title: notificationsEnabled ? t('userPage.notifications.disabled') : t('userPage.notifications.enabled'),
      description: notificationsEnabled ? t('userPage.notifications.disabledDesc') : t('userPage.notifications.enabledDesc'),
    });
  };

  const handleSettingsClick = () => {
    toast({
      title: t('userPage.settings.title'),
      description: t('userPage.settings.comingSoon'),
    });
  };
  
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
    toast({ title: t('userPage.toast.refreshing'), description: t('userPage.toast.refreshingDesc') });
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };


  const handleDisconnect = () => {
    disconnect();
    toast({ title: t('userPage.toast.walletDisconnected'), description: t('userPage.toast.walletDisconnectedDesc') });
  };

  const navItems = [
    { id: "dashboard" as Section, label: t('userPage.nav.dashboard'), icon: Shield, badge: null },
    { id: "wallet" as Section, label: t('userPage.nav.walletAndTransfer'), icon: Wallet, badge: null },
    { id: "stakingDashboard" as Section, label: t('userPage.nav.stakingDashboard'), icon: Coins, badge: null },
    { id: "delegationValidator" as Section, label: t('userPage.nav.delegationValidator'), icon: Layers, badge: isConnected ? "Active" : null },
    { id: "defi" as Section, label: "DeFi", icon: TrendingUp, badge: null },
    { id: "nft" as Section, label: "NFT", icon: Image, badge: null },
    { id: "governance" as Section, label: t('userPage.nav.governance'), icon: Gavel, badge: proposals && proposals.length > 0 ? `${proposals.length}` : null },
    { id: "network" as Section, label: t('userPage.nav.network'), icon: Globe, badge: null },
  ];

  const totalBurned = formatBurnAmount(burnStats?.totalBurned);
  const burnPercentage = burnStats?.burnProgress ? Math.min(burnStats.burnProgress * 100, 100) : 0.27;

  const handleNavClick = (sectionId: Section) => {
    setActiveSection(sectionId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans antialiased bg-slate-50 text-slate-800 dark:bg-[#0B1120] dark:text-[#E2E8F0]">
      <PhishingWarningBanner />
      <div className="flex flex-1 overflow-hidden">
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
              <span className="text-xs font-medium text-slate-600 dark:text-gray-300">{t('userPage.sidebar.cumulativeBurned')}</span>
              <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
            </div>
            <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white mb-2">
              {totalBurned} TB
            </div>
            <Progress value={burnPercentage} className="h-2" />
            <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-2">
              {t('userPage.sidebar.targetProgress', { percent: burnPercentage.toFixed(2) })}
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
                <span className="text-slate-600 dark:text-gray-400">{t('userPage.header.block')}:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  #{networkStats?.currentBlockHeight ? formatNumber(networkStats.currentBlockHeight) : "---"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
            {/* Navigation icons */}
            <a href="/" data-testid="link-home">
              <Button variant="ghost" size="icon" className="h-8 w-8 lg:h-9 lg:w-9">
                <Home className="w-4 h-4" />
              </Button>
            </a>
            <a href="/scan" data-testid="link-scan">
              <Button variant="ghost" size="icon" className="h-8 w-8 lg:h-9 lg:w-9">
                <ScanLine className="w-4 h-4" />
              </Button>
            </a>
            <a href="/bug-bounty" data-testid="link-bug-bounty">
              <Button variant="ghost" size="icon" className="h-8 w-8 lg:h-9 lg:w-9">
                <Bug className="w-4 h-4" />
              </Button>
            </a>
            <a href="/security-audit" data-testid="link-security-audit">
              <Button variant="ghost" size="icon" className="h-8 w-8 lg:h-9 lg:w-9">
                <Shield className="w-4 h-4" />
              </Button>
            </a>
            <a href="/token-generator" data-testid="link-token-generator">
              <Button variant="ghost" size="icon" className="h-8 w-8 lg:h-9 lg:w-9">
                <Coins className="w-4 h-4" />
              </Button>
            </a>
            <a href="/nft-marketplace" data-testid="link-nft-marketplace">
              <Button variant="ghost" size="icon" className="h-8 w-8 lg:h-9 lg:w-9">
                <ImageIcon className="w-4 h-4" />
              </Button>
            </a>
            <a href="/qna" data-testid="link-qna">
              <Button variant="ghost" size="icon" className="h-8 w-8 lg:h-9 lg:w-9">
                <HelpCircle className="w-4 h-4" />
              </Button>
            </a>
            <Separator orientation="vertical" className="h-4 sm:h-6 hidden sm:block" />
            <Button variant="ghost" size="icon" onClick={handleRefresh} data-testid="button-refresh-header" className="h-8 w-8 lg:h-9 lg:w-9">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <LanguageSelector />
            <Button variant="ghost" size="icon" onClick={toggleTheme} data-testid="button-theme-toggle" className="h-8 w-8 lg:h-9 lg:w-9">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Separator orientation="vertical" className="h-4 sm:h-6 hidden sm:block" />
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden sm:flex h-8 w-8 lg:h-9 lg:w-9 relative"
              onClick={handleNotificationClick}
              data-testid="button-notifications"
            >
              <Bell className="w-4 h-4" />
              {notificationsEnabled && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden sm:flex h-8 w-8 lg:h-9 lg:w-9"
              onClick={handleSettingsClick}
              data-testid="button-settings"
            >
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
          {activeSection === "stakingDashboard" && (
            <StakingDashboardSection
              isConnected={isConnected}
              stakingStats={stakingStats}
              balance={balance}
              onConnectWallet={() => setWalletModalOpen(true)}
              walletAddress={address}
            />
          )}
          {activeSection === "delegationValidator" && (
            <StakingSection
              isConnected={isConnected}
              stakingStats={stakingStats}
              validators={validators}
              onConnectWallet={() => setWalletModalOpen(true)}
              walletAddress={address}
            />
          )}
          {activeSection === "defi" && (
            <DeFiSection
              isConnected={isConnected}
              balance={balance}
              onConnectWallet={() => setWalletModalOpen(true)}
            />
          )}
          {activeSection === "nft" && (
            <NFTSection
              isConnected={isConnected}
              onConnectWallet={() => setWalletModalOpen(true)}
            />
          )}
          {activeSection === "governance" && (
            <GovernanceSection
              isConnected={isConnected}
              proposals={proposals || []}
              onConnectWallet={() => setWalletModalOpen(true)}
              address={address}
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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isClaimingAll, setIsClaimingAll] = useState(false);

  const handleClaimAll = async () => {
    if (!isConnected || !address) {
      toast({ title: t('userPage.toast.walletRequired'), description: t('userPage.toast.connectFirst'), variant: "destructive" });
      return;
    }
    
    setIsClaimingAll(true);
    try {
      const response = await apiRequest('POST', `/api/user/${address}/claim-all`, {});
      const data = await response.json();
      
      if (data.success) {
        toast({ 
          title: t('userPage.toast.claimSuccess'), 
          description: t('userPage.toast.claimSuccessDesc', { amount: data.totalClaimed || userOverview?.totalUnclaimedRewards || "0" })
        });
        queryClient.invalidateQueries({ queryKey: ['/api/user', address] });
        onRefresh();
      } else {
        throw new Error(data.message || 'Claim failed');
      }
    } catch (error: any) {
      toast({ 
        title: t('userPage.toast.claimError'), 
        description: error?.message || t('userPage.toast.claimErrorDesc'),
        variant: "destructive" 
      });
    } finally {
      setIsClaimingAll(false);
    }
  };

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
            disabled={!isConnected || isClaimingAll}
            onClick={handleClaimAll}
          >
            {isClaimingAll ? (
              <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> {t('userPage.claiming')}</>
            ) : (
              t('userPage.claimAll')
            )}
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
                    <p className="text-xs text-slate-400">{formatTimeAgo(activity.createdAt, t)}</p>
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  const { t } = useTranslation();
  
  const onSubmit = async (data: TransferFormValues) => {
    if (!isConnected || !address) {
      toast({ title: t('userPage.toast.walletRequired'), description: t('userPage.toast.walletRequiredTransfer'), variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/user/${address}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toAddress: data.recipientAddress,
          amount: data.amount,
          burnFee: burnFee.toFixed(6),
          networkFee: networkFee.toFixed(6),
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast({ 
          title: t('userPage.wallet.transferSuccess'), 
          description: `${data.amount} TB → ${data.recipientAddress.slice(0, 15)}...` 
        });
        form.reset();
      } else {
        toast({ 
          title: t('userPage.wallet.transferError'), 
          description: result.error || t('userPage.toast.genericError'), 
          variant: "destructive" 
        });
      }
    } catch {
      toast({ 
        title: t('userPage.wallet.transferError'), 
        description: t('userPage.toast.genericError'), 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const recentTransactions = [
    { hash: "tb1txhash1a2b3c4d5e6f", type: "sent", to: "tb1edmprvaftt65lkp2x", amount: 500, burned: 2.5, time: t('userPage.timeAgo.minutesAgo', { count: 5 }), status: "completed" },
    { hash: "tb1txhash7g8h9i0j1k2l", type: "received", from: "tb1v8fmjvst5spfruj47", amount: 1200, time: t('userPage.timeAgo.hoursAgo', { count: 2 }), status: "completed" },
    { hash: "tb1txhash3m4n5o6p7q8r", type: "staked", validator: "TBURN Foundation", amount: 5000, time: t('userPage.timeAgo.daysAgo', { count: 1 }), status: "completed" },
  ];

  if (!isConnected) {
    return (
      <section className="space-y-4 sm:space-y-6" data-testid="section-wallet">
        <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] bg-white dark:bg-[#151E32] rounded-xl sm:rounded-2xl border border-slate-200 dark:border-gray-800 p-4 sm:p-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-4 sm:mb-6">
            <Wallet className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 text-center">{t('userPage.wallet.connectPrompt')}</h3>
          <p className="text-sm sm:text-base text-slate-500 dark:text-gray-400 text-center mb-4 sm:mb-6 max-w-md px-2">
            {t('userPage.wallet.connectPromptDesc')}
          </p>
          <Button onClick={onConnectWallet} className="bg-gradient-to-r from-blue-500 to-purple-600 w-full sm:w-auto" data-testid="button-connect-wallet-section">
            <Wallet className="w-4 h-4 mr-2" /> {t('userPage.connectWallet')}
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4 sm:space-y-6" data-testid="section-wallet">
      <div className="flex justify-between items-start flex-wrap gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">{t('userPage.wallet.title')}</h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-gray-400">{t('userPage.wallet.connectPromptDesc')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-3 sm:mb-4">
              <TabsTrigger value="transfer" className="text-sm">{t('userPage.transfer')}</TabsTrigger>
              <TabsTrigger value="history" className="text-sm">{t('userPage.recentActivity')}</TabsTrigger>
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
                          <FormLabel className="text-slate-700 dark:text-gray-300">{t('common.address')}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="tb1..."
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
                            <FormLabel className="text-slate-700 dark:text-gray-300">{t('common.amount')}</FormLabel>
                            <span className="text-xs text-slate-500 dark:text-gray-400">
                              {t('common.balance')}: {parseFloat(balance || "0").toFixed(4)} TB
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
                        <span className="text-slate-500 dark:text-gray-400">{t('common.amount')}</span>
                        <span className="font-mono text-slate-800 dark:text-white">{numAmount.toFixed(4)} TB</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-gray-400 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-500" /> {t('userPage.wallet.burnFee')}
                        </span>
                        <span className="font-mono text-orange-500">{burnFee.toFixed(4)} TB</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-gray-400">{t('userPage.wallet.networkFee')}</span>
                        <span className="font-mono text-slate-800 dark:text-white">{networkFee} TB</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-700 dark:text-gray-300">{t('userPage.wallet.totalDeduction')}</span>
                        <span className={`font-mono ${hasInsufficientBalance ? "text-red-500" : "text-slate-900 dark:text-white"}`}>
                          {totalDeduction.toFixed(4)} TB
                        </span>
                      </div>
                      {hasInsufficientBalance && (
                        <div className="flex items-center gap-2 text-xs text-red-500">
                          <AlertTriangle className="w-4 h-4" />
                          {t('userPage.wallet.insufficientBalance')}
                        </div>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      disabled={hasInsufficientBalance || !watchedAmount || isSubmitting}
                      data-testid="button-submit-transfer"
                    >
                      {isSubmitting ? (
                        <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> {t('common.processing')}</>
                      ) : (
                        <><Send className="w-4 h-4 mr-2" /> {t('userPage.transfer')}</>
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="bg-white dark:bg-[#151E32] rounded-2xl p-6 border border-slate-200 dark:border-gray-800 shadow-sm">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">{t('userPage.recentActivity')}</h3>
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
                            {tx.type === "sent" ? t('userPage.wallet.sent') : tx.type === "received" ? t('userPage.wallet.received') : t('userPage.staking')}
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
                <p className="text-sm text-white/70">{t('common.balance')}</p>
                <p className="text-3xl font-bold font-mono">
                  {parseFloat(balance || "0").toFixed(4)}
                </p>
              </div>
            </div>
            <p className="text-xs text-white/60 font-mono truncate">{address}</p>
          </div>

          <div className="bg-white dark:bg-[#151E32] rounded-2xl p-6 border border-slate-200 dark:border-gray-800 shadow-sm">
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">{t('userPage.wallet.quickActions')}</h4>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Copy className="w-4 h-4 mr-2" /> {t('userPage.wallet.copyAddress')}
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" /> {t('userPage.wallet.viewExplorer')}
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" /> {t('userPage.wallet.portfolioAnalysis')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StakingDashboardSection({
  isConnected,
  stakingStats,
  balance,
  onConnectWallet,
  walletAddress,
}: {
  isConnected: boolean;
  stakingStats: StakingStats | null | undefined;
  balance: string | null;
  onConnectWallet: () => void;
  walletAddress: string | null;
}) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<1 | 2 | 3 | null>(null);
  const [stakeAmount, setStakeAmount] = useState("");

  const availableBalance = parseFloat(balance || "0");

  const tierData = {
    tier1: {
      name: t('userPage.validatorTiers.tier1Name'),
      requirement: "200K+ TBURN",
      maxMembers: 512,
      currentMembers: 125,
      apy: 8.01,
      dailyRewards: 250310,
      color: "yellow",
      icon: Crown,
      minStake: 200000
    },
    tier2: {
      name: t('userPage.validatorTiers.tier2Name'),
      requirement: "50K+ TBURN",
      maxMembers: 4488,
      currentMembers: 0,
      apy: 4,
      dailyRewards: 150180,
      color: "emerald",
      icon: Shield,
      minStake: 50000
    },
    tier3: {
      name: t('userPage.validatorTiers.tier3Name'),
      requirement: "100+ TBURN",
      maxMembers: null,
      currentMembers: 5000,
      apy: 5,
      dailyRewards: 100120,
      color: "blue",
      icon: Users,
      minStake: 100
    }
  };

  const handleApply = () => {
    if (!isConnected) {
      toast({ title: t('userPage.validatorTiers.connectRequired'), description: t('userPage.validatorTiers.connectWalletFirst'), variant: "destructive" });
      return;
    }
    if (!selectedTier) {
      toast({ title: t('userPage.validatorTiers.selectTierFirst'), description: t('userPage.validatorTiers.selectTierDesc'), variant: "destructive" });
      return;
    }
    const amount = parseFloat(stakeAmount);
    const minStake = selectedTier === 1 ? tierData.tier1.minStake : selectedTier === 2 ? tierData.tier2.minStake : tierData.tier3.minStake;
    
    if (isNaN(amount) || amount < minStake) {
      toast({ 
        title: t('userPage.validatorTiers.invalidAmount'), 
        description: t('userPage.validatorTiers.minStakeRequired', { amount: minStake.toLocaleString() }), 
        variant: "destructive" 
      });
      return;
    }
    
    const tierName = selectedTier === 1 ? tierData.tier1.name : selectedTier === 2 ? tierData.tier2.name : tierData.tier3.name;
    toast({ 
      title: t('userPage.validatorTiers.applicationSubmitted'), 
      description: t('userPage.validatorTiers.applicationProcessing', { tier: tierName, amount: amount.toLocaleString() })
    });
    setStakeAmount("");
    setSelectedTier(null);
  };

  const handlePercentageClick = (percentage: number) => {
    const amount = (availableBalance * percentage / 100).toFixed(2);
    setStakeAmount(amount);
  };

  return (
    <section className="space-y-6" data-testid="section-staking-dashboard">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {t('userPage.validatorTiers.title')}
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-gray-400">
            {t('userPage.validatorTiers.description')}
          </p>
        </div>
        {!isConnected && (
          <Button onClick={onConnectWallet} className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600" data-testid="button-connect-staking-dashboard">
            <Wallet className="w-4 h-4 mr-2" /> {t('userPage.connectWallet')}
          </Button>
        )}
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Tier 1: Active Committee */}
        <div 
          onClick={() => setSelectedTier(1)}
          className={`relative bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 dark:from-yellow-900/30 dark:to-yellow-800/20 p-6 rounded-2xl border-2 cursor-pointer transition-all ${
            selectedTier === 1 
              ? "border-yellow-500 shadow-lg shadow-yellow-500/20" 
              : "border-yellow-500/30 hover:border-yellow-500/60"
          }`}
          data-testid="tier-card-1"
        >
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-bold text-yellow-500">Tier 1: {tierData.tier1.name}</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-gray-500 mb-4">
            {tierData.tier1.requirement}, {t('userPage.validatorTiers.maxMembers', { count: tierData.tier1.maxMembers })}
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-2xl font-bold text-yellow-500">{tierData.tier1.currentMembers}</p>
              <p className="text-xs text-slate-500 dark:text-gray-400">{t('userPage.validatorTiers.validators')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-500">{tierData.tier1.apy}%</p>
              <p className="text-xs text-slate-500 dark:text-gray-400">APY</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">{(tierData.tier1.dailyRewards / 1000).toFixed(2)}K</p>
              <p className="text-xs text-slate-500 dark:text-gray-400">TBURN/{t('userPage.validatorTiers.day')}</p>
            </div>
          </div>
          {selectedTier === 1 && (
            <div className="absolute top-3 right-3">
              <CheckCircle className="w-6 h-6 text-yellow-500" />
            </div>
          )}
        </div>

        {/* Tier 2: Standby Validators */}
        <div 
          onClick={() => setSelectedTier(2)}
          className={`relative bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 dark:from-emerald-900/30 dark:to-emerald-800/20 p-6 rounded-2xl border-2 cursor-pointer transition-all ${
            selectedTier === 2 
              ? "border-emerald-500 shadow-lg shadow-emerald-500/20" 
              : "border-emerald-500/30 hover:border-emerald-500/60"
          }`}
          data-testid="tier-card-2"
        >
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-bold text-emerald-500">Tier 2: {tierData.tier2.name}</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-gray-500 mb-4">
            {tierData.tier2.requirement}, {t('userPage.validatorTiers.maxMembers', { count: tierData.tier2.maxMembers })}
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-2xl font-bold text-emerald-500">{tierData.tier2.currentMembers}</p>
              <p className="text-xs text-slate-500 dark:text-gray-400">{t('userPage.validatorTiers.validators')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-500">{tierData.tier2.apy}%</p>
              <p className="text-xs text-slate-500 dark:text-gray-400">APY</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">{(tierData.tier2.dailyRewards / 1000).toFixed(2)}K</p>
              <p className="text-xs text-slate-500 dark:text-gray-400">TBURN/{t('userPage.validatorTiers.day')}</p>
            </div>
          </div>
          {selectedTier === 2 && (
            <div className="absolute top-3 right-3">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
            </div>
          )}
        </div>

        {/* Tier 3: Delegators */}
        <div 
          onClick={() => setSelectedTier(3)}
          className={`relative bg-gradient-to-br from-blue-900/20 to-blue-800/10 dark:from-blue-900/30 dark:to-blue-800/20 p-6 rounded-2xl border-2 cursor-pointer transition-all ${
            selectedTier === 3 
              ? "border-blue-500 shadow-lg shadow-blue-500/20" 
              : "border-blue-500/30 hover:border-blue-500/60"
          }`}
          data-testid="tier-card-3"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-bold text-blue-500">Tier 3: {tierData.tier3.name}</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-gray-500 mb-4">
            {tierData.tier3.requirement}, {t('userPage.validatorTiers.unlimited')}
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-500">{(tierData.tier3.currentMembers / 1000).toFixed(2)}K</p>
              <p className="text-xs text-slate-500 dark:text-gray-400">{t('userPage.validatorTiers.delegators')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-500">{tierData.tier3.apy}%</p>
              <p className="text-xs text-slate-500 dark:text-gray-400">APY</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">{(tierData.tier3.dailyRewards / 1000).toFixed(2)}K</p>
              <p className="text-xs text-slate-500 dark:text-gray-400">TBURN/{t('userPage.validatorTiers.day')}</p>
            </div>
          </div>
          {selectedTier === 3 && (
            <div className="absolute top-3 right-3">
              <CheckCircle className="w-6 h-6 text-blue-500" />
            </div>
          )}
        </div>
      </div>

      {/* Application Form */}
      <div className="bg-white dark:bg-[#151E32] rounded-2xl border border-slate-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-gray-800">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">{t('userPage.validatorTiers.applyForm')}</h3>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
            {selectedTier ? t('userPage.validatorTiers.selectedTier', { tier: selectedTier }) : t('userPage.validatorTiers.selectTierAbove')}
          </p>
        </div>

        <div className="p-6">
          {!isConnected ? (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 text-center">
              <Wallet className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <p className="text-yellow-400 font-medium mb-2">{t('userPage.validatorTiers.connectWalletToApply')}</p>
              <p className="text-sm text-slate-500 dark:text-gray-400 mb-4">{t('userPage.validatorTiers.connectWalletDesc')}</p>
              <Button onClick={onConnectWallet} className="bg-gradient-to-r from-blue-500 to-purple-600" data-testid="button-connect-apply">
                <Wallet className="w-4 h-4 mr-2" /> {t('userPage.connectWallet')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-slate-500 dark:text-gray-400">{t('userPage.validatorTiers.stakeAmount')}</label>
                  <span className="text-xs text-slate-400">
                    {t('userPage.validatorTiers.available')}: {availableBalance.toLocaleString()} TB
                  </span>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder={selectedTier === 1 ? "200,000" : selectedTier === 2 ? "50,000" : "100"}
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="text-lg font-mono pr-16 bg-slate-50 dark:bg-gray-800 border-slate-200 dark:border-gray-700"
                    data-testid="input-stake-amount"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-gray-400 font-bold">TB</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                {[25, 50, 75].map((pct) => (
                  <Button
                    key={pct}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePercentageClick(pct)}
                    className="flex-1 font-bold"
                    data-testid={`button-stake-${pct}`}
                  >
                    {pct}%
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePercentageClick(100)}
                  className="flex-1 font-bold text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white"
                  data-testid="button-stake-max"
                >
                  MAX
                </Button>
              </div>

              {selectedTier && (
                <div className={`rounded-xl p-4 space-y-2 ${
                  selectedTier === 1 ? "bg-yellow-50 dark:bg-yellow-500/10" :
                  selectedTier === 2 ? "bg-emerald-50 dark:bg-emerald-500/10" :
                  "bg-blue-50 dark:bg-blue-500/10"
                }`}>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-gray-400">{t('userPage.validatorTiers.selectedTierLabel')}</span>
                    <span className={`font-bold ${
                      selectedTier === 1 ? "text-yellow-500" :
                      selectedTier === 2 ? "text-emerald-500" :
                      "text-blue-500"
                    }`}>
                      Tier {selectedTier}: {selectedTier === 1 ? tierData.tier1.name : selectedTier === 2 ? tierData.tier2.name : tierData.tier3.name}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-gray-400">{t('userPage.validatorTiers.minRequirement')}</span>
                    <span className="font-bold text-slate-800 dark:text-white font-mono">
                      {selectedTier === 1 ? "200,000" : selectedTier === 2 ? "50,000" : "100"} TBURN
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-gray-400">{t('userPage.validatorTiers.estimatedAPY')}</span>
                    <span className="font-bold text-emerald-500">
                      {selectedTier === 1 ? tierData.tier1.apy : selectedTier === 2 ? tierData.tier2.apy : tierData.tier3.apy}%
                    </span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleApply}
                className={`w-full ${
                  selectedTier === 1 ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700" :
                  selectedTier === 2 ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700" :
                  "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                }`}
                disabled={!selectedTier || !stakeAmount || parseFloat(stakeAmount) <= 0}
                data-testid="button-apply-validator"
              >
                <Lock className="w-4 h-4 mr-2" /> 
                {selectedTier === 3 ? t('userPage.validatorTiers.applyDelegator') : t('userPage.validatorTiers.applyValidator')}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Tier Info */}
      <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-400">
            <p className="font-bold mb-1">{t('userPage.validatorTiers.tierInfo')}</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>{t('userPage.validatorTiers.tier1Info')}</li>
              <li>{t('userPage.validatorTiers.tier2Info')}</li>
              <li>{t('userPage.validatorTiers.tier3Info')}</li>
            </ul>
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
  walletAddress,
}: {
  isConnected: boolean;
  stakingStats: StakingStats | null | undefined;
  validators: ApiValidator[];
  onConnectWallet: () => void;
  walletAddress: string | null;
}) {
  const [selectedValidator, setSelectedValidator] = useState<string | null>(null);
  const [delegateAmount, setDelegateAmount] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { t } = useTranslation();

  const selectedValidatorInfo = validators.find(v => v.address === selectedValidator);
  
  const delegateMutation = useMutation({
    mutationFn: async ({ validatorAddress, validatorName, amount }: { validatorAddress: string; validatorName: string; amount: string }) => {
      const response = await apiRequest('POST', `/api/user/${walletAddress}/delegations`, { validatorAddress, validatorName, amount });
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: t('userPage.stakingPage.delegationSuccess', 'Delegation Successful'),
        description: data?.data?.message || t('userPage.stakingPage.delegationCreated', 'Your delegation has been created'),
      });
      setDelegateAmount("");
      setSelectedValidator(null);
      queryClient.invalidateQueries({ queryKey: ["/api/public/v1/validators"] });
    },
    onError: (error: any) => {
      toast({
        title: t('userPage.stakingPage.delegationError', 'Delegation Failed'),
        description: error?.message || t('userPage.stakingPage.delegationFailed', 'Failed to create delegation'),
        variant: "destructive",
      });
    },
  });
  
  const handleDelegate = () => {
    if (!selectedValidator || !delegateAmount || !walletAddress) {
      toast({ title: t('userPage.toast.inputRequired'), description: t('userPage.stakingPage.selectValidatorAndAmount'), variant: "destructive" });
      return;
    }
    
    const amount = parseFloat(delegateAmount);
    if (isNaN(amount) || amount < 100) {
      toast({ 
        title: t('userPage.stakingPage.invalidAmount', 'Invalid Amount'), 
        description: t('userPage.stakingPage.minDelegation', 'Minimum delegation is 100 TBURN'), 
        variant: "destructive" 
      });
      return;
    }
    
    delegateMutation.mutate({
      validatorAddress: selectedValidator,
      validatorName: selectedValidatorInfo?.name || 'Unknown Validator',
      amount: delegateAmount,
    });
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
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">{t('userPage.staking')}</h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-gray-400">{t('userPage.stakingPage.description')}</p>
        </div>
        {!isConnected && (
          <Button onClick={onConnectWallet} className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600" data-testid="button-connect-staking">
            <Wallet className="w-4 h-4 mr-2" /> {t('userPage.connectWallet')}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <MetricCard
          title={t('userPage.stakingPage.totalTVL')}
          value={formatBurnAmount(stakingStats?.totalValueLocked)}
          subtitle="TB"
          icon={Lock}
          color="blue"
        />
        <MetricCard
          title={t('userPage.stakingPage.averageAPY')}
          value={`${stakingStats?.averageApy?.toFixed(1) || "12.5"}%`}
          subtitle={t('userPage.stakingPage.annualReturn')}
          icon={TrendingUp}
          trend={2.3}
          color="green"
        />
        <MetricCard
          title={t('userPage.stakingPage.activeStakers')}
          value={formatNumber(stakingStats?.totalStakers || 0)}
          subtitle=""
          icon={Users}
          color="purple"
        />
        <MetricCard
          title={t('userPage.stakingPage.totalRewardsDistributed')}
          value={formatBurnAmount(stakingStats?.totalRewardsDistributed)}
          subtitle="TB"
          icon={Award}
          color="orange"
        />
      </div>

      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-500/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('userPage.stakingPage.quickDelegation')}</h3>
        </div>
        {!isConnected ? (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 text-center">
            <Wallet className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <p className="text-yellow-400 font-medium mb-2">
              {t('userPage.stakingPage.connectWalletToDelegate', 'Connect Wallet to Delegate')}
            </p>
            <p className="text-sm text-slate-500 dark:text-gray-400 mb-4">
              {t('userPage.stakingPage.connectWalletDesc', 'Please connect your wallet to stake TBURN tokens and earn rewards')}
            </p>
            <Button onClick={onConnectWallet} className="bg-gradient-to-r from-blue-500 to-purple-600" data-testid="button-connect-delegation">
              <Wallet className="w-4 h-4 mr-2" /> {t('userPage.connectWallet')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-slate-500 dark:text-gray-400 mb-2 block">{t('userPage.stakingPage.selectValidator')}</label>
              <select
                className="w-full p-3 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white"
                value={selectedValidator || ""}
                onChange={(e) => setSelectedValidator(e.target.value)}
                data-testid="select-validator"
              >
                <option value="">{t('userPage.stakingPage.selectValidatorPlaceholder')}</option>
                {validators.slice(0, 10).map((v) => (
                  <option key={v.address} value={v.address}>
                    {v.name} (APY: {stakingStats?.averageApy?.toFixed(1) || "12.5"}%)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-500 dark:text-gray-400 mb-2 block">{t('userPage.stakingPage.delegationAmount')}</label>
              <Input
                type="number"
                placeholder={t('userPage.stakingPage.minAmount')}
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
                disabled={!selectedValidator || !delegateAmount || delegateMutation.isPending}
                data-testid="button-delegate"
              >
                {delegateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('userPage.stakingPage.delegating', 'Delegating...')}
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" /> {t('userPage.stakingPage.delegate')}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-[#151E32] rounded-2xl border border-slate-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-gray-800">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">{t('userPage.stakingPage.validatorList')}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-500 dark:text-gray-400 uppercase bg-slate-50 dark:bg-[#0B1120]">
                <th className="p-4 font-medium">{t('userPage.stakingPage.rank')}</th>
                <th className="p-4 font-medium">{t('userPage.stakingPage.validator')}</th>
                <th className="p-4 font-medium text-center">{t('userPage.stakingPage.aiScore')}</th>
                <th className="p-4 font-medium text-right">{t('userPage.staking')}</th>
                <th className="p-4 font-medium text-right">{t('userPage.stakingPage.delegators')}</th>
                <th className="p-4 font-medium text-right">{t('userPage.stakingPage.commission')}</th>
                <th className="p-4 font-medium text-center">{t('userPage.stakingPage.uptime')}</th>
                <th className="p-4 font-medium text-center">{t('userPage.stakingPage.action')}</th>
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
                      {t('userPage.stakingPage.select')}
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
  address,
}: {
  isConnected: boolean;
  proposals: GovernanceProposal[];
  onConnectWallet: () => void;
  address: string | null;
}) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [votingProposal, setVotingProposal] = useState<string | null>(null);

  const parseVotes = (votes: string): number => {
    const num = parseFloat(votes);
    return isNaN(num) ? 0 : num;
  };

  const handleVote = async (proposalId: string, vote: "for" | "against" | "abstain") => {
    if (!isConnected || !address) {
      toast({ title: t('userPage.toast.walletRequired'), description: t('userPage.toast.walletRequiredVote'), variant: "destructive" });
      return;
    }
    
    setVotingProposal(proposalId);
    try {
      const response = await fetch(`/api/governance/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalId,
          vote,
          voterAddress: address,
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast({ 
          title: t('userPage.governancePage.voteSuccess'), 
          description: t('userPage.governancePage.voteSuccessDesc', { id: proposalId, vote: t(`userPage.governancePage.${vote}`) })
        });
      } else {
        toast({ 
          title: t('userPage.governancePage.voteFailed'), 
          description: result.error || t('userPage.toast.genericError'), 
          variant: "destructive" 
        });
      }
    } catch {
      toast({ 
        title: t('userPage.governancePage.voteFailed'), 
        description: t('userPage.toast.genericError'), 
        variant: "destructive" 
      });
    } finally {
      setVotingProposal(null);
    }
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
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">{t('userPage.governance')}</h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-gray-400">{t('userPage.governancePage.description')}</p>
        </div>
        {!isConnected && (
          <Button onClick={onConnectWallet} className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600" data-testid="button-connect-governance">
            <Wallet className="w-4 h-4 mr-2" /> {t('userPage.connectWallet')}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
        <MetricCard
          title={t('userPage.governancePage.activeProposals')}
          value={proposals.filter(p => p.status.toLowerCase() === "active").length.toString()}
          subtitle={t('userPage.governancePage.inProgress')}
          icon={Vote}
          color="blue"
        />
        <MetricCard
          title={t('userPage.governancePage.totalProposals')}
          value={proposals.length.toString()}
          subtitle={t('userPage.governancePage.total')}
          icon={Gavel}
          color="purple"
        />
        <MetricCard
          title={t('userPage.governancePage.participationRate')}
          value="67.8%"
          subtitle={t('userPage.governancePage.average')}
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
                    {t('userPage.governancePage.aiAnalysis')}
                  </Badge>
                )}
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
                {t(`governance.proposals.${proposal.id}.title`, proposal.title)}
              </h3>
              <p className="text-sm text-slate-500 dark:text-gray-400 mb-4 line-clamp-2">
                {t(`governance.proposals.${proposal.id}.description`, proposal.description)}
              </p>

              {proposal.aiAnalysis && (
                <div className="bg-slate-50 dark:bg-[#0B1120] rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Cpu className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium text-slate-600 dark:text-gray-400">{t('userPage.governancePage.aiAnalysisResult')}</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-gray-300">{t(`governance.proposals.${proposal.id}.aiRecommendation`, proposal.aiAnalysis.recommendation)}</p>
                  <div className="flex gap-4 mt-2 text-xs">
                    <span className="text-slate-500">{t('userPage.governancePage.confidence')}: {proposal.aiAnalysis.confidence}%</span>
                    <span className="text-slate-500">{t('userPage.governancePage.economicImpact')}: {proposal.aiAnalysis.economicImpact}%</span>
                  </div>
                </div>
              )}

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-500">{t('userPage.governancePage.for')} {forPercentage.toFixed(1)}%</span>
                  <span className="text-red-500">{t('userPage.governancePage.against')} {againstPercentage.toFixed(1)}%</span>
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
                  <span>{t('userPage.governancePage.totalParticipants', { count: proposal.totalVoters })}</span>
                  <span>{proposal.quorumReached ? t('userPage.governancePage.quorumReached') : t('userPage.governancePage.quorumNotReached')}</span>
                </div>
              </div>

              {proposal.status.toLowerCase() === "active" && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500/30 dark:text-emerald-400"
                    onClick={() => handleVote(proposal.id, "for")}
                    disabled={votingProposal === proposal.id}
                    data-testid={`button-vote-for-${proposal.id}`}
                  >
                    {votingProposal === proposal.id ? (
                      <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-1" />
                    )}
                    {t('userPage.governancePage.for')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400"
                    onClick={() => handleVote(proposal.id, "against")}
                    disabled={votingProposal === proposal.id}
                    data-testid={`button-vote-against-${proposal.id}`}
                  >
                    {votingProposal === proposal.id ? (
                      <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 mr-1" />
                    )}
                    {t('userPage.governancePage.against')}
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
          <h3 className="text-lg font-bold text-slate-600 dark:text-gray-400">{t('userPage.governancePage.noActiveProposals')}</h3>
          <p className="text-sm text-slate-400 dark:text-gray-500">{t('userPage.governancePage.noActiveProposalsDesc')}</p>
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
  const { t } = useTranslation();
  
  const stats = [
    {
      label: "TPS",
      value: networkStats?.tps ? formatNumber(networkStats.tps) : "---",
      icon: Zap,
      color: "text-blue-500",
    },
    {
      label: t('userPage.networkPage.blockTime'),
      value: networkStats?.avgBlockTime ? `${networkStats.avgBlockTime.toFixed(2)}s` : "0.5s",
      icon: Timer,
      color: "text-purple-500",
    },
    {
      label: t('userPage.networkPage.activeValidators'),
      value: networkStats?.activeValidators?.toString() || validators.length.toString(),
      icon: Users,
      color: "text-emerald-500",
    },
    {
      label: t('userPage.networkPage.networkUptime'),
      value: networkStats?.slaUptime ? `${(networkStats.slaUptime / 100).toFixed(2)}%` : "99.99%",
      icon: Activity,
      color: "text-orange-500",
    },
  ];

  return (
    <section className="space-y-4 sm:space-y-6" data-testid="section-network">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">{t('userPage.networkStatus')}</h2>
        <p className="text-sm sm:text-base text-slate-500 dark:text-gray-400">{t('userPage.networkPage.description')}</p>
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
              {t('userPage.networkPage.realtimeBlockFeed')}
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
            {t('userPage.networkPage.shardStatus')}
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
                    <p className="text-[10px] sm:text-xs text-slate-400">{shard.validators} {t('userPage.stakingPage.validator')}</p>
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
          {t('userPage.networkPage.networkPerformance')}
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <div className="text-center p-3 sm:p-4 bg-slate-50 dark:bg-[#0B1120] rounded-lg sm:rounded-xl">
            <p className="text-lg sm:text-2xl font-bold font-mono text-blue-500">{networkStats?.peakTps ? formatNumber(networkStats.peakTps) : "---"}</p>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-400">Peak TPS</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-slate-50 dark:bg-[#0B1120] rounded-lg sm:rounded-xl">
            <p className="text-lg sm:text-2xl font-bold font-mono text-purple-500">{networkStats?.latency || "---"}ms</p>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-400">{t('userPage.networkPage.avgLatency')}</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-slate-50 dark:bg-[#0B1120] rounded-lg sm:rounded-xl">
            <p className="text-lg sm:text-2xl font-bold font-mono text-emerald-500">{shards.length || 8}</p>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-400">{t('userPage.networkPage.activeShards')}</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-slate-50 dark:bg-[#0B1120] rounded-lg sm:rounded-xl">
            <p className="text-lg sm:text-2xl font-bold font-mono text-orange-500">{networkStats?.blockTimeP99?.toFixed(2) || "0.8"}s</p>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-400">{t('userPage.networkPage.p99BlockTime')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

interface DexStatsResponse {
  totalPools: number;
  totalTvlUsd: string;
  totalVolume24h: string;
  totalFees24h: string;
  totalSwaps24h: number;
  totalLiquidityProviders: number;
}

interface DexPool {
  id: string;
  name: string;
  symbol: string;
  token0Symbol: string;
  token1Symbol: string;
  tvlUsd: string;
  volume24h: string;
  totalApy: number;
  status: string;
}

interface LendingStats {
  totalValueLockedUsd: string;
  totalBorrowedUsd: string;
  totalMarkets: number;
  activeMarkets: number;
  avgSupplyRate: number;
  avgBorrowRate: number;
  avgUtilization: number;
  totalSupplied: string;
}

interface LendingMarket {
  id: string;
  assetSymbol: string;
  assetName: string;
  totalSupply: string;
  supplyRate: number;
  borrowRateVariable: number;
}

function formatUsdValue(usdStr: string | null | undefined): string {
  if (!usdStr) return "$0.00";
  try {
    const value = parseFloat(usdStr);
    if (isNaN(value) || value === 0) return "$0.00";
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  } catch {
    return "$0.00";
  }
}

function formatApyBps(bps: number): string {
  return `${(bps / 100).toFixed(2)}%`;
}

function DeFiSection({
  isConnected,
  balance,
  onConnectWallet,
}: {
  isConnected: boolean;
  balance: string | null;
  onConnectWallet: () => void;
}) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'swap' | 'bridge'>('swap');
  const [payAmount, setPayAmount] = useState('1000');
  const [receiveAmount, setReceiveAmount] = useState('1245.50');

  const { data: dexStats } = useQuery<DexStatsResponse>({
    queryKey: ["/api/dex/stats"],
    staleTime: 30000,
    refetchInterval: 30000,
  });

  const { data: dexPools } = useQuery<DexPool[]>({
    queryKey: ["/api/dex/pools"],
    staleTime: 30000,
    refetchInterval: 30000,
  });

  const { data: lendingStats } = useQuery<LendingStats>({
    queryKey: ["/api/lending/stats"],
    staleTime: 30000,
    refetchInterval: 30000,
  });

  const { data: lendingMarkets } = useQuery<LendingMarket[]>({
    queryKey: ["/api/lending/markets"],
    staleTime: 30000,
    refetchInterval: 30000,
  });

  const updateSwapCalc = (value: string) => {
    setPayAmount(value);
    const numValue = parseFloat(value) || 0;
    setReceiveAmount((numValue * 1.2455).toFixed(2));
  };

  const topPools = useMemo(() => {
    if (!dexPools) return [];
    return dexPools
      .filter(p => p.status === 'active')
      .sort((a, b) => parseFloat(b.tvlUsd || '0') - parseFloat(a.tvlUsd || '0'))
      .slice(0, 5);
  }, [dexPools]);

  const topMarkets = useMemo(() => {
    if (!lendingMarkets?.length) return [];
    return lendingMarkets
      .filter(m => m.supplyRate > 0)
      .sort((a, b) => b.supplyRate - a.supplyRate)
      .slice(0, 3);
  }, [lendingMarkets]);

  const totalTvl = useMemo(() => {
    const dexTvl = parseFloat(dexStats?.totalTvlUsd || '0');
    const lendingTvl = parseFloat(lendingStats?.totalValueLockedUsd || '0');
    return dexTvl + lendingTvl;
  }, [dexStats, lendingStats]);

  return (
    <section className="space-y-4 sm:space-y-6" data-testid="section-defi">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">{t('userPage.defi.title')}</h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-gray-400">{t('userPage.defi.subtitle')}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <a href="/app/dex" className="text-xs px-3 py-1.5 bg-blue-500/10 text-blue-500 rounded-full font-bold hover:bg-blue-500/20 transition-colors">
            {t('userPage.defi.dex')} →
          </a>
          <a href="/app/lending" className="text-xs px-3 py-1.5 bg-purple-500/10 text-purple-500 rounded-full font-bold hover:bg-purple-500/20 transition-colors">
            {t('userPage.defi.lending')} →
          </a>
          <a href="/app/yield-farming" className="text-xs px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full font-bold hover:bg-emerald-500/20 transition-colors">
            {t('userPage.defi.yield')} →
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white/90 dark:bg-[#151E32]/70 backdrop-blur-xl p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-white/5 relative overflow-hidden">
          <p className="text-sm text-slate-500 dark:text-gray-400">{t('userPage.defi.totalValueLocked')}</p>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-mono mt-1">
            $764.2M
          </h3>
          <p className="text-xs text-slate-400 mt-2">{t('userPage.defi.tvlSubtitle')}</p>
        </div>
        <div className="bg-white/90 dark:bg-[#151E32]/70 backdrop-blur-xl p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-white/5">
          <p className="text-sm text-slate-500 dark:text-gray-400">{t('userPage.defi.tradingVolume24h')}</p>
          <h3 className="text-lg sm:text-xl font-bold text-blue-500 font-mono mt-1">
            $87.5M
          </h3>
          <p className="text-xs text-emerald-500 mt-2">
            {dexStats?.totalSwaps24h && dexStats.totalSwaps24h < 10000000 ? `${formatNumber(dexStats.totalSwaps24h)} ${t('userPage.defi.swaps')}` : '847,592 스왑'}
          </p>
        </div>
        <div className="bg-white/90 dark:bg-[#151E32]/70 backdrop-blur-xl p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-white/5">
          <p className="text-sm text-slate-500 dark:text-gray-400">{t('userPage.defi.activePools')}</p>
          <h3 className="text-lg sm:text-xl font-bold text-purple-500 font-mono mt-1">
            {dexStats?.totalPools && dexStats.totalPools > 1 ? dexStats.totalPools : 24}
          </h3>
          <p className="text-xs text-slate-400 mt-2">
            {dexStats?.totalLiquidityProviders && dexStats.totalLiquidityProviders < 1000000 ? `${formatNumber(dexStats.totalLiquidityProviders)} ${t('userPage.defi.lps')}` : '28,547 유동성 공급자'}
          </p>
        </div>
        <div className="bg-white/90 dark:bg-[#151E32]/70 backdrop-blur-xl p-4 sm:p-6 rounded-2xl border-l-4 border-orange-500 border border-slate-200 dark:border-white/5">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-500 dark:text-gray-400">{t('userPage.defi.feesBurned24h')}</p>
            <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-orange-500 font-mono mt-1">
            $124.5K
          </h3>
          <p className="text-xs text-slate-400 mt-2">{t('userPage.defi.autoBurn')}: 0.5%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-8">
        <div className="xl:col-span-1">
          <div className="bg-white/90 dark:bg-[#151E32]/70 backdrop-blur-xl rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-white/5 shadow-2xl">
            <div className="flex p-1 bg-slate-100 dark:bg-gray-900 rounded-xl mb-6">
              <button 
                onClick={() => setActiveTab('swap')} 
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'swap' ? 'bg-white dark:bg-[#151E32] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-gray-400'}`}
              >
                {t('userPage.defi.swap')}
              </button>
              <button 
                onClick={() => setActiveTab('bridge')} 
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'bridge' ? 'bg-white dark:bg-[#151E32] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-gray-400'}`}
              >
                {t('userPage.defi.bridge')}
              </button>
            </div>

            {activeTab === 'swap' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-slate-500 dark:text-gray-400">{t('userPage.defi.pay')}</span>
                  <span className="text-xs text-slate-500 dark:text-gray-400 cursor-pointer">
                    {t('userPage.defi.balance')}: <span className="text-blue-500 font-bold">{balance ? parseFloat(balance).toFixed(2) : '12,500.00'}</span>
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-[#0B1120] p-4 rounded-2xl border border-slate-200 dark:border-gray-700">
                  <div className="flex justify-between mb-2">
                    <input 
                      type="number" 
                      placeholder="0.0" 
                      className="bg-transparent text-xl sm:text-2xl font-mono font-bold text-slate-900 dark:text-white focus:outline-none w-2/3"
                      value={payAmount}
                      onChange={(e) => updateSwapCalc(e.target.value)}
                    />
                    <button className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold">T</div>
                      <span className="font-bold text-slate-900 dark:text-white">TBURN</span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                  <div className="text-right text-xs text-slate-400">≈ ${(parseFloat(payAmount) * 1.25 || 0).toFixed(2)}</div>
                </div>

                <div className="flex justify-center -my-3 z-10 relative">
                  <button className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#151E32] border-4 border-white dark:border-[#0B1120] flex items-center justify-center text-slate-500 dark:text-gray-400 shadow-sm hover:rotate-180 transition-transform duration-300">
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-slate-500 dark:text-gray-400">{t('userPage.defi.receive')}</span>
                </div>

                <div className="bg-slate-50 dark:bg-[#0B1120] p-4 rounded-2xl border border-slate-200 dark:border-gray-700">
                  <div className="flex justify-between mb-2">
                    <input 
                      type="number" 
                      placeholder="0.0" 
                      className="bg-transparent text-xl sm:text-2xl font-mono font-bold text-slate-900 dark:text-white focus:outline-none w-2/3"
                      value={receiveAmount}
                      readOnly
                    />
                    <button className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm">
                      <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">U</div>
                      <span className="font-bold text-slate-900 dark:text-white">USDC</span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                  <div className="text-right text-xs text-slate-400">≈ ${receiveAmount}</div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 text-sm space-y-2 border border-blue-100 dark:border-blue-900/30">
                  <div className="flex justify-between text-slate-500 dark:text-gray-400">
                    <span>{t('userPage.defi.rate')}</span>
                    <span className="font-mono">1 TBURN ≈ 1.25 USDC</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-gray-400">
                    <span>{t('userPage.defi.networkFee')}</span>
                    <span className="font-mono text-slate-800 dark:text-white">$0.00036 <span className="line-through text-xs text-slate-400">$5.00</span></span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-orange-500 flex items-center gap-1">
                      <Flame className="w-3 h-3" /> {t('userPage.defi.autoBurn')} (0.5%)
                    </span>
                    <span className="font-mono font-bold text-orange-500">- {(parseFloat(payAmount) * 0.005 || 0).toFixed(1)} TB</span>
                  </div>
                </div>

                {isConnected ? (
                  <Button className="w-full py-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30">
                    {t('userPage.defi.swapImmediately')}
                  </Button>
                ) : (
                  <Button onClick={onConnectWallet} className="w-full py-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30">
                    {t('userPage.defi.connectToSwap')}
                  </Button>
                )}
              </div>
            )}

            {activeTab === 'bridge' && (
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-[#0B1120] p-4 rounded-xl border border-slate-200 dark:border-gray-700">
                  <p className="text-xs text-slate-500 mb-2">{t('userPage.defi.fromNetwork')}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white text-sm">E</div>
                      <span className="font-bold text-slate-900 dark:text-white">{t('userPage.defi.ethereumMainnet')}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div className="flex justify-center -my-2">
                  <ArrowDown className="w-4 h-4 text-slate-400" />
                </div>

                <div className="bg-slate-50 dark:bg-[#0B1120] p-4 rounded-xl border border-blue-500/50 ring-1 ring-blue-500/20">
                  <p className="text-xs text-slate-500 mb-2">{t('userPage.defi.toNetwork')}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center text-white font-bold">T</div>
                      <span className="font-bold text-slate-900 dark:text-white">{t('userPage.defi.tburnChain')}</span>
                    </div>
                    <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">{t('userPage.defi.fastest')}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-100 dark:bg-gray-800 rounded-xl text-center">
                  <p className="text-xs text-slate-500 dark:text-gray-400">{t('userPage.defi.estimatedArrival')}</p>
                  <p className="text-xl font-mono font-bold text-slate-900 dark:text-white">~2 {t('userPage.defi.mins')}</p>
                </div>

                {isConnected ? (
                  <Button className="w-full py-6 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-lg">
                    {t('userPage.defi.bridgeAssets')}
                  </Button>
                ) : (
                  <Button onClick={onConnectWallet} className="w-full py-6 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-lg">
                    {t('userPage.defi.connectToBridge')}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-2 space-y-4 sm:space-y-6">
          <div className="bg-white/90 dark:bg-[#151E32]/70 backdrop-blur-xl rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-white/5">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" /> {t('userPage.defi.topPools')}
              </h3>
              <a href="/app/dex#pools" className="text-sm text-blue-500 hover:underline">{t('userPage.defi.viewAll')} →</a>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-500 dark:text-gray-400 text-xs uppercase border-b border-slate-200 dark:border-gray-800">
                    <th className="pb-3 font-medium">{t('userPage.defi.pair')}</th>
                    <th className="pb-3 font-medium text-right">{t('userPage.defi.tvl')}</th>
                    <th className="pb-3 font-medium text-right hidden sm:table-cell">{t('userPage.defi.volume24h')}</th>
                    <th className="pb-3 font-medium text-right">{t('userPage.defi.apy')}</th>
                    <th className="pb-3 font-medium text-center">{t('userPage.defi.action')}</th>
                  </tr>
                </thead>
                <tbody className="text-slate-800 dark:text-white text-sm divide-y divide-slate-100 dark:divide-gray-800">
                  {topPools.length > 0 ? topPools.map((pool, index) => (
                    <tr key={pool.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-4 flex items-center gap-2 sm:gap-3">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-orange-500 border-2 border-white dark:border-[#151E32] flex items-center justify-center text-white text-[8px] font-bold">
                            {pool.token0Symbol?.[0] || 'T'}
                          </div>
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-indigo-500 border-2 border-white dark:border-[#151E32] flex items-center justify-center text-white text-[8px] sm:text-[10px]">
                            {pool.token1Symbol?.[0] || 'U'}
                          </div>
                        </div>
                        <span className="font-bold text-xs sm:text-sm">{pool.token0Symbol}-{pool.token1Symbol}</span>
                        {index === 0 && (
                          <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded font-bold hidden sm:inline">{t('userPage.defi.top')}</span>
                        )}
                      </td>
                      <td className="py-4 text-right font-mono text-xs sm:text-sm">{formatUsdValue(pool.tvlUsd)}</td>
                      <td className="py-4 text-right font-mono text-xs sm:text-sm hidden sm:table-cell">{formatUsdValue(pool.volume24h)}</td>
                      <td className="py-4 text-right">
                        <span className="font-bold text-emerald-500 text-xs sm:text-sm">{formatApyBps(pool.totalApy)}</span>
                      </td>
                      <td className="py-4 text-center">
                        <a href={`/app/dex#pools`}>
                          <Button size="sm" variant="outline" className="text-[10px] sm:text-xs px-2 sm:px-3">
                            {t('userPage.defi.deposit')}
                          </Button>
                        </a>
                      </td>
                    </tr>
                  )) : (
                    [
                      { pair: 'TBURN-USDC', tvl: '$124.5M', volume: '$12.1M', apr: '45.2%' },
                      { pair: 'TBURN-ETH', tvl: '$85.2M', volume: '$8.4M', apr: '38.1%' },
                      { pair: 'TBURN-BTC', tvl: '$62.8M', volume: '$5.2M', apr: '32.5%' },
                    ].map((pool, index) => (
                      <tr key={index} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="py-4 flex items-center gap-2 sm:gap-3">
                          <div className="flex -space-x-2">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-orange-500 border-2 border-white dark:border-[#151E32]"></div>
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-indigo-500 border-2 border-white dark:border-[#151E32] flex items-center justify-center text-white text-[8px] sm:text-[10px]">
                              {pool.pair.split('-')[1][0]}
                            </div>
                          </div>
                          <span className="font-bold text-xs sm:text-sm">{pool.pair}</span>
                        </td>
                        <td className="py-4 text-right font-mono text-xs sm:text-sm">{pool.tvl}</td>
                        <td className="py-4 text-right font-mono text-xs sm:text-sm hidden sm:table-cell">{pool.volume}</td>
                        <td className="py-4 text-right">
                          <span className="font-bold text-emerald-500 text-xs sm:text-sm">{pool.apr}</span>
                        </td>
                        <td className="py-4 text-center">
                          <a href="/app/dex#pools">
                            <Button size="sm" variant="outline" className="text-[10px] sm:text-xs px-2 sm:px-3">
                              Deposit
                            </Button>
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white/90 dark:bg-[#151E32]/70 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-white/5">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-slate-500 dark:text-gray-400">Supply Market (Earn)</h4>
                <a href="/app/lending" className="text-xs text-blue-500 hover:underline">View All →</a>
              </div>
              <div className="space-y-3">
                {topMarkets.length > 0 ? topMarkets.map((market, index) => {
                  const colors = ['bg-indigo-500', 'bg-slate-800', 'bg-orange-500'];
                  return (
                    <div key={market.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full ${colors[index % 3]} flex items-center justify-center text-white text-[10px]`}>
                          {market.assetSymbol[0]}
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">{market.assetSymbol}</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-500">{formatApyBps(market.supplyRate)} APY</span>
                    </div>
                  );
                }) : (
                  <>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px]">U</div>
                        <span className="font-bold text-slate-900 dark:text-white">USDC</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-500">8.50% APY</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-white text-[10px]">E</div>
                        <span className="font-bold text-slate-900 dark:text-white">ETH</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-500">4.20% APY</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-[10px]">B</div>
                        <span className="font-bold text-slate-900 dark:text-white">BTC</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-500">3.80% APY</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white/90 dark:bg-[#151E32]/70 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-white/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-orange-500/10"></div>
              <div className="relative">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-bold text-slate-500 dark:text-gray-400">Yield Farming</h4>
                  <a href="/app/yield-farming" className="text-xs text-blue-500 hover:underline">View →</a>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-mono">18.5%</h3>
                <p className="text-xs text-slate-500 mb-4">Top APY • 12 active vaults</p>
                {isConnected ? (
                  <a href="/app/yield-farming">
                    <Button className="w-full py-2 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 shadow-lg shadow-emerald-500/20">
                      Explore Vaults
                    </Button>
                  </a>
                ) : (
                  <Button onClick={onConnectWallet} variant="outline" className="w-full py-2">
                    Connect Wallet
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mt-6">
        <a href="/app/liquid-staking" className="flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-[#151E32]/70 backdrop-blur-xl rounded-xl border border-slate-200 dark:border-white/5 hover:border-blue-500/50 transition-colors">
          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Coins className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Liquid Staking</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">stTBURN</p>
          </div>
        </a>
        <a href="/app/dex#swap" className="flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-[#151E32]/70 backdrop-blur-xl rounded-xl border border-slate-200 dark:border-white/5 hover:border-purple-500/50 transition-colors">
          <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Instant Swap</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">0 Slippage</p>
          </div>
        </a>
      </div>

      <p className="text-center text-xs text-slate-400 dark:text-gray-600 mt-8">
        Powered by TBURN Triple-Band AI Orchestration | Instant Finality (&lt;1s)
      </p>
    </section>
  );
}

interface NftOverview {
  totalVolume24h: string;
  totalVolume24hUsd: string;
  salesCount24h: number;
  activeListings: number;
  totalCollections: number;
  verifiedCollections: number;
  totalItems: number;
  activeTraders: number;
  trendingCollections: Array<{
    id: string;
    name: string;
    symbol: string;
    imageUrl: string | null;
    floorPrice: string;
    volume24h: string;
    verified: boolean;
  }>;
}

interface LaunchpadOverview {
  totalProjects: number;
  activeProjects: number;
  upcomingProjects: number;
  completedProjects: number;
  totalRaised: string;
  totalMinted: number;
  uniqueParticipants: number;
}

interface LaunchpadProject {
  id: string;
  name: string;
  symbol: string;
  imageUrl: string | null;
  status: string;
  totalSupply: string;
  mintPrice: string;
  totalMinted: number;
  totalRaised: string;
  launchDate: string | null;
  endDate: string | null;
  category: string | null;
  featured: boolean;
}

interface GamefiOverview {
  totalProjects: number;
  activeProjects: number;
  totalPlayers: number;
  activePlayers24h: number;
  totalVolume: string;
  dailyVolume: string;
  totalRewardsDistributed: string;
  activeTournaments: number;
}

interface GamefiProject {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  category: string;
  status: string;
  totalPlayers: number;
  activePlayers24h: number;
  rating: number;
  playToEarnEnabled: boolean;
  stakingEnabled: boolean;
  tournamentEnabled: boolean;
}

function formatNftAmount(wei: string | null | undefined, decimals: number = 18): string {
  if (!wei || wei === "0") return "0";
  try {
    const value = parseFloat(wei) / Math.pow(10, decimals);
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toFixed(2);
  } catch {
    return "0";
  }
}

function NFTSection({
  isConnected,
  onConnectWallet,
}: {
  isConnected: boolean;
  onConnectWallet: () => void;
}) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'nft' | 'launchpad' | 'gamefi'>('nft');

  const { data: nftOverview } = useQuery<NftOverview>({
    queryKey: ["/api/nft/stats"],
    staleTime: 30000,
    refetchInterval: 30000,
  });

  const { data: gamefiOverview } = useQuery<GamefiOverview>({
    queryKey: ["/api/gamefi/stats"],
    staleTime: 30000,
    refetchInterval: 30000,
  });

  const { data: gamefiProjects } = useQuery<GamefiProject[]>({
    queryKey: ["/api/gamefi/projects"],
    staleTime: 30000,
    refetchInterval: 30000,
  });

  const trendingCollections = useMemo(() => {
    return [
      { id: '1', name: 'Cyber Punk Origins', symbol: 'CPO', floorPrice: '450000000000000000000', volume24h: '12500000000000000000000', imageUrl: 'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?q=80&w=1000&auto=format&fit=crop', verified: true },
      { id: '2', name: 'Abstract Minds', symbol: 'AM', floorPrice: '120000000000000000000', volume24h: '5200000000000000000000', imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop', verified: true },
      { id: '3', name: 'Space Walkers', symbol: 'SW', floorPrice: '85000000000000000000', volume24h: '3200000000000000000000', imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000&auto=format&fit=crop', verified: true },
    ];
  }, []);

  const featuredGames = useMemo(() => {
    if (gamefiProjects?.length) {
      return gamefiProjects.filter(p => p.status === 'active').slice(0, 4);
    }
    return [];
  }, [gamefiProjects]);

  return (
    <section className="space-y-6 sm:space-y-8" data-testid="section-nft">
      {/* Header with Links */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4 overflow-x-auto pb-2">
          <button 
            onClick={() => setActiveTab('nft')}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'nft' 
                ? 'bg-violet-500/10 text-violet-500 ring-1 ring-violet-500/50' 
                : 'text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800'
            }`}
          >
            {t('userPage.nft.nftMarket')}
          </button>
          <button 
            onClick={() => setActiveTab('launchpad')}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'launchpad' 
                ? 'bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/50' 
                : 'text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800'
            }`}
          >
            {t('userPage.nft.launchpad')}
          </button>
          <button 
            onClick={() => setActiveTab('gamefi')}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'gamefi' 
                ? 'bg-pink-500/10 text-pink-500 ring-1 ring-pink-500/50' 
                : 'text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800'
            }`}
          >
            {t('userPage.nft.gamefi')}
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          <a href="/nft-marketplace" className="text-xs px-3 py-1.5 bg-violet-500/10 text-violet-500 rounded-full font-bold hover:bg-violet-500/20 transition-colors">
            {t('userPage.nft.marketplace')} →
          </a>
          <a href="/nft-marketplace?tab=launchpad" className="text-xs px-3 py-1.5 bg-amber-500/10 text-amber-500 rounded-full font-bold hover:bg-amber-500/20 transition-colors">
            {t('userPage.nft.launchpad')} →
          </a>
          <a href="/nft-marketplace?tab=gamefi" className="text-xs px-3 py-1.5 bg-pink-500/10 text-pink-500 rounded-full font-bold hover:bg-pink-500/20 transition-colors">
            {t('userPage.nft.gamefi')} →
          </a>
        </div>
      </div>

      {/* NFT Market Section */}
      {activeTab === 'nft' && (
        <div className="space-y-8">
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/90 dark:bg-[#151E32]/70 backdrop-blur-xl p-4 rounded-xl text-center border border-slate-200 dark:border-white/5">
              <p className="text-xs text-slate-500 dark:text-gray-400">{t('userPage.nft.volume24h')}</p>
              <p className="text-xl font-bold text-violet-500 font-mono">
                {nftOverview?.totalVolume24h ? `${formatNftAmount(nftOverview.totalVolume24h)} TB` : '12.5K TB'}
              </p>
            </div>
            <div className="bg-white/90 dark:bg-[#151E32]/70 backdrop-blur-xl p-4 rounded-xl text-center border border-slate-200 dark:border-white/5">
              <p className="text-xs text-slate-500 dark:text-gray-400">{t('userPage.nft.activeListings')}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                {nftOverview?.activeListings ? formatNumber(nftOverview.activeListings) : '2,450'}
              </p>
            </div>
            <div className="bg-white/90 dark:bg-[#151E32]/70 backdrop-blur-xl p-4 rounded-xl text-center border border-slate-200 dark:border-white/5">
              <p className="text-xs text-slate-500 dark:text-gray-400">{t('userPage.nft.collections')}</p>
              <p className="text-xl font-bold text-emerald-500 font-mono">
                {nftOverview?.totalCollections || 128}
              </p>
            </div>
            <div className="bg-white/90 dark:bg-[#151E32]/70 backdrop-blur-xl p-4 rounded-xl text-center border border-slate-200 dark:border-white/5">
              <p className="text-xs text-slate-500 dark:text-gray-400">{t('userPage.nft.sales24h')}</p>
              <p className="text-xl font-bold text-amber-500 font-mono">
                {nftOverview?.salesCount24h || 342}
              </p>
            </div>
          </div>

          {/* Hero Banner */}
          <div className="relative rounded-3xl overflow-hidden h-64 md:h-80 group">
            <img 
              src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2874&auto=format&fit=crop" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt="NFT Hero"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-transparent opacity-90"></div>
            <div className="absolute bottom-0 left-0 p-6 sm:p-8">
              <span className="bg-violet-500 text-white text-xs font-bold px-2 py-1 rounded mb-2 inline-block">{t('userPage.nft.trending')} #1</span>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-2 font-mono">
                {trendingCollections[0]?.name || 'Cyber Punk Origins'}
              </h2>
              <p className="text-gray-300 max-w-lg mb-4 text-sm md:text-base">{t('userPage.nft.heroDescription')}</p>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <a href="/nft-marketplace">
                  <Button className="bg-white text-black hover:bg-gray-200 font-bold px-4 sm:px-6 py-2">
                    {t('userPage.nft.viewCollection')}
                  </Button>
                </a>
                <a href="/nft-marketplace">
                  <Button variant="outline" className="backdrop-blur-md bg-white/10 text-white border-white/20 hover:bg-white/20 font-bold px-4 sm:px-6 py-2">
                    {t('userPage.nft.browseAll')}
                  </Button>
                </a>
              </div>
            </div>
          </div>

          {/* Trending Collections */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" /> {t('userPage.nft.trendingCollections')}
              </h3>
              <a href="/nft-marketplace" className="text-sm text-violet-500 hover:underline">{t('userPage.defi.viewAll')} →</a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {trendingCollections.map((collection, index) => (
                <a 
                  key={collection.id}
                  href="/nft-marketplace"
                  className="bg-white/90 dark:bg-[#151E32]/70 backdrop-blur-xl rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5 cursor-pointer group hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:border-violet-500/50 transition-all block"
                >
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={collection.imageUrl || 'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?q=80&w=1000&auto=format&fit=crop'} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      alt={collection.name}
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 dark:text-white">{collection.name}</h4>
                      {collection.verified && (
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex justify-between items-end mt-2">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-gray-400">{t('userPage.nft.floor')}</p>
                        <p className="font-mono font-bold text-violet-500">{formatNftAmount(collection.floorPrice)} TB</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 dark:text-gray-400">{t('userPage.nft.vol24h')}</p>
                        <p className="font-mono font-bold text-slate-700 dark:text-gray-200">{formatNftAmount(collection.volume24h)} TB</p>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
              
              {/* Create NFT Card */}
              <a href="/nft-marketplace" className="bg-white/90 dark:bg-[#151E32]/70 backdrop-blur-xl rounded-2xl p-6 border-2 border-dashed border-slate-300 dark:border-gray-700 flex flex-col justify-center items-center text-center hover:border-violet-500 transition-colors">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <Plus className="w-8 h-8 text-slate-400" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white">{t('userPage.nft.createNft')}</h4>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 mb-4">{t('userPage.nft.mintFee')}: <span className="text-emerald-500">$0.001</span></p>
                <Button className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-bold hover:opacity-80">
                  {t('userPage.nft.startMinting')}
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Launchpad Section */}
      {activeTab === 'launchpad' && (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Rocket className="w-6 h-6" /> {t('userPage.nft.tburnLaunchpad')}
              </h2>
              <p className="text-slate-500 dark:text-gray-400 text-sm">{t('userPage.nft.launchpadSubtitle')}</p>
            </div>
            <div className="flex gap-2 text-sm">
              <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full font-bold border border-green-500/20">
                {t('userPage.nft.live')}: 2
              </span>
              <span className="px-3 py-1 bg-slate-100 dark:bg-gray-800 text-slate-500 rounded-full font-bold">
                {t('userPage.nft.upcoming')}: 5
              </span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/90 dark:bg-[#151E32]/70 backdrop-blur-xl p-4 rounded-xl text-center border border-slate-200 dark:border-white/5">
              <p className="text-xs text-slate-500 dark:text-gray-400">{t('userPage.nft.totalRaised')}</p>
              <p className="text-xl font-bold text-amber-500 font-mono">2.5M TB</p>
            </div>
            <div className="bg-white/90 dark:bg-[#151E32]/70 backdrop-blur-xl p-4 rounded-xl text-center border border-slate-200 dark:border-white/5">
              <p className="text-xs text-slate-500 dark:text-gray-400">{t('userPage.nft.totalProjects')}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white font-mono">24</p>
            </div>
            <div className="bg-white/90 dark:bg-[#151E32]/70 backdrop-blur-xl p-4 rounded-xl text-center border border-slate-200 dark:border-white/5">
              <p className="text-xs text-slate-500 dark:text-gray-400">{t('userPage.nft.totalMinted')}</p>
              <p className="text-xl font-bold text-emerald-500 font-mono">125K</p>
            </div>
            <div className="bg-white/90 dark:bg-[#151E32]/70 backdrop-blur-xl p-4 rounded-xl text-center border border-slate-200 dark:border-white/5">
              <p className="text-xs text-slate-500 dark:text-gray-400">{t('userPage.nft.participants')}</p>
              <p className="text-xl font-bold text-blue-500 font-mono">8.2K</p>
            </div>
          </div>

          {/* Live Sale */}
          <a href="/nft-marketplace?tab=launchpad" className="block">
            <div className="bg-white/90 dark:bg-[#151E32]/70 backdrop-blur-xl rounded-2xl p-6 lg:p-8 border-l-4 border-amber-500 border border-slate-200 dark:border-white/5 relative overflow-hidden hover:border-amber-500/50 transition-colors">
              <div className="absolute top-4 right-4">
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">{t('userPage.nft.liveNow')}</span>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-3xl font-bold shrink-0">
                  NG
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">NexGen DeFi Protocol</h3>
                  <p className="text-slate-500 dark:text-gray-400 text-sm mt-1 mb-4 max-w-2xl">{t('userPage.nft.aiYieldFarming')}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div>
                      <p className="text-xs text-slate-400">{t('userPage.nft.tokenPrice')}</p>
                      <p className="font-mono font-bold text-slate-800 dark:text-white">1 NGD = 0.5 TB</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">{t('userPage.nft.totalRaise')}</p>
                      <p className="font-mono font-bold text-slate-800 dark:text-white">500,000 TB</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">{t('userPage.nft.minTrustScore')}</p>
                      <p className="font-mono font-bold text-blue-500">85+</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">{t('userPage.nft.endsIn')}</p>
                      <p className="font-mono font-bold text-amber-500">04h 12m 30s</p>
                    </div>
                  </div>

                  <div className="mb-2 flex justify-between text-xs font-bold">
                    <span className="text-slate-500 dark:text-gray-300">{t('userPage.nft.progress')}</span>
                    <span className="text-amber-500">78%</span>
                  </div>
                  <Progress value={78} className="h-3 mb-6" />

                  {isConnected ? (
                    <Button className="w-full md:w-auto px-8 py-3 bg-amber-500 text-black font-bold hover:bg-yellow-400 shadow-lg shadow-yellow-500/20">
                      {t('userPage.nft.participateNow')}
                    </Button>
                  ) : (
                    <Button onClick={(e) => { e.preventDefault(); onConnectWallet(); }} className="w-full md:w-auto px-8 py-3 bg-amber-500 text-black font-bold hover:bg-yellow-400">
                      {t('userPage.nft.connectWallet')}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </a>

          {/* Upcoming Sales */}
          <div className="bg-white/90 dark:bg-[#151E32]/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-200 dark:border-white/5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white">{t('userPage.nft.upcomingSales')}</h3>
              <a href="/nft-marketplace?tab=launchpad" className="text-sm text-amber-500 hover:underline">{t('userPage.defi.viewAll')} →</a>
            </div>
            <div className="space-y-4">
              {[
                { name: 'Galaxy War P2E', category: 'GameFi', startsIn: '2 days' },
                { name: 'EcoTrace', category: 'RWA / Supply Chain', startsIn: '5 days' },
              ].map((sale, index) => (
                <a 
                  key={index}
                  href="/nft-marketplace?tab=launchpad"
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-gray-800 hover:border-amber-500/50 transition-colors block"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-indigo-900 flex items-center justify-center">
                      {index === 0 ? <Gamepad2 className="w-6 h-6 text-white" /> : <Boxes className="w-6 h-6 text-white" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{sale.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-gray-400">{sale.category} • {t('userPage.nft.startsIn')} {sale.startsIn}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs font-bold">
                    {t('userPage.nft.viewCollection')}
                  </Button>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* GameFi Section */}
      {activeTab === 'gamefi' && (
        <div className="space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/90 dark:bg-[#151E32]/70 backdrop-blur-xl p-4 rounded-xl text-center border border-slate-200 dark:border-white/5">
              <p className="text-xs text-slate-500 dark:text-gray-400">{t('userPage.nft.totalPlayers')}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                {gamefiOverview?.totalPlayers ? formatNumber(gamefiOverview.totalPlayers) : '1.2M+'}
              </p>
            </div>
            <div className="bg-white/90 dark:bg-[#151E32]/70 backdrop-blur-xl p-4 rounded-xl text-center border border-slate-200 dark:border-white/5">
              <p className="text-xs text-slate-500 dark:text-gray-400">{t('userPage.nft.dailyActive')}</p>
              <p className="text-xl font-bold text-pink-500 font-mono">
                {gamefiOverview?.activePlayers24h ? formatNumber(gamefiOverview.activePlayers24h) : '45K'}
              </p>
            </div>
            <div className="bg-white/90 dark:bg-[#151E32]/70 backdrop-blur-xl p-4 rounded-xl text-center border border-slate-200 dark:border-white/5">
              <p className="text-xs text-slate-500 dark:text-gray-400">{t('userPage.nft.prizePools')}</p>
              <p className="text-xl font-bold text-emerald-500 font-mono">
                {gamefiOverview?.totalRewardsDistributed ? `${formatNftAmount(gamefiOverview.totalRewardsDistributed)} TB` : '250K TB'}
              </p>
            </div>
            <div className="bg-white/90 dark:bg-[#151E32]/70 backdrop-blur-xl p-4 rounded-xl text-center border border-slate-200 dark:border-white/5">
              <p className="text-xs text-slate-500 dark:text-gray-400">{t('userPage.nft.activeGames')}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                {gamefiOverview?.activeProjects || 24}
              </p>
            </div>
          </div>

          {/* Featured Game */}
          <a href="/nft-marketplace?tab=gamefi" className="block">
            <div className="bg-white/90 dark:bg-[#151E32]/70 backdrop-blur-xl rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-pink-500/30 hover:border-pink-500/60 transition-colors">
              <div className="h-64 md:h-auto relative">
                <img 
                  src={featuredGames[0]?.imageUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop"}
                  className="absolute inset-0 w-full h-full object-cover"
                  alt={featuredGames[0]?.name || "Game"}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-transparent"></div>
              </div>
              <div className="p-6 sm:p-8 flex flex-col justify-center">
                <span className="text-pink-500 text-xs font-bold tracking-widest uppercase mb-2">{t('userPage.nft.featuredGames')}</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                  {featuredGames[0]?.name || 'TBURN Racers: Velocity'}
                </h3>
                <p className="text-slate-500 dark:text-gray-400 mb-6 text-sm">
                  {featuredGames[0] ? (
                    <>
                      {featuredGames[0].category} • {formatNumber(featuredGames[0].totalPlayers)} {t('userPage.nft.players')}
                      {featuredGames[0].playToEarnEnabled && ' • Play-to-Earn'}
                    </>
                  ) : (
                    t('userPage.nft.heroDescription')
                  )}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button className="flex-1 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold shadow-lg shadow-pink-500/30">
                    <Play className="w-4 h-4 mr-2" /> {t('userPage.nft.playNow')}
                  </Button>
                  <Button variant="outline" className="px-4 py-3 font-bold">
                    {t('userPage.nft.marketplace')}
                  </Button>
                </div>
              </div>
            </div>
          </a>

          {/* Featured Games List */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white">{t('userPage.nft.featuredGames')}</h3>
              <a href="/nft-marketplace?tab=gamefi" className="text-sm text-pink-500 hover:underline">{t('userPage.defi.viewAll')} →</a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredGames.length > 0 ? featuredGames.slice(0, 4).map((game) => (
                <a 
                  key={game.id}
                  href="/nft-marketplace?tab=gamefi"
                  className="bg-white/90 dark:bg-[#151E32]/70 backdrop-blur-xl p-4 rounded-xl border border-slate-200 dark:border-white/5 hover:border-pink-500/50 transition-colors block"
                >
                  <div className="w-full h-32 mb-3 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center overflow-hidden">
                    {game.imageUrl ? (
                      <img src={game.imageUrl} alt={game.name} className="w-full h-full object-cover" />
                    ) : (
                      <Gamepad2 className="w-12 h-12 text-white" />
                    )}
                  </div>
                  <p className="font-bold text-sm text-slate-800 dark:text-white">{game.name}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-slate-500">{game.category}</p>
                    <div className="flex items-center gap-1 text-xs text-pink-500">
                      <Users className="w-3 h-3" />
                      {formatNumber(game.activePlayers24h)}
                    </div>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {game.playToEarnEnabled && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded">P2E</span>
                    )}
                    {game.stakingEnabled && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/10 text-blue-500 rounded">Staking</span>
                    )}
                    {game.tournamentEnabled && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-500 rounded">{t('userPage.nft.tournaments')}</span>
                    )}
                  </div>
                </a>
              )) : (
                [
                  { name: 'TBURN Racers', category: 'Racing', players: '125K' },
                  { name: 'Crypto Warriors', category: 'RPG', players: '89K' },
                  { name: 'Block Battles', category: 'Strategy', players: '45K' },
                  { name: 'NFT Quest', category: 'Adventure', players: '32K' },
                ].map((game, index) => (
                  <a 
                    key={index}
                    href="/nft-marketplace?tab=gamefi"
                    className="bg-white/90 dark:bg-[#151E32]/70 backdrop-blur-xl p-4 rounded-xl border border-slate-200 dark:border-white/5 hover:border-pink-500/50 transition-colors block"
                  >
                    <div className="w-full h-32 mb-3 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <Gamepad2 className="w-12 h-12 text-white" />
                    </div>
                    <p className="font-bold text-sm text-slate-800 dark:text-white">{game.name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-slate-500">{game.category}</p>
                      <div className="flex items-center gap-1 text-xs text-pink-500">
                        <Users className="w-3 h-3" />
                        {game.players}
                      </div>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>

          {/* Tournaments Banner */}
          <div className="bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 backdrop-blur-xl rounded-2xl p-6 border border-pink-500/30">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-pink-500" />
                  {t('userPage.nft.tournaments')}
                </h4>
                <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                  {gamefiOverview?.activeTournaments || 5} {t('userPage.nft.tournaments').toLowerCase()}
                </p>
              </div>
              <a href="/nft-marketplace?tab=gamefi">
                <Button className="bg-pink-500 hover:bg-pink-600 text-white font-bold">
                  {t('userPage.defi.viewAll')}
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
