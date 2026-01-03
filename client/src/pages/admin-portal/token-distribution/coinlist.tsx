import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ListOrdered, Users, DollarSign, CheckCircle2, Search, RefreshCw, ArrowLeft, Plus, Eye, Calendar, Trophy, Ticket, Settings, UserCheck } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const formatTBURN = (amount: string) => {
  const num = parseFloat(amount || '0');
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toFixed(2);
};

const formatDate = (date: string | Date | null) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatDateTime = (date: string | Date | null) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const toDateTimeLocal = (date: string | Date | null) => {
  if (!date) return '';
  return new Date(date).toISOString().slice(0, 16);
};

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    draft: 'bg-gray-500/20 text-gray-400',
    scheduled: 'bg-blue-500/20 text-blue-400',
    registration: 'bg-purple-500/20 text-purple-400',
    'selection': 'bg-yellow-500/20 text-yellow-400',
    active: 'bg-emerald-500/20 text-emerald-400',
    live: 'bg-emerald-500/20 text-emerald-400',
    ended: 'bg-gray-500/20 text-gray-400',
    distributed: 'bg-teal-500/20 text-teal-400',
    cancelled: 'bg-red-500/20 text-red-400',
  };
  return <Badge className={styles[status] || 'bg-gray-500/20 text-gray-400'}>{status}</Badge>;
};

const getParticipantStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    registered: 'bg-blue-500/20 text-blue-400',
    kyc_verified: 'bg-purple-500/20 text-purple-400',
    winner: 'bg-emerald-500/20 text-emerald-400',
    not_selected: 'bg-gray-500/20 text-gray-400',
    payment_pending: 'bg-yellow-500/20 text-yellow-400',
    paid: 'bg-teal-500/20 text-teal-400',
    distributed: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400',
  };
  return <Badge className={styles[status] || 'bg-gray-500/20 text-gray-400'}>{status}</Badge>;
};

interface CoinlistSale {
  id: string;
  saleName: string;
  tokenSymbol: string;
  tokenPrice: string;
  totalAllocation: string;
  hardCap: string;
  raisedAmount: string;
  minPurchase: string;
  maxPurchase: string;
  queueType: string;
  totalSlots: number;
  registrationStart: string | null;
  registrationEnd: string | null;
  saleStart: string | null;
  saleEnd: string | null;
  tgePercentage: number;
  vestingMonths: number;
  kycRequired: boolean;
  status: string;
  notes: string | null;
  createdAt: string;
}

interface CoinlistParticipant {
  id: string;
  saleId: string;
  email: string;
  walletAddress: string;
  country: string | null;
  queuePosition: number | null;
  investmentAmount: string;
  investmentCurrency: string;
  tokenAmount: string;
  distributedAmount: string;
  txHash: string | null;
  kycVerified: boolean;
  kycVerifiedDate: string | null;
  isWinner: boolean;
  winnerSelectedDate: string | null;
  paymentReceived: boolean;
  paymentReceivedDate: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
}

interface StatsData {
  totalSales: number;
  activeSales: number;
  totalRegistered: number;
  totalWinners: number;
  totalRaised: string;
  totalAllocated: string;
}

