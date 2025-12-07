import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  Blocks, 
  ArrowRightLeft, 
  Flame, 
  Clock,
  Zap,
  Activity,
  ChevronRight,
  Coins,
  Shield,
  TrendingUp,
  TrendingDown,
  Copy,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Timer,
  Database,
  Globe,
  BarChart3,
  Layers,
  Users,
  Search,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useScanWebSocket } from "../../hooks/useScanWebSocket";
import ScanLayout from "../../components/ScanLayout";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface NetworkStats {
  blockHeight: number;
  tps: number;
  avgBlockTime: number;
  totalTransactions: number;
  activeValidators: number;
  totalBurned: string;
  circulatingSupply: string;
  gasPrice: string;
  totalStaked: string;
  finality: string;
  shardCount: number;
  nodeCount: number;
  uptime: string;
  dexTvl: string;
  lendingTvl: string;
  stakingTvl: string;
}

interface Block {
  number: number;
  hash: string;
  parentHash: string;
  timestamp: number;
  transactions: number;
  gasUsed: number;
  gasLimit: number;
  validator: string;
  size: number;
}

interface Transaction {
  hash: string;
  blockNumber: number;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gasUsed: number | null;
  timestamp: number;
  status: string;
}

function generateTpsHistory() {
  const data = [];
  const now = Date.now();
  for (let i = 24; i >= 0; i--) {
    data.push({
      time: new Date(now - i * 3600000).toLocaleTimeString('en-US', { hour: '2-digit', timeZone: 'America/New_York' }),
      tps: Math.floor(Math.random() * 500) + 3000,
    });
  }
  return data;
}

type SearchType = 'address' | 'transaction' | 'block' | 'unknown';

function detectSearchType(query: string): { type: SearchType; value: string } {
  const trimmed = query.trim();
  
  // Check if it's a block number (all digits)
  if (/^\d+$/.test(trimmed)) {
    return { type: 'block', value: trimmed };
  }
  
  // Check if it's a block number with # prefix
  if (/^#\d+$/.test(trimmed)) {
    return { type: 'block', value: trimmed.slice(1) };
  }
  
  // Check if it's a transaction hash (0x + 64 hex chars)
  if (/^0x[a-fA-F0-9]{64}$/.test(trimmed)) {
    return { type: 'transaction', value: trimmed };
  }
  
  // Check if it's an address (0x + 40 hex chars)
  if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
    return { type: 'address', value: trimmed };
  }
  
  // Any 0x starting value - try to determine by length
  if (/^0x[a-fA-F0-9]+$/.test(trimmed)) {
    if (trimmed.length === 66) return { type: 'transaction', value: trimmed };
    if (trimmed.length === 42) return { type: 'address', value: trimmed };
  }
  
  return { type: 'unknown', value: trimmed };
}

