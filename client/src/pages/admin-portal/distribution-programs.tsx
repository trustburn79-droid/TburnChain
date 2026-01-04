/**
 * TBURN Enterprise Distribution Programs Admin
 * Production-grade admin interface for 8 token distribution programs
 */

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Coins,
  Users,
  Gift,
  Calendar,
  MessageSquare,
  Building2,
  Box,
  Shield,
  Leaf,
  Play,
  Pause,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Clock,
  Zap,
  Target,
  Activity,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ProgramConfig {
  program: string;
  name: string;
  displayName: string;
  displayNameKo: string;
  totalAllocation: number;
  parentCategory: string;
  parentPercentage: number;
  minClaimAmount: number;
  maxClaimAmount: number;
  dailyLimit: number;
  batchSize: number;
  autoApprovalThreshold: number;
  tgePercent: number;
  cliffMonths: number;
  vestingMonths: number;
  enabled: boolean;
}

interface ProgramMetrics {
  program: string;
  totalClaims: number;
  completedClaims: number;
  pendingClaims: number;
  failedClaims: number;
  rejectedClaims: number;
  totalDistributed: number;
  remainingAllocation: number;
  utilizationPercent: number;
  averageClaimSize: number;
  averageProcessingTimeMs: number;
  claimsPerHour: number;
  fraudDetectionRate: number;
  approvalRate: number;
  lastClaimAt: number;
  peakTPS: number;
  currentTPS: number;
}

interface EngineStatus {
  isRunning: boolean;
  programs: { program: string; enabled: boolean; queueSize: number; circuitBreakerState: string }[];
  totalPendingClaims: number;
  totalCompletedClaims: number;
  activeBatchCount: number;
}

const programIcons: Record<string, any> = {
  AIRDROP: Gift,
  REFERRAL: Users,
  EVENTS: Calendar,
  COMMUNITY_ACTIVITY: MessageSquare,
  DAO_TREASURY: Building2,
  BLOCK_REWARDS: Box,
  VALIDATOR_INCENTIVES: Shield,
  ECOSYSTEM_FUND: Leaf,
};

const programColors: Record<string, string> = {
  AIRDROP: "bg-purple-500",
  REFERRAL: "bg-blue-500",
  EVENTS: "bg-green-500",
  COMMUNITY_ACTIVITY: "bg-yellow-500",
  DAO_TREASURY: "bg-orange-500",
  BLOCK_REWARDS: "bg-red-500",
  VALIDATOR_INCENTIVES: "bg-cyan-500",
  ECOSYSTEM_FUND: "bg-emerald-500",
};

function formatNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return num.toLocaleString();
}

function formatTBURN(amount: number): string {
  return formatNumber(amount) + " TBURN";
}

