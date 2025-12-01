import { useState, useEffect, useCallback, useMemo, forwardRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useWebSocket } from "@/lib/websocket-context";
import { queryClient } from "@/lib/queryClient";
import { formatNumber, formatAddress, formatTokenAmount } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Wallet,
  Users,
  DollarSign,
  Award,
  AlertCircle,
  Download,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  TrendingUp,
  TrendingDown,
  FileJson,
  FileSpreadsheet,
  Copy,
  Eye,
  Wifi,
  WifiOff,
  Activity,
  Coins,
  PiggyBank,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { WalletBalance } from "@shared/schema";

interface WalletsResponse {
  wallets: WalletBalance[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface WalletMetrics {
  totalWallets: number;
  totalBalance: number;
  totalStaked: number;
  totalRewards: number;
  activeWallets: number;
  avgBalance: number;
  topHolder: string;
  stakingRate: number;
}

const BALANCE_FILTER_OPTIONS = [
  { value: "all", labelKey: "wallets.allBalances" },
  { value: "whale", labelKey: "wallets.whales" },
  { value: "large", labelKey: "wallets.largeHolders" },
  { value: "medium", labelKey: "wallets.mediumHolders" },
  { value: "small", labelKey: "wallets.smallHolders" },
];

const ACTIVITY_FILTER_OPTIONS = [
  { value: "all", labelKey: "wallets.allActivity" },
  { value: "active", labelKey: "wallets.active" },
  { value: "inactive", labelKey: "wallets.inactive" },
];

const STAKING_FILTER_OPTIONS = [
  { value: "all", labelKey: "wallets.allStaking" },
  { value: "staking", labelKey: "wallets.stakingActive" },
  { value: "notStaking", labelKey: "wallets.notStaking" },
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

const WalletRow = forwardRef<HTMLTableRowElement, { 
  wallet: WalletBalance;
  onViewDetails: (wallet: WalletBalance) => void;
  onCopyAddress: (address: string) => void;
  t: any;
}>(({ wallet, onViewDetails, onCopyAddress, t }, ref) => {
  const [, setLocation] = useLocation();
  
  const formatBalance = (wei: string) => {
    const tburn = parseFloat(wei) / 1e18;
    if (tburn >= 1000000) return `${(tburn / 1000000).toFixed(2)}M`;
    if (tburn >= 1000) return `${(tburn / 1000).toFixed(2)}K`;
    return tburn.toFixed(4);
  };

  const getWalletTier = (balance: string) => {
    const tburn = parseFloat(balance) / 1e18;
    if (tburn >= 1000000) return { label: t('wallets.whale'), color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' };
    if (tburn >= 100000) return { label: t('wallets.large'), color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' };
    if (tburn >= 10000) return { label: t('wallets.medium'), color: 'bg-green-500/10 text-green-500 border-green-500/20' };
    return { label: t('wallets.small'), color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' };
  };

  const tier = getWalletTier(wallet.balance);
  const stakingPercentage = parseFloat(wallet.balance) > 0 
    ? (parseFloat(wallet.stakedBalance) / parseFloat(wallet.balance) * 100).toFixed(1)
    : '0';

  return (
    <TableRow
      ref={ref}
      className="group hover:bg-muted/50 cursor-pointer"
      onClick={() => setLocation(`/wallets/${wallet.address}`)}
      data-testid={`row-wallet-${wallet.address}`}
    >
      <TableCell className="font-mono text-sm">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="hover:text-primary transition-colors">
                {formatAddress(wallet.address, 8, 6)}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-mono text-xs">{wallet.address}</p>
            </TooltipContent>
          </Tooltip>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => { e.stopPropagation(); onCopyAddress(wallet.address); }}
            data-testid={`button-copy-${wallet.address}`}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={tier.color}>
          {tier.label}
        </Badge>
      </TableCell>
      <TableCell className="font-semibold tabular-nums text-right">
        {formatBalance(wallet.balance)} TBURN
      </TableCell>
      <TableCell className="tabular-nums text-right">
        <div className="flex flex-col items-end">
          <span className="text-green-600 dark:text-green-400">
            {formatBalance(wallet.stakedBalance)} TBURN
          </span>
          <span className="text-xs text-muted-foreground">
            {stakingPercentage}%
          </span>
        </div>
      </TableCell>
      <TableCell className="tabular-nums text-right text-blue-600 dark:text-blue-400">
        {formatBalance(wallet.rewardsEarned)} TBURN
      </TableCell>
      <TableCell className="tabular-nums text-center">
        <Badge variant="secondary">
          {formatNumber(wallet.transactionCount)}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm tabular-nums">
        {wallet.lastTransactionAt 
          ? new Date(wallet.lastTransactionAt).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })
          : t('wallets.never')}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewDetails(wallet); }}>
              <Eye className="h-4 w-4 mr-2" />
              {t('wallets.viewDetails')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onCopyAddress(wallet.address); }}>
              <Copy className="h-4 w-4 mr-2" />
              {t('common.copyAddress')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setLocation(`/transactions?address=${wallet.address}`); }}>
              <Activity className="h-4 w-4 mr-2" />
              {t('wallets.viewTransactions')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});

WalletRow.displayName = 'WalletRow';

function WalletDetailDialog({
  wallet,
  open,
  onClose,
  t
}: {
  wallet: WalletBalance | null;
  open: boolean;
  onClose: () => void;
  t: any;
}) {
  if (!wallet) return null;

  const formatBalance = (wei: string) => {
    const tburn = parseFloat(wei) / 1e18;
    return tburn.toLocaleString('en-US', { maximumFractionDigits: 6 });
  };

  const stakingPercentage = parseFloat(wallet.balance) > 0 
    ? (parseFloat(wallet.stakedBalance) / parseFloat(wallet.balance) * 100)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            {t('wallets.walletDetails')}
          </DialogTitle>
          <DialogDescription className="font-mono text-xs break-all">
            {wallet.address}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">{t('wallets.totalBalance')}</span>
              </div>
              <p className="text-2xl font-bold">{formatBalance(wallet.balance)} TBURN</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <PiggyBank className="h-4 w-4" />
                <span className="text-sm">{t('wallets.stakedAmount')}</span>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatBalance(wallet.stakedBalance)} TBURN
              </p>
              <Progress value={stakingPercentage} className="h-2 mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {stakingPercentage.toFixed(1)}% {t('wallets.ofTotalBalance')}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Coins className="h-4 w-4" />
                <span className="text-sm">{t('wallets.unstakedAmount')}</span>
              </div>
              <p className="text-2xl font-bold">{formatBalance(wallet.unstakedBalance)} TBURN</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Award className="h-4 w-4" />
                <span className="text-sm">{t('wallets.rewardsEarned')}</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatBalance(wallet.rewardsEarned)} TBURN
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="border rounded-lg p-4 space-y-3">
          <h4 className="font-semibold">{t('wallets.activityStats')}</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('wallets.transactionCount')}</span>
              <span className="font-medium">{formatNumber(wallet.transactionCount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('wallets.lastActivity')}</span>
              <span className="font-medium">
                {wallet.lastTransactionAt 
                  ? new Date(wallet.lastTransactionAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })
                  : t('wallets.never')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('wallets.firstSeen')}</span>
              <span className="font-medium">
                {wallet.firstSeenAt 
                  ? new Date(wallet.firstSeenAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })
                  : t('common.unknown')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('wallets.stakingStatus')}</span>
              <Badge variant={parseFloat(wallet.stakedBalance) > 0 ? "default" : "secondary"}>
                {parseFloat(wallet.stakedBalance) > 0 ? t('wallets.staking') : t('wallets.notStaking')}
              </Badge>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.close')}
          </Button>
          <Link href={`/wallets/${wallet.address}`}>
            <Button>
              <ExternalLink className="h-4 w-4 mr-2" />
              {t('wallets.viewFullProfile')}
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ExportDialog({
  open,
  onClose,
  wallets,
  t
}: {
  open: boolean;
  onClose: () => void;
  wallets: WalletBalance[];
  t: any;
}) {
  const { toast } = useToast();

  const exportCSV = () => {
    const formatBalance = (wei: string) => (parseFloat(wei) / 1e18).toFixed(6);
    
    const headers = ['Address', 'Balance (TBURN)', 'Staked (TBURN)', 'Unstaked (TBURN)', 'Rewards (TBURN)', 'Transactions', 'Last Activity'];
    const rows = wallets.map(wallet => [
      wallet.address,
      formatBalance(wallet.balance),
      formatBalance(wallet.stakedBalance),
      formatBalance(wallet.unstakedBalance),
      formatBalance(wallet.rewardsEarned),
      wallet.transactionCount.toString(),
      wallet.lastTransactionAt ? new Date(wallet.lastTransactionAt).toISOString() : 'Never'
    ]);
    
    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tburn_wallets_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: t('wallets.exportSuccess'),
      description: t('wallets.csvExported', { count: wallets.length }),
    });
    onClose();
  };

  const exportJSON = () => {
    const data = wallets.map(wallet => ({
      address: wallet.address,
      balance: wallet.balance,
      stakedBalance: wallet.stakedBalance,
      unstakedBalance: wallet.unstakedBalance,
      rewardsEarned: wallet.rewardsEarned,
      transactionCount: wallet.transactionCount,
      lastTransactionAt: wallet.lastTransactionAt,
      firstSeenAt: wallet.firstSeenAt
    }));
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tburn_wallets_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: t('wallets.exportSuccess'),
      description: t('wallets.jsonExported', { count: wallets.length }),
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            {t('wallets.exportWallets')}
          </DialogTitle>
          <DialogDescription>
            {t('wallets.exportDescription', { count: wallets.length })}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-24 flex-col gap-2" onClick={exportCSV}>
            <FileSpreadsheet className="h-8 w-8 text-green-500" />
            <span>{t('wallets.exportCSV')}</span>
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2" onClick={exportJSON}>
            <FileJson className="h-8 w-8 text-blue-500" />
            <span>{t('wallets.exportJSON')}</span>
          </Button>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Wallets() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { subscribeToEvent, isConnected } = useWebSocket();
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [pageInput, setPageInput] = useState("1");
  const [searchInput, setSearchInput] = useState("");
  
  const [selectedBalanceFilter, setSelectedBalanceFilter] = useState<string>("all");
  const [selectedActivityFilter, setSelectedActivityFilter] = useState<string>("all");
  const [selectedStakingFilter, setSelectedStakingFilter] = useState<string>("all");
  const [minBalance, setMinBalance] = useState<string>("");
  const [maxBalance, setMaxBalance] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("balance");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletBalance | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", pageSize.toString());
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    
    if (selectedBalanceFilter && selectedBalanceFilter !== "all") params.set("balanceFilter", selectedBalanceFilter);
    if (selectedActivityFilter && selectedActivityFilter !== "all") params.set("activityFilter", selectedActivityFilter);
    if (selectedStakingFilter && selectedStakingFilter !== "all") params.set("stakingFilter", selectedStakingFilter);
    if (minBalance) params.set("minBalance", minBalance);
    if (maxBalance) params.set("maxBalance", maxBalance);
    if (searchInput) params.set("search", searchInput);
    
    return params.toString();
  }, [page, pageSize, sortBy, sortOrder, selectedBalanceFilter, selectedActivityFilter, selectedStakingFilter, minBalance, maxBalance, searchInput]);

  const { data: walletData, isLoading, error, refetch, isFetching } = useQuery<WalletsResponse>({
    queryKey: ["/api/wallets", queryParams],
    queryFn: async ({ signal }) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      try {
        const response = await fetch(`/api/wallets?${queryParams}`, {
          credentials: "include",
          signal: signal || controller.signal,
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch wallets: ${response.status} ${errorText}`);
        }
        return response.json();
      } catch (err) {
        clearTimeout(timeoutId);
        throw err;
      }
    },
    refetchInterval: isAutoRefresh ? 10000 : false,
    staleTime: 5000,
    gcTime: 300000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData,
  });

  const wallets = walletData?.wallets || [];
  const pagination = walletData?.pagination || { page: 1, limit: 20, totalPages: 1, totalItems: 0, hasNext: false, hasPrev: false };

  const metrics = useMemo<WalletMetrics>(() => {
    if (!wallets.length) {
      return {
        totalWallets: pagination.totalItems || 0,
        totalBalance: 0,
        totalStaked: 0,
        totalRewards: 0,
        activeWallets: 0,
        avgBalance: 0,
        topHolder: '-',
        stakingRate: 0
      };
    }

    const totalBalance = wallets.reduce((sum, w) => sum + parseFloat(w.balance), 0);
    const totalStaked = wallets.reduce((sum, w) => sum + parseFloat(w.stakedBalance), 0);
    const totalRewards = wallets.reduce((sum, w) => sum + parseFloat(w.rewardsEarned), 0);
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const activeWallets = wallets.filter(w => {
      const lastTx = w.lastTransactionAt ? new Date(w.lastTransactionAt).getTime() : 0;
      return lastTx > thirtyDaysAgo;
    }).length;
    const stakingWallets = wallets.filter(w => parseFloat(w.stakedBalance) > 0).length;
    
    const sortedByBalance = [...wallets].sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance));
    const topHolder = sortedByBalance[0]?.address || '-';
    
    return {
      totalWallets: pagination.totalItems || wallets.length,
      totalBalance: totalBalance / 1e18,
      totalStaked: totalStaked / 1e18,
      totalRewards: totalRewards / 1e18,
      activeWallets,
      avgBalance: wallets.length > 0 ? (totalBalance / 1e18) / wallets.length : 0,
      topHolder,
      stakingRate: wallets.length > 0 ? (stakingWallets / wallets.length) * 100 : 0
    };
  }, [wallets, pagination.totalItems]);

  useEffect(() => {
    if (!isAutoRefresh) return;

    const unsubscribe = subscribeToEvent('wallet_balances_snapshot', () => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key[0] === "/api/wallets";
        }
      });
      setLastUpdate(new Date());
    });

    return () => unsubscribe?.();
  }, [subscribeToEvent, isAutoRefresh]);

  const hasActiveFilters = useMemo(() => {
    return (selectedBalanceFilter && selectedBalanceFilter !== "all") ||
           (selectedActivityFilter && selectedActivityFilter !== "all") ||
           (selectedStakingFilter && selectedStakingFilter !== "all") ||
           minBalance || maxBalance || searchInput;
  }, [selectedBalanceFilter, selectedActivityFilter, selectedStakingFilter, minBalance, maxBalance, searchInput]);

  const clearFilters = useCallback(() => {
    setSelectedBalanceFilter("all");
    setSelectedActivityFilter("all");
    setSelectedStakingFilter("all");
    setMinBalance("");
    setMaxBalance("");
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
    setPage(1);
    setPageInput("1");
  }, [sortBy, sortOrder]);

  const handlePageInputSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const newPage = parseInt(pageInput);
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
    } else {
      setPageInput(page.toString());
    }
  }, [pageInput, pagination.totalPages, page]);

  const copyAddress = useCallback((address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: t('common.copied'),
      description: t('wallets.addressCopied'),
    });
  }, [toast, t]);

  const formatBalanceDisplay = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(2)}K`;
    return value.toFixed(2);
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    return sortOrder === "desc" 
      ? <ArrowDown className="h-4 w-4 ml-1" />
      : <ArrowUp className="h-4 w-4 ml-1" />;
  };

  if (error) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('wallets.failedToLoadWallets')}: {error.message}
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
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2" data-testid="text-wallets-title">
            <Wallet className="h-7 w-7 text-primary" />
            {t('wallets.title')}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={isConnected ? "default" : "secondary"} className={`gap-1 ${isConnected && isAutoRefresh ? "bg-green-600 hover:bg-green-700 border-0" : ""}`}>
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
            className={`gap-2 ${isAutoRefresh ? "bg-green-600 hover:bg-green-700 border-0" : ""}`}
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
            <span className="hidden sm:inline">{t('common.export')}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
        <MetricCard
          icon={Users}
          title={t('wallets.totalWallets')}
          value={formatNumber(metrics.totalWallets)}
          subtitle={t('wallets.registeredAddresses')}
          color="text-blue-500"
        />
        <MetricCard
          icon={DollarSign}
          title={t('wallets.totalBalance')}
          value={`${formatBalanceDisplay(metrics.totalBalance)} TBURN`}
          color="text-green-500"
        />
        <MetricCard
          icon={PiggyBank}
          title={t('wallets.totalStaked')}
          value={`${formatBalanceDisplay(metrics.totalStaked)} TBURN`}
          trend={`${metrics.stakingRate.toFixed(1)}% ${t('wallets.stakingRate')}`}
          trendUp={metrics.stakingRate > 50}
          color="text-purple-500"
        />
        <MetricCard
          icon={Award}
          title={t('wallets.totalRewards')}
          value={`${formatBalanceDisplay(metrics.totalRewards)} TBURN`}
          color="text-yellow-500"
        />
        <MetricCard
          icon={Activity}
          title={t('wallets.activeWallets')}
          value={formatNumber(metrics.activeWallets)}
          subtitle={t('wallets.last30Days')}
          color="text-orange-500"
        />
        <MetricCard
          icon={BarChart3}
          title={t('wallets.avgBalance')}
          value={`${formatBalanceDisplay(metrics.avgBalance)} TBURN`}
          color="text-cyan-500"
        />
        <MetricCard
          icon={TrendingUp}
          title={t('wallets.stakingRate')}
          value={`${metrics.stakingRate.toFixed(1)}%`}
          trend={metrics.stakingRate > 50 ? t('wallets.healthy') : t('wallets.low')}
          trendUp={metrics.stakingRate > 50}
          color="text-emerald-500"
        />
        <MetricCard
          icon={isConnected ? CheckCircle : XCircle}
          title={t('wallets.networkStatus')}
          value={isConnected ? t('common.connected') : t('common.disconnected')}
          subtitle={isConnected ? t('wallets.realTimeSync') : t('wallets.reconnecting')}
          color={isConnected ? "text-green-500" : "text-red-500"}
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                {t('wallets.walletAddresses')}
              </CardTitle>
              <CardDescription>
                {formatNumber(pagination.totalItems)} {t('wallets.totalWallets').toLowerCase()} • {t('common.page')} {page} / {pagination.totalPages}
              </CardDescription>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <form onSubmit={handleSearch} className="flex-1 sm:flex-none">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('wallets.searchByAddress')}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-10 w-full sm:w-[300px]"
                    data-testid="input-wallet-search"
                  />
                  {isFetching && (
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
                        {[selectedBalanceFilter, selectedActivityFilter, selectedStakingFilter, minBalance, maxBalance]
                          .filter(v => v && v !== "all").length}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>{t('wallets.filterWallets')}</SheetTitle>
                    <SheetDescription>{t('wallets.filterDescription')}</SheetDescription>
                  </SheetHeader>
                  
                  <div className="space-y-6 mt-6">
                    <div className="space-y-2">
                      <Label>{t('wallets.balanceTier')}</Label>
                      <Select value={selectedBalanceFilter} onValueChange={setSelectedBalanceFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BALANCE_FILTER_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {t(option.labelKey)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{t('wallets.activityStatus')}</Label>
                      <Select value={selectedActivityFilter} onValueChange={setSelectedActivityFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ACTIVITY_FILTER_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {t(option.labelKey)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{t('wallets.stakingStatus')}</Label>
                      <Select value={selectedStakingFilter} onValueChange={setSelectedStakingFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STAKING_FILTER_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {t(option.labelKey)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{t('wallets.balanceRange')} (TBURN)</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder={t('common.min')}
                          value={minBalance}
                          onChange={(e) => setMinBalance(e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder={t('common.max')}
                          value={maxBalance}
                          onChange={(e) => setMaxBalance(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={clearFilters}
                        disabled={!hasActiveFilters}
                      >
                        {t('common.clearFilters')}
                      </Button>
                      <Button 
                        className="flex-1"
                        onClick={() => { setIsFilterOpen(false); setPage(1); setPageInput("1"); }}
                      >
                        {t('common.applyFilters')}
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(parseInt(v)); setPage(1); setPageInput("1"); }}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">{t('common.perPage')}</span>
            </div>
            
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                <XCircle className="h-4 w-4" />
                {t('common.clearFilters')}
              </Button>
            )}
          </div>
          
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : wallets.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">{t('common.address')}</TableHead>
                    <TableHead>{t('wallets.tier')}</TableHead>
                    <TableHead className="text-right cursor-pointer hover:bg-muted/50" onClick={() => toggleSort('balance')}>
                      <div className="flex items-center justify-end">
                        {t('common.balance')}
                        <SortIcon column="balance" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right cursor-pointer hover:bg-muted/50" onClick={() => toggleSort('staked')}>
                      <div className="flex items-center justify-end">
                        {t('wallets.staked')}
                        <SortIcon column="staked" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right cursor-pointer hover:bg-muted/50" onClick={() => toggleSort('rewards')}>
                      <div className="flex items-center justify-end">
                        {t('wallets.rewards')}
                        <SortIcon column="rewards" />
                      </div>
                    </TableHead>
                    <TableHead className="text-center cursor-pointer hover:bg-muted/50" onClick={() => toggleSort('transactions')}>
                      <div className="flex items-center justify-center">
                        {t('common.transactions')}
                        <SortIcon column="transactions" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => toggleSort('lastActivity')}>
                      <div className="flex items-center">
                        {t('wallets.lastActivity')}
                        <SortIcon column="lastActivity" />
                      </div>
                    </TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wallets.map((wallet) => (
                    <WalletRow
                      key={wallet.id || wallet.address}
                      wallet={wallet}
                      onViewDetails={(w) => { setSelectedWallet(w); setIsDetailOpen(true); }}
                      onCopyAddress={copyAddress}
                      t={t}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchInput || hasActiveFilters 
                  ? t('wallets.noWalletsMatching')
                  : t('wallets.noWalletsFound')}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  {t('common.clearFilters')}
                </Button>
              )}
            </div>
          )}
          
          {wallets.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
              <p className="text-sm text-muted-foreground">
                {t('common.showing')} {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, pagination.totalItems)} {t('common.of')} {formatNumber(pagination.totalItems)} {t('wallets.wallets')}
              </p>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => { setPage(1); setPageInput("1"); }}
                  disabled={page <= 1}
                  data-testid="button-first-page"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => { setPage(p => p - 1); setPageInput((page - 1).toString()); }}
                  disabled={page <= 1}
                  data-testid="button-prev-page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <form onSubmit={handlePageInputSubmit} className="flex items-center gap-2">
                  <Input
                    type="number"
                    className="w-16 text-center"
                    min={1}
                    max={pagination.totalPages}
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    onBlur={handlePageInputSubmit}
                    data-testid="input-page-number"
                  />
                  <span className="text-sm text-muted-foreground">/ {pagination.totalPages}</span>
                </form>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => { setPage(p => p + 1); setPageInput((page + 1).toString()); }}
                  disabled={page >= pagination.totalPages}
                  data-testid="button-next-page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => { setPage(pagination.totalPages); setPageInput(pagination.totalPages.toString()); }}
                  disabled={page >= pagination.totalPages}
                  data-testid="button-last-page"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <WalletDetailDialog
        wallet={selectedWallet}
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        t={t}
      />

      <ExportDialog
        open={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        wallets={wallets}
        t={t}
      />
    </div>
  );
}
