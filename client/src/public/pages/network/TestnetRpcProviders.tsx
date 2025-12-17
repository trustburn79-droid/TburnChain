import { 
  Server, Shield, Network, Zap, Book, 
  Copy, Check, Terminal, Globe, Activity, 
  RefreshCw, ExternalLink, 
  CheckCircle2, AlertCircle, Play, Settings, Code2, 
  ArrowRight, Layers, Timer, ShieldCheck, Radio,
  GitBranch, Users, Sparkles, Rocket, Beaker, Gift
} from "lucide-react";
import { SiTypescript, SiPython } from "react-icons/si";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface RpcNode {
  id: string;
  name: string;
  url: string;
  region: string;
  status: 'online' | 'degraded' | 'offline';
  latency: number;
  blockHeight: number;
  version: string;
  load: number;
  uptime: number;
  requests24h: number;
  peakTps: number;
}

interface LatencyPoint {
  time: string;
  latency: number;
}

const testnetConfig = {
  name: "TBurn Testnet", 
  chainId: 7778,
  symbol: "tTBURN",
  rpcUrl: "https://tburn.io/testnet-rpc",
  wsUrl: "wss://tburn.io/testnet-ws",
  explorerUrl: "https://tburn.io/testnet-scan",
  color: "#ffd700"
};

const testnetNodes: RpcNode[] = [
  { id: "testnet-1", name: "Testnet Primary", url: "https://tburn.io/testnet-rpc", region: "US-East (Virginia)", status: "online", latency: 12, blockHeight: 5847293, version: "2.1.0-beta", load: 25, uptime: 99.95, requests24h: 12847293, peakTps: 35000 },
  { id: "testnet-2", name: "Testnet Europe", url: "https://eu.testnet.tburn.io/rpc", region: "EU-West (Frankfurt)", status: "online", latency: 22, blockHeight: 5847293, version: "2.1.0-beta", load: 18, uptime: 99.92, requests24h: 8523847, peakTps: 28000 },
  { id: "testnet-3", name: "Testnet Asia", url: "https://asia.testnet.tburn.io/rpc", region: "AP-Tokyo", status: "online", latency: 38, blockHeight: 5847292, version: "2.1.0-beta", load: 22, uptime: 99.90, requests24h: 6438293, peakTps: 25000 },
];

const rpcMethods = [
  { category: "Block Methods", icon: Layers, methods: ["eth_blockNumber", "eth_getBlockByHash", "eth_getBlockByNumber", "eth_getBlockTransactionCountByHash", "eth_getBlockTransactionCountByNumber", "eth_getUncleByBlockHashAndIndex"] },
  { category: "Transaction Methods", icon: ArrowRight, methods: ["eth_sendRawTransaction", "eth_getTransactionByHash", "eth_getTransactionReceipt", "eth_estimateGas", "eth_getTransactionByBlockHashAndIndex", "eth_pendingTransactions"] },
  { category: "Account Methods", icon: Users, methods: ["eth_getBalance", "eth_getCode", "eth_getStorageAt", "eth_getTransactionCount", "eth_getProof", "eth_accounts"] },
  { category: "Contract Methods", icon: Code2, methods: ["eth_call", "eth_getLogs", "eth_getFilterLogs", "eth_newFilter", "eth_newBlockFilter", "eth_uninstallFilter"] },
  { category: "Network Methods", icon: Network, methods: ["eth_chainId", "eth_gasPrice", "eth_syncing", "net_version", "net_listening", "net_peerCount"] },
  { category: "TBurn Custom", icon: Sparkles, methods: ["tburn_getTrustScore", "tburn_getValidatorSet", "tburn_getBurnStats", "tburn_getShardInfo", "tburn_getStakingInfo", "tburn_getConsensusState"] },
  { category: "Debug Methods", icon: GitBranch, methods: ["debug_traceTransaction", "debug_traceBlockByNumber", "debug_traceBlockByHash", "debug_storageRangeAt", "debug_getRawReceipts"] },
  { category: "WebSocket", icon: Radio, methods: ["eth_subscribe", "eth_unsubscribe", "newHeads", "logs", "newPendingTransactions", "syncing"] },
];

