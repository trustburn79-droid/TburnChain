import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Flame, 
  Clock, 
  TrendingDown,
  Activity,
  Brain,
  Zap,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { formatNumber, formatTokenAmount } from "@/lib/formatters";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from "recharts";

interface BurnEvent {
  id: string;
  burnType: "transaction" | "timed" | "volume" | "community" | "ai_optimized" | "manual";
  amount: string;
  reason: string;
  aiRecommended: boolean;
  txHash?: string;
  timestamp: string;
}

interface BurnStats {
  totalBurned: string;
  burnedToday: string;
  burned7d: string;
  burned30d: string;
  transactionBurns: string;
  timedBurns: string;
  volumeBurns: string;
  aiBurns: string;
  currentBurnRate: number;
  targetSupply: string;
  currentSupply: string;
  burnProgress: number;
}

interface BurnConfig {
  txBurnRate: number;
  txBurnEnabled: boolean;
  timeBurnInterval: string;
  timeBurnPercentage: number;
  timeBurnEnabled: boolean;
  volumeThreshold: string;
  volumeBurnRate: number;
  volumeBurnEnabled: boolean;
  aiOptimization: boolean;
  minBurnRate: number;
  maxBurnRate: number;
}

const burnTypeColors = {
  transaction: "#3b82f6",
  timed: "#8b5cf6",
  volume: "#f59e0b",
  community: "#10b981",
  ai_optimized: "#ec4899",
  manual: "#6b7280",
};

const burnTypeLabels = {
  transaction: "Transaction",
  timed: "Timed",
  volume: "Volume",
  community: "Community",
  ai_optimized: "AI Optimized",
  manual: "Manual",
};

