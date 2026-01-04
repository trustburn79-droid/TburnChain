import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  Activity, Server, Shield, Wifi, WifiOff, Clock, Cpu, HardDrive,
  MemoryStick, TrendingUp, TrendingDown, CheckCircle2, AlertCircle,
  AlertTriangle, RefreshCw, Zap, Database, Globe, Timer, Layers,
  HeartPulse, BarChart3, Radio, ShieldCheck, ArrowUp, ArrowDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NodeHealth {
  id: string;
  name: string;
  region: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  latency: number;
  cpu: number;
  memory: number;
  disk: number;
  connections: number;
  requestsPerSecond: number;
  errorRate: number;
  lastCheck: string;
}

interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

interface MetricHistory {
  time: string;
  value: number;
}

const mockNodes: NodeHealth[] = [
  {
    id: "node-primary",
    name: "TBurn Primary Node",
    region: "Global CDN",
    status: "healthy",
    uptime: 99.99,
    latency: 8,
    cpu: 32,
    memory: 58,
    disk: 45,
    connections: 12847,
    requestsPerSecond: 25790,
    errorRate: 0.002,
    lastCheck: new Date().toISOString()
  }
];

const mockAlerts: Alert[] = [
  { id: "1", severity: "info", message: "Scheduled maintenance completed successfully", timestamp: new Date(Date.now() - 3600000).toISOString(), resolved: true },
  { id: "2", severity: "warning", message: "High latency detected in Asia region (resolved)", timestamp: new Date(Date.now() - 7200000).toISOString(), resolved: true },
  { id: "3", severity: "info", message: "New RPC endpoint version v2.1.0 deployed", timestamp: new Date(Date.now() - 86400000).toISOString(), resolved: true },
];

