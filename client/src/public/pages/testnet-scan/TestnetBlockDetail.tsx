import { useQuery } from "@tanstack/react-query";
import { Link, useParams, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Blocks, Clock, ArrowRightLeft, ChevronLeft, Database, User, Fuel, Box } from "lucide-react";
import TestnetScanLayout from "../../components/TestnetScanLayout";

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

export default function TestnetBlockDetail() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const params = useParams<{ blockNumber: string }>();
  const blockNumber = parseInt(params.blockNumber || "0");

  const { data, isLoading } = useQuery<{ success: boolean; data: Block }>({
    queryKey: [`/api/public/v1/testnet/network/block/${blockNumber}`],
    enabled: blockNumber > 0,
  });

  const block = data?.data;

  const formatTime = (timestamp: number) => {
    const timestampMs = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
    return new Date(timestampMs).toLocaleString('en-US', { timeZone: 'America/New_York' });
  };

  const formatAddress = (addr: string) => addr ? `${addr.slice(0, 14)}...${addr.slice(-10)}` : "-";

  return (
    <TestnetScanLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-4">
          <Button variant="ghost" size="sm" className="text-yellow-400 hover:text-yellow-300" onClick={() => setLocation("/testnet-scan/blocks")}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              {t("scan.backToBlocks", "Back to Blocks")}
            </Button>
        </div>

        <Card className="bg-yellow-900/10 border-yellow-800/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Blocks className="w-5 h-5 text-yellow-400" />
              {t("scan.block", "Block")} #{blockNumber.toLocaleString()}
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">TESTNET</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : block ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-yellow-900/20 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">{t("scan.blockNumber", "Block Number")}</div>
                    <div className="text-white font-mono text-lg">#{block.number.toLocaleString()}</div>
                  </div>
                  <div className="p-4 bg-yellow-900/20 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {t("scan.timestamp", "Timestamp")}
                    </div>
                    <div className="text-white">{formatTime(block.timestamp)}</div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-900/20 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1 flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    {t("scan.blockHash", "Block Hash")}
                  </div>
                  <div className="text-yellow-400 font-mono text-sm break-all">{block.hash}</div>
                </div>

                <div className="p-4 bg-yellow-900/20 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">{t("scan.parentHash", "Parent Hash")}</div>
                  <Link href={`/testnet-scan/block/${block.number - 1}`}>
                    <span className="text-yellow-400 hover:text-yellow-300 font-mono text-sm break-all cursor-pointer">
                      {block.parentHash}
                    </span>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-yellow-900/20 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1 flex items-center gap-1">
                      <ArrowRightLeft className="w-3 h-3" />
                      {t("scan.transactions", "Transactions")}
                    </div>
                    <div className="text-amber-400 font-medium">{block.transactions}</div>
                  </div>
                  <div className="p-4 bg-yellow-900/20 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1 flex items-center gap-1">
                      <Fuel className="w-3 h-3" />
                      {t("scan.gasUsed", "Gas Used")}
                    </div>
                    <div className="text-white">{block.gasUsed.toLocaleString()} / {block.gasLimit.toLocaleString()}</div>
                    <div className="text-gray-500 text-xs">({((block.gasUsed / block.gasLimit) * 100).toFixed(1)}%)</div>
                  </div>
                  <div className="p-4 bg-yellow-900/20 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1 flex items-center gap-1">
                      <Box className="w-3 h-3" />
                      {t("scan.size", "Size")}
                    </div>
                    <div className="text-white">{(block.size / 1024).toFixed(2)} KB</div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-900/20 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {t("scan.validator", "Validator")}
                  </div>
                  <Link href={`/testnet-scan/address/${block.validator}`}>
                    <span className="text-yellow-400 hover:text-yellow-300 font-mono">
                      {formatAddress(block.validator)}
                    </span>
                  </Link>
                </div>

                <div className="flex gap-2 mt-6">
                  {block.number > 1 && (
                    <Button variant="outline" size="sm" className="border-yellow-800/30 text-yellow-400" onClick={() => setLocation(`/testnet-scan/block/${block.number - 1}`)}>
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        {t("scan.previousBlock", "Previous Block")}
                      </Button>
                  )}
                  <Button variant="outline" size="sm" className="border-yellow-800/30 text-yellow-400" onClick={() => setLocation(`/testnet-scan/block/${block.number + 1}`)}>
                      {t("scan.nextBlock", "Next Block")}
                      <ChevronLeft className="w-4 h-4 ml-1 rotate-180" />
                    </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {t("scan.blockNotFound", "Block not found")}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TestnetScanLayout>
  );
}
