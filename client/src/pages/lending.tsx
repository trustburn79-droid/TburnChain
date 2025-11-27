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
  TrendingUp,
  TrendingDown,
  Activity,
  Wallet,
  BarChart3,
  RefreshCw,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  AlertCircle,
  CheckCircle,
  Shield,
  Coins,
  DollarSign,
  Percent,
  Plus,
  Minus,
  PiggyBank,
  Landmark,
  AlertTriangle,
  Heart,
  Target,
  Timer,
  CircleDollarSign
} from "lucide-react";
import { formatNumber } from "@/lib/formatters";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LendingMarket {
  id: string;
  assetAddress: string;
  assetSymbol: string;
  assetName: string;
  assetDecimals: number;
  priceFeedId: string;
  totalSupply: string;
  totalBorrowed: string;
  totalSupplyShares: string;
  totalBorrowShares: string;
  availableLiquidity: string;
  utilizationRate: number;
  supplyRate: number;
  borrowRateVariable: number;
  borrowRateStable: number;
  collateralFactor: number;
  liquidationThreshold: number;
  liquidationPenalty: number;
  reserveFactor: number;
  baseRate: number;
  optimalUtilization: number;
  slope1: number;
  slope2: number;
  supplyCap: string | null;
  borrowCap: string | null;
  canBeCollateral: boolean;
  canBeBorrowed: boolean;
  isActive: boolean;
  isFrozen: boolean;
  isPaused: boolean;
}

interface LendingPosition {
  userAddress: string;
  totalCollateralValueUsd: string;
  totalBorrowedValueUsd: string;
  healthFactor: number;
  healthStatus: string;
  suppliedAssetCount: number;
  borrowedAssetCount: number;
  netApy: number;
  borrowCapacityRemaining: string;
  supplyDetails: Array<{
    marketId: string;
    assetSymbol: string;
    suppliedAmount: string;
    suppliedShares: string;
    valueUsd: string;
    supplyRate: number;
    isCollateral: boolean;
  }>;
  borrowDetails: Array<{
    marketId: string;
    assetSymbol: string;
    borrowedAmount: string;
    borrowedShares: string;
    valueUsd: string;
    borrowRate: number;
    rateMode: string;
    accruedInterest: string;
  }>;
}

interface LendingStats {
  totalMarkets: number;
  activeMarkets: number;
  totalSupplyUsd: string;
  totalBorrowUsd: string;
  avgUtilization: number;
  markets: Array<{
    id: string;
    assetSymbol: string;
    assetName: string;
    totalSupply: string | null;
    totalBorrowed: string | null;
    supplyRate: number;
    borrowRateVariable: number;
    utilizationRate: number;
    collateralFactor: number;
    isActive: boolean;
  }>;
}

interface LendingTransaction {
  id: string;
  txHash: string;
  userAddress: string;
  assetSymbol: string;
  txType: string;
  amount: string;
  amountUsd: string | null;
  status: string;
  createdAt: string | null;
}

interface LendingLiquidation {
  id: string;
  borrowerAddress: string;
  liquidatorAddress: string;
  collateralSymbol: string;
  debtSymbol: string;
  debtRepaid: string;
  collateralSeized: string;
  liquidationBonus: string;
  txHash: string;
  createdAt: string | null;
}

const healthStatusColors: Record<string, string> = {
  healthy: "bg-green-500 text-white",
  at_risk: "bg-yellow-500 text-white",
  liquidatable: "bg-red-500 text-white",
};

const healthStatusLabels: Record<string, string> = {
  healthy: "Healthy",
  at_risk: "At Risk",
  liquidatable: "Liquidatable",
};

const txTypeIcons: Record<string, typeof Plus> = {
  supply: Plus,
  withdraw: Minus,
  borrow: ArrowDownRight,
  repay: ArrowUpRight,
  liquidation: AlertTriangle,
};

