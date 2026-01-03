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
import { Handshake, Building2, Coins, TrendingUp, Search, RefreshCw, ArrowLeft, Plus, Eye, Edit, Calendar, Award, Globe, Mail } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Partnership {
  id: string;
  partnerName: string;
  partnerType: string;
  tier: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  website: string | null;
  allocatedAmount: string;
  vestingSchedule: string | null;
  vestingDuration: number | null;
  distributedAmount: string;
  agreementStartDate: string | null;
  agreementEndDate: string | null;
  contractUrl: string | null;
  totalVolume: string;
  totalTransactions: number;
  status: string;
  notes: string | null;
  createdBy: string | null;
  approvedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PartnershipPayout {
  id: string;
  partnershipId: string;
  amount: string;
  paymentType: string;
  description: string | null;
  status: string;
  txHash: string | null;
  paidAt: string | null;
  approvedBy: string | null;
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
  draft: { label: "초안", color: "bg-gray-500/20 text-gray-400" },
  pending: { label: "대기", color: "bg-yellow-500/20 text-yellow-400" },
  active: { label: "활성", color: "bg-emerald-500/20 text-emerald-400" },
  suspended: { label: "중단", color: "bg-orange-500/20 text-orange-400" },
  expired: { label: "만료", color: "bg-red-500/20 text-red-400" },
  terminated: { label: "종료", color: "bg-red-600/20 text-red-500" },
};

const PAYOUT_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: "대기", color: "bg-yellow-500/20 text-yellow-400" },
  approved: { label: "승인됨", color: "bg-blue-500/20 text-blue-400" },
  processing: { label: "처리중", color: "bg-purple-500/20 text-purple-400" },
  completed: { label: "완료", color: "bg-emerald-500/20 text-emerald-400" },
  failed: { label: "실패", color: "bg-red-500/20 text-red-400" },
};

const PARTNER_TYPES = [
  { value: "exchange", label: "거래소", labelEn: "Exchange" },
  { value: "wallet", label: "지갑", labelEn: "Wallet" },
  { value: "dapp", label: "dApp", labelEn: "dApp" },
  { value: "infrastructure", label: "인프라", labelEn: "Infrastructure" },
  { value: "marketing", label: "마케팅", labelEn: "Marketing" },
  { value: "strategic", label: "전략적", labelEn: "Strategic" },
  { value: "validator", label: "검증자", labelEn: "Validator" },
  { value: "ambassador", label: "앰배서더", labelEn: "Ambassador" },
];

const PARTNER_TIERS = [
  { value: "bronze", label: "브론즈", color: "bg-amber-600/20 text-amber-500" },
  { value: "silver", label: "실버", color: "bg-gray-400/20 text-gray-300" },
  { value: "gold", label: "골드", color: "bg-yellow-500/20 text-yellow-400" },
  { value: "platinum", label: "플래티넘", color: "bg-cyan-400/20 text-cyan-300" },
  { value: "diamond", label: "다이아몬드", color: "bg-purple-400/20 text-purple-300" },
];

