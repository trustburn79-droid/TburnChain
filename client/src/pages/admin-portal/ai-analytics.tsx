import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { 
  Brain, TrendingUp, Target, BarChart3, PieChart, 
  Activity, Zap, Clock, CheckCircle, XCircle, RefreshCw,
  Download, AlertCircle, Eye
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart as RechartsPie, Pie, Cell } from "recharts";

interface DecisionType {
  name: string;
  value: number;
  color: string;
}

interface ImpactMetric {
  metric: string;
  before: number;
  after: number;
  improvement: string;
}

interface AccuracyTrendPoint {
  month: string;
  strategic: number;
  tactical: number;
  operational: number;
}

interface RecentOutcome {
  decision: string;
  type: string;
  confidence: number;
  outcome: string;
  impact: string;
}

interface AnalyticsData {
  overallMetrics: {
    totalDecisions: string;
    successRate: string;
    avgConfidence: string;
    costSavings: string;
  };
  decisionsByType: DecisionType[];
  impactMetrics: ImpactMetric[];
  accuracyTrend: AccuracyTrendPoint[];
  recentOutcomes: RecentOutcome[];
  networkEfficiency: string;
  incidentReduction: string;
}

const emptyFallback: AnalyticsData = {
  overallMetrics: {
    totalDecisions: "0",
    successRate: "0%",
    avgConfidence: "0%",
    costSavings: "$0",
  },
  decisionsByType: [],
  impactMetrics: [],
  accuracyTrend: [],
  recentOutcomes: [],
  networkEfficiency: "0%",
  incidentReduction: "0%"
};

