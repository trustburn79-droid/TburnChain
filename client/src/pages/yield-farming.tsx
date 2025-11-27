import { useState, useMemo } from "react";
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
  Sprout,
  Lock,
  Timer,
  Target,
  Layers,
  Bot,
  Sparkles
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

interface YieldVault {
  id: string;
  name: string;
  symbol: string;
  description: string | null;
  contractAddress: string;
  underlyingAsset: string;
  underlyingSymbol: string;
  vaultType: string;
  strategyType: string;
  riskLevel: string;
  totalDeposited: string;
  totalShares: string;
  sharePrice: string;
  tvlUsd: string;
  baseApy: number;
  boostApy: number;
  rewardApy: number;
  totalApy: number;
  depositFee: number;
  withdrawalFee: number;
  performanceFee: number;
  managementFee: number;
  depositCap: string | null;
  minDeposit: string;
  dexPoolId: string | null;
  lendingMarketId: string | null;
  aiOptimized: boolean;
  aiStrategyScore: number;
  aiRiskScore: number;
  status: string;
  totalDepositors: number;
  deposits24h: string;
  withdrawals24h: string;
  harvestCount: number;
  lastHarvestAt: string | null;
}

interface YieldPosition {
  id: string;
  vaultId: string;
  userAddress: string;
  depositedAmount: string;
  shares: string;
  currentValue: string;
  currentValueUsd: string;
  totalProfit: string;
  unrealizedProfit: string;
  realizedProfit: string;
  pendingRewards: string;
  claimedRewards: string;
  boostMultiplier: number;
  isLocked: boolean;
  lockEndTime: string | null;
  lockDurationDays: number;
  status: string;
}

