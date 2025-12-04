import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Gauge,
  Search,
  Plus,
  RefreshCw,
  Download,
  Settings,
  ChartLine,
  ChartBar,
  ChartArea,
  Filter,
  Clock,
  Database,
  Cpu,
  Activity,
  Zap,
  HardDrive,
  Network,
  Star,
  StarOff,
  Copy,
  ExternalLink,
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

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

export default function MetricsExplorer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [timeRange, setTimeRange] = useState("1h");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["tburn_tps_current"]);

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "network", label: "Network" },
    { value: "consensus", label: "Consensus" },
    { value: "resources", label: "Resources" },
    { value: "transactions", label: "Transactions" },
    { value: "ai", label: "AI Systems" },
    { value: "bridge", label: "Bridge" },
  ];

  const metrics: Metric[] = [
    { name: "tburn_tps_current", description: "Current transactions per second", type: "gauge", category: "network", value: 485000, unit: "tx/s", labels: { node: "all" }, isFavorite: true },
    { name: "tburn_block_height", description: "Current blockchain height", type: "counter", category: "network", value: 12847563, unit: "", labels: { chain: "mainnet" }, isFavorite: true },
    { name: "tburn_consensus_time_ms", description: "Average consensus time", type: "histogram", category: "consensus", value: 124, unit: "ms", labels: { algorithm: "bft" }, isFavorite: false },
    { name: "tburn_validator_count", description: "Active validator count", type: "gauge", category: "consensus", value: 156, unit: "", labels: { status: "active" }, isFavorite: true },
    { name: "tburn_cpu_usage_percent", description: "CPU usage percentage", type: "gauge", category: "resources", value: 45.2, unit: "%", labels: { node: "primary" }, isFavorite: false },
    { name: "tburn_memory_usage_gb", description: "Memory usage in GB", type: "gauge", category: "resources", value: 64.8, unit: "GB", labels: { node: "primary" }, isFavorite: false },
    { name: "tburn_disk_io_mbps", description: "Disk I/O rate", type: "gauge", category: "resources", value: 256, unit: "MB/s", labels: { device: "nvme0" }, isFavorite: false },
    { name: "tburn_tx_pending", description: "Pending transactions in mempool", type: "gauge", category: "transactions", value: 1247, unit: "txs", labels: { priority: "all" }, isFavorite: false },
    { name: "tburn_tx_confirmed_24h", description: "Confirmed transactions (24h)", type: "counter", category: "transactions", value: 42560000, unit: "", labels: {}, isFavorite: true },
    { name: "tburn_ai_decision_latency_ms", description: "AI decision latency", type: "histogram", category: "ai", value: 45, unit: "ms", labels: { model: "llama" }, isFavorite: false },
    { name: "tburn_ai_accuracy_percent", description: "AI decision accuracy", type: "gauge", category: "ai", value: 98.7, unit: "%", labels: { model: "all" }, isFavorite: true },
    { name: "tburn_bridge_pending", description: "Pending bridge transfers", type: "gauge", category: "bridge", value: 23, unit: "", labels: { chain: "all" }, isFavorite: false },
    { name: "tburn_bridge_volume_24h", description: "Bridge volume (24h)", type: "counter", category: "bridge", value: 12500000, unit: "TBURN", labels: {}, isFavorite: false },
    { name: "tburn_shard_count", description: "Active shard count", type: "gauge", category: "network", value: 48, unit: "", labels: {}, isFavorite: false },
    { name: "tburn_cross_shard_latency_ms", description: "Cross-shard latency", type: "histogram", category: "network", value: 3.2, unit: "ms", labels: {}, isFavorite: false },
  ];

  const chartData = Array.from({ length: 60 }, (_, i) => ({
    time: `${59 - i}m ago`,
    tburn_tps_current: Math.floor(Math.random() * 100000) + 400000,
    tburn_consensus_time_ms: Math.floor(Math.random() * 30) + 110,
    tburn_validator_count: 156 + Math.floor(Math.random() * 5) - 2,
  }));

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

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Gauge className="h-8 w-8" />
              Metrics Explorer
            </h1>
            <p className="text-muted-foreground">Browse and analyze system metrics</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32" data-testid="select-time-range">
                <Clock className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15m">Last 15m</SelectItem>
                <SelectItem value="1h">Last 1h</SelectItem>
                <SelectItem value="6h">Last 6h</SelectItem>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7d</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" data-testid="button-refresh-metrics">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" data-testid="button-export-metrics">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Metrics Browser</CardTitle>
              <CardDescription>Select metrics to visualize</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search metrics..."
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
                  {filteredMetrics.map((metric) => (
                    <div
                      key={metric.name}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedMetrics.includes(metric.name)
                          ? "bg-primary/10 border border-primary"
                          : "bg-muted/50 hover-elevate"
                      }`}
                      onClick={() => toggleMetricSelection(metric.name)}
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

          <Card className="lg:col-span-3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Metrics Visualization</CardTitle>
                  <CardDescription>
                    {selectedMetrics.length} metric(s) selected
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon">
                    <ChartLine className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <ChartBar className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
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
                        name="TPS"
                      />
                    )}
                    {selectedMetrics.includes("tburn_consensus_time_ms") && (
                      <Line 
                        type="monotone" 
                        dataKey="tburn_consensus_time_ms" 
                        stroke="hsl(var(--chart-2))" 
                        strokeWidth={2}
                        dot={false}
                        name="Consensus Time (ms)"
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-4">Selected Metrics Details</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead>Current</TableHead>
                      <TableHead>Avg</TableHead>
                      <TableHead>Min</TableHead>
                      <TableHead>Max</TableHead>
                      <TableHead>Labels</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metrics.filter(m => selectedMetrics.includes(m.name)).map((metric) => (
                      <TableRow key={metric.name}>
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
                          <Button variant="ghost" size="icon">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>PromQL Query Builder</CardTitle>
            <CardDescription>Build custom metric queries</CardDescription>
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
                Execute
              </Button>
            </div>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Examples: <code className="bg-background px-1 rounded">sum(tburn_tps_current)</code>,{" "}
                <code className="bg-background px-1 rounded">avg_over_time(tburn_cpu_usage_percent[1h])</code>,{" "}
                <code className="bg-background px-1 rounded">histogram_quantile(0.95, tburn_latency_bucket)</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Play(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}