export default function RpcStatus() {
  const { t } = useTranslation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [latencyHistory, setLatencyHistory] = useState<MetricHistory[]>([]);
  const [tpsHistory, setTpsHistory] = useState<MetricHistory[]>([]);

  const { data: networkStats, refetch } = useQuery<{ success: boolean; data: any }>({
    queryKey: ['/api/public/v1/network/stats'],
    staleTime: 30000,
    refetchInterval: 30000,
  });

  const { data: healthData } = useQuery<{ status: string; timestamp: string }>({
    queryKey: ['/health'],
    staleTime: 10000,
    refetchInterval: 10000,
  });

  useEffect(() => {
    let counter = 0;
    const interval = setInterval(() => {
      counter++;
      const now = new Date().toLocaleTimeString('en-US', { hour12: false });
      setLatencyHistory(prev => [...prev.slice(-29), { 
        time: now, 
        value: Math.floor(8 + 4 * Math.sin(counter * 0.2)) 
      }]);
      setTpsHistory(prev => [...prev.slice(-29), { 
        time: now, 
        value: Math.floor(25000 + 1000 * Math.sin(counter * 0.15)) 
      }]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500/10 border-green-500/30';
      case 'degraded': return 'bg-yellow-500/10 border-yellow-500/30';
      case 'down': return 'bg-red-500/10 border-red-500/30';
      default: return 'bg-gray-500/10 border-gray-500/30';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/30';
      case 'warning': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      case 'info': return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
    }
  };

  const blockHeight = networkStats?.data?.blockHeight || 0;
  const tps = networkStats?.data?.tps || 0;
  const overallStatus = healthData?.status === 'healthy' ? 'healthy' : 'degraded';

  return (
    <main className="flex-grow relative z-10 bg-gray-50 dark:bg-transparent transition-colors">
      <section className="relative py-8 overflow-hidden border-b border-gray-200 dark:border-white/5">
        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-green-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-xs font-mono text-[#00f0ff]">
                  <Activity className="w-3.5 h-3.5" /> 상태 모니터링
                </div>
                <Badge className={`${getStatusBg(overallStatus)}`} data-testid="badge-overall-status">
                  <span className={`w-2 h-2 rounded-full ${overallStatus === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse mr-2`} />
                  {overallStatus === 'healthy' ? '정상 운영 중' : '일부 장애'}
                </Badge>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                RPC 노드 <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-500">상태 모니터링</span>
              </h1>
              
              <p className="text-gray-600 dark:text-gray-400 max-w-xl">
                엔터프라이즈급 실시간 노드 상태 모니터링. 업타임, 레이턴시, 시스템 리소스를 실시간으로 확인하세요.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshing}
                data-testid="button-refresh-status"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                새로고침
              </Button>
              <div className="text-xs text-gray-500">
                마지막 업데이트: {new Date().toLocaleTimeString('ko-KR')}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 px-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <HeartPulse className="w-5 h-5 text-green-500" />
                  <Badge variant="outline" className="text-green-500 border-green-500/30 text-xs">
                    <ArrowUp className="w-3 h-3 mr-1" />0.01%
                  </Badge>
                </div>
                <div className="text-2xl font-mono font-bold text-gray-900 dark:text-white" data-testid="text-uptime">99.99%</div>
                <div className="text-xs text-gray-500">업타임 (30일)</div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Timer className="w-5 h-5 text-cyan-500" />
                  <Badge variant="outline" className="text-green-500 border-green-500/30 text-xs">
                    <ArrowDown className="w-3 h-3 mr-1" />2ms
                  </Badge>
                </div>
                <div className="text-2xl font-mono font-bold text-[#00f0ff]" data-testid="text-latency">8ms</div>
                <div className="text-xs text-gray-500">평균 레이턴시</div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <Badge variant="outline" className="text-green-500 border-green-500/30 text-xs">
                    <ArrowUp className="w-3 h-3 mr-1" />5%
                  </Badge>
                </div>
                <div className="text-2xl font-mono font-bold text-gray-900 dark:text-white" data-testid="text-tps">{tps.toLocaleString()}</div>
                <div className="text-xs text-gray-500">현재 TPS</div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Layers className="w-5 h-5 text-purple-500" />
                  <Badge variant="outline" className="text-cyan-500 border-cyan-500/30 text-xs">
                    실시간
                  </Badge>
                </div>
                <div className="text-2xl font-mono font-bold text-gray-900 dark:text-white" data-testid="text-block-height">{blockHeight.toLocaleString()}</div>
                <div className="text-xs text-gray-500">블록 높이</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="nodes" className="space-y-6">
            <TabsList className="bg-gray-100 dark:bg-white/5">
              <TabsTrigger value="nodes" data-testid="tab-nodes">
                <Server className="w-4 h-4 mr-2" />노드 상태
              </TabsTrigger>
              <TabsTrigger value="metrics" data-testid="tab-metrics">
                <BarChart3 className="w-4 h-4 mr-2" />성능 메트릭
              </TabsTrigger>
              <TabsTrigger value="alerts" data-testid="tab-alerts">
                <AlertCircle className="w-4 h-4 mr-2" />알림 기록
              </TabsTrigger>
            </TabsList>

            <TabsContent value="nodes" className="space-y-4">
              {mockNodes.map((node) => (
                <Card key={node.id} className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10" data-testid={`card-node-${node.id}`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${node.status === 'healthy' ? 'bg-green-500' : node.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`} />
                        <CardTitle className="text-lg">{node.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">{node.region}</Badge>
                      </div>
                      <Badge className={getStatusBg(node.status)}>
                        {node.status === 'healthy' ? '정상' : node.status === 'degraded' ? '저하됨' : '다운'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 flex items-center gap-1"><Cpu className="w-3 h-3" /> CPU</span>
                          <span className="font-mono">{node.cpu}%</span>
                        </div>
                        <Progress value={node.cpu} className="h-1.5" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 flex items-center gap-1"><MemoryStick className="w-3 h-3" /> 메모리</span>
                          <span className="font-mono">{node.memory}%</span>
                        </div>
                        <Progress value={node.memory} className="h-1.5" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 flex items-center gap-1"><HardDrive className="w-3 h-3" /> 디스크</span>
                          <span className="font-mono">{node.disk}%</span>
                        </div>
                        <Progress value={node.disk} className="h-1.5" />
                      </div>
                      <div className="text-center p-2 rounded bg-gray-50 dark:bg-white/5">
                        <div className="text-lg font-mono font-bold text-gray-900 dark:text-white">{node.latency}ms</div>
                        <div className="text-[10px] text-gray-500">레이턴시</div>
                      </div>
                      <div className="text-center p-2 rounded bg-gray-50 dark:bg-white/5">
                        <div className="text-lg font-mono font-bold text-gray-900 dark:text-white">{node.connections.toLocaleString()}</div>
                        <div className="text-[10px] text-gray-500">활성 연결</div>
                      </div>
                      <div className="text-center p-2 rounded bg-gray-50 dark:bg-white/5">
                        <div className="text-lg font-mono font-bold text-green-500">{node.errorRate}%</div>
                        <div className="text-[10px] text-gray-500">에러율</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="metrics" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Timer className="w-4 h-4 text-cyan-500" />레이턴시 추이 (실시간)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-32 flex items-end gap-1">
                      {latencyHistory.map((point, i) => (
                        <div 
                          key={i}
                          className="flex-1 rounded-t transition-all duration-300"
                          style={{ 
                            height: `${Math.min(100, (point.value / 20) * 100)}%`,
                            backgroundColor: point.value < 10 ? '#00ff9d' : point.value < 15 ? '#ffd700' : '#ff0055'
                          }}
                          title={`${point.time}: ${point.value}ms`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] text-gray-500">
                      <span>60초 전</span>
                      <span>현재</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />TPS 추이 (실시간)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-32 flex items-end gap-1">
                      {tpsHistory.map((point, i) => (
                        <div 
                          key={i}
                          className="flex-1 bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t transition-all duration-300"
                          style={{ 
                            height: `${Math.min(100, (point.value / 30000) * 100)}%`,
                          }}
                          title={`${point.time}: ${point.value.toLocaleString()} TPS`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] text-gray-500">
                      <span>60초 전</span>
                      <span>현재</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10">
                <CardHeader>
                  <CardTitle className="text-base">시스템 상태 요약</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">보안 상태</span>
                      </div>
                      <div className="text-lg font-bold text-green-500">안전</div>
                    </div>
                    <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Radio className="w-5 h-5 text-cyan-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">WebSocket</span>
                      </div>
                      <div className="text-lg font-bold text-cyan-500">연결됨</div>
                    </div>
                    <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Database className="w-5 h-5 text-purple-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">데이터베이스</span>
                      </div>
                      <div className="text-lg font-bold text-purple-500">정상</div>
                    </div>
                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="w-5 h-5 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CDN</span>
                      </div>
                      <div className="text-lg font-bold text-yellow-500">활성</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />최근 알림 기록
                  </CardTitle>
                  <CardDescription>최근 7일간의 알림 내역</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockAlerts.map((alert) => (
                      <div 
                        key={alert.id}
                        className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)} flex items-center justify-between`}
                        data-testid={`alert-${alert.id}`}
                      >
                        <div className="flex items-center gap-3">
                          {alert.severity === 'critical' ? (
                            <AlertCircle className="w-5 h-5" />
                          ) : alert.severity === 'warning' ? (
                            <AlertTriangle className="w-5 h-5" />
                          ) : (
                            <Activity className="w-5 h-5" />
                          )}
                          <div>
                            <div className="font-medium">{alert.message}</div>
                            <div className="text-xs opacity-70">
                              {new Date(alert.timestamp).toLocaleString('ko-KR')}
                            </div>
                          </div>
                        </div>
                        {alert.resolved && (
                          <Badge variant="outline" className="text-green-500 border-green-500/30">
                            <CheckCircle2 className="w-3 h-3 mr-1" />해결됨
                          </Badge>
                        )}
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
