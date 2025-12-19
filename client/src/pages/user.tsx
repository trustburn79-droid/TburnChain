import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  LogOut, Settings, Bell, Star, Boxes, GitBranch, Timer, CircleDot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatNumber } from "@/lib/formatters";
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
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const trustScoreCanvasRef = useRef<HTMLCanvasElement>(null);
  const [blockFeed, setBlockFeed] = useState<Block[]>([]);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  
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

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({ title: "주소 복사됨", description: "지갑 주소가 클립보드에 복사되었습니다." });
    }
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

  return (
    <div className="flex h-screen overflow-hidden font-sans antialiased bg-slate-50 text-slate-800 dark:bg-[#0B1120] dark:text-[#E2E8F0]">
      <aside className="w-72 flex flex-col z-20 transition-colors duration-300 border-r bg-white border-slate-200 dark:bg-[#0F172A] dark:border-gray-800">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100 dark:border-gray-800">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-500/20">
            T
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
              TBURN
            </h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-emerald-500 font-medium">Mainnet v4.0.2</span>
            </div>
          </div>
        </div>

        {isConnected ? (
          <div className="p-4 border-b border-slate-100 dark:border-gray-800">
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 p-4 rounded-xl border border-blue-200/50 dark:border-blue-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <img
                    src={`https://api.dicebear.com/7.x/identicon/svg?seed=${address}`}
                    alt="Wallet"
                    className="w-10 h-10 rounded-full bg-white dark:bg-gray-700"
                  />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">
                      {memberInfo?.memberTier === "validator" ? "Validator" : memberInfo?.memberTier || "Member"}
                    </p>
                    <p className="text-sm font-mono font-bold text-slate-800 dark:text-white">
                      {formatAddress(address || "")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopyAddress} data-testid="button-copy-address">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowBalance(!showBalance)} data-testid="button-toggle-balance">
                    {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 dark:text-gray-400">잔액</p>
                <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                  {showBalance ? `${parseFloat(balance || "0").toFixed(4)} TB` : "••••••"}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3 text-xs"
                onClick={handleDisconnect}
                data-testid="button-disconnect-wallet"
              >
                <LogOut className="w-3 h-3 mr-2" /> 연결 해제
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 border-b border-slate-100 dark:border-gray-800">
            <Button
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-blue-500/20"
              onClick={() => setWalletModalOpen(true)}
              disabled={isConnecting}
              data-testid="button-connect-wallet"
            >
              {isConnecting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> 연결 중...</>
              ) : (
                <><Wallet className="w-4 h-4 mr-2" /> 지갑 연결</>
              )}
            </Button>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                data-testid={`nav-${item.id}`}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
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

      <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-50 dark:bg-[#0B1120] transition-colors duration-300">
        <div className="absolute inset-0 opacity-30 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        <header className="h-16 border-b border-slate-200 dark:border-gray-800 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-xl flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-full border border-emerald-200 dark:border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse" />
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Mainnet Live
              </span>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" />
                <span className="text-slate-600 dark:text-gray-400">TPS:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {networkStats?.tps ? formatNumber(networkStats.tps) : "---"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-purple-500" />
                <span className="text-slate-600 dark:text-gray-400">블록:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  #{networkStats?.currentBlockHeight ? formatNumber(networkStats.currentBlockHeight) : "---"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleRefresh} data-testid="button-refresh-header">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme} data-testid="button-theme-toggle">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="ghost" size="icon">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 scroll-smooth relative z-0">
          {activeSection === "dashboard" && (
            <DashboardSection
              isConnected={isConnected}
              address={address}
              balance={balance}
              networkStats={networkStats}
              stakingStats={stakingStats}
              burnStats={burnStats}
              validators={validators}
              trustScoreCanvasRef={trustScoreCanvasRef}
              avgTrustScore={avgTrustScore}
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
  stakingStats,
  burnStats,
  validators,
  trustScoreCanvasRef,
  avgTrustScore,
  onRefresh,
  onConnectWallet,
}: {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  networkStats: NetworkStats | undefined;
  stakingStats: StakingStats | null | undefined;
  burnStats: BurnStats | undefined;
  validators: ApiValidator[];
  trustScoreCanvasRef: React.RefObject<HTMLCanvasElement>;
  avgTrustScore: number;
  onRefresh: () => void;
  onConnectWallet: () => void;
}) {
  const trustLevel = avgTrustScore >= 90 ? "Excellent" : avgTrustScore >= 70 ? "Good" : "Fair";
  const trustColor = avgTrustScore >= 90 ? "text-emerald-500" : avgTrustScore >= 70 ? "text-blue-500" : "text-yellow-500";

  return (
    <section className="space-y-6" data-testid="section-dashboard">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {isConnected ? "나의 대시보드" : "TBURN 대시보드"}
          </h2>
          <p className="text-slate-500 dark:text-gray-400">
            {isConnected ? "자산 현황과 네트워크 상태를 한눈에 확인하세요." : "지갑을 연결하여 모든 기능을 이용하세요."}
          </p>
        </div>
        <div className="flex gap-2">
          {!isConnected && (
            <Button onClick={onConnectWallet} className="bg-gradient-to-r from-blue-500 to-purple-600" data-testid="button-connect-dashboard">
              <Wallet className="w-4 h-4 mr-2" /> 지갑 연결
            </Button>
          )}
          <Button variant="outline" onClick={onRefresh} data-testid="button-refresh">
            <RefreshCw className="w-4 h-4 mr-2" /> 새로고침
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="네트워크 TPS"
          value={networkStats?.tps ? formatNumber(networkStats.tps) : "---"}
          subtitle="초당 트랜잭션"
          icon={Zap}
          trend={12.5}
          color="blue"
        />
        <MetricCard
          title="활성 검증자"
          value={networkStats?.activeValidators?.toString() || validators.length.toString()}
          subtitle="전체 검증자"
          icon={Users}
          color="purple"
        />
        <MetricCard
          title="24시간 소각량"
          value={formatBurnAmount(burnStats?.burnedToday)}
          subtitle="TB"
          icon={Flame}
          trend={8.3}
          color="orange"
        />
        <MetricCard
          title="평균 블록 시간"
          value={networkStats?.avgBlockTime ? `${networkStats.avgBlockTime.toFixed(2)}s` : "0.5s"}
          subtitle="초"
          icon={Timer}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#151E32] rounded-2xl p-6 border border-slate-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI 신뢰 점수</h3>
            <Badge variant="secondary" className={trustColor}>
              {trustLevel}
            </Badge>
          </div>
          <div className="flex flex-col items-center justify-center relative py-4">
            <canvas ref={trustScoreCanvasRef} width={200} height={200} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-5xl font-bold text-slate-800 dark:text-white font-mono">{avgTrustScore}</span>
              <span className={`text-sm mt-1 font-bold ${trustColor}`}>{trustLevel}</span>
            </div>
          </div>
          <div className="space-y-3 mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-gray-400">보안 점수</span>
              <span className="font-medium text-slate-800 dark:text-white">96/100</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-gray-400">안정성 점수</span>
              <span className="font-medium text-slate-800 dark:text-white">94/100</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-gray-400">성능 점수</span>
              <span className="font-medium text-slate-800 dark:text-white">98/100</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#151E32] rounded-2xl p-6 border border-slate-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-500/20 rounded-xl">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-gray-400">총 소각량</p>
                <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                  {formatBurnAmount(burnStats?.totalBurned)} TB
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-gray-400">7일 소각량</span>
                <span className="font-mono text-slate-800 dark:text-white">{formatBurnAmount(burnStats?.burned7d)} TB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-gray-400">30일 소각량</span>
                <span className="font-mono text-slate-800 dark:text-white">{formatBurnAmount(burnStats?.burned30d)} TB</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#151E32] rounded-2xl p-6 border border-slate-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-xl">
                <Coins className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-gray-400">스테이킹 TVL</p>
                <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                  {formatBurnAmount(stakingStats?.totalValueLocked)} TB
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-gray-400">평균 APY</span>
                <span className="font-mono text-emerald-500 font-bold">{stakingStats?.averageApy?.toFixed(1) || "12.5"}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-gray-400">총 스테이커</span>
                <span className="font-mono text-slate-800 dark:text-white">{formatNumber(stakingStats?.totalStakers || 0)}</span>
              </div>
            </div>
          </div>

          {isConnected && (
            <>
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">내 잔액</p>
                    <p className="text-2xl font-bold font-mono">
                      {parseFloat(balance || "0").toFixed(4)} TB
                    </p>
                  </div>
                </div>
                <Button variant="secondary" className="w-full mt-2" size="sm">
                  <Send className="w-4 h-4 mr-2" /> 전송하기
                </Button>
              </div>

              <div className="bg-white dark:bg-[#151E32] rounded-2xl p-6 border border-slate-200 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl">
                    <Award className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-gray-400">보상 수령 가능</p>
                    <p className="text-2xl font-bold font-mono text-emerald-500">
                      {formatBurnAmount(stakingStats?.totalRewardsDistributed)} TB
                    </p>
                  </div>
                </div>
                <Button className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600" size="sm" data-testid="button-claim-rewards">
                  <Coins className="w-4 h-4 mr-2" /> 보상 수령
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-[#151E32] rounded-2xl p-6 border border-slate-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">상위 검증자</h3>
          <Button variant="ghost" size="sm">
            전체 보기 <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-500 dark:text-gray-400 uppercase border-b border-slate-100 dark:border-gray-800">
                <th className="pb-3 font-medium">검증자</th>
                <th className="pb-3 font-medium text-center">AI 점수</th>
                <th className="pb-3 font-medium text-right">스테이킹</th>
                <th className="pb-3 font-medium text-right">수수료</th>
                <th className="pb-3 font-medium text-center">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
              {validators.slice(0, 5).map((validator, index) => (
                <tr key={validator.address} className="text-sm">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 flex items-center justify-center text-xs font-bold text-slate-400">
                        #{index + 1}
                      </span>
                      <img
                        src={`https://api.dicebear.com/7.x/identicon/svg?seed=${validator.address}`}
                        className="w-8 h-8 rounded-full"
                        alt={validator.name}
                      />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{validator.name}</p>
                        <p className="text-xs text-slate-400">{validator.region}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                      {(validator.aiTrustScore / 100).toFixed(1)}
                    </Badge>
                  </td>
                  <td className="py-3 text-right font-mono text-slate-900 dark:text-white">
                    {formatBurnAmount(validator.stake)}
                  </td>
                  <td className="py-3 text-right text-slate-500 dark:text-gray-400">
                    {validator.commission}%
                  </td>
                  <td className="py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      validator.status === "active"
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                        : "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${validator.status === "active" ? "bg-emerald-500" : "bg-yellow-500"}`} />
                      {validator.status === "active" ? "활성" : "대기"}
                    </span>
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
    <div className="bg-white dark:bg-[#151E32] rounded-xl p-5 border border-slate-200 dark:border-gray-800 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium ${trend >= 0 ? "text-emerald-500" : "text-red-500"}`}>
            {trend >= 0 ? "+" : ""}{trend}%
          </span>
        )}
      </div>
      <p className="text-xs text-slate-500 dark:text-gray-400 mb-1">{title}</p>
      <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs text-slate-400 dark:text-gray-500">{subtitle}</p>
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
      <section className="space-y-6" data-testid="section-wallet">
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-[#151E32] rounded-2xl border border-slate-200 dark:border-gray-800 p-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-6">
            <Wallet className="w-10 h-10 text-blue-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">지갑을 연결하세요</h3>
          <p className="text-slate-500 dark:text-gray-400 text-center mb-6 max-w-md">
            TBURN 토큰을 전송하고 거래 내역을 확인하려면 지갑을 연결해주세요.
          </p>
          <Button onClick={onConnectWallet} className="bg-gradient-to-r from-blue-500 to-purple-600" data-testid="button-connect-wallet-section">
            <Wallet className="w-4 h-4 mr-2" /> 지갑 연결
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6" data-testid="section-wallet">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">지갑 & 전송</h2>
          <p className="text-slate-500 dark:text-gray-400">TBURN 토큰을 안전하게 전송하고 관리하세요.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="transfer">전송</TabsTrigger>
              <TabsTrigger value="history">거래 내역</TabsTrigger>
            </TabsList>

            <TabsContent value="transfer">
              <div className="bg-white dark:bg-[#151E32] rounded-2xl p-6 border border-slate-200 dark:border-gray-800 shadow-sm">
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
    <section className="space-y-6" data-testid="section-staking">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">스테이킹</h2>
          <p className="text-slate-500 dark:text-gray-400">검증자에게 토큰을 위임하고 보상을 받으세요.</p>
        </div>
        {!isConnected && (
          <Button onClick={onConnectWallet} className="bg-gradient-to-r from-blue-500 to-purple-600" data-testid="button-connect-staking">
            <Wallet className="w-4 h-4 mr-2" /> 지갑 연결
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
    <section className="space-y-6" data-testid="section-governance">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">거버넌스</h2>
          <p className="text-slate-500 dark:text-gray-400">TBURN 네트워크의 미래를 결정하는 투표에 참여하세요.</p>
        </div>
        {!isConnected && (
          <Button onClick={onConnectWallet} className="bg-gradient-to-r from-blue-500 to-purple-600" data-testid="button-connect-governance">
            <Wallet className="w-4 h-4 mr-2" /> 지갑 연결
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
    <section className="space-y-6" data-testid="section-network">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">네트워크 상태</h2>
        <p className="text-slate-500 dark:text-gray-400">TBURN 메인넷의 실시간 상태를 모니터링하세요.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-[#151E32] p-5 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-xs text-slate-500 dark:text-gray-400 uppercase">{stat.label}</span>
              </div>
              <p className={`text-3xl font-mono font-bold ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#151E32] rounded-2xl p-6 border border-slate-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-emerald-500 animate-pulse" />
              실시간 블록 피드
            </h3>
          </div>
          <div className="space-y-2 max-h-80 overflow-hidden relative">
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-[#151E32] to-transparent z-10 pointer-events-none" />
            {blockFeed.map((block, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#0B1120] rounded-lg text-sm animate-fade-in"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Boxes className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-mono font-bold text-slate-900 dark:text-white">
                      #{formatNumber(block.blockNumber)}
                    </p>
                    <p className="text-xs text-slate-400">{block.validator}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-600 dark:text-gray-400">
                    {formatNumber(block.transactions)} txns
                  </p>
                  <p className="text-xs text-orange-500 flex items-center justify-end gap-1">
                    <Flame className="w-3 h-3" /> {block.burned} TB
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#151E32] rounded-2xl p-6 border border-slate-200 dark:border-gray-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-purple-500" />
            샤드 상태
          </h3>
          <div className="space-y-3">
            {shards.slice(0, 5).map((shard) => (
              <div
                key={shard.id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#0B1120] rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    shard.status === "active" ? "bg-emerald-500" : "bg-yellow-500"
                  }`} />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{shard.name}</p>
                    <p className="text-xs text-slate-400">{shard.validators} 검증자</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <Progress value={shard.load} className="w-20 h-2" />
                    <span className="text-xs text-slate-500">{shard.load}%</span>
                  </div>
                  <p className="text-xs text-slate-400">{formatNumber(shard.transactions)} txns</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#151E32] rounded-2xl p-6 border border-slate-200 dark:border-gray-800 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Network className="w-5 h-5 text-blue-500" />
          네트워크 성능
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-50 dark:bg-[#0B1120] rounded-xl">
            <p className="text-2xl font-bold font-mono text-blue-500">{networkStats?.peakTps ? formatNumber(networkStats.peakTps) : "---"}</p>
            <p className="text-xs text-slate-500 dark:text-gray-400">Peak TPS</p>
          </div>
          <div className="text-center p-4 bg-slate-50 dark:bg-[#0B1120] rounded-xl">
            <p className="text-2xl font-bold font-mono text-purple-500">{networkStats?.latency || "---"}ms</p>
            <p className="text-xs text-slate-500 dark:text-gray-400">평균 지연</p>
          </div>
          <div className="text-center p-4 bg-slate-50 dark:bg-[#0B1120] rounded-xl">
            <p className="text-2xl font-bold font-mono text-emerald-500">{shards.length || 8}</p>
            <p className="text-xs text-slate-500 dark:text-gray-400">활성 샤드</p>
          </div>
          <div className="text-center p-4 bg-slate-50 dark:bg-[#0B1120] rounded-xl">
            <p className="text-2xl font-bold font-mono text-orange-500">{networkStats?.blockTimeP99?.toFixed(2) || "0.8"}s</p>
            <p className="text-xs text-slate-500 dark:text-gray-400">P99 블록 시간</p>
          </div>
        </div>
      </div>
    </section>
  );
}
