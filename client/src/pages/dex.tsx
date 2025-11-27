import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowDownUp,
  TrendingUp,
  TrendingDown,
  Activity,
  Wallet,
  Droplets,
  BarChart3,
  RefreshCw,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  Shield,
  Coins,
  Target,
  Layers,
  DollarSign,
  Percent,
  Plus,
  Minus,
  Settings,
  Info,
  ExternalLink
} from "lucide-react";
import { formatNumber } from "@/lib/formatters";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DexPool {
  id: string;
  poolName: string | null;
  poolType: string;
  token0Address: string;
  token1Address: string;
  reserve0: string | null;
  reserve1: string | null;
  totalValueLocked: string | null;
  volume24h: string | null;
  fees24h: string | null;
  apy: string | null;
  currentPrice: string | null;
  priceChange24h: string | null;
  isActive: boolean | null;
  lastTradeAt: string | null;
  feeTier: string | null;
  lpTokenSupply: string | null;
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
  activePools: number;
  totalValueLocked: string;
  volume24h: string;
  fees24h: string;
  totalSwaps: number;
}

interface SwapQuote {
  amountOut: string;
  priceImpact: string;
  fee: string;
  route: { poolId: string; poolName: string }[];
  estimatedGas: string;
}

const poolTypeColors: Record<string, string> = {
  "constant-product": "bg-blue-500 text-white",
  "stable": "bg-green-500 text-white",
  "concentrated": "bg-purple-500 text-white",
  "multi-asset": "bg-orange-500 text-white"
};

