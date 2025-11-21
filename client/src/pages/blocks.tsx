import { useQuery } from "@tanstack/react-query";
import { Blocks as BlocksIcon, ChevronRight } from "lucide-react";
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
import { formatAddress, formatTimeAgo, formatNumber, formatGas } from "@/lib/format";
import type { Block } from "@shared/schema";

export default function Blocks() {
  const { data: blocks, isLoading } = useQuery<Block[]>({
    queryKey: ["/api/blocks"],
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold flex items-center gap-2">
          <BlocksIcon className="h-8 w-8" />
          Blocks
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse all blocks on the TBURN blockchain
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Blocks</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : blocks && blocks.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Block</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Txns</TableHead>
                    <TableHead>Validator</TableHead>
                    <TableHead>Gas Used</TableHead>
                    <TableHead>Shard</TableHead>
                    <TableHead className="text-right">Size</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blocks.map((block) => (
                    <TableRow
                      key={block.id}
                      className="hover-elevate cursor-pointer"
                      data-testid={`row-block-${block.blockNumber}`}
                    >
                      <TableCell className="font-mono font-semibold">
                        #{formatNumber(block.blockNumber)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatTimeAgo(block.timestamp)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {block.transactionCount} txs
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {formatAddress(block.validatorAddress)}
                      </TableCell>
                      <TableCell className="tabular-nums text-sm">
                        {formatGas(block.gasUsed)} / {formatGas(block.gasLimit)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Shard {block.shardId}</Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm">
                        {formatNumber(block.size)} bytes
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No blocks found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
