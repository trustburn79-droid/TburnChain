import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import {
  AlertCircle,
  AlertTriangle,
  Bug,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  Filter,
  Info,
  Pause,
  Play,
  RefreshCw,
  Search,
  Shield,
  Terminal,
  Trash2,
  XCircle,
} from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: Date;
  level: "error" | "warn" | "info" | "debug";
  source: string;
  message: string;
  metadata?: Record<string, any>;
}

interface LogStats {
  total: number;
  error: number;
  warn: number;
  info: number;
  debug: number;
}

function LogStatCard({
  icon: Icon,
  label,
  value,
  bgColor = "bg-muted",
  iconColor = "text-muted-foreground",
  isLoading = false,
  testId,
}: {
  icon: any;
  label: string;
  value: number;
  bgColor?: string;
  iconColor?: string;
  isLoading?: boolean;
  testId: string;
}) {
  return (
    <Card data-testid={testId}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${bgColor}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            {isLoading ? (
              <Skeleton className="h-7 w-12 mt-1" />
            ) : (
              <p className="text-2xl font-bold" data-testid={`${testId}-value`}>{value}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminLogs() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoScroll, setAutoScroll] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [showLogDetail, setShowLogDetail] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);

  const logSources = ["All", "Consensus", "Bridge", "AI", "Network", "Storage", "Security", "Database", "Mempool"];

  const { data: logsData, isLoading: loadingLogs, error: logsError, refetch: refetchLogs } = useQuery<{ logs: LogEntry[] }>({
    queryKey: ["/api/admin/logs"],
    refetchInterval: isPaused ? false : 3000,
  });

  const logs: LogEntry[] = useMemo(() => {
    if (logsData?.logs) return logsData.logs;
    return [
      { id: "1", timestamp: new Date(Date.now() - 1000), level: "error", source: "Consensus", message: t("adminLogs.blockValidationFailed"), metadata: { blockNumber: 18750234 } },
      { id: "2", timestamp: new Date(Date.now() - 2000), level: "warn", source: "Bridge", message: t("adminLogs.highLatencyDetected"), metadata: { latency: 285 } },
      { id: "3", timestamp: new Date(Date.now() - 3000), level: "info", source: "AI", message: t("adminLogs.strategicDecisionMade"), metadata: { decision: "increase_committee" } },
      { id: "4", timestamp: new Date(Date.now() - 4000), level: "info", source: "Network", message: t("adminLogs.newValidatorConnected"), metadata: { validator: "0x1234...5678" } },
      { id: "5", timestamp: new Date(Date.now() - 5000), level: "debug", source: "Storage", message: t("adminLogs.blockStored"), metadata: { blockNumber: 18750233 } },
      { id: "6", timestamp: new Date(Date.now() - 6000), level: "info", source: "Mempool", message: t("adminLogs.txPoolSize"), metadata: { size: 1234 } },
      { id: "7", timestamp: new Date(Date.now() - 7000), level: "warn", source: "Security", message: t("adminLogs.suspiciousActivity"), metadata: { ip: "45.33.32.156" } },
      { id: "8", timestamp: new Date(Date.now() - 8000), level: "error", source: "Database", message: t("adminLogs.connectionTimeout"), metadata: { retryCount: 3 } },
      { id: "9", timestamp: new Date(Date.now() - 9000), level: "info", source: "Consensus", message: t("adminLogs.roundCompleted"), metadata: { round: 145872 } },
      { id: "10", timestamp: new Date(Date.now() - 10000), level: "debug", source: "Network", message: t("adminLogs.peerDiscovery"), metadata: { peers: 45 } },
      { id: "11", timestamp: new Date(Date.now() - 11000), level: "info", source: "Bridge", message: t("adminLogs.transactionRelayed"), metadata: { chain: "Ethereum" } },
      { id: "12", timestamp: new Date(Date.now() - 12000), level: "warn", source: "AI", message: t("adminLogs.modelRetrainingRequired"), metadata: { accuracy: 94.5 } },
    ];
  }, [logsData, t]);

  const logStats: LogStats = useMemo(() => ({
    total: logs.length,
    error: logs.filter(l => l.level === "error").length,
    warn: logs.filter(l => l.level === "warn").length,
    info: logs.filter(l => l.level === "info").length,
    debug: logs.filter(l => l.level === "debug").length,
  }), [logs]);

  const filteredLogs = useMemo(() => {
    let result = [...logs];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(l => 
        l.message.toLowerCase().includes(query) ||
        l.source.toLowerCase().includes(query)
      );
    }
    
    if (levelFilter !== "all") {
      result = result.filter(l => l.level === levelFilter);
    }
    
    if (sourceFilter !== "all") {
      result = result.filter(l => l.source.toLowerCase() === sourceFilter.toLowerCase());
    }
    
    return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs, searchQuery, levelFilter, sourceFilter]);

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "error":
        return <Badge className="bg-red-500/10 text-red-500"><XCircle className="h-3 w-3 mr-1" />{t("adminLogs.error")}</Badge>;
      case "warn":
        return <Badge className="bg-yellow-500/10 text-yellow-500"><AlertTriangle className="h-3 w-3 mr-1" />{t("adminLogs.warn")}</Badge>;
      case "info":
        return <Badge className="bg-blue-500/10 text-blue-500"><Info className="h-3 w-3 mr-1" />{t("adminLogs.info")}</Badge>;
      case "debug":
        return <Badge variant="secondary"><Bug className="h-3 w-3 mr-1" />{t("adminLogs.debug")}</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error": return "text-red-500";
      case "warn": return "text-yellow-500";
      case "info": return "text-blue-500";
      case "debug": return "text-muted-foreground";
      default: return "";
    }
  };

  const getLevelBadgeProps = (level: string) => {
    switch (level) {
      case "error":
        return { variant: "destructive" as const, color: "bg-red-500/10 text-red-500" };
      case "warn":
        return { variant: "secondary" as const, color: "bg-yellow-500/10 text-yellow-500" };
      case "info":
        return { variant: "secondary" as const, color: "bg-blue-500/10 text-blue-500" };
      case "debug":
        return { variant: "secondary" as const, color: "" };
      default:
        return { variant: "outline" as const, color: "" };
    }
  };

  const getLogDetailSections = (log: LogEntry): DetailSection[] => {
    const sections: DetailSection[] = [
      {
        title: t("adminLogs.detail.logEntry"),
        fields: [
          {
            label: t("adminLogs.level"),
            value: log.level.toUpperCase(),
            type: "badge" as const,
            badgeVariant: getLevelBadgeProps(log.level).variant,
            badgeColor: getLevelBadgeProps(log.level).color,
          },
          {
            label: t("dashboard.timestamp"),
            value: new Date(log.timestamp).toLocaleString(i18n.language === 'ko' ? 'ko-KR' : 'en-US', { timeZone: 'America/New_York' }),
            type: "text" as const,
          },
          {
            label: t("adminLogs.source"),
            value: log.source,
            type: "text" as const,
          },
          {
            label: t("common.description"),
            value: log.message,
            type: "text" as const,
          },
        ],
      },
    ];

    if (log.metadata && Object.keys(log.metadata).length > 0) {
      sections.push({
        title: t("adminLogs.detail.metadata"),
        fields: Object.entries(log.metadata).map(([key, value]) => ({
          label: key,
          value: typeof value === "object" ? JSON.stringify(value) : String(value),
          type: "code" as const,
          copyable: true,
        })),
      });
    }

    return sections;
  };

  const confirmClear = useCallback(() => {
    toast({
      title: t("adminLogs.clearSuccess"),
      description: t("adminLogs.clearSuccessDesc"),
    });
    setShowClearConfirm(false);
  }, [toast, t]);

  useEffect(() => {
    let ws: WebSocket | null = null;
    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
        
        ws.onopen = () => {
          setWsConnected(true);
          ws?.send(JSON.stringify({ type: "subscribe", channels: ["logs"] }));
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "log_update" || data.type === "new_log") {
              if (!isPaused) {
                refetchLogs();
              }
            }
            setLastUpdate(new Date());
          } catch (e) {
            console.error("WebSocket message parse error:", e);
          }
        };
        
        ws.onclose = () => {
          setWsConnected(false);
          setTimeout(connectWebSocket, 5000);
        };
        
        ws.onerror = () => {
          setWsConnected(false);
        };
      } catch (e) {
        console.error("WebSocket connection error:", e);
      }
    };

    connectWebSocket();
    
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [refetchLogs, isPaused]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetchLogs();
      toast({
        title: t("adminLogs.refreshSuccess"),
        description: t("adminLogs.dataUpdated"),
      });
    } catch (error) {
      toast({
        title: t("adminLogs.refreshError"),
        description: t("adminLogs.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
      setLastUpdate(new Date());
    }
  }, [refetchLogs, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      logStats,
      logs: filteredLogs,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tburn-logs-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: t("adminLogs.exportSuccess"),
      description: t("adminLogs.exportSuccessDesc"),
    });
    setShowExportConfirm(false);
  }, [logStats, filteredLogs, toast, t]);

  const handleViewLog = useCallback((log: LogEntry) => {
    setSelectedLog(log);
    setShowLogDetail(true);
  }, []);

  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleString(i18n.language === 'ko' ? 'ko-KR' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
      timeZone: 'America/New_York',
    });
  };

  if (logsError) {
    return (
      <div className="flex-1 flex items-center justify-center" data-testid="logs-error">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t("adminLogs.error.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("adminLogs.error.description")}</p>
            <Button onClick={() => refetchLogs()} data-testid="button-retry">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminLogs.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex-1 overflow-auto" data-testid="logs-page">
        <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-page-title">
                <FileText className="h-8 w-8" />
                {t("adminLogs.title")}
              </h1>
              <p className="text-muted-foreground" data-testid="text-page-subtitle">
                {t("adminLogs.subtitle")}
              </p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${wsConnected ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                      <div className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                      <span className="text-xs">{wsConnected ? t("adminLogs.connected") : t("adminLogs.reconnecting")}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {wsConnected ? t("adminLogs.wsConnected") : t("adminLogs.wsReconnecting")}
                  </TooltipContent>
                </Tooltip>
                <Clock className="h-4 w-4" />
                <span data-testid="text-last-update">{t("adminLogs.lastUpdate")}: {lastUpdate.toLocaleTimeString(i18n.language === 'ko' ? 'ko-KR' : 'en-US')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant={isPaused ? "default" : "outline"}
                      size="sm" 
                      onClick={() => setIsPaused(!isPaused)}
                      data-testid="button-pause"
                    >
                      {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isPaused ? t("adminLogs.resume") : t("adminLogs.pause")}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      data-testid="button-refresh"
                    >
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("adminLogs.refresh")}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowExportConfirm(true)}
                      data-testid="button-export"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("adminLogs.export")}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowClearConfirm(true)}
                      data-testid="button-clear"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("adminLogs.clearLogs")}</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <LogStatCard
              icon={FileText}
              label={t("adminLogs.totalLogs")}
              value={logStats.total}
              bgColor="bg-primary/10"
              iconColor="text-primary"
              isLoading={loadingLogs}
              testId="stat-total"
            />
            <LogStatCard
              icon={XCircle}
              label={t("adminLogs.errors")}
              value={logStats.error}
              bgColor="bg-red-500/10"
              iconColor="text-red-500"
              isLoading={loadingLogs}
              testId="stat-error"
            />
            <LogStatCard
              icon={AlertTriangle}
              label={t("adminLogs.warnings")}
              value={logStats.warn}
              bgColor="bg-yellow-500/10"
              iconColor="text-yellow-500"
              isLoading={loadingLogs}
              testId="stat-warn"
            />
            <LogStatCard
              icon={Info}
              label={t("adminLogs.info")}
              value={logStats.info}
              bgColor="bg-blue-500/10"
              iconColor="text-blue-500"
              isLoading={loadingLogs}
              testId="stat-info"
            />
            <LogStatCard
              icon={Bug}
              label={t("adminLogs.debug")}
              value={logStats.debug}
              bgColor="bg-muted"
              iconColor="text-muted-foreground"
              isLoading={loadingLogs}
              testId="stat-debug"
            />
          </div>

          <Card data-testid="card-log-filters">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("adminLogs.searchPlaceholder")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search"
                    />
                  </div>
                </div>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-[150px]" data-testid="select-level">
                    <SelectValue placeholder={t("adminLogs.level")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("adminLogs.allLevels")}</SelectItem>
                    <SelectItem value="error">{t("adminLogs.error")}</SelectItem>
                    <SelectItem value="warn">{t("adminLogs.warn")}</SelectItem>
                    <SelectItem value="info">{t("adminLogs.info")}</SelectItem>
                    <SelectItem value="debug">{t("adminLogs.debug")}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="w-[150px]" data-testid="select-source">
                    <SelectValue placeholder={t("adminLogs.source")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("adminLogs.allSources")}</SelectItem>
                    {logSources.slice(1).map((source) => (
                      <SelectItem key={source} value={source.toLowerCase()}>{source}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={autoScroll}
                    onCheckedChange={setAutoScroll}
                    data-testid="switch-auto-scroll"
                  />
                  <span className="text-sm text-muted-foreground">{t("adminLogs.autoScroll")}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="realtime" className="space-y-4">
            <TabsList data-testid="tabs-logs">
              <TabsTrigger value="realtime" data-testid="tab-realtime">
                <div className="flex items-center gap-2">
                  {!isPaused && <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />}
                  {t("adminLogs.realtime")}
                </div>
              </TabsTrigger>
              <TabsTrigger value="errors" data-testid="tab-errors">{t("adminLogs.errorsTab")}</TabsTrigger>
              <TabsTrigger value="security" data-testid="tab-security">{t("adminLogs.securityTab")}</TabsTrigger>
            </TabsList>

            <TabsContent value="realtime">
              <Card data-testid="card-realtime-logs">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Terminal className="h-5 w-5" />
                        {t("adminLogs.liveLogStream")}
                      </CardTitle>
                      <CardDescription>{t("adminLogs.liveLogStreamDesc")}</CardDescription>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                      {isPaused ? <Pause className="h-3 w-3" /> : <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />}
                      {isPaused ? t("adminLogs.paused") : t("adminLogs.autoRefresh")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingLogs ? (
                    <div className="space-y-2">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <Skeleton key={i} className="h-8 w-full" />
                      ))}
                    </div>
                  ) : (
                    <ScrollArea className="h-[500px]">
                      <div className="font-mono text-sm bg-muted/50 rounded-lg p-4 space-y-2">
                        {filteredLogs.map((log, index) => (
                          <div 
                            key={log.id} 
                            className="flex items-start gap-4 py-1 border-b border-muted/50 last:border-0 hover:bg-muted/30 px-2 rounded"
                            data-testid={`log-entry-${index}`}
                          >
                            <span className="text-muted-foreground whitespace-nowrap text-xs" data-testid={`log-time-${index}`}>
                              {formatTimestamp(log.timestamp)}
                            </span>
                            {getLevelBadge(log.level)}
                            <span className="text-blue-500 whitespace-nowrap text-xs" data-testid={`log-source-${index}`}>[{log.source}]</span>
                            <span className={`flex-1 ${getLevelColor(log.level)}`} data-testid={`log-message-${index}`}>{log.message}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={() => handleViewLog(log)}
                              data-testid={`button-view-log-${index}`}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        {filteredLogs.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground" data-testid="no-logs">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>{t("adminLogs.noLogsFound")}</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="errors">
              <Card data-testid="card-error-logs">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    {t("adminLogs.errorLogs")}
                  </CardTitle>
                  <CardDescription>{t("adminLogs.errorLogsDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingLogs ? (
                    <div className="space-y-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-8 w-full" />
                      ))}
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <div className="font-mono text-sm bg-muted/50 rounded-lg p-4 space-y-2">
                        {logs.filter(l => l.level === "error" || l.level === "warn").map((log, index) => (
                          <div 
                            key={log.id} 
                            className="flex items-start gap-4 py-1 border-b border-muted/50 last:border-0"
                            data-testid={`error-log-${index}`}
                          >
                            <span className="text-muted-foreground whitespace-nowrap text-xs">
                              {formatTimestamp(log.timestamp)}
                            </span>
                            {getLevelBadge(log.level)}
                            <span className="text-blue-500 whitespace-nowrap text-xs">[{log.source}]</span>
                            <span className={getLevelColor(log.level)}>{log.message}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card data-testid="card-security-logs">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    {t("adminLogs.securityLogs")}
                  </CardTitle>
                  <CardDescription>{t("adminLogs.securityLogsDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingLogs ? (
                    <div className="space-y-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-8 w-full" />
                      ))}
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <div className="font-mono text-sm bg-muted/50 rounded-lg p-4 space-y-2">
                        {logs.filter(l => l.source === "Security").map((log, index) => (
                          <div 
                            key={log.id} 
                            className="flex items-start gap-4 py-1 border-b border-muted/50 last:border-0"
                            data-testid={`security-log-${index}`}
                          >
                            <span className="text-muted-foreground whitespace-nowrap text-xs">
                              {formatTimestamp(log.timestamp)}
                            </span>
                            {getLevelBadge(log.level)}
                            <span className="text-blue-500 whitespace-nowrap text-xs">[{log.source}]</span>
                            <span>{log.message}</span>
                          </div>
                        ))}
                        {logs.filter(l => l.source === "Security").length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>{t("adminLogs.noSecurityLogs")}</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {selectedLog && (
        <DetailSheet
          open={showLogDetail}
          onOpenChange={setShowLogDetail}
          title={t("adminLogs.detail.logEntry")}
          subtitle={selectedLog.id}
          icon={<FileText className="h-5 w-5" />}
          sections={getLogDetailSections(selectedLog)}
        />
      )}

      <ConfirmationDialog
        open={showClearConfirm}
        onOpenChange={setShowClearConfirm}
        title={t("adminLogs.confirm.clearTitle")}
        description={t("adminLogs.confirm.clearDesc")}
        actionType="delete"
        onConfirm={confirmClear}
        destructive={true}
      />

      <ConfirmationDialog
        open={showExportConfirm}
        onOpenChange={setShowExportConfirm}
        title={t("adminLogs.confirm.exportTitle")}
        description={t("adminLogs.confirm.exportDesc")}
        onConfirm={handleExport}
        destructive={false}
      />
    </TooltipProvider>
  );
}
