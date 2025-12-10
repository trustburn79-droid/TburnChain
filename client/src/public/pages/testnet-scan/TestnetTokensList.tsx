import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Coins, TrendingUp, TrendingDown, Users } from "lucide-react";
import TestnetScanLayout from "../../components/TestnetScanLayout";

interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  holders: number;
  price: number;
  change24h: number;
}

export default function TestnetTokensList() {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery<{ success: boolean; data: Token[] }>({
    queryKey: ["/api/public/v1/testnet/tokens"],
    refetchInterval: 30000,
  });

  const tokens = data?.data || [];

  const formatAddress = (addr: string) => addr ? `${addr.slice(0, 10)}...${addr.slice(-8)}` : "-";

  const formatSupply = (supply: string) => {
    const num = parseFloat(supply) / 1e18;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  return (
    <TestnetScanLayout>
      <div className="container mx-auto px-4 py-6">
        <Card className="bg-yellow-900/10 border-yellow-800/30">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="flex items-center gap-2 text-white">
                <Coins className="w-5 h-5 text-amber-400" />
                {t("scan.tokens", "Tokens")}
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">TESTNET</Badge>
              </CardTitle>
              <div className="text-sm text-gray-400">
                {t("scan.total", "Total")}: {tokens.length} {t("scan.tokens", "tokens")}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-yellow-800/30">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">#</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">{t("scan.token", "Token")}</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">{t("scan.price", "Price")}</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">{t("scan.change24h", "24h %")}</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">{t("scan.totalSupply", "Total Supply")}</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">{t("scan.holders", "Holders")}</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i} className="border-b border-yellow-800/20">
                        <td colSpan={6} className="py-3 px-4"><Skeleton className="h-6 w-full" /></td>
                      </tr>
                    ))
                  ) : tokens.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">{t("scan.noTokens", "No tokens found")}</td>
                    </tr>
                  ) : (
                    tokens.map((token, index) => (
                      <tr key={token.address} className="border-b border-yellow-800/20 hover:bg-yellow-900/10 transition-colors">
                        <td className="py-3 px-4 text-gray-400">{index + 1}</td>
                        <td className="py-3 px-4">
                          <Link href={`/testnet-scan/token/${token.address}`}>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                <span className="text-yellow-400 text-xs font-bold">{token.symbol.slice(0, 2)}</span>
                              </div>
                              <div>
                                <span className="text-white font-medium hover:text-yellow-400">{token.name}</span>
                                <div className="text-xs text-gray-500">{token.symbol}</div>
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-right text-white font-medium">
                          ${token.price.toFixed(4)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className={`flex items-center justify-end gap-1 ${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {token.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {Math.abs(token.change24h).toFixed(2)}%
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-gray-300">
                          {formatSupply(token.totalSupply)} {token.symbol}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1 text-gray-300">
                            <Users className="w-3 h-3 text-gray-500" />
                            {token.holders.toLocaleString()}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </TestnetScanLayout>
  );
}
