import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Server, Award, Users, TrendingUp, Shield, Target, Brain, Vote, Coins, Crown, Layers, Flame, ArrowUpRight, X, Activity, Power, Ban, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAddress, formatTokenAmount, formatPercentage, formatNumber } from "@/lib/format";
import type { Validator } from "@shared/schema";
import { useEffect, useState } from "react";
import { useWebSocket } from "@/lib/websocket-context";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface TierInfo {
  name: string;
  maxValidators: number;
  currentValidators?: number;
  currentDelegators?: number;
  minStakeTBURN: number;
  rewardPoolShare: number;
  dailyRewardPool: number;
  avgDailyReward: number;
  targetAPY: number;
  apyRange: { min: number; max: number };
}

interface TokenomicsTiers {
  tiers: {
    tier1: TierInfo;
    tier2: TierInfo;
    tier3: TierInfo;
  };
  emission: {
    dailyGrossEmission: number;
    dailyBurn: number;
    dailyNetEmission: number;
    annualInflationRate: number;
    burnRate: number;
  };
  security: {
    attackCostUSD: number;
    securityScore: number;
    byzantineThreshold: number;
    minSecureStake: number;
  };
  stakedAmount: number;
  stakedPercent: number;
  totalSupply: number;
  circulatingSupply: number;
  lastUpdated: string;
}

function getTierFromStake(stakeTBURN: number): 'tier_1' | 'tier_2' | 'tier_3' {
  if (stakeTBURN >= 200000) return 'tier_1';
  if (stakeTBURN >= 50000) return 'tier_2';
  return 'tier_3';
}

