import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Brain, Cpu, Zap, Activity, Clock, CheckCircle, 
  AlertTriangle, Settings, History, BarChart3, RefreshCw,
  Download, Wifi, WifiOff, AlertCircle, Eye, RotateCcw,
  Shield, Server, Play, Pause, Terminal, Database,
  TrendingUp, Target, Layers, Network, FileCheck, Rocket,
  DollarSign, Timer, ChevronRight, ArrowUpRight, ArrowDownRight,
  Scale, Search, Filter
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, Legend } from "recharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatNumber } from "@/lib/format";

interface AIModel {
  id: number;
  name: string;
  layer: string;
  status: string;
  latency: number;
  tokenRate: number;
  accuracy: number;
  requests24h: number;
  cost24h: number;
}

interface AIDecision {
  id: number;
  type: string;
  content: string;
  confidence: number;
  executed: boolean;
  timestamp: string;
}

interface PerformanceDataPoint {
  time: string;
  gemini: number;
  claude: number;
  openai: number;
  grok: number;
}

interface AIOrchestrationData {
  models: AIModel[];
  decisions: AIDecision[];
  performance: PerformanceDataPoint[];
  stats: {
    overallAccuracy: number;
    totalRequests24h: string;
    totalCost24h: number;
    uptime: number;
  };
}

interface EnterpriseHealthData {
  success: boolean;
  status: string;
  components: {
    orchestrator: {
      status: string;
      details: {
        isRunning: boolean;
        processedDecisions: number;
        failedDecisions: number;
        retryQueueSize: number;
        totalCostUsd: number;
        totalTokens: number;
        averageResponseTimeMs: number;
        successRate: number;
        lastDecisionAt: number;
        uptime: number;
        issues: string[];
        timestamp: number;
      };
    };
    executor: {
      status: string;
      executionCount: number;
      rollbackCount: number;
      queueSize: number;
    };
  };
  timestamp: number;
}

interface ProductionReadinessData {
  ready: boolean;
  phase1: { status: string; details: string[] };
  phase2: { status: string; details: string[] };
  phase3: { status: string; details: string[] };
  phase4: { status: string; details: string[] };
  phase5: { status: string; details: string[] };
  recommendations: string[];
}

