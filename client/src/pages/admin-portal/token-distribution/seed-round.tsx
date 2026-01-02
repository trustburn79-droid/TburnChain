import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Leaf, Users, DollarSign, Lock, Search, RefreshCw, ArrowLeft, Plus } from "lucide-react";
import { Link } from "wouter";

const formatTBURN = (amount: string) => {
  const num = BigInt(amount || '0');
  const tburn = Number(num) / 1e18;
  if (tburn >= 1e6) return `${(tburn / 1e6).toFixed(2)}M`;
  if (tburn >= 1e3) return `${(tburn / 1e3).toFixed(2)}K`;
  return tburn.toFixed(4);
};

export default function AdminSeedRound() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: investors, isLoading, refetch } = useQuery<{ success: boolean; data: any[] }>({
    queryKey: ['/api/admin/token-programs/seed-round/investors'],
  });

  const investorList = Array.isArray(investors?.data) ? investors.data : [];

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="admin-seed-round-page">
      <div className="flex items-center gap-4">
        <Link href="/admin/token-distribution">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            시드 라운드 관리
          </h1>
          <p className="text-muted-foreground">Seed Round Management</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh">
          <RefreshCw className="mr-2 h-4 w-4" />
          새로고침
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardHeader className="flex flex-row items-center justify-between gap-1 pb-2"><CardTitle className="text-sm font-medium">시드 투자자</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">0</div><p className="text-xs text-muted-foreground">Seed Investors</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between gap-1 pb-2"><CardTitle className="text-sm font-medium">모금 금액</CardTitle><DollarSign className="h-4 w-4 text-emerald-500" /></CardHeader><CardContent><div className="text-2xl font-bold">$0</div><p className="text-xs text-muted-foreground">Raised Amount</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between gap-1 pb-2"><CardTitle className="text-sm font-medium">토큰 가격</CardTitle><Leaf className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">$0.005</div><p className="text-xs text-muted-foreground">Token Price</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between gap-1 pb-2"><CardTitle className="text-sm font-medium">잠금 상태</CardTitle><Lock className="h-4 w-4 text-amber-500" /></CardHeader><CardContent><div className="text-2xl font-bold">12개월</div><p className="text-xs text-muted-foreground">Lock Period</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div><CardTitle>시드 투자자 목록</CardTitle><CardDescription>Seed Investors List</CardDescription></div>
            <div className="flex items-center gap-2">
              <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="투자자 검색..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-64" data-testid="input-search" /></div>
              <Button data-testid="button-add-investor"><Plus className="mr-2 h-4 w-4" />새 투자자</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (<div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12" />)}</div>) : investorList.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><Leaf className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>시드 투자자 데이터가 없습니다</p><p className="text-sm">No seed investors found</p></div>
          ) : (
            <Table><TableHeader><TableRow><TableHead>투자자명</TableHead><TableHead>지갑 주소</TableHead><TableHead className="text-right">투자 금액</TableHead><TableHead className="text-right">토큰 수량</TableHead><TableHead>상태</TableHead></TableRow></TableHeader><TableBody>{investorList.map((i: any) => (<TableRow key={i.id}><TableCell>{i.name}</TableCell><TableCell className="font-mono text-sm">{i.walletAddress}</TableCell><TableCell className="text-right">${i.investmentAmount}</TableCell><TableCell className="text-right">{formatTBURN(i.tokenAmount)} TBURN</TableCell><TableCell><Badge className="bg-emerald-500/20 text-emerald-400">{i.status}</Badge></TableCell></TableRow>))}</TableBody></Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
