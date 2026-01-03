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
import { Sprout, Coins, FileText, CheckCircle2, Search, RefreshCw, ArrowLeft, Plus, Eye, Edit, Target, Calendar, Users, ExternalLink, Clock, XCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface EcosystemGrant {
  id: string;
  applicantAddress: string;
  applicantName: string;
  applicantEmail: string | null;
  teamSize: number;
  projectName: string;
  projectDescription: string;
  category: string;
  requestedAmount: string;
  approvedAmount: string;
  disbursedAmount: string;
  status: string;
  proposedStartDate: string | null;
  proposedEndDate: string | null;
  actualStartDate: string | null;
  actualEndDate: string | null;
  proposalUrl: string | null;
  repositoryUrl: string | null;
  websiteUrl: string | null;
  reviewedBy: string | null;
  reviewNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface GrantMilestone {
  id: string;
  grantId: string;
  milestoneNumber: number;
  title: string;
  description: string | null;
  deliverables: any[];
  evidenceUrl: string | null;
  paymentAmount: string;
  paymentPercent: number;
  status: string;
  dueDate: string | null;
  submittedAt: string | null;
  approvedAt: string | null;
  reviewedBy: string | null;
  reviewNotes: string | null;
  paymentTxHash: string | null;
  paidAt: string | null;
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
  submitted: { label: "제출됨", color: "bg-blue-500/20 text-blue-400" },
  reviewing: { label: "검토중", color: "bg-purple-500/20 text-purple-400" },
  approved: { label: "승인됨", color: "bg-emerald-500/20 text-emerald-400" },
  rejected: { label: "거부됨", color: "bg-red-500/20 text-red-400" },
  active: { label: "진행중", color: "bg-cyan-500/20 text-cyan-400" },
  completed: { label: "완료", color: "bg-green-500/20 text-green-400" },
  cancelled: { label: "취소됨", color: "bg-yellow-500/20 text-yellow-400" },
};

const MILESTONE_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: "대기", color: "bg-gray-500/20 text-gray-400" },
  in_progress: { label: "진행중", color: "bg-blue-500/20 text-blue-400" },
  submitted: { label: "제출됨", color: "bg-purple-500/20 text-purple-400" },
  approved: { label: "승인됨", color: "bg-emerald-500/20 text-emerald-400" },
  rejected: { label: "거부됨", color: "bg-red-500/20 text-red-400" },
};

const CATEGORIES = [
  { value: "infrastructure", label: "인프라", labelEn: "Infrastructure" },
  { value: "defi", label: "DeFi", labelEn: "DeFi" },
  { value: "nft", label: "NFT", labelEn: "NFT" },
  { value: "gaming", label: "게이밍", labelEn: "Gaming" },
  { value: "tooling", label: "도구", labelEn: "Tooling" },
  { value: "research", label: "연구", labelEn: "Research" },
  { value: "community", label: "커뮤니티", labelEn: "Community" },
  { value: "other", label: "기타", labelEn: "Other" },
];

