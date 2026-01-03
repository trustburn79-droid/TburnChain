import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Shield, Coins, Lock, Search, RefreshCw, ArrowLeft, Plus, Eye, Edit, Calendar, Target, Building2, Users, TrendingUp, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface StrategicPartner {
  id: string;
  name: string;
  description: string | null;
  partnerType: string;
  contractType: string;
  logoUrl: string | null;
  website: string | null;
  contactEmail: string | null;
  contactPerson: string | null;
  walletAddress: string | null;
  allocation: string;
  distributedAmount: string;
  lockedAmount: string;
  vestingType: string;
  vestingStartDate: string | null;
  vestingEndDate: string | null;
  cliffMonths: number;
  vestingMonths: number;
  tgePercentage: number;
  contractSignedDate: string | null;
  partnerSince: string | null;
  status: string;
  tier: string;
  notes: string | null;
  milestones: any;
  createdAt: string;
  updatedAt: string;
}

interface StrategicPartnerPayout {
  id: string;
  partnerId: string;
  amount: string;
  payoutType: string;
  txHash: string | null;
  status: string;
  scheduledDate: string | null;
  processedDate: string | null;
  notes: string | null;
  createdAt: string;
}

interface StrategicPartnerMilestone {
  id: string;
  partnerId: string;
  title: string;
  description: string | null;
  targetDate: string | null;
  completedDate: string | null;
  rewardAmount: string;
  status: string;
  evidence: string | null;
  verifiedBy: string | null;
  createdAt: string;
}

const formatTBURN = (amount: string) => {
  const num = BigInt(amount || '0');
  const tburn = Number(num) / 1e18;
  if (tburn >= 1e6) return `${(tburn / 1e6).toFixed(2)}M`;
  if (tburn >= 1e3) return `${(tburn / 1e3).toFixed(2)}K`;
  return tburn.toFixed(4);
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "대기", color: "bg-yellow-500/20 text-yellow-400" },
  active: { label: "활성", color: "bg-emerald-500/20 text-emerald-400" },
  paused: { label: "일시중지", color: "bg-orange-500/20 text-orange-400" },
  completed: { label: "완료", color: "bg-blue-500/20 text-blue-400" },
  terminated: { label: "종료", color: "bg-red-500/20 text-red-400" },
};

const PAYOUT_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: "대기", color: "bg-yellow-500/20 text-yellow-400" },
  scheduled: { label: "예정", color: "bg-blue-500/20 text-blue-400" },
  processing: { label: "처리중", color: "bg-purple-500/20 text-purple-400" },
  completed: { label: "완료", color: "bg-emerald-500/20 text-emerald-400" },
  failed: { label: "실패", color: "bg-red-500/20 text-red-400" },
};

const MILESTONE_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: "대기", color: "bg-yellow-500/20 text-yellow-400" },
  in_progress: { label: "진행중", color: "bg-blue-500/20 text-blue-400" },
  completed: { label: "완료", color: "bg-emerald-500/20 text-emerald-400" },
  verified: { label: "검증됨", color: "bg-purple-500/20 text-purple-400" },
  cancelled: { label: "취소", color: "bg-red-500/20 text-red-400" },
};

const PARTNER_TYPES = [
  { value: "exchange", label: "거래소", labelEn: "Exchange" },
  { value: "vc", label: "벤처캐피탈", labelEn: "Venture Capital" },
  { value: "fund", label: "펀드", labelEn: "Fund" },
  { value: "market_maker", label: "마켓메이커", labelEn: "Market Maker" },
  { value: "infrastructure", label: "인프라", labelEn: "Infrastructure" },
  { value: "ecosystem", label: "에코시스템", labelEn: "Ecosystem" },
  { value: "media", label: "미디어", labelEn: "Media" },
  { value: "research", label: "리서치", labelEn: "Research" },
  { value: "advisor", label: "어드바이저", labelEn: "Advisor" },
  { value: "incubator", label: "인큐베이터", labelEn: "Incubator" },
];

