import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, Cpu, Zap, Activity, Clock, CheckCircle, 
  AlertTriangle, Settings, History, BarChart3, RefreshCw,
  Download, Wifi, WifiOff, AlertCircle
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AIModel {
  id: number;
  name: string;
  layer: string;
  status: string;
  latency: number;
  tokenRate: number;
  accuracy: number;
  requests24h: number;
  cost24h: number;
}

interface AIDecision {
  id: number;
  type: string;
  content: string;
  confidence: number;
  executed: boolean;
  timestamp: string;
}

interface PerformanceDataPoint {
  time: string;
  gpt5: number;
  claude: number;
  llama: number;
}

interface AIOrchestrationData {
  models: AIModel[];
  decisions: AIDecision[];
  performance: PerformanceDataPoint[];
  stats: {
    overallAccuracy: number;
    totalRequests24h: string;
    totalCost24h: number;
    uptime: number;
  };
}

const mockData: AIOrchestrationData = {
  models: [
    { 
      id: 1, 
      name: "GPT-5 Turbo", 
      layer: "Strategic", 
      status: "online", 
      latency: 450, 
      tokenRate: 150,
      accuracy: 98.7,
      requests24h: 12500,
      cost24h: 125.50
    },
    { 
      id: 2, 
      name: "Claude Sonnet 4.5", 
      layer: "Tactical", 
      status: "online", 
      latency: 180, 
      tokenRate: 2100,
      accuracy: 97.2,
      requests24h: 45000,
      cost24h: 89.25
    },
    { 
      id: 3, 
      name: "Llama 3.3 70B", 
      layer: "Operational", 
      status: "online", 
      latency: 45, 
      tokenRate: 890,
      accuracy: 95.8,
      requests24h: 180000,
      cost24h: 0
    },
  ],
  decisions: [
    { id: 1, type: "Strategic", content: "Increase validator committee to 120", confidence: 92, executed: true, timestamp: "2024-12-03 14:30" },
    { id: 2, type: "Tactical", content: "Rebalance shard 5 load to shard 8", confidence: 88, executed: true, timestamp: "2024-12-03 14:25" },
    { id: 3, type: "Operational", content: "Adjust gas price to 115 Ember", confidence: 95, executed: true, timestamp: "2024-12-03 14:20" },
    { id: 4, type: "Strategic", content: "Activate bridge circuit breaker", confidence: 65, executed: false, timestamp: "2024-12-03 14:15" },
  ],
  performance: [
    { time: "00:00", gpt5: 450, claude: 180, llama: 45 },
    { time: "04:00", gpt5: 460, claude: 175, llama: 48 },
    { time: "08:00", gpt5: 480, claude: 190, llama: 52 },
    { time: "12:00", gpt5: 445, claude: 185, llama: 44 },
    { time: "16:00", gpt5: 455, claude: 178, llama: 46 },
    { time: "20:00", gpt5: 448, claude: 182, llama: 47 },
  ],
  stats: {
    overallAccuracy: 98.2,
    totalRequests24h: "237.5k",
    totalCost24h: 214.75,
    uptime: 99.9
  }
};

