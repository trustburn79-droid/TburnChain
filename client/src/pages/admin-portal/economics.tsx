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
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { 
  TrendingUp, TrendingDown, Coins, Gift, Percent, PiggyBank, 
  Brain, BarChart3, Target, AlertTriangle, Calculator,
  RefreshCw, Download, Wifi, WifiOff, Eye, Settings
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DetailSheet } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { apiRequest } from "@/lib/queryClient";

interface EconomicMetrics {
  inflationRate: string;
  deflationRate: string;
  netChange: string;
  stakingRatio: string;
  velocity: string;
  giniCoefficient: string;
}

interface RewardDistribution {
  name: string;
  value: number;
  color: string;
}

interface InflationPeriod {
  year: string;
  rate: string;
  blockReward: string;
}

interface SupplyProjection {
  month: string;
  supply: number;
  target: number;
}

interface EconomicsData {
  metrics: EconomicMetrics;
  rewardDistribution: RewardDistribution[];
  inflationSchedule: InflationPeriod[];
  supplyProjection: SupplyProjection[];
}

export default function AdminEconomics() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [wsConnected, setWsConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<{ title: string; value: string; description: string } | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<{ type: string; value: number } | null>(null);

  const { data, isLoading, error, refetch } = useQuery<EconomicsData>({
    queryKey: ['/api/admin/economics'],
    refetchInterval: 60000,
  });

  const economicMetrics = data?.metrics || {
    inflationRate: "3.5",
    deflationRate: "4.2",
    netChange: "-0.7",
    stakingRatio: "45.6",
    velocity: "2.8",
    giniCoefficient: "0.42",
  };

  const rewardDistribution = data?.rewardDistribution || [
    { name: "Validators", value: 40, color: "#3b82f6" },
    { name: "Delegators", value: 35, color: "#22c55e" },
    { name: "Development", value: 15, color: "#f97316" },
    { name: "Community", value: 10, color: "#a855f7" },
  ];

  const inflationSchedule = data?.inflationSchedule || [
    { year: "Year 1", rate: "5.0%", blockReward: "50 TBURN" },
    { year: "Year 2", rate: "4.0%", blockReward: "40 TBURN" },
    { year: "Year 3", rate: "3.0%", blockReward: "30 TBURN" },
    { year: "Year 4", rate: "2.0%", blockReward: "20 TBURN" },
    { year: "Year 5+", rate: "1.0%", blockReward: "10 TBURN" },
  ];

  const supplyProjection = data?.supplyProjection || [
    { month: "Jan", supply: 900, target: 850 },
    { month: "Feb", supply: 895, target: 840 },
    { month: "Mar", supply: 888, target: 830 },
    { month: "Apr", supply: 880, target: 820 },
    { month: "May", supply: 872, target: 810 },
    { month: "Jun", supply: 864, target: 800 },
  ];

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        ws = new WebSocket(`${protocol}//${window.location.host}/ws/admin/economics`);

        ws.onopen = () => {
          setWsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === 'economics_update') {
              queryClient.invalidateQueries({ queryKey: ['/api/admin/economics'] });
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

  const saveParametersMutation = useMutation({
    mutationFn: async (params: Record<string, unknown>) => {
      const response = await apiRequest('POST', '/api/admin/economics/parameters', params);
      return response.json();
    },
    onSuccess: () => {
      setShowSaveConfirm(false);
      setPendingChanges(null);
      toast({
        title: t("adminEconomics.changesSaved"),
        description: t("adminEconomics.changesSavedDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/economics'] });
    },
  });

  const confirmSaveParameters = useCallback(() => {
    if (pendingChanges) {
      saveParametersMutation.mutate({ [pendingChanges.type]: pendingChanges.value });
    }
  }, [pendingChanges, saveParametersMutation]);

  const handleSaveParameter = useCallback((type: string, value: number) => {
    setPendingChanges({ type, value });
    setShowSaveConfirm(true);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      setLastUpdate(new Date());
      toast({
        title: t("adminEconomics.refresh"),
        description: t("adminEconomics.changesSavedDesc"),
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = {
      economicMetrics,
      rewardDistribution,
      inflationSchedule,
      supplyProjection,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `economics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: t("adminEconomics.export"),
      description: t("adminEconomics.changesSavedDesc"),
    });
  }, [economicMetrics, rewardDistribution, inflationSchedule, supplyProjection, toast, t]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6" data-testid="error-state">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">{t("adminEconomics.error.title")}</h2>
        <p className="text-muted-foreground mb-4">{t("adminEconomics.error.description")}</p>
        <Button onClick={() => refetch()} data-testid="button-retry">
          {t("adminEconomics.retry")}
        </Button>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">{t("adminEconomics.title")}</h1>
            <p className="text-muted-foreground">{t("adminEconomics.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={wsConnected ? "default" : "secondary"} data-testid="badge-ws-status">
              {wsConnected ? (
                <><Wifi className="w-3 h-3 mr-1" /> {t("adminEconomics.connected")}</>
              ) : (
                <><WifiOff className="w-3 h-3 mr-1" /> {t("adminEconomics.reconnecting")}</>
              )}
            </Badge>
            {lastUpdate && (
              <span className="text-xs text-muted-foreground" data-testid="text-last-update">
                {t("adminEconomics.lastUpdate")}: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} data-testid="button-refresh">
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? t("adminEconomics.refreshing") : t("adminEconomics.refresh")}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} data-testid="button-export">
              <Download className="w-4 h-4 mr-2" />
              {t("adminEconomics.export")}
            </Button>
            <Button variant="outline" data-testid="button-simulate">
              <Calculator className="w-4 h-4 mr-2" />
              {t("adminEconomics.simulate")}
            </Button>
            <Button 
              onClick={() => saveParametersMutation.mutate({})} 
              disabled={saveParametersMutation.isPending}
              data-testid="button-save-changes"
            >
              {t("adminEconomics.saveChanges")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} data-testid={`card-metric-skeleton-${index}`}>
                <CardContent className="pt-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-32 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card data-testid="card-inflation-rate">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-muted-foreground">{t("adminEconomics.inflationRate")}</span>
                  </div>
                  <div className="text-3xl font-bold" data-testid="text-inflation-rate">{economicMetrics.inflationRate}%</div>
                  <div className="text-sm text-muted-foreground">{t("adminEconomics.annualTokenCreation")}</div>
                </CardContent>
              </Card>
              <Card data-testid="card-deflation-rate">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-muted-foreground">{t("adminEconomics.deflationRate")}</span>
                  </div>
                  <div className="text-3xl font-bold" data-testid="text-deflation-rate">{economicMetrics.deflationRate}%</div>
                  <div className="text-sm text-muted-foreground">{t("adminEconomics.annualTokenBurn")}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10" data-testid="card-net-change">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-muted-foreground">{t("adminEconomics.netChange")}</span>
                  </div>
                  <div className="text-3xl font-bold text-green-500" data-testid="text-net-change">{economicMetrics.netChange}%</div>
                  <div className="text-sm text-muted-foreground">{t("adminEconomics.deflationary")}</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} data-testid={`card-secondary-metric-skeleton-${index}`}>
                <CardContent className="pt-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-20 mb-1" />
                  <Skeleton className="h-2 w-full mt-2" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card data-testid="card-staking-ratio">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <PiggyBank className="w-5 h-5" />
                    <span className="text-sm text-muted-foreground">{t("adminEconomics.stakingRatio")}</span>
                  </div>
                  <div className="text-2xl font-bold" data-testid="text-staking-ratio">{economicMetrics.stakingRatio}%</div>
                  <Progress value={parseFloat(economicMetrics.stakingRatio)} className="mt-2" data-testid="progress-staking-ratio" />
                </CardContent>
              </Card>
              <Card data-testid="card-token-velocity">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-5 h-5" />
                    <span className="text-sm text-muted-foreground">{t("adminEconomics.tokenVelocity")}</span>
                  </div>
                  <div className="text-2xl font-bold" data-testid="text-token-velocity">{economicMetrics.velocity}x</div>
                  <div className="text-sm text-muted-foreground">{t("adminEconomics.timesCirculated")}</div>
                </CardContent>
              </Card>
              <Card data-testid="card-gini-coefficient">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5" />
                    <span className="text-sm text-muted-foreground">{t("adminEconomics.giniCoefficient")}</span>
                  </div>
                  <div className="text-2xl font-bold" data-testid="text-gini">{economicMetrics.giniCoefficient}</div>
                  <div className="text-sm text-muted-foreground">{t("adminEconomics.distributionEquality")}</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <Tabs defaultValue="inflation" className="space-y-4">
          <TabsList data-testid="tabs-list">
            <TabsTrigger value="inflation" data-testid="tab-inflation">
              <TrendingUp className="w-4 h-4 mr-2" />
              {t("adminEconomics.inflation")}
            </TabsTrigger>
            <TabsTrigger value="rewards" data-testid="tab-rewards">
              <Gift className="w-4 h-4 mr-2" />
              {t("adminEconomics.rewards")}
            </TabsTrigger>
            <TabsTrigger value="staking" data-testid="tab-staking">
              <PiggyBank className="w-4 h-4 mr-2" />
              {t("adminEconomics.staking")}
            </TabsTrigger>
            <TabsTrigger value="simulation" data-testid="tab-simulation">
              <Brain className="w-4 h-4 mr-2" />
              {t("adminEconomics.simulation")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inflation" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card data-testid="card-inflation-schedule">
                <CardHeader>
                  <CardTitle>{t("adminEconomics.inflationSchedule")}</CardTitle>
                  <CardDescription>{t("adminEconomics.plannedInflation")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-8 w-full" />
                      ))}
                    </div>
                  ) : (
                    <Table data-testid="table-inflation-schedule">
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("adminEconomics.period")}</TableHead>
                          <TableHead>{t("adminEconomics.rate")}</TableHead>
                          <TableHead>{t("adminEconomics.blockReward")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inflationSchedule.map((period, index) => (
                          <TableRow key={index} data-testid={`row-inflation-${index}`}>
                            <TableCell className="font-medium">{period.year}</TableCell>
                            <TableCell>{period.rate}</TableCell>
                            <TableCell>{period.blockReward}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              <Card data-testid="card-inflation-params">
                <CardHeader>
                  <CardTitle>{t("adminEconomics.inflationParameters")}</CardTitle>
                  <CardDescription>{t("adminEconomics.adjustInflationSettings")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>{t("adminEconomics.currentAnnualRate")}</Label>
                      <span className="font-medium">3.5%</span>
                    </div>
                    <Slider defaultValue={[3.5]} min={0} max={10} step={0.1} data-testid="slider-annual-rate" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminEconomics.blockReward")}</Label>
                    <Input type="number" defaultValue="30" data-testid="input-block-reward" />
                    <span className="text-xs text-muted-foreground">{t("adminEconomics.tburnPerBlock")}</span>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminEconomics.halvingPeriod")}</Label>
                    <Input type="number" defaultValue="4" data-testid="input-halving-period" />
                    <span className="text-xs text-muted-foreground">{t("adminEconomics.yearsBetweenHalvings")}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card data-testid="card-reward-distribution">
                <CardHeader>
                  <CardTitle>{t("adminEconomics.rewardDistribution")}</CardTitle>
                  <CardDescription>{t("adminEconomics.howRewardsAllocated")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    <>
                      <div className="h-64" data-testid="chart-reward-distribution">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={rewardDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {rewardDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {rewardDistribution.map((item, index) => (
                          <div key={index} className="flex items-center gap-2" data-testid={`legend-reward-${index}`}>
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-sm">{item.name}: {item.value}%</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card data-testid="card-reward-config">
                <CardHeader>
                  <CardTitle>{t("adminEconomics.rewardConfiguration")}</CardTitle>
                  <CardDescription>{t("adminEconomics.adjustRewardAllocation")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {rewardDistribution.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <Label>{item.name}</Label>
                        <span className="font-medium">{item.value}%</span>
                      </div>
                      <Slider defaultValue={[item.value]} min={0} max={100} data-testid={`slider-reward-${index}`} />
                    </div>
                  ))}
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mt-4" data-testid="alert-total-100">
                    <div className="flex items-center gap-2 text-yellow-500 text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{t("adminEconomics.totalMustEqual100")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card data-testid="card-validator-commission">
              <CardHeader>
                <CardTitle>{t("adminEconomics.validatorCommission")}</CardTitle>
                <CardDescription>{t("adminEconomics.feeSettingsValidators")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>{t("adminEconomics.defaultCommission")}</Label>
                    <Input type="number" defaultValue="10" data-testid="input-default-commission" />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminEconomics.minimumCommission")}</Label>
                    <Input type="number" defaultValue="5" data-testid="input-min-commission" />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminEconomics.maximumCommission")}</Label>
                    <Input type="number" defaultValue="25" data-testid="input-max-commission" />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminEconomics.maxDailyChange")}</Label>
                    <Input type="number" defaultValue="1" data-testid="input-max-daily-change" />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staking" className="space-y-4">
            <Card data-testid="card-staking-incentives">
              <CardHeader>
                <CardTitle>{t("adminEconomics.stakingIncentives")}</CardTitle>
                <CardDescription>{t("adminEconomics.configureStakingRewards")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>{t("adminEconomics.targetApy")}</Label>
                        <span className="font-medium">12%</span>
                      </div>
                      <Slider defaultValue={[12]} min={5} max={25} data-testid="slider-target-apy" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("adminEconomics.minimumStake")}</Label>
                      <Input type="number" defaultValue="100" data-testid="input-min-stake" />
                      <span className="text-xs text-muted-foreground">TBURN</span>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("adminEconomics.unbondingPeriod")}</Label>
                      <Input type="number" defaultValue="14" data-testid="input-unbonding-period" />
                      <span className="text-xs text-muted-foreground">{t("adminEconomics.days")}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">{t("adminEconomics.lockUpBonuses")}</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg" data-testid="lockup-30-days">
                        <span>{t("adminEconomics.daysLock", { days: 30 })}</span>
                        <Badge variant="outline">{t("adminEconomics.apyBonus", { bonus: "0.5" })}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg" data-testid="lockup-90-days">
                        <span>{t("adminEconomics.daysLock", { days: 90 })}</span>
                        <Badge variant="outline">{t("adminEconomics.apyBonus", { bonus: "1.5" })}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg" data-testid="lockup-180-days">
                        <span>{t("adminEconomics.daysLock", { days: 180 })}</span>
                        <Badge variant="outline">{t("adminEconomics.apyBonus", { bonus: "3.0" })}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg" data-testid="lockup-365-days">
                        <span>{t("adminEconomics.daysLock", { days: 365 })}</span>
                        <Badge variant="outline">{t("adminEconomics.apyBonus", { bonus: "5.0" })}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="simulation" className="space-y-4">
            <Card data-testid="card-ai-simulation">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  {t("adminEconomics.aiEconomicSimulation")}
                </CardTitle>
                <CardDescription>{t("adminEconomics.modelSupplyProjections")}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-80 w-full" />
                ) : (
                  <>
                    <div className="h-80" data-testid="chart-supply-projection">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={supplyProjection}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="month" />
                          <YAxis domain={[750, 950]} />
                          <Tooltip />
                          <Line type="monotone" dataKey="supply" stroke="#3b82f6" name={t("adminEconomics.projectedSupply")} strokeWidth={2} />
                          <Line type="monotone" dataKey="target" stroke="#22c55e" name={t("adminEconomics.targetSupplyLabel")} strokeWidth={2} strokeDasharray="5 5" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-muted/50 rounded-lg" data-testid="simulation-results">
                      <div>
                        <div className="text-sm text-muted-foreground">{t("adminEconomics.projectedSupply6Mo")}</div>
                        <div className="text-xl font-bold" data-testid="text-projected-supply">864M TBURN</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">{t("adminEconomics.targetAchievement")}</div>
                        <div className="text-xl font-bold text-green-500" data-testid="text-target-achievement">{t("adminEconomics.onTrack")}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">{t("adminEconomics.aiConfidence")}</div>
                        <div className="text-xl font-bold" data-testid="text-ai-confidence">92%</div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <DetailSheet
        open={!!selectedMetric}
        onOpenChange={(open) => !open && setSelectedMetric(null)}
        title={t("adminEconomics.detail.title")}
        sections={selectedMetric ? [
          {
            title: t("adminEconomics.detail.overview"),
            fields: [
              { label: t("adminEconomics.detail.metric"), value: selectedMetric.title },
              { label: t("adminEconomics.detail.currentValue"), value: selectedMetric.value, type: "badge" as const },
              { label: t("adminEconomics.detail.description"), value: selectedMetric.description },
            ],
          },
        ] : []}
      />

      <ConfirmationDialog
        open={showSaveConfirm}
        onOpenChange={(open) => {
          if (!open) {
            setShowSaveConfirm(false);
            setPendingChanges(null);
          }
        }}
        title={t("adminEconomics.confirmSave.title")}
        description={pendingChanges 
          ? t("adminEconomics.confirmSave.description", { type: pendingChanges.type, value: pendingChanges.value })
          : ""
        }
        confirmText={t("adminEconomics.save")}
        onConfirm={confirmSaveParameters}
        isLoading={saveParametersMutation.isPending}
      />
    </ScrollArea>
  );
}
