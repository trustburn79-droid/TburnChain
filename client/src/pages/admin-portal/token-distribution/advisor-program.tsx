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
import { GraduationCap, Users, Coins, Clock, Search, RefreshCw, ArrowLeft, Plus, Eye, Edit, Calendar, Target, Briefcase, TrendingUp, Lock, Award, FileText } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Advisor {
  id: string;
  name: string;
  title: string | null;
  bio: string | null;
  photoUrl: string | null;
  email: string | null;
  linkedin: string | null;
  twitter: string | null;
  walletAddress: string | null;
  advisorType: string;
  expertise: string;
  engagementType: string;
  allocation: string;
  distributedAmount: string;
  lockedAmount: string;
  vestingType: string;
  vestingStartDate: string | null;
  vestingEndDate: string | null;
  cliffMonths: number;
  vestingMonths: number;
  tgePercentage: number;
  contractStartDate: string | null;
  contractEndDate: string | null;
  monthlyHours: number | null;
  status: string;
  notes: string | null;
  deliverables: any;
  createdAt: string;
  updatedAt: string;
}

interface AdvisorPayout {
  id: string;
  advisorId: string;
  amount: string;
  payoutType: string;
  txHash: string | null;
  status: string;
  scheduledDate: string | null;
  processedDate: string | null;
  notes: string | null;
  createdAt: string;
}

interface AdvisorContribution {
  id: string;
  advisorId: string;
  title: string;
  description: string | null;
  contributionType: string;
  hoursSpent: number | null;
  completedDate: string | null;
  impactScore: number | null;
  bonusAmount: string;
  status: string;
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

const CONTRIBUTION_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: "대기", color: "bg-yellow-500/20 text-yellow-400" },
  in_progress: { label: "진행중", color: "bg-blue-500/20 text-blue-400" },
  completed: { label: "완료", color: "bg-emerald-500/20 text-emerald-400" },
  verified: { label: "검증됨", color: "bg-purple-500/20 text-purple-400" },
  rejected: { label: "반려", color: "bg-red-500/20 text-red-400" },
};

const ADVISOR_TYPES = [
  { value: "technical", label: "기술", labelEn: "Technical" },
  { value: "strategic", label: "전략", labelEn: "Strategic" },
  { value: "legal", label: "법률", labelEn: "Legal" },
  { value: "marketing", label: "마케팅", labelEn: "Marketing" },
  { value: "financial", label: "재무", labelEn: "Financial" },
  { value: "operational", label: "운영", labelEn: "Operational" },
  { value: "advisory_board", label: "자문위원회", labelEn: "Advisory Board" },
  { value: "industry_expert", label: "산업전문가", labelEn: "Industry Expert" },
];

const EXPERTISE_OPTIONS = [
  { value: "blockchain", label: "블록체인" },
  { value: "defi", label: "DeFi" },
  { value: "tokenomics", label: "토크노믹스" },
  { value: "legal", label: "법률" },
  { value: "marketing", label: "마케팅" },
  { value: "technology", label: "기술" },
  { value: "business", label: "비즈니스" },
  { value: "security", label: "보안" },
  { value: "compliance", label: "컴플라이언스" },
  { value: "gaming", label: "게임" },
  { value: "nft", label: "NFT" },
  { value: "ai", label: "AI" },
];

const ENGAGEMENT_TYPES = [
  { value: "full_time", label: "풀타임" },
  { value: "part_time", label: "파트타임" },
  { value: "project_based", label: "프로젝트 기반" },
  { value: "retainer", label: "리테이너" },
  { value: "equity_only", label: "토큰 전용" },
];

const VESTING_TYPES = [
  { value: "immediate", label: "즉시지급" },
  { value: "cliff_linear", label: "클리프+선형" },
  { value: "cliff_monthly", label: "클리프+월별" },
  { value: "milestone_based", label: "마일스톤기반" },
  { value: "performance_based", label: "성과기반" },
];

