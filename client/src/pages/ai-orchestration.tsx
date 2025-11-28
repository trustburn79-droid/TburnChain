import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Bot, Cpu, DollarSign, Zap, Activity, TrendingUp, Brain, Network, Scale, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

function formatSafeDate(dateValue: string | Date | null | undefined, justNowText: string): string {
  if (!dateValue) return justNowText;
  try {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    if (isNaN(date.getTime())) return justNowText;
    return date.toLocaleString();
  } catch {
    return justNowText;
  }
}

export default function AIOrchestration() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("history");

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

  const totalRequests = aiModels?.reduce((sum, m) => sum + m.requestCount, 0) || 0;
  const totalCost = aiModels?.reduce((sum, m) => sum + parseFloat(m.totalCost), 0) || 0;
  const avgResponseTime = (aiModels?.reduce((sum, m) => sum + m.avgResponseTime, 0) || 0) / (aiModels?.length || 1);
  const avgCacheHitRate = (aiModels?.reduce((sum, m) => sum + m.cacheHitRate, 0) || 0) / (aiModels?.length || 1) / 100;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-600">{t('common.active')}</Badge>;
      case "inactive":
        return <Badge variant="secondary">{t('common.inactive')}</Badge>;
      case "error":
        return <Badge variant="destructive">{t('common.error')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getModelIcon = (name: string) => {
    if (name.includes("gpt")) return <Brain className="h-4 w-4" />;
    if (name.includes("claude")) return <Target className="h-4 w-4" />;
    if (name.includes("llama")) return <Zap className="h-4 w-4" />;
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
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold flex items-center gap-2">
          <Bot className="h-8 w-8" />
          {t('aiOrchestration.title')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('aiOrchestration.subtitle')}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <StatCard
              title={t('aiOrchestration.totalRequests')}
              value={formatNumber(totalRequests)}
              icon={Zap}
              subtitle={t('aiOrchestration.allModels')}
            />
            <StatCard
              title={t('aiOrchestration.avgResponseTime')}
              value={`${avgResponseTime.toFixed(0)}ms`}
              icon={Cpu}
              trend={{ value: 8.5, isPositive: false }}
              subtitle={t('aiOrchestration.acrossModels')}
            />
            <StatCard
              title={t('aiOrchestration.cacheHitRate')}
              value={`${avgCacheHitRate.toFixed(1)}%`}
              icon={Zap}
              trend={{ value: 15.2, isPositive: true }}
              subtitle={t('aiOrchestration.costSavings')}
            />
            <StatCard
              title={t('aiOrchestration.totalCost')}
              value={`$${totalCost.toFixed(2)}`}
              icon={DollarSign}
              subtitle={t('aiOrchestration.apiUsage')}
            />
          </>
        )}
      </div>

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
          ) : aiModels && aiModels.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {aiModels.map((model) => {
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

      <div className="grid gap-4 md:grid-cols-3">
        {isLoading ? (
          <>
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </>
        ) : aiModels && aiModels.length > 0 ? (
          aiModels.map((model) => {
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
                        {model.band === 'strategic' ? t('aiOrchestration.decisions') : model.band === 'tactical' ? t('aiOrchestration.actions') : t('aiOrchestration.operations')}:
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
                    <strong>{t('aiOrchestration.lastUsed')}:</strong> {model.lastUsed ? new Date(model.lastUsed).toLocaleTimeString() : t('common.active')}
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
          ) : aiModels && aiModels.length > 0 ? (
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
                  {aiModels.map((model) => (
                    <TableRow key={model.id} className="hover-elevate">
                      <TableCell className="font-semibold">
                        {getModelIcon(model.name)} {model.name}
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {t('aiOrchestration.decisionStream')}
              </CardTitle>
              <CardDescription className="mt-1">
                {t('aiOrchestration.realTimeAiDecisions')}
              </CardDescription>
            </div>
            {aiDecisions && aiDecisions.length > 0 && (
              <Badge variant="outline" className="gap-1">
                <TrendingUp className="h-3 w-3" />
                {aiDecisions.length} {t('aiOrchestration.decisions')}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="history" data-testid="tab-decisions-history">
                {t('aiOrchestration.decisionHistory')}
              </TabsTrigger>
              <TabsTrigger value="live" data-testid="tab-decisions-live">
                {t('aiOrchestration.liveFeed')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="history">
              {decisionsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : aiDecisions && aiDecisions.length > 0 ? (
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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {aiDecisions.map((decision) => (
                        <TableRow key={decision.id} className="hover-elevate" data-testid={`row-decision-${decision.id}`}>
                          <TableCell>
                            <Badge variant="outline" className={`capitalize ${
                              decision.band === 'strategic' ? 'border-blue-500 text-blue-600 dark:text-blue-400' :
                              decision.band === 'tactical' ? 'border-purple-500 text-purple-600 dark:text-purple-400' :
                              'border-green-500 text-green-600 dark:text-green-400'
                            }`}>
                              {decision.band || 'operational'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{decision.modelName || t('aiOrchestration.unknown')}</TableCell>
                          <TableCell className="max-w-md truncate" title={decision.decision || ''}>
                            {decision.decision || t('aiOrchestration.aiDecision')}
                          </TableCell>
                          <TableCell className="capitalize">{decision.category || t('aiOrchestration.general')}</TableCell>
                          <TableCell>
                            <Badge variant={
                              decision.impact === 'high' ? 'destructive' :
                              decision.impact === 'medium' ? 'secondary' :
                              'outline'
                            } className="capitalize">
                              {decision.impact || 'medium'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              decision.status === 'executed' ? 'default' :
                              decision.status === 'pending' ? 'secondary' :
                              'destructive'
                            } className="capitalize">
                              {decision.status || t('common.pending')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm tabular-nums">
                            {formatSafeDate(decision.createdAt, t('aiOrchestration.justNow'))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">{t('aiOrchestration.noAiDecisionsRecorded')}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="live">
              {decisionsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : aiDecisions && aiDecisions.length > 0 ? (
                <div className="space-y-3">
                  {aiDecisions.slice(0, 10).map((decision) => (
                    <Card key={decision.id} className={`hover-elevate ${getBandColor(decision.band || 'operational')}`} data-testid={`card-live-decision-${decision.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="capitalize text-xs">
                                {decision.band || 'operational'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{decision.modelName || t('aiOrchestration.unknown')}</span>
                            </div>
                            <p className="text-sm font-medium">{decision.decision || t('aiOrchestration.aiDecision')}</p>
                            <p className="text-xs text-muted-foreground">{formatSafeDate(decision.createdAt, t('aiOrchestration.justNow'))}</p>
                          </div>
                          <Badge variant={
                            decision.status === 'executed' ? 'default' :
                            decision.status === 'pending' ? 'secondary' :
                            'destructive'
                          } className="capitalize">
                            {decision.status || t('common.pending')}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">{t('aiOrchestration.noAiDecisionsRecorded')}</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
