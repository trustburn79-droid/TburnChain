import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, keepPreviousData } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ArrowDownUp,
  TrendingUp,
  Activity,
  Droplets,
  BarChart3,
  RefreshCw,
  ArrowUpRight,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  Coins,
  Layers,
  DollarSign,
  Plus,
  Minus,
  Settings,
  Loader2
} from "lucide-react";
import { formatNumber } from "@/lib/formatters";
import { useToast } from "@/hooks/use-toast";
import { WalletRequiredBanner } from "@/components/require-wallet";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useWeb3 } from "@/lib/web3-context";
import { WalletConnectModal } from "@/components/wallet-connect-modal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ENTERPRISE_WALLET_ADDRESS = "tb11234567890abcdef1234567890abcdef12";

// Default tokens available for swapping
const DEFAULT_TOKENS = [
  { address: "tb1tburn0000000000000000000000000000001", symbol: "TBURN", name: "TBURN Native Token" },
  { address: "tb1usdt000000000000000000000000000000001", symbol: "USDT", name: "Tether USD" },
  { address: "tb1usdc000000000000000000000000000000001", symbol: "USDC", name: "USD Coin" },
  { address: "tb1weth000000000000000000000000000000001", symbol: "WETH", name: "Wrapped Ether" },
  { address: "tb1wbtc000000000000000000000000000000001", symbol: "WBTC", name: "Wrapped Bitcoin" },
  { address: "tb1dai0000000000000000000000000000000001", symbol: "DAI", name: "Dai Stablecoin" },
];

interface DexPool {
  id: string;
  name: string;
  symbol: string;
  poolType: string;
  token0Address: string;
  token1Address: string;
  token0Symbol: string;
  token1Symbol: string;
  reserve0: string;
  reserve1: string;
  tvlUsd: string;
  volume24h: string;
  fees24h: string;
  totalApy: number;
  price0: string;
  price1: string;
  status: string;
  lastSwapAt: string | null;
  feeTier: number;
  lpTokenSupply: string;
  lpCount: number;
  swapCount24h: number;
  aiPriceOracle: boolean;
  aiRouteOptimization: boolean;
  aiMevProtection: boolean;
  mevProtectionEnabled: boolean;
  circuitBreakerEnabled: boolean;
}

interface DexSwap {
  id: string;
  poolId: string;
  traderAddress: string;
  tokenInAddress: string;
  tokenOutAddress: string;
  amountIn: string;
  amountOut: string;
  effectivePrice: string | null;
  swapType: string;
  status: string;
  executedAt: string | null;
}

interface DexPosition {
  id: string;
  poolId: string;
  ownerAddress: string;
  lpTokenBalance: string;
  token0Deposited: string;
  token1Deposited: string;
  unclaimedFees0: string | null;
  unclaimedFees1: string | null;
  isActive: boolean;
}

interface DexStatsResponse {
  totalPools: number;
  totalTvlUsd: string;
  totalVolume24h: string;
  totalFees24h: string;
  totalSwaps24h: number;
  totalLiquidityProviders: number;
}

interface SwapQuote {
  amountOut: string;
  priceImpact: string;
  fee: string;
  route: { poolId: string; name: string }[];
  estimatedGas: string;
}

const poolTypeColors: Record<string, string> = {
  "constant-product": "bg-blue-500 text-white",
  "stable": "bg-green-500 text-white",
  "concentrated": "bg-purple-500 text-white",
  "multi-asset": "bg-orange-500 text-white",
  "standard": "bg-blue-500 text-white",
  "weighted": "bg-indigo-500 text-white"
};

const poolTypeLabels: Record<string, string> = {
  "constant-product": "AMM",
  "stable": "Stable",
  "concentrated": "CL",
  "multi-asset": "Multi",
  "standard": "AMM",
  "weighted": "Weighted"
};

function bigIntPow(base: bigint, exp: number): bigint {
  let result = BigInt(1);
  for (let i = 0; i < exp; i++) {
    result = result * base;
  }
  return result;
}

function formatWeiToToken(weiStr: string | null | undefined, decimals: number = 18): string {
  if (!weiStr) return "0";
  try {
    const wei = BigInt(weiStr);
    const TEN = BigInt(10);
    const divisor = bigIntPow(TEN, decimals);
    const wholePart = wei / divisor;
    const fractionalWei = wei % divisor;
    const fractional = Number(fractionalWei) / Number(divisor);
    const total = Number(wholePart) + fractional;
    
    if (total >= 1e9) return `${(total / 1e9).toFixed(2)}B`;
    if (total >= 1e6) return `${(total / 1e6).toFixed(2)}M`;
    if (total >= 1e3) return `${(total / 1e3).toFixed(2)}K`;
    if (total >= 1) return total.toFixed(4);
    if (total >= 0.0001) return total.toFixed(6);
    return total.toExponential(2);
  } catch {
    return "0";
  }
}

function formatUSD(weiStr: string | null | undefined): string {
  if (!weiStr) return "$0.00";
  try {
    const wei = BigInt(weiStr);
    const TEN = BigInt(10);
    const divisor = bigIntPow(TEN, 18);
    const usd = Number(wei) / Number(divisor);
    if (usd >= 1e9) return `$${(usd / 1e9).toFixed(2)}B`;
    if (usd >= 1e6) return `$${(usd / 1e6).toFixed(2)}M`;
    if (usd >= 1e3) return `$${(usd / 1e3).toFixed(2)}K`;
    return `$${usd.toFixed(2)}`;
  } catch {
    return "$0.00";
  }
}

function truncateAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr || "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function toWei(amount: string, decimals: number = 18): string {
  try {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) return "0";
    const multiplier = Math.pow(10, decimals);
    return Math.floor(value * multiplier).toString();
  } catch {
    return "0";
  }
}

export default function DexPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isConnected, isCorrectNetwork, balance } = useWeb3();
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  
  // Read initial tab from URL hash
  const getInitialTab = () => {
    const hash = window.location.hash.replace("#", "");
    const validTabs = ["swap", "pools", "positions", "activity"];
    return validTabs.includes(hash) ? hash : "swap";
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [poolTypeFilter, setPoolTypeFilter] = useState<string>("all");
  
  // Sync tab with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      const validTabs = ["swap", "pools", "positions", "activity"];
      if (validTabs.includes(hash)) {
        setActiveTab(hash);
      }
    };
    
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);
  
  // Update URL hash when tab changes
  useEffect(() => {
    const currentHash = window.location.hash.replace("#", "");
    if (currentHash !== activeTab) {
      window.history.replaceState(null, "", `#${activeTab}`);
    }
  }, [activeTab]);
  const [swapInput, setSwapInput] = useState({
    tokenIn: "",
    tokenOut: "",
    amountIn: "",
    slippage: "0.5"
  });
  const [selectedPool, setSelectedPool] = useState<string | null>(null);

  const [createPoolOpen, setCreatePoolOpen] = useState(false);
  const [createPoolForm, setCreatePoolForm] = useState({
    name: "",
    symbol: "",
    poolType: "standard" as "standard" | "stable" | "concentrated" | "multi_asset" | "weighted",
    feeTier: 300,
    token0Address: "",
    token0Symbol: "",
    token1Address: "",
    token1Symbol: ""
  });

  const [addLiquidityOpen, setAddLiquidityOpen] = useState(false);
  const [addLiquidityPool, setAddLiquidityPool] = useState<DexPool | null>(null);
  const [addLiquidityForm, setAddLiquidityForm] = useState({
    token0Amount: "",
    token1Amount: "",
    minLpTokens: "0"
  });

  const [removeLiquidityOpen, setRemoveLiquidityOpen] = useState(false);
  const [removeLiquidityPosition, setRemoveLiquidityPosition] = useState<DexPosition | null>(null);
  const [removePercentage, setRemovePercentage] = useState([50]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<DexStatsResponse>({
    queryKey: ["/api/dex/stats"],
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
    retry: 3,
    placeholderData: keepPreviousData,
  });

  const { data: pools, isLoading: poolsLoading, refetch: refetchPools } = useQuery<DexPool[]>({
    queryKey: ["/api/dex/pools"],
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
    retry: 3,
    placeholderData: keepPreviousData,
  });

  const { data: recentSwaps, isLoading: swapsLoading, refetch: refetchSwaps } = useQuery<DexSwap[]>({
    queryKey: ["/api/dex/swaps"],
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
    retry: 3,
    placeholderData: keepPreviousData,
  });

  const { data: positions, isLoading: positionsLoading, refetch: refetchPositions } = useQuery<DexPosition[]>({
    queryKey: ["/api/dex/positions"],
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
    retry: 3,
    placeholderData: keepPreviousData,
  });

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchStats(),
        refetchPools(),
        refetchSwaps(),
        refetchPositions()
      ]);
      toast({
        title: t('dex.refreshSuccess'),
        description: t('dex.refreshSuccessDesc')
      });
    } catch (error) {
      toast({
        title: t('dex.refreshError'),
        description: t('dex.refreshErrorDesc'),
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Build quote URL with query parameters
  const quoteUrl = useMemo(() => {
    if (!swapInput.tokenIn || !swapInput.tokenOut || !swapInput.amountIn) return null;
    const amountValue = parseFloat(swapInput.amountIn);
    if (isNaN(amountValue) || amountValue <= 0) return null;
    const amountInWei = toWei(swapInput.amountIn);
    return `/api/dex/quote?tokenIn=${encodeURIComponent(swapInput.tokenIn)}&tokenOut=${encodeURIComponent(swapInput.tokenOut)}&amountIn=${amountInWei}`;
  }, [swapInput.tokenIn, swapInput.tokenOut, swapInput.amountIn]);
  
  const { data: quote, isLoading: quoteLoading } = useQuery<SwapQuote>({
    queryKey: [quoteUrl],
    enabled: !!quoteUrl,
    staleTime: 5000,
  });

  const swapMutation = useMutation({
    mutationFn: async (data: { 
      poolId: string;
      tokenIn: string; 
      tokenOut: string; 
      amountIn: string; 
      minimumAmountOut: string; 
      deadline: number;
      traderAddress: string;
    }) => {
      return apiRequest("POST", "/api/dex/swap", data);
    },
    onSuccess: async () => {
      toast({ title: t('dex.swapSubmitted'), description: t('dex.swapSubmittedDesc') });
      await Promise.all([
        refetchStats(),
        refetchPools(),
        refetchSwaps(),
        refetchPositions()
      ]);
      setSwapInput(prev => ({ ...prev, amountIn: "" }));
    },
    onError: (error: Error) => {
      toast({ title: t('dex.swapFailed'), description: error.message, variant: "destructive" });
    }
  });

  const createPoolMutation = useMutation({
    mutationFn: async (data: typeof createPoolForm) => {
      return apiRequest("POST", "/api/dex/pools", {
        ...data,
        token0Decimals: 18,
        token1Decimals: 18,
        creatorAddress: ENTERPRISE_WALLET_ADDRESS
      });
    },
    onSuccess: () => {
      toast({ title: t('dex.poolCreated'), description: t('dex.poolCreatedDesc') });
      queryClient.invalidateQueries({ queryKey: ["/api/dex/pools"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dex/stats"] });
      setCreatePoolOpen(false);
      setCreatePoolForm({
        name: "",
        symbol: "",
        poolType: "standard",
        feeTier: 300,
        token0Address: "",
        token0Symbol: "",
        token1Address: "",
        token1Symbol: ""
      });
    },
    onError: (error: Error) => {
      toast({ title: t('dex.failedToCreatePool'), description: error.message, variant: "destructive" });
    }
  });

  const addLiquidityMutation = useMutation({
    mutationFn: async (data: { poolId: string; token0Address: string; token1Address: string; token0Amount: string; token1Amount: string }) => {
      return apiRequest("POST", "/api/dex/liquidity/add", {
        poolId: data.poolId,
        ownerAddress: ENTERPRISE_WALLET_ADDRESS,
        amounts: [
          { token: data.token0Address, amount: toWei(data.token0Amount) },
          { token: data.token1Address, amount: toWei(data.token1Amount) }
        ],
        minLpTokens: "0"
      });
    },
    onSuccess: () => {
      toast({ title: t('dex.liquidityAdded'), description: t('dex.liquidityAddedDesc') });
      queryClient.invalidateQueries({ queryKey: ["/api/dex/pools"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dex/positions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dex/stats"] });
      setAddLiquidityOpen(false);
      setAddLiquidityPool(null);
      setAddLiquidityForm({ token0Amount: "", token1Amount: "", minLpTokens: "0" });
    },
    onError: (error: Error) => {
      toast({ title: t('dex.failedToAddLiquidity'), description: error.message, variant: "destructive" });
    }
  });

  const removeLiquidityMutation = useMutation({
    mutationFn: async (data: { positionId: string; percentageToRemove: number }) => {
      return apiRequest("POST", "/api/dex/liquidity/remove", {
        positionId: data.positionId,
        percentageToRemove: data.percentageToRemove,
        minAmountsOut: []
      });
    },
    onSuccess: () => {
      toast({ title: t('dex.liquidityRemoved'), description: t('dex.liquidityRemovedDesc') });
      queryClient.invalidateQueries({ queryKey: ["/api/dex/pools"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dex/positions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dex/stats"] });
      setRemoveLiquidityOpen(false);
      setRemoveLiquidityPosition(null);
      setRemovePercentage([50]);
    },
    onError: (error: Error) => {
      toast({ title: t('dex.failedToRemoveLiquidity'), description: error.message, variant: "destructive" });
    }
  });

  const filteredPools = useMemo(() => {
    if (!pools) return [];
    if (poolTypeFilter === "all") return pools;
    return pools.filter(p => p.poolType === poolTypeFilter);
  }, [pools, poolTypeFilter]);

  const activePools = useMemo(() => {
    return pools?.filter(p => p.status === 'active') || [];
  }, [pools]);

  const tokenList = useMemo(() => {
    const tokens = new Map<string, { address: string; symbol: string; name: string }>();
    
    // Add default tokens first
    DEFAULT_TOKENS.forEach(token => {
      tokens.set(token.address, token);
    });
    
    // Add tokens from pools
    if (pools) {
      pools.forEach(p => {
        if (p.token0Address && !tokens.has(p.token0Address)) {
          tokens.set(p.token0Address, { address: p.token0Address, symbol: p.token0Symbol || truncateAddress(p.token0Address), name: p.token0Symbol || t('common.unknown') });
        }
        if (p.token1Address && !tokens.has(p.token1Address)) {
          tokens.set(p.token1Address, { address: p.token1Address, symbol: p.token1Symbol || truncateAddress(p.token1Address), name: p.token1Symbol || t('common.unknown') });
        }
      });
    }
    
    return Array.from(tokens.values());
  }, [pools]);

  const handleSwap = () => {
    if (!isConnected) {
      toast({ 
        title: t('wallet.walletRequired'), 
        description: t('wallet.connectRequiredDesc'), 
        variant: "destructive" 
      });
      setWalletModalOpen(true);
      return;
    }
    if (!isCorrectNetwork) {
      toast({ 
        title: t('wallet.wrongNetworkTitle'), 
        description: t('wallet.wrongNetworkDesc'), 
        variant: "destructive" 
      });
      return;
    }
    if (!quote) {
      toast({ 
        title: t('dex.swapFailed'), 
        description: t('dex.noQuoteAvailable'), 
        variant: "destructive" 
      });
      return;
    }

    if (!swapInput.tokenIn || !swapInput.tokenOut) {
      toast({ 
        title: t('dex.validationError'), 
        description: t('dex.selectBothTokens'), 
        variant: "destructive" 
      });
      return;
    }

    if (!swapInput.amountIn || parseFloat(swapInput.amountIn) <= 0) {
      toast({ 
        title: t('dex.validationError'), 
        description: t('dex.enterValidAmount'), 
        variant: "destructive" 
      });
      return;
    }
    
    const swapAmountFloat = parseFloat(swapInput.amountIn);
    const balanceFloat = parseFloat(balance || "0");
    if (swapAmountFloat > balanceFloat) {
      toast({
        title: t('dex.insufficientBalance'),
        description: t('dex.insufficientBalanceDesc', { balance: balanceFloat.toFixed(4), required: swapAmountFloat.toFixed(4) }),
        variant: "destructive"
      });
      return;
    }

    const poolId = quote.route?.[0]?.poolId || pools?.[0]?.id;
    if (!poolId) {
      toast({ 
        title: t('dex.swapFailed'), 
        description: t('dex.noPoolAvailable'), 
        variant: "destructive" 
      });
      return;
    }
    
    const slippage = parseFloat(swapInput.slippage) / 100;
    const amountOutBigInt = BigInt(quote.amountOut);
    const TEN_THOUSAND = BigInt(10000);
    const minimumAmountOut = (amountOutBigInt * BigInt(Math.floor((1 - slippage) * 10000))) / TEN_THOUSAND;
    const amountInWei = toWei(swapInput.amountIn);
    
    swapMutation.mutate({
      poolId,
      tokenIn: swapInput.tokenIn,
      tokenOut: swapInput.tokenOut,
      amountIn: amountInWei,
      minimumAmountOut: minimumAmountOut.toString(),
      deadline: Math.floor(Date.now() / 1000) + 1200,
      traderAddress: ENTERPRISE_WALLET_ADDRESS
    });
  };

  const handleCreatePool = () => {
    if (!isConnected) {
      toast({ title: t('wallet.walletRequired'), description: t('wallet.connectRequiredDesc'), variant: "destructive" });
      setWalletModalOpen(true);
      return;
    }
    if (!isCorrectNetwork) {
      toast({ title: t('wallet.wrongNetworkTitle'), description: t('wallet.wrongNetworkDesc'), variant: "destructive" });
      return;
    }
    if (!createPoolForm.name || !createPoolForm.symbol || !createPoolForm.token0Address || !createPoolForm.token1Address) {
      toast({ title: t('dex.validationError'), description: t('dex.fillAllRequiredFields'), variant: "destructive" });
      return;
    }
    createPoolMutation.mutate(createPoolForm);
  };

  const handleAddLiquidity = () => {
    if (!isConnected) {
      toast({ title: t('wallet.walletRequired'), description: t('wallet.connectRequiredDesc'), variant: "destructive" });
      setWalletModalOpen(true);
      return;
    }
    if (!isCorrectNetwork) {
      toast({ title: t('wallet.wrongNetworkTitle'), description: t('wallet.wrongNetworkDesc'), variant: "destructive" });
      return;
    }
    if (!addLiquidityPool) return;
    if (!addLiquidityForm.token0Amount || !addLiquidityForm.token1Amount) {
      toast({ title: t('dex.validationError'), description: t('dex.enterAmountsForBothTokens'), variant: "destructive" });
      return;
    }
    addLiquidityMutation.mutate({
      poolId: addLiquidityPool.id,
      token0Address: addLiquidityPool.token0Address,
      token1Address: addLiquidityPool.token1Address,
      token0Amount: addLiquidityForm.token0Amount,
      token1Amount: addLiquidityForm.token1Amount
    });
  };

  const handleRemoveLiquidity = () => {
    if (!removeLiquidityPosition) return;
    removeLiquidityMutation.mutate({
      positionId: removeLiquidityPosition.id,
      percentageToRemove: removePercentage[0]
    });
  };

  const openAddLiquidityDialog = (pool: DexPool, e: React.MouseEvent) => {
    e.stopPropagation();
    setAddLiquidityPool(pool);
    setAddLiquidityForm({ token0Amount: "", token1Amount: "", minLpTokens: "0" });
    setAddLiquidityOpen(true);
  };

  const openRemoveLiquidityDialog = (position: DexPosition) => {
    setRemoveLiquidityPosition(position);
    setRemovePercentage([50]);
    setRemoveLiquidityOpen(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <WalletRequiredBanner />
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-dex-title">{t('dex.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('dex.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            {activePools.length} {t('dex.liquidityPools')}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            data-testid="button-refresh-dex" 
            onClick={handleRefreshAll}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? t('common.refreshing') : t('common.refresh')}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-dex-tvl">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dex.tvl')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-dex-tvl-value">
                  {formatUSD(stats?.totalTvlUsd || "0")}
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  {t('dex.acrossPools', { count: stats?.totalPools || 0 })}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-dex-volume">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dex.volume24h')}</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-dex-volume-value">
                  {formatUSD(stats?.totalVolume24h || "0")}
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  {t('dex.tradingVolume')}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-dex-fees">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dex.fees24h')}</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-dex-fees-value">
                  {formatUSD(stats?.totalFees24h || "0")}
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <Droplets className="h-3 w-3 text-blue-500 mr-1" />
                  {t('dex.lpEarnings')}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-dex-swaps">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dex.totalSwaps')}</CardTitle>
            <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-dex-swaps-value">
                  {formatNumber(stats?.totalSwaps24h || 0)}
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <Zap className="h-3 w-3 text-yellow-500 mr-1" />
                  {t('dex.allTimeTrades')}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="swap" data-testid="tab-swap" className="flex items-center gap-2">
            <ArrowDownUp className="h-4 w-4" />
            {t('dex.swap')}
          </TabsTrigger>
          <TabsTrigger value="pools" data-testid="tab-pools" className="flex items-center gap-2">
            <Droplets className="h-4 w-4" />
            {t('dex.liquidityPools')}
          </TabsTrigger>
          <TabsTrigger value="positions" data-testid="tab-positions" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            {t('dex.myPositions')}
          </TabsTrigger>
          <TabsTrigger value="activity" data-testid="tab-activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            {t('dex.analytics')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="swap" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="lg:max-w-lg" data-testid="card-swap-interface">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ArrowDownUp className="h-5 w-5" />
                    {t('dex.swapTokens')}
                  </CardTitle>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t('dex.slippage')}: {swapInput.slippage}%</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <CardDescription>{t('dex.swapWithAiRouting')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('dex.youPay')}</Label>
                  <div className="flex gap-2">
                    <Select value={swapInput.tokenIn} onValueChange={(v) => setSwapInput(prev => ({ ...prev, tokenIn: v }))}>
                      <SelectTrigger className="w-[140px]" data-testid="select-token-in">
                        <SelectValue placeholder={t('dex.selectToken')}>
                          {swapInput.tokenIn && tokenList.find(t => t.address === swapInput.tokenIn)?.symbol}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {tokenList.map((token) => (
                          <SelectItem key={token.address} value={token.address}>
                            {token.symbol}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={swapInput.amountIn}
                      onChange={(e) => setSwapInput(prev => ({ ...prev, amountIn: e.target.value }))}
                      className="flex-1 font-mono"
                      data-testid="input-amount-in"
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSwapInput(prev => ({ ...prev, tokenIn: prev.tokenOut, tokenOut: prev.tokenIn }))}
                    data-testid="button-swap-direction"
                  >
                    <ArrowDownUp className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>{t('dex.youReceive')}</Label>
                  <div className="flex gap-2">
                    <Select value={swapInput.tokenOut} onValueChange={(v) => setSwapInput(prev => ({ ...prev, tokenOut: v }))}>
                      <SelectTrigger className="w-[140px]" data-testid="select-token-out">
                        <SelectValue placeholder={t('dex.selectToken')}>
                          {swapInput.tokenOut && tokenList.find(t => t.address === swapInput.tokenOut)?.symbol}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {tokenList.map((token) => (
                          <SelectItem key={token.address} value={token.address}>
                            {token.symbol}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="text"
                      placeholder="0.0"
                      value={quote ? formatWeiToToken(quote.amountOut) : ""}
                      readOnly
                      className="flex-1 font-mono bg-muted"
                      data-testid="input-amount-out"
                    />
                  </div>
                </div>

                {quote && (
                  <div className="rounded-lg bg-muted p-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('dex.priceImpact')}</span>
                      <span className={parseFloat(quote.priceImpact) > 5 ? "text-red-500" : "text-foreground"}>
                        {quote.priceImpact}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('dex.swapFee')}</span>
                      <span>{formatWeiToToken(quote.fee)} TBURN</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('dex.route')}</span>
                      <span className="text-right">
                        {quote.route?.map(r => r.name || truncateAddress(r.poolId)).join(" → ")}
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">{t('dex.slippageTolerance')}</Label>
                  <div className="flex gap-2">
                    {["0.1", "0.5", "1.0", "3.0"].map((s) => (
                      <Button
                        key={s}
                        variant={swapInput.slippage === s ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSwapInput(prev => ({ ...prev, slippage: s }))}
                        data-testid={`button-slippage-${s}`}
                      >
                        {s}%
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  disabled={!quote || swapMutation.isPending}
                  onClick={handleSwap}
                  data-testid="button-execute-swap"
                >
                  {swapMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowDownUp className="h-4 w-4 mr-2" />
                  )}
                  {swapMutation.isPending ? t('common.loading') : t('dex.swap')}
                </Button>
              </CardContent>
            </Card>

            <Card data-testid="card-recent-swaps">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  {t('dex.recentSwaps')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {swapsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : recentSwaps && recentSwaps.length > 0 ? (
                    <div className="space-y-3">
                      {recentSwaps.slice(0, 10).map((swap) => (
                        <div
                          key={swap.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover-elevate"
                          data-testid={`swap-item-${swap.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/10">
                              <ArrowDownUp className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium text-sm">
                                {formatWeiToToken(swap.amountIn)} → {formatWeiToToken(swap.amountOut)}
                              </div>
                              <div className="text-xs text-muted-foreground font-mono">
                                {truncateAddress(swap.traderAddress)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={swap.status === "completed" ? "default" : "secondary"}>
                              {swap.status}
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">
                              {swap.executedAt ? new Date(swap.executedAt).toLocaleTimeString('en-US', { timeZone: 'America/New_York' }) : t('dex.pending')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                      <ArrowDownUp className="h-8 w-8 mb-2" />
                      <p>{t('dex.noRecentSwaps')}</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pools" className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Select value={poolTypeFilter} onValueChange={setPoolTypeFilter}>
                <SelectTrigger className="w-[180px]" data-testid="select-pool-filter">
                  <SelectValue placeholder={t('dex.allPoolTypes')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('dex.allPoolTypes')}</SelectItem>
                  <SelectItem value="constant-product">{t('dex.constantProductAmm')}</SelectItem>
                  <SelectItem value="stable">{t('dex.stableSwap')}</SelectItem>
                  <SelectItem value="concentrated">{t('dex.concentratedLiquidity')}</SelectItem>
                  <SelectItem value="multi-asset">{t('dex.multiAsset')}</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="outline">{t('dex.poolsCount', { count: filteredPools.length })}</Badge>
            </div>
            <Button data-testid="button-create-pool" onClick={() => setCreatePoolOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('dex.createPool')}
            </Button>
          </div>

          <div className="grid gap-4">
            {poolsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : filteredPools.length > 0 ? (
              filteredPools.map((pool) => (
                <Card 
                  key={pool.id} 
                  className="hover-elevate cursor-pointer"
                  onClick={() => setSelectedPool(pool.id)}
                  data-testid={`pool-card-${pool.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border-2 border-background">
                            <Coins className="h-5 w-5" />
                          </div>
                          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border-2 border-background">
                            <Coins className="h-5 w-5" />
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold flex items-center gap-2">
                            {pool.name || `Pool ${truncateAddress(pool.id)}`}
                            <Badge className={poolTypeColors[pool.poolType] || "bg-gray-500"}>
                              {poolTypeLabels[pool.poolType] || pool.poolType}
                            </Badge>
                            {pool.status !== 'active' && (
                              <Badge variant="destructive">{pool.status}</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground font-mono">
                            {pool.token0Symbol} / {pool.token1Symbol}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">{t('dex.tvl')}</div>
                          <div className="font-semibold">{formatUSD(pool.tvlUsd)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">{t('dex.volume24h')}</div>
                          <div className="font-semibold">{formatUSD(pool.volume24h)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">{t('dex.apy')}</div>
                          <div className="font-semibold text-green-500">
                            {pool.totalApy > 0 ? `${(pool.totalApy / 100).toFixed(2)}%` : "N/A"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">{t('dex.poolType')}</div>
                          <div className="font-semibold">
                            {(pool.feeTier / 100).toFixed(2)}%
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          data-testid={`button-add-liquidity-${pool.id}`}
                          onClick={(e) => openAddLiquidityDialog(pool, e)}
                          disabled={addLiquidityMutation.isPending}
                        >
                          {addLiquidityMutation.isPending && addLiquidityPool?.id === pool.id ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4 mr-1" />
                          )}
                          {t('dex.addLiquidity')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Droplets className="h-12 w-12 mb-4" />
                  <p className="text-lg font-medium">{t('dex.noPoolsFound')}</p>
                  <p className="text-sm">{t('dex.createPoolToStart')}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="positions" className="space-y-6">
          <Card data-testid="card-my-positions">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                {t('dex.myLiquidityPositions')}
              </CardTitle>
              <CardDescription>{t('dex.manageLiquidityPositions')}</CardDescription>
            </CardHeader>
            <CardContent>
              {positionsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : positions && positions.length > 0 ? (
                <div className="space-y-4">
                  {positions.map((position) => (
                    <div
                      key={position.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover-elevate"
                      data-testid={`position-item-${position.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-primary/10">
                          <Layers className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold flex items-center gap-2">
                            {t('dex.position')} #{truncateAddress(position.id)}
                            <Badge variant={position.isActive ? "default" : "secondary"} className={position.isActive ? "bg-green-600 hover:bg-green-700" : ""}>
                              {position.isActive ? t('dex.active') : t('dex.closed')}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground font-mono">
                            {t('dex.pool')}: {truncateAddress(position.poolId)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">{t('dex.lpTokens')}</div>
                          <div className="font-semibold">{formatWeiToToken(position.lpTokenBalance)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">{t('dex.token0Deposited')}</div>
                          <div className="font-semibold">{formatWeiToToken(position.token0Deposited)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">{t('dex.token1Deposited')}</div>
                          <div className="font-semibold">{formatWeiToToken(position.token1Deposited)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">{t('dex.unclaimedFees')}</div>
                          <div className="font-semibold text-green-500">
                            {formatWeiToToken(position.unclaimedFees0)} / {formatWeiToToken(position.unclaimedFees1)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" data-testid={`button-claim-fees-${position.id}`}>
                            <Coins className="h-4 w-4 mr-1" />
                            {t('dex.claim')}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            data-testid={`button-remove-liquidity-${position.id}`}
                            onClick={() => openRemoveLiquidityDialog(position)}
                            disabled={removeLiquidityMutation.isPending}
                          >
                            {removeLiquidityMutation.isPending && removeLiquidityPosition?.id === position.id ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Minus className="h-4 w-4 mr-1" />
                            )}
                            {t('dex.remove')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Layers className="h-12 w-12 mb-4" />
                  <p className="text-lg font-medium">{t('dex.noPositionsFound')}</p>
                  <p className="text-sm">{t('dex.addLiquidityToCreatePosition')}</p>
                  <Button className="mt-4" onClick={() => setActiveTab("pools")}>
                    <Droplets className="h-4 w-4 mr-2" />
                    {t('dex.browsePools')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card data-testid="card-swap-activity">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {t('dex.recentActivity')}
              </CardTitle>
              <CardDescription>{t('dex.allSwapTransactions')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {swapsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : recentSwaps && recentSwaps.length > 0 ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-7 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground">
                      <div>{t('dex.type')}</div>
                      <div>{t('dex.trader')}</div>
                      <div>{t('dex.amountIn')}</div>
                      <div>{t('dex.amountOut')}</div>
                      <div>{t('dex.price')}</div>
                      <div>{t('dex.status')}</div>
                      <div>{t('dex.time')}</div>
                    </div>
                    <Separator />
                    {recentSwaps.map((swap) => (
                      <div
                        key={swap.id}
                        className="grid grid-cols-7 gap-4 px-4 py-3 items-center hover:bg-muted/50 rounded-lg transition-colors"
                        data-testid={`activity-row-${swap.id}`}
                      >
                        <div>
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            <ArrowDownUp className="h-3 w-3" />
                            {swap.swapType}
                          </Badge>
                        </div>
                        <div className="font-mono text-sm">{truncateAddress(swap.traderAddress)}</div>
                        <div className="font-medium">{formatWeiToToken(swap.amountIn)}</div>
                        <div className="font-medium">{formatWeiToToken(swap.amountOut)}</div>
                        <div className="text-muted-foreground">
                          {swap.effectivePrice ? parseFloat(swap.effectivePrice).toFixed(6) : "N/A"}
                        </div>
                        <div>
                          <Badge variant={swap.status === "completed" ? "default" : swap.status === "failed" ? "destructive" : "secondary"}>
                            {swap.status === "completed" && <CheckCircle className="h-3 w-3 mr-1" />}
                            {swap.status === "failed" && <AlertCircle className="h-3 w-3 mr-1" />}
                            {swap.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                            {swap.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {swap.executedAt ? new Date(swap.executedAt).toLocaleString('en-US', { timeZone: 'America/New_York' }) : t('dex.pending')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Activity className="h-12 w-12 mb-4" />
                    <p className="text-lg font-medium">{t('dex.noActivityYet')}</p>
                    <p className="text-sm">{t('dex.swapTransactionsWillAppear')}</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={createPoolOpen} onOpenChange={setCreatePoolOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {t('dex.createLiquidityPool')}
            </DialogTitle>
            <DialogDescription>
              {t('dex.createPoolDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pool-name">{t('dex.poolName')}</Label>
                <Input
                  id="pool-name"
                  placeholder={t('dex.poolNamePlaceholder')}
                  value={createPoolForm.name}
                  onChange={(e) => setCreatePoolForm(prev => ({ ...prev, name: e.target.value }))}
                  data-testid="input-pool-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pool-symbol">{t('dex.symbol')}</Label>
                <Input
                  id="pool-symbol"
                  placeholder={t('dex.symbolPlaceholder')}
                  value={createPoolForm.symbol}
                  onChange={(e) => setCreatePoolForm(prev => ({ ...prev, symbol: e.target.value }))}
                  data-testid="input-pool-symbol"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pool-type">{t('dex.poolType')}</Label>
                <Select 
                  value={createPoolForm.poolType} 
                  onValueChange={(v) => setCreatePoolForm(prev => ({ ...prev, poolType: v as any }))}
                >
                  <SelectTrigger data-testid="select-pool-type">
                    <SelectValue placeholder={t('dex.selectType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">{t('dex.standardAmm')}</SelectItem>
                    <SelectItem value="stable">{t('dex.stableSwap')}</SelectItem>
                    <SelectItem value="concentrated">{t('dex.concentratedLiquidity')}</SelectItem>
                    <SelectItem value="multi_asset">{t('dex.multiAsset')}</SelectItem>
                    <SelectItem value="weighted">{t('dex.weightedPool')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fee-tier">{t('dex.feeTierBps')}</Label>
                <Select 
                  value={createPoolForm.feeTier.toString()} 
                  onValueChange={(v) => setCreatePoolForm(prev => ({ ...prev, feeTier: parseInt(v) }))}
                >
                  <SelectTrigger data-testid="select-fee-tier">
                    <SelectValue placeholder={t('dex.selectFee')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">0.01% (100 bps)</SelectItem>
                    <SelectItem value="300">0.03% (300 bps)</SelectItem>
                    <SelectItem value="500">0.05% (500 bps)</SelectItem>
                    <SelectItem value="3000">0.30% (3000 bps)</SelectItem>
                    <SelectItem value="10000">1.00% (10000 bps)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>{t('dex.token0')}</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder={t('dex.tokenAddress')}
                  value={createPoolForm.token0Address}
                  onChange={(e) => setCreatePoolForm(prev => ({ ...prev, token0Address: e.target.value }))}
                  className="font-mono text-sm"
                  data-testid="input-token0-address"
                />
                <Input
                  placeholder={t('dex.tokenSymbolPlaceholder', { symbol: 'TBURN' })}
                  value={createPoolForm.token0Symbol}
                  onChange={(e) => setCreatePoolForm(prev => ({ ...prev, token0Symbol: e.target.value }))}
                  data-testid="input-token0-symbol"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('dex.token1')}</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder={t('dex.tokenAddress')}
                  value={createPoolForm.token1Address}
                  onChange={(e) => setCreatePoolForm(prev => ({ ...prev, token1Address: e.target.value }))}
                  className="font-mono text-sm"
                  data-testid="input-token1-address"
                />
                <Input
                  placeholder={t('dex.tokenSymbolPlaceholder', { symbol: 'ETH' })}
                  value={createPoolForm.token1Symbol}
                  onChange={(e) => setCreatePoolForm(prev => ({ ...prev, token1Symbol: e.target.value }))}
                  data-testid="input-token1-symbol"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreatePoolOpen(false)}>
              {t('dex.cancel')}
            </Button>
            <Button 
              onClick={handleCreatePool} 
              disabled={createPoolMutation.isPending}
              data-testid="button-submit-create-pool"
            >
              {createPoolMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('dex.creating')}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('dex.createPool')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addLiquidityOpen} onOpenChange={setAddLiquidityOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5" />
              {t('dex.addLiquidity')}
            </DialogTitle>
            <DialogDescription>
              {t('dex.addLiquidityTo', { pool: addLiquidityPool?.name || "this pool", tokens: `${addLiquidityPool?.token0Symbol}/${addLiquidityPool?.token1Symbol}` })}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="token0-amount" className="flex items-center justify-between">
                <span>{t('dex.tokenAmount', { symbol: addLiquidityPool?.token0Symbol || "Token 0" })}</span>
                <span className="text-xs text-muted-foreground font-mono">
                  {truncateAddress(addLiquidityPool?.token0Address || "")}
                </span>
              </Label>
              <Input
                id="token0-amount"
                type="number"
                placeholder="0.0"
                value={addLiquidityForm.token0Amount}
                onChange={(e) => setAddLiquidityForm(prev => ({ ...prev, token0Amount: e.target.value }))}
                className="font-mono"
                data-testid="input-liquidity-token0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="token1-amount" className="flex items-center justify-between">
                <span>{t('dex.tokenAmount', { symbol: addLiquidityPool?.token1Symbol || "Token 1" })}</span>
                <span className="text-xs text-muted-foreground font-mono">
                  {truncateAddress(addLiquidityPool?.token1Address || "")}
                </span>
              </Label>
              <Input
                id="token1-amount"
                type="number"
                placeholder="0.0"
                value={addLiquidityForm.token1Amount}
                onChange={(e) => setAddLiquidityForm(prev => ({ ...prev, token1Amount: e.target.value }))}
                className="font-mono"
                data-testid="input-liquidity-token1"
              />
            </div>
            <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('dex.poolType')}</span>
                <Badge className={poolTypeColors[addLiquidityPool?.poolType || ""] || "bg-gray-500"}>
                  {poolTypeLabels[addLiquidityPool?.poolType || ""] || addLiquidityPool?.poolType}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('dex.feeTier')}</span>
                <span>{addLiquidityPool ? (addLiquidityPool.feeTier / 100).toFixed(2) : "0"}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('dex.currentTvl')}</span>
                <span>{formatUSD(addLiquidityPool?.tvlUsd)}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddLiquidityOpen(false)}>
              {t('dex.cancel')}
            </Button>
            <Button 
              onClick={handleAddLiquidity} 
              disabled={addLiquidityMutation.isPending}
              data-testid="button-submit-add-liquidity"
            >
              {addLiquidityMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('dex.adding')}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('dex.addLiquidity')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={removeLiquidityOpen} onOpenChange={setRemoveLiquidityOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Minus className="h-5 w-5" />
              {t('dex.removeLiquidity')}
            </DialogTitle>
            <DialogDescription>
              {t('dex.removeFromPosition', { id: truncateAddress(removeLiquidityPosition?.id || "") })}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>{t('dex.amountToRemove')}</Label>
                <span className="text-2xl font-bold">{removePercentage[0]}%</span>
              </div>
              <Slider
                value={removePercentage}
                onValueChange={setRemovePercentage}
                max={100}
                min={1}
                step={1}
                className="w-full"
                data-testid="slider-remove-percentage"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setRemovePercentage([25])}
                >
                  25%
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setRemovePercentage([50])}
                >
                  50%
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setRemovePercentage([75])}
                >
                  75%
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setRemovePercentage([100])}
                >
                  {t('dex.max')}
                </Button>
              </div>
            </div>
            <Separator />
            <div className="rounded-lg bg-muted p-3 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('dex.lpTokenBalance')}</span>
                <span className="font-mono">{formatWeiToToken(removeLiquidityPosition?.lpTokenBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('dex.amountToRemove')}</span>
                <span className="font-mono">
                  {removeLiquidityPosition ? 
                    formatWeiToToken(
                      (BigInt(removeLiquidityPosition.lpTokenBalance || "0") * BigInt(removePercentage[0]) / BigInt(100)).toString()
                    ) : "0"
                  }
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('dex.estToken0Return')}</span>
                <span className="font-mono">
                  {removeLiquidityPosition ? 
                    formatWeiToToken(
                      (BigInt(removeLiquidityPosition.token0Deposited || "0") * BigInt(removePercentage[0]) / BigInt(100)).toString()
                    ) : "0"
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('dex.estToken1Return')}</span>
                <span className="font-mono">
                  {removeLiquidityPosition ? 
                    formatWeiToToken(
                      (BigInt(removeLiquidityPosition.token1Deposited || "0") * BigInt(removePercentage[0]) / BigInt(100)).toString()
                    ) : "0"
                  }
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveLiquidityOpen(false)}>
              {t('dex.cancel')}
            </Button>
            <Button 
              variant="destructive"
              onClick={handleRemoveLiquidity} 
              disabled={removeLiquidityMutation.isPending}
              data-testid="button-submit-remove-liquidity"
            >
              {removeLiquidityMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('dex.removing')}
                </>
              ) : (
                <>
                  <Minus className="h-4 w-4 mr-2" />
                  {t('dex.removeLiquidity')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <WalletConnectModal open={walletModalOpen} onOpenChange={setWalletModalOpen} />
    </div>
  );
}
