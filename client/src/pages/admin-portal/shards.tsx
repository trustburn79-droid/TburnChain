import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Grid3x3,
  Activity,
  Zap,
  Users,
  ArrowRightLeft,
  Brain,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminShards() {
  const { data: shardingData } = useQuery<any>({
    queryKey: ["/api/sharding/stats"],
    refetchInterval: 5000,
  });

  const shards = useMemo(() => shardingData?.shards || [
    { id: 0, name: "Beacon Shard", validators: 24, tps: 425, load: 68, pendingTx: 145, crossShardTx: 23, status: "healthy", rebalanceScore: 92 },
    { id: 1, name: "Shard Alpha", validators: 20, tps: 398, load: 72, pendingTx: 189, crossShardTx: 45, status: "healthy", rebalanceScore: 88 },
    { id: 2, name: "Shard Beta", validators: 19, tps: 412, load: 65, pendingTx: 134, crossShardTx: 31, status: "healthy", rebalanceScore: 94 },
    { id: 3, name: "Shard Gamma", validators: 21, tps: 389, load: 78, pendingTx: 256, crossShardTx: 67, status: "warning", rebalanceScore: 75 },
    { id: 4, name: "Shard Delta", validators: 18, tps: 435, load: 62, pendingTx: 98, crossShardTx: 28, status: "healthy", rebalanceScore: 96 },
    { id: 5, name: "Shard Epsilon", validators: 20, tps: 401, load: 70, pendingTx: 167, crossShardTx: 42, status: "healthy", rebalanceScore: 89 },
    { id: 6, name: "Shard Zeta", validators: 17, tps: 378, load: 82, pendingTx: 312, crossShardTx: 89, status: "warning", rebalanceScore: 68 },
    { id: 7, name: "Shard Eta", validators: 17, tps: 418, load: 66, pendingTx: 123, crossShardTx: 35, status: "healthy", rebalanceScore: 91 },
  ], [shardingData]);

  const stats = useMemo(() => ({
    totalShards: shards.length,
    totalTps: shards.reduce((acc: number, s: any) => acc + s.tps, 0),
    avgLoad: Math.round(shards.reduce((acc: number, s: any) => acc + s.load, 0) / shards.length),
    totalValidators: shards.reduce((acc: number, s: any) => acc + s.validators, 0),
    healthyShards: shards.filter((s: any) => s.status === "healthy").length,
    pendingRebalance: shards.filter((s: any) => s.rebalanceScore < 80).length,
  }), [shards]);

  const loadHistory = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      time: `${23 - i}h`,
      shard0: Math.floor(Math.random() * 30) + 55,
      shard1: Math.floor(Math.random() * 30) + 60,
      shard2: Math.floor(Math.random() * 30) + 50,
      shard3: Math.floor(Math.random() * 35) + 65,
    })).reverse();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy": return <Badge className="bg-green-500/10 text-green-500">Healthy</Badge>;
      case "warning": return <Badge className="bg-yellow-500/10 text-yellow-500">Warning</Badge>;
      case "critical": return <Badge className="bg-red-500/10 text-red-500">Critical</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getLoadColor = (load: number) => {
    if (load >= 80) return "bg-red-500";
    if (load >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Grid3x3 className="h-8 w-8" />
              Shard Management
            </h1>
            <p className="text-muted-foreground">Dynamic AI-Driven Sharding system monitoring</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500/10 text-green-500 flex items-center gap-1">
              <Brain className="h-3 w-3" />
              AI Auto-Rebalancing Active
            </Badge>
            <Button variant="outline" data-testid="button-manual-rebalance">
              <RefreshCw className="h-4 w-4 mr-2" />
              Manual Rebalance
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.totalShards}</p>
              <p className="text-xs text-muted-foreground">Total Shards</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.totalTps.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Combined TPS</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.avgLoad}%</p>
              <p className="text-xs text-muted-foreground">Avg Load</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.totalValidators}</p>
              <p className="text-xs text-muted-foreground">Total Validators</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-500">{stats.healthyShards}/{stats.totalShards}</p>
              <p className="text-xs text-muted-foreground">Healthy</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-500">{stats.pendingRebalance}</p>
              <p className="text-xs text-muted-foreground">Pending Rebalance</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {shards.map((shard: any) => (
            <Card key={shard.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Grid3x3 className="h-5 w-5" />
                    {shard.name}
                  </CardTitle>
                  {getStatusBadge(shard.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                      <Zap className="h-3 w-3" />
                      TPS
                    </div>
                    <p className="text-lg font-bold">{shard.tps}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                      <Users className="h-3 w-3" />
                      Validators
                    </div>
                    <p className="text-lg font-bold">{shard.validators}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                      <Activity className="h-3 w-3" />
                      Pending
                    </div>
                    <p className="text-lg font-bold">{shard.pendingTx}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                      <ArrowRightLeft className="h-3 w-3" />
                      Cross-Shard
                    </div>
                    <p className="text-lg font-bold">{shard.crossShardTx}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Load</span>
                      <span className={`font-medium ${shard.load >= 80 ? "text-red-500" : shard.load >= 70 ? "text-yellow-500" : "text-green-500"}`}>
                        {shard.load}%
                      </span>
                    </div>
                    <Progress value={shard.load} className={`h-2 ${getLoadColor(shard.load)}`} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Rebalance Score</span>
                      <span className="font-medium">{shard.rebalanceScore}%</span>
                    </div>
                    <Progress value={shard.rebalanceScore} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Shard Load History (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={loadHistory}>
                  <defs>
                    <linearGradient id="colorS0" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorS1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                  <Area type="monotone" dataKey="shard0" stroke="#10b981" fill="url(#colorS0)" strokeWidth={2} name="Beacon" />
                  <Area type="monotone" dataKey="shard3" stroke="#f59e0b" fill="none" strokeWidth={2} name="Gamma" strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
