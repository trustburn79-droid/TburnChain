import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  Bell,
  BellOff,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  EyeOff,
  Filter,
  Info,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Trash2,
  X,
  Zap,
} from "lucide-react";

interface Alert {
  id: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  title: string;
  description: string;
  source: string;
  timestamp: Date;
  acknowledged: boolean;
  resolved: boolean;
  category: string;
}

interface AlertStats {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  acknowledged: number;
  unacknowledged: number;
}

function AlertStatCard({
  icon: Icon,
  label,
  value,
  bgColor = "bg-muted",
  iconColor = "text-muted-foreground",
  isLoading = false,
  testId,
}: {
  icon: any;
  label: string;
  value: number;
  bgColor?: string;
  iconColor?: string;
  isLoading?: boolean;
  testId: string;
}) {
  return (
    <Card data-testid={testId}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${bgColor}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            {isLoading ? (
              <Skeleton className="h-7 w-12 mt-1" />
            ) : (
              <p className="text-2xl font-bold" data-testid={`${testId}-value`}>{value}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminAlerts() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showResolved, setShowResolved] = useState(false);

  const { data: alertsData, isLoading: loadingAlerts, error: alertsError, refetch: refetchAlerts } = useQuery<{ alerts: Alert[] }>({
    queryKey: ["/api/admin/alerts"],
    refetchInterval: 15000,
  });

  const alerts: Alert[] = useMemo(() => {
    if (alertsData?.alerts) return alertsData.alerts;
    return [
      { id: "alert-1", severity: "critical", title: t("adminAlerts.validatorDowntime"), description: t("adminAlerts.validatorDowntimeDesc"), source: "Validator Monitor", timestamp: new Date(Date.now() - 300000), acknowledged: false, resolved: false, category: "validators" },
      { id: "alert-2", severity: "high", title: t("adminAlerts.highMemoryUsage"), description: t("adminAlerts.highMemoryUsageDesc"), source: "Resource Monitor", timestamp: new Date(Date.now() - 600000), acknowledged: true, resolved: false, category: "resources" },
      { id: "alert-3", severity: "medium", title: t("adminAlerts.bridgeLatencySpike"), description: t("adminAlerts.bridgeLatencySpikeDesc"), source: "Bridge Monitor", timestamp: new Date(Date.now() - 900000), acknowledged: false, resolved: false, category: "bridge" },
      { id: "alert-4", severity: "low", title: t("adminAlerts.unusualTrafficPattern"), description: t("adminAlerts.unusualTrafficPatternDesc"), source: "Security Monitor", timestamp: new Date(Date.now() - 1200000), acknowledged: true, resolved: false, category: "security" },
      { id: "alert-5", severity: "info", title: t("adminAlerts.scheduledMaintenance"), description: t("adminAlerts.scheduledMaintenanceDesc"), source: "System", timestamp: new Date(Date.now() - 1800000), acknowledged: true, resolved: false, category: "system" },
      { id: "alert-6", severity: "high", title: t("adminAlerts.consensusDelay"), description: t("adminAlerts.consensusDelayDesc"), source: "Consensus Engine", timestamp: new Date(Date.now() - 2400000), acknowledged: false, resolved: false, category: "consensus" },
      { id: "alert-7", severity: "critical", title: t("adminAlerts.databaseConnectionPool"), description: t("adminAlerts.databaseConnectionPoolDesc"), source: "Database Monitor", timestamp: new Date(Date.now() - 3600000), acknowledged: true, resolved: true, category: "database" },
      { id: "alert-8", severity: "medium", title: t("adminAlerts.aiModelAccuracy"), description: t("adminAlerts.aiModelAccuracyDesc"), source: "AI Monitor", timestamp: new Date(Date.now() - 5400000), acknowledged: true, resolved: true, category: "ai" },
    ];
  }, [alertsData, t]);

  const alertStats: AlertStats = useMemo(() => {
    const activeAlerts = showResolved ? alerts : alerts.filter(a => !a.resolved);
    return {
      total: activeAlerts.length,
      critical: activeAlerts.filter(a => a.severity === "critical").length,
      high: activeAlerts.filter(a => a.severity === "high").length,
      medium: activeAlerts.filter(a => a.severity === "medium").length,
      low: activeAlerts.filter(a => a.severity === "low").length,
      info: activeAlerts.filter(a => a.severity === "info").length,
      acknowledged: activeAlerts.filter(a => a.acknowledged).length,
      unacknowledged: activeAlerts.filter(a => !a.acknowledged).length,
    };
  }, [alerts, showResolved]);

  const filteredAlerts = useMemo(() => {
    let result = showResolved ? alerts : alerts.filter(a => !a.resolved);
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(a => 
        a.title.toLowerCase().includes(query) || 
        a.description.toLowerCase().includes(query) ||
        a.source.toLowerCase().includes(query)
      );
    }
    
    if (severityFilter !== "all") {
      result = result.filter(a => a.severity === severityFilter);
    }
    
    if (statusFilter === "acknowledged") {
      result = result.filter(a => a.acknowledged);
    } else if (statusFilter === "unacknowledged") {
      result = result.filter(a => !a.acknowledged);
    }
    
    return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [alerts, searchQuery, severityFilter, statusFilter, showResolved]);

  const acknowledgeAlert = useMutation({
    mutationFn: async (alertId: string) => {
      return apiRequest("POST", `/api/admin/alerts/${alertId}/acknowledge`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/alerts"] });
      toast({ title: t("adminAlerts.alertAcknowledged") });
    },
    onError: () => {
      toast({ title: t("adminAlerts.acknowledgeError"), variant: "destructive" });
    },
  });

  const resolveAlert = useMutation({
    mutationFn: async (alertId: string) => {
      return apiRequest("POST", `/api/admin/alerts/${alertId}/resolve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/alerts"] });
      toast({ title: t("adminAlerts.alertResolved") });
    },
    onError: () => {
      toast({ title: t("adminAlerts.resolveError"), variant: "destructive" });
    },
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge className="bg-red-500/10 text-red-500">{t("adminAlerts.critical")}</Badge>;
      case "high":
        return <Badge className="bg-orange-500/10 text-orange-500">{t("adminAlerts.high")}</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500/10 text-yellow-500">{t("adminAlerts.medium")}</Badge>;
      case "low":
        return <Badge className="bg-blue-500/10 text-blue-500">{t("adminAlerts.low")}</Badge>;
      case "info":
        return <Badge className="bg-gray-500/10 text-gray-500">{t("adminAlerts.info")}</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertOctagon className="h-5 w-5 text-red-500" />;
      case "high":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case "medium":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "low":
        return <Info className="h-5 w-5 text-blue-500" />;
      case "info":
        return <Info className="h-5 w-5 text-gray-500" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  useEffect(() => {
    let ws: WebSocket | null = null;
    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
        
        ws.onopen = () => {
          setWsConnected(true);
          ws?.send(JSON.stringify({ type: "subscribe", channels: ["alerts"] }));
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "alert_update" || data.type === "new_alert") {
              refetchAlerts();
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
  }, [refetchAlerts]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetchAlerts();
      toast({
        title: t("adminAlerts.refreshSuccess"),
        description: t("adminAlerts.dataUpdated"),
      });
    } catch (error) {
      toast({
        title: t("adminAlerts.refreshError"),
        description: t("adminAlerts.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
      setLastUpdate(new Date());
    }
  }, [refetchAlerts, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      alertStats,
      alerts: filteredAlerts,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tburn-alerts-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: t("adminAlerts.exportSuccess"),
      description: t("adminAlerts.exportSuccessDesc"),
    });
  }, [alertStats, filteredAlerts, toast, t]);

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return t("adminAlerts.minAgo", { count: minutes });
    if (hours < 24) return t("adminAlerts.hourAgo", { count: hours });
    return t("adminAlerts.dayAgo", { count: days });
  };

  if (alertsError) {
    return (
      <div className="flex-1 flex items-center justify-center" data-testid="alerts-error">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t("adminAlerts.error.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("adminAlerts.error.description")}</p>
            <Button onClick={() => refetchAlerts()} data-testid="button-retry">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminAlerts.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex-1 overflow-auto" data-testid="alerts-page">
        <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-page-title">
                <Bell className="h-8 w-8" />
                {t("adminAlerts.title")}
              </h1>
              <p className="text-muted-foreground" data-testid="text-page-subtitle">
                {t("adminAlerts.subtitle")}
              </p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${wsConnected ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                      <div className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                      <span className="text-xs">{wsConnected ? t("adminAlerts.connected") : t("adminAlerts.reconnecting")}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {wsConnected ? t("adminAlerts.wsConnected") : t("adminAlerts.wsReconnecting")}
                  </TooltipContent>
                </Tooltip>
                <Clock className="h-4 w-4" />
                <span data-testid="text-last-update">{t("adminAlerts.lastUpdate")}: {lastUpdate.toLocaleTimeString(i18n.language === 'ko' ? 'ko-KR' : 'en-US')}</span>
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
                  <TooltipContent>{t("adminAlerts.refresh")}</TooltipContent>
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
                  <TooltipContent>{t("adminAlerts.export")}</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <AlertStatCard
              icon={Bell}
              label={t("adminAlerts.totalAlerts")}
              value={alertStats.total}
              bgColor="bg-primary/10"
              iconColor="text-primary"
              isLoading={loadingAlerts}
              testId="stat-total"
            />
            <AlertStatCard
              icon={AlertOctagon}
              label={t("adminAlerts.critical")}
              value={alertStats.critical}
              bgColor="bg-red-500/10"
              iconColor="text-red-500"
              isLoading={loadingAlerts}
              testId="stat-critical"
            />
            <AlertStatCard
              icon={AlertTriangle}
              label={t("adminAlerts.high")}
              value={alertStats.high}
              bgColor="bg-orange-500/10"
              iconColor="text-orange-500"
              isLoading={loadingAlerts}
              testId="stat-high"
            />
            <AlertStatCard
              icon={AlertCircle}
              label={t("adminAlerts.medium")}
              value={alertStats.medium}
              bgColor="bg-yellow-500/10"
              iconColor="text-yellow-500"
              isLoading={loadingAlerts}
              testId="stat-medium"
            />
            <AlertStatCard
              icon={Info}
              label={t("adminAlerts.low")}
              value={alertStats.low}
              bgColor="bg-blue-500/10"
              iconColor="text-blue-500"
              isLoading={loadingAlerts}
              testId="stat-low"
            />
            <AlertStatCard
              icon={Info}
              label={t("adminAlerts.info")}
              value={alertStats.info}
              bgColor="bg-gray-500/10"
              iconColor="text-gray-500"
              isLoading={loadingAlerts}
              testId="stat-info"
            />
            <AlertStatCard
              icon={Eye}
              label={t("adminAlerts.acknowledged")}
              value={alertStats.acknowledged}
              bgColor="bg-green-500/10"
              iconColor="text-green-500"
              isLoading={loadingAlerts}
              testId="stat-acknowledged"
            />
            <AlertStatCard
              icon={EyeOff}
              label={t("adminAlerts.unacknowledged")}
              value={alertStats.unacknowledged}
              bgColor="bg-muted"
              iconColor="text-muted-foreground"
              isLoading={loadingAlerts}
              testId="stat-unacknowledged"
            />
          </div>

          <Card data-testid="card-alert-filters">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("adminAlerts.searchPlaceholder")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search"
                    />
                  </div>
                </div>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-[150px]" data-testid="select-severity">
                    <SelectValue placeholder={t("adminAlerts.severity")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("adminAlerts.allSeverities")}</SelectItem>
                    <SelectItem value="critical">{t("adminAlerts.critical")}</SelectItem>
                    <SelectItem value="high">{t("adminAlerts.high")}</SelectItem>
                    <SelectItem value="medium">{t("adminAlerts.medium")}</SelectItem>
                    <SelectItem value="low">{t("adminAlerts.low")}</SelectItem>
                    <SelectItem value="info">{t("adminAlerts.info")}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]" data-testid="select-status">
                    <SelectValue placeholder={t("adminAlerts.status")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("adminAlerts.allStatuses")}</SelectItem>
                    <SelectItem value="acknowledged">{t("adminAlerts.acknowledged")}</SelectItem>
                    <SelectItem value="unacknowledged">{t("adminAlerts.unacknowledged")}</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={showResolved}
                    onCheckedChange={setShowResolved}
                    data-testid="switch-show-resolved"
                  />
                  <span className="text-sm text-muted-foreground">{t("adminAlerts.showResolved")}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-alerts-list">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {t("adminAlerts.activeAlerts")} ({filteredAlerts.length})
              </CardTitle>
              <CardDescription>{t("adminAlerts.activeAlertsDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAlerts ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : filteredAlerts.length === 0 ? (
                <div className="text-center py-12" data-testid="no-alerts">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">{t("adminAlerts.noActiveAlerts")}</h3>
                  <p className="text-muted-foreground">{t("adminAlerts.noActiveAlertsDesc")}</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {filteredAlerts.map((alert, index) => (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-lg border hover-elevate ${
                          alert.resolved ? 'opacity-60' : ''
                        } ${alert.severity === 'critical' && !alert.acknowledged ? 'border-red-500/50' : ''}`}
                        data-testid={`alert-item-${index}`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="mt-1">{getSeverityIcon(alert.severity)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h4 className="font-medium" data-testid={`alert-title-${index}`}>{alert.title}</h4>
                              {getSeverityBadge(alert.severity)}
                              {alert.acknowledged && (
                                <Badge variant="outline" className="text-xs">{t("adminAlerts.acked")}</Badge>
                              )}
                              {alert.resolved && (
                                <Badge className="bg-green-500/10 text-green-500 text-xs">{t("adminAlerts.resolved")}</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2" data-testid={`alert-desc-${index}`}>{alert.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{t("adminAlerts.source")}: {alert.source}</span>
                              <span data-testid={`alert-time-${index}`}>{formatTimestamp(alert.timestamp)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!alert.acknowledged && !alert.resolved && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => acknowledgeAlert.mutate(alert.id)}
                                    disabled={acknowledgeAlert.isPending}
                                    data-testid={`button-acknowledge-${index}`}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{t("adminAlerts.acknowledge")}</TooltipContent>
                              </Tooltip>
                            )}
                            {!alert.resolved && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => resolveAlert.mutate(alert.id)}
                                    disabled={resolveAlert.isPending}
                                    data-testid={`button-resolve-${index}`}
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{t("adminAlerts.resolve")}</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
