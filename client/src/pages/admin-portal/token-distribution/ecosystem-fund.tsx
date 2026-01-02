import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sprout, Coins, FileText, CheckCircle2, Search, RefreshCw, ArrowLeft, Plus } from "lucide-react";
import { Link } from "wouter";

const formatTBURN = (amount: string) => {
  const num = BigInt(amount || '0');
  const tburn = Number(num) / 1e18;
  if (tburn >= 1e6) return `${(tburn / 1e6).toFixed(2)}M`;
  if (tburn >= 1e3) return `${(tburn / 1e3).toFixed(2)}K`;
  return tburn.toFixed(4);
};

export default function AdminEcosystemFund() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: grants, isLoading, refetch } = useQuery<{ success: boolean; data: any[] }>({
    queryKey: ['/api/admin/token-programs/ecosystem/grants'],
  });

  const { data: stats } = useQuery<{ success: boolean; data: any }>({
    queryKey: ['/api/admin/token-programs/dashboard'],
  });

  const ecosystemStats = stats?.data?.ecosystemGrants || { totalGrants: 0, activeGrants: 0, totalRequested: "0", totalDisbursed: "0" };
  const grantList = Array.isArray(grants?.data) ? grants.data : [];

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="admin-ecosystem-fund-page">
      <div className="flex items-center gap-4">
        <Link href="/admin/token-distribution">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            에코시스템 펀드 관리
          </h1>
          <p className="text-muted-foreground">Ecosystem Fund Management</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh">
          <RefreshCw className="mr-2 h-4 w-4" />
          새로고침
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total-grants">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">총 그랜트</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ecosystemStats.totalGrants}</div>
            <p className="text-xs text-muted-foreground">Total Grants</p>
          </CardContent>
        </Card>
        <Card data-testid="card-active-grants">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">진행중</CardTitle>
            <Sprout className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ecosystemStats.activeGrants}</div>
            <p className="text-xs text-muted-foreground">Active Grants</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-requested">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">요청 금액</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTBURN(ecosystemStats.totalRequested)} TBURN</div>
            <p className="text-xs text-muted-foreground">Total Requested</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-disbursed">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">지급 완료</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTBURN(ecosystemStats.totalDisbursed)} TBURN</div>
            <p className="text-xs text-muted-foreground">Total Disbursed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>에코시스템 그랜트 목록</CardTitle>
              <CardDescription>Ecosystem Grants List</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="프로젝트 검색..."
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
                  <SelectItem value="active">진행중</SelectItem>
                  <SelectItem value="approved">승인됨</SelectItem>
                  <SelectItem value="completed">완료</SelectItem>
                </SelectContent>
              </Select>
              <Button data-testid="button-add-grant">
                <Plus className="mr-2 h-4 w-4" />
                새 그랜트
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : grantList.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Sprout className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>에코시스템 그랜트 데이터가 없습니다</p>
              <p className="text-sm">No ecosystem grants found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>프로젝트명</TableHead>
                  <TableHead>카테고리</TableHead>
                  <TableHead className="text-right">요청 금액</TableHead>
                  <TableHead className="text-right">지급 금액</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>신청자</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grantList.map((grant: any) => (
                  <TableRow key={grant.id} data-testid={`row-grant-${grant.id}`}>
                    <TableCell className="font-medium">{grant.projectName}</TableCell>
                    <TableCell><Badge variant="outline">{grant.category}</Badge></TableCell>
                    <TableCell className="text-right">{formatTBURN(grant.requestedAmount)} TBURN</TableCell>
                    <TableCell className="text-right">{formatTBURN(grant.disbursedAmount)} TBURN</TableCell>
                    <TableCell>
                      <Badge className={
                        grant.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
                        grant.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                        grant.status === 'completed' ? 'bg-gray-500/20 text-gray-400' :
                        'bg-amber-500/20 text-amber-400'
                      }>
                        {grant.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{grant.applicantName}</TableCell>
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
