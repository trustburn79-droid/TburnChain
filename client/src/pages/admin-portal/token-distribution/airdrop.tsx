import { useState, useRef } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Gift, Users, Coins, CheckCircle2, Clock, XCircle, Plus, Search, RefreshCw, ArrowLeft, 
  Download, Upload, Trash2, Play, FileSpreadsheet, AlertCircle, Loader2, Send
} from "lucide-react";
import { Link } from "wouter";

interface AirdropClaim {
  id: string;
  walletAddress: string;
  claimableAmount: string;
  claimedAmount: string;
  status: string;
  tier: string;
  claimTxHash?: string;
  claimedAt?: string;
  createdAt: string;
}

interface AirdropDistribution {
  id: string;
  batchNumber: number;
  batchName: string;
  totalRecipients: number;
  totalAmount: string;
  processedCount: number;
  failedCount: number;
  status: string;
  executionTxHash?: string;
  startedAt?: string;
  completedAt?: string;
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
    case 'eligible': return <Badge className="bg-blue-500/20 text-blue-400">Eligible</Badge>;
    case 'pending': return <Badge className="bg-amber-500/20 text-amber-400">Pending</Badge>;
    case 'processing': return <Badge className="bg-purple-500/20 text-purple-400">Processing</Badge>;
    case 'failed': return <Badge className="bg-red-500/20 text-red-400">Failed</Badge>;
    case 'expired': return <Badge className="bg-gray-500/20 text-gray-400">Expired</Badge>;
    case 'completed': return <Badge className="bg-emerald-500/20 text-emerald-400">Completed</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

const getTierBadge = (tier: string) => {
  switch (tier) {
    case 'legendary': return <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">Legendary</Badge>;
    case 'whale': return <Badge className="bg-purple-600 text-white">Whale</Badge>;
    case 'og': return <Badge className="bg-blue-600 text-white">OG</Badge>;
    case 'holder': return <Badge className="bg-teal-600 text-white">Holder</Badge>;
    default: return <Badge variant="outline">{tier}</Badge>;
  }
};

export default function AdminAirdropProgram() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isDistributeDialogOpen, setIsDistributeDialogOpen] = useState(false);
  const [selectedClaims, setSelectedClaims] = useState<string[]>([]);
  const [newClaim, setNewClaim] = useState({ walletAddress: "", claimableAmount: "", tier: "basic" });
  const [bulkClaims, setBulkClaims] = useState("");
  const [distributeBatchName, setDistributeBatchName] = useState("");

  const { data: claimsData, isLoading: claimsLoading, refetch: refetchClaims } = useQuery<{ success: boolean; data: { claims: AirdropClaim[]; stats: any } }>({
    queryKey: ['/api/admin/token-programs/airdrop/claims'],
  });

  const { data: distributionsData, isLoading: distributionsLoading, refetch: refetchDistributions } = useQuery<{ success: boolean; data: AirdropDistribution[] }>({
    queryKey: ['/api/admin/token-programs/airdrop/distributions'],
  });

  const { data: dashboardData } = useQuery<{ success: boolean; data: any }>({
    queryKey: ['/api/admin/token-programs/dashboard'],
  });

  const addClaimMutation = useMutation({
    mutationFn: async (data: typeof newClaim) => {
      const amountWei = (BigInt(Math.floor(parseFloat(data.claimableAmount) * 1e18))).toString();
      return apiRequest('POST', '/api/admin/token-programs/airdrop/claims', {
        ...data,
        claimableAmount: amountWei,
        status: 'eligible',
        eligibilityScore: 100,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/airdrop/claims'] });
      setIsAddDialogOpen(false);
      setNewClaim({ walletAddress: "", claimableAmount: "", tier: "basic" });
      toast({ title: "성공", description: "에어드랍 청구가 추가되었습니다" });
    },
    onError: () => {
      toast({ title: "오류", description: "에어드랍 청구 추가에 실패했습니다", variant: "destructive" });
    }
  });

  const bulkImportMutation = useMutation({
    mutationFn: async (claims: any[]) => {
      return apiRequest('POST', '/api/admin/token-programs/airdrop/claims/bulk', { claims });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/airdrop/claims'] });
      setIsBulkDialogOpen(false);
      setBulkClaims("");
      toast({ 
        title: "대량 가져오기 완료", 
        description: `성공: ${data.data?.success || 0}, 실패: ${data.data?.failed || 0}` 
      });
    },
    onError: () => {
      toast({ title: "오류", description: "대량 가져오기에 실패했습니다", variant: "destructive" });
    }
  });

  const distributeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/admin/token-programs/airdrop/distribute', {
        claimIds: selectedClaims,
        batchName: distributeBatchName || `Batch ${new Date().toISOString().split('T')[0]}`,
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/airdrop/claims'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/airdrop/distributions'] });
      setIsDistributeDialogOpen(false);
      setSelectedClaims([]);
      setDistributeBatchName("");
      toast({ 
        title: "배포 완료", 
        description: `${data.data?.processedCount || 0}개 청구 처리됨` 
      });
    },
    onError: () => {
      toast({ title: "오류", description: "배포 실행에 실패했습니다", variant: "destructive" });
    }
  });

  const processClaimMutation = useMutation({
    mutationFn: async (claimId: string) => {
      return apiRequest('POST', `/api/admin/token-programs/airdrop/claims/${claimId}/process`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/airdrop/claims'] });
      toast({ title: "성공", description: "청구가 처리되었습니다" });
    },
    onError: () => {
      toast({ title: "오류", description: "청구 처리에 실패했습니다", variant: "destructive" });
    }
  });

  const deleteClaimMutation = useMutation({
    mutationFn: async (claimId: string) => {
      return apiRequest('DELETE', `/api/admin/token-programs/airdrop/claims/${claimId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/airdrop/claims'] });
      toast({ title: "성공", description: "청구가 삭제되었습니다" });
    },
    onError: () => {
      toast({ title: "오류", description: "청구 삭제에 실패했습니다", variant: "destructive" });
    }
  });

  const handleBulkImport = () => {
    try {
      const lines = bulkClaims.trim().split('\n').filter(line => line.trim());
      const claims = lines.map(line => {
        const [walletAddress, claimableAmount, tier] = line.split(',').map(s => s.trim());
        return { walletAddress, claimableAmount, tier: tier || 'basic' };
      });
      bulkImportMutation.mutate(claims);
    } catch (error) {
      toast({ title: "오류", description: "입력 형식이 잘못되었습니다", variant: "destructive" });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setBulkClaims(content);
      setIsBulkDialogOpen(true);
    };
    reader.readAsText(file);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const eligibleIds = filteredClaims.filter(c => c.status === 'eligible').map(c => c.id);
      setSelectedClaims(eligibleIds);
    } else {
      setSelectedClaims([]);
    }
  };

  const handleSelectClaim = (claimId: string, checked: boolean) => {
    if (checked) {
      setSelectedClaims([...selectedClaims, claimId]);
    } else {
      setSelectedClaims(selectedClaims.filter(id => id !== claimId));
    }
  };

  const exportToCSV = () => {
    const claimList = claimsData?.data?.claims || [];
    const headers = ['Wallet Address', 'Amount (TBURN)', 'Status', 'Tier', 'Created At'];
    const rows = claimList.map(c => [
      c.walletAddress,
      formatTBURN(c.claimableAmount),
      c.status,
      c.tier,
      new Date(c.createdAt).toISOString()
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `airdrop-claims-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const stats = claimsData?.data?.stats || dashboardData?.data?.airdrop || { 
    totalEligible: 0, totalClaimed: 0, totalAmount: "0", claimedAmount: "0" 
  };
  const claimList = claimsData?.data?.claims || [];
  const distributions = distributionsData?.data || [];

  const filteredClaims = claimList.filter(claim => {
    const matchesSearch = claim.walletAddress.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || claim.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const eligibleCount = claimList.filter(c => c.status === 'eligible').length;
  const claimRate = stats.totalEligible > 0 ? ((stats.totalClaimed / stats.totalEligible) * 100).toFixed(1) : '0';

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
          <p className="text-muted-foreground">Airdrop Program Management - January 2026 Launch</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { refetchClaims(); refetchDistributions(); }} data-testid="button-refresh">
          <RefreshCw className="mr-2 h-4 w-4" />
          새로고침
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card data-testid="card-total-eligible">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">총 대상자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEligible?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Total Eligible</p>
          </CardContent>
        </Card>
        <Card data-testid="card-eligible-pending">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">청구 대기</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eligibleCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Awaiting Claim</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-claimed">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">청구 완료</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClaimed?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">{claimRate}% Claim Rate</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-amount">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">총 배분량</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTBURN(stats.totalAmount || '0')} TBURN</div>
            <p className="text-xs text-muted-foreground">Total Amount</p>
          </CardContent>
        </Card>
        <Card data-testid="card-claimed-amount">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">청구된 양</CardTitle>
            <Gift className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTBURN(stats.claimedAmount || '0')} TBURN</div>
            <p className="text-xs text-muted-foreground">Claimed Amount</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="claims" className="w-full">
        <TabsList>
          <TabsTrigger value="claims" data-testid="tab-claims">청구 목록</TabsTrigger>
          <TabsTrigger value="distributions" data-testid="tab-distributions">배포 기록</TabsTrigger>
        </TabsList>

        <TabsContent value="claims">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <CardTitle>에어드랍 청구 목록</CardTitle>
                  <CardDescription>Manage airdrop claims and execute distributions</CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="지갑 주소 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-52"
                      data-testid="input-search"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32" data-testid="select-status-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="eligible">대상자</SelectItem>
                      <SelectItem value="claimed">청구됨</SelectItem>
                      <SelectItem value="failed">실패</SelectItem>
                      <SelectItem value="expired">만료됨</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} data-testid="button-upload-csv">
                    <Upload className="mr-2 h-4 w-4" />
                    CSV 업로드
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportToCSV} data-testid="button-export-csv">
                    <Download className="mr-2 h-4 w-4" />
                    내보내기
                  </Button>

                  <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" data-testid="button-bulk-import">
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        대량 가져오기
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>대량 에어드랍 청구 가져오기</DialogTitle>
                        <DialogDescription>
                          CSV 형식으로 다수의 청구를 한 번에 가져옵니다. (지갑주소,금액,티어)
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <Textarea
                          placeholder="tb1abc123...,1000,basic&#10;tb1def456...,5000,holder&#10;tb1ghi789...,25000,og"
                          value={bulkClaims}
                          onChange={(e) => setBulkClaims(e.target.value)}
                          rows={10}
                          className="font-mono text-sm"
                          data-testid="textarea-bulk-claims"
                        />
                        <p className="text-sm text-muted-foreground">
                          형식: 지갑주소,금액(TBURN),티어(basic/holder/og/whale/legendary)
                        </p>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>취소</Button>
                        <Button onClick={handleBulkImport} disabled={bulkImportMutation.isPending} data-testid="button-submit-bulk">
                          {bulkImportMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />가져오는 중...</> : "가져오기"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

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
                              <SelectItem value="basic">Basic</SelectItem>
                              <SelectItem value="holder">Holder</SelectItem>
                              <SelectItem value="og">OG</SelectItem>
                              <SelectItem value="whale">Whale</SelectItem>
                              <SelectItem value="legendary">Legendary</SelectItem>
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
              {selectedClaims.length > 0 && (
                <div className="flex items-center gap-4 mb-4 p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">{selectedClaims.length}개 선택됨</span>
                  <Dialog open={isDistributeDialogOpen} onOpenChange={setIsDistributeDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" data-testid="button-distribute-selected">
                        <Send className="mr-2 h-4 w-4" />
                        선택 항목 배포
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>배치 배포 실행</DialogTitle>
                        <DialogDescription>
                          {selectedClaims.length}개의 청구에 대해 에어드랍을 배포합니다.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="batchName">배치 이름</Label>
                          <Input
                            id="batchName"
                            placeholder="January 2026 Launch Batch"
                            value={distributeBatchName}
                            onChange={(e) => setDistributeBatchName(e.target.value)}
                            data-testid="input-batch-name"
                          />
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="flex justify-between text-sm">
                            <span>총 수신자</span>
                            <span className="font-medium">{selectedClaims.length}명</span>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDistributeDialogOpen(false)}>취소</Button>
                        <Button onClick={() => distributeMutation.mutate()} disabled={distributeMutation.isPending} data-testid="button-execute-distribution">
                          {distributeMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />배포 중...</> : <>
                            <Play className="mr-2 h-4 w-4" />
                            배포 실행
                          </>}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedClaims([])}>선택 해제</Button>
                </div>
              )}

              {claimsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12" />)}
                </div>
              ) : filteredClaims.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>에어드랍 청구 데이터가 없습니다</p>
                  <p className="text-sm">CSV를 업로드하거나 새 청구를 추가하세요</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedClaims.length === filteredClaims.filter(c => c.status === 'eligible').length && selectedClaims.length > 0}
                          onCheckedChange={handleSelectAll}
                          data-testid="checkbox-select-all"
                        />
                      </TableHead>
                      <TableHead>지갑 주소</TableHead>
                      <TableHead>티어</TableHead>
                      <TableHead className="text-right">청구 가능</TableHead>
                      <TableHead className="text-right">청구됨</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>생성일</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClaims.map((claim) => (
                      <TableRow key={claim.id} data-testid={`row-claim-${claim.id}`}>
                        <TableCell>
                          {claim.status === 'eligible' && (
                            <Checkbox
                              checked={selectedClaims.includes(claim.id)}
                              onCheckedChange={(checked) => handleSelectClaim(claim.id, checked as boolean)}
                              data-testid={`checkbox-claim-${claim.id}`}
                            />
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm max-w-[200px] truncate">{claim.walletAddress}</TableCell>
                        <TableCell>{getTierBadge(claim.tier)}</TableCell>
                        <TableCell className="text-right">{formatTBURN(claim.claimableAmount)} TBURN</TableCell>
                        <TableCell className="text-right">{formatTBURN(claim.claimedAmount || '0')} TBURN</TableCell>
                        <TableCell>{getStatusBadge(claim.status)}</TableCell>
                        <TableCell className="text-muted-foreground">{new Date(claim.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {claim.status === 'eligible' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => processClaimMutation.mutate(claim.id)}
                                disabled={processClaimMutation.isPending}
                                data-testid={`button-process-${claim.id}`}
                              >
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              </Button>
                            )}
                            {claim.status !== 'claimed' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteClaimMutation.mutate(claim.id)}
                                disabled={deleteClaimMutation.isPending}
                                data-testid={`button-delete-${claim.id}`}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distributions">
          <Card>
            <CardHeader>
              <CardTitle>배포 기록</CardTitle>
              <CardDescription>Distribution History - Past batch distributions</CardDescription>
            </CardHeader>
            <CardContent>
              {distributionsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
                </div>
              ) : distributions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>배포 기록이 없습니다</p>
                  <p className="text-sm">청구를 선택하고 배포를 실행하세요</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>배치</TableHead>
                      <TableHead>이름</TableHead>
                      <TableHead className="text-right">수신자</TableHead>
                      <TableHead className="text-right">총 금액</TableHead>
                      <TableHead className="text-right">처리됨</TableHead>
                      <TableHead className="text-right">실패</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>완료일</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {distributions.map((dist) => (
                      <TableRow key={dist.id} data-testid={`row-distribution-${dist.id}`}>
                        <TableCell className="font-medium">#{dist.batchNumber}</TableCell>
                        <TableCell>{dist.batchName}</TableCell>
                        <TableCell className="text-right">{dist.totalRecipients?.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{formatTBURN(dist.totalAmount)} TBURN</TableCell>
                        <TableCell className="text-right text-emerald-500">{dist.processedCount?.toLocaleString() || 0}</TableCell>
                        <TableCell className="text-right text-red-500">{dist.failedCount?.toLocaleString() || 0}</TableCell>
                        <TableCell>{getStatusBadge(dist.status)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {dist.completedAt ? new Date(dist.completedAt).toLocaleString() : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
