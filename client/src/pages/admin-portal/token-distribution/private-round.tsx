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
import { KeyRound, Users, DollarSign, Lock, Search, RefreshCw, ArrowLeft, Plus, Eye, Edit, Coins, TrendingUp, CheckCircle, FileText, CreditCard, Shield, Star } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface PrivateInvestor {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  investorType: string;
  tier: string;
  walletAddress: string | null;
  investmentAmount: string;
  investmentCurrency: string;
  tokenPrice: string;
  tokenAmount: string;
  bonusAmount: string;
  distributedAmount: string;
  lockedAmount: string;
  vestingType: string;
  vestingStartDate: string | null;
  vestingEndDate: string | null;
  cliffMonths: number;
  vestingMonths: number;
  tgePercentage: number;
  saftSigned: boolean;
  saftSignedDate: string | null;
  kycVerified: boolean;
  kycVerifiedDate: string | null;
  accreditedVerified: boolean;
  paymentReceived: boolean;
  paymentReceivedDate: string | null;
  paymentTxHash: string | null;
  status: string;
  notes: string | null;
  referredBy: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PrivatePayout {
  id: string;
  investorId: string;
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
};

const PAYOUT_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: "대기", color: "bg-yellow-500/20 text-yellow-400" },
  scheduled: { label: "예정", color: "bg-blue-500/20 text-blue-400" },
  processing: { label: "처리중", color: "bg-purple-500/20 text-purple-400" },
  completed: { label: "완료", color: "bg-emerald-500/20 text-emerald-400" },
  failed: { label: "실패", color: "bg-red-500/20 text-red-400" },
};

const INVESTOR_TYPES = [
  { value: "vc", label: "벤처캐피탈", labelEn: "Venture Capital" },
  { value: "fund", label: "펀드", labelEn: "Fund" },
  { value: "family_office", label: "패밀리오피스", labelEn: "Family Office" },
  { value: "institutional", label: "기관 투자자", labelEn: "Institutional" },
  { value: "strategic", label: "전략적 투자자", labelEn: "Strategic" },
  { value: "accredited", label: "적격 투자자", labelEn: "Accredited" },
];

const TIER_TYPES = [
  { value: "standard", label: "스탠다드", bonus: 0 },
  { value: "premium", label: "프리미엄", bonus: 5 },
  { value: "vip", label: "VIP", bonus: 10 },
  { value: "strategic", label: "전략적", bonus: 15 },
];

const CURRENCIES = [
  { value: "usdt", label: "USDT" },
  { value: "usdc", label: "USDC" },
  { value: "eth", label: "ETH" },
  { value: "btc", label: "BTC" },
  { value: "usd", label: "USD (Wire)" },
  { value: "krw", label: "KRW (원화)" },
];

const VESTING_TYPES = [
  { value: "immediate", label: "즉시지급" },
  { value: "cliff_linear", label: "클리프+선형" },
  { value: "cliff_monthly", label: "클리프+월별" },
];

const TOKEN_PRICE = 0.01;

