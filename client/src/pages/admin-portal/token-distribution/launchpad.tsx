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
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rocket, Users, DollarSign, Timer, Search, RefreshCw, ArrowLeft, Plus, Eye, Edit, Star, Calendar, Globe, Coins, CheckCircle, Wallet, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface LaunchpadProject {
  id: string;
  projectName: string;
  tokenName: string;
  tokenSymbol: string;
  tokenAddress: string | null;
  description: string | null;
  website: string | null;
  twitter: string | null;
  telegram: string | null;
  discord: string | null;
  logoUrl: string | null;
  tokenPrice: string;
  totalSupply: string;
  saleAllocation: string;
  hardCap: string;
  softCap: string;
  raisedAmount: string;
  minContribution: string;
  maxContribution: string;
  tgePercentage: number;
  vestingMonths: number;
  cliffMonths: number;
  startDate: string | null;
  endDate: string | null;
  listingDate: string | null;
  kycRequired: boolean;
  whitelistOnly: boolean;
  status: string;
  featured: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface LaunchpadParticipant {
  id: string;
  projectId: string;
  walletAddress: string;
  email: string | null;
  contributionAmount: string;
  contributionCurrency: string;
  tokenAmount: string;
  distributedAmount: string;
  txHash: string | null;
  kycVerified: boolean;
  whitelisted: boolean;
  paymentReceived: boolean;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

const formatTBURN = (amount: string) => {
  const num = BigInt(amount || '0');
  const tburn = Number(num) / 1e18;
  if (tburn >= 1e6) return `${(tburn / 1e6).toFixed(2)}M`;
  if (tburn >= 1e3) return `${(tburn / 1e3).toFixed(2)}K`;
  return tburn.toFixed(4);
};

const formatUSD = (amount: string) => {
  const num = parseFloat(amount || '0');
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
};

const PROJECT_STATUS: Record<string, { label: string; color: string }> = {
  draft: { label: "초안", color: "bg-gray-500/20 text-gray-400" },
  scheduled: { label: "예정", color: "bg-blue-500/20 text-blue-400" },
  upcoming: { label: "곧 시작", color: "bg-amber-500/20 text-amber-400" },
  active: { label: "진행중", color: "bg-emerald-500/20 text-emerald-400" },
  live: { label: "라이브", color: "bg-green-500/20 text-green-400" },
  ended: { label: "종료", color: "bg-purple-500/20 text-purple-400" },
  distributed: { label: "배포완료", color: "bg-indigo-500/20 text-indigo-400" },
  cancelled: { label: "취소", color: "bg-red-500/20 text-red-400" },
};

const PARTICIPANT_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: "대기", color: "bg-yellow-500/20 text-yellow-400" },
  whitelisted: { label: "화이트리스트", color: "bg-blue-500/20 text-blue-400" },
  confirmed: { label: "확정", color: "bg-emerald-500/20 text-emerald-400" },
  distributed: { label: "배포완료", color: "bg-purple-500/20 text-purple-400" },
  refunded: { label: "환불", color: "bg-red-500/20 text-red-400" },
};

