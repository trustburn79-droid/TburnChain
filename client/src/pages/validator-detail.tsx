import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useParams, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  ArrowLeft, User, Shield, Award, Coins, Activity, Clock, 
  AlertCircle, TrendingUp, Users, Ban, Power, DollarSign,
  CheckCircle, XCircle, History, Zap, Target, Brain
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { formatAddress, formatTokenAmount, formatPercentage, formatNumber } from "@/lib/format";
import type { Validator } from "@shared/schema";
import { useState, useEffect } from "react";
import { useWebSocket } from "@/lib/websocket-context";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ValidatorDetails {
  id: string;
  name: string;
  address: string;
  stake: string;
  delegatedStake: string;
  commission: number;
  status: string;
  uptime: number;
  totalBlocks: number;
  votingPower: string;
  apy: number;
  reputationScore: number;
  performanceScore: number;
  aiTrustScore: number;
  behaviorScore: number;
  participationRate: number;
  avgResponseTime: number;
  missedBlocks: number;
  slashCount: number;
  avgBlockTime: number;
  rewardEarned: string;
  adaptiveWeight: number;
  rank?: number;
  isCommittee?: boolean;
  
  delegators: Array<{
    address: string;
    amount: string;
    timestamp: number;
  }>;
  performanceHistory: Array<{
    timestamp: number;
    blockTime: number;
    missedBlocks: number;
    uptime: number;
  }>;
  rewardHistory: Array<{
    timestamp: number;
    amount: string;
    type: string;
  }>;
  events: Array<{
    id: string;
    timestamp: number;
    type: string;
    description: string;
    txHash?: string;
  }>;
}

