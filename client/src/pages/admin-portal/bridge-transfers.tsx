import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatAddress } from "@/lib/format";
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { 
  ArrowLeftRight, Search, Filter, CheckCircle, Clock, 
  AlertTriangle, XCircle, Eye, RefreshCw, Download, AlertCircle
} from "lucide-react";

interface Transfer {
  id: string;
  from: { chain: string; address: string };
  to: { chain: string; address: string };
  amount: string;
  fee: string;
  status: "completed" | "pending" | "validating" | "failed";
  confirmations: string;
  timestamp: string;
  duration: string;
  error?: string;
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Table data-testid="table-skeleton">
      <TableHeader>
        <TableRow>
          {Array.from({ length: 9 }).map((_, i) => (
            <TableHead key={i}><Skeleton className="h-4 w-16" /></TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRow key={i}>
            {Array.from({ length: 9 }).map((_, j) => (
              <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function AdminBridgeTransfers() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [chainFilter, setChainFilter] = useState("all");
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [retryDialogOpen, setRetryDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [actionTransfer, setActionTransfer] = useState<Transfer | null>(null);

  const { data: transfersData, isLoading, error, refetch } = useQuery<{ transfers: Transfer[]; total: number }>({
    queryKey: ["/api/admin/bridge/transfers"],
    refetchInterval: 10000,
  });

  const retryMutation = useMutation({
    mutationFn: async (transferId: string) => {
      const res = await apiRequest("POST", `/api/admin/bridge/transfers/${transferId}/retry`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bridge/transfers"] });
      toast({
        title: t("adminTransfers.retrySuccess"),
        description: t("adminTransfers.retrySuccessDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminTransfers.retryError"),
        description: t("adminTransfers.retryErrorDesc"),
        variant: "destructive",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (transferId: string) => {
      const res = await apiRequest("POST", `/api/admin/bridge/transfers/${transferId}/cancel`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bridge/transfers"] });
      toast({
        title: t("adminTransfers.cancelSuccess"),
        description: t("adminTransfers.cancelSuccessDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminTransfers.cancelError"),
        description: t("adminTransfers.cancelErrorDesc"),
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
          ws?.send(JSON.stringify({ type: "subscribe", channels: ["transfers"] }));
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "transfer_update" || data.type === "transfer_status") {
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
        title: t("adminTransfers.refreshSuccess"),
        description: t("adminTransfers.dataUpdated"),
      });
    } catch (error) {
      toast({
        title: t("adminTransfers.refreshError"),
        description: t("adminTransfers.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
      setLastUpdate(new Date());
    }
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      transfers: transfers,
      filters: { status: statusFilter, chain: chainFilter, search: searchQuery },
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bridge-transfers-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: t("adminTransfers.exportSuccess"),
      description: t("adminTransfers.exportSuccessDesc"),
    });
  }, [toast, t, statusFilter, chainFilter, searchQuery]);

  const transfers = useMemo(() => {
    if (transfersData?.transfers) return transfersData.transfers;
    return [
      { 
        id: "0xabc123def456789012345678901234567890abcd", 
        from: { chain: "Ethereum", address: "0x1234567890abcdef1234567890abcdef12345678" }, 
        to: { chain: "TBURN", address: "tburn1qwertyuiopasdfghjklzxcvbnm12345678xyz" }, 
        amount: "50,000 USDT", 
        fee: "25 USDT",
        status: "completed" as const, 
        confirmations: "12/12",
        timestamp: "2024-12-03 14:30:25",
        duration: "3m 24s"
      },
      { 
        id: "0xdef456ghi789012345678901234567890bcdef01", 
        from: { chain: "TBURN", address: "tburn1asdfghjklqwertyuiopzxcvbnm987654321abc" }, 
        to: { chain: "BSC", address: "0x2345678901bcdef02345678901bcdef023456789" }, 
        amount: "100,000 TBURN", 
        fee: "100 TBURN",
        status: "pending" as const, 
        confirmations: "8/12",
        timestamp: "2024-12-03 14:25:00",
        duration: "-"
      },
      { 
        id: "0xghi789jkl012345678901234567890cdef012345", 
        from: { chain: "Polygon", address: "0x3456789012cdef013456789012cdef0134567890" }, 
        to: { chain: "TBURN", address: "tburn1zxcvbnmasdfghjklqwertyuiop1234567890def" }, 
        amount: "25,000 USDC", 
        fee: "12.5 USDC",
        status: "validating" as const, 
        confirmations: "4/12",
        timestamp: "2024-12-03 14:20:00",
        duration: "-"
      },
      { 
        id: "0xjkl012mno345678901234567890def0123456789", 
        from: { chain: "Avalanche", address: "0x4567890123def0124567890123def01245678901" }, 
        to: { chain: "TBURN", address: "tburn1poiuytrewqlkjhgfdsamnbvcxz987654321ghi" }, 
        amount: "10,000 AVAX", 
        fee: "5 AVAX",
        status: "failed" as const, 
        confirmations: "0/12",
        timestamp: "2024-12-03 14:15:00",
        duration: "-",
        error: "Insufficient liquidity"
      },
    ];
  }, [transfersData]);

  const filteredTransfers = useMemo(() => {
    return transfers.filter(tx => {
      if (statusFilter !== "all" && tx.status !== statusFilter) return false;
      if (chainFilter !== "all" && tx.from.chain.toLowerCase() !== chainFilter && tx.to.chain.toLowerCase() !== chainFilter) return false;
      if (searchQuery && !tx.id.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !tx.from.address.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !tx.to.address.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [transfers, statusFilter, chainFilter, searchQuery]);

  const pendingCount = useMemo(() => transfers.filter(t => t.status === "pending" || t.status === "validating").length, [transfers]);
  const failedCount = useMemo(() => transfers.filter(t => t.status === "failed").length, [transfers]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending": return <Clock className="w-4 h-4 text-yellow-500" />;
      case "validating": return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case "failed": return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      completed: "bg-green-500",
      pending: "bg-yellow-500",
      validating: "bg-blue-500",
      failed: "bg-red-500"
    };
    return <Badge className={variants[status] || ""} data-testid={`badge-status-${status}`}>{t(`adminTransfers.${status}`)}</Badge>;
  };

  const translateError = (error: string | undefined): string => {
    if (!error) return "";
    const errorMap: Record<string, string> = {
      "Insufficient gas": "insufficientGas",
      "Insufficient liquidity": "insufficientLiquidity",
      "Timeout": "timeout",
      "Network error": "networkError",
      "Validation failed": "validationFailed",
      "Slippage exceeded": "slippageExceeded",
      "Contract error": "contractError",
      "Invalid signature": "invalidSignature",
      "Bridge offline": "bridgeOffline",
    };
    const key = errorMap[error];
    return key ? t(`adminTransfers.errorTypes.${key}`) : error;
  };

  const handleViewTransfer = (transfer: Transfer) => {
    setSelectedTransfer(transfer);
    setDetailOpen(true);
  };

  const handleRetryClick = (transfer: Transfer) => {
    setActionTransfer(transfer);
    setRetryDialogOpen(true);
  };

  const handleCancelClick = (transfer: Transfer) => {
    setActionTransfer(transfer);
    setCancelDialogOpen(true);
  };

  const confirmRetry = useCallback(() => {
    if (actionTransfer) {
      retryMutation.mutate(actionTransfer.id);
    }
    setRetryDialogOpen(false);
  }, [actionTransfer, retryMutation]);

  const confirmCancel = useCallback(() => {
    if (actionTransfer) {
      cancelMutation.mutate(actionTransfer.id);
    }
    setCancelDialogOpen(false);
  }, [actionTransfer, cancelMutation]);

  const getTransferDetailSections = (transfer: Transfer): DetailSection[] => {
    return [
      {
        title: t("adminTransfers.detail.summary"),
        fields: [
          { label: t("adminTransfers.detail.transactionId"), value: transfer.id, type: "code" as const, copyable: true },
          { label: t("adminTransfers.detail.status"), value: transfer.status, type: "status" as const },
          { label: t("adminTransfers.detail.amount"), value: transfer.amount, type: "text" as const },
          { label: t("adminTransfers.detail.fee"), value: transfer.fee, type: "text" as const },
        ],
      },
      {
        title: t("adminTransfers.detail.routing"),
        fields: [
          { label: t("adminTransfers.detail.fromChain"), value: transfer.from.chain, type: "text" as const },
          { label: t("adminTransfers.detail.fromAddress"), value: formatAddress(transfer.from.address), type: "code" as const, copyable: true, copyValue: transfer.from.address },
          { label: t("adminTransfers.detail.toChain"), value: transfer.to.chain, type: "text" as const },
          { label: t("adminTransfers.detail.toAddress"), value: formatAddress(transfer.to.address), type: "code" as const, copyable: true, copyValue: transfer.to.address },
        ],
      },
      {
        title: t("adminTransfers.detail.progress"),
        fields: [
          { label: t("adminTransfers.detail.confirmations"), value: transfer.confirmations, type: "text" as const },
          { label: t("adminTransfers.detail.timestamp"), value: transfer.timestamp, type: "text" as const },
          { label: t("adminTransfers.detail.duration"), value: transfer.duration, type: "text" as const },
          ...(transfer.error ? [{ label: t("adminTransfers.detail.error"), value: translateError(transfer.error), type: "text" as const }] : []),
        ],
      },
    ];
  };

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center" data-testid="transfers-error">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t("adminTransfers.error.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("adminTransfers.error.description")}</p>
            <Button onClick={() => refetch()} data-testid="button-retry">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminTransfers.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <ScrollArea className="h-full" data-testid="bridge-transfers">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-page-title">{t("adminTransfers.title")}</h1>
              <p className="text-muted-foreground" data-testid="text-page-subtitle">{t("adminTransfers.subtitle")}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${wsConnected ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                      <div className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                      <span className="text-xs">{wsConnected ? t("adminTransfers.connected") : t("adminTransfers.reconnecting")}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {wsConnected ? t("adminTransfers.wsConnected") : t("adminTransfers.wsReconnecting")}
                  </TooltipContent>
                </Tooltip>
                <Clock className="h-4 w-4" />
                <span data-testid="text-last-update">{t("adminTransfers.lastUpdate")}: {lastUpdate.toLocaleTimeString(i18n.language === 'ko' ? 'ko-KR' : 'en-US')}</span>
              </div>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} data-testid="button-refresh">
                      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("adminTransfers.refresh")}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={handleExport} data-testid="button-export">
                      <Download className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("adminTransfers.export")}</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          <div className="flex gap-4" data-testid="filters-section">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder={t("adminTransfers.searchPlaceholder")}
                className="pl-10" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40" data-testid="select-status">
                <SelectValue placeholder={t("adminTransfers.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" data-testid="option-status-all">{t("adminTransfers.allStatus")}</SelectItem>
                <SelectItem value="completed" data-testid="option-status-completed">{t("adminTransfers.completed")}</SelectItem>
                <SelectItem value="pending" data-testid="option-status-pending">{t("adminTransfers.pending")}</SelectItem>
                <SelectItem value="validating" data-testid="option-status-validating">{t("adminTransfers.validating")}</SelectItem>
                <SelectItem value="failed" data-testid="option-status-failed">{t("adminTransfers.failed")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={chainFilter} onValueChange={setChainFilter}>
              <SelectTrigger className="w-40" data-testid="select-chain">
                <SelectValue placeholder={t("adminTransfers.chain")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" data-testid="option-chain-all">{t("adminTransfers.allChains")}</SelectItem>
                <SelectItem value="ethereum" data-testid="option-chain-eth">Ethereum</SelectItem>
                <SelectItem value="bsc" data-testid="option-chain-bsc">BSC</SelectItem>
                <SelectItem value="polygon" data-testid="option-chain-polygon">Polygon</SelectItem>
                <SelectItem value="tburn" data-testid="option-chain-tburn">TBURN</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" data-testid="button-filter">
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          <Tabs defaultValue="all" className="space-y-4" data-testid="transfers-tabs">
            <TabsList data-testid="tabs-list">
              <TabsTrigger value="all" data-testid="tab-all">{t("adminTransfers.allTransfers")}</TabsTrigger>
              <TabsTrigger value="pending" data-testid="tab-pending">{t("adminTransfers.pendingCount", { count: pendingCount })}</TabsTrigger>
              <TabsTrigger value="failed" data-testid="tab-failed">{t("adminTransfers.failedCount", { count: failedCount })}</TabsTrigger>
            </TabsList>

            <TabsContent value="all" data-testid="tab-content-all">
              <Card data-testid="card-all-transfers">
                <CardContent className="p-0">
                  {isLoading ? (
                    <TableSkeleton rows={4} />
                  ) : (
                    <Table data-testid="table-transfers">
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("adminTransfers.txId")}</TableHead>
                          <TableHead>{t("adminTransfers.from")}</TableHead>
                          <TableHead>{t("adminTransfers.to")}</TableHead>
                          <TableHead>{t("adminTransfers.amount")}</TableHead>
                          <TableHead>{t("adminTransfers.fee")}</TableHead>
                          <TableHead>{t("adminTransfers.status")}</TableHead>
                          <TableHead>{t("adminTransfers.confirmations")}</TableHead>
                          <TableHead>{t("adminTransfers.duration")}</TableHead>
                          <TableHead>{t("adminTransfers.actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTransfers.map((tx) => (
                          <TableRow key={tx.id} data-testid={`row-transfer-${tx.id}`}>
                            <TableCell className="font-mono text-sm" data-testid={`text-tx-id-${tx.id}`}>{tx.id}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium" data-testid={`text-from-chain-${tx.id}`}>{tx.from.chain}</p>
                                <p className="text-xs text-muted-foreground font-mono">{tx.from.address}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium" data-testid={`text-to-chain-${tx.id}`}>{tx.to.chain}</p>
                                <p className="text-xs text-muted-foreground font-mono">{tx.to.address}</p>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium" data-testid={`text-amount-${tx.id}`}>{tx.amount}</TableCell>
                            <TableCell className="text-muted-foreground" data-testid={`text-fee-${tx.id}`}>{tx.fee}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(tx.status)}
                                {getStatusBadge(tx.status)}
                              </div>
                            </TableCell>
                            <TableCell data-testid={`text-confirmations-${tx.id}`}>{tx.confirmations}</TableCell>
                            <TableCell className="text-muted-foreground" data-testid={`text-duration-${tx.id}`}>{tx.duration}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => handleViewTransfer(tx)} 
                                  data-testid={`button-view-${tx.id}`}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {tx.status === "failed" && (
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => handleRetryClick(tx)}
                                    data-testid={`button-retry-${tx.id}`}
                                  >
                                    <RefreshCw className="w-4 h-4" />
                                  </Button>
                                )}
                                {tx.status === "pending" && (
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => handleCancelClick(tx)}
                                    data-testid={`button-cancel-${tx.id}`}
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                )}
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

            <TabsContent value="pending" data-testid="tab-content-pending">
              <Card data-testid="card-pending-transfers">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-yellow-500" />
                    {t("adminTransfers.pendingTransfers")}
                  </CardTitle>
                  <CardDescription>{t("adminTransfers.pendingTransfersDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-32 w-full" />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p data-testid="text-pending-count">{t("adminTransfers.pendingAcrossChains", { count: pendingCount })}</p>
                      <Button variant="outline" className="mt-4" data-testid="button-view-pending">{t("adminTransfers.viewAllPending")}</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="failed" data-testid="tab-content-failed">
              <Card data-testid="card-failed-transfers">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    {t("adminTransfers.failedTransfers")}
                  </CardTitle>
                  <CardDescription>{t("adminTransfers.failedTransfersDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <TableSkeleton rows={2} />
                  ) : (
                    <Table data-testid="table-failed-transfers">
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("adminTransfers.txId")}</TableHead>
                          <TableHead>{t("adminTransfers.route")}</TableHead>
                          <TableHead>{t("adminTransfers.amount")}</TableHead>
                          <TableHead>{t("adminTransfers.error.label")}</TableHead>
                          <TableHead>{t("adminTransfers.actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transfers.filter(t => t.status === "failed").map((tx) => (
                          <TableRow key={tx.id} data-testid={`row-failed-${tx.id}`}>
                            <TableCell className="font-mono">{tx.id}</TableCell>
                            <TableCell>{tx.from.chain} → {tx.to.chain}</TableCell>
                            <TableCell>{tx.amount}</TableCell>
                            <TableCell className="text-red-500">{translateError(tx.error)}</TableCell>
                            <TableCell>
                              <Button 
                                size="sm" 
                                onClick={() => handleRetryClick(tx)}
                                disabled={retryMutation.isPending}
                                data-testid={`button-retry-failed-${tx.id}`}
                              >
                                {t("adminTransfers.retry")}
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
          </Tabs>
        </div>

        {selectedTransfer && (
          <DetailSheet
            open={detailOpen}
            onOpenChange={setDetailOpen}
            title={t("adminTransfers.transferDetails")}
            subtitle={selectedTransfer.id}
            sections={getTransferDetailSections(selectedTransfer)}
          />
        )}

        <ConfirmationDialog
          open={retryDialogOpen}
          onOpenChange={setRetryDialogOpen}
          title={t("adminTransfers.confirm.retryTitle")}
          description={t("adminTransfers.confirm.retryDescription", { txId: actionTransfer?.id || "" })}
          confirmText={t("adminTransfers.confirm.retry")}
          cancelText={t("adminTransfers.confirm.cancel")}
          actionType="restart"
          destructive={false}
          isLoading={retryMutation.isPending}
          onConfirm={confirmRetry}
        />

        <ConfirmationDialog
          open={cancelDialogOpen}
          onOpenChange={setCancelDialogOpen}
          title={t("adminTransfers.confirm.cancelTitle")}
          description={t("adminTransfers.confirm.cancelDescription", { txId: actionTransfer?.id || "" })}
          confirmText={t("adminTransfers.confirm.cancelTransfer")}
          cancelText={t("adminTransfers.confirm.close")}
          actionType="terminate"
          destructive={true}
          isLoading={cancelMutation.isPending}
          onConfirm={confirmCancel}
        />
      </ScrollArea>
    </TooltipProvider>
  );
}
