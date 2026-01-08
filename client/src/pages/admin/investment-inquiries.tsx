import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Users, 
  Mail,
  Building,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Phone,
  Trash2,
  Eye,
  Filter,
  Search,
  RefreshCw,
  TrendingUp,
  Loader2
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface InvestmentInquiry {
  id: number;
  name: string;
  email: string;
  company: string | null;
  investmentRound: string;
  investmentAmount: string | null;
  message: string | null;
  status: string;
  adminNotes: string | null;
  processedBy: string | null;
  processedAt: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  referrer: string | null;
  createdAt: string;
  updatedAt: string;
}

interface InquiryStats {
  total: number;
  pending: number;
  contacted: number;
  approved: number;
  rejected: number;
  byRound: Record<string, number>;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  contacted: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  approved: "bg-green-500/20 text-green-400 border-green-500/50",
  rejected: "bg-red-500/20 text-red-400 border-red-500/50",
  completed: "bg-purple-500/20 text-purple-400 border-purple-500/50",
};

const roundColors: Record<string, string> = {
  seed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
  private: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  public: "bg-orange-500/20 text-orange-400 border-orange-500/50",
};

export default function InvestmentInquiriesPage() {
  const [selectedInquiry, setSelectedInquiry] = useState<InvestmentInquiry | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRound, setFilterRound] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [adminNotes, setAdminNotes] = useState("");
  const { toast } = useToast();

  const { data, isLoading, refetch } = useQuery<{ success: boolean; data: { inquiries: InvestmentInquiry[]; stats: InquiryStats } }>({
    queryKey: ['/api/admin/investment-inquiries'],
  });

  const inquiries = data?.data?.inquiries || [];
  const stats = data?.data?.stats || { total: 0, pending: 0, contacted: 0, approved: 0, rejected: 0, byRound: {} };

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, adminNotes }: { id: number; status?: string; adminNotes?: string }) => {
      return apiRequest('PATCH', `/api/admin/investment-inquiries/${id}`, { status, adminNotes });
    },
    onSuccess: () => {
      toast({ title: "문의 상태 업데이트", description: "성공적으로 업데이트되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/investment-inquiries'] });
      setDetailDialogOpen(false);
    },
    onError: () => {
      toast({ title: "오류", description: "업데이트에 실패했습니다.", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/admin/investment-inquiries/${id}`);
    },
    onSuccess: () => {
      toast({ title: "문의 삭제", description: "성공적으로 삭제되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/investment-inquiries'] });
      setDeleteDialogOpen(false);
    },
    onError: () => {
      toast({ title: "오류", description: "삭제에 실패했습니다.", variant: "destructive" });
    }
  });

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = searchQuery === "" || 
      inquiry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inquiry.company?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRound = filterRound === "all" || inquiry.investmentRound === filterRound;
    const matchesStatus = filterStatus === "all" || inquiry.status === filterStatus;
    return matchesSearch && matchesRound && matchesStatus;
  });

  const handleViewDetail = (inquiry: InvestmentInquiry) => {
    setSelectedInquiry(inquiry);
    setAdminNotes(inquiry.adminNotes || "");
    setDetailDialogOpen(true);
  };

  const handleStatusChange = (status: string) => {
    if (selectedInquiry) {
      updateMutation.mutate({ id: selectedInquiry.id, status, adminNotes });
    }
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">투자 문의 관리</h1>
            <p className="text-muted-foreground mt-1">시드/프라이빗/퍼블릭 라운드 투자 신청 관리</p>
          </div>
          <Button onClick={() => refetch()} variant="outline" size="sm" data-testid="button-refresh">
            <RefreshCw className="w-4 h-4 mr-2" />
            새로고침
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">전체 문의</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">대기중</p>
                  <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">연락완료</p>
                  <p className="text-2xl font-bold text-blue-500">{stats.contacted}</p>
                </div>
                <Phone className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">승인</p>
                  <p className="text-2xl font-bold text-green-500">{stats.approved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">거절</p>
                  <p className="text-2xl font-bold text-red-500">{stats.rejected}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              라운드별 통계
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-emerald-400 font-medium">Seed</span>
                <Badge variant="outline" className="bg-emerald-500/20">{stats.byRound?.seed || 0}</Badge>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <span className="text-blue-400 font-medium">Private</span>
                <Badge variant="outline" className="bg-blue-500/20">{stats.byRound?.private || 0}</Badge>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/30">
                <span className="text-orange-400 font-medium">Public</span>
                <Badge variant="outline" className="bg-orange-500/20">{stats.byRound?.public || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>투자 문의 목록</CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-[200px]"
                    data-testid="input-search"
                  />
                </div>
                <Select value={filterRound} onValueChange={setFilterRound}>
                  <SelectTrigger className="w-[150px]" data-testid="select-round-filter">
                    <SelectValue placeholder="라운드 필터" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 라운드</SelectItem>
                    <SelectItem value="seed">Seed</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]" data-testid="select-status-filter">
                    <SelectValue placeholder="상태 필터" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 상태</SelectItem>
                    <SelectItem value="pending">대기중</SelectItem>
                    <SelectItem value="contacted">연락완료</SelectItem>
                    <SelectItem value="approved">승인</SelectItem>
                    <SelectItem value="rejected">거절</SelectItem>
                    <SelectItem value="completed">완료</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>이름</TableHead>
                      <TableHead>이메일</TableHead>
                      <TableHead>회사</TableHead>
                      <TableHead>라운드</TableHead>
                      <TableHead>투자금액</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>신청일</TableHead>
                      <TableHead>액션</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInquiries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          투자 문의가 없습니다.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInquiries.map((inquiry) => (
                        <TableRow key={inquiry.id} data-testid={`row-inquiry-${inquiry.id}`}>
                          <TableCell className="font-medium">{inquiry.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              {inquiry.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            {inquiry.company ? (
                              <div className="flex items-center gap-2">
                                <Building className="w-4 h-4 text-muted-foreground" />
                                {inquiry.company}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={roundColors[inquiry.investmentRound] || ""}>
                              {inquiry.investmentRound.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {inquiry.investmentAmount ? (
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4 text-green-500" />
                                {inquiry.investmentAmount}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">미정</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusColors[inquiry.status] || ""}>
                              {inquiry.status === 'pending' && '대기중'}
                              {inquiry.status === 'contacted' && '연락완료'}
                              {inquiry.status === 'approved' && '승인'}
                              {inquiry.status === 'rejected' && '거절'}
                              {inquiry.status === 'completed' && '완료'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {formatDistanceToNow(new Date(inquiry.createdAt), { addSuffix: true, locale: ko })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewDetail(inquiry)}
                                data-testid={`button-view-${inquiry.id}`}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-500 hover:text-red-600"
                                onClick={() => handleDelete(inquiry.id)}
                                data-testid={`button-delete-${inquiry.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>투자 문의 상세</DialogTitle>
            <DialogDescription>
              투자 문의 정보를 확인하고 상태를 변경할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">이름</Label>
                  <p className="font-medium">{selectedInquiry.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">이메일</Label>
                  <p className="font-medium">{selectedInquiry.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">회사</Label>
                  <p className="font-medium">{selectedInquiry.company || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">투자 라운드</Label>
                  <Badge variant="outline" className={roundColors[selectedInquiry.investmentRound] || ""}>
                    {selectedInquiry.investmentRound.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">예상 투자금액</Label>
                  <p className="font-medium">{selectedInquiry.investmentAmount || '미정'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">현재 상태</Label>
                  <Badge variant="outline" className={statusColors[selectedInquiry.status] || ""}>
                    {selectedInquiry.status}
                  </Badge>
                </div>
              </div>
              
              {selectedInquiry.message && (
                <div>
                  <Label className="text-muted-foreground">문의 내용</Label>
                  <div className="mt-2 p-4 rounded-lg bg-muted/50">
                    <p className="whitespace-pre-wrap">{selectedInquiry.message}</p>
                  </div>
                </div>
              )}

              <div>
                <Label className="text-muted-foreground">관리자 메모</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="관리자 메모를 입력하세요..."
                  className="mt-2"
                  rows={3}
                  data-testid="input-admin-notes"
                />
              </div>

              <div>
                <Label className="text-muted-foreground">상태 변경</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button
                    size="sm"
                    variant={selectedInquiry.status === 'pending' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange('pending')}
                    disabled={updateMutation.isPending}
                    data-testid="button-status-pending"
                  >
                    대기중
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedInquiry.status === 'contacted' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange('contacted')}
                    disabled={updateMutation.isPending}
                    data-testid="button-status-contacted"
                  >
                    연락완료
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedInquiry.status === 'approved' ? 'default' : 'outline'}
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleStatusChange('approved')}
                    disabled={updateMutation.isPending}
                    data-testid="button-status-approved"
                  >
                    승인
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedInquiry.status === 'rejected' ? 'default' : 'outline'}
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => handleStatusChange('rejected')}
                    disabled={updateMutation.isPending}
                    data-testid="button-status-rejected"
                  >
                    거절
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedInquiry.status === 'completed' ? 'default' : 'outline'}
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => handleStatusChange('completed')}
                    disabled={updateMutation.isPending}
                    data-testid="button-status-completed"
                  >
                    완료
                  </Button>
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
                <p>신청일: {new Date(selectedInquiry.createdAt).toLocaleString('ko-KR')}</p>
                {selectedInquiry.processedAt && (
                  <p>처리일: {new Date(selectedInquiry.processedAt).toLocaleString('ko-KR')}</p>
                )}
                {selectedInquiry.ipAddress && <p>IP: {selectedInquiry.ipAddress}</p>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>투자 문의 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 투자 문의를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : '삭제'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
