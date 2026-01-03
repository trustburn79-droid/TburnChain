import { useQuery } from "@tanstack/react-query";
import { Link, useParams, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, Clock, ChevronLeft, ArrowRightLeft, Copy, CheckCircle2, ExternalLink } from "lucide-react";
import { useState } from "react";
import TestnetScanLayout from "../../components/TestnetScanLayout";

interface AddressInfo {
  address: string;
  balance: string;
  txCount: number;
  firstSeen: number;
  lastSeen: number;
  type: string;
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

export default function TestnetAddressDetail() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const params = useParams<{ address: string }>();
  const address = params.address || "";
  const [copied, setCopied] = useState(false);

  const { data, isLoading } = useQuery<{ success: boolean; data: { info: AddressInfo; transactions: Transaction[] } }>({
    queryKey: [`/api/public/v1/testnet/address/${address}`],
    enabled: address.length > 0,
  });

  const info = data?.data?.info;
  const transactions = data?.data?.transactions || [];

  const formatTime = (timestamp: number) => {
    const timestampMs = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
    return new Date(timestampMs).toLocaleString('en-US', { timeZone: 'America/New_York' });
  };

  const formatAddress = (addr: string) => addr ? `${addr.slice(0, 10)}...${addr.slice(-8)}` : "-";
  const formatHash = (hash: string) => hash ? `${hash.slice(0, 14)}...${hash.slice(-10)}` : "-";

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance) / 1e18;
    return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TestnetScanLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-4">
          <Button variant="ghost" size="sm" className="text-yellow-400 hover:text-yellow-300" onClick={() => setLocation("/testnet-scan")}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              {t("scan.backToExplorer", "Back to Explorer")}
            </Button>
        </div>

        <Card className="bg-yellow-900/10 border-yellow-800/30 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Wallet className="w-5 h-5 text-yellow-400" />
              {t("scan.address", "Address")}
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">TESTNET</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-6 p-3 bg-yellow-900/20 rounded-lg">
              <span className="text-yellow-400 font-mono text-sm break-all flex-1">{address}</span>
              <Button variant="ghost" size="sm" onClick={copyAddress} className="text-gray-400 hover:text-white">
                {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : info ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-yellow-900/20 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">{t("scan.balance", "Balance")}</div>
                  <div className="text-amber-400 font-medium text-lg">{formatBalance(info.balance)} tTBURN</div>
                </div>
                <div className="p-4 bg-yellow-900/20 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">{t("scan.transactions", "Transactions")}</div>
                  <div className="text-white font-medium text-lg">{info.txCount.toLocaleString()}</div>
                </div>
                <div className="p-4 bg-yellow-900/20 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">{t("scan.firstSeen", "First Seen")}</div>
                  <div className="text-white text-sm">{formatTime(info.firstSeen)}</div>
                </div>
                <div className="p-4 bg-yellow-900/20 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">{t("scan.lastSeen", "Last Active")}</div>
                  <div className="text-white text-sm">{formatTime(info.lastSeen)}</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                {t("scan.addressNotFound", "Address information not available")}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-yellow-900/10 border-yellow-800/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <ArrowRightLeft className="w-4 h-4 text-amber-400" />
              {t("scan.recentTransactions", "Recent Transactions")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-yellow-800/30">
                      <th className="text-left py-2 px-3 text-gray-400 font-medium text-sm">{t("scan.txHash", "Tx Hash")}</th>
                      <th className="text-left py-2 px-3 text-gray-400 font-medium text-sm">{t("scan.block", "Block")}</th>
                      <th className="text-left py-2 px-3 text-gray-400 font-medium text-sm">{t("scan.age", "Age")}</th>
                      <th className="text-left py-2 px-3 text-gray-400 font-medium text-sm">{t("scan.from", "From")}</th>
                      <th className="text-left py-2 px-3 text-gray-400 font-medium text-sm">{t("scan.to", "To")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.hash} className="border-b border-yellow-800/20 hover:bg-yellow-900/10">
                        <td className="py-2 px-3">
                          <Link href={`/testnet-scan/tx/${tx.hash}`}>
                            <span className="text-yellow-400 hover:text-yellow-300 font-mono text-sm">
                              {formatHash(tx.hash)}
                            </span>
                          </Link>
                        </td>
                        <td className="py-2 px-3">
                          <Link href={`/testnet-scan/block/${tx.blockNumber}`}>
                            <span className="text-yellow-400 hover:text-yellow-300 text-sm">
                              #{tx.blockNumber.toLocaleString()}
                            </span>
                          </Link>
                        </td>
                        <td className="py-2 px-3 text-gray-400 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(tx.timestamp)}
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <Link href={`/testnet-scan/address/${tx.from}`}>
                            <span className={`font-mono text-sm ${tx.from === address ? 'text-gray-400' : 'text-yellow-400 hover:text-yellow-300'}`}>
                              {tx.from === address ? t("scan.self", "Self") : formatAddress(tx.from)}
                            </span>
                          </Link>
                        </td>
                        <td className="py-2 px-3">
                          <Link href={`/testnet-scan/address/${tx.to}`}>
                            <span className={`font-mono text-sm ${tx.to === address ? 'text-gray-400' : 'text-yellow-400 hover:text-yellow-300'}`}>
                              {tx.to === address ? t("scan.self", "Self") : formatAddress(tx.to)}
                            </span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {t("scan.noTransactions", "No transactions found")}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TestnetScanLayout>
  );
}
