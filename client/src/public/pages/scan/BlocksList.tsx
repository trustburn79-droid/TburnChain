import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Blocks, ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { useState } from "react";

interface Block {
  number: number;
  hash: string;
  parentHash: string;
  timestamp: number;
  transactions: number;
  validator: string;
  gasUsed: string;
  gasLimit: string;
  size: number;
}

export default function BlocksList() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const limit = 25;

  const { data: blocksData, isLoading } = useQuery<{ success: boolean; data: Block[] }>({
    queryKey: ["/api/public/v1/network/blocks/recent", { limit: 50 }],
  });

  const blocks = blocksData?.data || [];
  const paginatedBlocks = blocks.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(blocks.length / limit);

  const formatAddress = (addr: string) => {
    if (!addr) return "-";
    return `${addr.slice(0, 10)}...${addr.slice(-8)}`;
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatGas = (gas: string | number) => {
    const num = typeof gas === 'string' ? parseFloat(gas) : gas;
    return num.toLocaleString();
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
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Blocks className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white" data-testid="title-blocks">
                {t("scan.blocks", "Blocks")}
              </h1>
              <p className="text-sm text-gray-400">
                {t("scan.blocksDesc", "All blocks on TBURN Mainnet")}
              </p>
            </div>
          </div>
        </div>

        <Card className="bg-gray-900/50 border-gray-800" data-testid="card-blocks-table">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              {t("scan.latestBlocks", "Latest Blocks")}
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
                        <TableHead className="text-gray-400">{t("scan.block", "Block")}</TableHead>
                        <TableHead className="text-gray-400">{t("scan.age", "Age")}</TableHead>
                        <TableHead className="text-gray-400">{t("scan.txn", "Txn")}</TableHead>
                        <TableHead className="text-gray-400">{t("scan.validator", "Validator")}</TableHead>
                        <TableHead className="text-gray-400">{t("scan.gasUsed", "Gas Used")}</TableHead>
                        <TableHead className="text-gray-400">{t("scan.gasLimit", "Gas Limit")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedBlocks.map((block, index) => (
                        <TableRow 
                          key={block.number} 
                          className="border-gray-800 hover:bg-gray-800/50"
                          data-testid={`block-row-${index}`}
                        >
                          <TableCell>
                            <Link href={`/scan/block/${block.number}`}>
                              <span className="text-blue-400 hover:text-blue-300 font-medium cursor-pointer" data-testid={`link-block-${block.number}`}>
                                {block.number.toLocaleString()}
                              </span>
                            </Link>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {formatTime(block.timestamp)}
                          </TableCell>
                          <TableCell>
                            <Link href={`/scan/txs?block=${block.number}`}>
                              <span className="text-blue-400 hover:text-blue-300 cursor-pointer">
                                {block.transactions}
                              </span>
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Link href={`/scan/address/${block.validator}`}>
                              <span className="text-blue-400 hover:text-blue-300 font-mono text-sm cursor-pointer">
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-400">
                    {t("scan.showingBlocks", "Showing {{from}} to {{to}} of {{total}} blocks", {
                      from: (page - 1) * limit + 1,
                      to: Math.min(page * limit, blocks.length),
                      total: blocks.length
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
