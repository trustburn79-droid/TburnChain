import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
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
  X,
  Hash,
  Cpu,
  ArrowRight,
  FileText,
  CircleDollarSign,
  Fuel,
  ArrowRightLeft,
  Landmark,
  Sprout,
  Droplets,
  Image,
  Rocket,
  Gamepad2,
  Link2,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { LiveIndicator } from "@/components/live-indicator";
import { SearchBar } from "@/components/search-bar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatAddress, formatTimeAgo, formatNumber, formatTokenAmount } from "@/lib/format";
import type { NetworkStats, Block, Transaction } from "@shared/schema";
import { Link } from "wouter";

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

interface DexStats {
  totalPools: number;
  totalTvlUsd: string;
  totalVolume24h: string;
  totalFees24h: string;
  totalSwaps24h: number;
  totalLiquidityProviders: number;
}

interface LendingStats {
  totalValueLockedUsd: string;
  totalBorrowedUsd: string;
  totalMarkets: number;
  activeMarkets: number;
  totalUsers: number;
  avgSupplyRate: number;
  avgBorrowRate: number;
  avgUtilization: number;
  liquidations24h: number;
  atRiskPositions: number;
  liquidatablePositions: number;
}

interface YieldStats {
  totalTvlUsd: string;
  totalVaults: number;
  activeVaults: number;
  totalUsers: number;
  avgVaultApy: number;
  topVaultApy: number;
  totalProfitGenerated: string;
  deposits24h: string;
  withdrawals24h: string;
}

interface LstStats {
  totalStakedUsd: string;
  totalPools: number;
  activePools: number;
  totalStakers: number;
  avgPoolApy: number;
  topPoolApy: number;
  totalLstMinted: string;
  mints24h: string;
  redeems24h: string;
}

interface NftStats {
  totalVolume24h: string;
  totalVolume24hUsd: string;
  salesCount24h: number;
  activeListings: number;
  auctionListings: number;
  totalCollections: number;
  verifiedCollections: number;
  totalItems: number;
  activeTraders: number;
  avgFloorPrice: string;
}

interface LaunchpadStats {
  totalProjects: number;
  activeProjects: number;
  upcomingProjects: number;
  completedProjects: number;
  totalRaised: string;
  totalMinted: number;
  uniqueParticipants: number;
  featuredCount: number;
}

interface GameFiStats {
  totalProjects: number;
  activeProjects: number;
  totalPlayers: number;
  activePlayers24h: number;
  totalVolume: string;
  dailyVolume: string;
  totalRewardsDistributed: string;
  activeTournaments: number;
}

interface BridgeStats {
  totalChains: number;
  activeChains: number;
  totalRoutes: number;
  activeRoutes: number;
  totalValidators: number;
  activeValidators: number;
  totalLiquidity: string;
  totalVolume: string;
  volume24h: string;
  transferCount24h: number;
  avgTransferTime: number;
  successRate: number;
  fees24h: string;
  securityEventsCount: number;
}

