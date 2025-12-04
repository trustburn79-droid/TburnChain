import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Monitor,
  Activity,
  Cpu,
  HardDrive,
  Network,
  Zap,
  RefreshCw,
  Pause,
  Play,
  Settings,
  Bell,
  Clock,
  Server,
  Database,
  Wifi,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface MetricData {
  timestamp: string;
  value: number;
}

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: "healthy" | "warning" | "critical";
  trend: "up" | "down" | "stable";
  sparkline: MetricData[];
}

interface LiveEvent {
  id: string;
  type: "info" | "warning" | "error" | "success";
  message: string;
  timestamp: string;
  source: string;
}

export default function RealtimeMonitor() {
  const [isLive, setIsLive] = useState(true);
  const [refreshRate, setRefreshRate] = useState("1s");
  const [activeTab, setActiveTab] = useState("overview");
  const [lastUpdate, setLastUpdate] = useState(new Date().toISOString());

  const generateTimeSeriesData = () => {
    return Array.from({ length: 60 }, (_, i) => ({
      timestamp: new Date(Date.now() - (59 - i) * 1000).toISOString(),
      value: Math.floor(Math.random() * 100) + 400,
    }));
  };

  const [tpsData, setTpsData] = useState(generateTimeSeriesData());
  const [latencyData, setLatencyData] = useState(
    Array.from({ length: 60 }, (_, i) => ({
      timestamp: new Date(Date.now() - (59 - i) * 1000).toISOString(),
      value: Math.floor(Math.random() * 50) + 10,
    }))
  );

  useEffect(() => {
    if (!isLive) return;
    
    const interval = setInterval(() => {
      setTpsData(prev => {
        const newData = [...prev.slice(1)];
        newData.push({
          timestamp: new Date().toISOString(),
          value: Math.floor(Math.random() * 100) + 400,
        });
        return newData;
      });
      
      setLatencyData(prev => {
        const newData = [...prev.slice(1)];
        newData.push({
          timestamp: new Date().toISOString(),
          value: Math.floor(Math.random() * 50) + 10,
        });
        return newData;
      });
      
      setLastUpdate(new Date().toISOString());
    }, refreshRate === "1s" ? 1000 : refreshRate === "5s" ? 5000 : 10000);

    return () => clearInterval(interval);
  }, [isLive, refreshRate]);

  const systemMetrics: SystemMetric[] = [
    {
      name: "TPS (Current)",
      value: tpsData[tpsData.length - 1]?.value || 0,
      unit: "tx/s",
      status: "healthy",
      trend: "up",
      sparkline: tpsData.slice(-20),
    },
    {
      name: "Block Height",
      value: 12847563,
      unit: "",
      status: "healthy",
      trend: "up",
      sparkline: [],
    },
    {
      name: "Avg Latency",
      value: latencyData[latencyData.length - 1]?.value || 0,
      unit: "ms",
      status: "healthy",
      trend: "stable",
      sparkline: latencyData.slice(-20),
    },
    {
      name: "Active Validators",
      value: 156,
      unit: "",
      status: "healthy",
      trend: "stable",
      sparkline: [],
    },
    {
      name: "Mempool Size",
      value: 1247,
      unit: "txs",
      status: "healthy",
      trend: "down",
      sparkline: [],
    },
    {
      name: "Network Peers",
      value: 324,
      unit: "",
      status: "healthy",
      trend: "up",
      sparkline: [],
    },
  ];

  const resourceMetrics = [
    { name: "CPU Usage", value: 45, max: 100, unit: "%", status: "healthy" as const },
    { name: "Memory", value: 67, max: 100, unit: "%", status: "healthy" as const },
    { name: "Disk I/O", value: 23, max: 100, unit: "%", status: "healthy" as const },
    { name: "Network", value: 156, max: 1000, unit: "Mbps", status: "healthy" as const },
  ];

  const liveEvents: LiveEvent[] = [
    { id: "1", type: "success", message: "Block #12847563 produced by validator 0x1234...", timestamp: new Date().toISOString(), source: "Consensus" },
    { id: "2", type: "info", message: "New peer connected from 192.168.1.100", timestamp: new Date(Date.now() - 5000).toISOString(), source: "Network" },
    { id: "3", type: "warning", message: "High mempool utilization: 85%", timestamp: new Date(Date.now() - 12000).toISOString(), source: "Mempool" },
    { id: "4", type: "success", message: "Cross-shard transaction completed: 0xabcd...", timestamp: new Date(Date.now() - 18000).toISOString(), source: "Sharding" },
    { id: "5", type: "info", message: "AI optimization applied to shard 12", timestamp: new Date(Date.now() - 25000).toISOString(), source: "AI" },
    { id: "6", type: "error", message: "RPC endpoint timeout: /api/v1/balance", timestamp: new Date(Date.now() - 30000).toISOString(), source: "API" },
    { id: "7", type: "success", message: "Validator 0x5678... joined committee", timestamp: new Date(Date.now() - 45000).toISOString(), source: "Validator" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy": return "text-green-500";
      case "warning": return "text-yellow-500";
      case "critical": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Monitor className="h-8 w-8" />
              Real-time Monitoring
            </h1>
            <p className="text-muted-foreground">Live system metrics and network activity</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="refresh-rate">Refresh</Label>
              <Select value={refreshRate} onValueChange={setRefreshRate}>
                <SelectTrigger className="w-24" data-testid="select-refresh-rate">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1s">1s</SelectItem>
                  <SelectItem value="5s">5s</SelectItem>
                  <SelectItem value="10s">10s</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="live-mode"
                checked={isLive}
                onCheckedChange={setIsLive}
                data-testid="switch-live-mode"
              />
              <Label htmlFor="live-mode" className="flex items-center gap-1">
                {isLive ? <Play className="h-4 w-4 text-green-500" /> : <Pause className="h-4 w-4" />}
                {isLive ? "Live" : "Paused"}
              </Label>
            </div>
            <Badge variant={isLive ? "default" : "secondary"} className="gap-1">
              <Clock className="h-3 w-3" />
              {new Date(lastUpdate).toLocaleTimeString()}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {systemMetrics.map((metric) => (
            <Card key={metric.name} className="hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{metric.name}</span>
                  {metric.trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
                  {metric.trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                    {metric.value.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">{metric.unit}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="events">Live Events</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    TPS (Transactions Per Second)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={tpsData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="timestamp" 
                          tickFormatter={(v) => new Date(v).toLocaleTimeString()}
                          className="text-xs"
                        />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                          labelFormatter={(v) => new Date(v).toLocaleTimeString()}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="hsl(var(--primary))" 
                          fill="hsl(var(--primary) / 0.2)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Network Latency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={latencyData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="timestamp" 
                          tickFormatter={(v) => new Date(v).toLocaleTimeString()}
                          className="text-xs"
                        />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                          labelFormatter={(v) => new Date(v).toLocaleTimeString()}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="hsl(var(--chart-2))" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  System Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {resourceMetrics.map((metric) => (
                    <div key={metric.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{metric.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {metric.value}{metric.unit}
                        </span>
                      </div>
                      <Progress 
                        value={(metric.value / metric.max) * 100} 
                        className={
                          (metric.value / metric.max) > 0.8 ? "bg-red-200" :
                          (metric.value / metric.max) > 0.6 ? "bg-yellow-200" : ""
                        }
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Current TPS</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-500">
                    {tpsData[tpsData.length - 1]?.value.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Peak: 520,000 TPS</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Block Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">500ms</div>
                  <p className="text-xs text-muted-foreground">Target: 500ms</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Consensus Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">124ms</div>
                  <p className="text-xs text-muted-foreground">Target: 150ms</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Finality</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">1.84ms</div>
                  <p className="text-xs text-muted-foreground">Instant finality</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-5 w-5" />
                    CPU Usage by Core
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Core {i}</span>
                        <span>{Math.floor(Math.random() * 40) + 30}%</span>
                      </div>
                      <Progress value={Math.floor(Math.random() * 40) + 30} />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5" />
                    Storage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Blockchain Data</span>
                      <span>2.4 TB / 4 TB</span>
                    </div>
                    <Progress value={60} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>State DB</span>
                      <span>856 GB / 2 TB</span>
                    </div>
                    <Progress value={42.8} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Logs</span>
                      <span>124 GB / 500 GB</span>
                    </div>
                    <Progress value={24.8} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Snapshots</span>
                      <span>1.2 TB / 2 TB</span>
                    </div>
                    <Progress value={60} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Live Event Stream
                </CardTitle>
                <CardDescription>Real-time system events and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {liveEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover-elevate"
                      >
                        {getEventTypeIcon(event.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">{event.message}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {event.source}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(event.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