export default function DistributionProgramsPage() {
  const { toast } = useToast();
  const [expandedPrograms, setExpandedPrograms] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: statusData, isLoading: loadingStatus, refetch: refetchStatus } = useQuery<{ success: boolean; data: EngineStatus }>({
    queryKey: ['/api/distribution-programs/engine/status'],
    refetchInterval: 3000,
  });

  const { data: programsData, isLoading: loadingPrograms, refetch: refetchPrograms } = useQuery<{ success: boolean; data: { programs: { config: ProgramConfig; metrics: ProgramMetrics }[] } }>({
    queryKey: ['/api/distribution-programs/programs'],
    refetchInterval: 5000,
  });

  const { data: metricsData, isLoading: loadingMetrics } = useQuery<{ success: boolean; data: { summary: any; programMetrics: ProgramMetrics[] } }>({
    queryKey: ['/api/distribution-programs/metrics'],
    refetchInterval: 5000,
  });

  const startEngineMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/distribution-programs/engine/start'),
    onSuccess: () => {
      toast({ title: "엔진 시작됨", description: "분배 프로그램 엔진이 시작되었습니다." });
      refetchStatus();
    },
    onError: (error: any) => {
      toast({ title: "오류", description: error.message, variant: "destructive" });
    },
  });

  const stopEngineMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/distribution-programs/engine/stop'),
    onSuccess: () => {
      toast({ title: "엔진 중지됨", description: "분배 프로그램 엔진이 중지되었습니다." });
      refetchStatus();
    },
    onError: (error: any) => {
      toast({ title: "오류", description: error.message, variant: "destructive" });
    },
  });

  const enableProgramMutation = useMutation({
    mutationFn: (program: string) => apiRequest('POST', `/api/distribution-programs/programs/${program}/enable`),
    onSuccess: () => {
      refetchPrograms();
      toast({ title: "프로그램 활성화됨" });
    },
  });

  const disableProgramMutation = useMutation({
    mutationFn: (program: string) => apiRequest('POST', `/api/distribution-programs/programs/${program}/disable`),
    onSuccess: () => {
      refetchPrograms();
      toast({ title: "프로그램 비활성화됨" });
    },
  });

  const resetCircuitBreakerMutation = useMutation({
    mutationFn: (program: string) => apiRequest('POST', `/api/distribution-programs/programs/${program}/reset-circuit-breaker`),
    onSuccess: () => {
      refetchStatus();
      toast({ title: "Circuit Breaker 리셋됨" });
    },
  });

  const toggleProgram = (program: string) => {
    setExpandedPrograms(prev =>
      prev.includes(program) ? prev.filter(p => p !== program) : [...prev, program]
    );
  };

  const status = statusData?.data;
  const programs = programsData?.data?.programs || [];
  const summary = metricsData?.data?.summary;

  const isLoading = loadingStatus || loadingPrograms || loadingMetrics;

  if (isLoading && !status) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">토큰 분배 프로그램</h1>
          <p className="text-muted-foreground">8개 엔터프라이즈급 분배 프로그램 관리</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={status?.isRunning ? "default" : "secondary"} data-testid="badge-engine-status">
            {status?.isRunning ? "실행 중" : "중지됨"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { refetchStatus(); refetchPrograms(); }}
            data-testid="button-refresh"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
          {status?.isRunning ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => stopEngineMutation.mutate()}
              disabled={stopEngineMutation.isPending}
              data-testid="button-stop-engine"
            >
              <Pause className="h-4 w-4 mr-2" />
              엔진 중지
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => startEngineMutation.mutate()}
              disabled={startEngineMutation.isPending}
              data-testid="button-start-engine"
            >
              <Play className="h-4 w-4 mr-2" />
              엔진 시작
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">총 분배량</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-distributed">
              {formatTBURN(summary?.totalDistributed || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary?.totalCompleted || 0}건 완료
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">대기 중 청구</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-pending-claims">
              {(summary?.totalPending || status?.totalPendingClaims || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {status?.activeBatchCount || 0}개 배치 처리 중
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">성공률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-success-rate">
              {(summary?.successRate || 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              실패: {summary?.totalFailed || 0}건
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">활성 프로그램</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-programs">
              {programs.filter(p => p.config.enabled).length} / 8
            </div>
            <p className="text-xs text-muted-foreground">
              8개 중 활성화됨
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" data-testid="tab-overview">프로그램 현황</TabsTrigger>
          <TabsTrigger value="details" data-testid="tab-details">상세 설정</TabsTrigger>
          <TabsTrigger value="performance" data-testid="tab-performance">성능 지표</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {programs.map(({ config, metrics }) => {
              const Icon = programIcons[config.program] || Coins;
              const color = programColors[config.program] || "bg-gray-500";
              const isExpanded = expandedPrograms.includes(config.program);
              const programStatus = status?.programs.find(p => p.program === config.program);

              return (
                <Card key={config.program} className={!config.enabled ? "opacity-60" : ""}>
                  <Collapsible open={isExpanded} onOpenChange={() => toggleProgram(config.program)}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${color}/10`}>
                            <Icon className={`h-5 w-5 ${color.replace('bg-', 'text-')}`} />
                          </div>
                          <div>
                            <CardTitle className="text-base">{config.displayNameKo}</CardTitle>
                            <CardDescription className="text-xs">{config.displayName}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={config.enabled}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                enableProgramMutation.mutate(config.program);
                              } else {
                                disableProgramMutation.mutate(config.program);
                              }
                            }}
                            data-testid={`switch-${config.program.toLowerCase()}`}
                          />
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`button-expand-${config.program.toLowerCase()}`}>
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">할당량 사용률</span>
                          <span className="font-medium">{(metrics.utilizationPercent || 0).toFixed(1)}%</span>
                        </div>
                        <Progress value={metrics.utilizationPercent || 0} className="h-2" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatTBURN(metrics.totalDistributed || 0)} 분배됨</span>
                          <span>{formatTBURN(config.totalAllocation)} 총 할당</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-muted/50 rounded p-2">
                          <div className="text-lg font-bold text-green-500">{metrics.completedClaims || 0}</div>
                          <div className="text-xs text-muted-foreground">완료</div>
                        </div>
                        <div className="bg-muted/50 rounded p-2">
                          <div className="text-lg font-bold text-yellow-500">{metrics.pendingClaims || 0}</div>
                          <div className="text-xs text-muted-foreground">대기</div>
                        </div>
                        <div className="bg-muted/50 rounded p-2">
                          <div className="text-lg font-bold text-red-500">{metrics.failedClaims || 0}</div>
                          <div className="text-xs text-muted-foreground">실패</div>
                        </div>
                      </div>

                      <CollapsibleContent className="space-y-3 pt-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                            <span className="text-muted-foreground">평균 청구액</span>
                            <span className="font-medium">{formatTBURN(metrics.averageClaimSize || 0)}</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                            <span className="text-muted-foreground">처리 TPS</span>
                            <span className="font-medium">{(metrics.currentTPS || 0).toFixed(0)}</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                            <span className="text-muted-foreground">승인율</span>
                            <span className="font-medium">{(metrics.approvalRate || 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                            <span className="text-muted-foreground">사기탐지율</span>
                            <span className="font-medium">{(metrics.fraudDetectionRate || 0).toFixed(1)}%</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={programStatus?.circuitBreakerState === "closed" ? "outline" : "destructive"}>
                              CB: {programStatus?.circuitBreakerState || "unknown"}
                            </Badge>
                            <Badge variant="outline">
                              큐: {programStatus?.queueSize || 0}
                            </Badge>
                          </div>
                          {programStatus?.circuitBreakerState !== "closed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => resetCircuitBreakerMutation.mutate(config.program)}
                              data-testid={`button-reset-cb-${config.program.toLowerCase()}`}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              CB 리셋
                            </Button>
                          )}
                        </div>
                      </CollapsibleContent>
                    </CardContent>
                  </Collapsible>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>프로그램 설정 상세</CardTitle>
              <CardDescription>각 프로그램의 한도 및 베스팅 설정</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {programs.map(({ config }) => {
                    const Icon = programIcons[config.program] || Coins;
                    return (
                      <div key={config.program} className="border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <Icon className="h-5 w-5" />
                          <div>
                            <h3 className="font-semibold">{config.displayNameKo}</h3>
                            <p className="text-sm text-muted-foreground">{config.parentCategory} 카테고리 - {config.parentPercentage}%</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">총 할당량</div>
                            <div className="font-medium">{formatTBURN(config.totalAllocation)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">일일 한도</div>
                            <div className="font-medium">{formatTBURN(config.dailyLimit)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">최소 청구액</div>
                            <div className="font-medium">{formatTBURN(config.minClaimAmount)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">최대 청구액</div>
                            <div className="font-medium">{formatTBURN(config.maxClaimAmount)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">자동 승인 한도</div>
                            <div className="font-medium">{formatTBURN(config.autoApprovalThreshold)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">배치 크기</div>
                            <div className="font-medium">{config.batchSize.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">TGE 비율</div>
                            <div className="font-medium">{config.tgePercent}%</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">베스팅</div>
                            <div className="font-medium">
                              {config.cliffMonths > 0 ? `${config.cliffMonths}개월 클리프 + ` : ""}
                              {config.vestingMonths}개월
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  처리량 (TPS)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {programs.map(({ config, metrics }) => (
                    <div key={config.program} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{config.displayNameKo}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{(metrics.currentTPS || 0).toFixed(0)} TPS</div>
                          <div className="text-xs text-muted-foreground">피크: {(metrics.peakTPS || 0).toFixed(0)}</div>
                        </div>
                        <Progress value={(metrics.currentTPS / (config.batchSize || 1)) * 100} className="w-20 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  할당량 사용률
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {programs.map(({ config, metrics }) => (
                    <div key={config.program} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{config.displayNameKo}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{(metrics.utilizationPercent || 0).toFixed(2)}%</div>
                          <div className="text-xs text-muted-foreground">{formatTBURN(metrics.remainingAllocation || 0)} 남음</div>
                        </div>
                        <Progress value={metrics.utilizationPercent || 0} className="w-20 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  처리 시간
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {programs.map(({ config, metrics }) => (
                    <div key={config.program} className="flex items-center justify-between">
                      <span className="text-sm">{config.displayNameKo}</span>
                      <div className="text-right">
                        <span className="text-sm font-medium">{(metrics.averageProcessingTimeMs || 0).toFixed(0)}ms</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  시간당 청구 처리
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {programs.map(({ config, metrics }) => (
                    <div key={config.program} className="flex items-center justify-between">
                      <span className="text-sm">{config.displayNameKo}</span>
                      <div className="text-right">
                        <span className="text-sm font-medium">{(metrics.claimsPerHour || 0).toLocaleString()}/hr</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
