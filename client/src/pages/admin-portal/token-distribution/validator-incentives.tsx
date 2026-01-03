import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Server, Coins, Activity, Award, Search, RefreshCw, ArrowLeft, Plus, Edit, CheckCircle2, Clock, XCircle, Eye, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ValidatorIncentivePayout {
  id: string;
  validatorAddress: string;
  incentiveType: string;
  periodStart: string;
  periodEnd: string;
  uptimePercent: number;
  blocksProposed: number;
  blocksVerified: number;
  performanceScore: number;
  baseReward: string;
  bonusMultiplier: number;
  totalPayout: string;
  status: string;
  approvedBy: string | null;
  distributionTxHash: string | null;
  createdAt: string;
  distributedAt: string | null;
}

const formatTBURN = (amount: string) => {
  const num = BigInt(amount || '0');
  const tburn = Number(num) / 1e18;
  if (tburn >= 1e6) return `${(tburn / 1e6).toFixed(2)}M`;
  if (tburn >= 1e3) return `${(tburn / 1e3).toFixed(2)}K`;
  return tburn.toFixed(4);
};

const STATUS_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "대기", color: "bg-yellow-500/20 text-yellow-400", icon: Clock },
  approved: { label: "승인됨", color: "bg-blue-500/20 text-blue-400", icon: CheckCircle2 },
  distributed: { label: "지급완료", color: "bg-emerald-500/20 text-emerald-400", icon: CheckCircle2 },
  rejected: { label: "거부됨", color: "bg-red-500/20 text-red-400", icon: XCircle },
};

const INCENTIVE_TYPES = [
  { value: "uptime_bonus", label: "가동률 보너스", description: "Uptime Bonus" },
  { value: "performance_bonus", label: "성과 보너스", description: "Performance Bonus" },
  { value: "early_adopter", label: "얼리어답터", description: "Early Adopter Reward" },
  { value: "loyalty", label: "충성도 보상", description: "Loyalty Reward" },
];

