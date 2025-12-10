import { 
  Server, Shield, Network, LineChart, Zap, Book, HeartPulse, 
  Github, FileText, Copy, Check, Terminal, Globe, Activity, 
  Clock, Wifi, WifiOff, RefreshCw, ExternalLink, Key, 
  CheckCircle2, AlertCircle, Play, Pause, Settings, Code2
} from "lucide-react";
import { SiTypescript, SiPython, SiRust, SiGo } from "react-icons/si";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

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

const networks: Record<string, NetworkConfig> = {
  mainnet: {
    name: "TBurn Mainnet",
    chainId: 7777,
    symbol: "TBURN",
    rpcUrl: "https://rpc.tburn.io",
    wsUrl: "wss://ws.tburn.io",
    explorerUrl: "https://tburn.io/scan",
    color: "#ff6b35"
  },
  testnet: {
    name: "TBurn Testnet", 
    chainId: 7778,
    symbol: "tTBURN",
    rpcUrl: "https://testnet-rpc.tburn.io",
    wsUrl: "wss://testnet-ws.tburn.io",
    explorerUrl: "https://tburn.io/testnet-scan",
    color: "#ffd700"
  }
};

const rpcNodes: RpcNode[] = [
  { id: "node-1", name: "TBurn Primary", url: "https://rpc.tburn.io", region: "US-East", status: "online", latency: 12, blockHeight: 28350000, version: "1.0.0", load: 45 },
  { id: "node-2", name: "TBurn Secondary", url: "https://rpc2.tburn.io", region: "EU-West", status: "online", latency: 28, blockHeight: 28350000, version: "1.0.0", load: 32 },
  { id: "node-3", name: "TBurn Asia", url: "https://asia.rpc.tburn.io", region: "AP-Tokyo", status: "online", latency: 45, blockHeight: 28349999, version: "1.0.0", load: 68 },
  { id: "node-4", name: "TBurn Archive", url: "https://archive.rpc.tburn.io", region: "US-West", status: "online", latency: 35, blockHeight: 28350000, version: "1.0.0", load: 22 },
];

const rpcMethods = [
  { category: "Block", methods: ["eth_blockNumber", "eth_getBlockByHash", "eth_getBlockByNumber", "eth_getBlockTransactionCountByHash"] },
  { category: "Transaction", methods: ["eth_sendRawTransaction", "eth_getTransactionByHash", "eth_getTransactionReceipt", "eth_estimateGas"] },
  { category: "Account", methods: ["eth_getBalance", "eth_getCode", "eth_getStorageAt", "eth_getTransactionCount"] },
  { category: "Contract", methods: ["eth_call", "eth_getLogs", "eth_getFilterLogs", "eth_newFilter"] },
  { category: "Network", methods: ["eth_chainId", "eth_gasPrice", "eth_syncing", "net_version"] },
  { category: "TBurn Custom", methods: ["tburn_getTrustScore", "tburn_getValidatorSet", "tburn_getBurnStats", "tburn_getShardInfo"] },
];

