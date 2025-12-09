import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Brain, Cpu, Zap, Activity, Clock, CheckCircle, 
  AlertTriangle, Settings, History, BarChart3, RefreshCw,
  Download, Wifi, WifiOff, AlertCircle, Eye, RotateCcw,
  Shield, Server, Play, Pause, Terminal, Database,
  TrendingUp, Target, Layers, Network, FileCheck, Rocket
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

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
  gemini: number;
  claude: number;
  openai: number;
  grok: number;
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

interface EnterpriseHealthData {
  status: string;
  uptime: number;
  lastDecisionTime: string | null;
  components: {
    aiService: { status: string; latency: number };
    executor: { status: string; latency: number };
  };
  alerts: string[];
}

interface ProductionReadinessData {
  ready: boolean;
  phase1: { status: string; details: string[] };
  phase2: { status: string; details: string[] };
  phase3: { status: string; details: string[] };
  phase4: { status: string; details: string[] };
  phase5: { status: string; details: string[] };
  recommendations: string[];
}

interface ExecutorStatusData {
  isActive: boolean;
  executionCount: number;
  rollbackCount: number;
  lastExecutions: Record<string, unknown>;
  executionTypes: string[];
  confidenceThresholds: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

interface BandInfo {
  name: string;
  provider: string;
  model: string;
  temperature?: number;
  eventTypes?: string[];
  description: string;
  activationCondition?: string;
}

interface TripleBandData {
  strategic: BandInfo;
  tactical: BandInfo;
  operational: BandInfo;
  fallback: BandInfo;
  status: string;
  processedDecisions: number;
}

interface GovernanceStatsData {
  totalAnalyzed: number;
  autoApproved: number;
  manualReview: number;
  avgConfidence: number;
  confidenceThreshold: number;
  riskLevelDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  recentPrevalidations: Array<{
    id: number;
    proposalId: string;
    aiConfidence: number;
    riskLevel: string;
    automatedDecision: boolean;
    createdAt: string;
  }>;
}

interface ExecutionLog {
  id: number;
  decisionType: string;
  action: string;
  result: string;
  confidence: number;
  provider: string;
  model: string;
  executedAt: string;
  blockchainImpact: string;
}

const emptyFallback: AIOrchestrationData = {
  models: [],
  decisions: [],
  performance: [],
  stats: { overallAccuracy: 0, totalRequests24h: "0", totalCost24h: 0, uptime: 0 }
};

const RISK_COLORS = {
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#f97316",
  critical: "#ef4444",
};

export default function AdminAIOrchestration() {
  const { t } = useTranslation();
  const { toast } = useToast();

  const translateType = (type: string) => {
    const typeMap: Record<string, string> = {
      'Strategic': t("adminAI.strategic"),
      'Tactical': t("adminAI.tactical"),
      'Operational': t("adminAI.operational"),
      'Fallback': t("adminAI.fallback"),
    };
    return typeMap[type] || type;
  };

  const translateStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'online': t("adminAI.statusOnline"),
      'offline': t("adminAI.statusOffline"),
      'degraded': t("adminAI.statusDegraded"),
      'standby': t("adminAI.statusStandby"),
      'healthy': t("adminAI.statusOnline"),
      'active': t("adminAI.enterprise.statusActive"),
      'inactive': t("adminAI.enterprise.statusInactive"),
      'ready': t("adminAI.enterprise.statusReady"),
      'pending': t("adminAI.enterprise.statusPending"),
      'completed': t("adminAI.enterprise.statusCompleted"),
      'failed': t("adminAI.enterprise.statusFailed"),
      'executing': t("adminAI.enterprise.statusExecuting"),
      'enabled': t("adminAI.enterprise.enabled"),
      'disabled': t("adminAI.enterprise.disabled"),
    };
    return statusMap[status?.toLowerCase()] || status;
  };

  const translateExecutionType = (type: string) => {
    const typeMap: Record<string, string> = {
      'REBALANCE_SHARD_LOAD': t("adminAI.enterprise.typeRebalanceShardLoad"),
      'SCALE_SHARD_CAPACITY': t("adminAI.enterprise.typeScaleShardCapacity"),
      'OPTIMIZE_BLOCK_TIME': t("adminAI.enterprise.typeOptimizeBlockTime"),
      'OPTIMIZE_TPS': t("adminAI.enterprise.typeOptimizeTps"),
      'RESCHEDULE_VALIDATORS': t("adminAI.enterprise.typeRescheduleValidators"),
      'GOVERNANCE_PREVALIDATION': t("adminAI.enterprise.typeGovernancePrevalidation"),
      'SECURITY_RESPONSE': t("adminAI.enterprise.typeSecurityResponse"),
      'CONSENSUS_OPTIMIZATION': t("adminAI.enterprise.typeConsensusOptimization"),
      'DYNAMIC_GAS_OPTIMIZATION': t("adminAI.enterprise.typeDynamicGasOptimization"),
      'PREDICTIVE_HEALING': t("adminAI.enterprise.typePredictiveHealing"),
    };
    return typeMap[type] || type?.replace(/_/g, ' ');
  };
  
  const [wsConnected, setWsConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [liveDecisions, setLiveDecisions] = useState<AIDecision[]>([]);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [modelToSync, setModelToSync] = useState<AIModel | null>(null);
  const [activeTab, setActiveTab] = useState("enterprise");

  const { data, isLoading, error, refetch } = useQuery<AIOrchestrationData>({
    queryKey: ["/api/admin/ai/models"],
    enabled: true,
    refetchInterval: 30000,
  });

  const { data: healthData, isLoading: healthLoading } = useQuery<{ success: boolean; data: EnterpriseHealthData }>({
    queryKey: ["/api/enterprise/ai/health"],
    refetchInterval: 10000,
  });

  const { data: readinessData, isLoading: readinessLoading } = useQuery<{ success: boolean; data: ProductionReadinessData }>({
    queryKey: ["/api/enterprise/ai/production-readiness"],
    refetchInterval: 30000,
  });

  const { data: executorData, isLoading: executorLoading } = useQuery<{ success: boolean; data: ExecutorStatusData }>({
    queryKey: ["/api/enterprise/ai/executor/status"],
    refetchInterval: 15000,
  });

  const { data: bandsData, isLoading: bandsLoading } = useQuery<{ success: boolean; data: TripleBandData }>({
    queryKey: ["/api/enterprise/ai/bands"],
    refetchInterval: 15000,
  });

  const { data: governanceData, isLoading: governanceLoading } = useQuery<{ success: boolean; data: GovernanceStatsData }>({
    queryKey: ["/api/enterprise/ai/governance/stats"],
    refetchInterval: 30000,
  });

  const { data: executionsData, isLoading: executionsLoading } = useQuery<{ success: boolean; data: ExecutionLog[]; count: number }>({
    queryKey: ["/api/enterprise/ai/executions"],
    refetchInterval: 15000,
  });

  const aiData = data && data.models?.length > 0 ? data : emptyFallback;
  const decisions = liveDecisions.length > 0 ? liveDecisions : aiData.decisions;

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;
    let reconnectAttempts = 0;

    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

      ws.onopen = () => {
        setWsConnected(true);
        setLastUpdate(new Date());
        reconnectAttempts = 0;
        ws?.send(JSON.stringify({ type: 'subscribe', channel: 'ai_orchestration' }));
        ws?.send(JSON.stringify({ type: 'subscribe', channel: 'ai_decisions' }));
      };

      ws.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);
          if (update.type === 'ai_orchestration_update') {
            setLastUpdate(new Date());
          } else if (update.type === 'decision' || update.type === 'ai_decisions_snapshot') {
            if (Array.isArray(update.data)) {
              setLiveDecisions(update.data.slice(0, 10));
            } else {
              setLiveDecisions(prev => [update.data, ...prev.slice(0, 9)]);
            }
            setLastUpdate(new Date());
          }
        } catch (e) {
          console.error('WebSocket message parse error:', e);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        reconnectAttempts++;
        reconnectTimeout = setTimeout(connect, delay);
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
      await Promise.all([
        refetch(),
        queryClient.invalidateQueries({ queryKey: ["/api/enterprise/ai/health"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/enterprise/ai/production-readiness"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/enterprise/ai/executor/status"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/enterprise/ai/bands"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/enterprise/ai/governance/stats"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/enterprise/ai/executions"] }),
      ]);
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
      stats: aiData.stats,
      enterprise: {
        health: healthData?.data,
        readiness: readinessData?.data,
        executor: executorData?.data,
        bands: bandsData?.data,
        governance: governanceData?.data,
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-orchestration-enterprise-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: t("adminAI.exportSuccess"),
      description: t("adminAI.exportSuccessDesc"),
    });
  }, [aiData, decisions, healthData, readinessData, executorData, bandsData, governanceData, toast, t]);

  const syncModelMutation = useMutation({
    mutationFn: async (modelId: number) => {
      return apiRequest('POST', `/api/admin/ai/models/${modelId}/sync`);
    },
    onSuccess: () => {
      toast({
        title: t("adminAI.syncSuccess"),
        description: t("adminAI.syncSuccessDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai/models"] });
      setSyncDialogOpen(false);
      setModelToSync(null);
    },
  });

  const handleViewModel = (model: AIModel) => {
    setSelectedModel(model);
    setDetailOpen(true);
  };

  const handleSyncModel = (model: AIModel) => {
    setModelToSync(model);
    setSyncDialogOpen(true);
  };

  const getModelDetailSections = (model: AIModel): DetailSection[] => [
    {
      title: t("adminAI.detail.overview"),
      fields: [
        { label: t("adminAI.detail.modelId"), value: model.id.toString(), copyable: true },
        { label: t("adminAI.detail.name"), value: model.name },
        { label: t("adminAI.detail.layer"), value: translateType(model.layer), type: "badge" as const },
        { label: t("adminAI.detail.status"), value: model.status === "online" ? "online" : model.status === "standby" ? "pending" : "offline", type: "status" as const },
      ]
    },
    {
      title: t("adminAI.detail.performance"),
      fields: [
        { label: t("adminAI.latency"), value: `${model.latency}ms` },
        { label: t("adminAI.tokenRate"), value: `${model.tokenRate}/sec` },
        { label: t("adminAI.accuracy"), value: model.accuracy, type: "progress" as const },
      ]
    },
    {
      title: t("adminAI.detail.usage"),
      fields: [
        { label: t("adminAI.requests24h"), value: (model.requests24h ?? 0).toLocaleString() },
        { label: t("adminAI.cost24h"), value: `$${model.cost24h.toFixed(2)}` },
      ]
    }
  ];

  const getPhaseStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-500';
      case 'validated': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskDistributionData = () => {
    if (!governanceData?.data?.riskLevelDistribution) return [];
    const dist = governanceData.data.riskLevelDistribution;
    return [
      { name: 'Low', value: dist.low, color: RISK_COLORS.low },
      { name: 'Medium', value: dist.medium, color: RISK_COLORS.medium },
      { name: 'High', value: dist.high, color: RISK_COLORS.high },
      { name: 'Critical', value: dist.critical, color: RISK_COLORS.critical },
    ].filter(d => d.value > 0);
  };

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
            <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-page-title">
              <Brain className="w-7 h-7 text-primary" />
              {t("adminAI.title")} - {t("adminAI.enterprise.tabEnterprise")}
            </h1>
            <p className="text-muted-foreground" data-testid="text-page-subtitle">
              {t("adminAI.subtitle")} | {t("adminAI.enterprise.pageSubtitle")}
            </p>
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

        {/* Enterprise Health Status Bar */}
        <Card className="border-primary/30 bg-primary/5" data-testid="card-enterprise-status">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${healthData?.data?.status === 'healthy' ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                  <Shield className={`w-6 h-6 ${healthData?.data?.status === 'healthy' ? 'text-green-500' : 'text-yellow-500'}`} />
                </div>
                <div>
                  <p className="font-medium text-lg" data-testid="text-system-status">
                    {t("adminAI.enterprise.systemStatus")}: {translateStatus(healthData?.data?.status || 'loading')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("adminAI.enterprise.uptimeLabel")}: {healthData?.data?.uptime?.toFixed(1) || '0'} {t("adminAI.enterprise.minutes")} | 
                    {t("adminAI.enterprise.processed")}: {bandsData?.data?.processedDecisions || 0} {t("adminAI.enterprise.decisionsLabel")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500" data-testid="text-ai-service-status">
                    {translateStatus(healthData?.data?.components?.aiService?.status || 'degraded')}
                  </p>
                  <p className="text-xs text-muted-foreground">{t("adminAI.enterprise.aiService")}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500" data-testid="text-executor-status">
                    {executorData?.data?.isActive ? translateStatus('active') : translateStatus('inactive')}
                  </p>
                  <p className="text-xs text-muted-foreground">{t("adminAI.enterprise.executor")}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-500" data-testid="text-execution-count">
                    {executorData?.data?.executionCount || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">{t("adminAI.enterprise.executions")}</p>
                </div>
                <Badge className={readinessData?.data?.ready ? 'bg-green-500' : 'bg-yellow-500'} data-testid="badge-production-ready">
                  <Rocket className="w-3 h-3 mr-1" />
                  {readinessData?.data?.ready ? t("adminAI.enterprise.productionReady") : t("adminAI.enterprise.preparing")}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4" data-testid="tabs-ai-orchestration">
          <TabsList data-testid="tabs-list">
            <TabsTrigger value="enterprise" data-testid="tab-enterprise">
              <Rocket className="w-4 h-4 mr-2" />
              {t("adminAI.enterprise.tabEnterprise")}
            </TabsTrigger>
            <TabsTrigger value="bands" data-testid="tab-bands">
              <Layers className="w-4 h-4 mr-2" />
              {t("adminAI.enterprise.tabBands")}
            </TabsTrigger>
            <TabsTrigger value="governance" data-testid="tab-governance">
              <FileCheck className="w-4 h-4 mr-2" />
              {t("adminAI.enterprise.tabGovernance")}
            </TabsTrigger>
            <TabsTrigger value="executions" data-testid="tab-executions">
              <Terminal className="w-4 h-4 mr-2" />
              {t("adminAI.enterprise.tabExecutions")}
            </TabsTrigger>
            <TabsTrigger value="models" data-testid="tab-models">
              <Brain className="w-4 h-4 mr-2" />
              {t("adminAI.enterprise.tabModels")}
            </TabsTrigger>
            <TabsTrigger value="performance" data-testid="tab-performance">
              <Activity className="w-4 h-4 mr-2" />
              {t("adminAI.performance")}
            </TabsTrigger>
          </TabsList>

          {/* Enterprise Control Tab */}
          <TabsContent value="enterprise" data-testid="tab-content-enterprise">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Production Readiness */}
              <Card data-testid="card-production-readiness">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="w-5 h-5" />
                    {t("adminAI.enterprise.productionReadiness")}
                  </CardTitle>
                  <CardDescription>{t("adminAI.enterprise.launchStatus")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {readinessLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                    </div>
                  ) : (
                    <>
                      {['phase1', 'phase2', 'phase3', 'phase4', 'phase5'].map((phase, index) => {
                        const phaseData = readinessData?.data?.[phase as keyof ProductionReadinessData] as { status: string; details: string[] } | undefined;
                        const phaseKeys = ['phase1', 'phase2', 'phase3', 'phase4', 'phase5'];
                        return (
                          <div key={phase} className="p-3 border rounded-lg" data-testid={`phase-${index + 1}`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{t(`adminAI.enterprise.${phaseKeys[index]}`)}</span>
                              <Badge className={getPhaseStatusColor(phaseData?.status || 'pending')}>
                                {translateStatus(phaseData?.status || 'pending')}
                              </Badge>
                            </div>
                            {phaseData?.details && (
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {phaseData.details.map((detail, i) => (
                                  <li key={i} className="flex items-center gap-2">
                                    <CheckCircle className="w-3 h-3 text-green-500" />
                                    {detail}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        );
                      })}
                      {readinessData?.data?.recommendations && readinessData.data.recommendations.length > 0 && (
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                          <p className="font-medium text-yellow-500 mb-2">{t("adminAI.enterprise.recommendations")}</p>
                          <ul className="text-sm space-y-1">
                            {readinessData.data.recommendations.map((rec, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <AlertTriangle className="w-3 h-3 text-yellow-500" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Executor Status */}
              <Card data-testid="card-executor-status">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-5 h-5" />
                    {t("adminAI.enterprise.aiDecisionExecutor")}
                  </CardTitle>
                  <CardDescription>{t("adminAI.enterprise.realtimeControl")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {executorLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/50 rounded-lg text-center">
                          <p className="text-3xl font-bold text-primary" data-testid="text-total-executions">
                            {executorData?.data?.executionCount || 0}
                          </p>
                          <p className="text-sm text-muted-foreground">{t("adminAI.enterprise.totalExecutions")}</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg text-center">
                          <p className="text-3xl font-bold text-red-500" data-testid="text-rollbacks">
                            {executorData?.data?.rollbackCount || 0}
                          </p>
                          <p className="text-sm text-muted-foreground">{t("adminAI.enterprise.rollbacks")}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="font-medium">{t("adminAI.enterprise.confidenceThresholds")}</p>
                        <div className="grid grid-cols-4 gap-2">
                          {['low', 'medium', 'high', 'critical'].map(level => (
                            <div key={level} className="p-2 border rounded text-center">
                              <p className="text-lg font-bold">{executorData?.data?.confidenceThresholds?.[level as keyof typeof executorData.data.confidenceThresholds] || 0}%</p>
                              <p className="text-xs text-muted-foreground">{t(`adminAI.enterprise.${level}`)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="font-medium">{t("adminAI.enterprise.supportedTypes")}</p>
                        <div className="flex flex-wrap gap-2">
                          {executorData?.data?.executionTypes?.slice(0, 6).map(type => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {type.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                          {(executorData?.data?.executionTypes?.length || 0) > 6 && (
                            <Badge variant="outline" className="text-xs">
                              +{(executorData?.data?.executionTypes?.length || 0) - 6} {t("adminAI.enterprise.more")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Triple-Band System Tab */}
          <TabsContent value="bands" data-testid="tab-content-bands">
            <div className="space-y-6">
              {bandsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48 w-full" />)}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Strategic Band */}
                    <Card className="border-blue-500/30 bg-blue-500/5" data-testid="card-strategic-band">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Brain className="text-blue-500" />
                          {t("adminAI.enterprise.strategicBand")}
                        </CardTitle>
                        <CardDescription>{bandsData?.data?.strategic?.provider} - {bandsData?.data?.strategic?.model}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">{t("adminAI.enterprise.strategicBandDesc")}</p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs bg-blue-500/10">{t("adminAI.enterprise.eventGovernance")}</Badge>
                          <Badge variant="outline" className="text-xs bg-blue-500/10">{t("adminAI.enterprise.eventSharding")}</Badge>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">{t("adminAI.enterprise.temperature")}: </span>
                          <span className="font-medium">{bandsData?.data?.strategic?.temperature}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Tactical Band */}
                    <Card className="border-purple-500/30 bg-purple-500/5" data-testid="card-tactical-band">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Brain className="text-purple-500" />
                          {t("adminAI.enterprise.tacticalBand")}
                        </CardTitle>
                        <CardDescription>{bandsData?.data?.tactical?.provider} - {bandsData?.data?.tactical?.model}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">{t("adminAI.enterprise.tacticalBandDesc")}</p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs bg-purple-500/10">{t("adminAI.enterprise.eventConsensus")}</Badge>
                          <Badge variant="outline" className="text-xs bg-purple-500/10">{t("adminAI.enterprise.eventValidation")}</Badge>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">{t("adminAI.enterprise.temperature")}: </span>
                          <span className="font-medium">{bandsData?.data?.tactical?.temperature}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Operational Band */}
                    <Card className="border-green-500/30 bg-green-500/5" data-testid="card-operational-band">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Brain className="text-green-500" />
                          {t("adminAI.enterprise.operationalBand")}
                        </CardTitle>
                        <CardDescription>{bandsData?.data?.operational?.provider} - {bandsData?.data?.operational?.model}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">{t("adminAI.enterprise.operationalBandDesc")}</p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs bg-green-500/10">{t("adminAI.enterprise.eventOptimization")}</Badge>
                          <Badge variant="outline" className="text-xs bg-green-500/10">{t("adminAI.enterprise.eventSecurity")}</Badge>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">{t("adminAI.enterprise.temperature")}: </span>
                          <span className="font-medium">{bandsData?.data?.operational?.temperature}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Fallback Band */}
                    <Card className="border-orange-500/30 bg-orange-500/5" data-testid="card-fallback-band">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <RefreshCw className="text-orange-500" />
                          {t("adminAI.enterprise.fallbackBand")}
                        </CardTitle>
                        <CardDescription>{bandsData?.data?.fallback?.provider} - {bandsData?.data?.fallback?.model}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">{t("adminAI.enterprise.fallbackBandDesc")}</p>
                        <div className="text-sm">
                          <span className="text-muted-foreground">{t("adminAI.enterprise.activation")}: </span>
                          <span className="font-medium">{t("adminAI.enterprise.activationCondition")}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Decision Flow */}
                  <Card data-testid="card-decision-flow">
                    <CardHeader>
                      <CardTitle>{t("adminAI.enterprise.decisionFlow")}</CardTitle>
                      <CardDescription>{t("adminAI.enterprise.decisionFlowDesc")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-full bg-blue-500/20">
                            <Brain className="w-6 h-6 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-medium">{t("adminAI.strategic")} (Gemini)</p>
                            <p className="text-sm text-muted-foreground">{t("adminAI.every6Hours")} • 50% {t("adminAI.weight")}</p>
                          </div>
                        </div>
                        <div className="text-2xl hidden md:block">→</div>
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-full bg-purple-500/20">
                            <Brain className="w-6 h-6 text-purple-500" />
                          </div>
                          <div>
                            <p className="font-medium">{t("adminAI.tactical")} (Claude)</p>
                            <p className="text-sm text-muted-foreground">{t("adminAI.everyBlock")} • 30% {t("adminAI.weight")}</p>
                          </div>
                        </div>
                        <div className="text-2xl hidden md:block">→</div>
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-full bg-green-500/20">
                            <Brain className="w-6 h-6 text-green-500" />
                          </div>
                          <div>
                            <p className="font-medium">{t("adminAI.operational")} (GPT-4o)</p>
                            <p className="text-sm text-muted-foreground">{t("adminAI.immediate")} • 20% {t("adminAI.weight")}</p>
                          </div>
                        </div>
                        <div className="text-2xl hidden md:block">⇢</div>
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-full bg-orange-500/20">
                            <RefreshCw className="w-6 h-6 text-orange-500" />
                          </div>
                          <div>
                            <p className="font-medium">{t("adminAI.fallback")} (Grok)</p>
                            <p className="text-sm text-muted-foreground">{t("adminAI.fallbackDesc")}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>

          {/* Governance AI Tab */}
          <TabsContent value="governance" data-testid="tab-content-governance">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stats Overview */}
              <Card data-testid="card-governance-stats">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5" />
                    {t("adminAI.enterprise.governanceStats")}
                  </CardTitle>
                  <CardDescription>{t("adminAI.enterprise.governanceDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {governanceLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/50 rounded-lg text-center">
                          <p className="text-3xl font-bold" data-testid="text-total-analyzed">
                            {governanceData?.data?.totalAnalyzed || 0}
                          </p>
                          <p className="text-sm text-muted-foreground">{t("adminAI.enterprise.totalAnalyzed")}</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg text-center">
                          <p className="text-3xl font-bold text-green-500" data-testid="text-auto-approved">
                            {governanceData?.data?.autoApproved || 0}
                          </p>
                          <p className="text-sm text-muted-foreground">{t("adminAI.enterprise.autoApproved")}</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg text-center">
                          <p className="text-3xl font-bold text-yellow-500" data-testid="text-manual-review">
                            {governanceData?.data?.manualReview || 0}
                          </p>
                          <p className="text-sm text-muted-foreground">{t("adminAI.enterprise.manualReview")}</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg text-center">
                          <p className="text-3xl font-bold text-blue-500" data-testid="text-avg-confidence">
                            {governanceData?.data?.avgConfidence || 0}%
                          </p>
                          <p className="text-sm text-muted-foreground">{t("adminAI.enterprise.avgConfidence")}</p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Risk Distribution */}
              <Card data-testid="card-risk-distribution">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    {t("adminAI.enterprise.riskDistribution")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {governanceLoading ? (
                    <Skeleton className="h-48 w-full" />
                  ) : (
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getRiskDistributionData()}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {getRiskDistributionData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex justify-center gap-4 text-xs">
                        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500" /> {t("adminAI.enterprise.low")}</span>
                        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-500" /> {t("adminAI.enterprise.medium")}</span>
                        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-orange-500" /> {t("adminAI.enterprise.high")}</span>
                        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500" /> {t("adminAI.enterprise.critical")}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Pre-validations */}
              <Card data-testid="card-recent-prevalidations">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    {t("adminAI.enterprise.recentPrevalidations")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {governanceLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {governanceData?.data?.recentPrevalidations?.slice(0, 5).map((pv) => (
                        <div key={pv.id} className="p-2 border rounded-lg text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs">{pv.proposalId?.slice(0, 16)}...</span>
                            <Badge 
                              variant="outline" 
                              className={
                                pv.riskLevel === 'low' ? 'bg-green-500/10 text-green-500' :
                                pv.riskLevel === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                                pv.riskLevel === 'high' ? 'bg-orange-500/10 text-orange-500' :
                                'bg-red-500/10 text-red-500'
                              }
                            >
                              {pv.riskLevel}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-muted-foreground">{t("adminAI.enterprise.tableConfidence")}: {pv.aiConfidence}%</span>
                            {pv.automatedDecision ? (
                              <Badge className="bg-green-500 text-xs">{t("adminAI.enterprise.auto")}</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">{t("adminAI.enterprise.manual")}</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Execution Logs Tab */}
          <TabsContent value="executions" data-testid="tab-content-executions">
            <Card data-testid="card-execution-logs">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="w-5 h-5" />
                  {t("adminAI.enterprise.executionLogs")}
                </CardTitle>
                <CardDescription>{t("adminAI.enterprise.executionLogsDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                {executionsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : (
                  <Table data-testid="table-executions">
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("adminAI.enterprise.tableType")}</TableHead>
                        <TableHead>{t("adminAI.enterprise.tableAction")}</TableHead>
                        <TableHead>{t("adminAI.enterprise.tableResult")}</TableHead>
                        <TableHead>{t("adminAI.enterprise.tableConfidence")}</TableHead>
                        <TableHead>{t("adminAI.enterprise.tableProvider")}</TableHead>
                        <TableHead>{t("adminAI.enterprise.tableTime")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {executionsData?.data?.length ? (
                        executionsData.data.map((log: any, index: number) => (
                          <TableRow key={log.id || index} data-testid={`row-execution-${index}`}>
                            <TableCell>
                              <Badge variant="outline">{translateExecutionType(log.executionType)}</Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {log.metricsImprovement ? Object.entries(log.metricsImprovement).map(([k, v]) => `${k}: ${v}`).join(', ') : translateExecutionType(log.executionType)}
                            </TableCell>
                            <TableCell>
                              <Badge className={log.status === 'completed' ? 'bg-green-500' : log.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'}>
                                {log.status === 'completed' ? t("adminAI.enterprise.statusCompleted") : 
                                 log.status === 'failed' ? t("adminAI.enterprise.statusFailed") : 
                                 t("adminAI.enterprise.statusExecuting")}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={log.confidence} className="w-12" />
                                <span>{log.confidence}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                {log.impactLevel === 'critical' ? 'Gemini 3 Pro' : 
                                 log.impactLevel === 'high' ? 'Claude Sonnet' : 
                                 log.impactLevel === 'medium' ? 'GPT-4o' : 'Grok 3'}
                              </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {log.createdAt ? new Date(log.createdAt).toLocaleString('en-US', { timeZone: 'America/New_York' }) : '-'}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>{t("adminAI.enterprise.noExecutionLogs")}</p>
                            <p className="text-sm">{t("adminAI.enterprise.executionLogsHint")}</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Models Tab */}
          <TabsContent value="models" data-testid="tab-content-models">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-24 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {aiData.models.map((model) => (
                  <Card 
                    key={model.id} 
                    className={
                      model.layer === "Strategic" ? "border-blue-500/30 bg-blue-500/5" :
                      model.layer === "Tactical" ? "border-purple-500/30 bg-purple-500/5" :
                      model.layer === "Fallback" ? "border-orange-500/30 bg-orange-500/5" :
                      "border-green-500/30 bg-green-500/5"
                    }
                    data-testid={`card-model-${model.id}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {model.layer === "Fallback" ? (
                            <RefreshCw className="text-orange-500" />
                          ) : (
                            <Brain className={
                              model.layer === "Strategic" ? "text-blue-500" :
                              model.layer === "Tactical" ? "text-purple-500" :
                              "text-green-500"
                            } />
                          )}
                          <span>{model.name}</span>
                        </CardTitle>
                        <Badge 
                          variant="outline" 
                          className={
                            model.status === "standby" ? "bg-orange-500/10 text-orange-500 border-orange-500/30" :
                            model.status === "online" ? "bg-green-500/10 text-green-500 border-green-500/30" :
                            "bg-red-500/10 text-red-500 border-red-500/30"
                          }
                        >
                          {model.status === "standby" ? <Clock className="w-3 h-3 mr-1" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                          {translateStatus(model.status)}
                        </Badge>
                      </div>
                      <CardDescription>{translateType(model.layer)} {t("adminAI.layer")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">{t("adminAI.latency")}</span>
                          <p className="font-medium">{model.latency}ms</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t("adminAI.tokenRate")}</span>
                          <p className="font-medium">{model.tokenRate}/sec</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t("adminAI.accuracy")}</span>
                          <p className="font-medium">{model.accuracy}%</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t("adminAI.requests24h")}</span>
                          <p className="font-medium">{(model.requests24h ?? 0).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{t("adminAI.cost24h")}</span>
                          <span className="font-medium">${model.cost24h.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewModel(model)}>
                          <Eye className="w-4 h-4 mr-1" />
                          {t("adminAI.view")}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleSyncModel(model)}>
                          <RotateCcw className="w-4 h-4 mr-1" />
                          {t("adminAI.sync")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" data-testid="tab-content-performance">
            <Card data-testid="card-latency-comparison">
              <CardHeader>
                <CardTitle>{t("adminAI.latencyComparison")}</CardTitle>
                <CardDescription>{t("adminAI.latencyComparisonDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-80 w-full" />
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={aiData.performance}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="gemini" stroke="#3b82f6" name="Gemini 3 Pro" strokeWidth={2} />
                        <Line type="monotone" dataKey="claude" stroke="#a855f7" name="Claude" strokeWidth={2} />
                        <Line type="monotone" dataKey="openai" stroke="#22c55e" name="GPT-4o" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold">{aiData.stats.overallAccuracy}%</div>
                  <div className="text-sm text-muted-foreground">{t("adminAI.overallAccuracy")}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold">{aiData.stats.totalRequests24h}</div>
                  <div className="text-sm text-muted-foreground">{t("adminAI.totalRequests24h")}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold">${aiData.stats.totalCost24h}</div>
                  <div className="text-sm text-muted-foreground">{t("adminAI.totalCost24h")}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold">{aiData.stats.uptime}%</div>
                  <div className="text-sm text-muted-foreground">{t("adminAI.uptime")}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {selectedModel && (
        <DetailSheet
          open={detailOpen}
          onOpenChange={setDetailOpen}
          title={t("adminAI.detail.title")}
          subtitle={selectedModel.name}
          icon={<Brain className="w-5 h-5" />}
          sections={getModelDetailSections(selectedModel)}
          actions={[
            {
              label: t("adminAI.sync"),
              icon: <RotateCcw className="w-4 h-4" />,
              onClick: () => {
                setDetailOpen(false);
                handleSyncModel(selectedModel);
              },
            },
          ]}
        />
      )}

      <ConfirmationDialog
        open={syncDialogOpen}
        onOpenChange={setSyncDialogOpen}
        title={t("adminAI.confirmSync.title")}
        description={t("adminAI.confirmSync.description", { name: modelToSync?.name })}
        confirmText={t("adminAI.sync")}
        actionType="restart"
        destructive={false}
        onConfirm={() => { if (modelToSync) syncModelMutation.mutate(modelToSync.id); }}
        isLoading={syncModelMutation.isPending}
      />
    </ScrollArea>
  );
}
