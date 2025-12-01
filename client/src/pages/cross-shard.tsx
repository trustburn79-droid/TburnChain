import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { 
  Network, ArrowRightLeft, Clock, CheckCircle, XCircle, AlertCircle, 
  Activity, TrendingUp, Zap, BarChart3, PieChart as PieChartIcon, 
  Gauge, Timer, Hash, Eye, ChevronRight, Search, Filter, Layers,
  ArrowUpRight, ArrowDownRight, RefreshCw, Shield, Database, Server,
  Radio, GitBranch, Workflow, Target, Send, Inbox
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
import type { CrossShardMessage, Shard } from "@shared/schema";
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
  Sankey,
  Treemap,
} from "recharts";

type StatType = 'pending' | 'confirmed' | 'failed' | 'gas' | 'latency' | null;

const CHART_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#84CC16'];
const STATUS_COLORS = {
  confirmed: '#10B981',
  pending: '#F59E0B',
  failed: '#EF4444',
};

const localeMap: Record<string, string> = {
  en: 'en-US', zh: 'zh-CN', ja: 'ja-JP', hi: 'hi-IN', es: 'es-ES',
  fr: 'fr-FR', ar: 'ar-SA', bn: 'bn-BD', ru: 'ru-RU', pt: 'pt-BR', ur: 'ur-PK', ko: 'ko-KR',
};

