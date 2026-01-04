import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  Activity, Server, Wifi, Clock, Zap, Shield, AlertTriangle, CheckCircle2,
  XCircle, RefreshCw, TrendingUp, TrendingDown, Cpu, MemoryStick, HardDrive,
  Globe, Timer, ArrowUpRight, ArrowDownRight, Loader2, Bell, AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface NodeStatus {
  id: string;
  name: string;
  region: string;
  status: 'healthy' | 'degraded' | 'down';
  latency: number;
  uptime: number;
  cpu: number;
  memory: number;
  disk: number;
  connections: number;
  lastBlock: number;
}

interface Alert {
  id: string;
  level: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

const mockNodes: NodeStatus[] = [
  { id: '1', name: 'testnet-node-1', region: 'Seoul', status: 'healthy', latency: 12, uptime: 99.95, cpu: 28, memory: 42, disk: 35, connections: 156, lastBlock: 8542109 },
  { id: '2', name: 'testnet-node-2', region: 'Tokyo', status: 'healthy', latency: 15, uptime: 99.92, cpu: 32, memory: 48, disk: 38, connections: 142, lastBlock: 8542109 },
  { id: '3', name: 'testnet-node-3', region: 'Singapore', status: 'degraded', latency: 28, uptime: 99.85, cpu: 65, memory: 72, disk: 55, connections: 198, lastBlock: 8542108 },
  { id: '4', name: 'testnet-node-4', region: 'Frankfurt', status: 'healthy', latency: 45, uptime: 99.98, cpu: 22, memory: 38, disk: 42, connections: 124, lastBlock: 8542109 },
];

const mockAlerts: Alert[] = [
  { id: '1', level: 'info', message: '테스트넷 노드 3 연결 수 증가 (198)', timestamp: '2026-01-04T21:30:00Z', resolved: false },
  { id: '2', level: 'warning', message: '테스트넷 노드 3 메모리 사용량 높음 (72%)', timestamp: '2026-01-04T21:15:00Z', resolved: false },
  { id: '3', level: 'info', message: '테스트넷 정기 점검 완료', timestamp: '2026-01-04T20:00:00Z', resolved: true },
  { id: '4', level: 'critical', message: '테스트넷 노드 동기화 지연 해소', timestamp: '2026-01-04T18:45:00Z', resolved: true },
];

export default function TestnetRpcStatus() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [liveLatency, setLiveLatency] = useState<number[]>([12, 14, 11, 15, 13, 12, 16, 14, 13, 15]);

