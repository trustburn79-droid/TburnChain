import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Activity,
  Clock,
  Cpu,
  Gauge,
  HardDrive,
  MemoryStick,
  Network,
  TrendingUp,
  Zap,
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
} from "recharts";

export default function AdminPerformance() {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState("24h");

  const { data: networkStats, isLoading } = useQuery<{
    tps: number;
    blockHeight: number;
    avgBlockTime: number;
    pendingTransactions: number;
    latency: number;
  }>({
    queryKey: ["/api/network/stats"],
    refetchInterval: 5000,
  });

  const performanceHistory = useMemo(() => {
    return Array.from({ length: 48 }, (_, i) => ({
      time: `${(47 - i) * 30}m`,
      tps: Math.floor(Math.random() * 800) + 2200,
      latency: Math.floor(Math.random() * 50) + 120,
      cpu: Math.floor(Math.random() * 30) + 35,
      memory: Math.floor(Math.random() * 20) + 55,
    })).reverse();
  }, []);

  const shardPerformance = useMemo(() => [
    { shardId: 0, tps: 425, latency: 145, load: 68, status: "healthy" },
    { shardId: 1, tps: 398, latency: 152, load: 72, status: "healthy" },
    { shardId: 2, tps: 412, latency: 148, load: 65, status: "healthy" },
    { shardId: 3, tps: 389, latency: 158, load: 78, status: "warning" },
    { shardId: 4, tps: 435, latency: 142, load: 62, status: "healthy" },
    { shardId: 5, tps: 401, latency: 155, load: 70, status: "healthy" },
    { shardId: 6, tps: 378, latency: 165, load: 82, status: "warning" },
    { shardId: 7, tps: 418, latency: 146, load: 66, status: "healthy" },
  ], []);

  const latencyBreakdown = useMemo(() => ({
    p50: 125,
    p90: 168,
    p95: 195,
    p99: 248,
    max: 312,
  }), []);

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Gauge className="h-8 w-8" />
              Performance Monitor
            </h1>
            <p className="text-muted-foreground">Real-time system performance metrics and analytics</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last 1 hour</SelectItem>
              <SelectItem value="6h">Last 6 hours</SelectItem>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current TPS</p>
                  <p className="text-2xl font-bold">{networkStats?.tps?.toLocaleString() || "0"}</p>
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> +5.2% from avg
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Latency</p>
                  <p className="text-2xl font-bold">{latencyBreakdown.p50}ms</p>
                  <p className="text-xs text-muted-foreground">P50 response time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <Cpu className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CPU Usage</p>
                  <p className="text-2xl font-bold">42%</p>
                  <Progress value={42} className="h-1 mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-purple-500/10">
                  <MemoryStick className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Memory Usage</p>
                  <p className="text-2xl font-bold">68%</p>
                  <Progress value={68} className="h-1 mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="throughput" className="space-y-4">
          <TabsList>
            <TabsTrigger value="throughput">Throughput</TabsTrigger>
            <TabsTrigger value="latency">Latency</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="shards">Shards</TabsTrigger>
          </TabsList>

          <TabsContent value="throughput">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Transaction Throughput
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceHistory}>
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
                          borderRadius: "8px",
                        }}
                      />
                      <Area type="monotone" dataKey="tps" stroke="#10b981" fill="url(#colorTps)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="latency">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Latency Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceHistory}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="time" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Line type="monotone" dataKey="latency" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Latency Percentiles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: "P50", value: latencyBreakdown.p50, color: "bg-green-500" },
                      { label: "P90", value: latencyBreakdown.p90, color: "bg-blue-500" },
                      { label: "P95", value: latencyBreakdown.p95, color: "bg-yellow-500" },
                      { label: "P99", value: latencyBreakdown.p99, color: "bg-orange-500" },
                      { label: "Max", value: latencyBreakdown.max, color: "bg-red-500" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-4">
                        <span className="w-12 text-sm font-medium">{item.label}</span>
                        <div className="flex-1">
                          <Progress value={(item.value / latencyBreakdown.max) * 100} className={`h-3 ${item.color}`} />
                        </div>
                        <span className="w-16 text-right font-mono text-sm">{item.value}ms</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="resources">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-5 w-5" />
                    CPU & Memory Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceHistory}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="time" className="text-xs" />
                        <YAxis className="text-xs" domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Line type="monotone" dataKey="cpu" stroke="#10b981" strokeWidth={2} dot={false} name="CPU %" />
                        <Line type="monotone" dataKey="memory" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Memory %" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5" />
                    Storage & Network
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Disk Usage</span>
                        <span className="font-medium">54% (1.2TB / 2.2TB)</span>
                      </div>
                      <Progress value={54} className="h-3" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Network I/O</span>
                        <span className="font-medium">78% (780 Mbps)</span>
                      </div>
                      <Progress value={78} className="h-3" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Connections</span>
                        <span className="font-medium">2,847 active</span>
                      </div>
                      <Progress value={45} className="h-3" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Database Pool</span>
                        <span className="font-medium">62% (31/50 connections)</span>
                      </div>
                      <Progress value={62} className="h-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="shards">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Shard Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Shard ID</th>
                        <th className="text-right py-3 px-4 font-medium">TPS</th>
                        <th className="text-right py-3 px-4 font-medium">Latency</th>
                        <th className="text-center py-3 px-4 font-medium">Load</th>
                        <th className="text-center py-3 px-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shardPerformance.map((shard) => (
                        <tr key={shard.shardId} className="border-b hover-elevate">
                          <td className="py-3 px-4 font-mono">Shard #{shard.shardId}</td>
                          <td className="py-3 px-4 text-right font-mono">{shard.tps}</td>
                          <td className="py-3 px-4 text-right font-mono">{shard.latency}ms</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Progress value={shard.load} className="h-2 flex-1" />
                              <span className="w-10 text-right text-xs">{shard.load}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge
                              className={
                                shard.status === "healthy"
                                  ? "bg-green-500/10 text-green-500"
                                  : "bg-yellow-500/10 text-yellow-500"
                              }
                            >
                              {shard.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
