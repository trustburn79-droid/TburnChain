import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Layers,
  RefreshCw,
  Play,
  Square,
  RotateCcw,
  Shield,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  Users,
  Coins,
  Award,
  Building2,
  Briefcase,
  Landmark,
  ChevronDown,
  ChevronUp,
  Zap,
  Bell,
  BarChart3,
  Calendar,
} from "lucide-react";

interface DistributionStatus {
  success: boolean;
  data: {
    isRunning: boolean;
    circuitBreakerState: string;
    queue: {
      taskQueueSize: number;
      batchQueueSize: number;
      activeBatches: number;
      completedBatches: number;
    };
    metrics: {
      totalTasks: number;
      completedTasks: number;
      failedTasks: number;
      pendingTasks: number;
      processingTasks: number;
      currentTPS: number;
      peakTPS: number;
      successRate: number;
      averageLatencyMs: number;
    };
    categoryProgress: {
      [key: string]: {
        total: number;
        completed: number;
        percentage: number;
        amountDistributed: number;
      };
    };
  };
}

interface CategoryAllocation {
  category: string;
  percentage: number;
  totalAmount: string;
  subcategories: {
    name: string;
    percentage: number;
    amount: string;
    tgePercentage: number;
    vestingMonths: number;
  }[];
}

interface VestingSchedule {
  category: string;
  subcategory: string;
  tgePercentage: number;
  cliffMonths: number;
  vestingMonths: number;
  vestingType: string;
  startDate: string;
}

interface Alert {
  id: string;
  policyId?: string;
  category?: string;
  message: string;
  severity: string;
  triggeredAt?: number;
  acknowledged?: boolean;
  value?: number;
  threshold?: number;
}

interface AlertsResponse {
  success: boolean;
  data: {
    active: Alert[];
    all: Alert[];
    policies: any[];
  };
}

const categoryIcons: { [key: string]: any } = {
  COMMUNITY: Users,
  REWARDS: Award,
  INVESTORS: Briefcase,
  ECOSYSTEM: Building2,
  TEAM: Users,
  FOUNDATION: Landmark,
};

const categoryColors: { [key: string]: string } = {
  COMMUNITY: 'bg-blue-500',
  REWARDS: 'bg-emerald-500',
  INVESTORS: 'bg-purple-500',
  ECOSYSTEM: 'bg-amber-500',
  TEAM: 'bg-rose-500',
  FOUNDATION: 'bg-cyan-500',
};

function formatTBURN(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
}