export default function AdminAIOrchestration() {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [wsConnected, setWsConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [liveDecisions, setLiveDecisions] = useState<AIDecision[]>([]);

  const { data, isLoading, error, refetch } = useQuery<AIOrchestrationData>({
    queryKey: ["/api/admin/ai/models"],
    enabled: true,
    refetchInterval: 30000,
  });

  const aiData = data || mockData;
  const decisions = liveDecisions.length > 0 ? liveDecisions : aiData.decisions;

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      ws = new WebSocket(`${protocol}//${window.location.host}/ws/ai-orchestration`);

      ws.onopen = () => {
        setWsConnected(true);
        setLastUpdate(new Date());
      };

      ws.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);
          if (update.type === 'decision') {
            setLiveDecisions(prev => [update.data, ...prev.slice(0, 9)]);
            setLastUpdate(new Date());
          }
        } catch (e) {
          console.error('WebSocket message parse error:', e);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        reconnectTimeout = setTimeout(connect, 5000);
      };

      ws.onerror = () => {
        setWsConnected(false);
      };
    };

    connect();

    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimeout);
    };
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      setLastUpdate(new Date());
      toast({
        title: t("adminAI.refreshSuccess"),
        description: t("adminAI.refreshSuccessDesc"),
      });
    } catch {
      toast({
        title: t("adminAI.error.title"),
        description: t("adminAI.error.description"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = {
      exportDate: new Date().toISOString(),
      models: aiData.models,
      decisions,
      performance: aiData.performance,
      stats: aiData.stats
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-orchestration-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: t("adminAI.exportSuccess"),
      description: t("adminAI.exportSuccessDesc"),
    });
  }, [aiData, decisions, toast, t]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8" data-testid="error-container">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2" data-testid="text-error-title">{t("adminAI.error.title")}</h2>
        <p className="text-muted-foreground mb-4" data-testid="text-error-description">{t("adminAI.error.description")}</p>
        <Button onClick={() => refetch()} data-testid="button-retry">
          <RefreshCw className="w-4 h-4 mr-2" />
          {t("adminAI.retry")}
        </Button>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full" data-testid="scroll-area-ai-orchestration">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">{t("adminAI.title")}</h1>
            <p className="text-muted-foreground" data-testid="text-page-subtitle">{t("adminAI.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="status-connection">
              {wsConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-green-500">{t("adminAI.connected")}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-yellow-500" />
                  <span className="text-yellow-500">{t("adminAI.reconnecting")}</span>
                </>
              )}
            </div>
            {lastUpdate && (
              <span className="text-sm text-muted-foreground" data-testid="text-last-update">
                {t("adminAI.lastUpdate")}: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              data-testid="button-refresh"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? t("adminAI.refreshing") : t("adminAI.refresh")}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExport}
              data-testid="button-export"
            >
              <Download className="w-4 h-4 mr-2" />
              {t("adminAI.export")}
            </Button>
            <Button data-testid="button-configure">
              <Settings className="w-4 h-4 mr-2" />
              {t("adminAI.configure")}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="skeleton-models">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24 mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="grid-models">
            {aiData.models.map((model) => (
              <Card 
                key={model.id} 
                className={
                  model.layer === "Strategic" ? "border-blue-500/30 bg-blue-500/5" :
                  model.layer === "Tactical" ? "border-purple-500/30 bg-purple-500/5" :
                  "border-green-500/30 bg-green-500/5"
                }
                data-testid={`card-model-${model.id}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Brain className={
                        model.layer === "Strategic" ? "text-blue-500" :
                        model.layer === "Tactical" ? "text-purple-500" :
                        "text-green-500"
                      } />
                      <span data-testid={`text-model-name-${model.id}`}>{model.name}</span>
                    </CardTitle>
                    <Badge 
                      variant="outline" 
                      className="bg-green-500/10 text-green-500 border-green-500/30"
                      data-testid={`badge-model-status-${model.id}`}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {model.status}
                    </Badge>
                  </div>
                  <CardDescription data-testid={`text-model-layer-${model.id}`}>
                    {model.layer} {t("adminAI.layer")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">{t("adminAI.latency")}</span>
                      <p className="font-medium" data-testid={`text-model-latency-${model.id}`}>{model.latency}ms</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t("adminAI.tokenRate")}</span>
                      <p className="font-medium" data-testid={`text-model-token-rate-${model.id}`}>{model.tokenRate}/sec</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t("adminAI.accuracy")}</span>
                      <p className="font-medium" data-testid={`text-model-accuracy-${model.id}`}>{model.accuracy}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t("adminAI.requests24h")}</span>
                      <p className="font-medium" data-testid={`text-model-requests-${model.id}`}>{model.requests24h.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t("adminAI.cost24h")}</span>
                      <span className="font-medium" data-testid={`text-model-cost-${model.id}`}>${model.cost24h.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card data-testid="card-decision-hierarchy">
          <CardHeader>
            <CardTitle data-testid="text-decision-hierarchy-title">{t("adminAI.decisionHierarchy")}</CardTitle>
            <CardDescription data-testid="text-decision-hierarchy-desc">{t("adminAI.decisionHierarchyDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg flex-wrap gap-4" data-testid="hierarchy-flow">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-blue-500/20">
                    <Brain className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium" data-testid="text-strategic-label">{t("adminAI.strategic")} (GPT-5)</p>
                    <p className="text-sm text-muted-foreground">{t("adminAI.every6Hours")} • 50% {t("adminAI.weight")}</p>
                  </div>
                </div>
                <div className="text-2xl hidden md:block">→</div>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-purple-500/20">
                    <Brain className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium" data-testid="text-tactical-label">{t("adminAI.tactical")} (Claude)</p>
                    <p className="text-sm text-muted-foreground">{t("adminAI.everyBlock")} • 30% {t("adminAI.weight")}</p>
                  </div>
                </div>
                <div className="text-2xl hidden md:block">→</div>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-green-500/20">
                    <Brain className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium" data-testid="text-operational-label">{t("adminAI.operational")} (Llama)</p>
                    <p className="text-sm text-muted-foreground">{t("adminAI.immediate")} • 20% {t("adminAI.weight")}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="decisions" className="space-y-4" data-testid="tabs-ai-orchestration">
          <TabsList data-testid="tabs-list">
            <TabsTrigger value="decisions" data-testid="tab-decisions">
              <Zap className="w-4 h-4 mr-2" />
              {t("adminAI.decisions")}
            </TabsTrigger>
            <TabsTrigger value="performance" data-testid="tab-performance">
              <Activity className="w-4 h-4 mr-2" />
              {t("adminAI.performance")}
            </TabsTrigger>
            <TabsTrigger value="config" data-testid="tab-config">
              <Settings className="w-4 h-4 mr-2" />
              {t("adminAI.configuration")}
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">
              <History className="w-4 h-4 mr-2" />
              {t("adminAI.history")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="decisions" data-testid="tab-content-decisions">
            <Card data-testid="card-recent-decisions">
              <CardHeader>
                <CardTitle data-testid="text-recent-decisions-title">{t("adminAI.recentAIDecisions")}</CardTitle>
                <CardDescription data-testid="text-recent-decisions-desc">{t("adminAI.recentDecisionsDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3" data-testid="skeleton-decisions">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table data-testid="table-decisions">
                    <TableHeader>
                      <TableRow>
                        <TableHead data-testid="table-head-type">{t("adminAI.type")}</TableHead>
                        <TableHead data-testid="table-head-decision">{t("adminAI.decision")}</TableHead>
                        <TableHead data-testid="table-head-confidence">{t("adminAI.confidence")}</TableHead>
                        <TableHead data-testid="table-head-status">{t("adminAI.status")}</TableHead>
                        <TableHead data-testid="table-head-timestamp">{t("adminAI.timestamp")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {decisions.map((decision) => (
                        <TableRow key={decision.id} data-testid={`row-decision-${decision.id}`}>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={
                                decision.type === "Strategic" ? "bg-blue-500/10 text-blue-500" :
                                decision.type === "Tactical" ? "bg-purple-500/10 text-purple-500" :
                                "bg-green-500/10 text-green-500"
                              }
                              data-testid={`badge-decision-type-${decision.id}`}
                            >
                              {decision.type}
                            </Badge>
                          </TableCell>
                          <TableCell data-testid={`text-decision-content-${decision.id}`}>{decision.content}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={decision.confidence} className="w-16" data-testid={`progress-confidence-${decision.id}`} />
                              <span 
                                className={decision.confidence >= 70 ? "text-green-500" : "text-yellow-500"}
                                data-testid={`text-confidence-${decision.id}`}
                              >
                                {decision.confidence}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {decision.executed ? (
                              <Badge className="bg-green-500" data-testid={`badge-status-executed-${decision.id}`}>
                                {t("adminAI.executed")}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-yellow-500" data-testid={`badge-status-pending-${decision.id}`}>
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                {t("adminAI.pendingReview")}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground" data-testid={`text-timestamp-${decision.id}`}>
                            {decision.timestamp}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" data-testid="tab-content-performance">
            <Card data-testid="card-latency-comparison">
              <CardHeader>
                <CardTitle data-testid="text-latency-title">{t("adminAI.latencyComparison")}</CardTitle>
                <CardDescription data-testid="text-latency-desc">{t("adminAI.latencyComparisonDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-80 w-full" data-testid="skeleton-chart" />
                ) : (
                  <div className="h-80" data-testid="chart-latency">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={aiData.performance}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="gpt5" stroke="#3b82f6" name="GPT-5" strokeWidth={2} />
                        <Line type="monotone" dataKey="claude" stroke="#a855f7" name="Claude" strokeWidth={2} />
                        <Line type="monotone" dataKey="llama" stroke="#22c55e" name="Llama" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4" data-testid="grid-stats">
              {isLoading ? (
                [1, 2, 3, 4].map((i) => (
                  <Card key={i} data-testid={`skeleton-stat-${i}`}>
                    <CardContent className="pt-6 text-center">
                      <Skeleton className="h-8 w-20 mx-auto mb-2" />
                      <Skeleton className="h-4 w-24 mx-auto" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                <>
                  <Card data-testid="card-stat-accuracy">
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold" data-testid="text-stat-accuracy">{aiData.stats.overallAccuracy}%</div>
                      <div className="text-sm text-muted-foreground">{t("adminAI.overallAccuracy")}</div>
                    </CardContent>
                  </Card>
                  <Card data-testid="card-stat-requests">
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold" data-testid="text-stat-requests">{aiData.stats.totalRequests24h}</div>
                      <div className="text-sm text-muted-foreground">{t("adminAI.totalRequests24h")}</div>
                    </CardContent>
                  </Card>
                  <Card data-testid="card-stat-cost">
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold" data-testid="text-stat-cost">${aiData.stats.totalCost24h}</div>
                      <div className="text-sm text-muted-foreground">{t("adminAI.totalCost24h")}</div>
                    </CardContent>
                  </Card>
                  <Card data-testid="card-stat-uptime">
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold" data-testid="text-stat-uptime">{aiData.stats.uptime}%</div>
                      <div className="text-sm text-muted-foreground">{t("adminAI.uptime")}</div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="config" data-testid="tab-content-config">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card data-testid="card-model-settings">
                <CardHeader>
                  <CardTitle data-testid="text-model-settings-title">{t("adminAI.modelSettings")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    [1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" data-testid={`skeleton-model-setting-${i}`} />
                    ))
                  ) : (
                    aiData.models.map((model) => (
                      <div 
                        key={model.id} 
                        className="flex items-center justify-between p-3 border rounded-lg"
                        data-testid={`setting-model-${model.id}`}
                      >
                        <div>
                          <p className="font-medium" data-testid={`text-setting-model-name-${model.id}`}>{model.name}</p>
                          <p className="text-sm text-muted-foreground">{model.layer} {t("adminAI.layer")}</p>
                        </div>
                        <Switch defaultChecked data-testid={`switch-model-${model.id}`} />
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card data-testid="card-confidence-thresholds">
                <CardHeader>
                  <CardTitle data-testid="text-confidence-thresholds-title">{t("adminAI.confidenceThresholds")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    [1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" data-testid={`skeleton-threshold-${i}`} />
                    ))
                  ) : (
                    <>
                      <div className="flex items-center justify-between p-3 border rounded-lg" data-testid="setting-auto-execute">
                        <div>
                          <p className="font-medium" data-testid="text-auto-execute-label">{t("adminAI.autoExecuteThreshold")}</p>
                          <p className="text-sm text-muted-foreground">{t("adminAI.autoExecuteDesc")}</p>
                        </div>
                        <Badge data-testid="badge-auto-execute-value">70%</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg" data-testid="setting-human-review">
                        <div>
                          <p className="font-medium" data-testid="text-human-review-label">{t("adminAI.humanReviewThreshold")}</p>
                          <p className="text-sm text-muted-foreground">{t("adminAI.humanReviewDesc")}</p>
                        </div>
                        <Badge data-testid="badge-human-review-value">50%</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg" data-testid="setting-rejection">
                        <div>
                          <p className="font-medium" data-testid="text-rejection-label">{t("adminAI.rejectionThreshold")}</p>
                          <p className="text-sm text-muted-foreground">{t("adminAI.rejectionDesc")}</p>
                        </div>
                        <Badge data-testid="badge-rejection-value">30%</Badge>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" data-testid="tab-content-history">
            <Card data-testid="card-decision-history">
              <CardHeader>
                <CardTitle data-testid="text-decision-history-title">{t("adminAI.decisionHistory")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground" data-testid="history-placeholder">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p data-testid="text-history-desc">{t("adminAI.viewHistoryDesc")}</p>
                  <Button variant="outline" className="mt-4" data-testid="button-load-history">
                    {t("adminAI.loadHistory")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
