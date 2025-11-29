import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, ShieldAlert, FileCheck, ClipboardList, 
  AlertTriangle, CheckCircle2, Clock, XCircle,
  Activity, Cpu, HardDrive, Wifi, Server,
  Bell, BellOff, Eye, Zap, BarChart3,
  TrendingUp, TrendingDown, RefreshCw
} from "lucide-react";
import { Link } from "wouter";
import { useAdminPassword } from "@/hooks/use-admin-password";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useEffect, useState, useMemo } from "react";

const localeMap: Record<string, string> = {
  en: 'en-US',
  ja: 'ja-JP',
  ko: 'ko-KR',
  zh: 'zh-CN',
  hi: 'hi-IN',
  es: 'es-ES',
  fr: 'fr-FR',
  ar: 'ar-SA',
  bn: 'bn-BD',
  ru: 'ru-RU',
  pt: 'pt-BR',
  ur: 'ur-PK'
};

interface DashboardData {
  members: {
    total_members: string;
    pending_members: string;
    active_members: string;
    suspended_members: string;
    no_kyc: string;
    kyc_verified: string;
  };
  validatorApplications: Array<{ status: string; count: string }>;
  securityAlerts: Array<{ severity: string; count: string }>;
  recentActivity: Array<{
    action_type: string;
    action_category: string;
    resource: string;
    created_at: string;
  }>;
}

interface SystemHealth {
  tps: number;
  blockHeight: number;
  avgBlockTime: number;
  latency: number;
  activeValidators: number;
  totalValidators: number;
  validatorUptime: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkBandwidth: number;
  peerCount: number;
  pendingTxCount: number;
  mempoolSize: number;
  overallHealthScore: number;
  networkHealthScore: number;
  consensusHealthScore: number;
  storageHealthScore: number;
  status: string;
  lastUpdated: string;
}

interface HealthHistoryPoint {
  tps: number;
  block_height: number;
  avg_block_time: number;
  latency: number;
  active_validators: number;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  overall_health_score: number;
  status: string;
  snapshot_at: string;
}

interface AlertItem {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  source_type: string;
  status: string;
  priority: number;
  requires_immediate_action: boolean;
  created_at: string;
}

