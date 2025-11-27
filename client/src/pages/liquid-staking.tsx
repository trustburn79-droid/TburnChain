import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  TrendingUp,
  Activity,
  Wallet,
  BarChart3,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  DollarSign,
  Plus,
  Minus,
  Droplets,
  Layers,
  Bot,
  Shield,
  Users,
  ArrowRightLeft,
  Clock,
  Percent
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

interface LiquidStakingPool {
  id: string;
  name: string;
  symbol: string;
  description: string | null;
  contractAddress: string;
  lstTokenAddress: string;
  lstTokenSymbol: string;
  underlyingAsset: string;
  underlyingSymbol: string;
  exchangeRate: string;
  totalStaked: string;
  totalStakedUsd: string;
  totalLstMinted: string;
  validatorCount: number;
  currentApy: number;
  avgApy7d: number;
  avgApy30d: number;
  mintFee: number;
  redeemFee: number;
  performanceFee: number;
  minMintAmount: string;
  status: string;
  isPaused: boolean;
  aiOptimized: boolean;
  totalStakers: number;
  mints24h: string;
  redeems24h: string;
  lastRebaseAt: string | null;
}

interface LstPosition {
  id: string;
  poolId: string;
  userAddress: string;
  lstBalance: string;
  lstBalanceUsd: string;
  underlyingValue: string;
  underlyingValueUsd: string;
  totalMinted: string;
  totalRedeemed: string;
  avgMintPrice: string;
  accumulatedRewards: string;
  claimedRewards: string;
  pendingRewards: string;
  mintCount: number;
  redeemCount: number;
  status: string;
}

interface LstStats {
  totalStakedUsd: string;
  totalPools: number;
  activePools: number;
  totalStakers: number;
  avgPoolApy: number;
  topPoolApy: number;
  totalLstMinted: string;
  mints24h: string;
  redeems24h: string;
}

function formatWeiToToken(weiStr: string, decimals: number = 18): string {
  try {
    const wei = BigInt(weiStr || "0");
    const divisor = BigInt(10 ** decimals);
    const whole = wei / divisor;
    const remainder = wei % divisor;
    const decimal = remainder.toString().padStart(decimals, '0').slice(0, 4);
    return `${whole.toLocaleString()}.${decimal}`;
  } catch {
    return "0.0000";
  }
}

function formatUsd(value: string): string {
  try {
    const num = parseFloat(value) / 1e18;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  } catch {
    return "$0.00";
  }
}

function formatApy(basisPoints: number): string {
  return `${(basisPoints / 100).toFixed(2)}%`;
}

function formatExchangeRate(rate: string): string {
  try {
    const rateNum = parseFloat(rate) / 1e18;
    return rateNum.toFixed(6);
  } catch {
    return "1.000000";
  }
}

