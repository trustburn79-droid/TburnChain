import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { 
  Network, Server, Cpu, HardDrive, 
  Activity, Zap, Globe, Clock
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

export default function AdminNetworkAnalytics() {
  const networkStats = {
    tps: "52,478",
    blockTime: "498ms",
    nodeCount: 892,
    avgLatency: "124ms",
  };

  const tpsHistory = [
    { time: "00:00", tps: 45000 },
    { time: "04:00", tps: 38000 },
    { time: "08:00", tps: 52000 },
    { time: "12:00", tps: 58000 },
    { time: "16:00", tps: 55000 },
    { time: "20:00", tps: 48000 },
  ];

  const latencyHistory = [
    { time: "00:00", p50: 110, p95: 145, p99: 180 },
    { time: "04:00", p50: 105, p95: 140, p99: 175 },
    { time: "08:00", p50: 120, p95: 155, p99: 195 },
    { time: "12:00", p50: 130, p95: 165, p99: 210 },
    { time: "16:00", p50: 125, p95: 160, p99: 200 },
    { time: "20:00", p50: 115, p95: 150, p99: 185 },
  ];

  const shardPerformance = [
    { shard: "MainHub", tps: 8500, load: 72, nodes: 156 },
    { shard: "DeFi-1", tps: 6200, load: 65, nodes: 45 },
    { shard: "DeFi-2", tps: 5800, load: 58, nodes: 42 },
    { shard: "NFT-1", tps: 4500, load: 48, nodes: 35 },
    { shard: "Enterprise-1", tps: 7200, load: 68, nodes: 52 },
  ];

  const resourceUsage = [
    { resource: "CPU", usage: 68, trend: "stable" },
    { resource: "Memory", usage: 72, trend: "up" },
    { resource: "Disk I/O", usage: 45, trend: "stable" },
    { resource: "Network", usage: 58, trend: "down" },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Network Analytics</h1>
            <p className="text-muted-foreground">Network performance and infrastructure metrics</p>
          </div>
          <Button variant="outline">Export Report</Button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-muted-foreground">Current TPS</span>
              </div>
              <div className="text-3xl font-bold">{networkStats.tps}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Block Time</span>
              </div>
              <div className="text-3xl font-bold">{networkStats.blockTime}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Server className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-muted-foreground">Active Nodes</span>
              </div>
              <div className="text-3xl font-bold">{networkStats.nodeCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-orange-500" />
                <span className="text-sm text-muted-foreground">Avg Latency</span>
              </div>
              <div className="text-3xl font-bold">{networkStats.avgLatency}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tps" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tps">Throughput</TabsTrigger>
            <TabsTrigger value="latency">Latency</TabsTrigger>
            <TabsTrigger value="shards">Shards</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="tps">
            <Card>
              <CardHeader>
                <CardTitle>TPS History (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={tpsHistory}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="tps" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="latency">
            <Card>
              <CardHeader>
                <CardTitle>Latency Distribution (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={latencyHistory}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="p50" stroke="#22c55e" name="P50" strokeWidth={2} />
                      <Line type="monotone" dataKey="p95" stroke="#f97316" name="P95" strokeWidth={2} />
                      <Line type="monotone" dataKey="p99" stroke="#ef4444" name="P99" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shards">
            <Card>
              <CardHeader>
                <CardTitle>Shard Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shard</TableHead>
                      <TableHead>TPS</TableHead>
                      <TableHead>Load</TableHead>
                      <TableHead>Nodes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shardPerformance.map((shard, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{shard.shard}</TableCell>
                        <TableCell>{shard.tps.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={shard.load} className="w-20" />
                            <span className={shard.load > 70 ? "text-yellow-500" : "text-green-500"}>
                              {shard.load}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{shard.nodes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources">
            <Card>
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {resourceUsage.map((resource, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{resource.resource}</span>
                        <Badge variant={
                          resource.trend === "up" ? "destructive" :
                          resource.trend === "down" ? "default" : "secondary"
                        }>
                          {resource.trend}
                        </Badge>
                      </div>
                      <Progress value={resource.usage} className="h-3" />
                      <div className="text-right text-sm text-muted-foreground mt-1">
                        {resource.usage}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