export default function AdminEcosystemFund() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
  const [selectedGrant, setSelectedGrant] = useState<EcosystemGrant | null>(null);
  
  const [formData, setFormData] = useState({
    applicantAddress: "",
    applicantName: "",
    applicantEmail: "",
    teamSize: 1,
    projectName: "",
    projectDescription: "",
    category: "infrastructure",
    requestedAmount: "10000000000000000000000",
    proposedStartDate: "",
    proposedEndDate: "",
    proposalUrl: "",
    repositoryUrl: "",
    websiteUrl: "",
  });

  const [milestoneFormData, setMilestoneFormData] = useState({
    title: "",
    description: "",
    paymentPercent: 25,
    dueDate: "",
  });

  const { data: grantsData, isLoading, refetch } = useQuery<{ success: boolean; data: { grants: EcosystemGrant[]; stats: any } }>({
    queryKey: ['/api/admin/token-programs/ecosystem-grants'],
  });

  const { data: grantDetailData, isLoading: detailLoading } = useQuery<{ success: boolean; data: { grant: EcosystemGrant; milestones: GrantMilestone[] } }>({
    queryKey: ['/api/admin/token-programs/ecosystem-grants', selectedGrant?.id],
    enabled: !!selectedGrant && isDetailOpen,
  });

  const createGrantMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('POST', '/api/admin/token-programs/ecosystem-grants', {
        ...data,
        status: "submitted",
        approvedAmount: "0",
        disbursedAmount: "0",
      });
    },
    onSuccess: () => {
      toast({ title: "그랜트 생성 완료", description: "새 에코시스템 그랜트가 생성되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/ecosystem-grants'] });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "오류", description: "그랜트 생성에 실패했습니다.", variant: "destructive" });
    }
  });

  const updateGrantMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EcosystemGrant> }) => {
      return apiRequest('PATCH', `/api/admin/token-programs/ecosystem-grants/${id}`, data);
    },
    onSuccess: () => {
      toast({ title: "그랜트 수정 완료", description: "에코시스템 그랜트가 수정되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/ecosystem-grants'] });
      setIsEditOpen(false);
      setSelectedGrant(null);
    },
    onError: () => {
      toast({ title: "오류", description: "그랜트 수정에 실패했습니다.", variant: "destructive" });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, reviewNotes }: { id: string; status: string; reviewNotes?: string }) => {
      return apiRequest('PATCH', `/api/admin/token-programs/ecosystem-grants/${id}`, { 
        status,
        reviewNotes,
        reviewedBy: 'admin',
        ...(status === 'active' ? { actualStartDate: new Date().toISOString() } : {}),
        ...(status === 'completed' ? { actualEndDate: new Date().toISOString() } : {})
      });
    },
    onSuccess: () => {
      toast({ title: "상태 변경 완료", description: "그랜트 상태가 변경되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/ecosystem-grants'] });
      if (selectedGrant) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/ecosystem-grants', selectedGrant.id] });
      }
    },
  });

  const createMilestoneMutation = useMutation({
    mutationFn: async ({ grantId, data }: { grantId: string; data: typeof milestoneFormData }) => {
      const milestones = grantDetailData?.data?.milestones || [];
      const nextNumber = milestones.length + 1;
      const requestedAmount = selectedGrant?.requestedAmount || "0";
      const paymentAmount = (BigInt(requestedAmount) * BigInt(data.paymentPercent) / BigInt(100)).toString();
      
      return apiRequest('POST', `/api/admin/token-programs/ecosystem-grants/${grantId}/milestones`, {
        ...data,
        milestoneNumber: nextNumber,
        paymentAmount,
        status: "pending",
        deliverables: [],
      });
    },
    onSuccess: () => {
      toast({ title: "마일스톤 생성 완료", description: "새 마일스톤이 추가되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/ecosystem-grants'] });
      if (selectedGrant) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/ecosystem-grants', selectedGrant.id] });
      }
      setIsAddMilestoneOpen(false);
      setMilestoneFormData({ title: "", description: "", paymentPercent: 25, dueDate: "" });
    },
    onError: () => {
      toast({ title: "오류", description: "마일스톤 생성에 실패했습니다.", variant: "destructive" });
    }
  });

  const updateMilestoneMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest('PATCH', `/api/admin/token-programs/ecosystem-grants/milestones/${id}`, { 
        status,
        ...(status === 'approved' ? { approvedAt: new Date().toISOString(), reviewedBy: 'admin' } : {})
      });
    },
    onSuccess: () => {
      toast({ title: "마일스톤 상태 변경", description: "마일스톤 상태가 변경되었습니다." });
      if (selectedGrant) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/ecosystem-grants', selectedGrant.id] });
      }
    },
  });

  const resetForm = () => {
    setFormData({
      applicantAddress: "",
      applicantName: "",
      applicantEmail: "",
      teamSize: 1,
      projectName: "",
      projectDescription: "",
      category: "infrastructure",
      requestedAmount: "10000000000000000000000",
      proposedStartDate: "",
      proposedEndDate: "",
      proposalUrl: "",
      repositoryUrl: "",
      websiteUrl: "",
    });
  };

  const openEditDialog = (grant: EcosystemGrant) => {
    setSelectedGrant(grant);
    setFormData({
      applicantAddress: grant.applicantAddress,
      applicantName: grant.applicantName,
      applicantEmail: grant.applicantEmail || "",
      teamSize: grant.teamSize,
      projectName: grant.projectName,
      projectDescription: grant.projectDescription,
      category: grant.category,
      requestedAmount: grant.requestedAmount,
      proposedStartDate: grant.proposedStartDate ? new Date(grant.proposedStartDate).toISOString().slice(0, 10) : "",
      proposedEndDate: grant.proposedEndDate ? new Date(grant.proposedEndDate).toISOString().slice(0, 10) : "",
      proposalUrl: grant.proposalUrl || "",
      repositoryUrl: grant.repositoryUrl || "",
      websiteUrl: grant.websiteUrl || "",
    });
    setIsEditOpen(true);
  };

  const openDetailDialog = (grant: EcosystemGrant) => {
    setSelectedGrant(grant);
    setIsDetailOpen(true);
  };

  const stats = grantsData?.data?.stats || { totalGrants: 0, activeGrants: 0, totalRequested: "0", totalDisbursed: "0" };
  const grantList = Array.isArray(grantsData?.data?.grants) ? grantsData.data.grants : [];
  const milestones = grantDetailData?.data?.milestones || [];

  const filteredGrants = grantList.filter(grant => {
    const matchesSearch = searchQuery === "" || 
      grant.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grant.applicantName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || grant.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || grant.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="admin-ecosystem-fund-page">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/admin/token-distribution")} data-testid="button-back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            에코시스템 펀드 관리
          </h1>
          <p className="text-muted-foreground">Ecosystem Fund Management - 1월 3일 정식 오픈</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh">
          <RefreshCw className="mr-2 h-4 w-4" />
          새로고침
        </Button>
        <Button onClick={() => { resetForm(); setIsCreateOpen(true); }} data-testid="button-add-grant">
          <Plus className="mr-2 h-4 w-4" />
          새 그랜트
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total-grants">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">총 그랜트</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGrants}</div>
            <p className="text-xs text-muted-foreground">Total Grants</p>
          </CardContent>
        </Card>
        <Card data-testid="card-active-grants">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">진행중</CardTitle>
            <Sprout className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeGrants}</div>
            <p className="text-xs text-muted-foreground">Active Grants</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-requested">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">요청 금액</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTBURN(stats.totalRequested)} TBURN</div>
            <p className="text-xs text-muted-foreground">Total Requested</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-disbursed">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">지급 완료</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTBURN(stats.totalDisbursed)} TBURN</div>
            <p className="text-xs text-muted-foreground">Total Disbursed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>에코시스템 그랜트 목록</CardTitle>
              <CardDescription>Ecosystem Grants - 생태계 발전을 위한 프로젝트 지원</CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32" data-testid="select-status-filter">
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="submitted">제출됨</SelectItem>
                  <SelectItem value="reviewing">검토중</SelectItem>
                  <SelectItem value="approved">승인됨</SelectItem>
                  <SelectItem value="active">진행중</SelectItem>
                  <SelectItem value="completed">완료</SelectItem>
                  <SelectItem value="rejected">거부됨</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-36" data-testid="select-category-filter">
                  <SelectValue placeholder="카테고리" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="프로젝트 검색..."
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
          ) : filteredGrants.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Sprout className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>에코시스템 그랜트 데이터가 없습니다</p>
              <p className="text-sm">No ecosystem grants found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>프로젝트명</TableHead>
                  <TableHead>카테고리</TableHead>
                  <TableHead>신청자</TableHead>
                  <TableHead className="text-right">요청 금액</TableHead>
                  <TableHead className="text-right">지급 금액</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGrants.map((grant) => (
                  <TableRow key={grant.id} data-testid={`row-grant-${grant.id}`}>
                    <TableCell className="font-medium">{grant.projectName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {CATEGORIES.find(c => c.value === grant.category)?.label || grant.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{grant.applicantName}</span>
                        <Badge variant="secondary" className="text-xs">{grant.teamSize}명</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatTBURN(grant.requestedAmount)} TBURN</TableCell>
                    <TableCell className="text-right">{formatTBURN(grant.disbursedAmount)} TBURN</TableCell>
                    <TableCell>
                      <Select 
                        value={grant.status} 
                        onValueChange={(v) => updateStatusMutation.mutate({ id: grant.id, status: v })}
                      >
                        <SelectTrigger className="w-28 h-8" data-testid={`select-status-${grant.id}`}>
                          <Badge className={STATUS_LABELS[grant.status]?.color || 'bg-gray-500/20'}>
                            {STATUS_LABELS[grant.status]?.label || grant.status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="submitted">제출됨</SelectItem>
                          <SelectItem value="reviewing">검토중</SelectItem>
                          <SelectItem value="approved">승인됨</SelectItem>
                          <SelectItem value="rejected">거부됨</SelectItem>
                          <SelectItem value="active">진행중</SelectItem>
                          <SelectItem value="completed">완료</SelectItem>
                          <SelectItem value="cancelled">취소됨</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openDetailDialog(grant)} data-testid={`button-detail-${grant.id}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(grant)} data-testid={`button-edit-${grant.id}`}>
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
            <DialogTitle>새 에코시스템 그랜트 생성</DialogTitle>
            <DialogDescription>새로운 프로젝트 지원 신청을 등록합니다.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="projectName">프로젝트명 *</Label>
                <Input
                  id="projectName"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  placeholder="프로젝트 이름"
                  data-testid="input-project-name"
                />
              </div>
              <div className="grid gap-2">
                <Label>카테고리</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger data-testid="select-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label} ({cat.labelEn})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="projectDescription">프로젝트 설명 *</Label>
              <Textarea
                id="projectDescription"
                value={formData.projectDescription}
                onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                placeholder="프로젝트에 대한 상세 설명..."
                rows={3}
                data-testid="input-project-description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="applicantName">신청자 이름 *</Label>
                <Input
                  id="applicantName"
                  value={formData.applicantName}
                  onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                  data-testid="input-applicant-name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="applicantEmail">이메일</Label>
                <Input
                  id="applicantEmail"
                  type="email"
                  value={formData.applicantEmail}
                  onChange={(e) => setFormData({ ...formData, applicantEmail: e.target.value })}
                  data-testid="input-applicant-email"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="applicantAddress">지갑 주소 *</Label>
                <Input
                  id="applicantAddress"
                  value={formData.applicantAddress}
                  onChange={(e) => setFormData({ ...formData, applicantAddress: e.target.value })}
                  placeholder="tb1..."
                  data-testid="input-applicant-address"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="teamSize">팀 규모</Label>
                <Input
                  id="teamSize"
                  type="number"
                  value={formData.teamSize}
                  onChange={(e) => setFormData({ ...formData, teamSize: parseInt(e.target.value) || 1 })}
                  data-testid="input-team-size"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="requestedAmount">요청 금액 (wei)</Label>
              <Input
                id="requestedAmount"
                value={formData.requestedAmount}
                onChange={(e) => setFormData({ ...formData, requestedAmount: e.target.value })}
                data-testid="input-requested-amount"
              />
              <p className="text-xs text-muted-foreground">≈ {formatTBURN(formData.requestedAmount)} TBURN</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>예상 시작일</Label>
                <Input
                  type="date"
                  value={formData.proposedStartDate}
                  onChange={(e) => setFormData({ ...formData, proposedStartDate: e.target.value })}
                  data-testid="input-proposed-start"
                />
              </div>
              <div className="grid gap-2">
                <Label>예상 종료일</Label>
                <Input
                  type="date"
                  value={formData.proposedEndDate}
                  onChange={(e) => setFormData({ ...formData, proposedEndDate: e.target.value })}
                  data-testid="input-proposed-end"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="proposalUrl">제안서 URL</Label>
              <Input
                id="proposalUrl"
                value={formData.proposalUrl}
                onChange={(e) => setFormData({ ...formData, proposalUrl: e.target.value })}
                placeholder="https://..."
                data-testid="input-proposal-url"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="repositoryUrl">GitHub URL</Label>
                <Input
                  id="repositoryUrl"
                  value={formData.repositoryUrl}
                  onChange={(e) => setFormData({ ...formData, repositoryUrl: e.target.value })}
                  placeholder="https://github.com/..."
                  data-testid="input-repository-url"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="websiteUrl">웹사이트 URL</Label>
                <Input
                  id="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  placeholder="https://..."
                  data-testid="input-website-url"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} data-testid="button-cancel-create">
              취소
            </Button>
            <Button 
              onClick={() => createGrantMutation.mutate(formData)}
              disabled={!formData.projectName || !formData.applicantName || !formData.applicantAddress || createGrantMutation.isPending}
              data-testid="button-submit-create"
            >
              {createGrantMutation.isPending ? "생성 중..." : "생성"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>그랜트 수정</DialogTitle>
            <DialogDescription>"{selectedGrant?.projectName}" 정보를 수정합니다.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>프로젝트명</Label>
                <Input
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  data-testid="input-edit-project-name"
                />
              </div>
              <div className="grid gap-2">
                <Label>카테고리</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger data-testid="select-edit-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>프로젝트 설명</Label>
              <Textarea
                value={formData.projectDescription}
                onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                rows={3}
                data-testid="input-edit-project-description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>신청자 이름</Label>
                <Input
                  value={formData.applicantName}
                  onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                  data-testid="input-edit-applicant-name"
                />
              </div>
              <div className="grid gap-2">
                <Label>이메일</Label>
                <Input
                  type="email"
                  value={formData.applicantEmail}
                  onChange={(e) => setFormData({ ...formData, applicantEmail: e.target.value })}
                  data-testid="input-edit-applicant-email"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>지갑 주소</Label>
                <Input
                  value={formData.applicantAddress}
                  onChange={(e) => setFormData({ ...formData, applicantAddress: e.target.value })}
                  data-testid="input-edit-applicant-address"
                />
              </div>
              <div className="grid gap-2">
                <Label>팀 규모</Label>
                <Input
                  type="number"
                  value={formData.teamSize}
                  onChange={(e) => setFormData({ ...formData, teamSize: parseInt(e.target.value) || 1 })}
                  data-testid="input-edit-team-size"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>요청 금액 (wei)</Label>
              <Input
                value={formData.requestedAmount}
                onChange={(e) => setFormData({ ...formData, requestedAmount: e.target.value })}
                data-testid="input-edit-requested-amount"
              />
              <p className="text-xs text-muted-foreground">≈ {formatTBURN(formData.requestedAmount)} TBURN</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} data-testid="button-cancel-edit">
              취소
            </Button>
            <Button 
              onClick={() => selectedGrant && updateGrantMutation.mutate({ id: selectedGrant.id, data: formData })}
              disabled={updateGrantMutation.isPending}
              data-testid="button-submit-edit"
            >
              {updateGrantMutation.isPending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <DialogTitle>{selectedGrant?.projectName}</DialogTitle>
                <DialogDescription>프로젝트 상세 정보 및 마일스톤 관리</DialogDescription>
              </div>
              <Badge className={STATUS_LABELS[selectedGrant?.status || '']?.color || 'bg-gray-500/20'}>
                {STATUS_LABELS[selectedGrant?.status || '']?.label || selectedGrant?.status}
              </Badge>
            </div>
          </DialogHeader>
          
          {selectedGrant && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <Coins className="h-6 w-6 mx-auto text-emerald-500 mb-2" />
                      <div className="text-xl font-bold">{formatTBURN(selectedGrant.requestedAmount)}</div>
                      <div className="text-xs text-muted-foreground">요청 금액 (TBURN)</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <CheckCircle2 className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                      <div className="text-xl font-bold">{formatTBURN(selectedGrant.approvedAmount)}</div>
                      <div className="text-xs text-muted-foreground">승인 금액 (TBURN)</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <Target className="h-6 w-6 mx-auto text-purple-500 mb-2" />
                      <div className="text-xl font-bold">{formatTBURN(selectedGrant.disbursedAmount)}</div>
                      <div className="text-xs text-muted-foreground">지급 완료 (TBURN)</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">신청자:</span>
                  <p className="font-medium">{selectedGrant.applicantName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">이메일:</span>
                  <p>{selectedGrant.applicantEmail || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">지갑 주소:</span>
                  <p className="font-mono text-xs">{selectedGrant.applicantAddress}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">팀 규모:</span>
                  <p>{selectedGrant.teamSize}명</p>
                </div>
                <div>
                  <span className="text-muted-foreground">카테고리:</span>
                  <p>{CATEGORIES.find(c => c.value === selectedGrant.category)?.label}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">생성일:</span>
                  <p>{new Date(selectedGrant.createdAt).toLocaleDateString('ko-KR')}</p>
                </div>
                {selectedGrant.proposalUrl && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">제안서:</span>
                    <a href={selectedGrant.proposalUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline">
                      {selectedGrant.proposalUrl} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">마일스톤 관리</h3>
                  <Button size="sm" onClick={() => setIsAddMilestoneOpen(true)} data-testid="button-add-milestone">
                    <Plus className="mr-2 h-4 w-4" />
                    마일스톤 추가
                  </Button>
                </div>
                
                {detailLoading ? (
                  <div className="space-y-2">
                    {[1, 2].map(i => <Skeleton key={i} className="h-16" />)}
                  </div>
                ) : milestones.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>마일스톤이 없습니다</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {milestones.map((milestone) => (
                      <Card key={milestone.id} data-testid={`card-milestone-${milestone.id}`}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">M{milestone.milestoneNumber}</Badge>
                                <span className="font-medium">{milestone.title}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{milestone.description}</p>
                              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                <span>{formatTBURN(milestone.paymentAmount)} TBURN ({milestone.paymentPercent}%)</span>
                                {milestone.dueDate && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(milestone.dueDate).toLocaleDateString('ko-KR')}
                                  </span>
                                )}
                              </div>
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
                                <SelectItem value="submitted">제출됨</SelectItem>
                                <SelectItem value="approved">승인됨</SelectItem>
                                <SelectItem value="rejected">거부됨</SelectItem>
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

      <Dialog open={isAddMilestoneOpen} onOpenChange={setIsAddMilestoneOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>마일스톤 추가</DialogTitle>
            <DialogDescription>프로젝트 "{selectedGrant?.projectName}"에 새 마일스톤을 추가합니다</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="milestoneTitle">마일스톤 제목 *</Label>
              <Input
                id="milestoneTitle"
                value={milestoneFormData.title}
                onChange={(e) => setMilestoneFormData({ ...milestoneFormData, title: e.target.value })}
                placeholder="예: MVP 개발 완료"
                data-testid="input-milestone-title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="milestoneDescription">설명</Label>
              <Textarea
                id="milestoneDescription"
                value={milestoneFormData.description}
                onChange={(e) => setMilestoneFormData({ ...milestoneFormData, description: e.target.value })}
                placeholder="마일스톤에 대한 상세 설명..."
                rows={2}
                data-testid="input-milestone-description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="paymentPercent">지급 비율 (%)</Label>
                <Input
                  id="paymentPercent"
                  type="number"
                  value={milestoneFormData.paymentPercent}
                  onChange={(e) => setMilestoneFormData({ ...milestoneFormData, paymentPercent: parseInt(e.target.value) || 0 })}
                  data-testid="input-payment-percent"
                />
                {selectedGrant && (
                  <p className="text-xs text-muted-foreground">
                    ≈ {formatTBURN((BigInt(selectedGrant.requestedAmount) * BigInt(milestoneFormData.paymentPercent) / BigInt(100)).toString())} TBURN
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">마감일</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={milestoneFormData.dueDate}
                  onChange={(e) => setMilestoneFormData({ ...milestoneFormData, dueDate: e.target.value })}
                  data-testid="input-due-date"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMilestoneOpen(false)} data-testid="button-cancel-milestone">
              취소
            </Button>
            <Button 
              onClick={() => selectedGrant && createMilestoneMutation.mutate({ 
                grantId: selectedGrant.id, 
                data: milestoneFormData 
              })}
              disabled={!milestoneFormData.title || createMilestoneMutation.isPending}
              data-testid="button-submit-milestone"
            >
              {createMilestoneMutation.isPending ? "추가 중..." : "마일스톤 추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
