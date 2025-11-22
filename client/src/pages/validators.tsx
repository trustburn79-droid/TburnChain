import { useQuery } from "@tanstack/react-query";
import { Server, Award, Users, TrendingUp, Shield, Target, Brain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/stat-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAddress, formatTokenAmount, formatPercentage, formatNumber } from "@/lib/format";
import type { Validator } from "@shared/schema";

export default function Validators() {
  const { data: validators, isLoading } = useQuery<Validator[]>({
    queryKey: ["/api/validators"],
  });

  const activeValidators = validators?.filter(v => v.status === "active").length || 0;
  const totalStake = validators?.reduce((sum, v) => sum + parseFloat(v.stake), 0) || 0;
  // Convert basis points to percentage (10000 = 100.00%)
  const avgApy = (validators?.reduce((sum, v) => sum + v.apy, 0) || 0) / (validators?.length || 1) / 100;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-600">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "jailed":
        return <Badge variant="destructive">Jailed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold flex items-center gap-2">
          <Server className="h-8 w-8" />
          Validators
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI-Enhanced Committee BFT: Stake + Reputation + Performance
        </p>
      </div>

      {/* Validator Stats */}
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
              title="Active Validators"
              value={activeValidators}
              icon={Server}
              subtitle={`of ${validators?.length || 0} total`}
            />
            <StatCard
              title="Total Stake"
              value={`${formatNumber(totalStake)} TBURN`}
              icon={Award}
              subtitle="total staked"
            />
            <StatCard
              title="Average APY"
              value={`${avgApy.toFixed(2)}%`}
              icon={TrendingUp}
              subtitle="annual return"
            />
            <StatCard
              title="Total Delegators"
              value={formatNumber(validators?.reduce((sum, v) => sum + v.delegators, 0) || 0)}
              icon={Users}
              subtitle="unique delegators"
            />
          </>
        )}
      </div>

      {/* Validators Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Validators</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : validators && validators.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Validator</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Stake</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>APY</TableHead>
                    <TableHead>Uptime</TableHead>
                    <TableHead>Reputation</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>AI Trust</TableHead>
                    <TableHead>Committee</TableHead>
                    <TableHead>Blocks</TableHead>
                    <TableHead>Delegators</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validators.map((validator) => (
                    <TableRow
                      key={validator.id}
                      className="hover-elevate cursor-pointer"
                      data-testid={`row-validator-${validator.address.slice(0, 10)}`}
                    >
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold">{validator.name}</span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {formatAddress(validator.address)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(validator.status)}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatNumber(validator.stake)} TBURN
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {(validator.commission / 100).toFixed(2)}%
                      </TableCell>
                      <TableCell className="tabular-nums text-green-600 dark:text-green-400 font-medium">
                        {(validator.apy / 100).toFixed(2)}%
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={validator.uptime / 100} className="w-16" />
                          <span className="text-sm tabular-nums">{(validator.uptime / 100).toFixed(2)}%</span>
                        </div>
                      </TableCell>
                      {/* TBURN v7.0: AI-Enhanced Committee BFT - Reputation System */}
                      <TableCell data-testid={`metric-reputation-${validator.address.slice(0, 10)}`}>
                        <div className="flex items-center gap-2">
                          <Shield className="h-3 w-3 text-blue-500" />
                          <span className="text-sm tabular-nums font-medium">{(validator.reputationScore / 100).toFixed(1)}%</span>
                        </div>
                      </TableCell>
                      <TableCell data-testid={`metric-performance-${validator.address.slice(0, 10)}`}>
                        <div className="flex items-center gap-2">
                          <Target className="h-3 w-3 text-green-500" />
                          <span className="text-sm tabular-nums font-medium">{(validator.performanceScore / 100).toFixed(1)}%</span>
                        </div>
                      </TableCell>
                      <TableCell data-testid={`metric-aitrust-${validator.address.slice(0, 10)}`}>
                        <div className="flex items-center gap-2">
                          <Brain className="h-3 w-3 text-purple-500" />
                          <span className="text-sm tabular-nums font-medium">{(validator.aiTrustScore / 100).toFixed(1)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="tabular-nums" data-testid={`metric-committee-${validator.address.slice(0, 10)}`}>
                        <Badge variant="outline" className="font-mono text-xs">
                          {formatNumber(validator.committeeSelectionCount)}
                        </Badge>
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatNumber(validator.totalBlocks)}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatNumber(validator.delegators)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No validators found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
