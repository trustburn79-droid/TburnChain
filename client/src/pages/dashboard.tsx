import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Blocks,
  Clock,
  Server,
  TrendingUp,
  Users,
  Shield,
  Award,
  Zap,
  Coins,
  Flame,
  Crown,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { LiveIndicator } from "@/components/live-indicator";
import { SearchBar } from "@/components/search-bar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DataSourceBadge } from "@/components/data-source-badge";
import { formatAddress, formatTimeAgo, formatNumber, formatTokenAmount } from "@/lib/format";
import type { NetworkStats, Block, Transaction } from "@shared/schema";

interface TokenomicsData {
  tiers: {
    tier1: { name: string; currentValidators?: number; targetAPY: number; dailyRewardPool: number; rewardPoolShare: number };
    tier2: { name: string; currentValidators?: number; targetAPY: number; dailyRewardPool: number; rewardPoolShare: number };
    tier3: { name: string; currentDelegators?: number; targetAPY: number; dailyRewardPool: number; rewardPoolShare: number };
  };
  emission: {
    dailyGrossEmission: number;
    dailyBurn: number;
    dailyNetEmission: number;
    annualInflationRate: number;
    burnRate: number;
  };
  stakedAmount: number;
  stakedPercent: number;
  totalSupply: number;
  circulatingSupply: number;
}

interface MemberStats {
  totalMembers: number;
  activeMembers: number;
  totalValidators: number;
  totalStakers: number;
  kycVerified: number;
}

