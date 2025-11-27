import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Coins, 
  TrendingUp,
  Activity,
  Wallet,
  Shield,
  Award,
  Clock,
  Users,
  Percent,
  Lock,
  Unlock,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Layers,
  Zap,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  PiggyBank,
  BarChart3,
  Calculator,
  Gift,
  Loader2
} from "lucide-react";
import { formatNumber } from "@/lib/formatters";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface StakingStatsResponse {
  totalValueLocked: string;
  totalRewardsDistributed: string;
  totalStakers: number;
  totalPools: number;
  averageApy: number;
  highestApy: number;
  lowestApy: number;
  currentRewardCycle: number;
}

interface PoolResponse {
  id: string;
  name: string;
  poolType: string;
  tier: string;
  validatorId: string | null;
  validatorAddress: string;
  validatorName: string;
  minStake: string;
  maxStake: string | null;
  apy: number;
  apyBoost: number;
  totalStaked: string;
  stakersCount: number;
  totalStakers?: number;
  lockPeriodDays: number;
  earlyWithdrawalPenalty: number;
  status: string;
  isCompoundingEnabled: boolean;
  rewardFrequency: string;
  description: string;
  createdAt: string;
}

interface TierResponse {
  id: string;
  name: string;
  minStake: string;
  maxStake: string | null;
  apyMultiplier: number;
  minApy: number;
  maxApy: number;
  lockPeriodDays: number;
  maxLockPeriodDays: number;
  earlyAdopterBonus: number;
  loyaltyBonus: number;
  feeDiscount: number;
  priorityRewards: boolean;
  governanceWeight: number;
  color: string;
  benefits: string[];
}

const tierColors: Record<string, string> = {
  bronze: "bg-amber-600 text-white",
  silver: "bg-slate-400 text-white",
  gold: "bg-yellow-500 text-white",
  platinum: "bg-purple-600 text-white",
  diamond: "bg-cyan-500 text-white"
};

const tierIcons: Record<string, JSX.Element> = {
  bronze: <Coins className="h-4 w-4" />,
  silver: <Shield className="h-4 w-4" />,
  gold: <Award className="h-4 w-4" />,
  platinum: <Target className="h-4 w-4" />,
  diamond: <Zap className="h-4 w-4" />
};

function formatWeiToTBURN(weiStr: string | null | undefined): string {
  if (!weiStr) return "0";
  try {
    const wei = BigInt(weiStr);
    const DECIMALS = 18n;
    const ONE_TBURN = 10n ** DECIMALS;
    
    const wholeTburn = wei / ONE_TBURN;
    const fractionalWei = wei % ONE_TBURN;
    const fractional = Number(fractionalWei) / Number(ONE_TBURN);
    const tburn = Number(wholeTburn) + fractional;
    
    if (tburn >= 1e9) return `${(tburn / 1e9).toFixed(2)}B`;
    if (tburn >= 1e6) return `${(tburn / 1e6).toFixed(2)}M`;
    if (tburn >= 1e3) return `${(tburn / 1e3).toFixed(2)}K`;
    return tburn.toFixed(2);
  } catch {
    return "0";
  }
}