export default function ValidatorDetail() {
  const { t } = useTranslation();
  const { address } = useParams();
  const { toast } = useToast();
  const [delegateAmount, setDelegateAmount] = useState("");
  const [showDelegateDialog, setShowDelegateDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newCommission, setNewCommission] = useState("");
  const { lastMessage } = useWebSocket();

  const { data: validator, isLoading } = useQuery<ValidatorDetails>({
    queryKey: [`/api/validators/${address}`],
    enabled: !!address
  });

  useEffect(() => {
    if (lastMessage?.data) {
      try {
        const message = JSON.parse(lastMessage.data);
        if (message.type === 'validator_update' && message.data.address === address) {
          queryClient.invalidateQueries({ queryKey: [`/api/validators/${address}`] });
        }
      } catch (error) {
      }
    }
  }, [lastMessage, address]);

  const toggleStatusMutation = useMutation({
    mutationFn: async (action: 'activate' | 'deactivate') => {
      const res = await apiRequest('POST', `/api/validators/${address}/${action}`);
      return res.json();
    },
    onSuccess: (_, action) => {
      toast({
        title: t('common.success'),
        description: action === 'activate' ? t('validators.active') : t('validators.inactive'),
      });
      queryClient.invalidateQueries({ queryKey: [`/api/validators/${address}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/validators'] });
      setShowStatusDialog(false);
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: t('validators.delegationFailedDesc'),
        variant: "destructive",
      });
    },
  });

  const delegateMutation = useMutation({
    mutationFn: async (amount: string) => {
      const res = await apiRequest('POST', `/api/validators/${address}/delegate`, { amount });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: t('validators.delegationSuccessful'),
        description: t('validators.delegationSuccessDesc', { amount: delegateAmount }),
      });
      queryClient.invalidateQueries({ queryKey: [`/api/validators/${address}`] });
      setShowDelegateDialog(false);
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
      const res = await apiRequest('POST', `/api/validators/${address}/claim-rewards`);
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: t('validators.rewardsClaimed'),
        description: t('validators.rewardsClaimedDesc', { amount: formatTokenAmount(data.amount) }),
      });
      queryClient.invalidateQueries({ queryKey: [`/api/validators/${address}`] });
    },
    onError: () => {
      toast({
        title: t('validators.claimFailed'),
        description: t('validators.claimFailedDesc'),
        variant: "destructive",
      });
    },
  });

  const updateCommissionMutation = useMutation({
    mutationFn: async (commission: number) => {
      const res = await apiRequest('POST', `/api/validators/${address}/commission`, { commission });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: `${t('validators.commission')}: ${newCommission}%`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/validators/${address}`] });
      setNewCommission("");
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: t('common.failed'),
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Card className="w-full h-64 animate-pulse" />
      </div>
    );
  }

  if (!validator) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">{t('validators.title')} - {t('common.error')}</h2>
          <p className="text-muted-foreground mb-4">{t('common.address')}: {address}</p>
          <Link href="/app/validators">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back')}
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const votingPower = BigInt(validator.stake) + BigInt(validator.delegatedStake || 0);
  const votingPowerTBURN = Number(votingPower / BigInt(1e18));
  const isActive = validator.status === 'active';
  const isJailed = validator.status === 'jailed';

  const performanceData = validator.performanceHistory?.slice(-24) || [];
  const rewardData = validator.rewardHistory?.slice(-30) || [];

  const pieData = [
    { name: t('validators.stake'), value: Number(BigInt(validator.stake) / BigInt(1e18)) },
    { name: t('validators.delegated'), value: Number(BigInt(validator.delegatedStake || 0) / BigInt(1e18)) }
  ];

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/app/validators">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{validator.name}</h1>
            <p className="text-muted-foreground">{formatAddress(validator.address)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isActive && (
            <Button 
              variant="outline" 
              onClick={() => claimRewardsMutation.mutate()}
              disabled={claimRewardsMutation.isPending}
              data-testid="button-claim-rewards"
            >
              <Coins className="h-4 w-4 mr-2" />
              {t('validators.claimRewards')}
            </Button>
          )}
          <Dialog open={showDelegateDialog} onOpenChange={setShowDelegateDialog}>
            <DialogTrigger asChild>
              <Button variant="default" disabled={!isActive} data-testid="button-delegate">
                <Users className="h-4 w-4 mr-2" />
                {t('validators.delegateNow')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('validators.delegate')}</DialogTitle>
                <DialogDescription>
                  {t('validators.enterTBURNAmount')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">{t('common.amount')} (TBURN)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={delegateAmount}
                    onChange={(e) => setDelegateAmount(e.target.value)}
                    placeholder="100"
                    data-testid="input-delegate-amount"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>{t('validators.apy')}: {formatPercentage(validator.apy / 100)}</p>
                  <p>{t('staking.estimatedRewards')}: {delegateAmount ? formatNumber(parseFloat(delegateAmount) * validator.apy / 36500) : '0'} TBURN</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDelegateDialog(false)}>
                  {t('common.cancel')}
                </Button>
                <Button 
                  onClick={() => delegateMutation.mutate(delegateAmount)}
                  disabled={!delegateAmount || delegateMutation.isPending}
                  data-testid="button-confirm-delegate"
                >
                  {t('common.confirm')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
            <DialogTrigger asChild>
              <Button 
                variant={isActive ? "destructive" : "default"}
                disabled={isJailed}
                data-testid="button-toggle-status"
              >
                <Power className="h-4 w-4 mr-2" />
                {isActive ? t('common.disable') : t('common.enable')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('common.status')}</DialogTitle>
                <DialogDescription>
                  {isActive ? t('validators.inactive') : t('validators.active')}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
                  {t('common.cancel')}
                </Button>
                <Button 
                  variant={isActive ? "destructive" : "default"}
                  onClick={() => toggleStatusMutation.mutate(isActive ? 'deactivate' : 'activate')}
                  disabled={toggleStatusMutation.isPending}
                  data-testid="button-confirm-status"
                >
                  {t('common.confirm')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isJailed && (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">{t('validators.jailed')}</CardTitle>
            </div>
            <CardDescription>
              {t('validators.jailedWarning')}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('validators.votingPower')}</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(votingPowerTBURN)} TBURN</div>
            <Progress value={Math.min(votingPowerTBURN / 1000000 * 100, 100)} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {t('common.total')}: {formatPercentage(votingPowerTBURN / 1250000)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('validators.delegators')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{validator.delegators?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('validators.totalDelegated')}: {formatTokenAmount(validator.delegatedStake || "0")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('wallets.totalRewards')}</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTokenAmount(validator.rewardEarned || "0")}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('validators.commission')}: {validator.commission / 100}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('validators.uptime')}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(validator.uptime)}</div>
            <Progress 
              value={validator.uptime} 
              className={`mt-2 ${validator.uptime < 95 ? '[&>div]:bg-yellow-500' : ''} ${validator.uptime < 90 ? '[&>div]:bg-destructive' : ''}`}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t('validators.missedBlocks')}: {validator.missedBlocks || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">{t('members.overview')}</TabsTrigger>
          <TabsTrigger value="delegators">{t('validators.delegators')}</TabsTrigger>
          <TabsTrigger value="performance">{t('members.performance')}</TabsTrigger>
          <TabsTrigger value="rewards">{t('wallets.rewards')}</TabsTrigger>
          <TabsTrigger value="events">{t('members.recentActivity')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('validators.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('common.status')}</p>
                  <div className="mt-1">
                    <Badge 
                      className={
                        isActive ? "bg-green-600" : 
                        isJailed ? "bg-destructive" : 
                        "bg-secondary"
                      }
                    >
                      {isActive ? t('validators.active') : isJailed ? t('validators.jailed') : t('validators.inactive')}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('validators.committeeSize')}</p>
                  <div className="mt-1">
                    {validator.isCommittee ? (
                      <Badge className="bg-purple-600">
                        <Shield className="h-3 w-3 mr-1" />
                        {t('validators.committeeSize')}
                      </Badge>
                    ) : (
                      <span className="text-sm">{t('common.no')}</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('validators.selfDelegated')}</p>
                  <p className="mt-1 text-lg font-semibold">{formatTokenAmount(validator.stake)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('validators.delegatedStake')}</p>
                  <p className="mt-1 text-lg font-semibold">{formatTokenAmount(validator.delegatedStake || "0")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('blocks.avgBlockTime')}</p>
                  <p className="mt-1 text-lg font-semibold">{validator.avgBlockTime?.toFixed(2) || '0'}s</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('validators.slashingEvents')}</p>
                  <p className="mt-1 text-lg font-semibold">{validator.slashCount || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('validators.apy')}</p>
                  <p className="mt-1 text-lg font-semibold">{formatPercentage(validator.apy / 100)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('validators.commission')}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-lg font-semibold">{validator.commission / 100}%</span>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">{t('common.edit')}</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t('validators.commission')}</DialogTitle>
                          <DialogDescription>
                            {t('validators.enterAmount')} (0-20%)
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="commission">{t('validators.commission')} (%)</Label>
                            <Input
                              id="commission"
                              type="number"
                              min="0"
                              max="20"
                              step="0.1"
                              value={newCommission}
                              onChange={(e) => setNewCommission(e.target.value)}
                              placeholder="5.0"
                              data-testid="input-commission"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            onClick={() => updateCommissionMutation.mutate(parseFloat(newCommission) * 100)}
                            disabled={!newCommission || updateCommissionMutation.isPending}
                            data-testid="button-update-commission"
                          >
                            {t('common.confirm')}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">{t('validators.stakeDistribution')}</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${formatNumber(entry.value)} TBURN`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">{t('validators.aiTrust')}</h4>
                <div className="flex items-center gap-4">
                  <Brain className="h-5 w-5 text-purple-500" />
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">{t('members.reputationScore')}</span>
                      <span className="text-sm font-semibold">{validator.reputationScore}/100</span>
                    </div>
                    <Progress value={validator.reputationScore} />
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">{t('validators.performanceScore')}</span>
                      <span className="text-sm font-semibold">{validator.performanceScore}/100</span>
                    </div>
                    <Progress value={validator.performanceScore} />
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">{t('validators.trustScore')}</span>
                      <span className="text-sm font-semibold">{validator.aiTrustScore}/100</span>
                    </div>
                    <Progress value={validator.aiTrustScore} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delegators" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('validators.delegators')}</CardTitle>
              <CardDescription>
                {t('common.total')}: {validator.delegators?.length || 0} - {formatTokenAmount(validator.delegatedStake || "0")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {validator.delegators && validator.delegators.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('common.address')}</TableHead>
                      <TableHead className="text-right">{t('common.amount')}</TableHead>
                      <TableHead className="text-right">{t('common.time')}</TableHead>
                      <TableHead className="text-center">{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validator.delegators.map((delegator, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono">{formatAddress(delegator.address)}</TableCell>
                        <TableCell className="text-right">{formatTokenAmount(delegator.amount)}</TableCell>
                        <TableCell className="text-right">
                          {new Date(delegator.timestamp * 1000).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button variant="outline" size="sm">{t('validators.undelegate')}</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {t('validators.totalDelegators')}: 0
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('members.performanceMetrics')}</CardTitle>
              <CardDescription>{t('validators.validatorMetrics')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(t) => new Date(t * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    labelFormatter={(t) => new Date(t * 1000).toLocaleString()}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="blockTime" 
                    stroke="#8884d8" 
                    name={t('blocks.avgBlockTime')}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="uptime" 
                    stroke="#82ca9d" 
                    name={t('validators.uptime')}
                  />
                </LineChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{t('blocks.avgBlockTime')}</p>
                  <p className="text-2xl font-bold">{validator.avgBlockTime?.toFixed(2) || '0'}s</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{t('validators.blocksProposed')}</p>
                  <p className="text-2xl font-bold">{formatNumber(validator.totalBlocks || 0)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{t('validators.missedBlocks')}</p>
                  <p className="text-2xl font-bold">{formatNumber(validator.missedBlocks || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('wallets.rewards')}</CardTitle>
              <CardDescription>{t('staking.totalRewardsDistributed')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={rewardData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(t) => new Date(t * 1000).toLocaleDateString()}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(t) => new Date(t * 1000).toLocaleDateString()}
                    formatter={(value: any) => formatTokenAmount(value.toString())}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.6}
                    name={t('wallets.rewards')}
                  />
                </AreaChart>
              </ResponsiveContainer>

              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">{t('wallets.rewards')}</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('common.time')}</TableHead>
                      <TableHead>{t('common.type')}</TableHead>
                      <TableHead className="text-right">{t('common.amount')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validator.rewardHistory?.slice(0, 5).map((reward, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{new Date(reward.timestamp * 1000).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{reward.type}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatTokenAmount(reward.amount)}
                        </TableCell>
                      </TableRow>
                    )) || (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          {t('members.noRecentActivity')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('members.recentActivity')}</CardTitle>
              <CardDescription>{t('validators.validatorMetrics')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">{t('common.time')}</TableHead>
                    <TableHead>{t('common.type')}</TableHead>
                    <TableHead>{t('common.description')}</TableHead>
                    <TableHead>{t('common.transaction')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validator.events?.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="text-sm">
                        {new Date(event.timestamp * 1000).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            event.type === 'activated' ? 'default' :
                            event.type === 'deactivated' ? 'secondary' :
                            event.type === 'slashed' ? 'destructive' :
                            event.type === 'reward' ? 'outline' :
                            'outline'
                          }
                        >
                          {event.type === 'activated' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {event.type === 'deactivated' && <XCircle className="h-3 w-3 mr-1" />}
                          {event.type === 'slashed' && <Ban className="h-3 w-3 mr-1" />}
                          {event.type === 'reward' && <Coins className="h-3 w-3 mr-1" />}
                          {event.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{event.description}</TableCell>
                      <TableCell>
                        {event.txHash ? (
                          <Link href={`/app/transactions/${event.txHash}`}>
                            <Button variant="ghost" size="sm" className="text-primary hover:underline h-auto p-0">
                              {formatAddress(event.txHash)}
                            </Button>
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        {t('members.noRecentActivity')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}