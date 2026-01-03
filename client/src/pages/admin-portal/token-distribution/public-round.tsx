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
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Globe, Users, DollarSign, TrendingUp, Search, RefreshCw, ArrowLeft, Plus, Eye, Edit, Coins, CheckCircle, CreditCard, Target, Wallet } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface PublicParticipant {
  id: string;
  walletAddress: string;
  email: string | null;
  country: string | null;
  investmentAmount: string;
  investmentCurrency: string;
  tokenPrice: string;
  tokenAmount: string;
  distributedAmount: string;
  tgePercentage: number;
  vestingMonths: number;
  txHash: string | null;
  kycVerified: boolean;
  kycVerifiedDate: string | null;
  paymentReceived: boolean;
  paymentReceivedDate: string | null;
  status: string;
  referralCode: string | null;
  source: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PublicPayout {
  id: string;
  participantId: string;
  amount: string;
  payoutType: string;
  txHash: string | null;
  status: string;
  scheduledDate: string | null;
  processedDate: string | null;
  notes: string | null;
  createdAt: string;
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

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "대기", color: "bg-yellow-500/20 text-yellow-400" },
  kyc_pending: { label: "KYC 대기", color: "bg-orange-500/20 text-orange-400" },
  payment_pending: { label: "입금 대기", color: "bg-blue-500/20 text-blue-400" },
  confirmed: { label: "확정", color: "bg-emerald-500/20 text-emerald-400" },
  distributed: { label: "배포완료", color: "bg-purple-500/20 text-purple-400" },
  cancelled: { label: "취소", color: "bg-red-500/20 text-red-400" },
  refunded: { label: "환불", color: "bg-gray-500/20 text-gray-400" },
};

const PAYOUT_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: "대기", color: "bg-yellow-500/20 text-yellow-400" },
  scheduled: { label: "예정", color: "bg-blue-500/20 text-blue-400" },
  processing: { label: "처리중", color: "bg-purple-500/20 text-purple-400" },
  completed: { label: "완료", color: "bg-emerald-500/20 text-emerald-400" },
  failed: { label: "실패", color: "bg-red-500/20 text-red-400" },
};

const CURRENCIES = [
  { value: "usdt", label: "USDT" },
  { value: "usdc", label: "USDC" },
  { value: "eth", label: "ETH" },
  { value: "btc", label: "BTC" },
  { value: "krw", label: "KRW (원화)" },
];

const SOURCES = [
  { value: "website", label: "공식 웹사이트" },
  { value: "twitter", label: "트위터" },
  { value: "telegram", label: "텔레그램" },
  { value: "discord", label: "디스코드" },
  { value: "referral", label: "추천" },
  { value: "exchange", label: "거래소" },
  { value: "other", label: "기타" },
];

const TOKEN_PRICE = 0.02;
const HARD_CAP = 5000000;

