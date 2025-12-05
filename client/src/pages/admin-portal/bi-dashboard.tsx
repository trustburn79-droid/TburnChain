import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { 
  BarChart3, TrendingUp, TrendingDown, Users, Activity, 
  Download, Calendar, Filter, PieChart, RefreshCw, Clock, AlertCircle, Eye
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart as RechartsPie, Pie, Cell } from "recharts";

interface BIMetrics {
  kpiMetrics: Array<{
    name: string;
    value: string;
    change: string;
    trend: "up" | "down";
  }>;
  revenueData: Array<{
    month: string;
    revenue: number;
    fees: number;
    burn: number;
  }>;
  userGrowth: Array<{
    month: string;
    users: number;
  }>;
  chainDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  totalVolume30d: string;
  newUsers30d: number;
  transactions30d: number;
}

function StatCard({
  name,
  value,
  change,
  trend,
  isLoading,
  testId
}: {
  name: string;
  value: string;
  change: string;
  trend: "up" | "down";
  isLoading: boolean;
  testId: string;
}) {
  return (
    <Card data-testid={testId}>
      <CardContent className="pt-6">
        {isLoading ? (
          <>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-20 mb-1" />
            <Skeleton className="h-4 w-16" />
          </>
        ) : (
          <>
            <div className="text-sm text-muted-foreground mb-1" data-testid={`${testId}-name`}>{name}</div>
            <div className="text-3xl font-bold" data-testid={`${testId}-value`}>{value}</div>
            <div className={`text-sm flex items-center gap-1 ${trend === "up" ? "text-green-500" : "text-red-500"}`} data-testid={`${testId}-change`}>
              {trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {change} vs last period
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface KPIMetric {
  name: string;
  value: string;
  change: string;
  trend: "up" | "down";
}

export default function AdminBIDashboard() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [timeRange, setTimeRange] = useState("30d");
  const [wsConnected, setWsConnected] = useState(false);
  
  const [showKPIDetail, setShowKPIDetail] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState<KPIMetric | null>(null);
  const [showExportConfirm, setShowExportConfirm] = useState(false);

  const { data: biData, isLoading, error, refetch } = useQuery<BIMetrics>({
    queryKey: ["/api/admin/bi/metrics", timeRange],
    refetchInterval: 30000,
  });

  useEffect(() => {
    let ws: WebSocket | null = null;
    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
        
        ws.onopen = () => {
          setWsConnected(true);
          ws?.send(JSON.stringify({ type: "subscribe", channels: ["bi_metrics"] }));
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "bi_update") {
              refetch();
            }
            setLastUpdate(new Date());
          } catch (e) {
            console.error("WebSocket message parse error:", e);
          }
        };
        
        ws.onclose = () => {
          setWsConnected(false);
          setTimeout(connectWebSocket, 5000);
        };
        
        ws.onerror = () => {
          setWsConnected(false);
        };
      } catch (e) {
        console.error("WebSocket connection error:", e);
      }
    };

    connectWebSocket();
    
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [refetch]);

  const kpiMetrics = useMemo(() => {
    if (biData?.kpiMetrics) return biData.kpiMetrics;
    return [
      { name: t("adminBI.dailyActiveUsers"), value: "125,234", change: "+12.5%", trend: "up" as const },
      { name: t("adminBI.transactionVolume"), value: "$45.2M", change: "+8.3%", trend: "up" as const },
      { name: t("adminBI.networkUtilization"), value: "68%", change: "+2.1%", trend: "up" as const },
      { name: t("adminBI.avgTxPerUser"), value: "3.2", change: "-0.5%", trend: "down" as const },
    ];
  }, [biData, t]);

  const revenueData = useMemo(() => {
    if (biData?.revenueData) return biData.revenueData;
    return [
      { month: "Jul", revenue: 1200, fees: 350, burn: 150 },
      { month: "Aug", revenue: 1400, fees: 420, burn: 180 },
      { month: "Sep", revenue: 1350, fees: 390, burn: 170 },
      { month: "Oct", revenue: 1600, fees: 480, burn: 200 },
      { month: "Nov", revenue: 1800, fees: 540, burn: 220 },
      { month: "Dec", revenue: 2100, fees: 630, burn: 260 },
    ];
  }, [biData]);

  const userGrowth = useMemo(() => {
    if (biData?.userGrowth) return biData.userGrowth;
    return [
      { month: "Jul", users: 85000 },
      { month: "Aug", users: 92000 },
      { month: "Sep", users: 98000 },
      { month: "Oct", users: 108000 },
      { month: "Nov", users: 118000 },
      { month: "Dec", users: 125234 },
    ];
  }, [biData]);

  const chainDistribution = useMemo(() => {
    if (biData?.chainDistribution) return biData.chainDistribution;
    return [
      { name: "TBURN Native", value: 45, color: "#f97316" },
      { name: "Ethereum", value: 25, color: "#3b82f6" },
      { name: "BSC", value: 15, color: "#eab308" },
      { name: "Polygon", value: 10, color: "#8b5cf6" },
      { name: "Others", value: 5, color: "#22c55e" },
    ];
  }, [biData]);

  const summaryMetrics = useMemo(() => ({
    totalVolume30d: biData?.totalVolume30d || "$145.2M",
    newUsers30d: biData?.newUsers30d || 45234,
    transactions30d: biData?.transactions30d || 2800000,
  }), [biData]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: t("adminBI.refreshSuccess"),
        description: t("adminBI.dataUpdated"),
      });
    } catch (error) {
      toast({
        title: t("adminBI.refreshError"),
        description: t("adminBI.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
      setLastUpdate(new Date());
    }
  }, [refetch, toast, t]);

  const performExport = useCallback(() => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      timeRange,
      kpiMetrics,
      revenueData,
      userGrowth,
      chainDistribution,
      summaryMetrics,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tburn-bi-dashboard-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: t("adminBI.exportSuccess"),
      description: t("adminBI.exportSuccessDesc"),
    });
    setShowExportConfirm(false);
  }, [timeRange, kpiMetrics, revenueData, userGrowth, chainDistribution, summaryMetrics, toast, t]);

  const getKPIDetailSections = useCallback((kpi: KPIMetric): DetailSection[] => {
    const timeRangeLabel = timeRange === "7d" ? t("adminBI.last7Days") : 
                          timeRange === "30d" ? t("adminBI.last30Days") : 
                          timeRange === "90d" ? t("adminBI.last90Days") : t("adminBI.lastYear");
    return [
      {
        title: t("adminBI.detail.metricInfo"),
        fields: [
          { label: t("adminBI.metricName"), value: kpi.name },
          { label: t("adminBI.currentValue"), value: kpi.value },
          { label: t("adminBI.changePercent"), value: kpi.change, type: "badge" as const, badgeVariant: kpi.trend === "up" ? "outline" : "destructive" },
          { label: t("adminBI.trend"), value: kpi.trend === "up" ? t("adminBI.trending.up") : t("adminBI.trending.down"), type: "badge" as const, badgeVariant: kpi.trend === "up" ? "outline" : "secondary" },
        ]
      },
      {
        title: t("adminBI.detail.context"),
        fields: [
          { label: t("adminBI.timeRange"), value: timeRangeLabel },
          { label: t("adminBI.lastUpdated"), value: lastUpdate.toLocaleString(i18n.language === 'ko' ? 'ko-KR' : 'en-US') },
          { label: t("adminBI.dataSource"), value: "TBURN Analytics Engine" },
        ]
      }
    ];
  }, [t, timeRange, lastUpdate, i18n.language]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center" data-testid="bi-dashboard-error">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t("adminBI.error.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("adminBI.error.description")}</p>
            <Button onClick={() => refetch()} data-testid="button-retry">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminBI.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <ScrollArea className="h-full" data-testid="bi-dashboard-page">
        <div className="p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-page-title">{t("adminBI.title")}</h1>
              <p className="text-muted-foreground" data-testid="text-page-subtitle">{t("adminBI.subtitle")}</p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${wsConnected ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                      <div className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                      <span className="text-xs">{wsConnected ? t("adminBI.connected") : t("adminBI.reconnecting")}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {wsConnected ? t("adminBI.wsConnected") : t("adminBI.wsReconnecting")}
                  </TooltipContent>
                </Tooltip>
                <Clock className="h-4 w-4" />
                <span data-testid="text-last-update">{t("adminBI.lastUpdate")}: {lastUpdate.toLocaleTimeString(i18n.language === 'ko' ? 'ko-KR' : 'en-US')}</span>
              </div>
              <div className="flex gap-2">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-32" data-testid="select-time-range">
                    <Calendar className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">{t("adminBI.last7Days")}</SelectItem>
                    <SelectItem value="30d">{t("adminBI.last30Days")}</SelectItem>
                    <SelectItem value="90d">{t("adminBI.last90Days")}</SelectItem>
                    <SelectItem value="1y">{t("adminBI.lastYear")}</SelectItem>
                  </SelectContent>
                </Select>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing} data-testid="button-refresh">
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("adminBI.refresh")}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={() => setShowExportConfirm(true)} data-testid="button-export">
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("adminBI.export")}</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-testid="kpi-metrics-grid">
            {kpiMetrics.map((kpi, index) => (
              <Card key={index} data-testid={`stat-kpi-${index}`}>
                <CardContent className="pt-6">
                  {isLoading ? (
                    <>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-8 w-20 mb-1" />
                      <Skeleton className="h-4 w-16" />
                    </>
                  ) : (
                    <>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1" data-testid={`stat-kpi-${index}-name`}>{kpi.name}</div>
                          <div className="text-3xl font-bold" data-testid={`stat-kpi-${index}-value`}>{kpi.value}</div>
                          <div className={`text-sm flex items-center gap-1 ${kpi.trend === "up" ? "text-green-500" : "text-red-500"}`} data-testid={`stat-kpi-${index}-change`}>
                            {kpi.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {kpi.change} vs last period
                          </div>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setSelectedKPI(kpi);
                                setShowKPIDetail(true);
                              }}
                              data-testid={`button-view-kpi-${index}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{t("adminBI.view")}</TooltipContent>
                        </Tooltip>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="overview" className="space-y-4" data-testid="tabs-bi">
            <TabsList data-testid="tabs-list">
              <TabsTrigger value="overview" data-testid="tab-overview">{t("adminBI.tabOverview")}</TabsTrigger>
              <TabsTrigger value="revenue" data-testid="tab-revenue">{t("adminBI.tabRevenue")}</TabsTrigger>
              <TabsTrigger value="users" data-testid="tab-users">{t("adminBI.tabUsers")}</TabsTrigger>
              <TabsTrigger value="chains" data-testid="tab-chains">{t("adminBI.tabChains")}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card data-testid="card-revenue-breakdown">
                  <CardHeader>
                    <CardTitle>{t("adminBI.revenueBreakdown")}</CardTitle>
                    <CardDescription>{t("adminBI.revenueBreakdownDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-80 w-full" />
                    ) : (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <RechartsTooltip />
                            <Bar dataKey="revenue" fill="#3b82f6" name={t("adminBI.revenue")} />
                            <Bar dataKey="fees" fill="#22c55e" name={t("adminBI.fees")} />
                            <Bar dataKey="burn" fill="#f97316" name={t("adminBI.burn")} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card data-testid="card-user-growth">
                  <CardHeader>
                    <CardTitle>{t("adminBI.userGrowth")}</CardTitle>
                    <CardDescription>{t("adminBI.userGrowthDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-80 w-full" />
                    ) : (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={userGrowth}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <RechartsTooltip />
                            <Area type="monotone" dataKey="users" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="revenue">
              <Card data-testid="card-revenue-detailed">
                <CardHeader>
                  <CardTitle>{t("adminBI.detailedRevenue")}</CardTitle>
                  <CardDescription>{t("adminBI.detailedRevenueDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-96 w-full" />
                  ) : (
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="revenue" fill="#3b82f6" name={t("adminBI.revenue")} />
                          <Bar dataKey="fees" fill="#22c55e" name={t("adminBI.fees")} />
                          <Bar dataKey="burn" fill="#f97316" name={t("adminBI.burn")} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card data-testid="card-users-detailed">
                <CardHeader>
                  <CardTitle>{t("adminBI.detailedUserGrowth")}</CardTitle>
                  <CardDescription>{t("adminBI.detailedUserGrowthDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-96 w-full" />
                  ) : (
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={userGrowth}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <RechartsTooltip />
                          <Area type="monotone" dataKey="users" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chains">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2" data-testid="card-summary-metrics">
                  <CardHeader>
                    <CardTitle>{t("adminBI.keyMetricsSummary")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="grid grid-cols-3 gap-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-muted/50 rounded-lg text-center" data-testid="metric-total-volume">
                          <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
                          <div className="text-2xl font-bold">{summaryMetrics.totalVolume30d}</div>
                          <div className="text-sm text-muted-foreground">{t("adminBI.totalVolume30d")}</div>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg text-center" data-testid="metric-new-users">
                          <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                          <div className="text-2xl font-bold">{summaryMetrics.newUsers30d.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">{t("adminBI.newUsers30d")}</div>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg text-center" data-testid="metric-transactions">
                          <Activity className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                          <div className="text-2xl font-bold">{(summaryMetrics.transactions30d / 1000000).toFixed(1)}M</div>
                          <div className="text-sm text-muted-foreground">{t("adminBI.transactions30d")}</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card data-testid="card-chain-distribution">
                  <CardHeader>
                    <CardTitle>{t("adminBI.chainDistribution")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <>
                        <Skeleton className="h-48 w-full mb-4" />
                        <Skeleton className="h-4 w-full" />
                      </>
                    ) : (
                      <>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPie>
                              <Pie
                                data={chainDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
                                dataKey="value"
                              >
                                {chainDistribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <RechartsTooltip />
                            </RechartsPie>
                          </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-1 mt-2">
                          {chainDistribution.map((item, index) => (
                            <div key={index} className="flex items-center gap-1 text-xs" data-testid={`chain-item-${index}`}>
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                              <span>{item.name}: {item.value}%</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>

      {selectedKPI && (
        <DetailSheet
          open={showKPIDetail}
          onOpenChange={setShowKPIDetail}
          title={selectedKPI.name}
          sections={getKPIDetailSections(selectedKPI)}
        />
      )}

      <ConfirmationDialog
        open={showExportConfirm}
        onOpenChange={setShowExportConfirm}
        title={t("adminBI.confirm.exportTitle")}
        description={t("adminBI.confirm.exportDesc")}
        confirmText={t("adminBI.export")}
        cancelText={t("adminBI.cancel")}
        onConfirm={performExport}
        destructive={false}
      />
    </TooltipProvider>
  );
}
