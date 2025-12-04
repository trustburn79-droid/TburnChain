import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  AlertTriangle, Shield, Power, Pause, Play, 
  RefreshCw, Clock, CheckCircle, XCircle, AlertCircle, Loader2
} from "lucide-react";

interface SystemStatus {
  overall: "operational" | "degraded" | "critical";
  mainnet: "running" | "paused";
  bridge: "running" | "paused";
  consensus: "running" | "paused";
  ai: "running" | "paused";
  database: "running" | "paused";
}

interface EmergencyControl {
  id: string;
  name: string;
  description: string;
  status: "ready" | "active";
  severity: "critical" | "high" | "medium";
}

interface RecentAction {
  id: number;
  action: string;
  by: string;
  reason: string;
  timestamp: string;
  duration: string;
  status: "resolved" | "active";
}

interface CircuitBreaker {
  name: string;
  threshold: string;
  current: string;
  status: "normal" | "warning" | "tripped";
  enabled: boolean;
}

interface EmergencyData {
  systemStatus: SystemStatus;
  controls: EmergencyControl[];
  recentActions: RecentAction[];
  circuitBreakers: CircuitBreaker[];
}

export default function AdminEmergency() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [confirmDialog, setConfirmDialog] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [wsConnected, setWsConnected] = useState(false);

  const { data: emergencyData, isLoading, error, refetch } = useQuery<EmergencyData>({
    queryKey: ["/api/admin/emergency/status"],
    refetchInterval: 5000,
  });

  const activateControlMutation = useMutation({
    mutationFn: async (controlId: string) => {
      return apiRequest(`/api/admin/emergency/activate/${controlId}`, {
        method: "POST",
      });
    },
    onSuccess: (_, controlId) => {
      toast({
        title: t("adminEmergency.actionActivated"),
        description: t("adminEmergency.actionActivatedDesc", { action: controlId }),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/emergency/status"] });
      setConfirmDialog(null);
    },
    onError: () => {
      toast({
        title: t("adminEmergency.actionError"),
        description: t("adminEmergency.actionErrorDesc"),
        variant: "destructive",
      });
    },
  });

  const toggleBreakerMutation = useMutation({
    mutationFn: async (data: { name: string; enabled: boolean }) => {
      return apiRequest("/api/admin/emergency/breaker", {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: t("adminEmergency.breakerUpdated"),
        description: t("adminEmergency.breakerUpdatedDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/emergency/status"] });
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
          ws?.send(JSON.stringify({ type: "subscribe", channels: ["emergency_status"] }));
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "emergency_update" || data.type === "status_change") {
              refetch();
              if (data.severity === "critical") {
                toast({
                  title: t("adminEmergency.criticalAlert"),
                  description: data.message,
                  variant: "destructive",
                });
              }
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
  }, [refetch, toast, t]);

  const systemStatus = useMemo(() => {
    if (emergencyData?.systemStatus) return emergencyData.systemStatus;
    return {
      overall: "operational" as const,
      mainnet: "running" as const,
      bridge: "running" as const,
      consensus: "running" as const,
      ai: "running" as const,
      database: "running" as const,
    };
  }, [emergencyData]);

  const emergencyControls = useMemo(() => {
    if (emergencyData?.controls) return emergencyData.controls;
    return [
      { id: "pause_mainnet", name: t("adminEmergency.pauseMainnet"), description: t("adminEmergency.pauseMainnetDesc"), status: "ready" as const, severity: "critical" as const },
      { id: "pause_bridge", name: t("adminEmergency.pauseBridge"), description: t("adminEmergency.pauseBridgeDesc"), status: "ready" as const, severity: "high" as const },
      { id: "pause_consensus", name: t("adminEmergency.pauseConsensus"), description: t("adminEmergency.pauseConsensusDesc"), status: "ready" as const, severity: "critical" as const },
      { id: "disable_ai", name: t("adminEmergency.disableAI"), description: t("adminEmergency.disableAIDesc"), status: "ready" as const, severity: "medium" as const },
      { id: "maintenance_mode", name: t("adminEmergency.maintenanceMode"), description: t("adminEmergency.maintenanceModeDesc"), status: "ready" as const, severity: "medium" as const },
    ];
  }, [emergencyData, t]);

  const recentActions = useMemo(() => {
    if (emergencyData?.recentActions) return emergencyData.recentActions;
    return [
      { id: 1, action: t("adminEmergency.bridgePause"), by: "Admin", reason: t("adminEmergency.securityInvestigation"), timestamp: "2024-12-01 14:30", duration: "2h 15m", status: "resolved" as const },
      { id: 2, action: t("adminEmergency.aiDisable"), by: "System", reason: t("adminEmergency.highErrorRate"), timestamp: "2024-11-28 09:00", duration: "45m", status: "resolved" as const },
      { id: 3, action: t("adminEmergency.maintenanceActivated"), by: "Admin", reason: t("adminEmergency.plannedUpgrade"), timestamp: "2024-11-25 22:00", duration: "4h", status: "resolved" as const },
    ];
  }, [emergencyData, t]);

  const circuitBreakers = useMemo(() => {
    if (emergencyData?.circuitBreakers) return emergencyData.circuitBreakers;
    return [
      { name: t("adminEmergency.transactionRate"), threshold: "100k TPS", current: "52k TPS", status: "normal" as const, enabled: true },
      { name: t("adminEmergency.gasPrice"), threshold: "500 Ember", current: "125 Ember", status: "normal" as const, enabled: true },
      { name: t("adminEmergency.bridgeVolume"), threshold: "$50M/day", current: "$12.5M", status: "normal" as const, enabled: true },
      { name: t("adminEmergency.errorRate"), threshold: "1%", current: "0.13%", status: "normal" as const, enabled: true },
    ];
  }, [emergencyData, t]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: t("adminEmergency.refreshSuccess"),
        description: t("adminEmergency.dataUpdated"),
      });
    } catch (error) {
      toast({
        title: t("adminEmergency.refreshError"),
        description: t("adminEmergency.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
      setLastUpdate(new Date());
    }
  }, [refetch, toast, t]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "bg-green-500";
      case "paused": return "bg-yellow-500";
      case "stopped": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center" data-testid="emergency-error">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t("adminEmergency.error.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("adminEmergency.error.description")}</p>
            <Button onClick={() => refetch()} data-testid="button-retry">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminEmergency.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <ScrollArea className="h-full" data-testid="emergency-page">
        <div className="p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-page-title">{t("adminEmergency.title")}</h1>
              <p className="text-muted-foreground" data-testid="text-page-subtitle">{t("adminEmergency.subtitle")}</p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${wsConnected ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                      <div className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                      <span className="text-xs">{wsConnected ? t("adminEmergency.connected") : t("adminEmergency.reconnecting")}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {wsConnected ? t("adminEmergency.wsConnected") : t("adminEmergency.wsReconnecting")}
                  </TooltipContent>
                </Tooltip>
                <Clock className="h-4 w-4" />
                <span data-testid="text-last-update">{t("adminEmergency.lastUpdate")}: {lastUpdate.toLocaleTimeString(i18n.language === 'ko' ? 'ko-KR' : 'en-US')}</span>
              </div>
              <Badge 
                variant="outline" 
                className={`${systemStatus.overall === "operational" ? "bg-green-500/10 text-green-500 border-green-500/30" : 
                             systemStatus.overall === "degraded" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30" : 
                             "bg-red-500/10 text-red-500 border-red-500/30"}`}
                data-testid="badge-system-status"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                {systemStatus.overall === "operational" ? t("adminEmergency.allSystemsOperational") : 
                 systemStatus.overall === "degraded" ? t("adminEmergency.systemsDegraded") :
                 t("adminEmergency.systemsCritical")}
              </Badge>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing} data-testid="button-refresh">
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("adminEmergency.refresh")}</TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4" data-testid="system-status-grid">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))
            ) : (
              <>
                {["mainnet", "bridge", "consensus", "ai", "database"].map((system, index) => (
                  <Card key={system} data-testid={`status-${system}`}>
                    <CardContent className="pt-6 text-center">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(systemStatus[system as keyof SystemStatus] as string)} mx-auto mb-2 animate-pulse`} />
                      <div className="text-sm font-medium" data-testid={`status-name-${system}`}>{t(`adminEmergency.${system}`)}</div>
                      <div className="text-xs text-muted-foreground" data-testid={`status-value-${system}`}>
                        {systemStatus[system as keyof SystemStatus] === "running" ? t("adminEmergency.running") : t("adminEmergency.paused")}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>

          <Card className="border-red-500/30 bg-red-500/5" data-testid="card-emergency-controls">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="w-5 h-5" />
                {t("adminEmergency.emergencyActions")}
              </CardTitle>
              <CardDescription>{t("adminEmergency.emergencyActionsDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {emergencyControls.map((control, index) => (
                    <div key={control.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`control-${control.id}`}>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium" data-testid={`control-name-${index}`}>{control.name}</p>
                          <Badge variant={
                            control.severity === "critical" ? "destructive" :
                            control.severity === "high" ? "default" : "secondary"
                          } data-testid={`control-severity-${index}`}>
                            {control.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground" data-testid={`control-desc-${index}`}>{control.description}</p>
                      </div>
                      <Dialog open={confirmDialog === control.id} onOpenChange={(open) => setConfirmDialog(open ? control.id : null)}>
                        <DialogTrigger asChild>
                          <Button variant="destructive" size="sm" data-testid={`button-activate-${index}`}>
                            <Pause className="w-4 h-4 mr-2" />
                            {t("adminEmergency.activate")}
                          </Button>
                        </DialogTrigger>
                        <DialogContent data-testid={`dialog-confirm-${control.id}`}>
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-red-500">
                              <AlertTriangle className="w-5 h-5" />
                              {t("adminEmergency.confirm")} {control.name}
                            </DialogTitle>
                            <DialogDescription>
                              {t("adminEmergency.confirmDesc", { action: control.name.toLowerCase() })}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-sm">{control.description}</p>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setConfirmDialog(null)} data-testid="button-cancel">
                              {t("adminEmergency.cancel")}
                            </Button>
                            <Button 
                              variant="destructive" 
                              onClick={() => activateControlMutation.mutate(control.id)}
                              disabled={activateControlMutation.isPending}
                              data-testid="button-confirm-action"
                            >
                              {activateControlMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : null}
                              {t("adminEmergency.confirmAction")}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="breakers" className="space-y-4" data-testid="tabs-emergency">
            <TabsList data-testid="tabs-list">
              <TabsTrigger value="breakers" data-testid="tab-breakers">{t("adminEmergency.circuitBreakers")}</TabsTrigger>
              <TabsTrigger value="history" data-testid="tab-history">{t("adminEmergency.actionHistory")}</TabsTrigger>
            </TabsList>

            <TabsContent value="breakers">
              <Card data-testid="card-circuit-breakers">
                <CardHeader>
                  <CardTitle>{t("adminEmergency.circuitBreakers")}</CardTitle>
                  <CardDescription>{t("adminEmergency.circuitBreakersDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("adminEmergency.breaker")}</TableHead>
                          <TableHead>{t("adminEmergency.threshold")}</TableHead>
                          <TableHead>{t("adminEmergency.current")}</TableHead>
                          <TableHead>{t("adminEmergency.status")}</TableHead>
                          <TableHead>{t("adminEmergency.enabled")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {circuitBreakers.map((breaker, index) => (
                          <TableRow key={index} data-testid={`breaker-row-${index}`}>
                            <TableCell className="font-medium" data-testid={`breaker-name-${index}`}>{breaker.name}</TableCell>
                            <TableCell data-testid={`breaker-threshold-${index}`}>{breaker.threshold}</TableCell>
                            <TableCell data-testid={`breaker-current-${index}`}>{breaker.current}</TableCell>
                            <TableCell>
                              <Badge className={breaker.status === "normal" ? "bg-green-500" : breaker.status === "warning" ? "bg-yellow-500" : "bg-red-500"} data-testid={`breaker-status-${index}`}>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {breaker.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Switch 
                                checked={breaker.enabled} 
                                onCheckedChange={(enabled) => toggleBreakerMutation.mutate({ name: breaker.name, enabled })}
                                disabled={toggleBreakerMutation.isPending}
                                data-testid={`breaker-switch-${index}`}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card data-testid="card-action-history">
                <CardHeader>
                  <CardTitle>{t("adminEmergency.emergencyActionHistory")}</CardTitle>
                  <CardDescription>{t("adminEmergency.emergencyActionHistoryDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("adminEmergency.action")}</TableHead>
                          <TableHead>{t("adminEmergency.initiatedBy")}</TableHead>
                          <TableHead>{t("adminEmergency.reason")}</TableHead>
                          <TableHead>{t("adminEmergency.timestamp")}</TableHead>
                          <TableHead>{t("adminEmergency.duration")}</TableHead>
                          <TableHead>{t("adminEmergency.status")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentActions.map((action, index) => (
                          <TableRow key={action.id} data-testid={`action-row-${index}`}>
                            <TableCell className="font-medium" data-testid={`action-name-${index}`}>{action.action}</TableCell>
                            <TableCell data-testid={`action-by-${index}`}>{action.by}</TableCell>
                            <TableCell data-testid={`action-reason-${index}`}>{action.reason}</TableCell>
                            <TableCell className="text-muted-foreground" data-testid={`action-time-${index}`}>{action.timestamp}</TableCell>
                            <TableCell data-testid={`action-duration-${index}`}>{action.duration}</TableCell>
                            <TableCell>
                              <Badge className={action.status === "resolved" ? "bg-green-500" : "bg-yellow-500"} data-testid={`action-status-${index}`}>
                                {action.status === "resolved" ? t("adminEmergency.resolved") : t("adminEmergency.active")}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </TooltipProvider>
  );
}
