import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
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
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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

export default function UnifiedDashboard() {
  const { t } = useTranslation();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const { data: networkStats, isLoading: loadingNetwork } = useQuery<NetworkStats>({
    queryKey: ["/api/network/stats"],
    refetchInterval: 5000,
  });

  const { data: alertsData } = useQuery<{ alerts: SecurityAlert[] }>({
    queryKey: ["/api/admin/alerts"],
    refetchInterval: 10000,
  });

  const { data: validatorsData } = useQuery<{ validators: any[] }>({
    queryKey: ["/api/validators"],
    refetchInterval: 30000,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const systemStatus = useMemo(() => {
    if (!networkStats) return "operational";
    if (networkStats.tps < 100 || networkStats.activeValidators < networkStats.totalValidators * 0.5) return "degraded";
    if (networkStats.tps < 10) return "critical";
    return "operational";
  }, [networkStats]);

  const aiStatus: AISystemStatus = useMemo(() => ({
    models: [
      { name: "Claude 4.5 Sonnet", status: "operational", accuracy: 97.8, decisionsToday: 1247, avgConfidence: 94.2, latency: 145 },
      { name: "GPT-5", status: "operational", accuracy: 96.5, decisionsToday: 892, avgConfidence: 92.8, latency: 178 },
      { name: "Gemini 2.0", status: "operational", accuracy: 95.2, decisionsToday: 634, avgConfidence: 91.5, latency: 156 },
    ],
    totalDecisionsToday: 2773,
    avgConfidence: 92.8,
  }), []);

  const systemResources: SystemResources = useMemo(() => ({
    cpu: 42,
    memory: 68,
    disk: 54,
    networkIO: 78,
  }), []);

  const validatorSummary: ValidatorSummary = useMemo(() => {
    const validators = validatorsData?.validators || [];
    const active = validators.filter((v: any) => v.status === "active").length;
    const inactive = validators.filter((v: any) => v.status === "inactive").length;
    const jailed = validators.filter((v: any) => v.status === "jailed").length;
    
    return {
      online: active || 142,
      offline: inactive || 8,
      jailed: jailed || 6,
      topValidators: [
        { address: "0x1234...5678", name: "TBURN Genesis", stake: "15000000", uptime: 99.99, commission: 5 },
        { address: "0x2345...6789", name: "BlockForge", stake: "12500000", uptime: 99.95, commission: 7 },
        { address: "0x3456...789a", name: "CryptoStake", stake: "10800000", uptime: 99.92, commission: 6 },
        { address: "0x4567...89ab", name: "NodeMaster", stake: "9200000", uptime: 99.88, commission: 8 },
        { address: "0x5678...9abc", name: "ValidateX", stake: "8100000", uptime: 99.85, commission: 5 },
      ],
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

  const alerts: SecurityAlert[] = alertsData?.alerts || [
    { id: "1", type: "security", severity: "critical", title: "Suspicious Activity Detected", message: "Multiple failed login attempts from IP 192.168.1.100", timestamp: new Date(Date.now() - 300000), status: "active" },
    { id: "2", type: "validator", severity: "high", title: "Validator Offline", message: "Validator 0x7890...cdef has been offline for 15 minutes", timestamp: new Date(Date.now() - 900000), status: "active" },
    { id: "3", type: "bridge", severity: "medium", title: "Arbitrum Bridge Degraded", message: "Increased latency on Arbitrum bridge connections", timestamp: new Date(Date.now() - 1800000), status: "acknowledged" },
    { id: "4", type: "system", severity: "low", title: "Scheduled Maintenance", message: "Database optimization scheduled for tonight", timestamp: new Date(Date.now() - 3600000), status: "active" },
    { id: "5", type: "ai", severity: "medium", title: "AI Model Retraining", message: "GPT-5 model retraining in progress", timestamp: new Date(Date.now() - 7200000), status: "acknowledged" },
  ];

  const tpsHistory = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      time: `${23 - i}h`,
      tps: Math.floor(Math.random() * 500) + 2500,
      block: Math.floor(Math.random() * 100) + 900,
    })).reverse();
  }, []);

  const recentActivity = useMemo(() => [
    { action: "Validator joined", target: "0x8901...def0", time: "2 min ago", type: "validator" },
    { action: "Proposal executed", target: "#TIP-47", time: "15 min ago", type: "governance" },
    { action: "Bridge transfer", target: "1,500 TBURN", time: "23 min ago", type: "bridge" },
    { action: "Burn event", target: "10,000 TBURN", time: "45 min ago", type: "burn" },
    { action: "Config update", target: "Gas parameters", time: "1 hour ago", type: "config" },
    { action: "Security scan", target: "Completed", time: "2 hours ago", type: "security" },
  ], []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">{t("adminDashboard.operational")}</Badge>;
      case "degraded":
        return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20">{t("adminDashboard.degraded")}</Badge>;
      case "critical":
        return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">{t("adminDashboard.critical")}</Badge>;
      case "maintenance":
        return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">{t("adminDashboard.maintenance")}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("adminDashboard.title")}</h1>
            <p className="text-muted-foreground">{t("adminDashboard.subtitle")}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{t("adminDashboard.systemStatus")}:</span>
              {getStatusBadge(systemStatus)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("adminDashboard.tps")}</p>
                  <p className="text-lg font-bold">{loadingNetwork ? <Skeleton className="h-6 w-16" /> : formatNumber(networkStats?.tps || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Layers className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("adminDashboard.blockHeight")}</p>
                  <p className="text-lg font-bold">{loadingNetwork ? <Skeleton className="h-6 w-16" /> : formatNumber(networkStats?.blockHeight || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Server className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("adminDashboard.activeValidators")}</p>
                  <p className="text-lg font-bold">{validatorSummary.online}/{validatorSummary.online + validatorSummary.offline}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Globe className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("adminDashboard.networkUptime")}</p>
                  <p className="text-lg font-bold">99.98%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Activity className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("adminDashboard.pendingTx")}</p>
                  <p className="text-lg font-bold">{loadingNetwork ? <Skeleton className="h-6 w-16" /> : formatNumber(networkStats?.pendingTransactions || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <Clock className="h-4 w-4 text-cyan-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("adminDashboard.avgBlockTime")}</p>
                  <p className="text-lg font-bold">{loadingNetwork ? <Skeleton className="h-6 w-16" /> : `${networkStats?.avgBlockTime || 0}ms`}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Network Performance (24h)
              </CardTitle>
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
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Area type="monotone" dataKey="tps" stroke="#10b981" fill="url(#colorTps)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5" />
                  {t("adminDashboard.securityAlerts")}
                </CardTitle>
                <Link href="/admin/alerts">
                  <Button variant="ghost" size="sm">{t("adminDashboard.viewAll")}</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <p className="text-xl font-bold text-red-500">{alerts.filter(a => a.severity === "critical").length}</p>
                    <p className="text-xs text-muted-foreground">{t("adminDashboard.criticalAlerts")}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <p className="text-xl font-bold text-orange-500">{alerts.filter(a => a.severity === "high").length}</p>
                    <p className="text-xs text-muted-foreground">{t("adminDashboard.highAlerts")}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-yellow-500/10">
                    <p className="text-xl font-bold text-yellow-500">{alerts.filter(a => a.severity === "medium").length}</p>
                    <p className="text-xs text-muted-foreground">{t("adminDashboard.mediumAlerts")}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <p className="text-xl font-bold text-blue-500">{alerts.filter(a => a.severity === "low").length}</p>
                    <p className="text-xs text-muted-foreground">{t("adminDashboard.lowAlerts")}</p>
                  </div>
                </div>
                <Separator />
                <ScrollArea className="h-[140px]">
                  <div className="space-y-2">
                    {alerts.slice(0, 4).map((alert) => (
                      <div key={alert.id} className="flex items-start gap-2 p-2 rounded-lg hover-elevate cursor-pointer">
                        <AlertTriangle className={`h-4 w-4 mt-0.5 ${getSeverityColor(alert.severity)}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{alert.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{alert.message}</p>
                        </div>
                        <Badge variant={getSeverityBadgeVariant(alert.severity)} className="text-xs">
                          {alert.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5" />
                {t("adminDashboard.aiStatus")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {aiStatus.models.map((model) => (
                  <div key={model.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
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
                    <p className="text-lg font-bold">{formatNumber(aiStatus.totalDecisionsToday)}</p>
                    <p className="text-xs text-muted-foreground">{t("adminDashboard.decisionsToday")}</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{aiStatus.avgConfidence}%</p>
                    <p className="text-xs text-muted-foreground">{t("adminDashboard.avgConfidence")}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                {t("adminDashboard.systemResources")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t("adminDashboard.cpu")}</span>
                    <span className="font-medium">{systemResources.cpu}%</span>
                  </div>
                  <Progress value={systemResources.cpu} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t("adminDashboard.memory")}</span>
                    <span className="font-medium">{systemResources.memory}%</span>
                  </div>
                  <Progress value={systemResources.memory} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t("adminDashboard.disk")}</span>
                    <span className="font-medium">{systemResources.disk}%</span>
                  </div>
                  <Progress value={systemResources.disk} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t("adminDashboard.network")}</span>
                    <span className="font-medium">{systemResources.networkIO}%</span>
                  </div>
                  <Progress value={systemResources.networkIO} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Server className="h-5 w-5" />
                {t("adminDashboard.validatorHealth")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center mb-4">
                <div className="h-[120px] w-[120px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Online", value: validatorSummary.online },
                          { name: "Offline", value: validatorSummary.offline },
                          { name: "Jailed", value: validatorSummary.jailed },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={50}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {[COLORS[0], COLORS[1], COLORS[2]].map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="font-bold">{validatorSummary.online}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t("adminDashboard.onlineValidators")}</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span className="font-bold">{validatorSummary.offline}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t("adminDashboard.offlineValidators")}</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="font-bold">{validatorSummary.jailed}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t("adminDashboard.jailedValidators")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                {t("adminDashboard.bridgeStatus")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <p className="text-lg font-bold">{bridgeStatus.activeBridges}</p>
                  <p className="text-xs text-muted-foreground">{t("adminDashboard.activeBridges")}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <p className="text-lg font-bold">{bridgeStatus.pendingTransfers}</p>
                  <p className="text-xs text-muted-foreground">{t("adminDashboard.pendingTransfers")}</p>
                </div>
              </div>
              <div className="space-y-2">
                {bridgeStatus.chains.slice(0, 5).map((chain) => (
                  <div key={chain.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(chain.status)}
                      <span>{chain.name}</span>
                    </div>
                    {chain.pendingTx > 0 && (
                      <Badge variant="secondary" className="text-xs">{chain.pendingTx}</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                {t("adminDashboard.stakingMetrics")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t("adminDashboard.totalStaked")}</span>
                  <span className="font-bold">{formatTBURN(stakingMetrics.totalStaked)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t("adminDashboard.stakingRatio")}</span>
                  <span className="font-bold">{stakingMetrics.stakingRatio}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t("adminDashboard.avgApy")}</span>
                  <span className="font-bold text-green-500">{stakingMetrics.avgApy}%</span>
                </div>
                <Progress value={stakingMetrics.stakingRatio} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Flame className="h-5 w-5" />
                {t("adminDashboard.tokenEconomics")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t("adminDashboard.circulatingSupply")}</span>
                  <span className="font-bold">{formatTBURN(tokenEconomics.circulatingSupply)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t("adminDashboard.totalBurned")}</span>
                  <span className="font-bold text-orange-500">{formatTBURN(tokenEconomics.totalBurned)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t("adminDashboard.deflationary")}</span>
                  <div className="flex items-center gap-1">
                    <TrendingDown className="h-4 w-4 text-green-500" />
                    <span className="font-bold text-green-500">{tokenEconomics.deflationaryRate}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {t("adminDashboard.recentActivity")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[150px]">
                <div className="space-y-2">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover-elevate">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === "validator" ? "bg-green-500" :
                        activity.type === "governance" ? "bg-purple-500" :
                        activity.type === "bridge" ? "bg-blue-500" :
                        activity.type === "burn" ? "bg-orange-500" :
                        activity.type === "security" ? "bg-red-500" :
                        "bg-gray-500"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.target}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5" />
              {t("adminDashboard.quickActions")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Button variant="outline" className="h-auto flex-col py-4 gap-2" data-testid="button-pause-mainnet">
                <Pause className="h-5 w-5" />
                <span className="text-xs">{t("adminDashboard.pauseMainnet")}</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 gap-2" data-testid="button-restart-services">
                <RefreshCw className="h-5 w-5" />
                <span className="text-xs">{t("adminDashboard.restartServices")}</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 gap-2 text-red-500 hover:text-red-500" data-testid="button-emergency-shutdown">
                <Power className="h-5 w-5" />
                <span className="text-xs">{t("adminDashboard.emergencyShutdown")}</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 gap-2" data-testid="button-run-diagnostics">
                <Monitor className="h-5 w-5" />
                <span className="text-xs">{t("adminDashboard.runDiagnostics")}</span>
              </Button>
              <Link href="/admin/logs">
                <Button variant="outline" className="h-auto flex-col py-4 gap-2 w-full" data-testid="button-view-logs">
                  <Database className="h-5 w-5" />
                  <span className="text-xs">{t("adminDashboard.viewLogs")}</span>
                </Button>
              </Link>
              <Link href="/admin/reports">
                <Button variant="outline" className="h-auto flex-col py-4 gap-2 w-full" data-testid="button-generate-report">
                  <Activity className="h-5 w-5" />
                  <span className="text-xs">{t("adminDashboard.generateReport")}</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Server className="h-5 w-5" />
              {t("adminDashboard.topValidators")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-medium">Rank</th>
                    <th className="text-left py-2 px-4 font-medium">Validator</th>
                    <th className="text-right py-2 px-4 font-medium">Stake</th>
                    <th className="text-right py-2 px-4 font-medium">Uptime</th>
                    <th className="text-right py-2 px-4 font-medium">Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {validatorSummary.topValidators.map((validator, index) => (
                    <tr key={validator.address} className="border-b hover-elevate">
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="font-mono">#{index + 1}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{validator.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{validator.address}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono">{formatTBURN(validator.stake)}</td>
                      <td className="py-3 px-4 text-right">
                        <Badge className="bg-green-500/10 text-green-500">{validator.uptime}%</Badge>
                      </td>
                      <td className="py-3 px-4 text-right">{validator.commission}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
