import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRightLeft, Clock, ChevronLeft, CheckCircle2, XCircle, Fuel, Hash, ArrowRight, Blocks } from "lucide-react";
import TestnetScanLayout from "../../components/TestnetScanLayout";

interface Transaction {
  hash: string;
  blockNumber: number;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gasUsed: number;
  timestamp: number;
  status: string;
  nonce: number;
  input: string;
}

export default function TestnetTransactionDetail() {
  const { t } = useTranslation();
  const params = useParams<{ hash: string }>();
  const hash = params.hash || "";

  const { data, isLoading } = useQuery<{ success: boolean; data: Transaction }>({
    queryKey: [`/api/public/v1/testnet/network/tx/${hash}`],
    enabled: hash.length > 0,
  });

  const tx = data?.data;

  const formatTime = (timestamp: number) => {
    const timestampMs = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
    return new Date(timestampMs).toLocaleString('en-US', { timeZone: 'America/New_York' });
  };

  const formatAddress = (addr: string) => addr ? `${addr.slice(0, 14)}...${addr.slice(-10)}` : "-";

  const formatValue = (value: string) => {
    const num = parseFloat(value) / 1e18;
    return num.toFixed(6);
  };

  return (
    <TestnetScanLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-4">
          <Link href="/testnet-scan/txs">
            <Button variant="ghost" size="sm" className="text-yellow-400 hover:text-yellow-300">
              <ChevronLeft className="w-4 h-4 mr-1" />
              {t("scan.backToTransactions", "Back to Transactions")}
            </Button>
          </Link>
        </div>

        <Card className="bg-yellow-900/10 border-yellow-800/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <ArrowRightLeft className="w-5 h-5 text-amber-400" />
              {t("scan.transactionDetails", "Transaction Details")}
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
            ) : tx ? (
              <div className="space-y-4">
                <div className="p-4 bg-yellow-900/20 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1 flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    {t("scan.txHash", "Transaction Hash")}
                  </div>
                  <div className="text-yellow-400 font-mono text-sm break-all">{tx.hash}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-yellow-900/20 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">{t("scan.status", "Status")}</div>
                    <div className="flex items-center gap-2">
                      {tx.status === 'confirmed' ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          <span className="text-green-400">{t("scan.confirmed", "Confirmed")}</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-400" />
                          <span className="text-red-400">{t("scan.failed", "Failed")}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-900/20 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1 flex items-center gap-1">
                      <Blocks className="w-3 h-3" />
                      {t("scan.block", "Block")}
                    </div>
                    <Link href={`/testnet-scan/block/${tx.blockNumber}`}>
                      <span className="text-yellow-400 hover:text-yellow-300">
                        #{tx.blockNumber.toLocaleString()}
                      </span>
                    </Link>
                  </div>
                </div>

                <div className="p-4 bg-yellow-900/20 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {t("scan.timestamp", "Timestamp")}
                  </div>
                  <div className="text-white">{formatTime(tx.timestamp)}</div>
                </div>

                <div className="p-4 bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <div className="text-gray-400 text-sm mb-1">{t("scan.from", "From")}</div>
                      <Link href={`/testnet-scan/address/${tx.from}`}>
                        <span className="text-yellow-400 hover:text-yellow-300 font-mono text-sm">
                          {formatAddress(tx.from)}
                        </span>
                      </Link>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-500" />
                    <div className="flex-1 min-w-[200px]">
                      <div className="text-gray-400 text-sm mb-1">{t("scan.to", "To")}</div>
                      <Link href={`/testnet-scan/address/${tx.to}`}>
                        <span className="text-yellow-400 hover:text-yellow-300 font-mono text-sm">
                          {formatAddress(tx.to)}
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-yellow-900/20 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">{t("scan.value", "Value")}</div>
                    <div className="text-amber-400 font-medium">{formatValue(tx.value)} tTBURN</div>
                  </div>
                  <div className="p-4 bg-yellow-900/20 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1 flex items-center gap-1">
                      <Fuel className="w-3 h-3" />
                      {t("scan.gasUsed", "Gas Used")}
                    </div>
                    <div className="text-white">{tx.gasUsed?.toLocaleString() || '-'}</div>
                  </div>
                  <div className="p-4 bg-yellow-900/20 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">{t("scan.gasPrice", "Gas Price")}</div>
                    <div className="text-white">{tx.gasPrice} EMB</div>
                  </div>
                </div>

                {tx.input && tx.input !== '0x' && (
                  <div className="p-4 bg-yellow-900/20 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">{t("scan.inputData", "Input Data")}</div>
                    <div className="text-gray-300 font-mono text-xs break-all bg-black/30 p-2 rounded max-h-32 overflow-auto">
                      {tx.input}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {t("scan.txNotFound", "Transaction not found")}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TestnetScanLayout>
  );
}
