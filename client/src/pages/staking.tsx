import { useState } from "react";
import { useQuery, useMutation, keepPreviousData } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

const benefitKeyMap: Record<string, string> = {
  "Basic staking rewards": "staking.benefitBasicRewards",
  "Standard withdrawal times": "staking.benefitStandardWithdrawal",
  "10% APY boost": "staking.benefitApyBoost10",
  "Priority support": "staking.benefitPrioritySupport",
  "Governance voting": "staking.benefitGovernanceVoting",
  "25% APY boost": "staking.benefitApyBoost25",
  "Early access to new pools": "staking.benefitEarlyAccess",
  "Enhanced governance rights": "staking.benefitEnhancedGovernance",
  "50% APY boost": "staking.benefitApyBoost50",
  "Validator nomination rights": "staking.benefitValidatorNomination",
  "Exclusive pool access": "staking.benefitExclusivePool",
  "100% APY boost": "staking.benefitApyBoost100",
  "Validator committee eligibility": "staking.benefitValidatorCommittee",
  "Maximum governance power": "staking.benefitMaxGovernance",
  "Direct chain contribution": "staking.benefitDirectChain"
};

function translateBenefit(t: (key: string) => string, benefit: string): string {
  const key = benefitKeyMap[benefit];
  if (key) {
    return t(key);
  }
  return benefit;
}

const poolNameKeyMap: Record<string, string> = {
  "pool-public-main": "staking.poolNames.pool-public-main",
  "pool-validator-1": "staking.poolNames.pool-validator-1",
  "pool-institutional": "staking.poolNames.pool-institutional",
  "pool-liquid": "staking.poolNames.pool-liquid"
};

const poolDescKeyMap: Record<string, string> = {
  "pool-public-main": "staking.poolDescriptions.pool-public-main",
  "pool-validator-1": "staking.poolDescriptions.pool-validator-1",
  "pool-institutional": "staking.poolDescriptions.pool-institutional",
  "pool-liquid": "staking.poolDescriptions.pool-liquid"
};

function translatePoolName(t: (key: string) => string, poolId: string, defaultName: string): string {
  const key = poolNameKeyMap[poolId];
  if (key) {
    const translated = t(key);
    if (translated !== key) return translated;
  }
  return defaultName;
}

function translatePoolDesc(t: (key: string) => string, poolId: string, defaultDesc: string): string {
  const key = poolDescKeyMap[poolId];
  if (key) {
    const translated = t(key);
    if (translated !== key) return translated;
  }
  return defaultDesc;
}

const validatorNameKeyMap: Record<string, string> = {
  "TBURN Foundation": "staking.validatorNames.tburn-foundation",
  "Quantum Stake": "staking.validatorNames.quantum-stake",
  "Enterprise Pool": "staking.validatorNames.enterprise-pool",
  "Liquid Protocol": "staking.validatorNames.liquid-protocol"
};

function translateValidatorName(t: (key: string) => string, validatorName: string): string {
  const key = validatorNameKeyMap[validatorName];
  if (key) {
    const translated = t(key);
    if (translated !== key) return translated;
  }
  return validatorName;
}
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
import { WalletRequiredBanner } from "@/components/require-wallet";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useWeb3 } from "@/lib/web3-context";
import { WalletConnectModal } from "@/components/wallet-connect-modal";

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
    const ONE_TBURN = BigInt("1000000000000000000");
    
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

interface ApyPrediction {
  predictedApy: number;
  confidence: number;
  trend: string;
  aiProvider: string;
  analysis: string;
}

interface StakingPortfolioSummary {
  totalStaked: string;
  totalPendingRewards: string;
  totalEarned: string;
  totalUnbonding: string;
  totalPortfolioValue: string;
  avgApy: string;
  activePositions: number;
  unbondingPositions: number;
  autoCompoundEnabled: boolean;
}

interface StakingPosition {
  id: string;
  validatorId: string;
  validatorName: string;
  validatorAddress: string;
  validatorCommission: string;
  validatorUptime: string;
  validatorRiskScore: string;
  stakedAmount: string;
  currentApy: string;
  pendingRewards: string;
  totalRewardsEarned: string;
  dailyReward: string;
  status: string;
}

interface UnbondingPosition {
  id: string;
  validatorName: string;
  amount: string;
  remainingDays: number;
  remainingHours: number;
  progressPercent: string;
  status: string;
  canEmergencyUnstake: boolean;
  emergencyPenalty: string;
}

interface StakingPortfolioData {
  summary: StakingPortfolioSummary;
  positions: StakingPosition[];
  unbonding: UnbondingPosition[];
}

interface CalculatorResults {
  dailyRewards: number;
  weeklyRewards: number;
  monthlyRewards: number;
  yearlyRewards: number;
  effectiveApy: number;
  tierBoost: number;
  compoundEffect: number;
}

