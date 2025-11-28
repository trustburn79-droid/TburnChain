import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const { data: health, isLoading } = useQuery<NodeHealth>({
    queryKey: ["/api/node/health"],
  });

  const { data: networkStats, isLoading: isStatsLoading } = useQuery<NetworkStats>({
    queryKey: ["/api/network/stats"],
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-green-600">{t('nodeHealth.healthy')}</Badge>;
      case "degraded":
        return <Badge variant="secondary" className="bg-yellow-600">{t('nodeHealth.degraded')}</Badge>;
      case "unhealthy":
        return <Badge variant="destructive">{t('nodeHealth.unhealthy')}</Badge>;
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
            {t('nodeHealth.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('nodeHealth.subtitle')}
          </p>
        </div>
        <LiveIndicator label={t('nodeHealth.monitoring')} />
      </div>

      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              {t('nodeHealth.nodeStatus')}
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
                  <div className="text-sm text-muted-foreground mb-1">{t('nodeHealth.uptime')}</div>
                  <div className="text-xl font-semibold tabular-nums">
                    {formatUptime(health.uptime)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">{t('nodeHealth.syncStatus')}</div>
                  <div className="text-xl font-semibold">
                    {health.syncStatus}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">{t('nodeHealth.lastBlock')}</div>
                  <div className="text-xl font-semibold tabular-nums">
                    {health.lastBlockTime}s {t('nodeHealth.ago')}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

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
                  {t('nodeHealth.cpuUsage')}
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
                  {t('nodeHealth.memoryUsage')}
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
                  {t('nodeHealth.diskUsage')}
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
                  {t('nodeHealth.networkLatency')}
                </CardTitle>
                <Wifi className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-3xl font-semibold tabular-nums">
                  {health.networkLatency}ms
                </div>
                <div className="text-xs text-muted-foreground">{t('nodeHealth.avgResponseTime')}</div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

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
              title={t('nodeHealth.rpcConnections')}
              value={health.rpcConnections}
              icon={Server}
              subtitle="HTTP/JSON-RPC"
            />
            <StatCard
              title={t('nodeHealth.wsConnections')}
              value={health.wsConnections}
              icon={Wifi}
              subtitle={t('nodeHealth.activeStreams')}
            />
            <StatCard
              title={t('nodeHealth.connectedPeers')}
              value={health.peersConnected}
              icon={Server}
              subtitle={t('nodeHealth.p2pNetwork')}
            />
          </>
        ) : null}
      </div>

      <Card className="border-2 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-500" />
            {t('nodeHealth.selfHealingAlgorithms')}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t('nodeHealth.aiPoweredAnomalyDetection')}
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
              <Card className="hover-elevate" data-testid="card-selfhealing-trend">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t('nodeHealth.trendAnalysis')}
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl font-semibold tabular-nums text-blue-600 dark:text-blue-400" data-testid="metric-trend-score">
                    {(networkStats.trendAnalysisScore / 100).toFixed(1)}%
                  </div>
                  <Progress value={networkStats.trendAnalysisScore / 100} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {t('nodeHealth.historicalPatternRecognition')}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate" data-testid="card-selfhealing-anomaly">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t('nodeHealth.anomalyDetection')}
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl font-semibold tabular-nums text-yellow-600 dark:text-yellow-400" data-testid="metric-anomaly-score">
                    {(networkStats.anomalyDetectionScore / 100).toFixed(1)}%
                  </div>
                  <Progress value={networkStats.anomalyDetectionScore / 100} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {t('nodeHealth.realtimeOutlierIdentification')}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate" data-testid="card-selfhealing-pattern">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t('nodeHealth.patternMatching')}
                  </CardTitle>
                  <Network className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl font-semibold tabular-nums text-green-600 dark:text-green-400" data-testid="metric-pattern-score">
                    {(networkStats.patternMatchingScore / 100).toFixed(1)}%
                  </div>
                  <Progress value={networkStats.patternMatchingScore / 100} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {t('nodeHealth.behavioralSignatureAnalysis')}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate" data-testid="card-selfhealing-timeseries">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t('nodeHealth.timeseriesForecast')}
                  </CardTitle>
                  <Clock className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl font-semibold tabular-nums text-purple-600 dark:text-purple-400" data-testid="metric-timeseries-score">
                    {(networkStats.timeseriesScore / 100).toFixed(1)}%
                  </div>
                  <Progress value={networkStats.timeseriesScore / 100} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {t('nodeHealth.predictiveFailurePrevention')}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('nodeHealth.noPredictionDataAvailable')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('nodeHealth.systemMetrics')}</CardTitle>
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
                    <div className="font-medium">{t('nodeHealth.cpuUsage')}</div>
                    <div className="text-sm text-muted-foreground">
                      {health.cpuUsage < 70 ? t('nodeHealth.normalOperation') : health.cpuUsage < 90 ? t('nodeHealth.highLoad') : t('nodeHealth.critical')}
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
                    <div className="font-medium">{t('nodeHealth.memoryUsage')}</div>
                    <div className="text-sm text-muted-foreground">
                      {health.memoryUsage < 70 ? t('nodeHealth.normalOperation') : health.memoryUsage < 90 ? t('nodeHealth.highUsage') : t('nodeHealth.critical')}
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
                    <div className="font-medium">{t('nodeHealth.diskUsage')}</div>
                    <div className="text-sm text-muted-foreground">
                      {health.diskUsage < 70 ? t('nodeHealth.sufficientSpace') : health.diskUsage < 90 ? t('nodeHealth.lowSpace') : t('nodeHealth.critical')}
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
              <p className="text-muted-foreground">{t('nodeHealth.noHealthDataAvailable')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
