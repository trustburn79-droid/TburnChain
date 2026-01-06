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
    staleTime: 5000, // ★ REALTIME: Match RealtimeMetricsService poll interval
    refetchInterval: 5000,
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy': return t('rpc.shared.healthy');
      case 'degraded': return t('rpc.shared.degraded');
      case 'down': return t('rpc.shared.down');
      default: return t('rpc.shared.unknown');
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
                  <Activity className="w-3.5 h-3.5" /> {t('rpc.status.badge')}
                </div>
                <Badge className={`${getStatusBg(overallStatus)}`} data-testid="badge-overall-status">
                  <span className={`w-2 h-2 rounded-full ${overallStatus === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse mr-2`} />
                  {overallStatus === 'healthy' ? t('rpc.shared.healthy') : t('rpc.shared.degraded')}
                </Badge>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                {t('rpc.status.heroTitle')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-500">{t('rpc.status.heroHighlight')}</span>
              </h1>
              
              <p className="text-gray-600 dark:text-gray-400 max-w-xl">
                {t('rpc.status.heroDesc')}
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
                {t('rpc.shared.refresh')}
              </Button>
              <div className="text-xs text-gray-500">
                {t('common.lastUpdate')}: {new Date().toLocaleTimeString()}
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
                <div className="text-xs text-gray-500">{t('rpc.status.uptime')} ({t('rpc.shared.last30Days')})</div>
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
                <div className="text-xs text-gray-500">{t('rpc.status.avgLatency')}</div>
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
                <div className="text-xs text-gray-500">{t('rpc.status.networkTps')}</div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Layers className="w-5 h-5 text-purple-500" />
                  <Badge variant="outline" className="text-cyan-500 border-cyan-500/30 text-xs">
                    {t('common.realtime')}
                  </Badge>
                </div>
                <div className="text-2xl font-mono font-bold text-gray-900 dark:text-white" data-testid="text-block-height">{blockHeight.toLocaleString()}</div>
                <div className="text-xs text-gray-500">{t('rpc.status.blockHeight')}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="nodes" className="space-y-6">
            <TabsList className="bg-gray-100 dark:bg-white/5">
              <TabsTrigger value="nodes" data-testid="tab-nodes">
                <Server className="w-4 h-4 mr-2" />{t('rpc.status.tabNodes')}
              </TabsTrigger>
              <TabsTrigger value="metrics" data-testid="tab-metrics">
                <BarChart3 className="w-4 h-4 mr-2" />{t('rpc.status.tabMetrics')}
              </TabsTrigger>
              <TabsTrigger value="alerts" data-testid="tab-alerts">
                <AlertCircle className="w-4 h-4 mr-2" />{t('rpc.status.tabAlerts')}
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
                        {getStatusText(node.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 flex items-center gap-1"><Cpu className="w-3 h-3" /> {t('rpc.status.cpu')}</span>
                          <span className="font-mono">{node.cpu}%</span>
                        </div>
                        <Progress value={node.cpu} className="h-1.5" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 flex items-center gap-1"><MemoryStick className="w-3 h-3" /> {t('rpc.status.memory')}</span>
                          <span className="font-mono">{node.memory}%</span>
                        </div>
                        <Progress value={node.memory} className="h-1.5" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 flex items-center gap-1"><HardDrive className="w-3 h-3" /> {t('rpc.status.disk')}</span>
                          <span className="font-mono">{node.disk}%</span>
                        </div>
                        <Progress value={node.disk} className="h-1.5" />
                      </div>
                      <div className="text-center p-2 rounded bg-gray-50 dark:bg-white/5">
                        <div className="text-lg font-mono font-bold text-gray-900 dark:text-white">{node.latency}ms</div>
                        <div className="text-[10px] text-gray-500">{t('rpc.status.latency')}</div>
                      </div>
                      <div className="text-center p-2 rounded bg-gray-50 dark:bg-white/5">
                        <div className="text-lg font-mono font-bold text-gray-900 dark:text-white">{node.connections.toLocaleString()}</div>
                        <div className="text-[10px] text-gray-500">{t('rpc.status.connections')}</div>
                      </div>
                      <div className="text-center p-2 rounded bg-gray-50 dark:bg-white/5">
                        <div className="text-lg font-mono font-bold text-green-500">{node.errorRate}%</div>
                        <div className="text-[10px] text-gray-500">{t('common.error')} %</div>
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
                      <Timer className="w-4 h-4 text-cyan-500" />{t('rpc.status.liveLatency')}
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
                      <span>60s ago</span>
                      <span>{t('rpc.status.current')}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />TPS {t('rpc.status.liveLatency')}
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
                      <span>60s ago</span>
                      <span>{t('rpc.status.current')}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10">
                <CardHeader>
                  <CardTitle className="text-base">{t('rpc.status.performanceMetrics')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('common.security')}</span>
                      </div>
                      <div className="text-lg font-bold text-green-500">{t('rpc.shared.healthy')}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Radio className="w-5 h-5 text-cyan-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">WebSocket</span>
                      </div>
                      <div className="text-lg font-bold text-cyan-500">{t('common.connected')}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Database className="w-5 h-5 text-purple-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Database</span>
                      </div>
                      <div className="text-lg font-bold text-purple-500">{t('rpc.shared.healthy')}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="w-5 h-5 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CDN</span>
                      </div>
                      <div className="text-lg font-bold text-yellow-500">{t('common.active')}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />{t('rpc.status.alertHistory')}
                  </CardTitle>
                  <CardDescription>{t('rpc.shared.last30Days')}</CardDescription>
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
                              {new Date(alert.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        {alert.resolved && (
                          <Badge variant="outline" className="text-green-500 border-green-500/30">
                            <CheckCircle2 className="w-3 h-3 mr-1" />{t('common.resolved')}
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
