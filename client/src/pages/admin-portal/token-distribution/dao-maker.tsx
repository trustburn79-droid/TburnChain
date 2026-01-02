import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Gem, Users, DollarSign, Award, Search, RefreshCw, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const formatTBURN = (amount: string) => {
  const num = BigInt(amount || '0');
  const tburn = Number(num) / 1e18;
  if (tburn >= 1e6) return `${(tburn / 1e6).toFixed(2)}M`;
  if (tburn >= 1e3) return `${(tburn / 1e3).toFixed(2)}K`;
  return tburn.toFixed(4);
};

export default function AdminDAOMaker() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: participants, isLoading, refetch } = useQuery<{ success: boolean; data: any[] }>({
    queryKey: ['/api/admin/token-programs/dao-maker/participants'],
  });

  const participantList = participants?.data || [];

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="admin-dao-maker-page">
      <div className="flex items-center gap-4">
        <Link href="/admin/token-distribution">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            DAO Maker SHO 관리
          </h1>
          <p className="text-muted-foreground">DAO Maker Strong Holder Offering Management</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh">
          <RefreshCw className="mr-2 h-4 w-4" />
          새로고침
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardHeader className="flex flex-row items-center justify-between gap-1 pb-2"><CardTitle className="text-sm font-medium">SHO 참여자</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">0</div><p className="text-xs text-muted-foreground">SHO Participants</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between gap-1 pb-2"><CardTitle className="text-sm font-medium">당첨자</CardTitle><Award className="h-4 w-4 text-emerald-500" /></CardHeader><CardContent><div className="text-2xl font-bold">0</div><p className="text-xs text-muted-foreground">Winners</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between gap-1 pb-2"><CardTitle className="text-sm font-medium">총 모금액</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">$0</div><p className="text-xs text-muted-foreground">Total Raised</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between gap-1 pb-2"><CardTitle className="text-sm font-medium">배분 토큰</CardTitle><Gem className="h-4 w-4 text-emerald-500" /></CardHeader><CardContent><div className="text-2xl font-bold">0 TBURN</div><p className="text-xs text-muted-foreground">Allocated Tokens</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div><CardTitle>DAO Maker SHO 참여자 목록</CardTitle><CardDescription>DAO Maker SHO Participants</CardDescription></div>
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="참여자 검색..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-64" data-testid="input-search" /></div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (<div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12" />)}</div>) : participantList.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><Gem className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>DAO Maker SHO 참여자 데이터가 없습니다</p><p className="text-sm">No DAO Maker SHO participants found</p></div>
          ) : (
            <Table><TableHeader><TableRow><TableHead>지갑 주소</TableHead><TableHead>DAO Power</TableHead><TableHead className="text-right">투자 금액</TableHead><TableHead className="text-right">토큰 수량</TableHead><TableHead>당첨 여부</TableHead><TableHead>상태</TableHead></TableRow></TableHeader><TableBody>{participantList.map((p: any) => (<TableRow key={p.id}><TableCell className="font-mono text-sm">{p.walletAddress}</TableCell><TableCell>{p.daoPower}</TableCell><TableCell className="text-right">${p.investmentAmount}</TableCell><TableCell className="text-right">{formatTBURN(p.tokenAmount)} TBURN</TableCell><TableCell>{p.isWinner ? <Badge className="bg-emerald-500/20 text-emerald-400">당첨</Badge> : <Badge variant="outline">미당첨</Badge>}</TableCell><TableCell><Badge className="bg-emerald-500/20 text-emerald-400">{p.status}</Badge></TableCell></TableRow>))}</TableBody></Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
