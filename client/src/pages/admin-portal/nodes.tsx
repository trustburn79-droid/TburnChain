import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  Server,
  Activity,
  Cpu,
  HardDrive,
  Network,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  RefreshCw,
  Globe,
  Clock,
  Download,
  AlertCircle,
  MemoryStick,
  Plus,
  Eye,
  Power,
  Settings,
} from "lucide-react";

interface Node {
  id: string;
  name: string;
  type: "validator" | "full" | "archive" | "light";
  status: "online" | "offline" | "syncing";
  ip: string;
  region: string;
  version: string;
  blockHeight: number;
  peers: number;
  uptime: number;
  cpu: number;
  memory: number;
  disk: number;
  latency: number;
  lastSeen: Date;
}

interface NodesResponse {
  nodes: Node[];
  total: number;
  online: number;
  offline: number;
  syncing: number;
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

function TableRowSkeleton() {
  return (
    <tr className="border-b">
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <div>
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </td>
      <td className="py-3 px-4"><Skeleton className="h-5 w-16" /></td>
      <td className="py-3 px-4"><Skeleton className="h-5 w-14" /></td>
      <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
      <td className="py-3 px-4 text-right"><Skeleton className="h-4 w-24 ml-auto" /></td>
      <td className="py-3 px-4 text-right"><Skeleton className="h-4 w-8 ml-auto" /></td>
      <td className="py-3 px-4"><Skeleton className="h-2 w-full" /></td>
      <td className="py-3 px-4 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
      <td className="py-3 px-4 text-right"><Skeleton className="h-5 w-16 ml-auto" /></td>
    </tr>
  );
}

export default function AdminNodes() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const { data: nodesData, isLoading, error, refetch } = useQuery<NodesResponse>({
    queryKey: ["/api/admin/nodes"],
    refetchInterval: 10000,
  });

  const nodes: Node[] = useMemo(() => nodesData?.nodes || [
    { id: "node-01", name: "TBURN Genesis Node", type: "validator", status: "online", ip: "10.0.1.1", region: "US-East", version: "v2.1.0", blockHeight: 12847562, peers: 156, uptime: 99.99, cpu: 45, memory: 62, disk: 48, latency: 12, lastSeen: new Date() },
    { id: "node-02", name: "EU Primary", type: "validator", status: "online", ip: "10.0.2.1", region: "EU-West", version: "v2.1.0", blockHeight: 12847562, peers: 142, uptime: 99.95, cpu: 52, memory: 58, disk: 52, latency: 18, lastSeen: new Date() },
    { id: "node-03", name: "APAC Primary", type: "validator", status: "online", ip: "10.0.3.1", region: "AP-East", version: "v2.1.0", blockHeight: 12847560, peers: 128, uptime: 99.92, cpu: 48, memory: 65, disk: 55, latency: 45, lastSeen: new Date() },
    { id: "node-04", name: "Archive Node 1", type: "archive", status: "syncing", ip: "10.0.4.1", region: "US-West", version: "v2.1.0", blockHeight: 12847550, peers: 85, uptime: 98.5, cpu: 78, memory: 82, disk: 85, latency: 25, lastSeen: new Date() },
    { id: "node-05", name: "Full Node EU", type: "full", status: "online", ip: "10.0.5.1", region: "EU-Central", version: "v2.1.0", blockHeight: 12847562, peers: 95, uptime: 99.88, cpu: 35, memory: 48, disk: 42, latency: 22, lastSeen: new Date() },
    { id: "node-06", name: "Light Node 1", type: "light", status: "online", ip: "10.0.6.1", region: "US-Central", version: "v2.1.0", blockHeight: 12847562, peers: 32, uptime: 99.75, cpu: 15, memory: 25, disk: 12, latency: 8, lastSeen: new Date() },
    { id: "node-07", name: "Backup Validator", type: "validator", status: "offline", ip: "10.0.7.1", region: "EU-North", version: "v2.0.9", blockHeight: 12847100, peers: 0, uptime: 95.2, cpu: 0, memory: 0, disk: 65, latency: 0, lastSeen: new Date(Date.now() - 3600000) },
    { id: "node-08", name: "Full Node APAC", type: "full", status: "online", ip: "10.0.8.1", region: "AP-South", version: "v2.1.0", blockHeight: 12847561, peers: 78, uptime: 99.82, cpu: 42, memory: 55, disk: 48, latency: 55, lastSeen: new Date() },
  ], [nodesData]);

