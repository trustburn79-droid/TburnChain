import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import {
  Monitor,
  Search,
  RefreshCw,
  LogOut,
  Clock,
  Globe,
  Shield,
  AlertTriangle,
  CheckCircle,
  Smartphone,
  Laptop,
  Tablet,
  Settings,
  Key,
  AlertCircle,
  Wifi,
  WifiOff,
  Eye,
} from "lucide-react";

interface Session {
  id: string;
  user: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  device: string;
  deviceType: "desktop" | "mobile" | "tablet";
  browser: string;
  os: string;
  ip: string;
  location: string;
  startTime: string;
  lastActivity: string;
  status: "active" | "idle" | "expired";
  isCurrent?: boolean;
}

interface SessionsData {
  sessions: Session[];
  stats: {
    total: number;
    active: number;
    idle: number;
    expired: number;
  };
  settings: {
    timeout: number;
    concurrentSessions: boolean;
    sessionLockOnIdle: boolean;
    deviceTrust: boolean;
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

export default function Sessions() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [showSessionDetail, setShowSessionDetail] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showTerminateConfirm, setShowTerminateConfirm] = useState(false);
  const [pendingTerminateId, setPendingTerminateId] = useState<string | null>(null);

  const { data: sessionsData, isLoading, error, refetch } = useQuery<SessionsData>({
    queryKey: ["/api/admin/sessions"],
    refetchInterval: wsConnected ? false : 30000,
  });

