import { useQuery, useMutation } from "@tanstack/react-query";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Grid3x3,
  Activity,
  Zap,
  Users,
  ArrowRightLeft,
  Brain,
  RefreshCw,
  TrendingUp,
  Download,
  AlertCircle,
  Clock,
  Search,
  Eye,
  Settings,
  PlayCircle,
  PauseCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

interface Shard {
  id: number;
  name: string;
  validators: number;
  tps: number;
  load: number;
  pendingTx: number;
  crossShardTx: number;
  status: "healthy" | "warning" | "critical";
  rebalanceScore: number;
}

interface ShardingStats {
  totalShards: number;
  totalTps: number;
  avgLoad: number;
  totalValidators: number;
  healthyShards: number;
  pendingRebalance: number;
}

interface LoadHistory {
  time: string;
  shard0: number;
  shard1: number;
  shard2: number;
  shard3: number;
}

interface ShardingResponse {
  shards: Shard[];
  stats: ShardingStats;
  loadHistory: LoadHistory[];
}

function MetricCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <Skeleton className="h-8 w-16 mx-auto mb-2" />
        <Skeleton className="h-4 w-24 mx-auto" />
      </CardContent>
    </Card>
  );
}

function ShardCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-5 w-16" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full" />
      </CardContent>
    </Card>
  );
}

