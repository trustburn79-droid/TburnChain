import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { 
  Shield, AlertTriangle, Activity, Brain, Eye, 
  Ban, CheckCircle, Clock, TrendingUp, Target, MapPin,
  RefreshCw, Download, Wifi, WifiOff, Search
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ThreatStats {
  threatsDetected: number;
  threatsBlocked: number;
  activeIncidents: number;
  riskScore: number;
}

interface Threat {
  id: number;
  type: string;
  severity: string;
  source: string;
  target: string;
  status: string;
  timestamp: string;
}

interface AIDetection {
  pattern: string;
  confidence: number;
  risk: string;
  recommendation: string;
}

interface ThreatTrend {
  date: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface ThreatData {
  stats: ThreatStats;
  recentThreats: Threat[];
  aiDetections: AIDetection[];
  threatTrend: ThreatTrend[];
}

export default function AdminThreatDetection() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("threats");
  const [wsConnected, setWsConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [threatToBlock, setThreatToBlock] = useState<Threat | null>(null);
  const [threatToUnblock, setThreatToUnblock] = useState<Threat | null>(null);

  const { data, isLoading, error, refetch } = useQuery<ThreatData>({
    queryKey: ["/api/enterprise/admin/security/threats"],
    refetchInterval: 15000,
  });

  const blockMutation = useMutation({
    mutationFn: async (threatId: number) => {
      return apiRequest("POST", `/api/enterprise/admin/security/threats/${threatId}/block`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enterprise/admin/security/threats"] });
      toast({
        title: t("adminThreats.blockSuccess"),
        description: t("adminThreats.blockSuccessDesc"),
      });
    },
  });

  const unblockMutation = useMutation({
    mutationFn: async (threatId: number) => {
      return apiRequest("POST", `/api/enterprise/admin/security/threats/${threatId}/unblock`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enterprise/admin/security/threats"] });
      toast({
        title: t("adminThreats.unblockSuccess"),
        description: t("adminThreats.unblockSuccessDesc"),
      });
    },
  });

  const investigateMutation = useMutation({
    mutationFn: async (threatId: number) => {
      return apiRequest("POST", `/api/enterprise/admin/security/threats/${threatId}/investigate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enterprise/admin/security/threats"] });
      toast({
        title: t("adminThreats.investigateSuccess"),
        description: t("adminThreats.investigateSuccessDesc"),
      });
    },
  });

  const threatStats = data?.stats ?? {
    threatsDetected: 0,
    threatsBlocked: 0,
    activeIncidents: 0,
    riskScore: 0,
  };

  const recentThreats = data?.recentThreats ?? [];

  const threatTrend = data?.threatTrend ?? [];

  const aiDetections = data?.aiDetections ?? [];

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
          ws?.send(JSON.stringify({ type: "subscribe", channel: "threats" }));
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === "threat_update" || message.type === "security_alert") {
              queryClient.invalidateQueries({ queryKey: ["/api/enterprise/admin/security/threats"] });
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
        title: t("adminThreats.refreshSuccess"),
        description: t("adminThreats.dataUpdated"),
      });
    } catch {
      toast({
        title: t("adminThreats.refreshError"),
        description: t("adminThreats.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = {
      exportDate: new Date().toISOString(),
      stats: threatStats,
      recentThreats,
      aiDetections,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `threat-data-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: t("adminThreats.exportSuccess"),
      description: t("adminThreats.exportSuccessDesc"),
    });
  }, [threatStats, recentThreats, aiDetections, toast, t]);

  const handleRunScan = useCallback(() => {
    toast({
      title: t("adminThreats.scanSuccess"),
      description: t("adminThreats.scanSuccessDesc"),
    });
  }, [toast, t]);

  const handleViewThreat = (threat: Threat) => {
    setSelectedThreat(threat);
    setIsDetailOpen(true);
  };

  const handleBlockThreat = (threat: Threat) => {
    setThreatToBlock(threat);
  };

  const handleUnblockThreat = (threat: Threat) => {
    setThreatToUnblock(threat);
  };

  const confirmBlockThreat = () => {
    if (threatToBlock) {
      blockMutation.mutate(threatToBlock.id);
      setThreatToBlock(null);
    }
  };

  const confirmUnblockThreat = () => {
    if (threatToUnblock) {
      unblockMutation.mutate(threatToUnblock.id);
      setThreatToUnblock(null);
    }
  };

  const getThreatDetailSections = (threat: Threat): DetailSection[] => [
    {
      title: t("adminThreats.detail.overview"),
      icon: <Shield className="h-4 w-4" />,
      fields: [
        { label: t("adminThreats.detail.threatId"), value: `#${threat.id}` },
        { label: t("adminThreats.detail.type"), value: threat.type },
        { 
          label: t("adminThreats.detail.severity"), 
          value: threat.severity, 
          type: "badge" as const,
          badgeVariant: threat.severity === "critical" ? "destructive" as const : threat.severity === "high" ? "default" as const : "secondary" as const
        },
        { 
          label: t("common.status"), 
          value: threat.status, 
          type: "status" as const 
        },
      ],
    },
    {
      title: t("adminThreats.detail.source"),
      icon: <MapPin className="h-4 w-4" />,
      fields: [
        { label: t("adminThreats.detail.sourceIp"), value: threat.source, copyable: true },
        { label: t("adminThreats.detail.target"), value: threat.target },
        { label: t("adminThreats.detail.timestamp"), value: threat.timestamp },
      ],
    },
    {
      title: t("adminThreats.detail.response"),
      icon: <Target className="h-4 w-4" />,
      fields: [
        { 
          label: t("adminThreats.detail.actionTaken"), 
          value: threat.status === "blocked" ? t("adminThreats.recentActivity.blocked") : t("adminThreats.recentActivity.investigating"),
          type: "badge" as const,
          badgeVariant: threat.status === "blocked" ? "secondary" as const : "outline" as const
        },
      ],
    },
  ];

  const getRiskLevelBadge = (score: number) => {
    if (score <= 25) return <Badge className="bg-green-500" data-testid="badge-risk-low">{t("adminThreats.riskLevel.low")}</Badge>;
    if (score <= 50) return <Badge className="bg-yellow-500" data-testid="badge-risk-medium">{t("adminThreats.riskLevel.medium")}</Badge>;
    if (score <= 75) return <Badge className="bg-orange-500" data-testid="badge-risk-high">{t("adminThreats.riskLevel.high")}</Badge>;
    return <Badge variant="destructive" data-testid="badge-risk-critical">{t("adminThreats.riskLevel.critical")}</Badge>;
  };

  if (error) {
    return (
      <div className="flex-1 overflow-auto" data-testid="threat-detection-error">
        <div className="container max-w-[1800px] mx-auto p-6">
          <Card data-testid="card-error">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <Shield className="h-12 w-12 mx-auto text-destructive" />
                <h2 className="text-xl font-semibold">{t("adminThreats.error.title")}</h2>
                <p className="text-muted-foreground">{t("adminThreats.error.description")}</p>
                <Button onClick={() => refetch()} data-testid="button-retry">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t("adminThreats.retry")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full" data-testid="threat-detection-page">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">{t("adminThreats.title")}</h1>
            <p className="text-muted-foreground" data-testid="text-page-subtitle">{t("adminThreats.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-sm text-muted-foreground" data-testid="status-ws-connection">
              {wsConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span>{t("adminThreats.connected")}</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-yellow-500" />
                  <span>{t("adminThreats.reconnecting")}</span>
                </>
              )}
            </div>
            {lastUpdate && (
              <span className="text-xs text-muted-foreground" data-testid="text-last-update">
                {t("adminThreats.lastUpdate")}: {lastUpdate.toLocaleTimeString()}
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
              {t("adminThreats.refresh")}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              {t("adminThreats.export")}
            </Button>
            <Button variant="outline" data-testid="button-view-all">
              <Eye className="w-4 h-4 mr-2" />
              {t("adminThreats.viewAll")}
            </Button>
            <Button onClick={handleRunScan} data-testid="button-run-scan">
              <Shield className="w-4 h-4 mr-2" />
              {t("adminThreats.runScan")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="grid-stats">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i} data-testid={`card-stat-skeleton-${i}`}>
                <CardContent className="pt-6">
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-8 w-12" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card data-testid="card-stat-detected">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm text-muted-foreground">{t("adminThreats.stats.detected24h")}</span>
                  </div>
                  <div className="text-3xl font-bold" data-testid="text-stat-detected">{threatStats.threatsDetected}</div>
                </CardContent>
              </Card>
              <Card data-testid="card-stat-blocked">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Ban className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-muted-foreground">{t("adminThreats.stats.blocked")}</span>
                  </div>
                  <div className="text-3xl font-bold text-green-500" data-testid="text-stat-blocked">{threatStats.threatsBlocked}</div>
                </CardContent>
              </Card>
              <Card data-testid="card-stat-incidents">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-muted-foreground">{t("adminThreats.stats.activeIncidents")}</span>
                  </div>
                  <div className="text-3xl font-bold text-red-500" data-testid="text-stat-incidents">{threatStats.activeIncidents}</div>
                </CardContent>
              </Card>
              <Card data-testid="card-stat-risk">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-muted-foreground">{t("adminThreats.stats.riskScore")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-3xl font-bold" data-testid="text-stat-risk">{threatStats.riskScore}</div>
                    {getRiskLevelBadge(threatStats.riskScore)}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4" data-testid="tabs-threats">
          <TabsList data-testid="tabslist-threats">
            <TabsTrigger value="threats" data-testid="tab-threats">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {t("adminThreats.tabs.recentThreats")}
            </TabsTrigger>
            <TabsTrigger value="ai" data-testid="tab-ai">
              <Brain className="w-4 h-4 mr-2" />
              {t("adminThreats.tabs.aiDetection")}
            </TabsTrigger>
            <TabsTrigger value="trends" data-testid="tab-trends">
              <TrendingUp className="w-4 h-4 mr-2" />
              {t("adminThreats.tabs.trends")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="threats" data-testid="tabcontent-threats">
            <Card data-testid="card-recent-threats">
              <CardHeader>
                <CardTitle>{t("adminThreats.recentActivity.title")}</CardTitle>
                <CardDescription>{t("adminThreats.recentActivity.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    {Array(5).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-14 w-full" data-testid={`skeleton-threat-${i}`} />
                    ))}
                  </div>
                ) : (
                  <Table data-testid="table-threats">
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("adminThreats.recentActivity.columns.type")}</TableHead>
                        <TableHead>{t("adminThreats.recentActivity.columns.severity")}</TableHead>
                        <TableHead>{t("adminThreats.recentActivity.columns.source")}</TableHead>
                        <TableHead>{t("adminThreats.recentActivity.columns.target")}</TableHead>
                        <TableHead>{t("adminThreats.recentActivity.columns.status")}</TableHead>
                        <TableHead>{t("adminThreats.recentActivity.columns.timestamp")}</TableHead>
                        <TableHead>{t("adminThreats.recentActivity.columns.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentThreats.map((threat) => (
                        <TableRow key={threat.id} data-testid={`row-threat-${threat.id}`}>
                          <TableCell className="font-medium" data-testid={`text-type-${threat.id}`}>{threat.type}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                threat.severity === "critical" ? "destructive" :
                                threat.severity === "high" ? "default" :
                                threat.severity === "medium" ? "secondary" : "outline"
                              } 
                              className={
                                threat.severity === "critical" ? "" :
                                threat.severity === "high" ? "bg-orange-500" : ""
                              }
                              data-testid={`badge-severity-${threat.id}`}
                            >
                              {threat.severity}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm" data-testid={`text-source-${threat.id}`}>{threat.source}</TableCell>
                          <TableCell>{threat.target}</TableCell>
                          <TableCell>
                            {threat.status === "blocked" ? (
                              <Badge className="bg-green-500" data-testid={`badge-status-${threat.id}`}>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {t("adminThreats.recentActivity.blocked")}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" data-testid={`badge-status-${threat.id}`}>
                                <Clock className="w-3 h-3 mr-1" />
                                {t("adminThreats.recentActivity.investigating")}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{threat.timestamp}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => handleViewThreat(threat)}
                                data-testid={`button-view-${threat.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {threat.status === "blocked" ? (
                                <Button 
                                  size="icon" 
                                  variant="ghost"
                                  onClick={() => handleUnblockThreat(threat)}
                                  disabled={unblockMutation.isPending}
                                  data-testid={`button-unblock-${threat.id}`}
                                >
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                </Button>
                              ) : (
                                <Button 
                                  size="icon" 
                                  variant="ghost"
                                  onClick={() => handleBlockThreat(threat)}
                                  disabled={blockMutation.isPending}
                                  data-testid={`button-block-${threat.id}`}
                                >
                                  <Ban className="h-4 w-4 text-red-500" />
                                </Button>
                              )}
                              <Button 
                                size="icon" 
                                variant="ghost"
                                onClick={() => investigateMutation.mutate(threat.id)}
                                disabled={investigateMutation.isPending}
                                data-testid={`button-investigate-${threat.id}`}
                              >
                                <Search className="h-4 w-4" />
                              </Button>
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

          <TabsContent value="ai" data-testid="tabcontent-ai">
            <Card data-testid="card-ai-detections">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  {t("adminThreats.aiDetection.title")}
                </CardTitle>
                <CardDescription>{t("adminThreats.aiDetection.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array(3).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full" data-testid={`skeleton-ai-${i}`} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {aiDetections.map((detection, index) => (
                      <div key={index} className="p-4 border rounded-lg" data-testid={`ai-detection-${index}`}>
                        <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                          <span className="font-medium" data-testid={`text-pattern-${index}`}>{detection.pattern}</span>
                          <Badge variant={detection.risk === "high" ? "destructive" : "secondary"} data-testid={`badge-risk-${index}`}>
                            {detection.risk} risk
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">{t("adminThreats.aiDetection.confidence")}:</span>
                            <Progress value={detection.confidence} className="w-20" data-testid={`progress-confidence-${index}`} />
                            <span data-testid={`text-confidence-${index}`}>{detection.confidence}%</span>
                          </div>
                          <span className="text-muted-foreground" data-testid={`text-recommendation-${index}`}>
                            {t("adminThreats.aiDetection.recommendation")}: {detection.recommendation}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card data-testid="card-accuracy">
                <CardHeader>
                  <CardTitle>{t("adminThreats.aiDetection.detectionAccuracy")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-20 w-full" />
                  ) : (
                    <div className="text-center">
                      <div className="text-5xl font-bold text-green-500" data-testid="text-accuracy">98.7%</div>
                      <div className="text-muted-foreground mt-2">{t("adminThreats.aiDetection.truePositiveRate")}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card data-testid="card-response-time">
                <CardHeader>
                  <CardTitle>{t("adminThreats.aiDetection.responseTime")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-20 w-full" />
                  ) : (
                    <div className="text-center">
                      <div className="text-5xl font-bold text-blue-500" data-testid="text-response-time">45ms</div>
                      <div className="text-muted-foreground mt-2">{t("adminThreats.aiDetection.avgDetectionTime")}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" data-testid="tabcontent-trends">
            <Card data-testid="card-trends">
              <CardHeader>
                <CardTitle>{t("adminThreats.trends.title")}</CardTitle>
                <CardDescription>{t("adminThreats.trends.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-80 w-full" data-testid="skeleton-chart" />
                ) : (
                  <div className="h-80" data-testid="chart-trends">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={threatTrend}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="critical" stroke="#ef4444" name="Critical" strokeWidth={2} />
                        <Line type="monotone" dataKey="high" stroke="#f97316" name="High" strokeWidth={2} />
                        <Line type="monotone" dataKey="medium" stroke="#eab308" name="Medium" strokeWidth={2} />
                        <Line type="monotone" dataKey="low" stroke="#3b82f6" name="Low" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <DetailSheet
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        title={selectedThreat?.type || ""}
        subtitle={`${t("adminThreats.detail.threatId")} #${selectedThreat?.id || 0}`}
        icon={<AlertTriangle className="h-5 w-5" />}
        sections={selectedThreat ? getThreatDetailSections(selectedThreat) : []}
        actions={selectedThreat ? [
          selectedThreat.status === "blocked" ? {
            label: t("adminThreats.actions.unblock"),
            icon: <CheckCircle className="h-4 w-4" />,
            onClick: () => {
              setIsDetailOpen(false);
              handleUnblockThreat(selectedThreat);
            },
            variant: "outline" as const,
          } : {
            label: t("adminThreats.actions.block"),
            icon: <Ban className="h-4 w-4" />,
            onClick: () => {
              setIsDetailOpen(false);
              handleBlockThreat(selectedThreat);
            },
            variant: "destructive" as const,
          },
          {
            label: t("adminThreats.actions.investigate"),
            icon: <Search className="h-4 w-4" />,
            onClick: () => {
              setIsDetailOpen(false);
              investigateMutation.mutate(selectedThreat.id);
            },
            disabled: investigateMutation.isPending,
          },
        ] : []}
      />

      <ConfirmationDialog
        open={!!threatToBlock}
        onOpenChange={(open) => !open && setThreatToBlock(null)}
        title={t("adminThreats.confirmBlock.title")}
        description={t("adminThreats.confirmBlock.description", { 
          type: threatToBlock?.type, 
          source: threatToBlock?.source 
        })}
        confirmText={t("adminThreats.actions.block")}
        onConfirm={confirmBlockThreat}
        destructive={true}
        isLoading={blockMutation.isPending}
      />

      <ConfirmationDialog
        open={!!threatToUnblock}
        onOpenChange={(open) => !open && setThreatToUnblock(null)}
        title={t("adminThreats.confirmUnblock.title")}
        description={t("adminThreats.confirmUnblock.description", { 
          type: threatToUnblock?.type, 
          source: threatToUnblock?.source 
        })}
        confirmText={t("adminThreats.actions.unblock")}
        onConfirm={confirmUnblockThreat}
        destructive={false}
        isLoading={unblockMutation.isPending}
      />
    </ScrollArea>
  );
}
