import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Coins, Settings, Shield, Users, TrendingUp, Clock,
  AlertTriangle, CheckCircle, Plus, Edit, Trash2,
  PlayCircle, PauseCircle, RefreshCw, BarChart3, 
  Gift, Target, Lock, Unlock, Zap, Layers, Activity
} from "lucide-react";
import { Link } from "wouter";
import { useAdminPassword } from "@/hooks/use-admin-password";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { StakingPool, StakingTierConfig } from "@shared/schema";

interface StakingStats {
  totalStakedWei: string;
  totalPools: number;
  activePools: number;
  totalStakers: number;
  totalTiers: number;
  totalRewardsDistributedWei: string;
  currentRewardCycle: number;
  averageApy: number;
  highestApy: number;
  lowestApy: number;
}

interface RewardCycle {
  id: string;
  cycleNumber: number;
  startTime: string | null;
  endTime: string | null;
  totalRewardsDistributed: string | null;
  totalParticipants: number | null;
  status: string;
}

const tierColors: Record<string, string> = {
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#FFD700",
  platinum: "#E5E4E2",
  diamond: "#B9F2FF",
};

const TIER_CHART_COLORS = ["#CD7F32", "#C0C0C0", "#FFD700", "#E5E4E2", "#3B82F6"];

function formatWei(wei: string): string {
  const num = BigInt(wei || "0");
  return (Number(num) / 1e18).toLocaleString(undefined, { 
    maximumFractionDigits: 2 
  });
}

