import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Wallet, Coins, Lock, Unlock, Award, Activity, Clock, Hash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { formatNumber } from "@/lib/format";
import type { WalletBalance, Transaction } from "@shared/schema";

export default function WalletDetail() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const params = useParams<{ address: string }>();
  const walletAddress = params.address || "";

  const { data: wallet, isLoading, error } = useQuery<WalletBalance>({
    queryKey: [`/api/wallets/${walletAddress}`],
    enabled: !!walletAddress && walletAddress.length > 0,
  });

  const { data: transactions, isLoading: isLoadingTxs } = useQuery<Transaction[]>({
    queryKey: [`/api/wallets/${walletAddress}/transactions`],
    enabled: !!walletAddress && walletAddress.length > 0,
  });

  const formatBalance = (wei: string) => {
    const tburn = parseFloat(wei) / 1e18;
    return tburn.toFixed(4);
  };

  const formatAddress = (addr: string, prefixLen = 10, suffixLen = 8) => {
    if (!addr || addr.length <= prefixLen + suffixLen) return addr;
    return `${addr.slice(0, prefixLen)}...${addr.slice(-suffixLen)}`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-12 w-96" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !wallet) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.history.back()}
          className="w-fit"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back', 'Back')}
        </Button>
        <div>
          <h1 className="text-3xl font-semibold text-destructive">{t('wallets.walletNotFound', 'Wallet Not Found')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('wallets.walletNotFoundDesc', `Wallet ${formatAddress(walletAddress)} not found`)}
          </p>
        </div>
      </div>
    );
  }

  const balance = parseFloat(wallet.balance);
  const stakedBalance = parseFloat(wallet.stakedBalance);
  const unstakedBalance = parseFloat(wallet.unstakedBalance);
  const rewardsEarned = parseFloat(wallet.rewardsEarned);
  const stakingPercentage = balance > 0 ? ((stakedBalance / balance) * 100).toFixed(1) : "0";

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.history.back()}
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back', 'Back')}
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Wallet className="h-8 w-8" />
            <h1 className="text-3xl font-semibold">{t('wallets.walletDetails', 'Wallet Details')}</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1 font-mono" data-testid="text-wallet-address">
            {wallet.address}
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {formatNumber(wallet.transactionCount)} {t('common.transactions', 'Transactions')}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              {t('wallets.balanceOverview', 'Balance Overview')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground">{t('wallets.totalBalance', 'Total Balance')}</p>
              <p className="text-3xl font-bold" data-testid="text-total-balance">
                {formatBalance(wallet.balance)} <span className="text-lg text-muted-foreground">TBURN</span>
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4 text-green-500" />
                  <p className="text-sm text-muted-foreground">{t('wallets.staked', 'Staked')}</p>
                </div>
                <p className="text-xl font-bold text-green-600 dark:text-green-400" data-testid="text-staked-balance">
                  {formatBalance(wallet.stakedBalance)} TBURN
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stakingPercentage}% {t('common.total', 'of total')}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-2 mb-2">
                  <Unlock className="h-4 w-4" />
                  <p className="text-sm text-muted-foreground">{t('wallets.available', 'Available')}</p>
                </div>
                <p className="text-xl font-bold" data-testid="text-unstaked-balance">
                  {formatBalance(wallet.unstakedBalance)} TBURN
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('common.balance', 'Balance')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              {t('wallets.rewards', 'Rewards')} & {t('members.activity', 'Activity')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-4 w-4 text-blue-500" />
                <p className="text-sm text-muted-foreground">{t('wallets.totalRewards', 'Total Rewards')}</p>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-rewards-earned">
                {formatBalance(wallet.rewardsEarned)} TBURN
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{t('blocks.transactionCount', 'Transaction Count')}</p>
                </div>
                <p className="text-lg font-semibold mt-1" data-testid="text-tx-count">
                  {formatNumber(wallet.transactionCount)}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{t('wallets.lastActivity', 'Last Activity')}</p>
                </div>
                <p className="text-sm mt-1" data-testid="text-last-activity">
                  {wallet.lastTransactionAt 
                    ? new Date(wallet.lastTransactionAt).toLocaleString('en-US', { timeZone: 'America/New_York' }) 
                    : t('wallets.never', 'Never')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            {t('wallets.walletDetails', 'Wallet Details')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">{t('common.address', 'Address')}</p>
              <p className="font-mono text-sm break-all" data-testid="text-full-address">
                {wallet.address}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('common.wallet', 'Wallet')} ID</p>
              <p className="font-mono text-sm" data-testid="text-wallet-id">
                {wallet.id}
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <p className="text-2xl font-bold">{formatBalance(wallet.balance)}</p>
              <p className="text-xs text-muted-foreground">{t('common.total', 'Total')} TBURN</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-green-500/10">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stakingPercentage}%</p>
              <p className="text-xs text-muted-foreground">{t('wallets.stakingOverview', 'Staking Overview')}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-blue-500/10">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatBalance(wallet.rewardsEarned)}</p>
              <p className="text-xs text-muted-foreground">{t('wallets.rewards', 'Rewards')}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <p className="text-2xl font-bold">{formatNumber(wallet.transactionCount)}</p>
              <p className="text-xs text-muted-foreground">{t('common.transactions', 'Transactions')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {transactions && transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {t('wallets.recentTransactions', 'Recent Transactions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {transactions.slice(0, 10).map((tx) => (
                <div 
                  key={tx.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover-elevate cursor-pointer"
                  onClick={() => tx.hash && setLocation(`/app/transactions/${tx.hash}`)}
                  data-testid={`row-tx-${tx.hash?.slice(0, 10)}`}
                >
                  <div className="flex items-center gap-3">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-mono text-sm">{formatAddress(tx.hash, 12, 8)}</p>
                      <p className="text-xs text-muted-foreground">
                        Block #{formatNumber(tx.blockNumber)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={tx.status === "success" ? "default" : tx.status === "failed" ? "destructive" : "secondary"}
                      className={tx.status === "success" ? "bg-green-600" : ""}
                    >
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
