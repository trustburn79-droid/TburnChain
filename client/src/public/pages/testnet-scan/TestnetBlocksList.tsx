import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Blocks, Clock, ArrowRightLeft, ChevronLeft, ChevronRight, Database } from "lucide-react";
import { useState } from "react";
import TestnetScanLayout from "../../components/TestnetScanLayout";

interface Block {
  number: number;
  hash: string;
  timestamp: number;
  transactions: number;
  gasUsed: number;
  gasLimit: number;
  validator: string;
  size: number;
}

export default function TestnetBlocksList() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const limit = 25;

  const { data, isLoading } = useQuery<{ success: boolean; data: Block[]; total: number }>({
    queryKey: ["/api/public/v1/testnet/network/blocks", `page=${page}`],
    refetchInterval: 30000, // Match backend cache TTL for consistent display
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const blocks = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const formatTime = (timestamp: number) => {
    const timestampMs = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
    return new Date(timestampMs).toLocaleString('en-US', { timeZone: 'America/New_York' });
  };

  const formatAddress = (addr: string) => addr ? `${addr.slice(0, 10)}...${addr.slice(-8)}` : "-";

  return (
    <TestnetScanLayout>
      <div className="container mx-auto px-4 py-6">
        <Card className="bg-yellow-900/10 border-yellow-800/30">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="flex items-center gap-2 text-white">
                <Blocks className="w-5 h-5 text-yellow-400" />
                {t("scan.blocks", "Blocks")}
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">TESTNET</Badge>
              </CardTitle>
              <div className="text-sm text-gray-400">
                {t("scan.total", "Total")}: {total.toLocaleString()} {t("scan.blocks", "blocks")}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-yellow-800/30">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">{t("scan.block", "Block")}</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">{t("scan.age", "Age")}</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">{t("scan.txns", "Txns")}</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">{t("scan.validator", "Validator")}</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">{t("scan.gasUsed", "Gas Used")}</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i} className="border-b border-yellow-800/20">
                        <td colSpan={5} className="py-3 px-4"><Skeleton className="h-6 w-full" /></td>
                      </tr>
                    ))
                  ) : blocks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">{t("scan.noBlocks", "No blocks found")}</td>
                    </tr>
                  ) : (
                    blocks.map((block) => (
                      <tr key={block.number} className="border-b border-yellow-800/20 hover:bg-yellow-900/10 transition-colors">
                        <td className="py-3 px-4">
                          <Link href={`/testnet-scan/block/${block.number}`}>
                            <span className="text-yellow-400 hover:text-yellow-300 font-medium flex items-center gap-2">
                              <Database className="w-4 h-4" />
                              #{block.number.toLocaleString()}
                            </span>
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-gray-400 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(block.timestamp)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-amber-400">
                            <ArrowRightLeft className="w-3 h-3" />
                            {block.transactions}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Link href={`/testnet-scan/address/${block.validator}`}>
                            <span className="text-yellow-400 hover:text-yellow-300 text-sm font-mono">
                              {formatAddress(block.validator)}
                            </span>
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-right text-gray-400 text-sm">
                          {((block.gasUsed / block.gasLimit) * 100).toFixed(1)}%
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
