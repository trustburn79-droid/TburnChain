import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Shield, CheckCircle2, XCircle, Coins, Users } from "lucide-react";
import TestnetScanLayout from "../../components/TestnetScanLayout";

interface Validator {
  address: string;
  name: string;
  status: string;
  stake: string;
  delegators: number;
  uptime: number;
  blocksProduced: number;
  commission: number;
}

export default function TestnetValidatorsList() {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery<{ success: boolean; data: Validator[] }>({
    queryKey: ["/api/public/v1/testnet/validators"],
    refetchInterval: 30000,
  });

  const validators = data?.data || [];

  const formatAddress = (addr: string) => addr ? `${addr.slice(0, 10)}...${addr.slice(-8)}` : "-";

  const formatStake = (stake: string) => {
    const num = parseFloat(stake) / 1e18;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  return (
    <TestnetScanLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-yellow-900/10 border-yellow-800/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-yellow-400 text-xs mb-1">
                <Shield className="w-3.5 h-3.5" />
                {t("scan.totalValidators", "Total Validators")}
              </div>
              <div className="text-2xl font-bold text-white">{validators.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-900/10 border-yellow-800/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-400 text-xs mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t("scan.active", "Active")}
              </div>
              <div className="text-2xl font-bold text-white">{validators.filter(v => v.status === 'active').length}</div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-900/10 border-yellow-800/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-amber-400 text-xs mb-1">
                <Coins className="w-3.5 h-3.5" />
                {t("scan.totalStaked", "Total Staked")}
              </div>
              <div className="text-2xl font-bold text-white">
                {formatStake(validators.reduce((acc, v) => acc + parseFloat(v.stake || '0'), 0).toString() + '000000000000000000')}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-900/10 border-yellow-800/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-orange-400 text-xs mb-1">
                <Users className="w-3.5 h-3.5" />
                {t("scan.totalDelegators", "Total Delegators")}
              </div>
              <div className="text-2xl font-bold text-white">
                {validators.reduce((acc, v) => acc + (v.delegators || 0), 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-yellow-900/10 border-yellow-800/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="w-5 h-5 text-yellow-400" />
              {t("scan.validators", "Validators")}
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">TESTNET</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-yellow-800/30">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">{t("scan.validator", "Validator")}</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">{t("scan.status", "Status")}</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">{t("scan.stake", "Stake")}</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">{t("scan.delegators", "Delegators")}</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">{t("scan.uptime", "Uptime")}</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">{t("scan.commission", "Commission")}</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i} className="border-b border-yellow-800/20">
                        <td colSpan={6} className="py-3 px-4"><Skeleton className="h-6 w-full" /></td>
                      </tr>
                    ))
                  ) : validators.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">{t("scan.noValidators", "No validators found")}</td>
                    </tr>
                  ) : (
                    validators.map((validator) => (
                      <tr key={validator.address} className="border-b border-yellow-800/20 hover:bg-yellow-900/10 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="text-white font-medium">{validator.name}</span>
                            <Link href={`/testnet-scan/address/${validator.address}`}>
                              <span className="text-yellow-400 hover:text-yellow-300 text-xs font-mono">
                                {formatAddress(validator.address)}
                              </span>
                            </Link>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {validator.status === 'active' ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                              <XCircle className="w-3 h-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-amber-400 font-medium">
                          {formatStake(validator.stake)} tTBURN
                        </td>
                        <td className="py-3 px-4 text-right text-gray-300">
                          {validator.delegators.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Progress value={validator.uptime} className="w-16 h-2 bg-gray-800" />
                            <span className="text-green-400 text-sm">{validator.uptime}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-gray-300">
                          {validator.commission}%
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
