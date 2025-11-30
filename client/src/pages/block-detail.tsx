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
          <h1 className="text-3xl font-semibold">{t('common.block', 'Block')} #{blockNumber}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('blocks.blockBeingGenerated', 'This block is being generated')}
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
          {t('common.back', 'Back')}
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-semibold flex items-center gap-2">
            <Blocks className="h-8 w-8" />
            {t('common.block', 'Block')} #{formatNumber(block.blockNumber)}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('blocks.blockDetailsAndTx', 'Block details and transactions')}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('blocks.blockInformation', 'Block Information')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('blocks.blockHeight', 'Block Height')}</p>
                <p className="font-mono font-semibold">
                  {formatNumber(block.blockNumber)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('blocks.timestamp', 'Timestamp')}</p>
                <p className="text-sm">{formatTimeAgo(block.timestamp)}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">{t('blocks.blockHash', 'Block Hash')}</p>
              <p className="font-mono text-sm break-all">{block.hash}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">{t('blocks.parentHash', 'Parent Hash')}</p>
              <p className="font-mono text-sm break-all">{block.parentHash}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('blocks.shard', 'Shard')}</p>
                <Badge variant="outline">{t('blocks.shard', 'Shard')} {block.shardId}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('common.transactions', 'Transactions')}</p>
                <Badge variant="secondary">{block.transactionCount} {t('blocks.txns', 'txns')}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.technicalDetails', 'Technical Details')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">{t('blocks.validator', 'Validator')}</p>
              <p className="font-mono text-sm">{formatAddress(block.validatorAddress)}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('blocks.gasUsed', 'Gas Used')}</p>
                <p className="tabular-nums text-sm">{formatGasEmber(block.gasUsed)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('blocks.gasLimit', 'Gas Limit')}</p>
                <p className="tabular-nums text-sm">{formatGasEmber(block.gasLimit)}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">{t('blocks.stateRoot', 'State Root')}</p>
              <p className="font-mono text-sm break-all">{block.stateRoot}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('blocks.size', 'Size')}</p>
                <p className="tabular-nums text-sm">{formatNumber(block.size)} bytes</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('blocks.hashAlgo', 'Hash Algo')}</p>
                <Badge variant="outline">{block.hashAlgorithm}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('blocks.transactionsInBlock', 'Transactions in Block')}</CardTitle>
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
                    <TableHead>{t('common.hash', 'Hash')}</TableHead>
                    <TableHead>{t('common.from', 'From')}</TableHead>
                    <TableHead>{t('common.to', 'To')}</TableHead>
                    <TableHead>{t('common.value', 'Value')}</TableHead>
                    <TableHead>{t('blocks.gasUsed', 'Gas Used')}</TableHead>
                    <TableHead>{t('common.status', 'Status')}</TableHead>
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
                        {tx.to ? formatAddress(tx.to) : t('transactions.contractCreation', 'Contract Creation')}
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
                            {t('transactions.success', 'Success')}
                          </Badge>
                        ) : tx.status === "pending" ? (
                          <Badge variant="secondary">{t('transactions.pending', 'Pending')}</Badge>
                        ) : (
                          <Badge variant="destructive">{t('transactions.failed', 'Failed')}</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{t('blocks.noTransactions', 'No transactions in this block')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
