import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart3,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  CircleDollarSign,
  Flame,
  Coins,
  Building2,
} from "lucide-react";
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart as RechartsPie, Pie, Cell } from "recharts";

interface FinancialMetric {
  label: string;
  value: string;
  change: number;
  trend: "up" | "down" | "stable";
  icon: any;
}

interface Transaction {
  id: string;
  type: "inflow" | "outflow";
  category: string;
  amount: number;
  date: string;
  description: string;
  status: "completed" | "pending" | "failed";
}

export default function FinanceOverview() {
  const [timeRange, setTimeRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");

  const financialMetrics: FinancialMetric[] = [
    { label: "Total Market Cap", value: "$2.47B", change: 5.2, trend: "up", icon: CircleDollarSign },
    { label: "Circulating Supply", value: "847.5M TBURN", change: -0.02, trend: "down", icon: Coins },
    { label: "Total Burned", value: "152.5M TBURN", change: 2.3, trend: "up", icon: Flame },
    { label: "Treasury Balance", value: "$89.4M", change: 1.8, trend: "up", icon: Building2 },
  ];

  const revenueData = [
    { month: "Jul", revenue: 12500000, expenses: 8200000, profit: 4300000 },
    { month: "Aug", revenue: 14200000, expenses: 8800000, profit: 5400000 },
    { month: "Sep", revenue: 13800000, expenses: 9100000, profit: 4700000 },
    { month: "Oct", revenue: 16500000, expenses: 9500000, profit: 7000000 },
    { month: "Nov", revenue: 18200000, expenses: 10200000, profit: 8000000 },
    { month: "Dec", revenue: 15800000, expenses: 9800000, profit: 6000000 },
  ];

  const revenueBreakdown = [
    { name: "Transaction Fees", value: 45, color: "hsl(var(--chart-1))" },
    { name: "Bridge Fees", value: 25, color: "hsl(var(--chart-2))" },
    { name: "Staking Rewards", value: 15, color: "hsl(var(--chart-3))" },
    { name: "DEX Fees", value: 10, color: "hsl(var(--chart-4))" },
    { name: "Other", value: 5, color: "hsl(var(--chart-5))" },
  ];

  const recentTransactions: Transaction[] = [
    { id: "TXN-001", type: "inflow", category: "Transaction Fees", amount: 2450000, date: "2024-12-03", description: "Daily transaction fees collected", status: "completed" },
    { id: "TXN-002", type: "outflow", category: "Validator Rewards", amount: 1850000, date: "2024-12-03", description: "Validator reward distribution", status: "completed" },
    { id: "TXN-003", type: "inflow", category: "Bridge Fees", amount: 890000, date: "2024-12-03", description: "Cross-chain bridge fees", status: "completed" },
    { id: "TXN-004", type: "outflow", category: "Operations", amount: 450000, date: "2024-12-02", description: "Infrastructure costs", status: "completed" },
    { id: "TXN-005", type: "inflow", category: "Staking", amount: 1200000, date: "2024-12-02", description: "Staking protocol fees", status: "pending" },
    { id: "TXN-006", type: "outflow", category: "Development", amount: 750000, date: "2024-12-01", description: "Development team payroll", status: "completed" },
  ];

  const treasuryAllocation = [
    { category: "Reserve Fund", amount: 45000000, percentage: 50.3 },
    { category: "Development Fund", amount: 22000000, percentage: 24.6 },
    { category: "Marketing", amount: 12000000, percentage: 13.4 },
    { category: "Operations", amount: 7400000, percentage: 8.3 },
    { category: "Emergency Fund", amount: 3000000, percentage: 3.4 },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <DollarSign className="h-8 w-8" />
              Finance Overview
            </h1>
            <p className="text-muted-foreground">Financial metrics and treasury management</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32" data-testid="select-time-range">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" data-testid="button-refresh">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {financialMetrics.map((metric) => (
            <Card key={metric.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold mt-1">{metric.value}</p>
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
                    <metric.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="treasury">Treasury</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Revenue & Expenses</CardTitle>
                  <CardDescription>Monthly financial performance</CardDescription>
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
                        <Bar dataKey="revenue" fill="hsl(var(--chart-1))" name="Revenue" />
                        <Bar dataKey="expenses" fill="hsl(var(--chart-2))" name="Expenses" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
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
                    {revenueBreakdown.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
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

            <Card>
              <CardHeader>
                <CardTitle>Profit Trend</CardTitle>
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
                        formatter={(value: number) => [`$${(value / 1000000).toFixed(2)}M`, "Profit"]}
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
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Total Revenue (30d)</p>
                  <p className="text-3xl font-bold text-green-500">$15.8M</p>
                  <p className="text-sm text-green-500 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    +12.5% vs last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Total Expenses (30d)</p>
                  <p className="text-3xl font-bold text-red-500">$9.8M</p>
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    +8.2% vs last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Net Profit (30d)</p>
                  <p className="text-3xl font-bold">$6.0M</p>
                  <p className="text-sm text-green-500 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    +18.3% vs last month
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="treasury" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Treasury Allocation</CardTitle>
                <CardDescription>Current treasury fund distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {treasuryAllocation.map((item) => (
                    <div key={item.category} className="space-y-2">
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
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-mono">{tx.id}</TableCell>
                        <TableCell>
                          {tx.type === "inflow" ? (
                            <Badge className="bg-green-500">Inflow</Badge>
                          ) : (
                            <Badge className="bg-red-500">Outflow</Badge>
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
                            {tx.status}
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
