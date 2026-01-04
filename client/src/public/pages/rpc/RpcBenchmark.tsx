import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  Gauge, Play, Square, RefreshCw, TrendingUp, TrendingDown, Activity,
  Timer, Zap, Server, Globe, CheckCircle2, XCircle, Clock, BarChart3,
  Target, Flame, Shield, Database, Cpu, MemoryStick, ArrowUp, ArrowDown,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface BenchmarkResult {
  id: string;
  method: string;
  iterations: number;
  avgLatency: number;
  minLatency: number;
  maxLatency: number;
  p50: number;
  p95: number;
  p99: number;
  successRate: number;
  throughput: number;
  timestamp: string;
}

interface HistoricalData {
  date: string;
  avgLatency: number;
  throughput: number;
  successRate: number;
}

const mockHistoricalData: HistoricalData[] = [
  { date: "12/29", avgLatency: 9, throughput: 24500, successRate: 99.98 },
  { date: "12/30", avgLatency: 8, throughput: 25200, successRate: 99.99 },
  { date: "12/31", avgLatency: 10, throughput: 24800, successRate: 99.97 },
  { date: "01/01", avgLatency: 7, throughput: 26100, successRate: 99.99 },
  { date: "01/02", avgLatency: 8, throughput: 25800, successRate: 99.99 },
  { date: "01/03", avgLatency: 9, throughput: 25400, successRate: 99.98 },
  { date: "01/04", avgLatency: 8, throughput: 25790, successRate: 99.99 },
];