export default function AdminDistribution() {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("status");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const { data: statusData, isLoading: loadingStatus, refetch: refetchStatus } = useQuery<DistributionStatus>({
    queryKey: ['/api/admin/genesis/distribution/status'],
    refetchInterval: 5000,
  });

  const { data: allocationsData, isLoading: loadingAllocations, refetch: refetchAllocations } = useQuery<{ success: boolean; data: { allocations: any[]; totalSupply: number } }>({
    queryKey: ['/api/admin/genesis/distribution/allocations'],
    refetchInterval: 30000,
  });

  const { data: vestingData, isLoading: loadingVesting } = useQuery<{ success: boolean; data: VestingSchedule[] }>({
    queryKey: ['/api/admin/genesis/distribution/vesting'],
  });

  const { data: metricsData, refetch: refetchMetrics } = useQuery<{ success: boolean; data: any }>({
    queryKey: ['/api/admin/genesis/distribution/metrics'],
    refetchInterval: 10000,
  });

  const { data: alertsData, refetch: refetchAlerts } = useQuery<AlertsResponse>({
    queryKey: ['/api/admin/genesis/distribution/alerts'],
    refetchInterval: 15000,
  });

  const startMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/admin/genesis/distribution/start');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "분배 엔진 시작됨", description: "Genesis 분배가 시작되었습니다" });
      refetchStatus();
    },
    onError: (error: Error) => {
      toast({ title: "시작 실패", description: error.message, variant: "destructive" });
    },
  });

  const stopMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/admin/genesis/distribution/stop');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "분배 엔진 중지됨", description: "Genesis 분배가 중지되었습니다" });
      refetchStatus();
    },
    onError: (error: Error) => {
      toast({ title: "중지 실패", description: error.message, variant: "destructive" });
    },
  });

  const initializeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/admin/genesis/distribution/initialize');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "초기화 완료", description: "Genesis 분배 작업이 초기화되었습니다" });
      refetchStatus();
      refetchAllocations();
    },
    onError: (error: Error) => {
      toast({ title: "초기화 실패", description: error.message, variant: "destructive" });
    },
  });

  const resetCircuitBreakerMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/admin/genesis/distribution/circuit-breaker/reset');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Circuit Breaker 리셋", description: "Circuit breaker가 리셋되었습니다" });
      refetchStatus();
    },
    onError: (error: Error) => {
      toast({ title: "리셋 실패", description: error.message, variant: "destructive" });
    },
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchStatus(), refetchAllocations(), refetchMetrics(), refetchAlerts()]);
    setIsRefreshing(false);
    toast({ title: "새로고침 완료" });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const status = statusData?.data;
  const allocations = allocationsData?.data?.allocations || [];
  const vesting = vestingData?.data || [];
  const alerts = alertsData?.data?.active || [];
  const unacknowledgedAlerts = alerts.length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Genesis 분배 관리</h1>
          <p className="text-muted-foreground">Distribution Engine - 10B TBURN 분배 엔진 관리</p>
        </div>
        <div className="flex items-center gap-2">
          {unacknowledgedAlerts > 0 && (
            <Badge className="bg-red-500/10 text-red-500">
              <Bell className="h-3 w-3 mr-1" />
              {unacknowledgedAlerts} 알림
            </Badge>
          )}
          <Button onClick={handleRefresh} disabled={isRefreshing} data-testid="button-refresh">
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-engine-status">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">엔진 상태</CardTitle>
            <Activity className={`h-4 w-4 ${status?.isRunning ? 'text-emerald-500 animate-pulse' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge className={status?.isRunning ? "bg-emerald-500/10 text-emerald-500" : "bg-yellow-500/10 text-yellow-500"}>
                {status?.isRunning ? "실행 중" : "대기 중"}
              </Badge>
              <Badge className={status?.circuitBreakerState === 'closed' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}>
                <Shield className="h-3 w-3 mr-1" />
                {status?.circuitBreakerState === 'closed' ? "정상" : "차단"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-tasks">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">작업 현황</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStatus ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {status?.metrics?.completedTasks || 0}/{status?.metrics?.totalTasks || 0}
                </div>
                <Progress value={status?.metrics?.totalTasks ? ((status.metrics.completedTasks / status.metrics.totalTasks) * 100) : 0} className="mt-2 h-1" />
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-tps">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">처리량 (TPS)</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStatus ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{status?.metrics?.currentTPS?.toFixed(2) || '0.00'}</div>
                <p className="text-xs text-muted-foreground">피크: {status?.metrics?.peakTPS?.toFixed(2) || '0.00'}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-success-rate">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">성공률</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStatus ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{status?.metrics?.successRate?.toFixed(1) || '100'}%</div>
                <p className="text-xs text-muted-foreground">
                  실패: {status?.metrics?.failedTasks || 0}건
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-controls">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            엔진 제어
          </CardTitle>
          <CardDescription>Genesis 분배 엔진 시작, 중지 및 초기화</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <Button 
              onClick={() => initializeMutation.mutate()}
              disabled={initializeMutation.isPending || status?.isRunning}
              variant="outline"
              data-testid="button-initialize"
            >
              {initializeMutation.isPending ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="mr-2 h-4 w-4" />
              )}
              초기화
            </Button>
            <Button 
              onClick={() => startMutation.mutate()}
              disabled={startMutation.isPending || status?.isRunning}
              className="bg-emerald-600 hover:bg-emerald-700"
              data-testid="button-start"
            >
              {startMutation.isPending ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              시작
            </Button>
            <Button 
              onClick={() => stopMutation.mutate()}
              disabled={stopMutation.isPending || !status?.isRunning}
              variant="destructive"
              data-testid="button-stop"
            >
              {stopMutation.isPending ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Square className="mr-2 h-4 w-4" />
              )}
              중지
            </Button>
            {status?.circuitBreakerState !== 'closed' && (
              <Button 
                onClick={() => resetCircuitBreakerMutation.mutate()}
                disabled={resetCircuitBreakerMutation.isPending}
                variant="outline"
                data-testid="button-reset-circuit-breaker"
              >
                <Shield className="mr-2 h-4 w-4" />
                Circuit Breaker 리셋
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="status" data-testid="tab-status">진행 현황</TabsTrigger>
          <TabsTrigger value="allocations" data-testid="tab-allocations">카테고리 배분</TabsTrigger>
          <TabsTrigger value="vesting" data-testid="tab-vesting">베스팅 일정</TabsTrigger>
          <TabsTrigger value="metrics" data-testid="tab-metrics">성능 지표</TabsTrigger>
          <TabsTrigger value="alerts" data-testid="tab-alerts">
            알림
            {unacknowledgedAlerts > 0 && (
              <Badge className="ml-2 bg-red-500 text-white text-xs px-1.5">{unacknowledgedAlerts}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>카테고리별 분배 진행</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(status?.categoryProgress || {}).map(([category, progress]) => {
                  const Icon = categoryIcons[category] || Coins;
                  const color = categoryColors[category] || 'bg-gray-500';
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded ${color}/10`}>
                            <Icon className={`h-4 w-4 ${color.replace('bg-', 'text-')}`} />
                          </div>
                          <span className="font-medium">{category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {progress.completed}/{progress.total}
                          </span>
                          <span className="font-medium">{progress.percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                      <Progress value={progress.percentage} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        분배됨: {formatTBURN(progress.amountDistributed)} TBURN
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>10B TBURN 카테고리 배분</CardTitle>
              <CardDescription>각 카테고리를 클릭하여 서브카테고리 확인</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {allocations.map((allocation) => {
                    const Icon = categoryIcons[allocation.category] || Coins;
                    const color = categoryColors[allocation.category] || 'bg-gray-500';
                    const isExpanded = expandedCategories.includes(allocation.category);
                    const subcategories = allocation.details?.subcategories ? Object.entries(allocation.details.subcategories) : [];
                    return (
                      <Collapsible key={allocation.category} open={isExpanded} onOpenChange={() => toggleCategory(allocation.category)}>
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${color}/10`}>
                                <Icon className={`h-5 w-5 ${color.replace('bg-', 'text-')}`} />
                              </div>
                              <div className="text-left">
                                <p className="font-medium">{allocation.category}</p>
                                <p className="text-xs text-muted-foreground">{subcategories.length}개 서브카테고리</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="font-bold">{allocation.percentage}%</p>
                                <p className="text-xs text-muted-foreground">{formatTBURN(allocation.amount || 0)} TBURN</p>
                              </div>
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="ml-12 mt-2 space-y-2">
                            {subcategories.map(([key, sub]: [string, any]) => (
                              <div key={key} className="flex items-center justify-between p-2 rounded border-l-2 border-muted bg-muted/20">
                                <div>
                                  <p className="text-sm font-medium">{sub.description || key}</p>
                                  <p className="text-xs text-muted-foreground">
                                    TGE: {sub.tgePercent || 0}% | 비율: {sub.parentPercentage || sub.percentage}%
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium">{sub.percentage}%</p>
                                  <p className="text-xs text-muted-foreground">{formatTBURN(sub.amount || 0)} TBURN</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vesting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>베스팅 일정</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>카테고리</TableHead>
                      <TableHead>서브카테고리</TableHead>
                      <TableHead className="text-right">TGE %</TableHead>
                      <TableHead className="text-right">클리프</TableHead>
                      <TableHead className="text-right">베스팅</TableHead>
                      <TableHead>타입</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vesting.map((schedule, idx) => (
                      <TableRow key={idx} data-testid={`row-vesting-${idx}`}>
                        <TableCell className="font-medium">{schedule.category}</TableCell>
                        <TableCell>{schedule.subcategory}</TableCell>
                        <TableCell className="text-right">{schedule.tgePercentage}%</TableCell>
                        <TableCell className="text-right">{schedule.cliffMonths}개월</TableCell>
                        <TableCell className="text-right">{schedule.vestingMonths}개월</TableCell>
                        <TableCell>
                          <Badge variant="outline">{schedule.vestingType}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  처리 성능
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">현재 TPS</span>
                    <span className="font-bold">{status?.metrics?.currentTPS?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">피크 TPS</span>
                    <span className="font-bold">{status?.metrics?.peakTPS?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">평균 레이턴시</span>
                    <span className="font-bold">{status?.metrics?.averageLatencyMs?.toFixed(0) || '0'}ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">성공률</span>
                    <span className="font-bold">{status?.metrics?.successRate?.toFixed(2) || '100'}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  큐 상태
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">대기 중 작업</span>
                    <span className="font-bold">{status?.queue?.taskQueueSize || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">배치 큐</span>
                    <span className="font-bold">{status?.queue?.batchQueueSize || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">활성 배치</span>
                    <span className="font-bold">{status?.queue?.activeBatches || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">완료된 배치</span>
                    <span className="font-bold">{status?.queue?.completedBatches || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                알림 ({alerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {alerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mb-2 text-emerald-500" />
                    <p>활성 알림이 없습니다</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {alerts.map((alert) => (
                      <div 
                        key={alert.id} 
                        className={`p-3 rounded-lg border ${alert.acknowledged ? 'opacity-50' : ''} ${
                          alert.severity === 'critical' ? 'border-red-500/50 bg-red-500/5' :
                          alert.severity === 'warning' ? 'border-amber-500/50 bg-amber-500/5' :
                          'border-blue-500/50 bg-blue-500/5'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <AlertCircle className={`h-4 w-4 mt-0.5 ${
                              alert.severity === 'critical' ? 'text-red-500' :
                              alert.severity === 'warning' ? 'text-amber-500' :
                              'text-blue-500'
                            }`} />
                            <div>
                              <p className="text-sm font-medium">{alert.category || alert.policyId}</p>
                              <p className="text-xs text-muted-foreground">{alert.message}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="text-xs">
                              {alert.severity}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {alert.triggeredAt ? new Date(alert.triggeredAt).toLocaleTimeString('ko-KR') : '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
