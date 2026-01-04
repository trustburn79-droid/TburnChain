import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Database,
  RefreshCw,
  Trash2,
  Archive,
  Activity,
  HardDrive,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  BarChart3,
  Table2,
  Settings,
  Zap,
} from "lucide-react";

interface TableStats {
  tableName: string;
  rowCount: number;
  sizeBytes: number;
  lastVacuum: string | null;
  lastAnalyze: string | null;
  deadTuples: number;
  modSinceAnalyze: number;
}

interface OptimizerStatus {
  success: boolean;
  data: {
    isRunning: boolean;
    lastCleanup: string | null;
    lastRollup: string | null;
    lastVacuum: string | null;
    retentionDays: number;
    rollupMonths: number;
    archiveYears: number;
    poolSize: number;
    activeConnections: number;
  };
}

interface OperationResult {
  success: boolean;
  message: string;
  affectedRows?: number;
  duration?: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export default function AdminDBOptimizer() {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: statusData, isLoading: loadingStatus, refetch: refetchStatus } = useQuery<OptimizerStatus>({
    queryKey: ['/api/internal/db-optimizer/status'],
    refetchInterval: 30000,
  });

  const { data: tableStats, isLoading: loadingTables, refetch: refetchTables } = useQuery<{ success: boolean; data: TableStats[] }>({
    queryKey: ['/api/internal/db-optimizer/tables/stats'],
    refetchInterval: 60000,
  });

