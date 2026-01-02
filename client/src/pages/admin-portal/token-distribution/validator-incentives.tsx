import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Server, Coins, Activity, Award, Search, RefreshCw, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const formatTBURN = (amount: string) => {
  const num = BigInt(amount || '0');
  const tburn = Number(num) / 1e18;
  if (tburn >= 1e6) return `${(tburn / 1e6).toFixed(2)}M`;
  if (tburn >= 1e3) return `${(tburn / 1e3).toFixed(2)}K`;
  return tburn.toFixed(4);
};

export default function AdminValidatorIncentives() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: payouts, isLoading, refetch } = useQuery<{ success: boolean; data: any[] }>({
    queryKey: ['/api/admin/token-programs/validator-incentives/payouts'],
  });

  const { data: stats } = useQuery<{ success: boolean; data: any }>({
    queryKey: ['/api/admin/token-programs/dashboard'],
  });

  const validatorStats = stats?.data?.validatorIncentives || { totalPayouts: 0, totalAmount: "0", avgUptimePercent: 100, topPerformers: 0 };
  const payoutList = Array.isArray(payouts?.data) ? payouts.data : [];

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="admin-validator-incentives-page">
      <div className="flex items-center gap-4">
        <Link href="/admin/token-distribution">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            검증자 인센티브 관리
          </h1>
          <p className="text-muted-foreground">Validator Incentives Management</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh">
          <RefreshCw className="mr-2 h-4 w-4" />
          새로고침
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total-payouts">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">총 지급</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{validatorStats.totalPayouts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Payouts</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-amount">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">총 금액</CardTitle>
            <Coins className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTBURN(validatorStats.totalAmount)} TBURN</div>
            <p className="text-xs text-muted-foreground">Total Amount</p>
          </CardContent>
        </Card>
        <Card data-testid="card-avg-uptime">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">평균 가동률</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{validatorStats.avgUptimePercent.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">Avg Uptime</p>
          </CardContent>
        </Card>
        <Card data-testid="card-top-performers">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">우수 검증자</CardTitle>
            <Award className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{validatorStats.topPerformers}</div>
            <p className="text-xs text-muted-foreground">Top Performers</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>검증자 인센티브 지급 목록</CardTitle>
              <CardDescription>Validator Incentive Payouts</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="검증자 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
                data-testid="input-search"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : payoutList.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>검증자 인센티브 지급 데이터가 없습니다</p>
              <p className="text-sm">No validator incentive payouts found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>검증자</TableHead>
                  <TableHead>에포크</TableHead>
                  <TableHead className="text-right">금액</TableHead>
                  <TableHead className="text-right">가동률</TableHead>
                  <TableHead className="text-right">제안 블록</TableHead>
                  <TableHead>지급일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payoutList.map((payout: any) => (
                  <TableRow key={payout.id} data-testid={`row-payout-${payout.id}`}>
                    <TableCell className="font-mono text-sm">{payout.validatorAddress}</TableCell>
                    <TableCell>{payout.epochNumber}</TableCell>
                    <TableCell className="text-right">{formatTBURN(payout.amount)} TBURN</TableCell>
                    <TableCell className="text-right">{payout.uptimePercent?.toFixed(2)}%</TableCell>
                    <TableCell className="text-right">{payout.blocksProposed}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(payout.paidAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
