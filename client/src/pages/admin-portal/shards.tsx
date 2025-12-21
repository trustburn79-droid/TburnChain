import { useQuery, useMutation } from "@tanstack/react-query";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DetailSheet, DetailSection } from "@/components/admin/detail-sheet";
import {
  Grid3x3,
  Activity,
  Zap,
  Users,
  ArrowRightLeft,
  Brain,
  RefreshCw,
  TrendingUp,
  Download,
  AlertCircle,
  Clock,
  Search,
  Eye,
  Settings,
  PlayCircle,
  PauseCircle,
  Cpu,
  HardDrive,
  Server,
  Gauge,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

interface Shard {
  id: number;
  name: string;
  validators: number;
  tps: number;
  load: number;
  pendingTx: number;
  crossShardTx: number;
  status: "healthy" | "warning" | "critical";
  rebalanceScore: number;
}

interface ShardingStats {
  totalShards: number;
  totalTps: number;
  avgLoad: number;
  totalValidators: number;
  healthyShards: number;
  pendingRebalance: number;
}

interface LoadHistory {
  time: string;
  shard0: number;
  shard1: number;
  shard2: number;
  shard3: number;
}

interface ShardingResponse {
  shards: Shard[];
  stats: ShardingStats;
  loadHistory: LoadHistory[];
}

interface ShardConfig {
  currentShardCount: number;
  minShards: number;
  maxShards: number;
  validatorsPerShard: number;
  tpsPerShard: number;
  crossShardLatencyMs: number;
  scalingMode: 'automatic' | 'manual';
  lastConfigUpdate: string;
  totalValidators: number;
  estimatedTps: number;
  hardwareRequirements: {
    minCores: number;
    minRamGB: number;
    recommendedCores: number;
    recommendedRamGB: number;
    storageGB: number;
    networkBandwidthGbps: number;
    profile: string;
  };
  scalingAnalysis: {
    currentCapacity: { shards: number; tps: number; validators: number };
    maxCapacity: { shards: number; tps: number; validators: number };
    utilizationPercent: number;
    recommendations: string[];
    scalingReadiness: 'ready' | 'warning' | 'critical';
  };
}

interface ShardPreview {
  shardCount: number;
  estimatedTps: number;
  estimatedValidators: number;
  requirements: {
    minCores: number;
    minRamGB: number;
    recommendedCores: number;
    recommendedRamGB: number;
    storageGB: number;
    networkBandwidthGbps: number;
    profile: string;
  };
  comparison: {
    current: { shards: number; tps: number; validators: number };
    proposed: { shards: number; tps: number; validators: number };
    improvement: { tpsIncrease: string; shardIncrease: string };
  };
}

function MetricCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <Skeleton className="h-8 w-16 mx-auto mb-2" />
        <Skeleton className="h-4 w-24 mx-auto" />
      </CardContent>
    </Card>
  );
}

function ShardCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-5 w-16" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full" />
      </CardContent>
    </Card>
  );
}