  const cleanupMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/internal/db-optimizer/cleanup/run');
      return res.json();
    },
    onSuccess: (data: OperationResult) => {
      toast({
        title: "정리 완료",
        description: data.message || `${data.affectedRows || 0}개 레코드 정리됨`,
      });
      refetchStatus();
      refetchTables();
    },
    onError: (error: Error) => {
      toast({
        title: "정리 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rollupMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/internal/db-optimizer/rollup/run');
      return res.json();
    },
    onSuccess: (data: OperationResult) => {
      toast({
        title: "롤업 완료",
        description: data.message || "데이터 롤업이 완료되었습니다",
      });
      refetchStatus();
      refetchTables();
    },
    onError: (error: Error) => {
      toast({
        title: "롤업 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const vacuumMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/internal/db-optimizer/vacuum/run');
      return res.json();
    },
    onSuccess: (data: OperationResult) => {
      toast({
        title: "VACUUM/ANALYZE 완료",
        description: data.message || "데이터베이스 최적화가 완료되었습니다",
      });
      refetchStatus();
      refetchTables();
    },
    onError: (error: Error) => {
      toast({
        title: "VACUUM 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchStatus(), refetchTables()]);
    setIsRefreshing(false);
    toast({ title: "새로고침 완료" });
  };

  const status = statusData?.data;
  const tables = tableStats?.data || [];
  const totalSize = tables.reduce((sum, t) => sum + t.sizeBytes, 0);
  const totalRows = tables.reduce((sum, t) => sum + t.rowCount, 0);
  const tablesNeedingVacuum = tables.filter(t => t.deadTuples > 1000).length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">데이터베이스 최적화</h1>
          <p className="text-muted-foreground">Database Optimizer - 테이블 관리 및 최적화</p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          data-testid="button-refresh"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          새로고침
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total-tables">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">테이블 수</CardTitle>
            <Table2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingTables ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{tables.length}</div>
                <p className="text-xs text-muted-foreground">관리 중인 테이블</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-total-size">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">전체 크기</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingTables ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatBytes(totalSize)}</div>
                <p className="text-xs text-muted-foreground">{formatNumber(totalRows)} 레코드</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-pool-status">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">연결 풀</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStatus ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{status?.activeConnections || 0}/{status?.poolSize || 20}</div>
                <Progress value={((status?.activeConnections || 0) / (status?.poolSize || 20)) * 100} className="mt-2 h-1" />
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-needs-vacuum">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium">최적화 필요</CardTitle>
            <AlertCircle className={`h-4 w-4 ${tablesNeedingVacuum > 0 ? 'text-amber-500' : 'text-emerald-500'}`} />
          </CardHeader>
          <CardContent>
            {loadingTables ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{tablesNeedingVacuum}</div>
                <p className="text-xs text-muted-foreground">VACUUM 필요 테이블</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-operations">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            데이터베이스 작업
          </CardTitle>
          <CardDescription>수동으로 데이터베이스 최적화 작업을 실행합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="p-3 rounded-lg bg-red-500/10">
                    <Trash2 className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">정리 (Cleanup)</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {status?.retentionDays || 30}일 이상 된 데이터 삭제
                    </p>
                    {status?.lastCleanup && (
                      <p className="text-xs text-muted-foreground mt-1">
                        마지막: {new Date(status.lastCleanup).toLocaleString('ko-KR')}
                      </p>
                    )}
                  </div>
                  <Button 
                    onClick={() => cleanupMutation.mutate()}
                    disabled={cleanupMutation.isPending}
                    variant="outline"
                    className="w-full"
                    data-testid="button-cleanup"
                  >
                    {cleanupMutation.isPending ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="mr-2 h-4 w-4" />
                    )}
                    실행
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="p-3 rounded-lg bg-blue-500/10">
                    <Archive className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">롤업 (Rollup)</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      시간별 데이터를 일별/월별로 집계
                    </p>
                    {status?.lastRollup && (
                      <p className="text-xs text-muted-foreground mt-1">
                        마지막: {new Date(status.lastRollup).toLocaleString('ko-KR')}
                      </p>
                    )}
                  </div>
                  <Button 
                    onClick={() => rollupMutation.mutate()}
                    disabled={rollupMutation.isPending}
                    variant="outline"
                    className="w-full"
                    data-testid="button-rollup"
                  >
                    {rollupMutation.isPending ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="mr-2 h-4 w-4" />
                    )}
                    실행
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="p-3 rounded-lg bg-emerald-500/10">
                    <Activity className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">VACUUM/ANALYZE</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      데드 튜플 정리 및 통계 업데이트
                    </p>
                    {status?.lastVacuum && (
                      <p className="text-xs text-muted-foreground mt-1">
                        마지막: {new Date(status.lastVacuum).toLocaleString('ko-KR')}
                      </p>
                    )}
                  </div>
                  <Button 
                    onClick={() => vacuumMutation.mutate()}
                    disabled={vacuumMutation.isPending}
                    variant="outline"
                    className="w-full"
                    data-testid="button-vacuum"
                  >
                    {vacuumMutation.isPending ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="mr-2 h-4 w-4" />
                    )}
                    실행
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-table-stats">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            테이블 통계
          </CardTitle>
          <CardDescription>각 테이블의 크기, 레코드 수 및 최적화 상태</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            {loadingTables ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>테이블명</TableHead>
                    <TableHead className="text-right">레코드</TableHead>
                    <TableHead className="text-right">크기</TableHead>
                    <TableHead className="text-right">데드 튜플</TableHead>
                    <TableHead>마지막 VACUUM</TableHead>
                    <TableHead>상태</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tables.map((table, index) => (
                    <TableRow key={table.tableName} data-testid={`row-table-${index}`}>
                      <TableCell className="font-mono text-sm">{table.tableName}</TableCell>
                      <TableCell className="text-right">{formatNumber(table.rowCount)}</TableCell>
                      <TableCell className="text-right">{formatBytes(table.sizeBytes)}</TableCell>
                      <TableCell className="text-right">
                        <span className={table.deadTuples > 1000 ? 'text-amber-500' : ''}>
                          {formatNumber(table.deadTuples)}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {table.lastVacuum ? new Date(table.lastVacuum).toLocaleDateString('ko-KR') : '-'}
                      </TableCell>
                      <TableCell>
                        {table.deadTuples > 1000 ? (
                          <Badge className="bg-amber-500/10 text-amber-500">최적화 필요</Badge>
                        ) : (
                          <Badge className="bg-emerald-500/10 text-emerald-500">정상</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card data-testid="card-retention-config">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            보존 정책 설정
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">세부 데이터 보존</span>
              </div>
              <div className="text-2xl font-bold">{status?.retentionDays || 30}일</div>
              <p className="text-xs text-muted-foreground mt-1">엔드포인트 레벨 메트릭</p>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Archive className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">시간별 롤업 보존</span>
              </div>
              <div className="text-2xl font-bold">{status?.rollupMonths || 18}개월</div>
              <p className="text-xs text-muted-foreground mt-1">시간별 집계 데이터</p>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">일별 롤업 보존</span>
              </div>
              <div className="text-2xl font-bold">{status?.archiveYears || 5}년</div>
              <p className="text-xs text-muted-foreground mt-1">일별 집계 데이터</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
