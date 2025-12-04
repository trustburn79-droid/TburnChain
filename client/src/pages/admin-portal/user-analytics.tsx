import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Users, UserPlus, Activity, TrendingUp, 
  Globe, Clock, BarChart3
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from "recharts";

export default function AdminUserAnalytics() {
  const userStats = {
    totalUsers: "125,234",
    activeToday: "45,678",
    newToday: "1,234",
    retention: "68.5%",
  };

  const userGrowth = [
    { date: "Nov 27", new: 980, total: 120500 },
    { date: "Nov 28", new: 1050, total: 121550 },
    { date: "Nov 29", new: 1120, total: 122670 },
    { date: "Nov 30", new: 1080, total: 123750 },
    { date: "Dec 1", new: 1150, total: 124900 },
    { date: "Dec 2", new: 1200, total: 126100 },
    { date: "Dec 3", new: 1234, total: 127334 },
  ];

  const userTiers = [
    { tier: "Whale", count: 156, percentage: 0.12 },
    { tier: "Large", count: 2340, percentage: 1.87 },
    { tier: "Medium", count: 18500, percentage: 14.78 },
    { tier: "Small", count: 104238, percentage: 83.23 },
  ];

  const geoDistribution = [
    { region: "North America", users: 35000, percentage: 28 },
    { region: "Europe", users: 30000, percentage: 24 },
    { region: "Asia Pacific", users: 40000, percentage: 32 },
    { region: "Others", users: 20234, percentage: 16 },
  ];

  const activityDistribution = [
    { name: "Daily Active", value: 45, color: "#22c55e" },
    { name: "Weekly Active", value: 30, color: "#3b82f6" },
    { name: "Monthly Active", value: 15, color: "#f97316" },
    { name: "Inactive", value: 10, color: "#6b7280" },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">User Analytics</h1>
            <p className="text-muted-foreground">User behavior and demographics analysis</p>
          </div>
          <Button variant="outline">Export Report</Button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-muted-foreground">Total Users</span>
              </div>
              <div className="text-3xl font-bold">{userStats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Active Today</span>
              </div>
              <div className="text-3xl font-bold">{userStats.activeToday}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <UserPlus className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-muted-foreground">New Today</span>
              </div>
              <div className="text-3xl font-bold text-green-500">+{userStats.newToday}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <span className="text-sm text-muted-foreground">Retention Rate</span>
              </div>
              <div className="text-3xl font-bold">{userStats.retention}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="growth" className="space-y-4">
          <TabsList>
            <TabsTrigger value="growth">Growth</TabsTrigger>
            <TabsTrigger value="segments">Segments</TabsTrigger>
            <TabsTrigger value="geography">Geography</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="growth">
            <Card>
              <CardHeader>
                <CardTitle>User Growth (7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Area yAxisId="right" type="monotone" dataKey="total" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} name="Total Users" />
                      <Line yAxisId="left" type="monotone" dataKey="new" stroke="#22c55e" name="New Users" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="segments">
            <Card>
              <CardHeader>
                <CardTitle>User Tiers</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tier</TableHead>
                      <TableHead>Count</TableHead>
                      <TableHead>Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userTiers.map((tier, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          <Badge variant={
                            tier.tier === "Whale" ? "default" :
                            tier.tier === "Large" ? "secondary" : "outline"
                          }>
                            {tier.tier}
                          </Badge>
                        </TableCell>
                        <TableCell>{tier.count.toLocaleString()}</TableCell>
                        <TableCell>{tier.percentage}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="geography">
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Region</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {geoDistribution.map((region, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            {region.region}
                          </div>
                        </TableCell>
                        <TableCell>{region.users.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{region.percentage}%</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={activityDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {activityDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {activityDistribution.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}: {item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Session Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span>Avg Session Duration</span>
                    <span className="font-medium">12m 34s</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span>Pages per Session</span>
                    <span className="font-medium">4.2</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span>Bounce Rate</span>
                    <span className="font-medium">24.5%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span>Return Rate</span>
                    <span className="font-medium">68.5%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