export default function AdminShards() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const { data: shardingData, isLoading, error, refetch } = useQuery<ShardingResponse>({
    queryKey: ["/api/sharding"],
    refetchInterval: 5000,
  });

  const rebalanceMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/sharding/rebalance"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sharding"] });
      toast({
        title: t("adminShards.rebalanceSuccess"),
        description: t("adminShards.rebalanceSuccessDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminShards.rebalanceError"),
        description: t("adminShards.rebalanceErrorDesc"),
        variant: "destructive",
      });
    },
  });

  const shards: Shard[] = useMemo(() => shardingData?.shards || [
    { id: 0, name: "Beacon Shard", validators: 24, tps: 425, load: 68, pendingTx: 145, crossShardTx: 23, status: "healthy", rebalanceScore: 92 },
    { id: 1, name: "Shard Alpha", validators: 20, tps: 398, load: 72, pendingTx: 189, crossShardTx: 45, status: "healthy", rebalanceScore: 88 },
    { id: 2, name: "Shard Beta", validators: 19, tps: 412, load: 65, pendingTx: 134, crossShardTx: 31, status: "healthy", rebalanceScore: 94 },
    { id: 3, name: "Shard Gamma", validators: 21, tps: 389, load: 78, pendingTx: 256, crossShardTx: 67, status: "warning", rebalanceScore: 75 },
    { id: 4, name: "Shard Delta", validators: 18, tps: 435, load: 62, pendingTx: 98, crossShardTx: 28, status: "healthy", rebalanceScore: 96 },
    { id: 5, name: "Shard Epsilon", validators: 20, tps: 401, load: 70, pendingTx: 167, crossShardTx: 42, status: "healthy", rebalanceScore: 89 },
    { id: 6, name: "Shard Zeta", validators: 17, tps: 378, load: 82, pendingTx: 312, crossShardTx: 89, status: "warning", rebalanceScore: 68 },
    { id: 7, name: "Shard Eta", validators: 17, tps: 418, load: 66, pendingTx: 123, crossShardTx: 35, status: "healthy", rebalanceScore: 91 },
  ], [shardingData]);

  const stats: ShardingStats = useMemo(() => shardingData?.stats || {
    totalShards: shards.length,
    totalTps: shards.reduce((acc, s) => acc + s.tps, 0),
    avgLoad: Math.round(shards.reduce((acc, s) => acc + s.load, 0) / shards.length),
    totalValidators: shards.reduce((acc, s) => acc + s.validators, 0),
    healthyShards: shards.filter(s => s.status === "healthy").length,
    pendingRebalance: shards.filter(s => s.rebalanceScore < 80).length,
  }, [shards, shardingData]);

  const loadHistory: LoadHistory[] = useMemo(() => shardingData?.loadHistory || Array.from({ length: 24 }, (_, i) => ({
    time: `${23 - i}h`,
    shard0: Math.floor(Math.random() * 30) + 55,
    shard1: Math.floor(Math.random() * 30) + 60,
    shard2: Math.floor(Math.random() * 30) + 50,
    shard3: Math.floor(Math.random() * 35) + 65,
  })).reverse(), [shardingData]);

  const filteredShards = useMemo(() => {
    return shards.filter(shard => 
      searchQuery === "" || 
      shard.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [shards, searchQuery]);

  useEffect(() => {
    let ws: WebSocket | null = null;
    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
        
        ws.onopen = () => {
          setWsConnected(true);
          ws?.send(JSON.stringify({ type: "subscribe", channels: ["sharding"] }));
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "sharding_update") {
              refetch();
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
  }, [refetch]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: t("adminShards.refreshSuccess"),
        description: t("adminShards.dataUpdated"),
      });
      setLastUpdate(new Date());
    } catch (err) {
      toast({
        title: t("adminShards.refreshError"),
        description: t("adminShards.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      stats,
      shards,
      loadHistory,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tburn-shards-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: t("adminShards.exportSuccess"),
      description: t("adminShards.exportSuccessDesc"),
    });
  }, [stats, shards, loadHistory, toast, t]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy": return <Badge className="bg-green-500/10 text-green-500" data-testid="badge-status-healthy">{t("adminShards.statusHealthy")}</Badge>;
      case "warning": return <Badge className="bg-yellow-500/10 text-yellow-500" data-testid="badge-status-warning">{t("adminShards.statusWarning")}</Badge>;
      case "critical": return <Badge className="bg-red-500/10 text-red-500" data-testid="badge-status-critical">{t("adminShards.statusCritical")}</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getLoadColor = (load: number) => {
    if (load >= 80) return "bg-red-500";
    if (load >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center" data-testid="shards-error">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t("adminShards.error.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("adminShards.error.description")}</p>
            <Button onClick={() => refetch()} data-testid="button-retry">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("common.refresh")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex-1 overflow-auto" data-testid="admin-shards-page">
        <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-page-title">
                <Grid3x3 className="h-8 w-8" />
                {t("adminShards.title")}
              </h1>
              <p className="text-muted-foreground" data-testid="text-page-subtitle">{t("adminShards.subtitle")}</p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${wsConnected ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                      <div className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                      <span className="text-xs" data-testid="text-ws-status">{wsConnected ? t("common.connected") : t("adminShards.reconnecting")}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {wsConnected ? t("adminShards.wsConnected") : t("adminShards.wsReconnecting")}
                  </TooltipContent>
                </Tooltip>
                <Clock className="h-4 w-4" />
                <span data-testid="text-last-update">{t("adminShards.lastUpdate")}: {lastUpdate.toLocaleTimeString(i18n.language === 'ko' ? 'ko-KR' : 'en-US')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500/10 text-green-500 flex items-center gap-1" data-testid="badge-ai-active">
                  <Brain className="h-3 w-3" />
                  {t("adminShards.aiAutoRebalancing")}
                </Badge>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      data-testid="button-refresh"
                    >
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("common.refresh")}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleExport}
                      data-testid="button-export"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("common.export")}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline"
                      onClick={() => rebalanceMutation.mutate()}
                      disabled={rebalanceMutation.isPending}
                      data-testid="button-manual-rebalance"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${rebalanceMutation.isPending ? 'animate-spin' : ''}`} />
                      {t("adminShards.manualRebalance")}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("adminShards.manualRebalanceTooltip")}</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {isLoading ? (
              <>
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
              </>
            ) : (
              <>
                <Card data-testid="metric-total-shards">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold" data-testid="value-total-shards">{stats.totalShards}</p>
                    <p className="text-xs text-muted-foreground">{t("adminShards.totalShards")}</p>
                  </CardContent>
                </Card>
                <Card data-testid="metric-combined-tps">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold" data-testid="value-combined-tps">{stats.totalTps.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{t("adminShards.combinedTps")}</p>
                  </CardContent>
                </Card>
                <Card data-testid="metric-avg-load">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold" data-testid="value-avg-load">{stats.avgLoad}%</p>
                    <p className="text-xs text-muted-foreground">{t("adminShards.avgLoad")}</p>
                  </CardContent>
                </Card>
                <Card data-testid="metric-total-validators">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold" data-testid="value-total-validators">{stats.totalValidators}</p>
                    <p className="text-xs text-muted-foreground">{t("adminShards.totalValidators")}</p>
                  </CardContent>
                </Card>
                <Card data-testid="metric-healthy-shards">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-500" data-testid="value-healthy-shards">{stats.healthyShards}/{stats.totalShards}</p>
                    <p className="text-xs text-muted-foreground">{t("adminShards.healthy")}</p>
                  </CardContent>
                </Card>
                <Card data-testid="metric-pending-rebalance">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-500" data-testid="value-pending-rebalance">{stats.pendingRebalance}</p>
                    <p className="text-xs text-muted-foreground">{t("adminShards.pendingRebalance")}</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("adminShards.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-shard-search"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isLoading ? (
              <>
                <ShardCardSkeleton />
                <ShardCardSkeleton />
                <ShardCardSkeleton />
                <ShardCardSkeleton />
              </>
            ) : (
              filteredShards.map((shard) => (
                <Card key={shard.id} data-testid={`card-shard-${shard.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <CardTitle className="text-lg flex items-center gap-2" data-testid={`text-shard-name-${shard.id}`}>
                        <Grid3x3 className="h-5 w-5" />
                        {shard.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(shard.status)}
                        <div className="flex items-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="ghost" data-testid={`button-view-shard-${shard.id}`}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{t("common.view")}</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="ghost" data-testid={`button-settings-shard-${shard.id}`}>
                                <Settings className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{t("common.settings")}</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-center cursor-help" data-testid={`metric-tps-${shard.id}`}>
                            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                              <Zap className="h-3 w-3" />
                              {t("adminShards.tps")}
                            </div>
                            <p className="text-lg font-bold" data-testid={`value-tps-${shard.id}`}>{shard.tps}</p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{t("adminShards.tpsTooltip")}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-center cursor-help" data-testid={`metric-validators-${shard.id}`}>
                            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                              <Users className="h-3 w-3" />
                              {t("adminShards.validators")}
                            </div>
                            <p className="text-lg font-bold" data-testid={`value-validators-${shard.id}`}>{shard.validators}</p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{t("adminShards.validatorsTooltip")}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-center cursor-help" data-testid={`metric-pending-${shard.id}`}>
                            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                              <Activity className="h-3 w-3" />
                              {t("adminShards.pending")}
                            </div>
                            <p className="text-lg font-bold" data-testid={`value-pending-${shard.id}`}>{shard.pendingTx}</p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{t("adminShards.pendingTooltip")}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-center cursor-help" data-testid={`metric-cross-shard-${shard.id}`}>
                            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                              <ArrowRightLeft className="h-3 w-3" />
                              {t("adminShards.crossShard")}
                            </div>
                            <p className="text-lg font-bold" data-testid={`value-cross-shard-${shard.id}`}>{shard.crossShardTx}</p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{t("adminShards.crossShardTooltip")}</TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{t("adminShards.load")}</span>
                          <span className={`font-medium ${shard.load >= 80 ? "text-red-500" : shard.load >= 70 ? "text-yellow-500" : "text-green-500"}`} data-testid={`value-load-${shard.id}`}>
                            {shard.load}%
                          </span>
                        </div>
                        <Progress value={shard.load} className={`h-2 ${getLoadColor(shard.load)}`} data-testid={`progress-load-${shard.id}`} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{t("adminShards.rebalanceScore")}</span>
                          <span className="font-medium" data-testid={`value-rebalance-${shard.id}`}>{shard.rebalanceScore}%</span>
                        </div>
                        <Progress value={shard.rebalanceScore} className="h-2" data-testid={`progress-rebalance-${shard.id}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {!isLoading && filteredShards.length === 0 && (
            <div className="text-center py-8 text-muted-foreground" data-testid="text-no-shards">
              {t("adminShards.noShardsFound")}
            </div>
          )}

          <Card data-testid="card-load-history">
            <CardHeader>
              <CardTitle className="flex items-center gap-2" data-testid="text-history-title">
                <TrendingUp className="h-5 w-5" />
                {t("adminShards.loadHistory")}
              </CardTitle>
              <CardDescription>{t("adminShards.loadHistory24h")}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <div className="h-[300px]" data-testid="chart-load-history">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={loadHistory}>
                      <defs>
                        <linearGradient id="colorS0" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorS1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="time" className="text-xs" />
                      <YAxis className="text-xs" domain={[0, 100]} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Area type="monotone" dataKey="shard0" stroke="#10b981" fill="url(#colorS0)" strokeWidth={2} name={t("adminShards.beaconShard")} />
                      <Area type="monotone" dataKey="shard3" stroke="#f59e0b" fill="none" strokeWidth={2} name={t("adminShards.gammaWarning")} strokeDasharray="5 5" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
