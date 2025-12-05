import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import {
  ChartPie,
  Download,
  RefreshCw,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Server,
  Cloud,
  Cpu,
  Database,
  Network,
  Shield,
  Bot,
  Layers,
  Target,
  AlertTriangle,
  AlertCircle,
  Eye,
} from "lucide-react";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";

interface CostItem {
  category: string;
  subcategory: string;
  current: number;
  previous: number;
  budget: number;
  change: number;
  icon: any;
}

interface CostBreakdown {
  name: string;
  value: number;
  color: string;
}

interface OptimizationOpportunity {
  area: string;
  potential: number;
  effort: string;
  priority: string;
}

interface CostData {
  costItems: CostItem[];
  costTrend: { month: string; infrastructure: number; ai: number; security: number; operations: number }[];
  categoryBreakdown: CostBreakdown[];
  optimizationOpportunities: OptimizationOpportunity[];
}

export default function CostAnalysis() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");
  const [showCostDetail, setShowCostDetail] = useState(false);
  const [selectedCost, setSelectedCost] = useState<CostItem | null>(null);
  const [showExportConfirm, setShowExportConfirm] = useState(false);

  const { data: costData, isLoading, error, refetch } = useQuery<CostData>({
    queryKey: ["/api/admin/costs"],
  });

  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: t("adminCosts.refreshed"),
      description: t("adminCosts.refreshedDesc"),
    });
  }, [refetch, toast, t]);

  const performExport = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      timeRange,
      costItems,
      costTrend,
      optimizationOpportunities,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cost-analysis-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportConfirm(false);
    toast({
      title: t("adminCosts.exported"),
      description: t("adminCosts.exportedDesc"),
    });
  }, [timeRange, toast, t]);

  const handleExport = useCallback(() => {
    setShowExportConfirm(true);
  }, []);

  const getCostDetailSections = (cost: CostItem): DetailSection[] => [
    {
      title: t("adminCosts.detail.costInfo"),
      fields: [
        { label: t("adminCosts.breakdown.category"), value: cost.category },
        { label: t("adminCosts.breakdown.subcategory"), value: cost.subcategory },
        { label: t("adminCosts.breakdown.current"), value: `$${(cost.current / 1000000).toFixed(2)}M`, type: "currency" as const },
        { label: t("adminCosts.breakdown.previous"), value: `$${(cost.previous / 1000000).toFixed(2)}M`, type: "currency" as const },
      ],
    },
    {
      title: t("adminCosts.detail.budgetAnalysis"),
      fields: [
        { label: t("adminCosts.breakdown.budget"), value: `$${(cost.budget / 1000000).toFixed(2)}M`, type: "currency" as const },
        { 
          label: t("adminCosts.breakdown.change"), 
          value: cost.change > 0 ? `+${cost.change.toFixed(1)}%` : cost.change < 0 ? `${cost.change.toFixed(1)}%` : "0%",
          type: "badge" as const,
          badgeVariant: cost.change > 0 ? "destructive" as const : cost.change < 0 ? "default" as const : "secondary" as const,
          badgeColor: cost.change > 0 ? "bg-red-500" : cost.change < 0 ? "bg-green-500" : undefined,
        },
      ],
    },
  ];

  const costItems: CostItem[] = costData?.costItems || [
    { category: t("adminCosts.categories.infrastructure"), subcategory: t("adminCosts.subcategories.cloudCompute"), current: 2450000, previous: 2200000, budget: 2500000, change: 11.4, icon: Cloud },
    { category: t("adminCosts.categories.infrastructure"), subcategory: t("adminCosts.subcategories.storage"), current: 890000, previous: 820000, budget: 1000000, change: 8.5, icon: Database },
    { category: t("adminCosts.categories.infrastructure"), subcategory: t("adminCosts.subcategories.networkCdn"), current: 650000, previous: 600000, budget: 700000, change: 8.3, icon: Network },
    { category: t("adminCosts.categories.aiServices"), subcategory: t("adminCosts.subcategories.openaiApi"), current: 1200000, previous: 1100000, budget: 1500000, change: 9.1, icon: Bot },
    { category: t("adminCosts.categories.aiServices"), subcategory: t("adminCosts.subcategories.anthropicApi"), current: 850000, previous: 780000, budget: 1000000, change: 9.0, icon: Bot },
    { category: t("adminCosts.categories.aiServices"), subcategory: t("adminCosts.subcategories.localGpu"), current: 450000, previous: 450000, budget: 500000, change: 0, icon: Cpu },
    { category: t("adminCosts.categories.security"), subcategory: t("adminCosts.subcategories.securityTools"), current: 320000, previous: 300000, budget: 400000, change: 6.7, icon: Shield },
    { category: t("adminCosts.categories.operations"), subcategory: t("adminCosts.subcategories.monitoring"), current: 180000, previous: 165000, budget: 200000, change: 9.1, icon: Server },
  ];

  const costTrend = costData?.costTrend || Array.from({ length: 12 }, (_, i) => ({
    month: [t("adminCosts.months.jan"), t("adminCosts.months.feb"), t("adminCosts.months.mar"), t("adminCosts.months.apr"), t("adminCosts.months.may"), t("adminCosts.months.jun"), t("adminCosts.months.jul"), t("adminCosts.months.aug"), t("adminCosts.months.sep"), t("adminCosts.months.oct"), t("adminCosts.months.nov"), t("adminCosts.months.dec")][i],
    infrastructure: Math.floor(Math.random() * 500000) + 3500000,
    ai: Math.floor(Math.random() * 400000) + 2200000,
    security: Math.floor(Math.random() * 100000) + 300000,
    operations: Math.floor(Math.random() * 50000) + 150000,
  }));

  const categoryBreakdown: CostBreakdown[] = costData?.categoryBreakdown || [
    { name: t("adminCosts.categories.infrastructure"), value: 45, color: "hsl(var(--chart-1))" },
    { name: t("adminCosts.categories.aiServices"), value: 30, color: "hsl(var(--chart-2))" },
    { name: t("adminCosts.categories.security"), value: 12, color: "hsl(var(--chart-3))" },
    { name: t("adminCosts.categories.operations"), value: 8, color: "hsl(var(--chart-4))" },
    { name: t("adminCosts.other"), value: 5, color: "hsl(var(--chart-5))" },
  ];

  const optimizationOpportunities: OptimizationOpportunity[] = costData?.optimizationOpportunities || [
    { area: t("adminCosts.optimizations.idleCompute"), potential: 320000, effort: t("adminCosts.effort.low"), priority: t("adminCosts.priority.high") },
    { area: t("adminCosts.optimizations.oversizedDb"), potential: 180000, effort: t("adminCosts.effort.medium"), priority: t("adminCosts.priority.medium") },
    { area: t("adminCosts.optimizations.unusedStorage"), potential: 95000, effort: t("adminCosts.effort.low"), priority: t("adminCosts.priority.high") },
    { area: t("adminCosts.optimizations.aiCaching"), potential: 250000, effort: t("adminCosts.effort.medium"), priority: t("adminCosts.priority.high") },
    { area: t("adminCosts.optimizations.reservedInstances"), potential: 450000, effort: t("adminCosts.effort.high"), priority: t("adminCosts.priority.medium") },
  ];

  const totalCurrent = costItems.reduce((sum, item) => sum + item.current, 0);
  const totalPrevious = costItems.reduce((sum, item) => sum + item.previous, 0);
  const totalBudget = costItems.reduce((sum, item) => sum + item.budget, 0);
  const overallChange = ((totalCurrent - totalPrevious) / totalPrevious * 100).toFixed(1);
  const budgetUtilization = ((totalCurrent / totalBudget) * 100).toFixed(1);
  const totalPotentialSavings = optimizationOpportunities.reduce((s, o) => s + o.potential, 0);

  const getChangeIndicator = (change: number) => {
    if (change > 0) {
      return <span className="flex items-center text-red-500"><TrendingUp className="h-3 w-3 mr-1" />+{change.toFixed(1)}%</span>;
    } else if (change < 0) {
      return <span className="flex items-center text-green-500"><TrendingDown className="h-3 w-3 mr-1" />{change.toFixed(1)}%</span>;
    }
    return <span className="text-muted-foreground">0%</span>;
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === t("adminCosts.priority.high")) return <Badge className="bg-red-500">{priority}</Badge>;
    if (priority === t("adminCosts.priority.medium")) return <Badge className="bg-yellow-500">{priority}</Badge>;
    return <Badge className="bg-green-500">{priority}</Badge>;
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
                  <h3 className="font-semibold">{t("adminCosts.errorTitle")}</h3>
                  <p className="text-sm text-muted-foreground">{t("adminCosts.errorDescription")}</p>
                </div>
                <Button onClick={() => refetch()} data-testid="button-retry-costs">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t("adminCosts.retry")}
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
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-80 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-testid="cost-analysis-page">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-costs-title">
              <ChartPie className="h-8 w-8" />
              {t("adminCosts.title")}
            </h1>
            <p className="text-muted-foreground" data-testid="text-costs-description">
              {t("adminCosts.description")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32" data-testid="select-time-range">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">{t("adminCosts.timeRanges.7d")}</SelectItem>
                <SelectItem value="30d">{t("adminCosts.timeRanges.30d")}</SelectItem>
                <SelectItem value="90d">{t("adminCosts.timeRanges.90d")}</SelectItem>
                <SelectItem value="1y">{t("adminCosts.timeRanges.1y")}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleRefresh} data-testid="button-refresh-costs">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminCosts.refresh")}
            </Button>
            <Button variant="outline" onClick={handleExport} data-testid="button-export-costs">
              <Download className="h-4 w-4 mr-2" />
              {t("adminCosts.export")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card data-testid="card-total-cost">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminCosts.stats.totalCost")}</p>
                  <p className="text-2xl font-bold" data-testid="text-total-cost">${(totalCurrent / 1000000).toFixed(2)}M</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-vs-previous">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                  Number(overallChange) > 0 ? "bg-red-500/10" : "bg-green-500/10"
                }`}>
                  {Number(overallChange) > 0 ? (
                    <TrendingUp className="h-6 w-6 text-red-500" />
                  ) : (
                    <TrendingDown className="h-6 w-6 text-green-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminCosts.stats.vsPrevious")}</p>
                  <p className={`text-2xl font-bold ${Number(overallChange) > 0 ? "text-red-500" : "text-green-500"}`} data-testid="text-vs-previous">
                    {Number(overallChange) > 0 ? "+" : ""}{overallChange}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-budget-utilization">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminCosts.stats.budgetUtilization")}</p>
                  <p className="text-2xl font-bold" data-testid="text-budget-util">{budgetUtilization}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-potential-savings">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Layers className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminCosts.stats.potentialSavings")}</p>
                  <p className="text-2xl font-bold text-green-500" data-testid="text-potential-savings">
                    ${(totalPotentialSavings / 1000000).toFixed(2)}M
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList data-testid="tabs-costs">
            <TabsTrigger value="overview" data-testid="tab-overview">{t("adminCosts.tabs.overview")}</TabsTrigger>
            <TabsTrigger value="breakdown" data-testid="tab-breakdown">{t("adminCosts.tabs.breakdown")}</TabsTrigger>
            <TabsTrigger value="trends" data-testid="tab-trends">{t("adminCosts.tabs.trends")}</TabsTrigger>
            <TabsTrigger value="optimization" data-testid="tab-optimization">{t("adminCosts.tabs.optimization")}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2" data-testid="card-cost-trend">
                <CardHeader>
                  <CardTitle>{t("adminCosts.charts.costTrend")}</CardTitle>
                  <CardDescription>{t("adminCosts.charts.costTrendDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={costTrend}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis className="text-xs" tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                          formatter={(value: number) => [`$${(value / 1000000).toFixed(2)}M`, ""]}
                        />
                        <Legend />
                        <Area type="monotone" dataKey="infrastructure" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1) / 0.6)" name={t("adminCosts.categories.infrastructure")} />
                        <Area type="monotone" dataKey="ai" stackId="1" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2) / 0.6)" name={t("adminCosts.categories.aiServices")} />
                        <Area type="monotone" dataKey="security" stackId="1" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3) / 0.6)" name={t("adminCosts.categories.security")} />
                        <Area type="monotone" dataKey="operations" stackId="1" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4) / 0.6)" name={t("adminCosts.categories.operations")} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-cost-distribution">
                <CardHeader>
                  <CardTitle>{t("adminCosts.charts.costDistribution")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          dataKey="value"
                        >
                          {categoryBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-4">
                    {categoryBreakdown.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between" data-testid={`distribution-item-${index}`}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="breakdown" className="space-y-6">
            <Card data-testid="card-detailed-breakdown">
              <CardHeader>
                <CardTitle>{t("adminCosts.breakdown.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("adminCosts.breakdown.category")}</TableHead>
                      <TableHead>{t("adminCosts.breakdown.subcategory")}</TableHead>
                      <TableHead className="text-right">{t("adminCosts.breakdown.current")}</TableHead>
                      <TableHead className="text-right">{t("adminCosts.breakdown.previous")}</TableHead>
                      <TableHead className="text-right">{t("adminCosts.breakdown.budget")}</TableHead>
                      <TableHead>{t("adminCosts.breakdown.utilization")}</TableHead>
                      <TableHead>{t("adminCosts.breakdown.change")}</TableHead>
                      <TableHead className="text-right">{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {costItems.map((item, index) => (
                      <TableRow key={index} data-testid={`cost-row-${index}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <item.icon className="h-4 w-4 text-muted-foreground" />
                            {item.category}
                          </div>
                        </TableCell>
                        <TableCell>{item.subcategory}</TableCell>
                        <TableCell className="text-right">${(item.current / 1000000).toFixed(2)}M</TableCell>
                        <TableCell className="text-right">${(item.previous / 1000000).toFixed(2)}M</TableCell>
                        <TableCell className="text-right">${(item.budget / 1000000).toFixed(2)}M</TableCell>
                        <TableCell>
                          <div className="w-24">
                            <Progress value={(item.current / item.budget) * 100} />
                          </div>
                        </TableCell>
                        <TableCell>{getChangeIndicator(item.change)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setSelectedCost(item);
                              setShowCostDetail(true);
                            }}
                            data-testid={`button-view-cost-${index}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card data-testid="card-trends-analysis">
              <CardHeader>
                <CardTitle>{t("adminCosts.trends.title")}</CardTitle>
                <CardDescription>{t("adminCosts.trends.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={costTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                        formatter={(value: number) => [`$${(value / 1000000).toFixed(2)}M`, ""]}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="infrastructure" stroke="hsl(var(--chart-1))" strokeWidth={2} name={t("adminCosts.categories.infrastructure")} />
                      <Line type="monotone" dataKey="ai" stroke="hsl(var(--chart-2))" strokeWidth={2} name={t("adminCosts.categories.aiServices")} />
                      <Line type="monotone" dataKey="security" stroke="hsl(var(--chart-3))" strokeWidth={2} name={t("adminCosts.categories.security")} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="optimization" className="space-y-6">
            <Card data-testid="card-optimization-opportunities">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  {t("adminCosts.optimization.title")}
                </CardTitle>
                <CardDescription>{t("adminCosts.optimization.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("adminCosts.optimization.area")}</TableHead>
                      <TableHead className="text-right">{t("adminCosts.optimization.potentialSavings")}</TableHead>
                      <TableHead>{t("adminCosts.optimization.effort")}</TableHead>
                      <TableHead>{t("adminCosts.optimization.priority")}</TableHead>
                      <TableHead className="text-right">{t("adminCosts.optimization.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {optimizationOpportunities.map((opp, index) => (
                      <TableRow key={index} data-testid={`optimization-row-${index}`}>
                        <TableCell className="font-medium">{opp.area}</TableCell>
                        <TableCell className="text-right text-green-500 font-medium">
                          ${(opp.potential / 1000).toFixed(0)}K/{t("adminCosts.optimization.year")}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{opp.effort}</Badge>
                        </TableCell>
                        <TableCell>{getPriorityBadge(opp.priority)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" data-testid={`button-analyze-${index}`}>
                            {t("adminCosts.optimization.analyze")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card data-testid="card-quick-wins">
                <CardHeader>
                  <CardTitle>{t("adminCosts.quickWins.title")}</CardTitle>
                  <CardDescription>{t("adminCosts.quickWins.description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {optimizationOpportunities
                    .filter(o => o.effort === t("adminCosts.effort.low") && o.priority === t("adminCosts.priority.high"))
                    .map((opp, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`quick-win-${i}`}>
                        <span>{opp.area}</span>
                        <span className="text-green-500 font-medium">${(opp.potential / 1000).toFixed(0)}K</span>
                      </div>
                    ))}
                </CardContent>
              </Card>

              <Card data-testid="card-total-savings">
                <CardHeader>
                  <CardTitle>{t("adminCosts.totalSavings.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-5xl font-bold text-green-500" data-testid="text-total-savings-value">
                      ${(totalPotentialSavings / 1000000).toFixed(2)}M
                    </p>
                    <p className="text-muted-foreground mt-2">{t("adminCosts.totalSavings.annualPotential")}</p>
                    <Button className="mt-4" data-testid="button-create-plan">
                      {t("adminCosts.totalSavings.createPlan")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {selectedCost && (
          <DetailSheet
            open={showCostDetail}
            onOpenChange={setShowCostDetail}
            title={selectedCost.subcategory}
            subtitle={selectedCost.category}
            icon={<ChartPie className="h-5 w-5" />}
            sections={getCostDetailSections(selectedCost)}
          />
        )}

        <ConfirmationDialog
          open={showExportConfirm}
          onOpenChange={setShowExportConfirm}
          title={t("adminCosts.confirm.exportTitle")}
          description={t("adminCosts.confirm.exportDesc")}
          onConfirm={performExport}
          confirmText={t("common.export")}
          cancelText={t("adminCosts.cancel")}
          destructive={false}
        />
      </div>
    </div>
  );
}
