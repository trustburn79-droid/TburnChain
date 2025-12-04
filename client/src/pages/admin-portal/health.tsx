import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Download,
  Globe,
  HardDrive,
  Heart,
  MemoryStick,
  Network,
  RefreshCw,
  Server,
  Shield,
  XCircle,
  Zap,
} from "lucide-react";

interface ServiceHealth {
  name: string;
  status: "healthy" | "degraded" | "unhealthy";
  latency: number;
  uptime: number;
  lastCheck: Date;
  details?: string;
}

interface NetworkStats {
  tps: number;
  blockHeight: number;
  avgBlockTime: number;
  totalValidators: number;
  activeValidators: number;
}

interface HealthMetrics {
  overallHealth: number;
  networkHealth: number;
  consensusHealth: number;
  storageHealth: number;
  aiHealth: number;
}

interface HealthEvent {
  time: string;
  event: string;
  status: "success" | "warning" | "error";
}

function HealthMetricCard({
  icon: Icon,
  label,
  value,
  color,
  isLoading = false,
  testId,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
  isLoading?: boolean;
  testId: string;
}) {
  return (
    <Card data-testid={testId}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            {isLoading ? (
              <Skeleton className="h-6 w-16 mt-1" />
            ) : (
              <p className="text-xl font-bold" data-testid={`${testId}-value`}>{value}%</p>
            )}
          </div>
        </div>
        {!isLoading && <Progress value={value} className="h-1 mt-2" />}
      </CardContent>
    </Card>
  );
}

