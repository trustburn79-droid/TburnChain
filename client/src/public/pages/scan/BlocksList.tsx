import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Blocks, 
  Clock,
  ArrowRightLeft,
  Copy,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Search,
  Fuel,
  User,
  RefreshCw,
  Database
} from "lucide-react";
import { useState, useCallback } from "react";
import { useScanWebSocket } from "../../hooks/useScanWebSocket";
import ScanLayout from "../../components/ScanLayout";
import { useToast } from "@/hooks/use-toast";

interface Block {
  number: number;
  hash: string;
  parentHash: string;
  timestamp: number;
  transactions: number;
  gasUsed: string;
  gasLimit: string;
  validator: string;
  size: number;
}

interface NetworkStats {
  currentBlockHeight: number;
  tps: number;
  totalTransactions: number;
  activeValidators: number;
}

export default function BlocksList() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { isConnected } = useScanWebSocket();
  const [page, setPage] = useState(1);
  const [searchBlock, setSearchBlock] = useState("");
  const pageSize = 25;

  // Fetch real network stats for block height - uses 30s cache for consistency
  const { data: networkStats } = useQuery<NetworkStats>({
    queryKey: ["/api/network/stats"],
    staleTime: 30000, // Match backend cache TTL for consistent display
    refetchInterval: 30000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data, isLoading, error, refetch, isFetching } = useQuery<{ success: boolean; data: Block[]; total: number }>({
    queryKey: ["/api/public/v1/network/blocks/recent?limit=100"],
    refetchInterval: 30000, // Match backend cache TTL for consistent display
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const blocks = data?.data || [];
  const totalBlocks = blocks.length;
  const paginatedBlocks = blocks.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(totalBlocks / pageSize);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t("scan.copied", "Copied!"),
      description: t("scan.copiedToClipboard", "Copied to clipboard"),
    });
  }, [toast, t]);

  const formatAddress = (addr: string) => {
    if (!addr) return "-";
    return `${addr.slice(0, 10)}...${addr.slice(-8)}`;
  };

  const formatTime = (timestamp: number) => {
    // Handle both seconds and milliseconds timestamps
    const timestampMs = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
    const seconds = Math.floor((Date.now() - timestampMs) / 1000);
    if (seconds < 0) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const formatGas = (gas: string) => {
    const gasNum = parseInt(gas);
    if (gasNum >= 1000000) return `${(gasNum / 1000000).toFixed(2)}M`;
    if (gasNum >= 1000) return `${(gasNum / 1000).toFixed(1)}K`;
    return gas;
  };

  const handleSearchBlock = () => {
    if (searchBlock.trim()) {
      const blockNum = parseInt(searchBlock);
      if (!isNaN(blockNum)) {
        setLocation(`/scan/block/${blockNum}`);
      }
    }
  };

  return (
    <ScanLayout>
      <div className="container mx-auto px-4 py-6 bg-gray-50 dark:bg-transparent transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2" data-testid="text-blocks-title">
              <Blocks className="w-6 h-6 text-blue-400" />
              {t("scan.blocks", "Blocks")}
              {isConnected && (
                <span className="relative flex h-2 w-2 ml-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              )}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              {t("scan.blocksDesc", "All blocks on TBURN Mainnet")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                type="text"
                placeholder={t("scan.searchBlock", "Block number...")}
                value={searchBlock}
                onChange={(e) => setSearchBlock(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchBlock()}
                className="pl-10 w-48 bg-gray-900/50 border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500"
                data-testid="input-search-block"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="border-gray-700 text-gray-300 hover:text-gray-900 dark:hover:text-white"
              data-testid="button-refresh-blocks"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              {t("scan.refresh", "Refresh")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs mb-1">
                <Blocks className="w-3.5 h-3.5 text-blue-400" />
                {t("scan.latestBlock", "Latest Block")}
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                #{(networkStats?.currentBlockHeight || blocks[0]?.number || 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs mb-1">
                <Clock className="w-3.5 h-3.5 text-green-400" />
                {t("scan.avgBlockTime", "Avg Block Time")}
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">0.5s</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs mb-1">
                <ArrowRightLeft className="w-3.5 h-3.5 text-purple-400" />
                {t("scan.avgTxPerBlock", "Avg Txs/Block")}
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {blocks.length > 0 
                  ? Math.round(blocks.reduce((sum, b) => sum + b.transactions, 0) / blocks.length).toLocaleString()
                  : "0"}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs mb-1">
                <Fuel className="w-3.5 h-3.5 text-orange-400" />
                {t("scan.avgGasUsed", "Avg Gas Used")}
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {blocks.length > 0 
                  ? formatGas(String(Math.round(blocks.reduce((sum, b) => sum + parseInt(b.gasUsed || "0"), 0) / blocks.length)))
                  : "0"}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-400">
                {t("scan.errorLoading", "Error loading blocks. Please try again.")}
                <Button variant="outline" size="sm" className="ml-4" onClick={() => refetch()}>
                  {t("scan.retry", "Retry")}
                </Button>
              </div>
            ) : paginatedBlocks.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {t("scan.noBlocks", "No blocks found")}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800 hover:bg-transparent">
                      <TableHead className="text-gray-600 dark:text-gray-400">{t("scan.block", "Block")}</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-400">{t("scan.age", "Age")}</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-400">{t("scan.txn", "Txn")}</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-400">{t("scan.validator", "Validator")}</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-400">{t("scan.gasUsed", "Gas Used")}</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-400">{t("scan.gasLimit", "Gas Limit")}</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-400">{t("scan.size", "Size")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedBlocks.map((block, index) => (
                      <TableRow 
                        key={block.number} 
                        className="border-gray-800 hover:bg-gray-800/30 group"
                        data-testid={`block-row-${index}`}
                      >
                        <TableCell>
                          <Link href={`/scan/block/${block.number}`}>
                            <span className="text-blue-400 hover:text-blue-300 font-medium cursor-pointer flex items-center gap-1" data-testid={`link-block-${block.number}`}>
                              <Blocks className="w-4 h-4 text-blue-400/50" />
                              #{block.number.toLocaleString()}
                            </span>
                          </Link>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-500" />
                            {formatTime(block.timestamp)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-purple-400 border-purple-400/30">
                            {block.transactions}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Link href={`/scan/address/${block.validator}`}>
                            <span 
                              className="text-blue-400 hover:text-blue-300 cursor-pointer flex items-center gap-1"
                              data-testid={`link-validator-${block.number}`}
                            >
                              <User className="w-3 h-3 text-gray-500" />
                              {formatAddress(block.validator)}
                            </span>
                          </Link>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {formatGas(block.gasUsed)}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {formatGas(block.gasLimit)}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {((block.size || 0) / 1024).toFixed(2)} KB
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-800">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t("scan.showingBlocks", { from: (page - 1) * pageSize + 1, to: Math.min(page * pageSize, totalBlocks), total: totalBlocks })}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border-gray-700 text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  data-testid="button-prev-page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="border-gray-700 text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  data-testid="button-next-page"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </ScanLayout>
  );
}