interface YieldStats {
  totalTvlUsd: string;
  totalVaults: number;
  activeVaults: number;
  totalUsers: number;
  avgVaultApy: number;
  topVaultApy: number;
  totalProfitGenerated: string;
  deposits24h: string;
  withdrawals24h: string;
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

const riskColors: Record<string, string> = {
  low: "bg-green-600",
  medium: "bg-yellow-600",
  high: "bg-orange-600",
  degen: "bg-red-600",
};

const vaultTypeLabels: Record<string, string> = {
  auto_compound: "Auto-Compound",
  single_asset: "Single Asset",
  lp_farm: "LP Farm",
  leverage: "Leverage",
  delta_neutral: "Delta Neutral",
};

export default function YieldFarming() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedVault, setSelectedVault] = useState<YieldVault | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawShares, setWithdrawShares] = useState("");
  const [lockDays, setLockDays] = useState("0");

  const userAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f87461";

  const { data: stats, isLoading: statsLoading } = useQuery<YieldStats>({
    queryKey: ["/api/yield/stats"],
  });

  const { data: vaults, isLoading: vaultsLoading } = useQuery<YieldVault[]>({
    queryKey: ["/api/yield/vaults/active"],
  });

  const { data: positions, isLoading: positionsLoading } = useQuery<YieldPosition[]>({
    queryKey: ["/api/yield/positions", userAddress],
  });

  const depositMutation = useMutation({
    mutationFn: async (data: { vaultId: string; amount: string; lockDays: number }) => {
      return apiRequest("/api/yield/deposit", {
        method: "POST",
        body: JSON.stringify({
          userAddress,
          vaultId: data.vaultId,
          amount: data.amount,
          lockDays: data.lockDays,
        }),
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Deposit successful!" });
      queryClient.invalidateQueries({ queryKey: ["/api/yield/vaults/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/yield/positions", userAddress] });
      setDepositAmount("");
      setSelectedVault(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (data: { vaultId: string; shares: string }) => {
      return apiRequest("/api/yield/withdraw", {
        method: "POST",
        body: JSON.stringify({
          userAddress,
          vaultId: data.vaultId,
          shares: data.shares,
        }),
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Withdrawal successful!" });
      queryClient.invalidateQueries({ queryKey: ["/api/yield/vaults/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/yield/positions", userAddress] });
      setWithdrawShares("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const claimMutation = useMutation({
    mutationFn: async (vaultId: string) => {
      return apiRequest("/api/yield/claim-rewards", {
        method: "POST",
        body: JSON.stringify({ userAddress, vaultId }),
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Rewards claimed!" });
      queryClient.invalidateQueries({ queryKey: ["/api/yield/positions", userAddress] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const totalUserValue = useMemo(() => {
    if (!positions) return BigInt(0);
    return positions.reduce((sum, p) => sum + BigInt(p.currentValue || "0"), BigInt(0));
  }, [positions]);

  const totalPendingRewards = useMemo(() => {
    if (!positions) return BigInt(0);
    return positions.reduce((sum, p) => sum + BigInt(p.pendingRewards || "0"), BigInt(0));
  }, [positions]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-yield-title">
            <Sprout className="h-8 w-8 text-green-500" />
            Yield Farming
          </h1>
          <p className="text-muted-foreground mt-1">
            Maximize your yields with AI-optimized farming strategies
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Bot className="h-4 w-4 mr-2" />
          AI-Enhanced
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
                  <p className="text-sm text-muted-foreground">Total Value Locked</p>
                  <p className="text-2xl font-bold" data-testid="text-total-tvl">
                    {formatUsd(stats.totalTvlUsd)}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-500/10">
                  <DollarSign className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Vaults</p>
                  <p className="text-2xl font-bold" data-testid="text-active-vaults">
                    {stats.activeVaults} / {stats.totalVaults}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-500/10">
                  <Layers className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Top Vault APY</p>
                  <p className="text-2xl font-bold text-green-500" data-testid="text-top-apy">
                    {formatApy(stats.topVaultApy)}
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
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold" data-testid="text-total-users">
                    {formatNumber(stats.totalUsers)}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-purple-500/10">
                  <Activity className="h-6 w-6 text-purple-500" />
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
          <TabsTrigger value="vaults" data-testid="tab-vaults">
            <Layers className="h-4 w-4 mr-2" />
            Vaults
          </TabsTrigger>
          <TabsTrigger value="deposit" data-testid="tab-deposit">
            <Plus className="h-4 w-4 mr-2" />
            Deposit
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
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  Top Performing Vaults
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {vaultsLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : vaults && vaults.length > 0 ? (
                    <div className="space-y-3">
                      {vaults.slice(0, 5).map((vault) => (
                        <div
                          key={vault.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover-elevate cursor-pointer"
                          onClick={() => {
                            setSelectedVault(vault);
                            setActiveTab("deposit");
                          }}
                          data-testid={`vault-card-${vault.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/10">
                              <Coins className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{vault.name}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {vaultTypeLabels[vault.vaultType] || vault.vaultType}
                                </Badge>
                                <Badge className={`text-xs ${riskColors[vault.riskLevel]}`}>
                                  {vault.riskLevel}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-500">{formatApy(vault.totalApy)}</p>
                            <p className="text-sm text-muted-foreground">TVL: {formatUsd(vault.tvlUsd)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <Sprout className="h-12 w-12 mb-2" />
                      <p>No vaults available</p>
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
                    <p className="text-sm text-muted-foreground">Total Value</p>
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

        <TabsContent value="vaults" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Vaults</CardTitle>
              <CardDescription>Browse and compare yield farming opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              {vaultsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : vaults && vaults.length > 0 ? (
                <div className="space-y-4">
                  {vaults.map((vault) => (
                    <div
                      key={vault.id}
                      className="p-4 rounded-lg border hover-elevate cursor-pointer"
                      onClick={() => {
                        setSelectedVault(vault);
                        setActiveTab("deposit");
                      }}
                      data-testid={`vault-row-${vault.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-full bg-primary/10">
                            <Coins className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{vault.name}</h3>
                              {vault.aiOptimized && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Bot className="h-4 w-4 text-blue-500" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      AI-Optimized Strategy (Score: {vault.aiStrategyScore / 100}%)
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{vault.underlyingSymbol}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {vaultTypeLabels[vault.vaultType] || vault.vaultType}
                              </Badge>
                              <Badge className={`text-xs ${riskColors[vault.riskLevel]}`}>
                                {vault.riskLevel}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-8 text-right">
                          <div>
                            <p className="text-sm text-muted-foreground">Total APY</p>
                            <p className="font-bold text-green-500 text-lg">{formatApy(vault.totalApy)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">TVL</p>
                            <p className="font-medium">{formatUsd(vault.tvlUsd)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Depositors</p>
                            <p className="font-medium">{formatNumber(vault.totalDepositors)}</p>
                          </div>
                          <div>
                            <Button size="sm" data-testid={`button-deposit-${vault.id}`}>
                              Deposit
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Sprout className="h-16 w-16 mx-auto mb-4" />
                  <p className="text-lg font-medium">No vaults available</p>
                  <p className="text-sm">Check back later for new farming opportunities</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deposit" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Vault</CardTitle>
                <CardDescription>Choose a vault to deposit into</CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedVault?.id || ""}
                  onValueChange={(value) => {
                    const vault = vaults?.find(v => v.id === value);
                    setSelectedVault(vault || null);
                  }}
                >
                  <SelectTrigger data-testid="select-vault">
                    <SelectValue placeholder="Select a vault" />
                  </SelectTrigger>
                  <SelectContent>
                    {vaults?.map((vault) => (
                      <SelectItem key={vault.id} value={vault.id}>
                        {vault.name} - {formatApy(vault.totalApy)} APY
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedVault && (
                  <div className="mt-4 p-4 rounded-lg bg-muted/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Vault</span>
                      <span className="font-medium">{selectedVault.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Asset</span>
                      <span>{selectedVault.underlyingSymbol}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total APY</span>
                      <span className="text-green-500 font-bold">{formatApy(selectedVault.totalApy)}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Base APY</span>
                      <span>{formatApy(selectedVault.baseApy)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Boost APY</span>
                      <span className="text-blue-500">{formatApy(selectedVault.boostApy)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Reward APY</span>
                      <span className="text-purple-500">{formatApy(selectedVault.rewardApy)}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Deposit Fee</span>
                      <span>{formatApy(selectedVault.depositFee)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Withdrawal Fee</span>
                      <span>{formatApy(selectedVault.withdrawalFee)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Performance Fee</span>
                      <span>{formatApy(selectedVault.performanceFee)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deposit Amount</CardTitle>
                <CardDescription>Enter the amount you want to deposit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="0.0"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      data-testid="input-deposit-amount"
                    />
                    <Button variant="outline" onClick={() => setDepositAmount("1000000000000000000000")}>
                      Max
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Lock Duration (Optional Boost)</Label>
                  <Select value={lockDays} onValueChange={setLockDays}>
                    <SelectTrigger data-testid="select-lock-days">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No Lock (1x)</SelectItem>
                      <SelectItem value="7">7 Days (1.05x)</SelectItem>
                      <SelectItem value="30">30 Days (1.15x)</SelectItem>
                      <SelectItem value="90">90 Days (1.30x)</SelectItem>
                      <SelectItem value="180">180 Days (1.50x)</SelectItem>
                      <SelectItem value="365">365 Days (1.75x)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  disabled={!selectedVault || !depositAmount || depositMutation.isPending}
                  onClick={() => {
                    if (selectedVault && depositAmount) {
                      depositMutation.mutate({
                        vaultId: selectedVault.id,
                        amount: depositAmount,
                        lockDays: parseInt(lockDays),
                      });
                    }
                  }}
                  data-testid="button-confirm-deposit"
                >
                  {depositMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Deposit
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Positions</CardTitle>
              <CardDescription>Manage your active farming positions</CardDescription>
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
                    const vault = vaults?.find(v => v.id === position.vaultId);
                    return (
                      <div
                        key={position.id}
                        className="p-4 rounded-lg border"
                        data-testid={`position-${position.id}`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/10">
                              <Coins className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold">{vault?.name || "Unknown Vault"}</p>
                              <div className="flex items-center gap-2">
                                {position.isLocked && (
                                  <Badge variant="outline" className="text-xs">
                                    <Lock className="h-3 w-3 mr-1" />
                                    Locked
                                  </Badge>
                                )}
                                {position.boostMultiplier > 10000 && (
                                  <Badge className="text-xs bg-blue-600">
                                    {(position.boostMultiplier / 100).toFixed(0)}% Boost
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{formatWeiToToken(position.currentValue)}</p>
                            <p className="text-sm text-muted-foreground">
                              Deposited: {formatWeiToToken(position.depositedAmount)}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Unrealized P/L</p>
                            <p className={`font-medium ${BigInt(position.unrealizedProfit) >= 0 ? "text-green-500" : "text-red-500"}`}>
                              {formatWeiToToken(position.unrealizedProfit)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Pending Rewards</p>
                            <p className="font-medium text-green-500">{formatWeiToToken(position.pendingRewards)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Shares</p>
                            <p className="font-medium">{formatWeiToToken(position.shares)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Boost</p>
                            <p className="font-medium">{(position.boostMultiplier / 100).toFixed(0)}%</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={position.isLocked || claimMutation.isPending}
                            onClick={() => claimMutation.mutate(position.vaultId)}
                            data-testid={`button-claim-${position.id}`}
                          >
                            <DollarSign className="h-4 w-4 mr-1" />
                            Claim Rewards
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={position.isLocked || withdrawMutation.isPending}
                            onClick={() => {
                              setWithdrawShares(position.shares);
                              withdrawMutation.mutate({
                                vaultId: position.vaultId,
                                shares: position.shares,
                              });
                            }}
                            data-testid={`button-withdraw-${position.id}`}
                          >
                            <Minus className="h-4 w-4 mr-1" />
                            Withdraw All
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
                  <p className="text-sm">Start farming by depositing into a vault</p>
                  <Button
                    className="mt-4"
                    onClick={() => setActiveTab("vaults")}
                    data-testid="button-browse-vaults"
                  >
                    Browse Vaults
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