const CONTRACT_TYPES = [
  { value: "token_allocation", label: "토큰배분", labelEn: "Token Allocation" },
  { value: "liquidity_provision", label: "유동성공급", labelEn: "Liquidity Provision" },
  { value: "market_making", label: "마켓메이킹", labelEn: "Market Making" },
  { value: "co_marketing", label: "공동마케팅", labelEn: "Co-Marketing" },
  { value: "technical_integration", label: "기술통합", labelEn: "Technical Integration" },
  { value: "advisory", label: "자문", labelEn: "Advisory" },
  { value: "investment", label: "투자", labelEn: "Investment" },
  { value: "listing", label: "상장", labelEn: "Listing" },
];

const VESTING_TYPES = [
  { value: "immediate", label: "즉시지급" },
  { value: "cliff_linear", label: "클리프+선형" },
  { value: "cliff_monthly", label: "클리프+월별" },
  { value: "milestone_based", label: "마일스톤기반" },
  { value: "performance_based", label: "성과기반" },
];

const TIER_LABELS: Record<string, string> = {
  standard: "스탠다드",
  premium: "프리미엄",
  strategic: "전략적",
  founding: "파운딩",
};

export default function AdminStrategicPartner() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddPayoutOpen, setIsAddPayoutOpen] = useState(false);
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<StrategicPartner | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    partnerType: "ecosystem",
    contractType: "token_allocation",
    website: "",
    contactEmail: "",
    contactPerson: "",
    walletAddress: "",
    allocation: "1000000000000000000000000",
    vestingType: "cliff_linear",
    cliffMonths: 6,
    vestingMonths: 24,
    tgePercentage: 10,
    tier: "standard",
    vestingStartDate: "",
    vestingEndDate: "",
    contractSignedDate: "",
    partnerSince: "",
    notes: "",
  });

  const [payoutForm, setPayoutForm] = useState({
    amount: "100000000000000000000000",
    payoutType: "vesting",
    scheduledDate: "",
    notes: "",
  });

  const [milestoneForm, setMilestoneForm] = useState({
    title: "",
    description: "",
    targetDate: "",
    rewardAmount: "50000000000000000000000",
  });

  const { data: partnersData, isLoading, refetch } = useQuery<{ success: boolean; data: { partners: StrategicPartner[]; stats: any } }>({
    queryKey: ['/api/admin/token-programs/strategic/partners'],
  });

  const { data: partnerDetailData, isLoading: detailLoading } = useQuery<{ success: boolean; data: { partner: StrategicPartner; payouts: StrategicPartnerPayout[]; milestones: StrategicPartnerMilestone[] } }>({
    queryKey: ['/api/admin/token-programs/strategic/partners', selectedPartner?.id],
    enabled: !!selectedPartner && isDetailOpen,
  });

  const createPartnerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('POST', '/api/admin/token-programs/strategic/partners', {
        ...data,
        status: "pending",
        distributedAmount: "0",
        lockedAmount: data.allocation,
      });
    },
    onSuccess: () => {
      toast({ title: "파트너 등록 완료", description: "새 전략 파트너가 등록되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/strategic/partners'] });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "오류", description: "파트너 등록에 실패했습니다.", variant: "destructive" });
    }
  });

  const updatePartnerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<StrategicPartner> }) => {
      return apiRequest('PATCH', `/api/admin/token-programs/strategic/partners/${id}`, data);
    },
    onSuccess: () => {
      toast({ title: "파트너 수정 완료", description: "파트너 정보가 수정되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/strategic/partners'] });
      setIsEditOpen(false);
      setSelectedPartner(null);
    },
    onError: () => {
      toast({ title: "오류", description: "파트너 수정에 실패했습니다.", variant: "destructive" });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest('PATCH', `/api/admin/token-programs/strategic/partners/${id}`, { status });
    },
    onSuccess: () => {
      toast({ title: "상태 변경 완료", description: "파트너 상태가 변경되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/strategic/partners'] });
      if (selectedPartner) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/strategic/partners', selectedPartner.id] });
      }
    },
  });

  const addPayoutMutation = useMutation({
    mutationFn: async ({ partnerId, data }: { partnerId: string; data: typeof payoutForm }) => {
      return apiRequest('POST', `/api/admin/token-programs/strategic/partners/${partnerId}/payouts`, {
        ...data,
        status: "pending",
      });
    },
    onSuccess: () => {
      toast({ title: "지급 등록 완료", description: "새 지급 일정이 등록되었습니다." });
      if (selectedPartner) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/strategic/partners', selectedPartner.id] });
      }
      setIsAddPayoutOpen(false);
      setPayoutForm({ amount: "100000000000000000000000", payoutType: "vesting", scheduledDate: "", notes: "" });
    },
    onError: () => {
      toast({ title: "오류", description: "지급 등록에 실패했습니다.", variant: "destructive" });
    }
  });

  const updatePayoutMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest('PATCH', `/api/admin/token-programs/strategic/payouts/${id}`, { 
        status,
        ...(status === 'completed' ? { processedDate: new Date().toISOString() } : {}),
      });
    },
    onSuccess: () => {
      toast({ title: "지급 상태 변경", description: "지급 상태가 변경되었습니다." });
      if (selectedPartner) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/strategic/partners', selectedPartner.id] });
      }
    },
  });

  const addMilestoneMutation = useMutation({
    mutationFn: async ({ partnerId, data }: { partnerId: string; data: typeof milestoneForm }) => {
      return apiRequest('POST', `/api/admin/token-programs/strategic/partners/${partnerId}/milestones`, {
        ...data,
        status: "pending",
      });
    },
    onSuccess: () => {
      toast({ title: "마일스톤 등록 완료", description: "새 마일스톤이 등록되었습니다." });
      if (selectedPartner) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/strategic/partners', selectedPartner.id] });
      }
      setIsAddMilestoneOpen(false);
      setMilestoneForm({ title: "", description: "", targetDate: "", rewardAmount: "50000000000000000000000" });
    },
    onError: () => {
      toast({ title: "오류", description: "마일스톤 등록에 실패했습니다.", variant: "destructive" });
    }
  });

  const updateMilestoneMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest('PATCH', `/api/admin/token-programs/strategic/milestones/${id}`, { 
        status,
        ...(status === 'completed' ? { completedDate: new Date().toISOString() } : {}),
        ...(status === 'verified' ? { verifiedBy: 'admin' } : {}),
      });
    },
    onSuccess: () => {
      toast({ title: "마일스톤 상태 변경", description: "마일스톤 상태가 변경되었습니다." });
      if (selectedPartner) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/strategic/partners', selectedPartner.id] });
      }
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      partnerType: "ecosystem",
      contractType: "token_allocation",
      website: "",
      contactEmail: "",
      contactPerson: "",
      walletAddress: "",
      allocation: "1000000000000000000000000",
      vestingType: "cliff_linear",
      cliffMonths: 6,
      vestingMonths: 24,
      tgePercentage: 10,
      tier: "standard",
      vestingStartDate: "",
      vestingEndDate: "",
      contractSignedDate: "",
      partnerSince: "",
      notes: "",
    });
  };

  const openEditDialog = (partner: StrategicPartner) => {
    setSelectedPartner(partner);
    setFormData({
      name: partner.name,
      description: partner.description || "",
      partnerType: partner.partnerType,
      contractType: partner.contractType,
      website: partner.website || "",
      contactEmail: partner.contactEmail || "",
      contactPerson: partner.contactPerson || "",
      walletAddress: partner.walletAddress || "",
      allocation: partner.allocation,
      vestingType: partner.vestingType,
      cliffMonths: partner.cliffMonths,
      vestingMonths: partner.vestingMonths,
      tgePercentage: partner.tgePercentage,
      tier: partner.tier,
      vestingStartDate: partner.vestingStartDate ? new Date(partner.vestingStartDate).toISOString().slice(0, 10) : "",
      vestingEndDate: partner.vestingEndDate ? new Date(partner.vestingEndDate).toISOString().slice(0, 10) : "",
      contractSignedDate: partner.contractSignedDate ? new Date(partner.contractSignedDate).toISOString().slice(0, 10) : "",
      partnerSince: partner.partnerSince ? new Date(partner.partnerSince).toISOString().slice(0, 10) : "",
      notes: partner.notes || "",
    });
    setIsEditOpen(true);
  };

  const openDetailDialog = (partner: StrategicPartner) => {
    setSelectedPartner(partner);
    setIsDetailOpen(true);
  };

  const stats = partnersData?.data?.stats || { totalPartners: 0, activeContracts: 0, totalAllocation: "0", lockedAmount: "0" };
  const partnerList = Array.isArray(partnersData?.data?.partners) ? partnersData.data.partners : [];
  const payouts = partnerDetailData?.data?.payouts || [];
  const milestones = partnerDetailData?.data?.milestones || [];

  const filteredPartners = partnerList.filter(partner => {
    const matchesSearch = searchQuery === "" || 
      partner.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || partner.status === statusFilter;
    const matchesType = typeFilter === "all" || partner.partnerType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

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
          <p className="text-muted-foreground">Strategic Partner Program Management - 1월 3일 정식 오픈</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh">
          <RefreshCw className="mr-2 h-4 w-4" />
          새로고침
        </Button>
        <Button onClick={() => { resetForm(); setIsCreateOpen(true); }} data-testid="button-add-partner">
          <Plus className="mr-2 h-4 w-4" />
          새 파트너
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total-partners">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">전략 파트너</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPartners}</div>
            <p className="text-xs text-muted-foreground">Strategic Partners</p>
          </CardContent>
        </Card>
        <Card data-testid="card-active-contracts">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">활성 계약</CardTitle>
            <Shield className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeContracts}</div>
            <p className="text-xs text-muted-foreground">Active Contracts</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-allocation">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">총 배분량</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTBURN(stats.totalAllocation)} TBURN</div>
            <p className="text-xs text-muted-foreground">Total Allocation</p>
          </CardContent>
        </Card>
        <Card data-testid="card-locked-amount">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">잠금 토큰</CardTitle>
            <Lock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTBURN(stats.lockedAmount)} TBURN</div>
            <p className="text-xs text-muted-foreground">Locked Tokens</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>전략 파트너 목록</CardTitle>
              <CardDescription>Strategic Partners List - 파트너 관리</CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-28" data-testid="select-status-filter">
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="pending">대기</SelectItem>
                  <SelectItem value="active">활성</SelectItem>
                  <SelectItem value="paused">일시중지</SelectItem>
                  <SelectItem value="completed">완료</SelectItem>
                  <SelectItem value="terminated">종료</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32" data-testid="select-type-filter">
                  <SelectValue placeholder="유형" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {PARTNER_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="파트너 검색..."
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
          ) : filteredPartners.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>전략 파트너 데이터가 없습니다</p>
              <p className="text-sm">No strategic partners found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>파트너명</TableHead>
                  <TableHead>유형</TableHead>
                  <TableHead>계약 유형</TableHead>
                  <TableHead className="text-right">배분량</TableHead>
                  <TableHead>베스팅</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPartners.map((partner) => (
                  <TableRow key={partner.id} data-testid={`row-partner-${partner.id}`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div>{partner.name}</div>
                          <div className="text-xs text-muted-foreground">{TIER_LABELS[partner.tier] || partner.tier}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {PARTNER_TYPES.find(t => t.value === partner.partnerType)?.label || partner.partnerType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-blue-500/20 text-blue-400">
                        {CONTRACT_TYPES.find(c => c.value === partner.contractType)?.label || partner.contractType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatTBURN(partner.allocation)} TBURN</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{VESTING_TYPES.find(v => v.value === partner.vestingType)?.label}</div>
                        <div className="text-xs text-muted-foreground">클리프 {partner.cliffMonths}개월 / {partner.vestingMonths}개월</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={partner.status} 
                        onValueChange={(v) => updateStatusMutation.mutate({ id: partner.id, status: v })}
                      >
                        <SelectTrigger className="w-28 h-8" data-testid={`select-status-${partner.id}`}>
                          <Badge className={STATUS_LABELS[partner.status]?.color || 'bg-gray-500/20'}>
                            {STATUS_LABELS[partner.status]?.label || partner.status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">대기</SelectItem>
                          <SelectItem value="active">활성</SelectItem>
                          <SelectItem value="paused">일시중지</SelectItem>
                          <SelectItem value="completed">완료</SelectItem>
                          <SelectItem value="terminated">종료</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openDetailDialog(partner)} data-testid={`button-detail-${partner.id}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(partner)} data-testid={`button-edit-${partner.id}`}>
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
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>새 전략 파트너</DialogTitle>
            <DialogDescription>새로운 전략 파트너를 등록합니다.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">파트너명 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="파트너 이름"
                  data-testid="input-partner-name"
                />
              </div>
              <div className="grid gap-2">
                <Label>티어</Label>
                <Select value={formData.tier} onValueChange={(v) => setFormData({ ...formData, tier: v })}>
                  <SelectTrigger data-testid="select-tier">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">스탠다드</SelectItem>
                    <SelectItem value="premium">프리미엄</SelectItem>
                    <SelectItem value="strategic">전략적</SelectItem>
                    <SelectItem value="founding">파운딩</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>파트너 유형</Label>
                <Select value={formData.partnerType} onValueChange={(v) => setFormData({ ...formData, partnerType: v })}>
                  <SelectTrigger data-testid="select-partner-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PARTNER_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label} ({type.labelEn})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>계약 유형</Label>
                <Select value={formData.contractType} onValueChange={(v) => setFormData({ ...formData, contractType: v })}>
                  <SelectTrigger data-testid="select-contract-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTRACT_TYPES.map(ct => (
                      <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="파트너 설명..."
                rows={2}
                data-testid="input-description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="website">웹사이트</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://"
                  data-testid="input-website"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="walletAddress">지갑 주소</Label>
                <Input
                  id="walletAddress"
                  value={formData.walletAddress}
                  onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                  placeholder="0x... 또는 tb1..."
                  data-testid="input-wallet-address"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contactPerson">담당자</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="담당자 이름"
                  data-testid="input-contact-person"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactEmail">이메일</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="contact@example.com"
                  data-testid="input-contact-email"
                />
              </div>
            </div>
            <div className="border-t pt-4">
              <h4 className="font-medium mb-4 flex items-center gap-2"><Coins className="h-4 w-4" /> 토큰 배분</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="allocation">배분량 (wei)</Label>
                  <Input
                    id="allocation"
                    value={formData.allocation}
                    onChange={(e) => setFormData({ ...formData, allocation: e.target.value })}
                    data-testid="input-allocation"
                  />
                  <p className="text-xs text-muted-foreground">≈ {formatTBURN(formData.allocation)} TBURN</p>
                </div>
                <div className="grid gap-2">
                  <Label>베스팅 유형</Label>
                  <Select value={formData.vestingType} onValueChange={(v) => setFormData({ ...formData, vestingType: v })}>
                    <SelectTrigger data-testid="select-vesting-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VESTING_TYPES.map(vt => (
                        <SelectItem key={vt.value} value={vt.value}>{vt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="grid gap-2">
                  <Label htmlFor="cliffMonths">클리프 (개월)</Label>
                  <Input
                    id="cliffMonths"
                    type="number"
                    value={formData.cliffMonths}
                    onChange={(e) => setFormData({ ...formData, cliffMonths: parseInt(e.target.value) || 0 })}
                    data-testid="input-cliff-months"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="vestingMonths">베스팅 기간 (개월)</Label>
                  <Input
                    id="vestingMonths"
                    type="number"
                    value={formData.vestingMonths}
                    onChange={(e) => setFormData({ ...formData, vestingMonths: parseInt(e.target.value) || 0 })}
                    data-testid="input-vesting-months"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tgePercentage">TGE 비율 (%)</Label>
                  <Input
                    id="tgePercentage"
                    type="number"
                    value={formData.tgePercentage}
                    onChange={(e) => setFormData({ ...formData, tgePercentage: parseInt(e.target.value) || 0 })}
                    data-testid="input-tge-percentage"
                  />
                </div>
              </div>
            </div>
            <div className="border-t pt-4">
              <h4 className="font-medium mb-4 flex items-center gap-2"><Calendar className="h-4 w-4" /> 일정</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>계약 체결일</Label>
                  <Input
                    type="date"
                    value={formData.contractSignedDate}
                    onChange={(e) => setFormData({ ...formData, contractSignedDate: e.target.value })}
                    data-testid="input-contract-signed-date"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>파트너 시작일</Label>
                  <Input
                    type="date"
                    value={formData.partnerSince}
                    onChange={(e) => setFormData({ ...formData, partnerSince: e.target.value })}
                    data-testid="input-partner-since"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="grid gap-2">
                  <Label>베스팅 시작일</Label>
                  <Input
                    type="date"
                    value={formData.vestingStartDate}
                    onChange={(e) => setFormData({ ...formData, vestingStartDate: e.target.value })}
                    data-testid="input-vesting-start-date"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>베스팅 종료일</Label>
                  <Input
                    type="date"
                    value={formData.vestingEndDate}
                    onChange={(e) => setFormData({ ...formData, vestingEndDate: e.target.value })}
                    data-testid="input-vesting-end-date"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} data-testid="button-cancel-create">
              취소
            </Button>
            <Button 
              onClick={() => createPartnerMutation.mutate(formData)}
              disabled={!formData.name || createPartnerMutation.isPending}
              data-testid="button-submit-create"
            >
              {createPartnerMutation.isPending ? "등록 중..." : "등록"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>파트너 수정</DialogTitle>
            <DialogDescription>"{selectedPartner?.name}" 정보를 수정합니다.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>파트너명</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="input-edit-partner-name"
                />
              </div>
              <div className="grid gap-2">
                <Label>티어</Label>
                <Select value={formData.tier} onValueChange={(v) => setFormData({ ...formData, tier: v })}>
                  <SelectTrigger data-testid="select-edit-tier">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">스탠다드</SelectItem>
                    <SelectItem value="premium">프리미엄</SelectItem>
                    <SelectItem value="strategic">전략적</SelectItem>
                    <SelectItem value="founding">파운딩</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>배분량 (wei)</Label>
                <Input
                  value={formData.allocation}
                  onChange={(e) => setFormData({ ...formData, allocation: e.target.value })}
                  data-testid="input-edit-allocation"
                />
                <p className="text-xs text-muted-foreground">≈ {formatTBURN(formData.allocation)} TBURN</p>
              </div>
              <div className="grid gap-2">
                <Label>TGE 비율 (%)</Label>
                <Input
                  type="number"
                  value={formData.tgePercentage}
                  onChange={(e) => setFormData({ ...formData, tgePercentage: parseInt(e.target.value) || 0 })}
                  data-testid="input-edit-tge-percentage"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>지갑 주소</Label>
              <Input
                value={formData.walletAddress}
                onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                placeholder="0x... 또는 tb1..."
                data-testid="input-edit-wallet-address"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} data-testid="button-cancel-edit">
              취소
            </Button>
            <Button 
              onClick={() => selectedPartner && updatePartnerMutation.mutate({ id: selectedPartner.id, data: formData })}
              disabled={updatePartnerMutation.isPending}
              data-testid="button-submit-edit"
            >
              {updatePartnerMutation.isPending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {selectedPartner?.name}
                </DialogTitle>
                <DialogDescription>파트너 상세 정보 및 지급/마일스톤 관리</DialogDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">{TIER_LABELS[selectedPartner?.tier || ''] || selectedPartner?.tier}</Badge>
                <Badge className="bg-blue-500/20 text-blue-400">
                  {PARTNER_TYPES.find(t => t.value === selectedPartner?.partnerType)?.label}
                </Badge>
                <Badge className={STATUS_LABELS[selectedPartner?.status || '']?.color || 'bg-gray-500/20'}>
                  {STATUS_LABELS[selectedPartner?.status || '']?.label || selectedPartner?.status}
                </Badge>
              </div>
            </div>
          </DialogHeader>
          
          {selectedPartner && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <Coins className="h-6 w-6 mx-auto text-emerald-500 mb-2" />
                      <div className="text-xl font-bold">{formatTBURN(selectedPartner.allocation)}</div>
                      <div className="text-xs text-muted-foreground">배분량 (TBURN)</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <TrendingUp className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                      <div className="text-xl font-bold">{formatTBURN(selectedPartner.distributedAmount)}</div>
                      <div className="text-xs text-muted-foreground">지급 완료</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <Lock className="h-6 w-6 mx-auto text-amber-500 mb-2" />
                      <div className="text-xl font-bold">{formatTBURN(selectedPartner.lockedAmount)}</div>
                      <div className="text-xs text-muted-foreground">잠금 중</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <Target className="h-6 w-6 mx-auto text-purple-500 mb-2" />
                      <div className="text-xl font-bold">{selectedPartner.tgePercentage}%</div>
                      <div className="text-xs text-muted-foreground">TGE 비율</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">계약 유형:</span>
                  <p className="font-medium">{CONTRACT_TYPES.find(c => c.value === selectedPartner.contractType)?.label}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">베스팅:</span>
                  <p>{VESTING_TYPES.find(v => v.value === selectedPartner.vestingType)?.label} (클리프 {selectedPartner.cliffMonths}개월 / {selectedPartner.vestingMonths}개월)</p>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">베스팅 기간:</span>
                  <p>
                    {selectedPartner.vestingStartDate ? new Date(selectedPartner.vestingStartDate).toLocaleDateString('ko-KR') : '-'} ~ {selectedPartner.vestingEndDate ? new Date(selectedPartner.vestingEndDate).toLocaleDateString('ko-KR') : '-'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">지갑 주소:</span>
                  <p className="font-mono text-xs">{selectedPartner.walletAddress || '-'}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2"><Coins className="h-4 w-4" /> 지급 내역</h3>
                  <Button size="sm" onClick={() => setIsAddPayoutOpen(true)} data-testid="button-add-payout">
                    <Plus className="mr-2 h-4 w-4" />
                    지급 등록
                  </Button>
                </div>
                
                {detailLoading ? (
                  <div className="space-y-2">
                    {[1, 2].map(i => <Skeleton key={i} className="h-12" />)}
                  </div>
                ) : payouts.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Coins className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>지급 내역이 없습니다</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payouts.slice(0, 5).map((payout) => (
                      <Card key={payout.id} data-testid={`card-payout-${payout.id}`}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">{payout.payoutType}</Badge>
                                <span className="font-medium">{formatTBURN(payout.amount)} TBURN</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {payout.scheduledDate && `예정일: ${new Date(payout.scheduledDate).toLocaleDateString('ko-KR')}`}
                                {payout.processedDate && ` | 처리일: ${new Date(payout.processedDate).toLocaleDateString('ko-KR')}`}
                              </div>
                            </div>
                            <Select 
                              value={payout.status} 
                              onValueChange={(v) => updatePayoutMutation.mutate({ id: payout.id, status: v })}
                            >
                              <SelectTrigger className="w-28 h-8" data-testid={`select-payout-status-${payout.id}`}>
                                <Badge className={PAYOUT_STATUS[payout.status]?.color || 'bg-gray-500/20'}>
                                  {PAYOUT_STATUS[payout.status]?.label || payout.status}
                                </Badge>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">대기</SelectItem>
                                <SelectItem value="scheduled">예정</SelectItem>
                                <SelectItem value="processing">처리중</SelectItem>
                                <SelectItem value="completed">완료</SelectItem>
                                <SelectItem value="failed">실패</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2"><Target className="h-4 w-4" /> 마일스톤</h3>
                  <Button size="sm" onClick={() => setIsAddMilestoneOpen(true)} data-testid="button-add-milestone">
                    <Plus className="mr-2 h-4 w-4" />
                    마일스톤 추가
                  </Button>
                </div>
                
                {milestones.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>마일스톤이 없습니다</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {milestones.slice(0, 5).map((milestone) => (
                      <Card key={milestone.id} data-testid={`card-milestone-${milestone.id}`}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{milestone.title}</span>
                                <span className="text-sm text-muted-foreground">({formatTBURN(milestone.rewardAmount)} TBURN)</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {milestone.targetDate && `목표일: ${new Date(milestone.targetDate).toLocaleDateString('ko-KR')}`}
                                {milestone.completedDate && ` | 완료일: ${new Date(milestone.completedDate).toLocaleDateString('ko-KR')}`}
                              </div>
                              {milestone.description && <p className="text-sm mt-1">{milestone.description}</p>}
                            </div>
                            <Select 
                              value={milestone.status} 
                              onValueChange={(v) => updateMilestoneMutation.mutate({ id: milestone.id, status: v })}
                            >
                              <SelectTrigger className="w-28 h-8" data-testid={`select-milestone-status-${milestone.id}`}>
                                <Badge className={MILESTONE_STATUS[milestone.status]?.color || 'bg-gray-500/20'}>
                                  {MILESTONE_STATUS[milestone.status]?.label || milestone.status}
                                </Badge>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">대기</SelectItem>
                                <SelectItem value="in_progress">진행중</SelectItem>
                                <SelectItem value="completed">완료</SelectItem>
                                <SelectItem value="verified">검증됨</SelectItem>
                                <SelectItem value="cancelled">취소</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)} data-testid="button-close-detail">
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddPayoutOpen} onOpenChange={setIsAddPayoutOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>지급 등록</DialogTitle>
            <DialogDescription>"{selectedPartner?.name}" 파트너에게 새 지급을 등록합니다</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="payoutAmount">지급 금액 (wei)</Label>
              <Input
                id="payoutAmount"
                value={payoutForm.amount}
                onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
                data-testid="input-payout-amount"
              />
              <p className="text-xs text-muted-foreground">≈ {formatTBURN(payoutForm.amount)} TBURN</p>
            </div>
            <div className="grid gap-2">
              <Label>지급 유형</Label>
              <Select value={payoutForm.payoutType} onValueChange={(v) => setPayoutForm({ ...payoutForm, payoutType: v })}>
                <SelectTrigger data-testid="select-payout-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vesting">베스팅</SelectItem>
                  <SelectItem value="tge">TGE</SelectItem>
                  <SelectItem value="milestone">마일스톤</SelectItem>
                  <SelectItem value="bonus">보너스</SelectItem>
                  <SelectItem value="other">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>예정일</Label>
              <Input
                type="date"
                value={payoutForm.scheduledDate}
                onChange={(e) => setPayoutForm({ ...payoutForm, scheduledDate: e.target.value })}
                data-testid="input-payout-scheduled-date"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="payoutNotes">메모</Label>
              <Input
                id="payoutNotes"
                value={payoutForm.notes}
                onChange={(e) => setPayoutForm({ ...payoutForm, notes: e.target.value })}
                placeholder="지급 관련 메모..."
                data-testid="input-payout-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPayoutOpen(false)} data-testid="button-cancel-payout">
              취소
            </Button>
            <Button 
              onClick={() => selectedPartner && addPayoutMutation.mutate({ 
                partnerId: selectedPartner.id, 
                data: payoutForm 
              })}
              disabled={!payoutForm.amount || addPayoutMutation.isPending}
              data-testid="button-submit-payout"
            >
              {addPayoutMutation.isPending ? "등록 중..." : "지급 등록"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddMilestoneOpen} onOpenChange={setIsAddMilestoneOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>마일스톤 추가</DialogTitle>
            <DialogDescription>"{selectedPartner?.name}" 파트너의 새 마일스톤을 추가합니다</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="milestoneTitle">마일스톤 제목 *</Label>
              <Input
                id="milestoneTitle"
                value={milestoneForm.title}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                placeholder="마일스톤 제목"
                data-testid="input-milestone-title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="milestoneDescription">설명</Label>
              <Textarea
                id="milestoneDescription"
                value={milestoneForm.description}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                placeholder="마일스톤 설명..."
                rows={2}
                data-testid="input-milestone-description"
              />
            </div>
            <div className="grid gap-2">
              <Label>목표일</Label>
              <Input
                type="date"
                value={milestoneForm.targetDate}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, targetDate: e.target.value })}
                data-testid="input-milestone-target-date"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="milestoneReward">보상 금액 (wei)</Label>
              <Input
                id="milestoneReward"
                value={milestoneForm.rewardAmount}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, rewardAmount: e.target.value })}
                data-testid="input-milestone-reward"
              />
              <p className="text-xs text-muted-foreground">≈ {formatTBURN(milestoneForm.rewardAmount)} TBURN</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMilestoneOpen(false)} data-testid="button-cancel-milestone">
              취소
            </Button>
            <Button 
              onClick={() => selectedPartner && addMilestoneMutation.mutate({ 
                partnerId: selectedPartner.id, 
                data: milestoneForm 
              })}
              disabled={!milestoneForm.title || addMilestoneMutation.isPending}
              data-testid="button-submit-milestone"
            >
              {addMilestoneMutation.isPending ? "추가 중..." : "마일스톤 추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
