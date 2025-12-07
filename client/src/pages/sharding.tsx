import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { 
  Grid3x3, Layers, ArrowLeftRight, Brain, TrendingUp, Activity, Zap, 
  Clock, CheckCircle, XCircle, Network, ChevronRight, Search, Filter,
  BarChart3, PieChart as PieChartIcon, Gauge, Cpu, HardDrive, Server,
  AlertTriangle, RefreshCw, Settings, Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber } from "@/lib/format";
import { useWebSocketChannel } from "@/hooks/use-websocket-channel";
import { crossShardMessagesSnapshotSchema, shardsSnapshotSchema } from "@shared/schema";
import type { Shard, CrossShardMessage } from "@shared/schema";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { TestBadge } from "@/components/TestBadge";

type StatType = 'shards' | 'tps' | 'load' | 'validators' | 'crossShard' | null;

export default function Sharding() {
  const { t, i18n } = useTranslation();
  const [selectedStatType, setSelectedStatType] = useState<StatType>(null);
  const [selectedShard, setSelectedShard] = useState<Shard | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: shards, isLoading: shardsLoading } = useQuery<Shard[]>({
    queryKey: ["/api/shards"],
  });

  const { data: messages, isLoading: messagesLoading } = useQuery<CrossShardMessage[]>({
    queryKey: ["/api/cross-shard/messages"],
  });

  useWebSocketChannel({
    channel: "cross_shard_snapshot",
    schema: crossShardMessagesSnapshotSchema,
    queryKey: ["/api/cross-shard/messages"],
    updateMode: "snapshot",
  });

  useWebSocketChannel({
    channel: "shards_snapshot",
    schema: shardsSnapshotSchema,
    queryKey: ["/api/shards"],
    updateMode: "snapshot",
  });

  const activeShards = shards?.filter(s => s.status === "active").length || 0;
  const totalTps = shards?.reduce((sum, s) => sum + s.tps, 0) || 0;
  const avgLoad = shards?.length ? (shards.reduce((sum, s) => sum + s.load, 0) / shards.length) : 0;
  const totalValidators = shards?.reduce((sum, s) => sum + s.validatorCount, 0) || 0;
  const totalCrossShardTx = shards?.reduce((sum, s) => sum + s.crossShardTxCount, 0) || 0;
  const avgMlScore = shards?.length ? (shards.reduce((sum, s) => sum + s.mlOptimizationScore, 0) / shards.length) : 0;

  const pendingMessages = messages?.filter(m => m.status === 'pending').length || 0;
  const confirmedMessages = messages?.filter(m => m.status === 'confirmed').length || 0;
  const failedMessages = messages?.filter(m => m.status === 'failed').length || 0;

  const filteredShards = useMemo(() => {
    if (!shards) return [];
    return shards.filter(shard => {
      const matchesSearch = shard.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || shard.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [shards, searchQuery, statusFilter]);

  const shardLoadDistribution = useMemo(() => {
    if (!shards) return [];
    return shards.map(shard => ({
      name: shard.name,
      load: shard.load,
      tps: shard.tps,
      validators: shard.validatorCount,
    }));
  }, [shards]);

  const shardStatusDistribution = useMemo(() => {
    if (!shards) return [];
    const active = shards.filter(s => s.status === 'active').length;
    const syncing = shards.filter(s => s.status === 'syncing').length;
    const error = shards.filter(s => s.status === 'error').length;
    return [
      { name: t('common.active'), value: active, color: '#22c55e' },
      { name: t('sharding.syncing'), value: syncing, color: '#eab308' },
      { name: t('common.error'), value: error, color: '#ef4444' },
    ].filter(item => item.value > 0);
  }, [shards, t]);

  const aiRecommendationDistribution = useMemo(() => {
    if (!shards) return [];
    const stable = shards.filter(s => s.aiRecommendation === 'stable').length;
    const split = shards.filter(s => s.aiRecommendation === 'split').length;
    const merge = shards.filter(s => s.aiRecommendation === 'merge').length;
    const rebalance = shards.filter(s => s.aiRecommendation === 'rebalance').length;
    return [
      { name: t('sharding.stable'), value: stable, color: '#22c55e' },
      { name: t('sharding.split'), value: split, color: '#3b82f6' },
      { name: t('sharding.merge'), value: merge, color: '#8b5cf6' },
      { name: t('sharding.rebalance'), value: rebalance, color: '#f59e0b' },
    ].filter(item => item.value > 0);
  }, [shards, t]);

  const crossShardTraffic = useMemo(() => {
    if (!messages || !shards) return [];
    const trafficMap = new Map<string, number>();
    messages.forEach(msg => {
      const key = `${msg.fromShardId}->${msg.toShardId}`;
      trafficMap.set(key, (trafficMap.get(key) || 0) + 1);
    });
    return Array.from(trafficMap.entries())
      .map(([route, count]) => ({ route, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [messages, shards]);

  const messageStatusDistribution = useMemo(() => {
    return [
      { name: t('crossShard.confirmed'), value: confirmedMessages, color: '#22c55e' },
      { name: t('common.pending'), value: pendingMessages, color: '#eab308' },
      { name: t('common.failed'), value: failedMessages, color: '#ef4444' },
    ].filter(item => item.value > 0);
  }, [confirmedMessages, pendingMessages, failedMessages, t]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-600">{t('common.active')}</Badge>;
      case "syncing":
        return <Badge variant="secondary">{t('sharding.syncing')}</Badge>;
      case "error":
        return <Badge variant="destructive">{t('common.error')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getLoadColor = (load: number) => {
    if (load >= 80) return "text-red-600 dark:text-red-400";
    if (load >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  const getLoadBgColor = (load: number) => {
    if (load >= 80) return "bg-red-500";
    if (load >= 60) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case "stable": return "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400";
      case "split": return "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400";
      case "merge": return "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400";
      case "rebalance": return "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400";
      default: return "";
    }
  };

  const getMessageStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />{t('crossShard.confirmed')}</Badge>;
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />{t('common.pending')}</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />{t('common.failed')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDateTime = (dateValue: string | Date) => {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    return date.toLocaleString(i18n.language || 'en');
  };

  const getStatDialogContent = () => {
    if (!selectedStatType || !shards) return null;

    switch (selectedStatType) {
        case 'shards':
          return (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{activeShards}</div>
                    <div className="text-sm text-muted-foreground">{t('sharding.activeShards')}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{shards.length}</div>
                    <div className="text-sm text-muted-foreground">{t('sharding.totalShards')}</div>
                  </CardContent>
                </Card>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={shardStatusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {shardStatusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          );

        case 'tps':
          return (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{formatNumber(totalTps)}</div>
                    <div className="text-sm text-muted-foreground">{t('sharding.combinedTps')}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{formatNumber(Math.max(...shards.map(s => s.tps)))}</div>
                    <div className="text-sm text-muted-foreground">{t('sharding.peakTps')}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{formatNumber(Math.round(totalTps / shards.length))}</div>
                    <div className="text-sm text-muted-foreground">{t('sharding.avgTpsPerShard')}</div>
                  </CardContent>
                </Card>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={shardLoadDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="tps" fill="#3b82f6" name={t('sharding.tps')} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          );

        case 'load':
          return (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{avgLoad.toFixed(1)}%</div>
                    <div className="text-sm text-muted-foreground">{t('sharding.avgLoad')}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{Math.max(...shards.map(s => s.load))}%</div>
                    <div className="text-sm text-muted-foreground">{t('sharding.maxLoad')}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{Math.min(...shards.map(s => s.load))}%</div>
                    <div className="text-sm text-muted-foreground">{t('sharding.minLoad')}</div>
                  </CardContent>
                </Card>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={shardLoadDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="load" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name={t('sharding.load')} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          );

        case 'validators':
          return (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{totalValidators}</div>
                    <div className="text-sm text-muted-foreground">{t('sharding.totalValidators')}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{Math.round(totalValidators / shards.length)}</div>
                    <div className="text-sm text-muted-foreground">{t('sharding.avgPerShard')}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{shards.length}</div>
                    <div className="text-sm text-muted-foreground">{t('sharding.shardCount')}</div>
                  </CardContent>
                </Card>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={shardLoadDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="validators" fill="#8b5cf6" name={t('sharding.validators')} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          );

        case 'crossShard':
          return (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{formatNumber(totalCrossShardTx)}</div>
                    <div className="text-sm text-muted-foreground">{t('sharding.totalCrossShardTx')}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{confirmedMessages}</div>
                    <div className="text-sm text-muted-foreground">{t('crossShard.confirmed')}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{pendingMessages}</div>
                    <div className="text-sm text-muted-foreground">{t('common.pending')}</div>
                  </CardContent>
                </Card>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={messageStatusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {messageStatusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={crossShardTraffic.slice(0, 5)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="route" type="category" width={80} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" name={t('sharding.messageCount')} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          );

      default:
        return null;
    }
  };

  const getStatDialogTitle = () => {
    switch (selectedStatType) {
      case 'shards': return t('sharding.shardAnalytics');
      case 'tps': return t('sharding.tpsAnalytics');
      case 'load': return t('sharding.loadAnalytics');
      case 'validators': return t('sharding.validatorAnalytics');
      case 'crossShard': return t('sharding.crossShardAnalytics');
      default: return '';
    }
  };

  const getStatDialogDescription = () => {
    switch (selectedStatType) {
      case 'shards': return t('sharding.shardAnalyticsDesc');
      case 'tps': return t('sharding.tpsAnalyticsDesc');
      case 'load': return t('sharding.loadAnalyticsDesc');
      case 'validators': return t('sharding.validatorAnalyticsDesc');
      case 'crossShard': return t('sharding.crossShardAnalyticsDesc');
      default: return '';
    }
  };

  const renderShardStatsDialog = () => {
    if (!selectedStatType || !shards) return null;

    return (
      <Dialog open={!!selectedStatType} onOpenChange={(open) => !open && setSelectedStatType(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{getStatDialogTitle()}</DialogTitle>
            <DialogDescription>{getStatDialogDescription()}</DialogDescription>
          </DialogHeader>
          {getStatDialogContent()}
        </DialogContent>
      </Dialog>
    );
  };

  const shardRadarData = useMemo(() => {
    if (!selectedShard) return [];
    return [
      { metric: t('sharding.load'), value: selectedShard.load, fullMark: 100 },
      { metric: t('sharding.mlScore'), value: selectedShard.mlOptimizationScore / 100, fullMark: 100 },
      { metric: t('sharding.profiling'), value: selectedShard.profilingScore / 100, fullMark: 100 },
      { metric: t('sharding.capacity'), value: selectedShard.capacityUtilization / 100, fullMark: 100 },
      { metric: t('sharding.predictedLoad'), value: selectedShard.predictedLoad, fullMark: 100 },
    ];
  }, [selectedShard, t]);

  const renderShardDetailDialog = () => {
    if (!selectedShard) return null;

    return (
      <Dialog open={!!selectedShard} onOpenChange={(open) => !open && setSelectedShard(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              {selectedShard.name}
            </DialogTitle>
            <DialogDescription>{t('sharding.shardDetailDesc')}</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              {getStatusBadge(selectedShard.status)}
              <Badge className={getRecommendationColor(selectedShard.aiRecommendation)}>
                {t(`sharding.${selectedShard.aiRecommendation}`)}
              </Badge>
              <Badge variant="outline">ID: {selectedShard.shardId}</Badge>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-muted-foreground">{t('sharding.tps')}</span>
                  </div>
                  <div className="text-2xl font-bold mt-1">{formatNumber(selectedShard.tps)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-muted-foreground">{t('sharding.load')}</span>
                  </div>
                  <div className={`text-2xl font-bold mt-1 ${getLoadColor(selectedShard.load)}`}>
                    {selectedShard.load}%
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-muted-foreground">{t('sharding.validators')}</span>
                  </div>
                  <div className="text-2xl font-bold mt-1">{selectedShard.validatorCount}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">{t('sharding.blockHeight')}</span>
                  </div>
                  <div className="text-2xl font-bold mt-1">{formatNumber(selectedShard.blockHeight)}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('sharding.performanceRadar')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={shardRadarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="metric" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar
                          name={selectedShard.name}
                          dataKey="value"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.3}
                        />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('sharding.aiMetrics')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Brain className="h-4 w-4 text-purple-500" />
                        {t('sharding.mlOptimization')}
                      </span>
                      <span className="font-semibold">{(selectedShard.mlOptimizationScore / 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={selectedShard.mlOptimizationScore / 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        {t('sharding.predictedLoad')}
                      </span>
                      <span className="font-semibold">{selectedShard.predictedLoad}%</span>
                    </div>
                    <Progress value={selectedShard.predictedLoad} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Activity className="h-4 w-4 text-green-500" />
                        {t('sharding.profiling')}
                      </span>
                      <span className="font-semibold">{(selectedShard.profilingScore / 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={selectedShard.profilingScore / 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Cpu className="h-4 w-4 text-orange-500" />
                        {t('sharding.capacity')}
                      </span>
                      <span className="font-semibold">{(selectedShard.capacityUtilization / 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={selectedShard.capacityUtilization / 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('sharding.additionalInfo')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">{t('common.transactions')}</div>
                    <div className="font-semibold">{formatNumber(selectedShard.transactionCount)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">{t('sharding.crossShardTx')}</div>
                    <div className="font-semibold">{formatNumber(selectedShard.crossShardTxCount)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">{t('sharding.peakTps')}</div>
                    <div className="font-semibold">{formatNumber(selectedShard.peakTps)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">{t('sharding.avgBlockTime')}</div>
                    <div className="font-semibold">{selectedShard.avgBlockTime}ms</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">{t('sharding.rebalanceCount')}</div>
                    <div className="font-semibold">{selectedShard.rebalanceCount}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">{t('sharding.stateSize')}</div>
                    <div className="font-semibold">{formatNumber(parseInt(selectedShard.stateSize) / 1024 / 1024)} MB</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const isLoading = shardsLoading || messagesLoading;

  return (
    <div className="flex flex-col gap-6 p-6">
      {renderShardStatsDialog()}
      {renderShardDetailDialog()}

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold flex items-center gap-2" data-testid="text-sharding-title">
              <Grid3x3 className="h-8 w-8" />
              {t('sharding.title')}
            </h1>
            <TestBadge />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {t('sharding.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Activity className="h-3 w-3 animate-pulse text-green-500" />
            {t('common.live')}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {isLoading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <Card 
              className="hover-elevate cursor-pointer"
              onClick={() => setSelectedStatType('shards')}
              data-testid="card-stat-shards"
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('sharding.activeShards')}</p>
                    <p className="text-2xl font-bold">{activeShards}/{shards?.length || 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t('sharding.networkShards')}</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-500/20">
                    <Layers className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                  <ChevronRight className="h-3 w-3" />
                  {t('aiOrchestration.viewDetails')}
                </div>
              </CardContent>
            </Card>

            <Card 
              className="hover-elevate cursor-pointer"
              onClick={() => setSelectedStatType('tps')}
              data-testid="card-stat-tps"
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('sharding.combinedTps')}</p>
                    <p className="text-2xl font-bold">{formatNumber(totalTps)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t('sharding.transactionsPerSec')}</p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-500/20">
                    <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
                  <ChevronRight className="h-3 w-3" />
                  {t('aiOrchestration.viewDetails')}
                </div>
              </CardContent>
            </Card>

            <Card 
              className="hover-elevate cursor-pointer"
              onClick={() => setSelectedStatType('load')}
              data-testid="card-stat-load"
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('sharding.avgLoad')}</p>
                    <p className={`text-2xl font-bold ${getLoadColor(avgLoad)}`}>{avgLoad.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground mt-1">{t('sharding.acrossShards')}</p>
                  </div>
                  <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-500/20">
                    <Gauge className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs text-orange-600">
                  <ChevronRight className="h-3 w-3" />
                  {t('aiOrchestration.viewDetails')}
                </div>
              </CardContent>
            </Card>

            <Card 
              className="hover-elevate cursor-pointer"
              onClick={() => setSelectedStatType('validators')}
              data-testid="card-stat-validators"
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('sharding.totalValidators')}</p>
                    <p className="text-2xl font-bold">{totalValidators}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t('sharding.distributed')}</p>
                  </div>
                  <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-500/20">
                    <Server className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs text-purple-600">
                  <ChevronRight className="h-3 w-3" />
                  {t('aiOrchestration.viewDetails')}
                </div>
              </CardContent>
            </Card>

            <Card 
              className="hover-elevate cursor-pointer"
              onClick={() => setSelectedStatType('crossShard')}
              data-testid="card-stat-crossshard"
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('sharding.crossShardTx')}</p>
                    <p className="text-2xl font-bold">{formatNumber(totalCrossShardTx)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t('sharding.interShardComm')}</p>
                  </div>
                  <div className="p-3 rounded-full bg-cyan-100 dark:bg-cyan-500/20">
                    <ArrowLeftRight className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs text-cyan-600">
                  <ChevronRight className="h-3 w-3" />
                  {t('aiOrchestration.viewDetails')}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="gap-1" data-testid="tab-overview">
            <Layers className="h-4 w-4" />
            {t('aiOrchestration.overview')}
          </TabsTrigger>
          <TabsTrigger value="shards" className="gap-1" data-testid="tab-shards">
            <Grid3x3 className="h-4 w-4" />
            {t('sharding.shards')}
          </TabsTrigger>
          <TabsTrigger value="crossShard" className="gap-1" data-testid="tab-crossshard">
            <Network className="h-4 w-4" />
            {t('crossShard.title')}
          </TabsTrigger>
          <TabsTrigger value="aiOptimization" className="gap-1" data-testid="tab-ai">
            <Brain className="h-4 w-4" />
            {t('sharding.aiOptimization')}
          </TabsTrigger>
          <TabsTrigger value="liveFeed" className="gap-1" data-testid="tab-live">
            <Activity className="h-4 w-4" />
            {t('aiOrchestration.liveFeed')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {t('sharding.shardLoadDistribution')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-64" />
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={shardLoadDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="load" fill="#f59e0b" name={t('sharding.load')} />
                        <Bar dataKey="tps" fill="#3b82f6" name={t('sharding.tps')} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  {t('sharding.aiRecommendations')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-64" />
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={aiRecommendationDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {aiRecommendationDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('sharding.shardPerformanceDetails')}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : shards && shards.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('sharding.shard')}</TableHead>
                        <TableHead>{t('common.status')}</TableHead>
                        <TableHead>{t('sharding.tps')}</TableHead>
                        <TableHead>{t('sharding.load')}</TableHead>
                        <TableHead>{t('sharding.validators')}</TableHead>
                        <TableHead>{t('sharding.mlOptimization')}</TableHead>
                        <TableHead>{t('sharding.aiRecommendation')}</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {shards.map((shard) => (
                        <TableRow key={shard.id} className="hover-elevate">
                          <TableCell className="font-semibold">{shard.name}</TableCell>
                          <TableCell>{getStatusBadge(shard.status)}</TableCell>
                          <TableCell className="tabular-nums font-medium">{formatNumber(shard.tps)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={shard.load} className="w-16" />
                              <span className={`text-sm tabular-nums ${getLoadColor(shard.load)}`}>
                                {shard.load}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="tabular-nums">{shard.validatorCount}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Brain className="h-3 w-3 text-purple-500" />
                              <span className="text-sm tabular-nums font-medium">
                                {(shard.mlOptimizationScore / 100).toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRecommendationColor(shard.aiRecommendation)}>
                              {t(`sharding.${shard.aiRecommendation}`)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setSelectedShard(shard)}
                              data-testid={`button-view-shard-${shard.shardId}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">{t('sharding.noShardDataAvailable')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shards" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('sharding.searchShards')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-shards"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40" data-testid="select-status-filter">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="active">{t('common.active')}</SelectItem>
                <SelectItem value="syncing">{t('sharding.syncing')}</SelectItem>
                <SelectItem value="error">{t('common.error')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <>
                <Skeleton className="h-56" />
                <Skeleton className="h-56" />
                <Skeleton className="h-56" />
              </>
            ) : filteredShards.length > 0 ? (
              filteredShards.map((shard) => (
                <Card 
                  key={shard.id} 
                  className="hover-elevate cursor-pointer"
                  onClick={() => setSelectedShard(shard)}
                  data-testid={`card-shard-${shard.shardId}`}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-semibold">{shard.name}</CardTitle>
                    {getStatusBadge(shard.status)}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('sharding.blockHeight')}</span>
                        <span className="font-semibold font-mono tabular-nums">
                          #{formatNumber(shard.blockHeight)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('sharding.tps')}</span>
                        <span className="font-semibold tabular-nums">{formatNumber(shard.tps)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('sharding.validators')}</span>
                        <span className="font-semibold tabular-nums">{shard.validatorCount}</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span>{t('sharding.shardLoad')}</span>
                        <span className={`font-semibold ${getLoadColor(shard.load)}`}>{shard.load}%</span>
                      </div>
                      <Progress value={shard.load} className="h-2" />
                    </div>

                    <div className="pt-3 border-t grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1 text-xs">
                        <Brain className="h-3 w-3 text-purple-500" />
                        <span className="text-muted-foreground">{t('sharding.mlScore')}:</span>
                        <span className="font-semibold">{(shard.mlOptimizationScore / 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <TrendingUp className="h-3 w-3 text-blue-500" />
                        <span className="text-muted-foreground">{t('sharding.predicted')}:</span>
                        <span className="font-semibold">{shard.predictedLoad}%</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">ID: {shard.shardId}</Badge>
                      <Badge className={`text-xs ${getRecommendationColor(shard.aiRecommendation)}`}>
                        {t(`sharding.${shard.aiRecommendation}`)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-muted-foreground">{t('sharding.noShardsConfigured')}</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="crossShard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-muted-foreground">{t('common.pending')}</span>
                </div>
                <div className="text-2xl font-bold mt-1">{pendingMessages}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">{t('crossShard.confirmed')}</span>
                </div>
                <div className="text-2xl font-bold mt-1">{confirmedMessages}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-muted-foreground">{t('common.failed')}</span>
                </div>
                <div className="text-2xl font-bold mt-1">{failedMessages}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <ArrowLeftRight className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">{t('sharding.totalMessages')}</span>
                </div>
                <div className="text-2xl font-bold mt-1">{messages?.length || 0}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('sharding.messageStatusDistribution')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={messageStatusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {messageStatusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('sharding.topRoutes')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={crossShardTraffic.slice(0, 5)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="route" type="category" width={80} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" name={t('sharding.messageCount')} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5" />
                {t('crossShard.messageQueue')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {messagesLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : messages && messages.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('crossShard.fromTo')}</TableHead>
                        <TableHead>{t('common.type')}</TableHead>
                        <TableHead>{t('common.status')}</TableHead>
                        <TableHead>{t('crossShard.retryCount')}</TableHead>
                        <TableHead>{t('common.gasUsed')}</TableHead>
                        <TableHead>{t('crossShard.timestamp')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {messages.slice(0, 10).map((message) => (
                        <TableRow key={message.id} className="hover-elevate">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">S{message.fromShardId}</Badge>
                              <ArrowLeftRight className="h-3 w-3 text-muted-foreground" />
                              <Badge variant="outline" className="text-xs">S{message.toShardId}</Badge>
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">{message.messageType}</TableCell>
                          <TableCell>{getMessageStatusBadge(message.status)}</TableCell>
                          <TableCell className="tabular-nums">{message.retryCount}</TableCell>
                          <TableCell className="tabular-nums">{formatNumber(Number(message.gasUsed))}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {formatDateTime(message.sentAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">{t('crossShard.noCrossShardMessages')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aiOptimization" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-muted-foreground">{t('sharding.avgMlScore')}</span>
                </div>
                <div className="text-2xl font-bold mt-1">{(avgMlScore / 100).toFixed(1)}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">{t('sharding.totalRebalances')}</span>
                </div>
                <div className="text-2xl font-bold mt-1">
                  {shards?.reduce((sum, s) => sum + s.rebalanceCount, 0) || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-muted-foreground">{t('sharding.actionRequired')}</span>
                </div>
                <div className="text-2xl font-bold mt-1">
                  {shards?.filter(s => s.aiRecommendation !== 'stable').length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                {t('sharding.aiRecommendationsDetail')}
              </CardTitle>
              <CardDescription>{t('sharding.aiRecommendationsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : shards && shards.length > 0 ? (
                <div className="space-y-4">
                  {shards.map((shard) => (
                    <div
                      key={shard.id}
                      className={`p-4 rounded-lg border ${
                        shard.aiRecommendation === 'stable' 
                          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                          : shard.aiRecommendation === 'rebalance'
                          ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20'
                          : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                      }`}
                      data-testid={`ai-recommendation-${shard.shardId}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="font-semibold">{shard.name}</div>
                          <Badge className={getRecommendationColor(shard.aiRecommendation)}>
                            {t(`sharding.${shard.aiRecommendation}`)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">{t('sharding.currentLoad')}:</span>
                            <span className={`ml-1 font-semibold ${getLoadColor(shard.load)}`}>{shard.load}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t('sharding.predictedLoad')}:</span>
                            <span className={`ml-1 font-semibold ${getLoadColor(shard.predictedLoad)}`}>{shard.predictedLoad}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t('sharding.mlScore')}:</span>
                            <span className="ml-1 font-semibold">{(shard.mlOptimizationScore / 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                      {shard.aiRecommendation !== 'stable' && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          {t(`sharding.recommendation${shard.aiRecommendation.charAt(0).toUpperCase() + shard.aiRecommendation.slice(1)}Desc`)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">{t('sharding.noShardDataAvailable')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="liveFeed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 animate-pulse text-green-500" />
                {t('sharding.liveShardEvents')}
              </CardTitle>
              <CardDescription>{t('sharding.liveShardEventsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {messages?.slice(0, 20).map((message, index) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg border ${
                        message.status === 'confirmed'
                          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                          : message.status === 'failed'
                          ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                          : 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
                      }`}
                      data-testid={`live-event-${index}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {message.status === 'confirmed' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : message.status === 'failed' ? (
                            <XCircle className="h-5 w-5 text-red-500" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-500" />
                          )}
                          <div>
                            <div className="font-medium">
                              {t('crossShard.messageRoute', { 
                                from: message.fromShardId, 
                                to: message.toShardId 
                              })}
                            </div>
                            <div className="text-sm text-muted-foreground capitalize">
                              {message.messageType}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {getMessageStatusBadge(message.status)}
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatDateTime(message.sentAt)}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{t('common.gasUsed')}: {formatNumber(Number(message.gasUsed))}</span>
                        <span>{t('crossShard.routingPriority')}: {message.routingPriority}</span>
                        <span className="font-mono">{message.transactionHash.slice(0, 16)}...</span>
                      </div>
                    </div>
                  ))}
                  {(!messages || messages.length === 0) && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">{t('sharding.noLiveEvents')}</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
