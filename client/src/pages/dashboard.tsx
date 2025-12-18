import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Wifi,
  WifiOff,
  Grid3x3,
} from "lucide-react";
import { useEnterpriseShards } from "@/hooks/use-enterprise-shards";
import { StatCard } from "@/components/stat-card";
import { LiveIndicator } from "@/components/live-indicator";
import { SearchBar } from "@/components/search-bar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatAddress, formatTimeAgo, formatNumber, formatTokenAmount } from "@/lib/format";
import type { NetworkStats, Block, Transaction } from "@shared/schema";
import { Link } from "wouter";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line } from "recharts";
import { motion } from "framer-motion";

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

interface TpsDataPoint {
  time: string;
  tps: number;
  timestamp: number;
}

function NetworkHealthIndicator({ stats }: { stats: NetworkStats | undefined }) {
  const { t } = useTranslation();
  
  const healthScore = useMemo(() => {
    if (!stats) return 0;
    let score = 100;
    if ((stats.slaUptime || 9990) < 9900) score -= 20;
    if ((stats.activeValidators || 0) / (stats.totalValidators || 1) < 0.9) score -= 15;
    if ((stats.avgBlockTime || 0) > 500) score -= 10;
    return Math.max(0, score);
  }, [stats]);

  const healthStatus = useMemo(() => {
    if (healthScore >= 90) return { label: t("dashboard.healthy"), color: "text-green-500", bg: "bg-green-500" };
    if (healthScore >= 70) return { label: t("dashboard.warning"), color: "text-yellow-500", bg: "bg-yellow-500" };
    return { label: t("dashboard.critical"), color: "text-red-500", bg: "bg-red-500" };
  }, [healthScore, t]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 cursor-pointer" data-testid="network-health-indicator">
          <div className={`h-2 w-2 rounded-full ${healthStatus.bg} animate-pulse`} />
          <span className={`text-xs font-medium ${healthStatus.color}`}>{healthStatus.label}</span>
          <span className="text-xs text-muted-foreground">{healthScore}%</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{t("dashboard.networkHealthScore")}: {healthScore}%</p>
      </TooltipContent>
    </Tooltip>
  );
}

function TpsChart({ data }: { data: TpsDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={80}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <defs>
          <linearGradient id="tpsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="tps"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fill="url(#tpsGradient)"
          dot={false}
        />
        <RechartsTooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
            fontSize: '12px',
          }}
          formatter={(value: number) => [`${formatNumber(value)} TPS`, 'TPS']}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function DataSourceBadge() {
  const { t } = useTranslation();
  const { data: dataSource } = useQuery<{ dataSourceType: string; status: string }>({
    queryKey: ["/api/system/data-source"],
    refetchInterval: 30000,
  });

  const isLive = dataSource?.status === 'connected' || dataSource?.dataSourceType === 'local-simulated';

  return (
    <Badge 
      variant={isLive ? "default" : "secondary"} 
      className={`gap-1 ${isLive ? "bg-green-600 hover:bg-green-700 border-0" : ""}`}
      data-testid="data-source-badge"
    >
      {isLive ? (
        <Wifi className="h-3 w-3" />
      ) : (
        <WifiOff className="h-3 w-3" />
      )}
      {isLive ? t("dashboard.liveData") : t("dashboard.cached")}
    </Badge>
  );
}

function RefreshButton({ onRefresh, isRefreshing }: { onRefresh: () => void; isRefreshing: boolean }) {
  const { t } = useTranslation();
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onRefresh}
      disabled={isRefreshing}
      data-testid="button-refresh-dashboard"
    >
      <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
      {t("dashboard.refresh")}
    </Button>
  );
}