export default function BurnDashboard() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: stats, isLoading: statsLoading } = useQuery<BurnStats>({
    queryKey: ["/api/burn/stats"],
  });

  const { data: events, isLoading: eventsLoading } = useQuery<BurnEvent[]>({
    queryKey: ["/api/burn/events"],
  });

  const { data: config, isLoading: configLoading } = useQuery<BurnConfig>({
    queryKey: ["/api/burn/config"],
  });

  const { data: history } = useQuery<{ date: string; amount: number }[]>({
    queryKey: ["/api/burn/history"],
  });

  // Calculate pie chart data
  const pieData = stats ? [
    { name: "Transaction", value: parseFloat(stats.transactionBurns) || 0, color: burnTypeColors.transaction },
    { name: "Timed", value: parseFloat(stats.timedBurns) || 0, color: burnTypeColors.timed },
    { name: "Volume", value: parseFloat(stats.volumeBurns) || 0, color: burnTypeColors.volume },
    { name: "AI Optimized", value: parseFloat(stats.aiBurns) || 0, color: burnTypeColors.ai_optimized },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-burn-title">
            Auto-Burn Dashboard
          </h1>
          <p className="text-muted-foreground">
            AI-Enhanced Autonomous Burn System with Multi-Trigger Mechanisms
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Flame className="h-4 w-4 mr-2 text-orange-500" />
          Deflationary
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card className="hover-elevate" data-testid="card-total-burned">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Burned
                </CardTitle>
                <Flame className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                  {formatTokenAmount(stats?.totalBurned || "0")}
                </div>
                <p className="text-xs text-muted-foreground">
                  TBURN permanently removed
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-burned-today">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Burned Today
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                  {formatTokenAmount(stats?.burnedToday || "0")}
                </div>
                <p className="text-xs text-muted-foreground">
                  24h burn volume
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-burn-rate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Current Burn Rate
                </CardTitle>
                <Activity className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                  {(stats?.currentBurnRate || 0).toFixed(2)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  of transaction fees
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-burn-progress">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Target Progress
                </CardTitle>
                <Target className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                  {(stats?.burnProgress || 0).toFixed(1)}%
                </div>
                <Progress value={stats?.burnProgress || 0} className="h-2 mt-2" />
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" data-testid="tab-overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="events" data-testid="tab-events">
            <Flame className="h-4 w-4 mr-2" />
            Burn Events
          </TabsTrigger>
          <TabsTrigger value="config" data-testid="tab-config">
            <Zap className="h-4 w-4 mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="ai" data-testid="tab-ai">
            <Brain className="h-4 w-4 mr-2" />
            AI Optimization
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Burn History Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  Burn History (30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history || []}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#f97316"
                        fill="#f97316"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Burn Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5" />
                  Burn Distribution by Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Burn Type Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover-elevate">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  Transaction Burns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-semibold">
                  {formatTokenAmount(stats?.transactionBurns || "0")}
                </div>
                <p className="text-xs text-muted-foreground">
                  1% per transaction (AI-optimized)
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  Timed Burns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-semibold">
                  {formatTokenAmount(stats?.timedBurns || "0")}
                </div>
                <p className="text-xs text-muted-foreground">
                  0.1% daily scheduled
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-amber-500" />
                  Volume Burns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-semibold">
                  {formatTokenAmount(stats?.volumeBurns || "0")}
                </div>
                <p className="text-xs text-muted-foreground">
                  Triggered at thresholds
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="h-4 w-4 text-pink-500" />
                  AI Burns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-semibold">
                  {formatTokenAmount(stats?.aiBurns || "0")}
                </div>
                <p className="text-xs text-muted-foreground">
                  AI-recommended optimal burns
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <BurnEventList events={events || []} isLoading={eventsLoading} />
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <BurnConfiguration config={config} isLoading={configLoading} />
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <AIOptimization stats={stats} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BurnEventList({ events, isLoading }: { events: BurnEvent[], isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Flame className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No burn events recorded</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((event) => (
        <Card key={event.id} className="hover-elevate" data-testid={`card-burn-event-${event.id}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className="h-10 w-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${burnTypeColors[event.burnType]}20` }}
                >
                  <Flame 
                    className="h-5 w-5" 
                    style={{ color: burnTypeColors[event.burnType] }} 
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {formatTokenAmount(event.amount)} TBURN
                    </span>
                    <Badge variant="outline" style={{ borderColor: burnTypeColors[event.burnType] }}>
                      {burnTypeLabels[event.burnType]}
                    </Badge>
                    {event.aiRecommended && (
                      <Badge className="bg-pink-500/10 text-pink-500">
                        <Brain className="h-3 w-3 mr-1" />
                        AI
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{event.reason}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  {new Date(event.timestamp).toLocaleString()}
                </p>
                {event.txHash && (
                  <p className="text-xs font-mono text-muted-foreground">
                    {event.txHash.substring(0, 10)}...
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function BurnConfiguration({ config, isLoading }: { config?: BurnConfig, isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            Transaction Burn
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Status</span>
            <Badge variant={config?.txBurnEnabled ? "default" : "secondary"}>
              {config?.txBurnEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Burn Rate</span>
            <span className="font-mono">{config?.txBurnRate || 0} bps</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Tokens burned from each transaction as a percentage of the transfer amount.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-500" />
            Timed Burn
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Status</span>
            <Badge variant={config?.timeBurnEnabled ? "default" : "secondary"}>
              {config?.timeBurnEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Interval</span>
            <span className="font-mono">{config?.timeBurnInterval || "24h"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Percentage</span>
            <span className="font-mono">{config?.timeBurnPercentage || 0}%</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-amber-500" />
            Volume Burn
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Status</span>
            <Badge variant={config?.volumeBurnEnabled ? "default" : "secondary"}>
              {config?.volumeBurnEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Threshold</span>
            <span className="font-mono">{formatTokenAmount(config?.volumeThreshold || "0")}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Burn Rate</span>
            <span className="font-mono">{config?.volumeBurnRate || 0} bps</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-pink-500" />
            AI Optimization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Status</span>
            <Badge variant={config?.aiOptimization ? "default" : "secondary"}>
              {config?.aiOptimization ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Min Rate</span>
            <span className="font-mono">{config?.minBurnRate || 0} bps</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Max Rate</span>
            <span className="font-mono">{config?.maxBurnRate || 0} bps</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AIOptimization({ stats }: { stats?: BurnStats }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            AI Burn Optimization Engine
          </CardTitle>
          <CardDescription>
            Uses Triple-Band AI to optimize burn rates based on market conditions and tokenomics goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
              <h4 className="font-semibold mb-2">Strategic Analysis</h4>
              <p className="text-sm text-muted-foreground">
                GPT-5 Turbo analyzes long-term supply goals, market conditions, and economic impact to set optimal burn targets.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
              <h4 className="font-semibold mb-2">Tactical Adjustment</h4>
              <p className="text-sm text-muted-foreground">
                Claude Sonnet 4.5 makes real-time adjustments based on network congestion, transaction volume, and price volatility.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <h4 className="font-semibold mb-2">Operational Execution</h4>
              <p className="text-sm text-muted-foreground">
                Llama 3.3 70B executes burns at optimal times, considering gas costs and network conditions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Burn Optimization Factors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Current Supply vs Target</span>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Market Price Analysis</span>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Network Congestion</span>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Historical Burn Data</span>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Staking Ratio Impact</span>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