export default function ScanHome() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isConnected, latestBlock, lastUpdate } = useScanWebSocket();
  const [tpsHistory] = useState(generateTpsHistory);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const { data: statsData, isLoading: statsLoading, error: statsError } = useQuery<{ success: boolean; data: NetworkStats }>({
    queryKey: ["/api/public/v1/network/stats"],
    refetchInterval: 5000,
    retry: 3,
  });

  const { data: blocksData, isLoading: blocksLoading } = useQuery<{ success: boolean; data: Block[] }>({
    queryKey: ["/api/public/v1/network/blocks/recent"],
    refetchInterval: 3000,
  });

  const { data: txsData, isLoading: txsLoading } = useQuery<{ success: boolean; data: Transaction[] }>({
    queryKey: ["/api/public/v1/network/transactions/recent"],
    refetchInterval: 3000,
  });

  const stats = statsData?.data;
  const blocks = blocksData?.data || [];
  const transactions = txsData?.data || [];

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setSearchError("");
    
    if (!searchQuery.trim()) {
      setSearchError(t("scan.enterSearchTerm", "Please enter a search term"));
      return;
    }
    
    setIsSearching(true);
    
    const { type, value } = detectSearchType(searchQuery);
    
    setTimeout(() => {
      setIsSearching(false);
      setSearchQuery("");
      
      switch (type) {
        case 'block':
          setLocation(`/scan/block/${value}`);
          break;
        case 'transaction':
          setLocation(`/scan/tx/${value}`);
          break;
        case 'address':
          setLocation(`/scan/address/${value}`);
          break;
        default:
          // Use pattern matching only - don't rely on local cache
          if (value.startsWith('0x') && value.length === 66) {
            setLocation(`/scan/tx/${value}`);
          } else if (value.startsWith('0x') && value.length === 42) {
            setLocation(`/scan/address/${value}`);
          } else if (/^\d+$/.test(value)) {
            setLocation(`/scan/block/${value}`);
          } else if (value.length >= 4) {
            // Partial search - 4+ characters goes to search results page
            setLocation(`/scan/search?q=${encodeURIComponent(value)}`);
          } else {
            setSearchError(t("scan.invalidSearch", "Invalid search. Enter a valid block number, transaction hash, or address (min 4 characters)."));
          }
      }
    }, 300);
  }, [searchQuery, setLocation, t]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    toast({
      title: t("scan.copied", "Copied!"),
      description: t("scan.copiedToClipboard", "Copied to clipboard"),
    });
    setTimeout(() => setCopiedHash(null), 2000);
  }, [toast, t]);

  const formatAddress = (addr: string) => {
    if (!addr) return "-";
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  const formatTime = (timestamp: number) => {
    // Handle both seconds and milliseconds timestamps
    // If timestamp is in seconds (< year 2100), convert to milliseconds
    const timestampMs = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
    const seconds = Math.floor((Date.now() - timestampMs) / 1000);
    if (seconds < 0) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const formatNumber = (num: number | string) => {
    if (typeof num === 'string') {
      const parsed = parseFloat(num.replace(/,/g, ''));
      if (isNaN(parsed)) return num;
      return parsed.toLocaleString();
    }
    return num.toLocaleString();
  };

  const formatLargeNumber = (value: string | number | undefined) => {
    if (!value) return "0";
    const numStr = typeof value === 'string' ? value : value.toString();
    const num = parseFloat(numStr);
    if (isNaN(num)) return "0";
    
    // Convert from Wei (18 decimals) to token units
    const tokenValue = num / 1e18;
    
    if (tokenValue >= 1e12) return `${(tokenValue / 1e12).toFixed(2)}T`;
    if (tokenValue >= 1e9) return `${(tokenValue / 1e9).toFixed(2)}B`;
    if (tokenValue >= 1e6) return `${(tokenValue / 1e6).toFixed(2)}M`;
    if (tokenValue >= 1e3) return `${(tokenValue / 1e3).toFixed(2)}K`;
    return tokenValue.toFixed(2);
  };

  return (
    <ScanLayout>
      <div className="container mx-auto px-4 py-6 bg-gray-50 dark:bg-transparent transition-colors">
        {/* Hero Search Section */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-purple-500/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-gradient-to-b from-gray-900/80 to-gray-900/40 border border-gray-800/50 rounded-2xl p-8 backdrop-blur-sm">
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-purple-400 bg-clip-text text-transparent mb-2" data-testid="text-scan-title">
                {t("scan.subtitle", "TBURN Mainnet Blockchain Explorer")}
              </h1>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                {isConnected && (
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-green-400">{t("scan.live", "Live")}</span>
                  </div>
                )}
                {lastUpdate && (
                  <span>{t("scan.lastUpdate", "Last update")}: {formatTime(lastUpdate)}</span>
                )}
              </div>
            </div>

            {/* Central Search Bar */}
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-purple-500/20 rounded-xl blur-md"></div>
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                      type="text"
                      placeholder={t("scan.searchPlaceholder", "Search by Address / Txn Hash / Block / Token")}
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setSearchError("");
                      }}
                      className="pl-12 pr-4 h-14 bg-gray-950/90 border-gray-700/50 text-gray-900 dark:text-white text-lg placeholder:text-gray-500 rounded-xl focus:border-orange-500/50 focus:ring-orange-500/20"
                      data-testid="input-hero-search"
                    />
                  </div>
                  <Button 
                    type="submit"
                    disabled={isSearching}
                    className="h-14 px-8 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 rounded-xl text-lg font-medium shrink-0"
                    data-testid="button-hero-search"
                  >
                    {isSearching ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      t("scan.search", "Search")
                    )}
                  </Button>
                </div>
              </div>
              
              {searchError && (
                <div className="flex items-center justify-center gap-2 mt-3 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {searchError}
                </div>
              )}
              
              <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Blocks className="w-3.5 h-3.5" />
                  {t("scan.block", "Block")}
                </span>
                <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                <span className="flex items-center gap-1">
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  {t("scan.txHash", "Tx Hash")}
                </span>
                <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {t("scan.address", "Address")}
                </span>
              </div>
            </form>
          </div>
        </div>

        {/* Network Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {statsLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-7 w-24" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 border-blue-800/50 hover-elevate" data-testid="stat-block-height">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-blue-400 text-xs mb-1.5 font-medium">
                    <Blocks className="w-3.5 h-3.5" />
                    {t("scan.blockHeight", "Block Height")}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    #{formatNumber(stats?.blockHeight || 0)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    <Timer className="w-3 h-3 inline mr-1" />
                    {stats?.avgBlockTime || 0.5}s {t("scan.avgBlockTime", "avg")}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-900/30 to-green-800/10 border-green-800/50 hover-elevate" data-testid="stat-transactions">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-green-400 text-xs mb-1.5 font-medium">
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    {t("scan.transactions", "Transactions")}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(stats?.totalTransactions || 0)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-400 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    +12.5% (24h)
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/10 border-yellow-800/50 hover-elevate" data-testid="stat-tps">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-yellow-400 text-xs mb-1.5 font-medium">
                    <Zap className="w-3.5 h-3.5" />
                    {t("scan.tps", "TPS")}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(stats?.tps || 0)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {t("scan.finality", "Finality")}: {stats?.finality || "< 2s"}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border-purple-800/50 hover-elevate" data-testid="stat-validators">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-purple-400 text-xs mb-1.5 font-medium">
                    <Shield className="w-3.5 h-3.5" />
                    {t("scan.validators", "Validators")}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.activeValidators || 0}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stats?.nodeCount || 0} {t("scan.nodes", "nodes")}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-900/30 to-orange-800/10 border-orange-800/50 hover-elevate" data-testid="stat-burned">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-orange-400 text-xs mb-1.5 font-medium">
                    <Flame className="w-3.5 h-3.5" />
                    {t("scan.totalBurned", "Total Burned")}
                  </div>
                  <div className="text-xl font-bold text-orange-400 truncate">
                    {formatLargeNumber(stats?.totalBurned)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">TBURN</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/10 border-cyan-800/50 hover-elevate" data-testid="stat-staked">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs mb-1.5 font-medium">
                    <Coins className="w-3.5 h-3.5" />
                    {t("scan.totalStaked", "Total Staked")}
                  </div>
                  <div className="text-xl font-bold text-cyan-400 truncate">
                    {formatLargeNumber(stats?.totalStaked)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">TBURN</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Network Activity Charts */}
        <div className="grid lg:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gray-900/50 border-gray-800 lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-base">
                <Activity className="w-4 h-4 text-blue-400" />
                {t("scan.networkActivity", "Network Activity")} (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={tpsHistory}>
                    <defs>
                      <linearGradient id="tpsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#6b7280" fontSize={10} tickLine={false} />
                    <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#9ca3af' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="tps" 
                      stroke="#3b82f6" 
                      fillOpacity={1} 
                      fill="url(#tpsGradient)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-base">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                {t("scan.networkHealth", "Network Health")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">{t("scan.uptime", "Uptime")}</span>
                  <span className="text-green-400">{stats?.uptime || "99.99%"}</span>
                </div>
                <Progress value={99.99} className="h-2 bg-gray-800" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">{t("scan.shards", "Shards")}</span>
                  <span className="text-blue-400">{stats?.shardCount || 16}</span>
                </div>
                <Progress value={100} className="h-2 bg-gray-800" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">{t("scan.consensusHealth", "Consensus")}</span>
                  <span className="text-purple-400">100%</span>
                </div>
                <Progress value={100} className="h-2 bg-gray-800" />
              </div>
              <div className="pt-2 border-t border-gray-800">
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 bg-gray-800/50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{stats?.finality || "< 2s"}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{t("scan.finality", "Finality")}</div>
                  </div>
                  <div className="p-2 bg-gray-800/50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{stats?.avgBlockTime || 0.5}s</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{t("scan.blockTime", "Block Time")}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Latest Blocks and Transactions */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-gray-900/50 border-gray-800" data-testid="card-latest-blocks">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-base">
                <Blocks className="w-4 h-4 text-blue-400" />
                {t("scan.latestBlocks", "Latest Blocks")}
                {isConnected && (
                  <span className="relative flex h-2 w-2 ml-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                )}
              </CardTitle>
              <Link href="/scan/blocks">
                <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white h-8" data-testid="link-view-all-blocks">
                  {t("scan.viewAll", "View All")} <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-2">
              {blocksLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))
              ) : blocks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {t("scan.noBlocks", "No blocks found")}
                </div>
              ) : (
                blocks.slice(0, 6).map((block, index) => (
                  <Link key={block.number} href={`/scan/block/${block.number}`}>
                    <div 
                      className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-all group cursor-pointer"
                      data-testid={`block-row-${index}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                          <Blocks className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <span className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1" data-testid={`link-block-${block.number}`}>
                            #{block.number.toLocaleString()}
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </span>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {formatTime(block.timestamp)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-300 flex items-center gap-1 justify-end">
                          <ArrowRightLeft className="w-3 h-3 text-gray-500" />
                          {block.transactions} txns
                        </div>
                        <div 
                          className="text-xs text-gray-500 flex items-center gap-1 justify-end"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            copyToClipboard(block.validator);
                          }}
                        >
                          {formatAddress(block.validator)}
                          <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-gray-600 dark:text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800" data-testid="card-latest-transactions">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-base">
                <ArrowRightLeft className="w-4 h-4 text-green-400" />
                {t("scan.latestTransactions", "Latest Transactions")}
                {isConnected && (
                  <span className="relative flex h-2 w-2 ml-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                )}
              </CardTitle>
              <Link href="/scan/txs">
                <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white h-8" data-testid="link-view-all-txs">
                  {t("scan.viewAll", "View All")} <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-2">
              {txsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {t("scan.noTransactions", "No transactions found")}
                </div>
              ) : (
                transactions.slice(0, 6).map((tx, index) => (
                  <Link key={tx.hash} href={`/scan/tx/${tx.hash}`}>
                    <div 
                      className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-all group cursor-pointer"
                      data-testid={`tx-row-${index}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          tx.status === 'confirmed' || tx.status === 'success'
                            ? 'bg-green-500/20 group-hover:bg-green-500/30' 
                            : 'bg-red-500/20 group-hover:bg-red-500/30'
                        }`}>
                          {tx.status === 'confirmed' || tx.status === 'success' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                        <div>
                          <span className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1" data-testid={`link-tx-${index}`}>
                            {formatAddress(tx.hash)}
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </span>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {formatTime(tx.timestamp)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatLargeNumber(tx.value)} TBURN
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatAddress(tx.from)} → {formatAddress(tx.to)}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ScanLayout>
  );
}
