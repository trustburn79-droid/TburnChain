import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Search,
  RefreshCw,
  Shield,
  Server,
  MapPin,
  Coins,
  Mail,
  Building,
  Copy,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";

interface Registration {
  id: string;
  operatorAddress: string;
  operatorName: string;
  region: string;
  stakeAmount: string;
  tier: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  submittedAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
  rejectionReason?: string;
  metadata?: {
    organization?: string;
    email?: string;
    hostingProvider?: string;
    hardware?: any;
    security?: any;
  };
  nodeId?: string;
}

interface RegistrationsResponse {
  success: boolean;
  data: {
    registrations: Registration[];
    total: number;
    summary: {
      pending: number;
      underReview: number;
      approved: number;
      rejected: number;
    };
  };
}

const STATUS_CONFIG = {
  pending: { label: '대기', color: 'bg-yellow-500/20 text-yellow-500', icon: Clock },
  under_review: { label: '검토중', color: 'bg-blue-500/20 text-blue-500', icon: Eye },
  approved: { label: '승인됨', color: 'bg-emerald-500/20 text-emerald-500', icon: CheckCircle },
  rejected: { label: '거부됨', color: 'bg-red-500/20 text-red-500', icon: XCircle },
};

const TIER_CONFIG = {
  genesis: { label: 'Genesis', color: 'bg-purple-500/20 text-purple-400' },
  pioneer: { label: 'Pioneer', color: 'bg-orange-500/20 text-orange-400' },
  standard: { label: 'Standard', color: 'bg-blue-500/20 text-blue-400' },
  community: { label: 'Community', color: 'bg-green-500/20 text-green-400' },
};

const WEI_PER_TBURN = BigInt("1000000000000000000");

function formatStake(weiAmount: string): string {
  try {
    const wei = BigInt(weiAmount);
    const tburn = wei / WEI_PER_TBURN;
    return tburn.toLocaleString() + ' TBURN';
  } catch {
    return weiAmount;
  }
}

