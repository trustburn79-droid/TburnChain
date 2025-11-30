import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAddress, formatTimeAgo, formatTokenAmount, formatGasPriceEmber, calculateTransactionFeeEmber, formatGasEmber } from "@/lib/format";
import type { Transaction } from "@shared/schema";

export default function Transactions() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge variant="default" className="bg-green-600">{t('transactions.success', 'Success')}</Badge>;
      case "failed":
        return <Badge variant="destructive">{t('transactions.failed', 'Failed')}</Badge>;
      case "pending":
        return <Badge variant="secondary">{t('transactions.pending', 'Pending')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold flex items-center gap-2" data-testid="text-transactions-title">
          <Activity className="h-8 w-8" />
          {t('transactions.title', 'Transactions Explorer')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('transactions.subtitle', 'Browse all transactions on the TBURN blockchain')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('common.all', 'All')} {t('common.transactions', 'Transactions')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('transactions.txHash', 'Transaction Hash')}</TableHead>
                    <TableHead>{t('common.block', 'Block')}</TableHead>
                    <TableHead>{t('common.time', 'Time')}</TableHead>
                    <TableHead>{t('common.from', 'From')}</TableHead>
                    <TableHead>{t('common.to', 'To')}</TableHead>
                    <TableHead>{t('common.value', 'Value')}</TableHead>
                    <TableHead>{t('transactions.gasUsed', 'Gas Used')}</TableHead>
                    <TableHead>{t('transactions.gasPrice', 'Gas Price')}</TableHead>
                    <TableHead>{t('common.fee', 'Fee')}</TableHead>
                    <TableHead>{t('common.status', 'Status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow
                      key={tx.id}
                      className="hover-elevate cursor-pointer"
                      onClick={() => tx.hash && setLocation(`/transactions/${tx.hash}`)}
                      data-testid={`row-transaction-${tx.hash?.slice(0, 10) || 'unknown'}`}
                    >
                      <TableCell className="font-mono text-sm font-medium">
                        {formatAddress(tx.hash, 8, 6)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {tx.blockNumber != null ? `#${tx.blockNumber.toLocaleString()}` : '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                        {formatTimeAgo(tx.timestamp)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {formatAddress(tx.from)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {tx.to ? formatAddress(tx.to) : (
                          <span className="text-muted-foreground italic">{t('transactions.contractCreation', 'Contract Creation')}</span>
                        )}
                      </TableCell>
                      <TableCell className="tabular-nums text-sm">
                        {formatTokenAmount(tx.value)}
                      </TableCell>
                      <TableCell className="tabular-nums text-sm">
                        {tx.gasUsed != null ? formatGasEmber(tx.gasUsed) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="tabular-nums text-sm">
                        {formatGasPriceEmber(tx.gasPrice)}
                      </TableCell>
                      <TableCell className="tabular-nums text-sm font-medium">
                        {tx.gasUsed != null ? calculateTransactionFeeEmber(tx.gasPrice, tx.gasUsed) : (
                          <span className="text-muted-foreground">{t('common.pending', 'Pending')}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(tx.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('errors.notFound', 'No transactions found')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
