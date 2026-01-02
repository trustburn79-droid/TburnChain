import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Link2, Coins, TrendingUp, Search, RefreshCw, ArrowLeft, UserPlus } from "lucide-react";
import { Link } from "wouter";

interface ReferralAccount {
  id: string;
  walletAddress: string;
  referralCode: string;
  totalReferrals: number;
  totalEarnings: string;
  tier: string;
  status: string;
  createdAt: string;
}

const formatTBURN = (amount: string) => {
  const num = BigInt(amount || '0');
  const tburn = Number(num) / 1e18;
  if (tburn >= 1e6) return `${(tburn / 1e6).toFixed(2)}M`;
  if (tburn >= 1e3) return `${(tburn / 1e3).toFixed(2)}K`;
  return tburn.toFixed(4);
};

export default function AdminReferralProgram() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: accounts, isLoading, refetch } = useQuery<{ success: boolean; data: ReferralAccount[] }>({
    queryKey: ['/api/admin/token-programs/referral/accounts'],
  });

  const { data: stats } = useQuery<{ success: boolean; data: any }>({
    queryKey: ['/api/admin/token-programs/dashboard'],
  });

  const referralStats = stats?.data?.referral || { totalAccounts: 0, totalReferrals: 0, totalEarnings: "0", activeReferrers: 0 };
  const accountList = accounts?.data || [];

  const filteredAccounts = accountList.filter(acc => {
    const matchesSearch = acc.walletAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         acc.referralCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || acc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="admin-referral-page">
      <div className="flex items-center gap-4">
        <Link href="/admin/token-distribution">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            레퍼럴 프로그램 관리
          </h1>
          <p className="text-muted-foreground">Referral Program Management</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh">
          <RefreshCw className="mr-2 h-4 w-4" />
          새로고침
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total-accounts">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">총 계정</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referralStats.totalAccounts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Accounts</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-referrals">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">총 추천</CardTitle>
            <UserPlus className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referralStats.totalReferrals.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Referrals</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-earnings">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">총 보상</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTBURN(referralStats.totalEarnings)} TBURN</div>
            <p className="text-xs text-muted-foreground">Total Earnings</p>
          </CardContent>
        </Card>
        <Card data-testid="card-active-referrers">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">활성 추천인</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referralStats.activeReferrers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Active Referrers</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>레퍼럴 계정 목록</CardTitle>
              <CardDescription>Referral Accounts List</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="지갑 주소 또는 코드 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                  data-testid="input-search"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32" data-testid="select-status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="active">활성</SelectItem>
                  <SelectItem value="inactive">비활성</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>레퍼럴 계정 데이터가 없습니다</p>
              <p className="text-sm">No referral accounts found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>지갑 주소</TableHead>
                  <TableHead>추천 코드</TableHead>
                  <TableHead>티어</TableHead>
                  <TableHead className="text-right">총 추천</TableHead>
                  <TableHead className="text-right">총 보상</TableHead>
                  <TableHead>상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.map((account) => (
                  <TableRow key={account.id} data-testid={`row-account-${account.id}`}>
                    <TableCell className="font-mono text-sm">{account.walletAddress}</TableCell>
                    <TableCell className="font-mono">{account.referralCode}</TableCell>
                    <TableCell><Badge variant="outline">{account.tier}</Badge></TableCell>
                    <TableCell className="text-right">{account.totalReferrals}</TableCell>
                    <TableCell className="text-right">{formatTBURN(account.totalEarnings)} TBURN</TableCell>
                    <TableCell>
                      <Badge className={account.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}>
                        {account.status === 'active' ? '활성' : '비활성'}
                      </Badge>
                    </TableCell>
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
