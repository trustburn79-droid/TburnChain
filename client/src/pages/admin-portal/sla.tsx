import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Activity,
  Zap,
  Shield,
  RefreshCw,
  Download,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";

interface SLAMetric {
  name: string;
  target: number;
  current: number;
  unit: string;
  status: "met" | "at-risk" | "breached";
  trend: "up" | "down" | "stable";
  history: { period: string; value: number }[];
}

interface SLAIncident {
  id: string;
  type: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  impact: "minor" | "major" | "critical";
  rootCause: string;
  resolved: boolean;
}

export default function SLAMonitoring() {
  const [timeRange, setTimeRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");

  const slaMetrics: SLAMetric[] = [
    {
      name: "Uptime",
      target: 99.9,
      current: 99.97,
      unit: "%",
      status: "met",
      trend: "up",
      history: Array.from({ length: 30 }, (_, i) => ({
        period: `Day ${i + 1}`,
        value: 99.9 + Math.random() * 0.1,
      })),
    },
    {
      name: "Transaction Latency",
      target: 100,
      current: 45,
      unit: "ms",
      status: "met",
      trend: "stable",
      history: Array.from({ length: 30 }, (_, i) => ({
        period: `Day ${i + 1}`,
        value: 40 + Math.random() * 20,
      })),
    },
    {
      name: "TPS Capacity",
      target: 500000,
      current: 520000,
      unit: "tx/s",
      status: "met",
      trend: "up",
      history: Array.from({ length: 30 }, (_, i) => ({
        period: `Day ${i + 1}`,
        value: 480000 + Math.random() * 50000,
      })),
    },
    {
      name: "Block Time",
      target: 500,
      current: 498,
      unit: "ms",
      status: "met",
      trend: "stable",
      history: Array.from({ length: 30 }, (_, i) => ({
        period: `Day ${i + 1}`,
        value: 490 + Math.random() * 20,
      })),
    },
    {
      name: "API Response Time",
      target: 200,
      current: 156,
      unit: "ms",
      status: "met",
      trend: "down",
      history: Array.from({ length: 30 }, (_, i) => ({
        period: `Day ${i + 1}`,
        value: 140 + Math.random() * 40,
      })),
    },
    {
      name: "Error Rate",
      target: 0.1,
      current: 0.02,
      unit: "%",
      status: "met",
      trend: "down",
      history: Array.from({ length: 30 }, (_, i) => ({
        period: `Day ${i + 1}`,
        value: 0.01 + Math.random() * 0.05,
      })),
    },
  ];

  const incidents: SLAIncident[] = [
    {
      id: "INC-001",
      type: "Network Latency Spike",
      startTime: "2024-12-01T10:30:00Z",
      endTime: "2024-12-01T10:45:00Z",
      duration: 15,
      impact: "minor",
      rootCause: "Temporary network congestion",
      resolved: true,
    },
    {
      id: "INC-002",
      type: "Validator Sync Delay",
      startTime: "2024-11-28T14:00:00Z",
      endTime: "2024-11-28T14:20:00Z",
      duration: 20,
      impact: "minor",
      rootCause: "Disk I/O bottleneck",
      resolved: true,
    },
    {
      id: "INC-003",
      type: "API Gateway Timeout",
      startTime: "2024-11-25T08:15:00Z",
      endTime: "2024-11-25T08:35:00Z",
      duration: 20,
      impact: "major",
      rootCause: "Memory leak in gateway service",
      resolved: true,
    },
  ];

  const monthlyUptimeData = [
    { month: "Jul", uptime: 99.95, target: 99.9 },
    { month: "Aug", uptime: 99.98, target: 99.9 },
    { month: "Sep", uptime: 99.92, target: 99.9 },
    { month: "Oct", uptime: 99.99, target: 99.9 },
    { month: "Nov", uptime: 99.96, target: 99.9 },
    { month: "Dec", uptime: 99.97, target: 99.9 },
  ];

  const slaComplianceData = [
    { name: "Met", value: 6, color: "hsl(var(--chart-1))" },
    { name: "At Risk", value: 0, color: "hsl(var(--chart-3))" },
    { name: "Breached", value: 0, color: "hsl(var(--chart-5))" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "met": return "text-green-500";
      case "at-risk": return "text-yellow-500";
      case "breached": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "met": return <Badge className="bg-green-500">Met</Badge>;
      case "at-risk": return <Badge className="bg-yellow-500">At Risk</Badge>;
      case "breached": return <Badge className="bg-red-500">Breached</Badge>;
      default: return <Badge>Unknown</Badge>;
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "critical": return <Badge className="bg-red-500">Critical</Badge>;
      case "major": return <Badge className="bg-orange-500">Major</Badge>;
      case "minor": return <Badge className="bg-yellow-500">Minor</Badge>;
      default: return <Badge>Unknown</Badge>;
    }
  };

  const metCount = slaMetrics.filter(m => m.status === "met").length;
  const totalDowntimeMinutes = incidents.reduce((sum, inc) => sum + inc.duration, 0);
  const mttr = incidents.length > 0 ? Math.round(totalDowntimeMinutes / incidents.length) : 0;

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Clock className="h-8 w-8" />
              SLA Monitoring
            </h1>
            <p className="text-muted-foreground">Service Level Agreement compliance and metrics</p>
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
            <Button variant="outline" data-testid="button-refresh-sla">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" data-testid="button-export-report">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">SLA Compliance</p>
                  <p className="text-3xl font-bold text-green-500">{metCount}/{slaMetrics.length}</p>
                  <p className="text-xs text-muted-foreground">All targets met</p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Uptime</p>
                  <p className="text-3xl font-bold">99.97%</p>
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <ArrowUp className="h-3 w-3" />
                    +0.02% vs target
                  </p>
                </div>
                <Activity className="h-10 w-10 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">MTTR</p>
                  <p className="text-3xl font-bold">{mttr}m</p>
                  <p className="text-xs text-muted-foreground">Mean time to recover</p>
                </div>
                <Clock className="h-10 w-10 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Incidents (30d)</p>
                  <p className="text-3xl font-bold">{incidents.length}</p>
                  <p className="text-xs text-green-500">All resolved</p>
                </div>
                <Shield className="h-10 w-10 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Uptime Trend</CardTitle>
                  <CardDescription>Monthly uptime percentage vs target</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyUptimeData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis domain={[99.8, 100]} className="text-xs" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                        />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="uptime" 
                          stroke="hsl(var(--primary))" 
                          fill="hsl(var(--primary) / 0.2)"
                          name="Actual Uptime"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="target" 
                          stroke="hsl(var(--chart-5))" 
                          strokeDasharray="5 5"
                          name="Target"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SLA Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={slaComplianceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {slaComplianceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-4 mt-4">
                    {slaComplianceData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>SLA Metrics Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {slaMetrics.map((metric) => (
                    <div key={metric.name} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{metric.name}</span>
                        {getStatusBadge(metric.status)}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                          {metric.current.toLocaleString()}{metric.unit}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          / {metric.target.toLocaleString()}{metric.unit} target
                        </span>
                      </div>
                      <Progress 
                        value={
                          metric.name === "Error Rate" || metric.name === "Transaction Latency" || metric.name === "Block Time" || metric.name === "API Response Time"
                            ? Math.max(0, 100 - (metric.current / metric.target) * 100)
                            : Math.min(100, (metric.current / metric.target) * 100)
                        }
                      />
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {metric.trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
                        {metric.trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
                        {metric.trend === "stable" && <Activity className="h-3 w-3" />}
                        <span>Trend: {metric.trend}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead>Current</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Trend</TableHead>
                      <TableHead>30-Day Avg</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {slaMetrics.map((metric) => (
                      <TableRow key={metric.name}>
                        <TableCell className="font-medium">{metric.name}</TableCell>
                        <TableCell>
                          {metric.current.toLocaleString()}{metric.unit}
                        </TableCell>
                        <TableCell>
                          {metric.target.toLocaleString()}{metric.unit}
                        </TableCell>
                        <TableCell>{getStatusBadge(metric.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {metric.trend === "up" && <ArrowUp className="h-4 w-4 text-green-500" />}
                            {metric.trend === "down" && <ArrowDown className="h-4 w-4 text-red-500" />}
                            {metric.trend === "stable" && <Activity className="h-4 w-4" />}
                            {metric.trend}
                          </div>
                        </TableCell>
                        <TableCell>
                          {(metric.history.reduce((sum, h) => sum + h.value, 0) / metric.history.length).toFixed(2)}{metric.unit}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incidents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Incident History</CardTitle>
                <CardDescription>SLA-impacting incidents</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Impact</TableHead>
                      <TableHead>Root Cause</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incidents.map((incident) => (
                      <TableRow key={incident.id}>
                        <TableCell className="font-mono">{incident.id}</TableCell>
                        <TableCell>{incident.type}</TableCell>
                        <TableCell>
                          {new Date(incident.startTime).toLocaleString()}
                        </TableCell>
                        <TableCell>{incident.duration} minutes</TableCell>
                        <TableCell>{getImpactBadge(incident.impact)}</TableCell>
                        <TableCell className="max-w-xs truncate">{incident.rootCause}</TableCell>
                        <TableCell>
                          {incident.resolved ? (
                            <Badge className="bg-green-500">Resolved</Badge>
                          ) : (
                            <Badge className="bg-red-500">Active</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="hover-elevate cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Download className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium">Monthly SLA Report</p>
                      <p className="text-sm text-muted-foreground">December 2024</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover-elevate cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Download className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium">Quarterly Report</p>
                      <p className="text-sm text-muted-foreground">Q4 2024</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover-elevate cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Download className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium">Annual Report</p>
                      <p className="text-sm text-muted-foreground">2024</p>
                    </div>
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
