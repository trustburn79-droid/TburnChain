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

const getBurnTypeLabel = (t: (key: string) => string, type: string) => {
  const labels: Record<string, string> = {
    transaction: t("burn.burnTypes.transaction"),
    timed: t("burn.burnTypes.timed"),
    volume: t("burn.burnTypes.volume"),
    community: t("burn.burnTypes.community"),
    ai_optimized: t("burn.burnTypes.aiOptimized"),
    manual: t("burn.burnTypes.manual"),
  };
  return labels[type] || type;
};

const getBurnReasonTranslation = (t: (key: string, options?: Record<string, unknown>) => string, reason: string) => {
  if (reason.startsWith("Transaction burn:")) {
    const bps = reason.match(/(\d+)\s*bps/)?.[1] || "100";
    return t("burn.events.reasons.transactionBurn", { bps });
  }
  if (reason.startsWith("AI-optimized burn: Market conditions")) {
    return t("burn.events.reasons.aiMarketConditions");
  }
  if (reason.startsWith("AI-optimized burn: High network")) {
    return t("burn.events.reasons.aiNetworkCongestion");
  }
  if (reason.startsWith("Scheduled burn:")) {
    const percentage = reason.match(/(\d+\.?\d*%)/)?.[1] || "0.1%";
    return t("burn.events.reasons.scheduledBurn", { percentage });
  }
  if (reason.startsWith("Volume threshold exceeded:")) {
    const match = reason.match(/(\d+M)\s*>\s*(\d+M)/);
    const current = match?.[1] || "10M";
    const threshold = match?.[2] || "5M";
    return t("burn.events.reasons.volumeThreshold", { current, threshold });
  }
  if (reason.includes("Governance-approved") || reason.includes("community burn")) {
    return t("burn.events.reasons.governanceBurn");
  }
  return reason;
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
    { name: t("burn.burnTypes.transaction"), value: parseFloat(stats.transactionBurns) || 0, color: burnTypeColors.transaction },
    { name: t("burn.burnTypes.timed"), value: parseFloat(stats.timedBurns) || 0, color: burnTypeColors.timed },
    { name: t("burn.burnTypes.volume"), value: parseFloat(stats.volumeBurns) || 0, color: burnTypeColors.volume },
    { name: t("burn.burnTypes.aiOptimized"), value: parseFloat(stats.aiBurns) || 0, color: burnTypeColors.ai_optimized },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-burn-title">
            {t("burn.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("burn.subtitle")}
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Flame className="h-4 w-4 mr-2 text-orange-500" />
          {t("burn.deflationary")}
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
                  {t("burn.totalBurned")}
                </CardTitle>
                <Flame className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                  {formatTokenAmount(stats?.totalBurned || "0")}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("burn.tburnPermanentlyRemoved")}
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-burned-today">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("burn.burnedToday")}
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                  {formatTokenAmount(stats?.burnedToday || "0")}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("burn.burn24hVolume")}
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-burn-rate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("burn.currentBurnRate")}
                </CardTitle>
                <Activity className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                  {(stats?.currentBurnRate || 0).toFixed(2)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("burn.ofTransactionFees")}
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-burn-progress">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("burn.targetProgress")}
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
            {t("burn.tabs.overview")}
          </TabsTrigger>
          <TabsTrigger value="events" data-testid="tab-events">
            <Flame className="h-4 w-4 mr-2" />
            {t("burn.tabs.events")}
          </TabsTrigger>
          <TabsTrigger value="config" data-testid="tab-config">
            <Zap className="h-4 w-4 mr-2" />
            {t("burn.tabs.configuration")}
          </TabsTrigger>
          <TabsTrigger value="ai" data-testid="tab-ai">
            <Brain className="h-4 w-4 mr-2" />
            {t("burn.tabs.aiOptimization")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Burn History Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  {t("burn.charts.burnHistory30Days")}
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
                  {t("burn.charts.burnDistributionByType")}
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
                  {t("burn.burnTypeCards.transactionBurns")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-semibold">
                  {formatTokenAmount(stats?.transactionBurns || "0")}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("burn.burnTypeCards.transactionBurnsDesc")}
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  {t("burn.burnTypeCards.timedBurns")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-semibold">
                  {formatTokenAmount(stats?.timedBurns || "0")}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("burn.burnTypeCards.timedBurnsDesc")}
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-amber-500" />
                  {t("burn.burnTypeCards.volumeBurns")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-semibold">
                  {formatTokenAmount(stats?.volumeBurns || "0")}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("burn.burnTypeCards.volumeBurnsDesc")}
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="h-4 w-4 text-pink-500" />
                  {t("burn.burnTypeCards.aiBurns")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-semibold">
                  {formatTokenAmount(stats?.aiBurns || "0")}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("burn.burnTypeCards.aiBurnsDesc")}
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
  const { t } = useTranslation();
  
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
          <p className="text-muted-foreground">{t("burn.events.noBurnEventsRecorded")}</p>
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
                      {formatTokenAmount(event.amount)}
                    </span>
                    <Badge variant="outline" style={{ borderColor: burnTypeColors[event.burnType] }}>
                      {getBurnTypeLabel(t, event.burnType)}
                    </Badge>
                    {event.aiRecommended && (
                      <Badge className="bg-pink-500/10 text-pink-500">
                        <Brain className="h-3 w-3 mr-1" />
                        {t("burn.events.ai")}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{getBurnReasonTranslation(t, event.reason)}</p>
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
  const { t } = useTranslation();
  
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
            {t("burn.config.transactionBurn")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">{t("burn.config.status")}</span>
            <Badge variant={config?.txBurnEnabled ? "default" : "secondary"}>
              {config?.txBurnEnabled ? t("burn.config.enabled") : t("burn.config.disabled")}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">{t("burn.config.burnRate")}</span>
            <span className="font-mono">{config?.txBurnRate || 0} {t("burn.config.bps")}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("burn.config.transactionBurnDesc")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-500" />
            {t("burn.config.timedBurn")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">{t("burn.config.status")}</span>
            <Badge variant={config?.timeBurnEnabled ? "default" : "secondary"}>
              {config?.timeBurnEnabled ? t("burn.config.enabled") : t("burn.config.disabled")}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">{t("burn.config.interval")}</span>
            <span className="font-mono">{config?.timeBurnInterval || "24h"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">{t("burn.config.percentage")}</span>
            <span className="font-mono">{config?.timeBurnPercentage || 0}%</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-amber-500" />
            {t("burn.config.volumeBurn")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">{t("burn.config.status")}</span>
            <Badge variant={config?.volumeBurnEnabled ? "default" : "secondary"}>
              {config?.volumeBurnEnabled ? t("burn.config.enabled") : t("burn.config.disabled")}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">{t("burn.config.threshold")}</span>
            <span className="font-mono">{formatTokenAmount(config?.volumeThreshold || "0")}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">{t("burn.config.burnRate")}</span>
            <span className="font-mono">{config?.volumeBurnRate || 0} {t("burn.config.bps")}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-pink-500" />
            {t("burn.config.aiOptimization")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">{t("burn.config.status")}</span>
            <Badge variant={config?.aiOptimization ? "default" : "secondary"}>
              {config?.aiOptimization ? t("burn.config.enabled") : t("burn.config.disabled")}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">{t("burn.config.minRate")}</span>
            <span className="font-mono">{config?.minBurnRate || 0} {t("burn.config.bps")}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">{t("burn.config.maxRate")}</span>
            <span className="font-mono">{config?.maxBurnRate || 0} {t("burn.config.bps")}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AIOptimization({ stats }: { stats?: BurnStats }) {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            {t("burn.aiOptimization.title")}
          </CardTitle>
          <CardDescription>
            {t("burn.aiOptimization.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
              <h4 className="font-semibold mb-2">{t("burn.aiOptimization.strategicAnalysis")}</h4>
              <p className="text-sm text-muted-foreground">
                {t("burn.aiOptimization.strategicAnalysisDesc")}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
              <h4 className="font-semibold mb-2">{t("burn.aiOptimization.tacticalAdjustment")}</h4>
              <p className="text-sm text-muted-foreground">
                {t("burn.aiOptimization.tacticalAdjustmentDesc")}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <h4 className="font-semibold mb-2">{t("burn.aiOptimization.operationalExecution")}</h4>
              <p className="text-sm text-muted-foreground">
                {t("burn.aiOptimization.operationalExecutionDesc")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("burn.aiOptimization.burnOptimizationFactors")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{t("burn.aiOptimization.currentSupplyVsTarget")}</span>
              </div>
              <Badge variant="outline">{t("burn.aiOptimization.active")}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{t("burn.aiOptimization.marketPriceAnalysis")}</span>
              </div>
              <Badge variant="outline">{t("burn.aiOptimization.active")}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{t("burn.aiOptimization.networkCongestion")}</span>
              </div>
              <Badge variant="outline">{t("burn.aiOptimization.active")}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{t("burn.aiOptimization.historicalBurnData")}</span>
              </div>
              <Badge variant="outline">{t("burn.aiOptimization.active")}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{t("burn.aiOptimization.stakingRatioImpact")}</span>
              </div>
              <Badge variant="outline">{t("burn.aiOptimization.active")}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