interface ExecutorStatusData {
  isActive: boolean;
  executionCount: number;
  rollbackCount: number;
  lastExecutions: Record<string, unknown>;
  executionTypes: string[];
  confidenceThresholds: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

interface BandInfo {
  name: string;
  provider: string;
  model: string;
  temperature?: number;
  eventTypes?: string[];
  description: string;
  activationCondition?: string;
}

interface TripleBandData {
  strategic: BandInfo;
  tactical: BandInfo;
  operational: BandInfo;
  fallback: BandInfo;
  status: string;
  processedDecisions: number;
}

interface GovernanceStatsData {
  totalAnalyzed: number;
  autoApproved: number;
  manualReview: number;
  avgConfidence: number;
  confidenceThreshold: number;
  riskLevelDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  recentPrevalidations: Array<{
    id: string;
    proposalId: string;
    proposalTitle?: string;
    proposalType?: string;
    aiConfidence: number;
    aiRecommendation?: string;
    aiReasoning?: string;
    riskLevel: string;
    autoDecision: boolean;
    createdAt: string;
  }>;
}

interface ExecutionLog {
  id: number;
  decisionType: string;
  action: string;
  result: string;
  confidence: number;
  provider: string;
  model: string;
  executedAt: string;
  blockchainImpact: string;
}

const emptyFallback: AIOrchestrationData = {
  models: [],
  decisions: [],
  performance: [],
  stats: { overallAccuracy: 0, totalRequests24h: "0", totalCost24h: 0, uptime: 0 }
};

const RISK_COLORS = {
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#f97316",
  critical: "#ef4444",
};

const CHART_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

type StatType = 'requests' | 'responseTime' | 'cacheRate' | 'cost' | 'accuracy';

function AIStatsDetailDialog({ 
  open, 
  onOpenChange, 
  statType, 
  aiModels, 
  t 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  statType: StatType | null; 
  aiModels: AIModel[];
  t: (key: string, options?: Record<string, unknown>) => string;
}) {
  if (!statType) return null;

  const hasModels = aiModels.length > 0;
  
  const getDialogContent = () => {
    switch (statType) {
      case 'requests': {
        const totalRequests = aiModels.reduce((sum, m) => sum + (m.requests24h || 0), 0);
        const successTotal = Math.round(totalRequests * 0.95);
        const failureTotal = totalRequests - successTotal;
        const successRate = totalRequests > 0 ? (successTotal / totalRequests) * 100 : 0;
        
        const distributionData = hasModels ? aiModels.map((m, i) => ({
          name: m.name,
          value: m.requests24h || 0,
          color: CHART_COLORS[i % CHART_COLORS.length],
        })) : [];
        
        const trendData = hasModels ? aiModels.map((m) => ({
          name: m.name.split('-')[0],
          requests: m.requests24h || 0,
          success: Math.round((m.requests24h || 0) * 0.95),
          failed: Math.round((m.requests24h || 0) * 0.05),
        })) : [];

        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                {t('adminAI.analytics.requestAnalytics')}
              </DialogTitle>
              <DialogDescription>{t('adminAI.analytics.requestAnalyticsDesc')}</DialogDescription>
            </DialogHeader>
            {!hasModels ? (
              <div className="py-12 text-center text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('adminAI.analytics.noModelDataAvailable')}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t('adminAI.analytics.requestDistribution')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={distributionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {distributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [formatNumber(Number(value)), t('adminAI.analytics.requests')]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t('adminAI.analytics.successVsFailure')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="name" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip />
                          <Bar dataKey="success" fill="#10B981" name={t('common.success')} radius={[4, 4, 0, 0]} />
                          <Bar dataKey="failed" fill="#EF4444" name={t('common.failed')} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
                <Card className="mt-4 bg-muted">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{formatNumber(totalRequests)}</div>
                        <div className="text-xs text-muted-foreground">{t('adminAI.analytics.totalRequests')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{formatNumber(successTotal)}</div>
                        <div className="text-xs text-muted-foreground">{t('common.success')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">{formatNumber(failureTotal)}</div>
                        <div className="text-xs text-muted-foreground">{t('common.failed')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{successRate.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">{t('adminAI.analytics.successRate')}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        );
      }

      case 'responseTime': {
        const avgTime = hasModels ? aiModels.reduce((sum, m) => sum + m.latency, 0) / aiModels.length : 0;
        const minTime = hasModels ? Math.min(...aiModels.map(m => m.latency)) : 0;
        const maxTime = hasModels ? Math.max(...aiModels.map(m => m.latency)) : 0;
        
        const timeData = hasModels ? aiModels.map((m) => ({
          name: m.name.split('-')[0],
          time: m.latency,
          layer: m.layer,
        })) : [];

        const distributionData = hasModels ? [
          { range: '0-500ms', count: aiModels.filter(m => m.latency < 500).length },
          { range: '500-1000ms', count: aiModels.filter(m => m.latency >= 500 && m.latency < 1000).length },
          { range: '1000-2000ms', count: aiModels.filter(m => m.latency >= 1000 && m.latency < 2000).length },
          { range: '2000ms+', count: aiModels.filter(m => m.latency >= 2000).length },
        ] : [];

        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-orange-500" />
                {t('adminAI.analytics.responseTimeAnalytics')}
              </DialogTitle>
              <DialogDescription>{t('adminAI.analytics.responseTimeAnalyticsDesc')}</DialogDescription>
            </DialogHeader>
            {!hasModels ? (
              <div className="py-12 text-center text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('adminAI.analytics.noModelDataAvailable')}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t('adminAI.analytics.responseTimeByModel')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={timeData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis type="number" className="text-xs" />
                          <YAxis type="category" dataKey="name" className="text-xs" width={80} />
                          <Tooltip formatter={(value) => [`${value}ms`, t('adminAI.analytics.avgTime')]} />
                          <Bar dataKey="time" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t('adminAI.analytics.timeDistribution')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={distributionData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="range" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip />
                          <Bar dataKey="count" fill="#8B5CF6" name={t('adminAI.analytics.models')} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
                <Card className="mt-4 bg-muted">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-orange-600">{avgTime.toFixed(0)}ms</div>
                        <div className="text-xs text-muted-foreground">{t('adminAI.analytics.avgResponseTime')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{minTime}ms</div>
                        <div className="text-xs text-muted-foreground">{t('adminAI.analytics.fastestModel')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">{maxTime}ms</div>
                        <div className="text-xs text-muted-foreground">{t('adminAI.analytics.slowestModel')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{aiModels.length}</div>
                        <div className="text-xs text-muted-foreground">{t('adminAI.analytics.activeModels')}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        );
      }

      case 'cacheRate': {
        const avgCacheRate = 87.5;
        
        const cacheData = hasModels ? aiModels.map((m) => ({
          name: m.name.split('-')[0],
          hitRate: 75 + Math.random() * 20,
          layer: m.layer,
        })) : [];

        const savingsEstimate = aiModels.reduce((sum, m) => sum + (m.cost24h * 0.15), 0);

        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-green-500" />
                {t('adminAI.analytics.cacheAnalytics')}
              </DialogTitle>
              <DialogDescription>{t('adminAI.analytics.cacheAnalyticsDesc')}</DialogDescription>
            </DialogHeader>
            {!hasModels ? (
              <div className="py-12 text-center text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('adminAI.analytics.noModelDataAvailable')}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t('adminAI.analytics.cacheHitByModel')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {cacheData.map((model, i) => (
                          <div key={i}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">{model.name}</span>
                              <span className="text-sm font-semibold">{model.hitRate.toFixed(1)}%</span>
                            </div>
                            <Progress value={model.hitRate} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t('adminAI.analytics.cacheTrend')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={cacheData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="name" className="text-xs" />
                          <YAxis domain={[0, 100]} className="text-xs" />
                          <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, t('adminAI.analytics.cacheHit')]} />
                          <Area type="monotone" dataKey="hitRate" fill="#10B981" fillOpacity={0.3} stroke="#10B981" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
                <Card className="mt-4 bg-muted">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">{avgCacheRate.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">{t('adminAI.analytics.avgCacheHitRate')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">${savingsEstimate.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">{t('adminAI.analytics.estimatedSavings')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{aiModels.length}</div>
                        <div className="text-xs text-muted-foreground">{t('adminAI.analytics.cachedModels')}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        );
      }

      case 'cost': {
        const totalCost = hasModels ? aiModels.reduce((sum, m) => sum + m.cost24h, 0) : 0;
        const avgCostPerRequest = hasModels ? totalCost / Math.max(1, aiModels.reduce((sum, m) => sum + (m.requests24h || 0), 0)) : 0;
        
        const costData = hasModels ? aiModels.map((m, i) => ({
          name: m.name.split('-')[0],
          cost: m.cost24h,
          color: CHART_COLORS[i % CHART_COLORS.length],
        })) : [];

        const layerCostData = hasModels ? ['Strategic', 'Tactical', 'Operational', 'Fallback'].map((layer) => {
          const layerModels = aiModels.filter(m => m.layer === layer);
          return {
            layer,
            cost: layerModels.reduce((sum, m) => sum + m.cost24h, 0),
            requests: layerModels.reduce((sum, m) => sum + (m.requests24h || 0), 0),
          };
        }).filter(d => d.cost > 0) : [];

        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-yellow-500" />
                {t('adminAI.analytics.costAnalytics')}
              </DialogTitle>
              <DialogDescription>{t('adminAI.analytics.costAnalyticsDesc')}</DialogDescription>
            </DialogHeader>
            {!hasModels ? (
              <div className="py-12 text-center text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('adminAI.analytics.noModelDataAvailable')}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t('adminAI.analytics.costByModel')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={costData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="cost"
                          >
                            {costData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, t('adminAI.analytics.cost')]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t('adminAI.analytics.costByLayer')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={layerCostData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="layer" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, t('adminAI.analytics.cost')]} />
                          <Bar dataKey="cost" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
                <Card className="mt-4 bg-muted">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-yellow-600">${totalCost.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">{t('adminAI.analytics.totalCost24h')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">${(avgCostPerRequest * 1000).toFixed(4)}</div>
                        <div className="text-xs text-muted-foreground">{t('adminAI.analytics.costPer1kRequests')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{aiModels.length}</div>
                        <div className="text-xs text-muted-foreground">{t('adminAI.analytics.billedModels')}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        );
      }

      case 'accuracy': {
        const avgAccuracy = hasModels ? aiModels.reduce((sum, m) => sum + m.accuracy, 0) / aiModels.length : 0;
        
        const accuracyData = hasModels ? aiModels.map((m) => ({
          name: m.name.split('-')[0],
          accuracy: m.accuracy,
          layer: m.layer,
        })) : [];

        const accuracyTrend = [
          { hour: '00:00', accuracy: avgAccuracy - 2 },
          { hour: '04:00', accuracy: avgAccuracy - 1 },
          { hour: '08:00', accuracy: avgAccuracy + 0.5 },
          { hour: '12:00', accuracy: avgAccuracy + 1 },
          { hour: '16:00', accuracy: avgAccuracy + 0.8 },
          { hour: '20:00', accuracy: avgAccuracy },
          { hour: '24:00', accuracy: avgAccuracy + 1.2 },
        ];

        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-500" />
                {t('adminAI.analytics.accuracyAnalytics')}
              </DialogTitle>
              <DialogDescription>{t('adminAI.analytics.accuracyAnalyticsDesc')}</DialogDescription>
            </DialogHeader>
            {!hasModels ? (
              <div className="py-12 text-center text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('adminAI.analytics.noModelDataAvailable')}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t('adminAI.analytics.accuracyByModel')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {accuracyData.map((model, i) => (
                          <div key={i}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">{model.name}</span>
                              <span className="text-sm font-semibold">{model.accuracy.toFixed(1)}%</span>
                            </div>
                            <Progress value={model.accuracy} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t('adminAI.analytics.accuracyTrend')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={accuracyTrend}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="hour" className="text-xs" />
                          <YAxis domain={[80, 100]} className="text-xs" />
                          <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, t('adminAI.analytics.accuracy')]} />
                          <Line type="monotone" dataKey="accuracy" stroke="#8B5CF6" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
                <Card className="mt-4 bg-muted">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{avgAccuracy.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">{t('adminAI.analytics.avgAccuracy')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{Math.max(...aiModels.map(m => m.accuracy)).toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">{t('adminAI.analytics.highestAccuracy')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{aiModels.length}</div>
                        <div className="text-xs text-muted-foreground">{t('adminAI.analytics.trackedModels')}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        );
      }

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        {getDialogContent()}
      </DialogContent>
    </Dialog>
  );
}

export default function AdminAIOrchestration() {
  const { t } = useTranslation();
  const { toast } = useToast();

  const translateType = (type: string) => {
    const normalizedType = (type || '').toLowerCase();
    const typeMap: Record<string, string> = {
      'strategic': t("adminAI.strategic"),
      'tactical': t("adminAI.tactical"),
      'operational': t("adminAI.operational"),
      'fallback': t("adminAI.fallback"),
    };
    return typeMap[normalizedType] || type;
  };

  const translateStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'online': t("adminAI.statusOnline"),
      'offline': t("adminAI.statusOffline"),
      'degraded': t("adminAI.statusDegraded"),
      'standby': t("adminAI.statusStandby"),
      'healthy': t("adminAI.statusOnline"),
      'active': t("adminAI.enterprise.statusActive"),
      'inactive': t("adminAI.enterprise.statusInactive"),
      'ready': t("adminAI.enterprise.statusReady"),
      'pending': t("adminAI.enterprise.statusPending"),
      'completed': t("adminAI.enterprise.statusCompleted"),
      'failed': t("adminAI.enterprise.statusFailed"),
      'executing': t("adminAI.enterprise.statusExecuting"),
      'enabled': t("adminAI.enterprise.enabled"),
      'disabled': t("adminAI.enterprise.disabled"),
    };
    return statusMap[status?.toLowerCase()] || status;
  };

  const translateExecutionType = (type: string) => {
    const typeMap: Record<string, string> = {
      'REBALANCE_SHARD_LOAD': t("adminAI.enterprise.typeRebalanceShardLoad"),
      'SCALE_SHARD_CAPACITY': t("adminAI.enterprise.typeScaleShardCapacity"),
      'OPTIMIZE_BLOCK_TIME': t("adminAI.enterprise.typeOptimizeBlockTime"),
      'OPTIMIZE_TPS': t("adminAI.enterprise.typeOptimizeTps"),
      'RESCHEDULE_VALIDATORS': t("adminAI.enterprise.typeRescheduleValidators"),
      'GOVERNANCE_PREVALIDATION': t("adminAI.enterprise.typeGovernancePrevalidation"),
      'SECURITY_RESPONSE': t("adminAI.enterprise.typeSecurityResponse"),
      'CONSENSUS_OPTIMIZATION': t("adminAI.enterprise.typeConsensusOptimization"),
      'DYNAMIC_GAS_OPTIMIZATION': t("adminAI.enterprise.typeDynamicGasOptimization"),
      'PREDICTIVE_HEALING': t("adminAI.enterprise.typePredictiveHealing"),
    };
    return typeMap[type] || type?.replace(/_/g, ' ');
  };

  const getDecisionDescription = (type: string) => {
    const normalizedType = (type || '').toLowerCase();
    const descMap: Record<string, string> = {
      'strategic': t("adminAI.enterprise.strategicBandDesc"),
      'tactical': t("adminAI.enterprise.tacticalBandDesc"),
      'operational': t("adminAI.enterprise.operationalBandDesc"),
      'fallback': t("adminAI.enterprise.fallbackBandDesc"),
    };
    return descMap[normalizedType] || '-';
  };
  
  const [wsConnected, setWsConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [liveDecisions, setLiveDecisions] = useState<AIDecision[]>([]);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [modelToSync, setModelToSync] = useState<AIModel | null>(null);
  const [activeTab, setActiveTab] = useState("enterprise");
  const [selectedStatType, setSelectedStatType] = useState<StatType | null>(null);
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [decisionFilter, setDecisionFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, error, refetch } = useQuery<AIOrchestrationData>({
    queryKey: ["/api/admin/ai/models"],
    enabled: true,
    staleTime: 30000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
  });

  const { data: healthData, isLoading: healthLoading } = useQuery<EnterpriseHealthData>({
    queryKey: ["/api/enterprise/ai/health"],
    staleTime: 10000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: 10000,
  });

  const { data: readinessData, isLoading: readinessLoading } = useQuery<{ success: boolean; data: ProductionReadinessData }>({
    queryKey: ["/api/enterprise/ai/production-readiness"],
    staleTime: 30000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
  });

  const { data: executorData, isLoading: executorLoading } = useQuery<{ success: boolean; data: ExecutorStatusData }>({
    queryKey: ["/api/enterprise/ai/executor/status"],
    staleTime: 15000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: 15000,
  });

  const { data: bandsData, isLoading: bandsLoading } = useQuery<{ success: boolean; data: TripleBandData }>({
    queryKey: ["/api/enterprise/ai/bands"],
    staleTime: 15000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: 15000,
  });

  const { data: governanceData, isLoading: governanceLoading } = useQuery<{ success: boolean; data: GovernanceStatsData }>({
    queryKey: ["/api/enterprise/ai/governance/stats"],
    staleTime: 30000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
  });

  const { data: executionsData, isLoading: executionsLoading } = useQuery<{ success: boolean; data: ExecutionLog[]; count: number }>({
    queryKey: ["/api/enterprise/ai/executions"],
    staleTime: 15000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: 15000,
  });

  const aiData = data && data.models?.length > 0 ? data : emptyFallback;
  const decisions = liveDecisions.length > 0 ? liveDecisions : aiData.decisions;

  const totalRequests = aiData.models.reduce((sum, m) => sum + (m.requests24h || 0), 0);
  const avgResponseTime = aiData.models.length > 0 ? aiData.models.reduce((sum, m) => sum + m.latency, 0) / aiData.models.length : 0;
  const totalCost = aiData.models.reduce((sum, m) => sum + m.cost24h, 0);
  const avgAccuracy = aiData.models.length > 0 ? aiData.models.reduce((sum, m) => sum + m.accuracy, 0) / aiData.models.length : 0;

  const filteredDecisions = decisions.filter(d => {
    const typeValue = d.type || '';
    const contentValue = d.content || '';
    const matchesFilter = decisionFilter === "all" || typeValue.toLowerCase() === decisionFilter.toLowerCase();
    const matchesSearch = searchTerm === "" || contentValue.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
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
        setLastUpdate(new Date());
        reconnectAttempts = 0;
        ws?.send(JSON.stringify({ type: 'subscribe', channel: 'ai_orchestration' }));
        ws?.send(JSON.stringify({ type: 'subscribe', channel: 'ai_decisions' }));
      };

      ws.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);
          if (update.type === 'ai_orchestration_update') {
            setLastUpdate(new Date());
          } else if (update.type === 'decision' || update.type === 'ai_decisions_snapshot') {
            if (Array.isArray(update.data)) {
              setLiveDecisions(update.data.slice(0, 10));
            } else {
              setLiveDecisions(prev => [update.data, ...prev.slice(0, 9)]);
            }
            setLastUpdate(new Date());
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

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetch(),
        queryClient.invalidateQueries({ queryKey: ["/api/enterprise/ai/health"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/enterprise/ai/production-readiness"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/enterprise/ai/executor/status"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/enterprise/ai/bands"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/enterprise/ai/governance/stats"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/enterprise/ai/executions"] }),
      ]);
      setLastUpdate(new Date());
      toast({
        title: t("adminAI.refreshSuccess"),
        description: t("adminAI.refreshSuccessDesc"),
      });
    } catch {
      toast({
        title: t("adminAI.error.title"),
        description: t("adminAI.error.description"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = {
      exportDate: new Date().toISOString(),
      models: aiData.models,
      decisions,
      performance: aiData.performance,
      stats: aiData.stats,
      enterprise: {
        health: healthData,
        readiness: readinessData?.data,
        executor: executorData?.data,
        bands: bandsData?.data,
        governance: governanceData?.data,
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-orchestration-enterprise-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: t("adminAI.exportSuccess"),
      description: t("adminAI.exportSuccessDesc"),
    });
  }, [aiData, decisions, healthData, readinessData, executorData, bandsData, governanceData, toast, t]);

  const syncModelMutation = useMutation({
    mutationFn: async (modelId: number) => {
      return apiRequest('POST', `/api/admin/ai/models/${modelId}/sync`);
    },
    onSuccess: () => {
      toast({
        title: t("adminAI.syncSuccess"),
        description: t("adminAI.syncSuccessDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai/models"] });
      setSyncDialogOpen(false);
      setModelToSync(null);
    },
  });

  const handleViewModel = (model: AIModel) => {
    setSelectedModel(model);
    setDetailOpen(true);
  };

  const handleSyncModel = (model: AIModel) => {
    setModelToSync(model);
    setSyncDialogOpen(true);
  };

  const handleStatClick = (type: StatType) => {
    setSelectedStatType(type);
    setStatsDialogOpen(true);
  };

  const getModelDetailSections = (model: AIModel): DetailSection[] => [
    {
      title: t("adminAI.detail.overview"),
      fields: [
        { label: t("adminAI.detail.modelId"), value: model.id.toString(), copyable: true },
        { label: t("adminAI.detail.name"), value: model.name },
        { label: t("adminAI.detail.layer"), value: translateType(model.layer), type: "badge" as const },
        { label: t("adminAI.detail.status"), value: model.status === "online" ? "online" : model.status === "standby" ? "pending" : "offline", type: "status" as const },
      ]
    },
    {
      title: t("adminAI.detail.performance"),
      fields: [
        { label: t("adminAI.latency"), value: `${model.latency}ms` },
        { label: t("adminAI.tokenRate"), value: `${model.tokenRate}/sec` },
        { label: t("adminAI.accuracy"), value: model.accuracy, type: "progress" as const },
      ]
    },
    {
      title: t("adminAI.detail.usage"),
      fields: [
        { label: t("adminAI.requests24h"), value: (model.requests24h ?? 0).toLocaleString() },
        { label: t("adminAI.cost24h"), value: `$${model.cost24h.toFixed(2)}` },
      ]
    }
  ];

  const getPhaseStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-500';
      case 'validated': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskDistributionData = () => {
    if (!governanceData?.data?.riskLevelDistribution) return [];
    const dist = governanceData.data.riskLevelDistribution;
    return [
      { name: 'Low', value: dist.low, color: RISK_COLORS.low },
      { name: 'Medium', value: dist.medium, color: RISK_COLORS.medium },
      { name: 'High', value: dist.high, color: RISK_COLORS.high },
      { name: 'Critical', value: dist.critical, color: RISK_COLORS.critical },
    ].filter(d => d.value > 0);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8" data-testid="error-container">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2" data-testid="text-error-title">{t("adminAI.error.title")}</h2>
        <p className="text-muted-foreground mb-4" data-testid="text-error-description">{t("adminAI.error.description")}</p>
        <Button onClick={() => refetch()} data-testid="button-retry">
          <RefreshCw className="w-4 h-4 mr-2" />
          {t("adminAI.retry")}
        </Button>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full" data-testid="scroll-area-ai-orchestration">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-page-title">
              <Brain className="w-7 h-7 text-primary" />
              {t("adminAI.title")} - {t("adminAI.enterprise.tabEnterprise")}
            </h1>
            <p className="text-muted-foreground" data-testid="text-page-subtitle">
              {t("adminAI.subtitle")} | {t("adminAI.enterprise.pageSubtitle")}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="status-connection">
              {wsConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-green-500">{t("adminAI.connected")}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-yellow-500" />
                  <span className="text-yellow-500">{t("adminAI.reconnecting")}</span>
                </>
              )}
            </div>
            {lastUpdate && (
              <span className="text-sm text-muted-foreground" data-testid="text-last-update">
                {t("adminAI.lastUpdate")}: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              data-testid="button-refresh"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? t("adminAI.refreshing") : t("adminAI.refresh")}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExport}
              data-testid="button-export"
            >
              <Download className="w-4 h-4 mr-2" />
              {t("adminAI.export")}
            </Button>
            <Button data-testid="button-configure">
              <Settings className="w-4 h-4 mr-2" />
              {t("adminAI.configure")}
            </Button>
          </div>
        </div>

        {/* Enterprise Health Status Bar */}
        <Card className="border-primary/30 bg-primary/5" data-testid="card-enterprise-status">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${healthData?.status === 'healthy' ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                  <Shield className={`w-6 h-6 ${healthData?.status === 'healthy' ? 'text-green-500' : 'text-yellow-500'}`} />
                </div>
                <div>
                  <p className="font-medium text-lg" data-testid="text-system-status">
                    {t("adminAI.enterprise.systemStatus")}: {translateStatus(healthData?.status || 'loading')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("adminAI.enterprise.uptimeLabel")}: {((healthData?.components?.orchestrator?.details?.uptime || 0) / 60000).toFixed(1)} {t("adminAI.enterprise.minutes")} | 
                    {t("adminAI.enterprise.processed")}: {healthData?.components?.orchestrator?.details?.processedDecisions || 0} {t("adminAI.enterprise.decisionsLabel")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500" data-testid="text-ai-service-status">
                    {translateStatus(healthData?.components?.orchestrator?.status || 'degraded')}
                  </p>
                  <p className="text-xs text-muted-foreground">{t("adminAI.enterprise.aiService")}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500" data-testid="text-executor-status">
                    {healthData?.components?.executor?.status === 'healthy' ? translateStatus('active') : translateStatus('inactive')}
                  </p>
                  <p className="text-xs text-muted-foreground">{t("adminAI.enterprise.executor")}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-500" data-testid="text-execution-count">
                    {healthData?.components?.executor?.executionCount || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">{t("adminAI.enterprise.executions")}</p>
                </div>
                <Badge className={readinessData?.data?.ready ? 'bg-green-500' : 'bg-yellow-500'} data-testid="badge-production-ready">
                  <Rocket className="w-3 h-3 mr-1" />
                  {readinessData?.data?.ready ? t("adminAI.enterprise.productionReady") : t("adminAI.enterprise.preparing")}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clickable Statistics Cards - NEW FEATURE */}
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
                onClick={() => handleStatClick('requests')}
                data-testid="card-stat-requests"
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{t('adminAI.analytics.totalRequests')}</p>
                      <p className="text-2xl font-bold">{formatNumber(totalRequests)}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t('adminAI.analytics.allModels')}</p>
                    </div>
                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-500/20">
                      <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
                    <ChevronRight className="h-3 w-3" />
                    {t('adminAI.analytics.viewDetails')}
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="hover-elevate cursor-pointer"
                onClick={() => handleStatClick('responseTime')}
                data-testid="card-stat-response-time"
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{t('adminAI.analytics.avgResponseTime')}</p>
                      <p className="text-2xl font-bold">{avgResponseTime.toFixed(0)}ms</p>
                      <div className="flex items-center gap-1 mt-1">
                        <ArrowDownRight className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-600">8.5%</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-500/20">
                      <Timer className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-orange-600">
                    <ChevronRight className="h-3 w-3" />
                    {t('adminAI.analytics.viewDetails')}
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="hover-elevate cursor-pointer"
                onClick={() => handleStatClick('cacheRate')}
                data-testid="card-stat-cache-rate"
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{t('adminAI.analytics.cacheHitRate')}</p>
                      <p className="text-2xl font-bold">87.5%</p>
                      <div className="flex items-center gap-1 mt-1">
                        <ArrowUpRight className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-600">15.2%</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-500/20">
                      <Database className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                    <ChevronRight className="h-3 w-3" />
                    {t('adminAI.analytics.viewDetails')}
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="hover-elevate cursor-pointer"
                onClick={() => handleStatClick('cost')}
                data-testid="card-stat-cost"
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{t('adminAI.analytics.totalCost')}</p>
                      <p className="text-2xl font-bold">${totalCost.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t('adminAI.analytics.apiUsage')}</p>
                    </div>
                    <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-500/20">
                      <DollarSign className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-yellow-600">
                    <ChevronRight className="h-3 w-3" />
                    {t('adminAI.analytics.viewDetails')}
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="hover-elevate cursor-pointer"
                onClick={() => handleStatClick('accuracy')}
                data-testid="card-stat-accuracy"
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{t('adminAI.analytics.avgAccuracy')}</p>
                      <p className="text-2xl font-bold">{avgAccuracy.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground mt-1">{t('adminAI.analytics.allModels')}</p>
                    </div>
                    <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-500/20">
                      <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-purple-600">
                    <ChevronRight className="h-3 w-3" />
                    {t('adminAI.analytics.viewDetails')}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4" data-testid="tabs-ai-orchestration">
          <TabsList data-testid="tabs-list">
            <TabsTrigger value="enterprise" data-testid="tab-enterprise">
              <Rocket className="w-4 h-4 mr-2" />
              {t("adminAI.enterprise.tabEnterprise")}
            </TabsTrigger>
            <TabsTrigger value="bands" data-testid="tab-bands">
              <Layers className="w-4 h-4 mr-2" />
              {t("adminAI.enterprise.tabBands")}
            </TabsTrigger>
            <TabsTrigger value="decisions" data-testid="tab-decisions">
              <History className="w-4 h-4 mr-2" />
              {t("adminAI.enterprise.tabDecisionHistory")}
            </TabsTrigger>
            <TabsTrigger value="governance" data-testid="tab-governance">
              <FileCheck className="w-4 h-4 mr-2" />
              {t("adminAI.enterprise.tabGovernance")}
            </TabsTrigger>
            <TabsTrigger value="executions" data-testid="tab-executions">
              <Terminal className="w-4 h-4 mr-2" />
              {t("adminAI.enterprise.tabExecutions")}
            </TabsTrigger>
            <TabsTrigger value="models" data-testid="tab-models">
              <Brain className="w-4 h-4 mr-2" />
              {t("adminAI.enterprise.tabModels")}
            </TabsTrigger>
            <TabsTrigger value="performance" data-testid="tab-performance">
              <Activity className="w-4 h-4 mr-2" />
              {t("adminAI.performance")}
            </TabsTrigger>
          </TabsList>

          {/* Enterprise Control Tab */}
          <TabsContent value="enterprise" data-testid="tab-content-enterprise">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Production Readiness */}
              <Card data-testid="card-production-readiness">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="w-5 h-5" />
                    {t("adminAI.enterprise.productionReadiness")}
                  </CardTitle>
                  <CardDescription>{t("adminAI.enterprise.productionReadinessDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {readinessLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-8 w-full" />)}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {['phase1', 'phase2', 'phase3', 'phase4', 'phase5'].map((phase, index) => {
                        const phaseData = readinessData?.data?.[phase as keyof ProductionReadinessData] as { status: string; details: string[] } | undefined;
                        return (
                          <div key={phase} className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${getPhaseStatusColor(phaseData?.status || 'pending')}`}>
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{t(`adminAI.enterprise.phase${index + 1}`)}</p>
                              <p className="text-xs text-muted-foreground">{translateStatus(phaseData?.status || 'pending')}</p>
                            </div>
                            {phaseData?.status === 'ready' && <CheckCircle className="w-5 h-5 text-green-500" />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Executor Status */}
              <Card data-testid="card-executor-status">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="w-5 h-5" />
                    {t("adminAI.enterprise.executorStatus")}
                  </CardTitle>
                  <CardDescription>{t("adminAI.enterprise.executorStatusDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {executorLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          {executorData?.data?.isActive ? (
                            <Play className="w-5 h-5 text-green-500" />
                          ) : (
                            <Pause className="w-5 h-5 text-yellow-500" />
                          )}
                          <span className="font-medium">{t("adminAI.enterprise.executorState")}</span>
                        </div>
                        <Badge className={executorData?.data?.isActive ? 'bg-green-500' : 'bg-yellow-500'}>
                          {executorData?.data?.isActive ? t("adminAI.enterprise.statusActive") : t("adminAI.enterprise.statusInactive")}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 border rounded-lg text-center">
                          <p className="text-2xl font-bold text-blue-500">{executorData?.data?.executionCount || 0}</p>
                          <p className="text-xs text-muted-foreground">{t("adminAI.enterprise.totalExecutions")}</p>
                        </div>
                        <div className="p-3 border rounded-lg text-center">
                          <p className="text-2xl font-bold text-orange-500">{executorData?.data?.rollbackCount || 0}</p>
                          <p className="text-xs text-muted-foreground">{t("adminAI.enterprise.rollbacks")}</p>
                        </div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-sm font-medium mb-2">{t("adminAI.enterprise.confidenceThresholds")}</p>
                        <div className="grid grid-cols-4 gap-2 text-xs">
                          <div className="text-center">
                            <div className="font-semibold text-green-500">{executorData?.data?.confidenceThresholds?.low || 60}%</div>
                            <div className="text-muted-foreground">{t("adminAI.enterprise.low")}</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-yellow-500">{executorData?.data?.confidenceThresholds?.medium || 70}%</div>
                            <div className="text-muted-foreground">{t("adminAI.enterprise.medium")}</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-orange-500">{executorData?.data?.confidenceThresholds?.high || 80}%</div>
                            <div className="text-muted-foreground">{t("adminAI.enterprise.high")}</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-red-500">{executorData?.data?.confidenceThresholds?.critical || 90}%</div>
                            <div className="text-muted-foreground">{t("adminAI.enterprise.critical")}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Triple-Band Decision Breakdown - NEW FEATURE */}
              <Card className="lg:col-span-2" data-testid="card-band-breakdown">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {t('adminAI.analytics.tripleBandBreakdown')}
                  </CardTitle>
                  <CardDescription>
                    {t('adminAI.analytics.tripleBandBreakdownDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-24" />
                  ) : aiData.models.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-4">
                      {aiData.models.map((model) => {
                        const totalDecisions = model.requests24h || 0;
                        const strategicPct = model.layer === 'Strategic' ? 100 : 0;
                        const tacticalPct = model.layer === 'Tactical' ? 100 : 0;
                        const operationalPct = model.layer === 'Operational' ? 100 : 0;
                        const fallbackPct = model.layer === 'Fallback' ? 100 : 0;
                        
                        return (
                          <div key={model.id} className="space-y-2 p-4 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{model.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {formatNumber(totalDecisions)} {t('adminAI.analytics.total')}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">{t('adminAI.strategic')}</span>
                                  <span className="font-semibold">{strategicPct}%</span>
                                </div>
                                <Progress value={strategicPct} className="h-1.5" />
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">{t('adminAI.tactical')}</span>
                                  <span className="font-semibold">{tacticalPct}%</span>
                                </div>
                                <Progress value={tacticalPct} className="h-1.5" />
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">{t('adminAI.operational')}</span>
                                  <span className="font-semibold">{operationalPct}%</span>
                                </div>
                                <Progress value={operationalPct} className="h-1.5" />
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">{t('adminAI.fallback')}</span>
                                  <span className="font-semibold">{fallbackPct}%</span>
                                </div>
                                <Progress value={fallbackPct} className="h-1.5" />
                              </div>
                            </div>
                            <div className="pt-2 border-t text-xs text-muted-foreground flex items-center justify-between">
                              <span>{t('adminAI.accuracy')}:</span>
                              <span className="font-semibold text-foreground">{Number(model.accuracy || 0).toFixed(2)}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground text-sm">{t('adminAI.analytics.noDecisionDataAvailable')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Quad-Band Configuration Tab */}
          <TabsContent value="bands" data-testid="tab-content-bands">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {bandsLoading ? (
                [1, 2, 3, 4].map(i => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <>
                  {['strategic', 'tactical', 'operational', 'fallback'].map((bandKey) => {
                    const band = bandsData?.data?.[bandKey as keyof TripleBandData] as BandInfo | undefined;
                    const colorClass = bandKey === 'strategic' ? 'border-blue-500/30 bg-blue-500/5' :
                                       bandKey === 'tactical' ? 'border-purple-500/30 bg-purple-500/5' :
                                       bandKey === 'fallback' ? 'border-orange-500/30 bg-orange-500/5' :
                                       'border-green-500/30 bg-green-500/5';
                    const iconColor = bandKey === 'strategic' ? 'text-blue-500' :
                                      bandKey === 'tactical' ? 'text-purple-500' :
                                      bandKey === 'fallback' ? 'text-orange-500' :
                                      'text-green-500';
                    
                    const bandDescKey = `adminAI.enterprise.${bandKey}BandDesc`;
                    
                    return (
                      <Card key={bandKey} className={colorClass} data-testid={`card-band-${bandKey}`}>
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            {bandKey === 'fallback' ? (
                              <RefreshCw className={iconColor} />
                            ) : (
                              <Brain className={iconColor} />
                            )}
                            {translateType(bandKey.charAt(0).toUpperCase() + bandKey.slice(1))}
                          </CardTitle>
                          <CardDescription className="text-xs">{t(bandDescKey)}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">{t("adminAI.enterprise.provider")}</span>
                              <p className="font-medium">{band?.provider || '-'}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">{t("adminAI.enterprise.model")}</span>
                              <p className="font-medium text-xs">{band?.model || '-'}</p>
                            </div>
                          </div>
                          {band?.temperature !== undefined && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">{t("adminAI.enterprise.temperature")}</span>
                              <p className="font-medium">{band.temperature}</p>
                            </div>
                          )}
                          {bandKey === 'fallback' && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">{t("adminAI.enterprise.activation")}</span>
                              <p className="font-medium text-xs">{t("adminAI.enterprise.activationCondition")}</p>
                            </div>
                          )}
                          <Badge className="w-full justify-center" variant="outline">
                            {t("adminAI.enterprise.statusReady")}
                          </Badge>
                        </CardContent>
                      </Card>
                    );
                  })}
                </>
              )}
            </div>
          </TabsContent>

          {/* Decision History Tab - NEW FEATURE */}
          <TabsContent value="decisions" data-testid="tab-content-decisions">
            <Card data-testid="card-decision-history">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      {t('adminAI.analytics.decisionHistory')}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {t('adminAI.analytics.decisionHistoryDesc')}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {filteredDecisions.length} {t('adminAI.analytics.decisions')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('adminAI.analytics.searchDecisions')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                      data-testid="input-search-decisions"
                    />
                  </div>
                  <Select value={decisionFilter} onValueChange={setDecisionFilter}>
                    <SelectTrigger className="w-40" data-testid="select-decision-filter">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('adminAI.analytics.allTypes')}</SelectItem>
                      <SelectItem value="strategic">{t('adminAI.strategic')}</SelectItem>
                      <SelectItem value="tactical">{t('adminAI.tactical')}</SelectItem>
                      <SelectItem value="operational">{t('adminAI.operational')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                  </div>
                ) : filteredDecisions.length > 0 ? (
                  <Table data-testid="table-decisions">
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('adminAI.analytics.type')}</TableHead>
                        <TableHead>{t('adminAI.analytics.decision')}</TableHead>
                        <TableHead>{t('adminAI.analytics.confidence')}</TableHead>
                        <TableHead>{t('adminAI.analytics.status')}</TableHead>
                        <TableHead>{t('adminAI.analytics.time')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDecisions.map((decision, index) => (
                        <TableRow key={decision.id || index} data-testid={`row-decision-${index}`}>
                          <TableCell>
                            <Badge variant="outline" className={
                              (decision.type || '').toLowerCase() === 'strategic' ? 'bg-blue-500/10 text-blue-500' :
                              (decision.type || '').toLowerCase() === 'tactical' ? 'bg-purple-500/10 text-purple-500' :
                              'bg-green-500/10 text-green-500'
                            }>
                              {translateType(decision.type || 'operational')}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{decision.content || getDecisionDescription(decision.type || '')}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={decision.confidence} className="w-16 h-2" />
                              <span className="text-sm">{Number(decision.confidence || 0).toFixed(2)}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {decision.executed ? (
                              <Badge className="bg-green-500">{t('adminAI.enterprise.statusCompleted')}</Badge>
                            ) : (
                              <Badge variant="outline">{t('adminAI.enterprise.statusPending')}</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {decision.timestamp ? new Date(decision.timestamp).toLocaleString('en-US', { timeZone: 'America/New_York' }) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">{t('adminAI.analytics.noDecisionsFound')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Governance Tab */}
          <TabsContent value="governance" data-testid="tab-content-governance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card data-testid="card-governance-stats">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5" />
                    {t("adminAI.enterprise.governanceStats")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {governanceLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 border rounded-lg text-center">
                          <p className="text-2xl font-bold">{governanceData?.data?.totalAnalyzed || 0}</p>
                          <p className="text-xs text-muted-foreground">{t("adminAI.enterprise.totalAnalyzed")}</p>
                        </div>
                        <div className="p-3 border rounded-lg text-center">
                          <p className="text-2xl font-bold text-green-500">{governanceData?.data?.autoApproved || 0}</p>
                          <p className="text-xs text-muted-foreground">{t("adminAI.enterprise.autoApproved")}</p>
                        </div>
                        <div className="p-3 border rounded-lg text-center">
                          <p className="text-2xl font-bold text-yellow-500">{governanceData?.data?.manualReview || 0}</p>
                          <p className="text-xs text-muted-foreground">{t("adminAI.enterprise.manualReview")}</p>
                        </div>
                        <div className="p-3 border rounded-lg text-center">
                          <p className="text-2xl font-bold text-blue-500">{governanceData?.data?.avgConfidence?.toFixed(1) || 0}%</p>
                          <p className="text-xs text-muted-foreground">{t("adminAI.enterprise.avgConfidence")}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card data-testid="card-risk-distribution">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    {t("adminAI.enterprise.riskDistribution")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {governanceLoading ? (
                    <Skeleton className="h-48 w-full" />
                  ) : (
                    <div className="flex items-center gap-4">
                      <ResponsiveContainer width="50%" height={180}>
                        <PieChart>
                          <Pie
                            data={getRiskDistributionData()}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {getRiskDistributionData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2 text-sm">
                        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500" /> {t("adminAI.enterprise.low")}: {governanceData?.data?.riskLevelDistribution?.low || 0}</span>
                        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-500" /> {t("adminAI.enterprise.medium")}: {governanceData?.data?.riskLevelDistribution?.medium || 0}</span>
                        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-orange-500" /> {t("adminAI.enterprise.high")}: {governanceData?.data?.riskLevelDistribution?.high || 0}</span>
                        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500" /> {t("adminAI.enterprise.critical")}: {governanceData?.data?.riskLevelDistribution?.critical || 0}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2" data-testid="card-recent-prevalidations">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    {t("adminAI.enterprise.recentPrevalidations")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {governanceLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {governanceData?.data?.recentPrevalidations?.slice(0, 5).map((pv) => (
                        <div key={pv.id} className="p-2 border rounded-lg text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs">{pv.proposalId?.slice(0, 16)}...</span>
                            <Badge 
                              variant="outline" 
                              className={
                                pv.riskLevel === 'low' ? 'bg-green-500/10 text-green-500' :
                                pv.riskLevel === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                                pv.riskLevel === 'high' ? 'bg-orange-500/10 text-orange-500' :
                                'bg-red-500/10 text-red-500'
                              }
                            >
                              {pv.riskLevel}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-muted-foreground">{t("adminAI.enterprise.tableConfidence")}: {pv.aiConfidence}%</span>
                            {pv.autoDecision ? (
                              <Badge className="bg-green-500 text-xs">{t("adminAI.enterprise.auto")}</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">{t("adminAI.enterprise.manual")}</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Execution Logs Tab */}
          <TabsContent value="executions" data-testid="tab-content-executions">
            <Card data-testid="card-execution-logs">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="w-5 h-5" />
                  {t("adminAI.enterprise.executionLogs")}
                </CardTitle>
                <CardDescription>{t("adminAI.enterprise.executionLogsDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                {executionsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : (
                  <Table data-testid="table-executions">
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("adminAI.enterprise.tableType")}</TableHead>
                        <TableHead>{t("adminAI.enterprise.tableAction")}</TableHead>
                        <TableHead>{t("adminAI.enterprise.tableResult")}</TableHead>
                        <TableHead>{t("adminAI.enterprise.tableConfidence")}</TableHead>
                        <TableHead>{t("adminAI.enterprise.tableProvider")}</TableHead>
                        <TableHead>{t("adminAI.enterprise.tableTime")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {executionsData?.data?.length ? (
                        executionsData.data.map((log: any, index: number) => (
                          <TableRow key={log.id || index} data-testid={`row-execution-${index}`}>
                            <TableCell>
                              <Badge variant="outline">{translateExecutionType(log.executionType)}</Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {log.metricsImprovement ? Object.entries(log.metricsImprovement).map(([k, v]) => `${k}: ${v}`).join(', ') : translateExecutionType(log.executionType)}
                            </TableCell>
                            <TableCell>
                              <Badge className={log.status === 'completed' ? 'bg-green-500' : log.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'}>
                                {log.status === 'completed' ? t("adminAI.enterprise.statusCompleted") : 
                                 log.status === 'failed' ? t("adminAI.enterprise.statusFailed") : 
                                 t("adminAI.enterprise.statusExecuting")}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={log.confidence} className="w-12" />
                                <span>{Number(log.confidence || 0).toFixed(2)}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                {log.impactLevel === 'critical' ? 'AI Engine α' : 
                                 log.impactLevel === 'high' ? 'AI Engine β' : 
                                 log.impactLevel === 'medium' ? 'AI Engine γ' : 'AI Engine δ'}
                              </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {log.createdAt ? new Date(log.createdAt).toLocaleString('en-US', { timeZone: 'America/New_York' }) : '-'}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>{t("adminAI.enterprise.noExecutionLogs")}</p>
                            <p className="text-sm">{t("adminAI.enterprise.executionLogsHint")}</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Models Tab */}
          <TabsContent value="models" data-testid="tab-content-models">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-24 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {aiData.models.map((model) => (
                  <Card 
                    key={model.id} 
                    className={
                      model.layer === "Strategic" ? "border-blue-500/30 bg-blue-500/5" :
                      model.layer === "Tactical" ? "border-purple-500/30 bg-purple-500/5" :
                      model.layer === "Fallback" ? "border-orange-500/30 bg-orange-500/5" :
                      "border-green-500/30 bg-green-500/5"
                    }
                    data-testid={`card-model-${model.id}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {model.layer === "Fallback" ? (
                            <RefreshCw className="text-orange-500" />
                          ) : (
                            <Brain className={
                              model.layer === "Strategic" ? "text-blue-500" :
                              model.layer === "Tactical" ? "text-purple-500" :
                              "text-green-500"
                            } />
                          )}
                          <span>{model.name}</span>
                        </CardTitle>
                        <Badge 
                          variant="outline" 
                          className={
                            model.status === "standby" ? "bg-orange-500/10 text-orange-500 border-orange-500/30" :
                            model.status === "online" ? "bg-green-500/10 text-green-500 border-green-500/30" :
                            "bg-red-500/10 text-red-500 border-red-500/30"
                          }
                        >
                          {model.status === "standby" ? <Clock className="w-3 h-3 mr-1" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                          {translateStatus(model.status)}
                        </Badge>
                      </div>
                      <CardDescription>{translateType(model.layer)} {t("adminAI.layer")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">{t("adminAI.latency")}</span>
                          <p className="font-medium">{model.latency}ms</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t("adminAI.tokenRate")}</span>
                          <p className="font-medium">{model.tokenRate}/sec</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t("adminAI.accuracy")}</span>
                          <p className="font-medium">{Number(model.accuracy || 0).toFixed(2)}%</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t("adminAI.requests24h")}</span>
                          <p className="font-medium">{(model.requests24h ?? 0).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{t("adminAI.cost24h")}</span>
                          <span className="font-medium">${model.cost24h.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewModel(model)}>
                          <Eye className="w-4 h-4 mr-1" />
                          {t("adminAI.view")}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleSyncModel(model)}>
                          <RotateCcw className="w-4 h-4 mr-1" />
                          {t("adminAI.sync")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" data-testid="tab-content-performance">
            <Card data-testid="card-latency-comparison">
              <CardHeader>
                <CardTitle>{t("adminAI.latencyComparison")}</CardTitle>
                <CardDescription>{t("adminAI.latencyComparisonDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-80 w-full" />
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={aiData.performance}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="gemini" stroke="#3b82f6" name="AI Engine α" strokeWidth={2} />
                        <Line type="monotone" dataKey="claude" stroke="#a855f7" name="AI Engine β" strokeWidth={2} />
                        <Line type="monotone" dataKey="openai" stroke="#22c55e" name="AI Engine γ" strokeWidth={2} />
                        <Line type="monotone" dataKey="grok" stroke="#f97316" name="AI Engine δ" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold">{aiData.stats.overallAccuracy}%</div>
                  <div className="text-sm text-muted-foreground">{t("adminAI.overallAccuracy")}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold">{aiData.stats.totalRequests24h}</div>
                  <div className="text-sm text-muted-foreground">{t("adminAI.totalRequests24h")}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold">${aiData.stats.totalCost24h}</div>
                  <div className="text-sm text-muted-foreground">{t("adminAI.totalCost24h")}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold">{aiData.stats.uptime}%</div>
                  <div className="text-sm text-muted-foreground">{t("adminAI.uptime")}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {selectedModel && (
        <DetailSheet
          open={detailOpen}
          onOpenChange={setDetailOpen}
          title={t("adminAI.detail.title")}
          subtitle={selectedModel.name}
          icon={<Brain className="w-5 h-5" />}
          sections={getModelDetailSections(selectedModel)}
          actions={[
            {
              label: t("adminAI.sync"),
              icon: <RotateCcw className="w-4 h-4" />,
              onClick: () => {
                setDetailOpen(false);
                handleSyncModel(selectedModel);
              },
            },
          ]}
        />
      )}

      <ConfirmationDialog
        open={syncDialogOpen}
        onOpenChange={setSyncDialogOpen}
        title={t("adminAI.confirmSync.title")}
        description={t("adminAI.confirmSync.description", { name: modelToSync?.name })}
        confirmText={t("adminAI.sync")}
        actionType="restart"
        destructive={false}
        onConfirm={() => { if (modelToSync) syncModelMutation.mutate(modelToSync.id); }}
        isLoading={syncModelMutation.isPending}
      />

      <AIStatsDetailDialog
        open={statsDialogOpen}
        onOpenChange={setStatsDialogOpen}
        statType={selectedStatType}
        aiModels={aiData.models}
        t={t}
      />
    </ScrollArea>
  );
}