export default function LiquidStaking() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPool, setSelectedPool] = useState<LiquidStakingPool | null>(null);
  const [mintAmount, setMintAmount] = useState("");
  const [redeemAmount, setRedeemAmount] = useState("");
  const [mintDialogOpen, setMintDialogOpen] = useState(false);
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const [dialogPool, setDialogPool] = useState<LiquidStakingPool | null>(null);

  const userAddress = "0xTBURNEnterprise7f3a9c4d2e1b8f6a0c3d5e9b4a2f8c1d7e0b3a6f";

  const { data: stats, isLoading: statsLoading } = useQuery<LstStats>({
    queryKey: ["/api/liquid-staking/stats"],
  });

  const { data: pools, isLoading: poolsLoading } = useQuery<LiquidStakingPool[]>({
    queryKey: ["/api/liquid-staking/pools/active"],
  });

  const { data: positions, isLoading: positionsLoading } = useQuery<LstPosition[]>({
    queryKey: ["/api/liquid-staking/positions", userAddress],
  });

  const mintMutation = useMutation({
    mutationFn: async (data: { poolId: string; underlyingAmount: string }) => {
      return apiRequest("POST", "/api/liquid-staking/mint", {
        userAddress,
        poolId: data.poolId,
        underlyingAmount: data.underlyingAmount,
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "LST tokens minted successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/liquid-staking/pools/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/liquid-staking/positions", userAddress] });
      queryClient.invalidateQueries({ queryKey: ["/api/liquid-staking/stats"] });
      setMintAmount("");
      setSelectedPool(null);
      setMintDialogOpen(false);
      setDialogPool(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const redeemMutation = useMutation({
    mutationFn: async (data: { poolId: string; lstAmount: string }) => {
      return apiRequest("POST", "/api/liquid-staking/redeem", {
        userAddress,
        poolId: data.poolId,
        lstAmount: data.lstAmount,
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "LST tokens redeemed successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/liquid-staking/pools/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/liquid-staking/positions", userAddress] });
      queryClient.invalidateQueries({ queryKey: ["/api/liquid-staking/stats"] });
      setRedeemAmount("");
      setRedeemDialogOpen(false);
      setDialogPool(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const claimMutation = useMutation({
    mutationFn: async (poolId: string) => {
      return apiRequest("POST", "/api/liquid-staking/claim-rewards", {
        userAddress,
        poolId,
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Rewards claimed!" });
      queryClient.invalidateQueries({ queryKey: ["/api/liquid-staking/positions", userAddress] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const totalUserValue = useMemo(() => {
    if (!positions) return BigInt(0);
    return positions.reduce((sum, p) => sum + BigInt(p.underlyingValue || "0"), BigInt(0));
  }, [positions]);

  const totalPendingRewards = useMemo(() => {
    if (!positions) return BigInt(0);
    return positions.reduce((sum, p) => sum + BigInt(p.pendingRewards || "0"), BigInt(0));
  }, [positions]);

  const openMintDialog = (pool: LiquidStakingPool) => {
    setDialogPool(pool);
    setMintAmount("");
    setMintDialogOpen(true);
  };

  const openRedeemDialog = (pool: LiquidStakingPool, defaultAmount?: string) => {
    setDialogPool(pool);
    setRedeemAmount(defaultAmount || "");
    setRedeemDialogOpen(true);
  };

  const handleMintSubmit = () => {
    if (dialogPool && mintAmount) {
      mintMutation.mutate({
        poolId: dialogPool.id,
        underlyingAmount: mintAmount,
      });
    }
  };

  const handleRedeemSubmit = () => {
    if (dialogPool && redeemAmount) {
      redeemMutation.mutate({
        poolId: dialogPool.id,
        lstAmount: redeemAmount,
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-lst-title">
            <Droplets className="h-8 w-8 text-blue-500" />
            Liquid Staking
          </h1>
          <p className="text-muted-foreground mt-1">
            Stake assets and receive liquid staking tokens with automatic yield
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Bot className="h-4 w-4 mr-2" />
          AI-Optimized
        </Badge>
      </div>

      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value Staked</p>
                  <p className="text-2xl font-bold" data-testid="text-total-staked">
                    {formatUsd(stats.totalStakedUsd)}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-500/10">
                  <DollarSign className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Pools</p>
                  <p className="text-2xl font-bold" data-testid="text-active-pools">
                    {stats.activePools} / {stats.totalPools}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-purple-500/10">
                  <Layers className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Top Pool APY</p>
                  <p className="text-2xl font-bold text-green-500" data-testid="text-top-apy">
                    {formatApy(stats.topPoolApy)}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-500/10">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Stakers</p>
                  <p className="text-2xl font-bold" data-testid="text-total-stakers">
                    {formatNumber(stats.totalStakers)}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-orange-500/10">
                  <Users className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="overview" data-testid="tab-overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="pools" data-testid="tab-pools">
            <Layers className="h-4 w-4 mr-2" />
            Pools
          </TabsTrigger>
          <TabsTrigger value="stake" data-testid="tab-stake">
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Stake/Unstake
          </TabsTrigger>
          <TabsTrigger value="positions" data-testid="tab-positions">
            <Wallet className="h-4 w-4 mr-2" />
            My Positions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-blue-500" />
                  Top LST Pools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {poolsLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : pools && pools.length > 0 ? (
                    <div className="space-y-3">
                      {pools.slice(0, 5).map((pool) => (
                        <div
                          key={pool.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover-elevate cursor-pointer"
                          onClick={() => openMintDialog(pool)}
                          data-testid={`pool-card-${pool.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-blue-500/10">
                              <Droplets className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                              <p className="font-medium">{pool.name}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {pool.lstTokenSymbol}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {pool.validatorCount} validators
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-500">{formatApy(pool.currentApy)}</p>
                            <p className="text-sm text-muted-foreground">TVL: {formatUsd(pool.totalStakedUsd)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <Droplets className="h-12 w-12 mb-2" />
                      <p>No pools available</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-blue-500" />
                  Your Portfolio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Total Underlying Value</p>
                    <p className="text-3xl font-bold">{formatWeiToToken(totalUserValue.toString())} TBURN</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Pending Rewards</p>
                    <p className="text-2xl font-bold text-green-500">
                      {formatWeiToToken(totalPendingRewards.toString())} TBURN
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Active Positions</p>
                    <p className="text-2xl font-bold">
                      {positions?.filter(p => p.status === "active").length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All LST Pools</CardTitle>
              <CardDescription>Browse and compare liquid staking opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              {poolsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : pools && pools.length > 0 ? (
                <div className="space-y-4">
                  {pools.map((pool) => (
                    <div
                      key={pool.id}
                      className="p-4 rounded-lg border hover-elevate cursor-pointer"
                      onClick={() => openMintDialog(pool)}
                      data-testid={`pool-row-${pool.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-full bg-blue-500/10">
                            <Droplets className="h-6 w-6 text-blue-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{pool.name}</h3>
                              {pool.aiOptimized && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Bot className="h-4 w-4 text-blue-500" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      AI-Optimized Validator Selection
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {pool.underlyingSymbol} → {pool.lstTokenSymbol}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                <Shield className="h-3 w-3 mr-1" />
                                {pool.validatorCount} validators
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Rate: {formatExchangeRate(pool.exchangeRate)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-8 text-right">
                          <div>
                            <p className="text-sm text-muted-foreground">APY</p>
                            <p className="font-bold text-green-500 text-lg">{formatApy(pool.currentApy)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">TVL</p>
                            <p className="font-medium">{formatUsd(pool.totalStakedUsd)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Stakers</p>
                            <p className="font-medium">{formatNumber(pool.totalStakers)}</p>
                          </div>
                          <div>
                            <Button 
                              size="sm" 
                              data-testid={`button-stake-${pool.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                openMintDialog(pool);
                              }}
                            >
                              Stake
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Droplets className="h-16 w-16 mx-auto mb-4" />
                  <p className="text-lg font-medium">No pools available</p>
                  <p className="text-sm">Check back later for new liquid staking opportunities</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stake" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Pool</CardTitle>
                <CardDescription>Choose a pool to stake into</CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedPool?.id || ""}
                  onValueChange={(value) => {
                    const pool = pools?.find(p => p.id === value);
                    setSelectedPool(pool || null);
                  }}
                >
                  <SelectTrigger data-testid="select-pool">
                    <SelectValue placeholder="Select a pool" />
                  </SelectTrigger>
                  <SelectContent>
                    {pools?.map((pool) => (
                      <SelectItem key={pool.id} value={pool.id}>
                        {pool.name} - {formatApy(pool.currentApy)} APY
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedPool && (
                  <div className="mt-4 p-4 rounded-lg bg-muted/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Pool</span>
                      <span className="font-medium">{selectedPool.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">LST Token</span>
                      <span>{selectedPool.lstTokenSymbol}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Exchange Rate</span>
                      <span>{formatExchangeRate(selectedPool.exchangeRate)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Current APY</span>
                      <span className="text-green-500 font-bold">{formatApy(selectedPool.currentApy)}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Mint Fee</span>
                      <span>{formatApy(selectedPool.mintFee)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Redeem Fee</span>
                      <span>{formatApy(selectedPool.redeemFee)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Performance Fee</span>
                      <span>{formatApy(selectedPool.performanceFee)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stake / Unstake</CardTitle>
                <CardDescription>Mint or redeem LST tokens</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Stake Amount (Mint LST)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="0.0"
                      value={mintAmount}
                      onChange={(e) => setMintAmount(e.target.value)}
                      data-testid="input-mint-amount"
                    />
                    <Button variant="outline" onClick={() => setMintAmount("1000000000000000000000")}>
                      Max
                    </Button>
                  </div>
                  <Button
                    className="w-full"
                    disabled={!selectedPool || !mintAmount || mintMutation.isPending}
                    onClick={() => {
                      if (selectedPool && mintAmount) {
                        mintMutation.mutate({
                          poolId: selectedPool.id,
                          underlyingAmount: mintAmount,
                        });
                      }
                    }}
                    data-testid="button-confirm-mint"
                  >
                    {mintMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Minting...
                      </>
                    ) : (
                      <>
                        <ArrowUpRight className="h-4 w-4 mr-2" />
                        Stake & Mint LST
                      </>
                    )}
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Unstake Amount (Redeem LST)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="0.0"
                      value={redeemAmount}
                      onChange={(e) => setRedeemAmount(e.target.value)}
                      data-testid="input-redeem-amount"
                    />
                    <Button variant="outline" onClick={() => setRedeemAmount("1000000000000000000000")}>
                      Max
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={!selectedPool || !redeemAmount || redeemMutation.isPending}
                    onClick={() => {
                      if (selectedPool && redeemAmount) {
                        redeemMutation.mutate({
                          poolId: selectedPool.id,
                          lstAmount: redeemAmount,
                        });
                      }
                    }}
                    data-testid="button-confirm-redeem"
                  >
                    {redeemMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Redeeming...
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="h-4 w-4 mr-2" />
                        Unstake & Redeem
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Positions</CardTitle>
              <CardDescription>Manage your liquid staking positions</CardDescription>
            </CardHeader>
            <CardContent>
              {positionsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : positions && positions.length > 0 ? (
                <div className="space-y-4">
                  {positions.filter(p => p.status === "active").map((position) => {
                    const pool = pools?.find(p => p.id === position.poolId);
                    return (
                      <div
                        key={position.id}
                        className="p-4 rounded-lg border"
                        data-testid={`position-${position.id}`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-blue-500/10">
                              <Droplets className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                              <p className="font-semibold">{pool?.name || "Unknown Pool"}</p>
                              <Badge variant="outline" className="text-xs">
                                {pool?.lstTokenSymbol || "LST"}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{formatWeiToToken(position.lstBalance)}</p>
                            <p className="text-sm text-muted-foreground">
                              ≈ {formatWeiToToken(position.underlyingValue)} {pool?.underlyingSymbol || "TBURN"}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Minted</p>
                            <p className="font-medium">{formatWeiToToken(position.totalMinted)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Pending Rewards</p>
                            <p className="font-medium text-green-500">{formatWeiToToken(position.pendingRewards)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Claimed Rewards</p>
                            <p className="font-medium">{formatWeiToToken(position.claimedRewards)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Mint Count</p>
                            <p className="font-medium">{position.mintCount}</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={claimMutation.isPending}
                            onClick={() => claimMutation.mutate(position.poolId)}
                            data-testid={`button-claim-${position.id}`}
                          >
                            <DollarSign className="h-4 w-4 mr-1" />
                            Claim Rewards
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (pool) {
                                openRedeemDialog(pool, position.lstBalance);
                              }
                            }}
                            data-testid={`button-unstake-${position.id}`}
                          >
                            <Minus className="h-4 w-4 mr-1" />
                            Unstake
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Wallet className="h-16 w-16 mx-auto mb-4" />
                  <p className="text-lg font-medium">No active positions</p>
                  <p className="text-sm">Stake assets to receive liquid staking tokens</p>
                  <Button
                    className="mt-4"
                    onClick={() => setActiveTab("pools")}
                    data-testid="button-browse-pools"
                  >
                    Browse Pools
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={mintDialogOpen} onOpenChange={setMintDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-500" />
              Stake & Mint LST
            </DialogTitle>
            <DialogDescription>
              Stake your tokens and receive liquid staking tokens in return
            </DialogDescription>
          </DialogHeader>
          
          {dialogPool && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pool</span>
                  <span className="font-medium">{dialogPool.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">LST Token</span>
                  <Badge variant="outline">{dialogPool.lstTokenSymbol}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Exchange Rate</span>
                  <span>1 {dialogPool.underlyingSymbol} = {formatExchangeRate(dialogPool.exchangeRate)} {dialogPool.lstTokenSymbol}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current APY</span>
                  <span className="text-green-500 font-bold">{formatApy(dialogPool.currentApy)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Mint Fee</span>
                  <span>{formatApy(dialogPool.mintFee)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mint-amount">Amount to Stake ({dialogPool.underlyingSymbol})</Label>
                <div className="flex gap-2">
                  <Input
                    id="mint-amount"
                    type="text"
                    placeholder="Enter amount in wei"
                    value={mintAmount}
                    onChange={(e) => setMintAmount(e.target.value)}
                    data-testid="input-dialog-mint-amount"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => setMintAmount("1000000000000000000000")}
                    data-testid="button-max-mint"
                  >
                    Max
                  </Button>
                </div>
                {mintAmount && (
                  <p className="text-sm text-muted-foreground">
                    You will receive approximately {formatWeiToToken(
                      (BigInt(mintAmount || "0") * BigInt(10**18) / BigInt(dialogPool.exchangeRate || "1000000000000000000")).toString()
                    )} {dialogPool.lstTokenSymbol}
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setMintDialogOpen(false)}
              data-testid="button-cancel-mint"
            >
              Cancel
            </Button>
            <Button
              disabled={!dialogPool || !mintAmount || mintMutation.isPending}
              onClick={handleMintSubmit}
              data-testid="button-submit-mint"
            >
              {mintMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Minting...
                </>
              ) : (
                <>
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Stake & Mint
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={redeemDialogOpen} onOpenChange={setRedeemDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowDownRight className="h-5 w-5 text-orange-500" />
              Unstake & Redeem
            </DialogTitle>
            <DialogDescription>
              Redeem your LST tokens back to the underlying asset
            </DialogDescription>
          </DialogHeader>
          
          {dialogPool && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pool</span>
                  <span className="font-medium">{dialogPool.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">LST Token</span>
                  <Badge variant="outline">{dialogPool.lstTokenSymbol}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Exchange Rate</span>
                  <span>1 {dialogPool.lstTokenSymbol} = {formatExchangeRate(dialogPool.exchangeRate)} {dialogPool.underlyingSymbol}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Redeem Fee</span>
                  <span>{formatApy(dialogPool.redeemFee)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="redeem-amount">Amount to Redeem ({dialogPool.lstTokenSymbol})</Label>
                <div className="flex gap-2">
                  <Input
                    id="redeem-amount"
                    type="text"
                    placeholder="Enter amount in wei"
                    value={redeemAmount}
                    onChange={(e) => setRedeemAmount(e.target.value)}
                    data-testid="input-dialog-redeem-amount"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => setRedeemAmount("1000000000000000000000")}
                    data-testid="button-max-redeem"
                  >
                    Max
                  </Button>
                </div>
                {redeemAmount && (
                  <p className="text-sm text-muted-foreground">
                    You will receive approximately {formatWeiToToken(
                      (BigInt(redeemAmount || "0") * BigInt(dialogPool.exchangeRate || "1000000000000000000") / BigInt(10**18)).toString()
                    )} {dialogPool.underlyingSymbol}
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setRedeemDialogOpen(false)}
              data-testid="button-cancel-redeem"
            >
              Cancel
            </Button>
            <Button
              disabled={!dialogPool || !redeemAmount || redeemMutation.isPending}
              onClick={handleRedeemSubmit}
              data-testid="button-submit-redeem"
            >
              {redeemMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Redeeming...
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-4 w-4 mr-2" />
                  Unstake & Redeem
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
