import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft, Activity, Clock, Hash, User, Fuel, Layers, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { formatAddress, formatTimeAgo, formatNumber, formatTokenAmount, formatGasPriceEmber, calculateTransactionFeeEmber, formatGasEmber } from "@/lib/format";
import type { Transaction } from "@shared/schema";

export default function TransactionDetail() {
  const params = useParams<{ hash: string }>();
  const txHash = params.hash || "";

  const { data: transaction, isLoading, error } = useQuery<Transaction>({
    queryKey: [`/api/transactions/${txHash}`],
    enabled: !!txHash && txHash.length > 0,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "pending":
        return <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />;
      default:
        return null;
    }
  };

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

  if (isLoading) {
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

  if (error || !transaction) {
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
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-semibold text-destructive">Transaction Not Found</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Transaction {formatAddress(txHash, 10, 10)} does not exist or could not be loaded
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
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8" />
            <h1 className="text-3xl font-semibold">Transaction Details</h1>
            {getStatusIcon(transaction.status)}
          </div>
          <p className="text-sm text-muted-foreground mt-1 font-mono">
            {formatAddress(transaction.hash, 16, 16)}
          </p>
        </div>
        {getStatusBadge(transaction.status)}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Transaction Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Transaction Hash</p>
              <p className="font-mono text-sm break-all" data-testid="text-tx-hash">
                {transaction.hash}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(transaction.status)}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Timestamp</p>
                <p className="text-sm" data-testid="text-tx-timestamp">
                  {formatTimeAgo(transaction.timestamp)}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Block Number</p>
                <Link 
                  href={`/blocks/${transaction.blockNumber}`}
                  className="font-mono text-sm text-primary hover:underline"
                  data-testid="link-block-number"
                >
                  #{formatNumber(transaction.blockNumber)}
                </Link>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Shard ID</p>
                <Badge variant="outline" data-testid="badge-shard">
                  Shard {transaction.shardId}
                </Badge>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Block Hash</p>
              <p className="font-mono text-sm break-all text-muted-foreground">
                {transaction.blockHash}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Addresses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">From</p>
              <p className="font-mono text-sm break-all" data-testid="text-tx-from">
                {transaction.from}
              </p>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground">To</p>
              {transaction.to ? (
                <p className="font-mono text-sm break-all" data-testid="text-tx-to">
                  {transaction.to}
                </p>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Contract Creation</Badge>
                  {transaction.contractAddress && (
                    <p className="font-mono text-sm text-muted-foreground">
                      {formatAddress(transaction.contractAddress)}
                    </p>
                  )}
                </div>
              )}
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground">Value</p>
              <p className="text-2xl font-bold" data-testid="text-tx-value">
                {formatTokenAmount(transaction.value)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fuel className="h-5 w-5" />
            Gas & Fees
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Gas Limit</p>
              <p className="font-mono text-lg font-semibold" data-testid="text-gas-limit">
                {formatNumber(transaction.gas)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gas Used</p>
              <p className="font-mono text-lg font-semibold" data-testid="text-gas-used">
                {transaction.gasUsed != null ? formatGasEmber(transaction.gasUsed) : (
                  <span className="text-muted-foreground">Pending</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gas Price</p>
              <p className="font-mono text-lg font-semibold" data-testid="text-gas-price">
                {formatGasPriceEmber(transaction.gasPrice)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Transaction Fee</p>
              <p className="font-mono text-lg font-semibold text-primary" data-testid="text-tx-fee">
                {transaction.gasUsed != null ? calculateTransactionFeeEmber(transaction.gasPrice, transaction.gasUsed) : (
                  <span className="text-muted-foreground">Pending</span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Technical Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Nonce</p>
              <p className="font-mono" data-testid="text-nonce">
                {transaction.nonce}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Execution Class</p>
              <Badge variant="outline" data-testid="badge-execution-class">
                {transaction.executionClass || "standard"}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hash Algorithm</p>
              <Badge variant="outline" data-testid="badge-hash-algo">
                {transaction.hashAlgorithm || "BLAKE3"}
              </Badge>
            </div>
          </div>

          {transaction.input && transaction.input !== "0x" && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Input Data</p>
              <div className="bg-muted p-3 rounded-md">
                <p className="font-mono text-xs break-all max-h-32 overflow-auto">
                  {transaction.input}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
