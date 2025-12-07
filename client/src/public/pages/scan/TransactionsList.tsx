import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowRightLeft, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Fuel,
  Zap
} from "lucide-react";
import { useState, useCallback } from "react";
import { useScanWebSocket } from "../../hooks/useScanWebSocket";
import ScanLayout from "../../components/ScanLayout";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  hash: string;
  blockNumber: number;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  timestamp: number;
  status: string;
}

export default function TransactionsList() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isConnected } = useScanWebSocket();
  
  const [page, setPage] = useState(1);
  const [searchTx, setSearchTx] = useState("");
  const pageSize = 25;

  const { data, isLoading, error, refetch, isFetching } = useQuery<{ success: boolean; data: Transaction[] }>({
    queryKey: ["/api/public/v1/network/transactions/recent?limit=100"],
    refetchInterval: isConnected ? 5000 : 30000,
  });

  const transactions = data?.data || [];
  const totalTxs = transactions.length;
  const paginatedTxs = transactions.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(totalTxs / pageSize);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t("scan.copied", "Copied!"),
      description: t("scan.copiedToClipboard", "Copied to clipboard"),
    });
  }, [toast, t]);

  const formatAddress = (addr: string) => {
    if (!addr) return "-";
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  const formatTime = (timestamp: number) => {
    const timestampMs = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
    const seconds = Math.floor((Date.now() - timestampMs) / 1000);
    if (seconds < 0) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const formatLargeNumber = (value: string | number | undefined) => {
    if (!value) return "0";
    const numStr = typeof value === 'string' ? value : value.toString();
    const num = parseFloat(numStr);
    if (isNaN(num)) return "0";
    const tokenValue = num / 1e18;
    if (tokenValue >= 1e12) return `${(tokenValue / 1e12).toFixed(2)}T`;
    if (tokenValue >= 1e9) return `${(tokenValue / 1e9).toFixed(2)}B`;
    if (tokenValue >= 1e6) return `${(tokenValue / 1e6).toFixed(2)}M`;
    if (tokenValue >= 1e3) return `${(tokenValue / 1e3).toFixed(2)}K`;
    return tokenValue.toFixed(4);
  };

  const handleSearchTx = () => {
    if (searchTx.trim() && searchTx.startsWith("0x")) {
      window.location.href = `/scan/tx/${searchTx.trim()}`;
    }
  };

  const confirmedCount = transactions.filter(tx => tx.status === 'confirmed' || tx.status === 'success').length;
  const avgGasUsed = transactions.length > 0 
    ? Math.round(transactions.reduce((sum, tx) => sum + parseInt(tx.gasUsed || "0"), 0) / transactions.length)
    : 0;

  return (
    <ScanLayout>
      <div className="container mx-auto px-4 py-6 bg-gray-50 dark:bg-transparent transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2" data-testid="text-txs-title">
              <ArrowRightLeft className="w-6 h-6 text-green-400" />
              {t("scan.transactions", "Transactions")}
              {isConnected && (
                <span className="relative flex h-2 w-2 ml-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              )}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              {t("scan.transactionsDesc", "All transactions on TBURN Mainnet")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                type="text"
                placeholder={t("scan.searchTx", "Transaction hash...")}
                value={searchTx}
                onChange={(e) => setSearchTx(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchTx()}
                className="pl-10 w-64 bg-gray-900/50 border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500"
                data-testid="input-search-tx"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="border-gray-700 text-gray-300 hover:text-gray-900 dark:hover:text-white"
              data-testid="button-refresh-txs"
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
                <ArrowRightLeft className="w-3.5 h-3.5 text-green-400" />
                {t("scan.totalTxs", "Total Transactions")}
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {totalTxs.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                {t("scan.confirmed", "Confirmed")}
              </div>
              <div className="text-xl font-bold text-green-400">
                {confirmedCount.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs mb-1">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                {t("scan.avgValue", "Avg Value")}
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {transactions.length > 0 
                  ? formatLargeNumber(String(transactions.reduce((sum, tx) => sum + parseFloat(tx.value || "0"), 0) / transactions.length))
                  : "0"} TBURN
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs mb-1">
                <Fuel className="w-3.5 h-3.5 text-orange-400" />
                {t("scan.avgGas", "Avg Gas")}
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {avgGasUsed.toLocaleString()}
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
                {t("scan.errorLoading", "Error loading transactions. Please try again.")}
                <Button variant="outline" size="sm" className="ml-4" onClick={() => refetch()}>
                  {t("scan.retry", "Retry")}
                </Button>
              </div>
            ) : paginatedTxs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {t("scan.noTransactions", "No transactions found")}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800 hover:bg-transparent">
                      <TableHead className="text-gray-600 dark:text-gray-400">{t("scan.txnHash", "Txn Hash")}</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-400">{t("scan.block", "Block")}</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-400">{t("scan.age", "Age")}</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-400">{t("scan.from", "From")}</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-400"></TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-400">{t("scan.to", "To")}</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-400">{t("scan.value", "Value")}</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-400">{t("scan.status", "Status")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTxs.map((tx, index) => (
                      <TableRow 
                        key={tx.hash} 
                        className="border-gray-800 hover:bg-gray-800/30 group"
                        data-testid={`tx-row-${index}`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Link href={`/scan/tx/${tx.hash}`}>
                              <span className="text-blue-400 hover:text-blue-300 font-mono text-sm cursor-pointer" data-testid={`link-tx-${index}`}>
                                {formatAddress(tx.hash)}
                              </span>
                            </Link>
                            <button 
                              onClick={() => copyToClipboard(tx.hash)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Copy className="w-3 h-3 text-gray-500 hover:text-gray-300" />
                            </button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link href={`/scan/block/${tx.blockNumber}`}>
                            <span className="text-blue-400 hover:text-blue-300 cursor-pointer">
                              {tx.blockNumber?.toLocaleString() || "-"}
                            </span>
                          </Link>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-500" />
                            {formatTime(tx.timestamp)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link href={`/scan/address/${tx.from}`}>
                            <span className="text-blue-400 hover:text-blue-300 font-mono text-sm cursor-pointer">
                              {formatAddress(tx.from)}
                            </span>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                            <ArrowRight className="w-3 h-3 text-green-400" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link href={`/scan/address/${tx.to}`}>
                            <span className="text-blue-400 hover:text-blue-300 font-mono text-sm cursor-pointer">
                              {formatAddress(tx.to)}
                            </span>
                          </Link>
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-white font-medium">
                          {formatLargeNumber(tx.value)} TBURN
                        </TableCell>
                        <TableCell>
                          {tx.status === 'confirmed' || tx.status === 'success' ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              {t("scan.success", "Success")}
                            </Badge>
                          ) : tx.status === 'failed' ? (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                              <XCircle className="w-3 h-3 mr-1" />
                              {t("scan.failed", "Failed")}
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                              {tx.status || "pending"}
                            </Badge>
                          )}
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
                {t("scan.showingTxs", `Showing ${(page - 1) * pageSize + 1} - ${Math.min(page * pageSize, totalTxs)} of ${totalTxs}`)}
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
