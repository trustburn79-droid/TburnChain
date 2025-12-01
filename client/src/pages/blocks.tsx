import { useState, useEffect, useCallback, useMemo, useRef, forwardRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useWebSocket } from "@/lib/websocket-context";
import { queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { formatHash, formatSize } from "@/lib/formatters";
import { formatGasEmber, formatNumber, formatAddress } from "@/lib/format";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Box,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Hash,
  User,
  Activity,
  Database,
  Layers,
  Shield,
  AlertCircle,
  Download,
  ExternalLink,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  Zap,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Cpu,
  Gauge,
  Timer,
  FileJson,
  FileSpreadsheet,
  Copy,
  Eye,
  Wifi,
  WifiOff,
  Settings2,
  Calendar,
  ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Block {
  id: string;
  blockNumber: number;
  hash: string;
  parentHash: string;
  timestamp: number;
  transactionCount: number;
  validatorAddress: string;
  validatorName?: string;
  gasUsed: number;
  gasLimit: number;
  size: number;
  shardId: number;
  crossShardRefs?: string[];
  stateRoot: string;
  receiptsRoot: string;
  miner?: string;
  nonce?: string;
  hashAlgorithm: string;
  executionClass?: string;
  latencyNs?: number;
}

interface BlocksResponse {
  blocks: Block[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters?: {
    validator?: string;
    shard?: number;
    hashAlgorithm?: string;
    startTime?: number;
    endTime?: number;
  };
}

interface BlockMetrics {
  avgBlockTime: number;
  avgGasUsed: number;
  avgTxCount: number;
  totalBlocks: number;
  gasEfficiency: number;
  networkTps: number;
  latestHeight: number;
}

interface Validator {
  id: string;
  name: string;
  address: string;
}

const HASH_ALGORITHMS = ["BLAKE3", "SHA3-512", "SHA-256"];
const TIME_RANGE_KEYS = [
  { value: "15m", labelKey: "blocks.timeRange15m" },
  { value: "1h", labelKey: "blocks.timeRange1h" },
  { value: "6h", labelKey: "blocks.timeRange6h" },
  { value: "24h", labelKey: "blocks.timeRange24h" },
  { value: "7d", labelKey: "blocks.timeRange7d" },
  { value: "all", labelKey: "blocks.timeRangeAll" },
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
  value: string | number; 
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
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={`p-2 rounded-lg bg-primary/10 ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {trend && (
          <div className="mt-2 flex items-center gap-1">
            {trendUp !== undefined && (
              trendUp ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )
            )}
            <span className={`text-xs ${trendUp ? 'text-green-500' : trendUp === false ? 'text-red-500' : 'text-muted-foreground'}`}>
              {trend}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LiveIndicator({ isLive, lastUpdate }: { isLive: boolean; lastUpdate: Date }) {
  const { t } = useTranslation();
  
  return (
    <div className="flex items-center gap-2">
      <div className={`relative flex h-2 w-2`}>
        {isLive && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-green-500' : 'bg-gray-400'}`} />
      </div>
      <span className="text-xs text-muted-foreground">
        {isLive ? t('blocks.live') : t('blocks.paused')} • {formatDistanceToNow(lastUpdate, { addSuffix: true })}
      </span>
    </div>
  );
}

const BlockRow = forwardRef<HTMLTableRowElement, { block: Block; onClick: () => void }>(
  ({ block, onClick }, ref) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const gasUsagePercent = block.gasLimit > 0 ? (block.gasUsed / block.gasLimit) * 100 : 0;
  
  const copyHash = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(block.hash);
    toast({
      title: t('common.copiedToClipboard'),
      description: t('blocks.hashCopied'),
    });
  };
  
  return (
    <motion.tr
      ref={ref}
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="cursor-pointer hover:bg-muted/50 border-b"
      onClick={onClick}
      data-testid={`row-block-${block.blockNumber}`}
    >
      <TableCell>
        <Link 
          href={`/blocks/${block.blockNumber}`} 
          className="font-mono text-primary hover:underline font-semibold"
          data-testid={`link-block-${block.blockNumber}`}
        >
          #{formatNumber(block.blockNumber)}
        </Link>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            {formatHash(block.hash)}
          </span>
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
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs">
            {new Date(block.timestamp * 1000).toLocaleString('en-US', {
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
            <div className="flex items-center gap-2">
              <User className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm font-mono">
                {formatAddress(block.validatorAddress, 6, 4)}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-mono text-xs">{block.validatorAddress}</p>
          </TooltipContent>
        </Tooltip>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="gap-1 font-mono">
          <Zap className="h-3 w-3" />
          {block.transactionCount.toLocaleString()}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="font-mono">
          S{block.shardId}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono">{formatGasEmber(block.gasUsed)}</span>
            <span className="text-muted-foreground">{gasUsagePercent.toFixed(1)}%</span>
          </div>
          <Progress value={gasUsagePercent} className="h-1" />
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm font-mono">{formatSize(block.size)}</span>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs">
          {block.hashAlgorithm || 'BLAKE3'}
        </Badge>
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
              {t('blocks.viewDetails')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={copyHash}>
              <Copy className="h-4 w-4 mr-2" />
              {t('blocks.copyHash')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e) => { 
              e.stopPropagation(); 
              window.location.href = `/transactions?block=${block.blockNumber}`;
            }}>
              <Zap className="h-4 w-4 mr-2" />
              {t('blocks.viewTransactions')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </motion.tr>
  );
});

BlockRow.displayName = 'BlockRow';

function ExportDialog({ blocks, isOpen, onClose }: { blocks: Block[]; isOpen: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  
  const handleExport = async () => {
    setIsExporting(true);
    try {
      let content: string;
      let filename: string;
      let mimeType: string;
      
      if (format === 'csv') {
        const headers = ['Block Number', 'Hash', 'Timestamp', 'Validator', 'Tx Count', 'Shard', 'Gas Used', 'Gas Limit', 'Size', 'Hash Algorithm'];
        const rows = blocks.map(b => [
          b.blockNumber,
          b.hash,
          new Date(b.timestamp * 1000).toISOString(),
          b.validatorAddress,
          b.transactionCount,
          b.shardId,
          b.gasUsed,
          b.gasLimit,
          b.size,
          b.hashAlgorithm
        ]);
        content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        filename = `blocks_export_${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      } else {
        content = JSON.stringify(blocks, null, 2);
        filename = `blocks_export_${new Date().toISOString().split('T')[0]}.json`;
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
        title: t('blocks.exportSuccess'),
        description: t('blocks.exportedBlocks', { count: blocks.length }),
      });
      onClose();
    } catch (error) {
      toast({
        title: t('blocks.exportFailed'),
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('blocks.exportBlocks')}</DialogTitle>
          <DialogDescription>
            {t('blocks.exportDescription', { count: blocks.length })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t('blocks.exportFormat')}</Label>
            <div className="flex gap-2">
              <Button
                variant={format === 'csv' ? 'default' : 'outline'}
                onClick={() => setFormat('csv')}
                className="flex-1 gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                CSV
              </Button>
              <Button
                variant={format === 'json' ? 'default' : 'outline'}
                onClick={() => setFormat('json')}
                className="flex-1 gap-2"
              >
                <FileJson className="h-4 w-4" />
                JSON
              </Button>
            </div>
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

export default function Blocks() {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { subscribeToEvent, isConnected } = useWebSocket();
  
  const SHARD_OPTIONS = useMemo(() => [
    { value: "0", label: `${t('blocks.shard')} 0 - Alpha` },
    { value: "1", label: `${t('blocks.shard')} 1 - Beta` },
    { value: "2", label: `${t('blocks.shard')} 2 - Gamma` },
    { value: "3", label: `${t('blocks.shard')} 3 - Delta` },
    { value: "4", label: `${t('blocks.shard')} 4 - Epsilon` },
  ], [t]);
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [pageInput, setPageInput] = useState("1");
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  const [selectedValidator, setSelectedValidator] = useState<string>("all");
  const [selectedShard, setSelectedShard] = useState<string>("all");
  const [selectedHashAlgorithm, setSelectedHashAlgorithm] = useState<string>("all");
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("number");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
  
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", pageSize.toString());
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    
    if (selectedValidator && selectedValidator !== "all") params.set("validator", selectedValidator);
    if (selectedShard && selectedShard !== "all") params.set("shard", selectedShard);
    if (selectedHashAlgorithm && selectedHashAlgorithm !== "all") params.set("hashAlgorithm", selectedHashAlgorithm);
    if (selectedTimeRange && selectedTimeRange !== "all") params.set("timeRange", selectedTimeRange);
    
    return params.toString();
  }, [page, pageSize, sortBy, sortOrder, selectedValidator, selectedShard, selectedHashAlgorithm, selectedTimeRange]);
  
  const { data: blocksData, isLoading, error, refetch, isFetching } = useQuery<BlocksResponse>({
    queryKey: ["/api/blocks", queryParams],
    queryFn: async ({ signal }) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      try {
        const response = await fetch(`/api/blocks?${queryParams}`, {
          credentials: "include",
          signal: signal || controller.signal,
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch blocks: ${response.status} ${errorText}`);
        }
        return response.json();
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
  
  const { data: validators = [] } = useQuery<Validator[]>({
    queryKey: ["/api/validators"],
    queryFn: async ({ signal }) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      try {
        const response = await fetch("/api/validators", {
          credentials: "include",
          signal: signal || controller.signal,
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch validators: ${response.status} ${errorText}`);
        }
        return response.json();
      } catch (err) {
        clearTimeout(timeoutId);
        throw err;
      }
    },
    staleTime: 60000,
    gcTime: 300000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    refetchOnWindowFocus: false,
  });
  
  const metrics: BlockMetrics = useMemo(() => {
    const blocks = blocksData?.blocks || [];
    if (blocks.length === 0) {
      return {
        avgBlockTime: 3,
        avgGasUsed: 0,
        avgTxCount: 0,
        totalBlocks: 0,
        gasEfficiency: 0,
        networkTps: 0,
        latestHeight: 0,
      };
    }
    
    const avgGasUsed = blocks.reduce((acc, b) => acc + (b.gasUsed || 0), 0) / blocks.length;
    const avgTxCount = blocks.reduce((acc, b) => acc + b.transactionCount, 0) / blocks.length;
    const avgGasLimit = blocks.reduce((acc, b) => acc + (b.gasLimit || 10000000), 0) / blocks.length;
    const gasEfficiency = avgGasLimit > 0 ? (avgGasUsed / avgGasLimit) * 100 : 0;
    
    let avgBlockTime = 3;
    if (blocks.length >= 2) {
      const times = blocks.slice(0, 10).map(b => b.timestamp).sort((a, b) => b - a);
      const diffs = times.slice(0, -1).map((t, i) => t - times[i + 1]);
      avgBlockTime = diffs.length > 0 ? diffs.reduce((a, b) => a + b, 0) / diffs.length : 3;
    }
    
    return {
      avgBlockTime: Math.max(0.5, avgBlockTime),
      avgGasUsed,
      avgTxCount,
      totalBlocks: blocksData?.pagination.totalItems || 0,
      gasEfficiency,
      networkTps: Math.round(avgTxCount / Math.max(1, avgBlockTime)),
      latestHeight: blocks[0]?.blockNumber || 0,
    };
  }, [blocksData]);
  
  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      setIsSearching(true);
      const response = await fetch(`/api/blocks/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Failed to search blocks");
      return response.json();
    },
    onSuccess: (data) => {
      setIsSearching(false);
      if (data.length === 0) {
        toast({
          title: t('blocks.noResultsFound'),
          description: t('blocks.tryDifferentSearchTerm'),
        });
      } else if (data.length === 1) {
        setLocation(`/blocks/${data[0].blockNumber}`);
      } else {
        toast({
          title: t('blocks.foundBlocks', { count: data.length }),
          description: t('blocks.resultsFiltered'),
        });
      }
    },
    onError: () => {
      setIsSearching(false);
      toast({
        title: t('blocks.searchFailed'),
        variant: "destructive",
      });
    },
  });
  
  const handleSearch = useCallback(() => {
    if (searchInput.trim()) {
      searchMutation.mutate(searchInput.trim());
    }
  }, [searchInput, searchMutation]);
  
  useEffect(() => {
    if (!isConnected) return;
    
    const unsubscribe = subscribeToEvent("block_created", () => {
      setLastUpdate(new Date());
      if (isAutoRefresh) {
        queryClient.invalidateQueries({ 
          predicate: (query) => {
            const key = query.queryKey;
            return Array.isArray(key) && key[0] === "/api/blocks";
          }
        });
      }
    });
    
    return unsubscribe;
  }, [isConnected, subscribeToEvent, isAutoRefresh]);
  
  const clearFilters = () => {
    setSelectedValidator("all");
    setSelectedShard("all");
    setSelectedHashAlgorithm("all");
    setSelectedTimeRange("all");
    setSortBy("number");
    setSortOrder("desc");
    setPage(1);
    setPageInput("1");
  };
  
  const hasActiveFilters = (selectedValidator && selectedValidator !== "all") || 
                          (selectedShard && selectedShard !== "all") || 
                          (selectedHashAlgorithm && selectedHashAlgorithm !== "all") ||
                          (selectedTimeRange && selectedTimeRange !== "all");
  
  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1);
    setPageInput("1");
  };
  
  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    return sortOrder === "asc" 
      ? <ArrowUp className="h-3 w-3 ml-1 text-primary" />
      : <ArrowDown className="h-3 w-3 ml-1 text-primary" />;
  };
  
  const handlePageJump = () => {
    const targetPage = parseInt(pageInput);
    if (!isNaN(targetPage) && targetPage >= 1 && targetPage <= (blocksData?.pagination.totalPages || 1)) {
      setPage(targetPage);
    } else {
      setPageInput(page.toString());
    }
  };
  
  const renderSkeleton = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
  
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Box className="h-16 w-16 text-muted-foreground/50 mb-4" />
      <h3 className="text-lg font-semibold mb-2">{t('blocks.noBlocksFound')}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        {hasActiveFilters 
          ? t('blocks.noBlocksMatchFilters')
          : t('blocks.waitingForBlockProduction')}
      </p>
      {hasActiveFilters && (
        <Button onClick={clearFilters} variant="outline" className="gap-2">
          <XCircle className="h-4 w-4" />
          {t('blocks.clearFilters')}
        </Button>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-[1600px]">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Box className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-blocks-title">
              {t('blocks.title', 'Block Explorer')}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <LiveIndicator isLive={isAutoRefresh && isConnected} lastUpdate={lastUpdate} />
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={isAutoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            className="gap-2"
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
            <span className="hidden sm:inline">{t('blocks.export')}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <MetricCard
          icon={Database}
          title={t('blocks.latestBlock')}
          value={`#${formatNumber(metrics.latestHeight)}`}
          subtitle={t('blocks.totalBlocks', { count: metrics.totalBlocks })}
          color="text-blue-500"
        />
        <MetricCard
          icon={Timer}
          title={t('blocks.avgBlockTime')}
          value={`${metrics.avgBlockTime.toFixed(1)}s`}
          trend={metrics.avgBlockTime < 3 ? t('blocks.faster') : t('blocks.normal')}
          trendUp={metrics.avgBlockTime < 3}
          color="text-green-500"
        />
        <MetricCard
          icon={Zap}
          title={t('blocks.networkTps')}
          value={formatNumber(metrics.networkTps)}
          subtitle={t('blocks.txPerSecond')}
          color="text-yellow-500"
        />
        <MetricCard
          icon={Gauge}
          title={t('blocks.gasEfficiency')}
          value={`${metrics.gasEfficiency.toFixed(1)}%`}
          trend={t('blocks.avgGasUsed')}
          color="text-purple-500"
        />
        <MetricCard
          icon={Activity}
          title={t('blocks.avgTxPerBlock')}
          value={Math.round(metrics.avgTxCount).toLocaleString()}
          color="text-orange-500"
        />
        <MetricCard
          icon={isConnected ? CheckCircle : XCircle}
          title={t('blocks.networkStatus')}
          value={isConnected ? t('common.connected') : t('common.disconnected')}
          subtitle={isConnected ? t('blocks.realTimeSync') : t('blocks.reconnecting')}
          color={isConnected ? "text-green-500" : "text-red-500"}
        />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('blocks.searchPlaceholder')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
                data-testid="input-block-search"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
              )}
            </div>
            
            <div className="flex gap-2">
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2" data-testid="button-filter">
                    <Filter className="h-4 w-4" />
                    {t('common.filter')}
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center">
                        {[selectedValidator, selectedShard, selectedHashAlgorithm, selectedTimeRange]
                          .filter(v => v && v !== "all").length}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>{t('blocks.filterBlocks')}</SheetTitle>
                    <SheetDescription>{t('blocks.filterDescription')}</SheetDescription>
                  </SheetHeader>
                  
                  <div className="space-y-6 mt-6">
                    <div className="space-y-2">
                      <Label>{t('blocks.timeRange')}</Label>
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
                      <Label>{t('blocks.validatorLabel')}</Label>
                      <Select value={selectedValidator} onValueChange={setSelectedValidator}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('blocks.allValidators')}</SelectItem>
                          {validators.slice(0, 20).map(v => (
                            <SelectItem key={v.id} value={v.address}>{v.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{t('blocks.shardLabel')}</Label>
                      <Select value={selectedShard} onValueChange={setSelectedShard}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('blocks.allShards')}</SelectItem>
                          {SHARD_OPTIONS.map(s => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{t('blocks.hashAlgorithmLabel')}</Label>
                      <Select value={selectedHashAlgorithm} onValueChange={setSelectedHashAlgorithm}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('blocks.allAlgorithms')}</SelectItem>
                          {HASH_ALGORITHMS.map(algo => (
                            <SelectItem key={algo} value={algo}>{algo}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex gap-2">
                      <Button onClick={clearFilters} variant="outline" className="flex-1">
                        {t('blocks.clearAll')}
                      </Button>
                      <Button onClick={() => setIsFilterOpen(false)} className="flex-1">
                        {t('blocks.applyFilters')}
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
              <span className="text-xs text-muted-foreground">{t('blocks.activeFilters')}:</span>
              {selectedTimeRange && selectedTimeRange !== "all" && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Calendar className="h-3 w-3" />
                  {t(TIME_RANGE_KEYS.find(r => r.value === selectedTimeRange)?.labelKey || 'blocks.timeRangeAll')}
                  <button onClick={() => setSelectedTimeRange("all")}><XCircle className="h-3 w-3" /></button>
                </Badge>
              )}
              {selectedValidator && selectedValidator !== "all" && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <User className="h-3 w-3" />
                  {validators.find(v => v.address === selectedValidator)?.name || formatAddress(selectedValidator)}
                  <button onClick={() => setSelectedValidator("all")}><XCircle className="h-3 w-3" /></button>
                </Badge>
              )}
              {selectedShard && selectedShard !== "all" && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Layers className="h-3 w-3" />
                  Shard {selectedShard}
                  <button onClick={() => setSelectedShard("all")}><XCircle className="h-3 w-3" /></button>
                </Badge>
              )}
              {selectedHashAlgorithm && selectedHashAlgorithm !== "all" && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Shield className="h-3 w-3" />
                  {selectedHashAlgorithm}
                  <button onClick={() => setSelectedHashAlgorithm("all")}><XCircle className="h-3 w-3" /></button>
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-xs">
                {t('blocks.clearAll')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t('blocks.recentBlocks')}
              </CardTitle>
              <CardDescription>
                {blocksData?.pagination.totalItems?.toLocaleString() || 0} {t('blocks.totalBlocks')} • 
                {t('common.page')} {page} / {blocksData?.pagination.totalPages || 1}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t('blocks.failedToLoadBlocks')}: {error.message}
              </AlertDescription>
            </Alert>
          )}
          
          {isLoading ? (
            renderSkeleton()
          ) : !blocksData?.blocks.length ? (
            renderEmptyState()
          ) : (
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => toggleSort("number")}>
                      <div className="flex items-center">{t('common.block')}{renderSortIcon("number")}</div>
                    </TableHead>
                    <TableHead>{t('common.hash')}</TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => toggleSort("timestamp")}>
                      <div className="flex items-center">{t('common.time')}{renderSortIcon("timestamp")}</div>
                    </TableHead>
                    <TableHead>{t('blocks.validator')}</TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => toggleSort("transactionCount")}>
                      <div className="flex items-center">{t('blocks.txns')}{renderSortIcon("transactionCount")}</div>
                    </TableHead>
                    <TableHead>{t('blocks.shard')}</TableHead>
                    <TableHead>{t('blocks.gasUsed')}</TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => toggleSort("size")}>
                      <div className="flex items-center">{t('blocks.size')}{renderSortIcon("size")}</div>
                    </TableHead>
                    <TableHead>{t('blocks.hashAlgo')}</TableHead>
                    <TableHead className="text-right">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {blocksData.blocks.map((block) => (
                      <BlockRow
                        key={block.id}
                        block={block}
                        onClick={() => setLocation(`/blocks/${block.blockNumber}`)}
                      />
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}
          
          {blocksData && blocksData.pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {t('common.showing')} {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, blocksData.pagination.totalItems)} / {blocksData.pagination.totalItems.toLocaleString()}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setPage(1); setPageInput("1"); }}
                  disabled={!blocksData.pagination.hasPrev}
                  data-testid="button-first-page"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setPage(p => p - 1); setPageInput((page - 1).toString()); }}
                  disabled={!blocksData.pagination.hasPrev}
                  data-testid="button-prev-page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  <Input
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    onBlur={handlePageJump}
                    onKeyDown={(e) => e.key === "Enter" && handlePageJump()}
                    className="w-16 h-8 text-center text-sm"
                    data-testid="input-page-jump"
                  />
                  <span className="text-sm text-muted-foreground">/ {blocksData.pagination.totalPages}</span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setPage(p => p + 1); setPageInput((page + 1).toString()); }}
                  disabled={!blocksData.pagination.hasNext}
                  data-testid="button-next-page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setPage(blocksData.pagination.totalPages); setPageInput(blocksData.pagination.totalPages.toString()); }}
                  disabled={!blocksData.pagination.hasNext}
                  data-testid="button-last-page"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <ExportDialog
        blocks={blocksData?.blocks || []}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
}
