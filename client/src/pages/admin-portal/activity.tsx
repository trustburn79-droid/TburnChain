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
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
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
  const [showActivityDetail, setShowActivityDetail] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityLog | null>(null);
  const [showExportConfirm, setShowExportConfirm] = useState(false);

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

  const performExport = useCallback(() => {
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
    setShowExportConfirm(false);
  }, [activityData, toast, t]);

  const getActivityDetailSections = useCallback((activity: ActivityLog): DetailSection[] => {
    const getStatusBadgeColor = (status: string) => {
      switch (status) {
        case "success": return "bg-green-500/10 text-green-500";
        case "failed": return "bg-red-500/10 text-red-500";
        case "warning": return "bg-yellow-500/10 text-yellow-500";
        default: return "";
      }
    };

    return [
      {
        title: t("adminActivity.detail.activityInfo"),
        fields: [
          { label: t("adminActivity.action"), value: activity.action, type: "text" },
          { label: t("common.type"), value: activity.actionType, type: "badge", badgeVariant: "outline" },
          { label: t("adminActivity.resource"), value: activity.target, type: "text" },
          { label: t("common.status"), value: t(`adminActivity.status.${activity.status || "unknown"}`), type: "badge", badgeColor: getStatusBadgeColor(activity.status || "unknown") },
          { label: t("adminActivity.timestamp"), value: activity.timestamp, type: "date" },
        ],
      },
      {
        title: t("adminActivity.detail.userLocation"),
        fields: [
          { label: t("common.name"), value: activity.user.name, type: "text" },
          { label: t("adminAccounts.email"), value: activity.user.email, type: "text" },
          { label: t("adminActivity.ipAddress"), value: activity.ip, type: "code", copyable: true },
          { label: t("adminSessions.device"), value: activity.device, type: "text" },
          { label: t("adminSessions.location"), value: activity.location, type: "text" },
        ],
      },
    ];
  }, [t]);

  const mockActivityLogs: ActivityLog[] = [
    { id: "1", user: { name: "Dr. James Park", email: "cto@tburn.io" }, action: t("adminActivity.actions.loggedIn"), actionType: "login", target: "Admin Portal", ip: "10.0.1.10", device: "Chrome on MacOS", location: "Seoul, KR", timestamp: "2024-12-07 23:59:45", status: "success" },
    { id: "2", user: { name: "Sarah Kim", email: "coo@tburn.io" }, action: t("adminActivity.actions.loggedIn"), actionType: "login", target: "Admin Portal", ip: "10.0.1.11", device: "Safari on MacOS", location: "Seoul, KR", timestamp: "2024-12-07 23:58:30", status: "success" },
    { id: "3", user: { name: "Michael Chen", email: "head-ops@tburn.io" }, action: t("adminActivity.actions.modifiedValidator"), actionType: "settings", target: "Validator Pool Config", ip: "10.0.1.20", device: "Firefox on Windows", location: "Seoul, KR", timestamp: "2024-12-07 23:55:12", status: "success" },
    { id: "4", user: { name: "Robert Johnson", email: "ciso@tburn.io" }, action: t("adminActivity.actions.viewedLogs"), actionType: "view", target: "Security Audit Logs", ip: "10.0.1.30", device: "Chrome on Windows", location: "Seoul, KR", timestamp: "2024-12-07 23:50:00", status: "success" },
    { id: "5", user: { name: "David Zhang", email: "tech-lead@tburn.io" }, action: t("adminActivity.actions.updatedNetwork"), actionType: "update", target: "Network Params v8.0", ip: "10.0.1.40", device: "Chrome on Linux", location: "Seoul, KR", timestamp: "2024-12-07 23:45:30", status: "success" },
    { id: "6", user: { name: "System", email: "system@tburn.io" }, action: "Mainnet v8.0 deployment verified", actionType: "create", target: "TBURN Mainnet", ip: "Internal", device: "Automated", location: "Server Cluster", timestamp: "2024-12-07 23:40:00", status: "success" },
    { id: "7", user: { name: "Jennifer Lee", email: "lead-ops@tburn.io" }, action: "Shard configuration optimized", actionType: "settings", target: "8-Shard Cluster", ip: "10.0.1.21", device: "Firefox on MacOS", location: "Seoul, KR", timestamp: "2024-12-07 23:35:15", status: "success" },
    { id: "8", user: { name: "Emma Wilson", email: "security-lead@tburn.io" }, action: "Security audit completed", actionType: "security", target: "Pre-launch Security Review", ip: "10.0.1.31", device: "Chrome on MacOS", location: "Seoul, KR", timestamp: "2024-12-07 23:30:00", status: "success" },
    { id: "9", user: { name: "Admin Bot", email: "bot@tburn.io" }, action: t("adminActivity.actions.executedBackup"), actionType: "create", target: "Full System Backup", ip: "Internal", device: "Automated", location: "Backup Server", timestamp: "2024-12-07 23:00:00", status: "success" },
    { id: "10", user: { name: "Alex Thompson", email: "senior-dev@tburn.io" }, action: "Smart contract verified", actionType: "create", target: "TBURN Token Contract", ip: "10.0.1.41", device: "Chrome on Linux", location: "Seoul, KR", timestamp: "2024-12-07 22:45:00", status: "success" },
  ];

  const activityLogs = activityData?.logs || mockActivityLogs;
  const stats = activityData?.stats || { totalActivities24h: 3847, activeUsers: 12, failedAttempts: 0, securityEvents: 0 };

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
            <Button variant="outline" onClick={() => setShowExportConfirm(true)} data-testid="button-export">
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
            change="Dec 8 launch preparation"
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
            change="Full team online for launch"
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-green-500/10"
            iconColor="text-green-500"
            testId="metric-active-users"
          />
          <MetricCard
            icon={AlertTriangle}
            label={t("adminActivity.metrics.failedAttempts")}
            value={stats.failedAttempts}
            change="Zero failed attempts"
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-green-500/10"
            iconColor="text-green-500"
            testId="metric-failed-attempts"
          />
          <MetricCard
            icon={Shield}
            label={t("adminActivity.metrics.securityEvents")}
            value={stats.securityEvents}
            change="All systems secure"
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-green-500/10"
            iconColor="text-green-500"
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
                        <AvatarFallback>{(log.user?.name || "AA").substring(0, 2).toUpperCase()}</AvatarFallback>
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
                            {t(`adminActivity.status.${log.status || "unknown"}`)}
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedActivity(log);
                          setShowActivityDetail(true);
                        }}
                        data-testid={`button-view-activity-${log.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
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

        {selectedActivity && (
          <DetailSheet
            open={showActivityDetail}
            onOpenChange={setShowActivityDetail}
            title={selectedActivity.action}
            subtitle={selectedActivity.id}
            icon={<Activity className="h-5 w-5" />}
            sections={getActivityDetailSections(selectedActivity)}
          />
        )}

        <ConfirmationDialog
          open={showExportConfirm}
          onOpenChange={setShowExportConfirm}
          title={t("adminActivity.confirm.exportTitle")}
          description={t("adminActivity.confirm.exportDesc")}
          onConfirm={performExport}
          confirmText={t("adminActivity.export")}
          cancelText={t("adminActivity.cancel")}
          destructive={false}
        />
      </div>
    </div>
  );
}
