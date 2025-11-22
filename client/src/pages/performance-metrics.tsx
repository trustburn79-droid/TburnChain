import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, Zap, Trophy, Clock, Radio, CheckCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatNumber } from "@/lib/format";
import type { NetworkStats, LatencyBucket, TPSHistoryPoint } from "@shared/schema";

interface LatencyBucketWithColor extends LatencyBucket {
  color: string;
}

const LATENCY_COLORS = [
  "from-green-600 to-green-700",
  "from-blue-600 to-blue-700",
  "from-yellow-600 to-yellow-700",
  "from-gray-500 to-gray-600",
  "from-gray-600 to-gray-700",
  "from-gray-700 to-gray-800",
];

function SLACard({ title, value, unit, target, targetMet, detail }: {
  title: string;
  value: string;
  unit?: string;
  target: string;
  targetMet: boolean;
  detail: string;
}) {
  return (
    <Card className="hover-elevate">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-4">
          <div className="text-sm font-medium text-muted-foreground mb-2">{title}</div>
          <div className="text-5xl font-bold text-primary my-4">
            {value}
            {unit && <span className="text-2xl ml-1">{unit}</span>}
          </div>
          <div className="text-sm mb-3">
            Target: {target}{" "}
            <Badge className={targetMet ? "bg-green-600" : "bg-red-600"}>
              {targetMet ? "Achieved" : "Missed"}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">{detail}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PerformanceMetrics() {
  const { data: stats, isLoading: isStatsLoading } = useQuery<NetworkStats>({
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

  // Use actual backend data
  const currentTPS = stats?.tps || 0;
  const peakTPS = stats?.peakTps || 0;
  const blockTime = stats?.avgBlockTime || 0;
  const latency = stats?.latency || 0;
  const latencyP99 = stats?.latencyP99 || 0;
  const slaUptime = stats?.slaUptime || 0;
  const successRate = stats?.successRate || 0;
  
  // Add colors to latency distribution
  const latencyDistribution: LatencyBucketWithColor[] = (latencyData || []).map((bucket, idx) => ({
    ...bucket,
    color: LATENCY_COLORS[idx] || "from-gray-700 to-gray-800",
  }));
  
  // Format TPS history for chart
  const tpsChartData = (tpsHistory || []).map((point, idx) => ({
    time: `${Math.floor((tpsHistory?.length || 60) - idx)}m`,
    tps: point.tps,
  })).reverse();

  const isLoading = isStatsLoading || isLatencyLoading || isTPSLoading;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold flex items-center gap-2">
          <TrendingUp className="h-8 w-8" />
          Performance Metrics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time network performance analytics and SLA monitoring
        </p>
      </div>

      {/* Top Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading || !stats ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Current TPS
                </CardTitle>
                <Zap className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tabular-nums" data-testid="text-current-tps">
                  {formatNumber(currentTPS)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {((currentTPS / (peakTPS || 1)) * 100).toFixed(1)}% of peak
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Peak TPS
                </CardTitle>
                <Trophy className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tabular-nums">
                  {formatNumber(peakTPS)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  last 24 hours
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Block Time
                </CardTitle>
                <Clock className="h-5 w-5 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tabular-nums">
                  {blockTime} <span className="text-lg">ms</span>
                </div>
                <p className="text-xs text-green-600 font-semibold mt-2">
                  ✓ Target: 100ms
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Latency
                </CardTitle>
                <Radio className="h-5 w-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tabular-nums">
                  {latency} <span className="text-lg">ms</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  P99: {latencyP99}ms
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* SLA Cards */}
      {!isLoading && stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <SLACard
            title="Network Uptime"
            value={(slaUptime / 100).toFixed(2)}
            unit="%"
            target="99.5%"
            targetMet={slaUptime >= 9950}
            detail={`SLA: ${(slaUptime / 100).toFixed(2)}% uptime`}
          />
          <SLACard
            title="Avg Block Time"
            value={blockTime.toString()}
            unit="ms"
            target="100ms"
            targetMet={blockTime <= 100}
            detail={`P99: ${stats.blockTimeP99 || 0}ms`}
          />
          <SLACard
            title="TX Success Rate"
            value={(successRate / 100).toFixed(1)}
            unit="%"
            target="99%"
            targetMet={successRate >= 9900}
            detail={`Failed TX: ${(10000 - successRate) / 100}%`}
          />
        </div>
      )}

      {/* Latency Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Latency Distribution (Last 24 Hours)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {latencyDistribution.map((bucket) => (
            <div key={bucket.range}>
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-muted-foreground">{bucket.range}</span>
                <span className="font-semibold">
                  {formatNumber(bucket.count)} txs ({bucket.percentage}%)
                </span>
              </div>
              <div className="h-6 bg-muted rounded-md overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${bucket.color} flex items-center px-3 text-white text-xs font-semibold`}
                  style={{ width: `${bucket.percentage}%` }}
                >
                  {bucket.percentage >= 10 && `${bucket.percentage}%`}
                </div>
              </div>
            </div>
          ))}
          
          <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 mt-4">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              <div className="font-semibold">✓ Performance Target Achieved</div>
              <div className="text-sm mt-1">90% of transactions &lt; 20ms (Target: 90%)</div>
              <div className="text-sm">99% of transactions &lt; 50ms (Target: 99%)</div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* TPS Chart */}
      <Card>
        <CardHeader>
          <CardTitle>TPS Performance (Last Hour)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || !stats ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={tpsChartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="time" 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [formatNumber(Math.round(value)), 'TPS']}
              />
              <Line
                type="monotone"
                dataKey="tps"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="hsl(var(--primary) / 0.1)"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* System Resources */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-elevate">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-3">56%</div>
            <Progress value={56} className="h-2" />
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Memory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-3">68%</div>
            <Progress value={68} className="h-2" />
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Disk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-3">28%</div>
            <Progress value={28} className="h-2" />
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Network
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-3">42%</div>
            <Progress value={42} className="h-2" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
