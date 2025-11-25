import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
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
          <h1 className="text-3xl font-semibold">Block Not Found</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Block #{blockNumber} does not exist
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
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-semibold flex items-center gap-2">
            <Blocks className="h-8 w-8" />
            Block #{formatNumber(block.blockNumber)}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Block details and transactions
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Block Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Block Height</p>
                <p className="font-mono font-semibold">
                  {formatNumber(block.blockNumber)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Timestamp</p>
                <p className="text-sm">{formatTimeAgo(block.timestamp)}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Block Hash</p>
              <p className="font-mono text-sm break-all">{block.hash}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Parent Hash</p>
              <p className="font-mono text-sm break-all">{block.parentHash}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Shard ID</p>
                <Badge variant="outline">Shard {block.shardId}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <Badge variant="secondary">{block.transactionCount} txs</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technical Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Validator</p>
              <p className="font-mono text-sm">{formatAddress(block.validatorAddress)}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Gas Used</p>
                <p className="tabular-nums text-sm">{formatGasEmber(block.gasUsed)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gas Limit</p>
                <p className="tabular-nums text-sm">{formatGasEmber(block.gasLimit)}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">State Root</p>
              <p className="font-mono text-sm break-all">{block.stateRoot}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Size</p>
                <p className="tabular-nums text-sm">{formatNumber(block.size)} bytes</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hash Algorithm</p>
                <Badge variant="outline">{block.hashAlgorithm}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions in Block</CardTitle>
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
                    <TableHead>Hash</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Gas Used</TableHead>
                    <TableHead>Status</TableHead>
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
                        {tx.to ? formatAddress(tx.to) : "Contract Creation"}
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
                            Success
                          </Badge>
                        ) : tx.status === "pending" ? (
                          <Badge variant="secondary">Pending</Badge>
                        ) : (
                          <Badge variant="destructive">Failed</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No transactions in this block</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}