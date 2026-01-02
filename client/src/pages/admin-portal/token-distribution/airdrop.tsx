import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Gift, Users, Coins, CheckCircle2, Clock, XCircle, Plus, Search, RefreshCw, ArrowLeft, Download, Upload } from "lucide-react";
import { Link } from "wouter";

interface AirdropClaim {
  id: string;
  walletAddress: string;
  claimableAmount: string;
  claimedAmount: string;
  status: string;
  tier: string;
  createdAt: string;
}

const formatTBURN = (amount: string) => {
  const num = BigInt(amount || '0');
  const tburn = Number(num) / 1e18;
  if (tburn >= 1e6) return `${(tburn / 1e6).toFixed(2)}M`;
  if (tburn >= 1e3) return `${(tburn / 1e3).toFixed(2)}K`;
  return tburn.toFixed(4);
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'claimed': return <Badge className="bg-emerald-500/20 text-emerald-400">Claimed</Badge>;
    case 'pending': return <Badge className="bg-amber-500/20 text-amber-400">Pending</Badge>;
    case 'expired': return <Badge className="bg-red-500/20 text-red-400">Expired</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

export default function AdminAirdropProgram() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newClaim, setNewClaim] = useState({ walletAddress: "", claimableAmount: "", tier: "standard" });

  const { data: claims, isLoading, refetch } = useQuery<{ success: boolean; data: AirdropClaim[] }>({
    queryKey: ['/api/admin/token-programs/airdrop/claims'],
  });

  const { data: stats } = useQuery<{ success: boolean; data: any }>({
    queryKey: ['/api/admin/token-programs/dashboard'],
  });

  const addClaimMutation = useMutation({
    mutationFn: async (data: typeof newClaim) => {
      return apiRequest('POST', '/api/admin/token-programs/airdrop/claims', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/airdrop/claims'] });
      setIsAddDialogOpen(false);
      setNewClaim({ walletAddress: "", claimableAmount: "", tier: "standard" });
      toast({ title: "Success", description: "Airdrop claim added successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add airdrop claim", variant: "destructive" });
    }
  });

  const airdropStats = stats?.data?.airdrop || { totalEligible: 0, totalClaimed: 0, totalAmount: "0", claimedAmount: "0" };
  const claimList = Array.isArray(claims?.data) ? claims.data : [];

  const filteredClaims = claimList.filter(claim => {
    const matchesSearch = claim.walletAddress.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || claim.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="admin-airdrop-page">
      <div className="flex items-center gap-4">
        <Link href="/admin/token-distribution">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            에어드랍 프로그램 관리
          </h1>
          <p className="text-muted-foreground">Airdrop Program Management</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh">
          <RefreshCw className="mr-2 h-4 w-4" />
          새로고침
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total-eligible">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">총 대상자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{airdropStats.totalEligible.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Eligible</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-claimed">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">청구 완료</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{airdropStats.totalClaimed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Claimed</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-amount">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">총 배분량</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTBURN(airdropStats.totalAmount)} TBURN</div>
            <p className="text-xs text-muted-foreground">Total Amount</p>
          </CardContent>
        </Card>
        <Card data-testid="card-claimed-amount">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">청구된 양</CardTitle>
            <Gift className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTBURN(airdropStats.claimedAmount)} TBURN</div>
            <p className="text-xs text-muted-foreground">Claimed Amount</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>에어드랍 청구 목록</CardTitle>
              <CardDescription>Airdrop Claims List</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="지갑 주소 검색..."
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
                  <SelectItem value="pending">대기중</SelectItem>
                  <SelectItem value="claimed">청구됨</SelectItem>
                  <SelectItem value="expired">만료됨</SelectItem>
                </SelectContent>
              </Select>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-claim">
                    <Plus className="mr-2 h-4 w-4" />
                    새 청구 추가
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>새 에어드랍 청구 추가</DialogTitle>
                    <DialogDescription>Add a new airdrop claim for a wallet address</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="walletAddress">지갑 주소</Label>
                      <Input
                        id="walletAddress"
                        placeholder="tb1..."
                        value={newClaim.walletAddress}
                        onChange={(e) => setNewClaim({ ...newClaim, walletAddress: e.target.value })}
                        data-testid="input-wallet-address"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="amount">청구 가능 금액 (TBURN)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="1000"
                        value={newClaim.claimableAmount}
                        onChange={(e) => setNewClaim({ ...newClaim, claimableAmount: e.target.value })}
                        data-testid="input-amount"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="tier">티어</Label>
                      <Select value={newClaim.tier} onValueChange={(v) => setNewClaim({ ...newClaim, tier: v })}>
                        <SelectTrigger data-testid="select-tier">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="vip">VIP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>취소</Button>
                    <Button onClick={() => addClaimMutation.mutate(newClaim)} disabled={addClaimMutation.isPending} data-testid="button-submit-claim">
                      {addClaimMutation.isPending ? "추가 중..." : "추가"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : filteredClaims.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>에어드랍 청구 데이터가 없습니다</p>
              <p className="text-sm">No airdrop claims found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>지갑 주소</TableHead>
                  <TableHead>티어</TableHead>
                  <TableHead className="text-right">청구 가능</TableHead>
                  <TableHead className="text-right">청구됨</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>생성일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClaims.map((claim) => (
                  <TableRow key={claim.id} data-testid={`row-claim-${claim.id}`}>
                    <TableCell className="font-mono text-sm">{claim.walletAddress}</TableCell>
                    <TableCell><Badge variant="outline">{claim.tier}</Badge></TableCell>
                    <TableCell className="text-right">{formatTBURN(claim.claimableAmount)} TBURN</TableCell>
                    <TableCell className="text-right">{formatTBURN(claim.claimedAmount)} TBURN</TableCell>
                    <TableCell>{getStatusBadge(claim.status)}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(claim.createdAt).toLocaleDateString()}</TableCell>
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