const CONTRIBUTION_TYPES = [
  { value: "consultation", label: "자문" },
  { value: "introduction", label: "소개" },
  { value: "partnership", label: "파트너십" },
  { value: "technical_review", label: "기술검토" },
  { value: "document_review", label: "문서검토" },
  { value: "presentation", label: "프레젠테이션" },
  { value: "mentoring", label: "멘토링" },
  { value: "other", label: "기타" },
];

export default function AdminAdvisorProgram() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddPayoutOpen, setIsAddPayoutOpen] = useState(false);
  const [isAddContributionOpen, setIsAddContributionOpen] = useState(false);
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    bio: "",
    email: "",
    linkedin: "",
    twitter: "",
    walletAddress: "",
    advisorType: "strategic",
    expertise: "blockchain",
    engagementType: "part_time",
    allocation: "500000000000000000000000",
    vestingType: "cliff_linear",
    cliffMonths: 6,
    vestingMonths: 24,
    tgePercentage: 5,
    monthlyHours: 10,
    vestingStartDate: "",
    vestingEndDate: "",
    contractStartDate: "",
    contractEndDate: "",
    notes: "",
  });

  const [payoutForm, setPayoutForm] = useState({
    amount: "50000000000000000000000",
    payoutType: "vesting",
    scheduledDate: "",
    notes: "",
  });

  const [contributionForm, setContributionForm] = useState({
    title: "",
    description: "",
    contributionType: "consultation",
    hoursSpent: 2,
    completedDate: "",
    bonusAmount: "10000000000000000000000",
  });

  const { data: advisorsData, isLoading, refetch } = useQuery<{ success: boolean; data: { advisors: Advisor[]; stats: any } }>({
    queryKey: ['/api/admin/token-programs/advisor/advisors'],
  });

  const { data: advisorDetailData, isLoading: detailLoading } = useQuery<{ success: boolean; data: { advisor: Advisor; payouts: AdvisorPayout[]; contributions: AdvisorContribution[] } }>({
    queryKey: ['/api/admin/token-programs/advisor/advisors', selectedAdvisor?.id],
    enabled: !!selectedAdvisor && isDetailOpen,
  });

  const createAdvisorMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('POST', '/api/admin/token-programs/advisor/advisors', {
        ...data,
        status: "pending",
        distributedAmount: "0",
        lockedAmount: data.allocation,
      });
    },
    onSuccess: () => {
      toast({ title: "어드바이저 등록 완료", description: "새 어드바이저가 등록되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/advisor/advisors'] });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "오류", description: "어드바이저 등록에 실패했습니다.", variant: "destructive" });
    }
  });

  const updateAdvisorMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Advisor> }) => {
      return apiRequest('PATCH', `/api/admin/token-programs/advisor/advisors/${id}`, data);
    },
    onSuccess: () => {
      toast({ title: "어드바이저 수정 완료", description: "어드바이저 정보가 수정되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/advisor/advisors'] });
      setIsEditOpen(false);
      setSelectedAdvisor(null);
    },
    onError: () => {
      toast({ title: "오류", description: "어드바이저 수정에 실패했습니다.", variant: "destructive" });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest('PATCH', `/api/admin/token-programs/advisor/advisors/${id}`, { status });
    },
    onSuccess: () => {
      toast({ title: "상태 변경 완료", description: "어드바이저 상태가 변경되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/advisor/advisors'] });
      if (selectedAdvisor) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/advisor/advisors', selectedAdvisor.id] });
      }
    },
  });

  const addPayoutMutation = useMutation({
    mutationFn: async ({ advisorId, data }: { advisorId: string; data: typeof payoutForm }) => {
      return apiRequest('POST', `/api/admin/token-programs/advisor/advisors/${advisorId}/payouts`, {
        ...data,
        status: "pending",
      });
    },
    onSuccess: () => {
      toast({ title: "지급 등록 완료", description: "새 지급 일정이 등록되었습니다." });
      if (selectedAdvisor) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/advisor/advisors', selectedAdvisor.id] });
      }
      setIsAddPayoutOpen(false);
      setPayoutForm({ amount: "50000000000000000000000", payoutType: "vesting", scheduledDate: "", notes: "" });
    },
    onError: () => {
      toast({ title: "오류", description: "지급 등록에 실패했습니다.", variant: "destructive" });
    }
  });

  const updatePayoutMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest('PATCH', `/api/admin/token-programs/advisor/payouts/${id}`, { 
        status,
        ...(status === 'completed' ? { processedDate: new Date().toISOString() } : {}),
      });
    },
    onSuccess: () => {
      toast({ title: "지급 상태 변경", description: "지급 상태가 변경되었습니다." });
      if (selectedAdvisor) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/advisor/advisors', selectedAdvisor.id] });
      }
    },
  });

  const addContributionMutation = useMutation({
    mutationFn: async ({ advisorId, data }: { advisorId: string; data: typeof contributionForm }) => {
      return apiRequest('POST', `/api/admin/token-programs/advisor/advisors/${advisorId}/contributions`, {
        ...data,
        status: "pending",
      });
    },
    onSuccess: () => {
      toast({ title: "기여 등록 완료", description: "새 기여가 등록되었습니다." });
      if (selectedAdvisor) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/advisor/advisors', selectedAdvisor.id] });
      }
      setIsAddContributionOpen(false);
      setContributionForm({ title: "", description: "", contributionType: "consultation", hoursSpent: 2, completedDate: "", bonusAmount: "10000000000000000000000" });
    },
    onError: () => {
      toast({ title: "오류", description: "기여 등록에 실패했습니다.", variant: "destructive" });
    }
  });

  const updateContributionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest('PATCH', `/api/admin/token-programs/advisor/contributions/${id}`, { 
        status,
        ...(status === 'verified' ? { verifiedBy: 'admin' } : {}),
      });
    },
    onSuccess: () => {
      toast({ title: "기여 상태 변경", description: "기여 상태가 변경되었습니다." });
      if (selectedAdvisor) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/advisor/advisors', selectedAdvisor.id] });
      }
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      title: "",
      bio: "",
      email: "",
      linkedin: "",
      twitter: "",
      walletAddress: "",
      advisorType: "strategic",
      expertise: "blockchain",
      engagementType: "part_time",
      allocation: "500000000000000000000000",
      vestingType: "cliff_linear",
      cliffMonths: 6,
      vestingMonths: 24,
      tgePercentage: 5,
      monthlyHours: 10,
      vestingStartDate: "",
      vestingEndDate: "",
      contractStartDate: "",
      contractEndDate: "",
      notes: "",
    });
  };

  const openEditDialog = (advisor: Advisor) => {
    setSelectedAdvisor(advisor);
    setFormData({
      name: advisor.name,
      title: advisor.title || "",
      bio: advisor.bio || "",
      email: advisor.email || "",
      linkedin: advisor.linkedin || "",
      twitter: advisor.twitter || "",
      walletAddress: advisor.walletAddress || "",
      advisorType: advisor.advisorType,
      expertise: advisor.expertise,
      engagementType: advisor.engagementType,
      allocation: advisor.allocation,
      vestingType: advisor.vestingType,
      cliffMonths: advisor.cliffMonths,
      vestingMonths: advisor.vestingMonths,
      tgePercentage: advisor.tgePercentage,
      monthlyHours: advisor.monthlyHours || 10,
      vestingStartDate: advisor.vestingStartDate ? new Date(advisor.vestingStartDate).toISOString().slice(0, 10) : "",
      vestingEndDate: advisor.vestingEndDate ? new Date(advisor.vestingEndDate).toISOString().slice(0, 10) : "",
      contractStartDate: advisor.contractStartDate ? new Date(advisor.contractStartDate).toISOString().slice(0, 10) : "",
      contractEndDate: advisor.contractEndDate ? new Date(advisor.contractEndDate).toISOString().slice(0, 10) : "",
      notes: advisor.notes || "",
    });
    setIsEditOpen(true);
  };

  const openDetailDialog = (advisor: Advisor) => {
    setSelectedAdvisor(advisor);
    setIsDetailOpen(true);
  };

  const stats = advisorsData?.data?.stats || { totalAdvisors: 0, activeAdvisors: 0, totalAllocation: "0", lockedAmount: "0" };
  const advisorList = Array.isArray(advisorsData?.data?.advisors) ? advisorsData.data.advisors : [];
  const payouts = advisorDetailData?.data?.payouts || [];
  const contributions = advisorDetailData?.data?.contributions || [];

  const filteredAdvisors = advisorList.filter(advisor => {
    const matchesSearch = searchQuery === "" || 
      advisor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (advisor.title && advisor.title.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || advisor.status === statusFilter;
    const matchesType = typeFilter === "all" || advisor.advisorType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="admin-advisor-program-page">
      <div className="flex items-center gap-4">
        <Link href="/admin/token-distribution">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            어드바이저 프로그램 관리
          </h1>
          <p className="text-muted-foreground">Advisor Program Management - 1월 3일 정식 오픈</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh">
          <RefreshCw className="mr-2 h-4 w-4" />
          새로고침
        </Button>
        <Button onClick={() => { resetForm(); setIsCreateOpen(true); }} data-testid="button-add-advisor">
          <Plus className="mr-2 h-4 w-4" />
          새 어드바이저
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total-advisors">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">총 어드바이저</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAdvisors}</div>
            <p className="text-xs text-muted-foreground">Total Advisors</p>
          </CardContent>
        </Card>
        <Card data-testid="card-active-advisors">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">활성 어드바이저</CardTitle>
            <Users className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAdvisors}</div>
            <p className="text-xs text-muted-foreground">Active Advisors</p>
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
              <CardTitle>어드바이저 목록</CardTitle>
              <CardDescription>Advisors List - 자문 인력 관리</CardDescription>
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
                  {ADVISOR_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="어드바이저 검색..."
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
          ) : filteredAdvisors.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>어드바이저 데이터가 없습니다</p>
              <p className="text-sm">No advisors found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>어드바이저</TableHead>
                  <TableHead>유형</TableHead>
                  <TableHead>전문 분야</TableHead>
                  <TableHead className="text-right">배분량</TableHead>
                  <TableHead>참여 형태</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdvisors.map((advisor) => (
                  <TableRow key={advisor.id} data-testid={`row-advisor-${advisor.id}`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div>{advisor.name}</div>
                          {advisor.title && <div className="text-xs text-muted-foreground">{advisor.title}</div>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {ADVISOR_TYPES.find(t => t.value === advisor.advisorType)?.label || advisor.advisorType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-blue-500/20 text-blue-400">
                        {EXPERTISE_OPTIONS.find(e => e.value === advisor.expertise)?.label || advisor.expertise}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatTBURN(advisor.allocation)} TBURN</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{ENGAGEMENT_TYPES.find(e => e.value === advisor.engagementType)?.label}</div>
                        {advisor.monthlyHours && <div className="text-xs text-muted-foreground">{advisor.monthlyHours}시간/월</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={advisor.status} 
                        onValueChange={(v) => updateStatusMutation.mutate({ id: advisor.id, status: v })}
                      >
                        <SelectTrigger className="w-28 h-8" data-testid={`select-status-${advisor.id}`}>
                          <Badge className={STATUS_LABELS[advisor.status]?.color || 'bg-gray-500/20'}>
                            {STATUS_LABELS[advisor.status]?.label || advisor.status}
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
                        <Button variant="ghost" size="icon" onClick={() => openDetailDialog(advisor)} data-testid={`button-detail-${advisor.id}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(advisor)} data-testid={`button-edit-${advisor.id}`}>
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
            <DialogTitle>새 어드바이저</DialogTitle>
            <DialogDescription>새로운 어드바이저를 등록합니다.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">이름 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="어드바이저 이름"
                  data-testid="input-advisor-name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="title">직함</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="예: CEO, CTO, 파트너"
                  data-testid="input-title"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>어드바이저 유형</Label>
                <Select value={formData.advisorType} onValueChange={(v) => setFormData({ ...formData, advisorType: v })}>
                  <SelectTrigger data-testid="select-advisor-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ADVISOR_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label} ({type.labelEn})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>전문 분야</Label>
                <Select value={formData.expertise} onValueChange={(v) => setFormData({ ...formData, expertise: v })}>
                  <SelectTrigger data-testid="select-expertise">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERTISE_OPTIONS.map(exp => (
                      <SelectItem key={exp.value} value={exp.value}>{exp.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bio">소개</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="어드바이저 소개..."
                rows={2}
                data-testid="input-bio"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  data-testid="input-email"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="linkedin.com/in/..."
                  data-testid="input-linkedin"
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
            <div className="border-t pt-4">
              <h4 className="font-medium mb-4 flex items-center gap-2"><Briefcase className="h-4 w-4" /> 참여 조건</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>참여 형태</Label>
                  <Select value={formData.engagementType} onValueChange={(v) => setFormData({ ...formData, engagementType: v })}>
                    <SelectTrigger data-testid="select-engagement-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ENGAGEMENT_TYPES.map(et => (
                        <SelectItem key={et.value} value={et.value}>{et.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="monthlyHours">월간 시간</Label>
                  <Input
                    id="monthlyHours"
                    type="number"
                    value={formData.monthlyHours}
                    onChange={(e) => setFormData({ ...formData, monthlyHours: parseInt(e.target.value) || 0 })}
                    data-testid="input-monthly-hours"
                  />
                </div>
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
              </div>
            </div>
            <div className="border-t pt-4">
              <h4 className="font-medium mb-4 flex items-center gap-2"><Coins className="h-4 w-4" /> 베스팅 조건</h4>
              <div className="grid grid-cols-2 gap-4">
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
              <div className="grid grid-cols-2 gap-4 mt-4">
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
              </div>
            </div>
            <div className="border-t pt-4">
              <h4 className="font-medium mb-4 flex items-center gap-2"><Calendar className="h-4 w-4" /> 계약 일정</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>계약 시작일</Label>
                  <Input
                    type="date"
                    value={formData.contractStartDate}
                    onChange={(e) => setFormData({ ...formData, contractStartDate: e.target.value })}
                    data-testid="input-contract-start-date"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>계약 종료일</Label>
                  <Input
                    type="date"
                    value={formData.contractEndDate}
                    onChange={(e) => setFormData({ ...formData, contractEndDate: e.target.value })}
                    data-testid="input-contract-end-date"
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
              onClick={() => createAdvisorMutation.mutate(formData)}
              disabled={!formData.name || createAdvisorMutation.isPending}
              data-testid="button-submit-create"
            >
              {createAdvisorMutation.isPending ? "등록 중..." : "등록"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>어드바이저 수정</DialogTitle>
            <DialogDescription>"{selectedAdvisor?.name}" 정보를 수정합니다.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>이름</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="input-edit-advisor-name"
                />
              </div>
              <div className="grid gap-2">
                <Label>직함</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  data-testid="input-edit-title"
                />
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
              onClick={() => selectedAdvisor && updateAdvisorMutation.mutate({ id: selectedAdvisor.id, data: formData })}
              disabled={updateAdvisorMutation.isPending}
              data-testid="button-submit-edit"
            >
              {updateAdvisorMutation.isPending ? "저장 중..." : "저장"}
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
                  <GraduationCap className="h-5 w-5" />
                  {selectedAdvisor?.name}
                </DialogTitle>
                <DialogDescription>{selectedAdvisor?.title || '어드바이저'} - 상세 정보 및 지급/기여 관리</DialogDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">
                  {ADVISOR_TYPES.find(t => t.value === selectedAdvisor?.advisorType)?.label}
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-400">
                  {EXPERTISE_OPTIONS.find(e => e.value === selectedAdvisor?.expertise)?.label}
                </Badge>
                <Badge className={STATUS_LABELS[selectedAdvisor?.status || '']?.color || 'bg-gray-500/20'}>
                  {STATUS_LABELS[selectedAdvisor?.status || '']?.label || selectedAdvisor?.status}
                </Badge>
              </div>
            </div>
          </DialogHeader>
          
          {selectedAdvisor && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <Coins className="h-6 w-6 mx-auto text-emerald-500 mb-2" />
                      <div className="text-xl font-bold">{formatTBURN(selectedAdvisor.allocation)}</div>
                      <div className="text-xs text-muted-foreground">배분량 (TBURN)</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <TrendingUp className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                      <div className="text-xl font-bold">{formatTBURN(selectedAdvisor.distributedAmount)}</div>
                      <div className="text-xs text-muted-foreground">지급 완료</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <Lock className="h-6 w-6 mx-auto text-amber-500 mb-2" />
                      <div className="text-xl font-bold">{formatTBURN(selectedAdvisor.lockedAmount)}</div>
                      <div className="text-xs text-muted-foreground">잠금 중</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <Clock className="h-6 w-6 mx-auto text-purple-500 mb-2" />
                      <div className="text-xl font-bold">{selectedAdvisor.monthlyHours || 0}시간</div>
                      <div className="text-xs text-muted-foreground">월간 시간</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">참여 형태:</span>
                  <p className="font-medium">{ENGAGEMENT_TYPES.find(e => e.value === selectedAdvisor.engagementType)?.label}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">베스팅:</span>
                  <p>{VESTING_TYPES.find(v => v.value === selectedAdvisor.vestingType)?.label} (클리프 {selectedAdvisor.cliffMonths}개월 / {selectedAdvisor.vestingMonths}개월)</p>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">계약 기간:</span>
                  <p>
                    {selectedAdvisor.contractStartDate ? new Date(selectedAdvisor.contractStartDate).toLocaleDateString('ko-KR') : '-'} ~ {selectedAdvisor.contractEndDate ? new Date(selectedAdvisor.contractEndDate).toLocaleDateString('ko-KR') : '-'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">지갑 주소:</span>
                  <p className="font-mono text-xs">{selectedAdvisor.walletAddress || '-'}</p>
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
                  <h3 className="font-semibold flex items-center gap-2"><Award className="h-4 w-4" /> 기여 내역</h3>
                  <Button size="sm" onClick={() => setIsAddContributionOpen(true)} data-testid="button-add-contribution">
                    <Plus className="mr-2 h-4 w-4" />
                    기여 등록
                  </Button>
                </div>
                
                {contributions.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>기여 내역이 없습니다</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contributions.slice(0, 5).map((contrib) => (
                      <Card key={contrib.id} data-testid={`card-contribution-${contrib.id}`}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">
                                  {CONTRIBUTION_TYPES.find(c => c.value === contrib.contributionType)?.label}
                                </Badge>
                                <span className="font-medium">{contrib.title}</span>
                                {contrib.hoursSpent && <span className="text-sm text-muted-foreground">({contrib.hoursSpent}시간)</span>}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {contrib.completedDate && `완료일: ${new Date(contrib.completedDate).toLocaleDateString('ko-KR')}`}
                                {contrib.bonusAmount !== "0" && ` | 보너스: ${formatTBURN(contrib.bonusAmount)} TBURN`}
                              </div>
                              {contrib.description && <p className="text-sm mt-1">{contrib.description}</p>}
                            </div>
                            <Select 
                              value={contrib.status} 
                              onValueChange={(v) => updateContributionMutation.mutate({ id: contrib.id, status: v })}
                            >
                              <SelectTrigger className="w-28 h-8" data-testid={`select-contribution-status-${contrib.id}`}>
                                <Badge className={CONTRIBUTION_STATUS[contrib.status]?.color || 'bg-gray-500/20'}>
                                  {CONTRIBUTION_STATUS[contrib.status]?.label || contrib.status}
                                </Badge>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">대기</SelectItem>
                                <SelectItem value="in_progress">진행중</SelectItem>
                                <SelectItem value="completed">완료</SelectItem>
                                <SelectItem value="verified">검증됨</SelectItem>
                                <SelectItem value="rejected">반려</SelectItem>
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
            <DialogDescription>"{selectedAdvisor?.name}" 어드바이저에게 새 지급을 등록합니다</DialogDescription>
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
                  <SelectItem value="contribution">기여 보상</SelectItem>
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
              onClick={() => selectedAdvisor && addPayoutMutation.mutate({ 
                advisorId: selectedAdvisor.id, 
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

      <Dialog open={isAddContributionOpen} onOpenChange={setIsAddContributionOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>기여 등록</DialogTitle>
            <DialogDescription>"{selectedAdvisor?.name}" 어드바이저의 새 기여를 등록합니다</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="contributionTitle">기여 제목 *</Label>
              <Input
                id="contributionTitle"
                value={contributionForm.title}
                onChange={(e) => setContributionForm({ ...contributionForm, title: e.target.value })}
                placeholder="기여 제목"
                data-testid="input-contribution-title"
              />
            </div>
            <div className="grid gap-2">
              <Label>기여 유형</Label>
              <Select value={contributionForm.contributionType} onValueChange={(v) => setContributionForm({ ...contributionForm, contributionType: v })}>
                <SelectTrigger data-testid="select-contribution-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTRIBUTION_TYPES.map(ct => (
                    <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contributionDescription">설명</Label>
              <Textarea
                id="contributionDescription"
                value={contributionForm.description}
                onChange={(e) => setContributionForm({ ...contributionForm, description: e.target.value })}
                placeholder="기여 설명..."
                rows={2}
                data-testid="input-contribution-description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="hoursSpent">소요 시간</Label>
                <Input
                  id="hoursSpent"
                  type="number"
                  value={contributionForm.hoursSpent}
                  onChange={(e) => setContributionForm({ ...contributionForm, hoursSpent: parseInt(e.target.value) || 0 })}
                  data-testid="input-hours-spent"
                />
              </div>
              <div className="grid gap-2">
                <Label>완료일</Label>
                <Input
                  type="date"
                  value={contributionForm.completedDate}
                  onChange={(e) => setContributionForm({ ...contributionForm, completedDate: e.target.value })}
                  data-testid="input-completed-date"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bonusAmount">보너스 금액 (wei)</Label>
              <Input
                id="bonusAmount"
                value={contributionForm.bonusAmount}
                onChange={(e) => setContributionForm({ ...contributionForm, bonusAmount: e.target.value })}
                data-testid="input-bonus-amount"
              />
              <p className="text-xs text-muted-foreground">≈ {formatTBURN(contributionForm.bonusAmount)} TBURN</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddContributionOpen(false)} data-testid="button-cancel-contribution">
              취소
            </Button>
            <Button 
              onClick={() => selectedAdvisor && addContributionMutation.mutate({ 
                advisorId: selectedAdvisor.id, 
                data: contributionForm 
              })}
              disabled={!contributionForm.title || addContributionMutation.isPending}
              data-testid="button-submit-contribution"
            >
              {addContributionMutation.isPending ? "등록 중..." : "기여 등록"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
