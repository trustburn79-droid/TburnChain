import { useQuery } from "@tanstack/react-query";
import { Server, Award, Users, TrendingUp } from "lucide-react";
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
  const avgApy = validators?.reduce((sum, v) => sum + v.apy, 0) / (validators?.length || 1) || 0;

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
          Network validators and staking information
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
                        {validator.commission}%
                      </TableCell>
                      <TableCell className="tabular-nums text-green-600 dark:text-green-400 font-medium">
                        {validator.apy}%
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={validator.uptime} className="w-16" />
                          <span className="text-sm tabular-nums">{validator.uptime}%</span>
                        </div>
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