function ErrorCard({ title, message, onRetry }: { title: string; message: string; onRetry?: () => void }) {
  const { t } = useTranslation();
  
  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardContent className="flex items-center gap-4 p-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <div className="flex-1">
          <h4 className="font-medium text-destructive">{title}</h4>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            {t("dashboard.retry")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function WarningBanner({ type, message, onDismiss }: { type: 'warning' | 'info'; message: string; onDismiss?: () => void }) {
  return (
    <Card className={`${type === 'warning' ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-blue-500/50 bg-blue-500/5'}`}>
      <CardContent className="flex items-center gap-4 p-4">
        <AlertCircle className={`h-6 w-6 ${type === 'warning' ? 'text-yellow-500' : 'text-blue-500'}`} />
        <div className="flex-1">
          <p className={`text-sm ${type === 'warning' ? 'text-yellow-600 dark:text-yellow-400' : 'text-blue-600 dark:text-blue-400'}`}>
            {message}
          </p>
        </div>
        {onDismiss && (
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            Dismiss
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function DataIntegrityAlert({ stats, onRefresh }: { stats: NetworkStats | undefined; onRefresh: () => void }) {
  const { t } = useTranslation();
  
  const issues = useMemo(() => {
    const problems: string[] = [];
    if (!stats) {
      problems.push(t("dashboard.alerts.noData"));
      return problems;
    }
    
    if (stats.currentBlockHeight === 0) {
      problems.push(t("dashboard.alerts.blockHeightZero"));
    }
    if (stats.activeValidators === 0) {
      problems.push(t("dashboard.alerts.noValidators"));
    }
    if ((stats as any)._errorType) {
      const errorType = (stats as any)._errorType;
      if (errorType === 'api-rate-limit') {
        problems.push(t("dashboard.alerts.rateLimited"));
      } else if (errorType === 'mainnet-offline') {
        problems.push(t("dashboard.alerts.mainnetOffline"));
      } else if (errorType === 'network-error') {
        problems.push(t("dashboard.alerts.connectionError"));
      }
    }
    return problems;
  }, [stats, t]);

  if (issues.length === 0) return null;

  return (
    <Card className="border-yellow-500/50 bg-yellow-500/5 mb-4">
      <CardContent className="flex items-start gap-4 p-4">
        <AlertCircle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-yellow-600 dark:text-yellow-400 mb-1">
            {t("dashboard.alerts.dataWarning")}
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {issues.map((issue, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                {issue}
              </li>
            ))}
          </ul>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh} data-testid="button-refresh-data">
          <RefreshCw className="h-4 w-4 mr-1" />
          {t("dashboard.refresh")}
        </Button>
      </CardContent>
    </Card>
  );
}

function LiveDataStatus({ wsConnected, lastUpdate }: { wsConnected: boolean; lastUpdate: Date | null }) {
  const { t } = useTranslation();
  const [timeSinceUpdate, setTimeSinceUpdate] = useState<string>("");

  useEffect(() => {
    const updateTimer = () => {
      if (lastUpdate) {
        const seconds = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);
        if (seconds < 60) {
          setTimeSinceUpdate(`${seconds}s ago`);
        } else {
          setTimeSinceUpdate(`${Math.floor(seconds / 60)}m ago`);
        }
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lastUpdate]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 cursor-pointer" data-testid="live-data-status">
          <div className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-xs font-medium">
            {wsConnected ? t("dashboard.realtime") : t("dashboard.offline")}
          </span>
          {lastUpdate && (
            <span className="text-xs text-muted-foreground">{timeSinceUpdate}</span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{wsConnected ? t("dashboard.websocketConnected") : t("dashboard.websocketDisconnected")}</p>
        {lastUpdate && <p className="text-xs text-muted-foreground">Last update: {timeSinceUpdate}</p>}
      </TooltipContent>
    </Tooltip>
  );
}

function DeFiStatCard({ 
  href, 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  trend, 
  color,
  testId 
}: { 
  href: string;
  icon: React.ElementType;
  title: string;
  value: string | number;
  subtitle: string;
  trend?: string;
  color: string;
  testId: string;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Card className="hover-elevate cursor-pointer h-full" data-testid={testId}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            <Icon className={`h-4 w-4 ${color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tabular-nums">
              {value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {subtitle}
            </p>
            {trend && (
              <p className="text-xs text-green-500 mt-0.5">
                {trend}
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}

export default function Dashboard() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tpsHistory, setTpsHistory] = useState<TpsDataPoint[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastDataUpdate, setLastDataUpdate] = useState<Date | null>(null);

  const { 
    totalShards, 
    totalValidators: enterpriseValidators, 
    activeShards,
    config: shardConfig,
    isLoading: shardsLoading 
  } = useEnterpriseShards();

  const { data: networkStats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useQuery<NetworkStats>({
    queryKey: ["/api/network/stats"],
    refetchInterval: 5000,
    staleTime: 5000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 500,
  });

  const { data: recentBlocks, isLoading: blocksLoading, error: blocksError, refetch: refetchBlocks } = useQuery<Block[]>({
    queryKey: ["/api/blocks/recent"],
    refetchInterval: 3000,
    staleTime: 3000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const { data: recentTxs, isLoading: txsLoading, error: txsError, refetch: refetchTxs } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions/recent"],
    refetchInterval: 3000,
    staleTime: 3000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const { data: memberStats, isLoading: memberStatsLoading } = useQuery<MemberStats>({
    queryKey: ["/api/members/stats/summary"],
    refetchInterval: 60000,
    staleTime: 60000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const { data: tokenomics, isLoading: tokenomicsLoading } = useQuery<TokenomicsData>({
    queryKey: ["/api/tokenomics/tiers"],
    refetchInterval: 60000,
    staleTime: 60000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const { data: dexStats, isLoading: dexStatsLoading } = useQuery<DexStats>({
    queryKey: ["/api/dex/stats"],
    refetchInterval: 30000,
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const { data: lendingStats, isLoading: lendingStatsLoading } = useQuery<LendingStats>({
    queryKey: ["/api/lending/stats"],
    refetchInterval: 30000,
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const { data: yieldStats, isLoading: yieldStatsLoading } = useQuery<YieldStats>({
    queryKey: ["/api/yield/stats"],
    refetchInterval: 30000,
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const { data: lstStats, isLoading: lstStatsLoading } = useQuery<LstStats>({
    queryKey: ["/api/liquid-staking/stats"],
    refetchInterval: 30000,
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const { data: nftStats, isLoading: nftStatsLoading } = useQuery<NftStats>({
    queryKey: ["/api/nft/stats"],
    refetchInterval: 30000,
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const { data: launchpadStats, isLoading: launchpadStatsLoading } = useQuery<LaunchpadStats>({
    queryKey: ["/api/launchpad/stats"],
    refetchInterval: 30000,
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const { data: gameFiStats, isLoading: gameFiStatsLoading } = useQuery<GameFiStats>({
    queryKey: ["/api/gamefi/stats"],
    refetchInterval: 30000,
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const { data: bridgeStats, isLoading: bridgeStatsLoading } = useQuery<BridgeStats>({
    queryKey: ["/api/bridge/stats"],
    refetchInterval: 30000,
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (networkStats?.tps) {
      setTpsHistory(prev => {
        const newPoint: TpsDataPoint = {
          time: new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York' }),
          tps: networkStats.tps,
          timestamp: Date.now(),
        };
        const updated = [...prev, newPoint].slice(-30);
        return updated;
      });
      setLastDataUpdate(new Date());
    }
  }, [networkStats?.tps]);

  useEffect(() => {
    const getWsUrl = (): string | null => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname;
        const port = window.location.port;
        
        if (port && port !== '') {
          return `${protocol}//${host}:${port}/ws`;
        }
        return `${protocol}//${host}/ws`;
      } catch {
        return null;
      }
    };

    const wsUrl = getWsUrl();
    
    let ws: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;
    let reconnectAttempts = 0;
    let isReconnecting = false;
    let isActive = true;
    const maxReconnectAttempts = 5;

    const triggerRestFallback = () => {
      if (!isActive) return;
      console.log('[Dashboard] WebSocket unavailable, using REST fallback');
      refetchStats();
      refetchBlocks();
      refetchTxs();
    };

    const scheduleReconnect = () => {
      if (!isActive || isReconnecting) return;
      isReconnecting = true;
      
      triggerRestFallback();
      
      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        console.log(`[Dashboard] Scheduling reconnect attempt ${reconnectAttempts}/${maxReconnectAttempts} in ${delay}ms`);
        reconnectTimer = setTimeout(() => {
          if (!isActive) return;
          isReconnecting = false;
          connect();
        }, delay);
      } else {
        const cooldownDelay = 60000;
        console.log(`[Dashboard] Max reconnect attempts reached, retrying after ${cooldownDelay / 1000}s cooldown`);
        reconnectTimer = setTimeout(() => {
          if (!isActive) return;
          reconnectAttempts = 0;
          isReconnecting = false;
          connect();
        }, cooldownDelay);
      }
    };

    const connect = () => {
      if (!wsUrl) {
        console.warn('[Dashboard] Invalid WebSocket URL, using REST fallback');
        triggerRestFallback();
        return;
      }

      try {
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          setWsConnected(true);
          reconnectAttempts = 0;
          console.log('[Dashboard] WebSocket connected to:', wsUrl);
          ws?.send(JSON.stringify({ type: 'subscribe', channels: ['network_stats', 'blocks', 'transactions'] }));
          setLastDataUpdate(new Date());
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            // Handle network_stats updates (both legacy and new format)
            if (data.type === 'network_stats' || data.type === 'network_stats_update') {
              const payload = data.payload || data.data;
              if (payload) {
                queryClient.setQueryData(["/api/network/stats"], payload);
                setLastDataUpdate(new Date());
              }
            } else if (data.type === 'new_block' || data.type === 'block_update' || data.type === 'block_created') {
              queryClient.invalidateQueries({ queryKey: ["/api/blocks/recent"] });
              setLastDataUpdate(new Date());
            } else if (data.type === 'new_transaction' || data.type === 'transaction_update') {
              queryClient.invalidateQueries({ queryKey: ["/api/transactions/recent"] });
            }
          } catch {
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
          scheduleReconnect();
        };

        ws.onerror = (error) => {
          console.warn('[Dashboard] WebSocket error:', error);
          setWsConnected(false);
          scheduleReconnect();
        };
      } catch (error) {
        console.warn('[Dashboard] WebSocket connection failed:', error);
        setWsConnected(false);
        scheduleReconnect();
      }
    };

    connect();

    return () => {
      isActive = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  }, [queryClient, refetchStats, refetchBlocks, refetchTxs]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchStats(),
        refetchBlocks(),
        refetchTxs(),
        queryClient.invalidateQueries({ queryKey: ["/api/members/stats/summary"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/tokenomics/tiers"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/dex/stats"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/lending/stats"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/yield/stats"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/liquid-staking/stats"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/nft/stats"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/launchpad/stats"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/gamefi/stats"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/bridge/stats"] }),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchStats, refetchBlocks, refetchTxs, queryClient]);

  const defiLoading = dexStatsLoading || lendingStatsLoading || yieldStatsLoading || lstStatsLoading || 
                      nftStatsLoading || launchpadStatsLoading || gameFiStatsLoading || bridgeStatsLoading;

  const validatorOnlinePercent = useMemo(() => {
    if (!networkStats?.activeValidators || !networkStats?.totalValidators) return 0;
    return (networkStats.activeValidators / networkStats.totalValidators * 100);
  }, [networkStats]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-dashboard-title">{t("dashboard.explorerTitle")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("dashboard.explorerSubtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <NetworkHealthIndicator stats={networkStats} />
          <LiveDataStatus wsConnected={wsConnected} lastUpdate={lastDataUpdate} />
          <DataSourceBadge />
          <LiveIndicator />
          <RefreshButton onRefresh={handleRefresh} isRefreshing={isRefreshing} />
        </div>
      </div>

      <div className="flex justify-center">
        <SearchBar />
      </div>

      {/* Data Integrity Warning Alert */}
      <DataIntegrityAlert stats={networkStats} onRefresh={handleRefresh} />

      {statsError && (
        <ErrorCard 
          title={t("dashboard.networkError")} 
          message={t("dashboard.failedToLoadStats")}
          onRetry={() => refetchStats()}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={`stats-sk-${i}`} className="h-32" />
          ))
        ) : (
          <>
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("dashboard.currentTps")}
                </CardTitle>
                <Zap className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent className="pb-0">
                <div className="text-2xl font-semibold tabular-nums">
                  {formatNumber(networkStats?.tps || 0)} <span className="text-sm text-muted-foreground">TPS</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {t("dashboard.peak")}: {formatNumber(networkStats?.peakTps || 0)} TPS
                </p>
                <TpsChart data={tpsHistory} />
              </CardContent>
            </Card>
            <StatCard
              title={t("dashboard.blockHeight")}
              value={formatNumber(networkStats?.currentBlockHeight || 0)}
              icon={Blocks}
              subtitle={t("dashboard.latestBlock")}
            />
            <StatCard
              title={t("dashboard.blockTime")}
              value={`${networkStats?.avgBlockTime || 0}ms`}
              icon={Clock}
              trend={{ value: 5.2, isPositive: false }}
              subtitle={`P99: ${networkStats?.blockTimeP99 || 0}ms`}
            />
            <StatCard
              title={t("dashboard.slaUptime")}
              value={`${((networkStats?.slaUptime || 9990) / 100).toFixed(2)}%`}
              icon={Activity}
              subtitle={t("dashboard.last30Days")}
            />
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {statsLoading || shardsLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={`sec-sk-${i}`} className="h-24" />
          ))
        ) : (
          <>
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("dashboard.activeShards")}
                </CardTitle>
                <Grid3x3 className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums" data-testid="stat-active-shards">
                  {activeShards} / {totalShards}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {shardConfig?.validatorsPerShard || 25} {t("dashboard.validatorsPerShard")}
                </p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("dashboard.totalTransactions")}
                </CardTitle>
                <Activity className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums" data-testid="stat-total-transactions">
                  {formatNumber(networkStats?.totalTransactions || 0)}
                </div>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("dashboard.totalAccounts")}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums" data-testid="stat-total-accounts">
                  {formatNumber(networkStats?.totalAccounts || 0)}
                </div>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("dashboard.tburnPrice")}
                </CardTitle>
                <TrendingUp className={`h-4 w-4 ${((networkStats as any)?.priceChangePercent || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums" data-testid="stat-tburn-price">
                  ${((networkStats as any)?.tokenPrice || 28.91).toFixed(2)}
                </div>
                <p className={`text-xs mt-1 ${((networkStats as any)?.priceChangePercent || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {((networkStats as any)?.priceChangePercent || 0) >= 0 ? '↑' : '↓'} {Math.abs((networkStats as any)?.priceChangePercent || 0).toFixed(2)}%
                </p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("dashboard.marketCap")}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums" data-testid="stat-market-cap">
                  ${formatNumber(networkStats?.marketCap || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("dashboard.priceFormula")}
                </p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("dashboard.activeValidators")}
                </CardTitle>
                <Server className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums" data-testid="stat-active-validators">
                  {networkStats?.activeValidators || Math.floor(enterpriseValidators * 0.98)} / {enterpriseValidators || networkStats?.totalValidators || 0}
                </div>
                <Progress value={validatorOnlinePercent || 98} className="h-1 mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {t("dashboard.percentOnline", { percent: (validatorOnlinePercent || 98).toFixed(1) })}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Coins className="h-5 w-5" />
          {t("dashboard.tokenomicsEmission")}
        </h2>
        {tokenomicsLoading ? (
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={`token-sk-${i}`} className="h-32" />
            ))}
          </div>
        ) : tokenomics ? (
          <>
            <div className="grid gap-4 md:grid-cols-4 mb-4">
              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
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
              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
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
              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
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
              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t("dashboard.stakingRate")}
                  </CardTitle>
                  <Award className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold tabular-nums text-purple-500" data-testid="stat-staking-rate">
                    {tokenomics.stakedPercent.toFixed(1)}%
                  </div>
                  <Progress value={tokenomics.stakedPercent} className="h-1 mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard.stakedOfTotal", { staked: formatNumber(tokenomics.stakedAmount / 1e6), total: formatNumber(tokenomics.totalSupply / 1e6) })}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5 hover-elevate">
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

              <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 hover-elevate">
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

              <Card className="border-gray-500/30 bg-gradient-to-br from-gray-500/5 to-slate-500/5 hover-elevate">
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

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          {t("dashboard.memberManagement")}
        </h2>
        <div className="grid gap-4 md:grid-cols-5">
          {memberStatsLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={`member-sk-${i}`} className="h-24" />
            ))
          ) : (
            <>
              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t("dashboard.totalMembers")}
                  </CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold tabular-nums" data-testid="stat-total-members">
                    {formatNumber(memberStats?.totalMembers || 0)}
                  </div>
                </CardContent>
              </Card>
              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t("dashboard.activeMembers")}
                  </CardTitle>
                  <Activity className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold tabular-nums" data-testid="stat-active-members">
                    {formatNumber(memberStats?.activeMembers || 0)}
                  </div>
                </CardContent>
              </Card>
              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t("dashboard.totalValidatorsLabel")}
                  </CardTitle>
                  <Shield className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold tabular-nums" data-testid="stat-member-validators">
                    {formatNumber(memberStats?.totalValidators || 0)}
                  </div>
                </CardContent>
              </Card>
              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t("dashboard.totalStakers")}
                  </CardTitle>
                  <Award className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold tabular-nums" data-testid="stat-total-stakers">
                    {formatNumber(memberStats?.totalStakers || 0)}
                  </div>
                </CardContent>
              </Card>
              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t("dashboard.kycVerified")}
                  </CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold tabular-nums" data-testid="stat-kyc-verified">
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

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {t("dashboard.defiEcosystem")}
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {defiLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={`defi-sk-${i}`} className="h-32" />
            ))
          ) : (
            <>
              <DeFiStatCard
                href="/app/dex"
                icon={ArrowRightLeft}
                title={t("dashboard.dexAmm")}
                value={`${dexStats?.totalPools || 0} ${t("dashboard.pools")}`}
                subtitle={`$${formatNumber(Number(dexStats?.totalTvlUsd || 0) / 1e18)} ${t("dashboard.tvl")}`}
                trend={t("dashboard.swaps24h", { count: dexStats?.totalSwaps24h || 0 })}
                color="text-blue-500"
                testId="card-dex-stats"
              />
              <DeFiStatCard
                href="/app/lending"
                icon={Landmark}
                title={t("dashboard.lending")}
                value={`${lendingStats?.totalMarkets || 0} ${t("dashboard.markets")}`}
                subtitle={`$${formatNumber(Number(lendingStats?.totalValueLockedUsd || 0) / 1e18)} ${t("dashboard.supplied")}`}
                trend={t("dashboard.avgApy", { rate: ((lendingStats?.avgSupplyRate || 0) / 100).toFixed(2) })}
                color="text-green-500"
                testId="card-lending-stats"
              />
              <DeFiStatCard
                href="/app/yield-farming"
                icon={Sprout}
                title={t("dashboard.yieldFarming")}
                value={`${yieldStats?.totalVaults || 0} ${t("dashboard.vaults")}`}
                subtitle={`$${formatNumber(Number(yieldStats?.totalTvlUsd || 0) / 1e18)} ${t("dashboard.tvl")}`}
                trend={t("dashboard.avgApy", { rate: ((yieldStats?.avgVaultApy || 0) / 100).toFixed(2) })}
                color="text-lime-500"
                testId="card-yield-stats"
              />
              <DeFiStatCard
                href="/app/liquid-staking"
                icon={Droplets}
                title={t("dashboard.liquidStaking")}
                value={`${lstStats?.totalPools || 0} ${t("dashboard.pools")}`}
                subtitle={`$${formatNumber(Number(lstStats?.totalStakedUsd || 0) / 1e18)} ${t("dashboard.staked")}`}
                trend={t("dashboard.avgApy", { rate: ((lstStats?.avgPoolApy || 0) / 100).toFixed(2) })}
                color="text-cyan-500"
                testId="card-lst-stats"
              />
              <DeFiStatCard
                href="/app/nft-marketplace"
                icon={Image}
                title={t("dashboard.nftMarketplace")}
                value={`${nftStats?.totalCollections || 0} ${t("dashboard.collections")}`}
                subtitle={`${formatNumber(nftStats?.totalItems || 0)} ${t("dashboard.items")}`}
                trend={t("dashboard.sales24h", { count: nftStats?.salesCount24h || 0 })}
                color="text-purple-500"
                testId="card-nft-stats"
              />
              <DeFiStatCard
                href="/app/nft-launchpad"
                icon={Rocket}
                title={t("dashboard.launchpad")}
                value={`${launchpadStats?.totalProjects || 0} ${t("dashboard.projects")}`}
                subtitle={`${launchpadStats?.activeProjects || 0} ${t("dashboard.active")}`}
                trend={`$${formatNumber(Number(launchpadStats?.totalRaised || 0) / 1e18)} ${t("dashboard.raised")}`}
                color="text-orange-500"
                testId="card-launchpad-stats"
              />
              <DeFiStatCard
                href="/app/gamefi"
                icon={Gamepad2}
                title={t("dashboard.gamefi")}
                value={`${gameFiStats?.totalProjects || 0} ${t("dashboard.games")}`}
                subtitle={`${gameFiStats?.activeTournaments || 0} ${t("dashboard.tournaments")}`}
                trend={`$${formatNumber(Number(gameFiStats?.totalRewardsDistributed || 0) / 1e18)} ${t("dashboard.rewards")}`}
                color="text-pink-500"
                testId="card-gamefi-stats"
              />
              <DeFiStatCard
                href="/app/bridge"
                icon={Link2}
                title={t("dashboard.crossChainBridge")}
                value={`${bridgeStats?.activeChains || 0} ${t("dashboard.chains")}`}
                subtitle={`$${formatNumber(Number(bridgeStats?.totalLiquidity || 0) / 1e18)} ${t("dashboard.liquidity")}`}
                trend={t("dashboard.transfers24h", { count: bridgeStats?.transferCount24h || 0 })}
                color="text-indigo-500"
                testId="card-bridge-stats"
              />
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
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
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={`block-sk-${i}`} className="h-16" />
                ))
              ) : blocksError ? (
                <ErrorCard 
                  title={t("dashboard.blockError")} 
                  message={t("dashboard.failedToLoadBlocks")}
                  onRetry={() => refetchBlocks()}
                />
              ) : recentBlocks && recentBlocks.length > 0 ? (
                <>
                  {recentBlocks.slice(0, 10).map((block, index) => (
                    <div
                      key={`block-item-${index}-${block.blockNumber || 'pending'}-${block.hash?.slice(0, 8) || 'no-hash'}`}
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
                  ))}
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t("dashboard.noBlocksFound")}
                </p>
              )}
            </div>
            {recentBlocks && recentBlocks.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <Link href="/app/blocks">
                  <Button variant="outline" className="w-full" data-testid="button-view-all-blocks">
                    {t("dashboard.viewAllBlocks")}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

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
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={`tx-sk-${i}`} className="h-16" />
                ))
              ) : txsError ? (
                <ErrorCard 
                  title={t("dashboard.txError")} 
                  message={t("dashboard.failedToLoadTxs")}
                  onRetry={() => refetchTxs()}
                />
              ) : recentTxs && recentTxs.length > 0 ? (
                <>
                  {recentTxs.slice(0, 10).map((tx, index) => (
                    <div
                      key={`tx-item-${index}-${tx.hash?.slice(0, 12) || 'pending'}`}
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
                            className={`text-xs ${tx.status === "success" ? "bg-green-600 hover:bg-green-700 border-0" : ""}`}
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
                  ))}
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t("dashboard.noTransactionsFound")}
                </p>
              )}
            </div>
            {recentTxs && recentTxs.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <Link href="/app/transactions">
                  <Button variant="outline" className="w-full" data-testid="button-view-all-transactions">
                    {t("dashboard.viewAllTransactions")}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
                  <p className="font-mono text-sm">{new Date(selectedBlock.timestamp * 1000).toLocaleString('en-US', { timeZone: 'America/New_York' })}</p>
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
                <Link href={`/app/blocks/${selectedBlock.blockNumber}`}>
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
                  className={selectedTx.status === "success" ? "bg-green-600 hover:bg-green-700 border-0" : ""}
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
                <Link href={`/app/transactions/${selectedTx.hash}`}>
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
