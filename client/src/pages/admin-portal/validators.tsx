import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  ShieldCheck,
  Server,
  TrendingUp,
  TrendingDown,
  Users,
  Wallet,
  Award,
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Download,
  AlertCircle,
  Brain,
  Eye,
  Settings,
  Unlock,
  Plus,
} from "lucide-react";

interface Validator {
  address: string;
  name: string;
  status: "active" | "inactive" | "jailed";
  stake: string;
  delegators: number;
  commission: number;
  uptime: number;
  blocksProduced: number;
  blocksProposed: number;
  rewards: string;
  aiTrustScore: number;
  jailedUntil: Date | null;
}

interface ValidatorsResponse {
  validators: Validator[];
  total: number;
  active: number;
  inactive: number;
  jailed: number;
  totalStake: number;
  totalDelegators: number;
}

function MetricCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <Skeleton className="h-8 w-16 mx-auto mb-2" />
        <Skeleton className="h-4 w-24 mx-auto" />
      </CardContent>
    </Card>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="border-b">
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div>
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </td>
      <td className="py-3 px-4"><Skeleton className="h-5 w-16" /></td>
      <td className="py-3 px-4 text-right"><Skeleton className="h-4 w-24 ml-auto" /></td>
      <td className="py-3 px-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
      <td className="py-3 px-4 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
      <td className="py-3 px-4 text-right"><Skeleton className="h-5 w-14 ml-auto" /></td>
      <td className="py-3 px-4 text-right"><Skeleton className="h-4 w-20 ml-auto" /></td>
      <td className="py-3 px-4 text-right"><Skeleton className="h-2 w-24 ml-auto" /></td>
      <td className="py-3 px-4 text-center"><Skeleton className="h-8 w-16 mx-auto" /></td>
    </tr>
  );
}

