import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useParams, Link } from "wouter";
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
  // Base validator fields
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
  
  // Extended fields for detail page
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

  // WebSocket updates
  useEffect(() => {
    if (lastMessage?.data) {
      try {
        const message = JSON.parse(lastMessage.data);
        if (message.type === 'validator_update' && message.data.address === address) {
          queryClient.invalidateQueries({ queryKey: [`/api/validators/${address}`] });
        }
      } catch (error) {
        // Ignore parse errors
      }
    }
  }, [lastMessage, address]);

  // Activation/Deactivation mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async (action: 'activate' | 'deactivate') => {
      const res = await apiRequest('POST', `/api/validators/${address}/${action}`);
      return res.json();
    },
    onSuccess: (_, action) => {
      toast({
        title: "상태 변경 성공",
        description: `검증자가 ${action === 'activate' ? '활성화' : '비활성화'}되었습니다.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/validators/${address}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/validators'] });
      setShowStatusDialog(false);
    },
    onError: () => {
      toast({
        title: "상태 변경 실패",
        description: "검증자 상태를 변경할 수 없습니다.",
        variant: "destructive",
      });
    },
  });

  // Delegation mutation
  const delegateMutation = useMutation({
    mutationFn: async (amount: string) => {
      const res = await apiRequest('POST', `/api/validators/${address}/delegate`, { amount });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "위임 성공",
        description: `${delegateAmount} TBURN이 위임되었습니다.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/validators/${address}`] });
      setShowDelegateDialog(false);
      setDelegateAmount("");
    },
    onError: () => {
      toast({
        title: "위임 실패",
        description: "토큰을 위임할 수 없습니다.",
        variant: "destructive",
      });
    },
  });

  // Claim rewards mutation
  const claimRewardsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/validators/${address}/claim-rewards`);
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "보상 청구 성공",
        description: `${formatTokenAmount(data.amount)} TBURN을 받았습니다.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/validators/${address}`] });
    },
    onError: () => {
      toast({
        title: "보상 청구 실패",
        description: "보상을 청구할 수 없습니다.",
        variant: "destructive",
      });
    },
  });

  // Update commission mutation
  const updateCommissionMutation = useMutation({
    mutationFn: async (commission: number) => {
      const res = await apiRequest('POST', `/api/validators/${address}/commission`, { commission });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "수수료 변경 성공",
        description: `수수료가 ${newCommission}%로 변경되었습니다.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/validators/${address}`] });
      setNewCommission("");
    },
    onError: () => {
      toast({
        title: "수수료 변경 실패",
        description: "수수료를 변경할 수 없습니다.",
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
          <h2 className="text-xl font-semibold mb-2">검증자를 찾을 수 없습니다</h2>
          <p className="text-muted-foreground mb-4">주소: {address}</p>
          <Link href="/validators">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              검증자 목록으로
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

  // Performance metrics for charts
  const performanceData = validator.performanceHistory?.slice(-24) || [];
  const rewardData = validator.rewardHistory?.slice(-30) || [];

  const pieData = [
    { name: 'Stake', value: Number(BigInt(validator.stake) / BigInt(1e18)) },
    { name: 'Delegated', value: Number(BigInt(validator.delegatedStake || 0) / BigInt(1e18)) }
  ];

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/validators">
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
              보상 청구
            </Button>
          )}
          <Dialog open={showDelegateDialog} onOpenChange={setShowDelegateDialog}>
            <DialogTrigger asChild>
              <Button variant="default" disabled={!isActive} data-testid="button-delegate">
                <Users className="h-4 w-4 mr-2" />
                위임하기
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>토큰 위임</DialogTitle>
                <DialogDescription>
                  이 검증자에게 TBURN 토큰을 위임합니다.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">위임 수량 (TBURN)</Label>
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
                  <p>현재 APY: {formatPercentage(validator.apy / 100)}</p>
                  <p>예상 일일 수익: {delegateAmount ? formatNumber(parseFloat(delegateAmount) * validator.apy / 36500) : '0'} TBURN</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDelegateDialog(false)}>
                  취소
                </Button>
                <Button 
                  onClick={() => delegateMutation.mutate(delegateAmount)}
                  disabled={!delegateAmount || delegateMutation.isPending}
                  data-testid="button-confirm-delegate"
                >
                  위임 확인
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
                {isActive ? '비활성화' : '활성화'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>검증자 상태 변경</DialogTitle>
                <DialogDescription>
                  검증자를 {isActive ? '비활성화' : '활성화'}하시겠습니까?
                  {isActive && ' 비활성화하면 더 이상 블록 생성에 참여하지 않습니다.'}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
                  취소
                </Button>
                <Button 
                  variant={isActive ? "destructive" : "default"}
                  onClick={() => toggleStatusMutation.mutate(isActive ? 'deactivate' : 'activate')}
                  disabled={toggleStatusMutation.isPending}
                  data-testid="button-confirm-status"
                >
                  {isActive ? '비활성화 확인' : '활성화 확인'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Status Alert */}
      {isJailed && (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">검증자 제재 중</CardTitle>
            </div>
            <CardDescription>
              이 검증자는 네트워크 규칙 위반으로 제재를 받았습니다. 제재 기간이 끝날 때까지 블록 생성에 참여할 수 없습니다.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Main Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">투표 권한</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(votingPowerTBURN)} TBURN</div>
            <Progress value={Math.min(votingPowerTBURN / 1000000 * 100, 100)} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              전체 네트워크의 {formatPercentage(votingPowerTBURN / 1250000)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">위임자 수</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{validator.delegators?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              총 위임: {formatTokenAmount(validator.delegatedStake || "0")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 보상</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTokenAmount(validator.rewardEarned || "0")}</div>
            <p className="text-xs text-muted-foreground mt-1">
              수수료: {validator.commission / 100}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">가동 시간</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(validator.uptime)}</div>
            <Progress 
              value={validator.uptime} 
              className={`mt-2 ${validator.uptime < 95 ? '[&>div]:bg-yellow-500' : ''} ${validator.uptime < 90 ? '[&>div]:bg-destructive' : ''}`}
            />
            <p className="text-xs text-muted-foreground mt-1">
              놓친 블록: {validator.missedBlocks || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="delegators">위임자</TabsTrigger>
          <TabsTrigger value="performance">성능</TabsTrigger>
          <TabsTrigger value="rewards">보상</TabsTrigger>
          <TabsTrigger value="events">이벤트</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>검증자 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">상태</p>
                  <div className="mt-1">
                    <Badge 
                      className={
                        isActive ? "bg-green-600" : 
                        isJailed ? "bg-destructive" : 
                        "bg-secondary"
                      }
                    >
                      {isActive ? '활성' : isJailed ? '제재 중' : '비활성'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">위원회 멤버</p>
                  <div className="mt-1">
                    {validator.isCommittee ? (
                      <Badge className="bg-purple-600">
                        <Shield className="h-3 w-3 mr-1" />
                        위원회
                      </Badge>
                    ) : (
                      <span className="text-sm">아니오</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">자체 스테이킹</p>
                  <p className="mt-1 text-lg font-semibold">{formatTokenAmount(validator.stake)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">위임받은 스테이킹</p>
                  <p className="mt-1 text-lg font-semibold">{formatTokenAmount(validator.delegatedStake || "0")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">평균 블록 시간</p>
                  <p className="mt-1 text-lg font-semibold">{validator.avgBlockTime?.toFixed(2) || '0'} 초</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">제재 횟수</p>
                  <p className="mt-1 text-lg font-semibold">{validator.slashCount || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">APY</p>
                  <p className="mt-1 text-lg font-semibold">{formatPercentage(validator.apy / 100)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">수수료</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-lg font-semibold">{validator.commission / 100}%</span>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">변경</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>수수료 변경</DialogTitle>
                          <DialogDescription>
                            새로운 수수료율을 입력하세요 (0-20%)
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="commission">수수료율 (%)</Label>
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
                            변경 확인
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">투표 권한 분포</h4>
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
                <h4 className="text-sm font-medium text-muted-foreground mb-2">AI 신뢰도 점수</h4>
                <div className="flex items-center gap-4">
                  <Brain className="h-5 w-5 text-purple-500" />
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">평판 점수</span>
                      <span className="text-sm font-semibold">{validator.reputationScore}/100</span>
                    </div>
                    <Progress value={validator.reputationScore} />
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">성능 점수</span>
                      <span className="text-sm font-semibold">{validator.performanceScore}/100</span>
                    </div>
                    <Progress value={validator.performanceScore} />
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">AI 신뢰도</span>
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
              <CardTitle>위임자 목록</CardTitle>
              <CardDescription>
                총 {validator.delegators?.length || 0}명이 {formatTokenAmount(validator.delegatedStake || "0")}을 위임했습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {validator.delegators && validator.delegators.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>주소</TableHead>
                      <TableHead className="text-right">위임량</TableHead>
                      <TableHead className="text-right">위임 시간</TableHead>
                      <TableHead className="text-center">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validator.delegators.map((delegator, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono">{formatAddress(delegator.address)}</TableCell>
                        <TableCell className="text-right">{formatTokenAmount(delegator.amount)}</TableCell>
                        <TableCell className="text-right">
                          {new Date(delegator.timestamp * 1000).toLocaleString('ko-KR')}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button variant="outline" size="sm">위임 취소</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  아직 위임자가 없습니다.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>성능 메트릭</CardTitle>
              <CardDescription>최근 24시간 성능 지표</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(t) => new Date(t * 1000).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    labelFormatter={(t) => new Date(t * 1000).toLocaleString('ko-KR')}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="blockTime" 
                    stroke="#8884d8" 
                    name="블록 시간 (초)"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="uptime" 
                    stroke="#82ca9d" 
                    name="가동률 (%)"
                  />
                </LineChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">평균 블록 시간</p>
                  <p className="text-2xl font-bold">{validator.avgBlockTime?.toFixed(2) || '0'} 초</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">제안된 블록</p>
                  <p className="text-2xl font-bold">{formatNumber(validator.totalBlocks || 0)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">놓친 블록</p>
                  <p className="text-2xl font-bold">{formatNumber(validator.missedBlocks || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>보상 내역</CardTitle>
              <CardDescription>최근 30일 보상 기록</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={rewardData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(t) => new Date(t * 1000).toLocaleDateString('ko-KR')}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(t) => new Date(t * 1000).toLocaleDateString('ko-KR')}
                    formatter={(value: any) => formatTokenAmount(value.toString())}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.6}
                    name="보상 (TBURN)"
                  />
                </AreaChart>
              </ResponsiveContainer>

              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">최근 보상</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>시간</TableHead>
                      <TableHead>유형</TableHead>
                      <TableHead className="text-right">금액</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validator.rewardHistory?.slice(0, 5).map((reward, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{new Date(reward.timestamp * 1000).toLocaleString('ko-KR')}</TableCell>
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
                          보상 내역이 없습니다
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
              <CardTitle>이벤트 로그</CardTitle>
              <CardDescription>검증자 활동 및 상태 변경 기록</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">시간</TableHead>
                    <TableHead>이벤트</TableHead>
                    <TableHead>설명</TableHead>
                    <TableHead>트랜잭션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validator.events?.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="text-sm">
                        {new Date(event.timestamp * 1000).toLocaleString('ko-KR')}
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
                          <Link href={`/tx/${event.txHash}`}>
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
                        이벤트 로그가 없습니다
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