import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Server, Award, Users, TrendingUp, Shield, Target, Brain, Vote, Coins, Crown, 
  Layers, Flame, ArrowUpRight, X, Activity, Power, Ban, DollarSign, Globe, Clock,
  BarChart3, PieChart as PieChartIcon, AlertTriangle, CheckCircle2, XCircle,
  Zap, Lock, Unlock, History, ExternalLink, Copy, Download, Info, ChevronRight,
  Cpu, HardDrive, Network, MapPin, Calendar, TrendingDown, Percent, Hash
} from "lucide-react";
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
import { getMarketingTiersArray, type MarketingTierConfig } from "@shared/tokenomics-config";
import { useEffect, useState } from "react";
import { Rocket } from "lucide-react";
import { useWebSocket } from "@/lib/websocket-context";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';

type MarketingTierKey = 'genesis' | 'pioneer' | 'standard' | 'community';

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
    genesis: TierInfo;
    pioneer: TierInfo;
    standard: TierInfo;
    community: TierInfo;
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

function getTierFromStake(stakeTBURN: number): MarketingTierKey {
  if (stakeTBURN >= 1_000_000) return 'genesis';
  if (stakeTBURN >= 500_000) return 'pioneer';
  if (stakeTBURN >= 200_000) return 'standard';
  return 'community';
}

function getTierBadge(tier: MarketingTierKey, isCommitteeMember: boolean, t: (key: string, options?: Record<string, unknown>) => string) {
  const tierConfig: Record<MarketingTierKey, { gradient: string; Icon: typeof Crown; translationKey: string }> = {
    genesis: { gradient: 'from-amber-500 to-orange-500', Icon: Crown, translationKey: 'validators.tierGenesis' },
    pioneer: { gradient: 'from-purple-500 to-pink-500', Icon: Rocket, translationKey: 'validators.tierPioneer' },
    standard: { gradient: 'from-blue-500 to-cyan-500', Icon: Award, translationKey: 'validators.tierStandard' },
    community: { gradient: 'from-green-500 to-emerald-500', Icon: Users, translationKey: 'validators.tierCommunity' },
  };
  
  const config = tierConfig[tier];
  const TierIcon = config.Icon;
  
  return (
    <Badge className={`bg-gradient-to-r ${config.gradient} text-white`} data-testid={`badge-tier-${tier}`}>
      <TierIcon className="h-3 w-3 mr-1" />
      {t(config.translationKey, { defaultValue: tier.charAt(0).toUpperCase() + tier.slice(1) })}
    </Badge>
  );
}

