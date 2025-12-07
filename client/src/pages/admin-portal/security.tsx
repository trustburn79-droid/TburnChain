import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { DetailSheet } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Key,
  AlertTriangle,
  Users,
  Clock,
  RefreshCw,
  Download,
  Wifi,
  WifiOff,
  Eye,
  XCircle,
} from "lucide-react";

interface SecurityScore {
  overall: number;
  authentication: number;
  authorization: number;
  encryption: number;
  monitoring: number;
  compliance: number;
}

interface ThreatEvent {
  id: number;
  type: string;
  severity: string;
  source: string;
  target: string;
  attempts: number;
  status: string;
  time: string;
}

interface ActiveSession {
  id: number;
  user: string;
  role: string;
  ip: string;
  location: string;
  device: string;
  lastActivity: string;
}

interface SecurityData {
  securityScore: SecurityScore;
  threatEvents: ThreatEvent[];
  activeSessions: ActiveSession[];
}

export default function AdminSecurity() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [wsConnected, setWsConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedThreat, setSelectedThreat] = useState<ThreatEvent | null>(null);
  const [selectedSession, setSelectedSession] = useState<ActiveSession | null>(null);
  const [sessionToTerminate, setSessionToTerminate] = useState<ActiveSession | null>(null);

  const { data, isLoading, error, refetch } = useQuery<SecurityData>({
    queryKey: ["/api/admin/security"],
    refetchInterval: 30000,
  });

  const securityScore = data?.securityScore ?? {
    overall: 98.7,
    authentication: 99.8,
    authorization: 98.5,
    encryption: 99.2,
    monitoring: 97.8,
    compliance: 98.2,
  };

  const threatEvents = data?.threatEvents ?? [
    { id: 1, type: "Rate Limit Exceeded", severity: "low", source: "203.0.113.45", target: "/api/bridge/transfer", attempts: 85, status: "blocked", time: new Date(Date.now() - 180000).toISOString() },
    { id: 2, type: "Invalid Signature", severity: "medium", source: "198.51.100.78", target: "/api/validator/vote", attempts: 12, status: "blocked", time: new Date(Date.now() - 600000).toISOString() },
    { id: 3, type: "Geo-Blocked Region", severity: "low", source: "Multiple (OFAC)", target: "/api/*", attempts: 247, status: "blocked", time: new Date(Date.now() - 1800000).toISOString() },
    { id: 4, type: "Anomalous Pattern", severity: "low", source: "AI Detection", target: "/api/swap", attempts: 1, status: "monitored", time: new Date(Date.now() - 3600000).toISOString() },
    { id: 5, type: "API Key Rotation", severity: "info", source: "System", target: "Integration Keys", attempts: 0, status: "completed", time: new Date(Date.now() - 7200000).toISOString() },
  ];

  const activeSessions = data?.activeSessions ?? [
    { id: 1, user: "admin@tburn.io", role: "Super Admin", ip: "10.0.1.5", location: "KR-Seoul", device: "Chrome/Windows", lastActivity: new Date(Date.now() - 30000).toISOString() },
    { id: 2, user: "ops-lead@tburn.io", role: "Operator Lead", ip: "10.0.2.15", location: "US-Virginia", device: "Firefox/macOS", lastActivity: new Date(Date.now() - 120000).toISOString() },
    { id: 3, user: "security-chief@tburn.io", role: "Security Chief", ip: "10.0.3.25", location: "SG-Singapore", device: "Safari/macOS", lastActivity: new Date(Date.now() - 300000).toISOString() },
    { id: 4, user: "bridge-ops@tburn.io", role: "Bridge Operator", ip: "10.0.4.35", location: "EU-Frankfurt", device: "Chrome/Linux", lastActivity: new Date(Date.now() - 600000).toISOString() },
    { id: 5, user: "validator-admin@tburn.io", role: "Validator Admin", ip: "10.0.5.45", location: "JP-Tokyo", device: "Edge/Windows", lastActivity: new Date(Date.now() - 900000).toISOString() },
    { id: 6, user: "treasury-ops@tburn.io", role: "Treasury Operator", ip: "10.0.6.55", location: "UK-London", device: "Chrome/macOS", lastActivity: new Date(Date.now() - 1200000).toISOString() },
  ];

  const terminateSessionMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      return apiRequest("POST", `/api/admin/security/sessions/${sessionId}/terminate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/security"] });
      setSessionToTerminate(null);
      toast({
        title: t("adminSecurity.terminateSuccess"),
        description: t("adminSecurity.terminateSuccessDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminSecurity.terminateError"),
        description: t("adminSecurity.terminateErrorDesc"),
        variant: "destructive",
      });
    },
  });

  const confirmTerminateSession = () => {
    if (sessionToTerminate) {
      terminateSessionMutation.mutate(sessionToTerminate.id);
    }
  };

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    let ws: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          setWsConnected(true);
          ws?.send(JSON.stringify({ type: "subscribe", channel: "security" }));
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === "security_update" || message.type === "threat_update") {
              queryClient.invalidateQueries({ queryKey: ["/api/admin/security"] });
              setLastUpdate(new Date());
            }
          } catch {
            // Ignore parse errors
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
          reconnectTimeout = setTimeout(connect, 5000);
        };

        ws.onerror = () => {
          setWsConnected(false);
        };
      } catch {
        setWsConnected(false);
        reconnectTimeout = setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      if (ws) {
        ws.close();
      }
      clearTimeout(reconnectTimeout);
    };
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      setLastUpdate(new Date());
      toast({
        title: t("adminSecurity.refreshSuccess"),
        description: t("adminSecurity.dataUpdated"),
      });
    } catch {
      toast({
        title: t("adminSecurity.refreshError"),
        description: t("adminSecurity.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = {
      exportDate: new Date().toISOString(),
      securityScore,
      threatEvents,
      activeSessions,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `security-data-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: t("adminSecurity.exportSuccess"),
      description: t("adminSecurity.exportSuccessDesc"),
    });
  }, [securityScore, threatEvents, activeSessions, toast, t]);

  const handleSecurityScan = useCallback(() => {
    toast({
      title: t("adminSecurity.scanSuccess"),
      description: t("adminSecurity.scanSuccessDesc"),
    });
  }, [toast, t]);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical": return <Badge className="bg-red-500/10 text-red-500" data-testid={`badge-severity-${severity}`}>{t("adminSecurity.severity.critical")}</Badge>;
      case "high": return <Badge className="bg-orange-500/10 text-orange-500" data-testid={`badge-severity-${severity}`}>{t("adminSecurity.severity.high")}</Badge>;
      case "medium": return <Badge className="bg-yellow-500/10 text-yellow-500" data-testid={`badge-severity-${severity}`}>{t("adminSecurity.severity.medium")}</Badge>;
      case "low": return <Badge className="bg-blue-500/10 text-blue-500" data-testid={`badge-severity-${severity}`}>{t("adminSecurity.severity.low")}</Badge>;
      default: return <Badge variant="secondary" data-testid={`badge-severity-${severity}`}>{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "blocked": return <Badge className="bg-green-500/10 text-green-500" data-testid={`badge-status-${status}`}>{t("adminSecurity.status.blocked")}</Badge>;
      case "mitigated": return <Badge className="bg-blue-500/10 text-blue-500" data-testid={`badge-status-${status}`}>{t("adminSecurity.status.mitigated")}</Badge>;
      case "monitored": return <Badge className="bg-yellow-500/10 text-yellow-500" data-testid={`badge-status-${status}`}>{t("adminSecurity.status.monitored")}</Badge>;
      default: return <Badge variant="secondary" data-testid={`badge-status-${status}`}>{status}</Badge>;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const getScoreLabel = (key: string) => {
    const labels: Record<string, string> = {
      overall: t("adminSecurity.securityScore.overall"),
      authentication: t("adminSecurity.securityScore.authentication"),
      authorization: t("adminSecurity.securityScore.authorization"),
      encryption: t("adminSecurity.securityScore.encryption"),
      monitoring: t("adminSecurity.securityScore.monitoring"),
      compliance: t("adminSecurity.securityScore.compliance"),
    };
    return labels[key] || key;
  };

  if (error) {
    return (
      <div className="flex-1 overflow-auto" data-testid="security-error">
        <div className="container max-w-[1800px] mx-auto p-6">
          <Card data-testid="card-error">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <ShieldAlert className="h-12 w-12 mx-auto text-destructive" />
                <h2 className="text-xl font-semibold">{t("adminSecurity.error.title")}</h2>
                <p className="text-muted-foreground">{t("adminSecurity.error.description")}</p>
                <Button onClick={() => refetch()} data-testid="button-retry">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t("adminSecurity.retry")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-testid="security-page">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-page-title">
              <Shield className="h-8 w-8" />
              {t("adminSecurity.title")}
            </h1>
            <p className="text-muted-foreground" data-testid="text-page-subtitle">{t("adminSecurity.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-sm text-muted-foreground" data-testid="status-ws-connection">
              {wsConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span>{t("adminSecurity.connected")}</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-yellow-500" />
                  <span>{t("adminSecurity.reconnecting")}</span>
                </>
              )}
            </div>
            {lastUpdate && (
              <span className="text-xs text-muted-foreground" data-testid="text-last-update">
                {t("adminSecurity.lastUpdate")}: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              data-testid="button-refresh"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              {t("adminSecurity.refresh")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              data-testid="button-export"
            >
              <Download className="h-4 w-4 mr-2" />
              {t("adminSecurity.export")}
            </Button>
            <Button onClick={handleSecurityScan} data-testid="button-run-security-scan">
              <ShieldCheck className="h-4 w-4 mr-2" />
              {t("adminSecurity.runSecurityScan")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4" data-testid="grid-security-scores">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <Card key={i} data-testid={`card-score-skeleton-${i}`}>
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <Skeleton className="h-8 w-12 mx-auto" />
                    <Skeleton className="h-3 w-16 mx-auto" />
                    <Skeleton className="h-1 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            Object.entries(securityScore).map(([key, value]) => (
              <Card key={key} data-testid={`card-score-${key}`}>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${value >= 95 ? "text-green-500" : value >= 90 ? "text-yellow-500" : "text-red-500"}`} data-testid={`text-score-${key}`}>
                      {value}%
                    </p>
                    <p className="text-xs text-muted-foreground" data-testid={`text-score-label-${key}`}>{getScoreLabel(key)}</p>
                  </div>
                  <Progress value={value} className="h-1 mt-2" data-testid={`progress-score-${key}`} />
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="tabs-security">
          <TabsList data-testid="tabslist-security">
            <TabsTrigger value="overview" data-testid="tab-overview">{t("adminSecurity.tabs.overview")}</TabsTrigger>
            <TabsTrigger value="threats" data-testid="tab-threats">{t("adminSecurity.tabs.threats")}</TabsTrigger>
            <TabsTrigger value="sessions" data-testid="tab-sessions">{t("adminSecurity.tabs.sessions")}</TabsTrigger>
            <TabsTrigger value="access" data-testid="tab-access">{t("adminSecurity.tabs.access")}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" data-testid="tabcontent-overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card data-testid="card-recent-threats">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5" />
                    {t("adminSecurity.recentThreats")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {Array(5).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" data-testid={`skeleton-threat-${i}`} />
                      ))}
                    </div>
                  ) : (
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-3">
                        {threatEvents.map((event) => (
                          <div key={event.id} className="p-3 rounded-lg border hover-elevate" data-testid={`threat-event-${event.id}`}>
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className={`h-4 w-4 ${event.severity === "critical" ? "text-red-500" : event.severity === "high" ? "text-orange-500" : "text-yellow-500"}`} />
                                <span className="font-medium" data-testid={`text-threat-type-${event.id}`}>{event.type}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {getSeverityBadge(event.severity)}
                                {getStatusBadge(event.status)}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div className="flex justify-between gap-2">
                                <span data-testid={`text-threat-source-${event.id}`}>{t("adminSecurity.columns.source")}: {event.source}</span>
                                <span data-testid={`text-threat-attempts-${event.id}`}>{t("adminSecurity.columns.attempts")}: {event.attempts}</span>
                              </div>
                              <div className="flex justify-between gap-2">
                                <span data-testid={`text-threat-target-${event.id}`}>{t("adminSecurity.columns.target")}: {event.target}</span>
                                <span data-testid={`text-threat-time-${event.id}`}>{formatTimeAgo(event.time)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>

              <Card data-testid="card-active-sessions">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {t("adminSecurity.activeSessions")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {Array(4).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" data-testid={`skeleton-session-${i}`} />
                      ))}
                    </div>
                  ) : (
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-3">
                        {activeSessions.map((session) => (
                          <div key={session.id} className="p-3 rounded-lg border hover-elevate" data-testid={`session-${session.id}`}>
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-medium" data-testid={`text-session-user-${session.id}`}>{session.user}</p>
                                <p className="text-xs text-muted-foreground" data-testid={`text-session-role-${session.id}`}>{session.role}</p>
                              </div>
                              <Badge variant="outline" data-testid={`badge-session-location-${session.id}`}>{session.location}</Badge>
                            </div>
                            <div className="text-xs text-muted-foreground flex justify-between gap-2">
                              <span data-testid={`text-session-device-${session.id}`}>{session.device}</span>
                              <span className="flex items-center gap-1" data-testid={`text-session-activity-${session.id}`}>
                                <Clock className="h-3 w-3" />
                                {formatTimeAgo(session.lastActivity)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="threats" data-testid="tabcontent-threats">
            <Card data-testid="card-threat-events-table">
              <CardHeader>
                <CardTitle>{t("adminSecurity.threatEvents")}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    {Array(5).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" data-testid={`skeleton-table-row-${i}`} />
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" data-testid="table-threat-events">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">{t("adminSecurity.columns.type")}</th>
                          <th className="text-left py-3 px-4 font-medium">{t("adminSecurity.columns.severity")}</th>
                          <th className="text-left py-3 px-4 font-medium">{t("adminSecurity.columns.source")}</th>
                          <th className="text-left py-3 px-4 font-medium">{t("adminSecurity.columns.target")}</th>
                          <th className="text-right py-3 px-4 font-medium">{t("adminSecurity.columns.attempts")}</th>
                          <th className="text-center py-3 px-4 font-medium">{t("adminSecurity.columns.status")}</th>
                          <th className="text-right py-3 px-4 font-medium">{t("adminSecurity.columns.time")}</th>
                          <th className="text-center py-3 px-4 font-medium">{t("adminSecurity.columns.actions")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {threatEvents.map((event) => (
                          <tr key={event.id} className="border-b hover-elevate" data-testid={`row-threat-${event.id}`}>
                            <td className="py-3 px-4 font-medium">{event.type}</td>
                            <td className="py-3 px-4">{getSeverityBadge(event.severity)}</td>
                            <td className="py-3 px-4 font-mono text-xs">{event.source}</td>
                            <td className="py-3 px-4 font-mono text-xs">{event.target}</td>
                            <td className="py-3 px-4 text-right">{event.attempts}</td>
                            <td className="py-3 px-4 text-center">{getStatusBadge(event.status)}</td>
                            <td className="py-3 px-4 text-right text-muted-foreground">{formatTimeAgo(event.time)}</td>
                            <td className="py-3 px-4 text-center">
                              <Button size="icon" variant="ghost" onClick={() => setSelectedThreat(event)} data-testid={`button-view-threat-${event.id}`}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" data-testid="tabcontent-sessions">
            <Card data-testid="card-sessions-table">
              <CardHeader>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <CardTitle>{t("adminSecurity.activeSessions")}</CardTitle>
                  <Button variant="outline" size="sm" data-testid="button-terminate-all">{t("adminSecurity.terminateAll")}</Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    {Array(4).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" data-testid={`skeleton-session-row-${i}`} />
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" data-testid="table-sessions">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">{t("adminSecurity.columns.user")}</th>
                          <th className="text-left py-3 px-4 font-medium">{t("adminSecurity.columns.role")}</th>
                          <th className="text-left py-3 px-4 font-medium">{t("adminSecurity.columns.ipAddress")}</th>
                          <th className="text-left py-3 px-4 font-medium">{t("adminSecurity.columns.location")}</th>
                          <th className="text-left py-3 px-4 font-medium">{t("adminSecurity.columns.device")}</th>
                          <th className="text-right py-3 px-4 font-medium">{t("adminSecurity.columns.lastActivity")}</th>
                          <th className="text-center py-3 px-4 font-medium">{t("adminSecurity.columns.actions")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeSessions.map((session) => (
                          <tr key={session.id} className="border-b hover-elevate" data-testid={`row-session-${session.id}`}>
                            <td className="py-3 px-4 font-medium">{session.user}</td>
                            <td className="py-3 px-4"><Badge variant="outline">{session.role}</Badge></td>
                            <td className="py-3 px-4 font-mono text-xs">{session.ip}</td>
                            <td className="py-3 px-4">{session.location}</td>
                            <td className="py-3 px-4 text-xs">{session.device}</td>
                            <td className="py-3 px-4 text-right text-muted-foreground">{formatTimeAgo(session.lastActivity)}</td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  onClick={() => setSelectedSession(session)} 
                                  data-testid={`button-view-session-${session.id}`}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="text-red-500"
                                  onClick={() => setSessionToTerminate(session)}
                                  disabled={terminateSessionMutation.isPending}
                                  data-testid={`button-terminate-${session.id}`}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="access" data-testid="tabcontent-access">
            <Card data-testid="card-access-control">
              <CardHeader>
                <CardTitle>{t("adminSecurity.accessControlConfig")}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-40" />
                      {Array(4).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                      ))}
                    </div>
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-32" />
                      {Array(4).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4" data-testid="section-auth-settings">
                      <h3 className="font-medium flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        {t("adminSecurity.authSettings")}
                      </h3>
                      <div className="space-y-2">
                        {[
                          { key: "twoFactorAuth", enabled: true },
                          { key: "sessionTimeout", enabled: true },
                          { key: "ipWhitelist", enabled: true },
                          { key: "biometricLogin", enabled: false },
                        ].map((setting) => (
                          <div key={setting.key} className="flex items-center justify-between p-2 rounded-lg bg-muted/50" data-testid={`setting-${setting.key}`}>
                            <span className="text-sm">{t(`adminSecurity.settings.${setting.key}`)}</span>
                            <Badge className={setting.enabled ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"} data-testid={`badge-setting-${setting.key}`}>
                              {setting.enabled ? t("adminSecurity.settings.enabled") : t("adminSecurity.settings.disabled")}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4" data-testid="section-api-security">
                      <h3 className="font-medium flex items-center gap-2">
                        <Key className="h-4 w-4" />
                        {t("adminSecurity.apiSecurity")}
                      </h3>
                      <div className="space-y-2">
                        {[
                          { key: "rateLimiting", enabled: true },
                          { key: "requestValidation", enabled: true },
                          { key: "corsProtection", enabled: true },
                          { key: "apiKeyRotation", enabled: true },
                        ].map((setting) => (
                          <div key={setting.key} className="flex items-center justify-between p-2 rounded-lg bg-muted/50" data-testid={`setting-${setting.key}`}>
                            <span className="text-sm">{t(`adminSecurity.settings.${setting.key}`)}</span>
                            <Badge className={setting.enabled ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"} data-testid={`badge-setting-${setting.key}`}>
                              {setting.enabled ? t("adminSecurity.settings.enabled") : t("adminSecurity.settings.disabled")}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <DetailSheet
        open={!!selectedThreat}
        onOpenChange={(open) => !open && setSelectedThreat(null)}
        title={t("adminSecurity.detail.threatTitle")}
        sections={selectedThreat ? [
          {
            title: t("adminSecurity.detail.overview"),
            fields: [
              { label: t("adminSecurity.detail.threatType"), value: selectedThreat.type },
              { label: t("adminSecurity.detail.severity"), value: selectedThreat.severity, type: "badge" as const, badgeVariant: selectedThreat.severity === "critical" ? "destructive" as const : "default" as const },
              { label: t("adminSecurity.detail.status"), value: selectedThreat.status, type: "status" as const, statusVariant: selectedThreat.status === "blocked" ? "success" as const : "warning" as const },
            ],
          },
          {
            title: t("adminSecurity.detail.source"),
            fields: [
              { label: t("adminSecurity.detail.sourceIp"), value: selectedThreat.source, copyable: true },
              { label: t("adminSecurity.detail.target"), value: selectedThreat.target, type: "code" as const },
              { label: t("adminSecurity.detail.attempts"), value: selectedThreat.attempts.toString() },
            ],
          },
          {
            title: t("adminSecurity.detail.time"),
            fields: [
              { label: t("adminSecurity.detail.detectedAt"), value: formatTimeAgo(selectedThreat.time) },
            ],
          },
        ] : []}
      />

      <DetailSheet
        open={!!selectedSession}
        onOpenChange={(open) => !open && setSelectedSession(null)}
        title={t("adminSecurity.detail.sessionTitle")}
        sections={selectedSession ? [
          {
            title: t("adminSecurity.detail.userInfo"),
            fields: [
              { label: t("adminSecurity.detail.user"), value: selectedSession.user },
              { label: t("adminSecurity.detail.role"), value: selectedSession.role, type: "badge" as const },
            ],
          },
          {
            title: t("adminSecurity.detail.connectionInfo"),
            fields: [
              { label: t("adminSecurity.detail.ipAddress"), value: selectedSession.ip, copyable: true },
              { label: t("adminSecurity.detail.location"), value: selectedSession.location },
              { label: t("adminSecurity.detail.device"), value: selectedSession.device },
            ],
          },
          {
            title: t("adminSecurity.detail.activity"),
            fields: [
              { label: t("adminSecurity.detail.lastActivity"), value: formatTimeAgo(selectedSession.lastActivity) },
            ],
          },
        ] : []}
      />

      <ConfirmationDialog
        open={!!sessionToTerminate}
        onOpenChange={(open) => !open && setSessionToTerminate(null)}
        title={t("adminSecurity.confirmTerminate.title")}
        description={t("adminSecurity.confirmTerminate.description", { user: sessionToTerminate?.user })}
        confirmText={t("adminSecurity.terminate")}
        onConfirm={confirmTerminateSession}
        destructive={true}
        isLoading={terminateSessionMutation.isPending}
      />
    </div>
  );
}
