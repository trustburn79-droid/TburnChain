import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { Server, Award, Users, TrendingUp, Shield, Target, Brain, Vote, Coins, Crown, Layers, Flame, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/stat-card";
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

function getTierBadge(tier: 'tier_1' | 'tier_2' | 'tier_3', isCommitteeMember: boolean) {
  if (tier === 'tier_1' && isCommitteeMember) {
    return (
      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white" data-testid="badge-tier-1">
        <Crown className="h-3 w-3 mr-1" />
        Tier 1
      </Badge>
    );
  }
  if (tier === 'tier_1') {
    return (
      <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white" data-testid="badge-tier-1">
        <Shield className="h-3 w-3 mr-1" />
        Tier 1
      </Badge>
    );
  }
  if (tier === 'tier_2') {
    return (
      <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white" data-testid="badge-tier-2">
        <Layers className="h-3 w-3 mr-1" />
        Tier 2
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" data-testid="badge-tier-3">
      <Users className="h-3 w-3 mr-1" />
      Tier 3
    </Badge>
  );
}

export default function Validators() {
  const { data: validators, isLoading } = useQuery<Validator[]>({
    queryKey: ["/api/validators"],
  });

  const { data: tierData, isLoading: tiersLoading } = useQuery<TokenomicsTiers>({
    queryKey: ["/api/tokenomics/tiers"],
  });

  const [votingActivity, setVotingActivity] = useState<any[]>([]);
  const [validatorUpdates, setValidatorUpdates] = useState<any>(null);

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
        return <Badge className="bg-green-600">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "jailed":
        return <Badge variant="destructive">Jailed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold flex items-center gap-2">
          <Server className="h-8 w-8" />
          Validators
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tiered Validator System with AI-Enhanced Committee BFT
        </p>
      </div>

      {/* Tiered System Overview */}
      {tierData && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-500" />
                Tier 1: Active Committee
              </CardTitle>
              <CardDescription>Max 512 validators, 200K+ TBURN stake</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-amber-500" data-testid="tier1-count">{tier1Count}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-500" data-testid="tier1-apy">{tierData.tiers.tier1.targetAPY}%</p>
                  <p className="text-xs text-muted-foreground">Target APY</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{formatNumber(tierData.tiers.tier1.dailyRewardPool)}</p>
                  <p className="text-xs text-muted-foreground">TBURN/day</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{tierData.tiers.tier1.rewardPoolShare}%</p>
                  <p className="text-xs text-muted-foreground">Pool Share</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-cyan-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-500" />
                Tier 2: Standby Validators
              </CardTitle>
              <CardDescription>Max 4,488 validators, 50K+ TBURN stake</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-blue-500" data-testid="tier2-count">{tier2Count}</p>
                  <p className="text-xs text-muted-foreground">Standby</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-500" data-testid="tier2-apy">{tierData.tiers.tier2.targetAPY}%</p>
                  <p className="text-xs text-muted-foreground">Target APY</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{formatNumber(tierData.tiers.tier2.dailyRewardPool)}</p>
                  <p className="text-xs text-muted-foreground">TBURN/day</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{tierData.tiers.tier2.rewardPoolShare}%</p>
                  <p className="text-xs text-muted-foreground">Pool Share</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-500/30 bg-gradient-to-br from-gray-500/5 to-slate-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                Tier 3: Delegators
              </CardTitle>
              <CardDescription>Unlimited, 100+ TBURN delegation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-gray-500" data-testid="tier3-count">{formatNumber(tierData.tiers.tier3.currentDelegators || 0)}</p>
                  <p className="text-xs text-muted-foreground">Delegators</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-500" data-testid="tier3-apy">{tierData.tiers.tier3.targetAPY}%</p>
                  <p className="text-xs text-muted-foreground">Target APY</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{formatNumber(tierData.tiers.tier3.dailyRewardPool)}</p>
                  <p className="text-xs text-muted-foreground">TBURN/day</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{tierData.tiers.tier3.rewardPoolShare}%</p>
                  <p className="text-xs text-muted-foreground">Pool Share</p>
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
                  <p className="text-sm text-muted-foreground">Daily Emission</p>
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
                  <p className="text-sm text-muted-foreground">Daily Burn ({tierData.emission.burnRate}%)</p>
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
                  <p className="text-sm text-muted-foreground">Net Daily Emission</p>
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
                  <p className="text-sm text-muted-foreground">Security Score</p>
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
              title="Active Validators"
              value={activeValidators}
              icon={Server}
              subtitle={`of ${validators?.length || 0} total`}
            />
            <StatCard
              title="Total Stake"
              value={`${formatNumber(totalStake / 1e18)} TBURN`}
              icon={Award}
              subtitle="direct staked"
            />
            <StatCard
              title="Delegated Stake"
              value={`${formatNumber(totalDelegated / 1e18)} TBURN`}
              icon={Coins}
              subtitle="delegated tokens"
            />
            <StatCard
              title="Committee Size"
              value="21"
              icon={Crown}
              subtitle="top validators"
            />
            <StatCard
              title="Total Delegators"
              value={formatNumber(validators?.reduce((sum, v) => sum + v.delegators, 0) || 0)}
              icon={Users}
              subtitle="unique delegators"
            />
          </>
        )}
      </div>

      {/* Validators Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Validators</CardTitle>
          <CardDescription>
            Tiered system: Tier 1 (200K+), Tier 2 (50K+), Tier 3 (Delegators)
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
                    <TableHead>Rank</TableHead>
                    <TableHead>Validator</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Voting Power</TableHead>
                    <TableHead>Direct Stake</TableHead>
                    <TableHead>Delegated</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>APY</TableHead>
                    <TableHead>Uptime</TableHead>
                    <TableHead>AI Trust</TableHead>
                    <TableHead>Blocks</TableHead>
                    <TableHead>Delegators</TableHead>
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
                        onClick={() => window.location.href = `/validator/${validator.address}`}
                      >
                        <TableCell className="font-mono text-sm">
                          #{index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Link href={`/validator/${validator.address}`}>
                              <span className="font-semibold text-primary hover:underline">{validator.name}</span>
                            </Link>
                            <span className="font-mono text-xs text-muted-foreground">
                              {formatAddress(validator.address)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getTierBadge(validator.tier, isCommitteeMember)}
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
              <p className="text-muted-foreground">No validators found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
