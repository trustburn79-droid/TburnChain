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
  ArrowLeftRight, TrendingUp, Clock, Flame, 
  BarChart3, Filter, Download, RefreshCw, AlertCircle, Eye
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts";

interface TxStats {
  total24h: string;
  avgPerSecond: string;
  successRate: string;
  avgGas: string;
}

interface TxVolume {
  hour: string;
  count: number;
}

interface TxType {
  type: string;
  count: string;
  percentage: number;
  avgGas: string;
}

interface GasHistory {
  hour: string;
  avg: number;
  min: number;
  max: number;
}

interface TransactionAnalytics {
  stats: TxStats;
  volume: TxVolume[];
  types: TxType[];
  gasHistory: GasHistory[];
}

function StatCard({
  icon: Icon,
  iconColor,
  label,
  value,
  isLoading,
  testId,
  valueColor = ""
}: {
  icon: any;
  iconColor: string;
  label: string;
  value: string;
  isLoading: boolean;
  testId: string;
  valueColor?: string;
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
          <div className={`text-3xl font-bold ${valueColor}`} data-testid={`${testId}-value`}>{value}</div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminTxAnalytics() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [wsConnected, setWsConnected] = useState(false);
  const [showTxTypeDetail, setShowTxTypeDetail] = useState(false);
  const [selectedTxType, setSelectedTxType] = useState<TxType | null>(null);
  const [showExportConfirm, setShowExportConfirm] = useState(false);

  const { data: txData, isLoading, error, refetch } = useQuery<TransactionAnalytics>({
    queryKey: ["/api/enterprise/admin/analytics/transactions"],
    refetchInterval: 15000,
  });

  useEffect(() => {
    let ws: WebSocket | null = null;
    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
        
        ws.onopen = () => {
          setWsConnected(true);
          ws?.send(JSON.stringify({ type: "subscribe", channels: ["tx_analytics"] }));
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "tx_update") {
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

  const txStats = useMemo(() => {
    if (txData?.stats) return txData.stats;
    return {
      total24h: "7,847,523",
      avgPerSecond: "90.8",
      successRate: "99.97%",
      avgGas: "42 Ember",
    };
  }, [txData]);

  const txVolume = useMemo(() => {
    if (txData?.volume) return txData.volume;
    return [
      { hour: "00:00", count: 285000 },
      { hour: "04:00", count: 218000 },
      { hour: "08:00", count: 365000 },
      { hour: "12:00", count: 485000 },
      { hour: "16:00", count: 425000 },
      { hour: "20:00", count: 348000 },
    ];
  }, [txData]);

  const txTypes = useMemo(() => {
    if (txData?.types) return txData.types;
    return [
      { type: t("adminTxAnalytics.transfer"), count: "2,847,523", percentage: 36.3, avgGas: "28 Ember" },
      { type: t("adminTxAnalytics.swap"), count: "2,156,234", percentage: 27.5, avgGas: "52 Ember" },
      { type: t("adminTxAnalytics.stake"), count: "1,245,678", percentage: 15.9, avgGas: "45 Ember" },
      { type: t("adminTxAnalytics.bridge"), count: "856,234", percentage: 10.9, avgGas: "68 Ember" },
      { type: t("adminTxAnalytics.contractCall"), count: "542,123", percentage: 6.9, avgGas: "85 Ember" },
      { type: t("adminTxAnalytics.governance"), count: "199,731", percentage: 2.5, avgGas: "55 Ember" },
    ];
  }, [txData, t]);

  const gasHistory = useMemo(() => {
    if (txData?.gasHistory) return txData.gasHistory;
    return [
      { hour: "00:00", avg: 38, min: 18, max: 65 },
      { hour: "04:00", avg: 32, min: 15, max: 55 },
      { hour: "08:00", avg: 45, min: 22, max: 78 },
      { hour: "12:00", avg: 52, min: 28, max: 95 },
      { hour: "16:00", avg: 48, min: 25, max: 85 },
      { hour: "20:00", avg: 42, min: 20, max: 72 },
    ];
  }, [txData]);

  const getTxTypeDetailSections = useCallback((txType: TxType): DetailSection[] => {
    return [
      {
        title: t("adminTxAnalytics.detail.txTypeInfo"),
        fields: [
          { label: t("adminTxAnalytics.type"), value: txType.type },
          { label: t("adminTxAnalytics.count24h"), value: txType.count },
          { label: t("adminTxAnalytics.percentage"), value: `${txType.percentage}%`, type: "badge" as const },
          { label: t("adminTxAnalytics.avgGas"), value: txType.avgGas },
        ],
      },
      {
        title: t("adminTxAnalytics.detail.statistics"),
        fields: [
          { label: t("adminTxAnalytics.percentage"), value: `${txType.percentage}% of total volume`, type: "text" as const },
        ],
      },
    ];
  }, [t]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: t("adminTxAnalytics.refreshSuccess"),
        description: t("adminTxAnalytics.dataUpdated"),
      });
    } catch (error) {
      toast({
        title: t("adminTxAnalytics.refreshError"),
        description: t("adminTxAnalytics.refreshErrorDesc"),
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
      stats: txStats,
      volume: txVolume,
      types: txTypes,
      gasHistory,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tburn-tx-analytics-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: t("adminTxAnalytics.exportSuccess"),
      description: t("adminTxAnalytics.exportSuccessDesc"),
    });
    setShowExportConfirm(false);
  }, [txStats, txVolume, txTypes, gasHistory, toast, t]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center" data-testid="tx-analytics-error">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t("adminTxAnalytics.error.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("adminTxAnalytics.error.description")}</p>
            <Button onClick={() => refetch()} data-testid="button-retry">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminTxAnalytics.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <ScrollArea className="h-full" data-testid="tx-analytics-page">
        <div className="p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-page-title">{t("adminTxAnalytics.title")}</h1>
              <p className="text-muted-foreground" data-testid="text-page-subtitle">{t("adminTxAnalytics.subtitle")}</p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${wsConnected ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                      <div className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                      <span className="text-xs">{wsConnected ? t("adminTxAnalytics.connected") : t("adminTxAnalytics.reconnecting")}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {wsConnected ? t("adminTxAnalytics.wsConnected") : t("adminTxAnalytics.wsReconnecting")}
                  </TooltipContent>
                </Tooltip>
                <Clock className="h-4 w-4" />
                <span data-testid="text-last-update">{t("adminTxAnalytics.lastUpdate")}: {lastUpdate.toLocaleTimeString(i18n.language === 'ko' ? 'ko-KR' : 'en-US')}</span>
              </div>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing} data-testid="button-refresh">
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("adminTxAnalytics.refresh")}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={() => setShowExportConfirm(true)} data-testid="button-export">
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("adminTxAnalytics.export")}</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-testid="tx-stats-grid">
            <StatCard
              icon={ArrowLeftRight}
              iconColor="text-blue-500"
              label={t("adminTxAnalytics.transactions24h")}
              value={txStats.total24h}
              isLoading={isLoading}
              testId="stat-total-tx"
            />
            <StatCard
              icon={TrendingUp}
              iconColor="text-green-500"
              label={t("adminTxAnalytics.tpsAvg")}
              value={txStats.avgPerSecond}
              isLoading={isLoading}
              testId="stat-tps"
            />
            <StatCard
              icon={Clock}
              iconColor="text-purple-500"
              label={t("adminTxAnalytics.successRate")}
              value={txStats.successRate}
              isLoading={isLoading}
              testId="stat-success-rate"
              valueColor="text-green-500"
            />
            <StatCard
              icon={Flame}
              iconColor="text-orange-500"
              label={t("adminTxAnalytics.avgGas")}
              value={txStats.avgGas}
              isLoading={isLoading}
              testId="stat-avg-gas"
            />
          </div>

          <Tabs defaultValue="volume" className="space-y-4" data-testid="tabs-tx">
            <TabsList data-testid="tabs-list">
              <TabsTrigger value="volume" data-testid="tab-volume">{t("adminTxAnalytics.tabVolume")}</TabsTrigger>
              <TabsTrigger value="types" data-testid="tab-types">{t("adminTxAnalytics.tabTypes")}</TabsTrigger>
              <TabsTrigger value="gas" data-testid="tab-gas">{t("adminTxAnalytics.tabGas")}</TabsTrigger>
            </TabsList>

            <TabsContent value="volume">
              <Card data-testid="card-tx-volume">
                <CardHeader>
                  <CardTitle>{t("adminTxAnalytics.transactionVolume24h")}</CardTitle>
                  <CardDescription>{t("adminTxAnalytics.transactionVolume24hDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-80 w-full" />
                  ) : (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={txVolume}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="hour" />
                          <YAxis />
                          <RechartsTooltip />
                          <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} name={t("adminTxAnalytics.count")} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="types">
              <Card data-testid="card-tx-types">
                <CardHeader>
                  <CardTitle>{t("adminTxAnalytics.transactionTypes")}</CardTitle>
                  <CardDescription>{t("adminTxAnalytics.transactionTypesDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("adminTxAnalytics.type")}</TableHead>
                          <TableHead>{t("adminTxAnalytics.count24h")}</TableHead>
                          <TableHead>{t("adminTxAnalytics.percentage")}</TableHead>
                          <TableHead>{t("adminTxAnalytics.avgGas")}</TableHead>
                          <TableHead>{t("common.actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {txTypes.map((type, index) => (
                          <TableRow key={index} data-testid={`tx-type-row-${index}`}>
                            <TableCell className="font-medium" data-testid={`tx-type-name-${index}`}>{type.type}</TableCell>
                            <TableCell data-testid={`tx-type-count-${index}`}>{type.count}</TableCell>
                            <TableCell>
                              <Badge variant="outline" data-testid={`tx-type-pct-${index}`}>{type.percentage}%</Badge>
                            </TableCell>
                            <TableCell data-testid={`tx-type-gas-${index}`}>{type.avgGas}</TableCell>
                            <TableCell>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setSelectedTxType(type);
                                      setShowTxTypeDetail(true);
                                    }}
                                    data-testid={`button-view-txtype-${index}`}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{t("adminTxAnalytics.view")}</TooltipContent>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gas">
              <Card data-testid="card-gas-history">
                <CardHeader>
                  <CardTitle>{t("adminTxAnalytics.gasPriceHistory24h")}</CardTitle>
                  <CardDescription>{t("adminTxAnalytics.gasPriceHistory24hDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-80 w-full" />
                  ) : (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={gasHistory}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="hour" />
                          <YAxis />
                          <RechartsTooltip />
                          <Line type="monotone" dataKey="avg" stroke="#3b82f6" name={t("adminTxAnalytics.average")} strokeWidth={2} />
                          <Line type="monotone" dataKey="min" stroke="#22c55e" name={t("adminTxAnalytics.min")} strokeDasharray="5 5" />
                          <Line type="monotone" dataKey="max" stroke="#ef4444" name={t("adminTxAnalytics.max")} strokeDasharray="5 5" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <DetailSheet
          open={showTxTypeDetail}
          onOpenChange={setShowTxTypeDetail}
          title={selectedTxType?.type || ""}
          subtitle={t("adminTxAnalytics.detail.txTypeInfo")}
          sections={selectedTxType ? getTxTypeDetailSections(selectedTxType) : []}
        />

        <ConfirmationDialog
          open={showExportConfirm}
          onOpenChange={setShowExportConfirm}
          title={t("adminTxAnalytics.confirm.exportTitle")}
          description={t("adminTxAnalytics.confirm.exportDesc")}
          onConfirm={performExport}
          confirmText={t("common.export")}
          cancelText={t("adminTxAnalytics.cancel")}
          destructive={false}
        />
      </ScrollArea>
    </TooltipProvider>
  );
}