  const { data: networkStats, refetch } = useQuery<{ success: boolean; data: any }>({
    queryKey: ['/api/public/v1/testnet/stats'],
    staleTime: 30000,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveLatency(prev => [...prev.slice(1), Math.floor(Math.random() * 10) + 10]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => {
      setIsRefreshing(false);
      toast({ title: "새로고침 완료", description: "테스트넷 상태가 업데이트되었습니다." });
    }, 500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy': return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">정상</Badge>;
      case 'degraded': return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">저하</Badge>;
      case 'down': return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">중단</Badge>;
      default: return <Badge variant="outline">알 수 없음</Badge>;
    }
  };

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'critical': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <AlertCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const tps = networkStats?.data?.tps || 15000;
  const blockHeight = networkStats?.data?.blockHeight || 8542109;
  const healthyNodes = mockNodes.filter(n => n.status === 'healthy').length;
  const avgLatency = Math.round(mockNodes.reduce((a, n) => a + n.latency, 0) / mockNodes.length);

  return (
    <main className="flex-grow relative z-10 bg-gray-50 dark:bg-transparent transition-colors">
      <section className="relative py-8 overflow-hidden border-b border-gray-200 dark:border-white/5">
        <div className="absolute top-0 left-1/4 w-[600px] h-[500px] bg-yellow-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-xs font-mono text-yellow-500">
                  <Activity className="w-3.5 h-3.5" /> 테스트넷 상태
                </div>
                <Badge data-testid="badge-testnet-overall-status" className={`text-xs ${healthyNodes === mockNodes.length ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                  {healthyNodes === mockNodes.length ? '모든 노드 정상' : `${healthyNodes}/${mockNodes.length} 정상`}
                </Badge>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                테스트넷 RPC <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">상태 모니터링</span>
              </h1>
              
              <p className="text-gray-600 dark:text-gray-400 max-w-xl">
                TBURN 테스트넷 RPC 노드의 실시간 상태, 성능 메트릭, 알림 내역을 모니터링합니다.
              </p>
            </div>

            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              data-testid="button-testnet-refresh-status"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? '새로고침 중...' : '새로고침'}
            </Button>
          </div>
        </div>
      </section>

      <section className="py-8 px-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">업타임</p>
                    <p className="text-2xl font-mono font-bold text-green-500" data-testid="text-testnet-uptime">99.95%</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-500/10">
                    <Shield className="w-6 h-6 text-green-500" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">지난 30일 기준</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">평균 레이턴시</p>
                    <p className="text-2xl font-mono font-bold text-yellow-500" data-testid="text-testnet-latency">{avgLatency}ms</p>
                  </div>
                  <div className="p-3 rounded-full bg-yellow-500/10">
                    <Timer className="w-6 h-6 text-yellow-500" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">글로벌 평균</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">테스트넷 TPS</p>
                    <p className="text-2xl font-mono font-bold text-orange-500" data-testid="text-testnet-tps">{tps.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-full bg-orange-500/10">
                    <Zap className="w-6 h-6 text-orange-500" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">초당 트랜잭션</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">블록 높이</p>
                    <p className="text-2xl font-mono font-bold text-gray-900 dark:text-white" data-testid="text-testnet-block-height">{blockHeight.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-full bg-gray-500/10">
                    <Globe className="w-6 h-6 text-gray-500" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">최신 블록</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-yellow-500" />
                실시간 레이턴시 (테스트넷)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32 flex items-end gap-1">
                {liveLatency.map((latency, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t transition-all duration-300"
                    style={{
                      height: `${(latency / 30) * 100}%`,
                      backgroundColor: latency < 15 ? '#00ff9d' : latency < 25 ? '#ffd700' : '#ff6b35',
                      opacity: 0.5 + (i / liveLatency.length) * 0.5
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>20초 전</span>
                <span>현재: {liveLatency[liveLatency.length - 1]}ms</span>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="nodes" className="space-y-4">
            <TabsList>
              <TabsTrigger value="nodes" data-testid="tab-testnet-nodes">노드 상태</TabsTrigger>
              <TabsTrigger value="metrics" data-testid="tab-testnet-metrics">성능 메트릭</TabsTrigger>
              <TabsTrigger value="alerts" data-testid="tab-testnet-alerts">알림 기록</TabsTrigger>
            </TabsList>

            <TabsContent value="nodes">
              <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10">
                <CardHeader>
                  <CardTitle>테스트넷 노드 상태</CardTitle>
                  <CardDescription>{mockNodes.length}개 테스트넷 노드 운영 중</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockNodes.map(node => (
                      <div key={node.id} className="p-4 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Server className={`w-5 h-5 ${getStatusColor(node.status)}`} />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{node.name}</p>
                              <p className="text-xs text-gray-500">{node.region}</p>
                            </div>
                          </div>
                          {getStatusBadge(node.status)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">레이턴시</p>
                            <p className="font-mono font-medium">{node.latency}ms</p>
                          </div>
                          <div>
                            <p className="text-gray-500">CPU</p>
                            <div className="flex items-center gap-2">
                              <Progress value={node.cpu} className="h-2 flex-1" />
                              <span className="font-mono text-xs">{node.cpu}%</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-500">메모리</p>
                            <div className="flex items-center gap-2">
                              <Progress value={node.memory} className="h-2 flex-1" />
                              <span className="font-mono text-xs">{node.memory}%</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-500">연결</p>
                            <p className="font-mono font-medium">{node.connections}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metrics">
              <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10">
                <CardHeader>
                  <CardTitle>테스트넷 성능 메트릭</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-yellow-500" /> CPU 사용량
                      </h4>
                      {mockNodes.map(node => (
                        <div key={node.id} className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-24 truncate">{node.name}</span>
                          <Progress value={node.cpu} className="flex-1 h-2" />
                          <span className="text-xs font-mono w-10 text-right">{node.cpu}%</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <MemoryStick className="w-4 h-4 text-orange-500" /> 메모리 사용량
                      </h4>
                      {mockNodes.map(node => (
                        <div key={node.id} className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-24 truncate">{node.name}</span>
                          <Progress value={node.memory} className="flex-1 h-2" />
                          <span className="text-xs font-mono w-10 text-right">{node.memory}%</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-purple-500" /> 디스크 사용량
                      </h4>
                      {mockNodes.map(node => (
                        <div key={node.id} className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-24 truncate">{node.name}</span>
                          <Progress value={node.disk} className="flex-1 h-2" />
                          <span className="text-xs font-mono w-10 text-right">{node.disk}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts">
              <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    테스트넷 알림 기록
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockAlerts.map(alert => (
                      <div 
                        key={alert.id} 
                        className={`p-4 rounded-lg border ${alert.resolved ? 'opacity-60' : ''} ${
                          alert.level === 'critical' ? 'border-red-500/30 bg-red-500/5' :
                          alert.level === 'warning' ? 'border-yellow-500/30 bg-yellow-500/5' :
                          'border-blue-500/30 bg-blue-500/5'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {getAlertIcon(alert.level)}
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{alert.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(alert.timestamp).toLocaleString('ko-KR')}
                              </p>
                            </div>
                          </div>
                          {alert.resolved && (
                            <Badge variant="outline" className="text-xs text-green-500 border-green-500/30">
                              해결됨
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </main>
  );
}
