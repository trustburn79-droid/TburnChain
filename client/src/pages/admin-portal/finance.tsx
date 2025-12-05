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
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  RefreshCw,
  CircleDollarSign,
  Flame,
  Coins,
  Building2,
  AlertCircle,
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart as RechartsPie, Pie, Cell } from "recharts";

interface FinancialMetric {
  label: string;
  value: string;
  change: number;
  trend: "up" | "down" | "stable";
  icon: string | React.ComponentType<{ className?: string }>;
}

const iconMap: Record<string, typeof CircleDollarSign> = {
  CircleDollarSign,
  Coins,
  Flame,
  Building2,
  DollarSign,
  TrendingUp,
  TrendingDown,
};

const getIconComponent = (icon: string | React.ComponentType<{ className?: string }>): React.ComponentType<{ className?: string }> => {
  if (typeof icon === "string") {
    return iconMap[icon] || CircleDollarSign;
  }
  return icon || CircleDollarSign;
};

interface Transaction {
  id: string;
  type: "inflow" | "outflow";
  category: string;
  amount: number;
  date: string;
  description: string;
  status: "completed" | "pending" | "failed";
}

interface FinanceData {
  metrics: FinancialMetric[];
  revenueData: { month: string; revenue: number; expenses: number; profit: number }[];
  revenueBreakdown: { name: string; value: number; color: string }[];
  recentTransactions: Transaction[];
  treasuryAllocation: { category: string; amount: number; percentage: number }[];
}

