import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { 
  Network, Server, Cpu, HardDrive, 
  Activity, Zap, Globe, Clock, RefreshCw, Download, AlertCircle, Eye
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface NetworkStats {
  tps: string;
  blockTime: string;
  nodeCount: number;
  avgLatency: string;
}

interface TPSHistory {
  time: string;
  tps: number;
}

interface LatencyHistory {
  time: string;
  p50: number;
  p95: number;
  p99: number;
}

interface ShardPerformance {
  shard: string;
  tps: number;
  load: number;
  nodes: number;
}

interface ResourceUsage {
  resource: string;
  usage: number;
  trend: "up" | "down" | "stable";
}

interface NetworkAnalytics {
  stats: NetworkStats;
  tpsHistory: TPSHistory[];
  latencyHistory: LatencyHistory[];
  shardPerformance: ShardPerformance[];
  resourceUsage: ResourceUsage[];
}

function StatCard({
  icon: Icon,
  iconColor,
  label,
  value,
  isLoading,
  testId,
  bgClass = ""
}: {
  icon: any;
  iconColor: string;
  label: string;
  value: string | number;
  isLoading: boolean;
  testId: string;
  bgClass?: string;
}) {
  return (
    <Card className={bgClass} data-testid={testId}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={`w-5 h-5 ${iconColor}`} />
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        {isLoading ? (
          <Skeleton className="h-9 w-24" />
        ) : (
          <div className="text-3xl font-bold" data-testid={`${testId}-value`}>{value}</div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminNetworkAnalytics() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [wsConnected, setWsConnected] = useState(false);
  const [showShardDetail, setShowShardDetail] = useState(false);
  const [selectedShard, setSelectedShard] = useState<ShardPerformance | null>(null);
  const [showExportConfirm, setShowExportConfirm] = useState(false);

  const { data: networkData, isLoading, error, refetch } = useQuery<NetworkAnalytics>({
    queryKey: ["/api/admin/analytics/network"],
    refetchInterval: 10000,
  });

  useEffect(() => {
    let ws: WebSocket | null = null;
    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
        
        ws.onopen = () => {
          setWsConnected(true);
          ws?.send(JSON.stringify({ type: "subscribe", channels: ["network_analytics"] }));
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "network_update") {
              refetch();
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
  }, [refetch]);

  const networkStats = useMemo(() => {
    if (networkData?.stats) return networkData.stats;
    return {
      tps: "100,000+",
      blockTime: "1.0s",
      nodeCount: 512,
      avgLatency: "42ms",
    };
  }, [networkData]);

  const tpsHistory = useMemo(() => {
    if (networkData?.tpsHistory) return networkData.tpsHistory;
    return [
      { time: "00:00", tps: 85000 },
      { time: "04:00", tps: 72000 },
      { time: "08:00", tps: 95000 },
      { time: "12:00", tps: 105000 },
      { time: "16:00", tps: 98000 },
      { time: "20:00", tps: 88000 },
    ];
  }, [networkData]);

  const latencyHistory = useMemo(() => {
    if (networkData?.latencyHistory) return networkData.latencyHistory;
    return [
      { time: "00:00", p50: 38, p95: 52, p99: 68 },
      { time: "04:00", p50: 35, p95: 48, p99: 62 },
      { time: "08:00", p50: 42, p95: 58, p99: 75 },
      { time: "12:00", p50: 48, p95: 65, p99: 85 },
      { time: "16:00", p50: 45, p95: 62, p99: 78 },
      { time: "20:00", p50: 40, p95: 55, p99: 70 },
    ];
  }, [networkData]);

  const shardPerformance = useMemo(() => {
    if (networkData?.shardPerformance) return networkData.shardPerformance;
    return [
      { shard: "MainHub", tps: 12500, load: 68, nodes: 64 },
      { shard: "DeFi-Core", tps: 18500, load: 72, nodes: 64 },
      { shard: "DeFi-Swap", tps: 15800, load: 65, nodes: 64 },
      { shard: "Bridge-Hub", tps: 8500, load: 58, nodes: 48 },
      { shard: "NFT-Market", tps: 6200, load: 52, nodes: 48 },
      { shard: "Enterprise-1", tps: 14500, load: 62, nodes: 64 },
      { shard: "Enterprise-2", tps: 12800, load: 58, nodes: 64 },
      { shard: "GameFi-Hub", tps: 11200, load: 55, nodes: 48 },
    ];
  }, [networkData]);

  const resourceUsage = useMemo(() => {
    if (networkData?.resourceUsage) return networkData.resourceUsage;
    return [
      { resource: t("adminNetworkAnalytics.cpu"), usage: 58, trend: "stable" as const },
      { resource: t("adminNetworkAnalytics.memory"), usage: 62, trend: "stable" as const },
      { resource: t("adminNetworkAnalytics.diskIO"), usage: 35, trend: "stable" as const },
      { resource: t("adminNetworkAnalytics.network"), usage: 48, trend: "stable" as const },
    ];
  }, [networkData, t]);

  const getShardDetailSections = useCallback((shard: ShardPerformance): DetailSection[] => {
    return [
      {
        title: t("adminNetworkAnalytics.detail.shardInfo"),
        fields: [
          { label: t("adminNetworkAnalytics.shard"), value: shard.shard, type: "text" as const },
          { label: t("adminNetworkAnalytics.tps"), value: shard.tps.toLocaleString(), type: "text" as const },
          { label: t("adminNetworkAnalytics.load"), value: shard.load, type: "progress" as const },
          { label: t("adminNetworkAnalytics.nodes"), value: shard.nodes, type: "text" as const },
        ],
      },
      {
        title: t("adminNetworkAnalytics.detail.performance"),
        fields: [
          {
            label: t("adminNetworkAnalytics.status"),
            value: shard.load > 80 ? t("adminNetworkAnalytics.critical") : shard.load > 60 ? t("adminNetworkAnalytics.warning") : t("adminNetworkAnalytics.healthy"),
            type: "status" as const,
          },
        ],
      },
    ];
  }, [t]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: t("adminNetworkAnalytics.refreshSuccess"),
        description: t("adminNetworkAnalytics.dataUpdated"),
      });
    } catch (error) {
      toast({
        title: t("adminNetworkAnalytics.refreshError"),
        description: t("adminNetworkAnalytics.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
      setLastUpdate(new Date());
    }
  }, [refetch, toast, t]);

  const performExport = useCallback(() => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      stats: networkStats,
      tpsHistory,
      latencyHistory,
      shardPerformance,
      resourceUsage,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tburn-network-analytics-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: t("adminNetworkAnalytics.exportSuccess"),
      description: t("adminNetworkAnalytics.exportSuccessDesc"),
    });
    setShowExportConfirm(false);
  }, [networkStats, tpsHistory, latencyHistory, shardPerformance, resourceUsage, toast, t]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center" data-testid="network-analytics-error">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t("adminNetworkAnalytics.error.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("adminNetworkAnalytics.error.description")}</p>
            <Button onClick={() => refetch()} data-testid="button-retry">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminNetworkAnalytics.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <ScrollArea className="h-full" data-testid="network-analytics-page">
        <div className="p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-page-title">{t("adminNetworkAnalytics.title")}</h1>
              <p className="text-muted-foreground" data-testid="text-page-subtitle">{t("adminNetworkAnalytics.subtitle")}</p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${wsConnected ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                      <div className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                      <span className="text-xs">{wsConnected ? t("adminNetworkAnalytics.connected") : t("adminNetworkAnalytics.reconnecting")}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {wsConnected ? t("adminNetworkAnalytics.wsConnected") : t("adminNetworkAnalytics.wsReconnecting")}
                  </TooltipContent>
                </Tooltip>
                <Clock className="h-4 w-4" />
                <span data-testid="text-last-update">{t("adminNetworkAnalytics.lastUpdate")}: {lastUpdate.toLocaleTimeString(i18n.language === 'ko' ? 'ko-KR' : 'en-US')}</span>
              </div>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing} data-testid="button-refresh">
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("adminNetworkAnalytics.refresh")}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={() => setShowExportConfirm(true)} data-testid="button-export">
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("adminNetworkAnalytics.export")}</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-testid="network-stats-grid">
            <StatCard
              icon={Zap}
              iconColor="text-blue-500"
              label={t("adminNetworkAnalytics.currentTps")}
              value={networkStats.tps}
              isLoading={isLoading}
              testId="stat-tps"
              bgClass="bg-gradient-to-br from-blue-500/10 to-purple-500/10"
            />
            <StatCard
              icon={Clock}
              iconColor="text-green-500"
              label={t("adminNetworkAnalytics.blockTime")}
              value={networkStats.blockTime}
              isLoading={isLoading}
              testId="stat-block-time"
            />
            <StatCard
              icon={Server}
              iconColor="text-purple-500"
              label={t("adminNetworkAnalytics.activeNodes")}
              value={networkStats.nodeCount}
              isLoading={isLoading}
              testId="stat-node-count"
            />
            <StatCard
              icon={Activity}
              iconColor="text-orange-500"
              label={t("adminNetworkAnalytics.avgLatency")}
              value={networkStats.avgLatency}
              isLoading={isLoading}
              testId="stat-latency"
            />
          </div>

          <Tabs defaultValue="tps" className="space-y-4" data-testid="tabs-network">
            <TabsList data-testid="tabs-list">
              <TabsTrigger value="tps" data-testid="tab-tps">{t("adminNetworkAnalytics.tabThroughput")}</TabsTrigger>
              <TabsTrigger value="latency" data-testid="tab-latency">{t("adminNetworkAnalytics.tabLatency")}</TabsTrigger>
              <TabsTrigger value="shards" data-testid="tab-shards">{t("adminNetworkAnalytics.tabShards")}</TabsTrigger>
              <TabsTrigger value="resources" data-testid="tab-resources">{t("adminNetworkAnalytics.tabResources")}</TabsTrigger>
            </TabsList>

            <TabsContent value="tps">
              <Card data-testid="card-tps-history">
                <CardHeader>
                  <CardTitle>{t("adminNetworkAnalytics.tpsHistory24h")}</CardTitle>
                  <CardDescription>{t("adminNetworkAnalytics.tpsHistory24hDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-80 w-full" />
                  ) : (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={tpsHistory}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <RechartsTooltip />
                          <Area type="monotone" dataKey="tps" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} name={t("adminNetworkAnalytics.tps")} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="latency">
              <Card data-testid="card-latency-history">
                <CardHeader>
                  <CardTitle>{t("adminNetworkAnalytics.latencyDistribution24h")}</CardTitle>
                  <CardDescription>{t("adminNetworkAnalytics.latencyDistribution24hDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-80 w-full" />
                  ) : (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={latencyHistory}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <RechartsTooltip />
                          <Line type="monotone" dataKey="p50" stroke="#22c55e" name="P50" strokeWidth={2} />
                          <Line type="monotone" dataKey="p95" stroke="#f97316" name="P95" strokeWidth={2} />
                          <Line type="monotone" dataKey="p99" stroke="#ef4444" name="P99" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shards">
              <Card data-testid="card-shard-performance">
                <CardHeader>
                  <CardTitle>{t("adminNetworkAnalytics.shardPerformance")}</CardTitle>
                  <CardDescription>{t("adminNetworkAnalytics.shardPerformanceDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("adminNetworkAnalytics.shard")}</TableHead>
                          <TableHead>{t("adminNetworkAnalytics.tps")}</TableHead>
                          <TableHead>{t("adminNetworkAnalytics.load")}</TableHead>
                          <TableHead>{t("adminNetworkAnalytics.nodes")}</TableHead>
                          <TableHead className="text-right">{t("common.actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {shardPerformance.map((shard, index) => (
                          <TableRow key={index} data-testid={`shard-row-${index}`}>
                            <TableCell className="font-medium" data-testid={`shard-name-${index}`}>{shard.shard}</TableCell>
                            <TableCell data-testid={`shard-tps-${index}`}>{shard.tps.toLocaleString()}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={shard.load} className="w-20" />
                                <span className={shard.load > 70 ? "text-yellow-500" : "text-green-500"} data-testid={`shard-load-${index}`}>
                                  {shard.load}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell data-testid={`shard-nodes-${index}`}>{shard.nodes}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedShard(shard);
                                  setShowShardDetail(true);
                                }}
                                data-testid={`button-view-shard-${index}`}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                {t("adminNetworkAnalytics.view")}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources">
              <Card data-testid="card-resource-usage">
                <CardHeader>
                  <CardTitle>{t("adminNetworkAnalytics.resourceUsage")}</CardTitle>
                  <CardDescription>{t("adminNetworkAnalytics.resourceUsageDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="grid grid-cols-2 gap-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {resourceUsage.map((resource, index) => (
                        <div key={index} className="p-4 border rounded-lg" data-testid={`resource-card-${index}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium" data-testid={`resource-name-${index}`}>{resource.resource}</span>
                            <Badge variant={
                              resource.trend === "up" ? "destructive" :
                              resource.trend === "down" ? "default" : "secondary"
                            } data-testid={`resource-trend-${index}`}>
                              {resource.trend === "up" ? t("adminNetworkAnalytics.up") : 
                               resource.trend === "down" ? t("adminNetworkAnalytics.down") : 
                               t("adminNetworkAnalytics.stable")}
                            </Badge>
                          </div>
                          <Progress value={resource.usage} className="h-3" />
                          <div className="text-right text-sm text-muted-foreground mt-1" data-testid={`resource-usage-${index}`}>
                            {resource.usage}%
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>

      {selectedShard && (
        <DetailSheet
          open={showShardDetail}
          onOpenChange={setShowShardDetail}
          title={selectedShard.shard}
          subtitle={`${selectedShard.tps.toLocaleString()} TPS`}
          icon={<Server className="h-5 w-5" />}
          sections={getShardDetailSections(selectedShard)}
        />
      )}

      <ConfirmationDialog
        open={showExportConfirm}
        onOpenChange={setShowExportConfirm}
        title={t("adminNetworkAnalytics.confirm.exportTitle")}
        description={t("adminNetworkAnalytics.confirm.exportDesc")}
        onConfirm={performExport}
        confirmText={t("common.export")}
        cancelText={t("adminNetworkAnalytics.cancel")}
        destructive={false}
      />
    </TooltipProvider>
  );
}
