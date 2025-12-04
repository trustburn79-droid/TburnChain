import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Brain, TrendingUp, Target, BarChart3, PieChart, 
  Activity, Zap, Clock, CheckCircle, XCircle
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart as RechartsPie, Pie, Cell } from "recharts";

export default function AdminAIAnalytics() {
  const overallMetrics = {
    totalDecisions: "1,234,567",
    successRate: "98.7%",
    avgConfidence: "92.4%",
    costSavings: "$125,000",
  };

  const decisionsByType = [
    { name: "Operational", value: 65, color: "#22c55e" },
    { name: "Tactical", value: 25, color: "#a855f7" },
    { name: "Strategic", value: 10, color: "#3b82f6" },
  ];

  const impactMetrics = [
    { metric: "TPS Improvement", before: 45000, after: 52000, improvement: "+15.6%" },
    { metric: "Latency Reduction", before: 180, after: 124, improvement: "-31.1%" },
    { metric: "Gas Efficiency", before: 85, after: 94, improvement: "+10.6%" },
    { metric: "Validator Uptime", before: 98.5, after: 99.9, improvement: "+1.4%" },
  ];

  const accuracyTrend = [
    { month: "Jul", strategic: 95, tactical: 92, operational: 88 },
    { month: "Aug", strategic: 96, tactical: 93, operational: 90 },
    { month: "Sep", strategic: 97, tactical: 94, operational: 92 },
    { month: "Oct", strategic: 97, tactical: 95, operational: 94 },
    { month: "Nov", strategic: 98, tactical: 96, operational: 95 },
    { month: "Dec", strategic: 99, tactical: 97, operational: 96 },
  ];

  const recentOutcomes = [
    { decision: "Increase committee size to 120", type: "Strategic", confidence: 92, outcome: "success", impact: "+2.3% TPS" },
    { decision: "Rebalance shard 5 to shard 8", type: "Tactical", confidence: 88, outcome: "success", impact: "-15ms latency" },
    { decision: "Adjust gas to 115 Ember", type: "Operational", confidence: 95, outcome: "success", impact: "+5% efficiency" },
    { decision: "Pause bridge temporarily", type: "Strategic", confidence: 65, outcome: "rejected", impact: "Manual review" },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">AI Decision Analytics</h1>
            <p className="text-muted-foreground">Analyze AI system performance and decision outcomes</p>
          </div>
          <Button variant="outline">Export Report</Button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-muted-foreground">Total Decisions</span>
              </div>
              <div className="text-3xl font-bold">{overallMetrics.totalDecisions}</div>
              <div className="text-sm text-muted-foreground">Lifetime</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Success Rate</span>
              </div>
              <div className="text-3xl font-bold text-green-500">{overallMetrics.successRate}</div>
              <div className="text-sm text-muted-foreground">30-day avg</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-muted-foreground">Avg Confidence</span>
              </div>
              <div className="text-3xl font-bold">{overallMetrics.avgConfidence}</div>
              <div className="text-sm text-muted-foreground">All decisions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Cost Savings</span>
              </div>
              <div className="text-3xl font-bold text-green-500">{overallMetrics.costSavings}</div>
              <div className="text-sm text-muted-foreground">This month</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="performance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="performance" data-testid="tab-performance">
              <Activity className="w-4 h-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="impact" data-testid="tab-impact">
              <Zap className="w-4 h-4 mr-2" />
              Impact
            </TabsTrigger>
            <TabsTrigger value="distribution" data-testid="tab-distribution">
              <PieChart className="w-4 h-4 mr-2" />
              Distribution
            </TabsTrigger>
            <TabsTrigger value="outcomes" data-testid="tab-outcomes">
              <BarChart3 className="w-4 h-4 mr-2" />
              Outcomes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Accuracy Trend by Layer</CardTitle>
                <CardDescription>6-month accuracy improvement across AI layers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={accuracyTrend}>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="impact">
            <Card>
              <CardHeader>
                <CardTitle>AI Impact Analysis</CardTitle>
                <CardDescription>Measurable improvements from AI decisions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead>Before AI</TableHead>
                      <TableHead>After AI</TableHead>
                      <TableHead>Improvement</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {impactMetrics.map((metric, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{metric.metric}</TableCell>
                        <TableCell>{metric.before.toLocaleString()}</TableCell>
                        <TableCell className="font-medium">{metric.after.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={metric.improvement.startsWith("+") ? "bg-green-500" : "bg-blue-500"}>
                            {metric.improvement}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Network Efficiency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-green-500">+23.4%</div>
                    <div className="text-muted-foreground mt-2">Overall improvement since AI integration</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Incident Reduction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-blue-500">-67%</div>
                    <div className="text-muted-foreground mt-2">Fewer incidents with AI-powered prevention</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="distribution">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Decision Distribution</CardTitle>
                  <CardDescription>Breakdown by decision type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={decisionsByType}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {decisionsByType.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-4 mt-4">
                    {decisionsByType.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm">{item.name}: {item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Decision Frequency</CardTitle>
                  <CardDescription>Decisions by time of day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Strategic (every 6h)</span>
                      <span className="font-medium">4/day</span>
                    </div>
                    <Progress value={10} />
                    <div className="flex items-center justify-between">
                      <span>Tactical (every block)</span>
                      <span className="font-medium">~172,800/day</span>
                    </div>
                    <Progress value={45} />
                    <div className="flex items-center justify-between">
                      <span>Operational (immediate)</span>
                      <span className="font-medium">~500,000/day</span>
                    </div>
                    <Progress value={90} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="outcomes">
            <Card>
              <CardHeader>
                <CardTitle>Recent Decision Outcomes</CardTitle>
                <CardDescription>Results of recent AI decisions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Decision</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Outcome</TableHead>
                      <TableHead>Impact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOutcomes.map((outcome, index) => (
                      <TableRow key={index}>
                        <TableCell>{outcome.decision}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            outcome.type === "Strategic" ? "bg-blue-500/10 text-blue-500" :
                            outcome.type === "Tactical" ? "bg-purple-500/10 text-purple-500" :
                            "bg-green-500/10 text-green-500"
                          }>
                            {outcome.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={outcome.confidence} className="w-16" />
                            <span>{outcome.confidence}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {outcome.outcome === "success" ? (
                            <Badge className="bg-green-500">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Success
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <XCircle className="w-3 h-3 mr-1" />
                              Rejected
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{outcome.impact}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
