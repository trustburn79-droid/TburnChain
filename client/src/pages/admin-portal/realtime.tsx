import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import {
  Monitor,
  Activity,
  Cpu,
  HardDrive,
  Network,
  Zap,
  RefreshCw,
  Pause,
  Play,
  Bell,
  Clock,
  Server,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Download,
  Eye,
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface MetricData {
  timestamp: string;
  value: number;
}

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: "healthy" | "warning" | "critical";
  trend: "up" | "down" | "stable";
  sparkline: MetricData[];
}

interface LiveEvent {
  id: string;
  type: "info" | "warning" | "error" | "success";
  message: string;
  timestamp: string;
  source: string;
}

interface RealtimeData {
  systemMetrics: SystemMetric[];
  resourceMetrics: { name: string; value: number; max: number; unit: string; status: "healthy" | "warning" | "critical" }[];
  liveEvents: LiveEvent[];
  tpsData: MetricData[];
  latencyData: MetricData[];
}

export default function RealtimeMonitor() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLive, setIsLive] = useState(true);
  const [refreshRate, setRefreshRate] = useState("1s");
  const [activeTab, setActiveTab] = useState("overview");
  const [lastUpdate, setLastUpdate] = useState(new Date().toISOString());
  const [wsConnected, setWsConnected] = useState(false);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<LiveEvent | null>(null);
  const [showExportConfirm, setShowExportConfirm] = useState(false);

  const generateTimeSeriesData = () => {
    return Array.from({ length: 60 }, (_, i) => ({
      timestamp: new Date(Date.now() - (59 - i) * 1000).toISOString(),
      value: Math.floor(Math.random() * 100) + 400,
    }));
  };

  const [tpsData, setTpsData] = useState(generateTimeSeriesData());
  const [latencyData, setLatencyData] = useState(
    Array.from({ length: 60 }, (_, i) => ({
      timestamp: new Date(Date.now() - (59 - i) * 1000).toISOString(),
      value: Math.floor(Math.random() * 50) + 10,
    }))
  );

  const { data: realtimeData, isLoading, error, refetch } = useQuery<RealtimeData>({
    queryKey: ["/api/admin/monitoring/realtime"],
    refetchInterval: isLive ? (refreshRate === "1s" ? 1000 : refreshRate === "5s" ? 5000 : 10000) : false,
  });

  useEffect(() => {
    if (!isLive) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/realtime`;
    
    let ws: WebSocket | null = null;
    
    try {
      ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        setWsConnected(true);
        toast({
          title: t("adminRealtime.wsConnected"),
          description: t("adminRealtime.wsConnectedDesc"),
        });
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "metrics") {
            setTpsData(prev => {
              const newData = [...prev.slice(1)];
              newData.push({
                timestamp: new Date().toISOString(),
                value: data.tps || Math.floor(Math.random() * 100) + 400,
              });
              return newData;
            });
            
            setLatencyData(prev => {
              const newData = [...prev.slice(1)];
              newData.push({
                timestamp: new Date().toISOString(),
                value: data.latency || Math.floor(Math.random() * 50) + 10,
              });
              return newData;
            });
            
            setLastUpdate(new Date().toISOString());
          }
        } catch (e) {
          console.error("WebSocket message parse error:", e);
        }
      };
      
      ws.onclose = () => {
        setWsConnected(false);
      };
      
      ws.onerror = () => {
        setWsConnected(false);
      };
    } catch (e) {
      console.error("WebSocket connection error:", e);
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [isLive, t, toast]);

  useEffect(() => {
    if (!isLive || wsConnected) return;
    
    const interval = setInterval(() => {
      setTpsData(prev => {
        const newData = [...prev.slice(1)];
        newData.push({
          timestamp: new Date().toISOString(),
          value: Math.floor(Math.random() * 100) + 400,
        });
        return newData;
      });
      
      setLatencyData(prev => {
        const newData = [...prev.slice(1)];
        newData.push({
          timestamp: new Date().toISOString(),
          value: Math.floor(Math.random() * 50) + 10,
        });
        return newData;
      });
      
      setLastUpdate(new Date().toISOString());
    }, refreshRate === "1s" ? 1000 : refreshRate === "5s" ? 5000 : 10000);

    return () => clearInterval(interval);
  }, [isLive, refreshRate, wsConnected]);

  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: t("adminRealtime.refreshed"),
      description: t("adminRealtime.refreshedDesc"),
    });
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    setShowExportConfirm(true);
  }, []);

  const performExport = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      tpsData,
      latencyData,
      systemMetrics,
      resourceMetrics,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `realtime-metrics-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportConfirm(false);
    toast({
      title: t("adminRealtime.exported"),
      description: t("adminRealtime.exportedDesc"),
    });
  }, [tpsData, latencyData, toast, t]);

  const systemMetrics: SystemMetric[] = [
    {
      name: t("adminRealtime.tpsCurrent"),
      value: tpsData[tpsData.length - 1]?.value || 0,
      unit: "tx/s",
      status: "healthy",
      trend: "up",
      sparkline: tpsData.slice(-20),
    },
    {
      name: t("adminRealtime.blockHeight"),
      value: 12847563,
      unit: "",
      status: "healthy",
      trend: "up",
      sparkline: [],
    },
    {
      name: t("adminRealtime.avgLatency"),
      value: latencyData[latencyData.length - 1]?.value || 0,
      unit: "ms",
      status: "healthy",
      trend: "stable",
      sparkline: latencyData.slice(-20),
    },
    {
      name: t("adminRealtime.activeValidators"),
      value: 156,
      unit: "",
      status: "healthy",
      trend: "stable",
      sparkline: [],
    },
    {
      name: t("adminRealtime.mempoolSize"),
      value: 1247,
      unit: "txs",
      status: "healthy",
      trend: "down",
      sparkline: [],
    },
    {
      name: t("adminRealtime.networkPeers"),
      value: 324,
      unit: "",
      status: "healthy",
      trend: "up",
      sparkline: [],
    },
  ];

  const resourceMetrics = [
    { name: t("adminRealtime.cpuUsage"), value: 45, max: 100, unit: "%", status: "healthy" as const },
    { name: t("adminRealtime.memory"), value: 67, max: 100, unit: "%", status: "healthy" as const },
    { name: t("adminRealtime.diskIO"), value: 23, max: 100, unit: "%", status: "healthy" as const },
    { name: t("adminRealtime.network"), value: 156, max: 1000, unit: "Mbps", status: "healthy" as const },
  ];

  const liveEvents: LiveEvent[] = [
    { id: "1", type: "success", message: t("adminRealtime.events.blockProduced"), timestamp: new Date().toISOString(), source: "Consensus" },
    { id: "2", type: "info", message: t("adminRealtime.events.peerConnected"), timestamp: new Date(Date.now() - 5000).toISOString(), source: "Network" },
    { id: "3", type: "warning", message: t("adminRealtime.events.highMempool"), timestamp: new Date(Date.now() - 12000).toISOString(), source: "Mempool" },
    { id: "4", type: "success", message: t("adminRealtime.events.crossShardComplete"), timestamp: new Date(Date.now() - 18000).toISOString(), source: "Sharding" },
    { id: "5", type: "info", message: t("adminRealtime.events.aiOptimization"), timestamp: new Date(Date.now() - 25000).toISOString(), source: "AI" },
    { id: "6", type: "error", message: t("adminRealtime.events.rpcTimeout"), timestamp: new Date(Date.now() - 30000).toISOString(), source: "API" },
    { id: "7", type: "success", message: t("adminRealtime.events.validatorJoined"), timestamp: new Date(Date.now() - 45000).toISOString(), source: "Validator" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy": return "text-green-500";
      case "warning": return "text-yellow-500";
      case "critical": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getEventTypeBadgeColor = (type: string) => {
    switch (type) {
      case "success": return "bg-green-500/10 text-green-500";
      case "warning": return "bg-yellow-500/10 text-yellow-500";
      case "error": return "bg-red-500/10 text-red-500";
      default: return "bg-blue-500/10 text-blue-500";
    }
  };

  const getEventDetailSections = (event: LiveEvent): DetailSection[] => {
    return [
      {
        title: t("adminRealtime.detail.eventInfo"),
        fields: [
          { label: t("common.id"), value: event.id, type: "code", copyable: true },
          { label: t("common.type"), value: event.type, type: "badge", badgeColor: getEventTypeBadgeColor(event.type) },
          { label: t("adminRealtime.events.source"), value: event.source },
          { label: t("adminRealtime.timestamp"), value: event.timestamp, type: "date" },
        ],
      },
      {
        title: t("adminRealtime.detail.message"),
        fields: [
          { label: t("adminRealtime.message"), value: event.message },
        ],
      },
    ];
  };

  if (error) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="container max-w-[1800px] mx-auto p-6">
          <Card className="border-destructive">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <div className="flex-1">
                  <h3 className="font-semibold">{t("adminRealtime.errorTitle")}</h3>
                  <p className="text-sm text-muted-foreground">{t("adminRealtime.errorDescription")}</p>
                </div>
                <Button onClick={() => refetch()} data-testid="button-retry-realtime">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t("adminRealtime.retry")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-testid="realtime-monitor-page">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-realtime-title">
              <Monitor className="h-8 w-8" />
              {t("adminRealtime.title")}
            </h1>
            <p className="text-muted-foreground" data-testid="text-realtime-description">
              {t("adminRealtime.description")}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={wsConnected ? "default" : "secondary"} data-testid="badge-ws-status">
              {wsConnected ? t("adminRealtime.wsConnected") : t("adminRealtime.wsDisconnected")}
            </Badge>
            <div className="flex items-center gap-2">
              <Label htmlFor="refresh-rate">{t("adminRealtime.refresh")}</Label>
              <Select value={refreshRate} onValueChange={setRefreshRate}>
                <SelectTrigger className="w-24" data-testid="select-refresh-rate">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1s">1s</SelectItem>
                  <SelectItem value="5s">5s</SelectItem>
                  <SelectItem value="10s">10s</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="live-mode"
                checked={isLive}
                onCheckedChange={setIsLive}
                data-testid="switch-live-mode"
              />
              <Label htmlFor="live-mode" className="flex items-center gap-1">
                {isLive ? <Play className="h-4 w-4 text-green-500" /> : <Pause className="h-4 w-4" />}
                {isLive ? t("adminRealtime.live") : t("adminRealtime.paused")}
              </Label>
            </div>
            <Badge variant={isLive ? "default" : "secondary"} className="gap-1" data-testid="badge-last-update">
              <Clock className="h-3 w-3" />
              {new Date(lastUpdate).toLocaleTimeString()}
            </Badge>
            <Button variant="outline" onClick={handleRefresh} data-testid="button-refresh-realtime">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminRealtime.refreshBtn")}
            </Button>
            <Button variant="outline" onClick={handleExport} data-testid="button-export-realtime">
              <Download className="h-4 w-4 mr-2" />
              {t("adminRealtime.export")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {systemMetrics.map((metric, index) => (
            <Card key={metric.name} className="hover-elevate" data-testid={`card-metric-${index}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{metric.name}</span>
                  {metric.trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
                  {metric.trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-bold ${getStatusColor(metric.status)}`} data-testid={`text-metric-value-${index}`}>
                    {metric.value.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">{metric.unit}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList data-testid="tabs-realtime">
            <TabsTrigger value="overview" data-testid="tab-overview">{t("adminRealtime.tabs.overview")}</TabsTrigger>
            <TabsTrigger value="performance" data-testid="tab-performance">{t("adminRealtime.tabs.performance")}</TabsTrigger>
            <TabsTrigger value="resources" data-testid="tab-resources">{t("adminRealtime.tabs.resources")}</TabsTrigger>
            <TabsTrigger value="events" data-testid="tab-events">{t("adminRealtime.tabs.events")}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card data-testid="card-tps-chart">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    {t("adminRealtime.charts.tps")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={tpsData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="timestamp" 
                          tickFormatter={(v) => new Date(v).toLocaleTimeString()}
                          className="text-xs"
                        />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                          labelFormatter={(v) => new Date(v).toLocaleTimeString()}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="hsl(var(--primary))" 
                          fill="hsl(var(--primary) / 0.2)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-latency-chart">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    {t("adminRealtime.charts.latency")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={latencyData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="timestamp" 
                          tickFormatter={(v) => new Date(v).toLocaleTimeString()}
                          className="text-xs"
                        />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                          labelFormatter={(v) => new Date(v).toLocaleTimeString()}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="hsl(var(--chart-2))" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card data-testid="card-system-resources">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  {t("adminRealtime.systemResources")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {resourceMetrics.map((metric, index) => (
                    <div key={metric.name} className="space-y-2" data-testid={`resource-metric-${index}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{metric.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {metric.value}{metric.unit}
                        </span>
                      </div>
                      <Progress 
                        value={(metric.value / metric.max) * 100} 
                        className={
                          (metric.value / metric.max) > 0.8 ? "bg-red-200" :
                          (metric.value / metric.max) > 0.6 ? "bg-yellow-200" : ""
                        }
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card data-testid="card-current-tps">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{t("adminRealtime.performance.currentTps")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-500">
                    {tpsData[tpsData.length - 1]?.value.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">{t("adminRealtime.performance.peakTps")}</p>
                </CardContent>
              </Card>
              <Card data-testid="card-block-time">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{t("adminRealtime.performance.blockTime")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">500ms</div>
                  <p className="text-xs text-muted-foreground">{t("adminRealtime.performance.blockTimeTarget")}</p>
                </CardContent>
              </Card>
              <Card data-testid="card-consensus-time">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{t("adminRealtime.performance.consensusTime")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">124ms</div>
                  <p className="text-xs text-muted-foreground">{t("adminRealtime.performance.consensusTarget")}</p>
                </CardContent>
              </Card>
              <Card data-testid="card-finality">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{t("adminRealtime.performance.finality")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">1.84ms</div>
                  <p className="text-xs text-muted-foreground">{t("adminRealtime.performance.instantFinality")}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card data-testid="card-cpu-cores">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-5 w-5" />
                    {t("adminRealtime.resources.cpuByCore")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="space-y-1" data-testid={`cpu-core-${i}`}>
                      <div className="flex justify-between text-sm">
                        <span>{t("adminRealtime.resources.core")} {i}</span>
                        <span>{Math.floor(Math.random() * 40) + 30}%</span>
                      </div>
                      <Progress value={Math.floor(Math.random() * 40) + 30} />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card data-testid="card-storage">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5" />
                    {t("adminRealtime.resources.storage")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{t("adminRealtime.resources.blockchainData")}</span>
                      <span>2.4 TB / 4 TB</span>
                    </div>
                    <Progress value={60} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{t("adminRealtime.resources.stateDb")}</span>
                      <span>856 GB / 2 TB</span>
                    </div>
                    <Progress value={42.8} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{t("adminRealtime.resources.logs")}</span>
                      <span>124 GB / 500 GB</span>
                    </div>
                    <Progress value={24.8} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{t("adminRealtime.resources.snapshots")}</span>
                      <span>1.2 TB / 2 TB</span>
                    </div>
                    <Progress value={60} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card data-testid="card-live-events">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  {t("adminRealtime.events.title")}
                </CardTitle>
                <CardDescription>{t("adminRealtime.events.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {liveEvents.map((event, index) => (
                      <div
                        key={event.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover-elevate"
                        data-testid={`event-item-${index}`}
                      >
                        {getEventTypeIcon(event.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">{event.message}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {event.source}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(event.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowEventDetail(true);
                          }}
                          data-testid={`button-view-event-${index}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {selectedEvent && (
        <DetailSheet
          open={showEventDetail}
          onOpenChange={setShowEventDetail}
          title={t("adminRealtime.events.title")}
          subtitle={selectedEvent.id}
          icon={<Activity className="h-5 w-5" />}
          sections={getEventDetailSections(selectedEvent)}
        />
      )}

      <ConfirmationDialog
        open={showExportConfirm}
        onOpenChange={setShowExportConfirm}
        title={t("adminRealtime.confirm.exportTitle")}
        description={t("adminRealtime.confirm.exportDesc")}
        onConfirm={performExport}
        confirmText={t("common.export")}
        cancelText={t("adminRealtime.cancel")}
        destructive={false}
      />
    </div>
  );
}
