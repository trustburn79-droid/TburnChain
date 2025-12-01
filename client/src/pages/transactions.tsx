import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useWebSocket } from "@/lib/websocket-context";
import { queryClient } from "@/lib/queryClient";
import { formatGasEmber, formatNumber, formatAddress, formatTokenAmount, formatGasPriceEmber, calculateTransactionFeeEmber } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  User,
  Activity,
  Database,
  AlertCircle,
  Download,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  Zap,
  CheckCircle,
  XCircle,
  TrendingUp,
  Gauge,
  FileJson,
  FileSpreadsheet,
  Copy,
  Eye,
  Wifi,
  WifiOff,
  Calendar,
  ArrowRight,
  DollarSign,
  Box,
  FileCode,
  Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Transaction } from "@shared/schema";

interface TransactionsResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface TransactionMetrics {
  totalTransactions: number;
  avgGasUsed: number;
  avgGasPrice: number;
  successRate: number;
  avgValue: number;
  networkTps: number;
  pendingCount: number;
}

const TX_STATUS_OPTIONS = [
  { value: "all", labelKey: "transactions.allStatuses" },
  { value: "success", labelKey: "transactions.success" },
  { value: "failed", labelKey: "transactions.failed" },
  { value: "pending", labelKey: "transactions.pending" },
];

const TX_TYPE_OPTIONS = [
  { value: "all", labelKey: "transactions.allTypes" },
  { value: "transfer", labelKey: "transactions.transfer" },
  { value: "contract", labelKey: "transactions.contractCall" },
  { value: "create", labelKey: "transactions.contractCreation" },
];

const TIME_RANGE_KEYS = [
  { value: "15m", labelKey: "transactions.timeRange15m" },
  { value: "1h", labelKey: "transactions.timeRange1h" },
  { value: "6h", labelKey: "transactions.timeRange6h" },
  { value: "24h", labelKey: "transactions.timeRange24h" },
  { value: "7d", labelKey: "transactions.timeRange7d" },
  { value: "all", labelKey: "transactions.timeRangeAll" },
];

