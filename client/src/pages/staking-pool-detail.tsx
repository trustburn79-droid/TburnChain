import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowLeft,
  Coins, 
  TrendingUp,
  Activity,
  Shield,
  Award,
  Clock,
  Users,
  Percent,
  Lock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Copy,
  BarChart3,
  Gift,
  Zap,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Info
} from "lucide-react";
import { formatNumber } from "@/lib/formatters";
import { useToast } from "@/hooks/use-toast";

interface StakingPool {
  id: string;
  name: string;
  poolType: string;
  tier: string;
  validatorId: string;
  validatorAddress: string;
  validatorName: string;
  minStake: string;
  maxStake: string | null;
  apy: number;
  apyBoost: number;
  totalStaked: string;
  stakersCount: number;
  lockPeriodDays: number;
  earlyWithdrawalPenalty: number;
  status: string;
  isCompoundingEnabled: boolean;
  rewardFrequency: string;
  description: string;
  createdAt: string;
}

interface StakingPosition {
  id: string;
  stakerAddress: string;
  poolId: string;
  stakedAmount: string;
  pendingRewards: string;
  tier: string;
  autoCompound: boolean;
  status: string;
  createdAt: string;
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

function formatWeiToTBURN(weiStr: string): string {
  try {
    const wei = BigInt(weiStr);
    const tburn = Number(wei) / 1e18;
    if (tburn >= 1e9) return `${(tburn / 1e9).toFixed(2)}B`;
    if (tburn >= 1e6) return `${(tburn / 1e6).toFixed(2)}M`;
    if (tburn >= 1e3) return `${(tburn / 1e3).toFixed(2)}K`;
    return tburn.toFixed(2);
  } catch {
    return "0";
  }
}

const statusTranslationKeys: Record<string, string> = {
  active: 'common.active',
  inactive: 'common.inactive',
  pending: 'common.pending',
  paused: 'staking.paused',
  closed: 'staking.closed'
};

const frequencyTranslationKeys: Record<string, string> = {
  daily: 'staking.daily',
  weekly: 'staking.weekly',
  monthly: 'staking.monthly',
  hourly: 'staking.hourly'
};

const poolTypeTranslationKeys: Record<string, string> = {
  public: 'staking.poolTypes.public',
  private: 'staking.poolTypes.private',
  enterprise: 'staking.poolTypes.enterprise',
  institutional: 'staking.poolTypes.institutional'
};

export default function StakingPoolDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [stakeAmount, setStakeAmount] = useState("");
  const [autoCompound, setAutoCompound] = useState(true);
  const [stakeDialogOpen, setStakeDialogOpen] = useState(false);

  const { data: pool, isLoading: poolLoading } = useQuery<StakingPool>({
    queryKey: ["/api/staking/pools", id]
  });

