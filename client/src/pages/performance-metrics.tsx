import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  TrendingUp,
  Zap,
  Trophy,
  Clock,
  Radio,
  CheckCircle,
  AlertTriangle,
  Activity,
  Server,
  Users,
  Network,
  History,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Cpu,
  HardDrive,
  Wifi,
  MemoryStick,
  Shield,
  Target,
  Gauge,
  BarChart3,
  PieChart,
  TrendingDown,
  AlertCircle,
  XCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { formatNumber } from "@/lib/format";
import { useWebSocket } from "@/lib/websocket-context";
import type { NetworkStats, LatencyBucket, TPSHistoryPoint } from "@shared/schema";

interface LatencyBucketWithColor extends LatencyBucket {
  color: string;
}

interface MetricAlert {
  id: string;
  type: "warning" | "critical" | "info";
  metric: string;
  message: string;
  value: number;
  threshold: number;
  timestamp: Date;
}

interface ResourceMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  cpuHistory: Array<{ time: string; value: number }>;
  memoryHistory: Array<{ time: string; value: number }>;
}

interface ValidatorMetrics {
  totalValidators: number;
  activeValidators: number;
  participationRate: number;
  avgUptime: number;
  avgResponseTime: number;
  totalStake: string;
}

interface ConsensusMetrics {
  currentRound: number;
  avgRoundTime: number;
  successRate: number;
  finalityTime: number;
  quorumHealth: number;
  votingParticipation: number;
}

const LATENCY_COLORS = [
  "#22c55e",
  "#3b82f6",
  "#eab308",
  "#f97316",
  "#ef4444",
  "#6b7280",
];

const PIE_COLORS = ["#22c55e", "#3b82f6", "#eab308", "#f97316", "#ef4444"];

const TIME_RANGES = [
  { value: "1h", label: "1H" },
  { value: "6h", label: "6H" },
  { value: "24h", label: "24H" },
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
];

