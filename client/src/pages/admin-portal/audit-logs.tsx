import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import {
  FileText,
  Search,
  Download,
  Clock,
  User,
  Activity,
  Settings,
  Shield,
  Database,
  Eye,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";

interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  category: string;
  target: string;
  targetType: string;
  status: "success" | "failure" | "pending";
  ipAddress: string;
  userAgent: string;
  details: Record<string, unknown>;
}

interface AuditData {
  logs: AuditLog[];
}

export default function AdminAuditLogs() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showLogDetail, setShowLogDetail] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const { data, isLoading, error, refetch } = useQuery<AuditData>({
    queryKey: ["/api/admin/audit/logs"],
    refetchInterval: 30000,
    retry: 3,
  });

  const logs: AuditLog[] = data?.logs ?? [
    { id: "1", timestamp: new Date(Date.now() - 30000).toISOString(), actor: "admin@tburn.io", actorRole: "Super Admin", action: "BRIDGE_CONFIG_UPDATE", category: "configuration", target: "ethereum_bridge", targetType: "bridge", status: "success", ipAddress: "10.0.1.5", userAgent: "Chrome/120.0", details: { field: "maxTransferLimit", oldValue: "$500K", newValue: "$1M" } },
    { id: "2", timestamp: new Date(Date.now() - 120000).toISOString(), actor: "ops-lead@tburn.io", actorRole: "Operator Lead", action: "VALIDATOR_RESTART", category: "operations", target: "validator_pool_3", targetType: "validator", status: "success", ipAddress: "10.0.2.15", userAgent: "Firefox/121.0", details: { reason: "Performance optimization", validators: 12 } },
    { id: "3", timestamp: new Date(Date.now() - 300000).toISOString(), actor: "security-chief@tburn.io", actorRole: "Security Chief", action: "THREAT_MITIGATION", category: "security", target: "Rate Limit Policy", targetType: "policy", status: "success", ipAddress: "10.0.3.25", userAgent: "Safari/17.0", details: { blockedIPs: 15, duration: "Auto" } },
    { id: "4", timestamp: new Date(Date.now() - 600000).toISOString(), actor: "bridge-ops@tburn.io", actorRole: "Bridge Operator", action: "LIQUIDITY_REBALANCE", category: "operations", target: "polygon_pool", targetType: "liquidity", status: "success", ipAddress: "10.0.4.35", userAgent: "Chrome/120.0", details: { amount: "$2.5M", from: "Ethereum", to: "Polygon" } },
    { id: "5", timestamp: new Date(Date.now() - 900000).toISOString(), actor: "ai-system", actorRole: "AI Orchestrator", action: "BURN_RATE_ADJUSTMENT", category: "system", target: "burn_engine", targetType: "ai_decision", status: "success", ipAddress: "localhost", userAgent: "AI-System/v4.0", details: { oldRate: "68%", newRate: "70%", confidence: 99.2 } },
    { id: "6", timestamp: new Date(Date.now() - 1200000).toISOString(), actor: "treasury-ops@tburn.io", actorRole: "Treasury Operator", action: "TREASURY_ALLOCATION", category: "operations", target: "development_fund", targetType: "treasury", status: "success", ipAddress: "10.0.6.55", userAgent: "Edge/120.0", details: { amount: "$15M", purpose: "Q1 Development" } },
    { id: "7", timestamp: new Date(Date.now() - 1800000).toISOString(), actor: "validator-admin@tburn.io", actorRole: "Validator Admin", action: "SHARD_EXPANSION", category: "operations", target: "shard_cluster_2", targetType: "shard", status: "success", ipAddress: "10.0.5.45", userAgent: "Chrome/120.0", details: { oldCount: 14, newCount: 16, validators: 512 } },
    { id: "8", timestamp: new Date(Date.now() - 3600000).toISOString(), actor: "system", actorRole: "System", action: "AUTO_BACKUP", category: "system", target: "full_system_backup", targetType: "backup", status: "success", ipAddress: "localhost", userAgent: "System", details: { size: "847GB", duration: "12m 35s", encryption: "AES-256" } },
    { id: "9", timestamp: new Date(Date.now() - 5400000).toISOString(), actor: "compliance@tburn.io", actorRole: "Compliance Officer", action: "AUDIT_REPORT_GENERATED", category: "system", target: "monthly_compliance", targetType: "report", status: "success", ipAddress: "10.0.7.65", userAgent: "Chrome/120.0", details: { period: "November 2024", frameworks: ["SOC2", "ISO27001"] } },
    { id: "10", timestamp: new Date(Date.now() - 7200000).toISOString(), actor: "ai-system", actorRole: "AI Orchestrator", action: "CONSENSUS_OPTIMIZATION", category: "system", target: "consensus_params", targetType: "ai_decision", status: "success", ipAddress: "localhost", userAgent: "AI-System/v4.0", details: { blockTime: "1.2s→1.0s", throughput: "+15%", confidence: 98.7 } },
  ];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchQuery === "" ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || log.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    let ws: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          setWsConnected(true);
          ws?.send(JSON.stringify({ type: "subscribe", channel: "audit" }));
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === "audit_update" || message.type === "log_update") {
              queryClient.invalidateQueries({ queryKey: ["/api/admin/audit/logs"] });
              setLastUpdate(new Date());
            }
          } catch {
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
          reconnectTimeout = setTimeout(connect, 5000);
        };

        ws.onerror = () => {
          setWsConnected(false);
        };
      } catch {
        setWsConnected(false);
        reconnectTimeout = setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      if (ws) {
        ws.close();
      }
      clearTimeout(reconnectTimeout);
    };
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      setLastUpdate(new Date());
      toast({
        title: t("adminAudit.refreshSuccess"),
        description: t("adminAudit.dataUpdated"),
      });
    } catch {
      toast({
        title: t("adminAudit.refreshError"),
        description: t("adminAudit.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = {
      exportDate: new Date().toISOString(),
      logs: filteredLogs,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: t("adminAudit.exportSuccess"),
      description: t("adminAudit.exportSuccessDesc"),
    });
    setShowExportConfirm(false);
  }, [filteredLogs, toast, t]);

  const categories = [
    { value: "all", label: t("adminAudit.filters.allCategories") },
    { value: "configuration", label: t("adminAudit.filters.configuration") },
    { value: "operations", label: t("adminAudit.filters.operations") },
    { value: "security", label: t("adminAudit.filters.security") },
    { value: "user_management", label: t("adminAudit.filters.userManagement") },
    { value: "development", label: t("adminAudit.filters.development") },
    { value: "system", label: t("adminAudit.filters.system") },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success": return <Badge className="bg-green-500/10 text-green-500" data-testid={`badge-status-${status}`}>{t("adminAudit.status.success")}</Badge>;
      case "failure": return <Badge className="bg-red-500/10 text-red-500" data-testid={`badge-status-${status}`}>{t("adminAudit.status.failure")}</Badge>;
      case "pending": return <Badge className="bg-yellow-500/10 text-yellow-500" data-testid={`badge-status-${status}`}>{t("adminAudit.status.pending")}</Badge>;
      default: return <Badge variant="secondary" data-testid={`badge-status-${status}`}>{status}</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "bg-green-500/10 text-green-500";
      case "failure": return "bg-red-500/10 text-red-500";
      case "pending": return "bg-yellow-500/10 text-yellow-500";
      default: return "";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "configuration": return <Settings className="h-4 w-4" />;
      case "operations": return <Activity className="h-4 w-4" />;
      case "security": return <Shield className="h-4 w-4" />;
      case "user_management": return <User className="h-4 w-4" />;
      case "development": return <Database className="h-4 w-4" />;
      case "system": return <Database className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', { timeZone: 'America/New_York' });
  };

  const getLogDetailSections = (log: AuditLog): DetailSection[] => {
    return [
      {
        title: t("adminAudit.detail.logInfo"),
        fields: [
          { label: t("common.id"), value: log.id, copyable: true },
          { label: t("adminAudit.logDetails.action"), value: log.action },
          { label: t("adminAudit.filters.allCategories").replace("All ", ""), value: log.category },
          { label: t("adminAudit.logDetails.status"), value: t(`adminAudit.status.${log.status}`), type: "badge", badgeColor: getStatusColor(log.status) },
        ],
      },
      {
        title: t("adminAudit.detail.actorDetails"),
        fields: [
          { label: t("adminAudit.logDetails.actor"), value: log.actor },
          { label: t("adminAudit.logDetails.role"), value: log.actorRole },
          { label: t("adminAudit.logDetails.ipAddress"), value: log.ipAddress, copyable: true },
          { label: t("adminAudit.logDetails.userAgent"), value: log.userAgent },
        ],
      },
      {
        title: t("adminAudit.detail.target"),
        fields: [
          { label: t("adminAudit.logDetails.target"), value: log.target },
          { label: t("adminAudit.logDetails.targetType"), value: log.targetType },
          { label: t("adminAudit.logDetails.timestamp"), value: log.timestamp, type: "date" },
        ],
      },
    ];
  };

  const handleViewLog = (log: AuditLog) => {
    setSelectedLog(log);
    setShowLogDetail(true);
  };

  if (error) {
    return (
      <div className="flex-1 overflow-auto" data-testid="audit-logs-error">
        <div className="container max-w-[1800px] mx-auto p-6">
          <Card data-testid="card-error">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <FileText className="h-12 w-12 mx-auto text-destructive" />
                <h2 className="text-xl font-semibold">{t("adminAudit.error.title")}</h2>
                <p className="text-muted-foreground">{t("adminAudit.error.description")}</p>
                <Button onClick={() => refetch()} data-testid="button-retry">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t("adminAudit.retry")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-testid="audit-logs-page">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-page-title">
              <FileText className="h-8 w-8" />
              {t("adminAudit.title")}
            </h1>
            <p className="text-muted-foreground" data-testid="text-page-subtitle">{t("adminAudit.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-sm text-muted-foreground" data-testid="status-ws-connection">
              {wsConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span>{t("adminAudit.connected")}</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-yellow-500" />
                  <span>{t("adminAudit.reconnecting")}</span>
                </>
              )}
            </div>
            {lastUpdate && (
              <span className="text-xs text-muted-foreground" data-testid="text-last-update">
                {t("adminAudit.lastUpdate")}: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              data-testid="button-refresh"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              {t("adminAudit.refresh")}
            </Button>
            <Button variant="outline" onClick={() => setShowExportConfirm(true)} data-testid="button-export-logs">
              <Download className="h-4 w-4 mr-2" />
              {t("adminAudit.exportLogs")}
            </Button>
          </div>
        </div>

        <Card data-testid="card-activity-log">
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <CardTitle>{t("adminAudit.activityLog")}</CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("adminAudit.searchLogs")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[250px]"
                    data-testid="input-log-search"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter} data-testid="select-category">
                  <SelectTrigger className="w-[180px]" data-testid="select-category-trigger">
                    <SelectValue placeholder={t("adminAudit.filters.allCategories")} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value} data-testid={`select-category-${cat.value}`}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter} data-testid="select-status">
                  <SelectTrigger className="w-[130px]" data-testid="select-status-trigger">
                    <SelectValue placeholder={t("adminAudit.filters.allStatus")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" data-testid="select-status-all">{t("adminAudit.filters.allStatus")}</SelectItem>
                    <SelectItem value="success" data-testid="select-status-success">{t("adminAudit.filters.success")}</SelectItem>
                    <SelectItem value="failure" data-testid="select-status-failure">{t("adminAudit.filters.failure")}</SelectItem>
                    <SelectItem value="pending" data-testid="select-status-pending">{t("adminAudit.filters.pending")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array(6).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" data-testid={`skeleton-log-${i}`} />
                ))}
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 rounded-lg border hover-elevate cursor-pointer"
                      onClick={() => handleViewLog(log)}
                      data-testid={`log-entry-${log.id}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-muted" data-testid={`icon-category-${log.id}`}>
                            {getCategoryIcon(log.category)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium" data-testid={`text-action-${log.id}`}>{log.action}</span>
                              {getStatusBadge(log.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium" data-testid={`text-actor-${log.id}`}>{log.actor}</span>
                              {" - "}
                              <span data-testid={`text-role-${log.id}`}>{log.actorRole}</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1" data-testid={`text-target-${log.id}`}>
                              {t("adminAudit.logDetails.target")}: {log.target} ({log.targetType})
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground" data-testid={`text-timestamp-${log.id}`}>
                            <Clock className="h-3 w-3" />
                            {formatTimestamp(log.timestamp)}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1" data-testid={`text-ip-${log.id}`}>{log.ipAddress}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {selectedLog && (
          <DetailSheet
            open={showLogDetail}
            onOpenChange={setShowLogDetail}
            title={t("adminAudit.logDetails.title")}
            subtitle={selectedLog.id}
            icon={<FileText className="h-5 w-5" />}
            sections={getLogDetailSections(selectedLog)}
          />
        )}

        <ConfirmationDialog
          open={showExportConfirm}
          onOpenChange={setShowExportConfirm}
          title={t("adminAudit.confirm.exportTitle")}
          description={t("adminAudit.confirm.exportDesc")}
          onConfirm={handleExport}
          confirmText={t("common.export")}
          cancelText={t("adminAudit.cancel")}
          destructive={false}
        />
      </div>
    </div>
  );
}