const getTestnetFeatures = (t: (key: string) => string) => [
  { icon: Beaker, title: t('publicPages.network.testnetRpc.features.freeEnvironment.title'), desc: t('publicPages.network.testnetRpc.features.freeEnvironment.desc'), color: "#ffd700" },
  { icon: Gift, title: t('publicPages.network.testnetRpc.features.faucet.title'), desc: t('publicPages.network.testnetRpc.features.faucet.desc'), color: "#00ff9d" },
  { icon: Zap, title: t('publicPages.network.testnetRpc.features.fastBlocks.title'), desc: t('publicPages.network.testnetRpc.features.fastBlocks.desc'), color: "#00f0ff" },
  { icon: Shield, title: t('publicPages.network.testnetRpc.features.riskFree.title'), desc: t('publicPages.network.testnetRpc.features.riskFree.desc'), color: "#7000ff" },
  { icon: Code2, title: t('publicPages.network.testnetRpc.features.debugMode.title'), desc: t('publicPages.network.testnetRpc.features.debugMode.desc'), color: "#ff6b35" },
  { icon: RefreshCw, title: t('publicPages.network.testnetRpc.features.regularResets.title'), desc: t('publicPages.network.testnetRpc.features.regularResets.desc'), color: "#ff0055" },
];

export default function TestnetRpcProviders() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; latency?: number; blockHeight?: number; error?: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [latencyHistory, setLatencyHistory] = useState<LatencyPoint[]>([]);
  const [liveBlockHeight, setLiveBlockHeight] = useState(0);
  const [liveTps, setLiveTps] = useState(0);

  const { data: networkStats } = useQuery<{ success: boolean; data: any }>({
    queryKey: ['/api/public/v1/testnet/network/stats'],
    staleTime: 30000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: 5000,
  });

  // Update live values from API data
  useEffect(() => {
    if (networkStats?.data) {
      setLiveBlockHeight(networkStats.data.blockHeight || 0);
      setLiveTps(networkStats.data.tps || 0);
    }
  }, [networkStats]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const newPoint: LatencyPoint = {
        time: now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        latency: 12 + Math.floor(Math.random() * 12)
      };
      setLatencyHistory(prev => [...prev.slice(-19), newPoint]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast({ title: t('publicPages.network.testnetRpc.copied.title'), description: t('publicPages.network.testnetRpc.copied.description') });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const startTime = Date.now();
    
    try {
      const response = await fetch('/api/public/v1/network/stats');
      const data = await response.json();
      const latency = Date.now() - startTime;
      
      if (data.success) {
        setTestResult({
          success: true,
          latency,
          blockHeight: liveBlockHeight
        });
        toast({ title: t('publicPages.network.testnetRpc.connection.success'), description: `${t('publicPages.network.testnetRpc.dashboard.avgLatency')}: ${latency}ms | ${t('publicPages.network.testnetRpc.dashboard.blockHeight')}: ${liveBlockHeight.toLocaleString()}` });
      } else {
        throw new Error("Failed to fetch network stats");
      }
    } catch (error) {
      setTestResult({
        success: false,
        error: t('publicPages.network.testnetRpc.connection.error')
      });
      toast({ title: t('publicPages.network.testnetRpc.connection.failed'), description: t('publicPages.network.testnetRpc.connection.unableToConnect'), variant: "destructive" });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <main className="flex-grow relative z-10 bg-gray-50 dark:bg-transparent transition-colors">
      {/* Hero Section - Testnet Gold Theme */}
      <section className="relative pt-24 pb-16 px-6 overflow-hidden border-b border-gray-200 dark:border-white/5">
        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-[#ffd700]/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-[#ff6b35]/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
            <div className="flex-1 max-w-2xl">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ffd700]/10 border border-[#ffd700]/30 text-xs font-mono text-[#ffd700]">
                  <Beaker className="w-3.5 h-3.5" /> {t('publicPages.network.testnetRpc.tag')}
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-xs font-medium text-yellow-400">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  {t('publicPages.network.testnetRpc.config.chainId')}: 7778
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-xs font-medium text-green-400">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  {t('publicPages.network.testnetRpc.status.operational')}
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                {t('publicPages.network.testnetRpc.heroTitle')} <span className="text-[#ffd700]">{t('publicPages.network.testnetRpc.heroTitleHighlight')}</span><br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffd700] to-[#ff6b35]">
                  {t('publicPages.network.testnetRpc.heroTitleSuffix')}
                </span>
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                {t('publicPages.network.testnetRpc.heroDescription')}
              </p>

              {/* Key Testnet Metrics */}
              <div className="grid grid-cols-4 gap-3 mb-8">
                <div className="p-3 rounded-lg bg-white/50 dark:bg-white/5 border border-[#ffd700]/20 text-center">
                  <div className="text-xl font-mono font-bold text-[#ffd700]">{t('publicPages.network.testnetRpc.metrics.free')}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">{t('publicPages.network.testnetRpc.metrics.access')}</div>
                </div>
                <div className="p-3 rounded-lg bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-center">
                  <div className="text-xl font-mono font-bold text-gray-900 dark:text-white">&lt;15ms</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">{t('publicPages.network.testnetRpc.metrics.latency')}</div>
                </div>
                <div className="p-3 rounded-lg bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-center">
                  <div className="text-xl font-mono font-bold text-gray-900 dark:text-white">3</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">{t('publicPages.network.testnetRpc.metrics.regions')}</div>
                </div>
                <div className="p-3 rounded-lg bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-center">
                  <div className="text-xl font-mono font-bold text-[#00ff9d]">{t('publicPages.network.testnetRpc.metrics.unlimited')}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">{t('publicPages.network.testnetRpc.metrics.faucet')}</div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Link href="/testnet-scan/faucet">
                  <Button className="bg-[#ffd700] text-black hover:bg-yellow-400 font-bold px-6" data-testid="button-testnet-faucet">
                    <Gift className="w-4 h-4 mr-2" />
                    {t('publicPages.network.testnetRpc.buttons.getFreeTokens')}
                  </Button>
                </Link>
                <Link href="/developers/quickstart">
                  <Button variant="outline" className="border-[#ffd700] text-[#ffd700] hover:bg-[#ffd700]/10" data-testid="button-testnet-quickstart">
                    <Rocket className="w-4 h-4 mr-2" />
                    {t('publicPages.network.testnetRpc.buttons.quickStart')}
                  </Button>
                </Link>
                <Button variant="outline" className="border-gray-300 dark:border-white/20" onClick={testConnection} disabled={isTesting} data-testid="button-test-connection-testnet">
                  {isTesting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                  {isTesting ? t('publicPages.network.testnetRpc.buttons.testing') : t('publicPages.network.testnetRpc.buttons.testConnection')}
                </Button>
              </div>
            </div>

            {/* Live Status Dashboard - Testnet */}
            <Card className="w-full lg:w-[420px] bg-white/90 dark:bg-black/60 border-[#ffd700]/30 backdrop-blur-xl shadow-xl">
              <CardHeader className="pb-3 border-b border-[#ffd700]/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#ffd700] animate-pulse" />
                    {t('publicPages.network.testnetRpc.dashboard.title')}
                  </CardTitle>
                  <Badge className="bg-[#ffd700]/20 text-[#ffd700] border-[#ffd700]/30">
                    Chain 7778
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {/* Primary Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-[#ffd700]/10 to-[#ff6b35]/5 border border-[#ffd700]/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Layers className="w-3 h-3 text-[#ffd700]" />
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">{t('publicPages.network.testnetRpc.dashboard.blockHeight')}</span>
                    </div>
                    <div className="text-2xl font-mono font-bold text-gray-900 dark:text-white">
                      {liveBlockHeight.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-br from-[#ffd700]/10 to-[#ff6b35]/5 border border-[#ffd700]/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-3 h-3 text-[#ffd700]" />
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">{t('publicPages.network.testnetRpc.dashboard.tps')}</span>
                    </div>
                    <div className="text-2xl font-mono font-bold text-[#ffd700]">
                      {liveTps.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Latency Indicator */}
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Timer className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{t('publicPages.network.testnetRpc.dashboard.avgLatency')}</span>
                    </div>
                    <span className="font-mono text-sm font-bold text-green-500">12ms</span>
                  </div>
                  <div className="flex items-center gap-1 h-6">
                    {latencyHistory.slice(-15).map((point, i) => (
                      <div 
                        key={i}
                        className="flex-1 rounded-sm transition-all duration-300"
                        style={{ 
                          height: `${Math.min(100, (point.latency / 30) * 100)}%`,
                          backgroundColor: point.latency < 15 ? '#ffd700' : point.latency < 25 ? '#ff6b35' : '#ff0055'
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Node Status */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{t('publicPages.network.testnetRpc.dashboard.testnetNodes')}</span>
                    <span className="text-[#ffd700]">3/3 {t('publicPages.network.testnetRpc.dashboard.online')}</span>
                  </div>
                  <div className="flex gap-1">
                    {testnetNodes.map((node) => (
                      <div 
                        key={node.id}
                        className="flex-1 h-2 rounded-full bg-[#ffd700]"
                        title={`${node.name}: ${node.latency}ms`}
                      />
                    ))}
                  </div>
                </div>

                {/* Mainnet Link */}
                <Link href="/rpc">
                  <Button variant="outline" className="w-full border-gray-300 dark:border-white/20 text-sm" data-testid="button-switch-mainnet">
                    <Globe className="w-4 h-4 mr-2" />
                    {t('publicPages.network.testnetRpc.buttons.switchToMainnet')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>

                {/* Test Result */}
                {testResult && (
                  <div className={`p-3 rounded-lg border ${testResult.success ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                    <div className="flex items-center gap-2">
                      {testResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-sm font-medium ${testResult.success ? 'text-green-500' : 'text-red-500'}`}>
                        {testResult.success ? `${t('publicPages.network.testnetRpc.connection.connected')} (${testResult.latency}ms)` : testResult.error}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testnet Endpoints */}
      <section className="py-10 px-6 border-b border-gray-200 dark:border-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Badge className="bg-[#ffd700]/20 text-[#ffd700] border-[#ffd700]/30 text-sm px-4 py-1">
                <Beaker className="w-4 h-4 mr-2" />
                TBurn Testnet ({t('publicPages.network.testnetRpc.config.chainId')}: 7778)
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span className="text-gray-500">{t('publicPages.network.testnetRpc.network.sslEncrypted')}</span>
              <span className="mx-2 text-gray-300 dark:text-gray-700">|</span>
              <Gift className="w-4 h-4 text-[#ffd700]" />
              <span className="text-gray-500">{t('publicPages.network.testnetRpc.network.noRateLimits')}</span>
            </div>
          </div>

          {/* Endpoint Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-white dark:bg-black/40 border-[#ffd700]/30 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ffd700] to-[#ff6b35]" />
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Server className="w-5 h-5 text-[#ffd700]" />
                  {t('publicPages.network.testnetRpc.endpoints.httpTitle')}
                  <Badge className="ml-auto bg-[#ffd700]/20 text-[#ffd700] text-xs">{t('publicPages.network.testnetRpc.endpoints.testnet')}</Badge>
                </CardTitle>
                <CardDescription>{t('publicPages.network.testnetRpc.endpoints.httpDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input 
                    value={testnetConfig.rpcUrl}
                    readOnly
                    className="font-mono text-sm bg-[#ffd700]/5 border-[#ffd700]/20"
                    data-testid="input-testnet-rpc-url"
                  />
                  <Button 
                    size="icon" 
                    variant="outline"
                    className="border-[#ffd700]/30 hover:bg-[#ffd700]/10"
                    onClick={() => copyToClipboard(testnetConfig.rpcUrl, 'testnet-rpc')}
                    data-testid="button-copy-testnet-rpc"
                  >
                    {copiedCode === 'testnet-rpc' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> {t('publicPages.network.testnetRpc.endpoints.postRequests')}</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> {t('publicPages.network.testnetRpc.endpoints.batchSupport')}</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> {t('publicPages.network.testnetRpc.endpoints.noLimits')}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black/40 border-[#ffd700]/30 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff6b35] to-[#ff0055]" />
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Radio className="w-5 h-5 text-[#ff6b35]" />
                  {t('publicPages.network.testnetRpc.endpoints.wsTitle')}
                  <Badge variant="outline" className="ml-auto text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    {t('publicPages.network.testnetRpc.endpoints.live')}
                  </Badge>
                </CardTitle>
                <CardDescription>{t('publicPages.network.testnetRpc.endpoints.wsDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input 
                    value={testnetConfig.wsUrl}
                    readOnly
                    className="font-mono text-sm bg-[#ffd700]/5 border-[#ffd700]/20"
                    data-testid="input-testnet-ws-url"
                  />
                  <Button 
                    size="icon" 
                    variant="outline"
                    className="border-[#ffd700]/30 hover:bg-[#ffd700]/10"
                    onClick={() => copyToClipboard(testnetConfig.wsUrl, 'testnet-ws')}
                    data-testid="button-copy-testnet-ws"
                  >
                    {copiedCode === 'testnet-ws' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> {t('publicPages.network.testnetRpc.endpoints.newBlocks')}</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> {t('publicPages.network.testnetRpc.endpoints.pendingTxs')}</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> {t('publicPages.network.testnetRpc.endpoints.logFilters')}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Network Configuration */}
          <Card className="bg-white dark:bg-black/40 border-[#ffd700]/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="w-5 h-5 text-[#ffd700]" />
                {t('publicPages.network.testnetRpc.config.title')}
              </CardTitle>
              <CardDescription>{t('publicPages.network.testnetRpc.config.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="p-3 rounded-lg bg-[#ffd700]/5 border border-[#ffd700]/20">
                  <div className="text-xs text-gray-500 mb-1">{t('publicPages.network.testnetRpc.config.networkName')}</div>
                  <div className="font-mono font-bold text-gray-900 dark:text-white">{testnetConfig.name}</div>
                </div>
                <div className="p-3 rounded-lg bg-[#ffd700]/5 border border-[#ffd700]/20">
                  <div className="text-xs text-gray-500 mb-1">{t('publicPages.network.testnetRpc.config.chainId')}</div>
                  <div className="font-mono font-bold text-[#ffd700]">{testnetConfig.chainId}</div>
                </div>
                <div className="p-3 rounded-lg bg-[#ffd700]/5 border border-[#ffd700]/20">
                  <div className="text-xs text-gray-500 mb-1">{t('publicPages.network.testnetRpc.config.symbol')}</div>
                  <div className="font-mono font-bold text-gray-900 dark:text-white">{testnetConfig.symbol}</div>
                </div>
                <div className="p-3 rounded-lg bg-[#ffd700]/5 border border-[#ffd700]/20">
                  <div className="text-xs text-gray-500 mb-1">{t('publicPages.network.testnetRpc.config.decimals')}</div>
                  <div className="font-mono font-bold text-gray-900 dark:text-white">18</div>
                </div>
                <div className="p-3 rounded-lg bg-[#ffd700]/5 border border-[#ffd700]/20">
                  <div className="text-xs text-gray-500 mb-1">{t('publicPages.network.testnetRpc.config.explorerUrl')}</div>
                  <a href={testnetConfig.explorerUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-sm text-[#ffd700] hover:underline flex items-center gap-1">
                    {t('publicPages.network.testnetRpc.config.explorer')} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="p-3 rounded-lg bg-[#ffd700]/5 border border-[#ffd700]/20">
                  <div className="text-xs text-gray-500 mb-1">{t('publicPages.network.testnetRpc.config.faucet')}</div>
                  <Link href="/testnet-scan/faucet" className="font-mono text-sm text-[#ffd700] hover:underline flex items-center gap-1">
                    {t('publicPages.network.testnetRpc.config.getTtburn')} <Gift className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testnet Features */}
      <section className="py-12 px-6 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.network.testnetRpc.features.title')}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('publicPages.network.testnetRpc.features.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getTestnetFeatures(t).map((feature, index) => (
              <Card key={index} className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10 hover:border-[#ffd700]/50 transition group">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${feature.color}20` }}
                    >
                      <feature.icon className="w-5 h-5" style={{ color: feature.color }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-[#ffd700] transition">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testnet Nodes */}
      <section className="py-12 px-6 border-b border-gray-200 dark:border-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.network.testnetRpc.nodes.title')}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('publicPages.network.testnetRpc.nodes.subtitle')}</p>
            </div>
            <Badge className="bg-[#ffd700]/20 text-[#ffd700] border-[#ffd700]/30">
              3/3 {t('publicPages.network.testnetRpc.nodes.nodesOnline')}
            </Badge>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {testnetNodes.map((node) => (
              <Card key={node.id} className="bg-white dark:bg-black/40 border-[#ffd700]/20 overflow-hidden">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ffd700] animate-pulse" />
                      <span className="font-semibold text-gray-900 dark:text-white">{node.name}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-[#ffd700]/30">{node.region}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-2 rounded bg-[#ffd700]/5 text-center">
                      <div className={`text-lg font-mono font-bold ${node.latency < 20 ? 'text-[#ffd700]' : node.latency < 40 ? 'text-orange-500' : 'text-red-500'}`}>
                        {node.latency}ms
                      </div>
                      <div className="text-[9px] text-gray-500 uppercase">{t('publicPages.network.testnetRpc.nodes.latency')}</div>
                    </div>
                    <div className="p-2 rounded bg-[#ffd700]/5 text-center">
                      <div className="text-lg font-mono font-bold text-gray-900 dark:text-white">{node.uptime}%</div>
                      <div className="text-[9px] text-gray-500 uppercase">{t('publicPages.network.testnetRpc.nodes.uptime')}</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">{t('publicPages.network.testnetRpc.nodes.load')}</span>
                      <div className="flex items-center gap-2 flex-1 ml-4">
                        <Progress value={node.load} className="h-1.5 flex-1" />
                        <span className="font-mono text-gray-700 dark:text-gray-300 w-8">{node.load}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t('publicPages.network.testnetRpc.nodes.requests24h')}</span>
                      <span className="font-mono text-gray-700 dark:text-gray-300">{(node.requests24h / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t('publicPages.network.testnetRpc.nodes.version')}</span>
                      <span className="font-mono text-[#ffd700]">v{node.version}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* RPC Methods */}
      <section className="py-12 px-6 border-b border-gray-200 dark:border-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.network.testnetRpc.methods.title')}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('publicPages.network.testnetRpc.methods.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {rpcMethods.map((category) => (
              <Card key={category.category} className="bg-white dark:bg-black/40 border-[#ffd700]/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <category.icon className="w-4 h-4 text-[#ffd700]" />
                    {category.category}
                    <Badge variant="outline" className="ml-auto text-[9px] border-[#ffd700]/30">{category.methods.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {category.methods.map((method) => (
                      <div 
                        key={method}
                        className="font-mono text-[11px] py-1.5 px-2 rounded bg-[#ffd700]/5 text-gray-700 dark:text-gray-300 hover:bg-[#ffd700]/10 cursor-pointer transition flex items-center justify-between group"
                        onClick={() => copyToClipboard(method, method)}
                      >
                        <span className="truncate">{method}</span>
                        <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition flex-shrink-0 ml-1" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start Code */}
      <section className="py-12 px-6 border-b border-gray-200 dark:border-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.network.testnetRpc.sdk.title')}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('publicPages.network.testnetRpc.sdk.subtitle')}</p>
          </div>
          
          <Tabs defaultValue="javascript" className="w-full">
            <TabsList className="mb-4 bg-[#ffd700]/10">
              <TabsTrigger value="javascript" className="gap-2 data-[state=active]:bg-[#ffd700] data-[state=active]:text-black">
                <SiTypescript className="w-4 h-4" /> JavaScript
              </TabsTrigger>
              <TabsTrigger value="python" className="gap-2 data-[state=active]:bg-[#ffd700] data-[state=active]:text-black">
                <SiPython className="w-4 h-4" /> Python
              </TabsTrigger>
              <TabsTrigger value="curl" className="gap-2 data-[state=active]:bg-[#ffd700] data-[state=active]:text-black">
                <Terminal className="w-4 h-4" /> cURL
              </TabsTrigger>
            </TabsList>

            <TabsContent value="javascript">
              <Card className="bg-[#0d0d12] border-[#ffd700]/30 overflow-hidden">
                <div className="bg-gray-900 border-b border-[#ffd700]/20 p-3 flex items-center justify-between">
                  <span className="text-[#ffd700] text-sm font-mono">ethers.js v6 - Testnet</span>
                  <Button size="sm" variant="ghost" className="text-gray-400 hover:text-[#ffd700]" onClick={() => copyToClipboard(`import { ethers } from 'ethers';

// Connect to TBurn Testnet
const provider = new ethers.JsonRpcProvider('${testnetConfig.rpcUrl}');

// Get testnet block number
const blockNumber = await provider.getBlockNumber();
console.log('Testnet block:', blockNumber);

// Get tTBURN balance
const balance = await provider.getBalance('0x...');
console.log('Balance:', ethers.formatEther(balance), 'tTBURN');

// WebSocket connection for real-time updates
const wsProvider = new ethers.WebSocketProvider('${testnetConfig.wsUrl}');
wsProvider.on('block', (blockNumber) => {
  console.log('New testnet block:', blockNumber);
});`, 'js')} data-testid="button-copy-js-testnet">
                    {copiedCode === 'js' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <pre className="p-4 text-gray-300 text-sm font-mono overflow-x-auto leading-relaxed">
{`import { ethers } from 'ethers';

// Connect to TBurn Testnet
const provider = new ethers.JsonRpcProvider('${testnetConfig.rpcUrl}');

// Get testnet block number
const blockNumber = await provider.getBlockNumber();
console.log('Testnet block:', blockNumber);

// Get tTBURN balance
const balance = await provider.getBalance('0x...');
console.log('Balance:', ethers.formatEther(balance), 'tTBURN');

// WebSocket connection for real-time updates
const wsProvider = new ethers.WebSocketProvider('${testnetConfig.wsUrl}');
wsProvider.on('block', (blockNumber) => {
  console.log('New testnet block:', blockNumber);
});`}
                </pre>
              </Card>
            </TabsContent>

            <TabsContent value="python">
              <Card className="bg-[#0d0d12] border-[#ffd700]/30 overflow-hidden">
                <div className="bg-gray-900 border-b border-[#ffd700]/20 p-3 flex items-center justify-between">
                  <span className="text-[#ffd700] text-sm font-mono">web3.py - Testnet</span>
                  <Button size="sm" variant="ghost" className="text-gray-400 hover:text-[#ffd700]" onClick={() => copyToClipboard(`from web3 import Web3

# Connect to TBurn Testnet
w3 = Web3(Web3.HTTPProvider('${testnetConfig.rpcUrl}'))
print(f"Connected: {w3.is_connected()}")
print(f"Chain ID: {w3.eth.chain_id}")  # Should be 7778

# Get testnet block
block = w3.eth.get_block('latest')
print(f"Testnet Block: {block.number}")

# Get tTBURN balance
balance = w3.eth.get_balance('0x...')
print(f"Balance: {w3.from_wei(balance, 'ether')} tTBURN")`, 'py')} data-testid="button-copy-py-testnet">
                    {copiedCode === 'py' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <pre className="p-4 text-gray-300 text-sm font-mono overflow-x-auto leading-relaxed">
{`from web3 import Web3

# Connect to TBurn Testnet
w3 = Web3(Web3.HTTPProvider('${testnetConfig.rpcUrl}'))
print(f"Connected: {w3.is_connected()}")
print(f"Chain ID: {w3.eth.chain_id}")  # Should be 7778

# Get testnet block
block = w3.eth.get_block('latest')
print(f"Testnet Block: {block.number}")

# Get tTBURN balance
balance = w3.eth.get_balance('0x...')
print(f"Balance: {w3.from_wei(balance, 'ether')} tTBURN")`}
                </pre>
              </Card>
            </TabsContent>

            <TabsContent value="curl">
              <Card className="bg-[#0d0d12] border-[#ffd700]/30 overflow-hidden">
                <div className="bg-gray-900 border-b border-[#ffd700]/20 p-3 flex items-center justify-between">
                  <span className="text-[#ffd700] text-sm font-mono">cURL - Testnet</span>
                  <Button size="sm" variant="ghost" className="text-gray-400 hover:text-[#ffd700]" onClick={() => copyToClipboard(`# Get testnet chain ID (should return 0x1e62 = 7778)
curl -X POST ${testnetConfig.rpcUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'

# Get testnet block number
curl -X POST ${testnetConfig.rpcUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Get tTBURN balance
curl -X POST ${testnetConfig.rpcUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x...","latest"],"id":1}'`, 'curl')} data-testid="button-copy-curl-testnet">
                    {copiedCode === 'curl' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <pre className="p-4 text-gray-300 text-sm font-mono overflow-x-auto leading-relaxed">
{`# Get testnet chain ID (should return 0x1e62 = 7778)
curl -X POST ${testnetConfig.rpcUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'

# Get testnet block number
curl -X POST ${testnetConfig.rpcUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Get tTBURN balance
curl -X POST ${testnetConfig.rpcUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x...","latest"],"id":1}'`}
                </pre>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Resources & CTA */}
      <section className="py-12 px-6 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/5">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">{t('publicPages.network.testnetRpc.resources.title')}</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Link href="/testnet-scan/faucet">
              <Card className="bg-white dark:bg-black/40 border-[#ffd700]/30 hover:border-[#ffd700] transition cursor-pointer group h-full">
                <CardContent className="pt-6 text-center">
                  <Gift className="w-8 h-8 text-[#ffd700] mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">{t('publicPages.network.testnetRpc.resources.faucet.title')}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t('publicPages.network.testnetRpc.resources.faucet.desc')}</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/developers/docs">
              <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10 hover:border-[#7000ff]/50 transition cursor-pointer group h-full">
                <CardContent className="pt-6 text-center">
                  <Book className="w-8 h-8 text-[#7000ff] mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">{t('publicPages.network.testnetRpc.resources.documentation.title')}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t('publicPages.network.testnetRpc.resources.documentation.desc')}</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/testnet-scan">
              <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10 hover:border-[#ffd700]/50 transition cursor-pointer group h-full">
                <CardContent className="pt-6 text-center">
                  <Globe className="w-8 h-8 text-[#ffd700] mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">{t('publicPages.network.testnetRpc.resources.explorer.title')}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t('publicPages.network.testnetRpc.resources.explorer.desc')}</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/rpc">
              <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10 hover:border-orange-500/50 transition cursor-pointer group h-full">
                <CardContent className="pt-6 text-center">
                  <Server className="w-8 h-8 text-orange-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">{t('publicPages.network.testnetRpc.resources.mainnet.title')}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t('publicPages.network.testnetRpc.resources.mainnet.desc')}</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <Card className="bg-gradient-to-br from-[#ffd700]/10 via-[#ff6b35]/10 to-[#ff0055]/10 border-[#ffd700]/30 overflow-hidden relative">
            <div className="absolute inset-0 bg-grid-white/5" />
            <CardContent className="py-12 relative">
              <Beaker className="w-12 h-12 text-[#ffd700] mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{t('publicPages.network.testnetRpc.cta.title')}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
                {t('publicPages.network.testnetRpc.cta.description')}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/testnet-scan/faucet">
                  <Button className="bg-[#ffd700] text-black hover:bg-yellow-400 font-bold px-8" data-testid="button-cta-faucet">
                    <Gift className="w-4 h-4 mr-2" />
                    {t('publicPages.network.testnetRpc.buttons.getFreeTokens')}
                  </Button>
                </Link>
                <Link href="/developers/quickstart">
                  <Button variant="outline" className="border-[#ffd700] text-[#ffd700] hover:bg-[#ffd700]/10 px-8" data-testid="button-cta-quickstart">
                    <Rocket className="w-4 h-4 mr-2" />
                    {t('publicPages.network.testnetRpc.cta.quickStartGuide')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
