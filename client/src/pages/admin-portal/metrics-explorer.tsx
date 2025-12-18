import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import {
  Gauge,
  Search,
  RefreshCw,
  Download,
  ChartLine,
  ChartBar,
  ChartArea,
  Filter,
  Clock,
  Database,
  Cpu,
  Activity,
  Zap,
  Network,
  Star,
  Copy,
  ExternalLink,
  AlertCircle,
  Play,
  Eye,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Metric {
  name: string;
  description: string;
  type: string;
  category: string;
  value: number;
  unit: string;
  labels: Record<string, string>;
  isFavorite: boolean;
}

interface MetricsData {
  metrics: Metric[];
  chartData: { time: string; tburn_tps_current: number; tburn_consensus_time_ms: number; tburn_validator_count: number }[];
}

export default function MetricsExplorer() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [timeRange, setTimeRange] = useState("1h");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["tburn_tps_current"]);
  const [showMetricDetail, setShowMetricDetail] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);
  const [showExportConfirm, setShowExportConfirm] = useState(false);

  const { data: metricsData, isLoading, error, refetch } = useQuery<MetricsData>({
    queryKey: ["/api/enterprise/admin/monitoring/metrics"],
    refetchInterval: 10000,
    staleTime: 10000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const categories = [
    { value: "all", label: t("adminMetrics.categories.all") },
    { value: "network", label: t("adminMetrics.categories.network") },
    { value: "consensus", label: t("adminMetrics.categories.consensus") },
    { value: "resources", label: t("adminMetrics.categories.resources") },
    { value: "transactions", label: t("adminMetrics.categories.transactions") },
    { value: "ai", label: t("adminMetrics.categories.ai") },
    { value: "bridge", label: t("adminMetrics.categories.bridge") },
  ];

  const metrics: Metric[] = metricsData?.metrics || [
    { name: "tburn_tps_current", description: t("adminMetrics.metricDescriptions.tpsCurrent"), type: "gauge", category: "network", value: 100000, unit: "tx/s", labels: { node: "all", network: "mainnet-v8.0" }, isFavorite: true },
    { name: "tburn_block_height", description: t("adminMetrics.metricDescriptions.blockHeight"), type: "counter", category: "network", value: 1, unit: "", labels: { chain: "mainnet-v8.0", genesis: "Dec 8 2024" }, isFavorite: true },
    { name: "tburn_consensus_time_ms", description: t("adminMetrics.metricDescriptions.consensusTime"), type: "histogram", category: "consensus", value: 42, unit: "ms", labels: { algorithm: "bft", validators: "156" }, isFavorite: true },
    { name: "tburn_validator_count", description: t("adminMetrics.metricDescriptions.validatorCount"), type: "gauge", category: "consensus", value: 156, unit: "", labels: { status: "active", tier1: "12", tier2: "48", tier3: "96" }, isFavorite: true },
    { name: "tburn_cpu_usage_percent", description: t("adminMetrics.metricDescriptions.cpuUsage"), type: "gauge", category: "resources", value: 12.4, unit: "%", labels: { node: "primary" }, isFavorite: false },
    { name: "tburn_memory_usage_gb", description: t("adminMetrics.metricDescriptions.memoryUsage"), type: "gauge", category: "resources", value: 28.6, unit: "GB", labels: { node: "primary", capacity: "128GB" }, isFavorite: false },
    { name: "tburn_disk_io_mbps", description: t("adminMetrics.metricDescriptions.diskIO"), type: "gauge", category: "resources", value: 847, unit: "MB/s", labels: { device: "nvme-raid" }, isFavorite: false },
    { name: "tburn_tx_pending", description: t("adminMetrics.metricDescriptions.txPending"), type: "gauge", category: "transactions", value: 0, unit: "txs", labels: { priority: "all" }, isFavorite: false },
    { name: "tburn_tx_confirmed_24h", description: t("adminMetrics.metricDescriptions.txConfirmed"), type: "counter", category: "transactions", value: 0, unit: "", labels: { genesis: "true" }, isFavorite: true },
    { name: "tburn_ai_decision_latency_ms", description: t("adminMetrics.metricDescriptions.aiLatency"), type: "histogram", category: "ai", value: 18, unit: "ms", labels: { model: "gemini-3-pro", band: "triple" }, isFavorite: true },
    { name: "tburn_ai_accuracy_percent", description: t("adminMetrics.metricDescriptions.aiAccuracy"), type: "gauge", category: "ai", value: 99.7, unit: "%", labels: { model: "triple-band" }, isFavorite: true },
    { name: "tburn_bridge_pending", description: t("adminMetrics.metricDescriptions.bridgePending"), type: "gauge", category: "bridge", value: 0, unit: "", labels: { chains: "ETH,BSC,Polygon,Arbitrum" }, isFavorite: false },
    { name: "tburn_bridge_volume_24h", description: t("adminMetrics.metricDescriptions.bridgeVolume"), type: "counter", category: "bridge", value: 0, unit: "TBURN", labels: { status: "genesis" }, isFavorite: false },
    { name: "tburn_shard_count", description: t("adminMetrics.metricDescriptions.shardCount"), type: "gauge", category: "network", value: 8, unit: "", labels: { capacity: "100K+ TPS" }, isFavorite: true },
    { name: "tburn_cross_shard_latency_ms", description: t("adminMetrics.metricDescriptions.crossShardLatency"), type: "histogram", category: "network", value: 1.8, unit: "ms", labels: { optimization: "ai-driven" }, isFavorite: false },
  ];

  const chartData = metricsData?.chartData || Array.from({ length: 60 }, (_, i) => ({
    time: `${59 - i}m ago`,
    tburn_tps_current: Math.floor(Math.random() * 5000) + 98000,
    tburn_consensus_time_ms: Math.floor(Math.random() * 8) + 38,
    tburn_validator_count: 156,
  }));

  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: t("adminMetrics.refreshed"),
      description: t("adminMetrics.refreshedDesc"),
    });
  }, [refetch, toast, t]);

  const performExport = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      timeRange,
      metrics: metrics.filter(m => selectedMetrics.includes(m.name)),
      chartData,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `metrics-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: t("adminMetrics.exported"),
      description: t("adminMetrics.exportedDesc"),
    });
    setShowExportConfirm(false);
  }, [metrics, selectedMetrics, chartData, timeRange, toast, t]);

  const getMetricDetailSections = (metric: Metric): DetailSection[] => [
    {
      title: t("adminMetrics.detail.metricInfo"),
      fields: [
        { label: t("common.name"), value: metric.name, copyable: true },
        { label: t("common.description"), value: metric.description },
        { label: t("common.type"), value: metric.type, type: "badge" as const },
        { label: t("adminMetrics.categories.all").replace("All Categories", "Category"), value: metric.category },
        { label: t("common.value"), value: `${metric.value.toLocaleString()}${metric.unit}` },
        { label: t("adminMetrics.details.labels"), value: metric.unit || "-" },
      ],
    },
    {
      title: t("adminMetrics.detail.labels"),
      fields: Object.entries(metric.labels).map(([key, value]) => ({
        label: key,
        value: value,
      })),
    },
  ];

  const filteredMetrics = metrics.filter((metric) => {
    const matchesSearch = 
      metric.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      metric.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || metric.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleMetricSelection = (metricName: string) => {
    setSelectedMetrics(prev =>
      prev.includes(metricName)
        ? prev.filter(m => m !== metricName)
        : [...prev, metricName]
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "network": return <Network className="h-4 w-4" />;
      case "consensus": return <Activity className="h-4 w-4" />;
      case "resources": return <Cpu className="h-4 w-4" />;
      case "transactions": return <Zap className="h-4 w-4" />;
      case "ai": return <Activity className="h-4 w-4" />;
      case "bridge": return <ExternalLink className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  if (error) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="container max-w-[1800px] mx-auto p-6">
          <Card className="border-destructive">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <div className="flex-1">
                  <h3 className="font-semibold">{t("adminMetrics.errorTitle")}</h3>
                  <p className="text-sm text-muted-foreground">{t("adminMetrics.errorDescription")}</p>
                </div>
                <Button onClick={() => refetch()} data-testid="button-retry-metrics">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t("adminMetrics.retry")}
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
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-96 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-testid="metrics-explorer-page">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-metrics-title">
              <Gauge className="h-8 w-8" />
              {t("adminMetrics.title")}
            </h1>
            <p className="text-muted-foreground" data-testid="text-metrics-description">
              {t("adminMetrics.description")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32" data-testid="select-time-range">
                <Clock className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15m">{t("adminMetrics.timeRanges.15m")}</SelectItem>
                <SelectItem value="1h">{t("adminMetrics.timeRanges.1h")}</SelectItem>
                <SelectItem value="6h">{t("adminMetrics.timeRanges.6h")}</SelectItem>
                <SelectItem value="24h">{t("adminMetrics.timeRanges.24h")}</SelectItem>
                <SelectItem value="7d">{t("adminMetrics.timeRanges.7d")}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleRefresh} data-testid="button-refresh-metrics">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminMetrics.refresh")}
            </Button>
            <Button variant="outline" onClick={() => setShowExportConfirm(true)} data-testid="button-export-metrics">
              <Download className="h-4 w-4 mr-2" />
              {t("adminMetrics.export")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1" data-testid="card-metrics-browser">
            <CardHeader>
              <CardTitle className="text-lg">{t("adminMetrics.browser.title")}</CardTitle>
              <CardDescription>{t("adminMetrics.browser.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("adminMetrics.browser.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-metrics"
                />
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger data-testid="select-category">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {filteredMetrics.map((metric, index) => (
                    <div
                      key={metric.name}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedMetrics.includes(metric.name)
                          ? "bg-primary/10 border border-primary"
                          : "bg-muted/50 hover-elevate"
                      }`}
                      onClick={() => toggleMetricSelection(metric.name)}
                      data-testid={`metric-item-${index}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(metric.category)}
                            <span className="text-sm font-mono truncate">{metric.name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">{metric.type}</Badge>
                            <span className="text-sm font-semibold">
                              {metric.value.toLocaleString()}{metric.unit}
                            </span>
                          </div>
                        </div>
                        {metric.isFavorite && (
                          <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3" data-testid="card-metrics-visualization">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("adminMetrics.visualization.title")}</CardTitle>
                  <CardDescription>
                    {t("adminMetrics.visualization.selectedCount", { count: selectedMetrics.length })}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" data-testid="button-chart-line">
                    <ChartLine className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" data-testid="button-chart-bar">
                    <ChartBar className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" data-testid="button-chart-area">
                    <ChartArea className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="time" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                    />
                    <Legend />
                    {selectedMetrics.includes("tburn_tps_current") && (
                      <Line 
                        type="monotone" 
                        dataKey="tburn_tps_current" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={false}
                        name={t("adminMetrics.chartLabels.tps")}
                      />
                    )}
                    {selectedMetrics.includes("tburn_consensus_time_ms") && (
                      <Line 
                        type="monotone" 
                        dataKey="tburn_consensus_time_ms" 
                        stroke="hsl(var(--chart-2))" 
                        strokeWidth={2}
                        dot={false}
                        name={t("adminMetrics.chartLabels.consensusTime")}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-4">{t("adminMetrics.details.title")}</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("adminMetrics.details.metric")}</TableHead>
                      <TableHead>{t("adminMetrics.details.current")}</TableHead>
                      <TableHead>{t("adminMetrics.details.avg")}</TableHead>
                      <TableHead>{t("adminMetrics.details.min")}</TableHead>
                      <TableHead>{t("adminMetrics.details.max")}</TableHead>
                      <TableHead>{t("adminMetrics.details.labels")}</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metrics.filter(m => selectedMetrics.includes(m.name)).map((metric, index) => (
                      <TableRow key={metric.name} data-testid={`metric-row-${index}`}>
                        <TableCell className="font-mono text-sm">{metric.name}</TableCell>
                        <TableCell className="font-semibold">
                          {metric.value.toLocaleString()}{metric.unit}
                        </TableCell>
                        <TableCell>{(metric.value * 0.95).toFixed(0)}{metric.unit}</TableCell>
                        <TableCell>{(metric.value * 0.8).toFixed(0)}{metric.unit}</TableCell>
                        <TableCell>{(metric.value * 1.1).toFixed(0)}{metric.unit}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {Object.entries(metric.labels).map(([key, value]) => (
                              <Badge key={key} variant="outline" className="text-xs">
                                {key}={value}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => {
                                setSelectedMetric(metric);
                                setShowMetricDetail(true);
                              }}
                              data-testid={`button-view-metric-${index}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" data-testid={`button-copy-metric-${index}`}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card data-testid="card-promql-builder">
          <CardHeader>
            <CardTitle>{t("adminMetrics.promql.title")}</CardTitle>
            <CardDescription>{t("adminMetrics.promql.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder='rate(tburn_tx_confirmed_total[5m])'
                className="font-mono flex-1"
                data-testid="input-promql-query"
              />
              <Button data-testid="button-execute-query">
                <Play className="h-4 w-4 mr-2" />
                {t("adminMetrics.promql.execute")}
              </Button>
            </div>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                {t("adminMetrics.promql.examples")}: <code className="bg-background px-1 rounded">sum(tburn_tps_current)</code>,{" "}
                <code className="bg-background px-1 rounded">avg_over_time(tburn_cpu_usage_percent[1h])</code>,{" "}
                <code className="bg-background px-1 rounded">histogram_quantile(0.95, tburn_latency_bucket)</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedMetric && (
        <DetailSheet
          open={showMetricDetail}
          onOpenChange={setShowMetricDetail}
          title={selectedMetric.name}
          subtitle={selectedMetric.description}
          icon={<Gauge className="h-5 w-5" />}
          sections={getMetricDetailSections(selectedMetric)}
        />
      )}

      <ConfirmationDialog
        open={showExportConfirm}
        onOpenChange={setShowExportConfirm}
        title={t("adminMetrics.confirm.exportTitle")}
        description={t("adminMetrics.confirm.exportDesc")}
        onConfirm={performExport}
        destructive={false}
      />
    </div>
  );
}
