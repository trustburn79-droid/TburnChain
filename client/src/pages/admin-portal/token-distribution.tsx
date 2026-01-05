import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Coins, Gift, Users, Calendar, Award, Vote, Blocks, Server, 
  Sprout, TrendingUp, RefreshCw, CheckCircle2, Clock, AlertCircle,
  ArrowUpRight, BarChart3, Eye, Send, Wifi, WifiOff, Handshake, Megaphone,
  Briefcase, GraduationCap, Leaf, KeyRound, Globe, Rocket, ListOrdered, Gem, ExternalLink,
  Layers, Shield, Database, Activity, Lock, Key, Building2, FileCheck, Zap
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

interface DistributionEngineStatus {
  success: boolean;
  data: {
    isRunning: boolean;
    circuitBreakerState: string;
    metrics: {
      totalTasks: number;
      completedTasks: number;
      failedTasks: number;
      pendingTasks: number;
      processingTasks: number;
      currentTPS: number;
      peakTPS: number;
      successRate: number;
      averageLatencyMs: number;
    };
    categoryProgress: {
      [key: string]: {
        total: number;
        completed: number;
        percentage: number;
        amountDistributed: number;
      };
    };
  };
}

interface DashboardStats {
  overview: {
    totalPrograms: number;
    activePrograms: number;
    totalParticipants: number;
    totalDistributed: string;
  };
  airdrop: {
    totalEligible: number;
    totalClaimed: number;
    totalAmount: string;
    claimedAmount: string;
  };
  referral: {
    totalAccounts: number;
    totalReferrals: number;
    totalEarnings: string;
    activeReferrers: number;
  };
  events: {
    totalEvents: number;
    activeEvents: number;
    totalParticipants: number;
    totalRewardsDistributed: string;
  };
  community: {
    totalTasks: number;
    activeTasks: number;
    totalContributions: number;
    totalPointsDistributed: number;
  };
  dao: {
    totalProposals: number;
    activeProposals: number;
    passedProposals: number;
    totalVoters: number;
  };
  blockRewards: {
    totalCycles: number;
    totalRewards: string;
    totalGasFees: string;
    avgRewardPerCycle: string;
  };
  validatorIncentives: {
    totalPayouts: number;
    totalAmount: string;
    avgUptimePercent: number;
    topPerformers: number;
  };
  ecosystemGrants: {
    totalGrants: number;
    activeGrants: number;
    totalRequested: string;
    totalDisbursed: string;
  };
}

const CHART_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16'];

const formatTBURN = (amount: string) => {
  const num = BigInt(amount || '0');
  const tburn = Number(num) / 1e18;
  if (tburn >= 1e9) return `${(tburn / 1e9).toFixed(2)}B TBURN`;
  if (tburn >= 1e6) return `${(tburn / 1e6).toFixed(2)}M TBURN`;
  if (tburn >= 1e3) return `${(tburn / 1e3).toFixed(2)}K TBURN`;
  return `${tburn.toFixed(4)} TBURN`;
};

const formatNumber = (num: number) => {
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toLocaleString();
};

