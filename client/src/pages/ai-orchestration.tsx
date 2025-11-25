import { useState } from "react";
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

// Safe date formatting - handles null/invalid dates gracefully
function formatSafeDate(dateValue: string | Date | null | undefined): string {
  if (!dateValue) return 'Just now';
  try {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    if (isNaN(date.getTime())) return 'Just now';
    return date.toLocaleString();
  } catch {
    return 'Just now';
  }
}

export default function AIOrchestration() {
  const [activeTab, setActiveTab] = useState("history");

  const { data: aiModels, isLoading } = useQuery<AiModel[]>({
    queryKey: ["/api/ai/models"],
  });

  const { data: aiDecisions, isLoading: decisionsLoading } = useQuery<AiDecision[]>({
    queryKey: ["/api/ai/decisions"],
  });

  // WebSocket integration for real-time AI decisions
  useWebSocketChannel({
    channel: "ai_decisions_snapshot",
    schema: aiDecisionsSnapshotSchema,
    queryKey: ["/api/ai/decisions"],
    updateMode: "snapshot",
  });

  const totalRequests = aiModels?.reduce((sum, m) => sum + m.requestCount, 0) || 0;
  const totalCost = aiModels?.reduce((sum, m) => sum + parseFloat(m.totalCost), 0) || 0;
  const avgResponseTime = (aiModels?.reduce((sum, m) => sum + m.avgResponseTime, 0) || 0) / (aiModels?.length || 1);
  const avgCacheHitRate = (aiModels?.reduce((sum, m) => sum + m.cacheHitRate, 0) || 0) / (aiModels?.length || 1) / 100; // Convert basis points to percentage

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-600">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
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
        return "Strategic AI • Long-term Planning";
      case "tactical":
        return "Tactical AI • Mid-term Optimization";
      case "operational":
        return "Operational AI • Real-time Control";
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
          AI Orchestration
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Triple-Band AI System: Strategic • Tactical • Operational
        </p>
      </div>

      {/* AI Stats */}
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
              title="Total Requests"
              value={formatNumber(totalRequests)}
              icon={Zap}
              subtitle="all models"
            />
            <StatCard
              title="Avg Response Time"
              value={`${avgResponseTime.toFixed(0)}ms`}
              icon={Cpu}
              trend={{ value: 8.5, isPositive: false }}
              subtitle="across models"
            />
            <StatCard
              title="Cache Hit Rate"
              value={`${avgCacheHitRate.toFixed(1)}%`}
              icon={Zap}
              trend={{ value: 15.2, isPositive: true }}
              subtitle="cost savings"
            />
            <StatCard
              title="Total Cost"
              value={`$${totalCost.toFixed(2)}`}
              icon={DollarSign}
              subtitle="API usage"
            />
          </>
        )}
      </div>

      {/* TBURN v7.0: Triple-Band Decision Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Triple-Band Decision Breakdown
          </CardTitle>
          <CardDescription>
            Real-time decision distribution across strategic, tactical, and operational AI layers
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
                      <span className="text-sm font-medium capitalize">{model.band} AI</span>
                      <Badge variant="outline" className="text-xs">
                        {formatNumber(totalDecisions)} total
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Strategic</span>
                          <span className="font-semibold">{formatNumber(model.strategicDecisions)} ({strategicPct.toFixed(1)}%)</span>
                        </div>
                        <Progress value={strategicPct} className="h-1.5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Tactical</span>
                          <span className="font-semibold">{formatNumber(model.tacticalDecisions)} ({tacticalPct.toFixed(1)}%)</span>
                        </div>
                        <Progress value={tacticalPct} className="h-1.5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Operational</span>
                          <span className="font-semibold">{formatNumber(model.operationalDecisions)} ({operationalPct.toFixed(1)}%)</span>
                        </div>
                        <Progress value={operationalPct} className="h-1.5" />
                      </div>
                    </div>
                    <div className="pt-2 border-t text-xs text-muted-foreground flex items-center justify-between">
                      <span>Consensus Contribution:</span>
                      <span className="font-semibold text-foreground">{formatNumber(model.consensusContribution)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground text-sm">No decision data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Model Status Grid */}
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
                        <CardTitle className="text-lg font-bold capitalize">{model.band} AI</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {model.name} • {getBandLabel(model.band)?.split(' • ')[1] || 'AI Processing'}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(model.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Uptime:</span>
                      <span className="font-semibold tabular-nums">{uptime.toFixed(2)}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {model.band === 'strategic' ? 'Decisions' : model.band === 'tactical' ? 'Actions' : 'Operations'}:
                      </span>
                      <span className="font-semibold tabular-nums">{formatNumber(model.requestCount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Accuracy:</span>
                      <span className="font-semibold tabular-nums">{accuracy.toFixed(2)}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Cache Hit:</span>
                      <span className="font-semibold tabular-nums">{cacheHit.toFixed(1)}%</span>
                    </div>
                  </div>
                  
                  {/* TBURN v7.0: Triple-Band Feedback Learning Metrics */}
                  <div className="pt-3 border-t space-y-2">
                    <div className="flex items-center justify-between text-sm" data-testid={`metric-learning-${model.name}`}>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Brain className="h-3 w-3" />
                        Learning:
                      </span>
                      <span className="font-semibold tabular-nums">{(model.feedbackLearningScore / 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm" data-testid={`metric-crossband-${model.name}`}>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Network className="h-3 w-3" />
                        Cross-Band:
                      </span>
                      <span className="font-semibold tabular-nums">{formatNumber(model.crossBandInteractions)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm" data-testid={`metric-weight-${model.name}`}>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Scale className="h-3 w-3" />
                        Weight:
                      </span>
                      <span className="font-semibold tabular-nums">{(model.modelWeight / 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t text-xs text-muted-foreground">
                    <strong>Last Used:</strong> {model.lastUsed ? new Date(model.lastUsed).toLocaleTimeString() : 'Active'}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-3 text-center py-12">
            <p className="text-muted-foreground">No AI models configured</p>
          </div>
        )}
      </div>

      {/* Detailed Model Table */}
      <Card>
        <CardHeader>
          <CardTitle>Model Performance Details</CardTitle>
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
                    <TableHead>Model</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requests</TableHead>
                    <TableHead>Success</TableHead>
                    <TableHead>Failed</TableHead>
                    <TableHead>Avg Time</TableHead>
                    <TableHead>Cache Hit</TableHead>
                    <TableHead>Learning</TableHead>
                    <TableHead>Cross-Band</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
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
              <p className="text-muted-foreground">No model data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Decision Stream */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                AI Decision Stream
              </CardTitle>
              <CardDescription className="mt-1">
                Real-time AI decisions across all bands
              </CardDescription>
            </div>
            {aiDecisions && aiDecisions.length > 0 && (
              <Badge variant="outline" className="gap-1">
                <TrendingUp className="h-3 w-3" />
                {aiDecisions.length} decisions
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="history" data-testid="tab-decisions-history">
                Decision History
              </TabsTrigger>
              <TabsTrigger value="live" data-testid="tab-decisions-live">
                Live Feed
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
                        <TableHead>Band</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Decision</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Impact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Timestamp</TableHead>
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
                          <TableCell className="font-medium">{decision.modelName || 'Unknown'}</TableCell>
                          <TableCell className="max-w-md truncate" title={decision.decision || ''}>
                            {decision.decision || 'AI Decision'}
                          </TableCell>
                          <TableCell className="capitalize">{decision.category || 'general'}</TableCell>
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
                              {decision.status || 'pending'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm tabular-nums">
                            {formatSafeDate(decision.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No AI decisions recorded yet</p>
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
                              <span className="text-xs text-muted-foreground">{decision.modelName || 'Unknown'}</span>
                              <Badge variant={decision.impact === 'high' ? 'destructive' : decision.impact === 'medium' ? 'secondary' : 'outline'} className="text-xs capitalize">
                                {decision.impact || 'medium'} impact
                              </Badge>
                            </div>
                            <p className="font-medium">{decision.decision || 'AI Decision'}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="capitalize">{decision.category || 'general'}</span>
                              <span>•</span>
                              <span>{formatSafeDate(decision.createdAt)}</span>
                            </div>
                          </div>
                          <Badge variant={
                            decision.status === 'executed' ? 'default' :
                            decision.status === 'pending' ? 'secondary' :
                            'destructive'
                          } className="capitalize shrink-0">
                            {decision.status || 'pending'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {aiDecisions.length > 10 && (
                    <p className="text-center text-sm text-muted-foreground">
                      Showing latest 10 decisions. View "Decision History" tab for all.
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No live decisions yet. Waiting for AI activity...</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