function MetricCard({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  trend,
  trendUp,
  color = "text-primary"
}: { 
  icon: any; 
  title: string; 
  value: string; 
  subtitle?: string;
  trend?: string;
  trendUp?: boolean;
  color?: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            {trend && (
              <div className={`flex items-center gap-1 text-xs ${trendUp ? 'text-green-500' : 'text-muted-foreground'}`}>
                {trendUp !== undefined && (trendUp ? <TrendingUp className="h-3 w-3" /> : <span>~</span>)}
                {trend}
              </div>
            )}
          </div>
          <div className={`p-2 rounded-lg bg-muted/50 ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TransactionRow({ 
  tx, 
  onClick,
  t
}: { 
  tx: Transaction;
  onClick: () => void;
  t: any;
}) {
  const { toast } = useToast();
  
  const copyHash = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (tx.hash) {
      navigator.clipboard.writeText(tx.hash);
      toast({
        title: t('transactions.hashCopied', 'Hash Copied'),
        description: t('transactions.hashCopiedDesc', 'Transaction hash copied to clipboard'),
      });
    }
  }, [tx.hash, toast, t]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge variant="default" className="bg-green-600 gap-1"><CheckCircle className="h-3 w-3" />{t('transactions.success')}</Badge>;
      case "failed":
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />{t('transactions.failed')}</Badge>;
      case "pending":
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />{t('transactions.pending')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTxTypeIcon = () => {
    if (!tx.to) return <FileCode className="h-3 w-3 text-purple-500" />;
    if (tx.input && tx.input !== '0x') return <Zap className="h-3 w-3 text-blue-500" />;
    return <Send className="h-3 w-3 text-green-500" />;
  };

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={onClick}
      data-testid={`row-transaction-${tx.hash?.slice(0, 10) || 'unknown'}`}
    >
      <TableCell>
        <div className="flex items-center gap-2">
          {getTxTypeIcon()}
          <Link 
            href={`/transactions/${tx.hash}`}
            className="font-mono text-xs text-primary hover:underline"
            data-testid={`link-tx-${tx.hash?.slice(0, 10)}`}
          >
            {formatAddress(tx.hash || '', 8, 6)}
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={copyHash}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
      <TableCell>
        <Link 
          href={`/blocks/${tx.blockNumber}`}
          className="font-mono text-xs text-primary hover:underline"
        >
          #{tx.blockNumber?.toLocaleString() || '-'}
        </Link>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs">
            {new Date(tx.timestamp * 1000).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="font-mono text-xs">{formatAddress(tx.from, 6, 4)}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-mono text-xs">{tx.from}</p>
          </TooltipContent>
        </Tooltip>
      </TableCell>
      <TableCell>
        {tx.to ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="font-mono text-xs">{formatAddress(tx.to, 6, 4)}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-mono text-xs">{tx.to}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <Badge variant="outline" className="text-xs gap-1">
            <FileCode className="h-3 w-3" />
            {t('transactions.contractCreation')}
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <span className="font-mono text-xs font-medium">{formatTokenAmount(tx.value)}</span>
      </TableCell>
      <TableCell>
        <span className="font-mono text-xs">{tx.gasUsed != null ? formatGasEmber(tx.gasUsed) : '-'}</span>
      </TableCell>
      <TableCell>
        <span className="font-mono text-xs font-medium text-primary">
          {tx.gasUsed != null ? calculateTransactionFeeEmber(tx.gasPrice, tx.gasUsed) : t('common.pending')}
        </span>
      </TableCell>
      <TableCell>
        {getStatusBadge(tx.status)}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onClick(); }}>
              <Eye className="h-4 w-4 mr-2" />
              {t('transactions.viewDetails')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={copyHash}>
              <Copy className="h-4 w-4 mr-2" />
              {t('transactions.copyHash')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e) => { 
              e.stopPropagation(); 
              window.location.href = `/blocks/${tx.blockNumber}`;
            }}>
              <Box className="h-4 w-4 mr-2" />
              {t('transactions.viewBlock')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

function ExportDialog({ 
  isOpen, 
  onClose, 
  transactions,
  t
}: { 
  isOpen: boolean; 
  onClose: () => void;
  transactions: Transaction[];
  t: any;
}) {
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      if (exportFormat === 'csv') {
        const headers = ['Hash', 'Block', 'Timestamp', 'From', 'To', 'Value', 'Gas Used', 'Gas Price', 'Fee', 'Status'];
        const rows = transactions.map(tx => [
          tx.hash,
          tx.blockNumber,
          new Date(tx.timestamp * 1000).toISOString(),
          tx.from,
          tx.to || 'Contract Creation',
          tx.value,
          tx.gasUsed,
          tx.gasPrice,
          tx.gasUsed ? (BigInt(tx.gasUsed) * BigInt(tx.gasPrice)).toString() : '0',
          tx.status
        ]);
        content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        filename = `tburn-transactions-${Date.now()}.csv`;
        mimeType = 'text/csv';
      } else {
        content = JSON.stringify(transactions, null, 2);
        filename = `tburn-transactions-${Date.now()}.json`;
        mimeType = 'application/json';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: t('transactions.downloadSuccess'),
        description: `${transactions.length} ${t('transactions.transactionsExported')}`,
      });
      onClose();
    } catch (error) {
      toast({
        title: t('transactions.downloadFailed'),
        description: t('transactions.exportError'),
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('transactions.exportTransactions')}</DialogTitle>
          <DialogDescription>{t('transactions.exportDescription')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t('transactions.selectFormat')}</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={exportFormat === 'csv' ? 'default' : 'outline'}
                className="gap-2"
                onClick={() => setExportFormat('csv')}
              >
                <FileSpreadsheet className="h-4 w-4" />
                {t('transactions.csvFormat')}
              </Button>
              <Button
                variant={exportFormat === 'json' ? 'default' : 'outline'}
                className="gap-2"
                onClick={() => setExportFormat('json')}
              >
                <FileJson className="h-4 w-4" />
                {t('transactions.jsonFormat')}
              </Button>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {t('transactions.exportingCount', { count: transactions.length })}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {t('common.download')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Transactions() {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { subscribeToEvent, isConnected } = useWebSocket();
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [pageInput, setPageInput] = useState("1");
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("all");
  const [minValue, setMinValue] = useState<string>("");
  const [maxValue, setMaxValue] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("timestamp");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isExportOpen, setIsExportOpen] = useState(false);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", pageSize.toString());
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    
    if (selectedStatus && selectedStatus !== "all") params.set("status", selectedStatus);
    if (selectedType && selectedType !== "all") params.set("type", selectedType);
    if (selectedTimeRange && selectedTimeRange !== "all") params.set("timeRange", selectedTimeRange);
    if (minValue) params.set("minValue", minValue);
    if (maxValue) params.set("maxValue", maxValue);
    if (searchInput) params.set("search", searchInput);
    
    return params.toString();
  }, [page, pageSize, sortBy, sortOrder, selectedStatus, selectedType, selectedTimeRange, minValue, maxValue, searchInput]);

  const { data: txData, isLoading, error, refetch, isFetching } = useQuery<TransactionsResponse>({
    queryKey: ["/api/transactions", queryParams],
    queryFn: async ({ signal }) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      try {
        const response = await fetch(`/api/transactions?${queryParams}`, {
          credentials: "include",
          signal: signal || controller.signal,
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch transactions: ${response.status} ${errorText}`);
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          return {
            transactions: data,
            pagination: {
              page: 1,
              limit: pageSize,
              totalPages: Math.ceil(data.length / pageSize),
              totalItems: data.length,
              hasNext: false,
              hasPrev: false
            }
          };
        }
        return data;
      } catch (err) {
        clearTimeout(timeoutId);
        throw err;
      }
    },
    refetchInterval: isAutoRefresh ? 5000 : false,
    staleTime: 3000,
    gcTime: 300000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData,
  });

  const transactions = txData?.transactions || [];
  const pagination = txData?.pagination || { page: 1, limit: 20, totalPages: 1, totalItems: 0, hasNext: false, hasPrev: false };

  const metrics = useMemo<TransactionMetrics>(() => {
    if (!transactions.length) {
      return {
        totalTransactions: pagination.totalItems || 0,
        avgGasUsed: 0,
        avgGasPrice: 0,
        successRate: 0,
        avgValue: 0,
        networkTps: 0,
        pendingCount: 0
      };
    }

    const successCount = transactions.filter(tx => tx.status === 'success').length;
    const pendingCount = transactions.filter(tx => tx.status === 'pending').length;
    const gasUsedSum = transactions.reduce((acc, tx) => acc + Number(tx.gasUsed || 0), 0);
    const gasPriceSum = transactions.reduce((acc, tx) => acc + Number(tx.gasPrice || 0), 0);
    
    return {
      totalTransactions: pagination.totalItems || transactions.length,
      avgGasUsed: Math.round(gasUsedSum / transactions.length),
      avgGasPrice: Math.round(gasPriceSum / transactions.length),
      successRate: Math.round((successCount / transactions.length) * 100),
      avgValue: 0,
      networkTps: Math.round(transactions.length / 60),
      pendingCount
    };
  }, [transactions, pagination.totalItems]);

  useEffect(() => {
    if (!isAutoRefresh) return;

    const unsubscribe = subscribeToEvent('transactions', () => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key[0] === "/api/transactions";
        }
      });
      setLastUpdate(new Date());
    });

    return () => unsubscribe?.();
  }, [subscribeToEvent, isAutoRefresh]);

  const hasActiveFilters = useMemo(() => {
    return (selectedStatus && selectedStatus !== "all") ||
           (selectedType && selectedType !== "all") ||
           (selectedTimeRange && selectedTimeRange !== "all") ||
           minValue || maxValue || searchInput;
  }, [selectedStatus, selectedType, selectedTimeRange, minValue, maxValue, searchInput]);

  const clearFilters = useCallback(() => {
    setSelectedStatus("all");
    setSelectedType("all");
    setSelectedTimeRange("all");
    setMinValue("");
    setMaxValue("");
    setSearchInput("");
    setPage(1);
    setPageInput("1");
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setPageInput("1");
    refetch();
  }, [refetch]);

  const toggleSort = useCallback((column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  }, [sortBy, sortOrder]);

  const renderSortIcon = (column: string) => {
    if (sortBy !== column) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    return sortOrder === "desc" 
      ? <ArrowDown className="h-3 w-3 ml-1" />
      : <ArrowUp className="h-3 w-3 ml-1" />;
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPage = parseInt(pageInput);
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
    } else {
      setPageInput(page.toString());
    }
  };

  if (error) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('transactions.failedToLoadTransactions')}: {error.message}
            <Button variant="outline" size="sm" className="ml-4" onClick={() => refetch()}>
              {t('common.retry')}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2" data-testid="text-transactions-title">
            <Activity className="h-7 w-7 text-primary" />
            {t('transactions.title')}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={isConnected ? "default" : "secondary"} className={`gap-1 ${isConnected && isAutoRefresh ? "bg-green-600 hover:bg-green-700" : ""}`}>
              {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {isAutoRefresh ? t('blocks.live') : t('blocks.paused')}
            </Badge>
            <span className="text-xs text-muted-foreground">
              • {t('blocks.lastUpdate')}: {lastUpdate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={isAutoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            className={`gap-2 ${isAutoRefresh ? "bg-green-600 hover:bg-green-700" : ""}`}
            data-testid="button-toggle-live"
          >
            {isAutoRefresh ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            {isAutoRefresh ? t('blocks.live') : t('blocks.paused')}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            data-testid="button-refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExportOpen(true)}
            className="gap-2"
            data-testid="button-export"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">{t('transactions.export')}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
        <MetricCard
          icon={Activity}
          title={t('transactions.totalTransactions')}
          value={formatNumber(metrics.totalTransactions)}
          subtitle={t('transactions.allTime')}
          color="text-blue-500"
        />
        <MetricCard
          icon={CheckCircle}
          title={t('transactions.successRate')}
          value={`${metrics.successRate}%`}
          trend={metrics.successRate > 95 ? t('transactions.healthy') : t('transactions.normal')}
          trendUp={metrics.successRate > 95}
          color="text-green-500"
        />
        <MetricCard
          icon={Gauge}
          title={t('transactions.avgGasUsed')}
          value={formatGasEmber(metrics.avgGasUsed)}
          color="text-purple-500"
        />
        <MetricCard
          icon={DollarSign}
          title={t('transactions.avgGasPrice')}
          value={`${formatNumber(metrics.avgGasPrice)} EMB`}
          color="text-yellow-500"
        />
        <MetricCard
          icon={Zap}
          title={t('transactions.networkTps')}
          value={formatNumber(metrics.networkTps)}
          subtitle={t('transactions.txPerSecond')}
          color="text-orange-500"
        />
        <MetricCard
          icon={Clock}
          title={t('transactions.pendingTx')}
          value={formatNumber(metrics.pendingCount)}
          color="text-amber-500"
        />
        <MetricCard
          icon={isConnected ? CheckCircle : XCircle}
          title={t('transactions.networkStatus')}
          value={isConnected ? t('common.connected') : t('common.disconnected')}
          subtitle={isConnected ? t('transactions.realTimeSync') : t('transactions.reconnecting')}
          color={isConnected ? "text-green-500" : "text-red-500"}
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {t('transactions.recentTransactions')}
              </CardTitle>
              <CardDescription>
                {formatNumber(pagination.totalItems)} {t('transactions.totalTransactions').toLowerCase()} • {t('common.page')} {page} / {pagination.totalPages}
              </CardDescription>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <form onSubmit={handleSearch} className="flex-1 sm:flex-none">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('transactions.searchPlaceholder')}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-10 w-full sm:w-[300px]"
                    data-testid="input-search"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
                  )}
                </div>
              </form>
              
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2" data-testid="button-filter">
                    <Filter className="h-4 w-4" />
                    {t('common.filter')}
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center">
                        {[selectedStatus, selectedType, selectedTimeRange, minValue, maxValue]
                          .filter(v => v && v !== "all").length}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>{t('transactions.filterTransactions')}</SheetTitle>
                    <SheetDescription>{t('transactions.filterDescription')}</SheetDescription>
                  </SheetHeader>
                  
                  <div className="space-y-6 mt-6">
                    <div className="space-y-2">
                      <Label>{t('transactions.timeRange')}</Label>
                      <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_RANGE_KEYS.map(r => (
                            <SelectItem key={r.value} value={r.value}>{t(r.labelKey)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{t('transactions.status')}</Label>
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TX_STATUS_OPTIONS.map(s => (
                            <SelectItem key={s.value} value={s.value}>{t(s.labelKey)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{t('transactions.type')}</Label>
                      <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TX_TYPE_OPTIONS.map(t_opt => (
                            <SelectItem key={t_opt.value} value={t_opt.value}>{t(t_opt.labelKey)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{t('transactions.valueRange')}</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder={t('transactions.minValue')}
                          value={minValue}
                          onChange={(e) => setMinValue(e.target.value)}
                          type="number"
                        />
                        <Input
                          placeholder={t('transactions.maxValue')}
                          value={maxValue}
                          onChange={(e) => setMaxValue(e.target.value)}
                          type="number"
                        />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex gap-2">
                      <Button onClick={clearFilters} variant="outline" className="flex-1">
                        {t('transactions.clearAll')}
                      </Button>
                      <Button onClick={() => setIsFilterOpen(false)} className="flex-1">
                        {t('transactions.applyFilters')}
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              
              <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(parseInt(v)); setPage(1); setPageInput("1"); }}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 / {t('common.page')}</SelectItem>
                  <SelectItem value="20">20 / {t('common.page')}</SelectItem>
                  <SelectItem value="50">50 / {t('common.page')}</SelectItem>
                  <SelectItem value="100">100 / {t('common.page')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t">
              <span className="text-xs text-muted-foreground">{t('transactions.activeFilters')}:</span>
              {selectedTimeRange && selectedTimeRange !== "all" && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Calendar className="h-3 w-3" />
                  {t(TIME_RANGE_KEYS.find(r => r.value === selectedTimeRange)?.labelKey || 'transactions.timeRangeAll')}
                  <button onClick={() => setSelectedTimeRange("all")}><XCircle className="h-3 w-3" /></button>
                </Badge>
              )}
              {selectedStatus && selectedStatus !== "all" && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <CheckCircle className="h-3 w-3" />
                  {t(TX_STATUS_OPTIONS.find(s => s.value === selectedStatus)?.labelKey || 'transactions.allStatuses')}
                  <button onClick={() => setSelectedStatus("all")}><XCircle className="h-3 w-3" /></button>
                </Badge>
              )}
              {selectedType && selectedType !== "all" && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Zap className="h-3 w-3" />
                  {t(TX_TYPE_OPTIONS.find(t_opt => t_opt.value === selectedType)?.labelKey || 'transactions.allTypes')}
                  <button onClick={() => setSelectedType("all")}><XCircle className="h-3 w-3" /></button>
                </Badge>
              )}
              {(minValue || maxValue) && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <DollarSign className="h-3 w-3" />
                  {minValue || '0'} - {maxValue || '∞'} TBURN
                  <button onClick={() => { setMinValue(""); setMaxValue(""); }}><XCircle className="h-3 w-3" /></button>
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-xs">
                {t('transactions.clearAll')}
              </Button>
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : transactions.length > 0 ? (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>{t('transactions.txHash')}</TableHead>
                      <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => toggleSort("blockNumber")}>
                        <div className="flex items-center">{t('transactions.block')}{renderSortIcon("blockNumber")}</div>
                      </TableHead>
                      <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => toggleSort("timestamp")}>
                        <div className="flex items-center">{t('common.time')}{renderSortIcon("timestamp")}</div>
                      </TableHead>
                      <TableHead>{t('common.from')}</TableHead>
                      <TableHead>{t('common.to')}</TableHead>
                      <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => toggleSort("value")}>
                        <div className="flex items-center">{t('common.value')}{renderSortIcon("value")}</div>
                      </TableHead>
                      <TableHead>{t('transactions.gasUsed')}</TableHead>
                      <TableHead>{t('common.fee')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                      <TableHead className="text-right">{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TransactionRow
                        key={tx.id || tx.hash}
                        tx={tx}
                        onClick={() => tx.hash && setLocation(`/transactions/${tx.hash}`)}
                        t={t}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                <div className="text-sm text-muted-foreground">
                  {t('transactions.showing')} {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, pagination.totalItems)} {t('transactions.of')} {formatNumber(pagination.totalItems)} {t('transactions.transactions')}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setPage(1); setPageInput("1"); }}
                    disabled={page === 1}
                    data-testid="button-first-page"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setPage(p => p - 1); setPageInput((page - 1).toString()); }}
                    disabled={page === 1}
                    data-testid="button-prev-page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1">
                    <Input
                      type="number"
                      min={1}
                      max={pagination.totalPages}
                      value={pageInput}
                      onChange={(e) => setPageInput(e.target.value)}
                      className="w-16 h-8 text-center"
                      data-testid="input-page"
                    />
                    <span className="text-sm text-muted-foreground">/ {pagination.totalPages}</span>
                  </form>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setPage(p => p + 1); setPageInput((page + 1).toString()); }}
                    disabled={page >= pagination.totalPages}
                    data-testid="button-next-page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setPage(pagination.totalPages); setPageInput(pagination.totalPages.toString()); }}
                    disabled={page >= pagination.totalPages}
                    data-testid="button-last-page"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">{t('transactions.noTransactionsFound')}</h3>
              <p className="text-muted-foreground mt-1">{t('transactions.noTransactionsMatch')}</p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  {t('transactions.clearFilters')}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <ExportDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        transactions={transactions}
        t={t}
      />
    </div>
  );
}
