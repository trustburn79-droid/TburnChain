import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRightLeft, ChevronLeft, ChevronRight, Flame, ArrowRight } from "lucide-react";
import { useState } from "react";

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
  const [page, setPage] = useState(1);
  const limit = 25;

  const { data: txsData, isLoading } = useQuery<{ success: boolean; data: Transaction[] }>({
    queryKey: ["/api/public/v1/network/transactions/recent", { limit: 50 }],
  });

  const transactions = txsData?.data || [];
  const paginatedTxs = transactions.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(transactions.length / limit);

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
        <div className="flex items-center gap-3 mb-6">
          <Link href="/scan">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" data-testid="button-back">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white" data-testid="title-transactions">
                {t("scan.transactions", "Transactions")}
              </h1>
              <p className="text-sm text-gray-400">
                {t("scan.transactionsDesc", "All transactions on TBURN Mainnet")}
              </p>
            </div>
          </div>
        </div>

        <Card className="bg-gray-900/50 border-gray-800" data-testid="card-transactions-table">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              {t("scan.latestTransactions", "Latest Transactions")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-800 hover:bg-transparent">
                        <TableHead className="text-gray-400">{t("scan.txnHash", "Txn Hash")}</TableHead>
                        <TableHead className="text-gray-400">{t("scan.block", "Block")}</TableHead>
                        <TableHead className="text-gray-400">{t("scan.age", "Age")}</TableHead>
                        <TableHead className="text-gray-400">{t("scan.from", "From")}</TableHead>
                        <TableHead className="text-gray-400"></TableHead>
                        <TableHead className="text-gray-400">{t("scan.to", "To")}</TableHead>
                        <TableHead className="text-gray-400">{t("scan.value", "Value")}</TableHead>
                        <TableHead className="text-gray-400">{t("scan.status", "Status")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedTxs.map((tx, index) => (
                        <TableRow 
                          key={tx.hash} 
                          className="border-gray-800 hover:bg-gray-800/50"
                          data-testid={`tx-row-${index}`}
                        >
                          <TableCell>
                            <Link href={`/scan/tx/${tx.hash}`}>
                              <span className="text-blue-400 hover:text-blue-300 font-mono text-sm cursor-pointer" data-testid={`link-tx-${index}`}>
                                {formatAddress(tx.hash)}
                              </span>
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Link href={`/scan/block/${tx.blockNumber}`}>
                              <span className="text-blue-400 hover:text-blue-300 cursor-pointer">
                                {tx.blockNumber.toLocaleString()}
                              </span>
                            </Link>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {formatTime(tx.timestamp)}
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
                          <TableCell className="text-white font-medium">
                            {parseFloat(tx.value).toFixed(4)} TBURN
                          </TableCell>
                          <TableCell>
                            <Badge className={tx.status === "confirmed" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}>
                              {tx.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-400">
                    {t("scan.showingTxs", "Showing {{from}} to {{to}} of {{total}} transactions", {
                      from: (page - 1) * limit + 1,
                      to: Math.min(page * limit, transactions.length),
                      total: transactions.length
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="border-gray-700"
                      data-testid="button-prev-page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-gray-400 text-sm px-2">
                      {page} / {totalPages || 1}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="border-gray-700"
                      data-testid="button-next-page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
