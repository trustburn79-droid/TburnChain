import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Download,
  Eye,
  Gauge,
  HardDrive,
  MemoryStick,
  Network,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface NetworkStats {
  tps: number;
  blockHeight: number;
  avgBlockTime: number;
  pendingTransactions: number;
  latency: number;
}

interface SystemResources {
  cpu: number;
  memory: number;
  disk: number;
  networkIO: number;
}

interface ShardPerformance {
  shardId: number;
  tps: number;
  latency: number;
  load: number;
  status: "healthy" | "warning" | "critical";
}

function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  subValue,
  change, 
  changeType = "positive",
  isLoading = false,
  bgColor = "bg-primary/10",
  iconColor = "text-primary",
  testId,
  showProgress = false,
  progressValue = 0
}: {
  icon: any;
  label: string;
  value: string | number;
  subValue?: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  isLoading?: boolean;
  bgColor?: string;
  iconColor?: string;
  testId: string;
  showProgress?: boolean;
  progressValue?: number;
}) {
  return (
    <Card data-testid={testId}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${bgColor}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">{label}</p>
            {isLoading ? (
              <Skeleton className="h-6 w-20 mt-1" />
            ) : (
              <>
                <p className="text-lg font-bold truncate" data-testid={`${testId}-value`}>{value}</p>
                {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
              </>
            )}
            {showProgress && !isLoading && (
              <Progress value={progressValue} className="h-1 mt-1" />
            )}
            {change && !isLoading && (
              <p className={`text-xs flex items-center gap-1 ${
                changeType === "positive" ? "text-green-500" : 
                changeType === "negative" ? "text-red-500" : "text-muted-foreground"
              }`}>
                {changeType === "positive" ? <TrendingUp className="h-3 w-3" /> : 
                 changeType === "negative" ? <TrendingDown className="h-3 w-3" /> : null}
                {change}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminPerformance() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState("24h");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showShardDetail, setShowShardDetail] = useState(false);
  const [selectedShard, setSelectedShard] = useState<ShardPerformance | null>(null);
  const [showExportConfirm, setShowExportConfirm] = useState(false);

  const { data: networkStats, isLoading: loadingNetwork, error: networkError, refetch: refetchNetwork } = useQuery<NetworkStats>({
    queryKey: ["/api/network/stats"],
    refetchInterval: 5000,
  });

  const { data: resourcesData, isLoading: loadingResources, refetch: refetchResources } = useQuery<SystemResources>({
    queryKey: ["/api/admin/system/resources"],
    refetchInterval: 10000,
  });

  const systemResources: SystemResources = useMemo(() => {
    if (resourcesData) return resourcesData;
    return { cpu: 42, memory: 68, disk: 54, networkIO: 78 };
  }, [resourcesData]);

  const performanceHistory = useMemo(() => {
    return Array.from({ length: 48 }, (_, i) => ({
      time: `${(47 - i) * 30}m`,
      tps: Math.floor(Math.random() * 8000) + 48000,
      latency: Math.floor(Math.random() * 30) + 175,
      cpu: Math.floor(Math.random() * 25) + 38,
      memory: Math.floor(Math.random() * 15) + 58,
    })).reverse();
  }, []);

  const shardPerformance: ShardPerformance[] = useMemo(() => [
    { shardId: 0, tps: 10245, latency: 185, load: 68, status: "healthy" },
    { shardId: 1, tps: 10128, latency: 188, load: 72, status: "healthy" },
    { shardId: 2, tps: 10312, latency: 182, load: 65, status: "healthy" },
    { shardId: 3, tps: 9876, latency: 195, load: 78, status: "warning" },
    { shardId: 4, tps: 10456, latency: 178, load: 62, status: "healthy" },
  ], []);

  const latencyBreakdown = useMemo(() => ({
    p50: 145,
    p90: 189,
    p95: 225,
    p99: 285,
    max: 380,
  }), []);

  useEffect(() => {
    let ws: WebSocket | null = null;
    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
        
        ws.onopen = () => {
          setWsConnected(true);
          ws?.send(JSON.stringify({ type: "subscribe", channels: ["performance", "resources"] }));
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "performance_update" || data.type === "resources_update") {
              refetchNetwork();
              refetchResources();
            }
            setLastUpdate(new Date());
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
  }, [refetchNetwork, refetchResources]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchNetwork(), refetchResources()]);
      toast({
        title: t("adminPerformance.refreshSuccess"),
        description: t("adminPerformance.dataUpdated"),
      });
    } catch (error) {
      toast({
        title: t("adminPerformance.refreshError"),
        description: t("adminPerformance.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
      setLastUpdate(new Date());
    }
  }, [refetchNetwork, refetchResources, toast, t]);

  const handleExportConfirmed = useCallback(() => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      timeRange,
      networkStats,
      systemResources,
      shardPerformance,
      latencyBreakdown,
      performanceHistory,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tburn-performance-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: t("adminPerformance.exportSuccess"),
      description: t("adminPerformance.exportSuccessDesc"),
    });
    setShowExportConfirm(false);
  }, [networkStats, systemResources, shardPerformance, latencyBreakdown, performanceHistory, timeRange, toast, t]);

  const handleExport = useCallback(() => {
    setShowExportConfirm(true);
  }, []);

  const getShardDetailSections = useCallback((shard: ShardPerformance): DetailSection[] => {
    const statusColors: Record<string, string> = {
      healthy: "bg-green-500/10 text-green-500",
      warning: "bg-yellow-500/10 text-yellow-500",
      critical: "bg-red-500/10 text-red-500",
    };

    return [
      {
        title: t("adminPerformance.detail.shardInfo"),
        fields: [
          {
            label: t("adminPerformance.shardId"),
            value: `${t("adminPerformance.shard")} #${shard.shardId}`,
            type: "text",
          },
          {
            label: t("adminPerformance.status"),
            value: t(`adminPerformance.${shard.status}`),
            type: "badge",
            badgeColor: statusColors[shard.status],
          },
          {
            label: t("adminPerformance.load"),
            value: shard.load,
            type: "progress",
          },
        ],
      },
      {
        title: t("adminPerformance.detail.perfMetrics"),
        fields: [
          {
            label: t("adminPerformance.tps"),
            value: `${shard.tps} tx/s`,
            type: "text",
          },
          {
            label: t("adminPerformance.latency"),
            value: `${shard.latency}ms`,
            type: "text",
          },
        ],
      },
    ];
  }, [t]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-green-500/10 text-green-500">{t("adminPerformance.healthy")}</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500/10 text-yellow-500">{t("adminPerformance.warning")}</Badge>;
      case "critical":
        return <Badge className="bg-red-500/10 text-red-500">{t("adminPerformance.critical")}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (networkError) {
    return (
      <div className="flex-1 flex items-center justify-center" data-testid="performance-error">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t("adminPerformance.error.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("adminPerformance.error.description")}</p>
            <Button onClick={() => refetchNetwork()} data-testid="button-retry">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminPerformance.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex-1 overflow-auto" data-testid="performance-page">
        <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-page-title">
                <Gauge className="h-8 w-8" />
                {t("adminPerformance.title")}
              </h1>
              <p className="text-muted-foreground" data-testid="text-page-subtitle">
                {t("adminPerformance.subtitle")}
              </p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${wsConnected ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                      <div className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                      <span className="text-xs">{wsConnected ? t("adminPerformance.connected") : t("adminPerformance.reconnecting")}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {wsConnected ? t("adminPerformance.wsConnected") : t("adminPerformance.wsReconnecting")}
                  </TooltipContent>
                </Tooltip>
                <Clock className="h-4 w-4" />
                <span data-testid="text-last-update">{t("adminPerformance.lastUpdate")}: {lastUpdate.toLocaleTimeString(i18n.language === 'ko' ? 'ko-KR' : 'en-US')}</span>
              </div>
              <Select value={timeRange} onValueChange={setTimeRange} data-testid="select-time-range">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder={t("adminPerformance.timeRange")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">{t("adminPerformance.last1Hour")}</SelectItem>
                  <SelectItem value="6h">{t("adminPerformance.last6Hours")}</SelectItem>
                  <SelectItem value="24h">{t("adminPerformance.last24Hours")}</SelectItem>
                  <SelectItem value="7d">{t("adminPerformance.last7Days")}</SelectItem>
                  <SelectItem value="30d">{t("adminPerformance.last30Days")}</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
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
                  <TooltipContent>{t("adminPerformance.refresh")}</TooltipContent>
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
                  <TooltipContent>{t("adminPerformance.export")}</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              icon={Zap}
              label={t("adminPerformance.currentTps")}
              value={networkStats?.tps?.toLocaleString() || "0"}
              change="+5.2%"
              changeType="positive"
              isLoading={loadingNetwork}
              bgColor="bg-primary/10"
              iconColor="text-primary"
              testId="metric-tps"
            />
            <MetricCard
              icon={Clock}
              label={t("adminPerformance.avgLatency")}
              value={`${latencyBreakdown.p50}ms`}
              subValue={t("adminPerformance.p50ResponseTime")}
              isLoading={loadingNetwork}
              bgColor="bg-blue-500/10"
              iconColor="text-blue-500"
              testId="metric-latency"
            />
            <MetricCard
              icon={Cpu}
              label={t("adminPerformance.cpuUsage")}
              value={`${systemResources.cpu}%`}
              isLoading={loadingResources}
              bgColor="bg-green-500/10"
              iconColor="text-green-500"
              testId="metric-cpu"
              showProgress
              progressValue={systemResources.cpu}
            />
            <MetricCard
              icon={MemoryStick}
              label={t("adminPerformance.memoryUsage")}
              value={`${systemResources.memory}%`}
              isLoading={loadingResources}
              bgColor="bg-purple-500/10"
              iconColor="text-purple-500"
              testId="metric-memory"
              showProgress
              progressValue={systemResources.memory}
            />
          </div>

          <Tabs defaultValue="throughput" className="space-y-4">
            <TabsList data-testid="tabs-performance">
              <TabsTrigger value="throughput" data-testid="tab-throughput">{t("adminPerformance.throughput")}</TabsTrigger>
              <TabsTrigger value="latency" data-testid="tab-latency">{t("adminPerformance.latency")}</TabsTrigger>
              <TabsTrigger value="resources" data-testid="tab-resources">{t("adminPerformance.resources")}</TabsTrigger>
              <TabsTrigger value="shards" data-testid="tab-shards">{t("adminPerformance.shards")}</TabsTrigger>
            </TabsList>

            <TabsContent value="throughput">
              <Card data-testid="card-throughput">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    {t("adminPerformance.transactionThroughput")}
                  </CardTitle>
                  <CardDescription>{t("adminPerformance.throughputDescription")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingNetwork ? (
                    <Skeleton className="h-[350px] w-full" />
                  ) : (
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={performanceHistory}>
                          <defs>
                            <linearGradient id="colorTps" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="time" className="text-xs" />
                          <YAxis className="text-xs" />
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Area type="monotone" dataKey="tps" stroke="#10b981" fill="url(#colorTps)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="latency">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card data-testid="card-latency-distribution">
                  <CardHeader>
                    <CardTitle>{t("adminPerformance.latencyDistribution")}</CardTitle>
                    <CardDescription>{t("adminPerformance.latencyDistributionDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingNetwork ? (
                      <Skeleton className="h-[300px] w-full" />
                    ) : (
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={performanceHistory}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="time" className="text-xs" />
                            <YAxis className="text-xs" />
                            <RechartsTooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                              }}
                            />
                            <Line type="monotone" dataKey="latency" stroke="#3b82f6" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card data-testid="card-latency-percentiles">
                  <CardHeader>
                    <CardTitle>{t("adminPerformance.latencyPercentiles")}</CardTitle>
                    <CardDescription>{t("adminPerformance.latencyPercentilesDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { label: "P50", value: latencyBreakdown.p50, color: "bg-green-500" },
                        { label: "P90", value: latencyBreakdown.p90, color: "bg-blue-500" },
                        { label: "P95", value: latencyBreakdown.p95, color: "bg-yellow-500" },
                        { label: "P99", value: latencyBreakdown.p99, color: "bg-orange-500" },
                        { label: "Max", value: latencyBreakdown.max, color: "bg-red-500" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-4" data-testid={`latency-${item.label.toLowerCase()}`}>
                          <span className="w-12 text-sm font-medium">{item.label}</span>
                          <div className="flex-1">
                            <Progress value={(item.value / latencyBreakdown.max) * 100} className={`h-3 ${item.color}`} />
                          </div>
                          <span className="w-16 text-right font-mono text-sm">{item.value}ms</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="resources">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card data-testid="card-cpu-memory">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cpu className="h-5 w-5" />
                      {t("adminPerformance.cpuMemoryUsage")}
                    </CardTitle>
                    <CardDescription>{t("adminPerformance.cpuMemoryDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingResources ? (
                      <Skeleton className="h-[300px] w-full" />
                    ) : (
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={performanceHistory}>
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
                            <Line type="monotone" dataKey="cpu" stroke="#10b981" strokeWidth={2} dot={false} name="CPU %" />
                            <Line type="monotone" dataKey="memory" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Memory %" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card data-testid="card-storage-network">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HardDrive className="h-5 w-5" />
                      {t("adminPerformance.storageNetwork")}
                    </CardTitle>
                    <CardDescription>{t("adminPerformance.storageNetworkDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div data-testid="resource-disk">
                        <div className="flex justify-between text-sm mb-2">
                          <span>{t("adminPerformance.diskUsage")}</span>
                          <span className="font-medium">54% (1.2TB / 2.2TB)</span>
                        </div>
                        <Progress value={54} className="h-3" />
                      </div>
                      <div data-testid="resource-network-io">
                        <div className="flex justify-between text-sm mb-2">
                          <span>{t("adminPerformance.networkIO")}</span>
                          <span className="font-medium">78% (780 Mbps)</span>
                        </div>
                        <Progress value={78} className="h-3" />
                      </div>
                      <div data-testid="resource-connections">
                        <div className="flex justify-between text-sm mb-2">
                          <span>{t("adminPerformance.connections")}</span>
                          <span className="font-medium">2,847 {t("adminPerformance.active")}</span>
                        </div>
                        <Progress value={45} className="h-3" />
                      </div>
                      <div data-testid="resource-db-pool">
                        <div className="flex justify-between text-sm mb-2">
                          <span>{t("adminPerformance.databasePool")}</span>
                          <span className="font-medium">62% (31/50 {t("adminPerformance.connections")})</span>
                        </div>
                        <Progress value={62} className="h-3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="shards">
              <Card data-testid="card-shard-performance">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="h-5 w-5" />
                    {t("adminPerformance.shardPerformance")}
                  </CardTitle>
                  <CardDescription>{t("adminPerformance.shardPerformanceDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-medium">{t("adminPerformance.shardId")}</th>
                            <th className="text-right py-3 px-4 font-medium">{t("adminPerformance.tps")}</th>
                            <th className="text-right py-3 px-4 font-medium">{t("adminPerformance.latency")}</th>
                            <th className="text-center py-3 px-4 font-medium">{t("adminPerformance.load")}</th>
                            <th className="text-center py-3 px-4 font-medium">{t("adminPerformance.status")}</th>
                            <th className="text-center py-3 px-4 font-medium">{t("common.actions")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {shardPerformance.map((shard) => (
                            <tr key={shard.shardId} className="border-b hover-elevate" data-testid={`shard-row-${shard.shardId}`}>
                              <td className="py-3 px-4 font-mono">{t("adminPerformance.shard")} #{shard.shardId}</td>
                              <td className="py-3 px-4 text-right font-mono" data-testid={`shard-tps-${shard.shardId}`}>{shard.tps}</td>
                              <td className="py-3 px-4 text-right font-mono" data-testid={`shard-latency-${shard.shardId}`}>{shard.latency}ms</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <Progress value={shard.load} className="h-2 flex-1" />
                                  <span className="w-10 text-right text-xs">{shard.load}%</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center" data-testid={`shard-status-${shard.shardId}`}>
                                {getStatusBadge(shard.status)}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedShard(shard);
                                    setShowShardDetail(true);
                                  }}
                                  data-testid={`button-view-shard-${shard.shardId}`}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {selectedShard && (
        <DetailSheet
          open={showShardDetail}
          onOpenChange={setShowShardDetail}
          title={`${t("adminPerformance.shard")} #${selectedShard.shardId}`}
          description={t("adminPerformance.shardPerformanceDesc")}
          icon={<Gauge className="h-5 w-5" />}
          sections={getShardDetailSections(selectedShard)}
        />
      )}

      <ConfirmationDialog
        open={showExportConfirm}
        onOpenChange={setShowExportConfirm}
        title={t("adminPerformance.confirm.exportTitle")}
        description={t("adminPerformance.confirm.exportDesc")}
        confirmText={t("common.export")}
        cancelText={t("adminPerformance.cancel")}
        onConfirm={handleExportConfirmed}
        destructive={false}
      />
    </TooltipProvider>
  );
}
