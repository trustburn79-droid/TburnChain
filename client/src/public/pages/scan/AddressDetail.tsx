import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Wallet, 
  ChevronLeft,
  Copy,
  ArrowRightLeft,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Shield,
  Flame
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  hash: string;
  blockNumber: number;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  status: string;
}

interface Validator {
  address: string;
  name: string;
  status: string;
  stake: string;
  uptime: string;
  apy: string;
}

export default function AddressDetail() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const params = useParams<{ address: string }>();
  const address = params.address || "";

  const { data: txsData, isLoading: txsLoading } = useQuery<{ success: boolean; data: Transaction[] }>({
    queryKey: ["/api/public/v1/network/transactions/recent?limit=50"],
  });

  const { data: validatorsData } = useQuery<{ success: boolean; data: { validators: Validator[] } }>({
    queryKey: ["/api/public/v1/validators"],
  });

  const { data: statsData } = useQuery<{ success: boolean; data: { gasPrice: string } }>({
    queryKey: ["/api/public/v1/network/stats"],
  });

  const allTransactions = txsData?.data || [];
  const transactions = allTransactions.filter(
    tx => tx.from?.toLowerCase() === address.toLowerCase() || tx.to?.toLowerCase() === address.toLowerCase()
  );
  
  const validators = validatorsData?.data?.validators || [];
  const isValidator = validators.some(v => v.address?.toLowerCase() === address.toLowerCase());
  const validator = validators.find(v => v.address?.toLowerCase() === address.toLowerCase());

  const balance = "12,450.5678";
  const usdValue = "$24,901.14";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t("scan.copied", "Copied!"),
      description: t("scan.copiedToClipboard", "Copied to clipboard"),
    });
  };

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
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              {isValidator ? (
                <Shield className="w-5 h-5 text-purple-400" />
              ) : (
                <Wallet className="w-5 h-5 text-purple-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white" data-testid="title-address">
                  {isValidator ? t("scan.validator", "Validator") : t("scan.address", "Address")}
                </h1>
                {isValidator && (
                  <Badge className="bg-purple-500/20 text-purple-400">
                    {validator?.name || "Validator"}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 font-mono text-sm" data-testid="text-address">
                  {address}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-gray-400"
                  onClick={() => copyToClipboard(address)}
                  data-testid="button-copy-address"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gray-900/50 border-gray-800" data-testid="card-balance">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <Coins className="w-4 h-4" />
                {t("scan.balance", "Balance")}
              </div>
              <div className="text-2xl font-bold text-white">{balance} TBURN</div>
              <div className="text-sm text-gray-400">{usdValue}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800" data-testid="card-transactions">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <ArrowRightLeft className="w-4 h-4" />
                {t("scan.transactions", "Transactions")}
              </div>
              <div className="text-2xl font-bold text-white">{transactions.length}</div>
              <div className="text-sm text-gray-400">{t("scan.totalTxs", "Total transactions")}</div>
            </CardContent>
          </Card>

          {isValidator ? (
            <Card className="bg-gray-900/50 border-gray-800" data-testid="card-staking">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  {t("scan.staked", "Staked")}
                </div>
                <div className="text-2xl font-bold text-white">{validator?.stake || "0"} TBURN</div>
                <div className="text-sm text-green-400">APY: {validator?.apy || "0"}%</div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gray-900/50 border-gray-800" data-testid="card-tokens">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <Coins className="w-4 h-4" />
                  {t("scan.tokens", "Tokens")}
                </div>
                <div className="text-2xl font-bold text-white">3</div>
                <div className="text-sm text-gray-400">{t("scan.tokenTypes", "TBC-20 tokens")}</div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="bg-gray-900/50 border-gray-800" data-testid="card-activity">
          <Tabs defaultValue="transactions" className="w-full">
            <CardHeader className="pb-0">
              <TabsList className="bg-gray-800/50">
                <TabsTrigger value="transactions" className="data-[state=active]:bg-gray-700" data-testid="tab-transactions">
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  {t("scan.transactions", "Transactions")}
                </TabsTrigger>
                <TabsTrigger value="tokens" className="data-[state=active]:bg-gray-700" data-testid="tab-tokens">
                  <Coins className="w-4 h-4 mr-2" />
                  {t("scan.tokenTransfers", "Token Transfers")}
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            
            <CardContent className="pt-4">
              <TabsContent value="transactions">
                {txsLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    {t("scan.noTransactions", "No transactions found")}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-800">
                        <TableHead className="text-gray-400">{t("scan.txnHash", "Txn Hash")}</TableHead>
                        <TableHead className="text-gray-400">{t("scan.block", "Block")}</TableHead>
                        <TableHead className="text-gray-400">{t("scan.age", "Age")}</TableHead>
                        <TableHead className="text-gray-400">{t("scan.direction", "Direction")}</TableHead>
                        <TableHead className="text-gray-400">{t("scan.address", "Address")}</TableHead>
                        <TableHead className="text-gray-400">{t("scan.value", "Value")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.slice(0, 25).map((tx, index) => {
                        const isOutgoing = tx.from?.toLowerCase() === address.toLowerCase();
                        const otherAddress = isOutgoing ? tx.to : tx.from;
                        return (
                          <TableRow key={tx.hash} className="border-gray-800 hover:bg-gray-800/50" data-testid={`tx-row-${index}`}>
                            <TableCell>
                              <Link href={`/scan/tx/${tx.hash}`}>
                                <span className="text-blue-400 hover:text-blue-300 font-mono text-sm cursor-pointer">
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
                              {isOutgoing ? (
                                <Badge className="bg-red-500/20 text-red-400">
                                  <ArrowUpRight className="w-3 h-3 mr-1" />
                                  OUT
                                </Badge>
                              ) : (
                                <Badge className="bg-green-500/20 text-green-400">
                                  <ArrowDownLeft className="w-3 h-3 mr-1" />
                                  IN
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Link href={`/scan/address/${otherAddress}`}>
                                <span className="text-blue-400 hover:text-blue-300 font-mono text-sm cursor-pointer">
                                  {formatAddress(otherAddress)}
                                </span>
                              </Link>
                            </TableCell>
                            <TableCell className="text-white font-medium">
                              {parseFloat(tx.value).toFixed(4)} TBURN
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value="tokens">
                <div className="text-center py-8 text-gray-400">
                  {t("scan.noTokenTransfers", "No token transfers found")}
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
