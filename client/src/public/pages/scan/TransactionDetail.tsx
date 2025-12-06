import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowRightLeft, 
  ChevronLeft,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  Hash,
  Fuel,
  Blocks,
  ArrowRight,
  User
} from "lucide-react";
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

export default function TransactionDetail() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const params = useParams<{ hash: string }>();
  const txHash = params.hash || "";

  const { data: txsData, isLoading } = useQuery<{ success: boolean; data: Transaction[] }>({
    queryKey: ["/api/public/v1/network/transactions/recent", { limit: 50 }],
  });

  const transactions = txsData?.data || [];
  const tx = transactions.find(t => t.hash === txHash);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t("scan.copied", "Copied!"),
      description: t("scan.copiedToClipboard", "Copied to clipboard"),
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatAddress = (addr: string) => {
    if (!addr) return "-";
    return `${addr.slice(0, 16)}...${addr.slice(-12)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#030407] to-[#0a0d14]">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#030407] to-[#0a0d14]">
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">{t("scan.txNotFound", "Transaction Not Found")}</h1>
          <Link href="/scan/txs">
            <Button>{t("scan.backToTransactions", "Back to Transactions")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const txFee = (parseFloat(tx.gasUsed) * parseFloat(tx.gasPrice) / 1e18).toFixed(8);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#030407] to-[#0a0d14]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/scan/txs">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" data-testid="button-back">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white" data-testid="title-tx-detail">
                  {t("scan.transactionDetails", "Transaction Details")}
                </h1>
              </div>
            </div>
          </div>
        </div>

        <Card className="bg-gray-900/50 border-gray-800 mb-6" data-testid="card-tx-overview">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {tx.status === "confirmed" ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
              {t("scan.overview", "Overview")}
              <Badge className={tx.status === "confirmed" ? "bg-green-500/20 text-green-400 ml-2" : "bg-red-500/20 text-red-400 ml-2"}>
                {tx.status === "confirmed" ? t("scan.success", "Success") : t("scan.failed", "Failed")}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="text-gray-400 min-w-[160px]">
                <Hash className="w-4 h-4 inline mr-2" />
                {t("scan.transactionHash", "Transaction Hash")}:
              </div>
              <div className="flex items-center gap-2 flex-1">
                <span className="text-white font-mono text-sm break-all" data-testid="text-tx-hash">
                  {tx.hash}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-gray-400"
                  onClick={() => copyToClipboard(tx.hash)}
                  data-testid="button-copy-hash"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-gray-400 min-w-[160px]">
                <Blocks className="w-4 h-4 inline mr-2" />
                {t("scan.block", "Block")}:
              </div>
              <Link href={`/scan/block/${tx.blockNumber}`}>
                <span className="text-blue-400 hover:text-blue-300 cursor-pointer" data-testid="text-block-number">
                  {tx.blockNumber.toLocaleString()}
                </span>
              </Link>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-gray-400 min-w-[160px]">
                <Clock className="w-4 h-4 inline mr-2" />
                {t("scan.timestamp", "Timestamp")}:
              </div>
              <span className="text-white" data-testid="text-timestamp">
                {formatTime(tx.timestamp)}
              </span>
            </div>

            <div className="border-t border-gray-800 pt-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="text-gray-400 text-sm mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    {t("scan.from", "From")}
                  </div>
                  <Link href={`/scan/address/${tx.from}`}>
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-blue-400 hover:text-blue-300 font-mono text-sm cursor-pointer" data-testid="text-from">
                        {tx.from}
                      </span>
                    </div>
                  </Link>
                </div>

                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mt-6">
                  <ArrowRight className="w-5 h-5 text-green-400" />
                </div>

                <div className="flex-1">
                  <div className="text-gray-400 text-sm mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    {t("scan.to", "To")}
                  </div>
                  <Link href={`/scan/address/${tx.to}`}>
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-blue-400 hover:text-blue-300 font-mono text-sm cursor-pointer" data-testid="text-to">
                        {tx.to}
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-6 grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-gray-400 text-sm mb-2">{t("scan.value", "Value")}</div>
                <div className="text-2xl font-bold text-white" data-testid="text-value">
                  {parseFloat(tx.value).toFixed(6)} <span className="text-gray-400 text-lg">TBURN</span>
                </div>
              </div>

              <div>
                <div className="text-gray-400 text-sm mb-2">{t("scan.transactionFee", "Transaction Fee")}</div>
                <div className="text-2xl font-bold text-white" data-testid="text-fee">
                  {txFee} <span className="text-gray-400 text-lg">TBURN</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-6 grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="text-gray-400 min-w-[120px]">
                  <Fuel className="w-4 h-4 inline mr-2" />
                  {t("scan.gasUsed", "Gas Used")}:
                </div>
                <span className="text-white" data-testid="text-gas-used">
                  {parseInt(tx.gasUsed).toLocaleString()}
                </span>
              </div>

              <div className="flex items-start gap-4">
                <div className="text-gray-400 min-w-[120px]">
                  <Fuel className="w-4 h-4 inline mr-2" />
                  {t("scan.gasPrice", "Gas Price")}:
                </div>
                <span className="text-white" data-testid="text-gas-price">
                  {(parseFloat(tx.gasPrice) / 1e9).toFixed(2)} Gwei
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
