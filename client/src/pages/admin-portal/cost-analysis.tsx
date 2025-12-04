import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
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
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, Treemap } from "recharts";

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

export default function CostAnalysis() {
  const [timeRange, setTimeRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");

  const costItems: CostItem[] = [
    { category: "Infrastructure", subcategory: "Cloud Compute", current: 2450000, previous: 2200000, budget: 2500000, change: 11.4, icon: Cloud },
    { category: "Infrastructure", subcategory: "Storage", current: 890000, previous: 820000, budget: 1000000, change: 8.5, icon: Database },
    { category: "Infrastructure", subcategory: "Network/CDN", current: 650000, previous: 600000, budget: 700000, change: 8.3, icon: Network },
    { category: "AI Services", subcategory: "OpenAI API", current: 1200000, previous: 1100000, budget: 1500000, change: 9.1, icon: Bot },
    { category: "AI Services", subcategory: "Anthropic API", current: 850000, previous: 780000, budget: 1000000, change: 9.0, icon: Bot },
    { category: "AI Services", subcategory: "Local GPU", current: 450000, previous: 450000, budget: 500000, change: 0, icon: Cpu },
    { category: "Security", subcategory: "Security Tools", current: 320000, previous: 300000, budget: 400000, change: 6.7, icon: Shield },
    { category: "Operations", subcategory: "Monitoring", current: 180000, previous: 165000, budget: 200000, change: 9.1, icon: Server },
  ];

  const costTrend = Array.from({ length: 12 }, (_, i) => ({
    month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
    infrastructure: Math.floor(Math.random() * 500000) + 3500000,
    ai: Math.floor(Math.random() * 400000) + 2200000,
    security: Math.floor(Math.random() * 100000) + 300000,
    operations: Math.floor(Math.random() * 50000) + 150000,
  }));

  const categoryBreakdown: CostBreakdown[] = [
    { name: "Infrastructure", value: 45, color: "hsl(var(--chart-1))" },
    { name: "AI Services", value: 30, color: "hsl(var(--chart-2))" },
    { name: "Security", value: 12, color: "hsl(var(--chart-3))" },
    { name: "Operations", value: 8, color: "hsl(var(--chart-4))" },
    { name: "Other", value: 5, color: "hsl(var(--chart-5))" },
  ];

  const optimizationOpportunities = [
    { area: "Idle Compute Resources", potential: 320000, effort: "Low", priority: "High" },
    { area: "Oversized Database Instances", potential: 180000, effort: "Medium", priority: "Medium" },
    { area: "Unused Storage Volumes", potential: 95000, effort: "Low", priority: "High" },
    { area: "AI API Caching", potential: 250000, effort: "Medium", priority: "High" },
    { area: "Reserved Instance Migration", potential: 450000, effort: "High", priority: "Medium" },
  ];

  const totalCurrent = costItems.reduce((sum, item) => sum + item.current, 0);
  const totalPrevious = costItems.reduce((sum, item) => sum + item.previous, 0);
  const totalBudget = costItems.reduce((sum, item) => sum + item.budget, 0);
  const overallChange = ((totalCurrent - totalPrevious) / totalPrevious * 100).toFixed(1);
  const budgetUtilization = ((totalCurrent / totalBudget) * 100).toFixed(1);

  const getChangeIndicator = (change: number) => {
    if (change > 0) {
      return <span className="flex items-center text-red-500"><TrendingUp className="h-3 w-3 mr-1" />+{change.toFixed(1)}%</span>;
    } else if (change < 0) {
      return <span className="flex items-center text-green-500"><TrendingDown className="h-3 w-3 mr-1" />{change.toFixed(1)}%</span>;
    }
    return <span className="text-muted-foreground">0%</span>;
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "High": return <Badge className="bg-red-500">High</Badge>;
      case "Medium": return <Badge className="bg-yellow-500">Medium</Badge>;
      case "Low": return <Badge className="bg-green-500">Low</Badge>;
      default: return <Badge>{priority}</Badge>;
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <ChartPie className="h-8 w-8" />
              Cost Analysis
            </h1>
            <p className="text-muted-foreground">Analyze and optimize operational costs</p>
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Cost (30d)</p>
                  <p className="text-2xl font-bold">${(totalCurrent / 1000000).toFixed(2)}M</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
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
                  <p className="text-sm text-muted-foreground">vs Previous</p>
                  <p className={`text-2xl font-bold ${Number(overallChange) > 0 ? "text-red-500" : "text-green-500"}`}>
                    {Number(overallChange) > 0 ? "+" : ""}{overallChange}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Budget Utilization</p>
                  <p className="text-2xl font-bold">{budgetUtilization}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Layers className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Potential Savings</p>
                  <p className="text-2xl font-bold text-green-500">
                    ${(optimizationOpportunities.reduce((s, o) => s + o.potential, 0) / 1000000).toFixed(2)}M
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Cost Trend</CardTitle>
                  <CardDescription>Monthly cost by category</CardDescription>
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
                        <Area type="monotone" dataKey="infrastructure" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1) / 0.6)" name="Infrastructure" />
                        <Area type="monotone" dataKey="ai" stackId="1" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2) / 0.6)" name="AI Services" />
                        <Area type="monotone" dataKey="security" stackId="1" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3) / 0.6)" name="Security" />
                        <Area type="monotone" dataKey="operations" stackId="1" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4) / 0.6)" name="Operations" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cost Distribution</CardTitle>
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
                    {categoryBreakdown.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
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
            <Card>
              <CardHeader>
                <CardTitle>Detailed Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Subcategory</TableHead>
                      <TableHead className="text-right">Current</TableHead>
                      <TableHead className="text-right">Previous</TableHead>
                      <TableHead className="text-right">Budget</TableHead>
                      <TableHead>Utilization</TableHead>
                      <TableHead>Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {costItems.map((item, index) => (
                      <TableRow key={index}>
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cost Trends Analysis</CardTitle>
                <CardDescription>Year-over-year cost comparison</CardDescription>
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
                      <Line type="monotone" dataKey="infrastructure" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Infrastructure" />
                      <Line type="monotone" dataKey="ai" stroke="hsl(var(--chart-2))" strokeWidth={2} name="AI Services" />
                      <Line type="monotone" dataKey="security" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Security" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="optimization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Optimization Opportunities
                </CardTitle>
                <CardDescription>Identified areas for cost reduction</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Area</TableHead>
                      <TableHead className="text-right">Potential Savings</TableHead>
                      <TableHead>Implementation Effort</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {optimizationOpportunities.map((opp, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{opp.area}</TableCell>
                        <TableCell className="text-right text-green-500 font-medium">
                          ${(opp.potential / 1000).toFixed(0)}K/year
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{opp.effort}</Badge>
                        </TableCell>
                        <TableCell>{getPriorityBadge(opp.priority)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            Analyze
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Wins</CardTitle>
                  <CardDescription>Low effort, high impact optimizations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {optimizationOpportunities.filter(o => o.effort === "Low" && o.priority === "High").map((opp, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <span>{opp.area}</span>
                      <span className="text-green-500 font-medium">${(opp.potential / 1000).toFixed(0)}K</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Total Savings Potential</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-5xl font-bold text-green-500">
                      ${(optimizationOpportunities.reduce((s, o) => s + o.potential, 0) / 1000000).toFixed(2)}M
                    </p>
                    <p className="text-muted-foreground mt-2">Annual savings potential</p>
                    <Button className="mt-4" data-testid="button-implement-all">
                      Create Optimization Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