  useEffect(() => {
    let ws: WebSocket | null = null;
    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
        
        ws.onopen = () => {
          setWsConnected(true);
          ws?.send(JSON.stringify({ type: "subscribe", channels: ["nodes"] }));
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "nodes_update") {
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
        title: t("adminNodes.refreshSuccess"),
        description: t("adminNodes.dataUpdated"),
      });
      setLastUpdate(new Date());
    } catch (error) {
      toast({
        title: t("adminNodes.refreshError"),
        description: t("adminNodes.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      totalNodes: nodes.length,
      nodes: nodes.map(node => ({
        ...node,
        lastSeen: node.lastSeen.toISOString(),
      })),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tburn-nodes-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: t("adminNodes.exportSuccess"),
      description: t("adminNodes.exportSuccessDesc"),
    });
  }, [nodes, toast, t]);

  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      const matchesSearch = searchQuery === "" ||
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "all" || node.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [nodes, searchQuery, typeFilter]);

  const nodeStats = useMemo(() => ({
    total: nodesData?.total || nodes.length,
    online: nodesData?.online || nodes.filter(n => n.status === "online").length,
    offline: nodesData?.offline || nodes.filter(n => n.status === "offline").length,
    syncing: nodesData?.syncing || nodes.filter(n => n.status === "syncing").length,
    validators: nodes.filter(n => n.type === "validator").length,
    avgLatency: Math.round(nodes.filter(n => n.status === "online").reduce((acc, n) => acc + n.latency, 0) / (nodes.filter(n => n.status === "online").length || 1)),
  }), [nodes, nodesData]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online": return <CheckCircle2 className="h-4 w-4 text-green-500" data-testid="icon-status-online" />;
      case "offline": return <XCircle className="h-4 w-4 text-red-500" data-testid="icon-status-offline" />;
      case "syncing": return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" data-testid="icon-status-syncing" />;
      default: return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online": return <Badge className="bg-green-500/10 text-green-500" data-testid="badge-status-online">{t("adminNodes.statusOnline")}</Badge>;
      case "offline": return <Badge className="bg-red-500/10 text-red-500" data-testid="badge-status-offline">{t("adminNodes.statusOffline")}</Badge>;
      case "syncing": return <Badge className="bg-yellow-500/10 text-yellow-500" data-testid="badge-status-syncing">{t("adminNodes.statusSyncing")}</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "validator": return <Badge variant="outline" className="text-purple-500 border-purple-500/30" data-testid="badge-type-validator">{t("adminNodes.typeValidator")}</Badge>;
      case "full": return <Badge variant="outline" className="text-blue-500 border-blue-500/30" data-testid="badge-type-full">{t("adminNodes.typeFull")}</Badge>;
      case "archive": return <Badge variant="outline" className="text-orange-500 border-orange-500/30" data-testid="badge-type-archive">{t("adminNodes.typeArchive")}</Badge>;
      case "light": return <Badge variant="outline" className="text-green-500 border-green-500/30" data-testid="badge-type-light">{t("adminNodes.typeLight")}</Badge>;
      default: return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center" data-testid="nodes-error">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t("adminNodes.error.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("adminNodes.error.description")}</p>
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
      <div className="flex-1 overflow-auto" data-testid="admin-nodes-page">
        <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-page-title">
                <Server className="h-8 w-8" />
                {t("adminNodes.title")}
              </h1>
              <p className="text-muted-foreground" data-testid="text-page-subtitle">{t("adminNodes.subtitle")}</p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${wsConnected ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                      <div className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                      <span className="text-xs" data-testid="text-ws-status">{wsConnected ? t("common.connected") : t("adminNodes.reconnecting")}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {wsConnected ? t("adminNodes.wsConnected") : t("adminNodes.wsReconnecting")}
                  </TooltipContent>
                </Tooltip>
                <Clock className="h-4 w-4" />
                <span data-testid="text-last-update">{t("adminNodes.lastUpdate")}: {lastUpdate.toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-2">
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
                    <Button data-testid="button-add-node">
                      <Plus className="h-4 w-4 mr-2" />
                      {t("adminNodes.addNode")}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("adminNodes.addNodeTooltip")}</TooltipContent>
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
                <Card data-testid="metric-total-nodes">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold" data-testid="value-total-nodes">{nodeStats.total}</p>
                    <p className="text-xs text-muted-foreground">{t("adminNodes.totalNodes")}</p>
                  </CardContent>
                </Card>
                <Card data-testid="metric-online-nodes">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-500" data-testid="value-online-nodes">{nodeStats.online}</p>
                    <p className="text-xs text-muted-foreground">{t("adminNodes.online")}</p>
                  </CardContent>
                </Card>
                <Card data-testid="metric-offline-nodes">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-red-500" data-testid="value-offline-nodes">{nodeStats.offline}</p>
                    <p className="text-xs text-muted-foreground">{t("adminNodes.offline")}</p>
                  </CardContent>
                </Card>
                <Card data-testid="metric-syncing-nodes">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-500" data-testid="value-syncing-nodes">{nodeStats.syncing}</p>
                    <p className="text-xs text-muted-foreground">{t("adminNodes.syncing")}</p>
                  </CardContent>
                </Card>
                <Card data-testid="metric-validators">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-purple-500" data-testid="value-validators">{nodeStats.validators}</p>
                    <p className="text-xs text-muted-foreground">{t("adminNodes.validators")}</p>
                  </CardContent>
                </Card>
                <Card data-testid="metric-avg-latency">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold" data-testid="value-avg-latency">{nodeStats.avgLatency}ms</p>
                    <p className="text-xs text-muted-foreground">{t("adminNodes.avgLatency")}</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <Card data-testid="card-nodes-table">
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <CardTitle data-testid="text-nodes-title">{t("adminNodes.nodes")}</CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("adminNodes.searchPlaceholder")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-[250px]"
                      data-testid="input-node-search"
                    />
                  </div>
                  <Tabs value={typeFilter} onValueChange={setTypeFilter}>
                    <TabsList data-testid="tabs-node-filter">
                      <TabsTrigger value="all" data-testid="tab-all">{t("common.all")}</TabsTrigger>
                      <TabsTrigger value="validator" data-testid="tab-validators">{t("adminNodes.validators")}</TabsTrigger>
                      <TabsTrigger value="full" data-testid="tab-full">{t("adminNodes.full")}</TabsTrigger>
                      <TabsTrigger value="archive" data-testid="tab-archive">{t("adminNodes.archive")}</TabsTrigger>
                      <TabsTrigger value="light" data-testid="tab-light">{t("adminNodes.light")}</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="table-nodes">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">{t("adminNodes.node")}</th>
                      <th className="text-left py-3 px-4 font-medium">{t("adminNodes.type")}</th>
                      <th className="text-left py-3 px-4 font-medium">{t("common.status")}</th>
                      <th className="text-left py-3 px-4 font-medium">{t("adminNodes.region")}</th>
                      <th className="text-right py-3 px-4 font-medium">{t("adminNodes.blockHeight")}</th>
                      <th className="text-right py-3 px-4 font-medium">{t("adminNodes.peers")}</th>
                      <th className="text-center py-3 px-4 font-medium">{t("adminNodes.resources")}</th>
                      <th className="text-right py-3 px-4 font-medium">{t("adminNodes.latency")}</th>
                      <th className="text-right py-3 px-4 font-medium">{t("adminNodes.uptime")}</th>
                      <th className="text-center py-3 px-4 font-medium">{t("common.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <>
                        <TableRowSkeleton />
                        <TableRowSkeleton />
                        <TableRowSkeleton />
                        <TableRowSkeleton />
                        <TableRowSkeleton />
                      </>
                    ) : (
                      filteredNodes.map((node) => (
                        <tr key={node.id} className="border-b hover-elevate cursor-pointer" data-testid={`row-node-${node.id}`}>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(node.status)}
                              <div>
                                <p className="font-medium" data-testid={`text-node-name-${node.id}`}>{node.name}</p>
                                <p className="text-xs text-muted-foreground font-mono" data-testid={`text-node-id-${node.id}`}>{node.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">{getTypeBadge(node.type)}</td>
                          <td className="py-3 px-4">{getStatusBadge(node.status)}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <Globe className="h-3 w-3 text-muted-foreground" />
                              <span data-testid={`text-node-region-${node.id}`}>{node.region}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono" data-testid={`text-node-height-${node.id}`}>{node.blockHeight.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right" data-testid={`text-node-peers-${node.id}`}>{node.peers}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2 justify-center">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-1">
                                    <Cpu className="h-3 w-3 text-muted-foreground" />
                                    <Progress value={node.cpu} className="w-12 h-1" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>CPU: {node.cpu}%</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-1">
                                    <MemoryStick className="h-3 w-3 text-muted-foreground" />
                                    <Progress value={node.memory} className="w-12 h-1" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>{t("adminNodes.memory")}: {node.memory}%</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-1">
                                    <HardDrive className="h-3 w-3 text-muted-foreground" />
                                    <Progress value={node.disk} className="w-12 h-1" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>{t("adminNodes.disk")}: {node.disk}%</TooltipContent>
                              </Tooltip>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono" data-testid={`text-node-latency-${node.id}`}>{node.latency}ms</td>
                          <td className="py-3 px-4 text-right">
                            <Badge 
                              className={node.uptime >= 99.9 ? "bg-green-500/10 text-green-500" : node.uptime >= 99 ? "bg-yellow-500/10 text-yellow-500" : "bg-red-500/10 text-red-500"}
                              data-testid={`badge-node-uptime-${node.id}`}
                            >
                              {node.uptime}%
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="icon" variant="ghost" data-testid={`button-view-node-${node.id}`}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{t("common.view")}</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="icon" variant="ghost" data-testid={`button-settings-node-${node.id}`}>
                                    <Settings className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{t("common.settings")}</TooltipContent>
                              </Tooltip>
                              {node.status === "offline" && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button size="icon" variant="ghost" className="text-green-500" data-testid={`button-restart-node-${node.id}`}>
                                      <Power className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>{t("adminNodes.restart")}</TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {!isLoading && filteredNodes.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground" data-testid="text-no-nodes">
                    {t("adminNodes.noNodesFound")}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
