import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  Bot,
  Brain,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Download,
  Eye,
  Flame,
  Gauge,
  Globe,
  HardDrive,
  Layers,
  Link2,
  MemoryStick,
  Monitor,
  Network,
  Pause,
  Play,
  Power,
  RefreshCw,
  Server,
  Shield,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Users,
  Vote,
  Wallet,
  Zap,
  AlertCircle,
  XCircle,
  ExternalLink,
  Settings,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface NetworkStats {
  tps: number;
  blockHeight: number;
  avgBlockTime: number;
  pendingTransactions: number;
  totalValidators: number;
  activeValidators: number;
  networkUptime: number;
  latency: number;
  totalShards: number;
  crossShardMessages: number;
}

interface AISystemStatus {
  models: Array<{
    name: string;
    status: "operational" | "degraded" | "offline";
    accuracy: number;
    decisionsToday: number;
    avgConfidence: number;
    latency: number;
  }>;
  totalDecisionsToday: number;
  avgConfidence: number;
}

interface SecurityAlert {
  id: string;
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  message: string;
  timestamp: Date;
  status: "active" | "acknowledged" | "resolved";
}

interface SystemResources {
  cpu: number;
  memory: number;
  disk: number;
  networkIO: number;
}

interface ValidatorSummary {
  online: number;
  offline: number;
  jailed: number;
  topValidators: Array<{
    address: string;
    name: string;
    stake: string;
    uptime: number;
    commission: number;
  }>;
}

interface BridgeStatus {
  activeBridges: number;
  pendingTransfers: number;
  totalLiquidity: string;
  dailyVolume: string;
  chains: Array<{
    name: string;
    status: "connected" | "degraded" | "disconnected";
    pendingTx: number;
  }>;
}

interface StakingMetrics {
  totalStaked: string;
  stakingRatio: number;
  avgApy: number;
  rewardsDistributed: string;
}

interface TokenEconomics {
  circulatingSupply: string;
  totalBurned: string;
  inflationRate: number;
  deflationaryRate: number;
}

function formatNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return num.toFixed(0);
}

function formatTBURN(value: string): string {
  const num = parseFloat(value);
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B TBURN";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M TBURN";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K TBURN";
  return num.toFixed(2) + " TBURN";
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case "critical": return "text-red-500";
    case "high": return "text-orange-500";
    case "medium": return "text-yellow-500";
    case "low": return "text-blue-500";
    default: return "text-muted-foreground";
  }
}

function getSeverityBadgeVariant(severity: string): "destructive" | "secondary" | "outline" {
  switch (severity) {
    case "critical": return "destructive";
    case "high": return "destructive";
    default: return "secondary";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "operational": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "degraded": return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    case "offline": return <XCircle className="h-4 w-4 text-red-500" />;
    case "connected": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "disconnected": return <XCircle className="h-4 w-4 text-red-500" />;
    default: return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
  }
}

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6b7280"];