export default function AdminCoinlist() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSale, setSelectedSale] = useState<CoinlistSale | null>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<CoinlistParticipant | null>(null);
  const [showCreateSale, setShowCreateSale] = useState(false);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [showSelectWinners, setShowSelectWinners] = useState(false);
  const [winnerCount, setWinnerCount] = useState(10);
  const [activeTab, setActiveTab] = useState("info");
  const [participantActiveTab, setParticipantActiveTab] = useState("info");

  const [saleForm, setSaleForm] = useState({
    saleName: '', tokenSymbol: 'TBURN', tokenPrice: '0.02', totalAllocation: '50000000000000000000000000',
    hardCap: '1000000', minPurchase: '100', maxPurchase: '5000', queueType: 'lottery', totalSlots: 1000,
    registrationStart: '', registrationEnd: '', saleStart: '', saleEnd: '',
    tgePercentage: 25, vestingMonths: 6, kycRequired: true, status: 'draft', notes: ''
  });

  const [participantForm, setParticipantForm] = useState({
    email: '', walletAddress: '', country: '', investmentAmount: '100', investmentCurrency: 'usdt',
    kycVerified: false, status: 'registered', notes: ''
  });

  const { data: salesData, isLoading, refetch } = useQuery<{ success: boolean; data: { sales: CoinlistSale[]; stats: StatsData } }>({
    queryKey: ['/api/admin/token-programs/coinlist/sales'],
  });

  const { data: saleDetail, isLoading: isLoadingDetail, refetch: refetchDetail } = useQuery<{ success: boolean; data: { sale: CoinlistSale; participants: CoinlistParticipant[] } }>({
    queryKey: ['/api/admin/token-programs/coinlist/sales', selectedSale?.id],
    enabled: !!selectedSale?.id,
  });

  const createSaleMutation = useMutation({
    mutationFn: (data: typeof saleForm) => apiRequest('POST', '/api/admin/token-programs/coinlist/sales', data),
    onSuccess: () => {
      toast({ title: "성공", description: "CoinList 세일이 생성되었습니다." });
      setShowCreateSale(false);
      setSaleForm({ saleName: '', tokenSymbol: 'TBURN', tokenPrice: '0.02', totalAllocation: '50000000000000000000000000', hardCap: '1000000', minPurchase: '100', maxPurchase: '5000', queueType: 'lottery', totalSlots: 1000, registrationStart: '', registrationEnd: '', saleStart: '', saleEnd: '', tgePercentage: 25, vestingMonths: 6, kycRequired: true, status: 'draft', notes: '' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/coinlist/sales'] });
    },
    onError: () => { toast({ title: "오류", description: "세일 생성 실패", variant: "destructive" }); }
  });

  const updateSaleMutation = useMutation({
    mutationFn: (data: { id: string } & Partial<CoinlistSale>) => apiRequest('PATCH', `/api/admin/token-programs/coinlist/sales/${data.id}`, data),
    onSuccess: () => {
      toast({ title: "성공", description: "세일 정보가 업데이트되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/coinlist/sales'] });
      refetchDetail();
    },
  });

  const createParticipantMutation = useMutation({
    mutationFn: (data: { saleId: string } & typeof participantForm) => apiRequest('POST', `/api/admin/token-programs/coinlist/sales/${data.saleId}/participants`, data),
    onSuccess: () => {
      toast({ title: "성공", description: "참여자가 추가되었습니다." });
      setShowAddParticipant(false);
      setParticipantForm({ email: '', walletAddress: '', country: '', investmentAmount: '100', investmentCurrency: 'usdt', kycVerified: false, status: 'registered', notes: '' });
      refetchDetail();
    },
    onError: () => { toast({ title: "오류", description: "참여자 추가 실패", variant: "destructive" }); }
  });

  const updateParticipantMutation = useMutation({
    mutationFn: (data: { id: string } & Partial<CoinlistParticipant>) => apiRequest('PATCH', `/api/admin/token-programs/coinlist/participants/${data.id}`, data),
    onSuccess: () => {
      toast({ title: "성공", description: "참여자 정보가 업데이트되었습니다." });
      refetchDetail();
    },
  });

  const selectWinnersMutation = useMutation({
    mutationFn: (data: { saleId: string; count: number }) => apiRequest('POST', `/api/admin/token-programs/coinlist/sales/${data.saleId}/select-winners`, { count: data.count }),
    onSuccess: (response: any) => {
      toast({ title: "성공", description: `${response.data?.winnersSelected || 0}명의 당첨자가 선정되었습니다.` });
      setShowSelectWinners(false);
      refetchDetail();
    },
    onError: () => { toast({ title: "오류", description: "당첨자 선정 실패", variant: "destructive" }); }
  });

  const stats = salesData?.data?.stats || { totalSales: 0, activeSales: 0, totalRegistered: 0, totalWinners: 0, totalRaised: '0', totalAllocated: '0' };
  const sales = salesData?.data?.sales || [];
  const participants = saleDetail?.data?.participants || [];

  const filteredSales = sales.filter(s => 
    s.saleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.tokenSymbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredParticipants = participants.filter(p =>
    p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.walletAddress.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedSale) {
    const sale = saleDetail?.data?.sale || selectedSale;
    const progress = parseFloat(sale.raisedAmount || '0') / parseFloat(sale.hardCap || '1') * 100;
    const kycVerifiedCount = participants.filter(p => p.kycVerified).length;
    const winnersCount = participants.filter(p => p.isWinner).length;
    const paidCount = participants.filter(p => p.paymentReceived).length;

    return (
      <div className="flex flex-col gap-6 p-6" data-testid="coinlist-sale-detail">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setSelectedSale(null)} data-testid="button-back-to-list">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold" data-testid="text-sale-name">{sale.saleName}</h1>
              {getStatusBadge(sale.status)}
            </div>
            <p className="text-muted-foreground">{sale.tokenSymbol} Token Sale - {sale.queueType === 'lottery' ? '추첨제' : '선착순'}</p>
          </div>
          <Select value={sale.status} onValueChange={(v) => updateSaleMutation.mutate({ id: sale.id, status: v })}>
            <SelectTrigger className="w-40" data-testid="select-sale-status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="registration">Registration</SelectItem>
              <SelectItem value="selection">Selection</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="ended">Ended</SelectItem>
              <SelectItem value="distributed">Distributed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => refetchDetail()} data-testid="button-refresh-detail">
            <RefreshCw className="mr-2 h-4 w-4" />새로고침
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card><CardHeader className="flex flex-row items-center justify-between gap-1 pb-2"><CardTitle className="text-sm font-medium">등록자</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{participants.length}</div><p className="text-xs text-muted-foreground">/{sale.totalSlots} slots</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between gap-1 pb-2"><CardTitle className="text-sm font-medium">KYC 완료</CardTitle><UserCheck className="h-4 w-4 text-purple-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{kycVerifiedCount}</div><p className="text-xs text-muted-foreground">{participants.length > 0 ? ((kycVerifiedCount / participants.length) * 100).toFixed(1) : 0}%</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between gap-1 pb-2"><CardTitle className="text-sm font-medium">당첨자</CardTitle><Trophy className="h-4 w-4 text-yellow-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{winnersCount}</div><p className="text-xs text-muted-foreground">Selected Winners</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between gap-1 pb-2"><CardTitle className="text-sm font-medium">결제 완료</CardTitle><CheckCircle2 className="h-4 w-4 text-emerald-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{paidCount}</div><p className="text-xs text-muted-foreground">Paid</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between gap-1 pb-2"><CardTitle className="text-sm font-medium">모금액</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">${parseFloat(sale.raisedAmount || '0').toLocaleString()}</div><Progress value={progress} className="h-2 mt-2" /><p className="text-xs text-muted-foreground mt-1">${parseFloat(sale.hardCap || '0').toLocaleString()} 목표</p></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle className="text-lg">세일 정보</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">토큰 가격</span><span className="font-medium">${sale.tokenPrice}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">총 배분량</span><span className="font-medium">{formatTBURN(sale.totalAllocation)} TBURN</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">최소 참여</span><span className="font-medium">${sale.minPurchase}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">최대 참여</span><span className="font-medium">${sale.maxPurchase}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">TGE</span><span className="font-medium">{sale.tgePercentage}%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">베스팅</span><span className="font-medium">{sale.vestingMonths}개월</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">KYC 필수</span><span className="font-medium">{sale.kycRequired ? '예' : '아니오'}</span></div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between mb-2"><span className="text-muted-foreground">등록 시작</span><span className="font-medium">{formatDateTime(sale.registrationStart)}</span></div>
                <div className="flex justify-between mb-2"><span className="text-muted-foreground">등록 종료</span><span className="font-medium">{formatDateTime(sale.registrationEnd)}</span></div>
                <div className="flex justify-between mb-2"><span className="text-muted-foreground">세일 시작</span><span className="font-medium">{formatDateTime(sale.saleStart)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">세일 종료</span><span className="font-medium">{formatDateTime(sale.saleEnd)}</span></div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div><CardTitle>참여자 목록</CardTitle><CardDescription>{participants.length}명 등록</CardDescription></div>
                <div className="flex gap-2">
                  <Dialog open={showSelectWinners} onOpenChange={setShowSelectWinners}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" data-testid="button-select-winners"><Trophy className="mr-2 h-4 w-4" />당첨자 추첨</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>당첨자 추첨</DialogTitle><DialogDescription>KYC 인증 완료된 참여자 중에서 무작위로 당첨자를 선정합니다.</DialogDescription></DialogHeader>
                      <div className="py-4">
                        <Label>선정 인원</Label>
                        <Input type="number" value={winnerCount} onChange={(e) => setWinnerCount(parseInt(e.target.value) || 0)} className="mt-2" data-testid="input-winner-count" />
                        <p className="text-sm text-muted-foreground mt-2">KYC 완료 참여자: {kycVerifiedCount}명 (미당첨: {kycVerifiedCount - winnersCount}명)</p>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSelectWinners(false)}>취소</Button>
                        <Button onClick={() => selectWinnersMutation.mutate({ saleId: sale.id, count: winnerCount })} disabled={selectWinnersMutation.isPending} data-testid="button-confirm-select">
                          {selectWinnersMutation.isPending ? '추첨 중...' : '추첨 실행'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={showAddParticipant} onOpenChange={setShowAddParticipant}>
                    <DialogTrigger asChild>
                      <Button size="sm" data-testid="button-add-participant"><Plus className="mr-2 h-4 w-4" />참여자 추가</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader><DialogTitle>참여자 추가</DialogTitle><DialogDescription>새 CoinList 참여자를 등록합니다.</DialogDescription></DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2"><Label>이메일 *</Label><Input value={participantForm.email} onChange={(e) => setParticipantForm({...participantForm, email: e.target.value})} data-testid="input-participant-email" /></div>
                        <div className="grid gap-2"><Label>지갑 주소 *</Label><Input value={participantForm.walletAddress} onChange={(e) => setParticipantForm({...participantForm, walletAddress: e.target.value})} placeholder="tb1..." data-testid="input-participant-wallet" /></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2"><Label>국가</Label><Input value={participantForm.country} onChange={(e) => setParticipantForm({...participantForm, country: e.target.value})} placeholder="KR" /></div>
                          <div className="grid gap-2"><Label>투자금액</Label><Input type="number" value={participantForm.investmentAmount} onChange={(e) => setParticipantForm({...participantForm, investmentAmount: e.target.value})} /></div>
                        </div>
                        <div className="flex items-center gap-2"><Switch checked={participantForm.kycVerified} onCheckedChange={(v) => setParticipantForm({...participantForm, kycVerified: v})} /><Label>KYC 인증됨</Label></div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddParticipant(false)}>취소</Button>
                        <Button onClick={() => createParticipantMutation.mutate({ saleId: sale.id, ...participantForm })} disabled={createParticipantMutation.isPending} data-testid="button-confirm-add-participant">
                          {createParticipantMutation.isPending ? '추가 중...' : '추가'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingDetail ? (
                <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12" />)}</div>
              ) : participants.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground"><Users className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>참여자가 없습니다</p></div>
              ) : (
                <div className="max-h-[400px] overflow-auto">
                  <Table>
                    <TableHeader><TableRow><TableHead>이메일</TableHead><TableHead>지갑</TableHead><TableHead className="text-center">KYC</TableHead><TableHead className="text-center">당첨</TableHead><TableHead className="text-right">투자</TableHead><TableHead>상태</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {filteredParticipants.map((p) => (
                        <TableRow key={p.id} className="cursor-pointer hover-elevate" onClick={() => setSelectedParticipant(p)} data-testid={`row-participant-${p.id}`}>
                          <TableCell className="font-medium">{p.email}</TableCell>
                          <TableCell className="font-mono text-xs">{p.walletAddress.slice(0, 10)}...</TableCell>
                          <TableCell className="text-center">{p.kycVerified ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" /> : <span className="text-muted-foreground">-</span>}</TableCell>
                          <TableCell className="text-center">{p.isWinner ? <Trophy className="h-4 w-4 text-yellow-500 mx-auto" /> : <span className="text-muted-foreground">-</span>}</TableCell>
                          <TableCell className="text-right">${parseFloat(p.investmentAmount).toLocaleString()}</TableCell>
                          <TableCell>
                            <Select value={p.status} onValueChange={(v) => updateParticipantMutation.mutate({ id: p.id, status: v })}>
                              <SelectTrigger className="h-7 w-28" data-testid={`select-participant-status-${p.id}`}><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="registered">등록</SelectItem>
                                <SelectItem value="kyc_verified">KYC완료</SelectItem>
                                <SelectItem value="winner">당첨</SelectItem>
                                <SelectItem value="not_selected">미당첨</SelectItem>
                                <SelectItem value="payment_pending">결제대기</SelectItem>
                                <SelectItem value="paid">결제완료</SelectItem>
                                <SelectItem value="distributed">배분완료</SelectItem>
                                <SelectItem value="cancelled">취소</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Dialog open={!!selectedParticipant} onOpenChange={(open) => !open && setSelectedParticipant(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>참여자 상세 정보</DialogTitle></DialogHeader>
            {selectedParticipant && (
              <div className="space-y-4">
                <Tabs value={participantActiveTab} onValueChange={setParticipantActiveTab}>
                  <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="info">기본 정보</TabsTrigger><TabsTrigger value="status">상태 관리</TabsTrigger></TabsList>
                  <TabsContent value="info" className="space-y-3 mt-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-muted-foreground">이메일</span><p className="font-medium">{selectedParticipant.email}</p></div>
                      <div><span className="text-muted-foreground">국가</span><p className="font-medium">{selectedParticipant.country || '-'}</p></div>
                    </div>
                    <div><span className="text-muted-foreground text-sm">지갑 주소</span><p className="font-mono text-sm break-all">{selectedParticipant.walletAddress}</p></div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-muted-foreground">투자 금액</span><p className="font-medium">${parseFloat(selectedParticipant.investmentAmount).toLocaleString()} {selectedParticipant.investmentCurrency.toUpperCase()}</p></div>
                      <div><span className="text-muted-foreground">토큰 수량</span><p className="font-medium">{formatTBURN(selectedParticipant.tokenAmount)} TBURN</p></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-muted-foreground">대기열 순위</span><p className="font-medium">{selectedParticipant.queuePosition || '-'}</p></div>
                      <div><span className="text-muted-foreground">등록일</span><p className="font-medium">{formatDate(selectedParticipant.createdAt)}</p></div>
                    </div>
                  </TabsContent>
                  <TabsContent value="status" className="space-y-4 mt-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div><Label>KYC 인증</Label><p className="text-sm text-muted-foreground">{selectedParticipant.kycVerifiedDate ? formatDate(selectedParticipant.kycVerifiedDate) : '미인증'}</p></div>
                      <Switch checked={selectedParticipant.kycVerified} onCheckedChange={(v) => { updateParticipantMutation.mutate({ id: selectedParticipant.id, kycVerified: v, kycVerifiedDate: v ? new Date().toISOString() : null }); setSelectedParticipant({...selectedParticipant, kycVerified: v}); }} />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div><Label>당첨 여부</Label><p className="text-sm text-muted-foreground">{selectedParticipant.winnerSelectedDate ? formatDate(selectedParticipant.winnerSelectedDate) : '미선정'}</p></div>
                      <Switch checked={selectedParticipant.isWinner} onCheckedChange={(v) => { updateParticipantMutation.mutate({ id: selectedParticipant.id, isWinner: v, winnerSelectedDate: v ? new Date().toISOString() : null }); setSelectedParticipant({...selectedParticipant, isWinner: v}); }} />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div><Label>결제 완료</Label><p className="text-sm text-muted-foreground">{selectedParticipant.paymentReceivedDate ? formatDate(selectedParticipant.paymentReceivedDate) : '미결제'}</p></div>
                      <Switch checked={selectedParticipant.paymentReceived} onCheckedChange={(v) => { updateParticipantMutation.mutate({ id: selectedParticipant.id, paymentReceived: v, paymentReceivedDate: v ? new Date().toISOString() : null }); setSelectedParticipant({...selectedParticipant, paymentReceived: v}); }} />
                    </div>
                    <div>
                      <Label>상태</Label>
                      <Select value={selectedParticipant.status} onValueChange={(v) => { updateParticipantMutation.mutate({ id: selectedParticipant.id, status: v }); setSelectedParticipant({...selectedParticipant, status: v}); }}>
                        <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="registered">등록</SelectItem>
                          <SelectItem value="kyc_verified">KYC완료</SelectItem>
                          <SelectItem value="winner">당첨</SelectItem>
                          <SelectItem value="not_selected">미당첨</SelectItem>
                          <SelectItem value="payment_pending">결제대기</SelectItem>
                          <SelectItem value="paid">결제완료</SelectItem>
                          <SelectItem value="distributed">배분완료</SelectItem>
                          <SelectItem value="cancelled">취소</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="admin-coinlist-page">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/admin/token-distribution")} data-testid="button-back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            CoinList 토큰 세일 관리
          </h1>
          <p className="text-muted-foreground">CoinList Token Sale Management - 추첨/대기열 기반 토큰 세일</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh">
          <RefreshCw className="mr-2 h-4 w-4" />
          새로고침
        </Button>
        <Dialog open={showCreateSale} onOpenChange={setShowCreateSale}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-sale"><Plus className="mr-2 h-4 w-4" />새 세일 생성</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>새 CoinList 세일 생성</DialogTitle><DialogDescription>추첨/대기열 방식의 토큰 세일을 생성합니다.</DialogDescription></DialogHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3"><TabsTrigger value="info">기본 정보</TabsTrigger><TabsTrigger value="sale">세일 설정</TabsTrigger><TabsTrigger value="schedule">일정</TabsTrigger></TabsList>
              <TabsContent value="info" className="space-y-4 mt-4">
                <div className="grid gap-2"><Label>세일 이름 *</Label><Input value={saleForm.saleName} onChange={(e) => setSaleForm({...saleForm, saleName: e.target.value})} placeholder="TBURN CoinList Sale Round 1" data-testid="input-sale-name" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label>토큰 심볼</Label><Input value={saleForm.tokenSymbol} onChange={(e) => setSaleForm({...saleForm, tokenSymbol: e.target.value})} /></div>
                  <div className="grid gap-2"><Label>토큰 가격 ($)</Label><Input value={saleForm.tokenPrice} onChange={(e) => setSaleForm({...saleForm, tokenPrice: e.target.value})} /></div>
                </div>
                <div className="grid gap-2"><Label>총 배분량 (wei)</Label><Input value={saleForm.totalAllocation} onChange={(e) => setSaleForm({...saleForm, totalAllocation: e.target.value})} /></div>
                <div className="grid gap-2"><Label>비고</Label><Textarea value={saleForm.notes} onChange={(e) => setSaleForm({...saleForm, notes: e.target.value})} placeholder="세일 관련 메모..." /></div>
              </TabsContent>
              <TabsContent value="sale" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label>하드캡 ($)</Label><Input value={saleForm.hardCap} onChange={(e) => setSaleForm({...saleForm, hardCap: e.target.value})} /></div>
                  <div className="grid gap-2"><Label>총 슬롯 수</Label><Input type="number" value={saleForm.totalSlots} onChange={(e) => setSaleForm({...saleForm, totalSlots: parseInt(e.target.value) || 1000})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label>최소 참여 ($)</Label><Input value={saleForm.minPurchase} onChange={(e) => setSaleForm({...saleForm, minPurchase: e.target.value})} /></div>
                  <div className="grid gap-2"><Label>최대 참여 ($)</Label><Input value={saleForm.maxPurchase} onChange={(e) => setSaleForm({...saleForm, maxPurchase: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label>TGE 비율 (%)</Label><Input type="number" value={saleForm.tgePercentage} onChange={(e) => setSaleForm({...saleForm, tgePercentage: parseInt(e.target.value) || 25})} /></div>
                  <div className="grid gap-2"><Label>베스팅 기간 (월)</Label><Input type="number" value={saleForm.vestingMonths} onChange={(e) => setSaleForm({...saleForm, vestingMonths: parseInt(e.target.value) || 6})} /></div>
                </div>
                <div className="grid gap-2">
                  <Label>배분 방식</Label>
                  <Select value={saleForm.queueType} onValueChange={(v) => setSaleForm({...saleForm, queueType: v})}>
                    <SelectTrigger data-testid="select-queue-type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lottery">추첨제 (Lottery)</SelectItem>
                      <SelectItem value="fcfs">선착순 (First Come First Served)</SelectItem>
                      <SelectItem value="queue">대기열 (Queue)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2"><Switch checked={saleForm.kycRequired} onCheckedChange={(v) => setSaleForm({...saleForm, kycRequired: v})} /><Label>KYC 필수</Label></div>
              </TabsContent>
              <TabsContent value="schedule" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label>등록 시작</Label><Input type="datetime-local" value={saleForm.registrationStart} onChange={(e) => setSaleForm({...saleForm, registrationStart: e.target.value})} /></div>
                  <div className="grid gap-2"><Label>등록 종료</Label><Input type="datetime-local" value={saleForm.registrationEnd} onChange={(e) => setSaleForm({...saleForm, registrationEnd: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label>세일 시작</Label><Input type="datetime-local" value={saleForm.saleStart} onChange={(e) => setSaleForm({...saleForm, saleStart: e.target.value})} /></div>
                  <div className="grid gap-2"><Label>세일 종료</Label><Input type="datetime-local" value={saleForm.saleEnd} onChange={(e) => setSaleForm({...saleForm, saleEnd: e.target.value})} /></div>
                </div>
                <div className="grid gap-2">
                  <Label>상태</Label>
                  <Select value={saleForm.status} onValueChange={(v) => setSaleForm({...saleForm, status: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="registration">Registration Open</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setShowCreateSale(false)}>취소</Button>
              <Button onClick={() => createSaleMutation.mutate(saleForm)} disabled={createSaleMutation.isPending || !saleForm.saleName} data-testid="button-confirm-create">
                {createSaleMutation.isPending ? '생성 중...' : '생성'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardHeader className="flex flex-row items-center justify-between gap-1 pb-2"><CardTitle className="text-sm font-medium">전체 세일</CardTitle><Ticket className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalSales}</div><p className="text-xs text-muted-foreground">진행중: {stats.activeSales}</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between gap-1 pb-2"><CardTitle className="text-sm font-medium">총 등록자</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalRegistered}</div><p className="text-xs text-muted-foreground">Registered Users</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between gap-1 pb-2"><CardTitle className="text-sm font-medium">총 당첨자</CardTitle><Trophy className="h-4 w-4 text-yellow-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalWinners}</div><p className="text-xs text-muted-foreground">Winners</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between gap-1 pb-2"><CardTitle className="text-sm font-medium">총 모금액</CardTitle><DollarSign className="h-4 w-4 text-emerald-500" /></CardHeader><CardContent><div className="text-2xl font-bold">${parseFloat(stats.totalRaised).toLocaleString()}</div><p className="text-xs text-muted-foreground">Total Raised</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div><CardTitle>CoinList 세일 목록</CardTitle><CardDescription>추첨/대기열 기반 토큰 세일 관리</CardDescription></div>
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="세일 검색..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-64" data-testid="input-search" /></div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
          ) : sales.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><ListOrdered className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>CoinList 세일이 없습니다</p><p className="text-sm">새 세일을 생성해주세요</p></div>
          ) : (
            <div className="grid gap-4">
              {filteredSales.map((sale) => {
                const progress = parseFloat(sale.raisedAmount || '0') / parseFloat(sale.hardCap || '1') * 100;
                return (
                  <Card key={sale.id} className="cursor-pointer hover-elevate" onClick={() => setSelectedSale(sale)} data-testid={`card-sale-${sale.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{sale.saleName}</h3>
                            {getStatusBadge(sale.status)}
                            <Badge variant="outline">{sale.queueType === 'lottery' ? '추첨' : sale.queueType === 'fcfs' ? '선착순' : '대기열'}</Badge>
                          </div>
                          <div className="flex gap-6 text-sm text-muted-foreground">
                            <span>{sale.tokenSymbol} @ ${sale.tokenPrice}</span>
                            <span>{sale.totalSlots} slots</span>
                            <span>TGE {sale.tgePercentage}%</span>
                            {sale.registrationStart && <span><Calendar className="inline h-3 w-3 mr-1" />{formatDate(sale.registrationStart)}</span>}
                          </div>
                        </div>
                        <div className="text-right min-w-[150px]">
                          <div className="text-lg font-bold">${parseFloat(sale.raisedAmount || '0').toLocaleString()}</div>
                          <Progress value={progress} className="h-2 w-32 mt-1" />
                          <p className="text-xs text-muted-foreground mt-1">{progress.toFixed(1)}% of ${parseFloat(sale.hardCap).toLocaleString()}</p>
                        </div>
                        <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