export default function Dashboard() {
  const { t } = useTranslation();
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

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

  const { data: dexStats, isLoading: dexStatsLoading } = useQuery<DexStats>({
    queryKey: ["/api/dex/stats"],
    refetchInterval: 30000,
  });

  const { data: lendingStats, isLoading: lendingStatsLoading } = useQuery<LendingStats>({
    queryKey: ["/api/lending/stats"],
    refetchInterval: 30000,
  });

  const { data: yieldStats, isLoading: yieldStatsLoading } = useQuery<YieldStats>({
    queryKey: ["/api/yield/stats"],
    refetchInterval: 30000,
  });

  const { data: lstStats, isLoading: lstStatsLoading } = useQuery<LstStats>({
    queryKey: ["/api/liquid-staking/stats"],
    refetchInterval: 30000,
  });

  const { data: nftStats, isLoading: nftStatsLoading } = useQuery<NftStats>({
    queryKey: ["/api/nft/stats"],
    refetchInterval: 30000,
  });

  const { data: launchpadStats, isLoading: launchpadStatsLoading } = useQuery<LaunchpadStats>({
    queryKey: ["/api/launchpad/stats"],
    refetchInterval: 30000,
  });

  const { data: gameFiStats, isLoading: gameFiStatsLoading } = useQuery<GameFiStats>({
    queryKey: ["/api/gamefi/stats"],
    refetchInterval: 30000,
  });

  const { data: bridgeStats, isLoading: bridgeStatsLoading } = useQuery<BridgeStats>({
    queryKey: ["/api/bridge/stats"],
    refetchInterval: 30000,
  });

  const defiLoading = dexStatsLoading || lendingStatsLoading || yieldStatsLoading || lstStatsLoading || 
                      nftStatsLoading || launchpadStatsLoading || gameFiStatsLoading || bridgeStatsLoading;

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
            />
            <StatCard
              title="Block Height"
              value={formatNumber(networkStats?.currentBlockHeight || 0)}
              icon={Blocks}
              subtitle="latest block"
            />
            <StatCard
              title="Block Time"
              value={`${networkStats?.avgBlockTime || 0}ms`}
              icon={Clock}
              trend={{ value: 5.2, isPositive: false }}
              subtitle={`P99: ${networkStats?.blockTimeP99 || 0}ms`}
            />
            <StatCard
              title="SLA Uptime"
              value={`${((networkStats?.slaUptime || 9990) / 100).toFixed(2)}%`}
              icon={Activity}
              subtitle="last 30 days"
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

      {/* DeFi Ecosystem Overview */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          DeFi Ecosystem
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {defiLoading ? (
            <>
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </>
          ) : (
            <>
              <Link href="/dex">
                <Card className="hover-elevate cursor-pointer" data-testid="card-dex-stats">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      DEX/AMM
                    </CardTitle>
                    <ArrowRightLeft className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold tabular-nums">
                      {dexStats?.totalPools || 0} Pools
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ${formatNumber(Number(dexStats?.totalTvlUsd || 0) / 1e18)} TVL
                    </p>
                    <p className="text-xs text-green-500 mt-0.5">
                      {dexStats?.totalSwaps24h?.toLocaleString() || 0} swaps 24h
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/lending">
                <Card className="hover-elevate cursor-pointer" data-testid="card-lending-stats">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Lending
                    </CardTitle>
                    <Landmark className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold tabular-nums">
                      {lendingStats?.totalMarkets || 0} Markets
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ${formatNumber(Number(lendingStats?.totalValueLockedUsd || 0) / 1e18)} Supplied
                    </p>
                    <p className="text-xs text-green-500 mt-0.5">
                      ~{((lendingStats?.avgSupplyRate || 0) / 100).toFixed(2)}% Avg APY
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/yield">
                <Card className="hover-elevate cursor-pointer" data-testid="card-yield-stats">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Yield Farming
                    </CardTitle>
                    <Sprout className="h-4 w-4 text-lime-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold tabular-nums">
                      {yieldStats?.totalVaults || 0} Vaults
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ${formatNumber(Number(yieldStats?.totalTvlUsd || 0) / 1e18)} TVL
                    </p>
                    <p className="text-xs text-green-500 mt-0.5">
                      ~{((yieldStats?.avgVaultApy || 0) / 100).toFixed(2)}% Avg APY
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/liquid-staking">
                <Card className="hover-elevate cursor-pointer" data-testid="card-lst-stats">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Liquid Staking
                    </CardTitle>
                    <Droplets className="h-4 w-4 text-cyan-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold tabular-nums">
                      {lstStats?.totalPools || 0} Pools
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ${formatNumber(Number(lstStats?.totalStakedUsd || 0) / 1e18)} Staked
                    </p>
                    <p className="text-xs text-green-500 mt-0.5">
                      ~{((lstStats?.avgPoolApy || 0) / 100).toFixed(2)}% Avg APY
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/nft">
                <Card className="hover-elevate cursor-pointer" data-testid="card-nft-stats">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      NFT Marketplace
                    </CardTitle>
                    <Image className="h-4 w-4 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold tabular-nums">
                      {nftStats?.totalCollections || 0} Collections
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatNumber(nftStats?.totalItems || 0)} Items
                    </p>
                    <p className="text-xs text-green-500 mt-0.5">
                      {nftStats?.salesCount24h?.toLocaleString() || 0} sales 24h
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/launchpad">
                <Card className="hover-elevate cursor-pointer" data-testid="card-launchpad-stats">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Launchpad
                    </CardTitle>
                    <Rocket className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold tabular-nums">
                      {launchpadStats?.totalProjects || 0} Projects
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {launchpadStats?.activeProjects || 0} Active
                    </p>
                    <p className="text-xs text-green-500 mt-0.5">
                      ${formatNumber(Number(launchpadStats?.totalRaised || 0) / 1e18)} Raised
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/gamefi">
                <Card className="hover-elevate cursor-pointer" data-testid="card-gamefi-stats">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      GameFi
                    </CardTitle>
                    <Gamepad2 className="h-4 w-4 text-pink-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold tabular-nums">
                      {gameFiStats?.totalProjects || 0} Games
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {gameFiStats?.activeTournaments || 0} Tournaments
                    </p>
                    <p className="text-xs text-green-500 mt-0.5">
                      ${formatNumber(Number(gameFiStats?.totalRewardsDistributed || 0) / 1e18)} Rewards
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/bridge">
                <Card className="hover-elevate cursor-pointer" data-testid="card-bridge-stats">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Cross-Chain Bridge
                    </CardTitle>
                    <Link2 className="h-4 w-4 text-indigo-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold tabular-nums">
                      {bridgeStats?.activeChains || 0} Chains
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ${formatNumber(Number(bridgeStats?.totalLiquidity || 0) / 1e18)} Liquidity
                    </p>
                    <p className="text-xs text-green-500 mt-0.5">
                      {bridgeStats?.transferCount24h?.toLocaleString() || 0} transfers 24h
                    </p>
                  </CardContent>
                </Card>
              </Link>
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
                    className="flex items-center justify-between p-3 rounded-md hover-elevate border cursor-pointer"
                    data-testid={`card-block-${block.blockNumber}`}
                    onClick={() => setSelectedBlock(block)}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-sm text-primary">
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
                    className="flex items-center justify-between p-3 rounded-md hover-elevate border cursor-pointer"
                    data-testid={`card-transaction-${tx.hash?.slice(0, 10) || 'unknown'}`}
                    onClick={() => setSelectedTx(tx)}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-primary">
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

      {/* Block Detail Modal */}
      <Dialog open={!!selectedBlock} onOpenChange={(open) => !open && setSelectedBlock(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Blocks className="h-5 w-5 text-primary" />
              Block #{selectedBlock?.blockNumber ? formatNumber(selectedBlock.blockNumber) : ''}
            </DialogTitle>
            <DialogDescription>
              Block details and information
            </DialogDescription>
          </DialogHeader>
          {selectedBlock && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Hash className="h-3 w-3" /> Block Number
                  </p>
                  <p className="font-mono font-semibold">{formatNumber(selectedBlock.blockNumber)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Timestamp
                  </p>
                  <p className="font-mono text-sm">{new Date(selectedBlock.timestamp * 1000).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Hash className="h-3 w-3" /> Block Hash
                </p>
                <p className="font-mono text-sm break-all bg-muted/50 p-2 rounded">{selectedBlock.hash}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Hash className="h-3 w-3" /> Parent Hash
                </p>
                <p className="font-mono text-sm break-all bg-muted/50 p-2 rounded">{selectedBlock.parentHash}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Cpu className="h-3 w-3" /> Validator
                  </p>
                  <p className="font-mono text-sm break-all">{selectedBlock.validatorAddress}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <FileText className="h-3 w-3" /> Transactions
                  </p>
                  <Badge variant="secondary" className="text-sm">{selectedBlock.transactionCount} transactions</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Fuel className="h-3 w-3" /> Gas Used
                  </p>
                  <p className="font-mono">{formatNumber(parseInt(String(selectedBlock.gasUsed || '0')))} EMB</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Fuel className="h-3 w-3" /> Gas Limit
                  </p>
                  <p className="font-mono">{formatNumber(parseInt(String(selectedBlock.gasLimit || '0')))} EMB</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Layers className="h-3 w-3" /> Shard ID
                </p>
                <Badge variant="outline">{selectedBlock.shardId || 'Main'}</Badge>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedBlock(null)}>
                  Close
                </Button>
                <Link href={`/blocks/${selectedBlock.blockNumber}`}>
                  <Button data-testid="button-view-block-details">
                    View Full Details
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Transaction Detail Modal */}
      <Dialog open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Transaction Details
            </DialogTitle>
            <DialogDescription>
              Transaction information and status
            </DialogDescription>
          </DialogHeader>
          {selectedTx && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    selectedTx.status === "success"
                      ? "default"
                      : selectedTx.status === "failed"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {selectedTx.status?.toUpperCase()}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {formatTimeAgo(selectedTx.timestamp)}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Hash className="h-3 w-3" /> Transaction Hash
                </p>
                <p className="font-mono text-sm break-all bg-muted/50 p-2 rounded">{selectedTx.hash}</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" /> From
                  </p>
                  <p className="font-mono text-sm break-all bg-muted/50 p-2 rounded">{selectedTx.from}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <ArrowRight className="h-3 w-3" /> To
                  </p>
                  <p className="font-mono text-sm break-all bg-muted/50 p-2 rounded">{selectedTx.to || 'Contract Creation'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <CircleDollarSign className="h-3 w-3" /> Value
                  </p>
                  <p className="font-semibold text-lg text-green-600">{formatTokenAmount(selectedTx.value)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Blocks className="h-3 w-3" /> Block Number
                  </p>
                  <p className="font-mono">{formatNumber(selectedTx.blockNumber)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Fuel className="h-3 w-3" /> Gas Used
                  </p>
                  <p className="font-mono">{formatNumber(parseInt(String(selectedTx.gasUsed || '0')))} EMB</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Fuel className="h-3 w-3" /> Gas Price
                  </p>
                  <p className="font-mono">{formatNumber(parseInt(String(selectedTx.gasPrice || '0')))} EMB</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Hash className="h-3 w-3" /> Nonce
                  </p>
                  <p className="font-mono">{selectedTx.nonce}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Layers className="h-3 w-3" /> Shard
                  </p>
                  <Badge variant="outline">{selectedTx.shardId || 'Main'}</Badge>
                </div>
              </div>

              {selectedTx.input && selectedTx.input !== '0x' && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <FileText className="h-3 w-3" /> Input Data
                  </p>
                  <p className="font-mono text-xs break-all bg-muted/50 p-2 rounded max-h-24 overflow-y-auto">
                    {selectedTx.input}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedTx(null)}>
                  Close
                </Button>
                <Link href={`/transactions/${selectedTx.hash}`}>
                  <Button data-testid="button-view-tx-details">
                    View Full Details
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
