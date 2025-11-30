import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Wallet, Search, TrendingUp, Users, DollarSign, Award } from "lucide-react";
import { formatAddress } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/stat-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber } from "@/lib/format";
import { useWebSocketChannel } from "@/hooks/use-websocket-channel";
import { walletBalancesSnapshotSchema } from "@shared/schema";
import type { WalletBalance } from "@shared/schema";

export default function Wallets() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: wallets, isLoading } = useQuery<WalletBalance[]>({
    queryKey: ["/api/wallets"],
  });

  // WebSocket integration for real-time wallet balance updates
  useWebSocketChannel({
    channel: "wallet_balances_snapshot",
    schema: walletBalancesSnapshotSchema,
    queryKey: ["/api/wallets"],
    updateMode: "snapshot",
  });

  // Filter wallets by search term
  const filteredWallets = wallets?.filter(wallet =>
    wallet.address.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Calculate stats
  const totalWallets = wallets?.length || 0;
  const totalBalance = wallets?.reduce((sum, w) => sum + parseFloat(w.balance), 0) || 0;
  const totalRewards = wallets?.reduce((sum, w) => sum + parseFloat(w.rewardsEarned), 0) || 0;
  const activeWallets = wallets?.filter(w => w.lastTransactionAt).length || 0;

  // Format Wei to TBURN (divide by 1e18)
  const formatBalance = (wei: string) => {
    const tburn = parseFloat(wei) / 1e18;
    return tburn.toFixed(4);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold flex items-center gap-2" data-testid="text-wallets-title">
          <Wallet className="h-8 w-8" />
          {t('wallets.title', 'Wallet Explorer')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('wallets.subtitle', 'Track wallet balances, stakes, and rewards')}
        </p>
      </div>

      {/* Wallet Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <StatCard
              title={t('wallets.totalWallets', 'Total Wallets')}
              value={formatNumber(totalWallets)}
              icon={Users}
              subtitle={t('wallets.registeredAddresses', 'registered addresses')}
            />
            <StatCard
              title={t('wallets.totalBalance', 'Total Balance')}
              value={`${formatBalance(totalBalance.toString())} TBURN`}
              icon={DollarSign}
              subtitle={t('wallets.acrossAllWallets', 'across all wallets')}
            />
            <StatCard
              title={t('wallets.totalRewards', 'Total Rewards')}
              value={`${formatBalance(totalRewards.toString())} TBURN`}
              icon={Award}
              trend={{ value: 18.3, isPositive: true }}
              subtitle={t('wallets.distributed', 'distributed')}
            />
            <StatCard
              title={t('wallets.activeWallets', 'Active Wallets')}
              value={formatNumber(activeWallets)}
              icon={TrendingUp}
              subtitle={t('wallets.withTransactions', 'with transactions')}
            />
          </>
        )}
      </div>

      {/* Wallet List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>{t('wallets.walletAddresses', 'Wallet Addresses')}</CardTitle>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('wallets.searchByAddress', 'Search by address...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                data-testid="input-wallet-search"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredWallets.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.address', 'Address')}</TableHead>
                    <TableHead>{t('common.balance', 'Balance')}</TableHead>
                    <TableHead>{t('wallets.staked', 'Staked')}</TableHead>
                    <TableHead>{t('wallets.unstaked', 'Unstaked')}</TableHead>
                    <TableHead>{t('wallets.rewards', 'Rewards')}</TableHead>
                    <TableHead>{t('common.transactions', 'Transactions')}</TableHead>
                    <TableHead>{t('wallets.lastActivity', 'Last Activity')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWallets.map((wallet) => (
                    <TableRow 
                      key={wallet.id} 
                      className="hover-elevate cursor-pointer" 
                      onClick={() => setLocation(`/wallets/${wallet.address}`)}
                      data-testid={`row-wallet-${wallet.address}`}
                    >
                      <TableCell className="font-mono text-sm" title={wallet.address}>
                        {formatAddress(wallet.address)}
                      </TableCell>
                      <TableCell className="font-semibold tabular-nums">
                        {formatBalance(wallet.balance)} TBURN
                      </TableCell>
                      <TableCell className="tabular-nums text-green-600 dark:text-green-400">
                        {formatBalance(wallet.stakedBalance)}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatBalance(wallet.unstakedBalance)}
                      </TableCell>
                      <TableCell className="tabular-nums text-blue-600 dark:text-blue-400">
                        {formatBalance(wallet.rewardsEarned)}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        <Badge variant="outline">{formatNumber(wallet.transactionCount)} txs</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm tabular-nums">
                        {wallet.lastTransactionAt ? new Date(wallet.lastTransactionAt).toLocaleString() : t('wallets.never', 'Never')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm ? t('wallets.noWalletsMatching', `No wallets matching "${searchTerm}"`) : t('wallets.noWalletsFound', 'No wallets found')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
