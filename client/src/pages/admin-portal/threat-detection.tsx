import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Shield, AlertTriangle, Activity, Brain, Eye, 
  Ban, CheckCircle, Clock, TrendingUp, Zap
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminThreatDetection() {
  const threatStats = {
    threatsDetected: 23,
    threatsBlocked: 21,
    activeIncidents: 2,
    riskScore: 15,
  };

  const recentThreats = [
    { id: 1, type: "DDoS Attack", severity: "critical", source: "45.33.32.156", target: "API Gateway", status: "blocked", timestamp: "2024-12-03 14:30" },
    { id: 2, type: "SQL Injection", severity: "high", source: "198.51.100.23", target: "Database", status: "blocked", timestamp: "2024-12-03 14:15" },
    { id: 3, type: "Suspicious Login", severity: "medium", source: "203.0.113.50", target: "Admin Portal", status: "investigating", timestamp: "2024-12-03 14:00" },
    { id: 4, type: "Port Scan", severity: "low", source: "192.0.2.1", target: "Network", status: "blocked", timestamp: "2024-12-03 13:45" },
    { id: 5, type: "Brute Force", severity: "high", source: "100.64.0.1", target: "SSH", status: "blocked", timestamp: "2024-12-03 13:30" },
  ];

  const threatTrend = [
    { date: "Nov 27", critical: 1, high: 3, medium: 5, low: 8 },
    { date: "Nov 28", critical: 0, high: 2, medium: 4, low: 6 },
    { date: "Nov 29", critical: 2, high: 4, medium: 6, low: 10 },
    { date: "Nov 30", critical: 0, high: 1, medium: 3, low: 5 },
    { date: "Dec 1", critical: 1, high: 2, medium: 4, low: 7 },
    { date: "Dec 2", critical: 0, high: 3, medium: 5, low: 8 },
    { date: "Dec 3", critical: 1, high: 2, medium: 3, low: 4 },
  ];

  const aiDetections = [
    { pattern: "Unusual transaction volume", confidence: 92, risk: "high", recommendation: "Monitor closely" },
    { pattern: "New validator behavior anomaly", confidence: 78, risk: "medium", recommendation: "Investigate" },
    { pattern: "Bridge transfer spike", confidence: 85, risk: "medium", recommendation: "Review transfers" },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Threat Detection</h1>
            <p className="text-muted-foreground">AI-powered threat monitoring and prevention</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View All
            </Button>
            <Button>
              <Shield className="w-4 h-4 mr-2" />
              Run Scan
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-muted-foreground">Detected (24h)</span>
              </div>
              <div className="text-3xl font-bold">{threatStats.threatsDetected}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Ban className="w-5 h-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Blocked</span>
              </div>
              <div className="text-3xl font-bold text-green-500">{threatStats.threatsBlocked}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-red-500" />
                <span className="text-sm text-muted-foreground">Active Incidents</span>
              </div>
              <div className="text-3xl font-bold text-red-500">{threatStats.activeIncidents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-muted-foreground">Risk Score</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold">{threatStats.riskScore}</div>
                <Badge className="bg-green-500">Low</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="threats" className="space-y-4">
          <TabsList>
            <TabsTrigger value="threats" data-testid="tab-threats">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Recent Threats
            </TabsTrigger>
            <TabsTrigger value="ai" data-testid="tab-ai">
              <Brain className="w-4 h-4 mr-2" />
              AI Detection
            </TabsTrigger>
            <TabsTrigger value="trends" data-testid="tab-trends">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="threats">
            <Card>
              <CardHeader>
                <CardTitle>Recent Threat Activity</CardTitle>
                <CardDescription>Last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentThreats.map((threat) => (
                      <TableRow key={threat.id}>
                        <TableCell className="font-medium">{threat.type}</TableCell>
                        <TableCell>
                          <Badge variant={
                            threat.severity === "critical" ? "destructive" :
                            threat.severity === "high" ? "default" :
                            threat.severity === "medium" ? "secondary" : "outline"
                          } className={
                            threat.severity === "critical" ? "" :
                            threat.severity === "high" ? "bg-orange-500" : ""
                          }>
                            {threat.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{threat.source}</TableCell>
                        <TableCell>{threat.target}</TableCell>
                        <TableCell>
                          {threat.status === "blocked" ? (
                            <Badge className="bg-green-500">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Blocked
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Clock className="w-3 h-3 mr-1" />
                              Investigating
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{threat.timestamp}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost">Details</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  AI-Detected Anomalies
                </CardTitle>
                <CardDescription>Machine learning powered threat detection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiDetections.map((detection, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{detection.pattern}</span>
                        <Badge variant={detection.risk === "high" ? "destructive" : "secondary"}>
                          {detection.risk} risk
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Confidence:</span>
                          <Progress value={detection.confidence} className="w-20" />
                          <span>{detection.confidence}%</span>
                        </div>
                        <span className="text-muted-foreground">Recommendation: {detection.recommendation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Detection Accuracy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-green-500">98.7%</div>
                    <div className="text-muted-foreground mt-2">True positive rate</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-blue-500">45ms</div>
                    <div className="text-muted-foreground mt-2">Average detection time</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Threat Trends (7 Days)</CardTitle>
                <CardDescription>Threats by severity level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={threatTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="critical" stroke="#ef4444" name="Critical" strokeWidth={2} />
                      <Line type="monotone" dataKey="high" stroke="#f97316" name="High" strokeWidth={2} />
                      <Line type="monotone" dataKey="medium" stroke="#eab308" name="Medium" strokeWidth={2} />
                      <Line type="monotone" dataKey="low" stroke="#3b82f6" name="Low" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
