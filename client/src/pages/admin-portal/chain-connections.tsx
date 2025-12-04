import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Link2, Settings, CheckCircle, AlertTriangle, XCircle, Plus,
  RefreshCw, Download, Clock, Activity, AlertCircle, Globe
} from "lucide-react";

interface ChainStats {
  totalChains: number;
  activeChains: number;
  degradedChains: number;
  offlineChains: number;
  totalTvl: string;
}

interface Chain {
  id: number;
  name: string;
  symbol: string;
  chainId: number;
  status: "active" | "degraded" | "offline";
  tvl: string;
  volume24h: string;
  pendingTx: number;
  validators: number;
  maxValidators: number;
  rpcEndpoint: string;
  explorerUrl: string;
  bridgeContract: string;
  confirmations: number;
  enabled: boolean;
  lastBlock: number;
  blockTime: string;
  latency: number;
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-9 w-16 mt-1" />
      </CardContent>
    </Card>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Table data-testid="table-skeleton">
      <TableHeader>
        <TableRow>
          {Array.from({ length: 8 }).map((_, i) => (
            <TableHead key={i}><Skeleton className="h-4 w-16" /></TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRow key={i}>
            {Array.from({ length: 8 }).map((_, j) => (
              <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function AdminChainConnections() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [addChainOpen, setAddChainOpen] = useState(false);
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null);

  const { data: statsData, isLoading: loadingStats, error, refetch: refetchStats } = useQuery<ChainStats>({
    queryKey: ["/api/admin/bridge/chains/stats"],
    refetchInterval: 30000,
  });

  const { data: chainsData, isLoading: loadingChains, refetch: refetchChains } = useQuery<{ chains: Chain[] }>({
    queryKey: ["/api/admin/bridge/chains"],
    refetchInterval: 15000,
  });

  const toggleChainMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: number; enabled: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/bridge/chains/${id}`, { enabled });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bridge/chains"] });
      toast({
        title: t("adminChains.toggleSuccess"),
        description: t("adminChains.toggleSuccessDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminChains.toggleError"),
        description: t("adminChains.toggleErrorDesc"),
        variant: "destructive",
      });
    },
  });

  const removeChainMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/bridge/chains/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bridge/chains"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bridge/chains/stats"] });
      toast({
        title: t("adminChains.removeSuccess"),
        description: t("adminChains.removeSuccessDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminChains.removeError"),
        description: t("adminChains.removeErrorDesc"),
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    let ws: WebSocket | null = null;
    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
        
        ws.onopen = () => {
          setWsConnected(true);
          ws?.send(JSON.stringify({ type: "subscribe", channels: ["chains", "bridge_status"] }));
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "chain_status" || data.type === "chain_update") {
              refetchChains();
              refetchStats();
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
  }, [refetchChains, refetchStats]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchStats(),
        refetchChains(),
      ]);
      toast({
        title: t("adminChains.refreshSuccess"),
        description: t("adminChains.dataUpdated"),
      });
    } catch (error) {
      toast({
        title: t("adminChains.refreshError"),
        description: t("adminChains.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
      setLastUpdate(new Date());
    }
  }, [refetchStats, refetchChains, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      stats: chainStats,
      chains: chains,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chain-connections-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: t("adminChains.exportSuccess"),
      description: t("adminChains.exportSuccessDesc"),
    });
  }, [toast, t]);

  const chainStats = useMemo(() => {
    if (statsData) return statsData;
    return {
      totalChains: 7,
      activeChains: 5,
      degradedChains: 1,
      offlineChains: 1,
      totalTvl: "$120.1M",
    };
  }, [statsData]);

  const chains = useMemo(() => {
    if (chainsData?.chains) return chainsData.chains;
    return [
      { id: 1, name: "Ethereum", symbol: "ETH", chainId: 1, status: "active" as const, tvl: "$45.2M", volume24h: "$5.2M", pendingTx: 42, validators: 8, maxValidators: 8, rpcEndpoint: "https://eth.tburn.io", explorerUrl: "https://etherscan.io", bridgeContract: "0x1234...5678", confirmations: 12, enabled: true, lastBlock: 18542367, blockTime: "12s", latency: 85 },
      { id: 2, name: "BSC", symbol: "BNB", chainId: 56, status: "active" as const, tvl: "$28.7M", volume24h: "$3.1M", pendingTx: 28, validators: 8, maxValidators: 8, rpcEndpoint: "https://bsc.tburn.io", explorerUrl: "https://bscscan.com", bridgeContract: "0x2345...6789", confirmations: 15, enabled: true, lastBlock: 32456789, blockTime: "3s", latency: 42 },
      { id: 3, name: "Polygon", symbol: "MATIC", chainId: 137, status: "active" as const, tvl: "$15.3M", volume24h: "$1.8M", pendingTx: 15, validators: 8, maxValidators: 8, rpcEndpoint: "https://matic.tburn.io", explorerUrl: "https://polygonscan.com", bridgeContract: "0x3456...7890", confirmations: 256, enabled: true, lastBlock: 51234567, blockTime: "2s", latency: 65 },
      { id: 4, name: "Avalanche", symbol: "AVAX", chainId: 43114, status: "active" as const, tvl: "$12.1M", volume24h: "$1.2M", pendingTx: 12, validators: 8, maxValidators: 8, rpcEndpoint: "https://avax.tburn.io", explorerUrl: "https://snowtrace.io", bridgeContract: "0x4567...8901", confirmations: 12, enabled: true, lastBlock: 38765432, blockTime: "2s", latency: 120 },
      { id: 5, name: "Arbitrum", symbol: "ARB", chainId: 42161, status: "active" as const, tvl: "$8.5M", volume24h: "$0.8M", pendingTx: 8, validators: 8, maxValidators: 8, rpcEndpoint: "https://arb.tburn.io", explorerUrl: "https://arbiscan.io", bridgeContract: "0x5678...9012", confirmations: 12, enabled: true, lastBlock: 156789012, blockTime: "250ms", latency: 55 },
      { id: 6, name: "Optimism", symbol: "OP", chainId: 10, status: "degraded" as const, tvl: "$6.2M", volume24h: "$0.3M", pendingTx: 35, validators: 6, maxValidators: 8, rpcEndpoint: "https://op.tburn.io", explorerUrl: "https://optimistic.etherscan.io", bridgeContract: "0x6789...0123", confirmations: 50, enabled: true, lastBlock: 112345678, blockTime: "2s", latency: 250 },
      { id: 7, name: "Base", symbol: "BASE", chainId: 8453, status: "offline" as const, tvl: "$4.1M", volume24h: "$0", pendingTx: 0, validators: 0, maxValidators: 8, rpcEndpoint: "https://base.tburn.io", explorerUrl: "https://basescan.org", bridgeContract: "0x7890...1234", confirmations: 12, enabled: false, lastBlock: 0, blockTime: "-", latency: 0 },
    ];
  }, [chainsData]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500" data-testid="badge-status-active"><CheckCircle className="w-3 h-3 mr-1" /> {t("adminChains.active")}</Badge>;
      case "degraded":
        return <Badge className="bg-yellow-500" data-testid="badge-status-degraded"><AlertTriangle className="w-3 h-3 mr-1" /> {t("adminChains.degraded")}</Badge>;
      case "offline":
        return <Badge variant="destructive" data-testid="badge-status-offline"><XCircle className="w-3 h-3 mr-1" /> {t("adminChains.offline")}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center" data-testid="chains-error">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t("adminChains.error.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("adminChains.error.description")}</p>
            <Button onClick={() => refetchStats()} data-testid="button-retry">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminChains.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <ScrollArea className="h-full" data-testid="chain-connections">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-page-title">{t("adminChains.title")}</h1>
              <p className="text-muted-foreground" data-testid="text-page-subtitle">{t("adminChains.subtitle")}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${wsConnected ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                      <div className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                      <span className="text-xs">{wsConnected ? t("adminChains.connected") : t("adminChains.reconnecting")}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {wsConnected ? t("adminChains.wsConnected") : t("adminChains.wsReconnecting")}
                  </TooltipContent>
                </Tooltip>
                <Clock className="h-4 w-4" />
                <span data-testid="text-last-update">{t("adminChains.lastUpdate")}: {lastUpdate.toLocaleTimeString(i18n.language === 'ko' ? 'ko-KR' : 'en-US')}</span>
              </div>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} data-testid="button-refresh">
                      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("adminChains.refresh")}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={handleExport} data-testid="button-export">
                      <Download className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("adminChains.export")}</TooltipContent>
                </Tooltip>
                <Dialog open={addChainOpen} onOpenChange={setAddChainOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-chain">
                      <Plus className="w-4 h-4 mr-2" />
                      {t("adminChains.addChain")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent data-testid="dialog-add-chain">
                    <DialogHeader>
                      <DialogTitle>{t("adminChains.addNewChain")}</DialogTitle>
                      <DialogDescription>{t("adminChains.addNewChainDesc")}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>{t("adminChains.chainName")}</Label>
                        <Input placeholder="e.g., Ethereum Mainnet" data-testid="input-new-chain-name" />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("adminChains.chainId")}</Label>
                        <Input type="number" placeholder="e.g., 1" data-testid="input-new-chain-id" />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("adminChains.rpcEndpoint")}</Label>
                        <Input placeholder="https://..." data-testid="input-new-rpc" />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("adminChains.bridgeContract")}</Label>
                        <Input placeholder="0x..." data-testid="input-new-contract" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAddChainOpen(false)} data-testid="button-cancel-add">{t("adminChains.cancel")}</Button>
                      <Button data-testid="button-confirm-add">{t("adminChains.addChain")}</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4" data-testid="stats-grid">
            {loadingStats ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <Card data-testid="card-total-chains">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-5 h-5 text-blue-500" />
                      <span className="text-sm text-muted-foreground">{t("adminChains.totalChains")}</span>
                    </div>
                    <div className="text-3xl font-bold" data-testid="text-total-chains">{chainStats.totalChains}</div>
                  </CardContent>
                </Card>
                <Card data-testid="card-active-chains">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-muted-foreground">{t("adminChains.activeChains")}</span>
                    </div>
                    <div className="text-3xl font-bold text-green-500" data-testid="text-active-chains">{chainStats.activeChains}</div>
                  </CardContent>
                </Card>
                <Card data-testid="card-degraded-chains">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm text-muted-foreground">{t("adminChains.degradedChains")}</span>
                    </div>
                    <div className="text-3xl font-bold text-yellow-500" data-testid="text-degraded-chains">{chainStats.degradedChains}</div>
                  </CardContent>
                </Card>
                <Card data-testid="card-offline-chains">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-5 h-5 text-red-500" />
                      <span className="text-sm text-muted-foreground">{t("adminChains.offlineChains")}</span>
                    </div>
                    <div className="text-3xl font-bold text-red-500" data-testid="text-offline-chains">{chainStats.offlineChains}</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10" data-testid="card-total-tvl">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-5 h-5 text-purple-500" />
                      <span className="text-sm text-muted-foreground">{t("adminChains.totalTvl")}</span>
                    </div>
                    <div className="text-3xl font-bold" data-testid="text-total-tvl">{chainStats.totalTvl}</div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <Tabs defaultValue="chains" className="space-y-4" data-testid="chains-tabs">
            <TabsList data-testid="tabs-list">
              <TabsTrigger value="chains" data-testid="tab-chains">
                <Link2 className="w-4 h-4 mr-2" />
                {t("adminChains.allChains")}
              </TabsTrigger>
              <TabsTrigger value="config" data-testid="tab-config">
                <Settings className="w-4 h-4 mr-2" />
                {t("adminChains.configuration")}
              </TabsTrigger>
              <TabsTrigger value="status" data-testid="tab-status">
                <Activity className="w-4 h-4 mr-2" />
                {t("adminChains.liveStatus")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chains" data-testid="tab-content-chains">
              <Card data-testid="card-chains-table">
                <CardHeader>
                  <CardTitle>{t("adminChains.connectedChains")}</CardTitle>
                  <CardDescription>{t("adminChains.connectedChainsDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingChains ? (
                    <TableSkeleton rows={7} />
                  ) : (
                    <Table data-testid="table-chains">
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("adminChains.chain")}</TableHead>
                          <TableHead>{t("adminChains.chainId")}</TableHead>
                          <TableHead>{t("adminChains.status")}</TableHead>
                          <TableHead>{t("adminChains.blockHeight")}</TableHead>
                          <TableHead>{t("adminChains.latency")}</TableHead>
                          <TableHead>{t("adminChains.contract")}</TableHead>
                          <TableHead>{t("adminChains.enabled")}</TableHead>
                          <TableHead>{t("adminChains.actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {chains.map((chain) => (
                          <TableRow key={chain.id} data-testid={`row-chain-${chain.id}`}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                  <span className="text-xs font-bold">{chain.symbol}</span>
                                </div>
                                <span className="font-medium" data-testid={`text-chain-name-${chain.id}`}>{chain.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono" data-testid={`text-chain-id-${chain.id}`}>{chain.chainId}</TableCell>
                            <TableCell>{getStatusBadge(chain.status)}</TableCell>
                            <TableCell data-testid={`text-block-height-${chain.id}`}>{chain.lastBlock.toLocaleString()}</TableCell>
                            <TableCell>
                              <span className={chain.latency < 100 ? "text-green-500" : chain.latency < 200 ? "text-yellow-500" : "text-red-500"} data-testid={`text-latency-${chain.id}`}>
                                {chain.latency}ms
                              </span>
                            </TableCell>
                            <TableCell className="font-mono text-sm" data-testid={`text-contract-${chain.id}`}>{chain.bridgeContract}</TableCell>
                            <TableCell>
                              <Switch
                                checked={chain.enabled}
                                onCheckedChange={(enabled) => toggleChainMutation.mutate({ id: chain.id, enabled })}
                                disabled={toggleChainMutation.isPending}
                                data-testid={`switch-enabled-${chain.id}`}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="icon" variant="ghost" onClick={() => setSelectedChain(chain)} data-testid={`button-configure-${chain.id}`}>
                                      <Settings className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl" data-testid="dialog-chain-config">
                                    <DialogHeader>
                                      <DialogTitle>{t("adminChains.chainConfiguration")}</DialogTitle>
                                      <DialogDescription>{t("adminChains.chainConfigurationDesc")}</DialogDescription>
                                    </DialogHeader>
                                    {selectedChain && (
                                      <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <Label>{t("adminChains.chainName")}</Label>
                                            <Input value={selectedChain.name} disabled data-testid="input-config-chain-name" />
                                          </div>
                                          <div>
                                            <Label>{t("adminChains.chainId")}</Label>
                                            <Input value={selectedChain.chainId} disabled data-testid="input-config-chain-id" />
                                          </div>
                                          <div className="col-span-2">
                                            <Label>{t("adminChains.rpcEndpoint")}</Label>
                                            <Input value={selectedChain.rpcEndpoint} data-testid="input-config-rpc-endpoint" />
                                          </div>
                                          <div className="col-span-2">
                                            <Label>{t("adminChains.explorerUrl")}</Label>
                                            <Input value={selectedChain.explorerUrl} data-testid="input-config-explorer-url" />
                                          </div>
                                          <div className="col-span-2">
                                            <Label>{t("adminChains.bridgeContract")}</Label>
                                            <Input value={selectedChain.bridgeContract} className="font-mono" data-testid="input-config-bridge-contract" />
                                          </div>
                                          <div>
                                            <Label>{t("adminChains.confirmations")}</Label>
                                            <Input type="number" value={selectedChain.confirmations} data-testid="input-config-confirmations" />
                                          </div>
                                          <div>
                                            <Label>{t("adminChains.blockTime")}</Label>
                                            <Input value={selectedChain.blockTime} disabled data-testid="input-config-block-time" />
                                          </div>
                                        </div>
                                        <DialogFooter>
                                          <Button variant="destructive" onClick={() => removeChainMutation.mutate(selectedChain.id)} disabled={removeChainMutation.isPending} data-testid="button-remove-chain">
                                            {t("adminChains.removeChain")}
                                          </Button>
                                          <Button data-testid="button-save-config">{t("adminChains.saveConfiguration")}</Button>
                                        </DialogFooter>
                                      </div>
                                    )}
                                  </DialogContent>
                                </Dialog>
                                <Button size="icon" variant="ghost" onClick={handleRefresh} disabled={isRefreshing} data-testid={`button-refresh-chain-${chain.id}`}>
                                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="config" data-testid="tab-content-config">
              <div className="grid grid-cols-2 gap-4">
                <Card data-testid="card-bridge-settings">
                  <CardHeader>
                    <CardTitle>{t("adminChains.bridgeSettings")}</CardTitle>
                    <CardDescription>{t("adminChains.bridgeSettingsDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loadingStats ? (
                      <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : (
                      <>
                        <div>
                          <Label>{t("adminChains.minValidators")}</Label>
                          <Input type="number" defaultValue="6" data-testid="input-min-validators" />
                        </div>
                        <div>
                          <Label>{t("adminChains.maxPendingPerChain")}</Label>
                          <Input type="number" defaultValue="100" data-testid="input-max-pending" />
                        </div>
                        <div>
                          <Label>{t("adminChains.transferCooldown")}</Label>
                          <Input type="text" defaultValue="5m" data-testid="input-cooldown" />
                        </div>
                        <Button className="w-full" data-testid="button-save-settings">{t("adminChains.saveSettings")}</Button>
                      </>
                    )}
                  </CardContent>
                </Card>
                <Card data-testid="card-fee-config">
                  <CardHeader>
                    <CardTitle>{t("adminChains.feeConfiguration")}</CardTitle>
                    <CardDescription>{t("adminChains.feeConfigurationDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loadingStats ? (
                      <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : (
                      <>
                        <div>
                          <Label>{t("adminChains.baseFee")}</Label>
                          <Input type="text" defaultValue="0.05%" data-testid="input-base-fee" />
                        </div>
                        <div>
                          <Label>{t("adminChains.minFee")}</Label>
                          <Input type="text" defaultValue="$1.00" data-testid="input-min-fee" />
                        </div>
                        <div>
                          <Label>{t("adminChains.maxFee")}</Label>
                          <Input type="text" defaultValue="$100.00" data-testid="input-max-fee" />
                        </div>
                        <Button className="w-full" data-testid="button-save-fees">{t("adminChains.saveFees")}</Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="status" data-testid="tab-content-status">
              <Card data-testid="card-live-status">
                <CardHeader>
                  <CardTitle>{t("adminChains.rpcHealth")}</CardTitle>
                  <CardDescription>{t("adminChains.rpcHealthDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingChains ? (
                    <div className="grid grid-cols-4 gap-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-4">
                      {chains.slice(0, 4).map((chain) => (
                        <div key={chain.id} className="p-4 border rounded-lg" data-testid={`card-rpc-health-${chain.id}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{chain.name}</span>
                            <Badge variant="outline" className={chain.status === "active" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"} data-testid={`badge-latency-${chain.id}`}>
                              {chain.latency}ms
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground truncate" data-testid={`text-rpc-url-${chain.id}`}>{chain.rpcEndpoint}</div>
                          <div className="flex items-center gap-2 mt-2">
                            <div className={`w-2 h-2 rounded-full ${chain.status === "active" ? "bg-green-500" : "bg-yellow-500"} animate-pulse`} />
                            <span className="text-xs">{t("adminChains.connected")}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </TooltipProvider>
  );
}
