import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Users, Target, Star, Search, RefreshCw, ArrowLeft, Plus, Edit, Trash2, Eye, CheckCircle, XCircle, Clock, Gift } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface CommunityTask {
  id: string;
  taskType: string;
  name: string;
  description?: string;
  pointsReward: number;
  tokenReward: string;
  requirements: any;
  maxCompletions?: number;
  completionCount: number;
  dailyLimit?: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

interface CommunityContribution {
  id: string;
  taskId: string;
  walletAddress: string;
  status: string;
  proofUrl?: string;
  proofDescription?: string;
  pointsEarned: number;
  tokensEarned: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
}

const TASK_TYPES = [
  { value: "social", label: "소셜 미디어", labelEn: "Social Media" },
  { value: "content", label: "콘텐츠 제작", labelEn: "Content Creation" },
  { value: "development", label: "개발", labelEn: "Development" },
  { value: "ambassador", label: "앰버서더", labelEn: "Ambassador" },
  { value: "testing", label: "테스팅", labelEn: "Testing" },
  { value: "feedback", label: "피드백", labelEn: "Feedback" },
  { value: "translation", label: "번역", labelEn: "Translation" },
  { value: "bug_report", label: "버그 리포트", labelEn: "Bug Report" },
];

export default function AdminCommunityProgram() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("tasks");
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isContributionsOpen, setIsContributionsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<CommunityTask | null>(null);
  
  const [formData, setFormData] = useState({
    taskType: "social",
    name: "",
    description: "",
    pointsReward: 100,
    tokenReward: "0",
    maxCompletions: 0,
    dailyLimit: 0,
    isActive: true,
  });

  const { data: tasksData, isLoading, refetch } = useQuery<{ success: boolean; data: { tasks: CommunityTask[]; stats: any } }>({
    queryKey: ['/api/admin/token-programs/community/tasks'],
  });

  const { data: contributionsData, isLoading: contributionsLoading } = useQuery<{ success: boolean; data: CommunityContribution[] }>({
    queryKey: ['/api/admin/token-programs/community/tasks', selectedTask?.id, 'contributions'],
    enabled: !!selectedTask && isContributionsOpen,
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('POST', '/api/admin/token-programs/community/tasks', data);
    },
    onSuccess: () => {
      toast({ title: "태스크 생성 완료", description: "새 커뮤니티 태스크가 생성되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/community/tasks'] });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "오류", description: "태스크 생성에 실패했습니다.", variant: "destructive" });
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CommunityTask> }) => {
      return apiRequest('PATCH', `/api/admin/token-programs/community/tasks/${id}`, data);
    },
    onSuccess: () => {
      toast({ title: "태스크 수정 완료", description: "커뮤니티 태스크가 수정되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/community/tasks'] });
      setIsEditOpen(false);
      setSelectedTask(null);
    },
    onError: () => {
      toast({ title: "오류", description: "태스크 수정에 실패했습니다.", variant: "destructive" });
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return apiRequest('PATCH', `/api/admin/token-programs/community/tasks/${id}`, { isActive });
    },
    onSuccess: () => {
      toast({ title: "상태 변경 완료", description: "태스크 상태가 변경되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/community/tasks'] });
    },
  });

  const approveContributionMutation = useMutation({
    mutationFn: async ({ id, status, taskId }: { id: string; status: string; taskId: string }) => {
      return apiRequest('PATCH', `/api/admin/token-programs/community/contributions/${id}`, { status });
    },
    onSuccess: (_, variables) => {
      toast({ title: "기여 처리 완료", description: "기여 상태가 변경되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/community/tasks', variables.taskId, 'contributions'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/admin/token-programs/community/tasks/${id}`);
    },
    onSuccess: () => {
      toast({ title: "태스크 삭제 완료", description: "커뮤니티 태스크가 삭제되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/community/tasks'] });
      setIsDeleteOpen(false);
      setSelectedTask(null);
    },
    onError: () => {
      toast({ title: "오류", description: "태스크 삭제에 실패했습니다.", variant: "destructive" });
    }
  });

  const resetForm = () => {
    setFormData({
      taskType: "social",
      name: "",
      description: "",
      pointsReward: 100,
      tokenReward: "0",
      maxCompletions: 0,
      dailyLimit: 0,
      isActive: true,
    });
  };

  const openEditDialog = (task: CommunityTask) => {
    setSelectedTask(task);
    setFormData({
      taskType: task.taskType,
      name: task.name,
      description: task.description || "",
      pointsReward: task.pointsReward,
      tokenReward: task.tokenReward,
      maxCompletions: task.maxCompletions || 0,
      dailyLimit: task.dailyLimit || 0,
      isActive: task.isActive,
    });
    setIsEditOpen(true);
  };

  const openContributionsDialog = (task: CommunityTask) => {
    setSelectedTask(task);
    setIsContributionsOpen(true);
  };

  const handleContributionsDialogClose = (open: boolean) => {
    setIsContributionsOpen(open);
    if (!open) setSelectedTask(null);
  };

  const handleDeleteDialogClose = (open: boolean) => {
    setIsDeleteOpen(open);
    if (!open) setSelectedTask(null);
  };

  const stats = tasksData?.data?.stats || { totalTasks: 0, activeTasks: 0, totalContributions: 0, totalPointsDistributed: 0 };
  const taskList = tasksData?.data?.tasks || [];
  const contributions = contributionsData?.data || [];

  const filteredTasks = taskList.filter((task: CommunityTask) => {
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (task.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || 
                          (statusFilter === "active" && task.isActive) ||
                          (statusFilter === "inactive" && !task.isActive);
    const matchesType = typeFilter === "all" || task.taskType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getTaskTypeLabel = (type: string) => {
    const found = TASK_TYPES.find(t => t.value === type);
    return found ? found.label : type;
  };

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="admin-community-program-page">
      <div className="flex items-center gap-4">
        <Link href="/admin/token-distribution">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            커뮤니티 프로그램 관리
          </h1>
          <p className="text-muted-foreground">Community Program Management - 1월 3일 정식 오픈</p>
        </div>
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
          <Clock className="h-3 w-3 mr-1" />
          LIVE
        </Badge>
        <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh">
          <RefreshCw className="mr-2 h-4 w-4" />
          새로고침
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total-tasks">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">총 태스크</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">Total Tasks</p>
          </CardContent>
        </Card>
        <Card data-testid="card-active-tasks">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">활성 태스크</CardTitle>
            <Star className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{stats.activeTasks}</div>
            <p className="text-xs text-muted-foreground">Active Tasks</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-contributions">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">총 참여</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContributions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Contributions</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-points">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">배분 포인트</CardTitle>
            <Gift className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{stats.totalPointsDistributed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Points Distributed</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tasks">태스크 관리</TabsTrigger>
          <TabsTrigger value="pending">승인 대기</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <CardTitle>커뮤니티 태스크 목록</CardTitle>
                  <CardDescription>참여자들이 완료할 수 있는 태스크를 관리합니다</CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="태스크 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-48"
                      data-testid="input-search"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32" data-testid="select-status-filter">
                      <SelectValue placeholder="상태" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="active">활성</SelectItem>
                      <SelectItem value="inactive">비활성</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-32" data-testid="select-type-filter">
                      <SelectValue placeholder="유형" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체 유형</SelectItem>
                      {TASK_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={() => setIsCreateOpen(true)} data-testid="button-add-task">
                    <Plus className="mr-2 h-4 w-4" />
                    새 태스크
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-14" />)}
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>커뮤니티 태스크가 없습니다</p>
                  <p className="text-sm mb-4">새 태스크를 생성하여 커뮤니티 활동을 시작하세요</p>
                  <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    첫 태스크 만들기
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>태스크명</TableHead>
                      <TableHead>유형</TableHead>
                      <TableHead className="text-right">포인트</TableHead>
                      <TableHead className="text-right">토큰 보상</TableHead>
                      <TableHead className="text-right">완료 수</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead className="text-right">관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.map((task: CommunityTask) => (
                      <TableRow key={task.id} data-testid={`row-task-${task.id}`}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{task.name}</div>
                            {task.description && (
                              <div className="text-xs text-muted-foreground truncate max-w-xs">{task.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getTaskTypeLabel(task.taskType)}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">{task.pointsReward.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-mono">
                          {parseFloat(task.tokenReward) > 0 ? `${task.tokenReward} TBURN` : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {task.completionCount}
                          {task.maxCompletions && task.maxCompletions > 0 && (
                            <span className="text-muted-foreground">/{task.maxCompletions}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={task.isActive}
                            onCheckedChange={(checked) => toggleStatusMutation.mutate({ id: task.id, isActive: checked })}
                            data-testid={`switch-status-${task.id}`}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => openContributionsDialog(task)}
                              data-testid={`button-view-contributions-${task.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => openEditDialog(task)}
                              data-testid={`button-edit-${task.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => { setSelectedTask(task); setIsDeleteOpen(true); }}
                              data-testid={`button-delete-${task.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
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
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>승인 대기 중인 기여</CardTitle>
              <CardDescription>참여자들의 태스크 완료 요청을 검토하고 승인합니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>승인 대기 중인 기여가 없습니다</p>
                <p className="text-sm">새로운 기여 요청이 들어오면 여기에 표시됩니다</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>새 커뮤니티 태스크 생성</DialogTitle>
            <DialogDescription>참여자들이 완료할 수 있는 새로운 태스크를 만듭니다</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="taskType">태스크 유형</Label>
              <Select value={formData.taskType} onValueChange={(v) => setFormData(prev => ({ ...prev, taskType: v }))}>
                <SelectTrigger data-testid="select-task-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label} ({type.labelEn})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">태스크명 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="예: 트위터에서 TBURN 공유하기"
                data-testid="input-task-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="태스크 완료 방법을 상세히 설명해주세요"
                rows={3}
                data-testid="input-task-description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pointsReward">포인트 보상</Label>
                <Input
                  id="pointsReward"
                  type="number"
                  value={formData.pointsReward}
                  onChange={(e) => setFormData(prev => ({ ...prev, pointsReward: parseInt(e.target.value) || 0 }))}
                  data-testid="input-points-reward"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tokenReward">토큰 보상 (TBURN)</Label>
                <Input
                  id="tokenReward"
                  value={formData.tokenReward}
                  onChange={(e) => setFormData(prev => ({ ...prev, tokenReward: e.target.value }))}
                  placeholder="0"
                  data-testid="input-token-reward"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxCompletions">최대 완료 수 (0=무제한)</Label>
                <Input
                  id="maxCompletions"
                  type="number"
                  value={formData.maxCompletions}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxCompletions: parseInt(e.target.value) || 0 }))}
                  data-testid="input-max-completions"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dailyLimit">일일 제한 (0=무제한)</Label>
                <Input
                  id="dailyLimit"
                  type="number"
                  value={formData.dailyLimit}
                  onChange={(e) => setFormData(prev => ({ ...prev, dailyLimit: parseInt(e.target.value) || 0 }))}
                  data-testid="input-daily-limit"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                data-testid="switch-is-active"
              />
              <Label htmlFor="isActive">생성 즉시 활성화</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>취소</Button>
            <Button 
              onClick={() => createTaskMutation.mutate(formData)}
              disabled={!formData.name || createTaskMutation.isPending}
              data-testid="button-create-task"
            >
              {createTaskMutation.isPending ? "생성 중..." : "태스크 생성"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>태스크 수정</DialogTitle>
            <DialogDescription>태스크 정보를 수정합니다</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>태스크 유형</Label>
              <Select value={formData.taskType} onValueChange={(v) => setFormData(prev => ({ ...prev, taskType: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>태스크명</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>설명</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>포인트 보상</Label>
                <Input
                  type="number"
                  value={formData.pointsReward}
                  onChange={(e) => setFormData(prev => ({ ...prev, pointsReward: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>토큰 보상 (TBURN)</Label>
                <Input
                  value={formData.tokenReward}
                  onChange={(e) => setFormData(prev => ({ ...prev, tokenReward: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label>활성화</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>취소</Button>
            <Button 
              onClick={() => selectedTask && updateTaskMutation.mutate({ id: selectedTask.id, data: formData })}
              disabled={updateTaskMutation.isPending}
            >
              {updateTaskMutation.isPending ? "저장 중..." : "변경 저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isContributionsOpen} onOpenChange={handleContributionsDialogClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>기여 목록: {selectedTask?.name}</DialogTitle>
            <DialogDescription>이 태스크에 대한 참여자들의 기여 현황</DialogDescription>
          </DialogHeader>
          {contributionsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : contributions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>아직 기여가 없습니다</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>지갑 주소</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">포인트</TableHead>
                  <TableHead>제출일</TableHead>
                  <TableHead className="text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contributions.map((c: CommunityContribution) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs">
                      {c.walletAddress.slice(0, 10)}...{c.walletAddress.slice(-8)}
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        c.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                        c.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }>
                        {c.status === 'approved' ? '승인됨' : c.status === 'pending' ? '대기중' : '거절됨'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{c.pointsEarned}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString('ko-KR')}
                    </TableCell>
                    <TableCell className="text-right">
                      {c.status === 'pending' && selectedTask && (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => approveContributionMutation.mutate({ id: c.id, status: 'approved', taskId: selectedTask.id })}
                            data-testid={`button-approve-contribution-${c.id}`}
                          >
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => approveContributionMutation.mutate({ id: c.id, status: 'rejected', taskId: selectedTask.id })}
                            data-testid={`button-reject-contribution-${c.id}`}
                          >
                            <XCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      )}
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
            <DialogTitle>태스크 삭제 확인</DialogTitle>
            <DialogDescription>
              정말로 "{selectedTask?.name}" 태스크를 삭제하시겠습니까?
              이 작업은 되돌릴 수 없으며, 관련된 모든 기여 기록도 함께 삭제될 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleDeleteDialogClose(false)} data-testid="button-cancel-delete">
              취소
            </Button>
            <Button 
              variant="destructive"
              onClick={() => selectedTask && deleteTaskMutation.mutate(selectedTask.id)}
              disabled={deleteTaskMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteTaskMutation.isPending ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
