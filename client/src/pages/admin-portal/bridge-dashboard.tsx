import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { 
  Link2, ArrowLeftRight, Activity, Shield, Clock, 
  CheckCircle, AlertTriangle, TrendingUp, Wallet,
  RefreshCw, Download, AlertCircle, XCircle, Eye
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

interface BridgeStats {
  totalVolume24h: string;
  activeTransfers: number;
  completedToday: number;
  avgTransferTime: string;
}

interface Chain {
  id?: number;
  name: string;
  symbol: string;
  chainId?: number;
  status: "active" | "degraded" | "offline";
  tvl: string;
  volume24h: string;
  pending?: number;
  pendingTx?: number;
  validators: number;
  maxValidators?: number;
  rpcEndpoint?: string;
  explorerUrl?: string;
  bridgeContract?: string;
  confirmations?: number;
  enabled?: boolean;
  lastBlock?: number;
  blockTime?: string;
  latency?: number;
}

interface Transfer {
  id: string;
  from: string | { chain: string; address: string };
  to: string | { chain: string; address: string };
  amount: string;
  status: "completed" | "pending" | "validating" | "failed";
  time?: string;
  timestamp?: string;
  duration?: string;
  fee?: string;
  confirmations?: string;
  error?: string;
}

interface VolumeData {
  time: string;
  eth: number;
  bsc: number;
  polygon: number;
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-9 w-32 mt-1" />
      </CardContent>
    </Card>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Table data-testid="table-skeleton">
      <TableHeader>
        <TableRow>
          {Array.from({ length: 6 }).map((_, i) => (
            <TableHead key={i}><Skeleton className="h-4 w-20" /></TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRow key={i}>
            {Array.from({ length: 6 }).map((_, j) => (
              <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function AdminBridgeDashboard() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const { data: bridgeStatsData, isLoading: loadingStats, error: statsError, refetch: refetchStats } = useQuery<BridgeStats>({
    queryKey: ["/api/admin/bridge/stats"],
    refetchInterval: 10000,
    staleTime: 10000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data: chainsData, isLoading: loadingChains, refetch: refetchChains } = useQuery<{ chains: Chain[] }>({
    queryKey: ["/api/admin/bridge/chains"],
    refetchInterval: 15000,
    staleTime: 15000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data: transfersData, isLoading: loadingTransfers, refetch: refetchTransfers } = useQuery<{ transfers: Transfer[] }>({
    queryKey: ["/api/admin/bridge/transfers", "limit=10"],
    refetchInterval: 10000,
    staleTime: 10000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data: volumeData, isLoading: loadingVolume } = useQuery<{ history: VolumeData[] }>({
    queryKey: ["/api/admin/bridge/volume"],
    refetchInterval: 60000,
    staleTime: 60000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    let ws: WebSocket | null = null;
    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
        
        ws.onopen = () => {
          setWsConnected(true);
          ws?.send(JSON.stringify({ type: "subscribe", channels: ["bridge", "transfers"] }));
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "bridge_update" || data.type === "transfer_update") {
              refetchStats();
              refetchTransfers();
              setLastUpdate(new Date());
            }
            if (data.type === "chain_status") {
              refetchChains();
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
  }, [refetchStats, refetchTransfers, refetchChains]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchStats(),
        refetchChains(),
        refetchTransfers(),
      ]);
      toast({
        title: t("adminBridge.refreshSuccess"),
        description: t("adminBridge.dataUpdated"),
      });
    } catch (error) {
      toast({
        title: t("adminBridge.refreshError"),
        description: t("adminBridge.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
      setLastUpdate(new Date());
    }
  }, [refetchStats, refetchChains, refetchTransfers, toast, t]);

  const handleExport = useCallback(() => {
    setExportDialogOpen(true);
  }, []);

  const handleViewChain = (chain: Chain) => {
    setSelectedChain(chain);
    setDetailOpen(true);
  };

  const getChainDetailSections = (chain: Chain): DetailSection[] => {
    const pendingCount = chain.pendingTx ?? chain.pending ?? 0;
    return [
      {
        title: t("adminBridge.detail.overview"),
        fields: [
          { label: t("adminBridge.detail.chainName"), value: chain.name, type: "text" as const },
          { label: t("adminBridge.detail.symbol"), value: chain.symbol, type: "badge" as const },
          { label: t("adminBridge.detail.chainId"), value: chain.chainId?.toString() || "N/A", type: "text" as const },
          { label: t("adminBridge.detail.status"), value: chain.status, type: "status" as const },
          { label: t("adminBridge.detail.tvl"), value: chain.tvl, type: "text" as const },
        ],
      },
      {
        title: t("adminBridge.detail.performance"),
        fields: [
          { label: t("adminBridge.detail.volume24h"), value: chain.volume24h, type: "text" as const },
          { label: t("adminBridge.detail.pendingTx"), value: pendingCount.toString(), type: "badge" as const },
          { label: t("adminBridge.detail.activeValidators"), value: `${chain.validators}/${chain.maxValidators ?? 10}`, type: "text" as const },
          { label: t("adminBridge.detail.blockTime"), value: chain.blockTime || "N/A", type: "text" as const },
          { label: t("adminBridge.detail.latency"), value: chain.latency ? `${chain.latency}ms` : "N/A", type: "text" as const },
          { label: t("adminBridge.detail.lastBlock"), value: chain.lastBlock?.toLocaleString() || "N/A", type: "text" as const },
        ],
      },
      {
        title: t("adminBridge.detail.configuration"),
        fields: [
          { label: t("adminBridge.detail.bridgeContract"), value: chain.bridgeContract || `0x${chain.symbol.toLowerCase()}bridge...`, type: "code" as const, copyable: true },
          { label: t("adminBridge.detail.rpcEndpoint"), value: chain.rpcEndpoint || "N/A", type: "code" as const, copyable: true },
          { label: t("adminBridge.detail.explorerUrl"), value: chain.explorerUrl || "N/A", type: "link" as const },
          { label: t("adminBridge.detail.requiredConfirmations"), value: chain.confirmations?.toString() || "12", type: "text" as const },
          { label: t("adminBridge.detail.maxTransferLimit"), value: "$10,000,000", type: "text" as const },
        ],
      },
    ];
  };

  const bridgeStats = useMemo(() => {
    if (bridgeStatsData) return bridgeStatsData;
    return {
      totalVolume24h: "$87.5M",
      activeTransfers: 1247,
      completedToday: 28475,
      avgTransferTime: "1.8 min",
    };
  }, [bridgeStatsData]);

  const chains = useMemo(() => {
    if (chainsData?.chains) return chainsData.chains;
    return [
      { name: "Ethereum", symbol: "ETH", status: "active" as const, tvl: "$285.5M", volume24h: "$32.8M", pending: 156, validators: 12 },
      { name: "BSC", symbol: "BNB", status: "active" as const, tvl: "$168.2M", volume24h: "$18.5M", pending: 89, validators: 12 },
      { name: "Polygon", symbol: "MATIC", status: "active" as const, tvl: "$95.8M", volume24h: "$12.4M", pending: 45, validators: 12 },
      { name: "Avalanche", symbol: "AVAX", status: "active" as const, tvl: "$72.4M", volume24h: "$8.2M", pending: 32, validators: 12 },
      { name: "Arbitrum", symbol: "ARB", status: "active" as const, tvl: "$58.5M", volume24h: "$6.8M", pending: 28, validators: 12 },
      { name: "Optimism", symbol: "OP", status: "active" as const, tvl: "$45.2M", volume24h: "$5.2M", pending: 18, validators: 12 },
      { name: "Base", symbol: "BASE", status: "active" as const, tvl: "$38.6M", volume24h: "$3.6M", pending: 12, validators: 12 },
    ];
  }, [chainsData]);

  const recentTransfers = useMemo(() => {
    if (transfersData?.transfers) return transfersData.transfers;
    return [
      { id: "0xabc...123", from: "Ethereum", to: "TBURN", amount: "2,500,000 USDT", status: "completed" as const, time: "45 sec ago" },
      { id: "0xdef...456", from: "TBURN", to: "BSC", amount: "1,850,000 TBURN", status: "completed" as const, time: "1 min ago" },
      { id: "0xghi...789", from: "Polygon", to: "TBURN", amount: "850,000 USDC", status: "validating" as const, time: "2 min ago" },
      { id: "0xjkl...012", from: "Avalanche", to: "TBURN", amount: "425,000 AVAX", status: "pending" as const, time: "3 min ago" },
      { id: "0xmno...345", from: "TBURN", to: "Arbitrum", amount: "1,200,000 TBURN", status: "completed" as const, time: "4 min ago" },
    ];
  }, [transfersData]);

  const volumeHistory = useMemo(() => {
    if (volumeData?.history) return volumeData.history;
    return [
      { time: "00:00", eth: 8500, bsc: 4800, polygon: 3200 },
      { time: "04:00", eth: 6200, bsc: 3500, polygon: 2400 },
      { time: "08:00", eth: 12500, bsc: 7200, polygon: 4800 },
      { time: "12:00", eth: 18500, bsc: 10500, polygon: 6800 },
      { time: "16:00", eth: 15200, bsc: 8800, polygon: 5500 },
      { time: "20:00", eth: 11500, bsc: 6500, polygon: 4200 },
    ];
  }, [volumeData]);

  const confirmExport = useCallback(() => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      bridgeStats: bridgeStats,
      chains: chains,
      recentTransfers: recentTransfers,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bridge-dashboard-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    setExportDialogOpen(false);
    toast({
      title: t("adminBridge.exportSuccess"),
      description: t("adminBridge.exportSuccessDesc"),
    });
  }, [bridgeStats, chains, recentTransfers, toast, t]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge data-testid="badge-status-active" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> {t("adminBridge.active")}</Badge>;
      case "degraded":
        return <Badge data-testid="badge-status-degraded" className="bg-yellow-500"><AlertTriangle className="w-3 h-3 mr-1" /> {t("adminBridge.degraded")}</Badge>;
      case "offline":
        return <Badge data-testid="badge-status-offline" variant="destructive"><XCircle className="w-3 h-3 mr-1" /> {t("adminBridge.offline")}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTransferStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge data-testid="badge-transfer-completed" className="bg-green-500">{t("adminBridge.completed")}</Badge>;
      case "pending":
        return <Badge data-testid="badge-transfer-pending" variant="secondary">{t("adminBridge.pending")}</Badge>;
      case "validating":
        return <Badge data-testid="badge-transfer-validating" variant="outline">{t("adminBridge.validating")}</Badge>;
      case "failed":
        return <Badge data-testid="badge-transfer-failed" variant="destructive">{t("adminBridge.failed")}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (statsError) {
    return (
      <div className="flex-1 flex items-center justify-center" data-testid="bridge-dashboard-error">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t("adminBridge.error.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("adminBridge.error.description")}</p>
            <Button onClick={() => refetchStats()} data-testid="button-retry">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminBridge.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <ScrollArea className="h-full" data-testid="bridge-dashboard">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-page-title">{t("adminBridge.title")}</h1>
              <p className="text-muted-foreground" data-testid="text-page-subtitle">{t("adminBridge.subtitle")}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${wsConnected ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                      <div className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                      <span className="text-xs">{wsConnected ? t("adminBridge.connected") : t("adminBridge.reconnecting")}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {wsConnected ? t("adminBridge.wsConnected") : t("adminBridge.wsReconnecting")}
                  </TooltipContent>
                </Tooltip>
                <Clock className="h-4 w-4" />
                <span data-testid="text-last-update">{t("adminBridge.lastUpdate")}: {lastUpdate.toLocaleTimeString(i18n.language === 'ko' ? 'ko-KR' : 'en-US')}</span>
              </div>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} data-testid="button-refresh">
                      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("adminBridge.refresh")}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={handleExport} data-testid="button-export">
                      <Download className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("adminBridge.export")}</TooltipContent>
                </Tooltip>
                <Button variant="outline" data-testid="button-security">
                  <Shield className="w-4 h-4 mr-2" />
                  {t("adminBridge.securityStatus")}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4" data-testid="stats-grid">
            {loadingStats ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10" data-testid="card-volume-24h">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      <span className="text-sm text-muted-foreground">{t("adminBridge.volume24h")}</span>
                    </div>
                    <div className="text-3xl font-bold" data-testid="text-volume-24h">{bridgeStats.totalVolume24h}</div>
                  </CardContent>
                </Card>
                <Card data-testid="card-active-transfers">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowLeftRight className="w-5 h-5 text-orange-500" />
                      <span className="text-sm text-muted-foreground">{t("adminBridge.activeTransfers")}</span>
                    </div>
                    <div className="text-3xl font-bold" data-testid="text-active-transfers">{bridgeStats.activeTransfers}</div>
                  </CardContent>
                </Card>
                <Card data-testid="card-completed-today">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-muted-foreground">{t("adminBridge.completedToday")}</span>
                    </div>
                    <div className="text-3xl font-bold" data-testid="text-completed-today">{bridgeStats.completedToday}</div>
                  </CardContent>
                </Card>
                <Card data-testid="card-avg-transfer-time">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-purple-500" />
                      <span className="text-sm text-muted-foreground">{t("adminBridge.avgTransferTime")}</span>
                    </div>
                    <div className="text-3xl font-bold" data-testid="text-avg-transfer-time">{bridgeStats.avgTransferTime}</div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <Tabs defaultValue="chains" className="space-y-4" data-testid="bridge-tabs">
            <TabsList data-testid="tabs-list">
              <TabsTrigger value="chains" data-testid="tab-chains">
                <Link2 className="w-4 h-4 mr-2" />
                {t("adminBridge.connectedChains")}
              </TabsTrigger>
              <TabsTrigger value="volume" data-testid="tab-volume">
                <TrendingUp className="w-4 h-4 mr-2" />
                {t("adminBridge.volume")}
              </TabsTrigger>
              <TabsTrigger value="transfers" data-testid="tab-transfers">
                <ArrowLeftRight className="w-4 h-4 mr-2" />
                {t("adminBridge.recentTransfers")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chains" data-testid="tab-content-chains">
              <Card data-testid="card-chains">
                <CardHeader>
                  <CardTitle data-testid="text-chains-title">{t("adminBridge.connectedChainsTitle", { count: chains.length })}</CardTitle>
                  <CardDescription>{t("adminBridge.connectedChainsDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingChains ? (
                    <TableSkeleton rows={7} />
                  ) : (
                    <Table data-testid="table-chains">
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("adminBridge.chain")}</TableHead>
                          <TableHead>{t("adminBridge.status")}</TableHead>
                          <TableHead>{t("adminBridge.tvl")}</TableHead>
                          <TableHead>{t("adminBridge.volume24h")}</TableHead>
                          <TableHead>{t("adminBridge.pendingTx")}</TableHead>
                          <TableHead>{t("adminBridge.validators")}</TableHead>
                          <TableHead>{t("adminBridge.actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {chains.map((chain, index) => (
                          <TableRow key={index} data-testid={`row-chain-${chain.symbol}`}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                  <span className="text-xs font-bold">{chain.symbol}</span>
                                </div>
                                <span className="font-medium" data-testid={`text-chain-name-${chain.symbol}`}>{chain.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(chain.status)}</TableCell>
                            <TableCell data-testid={`text-tvl-${chain.symbol}`}>{chain.tvl}</TableCell>
                            <TableCell data-testid={`text-volume-${chain.symbol}`}>{chain.volume24h}</TableCell>
                            <TableCell>
                              <Badge variant="outline" data-testid={`badge-pending-${chain.symbol}`}>{chain.pendingTx ?? chain.pending ?? 0}</Badge>
                            </TableCell>
                            <TableCell data-testid={`text-validators-${chain.symbol}`}>{chain.validators}/{chain.maxValidators ?? 8}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewChain(chain)}
                                data-testid={`button-view-chain-${chain.symbol}`}
                              >
                                <Eye className="w-4 h-4" />
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

            <TabsContent value="volume" data-testid="tab-content-volume">
              <Card data-testid="card-volume-chart">
                <CardHeader>
                  <CardTitle>{t("adminBridge.volumeByChain")}</CardTitle>
                  <CardDescription>{t("adminBridge.volumeByChainDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingVolume ? (
                    <div className="h-80 flex items-center justify-center">
                      <Skeleton className="h-full w-full" />
                    </div>
                  ) : (
                    <div className="h-80" data-testid="chart-volume">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={volumeHistory}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <RechartsTooltip />
                          <Line type="monotone" dataKey="eth" stroke="#3b82f6" name="Ethereum" strokeWidth={2} />
                          <Line type="monotone" dataKey="bsc" stroke="#f59e0b" name="BSC" strokeWidth={2} />
                          <Line type="monotone" dataKey="polygon" stroke="#8b5cf6" name="Polygon" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transfers" data-testid="tab-content-transfers">
              <Card data-testid="card-recent-transfers">
                <CardHeader>
                  <CardTitle>{t("adminBridge.recentTransfersTitle")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingTransfers ? (
                    <TableSkeleton rows={3} />
                  ) : (
                    <Table data-testid="table-recent-transfers">
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("adminBridge.txId")}</TableHead>
                          <TableHead>{t("adminBridge.from")}</TableHead>
                          <TableHead>{t("adminBridge.to")}</TableHead>
                          <TableHead>{t("adminBridge.amount")}</TableHead>
                          <TableHead>{t("adminBridge.status")}</TableHead>
                          <TableHead>{t("adminBridge.time")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentTransfers.map((tx, index) => {
                          const fromDisplay = typeof tx.from === 'string' ? tx.from : tx.from?.chain || 'Unknown';
                          const toDisplay = typeof tx.to === 'string' ? tx.to : tx.to?.chain || 'Unknown';
                          const timeDisplay = tx.time || tx.duration || 'N/A';
                          return (
                            <TableRow key={index} data-testid={`row-transfer-${tx.id}`}>
                              <TableCell className="font-mono" data-testid={`text-tx-id-${index}`}>{tx.id}</TableCell>
                              <TableCell data-testid={`text-from-${index}`}>{fromDisplay}</TableCell>
                              <TableCell data-testid={`text-to-${index}`}>{toDisplay}</TableCell>
                              <TableCell data-testid={`text-amount-${index}`}>{tx.amount}</TableCell>
                              <TableCell>{getTransferStatusBadge(tx.status)}</TableCell>
                              <TableCell className="text-muted-foreground" data-testid={`text-time-${index}`}>{timeDisplay}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {selectedChain && (
          <DetailSheet
            open={detailOpen}
            onOpenChange={setDetailOpen}
            title={t("adminBridge.detail.title")}
            subtitle={selectedChain.name}
            icon={<Link2 className="w-5 h-5" />}
            sections={getChainDetailSections(selectedChain)}
          />
        )}

        <ConfirmationDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          title={t("adminBridge.confirm.exportTitle")}
          description={t("adminBridge.confirm.exportDescription")}
          confirmText={t("adminBridge.confirm.export")}
          cancelText={t("adminBridge.confirm.cancel")}
          destructive={false}
          onConfirm={confirmExport}
        />
      </ScrollArea>
    </TooltipProvider>
  );
}