function getTierBadge(tier: 'tier_1' | 'tier_2' | 'tier_3', isCommitteeMember: boolean, t: (key: string) => string) {
  if (tier === 'tier_1' && isCommitteeMember) {
    return (
      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white" data-testid="badge-tier-1">
        <Crown className="h-3 w-3 mr-1" />
        {t('validators.tier1')}
      </Badge>
    );
  }
  if (tier === 'tier_1') {
    return (
      <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white" data-testid="badge-tier-1">
        <Shield className="h-3 w-3 mr-1" />
        {t('validators.tier1')}
      </Badge>
    );
  }
  if (tier === 'tier_2') {
    return (
      <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white" data-testid="badge-tier-2">
        <Layers className="h-3 w-3 mr-1" />
        {t('validators.tier2')}
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" data-testid="badge-tier-3">
      <Users className="h-3 w-3 mr-1" />
      {t('validators.tier3')}
    </Badge>
  );
}

interface ValidatorWithPower extends Validator {
  votingPower: string;
  votingPowerNumber: number;
  stakeInTBURN: number;
  tier: 'tier_1' | 'tier_2' | 'tier_3';
}

interface ValidatorDetailModalProps {
  validator: ValidatorWithPower | null;
  isCommitteeMember: boolean;
  open: boolean;
  onClose: () => void;
}

function ValidatorDetailModal({ validator, isCommitteeMember, open, onClose }: ValidatorDetailModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [delegateAmount, setDelegateAmount] = useState("");
  const [showDelegateForm, setShowDelegateForm] = useState(false);

  const delegateMutation = useMutation({
    mutationFn: async (amount: string) => {
      const res = await apiRequest('POST', `/api/validators/${validator?.address}/delegate`, { amount });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: t('validators.delegationSuccessful'),
        description: t('validators.delegationSuccessDesc', { amount: delegateAmount }),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/validators'] });
      setShowDelegateForm(false);
      setDelegateAmount("");
    },
    onError: () => {
      toast({
        title: t('validators.delegationFailed'),
        description: t('validators.delegationFailedDesc'),
        variant: "destructive",
      });
    },
  });

  const claimRewardsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/validators/${validator?.address}/claim-rewards`);
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: t('validators.rewardsClaimed'),
        description: t('validators.rewardsClaimedDesc', { amount: formatTokenAmount(data.amount) }),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/validators'] });
    },
    onError: () => {
      toast({
        title: t('validators.claimFailed'),
        description: t('validators.claimFailedDesc'),
        variant: "destructive",
      });
    },
  });

  if (!validator) return null;

  const votingPower = BigInt(validator.stake) + BigInt(validator.delegatedStake || 0);
  const votingPowerTBURN = Number(votingPower / BigInt(1e18));
  const isActive = validator.status === 'active';
  const isJailed = validator.status === 'jailed';
  const directStake = parseFloat(validator.stake) / 1e18;
  const delegatedAmount = parseFloat(validator.delegatedStake || "0") / 1e18;

  const pieData = [
    { name: t('validators.directStake'), value: directStake },
    { name: t('validators.delegated'), value: delegatedAmount }
  ];
  const COLORS = ['#8b5cf6', '#22c55e'];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden" data-testid="modal-validator-detail">
        <div className="flex flex-col h-full">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold">{validator.name}</DialogTitle>
                  <DialogDescription className="font-mono text-xs break-all">
                    {validator.address}
                  </DialogDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getTierBadge(validator.tier, isCommitteeMember, t)}
                {isActive ? (
                  <Badge className="bg-green-600">{t('validators.active')}</Badge>
                ) : isJailed ? (
                  <Badge variant="destructive">{t('validators.jailed')}</Badge>
                ) : (
                  <Badge variant="secondary">{t('validators.inactive')}</Badge>
                )}
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 px-6 py-4">
            {isJailed && (
              <Card className="border-destructive bg-destructive/10 mb-4">
                <CardContent className="pt-4 flex items-center gap-2">
                  <Ban className="h-5 w-5 text-destructive" />
                  <span className="text-sm text-destructive">{t('validators.jailedWarning')}</span>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Vote className="h-4 w-4 text-purple-500" />
                    <span className="text-xs text-muted-foreground">{t('validators.votingPower')}</span>
                  </div>
                  <p className="text-lg font-bold">{formatNumber(votingPowerTBURN)}</p>
                  <p className="text-xs text-muted-foreground">TBURN</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-xs text-muted-foreground">{t('validators.delegators')}</span>
                  </div>
                  <p className="text-lg font-bold">{formatNumber(validator.delegators)}</p>
                  <p className="text-xs text-muted-foreground">{t('validators.totalText')}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-muted-foreground">{t('validators.apy')}</span>
                  </div>
                  <p className="text-lg font-bold text-green-500">{(validator.apy / 100).toFixed(2)}%</p>
                  <p className="text-xs text-muted-foreground">{t('staking.annual')}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="h-4 w-4 text-orange-500" />
                    <span className="text-xs text-muted-foreground">{t('validators.uptime')}</span>
                  </div>
                  <p className="text-lg font-bold">{(validator.uptime / 100).toFixed(2)}%</p>
                  <Progress value={validator.uptime / 100} className="mt-1" />
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="overview">{t('validators.overview')}</TabsTrigger>
                <TabsTrigger value="performance">{t('validators.performance')}</TabsTrigger>
                <TabsTrigger value="staking">{t('validators.staking')}</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{t('validators.directStake')}</span>
                      <span className="text-sm font-medium">{formatNumber(directStake)} TBURN</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{t('validators.delegatedStake')}</span>
                      <span className="text-sm font-medium">{formatNumber(delegatedAmount)} TBURN</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{t('validators.commission')}</span>
                      <span className="text-sm font-medium">{(validator.commission / 100).toFixed(2)}%</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{t('validators.totalBlocks')}</span>
                      <span className="text-sm font-medium">{formatNumber(validator.totalBlocks)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{t('validators.committeeMember')}</span>
                      <span className="text-sm font-medium">
                        {isCommitteeMember ? (
                          <Badge className="bg-purple-600 text-xs">{t('validators.yes')}</Badge>
                        ) : (
                          <span>{t('validators.no')}</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">{t('validators.votingPowerDistribution')}</p>
                    <ResponsiveContainer width="100%" height={150}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={60}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {pieData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `${formatNumber(value)} TBURN`} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                        <span>{t('validators.direct')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span>{t('validators.delegated')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">{t('validators.aiTrustScore')}</span>
                      </div>
                      <p className="text-2xl font-bold">{(validator.aiTrustScore / 100).toFixed(1)}%</p>
                      <Progress value={validator.aiTrustScore / 100} className="mt-2" />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">{t('validators.reputationScore')}</span>
                      </div>
                      <p className="text-2xl font-bold">{validator.reputationScore || 0}/100</p>
                      <Progress value={validator.reputationScore || 0} className="mt-2" />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">{t('validators.performanceScore')}</span>
                      </div>
                      <p className="text-2xl font-bold">{validator.performanceScore || 0}/100</p>
                      <Progress value={validator.performanceScore || 0} className="mt-2" />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">{t('validators.behaviorScore')}</span>
                      </div>
                      <p className="text-2xl font-bold">{validator.behaviorScore || 0}/100</p>
                      <Progress value={validator.behaviorScore || 0} className="mt-2" />
                    </CardContent>
                  </Card>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">{t('validators.participationRate')}</p>
                    <p className="text-lg font-semibold">{((validator.uptime || 0) / 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('validators.avgBlockTime')}</p>
                    <p className="text-lg font-semibold">{validator.avgBlockTime || 0}ms</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('validators.missedBlocks')}</p>
                    <p className="text-lg font-semibold">{validator.missedBlocks || 0}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="staking" className="space-y-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-medium">{t('validators.delegateToValidator')}</p>
                        <p className="text-xs text-muted-foreground">{t('validators.earnApyByDelegating', { apy: (validator.apy / 100).toFixed(2) })}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDelegateForm(!showDelegateForm)}
                        disabled={!isActive}
                        data-testid="button-delegate-modal"
                      >
                        <Coins className="h-4 w-4 mr-1" />
                        {t('validators.delegate')}
                      </Button>
                    </div>
                    {showDelegateForm && (
                      <div className="space-y-3 pt-3 border-t">
                        <div>
                          <Label htmlFor="delegate-amount">{t('validators.amountTburn')}</Label>
                          <Input
                            id="delegate-amount"
                            type="number"
                            value={delegateAmount}
                            onChange={(e) => setDelegateAmount(e.target.value)}
                            placeholder={t('validators.enterAmountToDelegate')}
                            data-testid="input-delegate-amount-modal"
                          />
                        </div>
                        {delegateAmount && (
                          <p className="text-xs text-muted-foreground">
                            {t('validators.estimatedDailyReward', { amount: formatNumber(parseFloat(delegateAmount) * validator.apy / 36500) })}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => delegateMutation.mutate(delegateAmount)}
                            disabled={!delegateAmount || delegateMutation.isPending}
                            data-testid="button-confirm-delegate-modal"
                          >
                            {t('validators.confirm')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowDelegateForm(false);
                              setDelegateAmount("");
                            }}
                          >
                            {t('validators.cancel')}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {isActive && (
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{t('validators.claimRewardsTitle')}</p>
                          <p className="text-xs text-muted-foreground">{t('validators.claimRewardsDesc')}</p>
                        </div>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => claimRewardsMutation.mutate()}
                          disabled={claimRewardsMutation.isPending}
                          data-testid="button-claim-rewards-modal"
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          {t('validators.claim')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t">
            <Button variant="outline" onClick={onClose} data-testid="button-close-modal">
              {t('validators.close')}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Validators() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { data: validators, isLoading } = useQuery<Validator[]>({
    queryKey: ["/api/validators"],
  });

  const { data: tierData, isLoading: tiersLoading } = useQuery<TokenomicsTiers>({
    queryKey: ["/api/tokenomics/tiers"],
  });

  const [votingActivity, setVotingActivity] = useState<any[]>([]);
  const [validatorUpdates, setValidatorUpdates] = useState<any>(null);
  const [selectedValidator, setSelectedValidator] = useState<ValidatorWithPower | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { lastMessage } = useWebSocket();
  
  useEffect(() => {
    if (lastMessage?.data) {
      try {
        const message = JSON.parse(lastMessage.data);
        if (message.type === 'voting_activity') {
          setVotingActivity(message.data);
          queryClient.invalidateQueries({ queryKey: ['/api/validators'] });
        } else if (message.type === 'validators_update') {
          setValidatorUpdates(message.data);
          queryClient.invalidateQueries({ queryKey: ['/api/validators'] });
        }
      } catch (error) {
      }
    }
  }, [lastMessage]);

  const validatorsWithPower = validators?.map(v => {
    const votingPower = BigInt(v.stake) + BigInt(v.delegatedStake || 0);
    const stakeInTBURN = Number(BigInt(v.stake) / BigInt(1e18));
    return {
      ...v,
      votingPower: votingPower.toString(),
      votingPowerNumber: Number(votingPower / BigInt(1e18)),
      stakeInTBURN,
      tier: getTierFromStake(stakeInTBURN),
    };
  }).sort((a, b) => Number(BigInt(b.votingPower) - BigInt(a.votingPower))) || [];

  const committeeMembers = new Set(validatorsWithPower.slice(0, 21).map(v => v.address));

  const activeValidators = validators?.filter(v => v.status === "active").length || 0;
  const totalStake = validators?.reduce((sum, v) => sum + parseFloat(v.stake), 0) || 0;
  const totalDelegated = validators?.reduce((sum, v) => sum + parseFloat(v.delegatedStake || "0"), 0) || 0;
  const avgApy = (validators?.reduce((sum, v) => sum + v.apy, 0) || 0) / (validators?.length || 1) / 100;

  const tier1Count = validatorsWithPower.filter(v => v.tier === 'tier_1').length;
  const tier2Count = validatorsWithPower.filter(v => v.tier === 'tier_2').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-600">{t('common.active')}</Badge>;
      case "inactive":
        return <Badge variant="secondary">{t('common.inactive')}</Badge>;
      case "jailed":
        return <Badge variant="destructive">{t('validators.jailed')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold flex items-center gap-2" data-testid="text-validators-title">
          <Server className="h-8 w-8" />
          {t('validators.title')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('validators.subtitle')}
        </p>
      </div>

      {/* Tiered System Overview */}
      {tierData && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-500" />
                {t('validators.tier1ActiveCommittee')}
              </CardTitle>
              <CardDescription>{t('validators.tier1Desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-amber-500" data-testid="tier1-count">{tier1Count}</p>
                  <p className="text-xs text-muted-foreground">{t('validators.activeCount')}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-500" data-testid="tier1-apy">{tierData.tiers.tier1.targetAPY}%</p>
                  <p className="text-xs text-muted-foreground">{t('validators.targetApy')}</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{formatNumber(tierData.tiers.tier1.dailyRewardPool)}</p>
                  <p className="text-xs text-muted-foreground">{t('validators.tburnPerDay')}</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{tierData.tiers.tier1.rewardPoolShare}%</p>
                  <p className="text-xs text-muted-foreground">{t('validators.poolShare')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-cyan-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-500" />
                {t('validators.tier2StandbyValidators')}
              </CardTitle>
              <CardDescription>{t('validators.tier2Desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-blue-500" data-testid="tier2-count">{tier2Count}</p>
                  <p className="text-xs text-muted-foreground">{t('validators.standby')}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-500" data-testid="tier2-apy">{tierData.tiers.tier2.targetAPY}%</p>
                  <p className="text-xs text-muted-foreground">{t('validators.targetApy')}</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{formatNumber(tierData.tiers.tier2.dailyRewardPool)}</p>
                  <p className="text-xs text-muted-foreground">{t('validators.tburnPerDay')}</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{tierData.tiers.tier2.rewardPoolShare}%</p>
                  <p className="text-xs text-muted-foreground">{t('validators.poolShare')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-500/30 bg-gradient-to-br from-gray-500/5 to-slate-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                {t('validators.tier3Delegators')}
              </CardTitle>
              <CardDescription>{t('validators.tier3Desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-gray-500" data-testid="tier3-count">{formatNumber(tierData.tiers.tier3.currentDelegators || 0)}</p>
                  <p className="text-xs text-muted-foreground">{t('validators.delegatorsLabel')}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-500" data-testid="tier3-apy">{tierData.tiers.tier3.targetAPY}%</p>
                  <p className="text-xs text-muted-foreground">{t('validators.targetApy')}</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{formatNumber(tierData.tiers.tier3.dailyRewardPool)}</p>
                  <p className="text-xs text-muted-foreground">{t('validators.tburnPerDay')}</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{tierData.tiers.tier3.rewardPoolShare}%</p>
                  <p className="text-xs text-muted-foreground">{t('validators.poolShare')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Emission Stats */}
      {tierData && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('validators.dailyEmission')}</p>
                  <p className="text-xl font-bold" data-testid="daily-emission">{formatNumber(tierData.emission.dailyGrossEmission)} TBURN</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('validators.dailyBurn', { rate: tierData.emission.burnRate })}</p>
                  <p className="text-xl font-bold" data-testid="daily-burn">{formatNumber(tierData.emission.dailyBurn)} TBURN</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('validators.netDailyEmission')}</p>
                  <p className="text-xl font-bold" data-testid="net-emission">{formatNumber(tierData.emission.dailyNetEmission)} TBURN</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('validators.securityScore')}</p>
                  <p className="text-xl font-bold" data-testid="security-score">{tierData.security.securityScore}/100</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Validator Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {isLoading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <StatCard
              title={t('validators.activeValidators')}
              value={activeValidators}
              icon={Server}
              subtitle={`${validators?.length || 0} ${t('common.total')}`}
            />
            <StatCard
              title={t('validators.totalStake')}
              value={`${formatNumber(totalStake / 1e18)} TBURN`}
              icon={Award}
              subtitle={t('validators.directStaked')}
            />
            <StatCard
              title={t('validators.delegatedStake')}
              value={`${formatNumber(totalDelegated / 1e18)} TBURN`}
              icon={Coins}
              subtitle={t('validators.delegatedTokens')}
            />
            <StatCard
              title={t('validators.committeeSize')}
              value="21"
              icon={Crown}
              subtitle={t('validators.topValidators')}
            />
            <StatCard
              title={t('validators.totalDelegators')}
              value={formatNumber(validators?.reduce((sum, v) => sum + v.delegators, 0) || 0)}
              icon={Users}
              subtitle={t('validators.uniqueDelegators')}
            />
          </>
        )}
      </div>

      {/* Validators Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('validators.allValidators')}</CardTitle>
          <CardDescription>
            {t('validators.tieredSystemDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : validators && validators.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('validators.rank')}</TableHead>
                    <TableHead>{t('validators.validator')}</TableHead>
                    <TableHead>{t('validators.tier')}</TableHead>
                    <TableHead>{t('validators.votingPower')}</TableHead>
                    <TableHead>{t('validators.directStake')}</TableHead>
                    <TableHead>{t('validators.delegated')}</TableHead>
                    <TableHead>{t('validators.commission')}</TableHead>
                    <TableHead>{t('validators.apy')}</TableHead>
                    <TableHead>{t('validators.uptime')}</TableHead>
                    <TableHead>{t('validators.aiTrust')}</TableHead>
                    <TableHead>{t('validators.blocks')}</TableHead>
                    <TableHead>{t('validators.delegators')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validatorsWithPower.map((validator, index) => {
                    const isCommitteeMember = committeeMembers.has(validator.address);
                    const delegatedAmount = parseFloat(validator.delegatedStake || "0") / 1e18;
                    const directStake = parseFloat(validator.stake) / 1e18;
                    
                    return (
                      <TableRow
                        key={validator.id}
                        className="hover-elevate cursor-pointer"
                        data-testid={`row-validator-${validator.address?.slice(0, 10) || 'unknown'}`}
                        onClick={() => {
                          setSelectedValidator(validator);
                          setIsModalOpen(true);
                        }}
                      >
                        <TableCell className="font-mono text-sm">
                          #{index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-primary">{validator.name}</span>
                            <span className="font-mono text-xs text-muted-foreground">
                              {formatAddress(validator.address)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getTierBadge(validator.tier, isCommitteeMember, t)}
                        </TableCell>
                        <TableCell className="tabular-nums font-medium">
                          <div className="flex items-center gap-1">
                            <Vote className="h-3 w-3 text-purple-500" />
                            {formatNumber(validator.votingPowerNumber)} TBURN
                          </div>
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {formatNumber(directStake)} TBURN
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {delegatedAmount > 0 ? (
                            <div className="flex items-center gap-1">
                              <Coins className="h-3 w-3 text-yellow-500" />
                              {formatNumber(delegatedAmount)} TBURN
                            </div>
                          ) : (
                            <span className="text-muted-foreground">0 TBURN</span>
                          )}
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {(validator.commission / 100).toFixed(2)}%
                        </TableCell>
                        <TableCell className="tabular-nums text-green-600 dark:text-green-400 font-medium">
                          {(validator.apy / 100).toFixed(2)}%
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={validator.uptime / 100} className="w-16" />
                            <span className="text-sm tabular-nums">{(validator.uptime / 100).toFixed(2)}%</span>
                          </div>
                        </TableCell>
                        <TableCell data-testid={`metric-aitrust-${validator.address?.slice(0, 10) || 'unknown'}`}>
                          <div className="flex items-center gap-2">
                            <Brain className="h-3 w-3 text-purple-500" />
                            <span className="text-sm tabular-nums font-medium">{(validator.aiTrustScore / 100).toFixed(1)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {formatNumber(validator.totalBlocks)}
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {formatNumber(validator.delegators)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('validators.noValidatorsFound')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validator Detail Modal */}
      <ValidatorDetailModal
        validator={selectedValidator}
        isCommitteeMember={selectedValidator ? committeeMembers.has(selectedValidator.address) : false}
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedValidator(null);
        }}
      />
    </div>
  );
}
