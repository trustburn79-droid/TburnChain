import { useState, useCallback, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  LayoutDashboard,
  Plus,
  Save,
  Settings,
  Trash2,
  Copy,
  Edit,
  Eye,
  ChartLine,
  ChartBar,
  ChartPie,
  Gauge,
  Table2,
  AlertTriangle,
  Clock,
  Move,
  Maximize2,
  RefreshCw,
  Download,
  Upload,
  Share2,
  Lock,
  Globe,
  AlertCircle,
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  Server,
  Users,
  Wifi,
  CheckCircle,
  XCircle,
  Timer,
  Cpu,
  HardDrive,
  Network,
  ArrowUp,
  ArrowDown,
  Database,
  Box,
} from "lucide-react";

interface Widget {
  id: string;
  type: "chart" | "gauge" | "table" | "alert" | "metric" | "map" | "area" | "bar" | "pie";
  title: string;
  width: number;
  height: number;
  x: number;
  y: number;
  config: Record<string, unknown>;
  dataSource?: string;
}

interface Dashboard {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  isPublic: boolean;
  widgets: Widget[];
  createdAt: string;
  updatedAt: string;
  owner: string;
}

interface DashboardsData {
  dashboards: Dashboard[];
  totalCount: number;
}

interface NetworkStats {
  tps: number;
  blockHeight: number;
  activeValidators: number;
  networkPeers: number;
  totalTransactions: number;
  avgBlockTime: number;
  shardCount: number;
  gasPrice: string;
}

interface BlockData {
  height: number;
  hash: string;
  transactions: number;
  timestamp: string;
  validator: string;
  size: string;
  gasUsed: number;
}