export default function AdminPrivateRound() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddPayoutOpen, setIsAddPayoutOpen] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState<PrivateInvestor | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    investorType: "institutional",
    tier: "standard",
    walletAddress: "",
    investmentAmount: "50000",
    investmentCurrency: "usdt",
    tokenPrice: "0.01",
    vestingType: "cliff_linear",
    cliffMonths: 6,
    vestingMonths: 18,
    tgePercentage: 10,
    saftSigned: false,
    kycVerified: false,
    accreditedVerified: false,
    paymentReceived: false,
    vestingStartDate: "",
    vestingEndDate: "",
    notes: "",
  });

  const [payoutForm, setPayoutForm] = useState({
    amount: "100000000000000000000000",
    payoutType: "vesting",
    scheduledDate: "",
    notes: "",
  });

  const { data: investorsData, isLoading, refetch } = useQuery<{ success: boolean; data: { investors: PrivateInvestor[]; stats: any } }>({
    queryKey: ['/api/admin/token-programs/private-round/investors'],
  });

  const { data: investorDetailData, isLoading: detailLoading } = useQuery<{ success: boolean; data: { investor: PrivateInvestor; payouts: PrivatePayout[] } }>({
    queryKey: ['/api/admin/token-programs/private-round/investors', selectedInvestor?.id],
    enabled: !!selectedInvestor && isDetailOpen,
  });

  const createInvestorMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const investmentUsd = parseFloat(data.investmentAmount);
      const tierBonus = TIER_TYPES.find(t => t.value === data.tier)?.bonus || 0;
      const baseTokens = Math.floor((investmentUsd / TOKEN_PRICE) * 1e18);
      const bonusTokens = Math.floor(baseTokens * tierBonus / 100);
      const totalTokens = baseTokens + bonusTokens;
      return apiRequest('POST', '/api/admin/token-programs/private-round/investors', {
        ...data,
        tokenAmount: totalTokens.toString(),
        bonusAmount: bonusTokens.toString(),
        lockedAmount: totalTokens.toString(),
        distributedAmount: "0",
        status: "pending",
      });
    },
    onSuccess: () => {
      toast({ title: "투자자 등록 완료", description: "새 프라이빗 투자자가 등록되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/private-round/investors'] });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "오류", description: "투자자 등록에 실패했습니다.", variant: "destructive" });
    }
  });

  const updateInvestorMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PrivateInvestor> }) => {
      return apiRequest('PATCH', `/api/admin/token-programs/private-round/investors/${id}`, data);
    },
    onSuccess: () => {
      toast({ title: "투자자 수정 완료", description: "투자자 정보가 수정되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/private-round/investors'] });
      setIsEditOpen(false);
      setSelectedInvestor(null);
    },
    onError: () => {
      toast({ title: "오류", description: "투자자 수정에 실패했습니다.", variant: "destructive" });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest('PATCH', `/api/admin/token-programs/private-round/investors/${id}`, { status });
    },
    onSuccess: () => {
      toast({ title: "상태 변경 완료", description: "투자자 상태가 변경되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/private-round/investors'] });
      if (selectedInvestor) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/private-round/investors', selectedInvestor.id] });
      }
    },
  });

  const addPayoutMutation = useMutation({
    mutationFn: async ({ investorId, data }: { investorId: string; data: typeof payoutForm }) => {
      return apiRequest('POST', `/api/admin/token-programs/private-round/investors/${investorId}/payouts`, {
        ...data,
        status: "pending",
      });
    },
    onSuccess: () => {
      toast({ title: "지급 등록 완료", description: "새 지급 일정이 등록되었습니다." });
      if (selectedInvestor) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/private-round/investors', selectedInvestor.id] });
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
      return apiRequest('PATCH', `/api/admin/token-programs/private-round/payouts/${id}`, { 
        status,
        ...(status === 'completed' ? { processedDate: new Date().toISOString() } : {}),
      });
    },
    onSuccess: () => {
      toast({ title: "지급 상태 변경", description: "지급 상태가 변경되었습니다." });
      if (selectedInvestor) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/private-round/investors', selectedInvestor.id] });
      }
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      investorType: "institutional",
      tier: "standard",
      walletAddress: "",
      investmentAmount: "50000",
      investmentCurrency: "usdt",
      tokenPrice: "0.01",
      vestingType: "cliff_linear",
      cliffMonths: 6,
      vestingMonths: 18,
      tgePercentage: 10,
      saftSigned: false,
      kycVerified: false,
      accreditedVerified: false,
      paymentReceived: false,
      vestingStartDate: "",
      vestingEndDate: "",
      notes: "",
    });
  };

  const openEditDialog = (investor: PrivateInvestor) => {
    setSelectedInvestor(investor);
    setFormData({
      name: investor.name,
      email: investor.email || "",
      phone: investor.phone || "",
      company: investor.company || "",
      investorType: investor.investorType,
      tier: investor.tier,
      walletAddress: investor.walletAddress || "",
      investmentAmount: investor.investmentAmount,
      investmentCurrency: investor.investmentCurrency,
      tokenPrice: investor.tokenPrice,
      vestingType: investor.vestingType,
      cliffMonths: investor.cliffMonths,
      vestingMonths: investor.vestingMonths,
      tgePercentage: investor.tgePercentage,
      saftSigned: investor.saftSigned,
      kycVerified: investor.kycVerified,
      accreditedVerified: investor.accreditedVerified,
      paymentReceived: investor.paymentReceived,
      vestingStartDate: investor.vestingStartDate ? new Date(investor.vestingStartDate).toISOString().slice(0, 10) : "",
      vestingEndDate: investor.vestingEndDate ? new Date(investor.vestingEndDate).toISOString().slice(0, 10) : "",
      notes: investor.notes || "",
    });
    setIsEditOpen(true);
  };

  const openDetailDialog = (investor: PrivateInvestor) => {
    setSelectedInvestor(investor);
    setIsDetailOpen(true);
  };

  const stats = investorsData?.data?.stats || { totalInvestors: 0, confirmedInvestors: 0, raisedAmount: "0", totalTokens: "0", lockedTokens: "0" };
  const investorList = Array.isArray(investorsData?.data?.investors) ? investorsData.data.investors : [];
  const payouts = investorDetailData?.data?.payouts || [];

  const filteredInvestors = investorList.filter(investor => {
    const matchesSearch = searchQuery === "" || 
      investor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (investor.company && investor.company.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || investor.status === statusFilter;
    const matchesTier = tierFilter === "all" || investor.tier === tierFilter;
    return matchesSearch && matchesStatus && matchesTier;
  });

  const tierBonus = TIER_TYPES.find(t => t.value === formData.tier)?.bonus || 0;
  const baseTokens = Math.floor((parseFloat(formData.investmentAmount || '0') / TOKEN_PRICE) * 1e18);
  const bonusTokens = Math.floor(baseTokens * tierBonus / 100);
  const totalCalculatedTokens = baseTokens + bonusTokens;

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="admin-private-round-page">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/admin/token-distribution")} data-testid="button-back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            프라이빗 라운드 관리
          </h1>
          <p className="text-muted-foreground">Private Round Management - 1월 3일 정식 오픈 | 토큰 가격: $0.01</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh">
          <RefreshCw className="mr-2 h-4 w-4" />
          새로고침
        </Button>
        <Button onClick={() => { resetForm(); setIsCreateOpen(true); }} data-testid="button-add-investor">
          <Plus className="mr-2 h-4 w-4" />
          새 투자자
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card data-testid="card-total-investors">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">프라이빗 투자자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvestors}</div>
            <p className="text-xs text-muted-foreground">Total Investors</p>
          </CardContent>
        </Card>
        <Card data-testid="card-confirmed-investors">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">확정 투자자</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmedInvestors}</div>
            <p className="text-xs text-muted-foreground">Confirmed</p>
          </CardContent>
        </Card>
        <Card data-testid="card-raised-amount">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">모금 금액</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUSD(stats.raisedAmount)}</div>
            <p className="text-xs text-muted-foreground">Raised Amount</p>
          </CardContent>
        </Card>
        <Card data-testid="card-token-price">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">토큰 가격</CardTitle>
            <KeyRound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.01</div>
            <p className="text-xs text-muted-foreground">Token Price</p>
          </CardContent>
        </Card>
        <Card data-testid="card-locked-tokens">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">잠금 토큰</CardTitle>
            <Lock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTBURN(stats.lockedTokens)}</div>
            <p className="text-xs text-muted-foreground">Locked TBURN</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>프라이빗 투자자 목록</CardTitle>
              <CardDescription>Private Investors List - 투자자 관리</CardDescription>
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
                </SelectContent>
              </Select>
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="w-28" data-testid="select-tier-filter">
                  <SelectValue placeholder="티어" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {TIER_TYPES.map(tier => (
                    <SelectItem key={tier.value} value={tier.value}>{tier.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="투자자 검색..."
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
          ) : filteredInvestors.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <KeyRound className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>프라이빗 투자자 데이터가 없습니다</p>
              <p className="text-sm">No private investors found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>투자자</TableHead>
                  <TableHead>티어</TableHead>
                  <TableHead className="text-right">투자 금액</TableHead>
                  <TableHead className="text-right">토큰 수량</TableHead>
                  <TableHead className="text-center">인증</TableHead>
                  <TableHead className="text-center">입금</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvestors.map((investor) => (
                  <TableRow key={investor.id} data-testid={`row-investor-${investor.id}`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div>{investor.name}</div>
                          {investor.company && <div className="text-xs text-muted-foreground">{investor.company}</div>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={investor.tier === 'vip' ? 'border-purple-500 text-purple-400' : investor.tier === 'strategic' ? 'border-amber-500 text-amber-400' : ''}>
                        <Star className="h-3 w-3 mr-1" />
                        {TIER_TYPES.find(t => t.value === investor.tier)?.label || investor.tier}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatUSD(investor.investmentAmount)}
                      <div className="text-xs text-muted-foreground">{investor.investmentCurrency.toUpperCase()}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatTBURN(investor.tokenAmount)} TBURN
                      {BigInt(investor.bonusAmount || '0') > 0 && (
                        <div className="text-xs text-emerald-400">+{formatTBURN(investor.bonusAmount)} 보너스</div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                        {investor.kycVerified ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                        )}
                        {investor.accreditedVerified ? (
                          <Shield className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Shield className="h-4 w-4 text-muted-foreground opacity-30" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {investor.paymentReceived ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500 mx-auto" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground mx-auto" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={investor.status} 
                        onValueChange={(v) => updateStatusMutation.mutate({ id: investor.id, status: v })}
                      >
                        <SelectTrigger className="w-28 h-8" data-testid={`select-status-${investor.id}`}>
                          <Badge className={STATUS_LABELS[investor.status]?.color || 'bg-gray-500/20'}>
                            {STATUS_LABELS[investor.status]?.label || investor.status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">대기</SelectItem>
                          <SelectItem value="kyc_pending">KYC 대기</SelectItem>
                          <SelectItem value="payment_pending">입금 대기</SelectItem>
                          <SelectItem value="confirmed">확정</SelectItem>
                          <SelectItem value="distributed">배포완료</SelectItem>
                          <SelectItem value="cancelled">취소</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openDetailDialog(investor)} data-testid={`button-detail-${investor.id}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(investor)} data-testid={`button-edit-${investor.id}`}>
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
            <DialogTitle>새 프라이빗 투자자</DialogTitle>
            <DialogDescription>새로운 프라이빗 라운드 투자자를 등록합니다. 최소 투자 금액: $50,000</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">투자자명 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="투자자 이름"
                  data-testid="input-investor-name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company">회사명</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="회사명"
                  data-testid="input-company"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>투자자 유형</Label>
                <Select value={formData.investorType} onValueChange={(v) => setFormData({ ...formData, investorType: v })}>
                  <SelectTrigger data-testid="select-investor-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INVESTOR_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>투자자 티어</Label>
                <Select value={formData.tier} onValueChange={(v) => setFormData({ ...formData, tier: v })}>
                  <SelectTrigger data-testid="select-tier">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIER_TYPES.map(tier => (
                      <SelectItem key={tier.value} value={tier.value}>
                        {tier.label} {tier.bonus > 0 && `(+${tier.bonus}% 보너스)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                    {formatTBURN(totalCalculatedTokens.toString())} TBURN
                  </div>
                  <p className="text-xs text-muted-foreground">
                    토큰 가격: $0.01 {tierBonus > 0 && `| 보너스: +${tierBonus}%`}
                  </p>
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
              <h4 className="font-medium mb-4 flex items-center gap-2"><FileText className="h-4 w-4" /> 확인 상태</h4>
              <div className="flex gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="saftSigned"
                    checked={formData.saftSigned}
                    onCheckedChange={(c) => setFormData({ ...formData, saftSigned: !!c })}
                    data-testid="checkbox-saft"
                  />
                  <Label htmlFor="saftSigned">SAFT 서명</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="kycVerified"
                    checked={formData.kycVerified}
                    onCheckedChange={(c) => setFormData({ ...formData, kycVerified: !!c })}
                    data-testid="checkbox-kyc"
                  />
                  <Label htmlFor="kycVerified">KYC 인증</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="accreditedVerified"
                    checked={formData.accreditedVerified}
                    onCheckedChange={(c) => setFormData({ ...formData, accreditedVerified: !!c })}
                    data-testid="checkbox-accredited"
                  />
                  <Label htmlFor="accreditedVerified">적격투자자 인증</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="paymentReceived"
                    checked={formData.paymentReceived}
                    onCheckedChange={(c) => setFormData({ ...formData, paymentReceived: !!c })}
                    data-testid="checkbox-payment"
                  />
                  <Label htmlFor="paymentReceived">입금 확인</Label>
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">메모</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="투자자 관련 메모..."
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
              onClick={() => createInvestorMutation.mutate(formData)}
              disabled={!formData.name || createInvestorMutation.isPending}
              data-testid="button-submit-create"
            >
              {createInvestorMutation.isPending ? "등록 중..." : "등록"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>투자자 수정</DialogTitle>
            <DialogDescription>"{selectedInvestor?.name}" 정보를 수정합니다.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>투자자명</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="input-edit-investor-name"
                />
              </div>
              <div className="grid gap-2">
                <Label>회사명</Label>
                <Input
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  data-testid="input-edit-company"
                />
              </div>
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
                <Label>투자자 티어</Label>
                <Select value={formData.tier} onValueChange={(v) => setFormData({ ...formData, tier: v })}>
                  <SelectTrigger data-testid="select-edit-tier">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIER_TYPES.map(tier => (
                      <SelectItem key={tier.value} value={tier.value}>{tier.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            <div className="flex gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="editSaftSigned"
                  checked={formData.saftSigned}
                  onCheckedChange={(c) => setFormData({ ...formData, saftSigned: !!c })}
                />
                <Label htmlFor="editSaftSigned">SAFT 서명</Label>
              </div>
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
                  id="editAccreditedVerified"
                  checked={formData.accreditedVerified}
                  onCheckedChange={(c) => setFormData({ ...formData, accreditedVerified: !!c })}
                />
                <Label htmlFor="editAccreditedVerified">적격투자자</Label>
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
              onClick={() => selectedInvestor && updateInvestorMutation.mutate({ id: selectedInvestor.id, data: formData })}
              disabled={updateInvestorMutation.isPending}
              data-testid="button-submit-edit"
            >
              {updateInvestorMutation.isPending ? "저장 중..." : "저장"}
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
                  <Users className="h-5 w-5" />
                  {selectedInvestor?.name}
                </DialogTitle>
                <DialogDescription>{selectedInvestor?.company || '프라이빗 투자자'} - 상세 정보 및 지급 관리</DialogDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className={selectedInvestor?.tier === 'vip' ? 'border-purple-500 text-purple-400' : selectedInvestor?.tier === 'strategic' ? 'border-amber-500 text-amber-400' : ''}>
                  <Star className="h-3 w-3 mr-1" />
                  {TIER_TYPES.find(t => t.value === selectedInvestor?.tier)?.label}
                </Badge>
                <Badge className={STATUS_LABELS[selectedInvestor?.status || '']?.color || 'bg-gray-500/20'}>
                  {STATUS_LABELS[selectedInvestor?.status || '']?.label || selectedInvestor?.status}
                </Badge>
              </div>
            </div>
          </DialogHeader>
          
          {selectedInvestor && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <DollarSign className="h-6 w-6 mx-auto text-emerald-500 mb-2" />
                      <div className="text-xl font-bold">{formatUSD(selectedInvestor.investmentAmount)}</div>
                      <div className="text-xs text-muted-foreground">투자 금액</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <Coins className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                      <div className="text-xl font-bold">{formatTBURN(selectedInvestor.tokenAmount)}</div>
                      <div className="text-xs text-muted-foreground">토큰 수량</div>
                      {BigInt(selectedInvestor.bonusAmount || '0') > 0 && (
                        <div className="text-xs text-emerald-400">+{formatTBURN(selectedInvestor.bonusAmount)} 보너스</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <TrendingUp className="h-6 w-6 mx-auto text-purple-500 mb-2" />
                      <div className="text-xl font-bold">{formatTBURN(selectedInvestor.distributedAmount)}</div>
                      <div className="text-xs text-muted-foreground">지급 완료</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <Lock className="h-6 w-6 mx-auto text-amber-500 mb-2" />
                      <div className="text-xl font-bold">{formatTBURN(selectedInvestor.lockedAmount)}</div>
                      <div className="text-xs text-muted-foreground">잠금 중</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">SAFT:</span>
                  {selectedInvestor.saftSigned ? (
                    <Badge className="bg-emerald-500/20 text-emerald-400">서명완료</Badge>
                  ) : (
                    <Badge className="bg-yellow-500/20 text-yellow-400">미서명</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">KYC:</span>
                  {selectedInvestor.kycVerified ? (
                    <Badge className="bg-emerald-500/20 text-emerald-400">인증완료</Badge>
                  ) : (
                    <Badge className="bg-yellow-500/20 text-yellow-400">미인증</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">적격투자자:</span>
                  {selectedInvestor.accreditedVerified ? (
                    <Badge className="bg-blue-500/20 text-blue-400">인증완료</Badge>
                  ) : (
                    <Badge className="bg-yellow-500/20 text-yellow-400">미인증</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">입금:</span>
                  {selectedInvestor.paymentReceived ? (
                    <Badge className="bg-emerald-500/20 text-emerald-400">입금완료</Badge>
                  ) : (
                    <Badge className="bg-yellow-500/20 text-yellow-400">대기중</Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">베스팅:</span>
                  <p>{VESTING_TYPES.find(v => v.value === selectedInvestor.vestingType)?.label} (클리프 {selectedInvestor.cliffMonths}개월 / {selectedInvestor.vestingMonths}개월)</p>
                </div>
                <div>
                  <span className="text-muted-foreground">TGE 비율:</span>
                  <p>{selectedInvestor.tgePercentage}%</p>
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
            <DialogDescription>"{selectedInvestor?.name}" 투자자에게 새 지급을 등록합니다</DialogDescription>
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
                  <SelectItem value="tge">TGE</SelectItem>
                  <SelectItem value="vesting">베스팅</SelectItem>
                  <SelectItem value="cliff_release">클리프 해제</SelectItem>
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
              onClick={() => selectedInvestor && addPayoutMutation.mutate({ 
                investorId: selectedInvestor.id, 
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