export default function RpcProviders() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedNetwork, setSelectedNetwork] = useState<'mainnet' | 'testnet'>('mainnet');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; latency?: number; blockHeight?: number; error?: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");

  const { data: networkStats } = useQuery<{ success: boolean; data: any }>({
    queryKey: ['/api/public/v1/network/stats'],
    refetchInterval: 10000,
  });

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast({ title: "Copied!", description: "Code copied to clipboard" });
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
          blockHeight: data.data?.blockHeight || 28350000
        });
        toast({ title: "Connection Successful", description: `Latency: ${latency}ms` });
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
  const currentBlockHeight = networkStats?.data?.blockHeight || 28350000;

  return (
    <main className="flex-grow relative z-10 bg-gray-50 dark:bg-transparent transition-colors">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden border-b border-gray-200 dark:border-white/5">
        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-[#00f0ff]/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-[#7000ff]/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-xs font-mono text-[#00f0ff] mb-6">
                <Server className="w-3 h-3" /> RPC Endpoints
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Enterprise RPC Infrastructure
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl mb-8">
                High-performance, geo-distributed RPC endpoints with 99.99% uptime SLA. 
                Built for enterprise-scale blockchain applications.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button 
                  className="bg-[#00f0ff] text-black hover:bg-cyan-400 font-bold px-6"
                  onClick={() => setSelectedTab("quickstart")}
                  data-testid="button-get-api-key"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Get API Key
                </Button>
                <Link href="/developers/api">
                  <Button variant="outline" className="border-gray-300 dark:border-white/20" data-testid="button-view-docs">
                    <Book className="w-4 h-4 mr-2" />
                    View Documentation
                  </Button>
                </Link>
              </div>
            </div>

            {/* Live Status Card */}
            <Card className="w-full lg:w-96 bg-white/80 dark:bg-black/40 border-gray-200 dark:border-white/10 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-4 h-4 text-green-500" />
                    Live Network Status
                  </CardTitle>
                  <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                    Operational
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                    <div className="text-2xl font-mono font-bold text-gray-900 dark:text-white">
                      {currentBlockHeight.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">Block Height</div>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                    <div className="text-2xl font-mono font-bold text-[#00f0ff]">
                      {networkStats?.data?.tps || 2847}
                    </div>
                    <div className="text-xs text-gray-500">TPS</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Avg Latency</span>
                  </div>
                  <span className="font-mono text-green-500 font-bold">12ms</span>
                </div>

                <Button 
                  className="w-full"
                  variant="outline"
                  onClick={testConnection}
                  disabled={isTesting}
                  data-testid="button-test-connection"
                >
                  {isTesting ? (
                    <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Testing...</>
                  ) : (
                    <><Play className="w-4 h-4 mr-2" /> Test Connection</>
                  )}
                </Button>

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

      {/* Network Selector & Main Content */}
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          {/* Network Tabs */}
          <div className="flex items-center gap-4 mb-8">
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

          {/* Endpoint Configuration Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Server className="w-5 h-5 text-[#00f0ff]" />
                  HTTP RPC Endpoint
                </CardTitle>
                <CardDescription>For standard JSON-RPC requests</CardDescription>
              </CardHeader>
              <CardContent>
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
                    {copiedCode === 'rpc' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wifi className="w-5 h-5 text-[#7000ff]" />
                  WebSocket Endpoint
                </CardTitle>
                <CardDescription>For real-time subscriptions</CardDescription>
              </CardHeader>
              <CardContent>
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
                    {copiedCode === 'ws' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Network Configuration Quick Copy */}
          <Card className="mb-12 bg-white dark:bg-black/40 border-gray-200 dark:border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Network Configuration
              </CardTitle>
              <CardDescription>Add {network.name} to your wallet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                  <div className="text-xs text-gray-500 mb-1">Network Name</div>
                  <div className="font-mono text-sm text-gray-900 dark:text-white">{network.name}</div>
                </div>
                <div className="p-4 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                  <div className="text-xs text-gray-500 mb-1">Chain ID</div>
                  <div className="font-mono text-sm text-gray-900 dark:text-white">{network.chainId}</div>
                </div>
                <div className="p-4 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                  <div className="text-xs text-gray-500 mb-1">Currency Symbol</div>
                  <div className="font-mono text-sm text-gray-900 dark:text-white">{network.symbol}</div>
                </div>
                <div className="p-4 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                  <div className="text-xs text-gray-500 mb-1">Block Explorer</div>
                  <a href={network.explorerUrl} className="font-mono text-sm text-[#00f0ff] hover:underline flex items-center gap-1">
                    View <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RPC Nodes Status */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Global RPC Nodes</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {rpcNodes.map((node) => (
              <Card key={node.id} className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${node.status === 'online' ? 'bg-green-500' : node.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`} />
                      <span className="font-medium text-gray-900 dark:text-white text-sm">{node.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">{node.region}</Badge>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Latency</span>
                      <span className={`font-mono ${node.latency < 30 ? 'text-green-500' : node.latency < 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {node.latency}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Block</span>
                      <span className="font-mono text-gray-900 dark:text-white">{node.blockHeight.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Load</span>
                      <span className="font-mono text-gray-900 dark:text-white">{node.load}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Supported RPC Methods */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Supported RPC Methods</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {rpcMethods.map((category) => (
              <Card key={category.category} className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-[#00f0ff]" />
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {category.methods.map((method) => (
                      <div 
                        key={method}
                        className="font-mono text-xs py-1 px-2 rounded bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 cursor-pointer transition flex items-center justify-between group"
                        onClick={() => copyToClipboard(method, method)}
                      >
                        <span>{method}</span>
                        <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
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
      <section className="py-16 px-6 bg-gray-100 dark:bg-white/5 border-y border-gray-200 dark:border-white/5">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center">API Plans</h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include access to our global RPC infrastructure.
          </p>
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10 text-center">
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Free</h3>
                <div className="text-3xl font-mono text-[#00f0ff] font-bold mb-1">20</div>
                <p className="text-xs text-gray-500 mb-4">requests/min</p>
                <div className="text-2xl font-mono text-gray-900 dark:text-white font-bold mb-1">1,000</div>
                <p className="text-xs text-gray-500 mb-6">requests/day</p>
                <div className="text-xl font-bold text-gray-900 dark:text-white mb-4">$0</div>
                <Button variant="outline" className="w-full" data-testid="button-plan-free">Get Started</Button>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black/40 border-[#7000ff]/30 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#7000ff]" />
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold text-[#7000ff] mb-4">Basic</h3>
                <div className="text-3xl font-mono text-gray-900 dark:text-white font-bold mb-1">100</div>
                <p className="text-xs text-gray-500 mb-4">requests/min</p>
                <div className="text-2xl font-mono text-gray-900 dark:text-white font-bold mb-1">10,000</div>
                <p className="text-xs text-gray-500 mb-6">requests/day</p>
                <div className="text-xl font-bold text-gray-900 dark:text-white mb-4">$100<span className="text-sm font-normal text-gray-500">/mo</span></div>
                <Button className="w-full bg-[#7000ff] hover:bg-purple-600" data-testid="button-plan-basic">Subscribe</Button>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black/40 border-[#00f0ff]/30 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#00f0ff]" />
              <Badge className="absolute top-4 right-4 bg-[#00f0ff] text-black">Popular</Badge>
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold text-[#00f0ff] mb-4">Pro</h3>
                <div className="text-3xl font-mono text-gray-900 dark:text-white font-bold mb-1">500</div>
                <p className="text-xs text-gray-500 mb-4">requests/min</p>
                <div className="text-2xl font-mono text-gray-900 dark:text-white font-bold mb-1">100,000</div>
                <p className="text-xs text-gray-500 mb-6">requests/day</p>
                <div className="text-xl font-bold text-gray-900 dark:text-white mb-4">$500<span className="text-sm font-normal text-gray-500">/mo</span></div>
                <Button className="w-full bg-[#00f0ff] hover:bg-cyan-400 text-black" data-testid="button-plan-pro">Subscribe</Button>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black/40 border-[#ffd700]/30 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#ffd700]" />
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold text-[#ffd700] mb-4">Enterprise</h3>
                <div className="text-3xl font-mono text-gray-900 dark:text-white font-bold mb-1">Unlimited</div>
                <p className="text-xs text-gray-500 mb-4">requests/min</p>
                <div className="text-2xl font-mono text-gray-900 dark:text-white font-bold mb-1">Unlimited</div>
                <p className="text-xs text-gray-500 mb-6">requests/day</p>
                <div className="text-xl font-bold text-gray-900 dark:text-white mb-4">Custom</div>
                <Button variant="outline" className="w-full border-[#ffd700] text-[#ffd700] hover:bg-[#ffd700]/10" data-testid="button-plan-enterprise">Contact Sales</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* SDK Examples */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Quick Start</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Get started with TBurn Chain in your preferred language</p>
          
          <Tabs defaultValue="javascript" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="javascript" className="gap-2">
                <SiTypescript className="w-4 h-4" /> JavaScript
              </TabsTrigger>
              <TabsTrigger value="python" className="gap-2">
                <SiPython className="w-4 h-4" /> Python
              </TabsTrigger>
              <TabsTrigger value="curl" className="gap-2">
                <Terminal className="w-4 h-4" /> cURL
              </TabsTrigger>
            </TabsList>

            <TabsContent value="javascript">
              <Card className="bg-[#0d0d12] border-gray-800 overflow-hidden">
                <div className="bg-gray-900 border-b border-gray-800 p-3 flex items-center justify-between">
                  <span className="text-gray-400 text-sm font-mono">ethers.js / web3.js</span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => copyToClipboard(`import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('${network.rpcUrl}');

// Get latest block
const blockNumber = await provider.getBlockNumber();
console.log('Current block:', blockNumber);

// Get balance
const balance = await provider.getBalance('0x...');
console.log('Balance:', ethers.formatEther(balance), '${network.symbol}');

// Send transaction
const wallet = new ethers.Wallet(privateKey, provider);
const tx = await wallet.sendTransaction({
  to: '0x...',
  value: ethers.parseEther('1.0')
});
await tx.wait();`, 'js')}
                    data-testid="button-copy-js"
                  >
                    {copiedCode === 'js' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <pre className="p-4 text-gray-300 text-sm font-mono overflow-x-auto">
{`import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('${network.rpcUrl}');

// Get latest block
const blockNumber = await provider.getBlockNumber();
console.log('Current block:', blockNumber);

// Get balance
const balance = await provider.getBalance('0x...');
console.log('Balance:', ethers.formatEther(balance), '${network.symbol}');

// Send transaction
const wallet = new ethers.Wallet(privateKey, provider);
const tx = await wallet.sendTransaction({
  to: '0x...',
  value: ethers.parseEther('1.0')
});
await tx.wait();`}
                </pre>
              </Card>
            </TabsContent>

            <TabsContent value="python">
              <Card className="bg-[#0d0d12] border-gray-800 overflow-hidden">
                <div className="bg-gray-900 border-b border-gray-800 p-3 flex items-center justify-between">
                  <span className="text-gray-400 text-sm font-mono">web3.py</span>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => copyToClipboard(`from web3 import Web3

w3 = Web3(Web3.HTTPProvider('${network.rpcUrl}'))

# Check connection
print(f"Connected: {w3.is_connected()}")

# Get latest block
block = w3.eth.get_block('latest')
print(f"Block: {block.number}")

# Get balance
balance = w3.eth.get_balance('0x...')
print(f"Balance: {w3.from_wei(balance, 'ether')} ${network.symbol}")`, 'py')}
                    data-testid="button-copy-py"
                  >
                    {copiedCode === 'py' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <pre className="p-4 text-gray-300 text-sm font-mono overflow-x-auto">
{`from web3 import Web3

w3 = Web3(Web3.HTTPProvider('${network.rpcUrl}'))

# Check connection
print(f"Connected: {w3.is_connected()}")

# Get latest block
block = w3.eth.get_block('latest')
print(f"Block: {block.number}")

# Get balance
balance = w3.eth.get_balance('0x...')
print(f"Balance: {w3.from_wei(balance, 'ether')} ${network.symbol}")`}
                </pre>
              </Card>
            </TabsContent>

            <TabsContent value="curl">
              <Card className="bg-[#0d0d12] border-gray-800 overflow-hidden">
                <div className="bg-gray-900 border-b border-gray-800 p-3 flex items-center justify-between">
                  <span className="text-gray-400 text-sm font-mono">bash</span>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => copyToClipboard(`# Get latest block number
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
  -d '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x...","latest"],"id":1}'`, 'curl')}
                    data-testid="button-copy-curl"
                  >
                    {copiedCode === 'curl' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <pre className="p-4 text-gray-300 text-sm font-mono overflow-x-auto">
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
  -d '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x...","latest"],"id":1}'`}
                </pre>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-16 px-6 bg-gray-100 dark:bg-white/5 border-t border-gray-200 dark:border-white/5">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">Developer Resources</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/developers/docs">
              <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10 hover:border-[#7000ff]/50 transition cursor-pointer group h-full">
                <CardContent className="pt-6 text-center">
                  <Book className="w-10 h-10 text-[#7000ff] mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Documentation</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Comprehensive guides and API reference</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/network/status">
              <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10 hover:border-green-500/50 transition cursor-pointer group h-full">
                <CardContent className="pt-6 text-center">
                  <HeartPulse className="w-10 h-10 text-green-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">API Status</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Real-time network health monitoring</p>
                </CardContent>
              </Card>
            </Link>
            <a href="https://github.com/tburnchain" target="_blank" rel="noopener noreferrer">
              <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10 hover:border-gray-500/50 transition cursor-pointer group h-full">
                <CardContent className="pt-6 text-center">
                  <Github className="w-10 h-10 text-gray-900 dark:text-white mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">GitHub</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Open source SDKs and examples</p>
                </CardContent>
              </Card>
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <Card className="bg-gradient-to-br from-[#00f0ff]/10 to-[#7000ff]/10 border-[#00f0ff]/30">
            <CardContent className="py-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Ready to Build?</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
                Join thousands of developers building on TBurn Chain. Get started with our free tier today.
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
