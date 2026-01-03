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
import { Blocks, Coins, Fuel, TrendingUp, Search, RefreshCw, ArrowLeft, Plus, Eye, Edit, Wallet, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface BlockRewardCycle {
  id: string;
  cycleNumber: number;
  epochNumber: number;
  startBlockNumber: number;
  endBlockNumber: number | null;
  totalBlockRewards: string;
  totalGasFees: string;
  proposerRewards: string;
  verifierRewards: string;
  blocksProduced: number;
  transactionsProcessed: number;
  status: string;
  distributionStatus: string;
  startedAt: string;
  completedAt: string | null;
}

interface BlockRewardPayout {
  id: string;
  cycleId: string;
  validatorAddress: string;
  rewardType: string;
  blockNumber: number | null;
  rewardAmount: string;
  gasFeeShare: string;
  status: string;
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

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: "진행중", color: "bg-blue-500/20 text-blue-400" },
  completed: { label: "완료", color: "bg-emerald-500/20 text-emerald-400" },
  distributing: { label: "배분중", color: "bg-purple-500/20 text-purple-400" },
};

const DIST_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "대기", color: "bg-yellow-500/20 text-yellow-400" },
  processing: { label: "처리중", color: "bg-blue-500/20 text-blue-400" },
  completed: { label: "완료", color: "bg-emerald-500/20 text-emerald-400" },
};

const PAYOUT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "대기", color: "bg-yellow-500/20 text-yellow-400" },
  distributed: { label: "지급됨", color: "bg-emerald-500/20 text-emerald-400" },
  failed: { label: "실패", color: "bg-red-500/20 text-red-400" },
};

const REWARD_TYPES = [
  { value: "proposer", label: "블록 제안자 보상" },
  { value: "verifier", label: "검증자 보상" },
  { value: "gas_fee", label: "가스비 분배" },
];