export default function AdminValidators() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const { data: validatorsData, isLoading, error, refetch } = useQuery<ValidatorsResponse>({
    queryKey: ["/api/validators"],
    refetchInterval: 30000,
  });

  const validators: Validator[] = useMemo(() => validatorsData?.validators || [
    { address: "0x1234...5678", name: "TBURN Genesis", status: "active", stake: "15000000", delegators: 1245, commission: 5, uptime: 99.99, blocksProduced: 45678, blocksProposed: 45680, rewards: "125000", aiTrustScore: 9850, jailedUntil: null },
    { address: "0x2345...6789", name: "BlockForge", status: "active", stake: "12500000", delegators: 987, commission: 7, uptime: 99.95, blocksProduced: 38456, blocksProposed: 38460, rewards: "98000", aiTrustScore: 9720, jailedUntil: null },
    { address: "0x3456...789a", name: "CryptoStake", status: "active", stake: "10800000", delegators: 756, commission: 6, uptime: 99.92, blocksProduced: 32145, blocksProposed: 32150, rewards: "85000", aiTrustScore: 9680, jailedUntil: null },
    { address: "0x4567...89ab", name: "NodeMaster", status: "active", stake: "9200000", delegators: 645, commission: 8, uptime: 99.88, blocksProduced: 28765, blocksProposed: 28770, rewards: "72000", aiTrustScore: 9540, jailedUntil: null },
    { address: "0x5678...9abc", name: "ValidateX", status: "active", stake: "8100000", delegators: 534, commission: 5, uptime: 99.85, blocksProduced: 25432, blocksProposed: 25440, rewards: "65000", aiTrustScore: 9480, jailedUntil: null },
    { address: "0x6789...abcd", name: "StakePool Pro", status: "inactive", stake: "7500000", delegators: 423, commission: 6, uptime: 98.5, blocksProduced: 21567, blocksProposed: 21600, rewards: "58000", aiTrustScore: 9120, jailedUntil: null },
    { address: "0x789a...bcde", name: "CryptoValidate", status: "jailed", stake: "6800000", delegators: 312, commission: 10, uptime: 95.2, blocksProduced: 18234, blocksProposed: 18500, rewards: "45000", aiTrustScore: 7850, jailedUntil: new Date(Date.now() + 86400000) },
    { address: "0x89ab...cdef", name: "BlockNode", status: "active", stake: "6200000", delegators: 289, commission: 7, uptime: 99.82, blocksProduced: 15678, blocksProposed: 15680, rewards: "42000", aiTrustScore: 9380, jailedUntil: null },
  ], [validatorsData]);

  useEffect(() => {
    let ws: WebSocket | null = null;
    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
        
        ws.onopen = () => {
          setWsConnected(true);
          ws?.send(JSON.stringify({ type: "subscribe", channels: ["validators"] }));
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "validators_update") {
              refetch();
              setLastUpdate(new Date());
            }
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

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: t("adminValidators.refreshSuccess"),
        description: t("adminValidators.dataUpdated"),
      });
      setLastUpdate(new Date());
    } catch (error) {
      toast({
        title: t("adminValidators.refreshError"),
        description: t("adminValidators.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      totalValidators: validators.length,
      validators: validators.map(v => ({
        ...v,
        jailedUntil: v.jailedUntil?.toISOString() || null,
      })),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tburn-validators-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: t("adminValidators.exportSuccess"),
      description: t("adminValidators.exportSuccessDesc"),
    });
  }, [validators, toast, t]);

  const filteredValidators = useMemo(() => {
    return validators.filter((v: Validator) => {
      const matchesSearch = searchQuery === "" ||
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || v.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [validators, searchQuery, statusFilter]);

  const stats = useMemo(() => ({
    total: validatorsData?.total || validators.length,
    active: validatorsData?.active || validators.filter((v: Validator) => v.status === "active").length,
    inactive: validatorsData?.inactive || validators.filter((v: Validator) => v.status === "inactive").length,
    jailed: validatorsData?.jailed || validators.filter((v: Validator) => v.status === "jailed").length,
    totalStake: validatorsData?.totalStake || validators.reduce((acc: number, v: Validator) => acc + parseFloat(v.stake), 0),
    totalDelegators: validatorsData?.totalDelegators || validators.reduce((acc: number, v: Validator) => acc + v.delegators, 0),
  }), [validators, validatorsData]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-green-500/10 text-green-500" data-testid="badge-status-active">{t("adminValidators.statusActive")}</Badge>;
      case "inactive": return <Badge className="bg-yellow-500/10 text-yellow-500" data-testid="badge-status-inactive">{t("adminValidators.statusInactive")}</Badge>;
      case "jailed": return <Badge className="bg-red-500/10 text-red-500" data-testid="badge-status-jailed">{t("adminValidators.statusJailed")}</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatTBURN = (value: string) => {
    const num = parseFloat(value);
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
    return num.toFixed(0);
  };

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center" data-testid="validators-error">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t("adminValidators.error.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("adminValidators.error.description")}</p>
            <Button onClick={() => refetch()} data-testid="button-retry">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("common.refresh")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex-1 overflow-auto" data-testid="admin-validators-page">
        <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-page-title">
                <ShieldCheck className="h-8 w-8" />
                {t("adminValidators.title")}
              </h1>
              <p className="text-muted-foreground" data-testid="text-page-subtitle">{t("adminValidators.subtitle")}</p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${wsConnected ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                      <div className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                      <span className="text-xs" data-testid="text-ws-status">{wsConnected ? t("common.connected") : t("adminValidators.reconnecting")}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {wsConnected ? t("adminValidators.wsConnected") : t("adminValidators.wsReconnecting")}
                  </TooltipContent>
                </Tooltip>
                <Clock className="h-4 w-4" />
                <span data-testid="text-last-update">{t("adminValidators.lastUpdate")}: {lastUpdate.toLocaleTimeString(i18n.language === 'ko' ? 'ko-KR' : 'en-US')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      data-testid="button-refresh"
                    >
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("common.refresh")}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleExport}
                      data-testid="button-export"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("common.export")}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button data-testid="button-add-validator">
                      <Plus className="h-4 w-4 mr-2" />
                      {t("adminValidators.addValidator")}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("adminValidators.addValidatorTooltip")}</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {isLoading ? (
              <>
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
              </>
            ) : (
              <>
                <Card data-testid="metric-total-validators">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold" data-testid="value-total-validators">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">{t("adminValidators.totalValidators")}</p>
                  </CardContent>
                </Card>
                <Card data-testid="metric-active-validators">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-500" data-testid="value-active-validators">{stats.active}</p>
                    <p className="text-xs text-muted-foreground">{t("adminValidators.active")}</p>
                  </CardContent>
                </Card>
                <Card data-testid="metric-inactive-validators">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-500" data-testid="value-inactive-validators">{stats.inactive}</p>
                    <p className="text-xs text-muted-foreground">{t("adminValidators.inactive")}</p>
                  </CardContent>
                </Card>
                <Card data-testid="metric-jailed-validators">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-red-500" data-testid="value-jailed-validators">{stats.jailed}</p>
                    <p className="text-xs text-muted-foreground">{t("adminValidators.jailed")}</p>
                  </CardContent>
                </Card>
                <Card data-testid="metric-total-stake">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold" data-testid="value-total-stake">{formatTBURN(stats.totalStake.toString())}</p>
                    <p className="text-xs text-muted-foreground">{t("adminValidators.totalStake")}</p>
                  </CardContent>
                </Card>
                <Card data-testid="metric-total-delegators">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold" data-testid="value-total-delegators">{stats.totalDelegators.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{t("adminValidators.totalDelegators")}</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <Card data-testid="card-validators-table">
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2" data-testid="text-validators-title">
                  <Brain className="h-5 w-5 text-primary" />
                  {t("adminValidators.validatorsList")}
                  <Badge className="bg-green-500/10 text-green-500">
                    {t("adminValidators.aiEnhanced")}
                  </Badge>
                </CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("adminValidators.searchPlaceholder")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-[250px]"
                      data-testid="input-validator-search"
                    />
                  </div>
                  <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                    <TabsList data-testid="tabs-validator-filter">
                      <TabsTrigger value="all" data-testid="tab-all">{t("common.all")}</TabsTrigger>
                      <TabsTrigger value="active" data-testid="tab-active">{t("adminValidators.active")}</TabsTrigger>
                      <TabsTrigger value="inactive" data-testid="tab-inactive">{t("adminValidators.inactive")}</TabsTrigger>
                      <TabsTrigger value="jailed" data-testid="tab-jailed">{t("adminValidators.jailed")}</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="table-validators">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">{t("adminValidators.validator")}</th>
                      <th className="text-left py-3 px-4 font-medium">{t("common.status")}</th>
                      <th className="text-right py-3 px-4 font-medium">{t("adminValidators.stake")}</th>
                      <th className="text-right py-3 px-4 font-medium">{t("adminValidators.delegators")}</th>
                      <th className="text-right py-3 px-4 font-medium">{t("adminValidators.commission")}</th>
                      <th className="text-right py-3 px-4 font-medium">{t("adminValidators.uptime")}</th>
                      <th className="text-right py-3 px-4 font-medium">{t("adminValidators.blocks")}</th>
                      <th className="text-right py-3 px-4 font-medium">{t("adminValidators.aiTrust")}</th>
                      <th className="text-center py-3 px-4 font-medium">{t("common.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <>
                        <TableRowSkeleton />
                        <TableRowSkeleton />
                        <TableRowSkeleton />
                        <TableRowSkeleton />
                        <TableRowSkeleton />
                      </>
                    ) : (
                      filteredValidators.map((validator: Validator) => (
                        <tr key={validator.address} className="border-b hover-elevate cursor-pointer" data-testid={`row-validator-${validator.address}`}>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <ShieldCheck className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium" data-testid={`text-validator-name-${validator.address}`}>{validator.name}</p>
                                <p className="text-xs text-muted-foreground font-mono" data-testid={`text-validator-address-${validator.address}`}>{validator.address}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">{getStatusBadge(validator.status)}</td>
                          <td className="py-3 px-4 text-right font-mono" data-testid={`text-validator-stake-${validator.address}`}>{formatTBURN(validator.stake)} TBURN</td>
                          <td className="py-3 px-4 text-right" data-testid={`text-validator-delegators-${validator.address}`}>{validator.delegators.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right" data-testid={`text-validator-commission-${validator.address}`}>{validator.commission}%</td>
                          <td className="py-3 px-4 text-right">
                            <Badge 
                              className={validator.uptime >= 99.9 ? "bg-green-500/10 text-green-500" : validator.uptime >= 99 ? "bg-yellow-500/10 text-yellow-500" : "bg-red-500/10 text-red-500"}
                              data-testid={`badge-validator-uptime-${validator.address}`}
                            >
                              {validator.uptime}%
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right font-mono" data-testid={`text-validator-blocks-${validator.address}`}>{validator.blocksProduced.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center justify-end gap-1">
                                  <Progress value={validator.aiTrustScore / 100} className="w-16 h-2" />
                                  <span className="text-xs font-mono w-12" data-testid={`text-validator-trust-${validator.address}`}>{(validator.aiTrustScore / 100).toFixed(1)}%</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                {t("adminValidators.aiTrustScore")}: {validator.aiTrustScore}
                              </TooltipContent>
                            </Tooltip>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="icon" variant="ghost" data-testid={`button-view-validator-${validator.address}`}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{t("common.view")}</TooltipContent>
                              </Tooltip>
                              {validator.status === "jailed" && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button size="icon" variant="ghost" className="text-green-500" data-testid={`button-unjail-validator-${validator.address}`}>
                                      <Unlock className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>{t("adminValidators.unjail")}</TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {!isLoading && filteredValidators.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground" data-testid="text-no-validators">
                    {t("adminValidators.noValidatorsFound")}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
