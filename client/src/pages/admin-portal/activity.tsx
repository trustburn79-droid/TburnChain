import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import {
  Activity,
  Search,
  RefreshCw,
  Download,
  User,
  Clock,
  Monitor,
  Globe,
  Shield,
  AlertTriangle,
  CheckCircle,
  LogIn,
  LogOut,
  Settings,
  FileText,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  Wifi,
  WifiOff,
} from "lucide-react";

interface ActivityLog {
  id: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  action: string;
  actionType: "login" | "logout" | "create" | "update" | "delete" | "view" | "settings" | "security";
  target: string;
  ip: string;
  device: string;
  location: string;
  timestamp: string;
  status: "success" | "failed" | "warning";
}

interface ActivityData {
  logs: ActivityLog[];
  stats: {
    totalActivities24h: number;
    activeUsers: number;
    failedAttempts: number;
    securityEvents: number;
  };
}

function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  changeType = "neutral",
  isLoading = false,
  bgColor = "bg-blue-500/10",
  iconColor = "text-blue-500",
  testId
}: {
  icon: any;
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  isLoading?: boolean;
  bgColor?: string;
  iconColor?: string;
  testId?: string;
}) {
  return (
    <Card data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {change && (
              <p className={`text-xs ${
                changeType === "positive" ? "text-green-500" : 
                changeType === "negative" ? "text-red-500" : 
                "text-muted-foreground"
              }`}>
                {change}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function ActivityMonitor() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [timeRange, setTimeRange] = useState("24h");
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const { data: activityData, isLoading, error, refetch } = useQuery<ActivityData>({
    queryKey: ["/api/admin/activity", `timeRange=${timeRange}`],
    refetchInterval: wsConnected ? false : 30000,
  });

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/admin/activity`;
    
    try {
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        setWsConnected(true);
        toast({
          title: t("adminActivity.wsConnected"),
          description: t("adminActivity.wsConnectedDesc"),
        });
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'activity_update') {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/activity"] });
          }
        } catch (e) {
          console.error('WebSocket message parse error:', e);
        }
      };
      
      wsRef.current.onclose = () => {
        setWsConnected(false);
      };
      
      wsRef.current.onerror = () => {
        setWsConnected(false);
      };
    } catch (e) {
      console.error('WebSocket connection error:', e);
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [toast, t]);

  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: t("adminActivity.refreshing"),
      description: t("adminActivity.refreshingDesc"),
    });
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify(activityData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: t("adminActivity.exported"),
      description: t("adminActivity.exportedDesc"),
    });
  }, [activityData, toast, t]);

  const mockActivityLogs: ActivityLog[] = [
    { id: "1", user: { name: "John Admin", email: "john@tburn.io" }, action: t("adminActivity.actions.loggedIn"), actionType: "login", target: "Admin Portal", ip: "192.168.1.100", device: "Chrome on MacOS", location: "Seoul, KR", timestamp: "2024-12-04 14:45:23", status: "success" },
    { id: "2", user: { name: "Sarah Ops", email: "sarah@tburn.io" }, action: t("adminActivity.actions.modifiedValidator"), actionType: "settings", target: "Validator #156", ip: "192.168.1.105", device: "Firefox on Windows", location: "Busan, KR", timestamp: "2024-12-04 14:42:10", status: "success" },
    { id: "3", user: { name: "Mike Dev", email: "mike@tburn.io" }, action: t("adminActivity.actions.failedLogin"), actionType: "login", target: "Admin Portal", ip: "10.0.0.55", device: "Safari on iOS", location: "Unknown", timestamp: "2024-12-04 14:38:45", status: "failed" },
    { id: "4", user: { name: "John Admin", email: "john@tburn.io" }, action: t("adminActivity.actions.createdApiKey"), actionType: "create", target: "API Key - Production", ip: "192.168.1.100", device: "Chrome on MacOS", location: "Seoul, KR", timestamp: "2024-12-04 14:35:12", status: "success" },
    { id: "5", user: { name: "System", email: "system@tburn.io" }, action: t("adminActivity.actions.securityAlert"), actionType: "security", target: "Rate limit exceeded", ip: "External", device: "N/A", location: "Multiple", timestamp: "2024-12-04 14:30:00", status: "warning" },
    { id: "6", user: { name: "Sarah Ops", email: "sarah@tburn.io" }, action: t("adminActivity.actions.viewedLogs"), actionType: "view", target: "Audit Logs", ip: "192.168.1.105", device: "Firefox on Windows", location: "Busan, KR", timestamp: "2024-12-04 14:25:33", status: "success" },
    { id: "7", user: { name: "John Admin", email: "john@tburn.io" }, action: t("adminActivity.actions.updatedNetwork"), actionType: "update", target: "Network Config", ip: "192.168.1.100", device: "Chrome on MacOS", location: "Seoul, KR", timestamp: "2024-12-04 14:20:00", status: "success" },
    { id: "8", user: { name: "Admin Bot", email: "bot@tburn.io" }, action: t("adminActivity.actions.executedBackup"), actionType: "create", target: "Database Backup", ip: "Internal", device: "Automated", location: "Server", timestamp: "2024-12-04 14:00:00", status: "success" },
  ];

  const activityLogs = activityData?.logs || mockActivityLogs;
  const stats = activityData?.stats || { totalActivities24h: 1247, activeUsers: 12, failedAttempts: 3, securityEvents: 7 };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "login": return <LogIn className="h-4 w-4" />;
      case "logout": return <LogOut className="h-4 w-4" />;
      case "create": return <FileText className="h-4 w-4" />;
      case "update": return <Edit className="h-4 w-4" />;
      case "delete": return <Trash2 className="h-4 w-4" />;
      case "view": return <Eye className="h-4 w-4" />;
      case "settings": return <Settings className="h-4 w-4" />;
      case "security": return <Shield className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "text-green-500 bg-green-500/10";
      case "failed": return "text-red-500 bg-red-500/10";
      case "warning": return "text-yellow-500 bg-yellow-500/10";
      default: return "";
    }
  };

  const filteredLogs = activityLogs.filter((log) => {
    const matchesSearch = 
      log.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || log.actionType === filterType;
    return matchesSearch && matchesType;
  });

  if (error) {
    return (
      <div className="flex-1 overflow-auto" data-testid="activity-error-container">
        <div className="container max-w-[1800px] mx-auto p-6">
          <Card className="border-red-500/50 bg-red-500/10">
            <CardContent className="flex items-center gap-4 py-6">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-500">{t("adminActivity.errorLoading")}</h3>
                <p className="text-sm text-muted-foreground">{t("adminActivity.errorLoadingDesc")}</p>
              </div>
              <Button variant="outline" onClick={() => refetch()} className="ml-auto" data-testid="button-retry">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("adminActivity.retry")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-testid="activity-container">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-activity-title">
              <Activity className="h-8 w-8" />
              {t("adminActivity.title")}
              <Badge variant={wsConnected ? "default" : "secondary"} className="ml-2">
                {wsConnected ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                {wsConnected ? t("adminActivity.live") : t("adminActivity.offline")}
              </Badge>
            </h1>
            <p className="text-muted-foreground" data-testid="text-activity-subtitle">
              {t("adminActivity.subtitle")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              {t("adminActivity.export")}
            </Button>
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading} data-testid="button-refresh">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {t("adminActivity.refresh")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={Activity}
            label={t("adminActivity.metrics.totalActivities24h")}
            value={stats.totalActivities24h.toLocaleString()}
            change={`+15% ${t("adminActivity.metrics.fromYesterday")}`}
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-blue-500/10"
            iconColor="text-blue-500"
            testId="metric-total-activities"
          />
          <MetricCard
            icon={User}
            label={t("adminActivity.metrics.activeUsers")}
            value={stats.activeUsers}
            change={t("adminActivity.metrics.currentlyOnline")}
            changeType="neutral"
            isLoading={isLoading}
            bgColor="bg-green-500/10"
            iconColor="text-green-500"
            testId="metric-active-users"
          />
          <MetricCard
            icon={AlertTriangle}
            label={t("adminActivity.metrics.failedAttempts")}
            value={stats.failedAttempts}
            change={t("adminActivity.metrics.inLast24h")}
            changeType="negative"
            isLoading={isLoading}
            bgColor="bg-red-500/10"
            iconColor="text-red-500"
            testId="metric-failed-attempts"
          />
          <MetricCard
            icon={Shield}
            label={t("adminActivity.metrics.securityEvents")}
            value={stats.securityEvents}
            change={t("adminActivity.metrics.warningsTriggered")}
            changeType="neutral"
            isLoading={isLoading}
            bgColor="bg-yellow-500/10"
            iconColor="text-yellow-500"
            testId="metric-security-events"
          />
        </div>

        <Card data-testid="card-filters">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("adminActivity.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-activity"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]" data-testid="select-filter-type">
                  <SelectValue placeholder={t("adminActivity.filterByType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("adminActivity.filterTypes.all")}</SelectItem>
                  <SelectItem value="login">{t("adminActivity.filterTypes.login")}</SelectItem>
                  <SelectItem value="create">{t("adminActivity.filterTypes.create")}</SelectItem>
                  <SelectItem value="update">{t("adminActivity.filterTypes.update")}</SelectItem>
                  <SelectItem value="delete">{t("adminActivity.filterTypes.delete")}</SelectItem>
                  <SelectItem value="view">{t("adminActivity.filterTypes.view")}</SelectItem>
                  <SelectItem value="settings">{t("adminActivity.filterTypes.settings")}</SelectItem>
                  <SelectItem value="security">{t("adminActivity.filterTypes.security")}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[150px]" data-testid="select-time-range">
                  <SelectValue placeholder={t("adminActivity.timeRange")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">{t("adminActivity.timeRanges.1h")}</SelectItem>
                  <SelectItem value="24h">{t("adminActivity.timeRanges.24h")}</SelectItem>
                  <SelectItem value="7d">{t("adminActivity.timeRanges.7d")}</SelectItem>
                  <SelectItem value="30d">{t("adminActivity.timeRanges.30d")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-activity-timeline">
          <CardHeader>
            <CardTitle>{t("adminActivity.timeline.title")}</CardTitle>
            <CardDescription>{t("adminActivity.timeline.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors" data-testid={`activity-log-${log.id}`}>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={log.user.avatar} />
                        <AvatarFallback>{log.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{log.user.name}</span>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-sm text-muted-foreground">{log.action}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {getActionIcon(log.actionType)}
                            <span className="ml-1">{log.target}</span>
                          </Badge>
                          <Badge className={`text-xs ${getStatusColor(log.status)}`}>
                            {log.status === "success" && <CheckCircle className="h-3 w-3 mr-1" />}
                            {log.status === "failed" && <AlertTriangle className="h-3 w-3 mr-1" />}
                            {t(`adminActivity.status.${log.status}`)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {log.timestamp}
                          </span>
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {log.ip}
                          </span>
                          <span className="flex items-center gap-1">
                            <Monitor className="h-3 w-3" />
                            {log.device}
                          </span>
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {log.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card data-testid="card-active-sessions">
          <CardHeader>
            <CardTitle>{t("adminActivity.activeSessions.title")}</CardTitle>
            <CardDescription>{t("adminActivity.activeSessions.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("adminActivity.activeSessions.user")}</TableHead>
                    <TableHead>{t("adminActivity.activeSessions.ip")}</TableHead>
                    <TableHead>{t("adminActivity.activeSessions.device")}</TableHead>
                    <TableHead>{t("adminActivity.activeSessions.location")}</TableHead>
                    <TableHead>{t("adminActivity.activeSessions.sessionStarted")}</TableHead>
                    <TableHead>{t("adminActivity.activeSessions.status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow data-testid="session-row-1">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>JA</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">John Admin</p>
                          <p className="text-xs text-muted-foreground">john@tburn.io</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>192.168.1.100</TableCell>
                    <TableCell>Chrome on MacOS</TableCell>
                    <TableCell>Seoul, KR</TableCell>
                    <TableCell>2024-12-04 14:45:23</TableCell>
                    <TableCell>
                      <Badge className="bg-green-500">{t("adminActivity.activeSessions.active")}</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow data-testid="session-row-2">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>SO</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">Sarah Ops</p>
                          <p className="text-xs text-muted-foreground">sarah@tburn.io</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>192.168.1.105</TableCell>
                    <TableCell>Firefox on Windows</TableCell>
                    <TableCell>Busan, KR</TableCell>
                    <TableCell>2024-12-04 13:30:00</TableCell>
                    <TableCell>
                      <Badge className="bg-green-500">{t("adminActivity.activeSessions.active")}</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
