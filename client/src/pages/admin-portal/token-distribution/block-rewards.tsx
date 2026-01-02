import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Blocks, Coins, Fuel, TrendingUp, Search, RefreshCw, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const formatTBURN = (amount: string) => {
  const num = BigInt(amount || '0');
  const tburn = Number(num) / 1e18;
  if (tburn >= 1e6) return `${(tburn / 1e6).toFixed(2)}M`;
  if (tburn >= 1e3) return `${(tburn / 1e3).toFixed(2)}K`;
  return tburn.toFixed(4);
};

export default function AdminBlockRewards() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: cycles, isLoading, refetch } = useQuery<{ success: boolean; data: any[] }>({
    queryKey: ['/api/admin/token-programs/block-rewards/cycles'],
  });

  const { data: stats } = useQuery<{ success: boolean; data: any }>({
    queryKey: ['/api/admin/token-programs/dashboard'],
  });

  const blockStats = stats?.data?.blockRewards || { totalCycles: 0, totalRewards: "0", totalGasFees: "0", avgRewardPerCycle: "0" };
  const cycleList = Array.isArray(cycles?.data) ? cycles.data : [];

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="admin-block-rewards-page">
      <div className="flex items-center gap-4">
        <Link href="/admin/token-distribution">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            블록 보상 관리
          </h1>
          <p className="text-muted-foreground">Block Rewards Management</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh">
          <RefreshCw className="mr-2 h-4 w-4" />
          새로고침
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total-cycles">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">총 사이클</CardTitle>
            <Blocks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blockStats.totalCycles.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Cycles</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-rewards">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">총 보상</CardTitle>
            <Coins className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTBURN(blockStats.totalRewards)} TBURN</div>
            <p className="text-xs text-muted-foreground">Total Rewards</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-gas-fees">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">총 가스비</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTBURN(blockStats.totalGasFees)} TBURN</div>
            <p className="text-xs text-muted-foreground">Total Gas Fees</p>
          </CardContent>
        </Card>
        <Card data-testid="card-avg-reward">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">평균 보상</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTBURN(blockStats.avgRewardPerCycle)} TBURN</div>
            <p className="text-xs text-muted-foreground">Avg per Cycle</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>보상 사이클 목록</CardTitle>
              <CardDescription>Reward Cycles List</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="사이클 검색..."
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
          ) : cycleList.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Blocks className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>블록 보상 사이클 데이터가 없습니다</p>
              <p className="text-sm">No block reward cycles found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>사이클 #</TableHead>
                  <TableHead>에포크</TableHead>
                  <TableHead className="text-right">블록 보상</TableHead>
                  <TableHead className="text-right">가스비</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>완료일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cycleList.map((cycle: any) => (
                  <TableRow key={cycle.id} data-testid={`row-cycle-${cycle.id}`}>
                    <TableCell className="font-mono">{cycle.cycleNumber}</TableCell>
                    <TableCell>{cycle.epochNumber}</TableCell>
                    <TableCell className="text-right">{formatTBURN(cycle.totalBlockReward)} TBURN</TableCell>
                    <TableCell className="text-right">{formatTBURN(cycle.totalGasFees)} TBURN</TableCell>
                    <TableCell>
                      <Badge className={cycle.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}>
                        {cycle.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{cycle.completedAt ? new Date(cycle.completedAt).toLocaleDateString() : '-'}</TableCell>
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
