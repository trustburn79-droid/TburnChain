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
          <h1 className="text-3xl font-semibold">{t("dashboard.explorerTitle")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("dashboard.explorerSubtitle")}
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
            <Skeleton key="stats-sk-1" className="h-32" />
            <Skeleton key="stats-sk-2" className="h-32" />
            <Skeleton key="stats-sk-3" className="h-32" />
            <Skeleton key="stats-sk-4" className="h-32" />
          </>
        ) : (
          <>
            <StatCard
              key="stat-tps"
              title={t("dashboard.currentTps")}
              value={formatNumber(networkStats?.tps || 0)}
              icon={Zap}
              trend={{ value: 12.5, isPositive: true }}
              subtitle={`${t("dashboard.peak")}: ${formatNumber(networkStats?.peakTps || 0)} TPS`}
            />
            <StatCard
              key="stat-height"
              title={t("dashboard.blockHeight")}
              value={formatNumber(networkStats?.currentBlockHeight || 0)}
              icon={Blocks}
              subtitle={t("dashboard.latestBlock")}
            />
            <StatCard
              key="stat-time"
              title={t("dashboard.blockTime")}
              value={`${networkStats?.avgBlockTime || 0}ms`}
              icon={Clock}
              trend={{ value: 5.2, isPositive: false }}
              subtitle={`P99: ${networkStats?.blockTimeP99 || 0}ms`}
            />
            <StatCard
              key="stat-uptime"
              title={t("dashboard.slaUptime")}
              value={`${((networkStats?.slaUptime || 9990) / 100).toFixed(2)}%`}
              icon={Activity}
              subtitle={t("dashboard.last30Days")}
            />
          </>
        )}
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        {statsLoading ? (
          <>
            <Skeleton key="sec-sk-1" className="h-24" />
            <Skeleton key="sec-sk-2" className="h-24" />
            <Skeleton key="sec-sk-3" className="h-24" />
            <Skeleton key="sec-sk-4" className="h-24" />
          </>
        ) : (
          <>
            <Card key="card-total-tx" className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("dashboard.totalTransactions")}
                </CardTitle>
                <Activity className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                  {formatNumber(networkStats?.totalTransactions || 0)}
                </div>
              </CardContent>
            </Card>
            <Card key="card-total-accounts" className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("dashboard.totalAccounts")}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                  {formatNumber(networkStats?.totalAccounts || 0)}
                </div>
              </CardContent>
            </Card>
            <Card key="card-tburn-price" className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("dashboard.tburnPrice")}
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
            <Card key="card-market-cap" className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("dashboard.marketCap")}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                  ${formatNumber(networkStats?.marketCap || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("dashboard.priceFormula")}
                </p>
              </CardContent>
            </Card>
            <Card key="card-active-validators" className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("dashboard.activeValidators")}
                </CardTitle>
                <Server className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                  {networkStats?.activeValidators || 0} / {networkStats?.totalValidators || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("dashboard.percentOnline", { percent: ((networkStats?.activeValidators || 0) / (networkStats?.totalValidators || 1) * 100).toFixed(1) })}
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
          {t("dashboard.tokenomicsEmission")}
        </h2>
        {tokenomicsLoading ? (
          <div className="grid gap-4 md:grid-cols-4">
            <Skeleton key="token-sk-1" className="h-32" />
            <Skeleton key="token-sk-2" className="h-32" />
            <Skeleton key="token-sk-3" className="h-32" />
            <Skeleton key="token-sk-4" className="h-32" />
          </div>
        ) : tokenomics ? (
          <>
            <div key="tokenomics-emission-grid" className="grid gap-4 md:grid-cols-4 mb-4">
              <Card key="card-daily-emission" className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t("dashboard.dailyEmission")}
                  </CardTitle>
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold tabular-nums text-green-600" data-testid="stat-daily-emission">
                    {formatNumber(tokenomics.emission.dailyGrossEmission)} TBURN
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard.grossBlockRewards")}
                  </p>
                </CardContent>
              </Card>
              <Card key="card-daily-burn" className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t("dashboard.dailyBurn", { rate: tokenomics.emission.burnRate })}
                  </CardTitle>
                  <Flame className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold tabular-nums text-orange-500" data-testid="stat-daily-burn">
                    {formatNumber(tokenomics.emission.dailyBurn)} TBURN
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard.burnedFromFees")}
                  </p>
                </CardContent>
              </Card>
              <Card key="card-net-emission" className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t("dashboard.netDailyEmission")}
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold tabular-nums" data-testid="stat-net-emission">
                    {formatNumber(tokenomics.emission.dailyNetEmission)} TBURN
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard.annualInflation", { rate: tokenomics.emission.annualInflationRate.toFixed(2) })}
                  </p>
                </CardContent>
              </Card>
              <Card key="card-staking-rate" className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t("dashboard.stakingRate")}
                  </CardTitle>
                  <Award className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold tabular-nums text-purple-500" data-testid="stat-staking-rate">
                    {tokenomics.stakedPercent.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard.stakedOfTotal", { staked: formatNumber(tokenomics.stakedAmount / 1e6), total: formatNumber(tokenomics.totalSupply / 1e6) })}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tier Summary Cards */}
            <div key="tokenomics-tier-grid" className="grid gap-4 md:grid-cols-3">
              <Card key="card-tier1" className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5 hover-elevate">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-500" />
                    {t("dashboard.tier1ActiveCommittee")}
                  </CardTitle>
                  <CardDescription>{t("dashboard.tier1Desc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-bold text-amber-500" data-testid="tier1-validators">{tokenomics.tiers.tier1.currentValidators || 0}</p>
                      <p className="text-xs text-muted-foreground">{t("dashboard.validators")}</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-500">{tokenomics.tiers.tier1.targetAPY}%</p>
                      <p className="text-xs text-muted-foreground">{t("dashboard.apy")}</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{formatNumber(tokenomics.tiers.tier1.dailyRewardPool)}</p>
                      <p className="text-xs text-muted-foreground">{t("dashboard.tburnPerDay")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card key="card-tier2" className="border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 hover-elevate">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Layers className="h-4 w-4 text-blue-500" />
                    {t("dashboard.tier2StandbyValidators")}
                  </CardTitle>
                  <CardDescription>{t("dashboard.tier2Desc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-bold text-blue-500" data-testid="tier2-validators">{tokenomics.tiers.tier2.currentValidators || 0}</p>
                      <p className="text-xs text-muted-foreground">{t("dashboard.validators")}</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-500">{tokenomics.tiers.tier2.targetAPY}%</p>
                      <p className="text-xs text-muted-foreground">{t("dashboard.apy")}</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{formatNumber(tokenomics.tiers.tier2.dailyRewardPool)}</p>
                      <p className="text-xs text-muted-foreground">{t("dashboard.tburnPerDay")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card key="card-tier3" className="border-gray-500/30 bg-gradient-to-br from-gray-500/5 to-slate-500/5 hover-elevate">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    {t("dashboard.tier3Delegators")}
                  </CardTitle>
                  <CardDescription>{t("dashboard.tier3Desc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-bold text-gray-500" data-testid="tier3-delegators">{formatNumber(tokenomics.tiers.tier3.currentDelegators || 0)}</p>
                      <p className="text-xs text-muted-foreground">{t("dashboard.delegators")}</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-500">{tokenomics.tiers.tier3.targetAPY}%</p>
                      <p className="text-xs text-muted-foreground">{t("dashboard.apy")}</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{formatNumber(tokenomics.tiers.tier3.dailyRewardPool)}</p>
                      <p className="text-xs text-muted-foreground">{t("dashboard.tburnPerDay")}</p>
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
          {t("dashboard.memberManagement")}
        </h2>
        <div className="grid gap-4 md:grid-cols-5">
          {memberStatsLoading ? (
            <>
              <Skeleton key="member-sk-1" className="h-24" />
              <Skeleton key="member-sk-2" className="h-24" />
              <Skeleton key="member-sk-3" className="h-24" />
              <Skeleton key="member-sk-4" className="h-24" />
              <Skeleton key="member-sk-5" className="h-24" />
            </>
          ) : (
            <>
              <Card key="card-total-members" className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t("dashboard.totalMembers")}
                  </CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold tabular-nums">
                    {formatNumber(memberStats?.totalMembers || 0)}
                  </div>
                </CardContent>
              </Card>
              <Card key="card-active-members" className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t("dashboard.activeMembers")}
                  </CardTitle>
                  <Activity className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold tabular-nums">
                    {formatNumber(memberStats?.activeMembers || 0)}
                  </div>
                </CardContent>
              </Card>
              <Card key="card-total-validators-label" className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t("dashboard.totalValidatorsLabel")}
                  </CardTitle>
                  <Shield className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold tabular-nums">
                    {formatNumber(memberStats?.totalValidators || 0)}
                  </div>
                </CardContent>
              </Card>
              <Card key="card-total-stakers" className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t("dashboard.totalStakers")}
                  </CardTitle>
                  <Award className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold tabular-nums">
                    {formatNumber(memberStats?.totalStakers || 0)}
                  </div>
                </CardContent>
              </Card>
              <Card key="card-kyc-verified" className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t("dashboard.kycVerified")}
                  </CardTitle>
                  <Shield className="h-4 w-4 text-indigo-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold tabular-nums">
                    {formatNumber(memberStats?.kycVerified || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard.percentVerified", { percent: ((memberStats?.kycVerified || 0) / (memberStats?.totalMembers || 1) * 100).toFixed(1) })}
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
          {t("dashboard.defiEcosystem")}
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {defiLoading ? (
            <>
              <Skeleton key="defi-sk-1" className="h-32" />
              <Skeleton key="defi-sk-2" className="h-32" />
              <Skeleton key="defi-sk-3" className="h-32" />
              <Skeleton key="defi-sk-4" className="h-32" />
              <Skeleton key="defi-sk-5" className="h-32" />
              <Skeleton key="defi-sk-6" className="h-32" />
              <Skeleton key="defi-sk-7" className="h-32" />
              <Skeleton key="defi-sk-8" className="h-32" />
            </>
          ) : (
            <>
              <Link key="link-dex" href="/dex">
                <Card className="hover-elevate cursor-pointer" data-testid="card-dex-stats">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t("dashboard.dexAmm")}
                    </CardTitle>
                    <ArrowRightLeft className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold tabular-nums">
                      {dexStats?.totalPools || 0} {t("dashboard.pools")}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ${formatNumber(Number(dexStats?.totalTvlUsd || 0) / 1e18)} {t("dashboard.tvl")}
                    </p>
                    <p className="text-xs text-green-500 mt-0.5">
                      {t("dashboard.swaps24h", { count: dexStats?.totalSwaps24h || 0 })}
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link key="link-lending" href="/lending">
                <Card className="hover-elevate cursor-pointer" data-testid="card-lending-stats">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t("dashboard.lending")}
                    </CardTitle>
                    <Landmark className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold tabular-nums">
                      {lendingStats?.totalMarkets || 0} {t("dashboard.markets")}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ${formatNumber(Number(lendingStats?.totalValueLockedUsd || 0) / 1e18)} {t("dashboard.supplied")}
                    </p>
                    <p className="text-xs text-green-500 mt-0.5">
                      {t("dashboard.avgApy", { rate: ((lendingStats?.avgSupplyRate || 0) / 100).toFixed(2) })}
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link key="link-yield" href="/yield">
                <Card className="hover-elevate cursor-pointer" data-testid="card-yield-stats">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t("dashboard.yieldFarming")}
                    </CardTitle>
                    <Sprout className="h-4 w-4 text-lime-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold tabular-nums">
                      {yieldStats?.totalVaults || 0} {t("dashboard.vaults")}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ${formatNumber(Number(yieldStats?.totalTvlUsd || 0) / 1e18)} {t("dashboard.tvl")}
                    </p>
                    <p className="text-xs text-green-500 mt-0.5">
                      {t("dashboard.avgApy", { rate: ((yieldStats?.avgVaultApy || 0) / 100).toFixed(2) })}
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link key="link-liquid-staking" href="/liquid-staking">
                <Card className="hover-elevate cursor-pointer" data-testid="card-lst-stats">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t("dashboard.liquidStaking")}
                    </CardTitle>
                    <Droplets className="h-4 w-4 text-cyan-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold tabular-nums">
                      {lstStats?.totalPools || 0} {t("dashboard.pools")}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ${formatNumber(Number(lstStats?.totalStakedUsd || 0) / 1e18)} {t("dashboard.staked")}
                    </p>
                    <p className="text-xs text-green-500 mt-0.5">
                      {t("dashboard.avgApy", { rate: ((lstStats?.avgPoolApy || 0) / 100).toFixed(2) })}
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link key="link-nft" href="/nft">
                <Card className="hover-elevate cursor-pointer" data-testid="card-nft-stats">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t("dashboard.nftMarketplace")}
                    </CardTitle>
                    <Image className="h-4 w-4 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold tabular-nums">
                      {nftStats?.totalCollections || 0} {t("dashboard.collections")}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatNumber(nftStats?.totalItems || 0)} {t("dashboard.items")}
                    </p>
                    <p className="text-xs text-green-500 mt-0.5">
                      {t("dashboard.sales24h", { count: nftStats?.salesCount24h || 0 })}
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link key="link-launchpad" href="/launchpad">
                <Card className="hover-elevate cursor-pointer" data-testid="card-launchpad-stats">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t("dashboard.launchpad")}
                    </CardTitle>
                    <Rocket className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold tabular-nums">
                      {launchpadStats?.totalProjects || 0} {t("dashboard.projects")}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {launchpadStats?.activeProjects || 0} {t("dashboard.active")}
                    </p>
                    <p className="text-xs text-green-500 mt-0.5">
                      ${formatNumber(Number(launchpadStats?.totalRaised || 0) / 1e18)} {t("dashboard.raised")}
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link key="link-gamefi" href="/gamefi">
                <Card className="hover-elevate cursor-pointer" data-testid="card-gamefi-stats">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t("dashboard.gamefi")}
                    </CardTitle>
                    <Gamepad2 className="h-4 w-4 text-pink-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold tabular-nums">
                      {gameFiStats?.totalProjects || 0} {t("dashboard.games")}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {gameFiStats?.activeTournaments || 0} {t("dashboard.tournaments")}
                    </p>
                    <p className="text-xs text-green-500 mt-0.5">
                      ${formatNumber(Number(gameFiStats?.totalRewardsDistributed || 0) / 1e18)} {t("dashboard.rewards")}
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link key="link-bridge" href="/bridge">
                <Card className="hover-elevate cursor-pointer" data-testid="card-bridge-stats">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t("dashboard.crossChainBridge")}
                    </CardTitle>
                    <Link2 className="h-4 w-4 text-indigo-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold tabular-nums">
                      {bridgeStats?.activeChains || 0} {t("dashboard.chains")}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ${formatNumber(Number(bridgeStats?.totalLiquidity || 0) / 1e18)} {t("dashboard.liquidity")}
                    </p>
                    <p className="text-xs text-green-500 mt-0.5">
                      {t("dashboard.transfers24h", { count: bridgeStats?.transferCount24h || 0 })}
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
              {t("dashboard.latestBlocks")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {blocksLoading ? (
                <>
                  <Skeleton key="block-sk-1" className="h-16" />
                  <Skeleton key="block-sk-2" className="h-16" />
                  <Skeleton key="block-sk-3" className="h-16" />
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
                          {block.transactionCount} {t("dashboard.txs")}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{t("dashboard.validator")}:</span>
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
                  {t("dashboard.noBlocksFound")}
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
              {t("dashboard.latestTransactions")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {txsLoading ? (
                <>
                  <Skeleton key="tx-sk-1" className="h-16" />
                  <Skeleton key="tx-sk-2" className="h-16" />
                  <Skeleton key="tx-sk-3" className="h-16" />
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
                        <span>{t("dashboard.fromLabel")}:</span>
                        <span className="font-mono">{formatAddress(tx.from)}</span>
                        <span>→</span>
                        <span className="font-mono">{formatAddress(tx.to || t("dashboard.contract"))}</span>
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
                  {t("dashboard.noTransactionsFound")}
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
              {t("common.block")} #{selectedBlock?.blockNumber ? formatNumber(selectedBlock.blockNumber) : ''}
            </DialogTitle>
            <DialogDescription>
              {t("dashboard.blockDetails")}
            </DialogDescription>
          </DialogHeader>
          {selectedBlock && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Hash className="h-3 w-3" /> {t("dashboard.blockNumber")}
                  </p>
                  <p className="font-mono font-semibold">{formatNumber(selectedBlock.blockNumber)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {t("dashboard.timestamp")}
                  </p>
                  <p className="font-mono text-sm">{new Date(selectedBlock.timestamp * 1000).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Hash className="h-3 w-3" /> {t("dashboard.blockHash")}
                </p>
                <p className="font-mono text-sm break-all bg-muted/50 p-2 rounded">{selectedBlock.hash}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Hash className="h-3 w-3" /> {t("dashboard.parentHash")}
                </p>
                <p className="font-mono text-sm break-all bg-muted/50 p-2 rounded">{selectedBlock.parentHash}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Cpu className="h-3 w-3" /> {t("dashboard.validator")}
                  </p>
                  <p className="font-mono text-sm break-all">{selectedBlock.validatorAddress}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <FileText className="h-3 w-3" /> {t("dashboard.transactions")}
                  </p>
                  <Badge variant="secondary" className="text-sm">{t("dashboard.nTransactions", { count: selectedBlock.transactionCount })}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Fuel className="h-3 w-3" /> {t("dashboard.gasUsed")}
                  </p>
                  <p className="font-mono">{formatNumber(parseInt(String(selectedBlock.gasUsed || '0')))} EMB</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Fuel className="h-3 w-3" /> {t("dashboard.gasLimit")}
                  </p>
                  <p className="font-mono">{formatNumber(parseInt(String(selectedBlock.gasLimit || '0')))} EMB</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Layers className="h-3 w-3" /> {t("dashboard.shardId")}
                </p>
                <Badge variant="outline">{selectedBlock.shardId || t("dashboard.main")}</Badge>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedBlock(null)}>
                  {t("dashboard.close")}
                </Button>
                <Link href={`/blocks/${selectedBlock.blockNumber}`}>
                  <Button data-testid="button-view-block-details">
                    {t("dashboard.viewFullDetails")}
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
              {t("dashboard.transactionDetails")}
            </DialogTitle>
            <DialogDescription>
              {t("dashboard.transactionInfo")}
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
                  <Hash className="h-3 w-3" /> {t("dashboard.transactionHash")}
                </p>
                <p className="font-mono text-sm break-all bg-muted/50 p-2 rounded">{selectedTx.hash}</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" /> {t("dashboard.from")}
                  </p>
                  <p className="font-mono text-sm break-all bg-muted/50 p-2 rounded">{selectedTx.from}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <ArrowRight className="h-3 w-3" /> {t("dashboard.to")}
                  </p>
                  <p className="font-mono text-sm break-all bg-muted/50 p-2 rounded">{selectedTx.to || t("dashboard.contractCreation")}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <CircleDollarSign className="h-3 w-3" /> {t("dashboard.value")}
                  </p>
                  <p className="font-semibold text-lg text-green-600">{formatTokenAmount(selectedTx.value)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Blocks className="h-3 w-3" /> {t("dashboard.blockNumber")}
                  </p>
                  <p className="font-mono">{formatNumber(selectedTx.blockNumber)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Fuel className="h-3 w-3" /> {t("dashboard.gasUsed")}
                  </p>
                  <p className="font-mono">{formatNumber(parseInt(String(selectedTx.gasUsed || '0')))} EMB</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Fuel className="h-3 w-3" /> {t("dashboard.gasPrice")}
                  </p>
                  <p className="font-mono">{formatNumber(parseInt(String(selectedTx.gasPrice || '0')))} EMB</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Hash className="h-3 w-3" /> {t("dashboard.nonce")}
                  </p>
                  <p className="font-mono">{selectedTx.nonce}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Layers className="h-3 w-3" /> {t("dashboard.shard")}
                  </p>
                  <Badge variant="outline">{selectedTx.shardId || t("dashboard.main")}</Badge>
                </div>
              </div>

              {selectedTx.input && selectedTx.input !== '0x' && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <FileText className="h-3 w-3" /> {t("dashboard.inputData")}
                  </p>
                  <p className="font-mono text-xs break-all bg-muted/50 p-2 rounded max-h-24 overflow-y-auto">
                    {selectedTx.input}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedTx(null)}>
                  {t("dashboard.close")}
                </Button>
                <Link href={`/transactions/${selectedTx.hash}`}>
                  <Button data-testid="button-view-tx-details">
                    {t("dashboard.viewFullDetails")}
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
