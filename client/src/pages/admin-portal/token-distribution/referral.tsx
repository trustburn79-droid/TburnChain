import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Link2, Coins, TrendingUp, Search, RefreshCw, ArrowLeft, UserPlus, Upload, Send, Gift, Copy, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ReferralAccount {
  id: string;
  walletAddress: string;
  referralCode: string;
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: string;
  pendingRewards: string;
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

const getTierBadgeClass = (tier: string) => {
  switch (tier?.toLowerCase()) {
    case 'diamond': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'platinum': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    case 'gold': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'silver': return 'bg-slate-400/20 text-slate-300 border-slate-400/30';
    default: return 'bg-orange-600/20 text-orange-400 border-orange-600/30';
  }
};

export default function AdminReferralProgram() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDistributeOpen, setIsDistributeOpen] = useState(false);
  const [csvData, setCsvData] = useState("");
  const [newWallet, setNewWallet] = useState("");
  const [newTier, setNewTier] = useState("bronze");
  const [rewardAmount, setRewardAmount] = useState("");
  const [rewardType, setRewardType] = useState("bonus");

  const { data: accountsResponse, isLoading, refetch } = useQuery<{ success: boolean; data: { accounts: ReferralAccount[]; stats: any } }>({
    queryKey: ['/api/admin/token-programs/referral/accounts'],
  });

  const accounts = accountsResponse?.data?.accounts || [];
  const stats = accountsResponse?.data?.stats || { totalAccounts: 0, totalReferrals: 0, totalEarnings: "0", activeReferrers: 0 };

  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = acc.walletAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         acc.referralCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || acc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Add single account mutation
  const addAccountMutation = useMutation({
    mutationFn: async (data: { walletAddress: string; tier: string }) => {
      return apiRequest('POST', '/api/admin/token-programs/referral/accounts', data);
    },
    onSuccess: () => {
      toast({ title: "성공", description: "레퍼럴 계정이 생성되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/referral/accounts'] });
      setIsAddOpen(false);
      setNewWallet("");
    },
    onError: (error: any) => {
      toast({ title: "오류", description: error.message || "계정 생성 실패", variant: "destructive" });
    },
  });

  // Bulk import mutation
  const bulkImportMutation = useMutation({
    mutationFn: async (accounts: any[]) => {
      return apiRequest('POST', '/api/admin/token-programs/referral/bulk-import', { accounts });
    },
    onSuccess: (data: any) => {
      toast({
        title: "가져오기 완료",
        description: `생성: ${data.data?.created || 0}, 스킵: ${data.data?.skipped || 0}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/referral/accounts'] });
      setIsImportOpen(false);
      setCsvData("");
    },
    onError: (error: any) => {
      toast({ title: "오류", description: error.message || "가져오기 실패", variant: "destructive" });
    },
  });

  // Distribute rewards mutation
  const distributeMutation = useMutation({
    mutationFn: async (data: { accountIds: string[]; rewardAmount: string; rewardType: string }) => {
      return apiRequest('POST', '/api/admin/token-programs/referral/distribute', data);
    },
    onSuccess: (data: any) => {
      toast({
        title: "분배 완료",
        description: `${data.data?.distributed || 0}개 계정에 보상 분배됨. TX: ${data.data?.transactionHash?.substring(0, 16)}...`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/referral/accounts'] });
      setIsDistributeOpen(false);
      setSelectedAccounts([]);
      setRewardAmount("");
    },
    onError: (error: any) => {
      toast({ title: "오류", description: error.message || "분배 실패", variant: "destructive" });
    },
  });

  const handleBulkImport = () => {
    const lines = csvData.trim().split('\n').filter(l => l.trim());
    const accounts = lines.map(line => {
      const [walletAddress, tier, totalReferrals, totalEarnings] = line.split(',').map(s => s.trim());
      return {
        walletAddress,
        tier: tier || 'bronze',
        totalReferrals: parseInt(totalReferrals) || 0,
        totalEarnings: totalEarnings || '0',
      };
    }).filter(a => a.walletAddress && a.walletAddress.startsWith('tb1'));
    
    if (accounts.length === 0) {
      toast({ title: "오류", description: "유효한 데이터가 없습니다.", variant: "destructive" });
      return;
    }
    
    bulkImportMutation.mutate(accounts);
  };

  const handleDistribute = () => {
    if (selectedAccounts.length === 0) {
      toast({ title: "오류", description: "배포할 계정을 선택하세요.", variant: "destructive" });
      return;
    }
    if (!rewardAmount || parseFloat(rewardAmount) <= 0) {
      toast({ title: "오류", description: "유효한 보상 금액을 입력하세요.", variant: "destructive" });
      return;
    }
    distributeMutation.mutate({
      accountIds: selectedAccounts,
      rewardAmount,
      rewardType,
    });
  };

  const toggleAccountSelection = (id: string) => {
    setSelectedAccounts(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedAccounts.length === filteredAccounts.length) {
      setSelectedAccounts([]);
    } else {
      setSelectedAccounts(filteredAccounts.map(a => a.id));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "복사됨", description: "클립보드에 복사되었습니다." });
  };

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="admin-referral-page">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/admin/token-distribution")} data-testid="button-back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total-accounts">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">총 계정</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAccounts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Accounts</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-referrals">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">총 추천</CardTitle>
            <UserPlus className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReferrals.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Referrals</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-earnings">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">총 보상</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTBURN(stats.totalEarnings)} TBURN</div>
            <p className="text-xs text-muted-foreground">Total Earnings</p>
          </CardContent>
        </Card>
        <Card data-testid="card-active-referrers">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">활성 추천인</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeReferrers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Active Referrers</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons & Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>레퍼럴 계정 관리</CardTitle>
              <CardDescription>Referral Accounts Management</CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Add Account Dialog */}
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" data-testid="button-add-account">
                    <UserPlus className="mr-2 h-4 w-4" />
                    계정 추가
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>새 레퍼럴 계정</DialogTitle>
                    <DialogDescription>새로운 레퍼럴 계정을 생성합니다.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="wallet">지갑 주소</Label>
                      <Input
                        id="wallet"
                        placeholder="tb1..."
                        value={newWallet}
                        onChange={(e) => setNewWallet(e.target.value)}
                        data-testid="input-new-wallet"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tier">티어</Label>
                      <Select value={newTier} onValueChange={setNewTier}>
                        <SelectTrigger data-testid="select-new-tier">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bronze">Bronze</SelectItem>
                          <SelectItem value="silver">Silver</SelectItem>
                          <SelectItem value="gold">Gold</SelectItem>
                          <SelectItem value="platinum">Platinum</SelectItem>
                          <SelectItem value="diamond">Diamond</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => addAccountMutation.mutate({ walletAddress: newWallet, tier: newTier })}
                      disabled={addAccountMutation.isPending || !newWallet}
                      data-testid="button-create-account"
                    >
                      {addAccountMutation.isPending ? "생성 중..." : "계정 생성"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Bulk Import Dialog */}
              <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" data-testid="button-bulk-import">
                    <Upload className="mr-2 h-4 w-4" />
                    대량 가져오기
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>레퍼럴 계정 대량 가져오기</DialogTitle>
                    <DialogDescription>CSV 형식: walletAddress,tier,totalReferrals,totalEarnings</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Textarea
                      placeholder="tb1abc123...,gold,10,100000000000000000000&#10;tb1def456...,silver,5,50000000000000000000"
                      rows={10}
                      value={csvData}
                      onChange={(e) => setCsvData(e.target.value)}
                      className="font-mono text-sm"
                      data-testid="textarea-csv-data"
                    />
                    <Button
                      className="w-full"
                      onClick={handleBulkImport}
                      disabled={bulkImportMutation.isPending || !csvData.trim()}
                      data-testid="button-execute-import"
                    >
                      {bulkImportMutation.isPending ? "가져오는 중..." : "가져오기 실행"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Distribute Rewards Dialog */}
              <Dialog open={isDistributeOpen} onOpenChange={setIsDistributeOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="sm" disabled={selectedAccounts.length === 0} data-testid="button-distribute">
                    <Gift className="mr-2 h-4 w-4" />
                    보상 분배 ({selectedAccounts.length})
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>보상 분배</DialogTitle>
                    <DialogDescription>선택된 {selectedAccounts.length}개 계정에 보상을 분배합니다.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">보상 금액 (TBURN)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="100"
                        value={rewardAmount}
                        onChange={(e) => setRewardAmount(e.target.value)}
                        data-testid="input-reward-amount"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">보상 유형</Label>
                      <Select value={rewardType} onValueChange={setRewardType}>
                        <SelectTrigger data-testid="select-reward-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bonus">보너스</SelectItem>
                          <SelectItem value="tier_upgrade">티어 업그레이드</SelectItem>
                          <SelectItem value="commission">커미션</SelectItem>
                          <SelectItem value="special">특별 보상</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleDistribute}
                      disabled={distributeMutation.isPending}
                      data-testid="button-execute-distribute"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {distributeMutation.isPending ? "분배 중..." : "분배 실행"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search & Filters */}
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="지갑 주소 또는 코드 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
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

          {/* Accounts Table */}
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
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedAccounts.length === filteredAccounts.length && filteredAccounts.length > 0}
                      onCheckedChange={toggleSelectAll}
                      data-testid="checkbox-select-all"
                    />
                  </TableHead>
                  <TableHead>지갑 주소</TableHead>
                  <TableHead>추천 코드</TableHead>
                  <TableHead>티어</TableHead>
                  <TableHead className="text-right">총 추천</TableHead>
                  <TableHead className="text-right">총 보상</TableHead>
                  <TableHead className="text-right">대기 보상</TableHead>
                  <TableHead>상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.map((account) => (
                  <TableRow key={account.id} data-testid={`row-account-${account.id}`}>
                    <TableCell>
                      <Checkbox
                        checked={selectedAccounts.includes(account.id)}
                        onCheckedChange={() => toggleAccountSelection(account.id)}
                        data-testid={`checkbox-account-${account.id}`}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      <div className="flex items-center gap-1">
                        <span>{account.walletAddress.substring(0, 12)}...{account.walletAddress.slice(-6)}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(account.walletAddress)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <code className="text-sm bg-muted px-2 py-0.5 rounded">{account.referralCode}</code>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(account.referralCode)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTierBadgeClass(account.tier)}>
                        {account.tier?.charAt(0).toUpperCase() + account.tier?.slice(1) || 'Bronze'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{account.totalReferrals || 0}</TableCell>
                    <TableCell className="text-right">{formatTBURN(account.totalEarnings)} TBURN</TableCell>
                    <TableCell className="text-right text-amber-500">{formatTBURN(account.pendingRewards || '0')} TBURN</TableCell>
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

      {/* Tier Information */}
      <Card>
        <CardHeader>
          <CardTitle>티어 구조</CardTitle>
          <CardDescription>Tier Structure & Rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { name: 'Bronze', min: 1, max: 9, commission: 10, bonus: 50, color: 'border-orange-500' },
              { name: 'Silver', min: 10, max: 49, commission: 15, bonus: 250, color: 'border-slate-400' },
              { name: 'Gold', min: 50, max: 199, commission: 20, bonus: 1000, color: 'border-yellow-500' },
              { name: 'Platinum', min: 200, max: 499, commission: 30, bonus: 5000, color: 'border-cyan-500' },
              { name: 'Diamond', min: 500, max: null, commission: 40, bonus: 20000, color: 'border-purple-500' },
            ].map((tier) => (
              <div key={tier.name} className={`p-4 border-2 ${tier.color} rounded-lg text-center`}>
                <h4 className="font-bold mb-2">{tier.name}</h4>
                <p className="text-sm text-muted-foreground mb-1">{tier.min} - {tier.max || '∞'} 추천</p>
                <p className="text-lg font-semibold text-emerald-500">{tier.commission}% 커미션</p>
                <p className="text-sm text-amber-500">+ {tier.bonus} TBURN 보너스</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
