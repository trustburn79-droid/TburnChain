import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Blocks, 
  ArrowRightLeft, 
  Users, 
  Flame, 
  TrendingUp,
  Clock,
  Zap,
  Database,
  Activity,
  ChevronRight,
  Coins,
  Shield
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

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
}

interface Block {
  number: number;
  hash: string;
  timestamp: number;
  transactions: number;
  validator: string;
  gasUsed: string;
}

interface Transaction {
  hash: string;
  blockNumber: number;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  status: string;
}

export default function ScanHome() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: statsData, isLoading: statsLoading } = useQuery<{ success: boolean; data: NetworkStats }>({
    queryKey: ["/api/public/v1/network/stats"],
  });

  const { data: blocksData, isLoading: blocksLoading } = useQuery<{ success: boolean; data: Block[] }>({
    queryKey: ["/api/public/v1/network/blocks/recent"],
  });

  const { data: txsData, isLoading: txsLoading } = useQuery<{ success: boolean; data: Transaction[] }>({
    queryKey: ["/api/public/v1/network/transactions/recent"],
  });

  const stats = statsData?.data;
  const blocks = blocksData?.data || [];
  const transactions = txsData?.data || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/scan/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const formatAddress = (addr: string) => {
    if (!addr) return "-";
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  const formatTime = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#030407] to-[#0a0d14]">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Flame className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              TBURNScan
            </h1>
          </div>
          <p className="text-gray-400 text-lg mb-8" data-testid="text-scan-subtitle">
            {t("scan.subtitle", "TBURN Mainnet Blockchain Explorer")}
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input
                type="text"
                placeholder={t("scan.searchPlaceholder", "Search by Address / Txn Hash / Block / Token")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-24 h-14 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 rounded-xl text-lg"
                data-testid="input-search"
              />
              <Button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                data-testid="button-search"
              >
                {t("scan.search", "Search")}
              </Button>
            </div>
          </form>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {statsLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-24" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card className="bg-gray-900/50 border-gray-800 hover-elevate" data-testid="stat-block-height">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Blocks className="w-4 h-4" />
                    {t("scan.blockHeight", "Block Height")}
                  </div>
                  <div className="text-xl font-bold text-white">
                    {stats?.blockHeight?.toLocaleString() || "0"}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800 hover-elevate" data-testid="stat-transactions">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <ArrowRightLeft className="w-4 h-4" />
                    {t("scan.transactions", "Transactions")}
                  </div>
                  <div className="text-xl font-bold text-white">
                    {stats?.totalTransactions?.toLocaleString() || "0"}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800 hover-elevate" data-testid="stat-tps">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Zap className="w-4 h-4" />
                    {t("scan.tps", "TPS")}
                  </div>
                  <div className="text-xl font-bold text-green-400">
                    {stats?.tps?.toLocaleString() || "0"}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800 hover-elevate" data-testid="stat-validators">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Shield className="w-4 h-4" />
                    {t("scan.validators", "Validators")}
                  </div>
                  <div className="text-xl font-bold text-white">
                    {stats?.activeValidators || "0"}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800 hover-elevate" data-testid="stat-burned">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    {t("scan.totalBurned", "Total Burned")}
                  </div>
                  <div className="text-xl font-bold text-orange-400">
                    {stats?.totalBurned || "0"}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800 hover-elevate" data-testid="stat-staked">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Coins className="w-4 h-4" />
                    {t("scan.totalStaked", "Total Staked")}
                  </div>
                  <div className="text-xl font-bold text-blue-400">
                    {stats?.totalStaked || "0"}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-gray-900/50 border-gray-800" data-testid="card-latest-blocks">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
              <CardTitle className="flex items-center gap-2 text-white">
                <Blocks className="w-5 h-5 text-blue-400" />
                {t("scan.latestBlocks", "Latest Blocks")}
              </CardTitle>
              <Link href="/scan/blocks">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" data-testid="link-view-all-blocks">
                  {t("scan.viewAll", "View All")} <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {blocksLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))
              ) : (
                blocks.slice(0, 6).map((block, index) => (
                  <div key={block.number} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors" data-testid={`block-row-${index}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Blocks className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <Link href={`/scan/block/${block.number}`}>
                          <span className="text-blue-400 hover:text-blue-300 font-medium cursor-pointer" data-testid={`link-block-${block.number}`}>
                            #{block.number.toLocaleString()}
                          </span>
                        </Link>
                        <div className="text-xs text-gray-500">
                          {formatTime(block.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-300">
                        {block.transactions} txns
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatAddress(block.validator)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800" data-testid="card-latest-transactions">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
              <CardTitle className="flex items-center gap-2 text-white">
                <ArrowRightLeft className="w-5 h-5 text-green-400" />
                {t("scan.latestTransactions", "Latest Transactions")}
              </CardTitle>
              <Link href="/scan/txs">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" data-testid="link-view-all-txs">
                  {t("scan.viewAll", "View All")} <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {txsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))
              ) : (
                transactions.slice(0, 6).map((tx, index) => (
                  <div key={tx.hash} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors" data-testid={`tx-row-${index}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <ArrowRightLeft className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <Link href={`/scan/tx/${tx.hash}`}>
                          <span className="text-blue-400 hover:text-blue-300 font-medium cursor-pointer" data-testid={`link-tx-${index}`}>
                            {formatAddress(tx.hash)}
                          </span>
                        </Link>
                        <div className="text-xs text-gray-500">
                          {formatTime(tx.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-300">
                        {parseFloat(tx.value).toFixed(4)} TBURN
                      </div>
                      <Badge variant={tx.status === "confirmed" ? "default" : "secondary"} className={tx.status === "confirmed" ? "bg-green-500/20 text-green-400" : ""}>
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Link href="/scan/blocks">
            <Card className="bg-gray-900/50 border-gray-800 hover-elevate cursor-pointer group" data-testid="nav-blocks">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  <Blocks className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{t("scan.blockExplorer", "Block Explorer")}</h3>
                  <p className="text-sm text-gray-400">{t("scan.viewBlocks", "View all blocks")}</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/scan/txs">
            <Card className="bg-gray-900/50 border-gray-800 hover-elevate cursor-pointer group" data-testid="nav-transactions">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                  <ArrowRightLeft className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{t("scan.txExplorer", "Transaction Explorer")}</h3>
                  <p className="text-sm text-gray-400">{t("scan.viewTransactions", "View all transactions")}</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/scan/validators">
            <Card className="bg-gray-900/50 border-gray-800 hover-elevate cursor-pointer group" data-testid="nav-validators">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                  <Shield className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{t("scan.validatorExplorer", "Validator Explorer")}</h3>
                  <p className="text-sm text-gray-400">{t("scan.viewValidators", "View all validators")}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
