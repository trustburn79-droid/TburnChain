import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
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
  ArrowUpRight, BarChart3, Eye, Send, Wifi, WifiOff
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

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

  const stats = dashboardData?.data;

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast({ title: "Data Refreshed", description: "Token distribution stats updated" });
  }, [refetch, toast]);

  const programCards = [
    { key: 'airdrop', title: 'Airdrop', icon: Gift, color: 'bg-emerald-500', stats: stats?.airdrop },
    { key: 'referral', title: 'Referral', icon: Users, color: 'bg-blue-500', stats: stats?.referral },
    { key: 'events', title: 'Events', icon: Calendar, color: 'bg-purple-500', stats: stats?.events },
    { key: 'community', title: 'Community', icon: Award, color: 'bg-amber-500', stats: stats?.community },
    { key: 'dao', title: 'DAO Governance', icon: Vote, color: 'bg-rose-500', stats: stats?.dao },
    { key: 'blockRewards', title: 'Block Rewards', icon: Blocks, color: 'bg-cyan-500', stats: stats?.blockRewards },
    { key: 'validatorIncentives', title: 'Validator Incentives', icon: Server, color: 'bg-indigo-500', stats: stats?.validatorIncentives },
    { key: 'ecosystemGrants', title: 'Ecosystem Grants', icon: Sprout, color: 'bg-lime-500', stats: stats?.ecosystemGrants },
  ];

  const pieChartData = programCards
    .filter(p => p.stats)
    .map((program, idx) => ({
      name: program.title,
      value: program.stats && 'totalParticipants' in program.stats ? program.stats.totalParticipants : 
             program.stats && 'totalAccounts' in program.stats ? program.stats.totalAccounts :
             program.stats && 'totalProposals' in program.stats ? program.stats.totalProposals :
             program.stats && 'totalCycles' in program.stats ? program.stats.totalCycles :
             program.stats && 'totalPayouts' in program.stats ? program.stats.totalPayouts :
             program.stats && 'totalGrants' in program.stats ? program.stats.totalGrants : 0,
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {programCards.map(program => (
              <Card key={program.key} className="hover-elevate cursor-pointer" data-testid={`card-program-${program.key}`}>
                <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
                  <div className={`p-2 rounded-lg ${program.color}`}>
                    <program.icon className="h-5 w-5 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-xs">Active</Badge>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold text-lg">{program.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {program.stats && 'totalParticipants' in program.stats && `${formatNumber(program.stats.totalParticipants)} participants`}
                    {program.stats && 'totalAccounts' in program.stats && `${formatNumber(program.stats.totalAccounts)} accounts`}
                    {program.stats && 'totalProposals' in program.stats && `${formatNumber(program.stats.totalProposals)} proposals`}
                    {program.stats && 'totalCycles' in program.stats && `${formatNumber(program.stats.totalCycles)} cycles`}
                    {program.stats && 'totalPayouts' in program.stats && `${formatNumber(program.stats.totalPayouts)} payouts`}
                    {program.stats && 'totalGrants' in program.stats && `${formatNumber(program.stats.totalGrants)} grants`}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

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
