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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Users, Coins, PartyPopper, Search, RefreshCw, ArrowLeft, Plus, Trash2, Edit, Send, Eye } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Checkbox } from "@/components/ui/checkbox";

interface EventsCatalog {
  id: string;
  name: string;
  description: string;
  eventType: string;
  status: string;
  totalRewardPool: string;
  distributedRewards: string;
  maxParticipants: number;
  currentParticipants: number;
  startDate: string;
  endDate: string;
  bannerUrl?: string;
}

interface EventRegistration {
  id: string;
  eventId: string;
  walletAddress: string;
  registeredAt: string;
  score: number;
  rank?: number;
  rewardAmount: string;
  rewardClaimed: boolean;
}

const formatTBURN = (amount: string) => {
  const num = BigInt(amount || '0');
  const tburn = Number(num) / 1e18;
  if (tburn >= 1e6) return `${(tburn / 1e6).toFixed(2)}M`;
  if (tburn >= 1e3) return `${(tburn / 1e3).toFixed(2)}K`;
  return tburn.toFixed(4);
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active': return <Badge className="bg-emerald-500/20 text-emerald-400">진행중</Badge>;
    case 'upcoming': return <Badge className="bg-blue-500/20 text-blue-400">예정</Badge>;
    case 'ended': return <Badge className="bg-gray-500/20 text-gray-400">종료</Badge>;
    case 'cancelled': return <Badge className="bg-red-500/20 text-red-400">취소됨</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

const eventTypeLabels: Record<string, string> = {
  airdrop: '에어드랍',
  trading_competition: '트레이딩 대회',
  staking_bonus: '스테이킹 보너스',
  community: '커뮤니티 이벤트',
  ama: 'AMA 세션',
  hackathon: '해커톤',
};

export default function AdminEventsCenter() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDistributeOpen, setIsDistributeOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventsCatalog | null>(null);
  const [selectedRegistrations, setSelectedRegistrations] = useState<string[]>([]);
  const [rewardAmount, setRewardAmount] = useState("");
  
  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    eventType: 'airdrop',
    status: 'upcoming',
    totalRewardPool: '',
    maxParticipants: '',
    startDate: '',
    endDate: '',
  });

  const { data: eventsResponse, isLoading, refetch } = useQuery<{ success: boolean; data: { events: EventsCatalog[]; stats: any } }>({
    queryKey: ['/api/admin/token-programs/events'],
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const { data: eventDetailResponse } = useQuery<{ success: boolean; data: { event: EventsCatalog; registrations: EventRegistration[] } }>({
    queryKey: ['/api/admin/token-programs/events', selectedEvent?.id],
    enabled: !!selectedEvent?.id && isViewOpen,
  });

  const events = eventsResponse?.data?.events || [];
  const stats = eventsResponse?.data?.stats || { totalEvents: 0, activeEvents: 0, totalParticipants: 0, totalRewardsDistributed: "0" };
  const registrations = eventDetailResponse?.data?.registrations || [];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/admin/token-programs/events', {
        ...data,
        totalRewardPool: String(Math.floor(parseFloat(data.totalRewardPool || '0') * 1e18)),
        maxParticipants: parseInt(data.maxParticipants) || null,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
      });
    },
    onSuccess: async () => {
      toast({ title: "성공", description: "이벤트가 생성되었습니다." });
      await queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/events'] });
      await refetch();
      setIsAddOpen(false);
      setNewEvent({ name: '', description: '', eventType: 'airdrop', status: 'upcoming', totalRewardPool: '', maxParticipants: '', startDate: '', endDate: '' });
    },
    onError: (error: any) => {
      toast({ title: "오류", description: error.message || "이벤트 생성 실패", variant: "destructive" });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest('PATCH', `/api/admin/token-programs/events/${id}`, data);
    },
    onSuccess: () => {
      toast({ title: "성공", description: "이벤트가 수정되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/events'] });
    },
    onError: (error: any) => {
      toast({ title: "오류", description: error.message || "이벤트 수정 실패", variant: "destructive" });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/admin/token-programs/events/${id}`, {});
    },
    onSuccess: () => {
      toast({ title: "성공", description: "이벤트가 취소되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/events'] });
    },
    onError: (error: any) => {
      toast({ title: "오류", description: error.message || "이벤트 삭제 실패", variant: "destructive" });
    },
  });

  const distributeMutation = useMutation({
    mutationFn: async (data: { eventId: string; rewardAmount: string; recipientIds: string[] }) => {
      return apiRequest('POST', `/api/admin/token-programs/events/${data.eventId}/distribute`, {
        rewardAmount: data.rewardAmount,
        recipientIds: data.recipientIds.length > 0 ? data.recipientIds : undefined,
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "분배 완료",
        description: `${data.data?.distributed || 0}명에게 보상 분배됨. TX: ${data.data?.transactionHash?.substring(0, 16)}...`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-programs/events'] });
      setIsDistributeOpen(false);
      setSelectedRegistrations([]);
      setRewardAmount("");
    },
    onError: (error: any) => {
      toast({ title: "오류", description: error.message || "분배 실패", variant: "destructive" });
    },
  });

  const handleCreateEvent = () => {
    if (!newEvent.name) {
      toast({ title: "오류", description: "이벤트 이름을 입력해주세요.", variant: "destructive" });
      return;
    }
    createEventMutation.mutate(newEvent);
  };

  const handleDistribute = () => {
    if (!selectedEvent || !rewardAmount) {
      toast({ title: "오류", description: "보상 금액을 입력해주세요.", variant: "destructive" });
      return;
    }
    distributeMutation.mutate({
      eventId: selectedEvent.id,
      rewardAmount,
      recipientIds: selectedRegistrations,
    });
  };

  const handleViewEvent = (event: EventsCatalog) => {
    setSelectedEvent(event);
    setIsViewOpen(true);
  };

  const handleOpenDistribute = (event: EventsCatalog) => {
    setSelectedEvent(event);
    setIsDistributeOpen(true);
    setSelectedRegistrations([]);
  };

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="admin-events-page">
      <div className="flex items-center gap-4">
        <Link href="/admin/token-distribution">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            이벤트 센터 관리
          </h1>
          <p className="text-muted-foreground">Events Center Management</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh">
          <RefreshCw className="mr-2 h-4 w-4" />
          새로고침
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total-events">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">총 이벤트</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">Total Events</p>
          </CardContent>
        </Card>
        <Card data-testid="card-active-events">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">진행중</CardTitle>
            <PartyPopper className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEvents}</div>
            <p className="text-xs text-muted-foreground">Active Events</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-participants">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">총 참가자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalParticipants?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Participants</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-rewards">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">배분 보상</CardTitle>
            <Coins className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTBURN(stats.totalRewardsDistributed)} TBURN</div>
            <p className="text-xs text-muted-foreground">Rewards Distributed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>이벤트 목록</CardTitle>
              <CardDescription>Events Catalog</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="이벤트 이름 검색..."
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
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="active">진행중</SelectItem>
                  <SelectItem value="upcoming">예정</SelectItem>
                  <SelectItem value="ended">종료</SelectItem>
                  <SelectItem value="cancelled">취소됨</SelectItem>
                </SelectContent>
              </Select>
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-event">
                    <Plus className="mr-2 h-4 w-4" />
                    새 이벤트
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>새 이벤트 생성</DialogTitle>
                    <DialogDescription>이벤트 정보를 입력하세요.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">이벤트명 *</Label>
                      <Input
                        id="name"
                        value={newEvent.name}
                        onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                        placeholder="이벤트 이름"
                        data-testid="input-event-name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">설명</Label>
                      <Textarea
                        id="description"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        placeholder="이벤트 설명"
                        data-testid="input-event-description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="eventType">이벤트 유형</Label>
                        <Select value={newEvent.eventType} onValueChange={(v) => setNewEvent({ ...newEvent, eventType: v })}>
                          <SelectTrigger data-testid="select-event-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="airdrop">에어드랍</SelectItem>
                            <SelectItem value="trading_competition">트레이딩 대회</SelectItem>
                            <SelectItem value="staking_bonus">스테이킹 보너스</SelectItem>
                            <SelectItem value="community">커뮤니티 이벤트</SelectItem>
                            <SelectItem value="ama">AMA 세션</SelectItem>
                            <SelectItem value="hackathon">해커톤</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="status">상태</Label>
                        <Select value={newEvent.status} onValueChange={(v) => setNewEvent({ ...newEvent, status: v })}>
                          <SelectTrigger data-testid="select-event-status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="upcoming">예정</SelectItem>
                            <SelectItem value="active">진행중</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="totalRewardPool">보상 풀 (TBURN)</Label>
                        <Input
                          id="totalRewardPool"
                          type="number"
                          value={newEvent.totalRewardPool}
                          onChange={(e) => setNewEvent({ ...newEvent, totalRewardPool: e.target.value })}
                          placeholder="100000"
                          data-testid="input-reward-pool"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="maxParticipants">최대 참가자</Label>
                        <Input
                          id="maxParticipants"
                          type="number"
                          value={newEvent.maxParticipants}
                          onChange={(e) => setNewEvent({ ...newEvent, maxParticipants: e.target.value })}
                          placeholder="1000"
                          data-testid="input-max-participants"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="startDate">시작일 *</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={newEvent.startDate}
                          onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                          data-testid="input-start-date"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="endDate">종료일 *</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={newEvent.endDate}
                          onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                          data-testid="input-end-date"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddOpen(false)}>취소</Button>
                    <Button onClick={handleCreateEvent} disabled={createEventMutation.isPending} data-testid="button-create-event">
                      {createEventMutation.isPending ? "생성 중..." : "생성"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>이벤트 데이터가 없습니다</p>
              <p className="text-sm">No events found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이벤트명</TableHead>
                  <TableHead>유형</TableHead>
                  <TableHead className="text-right">보상 풀</TableHead>
                  <TableHead className="text-right">참가자</TableHead>
                  <TableHead>기간</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id} data-testid={`row-event-${event.id}`}>
                    <TableCell className="font-medium">{event.name}</TableCell>
                    <TableCell><Badge variant="outline">{eventTypeLabels[event.eventType] || event.eventType}</Badge></TableCell>
                    <TableCell className="text-right">{formatTBURN(event.totalRewardPool)} TBURN</TableCell>
                    <TableCell className="text-right">{event.currentParticipants}/{event.maxParticipants || '∞'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(event.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewEvent(event)}
                          data-testid={`button-view-${event.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDistribute(event)}
                          data-testid={`button-distribute-${event.id}`}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteEventMutation.mutate(event.id)}
                          disabled={event.status === 'cancelled'}
                          data-testid={`button-delete-${event.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
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

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.name} - 참가자 목록</DialogTitle>
            <DialogDescription>
              {registrations.length}명 등록됨 / {formatTBURN(selectedEvent?.distributedRewards || '0')} TBURN 분배됨
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>지갑 주소</TableHead>
                  <TableHead>등록일</TableHead>
                  <TableHead className="text-right">점수</TableHead>
                  <TableHead className="text-right">순위</TableHead>
                  <TableHead className="text-right">보상</TableHead>
                  <TableHead>청구</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      등록된 참가자가 없습니다
                    </TableCell>
                  </TableRow>
                ) : (
                  registrations.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell className="font-mono text-sm">{reg.walletAddress.substring(0, 12)}...{reg.walletAddress.slice(-8)}</TableCell>
                      <TableCell>{new Date(reg.registeredAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">{reg.score}</TableCell>
                      <TableCell className="text-right">{reg.rank || '-'}</TableCell>
                      <TableCell className="text-right">{formatTBURN(reg.rewardAmount)} TBURN</TableCell>
                      <TableCell>
                        <Badge variant={reg.rewardClaimed ? "default" : "outline"}>
                          {reg.rewardClaimed ? '청구됨' : '미청구'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>닫기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDistributeOpen} onOpenChange={setIsDistributeOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>보상 분배 - {selectedEvent?.name}</DialogTitle>
            <DialogDescription>
              참가자 {selectedEvent?.currentParticipants}명에게 보상을 분배합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rewardAmount">1인당 보상 금액 (TBURN)</Label>
              <Input
                id="rewardAmount"
                type="number"
                value={rewardAmount}
                onChange={(e) => setRewardAmount(e.target.value)}
                placeholder="100"
                data-testid="input-distribute-amount"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              선택된 참가자가 없으면 모든 참가자에게 분배됩니다.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDistributeOpen(false)}>취소</Button>
            <Button onClick={handleDistribute} disabled={distributeMutation.isPending} data-testid="button-confirm-distribute">
              {distributeMutation.isPending ? "분배 중..." : "분배 실행"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
