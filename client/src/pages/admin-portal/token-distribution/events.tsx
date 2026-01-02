import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users, Coins, PartyPopper, Search, RefreshCw, ArrowLeft, Plus } from "lucide-react";
import { Link } from "wouter";

interface EventCatalog {
  id: string;
  name: string;
  description: string;
  eventType: string;
  status: string;
  totalRewardPool: string;
  maxParticipants: number;
  currentParticipants: number;
  startDate: string;
  endDate: string;
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
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

export default function AdminEventsCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: events, isLoading, refetch } = useQuery<{ success: boolean; data: EventCatalog[] }>({
    queryKey: ['/api/admin/token-programs/events/catalog'],
  });

  const { data: stats } = useQuery<{ success: boolean; data: any }>({
    queryKey: ['/api/admin/token-programs/dashboard'],
  });

  const eventStats = stats?.data?.events || { totalEvents: 0, activeEvents: 0, totalParticipants: 0, totalRewardsDistributed: "0" };
  const eventList = events?.data || [];

  const filteredEvents = eventList.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
            <div className="text-2xl font-bold">{eventStats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">Total Events</p>
          </CardContent>
        </Card>
        <Card data-testid="card-active-events">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">진행중</CardTitle>
            <PartyPopper className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventStats.activeEvents}</div>
            <p className="text-xs text-muted-foreground">Active Events</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-participants">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">총 참가자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventStats.totalParticipants.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Participants</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-rewards">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">배분 보상</CardTitle>
            <Coins className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTBURN(eventStats.totalRewardsDistributed)} TBURN</div>
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
                </SelectContent>
              </Select>
              <Button data-testid="button-add-event">
                <Plus className="mr-2 h-4 w-4" />
                새 이벤트
              </Button>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id} data-testid={`row-event-${event.id}`}>
                    <TableCell className="font-medium">{event.name}</TableCell>
                    <TableCell><Badge variant="outline">{event.eventType}</Badge></TableCell>
                    <TableCell className="text-right">{formatTBURN(event.totalRewardPool)} TBURN</TableCell>
                    <TableCell className="text-right">{event.currentParticipants}/{event.maxParticipants}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(event.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