  const { data: positions, isLoading: positionsLoading } = useQuery<StakingPosition[]>({
    queryKey: ["/api/staking/positions", { poolId: id }]
  });

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: t('common.copied'),
      description: t('stakingPoolDetail.addressCopied')
    });
  };

  const handleStake = () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast({
        title: t('common.error'),
        description: t('stakingPoolDetail.enterStakeAmount'),
        variant: "destructive"
      });
      return;
    }

    toast({
      title: t('staking.stakeSuccessful'),
      description: `${stakeAmount} TBURN`
    });
    setStakeDialogOpen(false);
    setStakeAmount("");
  };

  if (poolLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">{t('stakingPoolDetail.poolNotFound')}</h3>
            <p className="text-muted-foreground">{t('stakingPoolDetail.poolNotFoundDesc')}</p>
            <Link href="/staking">
              <Button className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('common.back')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/staking">
          <Button variant="ghost" size="sm" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t('common.back')}
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold" data-testid="text-pool-name">{pool.name}</h1>
            <Badge className={tierColors[pool.tier.toLowerCase()] || "bg-gray-500"}>
              {tierIcons[pool.tier.toLowerCase()]}
              <span className="ml-1 capitalize">{pool.tier}</span>
            </Badge>
            <Badge variant={pool.status === "active" ? "default" : "secondary"}>
              {pool.status === "active" ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <AlertCircle className="h-3 w-3 mr-1" />
              )}
              {t(statusTranslationKeys[pool.status.toLowerCase()] || 'common.unknown')}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">{pool.description || t('stakingPoolDetail.poolOverview')}</p>
        </div>
        <Dialog open={stakeDialogOpen} onOpenChange={setStakeDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" data-testid="button-stake-now">
              <Coins className="h-4 w-4 mr-2" />
              {t('stakingPoolDetail.stakeInPool')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('stakingPoolDetail.stakeInPool')} - {pool.name}</DialogTitle>
              <DialogDescription>
                {t('stakingPoolDetail.enterStakeAmount')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t('common.amount')} (TBURN)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder={t('stakingPoolDetail.enterStakeAmount')}
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    data-testid="input-stake-dialog"
                  />
                  <Button variant="outline" size="sm">{t('stakingPoolDetail.max')}</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('stakingPoolDetail.minimumStake')}: {formatWeiToTBURN(pool.minStake)} TBURN
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('stakingPoolDetail.autoCompound')}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t('stakingPoolDetail.autoCompoundDesc')}
                  </p>
                </div>
                <Switch
                  checked={autoCompound}
                  onCheckedChange={setAutoCompound}
                  data-testid="switch-auto-compound"
                />
              </div>

              <div className="p-3 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('stakingPoolDetail.estimatedApy')}</span>
                  <span className="font-medium text-green-500">{pool.apy}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('stakingPoolDetail.lockPeriod')}</span>
                  <span className="font-medium">{pool.lockPeriodDays} {t('staking.days')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('stakingPoolDetail.earlyWithdrawalPenalty')}</span>
                  <span className="font-medium">{pool.earlyWithdrawalPenalty}%</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStakeDialogOpen(false)}>{t('common.cancel')}</Button>
              <Button onClick={handleStake} data-testid="button-confirm-stake">
                <CheckCircle className="h-4 w-4 mr-2" />
                {t('stakingPoolDetail.confirmStake')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-total-staked">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stakingPoolDetail.totalValueLocked')}</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatWeiToTBURN(pool.totalStaked)} TBURN</div>
            <Progress value={Math.min(100, (parseInt(pool.totalStaked) / 1e21) * 100)} className="mt-2" />
          </CardContent>
        </Card>

        <Card data-testid="card-current-apy">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('staking.averageApy')}</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{pool.apy}%</div>
            <p className="text-xs text-muted-foreground">
              +{pool.apyBoost}% {t('staking.tierBoost')}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-active-stakers">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stakingPoolDetail.currentStakers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(pool.stakersCount)}</div>
            <p className="text-xs text-muted-foreground">
              {t(frequencyTranslationKeys[pool.rewardFrequency.toLowerCase()] || 'common.unknown')} {t('wallets.rewards')}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-lock-period">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stakingPoolDetail.lockPeriod')}</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pool.lockPeriodDays} {t('staking.days')}</div>
            <p className="text-xs text-muted-foreground">
              {pool.earlyWithdrawalPenalty}% {t('stakingPoolDetail.earlyWithdrawalPenalty')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2" data-testid="card-pool-info">
          <CardHeader>
            <CardTitle>{t('stakingPoolDetail.poolOverview')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">{t('staking.poolType')}</span>
                  <span className="font-medium capitalize">{t(poolTypeTranslationKeys[pool.poolType.toLowerCase()] || 'common.unknown')}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">{t('staking.tier')}</span>
                  <Badge className={tierColors[pool.tier.toLowerCase()]}>
                    {tierIcons[pool.tier.toLowerCase()]}
                    <span className="ml-1 capitalize">{pool.tier}</span>
                  </Badge>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">{t('stakingPoolDetail.minimumStake')}</span>
                  <span className="font-medium">{formatWeiToTBURN(pool.minStake)} TBURN</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">{t('stakingPoolDetail.maximumStake')}</span>
                  <span className="font-medium">
                    {pool.maxStake ? formatWeiToTBURN(pool.maxStake) + " TBURN" : t('common.none')}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">{t('stakingPoolDetail.compoundingEnabled')}</span>
                  <Badge variant={pool.isCompoundingEnabled ? "default" : "outline"}>
                    {pool.isCompoundingEnabled ? t('members.enabled') : t('members.disabled')}
                  </Badge>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">{t('stakingPoolDetail.rewardFrequency')}</span>
                  <span className="font-medium capitalize">{t(frequencyTranslationKeys[pool.rewardFrequency.toLowerCase()] || 'common.unknown')}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">{t('common.date')}</span>
                  <span className="font-medium">
                    {new Date(pool.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">{t('stakingPoolDetail.poolIdLabel')}</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs">{pool.id.slice(0, 8)}...</span>
                    <Button variant="ghost" size="sm" onClick={() => copyAddress(pool.id)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-validator-info">
          <CardHeader>
            <CardTitle>{t('validators.validator')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">{pool.validatorName || t('stakingPoolDetail.defaultValidator')}</p>
                <p className="text-xs text-muted-foreground">
                  {pool.validatorAddress?.slice(0, 10)}...{pool.validatorAddress?.slice(-8)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">{t('common.status')}</span>
                <Badge variant="default">{t('common.active')}</Badge>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">{t('validators.commission')}</span>
                <span className="font-medium">5%</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">{t('validators.uptime')}</span>
                <span className="font-medium text-green-500">99.98%</span>
              </div>
            </div>

            <Link href={`/validator/${pool.validatorAddress}`}>
              <Button variant="outline" className="w-full" data-testid="button-view-validator">
                {t('stakingPoolDetail.viewValidator')}
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-stakers-list">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('stakingPoolDetail.topStakers')}
          </CardTitle>
          <CardDescription>
            {t('stakingPoolDetail.topStakers')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            {positionsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : positions && positions.length > 0 ? (
              <div className="space-y-2">
                {positions.slice(0, 10).map((position, i) => (
                  <div key={position.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-muted-foreground w-6">#{i + 1}</span>
                      <div>
                        <p className="font-mono text-sm">
                          {position.stakerAddress.slice(0, 10)}...{position.stakerAddress.slice(-8)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {position.autoCompound ? t('stakingPoolDetail.autoCompound') : t('common.none')} | {position.tier}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatWeiToTBURN(position.stakedAmount)} TBURN</p>
                      <p className="text-xs text-green-500">
                        +{formatWeiToTBURN(position.pendingRewards)} {t('common.pending')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('stakingPoolDetail.noPositionDesc')}</p>
                <Button className="mt-4" onClick={() => setStakeDialogOpen(true)}>
                  {t('stakingPoolDetail.stakeNow')}
                </Button>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}