export default function Dashboard() {
  const { data: networkStats, isLoading: statsLoading } = useQuery<NetworkStats>({
    queryKey: ["/api/network/stats"],
  });

  const { data: recentBlocks, isLoading: blocksLoading } = useQuery<Block[]>({
    queryKey: ["/api/blocks/recent"],
  });

  const { data: recentTxs, isLoading: txsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions/recent"],
  });

  const { data: memberStats, isLoading: memberStatsLoading } = useQuery<MemberStats>({
    queryKey: ["/api/members/stats/summary"],
  });

  const { data: tokenomics, isLoading: tokenomicsLoading } = useQuery<TokenomicsData>({
    queryKey: ["/api/tokenomics/tiers"],
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header with Live Indicator */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">TBURN Explorer</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time blockchain data and network statistics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DataSourceBadge size="md" />
          <LiveIndicator />
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex justify-center">
        <SearchBar />
      </div>

      {/* Network Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <StatCard
              title="Current TPS"
              value={formatNumber(networkStats?.tps || 0)}
              icon={Zap}
              trend={{ value: 12.5, isPositive: true }}
              subtitle={`Peak: ${formatNumber(networkStats?.peakTps || 0)} TPS`}
              showDataSource={true}
            />
            <StatCard
              title="Block Height"
              value={formatNumber(networkStats?.currentBlockHeight || 0)}
              icon={Blocks}
              subtitle="latest block"
              showDataSource={true}
            />
            <StatCard
              title="Block Time"
              value={`${networkStats?.avgBlockTime || 0}ms`}
              icon={Clock}
              trend={{ value: 5.2, isPositive: false }}
              subtitle={`P99: ${networkStats?.blockTimeP99 || 0}ms`}
              showDataSource={true}
            />
            <StatCard
              title="SLA Uptime"
              value={`${((networkStats?.slaUptime || 9990) / 100).toFixed(2)}%`}
              icon={Activity}
              subtitle="last 30 days"
              showDataSource={true}
            />
          </>
        )}
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        {statsLoading ? (
          <>
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </>
        ) : (
          <>
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Transactions
                </CardTitle>
                <Activity className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                  {formatNumber(networkStats?.totalTransactions || 0)}
                </div>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Accounts
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                  {formatNumber(networkStats?.totalAccounts || 0)}
                </div>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  TBURN Price
                </CardTitle>
                <TrendingUp className={`h-4 w-4 ${((networkStats as any)?.priceChangePercent || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                  ${((networkStats as any)?.tokenPrice || 28.91).toFixed(2)}
                </div>
                <p className={`text-xs mt-1 ${((networkStats as any)?.priceChangePercent || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {((networkStats as any)?.priceChangePercent || 0) >= 0 ? '↑' : '↓'} {Math.abs((networkStats as any)?.priceChangePercent || 0).toFixed(2)}%
                </p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Market Cap
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                  ${formatNumber(networkStats?.marketCap || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  = Price × Circulating Supply
                </p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Validators
                </CardTitle>
                <Server className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                  {networkStats?.activeValidators || 0} / {networkStats?.totalValidators || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {((networkStats?.activeValidators || 0) / (networkStats?.totalValidators || 1) * 100).toFixed(1)}% online
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Tokenomics Overview */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Tokenomics & Emission
        </h2>
        {tokenomicsLoading ? (
          <div className="grid gap-4 md:grid-cols-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        ) : tokenomics ? (
          <>
            <div className="grid gap-4 md:grid-cols-4 mb-4">
              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Daily Emission
                  </CardTitle>
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold tabular-nums text-green-600" data-testid="stat-daily-emission">
                    {formatNumber(tokenomics.emission.dailyGrossEmission)} TBURN
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Gross block rewards
                  </p>
                </CardContent>
              </Card>
              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Daily Burn ({tokenomics.emission.burnRate}%)
                  </CardTitle>
                  <Flame className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold tabular-nums text-orange-500" data-testid="stat-daily-burn">
                    {formatNumber(tokenomics.emission.dailyBurn)} TBURN
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Burned from fees
                  </p>
                </CardContent>
              </Card>
              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Net Daily Emission
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold tabular-nums" data-testid="stat-net-emission">
                    {formatNumber(tokenomics.emission.dailyNetEmission)} TBURN
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {tokenomics.emission.annualInflationRate.toFixed(2)}% annual inflation
                  </p>
                </CardContent>
              </Card>
              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Staking Rate
                  </CardTitle>
                  <Award className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold tabular-nums text-purple-500" data-testid="stat-staking-rate">
                    {tokenomics.stakedPercent.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatNumber(tokenomics.stakedAmount / 1e6)}M of {formatNumber(tokenomics.totalSupply / 1e6)}M TBURN
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tier Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5 hover-elevate">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-500" />
                    Tier 1: Active Committee
                  </CardTitle>
                  <CardDescription>200K+ TBURN, max 512</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-bold text-amber-500" data-testid="tier1-validators">{tokenomics.tiers.tier1.currentValidators || 0}</p>
                      <p className="text-xs text-muted-foreground">Validators</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-500">{tokenomics.tiers.tier1.targetAPY}%</p>
                      <p className="text-xs text-muted-foreground">APY</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{formatNumber(tokenomics.tiers.tier1.dailyRewardPool)}</p>
                      <p className="text-xs text-muted-foreground">TBURN/day</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 hover-elevate">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Layers className="h-4 w-4 text-blue-500" />
                    Tier 2: Standby Validators
                  </CardTitle>
                  <CardDescription>50K+ TBURN, max 4,488</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-bold text-blue-500" data-testid="tier2-validators">{tokenomics.tiers.tier2.currentValidators || 0}</p>
                      <p className="text-xs text-muted-foreground">Validators</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-500">{tokenomics.tiers.tier2.targetAPY}%</p>
                      <p className="text-xs text-muted-foreground">APY</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{formatNumber(tokenomics.tiers.tier2.dailyRewardPool)}</p>
                      <p className="text-xs text-muted-foreground">TBURN/day</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-500/30 bg-gradient-to-br from-gray-500/5 to-slate-500/5 hover-elevate">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    Tier 3: Delegators
                  </CardTitle>
                  <CardDescription>100+ TBURN, unlimited</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-bold text-gray-500" data-testid="tier3-delegators">{formatNumber(tokenomics.tiers.tier3.currentDelegators || 0)}</p>
                      <p className="text-xs text-muted-foreground">Delegators</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-500">{tokenomics.tiers.tier3.targetAPY}%</p>
                      <p className="text-xs text-muted-foreground">APY</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{formatNumber(tokenomics.tiers.tier3.dailyRewardPool)}</p>
                      <p className="text-xs text-muted-foreground">TBURN/day</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </div>

      {/* Member Statistics */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Member Management
        </h2>
        <div className="grid gap-4 md:grid-cols-5">
          {memberStatsLoading ? (
            <>
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </>
          ) : (
            <>
              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Members
                  </CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold tabular-nums">
                    {formatNumber(memberStats?.totalMembers || 0)}
                  </div>
                </CardContent>
              </Card>
              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Members
                  </CardTitle>
                  <Activity className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold tabular-nums">
                    {formatNumber(memberStats?.activeMembers || 0)}
                  </div>
                </CardContent>
              </Card>
              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Validators
                  </CardTitle>
                  <Shield className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold tabular-nums">
                    {formatNumber(memberStats?.totalValidators || 0)}
                  </div>
                </CardContent>
              </Card>
              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Stakers
                  </CardTitle>
                  <Award className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold tabular-nums">
                    {formatNumber(memberStats?.totalStakers || 0)}
                  </div>
                </CardContent>
              </Card>
              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    KYC Verified
                  </CardTitle>
                  <Shield className="h-4 w-4 text-indigo-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold tabular-nums">
                    {formatNumber(memberStats?.kycVerified || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((memberStats?.kycVerified || 0) / (memberStats?.totalMembers || 1) * 100).toFixed(1)}% verified
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Blocks and Transactions Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Latest Blocks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Blocks className="h-5 w-5" />
              Latest Blocks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {blocksLoading ? (
                <>
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </>
              ) : recentBlocks && recentBlocks.length > 0 ? (
                recentBlocks.slice(0, 10).map((block) => (
                  <div
                    key={block.id}
                    className="flex items-center justify-between p-3 rounded-md hover-elevate border"
                    data-testid={`card-block-${block.blockNumber}`}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-sm">
                          #{formatNumber(block.blockNumber)}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {block.transactionCount} txs
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Validator:</span>
                        <span className="font-mono">
                          {formatAddress(block.validatorAddress)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">
                        {formatTimeAgo(block.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No blocks found
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Latest Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Latest Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {txsLoading ? (
                <>
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </>
              ) : recentTxs && recentTxs.length > 0 ? (
                recentTxs.slice(0, 10).map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-md hover-elevate border"
                    data-testid={`card-transaction-${tx.hash?.slice(0, 10) || 'unknown'}`}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">
                          {formatAddress(tx.hash, 8, 6)}
                        </span>
                        <Badge
                          variant={
                            tx.status === "success"
                              ? "default"
                              : tx.status === "failed"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {tx.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>From:</span>
                        <span className="font-mono">{formatAddress(tx.from)}</span>
                        <span>→</span>
                        <span className="font-mono">{formatAddress(tx.to || "Contract")}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {formatTokenAmount(tx.value)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTimeAgo(tx.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No transactions found
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