export default function OperatorStaking() {
  const { t } = useTranslation();
  const { getAuthHeaders } = useAdminPassword();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedPool, setSelectedPool] = useState<StakingPool | null>(null);
  const [isEditingPool, setIsEditingPool] = useState(false);
  const [isCreatingPool, setIsCreatingPool] = useState(false);
  const [isEditingTier, setIsEditingTier] = useState(false);
  const [selectedTier, setSelectedTier] = useState<StakingTierConfig | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery<StakingStats>({
    queryKey: ["/api/staking/stats"],
    refetchInterval: 15000,
  });

  const { data: pools, isLoading: poolsLoading } = useQuery<StakingPool[]>({
    queryKey: ["/api/staking/pools"],
    refetchInterval: 30000,
  });

  const { data: tiers, isLoading: tiersLoading } = useQuery<StakingTierConfig[]>({
    queryKey: ["/api/staking/tiers/configs"],
    refetchInterval: 60000,
  });

  const { data: rewardCycles, isLoading: cyclesLoading } = useQuery<RewardCycle[]>({
    queryKey: ["/api/staking/reward-cycles"],
    refetchInterval: 30000,
  });

  const togglePoolMutation = useMutation({
    mutationFn: async ({ poolId, isActive }: { poolId: string; isActive: boolean }) => {
      const response = await fetch(`/api/staking/pools/${poolId}/toggle`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) throw new Error("Failed to toggle pool");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staking/pools"] });
      queryClient.invalidateQueries({ queryKey: ["/api/staking/stats"] });
      toast({ title: t('operator.staking.poolUpdated'), description: t('operator.staking.poolStatusUpdated') });
    },
    onError: (error: any) => {
      toast({ title: t('common.error'), description: error.message, variant: "destructive" });
    },
  });

  const updatePoolMutation = useMutation({
    mutationFn: async (data: Partial<StakingPool> & { id: string }) => {
      const response = await fetch(`/api/staking/pools/${data.id}`, {
        method: "PATCH",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update pool");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staking/pools"] });
      setIsEditingPool(false);
      setSelectedPool(null);
      toast({ title: t('operator.staking.poolUpdated'), description: t('operator.staking.poolSettingsSaved') });
    },
    onError: (error: any) => {
      toast({ title: t('common.error'), description: error.message, variant: "destructive" });
    },
  });

  const triggerRewardDistribution = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/staking/rewards/distribute", {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to trigger distribution");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/staking/reward-cycles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/staking/stats"] });
      toast({ 
        title: t('operator.staking.rewardDistributionStarted'), 
        description: t('operator.staking.cycleDistributionInitiated', { cycle: data.cycleNumber }) 
      });
    },
    onError: (error: any) => {
      toast({ title: t('common.error'), description: error.message, variant: "destructive" });
    },
  });

  const tierDistribution = tiers?.map(tier => ({
    name: tier.displayName || tier.tier,
    value: pools?.filter(p => p.poolType?.toLowerCase() === tier.tier.toLowerCase()).length || 0,
  })) || [];

  const stakingTrend = [
    { date: "Nov 21", staked: 45000000, stakers: 1200 },
    { date: "Nov 22", staked: 48000000, stakers: 1350 },
    { date: "Nov 23", staked: 52000000, stakers: 1420 },
    { date: "Nov 24", staked: 55000000, stakers: 1580 },
    { date: "Nov 25", staked: 58000000, stakers: 1720 },
    { date: "Nov 26", staked: 62000000, stakers: 1890 },
    { date: "Nov 27", staked: 65000000, stakers: 2050 },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="operator-staking-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Coins className="h-8 w-8 text-primary" />
            {t('operator.staking.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('operator.staking.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/staking"] })}
            data-testid="button-refresh-staking"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('common.refresh')}
          </Button>
          <Button 
            onClick={() => setIsCreatingPool(true)}
            data-testid="button-create-pool"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('operator.staking.createPool')}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-total-staked">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('operator.staking.totalStaked')}</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-32" /> : (
              <>
                <div className="text-2xl font-bold">
                  {formatWei(stats?.totalStakedWei || "0")} TBURN
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  {t('operator.staking.fromLastWeek', { percent: '+12.5%' })}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-active-pools">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('operator.staking.activePools')}</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-32" /> : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.activePools || 0} / {stats?.totalPools || 0}
                </div>
                <Progress 
                  value={(stats?.activePools || 0) / (stats?.totalPools || 1) * 100} 
                  className="h-1 mt-2" 
                />
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-total-stakers">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('operator.staking.totalStakers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-32" /> : (
              <>
                <div className="text-2xl font-bold">
                  {(stats?.totalStakers || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <Activity className="h-3 w-3 text-blue-500 mr-1" />
                  {t('operator.staking.acrossTiers', { count: stats?.totalTiers || 0 })}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-reward-cycle">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('operator.staking.currentRewardCycle')}</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-32" /> : (
              <>
                <div className="text-2xl font-bold flex items-center gap-2">
                  #{stats?.currentRewardCycle || 0}
                  <Badge variant="outline" className="text-green-500 border-green-500">{t('operator.members.active')}</Badge>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2 w-full"
                  onClick={() => triggerRewardDistribution.mutate()}
                  disabled={triggerRewardDistribution.isPending}
                  data-testid="button-distribute-rewards"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  {t('operator.staking.triggerDistribution')}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pools" className="space-y-4">
        <TabsList data-testid="tabs-operator-staking">
          <TabsTrigger value="pools" data-testid="tab-pools">{t('operator.staking.poolManagement')}</TabsTrigger>
          <TabsTrigger value="tiers" data-testid="tab-tiers">{t('operator.staking.tierConfiguration')}</TabsTrigger>
          <TabsTrigger value="rewards" data-testid="tab-rewards">{t('operator.staking.rewardCycles')}</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">{t('operator.staking.analytics')}</TabsTrigger>
        </TabsList>

        <TabsContent value="pools" className="space-y-4">
          <div className="grid gap-4">
            {poolsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : pools && pools.length > 0 ? (
              pools.map(pool => {
                const isActive = pool.status === "active";
                const apy = (pool.currentApy || pool.baseApy) / 100;
                return (
                <Card key={pool.id} data-testid={`card-pool-${pool.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-3 h-12 rounded-full" 
                          style={{ backgroundColor: tierColors[pool.tier?.toLowerCase() || "bronze"] }}
                        />
                        <div>
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            {pool.name}
                            <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-green-600 hover:bg-green-700" : ""}>
                              {pool.status}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {pool.tier}
                            </Badge>
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            ID: {pool.id.slice(0, 8)}... | Created: {new Date(pool.createdAt!).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-500">{apy}%</p>
                          <p className="text-xs text-muted-foreground">{t('staking.apy')}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold">{formatWei(pool.totalStaked || "0")}</p>
                          <p className="text-xs text-muted-foreground">{t('operator.staking.totalStaked')}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold">{pool.totalStakers || 0}</p>
                          <p className="text-xs text-muted-foreground">{t('operator.staking.stakers')}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold">{pool.lockPeriodDays || 0}d</p>
                          <p className="text-xs text-muted-foreground">{t('staking.lockPeriod')}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => togglePoolMutation.mutate({ 
                              poolId: pool.id, 
                              isActive: !isActive 
                            })}
                            disabled={togglePoolMutation.isPending}
                            data-testid={`button-toggle-pool-${pool.id}`}
                          >
                            {isActive ? (
                              <PauseCircle className="h-5 w-5 text-amber-500" />
                            ) : (
                              <PlayCircle className="h-5 w-5 text-green-500" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedPool(pool);
                              setIsEditingPool(true);
                            }}
                            data-testid={`button-edit-pool-${pool.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Link href={`/app/staking/pool/${pool.id}`}>
                            <Button variant="outline" size="sm" data-testid={`button-view-pool-${pool.id}`}>
                              {t('operator.staking.viewDetails')}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">{t('operator.staking.minStake')}:</span>
                        <span className="ml-2 font-medium">{formatWei(pool.minStake || "0")} TBURN</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t('operator.staking.maxStake')}:</span>
                        <span className="ml-2 font-medium">{pool.maxStake ? formatWei(pool.maxStake) : t('operator.staking.unlimited')} TBURN</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t('operator.staking.autoCompound')}:</span>
                        <Badge variant={pool.autoCompoundEnabled ? "default" : "outline"} className="ml-2">
                          {pool.autoCompoundEnabled ? <CheckCircle className="h-3 w-3 mr-1" /> : null}
                          {pool.autoCompoundEnabled ? t('operator.staking.enabled') : t('operator.staking.disabled')}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t('operator.staking.exitFee')}:</span>
                        <span className="ml-2 font-medium">{(pool.exitFee || 0) / 100}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )})
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t('operator.staking.noStakingPools')}</h3>
                  <p className="text-muted-foreground mb-4">
                    {t('operator.staking.createFirstPoolDesc')}
                  </p>
                  <Button onClick={() => setIsCreatingPool(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('operator.staking.createPool')}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tiersLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : tiers && tiers.length > 0 ? (
              tiers.map(tier => (
                <Card key={tier.id} className="relative overflow-hidden" data-testid={`card-tier-${tier.tier}`}>
                  <div 
                    className="absolute top-0 left-0 right-0 h-2"
                    style={{ backgroundColor: tierColors[tier.tier] || "#6B7280" }}
                  />
                  <CardHeader className="pt-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="capitalize flex items-center gap-2">
                        {tier.displayName || tier.tier}
                        <Badge variant="outline" className="ml-2">
                          {tier.tier.toUpperCase()}
                        </Badge>
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedTier(tier);
                          setIsEditingTier(true);
                        }}
                        data-testid={`button-edit-tier-${tier.tier}`}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardDescription>
                      {tier.apyMultiplier / 10000}x APY Multiplier
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">{t('operator.staking.apyRange')}</p>
                        <p className="font-semibold text-green-500">
                          {tier.minApy / 100}% - {tier.maxApy / 100}%
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t('operator.staking.lockPeriod')}</p>
                        <p className="font-semibold">
                          {tier.minLockDays} - {tier.maxLockDays} {t('operator.staking.days')}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t('operator.staking.minStake')}</p>
                        <p className="font-semibold">{formatWei(tier.minStakeWei)} TBURN</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t('operator.staking.feeDiscount')}</p>
                        <p className="font-semibold">{tier.feeDiscount / 100}%</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('operator.staking.earlyAdopterBonus')}</span>
                        <Badge variant={tier.earlyAdopterBonus > 0 ? "default" : "outline"}>
                          {tier.earlyAdopterBonus / 100}%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('operator.staking.priorityRewards')}</span>
                        <Badge variant={tier.priorityRewards ? "default" : "outline"}>
                          {tier.priorityRewards ? t('common.yes') : t('common.no')}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('operator.staking.governanceWeight')}</span>
                        <span className="font-medium">{tier.governanceWeight}x</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="col-span-full">
                <CardContent className="p-12 text-center">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t('operator.staking.noTierConfigs')}</h3>
                  <p className="text-muted-foreground">
                    {t('operator.staking.tierConfigsNeeded')}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <Card data-testid="card-reward-cycles">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    {t('operator.staking.rewardDistributionCycles')}
                  </CardTitle>
                  <CardDescription>
                    {t('operator.staking.manageRewardDistribution')}
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => triggerRewardDistribution.mutate()}
                  disabled={triggerRewardDistribution.isPending}
                  data-testid="button-trigger-cycle"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {triggerRewardDistribution.isPending ? t('operator.staking.processing') : t('operator.staking.newCycle')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {cyclesLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))
                  ) : rewardCycles && rewardCycles.length > 0 ? (
                    rewardCycles.map((cycle, index) => (
                      <div 
                        key={cycle.id} 
                        className={`p-4 rounded-lg border ${index === 0 ? "bg-primary/5 border-primary/20" : ""}`}
                        data-testid={`cycle-${cycle.cycleNumber}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${
                              cycle.status === "active" ? "bg-green-500/10" :
                              cycle.status === "completed" ? "bg-blue-500/10" : "bg-gray-500/10"
                            }`}>
                              {cycle.status === "active" ? (
                                <Activity className="h-5 w-5 text-green-500" />
                              ) : cycle.status === "completed" ? (
                                <CheckCircle className="h-5 w-5 text-blue-500" />
                              ) : (
                                <Clock className="h-5 w-5 text-gray-500" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold flex items-center gap-2">
                                {t('operator.staking.cycle')} #{cycle.cycleNumber}
                                <Badge variant={
                                  cycle.status === "active" ? "default" :
                                  cycle.status === "completed" ? "outline" : "secondary"
                                } className={cycle.status === "active" ? "bg-green-600 hover:bg-green-700" : ""}>
                                  {cycle.status}
                                </Badge>
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {cycle.startTime ? new Date(cycle.startTime).toLocaleString() : t('operator.members.pending')} 
                                {cycle.endTime ? ` - ${new Date(cycle.endTime).toLocaleString()}` : ""}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-500">
                              {cycle.totalRewardsDistributed ? formatWei(cycle.totalRewardsDistributed) : "0"} TBURN
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {cycle.totalParticipants || 0} {t('operator.staking.participants')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{t('operator.staking.noRewardCycles')}</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => triggerRewardDistribution.mutate()}
                      >
                        {t('operator.staking.startFirstCycle')}
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card data-testid="card-staking-trend">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {t('operator.staking.stakingGrowthTrend')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={stakingTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`} />
                    <Tooltip 
                      formatter={(value: number) => [`${(value/1000000).toFixed(2)}M TBURN`, t('operator.staking.totalStaked')]}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="staked" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary)/0.2)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card data-testid="card-tier-distribution">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  {t('operator.staking.poolDistributionByTier')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={tierDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {tierDistribution.map((entry, index) => (
                        <Cell key={entry.name} fill={TIER_CHART_COLORS[index % TIER_CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card data-testid="card-staker-growth">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t('operator.staking.stakerGrowth')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stakingTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="stakers" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      dot={{ fill: '#10B981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card data-testid="card-apy-overview">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {t('operator.staking.apyOverview')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-3xl font-bold text-green-500">{stats?.highestApy || 0}%</p>
                    <p className="text-sm text-muted-foreground">{t('operator.staking.highestApy')}</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-3xl font-bold">{stats?.averageApy?.toFixed(1) || 0}%</p>
                    <p className="text-sm text-muted-foreground">{t('operator.staking.averageApy')}</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-3xl font-bold text-amber-500">{stats?.lowestApy || 0}%</p>
                    <p className="text-sm text-muted-foreground">{t('operator.staking.lowestApy')}</p>
                  </div>
                </div>
                <div className="pt-4 border-t space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('operator.staking.totalRewardsDistributed')}</span>
                    <span className="font-bold text-lg">
                      {formatWei(stats?.totalRewardsDistributedWei || "0")} TBURN
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('operator.staking.averageStakePerUser')}</span>
                    <span className="font-medium">
                      {stats && stats.totalStakers > 0 
                        ? (Number(BigInt(stats.totalStakedWei || "0")) / 1e18 / stats.totalStakers).toLocaleString(undefined, { maximumFractionDigits: 2 })
                        : "0"
                      } TBURN
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isEditingPool} onOpenChange={setIsEditingPool}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('operator.staking.editStakingPool')}</DialogTitle>
            <DialogDescription>
              {t('operator.staking.updatePoolSettingsDesc')}
            </DialogDescription>
          </DialogHeader>
          {selectedPool && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('operator.staking.poolName')}</Label>
                <Input 
                  defaultValue={selectedPool.name} 
                  onChange={(e) => setSelectedPool({ ...selectedPool, name: e.target.value })}
                  data-testid="input-pool-name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('operator.staking.baseApyBasisPoints')}</Label>
                  <Input 
                    type="number" 
                    defaultValue={selectedPool.baseApy || 0}
                    onChange={(e) => setSelectedPool({ ...selectedPool, baseApy: parseInt(e.target.value) })}
                    data-testid="input-pool-apy"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('operator.staking.lockPeriodDays')}</Label>
                  <Input 
                    type="number" 
                    defaultValue={selectedPool.lockPeriodDays || 0}
                    onChange={(e) => setSelectedPool({ ...selectedPool, lockPeriodDays: parseInt(e.target.value) })}
                    data-testid="input-pool-lock"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>{t('operator.staking.autoCompound')}</Label>
                <Switch 
                  checked={selectedPool.autoCompoundEnabled || false}
                  onCheckedChange={(checked) => setSelectedPool({ ...selectedPool, autoCompoundEnabled: checked })}
                  data-testid="switch-compound"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingPool(false)}>{t('common.cancel')}</Button>
            <Button 
              onClick={() => selectedPool && updatePoolMutation.mutate(selectedPool)}
              disabled={updatePoolMutation.isPending}
              data-testid="button-save-pool"
            >
              {updatePoolMutation.isPending ? t('operator.staking.saving') : t('operator.staking.saveChanges')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreatingPool} onOpenChange={setIsCreatingPool}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('operator.staking.createStakingPool')}</DialogTitle>
            <DialogDescription>
              {t('operator.staking.setupNewPoolDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('operator.staking.poolName')}</Label>
              <Input placeholder={t('operator.staking.poolNamePlaceholder')} data-testid="input-new-pool-name" />
            </div>
            <div className="space-y-2">
              <Label>{t('operator.staking.tier')}</Label>
              <Select>
                <SelectTrigger data-testid="select-new-pool-tier">
                  <SelectValue placeholder={t('operator.staking.selectTier')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bronze">{t('operator.staking.bronze')}</SelectItem>
                  <SelectItem value="silver">{t('operator.staking.silver')}</SelectItem>
                  <SelectItem value="gold">{t('operator.staking.gold')}</SelectItem>
                  <SelectItem value="platinum">{t('operator.staking.platinum')}</SelectItem>
                  <SelectItem value="diamond">{t('operator.staking.diamond')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('operator.staking.apyPercent')}</Label>
                <Input type="number" placeholder="12.5" data-testid="input-new-pool-apy" />
              </div>
              <div className="space-y-2">
                <Label>{t('operator.staking.lockPeriodDays')}</Label>
                <Input type="number" placeholder="90" data-testid="input-new-pool-lock" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('operator.staking.minStakeTburn')}</Label>
                <Input type="number" placeholder="1000" data-testid="input-new-pool-min" />
              </div>
              <div className="space-y-2">
                <Label>{t('operator.staking.maxStakeTburn')}</Label>
                <Input type="number" placeholder="100000" data-testid="input-new-pool-max" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>{t('operator.staking.enableSlashingProtection')}</Label>
              <Switch data-testid="switch-new-slashing" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatingPool(false)}>{t('common.cancel')}</Button>
            <Button data-testid="button-create-pool-submit">
              <Plus className="h-4 w-4 mr-2" />
              {t('operator.staking.createPool')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
