import { useQuery } from "@tanstack/react-query";
import { BarChart3, Server, Wifi, HardDrive, Cpu, Activity, Shield, TrendingUp, AlertTriangle, Network, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/stat-card";
import { LiveIndicator } from "@/components/live-indicator";

interface NodeHealth {
  status: "healthy" | "degraded" | "unhealthy";
  uptime: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  rpcConnections: number;
  wsConnections: number;
  peersConnected: number;
  syncStatus: string;
  lastBlockTime: number;
}

interface NetworkStats {
  trendAnalysisScore: number;
  anomalyDetectionScore: number;
  patternMatchingScore: number;
  timeseriesScore: number;
}

export default function NodeHealth() {
  const { data: health, isLoading } = useQuery<NodeHealth>({
    queryKey: ["/api/node/health"],
  });

  const { data: networkStats, isLoading: isStatsLoading } = useQuery<NetworkStats>({
    queryKey: ["/api/network/stats"],
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-green-600">Healthy</Badge>;
      case "degraded":
        return <Badge variant="secondary" className="bg-yellow-600">Degraded</Badge>;
      case "unhealthy":
        return <Badge variant="destructive">Unhealthy</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage >= 90) return "text-red-600 dark:text-red-400";
    if (usage >= 70) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Node Health
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Predictive Self-Healing with 4 AI-Powered Algorithms
          </p>
        </div>
        <LiveIndicator label="Monitoring" />
      </div>

      {/* Node Status */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Node Status
            </CardTitle>
            {!isLoading && health && getStatusBadge(health.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </>
          ) : health ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Uptime</div>
                  <div className="text-xl font-semibold tabular-nums">
                    {formatUptime(health.uptime)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Sync Status</div>
                  <div className="text-xl font-semibold">
                    {health.syncStatus}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Last Block</div>
                  <div className="text-xl font-semibold tabular-nums">
                    {health.lastBlockTime}s ago
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      {/* Resource Usage */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </>
        ) : health ? (
          <>
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  CPU Usage
                </CardTitle>
                <Cpu className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={`text-3xl font-semibold tabular-nums ${getUsageColor(health.cpuUsage)}`}>
                  {health.cpuUsage}%
                </div>
                <Progress value={health.cpuUsage} className="h-2" />
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Memory Usage
                </CardTitle>
                <Activity className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={`text-3xl font-semibold tabular-nums ${getUsageColor(health.memoryUsage)}`}>
                  {health.memoryUsage}%
                </div>
                <Progress value={health.memoryUsage} className="h-2" />
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Disk Usage
                </CardTitle>
                <HardDrive className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={`text-3xl font-semibold tabular-nums ${getUsageColor(health.diskUsage)}`}>
                  {health.diskUsage}%
                </div>
                <Progress value={health.diskUsage} className="h-2" />
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Network Latency
                </CardTitle>
                <Wifi className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-3xl font-semibold tabular-nums">
                  {health.networkLatency}ms
                </div>
                <div className="text-xs text-muted-foreground">Avg response time</div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {/* Connection Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {isLoading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : health ? (
          <>
            <StatCard
              title="RPC Connections"
              value={health.rpcConnections}
              icon={Server}
              subtitle="HTTP/JSON-RPC"
            />
            <StatCard
              title="WebSocket Connections"
              value={health.wsConnections}
              icon={Wifi}
              subtitle="Active streams"
            />
            <StatCard
              title="Connected Peers"
              value={health.peersConnected}
              icon={Server}
              subtitle="P2P network"
            />
          </>
        ) : null}
      </div>

      {/* TBURN v7.0: Predictive Self-Healing System */}
      <Card className="border-2 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-500" />
            Self-Healing Prediction Algorithms
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            AI-powered anomaly detection and predictive maintenance
          </p>
        </CardHeader>
        <CardContent>
          {isStatsLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          ) : networkStats ? (
            <div className="grid gap-4 md:grid-cols-2">
              {/* Trend Analysis */}
              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Trend Analysis
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl font-semibold tabular-nums text-blue-600 dark:text-blue-400">
                    {(networkStats.trendAnalysisScore / 100).toFixed(1)}%
                  </div>
                  <Progress value={networkStats.trendAnalysisScore / 100} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    Historical pattern recognition
                  </div>
                </CardContent>
              </Card>

              {/* Anomaly Detection */}
              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Anomaly Detection
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl font-semibold tabular-nums text-yellow-600 dark:text-yellow-400">
                    {(networkStats.anomalyDetectionScore / 100).toFixed(1)}%
                  </div>
                  <Progress value={networkStats.anomalyDetectionScore / 100} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    Real-time outlier identification
                  </div>
                </CardContent>
              </Card>

              {/* Pattern Matching */}
              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pattern Matching
                  </CardTitle>
                  <Network className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl font-semibold tabular-nums text-green-600 dark:text-green-400">
                    {(networkStats.patternMatchingScore / 100).toFixed(1)}%
                  </div>
                  <Progress value={networkStats.patternMatchingScore / 100} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    Behavioral signature analysis
                  </div>
                </CardContent>
              </Card>

              {/* Timeseries Analysis */}
              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Timeseries Forecast
                  </CardTitle>
                  <Clock className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl font-semibold tabular-nums text-purple-600 dark:text-purple-400">
                    {(networkStats.timeseriesScore / 100).toFixed(1)}%
                  </div>
                  <Progress value={networkStats.timeseriesScore / 100} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    Predictive failure prevention
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No prediction data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>System Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : health ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div className="flex items-center gap-3">
                  <Cpu className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">CPU Usage</div>
                    <div className="text-sm text-muted-foreground">
                      {health.cpuUsage < 70 ? "Normal operation" : health.cpuUsage < 90 ? "High load" : "Critical"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={health.cpuUsage} className="w-32" />
                  <span className={`font-semibold tabular-nums ${getUsageColor(health.cpuUsage)}`}>
                    {health.cpuUsage}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-md">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Memory Usage</div>
                    <div className="text-sm text-muted-foreground">
                      {health.memoryUsage < 70 ? "Normal operation" : health.memoryUsage < 90 ? "High usage" : "Critical"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={health.memoryUsage} className="w-32" />
                  <span className={`font-semibold tabular-nums ${getUsageColor(health.memoryUsage)}`}>
                    {health.memoryUsage}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-md">
                <div className="flex items-center gap-3">
                  <HardDrive className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Disk Usage</div>
                    <div className="text-sm text-muted-foreground">
                      {health.diskUsage < 70 ? "Sufficient space" : health.diskUsage < 90 ? "Low space" : "Critical"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={health.diskUsage} className="w-32" />
                  <span className={`font-semibold tabular-nums ${getUsageColor(health.diskUsage)}`}>
                    {health.diskUsage}%
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No health data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