export default function AdminBlockRewards() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [isCreateCycleOpen, setIsCreateCycleOpen] = useState(false);
  const [isEditCycleOpen, setIsEditCycleOpen] = useState(false);
  const [isPayoutsOpen, setIsPayoutsOpen] = useState(false);
  const [isAddPayoutOpen, setIsAddPayoutOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<BlockRewardCycle | null>(null);
  
  const [cycleFormData, setCycleFormData] = useState({
    cycleNumber: 1,
    epochNumber: 1,
    startBlockNumber: 0,
    endBlockNumber: 0,
    totalBlockRewards: "0",
    totalGasFees: "0",
    proposerRewards: "0",
    verifierRewards: "0",
    blocksProduced: 0,
    transactionsProcessed: 0,
  });

  const [payoutFormData, setPayoutFormData] = useState({
    validatorAddress: "",
    rewardType: "proposer",
    blockNumber: 0,
    rewardAmount: "1000000000000000000",
    gasFeeShare: "0",
  });

  const { data: cyclesData, isLoading, refetch } = useQuery<{ success: boolean; data: { cycles: BlockRewardCycle[]; stats: any } }>({
    queryKey: ['/api/admin/token-programs/block-rewards/cycles'],
  });

  const { data: payoutsData, isLoading: payoutsLoading } = useQuery<{ success: boolean; data: BlockRewardPayout[] }>({
    queryKey: ['/api/admin/token-programs/block-rewards/cycles', selectedCycle?.id, 'payouts'],
    enabled: !!selectedCycle && isPayoutsOpen,
  });

  const createCycleMutation = useMutation({
    mutationFn: async (data: typeof cycleFormData) => {
      return apiRequest('POST', '/api/admin/token-programs/block-rewards/cycles', {
        ...data,
        status: "active",
        distributionStatus: "pending",
      });
    },
    onSuccess: () => {
      toast({ title: "사이클 생성 완료", description: "새 블록 보상 사이클이 생성되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/block-rewards/cycles'] });
      setIsCreateCycleOpen(false);
      resetCycleForm();
    },
    onError: () => {
      toast({ title: "오류", description: "사이클 생성에 실패했습니다.", variant: "destructive" });
    }
  });

  const updateCycleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BlockRewardCycle> }) => {
      return apiRequest('PATCH', `/api/admin/token-programs/block-rewards/cycles/${id}`, data);
    },
    onSuccess: () => {
      toast({ title: "사이클 수정 완료", description: "블록 보상 사이클이 수정되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/block-rewards/cycles'] });
      setIsEditCycleOpen(false);
      setSelectedCycle(null);
    },
    onError: () => {
      toast({ title: "오류", description: "사이클 수정에 실패했습니다.", variant: "destructive" });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, distributionStatus }: { id: string; status?: string; distributionStatus?: string }) => {
      return apiRequest('PATCH', `/api/admin/token-programs/block-rewards/cycles/${id}`, { 
        status, 
        distributionStatus,
        ...(status === 'completed' ? { completedAt: new Date().toISOString() } : {})
      });
    },
    onSuccess: () => {
      toast({ title: "상태 변경 완료", description: "사이클 상태가 변경되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/block-rewards/cycles'] });
    },
  });

  const createPayoutMutation = useMutation({
    mutationFn: async ({ cycleId, data }: { cycleId: string; data: typeof payoutFormData }) => {
      return apiRequest('POST', `/api/admin/token-programs/block-rewards/cycles/${cycleId}/payouts`, data);
    },
    onSuccess: () => {
      toast({ title: "보상 지급 생성", description: "새 보상 지급이 생성되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/block-rewards/cycles'] });
      if (selectedCycle) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/block-rewards/cycles', selectedCycle.id, 'payouts'] });
      }
      setIsAddPayoutOpen(false);
      setPayoutFormData({ validatorAddress: "", rewardType: "proposer", blockNumber: 0, rewardAmount: "1000000000000000000", gasFeeShare: "0" });
    },
    onError: () => {
      toast({ title: "오류", description: "보상 지급 생성에 실패했습니다.", variant: "destructive" });
    }
  });

  const updatePayoutMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest('PATCH', `/api/admin/token-programs/block-rewards/payouts/${id}`, { 
        status,
        ...(status === 'distributed' ? { distributedAt: new Date().toISOString() } : {})
      });
    },
    onSuccess: () => {
      toast({ title: "지급 상태 변경", description: "보상 지급 상태가 변경되었습니다." });
      if (selectedCycle) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/block-rewards/cycles', selectedCycle.id, 'payouts'] });
      }
    },
  });

  const resetCycleForm = () => {
    const nextCycleNumber = (cycleList.length > 0 ? Math.max(...cycleList.map(c => c.cycleNumber)) : 0) + 1;
    setCycleFormData({
      cycleNumber: nextCycleNumber,
      epochNumber: 1,
      startBlockNumber: 0,
      endBlockNumber: 0,
      totalBlockRewards: "0",
      totalGasFees: "0",
      proposerRewards: "0",
      verifierRewards: "0",
      blocksProduced: 0,
      transactionsProcessed: 0,
    });
  };

  const openEditCycle = (cycle: BlockRewardCycle) => {
    setSelectedCycle(cycle);
    setCycleFormData({
      cycleNumber: cycle.cycleNumber,
      epochNumber: cycle.epochNumber,
      startBlockNumber: cycle.startBlockNumber,
      endBlockNumber: cycle.endBlockNumber || 0,
      totalBlockRewards: cycle.totalBlockRewards,
      totalGasFees: cycle.totalGasFees,
      proposerRewards: cycle.proposerRewards,
      verifierRewards: cycle.verifierRewards,
      blocksProduced: cycle.blocksProduced,
      transactionsProcessed: cycle.transactionsProcessed,
    });
    setIsEditCycleOpen(true);
  };

  const openPayouts = (cycle: BlockRewardCycle) => {
    setSelectedCycle(cycle);
    setIsPayoutsOpen(true);
  };

  const handlePayoutsDialogClose = (open: boolean) => {
    if (!open) {
      setSelectedCycle(null);
      setIsAddPayoutOpen(false);
    }
    setIsPayoutsOpen(open);
  };

  const stats = cyclesData?.data?.stats || { totalCycles: 0, totalRewards: "0", totalGasFees: "0", avgRewardPerCycle: "0" };
  const cycleList = Array.isArray(cyclesData?.data?.cycles) ? cyclesData.data.cycles : [];
  const payouts = Array.isArray(payoutsData?.data) ? payoutsData.data : [];

  const filteredCycles = cycleList.filter(cycle => {
    const matchesSearch = searchQuery === "" || 
      cycle.cycleNumber.toString().includes(searchQuery) ||
      cycle.epochNumber.toString().includes(searchQuery);
    const matchesStatus = statusFilter === "all" || cycle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
          <p className="text-muted-foreground">Block Rewards Management - 1월 3일 정식 오픈</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh">
          <RefreshCw className="mr-2 h-4 w-4" />
          새로고침
        </Button>
        <Button onClick={() => { resetCycleForm(); setIsCreateCycleOpen(true); }} data-testid="button-create-cycle">
          <Plus className="mr-2 h-4 w-4" />
          사이클 생성
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total-cycles">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">총 사이클</CardTitle>
            <Blocks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCycles.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Cycles</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-rewards">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">총 보상</CardTitle>
            <Coins className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTBURN(stats.totalRewards)} TBURN</div>
            <p className="text-xs text-muted-foreground">Total Rewards</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-gas-fees">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">총 가스비</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTBURN(stats.totalGasFees)} TBURN</div>
            <p className="text-xs text-muted-foreground">Total Gas Fees</p>
          </CardContent>
        </Card>
        <Card data-testid="card-avg-reward">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">평균 보상</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTBURN(stats.avgRewardPerCycle)} TBURN</div>
            <p className="text-xs text-muted-foreground">Avg per Cycle</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>보상 사이클 목록</CardTitle>
              <CardDescription>Reward Cycles List - 검증자 블록 보상 관리</CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32" data-testid="select-status-filter">
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="active">진행중</SelectItem>
                  <SelectItem value="completed">완료</SelectItem>
                  <SelectItem value="distributing">배분중</SelectItem>
                </SelectContent>
              </Select>
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
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : filteredCycles.length === 0 ? (
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
                  <TableHead>블록 범위</TableHead>
                  <TableHead className="text-right">블록 보상</TableHead>
                  <TableHead className="text-right">가스비</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>배분 상태</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCycles.map((cycle) => (
                  <TableRow key={cycle.id} data-testid={`row-cycle-${cycle.id}`}>
                    <TableCell className="font-mono font-bold">#{cycle.cycleNumber}</TableCell>
                    <TableCell>Epoch {cycle.epochNumber}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {cycle.startBlockNumber.toLocaleString()} - {cycle.endBlockNumber?.toLocaleString() || '진행중'}
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatTBURN(cycle.totalBlockRewards)} TBURN</TableCell>
                    <TableCell className="text-right">{formatTBURN(cycle.totalGasFees)} TBURN</TableCell>
                    <TableCell>
                      <Select 
                        value={cycle.status} 
                        onValueChange={(v) => updateStatusMutation.mutate({ id: cycle.id, status: v })}
                      >
                        <SelectTrigger className="w-28 h-8" data-testid={`select-status-${cycle.id}`}>
                          <Badge className={STATUS_LABELS[cycle.status]?.color || 'bg-gray-500/20'}>
                            {STATUS_LABELS[cycle.status]?.label || cycle.status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">진행중</SelectItem>
                          <SelectItem value="completed">완료</SelectItem>
                          <SelectItem value="distributing">배분중</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={cycle.distributionStatus} 
                        onValueChange={(v) => updateStatusMutation.mutate({ id: cycle.id, distributionStatus: v })}
                      >
                        <SelectTrigger className="w-28 h-8" data-testid={`select-dist-status-${cycle.id}`}>
                          <Badge className={DIST_STATUS_LABELS[cycle.distributionStatus]?.color || 'bg-gray-500/20'}>
                            {DIST_STATUS_LABELS[cycle.distributionStatus]?.label || cycle.distributionStatus}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">대기</SelectItem>
                          <SelectItem value="processing">처리중</SelectItem>
                          <SelectItem value="completed">완료</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openPayouts(cycle)} data-testid={`button-payouts-${cycle.id}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditCycle(cycle)} data-testid={`button-edit-${cycle.id}`}>
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

      <Dialog open={isCreateCycleOpen} onOpenChange={setIsCreateCycleOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>새 블록 보상 사이클 생성</DialogTitle>
            <DialogDescription>새로운 블록 보상 사이클을 생성합니다. Create a new block reward cycle.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cycleNumber">사이클 번호 *</Label>
                <Input
                  id="cycleNumber"
                  type="number"
                  value={cycleFormData.cycleNumber}
                  onChange={(e) => setCycleFormData({ ...cycleFormData, cycleNumber: parseInt(e.target.value) || 0 })}
                  data-testid="input-cycle-number"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="epochNumber">에포크 번호 *</Label>
                <Input
                  id="epochNumber"
                  type="number"
                  value={cycleFormData.epochNumber}
                  onChange={(e) => setCycleFormData({ ...cycleFormData, epochNumber: parseInt(e.target.value) || 0 })}
                  data-testid="input-epoch-number"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startBlockNumber">시작 블록 번호</Label>
                <Input
                  id="startBlockNumber"
                  type="number"
                  value={cycleFormData.startBlockNumber}
                  onChange={(e) => setCycleFormData({ ...cycleFormData, startBlockNumber: parseInt(e.target.value) || 0 })}
                  data-testid="input-start-block"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endBlockNumber">종료 블록 번호</Label>
                <Input
                  id="endBlockNumber"
                  type="number"
                  value={cycleFormData.endBlockNumber}
                  onChange={(e) => setCycleFormData({ ...cycleFormData, endBlockNumber: parseInt(e.target.value) || 0 })}
                  data-testid="input-end-block"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="totalBlockRewards">총 블록 보상 (wei)</Label>
                <Input
                  id="totalBlockRewards"
                  value={cycleFormData.totalBlockRewards}
                  onChange={(e) => setCycleFormData({ ...cycleFormData, totalBlockRewards: e.target.value })}
                  placeholder="1000000000000000000"
                  data-testid="input-total-rewards"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="totalGasFees">총 가스비 (wei)</Label>
                <Input
                  id="totalGasFees"
                  value={cycleFormData.totalGasFees}
                  onChange={(e) => setCycleFormData({ ...cycleFormData, totalGasFees: e.target.value })}
                  placeholder="0"
                  data-testid="input-total-gas"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="blocksProduced">생산 블록 수</Label>
                <Input
                  id="blocksProduced"
                  type="number"
                  value={cycleFormData.blocksProduced}
                  onChange={(e) => setCycleFormData({ ...cycleFormData, blocksProduced: parseInt(e.target.value) || 0 })}
                  data-testid="input-blocks-produced"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="transactionsProcessed">처리 트랜잭션 수</Label>
                <Input
                  id="transactionsProcessed"
                  type="number"
                  value={cycleFormData.transactionsProcessed}
                  onChange={(e) => setCycleFormData({ ...cycleFormData, transactionsProcessed: parseInt(e.target.value) || 0 })}
                  data-testid="input-tx-processed"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateCycleOpen(false)} data-testid="button-cancel-create">
              취소
            </Button>
            <Button 
              onClick={() => createCycleMutation.mutate(cycleFormData)}
              disabled={createCycleMutation.isPending}
              data-testid="button-submit-create"
            >
              {createCycleMutation.isPending ? "생성 중..." : "생성"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditCycleOpen} onOpenChange={setIsEditCycleOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>블록 보상 사이클 수정</DialogTitle>
            <DialogDescription>사이클 #{selectedCycle?.cycleNumber} 정보를 수정합니다.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="editCycleNumber">사이클 번호</Label>
                <Input
                  id="editCycleNumber"
                  type="number"
                  value={cycleFormData.cycleNumber}
                  onChange={(e) => setCycleFormData({ ...cycleFormData, cycleNumber: parseInt(e.target.value) || 0 })}
                  data-testid="input-edit-cycle-number"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editEpochNumber">에포크 번호</Label>
                <Input
                  id="editEpochNumber"
                  type="number"
                  value={cycleFormData.epochNumber}
                  onChange={(e) => setCycleFormData({ ...cycleFormData, epochNumber: parseInt(e.target.value) || 0 })}
                  data-testid="input-edit-epoch-number"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>시작 블록</Label>
                <Input
                  type="number"
                  value={cycleFormData.startBlockNumber}
                  onChange={(e) => setCycleFormData({ ...cycleFormData, startBlockNumber: parseInt(e.target.value) || 0 })}
                  data-testid="input-edit-start-block"
                />
              </div>
              <div className="grid gap-2">
                <Label>종료 블록</Label>
                <Input
                  type="number"
                  value={cycleFormData.endBlockNumber}
                  onChange={(e) => setCycleFormData({ ...cycleFormData, endBlockNumber: parseInt(e.target.value) || 0 })}
                  data-testid="input-edit-end-block"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>총 블록 보상 (wei)</Label>
                <Input
                  value={cycleFormData.totalBlockRewards}
                  onChange={(e) => setCycleFormData({ ...cycleFormData, totalBlockRewards: e.target.value })}
                  data-testid="input-edit-total-rewards"
                />
              </div>
              <div className="grid gap-2">
                <Label>총 가스비 (wei)</Label>
                <Input
                  value={cycleFormData.totalGasFees}
                  onChange={(e) => setCycleFormData({ ...cycleFormData, totalGasFees: e.target.value })}
                  data-testid="input-edit-total-gas"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>제안자 보상 (wei)</Label>
                <Input
                  value={cycleFormData.proposerRewards}
                  onChange={(e) => setCycleFormData({ ...cycleFormData, proposerRewards: e.target.value })}
                  data-testid="input-edit-proposer-rewards"
                />
              </div>
              <div className="grid gap-2">
                <Label>검증자 보상 (wei)</Label>
                <Input
                  value={cycleFormData.verifierRewards}
                  onChange={(e) => setCycleFormData({ ...cycleFormData, verifierRewards: e.target.value })}
                  data-testid="input-edit-verifier-rewards"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>생산 블록 수</Label>
                <Input
                  type="number"
                  value={cycleFormData.blocksProduced}
                  onChange={(e) => setCycleFormData({ ...cycleFormData, blocksProduced: parseInt(e.target.value) || 0 })}
                  data-testid="input-edit-blocks-produced"
                />
              </div>
              <div className="grid gap-2">
                <Label>처리 트랜잭션 수</Label>
                <Input
                  type="number"
                  value={cycleFormData.transactionsProcessed}
                  onChange={(e) => setCycleFormData({ ...cycleFormData, transactionsProcessed: parseInt(e.target.value) || 0 })}
                  data-testid="input-edit-tx-processed"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditCycleOpen(false)} data-testid="button-cancel-edit">
              취소
            </Button>
            <Button 
              onClick={() => selectedCycle && updateCycleMutation.mutate({ 
                id: selectedCycle.id, 
                data: cycleFormData 
              })}
              disabled={updateCycleMutation.isPending}
              data-testid="button-submit-edit"
            >
              {updateCycleMutation.isPending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPayoutsOpen} onOpenChange={handlePayoutsDialogClose}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <DialogTitle>보상 지급 현황: 사이클 #{selectedCycle?.cycleNumber}</DialogTitle>
                <DialogDescription>이 사이클의 검증자 보상 지급 내역입니다</DialogDescription>
              </div>
              <Button onClick={() => setIsAddPayoutOpen(true)} size="sm" data-testid="button-add-payout">
                <Plus className="mr-2 h-4 w-4" />
                보상 지급 추가
              </Button>
            </div>
          </DialogHeader>
          
          {selectedCycle && (
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <Coins className="h-6 w-6 mx-auto text-emerald-500 mb-2" />
                    <div className="text-xl font-bold text-emerald-500">{formatTBURN(selectedCycle.totalBlockRewards)}</div>
                    <div className="text-xs text-muted-foreground">총 블록 보상</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <Fuel className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                    <div className="text-xl font-bold text-blue-500">{formatTBURN(selectedCycle.totalGasFees)}</div>
                    <div className="text-xs text-muted-foreground">총 가스비</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <Blocks className="h-6 w-6 mx-auto text-purple-500 mb-2" />
                    <div className="text-xl font-bold text-purple-500">{selectedCycle.blocksProduced.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">생산 블록</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {payoutsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-10" />)}
            </div>
          ) : payouts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>보상 지급 기록이 없습니다</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>검증자 주소</TableHead>
                  <TableHead>보상 유형</TableHead>
                  <TableHead className="text-right">보상액</TableHead>
                  <TableHead className="text-right">가스비 분배</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>생성일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((payout) => (
                  <TableRow key={payout.id} data-testid={`row-payout-${payout.id}`}>
                    <TableCell className="font-mono text-sm">
                      {payout.validatorAddress.slice(0, 10)}...{payout.validatorAddress.slice(-8)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {REWARD_TYPES.find(r => r.value === payout.rewardType)?.label || payout.rewardType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatTBURN(payout.rewardAmount)} TBURN</TableCell>
                    <TableCell className="text-right">{formatTBURN(payout.gasFeeShare)} TBURN</TableCell>
                    <TableCell>
                      <Select 
                        value={payout.status} 
                        onValueChange={(v) => updatePayoutMutation.mutate({ id: payout.id, status: v })}
                      >
                        <SelectTrigger className="w-28 h-8" data-testid={`select-payout-status-${payout.id}`}>
                          <Badge className={PAYOUT_STATUS_LABELS[payout.status]?.color || 'bg-gray-500/20'}>
                            {PAYOUT_STATUS_LABELS[payout.status]?.label || payout.status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">대기</SelectItem>
                          <SelectItem value="distributed">지급됨</SelectItem>
                          <SelectItem value="failed">실패</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(payout.createdAt).toLocaleDateString('ko-KR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAddPayoutOpen} onOpenChange={setIsAddPayoutOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>보상 지급 추가</DialogTitle>
            <DialogDescription>사이클 #{selectedCycle?.cycleNumber}에 새 보상 지급을 추가합니다</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="validatorAddress">검증자 주소 *</Label>
              <Input
                id="validatorAddress"
                value={payoutFormData.validatorAddress}
                onChange={(e) => setPayoutFormData({ ...payoutFormData, validatorAddress: e.target.value })}
                placeholder="tb1..."
                data-testid="input-validator-address"
              />
            </div>
            <div className="grid gap-2">
              <Label>보상 유형</Label>
              <Select 
                value={payoutFormData.rewardType} 
                onValueChange={(v) => setPayoutFormData({ ...payoutFormData, rewardType: v })}
              >
                <SelectTrigger data-testid="select-reward-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REWARD_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rewardAmount">보상액 (wei)</Label>
              <Input
                id="rewardAmount"
                value={payoutFormData.rewardAmount}
                onChange={(e) => setPayoutFormData({ ...payoutFormData, rewardAmount: e.target.value })}
                placeholder="1000000000000000000"
                data-testid="input-reward-amount"
              />
              <p className="text-xs text-muted-foreground">
                ≈ {formatTBURN(payoutFormData.rewardAmount)} TBURN
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gasFeeShare">가스비 분배 (wei)</Label>
              <Input
                id="gasFeeShare"
                value={payoutFormData.gasFeeShare}
                onChange={(e) => setPayoutFormData({ ...payoutFormData, gasFeeShare: e.target.value })}
                placeholder="0"
                data-testid="input-gas-fee-share"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="blockNumber">블록 번호 (선택)</Label>
              <Input
                id="blockNumber"
                type="number"
                value={payoutFormData.blockNumber}
                onChange={(e) => setPayoutFormData({ ...payoutFormData, blockNumber: parseInt(e.target.value) || 0 })}
                data-testid="input-block-number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPayoutOpen(false)} data-testid="button-cancel-payout">
              취소
            </Button>
            <Button 
              onClick={() => selectedCycle && createPayoutMutation.mutate({ 
                cycleId: selectedCycle.id, 
                data: payoutFormData 
              })}
              disabled={!payoutFormData.validatorAddress || createPayoutMutation.isPending}
              data-testid="button-submit-payout"
            >
              {createPayoutMutation.isPending ? "추가 중..." : "보상 추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