export default function AdminTokenDistribution() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: dashboardData, isLoading, error, refetch } = useQuery<{ success: boolean; data: DashboardStats }>({
    queryKey: ['/api/admin/token-programs/dashboard'],
    refetchInterval: 30000,
    retry: 3,
  });

  const { data: distributionStatus } = useQuery<DistributionEngineStatus>({
    queryKey: ['/api/admin/genesis/distribution/status'],
    refetchInterval: 5000,
  });

  const stats = dashboardData?.data;

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast({ title: "Data Refreshed", description: "Token distribution stats updated" });
  }, [refetch, toast]);

  const programCards = [
    { key: 'airdrop', title: '에어드랍', titleEn: 'Airdrop', icon: Gift, color: 'bg-emerald-500', route: '/admin/token-distribution/airdrop' },
    { key: 'referral', title: '레퍼럴', titleEn: 'Referral', icon: Users, color: 'bg-blue-500', route: '/admin/token-distribution/referral' },
    { key: 'events', title: '이벤트 센터', titleEn: 'Events', icon: Calendar, color: 'bg-purple-500', route: '/admin/token-distribution/events' },
    { key: 'community', title: '커뮤니티', titleEn: 'Community', icon: Award, color: 'bg-amber-500', route: '/admin/token-distribution/community-program' },
    { key: 'dao', title: 'DAO 거버넌스', titleEn: 'DAO Governance', icon: Vote, color: 'bg-rose-500', route: '/admin/token-distribution/dao-governance' },
    { key: 'blockRewards', title: '블록 보상', titleEn: 'Block Rewards', icon: Blocks, color: 'bg-cyan-500', route: '/admin/token-distribution/block-rewards' },
    { key: 'validatorIncentives', title: '검증자 인센티브', titleEn: 'Validator Incentives', icon: Server, color: 'bg-indigo-500', route: '/admin/token-distribution/validator-incentives' },
    { key: 'ecosystemGrants', title: '에코시스템 펀드', titleEn: 'Ecosystem Fund', icon: Sprout, color: 'bg-lime-500', route: '/admin/token-distribution/ecosystem-fund' },
    { key: 'partnership', title: '파트너십', titleEn: 'Partnership', icon: Handshake, color: 'bg-teal-500', route: '/admin/token-distribution/partnership-program' },
    { key: 'marketing', title: '마케팅', titleEn: 'Marketing', icon: Megaphone, color: 'bg-pink-500', route: '/admin/token-distribution/marketing-program' },
    { key: 'strategic', title: '전략 파트너', titleEn: 'Strategic Partner', icon: Briefcase, color: 'bg-slate-500', route: '/admin/token-distribution/strategic-partner' },
    { key: 'advisor', title: '어드바이저', titleEn: 'Advisor', icon: GraduationCap, color: 'bg-orange-500', route: '/admin/token-distribution/advisor-program' },
    { key: 'seed', title: '시드 라운드', titleEn: 'Seed Round', icon: Leaf, color: 'bg-green-600', route: '/admin/token-distribution/seed-round' },
    { key: 'private', title: '프라이빗 라운드', titleEn: 'Private Round', icon: KeyRound, color: 'bg-violet-500', route: '/admin/token-distribution/private-round' },
    { key: 'public', title: '퍼블릭 라운드', titleEn: 'Public Round', icon: Globe, color: 'bg-sky-500', route: '/admin/token-distribution/public-round' },
    { key: 'launchpad', title: '런치패드', titleEn: 'Launchpad', icon: Rocket, color: 'bg-red-500', route: '/admin/token-distribution/launchpad' },
    { key: 'coinlist', title: 'CoinList', titleEn: 'CoinList', icon: ListOrdered, color: 'bg-yellow-600', route: '/admin/token-distribution/coinlist' },
    { key: 'daomaker', title: 'DAO Maker', titleEn: 'DAO Maker SHO', icon: Gem, color: 'bg-fuchsia-500', route: '/admin/token-distribution/dao-maker' },
  ];

  const pieChartData = programCards.slice(0, 8).map((program, idx) => ({
    name: program.titleEn,
    value: 1,
    color: CHART_COLORS[idx % CHART_COLORS.length]
  }));

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6" data-testid="loading-skeleton">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12" data-testid="error-state">
        <AlertCircle className="h-16 w-16 text-destructive" />
        <h2 className="text-2xl font-bold">Failed to Load Dashboard</h2>
        <p className="text-muted-foreground">Unable to fetch token distribution data. Please try again.</p>
        <Button onClick={() => refetch()} data-testid="button-retry">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="token-distribution-dashboard">
      <div className="flex flex-row items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            Token Distribution Management
          </h1>
          <p className="text-muted-foreground">
            Manage all 18 token distribution programs from a single dashboard
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Wifi className="h-3 w-3 text-emerald-500" />
            Connected
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            data-testid="button-refresh"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total-programs">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overview?.totalPrograms || 8}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.overview?.activePrograms || 8} active programs
            </p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-participants">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats?.overview?.totalParticipants || 0)}</div>
            <p className="text-xs text-emerald-600 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" /> Active across all programs
            </p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-distributed">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">Total Distributed</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTBURN(stats?.overview?.totalDistributed || '0')}</div>
            <p className="text-xs text-muted-foreground">Tokens distributed</p>
          </CardContent>
        </Card>
        <Card data-testid="card-active-programs">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overview?.activePrograms || 8}</div>
            <Progress value={((stats?.overview?.activePrograms || 8) / (stats?.overview?.totalPrograms || 8)) * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Genesis Distribution Engine Status - Integration with tokenomics */}
      <Card data-testid="card-distribution-engine-status">
        <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Genesis 분배 엔진 연동</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={distributionStatus?.data?.isRunning ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}>
              {distributionStatus?.data?.isRunning ? "분배 진행 중" : "대기 중"}
            </Badge>
            <Badge className={distributionStatus?.data?.circuitBreakerState === 'closed' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}>
              <Shield className="h-3 w-3 mr-1" />
              {distributionStatus?.data?.circuitBreakerState === 'closed' ? "정상" : "차단"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Object.entries(distributionStatus?.data?.categoryProgress || {}).map(([category, progress]) => (
              <div key={category} className="p-3 rounded-lg border">
                <div className="text-xs text-muted-foreground mb-1">{category}</div>
                <Progress value={progress.percentage} className="h-1.5 mb-1" />
                <div className="text-xs font-medium">{progress.percentage.toFixed(1)}%</div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>작업: {distributionStatus?.data?.metrics?.completedTasks || 0}/{distributionStatus?.data?.metrics?.totalTasks || 0}</span>
              <span>TPS: {distributionStatus?.data?.metrics?.currentTPS?.toFixed(2) || '0.00'}</span>
              <span>성공률: {distributionStatus?.data?.metrics?.successRate?.toFixed(1) || '100'}%</span>
            </div>
            <Link href="/admin/tokenomics" className="text-primary hover:underline flex items-center gap-1">
              <Activity className="h-3 w-3" />
              상세 관리
            </Link>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="custody" data-testid="tab-custody">Custody</TabsTrigger>
          <TabsTrigger value="airdrop" data-testid="tab-airdrop">Airdrop</TabsTrigger>
          <TabsTrigger value="referral" data-testid="tab-referral">Referral</TabsTrigger>
          <TabsTrigger value="events" data-testid="tab-events">Events</TabsTrigger>
          <TabsTrigger value="community" data-testid="tab-community">Community</TabsTrigger>
          <TabsTrigger value="dao" data-testid="tab-dao">DAO</TabsTrigger>
          <TabsTrigger value="block-rewards" data-testid="tab-block-rewards">Block Rewards</TabsTrigger>
          <TabsTrigger value="validators" data-testid="tab-validators">Validators</TabsTrigger>
          <TabsTrigger value="grants" data-testid="tab-grants">Grants</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>18개 토큰 배포 프로그램</CardTitle>
              <CardDescription>각 프로그램을 클릭하여 상세 관리 페이지로 이동</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {programCards.map(program => (
                  <Link key={program.key} href={program.route}>
                    <Card className="hover-elevate cursor-pointer h-full transition-all hover:border-primary" data-testid={`card-program-${program.key}`}>
                      <CardContent className="pt-4 pb-4">
                        <div className="flex flex-col items-center text-center gap-2">
                          <div className={`p-3 rounded-lg ${program.color}`}>
                            <program.icon className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="font-semibold text-sm">{program.title}</h3>
                          <p className="text-xs text-muted-foreground">{program.titleEn}</p>
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Program Distribution</CardTitle>
                <CardDescription>Participation across all programs</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Key metrics across programs</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-72">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Gift className="h-5 w-5 text-emerald-500" />
                        <span>Airdrop Claims</span>
                      </div>
                      <Badge>{stats?.airdrop?.totalClaimed || 0} / {stats?.airdrop?.totalEligible || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-blue-500" />
                        <span>Active Referrers</span>
                      </div>
                      <Badge>{formatNumber(stats?.referral?.activeReferrers || 0)}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-purple-500" />
                        <span>Active Events</span>
                      </div>
                      <Badge>{stats?.events?.activeEvents || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Award className="h-5 w-5 text-amber-500" />
                        <span>Active Tasks</span>
                      </div>
                      <Badge>{stats?.community?.activeTasks || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Vote className="h-5 w-5 text-rose-500" />
                        <span>Active Proposals</span>
                      </div>
                      <Badge>{stats?.dao?.activeProposals || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Server className="h-5 w-5 text-indigo-500" />
                        <span>Top Performers</span>
                      </div>
                      <Badge>{stats?.validatorIncentives?.topPerformers || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Sprout className="h-5 w-5 text-lime-500" />
                        <span>Active Grants</span>
                      </div>
                      <Badge>{stats?.ecosystemGrants?.activeGrants || 0}</Badge>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="custody" className="space-y-6">
          <CustodySection />
        </TabsContent>

        <TabsContent value="airdrop" className="space-y-6">
          <AirdropSection stats={stats?.airdrop} />
        </TabsContent>

        <TabsContent value="referral" className="space-y-6">
          <ReferralSection stats={stats?.referral} />
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <EventsSection stats={stats?.events} />
        </TabsContent>

        <TabsContent value="community" className="space-y-6">
          <CommunitySection stats={stats?.community} />
        </TabsContent>

        <TabsContent value="dao" className="space-y-6">
          <DaoSection stats={stats?.dao} />
        </TabsContent>

        <TabsContent value="block-rewards" className="space-y-6">
          <BlockRewardsSection stats={stats?.blockRewards} />
        </TabsContent>

        <TabsContent value="validators" className="space-y-6">
          <ValidatorSection stats={stats?.validatorIncentives} />
        </TabsContent>

        <TabsContent value="grants" className="space-y-6">
          <GrantsSection stats={stats?.ecosystemGrants} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Token Custody Mechanism Section - 4-Category Breakdown
function CustodySection() {
  const { data: custodySummary, isLoading } = useQuery<{ success: boolean; data: any }>({
    queryKey: ['/api/custody/summary'],
  });

  const TOTAL_SUPPLY = 500_000_000_000; // 500B TBURN
  
  // 4-Category Custody Mechanism
  const custodyCategories = [
    {
      id: 'protocol_automatic',
      name: '프로토콜 자동화',
      nameEn: 'Protocol Automatic',
      icon: Zap,
      percentage: 22,
      amount: (TOTAL_SUPPLY * 0.22),
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-500',
      type: 'programmatic',
      description: '온체인 자동 실행 - 블록 보상, 스테이킹, 소각',
      components: ['Block Rewards (10%)', 'Staking Rewards (7%)', 'Burn Mechanism (5%)']
    },
    {
      id: 'vesting_contract',
      name: '베스팅 컨트랙트',
      nameEn: 'Vesting Contract',
      icon: Lock,
      percentage: 31,
      amount: (TOTAL_SUPPLY * 0.31),
      color: 'bg-blue-500',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-500',
      type: 'programmatic',
      description: '스마트 컨트랙트 기반 시간 락 해제',
      components: ['Team Vesting (15%)', 'Advisor Vesting (6%)', 'Investor Vesting (10%)']
    },
    {
      id: 'foundation_multisig',
      name: '재단 멀티시그',
      nameEn: 'Foundation Multisig',
      icon: Building2,
      percentage: 17,
      amount: (TOTAL_SUPPLY * 0.17),
      color: 'bg-purple-500',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-500',
      type: 'discretionary',
      description: '3/5 멀티시그 + 7일 타임락 승인 필요',
      components: ['Treasury (10%)', 'Strategic Reserve (7%)']
    },
    {
      id: 'community_pool',
      name: '커뮤니티 풀',
      nameEn: 'Community Pool',
      icon: Users,
      percentage: 30,
      amount: (TOTAL_SUPPLY * 0.30),
      color: 'bg-amber-500',
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-500',
      type: 'discretionary',
      description: 'DAO 거버넌스 투표를 통한 배분',
      components: ['Ecosystem Grants (12%)', 'Marketing (8%)', 'Community Events (10%)']
    }
  ];

  const programmaticTotal = custodyCategories.filter(c => c.type === 'programmatic').reduce((acc, c) => acc + c.percentage, 0);
  const discretionaryTotal = custodyCategories.filter(c => c.type === 'discretionary').reduce((acc, c) => acc + c.percentage, 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Banner */}
      <Card className="border-primary/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                토큰 커스터디 메커니즘
              </CardTitle>
              <CardDescription>프로그래밍 방식 vs 재단 관리 토큰 분류</CardDescription>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-500">{programmaticTotal}%</div>
                <div className="text-xs text-muted-foreground">프로그래밍 방식</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-500">{discretionaryTotal}%</div>
                <div className="text-xs text-muted-foreground">재단 관리</div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-1 h-4 rounded-full overflow-hidden">
            {custodyCategories.map(cat => (
              <div 
                key={cat.id}
                className={`${cat.color}`}
                style={{ width: `${cat.percentage}%` }}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            {custodyCategories.map(cat => (
              <div key={cat.id} className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded ${cat.color}`} />
                <span className="text-xs">{cat.name} ({cat.percentage}%)</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 4-Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {custodyCategories.map(category => (
          <Card key={category.id} className={`${category.bgColor} border-0`} data-testid={`card-custody-${category.id}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${category.color}`}>
                    <category.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{category.name}</CardTitle>
                    <CardDescription className={category.textColor}>{category.nameEn}</CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${category.textColor}`}>{category.percentage}%</div>
                  <Badge variant="outline" className={`text-xs ${category.type === 'programmatic' ? 'border-emerald-500 text-emerald-500' : 'border-amber-500 text-amber-500'}`}>
                    {category.type === 'programmatic' ? '자동화' : '재량적'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">구성 요소:</div>
                <div className="flex flex-wrap gap-2">
                  {category.components.map((comp, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {comp}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">할당량</span>
                  <span className="font-mono font-medium">{(category.amount / 1e9).toFixed(1)}B TBURN</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Execution Mechanism Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-500">
              <Zap className="h-5 w-5" />
              프로그래밍 방식 실행 (53%)
            </CardTitle>
            <CardDescription>온체인 자동화 및 스마트 컨트랙트 기반</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-emerald-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-emerald-500" />
                  <span className="font-medium">프로토콜 자동화 (22%)</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>블록 생성시 자동 보상 분배</li>
                  <li>스테이킹 보상 실시간 계산</li>
                  <li>거래 수수료 기반 자동 소각</li>
                </ul>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">베스팅 컨트랙트 (31%)</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>시간 락 기반 자동 해제</li>
                  <li>클리프 기간 후 선형 베스팅</li>
                  <li>수정 불가능한 스마트 컨트랙트</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-500">
              <Building2 className="h-5 w-5" />
              재단 관리 실행 (47%)
            </CardTitle>
            <CardDescription>멀티시그 및 DAO 거버넌스 승인 필요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-purple-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">재단 멀티시그 (17%)</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>3/5 서명자 승인 필요</li>
                  <li>7일 (168시간) 타임락</li>
                  <li>분기별 투명성 보고서 공개</li>
                </ul>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-amber-500" />
                  <span className="font-medium">커뮤니티 풀 (30%)</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>DAO 거버넌스 제안 필요</li>
                  <li>커뮤니티 투표 과반수 승인</li>
                  <li>사용 목적 명확한 문서화</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Multisig Configuration */}
      <Card data-testid="card-multisig-config">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            멀티시그 구성 및 투명성
          </CardTitle>
          <CardDescription>재단 관리 토큰 실행 프로토콜</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Key className="h-4 w-4 text-primary" />
                서명 요구사항
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-muted/50 rounded">
                  <span>필요 서명 수</span>
                  <span className="font-medium">3/5</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/50 rounded">
                  <span>총 서명자</span>
                  <span className="font-medium">5명</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/50 rounded">
                  <span>키 분산</span>
                  <span className="font-medium">지리적 분산</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                타임락 메커니즘
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-muted/50 rounded">
                  <span>표준 타임락</span>
                  <span className="font-medium">168시간 (7일)</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/50 rounded">
                  <span>긴급 타임락</span>
                  <span className="font-medium">48시간 (5/5 서명)</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/50 rounded">
                  <span>최대 타임락</span>
                  <span className="font-medium">30일</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-primary" />
                투명성 요구사항
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-muted/50 rounded">
                  <span>분기 보고서</span>
                  <span className="font-medium">필수</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/50 rounded">
                  <span>온체인 공개</span>
                  <span className="font-medium">모든 트랜잭션</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/50 rounded">
                  <span>외부 감사</span>
                  <span className="font-medium">연간</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 20-Year Distribution Schedule */}
      <Card data-testid="card-20year-schedule">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            20년 토큰 분배 스케줄
          </CardTitle>
          <CardDescription>커스터디 메커니즘별 연간 토큰 해제 계획</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Distribution Chart */}
          <div className="h-80 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={generate20YearSchedule()}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value) => `${(value / 1e9).toFixed(0)}B`} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${(value / 1e9).toFixed(2)}B TBURN`,
                    name
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="protocol" 
                  stackId="1" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  name="프로토콜 자동화"
                />
                <Area 
                  type="monotone" 
                  dataKey="vesting" 
                  stackId="1" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  name="베스팅 컨트랙트"
                />
                <Area 
                  type="monotone" 
                  dataKey="foundation" 
                  stackId="1" 
                  stroke="#8B5CF6" 
                  fill="#8B5CF6" 
                  name="재단 멀티시그"
                />
                <Area 
                  type="monotone" 
                  dataKey="community" 
                  stackId="1" 
                  stroke="#F59E0B" 
                  fill="#F59E0B" 
                  name="커뮤니티 풀"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Schedule Table */}
          <ScrollArea className="h-80">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky top-0 bg-background">연도</TableHead>
                  <TableHead className="sticky top-0 bg-background">프로토콜 자동화</TableHead>
                  <TableHead className="sticky top-0 bg-background">베스팅 컨트랙트</TableHead>
                  <TableHead className="sticky top-0 bg-background">재단 멀티시그</TableHead>
                  <TableHead className="sticky top-0 bg-background">커뮤니티 풀</TableHead>
                  <TableHead className="sticky top-0 bg-background">연간 합계</TableHead>
                  <TableHead className="sticky top-0 bg-background">누적 비율</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {generate20YearSchedule().map((row, idx) => (
                  <TableRow key={row.year} data-testid={`row-schedule-year-${idx}`}>
                    <TableCell className="font-medium">{row.year}</TableCell>
                    <TableCell className="font-mono text-xs">{(row.protocol / 1e9).toFixed(2)}B</TableCell>
                    <TableCell className="font-mono text-xs">{(row.vesting / 1e9).toFixed(2)}B</TableCell>
                    <TableCell className="font-mono text-xs">{(row.foundation / 1e9).toFixed(2)}B</TableCell>
                    <TableCell className="font-mono text-xs">{(row.community / 1e9).toFixed(2)}B</TableCell>
                    <TableCell className="font-mono text-xs font-medium">{(row.total / 1e9).toFixed(2)}B</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={row.cumulative} className="h-2 w-16" />
                        <span className="text-xs text-muted-foreground">{row.cumulative.toFixed(1)}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>

          {/* Schedule Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
            <div className="p-3 rounded-lg bg-emerald-500/10 text-center">
              <div className="text-xs text-muted-foreground mb-1">프로토콜 자동화 총합</div>
              <div className="text-lg font-bold text-emerald-500">110B TBURN</div>
              <div className="text-xs text-muted-foreground">22%</div>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 text-center">
              <div className="text-xs text-muted-foreground mb-1">베스팅 컨트랙트 총합</div>
              <div className="text-lg font-bold text-blue-500">155B TBURN</div>
              <div className="text-xs text-muted-foreground">31%</div>
            </div>
            <div className="p-3 rounded-lg bg-purple-500/10 text-center">
              <div className="text-xs text-muted-foreground mb-1">재단 멀티시그 총합</div>
              <div className="text-lg font-bold text-purple-500">85B TBURN</div>
              <div className="text-xs text-muted-foreground">17%</div>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 text-center">
              <div className="text-xs text-muted-foreground mb-1">커뮤니티 풀 총합</div>
              <div className="text-lg font-bold text-amber-500">150B TBURN</div>
              <div className="text-xs text-muted-foreground">30%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Generate 20-year distribution schedule data
// Verified to sum exactly to 100% (500B TBURN)
function generate20YearSchedule() {
  const TOTAL_SUPPLY = 500_000_000_000;
  const schedule = [];
  let cumulativePercent = 0;

  // Define release patterns for each custody category
  // Protocol: 22% = 110B, linear 5% per year = 5.5B/year
  const protocolPerYear = TOTAL_SUPPLY * 0.22 / 20; // 5.5B per year
  
  // Vesting: 31% = 155B
  // First 4 years: 60% (93B) = 23.25B/year
  // Years 5-20: 40% (62B) = 3.875B/year
  const vestingEarly = TOTAL_SUPPLY * 0.31 * 0.60 / 4; // 23.25B/year for years 1-4
  const vestingLate = TOTAL_SUPPLY * 0.31 * 0.40 / 16; // 3.875B/year for years 5-20
  
  // Foundation: 17% = 85B
  // First 5 years: 50% (42.5B) = 8.5B/year
  // Years 6-10: 30% (25.5B) = 5.1B/year
  // Years 11-20: 20% (17B) = 1.7B/year
  const foundationEarly = TOTAL_SUPPLY * 0.17 * 0.50 / 5; // 8.5B/year
  const foundationMid = TOTAL_SUPPLY * 0.17 * 0.30 / 5; // 5.1B/year
  const foundationLate = TOTAL_SUPPLY * 0.17 * 0.20 / 10; // 1.7B/year
  
  // Community: 30% = 150B
  // First 5 years: 20% (30B) = 6B/year
  // Years 6-10: 30% (45B) = 9B/year
  // Years 11-20: 50% (75B) = 7.5B/year
  const communityEarly = TOTAL_SUPPLY * 0.30 * 0.20 / 5; // 6B/year
  const communityMid = TOTAL_SUPPLY * 0.30 * 0.30 / 5; // 9B/year
  const communityLate = TOTAL_SUPPLY * 0.30 * 0.50 / 10; // 7.5B/year

  for (let i = 0; i < 20; i++) {
    const year = 2025 + i;
    
    // Protocol: Linear release over 20 years
    const protocol = protocolPerYear;
    
    // Vesting: Front-loaded
    const vesting = i < 4 ? vestingEarly : vestingLate;
    
    // Foundation: Decreasing over time
    let foundation = 0;
    if (i < 5) {
      foundation = foundationEarly;
    } else if (i < 10) {
      foundation = foundationMid;
    } else {
      foundation = foundationLate;
    }
    
    // Community: DAO-driven, increasing over time
    let community = 0;
    if (i < 5) {
      community = communityEarly;
    } else if (i < 10) {
      community = communityMid;
    } else {
      community = communityLate;
    }

    const total = protocol + vesting + foundation + community;
    cumulativePercent += (total / TOTAL_SUPPLY) * 100;

    schedule.push({
      year: year.toString(),
      protocol,
      vesting,
      foundation,
      community,
      total,
      cumulative: Math.min(cumulativePercent, 100)
    });
  }

  return schedule;
}

function AirdropSection({ stats }: { stats?: DashboardStats['airdrop'] }) {
  const { data: claimsData } = useQuery<{ success: boolean; data: { claims: any[]; stats: any } }>({
    queryKey: ['/api/admin/token-programs/airdrop/claims'],
  });

  const claims = claimsData?.data?.claims || [];
  const claimRate = stats ? ((stats.totalClaimed / (stats.totalEligible || 1)) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Eligible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats?.totalEligible || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Claimed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats?.totalClaimed || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Claim Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{claimRate}%</div>
            <Progress value={parseFloat(claimRate)} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Claimed Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTBURN(stats?.claimedAmount || '0')}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Claims</CardTitle>
          <CardDescription>Latest airdrop claim activity</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Wallet</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No claims recorded yet
                  </TableCell>
                </TableRow>
              ) : (
                claims.slice(0, 10).map((claim: any) => (
                  <TableRow key={claim.id}>
                    <TableCell className="font-mono text-xs">{claim.walletAddress?.slice(0, 12)}...</TableCell>
                    <TableCell>{formatTBURN(claim.claimableAmount || '0')}</TableCell>
                    <TableCell>
                      <Badge variant={claim.status === 'claimed' ? 'default' : 'secondary'}>
                        {claim.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(claim.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function ReferralSection({ stats }: { stats?: DashboardStats['referral'] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats?.totalAccounts || 0)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats?.totalReferrals || 0)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Active Referrers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats?.activeReferrers || 0)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatTBURN(stats?.totalEarnings || '0')}</div>
        </CardContent>
      </Card>
    </div>
  );
}

function EventsSection({ stats }: { stats?: DashboardStats['events'] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats?.totalEvents || 0)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Active Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats?.activeEvents || 0)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats?.totalParticipants || 0)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Rewards Distributed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatTBURN(stats?.totalRewardsDistributed || '0')}</div>
        </CardContent>
      </Card>
    </div>
  );
}

function CommunitySection({ stats }: { stats?: DashboardStats['community'] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats?.totalTasks || 0)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats?.activeTasks || 0)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Contributions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats?.totalContributions || 0)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Points Distributed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats?.totalPointsDistributed || 0)}</div>
        </CardContent>
      </Card>
    </div>
  );
}

function DaoSection({ stats }: { stats?: DashboardStats['dao'] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats?.totalProposals || 0)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Active Proposals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats?.activeProposals || 0)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Passed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats?.passedProposals || 0)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Voters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats?.totalVoters || 0)}</div>
        </CardContent>
      </Card>
    </div>
  );
}

function BlockRewardsSection({ stats }: { stats?: DashboardStats['blockRewards'] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Cycles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats?.totalCycles || 0)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatTBURN(stats?.totalRewards || '0')}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Gas Fees Collected</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatTBURN(stats?.totalGasFees || '0')}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Avg Reward/Cycle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatTBURN(stats?.avgRewardPerCycle || '0')}</div>
        </CardContent>
      </Card>
    </div>
  );
}

function ValidatorSection({ stats }: { stats?: DashboardStats['validatorIncentives'] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats?.totalPayouts || 0)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatTBURN(stats?.totalAmount || '0')}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Avg Uptime</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{(stats?.avgUptimePercent || 99.9).toFixed(2)}%</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats?.topPerformers || 0)}</div>
        </CardContent>
      </Card>
    </div>
  );
}

function GrantsSection({ stats }: { stats?: DashboardStats['ecosystemGrants'] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Grants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats?.totalGrants || 0)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Active Grants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats?.activeGrants || 0)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Requested</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatTBURN(stats?.totalRequested || '0')}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Disbursed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatTBURN(stats?.totalDisbursed || '0')}</div>
        </CardContent>
      </Card>
    </div>
  );
}