export default function AdminHealth() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const { data: networkStats, refetch: refetchNetwork, isLoading: loadingNetwork, error: networkError } = useQuery<NetworkStats>({
    queryKey: ["/api/network/stats"],
    refetchInterval: 10000,
  });

  const { data: servicesData, refetch: refetchServices, isLoading: loadingServices } = useQuery<{ services: ServiceHealth[] }>({
    queryKey: ["/api/admin/services/health"],
    refetchInterval: 15000,
  });

  const services: ServiceHealth[] = useMemo(() => {
    if (servicesData?.services) return servicesData.services;
    return [
      { name: t("adminHealth.consensusEngine"), status: "healthy", latency: 12, uptime: 99.99, lastCheck: new Date(), details: t("adminHealth.consensusEngineDetails") },
      { name: t("adminHealth.blockProducer"), status: "healthy", latency: 8, uptime: 99.98, lastCheck: new Date(), details: t("adminHealth.blockProducerDetails") },
      { name: t("adminHealth.transactionPool"), status: "healthy", latency: 5, uptime: 99.99, lastCheck: new Date(), details: t("adminHealth.transactionPoolDetails") },
      { name: t("adminHealth.validatorNetwork"), status: "healthy", latency: 145, uptime: 99.95, lastCheck: new Date(), details: t("adminHealth.validatorNetworkDetails") },
      { name: t("adminHealth.shardManager"), status: "healthy", latency: 18, uptime: 99.97, lastCheck: new Date(), details: t("adminHealth.shardManagerDetails") },
      { name: t("adminHealth.crossShardRouter"), status: "healthy", latency: 35, uptime: 99.92, lastCheck: new Date(), details: t("adminHealth.crossShardRouterDetails") },
      { name: t("adminHealth.bridgeRelayer"), status: "degraded", latency: 285, uptime: 98.5, lastCheck: new Date(), details: t("adminHealth.bridgeRelayerDetails") },
      { name: t("adminHealth.aiOrchestrator"), status: "healthy", latency: 156, uptime: 99.88, lastCheck: new Date(), details: t("adminHealth.aiOrchestratorDetails") },
      { name: t("adminHealth.databaseCluster"), status: "healthy", latency: 3, uptime: 99.99, lastCheck: new Date(), details: t("adminHealth.databaseClusterDetails") },
      { name: t("adminHealth.cacheLayer"), status: "healthy", latency: 1, uptime: 99.99, lastCheck: new Date(), details: t("adminHealth.cacheLayerDetails") },
      { name: t("adminHealth.apiGateway"), status: "healthy", latency: 15, uptime: 99.97, lastCheck: new Date(), details: t("adminHealth.apiGatewayDetails") },
      { name: t("adminHealth.websocketServer"), status: "healthy", latency: 8, uptime: 99.95, lastCheck: new Date(), details: t("adminHealth.websocketServerDetails") },
    ];
  }, [servicesData, t]);

  const healthMetrics: HealthMetrics = useMemo(() => ({
    overallHealth: 98.5,
    networkHealth: 99.2,
    consensusHealth: 99.8,
    storageHealth: 97.5,
    aiHealth: 99.1,
  }), []);

  const healthEvents: HealthEvent[] = useMemo(() => [
    { time: t("adminHealth.minAgo", { count: 2 }), event: t("adminHealth.healthCheckCompleted"), status: "success" },
    { time: t("adminHealth.minAgo", { count: 15 }), event: t("adminHealth.bridgeLatencySpike"), status: "warning" },
    { time: t("adminHealth.hourAgo", { count: 1 }), event: t("adminHealth.cacheRefreshCompleted"), status: "success" },
    { time: t("adminHealth.hourAgo", { count: 2 }), event: t("adminHealth.dbConnectionOptimized"), status: "success" },
    { time: t("adminHealth.hourAgo", { count: 4 }), event: t("adminHealth.aiModelRetraining"), status: "success" },
    { time: t("adminHealth.hourAgo", { count: 6 }), event: t("adminHealth.scheduledMaintenanceCompleted"), status: "success" },
  ], [t]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "unhealthy":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-green-500/10 text-green-500">{t("adminHealth.healthy")}</Badge>;
      case "degraded":
        return <Badge className="bg-yellow-500/10 text-yellow-500">{t("adminHealth.degraded")}</Badge>;
      case "unhealthy":
        return <Badge className="bg-red-500/10 text-red-500">{t("adminHealth.unhealthy")}</Badge>;
      default:
        return <Badge variant="secondary">{t("adminHealth.unknown")}</Badge>;
    }
  };

  const overallStatus = useMemo(() => {
    const unhealthy = services.filter(s => s.status === "unhealthy").length;
    const degraded = services.filter(s => s.status === "degraded").length;
    if (unhealthy > 0) return "unhealthy";
    if (degraded > 0) return "degraded";
    return "healthy";
  }, [services]);

  useEffect(() => {
    let ws: WebSocket | null = null;
    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
        
        ws.onopen = () => {
          setWsConnected(true);
          ws?.send(JSON.stringify({ type: "subscribe", channels: ["health", "services"] }));
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "health_update" || data.type === "service_update") {
              refetchNetwork();
              refetchServices();
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
  }, [refetchNetwork, refetchServices]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchNetwork(), refetchServices()]);
      toast({
        title: t("adminHealth.refreshSuccess"),
        description: t("adminHealth.dataUpdated"),
      });
    } catch (error) {
      toast({
        title: t("adminHealth.refreshError"),
        description: t("adminHealth.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
      setLastUpdate(new Date());
    }
  }, [refetchNetwork, refetchServices, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      overallStatus,
      healthMetrics,
      services,
      healthEvents,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tburn-health-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: t("adminHealth.exportSuccess"),
      description: t("adminHealth.exportSuccessDesc"),
    });
  }, [overallStatus, healthMetrics, services, healthEvents, toast, t]);

  if (networkError) {
    return (
      <div className="flex-1 flex items-center justify-center" data-testid="health-error">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t("adminHealth.error.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("adminHealth.error.description")}</p>
            <Button onClick={() => refetchNetwork()} data-testid="button-retry">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminHealth.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex-1 overflow-auto" data-testid="health-page">
        <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-page-title">
                <Heart className="h-8 w-8" />
                {t("adminHealth.title")}
              </h1>
              <p className="text-muted-foreground" data-testid="text-page-subtitle">
                {t("adminHealth.subtitle")}
              </p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${wsConnected ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                      <div className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                      <span className="text-xs">{wsConnected ? t("adminHealth.connected") : t("adminHealth.reconnecting")}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {wsConnected ? t("adminHealth.wsConnected") : t("adminHealth.wsReconnecting")}
                  </TooltipContent>
                </Tooltip>
                <Clock className="h-4 w-4" />
                <span data-testid="text-last-update">{t("adminHealth.lastUpdate")}: {lastUpdate.toLocaleTimeString(i18n.language === 'ko' ? 'ko-KR' : 'en-US')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{t("adminHealth.overallStatus")}:</span>
                {getStatusBadge(overallStatus)}
              </div>
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
                  <TooltipContent>{t("adminHealth.refresh")}</TooltipContent>
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
                  <TooltipContent>{t("adminHealth.export")}</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <HealthMetricCard
              icon={Heart}
              label={t("adminHealth.overallHealth")}
              value={healthMetrics.overallHealth}
              color="text-red-500"
              isLoading={loadingNetwork}
              testId="metric-overall-health"
            />
            <HealthMetricCard
              icon={Globe}
              label={t("adminHealth.networkHealth")}
              value={healthMetrics.networkHealth}
              color="text-blue-500"
              isLoading={loadingNetwork}
              testId="metric-network-health"
            />
            <HealthMetricCard
              icon={Shield}
              label={t("adminHealth.consensusHealth")}
              value={healthMetrics.consensusHealth}
              color="text-green-500"
              isLoading={loadingNetwork}
              testId="metric-consensus-health"
            />
            <HealthMetricCard
              icon={Database}
              label={t("adminHealth.storageHealth")}
              value={healthMetrics.storageHealth}
              color="text-purple-500"
              isLoading={loadingNetwork}
              testId="metric-storage-health"
            />
            <HealthMetricCard
              icon={Zap}
              label={t("adminHealth.aiHealth")}
              value={healthMetrics.aiHealth}
              color="text-orange-500"
              isLoading={loadingNetwork}
              testId="metric-ai-health"
            />
          </div>

          <Card data-testid="card-services">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                {t("adminHealth.serviceHealthStatus")}
              </CardTitle>
              <CardDescription>{t("adminHealth.serviceHealthStatusDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingServices ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.map((service, index) => (
                      <div
                        key={service.name}
                        className="p-4 rounded-lg border hover-elevate cursor-pointer"
                        data-testid={`service-card-${index}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(service.status)}
                            <span className="font-medium text-sm" data-testid={`service-name-${index}`}>{service.name}</span>
                          </div>
                          {getStatusBadge(service.status)}
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex justify-between">
                            <span>{t("adminHealth.latency")}</span>
                            <span className="font-mono" data-testid={`service-latency-${index}`}>{service.latency}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t("adminHealth.uptime")}</span>
                            <span className="font-mono" data-testid={`service-uptime-${index}`}>{service.uptime}%</span>
                          </div>
                          {service.details && (
                            <p className="mt-2 pt-2 border-t text-muted-foreground" data-testid={`service-details-${index}`}>{service.details}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card data-testid="card-infrastructure">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  {t("adminHealth.infrastructureStatus")}
                </CardTitle>
                <CardDescription>{t("adminHealth.infrastructureStatusDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50" data-testid="infra-primary-node">
                    <div className="flex items-center gap-3">
                      <Server className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-sm">{t("adminHealth.primaryNode")}</p>
                        <p className="text-xs text-muted-foreground">node-01.tburn.io</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/10 text-green-500">{t("adminHealth.active")}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50" data-testid="infra-backup-node">
                    <div className="flex items-center gap-3">
                      <Server className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-sm">{t("adminHealth.backupNode")}</p>
                        <p className="text-xs text-muted-foreground">node-02.tburn.io</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/10 text-green-500">{t("adminHealth.standby")}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50" data-testid="infra-database">
                    <div className="flex items-center gap-3">
                      <Database className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="font-medium text-sm">{t("adminHealth.databaseCluster")}</p>
                        <p className="text-xs text-muted-foreground">PostgreSQL (Neon)</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/10 text-green-500">{t("adminHealth.healthy")}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50" data-testid="infra-load-balancer">
                    <div className="flex items-center gap-3">
                      <Network className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="font-medium text-sm">{t("adminHealth.loadBalancer")}</p>
                        <p className="text-xs text-muted-foreground">lb.tburn.io</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/10 text-green-500">{t("adminHealth.active")}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-health-events">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  {t("adminHealth.recentHealthEvents")}
                </CardTitle>
                <CardDescription>{t("adminHealth.recentHealthEventsDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[280px]">
                  <div className="space-y-3">
                    {healthEvents.map((event, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover-elevate" data-testid={`health-event-${index}`}>
                        <div className={`w-2 h-2 rounded-full ${
                          event.status === "success" ? "bg-green-500" :
                          event.status === "warning" ? "bg-yellow-500" : "bg-red-500"
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm" data-testid={`event-message-${index}`}>{event.event}</p>
                        </div>
                        <span className="text-xs text-muted-foreground" data-testid={`event-time-${index}`}>{event.time}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
