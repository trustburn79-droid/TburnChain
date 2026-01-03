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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Vote, Users, FileText, CheckCircle2, Search, RefreshCw, ArrowLeft, Plus, Pencil, Trash2, Eye, XCircle, Clock, Gavel } from "lucide-react";
import { Link } from "wouter";

interface DaoProposal {
  id: string;
  proposalNumber: number;
  title: string;
  description: string;
  category: string;
  proposerAddress: string;
  proposerPower: string;
  status: string;
  votingStartDate: string | null;
  votingEndDate: string | null;
  executionDate: string | null;
  forVotes: string;
  againstVotes: string;
  abstainVotes: string;
  totalVoters: number;
  quorumRequired: string;
  passThreshold: number;
  executionPayload: any;
  executedTxHash: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DaoVote {
  id: string;
  proposalId: string;
  voterAddress: string;
  choice: string;
  votePower: string;
  delegatedFrom: string | null;
  signature: string | null;
  txHash: string | null;
  votedAt: string;
}

const CATEGORIES = [
  { value: "governance", label: "거버넌스", labelEn: "Governance" },
  { value: "treasury", label: "재무", labelEn: "Treasury" },
  { value: "technical", label: "기술", labelEn: "Technical" },
  { value: "community", label: "커뮤니티", labelEn: "Community" },
];

const STATUSES = [
  { value: "draft", label: "초안", labelEn: "Draft", color: "bg-gray-500/20 text-gray-400" },
  { value: "active", label: "진행중", labelEn: "Active", color: "bg-blue-500/20 text-blue-400" },
  { value: "passed", label: "통과", labelEn: "Passed", color: "bg-emerald-500/20 text-emerald-400" },
  { value: "rejected", label: "거부", labelEn: "Rejected", color: "bg-red-500/20 text-red-400" },
  { value: "executed", label: "실행됨", labelEn: "Executed", color: "bg-purple-500/20 text-purple-400" },
  { value: "cancelled", label: "취소됨", labelEn: "Cancelled", color: "bg-yellow-500/20 text-yellow-400" },
];

export default function AdminDAOGovernance() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isVotesOpen, setIsVotesOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<DaoProposal | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "governance",
    proposerAddress: "",
    quorumRequired: "1000000",
    passThreshold: 50,
    votingStartDate: "",
    votingEndDate: "",
  });

  const { data: proposalsData, isLoading, refetch } = useQuery<{ success: boolean; data: { proposals: DaoProposal[]; stats: any } }>({
    queryKey: ['/api/admin/token-programs/dao/proposals'],
  });

  const { data: votesData, isLoading: votesLoading } = useQuery<{ success: boolean; data: DaoVote[] }>({
    queryKey: ['/api/admin/token-programs/dao/proposals', selectedProposal?.id, 'votes'],
    enabled: !!selectedProposal && isVotesOpen,
  });

  const createProposalMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const nextNumber = (proposalList.length > 0 ? Math.max(...proposalList.map(p => p.proposalNumber)) : 0) + 1;
      return apiRequest('POST', '/api/admin/token-programs/dao/proposals', {
        ...data,
        proposalNumber: nextNumber,
        proposerPower: "0",
        forVotes: "0",
        againstVotes: "0",
        abstainVotes: "0",
        totalVoters: 0,
        executionPayload: {},
        status: "draft",
      });
    },
    onSuccess: () => {
      toast({ title: "제안 생성 완료", description: "새 DAO 제안이 생성되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/dao/proposals'] });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "오류", description: "제안 생성에 실패했습니다.", variant: "destructive" });
    }
  });

  const updateProposalMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DaoProposal> }) => {
      return apiRequest('PATCH', `/api/admin/token-programs/dao/proposals/${id}`, data);
    },
    onSuccess: () => {
      toast({ title: "제안 수정 완료", description: "DAO 제안이 수정되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/dao/proposals'] });
      setIsEditOpen(false);
      setSelectedProposal(null);
    },
    onError: () => {
      toast({ title: "오류", description: "제안 수정에 실패했습니다.", variant: "destructive" });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest('PATCH', `/api/admin/token-programs/dao/proposals/${id}`, { status });
    },
    onSuccess: () => {
      toast({ title: "상태 변경 완료", description: "제안 상태가 변경되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/dao/proposals'] });
    },
  });

  const deleteProposalMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/admin/token-programs/dao/proposals/${id}`);
    },
    onSuccess: () => {
      toast({ title: "제안 삭제 완료", description: "DAO 제안이 삭제되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/dao/proposals'] });
      handleDeleteDialogClose(false);
    },
    onError: () => {
      toast({ title: "오류", description: "제안 삭제에 실패했습니다.", variant: "destructive" });
    }
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "governance",
      proposerAddress: "",
      quorumRequired: "1000000",
      passThreshold: 50,
      votingStartDate: "",
      votingEndDate: "",
    });
  };

  const openEditDialog = (proposal: DaoProposal) => {
    setSelectedProposal(proposal);
    setFormData({
      title: proposal.title,
      description: proposal.description,
      category: proposal.category,
      proposerAddress: proposal.proposerAddress,
      quorumRequired: proposal.quorumRequired,
      passThreshold: proposal.passThreshold,
      votingStartDate: proposal.votingStartDate ? new Date(proposal.votingStartDate).toISOString().slice(0, 16) : "",
      votingEndDate: proposal.votingEndDate ? new Date(proposal.votingEndDate).toISOString().slice(0, 16) : "",
    });
    setIsEditOpen(true);
  };

  const openVotesDialog = (proposal: DaoProposal) => {
    setSelectedProposal(proposal);
    setIsVotesOpen(true);
  };

  const openDeleteDialog = (proposal: DaoProposal) => {
    setSelectedProposal(proposal);
    setIsDeleteOpen(true);
  };

  const handleVotesDialogClose = (open: boolean) => {
    setIsVotesOpen(open);
    if (!open) setSelectedProposal(null);
  };

  const handleDeleteDialogClose = (open: boolean) => {
    setIsDeleteOpen(open);
    if (!open) setSelectedProposal(null);
  };

  const handleEditDialogClose = (open: boolean) => {
    setIsEditOpen(open);
    if (!open) {
      setSelectedProposal(null);
      resetForm();
    }
  };

  const stats = proposalsData?.data?.stats || { totalProposals: 0, activeProposals: 0, passedProposals: 0, totalVoters: 0 };
  const proposalList = proposalsData?.data?.proposals || [];
  const votes = votesData?.data || [];

  const filteredProposals = proposalList.filter(proposal => {
    const matchesSearch = proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         proposal.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || proposal.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || proposal.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = STATUSES.find(s => s.value === status) || STATUSES[0];
    return <Badge className={statusConfig.color}>{statusConfig.label}</Badge>;
  };

  const formatVotes = (votes: string) => {
    const num = parseFloat(votes);
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="admin-dao-governance-page">
      <div className="flex items-center gap-4">
        <Link href="/admin/token-distribution">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            DAO 거버넌스 관리
          </h1>
          <p className="text-muted-foreground">DAO Governance Management</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-proposal">
          <Plus className="mr-2 h-4 w-4" />
          새 제안 생성
        </Button>
        <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh">
          <RefreshCw className="mr-2 h-4 w-4" />
          새로고침
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total-proposals">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">총 제안</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProposals}</div>
            <p className="text-xs text-muted-foreground">Total Proposals</p>
          </CardContent>
        </Card>
        <Card data-testid="card-active-proposals">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">진행중</CardTitle>
            <Vote className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProposals}</div>
            <p className="text-xs text-muted-foreground">Active Proposals</p>
          </CardContent>
        </Card>
        <Card data-testid="card-passed-proposals">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">통과됨</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.passedProposals}</div>
            <p className="text-xs text-muted-foreground">Passed Proposals</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-voters">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">총 투표자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVoters.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Voters</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>제안 목록</CardTitle>
              <CardDescription>Proposals List</CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="제안 검색..."
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
                  <SelectItem value="all">전체 상태</SelectItem>
                  {STATUSES.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-32" data-testid="select-category-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 카테고리</SelectItem>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : filteredProposals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Vote className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>DAO 제안 데이터가 없습니다</p>
              <p className="text-sm">No DAO proposals found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>제안명</TableHead>
                  <TableHead>카테고리</TableHead>
                  <TableHead className="text-right">찬성</TableHead>
                  <TableHead className="text-right">반대</TableHead>
                  <TableHead className="text-center">투표자</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProposals.map((proposal) => (
                  <TableRow key={proposal.id} data-testid={`row-proposal-${proposal.id}`}>
                    <TableCell className="font-mono text-muted-foreground">
                      {proposal.proposalNumber}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{proposal.title}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-xs">
                        {proposal.description.slice(0, 60)}...
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {CATEGORIES.find(c => c.value === proposal.category)?.label || proposal.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-emerald-500 font-medium">
                      {formatVotes(proposal.forVotes)}
                    </TableCell>
                    <TableCell className="text-right text-red-500 font-medium">
                      {formatVotes(proposal.againstVotes)}
                    </TableCell>
                    <TableCell className="text-center">
                      {proposal.totalVoters}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(proposal.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openVotesDialog(proposal)}
                          data-testid={`button-view-votes-${proposal.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openEditDialog(proposal)}
                          data-testid={`button-edit-${proposal.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openDeleteDialog(proposal)}
                          data-testid={`button-delete-${proposal.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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
            <DialogTitle>새 DAO 제안 생성</DialogTitle>
            <DialogDescription>새로운 거버넌스 제안을 생성합니다. Create a new governance proposal.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">제안 제목 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="제안 제목을 입력하세요"
                data-testid="input-title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">설명 *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="제안에 대한 자세한 설명을 입력하세요"
                rows={4}
                data-testid="input-description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">카테고리</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger data-testid="select-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="proposerAddress">제안자 주소 *</Label>
                <Input
                  id="proposerAddress"
                  value={formData.proposerAddress}
                  onChange={(e) => setFormData({ ...formData, proposerAddress: e.target.value })}
                  placeholder="tb1..."
                  data-testid="input-proposer-address"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quorumRequired">필요 정족수 (TBURN)</Label>
                <Input
                  id="quorumRequired"
                  type="number"
                  value={formData.quorumRequired}
                  onChange={(e) => setFormData({ ...formData, quorumRequired: e.target.value })}
                  data-testid="input-quorum"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="passThreshold">통과 기준 (%)</Label>
                <Input
                  id="passThreshold"
                  type="number"
                  min={0}
                  max={100}
                  value={formData.passThreshold}
                  onChange={(e) => setFormData({ ...formData, passThreshold: Number(e.target.value) })}
                  data-testid="input-threshold"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="votingStartDate">투표 시작일</Label>
                <Input
                  id="votingStartDate"
                  type="datetime-local"
                  value={formData.votingStartDate}
                  onChange={(e) => setFormData({ ...formData, votingStartDate: e.target.value })}
                  data-testid="input-start-date"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="votingEndDate">투표 종료일</Label>
                <Input
                  id="votingEndDate"
                  type="datetime-local"
                  value={formData.votingEndDate}
                  onChange={(e) => setFormData({ ...formData, votingEndDate: e.target.value })}
                  data-testid="input-end-date"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} data-testid="button-cancel-create">
              취소
            </Button>
            <Button 
              onClick={() => createProposalMutation.mutate(formData)}
              disabled={!formData.title || !formData.description || !formData.proposerAddress || createProposalMutation.isPending}
              data-testid="button-submit-create"
            >
              {createProposalMutation.isPending ? "생성 중..." : "제안 생성"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={handleEditDialogClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>제안 수정</DialogTitle>
            <DialogDescription>DAO 제안 정보를 수정합니다. Edit proposal details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">제안 제목</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                data-testid="input-edit-title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">설명</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                data-testid="input-edit-description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                    {CATEGORIES.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>상태 변경</Label>
                <Select 
                  value={selectedProposal?.status || "draft"} 
                  onValueChange={(v) => {
                    if (selectedProposal) {
                      updateStatusMutation.mutate({ id: selectedProposal.id, status: v });
                    }
                  }}
                >
                  <SelectTrigger data-testid="select-edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>필요 정족수 (TBURN)</Label>
                <Input
                  type="number"
                  value={formData.quorumRequired}
                  onChange={(e) => setFormData({ ...formData, quorumRequired: e.target.value })}
                  data-testid="input-edit-quorum"
                />
              </div>
              <div className="grid gap-2">
                <Label>통과 기준 (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={formData.passThreshold}
                  onChange={(e) => setFormData({ ...formData, passThreshold: Number(e.target.value) })}
                  data-testid="input-edit-threshold"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>투표 시작일</Label>
                <Input
                  type="datetime-local"
                  value={formData.votingStartDate}
                  onChange={(e) => setFormData({ ...formData, votingStartDate: e.target.value })}
                  data-testid="input-edit-start-date"
                />
              </div>
              <div className="grid gap-2">
                <Label>투표 종료일</Label>
                <Input
                  type="datetime-local"
                  value={formData.votingEndDate}
                  onChange={(e) => setFormData({ ...formData, votingEndDate: e.target.value })}
                  data-testid="input-edit-end-date"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleEditDialogClose(false)} data-testid="button-cancel-edit">
              취소
            </Button>
            <Button 
              onClick={() => selectedProposal && updateProposalMutation.mutate({ 
                id: selectedProposal.id, 
                data: { 
                  title: formData.title,
                  description: formData.description,
                  category: formData.category,
                  quorumRequired: formData.quorumRequired,
                  passThreshold: formData.passThreshold,
                  votingStartDate: formData.votingStartDate ? new Date(formData.votingStartDate) : null,
                  votingEndDate: formData.votingEndDate ? new Date(formData.votingEndDate) : null,
                } 
              })}
              disabled={updateProposalMutation.isPending}
              data-testid="button-submit-edit"
            >
              {updateProposalMutation.isPending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isVotesOpen} onOpenChange={handleVotesDialogClose}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>투표 현황: {selectedProposal?.title}</DialogTitle>
            <DialogDescription>이 제안에 대한 투표 내역을 확인합니다</DialogDescription>
          </DialogHeader>
          {selectedProposal && (
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <CheckCircle2 className="h-6 w-6 mx-auto text-emerald-500 mb-2" />
                    <div className="text-xl font-bold text-emerald-500">{formatVotes(selectedProposal.forVotes)}</div>
                    <div className="text-xs text-muted-foreground">찬성 (For)</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <XCircle className="h-6 w-6 mx-auto text-red-500 mb-2" />
                    <div className="text-xl font-bold text-red-500">{formatVotes(selectedProposal.againstVotes)}</div>
                    <div className="text-xs text-muted-foreground">반대 (Against)</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <Clock className="h-6 w-6 mx-auto text-yellow-500 mb-2" />
                    <div className="text-xl font-bold text-yellow-500">{formatVotes(selectedProposal.abstainVotes)}</div>
                    <div className="text-xs text-muted-foreground">기권 (Abstain)</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          {votesLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-10" />)}
            </div>
          ) : votes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Gavel className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>투표 기록이 없습니다</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>투표자</TableHead>
                  <TableHead>선택</TableHead>
                  <TableHead className="text-right">투표력</TableHead>
                  <TableHead>투표일시</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {votes.map((vote) => (
                  <TableRow key={vote.id} data-testid={`row-vote-${vote.id}`}>
                    <TableCell className="font-mono text-sm">
                      {vote.voterAddress.slice(0, 10)}...{vote.voterAddress.slice(-8)}
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        vote.choice === 'for' ? 'bg-emerald-500/20 text-emerald-400' :
                        vote.choice === 'against' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }>
                        {vote.choice === 'for' ? '찬성' : vote.choice === 'against' ? '반대' : '기권'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatVotes(vote.votePower)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(vote.votedAt).toLocaleString('ko-KR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={handleDeleteDialogClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>제안 삭제 확인</DialogTitle>
            <DialogDescription>
              "{selectedProposal?.title}" 제안을 삭제하시겠습니까?
              이 작업은 되돌릴 수 없으며, 관련된 모든 투표 기록도 함께 삭제됩니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleDeleteDialogClose(false)} data-testid="button-cancel-delete">
              취소
            </Button>
            <Button 
              variant="destructive"
              onClick={() => selectedProposal && deleteProposalMutation.mutate(selectedProposal.id)}
              disabled={deleteProposalMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteProposalMutation.isPending ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
