import { useParams, useLocation } from "wouter";
import { formatTBurnAddress } from "@/lib/utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Shield,
  Coins,
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Wallet,
  TrendingUp,
  TrendingDown,
  Activity,
  Lock,
  Unlock,
  FileText,
  Clock,
  DollarSign,
  Vote,
  Settings,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";

const isValidDate = (date: any): boolean => {
  if (!date) return false;
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime()) && d.getTime() > 0;
};

const formatDateSafe = (date: any, options?: any): string => {
  if (!isValidDate(date)) return "N/A";
  try {
    return formatDistanceToNow(new Date(date), options);
  } catch (error) {
    return "N/A";
  }
};

interface MemberDetail {
  id: string;
  accountAddress: string;
  memberTier: string;
  memberStatus: string;
  kycLevel: string;
  joinedAt: string;
  updatedAt: string;
  displayName?: string;
  legalName?: string;
  profile?: {
    displayName: string;
    email?: string;
    avatarUrl?: string;
    bio?: string;
    location?: string;
    website?: string;
    twitter?: string;
    updatedAt?: string;
  };
  governance?: {
    votingPower: string;
    proposalsCreated: number;
    votesParticipated: number;
    currentDelegations: number;
    delegatedVotingPower: string;
  };
  financial?: {
    totalStaked: string;
    totalRewards: string;
    totalWithdrawn: string;
    pendingRewards: string;
    lockedBalance: string;
    availableBalance: string;
    updatedAt?: string;
  };
  security?: {
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
    failedLoginAttempts: number;
    lastFailedLogin?: string;
    apiKeysActive: number;
    ipWhitelist: string[];
    updatedAt?: string;
  };
  performance?: {
    totalTransactions: number;
    successfulTransactions: number;
    failedTransactions: number;
    averageResponseTime: number;
    reliability: number;
    uptime: number;
    slashEvents: number;
    reputationScore: number;
    metricsUpdatedAt?: string;
  };
  stakingPositions?: Array<{
    id: string;
    validatorAddress: string;
    amount: string;
    rewards: string;
    stakedAt: string;
    lastClaimAt?: string;
    status: string;
  }>;
  slashEvents?: Array<{
    id: string;
    slashType: string;
    amount: string;
    reason: string;
    occurredAt: string;
    reversedAt?: string;
  }>;
}

const tierColors: Record<string, string> = {
  basic_user: "bg-gray-500",
  staker: "bg-blue-500",
  active_validator: "bg-green-500",
  inactive_validator: "bg-yellow-500",
  genesis_validator: "bg-purple-500",
  enterprise_validator: "bg-indigo-500",
  governance_validator: "bg-pink-500",
};

const statusColors: Record<string, string> = {
  active: "bg-green-500",
  inactive: "bg-gray-500",
  suspended: "bg-red-500",
  pending_kyc: "bg-yellow-500",
};

const kycColors: Record<string, string> = {
  none: "bg-gray-500",
  basic: "bg-blue-500",
  advanced: "bg-green-500",
  institutional: "bg-purple-500",
};