const poolTypeLabels: Record<string, string> = {
  "constant-product": "AMM",
  "stable": "Stable",
  "concentrated": "CL",
  "multi-asset": "Multi"
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

export default function DexPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("swap");
  const [poolTypeFilter, setPoolTypeFilter] = useState<string>("all");
  const [swapInput, setSwapInput] = useState({
    tokenIn: "",
    tokenOut: "",
    amountIn: "",
    slippage: "0.5"
  });
  const [selectedPool, setSelectedPool] = useState<string | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery<DexStatsResponse>({
    queryKey: ["/api/dex/stats"]
  });

  const { data: pools, isLoading: poolsLoading } = useQuery<DexPool[]>({
    queryKey: ["/api/dex/pools"]
  });

  const { data: recentSwaps, isLoading: swapsLoading } = useQuery<DexSwap[]>({
    queryKey: ["/api/dex/swaps/recent"]
  });

  const { data: positions, isLoading: positionsLoading } = useQuery<DexPosition[]>({
    queryKey: ["/api/dex/positions"]
  });

  const { data: quote, isLoading: quoteLoading } = useQuery<SwapQuote>({
    queryKey: ["/api/dex/quote", swapInput.tokenIn, swapInput.tokenOut, swapInput.amountIn],
    enabled: !!(swapInput.tokenIn && swapInput.tokenOut && swapInput.amountIn && parseFloat(swapInput.amountIn) > 0)
  });

  const swapMutation = useMutation({
    mutationFn: async (data: { tokenIn: string; tokenOut: string; amountIn: string; minAmountOut: string; deadline: number }) => {
      return apiRequest("POST", "/api/dex/swap", data);
    },
    onSuccess: () => {
      toast({ title: "Swap Submitted", description: "Your swap has been submitted for processing." });
      queryClient.invalidateQueries({ queryKey: ["/api/dex"] });
      setSwapInput(prev => ({ ...prev, amountIn: "" }));
    },
    onError: (error: Error) => {
      toast({ title: "Swap Failed", description: error.message, variant: "destructive" });
    }
  });

  const filteredPools = useMemo(() => {
    if (!pools) return [];
    if (poolTypeFilter === "all") return pools;
    return pools.filter(p => p.poolType === poolTypeFilter);
  }, [pools, poolTypeFilter]);

  const activePools = useMemo(() => {
    return pools?.filter(p => p.isActive) || [];
  }, [pools]);

  const tokenList = useMemo(() => {
    if (!pools) return [];
    const tokens = new Set<string>();
    pools.forEach(p => {
      if (p.token0Address) tokens.add(p.token0Address);
      if (p.token1Address) tokens.add(p.token1Address);
    });
    return Array.from(tokens);
  }, [pools]);

  const handleSwap = () => {
    if (!quote) return;
    
    const slippage = parseFloat(swapInput.slippage) / 100;
    const amountOutBigInt = BigInt(quote.amountOut);
    const TEN_THOUSAND = BigInt(10000);
    const minAmountOut = (amountOutBigInt * BigInt(Math.floor((1 - slippage) * 10000))) / TEN_THOUSAND;
    
    swapMutation.mutate({
      tokenIn: swapInput.tokenIn,
      tokenOut: swapInput.tokenOut,
      amountIn: swapInput.amountIn,
      minAmountOut: minAmountOut.toString(),
      deadline: Math.floor(Date.now() / 1000) + 1200
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-dex-title">TBURN DEX</h1>
          <p className="text-muted-foreground mt-1">
            Decentralized Exchange with AI-Powered Routing and Multi-Pool Support
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            {stats?.activePools || 0} Active Pools
          </Badge>
          <Button variant="outline" size="sm" data-testid="button-refresh-dex" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/dex"] })}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-dex-tvl">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value Locked</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-dex-tvl-value">
                  {formatUSD(stats?.totalValueLocked || "0")}
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  Across {stats?.totalPools || 0} pools
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-dex-volume">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-dex-volume-value">
                  {formatUSD(stats?.volume24h || "0")}
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  Trading volume
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-dex-fees">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Fees</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-dex-fees-value">
                  {formatUSD(stats?.fees24h || "0")}
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <Droplets className="h-3 w-3 text-blue-500 mr-1" />
                  LP earnings
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-dex-swaps">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Swaps</CardTitle>
            <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-dex-swaps-value">
                  {formatNumber(stats?.totalSwaps || 0)}
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <Zap className="h-3 w-3 text-yellow-500 mr-1" />
                  All-time trades
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
            Swap
          </TabsTrigger>
          <TabsTrigger value="pools" data-testid="tab-pools" className="flex items-center gap-2">
            <Droplets className="h-4 w-4" />
            Pools
          </TabsTrigger>
          <TabsTrigger value="positions" data-testid="tab-positions" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            My Positions
          </TabsTrigger>
          <TabsTrigger value="activity" data-testid="tab-activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="swap" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="lg:max-w-lg" data-testid="card-swap-interface">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ArrowDownUp className="h-5 w-5" />
                    Swap Tokens
                  </CardTitle>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Slippage: {swapInput.slippage}%</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <CardDescription>Swap tokens with AI-optimized routing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>You Pay</Label>
                  <div className="flex gap-2">
                    <Select value={swapInput.tokenIn} onValueChange={(v) => setSwapInput(prev => ({ ...prev, tokenIn: v }))}>
                      <SelectTrigger className="w-[140px]" data-testid="select-token-in">
                        <SelectValue placeholder="Token" />
                      </SelectTrigger>
                      <SelectContent>
                        {tokenList.map((token) => (
                          <SelectItem key={token} value={token}>
                            {truncateAddress(token)}
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
                  <Label>You Receive</Label>
                  <div className="flex gap-2">
                    <Select value={swapInput.tokenOut} onValueChange={(v) => setSwapInput(prev => ({ ...prev, tokenOut: v }))}>
                      <SelectTrigger className="w-[140px]" data-testid="select-token-out">
                        <SelectValue placeholder="Token" />
                      </SelectTrigger>
                      <SelectContent>
                        {tokenList.map((token) => (
                          <SelectItem key={token} value={token}>
                            {truncateAddress(token)}
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
                      <span className="text-muted-foreground">Price Impact</span>
                      <span className={parseFloat(quote.priceImpact) > 5 ? "text-red-500" : "text-foreground"}>
                        {quote.priceImpact}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Swap Fee</span>
                      <span>{formatWeiToToken(quote.fee)} TBURN</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Route</span>
                      <span className="text-right">
                        {quote.route?.map(r => r.poolName || truncateAddress(r.poolId)).join(" → ")}
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Slippage Tolerance</Label>
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
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowDownUp className="h-4 w-4 mr-2" />
                  )}
                  {swapMutation.isPending ? "Processing..." : "Swap"}
                </Button>
              </CardContent>
            </Card>

            <Card data-testid="card-recent-swaps">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Swaps
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
                              {swap.executedAt ? new Date(swap.executedAt).toLocaleTimeString() : "Pending"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                      <ArrowDownUp className="h-8 w-8 mb-2" />
                      <p>No recent swaps</p>
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
                  <SelectValue placeholder="All Pool Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pool Types</SelectItem>
                  <SelectItem value="constant-product">Constant Product (AMM)</SelectItem>
                  <SelectItem value="stable">Stable Swap</SelectItem>
                  <SelectItem value="concentrated">Concentrated Liquidity</SelectItem>
                  <SelectItem value="multi-asset">Multi-Asset</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="outline">{filteredPools.length} pools</Badge>
            </div>
            <Button data-testid="button-create-pool">
              <Plus className="h-4 w-4 mr-2" />
              Create Pool
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
                            {pool.poolName || `Pool ${truncateAddress(pool.id)}`}
                            <Badge className={poolTypeColors[pool.poolType] || "bg-gray-500"}>
                              {poolTypeLabels[pool.poolType] || pool.poolType}
                            </Badge>
                            {pool.isActive === false && (
                              <Badge variant="destructive">Inactive</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground font-mono">
                            {truncateAddress(pool.token0Address)} / {truncateAddress(pool.token1Address)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">TVL</div>
                          <div className="font-semibold">{formatUSD(pool.totalValueLocked)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">24h Volume</div>
                          <div className="font-semibold">{formatUSD(pool.volume24h)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">APY</div>
                          <div className="font-semibold text-green-500">
                            {pool.apy ? `${parseFloat(pool.apy).toFixed(2)}%` : "N/A"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">24h Change</div>
                          <div className={`font-semibold flex items-center justify-end ${
                            pool.priceChange24h && parseFloat(pool.priceChange24h) >= 0 ? "text-green-500" : "text-red-500"
                          }`}>
                            {pool.priceChange24h && parseFloat(pool.priceChange24h) >= 0 ? (
                              <ArrowUpRight className="h-4 w-4" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4" />
                            )}
                            {pool.priceChange24h ? `${Math.abs(parseFloat(pool.priceChange24h)).toFixed(2)}%` : "N/A"}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" data-testid={`button-add-liquidity-${pool.id}`}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add Liquidity
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
                  <p className="text-lg font-medium">No pools found</p>
                  <p className="text-sm">Create a new liquidity pool to get started</p>
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
                My Liquidity Positions
              </CardTitle>
              <CardDescription>Manage your liquidity positions and claim fees</CardDescription>
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
                            Position #{truncateAddress(position.id)}
                            <Badge variant={position.isActive ? "default" : "secondary"}>
                              {position.isActive ? "Active" : "Closed"}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground font-mono">
                            Pool: {truncateAddress(position.poolId)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">LP Tokens</div>
                          <div className="font-semibold">{formatWeiToToken(position.lpTokenBalance)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Token0 Deposited</div>
                          <div className="font-semibold">{formatWeiToToken(position.token0Deposited)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Token1 Deposited</div>
                          <div className="font-semibold">{formatWeiToToken(position.token1Deposited)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Unclaimed Fees</div>
                          <div className="font-semibold text-green-500">
                            {formatWeiToToken(position.unclaimedFees0)} / {formatWeiToToken(position.unclaimedFees1)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" data-testid={`button-claim-fees-${position.id}`}>
                            <Coins className="h-4 w-4 mr-1" />
                            Claim
                          </Button>
                          <Button variant="outline" size="sm" data-testid={`button-remove-liquidity-${position.id}`}>
                            <Minus className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Layers className="h-12 w-12 mb-4" />
                  <p className="text-lg font-medium">No positions found</p>
                  <p className="text-sm">Add liquidity to a pool to create a position</p>
                  <Button className="mt-4" onClick={() => setActiveTab("pools")}>
                    <Droplets className="h-4 w-4 mr-2" />
                    Browse Pools
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
                Recent Activity
              </CardTitle>
              <CardDescription>All swap transactions across the DEX</CardDescription>
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
                      <div>Type</div>
                      <div>Trader</div>
                      <div>Amount In</div>
                      <div>Amount Out</div>
                      <div>Price</div>
                      <div>Status</div>
                      <div>Time</div>
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
                          {swap.executedAt ? new Date(swap.executedAt).toLocaleString() : "Pending"}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Activity className="h-12 w-12 mb-4" />
                    <p className="text-lg font-medium">No activity yet</p>
                    <p className="text-sm">Swap transactions will appear here</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
