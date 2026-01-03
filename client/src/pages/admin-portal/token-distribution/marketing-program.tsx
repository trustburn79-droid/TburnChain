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
import { Megaphone, Target, Coins, BarChart3, Search, RefreshCw, ArrowLeft, Plus, Eye, Edit, Users, Gift, Calendar, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface MarketingCampaign {
  id: string;
  name: string;
  description: string | null;
  campaignType: string;
  channel: string;
  targetAudience: string | null;
  budgetAmount: string;
  spentAmount: string;
  rewardPerAction: string;
  totalParticipants: number;
  totalReach: number;
  totalEngagements: number;
  totalConversions: number;
  startDate: string | null;
  endDate: string | null;
  status: string;
  goals: any;
  requirements: any;
  createdBy: string | null;
  approvedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

interface MarketingParticipant {
  id: string;
  campaignId: string;
  walletAddress: string;
  username: string | null;
  platform: string;
  actionsCompleted: number;
  totalRewards: string;
  referralCode: string | null;
  referralCount: number;
  status: string;
  joinedAt: string;
  lastActivity: string | null;
}

interface MarketingReward {
  id: string;
  campaignId: string;
  participantId: string;
  actionType: string;
  rewardAmount: string;
  status: string;
  txHash: string | null;
  metadata: any;
  verifiedAt: string | null;
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
  pending: { label: "대기", color: "bg-yellow-500/20 text-yellow-400" },
  active: { label: "활성", color: "bg-emerald-500/20 text-emerald-400" },
  paused: { label: "일시중지", color: "bg-orange-500/20 text-orange-400" },
  completed: { label: "완료", color: "bg-blue-500/20 text-blue-400" },
  cancelled: { label: "취소됨", color: "bg-red-500/20 text-red-400" },
};

const REWARD_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: "대기", color: "bg-yellow-500/20 text-yellow-400" },
  verified: { label: "검증됨", color: "bg-blue-500/20 text-blue-400" },
  approved: { label: "승인됨", color: "bg-purple-500/20 text-purple-400" },
  paid: { label: "지급됨", color: "bg-emerald-500/20 text-emerald-400" },
  rejected: { label: "거부됨", color: "bg-red-500/20 text-red-400" },
};

const CAMPAIGN_TYPES = [
  { value: "social_media", label: "소셜미디어", labelEn: "Social Media" },
  { value: "influencer", label: "인플루언서", labelEn: "Influencer" },
  { value: "content_creation", label: "콘텐츠제작", labelEn: "Content Creation" },
  { value: "community", label: "커뮤니티", labelEn: "Community" },
  { value: "ambassador", label: "앰배서더", labelEn: "Ambassador" },
  { value: "bounty", label: "바운티", labelEn: "Bounty" },
  { value: "referral_boost", label: "추천부스트", labelEn: "Referral Boost" },
  { value: "airdrop_promotion", label: "에어드롭홍보", labelEn: "Airdrop Promo" },
];

const MARKETING_CHANNELS = [
  { value: "twitter", label: "트위터/X" },
  { value: "discord", label: "디스코드" },
  { value: "telegram", label: "텔레그램" },
  { value: "youtube", label: "유튜브" },
  { value: "tiktok", label: "틱톡" },
  { value: "medium", label: "미디엄" },
  { value: "reddit", label: "레딧" },
  { value: "instagram", label: "인스타그램" },
  { value: "facebook", label: "페이스북" },
  { value: "email", label: "이메일" },
  { value: "other", label: "기타" },
];

const ACTION_TYPES = [
  { value: "follow", label: "팔로우" },
  { value: "like", label: "좋아요" },
  { value: "retweet", label: "리트윗" },
  { value: "comment", label: "댓글" },
  { value: "share", label: "공유" },
  { value: "post", label: "포스팅" },
  { value: "video", label: "영상제작" },
  { value: "article", label: "아티클" },
  { value: "referral", label: "추천" },
  { value: "signup", label: "가입" },
  { value: "verify_wallet", label: "지갑인증" },
  { value: "stake", label: "스테이킹" },
  { value: "trade", label: "거래" },
];

