import { useQuery } from "@tanstack/react-query";
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
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge variant="default" className="bg-green-600">Success</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold flex items-center gap-2">
          <Activity className="h-8 w-8" />
          Transactions
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse all transactions on the TBURN blockchain
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
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
                    <TableHead>Tx Hash</TableHead>
                    <TableHead>Block</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Gas Used</TableHead>
                    <TableHead>Gas Price (EMB)</TableHead>
                    <TableHead>Fee (EMB)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow
                      key={tx.id}
                      className="hover-elevate cursor-pointer"
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
                          <span className="text-muted-foreground italic">Contract Creation</span>
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
                          <span className="text-muted-foreground">Pending</span>
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
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