interface AlertData {
  id: string;
  type: "warning" | "error" | "info" | "success";
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

const CHART_COLORS = ["#3b82f6", "#22c55e", "#f97316", "#8b5cf6", "#ec4899", "#14b8a6"];

export default function DashboardBuilder() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedDashboard, setSelectedDashboard] = useState<string>("mainnet-v8");
  const [isEditing, setIsEditing] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newDashboard, setNewDashboard] = useState({
    name: "",
    description: "",
    isPublic: true,
  });
  const [showDashboardDetail, setShowDashboardDetail] = useState(false);
  const [detailDashboard, setDetailDashboard] = useState<Dashboard | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    tps: 485000,
    blockHeight: 25055842,
    activeValidators: 156,
    networkPeers: 324,
    totalTransactions: 0,
    avgBlockTime: 0.4,
    shardCount: 8,
    gasPrice: "0.001",
  });
  const [tpsHistory, setTpsHistory] = useState<Array<{ time: string; tps: number; target: number }>>([]);
  const [latencyData, setLatencyData] = useState<Array<{ range: string; count: number; percentage: number }>>([]);
  const [recentBlocks, setRecentBlocks] = useState<BlockData[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<AlertData[]>([]);
  const [shardDistribution, setShardDistribution] = useState<Array<{ name: string; value: number; tps: number }>>([]);
  const [validatorPerformance, setValidatorPerformance] = useState<Array<{ tier: string; count: number; uptime: number; blocks: number }>>([]);

  const { data: dashboardsData, isLoading, error, refetch } = useQuery<DashboardsData>({
    queryKey: ["/api/enterprise/admin/dashboards"],
    refetchInterval: 30000,
    staleTime: 30000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;
    let reconnectAttempts = 0;

    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

      ws.onopen = () => {
        setWsConnected(true);
        reconnectAttempts = 0;
        ws?.send(JSON.stringify({ type: 'subscribe', channel: 'network_stats' }));
        ws?.send(JSON.stringify({ type: 'subscribe', channel: 'blocks' }));
        ws?.send(JSON.stringify({ type: 'subscribe', channel: 'dashboard_builder' }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'network_stats_update' && message.data) {
            setNetworkStats(prev => ({
              ...prev,
              ...message.data,
            }));
            setLastUpdate(new Date());
          }
          if (message.type === 'block_update' && message.data) {
            setRecentBlocks(prev => {
              const newBlocks = Array.isArray(message.data) ? message.data : [message.data];
              return [...newBlocks, ...prev].slice(0, 10);
            });
          }
        } catch (e) {
          console.error('WebSocket message parse error:', e);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        reconnectAttempts++;
        reconnectTimeout = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        setWsConnected(false);
      };
    };

    connect();

    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimeout);
    };
  }, []);

  useEffect(() => {
    const now = new Date();
    const initialTpsHistory = Array.from({ length: 24 }, (_, i) => {
      const time = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      const baseTps = 450000 + Math.random() * 70000;
      return {
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York' }),
        tps: Math.round(baseTps),
        target: 500000,
      };
    });
    setTpsHistory(initialTpsHistory);

    const initialLatencyData = [
      { range: "<10ms", count: 45000, percentage: 45 },
      { range: "10-50ms", count: 32000, percentage: 32 },
      { range: "50-100ms", count: 15000, percentage: 15 },
      { range: "100-200ms", count: 5000, percentage: 5 },
      { range: ">200ms", count: 3000, percentage: 3 },
    ];
    setLatencyData(initialLatencyData);

    const initialBlocks: BlockData[] = Array.from({ length: 10 }, (_, i) => ({
      height: networkStats.blockHeight - i,
      hash: `0x${Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}...`,
      transactions: Math.floor(Math.random() * 500) + 100,
      timestamp: new Date(Date.now() - i * 2500).toLocaleTimeString('en-US', { timeZone: 'America/New_York' }),
      validator: `validator-${Math.floor(Math.random() * 156) + 1}`,
      size: `${(Math.random() * 2 + 0.5).toFixed(2)} MB`,
      gasUsed: Math.floor(Math.random() * 30000000) + 10000000,
    }));
    setRecentBlocks(initialBlocks);

    const initialAlerts: AlertData[] = [
      { id: "1", type: "info", title: "Network Status", message: "All 8 shards operating normally at 100K+ TPS", timestamp: "2 min ago", resolved: false },
      { id: "2", type: "success", title: "Validator Sync", message: "All 156 validators synchronized", timestamp: "5 min ago", resolved: false },
      { id: "3", type: "warning", title: "High Load Alert", message: "Shard 3 approaching 95% capacity", timestamp: "8 min ago", resolved: false },
      { id: "4", type: "info", title: "AI Optimization", message: "Triple-band AI optimizing cross-shard routing", timestamp: "12 min ago", resolved: false },
      { id: "5", type: "success", title: "Bridge Active", message: "Multi-chain bridge processing 1,250 TPS", timestamp: "15 min ago", resolved: true },
    ];
    setActiveAlerts(initialAlerts);

    const initialShardDist = Array.from({ length: 8 }, (_, i) => ({
      name: `Shard ${i + 1}`,
      value: Math.floor(Math.random() * 15) + 10,
      tps: Math.floor(Math.random() * 15000) + 55000,
    }));
    setShardDistribution(initialShardDist);

    const initialValidatorPerf = [
      { tier: "Tier 1 (20M+)", count: 25, uptime: 99.98, blocks: 12500 },
      { tier: "Tier 2 (5M+)", count: 56, uptime: 99.85, blocks: 8200 },
      { tier: "Tier 3 (10K+)", count: 75, uptime: 99.72, blocks: 4100 },
    ];
    setValidatorPerformance(initialValidatorPerf);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkStats(prev => ({
        ...prev,
        tps: prev.tps + Math.floor(Math.random() * 2000) - 1000,
        blockHeight: prev.blockHeight + 1,
      }));

      setTpsHistory(prev => {
        const now = new Date();
        const newPoint = {
          time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York' }),
          tps: networkStats.tps + Math.floor(Math.random() * 5000) - 2500,
          target: 500000,
        };
        return [...prev.slice(1), newPoint];
      });

      setRecentBlocks(prev => {
        const newBlock: BlockData = {
          height: (prev[0]?.height || networkStats.blockHeight) + 1,
          hash: `0x${Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}...`,
          transactions: Math.floor(Math.random() * 500) + 100,
          timestamp: new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York' }),
          validator: `validator-${Math.floor(Math.random() * 156) + 1}`,
          size: `${(Math.random() * 2 + 0.5).toFixed(2)} MB`,
          gasUsed: Math.floor(Math.random() * 30000000) + 10000000,
        };
        return [newBlock, ...prev.slice(0, 9)];
      });

      setLastUpdate(new Date());
    }, 2500);

    return () => clearInterval(interval);
  }, [networkStats.tps, networkStats.blockHeight]);

  const createDashboardMutation = useMutation({
    mutationFn: async (dashboard: typeof newDashboard) => {
      return apiRequest("POST", "/api/enterprise/admin/dashboards", dashboard);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enterprise/admin/dashboards"] });
      setIsCreateDialogOpen(false);
      setNewDashboard({ name: "", description: "", isPublic: true });
      toast({
        title: t("adminDashboardBuilder.dashboardCreated"),
        description: t("adminDashboardBuilder.dashboardCreatedDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminDashboardBuilder.error"),
        description: t("adminDashboardBuilder.createError"),
        variant: "destructive",
      });
    },
  });

  const updateDashboardMutation = useMutation({
    mutationFn: async ({ id, widgets }: { id: string; widgets: Widget[] }) => {
      return apiRequest("PATCH", `/api/enterprise/admin/dashboards/${id}`, { widgets });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enterprise/admin/dashboards"] });
      setIsEditing(false);
      toast({
        title: t("adminDashboardBuilder.dashboardSaved"),
        description: t("adminDashboardBuilder.dashboardSavedDesc"),
      });
    },
  });

  const deleteDashboardMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/enterprise/admin/dashboards/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enterprise/admin/dashboards"] });
      toast({
        title: t("adminDashboardBuilder.dashboardDeleted"),
        description: t("adminDashboardBuilder.dashboardDeletedDesc"),
      });
    },
  });

  const handleRefresh = useCallback(() => {
    refetch();
    setLastUpdate(new Date());
    toast({
      title: t("adminDashboardBuilder.refreshed"),
      description: t("adminDashboardBuilder.refreshedDesc"),
    });
  }, [refetch, toast, t]);

  const dashboards: Dashboard[] = dashboardsData?.dashboards || [
    {
      id: "mainnet-v8",
      name: "TBURN Mainnet v8.0 Command Center",
      description: "Primary monitoring dashboard for December 8th mainnet launch - 100K+ TPS, 8 shards, 156 validators",
      isDefault: true,
      isPublic: true,
      widgets: [],
      createdAt: "2024-12-08",
      updatedAt: "2024-12-08",
      owner: "admin",
    },
    {
      id: "performance-100k",
      name: "100K TPS Performance Monitor",
      description: "Real-time TPS tracking, shard distribution, cross-shard latency, and AI optimization metrics",
      isDefault: false,
      isPublic: true,
      widgets: [],
      createdAt: "2024-12-08",
      updatedAt: "2024-12-08",
      owner: "admin",
    },
    {
      id: "validator-consensus",
      name: "156 Validator BFT Consensus",
      description: "3-tier validator monitoring: Tier 1 (20M), Tier 2 (5M), Tier 3 (10K) with BFT consensus visualization",
      isDefault: false,
      isPublic: true,
      widgets: [],
      createdAt: "2024-12-08",
      updatedAt: "2024-12-08",
      owner: "validator-ops",
    },
    {
      id: "ai-orchestration",
      name: "Triple-Band AI Orchestration",
      description: "Gemini 3 Pro, Claude Sonnet 4.5, GPT-4o with Grok 3 fallback - Real-time AI decision monitoring",
      isDefault: false,
      isPublic: false,
      widgets: [],
      createdAt: "2024-12-08",
      updatedAt: "2024-12-08",
      owner: "ai-team",
    },
  ];

  const performExport = useCallback(() => {
    setShowExportConfirm(false);
    const currentDash = dashboards.find(d => d.id === selectedDashboard);
    if (currentDash) {
      const exportData = {
        ...currentDash,
        networkStats,
        tpsHistory,
        recentBlocks,
        activeAlerts,
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dashboard-${currentDash.name.toLowerCase().replace(/\s+/g, "-")}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: t("adminDashboardBuilder.exported"),
        description: t("adminDashboardBuilder.exportedDesc"),
      });
    }
  }, [selectedDashboard, dashboards, networkStats, tpsHistory, recentBlocks, activeAlerts, toast, t]);

  const confirmDelete = useCallback(() => {
    if (pendingDeleteId) {
      deleteDashboardMutation.mutate(pendingDeleteId);
      setShowDeleteConfirm(false);
      setPendingDeleteId(null);
    }
  }, [pendingDeleteId, deleteDashboardMutation]);

  const getDashboardDetailSections = (dashboard: Dashboard): DetailSection[] => [
    {
      title: t("adminDashboardBuilder.detail.dashboardInfo"),
      fields: [
        { label: t("common.name"), value: dashboard.name },
        { label: t("common.description"), value: dashboard.description },
        { label: t("adminDashboardBuilder.owner"), value: dashboard.owner },
        { 
          label: t("adminDashboardBuilder.public"), 
          value: dashboard.isPublic ? t("common.yes") : t("common.no"), 
          type: "badge" as const,
          badgeVariant: dashboard.isPublic ? "default" : "secondary"
        },
      ],
    },
    {
      title: t("adminDashboardBuilder.detail.metadata"),
      fields: [
        { label: t("common.date"), value: dashboard.createdAt, type: "date" as const },
        { label: t("adminDashboardBuilder.updated"), value: dashboard.updatedAt, type: "date" as const },
        { label: t("adminDashboardBuilder.metrics.widgets"), value: dashboard.widgets.length },
      ],
    },
  ];

  const widgetTypes = [
    { type: "chart", icon: ChartLine, label: t("adminDashboardBuilder.widgets.lineChart"), description: t("adminDashboardBuilder.widgets.lineChartDesc") },
    { type: "bar", icon: ChartBar, label: t("adminDashboardBuilder.widgets.barChart"), description: t("adminDashboardBuilder.widgets.barChartDesc") },
    { type: "pie", icon: ChartPie, label: t("adminDashboardBuilder.widgets.pieChart"), description: t("adminDashboardBuilder.widgets.pieChartDesc") },
    { type: "gauge", icon: Gauge, label: t("adminDashboardBuilder.widgets.gauge"), description: t("adminDashboardBuilder.widgets.gaugeDesc") },
    { type: "table", icon: Table2, label: t("adminDashboardBuilder.widgets.dataTable"), description: t("adminDashboardBuilder.widgets.dataTableDesc") },
    { type: "alert", icon: AlertTriangle, label: t("adminDashboardBuilder.widgets.alertList"), description: t("adminDashboardBuilder.widgets.alertListDesc") },
  ];

  const currentDashboard = dashboards.find(d => d.id === selectedDashboard);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const getAlertIcon = (type: AlertData["type"]) => {
    switch (type) {
      case "error": return <XCircle className="h-4 w-4 text-destructive" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "success": return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <AlertCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  if (error) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="container max-w-[1800px] mx-auto p-6">
          <Card className="border-destructive">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <div className="flex-1">
                  <h3 className="font-semibold">{t("adminDashboardBuilder.errorTitle")}</h3>
                  <p className="text-sm text-muted-foreground">{t("adminDashboardBuilder.errorDescription")}</p>
                </div>
                <Button onClick={() => refetch()} data-testid="button-retry-dashboards">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t("adminDashboardBuilder.retry")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-36" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-testid="dashboard-builder-page">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-dashboard-builder-title">
              <LayoutDashboard className="h-8 w-8" />
              {t("adminDashboardBuilder.title")}
            </h1>
            <p className="text-muted-foreground flex items-center gap-2" data-testid="text-dashboard-builder-description">
              {t("adminDashboardBuilder.description")}
              <span className="flex items-center gap-1 text-xs">
                {wsConnected ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-green-600">{t("common.realtime")}</span>
                  </>
                ) : (
                  <>
                    <span className="h-2 w-2 rounded-full bg-yellow-500" />
                    <span className="text-yellow-600">{t("common.reconnecting")}</span>
                  </>
                )}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)} data-testid="button-cancel-edit">
                  {t("adminDashboardBuilder.cancel")}
                </Button>
                <Button 
                  onClick={() => updateDashboardMutation.mutate({ id: selectedDashboard, widgets: [] })}
                  disabled={updateDashboardMutation.isPending}
                  data-testid="button-save-dashboard"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {t("adminDashboardBuilder.save")}
                </Button>
              </>
            ) : (
              <>
                <Select value={selectedDashboard} onValueChange={setSelectedDashboard}>
                  <SelectTrigger className="w-48" data-testid="select-dashboard">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dashboards.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        <div className="flex items-center gap-2">
                          {d.name}
                          {d.isDefault && <Badge variant="secondary" className="text-xs">{t("adminDashboardBuilder.default")}</Badge>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={handleRefresh} data-testid="button-refresh-dashboards">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t("adminDashboardBuilder.refresh")}
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(true)} data-testid="button-edit-dashboard">
                  <Edit className="h-4 w-4 mr-2" />
                  {t("adminDashboardBuilder.edit")}
                </Button>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-new-dashboard">
                      <Plus className="h-4 w-4 mr-2" />
                      {t("adminDashboardBuilder.newDashboard")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("adminDashboardBuilder.dialog.createTitle")}</DialogTitle>
                      <DialogDescription>{t("adminDashboardBuilder.dialog.createDescription")}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="dashboard-name">{t("adminDashboardBuilder.dialog.name")}</Label>
                        <Input 
                          id="dashboard-name" 
                          placeholder={t("adminDashboardBuilder.dialog.namePlaceholder")}
                          value={newDashboard.name}
                          onChange={(e) => setNewDashboard({ ...newDashboard, name: e.target.value })}
                          data-testid="input-dashboard-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dashboard-description">{t("adminDashboardBuilder.dialog.description")}</Label>
                        <Input 
                          id="dashboard-description" 
                          placeholder={t("adminDashboardBuilder.dialog.descriptionPlaceholder")}
                          value={newDashboard.description}
                          onChange={(e) => setNewDashboard({ ...newDashboard, description: e.target.value })}
                          data-testid="input-dashboard-description"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <Label>{t("adminDashboardBuilder.dialog.public")}</Label>
                        </div>
                        <Button 
                          variant={newDashboard.isPublic ? "default" : "outline"}
                          size="sm"
                          onClick={() => setNewDashboard({ ...newDashboard, isPublic: !newDashboard.isPublic })}
                          data-testid="button-toggle-public"
                        >
                          {newDashboard.isPublic ? t("common.yes") : t("common.no")}
                        </Button>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} data-testid="button-cancel-create">
                        {t("adminDashboardBuilder.dialog.cancel")}
                      </Button>
                      <Button 
                        onClick={() => createDashboardMutation.mutate(newDashboard)}
                        disabled={createDashboardMutation.isPending}
                        data-testid="button-confirm-create"
                      >
                        {t("adminDashboardBuilder.dialog.create")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>

        <Card data-testid="card-dashboard-preview">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {t("adminDashboardBuilder.preview.title")}
                  <Badge variant="outline" className="gap-1">
                    <Activity className="h-3 w-3" />
                    {t("common.live")}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {currentDashboard?.name} - {t("adminDashboardBuilder.updated")} {lastUpdate.toLocaleTimeString('en-US', { timeZone: 'America/New_York' })}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handleRefresh} data-testid="button-refresh-preview">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" data-testid="button-fullscreen">
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20" data-testid="metric-tps">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{t("adminDashboardBuilder.preview.currentTps")}</p>
                      <p className="text-3xl font-bold text-blue-600">{formatNumber(networkStats.tps)}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Zap className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                    <TrendingUp className="h-3 w-3" />
                    <span>+2.5% {t("common.fromLastHour")}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20" data-testid="metric-block-height">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{t("adminDashboardBuilder.preview.blockHeight")}</p>
                      <p className="text-3xl font-bold text-green-600">{formatNumber(networkStats.blockHeight)}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Box className="h-6 w-6 text-green-500" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Timer className="h-3 w-3" />
                    <span>{networkStats.avgBlockTime}s {t("common.avgBlockTime")}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20" data-testid="metric-validators">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{t("adminDashboardBuilder.preview.activeValidators")}</p>
                      <p className="text-3xl font-bold text-purple-600">{networkStats.activeValidators}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Users className="h-6 w-6 text-purple-500" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    <span>99.9% {t("common.uptime")}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20" data-testid="metric-peers">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{t("adminDashboardBuilder.preview.networkPeers")}</p>
                      <p className="text-3xl font-bold text-orange-600">{networkStats.networkPeers}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <Network className="h-6 w-6 text-orange-500" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Globe className="h-3 w-3" />
                    <span>{networkStats.shardCount} {t("common.shards")}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card data-testid="chart-tps-history">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ChartLine className="h-5 w-5 text-blue-500" />
                    {t("adminDashboardBuilder.preview.tpsOverTime")}
                  </CardTitle>
                  <CardDescription>{t("adminDashboardBuilder.preview.tpsOverTimeDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={tpsHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="tpsGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="time" className="text-xs" tick={{ fill: 'currentColor' }} />
                        <YAxis className="text-xs" tick={{ fill: 'currentColor' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                          labelStyle={{ color: 'hsl(var(--foreground))' }}
                          formatter={(value: number) => [formatNumber(value), 'TPS']}
                        />
                        <Area type="monotone" dataKey="tps" stroke="#3b82f6" strokeWidth={2} fill="url(#tpsGradient)" />
                        <Line type="monotone" dataKey="target" stroke="#22c55e" strokeDasharray="5 5" strokeWidth={1} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="chart-latency-distribution">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ChartBar className="h-5 w-5 text-green-500" />
                    {t("adminDashboardBuilder.preview.latencyDist")}
                  </CardTitle>
                  <CardDescription>{t("adminDashboardBuilder.preview.latencyDistDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={latencyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="range" className="text-xs" tick={{ fill: 'currentColor' }} />
                        <YAxis className="text-xs" tick={{ fill: 'currentColor' }} tickFormatter={(v) => `${v}%`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                          formatter={(value: number, name: string) => {
                            if (name === 'percentage') return [`${value}%`, t('common.percentage')];
                            return [formatNumber(value), t('common.count')];
                          }}
                        />
                        <Bar dataKey="percentage" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card data-testid="table-recent-blocks">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Database className="h-5 w-5 text-purple-500" />
                    {t("adminDashboardBuilder.preview.recentBlocks")}
                  </CardTitle>
                  <CardDescription>{t("adminDashboardBuilder.preview.recentBlocksDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {recentBlocks.map((block, index) => (
                        <div 
                          key={`${block.height}-${index}`}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover-elevate"
                          data-testid={`block-row-${index}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                              <Box className="h-5 w-5 text-purple-500" />
                            </div>
                            <div>
                              <p className="font-medium">#{formatNumber(block.height)}</p>
                              <p className="text-xs text-muted-foreground font-mono">{block.hash}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{block.transactions} txs</p>
                            <p className="text-xs text-muted-foreground">{block.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card data-testid="alerts-active">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    {t("adminDashboardBuilder.preview.activeAlerts")}
                  </CardTitle>
                  <CardDescription>{t("adminDashboardBuilder.preview.activeAlertsDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {activeAlerts.map((alert, index) => (
                        <div 
                          key={alert.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border ${
                            alert.resolved ? 'bg-muted/30 border-muted' : 'bg-muted/50 border-muted'
                          }`}
                          data-testid={`alert-row-${index}`}
                        >
                          <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{alert.title}</p>
                              {alert.resolved && (
                                <Badge variant="secondary" className="text-xs">{t("common.resolved")}</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {alert.timestamp}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card data-testid="chart-shard-distribution">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ChartPie className="h-5 w-5 text-blue-500" />
                    {t("adminDashboardBuilder.preview.shardDistribution")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={shardDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {shardDistribution.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                          formatter={(value: number, name: string) => [`${value}%`, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {shardDistribution.slice(0, 8).map((shard, index) => (
                      <div key={shard.name} className="flex items-center gap-1 text-xs">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                        <span className="truncate">{shard.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2" data-testid="chart-validator-performance">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-500" />
                    {t("adminDashboardBuilder.preview.validatorPerformance")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {validatorPerformance.map((tier, index) => (
                      <div key={tier.tier} className="space-y-2" data-testid={`validator-tier-${index}`}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{tier.tier}</span>
                          <div className="flex items-center gap-4 text-muted-foreground">
                            <span>{tier.count} {t("common.validators")}</span>
                            <span className="text-green-600">{tier.uptime}% {t("common.uptime")}</span>
                            <span>{formatNumber(tier.blocks)} {t("common.blocks")}</span>
                          </div>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${tier.uptime}%`,
                              backgroundColor: CHART_COLORS[index % CHART_COLORS.length]
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {isEditing && (
          <Card data-testid="card-widget-library">
            <CardHeader>
              <CardTitle className="text-lg">{t("adminDashboardBuilder.widgetLibrary.title")}</CardTitle>
              <CardDescription>{t("adminDashboardBuilder.widgetLibrary.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {widgetTypes.map((widget, index) => (
                  <div
                    key={widget.type}
                    className="p-4 border rounded-lg cursor-move hover-elevate text-center"
                    draggable
                    data-testid={`widget-type-${index}`}
                  >
                    <div className="h-12 w-12 mx-auto rounded-lg bg-muted flex items-center justify-center mb-2">
                      <widget.icon className="h-6 w-6" />
                    </div>
                    <p className="font-medium text-sm">{widget.label}</p>
                    <p className="text-xs text-muted-foreground">{widget.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card data-testid="card-all-dashboards">
          <CardHeader>
            <CardTitle>{t("adminDashboardBuilder.allDashboards.title")}</CardTitle>
            <CardDescription>{t("adminDashboardBuilder.allDashboards.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {dashboards.map((dashboard, index) => (
                <div
                  key={dashboard.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedDashboard === dashboard.id ? "border-primary bg-primary/5" : "hover-elevate"
                  }`}
                  onClick={() => setSelectedDashboard(dashboard.id)}
                  data-testid={`dashboard-card-${index}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <LayoutDashboard className="h-5 w-5" />
                      <span className="font-medium text-sm">{dashboard.name}</span>
                    </div>
                    <div className="flex gap-1">
                      {dashboard.isDefault && (
                        <Badge variant="secondary" className="text-xs">{t("adminDashboardBuilder.default")}</Badge>
                      )}
                      {dashboard.isPublic ? (
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{dashboard.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t("adminDashboardBuilder.owner")}: {dashboard.owner}</span>
                    <span>{new Date(dashboard.updatedAt).toLocaleDateString('en-US', { timeZone: 'America/New_York' })}</span>
                  </div>
                  <div className="flex gap-1 mt-3">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex-1" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetailDashboard(dashboard);
                        setShowDashboardDetail(true);
                      }}
                      data-testid={`button-view-dashboard-${index}`}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      {t("adminDashboardBuilder.view")}
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1" data-testid={`button-clone-dashboard-${index}`}>
                      <Copy className="h-3 w-3 mr-1" />
                      {t("adminDashboardBuilder.clone")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card data-testid="card-import-dashboard">
            <CardHeader>
              <CardTitle>{t("adminDashboardBuilder.import.title")}</CardTitle>
              <CardDescription>{t("adminDashboardBuilder.import.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  {t("adminDashboardBuilder.import.dropzone")}
                </p>
                <Button variant="outline" data-testid="button-import-dashboard">
                  <Upload className="h-4 w-4 mr-2" />
                  {t("adminDashboardBuilder.import.browse")}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-export-dashboard">
            <CardHeader>
              <CardTitle>{t("adminDashboardBuilder.export.title")}</CardTitle>
              <CardDescription>{t("adminDashboardBuilder.export.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t("adminDashboardBuilder.export.info")}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowExportConfirm(true)} data-testid="button-export-json">
                  <Download className="h-4 w-4 mr-2" />
                  {t("adminDashboardBuilder.export.json")}
                </Button>
                <Button variant="outline" className="flex-1" data-testid="button-export-png">
                  <Download className="h-4 w-4 mr-2" />
                  {t("adminDashboardBuilder.export.png")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {detailDashboard && (
        <DetailSheet
          open={showDashboardDetail}
          onOpenChange={setShowDashboardDetail}
          title={detailDashboard.name}
          description={detailDashboard.description}
          sections={getDashboardDetailSections(detailDashboard)}
        />
      )}

      <ConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={t("adminDashboardBuilder.confirm.deleteTitle")}
        description={t("adminDashboardBuilder.confirm.deleteDesc")}
        confirmText={t("adminDashboardBuilder.delete")}
        cancelText={t("adminDashboardBuilder.cancel")}
        onConfirm={confirmDelete}
        destructive={true}
      />

      <ConfirmationDialog
        open={showExportConfirm}
        onOpenChange={setShowExportConfirm}
        title={t("adminDashboardBuilder.confirm.exportTitle")}
        description={t("adminDashboardBuilder.confirm.exportDesc")}
        confirmText={t("adminDashboardBuilder.export")}
        cancelText={t("adminDashboardBuilder.cancel")}
        onConfirm={performExport}
        destructive={false}
      />
    </div>
  );
}
