import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { 
  Bot, Cpu, DollarSign, Zap, Activity, TrendingUp, Brain, Network, Scale, Target, 
  AlertCircle, CheckCircle, XCircle, RefreshCw, BarChart3, PieChart as PieChartIcon,
  Gauge, Clock, Server, Shield, Eye, ChevronRight, ArrowUpRight, ArrowDownRight,
  Layers, Database, Sparkles, Workflow, Timer, Hash
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { aiDecisionsSnapshotSchema } from "@shared/schema";
import type { AiModel, AiDecision } from "@shared/schema";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { z } from "zod";
import { TestBadge } from "@/components/TestBadge";

const localeMap: Record<string, string> = {
  en: 'en-US',
  zh: 'zh-CN',
  ja: 'ja-JP',
  hi: 'hi-IN',
  es: 'es-ES',
  fr: 'fr-FR',
  ar: 'ar-SA',
  bn: 'bn-BD',
  ru: 'ru-RU',
  pt: 'pt-BR',
  ur: 'ur-PK',
  ko: 'ko-KR',
};

const CHART_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

function formatSafeDate(dateValue: string | Date | null | undefined, justNowText: string, locale: string): string {
  if (!dateValue) return justNowText;
  try {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    if (isNaN(date.getTime())) return justNowText;
    const localeCode = localeMap[locale] || locale || 'en-US';
    return date.toLocaleString(localeCode, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return justNowText;
  }
}

type TranslationFn = (key: string, options?: { defaultValue?: string; returnObjects?: boolean }) => string;

function getTranslatedDecision(decision: string | null | undefined, t: TranslationFn): string {
  if (!decision) return t('aiOrchestration.aiDecision');
  const decisionKey = decision.toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
  if (!decisionKey || decisionKey.trim() === '') {
    return decision;
  }
  const translationKey = `aiOrchestration.decisions.${decisionKey}`;
  const translated = t(translationKey, { defaultValue: decision, returnObjects: false });
  return (typeof translated === 'string' && translated !== translationKey) ? translated : decision;
}

function getTranslatedCategory(category: string | null | undefined, t: TranslationFn): string {
  if (!category) return t('aiOrchestration.general');
  const categoryKey = category.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!categoryKey || categoryKey.trim() === '') {
    return category;
  }
  const translationKey = `aiOrchestration.categories.${categoryKey}`;
  const translated = t(translationKey, { defaultValue: category, returnObjects: false });
  return (typeof translated === 'string' && translated !== translationKey) ? translated : category;
}

function getTranslatedImpact(impact: string | null | undefined, t: TranslationFn): string {
  if (!impact) return t('aiOrchestration.impactLevels.medium');
  const impactKey = impact.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!impactKey || impactKey.trim() === '') {
    return impact;
  }
  const translationKey = `aiOrchestration.impactLevels.${impactKey}`;
  const translated = t(translationKey, { defaultValue: impact, returnObjects: false });
  return (typeof translated === 'string' && translated !== translationKey) ? translated : impact;
}

function getTranslatedStatus(status: string | null | undefined, t: TranslationFn): string {
  if (!status) return t('common.pending');
  const statusKey = status.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!statusKey || statusKey.trim() === '') {
    return status;
  }
  const translationKey = `aiOrchestration.statuses.${statusKey}`;
  const translated = t(translationKey, { defaultValue: status, returnObjects: false });
  return (typeof translated === 'string' && translated !== translationKey) ? translated : status;
}

function getTranslatedBand(band: string | null | undefined, t: TranslationFn): string {
  if (!band) return t('aiOrchestration.operational');
  const bandKey = band.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!bandKey || bandKey.trim() === '') {
    return band;
  }
  const translationKey = `aiOrchestration.bands.${bandKey}`;
  const translated = t(translationKey, { defaultValue: band, returnObjects: false });
  return (typeof translated === 'string' && translated !== translationKey) ? translated : band;
}

type StatType = 'requests' | 'responseTime' | 'cacheRate' | 'cost' | 'accuracy';

