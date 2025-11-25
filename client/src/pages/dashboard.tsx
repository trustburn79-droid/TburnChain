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
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { LiveIndicator } from "@/components/live-indicator";
import { SearchBar } from "@/components/search-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DataSourceBadge } from "@/components/data-source-badge";
import { formatAddress, formatTimeAgo, formatNumber, formatTokenAmount } from "@/lib/format";
import type { NetworkStats, Block, Transaction } from "@shared/schema";

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
