import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Droplets, TrendingUp, AlertTriangle, ArrowUpRight, 
  ArrowDownRight, RefreshCw, Plus, Minus, Download, Clock, AlertCircle
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface LiquidityStats {
  totalLocked: string;
  utilizationRate: string;
  dailyVolume: string;
  rebalanceNeeded: number;
}

interface LiquidityPool {
  chain: string;
  locked: string;
  available: string;
  utilization: number;
  tokens: string[];
}

interface LiquidityHistory {
  date: string;
  total: number;
}

interface TokenDistribution {
  name: string;
  value: number;
  color: string;
}

interface RebalanceAlert {
  id: number;
  from: string;
  to: string;
  amount: string;
  reason: string;
  priority: "high" | "medium" | "low";
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-9 w-20 mt-1" />
      </CardContent>
    </Card>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Table data-testid="table-skeleton">
      <TableHeader>
        <TableRow>
          {Array.from({ length: 6 }).map((_, i) => (
            <TableHead key={i}><Skeleton className="h-4 w-16" /></TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRow key={i}>
            {Array.from({ length: 6 }).map((_, j) => (
              <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function AdminBridgeLiquidity() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [addLiquidityAmount, setAddLiquidityAmount] = useState("");
  const [removeLiquidityAmount, setRemoveLiquidityAmount] = useState("");

  const { data: statsData, isLoading: loadingStats, error, refetch: refetchStats } = useQuery<LiquidityStats>({
    queryKey: ["/api/admin/bridge/liquidity/stats"],
    refetchInterval: 30000,
  });

  const { data: poolsData, isLoading: loadingPools, refetch: refetchPools } = useQuery<{ pools: LiquidityPool[] }>({
    queryKey: ["/api/admin/bridge/liquidity/pools"],
    refetchInterval: 15000,
  });

  const { data: historyData, isLoading: loadingHistory } = useQuery<{ history: LiquidityHistory[] }>({
    queryKey: ["/api/admin/bridge/liquidity/history"],
    refetchInterval: 60000,
  });

  const { data: alertsData, isLoading: loadingAlerts, refetch: refetchAlerts } = useQuery<{ alerts: RebalanceAlert[] }>({
    queryKey: ["/api/admin/bridge/liquidity/alerts"],
    refetchInterval: 30000,
  });

  const rebalanceMutation = useMutation({
    mutationFn: async (alertId: number) => {
      const res = await apiRequest("POST", `/api/admin/bridge/liquidity/rebalance/${alertId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bridge/liquidity"] });
      toast({
        title: t("adminLiquidity.rebalanceSuccess"),
        description: t("adminLiquidity.rebalanceSuccessDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminLiquidity.rebalanceError"),
        description: t("adminLiquidity.rebalanceErrorDesc"),
        variant: "destructive",
      });
    },
  });

  const addLiquidityMutation = useMutation({
    mutationFn: async (amount: string) => {
      const res = await apiRequest("POST", "/api/admin/bridge/liquidity/add", { amount });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bridge/liquidity"] });
      setAddLiquidityAmount("");
      toast({
        title: t("adminLiquidity.addSuccess"),
        description: t("adminLiquidity.addSuccessDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminLiquidity.addError"),
        description: t("adminLiquidity.addErrorDesc"),
        variant: "destructive",
      });
    },
  });

  const removeLiquidityMutation = useMutation({
    mutationFn: async (amount: string) => {
      const res = await apiRequest("POST", "/api/admin/bridge/liquidity/remove", { amount });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bridge/liquidity"] });
      setRemoveLiquidityAmount("");
      toast({
        title: t("adminLiquidity.removeSuccess"),
        description: t("adminLiquidity.removeSuccessDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminLiquidity.removeError"),
        description: t("adminLiquidity.removeErrorDesc"),
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    let ws: WebSocket | null = null;
    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
        
        ws.onopen = () => {
          setWsConnected(true);
          ws?.send(JSON.stringify({ type: "subscribe", channels: ["liquidity", "bridge"] }));
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "liquidity_update" || data.type === "rebalance_alert") {
              refetchStats();
              refetchPools();
              refetchAlerts();
              setLastUpdate(new Date());
            }
          } catch (e) {
            console.error("WebSocket message parse error:", e);
          }
        };
        
        ws.onclose = () => {
          setWsConnected(false);
          setTimeout(connectWebSocket, 5000);
        };
        
        ws.onerror = () => {
          setWsConnected(false);
        };
      } catch (e) {
        console.error("WebSocket connection error:", e);
      }
    };

    connectWebSocket();
    
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [refetchStats, refetchPools, refetchAlerts]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchStats(),
        refetchPools(),
        refetchAlerts(),
      ]);
      toast({
        title: t("adminLiquidity.refreshSuccess"),
        description: t("adminLiquidity.dataUpdated"),
      });
    } catch (error) {
      toast({
        title: t("adminLiquidity.refreshError"),
        description: t("adminLiquidity.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
      setLastUpdate(new Date());
    }
  }, [refetchStats, refetchPools, refetchAlerts, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      stats: liquidityStats,
      pools: poolsByChain,
      rebalanceAlerts: rebalanceAlerts,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bridge-liquidity-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: t("adminLiquidity.exportSuccess"),
      description: t("adminLiquidity.exportSuccessDesc"),
    });
  }, [toast, t]);

  const liquidityStats = useMemo(() => {
    if (statsData) return statsData;
    return {
      totalLocked: "$120.5M",
      utilizationRate: "68%",
      dailyVolume: "$12.5M",
      rebalanceNeeded: 2,
    };
  }, [statsData]);

  const poolsByChain = useMemo(() => {
    if (poolsData?.pools) return poolsData.pools;
    return [
      { chain: "Ethereum", locked: "$45.2M", available: "$32.5M", utilization: 72, tokens: ["USDT", "USDC", "wTBURN"] },
      { chain: "BSC", locked: "$28.7M", available: "$22.1M", utilization: 65, tokens: ["USDT", "BUSD", "wTBURN"] },
      { chain: "Polygon", locked: "$15.3M", available: "$12.8M", utilization: 58, tokens: ["USDT", "USDC"] },
      { chain: "Avalanche", locked: "$12.1M", available: "$9.2M", utilization: 45, tokens: ["USDT", "AVAX"] },
      { chain: "Arbitrum", locked: "$8.5M", available: "$6.1M", utilization: 40, tokens: ["USDT", "ARB"] },
      { chain: "Optimism", locked: "$6.2M", available: "$2.8M", utilization: 88, tokens: ["USDT", "OP"] },
      { chain: "Base", locked: "$4.1M", available: "$3.5M", utilization: 35, tokens: ["USDT", "USDC"] },
    ];
  }, [poolsData]);

  const liquidityHistory = useMemo(() => {
    if (historyData?.history) return historyData.history;
    return [
      { date: "Nov 27", total: 105 },
      { date: "Nov 28", total: 108 },
      { date: "Nov 29", total: 112 },
      { date: "Nov 30", total: 115 },
      { date: "Dec 1", total: 118 },
      { date: "Dec 2", total: 120 },
      { date: "Dec 3", total: 120.5 },
    ];
  }, [historyData]);

  const tokenDistribution: TokenDistribution[] = [
    { name: "USDT", value: 45, color: "#22c55e" },
    { name: "USDC", value: 30, color: "#3b82f6" },
    { name: "wTBURN", value: 20, color: "#f97316" },
    { name: "Other", value: 5, color: "#a855f7" },
  ];

  const rebalanceAlerts = useMemo(() => {
    if (alertsData?.alerts) return alertsData.alerts;
    return [
      { id: 1, from: "Optimism", to: "Ethereum", amount: "$2.5M", reason: t("adminLiquidity.highUtilization", { chain: "Optimism", percent: 88 }), priority: "high" as const },
      { id: 2, from: "Polygon", to: "BSC", amount: "$1.2M", reason: t("adminLiquidity.lowUtilization", { chain: "Polygon", percent: 58 }), priority: "medium" as const },
    ];
  }, [alertsData, t]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center" data-testid="liquidity-error">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t("adminLiquidity.error.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("adminLiquidity.error.description")}</p>
            <Button onClick={() => refetchStats()} data-testid="button-retry">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminLiquidity.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <ScrollArea className="h-full" data-testid="bridge-liquidity">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-page-title">{t("adminLiquidity.title")}</h1>
              <p className="text-muted-foreground" data-testid="text-page-subtitle">{t("adminLiquidity.subtitle")}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${wsConnected ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                      <div className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                      <span className="text-xs">{wsConnected ? t("adminLiquidity.connected") : t("adminLiquidity.reconnecting")}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {wsConnected ? t("adminLiquidity.wsConnected") : t("adminLiquidity.wsReconnecting")}
                  </TooltipContent>
                </Tooltip>
                <Clock className="h-4 w-4" />
                <span data-testid="text-last-update">{t("adminLiquidity.lastUpdate")}: {lastUpdate.toLocaleTimeString(i18n.language === 'ko' ? 'ko-KR' : 'en-US')}</span>
              </div>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} data-testid="button-refresh">
                      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("adminLiquidity.refresh")}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={handleExport} data-testid="button-export">
                      <Download className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("adminLiquidity.export")}</TooltipContent>
                </Tooltip>
                <Button variant="outline" data-testid="button-auto-rebalance">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t("adminLiquidity.autoRebalance")}
                </Button>
                <Button data-testid="button-add-liquidity-main">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("adminLiquidity.addLiquidity")}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4" data-testid="stats-grid">
            {loadingStats ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10" data-testid="card-total-locked">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets className="w-5 h-5 text-blue-500" />
                      <span className="text-sm text-muted-foreground">{t("adminLiquidity.totalLocked")}</span>
                    </div>
                    <div className="text-3xl font-bold" data-testid="text-total-locked">{liquidityStats.totalLocked}</div>
                  </CardContent>
                </Card>
                <Card data-testid="card-utilization">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-muted-foreground">{t("adminLiquidity.utilization")}</span>
                    </div>
                    <div className="text-3xl font-bold" data-testid="text-utilization">{liquidityStats.utilizationRate}</div>
                  </CardContent>
                </Card>
                <Card data-testid="card-volume-24h">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowUpRight className="w-5 h-5 text-purple-500" />
                      <span className="text-sm text-muted-foreground">{t("adminLiquidity.volume24h")}</span>
                    </div>
                    <div className="text-3xl font-bold" data-testid="text-volume-24h">{liquidityStats.dailyVolume}</div>
                  </CardContent>
                </Card>
                <Card data-testid="card-rebalance-needed">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm text-muted-foreground">{t("adminLiquidity.rebalanceNeeded")}</span>
                    </div>
                    <div className="text-3xl font-bold text-yellow-500" data-testid="text-rebalance-needed">{liquidityStats.rebalanceNeeded}</div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {!loadingAlerts && rebalanceAlerts.length > 0 && (
            <Card className="border-yellow-500/30 bg-yellow-500/5" data-testid="card-rebalance-alerts">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  {t("adminLiquidity.rebalanceRecommendations")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rebalanceAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 bg-background rounded-lg" data-testid={`alert-rebalance-${alert.id}`}>
                      <div className="flex items-center gap-4">
                        <Badge variant={alert.priority === "high" ? "destructive" : "secondary"} data-testid={`badge-priority-${alert.id}`}>
                          {t(`adminLiquidity.priority.${alert.priority}`)}
                        </Badge>
                        <div>
                          <p className="font-medium" data-testid={`text-alert-route-${alert.id}`}>{alert.from} → {alert.to}: {alert.amount}</p>
                          <p className="text-sm text-muted-foreground" data-testid={`text-alert-reason-${alert.id}`}>{alert.reason}</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => rebalanceMutation.mutate(alert.id)}
                        disabled={rebalanceMutation.isPending}
                        data-testid={`button-execute-rebalance-${alert.id}`}
                      >
                        {rebalanceMutation.isPending ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : null}
                        {t("adminLiquidity.execute")}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="pools" className="space-y-4" data-testid="liquidity-tabs">
            <TabsList data-testid="tabs-list">
              <TabsTrigger value="pools" data-testid="tab-pools">
                <Droplets className="w-4 h-4 mr-2" />
                {t("adminLiquidity.liquidityPools")}
              </TabsTrigger>
              <TabsTrigger value="history" data-testid="tab-history">
                <TrendingUp className="w-4 h-4 mr-2" />
                {t("adminLiquidity.history")}
              </TabsTrigger>
              <TabsTrigger value="distribution" data-testid="tab-distribution">
                <TrendingUp className="w-4 h-4 mr-2" />
                {t("adminLiquidity.distribution")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pools" data-testid="tab-content-pools">
              <Card data-testid="card-pools-table">
                <CardHeader>
                  <CardTitle>{t("adminLiquidity.poolsByChain")}</CardTitle>
                  <CardDescription>{t("adminLiquidity.poolsByChainDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingPools ? (
                    <TableSkeleton rows={7} />
                  ) : (
                    <Table data-testid="table-pools">
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("adminLiquidity.chain")}</TableHead>
                          <TableHead>{t("adminLiquidity.totalLocked")}</TableHead>
                          <TableHead>{t("adminLiquidity.available")}</TableHead>
                          <TableHead>{t("adminLiquidity.utilization")}</TableHead>
                          <TableHead>{t("adminLiquidity.supportedTokens")}</TableHead>
                          <TableHead>{t("adminLiquidity.actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {poolsByChain.map((pool, index) => (
                          <TableRow key={index} data-testid={`row-pool-${pool.chain}`}>
                            <TableCell className="font-medium" data-testid={`text-pool-chain-${pool.chain}`}>{pool.chain}</TableCell>
                            <TableCell data-testid={`text-pool-locked-${pool.chain}`}>{pool.locked}</TableCell>
                            <TableCell data-testid={`text-pool-available-${pool.chain}`}>{pool.available}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={pool.utilization} className="w-20" data-testid={`progress-utilization-${pool.chain}`} />
                                <span className={
                                  pool.utilization > 80 ? "text-red-500" :
                                  pool.utilization > 60 ? "text-yellow-500" : "text-green-500"
                                } data-testid={`text-utilization-${pool.chain}`}>
                                  {pool.utilization}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {pool.tokens.map((token, i) => (
                                  <Badge key={i} variant="outline" className="text-xs" data-testid={`badge-token-${pool.chain}-${token}`}>{token}</Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button size="sm" variant="ghost" data-testid={`button-add-${pool.chain}`}>
                                      <Plus className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>{t("adminLiquidity.addLiquidity")}</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button size="sm" variant="ghost" data-testid={`button-remove-${pool.chain}`}>
                                      <Minus className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>{t("adminLiquidity.removeLiquidity")}</TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" data-testid="tab-content-history">
              <Card data-testid="card-history-chart">
                <CardHeader>
                  <CardTitle>{t("adminLiquidity.totalLiquidity7Days")}</CardTitle>
                  <CardDescription>{t("adminLiquidity.tvlInMillions")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingHistory ? (
                    <div className="h-80 flex items-center justify-center">
                      <Skeleton className="h-full w-full" />
                    </div>
                  ) : (
                    <div className="h-80" data-testid="chart-history">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={liquidityHistory}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[100, 125]} />
                          <RechartsTooltip />
                          <Area type="monotone" dataKey="total" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="distribution" data-testid="tab-content-distribution">
              <div className="grid grid-cols-2 gap-4">
                <Card data-testid="card-token-distribution">
                  <CardHeader>
                    <CardTitle>{t("adminLiquidity.tokenDistribution")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingStats ? (
                      <Skeleton className="h-64 w-full" />
                    ) : (
                      <>
                        <div className="h-64 flex items-center justify-center" data-testid="chart-distribution">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={tokenDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {tokenDistribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <RechartsTooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-4 mt-4" data-testid="legend-distribution">
                          {tokenDistribution.map((item, index) => (
                            <div key={index} className="flex items-center gap-2" data-testid={`legend-item-${item.name}`}>
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="text-sm">{item.name}: {item.value}%</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card data-testid="card-quick-actions">
                  <CardHeader>
                    <CardTitle>{t("adminLiquidity.quickActions")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 border rounded-lg" data-testid="section-add-liquidity">
                      <Label className="mb-2 block">{t("adminLiquidity.addLiquidity")}</Label>
                      <div className="flex gap-2">
                        <Input 
                          placeholder={t("adminLiquidity.amount")} 
                          type="number" 
                          value={addLiquidityAmount}
                          onChange={(e) => setAddLiquidityAmount(e.target.value)}
                          data-testid="input-add-amount"
                        />
                        <Button 
                          onClick={() => addLiquidityMutation.mutate(addLiquidityAmount)}
                          disabled={addLiquidityMutation.isPending || !addLiquidityAmount}
                          data-testid="button-add-liquidity"
                        >
                          {addLiquidityMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : t("adminLiquidity.add")}
                        </Button>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg" data-testid="section-remove-liquidity">
                      <Label className="mb-2 block">{t("adminLiquidity.removeLiquidity")}</Label>
                      <div className="flex gap-2">
                        <Input 
                          placeholder={t("adminLiquidity.amount")} 
                          type="number" 
                          value={removeLiquidityAmount}
                          onChange={(e) => setRemoveLiquidityAmount(e.target.value)}
                          data-testid="input-remove-amount"
                        />
                        <Button 
                          variant="destructive"
                          onClick={() => removeLiquidityMutation.mutate(removeLiquidityAmount)}
                          disabled={removeLiquidityMutation.isPending || !removeLiquidityAmount}
                          data-testid="button-remove-liquidity"
                        >
                          {removeLiquidityMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : t("adminLiquidity.remove")}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </TooltipProvider>
  );
}
