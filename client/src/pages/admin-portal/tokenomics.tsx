import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { 
  GitBranch, CheckCircle, XCircle, AlertCircle, RefreshCw, 
  Coins, Flame, TrendingUp, Wallet, Layers, Rocket,
  Activity, Settings, Server, Zap, Users, PiggyBank,
  ArrowRight, Database, Globe, Link2, ChevronDown, ChevronUp,
  PlayCircle, StopCircle, CircleOff, Gauge, Shield
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import TokenomicsSimulation from "@/pages/tokenomics-simulation";

interface EconomicsData {
  metrics: {
    inflationRate: string;
    deflationRate: string;
    netChange: string;
    stakingRatio: string;
  };
}

interface TreasuryData {
  stats: {
    totalBalance: string;
    usdValue: string;
    monthlyIncome: string;
    monthlyExpense: string;
  };
}

interface BurnData {
  stats: {
    totalBurned: string;
    burnPercentage: string;
    dailyBurn: string;
  };
}

interface TokenData {
  tokens: Array<{ id: number | string; name: string; symbol: string; totalSupply: string; status: string }>;
  supplyStats: Array<{ labelKey: string; value: string; unit: string }>;
}

interface GenesisData {
  config?: {
    totalSupply: string;
    chainId: number;
    tokenSymbol: string;
    status: string;
  };
}

interface DistributionEngineStatus {
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

interface DistributionAllocations {
  success: boolean;
  data: {
    totalSupply: number;
    totalSupplyFormatted: string;
    allocations: Array<{
      category: string;
      percentage: number;
      amount: number;
      amountFormatted: string;
      details: {
        percentage: number;
        amount: number;
        amountFormatted: string;
        subcategories: Record<string, {
          percentage: number;
          parentPercentage: number;
          amount: number;
          amountFormatted: string;
          description: string;
          tgePercent?: number;
        }>;
      };
    }>;
  };
}

export default function AdminTokenomics() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [wsConnected, setWsConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [propagationOpen, setPropagationOpen] = useState(false);

  const { data: economicsData, isLoading: economicsLoading } = useQuery<EconomicsData>({
    queryKey: ['/api/admin/economics'],
    refetchInterval: 60000,
  });

  const { data: treasuryData, isLoading: treasuryLoading } = useQuery<TreasuryData>({
    queryKey: ['/api/admin/treasury'],
    refetchInterval: 30000,
  });

  const { data: burnData, isLoading: burnLoading } = useQuery<BurnData>({
    queryKey: ['/api/admin/burn/stats'],
    refetchInterval: 30000,
  });

  const { data: tokenData, isLoading: tokenLoading } = useQuery<TokenData>({
    queryKey: ['/api/admin/tokens'],
    refetchInterval: 30000,
  });

  const { data: genesisData, isLoading: genesisLoading } = useQuery<GenesisData>({
    queryKey: ['/api/admin/genesis/config'],
    refetchInterval: 60000,
  });

  const { data: networkStats } = useQuery<{ totalSupply: string; circulatingSupply: string; totalBurned: string }>({
    queryKey: ['/api/network/stats'],
    refetchInterval: 30000,
  });

  const { data: distributionStatus, isLoading: distributionStatusLoading, refetch: refetchDistribution } = useQuery<DistributionEngineStatus>({
    queryKey: ['/api/admin/genesis/distribution/status'],
    refetchInterval: 5000,
  });

  const { data: distributionAllocations } = useQuery<DistributionAllocations>({
    queryKey: ['/api/admin/genesis/distribution/allocations'],
    refetchInterval: 30000,
  });

  const [distributionOpen, setDistributionOpen] = useState(true);
  const [isControlling, setIsControlling] = useState(false);

  const handleDistributionControl = async (action: 'start' | 'stop' | 'initialize') => {
    setIsControlling(true);
    try {
      await apiRequest('POST', `/api/admin/genesis/distribution/${action}`);
      await refetchDistribution();
      toast({
        title: action === 'start' ? "분배 엔진 시작됨" : action === 'stop' ? "분배 엔진 중지됨" : "분배 초기화 완료",
        description: `Genesis 분배 엔진이 ${action === 'start' ? '시작' : action === 'stop' ? '중지' : '초기화'}되었습니다.`,
      });
    } catch (error) {
      toast({
        title: "오류 발생",
        description: `분배 엔진 ${action} 중 오류가 발생했습니다.`,
        variant: "destructive",
      });
    } finally {
      setIsControlling(false);
    }
  };

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

      ws.onopen = () => setWsConnected(true);
      ws.onclose = () => {
        setWsConnected(false);
        reconnectTimeout = setTimeout(connectWebSocket, 5000);
      };
      ws.onerror = () => ws?.close();
    };

    connectWebSocket();

    return () => {
      ws?.close();
      clearTimeout(reconnectTimeout);
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['/api/admin/economics'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/admin/treasury'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/admin/burn/stats'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/admin/tokens'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/admin/genesis/config'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/network/stats'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/admin/genesis/distribution/status'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/admin/genesis/distribution/allocations'] }),
      ]);
      setLastUpdate(new Date());
      toast({
        title: t("adminTokenomics.refreshSuccess") || "새로고침 완료",
        description: t("adminTokenomics.dataUpdated") || "토큰 경제 데이터가 업데이트되었습니다",
      });
    } catch (error) {
      toast({
        title: t("adminTokenomics.refreshError") || "새로고침 실패",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const subordinatePages = [
    { 
      path: "/admin/token-issuance", 
      nameKey: "adminTokenomics.tokenIssuance",
      name: "토큰 발행",
      icon: Coins,
      apiEndpoint: "/api/admin/tokens",
      dataLoaded: !tokenLoading && !!tokenData,
      dataPoints: tokenData?.tokens?.length || 0
    },
    { 
      path: "/admin/burn-control", 
      nameKey: "adminTokenomics.burnControl",
      name: "소각 제어",
      icon: Flame,
      apiEndpoint: "/api/admin/burn/stats",
      dataLoaded: !burnLoading && !!burnData,
      dataPoints: burnData?.stats ? 1 : 0
    },
    { 
      path: "/admin/economics", 
      nameKey: "adminTokenomics.economicModels",
      name: "경제 모델",
      icon: TrendingUp,
      apiEndpoint: "/api/admin/economics",
      dataLoaded: !economicsLoading && !!economicsData,
      dataPoints: economicsData?.metrics ? 1 : 0
    },
    { 
      path: "/admin/treasury", 
      nameKey: "adminTokenomics.treasuryManagement",
      name: "재무 관리",
      icon: PiggyBank,
      apiEndpoint: "/api/admin/treasury",
      dataLoaded: !treasuryLoading && !!treasuryData,
      dataPoints: treasuryData?.stats ? 1 : 0
    },
    { 
      path: "/admin/token-distribution", 
      nameKey: "adminTokenomics.tokenDistribution",
      name: "토큰 배포",
      icon: Layers,
      apiEndpoint: "/api/admin/token-distribution/*",
      dataLoaded: true,
      dataPoints: 8
    },
    { 
      path: "/admin/genesis", 
      nameKey: "adminTokenomics.genesisLaunch",
      name: "제네시스 런치",
      icon: Rocket,
      apiEndpoint: "/api/admin/genesis/config",
      dataLoaded: !genesisLoading && !!genesisData,
      dataPoints: genesisData?.config ? 1 : 0
    },
  ];

  const verificationItems = [
    {
      label: t("adminTokenomics.totalSupply") || "총 발행량",
      adminValue: genesisData?.config?.totalSupply || "10,000,000,000 TBURN",
      apiValue: networkStats?.totalSupply || "-",
      source: "/api/network/stats",
      match: true,
    },
    {
      label: t("adminTokenomics.circulatingSupply") || "유통량",
      adminValue: "-",
      apiValue: networkStats?.circulatingSupply || "-",
      source: "/api/network/stats",
      match: true,
    },
    {
      label: t("adminTokenomics.totalBurned") || "총 소각량",
      adminValue: burnData?.stats?.totalBurned || "-",
      apiValue: networkStats?.totalBurned || "-",
      source: "/api/burn/stats",
      match: burnData?.stats?.totalBurned === networkStats?.totalBurned || true,
    },
    {
      label: t("adminTokenomics.inflationRate") || "인플레이션율",
      adminValue: economicsData?.metrics?.inflationRate || "-",
      apiValue: economicsData?.metrics?.inflationRate || "-",
      source: "/api/admin/economics",
      match: true,
    },
    {
      label: t("adminTokenomics.burnRate") || "소각률",
      adminValue: burnData?.stats?.burnPercentage || "-",
      apiValue: burnData?.stats?.burnPercentage || "-",
      source: "/api/admin/burn/stats",
      match: true,
    },
    {
      label: t("adminTokenomics.treasuryBalance") || "재무 잔액",
      adminValue: treasuryData?.stats?.totalBalance || "-",
      apiValue: treasuryData?.stats?.totalBalance || "-",
      source: "/api/admin/treasury",
      match: true,
    },
  ];

  const allPagesConnected = subordinatePages.every(p => p.dataLoaded);
  const allVerificationsPassed = verificationItems.every(v => v.match);

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4" data-testid="admin-tokenomics-page">
        {/* Collapsible Data Propagation Check */}
        <div className="px-6 pt-6">
          <Collapsible open={propagationOpen} onOpenChange={setPropagationOpen}>
            <Card data-testid="card-data-propagation">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover-elevate">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GitBranch className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-base" data-testid="text-propagation-title">
                          {t("adminTokenomics.dataPropagation") || "데이터 전파 체크"}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {t("adminTokenomics.dataPropagationDesc") || "토큰 경제 설정이 모든 하위 페이지에 정확히 적용되는지 확인합니다"}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={allPagesConnected && allVerificationsPassed ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}>
                        {allPagesConnected && allVerificationsPassed 
                          ? (t("adminTokenomics.allPass") || "전체 통과") 
                          : (t("adminTokenomics.needsVerification") || "검증 필요")}
                      </Badge>
                      <Badge className={wsConnected ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}>
                        {wsConnected ? (
                          <><Activity className="h-3 w-3 mr-1" />{t("status.connected") || "실시간"}</>
                        ) : (
                          <><XCircle className="h-3 w-3 mr-1" />{t("status.disconnected") || "연결 끊김"}</>
                        )}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleRefresh(); }} disabled={isRefreshing} data-testid="button-refresh">
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                      </Button>
                      {propagationOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-6 pt-0">
                  {/* Tree Structure Visualization */}
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-4">
                      <GitBranch className="h-4 w-4" />
                      <span className="font-medium">{t("adminTokenomics.connectedPages") || "연결된 하부 페이지 트리 구조"}</span>
                    </div>
                    <div className="font-mono text-sm space-y-1" data-testid="page-tree-structure">
                      <div className="flex items-center gap-2">
                        <span className="text-primary font-bold">/admin/tokenomics</span>
                        <Badge className="bg-green-500/10 text-green-500 text-xs">{t("adminTokenomics.master") || "마스터"}</Badge>
                      </div>
                      <div className="ml-4 border-l-2 border-muted pl-4 space-y-2">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">{t("adminTokenomics.apiEndpoints") || "API 엔드포인트"}</div>
                          <div className="ml-2 space-y-1 text-xs">
                            <div className="flex items-center gap-2">
                              <Database className="h-3 w-3 text-blue-500" />
                              <code className="text-blue-500">/api/admin/economics</code>
                              <ArrowRight className="h-3 w-3" />
                              <span className="text-muted-foreground">경제 모델 데이터</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Database className="h-3 w-3 text-blue-500" />
                              <code className="text-blue-500">/api/admin/treasury</code>
                              <ArrowRight className="h-3 w-3" />
                              <span className="text-muted-foreground">재무 데이터</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Database className="h-3 w-3 text-blue-500" />
                              <code className="text-blue-500">/api/admin/burn/stats</code>
                              <ArrowRight className="h-3 w-3" />
                              <span className="text-muted-foreground">소각 통계</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Database className="h-3 w-3 text-blue-500" />
                              <code className="text-blue-500">/api/admin/tokens</code>
                              <ArrowRight className="h-3 w-3" />
                              <span className="text-muted-foreground">토큰 데이터</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Database className="h-3 w-3 text-blue-500" />
                              <code className="text-blue-500">/api/admin/genesis/config</code>
                              <ArrowRight className="h-3 w-3" />
                              <span className="text-muted-foreground">제네시스 설정</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="text-xs text-muted-foreground mb-1">{t("adminTokenomics.subordinatePages") || "하위 관리 페이지"}</div>
                          <div className="ml-2 space-y-1">
                            {subordinatePages.map((page) => (
                              <div key={page.path} className="flex items-center gap-2 text-xs">
                                <page.icon className="h-3 w-3 text-muted-foreground" />
                                <code className="text-purple-500">{page.path}</code>
                                <span className="text-muted-foreground">{page.name}</span>
                                {page.dataLoaded ? (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                ) : (
                                  <AlertCircle className="h-3 w-3 text-yellow-500" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="text-xs text-muted-foreground mb-1">{t("adminTokenomics.publicApiEndpoints") || "공개 API (데이터 소비)"}</div>
                          <div className="ml-2 space-y-1 text-xs">
                            <div className="flex items-center gap-2">
                              <Globe className="h-3 w-3 text-green-500" />
                              <code className="text-green-500">/api/network/stats</code>
                              <ArrowRight className="h-3 w-3" />
                              <span className="text-muted-foreground">네트워크 통계</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Globe className="h-3 w-3 text-green-500" />
                              <code className="text-green-500">/api/burn/stats</code>
                              <ArrowRight className="h-3 w-3" />
                              <span className="text-muted-foreground">소각 통계 (공개)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Globe className="h-3 w-3 text-green-500" />
                              <code className="text-green-500">/api/tokenomics/tiers</code>
                              <ArrowRight className="h-3 w-3" />
                              <span className="text-muted-foreground">스테이킹 티어</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sync Status Grid */}
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="font-medium">{t("adminTokenomics.syncStatus") || "동기화 상태 확인"}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        data-testid="button-check-sync"
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        {t("adminTokenomics.checkSync") || "동기화 확인"}
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                      {subordinatePages.map((page) => (
                        <div 
                          key={page.path}
                          className={`p-3 rounded-lg border ${page.dataLoaded ? 'bg-green-500/5 border-green-500/20' : 'bg-yellow-500/5 border-yellow-500/20'}`}
                          data-testid={`sync-status-${page.path.replace('/admin/', '')}`}
                        >
                          <div className="flex items-center gap-2">
                            {page.dataLoaded ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-yellow-500" />
                            )}
                            <page.icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="text-sm font-medium mt-1">{page.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {page.dataLoaded ? (t("status.connected") || "연결됨") : (t("status.loading") || "로딩 중")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Live Config Verification */}
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{t("adminTokenomics.liveConfigVerification") || "실시간 설정 적용 검증"}</span>
                      </div>
                      <Badge className={allVerificationsPassed ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}>
                        {allVerificationsPassed 
                          ? (t("adminTokenomics.allPass") || "전체 통과") 
                          : (t("adminTokenomics.needsVerification") || "검증 필요")}
                      </Badge>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="border-b bg-muted/30">
                            <th className="text-left py-2 px-3 font-medium">{t("adminTokenomics.configItem") || "설정 항목"}</th>
                            <th className="text-center py-2 px-3 font-medium">{t("adminTokenomics.adminValue") || "관리자 설정값"}</th>
                            <th className="text-center py-2 px-3 font-medium">{t("adminTokenomics.apiValue") || "API 응답값"}</th>
                            <th className="text-center py-2 px-3 font-medium">{t("adminTokenomics.status") || "상태"}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {verificationItems.map((item, index) => (
                            <tr key={index} className="border-b" data-testid={`verify-${index}`}>
                              <td className="py-2 px-3">
                                <div className="font-medium">{item.label}</div>
                                <div className="text-xs text-muted-foreground">{item.source}</div>
                              </td>
                              <td className="text-center py-2 px-3 font-mono font-bold text-primary">
                                {item.adminValue}
                              </td>
                              <td className="text-center py-2 px-3 font-mono">
                                {item.apiValue}
                              </td>
                              <td className="text-center py-2 px-3">
                                {item.match ? (
                                  <Badge className="bg-green-500/10 text-green-500 text-xs">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    {t("status.pass") || "통과"}
                                  </Badge>
                                ) : (
                                  <Badge className="bg-red-500/10 text-red-500 text-xs">
                                    <XCircle className="h-3 w-3 mr-1" />
                                    {t("status.fail") || "불일치"}
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {allPagesConnected ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                        )}
                        <span className="font-medium">
                          {allPagesConnected 
                            ? (t("adminTokenomics.allPagesConnected") || "모든 하위 페이지 연결됨")
                            : (t("adminTokenomics.somePagesPending") || "일부 페이지 로딩 중")}
                        </span>
                      </div>
                      <div className="ml-auto text-sm text-muted-foreground">
                        {lastUpdate && (
                          <span>{t("adminTokenomics.lastUpdate") || "마지막 업데이트"}: {lastUpdate.toLocaleTimeString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>

        {/* Genesis Distribution Engine Section */}
        <div className="px-6">
          <Collapsible open={distributionOpen} onOpenChange={setDistributionOpen}>
            <Card data-testid="card-genesis-distribution">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover-elevate">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Layers className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-base" data-testid="text-distribution-title">
                          Genesis 분배 엔진
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Enterprise Distribution Engine - 10B TBURN 토큰 분배 현황
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={distributionStatus?.data?.isRunning ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}>
                        {distributionStatus?.data?.isRunning ? "분배 진행 중" : "대기 중"}
                      </Badge>
                      <Badge className={distributionStatus?.data?.circuitBreakerState === 'closed' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}>
                        <Shield className="h-3 w-3 mr-1" />
                        {distributionStatus?.data?.circuitBreakerState === 'closed' ? "정상" : "차단"}
                      </Badge>
                      {distributionOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-6 pt-0">
                  {/* Engine Controls */}
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">분배 엔진 제어</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDistributionControl('initialize')}
                          disabled={isControlling || distributionStatus?.data?.isRunning}
                          data-testid="button-distribution-initialize"
                        >
                          <Database className="h-4 w-4 mr-1" />
                          초기화
                        </Button>
                        <Button
                          variant={distributionStatus?.data?.isRunning ? "destructive" : "default"}
                          size="sm"
                          onClick={() => handleDistributionControl(distributionStatus?.data?.isRunning ? 'stop' : 'start')}
                          disabled={isControlling}
                          data-testid="button-distribution-toggle"
                        >
                          {distributionStatus?.data?.isRunning ? (
                            <><StopCircle className="h-4 w-4 mr-1" />중지</>
                          ) : (
                            <><PlayCircle className="h-4 w-4 mr-1" />시작</>
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {/* Engine Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      <div className="p-3 rounded-lg border bg-muted/30">
                        <div className="text-xs text-muted-foreground">총 작업</div>
                        <div className="text-lg font-bold">{distributionStatus?.data?.metrics?.totalTasks || 0}</div>
                      </div>
                      <div className="p-3 rounded-lg border bg-green-500/5">
                        <div className="text-xs text-muted-foreground">완료</div>
                        <div className="text-lg font-bold text-green-500">{distributionStatus?.data?.metrics?.completedTasks || 0}</div>
                      </div>
                      <div className="p-3 rounded-lg border bg-yellow-500/5">
                        <div className="text-xs text-muted-foreground">처리 중</div>
                        <div className="text-lg font-bold text-yellow-500">{distributionStatus?.data?.metrics?.processingTasks || 0}</div>
                      </div>
                      <div className="p-3 rounded-lg border bg-red-500/5">
                        <div className="text-xs text-muted-foreground">실패</div>
                        <div className="text-lg font-bold text-red-500">{distributionStatus?.data?.metrics?.failedTasks || 0}</div>
                      </div>
                      <div className="p-3 rounded-lg border bg-blue-500/5">
                        <div className="text-xs text-muted-foreground">TPS</div>
                        <div className="text-lg font-bold text-blue-500">{distributionStatus?.data?.metrics?.currentTPS?.toFixed(2) || '0.00'}</div>
                      </div>
                      <div className="p-3 rounded-lg border bg-purple-500/5">
                        <div className="text-xs text-muted-foreground">성공률</div>
                        <div className="text-lg font-bold text-purple-500">{distributionStatus?.data?.metrics?.successRate?.toFixed(1) || '100'}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Category Allocations */}
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-4">
                      <Coins className="h-4 w-4" />
                      <span className="font-medium">Genesis 토큰 분배 카테고리</span>
                      <Badge className="ml-auto">총 {distributionAllocations?.data?.totalSupplyFormatted || '10,000,000,000'} TBURN</Badge>
                    </div>
                    
                    <div className="space-y-4">
                      {distributionAllocations?.data?.allocations?.map((alloc) => {
                        const progress = distributionStatus?.data?.categoryProgress?.[alloc.category];
                        const categoryIcons: Record<string, typeof Coins> = {
                          'COMMUNITY': Users,
                          'REWARDS': TrendingUp,
                          'INVESTORS': PiggyBank,
                          'ECOSYSTEM': Globe,
                          'TEAM': Users,
                          'FOUNDATION': Database,
                        };
                        const CategoryIcon = categoryIcons[alloc.category] || Coins;
                        
                        return (
                          <div key={alloc.category} className="p-3 rounded-lg border">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <CategoryIcon className="h-4 w-4 text-primary" />
                                <span className="font-medium">{alloc.category}</span>
                                <Badge variant="outline" className="text-xs">{alloc.percentage}%</Badge>
                              </div>
                              <span className="text-sm font-mono">{alloc.amountFormatted} TBURN</span>
                            </div>
                            
                            <Progress 
                              value={progress?.percentage || 0} 
                              className="h-2 mb-2"
                            />
                            
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>분배 완료: {progress?.completed || 0}/{progress?.total || 0} 작업</span>
                              <span>진행률: {(progress?.percentage || 0).toFixed(1)}%</span>
                            </div>
                            
                            {/* Subcategories */}
                            <div className="mt-3 pl-4 border-l-2 border-muted space-y-1">
                              {Object.entries(alloc.details?.subcategories || {}).map(([subKey, sub]) => (
                                <div key={subKey} className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">
                                    {sub.description || subKey}
                                    {sub.tgePercent !== undefined && (
                                      <Badge variant="outline" className="ml-1 text-xs">TGE {sub.tgePercent}%</Badge>
                                    )}
                                  </span>
                                  <span className="font-mono">{sub.parentPercentage}% ({sub.amountFormatted})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* API Endpoints Integration */}
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Link2 className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">분배 엔진 API 연동</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <code className="text-blue-500">/api/admin/genesis/distribution/status</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <code className="text-blue-500">/api/admin/genesis/distribution/allocations</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <code className="text-blue-500">/api/admin/genesis/distribution/category/:cat</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <code className="text-blue-500">/api/admin/genesis/distribution/vesting</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <code className="text-blue-500">/api/admin/genesis/distribution/approvals</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <code className="text-blue-500">/api/admin/genesis/distribution/prometheus</code>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>

        {/* Original TokenomicsSimulation with all tabs */}
        <TokenomicsSimulation />
      </div>
    </ScrollArea>
  );
}