export default function AdminPartnershipProgram() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddPayoutOpen, setIsAddPayoutOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partnership | null>(null);
  
  const [formData, setFormData] = useState({
    partnerName: "",
    partnerType: "exchange",
    tier: "bronze",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    website: "",
    allocatedAmount: "100000000000000000000000",
    vestingSchedule: "linear",
    vestingDuration: 12,
    agreementStartDate: "",
    agreementEndDate: "",
    contractUrl: "",
    notes: "",
  });

  const [payoutFormData, setPayoutFormData] = useState({
    amount: "10000000000000000000000",
    paymentType: "scheduled",
    description: "",
  });

  const { data: partnersData, isLoading, refetch } = useQuery<{ success: boolean; data: { partners: Partnership[]; stats: any } }>({
    queryKey: ['/api/admin/token-programs/partnerships'],
  });

  const { data: partnerDetailData, isLoading: detailLoading } = useQuery<{ success: boolean; data: { partner: Partnership; payouts: PartnershipPayout[] } }>({
    queryKey: ['/api/admin/token-programs/partnerships', selectedPartner?.id],
    enabled: !!selectedPartner && isDetailOpen,
  });

  const createPartnerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('POST', '/api/admin/token-programs/partnerships', {
        ...data,
        status: "pending",
        distributedAmount: "0",
        totalVolume: "0",
        totalTransactions: 0,
      });
    },
    onSuccess: () => {
      toast({ title: "파트너 생성 완료", description: "새 파트너십이 등록되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/partnerships'] });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "오류", description: "파트너 생성에 실패했습니다.", variant: "destructive" });
    }
  });

  const updatePartnerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Partnership> }) => {
      return apiRequest('PATCH', `/api/admin/token-programs/partnerships/${id}`, data);
    },
    onSuccess: () => {
      toast({ title: "파트너 수정 완료", description: "파트너십 정보가 수정되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/partnerships'] });
      setIsEditOpen(false);
      setSelectedPartner(null);
    },
    onError: () => {
      toast({ title: "오류", description: "파트너 수정에 실패했습니다.", variant: "destructive" });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest('PATCH', `/api/admin/token-programs/partnerships/${id}`, { 
        status,
        ...(status === 'active' ? { approvedBy: 'admin' } : {})
      });
    },
    onSuccess: () => {
      toast({ title: "상태 변경 완료", description: "파트너십 상태가 변경되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/partnerships'] });
      if (selectedPartner) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/partnerships', selectedPartner.id] });
      }
    },
  });

  const createPayoutMutation = useMutation({
    mutationFn: async ({ partnerId, data }: { partnerId: string; data: typeof payoutFormData }) => {
      return apiRequest('POST', `/api/admin/token-programs/partnerships/${partnerId}/payouts`, {
        ...data,
        status: "pending",
      });
    },
    onSuccess: () => {
      toast({ title: "지급 생성 완료", description: "새 지급이 등록되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/partnerships'] });
      if (selectedPartner) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/partnerships', selectedPartner.id] });
      }
      setIsAddPayoutOpen(false);
      setPayoutFormData({ amount: "10000000000000000000000", paymentType: "scheduled", description: "" });
    },
    onError: () => {
      toast({ title: "오류", description: "지급 생성에 실패했습니다.", variant: "destructive" });
    }
  });

  const updatePayoutMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest('PATCH', `/api/admin/token-programs/partnerships/payouts/${id}`, { 
        status,
        ...(status === 'completed' ? { paidAt: new Date().toISOString(), approvedBy: 'admin' } : {}),
        ...(status === 'approved' ? { approvedBy: 'admin' } : {})
      });
    },
    onSuccess: () => {
      toast({ title: "지급 상태 변경", description: "지급 상태가 변경되었습니다." });
      if (selectedPartner) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/partnerships', selectedPartner.id] });
      }
    },
  });

  const resetForm = () => {
    setFormData({
      partnerName: "",
      partnerType: "exchange",
      tier: "bronze",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      website: "",
      allocatedAmount: "100000000000000000000000",
      vestingSchedule: "linear",
      vestingDuration: 12,
      agreementStartDate: "",
      agreementEndDate: "",
      contractUrl: "",
      notes: "",
    });
  };

  const openEditDialog = (partner: Partnership) => {
    setSelectedPartner(partner);
    setFormData({
      partnerName: partner.partnerName,
      partnerType: partner.partnerType,
      tier: partner.tier,
      contactName: partner.contactName || "",
      contactEmail: partner.contactEmail || "",
      contactPhone: partner.contactPhone || "",
      website: partner.website || "",
      allocatedAmount: partner.allocatedAmount,
      vestingSchedule: partner.vestingSchedule || "linear",
      vestingDuration: partner.vestingDuration || 12,
      agreementStartDate: partner.agreementStartDate ? new Date(partner.agreementStartDate).toISOString().slice(0, 10) : "",
      agreementEndDate: partner.agreementEndDate ? new Date(partner.agreementEndDate).toISOString().slice(0, 10) : "",
      contractUrl: partner.contractUrl || "",
      notes: partner.notes || "",
    });
    setIsEditOpen(true);
  };

  const openDetailDialog = (partner: Partnership) => {
    setSelectedPartner(partner);
    setIsDetailOpen(true);
  };

  const stats = partnersData?.data?.stats || { totalPartners: 0, activePartners: 0, totalAllocated: "0", totalDistributed: "0" };
  const partnerList = Array.isArray(partnersData?.data?.partners) ? partnersData.data.partners : [];
  const payouts = partnerDetailData?.data?.payouts || [];

  const filteredPartners = partnerList.filter(partner => {
    const matchesSearch = searchQuery === "" || 
      partner.partnerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || partner.status === statusFilter;
    const matchesTier = tierFilter === "all" || partner.tier === tierFilter;
    return matchesSearch && matchesStatus && matchesTier;
  });

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="admin-partnership-program-page">
      <div className="flex items-center gap-4">
        <Link href="/admin/token-distribution">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            파트너십 프로그램 관리
          </h1>
          <p className="text-muted-foreground">Partnership Program Management - 1월 3일 정식 오픈</p>
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
            <CardTitle className="text-sm font-medium">총 파트너</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPartners}</div>
            <p className="text-xs text-muted-foreground">Total Partners</p>
          </CardContent>
        </Card>
        <Card data-testid="card-active-partners">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">활성 파트너</CardTitle>
            <Handshake className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePartners}</div>
            <p className="text-xs text-muted-foreground">Active Partners</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-allocated">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">배분 토큰</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTBURN(stats.totalAllocated)} TBURN</div>
            <p className="text-xs text-muted-foreground">Total Allocated</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-distributed">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">지급 완료</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTBURN(stats.totalDistributed)} TBURN</div>
            <p className="text-xs text-muted-foreground">Total Distributed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>파트너 목록</CardTitle>
              <CardDescription>Partnership List - 전략적 파트너십 관리</CardDescription>
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
                  <SelectItem value="suspended">중단</SelectItem>
                  <SelectItem value="expired">만료</SelectItem>
                  <SelectItem value="terminated">종료</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="w-32" data-testid="select-tier-filter">
                  <SelectValue placeholder="티어" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {PARTNER_TIERS.map(tier => (
                    <SelectItem key={tier.value} value={tier.value}>{tier.label}</SelectItem>
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
              <Handshake className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>파트너십 데이터가 없습니다</p>
              <p className="text-sm">No partnerships found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>파트너명</TableHead>
                  <TableHead>유형</TableHead>
                  <TableHead>티어</TableHead>
                  <TableHead className="text-right">배분량</TableHead>
                  <TableHead className="text-right">지급량</TableHead>
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
                        {partner.partnerName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {PARTNER_TYPES.find(t => t.value === partner.partnerType)?.label || partner.partnerType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={PARTNER_TIERS.find(t => t.value === partner.tier)?.color || 'bg-gray-500/20'}>
                        {PARTNER_TIERS.find(t => t.value === partner.tier)?.label || partner.tier}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatTBURN(partner.allocatedAmount)} TBURN</TableCell>
                    <TableCell className="text-right">{formatTBURN(partner.distributedAmount)} TBURN</TableCell>
                    <TableCell>
                      <Select 
                        value={partner.status} 
                        onValueChange={(v) => updateStatusMutation.mutate({ id: partner.id, status: v })}
                      >
                        <SelectTrigger className="w-24 h-8" data-testid={`select-status-${partner.id}`}>
                          <Badge className={STATUS_LABELS[partner.status]?.color || 'bg-gray-500/20'}>
                            {STATUS_LABELS[partner.status]?.label || partner.status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">대기</SelectItem>
                          <SelectItem value="active">활성</SelectItem>
                          <SelectItem value="suspended">중단</SelectItem>
                          <SelectItem value="expired">만료</SelectItem>
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
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>새 파트너 등록</DialogTitle>
            <DialogDescription>새로운 파트너십을 등록합니다.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="partnerName">파트너명 *</Label>
                <Input
                  id="partnerName"
                  value={formData.partnerName}
                  onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                  placeholder="파트너 회사명"
                  data-testid="input-partner-name"
                />
              </div>
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>티어</Label>
                <Select value={formData.tier} onValueChange={(v) => setFormData({ ...formData, tier: v })}>
                  <SelectTrigger data-testid="select-tier">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PARTNER_TIERS.map(tier => (
                      <SelectItem key={tier.value} value={tier.value}>{tier.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="website">웹사이트</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://..."
                  data-testid="input-website"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contactName">담당자명</Label>
                <Input
                  id="contactName"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  data-testid="input-contact-name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactEmail">이메일</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  data-testid="input-contact-email"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactPhone">연락처</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  data-testid="input-contact-phone"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="allocatedAmount">배분 토큰 (wei)</Label>
              <Input
                id="allocatedAmount"
                value={formData.allocatedAmount}
                onChange={(e) => setFormData({ ...formData, allocatedAmount: e.target.value })}
                data-testid="input-allocated-amount"
              />
              <p className="text-xs text-muted-foreground">≈ {formatTBURN(formData.allocatedAmount)} TBURN</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>베스팅 방식</Label>
                <Select value={formData.vestingSchedule} onValueChange={(v) => setFormData({ ...formData, vestingSchedule: v })}>
                  <SelectTrigger data-testid="select-vesting-schedule">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">즉시 지급</SelectItem>
                    <SelectItem value="cliff">클리프</SelectItem>
                    <SelectItem value="linear">선형 베스팅</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="vestingDuration">베스팅 기간 (개월)</Label>
                <Input
                  id="vestingDuration"
                  type="number"
                  value={formData.vestingDuration}
                  onChange={(e) => setFormData({ ...formData, vestingDuration: parseInt(e.target.value) || 0 })}
                  data-testid="input-vesting-duration"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>계약 시작일</Label>
                <Input
                  type="date"
                  value={formData.agreementStartDate}
                  onChange={(e) => setFormData({ ...formData, agreementStartDate: e.target.value })}
                  data-testid="input-agreement-start"
                />
              </div>
              <div className="grid gap-2">
                <Label>계약 종료일</Label>
                <Input
                  type="date"
                  value={formData.agreementEndDate}
                  onChange={(e) => setFormData({ ...formData, agreementEndDate: e.target.value })}
                  data-testid="input-agreement-end"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">메모</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="파트너십 관련 메모..."
                rows={2}
                data-testid="input-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} data-testid="button-cancel-create">
              취소
            </Button>
            <Button 
              onClick={() => createPartnerMutation.mutate(formData)}
              disabled={!formData.partnerName || createPartnerMutation.isPending}
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
            <DialogDescription>"{selectedPartner?.partnerName}" 정보를 수정합니다.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>파트너명</Label>
                <Input
                  value={formData.partnerName}
                  onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                  data-testid="input-edit-partner-name"
                />
              </div>
              <div className="grid gap-2">
                <Label>파트너 유형</Label>
                <Select value={formData.partnerType} onValueChange={(v) => setFormData({ ...formData, partnerType: v })}>
                  <SelectTrigger data-testid="select-edit-partner-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PARTNER_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>티어</Label>
                <Select value={formData.tier} onValueChange={(v) => setFormData({ ...formData, tier: v })}>
                  <SelectTrigger data-testid="select-edit-tier">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PARTNER_TIERS.map(tier => (
                      <SelectItem key={tier.value} value={tier.value}>{tier.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>배분 토큰 (wei)</Label>
                <Input
                  value={formData.allocatedAmount}
                  onChange={(e) => setFormData({ ...formData, allocatedAmount: e.target.value })}
                  data-testid="input-edit-allocated-amount"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>담당자명</Label>
                <Input
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  data-testid="input-edit-contact-name"
                />
              </div>
              <div className="grid gap-2">
                <Label>이메일</Label>
                <Input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  data-testid="input-edit-contact-email"
                />
              </div>
              <div className="grid gap-2">
                <Label>연락처</Label>
                <Input
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  data-testid="input-edit-contact-phone"
                />
              </div>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {selectedPartner?.partnerName}
                </DialogTitle>
                <DialogDescription>파트너십 상세 정보 및 지급 관리</DialogDescription>
              </div>
              <div className="flex gap-2">
                <Badge className={PARTNER_TIERS.find(t => t.value === selectedPartner?.tier)?.color || 'bg-gray-500/20'}>
                  {PARTNER_TIERS.find(t => t.value === selectedPartner?.tier)?.label || selectedPartner?.tier}
                </Badge>
                <Badge className={STATUS_LABELS[selectedPartner?.status || '']?.color || 'bg-gray-500/20'}>
                  {STATUS_LABELS[selectedPartner?.status || '']?.label || selectedPartner?.status}
                </Badge>
              </div>
            </div>
          </DialogHeader>
          
          {selectedPartner && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <Coins className="h-6 w-6 mx-auto text-emerald-500 mb-2" />
                      <div className="text-xl font-bold">{formatTBURN(selectedPartner.allocatedAmount)}</div>
                      <div className="text-xs text-muted-foreground">배분량 (TBURN)</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <TrendingUp className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                      <div className="text-xl font-bold">{formatTBURN(selectedPartner.distributedAmount)}</div>
                      <div className="text-xs text-muted-foreground">지급량 (TBURN)</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <Award className="h-6 w-6 mx-auto text-purple-500 mb-2" />
                      <div className="text-xl font-bold">{selectedPartner.vestingDuration}개월</div>
                      <div className="text-xs text-muted-foreground">베스팅 기간</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">파트너 유형:</span>
                  <p className="font-medium">{PARTNER_TYPES.find(t => t.value === selectedPartner.partnerType)?.label}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">담당자:</span>
                  <p>{selectedPartner.contactName || '-'}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">이메일:</span>
                  <p>{selectedPartner.contactEmail || '-'}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">웹사이트:</span>
                  {selectedPartner.website ? (
                    <a href={selectedPartner.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {selectedPartner.website}
                    </a>
                  ) : <p>-</p>}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">계약 기간:</span>
                  <p>
                    {selectedPartner.agreementStartDate ? new Date(selectedPartner.agreementStartDate).toLocaleDateString('ko-KR') : '-'} ~ {selectedPartner.agreementEndDate ? new Date(selectedPartner.agreementEndDate).toLocaleDateString('ko-KR') : '-'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">베스팅 방식:</span>
                  <p>{selectedPartner.vestingSchedule === 'linear' ? '선형 베스팅' : selectedPartner.vestingSchedule === 'cliff' ? '클리프' : '즉시 지급'}</p>
                </div>
              </div>

              {selectedPartner.notes && (
                <div className="text-sm">
                  <span className="text-muted-foreground">메모:</span>
                  <p className="mt-1 p-3 bg-muted rounded-md">{selectedPartner.notes}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">지급 내역</h3>
                  <Button size="sm" onClick={() => setIsAddPayoutOpen(true)} data-testid="button-add-payout">
                    <Plus className="mr-2 h-4 w-4" />
                    지급 추가
                  </Button>
                </div>
                
                {detailLoading ? (
                  <div className="space-y-2">
                    {[1, 2].map(i => <Skeleton key={i} className="h-16" />)}
                  </div>
                ) : payouts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Coins className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>지급 내역이 없습니다</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payouts.map((payout) => (
                      <Card key={payout.id} data-testid={`card-payout-${payout.id}`}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">
                                  {payout.paymentType === 'scheduled' ? '정기 지급' : payout.paymentType === 'bonus' ? '보너스' : '마일스톤'}
                                </Badge>
                                <span className="font-medium">{formatTBURN(payout.amount)} TBURN</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{payout.description || '-'}</p>
                              <div className="text-xs text-muted-foreground mt-1">
                                {new Date(payout.createdAt).toLocaleDateString('ko-KR')}
                                {payout.paidAt && ` | 지급일: ${new Date(payout.paidAt).toLocaleDateString('ko-KR')}`}
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
                                <SelectItem value="approved">승인됨</SelectItem>
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
            <DialogTitle>지급 추가</DialogTitle>
            <DialogDescription>파트너 "{selectedPartner?.partnerName}"에 새 지급을 등록합니다</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="payoutAmount">지급 금액 (wei) *</Label>
              <Input
                id="payoutAmount"
                value={payoutFormData.amount}
                onChange={(e) => setPayoutFormData({ ...payoutFormData, amount: e.target.value })}
                data-testid="input-payout-amount"
              />
              <p className="text-xs text-muted-foreground">≈ {formatTBURN(payoutFormData.amount)} TBURN</p>
            </div>
            <div className="grid gap-2">
              <Label>지급 유형</Label>
              <Select value={payoutFormData.paymentType} onValueChange={(v) => setPayoutFormData({ ...payoutFormData, paymentType: v })}>
                <SelectTrigger data-testid="select-payment-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">정기 지급</SelectItem>
                  <SelectItem value="bonus">보너스</SelectItem>
                  <SelectItem value="milestone">마일스톤</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="payoutDescription">설명</Label>
              <Textarea
                id="payoutDescription"
                value={payoutFormData.description}
                onChange={(e) => setPayoutFormData({ ...payoutFormData, description: e.target.value })}
                placeholder="지급 관련 설명..."
                rows={2}
                data-testid="input-payout-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPayoutOpen(false)} data-testid="button-cancel-payout">
              취소
            </Button>
            <Button 
              onClick={() => selectedPartner && createPayoutMutation.mutate({ 
                partnerId: selectedPartner.id, 
                data: payoutFormData 
              })}
              disabled={!payoutFormData.amount || createPayoutMutation.isPending}
              data-testid="button-submit-payout"
            >
              {createPayoutMutation.isPending ? "추가 중..." : "지급 추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