export default function AdminLaunchpad() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<LaunchpadProject | null>(null);
  
  const [formData, setFormData] = useState({
    projectName: "",
    tokenName: "",
    tokenSymbol: "",
    tokenAddress: "",
    description: "",
    website: "",
    twitter: "",
    telegram: "",
    discord: "",
    logoUrl: "",
    tokenPrice: "0.01",
    totalSupply: "1000000000000000000000000000",
    saleAllocation: "100000000000000000000000000",
    hardCap: "100000",
    softCap: "50000",
    minContribution: "100",
    maxContribution: "10000",
    tgePercentage: 20,
    vestingMonths: 12,
    cliffMonths: 1,
    startDate: "",
    endDate: "",
    listingDate: "",
    kycRequired: true,
    whitelistOnly: false,
    featured: false,
    notes: "",
  });

  const [participantForm, setParticipantForm] = useState({
    walletAddress: "",
    email: "",
    contributionAmount: "100",
    contributionCurrency: "usdt",
    kycVerified: false,
    whitelisted: false,
    paymentReceived: false,
    notes: "",
  });

  const { data: projectsData, isLoading, refetch } = useQuery<{ success: boolean; data: { projects: LaunchpadProject[]; stats: any } }>({
    queryKey: ['/api/admin/token-programs/launchpad/projects'],
  });

  const { data: projectDetailData, isLoading: detailLoading } = useQuery<{ success: boolean; data: { project: LaunchpadProject; participants: LaunchpadParticipant[] } }>({
    queryKey: ['/api/admin/token-programs/launchpad/projects', selectedProject?.id],
    enabled: !!selectedProject && isDetailOpen,
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('POST', '/api/admin/token-programs/launchpad/projects', {
        ...data,
        raisedAmount: "0",
        status: "draft",
      });
    },
    onSuccess: () => {
      toast({ title: "프로젝트 등록 완료", description: "새 런치패드 프로젝트가 등록되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/launchpad/projects'] });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "오류", description: "프로젝트 등록에 실패했습니다.", variant: "destructive" });
    }
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<LaunchpadProject> }) => {
      return apiRequest('PATCH', `/api/admin/token-programs/launchpad/projects/${id}`, data);
    },
    onSuccess: () => {
      toast({ title: "프로젝트 수정 완료", description: "프로젝트 정보가 수정되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/launchpad/projects'] });
      setIsEditOpen(false);
      setSelectedProject(null);
    },
    onError: () => {
      toast({ title: "오류", description: "프로젝트 수정에 실패했습니다.", variant: "destructive" });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest('PATCH', `/api/admin/token-programs/launchpad/projects/${id}`, { status });
    },
    onSuccess: () => {
      toast({ title: "상태 변경 완료", description: "프로젝트 상태가 변경되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/launchpad/projects'] });
      if (selectedProject) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/launchpad/projects', selectedProject.id] });
      }
    },
  });

  const addParticipantMutation = useMutation({
    mutationFn: async ({ projectId, data }: { projectId: string; data: typeof participantForm }) => {
      const tokenPrice = parseFloat(selectedProject?.tokenPrice || '0.01');
      const contributionUsd = parseFloat(data.contributionAmount);
      const tokenAmount = Math.floor((contributionUsd / tokenPrice) * 1e18);
      return apiRequest('POST', `/api/admin/token-programs/launchpad/projects/${projectId}/participants`, {
        ...data,
        tokenAmount: tokenAmount.toString(),
        distributedAmount: "0",
        status: "pending",
      });
    },
    onSuccess: () => {
      toast({ title: "참여자 등록 완료", description: "새 참여자가 등록되었습니다." });
      if (selectedProject) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/launchpad/projects', selectedProject.id] });
      }
      setIsAddParticipantOpen(false);
      setParticipantForm({ walletAddress: "", email: "", contributionAmount: "100", contributionCurrency: "usdt", kycVerified: false, whitelisted: false, paymentReceived: false, notes: "" });
    },
    onError: () => {
      toast({ title: "오류", description: "참여자 등록에 실패했습니다.", variant: "destructive" });
    }
  });

  const updateParticipantMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest('PATCH', `/api/admin/token-programs/launchpad/participants/${id}`, { status });
    },
    onSuccess: () => {
      toast({ title: "참여자 상태 변경", description: "참여자 상태가 변경되었습니다." });
      if (selectedProject) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/launchpad/projects', selectedProject.id] });
      }
    },
  });

  const resetForm = () => {
    setFormData({
      projectName: "",
      tokenName: "",
      tokenSymbol: "",
      tokenAddress: "",
      description: "",
      website: "",
      twitter: "",
      telegram: "",
      discord: "",
      logoUrl: "",
      tokenPrice: "0.01",
      totalSupply: "1000000000000000000000000000",
      saleAllocation: "100000000000000000000000000",
      hardCap: "100000",
      softCap: "50000",
      minContribution: "100",
      maxContribution: "10000",
      tgePercentage: 20,
      vestingMonths: 12,
      cliffMonths: 1,
      startDate: "",
      endDate: "",
      listingDate: "",
      kycRequired: true,
      whitelistOnly: false,
      featured: false,
      notes: "",
    });
  };

  const openEditDialog = (project: LaunchpadProject) => {
    setSelectedProject(project);
    setFormData({
      projectName: project.projectName,
      tokenName: project.tokenName,
      tokenSymbol: project.tokenSymbol,
      tokenAddress: project.tokenAddress || "",
      description: project.description || "",
      website: project.website || "",
      twitter: project.twitter || "",
      telegram: project.telegram || "",
      discord: project.discord || "",
      logoUrl: project.logoUrl || "",
      tokenPrice: project.tokenPrice,
      totalSupply: project.totalSupply,
      saleAllocation: project.saleAllocation,
      hardCap: project.hardCap,
      softCap: project.softCap,
      minContribution: project.minContribution,
      maxContribution: project.maxContribution,
      tgePercentage: project.tgePercentage,
      vestingMonths: project.vestingMonths,
      cliffMonths: project.cliffMonths,
      startDate: project.startDate ? project.startDate.split('T')[0] : "",
      endDate: project.endDate ? project.endDate.split('T')[0] : "",
      listingDate: project.listingDate ? project.listingDate.split('T')[0] : "",
      kycRequired: project.kycRequired,
      whitelistOnly: project.whitelistOnly,
      featured: project.featured,
      notes: project.notes || "",
    });
    setIsEditOpen(true);
  };

  const openDetailDialog = (project: LaunchpadProject) => {
    setSelectedProject(project);
    setIsDetailOpen(true);
  };

  const stats = projectsData?.data?.stats || { totalProjects: 0, activeProjects: 0, upcomingProjects: 0, totalParticipants: 0, totalRaised: "0" };
  const projectList = Array.isArray(projectsData?.data?.projects) ? projectsData.data.projects : [];
  const participants = projectDetailData?.data?.participants || [];

  const filteredProjects = projectList.filter(project => {
    const matchesSearch = searchQuery === "" || 
      project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tokenSymbol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getProgress = (project: LaunchpadProject) => {
    const raised = parseFloat(project.raisedAmount || '0');
    const hardCap = parseFloat(project.hardCap || '1');
    return Math.min((raised / hardCap) * 100, 100);
  };

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="admin-launchpad-page">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/admin/token-distribution")} data-testid="button-back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            공식 런치패드 관리
          </h1>
          <p className="text-muted-foreground">Official Launchpad Management - IDO/IEO 플랫폼</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh">
          <RefreshCw className="mr-2 h-4 w-4" />
          새로고침
        </Button>
        <Button onClick={() => { resetForm(); setIsCreateOpen(true); }} data-testid="button-add-project">
          <Plus className="mr-2 h-4 w-4" />
          새 프로젝트
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total-projects">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">총 프로젝트</CardTitle>
            <Rocket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">Total Projects</p>
          </CardContent>
        </Card>
        <Card data-testid="card-active-projects">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">진행중</CardTitle>
            <Timer className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">Active Projects</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-participants">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">총 참여자</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalParticipants}</div>
            <p className="text-xs text-muted-foreground">Total Participants</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-raised">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">총 모금액</CardTitle>
            <DollarSign className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUSD(stats.totalRaised)}</div>
            <p className="text-xs text-muted-foreground">Total Raised</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>런치패드 프로젝트 목록</CardTitle>
              <CardDescription>Launchpad Projects - IDO/IEO 프로젝트 관리</CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-28" data-testid="select-status-filter">
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="draft">초안</SelectItem>
                  <SelectItem value="scheduled">예정</SelectItem>
                  <SelectItem value="upcoming">곧 시작</SelectItem>
                  <SelectItem value="active">진행중</SelectItem>
                  <SelectItem value="live">라이브</SelectItem>
                  <SelectItem value="ended">종료</SelectItem>
                  <SelectItem value="distributed">배포완료</SelectItem>
                  <SelectItem value="cancelled">취소</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="프로젝트/토큰 검색..."
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
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Rocket className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>런치패드 프로젝트 데이터가 없습니다</p>
              <p className="text-sm">No launchpad projects found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="hover-elevate cursor-pointer" data-testid={`card-project-${project.id}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                        {project.tokenSymbol.slice(0, 2)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{project.projectName}</h3>
                          <Badge variant="outline">{project.tokenSymbol}</Badge>
                          {project.featured && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>토큰 가격: ${project.tokenPrice}</span>
                          <span>하드캡: {formatUSD(project.hardCap)}</span>
                          {project.startDate && <span>시작: {new Date(project.startDate).toLocaleDateString('ko-KR')}</span>}
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span>{formatUSD(project.raisedAmount)} / {formatUSD(project.hardCap)}</span>
                            <span>{getProgress(project).toFixed(1)}%</span>
                          </div>
                          <Progress value={getProgress(project)} className="h-2" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select 
                          value={project.status} 
                          onValueChange={(v) => updateStatusMutation.mutate({ id: project.id, status: v })}
                        >
                          <SelectTrigger className="w-28 h-8" data-testid={`select-status-${project.id}`}>
                            <Badge className={PROJECT_STATUS[project.status]?.color || 'bg-gray-500/20'}>
                              {PROJECT_STATUS[project.status]?.label || project.status}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">초안</SelectItem>
                            <SelectItem value="scheduled">예정</SelectItem>
                            <SelectItem value="upcoming">곧 시작</SelectItem>
                            <SelectItem value="active">진행중</SelectItem>
                            <SelectItem value="live">라이브</SelectItem>
                            <SelectItem value="ended">종료</SelectItem>
                            <SelectItem value="distributed">배포완료</SelectItem>
                            <SelectItem value="cancelled">취소</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" onClick={() => openDetailDialog(project)} data-testid={`button-detail-${project.id}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(project)} data-testid={`button-edit-${project.id}`}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>새 런치패드 프로젝트</DialogTitle>
            <DialogDescription>새로운 IDO/IEO 프로젝트를 등록합니다</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">기본 정보</TabsTrigger>
              <TabsTrigger value="token">토큰 정보</TabsTrigger>
              <TabsTrigger value="sale">세일 설정</TabsTrigger>
              <TabsTrigger value="schedule">일정</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>프로젝트명 *</Label>
                  <Input
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    placeholder="TBURN Chain"
                    data-testid="input-project-name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>웹사이트</Label>
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                    data-testid="input-website"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>프로젝트 설명</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="프로젝트에 대한 설명..."
                  rows={3}
                  data-testid="input-description"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>트위터</Label>
                  <Input
                    value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    placeholder="@handle"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>텔레그램</Label>
                  <Input
                    value={formData.telegram}
                    onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                    placeholder="t.me/group"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>디스코드</Label>
                  <Input
                    value={formData.discord}
                    onChange={(e) => setFormData({ ...formData, discord: e.target.value })}
                    placeholder="discord.gg/..."
                  />
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(c) => setFormData({ ...formData, featured: !!c })}
                  />
                  <Label htmlFor="featured">추천 프로젝트</Label>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="token" className="space-y-4 pt-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>토큰명 *</Label>
                  <Input
                    value={formData.tokenName}
                    onChange={(e) => setFormData({ ...formData, tokenName: e.target.value })}
                    placeholder="TBURN Token"
                    data-testid="input-token-name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>토큰 심볼 *</Label>
                  <Input
                    value={formData.tokenSymbol}
                    onChange={(e) => setFormData({ ...formData, tokenSymbol: e.target.value.toUpperCase() })}
                    placeholder="TBURN"
                    data-testid="input-token-symbol"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>토큰 가격 (USD)</Label>
                  <Input
                    value={formData.tokenPrice}
                    onChange={(e) => setFormData({ ...formData, tokenPrice: e.target.value })}
                    placeholder="0.01"
                    data-testid="input-token-price"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>총 발행량 (wei)</Label>
                  <Input
                    value={formData.totalSupply}
                    onChange={(e) => setFormData({ ...formData, totalSupply: e.target.value })}
                    data-testid="input-total-supply"
                  />
                  <p className="text-xs text-muted-foreground">{formatTBURN(formData.totalSupply)} tokens</p>
                </div>
                <div className="grid gap-2">
                  <Label>세일 물량 (wei)</Label>
                  <Input
                    value={formData.saleAllocation}
                    onChange={(e) => setFormData({ ...formData, saleAllocation: e.target.value })}
                    data-testid="input-sale-allocation"
                  />
                  <p className="text-xs text-muted-foreground">{formatTBURN(formData.saleAllocation)} tokens</p>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>토큰 주소</Label>
                <Input
                  value={formData.tokenAddress}
                  onChange={(e) => setFormData({ ...formData, tokenAddress: e.target.value })}
                  placeholder="0x... 또는 tb1..."
                  data-testid="input-token-address"
                />
              </div>
            </TabsContent>
            <TabsContent value="sale" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>하드캡 (USD)</Label>
                  <Input
                    value={formData.hardCap}
                    onChange={(e) => setFormData({ ...formData, hardCap: e.target.value })}
                    data-testid="input-hard-cap"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>소프트캡 (USD)</Label>
                  <Input
                    value={formData.softCap}
                    onChange={(e) => setFormData({ ...formData, softCap: e.target.value })}
                    data-testid="input-soft-cap"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>최소 참여 (USD)</Label>
                  <Input
                    value={formData.minContribution}
                    onChange={(e) => setFormData({ ...formData, minContribution: e.target.value })}
                    data-testid="input-min-contribution"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>최대 참여 (USD)</Label>
                  <Input
                    value={formData.maxContribution}
                    onChange={(e) => setFormData({ ...formData, maxContribution: e.target.value })}
                    data-testid="input-max-contribution"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>TGE 비율 (%)</Label>
                  <Input
                    type="number"
                    value={formData.tgePercentage}
                    onChange={(e) => setFormData({ ...formData, tgePercentage: parseInt(e.target.value) || 0 })}
                    data-testid="input-tge-percentage"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>클리프 (개월)</Label>
                  <Input
                    type="number"
                    value={formData.cliffMonths}
                    onChange={(e) => setFormData({ ...formData, cliffMonths: parseInt(e.target.value) || 0 })}
                    data-testid="input-cliff-months"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>베스팅 (개월)</Label>
                  <Input
                    type="number"
                    value={formData.vestingMonths}
                    onChange={(e) => setFormData({ ...formData, vestingMonths: parseInt(e.target.value) || 0 })}
                    data-testid="input-vesting-months"
                  />
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="kycRequired"
                    checked={formData.kycRequired}
                    onCheckedChange={(c) => setFormData({ ...formData, kycRequired: !!c })}
                  />
                  <Label htmlFor="kycRequired">KYC 필수</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="whitelistOnly"
                    checked={formData.whitelistOnly}
                    onCheckedChange={(c) => setFormData({ ...formData, whitelistOnly: !!c })}
                  />
                  <Label htmlFor="whitelistOnly">화이트리스트 전용</Label>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="schedule" className="space-y-4 pt-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>시작일</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    data-testid="input-start-date"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>종료일</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    data-testid="input-end-date"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>상장 예정일</Label>
                  <Input
                    type="date"
                    value={formData.listingDate}
                    onChange={(e) => setFormData({ ...formData, listingDate: e.target.value })}
                    data-testid="input-listing-date"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>메모</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="추가 메모..."
                  rows={3}
                  data-testid="input-notes"
                />
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} data-testid="button-cancel-create">
              취소
            </Button>
            <Button 
              onClick={() => createProjectMutation.mutate(formData)}
              disabled={!formData.projectName || !formData.tokenName || !formData.tokenSymbol || createProjectMutation.isPending}
              data-testid="button-submit-create"
            >
              {createProjectMutation.isPending ? "등록 중..." : "프로젝트 등록"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>프로젝트 수정</DialogTitle>
            <DialogDescription>프로젝트 정보를 수정합니다</DialogDescription>
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
                <Label>토큰 심볼</Label>
                <Input
                  value={formData.tokenSymbol}
                  onChange={(e) => setFormData({ ...formData, tokenSymbol: e.target.value.toUpperCase() })}
                  data-testid="input-edit-token-symbol"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>토큰 가격 (USD)</Label>
                <Input
                  value={formData.tokenPrice}
                  onChange={(e) => setFormData({ ...formData, tokenPrice: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>하드캡 (USD)</Label>
                <Input
                  value={formData.hardCap}
                  onChange={(e) => setFormData({ ...formData, hardCap: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>시작일</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>종료일</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>상장일</Label>
                <Input
                  type="date"
                  value={formData.listingDate}
                  onChange={(e) => setFormData({ ...formData, listingDate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="editFeatured"
                  checked={formData.featured}
                  onCheckedChange={(c) => setFormData({ ...formData, featured: !!c })}
                />
                <Label htmlFor="editFeatured">추천 프로젝트</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="editKycRequired"
                  checked={formData.kycRequired}
                  onCheckedChange={(c) => setFormData({ ...formData, kycRequired: !!c })}
                />
                <Label htmlFor="editKycRequired">KYC 필수</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} data-testid="button-cancel-edit">
              취소
            </Button>
            <Button 
              onClick={() => selectedProject && updateProjectMutation.mutate({ id: selectedProject.id, data: formData })}
              disabled={updateProjectMutation.isPending}
              data-testid="button-submit-edit"
            >
              {updateProjectMutation.isPending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {selectedProject?.tokenSymbol?.slice(0, 2) || 'LP'}
                </div>
                <div>
                  <DialogTitle className="flex items-center gap-2">
                    {selectedProject?.projectName}
                    {selectedProject?.featured && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
                  </DialogTitle>
                  <DialogDescription>{selectedProject?.tokenName} ({selectedProject?.tokenSymbol})</DialogDescription>
                </div>
              </div>
              <Badge className={PROJECT_STATUS[selectedProject?.status || '']?.color || 'bg-gray-500/20'}>
                {PROJECT_STATUS[selectedProject?.status || '']?.label || selectedProject?.status}
              </Badge>
            </div>
          </DialogHeader>
          
          {selectedProject && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <DollarSign className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
                      <div className="text-lg font-bold">${selectedProject.tokenPrice}</div>
                      <div className="text-xs text-muted-foreground">토큰 가격</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <Coins className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                      <div className="text-lg font-bold">{formatTBURN(selectedProject.saleAllocation)}</div>
                      <div className="text-xs text-muted-foreground">세일 물량</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <DollarSign className="h-5 w-5 mx-auto text-amber-500 mb-1" />
                      <div className="text-lg font-bold">{formatUSD(selectedProject.raisedAmount)}</div>
                      <div className="text-xs text-muted-foreground">모금액</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <Users className="h-5 w-5 mx-auto text-purple-500 mb-1" />
                      <div className="text-lg font-bold">{participants.length}</div>
                      <div className="text-xs text-muted-foreground">참여자</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>진행률: {formatUSD(selectedProject.raisedAmount)} / {formatUSD(selectedProject.hardCap)}</span>
                  <span>{getProgress(selectedProject).toFixed(1)}%</span>
                </div>
                <Progress value={getProgress(selectedProject)} className="h-3" />
              </div>

              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">TGE:</span>
                  <p>{selectedProject.tgePercentage}%</p>
                </div>
                <div>
                  <span className="text-muted-foreground">클리프:</span>
                  <p>{selectedProject.cliffMonths}개월</p>
                </div>
                <div>
                  <span className="text-muted-foreground">베스팅:</span>
                  <p>{selectedProject.vestingMonths}개월</p>
                </div>
                <div>
                  <span className="text-muted-foreground">참여 범위:</span>
                  <p>${selectedProject.minContribution} - ${selectedProject.maxContribution}</p>
                </div>
              </div>

              <div className="flex gap-4 text-sm">
                {selectedProject.kycRequired && <Badge variant="outline">KYC 필수</Badge>}
                {selectedProject.whitelistOnly && <Badge variant="outline">화이트리스트</Badge>}
                {selectedProject.website && (
                  <a href={selectedProject.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline">
                    <Globe className="h-3 w-3" /> 웹사이트 <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2"><Users className="h-4 w-4" /> 참여자 목록 ({participants.length})</h3>
                  <Button size="sm" onClick={() => setIsAddParticipantOpen(true)} data-testid="button-add-participant">
                    <Plus className="mr-2 h-4 w-4" />
                    참여자 추가
                  </Button>
                </div>
                
                {detailLoading ? (
                  <div className="space-y-2">
                    {[1, 2].map(i => <Skeleton key={i} className="h-12" />)}
                  </div>
                ) : participants.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>참여자가 없습니다</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>지갑</TableHead>
                        <TableHead className="text-right">참여 금액</TableHead>
                        <TableHead className="text-right">토큰</TableHead>
                        <TableHead className="text-center">KYC</TableHead>
                        <TableHead>상태</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {participants.slice(0, 10).map((participant) => (
                        <TableRow key={participant.id} data-testid={`row-participant-${participant.id}`}>
                          <TableCell className="font-mono text-xs">
                            {participant.walletAddress.slice(0, 10)}...{participant.walletAddress.slice(-6)}
                          </TableCell>
                          <TableCell className="text-right">{formatUSD(participant.contributionAmount)}</TableCell>
                          <TableCell className="text-right">{formatTBURN(participant.tokenAmount)}</TableCell>
                          <TableCell className="text-center">
                            {participant.kycVerified ? (
                              <CheckCircle className="h-4 w-4 text-emerald-500 mx-auto" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-muted-foreground mx-auto" />
                            )}
                          </TableCell>
                          <TableCell>
                            <Select 
                              value={participant.status} 
                              onValueChange={(v) => updateParticipantMutation.mutate({ id: participant.id, status: v })}
                            >
                              <SelectTrigger className="w-28 h-8">
                                <Badge className={PARTICIPANT_STATUS[participant.status]?.color || 'bg-gray-500/20'}>
                                  {PARTICIPANT_STATUS[participant.status]?.label || participant.status}
                                </Badge>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">대기</SelectItem>
                                <SelectItem value="whitelisted">화이트리스트</SelectItem>
                                <SelectItem value="confirmed">확정</SelectItem>
                                <SelectItem value="distributed">배포완료</SelectItem>
                                <SelectItem value="refunded">환불</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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

      <Dialog open={isAddParticipantOpen} onOpenChange={setIsAddParticipantOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>참여자 추가</DialogTitle>
            <DialogDescription>{selectedProject?.projectName} 프로젝트에 새 참여자를 추가합니다</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>지갑 주소 *</Label>
              <Input
                value={participantForm.walletAddress}
                onChange={(e) => setParticipantForm({ ...participantForm, walletAddress: e.target.value })}
                placeholder="0x... 또는 tb1..."
                data-testid="input-participant-wallet"
              />
            </div>
            <div className="grid gap-2">
              <Label>이메일</Label>
              <Input
                type="email"
                value={participantForm.email}
                onChange={(e) => setParticipantForm({ ...participantForm, email: e.target.value })}
                placeholder="email@example.com"
                data-testid="input-participant-email"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>참여 금액 (USD)</Label>
                <Input
                  type="number"
                  value={participantForm.contributionAmount}
                  onChange={(e) => setParticipantForm({ ...participantForm, contributionAmount: e.target.value })}
                  data-testid="input-participant-amount"
                />
              </div>
              <div className="grid gap-2">
                <Label>결제 통화</Label>
                <Select value={participantForm.contributionCurrency} onValueChange={(v) => setParticipantForm({ ...participantForm, contributionCurrency: v })}>
                  <SelectTrigger data-testid="select-participant-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usdt">USDT</SelectItem>
                    <SelectItem value="usdc">USDC</SelectItem>
                    <SelectItem value="eth">ETH</SelectItem>
                    <SelectItem value="btc">BTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="participantKyc"
                  checked={participantForm.kycVerified}
                  onCheckedChange={(c) => setParticipantForm({ ...participantForm, kycVerified: !!c })}
                />
                <Label htmlFor="participantKyc">KYC 완료</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="participantWhitelist"
                  checked={participantForm.whitelisted}
                  onCheckedChange={(c) => setParticipantForm({ ...participantForm, whitelisted: !!c })}
                />
                <Label htmlFor="participantWhitelist">화이트리스트</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="participantPayment"
                  checked={participantForm.paymentReceived}
                  onCheckedChange={(c) => setParticipantForm({ ...participantForm, paymentReceived: !!c })}
                />
                <Label htmlFor="participantPayment">입금완료</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddParticipantOpen(false)} data-testid="button-cancel-participant">
              취소
            </Button>
            <Button 
              onClick={() => selectedProject && addParticipantMutation.mutate({ 
                projectId: selectedProject.id, 
                data: participantForm 
              })}
              disabled={!participantForm.walletAddress || addParticipantMutation.isPending}
              data-testid="button-submit-participant"
            >
              {addParticipantMutation.isPending ? "등록 중..." : "참여자 추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