export default function AdminValidatorRegistrations() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvedApiKey, setApprovedApiKey] = useState('');

  const { data, isLoading, refetch } = useQuery<RegistrationsResponse>({
    queryKey: ['/api/external-validators/admin/registrations'],
    refetchInterval: 30000,
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('POST', `/api/external-validators/admin/registrations/${id}/approve`);
      return response.json();
    },
    onSuccess: (result) => {
      if (result.success) {
        setApprovedApiKey(result.data.apiKey || '');
        toast({
          title: '승인 완료',
          description: '검증인 등록이 승인되었습니다. API 키가 생성되었습니다.',
        });
        queryClient.invalidateQueries({ queryKey: ['/api/external-validators/admin/registrations'] });
      } else {
        toast({
          title: '승인 실패',
          description: result.error,
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: '오류',
        description: error.message || '승인 처리 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await apiRequest('POST', `/api/external-validators/admin/registrations/${id}/reject`, { reason });
      return response.json();
    },
    onSuccess: (result) => {
      if (result.success) {
        setShowRejectDialog(false);
        setRejectionReason('');
        toast({
          title: '거부 완료',
          description: '검증인 등록이 거부되었습니다.',
        });
        queryClient.invalidateQueries({ queryKey: ['/api/external-validators/admin/registrations'] });
      } else {
        toast({
          title: '거부 실패',
          description: result.error,
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: '오류',
        description: error.message || '거부 처리 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    },
  });

  const registrations = data?.data?.registrations || [];
  const summary = data?.data?.summary || { pending: 0, underReview: 0, approved: 0, rejected: 0 };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesStatus = statusFilter === 'all' || reg.status === statusFilter;
    const matchesSearch = !searchTerm || 
      reg.operatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.operatorAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.metadata?.organization?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleApprove = (reg: Registration) => {
    setSelectedRegistration(reg);
    setApprovedApiKey('');
    setShowApproveDialog(true);
  };

  const handleReject = (reg: Registration) => {
    setSelectedRegistration(reg);
    setRejectionReason('');
    setShowRejectDialog(true);
  };

  const handleViewDetails = (reg: Registration) => {
    setSelectedRegistration(reg);
    setShowDetailDialog(true);
  };

  const confirmApprove = () => {
    if (selectedRegistration) {
      approveMutation.mutate(selectedRegistration.id);
    }
  };

  const confirmReject = () => {
    if (selectedRegistration && rejectionReason) {
      rejectMutation.mutate({ id: selectedRegistration.id, reason: rejectionReason });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: '복사됨', description: 'API 키가 클립보드에 복사되었습니다.' });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">검증인 등록 관리</h1>
          <p className="text-muted-foreground">외부 검증인 등록 신청을 검토하고 승인/거부합니다.</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} data-testid="button-refresh">
          <RefreshCw className="h-4 w-4 mr-2" />
          새로고침
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">대기</p>
                <p className="text-2xl font-bold">{summary.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Eye className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">검토중</p>
                <p className="text-2xl font-bold">{summary.underReview}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">승인됨</p>
                <p className="text-2xl font-bold">{summary.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">거부됨</p>
                <p className="text-2xl font-bold">{summary.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>등록 신청 목록</CardTitle>
          <CardDescription>검증인 등록 신청을 검토하고 승인 또는 거부할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="노드명, 주소, 조직명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="pending">대기</SelectItem>
                <SelectItem value="under_review">검토중</SelectItem>
                <SelectItem value="approved">승인됨</SelectItem>
                <SelectItem value="rejected">거부됨</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Server className="h-12 w-12 mb-4 opacity-50" />
              <p>등록 신청이 없습니다.</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>노드명</TableHead>
                    <TableHead>주소</TableHead>
                    <TableHead>조직</TableHead>
                    <TableHead>지역</TableHead>
                    <TableHead>티어</TableHead>
                    <TableHead>스테이킹</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>신청일</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((reg) => {
                    const StatusIcon = STATUS_CONFIG[reg.status]?.icon || Clock;
                    return (
                      <TableRow key={reg.id} data-testid={`row-registration-${reg.id}`}>
                        <TableCell className="font-medium">{reg.operatorName}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {reg.operatorAddress.slice(0, 8)}...{reg.operatorAddress.slice(-6)}
                        </TableCell>
                        <TableCell>{reg.metadata?.organization || '-'}</TableCell>
                        <TableCell className="capitalize">{reg.region.replace('-', ' ')}</TableCell>
                        <TableCell>
                          <Badge className={TIER_CONFIG[reg.tier as keyof typeof TIER_CONFIG]?.color || ''}>
                            {TIER_CONFIG[reg.tier as keyof typeof TIER_CONFIG]?.label || reg.tier}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatStake(reg.stakeAmount)}</TableCell>
                        <TableCell>
                          <Badge className={STATUS_CONFIG[reg.status]?.color || ''}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {STATUS_CONFIG[reg.status]?.label || reg.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(reg.submittedAt), 'yyyy-MM-dd HH:mm')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetails(reg)}
                              data-testid={`button-view-${reg.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {(reg.status === 'pending' || reg.status === 'under_review') && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleApprove(reg)}
                                  className="text-emerald-500 hover:text-emerald-600"
                                  data-testid={`button-approve-${reg.id}`}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleReject(reg)}
                                  className="text-red-500 hover:text-red-600"
                                  data-testid={`button-reject-${reg.id}`}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>등록 신청 상세</DialogTitle>
            <DialogDescription>검증인 등록 신청 정보를 확인합니다.</DialogDescription>
          </DialogHeader>
          {selectedRegistration && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Server className="h-4 w-4" /> 노드명
                  </p>
                  <p className="font-medium">{selectedRegistration.operatorName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Building className="h-4 w-4" /> 조직
                  </p>
                  <p className="font-medium">{selectedRegistration.metadata?.organization || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Shield className="h-4 w-4" /> 운영자 주소
                  </p>
                  <p className="font-mono text-sm break-all">{selectedRegistration.operatorAddress}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-4 w-4" /> 이메일
                  </p>
                  <p className="font-medium">{selectedRegistration.metadata?.email || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> 지역
                  </p>
                  <p className="font-medium capitalize">{selectedRegistration.region.replace('-', ' ')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Coins className="h-4 w-4" /> 스테이킹 금액
                  </p>
                  <p className="font-medium">{formatStake(selectedRegistration.stakeAmount)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">티어:</p>
                <Badge className={TIER_CONFIG[selectedRegistration.tier as keyof typeof TIER_CONFIG]?.color || ''}>
                  {TIER_CONFIG[selectedRegistration.tier as keyof typeof TIER_CONFIG]?.label || selectedRegistration.tier}
                </Badge>
                <p className="text-sm text-muted-foreground ml-4">상태:</p>
                <Badge className={STATUS_CONFIG[selectedRegistration.status]?.color || ''}>
                  {STATUS_CONFIG[selectedRegistration.status]?.label || selectedRegistration.status}
                </Badge>
              </div>

              {selectedRegistration.metadata?.hardware && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">하드웨어 사양</p>
                  <div className="bg-muted/50 p-3 rounded-lg text-sm">
                    <p>CPU: {selectedRegistration.metadata.hardware.cpu || '-'}</p>
                    <p>메모리: {selectedRegistration.metadata.hardware.memory || '-'}</p>
                    <p>스토리지: {selectedRegistration.metadata.hardware.storage || '-'}</p>
                  </div>
                </div>
              )}

              {selectedRegistration.rejectionReason && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4 text-red-500" /> 거부 사유
                  </p>
                  <p className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm">
                    {selectedRegistration.rejectionReason}
                  </p>
                </div>
              )}

              {selectedRegistration.nodeId && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">노드 ID</p>
                  <p className="font-mono text-sm bg-muted/50 p-2 rounded">{selectedRegistration.nodeId}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>등록 승인</DialogTitle>
            <DialogDescription>
              이 검증인 등록을 승인하시겠습니까? 승인 시 API 키가 생성됩니다.
            </DialogDescription>
          </DialogHeader>
          {selectedRegistration && (
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p><span className="text-muted-foreground">노드명:</span> {selectedRegistration.operatorName}</p>
                <p><span className="text-muted-foreground">주소:</span> {selectedRegistration.operatorAddress.slice(0, 16)}...</p>
                <p><span className="text-muted-foreground">티어:</span> {TIER_CONFIG[selectedRegistration.tier as keyof typeof TIER_CONFIG]?.label}</p>
              </div>

              {approvedApiKey && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-lg space-y-2">
                  <p className="text-emerald-500 font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" /> API 키가 생성되었습니다
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      value={approvedApiKey}
                      readOnly
                      className="font-mono text-sm"
                      data-testid="input-api-key"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(approvedApiKey)}
                      data-testid="button-copy-api-key"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    이 API 키를 안전하게 보관하세요. 다시 표시되지 않습니다.
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              {approvedApiKey ? '닫기' : '취소'}
            </Button>
            {!approvedApiKey && (
              <Button 
                onClick={confirmApprove} 
                disabled={approveMutation.isPending}
                data-testid="button-confirm-approve"
              >
                {approveMutation.isPending ? '처리중...' : '승인'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>등록 거부</DialogTitle>
            <DialogDescription>
              이 검증인 등록을 거부하시겠습니까? 거부 사유를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          {selectedRegistration && (
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p><span className="text-muted-foreground">노드명:</span> {selectedRegistration.operatorName}</p>
                <p><span className="text-muted-foreground">주소:</span> {selectedRegistration.operatorAddress.slice(0, 16)}...</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">거부 사유 *</label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="거부 사유를 입력하세요..."
                  className="min-h-[100px]"
                  data-testid="textarea-rejection-reason"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              취소
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmReject} 
              disabled={rejectMutation.isPending || !rejectionReason.trim()}
              data-testid="button-confirm-reject"
            >
              {rejectMutation.isPending ? '처리중...' : '거부'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
