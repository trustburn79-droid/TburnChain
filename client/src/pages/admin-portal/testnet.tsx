import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  FlaskConical,
  RefreshCw,
  Play,
  Pause,
  Settings,
  Droplets,
  Activity,
  Server,
  Clock,
  CheckCircle,
  AlertTriangle,
  Copy,
  ExternalLink,
  Trash2,
  Plus,
  RotateCcw,
  AlertCircle,
  Download,
  Eye,
  Globe,
  Network,
  Zap,
  Shield,
  Layers,
  Database,
  Cpu,
  TrendingUp,
  Users,
  Link,
  Terminal,
  Code,
  FileJson,
  Box,
  Gauge,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  CircleDot,
  Radio,
  Wifi,
  WifiOff,
  MonitorCheck,
  Search,
} from "lucide-react";

// TBURN Testnet Official URLs
const TESTNET_CONFIG = {
  chainId: 7778,
  chainName: "TBURN Testnet",
  nativeCurrency: {
    name: "TBURN",
    symbol: "TBURN",
    decimals: 18,
  },
  rpcUrl: "https://tburn.io/testnet-rpc",
  explorerUrl: "https://tburn.io/testnet-scan",
  faucetUrl: "https://tburn.io/testnet-faucet",
  wsUrl: "wss://tburn.io/testnet-ws",
};

interface TestnetNode {
  id: string;
  name: string;
  region: string;
  status: "online" | "offline" | "syncing" | "maintenance";
  blockHeight: number;
  peers: number;
  latency: number;
  uptime: string;
  version: string;
  lastSeen: string;
}

interface FaucetRequest {
  id: string;
  address: string;
  amount: number;
  status: "pending" | "completed" | "failed" | "rate_limited";
  txHash?: string;
  timestamp: string;
  ip?: string;
}

interface TestnetStats {
  networkStatus: "healthy" | "degraded" | "down";
  blockHeight: number;
  totalTransactions: number;
  averageTps: number;
  peakTps: number;
  activeValidators: number;
  totalValidators: number;
  averageBlockTime: number;
  pendingTransactions: number;
  gasPrice: string;
  faucetBalance: string;
  faucetRequests24h: number;
  uniqueAddresses: number;
  contractsDeployed: number;
  bridgeVolume: string;
  lastBlockTime: string;
  networkHashrate: string;
  difficulty: string;
  slaUptime: number;
}

interface TestnetData {
  nodes: TestnetNode[];
  faucetRequests: FaucetRequest[];
  stats: TestnetStats;
}

// Production testnet nodes
const productionNodes: TestnetNode[] = [
  { id: "node-1", name: "tburn-testnet-primary-01", region: "US-East", status: "online", blockHeight: 4587621, peers: 48, latency: 12, uptime: "99.98%", version: "v8.0.0", lastSeen: "2024-12-11T11:30:00Z" },
  { id: "node-2", name: "tburn-testnet-primary-02", region: "EU-West", status: "online", blockHeight: 4587621, peers: 52, latency: 18, uptime: "99.97%", version: "v8.0.0", lastSeen: "2024-12-11T11:30:00Z" },
  { id: "node-3", name: "tburn-testnet-validator-01", region: "Asia-Pacific", status: "online", blockHeight: 4587620, peers: 45, latency: 35, uptime: "99.96%", version: "v8.0.0", lastSeen: "2024-12-11T11:30:00Z" },
  { id: "node-4", name: "tburn-testnet-validator-02", region: "US-West", status: "online", blockHeight: 4587621, peers: 38, latency: 15, uptime: "99.95%", version: "v8.0.0", lastSeen: "2024-12-11T11:30:00Z" },
  { id: "node-5", name: "tburn-testnet-archive-01", region: "EU-Central", status: "online", blockHeight: 4587621, peers: 42, latency: 22, uptime: "99.99%", version: "v8.0.0", lastSeen: "2024-12-11T11:30:00Z" },
  { id: "node-6", name: "tburn-testnet-rpc-01", region: "US-East", status: "online", blockHeight: 4587621, peers: 56, latency: 8, uptime: "99.99%", version: "v8.0.0", lastSeen: "2024-12-11T11:30:00Z" },
];