export default function MemberDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const memberId = params.id;
  const [, setLocation] = useLocation();

  const { data: member, isLoading } = useQuery<MemberDetail>({
    queryKey: [`/api/members/${memberId}`],
    refetchInterval: 10000,
  });

  const { data: auditLogs } = useQuery<Array<{
    id: string;
    action: string;
    details: string;
    timestamp: string;
    performedBy?: string;
    createdAt?: string;
    resource?: string;
    resourceId?: string;
    actor?: string;
  }>>({
    queryKey: [`/api/members/${memberId}/audit-logs`],
    refetchInterval: 30000,
  });

  const formatAmount = (amount: string | undefined) => {
    if (!amount) return "0";
    const value = parseFloat(amount) / 1e18;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
    return value.toFixed(4);
  };

  const getTierIcon = (tier: string) => {
    if (tier.includes("validator")) return <Shield className="h-5 w-5" />;
    if (tier === "staker") return <Coins className="h-5 w-5" />;
    return <Users className="h-5 w-5" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-5 w-5" />;
      case "inactive":
        return <XCircle className="h-5 w-5" />;
      case "suspended":
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">{t('members.notFound')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('members.notFoundDesc')}
          </p>
          <Button variant="outline" onClick={() => setLocation("/members")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <Button variant="outline" size="sm" className="mb-4" onClick={() => setLocation("/members")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('common.back')}
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              {member.displayName || member.profile?.displayName || t('members.anonymousMember')}
            </h1>
            <div className="flex items-center gap-4">
              <code className="text-sm bg-muted px-2 py-1 rounded">
                {member.accountAddress}
              </code>
              <Badge className={`${tierColors[member.memberTier]} text-white`}>
                <span className="flex items-center gap-1">
                  {getTierIcon(member.memberTier)}
                  {t(`members.tiers.${member.memberTier}`)}
                </span>
              </Badge>
              <Badge className={`${statusColors[member.memberStatus]} text-white`}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(member.memberStatus)}
                  {t(`members.statuses.${member.memberStatus}`)}
                </span>
              </Badge>
              <Badge className={`${kycColors[member.kycLevel]} text-white`}>
                {t('members.kycLabel')}: {t(`members.kycLevels.${member.kycLevel}`)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card data-testid="card-voting-power">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Vote className="h-4 w-4" />
              {t('members.votingPower')}
            </CardDescription>
            <CardTitle className="text-2xl">
              {member.governance?.votingPower || "0"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card data-testid="card-total-staked">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              {t('members.totalStaked')}
            </CardDescription>
            <CardTitle className="text-2xl">
              {formatAmount(member.financial?.totalStaked)} TBURN
            </CardTitle>
          </CardHeader>
        </Card>
        <Card data-testid="card-total-rewards">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {t('members.totalRewards')}
            </CardDescription>
            <CardTitle className="text-2xl">
              {formatAmount(member.financial?.totalRewards)} TBURN
            </CardTitle>
          </CardHeader>
        </Card>
        <Card data-testid="card-reputation">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              {t('members.reputationScore')}
            </CardDescription>
            <CardTitle className="text-2xl">
              {member.performance?.reputationScore || 0}/100
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile" data-testid="tab-profile">
            {t('members.profile')}
          </TabsTrigger>
          <TabsTrigger value="staking" data-testid="tab-staking">
            {t('nav.staking')} ({member.stakingPositions?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="governance" data-testid="tab-governance">
            {t('members.governance')}
          </TabsTrigger>
          <TabsTrigger value="financial" data-testid="tab-financial">
            {t('members.financialSummary')}
          </TabsTrigger>
          <TabsTrigger value="performance" data-testid="tab-performance">
            {t('members.performance')}
          </TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security">
            {t('members.security')}
          </TabsTrigger>
          <TabsTrigger value="audit" data-testid="tab-audit">
            {t('members.recentActivity')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t('members.profile')}</CardTitle>
              <CardDescription>
                {t('members.memberDetails')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">{t('common.name')}</div>
                  <div className="font-medium">{member.displayName || t('common.none')}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{t('common.address')}</div>
                  <div className="font-medium font-mono text-sm">{member.accountAddress}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{t('members.legalName')}</div>
                  <div className="font-medium">{member.legalName || t('common.none')}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{t('members.website')}</div>
                  <div className="font-medium">{member.profile?.website || t('common.none')}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{t('members.joinedNetwork')}</div>
                  <div className="font-medium">
                    {formatDateSafe(member.joinedAt, { addSuffix: true })}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{t('members.lastUpdated')}</div>
                  <div className="font-medium">
                    {formatDateSafe(member.updatedAt, { addSuffix: true })}
                  </div>
                </div>
              </div>
              {member.profile?.bio && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">{t('members.bio')}</div>
                  <div className="p-3 bg-muted rounded-md">{member.profile.bio}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staking">
          <Card>
            <CardHeader>
              <CardTitle>{t('members.stakingPositions')}</CardTitle>
              <CardDescription>
                {t('members.stakingPositions')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {member.stakingPositions && member.stakingPositions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('validators.validator')}</TableHead>
                      <TableHead>{t('members.stakedAmount')}</TableHead>
                      <TableHead>{t('wallets.rewards')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                      <TableHead>{t('members.startedAt')}</TableHead>
                      <TableHead>{t('validators.lastVoted')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {member.stakingPositions.map((position) => (
                      <TableRow key={position.id}>
                        <TableCell>
                          <Button variant="ghost" className="p-0 h-auto font-mono" onClick={() => setLocation(`/app/validator/${formatTBurnAddress(position.validatorAddress)}`)}>
                            {formatTBurnAddress(position.validatorAddress).slice(0, 8)}...
                            {formatTBurnAddress(position.validatorAddress).slice(-6)}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Coins className="h-4 w-4 text-muted-foreground" />
                            {formatAmount(position.amount)} TBURN
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            {formatAmount(position.rewards)} TBURN
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={position.status === "active" ? "default" : "secondary"} className={position.status === "active" ? "bg-green-600 hover:bg-green-700" : ""}>
                            {position.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatDateSafe(position.stakedAt, { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          {position.lastClaimAt
                            ? formatDateSafe(position.lastClaimAt, { addSuffix: true })
                            : t('common.none')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Coins className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{t('members.noStakingPositions')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="governance">
          <Card>
            <CardHeader>
              <CardTitle>{t('members.governanceParticipation')}</CardTitle>
              <CardDescription>
                {t('members.votingPower')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground">{t('members.votingPower')}</div>
                  <div className="text-2xl font-bold">{member.governance?.votingPower || "0"}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{t('members.proposalsCreated')}</div>
                  <div className="text-2xl font-bold">
                    {member.governance?.proposalsCreated || 0}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{t('members.votesParticipated')}</div>
                  <div className="text-2xl font-bold">
                    {member.governance?.votesParticipated || 0}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{t('members.delegations')}</div>
                  <div className="text-2xl font-bold">
                    {member.governance?.currentDelegations || 0}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{t('members.delegatedVotingPower')}</div>
                  <div className="text-2xl font-bold">
                    {member.governance?.delegatedVotingPower || "0"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle>{t('members.financialSummary')}</CardTitle>
              <CardDescription>
                {t('members.financialSummary')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground">{t('members.totalStaked')}</div>
                  <div className="text-2xl font-bold">
                    {formatAmount(member.financial?.totalStaked)} TBURN
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{t('members.totalRewards')}</div>
                  <div className="text-2xl font-bold text-green-500">
                    {formatAmount(member.financial?.totalRewards)} TBURN
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{t('members.totalWithdrawn')}</div>
                  <div className="text-2xl font-bold">
                    {formatAmount(member.financial?.totalWithdrawn)} TBURN
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{t('members.pendingRewards')}</div>
                  <div className="text-2xl font-bold text-yellow-500">
                    {formatAmount(member.financial?.pendingRewards)} TBURN
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{t('members.lockedBalance')}</div>
                  <div className="text-2xl font-bold">
                    {formatAmount(member.financial?.lockedBalance)} TBURN
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{t('members.availableBalance')}</div>
                  <div className="text-2xl font-bold text-blue-500">
                    {formatAmount(member.financial?.availableBalance)} TBURN
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>{t('members.performanceMetrics')}</CardTitle>
              <CardDescription>
                {t('members.performanceMetrics')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">{t('members.totalTransactions')}</div>
                    <div className="text-2xl font-bold">
                      {member.performance?.totalTransactions || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{t('members.successfulTx')}</div>
                    <div className="text-2xl font-bold text-green-500">
                      {((member.performance?.successfulTransactions || 0) /
                        (member.performance?.totalTransactions || 1) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{t('members.avgResponseTime')}</div>
                    <div className="text-2xl font-bold">
                      {member.performance?.averageResponseTime || 0}ms
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{t('members.slashEvents')}</div>
                    <div className="text-2xl font-bold text-red-500">
                      {member.performance?.slashEvents || 0}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">{t('members.reliability')}</span>
                      <span className="text-sm font-medium">
                        {member.performance?.reliability || 0}%
                      </span>
                    </div>
                    <Progress value={member.performance?.reliability || 0} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">{t('members.uptimeScore')}</span>
                      <span className="text-sm font-medium">
                        {member.performance?.uptime || 0}%
                      </span>
                    </div>
                    <Progress value={member.performance?.uptime || 0} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">{t('members.reputationScore')}</span>
                      <span className="text-sm font-medium">
                        {member.performance?.reputationScore || 0}/100
                      </span>
                    </div>
                    <Progress value={member.performance?.reputationScore || 0} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>{t('members.securitySettings')}</CardTitle>
              <CardDescription>
                {t('members.securitySettings')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground">{t('members.twoFactorAuth')}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {member.security?.twoFactorEnabled ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium">{t('members.enabled')}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-500" />
                        <span className="font-medium">{t('members.disabled')}</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{t('members.activeApiKeys')}</div>
                  <div className="text-2xl font-bold">{member.security?.apiKeysActive || 0}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{t('members.failedLoginAttempts')}</div>
                  <div className="text-2xl font-bold text-red-500">
                    {member.security?.failedLoginAttempts || 0}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{t('members.lastPasswordChange')}</div>
                  <div className="font-medium">
                    {member.security?.lastPasswordChange
                      ? formatDateSafe(member.security.lastPasswordChange, {
                          addSuffix: true,
                        })
                      : t('common.none')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{t('members.lastFailedLogin')}</div>
                  <div className="font-medium">
                    {member.security?.lastFailedLogin
                      ? formatDateSafe(member.security.lastFailedLogin, {
                          addSuffix: true,
                        })
                      : t('common.none')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{t('members.ipWhitelist')}</div>
                  <div className="font-medium">
                    {member.security?.ipWhitelist?.length || 0} IPs
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>{t('members.recentActivity')}</CardTitle>
              <CardDescription>
                {t('members.recentActivity')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditLogs && auditLogs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('common.time')}</TableHead>
                      <TableHead>{t('common.action')}</TableHead>
                      <TableHead>{t('common.details')}</TableHead>
                      <TableHead>{t('common.from')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {formatDateSafe(log.createdAt, { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.action}</Badge>
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                          {log.resource} {log.resourceId ? `(${log.resourceId})` : ''}
                        </TableCell>
                        <TableCell>{log.actor || "System"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{t('members.noRecentActivity')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {member.slashEvents && member.slashEvents.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>{t('members.slashEvents')}</CardTitle>
                <CardDescription>
                  {t('members.slashEvents')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('common.date')}</TableHead>
                      <TableHead>{t('common.type')}</TableHead>
                      <TableHead>{t('common.amount')}</TableHead>
                      <TableHead>{t('common.description')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {member.slashEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          {formatDateSafe(event.occurredAt, { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">{event.slashType}</Badge>
                        </TableCell>
                        <TableCell className="text-red-500">
                          -{formatAmount(event.amount)} TBURN
                        </TableCell>
                        <TableCell>{event.reason}</TableCell>
                        <TableCell>
                          {event.reversedAt ? (
                            <Badge variant="outline">{t('common.completed')}</Badge>
                          ) : (
                            <Badge variant="destructive">{t('common.active')}</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}