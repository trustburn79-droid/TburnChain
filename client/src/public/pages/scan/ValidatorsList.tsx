import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, ChevronLeft, Flame, TrendingUp, Users, Coins } from "lucide-react";

interface Validator {
  rank?: number;
  address: string;
  name: string;
  status: string;
  stake: string;
  delegators?: number;
  commission: string;
  uptime: string;
  blocksProduced?: number;
  apy: string;
  tier?: string;
}

interface ValidatorsResponse {
  validators: Validator[];
  summary: {
    total: number;
    active: number;
    inactive: number;
    totalStaked: string;
    avgUptime: string;
    avgApy: string;
  };
}

export default function ValidatorsList() {
  const { t } = useTranslation();

  const { data: validatorsData, isLoading } = useQuery<{ success: boolean; data: ValidatorsResponse }>({
    queryKey: ["/api/public/v1/validators"],
  });

  const validators = validatorsData?.data?.validators || [];
  const summary = validatorsData?.data?.summary;

  const formatAddress = (addr: string) => {
    if (!addr) return "-";
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  const formatStake = (stake: string) => {
    const num = parseFloat(stake);
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toFixed(2);
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
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white" data-testid="title-validators">
                {t("scan.validators", "Validators")}
              </h1>
              <p className="text-sm text-gray-400">
                {t("scan.validatorsDesc", "TBURN Mainnet validator nodes")}
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gray-900/50 border-gray-800" data-testid="stat-total-validators">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <Shield className="w-4 h-4" />
                {t("scan.totalValidators", "Total Validators")}
              </div>
              <div className="text-2xl font-bold text-white">
                {summary?.total || validators.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800" data-testid="stat-active-validators">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <Users className="w-4 h-4 text-green-400" />
                {t("scan.activeValidators", "Active")}
              </div>
              <div className="text-2xl font-bold text-green-400">
                {summary?.active || validators.filter(v => v.status === 'active').length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800" data-testid="stat-total-staked">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <Coins className="w-4 h-4" />
                {t("scan.totalStaked", "Total Staked")}
              </div>
              <div className="text-2xl font-bold text-white">
                {summary?.totalStaked ? formatStake(summary.totalStaked) : "0"} TBURN
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800" data-testid="stat-avg-apy">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <TrendingUp className="w-4 h-4 text-green-400" />
                {t("scan.avgApy", "Average APY")}
              </div>
              <div className="text-2xl font-bold text-green-400">
                {summary?.avgApy || "0"}%
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-900/50 border-gray-800" data-testid="card-validators-table">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              {t("scan.validatorLeaderboard", "Validator Leaderboard")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800 hover:bg-transparent">
                      <TableHead className="text-gray-400 w-16">{t("scan.rank", "Rank")}</TableHead>
                      <TableHead className="text-gray-400">{t("scan.validator", "Validator")}</TableHead>
                      <TableHead className="text-gray-400">{t("scan.status", "Status")}</TableHead>
                      <TableHead className="text-gray-400">{t("scan.stake", "Stake")}</TableHead>
                      <TableHead className="text-gray-400">{t("scan.uptime", "Uptime")}</TableHead>
                      <TableHead className="text-gray-400">{t("scan.commission", "Commission")}</TableHead>
                      <TableHead className="text-gray-400">{t("scan.apy", "APY")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validators.slice(0, 50).map((validator, index) => (
                      <TableRow 
                        key={validator.address} 
                        className="border-gray-800 hover:bg-gray-800/50"
                        data-testid={`validator-row-${index}`}
                      >
                        <TableCell className="font-medium text-gray-300">
                          {validator.rank || index + 1}
                        </TableCell>
                        <TableCell>
                          <Link href={`/scan/address/${validator.address}`}>
                            <div className="cursor-pointer">
                              <div className="text-white font-medium hover:text-blue-400">
                                {validator.name || "Unknown Validator"}
                              </div>
                              <div className="text-gray-400 font-mono text-xs">
                                {formatAddress(validator.address)}
                              </div>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge className={validator.status === 'active' ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}>
                            {validator.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-white font-medium">
                            {formatStake(validator.stake)} TBURN
                          </div>
                          {validator.delegators !== undefined && (
                            <div className="text-gray-400 text-xs">
                              {validator.delegators} delegators
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={parseFloat(validator.uptime)} 
                              className="w-16 h-2" 
                            />
                            <span className={`text-sm ${parseFloat(validator.uptime) >= 99 ? 'text-green-400' : parseFloat(validator.uptime) >= 95 ? 'text-yellow-400' : 'text-red-400'}`}>
                              {parseFloat(validator.uptime).toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {parseFloat(validator.commission).toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-green-400 font-medium">
                          {parseFloat(validator.apy).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
