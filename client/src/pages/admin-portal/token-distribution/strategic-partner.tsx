import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, Shield, Coins, Lock, Search, RefreshCw, ArrowLeft, Plus } from "lucide-react";
import { Link } from "wouter";

const formatTBURN = (amount: string) => {
  const num = BigInt(amount || '0');
  const tburn = Number(num) / 1e18;
  if (tburn >= 1e6) return `${(tburn / 1e6).toFixed(2)}M`;
  if (tburn >= 1e3) return `${(tburn / 1e3).toFixed(2)}K`;
  return tburn.toFixed(4);
};

export default function AdminStrategicPartner() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: partners, isLoading, refetch } = useQuery<{ success: boolean; data: any[] }>({
    queryKey: ['/api/admin/token-programs/strategic/partners'],
  });

  const partnerList = partners?.data || [];

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="admin-strategic-partner-page">
      <div className="flex items-center gap-4">
        <Link href="/admin/token-distribution">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            전략 파트너 프로그램 관리
          </h1>
          <p className="text-muted-foreground">Strategic Partner Program Management</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh">
          <RefreshCw className="mr-2 h-4 w-4" />
          새로고침
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardHeader className="flex flex-row items-center justify-between gap-1 pb-2"><CardTitle className="text-sm font-medium">전략 파트너</CardTitle><Briefcase className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">0</div><p className="text-xs text-muted-foreground">Strategic Partners</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between gap-1 pb-2"><CardTitle className="text-sm font-medium">활성 계약</CardTitle><Shield className="h-4 w-4 text-emerald-500" /></CardHeader><CardContent><div className="text-2xl font-bold">0</div><p className="text-xs text-muted-foreground">Active Contracts</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between gap-1 pb-2"><CardTitle className="text-sm font-medium">총 배분량</CardTitle><Coins className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">0 TBURN</div><p className="text-xs text-muted-foreground">Total Allocation</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between gap-1 pb-2"><CardTitle className="text-sm font-medium">잠금 토큰</CardTitle><Lock className="h-4 w-4 text-amber-500" /></CardHeader><CardContent><div className="text-2xl font-bold">0 TBURN</div><p className="text-xs text-muted-foreground">Locked Tokens</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div><CardTitle>전략 파트너 목록</CardTitle><CardDescription>Strategic Partners List</CardDescription></div>
            <div className="flex items-center gap-2">
              <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="파트너 검색..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-64" data-testid="input-search" /></div>
              <Button data-testid="button-add-partner"><Plus className="mr-2 h-4 w-4" />새 파트너</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (<div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12" />)}</div>) : partnerList.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>전략 파트너 데이터가 없습니다</p><p className="text-sm">No strategic partners found</p></div>
          ) : (
            <Table><TableHeader><TableRow><TableHead>파트너명</TableHead><TableHead>계약 유형</TableHead><TableHead className="text-right">배분량</TableHead><TableHead>베스팅</TableHead><TableHead>상태</TableHead></TableRow></TableHeader><TableBody>{partnerList.map((p: any) => (<TableRow key={p.id}><TableCell>{p.name}</TableCell><TableCell><Badge variant="outline">{p.contractType}</Badge></TableCell><TableCell className="text-right">{formatTBURN(p.allocation)} TBURN</TableCell><TableCell>{p.vestingSchedule}</TableCell><TableCell><Badge className="bg-emerald-500/20 text-emerald-400">{p.status}</Badge></TableCell></TableRow>))}</TableBody></Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