export default function FinanceOverview() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: financeData, isLoading, error, refetch } = useQuery<FinanceData>({
    queryKey: ["/api/admin/finance"],
  });

  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: t("adminFinance.refreshed"),
      description: t("adminFinance.refreshedDesc"),
    });
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      timeRange,
      metrics: financialMetrics,
      revenueData,
      treasuryAllocation,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finance-report-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: t("adminFinance.exported"),
      description: t("adminFinance.exportedDesc"),
    });
  }, [timeRange, toast, t]);

  const financialMetrics: FinancialMetric[] = financeData?.metrics || [
    { label: t("adminFinance.metrics.marketCap"), value: "$2.47B", change: 5.2, trend: "up", icon: CircleDollarSign },
    { label: t("adminFinance.metrics.circulatingSupply"), value: "847.5M TBURN", change: -0.02, trend: "down", icon: Coins },
    { label: t("adminFinance.metrics.totalBurned"), value: "152.5M TBURN", change: 2.3, trend: "up", icon: Flame },
    { label: t("adminFinance.metrics.treasuryBalance"), value: "$89.4M", change: 1.8, trend: "up", icon: Building2 },
  ];

  const revenueData = financeData?.revenueData || [
    { month: t("adminFinance.months.jul"), revenue: 12500000, expenses: 8200000, profit: 4300000 },
    { month: t("adminFinance.months.aug"), revenue: 14200000, expenses: 8800000, profit: 5400000 },
    { month: t("adminFinance.months.sep"), revenue: 13800000, expenses: 9100000, profit: 4700000 },
    { month: t("adminFinance.months.oct"), revenue: 16500000, expenses: 9500000, profit: 7000000 },
    { month: t("adminFinance.months.nov"), revenue: 18200000, expenses: 10200000, profit: 8000000 },
    { month: t("adminFinance.months.dec"), revenue: 15800000, expenses: 9800000, profit: 6000000 },
  ];

  const revenueBreakdown = financeData?.revenueBreakdown || [
    { name: t("adminFinance.breakdown.txFees"), value: 45, color: "hsl(var(--chart-1))" },
    { name: t("adminFinance.breakdown.bridgeFees"), value: 25, color: "hsl(var(--chart-2))" },
    { name: t("adminFinance.breakdown.stakingRewards"), value: 15, color: "hsl(var(--chart-3))" },
    { name: t("adminFinance.breakdown.dexFees"), value: 10, color: "hsl(var(--chart-4))" },
    { name: t("adminFinance.breakdown.other"), value: 5, color: "hsl(var(--chart-5))" },
  ];

  const recentTransactions: Transaction[] = financeData?.recentTransactions || [
    { id: "TXN-001", type: "inflow", category: t("adminFinance.categories.txFees"), amount: 2450000, date: "2024-12-03", description: t("adminFinance.txDescriptions.dailyFees"), status: "completed" },
    { id: "TXN-002", type: "outflow", category: t("adminFinance.categories.validatorRewards"), amount: 1850000, date: "2024-12-03", description: t("adminFinance.txDescriptions.validatorRewards"), status: "completed" },
    { id: "TXN-003", type: "inflow", category: t("adminFinance.categories.bridgeFees"), amount: 890000, date: "2024-12-03", description: t("adminFinance.txDescriptions.bridgeFees"), status: "completed" },
    { id: "TXN-004", type: "outflow", category: t("adminFinance.categories.operations"), amount: 450000, date: "2024-12-02", description: t("adminFinance.txDescriptions.infraCosts"), status: "completed" },
    { id: "TXN-005", type: "inflow", category: t("adminFinance.categories.staking"), amount: 1200000, date: "2024-12-02", description: t("adminFinance.txDescriptions.stakingFees"), status: "pending" },
    { id: "TXN-006", type: "outflow", category: t("adminFinance.categories.development"), amount: 750000, date: "2024-12-01", description: t("adminFinance.txDescriptions.devPayroll"), status: "completed" },
  ];

  const treasuryAllocation = financeData?.treasuryAllocation || [
    { category: t("adminFinance.treasury.reserveFund"), amount: 45000000, percentage: 50.3 },
    { category: t("adminFinance.treasury.developmentFund"), amount: 22000000, percentage: 24.6 },
    { category: t("adminFinance.treasury.marketing"), amount: 12000000, percentage: 13.4 },
    { category: t("adminFinance.treasury.operations"), amount: 7400000, percentage: 8.3 },
    { category: t("adminFinance.treasury.emergencyFund"), amount: 3000000, percentage: 3.4 },
  ];

  if (error) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="container max-w-[1800px] mx-auto p-6">
          <Card className="border-destructive">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <div className="flex-1">
                  <h3 className="font-semibold">{t("adminFinance.errorTitle")}</h3>
                  <p className="text-sm text-muted-foreground">{t("adminFinance.errorDescription")}</p>
                </div>
                <Button onClick={() => refetch()} data-testid="button-retry-finance">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t("adminFinance.retry")}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-80 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-testid="finance-overview-page">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-finance-title">
              <DollarSign className="h-8 w-8" />
              {t("adminFinance.title")}
            </h1>
            <p className="text-muted-foreground" data-testid="text-finance-description">
              {t("adminFinance.description")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32" data-testid="select-time-range">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">{t("adminFinance.timeRanges.7d")}</SelectItem>
                <SelectItem value="30d">{t("adminFinance.timeRanges.30d")}</SelectItem>
                <SelectItem value="90d">{t("adminFinance.timeRanges.90d")}</SelectItem>
                <SelectItem value="1y">{t("adminFinance.timeRanges.1y")}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleRefresh} data-testid="button-refresh-finance">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminFinance.refresh")}
            </Button>
            <Button variant="outline" onClick={handleExport} data-testid="button-export-finance">
              <Download className="h-4 w-4 mr-2" />
              {t("adminFinance.export")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {financialMetrics.map((metric, index) => (
            <Card key={metric.label} data-testid={`card-metric-${index}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold mt-1" data-testid={`text-metric-value-${index}`}>{metric.value}</p>
                    <div className={`flex items-center gap-1 text-sm mt-1 ${
                      metric.trend === "up" ? "text-green-500" : metric.trend === "down" ? "text-red-500" : "text-muted-foreground"
                    }`}>
                      {metric.trend === "up" ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : metric.trend === "down" ? (
                        <ArrowDownRight className="h-4 w-4" />
                      ) : null}
                      {Math.abs(metric.change)}%
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    {(() => {
                      const IconComponent = getIconComponent(metric.icon);
                      return <IconComponent className="h-6 w-6 text-primary" />;
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList data-testid="tabs-finance">
            <TabsTrigger value="overview" data-testid="tab-overview">{t("adminFinance.tabs.overview")}</TabsTrigger>
            <TabsTrigger value="revenue" data-testid="tab-revenue">{t("adminFinance.tabs.revenue")}</TabsTrigger>
            <TabsTrigger value="treasury" data-testid="tab-treasury">{t("adminFinance.tabs.treasury")}</TabsTrigger>
            <TabsTrigger value="transactions" data-testid="tab-transactions">{t("adminFinance.tabs.transactions")}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2" data-testid="card-revenue-expenses">
                <CardHeader>
                  <CardTitle>{t("adminFinance.charts.revenueExpenses")}</CardTitle>
                  <CardDescription>{t("adminFinance.charts.revenueExpensesDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis className="text-xs" tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                          formatter={(value: number) => [`$${(value / 1000000).toFixed(2)}M`, ""]}
                        />
                        <Legend />
                        <Bar dataKey="revenue" fill="hsl(var(--chart-1))" name={t("adminFinance.charts.revenue")} />
                        <Bar dataKey="expenses" fill="hsl(var(--chart-2))" name={t("adminFinance.charts.expenses")} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-revenue-breakdown">
                <CardHeader>
                  <CardTitle>{t("adminFinance.charts.revenueBreakdown")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={revenueBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          dataKey="value"
                        >
                          {revenueBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-4">
                    {revenueBreakdown.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between" data-testid={`breakdown-item-${index}`}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card data-testid="card-profit-trend">
              <CardHeader>
                <CardTitle>{t("adminFinance.charts.profitTrend")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                        formatter={(value: number) => [`$${(value / 1000000).toFixed(2)}M`, t("adminFinance.charts.profit")]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="profit" 
                        stroke="hsl(var(--chart-1))" 
                        fill="hsl(var(--chart-1) / 0.2)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card data-testid="card-total-revenue">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">{t("adminFinance.revenue.totalRevenue")}</p>
                  <p className="text-3xl font-bold text-green-500">$15.8M</p>
                  <p className="text-sm text-green-500 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    {t("adminFinance.revenue.vsLastMonth", { value: "+12.5%" })}
                  </p>
                </CardContent>
              </Card>
              <Card data-testid="card-total-expenses">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">{t("adminFinance.revenue.totalExpenses")}</p>
                  <p className="text-3xl font-bold text-red-500">$9.8M</p>
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    {t("adminFinance.revenue.vsLastMonth", { value: "+8.2%" })}
                  </p>
                </CardContent>
              </Card>
              <Card data-testid="card-net-profit">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">{t("adminFinance.revenue.netProfit")}</p>
                  <p className="text-3xl font-bold">$6.0M</p>
                  <p className="text-sm text-green-500 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    {t("adminFinance.revenue.vsLastMonth", { value: "+18.3%" })}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="treasury" className="space-y-6">
            <Card data-testid="card-treasury-allocation">
              <CardHeader>
                <CardTitle>{t("adminFinance.treasury.title")}</CardTitle>
                <CardDescription>{t("adminFinance.treasury.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {treasuryAllocation.map((item, index) => (
                    <div key={item.category} className="space-y-2" data-testid={`treasury-item-${index}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.category}</span>
                        <span className="text-sm text-muted-foreground">
                          ${(item.amount / 1000000).toFixed(1)}M ({item.percentage}%)
                        </span>
                      </div>
                      <Progress value={item.percentage} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card data-testid="card-recent-transactions">
              <CardHeader>
                <CardTitle>{t("adminFinance.transactions.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("adminFinance.transactions.id")}</TableHead>
                      <TableHead>{t("adminFinance.transactions.type")}</TableHead>
                      <TableHead>{t("adminFinance.transactions.category")}</TableHead>
                      <TableHead>{t("adminFinance.transactions.amount")}</TableHead>
                      <TableHead>{t("adminFinance.transactions.date")}</TableHead>
                      <TableHead>{t("adminFinance.transactions.description")}</TableHead>
                      <TableHead>{t("adminFinance.transactions.status")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions.map((tx, index) => (
                      <TableRow key={tx.id} data-testid={`transaction-row-${index}`}>
                        <TableCell className="font-mono">{tx.id}</TableCell>
                        <TableCell>
                          {tx.type === "inflow" ? (
                            <Badge className="bg-green-500">{t("adminFinance.transactions.inflow")}</Badge>
                          ) : (
                            <Badge className="bg-red-500">{t("adminFinance.transactions.outflow")}</Badge>
                          )}
                        </TableCell>
                        <TableCell>{tx.category}</TableCell>
                        <TableCell className={tx.type === "inflow" ? "text-green-500" : "text-red-500"}>
                          {tx.type === "inflow" ? "+" : "-"}${(tx.amount / 1000000).toFixed(2)}M
                        </TableCell>
                        <TableCell>{tx.date}</TableCell>
                        <TableCell className="max-w-xs truncate">{tx.description}</TableCell>
                        <TableCell>
                          <Badge variant={tx.status === "completed" ? "default" : "secondary"}>
                            {t(`adminFinance.transactions.${tx.status}`)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
