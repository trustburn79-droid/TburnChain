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
import { Gem, Users, DollarSign, Award, Search, RefreshCw, ArrowLeft, Plus, Eye, Calendar, Trophy, Zap, Crown, Shield, Star, UserCheck, CheckCircle2 } from "lucide-react";
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

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    draft: 'bg-gray-500/20 text-gray-400',
    scheduled: 'bg-blue-500/20 text-blue-400',
    registration: 'bg-purple-500/20 text-purple-400',
    selection: 'bg-yellow-500/20 text-yellow-400',
    active: 'bg-emerald-500/20 text-emerald-400',
    live: 'bg-emerald-500/20 text-emerald-400',
    ended: 'bg-gray-500/20 text-gray-400',
    distributed: 'bg-teal-500/20 text-teal-400',
    cancelled: 'bg-red-500/20 text-red-400',
  };
  return <Badge className={styles[status] || 'bg-gray-500/20 text-gray-400'}>{status}</Badge>;
};

const getTierBadge = (tier: string) => {
  const styles: Record<string, { bg: string; icon: any }> = {
    diamond: { bg: 'bg-cyan-500/20 text-cyan-400', icon: Crown },
    platinum: { bg: 'bg-purple-500/20 text-purple-400', icon: Star },
    gold: { bg: 'bg-yellow-500/20 text-yellow-400', icon: Trophy },
    silver: { bg: 'bg-gray-400/20 text-gray-300', icon: Shield },
    bronze: { bg: 'bg-orange-500/20 text-orange-400', icon: Gem },
  };
  const style = styles[tier] || styles.bronze;
  const Icon = style.icon;
  return <Badge className={style.bg}><Icon className="h-3 w-3 mr-1" />{tier}</Badge>;
};