function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  changeType = "positive",
  isLoading = false,
  bgColor = "bg-primary/10",
  iconColor = "text-primary",
  testId
}: {
  icon: any;
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  isLoading?: boolean;
  bgColor?: string;
  iconColor?: string;
  testId: string;
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
              <p className="text-lg font-bold truncate">{value}</p>
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

export default function UnifiedDashboard() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [showAlertDetail, setShowAlertDetail] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [showExportConfirm, setShowExportConfirm] = useState(false);

  const { data: networkStats, isLoading: loadingNetwork, error: networkError, refetch: refetchNetwork } = useQuery<NetworkStats>({
    queryKey: ["/api/network/stats"],
    refetchInterval: 5000,
  });

  const { data: alertsData, isLoading: loadingAlerts, refetch: refetchAlerts } = useQuery<{ alerts: SecurityAlert[] }>({
    queryKey: ["/api/admin/alerts"],
    refetchInterval: 10000,
  });

  const { data: validatorsData, isLoading: loadingValidators, refetch: refetchValidators } = useQuery<{ validators: any[] }>({
    queryKey: ["/api/validators"],
    refetchInterval: 30000,
  });

  const { data: aiData, isLoading: loadingAI } = useQuery<AISystemStatus>({
    queryKey: ["/api/admin/ai/status"],
    refetchInterval: 15000,
  });

  const { data: resourcesData, isLoading: loadingResources } = useQuery<SystemResources>({
    queryKey: ["/api/admin/system/resources"],
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
          ws?.send(JSON.stringify({ type: "subscribe", channels: ["network", "alerts", "validators"] }));
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "network_update") {
              refetchNetwork();
            } else if (data.type === "alert") {
              refetchAlerts();
              if (data.severity === "critical") {
                toast({
                  title: t("adminDashboard.criticalAlert"),
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
  }, [refetchNetwork, refetchAlerts, toast, t]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchNetwork(),
        refetchAlerts(),
        refetchValidators(),
      ]);
      toast({
        title: t("adminDashboard.refreshSuccess"),
        description: t("adminDashboard.dataUpdated"),
      });
    } catch (error) {
      toast({
        title: t("adminDashboard.refreshError"),
        description: t("adminDashboard.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
      setLastUpdate(new Date());
    }
  }, [refetchNetwork, refetchAlerts, refetchValidators, toast, t]);

  const getAlertDetailSections = useCallback((alert: SecurityAlert): DetailSection[] => {
    const getSeverityBadgeColor = (severity: string) => {
      switch (severity) {
        case "critical": return "bg-red-500/10 text-red-500";
        case "high": return "bg-orange-500/10 text-orange-500";
        case "medium": return "bg-yellow-500/10 text-yellow-500";
        case "low": return "bg-blue-500/10 text-blue-500";
        default: return "";
      }
    };
    
    const getStatusBadgeColor = (status: string) => {
      switch (status) {
        case "active": return "bg-red-500/10 text-red-500";
        case "acknowledged": return "bg-yellow-500/10 text-yellow-500";
        case "resolved": return "bg-green-500/10 text-green-500";
        default: return "";
      }
    };

    return [
      {
        title: t("adminDashboard.detail.alertInfo"),
        fields: [
          { label: t("common.id"), value: alert.id, type: "code", copyable: true },
          { label: t("common.type"), value: alert.type },
          { label: t("adminDashboard.severity"), value: alert.severity, type: "badge", badgeColor: getSeverityBadgeColor(alert.severity) },
          { label: t("common.status"), value: alert.status, type: "badge", badgeColor: getStatusBadgeColor(alert.status) },
        ],
      },
      {
        title: t("adminDashboard.detail.details"),
        fields: [
          { label: t("adminDashboard.alertTitle"), value: alert.title },
          { label: t("adminDashboard.alertMessage"), value: alert.message },
          { label: t("common.time"), value: alert.timestamp, type: "date" },
        ],
      },
    ];
  }, [t]);

  const handleExportDashboard = useCallback(() => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      networkStats,
      alerts: alertsData?.alerts,
      validators: validatorsData?.validators?.length,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tburn-dashboard-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: t("adminDashboard.exportSuccess"),
      description: t("adminDashboard.exportSuccessDesc"),
    });
    setShowExportConfirm(false);
  }, [networkStats, alertsData, validatorsData, toast, t]);

  const systemStatus = useMemo(() => {
    if (!networkStats) return "operational";
    if (networkStats.tps < 100 || networkStats.activeValidators < networkStats.totalValidators * 0.5) return "degraded";
    if (networkStats.tps < 10) return "critical";
    return "operational";
  }, [networkStats]);

  const defaultAIStatus: AISystemStatus = {
    models: [
      { name: "Claude 4.5 Sonnet", status: "operational", accuracy: 97.8, decisionsToday: 1247, avgConfidence: 94.2, latency: 145 },
      { name: "GPT-4o", status: "operational", accuracy: 96.5, decisionsToday: 892, avgConfidence: 92.8, latency: 178 },
      { name: "Gemini Pro", status: "operational", accuracy: 95.2, decisionsToday: 634, avgConfidence: 91.5, latency: 156 },
    ],
    totalDecisionsToday: 2773,
    avgConfidence: 92.8,
  };

  const aiStatus: AISystemStatus = useMemo(() => {
    if (aiData && Array.isArray(aiData.models) && aiData.models.length > 0) {
      return aiData;
    }
    return defaultAIStatus;
  }, [aiData]);

  const systemResources: SystemResources = useMemo(() => {
    if (resourcesData) return resourcesData;
    return { cpu: 42, memory: 68, disk: 54, networkIO: 78 };
  }, [resourcesData]);

  const defaultTopValidators = [
    { address: "0x1234...5678", name: "TBURN Genesis", stake: "15000000", uptime: 99.99, commission: 5 },
    { address: "0x2345...6789", name: "BlockForge", stake: "12500000", uptime: 99.95, commission: 7 },
    { address: "0x3456...789a", name: "CryptoStake", stake: "10800000", uptime: 99.92, commission: 6 },
    { address: "0x4567...89ab", name: "NodeMaster", stake: "9200000", uptime: 99.88, commission: 8 },
    { address: "0x5678...9abc", name: "ValidateX", stake: "8100000", uptime: 99.85, commission: 5 },
  ];

  const validatorSummary: ValidatorSummary = useMemo(() => {
    const validators = validatorsData?.validators || [];
    const active = validators.filter((v: any) => v.status === "active").length;
    const inactive = validators.filter((v: any) => v.status === "inactive").length;
    const jailed = validators.filter((v: any) => v.status === "jailed").length;
    
    const mappedValidators = validators.slice(0, 5).map((v: any, i: number) => ({
      address: v.address || `0x${i}234...5678`,
      name: v.name || `Validator ${i + 1}`,
      stake: v.stake || String(15000000 - i * 2000000),
      uptime: v.uptime || 99.99 - i * 0.02,
      commission: v.commission || 5 + i,
    }));

    return {
      online: active || 142,
      offline: inactive || 8,
      jailed: jailed || 6,
      topValidators: mappedValidators.length > 0 ? mappedValidators : defaultTopValidators,
    };
  }, [validatorsData]);

  const bridgeStatus: BridgeStatus = useMemo(() => ({
    activeBridges: 7,
    pendingTransfers: 23,
    totalLiquidity: "125000000",
    dailyVolume: "8500000",
    chains: [
      { name: "Ethereum", status: "connected", pendingTx: 8 },
      { name: "Polygon", status: "connected", pendingTx: 5 },
      { name: "BSC", status: "connected", pendingTx: 4 },
      { name: "Avalanche", status: "connected", pendingTx: 3 },
      { name: "Arbitrum", status: "degraded", pendingTx: 2 },
      { name: "Optimism", status: "connected", pendingTx: 1 },
      { name: "Solana", status: "connected", pendingTx: 0 },
    ],
  }), []);

  const stakingMetrics: StakingMetrics = useMemo(() => ({
    totalStaked: "850000000",
    stakingRatio: 68.5,
    avgApy: 12.4,
    rewardsDistributed: "12500000",
  }), []);

  const tokenEconomics: TokenEconomics = useMemo(() => ({
    circulatingSupply: "1240000000",
    totalBurned: "156000000",
    inflationRate: 2.1,
    deflationaryRate: 3.8,
  }), []);

  const alerts: SecurityAlert[] = useMemo(() => {
    if (alertsData?.alerts) {
      return alertsData.alerts.map((a: any) => ({
        ...a,
        timestamp: new Date(a.timestamp),
      }));
    }
    return [
      { id: "1", type: "security", severity: "critical" as const, title: t("adminDashboard.alerts.suspiciousActivity"), message: t("adminDashboard.alerts.suspiciousActivityDesc"), timestamp: new Date(Date.now() - 300000), status: "active" as const },
      { id: "2", type: "validator", severity: "high" as const, title: t("adminDashboard.alerts.validatorOffline"), message: t("adminDashboard.alerts.validatorOfflineDesc"), timestamp: new Date(Date.now() - 900000), status: "active" as const },
      { id: "3", type: "bridge", severity: "medium" as const, title: t("adminDashboard.alerts.bridgeDegraded"), message: t("adminDashboard.alerts.bridgeDegradedDesc"), timestamp: new Date(Date.now() - 1800000), status: "acknowledged" as const },
      { id: "4", type: "system", severity: "low" as const, title: t("adminDashboard.alerts.scheduledMaintenance"), message: t("adminDashboard.alerts.scheduledMaintenanceDesc"), timestamp: new Date(Date.now() - 3600000), status: "active" as const },
    ];
  }, [alertsData, t]);

  const tpsHistory = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      time: `${23 - i}h`,
      tps: Math.floor(Math.random() * 500) + 2500,
      block: Math.floor(Math.random() * 100) + 900,
    })).reverse();
  }, []);

  const recentActivity = useMemo(() => [
    { action: t("adminDashboard.activity.validatorJoined"), target: "0x8901...def0", time: t("adminDashboard.activity.minAgo", { count: 2 }), type: "validator" },
    { action: t("adminDashboard.activity.proposalExecuted"), target: "#TIP-47", time: t("adminDashboard.activity.minAgo", { count: 15 }), type: "governance" },
    { action: t("adminDashboard.activity.bridgeTransfer"), target: "1,500 TBURN", time: t("adminDashboard.activity.minAgo", { count: 23 }), type: "bridge" },
    { action: t("adminDashboard.activity.burnEvent"), target: "10,000 TBURN", time: t("adminDashboard.activity.minAgo", { count: 45 }), type: "burn" },
    { action: t("adminDashboard.activity.configUpdate"), target: t("adminDashboard.activity.gasParams"), time: t("adminDashboard.activity.hourAgo", { count: 1 }), type: "config" },
    { action: t("adminDashboard.activity.securityScan"), target: t("adminDashboard.activity.completed"), time: t("adminDashboard.activity.hourAgo", { count: 2 }), type: "security" },
  ], [t]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return <Badge data-testid="badge-status-operational" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">{t("adminDashboard.operational")}</Badge>;
      case "degraded":
        return <Badge data-testid="badge-status-degraded" className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20">{t("adminDashboard.degraded")}</Badge>;
      case "critical":
        return <Badge data-testid="badge-status-critical" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">{t("adminDashboard.critical")}</Badge>;
      case "maintenance":
        return <Badge data-testid="badge-status-maintenance" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">{t("adminDashboard.maintenance")}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (networkError) {
    return (
      <div className="flex-1 flex items-center justify-center" data-testid="dashboard-error">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t("adminDashboard.error.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("adminDashboard.error.description")}</p>
            <Button onClick={() => refetchNetwork()} data-testid="button-retry">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminDashboard.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex-1 overflow-auto" data-testid="unified-dashboard">
        <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight" data-testid="text-dashboard-title">
                {t("adminDashboard.title")}
              </h1>
              <p className="text-muted-foreground" data-testid="text-dashboard-subtitle">
                {t("adminDashboard.subtitle")}
              </p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${wsConnected ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                      <div className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                      <span className="text-xs">{wsConnected ? t("adminDashboard.connected") : t("adminDashboard.reconnecting")}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {wsConnected ? t("adminDashboard.wsConnected") : t("adminDashboard.wsReconnecting")}
                  </TooltipContent>
                </Tooltip>
                <Clock className="h-4 w-4" />
                <span data-testid="text-last-update">{t("adminDashboard.lastUpdate")}: {lastUpdate.toLocaleTimeString(i18n.language === 'ko' ? 'ko-KR' : 'en-US')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{t("adminDashboard.systemStatus")}:</span>
                {getStatusBadge(systemStatus)}
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
                  <TooltipContent>{t("adminDashboard.refresh")}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowExportConfirm(true)}
                      data-testid="button-export"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("adminDashboard.export")}</TooltipContent>
                </Tooltip>
                <Link href="/admin/settings">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" data-testid="button-settings">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t("adminDashboard.settings")}</TooltipContent>
                  </Tooltip>
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <MetricCard
              icon={Zap}
              label={t("adminDashboard.tps")}
              value={formatNumber(networkStats?.tps || 0)}
              change="+5.2%"
              changeType="positive"
              isLoading={loadingNetwork}
              bgColor="bg-primary/10"
              iconColor="text-primary"
              testId="metric-tps"
            />
            <MetricCard
              icon={Layers}
              label={t("adminDashboard.blockHeight")}
              value={formatNumber(networkStats?.blockHeight || 0)}
              isLoading={loadingNetwork}
              bgColor="bg-blue-500/10"
              iconColor="text-blue-500"
              testId="metric-block-height"
            />
            <MetricCard
              icon={Server}
              label={t("adminDashboard.activeValidators")}
              value={`${validatorSummary.online}/${validatorSummary.online + validatorSummary.offline}`}
              isLoading={loadingValidators}
              bgColor="bg-green-500/10"
              iconColor="text-green-500"
              testId="metric-validators"
            />
            <MetricCard
              icon={Globe}
              label={t("adminDashboard.networkUptime")}
              value="99.98%"
              bgColor="bg-purple-500/10"
              iconColor="text-purple-500"
              testId="metric-uptime"
            />
            <MetricCard
              icon={Activity}
              label={t("adminDashboard.pendingTx")}
              value={formatNumber(networkStats?.pendingTransactions || 0)}
              isLoading={loadingNetwork}
              bgColor="bg-orange-500/10"
              iconColor="text-orange-500"
              testId="metric-pending-tx"
            />
            <MetricCard
              icon={Clock}
              label={t("adminDashboard.avgBlockTime")}
              value={`${networkStats?.avgBlockTime || 0}ms`}
              isLoading={loadingNetwork}
              bgColor="bg-cyan-500/10"
              iconColor="text-cyan-500"
              testId="metric-block-time"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2" data-testid="card-network-performance">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {t("adminDashboard.networkPerformance")}
                  </CardTitle>
                  <Link href="/admin/performance">
                    <Button variant="ghost" size="sm" data-testid="link-performance-detail">
                      {t("adminDashboard.viewDetails")}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={tpsHistory}>
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
                          borderRadius: "8px"
                        }}
                        formatter={(value: number) => [value.toLocaleString(), "TPS"]}
                      />
                      <Area type="monotone" dataKey="tps" stroke="#10b981" fill="url(#colorTps)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-security-alerts">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5" />
                    {t("adminDashboard.securityAlerts")}
                  </CardTitle>
                  <Link href="/admin/alerts">
                    <Button variant="ghost" size="sm" data-testid="link-alerts">
                      {t("adminDashboard.viewAll")}
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loadingAlerts ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-red-500/10" data-testid="alert-count-critical">
                        <p className="text-xl font-bold text-red-500">{alerts.filter(a => a.severity === "critical").length}</p>
                        <p className="text-xs text-muted-foreground">{t("adminDashboard.criticalAlerts")}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-orange-500/10" data-testid="alert-count-high">
                        <p className="text-xl font-bold text-orange-500">{alerts.filter(a => a.severity === "high").length}</p>
                        <p className="text-xs text-muted-foreground">{t("adminDashboard.highAlerts")}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-yellow-500/10" data-testid="alert-count-medium">
                        <p className="text-xl font-bold text-yellow-500">{alerts.filter(a => a.severity === "medium").length}</p>
                        <p className="text-xs text-muted-foreground">{t("adminDashboard.mediumAlerts")}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-blue-500/10" data-testid="alert-count-low">
                        <p className="text-xl font-bold text-blue-500">{alerts.filter(a => a.severity === "low").length}</p>
                        <p className="text-xs text-muted-foreground">{t("adminDashboard.lowAlerts")}</p>
                      </div>
                    </div>
                    <Separator />
                    <ScrollArea className="h-[140px]">
                      <div className="space-y-2">
                        {alerts.length === 0 ? (
                          <div className="text-center py-4 text-muted-foreground" data-testid="no-alerts">
                            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                            <p>{t("adminDashboard.noAlerts")}</p>
                          </div>
                        ) : (
                          alerts.slice(0, 4).map((alert) => (
                            <div 
                              key={alert.id} 
                              className="flex items-start gap-2 p-2 rounded-lg hover-elevate cursor-pointer"
                              data-testid={`alert-item-${alert.id}`}
                            >
                              <AlertTriangle className={`h-4 w-4 mt-0.5 ${getSeverityColor(alert.severity)}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{alert.title}</p>
                                <p className="text-xs text-muted-foreground truncate">{alert.message}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedAlert(alert);
                                    setShowAlertDetail(true);
                                  }}
                                  data-testid={`button-view-alert-${alert.id}`}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Badge variant={getSeverityBadgeVariant(alert.severity)} className="text-xs">
                                  {alert.severity}
                                </Badge>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card data-testid="card-ai-status">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    {t("adminDashboard.aiStatus")}
                  </CardTitle>
                  <Link href="/admin/ai">
                    <Button variant="ghost" size="icon" data-testid="link-ai">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loadingAI ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {aiStatus.models.map((model, index) => (
                      <div 
                        key={model.name} 
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                        data-testid={`ai-model-${index}`}
                      >
                        <div className="flex items-center gap-2">
                          {getStatusIcon(model.status)}
                          <span className="text-sm font-medium">{model.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{model.accuracy}%</span>
                      </div>
                    ))}
                    <Separator />
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold" data-testid="ai-decisions-today">{formatNumber(aiStatus.totalDecisionsToday)}</p>
                        <p className="text-xs text-muted-foreground">{t("adminDashboard.decisionsToday")}</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold" data-testid="ai-confidence">{aiStatus.avgConfidence}%</p>
                        <p className="text-xs text-muted-foreground">{t("adminDashboard.avgConfidence")}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-system-resources">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Cpu className="h-5 w-5" />
                    {t("adminDashboard.systemResources")}
                  </CardTitle>
                  <Link href="/admin/health">
                    <Button variant="ghost" size="icon" data-testid="link-health">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loadingResources ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{t("adminDashboard.cpu")}</span>
                        <span className="font-medium" data-testid="resource-cpu">{systemResources.cpu}%</span>
                      </div>
                      <Progress value={systemResources.cpu} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{t("adminDashboard.memory")}</span>
                        <span className="font-medium" data-testid="resource-memory">{systemResources.memory}%</span>
                      </div>
                      <Progress value={systemResources.memory} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{t("adminDashboard.disk")}</span>
                        <span className="font-medium" data-testid="resource-disk">{systemResources.disk}%</span>
                      </div>
                      <Progress value={systemResources.disk} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{t("adminDashboard.networkIO")}</span>
                        <span className="font-medium" data-testid="resource-network">{systemResources.networkIO}%</span>
                      </div>
                      <Progress value={systemResources.networkIO} className="h-2" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-validators">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    {t("adminDashboard.validators")}
                  </CardTitle>
                  <Link href="/admin/validators">
                    <Button variant="ghost" size="icon" data-testid="link-validators">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-green-500/10" data-testid="validator-online">
                      <p className="text-xl font-bold text-green-500">{validatorSummary.online}</p>
                      <p className="text-xs text-muted-foreground">{t("adminDashboard.validatorOnline")}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-yellow-500/10" data-testid="validator-offline">
                      <p className="text-xl font-bold text-yellow-500">{validatorSummary.offline}</p>
                      <p className="text-xs text-muted-foreground">{t("adminDashboard.validatorOffline")}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-red-500/10" data-testid="validator-jailed">
                      <p className="text-xl font-bold text-red-500">{validatorSummary.jailed}</p>
                      <p className="text-xs text-muted-foreground">{t("adminDashboard.validatorJailed")}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">{t("adminDashboard.topValidators")}</p>
                    {validatorSummary.topValidators.slice(0, 3).map((validator, index) => (
                      <div 
                        key={validator.address} 
                        className="flex items-center justify-between text-sm"
                        data-testid={`top-validator-${index}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">#{index + 1}</span>
                          <span className="font-medium truncate max-w-[100px]">{validator.name}</span>
                        </div>
                        <span className="text-muted-foreground">{validator.uptime}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-bridge-status">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Link2 className="h-5 w-5" />
                    {t("adminDashboard.bridgeStatus")}
                  </CardTitle>
                  <Link href="/admin/bridge">
                    <Button variant="ghost" size="icon" data-testid="link-bridge">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-primary/10" data-testid="bridge-active">
                      <p className="text-xl font-bold">{bridgeStatus.activeBridges}</p>
                      <p className="text-xs text-muted-foreground">{t("adminDashboard.activeBridges")}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-orange-500/10" data-testid="bridge-pending">
                      <p className="text-xl font-bold text-orange-500">{bridgeStatus.pendingTransfers}</p>
                      <p className="text-xs text-muted-foreground">{t("adminDashboard.pendingTransfers")}</p>
                    </div>
                  </div>
                  <Separator />
                  <ScrollArea className="h-[100px]">
                    <div className="space-y-2">
                      {bridgeStatus.chains.map((chain, index) => (
                        <div 
                          key={chain.name} 
                          className="flex items-center justify-between text-sm"
                          data-testid={`bridge-chain-${index}`}
                        >
                          <div className="flex items-center gap-2">
                            {getStatusIcon(chain.status)}
                            <span>{chain.name}</span>
                          </div>
                          {chain.pendingTx > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {chain.pendingTx} {t("adminDashboard.pending")}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card data-testid="card-staking-metrics">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    {t("adminDashboard.stakingMetrics")}
                  </CardTitle>
                  <Link href="/admin/treasury">
                    <Button variant="ghost" size="icon" data-testid="link-treasury">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div data-testid="staking-total">
                      <p className="text-sm text-muted-foreground">{t("adminDashboard.totalStaked")}</p>
                      <p className="text-xl font-bold">{formatTBURN(stakingMetrics.totalStaked)}</p>
                    </div>
                    <div data-testid="staking-ratio">
                      <p className="text-sm text-muted-foreground">{t("adminDashboard.stakingRatio")}</p>
                      <p className="text-xl font-bold">{stakingMetrics.stakingRatio}%</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div data-testid="staking-apy">
                      <p className="text-sm text-muted-foreground">{t("adminDashboard.avgApy")}</p>
                      <p className="text-xl font-bold text-green-500">{stakingMetrics.avgApy}%</p>
                    </div>
                    <div data-testid="staking-rewards">
                      <p className="text-sm text-muted-foreground">{t("adminDashboard.rewardsDistributed")}</p>
                      <p className="text-xl font-bold">{formatTBURN(stakingMetrics.rewardsDistributed)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-token-economics">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Flame className="h-5 w-5" />
                    {t("adminDashboard.tokenEconomics")}
                  </CardTitle>
                  <Link href="/admin/economics">
                    <Button variant="ghost" size="icon" data-testid="link-economics">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div data-testid="token-supply">
                      <p className="text-sm text-muted-foreground">{t("adminDashboard.circulatingSupply")}</p>
                      <p className="text-xl font-bold">{formatTBURN(tokenEconomics.circulatingSupply)}</p>
                    </div>
                    <div data-testid="token-burned">
                      <p className="text-sm text-muted-foreground">{t("adminDashboard.totalBurned")}</p>
                      <p className="text-xl font-bold text-orange-500">{formatTBURN(tokenEconomics.totalBurned)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div data-testid="token-inflation">
                      <p className="text-sm text-muted-foreground">{t("adminDashboard.inflationRate")}</p>
                      <p className="text-xl font-bold text-blue-500">{tokenEconomics.inflationRate}%</p>
                    </div>
                    <div data-testid="token-deflation">
                      <p className="text-sm text-muted-foreground">{t("adminDashboard.deflationaryRate")}</p>
                      <p className="text-xl font-bold text-green-500">{tokenEconomics.deflationaryRate}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-recent-activity">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    {t("adminDashboard.recentActivity")}
                  </CardTitle>
                  <Link href="/admin/logs">
                    <Button variant="ghost" size="sm" data-testid="link-activity-logs">
                      {t("adminDashboard.viewAll")}
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[180px]">
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-3 p-2 rounded-lg hover-elevate cursor-pointer"
                        data-testid={`activity-item-${index}`}
                      >
                        <div className={`p-2 rounded-full ${
                          activity.type === "validator" ? "bg-green-500/10" :
                          activity.type === "governance" ? "bg-purple-500/10" :
                          activity.type === "bridge" ? "bg-blue-500/10" :
                          activity.type === "burn" ? "bg-orange-500/10" :
                          activity.type === "config" ? "bg-yellow-500/10" :
                          "bg-primary/10"
                        }`}>
                          {activity.type === "validator" ? <Server className="h-3 w-3 text-green-500" /> :
                           activity.type === "governance" ? <Vote className="h-3 w-3 text-purple-500" /> :
                           activity.type === "bridge" ? <Link2 className="h-3 w-3 text-blue-500" /> :
                           activity.type === "burn" ? <Flame className="h-3 w-3 text-orange-500" /> :
                           activity.type === "config" ? <Settings className="h-3 w-3 text-yellow-500" /> :
                           <Shield className="h-3 w-3 text-primary" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{activity.action}</p>
                          <p className="text-xs text-muted-foreground truncate">{activity.target}</p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <Card data-testid="card-quick-actions">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{t("adminDashboard.quickActions")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Link href="/admin/emergency">
                  <Button variant="destructive" size="sm" data-testid="action-emergency">
                    <Power className="h-4 w-4 mr-2" />
                    {t("adminDashboard.emergencyControls")}
                  </Button>
                </Link>
                <Link href="/admin/maintenance">
                  <Button variant="outline" size="sm" data-testid="action-maintenance">
                    <Pause className="h-4 w-4 mr-2" />
                    {t("adminDashboard.maintenanceMode")}
                  </Button>
                </Link>
                <Link href="/admin/backup">
                  <Button variant="outline" size="sm" data-testid="action-backup">
                    <Database className="h-4 w-4 mr-2" />
                    {t("adminDashboard.backupRestore")}
                  </Button>
                </Link>
                <Link href="/admin/proposals">
                  <Button variant="outline" size="sm" data-testid="action-proposals">
                    <Vote className="h-4 w-4 mr-2" />
                    {t("adminDashboard.governance")}
                  </Button>
                </Link>
                <Link href="/admin/reports">
                  <Button variant="outline" size="sm" data-testid="action-reports">
                    <Download className="h-4 w-4 mr-2" />
                    {t("adminDashboard.generateReport")}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedAlert && (
          <DetailSheet
            open={showAlertDetail}
            onOpenChange={setShowAlertDetail}
            title={selectedAlert.title}
            subtitle={selectedAlert.id}
            icon={<Shield className="h-5 w-5" />}
            sections={getAlertDetailSections(selectedAlert)}
          />
        )}

        <ConfirmationDialog
          open={showExportConfirm}
          onOpenChange={setShowExportConfirm}
          title={t("adminDashboard.confirm.exportTitle")}
          description={t("adminDashboard.confirm.exportDesc")}
          onConfirm={handleExportDashboard}
          confirmText={t("common.export")}
          cancelText={t("adminDashboard.cancel")}
          destructive={false}
        />
      </div>
    </TooltipProvider>
  );
}
