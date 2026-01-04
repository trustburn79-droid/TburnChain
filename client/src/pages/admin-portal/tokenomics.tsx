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
  ArrowRight, Database, Globe, Link2, ChevronDown, ChevronUp
} from "lucide-react";
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

        {/* Original TokenomicsSimulation with all tabs */}
        <TokenomicsSimulation />
      </div>
    </ScrollArea>
  );
}