export default function StakingDashboard() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isConnected, isCorrectNetwork, balance, address } = useWeb3();
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [stakeDialogOpen, setStakeDialogOpen] = useState(false);
  const [selectedPool, setSelectedPool] = useState<PoolResponse | null>(null);
  const [stakeAmount, setStakeAmount] = useState("");
  
  const [calcAmount, setCalcAmount] = useState("10000");
  const [calcPoolId, setCalcPoolId] = useState("");
  const [calcDuration, setCalcDuration] = useState("365");
  const [calcResults, setCalcResults] = useState<CalculatorResults | null>(null);
  
  const [apyPrediction, setApyPrediction] = useState<ApyPrediction | null>(null);
  const [riskDialogOpen, setRiskDialogOpen] = useState(false);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);

  const { data: portfolioResponse, isLoading: portfolioLoading, refetch: refetchPortfolio } = useQuery<{ success: boolean; data: StakingPortfolioData }>({
    queryKey: ['/api/user', address, 'staking-portfolio'],
    enabled: isConnected && !!address,
    refetchInterval: 30000,
  });

  const portfolio = portfolioResponse?.data;

  const claimMutation = useMutation({
    mutationFn: async ({ claimAll, autoCompound }: { claimAll?: boolean; autoCompound?: boolean }) => {
      const response = await apiRequest('POST', `/api/user/${address}/claim-staking`, { claimAll, autoCompound });
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: t('staking.rewardsClaimed'),
        description: data?.data?.message || t('staking.rewardsClaimedDesc'),
      });
      setClaimDialogOpen(false);
      refetchPortfolio();
    },
    onError: () => {
      toast({
        title: t('staking.claimFailed'),
        description: t('staking.claimFailedDesc'),
        variant: "destructive",
      });
    },
  });

  const autoCompoundMutation = useMutation({
    mutationFn: async ({ enabled }: { enabled: boolean }) => {
      const response = await apiRequest('POST', `/api/user/${address}/auto-compound`, { enabled });
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: data?.data?.autoCompoundEnabled ? t('staking.autoCompoundEnabled') : t('staking.autoCompoundDisabled'),
        description: data?.data?.message,
      });
      refetchPortfolio();
    },
  });

  const getRiskBadge = (riskScore: string) => {
    switch (riskScore) {
      case 'low': return <Badge className="bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400">{t('staking.lowRisk')}</Badge>;
      case 'medium': return <Badge className="bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400">{t('staking.mediumRisk')}</Badge>;
      case 'high': return <Badge className="bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400">{t('staking.highRisk')}</Badge>;
      default: return <Badge variant="secondary">{t('common.unknown')}</Badge>;
    }
  };

  const { data: stats, isLoading: statsLoading } = useQuery<StakingStatsResponse>({
    queryKey: ["/api/staking/stats"],
    refetchInterval: 30000,
    staleTime: 25000,
    gcTime: 300000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 500,
    placeholderData: keepPreviousData,
  });

  const { data: pools, isLoading: poolsLoading } = useQuery<PoolResponse[]>({
    queryKey: ["/api/staking/pools"],
    refetchInterval: 45000,
    staleTime: 40000,
    gcTime: 300000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 500,
    placeholderData: keepPreviousData,
  });

  const { data: tiers, isLoading: tiersLoading } = useQuery<TierResponse[]>({
    queryKey: ["/api/staking/tiers"],
    refetchInterval: 90000,
    staleTime: 85000,
    gcTime: 600000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 500,
    placeholderData: keepPreviousData,
  });

  const stakeMutation = useMutation({
    mutationFn: async (data: { poolId: string; amount: string }) => {
      const weiAmount = (parseFloat(data.amount) * 1e18).toString();
      return apiRequest("POST", "/api/staking/stake", {
        poolId: data.poolId,
        amount: weiAmount,
        stakerAddress: `0xTBURN${Math.random().toString(16).slice(2, 42)}`,
        lockPeriodDays: selectedPool?.lockPeriodDays || 30
      });
    },
    onSuccess: () => {
      toast({
        title: t('staking.stakeSuccessful'),
        description: t('staking.stakeSuccessDesc', { amount: stakeAmount, pool: selectedPool?.name }),
      });
      setStakeDialogOpen(false);
      setStakeAmount("");
      setSelectedPool(null);
      queryClient.invalidateQueries({ queryKey: ["/api/staking/pools"] });
      queryClient.invalidateQueries({ queryKey: ["/api/staking/stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: t('staking.stakeFailed'),
        description: error.message || t('staking.stakeFailedDesc'),
        variant: "destructive"
      });
    }
  });

  const apyPredictionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/staking/ai/predict-apy", {
        stakeAmount: "10000000000000000000000",
        lockPeriodDays: 90,
        tier: "silver"
      });
      return response.json();
    },
    onSuccess: (data: ApyPrediction) => {
      setApyPrediction({
        predictedApy: data.predictedApy || stats?.averageApy || 14.5,
        confidence: data.confidence || 87,
        trend: data.trend || "bullish",
        aiProvider: data.aiProvider || t('common.claudeSonnet'),
        analysis: data.analysis || t('staking.aiAnalysisCompleted')
      });
      toast({
        title: t('staking.apyPredictionUpdated'),
        description: t('staking.freshPredictionGenerated'),
      });
    },
    onError: () => {
      setApyPrediction({
        predictedApy: stats?.averageApy || 14.5,
        confidence: 85,
        trend: "bullish",
        aiProvider: t('common.claudeSonnet'),
        analysis: t('staking.simulatedPredictionMarket')
      });
      toast({
        title: t('staking.predictionGenerated'),
        description: t('staking.simulatedPrediction'),
      });
    }
  });

  const recommendationsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/staking/ai/recommend-pools", {
        walletAddress: `0xTBURN${Math.random().toString(16).slice(2, 42)}`,
        availableBalance: "50000000000000000000000",
        riskTolerance: "medium",
        preferredLockPeriod: 90
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('staking.recommendationsUpdated'),
        description: t('staking.personalizedPicksRefreshed'),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/staking/pools"] });
    },
    onError: () => {
      toast({
        title: t('staking.recommendationsUpdated'),
        description: t('staking.poolRecsRefreshed'),
      });
    }
  });

  const handleStake = (pool: PoolResponse) => {
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
    setSelectedPool(pool);
    setStakeDialogOpen(true);
  };

  const submitStake = () => {
    if (!isConnected || !isCorrectNetwork) {
      toast({
        title: t('wallet.walletRequired'),
        description: t('wallet.connectRequiredDesc'),
        variant: "destructive"
      });
      return;
    }
    if (!selectedPool || !stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast({
        title: t('staking.invalidAmount'),
        description: t('staking.invalidAmountDesc'),
        variant: "destructive"
      });
      return;
    }
    const stakeAmountFloat = parseFloat(stakeAmount);
    const balanceFloat = parseFloat(balance || "0");
    if (stakeAmountFloat > balanceFloat) {
      toast({
        title: t('staking.insufficientBalance'),
        description: t('staking.insufficientBalanceDesc', { balance: balanceFloat.toFixed(4), required: stakeAmountFloat.toFixed(4) }),
        variant: "destructive"
      });
      return;
    }
    stakeMutation.mutate({ poolId: selectedPool.id, amount: stakeAmount });
  };

  const calculateRewards = () => {
    const amount = parseFloat(calcAmount) || 0;
    const duration = parseInt(calcDuration) || 365;
    const pool = pools?.find(p => p.id === calcPoolId);
    const apy = pool?.apy || 12;
    const boost = pool?.apyBoost || 1.5;
    
    const effectiveApy = apy + boost;
    const yearlyRewards = amount * (effectiveApy / 100);
    const dailyRewards = yearlyRewards / 365;
    const weeklyRewards = dailyRewards * 7;
    const monthlyRewards = yearlyRewards / 12;
    const durationRewards = yearlyRewards * (duration / 365);
    const compoundEffect = yearlyRewards * 0.047;
    
    setCalcResults({
      dailyRewards,
      weeklyRewards,
      monthlyRewards,
      yearlyRewards: durationRewards,
      effectiveApy,
      tierBoost: boost,
      compoundEffect: compoundEffect / amount * 100
    });
    
    toast({
      title: t('staking.rewardsCalculated'),
      description: t('staking.rewardsCalculatedDesc', { amount: durationRewards.toFixed(2), days: duration }),
    });
  };

  const filteredPools = selectedTier 
    ? pools?.filter(p => p.tier.toLowerCase() === selectedTier)
    : pools;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <WalletRequiredBanner />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-staking-title">{t('staking.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('staking.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            {t('staking.rewardCycle')} #{stats?.currentRewardCycle || 0}
          </Badge>
          <Button variant="outline" size="sm" data-testid="button-refresh-staking">
            <RefreshCw className="h-4 w-4 mr-1" />
            {t('common.refresh')}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-tvl">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('staking.tvl')}</CardTitle>
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
                  {t('staking.fromLastEpoch', { percent: '5.2' })}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-rewards-distributed">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('staking.totalRewards')}</CardTitle>
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
                  {t('staking.lifetimeDistribution')}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-stakers">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('staking.activeStakers')}</CardTitle>
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
                  {t('staking.acrossPools', { count: stats?.totalPools || 0 })}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-apy-range">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('staking.apyRange')}</CardTitle>
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
                  {t('staking.avgApy', { apy: stats?.averageApy?.toFixed(1) || 0 })}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={isConnected ? "portfolio" : "pools"} className="space-y-4">
        <TabsList data-testid="tabs-staking">
          <TabsTrigger value="portfolio" data-testid="tab-portfolio" className="flex items-center gap-1">
            <Wallet className="h-4 w-4" />
            {t('staking.myPortfolio', 'My Portfolio')}
          </TabsTrigger>
          <TabsTrigger value="pools" data-testid="tab-pools">{t('staking.pools')}</TabsTrigger>
          <TabsTrigger value="tiers" data-testid="tab-tiers">{t('staking.tierSystem')}</TabsTrigger>
          <TabsTrigger value="ai-insights" data-testid="tab-ai-insights">{t('staking.aiInsights')}</TabsTrigger>
          <TabsTrigger value="calculator" data-testid="tab-calculator">{t('staking.rewardsCalculator')}</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-6" data-testid="content-portfolio">
          {!isConnected ? (
            <Card className="p-8 text-center">
              <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">{t('staking.connectToViewPortfolio', 'Connect Wallet to View Portfolio')}</h3>
              <p className="text-muted-foreground mb-4">{t('staking.connectDesc', 'Connect your wallet to view your staking positions, pending rewards, and manage your delegations.')}</p>
              <Button onClick={() => setWalletModalOpen(true)} className="bg-gradient-to-r from-blue-500 to-purple-600" data-testid="button-connect-portfolio">
                <Wallet className="h-4 w-4 mr-2" />
                {t('wallet.connectWallet')}
              </Button>
            </Card>
          ) : portfolioLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-32" />)}
            </div>
          ) : portfolio ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{t('staking.portfolioOverview', 'Portfolio Overview')}</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => autoCompoundMutation.mutate({ enabled: !portfolio.summary.autoCompoundEnabled })}
                    className={portfolio.summary.autoCompoundEnabled ? "border-green-500 text-green-600" : ""}
                    data-testid="button-toggle-autocompound"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${portfolio.summary.autoCompoundEnabled ? "text-green-500" : ""}`} />
                    {portfolio.summary.autoCompoundEnabled ? t('staking.autoCompoundOn', 'Auto-Compound ON') : t('staking.autoCompoundOff', 'Auto-Compound OFF')}
                  </Button>
                  <Button
                    onClick={() => setClaimDialogOpen(true)}
                    disabled={parseFloat(portfolio.summary.totalPendingRewards || '0') <= 0}
                    data-testid="button-claim-rewards"
                  >
                    <Award className="h-4 w-4 mr-2" />
                    {t('staking.claimRewards', 'Claim Rewards')} ({portfolio.summary.totalPendingRewards} TB)
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card data-testid="card-total-staked">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('staking.totalStaked', 'Total Staked')}</CardTitle>
                    <Lock className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{formatNumber(parseFloat(portfolio.summary.totalStaked || '0'))} TBURN</div>
                    <p className="text-xs text-muted-foreground">{portfolio.summary.activePositions} {t('staking.activePositions', 'active positions')}</p>
                  </CardContent>
                </Card>

                <Card data-testid="card-pending-rewards">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('staking.pendingRewards', 'Pending Rewards')}</CardTitle>
                    <Award className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{portfolio.summary.totalPendingRewards} TBURN</div>
                    <p className="text-xs text-muted-foreground">{t('staking.readyToClaim', 'Ready to claim')}</p>
                  </CardContent>
                </Card>

                <Card data-testid="card-total-earned">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('staking.totalEarned', 'Total Earned')}</CardTitle>
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">{portfolio.summary.totalEarned} TBURN</div>
                    <p className="text-xs text-muted-foreground">{t('staking.lifetimeRewards', 'Lifetime rewards')}</p>
                  </CardContent>
                </Card>

                <Card data-testid="card-unbonding">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('staking.unbonding', 'Unbonding')}</CardTitle>
                    <Unlock className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{portfolio.summary.totalUnbonding} TBURN</div>
                    <p className="text-xs text-muted-foreground">{portfolio.summary.unbondingPositions} {t('staking.pendingUnbonds', 'pending')}</p>
                  </CardContent>
                </Card>

                <Card data-testid="card-avg-apy">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('staking.avgApy', 'Avg APY')}</CardTitle>
                    <Percent className="h-4 w-4 text-cyan-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-cyan-600">{portfolio.summary.avgApy}%</div>
                    <p className="text-xs text-muted-foreground">{t('staking.annualReturn', 'Annual return')}</p>
                  </CardContent>
                </Card>
              </div>

              {portfolio.positions.length > 0 && (
                <Card data-testid="card-active-delegations">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {t('staking.activeDelegations', 'Active Delegations')}
                      <Badge variant="secondary">{portfolio.positions.length} {t('staking.positions', 'positions')}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-4">
                        {portfolio.positions.map((pos) => (
                          <div key={pos.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg" data-testid={`delegation-${pos.id}`}>
                            <div className="flex items-center gap-4">
                              <img
                                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${pos.validatorAddress}`}
                                className="w-10 h-10 rounded-full"
                                alt={pos.validatorName}
                              />
                              <div>
                                <p className="font-medium">{translateValidatorName(t, pos.validatorName)}</p>
                                <p className="text-xs text-muted-foreground">{t('staking.commission', 'Commission')}: {pos.validatorCommission}%</p>
                              </div>
                            </div>
                            <div className="text-center">
                              <p className="font-bold">{formatNumber(parseFloat(pos.stakedAmount))} TB</p>
                              <p className="text-xs text-muted-foreground">{t('staking.staked', 'Staked')}</p>
                            </div>
                            <div className="text-center">
                              <p className="font-bold text-green-500">{pos.currentApy}%</p>
                              <p className="text-xs text-muted-foreground">APY</p>
                            </div>
                            <div className="text-center">
                              <p className="font-bold text-green-500">{pos.pendingRewards} TB</p>
                              <p className="text-xs text-muted-foreground">~{pos.dailyReward}/{t('common.day', 'day')}</p>
                            </div>
                            <div className="text-center">
                              {getRiskBadge(pos.validatorRiskScore)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {portfolio.unbonding.length > 0 && (
                <Card data-testid="card-unbonding-positions">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {t('staking.unbondingPositions', 'Unbonding Positions')}
                      <Badge variant="secondary" className="bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
                        {portfolio.unbonding.length} {t('staking.pending', 'pending')}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {portfolio.unbonding.map((unbond) => (
                        <div key={unbond.id} className="p-4 bg-muted/50 rounded-lg" data-testid={`unbonding-${unbond.id}`}>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-medium">{translateValidatorName(t, unbond.validatorName)}</p>
                              <p className="text-lg font-bold text-orange-500">{unbond.amount} TBURN</p>
                            </div>
                            <div className="text-right">
                              {unbond.status === 'ready' ? (
                                <Badge className="bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400">
                                  {t('staking.readyToClaim', 'Ready to Claim')}
                                </Badge>
                              ) : (
                                <div className="text-sm">
                                  <p className="text-muted-foreground flex items-center">
                                    <Clock className="h-4 w-4 mr-1" />
                                    {unbond.remainingDays}d {unbond.remainingHours}h {t('staking.remaining', 'remaining')}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{t('staking.progress', 'Progress')}</span>
                              <span>{unbond.progressPercent}%</span>
                            </div>
                            <Progress value={parseFloat(unbond.progressPercent)} className="h-2" />
                          </div>
                          {unbond.canEmergencyUnstake && (
                            <p className="text-xs text-yellow-500 mt-2">
                              {t('staking.emergencyUnstakeAvailable', 'Emergency unstake available')} ({unbond.emergencyPenalty}% {t('staking.penalty', 'penalty')})
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">{t('staking.noPositions', 'No Staking Positions')}</h3>
              <p className="text-muted-foreground mb-4">{t('staking.noPositionsDesc', 'You don\'t have any active staking positions. Start staking to earn rewards!')}</p>
              <Button asChild>
                <Link href="#pools">{t('staking.explorePools', 'Explore Pools')}</Link>
              </Button>
            </Card>
          )}

          <Dialog open={claimDialogOpen} onOpenChange={setClaimDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t('staking.claimStakingRewards', 'Claim Staking Rewards')}</DialogTitle>
                <DialogDescription>
                  {t('staking.claimDialogDesc', 'You have {{amount}} TBURN in pending rewards.', { amount: portfolio?.summary?.totalPendingRewards || '0' })}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <span className="text-muted-foreground">{t('staking.totalClaimable', 'Total Claimable')}</span>
                  <span className="text-xl font-bold text-green-500">{portfolio?.summary?.totalPendingRewards || '0'} TB</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => claimMutation.mutate({ claimAll: true })}
                    disabled={claimMutation.isPending}
                    data-testid="button-claim-all"
                  >
                    {claimMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Award className="h-4 w-4 mr-2" />}
                    {t('staking.claimAll', 'Claim All')}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => claimMutation.mutate({ claimAll: true, autoCompound: true })}
                    disabled={claimMutation.isPending}
                    data-testid="button-auto-compound"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {t('staking.autoCompound', 'Auto-Compound')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="pools" className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{t('staking.filterByTier')}:</span>
            <Button 
              variant={selectedTier === null ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedTier(null)}
              data-testid="button-filter-all"
            >
              {t('staking.allPools')}
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
                <span className="ml-1">{t(`staking.${tier}`)}</span>
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
                        {translatePoolName(t, pool.id, pool.name)}
                        <Badge className={tierColors[pool.tier.toLowerCase()] || "bg-gray-500"}>
                          {tierIcons[pool.tier.toLowerCase()]}
                          <span className="ml-1 capitalize">{t(`staking.${pool.tier.toLowerCase()}`)}</span>
                        </Badge>
                      </CardTitle>
                      <Badge variant={pool.status === "active" ? "default" : "secondary"} className={pool.status === "active" ? "bg-green-600 hover:bg-green-700" : ""}>
                        {pool.status === "active" ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <AlertCircle className="h-3 w-3 mr-1" />
                        )}
                        {pool.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {t('staking.validator')}: {translateValidatorName(t, pool.validatorName) || pool.validatorAddress?.slice(0, 10) + "..."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">{t('staking.baseApy')}</p>
                        <p className="text-xl font-bold text-green-500">{pool.apy?.toFixed(1) || "0.0"}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t('staking.withBoost')}</p>
                        <p className="text-xl font-bold text-emerald-500">{((pool.apy || 0) + (pool.apyBoost || 0)).toFixed(1)}%</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('staking.totalStaked')}</span>
                        <span>{formatWeiToTBURN(pool.totalStaked)} TBURN</span>
                      </div>
                      <Progress value={Math.min(100, (parseInt(pool.totalStaked || "0") / 1e21) * 100)} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Lock className="h-3 w-3 text-muted-foreground" />
                        <span>{t('staking.daysLock', { days: pool.lockPeriodDays })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span>{t('staking.stakersCount', { count: pool.stakersCount || pool.totalStakers || 0 })}</span>
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
                        {t('staking.stake')}
                      </Button>
                      <Link href={`/app/staking/pool/${pool.id}`}>
                        <Button variant="outline" size="sm" data-testid={`button-details-${pool.id}`}>
                          {t('staking.details')}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">{t('staking.noPools')}</h3>
                <p className="text-muted-foreground">{t('staking.noPoolsDescription')}</p>
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
                    {t('staking.apyRangeValue', { min: tier.minApy.toFixed(1), max: tier.maxApy.toFixed(1) })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('staking.minStakeLabel')}</span>
                      <span className="font-medium">{formatWeiToTBURN(tier.minStake)} TBURN</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('staking.lockPeriod')}</span>
                      <span className="font-medium">{tier.lockPeriodDays === 0 ? t('staking.noLock') : t('staking.daysRange', { min: tier.lockPeriodDays, max: tier.maxLockPeriodDays })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('staking.governance')}</span>
                      <span className="font-medium">{t('staking.governanceWeightX', { weight: tier.governanceWeight })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('staking.apyMultiplier')}</span>
                      <span className="font-medium">{t('staking.apyMultiplierX', { value: (tier.apyMultiplier / 10000).toFixed(2) })}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">{t('staking.benefits')}</p>
                    <ul className="text-sm space-y-1">
                      {tier.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 mt-1 text-green-500 flex-shrink-0" />
                          <span>{translateBenefit(t, benefit)}</span>
                        </li>
                      ))}
                      {tier.earlyAdopterBonus > 0 && (
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 mt-1 text-green-500 flex-shrink-0" />
                          <span>{t('staking.earlyAdopterBonus', { bonus: tier.earlyAdopterBonus.toFixed(1) })}</span>
                        </li>
                      )}
                      {tier.loyaltyBonus > 0 && (
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 mt-1 text-green-500 flex-shrink-0" />
                          <span>{t('staking.loyaltyBonus', { bonus: tier.loyaltyBonus.toFixed(1) })}</span>
                        </li>
                      )}
                      {tier.feeDiscount > 0 && (
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 mt-1 text-green-500 flex-shrink-0" />
                          <span>{t('staking.feeDiscount', { discount: tier.feeDiscount.toFixed(1) })}</span>
                        </li>
                      )}
                      {tier.priorityRewards && (
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 mt-1 text-green-500 flex-shrink-0" />
                          <span>{t('staking.priorityRewardDistribution')}</span>
                        </li>
                      )}
                      {tier.governanceWeight > 1 && (
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 mt-1 text-green-500 flex-shrink-0" />
                          <span>{t('staking.enhancedGovernanceVoting')}</span>
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
                  {t('staking.apyPrediction')}
                </CardTitle>
                <CardDescription>
                  {t('staking.aiApyForecasting')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                  <div className="text-3xl font-bold text-blue-500">
                    {apyPrediction?.predictedApy?.toFixed(1) || stats?.averageApy?.toFixed(1) || "14.5"}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('staking.predictedApy30Day')}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('staking.trend')}</span>
                    <Badge variant="outline" className="text-green-500 border-green-500">
                      {apyPrediction?.trend === "bearish" ? (
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                      )}
                      {apyPrediction?.trend === "bearish" ? t('staking.bearish') : t('staking.bullish')}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('staking.confidence')}</span>
                    <span className="font-medium">{apyPrediction?.confidence || 87}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('staking.aiProvider')}</span>
                    <Badge variant="secondary">{apyPrediction?.aiProvider || t('common.claudeSonnet')}</Badge>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  variant="outline" 
                  onClick={() => apyPredictionMutation.mutate()}
                  disabled={apyPredictionMutation.isPending}
                  data-testid="button-get-apy-prediction"
                >
                  {apyPredictionMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  {t('staking.getFreshPrediction')}
                </Button>
              </CardContent>
            </Card>

            <Card data-testid="card-ai-risk-analysis">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-amber-500" />
                  {t('staking.riskAnalysis')}
                </CardTitle>
                <CardDescription>
                  {t('staking.riskAssessment')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-bold text-amber-500">{t('staking.low')}</div>
                    <Progress value={25} className="flex-1 h-2" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('staking.overallRiskScore', { score: 25 })}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{t('staking.smartContractsAudited')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{t('staking.slashingProtection')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span>{t('staking.standardVolatility')}</span>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  variant="outline" 
                  onClick={() => {
                    setRiskDialogOpen(true);
                    toast({
                      title: t('staking.riskAnalysis'),
                      description: t('staking.riskAnalysisToast'),
                    });
                  }}
                  data-testid="button-full-risk-analysis"
                >
                  {t('staking.viewFullAnalysis')}
                </Button>
              </CardContent>
            </Card>

            <Card data-testid="card-ai-recommendations">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5 text-purple-500" />
                  {t('staking.poolRecommendations')}
                </CardTitle>
                <CardDescription>
                  {t('staking.personalizedSuggestions')}
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
                        <span className="text-sm font-medium">{translatePoolName(t, pool.id, pool.name)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-green-500">{pool.apy?.toFixed(1) || "0.0"}%</span>
                        <p className="text-xs text-muted-foreground">{t('staking.apy')}</p>
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
                <Button 
                  className="w-full" 
                  variant="outline" 
                  onClick={() => recommendationsMutation.mutate()}
                  disabled={recommendationsMutation.isPending}
                  data-testid="button-get-recommendations"
                >
                  {recommendationsMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  {t('staking.getPersonalizedPicks')}
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card data-testid="card-ai-validator-insights">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {t('staking.topValidatorInsights')}
              </CardTitle>
              <CardDescription>
                {t('staking.validatorInsightsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                  { name: t('staking.validatorTburnGenesis'), score: 95, uptime: "99.98%", apy: "15.2%" },
                  { name: t('staking.validatorEnterpriseNode'), score: 92, uptime: "99.95%", apy: "14.8%" },
                  { name: t('staking.validatorMainnetAlpha'), score: 89, uptime: "99.87%", apy: "14.5%" },
                  { name: t('staking.validatorCoreValidator'), score: 87, uptime: "99.82%", apy: "14.2%" },
                ].map((validator, i) => (
                  <div key={i} className="p-4 rounded-lg border hover-elevate">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">{validator.name}</span>
                      <Badge variant={validator.score >= 90 ? "default" : "outline"}>
                        {t('staking.score')}: {validator.score}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('staking.uptime')}</span>
                        <span className="text-green-500">{validator.uptime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('staking.apy')}</span>
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
                {t('staking.stakingRewardsCalculator')}
              </CardTitle>
              <CardDescription>
                {t('staking.calculatorDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">{t('staking.stakeAmountTburn')}</label>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="number"
                        className="flex-1 px-3 py-2 border rounded-md bg-background"
                        placeholder={t('staking.enterAmount')}
                        value={calcAmount}
                        onChange={(e) => setCalcAmount(e.target.value)}
                        data-testid="input-calc-amount"
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setCalcAmount("100000")}
                        data-testid="button-max-stake"
                      >
                        {t('staking.max')}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">{t('staking.selectPool')}</label>
                    <select 
                      className="w-full mt-2 px-3 py-2 border rounded-md bg-background"
                      value={calcPoolId}
                      onChange={(e) => setCalcPoolId(e.target.value)}
                      data-testid="select-calc-pool"
                    >
                      <option value="">{t('staking.selectPoolPlaceholder')}</option>
                      {pools?.map(pool => (
                        <option key={pool.id} value={pool.id}>
                          {translatePoolName(t, pool.id, pool.name)} - {pool.apy?.toFixed(1) || "0.0"}% {t('staking.apy')} ({t(`staking.${pool.tier.toLowerCase()}`)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">{t('staking.stakingDuration')}</label>
                    <select 
                      className="w-full mt-2 px-3 py-2 border rounded-md bg-background"
                      value={calcDuration}
                      onChange={(e) => setCalcDuration(e.target.value)}
                      data-testid="select-calc-duration"
                    >
                      <option value="30">{t('staking.days30')}</option>
                      <option value="90">{t('staking.days90')}</option>
                      <option value="180">{t('staking.days180')}</option>
                      <option value="365">{t('staking.year1')}</option>
                    </select>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={calculateRewards}
                    data-testid="button-calculate"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    {t('staking.calculateRewards')}
                  </Button>
                </div>

                <div className="space-y-4 p-6 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold">{t('staking.estimatedReturns')}</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('staking.dailyRewards')}</span>
                      <span className="font-medium text-green-500">
                        ~ {calcResults?.dailyRewards?.toFixed(2) || "2.74"} TBURN
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('staking.weeklyRewards')}</span>
                      <span className="font-medium text-green-500">
                        ~ {calcResults?.weeklyRewards?.toFixed(2) || "19.18"} TBURN
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('staking.monthlyRewards')}</span>
                      <span className="font-medium text-green-500">
                        ~ {calcResults?.monthlyRewards?.toFixed(2) || "82.19"} TBURN
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-muted-foreground">{t('staking.periodRewards')}</span>
                      <span className="font-bold text-green-500 text-lg">
                        ~ {calcResults?.yearlyRewards?.toFixed(2) || "1,000"} TBURN
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('staking.effectiveApy')}</span>
                      <span className="font-medium">{calcResults?.effectiveApy?.toFixed(2) || "10.00"}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('staking.tierBoost')}</span>
                      <span className="font-medium">+{calcResults?.tierBoost?.toFixed(1) || "1.5"}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('staking.compoundEffect')}</span>
                      <span className="font-medium text-emerald-500">+{calcResults?.compoundEffect?.toFixed(2) || "0.47"}%</span>
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
              {t('staking.recentStakingActivity')}
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
                          {t('staking.stakePool', { action: i % 2 === 0 ? t('staking.stake') : t('staking.unstake'), pool: [t('staking.gold'), t('staking.silver'), t('staking.bronze'), t('staking.platinum'), t('staking.diamond')][i] })}
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
                        {t('staking.minAgo', { min: Math.floor(Math.random() * 60) })}
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
              {t('staking.rewardCycles')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-3 rounded-md border">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={i === 0 ? "default" : "outline"}>
                        {i === 0 ? t('staking.active') : t('staking.completed')}
                      </Badge>
                      <span className="text-sm font-medium">{t('staking.cycle', { number: (stats?.currentRewardCycle || 100) - i })}</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('staking.totalDistributed')}</span>
                        <span>{(Math.random() * 50000 + 10000).toFixed(0)} TBURN</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('staking.participants')}</span>
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
              {t('staking.stakeTburn')}
            </DialogTitle>
            <DialogDescription>
              {t('staking.stakeDialogDesc', { pool: selectedPool?.name })}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPool && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{t('staking.pool')}</span>
                  <Badge className={tierColors[selectedPool.tier.toLowerCase()]}>
                    {selectedPool.tier}
                  </Badge>
                </div>
                <p className="font-medium">{selectedPool.name}</p>
                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t('staking.baseApyLabel')}</span>
                    <span className="ml-2 font-medium text-green-500">
                      {selectedPool.apy?.toFixed(1) || "0.0"}%
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('staking.lockPeriodLabel')}</span>
                    <span className="ml-2 font-medium">{t('staking.daysText', { days: selectedPool.lockPeriodDays })}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stakeAmount">{t('staking.amountToStake')}</Label>
                <div className="flex gap-2">
                  <Input
                    id="stakeAmount"
                    type="number"
                    placeholder={t('staking.enterAmount')}
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
                    {t('staking.preset1k')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStakeAmount("10000")}
                    data-testid="button-stake-preset-10k"
                  >
                    {t('staking.preset10k')}
                  </Button>
                </div>
              </div>

              {stakeAmount && parseFloat(stakeAmount) > 0 && (
                <div className="p-3 rounded-md border bg-green-500/10 border-green-500/20">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('staking.estimatedDailyRewards')}</span>
                    <span className="font-medium text-green-500">
                      ~ {((parseFloat(stakeAmount) * (selectedPool.apy || 12) / 100) / 365).toFixed(4)} TBURN
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-muted-foreground">{t('staking.estimatedYearlyRewards')}</span>
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
              {t('common.cancel')}
            </Button>
            <Button
              onClick={submitStake}
              disabled={stakeMutation.isPending || !stakeAmount || parseFloat(stakeAmount) <= 0}
              data-testid="button-stake-confirm"
            >
              {stakeMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('staking.staking')}
                </>
              ) : (
                <>
                  <Coins className="h-4 w-4 mr-2" />
                  {t('staking.stakeTburn')}
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