export default function OperatorDashboard() {
  const { t, i18n } = useTranslation();
  const { getAuthHeaders } = useAdminPassword();
  const currentLocale = localeMap[i18n.language] || 'en-US';

  const formatTimeForLocale = (dateValue: string | Date) => {
    try {
      const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
      return date.toLocaleTimeString(currentLocale, { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  const translateActionType = (actionType: string): string => {
    const key = `operator.dashboard.actionTypes.${actionType}`;
    const translated = t(key, { returnObjects: false });
    if (translated !== key && typeof translated === 'string') {
      return translated;
    }
    return actionType.replace(/_/g, ' ');
  };

  const translateResource = (resource: string): string => {
    const key = `operator.dashboard.resourceTypes.${resource.toLowerCase()}`;
    const translated = t(key, { returnObjects: false });
    if (translated !== key && typeof translated === 'string') {
      return translated;
    }
    return resource;
  };

  const translateAlertTitle = (title: string): string => {
    const key = `operator.dashboard.alertTitles.${title}`;
    const translated = t(key, { returnObjects: false });
    if (translated !== key && typeof translated === 'string') {
      return translated;
    }
    return title;
  };

  const translateAlertMessage = (message: string): string => {
    const key = `operator.dashboard.alertMessages.${message}`;
    const translated = t(key, { returnObjects: false });
    if (translated !== key && typeof translated === 'string') {
      return translated;
    }
    return message;
  };

  const translateAppStatus = (status: string): string => {
    const key = `operator.dashboard.appStatuses.${status}`;
    const translated = t(key, { returnObjects: false });
    if (translated !== key && typeof translated === 'string') {
      return translated;
    }
    return status;
  };

  const translateSeverity = (severity: string): string => {
    const key = `operator.dashboard.severityLevels.${severity}`;
    const translated = t(key, { returnObjects: false });
    if (translated !== key && typeof translated === 'string') {
      return translated;
    }
    return severity;
  };
  const queryClient = useQueryClient();
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["/api/operator/dashboard"],
    queryFn: async () => {
      const response = await fetch("/api/operator/dashboard", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch dashboard data");
      }
      return response.json();
    },
  });

  const { data: systemHealth, isLoading: healthLoading } = useQuery<SystemHealth>({
    queryKey: ["/api/operator/system-health"],
    queryFn: async () => {
      const response = await fetch("/api/operator/system-health", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch system health");
      return response.json();
    },
    refetchInterval: autoRefresh ? 10000 : false,
  });

  const { data: healthHistory } = useQuery<HealthHistoryPoint[]>({
    queryKey: ["/api/operator/health-history"],
    queryFn: async () => {
      const response = await fetch("/api/operator/health-history?hours=24", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch health history");
      return response.json();
    },
    refetchInterval: autoRefresh ? 60000 : false,
  });

  const { data: alerts } = useQuery<AlertItem[]>({
    queryKey: ["/api/operator/alerts"],
    queryFn: async () => {
      const response = await fetch("/api/operator/alerts?status=active", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch alerts");
      return response.json();
    },
    refetchInterval: autoRefresh ? 30000 : false,
  });

  const acknowledgeAlert = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: string }) => {
      const response = await fetch(`/api/operator/alerts/${id}`, {
        method: "PATCH",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) throw new Error("Failed to update alert");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/operator/alerts"] });
    },
  });

  const chartData = useMemo(() => {
    return healthHistory?.map(h => ({
      time: formatTimeForLocale(h.snapshot_at),
      tps: h.tps,
      latency: h.latency,
      cpu: h.cpu_usage,
      memory: h.memory_usage,
      validators: h.active_validators,
      health: h.overall_health_score / 100,
    })) || [];
  }, [healthHistory, currentLocale]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72 mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t('operator.dashboard.accessDenied')}</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : t('operator.dashboard.adminPrivilegesRequired')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const pendingApps = data?.validatorApplications?.find(a => a.status === 'pending')?.count || '0';
  const criticalAlerts = data?.securityAlerts?.find(a => a.severity === 'critical')?.count || '0';
  const highAlerts = data?.securityAlerts?.find(a => a.severity === 'high')?.count || '0';

  const getHealthColor = (score: number) => {
    if (score >= 9500) return "text-green-500";
    if (score >= 9000) return "text-yellow-500";
    if (score >= 8000) return "text-orange-500";
    return "text-red-500";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">{t('operator.dashboard.healthy')}</Badge>;
      case 'degraded':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">{t('operator.dashboard.degraded')}</Badge>;
      case 'critical':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">{t('operator.security.critical')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">{t('operator.security.critical')}</Badge>;
      case 'high':
        return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">{t('operator.security.high')}</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">{t('operator.security.medium')}</Badge>;
      case 'low':
        return <Badge variant="secondary">{t('operator.security.low')}</Badge>;
      default:
        return <Badge variant="outline">{t('operator.security.info')}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('operator.dashboard.title')}</h1>
          <p className="text-muted-foreground">
            {t('operator.dashboard.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            data-testid="btn-toggle-refresh"
          >
            {autoRefresh ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1" />}
            {autoRefresh ? t('operator.dashboard.autoRefresh') : t('operator.dashboard.paused')}
          </Button>
          {systemHealth && getStatusBadge(systemHealth.status)}
          <Badge variant="outline" className="text-sm">
            <Activity className="w-3 h-3 mr-1" />
            {t('operator.adminAccess')}
          </Badge>
        </div>
      </div>

      {(parseInt(criticalAlerts) > 0 || parseInt(highAlerts) > 0) && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>{t('operator.dashboard.securityAlertsAttention')}</AlertTitle>
          <AlertDescription>
            {parseInt(criticalAlerts) > 0 && `${criticalAlerts} ${t('operator.dashboard.criticalAlerts')}`}
            {parseInt(criticalAlerts) > 0 && parseInt(highAlerts) > 0 && ' and '}
            {parseInt(highAlerts) > 0 && `${highAlerts} ${t('operator.dashboard.highPriorityAlerts')}`} 
            {' '}{t('operator.dashboard.securityEventsNeedReview')}
            <Link href="/operator/security" className="ml-2 underline">{t('operator.dashboard.viewNow')}</Link>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-tps">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('operator.dashboard.tps')}</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth?.tps?.toLocaleString() || '---'}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              {t('operator.dashboard.targetTps')}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-block-height">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('operator.dashboard.blockHeight')}</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth?.blockHeight?.toLocaleString() || '---'}</div>
            <div className="text-xs text-muted-foreground">
              {t('operator.dashboard.avgBlockTime')}: {systemHealth?.avgBlockTime || '--'}ms
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-validators">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('operator.dashboard.validators')}</CardTitle>
            <Server className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemHealth?.activeValidators || '---'}/{systemHealth?.totalValidators || '---'}
            </div>
            <div className="text-xs text-muted-foreground">
              {t('operator.dashboard.uptime')}: {systemHealth?.validatorUptime ? (systemHealth.validatorUptime / 100).toFixed(2) : '--'}%
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-health-score">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('operator.dashboard.healthScore')}</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthColor(systemHealth?.overallHealthScore || 0)}`}>
              {systemHealth?.overallHealthScore ? (systemHealth.overallHealthScore / 100).toFixed(1) : '--'}%
            </div>
            <Progress 
              value={systemHealth?.overallHealthScore ? systemHealth.overallHealthScore / 100 : 0} 
              className="h-1.5 mt-2"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-cpu">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('operator.dashboard.cpuUsage')}</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{systemHealth?.cpuUsage || '--'}%</div>
            <Progress value={systemHealth?.cpuUsage || 0} className="h-1.5 mt-2" />
          </CardContent>
        </Card>

        <Card data-testid="card-memory">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('operator.dashboard.memory')}</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{systemHealth?.memoryUsage || '--'}%</div>
            <Progress value={systemHealth?.memoryUsage || 0} className="h-1.5 mt-2" />
          </CardContent>
        </Card>

        <Card data-testid="card-disk">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('operator.dashboard.disk')}</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{systemHealth?.diskUsage || '--'}%</div>
            <Progress value={systemHealth?.diskUsage || 0} className="h-1.5 mt-2" />
          </CardContent>
        </Card>

        <Card data-testid="card-network">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('operator.dashboard.network')}</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{systemHealth?.peerCount || '--'} {t('operator.dashboard.peers')}</div>
            <div className="text-xs text-muted-foreground">
              {systemHealth?.networkBandwidth || '--'} Mbps
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" data-testid="card-performance-chart">
          <CardHeader>
            <CardTitle>{t('operator.dashboard.performanceMetrics')}</CardTitle>
            <CardDescription>{t('operator.dashboard.realTimePerformance')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="tps" className="w-full" data-testid="tabs-performance">
              <TabsList className="grid w-full grid-cols-4" data-testid="tablist-performance">
                <TabsTrigger value="tps" data-testid="tab-tps">{t('operator.dashboard.tps')}</TabsTrigger>
                <TabsTrigger value="latency" data-testid="tab-latency">{t('operator.dashboard.latency')}</TabsTrigger>
                <TabsTrigger value="resources" data-testid="tab-resources">{t('operator.dashboard.resources')}</TabsTrigger>
                <TabsTrigger value="health" data-testid="tab-health">{t('operator.dashboard.health')}</TabsTrigger>
              </TabsList>
              <TabsContent value="tps" className="h-[250px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="time" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Area type="monotone" dataKey="tps" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="latency" className="h-[250px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="time" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Line type="monotone" dataKey="latency" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="resources" className="h-[250px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="time" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Legend />
                    <Line type="monotone" dataKey="cpu" name={t('operator.dashboard.cpuUsage')} stroke="#ef4444" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="memory" name={t('operator.dashboard.memory')} stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="health" className="h-[250px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="time" className="text-xs" />
                    <YAxis domain={[90, 100]} className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Area type="monotone" dataKey="health" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card data-testid="card-alert-center">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                {t('operator.dashboard.alertCenter')}
              </CardTitle>
              <CardDescription>{t('operator.dashboard.activeNotifications')}</CardDescription>
            </div>
            <Badge variant="outline">{alerts?.length || 0}</Badge>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px]">
              {alerts && alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.slice(0, 10).map((alert) => (
                    <div 
                      key={alert.id} 
                      className="p-3 rounded-lg border bg-card hover-elevate"
                      data-testid={`alert-item-${alert.id}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getSeverityBadge(alert.severity)}
                            <span className="text-xs text-muted-foreground">
                              {formatTimeForLocale(alert.created_at)}
                            </span>
                          </div>
                          <p className="text-sm font-medium truncate">{translateAlertTitle(alert.title)}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{translateAlertMessage(alert.message)}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => acknowledgeAlert.mutate({ id: alert.id, action: 'acknowledge' })}
                            data-testid={`btn-ack-${alert.id}`}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => acknowledgeAlert.mutate({ id: alert.id, action: 'dismiss' })}
                            data-testid={`btn-dismiss-${alert.id}`}
                          >
                            <BellOff className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                  <p className="text-sm text-muted-foreground">{t('operator.dashboard.noActiveAlerts')}</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total-members">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('operator.dashboard.totalMembers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.members?.total_members || '0'}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">{data?.members?.active_members || '0'} {t('operator.dashboard.active')}</span>
              {' • '}
              <span className="text-yellow-500">{data?.members?.pending_members || '0'} {t('operator.dashboard.pending')}</span>
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-kyc-status">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('operator.dashboard.kycStatus')}</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.members?.kyc_verified || '0'}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">{t('operator.dashboard.verified')}</span>
              {' • '}
              <span className="text-red-500">{data?.members?.no_kyc || '0'} {t('operator.dashboard.unverified')}</span>
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-validator-apps">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('operator.dashboard.validatorApps')}</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApps}</div>
            <p className="text-xs text-muted-foreground">
              {t('operator.dashboard.pendingReview')}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-security-alerts">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('operator.dashboard.securityAlerts')}</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {parseInt(criticalAlerts) + parseInt(highAlerts)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-500">{criticalAlerts} {t('operator.dashboard.critical')}</span>
              {' • '}
              <span className="text-orange-500">{highAlerts} {t('operator.dashboard.high')}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card data-testid="card-quick-actions">
          <CardHeader>
            <CardTitle>{t('operator.dashboard.quickActions')}</CardTitle>
            <CardDescription>{t('operator.dashboard.commonOperatorTasks')}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Link href="/operator/members">
              <Button variant="outline" className="w-full justify-start" data-testid="btn-manage-members">
                <Users className="w-4 h-4 mr-2" />
                {t('operator.memberManagement')}
              </Button>
            </Link>
            <Link href="/operator/validators">
              <Button variant="outline" className="w-full justify-start" data-testid="btn-review-apps">
                <ClipboardList className="w-4 h-4 mr-2" />
                {t('operator.dashboard.validators')}
              </Button>
            </Link>
            <Link href="/operator/security">
              <Button variant="outline" className="w-full justify-start" data-testid="btn-security-audit">
                <ShieldAlert className="w-4 h-4 mr-2" />
                {t('operator.securityAudit')}
              </Button>
            </Link>
            <Link href="/operator/reports">
              <Button variant="outline" className="w-full justify-start" data-testid="btn-compliance">
                <FileCheck className="w-4 h-4 mr-2" />
                {t('operator.complianceReports')}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card data-testid="card-recent-activity">
          <CardHeader>
            <CardTitle>{t('operator.dashboard.recentAdminActivity')}</CardTitle>
            <CardDescription>{t('operator.dashboard.latestOperatorActions')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[160px]">
              {data?.recentActivity && data.recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {data.recentActivity.slice(0, 8).map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <div className="flex-shrink-0">
                        {activity.action_category === 'security' ? (
                          <ShieldAlert className="h-4 w-4 text-red-500" />
                        ) : activity.action_category === 'member_management' ? (
                          <Users className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Activity className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">{translateActionType(activity.action_type)}</p>
                        <p className="text-xs text-muted-foreground truncate">{translateResource(activity.resource)}</p>
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTimeForLocale(activity.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t('operator.dashboard.noRecentActivity')}</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card data-testid="card-member-status">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('operator.dashboard.memberStatusDistribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  <span className="text-sm">{t('operator.members.active')}</span>
                </div>
                <span className="text-sm font-medium">{data?.members?.active_members || '0'}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-yellow-500" />
                  <span className="text-sm">{t('operator.members.pending')}</span>
                </div>
                <span className="text-sm font-medium">{data?.members?.pending_members || '0'}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-3 w-3 text-red-500" />
                  <span className="text-sm">{t('operator.dashboard.suspended')}</span>
                </div>
                <span className="text-sm font-medium">{data?.members?.suspended_members || '0'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-validator-apps-status">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('operator.dashboard.validatorApplications')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data?.validatorApplications && data.validatorApplications.length > 0 ? (
                data.validatorApplications.map((app, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <Badge variant={
                      app.status === 'pending' ? 'default' :
                      app.status === 'approved' ? 'default' :
                      app.status === 'rejected' ? 'destructive' : 'secondary'
                    } className="capitalize">
                      {translateAppStatus(app.status)}
                    </Badge>
                    <span className="text-sm font-medium">{app.count}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">{t('operator.dashboard.noApplications')}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-security-summary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('operator.dashboard.openSecurityEvents')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data?.securityAlerts && data.securityAlerts.length > 0 ? (
                data.securityAlerts.map((alert, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <Badge variant={
                      alert.severity === 'critical' ? 'destructive' :
                      alert.severity === 'high' ? 'default' :
                      alert.severity === 'medium' ? 'secondary' : 'outline'
                    } className="capitalize">
                      {translateSeverity(alert.severity)}
                    </Badge>
                    <span className="text-sm font-medium">{alert.count}</span>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2 text-green-500">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">{t('operator.dashboard.noOpenAlerts')}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