function AIStatsDetailDialog({ 
  open, 
  onOpenChange, 
  statType, 
  aiModels, 
  aiDecisions,
  t 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  statType: StatType | null; 
  aiModels: AiModel[];
  aiDecisions: AiDecision[];
  t: TranslationFn;
}) {
  if (!statType) return null;

  const hasModels = aiModels.length > 0;
  const hasDecisions = aiDecisions.length > 0;
  
  const getDialogContent = () => {
    switch (statType) {
      case 'requests': {
        const totalRequests = aiModels.reduce((sum, m) => sum + m.requestCount, 0);
        const successTotal = aiModels.reduce((sum, m) => sum + m.successCount, 0);
        const failureTotal = aiModels.reduce((sum, m) => sum + m.failureCount, 0);
        const successRate = totalRequests > 0 ? (successTotal / totalRequests) * 100 : 0;
        
        const distributionData = hasModels ? aiModels.map((m, i) => ({
          name: m.name,
          value: m.requestCount,
          color: CHART_COLORS[i % CHART_COLORS.length],
        })) : [];
        
        const trendData = hasModels ? aiModels.map((m) => ({
          name: m.name.split('-')[0],
          requests: m.requestCount,
          success: m.successCount,
          failed: m.failureCount,
        })) : [];

        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                {t('aiOrchestration.requestAnalytics')}
              </DialogTitle>
              <DialogDescription>{t('aiOrchestration.requestAnalyticsDesc')}</DialogDescription>
            </DialogHeader>
            {!hasModels ? (
              <div className="py-12 text-center text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('aiOrchestration.noModelDataAvailable')}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t('aiOrchestration.requestDistribution')}</CardTitle>
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
                          <Tooltip formatter={(value) => [formatNumber(Number(value)), t('aiOrchestration.requests')]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t('aiOrchestration.successVsFailure')}</CardTitle>
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
                        <div className="text-xs text-muted-foreground">{t('aiOrchestration.totalRequests')}</div>
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
                        <div className="text-xs text-muted-foreground">{t('aiOrchestration.successRate')}</div>
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
        const avgTime = hasModels ? aiModels.reduce((sum, m) => sum + m.avgResponseTime, 0) / aiModels.length : 0;
        const minTime = hasModels ? Math.min(...aiModels.map(m => m.avgResponseTime)) : 0;
        const maxTime = hasModels ? Math.max(...aiModels.map(m => m.avgResponseTime)) : 0;
        
        const timeData = hasModels ? aiModels.map((m) => ({
          name: m.name.split('-')[0],
          time: m.avgResponseTime,
          band: m.band,
        })) : [];

        const distributionData = hasModels ? [
          { range: '0-500ms', count: aiModels.filter(m => m.avgResponseTime < 500).length },
          { range: '500-1000ms', count: aiModels.filter(m => m.avgResponseTime >= 500 && m.avgResponseTime < 1000).length },
          { range: '1000-2000ms', count: aiModels.filter(m => m.avgResponseTime >= 1000 && m.avgResponseTime < 2000).length },
          { range: '2000ms+', count: aiModels.filter(m => m.avgResponseTime >= 2000).length },
        ] : [];

        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-orange-500" />
                {t('aiOrchestration.responseTimeAnalytics')}
              </DialogTitle>
              <DialogDescription>{t('aiOrchestration.responseTimeAnalyticsDesc')}</DialogDescription>
            </DialogHeader>
            {!hasModels ? (
              <div className="py-12 text-center text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('aiOrchestration.noModelDataAvailable')}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t('aiOrchestration.responseTimeByModel')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={timeData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis type="number" className="text-xs" />
                          <YAxis type="category" dataKey="name" className="text-xs" width={80} />
                          <Tooltip formatter={(value) => [`${value}ms`, t('aiOrchestration.avgTime')]} />
                          <Bar dataKey="time" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t('aiOrchestration.timeDistribution')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={distributionData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="range" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip />
                          <Bar dataKey="count" fill="#8B5CF6" name={t('aiOrchestration.models')} radius={[4, 4, 0, 0]} />
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
                        <div className="text-xs text-muted-foreground">{t('aiOrchestration.avgResponseTime')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{minTime}ms</div>
                        <div className="text-xs text-muted-foreground">{t('aiOrchestration.fastestModel')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">{maxTime}ms</div>
                        <div className="text-xs text-muted-foreground">{t('aiOrchestration.slowestModel')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{aiModels.length}</div>
                        <div className="text-xs text-muted-foreground">{t('aiOrchestration.activeModels')}</div>
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
        const avgCacheRate = hasModels ? aiModels.reduce((sum, m) => sum + m.cacheHitRate, 0) / aiModels.length / 100 : 0;
        
        const cacheData = hasModels ? aiModels.map((m) => ({
          name: m.name.split('-')[0],
          hitRate: m.cacheHitRate / 100,
          band: m.band,
        })) : [];

        const savingsEstimate = hasModels ? aiModels.reduce((sum, m) => {
          const hits = Math.floor(m.requestCount * (m.cacheHitRate / 10000));
          return sum + (hits * parseFloat(m.totalCost) / Math.max(1, m.requestCount));
        }, 0) : 0;

        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-green-500" />
                {t('aiOrchestration.cacheAnalytics')}
              </DialogTitle>
              <DialogDescription>{t('aiOrchestration.cacheAnalyticsDesc')}</DialogDescription>
            </DialogHeader>
            {!hasModels ? (
              <div className="py-12 text-center text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('aiOrchestration.noModelDataAvailable')}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t('aiOrchestration.cacheHitByModel')}</CardTitle>
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
                      <CardTitle className="text-sm">{t('aiOrchestration.cacheTrend')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={cacheData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="name" className="text-xs" />
                          <YAxis domain={[0, 100]} className="text-xs" />
                          <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, t('aiOrchestration.cacheHit')]} />
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
                        <div className="text-xs text-muted-foreground">{t('aiOrchestration.avgCacheHitRate')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">${savingsEstimate.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">{t('aiOrchestration.estimatedSavings')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{aiModels.length}</div>
                        <div className="text-xs text-muted-foreground">{t('aiOrchestration.cachedModels')}</div>
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
        const totalCost = hasModels ? aiModels.reduce((sum, m) => sum + parseFloat(m.totalCost), 0) : 0;
        const avgCostPerRequest = hasModels ? totalCost / Math.max(1, aiModels.reduce((sum, m) => sum + m.requestCount, 0)) : 0;
        
        const costData = hasModels ? aiModels.map((m, i) => ({
          name: m.name.split('-')[0],
          cost: parseFloat(m.totalCost),
          color: CHART_COLORS[i % CHART_COLORS.length],
        })) : [];

        const bandCostData = hasModels ? ['strategic', 'tactical', 'operational'].map((band) => {
          const bandModels = aiModels.filter(m => m.band === band);
          return {
            band: band.charAt(0).toUpperCase() + band.slice(1),
            cost: bandModels.reduce((sum, m) => sum + parseFloat(m.totalCost), 0),
          };
        }) : [];

        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-yellow-500" />
                {t('aiOrchestration.costAnalytics')}
              </DialogTitle>
              <DialogDescription>{t('aiOrchestration.costAnalyticsDesc')}</DialogDescription>
            </DialogHeader>
            {!hasModels ? (
              <div className="py-12 text-center text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('aiOrchestration.noModelDataAvailable')}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t('aiOrchestration.costByModel')}</CardTitle>
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
                          <Tooltip formatter={(value) => [`$${Number(value).toFixed(4)}`, t('aiOrchestration.cost')]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t('aiOrchestration.costByBand')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={bandCostData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="band" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip formatter={(value) => [`$${Number(value).toFixed(4)}`, t('aiOrchestration.cost')]} />
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
                        <div className="text-2xl font-bold text-yellow-600">${totalCost.toFixed(4)}</div>
                        <div className="text-xs text-muted-foreground">{t('aiOrchestration.totalCost')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">${avgCostPerRequest.toFixed(6)}</div>
                        <div className="text-xs text-muted-foreground">{t('aiOrchestration.avgCostPerRequest')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{aiModels.length}</div>
                        <div className="text-xs text-muted-foreground">{t('aiOrchestration.billedModels')}</div>
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
        const avgAccuracy = hasModels ? aiModels.reduce((sum, m) => sum + (m.accuracy || 0), 0) / aiModels.length / 100 : 0;
        const avgLearning = hasModels ? aiModels.reduce((sum, m) => sum + m.feedbackLearningScore, 0) / aiModels.length / 100 : 0;
        
        const accuracyData = hasModels ? aiModels.map((m) => ({
          name: m.name.split('-')[0],
          accuracy: (m.accuracy || 0) / 100,
          learning: m.feedbackLearningScore / 100,
          band: m.band,
        })) : [];

        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-500" />
                {t('aiOrchestration.accuracyAnalytics')}
              </DialogTitle>
              <DialogDescription>{t('aiOrchestration.accuracyAnalyticsDesc')}</DialogDescription>
            </DialogHeader>
            {!hasModels ? (
              <div className="py-12 text-center text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('aiOrchestration.noModelDataAvailable')}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t('aiOrchestration.accuracyByModel')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={accuracyData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="name" className="text-xs" />
                          <YAxis domain={[0, 100]} className="text-xs" />
                          <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, '']} />
                          <Bar dataKey="accuracy" fill="#8B5CF6" name={t('aiOrchestration.accuracy')} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t('aiOrchestration.learningProgress')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {accuracyData.map((model, i) => (
                          <div key={i}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm flex items-center gap-1">
                                <Brain className="h-3 w-3" />
                                {model.name}
                              </span>
                              <span className="text-sm font-semibold">{model.learning.toFixed(1)}%</span>
                            </div>
                            <Progress value={model.learning} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <Card className="mt-4 bg-muted">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{avgAccuracy.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">{t('aiOrchestration.avgAccuracy')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{avgLearning.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">{t('aiOrchestration.avgLearningScore')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{aiModels.filter(m => (m.accuracy || 0) > 9000).length}</div>
                        <div className="text-xs text-muted-foreground">{t('aiOrchestration.highAccuracyModels')}</div>
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid={`dialog-ai-stats-${statType}`}>
        {getDialogContent()}
      </DialogContent>
    </Dialog>
  );
}

function DecisionDetailDialog({
  open,
  onOpenChange,
  decision,
  t,
  locale,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decision: AiDecision | null;
  t: TranslationFn;
  locale: string;
}) {
  if (!decision) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid={`dialog-decision-detail-${decision.id}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            {t('aiOrchestration.decisionDetail')}
          </DialogTitle>
          <DialogDescription>{t('aiOrchestration.decisionDetailDesc')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t('aiOrchestration.decisionInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('aiOrchestration.band')}:</span>
                  <Badge variant="outline" className={`${
                    decision.band === 'strategic' ? 'border-blue-500 text-blue-600' :
                    decision.band === 'tactical' ? 'border-purple-500 text-purple-600' :
                    'border-green-500 text-green-600'
                  }`}>
                    {getTranslatedBand(decision.band, t)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('aiOrchestration.model')}:</span>
                  <span className="font-medium">{decision.modelName || t('aiOrchestration.unknown')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('aiOrchestration.category')}:</span>
                  <span className="font-medium">{getTranslatedCategory(decision.category, t)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('aiOrchestration.impact')}:</span>
                  <Badge variant={
                    decision.impact === 'high' ? 'destructive' :
                    decision.impact === 'medium' ? 'secondary' : 'outline'
                  }>
                    {getTranslatedImpact(decision.impact, t)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('common.status')}:</span>
                  <Badge variant={
                    decision.status === 'executed' ? 'default' :
                    decision.status === 'pending' ? 'secondary' : 'destructive'
                  }>
                    {getTranslatedStatus(decision.status, t)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t('aiOrchestration.metadata')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('aiOrchestration.decisionId')}:</span>
                  <span className="font-mono text-xs">{decision.id.slice(0, 12)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('aiOrchestration.timestamp')}:</span>
                  <span className="text-sm">{formatSafeDate(decision.createdAt, t('aiOrchestration.justNow'), locale)}</span>
                </div>
                {decision.confidence && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('aiOrchestration.confidence')}:</span>
                    <span className="font-medium">{decision.confidence}%</span>
                  </div>
                )}
                {decision.executionTime && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('aiOrchestration.executionTime')}:</span>
                    <span className="font-medium">{decision.executionTime}ms</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t('aiOrchestration.decision')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{getTranslatedDecision(decision.decision, t)}</p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AIOrchestration() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedStatType, setSelectedStatType] = useState<StatType | null>(null);
  const [selectedDecision, setSelectedDecision] = useState<AiDecision | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [bandFilter, setBandFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: aiModels, isLoading } = useQuery<AiModel[]>({
    queryKey: ["/api/ai/models"],
  });

  const { data: aiDecisions, isLoading: decisionsLoading } = useQuery<AiDecision[]>({
    queryKey: ["/api/ai/decisions"],
  });

  useWebSocketChannel({
    channel: "ai_decisions_snapshot",
    schema: aiDecisionsSnapshotSchema,
    queryKey: ["/api/ai/decisions"],
    updateMode: "snapshot",
  });

  const models = aiModels || [];
  const decisions = aiDecisions || [];
  
  const totalRequests = models.reduce((sum, m) => sum + m.requestCount, 0);
  const totalCost = models.reduce((sum, m) => sum + parseFloat(m.totalCost), 0);
  const avgResponseTime = models.length > 0 ? models.reduce((sum, m) => sum + m.avgResponseTime, 0) / models.length : 0;
  const avgCacheHitRate = models.length > 0 ? models.reduce((sum, m) => sum + m.cacheHitRate, 0) / models.length / 100 : 0;
  const avgAccuracy = models.length > 0 ? models.reduce((sum, m) => sum + (m.accuracy || 0), 0) / models.length / 100 : 0;

  const filteredDecisions = decisions.filter((decision) => {
    const matchesSearch = searchQuery === "" || 
      (decision.decision && decision.decision.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (decision.modelName && decision.modelName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesBand = bandFilter === "all" || decision.band === bandFilter;
    const matchesStatus = statusFilter === "all" || decision.status === statusFilter;
    return matchesSearch && matchesBand && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-600">{t('common.active')}</Badge>;
      case "inactive":
        return <Badge variant="secondary">{t('common.inactive')}</Badge>;
      case "standby":
        return <Badge className="bg-orange-500">{t('aiOrchestration.standby')}</Badge>;
      case "error":
        return <Badge variant="destructive">{t('common.error')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getModelIcon = (name: string) => {
    if (name.includes("grok")) return <RefreshCw className="h-4 w-4" />;
    if (name.includes("gpt")) return <Brain className="h-4 w-4" />;
    if (name.includes("claude")) return <Target className="h-4 w-4" />;
    if (name.includes("llama") || name.includes("gemini")) return <Zap className="h-4 w-4" />;
    return <Bot className="h-4 w-4" />;
  };

  const getBandLabel = (band: string) => {
    switch (band) {
      case "strategic":
        return `${t('aiOrchestration.strategicAi')} • ${t('aiOrchestration.longTermPlanning')}`;
      case "tactical":
        return `${t('aiOrchestration.tacticalAi')} • ${t('aiOrchestration.midTermOptimization')}`;
      case "operational":
        return `${t('aiOrchestration.operationalAi')} • ${t('aiOrchestration.realTimeControl')}`;
      case "fallback":
        return `${t('aiOrchestration.fallbackAi')} • ${t('aiOrchestration.emergencyBackup')}`;
      default:
        return band;
    }
  };

  const getBandColor = (band: string) => {
    switch (band) {
      case "strategic":
        return "border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-500/10";
      case "tactical":
        return "border-l-4 border-l-purple-500 bg-purple-50 dark:bg-purple-500/10";
      case "operational":
        return "border-l-4 border-l-green-500 bg-green-50 dark:bg-green-500/10";
      case "fallback":
        return "border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-500/10";
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold flex items-center gap-2" data-testid="text-ai-orchestration-title">
              <Bot className="h-8 w-8" />
              {t('aiOrchestration.title')}
            </h1>
            <TestBadge />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {t('aiOrchestration.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Activity className="h-3 w-3 animate-pulse text-green-500" />
            {t('common.live')}
          </Badge>
        </div>
      </div>

      {/* Clickable Statistics Cards */}
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
              onClick={() => setSelectedStatType('requests')}
              data-testid="card-stat-requests"
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('aiOrchestration.totalRequests')}</p>
                    <p className="text-2xl font-bold">{formatNumber(totalRequests)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t('aiOrchestration.allModels')}</p>
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
              onClick={() => setSelectedStatType('responseTime')}
              data-testid="card-stat-response-time"
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('aiOrchestration.avgResponseTime')}</p>
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
                  {t('aiOrchestration.viewDetails')}
                </div>
              </CardContent>
            </Card>

            <Card 
              className="hover-elevate cursor-pointer"
              onClick={() => setSelectedStatType('cacheRate')}
              data-testid="card-stat-cache-rate"
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('aiOrchestration.cacheHitRate')}</p>
                    <p className="text-2xl font-bold">{avgCacheHitRate.toFixed(1)}%</p>
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
                  {t('aiOrchestration.viewDetails')}
                </div>
              </CardContent>
            </Card>

            <Card 
              className="hover-elevate cursor-pointer"
              onClick={() => setSelectedStatType('cost')}
              data-testid="card-stat-cost"
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('aiOrchestration.totalCost')}</p>
                    <p className="text-2xl font-bold">${totalCost.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t('aiOrchestration.apiUsage')}</p>
                  </div>
                  <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-500/20">
                    <DollarSign className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs text-yellow-600">
                  <ChevronRight className="h-3 w-3" />
                  {t('aiOrchestration.viewDetails')}
                </div>
              </CardContent>
            </Card>

            <Card 
              className="hover-elevate cursor-pointer"
              onClick={() => setSelectedStatType('accuracy')}
              data-testid="card-stat-accuracy"
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('aiOrchestration.avgAccuracy')}</p>
                    <p className="text-2xl font-bold">{avgAccuracy.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground mt-1">{t('aiOrchestration.allModels')}</p>
                  </div>
                  <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-500/20">
                    <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs text-purple-600">
                  <ChevronRight className="h-3 w-3" />
                  {t('aiOrchestration.viewDetails')}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" data-testid="tab-overview">
            <Layers className="h-4 w-4 mr-2" />
            {t('aiOrchestration.overview')}
          </TabsTrigger>
          <TabsTrigger value="models" data-testid="tab-models">
            <Server className="h-4 w-4 mr-2" />
            {t('aiOrchestration.models')}
          </TabsTrigger>
          <TabsTrigger value="decisions" data-testid="tab-decisions">
            <Workflow className="h-4 w-4 mr-2" />
            {t('aiOrchestration.decisionsLabel')}
          </TabsTrigger>
          <TabsTrigger value="live" data-testid="tab-live">
            <Activity className="h-4 w-4 mr-2" />
            {t('aiOrchestration.liveFeed')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Triple-Band Decision Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {t('aiOrchestration.tripleBandDecisionBreakdown')}
              </CardTitle>
              <CardDescription>
                {t('aiOrchestration.realTimeDecisionDistribution')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-24" />
              ) : models.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {models.map((model) => {
                    const totalDecisions = model.strategicDecisions + model.tacticalDecisions + model.operationalDecisions;
                    const strategicPct = totalDecisions > 0 ? (model.strategicDecisions / totalDecisions * 100) : 0;
                    const tacticalPct = totalDecisions > 0 ? (model.tacticalDecisions / totalDecisions * 100) : 0;
                    const operationalPct = totalDecisions > 0 ? (model.operationalDecisions / totalDecisions * 100) : 0;
                    
                    return (
                      <div key={model.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">{model.band} {t('aiOrchestration.ai')}</span>
                          <Badge variant="outline" className="text-xs">
                            {formatNumber(totalDecisions)} {t('common.total')}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{t('aiOrchestration.strategic')}</span>
                              <span className="font-semibold">{formatNumber(model.strategicDecisions)} ({strategicPct.toFixed(1)}%)</span>
                            </div>
                            <Progress value={strategicPct} className="h-1.5" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{t('aiOrchestration.tactical')}</span>
                              <span className="font-semibold">{formatNumber(model.tacticalDecisions)} ({tacticalPct.toFixed(1)}%)</span>
                            </div>
                            <Progress value={tacticalPct} className="h-1.5" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{t('aiOrchestration.operational')}</span>
                              <span className="font-semibold">{formatNumber(model.operationalDecisions)} ({operationalPct.toFixed(1)}%)</span>
                            </div>
                            <Progress value={operationalPct} className="h-1.5" />
                          </div>
                        </div>
                        <div className="pt-2 border-t text-xs text-muted-foreground flex items-center justify-between">
                          <span>{t('aiOrchestration.consensusContribution')}:</span>
                          <span className="font-semibold text-foreground">{formatNumber(model.consensusContribution)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground text-sm">{t('aiOrchestration.noDecisionDataAvailable')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Model Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              <>
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
              </>
            ) : models.length > 0 ? (
              models.map((model) => {
                const successRate = model.requestCount > 0
                  ? (model.successCount / model.requestCount) * 100
                  : 0;

                const uptime = model.uptime ? model.uptime / 100 : 99.9;
                const accuracy = model.accuracy ? model.accuracy / 100 : successRate;
                const cacheHit = model.cacheHitRate / 100;

                return (
                  <Card 
                    key={model.id} 
                    className={`hover-elevate ${getBandColor(model.band)}`}
                    data-testid={`card-ai-model-${model.name}`}
                  >
                    <CardHeader className="space-y-2 pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="text-primary">{getModelIcon(model.name)}</div>
                          <div>
                            <CardTitle className="text-lg font-bold capitalize">{model.band} {t('aiOrchestration.ai')}</CardTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {model.name} • {getBandLabel(model.band)?.split(' • ')[1] || t('aiOrchestration.aiProcessing')}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(model.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{t('aiOrchestration.uptime')}:</span>
                          <span className="font-semibold tabular-nums">{uptime.toFixed(2)}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {model.band === 'strategic' ? t('aiOrchestration.decisionsLabel') : model.band === 'tactical' ? t('aiOrchestration.actionsLabel') : model.band === 'fallback' ? t('aiOrchestration.fallbackLabel') : t('aiOrchestration.operationsLabel')}:
                          </span>
                          <span className="font-semibold tabular-nums">{formatNumber(model.requestCount)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{t('aiOrchestration.accuracy')}:</span>
                          <span className="font-semibold tabular-nums">{accuracy.toFixed(2)}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{t('aiOrchestration.cacheHit')}:</span>
                          <span className="font-semibold tabular-nums">{cacheHit.toFixed(1)}%</span>
                        </div>
                      </div>
                      
                      <div className="pt-3 border-t space-y-2">
                        <div className="flex items-center justify-between text-sm" data-testid={`metric-learning-${model.name}`}>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Brain className="h-3 w-3" />
                            {t('aiOrchestration.learning')}:
                          </span>
                          <span className="font-semibold tabular-nums">{(model.feedbackLearningScore / 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm" data-testid={`metric-crossband-${model.name}`}>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Network className="h-3 w-3" />
                            {t('aiOrchestration.crossBand')}:
                          </span>
                          <span className="font-semibold tabular-nums">{formatNumber(model.crossBandInteractions)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm" data-testid={`metric-weight-${model.name}`}>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Scale className="h-3 w-3" />
                            {t('aiOrchestration.weight')}:
                          </span>
                          <span className="font-semibold tabular-nums">{(model.modelWeight / 100).toFixed(1)}%</span>
                        </div>
                      </div>
                      
                      <div className="pt-3 border-t text-xs text-muted-foreground">
                        <strong>{t('aiOrchestration.lastUsed')}:</strong> {model.lastUsed ? new Date(model.lastUsed).toLocaleTimeString('en-US', { timeZone: 'America/New_York' }) : t('common.active')}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-muted-foreground">{t('aiOrchestration.noAiModelsConfigured')}</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('aiOrchestration.modelPerformanceDetails')}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : models.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('aiOrchestration.model')}</TableHead>
                        <TableHead>{t('common.status')}</TableHead>
                        <TableHead>{t('aiOrchestration.requests')}</TableHead>
                        <TableHead>{t('common.success')}</TableHead>
                        <TableHead>{t('common.failed')}</TableHead>
                        <TableHead>{t('aiOrchestration.avgTime')}</TableHead>
                        <TableHead>{t('aiOrchestration.cacheHit')}</TableHead>
                        <TableHead>{t('aiOrchestration.learning')}</TableHead>
                        <TableHead>{t('aiOrchestration.crossBand')}</TableHead>
                        <TableHead>{t('aiOrchestration.weight')}</TableHead>
                        <TableHead className="text-right">{t('aiOrchestration.cost')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {models.map((model) => (
                        <TableRow key={model.id} className="hover-elevate">
                          <TableCell className="font-semibold">
                            <div className="flex items-center gap-2">
                              {getModelIcon(model.name)} {model.name}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(model.status)}</TableCell>
                          <TableCell className="tabular-nums">{formatNumber(model.requestCount)}</TableCell>
                          <TableCell className="tabular-nums text-green-600 dark:text-green-400">
                            {formatNumber(model.successCount)}
                          </TableCell>
                          <TableCell className="tabular-nums text-red-600 dark:text-red-400">
                            {formatNumber(model.failureCount)}
                          </TableCell>
                          <TableCell className="tabular-nums">{model.avgResponseTime}ms</TableCell>
                          <TableCell className="tabular-nums">{(model.cacheHitRate / 100).toFixed(1)}%</TableCell>
                          <TableCell className="tabular-nums">
                            <Badge variant="outline" className="font-mono text-xs">
                              {(model.feedbackLearningScore / 100).toFixed(1)}%
                            </Badge>
                          </TableCell>
                          <TableCell className="tabular-nums">{formatNumber(model.crossBandInteractions)}</TableCell>
                          <TableCell className="tabular-nums">{(model.modelWeight / 100).toFixed(1)}%</TableCell>
                          <TableCell className="text-right tabular-nums font-medium">
                            ${parseFloat(model.totalCost).toFixed(4)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">{t('aiOrchestration.noModelDataAvailable')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="decisions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Workflow className="h-5 w-5" />
                    {t('aiOrchestration.decisionHistory')}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {t('aiOrchestration.decisionHistoryDesc')}
                  </CardDescription>
                </div>
                <Badge variant="outline">
                  {filteredDecisions.length} {t('aiOrchestration.decisionsLabel')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder={t('aiOrchestration.searchDecisions')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                    data-testid="input-search-decisions"
                  />
                </div>
                <Select value={bandFilter} onValueChange={setBandFilter}>
                  <SelectTrigger className="w-[150px]" data-testid="select-band-filter">
                    <SelectValue placeholder={t('aiOrchestration.filterByBand')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    <SelectItem value="strategic">{t('aiOrchestration.strategic')}</SelectItem>
                    <SelectItem value="tactical">{t('aiOrchestration.tactical')}</SelectItem>
                    <SelectItem value="operational">{t('aiOrchestration.operational')}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]" data-testid="select-status-filter">
                    <SelectValue placeholder={t('aiOrchestration.filterByStatus')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    <SelectItem value="executed">{t('aiOrchestration.statuses.executed')}</SelectItem>
                    <SelectItem value="pending">{t('aiOrchestration.statuses.pending')}</SelectItem>
                    <SelectItem value="failed">{t('aiOrchestration.statuses.failed')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Decisions Table */}
              {decisionsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : filteredDecisions.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('aiOrchestration.band')}</TableHead>
                        <TableHead>{t('aiOrchestration.model')}</TableHead>
                        <TableHead>{t('aiOrchestration.decision')}</TableHead>
                        <TableHead>{t('aiOrchestration.category')}</TableHead>
                        <TableHead>{t('aiOrchestration.impact')}</TableHead>
                        <TableHead>{t('common.status')}</TableHead>
                        <TableHead>{t('aiOrchestration.timestamp')}</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDecisions.map((decision) => (
                        <TableRow key={decision.id} className="hover-elevate" data-testid={`row-decision-${decision.id}`}>
                          <TableCell>
                            <Badge variant="outline" className={`${
                              decision.band === 'strategic' ? 'border-blue-500 text-blue-600 dark:text-blue-400' :
                              decision.band === 'tactical' ? 'border-purple-500 text-purple-600 dark:text-purple-400' :
                              'border-green-500 text-green-600 dark:text-green-400'
                            }`}>
                              {getTranslatedBand(decision.band, t)}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{decision.modelName || t('aiOrchestration.unknown')}</TableCell>
                          <TableCell className="max-w-md truncate" title={getTranslatedDecision(decision.decision, t)}>
                            {getTranslatedDecision(decision.decision, t)}
                          </TableCell>
                          <TableCell>{getTranslatedCategory(decision.category, t)}</TableCell>
                          <TableCell>
                            <Badge variant={
                              decision.impact === 'high' ? 'destructive' :
                              decision.impact === 'medium' ? 'secondary' :
                              'outline'
                            }>
                              {getTranslatedImpact(decision.impact, t)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              decision.status === 'executed' ? 'default' :
                              decision.status === 'pending' ? 'secondary' :
                              'destructive'
                            }>
                              {getTranslatedStatus(decision.status, t)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm tabular-nums">
                            {formatSafeDate(decision.createdAt, t('aiOrchestration.justNow'), i18n.language)}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedDecision(decision)}
                              data-testid={`button-view-decision-${decision.id}`}
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
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">{t('aiOrchestration.noAiDecisionsRecorded')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 animate-pulse text-green-500" />
                    {t('aiOrchestration.liveDecisionStream')}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {t('aiOrchestration.realTimeAiDecisions')}
                  </CardDescription>
                </div>
                {decisions.length > 0 && (
                  <Badge variant="outline" className="gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {decisions.length} {t('aiOrchestration.decisionsLabel')}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {decisionsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : decisions.length > 0 ? (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3 pr-4">
                    {decisions.slice(0, 20).map((decision) => (
                      <Card 
                        key={decision.id} 
                        className={`hover-elevate cursor-pointer ${getBandColor(decision.band || 'operational')}`}
                        onClick={() => setSelectedDecision(decision)}
                        data-testid={`card-live-decision-${decision.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {getTranslatedBand(decision.band, t)}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{decision.modelName || t('aiOrchestration.unknown')}</span>
                              </div>
                              <p className="text-sm font-medium">{getTranslatedDecision(decision.decision, t)}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {formatSafeDate(decision.createdAt, t('aiOrchestration.justNow'), i18n.language)}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge variant={
                                decision.status === 'executed' ? 'default' :
                                decision.status === 'pending' ? 'secondary' :
                                'destructive'
                              }>
                                {getTranslatedStatus(decision.status, t)}
                              </Badge>
                              <Badge variant={
                                decision.impact === 'high' ? 'destructive' :
                                decision.impact === 'medium' ? 'secondary' : 'outline'
                              } className="text-xs">
                                {getTranslatedImpact(decision.impact, t)}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">{t('aiOrchestration.noAiDecisionsRecorded')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Stat Detail Dialog */}
      <AIStatsDetailDialog
        open={selectedStatType !== null}
        onOpenChange={(open) => !open && setSelectedStatType(null)}
        statType={selectedStatType}
        aiModels={models}
        aiDecisions={decisions}
        t={t}
      />

      {/* Decision Detail Dialog */}
      <DecisionDetailDialog
        open={selectedDecision !== null}
        onOpenChange={(open) => !open && setSelectedDecision(null)}
        decision={selectedDecision}
        t={t}
        locale={i18n.language}
      />
    </div>
  );
}
