import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRightLeft, Clock, ChevronLeft, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import TestnetScanLayout from "../../components/TestnetScanLayout";

interface Transaction {
  hash: string;
  blockNumber: number;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  status: string;
  gasUsed: number | null;
}

export default function TestnetTransactionsList() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const limit = 25;

  const { data, isLoading } = useQuery<{ success: boolean; data: Transaction[]; total: number }>({
    queryKey: ["/api/public/v1/testnet/network/transactions", `page=${page}`],
    refetchInterval: 30000, // Match backend cache TTL for consistent display
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const transactions = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const formatTime = (timestamp: number) => {
    const timestampMs = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
    return new Date(timestampMs).toLocaleString('en-US', { timeZone: 'America/New_York' });
  };

  const formatAddress = (addr: string) => addr ? `${addr.slice(0, 10)}...${addr.slice(-8)}` : "-";
  const formatHash = (hash: string) => hash ? `${hash.slice(0, 14)}...${hash.slice(-10)}` : "-";

  const formatValue = (value: string) => {
    const num = parseFloat(value) / 1e18;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(4);
  };

  return (
    <TestnetScanLayout>
      <div className="container mx-auto px-4 py-6">
        <Card className="bg-yellow-900/10 border-yellow-800/30">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="flex items-center gap-2 text-white">
                <ArrowRightLeft className="w-5 h-5 text-amber-400" />
                {t("scan.transactions", "Transactions")}
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">TESTNET</Badge>
              </CardTitle>
              <div className="text-sm text-gray-400">
                {t("scan.total", "Total")}: {total.toLocaleString()} {t("scan.txns", "txns")}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-yellow-800/30">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">{t("scan.txHash", "Tx Hash")}</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">{t("scan.block", "Block")}</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">{t("scan.age", "Age")}</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">{t("scan.from", "From")}</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">{t("scan.to", "To")}</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">{t("scan.value", "Value")}</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i} className="border-b border-yellow-800/20">
                        <td colSpan={6} className="py-3 px-4"><Skeleton className="h-6 w-full" /></td>
                      </tr>
                    ))
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">{t("scan.noTransactions", "No transactions found")}</td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.hash} className="border-b border-yellow-800/20 hover:bg-yellow-900/10 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {tx.status === 'confirmed' || tx.status === 'success' ? (
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-400" />
                            )}
                            <Link href={`/testnet-scan/tx/${tx.hash}`}>
                              <span className="text-yellow-400 hover:text-yellow-300 font-mono text-sm">
                                {formatHash(tx.hash)}
                              </span>
                            </Link>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Link href={`/testnet-scan/block/${tx.blockNumber}`}>
                            <span className="text-yellow-400 hover:text-yellow-300">
                              #{tx.blockNumber.toLocaleString()}
                            </span>
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-gray-400 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(tx.timestamp)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Link href={`/testnet-scan/address/${tx.from}`}>
                            <span className="text-yellow-400 hover:text-yellow-300 text-sm font-mono">
                              {formatAddress(tx.from)}
                            </span>
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <Link href={`/testnet-scan/address/${tx.to}`}>
                            <span className="text-yellow-400 hover:text-yellow-300 text-sm font-mono">
                              {formatAddress(tx.to)}
                            </span>
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-right text-amber-400 font-medium">
                          {formatValue(tx.value)} tTBURN
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-yellow-800/30">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border-yellow-800/30 text-yellow-400 hover:bg-yellow-900/20"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  {t("scan.previous", "Previous")}
                </Button>
                <span className="text-gray-400 text-sm">
                  {t("scan.page", "Page")} {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="border-yellow-800/30 text-yellow-400 hover:bg-yellow-900/20"
                >
                  {t("scan.next", "Next")}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TestnetScanLayout>
  );
}