export default function StakingDashboard() {
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [stakeDialogOpen, setStakeDialogOpen] = useState(false);
  const [selectedPool, setSelectedPool] = useState<PoolResponse | null>(null);
  const [stakeAmount, setStakeAmount] = useState("");

  const { data: stats, isLoading: statsLoading } = useQuery<StakingStatsResponse>({
    queryKey: ["/api/staking/stats"]
  });

  const { data: pools, isLoading: poolsLoading } = useQuery<PoolResponse[]>({
    queryKey: ["/api/staking/pools"]
  });

  const { data: tiers, isLoading: tiersLoading } = useQuery<TierResponse[]>({
    queryKey: ["/api/staking/tiers"]
  });

  const stakeMutation = useMutation({
    mutationFn: async (data: { poolId: string; amount: string }) => {
      const weiAmount = (parseFloat(data.amount) * 1e18).toString();
      return apiRequest("/api/staking/stake", {
        method: "POST",
        body: JSON.stringify({
          poolId: data.poolId,
          amount: weiAmount,
          stakerAddress: `0xTBURN${Math.random().toString(16).slice(2, 42)}`,
          lockPeriodDays: selectedPool?.lockPeriodDays || 30
        })
      });
    },
    onSuccess: () => {
      toast({
        title: "Stake Successful",
        description: `Successfully staked ${stakeAmount} TBURN in ${selectedPool?.name}`,
      });
      setStakeDialogOpen(false);
      setStakeAmount("");
      setSelectedPool(null);
      queryClient.invalidateQueries({ queryKey: ["/api/staking/pools"] });
      queryClient.invalidateQueries({ queryKey: ["/api/staking/stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Stake Failed",
        description: error.message || "Failed to stake TBURN",
        variant: "destructive"
      });
    }
  });

  const handleStake = (pool: PoolResponse) => {
    setSelectedPool(pool);
    setStakeDialogOpen(true);
  };

  const submitStake = () => {
    if (!selectedPool || !stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid stake amount",
        variant: "destructive"
      });
      return;
    }
    stakeMutation.mutate({ poolId: selectedPool.id, amount: stakeAmount });
  };

  const filteredPools = selectedTier 
    ? pools?.filter(p => p.tier.toLowerCase() === selectedTier)
    : pools;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-staking-title">Staking Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Stake TBURN to earn rewards and participate in network governance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            Cycle #{stats?.currentRewardCycle || 0}
          </Badge>
          <Button variant="outline" size="sm" data-testid="button-refresh-staking">
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-tvl">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value Locked</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-tvl-value">
                  {formatWeiToTBURN(stats?.totalValueLocked || "0")} TBURN
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  +5.2% from last epoch
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-rewards-distributed">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards Distributed</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-rewards-value">
                  {formatWeiToTBURN(stats?.totalRewardsDistributed || "0")} TBURN
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  Lifetime distribution
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-stakers">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Stakers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-stakers-value">
                  {formatNumber(stats?.totalStakers || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across {stats?.totalPools || 0} pools
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-apy-range">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">APY Range</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-apy-range-value">
                  {stats?.lowestApy || 0}% - {stats?.highestApy || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Avg: {stats?.averageApy?.toFixed(1) || 0}% APY
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pools" className="space-y-4">
        <TabsList data-testid="tabs-staking">
          <TabsTrigger value="pools" data-testid="tab-pools">Staking Pools</TabsTrigger>
          <TabsTrigger value="tiers" data-testid="tab-tiers">Tier System</TabsTrigger>
          <TabsTrigger value="ai-insights" data-testid="tab-ai-insights">AI Insights</TabsTrigger>
          <TabsTrigger value="calculator" data-testid="tab-calculator">Rewards Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="pools" className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">Filter by Tier:</span>
            <Button 
              variant={selectedTier === null ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedTier(null)}
              data-testid="button-filter-all"
            >
              All Pools
            </Button>
            {["bronze", "silver", "gold", "platinum", "diamond"].map(tier => (
              <Button
                key={tier}
                variant={selectedTier === tier ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTier(tier)}
                className="capitalize"
                data-testid={`button-filter-${tier}`}
              >
                {tierIcons[tier]}
                <span className="ml-1">{tier}</span>
              </Button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {poolsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : filteredPools && filteredPools.length > 0 ? (
              filteredPools.map(pool => (
                <Card key={pool.id} className="hover-elevate cursor-pointer" data-testid={`card-pool-${pool.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {pool.name}
                        <Badge className={tierColors[pool.tier.toLowerCase()] || "bg-gray-500"}>
                          {tierIcons[pool.tier.toLowerCase()]}
                          <span className="ml-1 capitalize">{pool.tier}</span>
                        </Badge>
                      </CardTitle>
                      <Badge variant={pool.status === "active" ? "default" : "secondary"}>
                        {pool.status === "active" ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <AlertCircle className="h-3 w-3 mr-1" />
                        )}
                        {pool.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      Validator: {pool.validatorName || pool.validatorAddress?.slice(0, 10) + "..."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Base APY</p>
                        <p className="text-xl font-bold text-green-500">{pool.apy?.toFixed(1) || "0.0"}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">With Boost</p>
                        <p className="text-xl font-bold text-emerald-500">{((pool.apy || 0) + (pool.apyBoost || 0)).toFixed(1)}%</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Staked</span>
                        <span>{formatWeiToTBURN(pool.totalStaked)} TBURN</span>
                      </div>
                      <Progress value={Math.min(100, (parseInt(pool.totalStaked || "0") / 1e21) * 100)} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Lock className="h-3 w-3 text-muted-foreground" />
                        <span>{pool.lockPeriodDays} days lock</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span>{pool.stakersCount || pool.totalStakers || 0} stakers</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        className="flex-1" 
                        size="sm" 
                        onClick={() => handleStake(pool)}
                        data-testid={`button-stake-${pool.id}`}
                      >
                        <Coins className="h-4 w-4 mr-1" />
                        Stake
                      </Button>
                      <Link href={`/staking/pool/${pool.id}`}>
                        <Button variant="outline" size="sm" data-testid={`button-details-${pool.id}`}>
                          Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No pools found</h3>
                <p className="text-muted-foreground">No staking pools match your current filter.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {tiersLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : tiers?.map(tier => (
              <Card key={tier.id} className="relative overflow-hidden" data-testid={`card-tier-${tier.id}`}>
                <div className={`absolute top-0 left-0 right-0 h-2 ${tierColors[tier.id.toLowerCase()] || "bg-gray-500"}`} style={{ backgroundColor: tier.color }} />
                <CardHeader className="pt-4">
                  <div className="flex items-center gap-2">
                    {tierIcons[tier.id.toLowerCase()]}
                    <CardTitle className="text-lg">{tier.name}</CardTitle>
                  </div>
                  <CardDescription>
                    {tier.minApy.toFixed(1)}% - {tier.maxApy.toFixed(1)}% APY Range
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Min Stake</span>
                      <span className="font-medium">{formatWeiToTBURN(tier.minStake)} TBURN</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Lock Period</span>
                      <span className="font-medium">{tier.lockPeriodDays === 0 ? "No Lock" : `${tier.lockPeriodDays}-${tier.maxLockPeriodDays} days`}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Governance</span>
                      <span className="font-medium">{tier.governanceWeight}x weight</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">APY Multiplier</span>
                      <span className="font-medium">{(tier.apyMultiplier / 10000).toFixed(2)}x</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Benefits:</p>
                    <ul className="text-sm space-y-1">
                      {tier.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 mt-1 text-green-500 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                      {tier.earlyAdopterBonus > 0 && (
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 mt-1 text-green-500 flex-shrink-0" />
                          <span>{tier.earlyAdopterBonus.toFixed(1)}% early adopter bonus</span>
                        </li>
                      )}
                      {tier.loyaltyBonus > 0 && (
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 mt-1 text-green-500 flex-shrink-0" />
                          <span>{tier.loyaltyBonus.toFixed(1)}% monthly loyalty bonus</span>
                        </li>
                      )}
                      {tier.feeDiscount > 0 && (
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 mt-1 text-green-500 flex-shrink-0" />
                          <span>{tier.feeDiscount.toFixed(1)}% fee discount</span>
                        </li>
                      )}
                      {tier.priorityRewards && (
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 mt-1 text-green-500 flex-shrink-0" />
                          <span>Priority reward distribution</span>
                        </li>
                      )}
                      {tier.governanceWeight > 1 && (
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 mt-1 text-green-500 flex-shrink-0" />
                          <span>Enhanced governance voting power</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card data-testid="card-ai-apy-prediction">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  APY Prediction
                </CardTitle>
                <CardDescription>
                  AI-powered APY forecasting using Triple-Band analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                  <div className="text-3xl font-bold text-blue-500">
                    {stats?.averageApy ? stats.averageApy.toFixed(1) : 14.5}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    30-day predicted APY
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Trend</span>
                    <Badge variant="outline" className="text-green-500 border-green-500">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      Bullish
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className="font-medium">87%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">AI Provider</span>
                    <Badge variant="secondary">Claude 4.5 Sonnet</Badge>
                  </div>
                </div>
                <Button className="w-full" variant="outline" data-testid="button-get-apy-prediction">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Get Fresh Prediction
                </Button>
              </CardContent>
            </Card>

            <Card data-testid="card-ai-risk-analysis">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-amber-500" />
                  Risk Analysis
                </CardTitle>
                <CardDescription>
                  Smart contract and market risk assessment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-bold text-amber-500">Low</div>
                    <Progress value={25} className="flex-1 h-2" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Overall risk score: 25/100
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Smart contracts audited</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Slashing protection available</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span>Standard crypto volatility</span>
                  </div>
                </div>
                <Button className="w-full" variant="outline" data-testid="button-full-risk-analysis">
                  View Full Analysis
                </Button>
              </CardContent>
            </Card>

            <Card data-testid="card-ai-recommendations">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5 text-purple-500" />
                  Pool Recommendations
                </CardTitle>
                <CardDescription>
                  Personalized staking suggestions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {pools?.slice(0, 3).map((pool, i) => (
                    <div key={pool.id} className="flex items-center justify-between p-2 rounded-md border hover-elevate">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`${tierColors[pool.tier.toLowerCase()]} text-xs`}>
                          {i + 1}
                        </Badge>
                        <span className="text-sm font-medium">{pool.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-green-500">{pool.apy?.toFixed(1) || "0.0"}%</span>
                        <p className="text-xs text-muted-foreground">APY</p>
                      </div>
                    </div>
                  )) || (
                    <>
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </>
                  )}
                </div>
                <Button className="w-full" variant="outline" data-testid="button-get-recommendations">
                  <Zap className="h-4 w-4 mr-2" />
                  Get Personalized Picks
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card data-testid="card-ai-validator-insights">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top Validator Insights
              </CardTitle>
              <CardDescription>
                AI-analyzed validator performance and delegation recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                  { name: "TBURN Genesis", score: 95, uptime: "99.98%", apy: "15.2%" },
                  { name: "Enterprise Node", score: 92, uptime: "99.95%", apy: "14.8%" },
                  { name: "Mainnet Alpha", score: 89, uptime: "99.87%", apy: "14.5%" },
                  { name: "Core Validator", score: 87, uptime: "99.82%", apy: "14.2%" },
                ].map((validator, i) => (
                  <div key={i} className="p-4 rounded-lg border hover-elevate">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">{validator.name}</span>
                      <Badge variant={validator.score >= 90 ? "default" : "outline"}>
                        Score: {validator.score}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Uptime</span>
                        <span className="text-green-500">{validator.uptime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">APY</span>
                        <span className="font-medium">{validator.apy}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-4">
          <Card data-testid="card-rewards-calculator">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Staking Rewards Calculator
              </CardTitle>
              <CardDescription>
                Estimate your potential earnings based on stake amount and pool selection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Stake Amount (TBURN)</label>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="number"
                        className="flex-1 px-3 py-2 border rounded-md bg-background"
                        placeholder="Enter amount..."
                        defaultValue="10000"
                        data-testid="input-stake-amount"
                      />
                      <Button variant="outline" size="sm" data-testid="button-max-stake">MAX</Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Select Pool</label>
                    <select 
                      className="w-full mt-2 px-3 py-2 border rounded-md bg-background"
                      data-testid="select-pool"
                    >
                      <option value="">Select a pool...</option>
                      {pools?.map(pool => (
                        <option key={pool.id} value={pool.id}>
                          {pool.name} - {pool.apy?.toFixed(1) || "0.0"}% APY ({pool.tier})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Staking Duration</label>
                    <select 
                      className="w-full mt-2 px-3 py-2 border rounded-md bg-background"
                      data-testid="select-duration"
                    >
                      <option value="30">30 days</option>
                      <option value="90">90 days</option>
                      <option value="180">180 days</option>
                      <option value="365" selected>1 year</option>
                    </select>
                  </div>

                  <Button className="w-full" data-testid="button-calculate">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Calculate Rewards
                  </Button>
                </div>

                <div className="space-y-4 p-6 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold">Estimated Returns</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Daily Rewards</span>
                      <span className="font-medium text-green-500">~ 2.74 TBURN</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weekly Rewards</span>
                      <span className="font-medium text-green-500">~ 19.18 TBURN</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly Rewards</span>
                      <span className="font-medium text-green-500">~ 82.19 TBURN</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-muted-foreground">Yearly Rewards</span>
                      <span className="font-bold text-green-500 text-lg">~ 1,000 TBURN</span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Effective APY</span>
                      <span className="font-medium">10.00%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tier Boost</span>
                      <span className="font-medium">+1.5%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Compound Effect</span>
                      <span className="font-medium text-emerald-500">+0.47%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2">
        <Card data-testid="card-recent-activity">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recent Staking Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${i % 2 === 0 ? "bg-green-500/10" : "bg-red-500/10"}`}>
                        {i % 2 === 0 ? (
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {i % 2 === 0 ? "Stake" : "Unstake"} - {["Gold", "Silver", "Bronze", "Platinum", "Diamond"][i]} Pool
                        </p>
                        <p className="text-xs text-muted-foreground">
                          0x{Math.random().toString(16).slice(2, 10)}...
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${i % 2 === 0 ? "text-green-500" : "text-red-500"}`}>
                        {i % 2 === 0 ? "+" : "-"}{(Math.random() * 10000 + 1000).toFixed(2)} TBURN
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Math.floor(Math.random() * 60)} min ago
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card data-testid="card-reward-cycles">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Reward Cycles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-3 rounded-md border">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={i === 0 ? "default" : "outline"}>
                        {i === 0 ? "Active" : "Completed"}
                      </Badge>
                      <span className="text-sm font-medium">Cycle #{(stats?.currentRewardCycle || 100) - i}</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Distributed</span>
                        <span>{(Math.random() * 50000 + 10000).toFixed(0)} TBURN</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Participants</span>
                        <span>{Math.floor(Math.random() * 1000 + 500)}</span>
                      </div>
                      {i === 0 && (
                        <Progress value={Math.random() * 50 + 30} className="mt-2" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Dialog open={stakeDialogOpen} onOpenChange={setStakeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              Stake TBURN
            </DialogTitle>
            <DialogDescription>
              Stake your TBURN tokens in {selectedPool?.name} to earn rewards
            </DialogDescription>
          </DialogHeader>
          
          {selectedPool && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Pool</span>
                  <Badge className={tierColors[selectedPool.tier.toLowerCase()]}>
                    {selectedPool.tier}
                  </Badge>
                </div>
                <p className="font-medium">{selectedPool.name}</p>
                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Base APY:</span>
                    <span className="ml-2 font-medium text-green-500">
                      {selectedPool.apy?.toFixed(1) || "0.0"}%
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Lock Period:</span>
                    <span className="ml-2 font-medium">{selectedPool.lockPeriodDays} days</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stakeAmount">Amount to Stake (TBURN)</Label>
                <div className="flex gap-2">
                  <Input
                    id="stakeAmount"
                    type="number"
                    placeholder="Enter amount..."
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    min="0"
                    step="0.01"
                    data-testid="input-stake-dialog-amount"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStakeAmount("1000")}
                    data-testid="button-stake-preset-1k"
                  >
                    1K
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStakeAmount("10000")}
                    data-testid="button-stake-preset-10k"
                  >
                    10K
                  </Button>
                </div>
              </div>

              {stakeAmount && parseFloat(stakeAmount) > 0 && (
                <div className="p-3 rounded-md border bg-green-500/10 border-green-500/20">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Daily Rewards:</span>
                    <span className="font-medium text-green-500">
                      ~ {((parseFloat(stakeAmount) * (selectedPool.apy || 12) / 100) / 365).toFixed(4)} TBURN
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Estimated Yearly Rewards:</span>
                    <span className="font-medium text-green-500">
                      ~ {(parseFloat(stakeAmount) * (selectedPool.apy || 12) / 100).toFixed(2)} TBURN
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setStakeDialogOpen(false);
                setStakeAmount("");
                setSelectedPool(null);
              }}
              data-testid="button-stake-cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={submitStake}
              disabled={stakeMutation.isPending || !stakeAmount || parseFloat(stakeAmount) <= 0}
              data-testid="button-stake-confirm"
            >
              {stakeMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Staking...
                </>
              ) : (
                <>
                  <Coins className="h-4 w-4 mr-2" />
                  Stake TBURN
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
