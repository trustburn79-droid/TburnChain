import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, TrendingUp, Users, Activity, 
  Download, Calendar, Filter, PieChart
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart as RechartsPie, Pie, Cell } from "recharts";

export default function AdminBIDashboard() {
  const kpiMetrics = [
    { name: "Daily Active Users", value: "125,234", change: "+12.5%", trend: "up" },
    { name: "Transaction Volume", value: "$45.2M", change: "+8.3%", trend: "up" },
    { name: "Network Utilization", value: "68%", change: "+2.1%", trend: "up" },
    { name: "Avg TX per User", value: "3.2", change: "-0.5%", trend: "down" },
  ];

  const revenueData = [
    { month: "Jul", revenue: 1200, fees: 350, burn: 150 },
    { month: "Aug", revenue: 1400, fees: 420, burn: 180 },
    { month: "Sep", revenue: 1350, fees: 390, burn: 170 },
    { month: "Oct", revenue: 1600, fees: 480, burn: 200 },
    { month: "Nov", revenue: 1800, fees: 540, burn: 220 },
    { month: "Dec", revenue: 2100, fees: 630, burn: 260 },
  ];

  const userGrowth = [
    { month: "Jul", users: 85000 },
    { month: "Aug", users: 92000 },
    { month: "Sep", users: 98000 },
    { month: "Oct", users: 108000 },
    { month: "Nov", users: 118000 },
    { month: "Dec", users: 125234 },
  ];

  const chainDistribution = [
    { name: "TBURN Native", value: 45, color: "#f97316" },
    { name: "Ethereum", value: 25, color: "#3b82f6" },
    { name: "BSC", value: 15, color: "#eab308" },
    { name: "Polygon", value: 10, color: "#8b5cf6" },
    { name: "Others", value: 5, color: "#22c55e" },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Business Intelligence</h1>
            <p className="text-muted-foreground">Comprehensive analytics and insights dashboard</p>
          </div>
          <div className="flex gap-2">
            <Select defaultValue="30d">
              <SelectTrigger className="w-32">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {kpiMetrics.map((kpi, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground mb-1">{kpi.name}</div>
                <div className="text-3xl font-bold">{kpi.value}</div>
                <div className={`text-sm ${kpi.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                  {kpi.change} vs last period
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
              <CardDescription>Monthly revenue, fees, and burn (in thousands)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                    <Bar dataKey="fees" fill="#22c55e" name="Fees" />
                    <Bar dataKey="burn" fill="#f97316" name="Burn" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>Total users over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="users" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Key Metrics Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold">$145.2M</div>
                  <div className="text-sm text-muted-foreground">Total Volume (30d)</div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold">45,234</div>
                  <div className="text-sm text-muted-foreground">New Users (30d)</div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <Activity className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                  <div className="text-2xl font-bold">2.8M</div>
                  <div className="text-sm text-muted-foreground">Transactions (30d)</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chain Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={chainDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      dataKey="value"
                    >
                      {chainDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {chainDistribution.map((item, index) => (
                  <div key={index} className="flex items-center gap-1 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}: {item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
}