export default function AdminShards() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedShardCount, setSelectedShardCount] = useState<number | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [selectedShard, setSelectedShard] = useState<Shard | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data: shardingData, isLoading, error, refetch } = useQuery<ShardingResponse>({
    queryKey: ["/api/sharding"],
    staleTime: 5000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: 5000,
  });

  const { data: shardConfig, isLoading: isConfigLoading } = useQuery<ShardConfig>({
    queryKey: ["/api/admin/shards/config"],
    staleTime: 10000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: 10000,
  });

  const { data: shardPreview, isLoading: isPreviewLoading } = useQuery<ShardPreview>({
    queryKey: ["/api/admin/shards/preview", selectedShardCount],
    staleTime: 30000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: selectedShardCount !== null && selectedShardCount !== shardConfig?.currentShardCount,
  });

  const updateConfigMutation = useMutation({
    mutationFn: (newConfig: { shardCount: number }) => 
      apiRequest("POST", "/api/admin/shards/config", newConfig),
    onSuccess: () => {
      // Invalidate all shard-related queries for real-time sync across /admin and /app pages
      queryClient.invalidateQueries({ queryKey: ["/api/admin/shards/config"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sharding"] });
      queryClient.invalidateQueries({ queryKey: ["/api/shards"] }); // Enterprise node shards data
      queryClient.invalidateQueries({ queryKey: ["/api/cross-shard/messages"] }); // Cross-shard messages
      queryClient.invalidateQueries({ queryKey: ["/api/consensus/current"] }); // Consensus state with validators
      setShowConfigDialog(false);
      setSelectedShardCount(null);
      toast({
        title: t("adminShards.configUpdateSuccess"),
        description: t("adminShards.configUpdateSuccessDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminShards.configUpdateError"),
        description: t("adminShards.configUpdateErrorDesc"),
        variant: "destructive",
      });
    },
  });

  const rebalanceMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/sharding/rebalance"),
    onSuccess: () => {
      // Invalidate all shard-related queries after rebalance
      queryClient.invalidateQueries({ queryKey: ["/api/sharding"] });
      queryClient.invalidateQueries({ queryKey: ["/api/shards"] }); // Enterprise node shards data
      queryClient.invalidateQueries({ queryKey: ["/api/cross-shard/messages"] });
      toast({
        title: t("adminShards.rebalanceSuccess"),
        description: t("adminShards.rebalanceSuccessDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminShards.rebalanceError"),
        description: t("adminShards.rebalanceErrorDesc"),
        variant: "destructive",
      });
    },
  });

  // Use only API data - no hardcoded fallback for production
  const shards: Shard[] = useMemo(() => shardingData?.shards || [], [shardingData]);

  const stats: ShardingStats = useMemo(() => shardingData?.stats || {
    totalShards: shards.length,
    totalTps: shards.reduce((acc, s) => acc + s.tps, 0),
    avgLoad: Math.round(shards.reduce((acc, s) => acc + s.load, 0) / shards.length),
    totalValidators: shards.reduce((acc, s) => acc + s.validators, 0),
    healthyShards: shards.filter(s => s.status === "healthy").length,
    pendingRebalance: shards.filter(s => s.rebalanceScore < 80).length,
  }, [shards, shardingData]);

  const loadHistory: LoadHistory[] = useMemo(() => shardingData?.loadHistory || Array.from({ length: 24 }, (_, i) => ({
    time: `${23 - i}h`,
    shard0: Math.floor(Math.random() * 20) + 58,
    shard1: Math.floor(Math.random() * 20) + 62,
    shard2: Math.floor(Math.random() * 20) + 55,
    shard3: Math.floor(Math.random() * 25) + 68,
  })).reverse(), [shardingData]);

  const filteredShards = useMemo(() => {
    return shards.filter(shard => 
      searchQuery === "" || 
      shard.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [shards, searchQuery]);

  useEffect(() => {
    let ws: WebSocket | null = null;
    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
        
        ws.onopen = () => {
          setWsConnected(true);
          ws?.send(JSON.stringify({ type: "subscribe", channels: ["sharding"] }));
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "sharding_update") {
              refetch();
              setLastUpdate(new Date());
            }
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
  }, [refetch]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: t("adminShards.refreshSuccess"),
        description: t("adminShards.dataUpdated"),
      });
      setLastUpdate(new Date());
    } catch (err) {
      toast({
        title: t("adminShards.refreshError"),
        description: t("adminShards.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      stats,
      shards,
      loadHistory,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tburn-shards-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: t("adminShards.exportSuccess"),
      description: t("adminShards.exportSuccessDesc"),
    });
  }, [stats, shards, loadHistory, toast, t]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy": return <Badge className="bg-green-500/10 text-green-500" data-testid="badge-status-healthy">{t("adminShards.statusHealthy")}</Badge>;
      case "warning": return <Badge className="bg-yellow-500/10 text-yellow-500" data-testid="badge-status-warning">{t("adminShards.statusWarning")}</Badge>;
      case "critical": return <Badge className="bg-red-500/10 text-red-500" data-testid="badge-status-critical">{t("adminShards.statusCritical")}</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getLoadColor = (load: number) => {
    if (load >= 80) return "bg-red-500";
    if (load >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const handleViewShard = (shard: Shard) => {
    setSelectedShard(shard);
    setIsDetailOpen(true);
  };

  const getShardDetailSections = (shard: Shard): DetailSection[] => [
    {
      title: t("adminShards.overview"),
      icon: <Grid3x3 className="h-4 w-4" />,
      fields: [
        { label: t("adminShards.shardId"), value: `#${shard.id}` },
        { label: t("adminShards.shardName"), value: shard.name },
        { label: t("common.status"), value: shard.status, type: "status" as const },
        { label: t("adminShards.rebalanceScore"), value: `${shard.rebalanceScore}%`, type: "progress" as const },
      ],
    },
    {
      title: t("adminShards.performance"),
      icon: <Zap className="h-4 w-4" />,
      fields: [
        { label: t("adminShards.tps"), value: shard.tps.toLocaleString() },
        { label: t("adminShards.load"), value: `${shard.load}%`, type: "progress" as const },
        { label: t("adminShards.pendingTx"), value: shard.pendingTx.toLocaleString() },
        { label: t("adminShards.crossShardTx"), value: shard.crossShardTx.toLocaleString() },
      ],
    },
    {
      title: t("adminShards.network"),
      icon: <Users className="h-4 w-4" />,
      fields: [
        { label: t("adminShards.validators"), value: shard.validators.toLocaleString() },
        { label: t("adminShards.capacityUsage"), value: shard.load >= 80 ? t("adminShards.statusCritical") : shard.load >= 70 ? t("adminShards.statusWarning") : t("adminShards.statusHealthy"), type: "badge" as const, badgeVariant: shard.load >= 80 ? "destructive" as const : shard.load >= 70 ? "outline" as const : "secondary" as const },
      ],
    },
  ];

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center" data-testid="shards-error">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t("adminShards.error.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("adminShards.error.description")}</p>
            <Button onClick={() => refetch()} data-testid="button-retry">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("common.refresh")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex-1 overflow-auto" data-testid="admin-shards-page">
        <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-page-title">
                <Grid3x3 className="h-8 w-8" />
                {t("adminShards.title")}
              </h1>
              <p className="text-muted-foreground" data-testid="text-page-subtitle">{t("adminShards.subtitle")}</p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${wsConnected ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                      <div className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                      <span className="text-xs" data-testid="text-ws-status">{wsConnected ? t("common.connected") : t("adminShards.reconnecting")}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {wsConnected ? t("adminShards.wsConnected") : t("adminShards.wsReconnecting")}
                  </TooltipContent>
                </Tooltip>
                <Clock className="h-4 w-4" />
                <span data-testid="text-last-update">{t("adminShards.lastUpdate")}: {lastUpdate.toLocaleTimeString(i18n.language === 'ko' ? 'ko-KR' : 'en-US', { timeZone: 'America/New_York' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500/10 text-green-500 flex items-center gap-1" data-testid="badge-ai-active">
                  <Brain className="h-3 w-3" />
                  {t("adminShards.aiAutoRebalancing")}
                </Badge>
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
                  <TooltipContent>{t("common.refresh")}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleExport}
                      data-testid="button-export"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("common.export")}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline"
                      onClick={() => rebalanceMutation.mutate()}
                      disabled={rebalanceMutation.isPending}
                      data-testid="button-manual-rebalance"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${rebalanceMutation.isPending ? 'animate-spin' : ''}`} />
                      {t("adminShards.manualRebalance")}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("adminShards.manualRebalanceTooltip")}</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {isLoading ? (
              <>
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
              </>
            ) : (
              <>
                <Card data-testid="metric-total-shards">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold" data-testid="value-total-shards">{stats.totalShards}</p>
                    <p className="text-xs text-muted-foreground">{t("adminShards.totalShards")}</p>
                  </CardContent>
                </Card>
                <Card data-testid="metric-combined-tps">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold" data-testid="value-combined-tps">{stats.totalTps.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{t("adminShards.combinedTps")}</p>
                  </CardContent>
                </Card>
                <Card data-testid="metric-avg-load">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold" data-testid="value-avg-load">{stats.avgLoad}%</p>
                    <p className="text-xs text-muted-foreground">{t("adminShards.avgLoad")}</p>
                  </CardContent>
                </Card>
                <Card data-testid="metric-total-validators">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold" data-testid="value-total-validators">{stats.totalValidators}</p>
                    <p className="text-xs text-muted-foreground">{t("adminShards.totalValidators")}</p>
                  </CardContent>
                </Card>
                <Card data-testid="metric-healthy-shards">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-500" data-testid="value-healthy-shards">{stats.healthyShards}/{stats.totalShards}</p>
                    <p className="text-xs text-muted-foreground">{t("adminShards.healthy")}</p>
                  </CardContent>
                </Card>
                <Card data-testid="metric-pending-rebalance">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-500" data-testid="value-pending-rebalance">{stats.pendingRebalance}</p>
                    <p className="text-xs text-muted-foreground">{t("adminShards.pendingRebalance")}</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Shard Configuration Panel */}
          <Card data-testid="card-shard-configuration">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  <CardTitle className="text-lg">{t("adminShards.shardConfiguration") || "Shard Configuration"}</CardTitle>
                </div>
                {shardConfig && (
                  <Badge className={shardConfig.scalingAnalysis?.scalingReadiness === 'ready' ? 'bg-green-500/10 text-green-500' : shardConfig.scalingAnalysis?.scalingReadiness === 'warning' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'}>
                    {shardConfig.scalingAnalysis?.scalingReadiness === 'ready' ? t("adminShards.scalingReady") || "Ready to Scale" : shardConfig.scalingAnalysis?.scalingReadiness === 'warning' ? t("adminShards.scalingWarning") || "Scaling Limited" : t("adminShards.scalingCritical") || "Critical"}
                  </Badge>
                )}
              </div>
              <CardDescription>{t("adminShards.shardConfigDescription") || "Configure the number of shards based on hardware capacity"}</CardDescription>
            </CardHeader>
            <CardContent>
              {isConfigLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                </div>
              ) : shardConfig ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg border bg-card" data-testid="config-current-shards">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Grid3x3 className="h-4 w-4" />
                        {t("adminShards.currentShards") || "Current Shards"}
                      </div>
                      <p className="text-2xl font-bold">{shardConfig.currentShardCount}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("adminShards.shardRange") || "Range"}: {shardConfig.minShards} - {shardConfig.maxShards}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border bg-card" data-testid="config-hardware-profile">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Cpu className="h-4 w-4" />
                        {t("adminShards.hardwareProfile") || "Hardware Profile"}
                      </div>
                      <p className="text-2xl font-bold">{shardConfig.hardwareRequirements?.profile || "Production"}</p>
                      <p className="text-xs text-muted-foreground">
                        {shardConfig.hardwareRequirements?.recommendedCores || 32} {t("adminShards.cores") || "cores"}, {shardConfig.hardwareRequirements?.recommendedRamGB || 256}GB RAM
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border bg-card" data-testid="config-estimated-tps">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Gauge className="h-4 w-4" />
                        {t("adminShards.estimatedTps") || "Estimated TPS"}
                      </div>
                      <p className="text-2xl font-bold">{shardConfig.estimatedTps?.toLocaleString() || "54,000+"}</p>
                      <p className="text-xs text-muted-foreground">
                        ~{shardConfig.tpsPerShard?.toLocaleString() || "10,800"} {t("adminShards.perShard") || "per shard"}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border bg-card" data-testid="config-capacity">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Server className="h-4 w-4" />
                        {t("adminShards.capacity") || "Capacity"}
                      </div>
                      <Progress value={shardConfig.scalingAnalysis?.utilizationPercent || 8} className="h-2 mb-2" />
                      <p className="text-sm font-medium">{shardConfig.scalingAnalysis?.utilizationPercent || 8}%</p>
                      <p className="text-xs text-muted-foreground">
                        {shardConfig.currentShardCount}/{shardConfig.maxShards} {t("adminShards.shardsUsed") || "shards active"}
                      </p>
                    </div>
                  </div>
                  
                  {/* Shard Scaling Controls */}
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 rounded-lg border bg-muted/30">
                    <div className="flex-1">
                      <label className="text-sm font-medium mb-2 block">
                        {t("adminShards.selectShardCount") || "Select Shard Count"}
                      </label>
                      <Select
                        value={selectedShardCount?.toString() || shardConfig.currentShardCount.toString()}
                        onValueChange={(v) => setSelectedShardCount(parseInt(v))}
                      >
                        <SelectTrigger className="w-full md:w-48" data-testid="select-shard-count">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[5, 8, 12, 16, 24, 32, 48, 64, 80, 96, 112, 128].filter(n => n >= shardConfig.minShards && n <= shardConfig.maxShards).map((count) => (
                            <SelectItem key={count} value={count.toString()}>
                              {count} {t("adminShards.shardsLabel") || "shards"} {count === shardConfig.currentShardCount ? `(${t("adminShards.current") || "current"})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {shardPreview && selectedShardCount !== shardConfig.currentShardCount && (
                      <div className="flex-1 p-3 rounded-lg border bg-card">
                        <p className="text-sm font-medium mb-2">{t("adminShards.previewChanges") || "Preview Changes"}</p>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">{t("adminShards.shards") || "Shards"}</p>
                            <p className="font-medium">{shardConfig.currentShardCount} → {selectedShardCount}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">{t("adminShards.tpsEstimate") || "TPS"}</p>
                            <p className="font-medium text-green-500">+{shardPreview.comparison?.improvement?.tpsIncrease || "0%"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">{t("adminShards.validatorsLabel") || "Validators"}</p>
                            <p className="font-medium">{shardPreview.estimatedValidators?.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
                      <DialogTrigger asChild>
                        <Button 
                          disabled={!selectedShardCount || selectedShardCount === shardConfig.currentShardCount || updateConfigMutation.isPending}
                          data-testid="button-apply-shard-config"
                        >
                          {t("adminShards.applyConfiguration") || "Apply Configuration"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t("adminShards.confirmConfigChange") || "Confirm Shard Configuration"}</DialogTitle>
                          <DialogDescription>
                            {t("adminShards.confirmConfigChangeDesc") || "This will change the network shard count. This operation requires network coordination."}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="p-3 rounded-lg border">
                              <p className="text-muted-foreground">{t("adminShards.currentConfig") || "Current"}</p>
                              <p className="font-bold text-xl">{shardConfig.currentShardCount} {t("adminShards.shardsLabel") || "shards"}</p>
                              <p className="text-sm text-muted-foreground">{shardConfig.estimatedTps?.toLocaleString()} TPS</p>
                            </div>
                            <div className="p-3 rounded-lg border bg-primary/5">
                              <p className="text-muted-foreground">{t("adminShards.newConfig") || "New"}</p>
                              <p className="font-bold text-xl">{selectedShardCount} {t("adminShards.shardsLabel") || "shards"}</p>
                              <p className="text-sm text-green-500">{shardPreview?.estimatedTps?.toLocaleString() || (selectedShardCount || 0) * 10800} TPS</p>
                            </div>
                          </div>
                          {shardPreview?.requirements && (
                            <div className="p-3 rounded-lg border bg-yellow-500/10">
                              <p className="text-sm font-medium flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                {t("adminShards.hardwareRequirements") || "Hardware Requirements"}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {t("adminShards.requiresMinimum") || "Requires minimum"}: {shardPreview.requirements.minCores} {t("adminShards.cores") || "cores"}, {shardPreview.requirements.minRamGB}GB RAM
                              </p>
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
                            {t("common.cancel") || "Cancel"}
                          </Button>
                          <Button 
                            onClick={() => selectedShardCount && updateConfigMutation.mutate({ shardCount: selectedShardCount })}
                            disabled={updateConfigMutation.isPending}
                            data-testid="button-confirm-shard-config"
                          >
                            {updateConfigMutation.isPending ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                {t("adminShards.applying") || "Applying..."}
                              </>
                            ) : (
                              t("adminShards.confirmApply") || "Confirm & Apply"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {/* Scaling Recommendations */}
                  {shardConfig.scalingAnalysis?.recommendations && shardConfig.scalingAnalysis.recommendations.length > 0 && (
                    <div className="p-4 rounded-lg border bg-blue-500/5">
                      <p className="text-sm font-medium flex items-center gap-2 mb-2">
                        <Brain className="h-4 w-4" />
                        {t("adminShards.aiRecommendations") || "AI Recommendations"}
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {shardConfig.scalingAnalysis.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <TrendingUp className="h-3 w-3 mt-1 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Hardware Profile Reference Table */}
                  <div className="p-4 rounded-lg border" data-testid="hardware-profile-table">
                    <p className="text-sm font-medium flex items-center gap-2 mb-3">
                      <HardDrive className="h-4 w-4" />
                      {t("adminShards.hardwareProfileTable") || "Hardware Profile Reference"}
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-3 font-medium">{t("adminShards.profile") || "Profile"}</th>
                            <th className="text-center py-2 px-3 font-medium">{t("adminShards.cpuCores") || "CPU Cores"}</th>
                            <th className="text-center py-2 px-3 font-medium">{t("adminShards.ram") || "RAM"}</th>
                            <th className="text-center py-2 px-3 font-medium">{t("adminShards.maxShardsLabel") || "Max Shards"}</th>
                            <th className="text-center py-2 px-3 font-medium">{t("adminShards.tpsCapacity") || "TPS Capacity"}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className={`border-b ${shardConfig.hardwareRequirements?.profile === 'development' ? 'bg-primary/5' : ''}`}>
                            <td className="py-2 px-3 flex items-center gap-2">
                              <Cpu className="h-4 w-4 text-muted-foreground" />
                              {t("adminShards.profileDevelopment") || "Development"}
                              {shardConfig.hardwareRequirements?.profile === 'development' && (
                                <Badge className="text-xs">{t("adminShards.current") || "Current"}</Badge>
                              )}
                            </td>
                            <td className="text-center py-2 px-3">8</td>
                            <td className="text-center py-2 px-3">32GB</td>
                            <td className="text-center py-2 px-3">8</td>
                            <td className="text-center py-2 px-3">80,000</td>
                          </tr>
                          <tr className={`border-b ${shardConfig.hardwareRequirements?.profile === 'staging' ? 'bg-primary/5' : ''}`}>
                            <td className="py-2 px-3 flex items-center gap-2">
                              <Server className="h-4 w-4 text-muted-foreground" />
                              {t("adminShards.profileStaging") || "Staging"}
                              {shardConfig.hardwareRequirements?.profile === 'staging' && (
                                <Badge className="text-xs">{t("adminShards.current") || "Current"}</Badge>
                              )}
                            </td>
                            <td className="text-center py-2 px-3">16</td>
                            <td className="text-center py-2 px-3">64GB</td>
                            <td className="text-center py-2 px-3">16</td>
                            <td className="text-center py-2 px-3">160,000</td>
                          </tr>
                          <tr className={`border-b ${shardConfig.hardwareRequirements?.profile === 'production' ? 'bg-primary/5' : ''}`}>
                            <td className="py-2 px-3 flex items-center gap-2">
                              <Server className="h-4 w-4 text-blue-500" />
                              {t("adminShards.profileProduction") || "Production"}
                              {shardConfig.hardwareRequirements?.profile === 'production' && (
                                <Badge className="text-xs">{t("adminShards.current") || "Current"}</Badge>
                              )}
                            </td>
                            <td className="text-center py-2 px-3">32</td>
                            <td className="text-center py-2 px-3">256GB</td>
                            <td className="text-center py-2 px-3">64</td>
                            <td className="text-center py-2 px-3">640,000</td>
                          </tr>
                          <tr className={`${shardConfig.hardwareRequirements?.profile === 'enterprise' ? 'bg-primary/5' : ''}`}>
                            <td className="py-2 px-3 flex items-center gap-2">
                              <Server className="h-4 w-4 text-green-500" />
                              {t("adminShards.profileEnterprise") || "Enterprise"}
                              {shardConfig.hardwareRequirements?.profile === 'enterprise' && (
                                <Badge className="text-xs">{t("adminShards.current") || "Current"}</Badge>
                              )}
                            </td>
                            <td className="text-center py-2 px-3 font-medium text-green-500">64</td>
                            <td className="text-center py-2 px-3 font-medium text-green-500">512GB</td>
                            <td className="text-center py-2 px-3 font-medium text-green-500">128</td>
                            <td className="text-center py-2 px-3 font-medium text-green-500">1,280,000</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      {t("adminShards.hardwareNote") || "TPS capacity scales linearly with shard count. Enterprise tier supports up to 128 shards for maximum throughput."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  {t("adminShards.configLoadError") || "Unable to load configuration"}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("adminShards.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-shard-search"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isLoading ? (
              <>
                <ShardCardSkeleton />
                <ShardCardSkeleton />
                <ShardCardSkeleton />
                <ShardCardSkeleton />
              </>
            ) : (
              filteredShards.map((shard) => (
                <Card key={shard.id} data-testid={`card-shard-${shard.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <CardTitle className="text-lg flex items-center gap-2" data-testid={`text-shard-name-${shard.id}`}>
                        <Grid3x3 className="h-5 w-5" />
                        {shard.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(shard.status)}
                        <div className="flex items-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="ghost" onClick={() => handleViewShard(shard)} data-testid={`button-view-shard-${shard.id}`}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{t("common.view")}</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="ghost" data-testid={`button-settings-shard-${shard.id}`}>
                                <Settings className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{t("common.settings")}</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-center cursor-help" data-testid={`metric-tps-${shard.id}`}>
                            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                              <Zap className="h-3 w-3" />
                              {t("adminShards.tps")}
                            </div>
                            <p className="text-lg font-bold" data-testid={`value-tps-${shard.id}`}>{shard.tps}</p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{t("adminShards.tpsTooltip")}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-center cursor-help" data-testid={`metric-validators-${shard.id}`}>
                            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                              <Users className="h-3 w-3" />
                              {t("adminShards.validators")}
                            </div>
                            <p className="text-lg font-bold" data-testid={`value-validators-${shard.id}`}>{shard.validators}</p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{t("adminShards.validatorsTooltip")}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-center cursor-help" data-testid={`metric-pending-${shard.id}`}>
                            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                              <Activity className="h-3 w-3" />
                              {t("adminShards.pending")}
                            </div>
                            <p className="text-lg font-bold" data-testid={`value-pending-${shard.id}`}>{shard.pendingTx}</p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{t("adminShards.pendingTooltip")}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-center cursor-help" data-testid={`metric-cross-shard-${shard.id}`}>
                            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                              <ArrowRightLeft className="h-3 w-3" />
                              {t("adminShards.crossShard")}
                            </div>
                            <p className="text-lg font-bold" data-testid={`value-cross-shard-${shard.id}`}>{shard.crossShardTx}</p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{t("adminShards.crossShardTooltip")}</TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{t("adminShards.load")}</span>
                          <span className={`font-medium ${shard.load >= 80 ? "text-red-500" : shard.load >= 70 ? "text-yellow-500" : "text-green-500"}`} data-testid={`value-load-${shard.id}`}>
                            {shard.load}%
                          </span>
                        </div>
                        <Progress value={shard.load} className={`h-2 ${getLoadColor(shard.load)}`} data-testid={`progress-load-${shard.id}`} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{t("adminShards.rebalanceScore")}</span>
                          <span className="font-medium" data-testid={`value-rebalance-${shard.id}`}>{shard.rebalanceScore}%</span>
                        </div>
                        <Progress value={shard.rebalanceScore} className="h-2" data-testid={`progress-rebalance-${shard.id}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {!isLoading && filteredShards.length === 0 && (
            <div className="text-center py-8 text-muted-foreground" data-testid="text-no-shards">
              {t("adminShards.noShardsFound")}
            </div>
          )}

          <Card data-testid="card-load-history">
            <CardHeader>
              <CardTitle className="flex items-center gap-2" data-testid="text-history-title">
                <TrendingUp className="h-5 w-5" />
                {t("adminShards.loadHistory")}
              </CardTitle>
              <CardDescription>{t("adminShards.loadHistory24h")}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <div className="h-[300px]" data-testid="chart-load-history">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={loadHistory}>
                      <defs>
                        <linearGradient id="colorS0" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorS1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="time" className="text-xs" />
                      <YAxis className="text-xs" domain={[0, 100]} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Area type="monotone" dataKey="shard0" stroke="#10b981" fill="url(#colorS0)" strokeWidth={2} name={t("adminShards.beaconShard")} />
                      <Area type="monotone" dataKey="shard3" stroke="#f59e0b" fill="none" strokeWidth={2} name={t("adminShards.gammaWarning")} strokeDasharray="5 5" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <DetailSheet
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        title={selectedShard?.name || ""}
        subtitle={`Shard #${selectedShard?.id || 0}`}
        icon={<Grid3x3 className="h-5 w-5" />}
        sections={selectedShard ? getShardDetailSections(selectedShard) : []}
        actions={selectedShard ? [
          {
            label: t("adminShards.triggerRebalance"),
            icon: <RefreshCw className="h-4 w-4" />,
            onClick: () => {
              setIsDetailOpen(false);
              rebalanceMutation.mutate();
            },
            disabled: rebalanceMutation.isPending,
          },
        ] : []}
      />
    </TooltipProvider>
  );
}
