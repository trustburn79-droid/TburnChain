import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTheme } from "@/components/theme-provider";
import { Flame, Wallet, Layers, Gavel, Globe, RefreshCw, Shield, Coins, ArrowUp, ArrowDown, CheckCircle, ExternalLink, Sun, Moon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { formatNumber } from "@/lib/formatters";
import type { Validator, NetworkStats, StakingStats } from "@shared/schema";

type Section = "dashboard" | "wallet" | "staking" | "governance" | "network";

interface GovernanceProposal {
  id: number;
  title: string;
  description: string;
  status: string;
  votesFor: number;
  votesAgainst: number;
  endTime: string;
}

interface Block {
  blockNumber: number;
  transactions: number;
  burned: number;
  timestamp: number;
}

interface BurnStats {
  totalBurned: string;
  burnRate24h: number;
  userBurnContribution?: string;
  burnPercentage?: number;
}

const transferFormSchema = z.object({
  recipientAddress: z.string().min(1, "주소를 입력해주세요").regex(/^0x[a-fA-F0-9]{40}$/, "유효한 TBURN 주소를 입력해주세요"),
  amount: z.string().min(1, "수량을 입력해주세요").refine((val) => parseFloat(val) > 0, "0보다 큰 수량을 입력해주세요"),
});

type TransferFormValues = z.infer<typeof transferFormSchema>;

export default function UserPage() {
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const trustScoreCanvasRef = useRef<HTMLCanvasElement>(null);
  const [blockFeed, setBlockFeed] = useState<Block[]>([]);

  const { data: networkStats } = useQuery<NetworkStats>({
    queryKey: ["/api/network/stats"],
    staleTime: 5000,
    refetchInterval: 5000,
  });

  const { data: stakingStats } = useQuery<StakingStats>({
    queryKey: ["/api/staking/stats"],
    staleTime: 10000,
    refetchInterval: 10000,
  });

  const { data: validators } = useQuery<Validator[]>({
    queryKey: ["/api/validators"],
    staleTime: 15000,
    refetchInterval: 15000,
  });

  const { data: burnStats } = useQuery<BurnStats>({
    queryKey: ["/api/burn/stats"],
    staleTime: 10000,
    refetchInterval: 10000,
  });

  const { data: proposals } = useQuery<GovernanceProposal[]>({
    queryKey: ["/api/governance/proposals"],
    staleTime: 30000,
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (activeSection !== "network") return;
    const interval = setInterval(() => {
      const newBlock: Block = {
        blockNumber: 8921000 + Math.floor(Date.now() / 1000),
        transactions: Math.floor(Math.random() * (60000 - 30000) + 30000),
        burned: Math.floor(Math.random() * 200),
        timestamp: Date.now(),
      };
      setBlockFeed((prev) => [newBlock, ...prev.slice(0, 7)]);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSection]);

  useEffect(() => {
    const canvas = trustScoreCanvasRef.current;
    if (!canvas || activeSection !== "dashboard") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDark = theme === "dark";
    const score = 92;
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

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + (score / 100) * Math.PI * 2);
    ctx.strokeStyle = "#3B82F6";
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.stroke();
  }, [theme, activeSection]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/network/stats"] });
    queryClient.invalidateQueries({ queryKey: ["/api/staking/stats"] });
    queryClient.invalidateQueries({ queryKey: ["/api/burn/stats"] });
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const navItems = [
    { id: "dashboard" as Section, label: "대시보드 (Trust Score)", icon: Shield },
    { id: "wallet" as Section, label: "지갑 & 전송", icon: Wallet },
    { id: "staking" as Section, label: "스테이킹 (Validator)", icon: Layers },
    { id: "governance" as Section, label: "거버넌스", icon: Gavel },
    { id: "network" as Section, label: "네트워크 상태", icon: Globe },
  ];

  const totalBurned = burnStats?.totalBurned || networkStats?.totalBurned || "42,591,023";
  const burnPercentage = 65;

  return (
    <div className="flex h-screen overflow-hidden font-sans antialiased bg-slate-50 text-slate-800 dark:bg-[#0B1120] dark:text-[#E2E8F0]">
      <aside className="w-64 flex flex-col z-20 transition-colors duration-300 border-r bg-white border-slate-200 dark:bg-[#0F172A] dark:border-gray-800">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100 dark:border-gray-800">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            T
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
              TBURN <span className="text-xs font-normal text-orange-500">Mainnet</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-gray-500 font-mono">v4.0.2 Stable</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                data-testid={`nav-${item.id}`}
                className={`w-full flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 border-l-4 ${
                  isActive
                    ? "bg-blue-50 text-blue-600 border-blue-600 dark:bg-[#151E32] dark:text-white dark:border-blue-500 shadow-sm"
                    : "text-slate-500 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-white border-transparent"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-gray-800">
          <div className="bg-white/85 dark:bg-[#151E32]/70 backdrop-blur-xl border border-slate-200/80 dark:border-white/5 p-4 rounded-xl shadow-sm dark:shadow-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-500 dark:text-gray-400">Total Burned</span>
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
            </div>
            <div className="text-lg font-mono font-bold text-slate-800 dark:text-white tracking-wider">
              {typeof totalBurned === "number" ? formatNumber(totalBurned) : totalBurned} TB
            </div>
            <div className="w-full bg-slate-200 dark:bg-gray-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-orange-500 to-red-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${burnPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-50 dark:bg-[#0B1120] transition-colors duration-300">
        <div className="absolute inset-0 opacity-40 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        <header className="h-16 border-b border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-md flex items-center justify-between px-8 z-10 transition-colors duration-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10B981]" />
            <span className="text-sm font-mono text-emerald-500 font-bold">
              Mainnet Live ({networkStats?.tps ? formatNumber(networkStats.tps) : "100k"} TPS)
            </span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors text-slate-500 dark:text-yellow-400 focus:outline-none"
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-3 bg-slate-100 dark:bg-[#151E32] px-4 py-2 rounded-full border border-slate-200 dark:border-gray-700">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                alt="User"
                className="w-8 h-8 rounded-full bg-slate-300 dark:bg-gray-600"
              />
              <div className="text-right hidden sm:block">
                <p className="text-xs text-slate-500 dark:text-gray-400">0x71C...9A21</p>
                <p className="text-sm font-bold text-slate-800 dark:text-white">12,500.00 TB</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 dark:text-gray-500 cursor-pointer" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scroll-smooth relative z-0">
          {activeSection === "dashboard" && (
            <DashboardSection
              networkStats={networkStats}
              stakingStats={stakingStats}
              burnStats={burnStats}
              trustScoreCanvasRef={trustScoreCanvasRef}
              onRefresh={handleRefresh}
            />
          )}
          {activeSection === "wallet" && <WalletSection />}
          {activeSection === "staking" && (
            <StakingSection stakingStats={stakingStats} validators={validators || []} />
          )}
          {activeSection === "governance" && <GovernanceSection proposals={proposals || []} />}
          {activeSection === "network" && (
            <NetworkSection networkStats={networkStats} blockFeed={blockFeed} />
          )}
        </div>
      </main>
    </div>
  );
}

function DashboardSection({
  networkStats,
  stakingStats,
  burnStats,
  trustScoreCanvasRef,
  onRefresh,
}: {
  networkStats: NetworkStats | undefined;
  stakingStats: StakingStats | undefined;
  burnStats: BurnStats | undefined;
  trustScoreCanvasRef: React.RefObject<HTMLCanvasElement>;
  onRefresh: () => void;
}) {
  return (
    <section className="space-y-6 animate-fade-in" data-testid="section-dashboard">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            안녕하세요, Validator님
          </h2>
          <p className="text-slate-500 dark:text-gray-400">
            TBURN 메인넷에서의 신뢰도 활동 현황입니다.
          </p>
        </div>
        <Button
          onClick={onRefresh}
          variant="outline"
          data-testid="button-refresh"
          className="bg-blue-50 dark:bg-blue-500/20 text-blue-600 border-blue-100 dark:border-blue-500/50 hover:bg-blue-100 dark:hover:bg-blue-500/30"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> 데이터 갱신
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white/85 dark:bg-[#151E32]/70 backdrop-blur-xl border border-slate-200/80 dark:border-white/5 rounded-2xl p-6 relative overflow-hidden group shadow-sm dark:shadow-lg">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Shield className="w-24 h-24 text-blue-500" />
          </div>
          <h3 className="text-slate-500 dark:text-gray-400 font-medium mb-4">My Trust Score</h3>
          <div className="flex flex-col items-center justify-center relative py-4">
            <canvas ref={trustScoreCanvasRef} width={200} height={200} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-5xl font-bold text-slate-800 dark:text-white font-mono">92</span>
              <span className="text-xs text-blue-500 mt-1 font-bold">Excellent</span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-gray-500">거래 이력 기여도</span>
              <span className="text-slate-800 dark:text-white font-medium">35/40</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-gray-500">스테이킹 기간</span>
              <span className="text-slate-800 dark:text-white font-medium">28/30</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-gray-500">커뮤니티 활동</span>
              <span className="text-slate-800 dark:text-white font-medium">29/30</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/85 dark:bg-[#151E32]/70 backdrop-blur-xl border border-slate-200/80 dark:border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-orange-200 dark:hover:border-orange-500/50 transition-colors cursor-pointer group shadow-sm dark:shadow-lg">
            <div>
              <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                <div className="p-3 bg-orange-50 dark:bg-orange-500/10 rounded-lg text-orange-500">
                  <Flame className="w-6 h-6" />
                </div>
                <span className="text-xs bg-orange-50 dark:bg-orange-500/20 text-orange-500 px-2 py-1 rounded font-bold">
                  +12% vs last month
                </span>
              </div>
              <h3 className="text-slate-500 dark:text-gray-400 text-sm">총 기여 소각량 (Burn Contribution)</h3>
              <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1 font-mono">
                {burnStats?.userBurnContribution || "1,240.50"} TB
              </p>
            </div>
            <p className="text-xs text-slate-400 dark:text-gray-500 mt-4 group-hover:text-slate-600 dark:group-hover:text-gray-400 transition-colors">
              나의 트랜잭션으로 인해 소각된 총 자산입니다.
            </p>
          </div>

          <div className="bg-white/85 dark:bg-[#151E32]/70 backdrop-blur-xl border border-slate-200/80 dark:border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-200 dark:hover:border-blue-500/50 transition-colors cursor-pointer shadow-sm dark:shadow-lg">
            <div>
              <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-500">
                  <Coins className="w-6 h-6" />
                </div>
                <span className="text-xs bg-blue-50 dark:bg-blue-500/20 text-blue-500 px-2 py-1 rounded font-bold">
                  Claimable
                </span>
              </div>
              <h3 className="text-slate-500 dark:text-gray-400 text-sm">스테이킹 보상 (Rewards)</h3>
              <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1 font-mono">
                {stakingStats?.rewardsDistributed ? formatNumber(parseFloat(stakingStats.rewardsDistributed)) : "452.12"} TB
              </p>
            </div>
            <Button
              className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              data-testid="button-claim-rewards"
            >
              보상 수령하기
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function WalletSection() {
  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      recipientAddress: "",
      amount: "1000",
    },
  });

  const watchedAmount = form.watch("amount");
  const burnFee = parseFloat(watchedAmount || "0") * 0.005;
  const networkFee = 0.0001;
  const totalDeduction = parseFloat(watchedAmount || "0") + burnFee + networkFee;

  const onSubmit = (data: TransferFormValues) => {
    console.log("Transfer submitted:", data);
  };

  const recentActivity = [
    { type: "sent", to: "0x82...1A", amount: 500, burned: 2.5, time: "2 mins ago" },
    { type: "received", from: "0xA4...3F", amount: 2000, time: "1 hour ago" },
  ];

  return (
    <section className="space-y-6" data-testid="section-wallet">
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white">지갑 & 전송</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/85 dark:bg-[#151E32]/70 backdrop-blur-xl border border-slate-200/80 dark:border-white/5 rounded-2xl p-8 shadow-sm dark:shadow-lg">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <ArrowUp className="w-5 h-5 text-blue-500 rotate-45" /> 자산 전송
          </h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="recipientAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-500 dark:text-gray-400">
                      받는 사람 주소 (TBURN Address)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="0x..."
                        {...field}
                        data-testid="input-recipient-address"
                        className="w-full bg-slate-50 dark:bg-[#0B1120] border-slate-200 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white font-mono"
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
                    <FormLabel className="text-sm font-medium text-slate-500 dark:text-gray-400">
                      전송 수량 (TB)
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          {...field}
                          data-testid="input-amount"
                          className="w-full bg-slate-50 dark:bg-[#0B1120] border-slate-200 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold pr-12"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 font-bold">
                          TB
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-slate-50 dark:bg-[#0B1120]/50 rounded-xl p-4 border border-slate-200 dark:border-orange-500/30">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-500 dark:text-gray-400">예상 네트워크 수수료</span>
                  <span className="text-sm text-slate-800 dark:text-white font-mono">
                    {networkFee.toFixed(4)} TB
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-orange-500 font-medium">
                    <Flame className="w-4 h-4 inline mr-1" /> 자동 소각 예정 (0.5%)
                  </span>
                  <span className="text-sm text-orange-500 font-mono font-bold">- {burnFee.toFixed(2)} TB</span>
                </div>
                <div className="border-t border-slate-200 dark:border-gray-700 my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-base text-slate-900 dark:text-white font-bold">총 차감 수량</span>
                  <span className="text-xl text-slate-900 dark:text-white font-mono font-bold">
                    {totalDeduction.toFixed(4)} TB
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                data-testid="button-confirm-transfer"
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 transition-all transform hover:scale-[1.01]"
              >
                즉시 전송 (Confirm)
              </Button>
              <p className="text-center text-xs text-slate-400 dark:text-gray-500">
                예상 처리 시간: <span className="text-emerald-500 font-bold">0.01초 (Ultra Fast)</span>
              </p>
            </form>
          </Form>
        </div>

        <div className="bg-white/85 dark:bg-[#151E32]/70 backdrop-blur-xl border border-slate-200/80 dark:border-white/5 rounded-2xl p-8 flex flex-col h-full shadow-sm dark:shadow-lg">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">최근 활동</h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white dark:bg-[#0B1120] rounded-xl border border-slate-100 dark:border-gray-800 hover:border-slate-300 dark:hover:border-gray-600 transition-colors shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === "sent"
                        ? "bg-red-500/10 text-red-500"
                        : "bg-green-500/10 text-green-500"
                    }`}
                  >
                    {activity.type === "sent" ? (
                      <ArrowUp className="w-5 h-5 rotate-45" />
                    ) : (
                      <ArrowDown className="w-5 h-5 rotate-45" />
                    )}
                  </div>
                  <div>
                    <p className="text-slate-800 dark:text-white font-bold">
                      {activity.type === "sent" ? `Sent to ${activity.to}` : "Received"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-gray-500">{activity.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-mono font-bold ${
                      activity.type === "sent"
                        ? "text-slate-900 dark:text-white"
                        : "text-emerald-500"
                    }`}
                  >
                    {activity.type === "sent" ? "-" : "+"} {formatNumber(activity.amount)} TB
                  </p>
                  {activity.burned && (
                    <p className="text-xs text-orange-500">
                      <Flame className="w-3 h-3 inline" /> {activity.burned} TB Burned
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StakingSection({
  stakingStats,
  validators,
}: {
  stakingStats: StakingStats | undefined;
  validators: Validator[];
}) {
  const displayValidators = validators.length > 0 ? validators.slice(0, 10) : [
    { id: 1, name: "TBURN Foundation Node", address: "0x1...", trustScore: 99.8, totalStaked: "50M", commission: 5, status: "active" },
    { id: 2, name: "Korea Distributed ONE", address: "0x2...", trustScore: 98.5, totalStaked: "32M", commission: 3, status: "active" },
  ];

  return (
    <section className="space-y-6" data-testid="section-staking">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Validator 스테이킹</h2>
        <div className="text-right">
          <p className="text-sm text-slate-500 dark:text-gray-400">현재 APR</p>
          <p className="text-xl text-emerald-500 font-bold font-mono">
            {stakingStats?.apr ? `${stakingStats.apr.toFixed(1)}%` : "12.5%"}
          </p>
        </div>
      </div>

      <div className="bg-white/85 dark:bg-[#151E32]/70 backdrop-blur-xl border border-slate-200/80 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm dark:shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-[#0B1120] border-b border-slate-200 dark:border-gray-700 text-slate-500 dark:text-gray-400 text-sm uppercase">
              <th className="p-6 font-medium">Rank</th>
              <th className="p-6 font-medium">Validator Name</th>
              <th className="p-6 font-medium text-center">Trust Score</th>
              <th className="p-6 font-medium text-right">Total Staked</th>
              <th className="p-6 font-medium text-right">Commission</th>
              <th className="p-6 font-medium text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-slate-800 dark:text-white divide-y divide-slate-100 dark:divide-gray-800">
            {displayValidators.map((validator, index) => (
              <tr
                key={validator.id}
                className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
              >
                <td className="p-6 text-slate-500 dark:text-gray-500 font-mono">#{index + 1}</td>
                <td className="p-6">
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://api.dicebear.com/7.x/identicon/svg?seed=Node${index + 1}`}
                      className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-700"
                      alt={validator.name}
                    />
                    <span className="font-bold group-hover:text-blue-500 transition-colors">
                      {validator.name}
                    </span>
                    {index === 0 && <CheckCircle className="w-4 h-4 text-blue-500" />}
                  </div>
                </td>
                <td className="p-6 text-center">
                  <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full text-xs font-bold border border-green-200 dark:border-green-500/30">
                    {validator.trustScore}
                  </span>
                </td>
                <td className="p-6 text-right font-mono">
                  {typeof validator.totalStaked === "string" ? validator.totalStaked : formatNumber(validator.totalStaked)} TB
                </td>
                <td className="p-6 text-right text-slate-500 dark:text-gray-400">
                  {validator.commission}%
                </td>
                <td className="p-6 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid={`button-delegate-${validator.id}`}
                    className="bg-slate-200 dark:bg-gray-700 hover:bg-blue-500 dark:hover:bg-white text-slate-700 dark:text-white hover:text-white dark:hover:text-black text-xs font-bold"
                  >
                    Delegate
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function GovernanceSection({ proposals }: { proposals: GovernanceProposal[] }) {
  const displayProposals = proposals.length > 0 ? proposals.slice(0, 3) : [
    {
      id: 23,
      title: "Q4 소각 메커니즘 업데이트",
      description: "거래 수수료 소각 비율을 0.5%에서 0.7%로 상향 조정하는 안건입니다.",
      status: "Active",
      votesFor: 85,
      votesAgainst: 15,
      endTime: "2024-12-31",
    },
  ];

  return (
    <section className="space-y-6" data-testid="section-governance">
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white">거버넌스 투표</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayProposals.map((proposal) => {
          const totalVotes = proposal.votesFor + proposal.votesAgainst;
          const forPercentage = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
          
          return (
            <div
              key={proposal.id}
              className="bg-white/85 dark:bg-[#151E32]/70 backdrop-blur-xl border border-slate-200/80 dark:border-white/5 rounded-2xl p-6 border-l-4 border-l-blue-500 relative overflow-hidden shadow-sm dark:shadow-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">
                  {proposal.status}
                </span>
                <span className="text-xs text-slate-400 dark:text-gray-500">
                  #PROP-{String(proposal.id).padStart(3, "0")}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{proposal.title}</h3>
              <p className="text-sm text-slate-500 dark:text-gray-400 mb-6 h-10 overflow-hidden text-ellipsis">
                {proposal.description}
              </p>

              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-white">찬성 (For)</span>
                  <span className="text-slate-800 dark:text-white font-bold">{forPercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${forPercentage}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  data-testid={`button-vote-${proposal.id}`}
                  className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90"
                >
                  투표하기
                </Button>
                <Button variant="outline" size="icon">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function NetworkSection({
  networkStats,
  blockFeed,
}: {
  networkStats: NetworkStats | undefined;
  blockFeed: Block[];
}) {
  const stats = [
    {
      label: "Current TPS",
      value: networkStats?.tps ? formatNumber(networkStats.tps) : "102,450",
      color: "text-emerald-500",
      animate: true,
    },
    {
      label: "Block Time",
      value: networkStats?.blockTime ? `${networkStats.blockTime}s` : "0.5s",
      color: "text-slate-800 dark:text-white",
    },
    {
      label: "Active Validators",
      value: networkStats?.activeValidators?.toString() || "125",
      color: "text-blue-500 dark:text-blue-400",
    },
    {
      label: "Burn Rate (24h)",
      value: networkStats?.burnRate24h ? `${networkStats.burnRate24h.toFixed(1)}%` : "2.4%",
      color: "text-orange-500",
      hasBg: true,
    },
  ];

  return (
    <section className="space-y-6" data-testid="section-network">
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white">네트워크 실시간 상태</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`bg-white dark:bg-[#0F172A] p-6 rounded-xl border border-slate-200 dark:border-gray-800 text-center shadow-sm relative overflow-hidden ${
              stat.hasBg ? "" : ""
            }`}
          >
            {stat.hasBg && <div className="absolute inset-0 bg-orange-500/5" />}
            <p className="text-slate-500 dark:text-gray-400 text-xs uppercase mb-2">{stat.label}</p>
            <p className={`text-3xl font-mono font-bold ${stat.color} ${stat.animate ? "animate-pulse" : ""}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white/85 dark:bg-[#151E32]/70 backdrop-blur-xl border border-slate-200/80 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-lg">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Live Block Feed</h3>
        <div className="space-y-2 font-mono text-sm max-h-60 overflow-hidden relative">
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white dark:from-[#151E32] to-transparent z-10 transition-colors duration-300 pointer-events-none" />
          <div className="space-y-2">
            {blockFeed.map((block, index) => (
              <div
                key={index}
                className="flex justify-between text-slate-500 dark:text-gray-300 py-1 border-b border-slate-100 dark:border-gray-800/50"
              >
                <span className="text-slate-800 dark:text-white">Block #{block.blockNumber}</span>
                <span>Txns: {formatNumber(block.transactions)}</span>
                <span className="text-orange-500">Burned: {block.burned} TB</span>
                <span className="text-emerald-500">Just now</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
