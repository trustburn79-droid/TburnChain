import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Activity,
  Shield,
  RefreshCw,
  Download,
  ArrowUp,
  ArrowDown,
  AlertCircle,
} from "lucide-react";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";

interface SLAMetric {
  name: string;
  target: number;
  current: number;
  unit: string;
  status: "met" | "at-risk" | "breached";
  trend: "up" | "down" | "stable";
  history: { period: string; value: number }[];
}

interface SLAIncident {
  id: string;
  type: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  impact: "minor" | "major" | "critical";
  rootCause: string;
  resolved: boolean;
}

interface SLAData {
  metrics: SLAMetric[];
  incidents: SLAIncident[];
  monthlyUptimeData: { month: string; uptime: number; target: number }[];
  slaComplianceData: { name: string; value: number; color: string }[];
}

export default function SLAMonitoring() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: slaData, isLoading, error, refetch } = useQuery<SLAData>({
    queryKey: ["/api/admin/sla"],
  });

  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: t("adminSla.refreshed"),
      description: t("adminSla.refreshedDesc"),
    });
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      timeRange,
      metrics: slaMetrics,
      incidents,
      monthlyUptimeData,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sla-report-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: t("adminSla.exported"),
      description: t("adminSla.exportedDesc"),
    });
  }, [timeRange, toast, t]);

  const slaMetrics: SLAMetric[] = slaData?.metrics || [
    {
      name: t("adminSla.metrics.uptime"),
      target: 99.9,
      current: 99.97,
      unit: "%",
      status: "met",
      trend: "up",
      history: Array.from({ length: 30 }, (_, i) => ({
        period: `${t("adminSla.day")} ${i + 1}`,
        value: 99.9 + Math.random() * 0.1,
      })),
    },
    {
      name: t("adminSla.metrics.txLatency"),
      target: 100,
      current: 45,
      unit: "ms",
      status: "met",
      trend: "stable",
      history: Array.from({ length: 30 }, (_, i) => ({
        period: `${t("adminSla.day")} ${i + 1}`,
        value: 40 + Math.random() * 20,
      })),
    },
    {
      name: t("adminSla.metrics.tpsCapacity"),
      target: 500000,
      current: 520000,
      unit: "tx/s",
      status: "met",
      trend: "up",
      history: Array.from({ length: 30 }, (_, i) => ({
        period: `${t("adminSla.day")} ${i + 1}`,
        value: 480000 + Math.random() * 50000,
      })),
    },
    {
      name: t("adminSla.metrics.blockTime"),
      target: 500,
      current: 498,
      unit: "ms",
      status: "met",
      trend: "stable",
      history: Array.from({ length: 30 }, (_, i) => ({
        period: `${t("adminSla.day")} ${i + 1}`,
        value: 490 + Math.random() * 20,
      })),
    },
    {
      name: t("adminSla.metrics.apiResponse"),
      target: 200,
      current: 156,
      unit: "ms",
      status: "met",
      trend: "down",
      history: Array.from({ length: 30 }, (_, i) => ({
        period: `${t("adminSla.day")} ${i + 1}`,
        value: 140 + Math.random() * 40,
      })),
    },
    {
      name: t("adminSla.metrics.errorRate"),
      target: 0.1,
      current: 0.02,
      unit: "%",
      status: "met",
      trend: "down",
      history: Array.from({ length: 30 }, (_, i) => ({
        period: `${t("adminSla.day")} ${i + 1}`,
        value: 0.01 + Math.random() * 0.05,
      })),
    },
  ];

  const incidents: SLAIncident[] = slaData?.incidents || [
    {
      id: "INC-001",
      type: t("adminSla.incidentTypes.networkLatency"),
      startTime: "2024-12-01T10:30:00Z",
      endTime: "2024-12-01T10:45:00Z",
      duration: 15,
      impact: "minor",
      rootCause: t("adminSla.rootCauses.networkCongestion"),
      resolved: true,
    },
    {
      id: "INC-002",
      type: t("adminSla.incidentTypes.validatorSync"),
      startTime: "2024-11-28T14:00:00Z",
      endTime: "2024-11-28T14:20:00Z",
      duration: 20,
      impact: "minor",
      rootCause: t("adminSla.rootCauses.diskIO"),
      resolved: true,
    },
    {
      id: "INC-003",
      type: t("adminSla.incidentTypes.apiTimeout"),
      startTime: "2024-11-25T08:15:00Z",
      endTime: "2024-11-25T08:35:00Z",
      duration: 20,
      impact: "major",
      rootCause: t("adminSla.rootCauses.memoryLeak"),
      resolved: true,
    },
  ];

  const monthlyUptimeData = slaData?.monthlyUptimeData || [
    { month: t("adminSla.months.jul"), uptime: 99.95, target: 99.9 },
    { month: t("adminSla.months.aug"), uptime: 99.98, target: 99.9 },
    { month: t("adminSla.months.sep"), uptime: 99.92, target: 99.9 },
    { month: t("adminSla.months.oct"), uptime: 99.99, target: 99.9 },
    { month: t("adminSla.months.nov"), uptime: 99.96, target: 99.9 },
    { month: t("adminSla.months.dec"), uptime: 99.97, target: 99.9 },
  ];

  const slaComplianceData = slaData?.slaComplianceData || [
    { name: t("adminSla.status.met"), value: 6, color: "hsl(var(--chart-1))" },
    { name: t("adminSla.status.atRisk"), value: 0, color: "hsl(var(--chart-3))" },
    { name: t("adminSla.status.breached"), value: 0, color: "hsl(var(--chart-5))" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "met": return "text-green-500";
      case "at-risk": return "text-yellow-500";
      case "breached": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "met": return <Badge className="bg-green-500">{t("adminSla.status.met")}</Badge>;
      case "at-risk": return <Badge className="bg-yellow-500">{t("adminSla.status.atRisk")}</Badge>;
      case "breached": return <Badge className="bg-red-500">{t("adminSla.status.breached")}</Badge>;
      default: return <Badge>{t("adminSla.status.unknown")}</Badge>;
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "critical": return <Badge className="bg-red-500">{t("adminSla.impact.critical")}</Badge>;
      case "major": return <Badge className="bg-orange-500">{t("adminSla.impact.major")}</Badge>;
      case "minor": return <Badge className="bg-yellow-500">{t("adminSla.impact.minor")}</Badge>;
      default: return <Badge>{t("adminSla.status.unknown")}</Badge>;
    }
  };

  const metCount = slaMetrics.filter(m => m.status === "met").length;
  const totalDowntimeMinutes = incidents.reduce((sum, inc) => sum + inc.duration, 0);
  const mttr = incidents.length > 0 ? Math.round(totalDowntimeMinutes / incidents.length) : 0;

  if (error) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="container max-w-[1800px] mx-auto p-6">
          <Card className="border-destructive">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <div className="flex-1">
                  <h3 className="font-semibold">{t("adminSla.errorTitle")}</h3>
                  <p className="text-sm text-muted-foreground">{t("adminSla.errorDescription")}</p>
                </div>
                <Button onClick={() => refetch()} data-testid="button-retry-sla">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t("adminSla.retry")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-80 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-testid="sla-monitoring-page">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-sla-title">
              <Clock className="h-8 w-8" />
              {t("adminSla.title")}
            </h1>
            <p className="text-muted-foreground" data-testid="text-sla-description">
              {t("adminSla.description")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32" data-testid="select-time-range">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">{t("adminSla.timeRanges.7d")}</SelectItem>
                <SelectItem value="30d">{t("adminSla.timeRanges.30d")}</SelectItem>
                <SelectItem value="90d">{t("adminSla.timeRanges.90d")}</SelectItem>
                <SelectItem value="1y">{t("adminSla.timeRanges.1y")}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleRefresh} data-testid="button-refresh-sla">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminSla.refresh")}
            </Button>
            <Button variant="outline" onClick={handleExport} data-testid="button-export-report">
              <Download className="h-4 w-4 mr-2" />
              {t("adminSla.exportReport")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-green-500" data-testid="card-sla-compliance">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminSla.stats.compliance")}</p>
                  <p className="text-3xl font-bold text-green-500" data-testid="text-compliance">{metCount}/{slaMetrics.length}</p>
                  <p className="text-xs text-muted-foreground">{t("adminSla.stats.allTargetsMet")}</p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-current-uptime">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminSla.stats.currentUptime")}</p>
                  <p className="text-3xl font-bold" data-testid="text-uptime">99.97%</p>
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <ArrowUp className="h-3 w-3" />
                    {t("adminSla.stats.vsTarget")}
                  </p>
                </div>
                <Activity className="h-10 w-10 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-mttr">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminSla.stats.mttr")}</p>
                  <p className="text-3xl font-bold" data-testid="text-mttr">{mttr}m</p>
                  <p className="text-xs text-muted-foreground">{t("adminSla.stats.mttrDesc")}</p>
                </div>
                <Clock className="h-10 w-10 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-incidents">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminSla.stats.incidents30d")}</p>
                  <p className="text-3xl font-bold" data-testid="text-incidents">{incidents.length}</p>
                  <p className="text-xs text-green-500">{t("adminSla.stats.allResolved")}</p>
                </div>
                <Shield className="h-10 w-10 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList data-testid="tabs-sla">
            <TabsTrigger value="overview" data-testid="tab-overview">{t("adminSla.tabs.overview")}</TabsTrigger>
            <TabsTrigger value="metrics" data-testid="tab-metrics">{t("adminSla.tabs.metrics")}</TabsTrigger>
            <TabsTrigger value="incidents" data-testid="tab-incidents">{t("adminSla.tabs.incidents")}</TabsTrigger>
            <TabsTrigger value="reports" data-testid="tab-reports">{t("adminSla.tabs.reports")}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2" data-testid="card-uptime-trend">
                <CardHeader>
                  <CardTitle>{t("adminSla.charts.uptimeTrend")}</CardTitle>
                  <CardDescription>{t("adminSla.charts.uptimeTrendDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyUptimeData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis domain={[99.8, 100]} className="text-xs" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                        />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="uptime" 
                          stroke="hsl(var(--primary))" 
                          fill="hsl(var(--primary) / 0.2)"
                          name={t("adminSla.charts.actualUptime")}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="target" 
                          stroke="hsl(var(--chart-5))" 
                          strokeDasharray="5 5"
                          name={t("adminSla.charts.target")}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-status-distribution">
                <CardHeader>
                  <CardTitle>{t("adminSla.charts.statusDistribution")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={slaComplianceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {slaComplianceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-4 mt-4">
                    {slaComplianceData.map((item, index) => (
                      <div key={item.name} className="flex items-center gap-2" data-testid={`legend-item-${index}`}>
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card data-testid="card-metrics-overview">
              <CardHeader>
                <CardTitle>{t("adminSla.metricsOverview.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {slaMetrics.map((metric, index) => (
                    <div key={metric.name} className="p-4 border rounded-lg space-y-3" data-testid={`metric-card-${index}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{metric.name}</span>
                        {getStatusBadge(metric.status)}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                          {metric.current.toLocaleString()}{metric.unit}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          / {metric.target.toLocaleString()}{metric.unit} {t("adminSla.metricsOverview.target")}
                        </span>
                      </div>
                      <Progress 
                        value={
                          metric.name === t("adminSla.metrics.errorRate") || metric.name === t("adminSla.metrics.txLatency") || metric.name === t("adminSla.metrics.blockTime") || metric.name === t("adminSla.metrics.apiResponse")
                            ? Math.max(0, 100 - (metric.current / metric.target) * 100)
                            : Math.min(100, (metric.current / metric.target) * 100)
                        }
                      />
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {metric.trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
                        {metric.trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
                        {metric.trend === "stable" && <Activity className="h-3 w-3" />}
                        <span>{t("adminSla.metricsOverview.trend")}: {t(`adminSla.trends.${metric.trend}`)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <Card data-testid="card-detailed-metrics">
              <CardHeader>
                <CardTitle>{t("adminSla.detailedMetrics.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("adminSla.detailedMetrics.metric")}</TableHead>
                      <TableHead>{t("adminSla.detailedMetrics.current")}</TableHead>
                      <TableHead>{t("adminSla.detailedMetrics.target")}</TableHead>
                      <TableHead>{t("adminSla.detailedMetrics.status")}</TableHead>
                      <TableHead>{t("adminSla.detailedMetrics.trend")}</TableHead>
                      <TableHead>{t("adminSla.detailedMetrics.avg30d")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {slaMetrics.map((metric, index) => (
                      <TableRow key={metric.name} data-testid={`metric-row-${index}`}>
                        <TableCell className="font-medium">{metric.name}</TableCell>
                        <TableCell>
                          {metric.current.toLocaleString()}{metric.unit}
                        </TableCell>
                        <TableCell>
                          {metric.target.toLocaleString()}{metric.unit}
                        </TableCell>
                        <TableCell>{getStatusBadge(metric.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {metric.trend === "up" && <ArrowUp className="h-4 w-4 text-green-500" />}
                            {metric.trend === "down" && <ArrowDown className="h-4 w-4 text-red-500" />}
                            {metric.trend === "stable" && <Activity className="h-4 w-4" />}
                            {t(`adminSla.trends.${metric.trend}`)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {(metric.history.reduce((sum, h) => sum + h.value, 0) / metric.history.length).toFixed(2)}{metric.unit}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incidents" className="space-y-6">
            <Card data-testid="card-incident-history">
              <CardHeader>
                <CardTitle>{t("adminSla.incidents.title")}</CardTitle>
                <CardDescription>{t("adminSla.incidents.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("adminSla.incidents.id")}</TableHead>
                      <TableHead>{t("adminSla.incidents.type")}</TableHead>
                      <TableHead>{t("adminSla.incidents.startTime")}</TableHead>
                      <TableHead>{t("adminSla.incidents.duration")}</TableHead>
                      <TableHead>{t("adminSla.incidents.impact")}</TableHead>
                      <TableHead>{t("adminSla.incidents.rootCause")}</TableHead>
                      <TableHead>{t("adminSla.incidents.status")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incidents.map((incident, index) => (
                      <TableRow key={incident.id} data-testid={`incident-row-${index}`}>
                        <TableCell className="font-mono">{incident.id}</TableCell>
                        <TableCell>{incident.type}</TableCell>
                        <TableCell>
                          {new Date(incident.startTime).toLocaleString('en-US', { timeZone: 'America/New_York' })}
                        </TableCell>
                        <TableCell>{incident.duration} {t("adminSla.incidents.minutes")}</TableCell>
                        <TableCell>{getImpactBadge(incident.impact)}</TableCell>
                        <TableCell className="max-w-xs truncate">{incident.rootCause}</TableCell>
                        <TableCell>
                          {incident.resolved ? (
                            <Badge className="bg-green-500">{t("adminSla.incidents.resolved")}</Badge>
                          ) : (
                            <Badge className="bg-red-500">{t("adminSla.incidents.active")}</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="hover-elevate cursor-pointer" data-testid="card-monthly-report">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Download className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium">{t("adminSla.reports.monthly")}</p>
                      <p className="text-sm text-muted-foreground">{t("adminSla.reports.december")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover-elevate cursor-pointer" data-testid="card-quarterly-report">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Download className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium">{t("adminSla.reports.quarterly")}</p>
                      <p className="text-sm text-muted-foreground">{t("adminSla.reports.q4")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover-elevate cursor-pointer" data-testid="card-annual-report">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Download className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium">{t("adminSla.reports.annual")}</p>
                      <p className="text-sm text-muted-foreground">{t("adminSla.reports.year")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