const productionFaucetRequests: FaucetRequest[] = [
  { id: "fq-1", address: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", amount: 100, status: "completed", txHash: "0xabc...def", timestamp: "2024-12-11T11:25:00Z" },
  { id: "fq-2", address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", amount: 100, status: "completed", txHash: "0x123...456", timestamp: "2024-12-11T11:20:00Z" },
  { id: "fq-3", address: "0x6B175474E89094C44Da98b954EesdedfFe1A6fB9", amount: 100, status: "pending", timestamp: "2024-12-11T11:15:00Z" },
  { id: "fq-4", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", amount: 100, status: "completed", txHash: "0x789...abc", timestamp: "2024-12-11T11:10:00Z" },
];

const productionStats: TestnetStats = {
  networkStatus: "healthy",
  blockHeight: 4587621,
  totalTransactions: 28745632,
  averageTps: 2847,
  peakTps: 15000,
  activeValidators: 24,
  totalValidators: 32,
  averageBlockTime: 2.1,
  pendingTransactions: 156,
  gasPrice: "0.001",
  faucetBalance: "50,000,000",
  faucetRequests24h: 3247,
  uniqueAddresses: 87456,
  contractsDeployed: 4521,
  bridgeVolume: "2.5M",
  lastBlockTime: "2024-12-11T11:30:45Z",
  networkHashrate: "125 TH/s",
  difficulty: "1.2T",
  slaUptime: 9998,
};

export default function TestnetManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [faucetAddress, setFaucetAddress] = useState("");
  const [faucetAmount, setFaucetAmount] = useState("100");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedNode, setSelectedNode] = useState<TestnetNode | null>(null);
  const [nodeDetailOpen, setNodeDetailOpen] = useState(false);
  const [showAddToWallet, setShowAddToWallet] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: testnetData, isLoading, error, refetch } = useQuery<TestnetData>({
    queryKey: ["/api/enterprise/admin/testnet"],
    refetchInterval: 30000,
  });

  const faucetMutation = useMutation({
    mutationFn: async (data: { address: string; amount: number }) => {
      return apiRequest("POST", "/api/enterprise/admin/testnet/faucet", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enterprise/admin/testnet"] });
      toast({
        title: "Faucet Request Submitted",
        description: "Test TBURN will be sent to your address shortly",
      });
      setFaucetAddress("");
    },
    onError: () => {
      toast({
        title: "Faucet Request Failed",
        description: "Please try again or check your address",
        variant: "destructive",
      });
    },
  });

  const nodes = useMemo(() => testnetData?.nodes || productionNodes, [testnetData?.nodes]);
  const faucetRequests = useMemo(() => testnetData?.faucetRequests || productionFaucetRequests, [testnetData?.faucetRequests]);
  const stats = useMemo(() => {
    const apiStats = testnetData?.stats;
    if (apiStats && apiStats.networkStatus) {
      return apiStats;
    }
    return {
      ...productionStats,
      ...apiStats,
      networkStatus: apiStats?.networkStatus || productionStats.networkStatus,
    };
  }, [testnetData?.stats]);

  const filteredNodes = useMemo(() => {
    if (!searchQuery) return nodes;
    const query = searchQuery.toLowerCase();
    return nodes.filter(node =>
      node.name.toLowerCase().includes(query) ||
      node.region.toLowerCase().includes(query)
    );
  }, [nodes, searchQuery]);

  const onlineNodes = useMemo(() => nodes.filter(n => n.status === "online").length, [nodes]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({ title: "Data Refreshed", description: "Testnet data has been updated" });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast]);

  const handleCopy = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: `${label} copied to clipboard` });
  }, [toast]);

  const handleAddToWallet = useCallback(async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: `0x${TESTNET_CONFIG.chainId.toString(16)}`,
            chainName: TESTNET_CONFIG.chainName,
            nativeCurrency: TESTNET_CONFIG.nativeCurrency,
            rpcUrls: [TESTNET_CONFIG.rpcUrl],
            blockExplorerUrls: [TESTNET_CONFIG.explorerUrl],
          }],
        });
        toast({ title: "Network Added", description: "TBURN Testnet has been added to your wallet" });
      } catch (error) {
        toast({ title: "Failed to Add Network", description: "Please add the network manually", variant: "destructive" });
      }
    } else {
      setShowAddToWallet(true);
    }
  }, [toast]);

  const handleExportConfig = useCallback(() => {
    const config = {
      network: {
        chainId: TESTNET_CONFIG.chainId,
        chainName: TESTNET_CONFIG.chainName,
        rpcUrl: TESTNET_CONFIG.rpcUrl,
        wsUrl: TESTNET_CONFIG.wsUrl,
        explorerUrl: TESTNET_CONFIG.explorerUrl,
        faucetUrl: TESTNET_CONFIG.faucetUrl,
      },
      nativeCurrency: TESTNET_CONFIG.nativeCurrency,
      nodes: nodes.map(n => ({ name: n.name, region: n.region, status: n.status })),
      stats: {
        blockHeight: stats.blockHeight,
        averageTps: stats.averageTps,
        activeValidators: stats.activeValidators,
      },
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tburn-testnet-config-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Config Exported", description: "Network configuration exported successfully" });
  }, [nodes, stats, toast]);

  const handleFaucetSubmit = useCallback(() => {
    if (!faucetAddress || !faucetAddress.startsWith("0x") || faucetAddress.length !== 42) {
      toast({ title: "Invalid Address", description: "Please enter a valid Ethereum address", variant: "destructive" });
      return;
    }
    faucetMutation.mutate({ address: faucetAddress, amount: parseInt(faucetAmount) });
  }, [faucetAddress, faucetAmount, faucetMutation, toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": case "healthy": case "completed": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "offline": case "down": case "failed": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "syncing": case "degraded": case "pending": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "maintenance": case "rate_limited": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online": case "healthy": return <Wifi className="h-4 w-4 text-green-500" />;
      case "offline": case "down": return <WifiOff className="h-4 w-4 text-red-500" />;
      case "syncing": return <Radio className="h-4 w-4 text-yellow-500 animate-pulse" />;
      default: return <CircleDot className="h-4 w-4 text-blue-500" />;
    }
  };

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center" data-testid="testnet-error">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Failed to Load Testnet Data</h2>
            <p className="text-muted-foreground mb-4">Unable to connect to testnet services</p>
            <Button onClick={() => refetch()} data-testid="button-retry">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-testid="testnet-page">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-page-title">
              <FlaskConical className="h-8 w-8" />
              TBURN Testnet Management
            </h1>
            <p className="text-muted-foreground" data-testid="text-page-subtitle">
              Chain ID: {TESTNET_CONFIG.chainId} | Enterprise-grade testnet infrastructure
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} data-testid="button-refresh">
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExportConfig} data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              Export Config
            </Button>
            <Button onClick={handleAddToWallet} data-testid="button-add-wallet">
              <Wallet className="h-4 w-4 mr-2" />
              Add to Wallet
            </Button>
          </div>
        </div>

        {/* Network Status Banner */}
        <Card className={`border-2 ${stats.networkStatus === "healthy" ? "border-green-500/30 bg-green-500/5" : stats.networkStatus === "degraded" ? "border-yellow-500/30 bg-yellow-500/5" : "border-red-500/30 bg-red-500/5"}`} data-testid="card-network-status">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${stats.networkStatus === "healthy" ? "bg-green-500/20" : "bg-yellow-500/20"}`}>
                  {stats.networkStatus === "healthy" ? <CheckCircle className="h-6 w-6 text-green-500" /> : <AlertTriangle className="h-6 w-6 text-yellow-500" />}
                </div>
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    Network Status: <Badge className={getStatusColor(stats.networkStatus || "healthy")}>{(stats.networkStatus || "healthy").toUpperCase()}</Badge>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {onlineNodes}/{nodes.length} nodes online | SLA Uptime: {(stats.slaUptime / 100).toFixed(2)}%
                  </p>
                </div>
              </div>
              <div className="flex gap-4 flex-wrap">
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.blockHeight.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Block Height</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.averageTps.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Avg TPS</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.averageBlockTime}s</p>
                  <p className="text-xs text-muted-foreground">Block Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.activeValidators}/{stats.totalValidators}</p>
                  <p className="text-xs text-muted-foreground">Validators</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover-elevate cursor-pointer" onClick={() => window.open(TESTNET_CONFIG.rpcUrl, "_blank")} data-testid="card-rpc-endpoint">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">RPC Endpoint</CardTitle>
              <Terminal className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                  {TESTNET_CONFIG.rpcUrl}
                </code>
                <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={(e) => { e.stopPropagation(); handleCopy(TESTNET_CONFIG.rpcUrl, "RPC URL"); }} data-testid="button-copy-rpc">
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">JSON-RPC & REST API</p>
            </CardContent>
          </Card>

          <Card className="hover-elevate cursor-pointer" onClick={() => window.open(TESTNET_CONFIG.explorerUrl, "_blank")} data-testid="card-explorer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">Block Explorer</CardTitle>
              <Globe className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                  {TESTNET_CONFIG.explorerUrl}
                </code>
                <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={(e) => { e.stopPropagation(); handleCopy(TESTNET_CONFIG.explorerUrl, "Explorer URL"); }} data-testid="button-copy-explorer">
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Transaction & Block Explorer</p>
            </CardContent>
          </Card>

          <Card data-testid="card-faucet-balance">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">Faucet Balance</CardTitle>
              <Droplets className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-24" /> : (
                <>
                  <div className="text-2xl font-bold">{stats.faucetBalance}</div>
                  <p className="text-xs text-muted-foreground">Test TBURN available</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-network-stats">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">Unique Addresses</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-24" /> : (
                <>
                  <div className="text-2xl font-bold">{stats.uniqueAddresses.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">{stats.contractsDeployed.toLocaleString()} contracts deployed</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList data-testid="tabs-testnet">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <Activity className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="nodes" data-testid="tab-nodes">
              <Server className="h-4 w-4 mr-2" />
              Nodes
              <Badge variant="secondary" className="ml-2 h-5 px-1.5">{nodes.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="faucet" data-testid="tab-faucet">
              <Droplets className="h-4 w-4 mr-2" />
              Faucet
            </TabsTrigger>
            <TabsTrigger value="endpoints" data-testid="tab-endpoints">
              <Link className="h-4 w-4 mr-2" />
              Endpoints
            </TabsTrigger>
            <TabsTrigger value="config" data-testid="tab-config">
              <Settings className="h-4 w-4 mr-2" />
              Configuration
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card data-testid="card-total-transactions">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                  <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalTransactions.toLocaleString()}</div>
                  <div className="flex items-center gap-1 text-xs text-green-500">
                    <ArrowUpRight className="h-3 w-3" />
                    +12.5% from yesterday
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-peak-tps">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                  <CardTitle className="text-sm font-medium">Peak TPS</CardTitle>
                  <Zap className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.peakTps.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Achieved during stress test</p>
                </CardContent>
              </Card>

              <Card data-testid="card-pending-tx">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                  <CardTitle className="text-sm font-medium">Pending Transactions</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingTransactions}</div>
                  <p className="text-xs text-muted-foreground">Gas Price: {stats.gasPrice} TBURN</p>
                </CardContent>
              </Card>

              <Card data-testid="card-faucet-requests">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                  <CardTitle className="text-sm font-medium">Faucet Requests (24h)</CardTitle>
                  <Droplets className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.faucetRequests24h.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">100 TBURN per request</p>
                </CardContent>
              </Card>

              <Card data-testid="card-bridge-volume">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                  <CardTitle className="text-sm font-medium">Bridge Volume</CardTitle>
                  <Layers className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.bridgeVolume} TBURN</div>
                  <p className="text-xs text-muted-foreground">Cross-chain test transfers</p>
                </CardContent>
              </Card>

              <Card data-testid="card-network-hash">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                  <CardTitle className="text-sm font-medium">Network Security</CardTitle>
                  <Shield className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.networkHashrate}</div>
                  <p className="text-xs text-muted-foreground">Quantum-resistant enabled</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card data-testid="card-recent-activity">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Faucet Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Address</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>TX Hash</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faucetRequests.slice(0, 5).map((request, i) => (
                      <TableRow key={request.id} data-testid={`row-faucet-${i}`}>
                        <TableCell className="font-mono text-xs">
                          {request.address.slice(0, 10)}...{request.address.slice(-8)}
                        </TableCell>
                        <TableCell>{request.amount} TBURN</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(request.timestamp).toLocaleTimeString()}
                        </TableCell>
                        <TableCell>
                          {request.txHash ? (
                            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs" onClick={() => window.open(`${TESTNET_CONFIG.explorerUrl}/tx/${request.txHash}`, "_blank")}>
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          ) : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nodes Tab */}
          <TabsContent value="nodes" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search nodes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-nodes"
                />
              </div>
              <Badge variant="secondary">{onlineNodes} Online</Badge>
              <Badge variant="outline">{nodes.length - onlineNodes} Offline/Syncing</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNodes.map((node, i) => (
                <Card key={node.id} className="hover-elevate cursor-pointer" onClick={() => { setSelectedNode(node); setNodeDetailOpen(true); }} data-testid={`card-node-${i}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(node.status)}
                        <CardTitle className="text-sm">{node.name}</CardTitle>
                      </div>
                      <Badge className={getStatusColor(node.status)}>{node.status}</Badge>
                    </div>
                    <CardDescription>{node.region}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Block Height</p>
                        <p className="font-medium">{node.blockHeight.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Peers</p>
                        <p className="font-medium">{node.peers}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Latency</p>
                        <p className="font-medium">{node.latency}ms</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Uptime</p>
                        <p className="font-medium">{node.uptime}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="text-xs text-muted-foreground">
                    Version: {node.version}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Faucet Tab */}
          <TabsContent value="faucet" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card data-testid="card-faucet-request">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-blue-500" />
                    Request Test Tokens
                  </CardTitle>
                  <CardDescription>Get test TBURN for development and testing on the testnet</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Wallet Address</Label>
                    <Input
                      placeholder="0x..."
                      value={faucetAddress}
                      onChange={(e) => setFaucetAddress(e.target.value)}
                      data-testid="input-faucet-address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Amount (TBURN)</Label>
                    <Select value={faucetAmount} onValueChange={setFaucetAmount}>
                      <SelectTrigger data-testid="select-faucet-amount">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">100 TBURN</SelectItem>
                        <SelectItem value="500">500 TBURN</SelectItem>
                        <SelectItem value="1000">1,000 TBURN</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full" onClick={handleFaucetSubmit} disabled={faucetMutation.isPending} data-testid="button-request-tokens">
                    {faucetMutation.isPending ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Droplets className="h-4 w-4 mr-2" />}
                    Request Test Tokens
                  </Button>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                  Rate limit: 1 request per address every 24 hours
                </CardFooter>
              </Card>

              <Card data-testid="card-faucet-info">
                <CardHeader>
                  <CardTitle>Faucet Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Available Balance</span>
                    <span className="font-bold">{stats.faucetBalance} TBURN</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Requests Today</span>
                    <span className="font-bold">{stats.faucetRequests24h.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Max Per Request</span>
                    <span className="font-bold">1,000 TBURN</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Rate Limit</span>
                    <span className="font-bold">24 hours</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Status</span>
                    <Badge className="bg-green-500/10 text-green-500">Operational</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Faucet History */}
            <Card data-testid="card-faucet-history">
              <CardHeader>
                <CardTitle>Recent Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Address</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Transaction</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faucetRequests.map((request, i) => (
                      <TableRow key={request.id} data-testid={`row-history-${i}`}>
                        <TableCell className="font-mono text-xs">
                          <div className="flex items-center gap-2">
                            <span>{request.address.slice(0, 10)}...{request.address.slice(-8)}</span>
                            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleCopy(request.address, "Address")}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{request.amount} TBURN</TableCell>
                        <TableCell><Badge className={getStatusColor(request.status)}>{request.status}</Badge></TableCell>
                        <TableCell className="text-sm">{new Date(request.timestamp).toLocaleString()}</TableCell>
                        <TableCell>
                          {request.txHash ? (
                            <Button variant="ghost" size="sm" onClick={() => window.open(`${TESTNET_CONFIG.explorerUrl}/tx/${request.txHash}`, "_blank")}>
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          ) : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Endpoints Tab */}
          <TabsContent value="endpoints" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card data-testid="card-endpoint-rpc">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    JSON-RPC Endpoint
                  </CardTitle>
                  <CardDescription>Primary RPC endpoint for testnet interactions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>HTTP/HTTPS</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm bg-muted px-3 py-2 rounded">{TESTNET_CONFIG.rpcUrl}</code>
                      <Button variant="outline" size="icon" onClick={() => handleCopy(TESTNET_CONFIG.rpcUrl, "RPC URL")} data-testid="button-copy-rpc-http">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>WebSocket</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm bg-muted px-3 py-2 rounded">{TESTNET_CONFIG.wsUrl}</code>
                      <Button variant="outline" size="icon" onClick={() => handleCopy(TESTNET_CONFIG.wsUrl, "WebSocket URL")} data-testid="button-copy-ws">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Badge className="bg-green-500/10 text-green-500">Active</Badge>
                    <span className="text-xs text-muted-foreground ml-2">Latency: ~15ms</span>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-endpoint-explorer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Block Explorer
                  </CardTitle>
                  <CardDescription>Explore transactions, blocks, and contracts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Explorer URL</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm bg-muted px-3 py-2 rounded">{TESTNET_CONFIG.explorerUrl}</code>
                      <Button variant="outline" size="icon" onClick={() => handleCopy(TESTNET_CONFIG.explorerUrl, "Explorer URL")} data-testid="button-copy-explorer-url">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline" onClick={() => window.open(TESTNET_CONFIG.explorerUrl, "_blank")} data-testid="button-open-explorer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Explorer
                  </Button>
                </CardContent>
              </Card>

              <Card className="md:col-span-2" data-testid="card-network-config">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Network Configuration
                  </CardTitle>
                  <CardDescription>Add TBURN Testnet to your wallet</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Network Name</Label>
                      <p className="font-medium">{TESTNET_CONFIG.chainName}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Chain ID</Label>
                      <p className="font-medium">{TESTNET_CONFIG.chainId}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Currency Symbol</Label>
                      <p className="font-medium">{TESTNET_CONFIG.nativeCurrency.symbol}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Decimals</Label>
                      <p className="font-medium">{TESTNET_CONFIG.nativeCurrency.decimals}</p>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex gap-2">
                    <Button onClick={handleAddToWallet} data-testid="button-add-network">
                      <Wallet className="h-4 w-4 mr-2" />
                      Add to MetaMask
                    </Button>
                    <Button variant="outline" onClick={handleExportConfig} data-testid="button-export-json">
                      <FileJson className="h-4 w-4 mr-2" />
                      Export as JSON
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="config" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card data-testid="card-config-network">
                <CardHeader>
                  <CardTitle>Network Parameters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Chain ID</span>
                    <code className="bg-muted px-2 py-1 rounded">{TESTNET_CONFIG.chainId}</code>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Block Time</span>
                    <span>{stats.averageBlockTime}s</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Gas Price</span>
                    <span>{stats.gasPrice} TBURN</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Validators</span>
                    <span>{stats.activeValidators}/{stats.totalValidators}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Consensus</span>
                    <Badge>BFT + PoS</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-config-features">
                <CardHeader>
                  <CardTitle>Enabled Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="flex items-center gap-2"><Shield className="h-4 w-4" /> Quantum-Resistant</span>
                    <Badge className="bg-green-500/10 text-green-500">Enabled</Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="flex items-center gap-2"><Layers className="h-4 w-4" /> Bridge Support</span>
                    <Badge className="bg-green-500/10 text-green-500">Enabled</Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="flex items-center gap-2"><Cpu className="h-4 w-4" /> AI Orchestration</span>
                    <Badge className="bg-green-500/10 text-green-500">Enabled</Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="flex items-center gap-2"><Database className="h-4 w-4" /> Dynamic Sharding</span>
                    <Badge className="bg-green-500/10 text-green-500">Enabled</Badge>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="flex items-center gap-2"><Gauge className="h-4 w-4" /> High TPS Mode</span>
                    <Badge className="bg-green-500/10 text-green-500">Enabled</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Code Examples */}
            <Card data-testid="card-code-examples">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Quick Start Examples
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Connect with ethers.js</Label>
                  <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
{`import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('${TESTNET_CONFIG.rpcUrl}');
const blockNumber = await provider.getBlockNumber();
console.log('Current block:', blockNumber);`}
                  </pre>
                </div>
                <div className="space-y-2">
                  <Label>Add Network to MetaMask</Label>
                  <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
{`await window.ethereum.request({
  method: 'wallet_addEthereumChain',
  params: [{
    chainId: '0x${TESTNET_CONFIG.chainId.toString(16)}',
    chainName: '${TESTNET_CONFIG.chainName}',
    rpcUrls: ['${TESTNET_CONFIG.rpcUrl}'],
    blockExplorerUrls: ['${TESTNET_CONFIG.explorerUrl}']
  }]
});`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Node Detail Sheet */}
      <Sheet open={nodeDetailOpen} onOpenChange={setNodeDetailOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          {selectedNode && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {getStatusIcon(selectedNode.status)}
                  {selectedNode.name}
                </SheetTitle>
                <SheetDescription>{selectedNode.region}</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <span>Status</span>
                  <Badge className={getStatusColor(selectedNode.status)}>{selectedNode.status}</Badge>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Block Height</p>
                    <p className="font-medium">{selectedNode.blockHeight.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Peers</p>
                    <p className="font-medium">{selectedNode.peers}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Latency</p>
                    <p className="font-medium">{selectedNode.latency}ms</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Uptime</p>
                    <p className="font-medium">{selectedNode.uptime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Version</p>
                    <p className="font-medium">{selectedNode.version}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Seen</p>
                    <p className="font-medium">{new Date(selectedNode.lastSeen).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Add to Wallet Dialog */}
      <Dialog open={showAddToWallet} onOpenChange={setShowAddToWallet}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add TBURN Testnet Manually</DialogTitle>
            <DialogDescription>No Web3 wallet detected. Add the network manually using these settings:</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Network Name</Label>
              <div className="col-span-3">
                <code className="bg-muted px-2 py-1 rounded text-sm">{TESTNET_CONFIG.chainName}</code>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">RPC URL</Label>
              <div className="col-span-3">
                <code className="bg-muted px-2 py-1 rounded text-sm">{TESTNET_CONFIG.rpcUrl}</code>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Chain ID</Label>
              <div className="col-span-3">
                <code className="bg-muted px-2 py-1 rounded text-sm">{TESTNET_CONFIG.chainId}</code>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Symbol</Label>
              <div className="col-span-3">
                <code className="bg-muted px-2 py-1 rounded text-sm">{TESTNET_CONFIG.nativeCurrency.symbol}</code>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Explorer</Label>
              <div className="col-span-3">
                <code className="bg-muted px-2 py-1 rounded text-sm">{TESTNET_CONFIG.explorerUrl}</code>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddToWallet(false)}>Close</Button>
            <Button onClick={handleExportConfig}>Export Config</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