export default function AdminAIAnalytics() {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<RecentOutcome | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const { data, isLoading, error, refetch } = useQuery<AnalyticsData>({
    queryKey: ["/api/admin/ai/analytics"],
    enabled: true,
    refetchInterval: 60000,
  });

  const analyticsData = data && data.overallMetrics ? data : emptyFallback;

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      setLastUpdate(new Date());
      toast({
        title: t("adminAIAnalytics.refreshSuccess"),
        description: t("adminAIAnalytics.refreshSuccessDesc"),
      });
    } catch {
      toast({
        title: t("adminAIAnalytics.error.title"),
        description: t("adminAIAnalytics.error.description"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    setExportDialogOpen(true);
  }, []);

  const confirmExport = useCallback(() => {
    const exportData = {
      exportDate: new Date().toISOString(),
      ...analyticsData
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-analytics-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setExportDialogOpen(false);
    toast({
      title: t("adminAIAnalytics.exportSuccess"),
      description: t("adminAIAnalytics.exportSuccessDesc"),
    });
  }, [analyticsData, toast, t]);

  const handleViewOutcome = (outcome: RecentOutcome) => {
    setSelectedOutcome(outcome);
    setDetailOpen(true);
  };

  const getOutcomeDetailSections = (outcome: RecentOutcome): DetailSection[] => [
    {
      title: t("adminAIAnalytics.detail.overview"),
      fields: [
        { label: t("adminAIAnalytics.detail.decision"), value: outcome.decision },
        { label: t("adminAIAnalytics.detail.type"), value: outcome.type, type: "badge" as const },
        { label: t("adminAIAnalytics.detail.outcome"), value: outcome.outcome === "success" ? "success" : "failed", type: "status" as const },
      ]
    },
    {
      title: t("adminAIAnalytics.detail.analysis"),
      fields: [
        { label: t("adminAIAnalytics.detail.confidence"), value: outcome.confidence, type: "progress" as const },
        { label: t("adminAIAnalytics.detail.impact"), value: outcome.impact },
      ]
    }
  ];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8" data-testid="error-container">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2" data-testid="text-error-title">{t("adminAIAnalytics.error.title")}</h2>
        <p className="text-muted-foreground mb-4" data-testid="text-error-description">{t("adminAIAnalytics.error.description")}</p>
        <Button onClick={() => refetch()} data-testid="button-retry">
          <RefreshCw className="w-4 h-4 mr-2" />
          {t("adminAIAnalytics.retry")}
        </Button>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full" data-testid="scroll-area-ai-analytics">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">{t("adminAIAnalytics.title")}</h1>
            <p className="text-muted-foreground" data-testid="text-page-subtitle">{t("adminAIAnalytics.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {lastUpdate && (
              <span className="text-sm text-muted-foreground" data-testid="text-last-update">
                {t("adminAIAnalytics.lastUpdate")}: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              data-testid="button-refresh"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? t("adminAIAnalytics.refreshing") : t("adminAIAnalytics.refresh")}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExport}
              data-testid="button-export"
            >
              <Download className="w-4 h-4 mr-2" />
              {t("adminAIAnalytics.export")}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="skeleton-stats">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-8 w-20 mb-1" />
                  <Skeleton className="h-4 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="grid-stats">
            <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10" data-testid="card-stat-total-decisions">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  <span className="text-sm text-muted-foreground">{t("adminAIAnalytics.totalDecisions")}</span>
                </div>
                <div className="text-3xl font-bold" data-testid="text-total-decisions">{analyticsData.overallMetrics.totalDecisions}</div>
                <div className="text-sm text-muted-foreground">{t("adminAIAnalytics.lifetime")}</div>
              </CardContent>
            </Card>
            <Card data-testid="card-stat-success-rate">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">{t("adminAIAnalytics.successRate")}</span>
                </div>
                <div className="text-3xl font-bold text-green-500" data-testid="text-success-rate">{analyticsData.overallMetrics.successRate}</div>
                <div className="text-sm text-muted-foreground">{t("adminAIAnalytics.thirtyDayAvg")}</div>
              </CardContent>
            </Card>
            <Card data-testid="card-stat-avg-confidence">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-muted-foreground">{t("adminAIAnalytics.avgConfidence")}</span>
                </div>
                <div className="text-3xl font-bold" data-testid="text-avg-confidence">{analyticsData.overallMetrics.avgConfidence}</div>
                <div className="text-sm text-muted-foreground">{t("adminAIAnalytics.allDecisions")}</div>
              </CardContent>
            </Card>
            <Card data-testid="card-stat-cost-savings">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">{t("adminAIAnalytics.costSavings")}</span>
                </div>
                <div className="text-3xl font-bold text-green-500" data-testid="text-cost-savings">{analyticsData.overallMetrics.costSavings}</div>
                <div className="text-sm text-muted-foreground">{t("adminAIAnalytics.thisMonth")}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="performance" className="space-y-4" data-testid="tabs-analytics">
          <TabsList data-testid="tabs-list">
            <TabsTrigger value="performance" data-testid="tab-performance">
              <Activity className="w-4 h-4 mr-2" />
              {t("adminAIAnalytics.performance")}
            </TabsTrigger>
            <TabsTrigger value="impact" data-testid="tab-impact">
              <Zap className="w-4 h-4 mr-2" />
              {t("adminAIAnalytics.impact")}
            </TabsTrigger>
            <TabsTrigger value="distribution" data-testid="tab-distribution">
              <PieChart className="w-4 h-4 mr-2" />
              {t("adminAIAnalytics.distribution")}
            </TabsTrigger>
            <TabsTrigger value="outcomes" data-testid="tab-outcomes">
              <BarChart3 className="w-4 h-4 mr-2" />
              {t("adminAIAnalytics.outcomes")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance" data-testid="tab-content-performance">
            <Card data-testid="card-accuracy-trend">
              <CardHeader>
                <CardTitle data-testid="text-accuracy-trend-title">{t("adminAIAnalytics.accuracyTrend")}</CardTitle>
                <CardDescription data-testid="text-accuracy-trend-desc">{t("adminAIAnalytics.accuracyTrendDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-80 w-full" data-testid="skeleton-chart" />
                ) : (
                  <div className="h-80" data-testid="chart-accuracy-trend">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analyticsData.accuracyTrend}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[85, 100]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="strategic" stroke="#3b82f6" name="Strategic" strokeWidth={2} />
                        <Line type="monotone" dataKey="tactical" stroke="#a855f7" name="Tactical" strokeWidth={2} />
                        <Line type="monotone" dataKey="operational" stroke="#22c55e" name="Operational" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="impact" data-testid="tab-content-impact">
            <Card data-testid="card-impact-analysis">
              <CardHeader>
                <CardTitle data-testid="text-impact-title">{t("adminAIAnalytics.aiImpactAnalysis")}</CardTitle>
                <CardDescription data-testid="text-impact-desc">{t("adminAIAnalytics.aiImpactDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3" data-testid="skeleton-impact">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table data-testid="table-impact">
                    <TableHeader>
                      <TableRow>
                        <TableHead data-testid="table-head-metric">{t("adminAIAnalytics.metric")}</TableHead>
                        <TableHead data-testid="table-head-before">{t("adminAIAnalytics.beforeAI")}</TableHead>
                        <TableHead data-testid="table-head-after">{t("adminAIAnalytics.afterAI")}</TableHead>
                        <TableHead data-testid="table-head-improvement">{t("adminAIAnalytics.improvement")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analyticsData.impactMetrics.map((metric, index) => (
                        <TableRow key={index} data-testid={`row-impact-${index}`}>
                          <TableCell className="font-medium" data-testid={`text-impact-metric-${index}`}>
                            {metric.metric === "TPS Improvement" ? t("adminAIAnalytics.tpsImprovement") :
                             metric.metric === "Latency Reduction" ? t("adminAIAnalytics.latencyReduction") :
                             metric.metric === "Gas Efficiency" ? t("adminAIAnalytics.gasEfficiency") :
                             t("adminAIAnalytics.validatorUptime")}
                          </TableCell>
                          <TableCell data-testid={`text-impact-before-${index}`}>{metric.before.toLocaleString()}</TableCell>
                          <TableCell className="font-medium" data-testid={`text-impact-after-${index}`}>{metric.after.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge 
                              className={metric.improvement.startsWith("+") ? "bg-green-500" : "bg-blue-500"}
                              data-testid={`badge-impact-improvement-${index}`}
                            >
                              {metric.improvement}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {isLoading ? (
                <>
                  <Card><CardContent className="pt-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
                  <Card><CardContent className="pt-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
                </>
              ) : (
                <>
                  <Card data-testid="card-network-efficiency">
                    <CardHeader>
                      <CardTitle data-testid="text-network-efficiency-title">{t("adminAIAnalytics.networkEfficiency")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-5xl font-bold text-green-500" data-testid="text-network-efficiency-value">{analyticsData.networkEfficiency}</div>
                        <div className="text-muted-foreground mt-2">{t("adminAIAnalytics.networkEfficiencyDesc")}</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card data-testid="card-incident-reduction">
                    <CardHeader>
                      <CardTitle data-testid="text-incident-reduction-title">{t("adminAIAnalytics.incidentReduction")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-5xl font-bold text-blue-500" data-testid="text-incident-reduction-value">{analyticsData.incidentReduction}</div>
                        <div className="text-muted-foreground mt-2">{t("adminAIAnalytics.incidentReductionDesc")}</div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="distribution" data-testid="tab-content-distribution">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card data-testid="card-decision-distribution">
                <CardHeader>
                  <CardTitle data-testid="text-distribution-title">{t("adminAIAnalytics.decisionDistribution")}</CardTitle>
                  <CardDescription data-testid="text-distribution-desc">{t("adminAIAnalytics.distributionByType")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-64 w-full" data-testid="skeleton-pie-chart" />
                  ) : (
                    <>
                      <div className="h-64 flex items-center justify-center" data-testid="chart-decision-distribution">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPie>
                            <Pie
                              data={analyticsData.decisionsByType}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {analyticsData.decisionsByType.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </RechartsPie>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex justify-center gap-4 mt-4" data-testid="legend-distribution">
                        {analyticsData.decisionsByType.map((item, index) => (
                          <div key={index} className="flex items-center gap-2" data-testid={`legend-item-${index}`}>
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-sm">{item.name}: {item.value}%</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card data-testid="card-decision-frequency">
                <CardHeader>
                  <CardTitle data-testid="text-frequency-title">{t("adminAIAnalytics.decisionFrequency")}</CardTitle>
                  <CardDescription data-testid="text-frequency-desc">{t("adminAIAnalytics.frequencyByTime")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4" data-testid="skeleton-frequency">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4" data-testid="frequency-bars">
                      <div className="flex items-center justify-between" data-testid="frequency-strategic">
                        <span>Strategic ({t("adminAIAnalytics.everyNHours", { n: 6 })})</span>
                        <span className="font-medium">4{t("adminAIAnalytics.perDay")}</span>
                      </div>
                      <Progress value={10} data-testid="progress-strategic" />
                      <div className="flex items-center justify-between" data-testid="frequency-tactical">
                        <span>Tactical ({t("adminAIAnalytics.everyBlock")})</span>
                        <span className="font-medium">~172,800{t("adminAIAnalytics.perDay")}</span>
                      </div>
                      <Progress value={45} data-testid="progress-tactical" />
                      <div className="flex items-center justify-between" data-testid="frequency-operational">
                        <span>Operational (immediate)</span>
                        <span className="font-medium">~500,000{t("adminAIAnalytics.perDay")}</span>
                      </div>
                      <Progress value={90} data-testid="progress-operational" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="outcomes" data-testid="tab-content-outcomes">
            <Card data-testid="card-recent-outcomes">
              <CardHeader>
                <CardTitle data-testid="text-outcomes-title">{t("adminAIAnalytics.recentDecisionOutcomes")}</CardTitle>
                <CardDescription data-testid="text-outcomes-desc">{t("adminAIAnalytics.decisionOutcomesDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3" data-testid="skeleton-outcomes">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table data-testid="table-outcomes">
                    <TableHeader>
                      <TableRow>
                        <TableHead data-testid="table-head-decision">{t("adminAI.decision")}</TableHead>
                        <TableHead data-testid="table-head-type">{t("adminAI.type")}</TableHead>
                        <TableHead data-testid="table-head-confidence">{t("adminAI.confidence")}</TableHead>
                        <TableHead data-testid="table-head-outcome">{t("adminAIAnalytics.outcome")}</TableHead>
                        <TableHead data-testid="table-head-impact">{t("adminAIAnalytics.improvement")}</TableHead>
                        <TableHead data-testid="table-head-actions">{t("adminAIAnalytics.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analyticsData.recentOutcomes.map((outcome, index) => (
                        <TableRow key={index} data-testid={`row-outcome-${index}`}>
                          <TableCell data-testid={`text-outcome-decision-${index}`}>{outcome.decision}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={
                                outcome.type === "Strategic" ? "bg-blue-500/10 text-blue-500" :
                                outcome.type === "Tactical" ? "bg-purple-500/10 text-purple-500" :
                                "bg-green-500/10 text-green-500"
                              }
                              data-testid={`badge-outcome-type-${index}`}
                            >
                              {outcome.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={outcome.confidence} className="w-16" data-testid={`progress-outcome-confidence-${index}`} />
                              <span data-testid={`text-outcome-confidence-${index}`}>{outcome.confidence}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {outcome.outcome === "success" ? (
                              <Badge className="bg-green-500" data-testid={`badge-outcome-success-${index}`}>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {t("adminAIAnalytics.success")}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" data-testid={`badge-outcome-rejected-${index}`}>
                                <XCircle className="w-3 h-3 mr-1" />
                                {t("adminAIAnalytics.rejected")}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground" data-testid={`text-outcome-impact-${index}`}>{outcome.impact}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewOutcome(outcome)}
                              data-testid={`button-view-outcome-${index}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {selectedOutcome && (
        <DetailSheet
          open={detailOpen}
          onOpenChange={setDetailOpen}
          title={t("adminAIAnalytics.detail.title")}
          subtitle={selectedOutcome.type}
          icon={<Brain className="w-5 h-5" />}
          sections={getOutcomeDetailSections(selectedOutcome)}
        />
      )}

      <ConfirmationDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        title={t("adminAIAnalytics.confirm.exportTitle")}
        description={t("adminAIAnalytics.confirm.exportDescription")}
        confirmText={t("adminAIAnalytics.confirm.export")}
        cancelText={t("adminAIAnalytics.confirm.cancel")}
        destructive={false}
        onConfirm={confirmExport}
      />
    </ScrollArea>
  );
}
