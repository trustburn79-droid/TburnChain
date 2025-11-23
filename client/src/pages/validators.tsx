import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { Server, Award, Users, TrendingUp, Shield, Target, Brain, Vote, Coins, Crown } from "lucide-react";
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
import { useEffect, useState } from "react";
import { useWebSocket } from "@/lib/websocket-context";

export default function Validators() {
  const { data: validators, isLoading } = useQuery<Validator[]>({
    queryKey: ["/api/validators"],
  });

  const [votingActivity, setVotingActivity] = useState<any[]>([]);
  const [validatorUpdates, setValidatorUpdates] = useState<any>(null);

  // Subscribe to WebSocket updates
  const { lastMessage } = useWebSocket();
  
  useEffect(() => {
    if (lastMessage?.data) {
      try {
        const message = JSON.parse(lastMessage.data);
        if (message.type === 'voting_activity') {
          setVotingActivity(message.data);
          // Invalidate the cache to trigger refetch with new data
          queryClient.invalidateQueries({ queryKey: ['/api/validators'] });
        } else if (message.type === 'validators_update') {
          setValidatorUpdates(message.data);
          // Invalidate the cache to trigger refetch with new data
          queryClient.invalidateQueries({ queryKey: ['/api/validators'] });
        }
      } catch (error) {
        // Ignore JSON parse errors
      }
    }
  }, [lastMessage]);

  // Calculate validators with voting power and committee status
  const validatorsWithPower = validators?.map(v => {
    const votingPower = BigInt(v.stake) + BigInt(v.delegatedStake || 0);
    return {
      ...v,
      votingPower: votingPower.toString(),
      votingPowerNumber: Number(votingPower / BigInt(1e18)), // Convert to TBURN units for display
    };
  }).sort((a, b) => Number(BigInt(b.votingPower) - BigInt(a.votingPower))) || [];

  // Top 21 validators are committee members
  const committeeMembers = new Set(validatorsWithPower.slice(0, 21).map(v => v.address));

  const activeValidators = validators?.filter(v => v.status === "active").length || 0;
  const totalStake = validators?.reduce((sum, v) => sum + parseFloat(v.stake), 0) || 0;
  const totalDelegated = validators?.reduce((sum, v) => sum + parseFloat(v.delegatedStake || "0"), 0) || 0;
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {isLoading ? (
          <>
            <Skeleton className="h-32" />
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
              subtitle="direct staked"
            />
            <StatCard
              title="Delegated Stake"
              value={`${formatNumber(totalDelegated)} TBURN`}
              icon={Coins}
              subtitle="delegated tokens"
            />
            <StatCard
              title="Committee Size"
              value="21"
              icon={Crown}
              subtitle="top validators"
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
                    <TableHead>Rank</TableHead>
                    <TableHead>Validator</TableHead>
                    <TableHead>Committee</TableHead>
                    <TableHead>Voting Power</TableHead>
                    <TableHead>Direct Stake</TableHead>
                    <TableHead>Delegated</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>APY</TableHead>
                    <TableHead>Uptime</TableHead>
                    <TableHead>AI Trust</TableHead>
                    <TableHead>Blocks</TableHead>
                    <TableHead>Delegators</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validatorsWithPower.map((validator, index) => {
                    const isCommitteeMember = committeeMembers.has(validator.address);
                    const delegatedAmount = parseFloat(validator.delegatedStake || "0") / 1e18;
                    const directStake = parseFloat(validator.stake) / 1e18;
                    
                    return (
                      <TableRow
                        key={validator.id}
                        className="hover-elevate cursor-pointer"
                        data-testid={`row-validator-${validator.address.slice(0, 10)}`}
                        onClick={() => window.location.href = `/validator/${validator.address}`}
                      >
                        <TableCell className="font-mono text-sm">
                          #{index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Link href={`/validator/${validator.address}`}>
                              <span className="font-semibold text-primary hover:underline">{validator.name}</span>
                            </Link>
                            <span className="font-mono text-xs text-muted-foreground">
                              {formatAddress(validator.address)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {isCommitteeMember ? (
                            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                              <Crown className="h-3 w-3 mr-1" />
                              Committee
                            </Badge>
                          ) : (
                            <Badge variant="outline">Non-Committee</Badge>
                          )}
                        </TableCell>
                        <TableCell className="tabular-nums font-medium">
                          <div className="flex items-center gap-1">
                            <Vote className="h-3 w-3 text-purple-500" />
                            {formatNumber(validator.votingPowerNumber)} TBURN
                          </div>
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {formatNumber(directStake)} TBURN
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {delegatedAmount > 0 ? (
                            <div className="flex items-center gap-1">
                              <Coins className="h-3 w-3 text-yellow-500" />
                              {formatNumber(delegatedAmount)} TBURN
                            </div>
                          ) : (
                            <span className="text-muted-foreground">0 TBURN</span>
                          )}
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
                        {/* AI Trust Score for TBURN v7.0 */}
                        <TableCell data-testid={`metric-aitrust-${validator.address.slice(0, 10)}`}>
                          <div className="flex items-center gap-2">
                            <Brain className="h-3 w-3 text-purple-500" />
                            <span className="text-sm tabular-nums font-medium">{(validator.aiTrustScore / 100).toFixed(1)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {formatNumber(validator.totalBlocks)}
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {formatNumber(validator.delegators)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
