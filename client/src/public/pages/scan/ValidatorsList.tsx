import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Shield, 
  TrendingUp, 
  Users, 
  Coins,
  Search,
  RefreshCw,
  Star,
  Award,
  Activity,
  Globe,
  Copy
} from "lucide-react";
import { useState, useCallback } from "react";
import { useScanWebSocket } from "../../hooks/useScanWebSocket";
import ScanLayout from "../../components/ScanLayout";
import { useToast } from "@/hooks/use-toast";

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
  location?: string;
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
  const { toast } = useToast();
  const { isConnected } = useScanWebSocket();
  const [searchValidator, setSearchValidator] = useState("");

  const { data, isLoading, error, refetch, isFetching } = useQuery<{ success: boolean; data: ValidatorsResponse }>({
    queryKey: ["/api/public/v1/validators"],
    refetchInterval: isConnected ? 10000 : 60000,
  });

  const validators = data?.data?.validators || [];
  const summary = data?.data?.summary;

  const filteredValidators = validators.filter(v => 
    v.name?.toLowerCase().includes(searchValidator.toLowerCase()) ||
    v.address?.toLowerCase().includes(searchValidator.toLowerCase())
  );

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t("scan.copied", "Copied!"),
      description: t("scan.copiedToClipboard", "Copied to clipboard"),
    });
  }, [toast, t]);

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

  const getTierBadge = (tier?: string) => {
    switch (tier?.toLowerCase()) {
      case 'diamond':
        return <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30"><Star className="w-3 h-3 mr-1" />Diamond</Badge>;
      case 'platinum':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30"><Award className="w-3 h-3 mr-1" />Platinum</Badge>;
      case 'gold':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Award className="w-3 h-3 mr-1" />Gold</Badge>;
      case 'silver':
        return <Badge className="bg-gray-400/20 text-gray-300 border-gray-400/30">Silver</Badge>;
      default:
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Bronze</Badge>;
    }
  };

  return (
    <ScanLayout>
      <div className="container mx-auto px-4 py-6 bg-gray-50 dark:bg-transparent transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2" data-testid="text-validators-title">
              <Shield className="w-6 h-6 text-purple-400" />
              {t("scan.validators", "Validators")}
              {isConnected && (
                <span className="relative flex h-2 w-2 ml-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              )}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              {t("scan.validatorsDesc", "TBURN Mainnet validator nodes")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                type="text"
                placeholder={t("scan.searchValidator", "Search validator...")}
                value={searchValidator}
                onChange={(e) => setSearchValidator(e.target.value)}
                className="pl-10 w-64 bg-gray-900/50 border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500"
                data-testid="input-search-validator"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="border-gray-700 text-gray-300 hover:text-gray-900 dark:hover:text-white"
              data-testid="button-refresh-validators"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              {t("scan.refresh", "Refresh")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border-purple-800/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-purple-400 text-xs mb-1 font-medium">
                <Shield className="w-3.5 h-3.5" />
                {t("scan.totalValidators", "Total Validators")}
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {summary?.total || validators.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/30 to-green-800/10 border-green-800/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-400 text-xs mb-1 font-medium">
                <Activity className="w-3.5 h-3.5" />
                {t("scan.activeValidators", "Active")}
              </div>
              <div className="text-2xl font-bold text-green-400">
                {summary?.active || validators.filter(v => v.status === 'active').length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 border-blue-800/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-blue-400 text-xs mb-1 font-medium">
                <Coins className="w-3.5 h-3.5" />
                {t("scan.totalStaked", "Total Staked")}
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {summary?.totalStaked ? formatStake(summary.totalStaked) : "0"} TBURN
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/10 border-yellow-800/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-yellow-400 text-xs mb-1 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                {t("scan.avgApy", "Average APY")}
              </div>
              <div className="text-2xl font-bold text-yellow-400">
                {summary?.avgApy || "0"}%
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2 text-base">
              <Award className="w-4 h-4 text-yellow-400" />
              {t("scan.validatorLeaderboard", "Validator Leaderboard")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-400">
                {t("scan.errorLoading", "Error loading validators. Please try again.")}
                <Button variant="outline" size="sm" className="ml-4" onClick={() => refetch()}>
                  {t("scan.retry", "Retry")}
                </Button>
              </div>
            ) : filteredValidators.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {t("scan.noValidators", "No validators found")}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800 hover:bg-transparent">
                      <TableHead className="text-gray-600 dark:text-gray-400 w-16">{t("scan.rank", "Rank")}</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-400">{t("scan.validator", "Validator")}</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-400">{t("scan.status", "Status")}</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-400">{t("scan.tier", "Tier")}</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-400">{t("scan.stake", "Stake")}</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-400">{t("scan.uptime", "Uptime")}</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-400">{t("scan.commission", "Commission")}</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-400">{t("scan.apy", "APY")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredValidators.slice(0, 50).map((validator, index) => (
                      <TableRow 
                        key={validator.address} 
                        className="border-gray-800 hover:bg-gray-800/30 group"
                        data-testid={`validator-row-${index}`}
                      >
                        <TableCell className="font-medium">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            index < 3 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-800 text-gray-600 dark:text-gray-400'
                          }`}>
                            {validator.rank || index + 1}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link href={`/scan/address/${validator.address}`}>
                            <div className="cursor-pointer group/name">
                              <div className="text-gray-900 dark:text-white font-medium hover:text-blue-400 flex items-center gap-2">
                                {validator.name || "Unknown Validator"}
                                {validator.location && (
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Globe className="w-3 h-3" />
                                    {validator.location}
                                  </span>
                                )}
                              </div>
                              <div className="text-gray-500 font-mono text-xs flex items-center gap-1">
                                {formatAddress(validator.address)}
                                <button 
                                  onClick={(e) => { e.preventDefault(); copyToClipboard(validator.address); }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Copy className="w-3 h-3 hover:text-gray-300" />
                                </button>
                              </div>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge className={validator.status === 'active' ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30"}>
                            <span className={`w-2 h-2 rounded-full mr-1.5 ${validator.status === 'active' ? 'bg-green-400' : 'bg-gray-400'}`} />
                            {validator.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getTierBadge(validator.tier)}
                        </TableCell>
                        <TableCell>
                          <div className="text-gray-900 dark:text-white font-medium">
                            {formatStake(validator.stake)} TBURN
                          </div>
                          {validator.delegators !== undefined && (
                            <div className="text-gray-500 text-xs flex items-center gap-1">
                              <Users className="w-3 h-3" />
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
                            <span className={`text-sm font-medium ${
                              parseFloat(validator.uptime) >= 99 ? 'text-green-400' : 
                              parseFloat(validator.uptime) >= 95 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {parseFloat(validator.uptime).toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {parseFloat(validator.commission).toFixed(1)}%
                        </TableCell>
                        <TableCell>
                          <span className="text-green-400 font-semibold flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {parseFloat(validator.apy).toFixed(1)}%
                          </span>
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
    </ScanLayout>
  );
}
