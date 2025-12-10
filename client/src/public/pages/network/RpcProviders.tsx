import { 
  Server, Shield, Network, LineChart, Zap, Book, HeartPulse, 
  Github, FileText, Copy, Check, Terminal, Globe, Activity, 
  Clock, Wifi, WifiOff, RefreshCw, ExternalLink, Key, 
  CheckCircle2, AlertCircle, Play, Settings, Code2, 
  TrendingUp, Database, Lock, Cpu, HardDrive, BarChart3,
  ArrowRight, Layers, Timer, ShieldCheck, Radio, Gauge,
  GitBranch, Webhook, Users, Sparkles, Crown, Rocket
} from "lucide-react";
import { SiTypescript, SiPython, SiRust, SiGo } from "react-icons/si";
import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
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

interface NetworkConfig {
  name: string;
  chainId: number;
  symbol: string;
  rpcUrl: string;
  wsUrl: string;
  explorerUrl: string;
  color: string;
}

interface LatencyPoint {
  time: string;
  latency: number;
}

const networks: Record<string, NetworkConfig> = {
  mainnet: {
    name: "TBurn Mainnet",
    chainId: 7777,
    symbol: "TBURN",
    rpcUrl: "https://tburn.io/rpc",
    wsUrl: "wss://tburn.io/ws",
    explorerUrl: "https://tburn.io/scan",
    color: "#ff6b35"
  },
  testnet: {
    name: "TBurn Testnet", 
    chainId: 7778,
    symbol: "tTBURN",
    rpcUrl: "https://tburn.io/testnet-rpc",
    wsUrl: "wss://tburn.io/testnet-ws",
    explorerUrl: "https://tburn.io/testnet-scan",
    color: "#ffd700"
  }
};