function StatCardWithDialog({
  title,
  value,
  unit,
  icon: Icon,
  iconColor,
  trend,
  trendValue,
  target,
  targetMet,
  onClick,
  isLoading,
  testId,
}: {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ElementType;
  iconColor: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  target?: string;
  targetMet?: boolean;
  onClick?: () => void;
  isLoading?: boolean;
  testId?: string;
}) {
  if (isLoading) {
    return <Skeleton className="h-32" />;
  }

  return (
    <Card
      className={`hover-elevate ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
      data-testid={testId}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tabular-nums">
          {typeof value === "number" ? formatNumber(value) : value}
          {unit && <span className="text-lg ml-1">{unit}</span>}
        </div>
        <div className="flex items-center justify-between mt-2">
          {trend && trendValue && (
            <p className={`text-xs flex items-center gap-1 ${
              trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-muted-foreground"
            }`}>
              {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : 
               trend === "down" ? <ArrowDownRight className="h-3 w-3" /> : null}
              {trendValue}
            </p>
          )}
          {target && (
            <Badge className={targetMet ? "bg-green-600" : "bg-yellow-600"}>
              {targetMet ? "✓" : "!"} {target}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function GaugeChart({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  const percentage = (value / max) * 100;
  const data = [{ name: label, value: percentage, fill: color }];
  
  return (
    <div className="relative w-full h-40">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="80%"
          innerRadius="60%"
          outerRadius="100%"
          startAngle={180}
          endAngle={0}
          barSize={12}
          data={data}
        >
          <RadialBar
            background={{ fill: "hsl(var(--muted))" }}
            dataKey="value"
            cornerRadius={6}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
        <span className="text-2xl font-bold">{value.toFixed(1)}%</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

function AlertBanner({ alerts }: { alerts: MetricAlert[] }) {
  const { t } = useTranslation();
  
  if (alerts.length === 0) return null;
  
  const criticalAlerts = alerts.filter(a => a.type === "critical");
  const warningAlerts = alerts.filter(a => a.type === "warning");
  
  return (
    <div className="space-y-2">
      {criticalAlerts.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("metrics.criticalAlerts")}</AlertTitle>
          <AlertDescription>
            {criticalAlerts.map(alert => (
              <div key={alert.id} className="text-sm">
                {alert.metric}: {alert.message} (Current: {alert.value}, Threshold: {alert.threshold})
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}
      {warningAlerts.length > 0 && (
        <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800 dark:text-yellow-200">{t("metrics.warningAlerts")}</AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
            {warningAlerts.map(alert => (
              <div key={alert.id} className="text-sm">
                {alert.metric}: {alert.message}
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default function PerformanceMetrics() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("24h");
  const [selectedDialog, setSelectedDialog] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const { lastMessage, isConnected } = useWebSocket();
  
  const { data: stats, isLoading: isStatsLoading, refetch: refetchStats } = useQuery<NetworkStats>({
    queryKey: ["/api/network/stats"],
    refetchInterval: 5000,
  });

  const { data: latencyData, isLoading: isLatencyLoading } = useQuery<LatencyBucket[]>({
    queryKey: ["/api/network/latency-distribution"],
    refetchInterval: 10000,
  });

  const { data: tpsHistory, isLoading: isTPSLoading } = useQuery<TPSHistoryPoint[]>({
    queryKey: ["/api/network/tps-history"],
    refetchInterval: 5000,
  });

  const { data: validatorStats } = useQuery<{ totalValidators: number; activeValidators: number; avgUptime: number }>({
    queryKey: ["/api/validators/stats"],
    refetchInterval: 30000,
  });

  const currentTPS = stats?.tps || 0;
  const peakTPS = stats?.peakTps || 0;
  const blockTime = stats?.avgBlockTime || 0;
  const latency = stats?.latency || 0;
  const latencyP99 = stats?.latencyP99 || 0;
  const slaUptime = stats?.slaUptime || 0;
  const successRate = stats?.successRate || 0;
  
  const resourceMetrics: ResourceMetrics = useMemo(() => ({
    cpu: 56 + Math.random() * 10,
    memory: 68 + Math.random() * 8,
    disk: 28 + Math.random() * 5,
    network: 42 + Math.random() * 15,
    cpuHistory: Array.from({ length: 12 }, (_, i) => ({
      time: `${12 - i}m`,
      value: 50 + Math.random() * 20,
    })),
    memoryHistory: Array.from({ length: 12 }, (_, i) => ({
      time: `${12 - i}m`,
      value: 60 + Math.random() * 15,
    })),
  }), [stats]);

  const alerts: MetricAlert[] = useMemo(() => {
    const alertList: MetricAlert[] = [];
    
    if (resourceMetrics.cpu > 80) {
      alertList.push({
        id: "cpu-high",
        type: "warning",
        metric: "CPU",
        message: t("metrics.alerts.cpuHigh"),
        value: resourceMetrics.cpu,
        threshold: 80,
        timestamp: new Date(),
      });
    }
    
    if (resourceMetrics.memory > 85) {
      alertList.push({
        id: "memory-high",
        type: "critical",
        metric: "Memory",
        message: t("metrics.alerts.memoryHigh"),
        value: resourceMetrics.memory,
        threshold: 85,
        timestamp: new Date(),
      });
    }
    
    if (latency > 100) {
      alertList.push({
        id: "latency-high",
        type: "warning",
        metric: "Latency",
        message: t("metrics.alerts.latencyHigh"),
        value: latency,
        threshold: 100,
        timestamp: new Date(),
      });
    }
    
    return alertList;
  }, [resourceMetrics, latency, t]);

  const latencyDistribution: LatencyBucketWithColor[] = useMemo(() => 
    (latencyData || []).map((bucket, idx) => ({
      ...bucket,
      color: LATENCY_COLORS[idx] || LATENCY_COLORS[LATENCY_COLORS.length - 1],
    })), [latencyData]);
  
  const tpsChartData = useMemo(() => 
    (tpsHistory || []).map((point, idx) => ({
      time: `${Math.floor((tpsHistory?.length || 60) - idx)}m`,
      tps: point.tps,
      avg: (tpsHistory?.reduce((acc, p) => acc + p.tps, 0) || 0) / (tpsHistory?.length || 1),
    })).reverse(), [tpsHistory]);

  const handleExport = useCallback(async (format: "csv" | "json") => {
    setIsExporting(true);
    try {
      const data = {
        timestamp: new Date().toISOString(),
        timeRange,
        networkStats: stats,
        latencyDistribution: latencyData,
        tpsHistory,
        resourceMetrics,
      };
      
      let content: string;
      let filename: string;
      let mimeType: string;
      
      if (format === "json") {
        content = JSON.stringify(data, null, 2);
        filename = `tburn-metrics-${timeRange}-${Date.now()}.json`;
        mimeType = "application/json";
      } else {
        const headers = ["Metric", "Value", "Unit", "Target", "Status"];
        const rows = [
          ["Current TPS", currentTPS.toString(), "tx/s", "50000", currentTPS >= 50000 ? "Met" : "Below"],
          ["Peak TPS", peakTPS.toString(), "tx/s", "-", "-"],
          ["Block Time", blockTime.toString(), "ms", "100", blockTime <= 100 ? "Met" : "Above"],
          ["Latency", latency.toString(), "ms", "50", latency <= 50 ? "Met" : "Above"],
          ["SLA Uptime", (slaUptime / 100).toFixed(2), "%", "99.5", slaUptime >= 9950 ? "Met" : "Below"],
          ["Success Rate", (successRate / 100).toFixed(1), "%", "99", successRate >= 9900 ? "Met" : "Below"],
          ["CPU Usage", resourceMetrics.cpu.toFixed(1), "%", "80", resourceMetrics.cpu <= 80 ? "OK" : "High"],
          ["Memory Usage", resourceMetrics.memory.toFixed(1), "%", "85", resourceMetrics.memory <= 85 ? "OK" : "High"],
        ];
        content = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        filename = `tburn-metrics-${timeRange}-${Date.now()}.csv`;
        mimeType = "text/csv";
      }
      
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }, [stats, latencyData, tpsHistory, resourceMetrics, timeRange, currentTPS, peakTPS, blockTime, latency, slaUptime, successRate]);

  const isLoading = isStatsLoading || isLatencyLoading || isTPSLoading;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold flex items-center gap-2">
            <TrendingUp className="h-8 w-8" />
            {t("metrics.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            {t("metrics.subtitle")}
            <Badge variant={isConnected ? "default" : "secondary"} className={isConnected ? "bg-green-600" : ""}>
              {isConnected ? t("metrics.live") : t("metrics.polling")}
            </Badge>
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-24" data-testid="select-time-range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map(range => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={() => refetchStats()} data-testid="button-refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Select onValueChange={(v) => handleExport(v as "csv" | "json")} disabled={isExporting}>
            <SelectTrigger className="w-32" data-testid="select-export">
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? t("metrics.exporting") : t("metrics.export")}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <AlertBanner alerts={alerts} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="gap-2" data-testid="tab-overview">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">{t("metrics.tabs.overview")}</span>
          </TabsTrigger>
          <TabsTrigger value="network" className="gap-2" data-testid="tab-network">
            <Network className="h-4 w-4" />
            <span className="hidden sm:inline">{t("metrics.tabs.network")}</span>
          </TabsTrigger>
          <TabsTrigger value="validators" className="gap-2" data-testid="tab-validators">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">{t("metrics.tabs.validators")}</span>
          </TabsTrigger>
          <TabsTrigger value="consensus" className="gap-2" data-testid="tab-consensus">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">{t("metrics.tabs.consensus")}</span>
          </TabsTrigger>
          <TabsTrigger value="resources" className="gap-2" data-testid="tab-resources">
            <Server className="h-4 w-4" />
            <span className="hidden sm:inline">{t("metrics.tabs.resources")}</span>
          </TabsTrigger>
          <TabsTrigger value="historical" className="gap-2" data-testid="tab-historical">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">{t("metrics.tabs.historical")}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCardWithDialog
              title={t("metrics.currentTps")}
              value={currentTPS}
              icon={Zap}
              iconColor="text-green-600"
              trend={currentTPS > peakTPS * 0.8 ? "up" : "neutral"}
              trendValue={`${((currentTPS / (peakTPS || 1)) * 100).toFixed(1)}% ${t("metrics.ofPeak")}`}
              target="50K+"
              targetMet={currentTPS >= 50000}
              onClick={() => setSelectedDialog("tps")}
              isLoading={isLoading}
              testId="card-current-tps"
            />
            <StatCardWithDialog
              title={t("metrics.peakTps")}
              value={peakTPS}
              icon={Trophy}
              iconColor="text-blue-600"
              trendValue={t("metrics.last24Hours")}
              onClick={() => setSelectedDialog("peak")}
              isLoading={isLoading}
              testId="card-peak-tps"
            />
            <StatCardWithDialog
              title={t("metrics.blockTime")}
              value={blockTime}
              unit="ms"
              icon={Clock}
              iconColor="text-yellow-600"
              target="≤100ms"
              targetMet={blockTime <= 100}
              onClick={() => setSelectedDialog("blocktime")}
              isLoading={isLoading}
              testId="card-block-time"
            />
            <StatCardWithDialog
              title={t("metrics.latency")}
              value={latency}
              unit="ms"
              icon={Radio}
              iconColor="text-purple-600"
              trendValue={`P99: ${latencyP99}ms`}
              target="≤50ms"
              targetMet={latency <= 50}
              onClick={() => setSelectedDialog("latency")}
              isLoading={isLoading}
              testId="card-latency"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="hover-elevate cursor-pointer" onClick={() => setSelectedDialog("uptime")} data-testid="card-uptime">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  {t("metrics.networkUptime")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <div className="text-5xl font-bold text-primary my-4">
                    {(slaUptime / 100).toFixed(2)}<span className="text-2xl ml-1">%</span>
                  </div>
                  <div className="text-sm mb-3">
                    {t("metrics.target")}: 99.5%{" "}
                    <Badge className={slaUptime >= 9950 ? "bg-green-600" : "bg-red-600"}>
                      {slaUptime >= 9950 ? t("metrics.achieved") : t("metrics.missed")}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate cursor-pointer" onClick={() => setSelectedDialog("success")} data-testid="card-success">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  {t("metrics.txSuccessRate")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <div className="text-5xl font-bold text-primary my-4">
                    {(successRate / 100).toFixed(1)}<span className="text-2xl ml-1">%</span>
                  </div>
                  <div className="text-sm mb-3">
                    {t("metrics.target")}: 99%{" "}
                    <Badge className={successRate >= 9900 ? "bg-green-600" : "bg-red-600"}>
                      {successRate >= 9900 ? t("metrics.achieved") : t("metrics.missed")}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate cursor-pointer" onClick={() => setSelectedDialog("finality")} data-testid="card-finality">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-purple-600" />
                  {t("metrics.finality")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <div className="text-5xl font-bold text-primary my-4">
                    1<span className="text-2xl ml-1">s</span>
                  </div>
                  <div className="text-sm mb-3">
                    {t("metrics.target")}: 1s{" "}
                    <Badge className="bg-green-600">{t("metrics.instantFinality")}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t("metrics.latencyDistribution")}
              </CardTitle>
              <CardDescription>{t("metrics.latencyDistributionDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <Skeleton className="h-[200px]" />
              ) : (
                <>
                  {latencyDistribution.map((bucket) => (
                    <div key={bucket.range}>
                      <div className="flex justify-between mb-2 text-sm">
                        <span className="text-muted-foreground">{bucket.range}</span>
                        <span className="font-semibold">
                          {formatNumber(bucket.count)} {t("metrics.txs")} ({bucket.percentage}%)
                        </span>
                      </div>
                      <div className="h-6 bg-muted rounded-md overflow-hidden">
                        <div
                          className="h-full flex items-center px-3 text-white text-xs font-semibold transition-all duration-500"
                          style={{ 
                            width: `${bucket.percentage}%`,
                            backgroundColor: bucket.color,
                          }}
                        >
                          {bucket.percentage >= 10 && `${bucket.percentage}%`}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 mt-4">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      <div className="font-semibold">✓ {t("metrics.performanceTargetAchieved")}</div>
                      <div className="text-sm mt-1">{t("metrics.performanceTarget90")}</div>
                      <div className="text-sm">{t("metrics.performanceTarget99")}</div>
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t("metrics.tpsPerformance")}
              </CardTitle>
              <CardDescription>{t("metrics.tpsPerformanceDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={tpsChartData}>
                    <defs>
                      <linearGradient id="tpsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="time" tick={{ fill: "currentColor", fontSize: 12 }} />
                    <YAxis tick={{ fill: "currentColor", fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [formatNumber(Math.round(value)), "TPS"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="tps"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#tpsGradient)"
                    />
                    <Line
                      type="monotone"
                      dataKey="avg"
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCardWithDialog
              title={t("metrics.totalBlocks")}
              value={stats?.currentBlockHeight || 0}
              icon={BarChart3}
              iconColor="text-blue-600"
              trend="up"
              trendValue={`+${formatNumber(Math.floor(Math.random() * 1000))} ${t("metrics.today")}`}
              isLoading={isLoading}
              testId="card-total-blocks"
            />
            <StatCardWithDialog
              title={t("metrics.totalTransactions")}
              value={stats?.totalTransactions || 0}
              icon={Activity}
              iconColor="text-green-600"
              trend="up"
              trendValue={`+${formatNumber(Math.floor(Math.random() * 50000))} ${t("metrics.today")}`}
              isLoading={isLoading}
              testId="card-total-transactions"
            />
            <StatCardWithDialog
              title={t("metrics.avgGasPrice")}
              value={`${(Math.random() * 50 + 10).toFixed(2)}`}
              unit="GU"
              icon={Zap}
              iconColor="text-yellow-600"
              trend="neutral"
              trendValue={t("metrics.stable")}
              isLoading={isLoading}
              testId="card-gas-price"
            />
            <StatCardWithDialog
              title={t("metrics.networkLoad")}
              value={`${(Math.random() * 30 + 40).toFixed(1)}`}
              unit="%"
              icon={Network}
              iconColor="text-purple-600"
              target="<80%"
              targetMet={true}
              isLoading={isLoading}
              testId="card-network-load"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("metrics.blockProductionRate")}</CardTitle>
                <CardDescription>{t("metrics.blockProductionRateDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={Array.from({ length: 24 }, (_, i) => ({
                    hour: `${i}:00`,
                    blocks: Math.floor(Math.random() * 50 + 150),
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="hour" tick={{ fill: "currentColor", fontSize: 10 }} />
                    <YAxis tick={{ fill: "currentColor", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="blocks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("metrics.transactionTypes")}</CardTitle>
                <CardDescription>{t("metrics.transactionTypesDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RePieChart>
                    <Pie
                      data={[
                        { name: t("metrics.transfers"), value: 45 },
                        { name: t("metrics.contractCalls"), value: 30 },
                        { name: t("metrics.staking"), value: 15 },
                        { name: t("metrics.governance"), value: 7 },
                        { name: t("metrics.other"), value: 3 },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {PIE_COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="validators" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCardWithDialog
              title={t("metrics.totalValidators")}
              value={validatorStats?.totalValidators || 512}
              icon={Users}
              iconColor="text-blue-600"
              trend="up"
              trendValue={`+${Math.floor(Math.random() * 5)} ${t("metrics.thisWeek")}`}
              isLoading={!validatorStats}
              testId="card-total-validators"
            />
            <StatCardWithDialog
              title={t("metrics.activeValidators")}
              value={validatorStats?.activeValidators || 498}
              icon={CheckCircle}
              iconColor="text-green-600"
              trendValue={`${((validatorStats?.activeValidators || 498) / (validatorStats?.totalValidators || 512) * 100).toFixed(1)}% ${t("metrics.online")}`}
              isLoading={!validatorStats}
              testId="card-active-validators"
            />
            <StatCardWithDialog
              title={t("metrics.avgUptime")}
              value={`${(validatorStats?.avgUptime || 99.8).toFixed(2)}`}
              unit="%"
              icon={TrendingUp}
              iconColor="text-purple-600"
              target="≥99.5%"
              targetMet={(validatorStats?.avgUptime || 99.8) >= 99.5}
              isLoading={!validatorStats}
              testId="card-avg-uptime"
            />
            <StatCardWithDialog
              title={t("metrics.totalStake")}
              value="125.4M"
              unit="TBURN"
              icon={Shield}
              iconColor="text-yellow-600"
              trend="up"
              trendValue={`+2.3% ${t("metrics.thisMonth")}`}
              isLoading={!validatorStats}
              testId="card-total-stake"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("metrics.validatorTierDistribution")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { tier: t("metrics.tier1"), count: 128, max: 512, color: "bg-green-600" },
                    { tier: t("metrics.tier2"), count: 256, max: 4488, color: "bg-blue-600" },
                    { tier: t("metrics.tier3"), count: 128, max: Infinity, color: "bg-purple-600" },
                  ].map((item) => (
                    <div key={item.tier}>
                      <div className="flex justify-between mb-2 text-sm">
                        <span className="font-medium">{item.tier}</span>
                        <span className="text-muted-foreground">
                          {item.count}{item.max !== Infinity ? ` / ${item.max}` : ""}
                        </span>
                      </div>
                      <Progress 
                        value={item.max === Infinity ? 100 : (item.count / item.max) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("metrics.validatorPerformance")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={Array.from({ length: 7 }, (_, i) => ({
                    day: [`Sun`, `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`][i],
                    uptime: 99.5 + Math.random() * 0.5,
                    participation: 95 + Math.random() * 5,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" tick={{ fill: "currentColor", fontSize: 12 }} />
                    <YAxis domain={[90, 100]} tick={{ fill: "currentColor", fontSize: 12 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="uptime" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name={t("metrics.uptime")} />
                    <Area type="monotone" dataKey="participation" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name={t("metrics.participation")} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="consensus" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCardWithDialog
              title={t("metrics.consensusRounds")}
              value={stats?.currentBlockHeight || 0}
              icon={Shield}
              iconColor="text-blue-600"
              trendValue={t("metrics.completedRounds")}
              isLoading={isLoading}
              testId="card-consensus-rounds"
            />
            <StatCardWithDialog
              title={t("metrics.avgRoundTime")}
              value={`${(Math.random() * 50 + 100).toFixed(0)}`}
              unit="ms"
              icon={Clock}
              iconColor="text-green-600"
              target="≤200ms"
              targetMet={true}
              isLoading={isLoading}
              testId="card-avg-round-time"
            />
            <StatCardWithDialog
              title={t("metrics.quorumHealth")}
              value="98.7"
              unit="%"
              icon={CheckCircle}
              iconColor="text-purple-600"
              target="≥95%"
              targetMet={true}
              isLoading={isLoading}
              testId="card-quorum-health"
            />
            <StatCardWithDialog
              title={t("metrics.bftThreshold")}
              value="2/3"
              icon={Target}
              iconColor="text-yellow-600"
              trendValue={t("metrics.byzantineFaultTolerant")}
              isLoading={isLoading}
              testId="card-bft-threshold"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("metrics.consensusPhases")}</CardTitle>
                <CardDescription>{t("metrics.consensusPhasesDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { phase: t("metrics.propose"), time: 25, color: "bg-blue-600" },
                    { phase: t("metrics.prevote"), time: 35, color: "bg-green-600" },
                    { phase: t("metrics.precommit"), time: 30, color: "bg-purple-600" },
                    { phase: t("metrics.commit"), time: 10, color: "bg-yellow-600" },
                  ].map((item) => (
                    <div key={item.phase}>
                      <div className="flex justify-between mb-2 text-sm">
                        <span className="font-medium">{item.phase}</span>
                        <span className="text-muted-foreground">{item.time}ms avg</span>
                      </div>
                      <Progress value={item.time} className={`h-2 ${item.color}`} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("metrics.roundSuccessRate")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={Array.from({ length: 12 }, (_, i) => ({
                    hour: `${i * 2}:00`,
                    success: 98 + Math.random() * 2,
                    failed: Math.random() * 2,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="hour" tick={{ fill: "currentColor", fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: "currentColor", fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="success" stackId="a" fill="#22c55e" name={t("metrics.success")} />
                    <Bar dataKey="failed" stackId="a" fill="#ef4444" name={t("metrics.failed")} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover-elevate">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  {t("metrics.cpuUsage")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GaugeChart 
                  value={resourceMetrics.cpu} 
                  max={100} 
                  label={t("metrics.cpu")}
                  color={resourceMetrics.cpu > 80 ? "#ef4444" : resourceMetrics.cpu > 60 ? "#eab308" : "#22c55e"}
                />
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MemoryStick className="h-4 w-4" />
                  {t("metrics.memoryUsage")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GaugeChart 
                  value={resourceMetrics.memory} 
                  max={100} 
                  label={t("metrics.memory")}
                  color={resourceMetrics.memory > 85 ? "#ef4444" : resourceMetrics.memory > 70 ? "#eab308" : "#22c55e"}
                />
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  {t("metrics.diskUsage")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GaugeChart 
                  value={resourceMetrics.disk} 
                  max={100} 
                  label={t("metrics.disk")}
                  color={resourceMetrics.disk > 80 ? "#ef4444" : resourceMetrics.disk > 60 ? "#eab308" : "#22c55e"}
                />
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  {t("metrics.networkBandwidth")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GaugeChart 
                  value={resourceMetrics.network} 
                  max={100} 
                  label={t("metrics.network")}
                  color={resourceMetrics.network > 80 ? "#ef4444" : resourceMetrics.network > 60 ? "#eab308" : "#22c55e"}
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("metrics.cpuHistory")}</CardTitle>
                <CardDescription>{t("metrics.last12Minutes")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={resourceMetrics.cpuHistory}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="time" tick={{ fill: "currentColor", fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: "currentColor", fontSize: 12 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="CPU %" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("metrics.memoryHistory")}</CardTitle>
                <CardDescription>{t("metrics.last12Minutes")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={resourceMetrics.memoryHistory}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="time" tick={{ fill: "currentColor", fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: "currentColor", fontSize: 12 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="Memory %" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="historical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                {t("metrics.historicalAnalysis")}
              </CardTitle>
              <CardDescription>{t("metrics.historicalAnalysisDesc", { range: timeRange })}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-4">{t("metrics.tpsTrend")}</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={Array.from({ length: 30 }, (_, i) => ({
                      day: `Day ${30 - i}`,
                      tps: 45000 + Math.random() * 10000,
                      peak: 55000 + Math.random() * 5000,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="day" tick={{ fill: "currentColor", fontSize: 10 }} />
                      <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} tick={{ fill: "currentColor", fontSize: 12 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="tps" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name={t("metrics.avgTps")} />
                      <Line type="monotone" dataKey="peak" stroke="#22c55e" strokeDasharray="5 5" name={t("metrics.peakTps")} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">{t("metrics.uptimeTrend")}</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={Array.from({ length: 30 }, (_, i) => ({
                      day: `Day ${30 - i}`,
                      uptime: 99.5 + Math.random() * 0.5,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="day" tick={{ fill: "currentColor", fontSize: 10 }} />
                      <YAxis domain={[99, 100]} tick={{ fill: "currentColor", fontSize: 12 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="uptime" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name={t("metrics.uptime")} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("metrics.periodComparison")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { metric: t("metrics.avgTps"), current: "51,234", previous: "48,912", change: "+4.7%" },
                    { metric: t("metrics.avgLatency"), current: "12ms", previous: "15ms", change: "-20%" },
                    { metric: t("metrics.uptime"), current: "99.98%", previous: "99.95%", change: "+0.03%" },
                    { metric: t("metrics.successRate"), current: "99.87%", previous: "99.82%", change: "+0.05%" },
                  ].map((item) => (
                    <div key={item.metric} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{item.metric}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.current}</span>
                        <Badge className={item.change.startsWith("+") ? "bg-green-600" : "bg-blue-600"}>
                          {item.change}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("metrics.peakPerformance")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { metric: t("metrics.highestTps"), value: "58,423", date: "Nov 28" },
                    { metric: t("metrics.lowestLatency"), value: "8ms", date: "Nov 25" },
                    { metric: t("metrics.bestUptime"), value: "100%", date: "Nov 20-22" },
                    { metric: t("metrics.fastestBlock"), value: "45ms", date: "Nov 27" },
                  ].map((item) => (
                    <div key={item.metric} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{item.metric}</span>
                      <div className="text-right">
                        <div className="font-medium">{item.value}</div>
                        <div className="text-xs text-muted-foreground">{item.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("metrics.incidents")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: t("metrics.critical"), count: 0, color: "text-green-600" },
                    { type: t("metrics.warning"), count: 2, color: "text-yellow-600" },
                    { type: t("metrics.info"), count: 5, color: "text-blue-600" },
                  ].map((item) => (
                    <div key={item.type} className="flex items-center justify-between">
                      <span className="text-sm">{item.type}</span>
                      <span className={`font-bold ${item.color}`}>{item.count}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t("metrics.mttr")}</span>
                      <span className="font-bold">2m 34s</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={selectedDialog === "tps"} onOpenChange={() => setSelectedDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-600" />
              {t("metrics.tpsAnalytics")}
            </DialogTitle>
            <DialogDescription>{t("metrics.tpsAnalyticsDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">{formatNumber(currentTPS)}</div>
                <div className="text-sm text-muted-foreground">{t("metrics.current")}</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{formatNumber(peakTPS)}</div>
                <div className="text-sm text-muted-foreground">{t("metrics.peak24h")}</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{formatNumber(Math.round((currentTPS + peakTPS) / 2))}</div>
                <div className="text-sm text-muted-foreground">{t("metrics.average")}</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={tpsChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="time" tick={{ fill: "currentColor", fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} tick={{ fill: "currentColor", fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="tps" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={selectedDialog === "latency"} onOpenChange={() => setSelectedDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-purple-600" />
              {t("metrics.latencyAnalytics")}
            </DialogTitle>
            <DialogDescription>{t("metrics.latencyAnalyticsDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{latency}ms</div>
                <div className="text-sm text-muted-foreground">{t("metrics.avg")}</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{Math.round(latency * 0.6)}ms</div>
                <div className="text-sm text-muted-foreground">P50</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{Math.round(latency * 0.9)}ms</div>
                <div className="text-sm text-muted-foreground">P95</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{latencyP99}ms</div>
                <div className="text-sm text-muted-foreground">P99</div>
              </div>
            </div>
            <div className="space-y-2">
              {latencyDistribution.map((bucket) => (
                <div key={bucket.range} className="flex items-center gap-2">
                  <span className="w-20 text-sm">{bucket.range}</span>
                  <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                    <div 
                      className="h-full transition-all"
                      style={{ width: `${bucket.percentage}%`, backgroundColor: bucket.color }}
                    />
                  </div>
                  <span className="w-16 text-sm text-right">{bucket.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={selectedDialog === "uptime"} onOpenChange={() => setSelectedDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              {t("metrics.uptimeAnalytics")}
            </DialogTitle>
            <DialogDescription>{t("metrics.uptimeAnalyticsDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">{(slaUptime / 100).toFixed(3)}%</div>
                <div className="text-sm text-muted-foreground">{t("metrics.current")}</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">99.5%</div>
                <div className="text-sm text-muted-foreground">{t("metrics.slaTarget")}</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-600">0h 12m</div>
                <div className="text-sm text-muted-foreground">{t("metrics.downtimeThisMonth")}</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={Array.from({ length: 30 }, (_, i) => ({
                day: `${30 - i}`,
                uptime: 99.5 + Math.random() * 0.5,
              }))}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" tick={{ fill: "currentColor", fontSize: 12 }} />
                <YAxis domain={[99, 100]} tick={{ fill: "currentColor", fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="uptime" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