export default function AdminValidatorIncentives() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<ValidatorIncentivePayout | null>(null);
  
  const [formData, setFormData] = useState({
    validatorAddress: "",
    incentiveType: "uptime_bonus",
    periodStart: new Date().toISOString().slice(0, 16),
    periodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    uptimePercent: 99.9,
    blocksProposed: 100,
    blocksVerified: 500,
    performanceScore: 95,
    baseReward: "1000000000000000000",
    bonusMultiplier: 1.0,
  });

  const { data: payoutsData, isLoading, refetch } = useQuery<{ success: boolean; data: { payouts: ValidatorIncentivePayout[]; stats: any } }>({
    queryKey: ['/api/admin/token-programs/validator-incentives'],
  });

  const createPayoutMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const totalPayout = (BigInt(data.baseReward) * BigInt(Math.floor(data.bonusMultiplier * 100)) / BigInt(100)).toString();
      return apiRequest('POST', '/api/admin/token-programs/validator-incentives', {
        ...data,
        totalPayout,
        status: "pending",
      });
    },
    onSuccess: () => {
      toast({ title: "인센티브 생성 완료", description: "새 검증자 인센티브가 생성되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/validator-incentives'] });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "오류", description: "인센티브 생성에 실패했습니다.", variant: "destructive" });
    }
  });

  const updatePayoutMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ValidatorIncentivePayout> }) => {
      return apiRequest('PATCH', `/api/admin/token-programs/validator-incentives/${id}`, data);
    },
    onSuccess: () => {
      toast({ title: "인센티브 수정 완료", description: "검증자 인센티브가 수정되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/validator-incentives'] });
      setIsEditOpen(false);
      setSelectedPayout(null);
    },
    onError: () => {
      toast({ title: "오류", description: "인센티브 수정에 실패했습니다.", variant: "destructive" });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest('PATCH', `/api/admin/token-programs/validator-incentives/${id}`, { 
        status,
        ...(status === 'distributed' ? { distributedAt: new Date().toISOString() } : {}),
        ...(status === 'approved' ? { approvedBy: 'admin' } : {})
      });
    },
    onSuccess: () => {
      toast({ title: "상태 변경 완료", description: "인센티브 상태가 변경되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/validator-incentives'] });
    },
  });

  const resetForm = () => {
    setFormData({
      validatorAddress: "",
      incentiveType: "uptime_bonus",
      periodStart: new Date().toISOString().slice(0, 16),
      periodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      uptimePercent: 99.9,
      blocksProposed: 100,
      blocksVerified: 500,
      performanceScore: 95,
      baseReward: "1000000000000000000",
      bonusMultiplier: 1.0,
    });
  };

  const openEditDialog = (payout: ValidatorIncentivePayout) => {
    setSelectedPayout(payout);
    setFormData({
      validatorAddress: payout.validatorAddress,
      incentiveType: payout.incentiveType,
      periodStart: new Date(payout.periodStart).toISOString().slice(0, 16),
      periodEnd: new Date(payout.periodEnd).toISOString().slice(0, 16),
      uptimePercent: payout.uptimePercent,
      blocksProposed: payout.blocksProposed,
      blocksVerified: payout.blocksVerified,
      performanceScore: payout.performanceScore,
      baseReward: payout.baseReward,
      bonusMultiplier: payout.bonusMultiplier,
    });
    setIsEditOpen(true);
  };

  const openDetailDialog = (payout: ValidatorIncentivePayout) => {
    setSelectedPayout(payout);
    setIsDetailOpen(true);
  };

  const stats = payoutsData?.data?.stats || { totalPayouts: 0, totalAmount: "0", avgUptimePercent: 100, topPerformers: 0 };
  const payoutList = Array.isArray(payoutsData?.data?.payouts) ? payoutsData.data.payouts : [];

  const filteredPayouts = payoutList.filter(payout => {
    const matchesSearch = searchQuery === "" || 
      payout.validatorAddress.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || payout.status === statusFilter;
    const matchesType = typeFilter === "all" || payout.incentiveType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const calculatedTotalPayout = () => {
    try {
      return (BigInt(formData.baseReward) * BigInt(Math.floor(formData.bonusMultiplier * 100)) / BigInt(100)).toString();
    } catch {
      return "0";
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="admin-validator-incentives-page">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/admin/token-distribution")} data-testid="button-back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            검증자 인센티브 관리
          </h1>
          <p className="text-muted-foreground">Validator Incentives Management - 1월 3일 정식 오픈</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh">
          <RefreshCw className="mr-2 h-4 w-4" />
          새로고침
        </Button>
        <Button onClick={() => { resetForm(); setIsCreateOpen(true); }} data-testid="button-create-incentive">
          <Plus className="mr-2 h-4 w-4" />
          인센티브 생성
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total-payouts">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">총 지급</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPayouts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Payouts</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-amount">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">총 금액</CardTitle>
            <Coins className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTBURN(stats.totalAmount)} TBURN</div>
            <p className="text-xs text-muted-foreground">Total Amount</p>
          </CardContent>
        </Card>
        <Card data-testid="card-avg-uptime">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">평균 가동률</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgUptimePercent.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">Avg Uptime</p>
          </CardContent>
        </Card>
        <Card data-testid="card-top-performers">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">우수 검증자</CardTitle>
            <Award className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.topPerformers}</div>
            <p className="text-xs text-muted-foreground">Top Performers (95%+)</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>검증자 인센티브 지급 목록</CardTitle>
              <CardDescription>Validator Incentive Payouts - 가동률, 성과, 충성도 기반 보상</CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32" data-testid="select-status-filter">
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="pending">대기</SelectItem>
                  <SelectItem value="approved">승인됨</SelectItem>
                  <SelectItem value="distributed">지급완료</SelectItem>
                  <SelectItem value="rejected">거부됨</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-36" data-testid="select-type-filter">
                  <SelectValue placeholder="유형" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 유형</SelectItem>
                  {INCENTIVE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : filteredPayouts.length === 0 ? (
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
                  <TableHead>인센티브 유형</TableHead>
                  <TableHead className="text-right">가동률</TableHead>
                  <TableHead className="text-right">성과 점수</TableHead>
                  <TableHead className="text-right">총 지급액</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayouts.map((payout) => (
                  <TableRow key={payout.id} data-testid={`row-payout-${payout.id}`}>
                    <TableCell className="font-mono text-sm">
                      {payout.validatorAddress.slice(0, 10)}...{payout.validatorAddress.slice(-8)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {INCENTIVE_TYPES.find(t => t.value === payout.incentiveType)?.label || payout.incentiveType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={payout.uptimePercent >= 99 ? 'text-emerald-500' : payout.uptimePercent >= 95 ? 'text-yellow-500' : 'text-red-500'}>
                        {payout.uptimePercent.toFixed(2)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={payout.performanceScore >= 90 ? 'text-emerald-500' : payout.performanceScore >= 70 ? 'text-yellow-500' : 'text-red-500'}>
                        {payout.performanceScore.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatTBURN(payout.totalPayout)} TBURN</TableCell>
                    <TableCell>
                      <Select 
                        value={payout.status} 
                        onValueChange={(v) => updateStatusMutation.mutate({ id: payout.id, status: v })}
                      >
                        <SelectTrigger className="w-28 h-8" data-testid={`select-status-${payout.id}`}>
                          <Badge className={STATUS_LABELS[payout.status]?.color || 'bg-gray-500/20'}>
                            {STATUS_LABELS[payout.status]?.label || payout.status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">대기</SelectItem>
                          <SelectItem value="approved">승인됨</SelectItem>
                          <SelectItem value="distributed">지급완료</SelectItem>
                          <SelectItem value="rejected">거부됨</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openDetailDialog(payout)} data-testid={`button-detail-${payout.id}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(payout)} data-testid={`button-edit-${payout.id}`}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>새 검증자 인센티브 생성</DialogTitle>
            <DialogDescription>새로운 검증자 인센티브 지급을 생성합니다. Create a new validator incentive payout.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="validatorAddress">검증자 주소 *</Label>
              <Input
                id="validatorAddress"
                value={formData.validatorAddress}
                onChange={(e) => setFormData({ ...formData, validatorAddress: e.target.value })}
                placeholder="tb1..."
                data-testid="input-validator-address"
              />
            </div>
            <div className="grid gap-2">
              <Label>인센티브 유형</Label>
              <Select 
                value={formData.incentiveType} 
                onValueChange={(v) => setFormData({ ...formData, incentiveType: v })}
              >
                <SelectTrigger data-testid="select-incentive-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INCENTIVE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label} ({type.description})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="periodStart">기간 시작</Label>
                <Input
                  id="periodStart"
                  type="datetime-local"
                  value={formData.periodStart}
                  onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })}
                  data-testid="input-period-start"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="periodEnd">기간 종료</Label>
                <Input
                  id="periodEnd"
                  type="datetime-local"
                  value={formData.periodEnd}
                  onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
                  data-testid="input-period-end"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="uptimePercent">가동률 (%)</Label>
                <Input
                  id="uptimePercent"
                  type="number"
                  step="0.01"
                  value={formData.uptimePercent}
                  onChange={(e) => setFormData({ ...formData, uptimePercent: parseFloat(e.target.value) || 0 })}
                  data-testid="input-uptime-percent"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="performanceScore">성과 점수</Label>
                <Input
                  id="performanceScore"
                  type="number"
                  step="0.1"
                  value={formData.performanceScore}
                  onChange={(e) => setFormData({ ...formData, performanceScore: parseFloat(e.target.value) || 0 })}
                  data-testid="input-performance-score"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="blocksProposed">제안 블록 수</Label>
                <Input
                  id="blocksProposed"
                  type="number"
                  value={formData.blocksProposed}
                  onChange={(e) => setFormData({ ...formData, blocksProposed: parseInt(e.target.value) || 0 })}
                  data-testid="input-blocks-proposed"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="blocksVerified">검증 블록 수</Label>
                <Input
                  id="blocksVerified"
                  type="number"
                  value={formData.blocksVerified}
                  onChange={(e) => setFormData({ ...formData, blocksVerified: parseInt(e.target.value) || 0 })}
                  data-testid="input-blocks-verified"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="baseReward">기본 보상 (wei)</Label>
                <Input
                  id="baseReward"
                  value={formData.baseReward}
                  onChange={(e) => setFormData({ ...formData, baseReward: e.target.value })}
                  placeholder="1000000000000000000"
                  data-testid="input-base-reward"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bonusMultiplier">보너스 배수</Label>
                <Input
                  id="bonusMultiplier"
                  type="number"
                  step="0.01"
                  value={formData.bonusMultiplier}
                  onChange={(e) => setFormData({ ...formData, bonusMultiplier: parseFloat(e.target.value) || 1 })}
                  data-testid="input-bonus-multiplier"
                />
              </div>
            </div>
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">계산된 총 지급액:</span>
                  <span className="text-lg font-bold text-emerald-500">{formatTBURN(calculatedTotalPayout())} TBURN</span>
                </div>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} data-testid="button-cancel-create">
              취소
            </Button>
            <Button 
              onClick={() => createPayoutMutation.mutate(formData)}
              disabled={!formData.validatorAddress || createPayoutMutation.isPending}
              data-testid="button-submit-create"
            >
              {createPayoutMutation.isPending ? "생성 중..." : "생성"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>검증자 인센티브 수정</DialogTitle>
            <DialogDescription>인센티브 지급 정보를 수정합니다.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>검증자 주소</Label>
              <Input
                value={formData.validatorAddress}
                onChange={(e) => setFormData({ ...formData, validatorAddress: e.target.value })}
                data-testid="input-edit-validator-address"
              />
            </div>
            <div className="grid gap-2">
              <Label>인센티브 유형</Label>
              <Select 
                value={formData.incentiveType} 
                onValueChange={(v) => setFormData({ ...formData, incentiveType: v })}
              >
                <SelectTrigger data-testid="select-edit-incentive-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INCENTIVE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>기간 시작</Label>
                <Input
                  type="datetime-local"
                  value={formData.periodStart}
                  onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })}
                  data-testid="input-edit-period-start"
                />
              </div>
              <div className="grid gap-2">
                <Label>기간 종료</Label>
                <Input
                  type="datetime-local"
                  value={formData.periodEnd}
                  onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
                  data-testid="input-edit-period-end"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>가동률 (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.uptimePercent}
                  onChange={(e) => setFormData({ ...formData, uptimePercent: parseFloat(e.target.value) || 0 })}
                  data-testid="input-edit-uptime-percent"
                />
              </div>
              <div className="grid gap-2">
                <Label>성과 점수</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.performanceScore}
                  onChange={(e) => setFormData({ ...formData, performanceScore: parseFloat(e.target.value) || 0 })}
                  data-testid="input-edit-performance-score"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>제안 블록 수</Label>
                <Input
                  type="number"
                  value={formData.blocksProposed}
                  onChange={(e) => setFormData({ ...formData, blocksProposed: parseInt(e.target.value) || 0 })}
                  data-testid="input-edit-blocks-proposed"
                />
              </div>
              <div className="grid gap-2">
                <Label>검증 블록 수</Label>
                <Input
                  type="number"
                  value={formData.blocksVerified}
                  onChange={(e) => setFormData({ ...formData, blocksVerified: parseInt(e.target.value) || 0 })}
                  data-testid="input-edit-blocks-verified"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>기본 보상 (wei)</Label>
                <Input
                  value={formData.baseReward}
                  onChange={(e) => setFormData({ ...formData, baseReward: e.target.value })}
                  data-testid="input-edit-base-reward"
                />
              </div>
              <div className="grid gap-2">
                <Label>보너스 배수</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.bonusMultiplier}
                  onChange={(e) => setFormData({ ...formData, bonusMultiplier: parseFloat(e.target.value) || 1 })}
                  data-testid="input-edit-bonus-multiplier"
                />
              </div>
            </div>
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">계산된 총 지급액:</span>
                  <span className="text-lg font-bold text-emerald-500">{formatTBURN(calculatedTotalPayout())} TBURN</span>
                </div>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} data-testid="button-cancel-edit">
              취소
            </Button>
            <Button 
              onClick={() => selectedPayout && updatePayoutMutation.mutate({ 
                id: selectedPayout.id, 
                data: {
                  ...formData,
                  totalPayout: calculatedTotalPayout()
                }
              })}
              disabled={updatePayoutMutation.isPending}
              data-testid="button-submit-edit"
            >
              {updatePayoutMutation.isPending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>검증자 인센티브 상세</DialogTitle>
            <DialogDescription>인센티브 지급 상세 정보입니다</DialogDescription>
          </DialogHeader>
          {selectedPayout && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <Activity className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                      <div className="text-xl font-bold">{selectedPayout.uptimePercent.toFixed(2)}%</div>
                      <div className="text-xs text-muted-foreground">가동률</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <TrendingUp className="h-6 w-6 mx-auto text-emerald-500 mb-2" />
                      <div className="text-xl font-bold">{selectedPayout.performanceScore.toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">성과 점수</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <Coins className="h-6 w-6 mx-auto text-yellow-500 mb-2" />
                      <div className="text-xl font-bold">{formatTBURN(selectedPayout.totalPayout)}</div>
                      <div className="text-xs text-muted-foreground">총 지급액</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">검증자 주소:</span>
                  <p className="font-mono">{selectedPayout.validatorAddress}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">인센티브 유형:</span>
                  <p>{INCENTIVE_TYPES.find(t => t.value === selectedPayout.incentiveType)?.label}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">기간:</span>
                  <p>{new Date(selectedPayout.periodStart).toLocaleDateString()} ~ {new Date(selectedPayout.periodEnd).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">상태:</span>
                  <p><Badge className={STATUS_LABELS[selectedPayout.status]?.color}>{STATUS_LABELS[selectedPayout.status]?.label}</Badge></p>
                </div>
                <div>
                  <span className="text-muted-foreground">제안 블록:</span>
                  <p>{selectedPayout.blocksProposed.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">검증 블록:</span>
                  <p>{selectedPayout.blocksVerified.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">기본 보상:</span>
                  <p>{formatTBURN(selectedPayout.baseReward)} TBURN</p>
                </div>
                <div>
                  <span className="text-muted-foreground">보너스 배수:</span>
                  <p>{selectedPayout.bonusMultiplier}x</p>
                </div>
                {selectedPayout.approvedBy && (
                  <div>
                    <span className="text-muted-foreground">승인자:</span>
                    <p>{selectedPayout.approvedBy}</p>
                  </div>
                )}
                {selectedPayout.distributedAt && (
                  <div>
                    <span className="text-muted-foreground">지급일:</span>
                    <p>{new Date(selectedPayout.distributedAt).toLocaleString('ko-KR')}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)} data-testid="button-close-detail">
              닫기
            </Button>
            {selectedPayout && selectedPayout.status === 'pending' && (
              <Button 
                onClick={() => {
                  updateStatusMutation.mutate({ id: selectedPayout.id, status: 'approved' });
                  setIsDetailOpen(false);
                }}
                data-testid="button-approve"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                승인
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
