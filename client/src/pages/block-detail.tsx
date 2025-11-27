import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Blocks, Clock, Database, User, Hash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAddress, formatTimeAgo, formatNumber, formatGasEmber } from "@/lib/format";
import type { Block, Transaction } from "@shared/schema";

export default function BlockDetail() {
  const { t } = useTranslation();
  const params = useParams<{ blockNumber: string }>();
  const blockNumber = parseInt(params.blockNumber || "0");

  const { data: block, isLoading: isLoadingBlock } = useQuery<Block>({
    queryKey: [`/api/blocks/${blockNumber}`],
    enabled: !!blockNumber,
  });

  const { data: transactions, isLoading: isLoadingTxs } = useQuery<Transaction[]>({
    queryKey: [`/api/blocks/${blockNumber}/transactions`],
    enabled: !!blockNumber,
  });

  if (isLoadingBlock) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-12 w-96" />
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
      </div>
    );
  }

  if (!block) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-semibold">{t('common.block')} #{blockNumber}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('blocks.blockBeingGenerated')}
          </p>
        </div>
      </div>
    );
  }

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
          {t('common.back')}
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-semibold flex items-center gap-2">
            <Blocks className="h-8 w-8" />
            {t('common.block')} #{formatNumber(block.blockNumber)}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('blocks.blockDetailsAndTx')}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('blocks.blockInformation')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('blocks.blockHeight')}</p>
                <p className="font-mono font-semibold">
                  {formatNumber(block.blockNumber)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('blocks.timestamp')}</p>
                <p className="text-sm">{formatTimeAgo(block.timestamp)}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">{t('blocks.blockHash')}</p>
              <p className="font-mono text-sm break-all">{block.hash}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">{t('blocks.parentHash')}</p>
              <p className="font-mono text-sm break-all">{block.parentHash}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('blocks.shard')}</p>
                <Badge variant="outline">{t('blocks.shard')} {block.shardId}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('common.transactions')}</p>
                <Badge variant="secondary">{block.transactionCount} {t('blocks.txns')}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.technicalDetails')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">{t('blocks.validator')}</p>
              <p className="font-mono text-sm">{formatAddress(block.validatorAddress)}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('blocks.gasUsed')}</p>
                <p className="tabular-nums text-sm">{formatGasEmber(block.gasUsed)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('blocks.gasLimit')}</p>
                <p className="tabular-nums text-sm">{formatGasEmber(block.gasLimit)}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">{t('blocks.stateRoot')}</p>
              <p className="font-mono text-sm break-all">{block.stateRoot}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('blocks.size')}</p>
                <p className="tabular-nums text-sm">{formatNumber(block.size)} bytes</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('blocks.hashAlgo')}</p>
                <Badge variant="outline">{block.hashAlgorithm}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('blocks.transactionsInBlock')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingTxs ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.hash')}</TableHead>
                    <TableHead>{t('common.from')}</TableHead>
                    <TableHead>{t('common.to')}</TableHead>
                    <TableHead>{t('common.value')}</TableHead>
                    <TableHead>{t('blocks.gasUsed')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono text-sm">
                        {formatAddress(tx.hash)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {formatAddress(tx.from)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {tx.to ? formatAddress(tx.to) : t('transactions.contractCreation')}
                      </TableCell>
                      <TableCell className="tabular-nums text-sm">
                        {formatNumber(parseInt(tx.value) / 1e18)} TBURN
                      </TableCell>
                      <TableCell className="tabular-nums text-sm">
                        {tx.gasUsed ? formatGasEmber(tx.gasUsed) : "---"}
                      </TableCell>
                      <TableCell>
                        {tx.status === "success" ? (
                          <Badge variant="outline" className="text-green-600">
                            {t('transactions.success')}
                          </Badge>
                        ) : tx.status === "pending" ? (
                          <Badge variant="secondary">{t('transactions.pending')}</Badge>
                        ) : (
                          <Badge variant="destructive">{t('transactions.failed')}</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{t('blocks.noTransactions')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