const txTypeColors: Record<string, string> = {
  supply: "text-green-500",
  withdraw: "text-orange-500",
  borrow: "text-blue-500",
  repay: "text-purple-500",
  liquidation: "text-red-500",
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
    const wholePart = wei / divisor;
    const fractionalWei = wei % divisor;
    const fractional = Number(fractionalWei) / Number(divisor);
    const total = Number(wholePart) + fractional;
    
    if (total >= 1e9) return `$${(total / 1e9).toFixed(2)}B`;
    if (total >= 1e6) return `$${(total / 1e6).toFixed(2)}M`;
    if (total >= 1e3) return `$${(total / 1e3).toFixed(2)}K`;
    return `$${total.toFixed(2)}`;
  } catch {
    return "$0.00";
  }
}

function formatBps(bps: number): string {
  const percent = bps / 100;
  return `${percent.toFixed(2)}%`;
}

function formatHealthFactor(hf: number): string {
  if (hf >= 100000) return ">1000";
  const value = hf / 10000;
  return value.toFixed(2);
}

function getHealthColor(hf: number): string {
  if (hf < 10000) return "text-red-500";
  if (hf < 15000) return "text-yellow-500";
  return "text-green-500";
}

export default function LendingPage() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const [actionTab, setActionTab] = useState<"supply" | "borrow">("supply");
  const [amount, setAmount] = useState("");
  
  const [lendingStats, setLendingStats] = useState<LendingStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<LendingTransaction[]>([]);
  const [recentLiquidations, setRecentLiquidations] = useState<LendingLiquidation[]>([]);
  const [riskData, setRiskData] = useState<{
    atRiskCount: number;
    liquidatableCount: number;
  } | null>(null);

  const { data: markets, isLoading: marketsLoading, refetch: refetchMarkets } = useQuery<LendingMarket[]>({
    queryKey: ['/api/lending/markets'],
    staleTime: 30000,
  });

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalMarkets: number;
    activeMarkets: number;
    totalSupplyUsd: string;
    totalBorrowUsd: string;
    avgSupplyRate: number;
    avgBorrowRate: number;
    avgUtilization: number;
  }>({
    queryKey: ['/api/lending/stats'],
    staleTime: 10000,
  });

  const selectedMarketData = useMemo(() => {
    return markets?.find(m => m.id === selectedMarket) || null;
  }, [markets, selectedMarket]);

  useEffect(() => {
    const ws = (window as any).__tburnWs;
    if (!ws) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === 'lending_markets') {
          setLendingStats(message.data);
        } else if (message.type === 'lending_transactions') {
          setRecentTransactions(message.data.transactions || []);
        } else if (message.type === 'lending_liquidations') {
          setRecentLiquidations(message.data.liquidations || []);
        } else if (message.type === 'lending_risk_monitor') {
          setRiskData({
            atRiskCount: message.data.atRiskCount || 0,
            liquidatableCount: message.data.liquidatableCount || 0,
          });
        }
      } catch (error) {
        console.error('Error parsing lending WS message:', error);
      }
    };

    ws.addEventListener('message', handleMessage);
    return () => ws.removeEventListener('message', handleMessage);
  }, []);

  const supplyMutation = useMutation({
    mutationFn: async (data: { marketId: string; amount: string }) => {
      return apiRequest('POST', '/api/lending/supply', {
        userAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f1e1E1',
        marketId: data.marketId,
        amount: data.amount,
        useAsCollateral: true,
      });
    },
    onSuccess: () => {
      toast({
        title: "Supply Successful",
        description: "Your assets have been supplied to the lending pool.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/lending/markets'] });
      setAmount("");
    },
    onError: (error: Error) => {
      toast({
        title: "Supply Failed",
        description: error.message || "Failed to supply assets",
        variant: "destructive",
      });
    },
  });

  const borrowMutation = useMutation({
    mutationFn: async (data: { marketId: string; amount: string }) => {
      return apiRequest('POST', '/api/lending/borrow', {
        userAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f1e1E1',
        marketId: data.marketId,
        amount: data.amount,
        rateMode: 'variable',
      });
    },
    onSuccess: () => {
      toast({
        title: "Borrow Successful",
        description: "Assets have been borrowed from the lending pool.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/lending/markets'] });
      setAmount("");
    },
    onError: (error: Error) => {
      toast({
        title: "Borrow Failed",
        description: error.message || "Failed to borrow assets",
        variant: "destructive",
      });
    },
  });

  if (marketsLoading || statsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6" data-testid="lending-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Landmark className="h-8 w-8 text-primary" />
              Lending Protocol
            </h1>
            <p className="text-muted-foreground mt-1">
              Supply assets to earn yield or borrow against your collateral
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => refetchMarkets()}
            data-testid="button-refresh-markets"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Supply</CardTitle>
              <PiggyBank className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-supply">
                {formatUSD(stats?.totalSupplyUsd || lendingStats?.totalSupplyUsd)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.activeMarkets || lendingStats?.activeMarkets || 0} active markets
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Borrowed</CardTitle>
              <CircleDollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-borrowed">
                {formatUSD(stats?.totalBorrowUsd || lendingStats?.totalBorrowUsd)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Avg utilization: {stats?.avgUtilization || lendingStats?.avgUtilization || 0}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Positions at Risk</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-at-risk">
                {riskData?.atRiskCount || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {riskData?.liquidatableCount || 0} liquidatable
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Supply APY</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500" data-testid="text-avg-apy">
                {formatBps(stats?.avgSupplyRate || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Borrow APR: {formatBps(stats?.avgBorrowRate || 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview" data-testid="tab-overview">Markets Overview</TabsTrigger>
            <TabsTrigger value="supply" data-testid="tab-supply">Supply</TabsTrigger>
            <TabsTrigger value="borrow" data-testid="tab-borrow">Borrow</TabsTrigger>
            <TabsTrigger value="activity" data-testid="tab-activity">Activity</TabsTrigger>
            <TabsTrigger value="liquidations" data-testid="tab-liquidations">Liquidations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lending Markets</CardTitle>
                <CardDescription>
                  Overview of all available lending markets and their current rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {markets && markets.length > 0 ? markets.map((market) => (
                      <div 
                        key={market.id} 
                        className="p-4 rounded-lg border hover-elevate cursor-pointer transition-colors"
                        onClick={() => setSelectedMarket(market.id)}
                        data-testid={`market-card-${market.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Coins className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-semibold flex items-center gap-2">
                                {market.assetSymbol}
                                {market.canBeCollateral && (
                                  <Badge variant="outline" className="text-xs">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Collateral
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">{market.assetName}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">Total Supply</div>
                              <div className="font-medium">{formatUSD(market.totalSupply)}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">Total Borrowed</div>
                              <div className="font-medium">{formatUSD(market.totalBorrowed)}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">Supply APY</div>
                              <div className="font-medium text-green-500">{formatBps(market.supplyRate)}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">Borrow APR</div>
                              <div className="font-medium text-blue-500">{formatBps(market.borrowRateVariable)}</div>
                            </div>
                            <div className="text-right w-24">
                              <div className="text-sm text-muted-foreground mb-1">Utilization</div>
                              <Progress value={market.utilizationRate / 100} className="h-2" />
                              <div className="text-xs text-muted-foreground mt-1">{formatBps(market.utilizationRate)}</div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Landmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No lending markets available</p>
                        <p className="text-sm mt-2">Markets will appear once they are created</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="supply" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Supply Assets</CardTitle>
                  <CardDescription>
                    Supply assets to earn yield from borrowers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Market</Label>
                    <Select value={selectedMarket || ""} onValueChange={setSelectedMarket}>
                      <SelectTrigger data-testid="select-supply-market">
                        <SelectValue placeholder="Choose an asset to supply" />
                      </SelectTrigger>
                      <SelectContent>
                        {markets?.filter(m => m.isActive).map((market) => (
                          <SelectItem key={market.id} value={market.id}>
                            <div className="flex items-center gap-2">
                              <span>{market.assetSymbol}</span>
                              <span className="text-muted-foreground">-</span>
                              <span className="text-green-500">{formatBps(market.supplyRate)} APY</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedMarketData && (
                    <>
                      <div className="space-y-2">
                        <Label>Amount to Supply</Label>
                        <div className="relative">
                          <Input
                            type="text"
                            placeholder="0.0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            data-testid="input-supply-amount"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            {selectedMarketData.assetSymbol}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Supply APY</span>
                          <span className="text-green-500 font-medium">{formatBps(selectedMarketData.supplyRate)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Collateral Factor</span>
                          <span>{formatBps(selectedMarketData.collateralFactor)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Available Liquidity</span>
                          <span>{formatWeiToToken(selectedMarketData.availableLiquidity)}</span>
                        </div>
                      </div>

                      <Button 
                        className="w-full" 
                        disabled={!amount || supplyMutation.isPending}
                        onClick={() => {
                          if (selectedMarket && amount) {
                            const weiAmount = BigInt(parseFloat(amount) * 1e18).toString();
                            supplyMutation.mutate({ marketId: selectedMarket, amount: weiAmount });
                          }
                        }}
                        data-testid="button-supply"
                      >
                        {supplyMutation.isPending ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        Supply {selectedMarketData.assetSymbol}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Supply Markets</CardTitle>
                  <CardDescription>Assets available for supplying</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {markets?.filter(m => m.isActive).map((market) => (
                        <div
                          key={market.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedMarket === market.id ? 'border-primary bg-primary/5' : 'hover-elevate'
                          }`}
                          onClick={() => setSelectedMarket(market.id)}
                          data-testid={`supply-market-${market.id}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Coins className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium">{market.assetSymbol}</div>
                                <div className="text-xs text-muted-foreground">{market.assetName}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-green-500 font-medium">{formatBps(market.supplyRate)}</div>
                              <div className="text-xs text-muted-foreground">APY</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="borrow" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Borrow Assets</CardTitle>
                  <CardDescription>
                    Borrow assets against your collateral
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Market</Label>
                    <Select value={selectedMarket || ""} onValueChange={setSelectedMarket}>
                      <SelectTrigger data-testid="select-borrow-market">
                        <SelectValue placeholder="Choose an asset to borrow" />
                      </SelectTrigger>
                      <SelectContent>
                        {markets?.filter(m => m.isActive && m.canBeBorrowed).map((market) => (
                          <SelectItem key={market.id} value={market.id}>
                            <div className="flex items-center gap-2">
                              <span>{market.assetSymbol}</span>
                              <span className="text-muted-foreground">-</span>
                              <span className="text-blue-500">{formatBps(market.borrowRateVariable)} APR</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedMarketData && selectedMarketData.canBeBorrowed && (
                    <>
                      <div className="space-y-2">
                        <Label>Amount to Borrow</Label>
                        <div className="relative">
                          <Input
                            type="text"
                            placeholder="0.0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            data-testid="input-borrow-amount"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            {selectedMarketData.assetSymbol}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Borrow APR (Variable)</span>
                          <span className="text-blue-500 font-medium">{formatBps(selectedMarketData.borrowRateVariable)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Liquidation Threshold</span>
                          <span>{formatBps(selectedMarketData.liquidationThreshold)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Available to Borrow</span>
                          <span>{formatWeiToToken(selectedMarketData.availableLiquidity)}</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-yellow-500">Borrowing Risk</p>
                          <p className="text-muted-foreground">
                            Ensure you maintain a healthy position to avoid liquidation.
                            Liquidation penalty is {formatBps(selectedMarketData.liquidationPenalty)}.
                          </p>
                        </div>
                      </div>

                      <Button 
                        className="w-full" 
                        disabled={!amount || borrowMutation.isPending}
                        onClick={() => {
                          if (selectedMarket && amount) {
                            const weiAmount = BigInt(parseFloat(amount) * 1e18).toString();
                            borrowMutation.mutate({ marketId: selectedMarket, amount: weiAmount });
                          }
                        }}
                        data-testid="button-borrow"
                      >
                        {borrowMutation.isPending ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 mr-2" />
                        )}
                        Borrow {selectedMarketData.assetSymbol}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Borrow Markets</CardTitle>
                  <CardDescription>Assets available for borrowing</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {markets?.filter(m => m.isActive && m.canBeBorrowed).map((market) => (
                        <div
                          key={market.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedMarket === market.id ? 'border-primary bg-primary/5' : 'hover-elevate'
                          }`}
                          onClick={() => setSelectedMarket(market.id)}
                          data-testid={`borrow-market-${market.id}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <CircleDollarSign className="h-4 w-4 text-blue-500" />
                              </div>
                              <div>
                                <div className="font-medium">{market.assetSymbol}</div>
                                <div className="text-xs text-muted-foreground">
                                  Available: {formatWeiToToken(market.availableLiquidity)}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-blue-500 font-medium">{formatBps(market.borrowRateVariable)}</div>
                              <div className="text-xs text-muted-foreground">APR</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest lending protocol activity</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {recentTransactions.length > 0 ? recentTransactions.map((tx) => {
                      const TxIcon = txTypeIcons[tx.txType] || Activity;
                      const txColor = txTypeColors[tx.txType] || "text-muted-foreground";
                      
                      return (
                        <div 
                          key={tx.id}
                          className="flex items-center justify-between p-3 rounded-lg border"
                          data-testid={`tx-${tx.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-full bg-muted flex items-center justify-center ${txColor}`}>
                              <TxIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="font-medium capitalize flex items-center gap-2">
                                {tx.txType}
                                <Badge variant="outline" className="text-xs">
                                  {tx.assetSymbol}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground font-mono">
                                {tx.userAddress.slice(0, 8)}...{tx.userAddress.slice(-6)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatWeiToToken(tx.amount)}</div>
                            <div className="text-sm text-muted-foreground">
                              {tx.amountUsd ? formatUSD(tx.amountUsd) : '-'}
                            </div>
                          </div>
                          <Badge 
                            variant={tx.status === 'completed' ? 'default' : 'secondary'}
                            className="ml-4"
                          >
                            {tx.status === 'completed' ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <Timer className="h-3 w-3 mr-1" />
                            )}
                            {tx.status}
                          </Badge>
                        </div>
                      );
                    }) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No recent transactions</p>
                        <p className="text-sm mt-2">Transactions will appear here in real-time</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="liquidations" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3 mb-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">At Risk Positions</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-500">
                    {riskData?.atRiskCount || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Health factor between 1.0 and 1.5
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Liquidatable</CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">
                    {riskData?.liquidatableCount || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Health factor below 1.0
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recent Liquidations</CardTitle>
                  <Zap className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {recentLiquidations.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    In the last 24 hours
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Liquidation History</CardTitle>
                <CardDescription>Recent liquidation events</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {recentLiquidations.length > 0 ? recentLiquidations.map((liq) => (
                      <div 
                        key={liq.id}
                        className="p-4 rounded-lg border border-red-500/20 bg-red-500/5"
                        data-testid={`liquidation-${liq.id}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            <span className="font-medium">Liquidation Event</span>
                          </div>
                          <Badge variant="destructive">
                            {liq.debtSymbol} / {liq.collateralSymbol}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Borrower</div>
                            <div className="font-mono">{liq.borrowerAddress.slice(0, 10)}...</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Liquidator</div>
                            <div className="font-mono">{liq.liquidatorAddress.slice(0, 10)}...</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Debt Repaid</div>
                            <div className="font-medium">{formatWeiToToken(liq.debtRepaid)} {liq.debtSymbol}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Collateral Seized</div>
                            <div className="font-medium">{formatWeiToToken(liq.collateralSeized)} {liq.collateralSymbol}</div>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-red-500/20 flex items-center justify-between text-sm">
                          <div className="text-muted-foreground">
                            Bonus: {formatWeiToToken(liq.liquidationBonus)} {liq.collateralSymbol}
                          </div>
                          <div className="font-mono text-xs text-muted-foreground">
                            {liq.txHash.slice(0, 18)}...
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No recent liquidations</p>
                        <p className="text-sm mt-2">The protocol is operating healthily</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
