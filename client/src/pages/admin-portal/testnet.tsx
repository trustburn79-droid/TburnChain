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
        title: t("adminTestnet.faucetRequestSubmitted"),
        description: t("adminTestnet.testTburnWillBeSent"),
      });
      setFaucetAddress("");
    },
    onError: () => {
      toast({
        title: t("adminTestnet.faucetRequestFailed"),
        description: t("adminTestnet.tryAgainCheckAddress"),
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
      toast({ title: t("adminTestnet.dataRefreshed"), description: t("adminTestnet.testnetDataUpdated") });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast, t]);

  const handleCopy = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: t("adminTestnet.copiedLabel"), description: t("adminTestnet.copiedToClipboardLabel") });
  }, [toast, t]);

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
        toast({ title: t("adminTestnet.networkAdded"), description: t("adminTestnet.networkAddedDesc") });
      } catch (error) {
        toast({ title: t("adminTestnet.failedAddNetwork"), description: t("adminTestnet.addManuallyDesc"), variant: "destructive" });
      }
    } else {
      setShowAddToWallet(true);
    }
  }, [toast, t]);

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
    toast({ title: t("adminTestnet.configExported"), description: t("adminTestnet.configExportedDesc") });
  }, [nodes, stats, toast, t]);

  const handleFaucetSubmit = useCallback(() => {
    if (!faucetAddress || !faucetAddress.startsWith("0x") || faucetAddress.length !== 42) {
      toast({ title: t("adminTestnet.invalidAddress"), description: t("adminTestnet.enterValidAddress"), variant: "destructive" });
      return;
    }
    faucetMutation.mutate({ address: faucetAddress, amount: parseInt(faucetAmount) });
  }, [faucetAddress, faucetAmount, faucetMutation, toast, t]);

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
            <h2 className="text-xl font-bold mb-2">{t("adminTestnet.failedLoadTestnet")}</h2>
            <p className="text-muted-foreground mb-4">{t("adminTestnet.unableConnectServices")}</p>
            <Button onClick={() => refetch()} data-testid="button-retry">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminTestnet.retry")}
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
              {t("adminTestnet.pageTitle")}
            </h1>
            <p className="text-muted-foreground" data-testid="text-page-subtitle">
              {t("adminTestnet.chainId")}: {TESTNET_CONFIG.chainId} | {t("adminTestnet.pageSubtitle")}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} data-testid="button-refresh">
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {t("adminTestnet.refresh")}
            </Button>
            <Button variant="outline" onClick={handleExportConfig} data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              {t("adminTestnet.exportConfig")}
            </Button>
            <Button onClick={handleAddToWallet} data-testid="button-add-wallet">
              <Wallet className="h-4 w-4 mr-2" />
              {t("adminTestnet.addToWallet")}
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
                    {t("adminTestnet.networkStatus")}: <Badge className={getStatusColor(stats.networkStatus || "healthy")}>{t(`adminTestnet.${stats.networkStatus || "healthy"}`)}</Badge>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {onlineNodes}/{nodes.length} {t("adminTestnet.nodesOnline")} | {t("adminTestnet.slaUptime")}: {(stats.slaUptime / 100).toFixed(2)}%
                  </p>
                </div>
              </div>
              <div className="flex gap-4 flex-wrap">
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.blockHeight.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{t("adminTestnet.blockHeight")}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.averageTps.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{t("adminTestnet.avgTps")}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.averageBlockTime}s</p>
                  <p className="text-xs text-muted-foreground">{t("adminTestnet.avgBlockTime")}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.activeValidators}/{stats.totalValidators}</p>
                  <p className="text-xs text-muted-foreground">{t("adminTestnet.validators")}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover-elevate cursor-pointer" onClick={() => window.open(TESTNET_CONFIG.rpcUrl, "_blank")} data-testid="card-rpc-endpoint">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">{t("adminTestnet.rpcEndpoint")}</CardTitle>
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
              <p className="text-xs text-muted-foreground mt-2">{t("adminTestnet.jsonRpcApi")}</p>
            </CardContent>
          </Card>

          <Card className="hover-elevate cursor-pointer" onClick={() => window.open(TESTNET_CONFIG.explorerUrl, "_blank")} data-testid="card-explorer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">{t("adminTestnet.blockExplorer")}</CardTitle>
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
              <p className="text-xs text-muted-foreground mt-2">{t("adminTestnet.txBlockExplorer")}</p>
            </CardContent>
          </Card>

          <Card data-testid="card-faucet-balance">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">{t("adminTestnet.faucetBalance")}</CardTitle>
              <Droplets className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-24" /> : (
                <>
                  <div className="text-2xl font-bold">{stats.faucetBalance}</div>
                  <p className="text-xs text-muted-foreground">{t("adminTestnet.testTburnAvailableNew")}</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-network-stats">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">{t("adminTestnet.uniqueAddresses")}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-24" /> : (
                <>
                  <div className="text-2xl font-bold">{stats.uniqueAddresses.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">{stats.contractsDeployed.toLocaleString()} {t("adminTestnet.contractsDeployedLabel")}</p>
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
              {t("adminTestnet.tabOverview")}
            </TabsTrigger>
            <TabsTrigger value="nodes" data-testid="tab-nodes">
              <Server className="h-4 w-4 mr-2" />
              {t("adminTestnet.tabNodes")}
              <Badge variant="secondary" className="ml-2 h-5 px-1.5">{nodes.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="faucet" data-testid="tab-faucet">
              <Droplets className="h-4 w-4 mr-2" />
              {t("adminTestnet.tabFaucet")}
            </TabsTrigger>
            <TabsTrigger value="endpoints" data-testid="tab-endpoints">
              <Link className="h-4 w-4 mr-2" />
              {t("adminTestnet.tabEndpoints")}
            </TabsTrigger>
            <TabsTrigger value="config" data-testid="tab-config">
              <Settings className="h-4 w-4 mr-2" />
              {t("adminTestnet.tabConfig")}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card data-testid="card-total-transactions">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                  <CardTitle className="text-sm font-medium">{t("adminTestnet.totalTransactions")}</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalTransactions.toLocaleString()}</div>
                  <div className="flex items-center gap-1 text-xs text-green-500">
                    <ArrowUpRight className="h-3 w-3" />
                    {t("adminTestnet.fromYesterday")}
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-peak-tps">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                  <CardTitle className="text-sm font-medium">{t("adminTestnet.peakTps")}</CardTitle>
                  <Zap className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.peakTps.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">{t("adminTestnet.achievedStressTest")}</p>
                </CardContent>
              </Card>

              <Card data-testid="card-pending-tx">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                  <CardTitle className="text-sm font-medium">{t("adminTestnet.pendingTx")}</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingTransactions}</div>
                  <p className="text-xs text-muted-foreground">{t("adminTestnet.gasPrice")}: {stats.gasPrice} TBURN</p>
                </CardContent>
              </Card>

              <Card data-testid="card-faucet-requests">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                  <CardTitle className="text-sm font-medium">{t("adminTestnet.faucetRequests24h")}</CardTitle>
                  <Droplets className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.faucetRequests24h.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">{t("adminTestnet.tburnPerRequest")}</p>
                </CardContent>
              </Card>

              <Card data-testid="card-bridge-volume">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                  <CardTitle className="text-sm font-medium">{t("adminTestnet.bridgeVolume")}</CardTitle>
                  <Layers className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.bridgeVolume} TBURN</div>
                  <p className="text-xs text-muted-foreground">{t("adminTestnet.crossChainTransfers")}</p>
                </CardContent>
              </Card>

              <Card data-testid="card-network-hash">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                  <CardTitle className="text-sm font-medium">{t("adminTestnet.networkSecurity")}</CardTitle>
                  <Shield className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.networkHashrate}</div>
                  <p className="text-xs text-muted-foreground">{t("adminTestnet.quantumResistant")}</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card data-testid="card-recent-activity">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  {t("adminTestnet.recentFaucetActivity")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("adminTestnet.address")}</TableHead>
                      <TableHead>{t("adminTestnet.amount")}</TableHead>
                      <TableHead>{t("adminTestnet.status")}</TableHead>
                      <TableHead>{t("adminTestnet.time")}</TableHead>
                      <TableHead>{t("adminTestnet.txHash")}</TableHead>
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
                              {t("adminTestnet.view")}
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
                  placeholder={t("adminTestnet.searchNodes")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-nodes"
                />
              </div>
              <Badge variant="secondary">{onlineNodes} {t("adminTestnet.online")}</Badge>
              <Badge variant="outline">{nodes.length - onlineNodes} {t("adminTestnet.offlineSyncing")}</Badge>
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
                        <p className="text-muted-foreground">{t("adminTestnet.blockHeight")}</p>
                        <p className="font-medium">{node.blockHeight.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t("adminTestnet.peers")}</p>
                        <p className="font-medium">{node.peers}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t("adminTestnet.latency")}</p>
                        <p className="font-medium">{node.latency}ms</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t("adminTestnet.uptime")}</p>
                        <p className="font-medium">{node.uptime}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="text-xs text-muted-foreground">
                    {t("adminTestnet.version")}: {node.version}
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
                    {t("adminTestnet.requestTestTokens")}
                  </CardTitle>
                  <CardDescription>{t("adminTestnet.getTestTburn")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t("adminTestnet.walletAddress")}</Label>
                    <Input
                      placeholder="0x..."
                      value={faucetAddress}
                      onChange={(e) => setFaucetAddress(e.target.value)}
                      data-testid="input-faucet-address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminTestnet.amountTburn")}</Label>
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
                    {t("adminTestnet.requestTestTokens")}
                  </Button>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                  {t("adminTestnet.rateLimit24h")}
                </CardFooter>
              </Card>

              <Card data-testid="card-faucet-info">
                <CardHeader>
                  <CardTitle>{t("adminTestnet.faucetInfo")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">{t("adminTestnet.availableBalance")}</span>
                    <span className="font-bold">{stats.faucetBalance} TBURN</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">{t("adminTestnet.requestsToday")}</span>
                    <span className="font-bold">{stats.faucetRequests24h.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">{t("adminTestnet.maxPerRequest")}</span>
                    <span className="font-bold">1,000 TBURN</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">{t("adminTestnet.rateLimit")}</span>
                    <span className="font-bold">{t("adminTestnet.twentyFourHours")}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">{t("adminTestnet.status")}</span>
                    <Badge className="bg-green-500/10 text-green-500">{t("adminTestnet.operational")}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Faucet History */}
            <Card data-testid="card-faucet-history">
              <CardHeader>
                <CardTitle>{t("adminTestnet.recentRequests")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("adminTestnet.address")}</TableHead>
                      <TableHead>{t("adminTestnet.amount")}</TableHead>
                      <TableHead>{t("adminTestnet.status")}</TableHead>
                      <TableHead>{t("adminTestnet.timestamp")}</TableHead>
                      <TableHead>{t("adminTestnet.transaction")}</TableHead>
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
                              {t("adminTestnet.view")}
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
                    {t("adminTestnet.jsonRpcEndpoint")}
                  </CardTitle>
                  <CardDescription>{t("adminTestnet.primaryRpcEndpoint")}</CardDescription>
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
                    <Badge className="bg-green-500/10 text-green-500">{t("adminTestnet.active")}</Badge>
                    <span className="text-xs text-muted-foreground ml-2">{t("adminTestnet.latency")}: ~15ms</span>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-endpoint-explorer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    {t("adminTestnet.blockExplorer")}
                  </CardTitle>
                  <CardDescription>{t("adminTestnet.exploreTransactions")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t("adminTestnet.explorerUrl")}</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm bg-muted px-3 py-2 rounded">{TESTNET_CONFIG.explorerUrl}</code>
                      <Button variant="outline" size="icon" onClick={() => handleCopy(TESTNET_CONFIG.explorerUrl, "Explorer URL")} data-testid="button-copy-explorer-url">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline" onClick={() => window.open(TESTNET_CONFIG.explorerUrl, "_blank")} data-testid="button-open-explorer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {t("adminTestnet.openExplorer")}
                  </Button>
                </CardContent>
              </Card>

              <Card className="md:col-span-2" data-testid="card-network-config">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    {t("adminTestnet.networkConfiguration")}
                  </CardTitle>
                  <CardDescription>{t("adminTestnet.addTestnetToWallet")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">{t("adminTestnet.networkName")}</Label>
                      <p className="font-medium">{TESTNET_CONFIG.chainName}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">{t("adminTestnet.chainId")}</Label>
                      <p className="font-medium">{TESTNET_CONFIG.chainId}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">{t("adminTestnet.currencySymbol")}</Label>
                      <p className="font-medium">{TESTNET_CONFIG.nativeCurrency.symbol}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">{t("adminTestnet.decimals")}</Label>
                      <p className="font-medium">{TESTNET_CONFIG.nativeCurrency.decimals}</p>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex gap-2">
                    <Button onClick={handleAddToWallet} data-testid="button-add-network">
                      <Wallet className="h-4 w-4 mr-2" />
                      {t("adminTestnet.addToMetamask")}
                    </Button>
                    <Button variant="outline" onClick={handleExportConfig} data-testid="button-export-json">
                      <FileJson className="h-4 w-4 mr-2" />
                      {t("adminTestnet.exportAsJson")}
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
                  <CardTitle>{t("adminTestnet.networkParams")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">{t("adminTestnet.chainId")}</span>
                    <code className="bg-muted px-2 py-1 rounded">{TESTNET_CONFIG.chainId}</code>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">{t("adminTestnet.avgBlockTime")}</span>
                    <span>{stats.averageBlockTime}s</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">{t("adminTestnet.gasPrice")}</span>
                    <span>{stats.gasPrice} TBURN</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">{t("adminTestnet.validators")}</span>
                    <span>{stats.activeValidators}/{stats.totalValidators}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">{t("adminTestnet.consensus")}</span>
                    <Badge>BFT + PoS</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-config-features">
                <CardHeader>
                  <CardTitle>{t("adminTestnet.enabledFeatures")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="flex items-center gap-2"><Shield className="h-4 w-4" /> {t("adminTestnet.quantumResistantFeature")}</span>
                    <Badge className="bg-green-500/10 text-green-500">{t("adminTestnet.enabled")}</Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="flex items-center gap-2"><Layers className="h-4 w-4" /> {t("adminTestnet.bridgeSupport")}</span>
                    <Badge className="bg-green-500/10 text-green-500">{t("adminTestnet.enabled")}</Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="flex items-center gap-2"><Cpu className="h-4 w-4" /> {t("adminTestnet.aiOrchestration")}</span>
                    <Badge className="bg-green-500/10 text-green-500">{t("adminTestnet.enabled")}</Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="flex items-center gap-2"><Database className="h-4 w-4" /> {t("adminTestnet.dynamicSharding")}</span>
                    <Badge className="bg-green-500/10 text-green-500">{t("adminTestnet.enabled")}</Badge>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="flex items-center gap-2"><Gauge className="h-4 w-4" /> {t("adminTestnet.highTpsMode")}</span>
                    <Badge className="bg-green-500/10 text-green-500">{t("adminTestnet.enabled")}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Code Examples */}
            <Card data-testid="card-code-examples">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  {t("adminTestnet.quickStartExamples")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("adminTestnet.connectEthers")}</Label>
                  <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
{`import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('${TESTNET_CONFIG.rpcUrl}');
const blockNumber = await provider.getBlockNumber();
console.log('Current block:', blockNumber);`}
                  </pre>
                </div>
                <div className="space-y-2">
                  <Label>{t("adminTestnet.addNetworkMetamask")}</Label>
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
                  <span>{t("adminTestnet.status")}</span>
                  <Badge className={getStatusColor(selectedNode.status)}>{selectedNode.status}</Badge>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("adminTestnet.blockHeight")}</p>
                    <p className="font-medium">{selectedNode.blockHeight.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("adminTestnet.peers")}</p>
                    <p className="font-medium">{selectedNode.peers}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("adminTestnet.latency")}</p>
                    <p className="font-medium">{selectedNode.latency}ms</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("adminTestnet.uptime")}</p>
                    <p className="font-medium">{selectedNode.uptime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("adminTestnet.version")}</p>
                    <p className="font-medium">{selectedNode.version}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("adminTestnet.lastSeen")}</p>
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
            <DialogTitle>{t("adminTestnet.addTestnetManually")}</DialogTitle>
            <DialogDescription>{t("adminTestnet.noWalletDetected")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{t("adminTestnet.networkName")}</Label>
              <div className="col-span-3">
                <code className="bg-muted px-2 py-1 rounded text-sm">{TESTNET_CONFIG.chainName}</code>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{t("adminTestnet.rpcUrlLabel")}</Label>
              <div className="col-span-3">
                <code className="bg-muted px-2 py-1 rounded text-sm">{TESTNET_CONFIG.rpcUrl}</code>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{t("adminTestnet.chainId")}</Label>
              <div className="col-span-3">
                <code className="bg-muted px-2 py-1 rounded text-sm">{TESTNET_CONFIG.chainId}</code>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{t("adminTestnet.symbol")}</Label>
              <div className="col-span-3">
                <code className="bg-muted px-2 py-1 rounded text-sm">{TESTNET_CONFIG.nativeCurrency.symbol}</code>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{t("adminTestnet.explorer")}</Label>
              <div className="col-span-3">
                <code className="bg-muted px-2 py-1 rounded text-sm">{TESTNET_CONFIG.explorerUrl}</code>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddToWallet(false)}>{t("adminTestnet.close")}</Button>
            <Button onClick={handleExportConfig}>{t("adminTestnet.exportConfig")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