interface ValidatorWithPower extends Validator {
  votingPower: string;
  votingPowerNumber: number;
  stakeInTBURN: number;
  tier: MarketingTierKey;
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

interface TierDetailDialogProps {
  tier: MarketingTierKey | null;
  tierData: TokenomicsTiers | undefined;
  validators: ValidatorWithPower[];
  open: boolean;
  onClose: () => void;
}

function TierDetailDialog({ tier, tierData, validators, open, onClose }: TierDetailDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();

  if (!tier || !tierData) return null;

  const tierInfo = tierData.tiers[tier];
  const tierValidators = validators.filter(v => v.tier === tier);

  const tierColors: Record<MarketingTierKey, { primary: string; gradient: string; icon: typeof Crown }> = {
    genesis: { primary: 'amber', gradient: 'from-amber-500 to-orange-500', icon: Crown },
    pioneer: { primary: 'purple', gradient: 'from-purple-500 to-pink-500', icon: Rocket },
    standard: { primary: 'blue', gradient: 'from-blue-500 to-cyan-500', icon: Award },
    community: { primary: 'green', gradient: 'from-green-500 to-emerald-500', icon: Users },
  };
  const color = tierColors[tier];
  const TierIcon = color.icon;

  const avgUptime = tierValidators.length > 0 
    ? tierValidators.reduce((sum, v) => sum + v.uptime, 0) / tierValidators.length / 100
    : 0;
  const avgApy = tierValidators.length > 0 
    ? tierValidators.reduce((sum, v) => sum + v.apy, 0) / tierValidators.length / 100
    : tierInfo.targetAPY;
  const totalStake = tierValidators.reduce((sum, v) => sum + v.stakeInTBURN, 0);
  const totalBlocks = tierValidators.reduce((sum, v) => sum + v.totalBlocks, 0);
  const totalMissed = tierValidators.reduce((sum, v) => sum + (v.missedBlocks || 0), 0);
  const avgAiTrust = tierValidators.length > 0
    ? tierValidators.reduce((sum, v) => sum + v.aiTrustScore, 0) / tierValidators.length / 100
    : 0;

  const tierSeedMap: Record<MarketingTierKey, number> = { genesis: 1, pioneer: 2, standard: 3, community: 4 };
  const tierSeed = tierSeedMap[tier];
  const uptimePercent = tierValidators.length > 0 
    ? tierValidators.reduce((sum, v) => sum + v.uptime, 0) / tierValidators.length / 100
    : 98;
  const performanceData = [
    { 
      name: t('validators.week1'), 
      uptime: parseFloat((uptimePercent * (0.97 + tierSeed * 0.005)).toFixed(2)),
      blocks: Math.round(totalBlocks * 0.23)
    },
    { 
      name: t('validators.week2'), 
      uptime: parseFloat((uptimePercent * (0.98 + tierSeed * 0.003)).toFixed(2)),
      blocks: Math.round(totalBlocks * 0.24)
    },
    { 
      name: t('validators.week3'), 
      uptime: parseFloat((uptimePercent * (0.99 + tierSeed * 0.002)).toFixed(2)),
      blocks: Math.round(totalBlocks * 0.26)
    },
    { 
      name: t('validators.week4'), 
      uptime: parseFloat(uptimePercent.toFixed(2)),
      blocks: Math.round(totalBlocks * 0.27)
    },
  ];

  const stakeDistribution = tierValidators.slice(0, 10).map(v => ({
    name: v.name.slice(0, 12),
    stake: v.stakeInTBURN,
    delegated: parseFloat(v.delegatedStake || "0") / 1e18,
  }));

  const handleCopyTierInfo = () => {
    const info = `${tierInfo.name}\nValidators: ${tierValidators.length}\nTotal Stake: ${formatNumber(totalStake)} TBURN\nTarget APY: ${tierInfo.targetAPY}%`;
    navigator.clipboard.writeText(info);
    toast({ title: t('validators.copied'), description: t('validators.tierInfoCopied') });
  };

  const handleDownloadReport = () => {
    const report = {
      tier: tierInfo.name,
      validators: tierValidators.map(v => ({
        name: v.name,
        address: v.address,
        stake: v.stakeInTBURN,
        uptime: v.uptime / 100,
        apy: v.apy / 100
      })),
      summary: {
        totalValidators: tierValidators.length,
        totalStake,
        avgUptime,
        avgApy,
        rewardPoolShare: tierInfo.rewardPoolShare,
        dailyRewardPool: tierInfo.dailyRewardPool,
      }
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tier}-validators-report.json`;
    a.click();
    toast({ title: t('validators.downloaded'), description: t('validators.reportDownloaded') });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden" data-testid={`modal-${tier}-detail`}>
        <div className="flex flex-col h-full">
          <DialogHeader className={`px-6 pt-6 pb-4 border-b bg-gradient-to-r ${color.gradient} bg-opacity-10`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${color.gradient} flex items-center justify-center`}>
                  <TierIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold">{tierInfo.name}</DialogTitle>
                  <DialogDescription>
                    {t(`validators.tier${tier.charAt(0).toUpperCase() + tier.slice(1)}DescFull`, { 
                      defaultValue: `${tier.charAt(0).toUpperCase() + tier.slice(1)} tier validators` 
                    })}
                  </DialogDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleCopyTierInfo} data-testid="button-copy-tier-info">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDownloadReport} data-testid="button-download-tier-report">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 px-6 py-4">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="overview">{t('validators.overview')}</TabsTrigger>
                <TabsTrigger value="performance">{t('validators.performance')}</TabsTrigger>
                <TabsTrigger value="validators">{t('validators.validatorsList')}</TabsTrigger>
                <TabsTrigger value="economics">{t('validators.economics')}</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Server className="h-4 w-4 text-blue-500" />
                        <span className="text-xs text-muted-foreground">{t('validators.currentValidators')}</span>
                      </div>
                      <p className="text-2xl font-bold">{tierValidators.length}</p>
                      <p className="text-xs text-muted-foreground">{t('validators.maxLimit')}: {tierInfo.maxValidators.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Coins className="h-4 w-4 text-yellow-500" />
                        <span className="text-xs text-muted-foreground">{t('validators.totalStaked')}</span>
                      </div>
                      <p className="text-2xl font-bold">{formatNumber(totalStake)}</p>
                      <p className="text-xs text-muted-foreground">TBURN</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-muted-foreground">{t('validators.avgApy')}</span>
                      </div>
                      <p className="text-2xl font-bold text-green-500">{avgApy.toFixed(2)}%</p>
                      <p className="text-xs text-muted-foreground">{t('validators.target')}: {tierInfo.targetAPY}%</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity className="h-4 w-4 text-purple-500" />
                        <span className="text-xs text-muted-foreground">{t('validators.avgUptime')}</span>
                      </div>
                      <p className="text-2xl font-bold">{avgUptime.toFixed(2)}%</p>
                      <Progress value={avgUptime} className="mt-1" />
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{t('validators.tierRequirements')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">{t('validators.minStakeRequired')}</span>
                          <Badge variant="outline">{formatNumber(tierInfo.minStakeTBURN)} TBURN</Badge>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">{t('validators.rewardPoolShare')}</span>
                          <Badge variant="outline">{tierInfo.rewardPoolShare}%</Badge>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">{t('validators.dailyRewardPool')}</span>
                          <Badge variant="outline">{formatNumber(tierInfo.dailyRewardPool)} TBURN</Badge>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">{t('validators.apyRange')}</span>
                          <Badge variant="outline">{tierInfo.apyRange.min}% - {tierInfo.apyRange.max}%</Badge>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">{t('validators.avgDailyReward')}</span>
                          <Badge variant="outline">{formatNumber(tierInfo.avgDailyReward)} TBURN</Badge>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">{t('validators.fillRate')}</span>
                          <Badge variant="outline">{((tierValidators.length / tierInfo.maxValidators) * 100).toFixed(2)}%</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{t('validators.weeklyPerformance')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis domain={[95, 100]} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="uptime" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} name={t('validators.uptime')} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <Zap className="h-6 w-6 mx-auto text-yellow-500 mb-2" />
                      <p className="text-xs text-muted-foreground">{t('validators.blocksProduced')}</p>
                      <p className="text-xl font-bold">{formatNumber(tierValidators.reduce((sum, v) => sum + v.totalBlocks, 0))}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <XCircle className="h-6 w-6 mx-auto text-red-500 mb-2" />
                      <p className="text-xs text-muted-foreground">{t('validators.missedBlocks')}</p>
                      <p className="text-xl font-bold">{formatNumber(tierValidators.reduce((sum, v) => sum + (v.missedBlocks || 0), 0))}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <Brain className="h-6 w-6 mx-auto text-purple-500 mb-2" />
                      <p className="text-xs text-muted-foreground">{t('validators.avgAiTrust')}</p>
                      <p className="text-xl font-bold">
                        {tierValidators.length > 0 
                          ? (tierValidators.reduce((sum, v) => sum + v.aiTrustScore, 0) / tierValidators.length / 100).toFixed(1)
                          : 0}%
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="validators" className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>{t('validators.tierValidators')}</span>
                      <Badge variant="outline">{tierValidators.length} {t('validators.validatorsLabel')}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-2">
                        {tierValidators.slice(0, 20).map((v, idx) => (
                          <div key={v.id} className="flex items-center justify-between p-3 rounded-lg border hover-elevate">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-mono text-muted-foreground">#{idx + 1}</span>
                              <div>
                                <p className="font-medium">{v.name}</p>
                                <p className="text-xs text-muted-foreground font-mono">{formatAddress(v.address)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-sm font-medium">{formatNumber(v.stakeInTBURN)} TBURN</p>
                                <p className="text-xs text-green-500">{(v.apy / 100).toFixed(2)}% APY</p>
                              </div>
                              <Progress value={v.uptime / 100} className="w-16" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="economics" className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{t('validators.stakeDistribution')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={stakeDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value: number) => `${formatNumber(value)} TBURN`} />
                        <Bar dataKey="stake" fill="#8b5cf6" name={t('validators.directStake')} />
                        <Bar dataKey="delegated" fill="#22c55e" name={t('validators.delegated')} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <h4 className="font-medium mb-3">{t('validators.rewardDistribution')}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">{t('validators.dailyPool')}</span>
                          <span className="font-medium">{formatNumber(tierInfo.dailyRewardPool)} TBURN</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">{t('validators.perValidator')}</span>
                          <span className="font-medium">
                            {tierValidators.length > 0 ? formatNumber(tierInfo.dailyRewardPool / tierValidators.length) : 0} TBURN
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">{t('validators.annualEstimate')}</span>
                          <span className="font-medium text-green-500">{formatNumber(tierInfo.dailyRewardPool * 365)} TBURN</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <h4 className="font-medium mb-3">{t('validators.networkShare')}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">{t('validators.poolShare')}</span>
                          <span className="font-medium">{tierInfo.rewardPoolShare}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">{t('validators.stakeShare')}</span>
                          <span className="font-medium">
                            {tierData.stakedAmount > 0 ? ((totalStake / tierData.stakedAmount) * 100).toFixed(2) : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">{t('validators.validatorShare')}</span>
                          <span className="font-medium">
                            {validators.length > 0 ? ((tierValidators.length / validators.length) * 100).toFixed(2) : 0}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t">
            <Button variant="outline" onClick={onClose}>{t('validators.close')}</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface EmissionDetailDialogProps {
  type: 'emission' | 'burn' | 'netEmission' | 'security' | null;
  tierData: TokenomicsTiers | undefined;
  open: boolean;
  onClose: () => void;
}

function EmissionDetailDialog({ type, tierData, open, onClose }: EmissionDetailDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();

  if (!type || !tierData) return null;

  const configs = {
    emission: {
      title: t('validators.dailyEmissionDetail'),
      icon: ArrowUpRight,
      color: 'text-green-500',
      value: tierData.emission.dailyGrossEmission,
      unit: 'TBURN',
    },
    burn: {
      title: t('validators.dailyBurnDetail'),
      icon: Flame,
      color: 'text-orange-500',
      value: tierData.emission.dailyBurn,
      unit: 'TBURN',
    },
    netEmission: {
      title: t('validators.netEmissionDetail'),
      icon: TrendingUp,
      color: 'text-blue-500',
      value: tierData.emission.dailyNetEmission,
      unit: 'TBURN',
    },
    security: {
      title: t('validators.securityScoreDetail'),
      icon: Shield,
      color: 'text-purple-500',
      value: tierData.security.securityScore,
      unit: '/100',
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  const baseEmission = tierData.emission.dailyGrossEmission;
  const baseBurn = tierData.emission.dailyBurn;
  const baseNet = tierData.emission.dailyNetEmission;
  
  const today = new Date();
  const varianceFactors = [0.96, 0.98, 0.97, 0.99, 1.01, 1.02, 1.00];
  const emissionHistory = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/New_York' });
    const variance = varianceFactors[i];
    const emission = Math.round(baseEmission * variance);
    const burn = Math.round(baseBurn * variance);
    const net = emission - burn;
    return { date: dateStr, emission, burn, net };
  });

  const securityMetrics = [
    { label: t('validators.byzantineThreshold'), value: `${tierData.security.byzantineThreshold}%`, status: 'good' },
    { label: t('validators.attackCost'), value: `$${formatNumber(tierData.security.attackCostUSD)}`, status: 'good' },
    { label: t('validators.minSecureStake'), value: `${formatNumber(tierData.security.minSecureStake)} TBURN`, status: 'good' },
    { label: t('validators.networkDecentralization'), value: '1,600 validators', status: 'good' },
  ];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0 overflow-hidden" data-testid={`modal-${type}-detail`}>
        <div className="flex flex-col h-[85vh]">
          <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full bg-muted flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${config.color}`} />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">{config.title}</DialogTitle>
                <DialogDescription>
                  {type === 'security' ? t('validators.securityAnalysis') : t('validators.emissionAnalysis')}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 px-6 py-4 overflow-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-center py-4">
                <div className="text-center">
                  <p className={`text-5xl font-bold ${config.color}`}>
                    {type === 'security' ? config.value : formatNumber(config.value)}
                  </p>
                  <p className="text-lg text-muted-foreground mt-1">{config.unit}</p>
                </div>
              </div>

              {type !== 'security' ? (
                <>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{t('validators.last7Days')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={emissionHistory}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip formatter={(value: number) => `${formatNumber(value)} TBURN`} />
                          {type === 'emission' && (
                            <Line type="monotone" dataKey="emission" stroke="#22c55e" strokeWidth={2} name={t('validators.emission')} />
                          )}
                          {type === 'burn' && (
                            <Line type="monotone" dataKey="burn" stroke="#f97316" strokeWidth={2} name={t('validators.burn')} />
                          )}
                          {type === 'netEmission' && (
                            <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={2} name={t('validators.netEmission')} />
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <p className="text-xs text-muted-foreground">{t('validators.weeklyTotal')}</p>
                        <p className="text-xl font-bold text-green-500">
                          {formatNumber(emissionHistory.reduce((sum, d) => sum + (type === 'emission' ? d.emission : type === 'burn' ? d.burn : d.net), 0))}
                        </p>
                        <p className="text-xs text-muted-foreground">TBURN</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <p className="text-xs text-muted-foreground">{t('validators.monthlyEstimate')}</p>
                        <p className="text-xl font-bold">
                          {formatNumber(config.value * 30)}
                        </p>
                        <p className="text-xs text-muted-foreground">TBURN</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <p className="text-xs text-muted-foreground">{t('validators.annualEstimate')}</p>
                        <p className="text-xl font-bold">
                          {formatNumber(config.value * 365)}
                        </p>
                        <p className="text-xs text-muted-foreground">TBURN</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{t('validators.emissionBreakdown')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500" />
                            <span className="text-sm">{t('validators.tierGenesisPool', { defaultValue: 'Genesis Pool' })}</span>
                          </div>
                          <span className="font-medium">{formatNumber(tierData.tiers.genesis.dailyRewardPool)} TBURN</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-purple-500" />
                            <span className="text-sm">{t('validators.tierPioneerPool', { defaultValue: 'Pioneer Pool' })}</span>
                          </div>
                          <span className="font-medium">{formatNumber(tierData.tiers.pioneer.dailyRewardPool)} TBURN</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            <span className="text-sm">{t('validators.tierStandardPool', { defaultValue: 'Standard Pool' })}</span>
                          </div>
                          <span className="font-medium">{formatNumber(tierData.tiers.standard.dailyRewardPool)} TBURN</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <span className="text-sm">{t('validators.tierCommunityPool', { defaultValue: 'Community Pool' })}</span>
                          </div>
                          <span className="font-medium">{formatNumber(tierData.tiers.community.dailyRewardPool)} TBURN</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{t('validators.securityMetrics')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {securityMetrics.map((metric, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span className="text-sm">{metric.label}</span>
                            </div>
                            <Badge variant="outline">{metric.value}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{t('validators.networkHealth')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 rounded-lg bg-muted">
                          <Lock className="h-8 w-8 mx-auto text-green-500 mb-2" />
                          <p className="text-sm font-medium">{t('validators.stakingRatio')}</p>
                          <p className="text-2xl font-bold">{tierData.stakedPercent.toFixed(1)}%</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-muted">
                          <Percent className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                          <p className="text-sm font-medium">{t('validators.inflationRate')}</p>
                          <p className="text-2xl font-bold">{tierData.emission.annualInflationRate.toFixed(2)}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t shrink-0">
            <Button variant="outline" onClick={onClose}>{t('validators.close')}</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ValidatorStatsDialogProps {
  type: 'active' | 'totalStake' | 'delegatedStake' | 'committee' | 'delegators' | null;
  validators: ValidatorWithPower[];
  tierData: TokenomicsTiers | undefined;
  open: boolean;
  onClose: () => void;
}

function ValidatorStatsDialog({ type, validators, tierData, open, onClose }: ValidatorStatsDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();

  if (!type) return null;

  const activeValidators = validators.filter(v => v.status === 'active');
  const inactiveValidators = validators.filter(v => v.status === 'inactive');
  const jailedValidators = validators.filter(v => v.status === 'jailed');
  const committeeMembers = validators.slice(0, 21);
  
  const totalStake = validators.reduce((sum, v) => sum + v.stakeInTBURN, 0);
  const totalDelegated = validators.reduce((sum, v) => sum + parseFloat(v.delegatedStake || "0") / 1e18, 0);
  const totalDelegators = validators.reduce((sum, v) => sum + v.delegators, 0);

  const configs: Record<string, any> = {
    active: {
      title: t('validators.activeValidatorsDetail'),
      icon: Server,
      color: 'text-blue-500',
    },
    totalStake: {
      title: t('validators.totalStakeDetail'),
      icon: Award,
      color: 'text-purple-500',
    },
    delegatedStake: {
      title: t('validators.delegatedStakeDetail'),
      icon: Coins,
      color: 'text-yellow-500',
    },
    committee: {
      title: t('validators.committeeDetail'),
      icon: Crown,
      color: 'text-amber-500',
    },
    delegators: {
      title: t('validators.delegatorsDetail'),
      icon: Users,
      color: 'text-green-500',
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  const stakeDistribution = validators.slice(0, 15).map(v => ({
    name: v.name.slice(0, 10),
    stake: v.stakeInTBURN,
  }));

  const statusData = [
    { name: t('common.active'), value: activeValidators.length, fill: '#22c55e' },
    { name: t('common.inactive'), value: inactiveValidators.length, fill: '#6b7280' },
    { name: t('validators.jailed'), value: jailedValidators.length, fill: '#ef4444' },
  ];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0 overflow-hidden" data-testid={`modal-${type}-stats`}>
        <div className="flex flex-col h-[85vh]">
          <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full bg-muted flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${config.color}`} />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">{config.title}</DialogTitle>
                <DialogDescription>{t('validators.detailedAnalysis')}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 px-6 py-4 overflow-auto">
            {type === 'active' && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <Card className="border-green-500/30">
                    <CardContent className="pt-4 text-center">
                      <CheckCircle2 className="h-8 w-8 mx-auto text-green-500 mb-2" />
                      <p className="text-3xl font-bold text-green-500">{activeValidators.length}</p>
                      <p className="text-sm text-muted-foreground">{t('common.active')}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-gray-500/30">
                    <CardContent className="pt-4 text-center">
                      <Power className="h-8 w-8 mx-auto text-gray-500 mb-2" />
                      <p className="text-3xl font-bold">{inactiveValidators.length}</p>
                      <p className="text-sm text-muted-foreground">{t('common.inactive')}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-red-500/30">
                    <CardContent className="pt-4 text-center">
                      <Ban className="h-8 w-8 mx-auto text-red-500 mb-2" />
                      <p className="text-3xl font-bold text-red-500">{jailedValidators.length}</p>
                      <p className="text-sm text-muted-foreground">{t('validators.jailed')}</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{t('validators.statusDistribution')}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{t('validators.topActiveValidators')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {activeValidators.slice(0, 10).map((v, idx) => (
                          <div key={v.id} className="flex items-center justify-between p-2 rounded border">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono">#{idx + 1}</span>
                              <span className="font-medium">{v.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{formatNumber(v.stakeInTBURN)} TBURN</Badge>
                              <Badge className="bg-green-600">{(v.uptime / 100).toFixed(1)}%</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            )}

            {type === 'totalStake' && (
              <div className="space-y-6">
                <div className="text-center py-4">
                  <p className="text-5xl font-bold text-purple-500">{formatNumber(totalStake)}</p>
                  <p className="text-lg text-muted-foreground">TBURN {t('validators.directStaked')}</p>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{t('validators.stakeByValidator')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={stakeDistribution} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis type="number" tick={{ fontSize: 12 }} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                        <Tooltip formatter={(value: number) => `${formatNumber(value)} TBURN`} />
                        <Bar dataKey="stake" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-xs text-muted-foreground">{t('validators.tierGenesisStake', { defaultValue: 'Genesis Stake' })}</p>
                      <p className="text-xl font-bold text-amber-500">
                        {formatNumber(validators.filter(v => v.tier === 'genesis').reduce((s, v) => s + v.stakeInTBURN, 0))}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-xs text-muted-foreground">{t('validators.tierPioneerStake', { defaultValue: 'Pioneer Stake' })}</p>
                      <p className="text-xl font-bold text-purple-500">
                        {formatNumber(validators.filter(v => v.tier === 'pioneer').reduce((s, v) => s + v.stakeInTBURN, 0))}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-xs text-muted-foreground">{t('validators.tierStandardStake', { defaultValue: 'Standard Stake' })}</p>
                      <p className="text-xl font-bold text-blue-500">
                        {formatNumber(validators.filter(v => v.tier === 'standard').reduce((s, v) => s + v.stakeInTBURN, 0))}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-xs text-muted-foreground">{t('validators.tierCommunityStake', { defaultValue: 'Community Stake' })}</p>
                      <p className="text-xl font-bold text-green-500">
                        {formatNumber(validators.filter(v => v.tier === 'community').reduce((s, v) => s + v.stakeInTBURN, 0))}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {type === 'delegatedStake' && (
              <div className="space-y-6">
                <div className="text-center py-4">
                  <p className="text-5xl font-bold text-yellow-500">{formatNumber(totalDelegated)}</p>
                  <p className="text-lg text-muted-foreground">TBURN {t('validators.delegatedTokens')}</p>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{t('validators.topDelegatedValidators')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[250px]">
                      <div className="space-y-2">
                        {validators
                          .filter(v => parseFloat(v.delegatedStake || "0") > 0)
                          .sort((a, b) => parseFloat(b.delegatedStake || "0") - parseFloat(a.delegatedStake || "0"))
                          .slice(0, 10)
                          .map((v, idx) => (
                            <div key={v.id} className="flex items-center justify-between p-3 rounded border hover-elevate">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-mono">#{idx + 1}</span>
                                <div>
                                  <p className="font-medium">{v.name}</p>
                                  <p className="text-xs text-muted-foreground">{v.delegators} {t('validators.delegatorsLabel')}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-yellow-500">{formatNumber(parseFloat(v.delegatedStake || "0") / 1e18)} TBURN</p>
                                <p className="text-xs text-green-500">{(v.apy / 100).toFixed(2)}% APY</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <h4 className="font-medium mb-3">{t('validators.delegationRatio')}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">{t('validators.directStake')}</span>
                          <span className="font-medium">{((totalStake / (totalStake + totalDelegated)) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">{t('validators.delegated')}</span>
                          <span className="font-medium">{((totalDelegated / (totalStake + totalDelegated)) * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <h4 className="font-medium mb-3">{t('validators.avgDelegation')}</h4>
                      <p className="text-2xl font-bold">{formatNumber(totalDelegated / validators.length)} TBURN</p>
                      <p className="text-xs text-muted-foreground">{t('validators.perValidator')}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {type === 'committee' && (
              <div className="space-y-6">
                <div className="text-center py-4">
                  <Crown className="h-12 w-12 mx-auto text-amber-500 mb-2" />
                  <p className="text-5xl font-bold text-amber-500">21</p>
                  <p className="text-lg text-muted-foreground">{t('validators.committeeMembers')}</p>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{t('validators.currentCommittee')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-2">
                        {committeeMembers.map((v, idx) => (
                          <div key={v.id} className="flex items-center justify-between p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 hover-elevate">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">#{idx + 1}</span>
                              </div>
                              <div>
                                <p className="font-medium">{v.name}</p>
                                <p className="text-xs text-muted-foreground font-mono">{formatAddress(v.address)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="text-sm font-medium">{formatNumber(v.votingPowerNumber)} TBURN</p>
                                <p className="text-xs text-muted-foreground">{t('validators.votingPower')}</p>
                              </div>
                              <Badge className="bg-green-600">{(v.uptime / 100).toFixed(1)}%</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-xs text-muted-foreground">{t('validators.totalCommitteeStake')}</p>
                      <p className="text-xl font-bold">{formatNumber(committeeMembers.reduce((s, v) => s + v.votingPowerNumber, 0))}</p>
                      <p className="text-xs text-muted-foreground">TBURN</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-xs text-muted-foreground">{t('validators.avgCommitteeUptime')}</p>
                      <p className="text-xl font-bold text-green-500">
                        {(committeeMembers.reduce((s, v) => s + v.uptime, 0) / committeeMembers.length / 100).toFixed(2)}%
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-xs text-muted-foreground">{t('validators.rotationPeriod')}</p>
                      <p className="text-xl font-bold">24h</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {type === 'delegators' && (
              <div className="space-y-6">
                <div className="text-center py-4">
                  <Users className="h-12 w-12 mx-auto text-green-500 mb-2" />
                  <p className="text-5xl font-bold text-green-500">{formatNumber(totalDelegators)}</p>
                  <p className="text-lg text-muted-foreground">{t('validators.uniqueDelegators')}</p>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{t('validators.delegatorsByValidator')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[250px]">
                      <div className="space-y-2">
                        {validators
                          .filter(v => v.delegators > 0)
                          .sort((a, b) => b.delegators - a.delegators)
                          .slice(0, 15)
                          .map((v, idx) => (
                            <div key={v.id} className="flex items-center justify-between p-2 rounded border">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono">#{idx + 1}</span>
                                <span className="font-medium">{v.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-green-500" />
                                <span className="font-medium">{formatNumber(v.delegators)}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <h4 className="font-medium mb-3">{t('validators.avgDelegatorsPerValidator')}</h4>
                      <p className="text-2xl font-bold">{formatNumber(totalDelegators / validators.length)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <h4 className="font-medium mb-3">{t('validators.avgStakePerDelegator')}</h4>
                      <p className="text-2xl font-bold">{formatNumber(totalDelegated / totalDelegators)} TBURN</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t shrink-0">
            <Button variant="outline" onClick={onClose}>{t('validators.close')}</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Validators() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { data: validators, isLoading } = useQuery<Validator[]>({
    queryKey: ["/api/validators"],
    select: (data: any) => Array.isArray(data) ? data : (data?.validators || []),
  });

  const { data: tierData, isLoading: tiersLoading } = useQuery<TokenomicsTiers>({
    queryKey: ["/api/tokenomics/tiers"],
  });

  const [votingActivity, setVotingActivity] = useState<any[]>([]);
  const [validatorUpdates, setValidatorUpdates] = useState<any>(null);
  const [selectedValidator, setSelectedValidator] = useState<ValidatorWithPower | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [selectedTier, setSelectedTier] = useState<MarketingTierKey | null>(null);
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [selectedEmission, setSelectedEmission] = useState<'emission' | 'burn' | 'netEmission' | 'security' | null>(null);
  const [isEmissionModalOpen, setIsEmissionModalOpen] = useState(false);
  const [selectedStats, setSelectedStats] = useState<'active' | 'totalStake' | 'delegatedStake' | 'committee' | 'delegators' | null>(null);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

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

  const genesisCount = validatorsWithPower.filter(v => v.tier === 'genesis').length;
  const pioneerCount = validatorsWithPower.filter(v => v.tier === 'pioneer').length;
  const standardCount = validatorsWithPower.filter(v => v.tier === 'standard').length;
  const communityCount = validatorsWithPower.filter(v => v.tier === 'community').length;

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

  // Show loading skeleton on initial page load
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6 min-h-screen">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          <Server className="h-16 w-16 text-primary animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
            <span className="text-lg text-muted-foreground">{t('validators.loadingValidators', { defaultValue: 'Loading validators...' })}</span>
          </div>
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-3 h-3 rounded-full bg-primary/30 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

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

      {/* Tiered System Overview - 4 Marketing Tiers */}
      {tierData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Genesis Tier - 1M+ TBURN */}
          <Card 
            className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5 hover-elevate cursor-pointer transition-all"
            onClick={() => { setSelectedTier('genesis'); setIsTierModalOpen(true); }}
            data-testid="card-genesis"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-amber-500" />
                  {t('validators.tierGenesis', { defaultValue: 'Genesis Validator' })}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
              <CardDescription>{t('validators.tierGenesisDesc', { defaultValue: '1M+ TBURN staked' })}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-amber-500" data-testid="genesis-count">{genesisCount}</p>
                  <p className="text-xs text-muted-foreground">{t('validators.activeCount')}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-500" data-testid="genesis-apy">{tierData.tiers.genesis.targetAPY}%</p>
                  <p className="text-xs text-muted-foreground">{t('validators.targetApy')}</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{formatNumber(tierData.tiers.genesis.dailyRewardPool)}</p>
                  <p className="text-xs text-muted-foreground">{t('validators.tburnPerDay')}</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{tierData.tiers.genesis.rewardPoolShare}%</p>
                  <p className="text-xs text-muted-foreground">{t('validators.poolShare')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pioneer Tier - 500K+ TBURN */}
          <Card 
            className="border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5 hover-elevate cursor-pointer transition-all"
            onClick={() => { setSelectedTier('pioneer'); setIsTierModalOpen(true); }}
            data-testid="card-pioneer"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Rocket className="h-4 w-4 text-purple-500" />
                  {t('validators.tierPioneer', { defaultValue: 'Pioneer Validator' })}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
              <CardDescription>{t('validators.tierPioneerDesc', { defaultValue: '500K+ TBURN staked' })}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-purple-500" data-testid="pioneer-count">{pioneerCount}</p>
                  <p className="text-xs text-muted-foreground">{t('validators.activeCount')}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-500" data-testid="pioneer-apy">{tierData.tiers.pioneer.targetAPY}%</p>
                  <p className="text-xs text-muted-foreground">{t('validators.targetApy')}</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{formatNumber(tierData.tiers.pioneer.dailyRewardPool)}</p>
                  <p className="text-xs text-muted-foreground">{t('validators.tburnPerDay')}</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{tierData.tiers.pioneer.rewardPoolShare}%</p>
                  <p className="text-xs text-muted-foreground">{t('validators.poolShare')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Standard Tier - 200K+ TBURN */}
          <Card 
            className="border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 hover-elevate cursor-pointer transition-all"
            onClick={() => { setSelectedTier('standard'); setIsTierModalOpen(true); }}
            data-testid="card-standard"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-blue-500" />
                  {t('validators.tierStandard', { defaultValue: 'Standard Validator' })}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
              <CardDescription>{t('validators.tierStandardDesc', { defaultValue: '200K+ TBURN staked' })}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-blue-500" data-testid="standard-count">{standardCount}</p>
                  <p className="text-xs text-muted-foreground">{t('validators.activeCount')}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-500" data-testid="standard-apy">{tierData.tiers.standard.targetAPY}%</p>
                  <p className="text-xs text-muted-foreground">{t('validators.targetApy')}</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{formatNumber(tierData.tiers.standard.dailyRewardPool)}</p>
                  <p className="text-xs text-muted-foreground">{t('validators.tburnPerDay')}</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{tierData.tiers.standard.rewardPoolShare}%</p>
                  <p className="text-xs text-muted-foreground">{t('validators.poolShare')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Community Tier - 100K+ TBURN */}
          <Card 
            className="border-green-500/30 bg-gradient-to-br from-green-500/5 to-emerald-500/5 hover-elevate cursor-pointer transition-all"
            onClick={() => { setSelectedTier('community'); setIsTierModalOpen(true); }}
            data-testid="card-community"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-500" />
                  {t('validators.tierCommunity', { defaultValue: 'Community Validator' })}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
              <CardDescription>{t('validators.tierCommunityDesc', { defaultValue: '100K+ TBURN staked' })}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-green-500" data-testid="community-count">{communityCount}</p>
                  <p className="text-xs text-muted-foreground">{t('validators.activeCount')}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-500" data-testid="community-apy">{tierData.tiers.community.targetAPY}%</p>
                  <p className="text-xs text-muted-foreground">{t('validators.targetApy')}</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{formatNumber(tierData.tiers.community.dailyRewardPool)}</p>
                  <p className="text-xs text-muted-foreground">{t('validators.tburnPerDay')}</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{tierData.tiers.community.rewardPoolShare}%</p>
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
          <Card 
            className="hover-elevate cursor-pointer transition-all"
            onClick={() => { setSelectedEmission('emission'); setIsEmissionModalOpen(true); }}
            data-testid="card-emission"
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('validators.dailyEmission')}</p>
                    <p className="text-xl font-bold" data-testid="daily-emission">{formatNumber(tierData.emission.dailyGrossEmission)} TBURN</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card 
            className="hover-elevate cursor-pointer transition-all"
            onClick={() => { setSelectedEmission('burn'); setIsEmissionModalOpen(true); }}
            data-testid="card-burn"
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('validators.dailyBurn', { rate: tierData.emission.burnRate })}</p>
                    <p className="text-xl font-bold" data-testid="daily-burn">{formatNumber(tierData.emission.dailyBurn)} TBURN</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card 
            className="hover-elevate cursor-pointer transition-all"
            onClick={() => { setSelectedEmission('netEmission'); setIsEmissionModalOpen(true); }}
            data-testid="card-net-emission"
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('validators.netDailyEmission')}</p>
                    <p className="text-xl font-bold" data-testid="net-emission">{formatNumber(tierData.emission.dailyNetEmission)} TBURN</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card 
            className="hover-elevate cursor-pointer transition-all"
            onClick={() => { setSelectedEmission('security'); setIsEmissionModalOpen(true); }}
            data-testid="card-security"
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('validators.securityScore')}</p>
                    <p className="text-xl font-bold" data-testid="security-score">{tierData.security.securityScore}/100</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
            <Card 
              className="hover-elevate cursor-pointer transition-all"
              onClick={() => { setSelectedStats('active'); setIsStatsModalOpen(true); }}
              data-testid="card-active-validators"
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('validators.activeValidators')}</p>
                      <p className="text-xl font-bold">{activeValidators}</p>
                      <p className="text-xs text-muted-foreground">{`${validators?.length || 0} ${t('common.total')}`}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card 
              className="hover-elevate cursor-pointer transition-all"
              onClick={() => { setSelectedStats('totalStake'); setIsStatsModalOpen(true); }}
              data-testid="card-total-stake"
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('validators.totalStake')}</p>
                      <p className="text-xl font-bold">{formatNumber(totalStake / 1e18)} TBURN</p>
                      <p className="text-xs text-muted-foreground">{t('validators.directStaked')}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card 
              className="hover-elevate cursor-pointer transition-all"
              onClick={() => { setSelectedStats('delegatedStake'); setIsStatsModalOpen(true); }}
              data-testid="card-delegated-stake"
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('validators.delegatedStake')}</p>
                      <p className="text-xl font-bold">{formatNumber(totalDelegated / 1e18)} TBURN</p>
                      <p className="text-xs text-muted-foreground">{t('validators.delegatedTokens')}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card 
              className="hover-elevate cursor-pointer transition-all"
              onClick={() => { setSelectedStats('committee'); setIsStatsModalOpen(true); }}
              data-testid="card-committee"
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('validators.committeeSize')}</p>
                      <p className="text-xl font-bold">21</p>
                      <p className="text-xs text-muted-foreground">{t('validators.topValidators')}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card 
              className="hover-elevate cursor-pointer transition-all"
              onClick={() => { setSelectedStats('delegators'); setIsStatsModalOpen(true); }}
              data-testid="card-total-delegators"
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('validators.totalDelegators')}</p>
                      <p className="text-xl font-bold">{formatNumber(validators?.reduce((sum, v) => sum + v.delegators, 0) || 0)}</p>
                      <p className="text-xs text-muted-foreground">{t('validators.uniqueDelegators')}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
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
                          setLocation(`/app/validator/${validator.address}`);
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

      {/* Tier Detail Dialog */}
      <TierDetailDialog
        tier={selectedTier}
        tierData={tierData}
        validators={validatorsWithPower}
        open={isTierModalOpen}
        onClose={() => {
          setIsTierModalOpen(false);
          setSelectedTier(null);
        }}
      />

      {/* Emission Detail Dialog */}
      <EmissionDetailDialog
        type={selectedEmission}
        tierData={tierData}
        open={isEmissionModalOpen}
        onClose={() => {
          setIsEmissionModalOpen(false);
          setSelectedEmission(null);
        }}
      />

      {/* Validator Stats Dialog */}
      <ValidatorStatsDialog
        type={selectedStats}
        validators={validatorsWithPower}
        tierData={tierData}
        open={isStatsModalOpen}
        onClose={() => {
          setIsStatsModalOpen(false);
          setSelectedStats(null);
        }}
      />
    </div>
  );
}