interface DaoMakerSho {
  id: string;
  shoName: string;
  tokenSymbol: string;
  tokenPrice: string;
  totalAllocation: string;
  hardCap: string;
  raisedAmount: string;
  minDaoPower: number;
  minPurchase: string;
  maxPurchase: string;
  totalWinners: number;
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

interface DaoMakerParticipant {
  id: string;
  shoId: string;
  walletAddress: string;
  email: string | null;
  daoPower: number;
  stakedAmount: string;
  tier: string;
  investmentAmount: string;
  investmentCurrency: string;
  allocationAmount: string;
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
  totalShos: number;
  activeShos: number;
  totalParticipants: number;
  totalWinners: number;
  totalRaised: string;
  avgDaoPower: number;
}

export default function AdminDAOMaker() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSho, setSelectedSho] = useState<DaoMakerSho | null>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<DaoMakerParticipant | null>(null);
  const [showCreateSho, setShowCreateSho] = useState(false);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [showSelectWinners, setShowSelectWinners] = useState(false);
  const [winnerCount, setWinnerCount] = useState(100);
  const [activeTab, setActiveTab] = useState("info");
  const [participantActiveTab, setParticipantActiveTab] = useState("info");

  const [shoForm, setShoForm] = useState({
    shoName: '', tokenSymbol: 'TBURN', tokenPrice: '0.02', totalAllocation: '25000000000000000000000000',
    hardCap: '500000', minDaoPower: 100, minPurchase: '100', maxPurchase: '2500', totalWinners: 500,
    registrationStart: '', registrationEnd: '', saleStart: '', saleEnd: '',
    tgePercentage: 20, vestingMonths: 9, kycRequired: true, status: 'draft', notes: ''
  });

  const [participantForm, setParticipantForm] = useState({
    walletAddress: '', email: '', daoPower: 500, stakedAmount: '10000000000000000000000',
    investmentAmount: '500', investmentCurrency: 'usdt', kycVerified: false, status: 'registered', notes: ''
  });

  const { data: shosData, isLoading, refetch } = useQuery<{ success: boolean; data: { shos: DaoMakerSho[]; stats: StatsData } }>({
    queryKey: ['/api/admin/token-programs/dao-maker/shos'],
  });

  const { data: shoDetail, isLoading: isLoadingDetail, refetch: refetchDetail } = useQuery<{ success: boolean; data: { sho: DaoMakerSho; participants: DaoMakerParticipant[] } }>({
    queryKey: ['/api/admin/token-programs/dao-maker/shos', selectedSho?.id],
    enabled: !!selectedSho?.id,
  });

  const createShoMutation = useMutation({
    mutationFn: (data: typeof shoForm) => apiRequest('POST', '/api/admin/token-programs/dao-maker/shos', data),
    onSuccess: () => {
      toast({ title: "성공", description: "DAO Maker SHO가 생성되었습니다." });
      setShowCreateSho(false);
      setShoForm({ shoName: '', tokenSymbol: 'TBURN', tokenPrice: '0.02', totalAllocation: '25000000000000000000000000', hardCap: '500000', minDaoPower: 100, minPurchase: '100', maxPurchase: '2500', totalWinners: 500, registrationStart: '', registrationEnd: '', saleStart: '', saleEnd: '', tgePercentage: 20, vestingMonths: 9, kycRequired: true, status: 'draft', notes: '' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/dao-maker/shos'] });
    },
    onError: () => { toast({ title: "오류", description: "SHO 생성 실패", variant: "destructive" }); }
  });

  const updateShoMutation = useMutation({
    mutationFn: (data: { id: string } & Partial<DaoMakerSho>) => apiRequest('PATCH', `/api/admin/token-programs/dao-maker/shos/${data.id}`, data),
    onSuccess: () => {
      toast({ title: "성공", description: "SHO 정보가 업데이트되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/dao-maker/shos'] });
      refetchDetail();
    },
  });

  const createParticipantMutation = useMutation({
    mutationFn: (data: { shoId: string } & typeof participantForm) => apiRequest('POST', `/api/admin/token-programs/dao-maker/shos/${data.shoId}/participants`, data),
    onSuccess: () => {
      toast({ title: "성공", description: "참여자가 추가되었습니다." });
      setShowAddParticipant(false);
      setParticipantForm({ walletAddress: '', email: '', daoPower: 500, stakedAmount: '10000000000000000000000', investmentAmount: '500', investmentCurrency: 'usdt', kycVerified: false, status: 'registered', notes: '' });
      refetchDetail();
    },
    onError: () => { toast({ title: "오류", description: "참여자 추가 실패", variant: "destructive" }); }
  });

  const updateParticipantMutation = useMutation({
    mutationFn: (data: { id: string } & Partial<DaoMakerParticipant>) => apiRequest('PATCH', `/api/admin/token-programs/dao-maker/participants/${data.id}`, data),
    onSuccess: () => {
      toast({ title: "성공", description: "참여자 정보가 업데이트되었습니다." });
      refetchDetail();
    },
  });

  const selectWinnersMutation = useMutation({
    mutationFn: (data: { shoId: string; count: number }) => apiRequest('POST', `/api/admin/token-programs/dao-maker/shos/${data.shoId}/select-winners`, { count: data.count }),
    onSuccess: (response: any) => {
      toast({ title: "성공", description: `${response.data?.winnersSelected || 0}명의 당첨자가 선정되었습니다. (DAO Power 가중 추첨)` });
      setShowSelectWinners(false);
      refetchDetail();
    },
    onError: () => { toast({ title: "오류", description: "당첨자 선정 실패", variant: "destructive" }); }
  });

  const stats = shosData?.data?.stats || { totalShos: 0, activeShos: 0, totalParticipants: 0, totalWinners: 0, totalRaised: '0', avgDaoPower: 0 };
  const shos = shosData?.data?.shos || [];
  const participants = shoDetail?.data?.participants || [];

  const filteredShos = shos.filter(s => 
    s.shoName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.tokenSymbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredParticipants = participants.filter(p =>
    p.walletAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (selectedSho) {
    const sho = shoDetail?.data?.sho || selectedSho;
    const progress = parseFloat(sho.raisedAmount || '0') / parseFloat(sho.hardCap || '1') * 100;
    const kycVerifiedCount = participants.filter(p => p.kycVerified).length;
    const winnersCount = participants.filter(p => p.isWinner).length;
    const paidCount = participants.filter(p => p.paymentReceived).length;
    const avgPower = participants.length > 0 ? Math.round(participants.reduce((s, p) => s + p.daoPower, 0) / participants.length) : 0;
    const tierCounts = { diamond: 0, platinum: 0, gold: 0, silver: 0, bronze: 0 };
    participants.forEach(p => { if (tierCounts[p.tier as keyof typeof tierCounts] !== undefined) tierCounts[p.tier as keyof typeof tierCounts]++; });

    return (
      <div className="flex flex-col gap-6 p-6" data-testid="dao-maker-sho-detail">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setSelectedSho(null)} data-testid="button-back-to-list">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold" data-testid="text-sho-name">{sho.shoName}</h1>
              {getStatusBadge(sho.status)}
            </div>
            <p className="text-muted-foreground">{sho.tokenSymbol} Strong Holder Offering - DAO Power 기반 가중 추첨</p>
          </div>
          <Select value={sho.status} onValueChange={(v) => updateShoMutation.mutate({ id: sho.id, status: v })}>
            <SelectTrigger className="w-40" data-testid="select-sho-status"><SelectValue /></SelectTrigger>
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card><CardHeader className="flex flex-row items-center justify-between gap-1 pb-2"><CardTitle className="text-sm font-medium">참여자</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{participants.length}</div><p className="text-xs text-muted-foreground">총 {sho.totalWinners}명 선정</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between gap-1 pb-2"><CardTitle className="text-sm font-medium">KYC 완료</CardTitle><UserCheck className="h-4 w-4 text-purple-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{kycVerifiedCount}</div><p className="text-xs text-muted-foreground">{participants.length > 0 ? ((kycVerifiedCount / participants.length) * 100).toFixed(1) : 0}%</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between gap-1 pb-2"><CardTitle className="text-sm font-medium">당첨자</CardTitle><Trophy className="h-4 w-4 text-yellow-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{winnersCount}</div><p className="text-xs text-muted-foreground">Winners</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between gap-1 pb-2"><CardTitle className="text-sm font-medium">결제 완료</CardTitle><CheckCircle2 className="h-4 w-4 text-emerald-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{paidCount}</div><p className="text-xs text-muted-foreground">Paid</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between gap-1 pb-2"><CardTitle className="text-sm font-medium">평균 DAO Power</CardTitle><Zap className="h-4 w-4 text-yellow-400" /></CardHeader><CardContent><div className="text-2xl font-bold">{avgPower.toLocaleString()}</div><p className="text-xs text-muted-foreground">min: {sho.minDaoPower}</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between gap-1 pb-2"><CardTitle className="text-sm font-medium">모금액</CardTitle><DollarSign className="h-4 w-4 text-emerald-500" /></CardHeader><CardContent><div className="text-2xl font-bold">${parseFloat(sho.raisedAmount || '0').toLocaleString()}</div><Progress value={progress} className="h-2 mt-2" /></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle className="text-lg">SHO 정보</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">토큰 가격</span><span className="font-medium">${sho.tokenPrice}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">총 배분량</span><span className="font-medium">{formatTBURN(sho.totalAllocation)} TBURN</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">하드캡</span><span className="font-medium">${parseFloat(sho.hardCap).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">최소 DAO Power</span><span className="font-medium">{sho.minDaoPower}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">참여 범위</span><span className="font-medium">${sho.minPurchase} - ${sho.maxPurchase}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">TGE</span><span className="font-medium">{sho.tgePercentage}%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">베스팅</span><span className="font-medium">{sho.vestingMonths}개월</span></div>
              <div className="border-t pt-3 mt-3">
                <p className="text-muted-foreground mb-2">티어 분포</p>
                <div className="grid grid-cols-5 gap-1 text-xs text-center">
                  <div><Crown className="h-4 w-4 mx-auto text-cyan-400" /><p>{tierCounts.diamond}</p></div>
                  <div><Star className="h-4 w-4 mx-auto text-purple-400" /><p>{tierCounts.platinum}</p></div>
                  <div><Trophy className="h-4 w-4 mx-auto text-yellow-400" /><p>{tierCounts.gold}</p></div>
                  <div><Shield className="h-4 w-4 mx-auto text-gray-400" /><p>{tierCounts.silver}</p></div>
                  <div><Gem className="h-4 w-4 mx-auto text-orange-400" /><p>{tierCounts.bronze}</p></div>
                </div>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between mb-2"><span className="text-muted-foreground">등록 시작</span><span className="font-medium">{formatDateTime(sho.registrationStart)}</span></div>
                <div className="flex justify-between mb-2"><span className="text-muted-foreground">등록 종료</span><span className="font-medium">{formatDateTime(sho.registrationEnd)}</span></div>
                <div className="flex justify-between mb-2"><span className="text-muted-foreground">세일 시작</span><span className="font-medium">{formatDateTime(sho.saleStart)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">세일 종료</span><span className="font-medium">{formatDateTime(sho.saleEnd)}</span></div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div><CardTitle>SHO 참여자</CardTitle><CardDescription>{participants.length}명 등록 (DAO Power 순)</CardDescription></div>
                <div className="flex gap-2">
                  <Dialog open={showSelectWinners} onOpenChange={setShowSelectWinners}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" data-testid="button-select-winners"><Trophy className="mr-2 h-4 w-4" />가중 추첨</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>DAO Power 가중 추첨</DialogTitle><DialogDescription>KYC 인증 완료된 참여자 중 DAO Power에 비례하여 당첨자를 선정합니다. 높은 DAO Power = 높은 당첨 확률</DialogDescription></DialogHeader>
                      <div className="py-4">
                        <Label>선정 인원</Label>
                        <Input type="number" value={winnerCount} onChange={(e) => setWinnerCount(parseInt(e.target.value) || 0)} className="mt-2" data-testid="input-winner-count" />
                        <p className="text-sm text-muted-foreground mt-2">KYC 완료: {kycVerifiedCount}명 / 미당첨: {kycVerifiedCount - winnersCount}명</p>
                        <p className="text-sm text-muted-foreground">평균 DAO Power: {avgPower}</p>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSelectWinners(false)}>취소</Button>
                        <Button onClick={() => selectWinnersMutation.mutate({ shoId: sho.id, count: winnerCount })} disabled={selectWinnersMutation.isPending} data-testid="button-confirm-select">
                          {selectWinnersMutation.isPending ? '추첨 중...' : '가중 추첨 실행'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={showAddParticipant} onOpenChange={setShowAddParticipant}>
                    <DialogTrigger asChild>
                      <Button size="sm" data-testid="button-add-participant"><Plus className="mr-2 h-4 w-4" />참여자 추가</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader><DialogTitle>SHO 참여자 추가</DialogTitle><DialogDescription>새 DAO Maker SHO 참여자를 등록합니다.</DialogDescription></DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2"><Label>지갑 주소 *</Label><Input value={participantForm.walletAddress} onChange={(e) => setParticipantForm({...participantForm, walletAddress: e.target.value})} placeholder="tb1..." data-testid="input-participant-wallet" /></div>
                        <div className="grid gap-2"><Label>이메일</Label><Input value={participantForm.email} onChange={(e) => setParticipantForm({...participantForm, email: e.target.value})} /></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2"><Label>DAO Power *</Label><Input type="number" value={participantForm.daoPower} onChange={(e) => setParticipantForm({...participantForm, daoPower: parseInt(e.target.value) || 0})} data-testid="input-dao-power" /></div>
                          <div className="grid gap-2"><Label>투자금액 ($)</Label><Input type="number" value={participantForm.investmentAmount} onChange={(e) => setParticipantForm({...participantForm, investmentAmount: e.target.value})} /></div>
                        </div>
                        <div className="flex items-center gap-2"><Switch checked={participantForm.kycVerified} onCheckedChange={(v) => setParticipantForm({...participantForm, kycVerified: v})} /><Label>KYC 인증됨</Label></div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddParticipant(false)}>취소</Button>
                        <Button onClick={() => createParticipantMutation.mutate({ shoId: sho.id, ...participantForm })} disabled={createParticipantMutation.isPending || !participantForm.walletAddress} data-testid="button-confirm-add">
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
                    <TableHeader><TableRow><TableHead>지갑</TableHead><TableHead className="text-center">티어</TableHead><TableHead className="text-right">DAO Power</TableHead><TableHead className="text-center">KYC</TableHead><TableHead className="text-center">당첨</TableHead><TableHead className="text-right">투자</TableHead><TableHead>상태</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {filteredParticipants.map((p) => (
                        <TableRow key={p.id} className="cursor-pointer hover-elevate" onClick={() => setSelectedParticipant(p)} data-testid={`row-participant-${p.id}`}>
                          <TableCell className="font-mono text-xs">{p.walletAddress.slice(0, 10)}...</TableCell>
                          <TableCell className="text-center">{getTierBadge(p.tier)}</TableCell>
                          <TableCell className="text-right font-medium">{p.daoPower.toLocaleString()}</TableCell>
                          <TableCell className="text-center">{p.kycVerified ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" /> : <span className="text-muted-foreground">-</span>}</TableCell>
                          <TableCell className="text-center">{p.isWinner ? <Trophy className="h-4 w-4 text-yellow-500 mx-auto" /> : <span className="text-muted-foreground">-</span>}</TableCell>
                          <TableCell className="text-right">${parseFloat(p.investmentAmount).toLocaleString()}</TableCell>
                          <TableCell>
                            <Select value={p.status} onValueChange={(v) => updateParticipantMutation.mutate({ id: p.id, status: v })}>
                              <SelectTrigger className="h-7 w-28"><SelectValue /></SelectTrigger>
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
                    <div><span className="text-muted-foreground text-sm">지갑 주소</span><p className="font-mono text-sm break-all">{selectedParticipant.walletAddress}</p></div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-muted-foreground">이메일</span><p className="font-medium">{selectedParticipant.email || '-'}</p></div>
                      <div><span className="text-muted-foreground">티어</span><p className="mt-1">{getTierBadge(selectedParticipant.tier)}</p></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-muted-foreground">DAO Power</span><p className="font-bold text-lg">{selectedParticipant.daoPower.toLocaleString()}</p></div>
                      <div><span className="text-muted-foreground">투자 금액</span><p className="font-medium">${parseFloat(selectedParticipant.investmentAmount).toLocaleString()}</p></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-muted-foreground">배분 토큰</span><p className="font-medium">{formatTBURN(selectedParticipant.tokenAmount)} TBURN</p></div>
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
                      <Label>DAO Power 수정</Label>
                      <Input type="number" value={selectedParticipant.daoPower} onChange={(e) => setSelectedParticipant({...selectedParticipant, daoPower: parseInt(e.target.value) || 0})} className="mt-2" />
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => updateParticipantMutation.mutate({ id: selectedParticipant.id, daoPower: selectedParticipant.daoPower })}>Power 업데이트</Button>
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
    <div className="flex flex-col gap-6 p-6" data-testid="admin-dao-maker-page">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/admin/token-distribution")} data-testid="button-back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            DAO Maker SHO 관리
          </h1>
          <p className="text-muted-foreground">DAO Maker Strong Holder Offering - DAO Power 기반 가중 추첨 토큰 세일</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh">
          <RefreshCw className="mr-2 h-4 w-4" />새로고침
        </Button>
        <Dialog open={showCreateSho} onOpenChange={setShowCreateSho}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-sho"><Plus className="mr-2 h-4 w-4" />새 SHO 생성</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>새 DAO Maker SHO 생성</DialogTitle><DialogDescription>DAO Power 기반 가중 추첨 방식의 토큰 세일을 생성합니다.</DialogDescription></DialogHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3"><TabsTrigger value="info">기본 정보</TabsTrigger><TabsTrigger value="sale">세일 설정</TabsTrigger><TabsTrigger value="schedule">일정</TabsTrigger></TabsList>
              <TabsContent value="info" className="space-y-4 mt-4">
                <div className="grid gap-2"><Label>SHO 이름 *</Label><Input value={shoForm.shoName} onChange={(e) => setShoForm({...shoForm, shoName: e.target.value})} placeholder="TBURN SHO Round 1" data-testid="input-sho-name" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label>토큰 심볼</Label><Input value={shoForm.tokenSymbol} onChange={(e) => setShoForm({...shoForm, tokenSymbol: e.target.value})} /></div>
                  <div className="grid gap-2"><Label>토큰 가격 ($)</Label><Input value={shoForm.tokenPrice} onChange={(e) => setShoForm({...shoForm, tokenPrice: e.target.value})} /></div>
                </div>
                <div className="grid gap-2"><Label>총 배분량 (wei)</Label><Input value={shoForm.totalAllocation} onChange={(e) => setShoForm({...shoForm, totalAllocation: e.target.value})} /></div>
                <div className="grid gap-2"><Label>비고</Label><Textarea value={shoForm.notes} onChange={(e) => setShoForm({...shoForm, notes: e.target.value})} placeholder="SHO 관련 메모..." /></div>
              </TabsContent>
              <TabsContent value="sale" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label>하드캡 ($)</Label><Input value={shoForm.hardCap} onChange={(e) => setShoForm({...shoForm, hardCap: e.target.value})} /></div>
                  <div className="grid gap-2"><Label>당첨자 수</Label><Input type="number" value={shoForm.totalWinners} onChange={(e) => setShoForm({...shoForm, totalWinners: parseInt(e.target.value) || 500})} /></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2"><Label>최소 DAO Power</Label><Input type="number" value={shoForm.minDaoPower} onChange={(e) => setShoForm({...shoForm, minDaoPower: parseInt(e.target.value) || 100})} /></div>
                  <div className="grid gap-2"><Label>최소 참여 ($)</Label><Input value={shoForm.minPurchase} onChange={(e) => setShoForm({...shoForm, minPurchase: e.target.value})} /></div>
                  <div className="grid gap-2"><Label>최대 참여 ($)</Label><Input value={shoForm.maxPurchase} onChange={(e) => setShoForm({...shoForm, maxPurchase: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label>TGE 비율 (%)</Label><Input type="number" value={shoForm.tgePercentage} onChange={(e) => setShoForm({...shoForm, tgePercentage: parseInt(e.target.value) || 20})} /></div>
                  <div className="grid gap-2"><Label>베스팅 기간 (월)</Label><Input type="number" value={shoForm.vestingMonths} onChange={(e) => setShoForm({...shoForm, vestingMonths: parseInt(e.target.value) || 9})} /></div>
                </div>
                <div className="flex items-center gap-2"><Switch checked={shoForm.kycRequired} onCheckedChange={(v) => setShoForm({...shoForm, kycRequired: v})} /><Label>KYC 필수</Label></div>
              </TabsContent>
              <TabsContent value="schedule" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label>등록 시작</Label><Input type="datetime-local" value={shoForm.registrationStart} onChange={(e) => setShoForm({...shoForm, registrationStart: e.target.value})} /></div>
                  <div className="grid gap-2"><Label>등록 종료</Label><Input type="datetime-local" value={shoForm.registrationEnd} onChange={(e) => setShoForm({...shoForm, registrationEnd: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label>세일 시작</Label><Input type="datetime-local" value={shoForm.saleStart} onChange={(e) => setShoForm({...shoForm, saleStart: e.target.value})} /></div>
                  <div className="grid gap-2"><Label>세일 종료</Label><Input type="datetime-local" value={shoForm.saleEnd} onChange={(e) => setShoForm({...shoForm, saleEnd: e.target.value})} /></div>
                </div>
                <div className="grid gap-2">
                  <Label>상태</Label>
                  <Select value={shoForm.status} onValueChange={(v) => setShoForm({...shoForm, status: v})}>
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
              <Button variant="outline" onClick={() => setShowCreateSho(false)}>취소</Button>
              <Button onClick={() => createShoMutation.mutate(shoForm)} disabled={createShoMutation.isPending || !shoForm.shoName} data-testid="button-confirm-create">
                {createShoMutation.isPending ? '생성 중...' : '생성'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardHeader className="flex flex-row items-center justify-between gap-1 pb-2"><CardTitle className="text-sm font-medium">전체 SHO</CardTitle><Gem className="h-4 w-4 text-purple-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalShos}</div><p className="text-xs text-muted-foreground">진행중: {stats.activeShos}</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between gap-1 pb-2"><CardTitle className="text-sm font-medium">총 참여자</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalParticipants}</div><p className="text-xs text-muted-foreground">Participants</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between gap-1 pb-2"><CardTitle className="text-sm font-medium">평균 DAO Power</CardTitle><Zap className="h-4 w-4 text-yellow-400" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.avgDaoPower.toLocaleString()}</div><p className="text-xs text-muted-foreground">Average Power</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between gap-1 pb-2"><CardTitle className="text-sm font-medium">총 모금액</CardTitle><DollarSign className="h-4 w-4 text-emerald-500" /></CardHeader><CardContent><div className="text-2xl font-bold">${parseFloat(stats.totalRaised).toLocaleString()}</div><p className="text-xs text-muted-foreground">Total Raised</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div><CardTitle>DAO Maker SHO 목록</CardTitle><CardDescription>DAO Power 기반 가중 추첨 토큰 세일 관리</CardDescription></div>
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="SHO 검색..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-64" data-testid="input-search" /></div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
          ) : shos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><Gem className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>DAO Maker SHO가 없습니다</p><p className="text-sm">새 SHO를 생성해주세요</p></div>
          ) : (
            <div className="grid gap-4">
              {filteredShos.map((sho) => {
                const progress = parseFloat(sho.raisedAmount || '0') / parseFloat(sho.hardCap || '1') * 100;
                return (
                  <Card key={sho.id} className="cursor-pointer hover-elevate" onClick={() => setSelectedSho(sho)} data-testid={`card-sho-${sho.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{sho.shoName}</h3>
                            {getStatusBadge(sho.status)}
                            <Badge variant="outline" className="gap-1"><Zap className="h-3 w-3" />min {sho.minDaoPower}</Badge>
                          </div>
                          <div className="flex gap-6 text-sm text-muted-foreground">
                            <span>{sho.tokenSymbol} @ ${sho.tokenPrice}</span>
                            <span>{sho.totalWinners} winners</span>
                            <span>TGE {sho.tgePercentage}%</span>
                            {sho.registrationStart && <span><Calendar className="inline h-3 w-3 mr-1" />{formatDate(sho.registrationStart)}</span>}
                          </div>
                        </div>
                        <div className="text-right min-w-[150px]">
                          <div className="text-lg font-bold">${parseFloat(sho.raisedAmount || '0').toLocaleString()}</div>
                          <Progress value={progress} className="h-2 w-32 mt-1" />
                          <p className="text-xs text-muted-foreground mt-1">{progress.toFixed(1)}% of ${parseFloat(sho.hardCap).toLocaleString()}</p>
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