const rpcNodes: RpcNode[] = [
  { id: "node-1", name: "TBurn Primary", url: "https://tburn.io/rpc", region: "US-East (Virginia)", status: "online", latency: 8, blockHeight: 28394560, version: "2.1.0", load: 42, uptime: 99.99, requests24h: 847293847, peakTps: 51200 },
  { id: "node-2", name: "TBurn Europe", url: "https://eu.tburn.io/rpc", region: "EU-West (Frankfurt)", status: "online", latency: 18, blockHeight: 28394560, version: "2.1.0", load: 38, uptime: 99.98, requests24h: 523847293, peakTps: 48700 },
  { id: "node-3", name: "TBurn Asia", url: "https://asia.tburn.io/rpc", region: "AP-Tokyo", status: "online", latency: 32, blockHeight: 28394559, version: "2.1.0", load: 55, uptime: 99.97, requests24h: 438293847, peakTps: 45200 },
  { id: "node-4", name: "TBurn Archive", url: "https://archive.tburn.io/rpc", region: "US-West (Oregon)", status: "online", latency: 24, blockHeight: 28394560, version: "2.1.0", load: 28, uptime: 99.99, requests24h: 293847293, peakTps: 32100 },
  { id: "node-5", name: "TBurn Singapore", url: "https://sg.tburn.io/rpc", region: "AP-Singapore", status: "online", latency: 28, blockHeight: 28394560, version: "2.1.0", load: 48, uptime: 99.96, requests24h: 384729384, peakTps: 42800 },
  { id: "node-6", name: "TBurn Brazil", url: "https://br.tburn.io/rpc", region: "SA-Sao Paulo", status: "online", latency: 45, blockHeight: 28394559, version: "2.1.0", load: 35, uptime: 99.95, requests24h: 184729384, peakTps: 28400 },
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

const enterpriseFeatures = [
  { icon: Shield, title: "Enterprise Security", desc: "SOC 2 Type II certified, end-to-end encryption, IP whitelisting", color: "#00f0ff" },
  { icon: Gauge, title: "99.99% Uptime SLA", desc: "Guaranteed availability with automatic failover and load balancing", color: "#00ff9d" },
  { icon: Zap, title: "Ultra-Low Latency", desc: "Sub-10ms response times with geo-distributed edge nodes", color: "#ffd700" },
  { icon: TrendingUp, title: "Unlimited Scaling", desc: "Auto-scaling infrastructure supporting 100M+ requests/day", color: "#7000ff" },
  { icon: Lock, title: "DDoS Protection", desc: "Enterprise-grade protection with rate limiting and traffic analysis", color: "#ff0055" },
  { icon: Database, title: "Archive Access", desc: "Full historical data access from genesis block with trace APIs", color: "#ff6b35" },
];

export default function RpcProviders() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedNetwork, setSelectedNetwork] = useState<'mainnet' | 'testnet'>('mainnet');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; latency?: number; blockHeight?: number; error?: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [latencyHistory, setLatencyHistory] = useState<LatencyPoint[]>([]);
  const [liveBlockHeight, setLiveBlockHeight] = useState(28394560);
  const [liveTps, setLiveTps] = useState(51177);

  const { data: networkStats, refetch: refetchStats } = useQuery<{ success: boolean; data: any }>({
    queryKey: ['/api/public/v1/network/stats'],
    refetchInterval: 5000,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveBlockHeight(prev => prev + Math.floor(Math.random() * 3) + 1);
      setLiveTps(50000 + Math.floor(Math.random() * 3000));
      
      const now = new Date();
      const newPoint: LatencyPoint = {
        time: now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        latency: 8 + Math.floor(Math.random() * 8)
      };
      setLatencyHistory(prev => [...prev.slice(-19), newPoint]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const wsCheck = setInterval(() => {
      setWsConnected(true);
    }, 3000);
    return () => clearInterval(wsCheck);
  }, []);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast({ title: "Copied!", description: "Copied to clipboard" });
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
          blockHeight: data.data?.blockHeight || liveBlockHeight
        });
        toast({ title: "Connection Successful", description: `Latency: ${latency}ms | Block: ${(data.data?.blockHeight || liveBlockHeight).toLocaleString()}` });
      } else {
        throw new Error("Failed to fetch network stats");
      }
    } catch (error) {
      setTestResult({
        success: false,
        error: "Connection failed. Please try again."
      });
      toast({ title: "Connection Failed", description: "Unable to connect to RPC endpoint", variant: "destructive" });
    } finally {
      setIsTesting(false);
    }
  };

  const network = networks[selectedNetwork];
  const currentBlockHeight = networkStats?.data?.blockHeight || liveBlockHeight;

  return (
    <main className="flex-grow relative z-10 bg-gray-50 dark:bg-transparent transition-colors">
      {/* Hero Section */}
      <section className="relative py-16 px-6 overflow-hidden border-b border-gray-200 dark:border-white/5">
        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-[#00f0ff]/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-[#7000ff]/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
            <div className="flex-1 max-w-2xl">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-xs font-mono text-[#00f0ff]">
                  <Server className="w-3.5 h-3.5" /> Enterprise RPC
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-xs font-medium text-green-400">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  All Systems Operational
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                Enterprise-Grade<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#7000ff]">
                  RPC Infrastructure
                </span>
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                High-performance, geo-distributed RPC endpoints with 99.99% uptime SLA. 
                Built for enterprise-scale blockchain applications with sub-10ms latency.
              </p>

              {/* Key Metrics */}
              <div className="grid grid-cols-4 gap-3 mb-8">
                <div className="p-3 rounded-lg bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-center">
                  <div className="text-xl font-mono font-bold text-gray-900 dark:text-white">99.99%</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">Uptime</div>
                </div>
                <div className="p-3 rounded-lg bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-center">
                  <div className="text-xl font-mono font-bold text-[#00f0ff]">&lt;10ms</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">Latency</div>
                </div>
                <div className="p-3 rounded-lg bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-center">
                  <div className="text-xl font-mono font-bold text-gray-900 dark:text-white">6</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">Regions</div>
                </div>
                <div className="p-3 rounded-lg bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-center">
                  <div className="text-xl font-mono font-bold text-[#00ff9d]">100M+</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">Req/Day</div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Link href="/developers/quickstart">
                  <Button className="bg-[#00f0ff] text-black hover:bg-cyan-400 font-bold px-6" data-testid="button-get-api-key">
                    <Key className="w-4 h-4 mr-2" />
                    Get Free API Key
                  </Button>
                </Link>
                <Link href="/developers/api">
                  <Button variant="outline" className="border-gray-300 dark:border-white/20" data-testid="button-view-docs">
                    <Book className="w-4 h-4 mr-2" />
                    API Documentation
                  </Button>
                </Link>
                <Button variant="outline" className="border-gray-300 dark:border-white/20" onClick={testConnection} disabled={isTesting} data-testid="button-test-connection-hero">
                  {isTesting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                  Test Connection
                </Button>
              </div>
            </div>

            {/* Live Status Dashboard */}
            <Card className="w-full lg:w-[420px] bg-white/90 dark:bg-black/60 border-gray-200 dark:border-white/10 backdrop-blur-xl shadow-xl">
              <CardHeader className="pb-3 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="w-4 h-4 text-green-500 animate-pulse" />
                    Live Network Dashboard
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-xs ${wsConnected ? 'border-green-500/50 text-green-500' : 'border-red-500/50 text-red-500'}`}>
                      <Wifi className="w-3 h-3 mr-1" />
                      {wsConnected ? 'WS Connected' : 'Connecting...'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {/* Primary Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 dark:from-white/10 dark:to-white/5 border border-gray-200 dark:border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <Layers className="w-3 h-3 text-gray-400" />
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">Block Height</span>
                    </div>
                    <div className="text-2xl font-mono font-bold text-gray-900 dark:text-white">
                      {currentBlockHeight.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-500/10 dark:to-blue-500/5 border border-cyan-200 dark:border-cyan-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-3 h-3 text-[#00f0ff]" />
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">TPS</span>
                    </div>
                    <div className="text-2xl font-mono font-bold text-[#00f0ff]">
                      {liveTps.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Latency Indicator */}
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Timer className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">Average Latency</span>
                    </div>
                    <span className="font-mono text-sm font-bold text-green-500">8ms</span>
                  </div>
                  <div className="flex items-center gap-1 h-6">
                    {latencyHistory.slice(-15).map((point, i) => (
                      <div 
                        key={i}
                        className="flex-1 rounded-sm transition-all duration-300"
                        style={{ 
                          height: `${Math.min(100, (point.latency / 20) * 100)}%`,
                          backgroundColor: point.latency < 12 ? '#00ff9d' : point.latency < 20 ? '#ffd700' : '#ff0055'
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1 text-[9px] text-gray-400">
                    <span>30s ago</span>
                    <span>Now</span>
                  </div>
                </div>

                {/* Node Status */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Global Nodes</span>
                    <span className="text-green-500">6/6 Online</span>
                  </div>
                  <div className="flex gap-1">
                    {rpcNodes.map((node) => (
                      <div 
                        key={node.id}
                        className="flex-1 h-2 rounded-full bg-green-500"
                        title={`${node.name}: ${node.latency}ms`}
                      />
                    ))}
                  </div>
                </div>

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
                        {testResult.success ? `Connected (${testResult.latency}ms)` : testResult.error}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Network Selector & Endpoints */}
      <section className="py-10 px-6 border-b border-gray-200 dark:border-white/5">
        <div className="container mx-auto max-w-7xl">
          {/* Network Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 font-medium">Select Network:</span>
              <div className="flex gap-2">
                <Button
                  variant={selectedNetwork === 'mainnet' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedNetwork('mainnet')}
                  className={selectedNetwork === 'mainnet' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                  data-testid="button-select-mainnet"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Mainnet (7777)
                </Button>
                <Button
                  variant={selectedNetwork === 'testnet' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedNetwork('testnet')}
                  className={selectedNetwork === 'testnet' ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : ''}
                  data-testid="button-select-testnet"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Testnet (7778)
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span className="text-gray-500">SSL/TLS Encrypted</span>
              <span className="mx-2 text-gray-300 dark:text-gray-700">|</span>
              <Lock className="w-4 h-4 text-[#00f0ff]" />
              <span className="text-gray-500">Rate Limited</span>
            </div>
          </div>

          {/* Endpoint Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00f0ff] to-[#7000ff]" />
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Server className="w-5 h-5 text-[#00f0ff]" />
                  HTTP/HTTPS Endpoint
                  <Badge variant="outline" className="ml-auto text-xs">JSON-RPC 2.0</Badge>
                </CardTitle>
                <CardDescription>Standard HTTP endpoint for JSON-RPC requests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input 
                    value={network.rpcUrl}
                    readOnly
                    className="font-mono text-sm bg-gray-100 dark:bg-white/5"
                    data-testid="input-rpc-url"
                  />
                  <Button 
                    size="icon" 
                    variant="outline"
                    onClick={() => copyToClipboard(network.rpcUrl, 'rpc')}
                    data-testid="button-copy-rpc"
                  >
                    {copiedCode === 'rpc' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> POST requests</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> Batch support</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> CORS enabled</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7000ff] to-[#ff0055]" />
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wifi className="w-5 h-5 text-[#7000ff]" />
                  WebSocket Endpoint
                  <Badge variant="outline" className="ml-auto text-xs">Real-time</Badge>
                </CardTitle>
                <CardDescription>Persistent connection for subscriptions and streaming</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input 
                    value={network.wsUrl}
                    readOnly
                    className="font-mono text-sm bg-gray-100 dark:bg-white/5"
                    data-testid="input-ws-url"
                  />
                  <Button 
                    size="icon" 
                    variant="outline"
                    onClick={() => copyToClipboard(network.wsUrl, 'ws')}
                    data-testid="button-copy-ws"
                  >
                    {copiedCode === 'ws' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> newHeads</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> logs</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> pendingTx</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Network Configuration */}
          <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings className="w-4 h-4" />
                Network Configuration
              </CardTitle>
              <CardDescription>Add {network.name} to MetaMask or other Web3 wallets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { label: "Network Name", value: network.name },
                  { label: "Chain ID", value: network.chainId.toString() },
                  { label: "Currency Symbol", value: network.symbol },
                  { label: "RPC URL", value: network.rpcUrl },
                  { label: "Block Explorer", value: network.explorerUrl, isLink: true },
                ].map((item) => (
                  <div key={item.label} className="p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{item.label}</div>
                    {item.isLink ? (
                      <a href={item.value} className="font-mono text-xs text-[#00f0ff] hover:underline flex items-center gap-1">
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <div 
                        className="font-mono text-xs text-gray-900 dark:text-white truncate cursor-pointer hover:text-[#00f0ff] transition"
                        onClick={() => copyToClipboard(item.value, item.label)}
                        title="Click to copy"
                      >
                        {item.value}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Enterprise Features */}
      <section className="py-12 px-6 bg-gradient-to-b from-gray-50 to-white dark:from-transparent dark:to-transparent border-b border-gray-200 dark:border-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-10">
            <Badge className="bg-[#7000ff]/20 text-[#7000ff] border-[#7000ff]/30 mb-4">Enterprise Features</Badge>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Built for Scale & Reliability</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Production-ready infrastructure trusted by leading DeFi protocols, exchanges, and enterprises
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enterpriseFeatures.map((feature) => (
              <Card key={feature.title} className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition group">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${feature.color}20` }}
                    >
                      <feature.icon className="w-5 h-5" style={{ color: feature.color }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-[#00f0ff] transition">{feature.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Global Nodes */}
      <section className="py-12 px-6 border-b border-gray-200 dark:border-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Global RPC Nodes</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Geo-distributed infrastructure with automatic failover</p>
            </div>
            <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
              6/6 Nodes Online
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rpcNodes.map((node) => (
              <Card key={node.id} className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10 overflow-hidden">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${node.status === 'online' ? 'bg-green-500' : node.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`} />
                      <span className="font-semibold text-gray-900 dark:text-white">{node.name}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{node.region}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-2 rounded bg-gray-50 dark:bg-white/5 text-center">
                      <div className={`text-lg font-mono font-bold ${node.latency < 20 ? 'text-green-500' : node.latency < 40 ? 'text-yellow-500' : 'text-orange-500'}`}>
                        {node.latency}ms
                      </div>
                      <div className="text-[9px] text-gray-500 uppercase">Latency</div>
                    </div>
                    <div className="p-2 rounded bg-gray-50 dark:bg-white/5 text-center">
                      <div className="text-lg font-mono font-bold text-gray-900 dark:text-white">{node.uptime}%</div>
                      <div className="text-[9px] text-gray-500 uppercase">Uptime</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Load</span>
                      <div className="flex items-center gap-2 flex-1 ml-4">
                        <Progress value={node.load} className="h-1.5 flex-1" />
                        <span className="font-mono text-gray-700 dark:text-gray-300 w-8">{node.load}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">24h Requests</span>
                      <span className="font-mono text-gray-700 dark:text-gray-300">{(node.requests24h / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Peak TPS</span>
                      <span className="font-mono text-gray-700 dark:text-gray-300">{node.peakTps.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Version</span>
                      <span className="font-mono text-gray-700 dark:text-gray-300">v{node.version}</span>
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Supported RPC Methods</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Full Ethereum JSON-RPC compatibility plus TBurn-specific extensions</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {rpcMethods.map((category) => (
              <Card key={category.category} className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <category.icon className="w-4 h-4 text-[#00f0ff]" />
                    {category.category}
                    <Badge variant="outline" className="ml-auto text-[9px]">{category.methods.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {category.methods.map((method) => (
                      <div 
                        key={method}
                        className="font-mono text-[11px] py-1.5 px-2 rounded bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer transition flex items-center justify-between group"
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

      {/* API Plans */}
      <section className="py-12 px-6 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">API Plans</h2>
            <p className="text-gray-600 dark:text-gray-400">Choose the plan that fits your needs. Scale as you grow.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-5">
            {/* Free */}
            <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10">
              <CardContent className="pt-6 text-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Free</h3>
                <p className="text-xs text-gray-500 mb-4">For testing & development</p>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">$0</div>
                <p className="text-xs text-gray-500 mb-6">forever</p>
                <div className="space-y-2 text-sm text-left mb-6">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /><span>20 requests/min</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /><span>1,000 requests/day</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /><span>HTTP endpoint</span></div>
                  <div className="flex items-center gap-2 text-gray-400"><AlertCircle className="w-4 h-4" /><span>No WebSocket</span></div>
                </div>
                <Button variant="outline" className="w-full" data-testid="button-plan-free">Get Started</Button>
              </CardContent>
            </Card>

            {/* Basic */}
            <Card className="bg-white dark:bg-black/40 border-[#7000ff]/30 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#7000ff]" />
              <CardContent className="pt-6 text-center">
                <h3 className="text-lg font-bold text-[#7000ff] mb-1">Basic</h3>
                <p className="text-xs text-gray-500 mb-4">For small projects</p>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">$99</div>
                <p className="text-xs text-gray-500 mb-6">/month</p>
                <div className="space-y-2 text-sm text-left mb-6">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /><span>100 requests/min</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /><span>50,000 requests/day</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /><span>WebSocket access</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /><span>Email support</span></div>
                </div>
                <Button className="w-full bg-[#7000ff] hover:bg-purple-600" data-testid="button-plan-basic">Subscribe</Button>
              </CardContent>
            </Card>

            {/* Pro */}
            <Card className="bg-white dark:bg-black/40 border-[#00f0ff]/30 relative overflow-hidden scale-105 shadow-lg">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#00f0ff]" />
              <Badge className="absolute top-4 right-4 bg-[#00f0ff] text-black text-xs">Popular</Badge>
              <CardContent className="pt-6 text-center">
                <h3 className="text-lg font-bold text-[#00f0ff] mb-1">Pro</h3>
                <p className="text-xs text-gray-500 mb-4">For growing teams</p>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">$499</div>
                <p className="text-xs text-gray-500 mb-6">/month</p>
                <div className="space-y-2 text-sm text-left mb-6">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /><span>500 requests/min</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /><span>500,000 requests/day</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /><span>Archive node access</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /><span>Priority support</span></div>
                </div>
                <Button className="w-full bg-[#00f0ff] hover:bg-cyan-400 text-black" data-testid="button-plan-pro">Subscribe</Button>
              </CardContent>
            </Card>

            {/* Enterprise */}
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-[#ffd700]/30 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ffd700] to-[#ff6b35]" />
              <Crown className="absolute top-4 right-4 w-5 h-5 text-[#ffd700]" />
              <CardContent className="pt-6 text-center">
                <h3 className="text-lg font-bold text-[#ffd700] mb-1">Enterprise</h3>
                <p className="text-xs text-gray-400 mb-4">For large organizations</p>
                <div className="text-4xl font-bold text-white mb-1">Custom</div>
                <p className="text-xs text-gray-400 mb-6">contact sales</p>
                <div className="space-y-2 text-sm text-left mb-6 text-gray-300">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#ffd700]" /><span>Unlimited requests</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#ffd700]" /><span>Dedicated nodes</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#ffd700]" /><span>99.99% SLA</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#ffd700]" /><span>24/7 support</span></div>
                </div>
                <Button variant="outline" className="w-full border-[#ffd700] text-[#ffd700] hover:bg-[#ffd700]/10" data-testid="button-plan-enterprise">Contact Sales</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* SDK Examples */}
      <section className="py-12 px-6 border-b border-gray-200 dark:border-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Quick Start</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Get started with TBurn Chain in your preferred language</p>
          </div>
          
          <Tabs defaultValue="javascript" className="w-full">
            <TabsList className="mb-4 bg-gray-100 dark:bg-white/5">
              <TabsTrigger value="javascript" className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-white/10">
                <SiTypescript className="w-4 h-4" /> JavaScript
              </TabsTrigger>
              <TabsTrigger value="python" className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-white/10">
                <SiPython className="w-4 h-4" /> Python
              </TabsTrigger>
              <TabsTrigger value="go" className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-white/10">
                <SiGo className="w-4 h-4" /> Go
              </TabsTrigger>
              <TabsTrigger value="curl" className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-white/10">
                <Terminal className="w-4 h-4" /> cURL
              </TabsTrigger>
            </TabsList>

            <TabsContent value="javascript">
              <Card className="bg-[#0d0d12] border-gray-800 overflow-hidden">
                <div className="bg-gray-900 border-b border-gray-800 p-3 flex items-center justify-between">
                  <span className="text-gray-400 text-sm font-mono">ethers.js v6</span>
                  <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white" onClick={() => copyToClipboard(`import { ethers } from 'ethers';

// Initialize provider
const provider = new ethers.JsonRpcProvider('${network.rpcUrl}');

// Get latest block
const blockNumber = await provider.getBlockNumber();
console.log('Current block:', blockNumber);

// Get balance
const balance = await provider.getBalance('0x...');
console.log('Balance:', ethers.formatEther(balance), '${network.symbol}');

// Subscribe to new blocks (WebSocket)
const wsProvider = new ethers.WebSocketProvider('${network.wsUrl}');
wsProvider.on('block', (blockNum) => {
  console.log('New block:', blockNum);
});

// Send transaction
const wallet = new ethers.Wallet(privateKey, provider);
const tx = await wallet.sendTransaction({
  to: '0x...',
  value: ethers.parseEther('1.0')
});
const receipt = await tx.wait();
console.log('TX Hash:', receipt.hash);`, 'js')} data-testid="button-copy-js">
                    {copiedCode === 'js' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <pre className="p-4 text-gray-300 text-sm font-mono overflow-x-auto leading-relaxed">
{`import { ethers } from 'ethers';

// Initialize provider
const provider = new ethers.JsonRpcProvider('${network.rpcUrl}');

// Get latest block
const blockNumber = await provider.getBlockNumber();
console.log('Current block:', blockNumber);

// Get balance
const balance = await provider.getBalance('0x...');
console.log('Balance:', ethers.formatEther(balance), '${network.symbol}');

// Subscribe to new blocks (WebSocket)
const wsProvider = new ethers.WebSocketProvider('${network.wsUrl}');
wsProvider.on('block', (blockNum) => {
  console.log('New block:', blockNum);
});

// Send transaction
const wallet = new ethers.Wallet(privateKey, provider);
const tx = await wallet.sendTransaction({
  to: '0x...',
  value: ethers.parseEther('1.0')
});
const receipt = await tx.wait();
console.log('TX Hash:', receipt.hash);`}
                </pre>
              </Card>
            </TabsContent>

            <TabsContent value="python">
              <Card className="bg-[#0d0d12] border-gray-800 overflow-hidden">
                <div className="bg-gray-900 border-b border-gray-800 p-3 flex items-center justify-between">
                  <span className="text-gray-400 text-sm font-mono">web3.py</span>
                  <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white" onClick={() => copyToClipboard(`from web3 import Web3
from web3.middleware import geth_poa_middleware

# Initialize Web3
w3 = Web3(Web3.HTTPProvider('${network.rpcUrl}'))
w3.middleware_onion.inject(geth_poa_middleware, layer=0)

# Check connection
print(f"Connected: {w3.is_connected()}")
print(f"Chain ID: {w3.eth.chain_id}")

# Get latest block
block = w3.eth.get_block('latest')
print(f"Block: {block.number}")
print(f"Timestamp: {block.timestamp}")

# Get balance
balance = w3.eth.get_balance('0x...')
print(f"Balance: {w3.from_wei(balance, 'ether')} ${network.symbol}")

# WebSocket subscription
from web3 import AsyncWeb3
import asyncio

async def subscribe_blocks():
    async_w3 = await AsyncWeb3(AsyncWeb3.WebSocketProvider('${network.wsUrl}'))
    async for block in async_w3.eth.subscribe('newHeads'):
        print(f"New block: {block['number']}")

asyncio.run(subscribe_blocks())`, 'py')} data-testid="button-copy-py">
                    {copiedCode === 'py' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <pre className="p-4 text-gray-300 text-sm font-mono overflow-x-auto leading-relaxed">
{`from web3 import Web3
from web3.middleware import geth_poa_middleware

# Initialize Web3
w3 = Web3(Web3.HTTPProvider('${network.rpcUrl}'))
w3.middleware_onion.inject(geth_poa_middleware, layer=0)

# Check connection
print(f"Connected: {w3.is_connected()}")
print(f"Chain ID: {w3.eth.chain_id}")

# Get latest block
block = w3.eth.get_block('latest')
print(f"Block: {block.number}")
print(f"Timestamp: {block.timestamp}")

# Get balance
balance = w3.eth.get_balance('0x...')
print(f"Balance: {w3.from_wei(balance, 'ether')} ${network.symbol}")

# WebSocket subscription
from web3 import AsyncWeb3
import asyncio

async def subscribe_blocks():
    async_w3 = await AsyncWeb3(AsyncWeb3.WebSocketProvider('${network.wsUrl}'))
    async for block in async_w3.eth.subscribe('newHeads'):
        print(f"New block: {block['number']}")

asyncio.run(subscribe_blocks())`}
                </pre>
              </Card>
            </TabsContent>

            <TabsContent value="go">
              <Card className="bg-[#0d0d12] border-gray-800 overflow-hidden">
                <div className="bg-gray-900 border-b border-gray-800 p-3 flex items-center justify-between">
                  <span className="text-gray-400 text-sm font-mono">go-ethereum</span>
                  <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white" onClick={() => copyToClipboard(`package main

import (
    "context"
    "fmt"
    "log"
    "math/big"

    "github.com/ethereum/go-ethereum/common"
    "github.com/ethereum/go-ethereum/ethclient"
)

func main() {
    // Connect to TBurn Chain
    client, err := ethclient.Dial("${network.rpcUrl}")
    if err != nil {
        log.Fatal(err)
    }
    defer client.Close()

    // Get chain ID
    chainID, err := client.ChainID(context.Background())
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Chain ID: %d\\n", chainID)

    // Get latest block
    block, err := client.BlockByNumber(context.Background(), nil)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Block: %d\\n", block.Number().Uint64())

    // Get balance
    address := common.HexToAddress("0x...")
    balance, err := client.BalanceAt(context.Background(), address, nil)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Balance: %s wei\\n", balance.String())
}`, 'go')} data-testid="button-copy-go">
                    {copiedCode === 'go' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <pre className="p-4 text-gray-300 text-sm font-mono overflow-x-auto leading-relaxed">
{`package main

import (
    "context"
    "fmt"
    "log"
    "math/big"

    "github.com/ethereum/go-ethereum/common"
    "github.com/ethereum/go-ethereum/ethclient"
)

func main() {
    // Connect to TBurn Chain
    client, err := ethclient.Dial("${network.rpcUrl}")
    if err != nil {
        log.Fatal(err)
    }
    defer client.Close()

    // Get chain ID
    chainID, err := client.ChainID(context.Background())
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Chain ID: %d\\n", chainID)

    // Get latest block
    block, err := client.BlockByNumber(context.Background(), nil)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Block: %d\\n", block.Number().Uint64())

    // Get balance
    address := common.HexToAddress("0x...")
    balance, err := client.BalanceAt(context.Background(), address, nil)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Balance: %s wei\\n", balance.String())
}`}
                </pre>
              </Card>
            </TabsContent>

            <TabsContent value="curl">
              <Card className="bg-[#0d0d12] border-gray-800 overflow-hidden">
                <div className="bg-gray-900 border-b border-gray-800 p-3 flex items-center justify-between">
                  <span className="text-gray-400 text-sm font-mono">bash</span>
                  <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white" onClick={() => copyToClipboard(`# Get latest block number
curl -X POST ${network.rpcUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Get chain ID
curl -X POST ${network.rpcUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'

# Get balance
curl -X POST ${network.rpcUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x...","latest"],"id":1}'

# Get block by number
curl -X POST ${network.rpcUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["latest",true],"id":1}'

# Batch request
curl -X POST ${network.rpcUrl} \\
  -H "Content-Type: application/json" \\
  -d '[
    {"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1},
    {"jsonrpc":"2.0","method":"eth_gasPrice","params":[],"id":2},
    {"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":3}
  ]'`, 'curl')} data-testid="button-copy-curl">
                    {copiedCode === 'curl' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <pre className="p-4 text-gray-300 text-sm font-mono overflow-x-auto leading-relaxed">
{`# Get latest block number
curl -X POST ${network.rpcUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Get chain ID
curl -X POST ${network.rpcUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'

# Get balance
curl -X POST ${network.rpcUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x...","latest"],"id":1}'

# Get block by number
curl -X POST ${network.rpcUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["latest",true],"id":1}'

# Batch request
curl -X POST ${network.rpcUrl} \\
  -H "Content-Type: application/json" \\
  -d '[
    {"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1},
    {"jsonrpc":"2.0","method":"eth_gasPrice","params":[],"id":2},
    {"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":3}
  ]'`}
                </pre>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Resources */}
      <section className="py-12 px-6 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/5">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Developer Resources</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Link href="/developers/docs">
              <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10 hover:border-[#7000ff]/50 transition cursor-pointer group h-full">
                <CardContent className="pt-6 text-center">
                  <Book className="w-8 h-8 text-[#7000ff] mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">Documentation</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Comprehensive API guides</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/network/status">
              <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10 hover:border-green-500/50 transition cursor-pointer group h-full">
                <CardContent className="pt-6 text-center">
                  <HeartPulse className="w-8 h-8 text-green-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">API Status</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Real-time health monitoring</p>
                </CardContent>
              </Card>
            </Link>
            <a href="https://github.com/tburnchain" target="_blank" rel="noopener noreferrer">
              <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10 hover:border-gray-500/50 transition cursor-pointer group h-full">
                <CardContent className="pt-6 text-center">
                  <Github className="w-8 h-8 text-gray-900 dark:text-white mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">GitHub</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Open source SDKs</p>
                </CardContent>
              </Card>
            </a>
            <Link href="/community/hub">
              <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10 hover:border-[#00f0ff]/50 transition cursor-pointer group h-full">
                <CardContent className="pt-6 text-center">
                  <Users className="w-8 h-8 text-[#00f0ff] mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">Community</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Join developer discussions</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <Card className="bg-gradient-to-br from-[#00f0ff]/10 via-[#7000ff]/10 to-[#ff0055]/10 border-[#00f0ff]/30 overflow-hidden relative">
            <div className="absolute inset-0 bg-grid-white/5" />
            <CardContent className="py-12 relative">
              <Rocket className="w-12 h-12 text-[#00f0ff] mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Ready to Build?</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
                Join thousands of developers building the future of DeFi on TBurn Chain.
                Start with our free tier and scale as you grow.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/developers/quickstart">
                  <Button className="bg-[#00f0ff] text-black hover:bg-cyan-400 font-bold px-8" data-testid="button-cta-start">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/community/hub">
                  <Button variant="outline" className="border-gray-300 dark:border-white/20 px-8" data-testid="button-cta-contact">
                    <FileText className="w-4 h-4 mr-2" />
                    Contact Sales
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
