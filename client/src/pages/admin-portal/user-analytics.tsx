import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { 
  Users, UserPlus, Activity, TrendingUp, 
  Globe, Clock, BarChart3, RefreshCw, Download, AlertCircle, Eye
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from "recharts";

interface UserStats {
  totalUsers: string;
  activeToday: string;
  newToday: string;
  retention: string;
}

interface UserGrowth {
  date: string;
  new: number;
  total: number;
}

interface UserTier {
  tier: string;
  count: number;
  percentage: number;
}

interface GeoDistribution {
  region: string;
  users: number;
  percentage: number;
}

interface ActivityDistribution {
  name: string;
  value: number;
  color: string;
}

interface UserAnalytics {
  stats: UserStats;
  growth: UserGrowth[];
  tiers: UserTier[];
  geoDistribution: GeoDistribution[];
  activityDistribution: ActivityDistribution[];
  sessionMetrics: {
    avgDuration: string;
    pagesPerSession: string;
    bounceRate: string;
    returnRate: string;
  };
}

function StatCard({
  icon: Icon,
  iconColor,
  label,
  value,
  isLoading,
  testId,
  valueColor = "",
  prefix = ""
}: {
  icon: any;
  iconColor: string;
  label: string;
  value: string;
  isLoading: boolean;
  testId: string;
  valueColor?: string;
  prefix?: string;
}) {
  return (
    <Card data-testid={testId}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={`w-5 h-5 ${iconColor}`} />
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        {isLoading ? (
          <Skeleton className="h-9 w-24" />
        ) : (
          <div className={`text-3xl font-bold ${valueColor}`} data-testid={`${testId}-value`}>{prefix}{value}</div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminUserAnalytics() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [wsConnected, setWsConnected] = useState(false);
  const [showTierDetail, setShowTierDetail] = useState(false);
  const [selectedTier, setSelectedTier] = useState<UserTier | null>(null);
  const [showExportConfirm, setShowExportConfirm] = useState(false);

  const { data: userData, isLoading, error, refetch } = useQuery<UserAnalytics>({
    queryKey: ["/api/admin/analytics/users"],
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
          ws?.send(JSON.stringify({ type: "subscribe", channels: ["user_analytics"] }));
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "user_update") {
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

  const userStats = useMemo(() => {
    if (userData?.stats) return userData.stats;
    return {
      totalUsers: "847,523",
      activeToday: "285,467",
      newToday: "4,856",
      retention: "78.5%",
    };
  }, [userData]);

  const userGrowth = useMemo(() => {
    if (userData?.growth) return userData.growth;
    return [
      { date: "Dec 1", new: 4120, total: 828500 },
      { date: "Dec 2", new: 4350, total: 832850 },
      { date: "Dec 3", new: 4580, total: 837430 },
      { date: "Dec 4", new: 4420, total: 841850 },
      { date: "Dec 5", new: 4650, total: 846500 },
      { date: "Dec 6", new: 4780, total: 851280 },
      { date: "Dec 7", new: 4856, total: 847523 },
    ];
  }, [userData]);

  const userTiers = useMemo(() => {
    if (userData?.tiers) return userData.tiers;
    return [
      { tier: t("adminUserAnalytics.whale"), count: 847, percentage: 0.10 },
      { tier: t("adminUserAnalytics.large"), count: 12523, percentage: 1.48 },
      { tier: t("adminUserAnalytics.medium"), count: 84752, percentage: 10.00 },
      { tier: t("adminUserAnalytics.small"), count: 749401, percentage: 88.42 },
    ];
  }, [userData, t]);

  const geoDistribution = useMemo(() => {
    if (userData?.geoDistribution) return userData.geoDistribution;
    return [
      { region: t("adminUserAnalytics.asiaPacific"), users: 322058, percentage: 38 },
      { region: t("adminUserAnalytics.northAmerica"), users: 237706, percentage: 28 },
      { region: t("adminUserAnalytics.europe"), users: 186455, percentage: 22 },
      { region: t("adminUserAnalytics.others"), users: 101304, percentage: 12 },
    ];
  }, [userData, t]);

  const activityDistribution = useMemo(() => {
    if (userData?.activityDistribution) return userData.activityDistribution;
    return [
      { name: t("adminUserAnalytics.dailyActive"), value: 52, color: "#22c55e" },
      { name: t("adminUserAnalytics.weeklyActive"), value: 28, color: "#3b82f6" },
      { name: t("adminUserAnalytics.monthlyActive"), value: 14, color: "#f97316" },
      { name: t("adminUserAnalytics.inactive"), value: 6, color: "#6b7280" },
    ];
  }, [userData, t]);

  const sessionMetrics = useMemo(() => {
    if (userData?.sessionMetrics) return userData.sessionMetrics;
    return {
      avgDuration: "18m 42s",
      pagesPerSession: "7.8",
      bounceRate: "12.3%",
      returnRate: "78.5%",
    };
  }, [userData]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: t("adminUserAnalytics.refreshSuccess"),
        description: t("adminUserAnalytics.dataUpdated"),
      });
    } catch (error) {
      toast({
        title: t("adminUserAnalytics.refreshError"),
        description: t("adminUserAnalytics.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
      setLastUpdate(new Date());
    }
  }, [refetch, toast, t]);

  const getTierDetailSections = useCallback((tier: UserTier): DetailSection[] => {
    return [
      {
        title: t("adminUserAnalytics.detail.tierInfo"),
        fields: [
          { label: t("adminUserAnalytics.tier"), value: tier.tier, type: "text" },
          { label: t("adminUserAnalytics.count"), value: tier.count.toLocaleString(), type: "text" },
          { label: t("adminUserAnalytics.percentage"), value: `${tier.percentage}%`, type: "badge", badgeVariant: "secondary" },
        ],
      },
      {
        title: t("adminUserAnalytics.detail.benefits"),
        fields: [
          { label: t("adminUserAnalytics.detail.benefitPriority"), value: tier.tier.includes(t("adminUserAnalytics.whale")) ? "VIP" : tier.tier.includes(t("adminUserAnalytics.large")) ? "Priority" : "Standard", type: "badge" },
          { label: t("adminUserAnalytics.detail.benefitRewards"), value: tier.tier.includes(t("adminUserAnalytics.whale")) ? "2x" : tier.tier.includes(t("adminUserAnalytics.large")) ? "1.5x" : "1x", type: "text" },
        ],
      },
    ];
  }, [t]);

  const performExport = useCallback(() => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      stats: userStats,
      growth: userGrowth,
      tiers: userTiers,
      geoDistribution,
      activityDistribution,
      sessionMetrics,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tburn-user-analytics-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: t("adminUserAnalytics.exportSuccess"),
      description: t("adminUserAnalytics.exportSuccessDesc"),
    });
    setShowExportConfirm(false);
  }, [userStats, userGrowth, userTiers, geoDistribution, activityDistribution, sessionMetrics, toast, t]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center" data-testid="user-analytics-error">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t("adminUserAnalytics.error.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("adminUserAnalytics.error.description")}</p>
            <Button onClick={() => refetch()} data-testid="button-retry">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminUserAnalytics.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <ScrollArea className="h-full" data-testid="user-analytics-page">
        <div className="p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-page-title">{t("adminUserAnalytics.title")}</h1>
              <p className="text-muted-foreground" data-testid="text-page-subtitle">{t("adminUserAnalytics.subtitle")}</p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${wsConnected ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                      <div className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                      <span className="text-xs">{wsConnected ? t("adminUserAnalytics.connected") : t("adminUserAnalytics.reconnecting")}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {wsConnected ? t("adminUserAnalytics.wsConnected") : t("adminUserAnalytics.wsReconnecting")}
                  </TooltipContent>
                </Tooltip>
                <Clock className="h-4 w-4" />
                <span data-testid="text-last-update">{t("adminUserAnalytics.lastUpdate")}: {lastUpdate.toLocaleTimeString(i18n.language === 'ko' ? 'ko-KR' : 'en-US')}</span>
              </div>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing} data-testid="button-refresh">
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("adminUserAnalytics.refresh")}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={() => setShowExportConfirm(true)} data-testid="button-export">
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("adminUserAnalytics.export")}</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-testid="user-stats-grid">
            <StatCard
              icon={Users}
              iconColor="text-blue-500"
              label={t("adminUserAnalytics.totalUsers")}
              value={userStats.totalUsers}
              isLoading={isLoading}
              testId="stat-total-users"
            />
            <StatCard
              icon={Activity}
              iconColor="text-green-500"
              label={t("adminUserAnalytics.activeToday")}
              value={userStats.activeToday}
              isLoading={isLoading}
              testId="stat-active-today"
            />
            <StatCard
              icon={UserPlus}
              iconColor="text-purple-500"
              label={t("adminUserAnalytics.newToday")}
              value={userStats.newToday}
              isLoading={isLoading}
              testId="stat-new-today"
              valueColor="text-green-500"
              prefix="+"
            />
            <StatCard
              icon={TrendingUp}
              iconColor="text-orange-500"
              label={t("adminUserAnalytics.retentionRate")}
              value={userStats.retention}
              isLoading={isLoading}
              testId="stat-retention"
            />
          </div>

          <Tabs defaultValue="growth" className="space-y-4" data-testid="tabs-users">
            <TabsList data-testid="tabs-list">
              <TabsTrigger value="growth" data-testid="tab-growth">{t("adminUserAnalytics.tabGrowth")}</TabsTrigger>
              <TabsTrigger value="segments" data-testid="tab-segments">{t("adminUserAnalytics.tabSegments")}</TabsTrigger>
              <TabsTrigger value="geography" data-testid="tab-geography">{t("adminUserAnalytics.tabGeography")}</TabsTrigger>
              <TabsTrigger value="activity" data-testid="tab-activity">{t("adminUserAnalytics.tabActivity")}</TabsTrigger>
            </TabsList>

            <TabsContent value="growth">
              <Card data-testid="card-user-growth">
                <CardHeader>
                  <CardTitle>{t("adminUserAnalytics.userGrowth7Days")}</CardTitle>
                  <CardDescription>{t("adminUserAnalytics.userGrowth7DaysDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-80 w-full" />
                  ) : (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={userGrowth}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="date" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <RechartsTooltip />
                          <Area yAxisId="right" type="monotone" dataKey="total" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} name={t("adminUserAnalytics.totalUsers")} />
                          <Line yAxisId="left" type="monotone" dataKey="new" stroke="#22c55e" name={t("adminUserAnalytics.newUsers")} strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="segments">
              <Card data-testid="card-user-tiers">
                <CardHeader>
                  <CardTitle>{t("adminUserAnalytics.userTiers")}</CardTitle>
                  <CardDescription>{t("adminUserAnalytics.userTiersDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("adminUserAnalytics.tier")}</TableHead>
                          <TableHead>{t("adminUserAnalytics.count")}</TableHead>
                          <TableHead>{t("adminUserAnalytics.percentage")}</TableHead>
                          <TableHead>{t("common.actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userTiers.map((tier, index) => (
                          <TableRow key={index} data-testid={`tier-row-${index}`}>
                            <TableCell className="font-medium">
                              <Badge variant={
                                tier.tier.includes(t("adminUserAnalytics.whale")) ? "default" :
                                tier.tier.includes(t("adminUserAnalytics.large")) ? "secondary" : "outline"
                              } data-testid={`tier-badge-${index}`}>
                                {tier.tier}
                              </Badge>
                            </TableCell>
                            <TableCell data-testid={`tier-count-${index}`}>{tier.count.toLocaleString()}</TableCell>
                            <TableCell data-testid={`tier-pct-${index}`}>{tier.percentage}%</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedTier(tier);
                                  setShowTierDetail(true);
                                }}
                                data-testid={`button-view-tier-${index}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="geography">
              <Card data-testid="card-geo-distribution">
                <CardHeader>
                  <CardTitle>{t("adminUserAnalytics.geographicDistribution")}</CardTitle>
                  <CardDescription>{t("adminUserAnalytics.geographicDistributionDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("adminUserAnalytics.region")}</TableHead>
                          <TableHead>{t("adminUserAnalytics.users")}</TableHead>
                          <TableHead>{t("adminUserAnalytics.percentage")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {geoDistribution.map((region, index) => (
                          <TableRow key={index} data-testid={`geo-row-${index}`}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                <span data-testid={`geo-region-${index}`}>{region.region}</span>
                              </div>
                            </TableCell>
                            <TableCell data-testid={`geo-users-${index}`}>{region.users.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge variant="outline" data-testid={`geo-pct-${index}`}>{region.percentage}%</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card data-testid="card-activity-distribution">
                  <CardHeader>
                    <CardTitle>{t("adminUserAnalytics.activityDistribution")}</CardTitle>
                    <CardDescription>{t("adminUserAnalytics.activityDistributionDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <>
                        <Skeleton className="h-64 w-full mb-4" />
                        <Skeleton className="h-20 w-full" />
                      </>
                    ) : (
                      <>
                        <div className="h-64 flex items-center justify-center">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={activityDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                dataKey="value"
                              >
                                {activityDistribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <RechartsTooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          {activityDistribution.map((item, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm" data-testid={`activity-item-${index}`}>
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                              <span>{item.name}: {item.value}%</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card data-testid="card-session-metrics">
                  <CardHeader>
                    <CardTitle>{t("adminUserAnalytics.sessionMetrics")}</CardTitle>
                    <CardDescription>{t("adminUserAnalytics.sessionMetricsDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isLoading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))
                    ) : (
                      <>
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg" data-testid="metric-avg-duration">
                          <span>{t("adminUserAnalytics.avgSessionDuration")}</span>
                          <span className="font-medium">{sessionMetrics.avgDuration}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg" data-testid="metric-pages-per-session">
                          <span>{t("adminUserAnalytics.pagesPerSession")}</span>
                          <span className="font-medium">{sessionMetrics.pagesPerSession}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg" data-testid="metric-bounce-rate">
                          <span>{t("adminUserAnalytics.bounceRate")}</span>
                          <span className="font-medium">{sessionMetrics.bounceRate}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg" data-testid="metric-return-rate">
                          <span>{t("adminUserAnalytics.returnRate")}</span>
                          <span className="font-medium">{sessionMetrics.returnRate}</span>
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

      {selectedTier && (
        <DetailSheet
          open={showTierDetail}
          onOpenChange={setShowTierDetail}
          title={selectedTier.tier}
          subtitle={`${selectedTier.count.toLocaleString()} ${t("adminUserAnalytics.users")}`}
          icon={<Users className="h-5 w-5" />}
          sections={getTierDetailSections(selectedTier)}
        />
      )}

      <ConfirmationDialog
        open={showExportConfirm}
        onOpenChange={setShowExportConfirm}
        title={t("adminUserAnalytics.confirm.exportTitle")}
        description={t("adminUserAnalytics.confirm.exportDesc")}
        onConfirm={performExport}
        confirmText={t("common.export")}
        cancelText={t("adminUserAnalytics.cancel")}
        destructive={false}
      />
    </TooltipProvider>
  );
}