export default function CrossShard() {
  const { t, i18n } = useTranslation();
  const [selectedStatType, setSelectedStatType] = useState<StatType>(null);
  const [selectedMessage, setSelectedMessage] = useState<CrossShardMessage | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: messages, isLoading: messagesLoading } = useQuery<CrossShardMessage[]>({
    queryKey: ["/api/cross-shard/messages"],
  });

  const { data: shards, isLoading: shardsLoading } = useQuery<Shard[]>({
    queryKey: ["/api/shards"],
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

  const pendingMessages = messages?.filter(m => m.status === 'pending').length || 0;
  const confirmedMessages = messages?.filter(m => m.status === 'confirmed').length || 0;
  const failedMessages = messages?.filter(m => m.status === 'failed').length || 0;
  const totalMessages = messages?.length || 0;
  const totalGasUsed = messages?.reduce((sum, m) => sum + Number(m.gasUsed), 0) || 0;
  const avgGasPerMessage = totalMessages > 0 ? Math.round(totalGasUsed / totalMessages) : 0;
  const successRate = totalMessages > 0 ? ((confirmedMessages / totalMessages) * 100).toFixed(1) : '0';

  const avgLatency = useMemo(() => {
    if (!messages || messages.length === 0) return 0;
    const latencies = messages.map(m => {
      const sent = new Date(m.sentAt).getTime();
      const confirmed = m.confirmedAt ? new Date(m.confirmedAt).getTime() : sent;
      return confirmed - sent;
    });
    return Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
  }, [messages]);

  const filteredMessages = useMemo(() => {
    if (!messages) return [];
    return messages.filter(m => {
      const matchesSearch = searchQuery === '' || 
        m.transactionHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.messageType.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
      const matchesType = typeFilter === 'all' || m.messageType === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [messages, searchQuery, statusFilter, typeFilter]);

  const statusDistribution = useMemo(() => {
    return [
      { name: t('crossShard.confirmed'), value: confirmedMessages, color: STATUS_COLORS.confirmed },
      { name: t('common.pending'), value: pendingMessages, color: STATUS_COLORS.pending },
      { name: t('common.failed'), value: failedMessages, color: STATUS_COLORS.failed },
    ];
  }, [confirmedMessages, pendingMessages, failedMessages, t]);

  const messageTypeDistribution = useMemo(() => {
    if (!messages) return [];
    const types: Record<string, number> = {};
    messages.forEach(m => {
      types[m.messageType] = (types[m.messageType] || 0) + 1;
    });
    return Object.entries(types).map(([name, value], idx) => ({
      name: getMessageTypeLabel(name),
      value,
      color: CHART_COLORS[idx % CHART_COLORS.length],
    }));
  }, [messages, t]);

  const hourlyTrend = useMemo(() => {
    if (!messages) return [];
    const now = Date.now();
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: `${23 - i}h`,
      confirmed: 0,
      pending: 0,
      failed: 0,
    })).reverse();
    
    messages.forEach(m => {
      const msgTime = new Date(m.sentAt).getTime();
      const hoursAgo = Math.floor((now - msgTime) / (1000 * 60 * 60));
      if (hoursAgo >= 0 && hoursAgo < 24) {
        const idx = 23 - hoursAgo;
        if (m.status === 'confirmed') hours[idx].confirmed++;
        else if (m.status === 'pending') hours[idx].pending++;
        else hours[idx].failed++;
      }
    });
    return hours;
  }, [messages]);

  const shardFlowMatrix = useMemo(() => {
    if (!messages || !shards) return [];
    const flows: Record<string, { from: number; to: number; count: number; gas: number }> = {};
    messages.forEach(m => {
      const key = `${m.fromShardId}-${m.toShardId}`;
      if (!flows[key]) {
        flows[key] = { from: m.fromShardId, to: m.toShardId, count: 0, gas: 0 };
      }
      flows[key].count++;
      flows[key].gas += Number(m.gasUsed);
    });
    return Object.values(flows).sort((a, b) => b.count - a.count);
  }, [messages, shards]);

  const latencyByType = useMemo(() => {
    if (!messages) return [];
    const typeLatencies: Record<string, { total: number; count: number }> = {};
    messages.forEach(m => {
      if (!typeLatencies[m.messageType]) {
        typeLatencies[m.messageType] = { total: 0, count: 0 };
      }
      const sent = new Date(m.sentAt).getTime();
      const confirmed = m.confirmedAt ? new Date(m.confirmedAt).getTime() : sent;
      typeLatencies[m.messageType].total += (confirmed - sent);
      typeLatencies[m.messageType].count++;
    });
    return Object.entries(typeLatencies).map(([type, data]) => ({
      type: getMessageTypeLabel(type),
      avgLatency: Math.round(data.total / data.count),
      count: data.count,
    }));
  }, [messages, t]);

  const protocolMetrics = useMemo(() => {
    if (!messages) return [];
    const retryStats = messages.reduce((acc, m) => {
      if (m.retryCount > 0) acc.retried++;
      acc.totalRetries += m.retryCount;
      return acc;
    }, { retried: 0, totalRetries: 0 });

    return [
      { metric: t('crossShard.protocol.successRate'), value: parseFloat(successRate), max: 100 },
      { metric: t('crossShard.protocol.avgLatency'), value: avgLatency, max: 5000 },
      { metric: t('crossShard.protocol.retryRate'), value: totalMessages > 0 ? (retryStats.retried / totalMessages * 100) : 0, max: 100 },
      { metric: t('crossShard.protocol.throughput'), value: Math.min(totalMessages, 100), max: 100 },
      { metric: t('crossShard.protocol.gasEfficiency'), value: avgGasPerMessage > 0 ? Math.min(100, 50000 / avgGasPerMessage * 100) : 0, max: 100 },
    ];
  }, [messages, successRate, avgLatency, totalMessages, avgGasPerMessage, t]);

  const getStatusBadge = (status: string) => {
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

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case "transfer": return "text-blue-600 dark:text-blue-400";
      case "contract_call": return "text-purple-600 dark:text-purple-400";
      case "state_sync": return "text-green-600 dark:text-green-400";
      default: return "text-gray-600 dark:text-gray-400";
    }
  };

  function getMessageTypeLabel(type: string) {
    const typeMap: Record<string, string> = {
      transfer: t('crossShard.messageTypes.transfer'),
      contract_call: t('crossShard.messageTypes.contractCall'),
      state_sync: t('crossShard.messageTypes.stateSync'),
    };
    return typeMap[type] || type;
  }

  const getShardStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      active: t('common.active'),
      syncing: t('crossShard.syncing'),
      inactive: t('common.inactive'),
    };
    return statusMap[status] || status;
  };

  const formatDateTime = (dateValue: string | Date) => {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    const locale = localeMap[i18n.language] || 'en-US';
    return date.toLocaleString(locale);
  };

  const formatLatency = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const renderStatDialog = () => {
    if (!selectedStatType) return null;

    const dialogContent: Record<NonNullable<StatType>, { title: string; description: string; content: JSX.Element }> = {
      pending: {
        title: t('crossShard.pendingMessages'),
        description: t('crossShard.pendingAnalyticsDesc'),
        content: (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Card><CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-yellow-500">{pendingMessages}</div>
                <div className="text-sm text-muted-foreground">{t('crossShard.inQueue')}</div>
              </CardContent></Card>
              <Card><CardContent className="p-4 text-center">
                <div className="text-3xl font-bold">{formatLatency(avgLatency)}</div>
                <div className="text-sm text-muted-foreground">{t('crossShard.avgWaitTime')}</div>
              </CardContent></Card>
              <Card><CardContent className="p-4 text-center">
                <div className="text-3xl font-bold">{messages?.filter(m => m.status === 'pending' && m.retryCount > 0).length || 0}</div>
                <div className="text-sm text-muted-foreground">{t('crossShard.retrying')}</div>
              </CardContent></Card>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="hour" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', color: '#000000' }} itemStyle={{ color: '#000000' }} labelStyle={{ color: '#000000' }} />
                  <Area type="monotone" dataKey="pending" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} name={t('common.pending')} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ),
      },
      confirmed: {
        title: t('crossShard.confirmedMessages'),
        description: t('crossShard.confirmedAnalyticsDesc'),
        content: (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Card><CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-green-500">{confirmedMessages}</div>
                <div className="text-sm text-muted-foreground">{t('crossShard.totalConfirmed')}</div>
              </CardContent></Card>
              <Card><CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-green-500">{successRate}%</div>
                <div className="text-sm text-muted-foreground">{t('crossShard.successRate')}</div>
              </CardContent></Card>
              <Card><CardContent className="p-4 text-center">
                <div className="text-3xl font-bold">{formatNumber(messages?.filter(m => m.status === 'confirmed').reduce((s, m) => s + Number(m.gasUsed), 0) || 0)}</div>
                <div className="text-sm text-muted-foreground">{t('crossShard.gasConsumed')}</div>
              </CardContent></Card>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="hour" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', color: '#000000' }} itemStyle={{ color: '#000000' }} labelStyle={{ color: '#000000' }} />
                  <Bar dataKey="confirmed" fill="#10B981" name={t('crossShard.confirmed')} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ),
      },
      failed: {
        title: t('crossShard.failedMessages'),
        description: t('crossShard.failedAnalyticsDesc'),
        content: (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Card><CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-red-500">{failedMessages}</div>
                <div className="text-sm text-muted-foreground">{t('crossShard.totalFailed')}</div>
              </CardContent></Card>
              <Card><CardContent className="p-4 text-center">
                <div className="text-3xl font-bold">{totalMessages > 0 ? ((failedMessages / totalMessages) * 100).toFixed(1) : 0}%</div>
                <div className="text-sm text-muted-foreground">{t('crossShard.failureRate')}</div>
              </CardContent></Card>
              <Card><CardContent className="p-4 text-center">
                <div className="text-3xl font-bold">{messages?.filter(m => m.status === 'failed').reduce((s, m) => s + m.retryCount, 0) || 0}</div>
                <div className="text-sm text-muted-foreground">{t('crossShard.totalRetries')}</div>
              </CardContent></Card>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="hour" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', color: '#000000' }} itemStyle={{ color: '#000000' }} labelStyle={{ color: '#000000' }} />
                  <Line type="monotone" dataKey="failed" stroke="#EF4444" strokeWidth={2} dot={false} name={t('common.failed')} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ),
      },
      gas: {
        title: t('crossShard.gasAnalytics'),
        description: t('crossShard.gasAnalyticsDesc'),
        content: (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Card><CardContent className="p-4 text-center">
                <div className="text-3xl font-bold">{formatNumber(totalGasUsed)}</div>
                <div className="text-sm text-muted-foreground">{t('crossShard.totalGasUsed')}</div>
              </CardContent></Card>
              <Card><CardContent className="p-4 text-center">
                <div className="text-3xl font-bold">{formatNumber(avgGasPerMessage)}</div>
                <div className="text-sm text-muted-foreground">{t('crossShard.avgGasPerMsg')}</div>
              </CardContent></Card>
              <Card><CardContent className="p-4 text-center">
                <div className="text-3xl font-bold">{formatNumber(Math.max(...(messages?.map(m => Number(m.gasUsed)) || [0])))}</div>
                <div className="text-sm text-muted-foreground">{t('crossShard.maxGas')}</div>
              </CardContent></Card>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={latencyByType}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="type" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', color: '#000000' }} itemStyle={{ color: '#000000' }} labelStyle={{ color: '#000000' }} />
                  <Bar dataKey="count" fill="#3B82F6" name={t('crossShard.messageCount')} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ),
      },
      latency: {
        title: t('crossShard.latencyAnalytics'),
        description: t('crossShard.latencyAnalyticsDesc'),
        content: (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Card><CardContent className="p-4 text-center">
                <div className="text-3xl font-bold">{formatLatency(avgLatency)}</div>
                <div className="text-sm text-muted-foreground">{t('crossShard.avgLatency')}</div>
              </CardContent></Card>
              <Card><CardContent className="p-4 text-center">
                <div className="text-3xl font-bold">{formatLatency(Math.min(...(messages?.filter(m => m.confirmedAt).map(m => new Date(m.confirmedAt!).getTime() - new Date(m.sentAt).getTime()) || [0])))}</div>
                <div className="text-sm text-muted-foreground">{t('crossShard.minLatency')}</div>
              </CardContent></Card>
              <Card><CardContent className="p-4 text-center">
                <div className="text-3xl font-bold">{formatLatency(Math.max(...(messages?.filter(m => m.confirmedAt).map(m => new Date(m.confirmedAt!).getTime() - new Date(m.sentAt).getTime()) || [0])))}</div>
                <div className="text-sm text-muted-foreground">{t('crossShard.maxLatency')}</div>
              </CardContent></Card>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={latencyByType} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="type" type="category" className="text-xs" width={100} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', color: '#000000' }} itemStyle={{ color: '#000000' }} labelStyle={{ color: '#000000' }} formatter={(value: number) => formatLatency(value)} />
                  <Bar dataKey="avgLatency" fill="#8B5CF6" name={t('crossShard.avgLatency')} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ),
      },
    };

    const content = selectedStatType ? dialogContent[selectedStatType] : null;
    if (!content) return null;

    return (
      <Dialog open={!!selectedStatType} onOpenChange={() => setSelectedStatType(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{content.title}</DialogTitle>
            <DialogDescription>{content.description}</DialogDescription>
          </DialogHeader>
          {content.content}
        </DialogContent>
      </Dialog>
    );
  };

  const renderMessageDetailDialog = () => {
    if (!selectedMessage) return null;
    const latency = selectedMessage.confirmedAt 
      ? new Date(selectedMessage.confirmedAt).getTime() - new Date(selectedMessage.sentAt).getTime()
      : null;
    
    const payloadStr = selectedMessage.payload 
      ? (typeof selectedMessage.payload === 'string' 
          ? selectedMessage.payload 
          : JSON.stringify(selectedMessage.payload, null, 2))
      : null;
    
    const payloadSize = payloadStr ? payloadStr.length : 0;

    return (
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              {t('crossShard.messageDetails')}
            </DialogTitle>
            <DialogDescription>{t('crossShard.messageDetailsDesc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <Badge variant="outline" className="text-lg px-4 py-2">{t('crossShard.shard')} {selectedMessage.fromShardId}</Badge>
                  <div className="text-xs text-muted-foreground mt-1">{t('crossShard.source')}</div>
                </div>
                <div className="flex flex-col items-center">
                  <ArrowRightLeft className="h-6 w-6 text-primary" />
                  <div className="text-xs text-muted-foreground">{getMessageTypeLabel(selectedMessage.messageType)}</div>
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="text-lg px-4 py-2">{t('crossShard.shard')} {selectedMessage.toShardId}</Badge>
                  <div className="text-xs text-muted-foreground mt-1">{t('crossShard.destination')}</div>
                </div>
              </div>
              {getStatusBadge(selectedMessage.status)}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card><CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{t('crossShard.transactionHash')}</div>
                <div className="font-mono text-sm break-all mt-1">{selectedMessage.transactionHash}</div>
              </CardContent></Card>
              <Card><CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{t('common.gasUsed')}</div>
                <div className="text-2xl font-bold mt-1">{formatNumber(Number(selectedMessage.gasUsed))}</div>
              </CardContent></Card>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Card><CardContent className="p-4 text-center">
                <Timer className="h-5 w-5 mx-auto text-muted-foreground" />
                <div className="text-sm text-muted-foreground mt-1">{t('crossShard.latency')}</div>
                <div className="text-xl font-bold">{latency ? formatLatency(latency) : '-'}</div>
              </CardContent></Card>
              <Card><CardContent className="p-4 text-center">
                <RefreshCw className="h-5 w-5 mx-auto text-muted-foreground" />
                <div className="text-sm text-muted-foreground mt-1">{t('crossShard.retryCount')}</div>
                <div className="text-xl font-bold">{selectedMessage.retryCount}</div>
              </CardContent></Card>
              <Card><CardContent className="p-4 text-center">
                <Database className="h-5 w-5 mx-auto text-muted-foreground" />
                <div className="text-sm text-muted-foreground mt-1">{t('crossShard.payloadSize')}</div>
                <div className="text-xl font-bold">{payloadSize} B</div>
              </CardContent></Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t('crossShard.timeline')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{t('crossShard.messageSent')}</div>
                      <div className="text-xs text-muted-foreground">{formatDateTime(selectedMessage.sentAt)}</div>
                    </div>
                  </div>
                  {selectedMessage.confirmedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{t('crossShard.messageConfirmed')}</div>
                        <div className="text-xs text-muted-foreground">{formatDateTime(selectedMessage.confirmedAt)}</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {payloadStr && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{t('crossShard.payload')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto font-mono">
                    {payloadStr}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {messagesLoading ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32" />)
        ) : (
          <>
            <Card className="hover-elevate cursor-pointer" onClick={() => setSelectedStatType('pending')} data-testid="stat-pending">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <Badge variant="secondary">{t('common.pending')}</Badge>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-bold">{formatNumber(pendingMessages)}</div>
                  <div className="text-sm text-muted-foreground">{t('crossShard.awaitingConfirmation')}</div>
                </div>
                <div className="mt-2 flex items-center text-xs text-muted-foreground">
                  <Eye className="h-3 w-3 mr-1" />
                  {t('common.clickForDetails')}
                </div>
              </CardContent>
            </Card>
            <Card className="hover-elevate cursor-pointer" onClick={() => setSelectedStatType('confirmed')} data-testid="stat-confirmed">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <Badge className="bg-green-600">{successRate}%</Badge>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-bold">{formatNumber(confirmedMessages)}</div>
                  <div className="text-sm text-muted-foreground">{t('crossShard.successfulTransfers')}</div>
                </div>
                <div className="mt-2 flex items-center text-xs text-muted-foreground">
                  <Eye className="h-3 w-3 mr-1" />
                  {t('common.clickForDetails')}
                </div>
              </CardContent>
            </Card>
            <Card className="hover-elevate cursor-pointer" onClick={() => setSelectedStatType('failed')} data-testid="stat-failed">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <Badge variant="destructive">{failedMessages}</Badge>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-bold">{formatNumber(failedMessages)}</div>
                  <div className="text-sm text-muted-foreground">{t('crossShard.retryOrInvestigate')}</div>
                </div>
                <div className="mt-2 flex items-center text-xs text-muted-foreground">
                  <Eye className="h-3 w-3 mr-1" />
                  {t('common.clickForDetails')}
                </div>
              </CardContent>
            </Card>
            <Card className="hover-elevate cursor-pointer" onClick={() => setSelectedStatType('gas')} data-testid="stat-gas">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Zap className="h-5 w-5 text-blue-500" />
                  <Badge variant="outline">{t('crossShard.gas')}</Badge>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-bold">{formatNumber(totalGasUsed)}</div>
                  <div className="text-sm text-muted-foreground">{t('crossShard.totalGasUsed')}</div>
                </div>
                <div className="mt-2 flex items-center text-xs text-muted-foreground">
                  <Eye className="h-3 w-3 mr-1" />
                  {t('common.clickForDetails')}
                </div>
              </CardContent>
            </Card>
            <Card className="hover-elevate cursor-pointer" onClick={() => setSelectedStatType('latency')} data-testid="stat-latency">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Timer className="h-5 w-5 text-purple-500" />
                  <Badge variant="outline">{t('crossShard.latency')}</Badge>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-bold">{formatLatency(avgLatency)}</div>
                  <div className="text-sm text-muted-foreground">{t('crossShard.avgConfirmationTime')}</div>
                </div>
                <div className="mt-2 flex items-center text-xs text-muted-foreground">
                  <Eye className="h-3 w-3 mr-1" />
                  {t('common.clickForDetails')}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              {t('crossShard.statusDistribution')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', color: '#000000' }} itemStyle={{ color: '#000000' }} labelStyle={{ color: '#000000' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t('crossShard.hourlyTrend')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="hour" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', color: '#000000' }} itemStyle={{ color: '#000000' }} labelStyle={{ color: '#000000' }} />
                  <Legend />
                  <Area type="monotone" dataKey="confirmed" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name={t('crossShard.confirmed')} />
                  <Area type="monotone" dataKey="pending" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} name={t('common.pending')} />
                  <Area type="monotone" dataKey="failed" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} name={t('common.failed')} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('crossShard.shardTopology')}</CardTitle>
          <CardDescription>{t('crossShard.shardNetworkArchitecture', { count: shards?.length || 0 })}</CardDescription>
        </CardHeader>
        <CardContent>
          {shardsLoading ? (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-32" />)}
            </div>
          ) : shards && shards.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
              {shards.map((shard) => (
                <Card key={shard.id} className="hover-elevate" data-testid={`card-shard-${shard.shardId}`}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{shard.name}</div>
                      <Badge variant={shard.status === 'active' ? 'default' : shard.status === 'syncing' ? 'secondary' : 'destructive'} className="text-xs">
                        {getShardStatusLabel(shard.status)}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold tabular-nums">{formatNumber(shard.tps)}</div>
                    <div className="text-xs text-muted-foreground">{t('sharding.tps')}</div>
                    <Progress value={shard.load} className="h-1" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{t('sharding.load')}: {shard.load}%</span>
                      <span>{shard.validatorCount} {t('sharding.validators')}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('sharding.noShardDataAvailable')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderMessageAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('crossShard.searchMessages')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]" data-testid="select-status">
            <SelectValue placeholder={t('common.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="confirmed">{t('crossShard.confirmed')}</SelectItem>
            <SelectItem value="pending">{t('common.pending')}</SelectItem>
            <SelectItem value="failed">{t('common.failed')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px]" data-testid="select-type">
            <SelectValue placeholder={t('common.type')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="transfer">{t('crossShard.messageTypes.transfer')}</SelectItem>
            <SelectItem value="contract_call">{t('crossShard.messageTypes.contractCall')}</SelectItem>
            <SelectItem value="state_sync">{t('crossShard.messageTypes.stateSync')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('crossShard.messageTypeBreakdown')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={messageTypeDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {messageTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', color: '#000000' }} itemStyle={{ color: '#000000' }} labelStyle={{ color: '#000000' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('crossShard.latencyByType')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={latencyByType}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="type" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', color: '#000000' }} itemStyle={{ color: '#000000' }} labelStyle={{ color: '#000000' }}
                    formatter={(value: number) => formatLatency(value)}
                  />
                  <Bar dataKey="avgLatency" fill="#8B5CF6" name={t('crossShard.avgLatency')} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            {t('crossShard.messageQueue')}
          </CardTitle>
          <CardDescription>
            {t('crossShard.showingMessages', { count: filteredMessages.length, total: messages?.length || 0 })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {messagesLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : filteredMessages.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('crossShard.fromTo')}</TableHead>
                    <TableHead>{t('common.type')}</TableHead>
                    <TableHead>{t('crossShard.transactionHash')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead>{t('crossShard.latency')}</TableHead>
                    <TableHead>{t('common.gasUsed')}</TableHead>
                    <TableHead>{t('crossShard.timestamp')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.slice(0, 20).map((message) => {
                    const latency = message.confirmedAt 
                      ? new Date(message.confirmedAt).getTime() - new Date(message.sentAt).getTime()
                      : null;
                    return (
                      <TableRow 
                        key={message.id} 
                        className="hover-elevate cursor-pointer" 
                        onClick={() => setSelectedMessage(message)}
                        data-testid={`row-message-${message.id}`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2 font-medium">
                            <Badge variant="outline" className="text-xs">{message.fromShardId}</Badge>
                            <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                            <Badge variant="outline" className="text-xs">{message.toShardId}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${getMessageTypeColor(message.messageType)}`}>
                            {getMessageTypeLabel(message.messageType)}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs" title={message.transactionHash}>
                          {message.transactionHash.slice(0, 10)}...{message.transactionHash.slice(-6)}
                        </TableCell>
                        <TableCell>{getStatusBadge(message.status)}</TableCell>
                        <TableCell className="tabular-nums">{latency ? formatLatency(latency) : '-'}</TableCell>
                        <TableCell className="tabular-nums">{formatNumber(Number(message.gasUsed))}</TableCell>
                        <TableCell className="text-muted-foreground text-sm tabular-nums">
                          {formatDateTime(message.sentAt)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('crossShard.noMessagesFound')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderShardMatrixTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            {t('crossShard.shardFlowMatrix')}
          </CardTitle>
          <CardDescription>{t('crossShard.shardFlowDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {shardFlowMatrix.length > 0 ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {shardFlowMatrix.slice(0, 9).map((flow, idx) => (
                  <Card key={idx} className="hover-elevate">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{t('crossShard.shard')} {flow.from}</Badge>
                          <ArrowRightLeft className="h-4 w-4" />
                          <Badge variant="outline">{t('crossShard.shard')} {flow.to}</Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-2xl font-bold">{flow.count}</div>
                          <div className="text-xs text-muted-foreground">{t('crossShard.messages')}</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{formatNumber(flow.gas)}</div>
                          <div className="text-xs text-muted-foreground">{t('crossShard.gas')}</div>
                        </div>
                      </div>
                      <Progress value={(flow.count / (shardFlowMatrix[0]?.count || 1)) * 100} className="mt-3 h-1" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('crossShard.noFlowData')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('crossShard.messageDistribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shardFlowMatrix.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis 
                    dataKey={(d) => `${d.from}→${d.to}`} 
                    type="category" 
                    className="text-xs" 
                    width={60}
                  />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', color: '#000000' }} itemStyle={{ color: '#000000' }} labelStyle={{ color: '#000000' }} />
                  <Bar dataKey="count" fill="#3B82F6" name={t('crossShard.messageCount')} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('crossShard.gasByRoute')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shardFlowMatrix.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis 
                    dataKey={(d) => `${d.from}→${d.to}`} 
                    type="category" 
                    className="text-xs" 
                    width={60}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', color: '#000000' }} itemStyle={{ color: '#000000' }} labelStyle={{ color: '#000000' }}
                    formatter={(value: number) => formatNumber(value)}
                  />
                  <Bar dataKey="gas" fill="#8B5CF6" name={t('crossShard.gasUsed')} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderProtocolTab = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Shield className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{t('crossShard.protocol.twoPhaseCommit')}</div>
                <div className="text-xl font-bold text-green-500">{t('common.active')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Workflow className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{t('crossShard.protocol.atomicExecution')}</div>
                <div className="text-xl font-bold">{t('common.enabled')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Target className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{t('crossShard.protocol.maxRetries')}</div>
                <div className="text-xl font-bold">3</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Timer className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{t('crossShard.protocol.timeout')}</div>
                <div className="text-xl font-bold">30s</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('crossShard.protocolPerformance')}</CardTitle>
          <CardDescription>{t('crossShard.protocolPerformanceDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={protocolMetrics}>
                <PolarGrid className="stroke-muted" />
                <PolarAngleAxis dataKey="metric" className="text-xs" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} className="text-xs" />
                <Radar
                  name={t('crossShard.performance')}
                  dataKey="value"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.5}
                />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', color: '#000000' }} itemStyle={{ color: '#000000' }} labelStyle={{ color: '#000000' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('crossShard.protocolStats')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {protocolMetrics.map((metric, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{metric.metric}</span>
                    <span className="font-medium">{metric.value.toFixed(1)}%</span>
                  </div>
                  <Progress value={(metric.value / metric.max) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('crossShard.retryAnalysis')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-3xl font-bold">{messages?.filter(m => m.retryCount === 0).length || 0}</div>
                  <div className="text-sm text-muted-foreground">{t('crossShard.noRetries')}</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-3xl font-bold">{messages?.filter(m => m.retryCount > 0).length || 0}</div>
                  <div className="text-sm text-muted-foreground">{t('crossShard.withRetries')}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map(retryNum => (
                  <div key={retryNum} className="text-center p-3 border rounded-lg">
                    <div className="text-xl font-bold">{messages?.filter(m => m.retryCount === retryNum).length || 0}</div>
                    <div className="text-xs text-muted-foreground">{retryNum} {t('crossShard.retries')}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderLiveFeedTab = () => {
    const recentMessages = messages?.slice(0, 20) || [];
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">{t('crossShard.liveUpdates')}</span>
          </div>
          <Badge variant="outline">{recentMessages.length} {t('crossShard.recentMessages')}</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-green-500/20 bg-green-500/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Inbox className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{confirmedMessages}</div>
                <div className="text-sm text-muted-foreground">{t('crossShard.deliveredNow')}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-yellow-500/20 bg-yellow-500/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <Send className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{pendingMessages}</div>
                <div className="text-sm text-muted-foreground">{t('crossShard.inTransit')}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Activity className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{formatNumber(totalMessages)}</div>
                <div className="text-sm text-muted-foreground">{t('crossShard.totalProcessed')}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-green-500 animate-pulse" />
              {t('crossShard.liveMessageStream')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {recentMessages.map((message, idx) => {
                  const latency = message.confirmedAt 
                    ? new Date(message.confirmedAt).getTime() - new Date(message.sentAt).getTime()
                    : null;
                  return (
                    <Card 
                      key={message.id} 
                      className="hover-elevate cursor-pointer"
                      onClick={() => setSelectedMessage(message)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              message.status === 'confirmed' ? 'bg-green-500/10' :
                              message.status === 'pending' ? 'bg-yellow-500/10' : 'bg-red-500/10'
                            }`}>
                              {message.status === 'confirmed' ? <CheckCircle className="h-4 w-4 text-green-500" /> :
                               message.status === 'pending' ? <Clock className="h-4 w-4 text-yellow-500" /> :
                               <XCircle className="h-4 w-4 text-red-500" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 font-medium">
                                <Badge variant="outline" className="text-xs">{message.fromShardId}</Badge>
                                <ArrowRightLeft className="h-3 w-3" />
                                <Badge variant="outline" className="text-xs">{message.toShardId}</Badge>
                                <Badge variant="secondary" className="text-xs">{getMessageTypeLabel(message.messageType)}</Badge>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1 font-mono">
                                {message.transactionHash.slice(0, 20)}...
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium tabular-nums">
                              {latency ? formatLatency(latency) : t('common.pending')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDateTime(message.sentAt)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold flex items-center gap-2" data-testid="text-page-title">
          <Network className="h-8 w-8" />
          {t('crossShard.title')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('crossShard.subtitle')}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2" data-testid="tab-overview">
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">{t('crossShard.tabs.overview')}</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2" data-testid="tab-analytics">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">{t('crossShard.tabs.analytics')}</span>
          </TabsTrigger>
          <TabsTrigger value="matrix" className="flex items-center gap-2" data-testid="tab-matrix">
            <GitBranch className="h-4 w-4" />
            <span className="hidden sm:inline">{t('crossShard.tabs.matrix')}</span>
          </TabsTrigger>
          <TabsTrigger value="protocol" className="flex items-center gap-2" data-testid="tab-protocol">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">{t('crossShard.tabs.protocol')}</span>
          </TabsTrigger>
          <TabsTrigger value="live" className="flex items-center gap-2" data-testid="tab-live">
            <Radio className="h-4 w-4" />
            <span className="hidden sm:inline">{t('crossShard.tabs.live')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">{renderOverviewTab()}</TabsContent>
        <TabsContent value="analytics">{renderMessageAnalyticsTab()}</TabsContent>
        <TabsContent value="matrix">{renderShardMatrixTab()}</TabsContent>
        <TabsContent value="protocol">{renderProtocolTab()}</TabsContent>
        <TabsContent value="live">{renderLiveFeedTab()}</TabsContent>
      </Tabs>

      {renderStatDialog()}
      {renderMessageDetailDialog()}
    </div>
  );
}
