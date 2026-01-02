import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Award, Users, Target, Star, Search, RefreshCw, ArrowLeft, Plus } from "lucide-react";
import { Link } from "wouter";

export default function AdminCommunityProgram() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: tasks, isLoading, refetch } = useQuery<{ success: boolean; data: any[] }>({
    queryKey: ['/api/admin/token-programs/community/tasks'],
  });

  const { data: stats } = useQuery<{ success: boolean; data: any }>({
    queryKey: ['/api/admin/token-programs/dashboard'],
  });

  const communityStats = stats?.data?.community || { totalTasks: 0, activeTasks: 0, totalContributions: 0, totalPointsDistributed: 0 };
  const taskList = Array.isArray(tasks?.data) ? tasks.data : [];

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
          <p className="text-muted-foreground">Community Program Management</p>
        </div>
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
            <div className="text-2xl font-bold">{communityStats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">Total Tasks</p>
          </CardContent>
        </Card>
        <Card data-testid="card-active-tasks">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">활성 태스크</CardTitle>
            <Star className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{communityStats.activeTasks}</div>
            <p className="text-xs text-muted-foreground">Active Tasks</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-contributions">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">총 기여</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{communityStats.totalContributions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Contributions</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-points">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">배분 포인트</CardTitle>
            <Award className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{communityStats.totalPointsDistributed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Points Distributed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>커뮤니티 태스크 목록</CardTitle>
              <CardDescription>Community Tasks List</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="태스크 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                  data-testid="input-search"
                />
              </div>
              <Button data-testid="button-add-task">
                <Plus className="mr-2 h-4 w-4" />
                새 태스크
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : taskList.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>커뮤니티 태스크 데이터가 없습니다</p>
              <p className="text-sm">No community tasks found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>태스크명</TableHead>
                  <TableHead>카테고리</TableHead>
                  <TableHead className="text-right">포인트</TableHead>
                  <TableHead className="text-right">완료</TableHead>
                  <TableHead>상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taskList.map((task: any) => (
                  <TableRow key={task.id} data-testid={`row-task-${task.id}`}>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell><Badge variant="outline">{task.category}</Badge></TableCell>
                    <TableCell className="text-right">{task.pointReward}</TableCell>
                    <TableCell className="text-right">{task.completionCount}</TableCell>
                    <TableCell>
                      <Badge className={task.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}>
                        {task.status}
                      </Badge>
                    </TableCell>
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