export default function AdminMarketingProgram() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [isAddRewardOpen, setIsAddRewardOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<MarketingCampaign | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    campaignType: "social_media",
    channel: "twitter",
    targetAudience: "",
    budgetAmount: "100000000000000000000000",
    rewardPerAction: "1000000000000000000000",
    startDate: "",
    endDate: "",
  });

  const [participantForm, setParticipantForm] = useState({
    walletAddress: "",
    username: "",
    platform: "twitter",
  });

  const [rewardForm, setRewardForm] = useState({
    participantId: "",
    actionType: "follow",
    rewardAmount: "1000000000000000000000",
  });

  const { data: campaignsData, isLoading, refetch } = useQuery<{ success: boolean; data: { campaigns: MarketingCampaign[]; stats: any } }>({
    queryKey: ['/api/admin/token-programs/marketing/campaigns'],
  });

  const { data: campaignDetailData, isLoading: detailLoading } = useQuery<{ success: boolean; data: { campaign: MarketingCampaign; participants: MarketingParticipant[]; rewards: MarketingReward[] } }>({
    queryKey: ['/api/admin/token-programs/marketing/campaigns', selectedCampaign?.id],
    enabled: !!selectedCampaign && isDetailOpen,
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('POST', '/api/admin/token-programs/marketing/campaigns', {
        ...data,
        status: "draft",
        spentAmount: "0",
        totalParticipants: 0,
        totalReach: 0,
        totalEngagements: 0,
        totalConversions: 0,
      });
    },
    onSuccess: () => {
      toast({ title: "캠페인 생성 완료", description: "새 마케팅 캠페인이 등록되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/marketing/campaigns'] });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "오류", description: "캠페인 생성에 실패했습니다.", variant: "destructive" });
    }
  });

  const updateCampaignMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<MarketingCampaign> }) => {
      return apiRequest('PATCH', `/api/admin/token-programs/marketing/campaigns/${id}`, data);
    },
    onSuccess: () => {
      toast({ title: "캠페인 수정 완료", description: "캠페인 정보가 수정되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/marketing/campaigns'] });
      setIsEditOpen(false);
      setSelectedCampaign(null);
    },
    onError: () => {
      toast({ title: "오류", description: "캠페인 수정에 실패했습니다.", variant: "destructive" });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest('PATCH', `/api/admin/token-programs/marketing/campaigns/${id}`, { 
        status,
        ...(status === 'active' ? { approvedBy: 'admin' } : {})
      });
    },
    onSuccess: () => {
      toast({ title: "상태 변경 완료", description: "캠페인 상태가 변경되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/marketing/campaigns'] });
      if (selectedCampaign) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/marketing/campaigns', selectedCampaign.id] });
      }
    },
  });

  const addParticipantMutation = useMutation({
    mutationFn: async ({ campaignId, data }: { campaignId: string; data: typeof participantForm }) => {
      return apiRequest('POST', `/api/admin/token-programs/marketing/campaigns/${campaignId}/participants`, {
        ...data,
        status: "active",
        actionsCompleted: 0,
        totalRewards: "0",
        referralCount: 0,
      });
    },
    onSuccess: () => {
      toast({ title: "참여자 추가 완료", description: "새 참여자가 등록되었습니다." });
      if (selectedCampaign) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/marketing/campaigns', selectedCampaign.id] });
      }
      setIsAddParticipantOpen(false);
      setParticipantForm({ walletAddress: "", username: "", platform: "twitter" });
    },
    onError: () => {
      toast({ title: "오류", description: "참여자 추가에 실패했습니다.", variant: "destructive" });
    }
  });

  const addRewardMutation = useMutation({
    mutationFn: async ({ campaignId, data }: { campaignId: string; data: typeof rewardForm }) => {
      return apiRequest('POST', `/api/admin/token-programs/marketing/campaigns/${campaignId}/rewards`, {
        ...data,
        status: "pending",
      });
    },
    onSuccess: () => {
      toast({ title: "리워드 추가 완료", description: "새 리워드가 등록되었습니다." });
      if (selectedCampaign) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/marketing/campaigns', selectedCampaign.id] });
      }
      setIsAddRewardOpen(false);
      setRewardForm({ participantId: "", actionType: "follow", rewardAmount: "1000000000000000000000" });
    },
    onError: () => {
      toast({ title: "오류", description: "리워드 추가에 실패했습니다.", variant: "destructive" });
    }
  });

  const updateRewardMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest('PATCH', `/api/admin/token-programs/marketing/rewards/${id}`, { 
        status,
        ...(status === 'paid' ? { paidAt: new Date().toISOString() } : {}),
        ...(status === 'verified' ? { verifiedAt: new Date().toISOString() } : {}),
      });
    },
    onSuccess: () => {
      toast({ title: "리워드 상태 변경", description: "리워드 상태가 변경되었습니다." });
      if (selectedCampaign) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/marketing/campaigns', selectedCampaign.id] });
      }
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      campaignType: "social_media",
      channel: "twitter",
      targetAudience: "",
      budgetAmount: "100000000000000000000000",
      rewardPerAction: "1000000000000000000000",
      startDate: "",
      endDate: "",
    });
  };

  const openEditDialog = (campaign: MarketingCampaign) => {
    setSelectedCampaign(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description || "",
      campaignType: campaign.campaignType,
      channel: campaign.channel,
      targetAudience: campaign.targetAudience || "",
      budgetAmount: campaign.budgetAmount,
      rewardPerAction: campaign.rewardPerAction,
      startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().slice(0, 10) : "",
      endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().slice(0, 10) : "",
    });
    setIsEditOpen(true);
  };

  const openDetailDialog = (campaign: MarketingCampaign) => {
    setSelectedCampaign(campaign);
    setIsDetailOpen(true);
  };

  const stats = campaignsData?.data?.stats || { totalCampaigns: 0, activeCampaigns: 0, totalBudget: "0", totalSpent: "0", totalReach: 0 };
  const campaignList = Array.isArray(campaignsData?.data?.campaigns) ? campaignsData.data.campaigns : [];
  const participants = campaignDetailData?.data?.participants || [];
  const rewards = campaignDetailData?.data?.rewards || [];

  const filteredCampaigns = campaignList.filter(campaign => {
    const matchesSearch = searchQuery === "" || 
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
    const matchesChannel = channelFilter === "all" || campaign.channel === channelFilter;
    return matchesSearch && matchesStatus && matchesChannel;
  });

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="admin-marketing-program-page">
      <div className="flex items-center gap-4">
        <Link href="/admin/token-distribution">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            마케팅 프로그램 관리
          </h1>
          <p className="text-muted-foreground">Marketing Program Management - 1월 3일 정식 오픈</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh">
          <RefreshCw className="mr-2 h-4 w-4" />
          새로고침
        </Button>
        <Button onClick={() => { resetForm(); setIsCreateOpen(true); }} data-testid="button-add-campaign">
          <Plus className="mr-2 h-4 w-4" />
          새 캠페인
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total-campaigns">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">총 캠페인</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">Total Campaigns</p>
          </CardContent>
        </Card>
        <Card data-testid="card-active-campaigns">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">진행중</CardTitle>
            <Target className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">Active Campaigns</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-budget">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">마케팅 예산</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTBURN(stats.totalBudget)} TBURN</div>
            <p className="text-xs text-muted-foreground">Marketing Budget</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-reach">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">도달 수</CardTitle>
            <BarChart3 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReach.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Reach</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>마케팅 캠페인 목록</CardTitle>
              <CardDescription>Marketing Campaigns List - 캠페인 관리</CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-28" data-testid="select-status-filter">
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="draft">초안</SelectItem>
                  <SelectItem value="active">활성</SelectItem>
                  <SelectItem value="paused">일시중지</SelectItem>
                  <SelectItem value="completed">완료</SelectItem>
                  <SelectItem value="cancelled">취소됨</SelectItem>
                </SelectContent>
              </Select>
              <Select value={channelFilter} onValueChange={setChannelFilter}>
                <SelectTrigger className="w-32" data-testid="select-channel-filter">
                  <SelectValue placeholder="채널" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {MARKETING_CHANNELS.map(ch => (
                    <SelectItem key={ch.value} value={ch.value}>{ch.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="캠페인 검색..."
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
          ) : filteredCampaigns.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>마케팅 캠페인 데이터가 없습니다</p>
              <p className="text-sm">No marketing campaigns found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>캠페인명</TableHead>
                  <TableHead>유형</TableHead>
                  <TableHead>채널</TableHead>
                  <TableHead className="text-right">예산</TableHead>
                  <TableHead className="text-right">참여자</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((campaign) => (
                  <TableRow key={campaign.id} data-testid={`row-campaign-${campaign.id}`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Megaphone className="h-4 w-4 text-muted-foreground" />
                        {campaign.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {CAMPAIGN_TYPES.find(t => t.value === campaign.campaignType)?.label || campaign.campaignType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-blue-500/20 text-blue-400">
                        {MARKETING_CHANNELS.find(c => c.value === campaign.channel)?.label || campaign.channel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatTBURN(campaign.budgetAmount)} TBURN</TableCell>
                    <TableCell className="text-right">{campaign.totalParticipants.toLocaleString()}</TableCell>
                    <TableCell>
                      <Select 
                        value={campaign.status} 
                        onValueChange={(v) => updateStatusMutation.mutate({ id: campaign.id, status: v })}
                      >
                        <SelectTrigger className="w-28 h-8" data-testid={`select-status-${campaign.id}`}>
                          <Badge className={STATUS_LABELS[campaign.status]?.color || 'bg-gray-500/20'}>
                            {STATUS_LABELS[campaign.status]?.label || campaign.status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">초안</SelectItem>
                          <SelectItem value="active">활성</SelectItem>
                          <SelectItem value="paused">일시중지</SelectItem>
                          <SelectItem value="completed">완료</SelectItem>
                          <SelectItem value="cancelled">취소됨</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openDetailDialog(campaign)} data-testid={`button-detail-${campaign.id}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(campaign)} data-testid={`button-edit-${campaign.id}`}>
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
            <DialogTitle>새 마케팅 캠페인</DialogTitle>
            <DialogDescription>새로운 마케팅 캠페인을 등록합니다.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">캠페인명 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="캠페인 이름"
                data-testid="input-campaign-name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>캠페인 유형</Label>
                <Select value={formData.campaignType} onValueChange={(v) => setFormData({ ...formData, campaignType: v })}>
                  <SelectTrigger data-testid="select-campaign-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CAMPAIGN_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label} ({type.labelEn})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>채널</Label>
                <Select value={formData.channel} onValueChange={(v) => setFormData({ ...formData, channel: v })}>
                  <SelectTrigger data-testid="select-channel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MARKETING_CHANNELS.map(ch => (
                      <SelectItem key={ch.value} value={ch.value}>{ch.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="캠페인 설명..."
                rows={2}
                data-testid="input-description"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="targetAudience">타겟 오디언스</Label>
              <Input
                id="targetAudience"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                placeholder="예: 한국 크립토 커뮤니티, DeFi 사용자"
                data-testid="input-target-audience"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="budgetAmount">예산 (wei)</Label>
                <Input
                  id="budgetAmount"
                  value={formData.budgetAmount}
                  onChange={(e) => setFormData({ ...formData, budgetAmount: e.target.value })}
                  data-testid="input-budget-amount"
                />
                <p className="text-xs text-muted-foreground">≈ {formatTBURN(formData.budgetAmount)} TBURN</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rewardPerAction">액션당 리워드 (wei)</Label>
                <Input
                  id="rewardPerAction"
                  value={formData.rewardPerAction}
                  onChange={(e) => setFormData({ ...formData, rewardPerAction: e.target.value })}
                  data-testid="input-reward-per-action"
                />
                <p className="text-xs text-muted-foreground">≈ {formatTBURN(formData.rewardPerAction)} TBURN</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} data-testid="button-cancel-create">
              취소
            </Button>
            <Button 
              onClick={() => createCampaignMutation.mutate(formData)}
              disabled={!formData.name || createCampaignMutation.isPending}
              data-testid="button-submit-create"
            >
              {createCampaignMutation.isPending ? "등록 중..." : "등록"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>캠페인 수정</DialogTitle>
            <DialogDescription>"{selectedCampaign?.name}" 정보를 수정합니다.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>캠페인명</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                data-testid="input-edit-campaign-name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>캠페인 유형</Label>
                <Select value={formData.campaignType} onValueChange={(v) => setFormData({ ...formData, campaignType: v })}>
                  <SelectTrigger data-testid="select-edit-campaign-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CAMPAIGN_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>채널</Label>
                <Select value={formData.channel} onValueChange={(v) => setFormData({ ...formData, channel: v })}>
                  <SelectTrigger data-testid="select-edit-channel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MARKETING_CHANNELS.map(ch => (
                      <SelectItem key={ch.value} value={ch.value}>{ch.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>예산 (wei)</Label>
                <Input
                  value={formData.budgetAmount}
                  onChange={(e) => setFormData({ ...formData, budgetAmount: e.target.value })}
                  data-testid="input-edit-budget-amount"
                />
              </div>
              <div className="grid gap-2">
                <Label>액션당 리워드 (wei)</Label>
                <Input
                  value={formData.rewardPerAction}
                  onChange={(e) => setFormData({ ...formData, rewardPerAction: e.target.value })}
                  data-testid="input-edit-reward-per-action"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} data-testid="button-cancel-edit">
              취소
            </Button>
            <Button 
              onClick={() => selectedCampaign && updateCampaignMutation.mutate({ id: selectedCampaign.id, data: formData })}
              disabled={updateCampaignMutation.isPending}
              data-testid="button-submit-edit"
            >
              {updateCampaignMutation.isPending ? "저장 중..." : "저장"}
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
                  <Megaphone className="h-5 w-5" />
                  {selectedCampaign?.name}
                </DialogTitle>
                <DialogDescription>캠페인 상세 정보 및 참여자 관리</DialogDescription>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-blue-500/20 text-blue-400">
                  {MARKETING_CHANNELS.find(c => c.value === selectedCampaign?.channel)?.label}
                </Badge>
                <Badge className={STATUS_LABELS[selectedCampaign?.status || '']?.color || 'bg-gray-500/20'}>
                  {STATUS_LABELS[selectedCampaign?.status || '']?.label || selectedCampaign?.status}
                </Badge>
              </div>
            </div>
          </DialogHeader>
          
          {selectedCampaign && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <Coins className="h-6 w-6 mx-auto text-emerald-500 mb-2" />
                      <div className="text-xl font-bold">{formatTBURN(selectedCampaign.budgetAmount)}</div>
                      <div className="text-xs text-muted-foreground">예산 (TBURN)</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <TrendingUp className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                      <div className="text-xl font-bold">{formatTBURN(selectedCampaign.spentAmount)}</div>
                      <div className="text-xs text-muted-foreground">사용 (TBURN)</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <Users className="h-6 w-6 mx-auto text-purple-500 mb-2" />
                      <div className="text-xl font-bold">{selectedCampaign.totalParticipants.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">참여자</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <BarChart3 className="h-6 w-6 mx-auto text-orange-500 mb-2" />
                      <div className="text-xl font-bold">{selectedCampaign.totalReach.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">도달 수</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">캠페인 유형:</span>
                  <p className="font-medium">{CAMPAIGN_TYPES.find(t => t.value === selectedCampaign.campaignType)?.label}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">타겟 오디언스:</span>
                  <p>{selectedCampaign.targetAudience || '-'}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">기간:</span>
                  <p>
                    {selectedCampaign.startDate ? new Date(selectedCampaign.startDate).toLocaleDateString('ko-KR') : '-'} ~ {selectedCampaign.endDate ? new Date(selectedCampaign.endDate).toLocaleDateString('ko-KR') : '-'}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Gift className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">액션당 리워드:</span>
                  <p className="font-medium">{formatTBURN(selectedCampaign.rewardPerAction)} TBURN</p>
                </div>
              </div>

              {selectedCampaign.description && (
                <div className="text-sm">
                  <span className="text-muted-foreground">설명:</span>
                  <p className="mt-1 p-3 bg-muted rounded-md">{selectedCampaign.description}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2"><Users className="h-4 w-4" /> 참여자 목록</h3>
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
                        <TableHead>사용자</TableHead>
                        <TableHead>플랫폼</TableHead>
                        <TableHead>지갑</TableHead>
                        <TableHead className="text-right">완료액션</TableHead>
                        <TableHead className="text-right">총 리워드</TableHead>
                        <TableHead>상태</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {participants.slice(0, 5).map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.username || '-'}</TableCell>
                          <TableCell><Badge variant="outline">{MARKETING_CHANNELS.find(c => c.value === p.platform)?.label || p.platform}</Badge></TableCell>
                          <TableCell className="font-mono text-xs">{p.walletAddress.slice(0, 8)}...{p.walletAddress.slice(-6)}</TableCell>
                          <TableCell className="text-right">{p.actionsCompleted}</TableCell>
                          <TableCell className="text-right">{formatTBURN(p.totalRewards)} TBURN</TableCell>
                          <TableCell><Badge className={p.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20'}>{p.status}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2"><Gift className="h-4 w-4" /> 리워드 내역</h3>
                  <Button size="sm" onClick={() => setIsAddRewardOpen(true)} disabled={participants.length === 0} data-testid="button-add-reward">
                    <Plus className="mr-2 h-4 w-4" />
                    리워드 추가
                  </Button>
                </div>
                
                {rewards.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Gift className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>리워드 내역이 없습니다</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {rewards.slice(0, 5).map((reward) => (
                      <Card key={reward.id} data-testid={`card-reward-${reward.id}`}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">
                                  {ACTION_TYPES.find(a => a.value === reward.actionType)?.label || reward.actionType}
                                </Badge>
                                <span className="font-medium">{formatTBURN(reward.rewardAmount)} TBURN</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(reward.createdAt).toLocaleDateString('ko-KR')}
                                {reward.paidAt && ` | 지급일: ${new Date(reward.paidAt).toLocaleDateString('ko-KR')}`}
                              </div>
                            </div>
                            <Select 
                              value={reward.status} 
                              onValueChange={(v) => updateRewardMutation.mutate({ id: reward.id, status: v })}
                            >
                              <SelectTrigger className="w-28 h-8" data-testid={`select-reward-status-${reward.id}`}>
                                <Badge className={REWARD_STATUS[reward.status]?.color || 'bg-gray-500/20'}>
                                  {REWARD_STATUS[reward.status]?.label || reward.status}
                                </Badge>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">대기</SelectItem>
                                <SelectItem value="verified">검증됨</SelectItem>
                                <SelectItem value="approved">승인됨</SelectItem>
                                <SelectItem value="paid">지급됨</SelectItem>
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

      <Dialog open={isAddParticipantOpen} onOpenChange={setIsAddParticipantOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>참여자 추가</DialogTitle>
            <DialogDescription>"{selectedCampaign?.name}" 캠페인에 새 참여자를 추가합니다</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="walletAddress">지갑 주소 *</Label>
              <Input
                id="walletAddress"
                value={participantForm.walletAddress}
                onChange={(e) => setParticipantForm({ ...participantForm, walletAddress: e.target.value })}
                placeholder="0x... 또는 tb1..."
                data-testid="input-participant-wallet"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">사용자명</Label>
              <Input
                id="username"
                value={participantForm.username}
                onChange={(e) => setParticipantForm({ ...participantForm, username: e.target.value })}
                placeholder="@username"
                data-testid="input-participant-username"
              />
            </div>
            <div className="grid gap-2">
              <Label>플랫폼</Label>
              <Select value={participantForm.platform} onValueChange={(v) => setParticipantForm({ ...participantForm, platform: v })}>
                <SelectTrigger data-testid="select-participant-platform">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MARKETING_CHANNELS.map(ch => (
                    <SelectItem key={ch.value} value={ch.value}>{ch.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddParticipantOpen(false)} data-testid="button-cancel-participant">
              취소
            </Button>
            <Button 
              onClick={() => selectedCampaign && addParticipantMutation.mutate({ 
                campaignId: selectedCampaign.id, 
                data: participantForm 
              })}
              disabled={!participantForm.walletAddress || addParticipantMutation.isPending}
              data-testid="button-submit-participant"
            >
              {addParticipantMutation.isPending ? "추가 중..." : "참여자 추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddRewardOpen} onOpenChange={setIsAddRewardOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>리워드 추가</DialogTitle>
            <DialogDescription>"{selectedCampaign?.name}" 캠페인에 새 리워드를 등록합니다</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>참여자</Label>
              <Select value={rewardForm.participantId} onValueChange={(v) => setRewardForm({ ...rewardForm, participantId: v })}>
                <SelectTrigger data-testid="select-reward-participant">
                  <SelectValue placeholder="참여자 선택" />
                </SelectTrigger>
                <SelectContent>
                  {participants.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.username || p.walletAddress.slice(0, 12)}...</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>액션 유형</Label>
              <Select value={rewardForm.actionType} onValueChange={(v) => setRewardForm({ ...rewardForm, actionType: v })}>
                <SelectTrigger data-testid="select-reward-action">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_TYPES.map(action => (
                    <SelectItem key={action.value} value={action.value}>{action.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rewardAmount">리워드 금액 (wei)</Label>
              <Input
                id="rewardAmount"
                value={rewardForm.rewardAmount}
                onChange={(e) => setRewardForm({ ...rewardForm, rewardAmount: e.target.value })}
                data-testid="input-reward-amount"
              />
              <p className="text-xs text-muted-foreground">≈ {formatTBURN(rewardForm.rewardAmount)} TBURN</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddRewardOpen(false)} data-testid="button-cancel-reward">
              취소
            </Button>
            <Button 
              onClick={() => selectedCampaign && addRewardMutation.mutate({ 
                campaignId: selectedCampaign.id, 
                data: rewardForm 
              })}
              disabled={!rewardForm.participantId || !rewardForm.rewardAmount || addRewardMutation.isPending}
              data-testid="button-submit-reward"
            >
              {addRewardMutation.isPending ? "추가 중..." : "리워드 추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