  const terminateSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/sessions/${sessionId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sessions"] });
      toast({
        title: t("adminSessions.sessionTerminated"),
        description: t("adminSessions.sessionTerminatedDesc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("adminSessions.terminateError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const terminateAllSessionsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/admin/sessions/all");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sessions"] });
      toast({
        title: t("adminSessions.allSessionsTerminated"),
        description: t("adminSessions.allSessionsTerminatedDesc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("adminSessions.terminateAllError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<SessionsData['settings']>) => {
      const response = await apiRequest("POST", "/api/admin/sessions/settings", settings);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sessions"] });
      toast({
        title: t("adminSessions.settingsSaved"),
        description: t("adminSessions.settingsSavedDesc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("adminSessions.settingsError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/admin/sessions`;
    
    try {
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        setWsConnected(true);
        toast({
          title: t("adminSessions.wsConnected"),
          description: t("adminSessions.wsConnectedDesc"),
        });
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'session_update') {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/sessions"] });
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
      title: t("adminSessions.refreshing"),
      description: t("adminSessions.refreshingDesc"),
    });
  }, [refetch, toast, t]);

  const mockSessions: Session[] = [
    { id: "1", user: { name: "Dr. James Park", email: "cto@tburn.io", role: "Super Admin" }, device: "MacBook Pro M3", deviceType: "desktop", browser: "Chrome 131", os: "macOS Sequoia", ip: "10.0.1.10", location: "Seoul, South Korea", startTime: "2024-12-07 20:00:00", lastActivity: "Just now", status: "active", isCurrent: true },
    { id: "2", user: { name: "Sarah Kim", email: "coo@tburn.io", role: "Super Admin" }, device: "MacBook Air M2", deviceType: "desktop", browser: "Safari 18", os: "macOS Sequoia", ip: "10.0.1.11", location: "Seoul, South Korea", startTime: "2024-12-07 19:30:00", lastActivity: "2 minutes ago", status: "active" },
    { id: "3", user: { name: "Michael Chen", email: "head-ops@tburn.io", role: "Operator" }, device: "Dell XPS 15", deviceType: "desktop", browser: "Firefox 132", os: "Windows 11", ip: "10.0.1.20", location: "Seoul, South Korea", startTime: "2024-12-07 18:00:00", lastActivity: "5 minutes ago", status: "active" },
    { id: "4", user: { name: "Jennifer Lee", email: "lead-ops@tburn.io", role: "Operator" }, device: "ThinkPad X1", deviceType: "desktop", browser: "Chrome 131", os: "Windows 11", ip: "10.0.1.21", location: "Seoul, South Korea", startTime: "2024-12-07 17:45:00", lastActivity: "8 minutes ago", status: "active" },
    { id: "5", user: { name: "Robert Johnson", email: "ciso@tburn.io", role: "Security" }, device: "MacBook Pro M3", deviceType: "desktop", browser: "Chrome 131", os: "macOS Sequoia", ip: "10.0.1.30", location: "Seoul, South Korea", startTime: "2024-12-07 19:00:00", lastActivity: "3 minutes ago", status: "active" },
    { id: "6", user: { name: "Emma Wilson", email: "security-lead@tburn.io", role: "Security" }, device: "iMac 24", deviceType: "desktop", browser: "Safari 18", os: "macOS Sequoia", ip: "10.0.1.31", location: "Seoul, South Korea", startTime: "2024-12-07 18:30:00", lastActivity: "10 minutes ago", status: "active" },
    { id: "7", user: { name: "David Zhang", email: "tech-lead@tburn.io", role: "Developer" }, device: "System76 Pangolin", deviceType: "desktop", browser: "Chrome 131", os: "Ubuntu 24.04", ip: "10.0.1.40", location: "Seoul, South Korea", startTime: "2024-12-07 16:00:00", lastActivity: "Just now", status: "active" },
    { id: "8", user: { name: "Alex Thompson", email: "senior-dev@tburn.io", role: "Developer" }, device: "Dell Precision", deviceType: "desktop", browser: "Firefox 132", os: "Fedora 40", ip: "10.0.1.41", location: "Seoul, South Korea", startTime: "2024-12-07 15:30:00", lastActivity: "12 minutes ago", status: "active" },
    { id: "9", user: { name: "Chris Park", email: "blockchain-dev@tburn.io", role: "Developer" }, device: "MacBook Pro M2", deviceType: "desktop", browser: "Chrome 131", os: "macOS Sequoia", ip: "10.0.1.42", location: "Seoul, South Korea", startTime: "2024-12-07 14:00:00", lastActivity: "7 minutes ago", status: "active" },
    { id: "10", user: { name: "Maria Garcia", email: "head-analyst@tburn.io", role: "Admin" }, device: "Surface Pro 9", deviceType: "tablet", browser: "Edge 131", os: "Windows 11", ip: "10.0.1.50", location: "Seoul, South Korea", startTime: "2024-12-07 17:00:00", lastActivity: "15 minutes ago", status: "active" },
    { id: "11", user: { name: "Kevin Brown", email: "data-analyst@tburn.io", role: "Viewer" }, device: "ThinkPad T14", deviceType: "desktop", browser: "Chrome 131", os: "Windows 11", ip: "10.0.1.51", location: "Seoul, South Korea", startTime: "2024-12-07 16:30:00", lastActivity: "20 minutes ago", status: "active" },
    { id: "12", user: { name: "Linda Martinez", email: "compliance@tburn.io", role: "Security" }, device: "MacBook Air M3", deviceType: "desktop", browser: "Safari 18", os: "macOS Sequoia", ip: "10.0.1.32", location: "Seoul, South Korea", startTime: "2024-12-07 15:00:00", lastActivity: "25 minutes ago", status: "active" },
  ];

  const sessions = sessionsData?.sessions || mockSessions;
  const stats = sessionsData?.stats || {
    total: sessions.length,
    active: sessions.filter(s => s.status === "active").length,
    idle: sessions.filter(s => s.status === "idle").length,
    expired: sessions.filter(s => s.status === "expired").length,
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "desktop": return <Laptop className="h-5 w-5" />;
      case "mobile": return <Smartphone className="h-5 w-5" />;
      case "tablet": return <Tablet className="h-5 w-5" />;
      default: return <Monitor className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "idle": return "bg-yellow-500";
      case "expired": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getSessionDetailSections = (session: Session): DetailSection[] => [
    {
      title: t("adminSessions.detail.sessionInfo"),
      fields: [
        { label: t("common.name"), value: session.user.name },
        { label: t("common.email"), value: session.user.email },
        { 
          label: t("common.status"), 
          value: t(`adminSessions.statusTypes.${session.status}`), 
          type: "badge" as const,
          badgeColor: getStatusColor(session.status)
        },
        { label: t("adminSessions.sessionsTable.started"), value: session.startTime, type: "date" as const },
        { label: t("adminSessions.sessionsTable.lastActivity"), value: session.lastActivity },
      ],
    },
    {
      title: t("adminSessions.detail.deviceLocation"),
      fields: [
        { label: t("adminSessions.sessionsTable.device"), value: session.device },
        { label: t("common.type"), value: session.deviceType },
        { label: "Browser", value: session.browser },
        { label: "OS", value: session.os },
        { label: "IP", value: session.ip, copyable: true },
        { label: t("adminSessions.sessionsTable.location"), value: session.location },
      ],
    },
  ];

  const confirmTerminate = () => {
    if (pendingTerminateId) {
      terminateSessionMutation.mutate(pendingTerminateId);
      setShowTerminateConfirm(false);
      setPendingTerminateId(null);
    }
  };

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch = 
      session.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.ip.includes(searchQuery);
    const matchesStatus = filterStatus === "all" || session.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (error) {
    return (
      <div className="flex-1 overflow-auto" data-testid="sessions-error-container">
        <div className="container max-w-[1800px] mx-auto p-6">
          <Card className="border-red-500/50 bg-red-500/10">
            <CardContent className="flex items-center gap-4 py-6">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-500">{t("adminSessions.errorLoading")}</h3>
                <p className="text-sm text-muted-foreground">{t("adminSessions.errorLoadingDesc")}</p>
              </div>
              <Button variant="outline" onClick={() => refetch()} className="ml-auto" data-testid="button-retry">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("adminSessions.retry")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-testid="sessions-container">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-sessions-title">
              <Monitor className="h-8 w-8" />
              {t("adminSessions.title")}
              <Badge variant={wsConnected ? "default" : "secondary"} className="ml-2">
                {wsConnected ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                {wsConnected ? t("adminSessions.live") : t("adminSessions.offline")}
              </Badge>
            </h1>
            <p className="text-muted-foreground" data-testid="text-sessions-subtitle">
              {t("adminSessions.subtitle")} | {i18n.language === 'ko' ? 'Manage active user sessions' : '세션 관리'}
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="button-settings">
                  <Settings className="h-4 w-4 mr-2" />
                  {t("adminSessions.sessionSettings")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("adminSessions.settingsDialog.title")}</DialogTitle>
                  <DialogDescription>{t("adminSessions.settingsDialog.description")}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t("adminSessions.settingsDialog.timeout")}</Label>
                    <Select defaultValue="30">
                      <SelectTrigger data-testid="select-timeout">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">{t("adminSessions.settingsDialog.timeouts.15min")}</SelectItem>
                        <SelectItem value="30">{t("adminSessions.settingsDialog.timeouts.30min")}</SelectItem>
                        <SelectItem value="60">{t("adminSessions.settingsDialog.timeouts.1hour")}</SelectItem>
                        <SelectItem value="120">{t("adminSessions.settingsDialog.timeouts.2hours")}</SelectItem>
                        <SelectItem value="480">{t("adminSessions.settingsDialog.timeouts.8hours")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t("adminSessions.settingsDialog.concurrentSessions")}</p>
                      <p className="text-sm text-muted-foreground">{t("adminSessions.settingsDialog.concurrentSessionsDesc")}</p>
                    </div>
                    <Switch defaultChecked data-testid="switch-concurrent-sessions" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t("adminSessions.settingsDialog.sessionLock")}</p>
                      <p className="text-sm text-muted-foreground">{t("adminSessions.settingsDialog.sessionLockDesc")}</p>
                    </div>
                    <Switch defaultChecked data-testid="switch-session-lock" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t("adminSessions.settingsDialog.deviceTrust")}</p>
                      <p className="text-sm text-muted-foreground">{t("adminSessions.settingsDialog.deviceTrustDesc")}</p>
                    </div>
                    <Switch defaultChecked data-testid="switch-device-trust" />
                  </div>
                  <Button className="w-full" onClick={() => updateSettingsMutation.mutate({})} disabled={updateSettingsMutation.isPending} data-testid="button-save-settings">
                    {updateSettingsMutation.isPending ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
                    {t("adminSessions.settingsDialog.saveSettings")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button 
              variant="destructive" 
              onClick={() => terminateAllSessionsMutation.mutate()}
              disabled={terminateAllSessionsMutation.isPending}
              data-testid="button-terminate-all"
            >
              {terminateAllSessionsMutation.isPending ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <LogOut className="h-4 w-4 mr-2" />}
              {t("adminSessions.terminateAll")}
            </Button>
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading} data-testid="button-refresh">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {t("adminSessions.refresh")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={Monitor}
            label={t("adminSessions.metrics.totalSessions")}
            value={stats.total}
            change="Full team for Dec 8 launch"
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-blue-500/10"
            iconColor="text-blue-500"
            testId="metric-total-sessions"
          />
          <MetricCard
            icon={CheckCircle}
            label={t("adminSessions.metrics.activeSessions")}
            value={stats.active}
            change="100% active for launch"
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-green-500/10"
            iconColor="text-green-500"
            testId="metric-active-sessions"
          />
          <MetricCard
            icon={Clock}
            label={t("adminSessions.metrics.idleSessions")}
            value={stats.idle}
            change="All users engaged"
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-green-500/10"
            iconColor="text-green-500"
            testId="metric-idle-sessions"
          />
          <MetricCard
            icon={AlertTriangle}
            label={t("adminSessions.metrics.expiredSessions")}
            value={stats.expired}
            change="All sessions current"
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-green-500/10"
            iconColor="text-green-500"
            testId="metric-expired-sessions"
          />
        </div>

        <Card data-testid="card-filters">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("adminSessions.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-sessions"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]" data-testid="select-filter-status">
                  <SelectValue placeholder={t("adminSessions.status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("adminSessions.statusTypes.all")}</SelectItem>
                  <SelectItem value="active">{t("adminSessions.statusTypes.active")}</SelectItem>
                  <SelectItem value="idle">{t("adminSessions.statusTypes.idle")}</SelectItem>
                  <SelectItem value="expired">{t("adminSessions.statusTypes.expired")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-sessions-table">
          <CardHeader>
            <CardTitle>{t("adminSessions.sessionsTable.title")}</CardTitle>
            <CardDescription>{t("adminSessions.sessionsTable.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("adminSessions.sessionsTable.user")}</TableHead>
                    <TableHead>{t("adminSessions.sessionsTable.device")}</TableHead>
                    <TableHead>{t("adminSessions.sessionsTable.location")}</TableHead>
                    <TableHead>{t("adminSessions.sessionsTable.started")}</TableHead>
                    <TableHead>{t("adminSessions.sessionsTable.lastActivity")}</TableHead>
                    <TableHead>{t("adminSessions.sessionsTable.status")}</TableHead>
                    <TableHead>{t("adminSessions.sessionsTable.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.map((session) => (
                    <TableRow key={session.id} className={session.isCurrent ? "bg-primary/5" : ""} data-testid={`session-row-${session.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={session.user.avatar} />
                            <AvatarFallback>{(session.user?.name || "AA").substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{session.user.name}</p>
                              {session.isCurrent && (
                                <Badge variant="outline" className="text-xs">{t("adminSessions.current")}</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{session.user.email}</p>
                            <Badge variant="secondary" className="text-xs">{session.user.role}</Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(session.deviceType)}
                          <div>
                            <p className="font-medium">{session.device}</p>
                            <p className="text-xs text-muted-foreground">{session.browser} · {session.os}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p>{session.location}</p>
                            <p className="text-xs text-muted-foreground">{session.ip}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{session.startTime}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{session.lastActivity}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(session.status)}>
                          {t(`adminSessions.statusTypes.${session.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                              setSelectedSession(session);
                              setShowSessionDetail(true);
                            }}
                            data-testid={`button-view-${session.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" disabled={session.isCurrent} data-testid={`button-key-${session.id}`}>
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500"
                            disabled={session.isCurrent}
                            onClick={() => {
                              setPendingTerminateId(session.id);
                              setShowTerminateConfirm(true);
                            }}
                            data-testid={`button-terminate-${session.id}`}
                          >
                            <LogOut className="h-4 w-4" />
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

        <Card data-testid="card-security-recommendations">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t("adminSessions.securityRecommendations.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-green-500/10" data-testid="recommendation-known-locations">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">{t("adminSessions.securityRecommendations.knownLocations")}</p>
                <p className="text-sm text-muted-foreground">{t("adminSessions.securityRecommendations.knownLocationsDesc")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-yellow-500/10" data-testid="recommendation-expired-sessions">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="font-medium">{t("adminSessions.securityRecommendations.expiredSessions")}</p>
                <p className="text-sm text-muted-foreground">{t("adminSessions.securityRecommendations.expiredSessionsDesc")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedSession && (
        <DetailSheet
          open={showSessionDetail}
          onOpenChange={setShowSessionDetail}
          title={selectedSession.user.name}
          subtitle={selectedSession.user.email}
          icon={<Monitor className="h-5 w-5" />}
          sections={getSessionDetailSections(selectedSession)}
          actions={[
            {
              label: t("adminSessions.terminate"),
              icon: <LogOut className="h-4 w-4" />,
              onClick: () => {
                setPendingTerminateId(selectedSession.id);
                setShowSessionDetail(false);
                setShowTerminateConfirm(true);
              },
              variant: "destructive",
              disabled: selectedSession.isCurrent,
            },
          ]}
        />
      )}

      <ConfirmationDialog
        open={showTerminateConfirm}
        onOpenChange={setShowTerminateConfirm}
        title={t("adminSessions.confirm.terminateTitle")}
        description={t("adminSessions.confirm.terminateDesc")}
        actionType="terminate"
        onConfirm={confirmTerminate}
        isLoading={terminateSessionMutation.isPending}
        destructive={true}
        confirmText={t("adminSessions.terminate")}
        cancelText={t("adminSessions.cancel")}
      />
    </div>
  );
}