export default function AdminPublicRound() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddPayoutOpen, setIsAddPayoutOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<PublicParticipant | null>(null);
  
  const [formData, setFormData] = useState({
    walletAddress: "",
    email: "",
    country: "",
    investmentAmount: "100",
    investmentCurrency: "usdt",
    tokenPrice: "0.02",
    tgePercentage: 25,
    vestingMonths: 6,
    kycVerified: false,
    paymentReceived: false,
    txHash: "",
    referralCode: "",
    source: "website",
    notes: "",
  });

  const [payoutForm, setPayoutForm] = useState({
    amount: "10000000000000000000000",
    payoutType: "tge",
    scheduledDate: "",
    notes: "",
  });

  const { data: participantsData, isLoading, refetch } = useQuery<{ success: boolean; data: { participants: PublicParticipant[]; stats: any } }>({
    queryKey: ['/api/admin/token-programs/public-round/participants'],
  });

  const { data: participantDetailData, isLoading: detailLoading } = useQuery<{ success: boolean; data: { participant: PublicParticipant; payouts: PublicPayout[] } }>({
    queryKey: ['/api/admin/token-programs/public-round/participants', selectedParticipant?.id],
    enabled: !!selectedParticipant && isDetailOpen,
  });

  const createParticipantMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const investmentUsd = parseFloat(data.investmentAmount);
      const tokenAmount = Math.floor((investmentUsd / TOKEN_PRICE) * 1e18);
      return apiRequest('POST', '/api/admin/token-programs/public-round/participants', {
        ...data,
        tokenAmount: tokenAmount.toString(),
        distributedAmount: "0",
        status: "pending",
      });
    },
    onSuccess: () => {
      toast({ title: "참여자 등록 완료", description: "새 퍼블릭 세일 참여자가 등록되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/public-round/participants'] });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "오류", description: "참여자 등록에 실패했습니다.", variant: "destructive" });
    }
  });

  const updateParticipantMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PublicParticipant> }) => {
      return apiRequest('PATCH', `/api/admin/token-programs/public-round/participants/${id}`, data);
    },
    onSuccess: () => {
      toast({ title: "참여자 수정 완료", description: "참여자 정보가 수정되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/public-round/participants'] });
      setIsEditOpen(false);
      setSelectedParticipant(null);
    },
    onError: () => {
      toast({ title: "오류", description: "참여자 수정에 실패했습니다.", variant: "destructive" });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest('PATCH', `/api/admin/token-programs/public-round/participants/${id}`, { status });
    },
    onSuccess: () => {
      toast({ title: "상태 변경 완료", description: "참여자 상태가 변경되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/public-round/participants'] });
      if (selectedParticipant) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/public-round/participants', selectedParticipant.id] });
      }
    },
  });

  const addPayoutMutation = useMutation({
    mutationFn: async ({ participantId, data }: { participantId: string; data: typeof payoutForm }) => {
      return apiRequest('POST', `/api/admin/token-programs/public-round/participants/${participantId}/payouts`, {
        ...data,
        status: "pending",
      });
    },
    onSuccess: () => {
      toast({ title: "지급 등록 완료", description: "새 지급 일정이 등록되었습니다." });
      if (selectedParticipant) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/public-round/participants', selectedParticipant.id] });
      }
      setIsAddPayoutOpen(false);
      setPayoutForm({ amount: "10000000000000000000000", payoutType: "tge", scheduledDate: "", notes: "" });
    },
    onError: () => {
      toast({ title: "오류", description: "지급 등록에 실패했습니다.", variant: "destructive" });
    }
  });

  const updatePayoutMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest('PATCH', `/api/admin/token-programs/public-round/payouts/${id}`, { 
        status,
        ...(status === 'completed' ? { processedDate: new Date().toISOString() } : {}),
      });
    },
    onSuccess: () => {
      toast({ title: "지급 상태 변경", description: "지급 상태가 변경되었습니다." });
      if (selectedParticipant) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/public-round/participants', selectedParticipant.id] });
      }
    },
  });

  const resetForm = () => {
    setFormData({
      walletAddress: "",
      email: "",
      country: "",
      investmentAmount: "100",
      investmentCurrency: "usdt",
      tokenPrice: "0.02",
      tgePercentage: 25,
      vestingMonths: 6,
      kycVerified: false,
      paymentReceived: false,
      txHash: "",
      referralCode: "",
      source: "website",
      notes: "",
    });
  };

  const openEditDialog = (participant: PublicParticipant) => {
    setSelectedParticipant(participant);
    setFormData({
      walletAddress: participant.walletAddress,
      email: participant.email || "",
      country: participant.country || "",
      investmentAmount: participant.investmentAmount,
      investmentCurrency: participant.investmentCurrency,
      tokenPrice: participant.tokenPrice,
      tgePercentage: participant.tgePercentage,
      vestingMonths: participant.vestingMonths,
      kycVerified: participant.kycVerified,
      paymentReceived: participant.paymentReceived,
      txHash: participant.txHash || "",
      referralCode: participant.referralCode || "",
      source: participant.source || "website",
      notes: participant.notes || "",
    });
    setIsEditOpen(true);
  };

  const openDetailDialog = (participant: PublicParticipant) => {
    setSelectedParticipant(participant);
    setIsDetailOpen(true);
  };

  const stats = participantsData?.data?.stats || { totalParticipants: 0, confirmedParticipants: 0, raisedAmount: "0", totalTokens: "0", hardCap: "5000000", progress: 0 };
  const participantList = Array.isArray(participantsData?.data?.participants) ? participantsData.data.participants : [];
  const payouts = participantDetailData?.data?.payouts || [];

  const filteredParticipants = participantList.filter(participant => {
    const matchesSearch = searchQuery === "" || 
      participant.walletAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (participant.email && participant.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || participant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const calculatedTokens = Math.floor((parseFloat(formData.investmentAmount || '0') / TOKEN_PRICE) * 1e18);

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="admin-public-round-page">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/admin/token-distribution")} data-testid="button-back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            퍼블릭 라운드 관리
          </h1>
          <p className="text-muted-foreground">Public Round Management - 1월 3일 정식 오픈 | 토큰 가격: $0.02 | 하드캡: $5M</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh">
          <RefreshCw className="mr-2 h-4 w-4" />
          새로고침
        </Button>
        <Button onClick={() => { resetForm(); setIsCreateOpen(true); }} data-testid="button-add-participant">
          <Plus className="mr-2 h-4 w-4" />
          새 참여자
        </Button>
      </div>

      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
            <div>
              <div className="text-sm text-muted-foreground mb-1">퍼블릭 세일 진행률</div>
              <div className="text-3xl font-bold">{stats.progress}%</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">모금액 / 하드캡</div>
              <div className="text-2xl font-bold">{formatUSD(stats.raisedAmount)} / $5M</div>
            </div>
          </div>
          <Progress value={stats.progress} className="h-3" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total-participants">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">총 참여자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalParticipants}</div>
            <p className="text-xs text-muted-foreground">Total Participants</p>
          </CardContent>
        </Card>
        <Card data-testid="card-confirmed-participants">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">확정 참여자</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmedParticipants}</div>
            <p className="text-xs text-muted-foreground">Confirmed</p>
          </CardContent>
        </Card>
        <Card data-testid="card-token-price">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">토큰 가격</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.02</div>
            <p className="text-xs text-muted-foreground">Token Price</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-tokens">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">총 토큰</CardTitle>
            <Coins className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTBURN(stats.totalTokens)}</div>
            <p className="text-xs text-muted-foreground">Total TBURN</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>퍼블릭 세일 참여자 목록</CardTitle>
              <CardDescription>Public Sale Participants - 일반 투자자 관리</CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-28" data-testid="select-status-filter">
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="pending">대기</SelectItem>
                  <SelectItem value="kyc_pending">KYC 대기</SelectItem>
                  <SelectItem value="payment_pending">입금 대기</SelectItem>
                  <SelectItem value="confirmed">확정</SelectItem>
                  <SelectItem value="distributed">배포완료</SelectItem>
                  <SelectItem value="cancelled">취소</SelectItem>
                  <SelectItem value="refunded">환불</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="지갑/이메일 검색..."
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
          ) : filteredParticipants.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>퍼블릭 라운드 참여자 데이터가 없습니다</p>
              <p className="text-sm">No public round participants found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>지갑 주소</TableHead>
                  <TableHead className="text-right">투자 금액</TableHead>
                  <TableHead className="text-right">토큰 수량</TableHead>
                  <TableHead className="text-center">KYC</TableHead>
                  <TableHead className="text-center">입금</TableHead>
                  <TableHead>참여일</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticipants.map((participant) => (
                  <TableRow key={participant.id} data-testid={`row-participant-${participant.id}`}>
                    <TableCell className="font-mono text-sm">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div>{participant.walletAddress.slice(0, 10)}...{participant.walletAddress.slice(-6)}</div>
                          {participant.email && <div className="text-xs text-muted-foreground">{participant.email}</div>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatUSD(participant.investmentAmount)}
                      <div className="text-xs text-muted-foreground">{participant.investmentCurrency.toUpperCase()}</div>
                    </TableCell>
                    <TableCell className="text-right">{formatTBURN(participant.tokenAmount)} TBURN</TableCell>
                    <TableCell className="text-center">
                      {participant.kycVerified ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500 mx-auto" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {participant.paymentReceived ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500 mx-auto" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(participant.createdAt).toLocaleDateString('ko-KR')}
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={participant.status} 
                        onValueChange={(v) => updateStatusMutation.mutate({ id: participant.id, status: v })}
                      >
                        <SelectTrigger className="w-28 h-8" data-testid={`select-status-${participant.id}`}>
                          <Badge className={STATUS_LABELS[participant.status]?.color || 'bg-gray-500/20'}>
                            {STATUS_LABELS[participant.status]?.label || participant.status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">대기</SelectItem>
                          <SelectItem value="kyc_pending">KYC 대기</SelectItem>
                          <SelectItem value="payment_pending">입금 대기</SelectItem>
                          <SelectItem value="confirmed">확정</SelectItem>
                          <SelectItem value="distributed">배포완료</SelectItem>
                          <SelectItem value="cancelled">취소</SelectItem>
                          <SelectItem value="refunded">환불</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openDetailDialog(participant)} data-testid={`button-detail-${participant.id}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(participant)} data-testid={`button-edit-${participant.id}`}>
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
            <DialogTitle>새 퍼블릭 세일 참여자</DialogTitle>
            <DialogDescription>새로운 퍼블릭 라운드 참여자를 등록합니다. 최소 투자: $100</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="walletAddress">지갑 주소 *</Label>
              <Input
                id="walletAddress"
                value={formData.walletAddress}
                onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                placeholder="0x... 또는 tb1..."
                data-testid="input-wallet-address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="country">국가</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="KR, US, JP..."
                  data-testid="input-country"
                />
              </div>
            </div>
            <div className="border-t pt-4">
              <h4 className="font-medium mb-4 flex items-center gap-2"><DollarSign className="h-4 w-4" /> 투자 정보</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="investmentAmount">투자 금액 (USD)</Label>
                  <Input
                    id="investmentAmount"
                    type="number"
                    value={formData.investmentAmount}
                    onChange={(e) => setFormData({ ...formData, investmentAmount: e.target.value })}
                    data-testid="input-investment-amount"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>결제 통화</Label>
                  <Select value={formData.investmentCurrency} onValueChange={(v) => setFormData({ ...formData, investmentCurrency: v })}>
                    <SelectTrigger data-testid="select-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>예상 토큰 수량</Label>
                  <div className="h-9 px-3 py-2 border rounded-md bg-muted">
                    {formatTBURN(calculatedTokens.toString())} TBURN
                  </div>
                  <p className="text-xs text-muted-foreground">토큰 가격: $0.02</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>유입 경로</Label>
                <Select value={formData.source} onValueChange={(v) => setFormData({ ...formData, source: v })}>
                  <SelectTrigger data-testid="select-source">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCES.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="referralCode">추천 코드</Label>
                <Input
                  id="referralCode"
                  value={formData.referralCode}
                  onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                  placeholder="REF-XXXX"
                  data-testid="input-referral-code"
                />
              </div>
            </div>
            <div className="border-t pt-4">
              <h4 className="font-medium mb-4 flex items-center gap-2"><CheckCircle className="h-4 w-4" /> 확인 상태</h4>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="kycVerified"
                    checked={formData.kycVerified}
                    onCheckedChange={(c) => setFormData({ ...formData, kycVerified: !!c })}
                    data-testid="checkbox-kyc"
                  />
                  <Label htmlFor="kycVerified">KYC 인증 완료</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="paymentReceived"
                    checked={formData.paymentReceived}
                    onCheckedChange={(c) => setFormData({ ...formData, paymentReceived: !!c })}
                    data-testid="checkbox-payment"
                  />
                  <Label htmlFor="paymentReceived">입금 확인 완료</Label>
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="txHash">결제 트랜잭션</Label>
              <Input
                id="txHash"
                value={formData.txHash}
                onChange={(e) => setFormData({ ...formData, txHash: e.target.value })}
                placeholder="0x..."
                data-testid="input-tx-hash"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} data-testid="button-cancel-create">
              취소
            </Button>
            <Button 
              onClick={() => createParticipantMutation.mutate(formData)}
              disabled={!formData.walletAddress || createParticipantMutation.isPending}
              data-testid="button-submit-create"
            >
              {createParticipantMutation.isPending ? "등록 중..." : "등록"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>참여자 수정</DialogTitle>
            <DialogDescription>참여자 정보를 수정합니다.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>지갑 주소</Label>
              <Input
                value={formData.walletAddress}
                onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                data-testid="input-edit-wallet-address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>투자 금액 (USD)</Label>
                <Input
                  type="number"
                  value={formData.investmentAmount}
                  onChange={(e) => setFormData({ ...formData, investmentAmount: e.target.value })}
                  data-testid="input-edit-investment-amount"
                />
              </div>
              <div className="grid gap-2">
                <Label>이메일</Label>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  data-testid="input-edit-email"
                />
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="editKycVerified"
                  checked={formData.kycVerified}
                  onCheckedChange={(c) => setFormData({ ...formData, kycVerified: !!c })}
                />
                <Label htmlFor="editKycVerified">KYC 인증</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="editPaymentReceived"
                  checked={formData.paymentReceived}
                  onCheckedChange={(c) => setFormData({ ...formData, paymentReceived: !!c })}
                />
                <Label htmlFor="editPaymentReceived">입금 확인</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} data-testid="button-cancel-edit">
              취소
            </Button>
            <Button 
              onClick={() => selectedParticipant && updateParticipantMutation.mutate({ id: selectedParticipant.id, data: formData })}
              disabled={updateParticipantMutation.isPending}
              data-testid="button-submit-edit"
            >
              {updateParticipantMutation.isPending ? "저장 중..." : "저장"}
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
                  <Wallet className="h-5 w-5" />
                  퍼블릭 세일 참여자
                </DialogTitle>
                <DialogDescription className="font-mono text-xs">{selectedParticipant?.walletAddress}</DialogDescription>
              </div>
              <Badge className={STATUS_LABELS[selectedParticipant?.status || '']?.color || 'bg-gray-500/20'}>
                {STATUS_LABELS[selectedParticipant?.status || '']?.label || selectedParticipant?.status}
              </Badge>
            </div>
          </DialogHeader>
          
          {selectedParticipant && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <DollarSign className="h-6 w-6 mx-auto text-emerald-500 mb-2" />
                      <div className="text-xl font-bold">{formatUSD(selectedParticipant.investmentAmount)}</div>
                      <div className="text-xs text-muted-foreground">투자 금액</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <Coins className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                      <div className="text-xl font-bold">{formatTBURN(selectedParticipant.tokenAmount)}</div>
                      <div className="text-xs text-muted-foreground">토큰 수량</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <TrendingUp className="h-6 w-6 mx-auto text-purple-500 mb-2" />
                      <div className="text-xl font-bold">{formatTBURN(selectedParticipant.distributedAmount)}</div>
                      <div className="text-xs text-muted-foreground">지급 완료</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">KYC:</span>
                  {selectedParticipant.kycVerified ? (
                    <Badge className="bg-emerald-500/20 text-emerald-400">인증완료</Badge>
                  ) : (
                    <Badge className="bg-yellow-500/20 text-yellow-400">미인증</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">입금:</span>
                  {selectedParticipant.paymentReceived ? (
                    <Badge className="bg-emerald-500/20 text-emerald-400">입금완료</Badge>
                  ) : (
                    <Badge className="bg-yellow-500/20 text-yellow-400">대기중</Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">TGE 비율:</span>
                  <p>{selectedParticipant.tgePercentage}%</p>
                </div>
                <div>
                  <span className="text-muted-foreground">베스팅:</span>
                  <p>{selectedParticipant.vestingMonths}개월</p>
                </div>
                <div>
                  <span className="text-muted-foreground">유입 경로:</span>
                  <p>{SOURCES.find(s => s.value === selectedParticipant.source)?.label || selectedParticipant.source || '-'}</p>
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
            <DialogDescription>퍼블릭 세일 참여자에게 새 지급을 등록합니다</DialogDescription>
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
              <p className="text-xs text-muted-foreground">{formatTBURN(payoutForm.amount)} TBURN</p>
            </div>
            <div className="grid gap-2">
              <Label>지급 유형</Label>
              <Select value={payoutForm.payoutType} onValueChange={(v) => setPayoutForm({ ...payoutForm, payoutType: v })}>
                <SelectTrigger data-testid="select-payout-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tge">TGE (25%)</SelectItem>
                  <SelectItem value="vesting">베스팅</SelectItem>
                  <SelectItem value="full">전액 지급</SelectItem>
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
              onClick={() => selectedParticipant && addPayoutMutation.mutate({ 
                participantId: selectedParticipant.id, 
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
    </div>
  );
}