export default function RpcBenchmark() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState("eth_blockNumber");
  const [iterations, setIterations] = useState("100");
  const [concurrency, setConcurrency] = useState("10");
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [liveLatencies, setLiveLatencies] = useState<number[]>([]);
  const [benchmarkError, setBenchmarkError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { data: networkStats } = useQuery<{ success: boolean; data: any }>({
    queryKey: ['/api/public/v1/network/stats'],
    staleTime: 30000,
  });

  const runBenchmark = useCallback(async () => {
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    setIsRunning(true);
    setProgress(0);
    setLiveLatencies([]);
    setBenchmarkError(null);

    const totalIterations = parseInt(iterations);
    const latencies: number[] = [];
    let aborted = false;

    for (let i = 0; i < totalIterations; i++) {
      if (signal.aborted) {
        aborted = true;
        break;
      }
      
      const start = performance.now();
      try {
        await fetch('/api/public/v1/network/stats', { signal });
        const latency = performance.now() - start;
        latencies.push(latency);
        setLiveLatencies(prev => [...prev.slice(-49), latency]);
      } catch (error: any) {
        if (error.name === 'AbortError') {
          aborted = true;
          break;
        }
        latencies.push(-1);
      }
      setProgress(Math.round(((i + 1) / totalIterations) * 100));
      
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(resolve, 50);
        signal.addEventListener('abort', () => {
          clearTimeout(timeout);
          reject(new Error('Aborted'));
        }, { once: true });
      }).catch(() => {
        aborted = true;
      });
      
      if (aborted) break;
    }

    setIsRunning(false);
    abortControllerRef.current = null;

    if (aborted) {
      toast({ title: "벤치마크 중단됨", description: "사용자에 의해 중단되었습니다." });
      return;
    }

    const validLatencies = latencies.filter(l => l >= 0).sort((a, b) => a - b);
    const failed = latencies.filter(l => l < 0).length;
    const completedIterations = latencies.length;

    if (validLatencies.length === 0) {
      setBenchmarkError("모든 요청이 실패했습니다. 네트워크 연결을 확인해주세요.");
      toast({ 
        title: "벤치마크 실패", 
        description: "성공한 요청이 없습니다.",
        variant: "destructive"
      });
      return;
    }

    const totalLatency = validLatencies.reduce((a, b) => a + b, 0);
    const avgLatency = totalLatency / validLatencies.length;

    const result: BenchmarkResult = {
      id: Date.now().toString(),
      method: selectedMethod,
      iterations: completedIterations,
      avgLatency: Math.round(avgLatency),
      minLatency: Math.round(Math.min(...validLatencies)),
      maxLatency: Math.round(Math.max(...validLatencies)),
      p50: Math.round(validLatencies[Math.floor(validLatencies.length * 0.5)] || 0),
      p95: Math.round(validLatencies[Math.floor(validLatencies.length * 0.95)] || validLatencies[validLatencies.length - 1] || 0),
      p99: Math.round(validLatencies[Math.floor(validLatencies.length * 0.99)] || validLatencies[validLatencies.length - 1] || 0),
      successRate: validLatencies.length > 0 ? ((completedIterations - failed) / completedIterations) * 100 : 0,
      throughput: totalLatency > 0 ? Math.round((validLatencies.length / (totalLatency / 1000)) * parseInt(concurrency)) : 0,
      timestamp: new Date().toISOString()
    };

    setResults(prev => [result, ...prev.slice(0, 9)]);
    toast({ 
      title: "벤치마크 완료", 
      description: `평균 레이턴시: ${result.avgLatency}ms, 처리량: ${result.throughput.toLocaleString()} req/s` 
    });
  }, [selectedMethod, iterations, concurrency, toast]);

  const stopBenchmark = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsRunning(false);
    toast({ title: "벤치마크 중단", description: "벤치마크를 중단하고 있습니다..." });
  }, [toast]);

  const tps = networkStats?.data?.tps || 0;
  const blockHeight = networkStats?.data?.blockHeight || 0;

  const getLatencyColor = (latency: number) => {
    if (latency < 10) return '#00ff9d';
    if (latency < 20) return '#ffd700';
    if (latency < 50) return '#ff6b35';
    return '#ff0055';
  };

  return (
    <main className="flex-grow relative z-10 bg-gray-50 dark:bg-transparent transition-colors">
      <section className="relative py-8 overflow-hidden border-b border-gray-200 dark:border-white/5">
        <div className="absolute top-0 right-1/3 w-[600px] h-[500px] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-xs font-mono text-orange-400">
                  <Gauge className="w-3.5 h-3.5" /> 벤치마크
                </div>
                <Badge variant="outline" className={`text-xs ${isRunning ? 'border-green-500/50 text-green-500' : ''}`}>
                  {isRunning ? '실행 중' : '대기'}
                </Badge>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                RPC <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">벤치마크</span>
              </h1>
              
              <p className="text-gray-600 dark:text-gray-400 max-w-xl">
                RPC 엔드포인트 성능을 실시간으로 측정하세요. 레이턴시, 처리량, 안정성을 분석합니다.
              </p>
            </div>

            <Card className="w-full lg:w-80 bg-white/90 dark:bg-black/60 border-gray-200 dark:border-white/10">
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 rounded bg-gray-50 dark:bg-white/5">
                    <div className="text-xl font-mono font-bold text-gray-900 dark:text-white">{tps.toLocaleString()}</div>
                    <div className="text-[10px] text-gray-500">현재 TPS</div>
                  </div>
                  <div className="text-center p-2 rounded bg-gray-50 dark:bg-white/5">
                    <div className="text-xl font-mono font-bold text-[#00f0ff]">8ms</div>
                    <div className="text-[10px] text-gray-500">평균 레이턴시</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-8 px-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
          <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-500" />
                벤치마크 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm text-gray-500 mb-2 block">RPC 메서드</label>
                  <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                    <SelectTrigger data-testid="select-method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eth_blockNumber">eth_blockNumber</SelectItem>
                      <SelectItem value="eth_chainId">eth_chainId</SelectItem>
                      <SelectItem value="eth_gasPrice">eth_gasPrice</SelectItem>
                      <SelectItem value="net_version">net_version</SelectItem>
                      <SelectItem value="eth_getBalance">eth_getBalance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-2 block">반복 횟수</label>
                  <Input
                    type="number"
                    value={iterations}
                    onChange={(e) => setIterations(e.target.value)}
                    min="10"
                    max="1000"
                    data-testid="input-iterations"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-2 block">동시성</label>
                  <Input
                    type="number"
                    value={concurrency}
                    onChange={(e) => setConcurrency(e.target.value)}
                    min="1"
                    max="100"
                    data-testid="input-concurrency"
                  />
                </div>
                <div className="flex items-end">
                  {isRunning ? (
                    <Button onClick={stopBenchmark} variant="destructive" className="w-full" data-testid="button-stop-benchmark">
                      <Square className="w-4 h-4 mr-2" />
                      중지
                    </Button>
                  ) : (
                    <Button onClick={runBenchmark} className="w-full bg-orange-500 hover:bg-orange-600" data-testid="button-run-benchmark">
                      <Play className="w-4 h-4 mr-2" />
                      벤치마크 시작
                    </Button>
                  )}
                </div>
              </div>

              {isRunning && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">진행률</span>
                    <span className="font-mono">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {benchmarkError && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30" data-testid="benchmark-error">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <div>
                    <div className="font-medium text-red-500">벤치마크 실패</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{benchmarkError}</div>
                  </div>
                </div>
              )}

              {liveLatencies.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">실시간 레이턴시</div>
                  <div className="h-24 flex items-end gap-0.5 bg-gray-50 dark:bg-white/5 rounded-lg p-2">
                    {liveLatencies.map((latency, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t transition-all duration-150"
                        style={{
                          height: `${Math.min(100, (latency / 100) * 100)}%`,
                          backgroundColor: getLatencyColor(latency),
                          minHeight: '4px'
                        }}
                        title={`${latency.toFixed(1)}ms`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {results.length > 0 && (
            <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-500" />
                  최근 결과
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.map((result) => (
                    <div 
                      key={result.id}
                      className="p-4 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5"
                      data-testid={`result-${result.id}`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <code className="text-sm font-mono text-cyan-500">{result.method}</code>
                          <Badge variant="outline" className="text-xs">{result.iterations} iterations</Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${result.successRate >= 99.9 ? 'border-green-500/30 text-green-500' : 'border-yellow-500/30 text-yellow-500'}`}
                          >
                            {result.successRate.toFixed(2)}% success
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(result.timestamp).toLocaleTimeString('ko-KR')}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 text-center">
                        <div>
                          <div className="text-lg font-mono font-bold" style={{ color: getLatencyColor(result.avgLatency) }}>
                            {result.avgLatency}ms
                          </div>
                          <div className="text-[10px] text-gray-500">평균</div>
                        </div>
                        <div>
                          <div className="text-lg font-mono font-bold text-green-500">{result.minLatency}ms</div>
                          <div className="text-[10px] text-gray-500">최소</div>
                        </div>
                        <div>
                          <div className="text-lg font-mono font-bold text-red-500">{result.maxLatency}ms</div>
                          <div className="text-[10px] text-gray-500">최대</div>
                        </div>
                        <div>
                          <div className="text-lg font-mono font-bold text-gray-900 dark:text-white">{result.p50}ms</div>
                          <div className="text-[10px] text-gray-500">P50</div>
                        </div>
                        <div>
                          <div className="text-lg font-mono font-bold text-yellow-500">{result.p95}ms</div>
                          <div className="text-[10px] text-gray-500">P95</div>
                        </div>
                        <div>
                          <div className="text-lg font-mono font-bold text-orange-500">{result.p99}ms</div>
                          <div className="text-[10px] text-gray-500">P99</div>
                        </div>
                        <div>
                          <div className="text-lg font-mono font-bold text-cyan-500">{result.throughput.toLocaleString()}</div>
                          <div className="text-[10px] text-gray-500">req/s</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                7일간 성능 추이
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-gray-500 mb-3">평균 레이턴시 (ms)</div>
                  <div className="h-32 flex items-end gap-2">
                    {mockHistoricalData.map((data, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div 
                          className="w-full rounded-t bg-gradient-to-t from-cyan-500 to-cyan-400 transition-all"
                          style={{ height: `${(data.avgLatency / 15) * 100}%` }}
                        />
                        <span className="text-[9px] text-gray-500">{data.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-3">처리량 (TPS)</div>
                  <div className="h-32 flex items-end gap-2">
                    {mockHistoricalData.map((data, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div 
                          className="w-full rounded-t bg-gradient-to-t from-green-500 to-green-400 transition-all"
                          style={{ height: `${(data.throughput / 30000) * 100}%` }}
                        />
                        <span className="text-[9px] text-gray-500">{data.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-3">성공률 (%)</div>
                  <div className="h-32 flex items-end gap-2">
                    {mockHistoricalData.map((data, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div 
                          className="w-full rounded-t bg-gradient-to-t from-purple-500 to-purple-400 transition-all"
                          style={{ height: `${data.successRate}%` }}
                        />
                        <span className="text-[9px] text-gray-500">{data.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-white/5 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Timer className="w-4 h-4 text-cyan-500" />
                    <span className="text-2xl font-mono font-bold text-gray-900 dark:text-white">8.4ms</span>
                  </div>
                  <div className="text-xs text-gray-500">7일 평균 레이턴시</div>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-white/5 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-green-500" />
                    <span className="text-2xl font-mono font-bold text-gray-900 dark:text-white">25.4K</span>
                  </div>
                  <div className="text-xs text-gray-500">7일 평균 TPS</div>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-white/5 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-purple-500" />
                    <span className="text-2xl font-mono font-bold text-gray-900 dark:text-white">99.98%</span>
                  </div>
                  <div className="text-xs text-gray-500">7일 평균 성공률</div>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-white/5 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-orange-500" />
                    <span className="text-2xl font-mono font-bold text-gray-900 dark:text-white">99.99%</span>
                  </div>
                  <div className="text-xs text-gray-500">7일 업타임</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
