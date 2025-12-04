import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { 
  Flame, Clock, TrendingUp, Brain, Calendar, Target, 
  History, Settings, AlertTriangle, Zap, BarChart3,
  RefreshCw, Download, Wifi, WifiOff
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface BurnStats {
  totalBurned: string;
  burnPercentage: string;
  dailyBurn: string;
  weeklyBurn: string;
  targetSupply: string;
  currentSupply: string;
  burnVelocity: string;
}

interface BurnHistoryItem {
  date: string;
  txBurn: number;
  timeBurn: number;
  aiBurn: number;
}

interface ScheduledBurn {
  id: number;
  type: string;
  amount: string;
  schedule: string;
  status: string;
  nextRun: string;
}

interface BurnEvent {
  id: number;
  type: string;
  amount: string;
  txHash: string;
  timestamp: string;
}

interface BurnData {
  stats: BurnStats;
  history: BurnHistoryItem[];
  scheduledBurns: ScheduledBurn[];
  events: BurnEvent[];
}

export default function AdminBurnControl() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [txBurnRate, setTxBurnRate] = useState([1.0]);
  const [timeBurnRate, setTimeBurnRate] = useState([0.1]);
  const [wsConnected, setWsConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const { data, isLoading, error, refetch } = useQuery<BurnData>({
    queryKey: ['/api/admin/burn/stats'],
    refetchInterval: 30000,
  });

  const burnStats = data?.stats || {
    totalBurned: "100,000,000",
    burnPercentage: "10.0",
    dailyBurn: "150,000",
    weeklyBurn: "1,050,000",
    targetSupply: "500,000,000",
    currentSupply: "900,000,000",
    burnVelocity: "6,250",
  };

  const burnHistory = data?.history || [
    { date: "Dec 3", txBurn: 45000, timeBurn: 30000, aiBurn: 75000 },
    { date: "Dec 2", txBurn: 42000, timeBurn: 30000, aiBurn: 68000 },
    { date: "Dec 1", txBurn: 48000, timeBurn: 30000, aiBurn: 82000 },
    { date: "Nov 30", txBurn: 40000, timeBurn: 30000, aiBurn: 65000 },
    { date: "Nov 29", txBurn: 44000, timeBurn: 30000, aiBurn: 70000 },
    { date: "Nov 28", txBurn: 46000, timeBurn: 30000, aiBurn: 72000 },
    { date: "Nov 27", txBurn: 41000, timeBurn: 30000, aiBurn: 66000 },
  ];

  const scheduledBurns = data?.scheduledBurns || [
    { id: 1, type: "Time-based", amount: "500,000 TBURN", schedule: "Daily at 00:00 UTC", status: "active", nextRun: "2024-12-04 00:00" },
    { id: 2, type: "Volume-based", amount: "0.5% of volume", schedule: "When 24h volume > 10M", status: "active", nextRun: "Condition-based" },
    { id: 3, type: "AI Optimized", amount: "AI calculated", schedule: "Every 6 hours", status: "active", nextRun: "2024-12-03 18:00" },
  ];

  const burnEvents = data?.events || [
    { id: 1, type: "Transaction", amount: "12,500", txHash: "0xabc...123", timestamp: "2024-12-03 14:30:25" },
    { id: 2, type: "AI Optimized", amount: "75,000", txHash: "0xdef...456", timestamp: "2024-12-03 12:00:00" },
    { id: 3, type: "Time-based", amount: "30,000", txHash: "0xghi...789", timestamp: "2024-12-03 00:00:00" },
    { id: 4, type: "Manual", amount: "100,000", txHash: "0xjkl...012", timestamp: "2024-12-02 15:45:30" },
  ];

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        ws = new WebSocket(`${protocol}//${window.location.host}/ws/admin/burn`);

        ws.onopen = () => {
          setWsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === 'burn_event') {
              queryClient.invalidateQueries({ queryKey: ['/api/admin/burn/stats'] });
              setLastUpdate(new Date());
            }
          } catch (e) {
            console.error('WebSocket message parse error:', e);
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
          reconnectTimeout = setTimeout(connectWebSocket, 5000);
        };

        ws.onerror = () => {
          setWsConnected(false);
        };
      } catch (error) {
        console.error('WebSocket connection error:', error);
        setWsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
      clearTimeout(reconnectTimeout);
    };
  }, []);

  const updateRatesMutation = useMutation({
    mutationFn: async (data: { txBurnRate: number; timeBurnRate: number }) => {
      const response = await fetch('/api/admin/burn/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update rates');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t("adminBurnControl.ratesUpdated"),
        description: t("adminBurnControl.ratesUpdatedDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/burn/stats'] });
    },
  });

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      setLastUpdate(new Date());
      toast({
        title: t("adminBurnControl.refresh"),
        description: t("adminBurnControl.ratesUpdatedDesc"),
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = {
      burnStats,
      burnHistory,
      scheduledBurns,
      burnEvents,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `burn-control-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: t("adminBurnControl.export"),
      description: t("adminBurnControl.ratesUpdatedDesc"),
    });
  }, [burnStats, burnHistory, scheduledBurns, burnEvents, toast, t]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6" data-testid="error-state">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">{t("adminBurnControl.error.title")}</h2>
        <p className="text-muted-foreground mb-4">{t("adminBurnControl.error.description")}</p>
        <Button onClick={() => refetch()} data-testid="button-retry">
          {t("adminBurnControl.retry")}
        </Button>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">{t("adminBurnControl.title")}</h1>
            <p className="text-muted-foreground">{t("adminBurnControl.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={wsConnected ? "default" : "secondary"} data-testid="badge-ws-status">
              {wsConnected ? (
                <><Wifi className="w-3 h-3 mr-1" /> {t("adminBurnControl.connected")}</>
              ) : (
                <><WifiOff className="w-3 h-3 mr-1" /> {t("adminBurnControl.reconnecting")}</>
              )}
            </Badge>
            {lastUpdate && (
              <span className="text-xs text-muted-foreground" data-testid="text-last-update">
                {t("adminBurnControl.lastUpdate")}: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} data-testid="button-refresh">
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? t("adminBurnControl.refreshing") : t("adminBurnControl.refresh")}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} data-testid="button-export">
              <Download className="w-4 h-4 mr-2" />
              {t("adminBurnControl.export")}
            </Button>
            <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/30" data-testid="badge-deflationary">
              <Flame className="w-3 h-3 mr-1" />
              {t("adminBurnControl.deflationaryActive")}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} data-testid={`card-stat-skeleton-${index}`}>
                <CardContent className="pt-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-32 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20" data-testid="card-total-burned">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-orange-500 mb-2">
                    <Flame className="w-5 h-5" />
                    <span className="text-sm">{t("adminBurnControl.totalBurned")}</span>
                  </div>
                  <div className="text-3xl font-bold" data-testid="text-total-burned">{burnStats.totalBurned}</div>
                  <div className="text-sm text-muted-foreground">TBURN</div>
                </CardContent>
              </Card>
              <Card data-testid="card-burn-rate">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-sm">{t("adminBurnControl.burnRate")}</span>
                  </div>
                  <div className="text-3xl font-bold" data-testid="text-burn-rate">{burnStats.burnPercentage}%</div>
                  <div className="text-sm text-muted-foreground">{t("adminBurnControl.ofTotalSupply")}</div>
                </CardContent>
              </Card>
              <Card data-testid="card-daily-burn">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Clock className="w-5 h-5" />
                    <span className="text-sm">{t("adminBurnControl.dailyBurn")}</span>
                  </div>
                  <div className="text-3xl font-bold" data-testid="text-daily-burn">{burnStats.dailyBurn}</div>
                  <div className="text-sm text-muted-foreground">TBURN</div>
                </CardContent>
              </Card>
              <Card data-testid="card-burn-velocity">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Zap className="w-5 h-5" />
                    <span className="text-sm">{t("adminBurnControl.burnVelocity")}</span>
                  </div>
                  <div className="text-3xl font-bold" data-testid="text-burn-velocity">{burnStats.burnVelocity}</div>
                  <div className="text-sm text-muted-foreground">{t("adminBurnControl.tburnPerHour")}</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <Card data-testid="card-supply-target">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              {t("adminBurnControl.supplyTargetProgress")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span>{t("adminBurnControl.currentSupply")}: {burnStats.currentSupply} TBURN</span>
                  <span>{t("adminBurnControl.targetSupply")}: {burnStats.targetSupply} TBURN</span>
                </div>
                <Progress value={55.6} className="h-3" data-testid="progress-supply-target" />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>44.4% {t("adminBurnControl.remainingToTarget")}</span>
                  <span>{t("adminBurnControl.estimatedCompletion", { days: 640 })}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="rates" className="space-y-4">
          <TabsList data-testid="tabs-list">
            <TabsTrigger value="rates" data-testid="tab-rates">
              <Settings className="w-4 h-4 mr-2" />
              {t("adminBurnControl.burnRates")}
            </TabsTrigger>
            <TabsTrigger value="ai" data-testid="tab-ai">
              <Brain className="w-4 h-4 mr-2" />
              {t("adminBurnControl.aiOptimization")}
            </TabsTrigger>
            <TabsTrigger value="schedule" data-testid="tab-schedule">
              <Calendar className="w-4 h-4 mr-2" />
              {t("adminBurnControl.schedules")}
            </TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              {t("adminBurnControl.analytics")}
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">
              <History className="w-4 h-4 mr-2" />
              {t("adminBurnControl.recentBurnEvents")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rates" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card data-testid="card-tx-burn-rate">
                <CardHeader>
                  <CardTitle>{t("adminBurnControl.transactionBurnRate")}</CardTitle>
                  <CardDescription>{t("adminBurnControl.transactionBurnRateDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>{t("adminBurnControl.currentRate")}</Label>
                      <span className="text-2xl font-bold" data-testid="text-tx-burn-rate">{txBurnRate[0]}%</span>
                    </div>
                    <Slider
                      value={txBurnRate}
                      onValueChange={setTxBurnRate}
                      min={0.01}
                      max={5}
                      step={0.01}
                      data-testid="slider-tx-burn-rate"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0.01%</span>
                      <span>5%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground">{t("adminBurnControl.estimated24hBurn")}</div>
                    <div className="text-lg font-semibold">~45,000 TBURN</div>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-time-burn-rate">
                <CardHeader>
                  <CardTitle>{t("adminBurnControl.timeBurnRate")}</CardTitle>
                  <CardDescription>{t("adminBurnControl.timeBurnRateDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>{t("adminBurnControl.dailyRate")}</Label>
                      <span className="text-2xl font-bold" data-testid="text-time-burn-rate">{timeBurnRate[0]}%</span>
                    </div>
                    <Slider
                      value={timeBurnRate}
                      onValueChange={setTimeBurnRate}
                      min={0.01}
                      max={1}
                      step={0.01}
                      data-testid="slider-time-burn-rate"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0.01%</span>
                      <span>1%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground">{t("adminBurnControl.nextScheduledBurn")}</div>
                    <div className="text-lg font-semibold">30,000 TBURN at 00:00 UTC</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card data-testid="card-volume-burn">
              <CardHeader>
                <CardTitle>{t("adminBurnControl.volumeBasedBurn")}</CardTitle>
                <CardDescription>{t("adminBurnControl.volumeBasedBurnDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{t("adminBurnControl.volumeThreshold")}</Label>
                    <Input type="number" defaultValue="10000000" data-testid="input-volume-threshold" />
                    <span className="text-xs text-muted-foreground">{t("adminBurnControl.tburn24hVolume")}</span>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminBurnControl.burnRateOnTrigger")}</Label>
                    <Input type="number" defaultValue="0.5" step="0.1" data-testid="input-burn-rate-trigger" />
                    <span className="text-xs text-muted-foreground">{t("adminBurnControl.ofVolume")}</span>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminBurnControl.status")}</Label>
                    <div className="flex items-center gap-2 h-10">
                      <Switch defaultChecked data-testid="switch-volume-burn-enabled" />
                      <span className="text-sm">{t("adminBurnControl.enabled")}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button 
                onClick={() => updateRatesMutation.mutate({ txBurnRate: txBurnRate[0], timeBurnRate: timeBurnRate[0] })}
                disabled={updateRatesMutation.isPending}
                data-testid="button-update-rates"
              >
                {t("adminBurnControl.updateRates")}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <Card data-testid="card-ai-optimization">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  {t("adminBurnControl.aiBurnOptimization")}
                </CardTitle>
                <CardDescription>{t("adminBurnControl.gpt5TurboPowered")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t("adminBurnControl.aiOptimizationToggle")}</p>
                        <p className="text-sm text-muted-foreground">{t("adminBurnControl.allowAiAdjust")}</p>
                      </div>
                      <Switch defaultChecked data-testid="switch-ai-optimization" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("adminBurnControl.minimumConfidence")}</Label>
                      <Input type="number" defaultValue="70" data-testid="input-min-confidence" />
                      <span className="text-xs text-muted-foreground">{t("adminBurnControl.minConfidenceDesc")}</span>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("adminBurnControl.updateFrequency")}</Label>
                      <Input type="number" defaultValue="6" data-testid="input-update-frequency" />
                      <span className="text-xs text-muted-foreground">{t("adminBurnControl.updateFrequencyDesc")}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg" data-testid="card-ai-recommendation">
                      <div className="text-sm text-purple-500 font-medium mb-2">{t("adminBurnControl.currentAiRecommendation")}</div>
                      <div className="text-2xl font-bold" data-testid="text-ai-recommended-rate">1.15%</div>
                      <div className="text-sm text-muted-foreground">{t("adminBurnControl.transactionBurnRateLabel")}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="bg-green-500/10 text-green-500">
                          85% {t("adminBurnControl.confidence")}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{t("adminBurnControl.basedOnMarketAnalysis")}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("adminBurnControl.aiImpactWeight")}</Label>
                      <Slider defaultValue={[50]} min={0} max={100} data-testid="slider-ai-impact" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{t("adminBurnControl.manualOnly")}</span>
                        <span>{t("adminBurnControl.fullAiControl")}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg" data-testid="card-optimization-goals">
                  <h4 className="font-medium mb-2">{t("adminBurnControl.optimizationGoals")}</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">{t("adminBurnControl.targetSupply")}:</span>
                      <p className="font-medium">500M TBURN</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t("adminBurnControl.targetTimeline")}:</span>
                      <p className="font-medium">2 {t("adminBurnControl.years")}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t("adminBurnControl.priority")}:</span>
                      <p className="font-medium">{t("adminBurnControl.priceStability")}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <Card data-testid="card-scheduled-burns">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {t("adminBurnControl.scheduledBurns")}
                </CardTitle>
                <CardDescription>{t("adminBurnControl.automatedSchedules")}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <>
                    <Table data-testid="table-scheduled-burns">
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("adminBurnControl.type")}</TableHead>
                          <TableHead>{t("adminBurnControl.amount")}</TableHead>
                          <TableHead>{t("adminBurnControl.schedule")}</TableHead>
                          <TableHead>{t("adminBurnControl.status")}</TableHead>
                          <TableHead>{t("adminBurnControl.nextRun")}</TableHead>
                          <TableHead>{t("adminBurnControl.actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {scheduledBurns.map((burn) => (
                          <TableRow key={burn.id} data-testid={`row-scheduled-burn-${burn.id}`}>
                            <TableCell className="font-medium">{burn.type}</TableCell>
                            <TableCell>{burn.amount}</TableCell>
                            <TableCell>{burn.schedule}</TableCell>
                            <TableCell>
                              <Badge variant={burn.status === "active" ? "default" : "secondary"}>
                                {burn.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{burn.nextRun}</TableCell>
                            <TableCell>
                              <Button size="sm" variant="ghost" data-testid={`button-edit-schedule-${burn.id}`}>
                                {t("adminBurnControl.edit")}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="mt-4">
                      <Button variant="outline" data-testid="button-add-schedule">
                        <Calendar className="w-4 h-4 mr-2" />
                        {t("adminBurnControl.addSchedule")}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card data-testid="card-burn-analytics">
              <CardHeader>
                <CardTitle>{t("adminBurnControl.burnAnalytics")}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-80 w-full" />
                ) : (
                  <div className="h-80" data-testid="chart-burn-analytics">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={burnHistory}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip />
                        <Area type="monotone" dataKey="txBurn" stackId="1" stroke="#f97316" fill="#f97316" fillOpacity={0.3} name={t("adminBurnControl.txBurn")} />
                        <Area type="monotone" dataKey="timeBurn" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name={t("adminBurnControl.timeBurn")} />
                        <Area type="monotone" dataKey="aiBurn" stackId="1" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} name={t("adminBurnControl.aiBurn")} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card data-testid="card-burn-events">
              <CardHeader>
                <CardTitle>{t("adminBurnControl.recentBurnEvents")}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table data-testid="table-burn-events">
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("adminBurnControl.type")}</TableHead>
                        <TableHead>{t("adminBurnControl.amount")}</TableHead>
                        <TableHead>{t("adminBurnControl.txHash")}</TableHead>
                        <TableHead>{t("adminBurnControl.timestamp")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {burnEvents.map((event) => (
                        <TableRow key={event.id} data-testid={`row-burn-event-${event.id}`}>
                          <TableCell>
                            <Badge variant="outline">{event.type}</Badge>
                          </TableCell>
                          <TableCell className="font-mono">{event.amount} TBURN</TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">{event.txHash}</TableCell>
                          <TableCell className="text-muted-foreground">{event.timestamp}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
